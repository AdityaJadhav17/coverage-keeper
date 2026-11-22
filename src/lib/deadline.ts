export type DeadlineStatus = "upcoming" | "today" | "passed" | "unknown";

const DAY_MS = 86_400_000;
// Today's calendar date (YYYY-MM-DD; en-CA formats that way) where the person is: the
// device's own zone unless one is given. A fixed Pacific zone showed "Due today" in
// Arizona and further east after the date had passed there.
const localDate = (now: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);

function utcMidnight(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  // Rejects rollovers like 2027-02-30.
  return Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== iso
    ? null
    : ms;
}

// Calendar days from the person's today to isoDate (YYYY-MM-DD). Negative if past.
export function daysUntil(
  isoDate: string,
  now: Date,
  timeZone?: string,
): number {
  const target = utcMidnight(isoDate);
  if (target === null) throw new Error(`Invalid date: ${isoDate}`);
  return Math.round((target - utcMidnight(localDate(now, timeZone))!) / DAY_MS);
}

export function deadlineStatus(
  isoDate: string | null,
  now: Date,
  timeZone?: string,
): { status: DeadlineStatus; days: number | null } {
  if (!isoDate || utcMidnight(isoDate) === null)
    return { status: "unknown", days: null };
  const days = daysUntil(isoDate, now, timeZone);
  return {
    status: days > 0 ? "upcoming" : days === 0 ? "today" : "passed",
    days,
  };
}
