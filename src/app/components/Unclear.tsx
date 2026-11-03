export function Unclear({ onRetake }: { onRetake: () => void }) {
  return (
    <section aria-labelledby="unclear-title">
      <h2 id="unclear-title">We couldn&apos;t read this clearly</h2>
      <p className="lead">A new photo usually fixes it:</p>
      <ul className="facts">
        <li>Turn on a light or move closer to a window.</li>
        <li>Lay the letter on a flat surface.</li>
        <li>Hold the phone straight above the page so it fills the frame.</li>
      </ul>
      <button type="button" className="primary" onClick={onRetake}>
        Take a new photo
      </button>
    </section>
  );
}
