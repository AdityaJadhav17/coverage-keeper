import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../../tests/fixtures/reader/synthetic-work-requirement.json";
import { createLetterReader, readLetter, UNSURE_RESULT } from "./letter-reader";

const IMAGE = { mediaType: "image/png" as const, base64: "AAAA" };

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
