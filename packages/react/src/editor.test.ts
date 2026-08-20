import type { FormFieldInput } from "@formbro/core/schema/form";
import { FormSchema } from "@formbro/core/schema/form";
import { describe, expect, it } from "bun:test";
import { setEditorOptions } from "./editor";

describe("setEditorOptions", () => {
  it("drops multi-select defaults that are no longer configured options", () => {
    const field = {
      id: "extras",
      name: "Extras",
      type: "multi_select",
      label: "Extras",
      default: ["Fruit", "Salad"],
      options: ["Fruit", "Salad", "Dessert"],
    } satisfies FormFieldInput;

    const updated = setEditorOptions(field, "Salad\nDessert");

    expect(updated).toMatchObject({
      default: ["Salad"],
      options: ["Salad", "Dessert"],
    });
    expect(() =>
      FormSchema.parse({
        id: "preferences",
        name: "Preferences",
        elements: [updated],
      }),
    ).not.toThrow();

    const cleared = setEditorOptions(field, "Dessert");

    expect(cleared.default).toBeUndefined();
    expect(cleared.options).toEqual(["Dessert"]);
    expect(() =>
      FormSchema.parse({
        id: "preferences",
        name: "Preferences",
        elements: [cleared],
      }),
    ).not.toThrow();
  });
});
