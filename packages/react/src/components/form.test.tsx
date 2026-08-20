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

  it("renders a controlled checkbox group", () => {
    const schema = {
      id: "skills_preview",
      name: "Skills preview",
      elements: [
        {
          id: "skills",
          name: "Skills",
          type: "checkbox_group",
          label: "Select your skills",
          description: "Select all that apply.",
          default: ["React"],
          options: ["TypeScript", "React", "React"],
          rules: [{ type: "required", value: true }],
        },
      ],
    } as const satisfies FormInput;

    const html = renderToStaticMarkup(<Form schema={schema} preview />);

    expect(html).toContain('data-slot="checkbox-group"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-describedby="skills-description"');
    expect(html).toContain('aria-required="true"');
    expect(html).toContain('data-state="checked" value="React"');
    expect(html).toContain('name="skills" value="TypeScript"');
    expect(html.match(/name="skills"(?: checked="")? value="React"/g)).toHaveLength(1);
  });
});
