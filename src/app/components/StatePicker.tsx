import { useLocale } from "@/i18n/LocaleContext";
import { STATE_CODES, type Region } from "@/lib/states";

// One control both shows and changes the state, so a wrong guess is one tap to fix (US-080).
export function StatePicker({
  value,
  onChange,
}: {
  value: Region | null;
  onChange: (region: Region) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="state-picker">
      <label htmlFor="state">{t.stateLabel}</label>
      <select
        id="state"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as Region)}
      >
        {value === null && (
          <option value="" disabled>
            {t.stateChoose}
          </option>
        )}
        {STATE_CODES.map((code) => (
          <option key={code} value={code}>
            {t.stateNames[code]}
          </option>
        ))}
        <option value="other">{t.stateOther}</option>
      </select>
    </div>
  );
}
