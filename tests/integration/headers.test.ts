import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

// Defense in depth for every route (security audit I1).
describe("security headers", () => {
  const all = async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const rule = rules.find((r) => r.source === "/:path*");
    return new Map(rule?.headers.map((h) => [h.key.toLowerCase(), h.value]));
  };

  it("sets the basic hardening headers", async () => {
    const h = await all();
    expect(h.get("x-content-type-options")).toBe("nosniff");
    expect(h.get("referrer-policy")).toBe("no-referrer");
    expect(h.get("x-frame-options")).toBe("DENY");
    expect(h.get("permissions-policy")).toContain("geolocation=()");
  });

  it("has a CSP that blocks framing, plugins and other origins", async () => {
    const csp = (await all()).get("content-security-policy") ?? "";
    for (const directive of [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "connect-src 'self'",
    ])
      expect(csp).toContain(directive);
    expect(csp).not.toMatch(/https?:|\*/);
  });
});
