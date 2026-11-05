import { expect, it } from "vitest";
import { findForbiddenClaims } from "@/lib/guardrails";
import { letterReaderSystemPrompt, PROMPT_VERSION } from "./letter-reader";

const en = letterReaderSystemPrompt("en");
const es = letterReaderSystemPrompt("es");

it("matches the golden prompts (bump PROMPT_VERSION when this snapshot changes)", () => {
  expect({ PROMPT_VERSION, en, es }).toMatchSnapshot();
});

it("contains no eligibility claims itself", () => {
  expect(findForbiddenClaims(en)).toEqual([]);
  expect(findForbiddenClaims(es)).toEqual([]);
});

it("asks for the sending state and isn't written for Oregon only", () => {
  expect(PROMPT_VERSION).toBe("5");
  expect(en).toContain("state:");
  for (const program of [
    "Apple Health",
    "OHP",
    "Medi-Cal",
    "Nevada Medicaid",
    "AHCCCS",
  ])
    expect(en).toContain(program);
  const [firstLine] = en.split(/\r?\n/);
  expect(firstLine).not.toContain("Oregon");
});

it("Spanish adds one line and changes nothing else (US-061)", () => {
  expect(letterReaderSystemPrompt()).toBe(en);
  expect(es.startsWith(en)).toBe(true);
  const added = es.slice(en.length);
  expect(added.trim().split("\n")).toHaveLength(1);
  expect(added).toContain(
    "Write summary, required_action and documents in Spanish",
  );
  expect(added).toContain("Keep deadline_quote exactly as printed");
});

it("reads whole letters and asks where the deadline is (US-070, US-074)", () => {
  expect(en).toContain("photos or PDFs of");
  expect(en).toContain("deadline_page:");
});
