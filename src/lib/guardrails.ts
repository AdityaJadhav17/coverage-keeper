// Phrases that state or deny eligibility. The app may describe what a letter asks for,
// never whether the user qualifies (ADR-0005).
// "if you qualify" / "whether you are eligible" are questions, not claims.
const NOT_A_QUESTION = String.raw`(?<!\b(?:if|whether)\s)`;
const FORBIDDEN_PATTERNS: RegExp[] = [
  String.raw`\byou(?:'re|\s+are)\s+(?:not\s+)?(?:eligible|ineligible|exempt|approved|qualified)\b`,
  String.raw`\byou\s+(?:do\s+not\s+|don't\s+|will\s+not\s+|won't\s+)?qualify\b`,
  String.raw`\byou\s+will\s+(?:not\s+)?(?:be\s+)?(?:approved|denied|covered|eligible|exempt)\b`,
  String.raw`\byou\s+(?:are|'re)\s+(?:not\s+)?(?:going\s+to\s+)?(?:keep|lose)\s+(?:your\s+)?coverage\b`,
  String.raw`\byou\s+(?:have\s+been|were|got)\s+(?:not\s+)?(?:approved|qualified|exempt(?:ed)?|eligible|covered)\b`,
  String.raw`\byou\s+qualified\b`,
  String.raw`\byou(?:'re|\s+are)\s+(?:still\s+)?covered\b`,
  String.raw`\byou\s+will\s+(?:still\s+)?keep\s+(?:your\s+)?coverage\b`,
  // "show that you meet…" is an instruction and "do you meet…?" a question, not claims.
  String.raw`(?<!\b(?:that|do)\s)\byou\s+(?:meet|satisfy)\s+(?:all\s+)?(?:the\s+)?(?:\w+\s+)?requirements?\b`,
].map((p) => new RegExp(NOT_A_QUESTION + p, "i"));

