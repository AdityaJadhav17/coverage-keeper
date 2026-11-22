// Phrases that state or deny eligibility. The app may describe what a letter asks for,
// never whether the user qualifies (ADR-0005).
//
// This check fails closed. It also blocks some things a letter rightly says, such as
// "send proof that you are exempt": telling that apart from "we have proof that you are
// eligible" by pattern let real claims through every time it was tried (reviews of
// 2026-11-21). A blocked field is hidden with "check the letter or call", so the cost
// of over-blocking is a missing line, never a wrong one.
//
// Only a question is excused, and only with the word directly before "you":
// "if you qualify", "whether or not you are eligible", "unless you qualify".
const ASKED = String.raw`(?<!\b(?:if|whether|unless)\s(?:or\snot\s)?)`;
// One adverb used to be enough to slip past: "you are no longer eligible".
const SURELY = String.raw`still|now|currently|already|likely|very\slikely|probably|definitely|certainly|clearly|fully|automatically|again|soon|then|always`;
const ADV = String.raw`(?:not|no\slonger|never|${SURELY})`;
const ADVS = String.raw`(?:\s${ADV}){0,2}`;
const STATUS = String.raw`(?:eligible|ineligible|exempt(?:ed)?|approved|qualified|covered|denied|disqualified)`;
const COVERAGE = String.raw`\s(?:your\s)?coverage\b`;

const en = (patterns: string[]) =>
  patterns.map((p) => new RegExp(ASKED + p, "gi"));

const CLAIMS_EN = en([
  String.raw`\byou(?:'re|\sare|\saren't|\sremain)${ADVS}\s${STATUS}\b`,
  String.raw`\byou(?:'ll)?(?:\s(?:do|don't|do\snot|will|will\snot|won't|would|${ADV})){0,3}\squalify\b`,
  String.raw`\byou(?:'ve|\shave)(?:\s${ADV})?\s(?:been\s(?:${ADV}\s)?(?:found\s)?${STATUS}|qualified)\b`,
  String.raw`\byou\s(?:were|got)(?:\s${ADV})?\s(?:found\s)?${STATUS}\b`,
  String.raw`\byou\squalified\b`,
  String.raw`\byou(?:'ve|\shave)?\slost${COVERAGE}`,
  // "show that you meet…" is an instruction and "do you meet…?" a question, not claims.
  String.raw`(?<!\b(?:that|do)\s)\byou\s(?:meet|satisfy)\s(?:all\s)?(?:the\s)?(?:\w+\s)?requirements?\b`,
  // What will happen, good or bad.
  String.raw`\byou(?:'ll|\swill|\swon't)${ADVS}\s(?:be\s)?${STATUS}\b`,
  String.raw`\byou(?:'re|\sare|\saren't)${ADVS}\sgoing\sto\sbe\s${STATUS}\b`,
  String.raw`\byou(?:'re|\sare|\saren't)${ADVS}\s(?:going\sto\s)?(?:keep|lose)${COVERAGE}`,
  String.raw`\byou(?:'ll|\swill)(?:\s(?:${SURELY}))?\skeep${COVERAGE}`,
  String.raw`\byou(?:\swon't|\swill\snot)\slose${COVERAGE}`,
]);

// "You will lose your coverage" alone is a claim. With the reason in the same sentence
// ("If you do not renew by March 1, you will lose your coverage", "Renew by March 1
// or you will lose your coverage") it is the warning the person most needs, so it is
// let through. This excuse covers only these two patterns.
const LOSSES_EN = en([
  String.raw`\byou(?:'ll|\swill)(?:\s(?:${SURELY}))?\s(?:lose|be\slosing)${COVERAGE}`,
  String.raw`\byou(?:\swon't|\swill\snot)\skeep${COVERAGE}`,
]);

// Spanish (US-064). "si (usted) (todavía) califica" and "para saber si su hijo es
// elegible" are questions, not claims.
const ASKED_ES = [
  String.raw`(?<!\bsi\s(?:usted\s|tú\s)?(?:todavía\s|aún\s)?)`,
  String.raw`(?<!\bsi\s(?:su|sus)\s[\p{L}]+\s)`,
].join("");
const STATUS_ES = String.raw`(?:elegible|inelegible|exent[oa]|aprobad[oa]|calificad[oa])`;
const COBERTURA = String.raw`\s(?:su|tu|la)\scobertura\b`;
const SUBJECT = String.raw`(?:usted\s|tú\s)?`;

const es = (patterns: string[]) =>
  patterns.map((p) => new RegExp(ASKED_ES + p, "giu"));

