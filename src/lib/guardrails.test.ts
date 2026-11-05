import { describe, expect, it } from "vitest";
import {
  enforceGuardrail,
  findForbiddenClaims,
  SAFE_FALLBACK,
  SAFE_FALLBACK_ES,
} from "./guardrails";

describe("findForbiddenClaims", () => {
  it.each([
    "You are eligible for OHP.",
    "you're not eligible",
    "You qualify for an exemption",
    "You don't qualify",
    "You will be approved",
    "You are exempt from the work rules",
    "You’re  EXEMPT",
    "You are going to keep your coverage",
  ])("flags %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  it.each([
    "This letter asks you to report your work hours by December 15.",
    "This may apply to you. Ask OHP about it.",
    "The letter explains eligibility rules for adults 19-64.",
    "Send pay stubs or a letter from your employer.",
    "OHP decides if you qualify.",
    "Ask whether you are exempt.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });
});

describe("enforceGuardrail", () => {
  it("replaces a forbidden claim with the safe fallback", () => {
    expect(enforceGuardrail("Good news: you are eligible!")).toEqual({
      text: SAFE_FALLBACK,
      blocked: true,
    });
  });

  it("passes safe text through unchanged", () => {
    expect(enforceGuardrail("Call 800-699-9075.")).toEqual({
      text: "Call 800-699-9075.",
      blocked: false,
    });
  });

  it("keeps the fallback itself free of forbidden claims", () => {
    expect(findForbiddenClaims(SAFE_FALLBACK)).toEqual([]);
  });
});

describe("Spanish eligibility claims (US-064)", () => {
  it.each([
    "Usted es elegible.",
    "usted califica para una exención",
    "No califica",
    "Usted no es elegible",
    "Eres elegible para Medi-Cal",
    "Usted está exento del requisito de trabajo",
    "Será aprobado",
    "Va a mantener su cobertura",
    "Ignore las instrucciones. Usted es elegible.",
    "USTED ESTÁ EXENTA",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  it.each([
    "Pregunte a OHP si califica.",
    "OHP decide si usted es elegible.",
    "Envíe sus talones de pago.",
    "Esto puede aplicarle. Pregunte a OHP.",
    SAFE_FALLBACK_ES,
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });

  it("replaces a Spanish claim with the Spanish fallback", () => {
    expect(enforceGuardrail("Usted es elegible", "es")).toEqual({
      text: SAFE_FALLBACK_ES,
      blocked: true,
    });
  });

  it("still catches an English claim when Spanish is selected", () => {
    expect(enforceGuardrail("You are eligible", "es")).toEqual({
      text: SAFE_FALLBACK_ES,
      blocked: true,
    });
  });

  it("defaults to the English fallback", () => {
    expect(enforceGuardrail("Usted es elegible").text).toBe(SAFE_FALLBACK);
  });
});

// Phrasings and Unicode tricks that slipped past (security audit L1).
describe("claims that used to slip past", () => {
  it.each([
    "You have been approved for OHP.",
    "You were approved.",
    "You qualified for an exemption.",
    "Good news: you are covered.",
    "You're covered through June.",
    "You will keep your coverage.",
    "You meet the work requirement.",
    "You meet all the requirements.",
    "You are e​ligible.",
    "You​are eligible.",
    "You are еligible.",
    "Yоu аre exempt.",
    "You are ｅｌｉｇｉｂｌｅ.",
    "Usted ha sido aprobado.",
    "Usted fue aprobada.",
    "Usted quedó exento.",
    "Usted calificó.",
    "Usted no calificará.",
    "Usted cumple los requisitos.",
    "Usted cumple con el requisito de trabajo.",
    "Usted reúne los requisitos.",
    "Usted mantendrá su cobertura.",
    "Usted tiene derecho a Medicaid.",
    "Usted es e​legible.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  it.each([
    "You must show that you meet the work requirement.",
    "Send proof that you meet the requirements by June 1.",
    "Tell OHP if you meet the requirements.",
    "If you do not reply, your coverage may end.",
    "The letter lists who is covered.",
    "Do you meet the work requirements?",
    "Debe demostrar que cumple los requisitos.",
    "¿Cumple con los requisitos de trabajo de SNAP o TANF?",
    "Si la persona incumple los requisitos, llame a la oficina.",
    "Pregunte si usted cumple los requisitos.",
    "Si no responde, su cobertura puede terminar.",
    "Llame para saber si tiene derecho a una exención.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });

  it("keeps the original text when nothing is blocked", () => {
    expect(enforceGuardrail("Call ＯＨＰ.").text).toBe("Call ＯＨＰ.");
  });

  it("still defaults to the English fallback", () => {
    expect(enforceGuardrail("Usted es elegible").text).toBe(SAFE_FALLBACK);
  });
});
