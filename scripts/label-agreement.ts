// How often two labelers agree, per field, using the same matchers as scoring.
// Run: npx tsx scripts/label-agreement.ts [first.json] [second.json]
import { readFileSync } from "node:fs";
import {
  deadlineMatches,
  documentScores,
  pageMatches,
  phoneMatches,
  quoteMatches,
  textMatches,
} from "../eval/score";

export type Label = {
  id: string;
  state: string;
  notice_type: string;
  deadline: string | null;
  deadline_quote: string | null;
  deadline_page: number | null;
  required_action: string | null;
  documents: string[];
  contact_phone: string | null;
  category: string[];
};

// Each check runs both ways, so neither labeler is treated as the answer key.
const both =
  <T>(same: (x: T, y: T) => boolean) =>
  (x: T, y: T) =>
    same(x, y) && same(y, x);
const sameSet = (x: string[], y: string[]) =>
  x.length === y.length && x.every((v) => y.includes(v));

const FIELDS: Record<string, (a: Label, b: Label) => boolean> = {
  state: (a, b) => a.state === b.state,
  notice_type: (a, b) => a.notice_type === b.notice_type,
  deadline: (a, b) => deadlineMatches(a.deadline, b.deadline),
  deadline_quote: (a, b) =>
    both(quoteMatches)(a.deadline_quote, b.deadline_quote),
  deadline_page: (a, b) => pageMatches(a.deadline_page, b.deadline_page),
  required_action: (a, b) =>
    both(textMatches)(a.required_action, b.required_action),
  documents: (a, b) => {
    const s = documentScores(a.documents, b.documents);
    return s.recall === 1 && s.precision === 1;
  },
  contact_phone: (a, b) => phoneMatches(a.contact_phone, b.contact_phone),
  category: (a, b) => sameSet(a.category, b.category),
};

export function agreement(
  a: Label[],
  b: Label[],
): { field: string; agree: number; total: number; disagreements: string[] }[] {
  const pairs = a.flatMap((x) => {
    const y = b.find((l) => l.id === x.id);
    return y ? [[x, y] as const] : [];
  });
  return Object.entries(FIELDS).map(([field, same]) => {
    const disagreements = pairs
      .filter(([x, y]) => !same(x, y))
      .map(([x]) => x.id);
    return {
      field,
      agree: pairs.length - disagreements.length,
      total: pairs.length,
      disagreements,
    };
  });
}

if (process.argv[1]?.endsWith("label-agreement.ts")) {
  const [first = "eval/labels.json", second = "eval/labels.second.json"] =
    process.argv.slice(2);
  const read = (p: string): Label[] => JSON.parse(readFileSync(p, "utf8"));
  const rows = agreement(read(first), read(second));
  console.log("| Field | Agree | Disagreements |\n| --- | --- | --- |");
  for (const r of rows)
    console.log(
      `| ${r.field} | ${r.agree} of ${r.total} | ${r.disagreements.join(", ") || "none"} |`,
    );
}
