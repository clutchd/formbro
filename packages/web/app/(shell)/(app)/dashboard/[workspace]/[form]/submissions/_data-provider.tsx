"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { useConvex, usePaginatedQuery } from "convex/react";
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
  isLoading: boolean;
  loadMore: (numItems: number) => void;
  rows: SubmissionRow[];
  status: "pending" | "success";
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

  return [...columns.values()].sort((left, right) => {
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
  const pagination = usePaginatedQuery(
    api.submissions.list,
    { formId: form._id },
    { initialNumItems: 50 },
  );
  const rows = pagination.results;
  const columns = useMemo(() => mergeSubmissionColumns(rows), [rows]);
  const canLoadMore = pagination.status === "CanLoadMore";
  const isLoading = pagination.status === "LoadingFirstPage" || pagination.status === "LoadingMore";
  const status: "pending" | "success" =
    pagination.status === "LoadingFirstPage" ? "pending" : "success";
  const value = useMemo(
    () => ({
      canLoadMore,
      columns,
      isLoading,
      loadMore: pagination.loadMore,
      rows,
      status,
    }),
    [canLoadMore, columns, isLoading, pagination.loadMore, rows, status],
  );
  return (
    <formSubmissionsSegment.Provider value={value}>{children}</formSubmissionsSegment.Provider>
  );
}

export const useFormSubmissionsData = formSubmissionsSegment.useData;
