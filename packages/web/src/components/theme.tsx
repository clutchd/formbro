"use client";

import type * as React from "react";
import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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
  const isDark = resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");
  return { isDark, toggle };
}

export function ThemeIcon() {
  const { isDark } = useToggleTheme();
  return isDark ? <RiSunLine /> : <RiMoonLine />;
}
