import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/read/route";
import {
  findForbiddenClaims,
  HIDDEN_PAPER,
  HIDDEN_PAPER_ES,
  SAFE_FALLBACK,
  SAFE_FALLBACK_ES,
} from "@/lib/guardrails";
import { readLetter } from "@/lib/letter-reader";
import { LetterExtraction } from "@/lib/schema";
import adversarial from "../fixtures/adversarial/eligible-summary.json";

vi.mock("@/lib/letter-reader", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/letter-reader")>()),
  readLetter: vi.fn(async () => LetterExtraction.parse(adversarial)),
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
    // Only the summary gets the fallback sentence. A blocked action or quote is left
    // out, and a blocked paper points back to the letter, so our own sentence is never
    // shown as the letter's words or as a paper to send.
    expect(body.required_action).toBeNull();
    expect(body.deadline_quote).toBeNull();
    expect(body.documents).toEqual([
      "Pay stubs for January 2027",
      lang === "es" ? HIDDEN_PAPER_ES : HIDDEN_PAPER,
    ]);
    expect(findForbiddenClaims(JSON.stringify(body))).toEqual([]);
  });
});

describe("the phone field is guarded too", () => {
  it("drops a phone field that carries a claim", async () => {
    vi.mocked(readLetter).mockResolvedValueOnce(
      LetterExtraction.parse({
        ...adversarial,
        contact_phone: "You are eligible",
      }),
    );
    const body = await read();
    expect(body.contact_phone).toBeNull();
  });

  it("keeps a real phone number", async () => {
    const body = await read();
    expect(body.contact_phone).toBe(adversarial.contact_phone);
  });
});
