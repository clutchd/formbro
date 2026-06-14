"use client";

import type { api } from "@formbro/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { createSegmentData } from "@/lib/data-segment";

const auth = createSegmentData<{
  authUser: FunctionReturnType<typeof api.auth.get>;
}>("Auth");

export function AuthDataProvider({
  preloadedAuthUser,
  children,
}: {
  preloadedAuthUser: Preloaded<typeof api.auth.get>;
  children: ReactNode;
}) {
  const authUser = usePreloadedQuery(preloadedAuthUser);
  return <auth.Provider value={{ authUser }}>{children}</auth.Provider>;
}

export const useAuthData = auth.useData;
