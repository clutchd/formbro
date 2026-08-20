"use client";

import type { Id } from "@formbro/convex/_generated/dataModel";
import type { CompiledForm } from "@formbro/core/compile";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { ANALYTICS_EVENTS, type PublicFormAnalyticsProperties } from "@formbro/core/analytics";
import { Form } from "@formbro/react/components/form";
import { RiAlertLine, RiCheckboxCircleLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { analytics } from "@/lib/posthog";

type PublicFormAnalyticsProps = {
  formId?: Id<"forms">;
  formName?: string;
  formSlug?: string;
  status?: string;
  workspaceSlug?: string;
};

function publicFormProperties({
  formId,
  formName,
  formSlug,
  status,
  workspaceSlug,
}: PublicFormAnalyticsProps): PublicFormAnalyticsProperties {
  return {
    form_id: formId,
    form_name: formName,
    form_slug: formSlug,
    form_status: status,
    workspace_slug: workspaceSlug,
  };
}

export function PublicFormAnalytics({
  formId,
  formName,
  formSlug,
  status,
  workspaceSlug,
}: PublicFormAnalyticsProps) {
  useEffect(() => {
    analytics.capture(
      ANALYTICS_EVENTS.PUBLIC_FORM_VIEWED,
      publicFormProperties({ formId, formName, formSlug, status, workspaceSlug }),
    );
  }, [formId, formName, formSlug, status, workspaceSlug]);

  return null;
}

export function PublicForm({
  compiledSchema,
  formId,
  formName,
  formSlug,
  schemaId,
  workspaceSlug,
}: {
  compiledSchema: CompiledForm;
  formId: Id<"forms">;
  formName?: string;
  formSlug?: string;
  schemaId: Id<"formSchemas">;
  workspaceSlug?: string;
}) {
  const submit = useMutation(api.submissions.create);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const analyticsProperties = {
    formId,
    formName,
    formSlug,
    status: "ready",
    workspaceSlug,
  };

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
          analytics.capture(
            ANALYTICS_EVENTS.PUBLIC_FORM_SUBMITTED,
            publicFormProperties(analyticsProperties),
          );
        }}
        onError={({ error }) => {
          const message = getErrorMessage(error);
          setSubmitError(message);
          analytics.capture(ANALYTICS_EVENTS.PUBLIC_FORM_SUBMIT_FAILED, {
            ...publicFormProperties(analyticsProperties),
            error_message: message,
          });
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