const CLAIMS_ES = es([
  String.raw`\b${SUBJECT}(?:no\s)?(?:es|eres|está|esta|estás|estas)\s(?:(?:ya|todavía|aún|ahora|actualmente)\s)?${STATUS_ES}\b`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:sigue|sigues)\ssiendo\s${STATUS_ES}\b`,
  // Not \b after an accented letter: \b only knows ASCII word characters.
  String.raw`\b${SUBJECT}(?:no\s)?(?:(?:ya|todavía|aún)\s)?(?:califica|calificas|calificó|calificaste|calificará|calificarás)(?![\p{L}\p{N}])`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:(?:ha|has)\ssido|fue|fuiste|quedó|quedaste)\s${STATUS_ES}\b`,
  // "está cubierto" and "fue denegada" also describe services and forms, so these
  // two need the person as the subject.
  String.raw`\b(?:usted|tú)\s(?:no\s)?(?:está|estás)\s(?:(?:ya|todavía|aún|ahora)\s)?cubiert[oa]\b`,
  String.raw`\b(?:usted|tú)\s(?:no\s)?(?:(?:ha|has)\ssido|fue|fuiste)\s(?:denegad[oa]|rechazad[oa])\b`,
  // "demostrar que cumple…" is an instruction and "¿cumple…?" a question, not claims.
  String.raw`(?<!(?:\bque\s|¿)(?:usted\s|tú\s)?)\b${SUBJECT}(?:no\s)?(?:cumple|cumples|reúne|reúnes)\s(?:con\s)?(?:todos\s)?(?:los|el)\srequisitos?\b`,
  // Not "derecho a una audiencia": appeal rights are fine to describe.
  String.raw`\b${SUBJECT}(?:no\s)?tienes?\sderecho\sa\s(?:medicaid|medi-cal|ohp|ahcccs|apple\shealth|(?:la\s|su\s)?cobertura|(?:una\s)?exención|beneficios)`,
  // What will happen, good or bad.
  String.raw`\b${SUBJECT}(?:no\s)?(?:será|serás|quedará|quedarás)\s${STATUS_ES}\b`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:va|vas)\sa\s(?:mantener|conservar)${COBERTURA}`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:va|vas)\sa\sperder\s(?:su|tu)\scobertura\b`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:mantendrá|mantendrás|conservará|conservarás)${COBERTURA}`,
  String.raw`\b${SUBJECT}no\s(?:(?:va|vas)\sa\sperder\sla|perderá\s(?:su|tu|la)|perderás\s(?:su|tu|la))\scobertura\b`,
]);

const LOSSES_ES = es([
  String.raw`(?<!\bno\s)\b${SUBJECT}(?:(?:va|vas)\sa\sperder\sla|perderá\s(?:su|tu|la)|perderás\s(?:su|tu|la))\scobertura\b`,
]);

// The reason for a loss, in the same sentence. "sí" (yes) is not "si" (if), and
// "without a doubt" / "sin duda" is no reason. "or" counts only directly before the
// loss ("Renew by March 1 or you will lose…"), not as in "one or two reasons".
const REASON =
  /\b(?:if|unless|otherwise)\b|\bwithout\s(?!(?:a\s)?(?:doubt|question)\b)|(?<![\p{L}])si\s|(?<![\p{L}])sin\s(?!duda)|\ba\smenos\sque\b|\bde\slo\scontrario\b/iu;
const OR_BEFORE = /(?:\bor|(?<![\p{L}])o)\s$/iu;
// A period inside "Feb. 15" or "5 p.m. on" does not end a sentence. A doubtful break
// keeps the sentence whole, which only ever lets a warning with a reason through.
const SENTENCE_END = /[.!?;]["')\]]*(?=\s+[\p{Lu}¿¡"'(•-]|\s*$)/gu;

// The sentence around position `at`, and where it starts.
function sentenceAt(text: string, at: number): { start: number; text: string } {
  let start = 0;
  for (const m of text.matchAll(SENTENCE_END)) {
    if (m.index >= at) return { start, text: text.slice(start, m.index) };
    start = m.index + m[0].length;
  }
  return { start, text: text.slice(start) };
}

const hasReason = (text: string, at: number) => {
  const sentence = sentenceAt(text, at);
  return (
    REASON.test(sentence.text) || OR_BEFORE.test(text.slice(sentence.start, at))
  );
};

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
  const claims = variants.flatMap((t) => [
    ...[...CLAIMS_EN, ...CLAIMS_ES].flatMap((pattern) =>
      [...t.matchAll(pattern)].map((m) => m[0]),
    ),
    ...[...LOSSES_EN, ...LOSSES_ES].flatMap((pattern) =>
      [...t.matchAll(pattern)]
        .filter((m) => !hasReason(t, m.index))
        .map((m) => m[0]),
    ),
  ]);
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

// Shown in place of a paper we had to hide. A plain pointer back to the letter.
export const HIDDEN_PAPER =
  "One paper on your letter can't be shown here. Check your letter.";
export const HIDDEN_PAPER_ES =
  "No podemos mostrar aquí uno de los papeles de su carta. Revise su carta.";

// A blocked quote or action is left out, so our fallback sentence is never shown as
// the letter's own words. The screen then says "Not sure. Check the letter or call."
export const shownOrNull = (text: string | null): string | null =>
  text && !enforceGuardrail(text).blocked ? text : null;

// A blocked paper keeps its place in the list, so the person knows one is missing.
export const paperOrNotice = (text: string, locale: "en" | "es" = "en") =>
  enforceGuardrail(text).blocked
    ? locale === "es"
      ? HIDDEN_PAPER_ES
      : HIDDEN_PAPER
    : text;
