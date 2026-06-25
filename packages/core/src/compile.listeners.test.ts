import { describe, expect, it } from "bun:test";
import { _private } from "./compile.js";

describe("compile:listeners", () => {
  it("returns an empty map when listeners are undefined or empty", () => {
    const fieldIds = new Set(["title", "slug"]);

    expect(_private.compileListeners(fieldIds)).toEqual(new Map());
    expect(_private.compileListeners(fieldIds, [])).toEqual(new Map());
  });

  it("compiles listeners keyed by source field id", () => {
    const fieldIds = new Set(["title", "slug", "display_title"]);

    expect(
      _private.compileListeners(fieldIds, [
        {
          source: "title",
          target: "slug",
          type: "slugify",
        },
        {
          source: "title",
          target: "display_title",
          type: "uppercase",
        },
      ]),
    ).toEqual(
      new Map([
        [
          "title",
          [
            {
              event: "onChange",
              targetId: "slug",
              type: "slugify",
            },
            {
              event: "onChange",
              targetId: "display_title",
              type: "uppercase",
            },
          ],
        ],
      ]),
    );
  });

  it("builds independent listener pipelines for multiple source fields", () => {
    const fieldIds = new Set(["title", "slug", "name", "shout_name"]);

    expect(
      _private.compileListeners(fieldIds, [
        {
          source: "title",
          target: "slug",
          type: "slugify",
        },
        {
          source: "name",
          target: "shout_name",
          type: "uppercase",
        },
      ]),
    ).toEqual(
      new Map([
        [
          "title",
          [
            {
              event: "onChange",
              targetId: "slug",
              type: "slugify",
            },
          ],
        ],
        [
          "name",
          [
            {
              event: "onChange",
              targetId: "shout_name",
              type: "uppercase",
            },
          ],
        ],
      ]),
    );
  });

  it("throws when the source field cannot be resolved", () => {
    expect(() =>
      _private.compileListeners(new Set(["slug"]), [
        {
          source: "missing",
          target: "slug",
          type: "slugify",
        },
      ]),
    ).toThrow("Listener source not found: missing");
  });

  it("throws when the target field cannot be resolved", () => {
    expect(() =>
      _private.compileListeners(new Set(["title"]), [
        {
          source: "title",
          target: "missing",
          type: "uppercase",
        },
      ]),
    ).toThrow("Listener target not found: missing");
  });

  it("throws when the source and target resolve to the same field", () => {
    expect(() =>
      _private.compileListeners(new Set(["title"]), [
        {
          source: "title",
          target: "title",
          type: "slugify",
        },
      ]),
    ).toThrow("Listener source and target cannot be the same: title");
  });
});
