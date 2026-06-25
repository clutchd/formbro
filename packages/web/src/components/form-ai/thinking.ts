import type { FormEditorAiMessageMetadata } from "@formbro/core/ai";
import type { ChatStatus, UIMessage } from "ai";

type FormEditorAiMessage = UIMessage<FormEditorAiMessageMetadata>;
type FormEditorAiMessagePart = FormEditorAiMessage["parts"][number];

function isToolPart(part: FormEditorAiMessagePart) {
  return part.type.startsWith("tool-");
}

function isVisibleTextPart(part: FormEditorAiMessagePart) {
  return part.type === "text" && part.text.trim().length > 0;
}

function hasVisibleAiMessageParts(message: FormEditorAiMessage) {
  return message.parts.some((part) => isVisibleTextPart(part) || isToolPart(part));
}

export function shouldShowAiThinkingIndicator({
  messages,
  status,
}: {
  messages: FormEditorAiMessage[];
  status: ChatStatus;
}) {
  if (status !== "submitted" && status !== "streaming") return false;

  const latestMessage = messages.at(-1);
  if (!latestMessage) return true;
  if (latestMessage.role === "user") return true;

  return latestMessage.role === "assistant" && !hasVisibleAiMessageParts(latestMessage);
}
