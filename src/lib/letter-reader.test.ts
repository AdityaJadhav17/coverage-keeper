import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../../tests/fixtures/reader/synthetic-work-requirement.json";
import { createLetterReader, readLetter, UNSURE_RESULT } from "./letter-reader";

const PAGE = { mediaType: "image/png" as const, base64: "AAAA" };
const IMAGE = { kind: "images" as const, images: [PAGE] };

const reply = (
  text: string,
  stop_reason: Message["stop_reason"] = "end_turn",
) =>
  ({
    content: [{ type: "text", text }],
    stop_reason,
  }) as Message;

const apiError = (status: number) =>
  APIError.generate(status, undefined, "fake", new Headers());

describe("readLetter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the parsed extraction when the model output matches the schema", async () => {
    const read = createLetterReader(async () => reply(JSON.stringify(fixture)));
    expect(await read(IMAGE)).toMatchObject({
      deadline: "2027-02-15",
      confidence: "high",
    });
  });

  it.each([
    ["malformed JSON", reply("{not json")],
    [
      "a schema mismatch",
      reply(JSON.stringify({ ...fixture, deadline: "Feb 15" })),
    ],
    [
      "empty output",
      { content: [], stop_reason: "end_turn" } as unknown as Message,
    ],
    ["a refusal", reply("", "refusal")],
    [
      "output cut off at max_tokens",
      reply('{"notice_type":"renewal","summ', "max_tokens"),
    ],
  ])("returns the unsure result on %s (US-013)", async (_, message) => {
    const read = createLetterReader(async () => message);
    expect(await read(IMAGE)).toEqual(UNSURE_RESULT);
  });

  it.each([429, 500, 529])("retries once on %i", async (status) => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(apiError(status))
      .mockResolvedValueOnce(reply(JSON.stringify(fixture)));
    await createLetterReader(create, 0)(IMAGE);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it.each([
    [undefined, false],
    [{ lang: "en" } as const, false],
    [{ lang: "es" } as const, true],
  ])("with options %j sends the Spanish line: %s", async (opts, spanish) => {
    let system = "";
    await createLetterReader(async (params) => {
      system = params.system as string;
      return reply(JSON.stringify(fixture));
    })(IMAGE, opts);
    expect(system.includes("in Spanish")).toBe(spanish);
  });

  it("gives up after one retry", async () => {
    const create = vi.fn().mockRejectedValue(apiError(503));
    await expect(createLetterReader(create, 0)(IMAGE)).rejects.toThrow();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it.each([400, 401, 404])("does not retry on %i", async (status) => {
    const create = vi.fn().mockRejectedValue(apiError(status));
    await expect(createLetterReader(create, 0)(IMAGE)).rejects.toThrow();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("sends the pinned model with medium effort and a JSON schema", async () => {
    const create = vi.fn().mockResolvedValue(reply(JSON.stringify(fixture)));
    await createLetterReader(create, 0)(IMAGE);
    const params = create.mock.calls[0]![0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.output_config.effort).toBe("medium");
    expect(params.output_config.format.type).toBe("json_schema");
  });

  it("sends one image block per page, each after a page label, in order", async () => {
    const create = vi.fn().mockResolvedValue(reply(JSON.stringify(fixture)));
    await createLetterReader(
      create,
      0,
    )({
      kind: "images",
      images: [
        { mediaType: "image/png", base64: "P1" },
        { mediaType: "image/jpeg", base64: "P2" },
        { mediaType: "image/webp", base64: "P3" },
      ],
    });
    const content = create.mock.calls[0]![0].messages[0].content;
    expect(content).toEqual([
      { type: "text", text: "Page 1:" },
      {
        type: "image",
        source: { type: "base64", media_type: "image/png", data: "P1" },
      },
      { type: "text", text: "Page 2:" },
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: "P2" },
      },
      { type: "text", text: "Page 3:" },
      {
        type: "image",
        source: { type: "base64", media_type: "image/webp", data: "P3" },
      },
      { type: "text", text: "Read this letter." },
    ]);
  });

  it("sends a PDF as one document block before the instruction", async () => {
    const create = vi.fn().mockResolvedValue(reply(JSON.stringify(fixture)));
    await createLetterReader(create, 0)({ kind: "pdf", base64: "JVBERi0" });
    expect(create.mock.calls[0]![0].messages[0].content).toEqual([
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: "JVBERi0",
        },
      },
      { type: "text", text: "Read this letter." },
    ]);
  });

  it("returns the deadline page and refuses page 0", async () => {
    const read = (deadline_page: unknown) =>
      createLetterReader(async () =>
        reply(JSON.stringify({ ...fixture, deadline_page })),
      )(IMAGE);
    expect((await read(3)).deadline_page).toBe(3);
    expect(await read(0)).toEqual(UNSURE_RESULT);
  });

  it("returns the recorded fixture in fixture mode", async () => {
    vi.stubEnv("LETTER_READER", "fixture");
    expect((await readLetter(IMAGE)).deadline).toBe("2027-02-15");
  });

  it("passes the language to the live client", async () => {
    vi.stubEnv("LETTER_READER", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const create = vi
      .spyOn(Anthropic.Messages.prototype, "create")
      .mockResolvedValue(reply(JSON.stringify(fixture)) as never);
    await readLetter(IMAGE, { lang: "es" });
    const params = create.mock.calls[0]![0] as { system: string };
    expect(params.system).toContain("in Spanish");
    create.mockRestore();
  });
});
