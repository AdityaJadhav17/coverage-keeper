import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const app = path.join(__dirname, "..", "..", "src", "app");
const css = readFileSync(path.join(app, "globals.css"), "utf8");

it("keeps only functional icons (camera, phone)", () => {
  const icons = [...css.matchAll(/--icon-([\w-]+):/g)].map((m) => m[1]);
  expect(icons.sort()).toEqual(["camera", "phone"]);
});

it("uses the evergreen and marigold logo mark for the site icon", () => {
  const icon = readFileSync(path.join(app, "icon.svg"), "utf8").toLowerCase();
  expect(icon).toContain("#1f5c4a");
  expect(icon).toContain("#ffd166");
});

it("shows the logo mark in the page header", () => {
  const page = readFileSync(path.join(app, "page.tsx"), "utf8");
  expect(page).toMatch(/<h1 className="brand">\s*<BrandMark \/>/);
});
