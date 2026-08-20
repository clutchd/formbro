import { describe, expect, it } from "bun:test";
import { isSystemFormSlug, SYSTEM_FORMS } from "./registry";

describe("isSystemFormSlug", () => {
  it("accepts every slug registered in SYSTEM_FORMS", () => {
    for (const slug of Object.keys(SYSTEM_FORMS)) {
      expect(isSystemFormSlug(slug)).toBe(true);
    }
  });

  it("rejects unregistered and inherited property names", () => {
    expect(isSystemFormSlug("not-a-system-form")).toBe(false);
    expect(isSystemFormSlug("toString")).toBe(false);
  });
});
