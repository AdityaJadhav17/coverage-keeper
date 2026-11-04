import { describe, expect, it } from "vitest";
import { findForbiddenClaims } from "@/lib/guardrails";
import { STATE_CODES, stateRules } from "@/lib/states";

describe.each(STATE_CODES)("%s rules data", (code) => {
  const rules = stateRules(code);

  it("cites an official .gov source, a retrieval date and a phone number", () => {
    expect(rules.state).toBe(code);
    expect(rules.source_url).toMatch(
      /^https:\/\/([a-z0-9-]+\.)*[a-z0-9-]+\.gov\//,
    );
    expect(rules.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(rules.contact.phone).toMatch(/\d{3}-\d{3}-\d{4}/);
    expect(rules.program.length).toBeGreaterThan(0);
  });

  it("matches its status: published lists questions, pending lists none", () => {
    if (rules.status === "published") {
      const ids = rules.exemptions!.map((e) => e.id);
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
      for (const e of rules.exemptions!)
        expect(e.question.endsWith("?")).toBe(true);
      expect(rules.ways_to_meet!.length).toBeGreaterThan(0);
    } else {
      expect(rules.exemptions).toBeUndefined();
      expect(rules.ways_to_meet).toBeUndefined();
    }
  });

  it("makes no eligibility claim", () => {
    expect(findForbiddenClaims(JSON.stringify(rules))).toEqual([]);
  });
});

it("covers the five West Coast states", () => {
  expect(STATE_CODES).toEqual(["WA", "OR", "CA", "NV", "AZ"]);
});

it("keeps the health-condition question id the doctor note relies on", () => {
  for (const code of STATE_CODES) {
    const rules = stateRules(code);
    if (rules.status === "published")
      expect(rules.exemptions!.map((e) => e.id)).toContain("health_condition");
  }
});

describe.each(STATE_CODES.filter((c) => stateRules(c).status === "published"))(
  "%s Spanish wording (US-063)",
  (code) => {
    const rules = stateRules(code);

    it("has a Spanish question for every exemption", () => {
      for (const e of rules.exemptions!) {
        expect(e.question_es, e.id).toMatch(/^¿.+\?$/);
      }
    });

    it("has Spanish text for every way to meet the rule, and for who it applies to", () => {
      for (const w of rules.ways_to_meet!) expect(w.text_es, w.id).toBeTruthy();
      expect(rules.applies_to_es).toBeTruthy();
    });
  },
);
