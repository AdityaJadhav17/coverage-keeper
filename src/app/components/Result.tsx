import type { LetterExtraction } from "@/lib/schema";
import { Deadline } from "./Deadline";
import { NOT_SURE, NOTICE_LABELS, safe } from "./shared";

export function Result({
  data,
  phone,
  onScreen,
  onRetake,
}: {
  data: LetterExtraction;
  phone: string;
  onScreen: () => void;
  onRetake: () => void;
}) {
  if (data.notice_type === "not_medicaid") {
    return (
      <section aria-labelledby="result-title">
        <h2 id="result-title">
          This doesn&apos;t look like a Medicaid or OHP letter
        </h2>
        <p className="lead">
          If it came from OHP or the Oregon Health Authority, call {phone} and
          they can tell you what it means.
        </p>
        <button type="button" className="primary" onClick={onRetake}>
          Scan another letter
        </button>
      </section>
    );
  }
  const isWork = data.notice_type.startsWith("work_requirement");
  return (
    <section aria-labelledby="result-title">
      <p className="kind">{NOTICE_LABELS[data.notice_type]}</p>
      <h2 id="result-title">What your letter says</h2>
      <p className="lead">{safe(data.summary)}</p>

      <Deadline data={data} phone={phone} />

      <h3>What the letter asks you to do</h3>
      <p>{data.required_action ? safe(data.required_action) : NOT_SURE}</p>

      <h3>Papers to send</h3>
      {data.documents.length > 0 ? (
        <ul className="checklist">
          {data.documents.map((doc, i) => (
            <li key={i}>
              <label>
                <input type="checkbox" />
                <span>{safe(doc)}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>{NOT_SURE}</p>
      )}

      <div className="actions">
        <button
          type="button"
          className={isWork ? "primary" : "secondary"}
          onClick={onScreen}
        >
          Check exemptions
        </button>
        <button type="button" className="secondary" onClick={onRetake}>
          Scan another letter
        </button>
      </div>
    </section>
  );
}
