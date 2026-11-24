import { inflateSync } from "node:zlib";

// Name tokens may hide behind #xx escapes and comments (PDF 1.7 §7.2.3, §7.3.5).
// Every pattern here does bounded work per starting point, and objects are walked with
// indexOf, so the whole count is linear in the file size. Before, an unbounded lazy
// match up to "endobj", and a comment run rescanned from every "/Type" inside it, let
// one 4 MB upload hold the server for minutes or hours.
// Up to 4 comments of up to 200 bytes between two tokens; real files have none.
const GAP = String.raw`\s*(?:%[^\r\n]{0,200}[\r\n]\s*){0,4}`;
const PAGE = new RegExp(String.raw`\/Type${GAP}\/Page(?![A-Za-z0-9#])`);
const PAGES = new RegExp(String.raw`\/Type${GAP}\/Pages(?![A-Za-z0-9#])`);
const COUNT = /\/Count\s+(\d+)/;
const OBJECT_START = /(\d{1,10})\s+\d{1,10}\s+obj\b/g;
const STREAM = /(?<!end)stream\r?\n/g;
// Things we refuse to count rather than miscount, since a hidden page is a billed page:
// a name followed by more comment than GAP reads (the lookahead plus backreference
// stops the engine from giving comments back), and object or generation numbers too
// long for OBJECT_START to tell apart.
const UNREADABLE = new RegExp(String.raw`\/Type(?=(${GAP}))\1%`);
const LONG_NUMBER = /\d{11}\s+(?:\d{1,10}\s+)?obj\b/;
const uncountable = (text: string) =>
  UNREADABLE.test(text) || LONG_NUMBER.test(text);
const INFLATE_BUDGET = 16 * 1024 * 1024;

const unescape = (s: string) =>
  s.replace(/#([0-9a-fA-F]{2})/g, (_, h: string) =>
    String.fromCharCode(parseInt(h, 16)),
  );

type Found = { pages: Set<string>; counts: number[]; loose: number };

const WORD = /[A-Za-z0-9_]/;
// The next "endobj" that stands alone: "/xendobj" is a name, not the end of an object.
function endOfObject(text: string, from: number): number {
  for (
    let i = text.indexOf("endobj", from);
    i >= 0;
    i = text.indexOf("endobj", i + 1)
  )
    if (!WORD.test(text[i - 1] ?? " ") && !WORD.test(text[i + 6] ?? " "))
      return i;
  return -1;
}

// Each "N G obj ... endobj", in order, or null when an object has another object's
// header inside it: "1 0 obj junk" before each page would otherwise file every page
// under object 1 and hide it from the count. Stops at the first object with no
// "endobj": no later object can have one either.
// Another header inside a body, also with comments between its tokens or no space
// before "obj"; each gap is bounded, so the work per start stays bounded.
const TOKEN_GAP = String.raw`(?:\s|%[^\r\n]{0,200}[\r\n]){1,8}`;
const NESTED = new RegExp(
  String.raw`\d{1,10}${TOKEN_GAP}\d{1,10}(?:\s|%[^\r\n]{0,200}[\r\n]){0,8}obj\b`,
);
type Walk = { list: [num: string, body: string][]; outside: string };
function objects(text: string): Walk | null {
  const start = new RegExp(OBJECT_START.source, "g");
  const list: [string, string][] = [];
  // Text that is in no paired object: where a page with a broken header would sit.
  let outside = "";
  let from = 0;
  for (let m = start.exec(text); m; m = start.exec(text)) {
    const end = endOfObject(text, start.lastIndex);
    if (end < 0) break;
    const body = text.slice(start.lastIndex, end);
    if (NESTED.test(body)) return null;
    list.push([m[1]!, body]);
    outside += text.slice(from, m.index) + " ";
    from = end + "endobj".length;
    start.lastIndex = from;
  }
  return { list, outside: outside + text.slice(from) };
}

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
// False when the offsets are out of order or past the end: the file chooses them, and
// overlapping ones would make every pair rescan the whole stream.
function scanStream(head: string, text: string, found: Found): boolean {
  const first = Number(/\/First\s+(\d+)/.exec(head)?.[1]);
  if (!Number.isFinite(first)) {
    const walk = objects(text);
    if (!walk) return false;
    for (const [num, body] of walk.list) scan(num, body, found);
    found.loose += pageDictionaries(walk.outside);
    return true;
  }
  const pairs = text.slice(0, first).trim().split(/\s+/).map(Number);
  const room = text.length - first;
  for (let i = 0, last = 0; i + 1 < pairs.length; i += 2) {
    const offset = pairs[i + 1]!;
    if (!Number.isInteger(offset) || offset < last || offset > room)
      return false;
    last = offset;
  }
  for (let i = 0; i + 1 < pairs.length; i += 2)
    scan(
      String(pairs[i]),
      text.slice(first + pairs[i + 1]!, first + (pairs[i + 3] ?? room)),
      found,
    );
  return true;
}

