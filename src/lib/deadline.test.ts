import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { daysUntil, deadlineStatus } from "./deadline";

const LA = "America/Los_Angeles";

describe("daysUntil", () => {
  it("counts days left from an injected clock", () => {
    const now = new Date("2026-12-01T09:00:00-08:00");
    expect(daysUntil("2026-12-15", now, LA)).toBe(14);
  });

  it("uses the local date, not UTC, late in the evening", () => {
    // 23:30 PST on Dec 1 is already Dec 2 in UTC.
    const now = new Date("2026-12-01T23:30:00-08:00");
    expect(daysUntil("2026-12-02", now, LA)).toBe(1);
  });

  it("ignores daylight-saving shifts", () => {
    const now = new Date("2027-03-13T12:00:00-08:00");
    expect(daysUntil("2027-03-15", now, LA)).toBe(2);
  });

  it("is negative for past dates", () => {
    const now = new Date("2027-02-16T08:00:00-08:00");
    expect(daysUntil("2027-02-15", now, LA)).toBe(-1);
  });

  it("throws on an invalid date", () => {
    expect(() => daysUntil("2027-13-01", new Date())).toThrow();
  });

  it("moves by exactly one per added day (property)", () => {
    fc.assert(
      fc.property(
        fc.date({
          min: new Date("2000-01-01T00:00:00Z"),
          max: new Date("2099-12-31T00:00:00Z"),
          noInvalidDate: true,
        }),
        fc.integer({ min: -400, max: 400 }),
        (now, offset) => {
          const today = new Date(daysUntilBase(now));
          today.setUTCDate(today.getUTCDate() + offset);
          const iso = today.toISOString().slice(0, 10);
          expect(daysUntil(iso, now, LA)).toBe(offset);
        },
      ),
    );
  });
});

// Today's LA date at UTC midnight, computed independently of the code under test.
function daysUntilBase(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}T00:00:00Z`;
}

describe("deadlineStatus", () => {
  const now = new Date("2027-02-10T10:00:00-08:00");

  it.each([
    ["2027-02-15", "upcoming", 5],
    ["2027-02-10", "today", 0],
    ["2027-02-09", "passed", -1],
  ] as const)("%s is %s", (iso, status, days) => {
    expect(deadlineStatus(iso, now, LA)).toEqual({ status, days });
  });

  it.each([null, "", "not a date", "2027-02-30"])(
    "is unknown for %j",
    (iso) => {
      expect(deadlineStatus(iso, now)).toEqual({
        status: "unknown",
        days: null,
      });
    },
  );
});

// The person's own calendar day decides, wherever they are (review finding: the date
// was always counted in Los Angeles).
describe("the same moment in different places", () => {
  // 00:30 on Nov 22 in Phoenix and 02:30 in New York; still 23:30 on Nov 21 in Los Angeles.
  const now = new Date("2026-11-22T07:30:00Z");

  it.each([
    ["America/Phoenix", "2026-11-21", "passed", -1],
    ["America/New_York", "2026-11-21", "passed", -1],
    ["America/Los_Angeles", "2026-11-21", "today", 0],
    ["America/Phoenix", "2026-11-22", "today", 0],
    ["America/New_York", "2026-11-22", "today", 0],
    ["America/Los_Angeles", "2026-11-22", "upcoming", 1],
  ] as const)("%s, due %s: %s", (zone, iso, status, days) => {
    expect(deadlineStatus(iso, now, zone)).toEqual({ status, days });
  });

  it("uses the device's zone when none is given", () => {
    const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(deadlineStatus("2026-11-22", now)).toEqual(
      deadlineStatus("2026-11-22", now, device),
    );
  });
});
