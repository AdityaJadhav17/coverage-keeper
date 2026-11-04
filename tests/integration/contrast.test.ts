import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  path.join(__dirname, "..", "..", "src", "app", "globals.css"),
  "utf8",
);

function tokens(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
      m[1]!,
      m[2]!.toLowerCase(),
    ]),
  );
}

const light = tokens(css.slice(0, css.indexOf("@media")));
const dark = {
  ...light,
  ...tokens(
    css.match(/@media \(prefers-color-scheme: dark\) \{([\s\S]*?)\n\}/)![1]!,
  ),
};

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

// [foreground, background, minimum ratio] per WCAG 2.2 AA.
const PAIRS: [string, string, number][] = [
  ["text", "paper", 4.5],
  ["text", "surface", 4.5],
  ["text", "surface-raised", 4.5],
  ["muted", "paper", 4.5],
  ["muted", "surface", 4.5],
  ["on-ink", "ink", 4.5],
  ["ink", "paper", 4.5],
  ["ink", "surface", 4.5],
  ["ink", "primary-soft", 4.5],
  ["urgent", "urgent-bg", 4.5],
  ["urgent", "surface-raised", 4.5],
  ["mark-text", "mark", 4.5],
  ["focus", "paper", 3],
  ["focus", "surface", 3],
];

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme colors meet WCAG AA", (_, theme) => {
  it.each(PAIRS)("--%s on --%s is at least %s:1", (fg, bg, min) => {
    expect(theme[fg], `--${fg} is defined`).toBeDefined();
    expect(theme[bg], `--${bg} is defined`).toBeDefined();
    expect(contrast(theme[fg]!, theme[bg]!)).toBeGreaterThanOrEqual(min);
  });
});
