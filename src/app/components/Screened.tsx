import rules from "../../../data/rules/or.json";
import { useLocale } from "@/i18n/LocaleContext";
import { DoctorDraft } from "./DoctorDraft";
import { formatDate } from "./shared";

export function Screened({
  yes,
  deadline,
  onBack,
}: {
  yes: string[];
  deadline: string | null;
  onBack: () => void;
}) {
  const { t, locale } = useLocale();
  const es = locale === "es";
  const matched = rules.exemptions.filter((r) => yes.includes(r.id));
  const source = (
    <p className="source">
      <a href={rules.source_url} target="_blank" rel="noreferrer">
        {t.sourceOha}
      </a>
      {t.checked(formatDate(rules.retrieved, locale))}
    </p>
  );
  return (
    <section aria-labelledby="screened-title">
      {matched.length > 0 ? (
        <>
          <h2 id="screened-title">{t.askAboutTitle}</h2>
          <ul className="matches">
            {matched.map((rule) => (
              <li key={rule.id} data-testid="may-apply">
                <p className="q">{es ? rule.question_es : rule.question}</p>
                <p>{t.mayApply}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2 id="screened-title">{t.waysTitle}</h2>
          <p className="lead">
            {es ? rules.applies_to_es : rules.applies_to} {t.waysLead}
          </p>
          <ul className="facts">
            {rules.ways_to_meet.map((way) => (
              <li key={way.id}>{es ? way.text_es : way.text}</li>
            ))}
          </ul>
        </>
      )}
      {yes.includes("health_condition") && <DoctorDraft deadline={deadline} />}
      {source}
      <button type="button" className="secondary" onClick={onBack}>
        {t.back}
      </button>
    </section>
  );
}
