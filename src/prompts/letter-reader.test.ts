import { expect, it } from "vitest";
import { findForbiddenClaims } from "@/lib/guardrails";
import { LETTER_READER_SYSTEM_PROMPT, PROMPT_VERSION } from "./letter-reader";

it("matches the golden prompt (bump PROMPT_VERSION when this snapshot changes)", () => {
  expect({ PROMPT_VERSION, LETTER_READER_SYSTEM_PROMPT }).toMatchSnapshot();
});

it("contains no eligibility claims itself", () => {
  expect(findForbiddenClaims(LETTER_READER_SYSTEM_PROMPT)).toEqual([]);
});

it("asks for the sending state and isn't written for Oregon only", () => {
  expect(PROMPT_VERSION).toBe("3");
  expect(LETTER_READER_SYSTEM_PROMPT).toContain("state:");
  for (const program of [
    "Apple Health",
    "OHP",
    "Medi-Cal",
    "Nevada Medicaid",
    "AHCCCS",
  ])
    expect(LETTER_READER_SYSTEM_PROMPT).toContain(program);
  const [firstLine] = LETTER_READER_SYSTEM_PROMPT.split(/\r?\n/);
  expect(firstLine).not.toContain("Oregon");
});
