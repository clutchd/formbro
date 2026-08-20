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
  "phone",
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

  for (const type of ["multi_select", "radio_group"] as const) {
    it(`names a ${type} group without associating the question label to an option`, () => {
      const markup = renderToStaticMarkup(
        <Form
          preview
          schema={{
            id: `${type}_aria_form`,
            name: `${type} ARIA form`,
            elements: [
              {
                id: "tracks",
                name: "Tracks",
                type,
                label: "Choose tracks",
                options: ["Product", "Engineering"],
              },
            ],
          }}
        />,
      );

      const questionLabel = markup.match(/<label\b[^>]*\bid="tracks-label"[^>]*>/)?.[0];

      expect(questionLabel).toBeDefined();
      expect(questionLabel).not.toMatch(/\bfor=/);
      expect(markup).toContain(type === "radio_group" ? 'role="radiogroup"' : 'role="group"');
      expect(markup).toContain('aria-labelledby="tracks-label"');
    });
  }

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
