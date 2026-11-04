// Phrases that state or deny eligibility. The app may describe what a letter asks for,
// never whether the user qualifies (ADR-0005).
// "if you qualify" / "whether you are eligible" are questions, not claims.
const NOT_A_QUESTION = String.raw`(?<!\b(?:if|whether)\s)`;
const FORBIDDEN_PATTERNS: RegExp[] = [
  String.raw`\byou(?:'re|\s+are)\s+(?:not\s+)?(?:eligible|ineligible|exempt|approved|qualified)\b`,
  String.raw`\byou\s+(?:do\s+not\s+|don't\s+|will\s+not\s+|won't\s+)?qualify\b`,
  String.raw`\byou\s+will\s+(?:not\s+)?(?:be\s+)?(?:approved|denied|covered|eligible|exempt)\b`,
  String.raw`\byou\s+(?:are|'re)\s+(?:not\s+)?(?:going\s+to\s+)?(?:keep|lose)\s+(?:your\s+)?coverage\b`,
].map((p) => new RegExp(NOT_A_QUESTION + p, "i"));

// Spanish (US-064). "si (usted) califica" / "si usted es elegible" are questions, not claims.
const NOT_A_QUESTION_ES = String.raw`(?<!\bsi\s+(?:usted\s+|tú\s+)?)`;
const FORBIDDEN_PATTERNS_ES: RegExp[] = [
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:es|eres|está|esta|estás|estas)\s+(?:elegible|inelegible|exent[oa]|aprobad[oa]|calificad[oa])\b`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?califica(?:s)?\b`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:será|serás)\s+(?:aprobad[oa]|elegible|exent[oa])\b`,
  String.raw`\b(?:usted\s+|tú\s+)?(?:no\s+)?(?:va|vas)\s+a\s+(?:mantener|perder)\s+(?:su|tu)\s+cobertura\b`,
].map((p) => new RegExp(NOT_A_QUESTION_ES + p, "iu"));

export const SAFE_FALLBACK =
  "We can't decide if you qualify. Only the state can. Call OHP at 800-699-9075 to ask.";

export const SAFE_FALLBACK_ES =
  "No podemos decidir si usted califica. Solo el estado puede hacerlo. Llame a OHP al 800-699-9075 para preguntar.";

export function findForbiddenClaims(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").replace(/[’‘]/g, "'");
  // Both languages always: the model may answer in either one.
  return [...FORBIDDEN_PATTERNS, ...FORBIDDEN_PATTERNS_ES].flatMap(
    (pattern) => {
      const match = normalized.match(pattern);
      return match ? [match[0]] : [];
    },
  );
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
