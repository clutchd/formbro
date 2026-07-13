import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmDependentRoute } from "@/lib/convex/route-prewarm";

export async function prewarmWorkspaceSettingsRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
) {
  return prewarmDependentRoute({
    convex,
    query: api.workspace.context,
    args: { workspaceSlug },
    getDependents: (context) =>
      context?.ok
        ? [
            { query: api.forms.list, args: { workspaceId: context.data.workspace._id } },
            { query: api.workspace.listMembers, args: { workspaceId: context.data.workspace._id } },
            { query: api.workspace.listInvites, args: { workspaceId: context.data.workspace._id } },
            { query: api.workspace.billing, args: { workspaceId: context.data.workspace._id } },
          ]
        : [],
    warning: "Workspace settings dependent prewarm failed",
  });
}
