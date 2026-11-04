import { useLocale } from "@/i18n/LocaleContext";
import type { StateRules } from "@/lib/states";
import { DoctorDraft } from "./DoctorDraft";
import { Source } from "./Source";

export function Screened({
  rules,
  yes,
  deadline,
  onBack,
}: {
  rules: StateRules;
  yes: string[];
  deadline: string | null;
  onBack: () => void;
}) {
  const { t, locale } = useLocale();
  const es = locale === "es";
  const matched = (rules.exemptions ?? []).filter((r) => yes.includes(r.id));
  return (
    <section aria-labelledby="screened-title">
      {matched.length > 0 ? (
        <>
          <h2 id="screened-title">{t.askAboutTitle}</h2>
          <ul className="matches">
            {matched.map((rule) => (
              <li key={rule.id} data-testid="may-apply">
                <p className="q">
                  {es && rule.question_es ? rule.question_es : rule.question}
                </p>
                <p>{t.mayApply(rules.program)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2 id="screened-title">{t.waysTitle}</h2>
          <p className="lead">
            {es && rules.applies_to_es ? rules.applies_to_es : rules.applies_to}{" "}
            {t.waysLead}
          </p>
          <ul className="facts">
            {(rules.ways_to_meet ?? []).map((way) => (
              <li key={way.id}>{es && way.text_es ? way.text_es : way.text}</li>
            ))}
          </ul>
        </>
      )}
      {yes.includes("health_condition") && (
        <DoctorDraft deadline={deadline} rules={rules} />
      )}
      <Source rules={rules} />
      <button type="button" className="secondary" onClick={onBack}>
        {t.back}
      </button>
    </section>
  );
}
