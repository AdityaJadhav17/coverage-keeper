import { useLocale } from "@/i18n/LocaleContext";
import { deadlineStatus } from "@/lib/deadline";
import type { LetterExtraction } from "@/lib/schema";
import type { StateRules } from "@/lib/states";
import { shownOrNull } from "@/lib/guardrails";
import { formatDate } from "./shared";

export function Deadline({
  data,
  phone,
  rules,
}: {
  data: LetterExtraction;
  phone: string;
  rules: StateRules | null;
}) {
  const { t, locale } = useLocale();
  const { status, days } = deadlineStatus(data.deadline, new Date());
  // The quoted line stays exactly as printed on the letter, or is not shown at all.
  const printed = shownOrNull(data.deadline_quote);
  const quote = printed && (
    <>
      <blockquote>
        <mark>{printed}</mark>
      </blockquote>
      {/* Page 1 is where people look anyway, so only later pages are named (US-074). */}
      {data.deadline_page && data.deadline_page > 1 && (
        <p className="from-page">{t.fromPage(data.deadline_page)}</p>
      )}
    </>
  );
  const badge = (
    <p className={`badge ${status}`}>
      <span className="dot" aria-hidden="true" />
      {t.badge(status, days)}
    </p>
  );
  return (
    <div className={`deadline ${status}`} data-testid="deadline">
      <h3>{t.dueDate}</h3>
      {status === "unknown" ? (
        <>
          {badge}
          {quote}
          <p>{t.confirmDeadline(phone)}</p>
        </>
      ) : (
        <>
          <p className="date">{formatDate(data.deadline!, locale)}</p>
          {badge}
          {quote}
          {status === "passed" && (
            <p>
              {t.reapply(phone)}{" "}
              {rules && (
                <a href={rules.source_url} target="_blank" rel="noreferrer">
                  {t.source(rules.agency)}
                </a>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}
