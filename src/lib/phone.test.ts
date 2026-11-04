import { describe, expect, it } from "vitest";
import { phoneHref } from "./phone";

describe("phoneHref", () => {
  it.each([
    ["800-699-9075 (TTY 711)", "tel:+18006999075"],
    ["1-800-699-9075", "tel:+18006999075"],
    ["(503) 945-5944", "tel:+15039455944"],
    ["+1 503.945.5944 ext. 12", "tel:+15039455944"],
  ])("dials the first number in %j", (phone, href) => {
    expect(phoneHref(phone)).toBe(href);
  });

  it.each(["call us!", "", "711", "12345678901234"])(
    "has no number in %j",
    (phone) => {
      expect(phoneHref(phone)).toBeNull();
    },
  );
});
