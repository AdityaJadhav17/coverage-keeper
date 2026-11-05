import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { POST } from "@/app/api/read/route";
import { readLetter } from "@/lib/letter-reader";
import { LetterExtraction } from "@/lib/schema";

// Calls through to the real reader (fixture mode) so we can see what it was sent.
vi.mock("@/lib/letter-reader", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/letter-reader")>();
  return { ...real, readLetter: vi.fn(real.readLetter) };
});

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const bytes = (head: number[] | string, size = 16) => {
  const out = new Uint8Array(Math.max(size, head.length));
  out.set(typeof head === "string" ? new TextEncoder().encode(head) : head);
  return out;
};
const png = (name = "a.png", size?: number) =>
  new File([bytes([...PNG_SIG, name.length], size)], name, {
    type: "image/png",
  });
const pdf = (size?: number) =>
  new File([bytes("%PDF-1.7", size)], "letter.pdf", {
    type: "application/pdf",
  });

let ipCount = 0;
// Each request gets its own IP so the shared rate limiter never trips by accident.
const send = (
  parts: { image?: File[]; pdf?: File[] },
  headers: Record<string, string> = {},
) => {
  const form = new FormData();
  for (const f of parts.image ?? []) form.append("image", f);
  for (const f of parts.pdf ?? []) form.append("pdf", f);
  return POST(
    new Request("http://test/api/read", {
      method: "POST",
      body: form,
      headers: { "x-forwarded-for": `198.51.100.${++ipCount}`, ...headers },
    }),
  );
};
const post = (file?: File, headers?: Record<string, string>) =>
  send({ image: file ? [file] : [] }, headers);

const reader = vi.mocked(readLetter);
const MB = 1024 * 1024;

describe("POST /api/read", () => {
  beforeAll(() => {
    process.env.LETTER_READER = "fixture";
  });
  afterAll(() => {
    delete process.env.LETTER_READER;
  });
  beforeEach(() => {
    reader.mockClear();
  });

  it("returns schema-valid JSON in fixture mode", async () => {
    const res = await post(png());
    expect(res.status).toBe(200);
    expect(LetterExtraction.safeParse(await res.json()).success).toBe(true);
  });

  it("rejects a missing image with 400", async () => {
    expect((await post()).status).toBe(400);
  });

  it("rejects a wrong file type with 400 (US-005)", async () => {
    const res = await post(
      new File(["hello"], "a.txt", { type: "text/plain" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/JPEG, PNG or WebP/);
  });

  it("rejects an image over 4 MB with 413 (US-005)", async () => {
    expect((await post(png("a.png", 4 * MB + 1))).status).toBe(413);
  });

  it("rejects a declared body over the limit before reading it", async () => {
    const res = await post(png(), {
      "content-length": String(5 * MB),
    });
    expect(res.status).toBe(413);
  });

  it("limits one client to 10 reads a minute (cost abuse)", async () => {
    const from = (ip: string) => post(png(), { "x-forwarded-for": ip });
    for (let i = 0; i < 10; i++) {
      expect((await from("203.0.113.7")).status).toBe(200);
    }
    const res = await from("203.0.113.7");
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/number on your letter/);
    expect((await from("203.0.113.8")).status).toBe(200);
  });

  describe("whole letters (US-070 to US-075)", () => {
    it("sends every page to the reader in order, in one call", async () => {
      // Names of different lengths give each page a different marker byte.
      const pages = ["1.png", "22.png", "333.png"].map((n) => png(n));
      const res = await send({ image: pages });
      expect(res.status).toBe(200);
      expect(reader).toHaveBeenCalledTimes(1);
      const [input] = reader.mock.calls[0]!;
      if (input.kind !== "images") throw new Error(input.kind);
      const sent = input.images.map((i) => Buffer.from(i.base64, "base64"));
      expect(sent.map((b) => b[8])).toEqual([5, 6, 7]);
      for (const [i, page] of pages.entries())
        expect(sent[i]).toEqual(Buffer.from(await page.arrayBuffer()));
      expect(input.images.every((i) => i.mediaType === "image/png")).toBe(true);
    });

    it("sends one PDF as a PDF", async () => {
      const res = await send({ pdf: [pdf()] });
      expect(res.status).toBe(200);
      expect(reader.mock.calls[0]![0]).toMatchObject({ kind: "pdf" });
    });

    it("uses the type from the bytes, not the declared type", async () => {
      const jpegNamedPng = new File(
        [bytes([0xff, 0xd8, 0xff, 0xe0])],
        "a.png",
        { type: "image/png" },
      );
      expect((await post(jpegNamedPng)).status).toBe(200);
      const [input] = reader.mock.calls[0]!;
      expect(input).toMatchObject({
        kind: "images",
        images: [{ mediaType: "image/jpeg" }],
      });
    });

    it.each([
      ["photos and a PDF together", { image: [png()], pdf: [pdf()] }],
      ["two PDFs", { pdf: [pdf(), pdf()] }],
      [
        "a .png whose bytes are a PDF, sent as a photo",
        {
          image: [
            new File([bytes("%PDF-1.7")], "a.png", { type: "image/png" }),
          ],
        },
      ],
      [
        "a .pdf whose bytes are a photo, sent as a PDF",
        {
          pdf: [
            new File([bytes(PNG_SIG)], "a.pdf", { type: "application/pdf" }),
          ],
        },
      ],
      [
        "text bytes sent as a PDF",
        {
          pdf: [new File(["hello"], "a.pdf", { type: "application/pdf" })],
        },
      ],
    ])("refuses %s with 400, without calling the reader", async (_, parts) => {
      expect((await send(parts)).status).toBe(400);
      expect(reader).not.toHaveBeenCalled();
    });

    it("refuses more than 10 pages", async () => {
      const res = await send({
        image: Array.from({ length: 11 }, (_, i) => png(`p${i}.png`)),
      });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Send up to 10 pages.");
      expect(reader).not.toHaveBeenCalled();
    });

    it("refuses pages that add up to more than 4 MB", async () => {
      const res = await send({
        image: [png("a.png", 2 * MB), png("b.png", 2 * MB + 1)],
      });
      expect(res.status).toBe(413);
      expect(reader).not.toHaveBeenCalled();
    });

    it("refuses a PDF over 4 MB with a plain next step", async () => {
      const res = await send({ pdf: [pdf(4 * MB + 1)] });
      expect(res.status).toBe(413);
      expect((await res.json()).error).toBe(
        "This PDF is too big. Take photos of each page instead.",
      );
    });

    it("counts one read against the rate limit, whatever the page count", async () => {
      const ip = { "x-forwarded-for": "203.0.113.50" };
      const ten = Array.from({ length: 10 }, (_, i) => png(`p${i}.png`));
      for (let i = 0; i < 10; i++)
        expect((await send({ image: ten }, ip)).status).toBe(200);
      expect((await send({ image: [png()] }, ip)).status).toBe(429);
    });
  });
});
