import { describe, expect, it } from "vitest";
import { MAX_PAGES, collectFiles } from "./collect-files";

const img = (name: string) => new File(["x"], name, { type: "image/png" });
const pdf = (name = "letter.pdf") =>
  new File(["x"], name, { type: "application/pdf" });
const other = (name: string, type = "") => new File(["x"], name, { type });
const names = (files: File[]) => files.map((f) => f.name);

describe("collectFiles", () => {
  it("sorts images by natural file-name order", () => {
    const out = collectFiles([
      img("page10.png"),
      img("page2.png"),
      img("page1.png"),
    ]);
    expect(out).toMatchObject({ kind: "images", skipped: 0 });
    if (out.kind !== "images") throw new Error(out.kind);
    expect(names(out.files)).toEqual(["page1.png", "page2.png", "page10.png"]);
  });

  it(`keeps the first ${MAX_PAGES} images and counts the rest as skipped`, () => {
    const files = Array.from({ length: 12 }, (_, i) => img(`p${12 - i}.png`));
    const out = collectFiles(files);
    if (out.kind !== "images") throw new Error(out.kind);
    expect(out.skipped).toBe(2);
    expect(names(out.files)).toEqual(
      Array.from({ length: 10 }, (_, i) => `p${i + 1}.png`),
    );
  });

  it("counts .DS_Store and other non-photo files as skipped", () => {
    const out = collectFiles([
      other(".DS_Store"),
      img("a.png"),
      other(
        "notes.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ]);
    expect(out).toMatchObject({ kind: "images", skipped: 2 });
  });

  it("returns a single PDF, skipping non-photo files", () => {
    const file = pdf();
    expect(collectFiles([file, other(".DS_Store")])).toEqual({
      kind: "pdf",
      file,
      skipped: 1,
    });
  });

  it.each([
    ["two PDFs", [pdf("a.pdf"), pdf("b.pdf")], "onePdf"],
    ["a PDF and a photo", [pdf(), img("a.png")], "pdfAndPhotos"],
    [
      "only non-photo files",
      [other("a.docx"), other("b.txt", "text/plain")],
      "notPhotos",
    ],
    ["nothing", [], "empty"],
  ])("refuses %s", (_label, files, code) => {
    expect(collectFiles(files)).toEqual({ kind: "error", code });
  });
});
