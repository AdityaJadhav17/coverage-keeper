import { describe, expect, it } from "vitest";
import { CONDITION_PLACEHOLDER, buildDoctorDraft } from "./doctor-draft";
import { findForbiddenClaims } from "./guardrails";
import { stateRules } from "./states";

const today = new Date("2027-02-10T10:00:00-08:00");
const rules = stateRules("OR");

describe("buildDoctorDraft", () => {
  it("includes the deadline when given", () => {
    const draft = buildDoctorDraft({ deadline: "2027-02-15", today, rules });
    expect(draft).toContain("I need this by Feb 15, 2027.");
  });

  it.each([null, "not-a-date"])("omits the deadline for %j", (deadline) => {
    const draft = buildDoctorDraft({ deadline, today, rules });
    expect(draft).not.toMatch(/I need this/);
  });

  it("asks for it as soon as possible when the deadline passed", () => {
    const draft = buildDoctorDraft({ deadline: "2027-02-01", today, rules });
    expect(draft).toContain("I need this as soon as possible.");
    expect(draft).not.toContain("Feb 1, 2027");
  });

  it("dates the note with the injected clock", () => {
    expect(buildDoctorDraft({ deadline: null, today, rules })).toMatch(
      /^Date: Feb 10, 2027\n/,
    );
  });

  it("has the placeholder, the 80-hour ask and the source", () => {
    const draft = buildDoctorDraft({ deadline: null, today, rules });
    expect(draft).toContain(CONDITION_PLACEHOLDER);
    expect(draft).toContain("80 hours a month");
    expect(draft).toContain(
      "Rules: https://www.oregon.gov/oha/hsd/ohp/pages/federal-changes.aspx",
    );
  });

  it("names the chosen state's program and rules page", () => {
    const ca = stateRules("CA");
    const draft = buildDoctorDraft({ deadline: null, today, rules: ca });
    expect(draft).toContain("Medi-Cal has new work and activity rules.");
    expect(draft).toContain(`Rules: ${ca.source_url}`);
    expect(draft).not.toMatch(/OHP|Oregon/);
  });

  it.each([null, "2027-02-15", "2027-02-01"])(
    "makes no eligibility claim (deadline %j)",
    (deadline) => {
      const draft = buildDoctorDraft({ deadline, today, rules });
      expect(findForbiddenClaims(draft)).toEqual([]);
      expect(draft).not.toMatch(/eligib|exempt|qualif/i);
    },
  );
});
