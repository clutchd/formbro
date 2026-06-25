import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AiMessage, type FormEditorAiMessage } from "./messages";
import { shouldShowAiThinkingIndicator } from "./thinking";

type AiMessageProps = Parameters<typeof AiMessage>[0];

function renderMessage(
  message: FormEditorAiMessage,
  props: Partial<Omit<AiMessageProps, "message">> = {},
) {
  return renderToStaticMarkup(<AiMessage message={message} onFeedback={() => {}} {...props} />);
}

describe("AiMessage", () => {
  test("renders text and tool parts in message order", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        { type: "text", text: "First update." },
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: {
            operations: [{ count: 1, label: "Added 1 field", target: "field", type: "add" }],
          },
        },
        { type: "text", text: "Second update." },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html.indexOf("First update.")).toBeLessThan(html.indexOf("Added 1 field"));
    expect(html.indexOf("Added 1 field")).toBeLessThan(html.indexOf("Second update."));
  });

  test("renders assistant markdown as scannable structure", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "What changed: - Added `email`. - Updated **title**.",
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).toContain("<strong");
    expect(html).toContain("<ul");
    expect(html).toContain("<code");
    expect(html).toContain("<li>Added");
    expect(html).toContain("<li>Updated");
  });

  test("does not render an empty wrapper for messages without visible parts", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [],
    } as unknown as FormEditorAiMessage;

    expect(renderMessage(message)).toBe("");
  });

  test("renders saved edit operations as activity rows", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: {
            operations: [{ count: 1, label: "Added 1 field", target: "field", type: "add" }],
          },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).toContain("Added 1 field");
    expect(html).not.toContain("Undo AI changes");
  });

  test("renders the right text prompt after a feedback rating", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        { type: "text", text: "Updated the form." },
        {
          type: "tool-finish_form_edit",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: { summary: "The form is ready." },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderToStaticMarkup(
      <AiMessage
        feedback="down"
        feedbackTextPrompt={{ messageId: "assistant-message", rating: "down" }}
        message={message}
        onFeedback={() => {}}
        onFeedbackTextDismiss={() => {}}
        onFeedbackTextSubmit={() => {}}
      />,
    );

    expect(html).toContain("What went wrong?");
    expect(html).toContain("Add a quick note");
    expect(html).toContain("Cancel");
    expect(html).toContain("Send");

    expect(
      renderMessage(message, {
        feedback: "up",
        feedbackTextPrompt: { messageId: "assistant-message", rating: "up" },
      }),
    ).toContain("What worked well?");
  });

  test("highlights selected feedback and shows recorded acknowledgement", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-finish_form_edit",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: { summary: "The form is ready." },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message, { feedback: "up", feedbackRecorded: true });

    expect(html).toContain("Feedback recorded");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("text-primary");
  });

  test("renders the rolling draft activity from completed schema edits", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-remove",
          output: {
            operations: [
              { count: 2, label: "Removed 2 pages", target: "page", type: "remove" },
              { count: 1, label: "Removed 1 element", target: "element", type: "remove" },
            ],
          },
        },
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-title",
          output: {
            operations: [{ label: "Updated form name", target: "title", type: "update" }],
          },
        },
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-elements",
          output: {
            operations: [
              { count: 2, label: "Added 2 elements", target: "element", type: "add" },
              { count: 2, label: "Added 2 fields", target: "field", type: "add" },
            ],
          },
        },
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-submit",
          output: {
            operations: [{ label: "Updated submit button", target: "submit", type: "update" }],
          },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).not.toContain("Removed 2 pages");
    expect(html).not.toContain("Removed 1 element");
    expect(html).toContain("Updated form name");
    expect(html).toContain("Added 2 elements");
    expect(html).toContain("Added 2 fields");
    expect(html).toContain("Updated submit button");
    expect(html).not.toContain("Add email field");
    expect(html.indexOf("Updated form name")).toBeLessThan(html.indexOf("Added 2 elements"));
    expect(html.indexOf("Added 2 elements")).toBeLessThan(html.indexOf("Added 2 fields"));
  });

  test("sorts mixed tool output into the form edit flow", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-apply_form_schema",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: {
            operations: [
              { count: 3, label: "Added 3 fields", target: "field", type: "add" },
              { label: "Updated submit button", target: "submit", type: "update" },
              { label: "Updated form name", target: "title", type: "update" },
              { count: 1, label: "Removed 1 page", target: "page", type: "remove" },
              { count: 2, label: "Added 2 pages", target: "page", type: "add" },
              { count: 1, label: "Added 1 element", target: "element", type: "add" },
            ],
            summary: "Done.",
          },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html.indexOf("Removed 1 page")).toBeLessThan(html.indexOf("Updated form name"));
    expect(html.indexOf("Updated form name")).toBeLessThan(html.indexOf("Added 2 pages"));
    expect(html.indexOf("Added 2 pages")).toBeLessThan(html.indexOf("Added 1 element"));
    expect(html.indexOf("Added 1 element")).toBeLessThan(html.indexOf("Added 3 fields"));
    expect(html.indexOf("Added 3 fields")).toBeLessThan(html.indexOf("Updated submit button"));
  });

  test("renders legacy full-schema tool output without the generic fallback label", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-apply_form_schema",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: {
            operations: [
              { count: 2, label: "Removed 2 pages", target: "page", type: "remove" },
              { count: 8, label: "Added attendee details", target: "field", type: "add" },
            ],
            summary: "Post-party survey is ready.",
          },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).toContain("Removed 2 pages");
    expect(html).toContain("Added 8 fields");
    expect(html).toContain("Post-party survey is ready.");
    expect(html).not.toContain("apply form schema complete");
  });

  test("renders one stable progress row while schema edits are still running", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "input-streaming",
          toolCallId: "tool-call-1",
          input: {
            label: "Adding form elements",
            type: "add_layout_elements",
          },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).toContain("Adding form elements");
    expect(html.match(/Adding form elements/g) ?? []).toHaveLength(1);
    expect(html).not.toContain("Drafting change");
    expect(html).not.toContain("Saving change");
  });

  test("only renders the latest working schema edit", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "input-available",
          toolCallId: "tool-call-1",
          input: { label: "Removing old fields", type: "remove_elements" },
        },
        {
          type: "tool-edit_form_schema",
          state: "input-streaming",
          toolCallId: "tool-call-2",
          input: { label: "Adding pages", type: "add_pages" },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).not.toContain("Removing old fields");
    expect(html).toContain("Adding pages");
  });

  test("renders the finish summary at the end", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: {
            operations: [{ label: "Updated form name", target: "title", type: "update" }],
          },
        },
        {
          type: "tool-finish_form_edit",
          state: "output-available",
          toolCallId: "tool-call-2",
          output: {
            summary: "Client Intake Form is ready with contact and service questions.",
          },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html.indexOf("Updated form name")).toBeLessThan(
      html.indexOf("Client Intake Form is ready"),
    );
  });

  test("hides feedback actions until the form edit is finished", () => {
    const unfinishedMessage = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: {
            operations: [{ label: "Updated form name", target: "title", type: "update" }],
          },
        },
      ],
    } as unknown as FormEditorAiMessage;
    const finishedMessage = {
      ...unfinishedMessage,
      parts: [
        ...unfinishedMessage.parts,
        {
          type: "tool-finish_form_edit",
          state: "output-available",
          toolCallId: "tool-call-2",
          output: { summary: "The form is ready." },
        },
      ],
    } as unknown as FormEditorAiMessage;

    expect(renderMessage(unfinishedMessage, { canUndo: true })).not.toContain(
      "Mark AI response helpful",
    );

    const finishedHtml = renderMessage(finishedMessage, { canUndo: true });
    expect(finishedHtml).toContain("Mark AI response helpful");
    expect(finishedHtml).toContain("Mark AI response not helpful");
    expect(finishedHtml).toContain("Undo AI changes");
  });

  test("renders an undo acknowledgement without spinning the undo icon", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-finish_form_edit",
          state: "output-available",
          toolCallId: "tool-call-1",
          output: { summary: "The form is ready." },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message, { canUndo: true, undoNotice: true, undoing: true });

    expect(html).toContain("Undid AI changes");
    expect(html).toContain("Undo AI changes");
    expect(html).not.toContain("animate-spin");
  });

  test("shows an animated status icon while an edit is running", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "input-streaming",
          toolCallId: "tool-call-1",
          input: { label: "Adding fields", type: "add_fields" },
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).toContain("Adding fields");
    expect(html).toContain("animate-spin");
    expect(html).toContain("text-primary");
  });

  test("renders tool errors as a small inline message without retry controls", () => {
    const message = {
      id: "assistant-message",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_form_schema",
          state: "output-error",
          toolCallId: "tool-call-1",
          errorText: "Cannot remove the last page.",
        },
      ],
    } as unknown as FormEditorAiMessage;

    const html = renderMessage(message);

    expect(html).toContain("Cannot remove the last page.");
    expect(html).toContain('role="alert"');
    expect(html).toContain("text-destructive");
    expect(html).not.toContain("Retry");
    expect(html).not.toContain("rounded-lg");
  });

  test("shows the thinking indicator while waiting for assistant content", () => {
    const messages = [
      {
        id: "user-message",
        role: "user",
        parts: [{ type: "text", text: "Add a required email field." }],
      },
    ] as unknown as FormEditorAiMessage[];

    expect(shouldShowAiThinkingIndicator({ messages: [], status: "submitted" })).toBe(true);
    expect(shouldShowAiThinkingIndicator({ messages, status: "submitted" })).toBe(true);
    expect(shouldShowAiThinkingIndicator({ messages, status: "streaming" })).toBe(true);
    expect(shouldShowAiThinkingIndicator({ messages, status: "ready" })).toBe(false);
  });

  test("hides the thinking indicator after assistant content arrives", () => {
    const messages = [
      {
        id: "user-message",
        role: "user",
        parts: [{ type: "text", text: "Add a required email field." }],
      },
      {
        id: "assistant-message",
        role: "assistant",
        parts: [{ type: "text", text: "I will add that now." }],
      },
    ] as unknown as FormEditorAiMessage[];

    expect(shouldShowAiThinkingIndicator({ messages, status: "streaming" })).toBe(false);
  });
});
