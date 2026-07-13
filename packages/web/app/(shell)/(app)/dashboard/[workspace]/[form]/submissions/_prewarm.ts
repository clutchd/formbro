import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmDependentRoute } from "@/lib/convex/route-prewarm";

export async function prewarmFormSubmissionsRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
  formSlug: string,
) {
  return prewarmDependentRoute({
    convex,
    query: api.workspace.context,
    args: { workspaceSlug, formSlug },
    getDependents: (context) =>
      context?.ok && context.data.form
        ? [{ query: api.submissions.list, args: { formId: context.data.form._id } }]
        : [],
    warning: "Form submissions dependent prewarm failed",
  });
}
