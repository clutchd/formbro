"use client";

import type { Id } from "@formbro/convex/_generated/dataModel";
import type { CompiledForm } from "@formbro/core/compile";
import { api } from "@formbro/convex/_generated/api";
import { getErrorCode, getErrorMessage } from "@formbro/convex/errors";
import { Form } from "@formbro/react/components/form";
import { Button } from "@formbro/ui/button";
import { RiAlertLine, RiArrowRightLine, RiCheckboxCircleLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { buildFormAcquisitionUrl } from "@/lib/form-acquisition";

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
}: PublicFormAnalyticsProps) {
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
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(
      "public_form_viewed",
      publicFormProperties({ formId, formName, formSlug, status, workspaceSlug }),
    );
  }, [formId, formName, formSlug, posthog, status, workspaceSlug]);

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
  const posthog = usePostHog();
  const submit = useMutation(api.submissions.create);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const analytics = {
    formId,
    formName,
    formSlug,
    status: "ready",
    workspaceSlug,
  };

  if (submitted) {
    return (
      <PublicFormSuccess
        formId={formId}
        formName={formName}
        formSlug={formSlug}
        workspaceSlug={workspaceSlug}
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
          posthog.capture("public_form_submitted", publicFormProperties(analytics));
        }}
        onError={({ error }) => {
          const message = getErrorMessage(error);
          setSubmitError(message);
          posthog.capture("public_form_submit_failed", {
            ...publicFormProperties(analytics),
            error_code: getErrorCode(error),
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

export function PublicFormSuccess({
  formId,
  formName,
  formSlug,
  workspaceSlug,
}: {
  formId: Id<"forms">;
  formName?: string;
  formSlug?: string;
  workspaceSlug?: string;
}) {
  const posthog = usePostHog();
  const createFormHref = buildFormAcquisitionUrl({
    formName,
    formSlug: formSlug ?? formId,
    medium: "success",
    workspaceSlug,
  });

  useEffect(() => {
    posthog.capture("template_acquisition_success_viewed", {
      form_id: formId,
      form_name: formName,
      form_slug: formSlug,
      surface: "public_form_success",
      workspace_slug: workspaceSlug,
    });
  }, [formId, formName, formSlug, posthog, workspaceSlug]);

  return (
    <PageState
      icon={<RiCheckboxCircleLine className="size-5" />}
      title="Response recorded"
      description={
        formName
          ? `Response submitted. Need a form like “${formName}” for your team?`
          : "Response submitted. Need a form like this for your team?"
      }
    >
      <Button asChild variant="outline" className="hover:bg-muted">
        <Link
          href={createFormHref}
          onClick={() => {
            posthog.capture("template_acquisition_cta_clicked", {
              form_id: formId,
              form_name: formName,
              form_slug: formSlug,
              surface: "public_form_success",
              workspace_slug: workspaceSlug,
            });
          }}
        >
          Build a similar form <RiArrowRightLine className="size-4" />
        </Link>
      </Button>
    </PageState>
  );
}
