import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { MAX_PDF_PAGES } from "./collect-files";
import { pdfPageCount } from "./pdf-pages";

const enc = (s: string) => new TextEncoder().encode(s);
const join = (...parts: (string | Uint8Array)[]) =>
  Buffer.concat(parts.map((p) => (typeof p === "string" ? enc(p) : p)));

const pages = (n: number, type = "/Type /Page") =>
  Array.from(
    { length: n },
    (_, i) => `${i + 3} 0 obj << ${type} >> endobj\n`,
  ).join("");
const pdf = (n: number, count = n) =>
  enc(
    `%PDF-1.7\n2 0 obj << /Type /Pages /Count ${count} >> endobj\n${pages(n)}%%EOF`,
  );
// Page objects hidden inside a compressed object stream (PDF 1.5+).
const objStm = (body: Uint8Array, filter = "/FlateDecode") =>
  join(
    "%PDF-1.7\n9 0 obj << /Type /ObjStm /Filter ",
    filter,
    " >> stream\n",
    body,
    "\nendstream endobj\n%%EOF",
  );

describe("pdfPageCount (security audit M1)", () => {
  it("counts plain page objects", () => {
    expect(pdfPageCount(pdf(3))).toBe(3);
  });

  it("counts pages inside compressed object streams", () => {
    expect(pdfPageCount(objStm(deflateSync(pages(25))))).toBe(25);
  });

  it("takes the larger of the page tree's /Count and the page objects", () => {
    expect(pdfPageCount(pdf(2, 40))).toBe(40);
    expect(pdfPageCount(pdf(30, 1))).toBe(30);
  });

  it("sees names written with # escapes and comments between tokens", () => {
    expect(pdfPageCount(enc(`%PDF-1.7\n${pages(12, "/Type /P#61ge")}`))).toBe(
      12,
    );
    expect(pdfPageCount(enc(`%PDF-1.7\n${pages(12, "/Type %x\n/Page")}`))).toBe(
      12,
    );
    expect(pdfPageCount(enc("%PDF-1.7\n<< /Type /Pages /C#6funt 50 >>"))).toBe(
      50,
    );
  });

  it("does not count /Pages nodes as pages", () => {
    expect(
      pdfPageCount(
        enc("%PDF-1.7\n<< /Type /Pages /Kids [] >> << /Type /Page >>"),
      ),
    ).toBe(1);
  });

  it.each([
    ["no pages at all", enc("%PDF-1.7\n%%EOF")],
    ["an object stream it cannot decode", objStm(enc("garbage"))],
    [
      "an object stream in another filter",
      objStm(enc("anything"), "/LZWDecode"),
    ],
    [
      "an object stream that inflates past the budget",
      objStm(deflateSync(Buffer.alloc(32 * 1024 * 1024, 0x20))),
    ],
  ])("returns null (cannot be sure) for %s", (_, data) => {
    expect(pdfPageCount(data)).toBeNull();
  });

  it.each([
    ["or-med005-eligibility-full.pdf", 14],
    ["vt-ee307-renewal-ending-full.pdf", 5],
  ])("counts the real letter %s without under-counting", (file, real) => {
    const n = pdfPageCount(readFileSync(`eval/letters/${file}`));
    expect(n).toBeGreaterThanOrEqual(real);
    expect(n).toBeLessThanOrEqual(MAX_PDF_PAGES);
  });
});
