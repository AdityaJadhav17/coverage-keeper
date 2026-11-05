import { inflateSync } from "node:zlib";

// Name tokens may hide behind #xx escapes and comments (PDF 1.7 §7.2.3, §7.3.5).
const PAGE = /\/Type(?:\s|%[^\r\n]*[\r\n])*\/Page(?![A-Za-z0-9#])/;
const PAGES = /\/Type(?:\s|%[^\r\n]*[\r\n])*\/Pages(?![A-Za-z0-9#])/;
const COUNT = /\/Count\s+(\d+)/;
const OBJECT = /(\d+)\s+\d+\s+obj\b([\s\S]*?)\bendobj\b/g;
const STREAM = /(?<!end)stream\r?\n/g;
const INFLATE_BUDGET = 16 * 1024 * 1024;

const unescape = (s: string) =>
  s.replace(/#([0-9a-fA-F]{2})/g, (_, h: string) =>
    String.fromCharCode(parseInt(h, 16)),
  );

type Found = { pages: Set<string>; counts: number[] };

// One object: a page adds its number (an edited PDF repeats objects under the same
// number in each saved revision), and a page tree node adds its /Count. /Count on
// anything else, such as bookmarks, is not a page count.
function scan(num: string, body: string, found: Found) {
  if (PAGE.test(body)) found.pages.add(num);
  else if (PAGES.test(body)) {
    const count = COUNT.exec(body);
    if (count) found.counts.push(Number(count[1]));
  }
}

// Objects in a compressed object stream: "num offset" pairs, then the objects (§7.5.7).
function scanStream(head: string, text: string, found: Found) {
  const first = Number(/\/First\s+(\d+)/.exec(head)?.[1]);
  if (!Number.isFinite(first)) {
    for (const m of text.matchAll(OBJECT)) scan(m[1]!, m[2]!, found);
    return;
  }
  const pairs = text.slice(0, first).trim().split(/\s+/).map(Number);
  for (let i = 0; i + 1 < pairs.length; i += 2)
    scan(
      String(pairs[i]),
      text.slice(first + pairs[i + 1]!, first + (pairs[i + 3] ?? text.length)),
      found,
    );
}

// Pages the model would be billed for, or null when we can't be sure (security audit M1).
// The larger of the page trees' /Count and the distinct page objects, including those
// inside Flate object streams; an object stream in any other filter makes it give up.
// shortcut: a byte scan, not a PDF parser; deleted pages from old revisions still count,
// so the cap sits above real letters (the longest eval letter is 14 pages).
export function pdfPageCount(data: Uint8Array): number | null {
  const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  const raw = buf.toString("latin1");
  const text = unescape(raw);
  const found: Found = { pages: new Set(), counts: [] };
  for (const m of text.matchAll(OBJECT)) scan(m[1]!, m[2]!, found);
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
      scanStream(head, unescape(out.toString("latin1")), found);
    } catch {
      return null; // corrupt, or past the budget
    }
  }
  // A file with no numbered objects is malformed: count its page dictionaries as-is.
  if (found.pages.size === 0 && found.counts.length === 0) {
    found.pages = new Set(
      [...text.matchAll(new RegExp(PAGE.source, "g"))].map((_, i) => `${i}`),
    );
    const loose = [...text.matchAll(new RegExp(COUNT.source, "g"))];
    found.counts = loose.map((m) => Number(m[1]));
  }
  const pages = Math.max(found.pages.size, ...found.counts);
  return pages > 0 ? pages : null;
}
