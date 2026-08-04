import { EMBED_TELEMETRY_SAMPLE_RATE } from "@formbro/core/embed";
import { fail, ok } from "@formbro/shared/result";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getFormAccess } from "./access";
import {
  applyEmbedTelemetrySample,
  emptyEmbedTelemetryCounters,
  type EmbedTelemetryCounters,
} from "./embedTelemetryAggregate";

const durationValidator = v.union(
  v.literal("under_10_seconds"),
  v.literal("10_to_29_seconds"),
  v.literal("30_to_119_seconds"),
  v.literal("120_plus_seconds"),
);

function utcDay(timestamp = Date.now()) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export const record = internalMutation({
  args: {
    publicId: v.string(),
    revision: v.string(),
    started: v.boolean(),
    submitted: v.boolean(),
    hadError: v.boolean(),
    duration: durationValidator,
  },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_slug", (builder) => builder.eq("slug", args.publicId))
      .unique();
    const revisionId = ctx.db.normalizeId("formSchemas", args.revision);
    const revision = revisionId ? await ctx.db.get(revisionId) : null;

    if (!form || !revisionId || !revision || revision.formId !== form._id) {
      return false;
    }

    const day = utcDay();
    const current = await ctx.db
      .query("embedTelemetryDaily")
      .withIndex("by_form_revision_day", (builder) =>
        builder.eq("formId", form._id).eq("revisionId", revisionId).eq("day", day),
      )
      .unique();
    const counters = applyEmbedTelemetrySample(current ?? emptyEmbedTelemetryCounters(), args);

    if (current) {
      await ctx.db.patch(current._id, counters);
    } else {
      await ctx.db.insert("embedTelemetryDaily", {
        ...counters,
        day,
        formId: form._id,
        revisionId,
      });
    }

    return true;
  },
});

export const summary = query({
  args: {
    formId: v.id("forms"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const access = await getFormAccess(ctx, args.formId);
    if (!access.ok) return fail({ data: null, error: access.error });

    const days = Math.min(90, Math.max(1, Math.floor(args.days ?? 30)));
    const from = utcDay(Date.now() - (days - 1) * 86_400_000);
    const rows = await ctx.db
      .query("embedTelemetryDaily")
      .withIndex("by_form_and_day", (builder) => builder.eq("formId", args.formId).gte("day", from))
      .collect();
    const counters = rows.reduce<EmbedTelemetryCounters>(
      (total, row) => ({
        duration10To29Seconds: total.duration10To29Seconds + row.duration10To29Seconds,
        duration120PlusSeconds: total.duration120PlusSeconds + row.duration120PlusSeconds,
        duration30To119Seconds: total.duration30To119Seconds + row.duration30To119Seconds,
        durationUnder10Seconds: total.durationUnder10Seconds + row.durationUnder10Seconds,
        errors: total.errors + row.errors,
        sampledViews: total.sampledViews + row.sampledViews,
        started: total.started + row.started,
        submitted: total.submitted + row.submitted,
      }),
      emptyEmbedTelemetryCounters(),
    );

    return ok({
      ...counters,
      completionRate: counters.started > 0 ? counters.submitted / counters.started : null,
      days,
      errorRate: counters.sampledViews > 0 ? counters.errors / counters.sampledViews : null,
      sampleRate: EMBED_TELEMETRY_SAMPLE_RATE,
      startRate: counters.sampledViews > 0 ? counters.started / counters.sampledViews : null,
    });
  },
});
