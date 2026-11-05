"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LocaleContext } from "@/i18n/LocaleContext";
import { messages, pickLocale, type Locale } from "@/i18n/messages";
import { collectFiles, MAX_LETTER_BYTES } from "@/lib/collect-files";
import { MAX_PICK_BYTES, toUploadJpegs } from "@/lib/image";
import { phoneHref } from "@/lib/phone";
import { LetterExtraction } from "@/lib/schema";
import { stateRules, type Region } from "@/lib/states";
import { BrandMark } from "./components/BrandMark";
import { Capture, type Tray } from "./components/Capture";
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

// What was sent, kept for "Try again" and a language switch (every page, US-070).
type Upload = { kind: "images"; pages: Blob[] } | { kind: "pdf"; file: File };

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
  const [tray, setTray] = useState<Tray>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  // This letter's result in each language already read, so switching back is instant.
  const readings = useRef<Partial<Record<Locale, LetterExtraction>>>({});
  const busy = useRef(false);

  // reread: the same pages again in the other language; keeps the state the user chose.
  async function send(letter: Upload, lang: Locale = locale, reread = false) {
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
      if (letter.kind === "pdf")
        body.append("pdf", letter.file, letter.file.name);
      else
        letter.pages.forEach((page, i) =>
          body.append("image", page, `page-${i + 1}.jpg`),
        );
      body.append("lang", lang);
      const res = await fetch("/api/read", { method: "POST", body });
      if (!res.ok) {
        setView({
          name: "error",
          message:
            res.status === 413
              ? letter.kind === "pdf"
                ? t.pdfTooBig
                : t.errorTooBig
              : res.status === 400
                ? t.badFile
                : t.errorService,
        });
        return;
      }
      const parsed = LetterExtraction.safeParse(
        await res.json().catch(() => null),
      );
      // Malformed reader output is treated as unsure (US-013).
      if (parsed.success) {
        if (!reread) {
          setRegion(parsed.data.state);
          readings.current = {};
        }
        readings.current[lang] = parsed.data;
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

  // New files join the pages already in the tray, then the whole set is checked again.
  function onAdd(files: File[]) {
    const held = !tray ? [] : tray.kind === "pdf" ? [tray.file] : tray.files;
    const got = collectFiles([...held, ...files]);
    if (got.kind === "error")
      return setView({ name: "capture", error: t.collectErrors[got.code] });
    const tooBig =
      got.kind === "pdf"
        ? got.file.size > MAX_LETTER_BYTES && t.pdfTooBig
        : got.files.some((f) => f.size > MAX_PICK_BYTES) && t.rejectTooLarge;
    if (tooBig) return setView({ name: "capture", error: tooBig });
    setTray(
      got.kind === "pdf"
        ? { kind: "pdf", file: got.file }
        : { kind: "images", files: got.files },
    );
    setView({
      name: "capture",
      error: got.skipped ? t.skipped(got.skipped) : undefined,
    });
  }

  function onRemove(index: number) {
    if (tray?.kind !== "images") return;
    const files = tray.files.filter((_, i) => i !== index);
    setTray(files.length ? { kind: "images", files } : null);
    setView({ name: "capture" });
  }

  async function onRead() {
    if (!tray || busy.current) return;
    try {
      const letter: Upload =
        tray.kind === "pdf"
          ? tray
          : { kind: "images", pages: await toUploadJpegs(tray.files) };
      setUpload(letter);
      await send(letter);
    } catch (err) {
      setView({
        name: "capture",
        // Say so here instead of letting the server answer 413 (US-070).
        error:
          err instanceof Error && /too large/.test(err.message)
            ? t.pagesTooBig
            : t.cantOpen,
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
  // Switching language also translates the letter: from memory if this language
  // was already read, otherwise one new read of the same pages (US-061).
  function switchLanguage() {
    const next = t.switchLang;
    setLocale(next);
    if (!data || !upload) return;
    const cached = readings.current[next];
    if (cached) setView({ ...view, data: cached } as View);
    else send(upload, next, true);
  }

  // A new letter starts with an empty tray.
  const retake = () => {
    setTray(null);
    setView({ name: "capture" });
  };

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
            onClick={switchLanguage}
          >
            {t.switchTo}
          </button>
        </div>
        {view.name === "consent" && (
          <Consent onAccept={() => setView({ name: "capture" })} />
        )}
        {view.name === "capture" && (
          <Capture
            tray={tray}
            error={view.error}
            onAdd={onAdd}
            onRemove={onRemove}
            onRead={onRead}
          />
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
            onAction={() => (upload ? send(upload) : retake())}
          />
        )}
        {view.name === "error" && (
          <Problem
            title={t.errorTitle}
            text={view.message}
            action={t.tryAgain}
            onAction={() => (upload ? send(upload) : retake())}
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
