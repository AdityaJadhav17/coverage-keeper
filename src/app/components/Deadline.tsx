import rules from "../../../data/rules/or.json";
import { deadlineBadge, deadlineStatus } from "@/lib/deadline";
import type { LetterExtraction } from "@/lib/schema";
import { formatDate, safe } from "./shared";

export function Deadline({
  data,
  phone,
}: {
  data: LetterExtraction;
  phone: string;
}) {
  const { status, days } = deadlineStatus(data.deadline, new Date());
  const quote = data.deadline_quote && (
    <blockquote>
      <mark>{safe(data.deadline_quote)}</mark>
    </blockquote>
  );
  const badge = (
    <p className={`badge ${status}`}>
      <span className="dot" aria-hidden="true" />
      {deadlineBadge(status, days)}
    </p>
  );
  return (
    <div className={`deadline ${status}`} data-testid="deadline">
      <h3>Due date</h3>
      {status === "unknown" ? (
        <>
          {badge}
          {quote}
          <p>Call {phone} to confirm your deadline.</p>
        </>
      ) : (
        <>
          <p className="date">{formatDate(data.deadline!)}</p>
          {badge}
          {quote}
          {status === "passed" && (
            <p>
              Call {phone} today. Oregon lets you apply for OHP again at any
              time.{" "}
              <a href={rules.source_url} target="_blank" rel="noreferrer">
                Source: Oregon Health Authority
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
