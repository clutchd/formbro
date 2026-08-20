import { describe, expect, it } from "bun:test";
import { compile } from "./compile";
import { normalizePhoneValue, normalizeSubmissionValues } from "./normalization";

describe("phone normalization", () => {
  it("cleans surrounding and repeated whitespace without changing phone formatting", () => {
    expect(normalizePhoneValue("  +44 (0)20\t7946  0958 ext. 2  ")).toBe(
      "+44 (0)20 7946 0958 ext. 2",
    );
  });

  it("normalizes only phone fields in submission values", () => {
    const form = compile({
      id: "phone_normalization",
      name: "Phone normalization",
      elements: [
        { id: "phone", name: "Phone", type: "phone", label: "Phone" },
        { id: "notes", name: "Notes", type: "short_text", label: "Notes" },
      ],
    });
    const values = {
      phone: "  +1 (415)  555-0100  ",
      notes: "  Keep this spacing  ",
      unknown: "  unchanged  ",
    };

    expect(normalizeSubmissionValues(form, values)).toEqual({
      phone: "+1 (415) 555-0100",
      notes: "  Keep this spacing  ",
      unknown: "  unchanged  ",
    });
    expect(values.phone).toBe("  +1 (415)  555-0100  ");
  });

  it("reuses submissions whose phone values are already normalized", () => {
    const form = compile({
      id: "normalized_phone",
      name: "Normalized phone",
      elements: [{ id: "phone", name: "Phone", type: "phone", label: "Phone" }],
    });
    const values = { phone: "+1 (415) 555-0100" };

    expect(normalizeSubmissionValues(form, values)).toBe(values);
  });
});
