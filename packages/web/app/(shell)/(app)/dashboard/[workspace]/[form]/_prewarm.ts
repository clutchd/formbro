import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmRoute } from "@/lib/convex/route-prewarm";

export async function prewarmWorkspaceFormRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
  formSlug: string,
) {
  prewarmRoute(convex, [{ query: api.workspace.context, args: { workspaceSlug, formSlug } }]);

  try {
    const context = await convex.query(api.workspace.context, { workspaceSlug, formSlug });
    if (!context?.ok) {
      return;
    }

    prewarmRoute(convex, [
      { query: api.forms.list, args: { workspaceId: context.data.workspace._id } },
    ]);
  } catch (error) {
    console.warn("Workspace form dependent prewarm failed", error);
  }
}
