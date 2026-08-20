import type { FormInput } from "@formbro/core/schema/form";
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Form } from "./form";

describe("Form", () => {
  it("renders an accessible controlled radio group", () => {
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

    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-labelledby="attendance-label"');
    expect(html).toContain('aria-describedby="attendance-description"');
    expect(html).toContain('role="radio" aria-checked="true" data-state="checked" value="No"');
    expect(html).toContain('name="attendance" value="Yes"');
    expect(html).toMatch(/name="attendance" (?:checked="" )?value="No"/);
  });
});
