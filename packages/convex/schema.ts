import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { PLANS } from "./billingUtils";

export const SubmissionValue = v.union(v.string());

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
    embedSettings: v.optional(
      v.object({
        appearance: v.object({
          colorScheme: v.union(v.literal("auto"), v.literal("light"), v.literal("dark")),
          density: v.union(v.literal("comfortable"), v.literal("compact")),
        }),
        allowedOrigins: v.array(v.string()),
      }),
    ),
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
    retiredTime: v.optional(v.number()),
  })
    .index("by_form_id", ["formId"])
    .index("by_schema_status", ["formId", "status"]),

  submissions: defineTable({
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
    schemaId: v.id("formSchemas"),
    idempotencyKey: v.optional(v.string()),
    data: v.record(v.string(), SubmissionValue),
    bytes: v.number(),
    submittedTime: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_submitted", ["workspaceId", "submittedTime"])
    .index("by_form_id", ["formId"])
    .index("by_form_idempotency_key", ["formId", "idempotencyKey"])
    .index("by_form_submitted", ["formId", "submittedTime"]),
});
