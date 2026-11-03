export function Problem({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section role="alert" aria-labelledby="problem-title">
      <h2 id="problem-title">{title}</h2>
      <p className="lead">{text}</p>
      <button type="button" className="primary" onClick={onAction}>
        {action}
      </button>
    </section>
  );
}
