import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Form } from "./form";

const fieldTypes = ["email", "link", "long_text", "number", "short_text", "single_select"] as const;

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
                options: type === "single_select" ? ["One", "Two"] : undefined,
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
});
