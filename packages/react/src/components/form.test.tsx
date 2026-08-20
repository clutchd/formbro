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

  it("renders a native telephone input with contact autofill hints", () => {
    const schema = {
      id: "contact",
      name: "Contact",
      elements: [
        {
          id: "phone",
          name: "Phone",
          type: "phone",
          label: "Phone",
          default: "+1 (415) 555-0100",
        },
      ],
    } as const satisfies FormInput;

    const html = renderToStaticMarkup(<Form schema={schema} preview />);

    expect(html).toContain('id="phone"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('type="tel"');
    expect(html).toContain('inputMode="tel"');
    expect(html).toContain('autoComplete="tel"');
    expect(html).toContain('value="+1 (415) 555-0100"');
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
