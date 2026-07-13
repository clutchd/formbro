import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmDependentRoute, routeQuery } from "@/lib/convex/route-prewarm";

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
        ? [routeQuery(api.submissions.list, { formId: context.data.form._id })]
        : [],
  });
}
