"use client";

import type { api } from "@formbro/convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { createContext, useContext, type ReactNode } from "react";

const AppDataContext = createContext<{
  authUser: Awaited<ReturnType<typeof usePreloadedQuery<typeof api.auth.get>>>;
} | null>(null);

export function AppDataProvider({
  preloadedAuthUser,
  children,
}: {
  preloadedAuthUser: Preloaded<typeof api.auth.get>;
  children: ReactNode;
}) {
  const authUser = usePreloadedQuery(preloadedAuthUser);

  return <AppDataContext.Provider value={{ authUser }}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);

  if (!value) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return value;
}
