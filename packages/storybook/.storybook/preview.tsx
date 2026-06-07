import type { Preview } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { fonts } from "../../ui/src/typography";
import "../../web/app/globals.css";

function resolveTheme(value: unknown) {
  return value === "dark" ? "dark" : "light";
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
      const theme = (override ?? context.globals.theme) === "dark" ? "dark" : "light";

      useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme, ...fonts);

        return () => {
          root.classList.remove("light", "dark", ...fonts);
        };
      }, [theme]);

      return (
        <div className="min-h-screen w-full bg-background p-6 text-foreground">
          <div className="flex min-h-[calc(100vh-3rem)] items-start justify-center">
            <Story />
          </div>
        </div>
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
