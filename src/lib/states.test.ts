import { expect, it } from "vitest";
import { isStale, stateRules } from "./states";

it("is fresh within 60 days of retrieval", () => {
  const rules = { ...stateRules("OR"), retrieved: "2026-11-03" };
  expect(isStale(rules, new Date("2027-01-02T12:00:00-08:00"))).toBe(false);
});

it("is stale more than 60 days after retrieval", () => {
  const rules = { ...stateRules("OR"), retrieved: "2026-11-03" };
  expect(isStale(rules, new Date("2027-01-03T12:00:00-08:00"))).toBe(true);
});

it("treats an unreadable retrieval date as stale", () => {
  const rules = { ...stateRules("OR"), retrieved: "not a date" };
  expect(isStale(rules, new Date("2026-11-04T12:00:00-08:00"))).toBe(true);
});
