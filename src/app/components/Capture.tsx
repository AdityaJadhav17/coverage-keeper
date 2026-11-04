import { useLocale } from "@/i18n/LocaleContext";

export function Capture({
  error,
  onPick,
}: {
  error?: string;
  onPick: (file: File | undefined) => void;
}) {
  const { t } = useLocale();
  return (
    <section aria-labelledby="capture-title">
      <h2 id="capture-title">{t.captureTitle}</h2>
      <p className="lead">{t.captureLead}</p>
      <label className="primary pick">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <span>{t.scan}</span>
      </label>
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </section>
  );
}
