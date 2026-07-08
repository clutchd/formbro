"use client";

import { RiMoonLine, RiSunLine } from "@remixicon/react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

type ResolvedTheme = "light" | "dark";
type Theme = ResolvedTheme | "system";

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
};

const STORAGE_KEY = "theme";
const THEMES: ResolvedTheme[] = ["light", "dark"];
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";

  try {
    const theme = window.localStorage.getItem(STORAGE_KEY);
    return theme === "light" || theme === "dark" || theme === "system" ? theme : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme, systemTheme: ResolvedTheme) {
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  document.documentElement.classList.remove(...THEMES);
  document.documentElement.classList.add(resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia(SYSTEM_QUERY);
    const handleChange = () => setSystemTheme(getSystemTheme());

    media.addEventListener("change", handleChange);
    handleChange();

    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setThemeState(getStoredTheme());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    applyTheme(theme, systemTheme);
  }, [theme, systemTheme]);

  const setTheme = useCallback<Dispatch<SetStateAction<Theme>>>((value) => {
    setThemeState((currentTheme) => {
      const nextTheme = typeof value === "function" ? value(currentTheme) : value;

      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // Ignore storage failures; the in-memory theme still updates.
      }

      return nextTheme;
    });
  }, []);

  const value = useMemo(
    () => ({
      resolvedTheme: theme === "system" ? systemTheme : theme,
      setTheme,
      theme,
    }),
    [setTheme, systemTheme, theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

function useTheme() {
  const theme = use(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return theme;
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
