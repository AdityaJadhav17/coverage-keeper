import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const app = path.join(__dirname, "..", "..", "src", "app");
const read = (f: string) => readFileSync(path.join(app, f), "utf8");
const css = read("globals.css");

function rule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] ?? "";
}

const rem = (decl: string) => {
  const m = decl.match(/font-size:\s*([\d.]+)rem/);
  return m ? Number(m[1]) : NaN;
};

describe("welcome screen text size (spec: body never below 17px)", () => {
  it.each([".assure", ".smallprint"])("%s is at least 1.0625rem", (sel) => {
    expect(rem(rule(sel))).toBeGreaterThanOrEqual(1.0625);
  });

  it.each([".path li", ".effort"])("%s is at least 1rem", (sel) => {
    expect(rem(rule(sel))).toBeGreaterThanOrEqual(1);
  });
});

describe("no single state's branding outside #18's scope", () => {
  it("notice labels and the not-a-letter screen don't say OHP or Oregon", () => {
    const text = `${read("components/shared.ts")}\n${read("components/Result.tsx")}`;
    expect(text).not.toMatch(/\bOHP\b|Oregon/);
  });
});

describe("status colors (spec: alert is for 'date has passed' only)", () => {
  it("'Due today' uses the neutral badge, not the alert colors", () => {
    expect(css).not.toMatch(/\.badge\.today[\s,]/);
  });
});

describe("logo mark in dark mode", () => {
  it("outlines the square with the accent so it shows on a dark page", () => {
    expect(read("components/BrandMark.tsx")).toMatch(
      /<rect[^>]*stroke="var\(--ink\)"/,
    );
  });
});

describe("fonts", () => {
  it("loads only the serif weight headings use (700)", () => {
    expect(read("layout.tsx")).toMatch(
      /Source_Serif_4\(\{\s*weight: \["700"\]/,
    );
  });
});
