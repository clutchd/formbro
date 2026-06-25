import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmRoute } from "@/lib/convex/route-prewarm";

export async function prewarmFormSubmissionsRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
  formSlug: string,
) {
  prewarmRoute(convex, [{ query: api.workspace.context, args: { workspaceSlug, formSlug } }]);

  try {
    const context = await convex.query(api.workspace.context, { workspaceSlug, formSlug });
    if (!context?.ok || !context.data.form) {
      return;
    }

    prewarmRoute(convex, [
      { query: api.submissions.list, args: { formId: context.data.form._id } },
    ]);
  } catch (error) {
    console.warn("Form submissions dependent prewarm failed", error);
  }
}
