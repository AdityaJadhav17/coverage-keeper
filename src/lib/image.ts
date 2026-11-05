export const MAX_PICK_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
// Shared by all pages of one read; the route allows 4 MB plus form overhead.
export const MAX_PAGES_BYTES = 3.8 * 1024 * 1024;
export const MAX_EDGE = 2000;

// Size that keeps the aspect ratio with the long edge at most maxEdge. Never upscales.
export function fitWithin(width: number, height: number, maxEdge = MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

// Re-encode any browser-decodable image (incl. iPhone HEIC in Safari) to a JPEG under maxBytes.
export async function toUploadJpeg(
  file: Blob,
  maxBytes = MAX_UPLOAD_BYTES,
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    let { width, height } = fitWithin(img.naturalWidth, img.naturalHeight);
    for (let attempt = 0; attempt < 6; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85 - attempt * 0.1),
      );
      if (!blob) throw new Error("Could not encode image");
      if (blob.size <= maxBytes) return blob;
      ({ width, height } = fitWithin(
        width,
        height,
        Math.max(width, height) * 0.8,
      ));
    }
    throw new Error("Image too large after compression");
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Every page of one letter, each within an equal share of one request (US-070).
export function toUploadJpegs(files: Blob[]): Promise<Blob[]> {
  const budget = Math.floor(
    Math.min(MAX_UPLOAD_BYTES, MAX_PAGES_BYTES / files.length),
  );
  return Promise.all(files.map((f) => toUploadJpeg(f, budget)));
}
