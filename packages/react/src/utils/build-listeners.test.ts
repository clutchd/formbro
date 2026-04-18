import type { CompiledListeners } from "@formbro/core/compile";
import { describe, expect, it } from "bun:test";
import { buildListeners } from "./build-listeners";

type ListenerFormApi = Parameters<typeof buildListeners>[0];
type BuiltListeners = ReturnType<typeof buildListeners>;

function createFormApi() {
  const calls = new Array<{ field: string; value: unknown }>();

  const tanstack: ListenerFormApi = {
    setFieldValue(field, value) {
      calls.push({ field, value });
    },
  };

  return { tanstack, calls };
}

function triggerOnChange(listeners: BuiltListeners, sourceId: string, value: string) {
  const onChange = listeners.get(sourceId)?.onChange;

  expect(onChange).toBeDefined();

  if (!onChange) {
    throw new Error(`Missing onChange listener for ${sourceId}`);
  }

  onChange({ value } as Parameters<typeof onChange>[0]);
}

describe("buildListeners", () => {
  it("returns an empty map when there are no compiled listeners", () => {
    const { tanstack } = createFormApi();

    expect(buildListeners(tanstack, new Map())).toEqual(new Map());
  });

  it("ignores source entries that have no listener steps", () => {
    const { tanstack } = createFormApi();
    const listeners: CompiledListeners = new Map([["title", []]]);

    expect(buildListeners(tanstack, listeners)).toEqual(new Map());
  });

  it("builds a slugify onChange listener", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
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
    ]);

    const result = buildListeners(tanstack, listeners);

    triggerOnChange(result, "title", "Hello World");

    expect(calls).toEqual([
      {
        field: "slug",
        value: "hello-world",
      },
    ]);
  });

  it("slugifies special characters using the current runtime transform", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
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
    ]);

    const result = buildListeners(tanstack, listeners);

    triggerOnChange(result, "title", "FormBro Test & Demo!");

    expect(calls).toEqual([
      {
        field: "slug",
        value: "formbro-test-and-demo",
      },
    ]);
  });

  it("slugifies nullish values to an empty string", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
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
    ]);

    const result = buildListeners(tanstack, listeners);
    const onChange = result.get("title")?.onChange;

    expect(onChange).toBeDefined();

    if (!onChange) {
      throw new Error("Missing onChange listener for title");
    }

    onChange({ value: undefined } as Parameters<typeof onChange>[0]);

    expect(calls).toEqual([
      {
        field: "slug",
        value: "",
      },
    ]);
  });

  it("builds an uppercase onChange listener", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
      [
        "title",
        [
          {
            event: "onChange",
            targetId: "displayTitle",
            type: "uppercase",
          },
        ],
      ],
    ]);

    const result = buildListeners(tanstack, listeners);

    triggerOnChange(result, "title", "Hello World");

    expect(calls).toEqual([
      {
        field: "displayTitle",
        value: "HELLO WORLD",
      },
    ]);
  });

  it("builds a locale-aware uppercase listener", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
      [
        "title",
        [
          {
            event: "onChange",
            targetId: "displayTitle",
            type: "uppercase",
          },
        ],
      ],
    ]);

    const result = buildListeners(tanstack, listeners);

    triggerOnChange(result, "title", "straße");

    expect(calls).toEqual([
      {
        field: "displayTitle",
        value: "STRASSE",
      },
    ]);
  });

  it("uppercases nullish values to an empty string", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
      [
        "title",
        [
          {
            event: "onChange",
            targetId: "displayTitle",
            type: "uppercase",
          },
        ],
      ],
    ]);

    const result = buildListeners(tanstack, listeners);
    const onChange = result.get("title")?.onChange;

    expect(onChange).toBeDefined();

    if (!onChange) {
      throw new Error("Missing onChange listener for title");
    }

    onChange({ value: undefined } as Parameters<typeof onChange>[0]);

    expect(calls).toEqual([
      {
        field: "displayTitle",
        value: "",
      },
    ]);
  });

  it("processes multiple listener steps in order", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
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
            targetId: "displayTitle",
            type: "uppercase",
          },
        ],
      ],
    ]);

    const result = buildListeners(tanstack, listeners);

    triggerOnChange(result, "title", "Hello World");

    expect(calls).toEqual([
      {
        field: "slug",
        value: "hello-world",
      },
      {
        field: "displayTitle",
        value: "HELLO WORLD",
      },
    ]);
  });

  it("builds independent listeners for multiple source fields", () => {
    const { tanstack, calls } = createFormApi();
    const listeners: CompiledListeners = new Map([
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
            targetId: "shoutName",
            type: "uppercase",
          },
        ],
      ],
    ]);

    const result = buildListeners(tanstack, listeners);

    triggerOnChange(result, "title", "Hello World");
    triggerOnChange(result, "name", "Jane Doe");

    expect(calls).toEqual([
      {
        field: "slug",
        value: "hello-world",
      },
      {
        field: "shoutName",
        value: "JANE DOE",
      },
    ]);
  });
});
