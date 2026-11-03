export function Consent({ onAccept }: { onAccept: () => void }) {
  return (
    <section aria-labelledby="consent-title">
      <h2 id="consent-title">Before you send a photo</h2>
      <p className="lead">
        Take a photo of a letter from the Oregon Health Plan. You&apos;ll see
        what it asks you to do, the due date, and which papers to send.
      </p>
      <ul className="facts">
        <li>An AI service reads your photo for us.</li>
        <li>We don&apos;t store your photo or your answers.</li>
        <li>
          This isn&apos;t legal advice. Only the Oregon Health Authority decides
          your coverage.
        </li>
        <li>
          If you&apos;d rather talk to a person, the OHP phone number is at the
          bottom of every screen.
        </li>
      </ul>
      <button type="button" className="primary" onClick={onAccept}>
        I understand
      </button>
    </section>
  );
}