// Spanish (US-064). "si (usted) califica" / "si usted es elegible" are questions, not claims.
const NOT_A_QUESTION_ES = String.raw`(?<!\bsi\s+(?:usted\s+|tú\s+)?)`;
const FORBIDDEN_PATTERNS_ES: RegExp[] = [
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:es|eres|está|esta|estás|estas)\s+(?:elegible|inelegible|exent[oa]|aprobad[oa]|calificad[oa])\b`,
  // Not \b after an accented letter: \b only knows ASCII word characters.
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:califica|calificas|calificó|calificaste|calificará|calificarás)(?![\p{L}\p{N}])`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:será|serás)\s+(?:aprobad[oa]|elegible|exent[oa])\b`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:va|vas)\s+a\s+(?:mantener|perder)\s+(?:su|tu)\s+cobertura\b`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:(?:ha|has)\s+sido|fue|fuiste|quedó|quedaste)\s+(?:aprobad[oa]|exent[oa]|elegible|calificad[oa])\b`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:mantendrá|mantendrás)\s+(?:su|tu)\s+cobertura\b`,
  // "demostrar que cumple…" is an instruction and "¿cumple…?" a question, not claims.
  String.raw`(?<!(?:\bque\s+|¿)(?:usted\s+|tú\s+)?)\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:cumple|cumples|reúne|reúnes)\s+(?:con\s+)?(?:todos\s+)?(?:los|el)\s+requisitos?\b`,
  // Not "derecho a una audiencia": appeal rights are fine to describe.
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?tienes?\s+derecho\s+a\s+(?:medicaid|medi-cal|ohp|ahcccs|apple\s+health|(?:la\s+|su\s+)?cobertura|(?:una\s+)?exención|beneficios)`,
].map((p) => new RegExp(NOT_A_QUESTION_ES + p, "iu"));

// Words we must never use for Coverage Keeper itself (legal checklist "Banned terms", #50).
// Strict: no place anywhere in our own copy.
const STRICT_TERMS = [
  String.raw`notari[oa]s?(?:\s+p[uú]blic[oa]s?)?`,
  String.raw`licenciad[oa]s?`,
  String.raw`immigration\s+(?:consultant|assistant|specialist)s?`,
  String.raw`consultor(?:a|es|as)?\s+de\s+inmigraci[oó]n`,
  String.raw`abogad[oa]s?`,
  String.raw`lawyers?`,
  String.raw`paralegals?`,
  String.raw`navigators?`,
  String.raw`assisters?`,
  String.raw`certified\s+application\s+counselors?`,
  String.raw`enrollment\s+(?:counselor|facilitator)s?`,
  String.raw`community\s+partners?`,
  String.raw`nurses?`,
  String.raw`counselors?`,
  String.raw`consejer[oa]s?`,
  String.raw`therapists?`,
  String.raw`case\s*workers?`,
  String.raw`hipaa[\s-]+compliant`,
  String.raw`guaranteed`,
  String.raw`licensed`,
  String.raw`certified`,
];
// Fine when a letter or our copy names someone else ("ask your doctor", "the official
// helpline"); banned only as a description of us. The Spanish forms are our translations
// of the checklist's English terms.
const CONTEXT_TERMS = [
  String.raw`doctors?`,
  String.raw`legal\s+aid`,
  String.raw`legal\s+services`,
  String.raw`accurate`,
  String.raw`official`,
  String.raw`m[eé]dic[oa]s?`,
  String.raw`doctor(?:a|es|as)`,
  String.raw`enfermer[oa]s?`,
  String.raw`terapeutas?`,
  String.raw`oficial(?:es)?`,
  String.raw`garantizad[oa]s?`,
  String.raw`certificad[oa]s?`,
];
const END = String.raw`(?![\p{L}\p{N}])`;

export const STRICT_BANNED_TERMS: RegExp[] = STRICT_TERMS.map(
  (t) => new RegExp(String.raw`(?<![\p{L}\p{N}])(?:${t})${END}`, "iu"),
);

const ANY_TERM = `(?:${[...STRICT_TERMS, ...CONTEXT_TERMS].join("|")})${END}`;
// "We are (a team of) …", never "We are not …" or "We are sending your doctor …".
const SELF_DESCRIPTION_PATTERNS: RegExp[] = [
  String.raw`\b(?:i\s+am|i'm|we\s+are|we're|coverage\s+keeper\s+is|this\s+(?:app|tool|service|site|website)\s+is|our\s+(?:team|staff)\s+(?:is|are))(?!\s+(?:not|no|never)\b)\s+(?:(?:a|an|your|the)\s+(?:[\w-]+\s+){0,2}?)?${ANY_TERM}`,
  String.raw`\bas\s+your\s+${ANY_TERM}\s*,`,
  String.raw`(?<!\bno\s)\b(?:soy|somos|coverage\s+keeper\s+es|esta\s+(?:aplicaci[oó]n|herramienta|p[aá]gina)\s+es|nuestro\s+equipo\s+(?:es|est[aá]))\s+(?:(?:un|una|unos|unas|su|sus|el|la|los|las)\s+(?:[\p{L}-]+\s+){0,2}?)?${ANY_TERM}`,
  String.raw`\bcomo\s+su\s+${ANY_TERM}\s*,`,
].map((p) => new RegExp(p, "iu"));

// Cyrillic and Greek letters that look Latin, so "еligible" can't pass for "eligible".
const LOOKALIKE_FROM = "аеорсухіјѕԁԛԝАВЕКМНОРСТХІЈЅοαικνρτυχΑΒΕΖΗΙΚΜΝΟΡΤΥΧ";
const LOOKALIKE_TO = "aeopcyxijsdqwABEKMHOPCTXIJSoaikvptuxABEZHIKMNOPTYX";

// Health and mental health care: a diagnosis, medicine advice or a treatment to try
// (#49). Asking for a doctor's note and naming a "health condition" stay fine.
const HEALTH_CARE_PATTERNS: RegExp[] = [
  // "if you have a mental health condition, you may be exempt" names an exemption.
  String.raw`(?<!\b(?:if|whether|unless)\s)\byou\s+(?:may|might|could|probably|likely|seem\s+to|appear\s+to)?\s*(?:have|suffer\s+from)\s+(?:a\s+|an\s+)?(?:depression|anxiety|ptsd|bipolar|schizophrenia|(?:\w+\s+)?(?:disorder|mental\s+illness)|mental\s+(?:health\s+)?(?:condition|disorder|illness))\b`,
  String.raw`\b(?:stop|start|keep)\s+taking\s+(?:your\s+)?(?:medication|medicine|meds|pills|antidepressants)`,
  String.raw`\b(?:try|consider|start)\s+(?:therapy|counseling|antidepressants|medication)\b`,
  String.raw`(?<!\bsi\s)\busted\s+(?:podría\s+tener|tiene|probablemente\s+tiene|sufre\s+de)\s+(?:una\s+|un\s+)?(?:depresión|ansiedad|un\s+trastorno|trastorno|una\s+enfermedad\s+mental)`,
  String.raw`\b(?:deje|dejar|empiece|empezar|siga)\s+(?:de\s+|a\s+)?tomar\s+(?:su\s+)?(?:medicamento|medicina|pastillas|antidepresivos)`,
  String.raw`\bpruebe\s+(?:la\s+)?(?:terapia|consejería|medicación)`,
].map((p) => new RegExp(p, "iu"));

export const HEALTH_FALLBACK =
  "We can't give health or mental health advice. Ask your doctor. In a crisis, call or text 988.";

export const HEALTH_FALLBACK_ES =
  "No podemos dar consejos de salud ni de salud mental. Pregúntele a su médico. Si está en crisis, llame o envíe un mensaje de texto al 988.";

// Immigration advice: the person's status, public charge, visas, USCIS filings (#48).
// What a letter asks for ("we could not verify your immigration status", "send a copy
// of your green card") stays fine.
const IMMIGRATION_PATTERNS: RegExp[] = [
  String.raw`(?<!\b(?:if|whether|unless)\s)\byou(?:'re|\s+are)\s+(?:not\s+)?(?:a\s+|an\s+)?(?:lawful(?:ly)?\s+|legal(?:ly)?\s+)?(?:permanent\s+resident|undocumented|qualified\s+(?:non-?citizen|immigrant|alien)|refugee|asylee|lawfully\s+present|out\s+of\s+status)\b`,
  String.raw`\byour\s+(?:immigration\s+)?status\s+(?:is|will\s+(?:not\s+)?be|won't\s+be)\s+(?:not\s+)?(?:lawful|legal|valid|safe|fine|ok(?:ay)?|protected|affected|at\s+risk|in\s+danger)\b`,
  String.raw`\bpublic\s+charge\b`,
  String.raw`\byou\s+(?:can|could|should|need\s+to|must|may|will)\s+(?:not\s+)?(?:apply\s+for|get|renew|obtain|keep|lose)\s+(?:a\s+|an\s+|your\s+)?(?:visa|green\s+card|work\s+permit|citizenship|asylum|daca)\b`,
  String.raw`\b(?:file|submit|fill\s+out)\s+(?:a\s+|the\s+)?form\s+[IN]-\d`,
  // "You should file with USCIS", not "we check it with USCIS".
  String.raw`\byou\s+(?:can|could|should|need\s+to|must|may|will)\s+(?:not\s+)?(?:file|apply|submit)\b[^.]{0,40}\b(?:with|to)\s+(?:the\s+)?USCIS\b`,
  String.raw`^\s*(?:file|apply|submit)\b(?![^.]{0,40}\b(?:we|they|the\s+state)\b)[^.]{0,40}\b(?:with|to)\s+(?:the\s+)?USCIS\b`,
  String.raw`(?<!\bsi\s)\busted\s+(?:no\s+)?es\s+(?:un\s+|una\s+)?(?:residente\s+permanente|indocumentad[oa]|refugiad[oa]|inmigrante\s+calificad[oa])`,
  // "su estado" alone is "your state"; only "estado migratorio" is a status.
  String.raw`\bsu\s+(?:estatus(?:\s+migratorio)?|estado\s+migratorio)\s+(?:es|será|no\s+será)\s+(?:legal|válido|seguro|afectado)`,
  String.raw`\bcarga\s+pública`,
  String.raw`\b(?:puede|podría|debe|debería|necesita)\s+(?:solicitar|pedir|obtener|renovar)\s+(?:una\s+|la\s+|su\s+)?(?:visa|tarjeta\s+verde|green\s+card|ciudadanía|asilo|permiso\s+de\s+trabajo)`,
  String.raw`\b(?:presente|presentar|llene|llenar)\s+(?:el\s+)?formulario\s+[IN]-\d`,
  String.raw`\bante\s+(?:el\s+)?USCIS\b`,
].map((p) => new RegExp(p, "iu"));

