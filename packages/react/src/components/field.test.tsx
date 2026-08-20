import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Form } from "./form";

const fieldTypes = [
  "date",
  "email",
  "link",
  "long_text",
  "multi_select",
  "number",
  "short_text",
  "single_select",
] as const;

describe("Field ARIA attributes", () => {
  for (const type of fieldTypes) {
    it(`connects ${type} controls to their field metadata`, () => {
      const markup = renderToStaticMarkup(
        <Form
          preview
          schema={{
            id: "aria_form",
            name: "ARIA form",
            elements: [
              {
                id: "answer",
                name: "Answer",
                type,
                label: "Answer",
                description: "Helpful context",
                options:
                  type === "single_select" || type === "multi_select" ? ["One", "Two"] : undefined,
                rules: [{ type: "required", value: true }],
              },
            ],
          }}
        />,
      );

      expect(markup).toContain('id="answer-description"');
      expect(markup).toContain('aria-describedby="answer-description"');
      expect(markup).toContain('aria-invalid="false"');
      expect(markup).toContain('aria-required="true"');
    });
  }

  it("names a multi-select group without pointing its question label at a checkbox", () => {
    const markup = renderToStaticMarkup(
      <Form
        preview
        schema={{
          id: "multi_select_aria_form",
          name: "Multi-select ARIA form",
          elements: [
            {
              id: "tracks",
              name: "Tracks",
              type: "multi_select",
              label: "Choose tracks",
              options: ["Product", "Engineering"],
            },
          ],
        }}
      />,
    );

    expect(markup).toContain('id="tracks-label"');
    expect(markup).not.toMatch(/data-slot="field-label"[^>]*for=/);
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-labelledby="tracks-label"');
  });

  it("names a radio group without pointing its question label at a radio", () => {
    const markup = renderToStaticMarkup(
      <Form
        preview
        schema={{
          id: "radio_group_aria_form",
          name: "Radio group ARIA form",
          elements: [
            {
              id: "attendance",
              name: "Attendance",
              type: "radio_group",
              label: "Will you attend?",
              options: ["Yes", "No"],
            },
          ],
        }}
      />,
    );

    expect(markup).toContain('id="attendance-label"');
    expect(markup).not.toMatch(/data-slot="field-label"[^>]*for=/);
    expect(markup).toContain('data-slot="radio-group"');
    expect(markup).toContain('aria-labelledby="attendance-label"');
  });

  it("uses the field name when a multi-select question label is hidden", () => {
    const markup = renderToStaticMarkup(
      <Form
        preview
        schema={{
          id: "hidden_label_aria_form",
          name: "Hidden label ARIA form",
          elements: [
            {
              id: "tracks",
              name: "Tracks",
              type: "multi_select",
              label: false,
              options: ["Product", "Engineering"],
            },
          ],
        }}
      />,
    );

    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Tracks"');
  });
});
