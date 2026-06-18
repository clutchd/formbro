"use client";

import type { api } from "@formbro/convex/_generated/api";
import type { Preloaded } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { useMemo } from "react";
import { createSegmentData } from "@/lib/data-segment";

const app = createSegmentData<{
  authUser: FunctionReturnType<typeof api.auth.get> | null;
}>("App");

export function AppDataProvider({
  preloadedAuthUser,
  children,
}: {
  preloadedAuthUser: Preloaded<typeof api.auth.get>;
  children: ReactNode;
}) {
  const authUser = usePreloadedAuthQuery(preloadedAuthUser);
  const value = useMemo(() => ({ authUser }), [authUser]);
  return <app.Provider value={value}>{children}</app.Provider>;
}

export const useAppData = app.useData;
