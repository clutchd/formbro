import { describe, expect, it } from "bun:test";
import { normalizeFormValues } from "./use-form";

describe("normalizeFormValues", () => {
  it("preserves array-valued fields for submissions", () => {
    expect(
      normalizeFormValues({
        name: "Ada",
        skills: ["TypeScript", "React"],
      }),
    ).toEqual({
      name: "Ada",
      skills: ["TypeScript", "React"],
    });
  });
});
