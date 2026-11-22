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

  it("counts a page once when an edited PDF repeats it in later revisions", () => {
    const page = "3 0 obj << /Type /Page >> endobj\n%%EOF\n";
    expect(pdfPageCount(enc(`%PDF-1.7\n${page}${page}${page}`))).toBe(1);
  });

  it("reads object numbers from a real object stream header (/First)", () => {
    const objects = "<< /Type /Page >> << /Type /Page >> << /Type /Page >>";
    const header = "3 0 4 18 5 36 ";
    const body = deflateSync(header + objects);
    const stream = (n: number) =>
      join(
        `${n} 0 obj << /Type /ObjStm /N 3 /First ${header.length} /Filter /FlateDecode >> stream\n`,
        body,
        "\nendstream endobj\n",
      );
    // The same three pages, saved twice.
    expect(
      pdfPageCount(join("%PDF-1.7\n", stream(9), stream(10), "%%EOF")),
    ).toBe(3);
  });

  it("ignores /Count outside the page tree, such as bookmarks", () => {
    const outline = "20 0 obj << /Type /Outlines /Count 8 >> endobj\n";
    expect(pdfPageCount(enc(`%PDF-1.7\n${pages(2)}${outline}%%EOF`))).toBe(2);
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

  // Page counts from pdfinfo. Several of these were saved more than once.
  it.each([
    ["or-med005-eligibility-full.pdf", 14],
    ["or-open-card-move-full.pdf", 4],
    ["or-outreach-work-rules-full.pdf", 3],
    ["vt-201p-review-reminder-full.pdf", 3],
    ["vt-202med-review-reminder-full.pdf", 4],
    ["vt-205ifar-renew-full.pdf", 2],
    ["vt-ee307-renewal-ending-full.pdf", 5],
    ["vt-ee312-immigration-closure-full.pdf", 6],
    ["vt-ee415-work-heads-up-full.pdf", 5],
    ["vt-re005ep-renewal-decision-full.pdf", 4],
    ["wa-ee009-renewal-action-full.pdf", 12],
  ])("counts the real letter %s exactly", (file, real) => {
    const n = pdfPageCount(readFileSync(`eval/letters/${file}`));
    expect(n).toBe(real);
    expect(n).toBeLessThanOrEqual(MAX_PDF_PAGES);
  });
});

// One upload must not pin the server: every scan stays linear in the file size.
// Before the fix the first two took about 170 s and 80 s at this size.
describe("pdfPageCount finishes fast on hostile files", () => {
  const MB = 1024 * 1024;
  const fill = (unit: string, bytes: number) =>
    enc("%PDF-1.7\n" + unit.repeat(Math.ceil(bytes / unit.length)));

  it.each([
    ["objects that never end", fill("1 0 obj ", 4 * MB)],
    ["streams with no object before them", fill("stream\n", 4 * MB)],
    [
      "object streams that never end",
      enc(
        "%PDF-1.7\n9 0 obj << /Type /ObjStm /Filter /FlateDecode >> " +
          "stream\n".repeat((4 * MB) / 7),
      ),
    ],
    ["comments that never end", fill("/Type%", 4 * MB)],
    ["one long run of digits", fill("1", 4 * MB)],
    [
      "an offset table that points every object at the whole stream",
      objStm(
        deflateSync(
          enc("1 0 1 00262144 ".repeat(MB / 15) + "/Type ".repeat(MB / 6)),
        ),
        `/FlateDecode /First ${Math.floor(MB / 15) * 15}`,
      ),
    ],
    [
      "names inside a run of comments, in an object",
      enc(
        "%PDF-1.7\n1 0 obj /Type" + "%/Type\n".repeat((4 * MB) / 7) + " endobj",
      ),
    ],
    ["names inside a run of comments, no object", fill("%/Type\n", 4 * MB)],
    ["escaped bytes before every stream", fill("#41stream\n", 4 * MB)],
    [
      "a tiny object stream that inflates to a run of comments",
      objStm(
        deflateSync(enc("1 0 /Type" + "%/Type\n".repeat((8 * MB) / 7))),
        "/FlateDecode /First 4",
      ),
    ],
    [
      "one long run of spaces between numbers",
      fill("1" + " ".repeat(4096), 4 * MB),
    ],
    [
      "many streams before one far endstream",
      enc(
        "%PDF-1.7\n" +
          "9 0 obj << /Type /ObjStm /Filter /FlateDecode >> stream\n".repeat(
            20_000,
          ) +
          "x".repeat(2 * MB) +
          "endstream endobj",
      ),
    ],
  ])("%s", (_, data) => {
    const started = performance.now();
    pdfPageCount(data);
    // These took 80 s to hours before; 10 s leaves room for a slow CI runner.
    expect(performance.now() - started).toBeLessThan(10_000);
  });

  it("still counts pages that sit after an object with no endobj", () => {
    // The unterminated object swallows nothing: the real file ends each object.
    const data = enc(
      `%PDF-1.7\n2 0 obj << /Type /Pages /Count 3 >> endobj\n${pages(3)}99 0 obj << /Broken`,
    );
    expect(pdfPageCount(data)).toBe(3);
  });

  // Pages must not be hidden from the count: each file has 30 pages behind a /Count 1.
  const root = "%PDF-1.7\n2 0 obj << /Type /Pages /Count 1 >> endobj\n";
  const hidden = (page: (i: number) => string) =>
    enc(
      root + Array.from({ length: 30 }, (_, i) => page(i)).join("") + "%%EOF",
    );

  it('counts pages whose dictionary has a name containing "endobj"', () => {
    expect(
      pdfPageCount(
        hidden((i) => `${i + 3} 0 obj << /A /xendobj /Type /Page >> endobj\n`),
      ),
    ).toBe(30);
  });

  it.each([
    [
      "a comment longer than we read",
      (i: number) =>
        `${i + 3} 0 obj << /Type %${"x".repeat(201)}\n/Page >> endobj\n`,
    ],
    [
      "more comments in a row than we read",
      (i: number) =>
        `${i + 3} 0 obj << /Type ${"%c\n".repeat(5)}/Page >> endobj\n`,
    ],
    [
      "object numbers too long to tell apart",
      (i: number) => `${i + 3}0000000001 0 obj << /Type /Page >> endobj\n`,
    ],
  ])("gives up on %s", (_, page) => {
    expect(pdfPageCount(hidden(page))).toBeNull();
  });

  it("gives up on an object stream whose offsets are out of order", () => {
    const table = "5 20 6 0 ";
    const body = deflateSync(
      enc(table + "<< /Type /Page >>".padEnd(20) + "<< /Type /Page >>"),
    );
    expect(
      pdfPageCount(objStm(body, `/FlateDecode /First ${table.length}`)),
    ).toBeNull();
  });
});
