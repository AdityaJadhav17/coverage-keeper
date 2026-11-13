import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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

test.use({ locale: "es-ES" });

test("a Spanish phone gets the app in Spanish, and can switch to English (US-060)", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "¿Recibió una carta sobre su cobertura de salud?",
    }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: "English" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Got a letter about your health coverage?",
    }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Spanish result and exemption questions (US-061, US-063)", async ({
  page,
}) => {
  await page.route("**/api/read", (route) => route.fulfill({ json: fixture }));
  await page.clock.setFixedTime(new Date("2027-02-10T10:00:00-08:00"));
  await page.goto("/");
  await page.getByRole("button", { name: "Empezar con mi carta" }).click();
  await page.getByLabel("Escanear mi carta").setInputFiles(PNG);
  await page.getByRole("button", { name: /^Leer mi carta/ }).click();
  await expect(page.getByTestId("deadline")).toContainText("Quedan 5 días");
  await expect(
    page.getByRole("heading", { name: "Esto es lo que dice su carta" }),
  ).toBeVisible();
  await expect(page.getByTestId("ai-label")).toHaveText(
    "Escrito por IA. Puede cometer errores. Revise su carta y llame a Oregon Health Plan (OHP).",
  );
  // The quoted line stays exactly as printed on the letter.
  await expect(page.getByTestId("deadline")).toContainText(
    fixture.deadline_quote,
  );
  await page.getByRole("button", { name: "Revisar exenciones" }).click();
  await page.getByLabel("Estado que envió la carta").selectOption("OR");
  await expect(
    page.getByRole("group", { name: "¿Cuida a un niño menor de 14 años?" }),
  ).toBeVisible();
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("switching language translates the letter, and switching back is instant (US-061)", async ({
  page,
}) => {
  const langs: (string | null)[] = [];
  await page.route("**/api/read", async (route) => {
    const body = route.request().postDataBuffer()?.toString("latin1") ?? "";
    const lang = /name="lang"\r\n\r\n(\w+)/.exec(body)?.[1] ?? null;
    langs.push(lang);
    await route.fulfill({
      json: {
        ...fixture,
        summary: lang === "es" ? "Resumen en español." : "Summary in English.",
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Empezar con mi carta" }).click();
  await page.getByLabel("Escanear mi carta").setInputFiles(PNG);
  await page.getByRole("button", { name: /^Leer mi carta/ }).click();
  await expect(page.getByText("Resumen en español.")).toBeVisible();
  expect(langs).toEqual(["es"]);
  // A state the user picked survives the translation.
  await page.getByLabel("Estado que envió la carta").selectOption("WA");

  // The switch re-reads the same photo in English: no extra button to find.
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByText("Summary in English.")).toBeVisible();
  expect(langs).toEqual(["es", "en"]);
  await expect(page.getByLabel("State that sent this letter")).toHaveValue(
    "WA",
  );

  // Back to Spanish comes from memory: no new read.
  await page.getByRole("button", { name: "Español" }).click();
  await expect(page.getByText("Resumen en español.")).toBeVisible();
  expect(langs).toEqual(["es", "en"]);
});
