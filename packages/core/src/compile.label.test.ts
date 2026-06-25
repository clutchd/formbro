import { describe, expect, it } from "bun:test";
import { _private } from "./compile.js";

describe("compile:label", () => {
  it("returns string label when label is a string", () => {
    expect(_private.compileLabel("Email Address")).toBe("Email Address");
    expect(_private.compileLabel("")).toBe("");
  });

  it("returns fallback when label is true", () => {
    expect(_private.compileLabel(true, "Field Name")).toBe("Field Name");
  });

  it("returns undefined when label is true but no fallback", () => {
    expect(_private.compileLabel(true)).toBeUndefined();
  });

  it("returns undefined when label is false", () => {
    expect(_private.compileLabel(false)).toBeUndefined();
    expect(_private.compileLabel(false, "Fallback")).toBeUndefined();
  });

  it("returns undefined when label is undefined", () => {
    expect(_private.compileLabel(undefined)).toBeUndefined();
    expect(_private.compileLabel(undefined, "Fallback")).toBeUndefined();
  });
});
