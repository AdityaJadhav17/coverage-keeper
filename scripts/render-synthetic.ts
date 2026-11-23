// Renders eval/synthetic/<id>.html to PNGs in eval/letters/synthetic/, one per page.
// Run: npx tsx scripts/render-synthetic.ts (all syn- letters) or with ids as arguments.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

export const BANNER = "SYNTHETIC TEST LETTER - NOT FROM ANY AGENCY";

// Returns the PNG paths, relative to eval/letters/, in page order.
export async function renderSynthetic(id: string): Promise<string[]> {
  const browser = await chromium.launch();
  try {
    // US letter at 96 dpi, scaled to about the 145 dpi of the public samples.
    const page = await browser.newPage({
      viewport: { width: 816, height: 1056 },
      deviceScaleFactor: 1.5,
    });
    await page.goto(
      pathToFileURL(path.resolve(`eval/synthetic/${id}.html`)).href,
    );
    const pages = await page.locator("section.page").all();
    const files = pages.map((_, i) =>
      pages.length === 1
        ? `synthetic/${id}.png`
        : `synthetic/${id}-${i + 1}.png`,
    );
    for (const [i, section] of pages.entries())
      await section.screenshot({ path: `eval/letters/${files[i]}` });
    return files;
  } finally {
    await browser.close();
  }
}

if (process.argv[1]?.endsWith("render-synthetic.ts")) {
  const ids = process.argv.slice(2);
  const all = (
    JSON.parse(readFileSync("eval/labels.json", "utf8")) as { id: string }[]
  )
    .map((l) => l.id)
    .filter((id) => id.startsWith("syn-"));
  for (const id of ids.length ? ids : all)
    console.log(id, (await renderSynthetic(id)).join(", "));
}
