// The logo mark: a letter with a marigold check (docs/design/2026-11-03-rebrand.md). Decorative.
export function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 32 32"
      width="28"
      height="28"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="8" fill="#1F5C4A" />
      <path
        d="M9 11h14v12H9z"
        fill="none"
        stroke="#FBF7F0"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="m12.5 17.2 2.6 2.6 5-5.3"
        fill="none"
        stroke="#FFD166"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
