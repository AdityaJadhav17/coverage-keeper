import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page shows the product and who to call, with no serious a11y issues", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Coverage Keeper" }),
  ).toBeVisible();
  await expect(page.locator(".callbar")).toContainText(
    "Questions? Call the number on your letter",
  );

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

test("consent facts come before the consent button", async ({ page }) => {
  await page.goto("/");
  const order = await page.evaluate(() => {
    const all = [...document.querySelectorAll("section *")];
    const ai = all.findIndex((el) =>
      el.textContent?.startsWith("Free and independent."),
    );
    const save = all.findIndex((el) =>
      el.textContent?.startsWith("We don't save your photo."),
    );
    const button = all.findIndex(
      (el) => el.textContent === "Start with my letter",
    );
    return { ai, save, button };
  });
  expect(order.ai).toBeGreaterThan(-1);
  expect(order.save).toBeGreaterThan(-1);
  expect(order.ai).toBeLessThan(order.button);
  expect(order.save).toBeLessThan(order.button);
});

test("welcome facts are a scannable list with room around the button", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
  const facts = page.getByRole("list", { name: "Before you start" });
  await expect(facts.getByRole("listitem")).toHaveCount(4);
  const list = (await facts.boundingBox())!;
  const button = (await page
    .getByRole("button", { name: "Start with my letter" })
    .boundingBox())!;
  const promise = (await page
    .getByText("Rather talk to a person?")
    .boundingBox())!;
  expect(button.y - (list.y + list.height)).toBeGreaterThanOrEqual(20);
  expect(promise.y - (button.y + button.height)).toBeGreaterThanOrEqual(40);
});
