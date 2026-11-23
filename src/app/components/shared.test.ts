import { describe, expect, it } from "vitest";
import fixture from "../../../tests/fixtures/reader/synthetic-work-requirement.json";
import type { LetterExtraction } from "@/lib/schema";
import { aboutImmigration } from "./shared";

const letter = fixture as unknown as LetterExtraction;

// The "no immigration advice" line shows only on letters about immigration (#48).
describe("aboutImmigration", () => {
  it("is false for a work-rules letter", () => {
    expect(aboutImmigration(letter)).toBe(false);
  });

  it.each([
    { summary: "The state could not verify your immigration status." },
    { required_action: "Send proof of U.S. citizenship." },
    { documents: ["Copy of your green card"] },
    { summary: "El estado no pudo verificar su estatus migratorio." },
    { documents: ["Prueba de ciudadanía"] },
  ])("is true when the letter mentions it: %j", (part) => {
    expect(aboutImmigration({ ...letter, ...part })).toBe(true);
  });
});
