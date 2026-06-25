"use client";

import { useChat } from "@ai-sdk/react";
import type { FormEditorAiMessageMetadata } from "@formbro/core/ai";
import { isFieldRegistryType } from "@formbro/core/schema/editor";
import type { FormInput } from "@formbro/core/schema/form";
import { DefaultChatTransport, type UIMessage } from "ai";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

type FormEditorAiMessage = UIMessage<FormEditorAiMessageMetadata>;
type AiFeedbackRating = "down" | "up";
export type AiFeedbackTextPrompt = {
  messageId: string;
  rating: AiFeedbackRating;
};

const FORM_EDITOR_AI_FEEDBACK_SURVEY_ID = "019efd66-913a-0000-64da-ab16dd839bd8";

type ConvexTokenClient = typeof authClient & {
  convex: {
    token: (options?: { fetchOptions?: { throw?: boolean } }) => Promise<{
      data?: { token?: string } | null;
    }>;
  };
};

function getConvexSiteUrl() {
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const url = convexSiteUrl ?? convexUrl?.replace(".convex.cloud", ".convex.site");

  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }

  return url.replace(/\/$/, "");
}

const formAiChatApi = `${getConvexSiteUrl()}/ai/chat`;

async function getConvexAuthHeaders() {
  const response = await (authClient as ConvexTokenClient).convex.token({
    fetchOptions: { throw: false },
  });
  const token = response.data?.token;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function createFormAiTransport() {
  const authenticatedFetch = Object.assign(
    async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      const headers = new Headers(init?.headers);
      const authHeaders = await getConvexAuthHeaders();

      for (const [key, value] of Object.entries(authHeaders)) {
        headers.set(key, value);
      }

      return fetch(input, {
        ...init,
        credentials: "omit",
        headers,
      });
    },
    {
      preconnect:
        "preconnect" in fetch && typeof fetch.preconnect === "function"
          ? fetch.preconnect.bind(fetch)
          : () => { },
    },
  ) satisfies typeof fetch;

  return new DefaultChatTransport({
    api: formAiChatApi,
    credentials: "omit",
    fetch: authenticatedFetch,
  });
}

function getExamplePrompts(schema: FormInput) {
  const formName = schema.name.trim() || "this form";
  const hasPageBreak = schema.elements.some((element) => element.type === "page_break");
  const fieldCount = schema.elements.filter((element) => isFieldRegistryType(element.type)).length;

  return [
    fieldCount < 3
      ? `Turn ${formName} into a polished intake form.`
      : `Clean up the labels and helper text in ${formName}.`,
    hasPageBreak
      ? "Improve the page flow and make each page feel focused."
      : "Split this into multiple pages where it feels natural.",
    "Add sensible required validation without making the form annoying.",
  ];
}

function getLatestAiTraceId(messages: FormEditorAiMessage[]) {
  return [...messages].reverse().find((message) => message.metadata?.aiTraceId)?.metadata
    ?.aiTraceId;
}

function getMessageText(message?: FormEditorAiMessage) {
  return (
    message?.parts
      .flatMap((part) => (part.type === "text" ? [part.text.trim()] : []))
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
}

function getPromptBeforeAssistantMessage(
  messages: FormEditorAiMessage[],
  assistantMessageId?: string,
) {
  if (!assistantMessageId) return "";

  const assistantIndex = messages.findIndex((message) => message.id === assistantMessageId);
  if (assistantIndex < 0) return "";

  const userMessage = messages
    .slice(0, assistantIndex)
    .reverse()
    .find((message) => message.role === "user");

  return getMessageText(userMessage);
}

function createFeedbackSubmissionId() {
  return globalThis.crypto?.randomUUID?.() ?? `feedback-${Date.now()}-${Math.random()}`;
}

function getFeedbackRatingValue(rating: AiFeedbackRating) {
  return rating === "up" ? 1 : 2;
}

function compactProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null),
  );
}

function getFeedbackAnalyticsProperties({
  fallbackAiTraceId,
  formId,
  message,
  messageId,
  rating,
}: {
  fallbackAiTraceId: string | null;
  formId: string;
  message?: FormEditorAiMessage;
  messageId: string;
  rating: AiFeedbackRating;
}) {
  const aiTraceId = message?.metadata?.aiTraceId ?? fallbackAiTraceId;

  return compactProperties({
    aiTraceId,
    ai_trace_id: aiTraceId,
    formId,
    form_id: formId,
    llmTraceId: aiTraceId,
    llm_trace_id: aiTraceId,
    messageId,
    message_id: messageId,
    model: message?.metadata?.model,
    rating,
    source: "form_editor_ai",
    surveyId: FORM_EDITOR_AI_FEEDBACK_SURVEY_ID,
    survey_id: FORM_EDITOR_AI_FEEDBACK_SURVEY_ID,
    totalTokens: message?.metadata?.totalTokens,
    total_tokens: message?.metadata?.totalTokens,
    workspaceId: message?.metadata?.workspaceId,
    workspace_id: message?.metadata?.workspaceId,
  });
}

