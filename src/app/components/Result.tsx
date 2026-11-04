import { useLocale } from "@/i18n/LocaleContext";
import type { LetterExtraction } from "@/lib/schema";
import { Deadline } from "./Deadline";
import { safe } from "./shared";

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
  const { t, locale } = useLocale();
  if (data.notice_type === "not_medicaid") {
    return (
      <section aria-labelledby="result-title">
        <h2 id="result-title">{t.notMedicaidTitle}</h2>
        <p className="lead">{t.notMedicaidText(phone)}</p>
        <button type="button" className="primary" onClick={onRetake}>
          {t.scanAnother}
        </button>
      </section>
    );
  }
  const isWork = data.notice_type.startsWith("work_requirement");
  return (
    <section aria-labelledby="result-title" className="result">
      <p className="kind">{t.noticeLabels[data.notice_type]}</p>
      <h2 id="result-title">{t.resultTitle}</h2>
      <p className="lead">{safe(data.summary, locale)}</p>

      <Deadline data={data} phone={phone} />

      <h3>{t.askTitle}</h3>
      <p>
        {data.required_action ? safe(data.required_action, locale) : t.notSure}
      </p>

      <h3>{t.papersTitle}</h3>
      {data.documents.length > 0 ? (
        <ul className="checklist">
          {data.documents.map((doc, i) => (
            <li key={i}>
              <label>
                <input type="checkbox" />
                <span>{safe(doc, locale)}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t.notSure}</p>
      )}

      <div className="actions">
        <button
          type="button"
          className={isWork ? "primary" : "secondary"}
          onClick={onScreen}
        >
          {t.checkExemptions}
        </button>
        <button type="button" className="secondary" onClick={onRetake}>
          {t.scanAnother}
        </button>
      </div>
    </section>
  );
}
