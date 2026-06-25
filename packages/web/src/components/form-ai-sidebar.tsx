"use client";

import type { FormInput } from "@formbro/core/schema/form";
import { Button } from "@formbro/ui/button";
import { Textarea } from "@formbro/ui/textarea";
import { RiBardLine, RiCloseLine, RiSendPlane2Line, RiSparkling2Line } from "@remixicon/react";
import { useEffect, useRef } from "react";
import {
  AiErrorNotice,
  AiMessage,
  AiThinkingIndicator,
  shouldShowAiThinkingIndicator,
} from "./form-ai/messages";
import { useFormAiSession } from "./form-ai/use-form-ai-session";

export function FormAiSidebar({
  formId,
  onUndoAiChanges,
  onOpenChange,
  open,
  schema,
  undoing,
}: {
  formId: string;
  onUndoAiChanges?: (schema: FormInput) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  schema: FormInput;
  undoing?: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const session = useFormAiSession({
    formId,
    schema,
  });
  const submitPrompt = () => {
    void session.sendPrompt(session.input);
  };
  const latestAssistantMessageId = [...session.messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;
  const undoAiChanges = async () => {
    if (!session.undoSnapshot || !onUndoAiChanges) return;

    try {
      await onUndoAiChanges(session.undoSnapshot);
      session.handleUndo(latestAssistantMessageId);
      session.clearUndoSnapshot();
    } catch {
      // The parent owns the user-facing error toast.
    }
  };

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [session.messages, open, session.status]);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open) return null;

  return (
    <aside className="absolute inset-y-0 right-0 z-40 flex w-full max-w-[26rem] shrink-0 flex-col border-l bg-background shadow-xl md:relative md:z-auto md:shadow-none">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b px-4">
        <div className="flex min-w-0 items-center gap-2">
          <RiBardLine className="size-4 shrink-0" />
          <h2 className="truncate text-sm font-semibold">Ask AI</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-7 rounded-full border-0 p-0"
          aria-label="Close AI sidebar"
          onClick={() => onOpenChange(false)}
        >
          <RiCloseLine className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {session.messages.length === 0 ? (
          <AiEmptyState prompts={session.examplePrompts} onSend={session.sendPrompt} />
        ) : (
          session.messages.map((message) => (
            <AiMessage
              key={message.id}
              canUndo={Boolean(
                onUndoAiChanges &&
                  session.undoSnapshot &&
                  message.id === latestAssistantMessageId,
              )}
              feedback={session.feedbackByMessageId[message.id]}
              feedbackRecorded={session.feedbackRecordedMessageIds.has(message.id)}
              feedbackTextPrompt={session.feedbackTextPrompt}
              message={message}
              onFeedback={session.handleFeedback}
              onFeedbackTextDismiss={session.handleFeedbackTextDismiss}
              onFeedbackTextShown={session.handleFeedbackTextShown}
              onFeedbackTextSubmit={session.handleFeedbackTextSubmit}
              onUndo={() => void undoAiChanges()}
              undoNotice={session.undoneMessageIds.has(message.id)}
              undoing={undoing}
            />
          ))
        )}

        {shouldShowAiThinkingIndicator({
          messages: session.messages,
          status: session.status,
        }) ? (
          <AiThinkingIndicator />
        ) : null}

        {session.error ? <AiErrorNotice message={session.error.message} /> : null}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="border-t p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submitPrompt();
        }}
      >
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <Textarea
            ref={inputRef}
            value={session.input}
            rows={3}
            disabled={session.disabled}
            placeholder="Ask me to edit this form"
            className="max-h-40 min-h-20 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
            onChange={(event) => session.setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                submitPrompt();
              }
            }}
          />
          <div className="flex items-center justify-end gap-2 px-1 pb-1">
            {session.disabled ? (
              <Button
                type="button"
                variant="outline"
                size="dense"
                onClick={() => void session.stop()}
              >
                Stop
              </Button>
            ) : (
              <Button type="submit" size="dense" disabled={!session.input.trim()}>
                <RiSendPlane2Line className="size-4" />
                Send
              </Button>
            )}
          </div>
        </div>
      </form>
    </aside>
  );
}

function AiEmptyState({
  onSend,
  prompts,
}: {
  onSend: (prompt: string) => Promise<void>;
  prompts: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed bg-muted/20 p-4">
        <div className="flex items-center gap-2 font-medium">
          <RiSparkling2Line className="size-4" />
          Edit this form with AI
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ask for a new field, cleaner copy, page breaks, validation, or a full rewrite.
        </p>
      </div>
      <div className="space-y-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => void onSend(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
