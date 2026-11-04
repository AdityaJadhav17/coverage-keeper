import { useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { mayApply } from "@/lib/screening";
import type { Region, StateRules } from "@/lib/states";
import { Source } from "./Source";
import { StatePicker } from "./StatePicker";

export function Screening({
  region,
  rules,
  onRegion,
  onDone,
}: {
  region: Region | null;
  rules: StateRules | null;
  onRegion: (region: Region) => void;
  onDone: (yes: string[]) => void;
}) {
  const { t, locale } = useLocale();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const exemptions = rules?.exemptions ?? [];
  return (
    <form
      aria-labelledby="screening-title"
      className="screening"
      onSubmit={(e) => {
        e.preventDefault();
        onDone(mayApply(answers, { exemptions }).map((r) => r.id));
      }}
    >
      <h2 id="screening-title">{t.screeningTitle}</h2>
      <StatePicker value={region} onChange={onRegion} />
      {region === "other" && <p className="lead">{t.otherNote}</p>}
      {rules?.status === "pending" && (
        <>
          <p className="lead" data-testid="pending">
            {t.pendingText(
              t.stateNames[rules.state],
              rules.program,
              rules.contact.phone,
            )}
          </p>
          <Source rules={rules} />
        </>
      )}
      {rules?.status === "published" && (
        <>
          <p className="lead">{t.screeningLead(rules.program, rules.agency)}</p>
          {exemptions.map((rule) => (
            <fieldset key={rule.id} className="question">
              <legend>
                {locale === "es" && rule.question_es
                  ? rule.question_es
                  : rule.question}
              </legend>
              {[true, false].map((value) => (
                <label key={String(value)}>
                  <input
                    type="radio"
                    name={rule.id}
                    checked={answers[rule.id] === value}
                    onChange={() =>
                      setAnswers({ ...answers, [rule.id]: value })
                    }
                  />
                  <span>{value ? t.yes : t.no}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button type="submit" className="primary">
            {t.seeWhatMayApply}
          </button>
        </>
      )}
    </form>
  );
}
