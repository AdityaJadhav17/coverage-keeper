export type SniffedType =
  "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

const startsWith = (data: Uint8Array, at: number, sig: number[] | string) =>
  [...sig].every(
    (s, i) => data[at + i] === (typeof s === "string" ? s.charCodeAt(0) : s),
  );

// The file's real type from its first bytes, never its name or declared type (US-075).
export function sniffType(data: Uint8Array): SniffedType | null {
  if (startsWith(data, 0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(data, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return "image/png";
  if (startsWith(data, 0, "RIFF") && startsWith(data, 8, "WEBP"))
    return "image/webp";
  if (startsWith(data, 0, "%PDF-")) return "application/pdf";
  return null;
}
