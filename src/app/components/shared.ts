import rules from "../../../data/rules/or.json";
import { enforceGuardrail } from "@/lib/guardrails";
import { FALLBACK_TEL, phoneHref } from "@/lib/phone";
import type { LetterExtraction } from "@/lib/schema";

export const OHP_PHONE = rules.contact.phone;
export const NOT_SURE = "Not sure. Check the letter or call.";
export const safe = (text: string) => enforceGuardrail(text).text;

export const NOTICE_LABELS: Record<LetterExtraction["notice_type"], string> = {
  work_requirement_info: "Work rules information",
  work_requirement_verification: "Proof of work or activities",
  renewal: "Renewal",
  request_for_information: "Request for information",
  coverage_ending: "Coverage ending",
  approval_or_change: "Approval or change",
  other_medicaid: "Medicaid letter",
  not_medicaid: "Not a Medicaid letter",
};

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function letterPhone(data: LetterExtraction | null) {
  const phone = data?.contact_phone ? safe(data.contact_phone) : "";
  return phoneHref(phone) !== FALLBACK_TEL ? phone : OHP_PHONE;
}
