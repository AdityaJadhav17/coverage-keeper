import { describe, expect, it } from "vitest";
import {
  enforceGuardrail,
  findForbiddenClaims,
  findHealthCare,
  findImmigrationAdvice,
  findLegalStrategy,
  findSelfDescriptions,
  HEALTH_FALLBACK,
  HEALTH_FALLBACK_ES,
  HIDDEN_PAPER,
  HIDDEN_PAPER_ES,
  IMMIGRATION_FALLBACK,
  IMMIGRATION_FALLBACK_ES,
  LEGAL_FALLBACK,
  LEGAL_FALLBACK_ES,
  paperOrNotice,
  SAFE_FALLBACK,
  SAFE_FALLBACK_ES,
  shownOrNull,
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

describe("banned self-descriptions (legal checklist ISSUE-7, #50)", () => {
  it.each([
    "I am a licensed counselor and can help.",
    "As your nurse, I recommend sending the form.",
    "We are certified application counselors.",
    "We're navigators for Apple Health.",
    "Coverage Keeper is an official Medi-Cal tool.",
    "Coverage Keeper is HIPAA compliant.",
    "This app is guaranteed to be accurate.",
    "I'm your case worker for this renewal.",
    "We are immigration consultants.",
    "Our team is licensed in Nevada.",
    "Soy notario y puedo ayudarle.",
    "Somos abogados de inmigración.",
    "Como su consejera, le recomiendo enviar el formulario.",
    "Coverage Keeper es un servicio oficial del estado.",
    "Somos consultores de inmigración certificados.",
  ])("finds %j", (text) => {
    expect(findSelfDescriptions(text)).not.toHaveLength(0);
    expect(enforceGuardrail(text).blocked).toBe(true);
  });

  it.each([
    // What a letter may ask for, or who it names: not about us.
    "Ask your doctor to fill out the form.",
    "Send a note from a licensed health professional.",
    "Call a certified application counselor at the number on your letter.",
    "A navigator or assister can help you renew for free.",
    "Legal aid can help you with an appeal.",
    "Send a certified copy of your birth certificate.",
    "Make sure the information is accurate.",
    "Call the official Medi-Cal Helpline.",
    "Your case worker is listed at the top of the letter.",
    "Pida a su médico que llene el formulario.",
    "Un abogado de ayuda legal puede ayudarle con la apelación.",
    // Saying what we are not is fine.
    "We are not lawyers, and this is not legal advice.",
    "Coverage Keeper is not an official state site.",
    "No somos abogados.",
    "Coverage Keeper no es un servicio oficial.",
    "I am sending this as your doctor requested.",
  ])("leaves %j alone", (text) => {
    expect(findSelfDescriptions(text)).toEqual([]);
    expect(enforceGuardrail(text)).toEqual({ text, blocked: false });
  });

  it("sees through look-alike letters and invisible characters", () => {
    expect(findSelfDescriptions("We are nоtarios.")).not.toHaveLength(0);
    expect(findSelfDescriptions("We are thera​pists.")).not.toHaveLength(0);
  });

  it("uses the reply's language for the fallback", () => {
    expect(enforceGuardrail("Somos notarios.", "es").text).toBe(
      SAFE_FALLBACK_ES,
    );
  });
});

// Never act as a health or mental health professional; point to a doctor or 988 (#49).
describe("health and mental health care", () => {
  it.each([
    "You may have depression.",
    "You probably have an anxiety disorder.",
    "You seem to have PTSD.",
    "You have a mental illness.",
    "You should stop taking your medication.",
    "Start taking your antidepressants again.",
    "Try therapy to feel better.",
    "Usted podría tener depresión.",
    "Usted tiene un trastorno de ansiedad.",
    "Debería dejar de tomar su medicamento.",
    "Pruebe la terapia para sentirse mejor.",
  ])("blocks %j", (text) => {
    expect(findHealthCare(text)).not.toHaveLength(0);
    expect(enforceGuardrail(text)).toEqual({
      text: HEALTH_FALLBACK,
      blocked: true,
    });
  });

  it.each([
    "Send a note from your doctor about your health condition.",
    "Proof of a medical condition that limits your work.",
    "Una nota de su médico sobre su condición de salud.",
    "Do you have a serious or disabling health condition?",
    "Ask your doctor to fill out the form.",
    // Exemptions name conditions as a question, not a diagnosis.
    "If you have a mental health condition, you may be exempt.",
    "Tell the state if you have a mental illness that limits your work.",
    "Ask whether you have a disorder that counts.",
    "Unless you have a substance use disorder, you must report hours.",
    "Si usted tiene un trastorno por uso de sustancias, puede estar exento.",
    "Si tiene depresión, puede estar exento.",
  ])("allows %j", (text) => {
    expect(findHealthCare(text)).toEqual([]);
  });

  it("answers in Spanish when Spanish is selected", () => {
    expect(enforceGuardrail("Usted podría tener depresión.", "es").text).toBe(
      HEALTH_FALLBACK_ES,
    );
  });

  it("points to a doctor and to 988, and passes every check itself", () => {
    for (const text of [HEALTH_FALLBACK, HEALTH_FALLBACK_ES]) {
      expect(text).toMatch(/988/);
      expect(enforceGuardrail(text).blocked).toBe(false);
    }
  });
});

// No immigration advice: status, visas, public charge, USCIS filings (#48).
describe("immigration advice", () => {
  it.each([
    "You are a lawful permanent resident.",
    "You're a qualified non-citizen.",
    "You are undocumented.",
    "Your immigration status is safe.",
    "Your status will not be affected.",
    "Using Medicaid will not make you a public charge.",
    "Public charge does not apply to you.",
    "You should apply for a green card.",
    "You can renew your visa.",
    "File Form I-485 with USCIS.",
    "Apply for citizenship with USCIS.",
    "Usted es residente permanente.",
    "Su estatus migratorio es seguro.",
    "Usar Medicaid no afecta la carga pública.",
    "Usted debería solicitar una tarjeta verde.",
    "Presente el formulario I-485 ante USCIS.",
  ])("blocks %j", (text) => {
    expect(findImmigrationAdvice(text)).not.toHaveLength(0);
    expect(enforceGuardrail(text)).toEqual({
      text: IMMIGRATION_FALLBACK,
      blocked: true,
    });
  });

  // What immigration letters ask for must stay readable.
  it.each([
    "We could not verify your immigration status.",
    "Send proof of your citizenship or immigration status.",
    "Send a copy of your green card (I-551).",
    "Send your I-94 record.",
    "The state asks if you are a lawful permanent resident.",
    "No pudimos verificar su estatus migratorio.",
    "Envíe una copia de su tarjeta verde.",
    "Submit it and we check it with USCIS.",
    "Su estado es seguro.",
  ])("allows %j", (text) => {
    expect(findImmigrationAdvice(text)).toEqual([]);
  });

  it("answers in Spanish, refers to free legal help, and passes every check", () => {
    expect(enforceGuardrail("Usted es residente permanente.", "es").text).toBe(
      IMMIGRATION_FALLBACK_ES,
    );
    for (const text of [IMMIGRATION_FALLBACK, IMMIGRATION_FALLBACK_ES]) {
      expect(text).toMatch(/justice\.gov\/eoir/);
      expect(enforceGuardrail(text).blocked).toBe(false);
    }
  });
});

// No legal strategy: whether to appeal, which option to pick, what to "do" (#47).
describe("legal strategy", () => {
  it.each([
    "You should appeal this decision.",
    "You should not ask for a hearing.",
    "You should request a fair hearing.",
    "We recommend that you appeal.",
    "I suggest you appeal.",
    "Your best option is to reapply.",
    "It's best to appeal now.",
    "The best choice for you is to appeal.",
    "You should hire a lawyer.",
    "Usted debería apelar.",
    "Le recomendamos que pida una audiencia.",
    "Su mejor opción es volver a solicitar.",
    "Lo mejor es apelar.",
  ])("blocks %j", (text) => {
    expect(findLegalStrategy(text)).not.toHaveLength(0);
    expect(enforceGuardrail(text)).toEqual({
      text: LEGAL_FALLBACK,
      blocked: true,
    });
  });

  // Rights and instructions a letter states are not strategy.
  it.each([
    "If you disagree, you can ask for a hearing.",
    "You have the right to appeal within 90 days.",
    "Send your pay stubs by February 15.",
    "You must report your hours every month.",
    "You should get a renewal form in the mail.",
    "Usted tiene derecho a pedir una audiencia.",
    "Si no está de acuerdo, puede apelar.",
    "Debe enviar sus talones de pago.",
    // Everyday renewal instructions and agency wording.
    "You should sign the renewal form and send it back by March 1.",
    "You should accept the new card when it arrives.",
    "Usted debería firmar el formulario y enviarlo.",
    "We recommend that you keep a copy of this letter.",
    "We advise you to report changes within 10 days.",
    "Le recomendamos que guarde una copia de esta carta.",
  ])("allows %j", (text) => {
    expect(findLegalStrategy(text)).toEqual([]);
  });

  it("answers in Spanish, points to legal aid, and passes every check", () => {
    expect(enforceGuardrail("Usted debería apelar.", "es").text).toBe(
      LEGAL_FALLBACK_ES,
    );
    for (const text of [LEGAL_FALLBACK, LEGAL_FALLBACK_ES]) {
      expect(text).toMatch(/lsc\.gov/);
      expect(enforceGuardrail(text).blocked).toBe(false);
    }
  });
});

// Review 2026-11-21: one adverb or contraction used to defeat the check, and ordinary
// instructions from a letter were erased.
describe("claims with an adverb, a contraction or another tense", () => {
  it.each([
    "You are no longer eligible for Medicaid.",
    "You no longer qualify for Apple Health.",
    "You've been approved for Medicaid.",
    "You aren't eligible for coverage.",
    "You are still eligible.",
    "You are now eligible for full coverage.",
    "You are currently eligible.",
    "You are already exempt.",
    "You are likely exempt.",
    "You remain eligible.",
    "You are approved.",
    "You are not covered.",
    "You still qualify.",
    "You probably qualify for an exemption.",
    "You definitely qualify.",
    "You do qualify.",
    "You'll qualify.",
    "You have qualified for an exemption.",
    "You have been found eligible.",
    "You have been denied.",
    "You were denied coverage.",
    "You'll be covered starting January 1.",
    "You will lose your coverage on January 31.",
    "You lost your coverage.",
    "Usted sigue siendo elegible.",
    "Usted perderá su cobertura el 31 de enero.",
    "Usted va a perder la cobertura.",
    "Usted quedará exento.",
    "Usted está cubierto.",
    "Usted fue denegado.",
    // A condition elsewhere does not excuse a plain claim.
    "If you read this, you are eligible.",
    "Send it and you qualify.",
    "The letter says that you are eligible.",
    "Si lee esto, usted es elegible.",
    "If you have questions, call us. You will lose your coverage.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });
});

describe("what a letter asks for, or warns about, is not a claim", () => {
  it.each([
    // A question or a condition, not an answer.
    "Fill out the form to find out whether or not you qualify.",
    "The state will decide whether or not you are eligible.",
    "Unless you qualify for an exemption, you must report hours.",
    "El estado necesita revisar si todavía califica.",
    "Complete el formulario para ver si todavía califica.",
    "Envíe los documentos para saber si su hijo es elegible.",
    // What happens if the person does or does not act.
    "If you do not renew by March 1, you will lose your coverage.",
    "Si no renueva antes del 1 de marzo, perderá su cobertura.",
    "Send the form so you can keep your coverage.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });
});

describe("a blocked field is hidden, not replaced by our own sentence", () => {
  it("keeps a clean quote or action and drops a blocked one", () => {
    expect(shownOrNull("Please send this by February 15, 2027.")).toBe(
      "Please send this by February 15, 2027.",
    );
    expect(shownOrNull("You are eligible, no need to reply.")).toBeNull();
    expect(shownOrNull(null)).toBeNull();
    expect(shownOrNull("")).toBeNull();
  });

  it("keeps a clean paper and swaps a blocked one for a pointer to the letter", () => {
    expect(paperOrNotice("Pay stubs for January 2027")).toBe(
      "Pay stubs for January 2027",
    );
    expect(paperOrNotice("Nothing needed, you're exempt")).toBe(HIDDEN_PAPER);
    expect(paperOrNotice("Nada, usted está exento", "es")).toBe(
      HIDDEN_PAPER_ES,
    );
  });

  it("the pointers themselves pass the check", () => {
    for (const text of [HIDDEN_PAPER, HIDDEN_PAPER_ES])
      expect(findForbiddenClaims(text)).toEqual([]);
  });
});

// Second review of this fix: the exemptions must not excuse an assertion.
describe("an exemption does not excuse an assertion", () => {
  it.each([
    // "confirm", "show", "prove" as what the letter or the records say.
    "This letter confirms that you are approved.",
    "This letter is to confirm that you are eligible for Medicaid.",
    "This letter confirms you qualify for Apple Health.",
    "We confirm that you are eligible for Medicaid.",
    "Our records show that you are eligible.",
    "Records show you qualify.",
    "Documents show you are eligible.",
    "Evidence confirms you are exempt.",
    "The evidence shows you are exempt.",
    "This proves you are exempt.",
    "It shows that you are exempt.",
    "The review showed you are eligible.",
    "Your documents confirm you are exempt.",
    "Your papers show that you are approved.",
    "We have proof that you are eligible.",
    "Verification that you are eligible is complete.",
    "Show you are eligible.",
    "Esta carta es para confirmar que usted es elegible para Medicaid.",
    "Podemos confirmar que usted califica.",
    "Tenemos pruebas de que usted es elegible.",
    "Se pudo verificar que usted califica.",
    "La constancia de que usted está exento fue recibida.",
    // A good outcome is a claim whatever else the sentence says.
    "You will be approved, call if you have questions.",
    "You will keep your coverage - if you have questions call 1-800-699-9075.",
    "Call us if you have questions and you will be approved",
    "You will be approved once the state reads this.",
    "You will be covered when you see this.",
    "If so, you will be approved.",
    "You will be covered until June 30 only if you return the form.",
    "Usted será elegible cuando reciba esta carta.",
    "You will be approved\nIf you have questions call us",
    // A loss with no condition about what the person does.
    "You will be denied, no matter when you send it.",
    // An opener is not a licence.
    "When you are approved (which you are), the state mails a card.",
    "Once you qualify, as you now do, ignore this letter.",
    "Ya revisamos si califica y usted es elegible.",
    "Si lee esto usted es elegible.",
    "Si señor usted califica.",
    "You have lost your coverage.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  it.each([
    // An abbreviation's period does not cut the condition off.
    "If you do not send the form by Feb. 15, you will lose your coverage.",
    "If you do not renew by 5 p.m. on March 1, you will lose your coverage.",
    "If you live in the U.S. and do not renew, you will lose your coverage.",
    "Si no renueva antes del 1.º de marzo, perderá su cobertura.",
    "Unless you renew by March 1, you will lose your coverage.",
    // Other coverage and income are not about this program's decision.
    "You are also covered by Medicare, send your Medicare card.",
    "Proof of other health insurance you are also covered by",
    "You have exempt income? List it.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });
});

// The check fails closed. These are things a letter can rightly say, but no pattern
// told them apart from a finding ("we have proof that you are eligible") without
// letting real claims through. Blocked, they are hidden on screen, never reworded.
describe("blocked on purpose: asked-to-prove wording", () => {
  it.each([
    "Send proof that you are exempt by June 30.",
    "Send documents to show you are exempt.",
    "Letter showing you qualify for SNAP",
    "Proof that you were approved for disability",
    "You must show you meet the work requirement.",
    "Send proof showing how you meet the work requirements.",
    "The letter asks you to prove you meet the work requirements.",
    "Comprobante de que usted califica",
    "Envíe pruebas de que usted está exento antes del 30 de junio.",
    "If you think you are exempt, call us.",
    "If you do not send the form, you will not be covered after June 30.",
    "If we do not hear from you by June 1, you will not be covered.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });
});

describe("third pass: findings dressed as requests, and coverage by this program", () => {
  it.each([
    "This goes to show you are eligible.",
    "The state is able to prove that you qualify.",
    "We can show you are eligible.",
    "Your papers are enough to show you are exempt.",
    "Records showing you are eligible exist.",
    "A letter proving you qualify was received.",
    "Esta carta es para demostrar que usted califica.",
    "Usted no necesita demostrar que es elegible.",
    "Proof that you are eligible is on file.",
    "Proof that you are eligible has been received.",
    "You must know we have proof that you are eligible.",
    "Bring this letter as proof that you are eligible.",
    "Presente esta carta como comprobante de que usted es elegible.",
    "You are covered by Medicaid.",
    "You're covered by OHP through June 30.",
    "You will be covered by Medicaid starting July 1.",
    "You have been covered by Medi-Cal since May.",
    "If you were wondering, you will not be eligible.",
    "If you want to know, you will be denied.",
    "Si quiere saberlo, usted no será elegible.",
    "Si no usted no es elegible.",
    "Si ya usted califica no haga nada.",
    "You will soon be approved.",
    "You will always be covered.",
    "You are going to be approved.",
    "You will be losing your coverage.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  // A loss with its reason in the same sentence is the warning the person needs.
  it.each([
    "Renew by March 1 or you will lose your coverage.",
    "You must renew by March 1, otherwise you will lose your coverage.",
    "You will lose your coverage if the form is not returned by June 30.",
    "You will lose your coverage unless your renewal is received by June 30.",
    "If your form is late, you will lose your coverage.",
    "If the state does not get your form by June 30, you will lose your coverage.",
    "Without your renewal form, you will lose your coverage on June 30.",
    "If you do not renew by March 1,\nyou will lose your coverage.",
    "Renueve antes del 1 de marzo o perderá su cobertura.",
    "Envíe el formulario antes del 1 de marzo. De lo contrario, perderá su cobertura.",
    "Sin su formulario, usted perderá su cobertura el 30 de junio.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });
});

describe("fourth pass: nothing main blocked gets through", () => {
  it.each([
    "You have been not approved.",
    "You have been not covered.",
    "You are lose coverage.",
    "You are keep coverage.",
    "Usted va a perder su cobertura si no renueva.",
    "Si me pregunta, va a perder su cobertura.",
    "Vas a perder tu cobertura sin duda.",
    // A loss with a word that only looks like a reason.
    "You will lose your coverage for one or two reasons.",
    "You'll lose your coverage in 30 days or less.",
    "You will lose coverage without a doubt.",
    "Without question you will lose your coverage.",
    "Usted perderá su cobertura sin duda.",
    'The letter says "call if you need help." You will lose your coverage.',
    "If you need help, call (1-800-699-9075.) You will lose your coverage.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });
});

// Review of #65: the reason must be something the person does, not any "if".
describe("a loss is excused only by the person's own action", () => {
  it.each([
    "If you ask me, you will lose your coverage.",
    "You will lose your coverage, if you ask me.",
    "If you have questions, call us, you will lose your coverage.",
    "You will lose your coverage if you don't mind me saying so.",
    "Unless something changes, you will lose your coverage.",
    "If we are honest, you will lose your coverage.",
    "Otherwise, you will lose your coverage.",
    "De lo contrario, perderá su cobertura.",
    "Si quiere saberlo, perderá su cobertura.",
    "Si tiene preguntas, llámenos; perderá su cobertura.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  it.each([
    "If you do not renew by March 1, you will lose your coverage.",
    "You will lose your coverage on June 30 if you have not sent the form.",
    "You will lose your coverage if you do not report your work hours.",
    "If no one in your home works 80 hours, you will lose your coverage.",
    "If you live in the U.S. and do not renew, you will lose your coverage.",
    "You must renew by March 1, otherwise you will lose your coverage.",
    "If you do not sign and return the form, you will lose your coverage.",
    "If you do not pay your premium, you will lose your coverage.",
    "Si no envía sus talones de pago, perderá su cobertura.",
    "Si no reporta sus horas de trabajo, perderá su cobertura.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });
});

// Second review of #65: "if" must be about a step the person misses, not a fact.
describe("a loss after 'if' needs a missed step", () => {
  it.each([
    "If you work full time, you will lose your coverage.",
    "If you return to work, you will lose your coverage.",
    "If you are paid more than $2,000 a month, you will lose your coverage.",
    "If you sign up for Medicare, you will lose your coverage.",
    "If you apply for SSI, you will lose your coverage.",
    "If you report more income, you will lose your coverage.",
    "Even if you renew, you will lose your coverage.",
    "Si trabaja tiempo completo, perderá su cobertura.",
    "Si vuelve a trabajar, perderá su cobertura.",
    "If you work with us, you will lose your coverage.",
    "Without paying attention, you will lose your coverage.",
  ])("blocks %j", (text) => {
    expect(findForbiddenClaims(text)).not.toHaveLength(0);
  });

  it.each([
    // A date between commas does not cut the condition off.
    "If, by March 1, you do not renew, you will lose your coverage.",
    "If by March 1, 2027, you have not renewed, you will lose your coverage.",
    // "If you don't" points back to the step before it.
    "Send your renewal form by March 1. If you don't, you will lose your coverage.",
    "Send your renewal form by March 1. If not, you will lose your coverage.",
    "Report your hours each month; if not, you will lose your coverage.",
    "Envíe el formulario. Si no lo hace, perderá su cobertura.",
    // Agency wording for the same steps.
    "If we don't hear from you by March 1, you will lose your coverage.",
    "If you don't fill out the packet, you will lose your coverage.",
    "If you don't turn in the packet, you will lose your coverage.",
    "If you don't mail it back, you will lose your coverage.",
    "If you don't provide the requested items by May 5, you will lose your coverage.",
    "If you don't verify your income, you will lose your coverage.",
    "If you miss the due date, you will lose your coverage.",
    "Fill out the packet by March 1, or you will lose your coverage.",
    "Si no llena el paquete, perderá su cobertura.",
    "Si no manda los papeles, perderá su cobertura.",
    "Si no entrega los papeles, perderá su cobertura.",
    "Si no presenta los comprobantes, perderá su cobertura.",
  ])("allows %j", (text) => {
    expect(findForbiddenClaims(text)).toEqual([]);
  });
});