export const IMMIGRATION_FALLBACK =
  "We can't give immigration advice. Call the number on your letter, or find free legal help at justice.gov/eoir.";

export const IMMIGRATION_FALLBACK_ES =
  "No podemos dar asesoría de inmigración. Llame al número de su carta o busque ayuda legal gratuita en justice.gov/eoir.";

// Legal strategy: whether to appeal, which option to pick, what the person "should" do
// about the case (#47). Rights a letter states ("you can ask for a hearing") and its
// instructions ("you must report your hours") stay fine.
const LEGAL_ACTION = String.raw`(?:appeal|ask\s+for\s+a\s+(?:fair\s+)?hearing|request\s+a\s+(?:fair\s+)?hearing|file\s+(?:an\s+appeal|a\s+complaint|a\s+grievance)|sign|accept|reapply|choose|pick|hire\s+a\s+lawyer|get\s+a\s+lawyer)`;
const LEGAL_STRATEGY_PATTERNS: RegExp[] = [
  String.raw`\byou\s+(?:should|ought\s+to|shouldn't|should\s+not)\s+(?:not\s+)?${LEGAL_ACTION}\b`,
  String.raw`\b(?:we|i)\s+(?:recommend|suggest|advise)\b`,
  String.raw`\byour\s+best\s+(?:option|choice|bet|move)\s+is\b`,
  String.raw`\bthe\s+best\s+(?:option|choice)\s+(?:for\s+you\s+)?is\b`,
  String.raw`\bit(?:'s|\s+is|\s+would\s+be)\s+(?:best|better|wise|smart)\s+to\s+${LEGAL_ACTION}\b`,
  String.raw`\b(?:usted\s+)?(?:debería|deberías)\s+(?:no\s+)?(?:apelar|pedir\s+una\s+audiencia|solicitar\s+una\s+audiencia|presentar\s+una\s+(?:apelación|queja)|firmar|aceptar|elegir|escoger|volver\s+a\s+solicitar|contratar\s+a\s+un\s+abogado)`,
  String.raw`\b(?:le|te)\s+(?:recomendamos|recomiendo|aconsejamos|aconsejo|sugerimos|sugiero)\b`,
  String.raw`\b(?:su|tu)\s+mejor\s+opción\s+es\b`,
  String.raw`\blo\s+mejor\s+(?:es|sería)\s+(?:que|apelar|pedir|firmar|aceptar|volver)`,
].map((p) => new RegExp(p, "iu"));

