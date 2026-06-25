import { summarizeFormSchemaChanges } from "@formbro/core/diff";
import { ElementRegistry, FieldRegistry } from "@formbro/core/registry";
import { FormSchema, JsonSerialize, type FormInput } from "@formbro/core/schema/form";
import { FORMBRO_SCHEMA_VERSION } from "@formbro/core/schema/version";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
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

const ChatRequestSchema = z.object({
  formId: z.string().min(1),
  messages: z.array(z.custom<UIMessage>()),
  schema: z.unknown().optional(),
});

function clientSchemaMatchesDraft(clientSchema: unknown, draftSchema: FormInput) {
  if (clientSchema === undefined) return true;

  const parsed = FormSchema.safeParse(clientSchema);
  if (!parsed.success) return false;

  return JsonSerialize(parsed.data) === JsonSerialize(draftSchema);
}

function normalizeGeneratedSchema(schema: unknown, currentSchema: FormInput) {
  const parsed = FormSchema.parse(schema);

  return FormSchema.parse({
    ...parsed,
    id: currentSchema.id,
    version: parsed.version ?? currentSchema.version,
  });
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
- id: required form id (lowercase snake_case, starts with a letter, max 64 chars)
- version: optional, defaults to "${FORMBRO_SCHEMA_VERSION}"
- name: required form title
- elements: ordered array of layout elements and fields (each id must be unique)
- listeners: optional value transforms between fields
- submit: optional { label?, size?: "default" | "full-width", variant?: "default" | "destructive" }
- toasts: optional boolean or { success?, error?, loading? } message overrides
- variables: optional string map for interpolation

Every element or field requires:
- id: unique element id
- name: internal name
- type: one of the supported types below
- category: "element" or "field" (defaults from type)

Shared field properties:
- label: string or boolean (boolean controls whether the label is shown)
- description: optional helper text
- placeholder: optional input placeholder
- default: optional default value
- orientation: optional "vertical" | "horizontal" | "responsive"
- options: required string array for single_select fields
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
${JSON.stringify(schema, null, 2)}

FormBro schema reference:
${getFormSchemaPromptReference()}

Conversation rules:
- Always write a short, friendly text update before calling a tool.
- After a tool completes, summarize what changed and ask whether the user wants refinements.
- Be concise. The chat sidebar is narrow.

Editing rules:
- Use only supported FormBro element and field types.
- Return complete schemas, not patches.
- Preserve the form id. The backend will enforce this.
- Keep the internal form name useful, but do not assume it must render as a heading.
- Page breaks start the next page. A page_break label is the title for the page that follows it.
- Use heading and description elements when they improve scannability.
- Prefer fewer fields and clearer labels over long, intimidating forms.
- Add validation rules only when supported by the field type.
- Do not invent integrations, conditional logic, upload fields, signatures, payments, or CAPTCHA.
- When refining an existing form, preserve unrelated elements, ids, order, submit settings, listeners, toasts, and variables unless the user asks to change them.

Tool rule:
- When the form should change, call apply_form_schema with the complete updated schema.`;
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
    const body = ChatRequestSchema.parse(await request.json());
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
    const model = process.env.FORM_EDITOR_AI_MODEL ?? "openai/gpt-5.5";
    const messages = await convertToModelMessages(body.messages);

    const result = streamText({
      model,
      system: getSystemPrompt(currentSchema),
      messages,
      stopWhen: stepCountIs(4),
      maxRetries: 2,
      providerOptions: {
        gateway: {
          user: identity.subject,
          tags: ["feature:form-editor-ai", `form:${draft.data.form._id}`],
        },
      },
      experimental_telemetry: {
        functionId: "form-editor-ai",
        metadata: {
          formId: draft.data.form._id,
          workspaceId: draft.data.form.workspaceId,
        },
      },
      tools: {
        apply_form_schema: tool({
          description: "Apply the complete updated FormBro schema to the current draft.",
          inputSchema: z.object({
            schema: FormSchema.describe("The complete updated FormBro schema."),
          }),
          outputSchema: z.object({
            operations: z.array(
              z.object({
                label: z.string(),
                type: z.enum(["add", "remove", "update"]),
              }),
            ),
            schema: FormSchema,
          }),
          execute: async ({ schema }) => {
            const previousSchema = latestSchema;
            const nextSchema = normalizeGeneratedSchema(schema, previousSchema);
            const saved = await ctx.runMutation(api.forms.saveDraft, {
              formId,
              schema: nextSchema,
            });

            if (!saved.ok) {
              throw new Error("The generated form schema could not be saved.");
            }

            latestSchema = saved.data.schema;

            return {
              operations: summarizeFormSchemaChanges(previousSchema, saved.data.schema),
              schema: saved.data.schema,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      headers: getAiChatCorsHeaders(request),
      originalMessages: body.messages,
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
