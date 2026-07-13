import { createTextField } from "./text-field.js";

export const component = createTextField({
  autoComplete: "off",
  kind: "input",
  type: "text",
});
