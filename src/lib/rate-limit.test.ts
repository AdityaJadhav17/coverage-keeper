import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows max requests per window, then limits", () => {
    const limited = createRateLimiter({ max: 3, windowMs: 1000 });
    expect([1, 2, 3, 4].map(() => limited("a", 0))).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it("counts keys separately", () => {
    const limited = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(limited("a", 0)).toBe(false);
    expect(limited("a", 0)).toBe(true);
    expect(limited("b", 0)).toBe(false);
  });

  it("resets after the window", () => {
    const limited = createRateLimiter({ max: 1, windowMs: 1000 });
    limited("a", 0);
    expect(limited("a", 999)).toBe(true);
    expect(limited("a", 1000)).toBe(false);
  });

  it("drops expired keys to make room", () => {
    const limited = createRateLimiter({ max: 1, windowMs: 1000, maxKeys: 2 });
    limited("a", 0);
    limited("b", 0);
    expect(limited("c", 1000)).toBe(false); // a and b have expired
    expect(limited("c", 1000)).toBe(true);
  });

  // Many new keys must not wipe a limited client's count (security audit I2).
  it("keeps a limited client limited when new keys flood in", () => {
    const limited = createRateLimiter({ max: 1, windowMs: 1000, maxKeys: 2 });
    limited("a", 0);
    expect(limited("a", 0)).toBe(true);
    for (const k of ["b", "c", "d", "e"]) limited(k, 0);
    expect(limited("a", 0)).toBe(true);
  });

  it("makes overflow keys share one count instead of growing without bound", () => {
    const limited = createRateLimiter({ max: 2, windowMs: 1000, maxKeys: 1 });
    limited("a", 0);
    expect(limited("b", 0)).toBe(false);
    expect(limited("c", 0)).toBe(false);
    expect(limited("d", 0)).toBe(true);
  });
});
