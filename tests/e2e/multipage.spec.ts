import { readFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const fixture = JSON.parse(
  readFileSync("tests/fixtures/reader/synthetic-work-requirement.json", "utf8"),
);
const DIR = "tests/e2e/fixtures";
const file = (name: string) => path.join(DIR, name);
// Each synthetic page is one flat color, so we can tell pages apart after the JPEG re-encode.
const COLORS = {
  "page-1": [240, 240, 230],
  "page-2": [220, 235, 225],
  "page-3": [235, 225, 215],
} as const;

type Part = { name: string; filename?: string; body: Buffer };
type RawPart = { name: string; filename?: string; body: string };

// Records each read's form fields as the app built them; Playwright's captured
// request body leaves out file contents in some browsers.
function recordReads() {
  const w = window as unknown as { __sent: RawPart[][] };
  w.__sent = [];
  const original = window.fetch;
  window.fetch = async (input, init) => {
    if (String(input).includes("/api/read") && init?.body instanceof FormData) {
      const read: RawPart[] = [];
      for (const [name, value] of init.body.entries()) {
        if (typeof value === "string") {
          read.push({ name, body: btoa(value) });
          continue;
        }
        let bin = "";
        for (const b of new Uint8Array(await value.arrayBuffer()))
          bin += String.fromCharCode(b);
        read.push({ name, filename: value.name, body: btoa(bin) });
      }
      w.__sent.push(read);
    }
    return original(input, init);
  };
}

// Which synthetic page each sent JPEG is, by its center pixel.
async function pageNames(page: Page, images: Part[]) {
  const rgbs = await page.evaluate(
    (b64s) =>
      Promise.all(
        b64s.map(async (b64) => {
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const bmp = await createImageBitmap(new Blob([bytes]));
          // A DOM canvas: Playwright's Windows WebKit has no OffscreenCanvas.
          const canvas = Object.assign(document.createElement("canvas"), {
            width: bmp.width,
            height: bmp.height,
          });
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(bmp, 0, 0);
          const d = ctx.getImageData(bmp.width >> 1, bmp.height >> 1, 1, 1);
          return [...d.data.slice(0, 3)];
        }),
      ),
    images.map((p) => p.body.toString("base64")),
  );
  const dist = (a: readonly number[], b: readonly number[]) =>
    a.reduce((sum, v, i) => sum + (v - b[i]!) ** 2, 0);
  return rgbs.map(
    (rgb) =>
      Object.entries(COLORS).sort(
        ([, a], [, b]) => dist(rgb, a) - dist(rgb, b),
      )[0]![0],
  );
}

async function mockReader(page: Page, body: object = fixture) {
  await page.addInitScript(recordReads);
  await page.route("**/api/read", (route) => route.fulfill({ json: body }));
  return async (): Promise<Part[][]> =>
    (
      await page.evaluate(
        () => (window as unknown as { __sent: RawPart[][] }).__sent,
      )
    ).map((read) =>
      read.map((p) => ({ ...p, body: Buffer.from(p.body, "base64") })),
    );
}

async function start(page: Page, button = "Start with my letter") {
  await page.clock.setFixedTime(new Date("2027-02-10T10:00:00-08:00"));
  await page.goto("/");
  await page.getByRole("button", { name: button }).click();
}

const tray = (page: Page) => page.locator(".tray li");
const images = (p: Part[]) => p.filter((x) => x.name === "image");
const lang = (p: Part[]) => p.find((x) => x.name === "lang")?.body.toString();

async function expectNoSeriousA11yIssues(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
}

test("pick 3 pages, remove one, and read the rest in order (US-070)", async ({
  page,
}) => {
  const sent = await mockReader(page);
  await start(page);
  await page
    .getByLabel("Choose photos or a PDF")
    .setInputFiles(["page-3.png", "page-1.png", "page-2.png"].map(file));
  await expect(tray(page)).toHaveCount(3);
  await expect(page.getByRole("img", { name: "Page 3" })).toBeVisible();
  await expectNoSeriousA11yIssues(page);

  await page.getByRole("button", { name: "Remove page 2" }).click();
  await expect(tray(page)).toHaveCount(2);
  await page.getByRole("button", { name: "Read my letter (2 pages)" }).click();
  await expect(
    page.getByRole("heading", { name: "Here's what your letter says" }),
  ).toBeVisible();

  expect(await sent()).toHaveLength(1);
  const sentImages = images((await sent())[0]!);
  expect(sentImages.map((p) => p.filename)).toEqual([
    "page-1.jpg",
    "page-2.jpg",
  ]);
  expect(await pageNames(page, sentImages)).toEqual(["page-1", "page-3"]);
  expect(lang((await sent())[0]!)).toBe("en");
});

test("one photo, then add another page with the camera button (US-070)", async ({
  page,
}) => {
  const sent = await mockReader(page);
  await start(page);
  await page.getByLabel("Scan my letter").setInputFiles(file("page-1.png"));
  await expect(tray(page)).toHaveCount(1);
  await page.getByLabel("Add another page").setInputFiles(file("page-2.png"));
  await expect(tray(page)).toHaveCount(2);
  await page.getByRole("button", { name: "Read my letter (2 pages)" }).click();
  await expect(page.getByTestId("deadline")).toBeVisible();
  expect(await pageNames(page, images((await sent())[0]!))).toEqual([
    "page-1",
    "page-2",
  ]);
});

test("a PDF is sent whole, as one part (US-071)", async ({ page }) => {
  const sent = await mockReader(page);
  await start(page);
  await page
    .getByLabel("Choose photos or a PDF")
    .setInputFiles(file("letter.pdf"));
  await expect(tray(page)).toHaveText(["letter.pdf"]);
  await expect(page.getByLabel("Add another page")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Read my letter", exact: true })
    .click();
  await expect(page.getByTestId("deadline")).toBeVisible();
  const [only] = await sent();
  expect(only!.filter((p) => p.name === "pdf")).toHaveLength(1);
  expect(images(only!)).toHaveLength(0);
  expect(only!.find((p) => p.name === "pdf")!.body.toString("latin1")).toMatch(
    /^%PDF-/,
  );
});

test("a PDF and a photo together are refused, nothing sent", async ({
  page,
}) => {
  const sent = await mockReader(page);
  await start(page);
  await page
    .getByLabel("Choose photos or a PDF")
    .setInputFiles([file("letter.pdf"), file("page-1.png")]);
  await expect(page.locator(".alert")).toHaveText(
    "Use photos or one PDF, not both.",
  );
  await expect(tray(page)).toHaveCount(0);
  expect(await sent()).toHaveLength(0);
});

test("shows which page the deadline is on (US-074)", async ({ page }) => {
  await mockReader(page, { ...fixture, deadline_page: 3 });
  await start(page);
  await page
    .getByLabel("Choose photos or a PDF")
    .setInputFiles(["page-1.png", "page-2.png", "page-3.png"].map(file));
  await page.getByRole("button", { name: "Read my letter (3 pages)" }).click();
  await expect(page.getByTestId("deadline")).toContainText("From page 3");
  await expectNoSeriousA11yIssues(page);
});

test("a deadline on page 1 doesn't name the page, even in a PDF", async ({
  page,
}) => {
  await mockReader(page, { ...fixture, deadline_page: 1 });
  await start(page);
  await page
    .getByLabel("Choose photos or a PDF")
    .setInputFiles(file("letter.pdf"));
  await page.getByRole("button", { name: /Read my letter/ }).click();
  await expect(page.getByTestId("deadline")).toBeVisible();
  await expect(page.getByText("From page")).toHaveCount(0);
});

test("a language switch re-reads every page", async ({ page }) => {
  const sent = await mockReader(page);
  await start(page);
  await page
    .getByLabel("Choose photos or a PDF")
    .setInputFiles(["page-1.png", "page-2.png"].map(file));
  await page.getByRole("button", { name: "Read my letter (2 pages)" }).click();
  await expect(page.getByTestId("deadline")).toBeVisible();
  await page.getByRole("button", { name: "Español" }).click();
  await expect(
    page.getByRole("heading", { name: "Esto es lo que dice su carta" }),
  ).toBeVisible();
  expect(await sent()).toHaveLength(2);
  expect(lang((await sent())[1]!)).toBe("es");
  expect(await pageNames(page, images((await sent())[1]!))).toEqual([
    "page-1",
    "page-2",
  ]);
});

test.describe("phones and tablets", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "laptop");
  });

  test("don't show the folder picker or drop area (US-073)", async ({
    page,
  }) => {
    await start(page);
    await expect(page.getByLabel("Scan my letter")).toBeAttached();
    await expect(page.getByLabel("Choose a folder")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Drag your letter here/ }),
    ).toHaveCount(0);
  });
});

