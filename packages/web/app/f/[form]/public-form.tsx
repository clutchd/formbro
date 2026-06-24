"use client";

import type { FunctionReturnType } from "convex/server";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { type FormInput, JsonParse } from "@formbro/core/schema/form";
import { Form } from "@formbro/react/components/form";
import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiFileForbidLine,
  RiLockLine,
  RiTimeLine,
} from "@remixicon/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";

export function PublicForm({ form }: { form: FunctionReturnType<typeof api.forms.getPublic> }) {
  const submit = useMutation(api.submissions.create);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (form == null) {
    return (
      <PageState
        icon={<RiFileForbidLine className="size-5" />}
        title="Form not found"
        description="This form does not exist or may have been removed by its owner."
        status="error"
      />
    );
  }

  if (submitted) {
    return (
      <PageState
        icon={<RiCheckboxCircleLine className="size-5" />}
        title="Response recorded"
        description="Thank you. Your response has been submitted."
      />
    );
  }

  if (form.data.status === "closed") {
    return (
      <PageState
        icon={<RiLockLine className="size-5" />}
        title="Form closed"
        description="This form is no longer accepting new responses."
        status="warning"
      />
    );
  }

  if (form.data.status === "draft" || !form.data.schema || form.data.schemaId == null) {
    return (
      <PageState
        icon={<RiTimeLine className="size-5" />}
        title="Coming soon"
        description="This form is still being prepared and is not accepting responses yet."
      />
    );
  }

  let parsedSchema: FormInput;
  try {
    parsedSchema = JsonParse(form.data.schema);
  } catch {
    return (
      <PageState
        icon={<RiAlertLine className="size-5" />}
        title="Form unavailable"
        description="This form could not be loaded. Please try again later."
        status="error"
      />
    );
  }

  const formId = form.data.id;
  const schemaId = form.data.schemaId;

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
        schema={parsedSchema}
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
