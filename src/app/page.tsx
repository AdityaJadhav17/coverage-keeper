"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LocaleContext } from "@/i18n/LocaleContext";
import { messages, pickLocale, type Locale } from "@/i18n/messages";
import { rejectReason, toUploadJpeg } from "@/lib/image";
import { phoneHref } from "@/lib/phone";
import { LetterExtraction } from "@/lib/schema";
import { stateRules, type Region } from "@/lib/states";
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
  // Starts from the state the reader found on the letter; the user can change it (US-080).
  const [region, setRegion] = useState<Region | null>(null);
  const rules = region && region !== "other" ? stateRules(region) : null;
  const [photo, setPhoto] = useState<Blob | null>(null);
  // The language the current result was written in.
  const [readIn, setReadIn] = useState<Locale>("en");
  const busy = useRef(false);

  // reread: the same photo again in the other language; keeps the state the user chose.
  async function send(jpeg: Blob, reread = false) {
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
      body.append("lang", locale);
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
      if (parsed.success) {
        if (!reread) setRegion(parsed.data.state);
        setReadIn(locale);
      }
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
  // The letter's own number (often a local office), else the state's line, else
  // "the number on your letter" (US-084), as the welcome screen promises.
  const phone = letterPhone(data) || rules?.contact.phone || "";
  const phoneText = phone || t.letterNumber;
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
              phone={phoneText}
              region={region}
              rules={rules}
              onRegion={setRegion}
              onReread={
                photo && readIn !== locale ? () => send(photo, true) : undefined
              }
              onScreen={() => setView({ name: "screening", data: view.data })}
              onRetake={retake}
            />
          ))}
        {view.name === "screening" && (
          <Screening
            region={region}
            rules={rules}
            onRegion={setRegion}
            onDone={(yes) => setView({ name: "screened", data, yes })}
          />
        )}
        {view.name === "screened" && rules && (
          <Screened
            rules={rules}
            yes={view.yes}
            deadline={data?.deadline ?? null}
            onBack={() =>
              setView(data ? { name: "result", data } : { name: "capture" })
            }
          />
        )}
      </main>
      <footer className="callbar">
        {phone ? (
          <>
            <span>{t.questions}</span>
            <a href={phoneHref(phone) ?? undefined}>{phone}</a>
          </>
        ) : (
          <span>
            {t.questions} {t.letterNumber}
          </span>
        )}
      </footer>
    </LocaleContext.Provider>
  );
}