function getFeedbackSurveyBaseProperties({
  fallbackAiTraceId,
  formId,
  message,
  messageId,
  submissionId,
}: {
  fallbackAiTraceId: string | null;
  formId: string;
  message?: FormEditorAiMessage;
  messageId: string;
  submissionId: string;
}) {
  const aiTraceId = message?.metadata?.aiTraceId ?? fallbackAiTraceId;

  return compactProperties({
    $ai_trace_id: aiTraceId,
    $survey_id: FORM_EDITOR_AI_FEEDBACK_SURVEY_ID,
    $survey_submission_id: submissionId,
    aiTraceId,
    ai_trace_id: aiTraceId,
    formId,
    form_id: formId,
    llmTraceId: aiTraceId,
    llm_trace_id: aiTraceId,
    messageId,
    message_id: messageId,
    model: message?.metadata?.model,
    source: "form_editor_ai",
    totalTokens: message?.metadata?.totalTokens,
    total_tokens: message?.metadata?.totalTokens,
    workspaceId: message?.metadata?.workspaceId,
    workspace_id: message?.metadata?.workspaceId,
  });
}

function getFeedbackSurveyShownProperties({
  fallbackAiTraceId,
  message,
}: {
  fallbackAiTraceId: string | null;
  message?: FormEditorAiMessage;
}) {
  return compactProperties({
    $ai_trace_id: message?.metadata?.aiTraceId ?? fallbackAiTraceId,
    $survey_id: FORM_EDITOR_AI_FEEDBACK_SURVEY_ID,
  });
}

