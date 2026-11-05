export const MAX_PAGES = 10;
// A PDF is billed per page; real letters run longer than 10 (one eval letter is 14).
export const MAX_PDF_PAGES = 20;
// One read's files together; Vercel's function body limit is about 4.5 MB.
export const MAX_LETTER_BYTES = 4 * 1024 * 1024;

export type Collected =
  | { kind: "images"; files: File[]; skipped: number }
  | { kind: "pdf"; file: File; skipped: number }
  | {
      kind: "error";
      code: "onePdf" | "pdfAndPhotos" | "notPhotos" | "empty";
    };

// Turns picked or dropped files into up to 10 images or one PDF (US-070 to US-073).
// Codes, not text: the UI words them. Real bytes are checked on the server (US-075).
export function collectFiles(files: File[]): Collected {
  if (files.length === 0) return { kind: "error", code: "empty" };
  const pdfs = files.filter((f) => f.type === "application/pdf");
  const images = files
    .filter((f) => f.type.startsWith("image/"))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const others = files.length - pdfs.length - images.length;

  if (pdfs.length > 0 && images.length > 0)
    return { kind: "error", code: "pdfAndPhotos" };
  if (pdfs.length > 1) return { kind: "error", code: "onePdf" };
  const [pdf] = pdfs;
  if (pdf) return { kind: "pdf", file: pdf, skipped: others };
  if (images.length === 0) return { kind: "error", code: "notPhotos" };
  return {
    kind: "images",
    files: images.slice(0, MAX_PAGES),
    skipped: others + Math.max(0, images.length - MAX_PAGES),
  };
}
