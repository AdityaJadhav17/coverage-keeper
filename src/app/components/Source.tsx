import { useLocale } from "@/i18n/LocaleContext";
import { isStale, type StateRules } from "@/lib/states";
import { formatDate } from "./shared";

// Where the rules came from, when we checked, and a warning once that's over 60 days ago.
export function Source({ rules }: { rules: StateRules }) {
  const { t, locale } = useLocale();
  return (
    <p className="source">
      <a href={rules.source_url} target="_blank" rel="noreferrer">
        {t.source(rules.agency)}
      </a>
      {t.checked(formatDate(rules.retrieved, locale))}
      {isStale(rules, new Date()) && <> {t.stale}</>}
    </p>
  );
}
