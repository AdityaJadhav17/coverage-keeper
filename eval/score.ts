import { existsSync } from "node:fs";
import path from "node:path";
import { phoneHref } from "../src/lib/phone";

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

// Same number: the first 10-digit US number in each (null = no number).
export function phoneMatches(
  expected: string | null,
  actual: string | null,
): boolean {
  const dial = (s: string | null) => (s === null ? null : phoneHref(s));
  return dial(expected) === dial(actual);
}

export function pageMatches(
  expected: number | null,
  actual: number | null,
): boolean {
  return expected === actual;
}

const MONTHS: Record<string, number> = {};
[
  "january february march april may june july august september october november december",
  "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre",
].forEach((names) =>
  names.split(" ").forEach((m, i) => {
    MONTHS[m] = i + 1;
    MONTHS[m.slice(0, 3)] = i + 1;
  }),
);
const MONTH = Object.keys(MONTHS).join("|");
// "February 15, 2027", "Feb. 15 2027", "15 de febrero de 2027", "02/15/2027", "2027-02-15".
const DATE = new RegExp(
  [
    `\\b(?<m1>${MONTH})\\.?\\s+(?<d1>\\d{1,2})(?:st|nd|rd|th)?,?\\s+(?<y1>\\d{4})`,
    `\\b(?<d2>\\d{1,2})\\s+de\\s+(?<m2>${MONTH})\\s+(?:de|del)?\\s*(?<y2>\\d{4})`,
    `\\b(?<m3>\\d{1,2})/(?<d3>\\d{1,2})/(?<y3>\\d{4})`,
    `\\b(?<y4>\\d{4})-(?<m4>\\d{2})-(?<d4>\\d{2})`,
  ].join("|"),
  "gi",
);

// Dates as ISO strings, and the text with the dates taken out.
function splitDates(text: string): { dates: Set<string>; words: string } {
  const dates = new Set<string>();
  const words = text.replace(DATE, (...args) => {
    const g = args.at(-1) as Record<string, string | undefined>;
    const y = g.y1 ?? g.y2 ?? g.y3 ?? g.y4;
    const m = g.m1 ?? g.m2 ?? g.m3 ?? g.m4 ?? "";
    const d = g.d1 ?? g.d2 ?? g.d3 ?? g.d4;
    const month = MONTHS[m.toLowerCase()] ?? Number(m);
    dates.add(`${y}-${String(month).padStart(2, "0")}-${d?.padStart(2, "0")}`);
    return " ";
  });
  return { dates, words };
}

// The label's words all appear in the output, and its date appears in any common format.
export function quoteMatches(
  expected: string | null,
  actual: string | null,
): boolean {
  if (expected === null || actual === null) return expected === actual;
  const e = splitDates(expected);
  const a = splitDates(actual);
  const words = tokens(a.words);
  return (
    [...e.dates].every((d) => a.dates.has(d)) &&
    [...tokens(e.words)].every((t) => words.has(t))
  );
}

// Files a label lists that aren't on disk; the runner stops on any before calling the model.
export function missingFiles(
  labels: { id: string; file?: string; files?: string[] }[],
  dir = "eval/letters",
): string[] {
  return labels.flatMap((l) =>
    (l.files ?? (l.file ? [l.file] : []))
      .filter((f) => !existsSync(path.join(dir, f)))
      .map((f) => `${l.id}: ${f}`),
  );
}

// "N of M" per group, e.g. per category or per state.
export function groupCounts<R>(
  rows: R[],
  groups: (r: R) => string[],
  correct: (r: R) => boolean,
): Record<string, { correct: number; total: number }> {
  const out: Record<string, { correct: number; total: number }> = {};
  for (const r of rows)
    for (const g of groups(r)) {
      out[g] ??= { correct: 0, total: 0 };
      out[g].total++;
      if (correct(r)) out[g].correct++;
    }
  return out;
}
