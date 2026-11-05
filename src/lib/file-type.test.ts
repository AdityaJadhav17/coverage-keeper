import { describe, expect, it } from "vitest";
import { sniffType } from "./file-type";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(
    parts.flatMap((p) =>
      typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p,
    ),
  );

describe("sniffType (US-075)", () => {
  it.each([
    ["JPEG", bytes([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg"],
    [
      "PNG",
      bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]),
      "image/png",
    ],
    ["WebP", bytes("RIFF", [1, 2, 3, 4], "WEBPVP8 "), "image/webp"],
    ["PDF", bytes("%PDF-1.7\n"), "application/pdf"],
  ])("recognizes %s", (_, data, type) => {
    expect(sniffType(data)).toBe(type);
  });

  it.each([
    ["empty", bytes()],
    ["text", bytes("hello, this is not a letter")],
    ["a RIFF file that isn't WebP", bytes("RIFF", [1, 2, 3, 4], "WAVEfmt ")],
    ["a truncated PNG signature", bytes([0x89, 0x50, 0x4e, 0x47])],
    ["a truncated JPEG signature", bytes([0xff, 0xd8])],
    ["a PDF marker not at the start", bytes(" %PDF-1.7")],
  ])("refuses %s", (_, data) => {
    expect(sniffType(data)).toBeNull();
  });
});
