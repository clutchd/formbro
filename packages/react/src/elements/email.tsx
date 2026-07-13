import { createTextField } from "./text-field.js";

export const component = createTextField({
  autoComplete: "email",
  kind: "input",
  type: "email",
});