// Pages the model would be billed for, or null when we can't be sure (security audit M1).
// The larger of the page trees' /Count and the distinct page objects, including those
// inside Flate object streams; an object stream in any other filter makes it give up.
// shortcut: a byte scan, not a PDF parser; deleted pages from old revisions still count,
// so the cap sits above real letters (the longest eval letter is 14 pages).
const PAGE_ALL = new RegExp(PAGE.source, "g");
const pageDictionaries = (text: string) => text.match(PAGE_ALL)?.length ?? 0;

export function pdfPageCount(data: Uint8Array): number | null {
  const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  const raw = buf.toString("latin1");
  const text = unescape(raw);
  if (uncountable(text)) return null;
  const found: Found = { pages: new Set(), counts: [], loose: 0 };
  const walk = objects(text);
  if (!walk) return null;
  for (const [num, body] of walk.list) scan(num, body, found);
  // A page dictionary outside every paired object still counts: a comment inside
  // "3 0 obj", or no "endobj", must not hide a page (review of #65). Pages inside
  // paired objects are counted once per number, since edits repeat them.
  found.loose += pageDictionaries(walk.outside);
  let budget = INFLATE_BUDGET;
  // Every lookup only moves forward through the file, and each stream's dictionary is
  // read from the previous stream keyword at the earliest, so the slices never overlap.
  let lastObj = -1;
  let previousStream = 0;
  let nextObj = raw.indexOf(" obj");
  let endstream = -1;
  let noEndstream = false;
  for (const m of raw.matchAll(STREAM)) {
    while (nextObj >= 0 && nextObj < m.index) {
      lastObj = nextObj;
      nextObj = raw.indexOf(" obj", nextObj + 1);
    }
    const head = unescape(
      raw.slice(Math.max(lastObj, previousStream), m.index),
    );
    const start = m.index + m[0].length;
    previousStream = start;
    if (!/\/Type\s*\/ObjStm\b/.test(head)) continue;
    if (!/\/Filter\s*\/FlateDecode\b/.test(head)) return null;
    if (endstream < start && !noEndstream) {
      endstream = raw.indexOf("endstream", start);
      noEndstream = endstream < 0;
    }
    const end = endstream >= start ? endstream : -1;
    try {
      const out = inflateSync(buf.subarray(start, end < 0 ? buf.length : end), {
        maxOutputLength: budget,
      });
      budget -= out.length;
      const inner = unescape(out.toString("latin1"));
      if (uncountable(inner)) return null;
      if (!scanStream(head, inner, found)) return null;
    } catch {
      return null; // corrupt, or past the budget
    }
  }
  // A file with no numbered objects is malformed: count its page dictionaries as-is.
  if (found.pages.size === 0 && found.counts.length === 0) {
    found.loose = 0; // counted again just below, over the whole text
    found.pages = new Set(
      [...text.matchAll(new RegExp(PAGE.source, "g"))].map((_, i) => `${i}`),
    );
    const loose = [...text.matchAll(new RegExp(COUNT.source, "g"))];
    found.counts = loose.map((m) => Number(m[1]));
  }
  const pages = Math.max(found.pages.size + found.loose, ...found.counts);
  return pages > 0 ? pages : null;
}
