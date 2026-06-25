import type { Id } from "@formbro/convex/_generated/dataModel";
import { api } from "@formbro/convex/_generated/api";
import { compile, type CompiledForm } from "@formbro/core/compile";
import { JsonParse } from "@formbro/core/schema/form";
import { fetchQuery } from "convex/nextjs";
import { cache } from "react";

export const getPublicForm = cache(async (formSlug: string) => {
  return fetchQuery(api.forms.getPublic, { slug: formSlug });
});

export type PublicFormState =
  | {
      type: "not-found";
    }
  | {
      type: "closed";
    }
  | {
      type: "draft";
    }
  | {
      type: "unavailable";
    }
  | {
      compiledSchema: CompiledForm;
      formId: Id<"forms">;
      schemaId: Id<"formSchemas">;
      type: "ready";
    };

export const getPublicFormState = cache(async (formSlug: string): Promise<PublicFormState> => {
  const form = await getPublicForm(formSlug);

  if (form == null) {
    return { type: "not-found" };
  }

  if (form.data.status === "closed") {
    return { type: "closed" };
  }

  if (form.data.status === "draft" || !form.data.schema || form.data.schemaId == null) {
    return { type: "draft" };
  }

  try {
    return {
      compiledSchema: compile(JsonParse(form.data.schema)),
      formId: form.data.id,
      schemaId: form.data.schemaId,
      type: "ready",
    };
  } catch {
    return { type: "unavailable" };
  }
});
