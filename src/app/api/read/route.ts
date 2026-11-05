import { MAX_LETTER_BYTES, MAX_PAGES } from "@/lib/collect-files";
import { sniffType } from "@/lib/file-type";
import { enforceGuardrail } from "@/lib/guardrails";
import {
  MODEL_ID,
  readLetter,
  type LetterImage,
  type LetterInput,
} from "@/lib/letter-reader";
import { createRateLimiter } from "@/lib/rate-limit";

const MAX_BODY = MAX_LETTER_BYTES + 64 * 1024; // files + multipart overhead

// Each call spends paid model credits; cap one client looping (security audit H1).
const limited = createRateLimiter({ max: 10, windowMs: 60_000 });

const error = (status: number, message: string) =>
  Response.json({ error: message }, { status });

// Logs carry no image bytes, letter text or extracted fields (ADR-0004).
const log = (fields: Record<string, unknown>) =>
  console.info(
    JSON.stringify({ route: "/api/read", model: MODEL_ID, ...fields }),
  );

export async function POST(req: Request) {
  const started = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (limited(ip || "unknown", started)) {
    log({ status: 429 });
    return error(
      429,
      "Too many tries. Please wait a minute, or call the number on your letter.",
    );
  }
  // Reject before buffering the body (audit L1). Browsers always send Content-Length.
  if (Number(req.headers.get("content-length")) > MAX_BODY) {
    return error(413, "That photo is too large. Please use one under 4 MB.");
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error(400, "Please send a photo of your letter.");
  }

  const images = form.getAll("image");
  const pdfs = form.getAll("pdf");
  const files = [...images, ...pdfs];
  if (files.length === 0 || !files.every((f) => f instanceof File)) {
    return error(400, "Please send a photo of your letter.");
  }
  if (images.length > 0 && pdfs.length > 0) {
    return error(400, "Send photos or one PDF, not both.");
  }
  if (pdfs.length > 1) return error(400, "Send one PDF at a time.");
  if (images.length > MAX_PAGES) return error(400, "Send up to 10 pages.");
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_LETTER_BYTES) {
    return error(
      413,
      pdfs.length > 0
        ? "This PDF is too big. Take photos of each page instead."
        : "That photo is too large. Please use one under 4 MB.",
    );
  }

  // Trust the bytes, not the name or declared type (US-075).
  const read = await Promise.all(
    files.map(async (f) => {
      const data = new Uint8Array(await f.arrayBuffer());
      return {
        type: sniffType(data),
        base64: Buffer.from(data).toString("base64"),
      };
    }),
  );
  let input: LetterInput;
  if (pdfs.length > 0) {
    const [file] = read;
    if (file?.type !== "application/pdf") {
      return error(400, "That file is not a PDF.");
    }
    input = { kind: "pdf", base64: file.base64 };
  } else {
    if (!read.every((f) => f.type?.startsWith("image/"))) {
      return error(400, "Please use a JPEG, PNG or WebP photo.");
    }
    input = {
      kind: "images",
      images: read.map((f) => ({
        mediaType: f.type as LetterImage["mediaType"],
        base64: f.base64,
      })),
    };
  }

  // Anything but "es" reads in English.
  const lang = form.get("lang") === "es" ? "es" : "en";

  try {
    const result = await readLetter(input, { lang });
    // Every user-facing string, including text copied from the letter (ADR-0005).
    let blocked = false;
    const guard = (text: string) => {
      const out = enforceGuardrail(text, lang);
      blocked ||= out.blocked;
      return out.text;
    };
    const safe = {
      ...result,
      summary: guard(result.summary),
      required_action: result.required_action && guard(result.required_action),
      deadline_quote: result.deadline_quote && guard(result.deadline_quote),
      documents: result.documents.map(guard),
    };
    log({
      status: 200,
      ms: Date.now() - started,
      blocked,
      lang,
      pages: input.kind === "pdf" ? "pdf" : input.images.length,
    });
    return Response.json(safe);
  } catch (err) {
    log({
      status: 502,
      ms: Date.now() - started,
      error: err instanceof Error ? err.constructor.name : "unknown",
    });
    return error(
      502,
      "We couldn't read your letter right now. Please try again, or call the number on your letter.",
    );
  }
}
