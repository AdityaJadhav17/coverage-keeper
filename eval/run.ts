import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { findForbiddenClaims } from "../src/lib/guardrails";
import {
  MODEL_ID,
  readLetter,
  type LetterImage,
  type LetterInput,
} from "../src/lib/letter-reader";
import { PROMPT_VERSION } from "../src/prompts/letter-reader";
import {
  deadlineMatches,
  deadlineSplit,
  documentScores,
  groupCounts,
  missingFiles,
  pageMatches,
  phoneMatches,
  quoteMatches,
  textMatches,
} from "./score";

// `file` for one image or PDF; `files` for a letter photographed page by page.
type Label = {
  id: string;
  file?: string;
  files?: string[];
  split: "dev" | "test";
  state: "WA" | "OR" | "CA" | "NV" | "AZ" | "other";
  notice_type: string;
  deadline: string | null;
  deadline_quote: string | null;
  deadline_page: number | null;
  required_action: string | null;
  documents: string[];
  contact_phone: string | null;
  category: string[];
};

const MEDIA_TYPES: Record<string, LetterImage["mediaType"]> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const splitArg = process.argv.indexOf("--split");
const split = splitArg > -1 ? process.argv[splitArg + 1] : undefined;
const langArg = process.argv.includes("--lang")
  ? process.argv[process.argv.indexOf("--lang") + 1]
  : "en";
if (langArg !== "en" && langArg !== "es") {
  console.error(`--lang must be "en" or "es", got "${langArg}"`);
  process.exit(1);
}
const lang: "en" | "es" = langArg;
// Labels are English, so Spanish runs can't score the free-text fields.
const textScored = lang === "en";

const labels: Label[] = JSON.parse(await readFile("eval/labels.json", "utf8"));
// --match <text>: only letters whose id contains it, e.g. "-es" for the Spanish ones.
const matchArg = process.argv.indexOf("--match");
const match = matchArg > -1 ? process.argv[matchArg + 1] : undefined;
// --category <name>: only letters labeled with that category.
const categoryArg = process.argv.indexOf("--category");
const category = categoryArg > -1 ? process.argv[categoryArg + 1] : undefined;
const selected = labels.filter(
  (l) =>
    (!split || l.split === split) &&
    (!match || l.id.includes(match)) &&
    (!category || l.category.includes(category)),
);
if (selected.length === 0) {
  console.error(
    `No labeled letters for split "${split ?? "all"}". Add entries to eval/labels.json.`,
  );
  process.exit(1);
}
// A letter with a missing page must never be scored on the pages that exist.
const missing = missingFiles(selected);
if (missing.length > 0) {
  console.error(
    `Missing letter files, no model call made:\n${missing.join("\n")}`,
  );
  process.exit(1);
}

const read = (file: string) =>
  readFile(path.join("eval/letters", file)).then((b) => b.toString("base64"));

// A PDF alone is read as a PDF; otherwise every file is a page photo, in order.
async function letterInput(label: Label): Promise<LetterInput> {
  const files = label.files ?? (label.file ? [label.file] : []);
  const [only] = files;
  if (only && files.length === 1 && path.extname(only).toLowerCase() === ".pdf")
    return { kind: "pdf", base64: await read(only) };
  const images: LetterImage[] = [];
  for (const file of files) {
    const mediaType = MEDIA_TYPES[path.extname(file).toLowerCase()];
    if (!mediaType)
      throw new Error(
        `${label.id}: ${file} must be an image, or a single PDF on its own`,
      );
    images.push({ mediaType, base64: await read(file) });
  }
  if (images.length === 0) throw new Error(`${label.id}: no file listed`);
  return { kind: "images", images };
}

const rows = [];
for (const label of selected) {
  try {
    const out = await readLetter(await letterInput(label), { lang });
    const docs = documentScores(label.documents, out.documents);
    rows.push({
      id: label.id,
      split: label.split,
      // Exact: "other" matches only "other", and null ("can't tell") never matches.
      state: label.state === out.state,
      notice_type: label.notice_type === out.notice_type,
      deadline: deadlineMatches(label.deadline, out.deadline),
      required_action: textMatches(label.required_action, out.required_action),
      phone: phoneMatches(label.contact_phone, out.contact_phone),
      quote: quoteMatches(label.deadline_quote, out.deadline_quote),
      page: pageMatches(label.deadline_page, out.deadline_page),
      category: label.category,
      doc_recall: docs.recall,
      doc_precision: docs.precision,
      guardrail_hits: findForbiddenClaims(
        `${out.summary} ${out.required_action ?? ""}`,
      ).length,
      expected_deadline: label.deadline,
      actual_deadline: out.deadline,
      expected_state: label.state,
      actual_state: out.state,
      expected_phone: label.contact_phone,
      actual_phone: out.contact_phone,
      expected_page: label.deadline_page,
      actual_page: out.deadline_page,
      error: null as string | null,
    });
  } catch (err) {
    rows.push({ id: label.id, split: label.split, error: String(err) });
  }
}

