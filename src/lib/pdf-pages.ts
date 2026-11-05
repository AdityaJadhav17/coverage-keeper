import { inflateSync } from "node:zlib";

// Name tokens may hide behind #xx escapes and comments (PDF 1.7 §7.2.3, §7.3.5).
const PAGE = /\/Type(?:\s|%[^\r\n]*[\r\n])*\/Page(?![A-Za-z0-9#])/g;
const COUNT = /\/Count\s+(\d+)/g;
const STREAM = /(?<!end)stream\r?\n/g;
const INFLATE_BUDGET = 16 * 1024 * 1024;

const unescape = (s: string) =>
  s.replace(/#([0-9a-fA-F]{2})/g, (_, h: string) =>
    String.fromCharCode(parseInt(h, 16)),
  );

// Pages the model would be billed for, or null when we can't be sure (security audit M1).
// The larger of the page tree's /Count and the page objects, including those inside
// Flate object streams; an object stream in any other filter makes it give up.
// shortcut: a byte scan, not a PDF parser, and it can over-count (old revisions), so the
// cap sits well above real letters (the longest eval letter is 14 pages).
export function pdfPageCount(data: Uint8Array): number | null {
  const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  const raw = buf.toString("latin1");
  const texts = [unescape(raw)];
  let budget = INFLATE_BUDGET;
  for (const m of raw.matchAll(STREAM)) {
    const head = unescape(raw.slice(raw.lastIndexOf(" obj", m.index), m.index));
    if (!/\/Type\s*\/ObjStm\b/.test(head)) continue;
    if (!/\/Filter\s*\/FlateDecode\b/.test(head)) return null;
    const start = m.index + m[0].length;
    const end = raw.indexOf("endstream", start);
    try {
      const out = inflateSync(buf.subarray(start, end < 0 ? buf.length : end), {
        maxOutputLength: budget,
      });
      budget -= out.length;
      texts.push(unescape(out.toString("latin1")));
    } catch {
      return null; // corrupt, or past the budget
    }
  }
  const objects = texts.reduce((n, t) => n + (t.match(PAGE)?.length ?? 0), 0);
  const declared = texts.flatMap((t) =>
    [...t.matchAll(COUNT)].map((m) => Number(m[1])),
  );
  const pages = Math.max(objects, ...declared);
  return pages > 0 ? pages : null;
}
