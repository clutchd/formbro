import type { FormInput } from "@formbro/core/schema/form";
import { FORMBRO_SCHEMA_VERSION } from "@formbro/core/schema/version";
import { initForm } from "./_init";

export const CREATE_FORM = initForm("create-form", {
  id: "create_form",
  version: FORMBRO_SCHEMA_VERSION,
  name: "Create Form",
  elements: [
    {
      id: "name",
      name: "Name",
      type: "short_text",
      description: "The name of this form.",
      rules: [
        {
          type: "required",
          value: true,
        },
        {
          type: "max",
          value: 64,
          message: "Name must be less than 64 characters",
        },
      ],
    },
  ],
  toasts: {
    success: "Form created successfully!",
    error: "Failed to create form.",
    loading: "Creating form",
  },
} as const satisfies FormInput);
