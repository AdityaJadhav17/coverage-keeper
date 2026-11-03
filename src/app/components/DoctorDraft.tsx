import { useState } from "react";
import { buildDoctorDraft } from "@/lib/doctor-draft";

// Built and kept in the browser only; nothing is sent or stored (US-040, US-041).
export function DoctorDraft({ deadline }: { deadline: string | null }) {
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
        Draft a note to my doctor
      </button>
    );
  }
  const canShare = typeof navigator.share === "function";
  return (
    <div className="draft">
      <label htmlFor="doctor-draft">
        Note to your doctor. Edit it before you send it.
      </label>
      <textarea
        id="doctor-draft"
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
                () => setCopyStatus("Copied"),
                () =>
                  setCopyStatus(
                    "Couldn't copy. Press and hold the text to copy it.",
                  ),
              )
          }
        >
          Copy
        </button>
        {canShare && (
          <button
            type="button"
            className="secondary"
            onClick={() => navigator.share({ text: draft }).catch(() => {})}
          >
            Share
          </button>
        )}
      </div>
      <p role="status" className="copied">
        {copyStatus}
      </p>
    </div>
  );
}
