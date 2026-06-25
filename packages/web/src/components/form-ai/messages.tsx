"use client";

import type { ToolUIPart, UIMessage } from "ai";
import {
  parseFinishFormSchemaEditOutput,
  parseFormSchemaEditInputPreview,
  parseFormSchemaEditOutput,
  type FormEditorAiMessageMetadata,
  type FormSchemaChangeSummary,
} from "@formbro/core/ai";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Textarea } from "@formbro/ui/textarea";
import {
  RiAddCircleLine,
  RiArrowGoBackLine,
  RiBracesLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiFileList3Line,
  RiLayoutLine,
  RiPagesLine,
  RiRefreshLine,
  RiRouteLine,
  RiSendPlane2Line,
  RiSparklingLine,
  RiText,
  RiThumbDownLine,
  RiThumbUpLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type FormEditorAiMessage = UIMessage<FormEditorAiMessageMetadata>;
type FormEditorAiMessagePart = FormEditorAiMessage["parts"][number];
type AiFeedbackRating = "down" | "up";
export type AiFeedbackTextPrompt = {
  messageId: string;
  rating: AiFeedbackRating;
};

function isToolPart(part: FormEditorAiMessagePart): part is ToolUIPart {
  return part.type.startsWith("tool-");
}

function isVisibleTextPart(part: FormEditorAiMessagePart) {
  return part.type === "text" && part.text.trim().length > 0;
}

function hasVisibleAiMessageParts(message: FormEditorAiMessage) {
  return message.parts.some((part) => isVisibleTextPart(part) || isToolPart(part));
}

function isSchemaEditToolPart(part: ToolUIPart) {
  return part.type === "tool-edit_form_schema" || part.type === "tool-apply_form_schema";
}

function isEditFormSchemaToolPart(part: ToolUIPart) {
  return part.type === "tool-edit_form_schema";
}

function hasFinishedFormEdit(message: FormEditorAiMessage) {
  return message.parts.some(
    (part) =>
      isToolPart(part) &&
      part.state === "output-available" &&
      (part.type === "tool-finish_form_edit" || part.type === "tool-apply_form_schema"),
  );
}

function shouldShowAiMessageActions(message: FormEditorAiMessage) {
  return message.role === "assistant" && hasFinishedFormEdit(message);
}

function getLatestWorkingEditToolCallId(parts: FormEditorAiMessagePart[]) {
  const workingEditPart = [...parts]
    .reverse()
    .find(
      (part): part is ToolUIPart =>
        isToolPart(part) && isSchemaEditToolPart(part) && isWorkingToolState(part.state),
    );

  return workingEditPart?.toolCallId ?? null;
}

function getCompletedEditActivity(parts: FormEditorAiMessagePart[]) {
  const completedParts = parts.filter(
    (part): part is ToolUIPart =>
      isToolPart(part) && isEditFormSchemaToolPart(part) && part.state === "output-available",
  );
  const latestPart = completedParts.at(-1);

  if (!latestPart) return null;

  const operations = completedParts.flatMap((part) => {
    const output = parseFormSchemaEditOutput(part.output);
    return output ? aggregateOperations(output.operations) : [];
  });

  return {
    latestToolCallId: latestPart.toolCallId,
    operations: operations.slice(-4),
  };
}

function isHiddenWorkingEditToolPart(part: ToolUIPart, latestWorkingEditToolCallId: string | null) {
  return (
    latestWorkingEditToolCallId !== null &&
    isSchemaEditToolPart(part) &&
    isWorkingToolState(part.state) &&
    part.toolCallId !== latestWorkingEditToolCallId
  );
}

function getToolName(part: ToolUIPart) {
  return part.type.replace(/^tool-/, "");
}

function getToolTitle(part: ToolUIPart) {
  const toolName = getToolName(part);

  if (toolName === "edit_form_schema") {
    return part.state === "output-available" ? "Updated form draft" : "Updating form draft";
  }

  if (toolName === "finish_form_edit") {
    return "Final summary";
  }

  return toolName.replace(/_/g, " ");
}

function getToolStatusLabel(status: ToolUIPart["state"]) {
  switch (status) {
    case "input-streaming":
    case "input-available":
      return "Working";
    case "approval-requested":
      return "Approval needed";
    case "approval-responded":
      return "Approved";
    case "output-available":
      return "Completed";
    case "output-error":
      return "Failed";
    case "output-denied":
      return "Denied";
  }
}

function normalizeMarkdownText(text: string) {
  return text
    .trim()
    .replace(/([.:?])\s+([-*])\s+(?=\S)/g, "$1\n$2 ")
    .replace(/^\s*(done|next|what changed|changed|refinements):\s*$/gim, "**$1**");
}

function InlineMarkdown({ keyPrefix, text }: { keyPrefix: string; text: string }) {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    if (match.index === undefined) continue;

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code key={key} className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}

function MarkdownLite({ text }: { text: string }) {
  const rows: ReactNode[] = [];
  let listItems: string[] = [];
  let listIsOrdered = false;

  const flushList = () => {
    if (listItems.length === 0) return;

    const ListTag = listIsOrdered ? "ol" : "ul";
    const listIndex = rows.length;

    rows.push(
      <ListTag
        key={`list-${listIndex}`}
        className={twx(
          "space-y-1 pl-4 marker:text-muted-foreground",
          listIsOrdered ? "list-decimal" : "list-disc",
        )}
      >
        {listItems.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>
            <InlineMarkdown keyPrefix={`list-${listIndex}-${itemIndex}`} text={item} />
          </li>
        ))}
      </ListTag>,
    );
    listItems = [];
  };

  for (const [lineIndex, rawLine] of normalizeMarkdownText(text).split("\n").entries()) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(line);
    const orderedMatch = /^\d+[.)]\s+(.+)$/.exec(line);
    const listMatch = unorderedMatch ?? orderedMatch;

    if (listMatch) {
      const isOrdered = Boolean(orderedMatch);
      if (listItems.length > 0 && listIsOrdered !== isOrdered) flushList();

      listIsOrdered = isOrdered;
      listItems.push(listMatch[1] ?? "");
      continue;
    }

    flushList();

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line);
    if (headingMatch) {
      rows.push(
        <h3 key={`heading-${lineIndex}`} className="leading-snug font-semibold">
          <InlineMarkdown keyPrefix={`heading-${lineIndex}`} text={headingMatch[2] ?? ""} />
        </h3>,
      );
      continue;
    }

    rows.push(
      <p key={`paragraph-${lineIndex}`} className="leading-relaxed">
        <InlineMarkdown keyPrefix={`paragraph-${lineIndex}`} text={line} />
      </p>,
    );
  }

  flushList();

  return rows.length > 0 ? <div className="space-y-2.5 break-words">{rows}</div> : null;
}

