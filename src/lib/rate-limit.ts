// Fixed-window counter per key. State is per server instance, so this is a speed bump
// against one client looping; the platform firewall and the API spend limit are the real caps.
export function createRateLimiter({
  max,
  windowMs,
  maxKeys = 10_000,
}: {
  max: number;
  windowMs: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, { n: number; reset: number }>();
  const OVERFLOW = "\0overflow";
  const sweep = (now: number) => {
    for (const [k, h] of hits) if (h.reset <= now) hits.delete(k);
  };
  let swept = 0;
  const limited = (key: string, now: number): boolean => {
    // Keys are IP addresses: drop expired ones at least once a window, so none is held
    // much past its minute (the privacy notice says so).
    if (now - swept >= windowMs) {
      sweep(now);
      swept = now;
    }
    if (!hits.has(key) && hits.size >= maxKeys) {
      // Bound memory without wiping live counts (security audit I2).
      sweep(now);
      if (hits.size >= maxKeys) key = OVERFLOW;
    }
    const h = hits.get(key);
    if (!h || h.reset <= now) {
      hits.set(key, { n: 1, reset: now + windowMs });
      return false;
    }
    return ++h.n > max;
  };
  // How many keys are held, so tests can check expired IPs are gone.
  return Object.assign(limited, { size: () => hits.size });
}
