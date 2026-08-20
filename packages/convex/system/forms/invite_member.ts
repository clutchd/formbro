import type { FormInput } from "@formbro/core/schema/form";
import { FORMBRO_SCHEMA_VERSION } from "@formbro/core/schema/version";
import { initForm } from "./_init";

export const INVITE_MEMBER = initForm("invite-member", {
  id: "invite_member",
  version: FORMBRO_SCHEMA_VERSION,
  name: "Invite Member",
  elements: [
    {
      id: "email",
      name: "Email address",
      type: "email",
      placeholder: "teammate@example.com",
      rules: [{ type: "required", value: true }],
    },
  ],
  submit: { label: "Send invite" },
  toasts: {
    success: "Invite sent",
    error: "Could not send invite",
    loading: "Sending invite",
  },
} as const satisfies FormInput);