export function AiMessage({
  canUndo,
  feedback,
  feedbackRecorded,
  feedbackTextPrompt,
  message,
  onFeedback,
  onFeedbackTextDismiss,
  onFeedbackTextShown,
  onFeedbackTextSubmit,
  onUndo,
  undoNotice,
  undoing,
}: {
  canUndo?: boolean;
  feedback?: AiFeedbackRating;
  feedbackRecorded?: boolean;
  feedbackTextPrompt?: AiFeedbackTextPrompt | null;
  message: FormEditorAiMessage;
  onFeedback: (messageId: string, rating: AiFeedbackRating) => void;
  onFeedbackTextDismiss?: (messageId: string) => void;
  onFeedbackTextShown?: (messageId: string) => void;
  onFeedbackTextSubmit?: (messageId: string, response: string) => void;
  onUndo?: () => void;
  undoNotice?: boolean;
  undoing?: boolean;
}) {
  const isUser = message.role === "user";
  const hasVisibleParts = hasVisibleAiMessageParts(message);
  const completedEditActivity = getCompletedEditActivity(message.parts);
  const latestWorkingEditToolCallId = getLatestWorkingEditToolCallId(message.parts);
  const showActions = !isUser && shouldShowAiMessageActions(message);
  const showFeedbackTextPrompt = feedbackTextPrompt?.messageId === message.id;
  const textKeyCounts = new Map<string, number>();

  if (!hasVisibleParts) return null;

  const getTextKey = (text: string) => {
    const baseKey = `${message.id}-text-${hashString(text)}`;
    const count = textKeyCounts.get(baseKey) ?? 0;
    textKeyCounts.set(baseKey, count + 1);

    return count === 0 ? baseKey : `${baseKey}-${count + 1}`;
  };
  const getFeedbackButtonClassName = (rating: AiFeedbackRating) =>
    twx(
      "size-7 rounded-full border-0 p-0",
      feedback === rating && "bg-primary/10 text-primary hover:bg-primary/10",
    );

  return (
    <div className={twx("flex flex-col gap-2", isUser && "items-end")}>
      {message.parts.map((part) => {
        if (part.type === "text") {
          if (!isVisibleTextPart(part)) return null;

          return (
            <div
              key={getTextKey(part.text)}
              className={twx(
                "max-w-[92%] text-sm leading-relaxed",
                isUser
                  ? "rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                  : "text-foreground",
              )}
            >
              <MarkdownLite text={part.text} />
            </div>
          );
        }

        if (isToolPart(part)) {
          if (isHiddenWorkingEditToolPart(part, latestWorkingEditToolCallId)) return null;
          if (
            isEditFormSchemaToolPart(part) &&
            part.state === "output-available" &&
            completedEditActivity
          ) {
            if (part.toolCallId !== completedEditActivity.latestToolCallId) return null;
            return (
              <EditSchemaActivity
                key={`${message.id}-${part.toolCallId}`}
                operations={completedEditActivity.operations}
              />
            );
          }

          return <ToolCallActivity key={`${message.id}-${part.toolCallId}`} part={part} />;
        }

        return null;
      })}

      {undoNotice ? <ToolStatusRow icon={RiArrowGoBackLine} label="Undid AI changes" /> : null}
      {feedbackRecorded ? (
        <ToolStatusRow icon={RiCheckboxCircleLine} label="Feedback recorded" />
      ) : null}

      {showActions ? (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={getFeedbackButtonClassName("up")}
            aria-label="Mark AI response helpful"
            aria-pressed={feedback === "up"}
            onClick={() => onFeedback(message.id, "up")}
          >
            <RiThumbUpLine className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={getFeedbackButtonClassName("down")}
            aria-label="Mark AI response not helpful"
            aria-pressed={feedback === "down"}
            onClick={() => onFeedback(message.id, "down")}
          >
            <RiThumbDownLine className="size-3.5" />
          </Button>
          {canUndo ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={undoing}
              className="size-7 rounded-full border-0 p-0"
              aria-label="Undo AI changes"
              onClick={onUndo}
            >
              <RiArrowGoBackLine className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}

      {showActions && showFeedbackTextPrompt ? (
        <FeedbackTextPrompt
          key={`${message.id}-${feedbackTextPrompt.rating}`}
          messageId={message.id}
          rating={feedbackTextPrompt.rating}
          onDismiss={onFeedbackTextDismiss}
          onShown={onFeedbackTextShown}
          onSubmit={onFeedbackTextSubmit}
        />
      ) : null}
    </div>
  );
}

function FeedbackTextPrompt({
  messageId,
  onDismiss,
  onShown,
  onSubmit,
  rating,
}: {
  messageId: string;
  onDismiss?: (messageId: string) => void;
  onShown?: (messageId: string) => void;
  onSubmit?: (messageId: string, response: string) => void;
  rating: AiFeedbackRating;
}) {
  const [response, setResponse] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const title = rating === "up" ? "What worked well?" : "What went wrong?";
  const submitResponse = () => {
    const text = response.trim();
    if (!text) return;

    onSubmit?.(messageId, text);
  };

  useEffect(() => {
    onShown?.(messageId);
    textareaRef.current?.focus({ preventScroll: true });
  }, [messageId, onShown]);

  return (
    <div className="w-full space-y-2 rounded-lg border bg-muted/20 p-3">
      <label className="block text-sm font-medium" htmlFor={`ai-feedback-${messageId}`}>
        {title}
      </label>
      <Textarea
        ref={textareaRef}
        id={`ai-feedback-${messageId}`}
        value={response}
        rows={3}
        placeholder="Add a quick note"
        className="min-h-20 resize-none bg-background text-sm"
        onChange={(event) => setResponse(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            submitResponse();
          }
        }}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="dense" onClick={() => onDismiss?.(messageId)}>
          Cancel
        </Button>
        <Button type="button" size="dense" disabled={!response.trim()} onClick={submitResponse}>
          Send
        </Button>
      </div>
    </div>
  );
}

function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

export function AiThinkingIndicator() {
  return (
    <output
      className="block font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase"
      aria-live="polite"
    >
      Thinking
      <span aria-hidden="true" className="inline-block w-[3ch] text-left">
        <span className="loading-dots-text" />
      </span>
    </output>
  );
}

function getOperationIcon(operation: FormSchemaChangeSummary): RemixiconComponentType {
  if (operation.type === "remove") return RiDeleteBinLine;
  if (operation.type === "add") {
    if (operation.target === "page") return RiPagesLine;
    if (operation.target === "field") return RiFileList3Line;
    if (operation.target === "logic") return RiRouteLine;
    if (operation.target === "variable") return RiBracesLine;
    return RiAddCircleLine;
  }

  switch (operation.target) {
    case "element":
      return RiLayoutLine;
    case "field":
      return RiFileList3Line;
    case "logic":
      return RiRouteLine;
    case "page":
      return RiPagesLine;
    case "submit":
      return RiSendPlane2Line;
    case "title":
      return RiText;
    case "toast":
      return RiSparklingLine;
    case "variable":
      return RiBracesLine;
  }
}

function operationIconClassName(type: FormSchemaChangeSummary["type"]) {
  if (type === "add") return "text-green-600";
  if (type === "remove") return "text-destructive";
  return "text-muted-foreground";
}

function OperationRow({ operation }: { operation: FormSchemaChangeSummary }) {
  const Icon = getOperationIcon(operation);

  return (
    <div className="flex min-w-0 items-center gap-2 px-1 py-0.5 text-sm text-muted-foreground">
      <Icon className={twx("size-4 shrink-0", operationIconClassName(operation.type))} />
      <span className="min-w-0 leading-snug font-medium">{operation.label}</span>
    </div>
  );
}

function EditSchemaActivity({
  loadingLabel,
  operation,
  operations,
  summary,
}: {
  loadingLabel?: string;
  operation?: FormSchemaChangeSummary;
  operations?: FormSchemaChangeSummary[];
  summary?: string;
}) {
  const activityOperations = operations ?? (operation ? [operation] : []);

  return (
    <div className="space-y-2">
      {loadingLabel ? (
        <ToolStatusRow icon={RiRefreshLine} loading label={loadingLabel} />
      ) : activityOperations.length > 0 ? (
        <div className="space-y-1">
          {activityOperations.map((activityOperation, operationIndex) => (
            <OperationRow
              key={`${activityOperation.type}-${activityOperation.target}-${operationIndex}-${activityOperation.label}`}
              operation={activityOperation}
            />
          ))}
        </div>
      ) : loadingLabel || summary ? null : (
        <ToolStatusRow icon={RiCheckboxCircleLine} label="No draft changes were needed" />
      )}

      {summary ? <p className="px-1 text-sm leading-relaxed text-foreground">{summary}</p> : null}
    </div>
  );
}

type AggregatedSchemaOperation = FormSchemaChangeSummary & {
  aggregationKey: string;
  count: number;
};

const changeSummaryTargets = new Set<FormSchemaChangeSummary["target"]>([
  "element",
  "field",
  "logic",
  "page",
  "submit",
  "title",
  "toast",
  "variable",
]);

const changeSummaryTypes = new Set<FormSchemaChangeSummary["type"]>(["add", "remove", "update"]);

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLegacyChangeSummary(value: unknown): FormSchemaChangeSummary | null {
  if (!isObjectRecord(value) || typeof value.label !== "string" || !value.label.trim()) {
    return null;
  }

  const type = changeSummaryTypes.has(value.type as FormSchemaChangeSummary["type"])
    ? (value.type as FormSchemaChangeSummary["type"])
    : null;

  if (!type) return null;

  const target = changeSummaryTargets.has(value.target as FormSchemaChangeSummary["target"])
    ? (value.target as FormSchemaChangeSummary["target"])
    : "element";

  const count =
    typeof value.count === "number" && Number.isInteger(value.count) && value.count > 0
      ? value.count
      : undefined;

  return {
    count,
    label: value.label,
    target,
    type,
  };
}

function parseLegacyApplyFormSchemaOutput(value: unknown): {
  operations: FormSchemaChangeSummary[];
  summary?: string;
} | null {
  if (!isObjectRecord(value)) return null;

  const operations = Array.isArray(value.operations)
    ? value.operations.flatMap((operation) => {
        const parsed = parseLegacyChangeSummary(operation);
        return parsed ? [parsed] : [];
      })
    : [];
  const summary =
    typeof value.summary === "string" && value.summary.trim().length > 0
      ? value.summary.trim()
      : undefined;

  if (operations.length === 0 && !summary) return null;
  return { operations, summary };
}

function operationCount(operation: FormSchemaChangeSummary) {
  return operation.count ?? 1;
}

function getAggregationKey(operation: FormSchemaChangeSummary) {
  if (operation.type === "update" && operation.target === "title") return "update-title";
  if (operation.type === "update" && operation.target === "submit") return "update-submit";

  return `${operation.type}-${operation.target}`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function getTargetNoun(target: FormSchemaChangeSummary["target"], count: number) {
  switch (target) {
    case "field":
      return pluralize(count, "field");
    case "logic":
      return pluralize(count, "logic rule");
    case "page":
      return pluralize(count, "page");
    case "submit":
      return "submit button";
    case "title":
      return "form name";
    case "toast":
      return pluralize(count, "toast message");
    case "variable":
      return pluralize(count, "variable");
    case "element":
      return pluralize(count, "element");
  }
}

function getOperationVerb(type: FormSchemaChangeSummary["type"]) {
  if (type === "add") return "Added";
  if (type === "remove") return "Removed";
  return "Updated";
}

function formatAggregatedOperationLabel(operation: AggregatedSchemaOperation) {
  if (operation.aggregationKey === "update-title") return "Updated form name";
  if (operation.aggregationKey === "update-submit") return "Updated submit button";

  return `${getOperationVerb(operation.type)} ${operation.count} ${getTargetNoun(
    operation.target,
    operation.count,
  )}`;
}

function operationOrderRank(operation: FormSchemaChangeSummary) {
  if (operation.type === "remove" && operation.target === "page") return 10;
  if (operation.type === "remove" && operation.target === "element") return 11;
  if (operation.type === "remove" && operation.target === "field") return 12;
  if (operation.type === "remove") return 13;
  if (operation.type === "update" && operation.target === "title") return 20;
  if (operation.type === "add" && operation.target === "page") return 30;
  if (operation.type === "add" && operation.target === "element") return 31;
  if (operation.type === "add" && operation.target === "field") return 32;
  if (operation.type === "add") return 33;
  if (operation.type === "update" && operation.target === "submit") return 40;
  if (operation.type === "update") return 50;
  return 60;
}

function aggregateOperations(operations: FormSchemaChangeSummary[]): FormSchemaChangeSummary[] {
  const groupedOperations: AggregatedSchemaOperation[] = [];
  const operationIndexByKey = new Map<string, number>();

  for (const operation of operations) {
    const aggregationKey = getAggregationKey(operation);
    const existingIndex = operationIndexByKey.get(aggregationKey);

    if (existingIndex === undefined) {
      operationIndexByKey.set(aggregationKey, groupedOperations.length);
      groupedOperations.push({
        ...operation,
        aggregationKey,
        count: operationCount(operation),
      });
      continue;
    }

    const existing = groupedOperations[existingIndex];
    if (!existing) continue;

    groupedOperations[existingIndex] = {
      ...existing,
      count: existing.count + operationCount(operation),
    };
  }

  return groupedOperations
    .map((operation) => ({
      count: operation.count,
      label: formatAggregatedOperationLabel(operation),
      target: operation.target,
      type: operation.type,
    }))
    .sort((first, second) => operationOrderRank(first) - operationOrderRank(second));
}

function previewOperation(value: unknown): FormSchemaChangeSummary | null {
  const preview = parseFormSchemaEditInputPreview(value);
  if (!preview?.label) return null;
  if (!preview.type) return { label: preview.label, target: "element", type: "update" };

  switch (preview.type) {
    case "set_form_name":
      return { label: preview.label, target: "title", type: "update" };
    case "update_submit":
      return { label: preview.label, target: "submit", type: "update" };
    case "remove_elements":
      return { label: preview.label, target: "element", type: "remove" };
    case "add_pages":
      return { label: preview.label, target: "page", type: "add" };
    case "add_layout_elements":
      return { label: preview.label, target: "element", type: "add" };
    case "add_fields":
      return { label: preview.label, target: "field", type: "add" };
    case "move_elements":
    case "update_elements":
      return { label: preview.label, target: "element", type: "update" };
    default:
      return { label: preview.label, target: "element", type: "update" };
  }
}

function isWorkingToolState(status: ToolUIPart["state"]) {
  return (
    status === "input-streaming" ||
    status === "input-available" ||
    status === "approval-requested" ||
    status === "approval-responded"
  );
}

function ToolStatusRow({
  icon: Icon,
  label,
  loading = false,
}: {
  icon: RemixiconComponentType;
  label: string;
  loading?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-1 py-0.5 text-sm text-muted-foreground">
      <Icon className={twx("size-4 shrink-0", loading && "animate-spin text-primary")} />
      <span className="min-w-0 leading-snug font-medium">{label}</span>
    </div>
  );
}

export function AiErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex min-w-0 items-start gap-2 px-1 py-0.5 text-sm text-destructive"
    >
      <RiCloseCircleLine className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0 leading-snug font-medium break-words">{message}</span>
    </div>
  );
}

