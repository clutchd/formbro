import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const storybook = path.resolve(here, "..");
const core = path.resolve(here, "../stories");
const ui = path.resolve(here, "../../ui");
const web = path.resolve(here, "../../web");

const config: StorybookConfig = {
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  stories: ["../stories/**/*.stories.@(ts|tsx)", "../../ui/src/**/*.stories.@(ts|tsx)"],
  async viteFinal(config) {
    const { mergeConfig, searchForWorkspaceRoot } = await import("vite");

    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "next/image": path.resolve(here, "next-image.tsx"),
        },
      },
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd()), storybook, core, ui, web],
        },
      },
    });
  },
};

export default config;
