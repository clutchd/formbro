import type { AgentAuthOptions, Capability } from "@better-auth/agent-auth";
import { APP_DESCRIPTION, APP_NAME } from "@formbro/shared/brand";

export const FORMBRO_AGENT_CAPABILITIES = [
  {
    name: "workspace.create",
    description: "Create a FormBro workspace for an agent-owned workflow.",
    approvalStrength: "session",
    input: {
      type: "object",
      properties: {
        name: { type: "string" },
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
      properties: {
        workspaceId: { type: "string" },
        name: { type: "string" },
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
      properties: {
        workspaceId: { type: "string" },
        formId: { type: "string" },
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
      properties: {
        workspaceId: { type: "string" },
        formId: { type: "string" },
      },
      required: ["workspaceId", "formId"],
    },
  },
  {
    name: "submission.create",
    description: "Submit a response to an open form.",
    approvalStrength: "none",
    input: {
      type: "object",
      properties: {
        formId: { type: "string" },
        schemaId: { type: "string" },
        data: { type: "object" },
      },
      required: ["formId", "schemaId", "data"],
    },
  },
  {
    name: "submission.read",
    description: "Read submissions from an approved workspace form.",
    approvalStrength: "session",
    requiredConstraints: ["workspaceId"],
    input: {
      type: "object",
      properties: {
        workspaceId: { type: "string" },
        formId: { type: "string" },
      },
      required: ["workspaceId", "formId"],
    },
  },
  {
    name: "x402.payment.configure",
    description: "Configure x402 payment requirements for an approved workspace.",
    approvalStrength: "session",
    requiredConstraints: ["workspaceId"],
    input: {
      type: "object",
      properties: {
        workspaceId: { type: "string" },
        scheme: { enum: ["exact", "upto", "batch-settlement"] },
        network: { type: "string" },
        asset: { type: "string" },
        payTo: { type: "string" },
        amount: { type: "string" },
      },
      required: ["workspaceId", "scheme", "network", "asset", "payTo", "amount"],
    },
  },
  {
    name: "x402.payment.record",
    description: "Record an x402 settlement for a paid agent request.",
    approvalStrength: "none",
    input: {
      type: "object",
      properties: {
        requestId: { type: "string" },
        resourceUrl: { type: "string" },
        network: { type: "string" },
        asset: { type: "string" },
        amount: { type: "string" },
        transaction: { type: "string" },
        payer: { type: "string" },
      },
      required: ["requestId", "resourceUrl", "network", "asset", "amount"],
    },
  },
] satisfies Capability[];

export const formbroAgentAuthOptions = {
  providerName: APP_NAME,
  providerDescription: APP_DESCRIPTION,
  modes: ["delegated", "autonomous"],
  deviceAuthorizationPage: "/device/capabilities",
  requireAuthForCapabilities: true,
  capabilities: FORMBRO_AGENT_CAPABILITIES,
} satisfies AgentAuthOptions;
