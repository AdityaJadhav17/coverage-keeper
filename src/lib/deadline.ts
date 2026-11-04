export type DeadlineStatus = "upcoming" | "today" | "passed" | "unknown";

const DAY_MS = 86_400_000;
// en-CA formats as YYYY-MM-DD.
const laDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
});

function utcMidnight(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  // Rejects rollovers like 2027-02-30.
  return Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== iso
    ? null
    : ms;
}

// Calendar days from today in Los Angeles to isoDate (YYYY-MM-DD). Negative if past.
export function daysUntil(isoDate: string, now: Date): number {
  const target = utcMidnight(isoDate);
  if (target === null) throw new Error(`Invalid date: ${isoDate}`);
  return Math.round((target - utcMidnight(laDate.format(now))!) / DAY_MS);
}

export function deadlineStatus(
  isoDate: string | null,
  now: Date,
): { status: DeadlineStatus; days: number | null } {
  if (!isoDate || utcMidnight(isoDate) === null)
    return { status: "unknown", days: null };
  const days = daysUntil(isoDate, now);
  return {
    status: days > 0 ? "upcoming" : days === 0 ? "today" : "passed",
    days,
  };
}

// The one place status wording lives, so every screen says the same thing.
export function deadlineBadge(
  status: DeadlineStatus,
  days: number | null,
): string {
  if (status === "upcoming")
    return `${days} ${days === 1 ? "day" : "days"} left`;
  if (status === "today") return "Due today";
  if (status === "passed") return "Date has passed. Call now.";
  return "Not sure of the date. Check the letter.";
}
