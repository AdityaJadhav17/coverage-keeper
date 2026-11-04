// First US 10-digit number in the text; ignores extensions and TTY numbers after it.
const US_PHONE =
  /(?<!\d)(?:\+?1[\s.-]*)?\(?(\d{3})\)?[\s.-]*(\d{3})[\s.-]*(\d{4})(?!\d)/;

// null when the text has no number we can dial.
export function phoneHref(phone: string): string | null {
  const m = phone.match(US_PHONE);
  return m ? `tel:+1${m[1]}${m[2]}${m[3]}` : null;
}
