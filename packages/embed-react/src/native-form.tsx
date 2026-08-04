"use client";

import type { PublishedFormSnapshot } from "@formbro/core/embed";
import { Form } from "@formbro/react/components/form";
import { useRef, useState } from "react";
import { submitPublishedForm, type PublishedSubmissionResult } from "./transport";

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export type NativeFormProps = {
  apiUrl: string;
  className?: string;
  onStarted?: () => void;
  onSubmitted?: (data: Extract<PublishedSubmissionResult, { ok: true }>["data"]) => void;
  onSubmissionError?: (error: Extract<PublishedSubmissionResult, { ok: false }>["error"]) => void;
  snapshot: PublishedFormSnapshot;
  successMessage?: string;
};

export function NativeForm({
  apiUrl,
  className,
  onStarted,
  onSubmitted,
  onSubmissionError,
  snapshot,
  successMessage = "Thank you. Your response has been submitted.",
}: NativeFormProps) {
  const idempotencyKeyRef = useRef<string | null>(null);
  const submissionErrorRef = useRef<
    Extract<PublishedSubmissionResult, { ok: false }>["error"] | null
  >(null);
  const startedRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (submitted) {
    return (
      <section
        className={className}
        data-formbro-native
        data-formbro-state="submitted"
        aria-live="polite"
      >
        <p>{successMessage}</p>
      </section>
    );
  }

  return (
    <div
      className={className}
      data-formbro-native
      data-formbro-color-scheme={snapshot.embed.appearance.colorScheme}
      data-formbro-density={snapshot.embed.appearance.density}
      onInputCapture={() => {
        if (!startedRef.current) {
          startedRef.current = true;
          onStarted?.();
        }
      }}
    >
      {submitError ? (
        <div data-formbro-alert role="alert">
          <strong>Could not submit response</strong>
          <p>{submitError}</p>
        </div>
      ) : null}
      <Form
        schema={snapshot.schema}
        onSuccess={({ data }) => {
          submissionErrorRef.current = null;
          setSubmitError(null);
          setSubmitted(true);
          onSubmitted?.(data as Extract<PublishedSubmissionResult, { ok: true }>["data"]);
        }}
        onError={({ error }) => {
          const submissionError = submissionErrorRef.current ?? {
            code: "FORM_UNAVAILABLE",
            message: error instanceof Error ? error.message : String(error),
            status: 503,
          };
          setSubmitError(submissionError.message);
          onSubmissionError?.(submissionError);
        }}
        action={async ({ values }) => {
          idempotencyKeyRef.current ??= createIdempotencyKey();
          setSubmitError(null);
          const result = await submitPublishedForm({
            apiUrl,
            idempotencyKey: idempotencyKeyRef.current,
            publicId: snapshot.publicId,
            revision: snapshot.revision,
            values,
          });

          submissionErrorRef.current = result.ok ? null : result.error;

          return result.ok
            ? { ok: true, data: result.data }
            : { ok: false, error: result.error.message };
        }}
      />
    </div>
  );
}
