"use client";

import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useSyncExternalStore, type ReactNode } from "react";

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useToggleTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerSnapshot,
  );
  const isDark = isHydrated && resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return { isDark, toggle };
}

export function ThemeIcon() {
  const { isDark } = useToggleTheme();
  return isDark ? <RiSunLine /> : <RiMoonLine />;
}
