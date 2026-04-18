import type { FormInput } from "@formbro/core/schema/form";
import { FORMBRO_SCHEMA_VERSION } from "@formbro/core/schema/version";
import { initForm } from "./_init";

export const CREATE_WORKSPACE = initForm("create-workspace", {
  version: FORMBRO_SCHEMA_VERSION,
  name: "Create Workspace",
  elements: [
    {
      name: "Name",
      type: "short_text",
      description: "The name of this workspace.",
      rules: [
        {
          type: "required",
          value: true,
        },
        {
          type: "max",
          value: 32,
        },
      ],
    },
  ],
  toasts: {
    success: "Workspace created successfully!",
    error: "Failed to create workspace.",
    loading: "Creating workspace",
  },
} as const satisfies FormInput);
