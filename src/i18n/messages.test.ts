import { describe, expect, it } from "vitest";
import { findForbiddenClaims } from "@/lib/guardrails";
import { messages, pickLocale, type Messages } from "./messages";

describe("pickLocale", () => {
  it.each([
    ["es-MX", "es"],
    ["es", "es"],
    ["en-US", "en"],
    ["fr-FR", "en"],
    [undefined, "en"],
  ] as const)("%s -> %s", (lang, locale) => {
    expect(pickLocale(lang)).toBe(locale);
  });
});

it("Spanish has every key English has", () => {
  expect(Object.keys(messages.es).sort()).toEqual(
    Object.keys(messages.en).sort(),
  );
});

describe.each(["en", "es"] as const)("%s badge wording", (locale) => {
  const t = messages[locale];
  it("never makes an eligibility claim", () => {
    const all = (["upcoming", "today", "passed", "unknown"] as const)
      .map((s) => t.badge(s, 2))
      .join(" ");
    expect(findForbiddenClaims(all)).toEqual([]);
  });
});

it.each([
  ["upcoming", 5, "Quedan 5 días"],
  ["upcoming", 1, "Queda 1 día"],
  ["today", 0, "Vence hoy"],
  ["passed", -2, "La fecha ya pasó. Llame ahora."],
  ["unknown", null, "No sabemos la fecha. Revise la carta."],
] as const)("Spanish badge %s/%s reads %j", (status, days, text) => {
  expect(messages.es.badge(status, days)).toBe(text);
});

it("keeps the English badge wording the app already uses", () => {
  expect(messages.en.badge("upcoming", 1)).toBe("1 day left");
  expect(messages.en.badge("passed", -1)).toBe("Date has passed. Call now.");
});

it("no fixed message in either language makes an eligibility claim", () => {
  const text = (t: Messages) =>
    JSON.stringify(t, (_, v) => (typeof v === "function" ? v(3, "x") : v));
  expect(findForbiddenClaims(text(messages.en))).toEqual([]);
  expect(findForbiddenClaims(text(messages.es))).toEqual([]);
});

it.each([
  ["en", 1, "Read my letter (1 page)", "Skipped 1 file."],
  ["en", 3, "Read my letter (3 pages)", "Skipped 3 files."],
  ["es", 1, "Leer mi carta (1 página)", "Se omitió 1 archivo."],
  ["es", 3, "Leer mi carta (3 páginas)", "Se omitieron 3 archivos."],
] as const)(
  "%s page counts for %i (US-070, US-073)",
  (locale, n, read, skip) => {
    const t = messages[locale];
    expect(t.readPages(n)).toBe(read);
    expect(t.skipped(n)).toMatch(new RegExp(`^${skip}`));
  },
);

it("a PDF reads without a page count", () => {
  expect(messages.en.readPages(null)).toBe("Read my letter");
  expect(messages.es.readPages(null)).toBe("Leer mi carta");
});

it("both languages word every file error", () => {
  expect(Object.keys(messages.es.collectErrors).sort()).toEqual(
    Object.keys(messages.en.collectErrors).sort(),
  );
});

describe("AI label on every result (#45)", () => {
  it.each([
    [
      "en",
      "Oregon Health Plan (OHP)",
      "Written by AI. It can make mistakes. Check your letter and call Oregon Health Plan (OHP).",
    ],
    [
      "en",
      null,
      "Written by AI. It can make mistakes. Check your letter and call the number on it.",
    ],
    [
      "es",
      "Oregon Health Plan (OHP)",
      "Escrito por IA. Puede cometer errores. Revise su carta y llame a Oregon Health Plan (OHP).",
    ],
    [
      "es",
      null,
      "Escrito por IA. Puede cometer errores. Revise su carta y llame al número que aparece en ella.",
    ],
  ] as const)("%s with program %j", (locale, program, text) => {
    expect(messages[locale].aiLabel(program)).toBe(text);
  });
});
