import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmRoute } from "@/lib/convex/route-prewarm";

export async function prewarmWorkspaceSettingsRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
) {
  prewarmRoute(convex, [{ query: api.workspace.context, args: { workspaceSlug } }]);
  try {
    const context = await convex.query(api.workspace.context, { workspaceSlug });
    if (!context?.ok || !context.data.workspace._id) {
      return;
    }
    prewarmRoute(convex, [
      { query: api.forms.list, args: { workspaceId: context.data.workspace._id } },
      { query: api.workspace.listMembers, args: { workspaceId: context.data.workspace._id } },
      { query: api.workspace.listInvites, args: { workspaceId: context.data.workspace._id } },
      { query: api.workspace.billing, args: { workspaceId: context.data.workspace._id } },
    ]);
  } catch (error) {
    console.warn("Workspace settings dependent prewarm failed", error);
  }
}
