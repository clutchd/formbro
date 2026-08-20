import type { Context } from "@opentelemetry/api";
import {
  FinishFormSchemaEditInputSchema,
  FinishFormSchemaEditOutputSchema,
  FormSchemaEditOutputSchema,
  type FormEditorAiMessageMetadata,
  type FormSchemaEditOutput,
} from "@formbro/core/ai";
import { summarizeFormSchemaChanges } from "@formbro/core/diff";
import { ElementRegistry, FieldRegistry } from "@formbro/core/registry";
import { FormSchema, JsonSerialize, type FormInput } from "@formbro/core/schema/form";
import { FORMBRO_SCHEMA_VERSION } from "@formbro/core/schema/version";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
  type IdGenerator,
  type ReadableSpan,
  type Span,
  type SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { PostHogTraceExporter } from "@posthog/ai/otel";
import {
  convertToModelMessages,
  hasToolCall,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { TRUSTED_ORIGINS } from "./auth";

const AI_CHAT_ALLOWED_ORIGINS = new Set(TRUSTED_ORIGINS.map((origin) => origin.replace(/\/$/, "")));

const AI_CHAT_CORS_HEADERS = {
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

const AI_SERVICE_NAME = "formbro-convex";
const POSTHOG_PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const FORM_EDITOR_AI_MODEL = process.env.FORM_EDITOR_AI_MODEL ?? "openai/gpt-5-mini";
const FORM_EDITOR_AI_MAX_STEPS = getPositiveIntegerEnv("FORM_EDITOR_AI_MAX_STEPS", 24);
const FORM_EDITOR_AI_REASONING_EFFORT = "minimal";
const FORM_EDITOR_AI_TEXT_VERBOSITY = "low";
const POSTHOG_DISTINCT_ID_ATTRIBUTE = "posthog_distinct_id";
const POSTHOG_TRACE_ID_ATTRIBUTE = "posthog_trace_id";
const AI_SDK_METADATA_PREFIX = "ai.telemetry.metadata.";
const aiTelemetryResource = resourceFromAttributes({
  "service.name": AI_SERVICE_NAME,
});

type FormEditorAiMessage = UIMessage<FormEditorAiMessageMetadata>;
const EditFormInputSchema = z.strictObject({
  label: z.string().min(1),
  schema: FormSchema,
});
type EditFormInput = z.output<typeof EditFormInputSchema>;

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isVisibleTextPart(part: FormEditorAiMessage["parts"][number]) {
  return part.type === "text" && part.text.trim().length > 0;
}

function pruneFormEditorAiMessagesForModel(messages: FormEditorAiMessage[]) {
  return messages.flatMap((message) => {
    const parts = message.parts.filter(isVisibleTextPart);

    if (parts.length === 0) return [];

    return [{ ...message, parts }];
  });
}

function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createTraceId() {
  let traceId = randomHex(16);

  while (/^0+$/.test(traceId)) {
    traceId = randomHex(16);
  }

  return traceId;
}

class FixedTraceIdGenerator implements IdGenerator {
  constructor(private readonly traceId: string) {}

  generateTraceId() {
    return this.traceId;
  }

  generateSpanId() {
    return randomHex(8);
  }
}

function createPostHogAiTelemetryAttributes({
  distinctId,
  traceId,
}: {
  distinctId: string;
  traceId: string;
}) {
  return {
    [POSTHOG_DISTINCT_ID_ATTRIBUTE]: distinctId,
    [`${AI_SDK_METADATA_PREFIX}${POSTHOG_DISTINCT_ID_ATTRIBUTE}`]: distinctId,
    [POSTHOG_TRACE_ID_ATTRIBUTE]: traceId,
    [`${AI_SDK_METADATA_PREFIX}${POSTHOG_TRACE_ID_ATTRIBUTE}`]: traceId,
  };
}

function createPostHogAiTelemetryMetadata({
  distinctId,
  traceId,
}: {
  distinctId: string;
  traceId: string;
}) {
  return {
    posthog_distinct_id: distinctId,
    posthog_trace_id: traceId,
  };
}

class PostHogAiIdentitySpanProcessor implements SpanProcessor {
  constructor(private readonly attributes: Record<string, string>) {}

  forceFlush() {
    return Promise.resolve();
  }

  onStart(_span: Span, _parentContext: Context) {
    return;
  }

  onEnding(span: Span) {
    span.setAttributes(this.attributes);
  }

  onEnd(_span: ReadableSpan) {
    return;
  }

  shutdown() {
    return Promise.resolve();
  }
}

function createAiTelemetry({ distinctId }: { distinctId: string }) {
  const traceId = createTraceId();
  const posthogAttributes = createPostHogAiTelemetryAttributes({ distinctId, traceId });
  const provider = new BasicTracerProvider({
    idGenerator: new FixedTraceIdGenerator(traceId),
    resource: aiTelemetryResource,
    spanProcessors: [
      new PostHogAiIdentitySpanProcessor(posthogAttributes),
      new SimpleSpanProcessor(
        new PostHogTraceExporter({
          projectToken: POSTHOG_PROJECT_TOKEN,
        }),
      ),
    ],
  });
  let flushPromise: Promise<void> | null = null;

  const flush = async () => {
    flushPromise ??= provider
      .forceFlush()
      .catch((error: unknown) => {
        console.warn("Form editor AI telemetry export failed", error);
      })
      .finally(() => {
        flushPromise = null;
      });

    await flushPromise;
  };

  return {
    flush,
    metadata: createPostHogAiTelemetryMetadata({ distinctId, traceId }),
    traceId,
    tracer: provider.getTracer(AI_SERVICE_NAME),
  };
}

function clientSchemaMatchesDraft(clientSchema: unknown, draftSchema: FormInput) {
  if (clientSchema === undefined) return true;

  const parsed = FormSchema.safeParse(clientSchema);
  if (!parsed.success) return false;

  return JsonSerialize(parsed.data) === JsonSerialize(draftSchema);
}

function formatSupportedRules(rules: readonly string[] | string) {
  return Array.isArray(rules) ? rules.join(", ") : rules;
}

function formatElementGuide() {
  return ElementRegistry.map((element) => {
    const fields = Object.keys(element.schema.shape);
    const fieldHint = fields.length > 0 ? ` Properties: ${fields.join(", ")}.` : "";
    return `- ${element.key}: ${element.description}.${fieldHint}`;
  }).join("\n");
}

function formatFieldGuide() {
  return FieldRegistry.map(
    (field) =>
      `- ${field.key}: ${field.description}. Supported rules: ${formatSupportedRules(field.rules)}.`,
  ).join("\n");
}

function getFormSchemaPromptReference() {
  return `FormBro schema version: ${FORMBRO_SCHEMA_VERSION}

Root object:
- id: required form id (lowercase letters, numbers, and underscores)
- version: optional, defaults to "${FORMBRO_SCHEMA_VERSION}"
- name: required form title
- elements: ordered array of layout elements and fields (each id must be unique)
- listeners: optional value transforms between fields
- submit: optional { label?, size?: "default" | "full-width", variant?: "default" | "destructive" }
- toasts: optional boolean or { success?, error?, loading? } message overrides
- variables: optional string map for interpolation

Every element or field requires:
- id: unique lowercase snake_case element id. Use lowercase letters, numbers, and underscores; never use hyphens, spaces, uppercase, or camelCase.
- name: internal name
- type: one of the supported types below
- category: "element" or "field" (defaults from type)

Shared field properties:
- label: string or boolean (boolean controls whether the label is shown)
- description: optional helper text
- placeholder: optional input placeholder
- default: optional default value
- orientation: optional "vertical" | "horizontal" | "responsive"
- options: required string array for single_select, radio_group, and checkbox_group fields
- rules: optional validation rules supported by the field type

Layout elements:
${formatElementGuide()}

Fields:
${formatFieldGuide()}

Validation rules (field.rules):
- { type: "required", value: boolean, message?: string, event?: "onBlur" | "onChange" | "onMount" | "onSubmit" }
- { type: "min", value: number, message?: string, event?: ... }
- { type: "max", value: number, message?: string, event?: ... }
- { type: "regex", value: string, message?: string, event?: ... }

Listeners:
- { type: "slugify", source: "<field id>", target: "<field id>" }
- { type: "uppercase", source: "<field id>", target: "<field id>" }`;
}

function getSystemPrompt(schema: FormInput) {
  return `You are FormBro's AI form editor.

You help users build, edit, and refine forms while preserving a fast, polished form-builder workflow.

Current draft schema:
${JsonSerialize(schema)}

FormBro schema reference:
${getFormSchemaPromptReference()}

Conversation rules:
- Always write a short, friendly text update before calling a tool.
- Format assistant text as lightweight Markdown.
- Keep sidebar responses scannable: short paragraphs by default.
- Before calling a tool, write one short sentence unless the user asks for explanation.
- Use bullets only when listing multiple changes, options, or steps.
- Do not force "Done" or "Next" sections; ask one natural follow-up question when useful.
- Do not duplicate every field-level change in prose; the tool activity rows already show detailed changes.
- Be concise. The chat sidebar is narrow.

Editing rules:
- Use only supported FormBro element and field types.
- Preserve the form id. The backend will enforce this.
- Keep the internal form name useful, but do not assume it must render as a heading.
- Page breaks split the previous page from the next page. Never start a rewrite with a page_break.
- Use heading and description elements when they improve scannability.
- Prefer fewer fields and clearer labels over long, intimidating forms.
- Add validation rules only when supported by the field type.
- Do not invent integrations, conditional logic, upload fields, signatures, payments, or CAPTCHA.
- When refining an existing form, preserve unrelated elements, ids, order, submit settings, listeners, toasts, and variables unless the user asks to change them.

Tool rule:
- You have exactly two tools: edit_form_schema and finish_form_edit.
- edit_form_schema takes a complete FormBro schema snapshot, not a patch, not operations, and not a page API.
- Every edit_form_schema call replaces the current draft with the schema you provide.
- To keep the editor responsive, call edit_form_schema after each meaningful chunk. For form generation, a good default is one call after the first page is ready, then one call after each additional page is added.
- Each schema snapshot must include the full ordered elements array as it should exist at that moment.
- For multi-page forms, put page_break elements between pages. Never put a page_break before the first page's content.
- Do not invent operation types like add_pages, add_layout_elements, add_fields, append_page, move_elements, or update_elements.
- The product language is elements, fields, and pages. Never call form elements "blocks".
- After all edit_form_schema calls, call finish_form_edit with a concise final summary.`;
}

function getAiChatCorsHeaders(request: Request) {
  const headers = new Headers(AI_CHAT_CORS_HEADERS);
  const origin = request.headers.get("Origin")?.replace(/\/$/, "");

  if (origin && AI_CHAT_ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

function isAllowedCorsRequest(request: Request) {
  const origin = request.headers.get("Origin")?.replace(/\/$/, "");
  return !origin || AI_CHAT_ALLOWED_ORIGINS.has(origin);
}

function errorResponse(request: Request, message: string, status: number) {
  return new Response(message, {
    headers: getAiChatCorsHeaders(request),
    status,
  });
}

export const options = httpAction(async (_ctx, request) => {
  if (!isAllowedCorsRequest(request)) {
    return errorResponse(request, "Origin not allowed.", 403);
  }

  return new Response(null, {
    headers: getAiChatCorsHeaders(request),
    status: 204,
  });
});

export const chat = httpAction(async (ctx, request) => {
  if (!isAllowedCorsRequest(request)) {
    return errorResponse(request, "Origin not allowed.", 403);
  }

  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return errorResponse(request, "Unauthorized", 401);
  }

  try {
    const body = z
      .object({
        formId: z.string().min(1),
        messages: z.array(z.custom<FormEditorAiMessage>()),
        schema: z.unknown().optional(),
      })
      .parse(await request.json());

    const formId = body.formId as Id<"forms">;
    const draft = await ctx.runQuery(api.forms.getDraft, { formId });

    if (!draft.ok) {
      return errorResponse(request, "Form unavailable.", 403);
    }

    const currentSchema = draft.data.schema;

    if (!clientSchemaMatchesDraft(body.schema, currentSchema)) {
      return errorResponse(request, "The draft changed. Reload and try again.", 409);
    }

    let latestSchema = currentSchema;
    const model = FORM_EDITOR_AI_MODEL;
    const messages = await convertToModelMessages(pruneFormEditorAiMessagesForModel(body.messages));
    const aiTelemetry = createAiTelemetry({ distinctId: identity.subject });

    const editForm = async (input: EditFormInput): Promise<FormSchemaEditOutput> => {
      const nextSchema = FormSchema.parse({
        ...input.schema,
        id: latestSchema.id,
      });
      const operations = summarizeFormSchemaChanges(latestSchema, nextSchema);
      const saved = await ctx.runMutation(api.forms.saveDraft, {
        formId,
        schema: nextSchema,
      });

      if (!saved.ok) {
        throw new Error("The generated form edit could not be saved.");
      }

      latestSchema = saved.data.schema;
      return {
        operations:
          operations.length > 0
            ? operations
            : [{ label: input.label, target: "element", type: "update" }],
      };
    };

    const result = streamText({
      model,
      system: getSystemPrompt(currentSchema),
      messages,
      stopWhen: [hasToolCall("finish_form_edit"), stepCountIs(FORM_EDITOR_AI_MAX_STEPS)],
      maxRetries: 1,
      providerOptions: {
        gateway: {
          user: identity.subject,
          tags: ["feature:form-editor-ai", `form:${draft.data.form._id}`],
        },
        openai: {
          parallelToolCalls: false,
          reasoningEffort: FORM_EDITOR_AI_REASONING_EFFORT,
          textVerbosity: FORM_EDITOR_AI_TEXT_VERBOSITY,
        },
      },
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
        functionId: "form-editor-ai",
        tracer: aiTelemetry.tracer,
        metadata: {
          ...aiTelemetry.metadata,
          ai_trace_id: aiTelemetry.traceId,
          form_id: draft.data.form._id,
          model,
          source: "form-editor",
          workspace_id: draft.data.form.workspaceId,
        },
      },
      tools: {
        edit_form_schema: tool({
          description:
            "Replace the draft with a complete FormBro schema snapshot. Use one call per visible generation chunk.",
          strict: true,
          inputSchema: EditFormInputSchema,
          outputSchema: FormSchemaEditOutputSchema,
          execute: async (input) => {
            return editForm(input);
          },
        }),
        finish_form_edit: tool({
          description:
            "Finish the form edit after all edit_form_schema calls and provide the final summary.",
          strict: true,
          inputSchema: FinishFormSchemaEditInputSchema,
          outputSchema: FinishFormSchemaEditOutputSchema,
          execute: async ({ summary }) => {
            return { summary };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      headers: getAiChatCorsHeaders(request),
      originalMessages: body.messages,
      onFinish: async () => {
        await aiTelemetry.flush();
      },
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            aiTraceId: aiTelemetry.traceId,
            formId: draft.data.form._id,
            model,
            workspaceId: draft.data.form.workspaceId,
          };
        }

        if (part.type === "finish") {
          return {
            aiTraceId: aiTelemetry.traceId,
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      },
      onError: (error) => {
        console.error("Form editor AI stream failed", error);
        return "The form assistant failed to respond.";
      },
    });
  } catch (error) {
    console.error("Form editor AI request failed", error);
    return errorResponse(request, "Chat request failed.", 500);
  }
});
