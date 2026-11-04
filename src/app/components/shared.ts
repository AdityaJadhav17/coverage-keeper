import rules from "../../../data/rules/or.json";
import type { Locale } from "@/i18n/messages";
import { enforceGuardrail } from "@/lib/guardrails";
import { FALLBACK_TEL, phoneHref } from "@/lib/phone";
import type { LetterExtraction } from "@/lib/schema";

export const OHP_PHONE = rules.contact.phone;
export const safe = (text: string, locale: Locale = "en") =>
  enforceGuardrail(text, locale).text;

export function formatDate(iso: string, locale: Locale = "en") {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(
    locale === "es" ? "es-US" : "en-US",
    { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" },
  );
}

export function letterPhone(data: LetterExtraction | null) {
  const phone = data?.contact_phone ? safe(data.contact_phone) : "";
  return phoneHref(phone) !== FALLBACK_TEL ? phone : OHP_PHONE;
}
