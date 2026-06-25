"use client";

import type { Id } from "@formbro/convex/_generated/dataModel";
import type { CompiledForm } from "@formbro/core/compile";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { Form } from "@formbro/react/components/form";
import { RiAlertLine, RiCheckboxCircleLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";

export function PublicForm({
  compiledSchema,
  formId,
  schemaId,
}: {
  compiledSchema: CompiledForm;
  formId: Id<"forms">;
  schemaId: Id<"formSchemas">;
}) {
  const submit = useMutation(api.submissions.create);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (submitted) {
    return (
      <PageState
        icon={<RiCheckboxCircleLine className="size-5" />}
        title="Response recorded"
        description="Thank you. Your response has been submitted."
      />
    );
  }

  return (
    <Page className="flex flex-1 flex-col justify-center py-10">
      {submitError ? (
        <div
          className="mx-auto mb-4 flex w-full max-w-xl items-start gap-3 rounded-lg border border-destructive-border bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          <RiAlertLine className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Could not submit response</p>
            <p className="mt-1 text-destructive/80">{submitError}</p>
          </div>
        </div>
      ) : null}
      <Form
        compiledSchema={compiledSchema}
        className="mx-auto w-full max-w-xl"
        onSuccess={() => {
          setSubmitError(null);
          setSubmitted(true);
        }}
        onError={({ error }) => {
          const message = getErrorMessage(error);
          setSubmitError(message);
          toast.error("Could not submit response", {
            description: message,
          });
        }}
        action={({ values }) => {
          setSubmitError(null);
          return submit({
            formId,
            schemaId,
            data: values,
          });
        }}
      />
    </Page>
  );
}
