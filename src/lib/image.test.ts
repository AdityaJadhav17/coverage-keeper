import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_PAGES_BYTES,
  MAX_UPLOAD_BYTES,
  fitWithin,
  toUploadJpeg,
  toUploadJpegs,
} from "./image";

describe("fitWithin", () => {
  it.each([
    [4032, 3024, 2000, 1500],
    [3024, 4032, 1500, 2000],
    [800, 600, 800, 600],
    [2000, 10, 2000, 10],
  ])("%ix%i -> %ix%i", (w, h, ew, eh) => {
    expect(fitWithin(w, h)).toEqual({ width: ew, height: eh });
  });
});

describe("toUploadJpeg", () => {
  // Fake canvas whose JPEG size scales with pixels and quality.
  function stubBrowser(bytesPerPixel: number) {
    const canvases: { width: number; height: number }[] = [];
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 4032;
        naturalHeight = 3024;
        src = "";
        decode = () => Promise.resolve();
      },
    );
    vi.stubGlobal("document", {
      createElement: () => {
        const canvas = {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: () => {} }),
          toBlob: (cb: (b: Blob) => void, _type: string, q: number) =>
            cb({
              size: canvas.width * canvas.height * bytesPerPixel * q,
            } as Blob),
        };
        canvases.push(canvas);
        return canvas;
      },
    });
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x");
    return { canvases, revoke };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("downscales to 2000px and retries until under 2 MB", async () => {
    const { canvases, revoke } = stubBrowser(1);
    const blob = await toUploadJpeg(new Blob());
    expect(blob.size).toBeLessThanOrEqual(MAX_UPLOAD_BYTES);
    expect(canvases[0]).toMatchObject({ width: 2000, height: 1500 });
    expect(canvases.length).toBeGreaterThan(1);
    expect(revoke).toHaveBeenCalledWith("blob:x");
  });

  it("gives up after repeated attempts and still frees the URL", async () => {
    const { revoke } = stubBrowser(1000);
    await expect(toUploadJpeg(new Blob())).rejects.toThrow(/too large/);
    expect(revoke).toHaveBeenCalled();
  });

  it("splits one request's budget across every page", async () => {
    stubBrowser(1);
    const pages = await toUploadJpegs(
      Array.from({ length: 10 }, () => new Blob()),
    );
    expect(pages).toHaveLength(10);
    const total = pages.reduce((sum, p) => sum + p.size, 0);
    expect(total).toBeLessThanOrEqual(MAX_PAGES_BYTES);
    for (const p of pages)
      expect(p.size).toBeLessThanOrEqual(MAX_PAGES_BYTES / 10);
  });

  it("keeps the single-photo limit when there are few pages", async () => {
    stubBrowser(1);
    const [page] = await toUploadJpegs([new Blob()]);
    expect(page!.size).toBeLessThanOrEqual(MAX_UPLOAD_BYTES);
    expect(page!.size).toBeGreaterThan(MAX_PAGES_BYTES / 4);
  });

  it("says so when ten pages can't fit in one request", async () => {
    stubBrowser(1000);
    await expect(
      toUploadJpegs(Array.from({ length: 10 }, () => new Blob())),
    ).rejects.toThrow(/too large/);
  });
});
