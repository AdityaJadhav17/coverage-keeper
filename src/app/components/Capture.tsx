import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { MAX_PAGES } from "@/lib/collect-files";

// The pages waiting to be read: photos in order, or one PDF.
export type Tray =
  { kind: "images"; files: File[] } | { kind: "pdf"; file: File } | null;

// A mouse or trackpad: laptops get the folder picker and the drop area (US-072, US-073).
const FINE = "(pointer: fine)";
const subscribeFine = (onChange: () => void) => {
  const query = matchMedia(FINE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useFinePointer = () =>
  useSyncExternalStore(
    subscribeFine,
    () => matchMedia(FINE).matches,
    () => false,
  );

function Picker({
  label,
  className,
  onFiles,
  ...input
}: {
  label: string;
  className: string;
  onFiles: (files: File[]) => void;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`${className} pick`}>
      <input
        type="file"
        {...input}
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
      <span>{label}</span>
    </label>
  );
}

function Thumb({ file, n }: { file: File; n: number }) {
  const { t } = useLocale();
  const [url, setUrl] = useState<string>();
  // One object URL per page, freed when the page is removed or the screen closes.
  useEffect(() => {
    const u = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL must be made and freed in the same effect
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  // A local blob: preview, so next/image's optimizer has nothing to do.
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt={t.pageN(n)} /> : null;
}

export function Capture({
  tray,
  error,
  onAdd,
  onRemove,
  onRead,
}: {
  tray: Tray;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onRead: () => void;
}) {
  const { t } = useLocale();
  const fine = useFinePointer();
  const chooser = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pages = tray?.kind === "images" ? tray.files : [];
  const canAdd = !tray || (tray.kind === "images" && pages.length < MAX_PAGES);

  return (
    <section aria-labelledby="capture-title">
      <h2 id="capture-title">{t.captureTitle}</h2>
      <p className="lead">{t.captureLead}</p>

      {tray && (
        <ol className="tray" aria-label={t.readPages(null)}>
          {tray.kind === "pdf" ? (
            <li className="tray-pdf">{tray.file.name}</li>
          ) : (
            pages.map((file, i) => (
              <li key={`${i}-${file.name}-${file.lastModified}`}>
                <Thumb file={file} n={i + 1} />
                <span>{t.pageN(i + 1)}</span>
                <button
                  type="button"
                  className="link"
                  aria-label={t.removePage(i + 1)}
                  onClick={() => onRemove(i)}
                >
                  {t.remove}
                </button>
              </li>
            ))
          )}
        </ol>
      )}

      <div className="pickers">
        {tray && (
          <button type="button" className="primary" onClick={onRead}>
            {t.readPages(tray.kind === "pdf" ? null : pages.length)}
          </button>
        )}
        {canAdd && (
          <Picker
            // A fresh element, so the primary style doesn't fade into the secondary one.
            key={tray ? "add" : "scan"}
            label={tray ? t.addPage : t.scan}
            className={tray ? "secondary" : "primary camera"}
            accept="image/*"
            capture="environment"
            multiple={!!tray}
            // With pages in the tray, the drop area opens this picker instead.
            ref={tray ? chooser : undefined}
            onFiles={onAdd}
          />
        )}
        {!tray && (
          <Picker
            label={t.choose}
            className="secondary"
            accept="image/*,application/pdf"
            multiple
            ref={chooser}
            onFiles={onAdd}
          />
        )}
        {!tray && fine && (
          <Picker
            label={t.chooseFolder}
            className="secondary"
            // Not in React's types; Chrome, Edge, Firefox and Safari all support it.
            {...{ webkitdirectory: "" }}
            onFiles={onAdd}
          />
        )}
        {canAdd && fine && (
          <button
            type="button"
            className={over ? "drop over" : "drop"}
            onClick={() => chooser.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              onAdd([...e.dataTransfer.files]);
            }}
          >
            <span>{t.dropHere}</span>
            <span className="hint">{t.dropHint}</span>
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </section>
  );
}
