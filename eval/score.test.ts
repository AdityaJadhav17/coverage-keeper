import { describe, expect, it } from "vitest";
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

describe("deadlineMatches", () => {
  it.each([
    ["2026-12-15", "2026-12-15", true],
    ["2026-12-15", "2026-12-16", false],
    [null, null, true],
    [null, "2026-12-15", false],
    ["2026-12-15", null, false],
  ] as const)("expected %s vs actual %s -> %s", (expected, actual, result) => {
    expect(deadlineMatches(expected, actual)).toBe(result);
  });
});

describe("textMatches", () => {
  it("matches when all label words appear in the output, ignoring case and stopwords", () => {
    expect(
      textMatches(
        "Report work hours",
        "You need to report your WORK hours for November.",
      ),
    ).toBe(true);
  });

  it("does not match when a label word is missing", () => {
    expect(textMatches("Report work hours", "Send a pay stub.")).toBe(false);
  });

  it("treats null as matching null, or an answer that says nothing is asked", () => {
    expect(textMatches(null, null)).toBe(true);
    expect(textMatches(null, "something")).toBe(false);
    expect(textMatches("Report work hours", null)).toBe(false);
  });

  it.each([
    "No action is required right now.",
    "The letter does not ask you to do anything.",
    "This letter doesn't ask you to send anything.",
    "There is nothing you need to do.",
    "We are not asking you to do anything now.",
  ])("a null label matches %j", (answer) => {
    expect(textMatches(null, answer)).toBe(true);
  });

  it.each([
    "Send proof of income by Feb 15.",
    "Call if the information is wrong. No deadline is printed.",
  ])("a null label does not match a real action: %j", (answer) => {
    expect(textMatches(null, answer)).toBe(false);
  });

  it("a real label is not satisfied by a no-action answer", () => {
    expect(textMatches("Report work hours", "No action is required.")).toBe(
      false,
    );
  });

  it("treats plurals and exception/exemption as the same word", () => {
    expect(textMatches("sign return form", "Sign and return the forms.")).toBe(
      true,
    );
    expect(
      textMatches("check exemptions", "Check the exceptions on the next page."),
    ).toBe(true);
  });
});

describe("documentScores", () => {
  it("scores precision and recall over matched documents", () => {
    expect(
      documentScores(
        ["pay stubs", "class schedule"],
        ["Recent pay stubs", "Photo ID"],
      ),
    ).toEqual({
      precision: 0.5,
      recall: 0.5,
    });
  });

  it("gives full marks when nothing was requested and nothing was returned", () => {
    expect(documentScores([], [])).toEqual({ precision: 1, recall: 1 });
  });

  it("gives zero precision when documents were invented for a letter that requests none", () => {
    expect(documentScores([], ["Photo ID"])).toEqual({
      precision: 0,
      recall: 1,
    });
  });
});

describe("deadlineSplit", () => {
  it("separates printed-date labels from null labels", () => {
    expect(
      deadlineSplit([
        { expected: "2026-01-01", correct: true },
        { expected: "2026-02-01", correct: false },
        { expected: null, correct: true },
      ]),
    ).toEqual({
      printed: { correct: 1, total: 2 },
      none: { correct: 1, total: 1 },
    });
  });
});

describe("phoneMatches", () => {
  it.each([
    ["1-800-699-9075", "(800) 699-9075 TTY 711", true],
    ["800.699.9075 TTY 711", "1-800-699-9075", true],
    ["800-699-9075", "855-899-9600", false],
    ["800-699-9075", null, false],
    [null, "800-699-9075", false],
    [null, null, true],
  ] as const)("%j vs %j -> %s", (expected, actual, result) => {
    expect(phoneMatches(expected, actual)).toBe(result);
  });
});

describe("quoteMatches", () => {
  const label = "Please return your completed form by February 15, 2027.";

  it("matches the same sentence split across two lines", () => {
    expect(
      quoteMatches(
        label,
        "Please return your completed\nform by February 15, 2027.",
      ),
    ).toBe(true);
  });

  it.each([
    "Please return your completed form by Feb 15, 2027.",
    "Please return your completed form by 02/15/2027.",
    "Please return your completed form by 2027-02-15.",
  ])("matches the date in another format: %j", (actual) => {
    expect(quoteMatches(label, actual)).toBe(true);
  });

  it("matches a Spanish date", () => {
    expect(
      quoteMatches(
        "Devuelva el formulario antes del 15 de febrero de 2027.",
        "Devuelva el formulario antes del 15 de febrero de 2027",
      ),
    ).toBe(true);
  });

  it("fails on a different date or a missing word", () => {
    expect(
      quoteMatches(label, "Please return your completed form by Feb 16, 2027."),
    ).toBe(false);
    expect(quoteMatches(label, "Return it by February 15, 2027.")).toBe(false);
  });

  it("treats null as matching only null", () => {
    expect(quoteMatches(null, null)).toBe(true);
    expect(quoteMatches(null, label)).toBe(false);
    expect(quoteMatches(label, null)).toBe(false);
  });
});

describe("pageMatches", () => {
  it.each([
    [3, 3, true],
    [3, 1, false],
    [null, 1, false],
    [null, null, true],
  ] as const)("%s vs %s -> %s", (expected, actual, result) => {
    expect(pageMatches(expected, actual)).toBe(result);
  });
});

describe("missingFiles", () => {
  it("lists a file a label names that isn't on disk", () => {
    expect(
      missingFiles([
        { id: "a", files: ["or-outreach-work-rules.png", "no-such-page.png"] },
        { id: "b", file: "or-outreach-work-rules.png" },
      ]),
    ).toEqual(["a: no-such-page.png"]);
  });
});

describe("groupCounts", () => {
  it("counts N of M per group, a row counting in each of its groups", () => {
    expect(
      groupCounts(
        [
          { g: ["renewal", "multi_page"], ok: true },
          { g: ["renewal"], ok: false },
        ],
        (r) => r.g,
        (r) => r.ok,
      ),
    ).toEqual({
      renewal: { correct: 1, total: 2 },
      multi_page: { correct: 1, total: 1 },
    });
  });
});
