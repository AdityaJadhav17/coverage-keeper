import { describe, expect, it } from "vitest";
import { agreement, type Label } from "./label-agreement";

const label: Label = {
  id: "a",
  state: "OR",
  notice_type: "renewal",
  deadline: "2027-02-15",
  deadline_quote: "Return the form by February 15, 2027.",
  deadline_page: 1,
  required_action: "sign return form",
  documents: ["renewal form"],
  contact_phone: "1-800-699-9075",
  category: ["renewal"],
};
const row = (rows: ReturnType<typeof agreement>, field: string) =>
  rows.find((r) => r.field === field)!;

describe("agreement", () => {
  it("counts identical labels as agreeing on every field", () => {
    for (const r of agreement([label], [label]))
      expect(r, r.field).toMatchObject({
        agree: 1,
        total: 1,
        disagreements: [],
      });
  });

  it("lists the id when the deadlines differ", () => {
    const rows = agreement([label], [{ ...label, deadline: "2027-02-16" }]);
    expect(row(rows, "deadline").disagreements).toEqual(["a"]);
    expect(row(rows, "state").disagreements).toEqual([]);
  });

  it("reads required action the way scoring does", () => {
    const b = { ...label, required_action: "sign and return the form" };
    expect(row(agreement([label], [b]), "required_action").agree).toBe(1);
  });

  it("counts a phone written another way as the same", () => {
    const b = { ...label, contact_phone: "(800) 699-9075 TTY 711" };
    expect(row(agreement([label], [b]), "contact_phone").agree).toBe(1);
  });

  it("only compares ids both labelers labeled", () => {
    const rows = agreement([label, { ...label, id: "b" }], [label]);
    expect(row(rows, "deadline").total).toBe(1);
  });
});
