import type { FormInput } from "@formbro/core/schema/form";
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Form } from "./form";

describe("Form", () => {
  it("renders a native date input with an ISO string value", () => {
    const schema = {
      id: "event",
      name: "Event",
      elements: [
        {
          id: "start_date",
          name: "Start date",
          type: "date",
          label: "Start date",
          default: "2026-08-19",
        },
      ],
    } as const satisfies FormInput;

    const html = renderToStaticMarkup(<Form schema={schema} preview />);

    expect(html).toContain('id="start_date"');
    expect(html).toContain('name="start_date"');
    expect(html).toContain('type="date"');
    expect(html).toContain('value="2026-08-19"');
  });

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
          options: ["Yes", "No", "Yes"],
          rules: [{ type: "required", value: true }],
        },
      ],
    } as const satisfies FormInput;

    const html = renderToStaticMarkup(<Form schema={schema} preview />);

    expect(html).toContain('data-slot="radio-group"');
    expect(html).toContain('data-state="checked" value="No"');
    expect(html).toContain('name="attendance" value="Yes"');
    expect(html.match(/name="attendance" value="Yes"/g)).toHaveLength(1);
    expect(html).toMatch(/name="attendance" (?:checked="" )?value="No"/);
  });
});
