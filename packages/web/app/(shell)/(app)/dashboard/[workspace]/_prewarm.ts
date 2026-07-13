import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmDependentRoute } from "@/lib/convex/route-prewarm";

export async function prewarmWorkspaceRoute(convex: ConvexReactClient, workspaceSlug: string) {
  return prewarmDependentRoute({
    convex,
    query: api.workspace.context,
    args: { workspaceSlug },
    getDependents: (context) =>
      context?.ok
        ? [
            { query: api.forms.list, args: { workspaceId: context.data.workspace._id } },
            { query: api.workspace.metrics, args: { workspaceId: context.data.workspace._id } },
          ]
        : [],
    warning: "Workspace dependent prewarm failed",
  });
}
