import { useLocale } from "@/i18n/LocaleContext";
import { deadlineStatus } from "@/lib/deadline";
import type { LetterExtraction } from "@/lib/schema";
import type { StateRules } from "@/lib/states";
import { formatDate, safe } from "./shared";

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
  // The quoted line stays exactly as printed on the letter.
  const quote = data.deadline_quote && (
    <blockquote>
      <mark>{safe(data.deadline_quote, locale)}</mark>
    </blockquote>
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