export function useFormAiSession({
  formId,
  schema,
}: {
  formId: string;
  schema: FormInput;
}) {
  const posthog = usePostHog();
  const [input, setInput] = useState("");
  const [feedbackByMessageId, setFeedbackByMessageId] = useState<Record<string, AiFeedbackRating>>(
    {},
  );
  const [feedbackRecordedMessageIds, setFeedbackRecordedMessageIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [feedbackTextPrompt, setFeedbackTextPrompt] = useState<AiFeedbackTextPrompt | null>(null);
  const [undoneMessageIds, setUndoneMessageIds] = useState<ReadonlySet<string>>(() => new Set());
  const [undoSnapshot, setUndoSnapshot] = useState<FormInput | null>(null);
  const feedbackSubmissionIdsRef = useRef<Record<string, string>>({});
  const activeShownFeedbackSurveyKeyRef = useRef<string | null>(null);
  const latestAiTraceIdRef = useRef<string | null>(null);
  const schemaRef = useRef(schema);
  const transport = useMemo(() => createFormAiTransport(), []);
  const examplePrompts = useMemo(() => getExamplePrompts(schema), [schema]);
  const { error, messages, sendMessage, status, stop } = useChat<FormEditorAiMessage>({
    transport,
    onError: (nextError) => {
      toast.error("AI edit failed", { description: nextError.message });
      posthog.capture("form_editor_ai_error", {
        aiTraceId: latestAiTraceIdRef.current,
        formId,
        message: nextError.message,
      });
    },
    onFinish: ({ isError, finishReason }) => {
      posthog.capture("form_editor_ai_finished", {
        aiTraceId: latestAiTraceIdRef.current,
        finishReason,
        formId,
        isError,
      });
    },
  });

  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  useEffect(() => {
    latestAiTraceIdRef.current = getLatestAiTraceId(messages) ?? latestAiTraceIdRef.current;
  }, [messages]);

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const text = prompt.trim();
      if (!text || status === "submitted" || status === "streaming") return;

      setUndoSnapshot(structuredClone(schemaRef.current));
      setFeedbackTextPrompt(null);
      setInput("");
      await sendMessage(
        { text },
        {
          body: {
            formId,
            schema: schemaRef.current,
          },
        },
      );
    },
    [formId, sendMessage, status],
  );

  const getFeedbackSubmissionId = useCallback((messageId: string) => {
    const existing = feedbackSubmissionIdsRef.current[messageId];
    if (existing) return existing;

    const submissionId = createFeedbackSubmissionId();
    feedbackSubmissionIdsRef.current = {
      ...feedbackSubmissionIdsRef.current,
      [messageId]: submissionId,
    };
    return submissionId;
  }, []);

  const handleFeedback = (messageId: string, rating: AiFeedbackRating) => {
    const message = messages.find((entry) => entry.id === messageId);
    const submissionId = getFeedbackSubmissionId(messageId);
    const properties = getFeedbackAnalyticsProperties({
      fallbackAiTraceId: latestAiTraceIdRef.current,
      formId,
      message,
      messageId,
      rating,
    });

    setFeedbackByMessageId((current) => ({ ...current, [messageId]: rating }));
    setFeedbackRecordedMessageIds((current) => {
      if (!current.has(messageId)) return current;

      const next = new Set(current);
      next.delete(messageId);
      return next;
    });
    setFeedbackTextPrompt({ messageId, rating });
    posthog.capture("form_editor_ai_feedback", properties);
    posthog.capture("survey sent", {
      ...getFeedbackSurveyBaseProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        formId,
        message,
        messageId,
        submissionId,
      }),
      $survey_completed: rating === "up",
      $survey_response: getFeedbackRatingValue(rating),
    });
  };

  const handleFeedbackTextShown = (messageId: string) => {
    const prompt = feedbackTextPrompt;
    if (!prompt || prompt.messageId !== messageId) return;

    const message = messages.find((entry) => entry.id === messageId);
    const submissionId = getFeedbackSubmissionId(messageId);
    const shownKey = `${messageId}:${prompt.rating}:${submissionId}`;
    if (activeShownFeedbackSurveyKeyRef.current === shownKey) return;

    activeShownFeedbackSurveyKeyRef.current = shownKey;
    posthog.capture(
      "form_editor_ai_feedback_survey_shown",
      getFeedbackAnalyticsProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        formId,
        message,
        messageId,
        rating: prompt.rating,
      }),
    );
    posthog.capture(
      "survey shown",
      getFeedbackSurveyShownProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        message,
      }),
    );
  };

  const handleFeedbackTextDismiss = (messageId: string) => {
    const prompt = feedbackTextPrompt;
    if (!prompt || prompt.messageId !== messageId) return;

    const message = messages.find((entry) => entry.id === messageId);
    const submissionId = getFeedbackSubmissionId(messageId);
    posthog.capture(
      "form_editor_ai_feedback_survey_dismissed",
      getFeedbackAnalyticsProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        formId,
        message,
        messageId,
        rating: prompt.rating,
      }),
    );
    posthog.capture(
      "survey dismissed",
      getFeedbackSurveyBaseProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        formId,
        message,
        messageId,
        submissionId,
      }),
    );
    activeShownFeedbackSurveyKeyRef.current = null;
    setFeedbackTextPrompt(null);
  };

  const handleFeedbackTextSubmit = (messageId: string, response: string) => {
    const prompt = feedbackTextPrompt;
    const text = response.trim();
    if (!prompt || prompt.messageId !== messageId || !text) return;

    const message = messages.find((entry) => entry.id === messageId);
    const submissionId = getFeedbackSubmissionId(messageId);

    posthog.capture("form_editor_ai_feedback_survey_response", {
      ...getFeedbackAnalyticsProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        formId,
        message,
        messageId,
        rating: prompt.rating,
      }),
      response: text,
      responseLength: text.length,
      response_length: text.length,
    });
    posthog.capture("survey sent", {
      ...getFeedbackSurveyBaseProperties({
        fallbackAiTraceId: latestAiTraceIdRef.current,
        formId,
        message,
        messageId,
        submissionId,
      }),
      $survey_completed: true,
      $survey_response_1: text,
    });
    setFeedbackRecordedMessageIds((current) => {
      const next = new Set(current);
      next.add(messageId);
      return next;
    });
    activeShownFeedbackSurveyKeyRef.current = null;
    setFeedbackTextPrompt(null);
  };

  const handleUndo = useCallback(
    (messageId?: string) => {
      const message = messageId ? messages.find((entry) => entry.id === messageId) : undefined;
      const aiTraceId = message?.metadata?.aiTraceId ?? latestAiTraceIdRef.current;

      if (messageId) {
        setUndoneMessageIds((current) => {
          const next = new Set(current);
          next.add(messageId);
          return next;
        });
        setFeedbackByMessageId((current) => {
          const { [messageId]: _removedRating, ...next } = current;
          return next;
        });
        setFeedbackRecordedMessageIds((current) => {
          if (!current.has(messageId)) return current;

          const next = new Set(current);
          next.delete(messageId);
          return next;
        });

        const prompt = getPromptBeforeAssistantMessage(messages, messageId);
        if (prompt) setInput(prompt);
        const { [messageId]: _removedSubmissionId, ...nextSubmissionIds } =
          feedbackSubmissionIdsRef.current;
        feedbackSubmissionIdsRef.current = nextSubmissionIds;
      }
      activeShownFeedbackSurveyKeyRef.current = null;
      setFeedbackTextPrompt(null);
      posthog.capture(
        "form_editor_ai_undo",
        compactProperties({
          aiTraceId,
          ai_trace_id: aiTraceId,
          formId,
          form_id: formId,
          messageId,
          message_id: messageId,
          model: message?.metadata?.model,
          source: "form_editor_ai",
          workspaceId: message?.metadata?.workspaceId,
          workspace_id: message?.metadata?.workspaceId,
        }),
      );
    },
    [formId, messages, posthog],
  );

  const clearUndoSnapshot = useCallback(() => {
    setUndoSnapshot(null);
  }, []);

  return {
    clearUndoSnapshot,
    disabled: status === "submitted" || status === "streaming",
    error,
    examplePrompts,
    feedbackByMessageId,
    feedbackRecordedMessageIds,
    feedbackTextPrompt,
    handleFeedback,
    handleFeedbackTextDismiss,
    handleFeedbackTextShown,
    handleFeedbackTextSubmit,
    handleUndo,
    input,
    messages,
    sendPrompt,
    setInput,
    status,
    stop,
    undoneMessageIds,
    undoSnapshot,
  };
}
