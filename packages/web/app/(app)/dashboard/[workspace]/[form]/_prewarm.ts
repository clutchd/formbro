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
    if (!context?.ok || !context.data.form) {
      return;
    }
  } catch (error) {
    console.warn("Workspace form dependent prewarm failed", error);
  }
}
