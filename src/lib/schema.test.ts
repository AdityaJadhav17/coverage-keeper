import { expect, it } from "vitest";
import fixture from "../../tests/fixtures/reader/synthetic-work-requirement.json";
import { LetterExtraction } from "./schema";

it("accepts the recorded reader fixture", () => {
  expect(LetterExtraction.safeParse(fixture).success).toBe(true);
});

it.each([
  ["unknown notice type", { notice_type: "eligible" }],
  ["non-ISO deadline", { deadline: "02/15/2027" }],
  ["bad confidence", { confidence: "certain" }],
  ["documents not a list", { documents: "Pay stubs" }],
  ["a state outside the list", { state: "TX" }],
  ["a missing state", { state: undefined }],
  ["deadline page 0", { deadline_page: 0 }],
  ["a fractional deadline page", { deadline_page: 1.5 }],
  ["a missing deadline page", { deadline_page: undefined }],
])("rejects %s", (_, patch) => {
  expect(LetterExtraction.safeParse({ ...fixture, ...patch }).success).toBe(
    false,
  );
});

it.each(["WA", "OR", "CA", "NV", "AZ", "other", null])(
  "accepts state %j",
  (state) => {
    expect(LetterExtraction.safeParse({ ...fixture, state }).success).toBe(
      true,
    );
  },
);

it.each([1, 3, null])("accepts deadline page %j", (deadline_page) => {
  expect(
    LetterExtraction.safeParse({ ...fixture, deadline_page }).success,
  ).toBe(true);
});
