import { describe, expectTypeOf, it } from "bun:test";
import type { FormInput, FormValues } from "./form";

describe("FormValues", () => {
  it("infers array values for multi-select fields", () => {
    const schema = {
      id: "registration",
      name: "Registration",
      elements: [
        { id: "name", name: "Name", type: "short_text", label: "Name" },
        {
          id: "roles",
          name: "Roles",
          type: "multi_select",
          label: "Roles",
          options: ["Author", "Reviewer"],
        },
      ],
    } as const satisfies FormInput;

    expectTypeOf<FormValues<typeof schema>["name"]>().toEqualTypeOf<string>();
    expectTypeOf<FormValues<typeof schema>["roles"]>().toEqualTypeOf<string[]>();
  });

  it("allows both stored value shapes for dynamic schemas", () => {
    expectTypeOf<FormValues>().toEqualTypeOf<Record<string, string | string[]>>();
  });
});
