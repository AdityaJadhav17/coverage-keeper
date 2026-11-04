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
