import { describe, expect, it } from "bun:test";
import { _private } from "./compile";

describe("compile:listeners", () => {
  it("returns an empty map when listeners are undefined or empty", () => {
    const fieldNameToId = new Map([
      ["Title", "title"],
      ["Slug", "slug"],
    ]);

    expect(_private.compileListeners(fieldNameToId)).toEqual(new Map());
    expect(_private.compileListeners(fieldNameToId, [])).toEqual(new Map());
  });

  it("compiles listeners keyed by source field id", () => {
    const fieldNameToId = new Map([
      ["Title", "title"],
      ["Slug", "slug"],
      ["Display Title", "displaytitle"],
    ]);

    expect(
      _private.compileListeners(fieldNameToId, [
        {
          source: "Title",
          target: "Slug",
          type: "slugify",
        },
        {
          source: "Title",
          target: "Display Title",
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
              targetId: "displaytitle",
              type: "uppercase",
            },
          ],
        ],
      ]),
    );
  });

  it("builds independent listener pipelines for multiple source fields", () => {
    const fieldNameToId = new Map([
      ["Title", "title"],
      ["Slug", "slug"],
      ["Name", "name"],
      ["Shout Name", "shoutname"],
    ]);

    expect(
      _private.compileListeners(fieldNameToId, [
        {
          source: "Title",
          target: "Slug",
          type: "slugify",
        },
        {
          source: "Name",
          target: "Shout Name",
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
              targetId: "shoutname",
              type: "uppercase",
            },
          ],
        ],
      ]),
    );
  });

  it("throws when the source field cannot be resolved", () => {
    expect(() =>
      _private.compileListeners(new Map([["Slug", "slug"]]), [
        {
          source: "Missing",
          target: "Slug",
          type: "slugify",
        },
      ]),
    ).toThrow("Listener source not found: Missing");
  });

  it("throws when the target field cannot be resolved", () => {
    expect(() =>
      _private.compileListeners(new Map([["Title", "title"]]), [
        {
          source: "Title",
          target: "Missing",
          type: "uppercase",
        },
      ]),
    ).toThrow("Listener target not found: Missing");
  });

  it("throws when the source and target resolve to the same field", () => {
    expect(() =>
      _private.compileListeners(new Map([["Title", "title"]]), [
        {
          source: "Title",
          target: "Title",
          type: "slugify",
        },
      ]),
    ).toThrow("Listener source and target cannot be the same: Title");
  });
});
