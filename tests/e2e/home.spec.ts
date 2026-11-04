import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page shows the product and who to call, with no serious a11y issues", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Coverage Keeper" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "800-699-9075" })).toBeVisible();

  // Screen fade-ins would otherwise be measured at half opacity.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("welcome screen leads with the outcome and states what we are", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Got a letter about your health coverage?",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start with my letter" }),
  ).toBeVisible();
  await expect(
    page.getByText("About a minute · No sign-up · Free"),
  ).toBeVisible();
  await expect(page.getByText("We don't save your photo.")).toBeVisible();
  await expect(page.getByText("Not run by any state agency.")).toBeVisible();
  await expect(page.getByRole("list", { name: "How it works" })).toContainText(
    "What to send",
  );
});
