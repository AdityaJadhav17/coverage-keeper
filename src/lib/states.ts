import az from "../../data/rules/az.json";
import ca from "../../data/rules/ca.json";
import nv from "../../data/rules/nv.json";
import or from "../../data/rules/or.json";
import wa from "../../data/rules/wa.json";

export type StateCode = "WA" | "OR" | "CA" | "NV" | "AZ";

// One file per state in data/rules/; every fact comes from the agency's own .gov page,
// or a site of the agency's that its .gov page links to (source_linked_from).
export type StateRules = {
  state: StateCode;
  status: "published" | "pending";
  program: string;
  agency: string;
  // source_url and retrieved are set when the number is printed on a different page
  // than the rules (#53).
  contact: {
    name: string;
    phone: string;
    source_url?: string;
    retrieved?: string;
  };
  source_url: string;
  // Set when source_url is the agency's own non-.gov site: the .gov page that links to it.
  source_linked_from?: string;
  source_updated?: string;
  retrieved: string;
  pending_note?: string;
  applies_to?: string;
  applies_to_es?: string;
  ways_to_meet?: { id: string; text: string; text_es?: string }[];
  exemptions?: { id: string; question: string; question_es?: string }[];
};

export const STATE_CODES: StateCode[] = ["WA", "OR", "CA", "NV", "AZ"];

// "other" is any state outside the list (US-085).
export type Region = StateCode | "other";

const RULES = { WA: wa, OR: or, CA: ca, NV: nv, AZ: az } as Record<
  StateCode,
  StateRules
>;

export function stateRules(code: StateCode): StateRules {
  return RULES[code];
}

const DAY_MS = 86_400_000;

// Rules older than 60 days get a "may have changed" note on screen.
export function isStale(rules: StateRules, now: Date): boolean {
  const retrieved = Date.parse(`${rules.retrieved}T00:00:00Z`);
  return (
    Number.isNaN(retrieved) ||
    Math.floor((now.getTime() - retrieved) / DAY_MS) > 60
  );
}
