import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmDependentRoute, routeQuery } from "@/lib/convex/route-prewarm";

export async function prewarmWorkspaceRoute(convex: ConvexReactClient, workspaceSlug: string) {
  return prewarmDependentRoute({
    convex,
    query: api.workspace.context,
    args: { workspaceSlug },
    getDependents: (context) =>
      context?.ok
        ? [
            routeQuery(api.forms.list, { workspaceId: context.data.workspace._id }),
            routeQuery(api.workspace.metrics, { workspaceId: context.data.workspace._id }),
          ]
        : [],
  });
}
