import { describe, expect, it } from "bun:test";
import { _private } from "./use-form";

describe("form value serialization", () => {
  it("preserves multi-select arrays while stringifying scalar values", () => {
    expect(
      _private.serializeFormValues({
        count: 2,
        name: "Ada",
        roles: ["Author", "Reviewer"],
      }),
    ).toEqual({
      count: "2",
      name: "Ada",
      roles: ["Author", "Reviewer"],
    });
  });
});
