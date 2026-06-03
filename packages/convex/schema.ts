import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerAuthId: v.string(),
    plan: v.optional(
      v.union(v.literal("hobby"), v.literal("standard"), v.literal("pro"), v.literal("unlimited")),
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    billingStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("not_subscribed"),
      ),
    ),
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

  forms: defineTable({
    name: v.string(),
    workspaceId: v.id("workspaces"),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("closed"),
      v.literal("archived"),
    ),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),
});
