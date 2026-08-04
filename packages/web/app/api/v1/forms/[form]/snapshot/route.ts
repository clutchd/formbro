import { api } from "@formbro/convex/_generated/api";
import { createPublishedFormSnapshot } from "@formbro/core/embed";
import { JsonParse } from "@formbro/core/schema/form";
import { fetchQuery } from "convex/nextjs";
import { embedSnapshotErrorResponse, publishedSnapshotResponse } from "@/lib/embed-snapshot";

export async function GET(_request: Request, { params }: { params: Promise<{ form: string }> }) {
  const { form: formSlug } = await params;
  const result = await fetchQuery(api.forms.getPublic, { slug: formSlug });

  if (result == null) {
    return embedSnapshotErrorResponse({
      code: "FORM_NOT_FOUND",
      message: "This form does not exist.",
      status: 404,
    });
  }

  const form = result.data;
  if (form.status === "closed") {
    return embedSnapshotErrorResponse({
      code: "FORM_CLOSED",
      message: "This form is not accepting responses.",
      status: 409,
    });
  }

  if (
    form.status === "draft" ||
    form.schema == null ||
    form.schemaId == null ||
    form.publishedTime == null
  ) {
    return embedSnapshotErrorResponse({
      code: "FORM_NOT_PUBLISHED",
      message: "This form has not been published.",
      status: 404,
    });
  }

  try {
    return publishedSnapshotResponse(
      createPublishedFormSnapshot({
        publicId: form.slug,
        publishedTime: form.publishedTime,
        revision: form.schemaId,
        schema: JsonParse(form.schema),
      }),
    );
  } catch {
    return embedSnapshotErrorResponse({
      code: "FORM_UNAVAILABLE",
      message: "This form could not be loaded.",
      status: 503,
    });
  }
}
