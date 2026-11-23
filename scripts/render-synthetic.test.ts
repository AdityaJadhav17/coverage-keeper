import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BANNER } from "./render-synthetic";

const labels: { id: string; file?: string; files?: string[] }[] = JSON.parse(
  readFileSync("eval/labels.json", "utf8"),
);
const synthetic = labels.filter((l) => l.id.startsWith("syn-"));

describe("synthetic letters", () => {
  it("has the 10 planned cases", () => {
    expect(synthetic).toHaveLength(10);
  });

  it("prints the banner in at least 14 px text", () => {
    const css = readFileSync("eval/synthetic/letter.css", "utf8");
    const size = css.match(/\.banner\s*{[^}]*font-size:\s*(\d+)px/)?.[1];
    expect(Number(size)).toBeGreaterThanOrEqual(14);
  });

  it.each(synthetic.map((l) => [l.id, l] as const))("%s", (id, l) => {
    const html = readFileSync(`eval/synthetic/${id}.html`, "utf8");
    // Every page carries the banner, so no page can pass for an agency letter.
    const pages = html.match(/class="page"/g)?.length ?? 0;
    const banners = html.split(BANNER).length - 1;
    expect(pages).toBeGreaterThan(0);
    expect(banners).toBe(pages);
    expect(html).not.toMatch(/<img[^>]*logo/i);
    const files = l.files ?? [l.file!];
    expect(files).toHaveLength(pages);
    for (const f of files)
      expect(existsSync(`eval/letters/${f}`), f).toBe(true);
  });
});
