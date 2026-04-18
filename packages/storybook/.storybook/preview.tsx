import type { Preview } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";
import "../../web/app/globals.css";

function resolveTheme(value: unknown) {
  return value === "dark" ? "dark" : "light";
}

function ThemeFrame({ theme, children }: { theme: "light" | "dark"; children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    return () => {
      root.classList.remove("light", "dark");
    };
  }, [theme]);

  return (
    <div
      style={
        {
          "--font-inter": "Inter, system-ui, sans-serif",
          "--font-manrope": "Manrope, system-ui, sans-serif",
          "--font-geist-mono": '"SFMono-Regular", ui-monospace, monospace',
        } as CSSProperties
      }
      className="w-full bg-background p-6 text-foreground"
    >
      <div className="flex items-start justify-center">{children}</div>
    </div>
  );
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const override = context.parameters?.themes?.themeOverride;
      const theme = resolveTheme(override ?? context.globals.theme);

      return (
        <ThemeFrame theme={theme}>
          <Story />
        </ThemeFrame>
      );
    },
  ],
  parameters: {
    actions: {
      argTypesRegex: "^on.*",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    layout: "fullscreen",
  },
};

export default preview;
