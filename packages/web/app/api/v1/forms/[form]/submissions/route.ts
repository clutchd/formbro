import type { Id } from "@formbro/convex/_generated/dataModel";
import { api } from "@formbro/convex/_generated/api";
import { PublishedFormSubmissionSchema } from "@formbro/core/embed";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { embedSubmissionOptionsResponse, embedSubmissionResponse } from "@/lib/embed-submission";

export const OPTIONS = embedSubmissionOptionsResponse;

export async function POST(request: Request, { params }: { params: Promise<{ form: string }> }) {
  const body = await request.json().catch(() => null);
  const submission = PublishedFormSubmissionSchema.safeParse(body);

  if (!submission.success) {
    return embedSubmissionResponse({
      ok: false,
      error: {
        code: "SUBMISSION_REQUEST_INVALID",
        message: "The submission request is invalid.",
        status: "BAD_REQUEST",
      },
    });
  }

  try {
    const { form: formSlug } = await params;
    const publicForm = await fetchQuery(api.forms.getPublic, { slug: formSlug });

    if (publicForm == null) {
      return embedSubmissionResponse({
        ok: false,
        error: {
          code: "FORM_NOT_FOUND",
          message: "Form not found.",
          status: "NOT_FOUND",
        },
      });
    }

    const result = await fetchMutation(api.submissions.create, {
      formId: publicForm.data.id,
      schemaId: submission.data.revision as Id<"formSchemas">,
      idempotencyKey: submission.data.idempotencyKey,
      data: submission.data.values,
    });

    return embedSubmissionResponse(result);
  } catch {
    return embedSubmissionResponse({
      ok: false,
      error: {
        code: "SUBMISSION_UNAVAILABLE",
        message: "The response could not be submitted. Please try again.",
        status: "SERVICE_UNAVAILABLE",
      },
    });
  }
}
