import { useState } from "react";
import rules from "../../../data/rules/or.json";
import { useLocale } from "@/i18n/LocaleContext";
import { mayApply } from "@/lib/screening";

export function Screening({ onDone }: { onDone: (yes: string[]) => void }) {
  const { t, locale } = useLocale();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  return (
    <form
      aria-labelledby="screening-title"
      className="screening"
      onSubmit={(e) => {
        e.preventDefault();
        onDone(mayApply(answers, rules).map((r) => r.id));
      }}
    >
      <h2 id="screening-title">{t.screeningTitle}</h2>
      <p className="lead">{t.screeningLead}</p>
      <p>{t.screeningScope}</p>
      {rules.exemptions.map((rule) => (
        <fieldset key={rule.id} className="question">
          <legend>{locale === "es" ? rule.question_es : rule.question}</legend>
          {[true, false].map((value) => (
            <label key={String(value)}>
              <input
                type="radio"
                name={rule.id}
                checked={answers[rule.id] === value}
                onChange={() => setAnswers({ ...answers, [rule.id]: value })}
              />
              <span>{value ? t.yes : t.no}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <button type="submit" className="primary">
        {t.seeWhatMayApply}
      </button>
    </form>
  );
}