const LEGAL_HELP = "lsc.gov";

export const LEGAL_FALLBACK = `We can't tell you what to do about your case. Call the number on your letter, or find free legal aid at ${LEGAL_HELP}.`;

export const LEGAL_FALLBACK_ES = `No podemos decirle qué hacer con su caso. Llame al número de su carta o busque ayuda legal gratuita en ${LEGAL_HELP}.`;

export const SAFE_FALLBACK =
  "We can't decide if you qualify. Only the state can. Call the number on your letter to ask.";

export const SAFE_FALLBACK_ES =
  "No podemos decidir si usted califica. Solo el estado puede hacerlo. Llame al número que aparece en su carta para preguntar.";

// The text with full-width forms and look-alike letters folded. An invisible character
// (zero-width space, soft hyphen) may sit inside a word or between two words, so each
// text is checked both with it removed and with it read as a space.
function variants(text: string): string[] {
  const folded = text
    .normalize("NFKC")
    .replace(/./gu, (c) => {
      const i = LOOKALIKE_FROM.indexOf(c);
      return i < 0 ? c : LOOKALIKE_TO[i]!;
    })
    .replace(/[’‘]/g, "'");
  return [folded.replace(/\p{Cf}/gu, ""), folded.replace(/\p{Cf}/gu, " ")].map(
    (t) => t.replace(/\s+/g, " "),
  );
}

const findAll = (text: string, patterns: RegExp[]): string[] => {
  const texts = variants(text);
  return [
    ...new Set(
      patterns.flatMap((pattern) =>
        texts.flatMap((t) => {
          const match = t.match(pattern);
          return match ? [match[0]] : [];
        }),
      ),
    ),
  ];
};

// Both languages always: the model may answer in either one.
export const findForbiddenClaims = (text: string): string[] =>
  findAll(text, [...FORBIDDEN_PATTERNS, ...FORBIDDEN_PATTERNS_ES]);

// Text that presents us as a professional, as official or as guaranteed (#50).
export const findSelfDescriptions = (text: string): string[] =>
  findAll(text, SELF_DESCRIPTION_PATTERNS);

export const findHealthCare = (text: string): string[] =>
  findAll(text, HEALTH_CARE_PATTERNS);

export const findImmigrationAdvice = (text: string): string[] =>
  findAll(text, IMMIGRATION_PATTERNS);

export const findLegalStrategy = (text: string): string[] =>
  findAll(text, LEGAL_STRATEGY_PATTERNS);

// Each check with the sentence shown in place of a blocked text. The first hit wins.
const CHECKS: {
  find: (text: string) => string[];
  fallback: { en: string; es: string };
}[] = [
  {
    find: (t) => [...findForbiddenClaims(t), ...findSelfDescriptions(t)],
    fallback: { en: SAFE_FALLBACK, es: SAFE_FALLBACK_ES },
  },
  {
    find: findHealthCare,
    fallback: { en: HEALTH_FALLBACK, es: HEALTH_FALLBACK_ES },
  },
  {
    find: findImmigrationAdvice,
    fallback: { en: IMMIGRATION_FALLBACK, es: IMMIGRATION_FALLBACK_ES },
  },
  {
    find: findLegalStrategy,
    fallback: { en: LEGAL_FALLBACK, es: LEGAL_FALLBACK_ES },
  },
];

export function enforceGuardrail(
  text: string,
  locale: "en" | "es" = "en",
): {
  text: string;
  blocked: boolean;
} {
  const hit = CHECKS.find((check) => check.find(text).length > 0);
  return hit
    ? { text: hit.fallback[locale], blocked: true }
    : { text, blocked: false };
}
