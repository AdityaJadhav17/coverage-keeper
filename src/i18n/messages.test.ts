import { describe, expect, it } from "vitest";
import { findForbiddenClaims } from "@/lib/guardrails";
import { STATE_CODES, stateRules } from "@/lib/states";
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

describe("consent facts say where the letter goes and how long it may be kept (#44)", () => {
  it.each(["en", "es"] as const)("%s", (locale) => {
    const facts = messages[locale].facts.join(" ");
    for (const word of ["Vercel", "Anthropic", "30", "2"])
      expect(facts).toContain(word);
    // The old line claimed less than what happens: a photo, an unnamed service, no retention.
    expect(facts).not.toMatch(/your photo|su foto/);
  });

  it("both languages list the same number of facts", () => {
    expect(messages.es.facts).toHaveLength(messages.en.facts.length);
  });
});

describe("independence line and phone labels (#46)", () => {
  it.each(["en", "es"] as const)(
    "%s names each state's program, agency and state",
    (locale) => {
      const t = messages[locale];
      for (const code of STATE_CODES) {
        const { program, agency } = stateRules(code);
        const line = t.notPartOf({
          program,
          agency,
          state: t.stateNames[code],
        });
        for (const part of [program, agency, t.stateNames[code]])
          expect(line).toContain(part);
        expect(line).toMatch(
          /^Coverage Keeper (is independent|es independiente)\./,
        );
      }
    },
  );

  it("has a line for when no state is known", () => {
    expect(messages.en.notPartOf(null)).toBe(
      "Coverage Keeper is independent. It is not part of, approved by, or endorsed by any state Medicaid program or government agency.",
    );
    expect(messages.es.notPartOf(null)).toContain(
      "ningún programa estatal de Medicaid",
    );
  });

  it("matches the wording the California research asks for", () => {
    expect(
      messages.en.notPartOf({
        program: "Medi-Cal",
        agency: "California Department of Health Care Services",
        state: "California",
      }),
    ).toBe(
      "Coverage Keeper is independent. It is not part of, approved by, or endorsed by Medi-Cal, the California Department of Health Care Services or the State of California.",
    );
  });

  it("labels a state line as official and a letter number as the letter's", () => {
    expect(messages.en.official("OHP Customer Service")).toBe(
      "OHP Customer Service (official)",
    );
    expect(messages.es.official("OHP Customer Service")).toBe(
      "OHP Customer Service (oficial)",
    );
    expect(messages.en.fromLetter).toBe("from your letter");
    expect(messages.es.fromLetter).toBe("de su carta");
  });
});
