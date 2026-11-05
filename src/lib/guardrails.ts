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

// Cyrillic and Greek letters that look Latin, so "еligible" can't pass for "eligible".
const LOOKALIKE_FROM = "аеорсухіјѕԁԛԝАВЕКМНОРСТХІЈЅοαικνρτυχΑΒΕΖΗΙΚΜΝΟΡΤΥΧ";
const LOOKALIKE_TO = "aeopcyxijsdqwABEKMHOPCTXIJSoaikvptuxABEZHIKMNOPTYX";

export const SAFE_FALLBACK =
  "We can't decide if you qualify. Only the state can. Call the number on your letter to ask.";

export const SAFE_FALLBACK_ES =
  "No podemos decidir si usted califica. Solo el estado puede hacerlo. Llame al número que aparece en su carta para preguntar.";

export function findForbiddenClaims(text: string): string[] {
  // Fold full-width forms and look-alike letters.
  const folded = text
    .normalize("NFKC")
    .replace(/./gu, (c) => {
      const i = LOOKALIKE_FROM.indexOf(c);
      return i < 0 ? c : LOOKALIKE_TO[i]!;
    })
    .replace(/[’‘]/g, "'");
  // An invisible character (zero-width space, soft hyphen) may sit inside a word or
  // between two words, so check it both removed and read as a space.
  const variants = [
    folded.replace(/\p{Cf}/gu, ""),
    folded.replace(/\p{Cf}/gu, " "),
  ].map((t) => t.replace(/\s+/g, " "));
  // Both languages always: the model may answer in either one.
  const claims = [...FORBIDDEN_PATTERNS, ...FORBIDDEN_PATTERNS_ES].flatMap(
    (pattern) =>
      variants.flatMap((t) => {
        const match = t.match(pattern);
        return match ? [match[0]] : [];
      }),
  );
  return [...new Set(claims)];
}

export function enforceGuardrail(
  text: string,
  locale: "en" | "es" = "en",
): {
  text: string;
  blocked: boolean;
} {
  return findForbiddenClaims(text).length > 0
    ? {
        text: locale === "es" ? SAFE_FALLBACK_ES : SAFE_FALLBACK,
        blocked: true,
      }
    : { text, blocked: false };
}
