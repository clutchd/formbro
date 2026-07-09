import type { AgentAuthOptions, Capability } from "@better-auth/agent-auth";
import { APP_DESCRIPTION, APP_NAME } from "@formbro/shared/brand";

export const FORMBRO_AGENT_CAPABILITIES = [
  {
    name: "workspace.create",
    description: "Create a FormBro workspace owned by the approving user.",
    approvalStrength: "session",
    input: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
      },
      required: ["name"],
    },
  },
  {
    name: "form.create",
    description: "Create a form draft inside an approved workspace.",
    approvalStrength: "session",
    requiredConstraints: ["workspaceId"],
    input: {
      type: "object",
      additionalProperties: false,
      properties: {
        workspaceId: { type: "string", minLength: 1 },
        name: { type: "string", minLength: 1, maxLength: 100 },
      },
      required: ["workspaceId", "name"],
    },
  },
  {
    name: "form.update_schema",
    description: "Update a form draft schema using FormBro's schema contract.",
    approvalStrength: "session",
    requiredConstraints: ["workspaceId"],
    input: {
      type: "object",
      additionalProperties: false,
      properties: {
        workspaceId: { type: "string", minLength: 1 },
        formId: { type: "string", minLength: 1 },
        schema: { type: "object" },
      },
      required: ["workspaceId", "formId", "schema"],
    },
  },
  {
    name: "form.publish",
    description: "Publish a draft form so it can accept responses.",
    approvalStrength: "session",
    requiredConstraints: ["workspaceId"],
    input: {
      type: "object",
      additionalProperties: false,
      properties: {
        workspaceId: { type: "string", minLength: 1 },
        formId: { type: "string", minLength: 1 },
      },
      required: ["workspaceId", "formId"],
    },
  },
] satisfies Capability[];

export const formbroAgentAuthOptions = {
  providerName: APP_NAME,
  providerDescription: APP_DESCRIPTION,
  modes: ["delegated"],
  approvalMethods: ["device_authorization"],
  allowDynamicHostRegistration: false,
  defaultHostCapabilities: [],
  deviceAuthorizationPage: "/device/capabilities",
  requireAuthForCapabilities: true,
  capabilities: FORMBRO_AGENT_CAPABILITIES,
} satisfies AgentAuthOptions;
