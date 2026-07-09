"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { useConvex, usePaginatedQuery_experimental } from "convex/react";
import { useMemo } from "react";
import { type RoutePrewarmOptions, useRoutePrewarm } from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { useRequiredWorkspaceFormData } from "../_data-provider";
import { prewarmFormSubmissionsRoute } from "./_prewarm";

type SubmissionRow = FunctionReturnType<typeof api.submissions.list>["page"][number];
type SubmissionColumn = SubmissionRow["columnHints"][number];

const formSubmissionsSegment = createSegmentData<{
  canLoadMore: boolean;
  columns: SubmissionColumn[];
  error: Error | undefined;
  isLoading: boolean;
  loadMore: (numItems: number) => void;
  rows: SubmissionRow[];
  status: "pending" | "success" | "error";
}>("FormSubmissions");

function mergeSubmissionColumns(rows: SubmissionRow[]): SubmissionColumn[] {
  const columns = new Map<string, SubmissionColumn>();

  for (const row of rows) {
    for (const hint of row.columnHints) {
      const existing = columns.get(hint.id);
      columns.set(
        hint.id,
        existing
          ? {
              ...existing,
              label: existing.type === null && hint.type !== null ? hint.label : existing.label,
              type: existing.type ?? hint.type,
              firstSeenSubmittedTime: Math.min(
                existing.firstSeenSubmittedTime,
                hint.firstSeenSubmittedTime,
              ),
              lastSeenSubmittedTime: Math.max(
                existing.lastSeenSubmittedTime,
                hint.lastSeenSubmittedTime,
              ),
            }
          : hint,
      );
    }
  }

  return [...columns.values()].toSorted((left, right) => {
    const firstSeenDiff = left.firstSeenSubmittedTime - right.firstSeenSubmittedTime;
    return firstSeenDiff !== 0 ? firstSeenDiff : left.label.localeCompare(right.label);
  });
}

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
  const pagination = usePaginatedQuery_experimental({
    query: api.submissions.list,
    args: { formId: form._id },
    initialNumItems: 50,
  });
  const rows = pagination.data ?? [];
  const columns = useMemo(() => mergeSubmissionColumns(rows), [rows]);
  const value = useMemo(
    () => ({
      canLoadMore: pagination.canLoadMore,
      columns,
      error: pagination.error,
      isLoading: pagination.isLoading,
      loadMore: pagination.loadMore,
      rows,
      status: pagination.status,
    }),
    [columns, pagination, rows],
  );
  return (
    <formSubmissionsSegment.Provider value={value}>{children}</formSubmissionsSegment.Provider>
  );
}

export const useFormSubmissionsData = formSubmissionsSegment.useData;
