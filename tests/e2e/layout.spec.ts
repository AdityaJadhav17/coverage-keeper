import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const fixture = JSON.parse(
  readFileSync("tests/fixtures/reader/synthetic-work-requirement.json", "utf8"),
);
const PNG = {
  name: "letter.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  ),
};

// Layout checks for wide screens only; phones keep the v0.1 layout (US-094).
test.beforeEach(({}, info) => {
  test.skip(!["laptop", "tablet"].includes(info.project.name));
});

async function openResult(page: Page) {
  await page.route("**/api/read", (route) => route.fulfill({ json: fixture }));
  await page.clock.setFixedTime(new Date("2027-02-10T10:00:00-08:00"));
  await page.goto("/");
  await page.getByRole("button", { name: "Start with my letter" }).click();
  await page.getByLabel("Scan my letter").setInputFiles(PNG);
  await expect(page.getByTestId("deadline")).toBeVisible();
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
}

const box = async (page: Page, sel: string) =>
  (await page.locator(sel).first().boundingBox())!;

const noSideScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );

test("laptop: due date sits in a right column beside the summary (US-090)", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "laptop");
  await openResult(page);
  const summary = await box(page, "#result-title");
  const deadline = await box(page, '[data-testid="deadline"]');
  expect(deadline.x).toBeGreaterThan(summary.x + summary.width);
  // The notice-type label hugs its text instead of stretching across the column.
  const kind = await box(page, ".kind");
  expect(kind.width).toBeLessThan(summary.width * 0.6);
  expect(await noSideScroll(page)).toBe(true);
});

test("200% zoom on a laptop stacks to one column (US-092)", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "laptop");
  await page.setViewportSize({ width: 640, height: 800 });
  await openResult(page);
  const summary = await box(page, "#result-title");
  const deadline = await box(page, '[data-testid="deadline"]');
  expect(deadline.y).toBeGreaterThan(summary.y);
  expect(Math.abs(deadline.x - summary.x)).toBeLessThan(2);
  expect(await noSideScroll(page)).toBe(true);
});

test("tablet: one readable column, wider than a phone (US-091)", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "tablet");
  await openResult(page);
  const main = await box(page, "main");
  expect(main.width).toBeGreaterThan(560);
  expect(main.width).toBeLessThanOrEqual(752);
  expect(await noSideScroll(page)).toBe(true);
});

test("tablet: exemption questions sit in two columns (US-091)", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "tablet");
  await openResult(page);
  await page.getByRole("button", { name: "Check exemptions" }).click();
  await page.getByLabel("State that sent this letter").selectOption("OR");
  await expect(page.locator("fieldset.question").first()).toBeVisible();
  // Measure after the screen's fade-in, not mid-animation.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
  const [first, second] = await page.locator("fieldset.question").all();
  const a = (await first!.boundingBox())!;
  const b = (await second!.boundingBox())!;
  expect(Math.abs(a.y - b.y)).toBeLessThan(2);
  expect(b.x).toBeGreaterThan(a.x);
});

test("keyboard: every control shows a visible focus ring (US-093)", async ({
  page,
  browserName,
}) => {
  await openResult(page);
  const seen: string[] = [];
  // Tab until focus leaves the page; every stop must show an outline.
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      return {
        name: el.textContent?.trim() || el.getAttribute("type") || el.tagName,
        outline: getComputedStyle(el).outlineStyle,
      };
    });
    if (!stop) break;
    expect(stop.outline, stop.name).not.toBe("none");
    seen.push(stop.name);
  }
  expect(seen).toContain("Check exemptions");
  // Safari skips links on Tab unless the user turns that on; buttons still get focus.
  if (browserName !== "webkit")
    expect(seen.join(" ")).toContain("800-699-9075");
});

test("wide layouts have no serious accessibility issues in light and dark", async ({
  page,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await openResult(page);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, colorScheme).toEqual([]);
  }
});
