import { useLocale } from "@/i18n/LocaleContext";

export function Unclear({ onRetake }: { onRetake: () => void }) {
  const { t } = useLocale();
  return (
    <section aria-labelledby="unclear-title">
      <h2 id="unclear-title">{t.unclearTitle}</h2>
      <p className="lead">{t.unclearLead}</p>
      <ul className="facts">
        {t.unclearTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <button type="button" className="primary" onClick={onRetake}>
        {t.newPhoto}
      </button>
    </section>
  );
}