const ok = rows.filter((r) => !r.error) as Extract<
  (typeof rows)[number],
  { deadline: boolean }
>[];
type Check =
  | "state"
  | "notice_type"
  | "deadline"
  | "required_action"
  | "phone"
  | "quote"
  | "page";
const count = (key: Check) => ok.filter((r) => r[key]).length;
const fraction = ({ correct, total }: { correct: number; total: number }) =>
  `${correct} of ${total}`;
// One row per group: deadline, notice type and required action as N of M.
const groupTable = (
  title: string,
  groups: (r: (typeof ok)[number]) => string[],
) => {
  const checks: Check[] = textScored
    ? ["deadline", "notice_type", "required_action"]
    : ["deadline", "notice_type"];
  const counts = checks.map((c) => groupCounts(ok, groups, (r) => r[c]));
  return [
    `## By ${title}`,
    "",
    `| ${title} | ${checks.join(" | ")} |`,
    `| --- |${checks.map(() => " --- |").join("")}`,
    ...Object.keys(counts[0]!)
      .sort()
      .map(
        (g) => `| ${g} | ${counts.map((c) => fraction(c[g]!)).join(" | ")} |`,
      ),
    "",
  ];
};
const mean = (key: "doc_recall" | "doc_precision") =>
  ok.length ? ok.reduce((s, r) => s + r[key], 0) / ok.length : 0;

const dl = deadlineSplit(
  ok.map((r) => ({ expected: r.expected_deadline, correct: r.deadline })),
);

const summary = {
  run_at: new Date().toISOString(),
  model: MODEL_ID,
  prompt_version: PROMPT_VERSION,
  split: split ?? "all",
  lang,
  letters: rows.length,
  errors: rows.length - ok.length,
  deadline_correct: count("deadline"),
  deadline_printed: dl.printed,
  deadline_none: dl.none,
  state_correct: count("state"),
  notice_type_correct: count("notice_type"),
  required_action_correct: count("required_action"),
  contact_phone_correct: count("phone"),
  deadline_quote_correct: count("quote"),
  deadline_page_correct: count("page"),
  category: category ?? "all",
  doc_recall_mean: mean("doc_recall"),
  doc_precision_mean: mean("doc_precision"),
  guardrail_hits: ok.reduce((s, r) => s + r.guardrail_hits, 0),
};

const md = [
  `# Eval results (${summary.split}, ${lang})`,
  "",
  `Model \`${summary.model}\`, prompt v${summary.prompt_version}, run ${summary.run_at}`,
  "",
  "| Metric | Result |",
  "| --- | --- |",
  `| Printed deadline read correctly | ${dl.printed.correct} of ${dl.printed.total} |`,
  `| No deadline correctly reported as none | ${dl.none.correct} of ${dl.none.total} |`,
  `| State identified | ${summary.state_correct} of ${rows.length} |`,
  `| Notice type correct | ${summary.notice_type_correct} of ${rows.length} |`,
  `| Contact phone correct | ${summary.contact_phone_correct} of ${rows.length} |`,
  `| Deadline page correct | ${summary.deadline_page_correct} of ${rows.length} |`,
  ...(textScored
    ? [
        `| Required action correct | ${summary.required_action_correct} of ${rows.length} |`,
        `| Deadline quote correct | ${summary.deadline_quote_correct} of ${rows.length} |`,
        `| Document recall (mean) | ${summary.doc_recall_mean.toFixed(2)} |`,
        `| Document precision (mean) | ${summary.doc_precision_mean.toFixed(2)} |`,
      ]
    : [
        "| Required action, documents, deadline quote | not scored (English labels) |",
      ]),
  `| Guardrail hits | ${summary.guardrail_hits} |`,
  `| Errors | ${summary.errors} |`,
  "",
  ...groupTable("category", (r) => r.category),
  ...groupTable("state", (r) => [r.expected_state]),
  "## Per letter",
  "",
  ...rows.map((r) =>
    r.error
      ? `- ${r.id}: ERROR ${r.error}`
      : `- ${r.id}: deadline ${r.deadline ? "ok" : `FAIL (expected ${r.expected_deadline}, got ${r.actual_deadline})`}; state ${r.state ? "ok" : `FAIL (expected ${r.expected_state}, got ${r.actual_state})`}; phone ${r.phone ? "ok" : `FAIL (expected ${r.expected_phone}, got ${r.actual_phone})`}; page ${r.page ? "ok" : `FAIL (expected ${r.expected_page}, got ${r.actual_page})`}${textScored ? `; quote ${r.quote ? "ok" : "FAIL"}` : ""}`,
  ),
].join("\n");

await mkdir("eval/results", { recursive: true });
await writeFile(
  `eval/results/${summary.run_at.replace(/[:.]/g, "-")}.json`,
  JSON.stringify({ summary, rows }, null, 2),
);
await writeFile("eval/results/latest.md", md + "\n");
console.log(md);
if (summary.errors > 0 || summary.guardrail_hits > 0) process.exit(1);
