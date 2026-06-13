import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { BILLING_STATUSES, PLANS } from "./lib";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerAuthId: v.string(),
    plan: v.optional(v.union(...PLANS.map((plan) => v.literal(plan)), v.literal("unlimited"))),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    billingStatus: v.optional(v.union(...BILLING_STATUSES.map((status) => v.literal(status)))),
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
    slug: v.string(),
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

  //   submissions: defineTable({
  //     formId: v.id("forms"),
  //     schemaId: v.id("schemas"),
  //     data: v.string(), // TODO: better data storage
  //     submittedAt: v.number(),
  //   })
  //     .index("by_form_id", ["formId"])
  //     .index("by_form_submitted", ["formId", "submittedAt"]),

  //   plans: defineTable({
  //     key: v.string(),
  //     version: v.number(),
  //     name: v.string(),
  //     trialDays: v.optional(v.number()),
  //     productId: v.optional(v.string()),
  //     monthlyPriceId: v.optional(v.string()),
  //     annualPriceId: v.optional(v.string()),
  //   })
  //     .index("by_key", ["key"])
  //     .index("by_key_version", ["key", "version"])
  //     .index("by_monthly_price_id", ["monthlyPriceId"])
  //     .index("by_annual_price_id", ["annualPriceId"]),

  //   subscriptions: defineTable({
  //     planId: v.id("plans"),
  //     referenceId: v.string(),
  //     stripeCustomerId: v.string(),
  //     stripeSubscriptionId: v.string(),
  //     status: v.string(),
  //     periodStart: v.optional(v.number()),
  //     periodEnd: v.optional(v.number()),
  //     cancelAtPeriodEnd: v.optional(v.boolean()),
  //     trialStart: v.optional(v.number()),
  //     trialEnd: v.optional(v.number()),
  //   })
  //     .index("by_reference_id", ["referenceId"])
  //     .index("by_stripe_subscription_id", ["stripeSubscriptionId"]),

  //   templates: defineTable({
  //     sourceId: v.id("template_sources"),
  //     schemaVersion: v.optional(v.string()),
  //     schema: v.optional(v.string()),
  //     slug: v.optional(v.string()),
  //     status: v.union(
  //       v.literal("pending"),
  //       v.literal("in_progress"),
  //       v.literal("complete"),
  //       v.literal("failed"),
  //     ),
  //     publicationStatus: v.union(v.literal("draft"), v.literal("published")),
  //     attempts: v.number(),
  //   })
  //     .index("by_schema_version", ["schemaVersion"])
  //     .index("by_status", ["status"])
  //     .index("by_slug", ["slug"])
  //     .index("by_publication_status", ["publicationStatus"]),

  //   template_providers: defineTable({
  //     name: v.string(),
  //     baseUrl: v.string(),
  //     discoverUrl: v.string(),
  //     formUrl: v.string(),
  //   }).index("by_name", ["name"]),

  //   template_sources: defineTable({
  //     provider: v.string(),
  //     slug: v.string(),
  //     formId: v.optional(v.string()),
  //     rawHtml: v.optional(v.string()),
  //     markdown: v.optional(v.string()),
  //     status: v.union(
  //       v.literal("pending"),
  //       v.literal("in_progress"),
  //       v.literal("complete"),
  //       v.literal("failed"),
  //     ),
  //     attempts: v.number(),
  //   })
  //     .index("by_status", ["status"])
  //     .index("by_provider_slug", ["provider", "slug"]),

  //   usage: defineTable({
  //     organizationId: v.string(),
  //     feature: v.string(),
  //     used: v.number(),
  //     periodStart: v.optional(v.number()),
  //     periodEnd: v.optional(v.number()),
  //   }).index("by_org_feature", ["organizationId", "feature"]),
});
