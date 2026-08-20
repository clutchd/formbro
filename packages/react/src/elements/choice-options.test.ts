import { describe, expect, it } from "bun:test";
import { DEFAULT_CHOICE_OPTIONS, getChoiceOptions } from "./choice-options";

describe("getChoiceOptions", () => {
  it("trims, removes empty choices, and de-duplicates values", () => {
    expect(getChoiceOptions([" First ", "", "Second", "First", "   "])).toEqual([
      "First",
      "Second",
    ]);
  });

  it("returns safe defaults when no usable choices remain", () => {
    expect(getChoiceOptions(["", "   "])).toEqual([...DEFAULT_CHOICE_OPTIONS]);
  });
});