test.describe("laptop", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "laptop");
  });

  test("a folder adds its photos in file-name order and skips the rest (US-073)", async ({
    page,
  }) => {
    const sent = await mockReader(page);
    await start(page);
    await page.getByLabel("Choose a folder").setInputFiles(file("folder"));
    await expect(tray(page)).toHaveCount(3);
    await expect(page.locator(".alert")).toHaveText(
      "Skipped 1 file. We read up to 10 photos or one PDF.",
    );
    await page
      .getByRole("button", { name: "Read my letter (3 pages)" })
      .click();
    await expect(page.getByTestId("deadline")).toBeVisible();
    // page-2 before page-10 (natural order); page-10 is the third color.
    expect(await pageNames(page, images((await sent())[0]!))).toEqual([
      "page-1",
      "page-2",
      "page-3",
    ]);
  });

  test("drag and drop adds pages like picked files (US-072)", async ({
    page,
  }) => {
    await mockReader(page);
    await start(page);
    const drop = page.getByRole("button", { name: /Drag your letter here/ });
    const png = readFileSync(file("page-1.png")).toString("base64");
    const dataTransfer = await page.evaluateHandle((b64) => {
      const dt = new DataTransfer();
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      dt.items.add(new File([bytes], "a.png", { type: "image/png" }));
      dt.items.add(new File([bytes], "b.png", { type: "image/png" }));
      dt.items.add(new File(["x"], "notes.docx", { type: "" }));
      return dt;
    }, png);
    await drop.dispatchEvent("dragover", { dataTransfer });
    await drop.dispatchEvent("drop", { dataTransfer });
    await expect(tray(page)).toHaveCount(2);
    await expect(page.locator(".alert")).toContainText("Skipped 1 file.");
    // Still keyboard reachable while pages are in the tray.
    await drop.focus();
    await expect(drop).toBeFocused();
    await expectNoSeriousA11yIssues(page);
  });
});

test.describe("in Spanish", () => {
  test.use({ locale: "es-ES" });

  test("tray and errors are in Spanish, and the read asks for Spanish (US-061)", async ({
    page,
  }) => {
    const sent = await mockReader(page);
    await start(page, "Empezar con mi carta");
    await page
      .getByLabel("Elegir fotos o un PDF")
      .setInputFiles([file("letter.pdf"), file("page-1.png")]);
    await expect(page.locator(".alert")).toHaveText(
      "Use fotos o un solo PDF, no ambos.",
    );
    await page
      .getByLabel("Elegir fotos o un PDF")
      .setInputFiles(["page-1.png", "page-2.png"].map(file));
    await expect(page.getByRole("img", { name: "Página 2" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Quitar la página 1" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Leer mi carta (2 páginas)" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Esto es lo que dice su carta" }),
    ).toBeVisible();
    expect(lang((await sent())[0]!)).toBe("es");
    expect(images((await sent())[0]!)).toHaveLength(2);
  });
});