function ToolCallActivity({ part }: { part: ToolUIPart }) {
  const output = part.state === "output-available" ? part.output : undefined;
  const editOutput = parseFormSchemaEditOutput(output);
  const finishOutput = parseFinishFormSchemaEditOutput(output);
  const legacyApplyOutput =
    part.type === "tool-apply_form_schema" ? parseLegacyApplyFormSchemaOutput(output) : null;

  if (editOutput) {
    return <EditSchemaActivity operations={aggregateOperations(editOutput.operations)} />;
  }

  if (finishOutput) {
    return <EditSchemaActivity summary={finishOutput.summary} />;
  }

  if (legacyApplyOutput) {
    return (
      <EditSchemaActivity
        operations={aggregateOperations(legacyApplyOutput.operations)}
        summary={legacyApplyOutput.summary}
      />
    );
  }

  if (part.type === "tool-edit_form_schema" && isWorkingToolState(part.state)) {
    const operation = previewOperation(part.input);
    const loadingLabel = operation?.label ?? "Updating form";

    return <EditSchemaActivity loadingLabel={loadingLabel} operation={operation ?? undefined} />;
  }

  if (part.type === "tool-finish_form_edit" && isWorkingToolState(part.state)) {
    return <ToolStatusRow icon={RiRefreshLine} loading label="Writing summary" />;
  }

  if (part.type === "tool-apply_form_schema" && isWorkingToolState(part.state)) {
    return <ToolStatusRow icon={RiRefreshLine} loading label="Applying legacy full-schema edit" />;
  }

  if (part.type === "tool-apply_form_schema" && part.state === "output-available") {
    return <ToolStatusRow icon={RiCheckboxCircleLine} label="Legacy full-schema edit completed" />;
  }

  if (part.state === "output-error") {
    return <AiErrorNotice message={part.errorText || "Tool failed."} />;
  }

  return (
    <ToolStatusRow
      icon={part.state === "output-available" ? RiCheckboxCircleLine : RiRefreshLine}
      loading={isWorkingToolState(part.state)}
      label={
        part.state === "output-available"
          ? `${getToolTitle(part)} complete`
          : part.type === "tool-edit_form_schema" || part.type === "tool-finish_form_edit"
            ? getToolStatusLabel(part.state)
            : `${getToolTitle(part)} · ${getToolStatusLabel(part.state)}`
      }
    />
  );
}
