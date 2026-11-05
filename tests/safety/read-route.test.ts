import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/read/route";
import {
  findForbiddenClaims,
  SAFE_FALLBACK,
  SAFE_FALLBACK_ES,
} from "@/lib/guardrails";
import { LetterExtraction } from "@/lib/schema";
import adversarial from "../fixtures/adversarial/eligible-summary.json";

vi.mock("@/lib/letter-reader", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/letter-reader")>()),
  readLetter: async () => LetterExtraction.parse(adversarial),
}));

async function read(lang?: string) {
  const form = new FormData();
  form.set(
    "image",
    // A real PNG signature: the route checks file bytes (US-075).
    new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "a.png",
      { type: "image/png" },
    ),
  );
  if (lang) form.set("lang", lang);
  const res = await POST(
    new Request("http://test/api/read", { method: "POST", body: form }),
  );
  return res.json();
}

describe("route output guardrail (US-050, US-052, US-062)", () => {
  it.each([
    [undefined, SAFE_FALLBACK],
    ["fr", SAFE_FALLBACK],
    ["es", SAFE_FALLBACK_ES],
  ])("lang %j: claims become %j", async (lang, fallback) => {
    const body = await read(lang);
    expect(body.summary).toBe(fallback);
    expect(body.required_action).toBe(fallback);
    expect(body.deadline_quote).toBe(fallback);
    expect(body.documents).toEqual(["Pay stubs for January 2027", fallback]);
    expect(findForbiddenClaims(JSON.stringify(body))).toEqual([]);
  });
});
