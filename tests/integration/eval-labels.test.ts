import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Schema = {
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  pattern?: string;
  minimum?: number;
  minItems?: number;
  maxItems?: number;
  items?: Schema;
  required?: string[];
  properties?: Record<string, Schema>;
  additionalProperties?: boolean;
  oneOf?: Schema[];
};

const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const schema: Schema = read("eval/labels.schema.json");
const labels: Record<string, unknown>[] = read("eval/labels.json");
const CATEGORIES = schema.items!.properties!.category!.items!.enum as string[];

const typeOf = (v: unknown) =>
  v === null
    ? "null"
    : Array.isArray(v)
      ? "array"
      : Number.isInteger(v)
        ? "integer"
        : typeof v;

// Small check of the JSON Schema keywords labels.schema.json uses (no new dependency).
function errors(s: Schema, v: unknown, at: string): string[] {
  const out: string[] = [];
  if (s.type) {
    const types = [s.type].flat();
    const t = typeOf(v);
    if (!types.includes(t) && !(t === "integer" && types.includes("number")))
      return [`${at}: expected ${types.join("|")}, got ${t}`];
  }
  if (s.enum && !s.enum.includes(v))
    out.push(`${at}: ${String(v)} not in enum`);
  if ("const" in s && v !== s.const)
    out.push(`${at}: must be ${String(s.const)}`);
  if (s.pattern && typeof v === "string" && !new RegExp(s.pattern).test(v))
    out.push(`${at}: does not match ${s.pattern}`);
  if (s.minimum !== undefined && typeof v === "number" && v < s.minimum)
    out.push(`${at}: below ${s.minimum}`);
  if (Array.isArray(v)) {
    if (s.minItems !== undefined && v.length < s.minItems)
      out.push(`${at}: too few items`);
    if (s.maxItems !== undefined && v.length > s.maxItems)
      out.push(`${at}: too many items`);
    if (s.items)
      v.forEach((x, i) => out.push(...errors(s.items!, x, `${at}[${i}]`)));
  }
  if (typeOf(v) === "object") {
    const o = v as Record<string, unknown>;
    for (const k of s.required ?? [])
      if (!(k in o)) out.push(`${at}: missing ${k}`);
    for (const [k, x] of Object.entries(o)) {
      const p = s.properties?.[k];
      if (p) out.push(...errors(p, x, `${at}.${k}`));
      else if (s.additionalProperties === false)
        out.push(`${at}: extra field ${k}`);
    }
    if (
      s.oneOf &&
      s.oneOf.filter((alt) => errors(alt, v, at).length === 0).length !== 1
    )
      out.push(`${at}: must match exactly one oneOf branch`);
  }
  return out;
}

const GOV = /^https:\/\/([a-z0-9-]+\.)*[a-z0-9-]+\.gov\//;

describe("eval labels", () => {
  it("every entry passes eval/labels.schema.json", () => {
    expect(errors(schema, labels, "labels")).toEqual([]);
  });

  it.each(labels.map((l) => [l.id, l] as const))("%s", (_, l) => {
    for (const c of l.category as string[]) expect(CATEGORIES).toContain(c);
    if (l.source_kind === "synthetic") {
      expect(l.split).toBe("test");
      expect(l.id).toMatch(/^syn-/);
    } else {
      expect(
        GOV.test(String(l.source_url)) ||
          GOV.test(String(l.source_linked_from)),
      ).toBe(true);
    }
    if (l.deadline === null) expect(l.deadline_page).toBeNull();
    const files = (l.files as string[] | undefined) ?? [l.file as string];
    for (const f of files)
      expect(existsSync(`eval/letters/${f}`), f).toBe(true);
  });

  it("the checker catches a bad entry", () => {
    const bad = { ...labels[0], category: ["nope"], extra: 1 };
    expect(errors(schema, [bad], "labels").length).toBeGreaterThan(0);
  });
});
