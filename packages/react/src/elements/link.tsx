import { createTextField } from "./text-field.js";

export const component = createTextField({
  autoComplete: "url",
  kind: "input",
  placeholder: "https://",
  type: "url",
});
