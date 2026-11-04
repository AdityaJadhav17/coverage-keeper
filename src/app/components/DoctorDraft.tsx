import { useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { buildDoctorDraft } from "@/lib/doctor-draft";

// Built and kept in the browser only; nothing is sent or stored (US-040, US-041).
// The note itself stays in English, the doctor's language (US-065).
export function DoctorDraft({ deadline }: { deadline: string | null }) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  if (draft === null) {
    return (
      <button
        type="button"
        className="primary draft-open"
        onClick={() =>
          setDraft(buildDoctorDraft({ deadline, today: new Date() }))
        }
      >
        {t.draftOpen}
      </button>
    );
  }
  const canShare = typeof navigator.share === "function";
  return (
    <div className="draft">
      {t.draftInEnglish && <p>{t.draftInEnglish}</p>}
      <label htmlFor="doctor-draft">{t.draftLabel}</label>
      <textarea
        id="doctor-draft"
        lang="en"
        rows={14}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setCopyStatus("");
        }}
      />
      <div className="actions">
        <button
          type="button"
          className="primary"
          onClick={() =>
            // Also catches a missing clipboard API (older iOS, insecure context).
            Promise.resolve()
              .then(() => navigator.clipboard.writeText(draft))
              .then(
                () => setCopyStatus(t.copied),
                () => setCopyStatus(t.copyFailed),
              )
          }
        >
          {t.copy}
        </button>
        {canShare && (
          <button
            type="button"
            className="secondary"
            onClick={() => navigator.share({ text: draft }).catch(() => {})}
          >
            {t.share}
          </button>
        )}
      </div>
      <p role="status" className="copied">
        {copyStatus}
      </p>
    </div>
  );
}
