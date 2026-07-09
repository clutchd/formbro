import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmRoute } from "@/lib/convex/route-prewarm";

export function prewarmFormSubmissionsRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
  formSlug: string,
) {
  prewarmRoute(convex, [{ query: api.workspace.context, args: { workspaceSlug, formSlug } }]);
}
