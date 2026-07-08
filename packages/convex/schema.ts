import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { PLANS } from "./billingUtils";

export const SubmissionValue = v.union(v.string());

const agentWorkspaceBindingStatus = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("revoked"),
);
const x402PaymentScheme = v.union(
  v.literal("exact"),
  v.literal("upto"),
  v.literal("batch-settlement"),
);
const x402PaymentStatus = v.union(
  v.literal("required"),
  v.literal("verified"),
  v.literal("settled"),
  v.literal("failed"),
);
const agentUsageEventType = v.union(
  v.literal("form.created"),
  v.literal("form.updated"),
  v.literal("submission.created"),
  v.literal("submission.read"),
  v.literal("ai.edit"),
  v.literal("api.request"),
);

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerAuthId: v.string(),
    plan: v.optional(v.union(...PLANS.map((plan) => v.literal(plan)), v.literal("unlimited"))),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    billingStatus: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerAuthId"])
    .index("by_stripe_customer_id", ["stripeCustomerId"])
    .index("by_stripe_subscription_id", ["stripeSubscriptionId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userAuthId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    userAvatarUrl: v.optional(v.string()),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userAuthId"])
    .index("by_workspace_and_user", ["workspaceId", "userAuthId"])
    .index("by_workspace_and_email", ["workspaceId", "userEmail"]),

  agentWorkspaceBindings: defineTable({
    workspaceId: v.id("workspaces"),
    betterAuthAgentId: v.string(),
    betterAuthHostId: v.optional(v.string()),
    status: agentWorkspaceBindingStatus,
    createdBy: v.id("workspaceMembers"),
    createdTime: v.number(),
    revokedTime: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_better_auth_agent", ["betterAuthAgentId"])
    .index("by_better_auth_host", ["betterAuthHostId"])
    .index("by_workspace_and_agent", ["workspaceId", "betterAuthAgentId"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),

  x402PaymentConfigs: defineTable({
    workspaceId: v.id("workspaces"),
    scheme: x402PaymentScheme,
    network: v.string(),
    asset: v.string(),
    payTo: v.string(),
    amount: v.string(),
    assetName: v.optional(v.string()),
    assetVersion: v.optional(v.string()),
    facilitatorUrl: v.optional(v.string()),
    maxTimeoutSeconds: v.number(),
    createdBy: v.id("workspaceMembers"),
    createdTime: v.number(),
    disabledTime: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_network", ["workspaceId", "network"]),

  x402PaymentEvents: defineTable({
    workspaceId: v.id("workspaces"),
    betterAuthAgentId: v.optional(v.string()),
    betterAuthHostId: v.optional(v.string()),
    requestId: v.string(),
    status: x402PaymentStatus,
    resourceUrl: v.string(),
    scheme: x402PaymentScheme,
    network: v.string(),
    asset: v.string(),
    amount: v.string(),
    payer: v.optional(v.string()),
    transaction: v.optional(v.string()),
    errorReason: v.optional(v.string()),
    occurredTime: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_better_auth_agent", ["betterAuthAgentId"])
    .index("by_better_auth_host", ["betterAuthHostId"])
    .index("by_request", ["requestId"])
    .index("by_workspace_occurred", ["workspaceId", "occurredTime"]),

  agentUsageEvents: defineTable({
    workspaceId: v.id("workspaces"),
    betterAuthAgentId: v.optional(v.string()),
    betterAuthHostId: v.optional(v.string()),
    x402PaymentEventId: v.optional(v.id("x402PaymentEvents")),
    requestId: v.string(),
    eventType: agentUsageEventType,
    route: v.string(),
    units: v.number(),
    occurredTime: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_better_auth_agent", ["betterAuthAgentId"])
    .index("by_better_auth_host", ["betterAuthHostId"])
    .index("by_request", ["requestId"])
    .index("by_workspace_occurred", ["workspaceId", "occurredTime"]),

  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    token: v.string(),
    invitedBy: v.id("workspaceMembers"),
    createdTime: v.number(),
    expiresTime: v.number(),
    acceptedTime: v.optional(v.number()),
    revokedTime: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_email", ["workspaceId", "email"]),

  forms: defineTable({
    name: v.string(),
    slug: v.string(),
    workspaceId: v.id("workspaces"),
    draftSchemaId: v.optional(v.id("formSchemas")),
    publishedSchemaId: v.optional(v.id("formSchemas")),
    status: v.union(v.literal("draft"), v.literal("open"), v.literal("closed")),
  })
    .index("by_slug", ["slug"])
    .index("by_workspace_and_slug", ["workspaceId", "slug"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),

  formSchemas: defineTable({
    formId: v.id("forms"),
    schema: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    createdBy: v.optional(v.id("workspaceMembers")),
    publishedTime: v.optional(v.number()),
  })
    .index("by_form_id", ["formId"])
    .index("by_schema_status", ["formId", "status"]),

  submissions: defineTable({
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
    schemaId: v.id("formSchemas"),
    data: v.record(v.string(), SubmissionValue),
    bytes: v.number(),
    submittedTime: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_submitted", ["workspaceId", "submittedTime"])
    .index("by_form_id", ["formId"])
    .index("by_form_submitted", ["formId", "submittedTime"]),
});
