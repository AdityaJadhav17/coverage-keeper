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

// A letter with no phone of its own, so the call bar shows the state's (US-084).
async function toScreening(page: Page) {
  await page.route("**/api/read", (route) =>
    route.fulfill({ json: { ...fixture, contact_phone: null } }),
  );
  await page.clock.setFixedTime(new Date("2027-02-10T10:00:00-08:00"));
  await page.goto("/");
  await page.getByRole("button", { name: "Start with my letter" }).click();
  await page.getByLabel("Scan my letter").setInputFiles(PNG);
  await expect(page.locator(".callbar")).toContainText(
    "the number on your letter",
  );
  await page.getByRole("button", { name: "Check exemptions" }).click();
  return page.getByLabel("State that sent this letter");
}

async function expectNoSeriousA11yIssues(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
}

test("California shows Medi-Cal's questions; switching to Washington swaps questions and phone (US-080, US-082)", async ({
  page,
}) => {
  const state = await toScreening(page);
  await expect(page.getByRole("group")).toHaveCount(0);

  await state.selectOption("CA");
  await expect(page.getByText(/Some Medi-Cal members/)).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Are you 18 or younger?" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "800-541-5555" })).toBeVisible();
  await expect(page.getByText(/\bOHP\b|Oregon Health/)).toHaveCount(0);
  await expectNoSeriousA11yIssues(page);

  await state.selectOption("WA");
  await expect(
    page.getByRole("group", { name: "Are you under 19?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Are you 18 or younger?" }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "800-562-3022" })).toBeVisible();

  await page
    .getByRole("group", { name: "Are you under 19?" })
    .getByLabel("Yes")
    .check();
  await page.getByRole("button", { name: "See what may apply" }).click();
  await expect(page.getByTestId("may-apply")).toContainText(
    "This may apply to you. Ask Apple Health (Medicaid) about it.",
  );
  await expect(
    page.getByRole("link", {
      name: "Source: Washington State Health Care Authority",
    }),
  ).toHaveAttribute("href", /hca\.wa\.gov/);
});

test("Nevada has no published list yet, so it shows who to call instead of questions (US-083)", async ({
  page,
}) => {
  const state = await toScreening(page);
  await state.selectOption("NV");
  await expect(page.getByTestId("pending")).toContainText(
    "Nevada hasn't published its list of exemptions yet. Call Nevada Medicaid at 702-631-3310",
  );
  await expect(page.getByRole("group")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "See what may apply" }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "702-631-3310" })).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});

test("another state gets the coverage note and no Oregon number (US-085)", async ({
  page,
}) => {
  const state = await toScreening(page);
  await state.selectOption("other");
  await expect(
    page.getByText(
      "This check covers Washington, Oregon, California, Nevada and Arizona.",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(page.getByRole("group")).toHaveCount(0);
  await expect(page.getByText("800-699-9075")).toHaveCount(0);
  await expectNoSeriousA11yIssues(page);
});

test("the state chosen on the result screen carries into the exemption check", async ({
  page,
}) => {
  await page.route("**/api/read", (route) => route.fulfill({ json: fixture }));
  await page.goto("/");
  await page.getByRole("button", { name: "Start with my letter" }).click();
  await page.getByLabel("Scan my letter").setInputFiles(PNG);
  await page.getByLabel("State that sent this letter").selectOption("CA");
  await page.getByRole("button", { name: "Check exemptions" }).click();
  await expect(page.getByLabel("State that sent this letter")).toHaveValue(
    "CA",
  );
  await expect(
    page.getByRole("group", { name: "Are you 18 or younger?" }),
  ).toBeVisible();
});
