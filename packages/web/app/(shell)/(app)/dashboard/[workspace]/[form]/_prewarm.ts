import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmDependentRoute } from "@/lib/convex/route-prewarm";

export async function prewarmWorkspaceFormRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
  formSlug: string,
) {
  return prewarmDependentRoute({
    convex,
    query: api.workspace.context,
    args: { workspaceSlug, formSlug },
    getDependents: (context) =>
      context?.ok
        ? [{ query: api.forms.list, args: { workspaceId: context.data.workspace._id } }]
        : [],
    warning: "Workspace form dependent prewarm failed",
  });
}
