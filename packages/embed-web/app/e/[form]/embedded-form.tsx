"use client";

import type { PublishedFormSnapshot } from "@formbro/core/embed";
import { Form } from "@formbro/react/components/form";
import { useRef, useState } from "react";
import { postEmbedMessage } from "./embed-frame";

type SubmissionResponse = {
  data?: {
    bytes: number;
    submissionId: string;
  };
  error?: {
    code: string;
    message: string;
  };
};

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function EmbeddedForm({
  snapshot,
  submissionUrl,
}: {
  snapshot: PublishedFormSnapshot;
  submissionUrl: string;
}) {
  const idempotencyKeyRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (submitted) {
    return (
      <section className="embed-state" aria-live="polite">
        <div>
          <h1>Response recorded</h1>
          <p>Thank you. Your response has been submitted.</p>
        </div>
      </section>
    );
  }

  return (
    <div
      onInputCapture={() => {
        if (!startedRef.current) {
          startedRef.current = true;
          postEmbedMessage(snapshot.publicId, { event: "started" });
        }
      }}
    >
      {submitError ? (
        <div className="embed-alert" role="alert">
          <strong>Could not submit response</strong>
          <p>{submitError}</p>
        </div>
      ) : null}
      <Form
        schema={snapshot.schema}
        className="w-full"
        onSuccess={() => {
          setSubmitError(null);
          setSubmitted(true);
          postEmbedMessage(snapshot.publicId, { event: "submitted" });
        }}
        onError={({ error }) => {
          setSubmitError(error instanceof Error ? error.message : String(error));
          postEmbedMessage(snapshot.publicId, { event: "error", code: "submission_failed" });
        }}
        onPercentChange={(percent) => {
          postEmbedMessage(snapshot.publicId, { event: "progress", percent });
        }}
        action={async ({ values }) => {
          idempotencyKeyRef.current ??= createIdempotencyKey();
          setSubmitError(null);

          const response = await fetch(submissionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idempotencyKey: idempotencyKeyRef.current,
              revision: snapshot.revision,
              values,
            }),
          });
          if (!response.ok) {
            const body = (await response.json().catch(() => ({}))) as SubmissionResponse;

            return {
              ok: false,
              error:
                body.error?.message ?? "The response could not be submitted. Please try again.",
            };
          }

          const body = (await response.json()) as SubmissionResponse;

          if (!body.data) {
            return {
              ok: false,
              error: "The response could not be submitted. Please try again.",
            };
          }

          return {
            ok: true,
            data: body.data,
          };
        }}
      />
    </div>
  );
}
