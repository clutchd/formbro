"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { useConvex, useQuery } from "convex/react";
import { useMemo } from "react";
import { type RoutePrewarmOptions, useRoutePrewarm } from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { useRequiredWorkspaceFormData } from "../_data-provider";
import { prewarmFormSubmissionsRoute } from "./_prewarm";

const formSubmissionsSegment = createSegmentData<{
  submissions: FunctionReturnType<typeof api.submissions.list> | undefined;
}>("FormSubmissions");

export function useFormSubmissionsPrewarmIntent(
  workspaceSlug: string,
  formSlug: string,
  options: RoutePrewarmOptions = {},
) {
  const convex = useConvex();
  return useRoutePrewarm(
    `/dashboard/${workspaceSlug}/${formSlug}/submissions`,
    () => prewarmFormSubmissionsRoute(convex, workspaceSlug, formSlug),
    options,
  );
}

export function FormSubmissionsDataProvider({ children }: { children: ReactNode }) {
  const { form } = useRequiredWorkspaceFormData();
  const submissions = useQuery(api.submissions.list, { formId: form._id });
  const value = useMemo(() => ({ submissions }), [submissions]);
  return (
    <formSubmissionsSegment.Provider value={value}>{children}</formSubmissionsSegment.Provider>
  );
}

export const useFormSubmissionsData = formSubmissionsSegment.useData;
