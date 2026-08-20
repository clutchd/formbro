import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Form, type TanStackForm } from "./form";

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

describe("Form lifecycle", () => {
  it("passes its TanStack API through the submission callbacks", async () => {
    let formApi: TanStackForm | undefined;
    const received: TanStackForm[] = [];

    renderToStaticMarkup(
      <Form
        schema={{
          id: "callback_form",
          name: "Callback form",
          elements: [],
        }}
        onMutate={({ values, tanstack }) => {
          received.push(tanstack);
          return values;
        }}
        action={({ tanstack }) => {
          received.push(tanstack);
          return { ok: true, data: undefined };
        }}
        onSuccess={({ tanstack }) => {
          received.push(tanstack);
        }}
      >
        {({ tanstack }) => {
          formApi = tanstack;
          return null;
        }}
      </Form>,
    );

    if (!formApi) throw new Error("Form API was not initialized");
    await formApi.handleSubmit();
    expect(received).toEqual([formApi, formApi, formApi]);
  });

  it("passes its TanStack API to the error callback", async () => {
    let formApi: TanStackForm | undefined;
    let received: TanStackForm | undefined;

    renderToStaticMarkup(
      <Form
        schema={{
          id: "error_callback_form",
          name: "Error callback form",
          elements: [],
        }}
        action={() => ({ ok: false, error: new Error("Submission failed") })}
        onError={({ tanstack }) => {
          received = tanstack;
        }}
      >
        {({ tanstack }) => {
          formApi = tanstack;
          return null;
        }}
      </Form>,
    );

    if (!formApi) throw new Error("Form API was not initialized");
    await formApi.handleSubmit();
    expect(received).toBe(formApi);
  });
});
