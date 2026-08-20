import type { FormInput } from "@formbro/core/schema/form";
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Form } from "./form";

describe("Form", () => {
  it("renders a controlled radio group", () => {
    const schema = {
      id: "radio_preview",
      name: "Radio preview",
      elements: [
        {
          id: "attendance",
          name: "Attendance",
          type: "radio_group",
          label: "Will you attend?",
          description: "Choose one response.",
          default: "No",
          options: ["Yes", "No"],
          rules: [{ type: "required", value: true }],
        },
      ],
    } as const satisfies FormInput;

    const html = renderToStaticMarkup(<Form schema={schema} preview />);

    expect(html).toContain('data-slot="radio-group"');
    expect(html).toContain('data-state="checked" value="No"');
    expect(html).toContain('name="attendance" value="Yes"');
    expect(html).toMatch(/name="attendance" (?:checked="" )?value="No"/);
  });
});
