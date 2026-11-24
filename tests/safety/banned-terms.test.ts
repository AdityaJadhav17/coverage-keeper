import { describe, expect, it } from "vitest";
import { messages, type Messages } from "@/i18n/messages";
import { STRICT_BANNED_TERMS, findSelfDescriptions } from "@/lib/guardrails";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { STATE_CODES, stateRules } from "@/lib/states";
import fixture from "../fixtures/reader/synthetic-work-requirement.json";

// Every fixed string the app can show, with message functions called once.
const copy = (t: Messages) =>
  JSON.stringify(t, (_, v) => (typeof v === "function" ? v(3, "x") : v));

const SOURCES: [string, string][] = [
  ["English messages", copy(messages.en)],
  ["Spanish messages", copy(messages.es)],
  ["site title and description", `${SITE_TITLE} ${SITE_DESCRIPTION}`],
];

// Legal checklist, "Banned terms" (#50): never describe Coverage Keeper with these.
describe.each(SOURCES)("%s", (_, text) => {
  it("never uses a term that has no place in our own copy", () => {
    const found = STRICT_BANNED_TERMS.filter((term) => term.test(text)).map(
      String,
    );
    expect(found).toEqual([]);
  });

  it("never describes the app as a professional, as official or as guaranteed", () => {
    expect(findSelfDescriptions(text)).toEqual([]);
  });
});

describe("product name", () => {
  it.each(["Federal", "United States", "National", "Medi-Cal"])(
    "does not contain %j",
    (word) => {
      const [name] = SITE_TITLE.split(":");
      expect(name!.toLowerCase()).not.toContain(word.toLowerCase());
    },
  );
});

describe("the strict list catches each kind of term", () => {
  it.each([
    "We work with a notario.",
    "Ask our Navigator.",
    "Talk to a therapist here.",
    "Hable con un consejero.",
    "HIPAA compliant storage.",
    "Results are guaranteed.",
    "Our enrollment counselors can help.",
  ])("%j", (text) => {
    expect(STRICT_BANNED_TERMS.some((term) => term.test(text))).toBe(true);
  });
});

// Agency text and a normal reading name doctors, helplines and official pages. None of
// that is about us, so the model-output check must leave it alone.
describe("real content is not mistaken for a self-description", () => {
  it.each(STATE_CODES)("%s rules", (code) => {
    expect(findSelfDescriptions(JSON.stringify(stateRules(code)))).toEqual([]);
  });

  it("recorded reader fixture", () => {
    expect(findSelfDescriptions(JSON.stringify(fixture))).toEqual([]);
  });
});
