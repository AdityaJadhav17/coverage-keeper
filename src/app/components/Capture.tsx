export function Capture({
  error,
  onPick,
}: {
  error?: string;
  onPick: (file: File | undefined) => void;
}) {
  return (
    <section aria-labelledby="capture-title">
      <h2 id="capture-title">Photograph the first page</h2>
      <p className="lead">
        Lay it flat near a window or lamp, and get all four corners in the
        frame.
      </p>
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
        <span>Scan my letter</span>
      </label>
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </section>
  );
}
