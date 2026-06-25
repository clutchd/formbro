import { describe, expect, it } from "bun:test";
import { _private } from "./compile.js";
import { FORMBRO_SCHEMA_VERSION } from "./schema/version.js";

describe("compile:version", () => {
  it("normalizes numeric versions to semantic versions", () => {
    expect(_private.compileVersion(3)).toBe("3.0.0");
  });

  it("pads string versions with missing parts", () => {
    expect(_private.compileVersion("1")).toBe("1.0.0");
    expect(_private.compileVersion("1.4")).toBe("1.4.0");
  });

  it("preserves already normalized versions", () => {
    expect(_private.compileVersion("1.2.3")).toBe("1.2.3");
  });

  it("trims extra version parts", () => {
    expect(_private.compileVersion("1.2.3.4")).toBe("1.2.3");
  });

  it("returns the default version for unsupported values", () => {
    expect(_private.compileVersion(undefined as unknown as string)).toBe(FORMBRO_SCHEMA_VERSION);
  });

  it("normalizes zero and one as numeric versions", () => {
    expect(_private.compileVersion(0)).toBe("0.0.0");
    expect(_private.compileVersion(1)).toBe("1.0.0");
  });
});
