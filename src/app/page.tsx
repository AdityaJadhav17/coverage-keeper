"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LocaleContext } from "@/i18n/LocaleContext";
import { messages, pickLocale, type Locale } from "@/i18n/messages";
import { rejectReason, toUploadJpeg } from "@/lib/image";
import { phoneHref } from "@/lib/phone";
import { LetterExtraction } from "@/lib/schema";
import { BrandMark } from "./components/BrandMark";
import { Capture } from "./components/Capture";
import { Consent } from "./components/Consent";
import { Problem } from "./components/Problem";
import { Result } from "./components/Result";
import { Screened } from "./components/Screened";
import { Screening } from "./components/Screening";
import { letterPhone } from "./components/shared";
import { Unclear } from "./components/Unclear";

type View =
  | { name: "consent" }
  | { name: "capture"; error?: string }
  | { name: "reading" }
  | { name: "offline" }
  | { name: "error"; message: string }
  | { name: "unclear" }
  | { name: "result"; data: LetterExtraction }
  | { name: "screening"; data: LetterExtraction | null }
  | { name: "screened"; data: LetterExtraction | null; yes: string[] };

function subscribeLanguage(onChange: () => void) {
  window.addEventListener("languagechange", onChange);
  return () => window.removeEventListener("languagechange", onChange);
}

export default function Home() {
  const [view, setView] = useState<View>({ name: "consent" });
  // The phone's language (English on the server render), unless the user picks one.
  const detected = useSyncExternalStore(
    subscribeLanguage,
    () => pickLocale(navigator.language),
    () => "en" as Locale,
  );
  const [chosen, setLocale] = useState<Locale | null>(null);
  const locale = chosen ?? detected;
  const t = messages[locale];
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const busy = useRef(false);

  async function send(jpeg: Blob) {
    if (busy.current) return;
    busy.current = true;
    if (!navigator.onLine) {
      setView({ name: "offline" });
      busy.current = false;
      return;
    }
    setView({ name: "reading" });
    try {
      const body = new FormData();
      body.append("image", jpeg, "letter.jpg");
      const res = await fetch("/api/read", { method: "POST", body });
      if (!res.ok) {
        setView({
          name: "error",
          message: res.status === 413 ? t.errorTooBig : t.errorService,
        });
        return;
      }
      const parsed = LetterExtraction.safeParse(
        await res.json().catch(() => null),
      );
      // Malformed reader output is treated as unsure (US-013).
      setView(
        parsed.success
          ? { name: "result", data: parsed.data }
          : { name: "unclear" },
      );
    } catch {
      setView({ name: "offline" });
    } finally {
      busy.current = false;
    }
  }

  async function onPick(file: File | undefined) {
    if (!file || busy.current) return;
    const reason = rejectReason(file);
    if (reason)
      return setView({
        name: "capture",
        error: reason === "notImage" ? t.rejectNotImage : t.rejectTooLarge,
      });
    try {
      const jpeg = await toUploadJpeg(file);
      setPhoto(jpeg);
      await send(jpeg);
    } catch {
      setView({
        name: "capture",
        error: t.cantOpen,
      });
    }
  }

  const data =
    view.name === "result" ||
    view.name === "screening" ||
    view.name === "screened"
      ? view.data
      : null;
  const phone = letterPhone(data);
  const retake = () => setView({ name: "capture" });

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <main>
        <div className="topbar">
          <h1 className="brand">
            <BrandMark />
            Coverage Keeper
          </h1>
          <button
            type="button"
            className="lang"
            lang={t.switchLang}
            onClick={() => setLocale(t.switchLang)}
          >
            {t.switchTo}
          </button>
        </div>
        {view.name === "consent" && (
          <Consent onAccept={() => setView({ name: "capture" })} />
        )}
        {view.name === "capture" && (
          <Capture error={view.error} onPick={onPick} />
        )}
        {view.name === "reading" && (
          <p role="status" className="reading">
            {t.reading}
          </p>
        )}
        {view.name === "offline" && (
          <Problem
            title={t.offlineTitle}
            text={t.offlineText}
            action={t.tryAgain}
            onAction={() => (photo ? send(photo) : retake())}
          />
        )}
        {view.name === "error" && (
          <Problem
            title={t.errorTitle}
            text={view.message}
            action={t.tryAgain}
            onAction={() => (photo ? send(photo) : retake())}
          />
        )}
        {view.name === "unclear" && <Unclear onRetake={retake} />}
        {view.name === "result" &&
          (view.data.confidence === "low" ? (
            <Unclear onRetake={retake} />
          ) : (
            <Result
              data={view.data}
              phone={phone}
              onScreen={() => setView({ name: "screening", data: view.data })}
              onRetake={retake}
            />
          ))}
        {view.name === "screening" && (
          <Screening
            onDone={(yes) => setView({ name: "screened", data, yes })}
          />
        )}
        {view.name === "screened" && (
          <Screened
            yes={view.yes}
            deadline={data?.deadline ?? null}
            onBack={() =>
              setView(data ? { name: "result", data } : { name: "capture" })
            }
          />
        )}
      </main>
      <footer className="callbar">
        <span>{t.questions}</span>
        <a href={phoneHref(phone)}>{phone}</a>
      </footer>
    </LocaleContext.Provider>
  );
}
