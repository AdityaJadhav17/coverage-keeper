const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "to",
  "for",
  "or",
  "your",
  "you",
  "by",
  "in",
  "on",
  "with",
  "from",
  "that",
  "this",
  "our",
  "us",
]);

// Words the letters use interchangeably; a Spanish letter's "excepciones" reads as
// "exceptions", while the labels say "exemptions".
const SAME_WORD: Record<string, string> = { exception: "exemption" };

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t && !STOPWORDS.has(t))
      // Singular and plural are the same word ("forms" = "form").
      .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t))
      .map((t) => SAME_WORD[t] ?? t),
  );
}

// An answer that says the letter asks for nothing is the same as no answer: both
// match a label of null ("no action"). Defined from the label's meaning, not from
// test outputs: the dev split has no letter that asks for nothing.
const NO_ACTION =
  /\b(?:no action|nothing (?:you need |for you )?to do|(?:does not|doesn't|do not|don't) (?:ask|require|need) you to (?:do|send|take)|(?:is|are) not asking you to)\b/i;

// Match if every meaningful word of the label appears in the model output.
export function textMatches(
  expected: string | null,
  actual: string | null,
): boolean {
  if (expected === null) return actual === null || NO_ACTION.test(actual);
  if (actual === null) return false;
  const actualTokens = tokens(actual);
  return [...tokens(expected)].every((t) => actualTokens.has(t));
}

export function deadlineMatches(
  expected: string | null,
  actual: string | null,
): boolean {
  return expected === actual;
}

export function documentScores(
  expected: string[],
  actual: string[],
): { precision: number; recall: number } {
  const matchedExpected = expected.filter((e) =>
    actual.some((a) => textMatches(e, a)),
  ).length;
  const matchedActual = actual.filter((a) =>
    expected.some((e) => textMatches(e, a)),
  ).length;
  return {
    precision:
      actual.length === 0
        ? expected.length === 0
          ? 1
          : 0
        : matchedActual / actual.length,
    recall: expected.length === 0 ? 1 : matchedExpected / expected.length,
  };
}

// Stage claim uses `printed` (labels that have a date); `none` is reported separately.
export function deadlineSplit(
  rows: { expected: string | null; correct: boolean }[],
) {
  const tally = (group: typeof rows) => ({
    correct: group.filter((r) => r.correct).length,
    total: group.length,
  });
  return {
    printed: tally(rows.filter((r) => r.expected !== null)),
    none: tally(rows.filter((r) => r.expected === null)),
  };
}
