import rules from "../../../data/rules/or.json";
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
  const matched = rules.exemptions.filter((r) => yes.includes(r.id));
  const source = (
    <p className="source">
      <a href={rules.source_url} target="_blank" rel="noreferrer">
        Source: Oregon Health Authority
      </a>
      , checked {formatDate(rules.retrieved)}
    </p>
  );
  return (
    <section aria-labelledby="screened-title">
      {matched.length > 0 ? (
        <>
          <h2 id="screened-title">Exemptions to ask about</h2>
          <ul className="matches">
            {matched.map((rule) => (
              <li key={rule.id} data-testid="may-apply">
                <p className="q">{rule.question}</p>
                <p>This may apply to you. Ask OHP about it.</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2 id="screened-title">Ways to meet the work rule</h2>
          <p className="lead">
            {rules.applies_to} You can meet the rule with one of these:
          </p>
          <ul className="facts">
            {rules.ways_to_meet.map((way) => (
              <li key={way.id}>{way.text}</li>
            ))}
          </ul>
        </>
      )}
      {yes.includes("health_condition") && <DoctorDraft deadline={deadline} />}
      {source}
      <button type="button" className="secondary" onClick={onBack}>
        Back
      </button>
    </section>
  );
}
