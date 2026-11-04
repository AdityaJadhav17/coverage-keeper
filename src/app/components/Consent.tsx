// Welcome screen. Tapping "Start with my letter" is the consent: everything the
// person agrees to is on this screen above the button (US-055).
export function Consent({ onAccept }: { onAccept: () => void }) {
  return (
    <section aria-labelledby="consent-title" className="welcome">
      <h2 id="consent-title">Got a letter about your health coverage?</h2>
      <p className="lead">
        Take a photo. In about a minute you&apos;ll know what it asks for, when
        it&apos;s due, and what to send.
      </p>
      <ol className="path" aria-label="How it works">
        <li>Photo</li>
        <li>What it means</li>
        <li>What to send</li>
      </ol>
      <button type="button" className="primary" onClick={onAccept}>
        Start with my letter
      </button>
      <p className="effort">About a minute · No sign-up · Free</p>
      <p className="assure">
        We don&apos;t save your photo. You decide what to send; we never contact
        the state for you.
      </p>
      <p className="promise">
        <strong>Rather talk to a person?</strong> Call the number on your
        letter. We show it on every screen.
      </p>
      <p className="smallprint">
        Free and independent. Not run by any state agency. This isn&apos;t legal
        advice; only your state decides your coverage. An AI service reads your
        photo for us.
      </p>
    </section>
  );
}
