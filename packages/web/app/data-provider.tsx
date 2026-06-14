"use client";

import type { api } from "@formbro/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { createSegmentData } from "@/lib/data-segment";

const app = createSegmentData<{
  authUser: FunctionReturnType<typeof api.auth.get>;
}>("App");

export function AppDataProvider({
  preloadedAuthUser,
  children,
}: {
  preloadedAuthUser: Preloaded<typeof api.auth.get>;
  children: ReactNode;
}) {
  const authUser = usePreloadedQuery(preloadedAuthUser);
  return <app.Provider value={{ authUser }}>{children}</app.Provider>;
}

export const useAppData = app.useData;
