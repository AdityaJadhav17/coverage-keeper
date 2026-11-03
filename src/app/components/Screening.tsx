import { useState } from "react";
import rules from "../../../data/rules/or.json";
import { mayApply } from "@/lib/screening";

export function Screening({ onDone }: { onDone: (yes: string[]) => void }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  return (
    <form
      aria-labelledby="screening-title"
      onSubmit={(e) => {
        e.preventDefault();
        onDone(mayApply(answers, rules).map((r) => r.id));
      }}
    >
      <h2 id="screening-title">Exemption questions</h2>
      <p className="lead">
        Some OHP members don&apos;t have to meet the work rule. These questions
        follow the Oregon Health Authority&apos;s list. Skip any you&apos;d
        rather not answer.
      </p>
      <p>
        These questions use Oregon Health Plan (OHP) rules. If your letter is
        from another state, call the number on your letter.
      </p>
      {rules.exemptions.map((rule) => (
        <fieldset key={rule.id} className="question">
          <legend>{rule.question}</legend>
          {[true, false].map((value) => (
            <label key={String(value)}>
              <input
                type="radio"
                name={rule.id}
                checked={answers[rule.id] === value}
                onChange={() => setAnswers({ ...answers, [rule.id]: value })}
              />
              <span>{value ? "Yes" : "No"}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <button type="submit" className="primary">
        See what may apply
      </button>
    </form>
  );
}
