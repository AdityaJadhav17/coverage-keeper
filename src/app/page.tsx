"use client";

import { useRef, useState } from "react";
import { rejectReason, toUploadJpeg } from "@/lib/image";
import { phoneHref } from "@/lib/phone";
import { LetterExtraction } from "@/lib/schema";
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

export default function Home() {
  const [view, setView] = useState<View>({ name: "consent" });
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
          message:
            res.status === 413
              ? "That photo is too big to send. Take a new one from a little farther back."
              : "The reading service didn't answer. Your photo is still here, so you can try again.",
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
    if (reason) return setView({ name: "capture", error: reason });
    try {
      const jpeg = await toUploadJpeg(file);
      setPhoto(jpeg);
      await send(jpeg);
    } catch {
      setView({
        name: "capture",
        error: "This phone couldn't open that photo. Take a new one.",
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
    <>
      <main>
        <h1 className="brand">Coverage Keeper</h1>
        {view.name === "consent" && (
          <Consent onAccept={() => setView({ name: "capture" })} />
        )}
        {view.name === "capture" && (
          <Capture error={view.error} onPick={onPick} />
        )}
        {view.name === "reading" && (
          <p role="status" className="reading">
            Reading your letter. This can take up to 30 seconds.
          </p>
        )}
        {view.name === "offline" && (
          <Problem
            title="No connection. Your photo wasn't sent."
            text="Check your signal or Wi-Fi, then try again."
            action="Try again"
            onAction={() => (photo ? send(photo) : retake())}
          />
        )}
        {view.name === "error" && (
          <Problem
            title="We couldn't finish reading your letter"
            text={view.message}
            action="Try again"
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
        <span>Questions? Call</span>
        <a href={phoneHref(phone)}>{phone}</a>
      </footer>
    </>
  );
}
