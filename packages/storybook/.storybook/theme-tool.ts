import { createElement } from "react";
import { ToggleButton } from "storybook/internal/components";
import { useGlobals } from "storybook/manager-api";

export function ThemeTool() {
  const [globals, updateGlobals] = useGlobals();
  const mode = globals.theme === "dark" ? "dark" : "light";

  return createElement(
    ToggleButton,
    {
      title: "Toggle theme",
      pressed: mode === "dark",
      onClick: () => updateGlobals({ theme: mode === "dark" ? "light" : "dark" }),
    },
    mode === "dark" ? "Dark" : "Light",
  );
}
