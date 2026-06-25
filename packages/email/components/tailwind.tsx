import { Tailwind as ReactEmailTailwind } from "@react-email/components";
import React from "react";

export type Theme = "system" | "light" | "dark";

const lightColors = {
  background: "#fefdfe",
  foreground: "#0b0b0c",
  card: "#ffffff",
  "card-foreground": "#0b0b0c",
  muted: "#f2f1f3",
  "muted-foreground": "#646364",
  primary: "#181718",
  "primary-foreground": "#fafafb",
  border: "#cecdcf",
} as const;

const darkColors = {
  background: "#0b0b0c",
  foreground: "#ffffff",
  card: "#100f10",
  "card-foreground": "#ffffff",
  muted: "#161617",
  "muted-foreground": "#818081",
  primary: "#e5e4e6",
  "primary-foreground": "#181718",
  border: "#484749",
} as const;

function createEmailColors(mode: Theme) {
  const baseColors = mode === "dark" ? darkColors : lightColors;
  const darkVariantColors = mode === "light" ? lightColors : darkColors;

  return {
    background: {
      DEFAULT: baseColors.background,
      dark: darkVariantColors.background,
    },
    foreground: {
      DEFAULT: baseColors.foreground,
      dark: darkVariantColors.foreground,
    },
    card: {
      DEFAULT: baseColors.card,
      dark: darkVariantColors.card,
    },
    "card-foreground": {
      DEFAULT: baseColors["card-foreground"],
      dark: darkVariantColors["card-foreground"],
    },
    muted: {
      DEFAULT: baseColors.muted,
      dark: darkVariantColors.muted,
    },
    "muted-foreground": {
      DEFAULT: baseColors["muted-foreground"],
      dark: darkVariantColors["muted-foreground"],
    },
    primary: {
      DEFAULT: baseColors.primary,
      dark: darkVariantColors.primary,
    },
    "primary-foreground": {
      DEFAULT: baseColors["primary-foreground"],
      dark: darkVariantColors["primary-foreground"],
    },
    border: {
      DEFAULT: baseColors.border,
      dark: darkVariantColors.border,
    },
  };
}

export function createEmailTailwindConfig(mode: Theme = "system") {
  return {
    theme: {
      extend: {
        colors: createEmailColors(mode),
        fontFamily: {
          display: ["Manrope", "Inter", "Arial", "sans-serif"],
          sans: ["Inter", "Arial", "sans-serif"],
          mono: ["Geist Mono", "SFMono-Regular", "Consolas", "monospace"],
        },
      },
    },
  };
}

export default function Tailwind({
  children,
  mode = "system",
}: {
  children: React.ReactNode;
  mode?: Theme;
}) {
  return (
    <ReactEmailTailwind config={createEmailTailwindConfig(mode)}>{children}</ReactEmailTailwind>
  );
}
