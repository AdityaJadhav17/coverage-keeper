import type { Locale } from "@/i18n/messages";
import { enforceGuardrail } from "@/lib/guardrails";
import { phoneHref } from "@/lib/phone";
import type { LetterExtraction } from "@/lib/schema";

export const safe = (text: string, locale: Locale = "en") =>
  enforceGuardrail(text, locale).text;

export function formatDate(iso: string, locale: Locale = "en") {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(
    locale === "es" ? "es-US" : "en-US",
    { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" },
  );
}

// The letter's own phone number, or "" when it has none we can dial.
export function letterPhone(data: LetterExtraction | null) {
  const phone = data?.contact_phone ? safe(data.contact_phone) : "";
  return phoneHref(phone) ? phone : "";
}

// Letters about non-citizen eligibility get the "no immigration advice" line (#48).
const IMMIGRATION_TOPIC =
  /immigra|citizen|green card|visa\b|uscis|inmigra|migratori|ciudadan|tarjeta verde/i;
export const aboutImmigration = (data: LetterExtraction) =>
  [data.summary, data.required_action, data.deadline_quote, ...data.documents]
    .filter(Boolean)
    .some((text) => IMMIGRATION_TOPIC.test(text!));
