// Rewrites the tables at the top of eval/COVERAGE.md from eval/labels.json.
// Everything from the "## Why a target is unmet" heading down is kept as written.
// Run: npx tsx scripts/coverage.ts
import { readFileSync, writeFileSync } from "node:fs";

type Label = {
  id: string;
  state: string;
  category: string[];
  source_kind: string;
};

// A letter counts once: its -full PDF and phone photos are the same letter.
const isCopy = (id: string) => /-(full|photo)$/.test(id);

export function coverageTables(labels: Label[]) {
  const letters = labels.filter((l) => !isCopy(l.id));
  const gov = letters.filter((l) => l.source_kind === "gov_sample");
  const cell = (n: number, target: number) =>
    `${n} of ${target}${n >= target ? "" : " (unmet, see below)"}`;
  const states = ["WA", "OR", "CA", "NV", "AZ"].map((s) => {
    const mine = gov.filter((l) => l.state === s);
    const es = mine.filter((l) => l.category.includes("spanish_letter")).length;
    return `| ${s} | ${cell(mine.length - es, 3)} | ${cell(es, 1)} |`;
  });
  const cats = [
    "renewal",
    "work_requirements",
    "request_for_information",
    "coverage_ending",
    "immigration",
    "deadline_on_later_page",
    "phone_photo",
    "not_medicaid",
  ].map((c) => {
    // Phone photos are copies by id, so count every entry for that one.
    const pool = c === "phone_photo" ? labels : letters;
    const n = pool.filter((l) => l.category.includes(c)).length;
    return `| \`${c}\` | ${cell(n, 2)} |`;
  });
  return [
    "## Per state (public samples only)",
    "",
    "| State | English letters (target 3) | Spanish letters (target 1) |",
    "| --- | --- | --- |",
    ...states,
    "",
    "## Per category (all letters, synthetic included)",
    "",
    "| Category | Letters (target 2) |",
    "| --- | --- |",
    ...cats,
    "",
  ].join("\n");
}

if (process.argv[1]?.endsWith("coverage.ts")) {
  const path = "eval/COVERAGE.md";
  const text = readFileSync(path, "utf8");
  const start = text.indexOf("## Per state");
  const rest = text.indexOf("## Why a target is unmet");
  const labels: Label[] = JSON.parse(readFileSync("eval/labels.json", "utf8"));
  writeFileSync(
    path,
    text.slice(0, start) + coverageTables(labels) + "\n" + text.slice(rest),
  );
}
