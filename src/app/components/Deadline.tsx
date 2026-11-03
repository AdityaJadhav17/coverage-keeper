import rules from "../../../data/rules/or.json";
import { deadlineStatus } from "@/lib/deadline";
import type { LetterExtraction } from "@/lib/schema";
import { formatDate, NOT_SURE, safe } from "./shared";

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
  return (
    <div className={`deadline ${status}`} data-testid="deadline">
      <h3>Due date</h3>
      {status === "unknown" ? (
        <>
          <p className="big">{NOT_SURE}</p>
          {quote}
          <p>Call {phone} to confirm your deadline.</p>
        </>
      ) : (
        <>
          <p className="date">{formatDate(data.deadline!)}</p>
          <p className="big">
            {status === "upcoming" &&
              `${days} ${days === 1 ? "day" : "days"} left`}
            {status === "today" && "Due today"}
            {status === "passed" && "This date has passed. Call now."}
          </p>
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
