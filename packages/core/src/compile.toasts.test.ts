import { describe, expect, it } from "bun:test";
import { _private } from "./compile";

describe("compile:toasts", () => {
  it("returns undefined when toasts are disabled", () => {
    expect(_private.compileToasts(false)).toBeUndefined();
    expect(_private.compileToasts(undefined)).toBeUndefined();
  });

  it("returns all default toast messages when enabled as true", () => {
    expect(_private.compileToasts(true)).toEqual({
      success: "Form submitted successfully!",
      error: "An error occurred while submitting the form",
      loading: "Submitting Form...",
    });
  });

  it("fills missing object values with defaults", () => {
    expect(
      _private.compileToasts({
        success: "Saved!",
      }),
    ).toEqual({
      success: "Saved!",
      error: "An error occurred while submitting the form",
      loading: "Submitting Form...",
    });
  });

  it("allows individual toast messages to be disabled", () => {
    expect(
      _private.compileToasts({
        success: false,
        error: "Something broke",
        loading: false,
      }),
    ).toEqual({
      success: undefined,
      error: "Something broke",
      loading: undefined,
    });
  });
});
