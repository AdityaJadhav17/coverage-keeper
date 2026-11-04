import { useLocale } from "@/i18n/LocaleContext";

// Welcome screen. Tapping "Start with my letter" is the consent: everything the
// person agrees to is on this screen above the button (US-055).
export function Consent({ onAccept }: { onAccept: () => void }) {
  const { t } = useLocale();
  return (
    <section aria-labelledby="consent-title" className="welcome">
      <h2 id="consent-title">{t.welcomeTitle}</h2>
      <p className="lead">{t.welcomeLead}</p>
      <ol className="path" aria-label={t.howItWorks}>
        {t.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h3 id="before-title" className="kicker">
        {t.beforeYouStart}
      </h3>
      <ul className="facts-list" aria-labelledby="before-title">
        {t.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      <button type="button" className="primary" onClick={onAccept}>
        {t.start}
      </button>
      <p className="effort">{t.effort}</p>
      <p className="promise">
        <strong>{t.promiseLead}</strong> {t.promise}
      </p>
    </section>
  );
}
