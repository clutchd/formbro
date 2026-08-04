import { z } from "zod";
import { FormSchema } from "./schema/form";

export const FORMBRO_EMBED_PROTOCOL_VERSION = 1;

export const EmbedSettingsSchema = z.object({
  appearance: z.object({
    colorScheme: z.enum(["auto", "light", "dark"]),
    density: z.enum(["comfortable", "compact"]),
  }),
  allowedOrigins: z.array(z.string()).max(25),
});

export type EmbedSettings = z.output<typeof EmbedSettingsSchema>;

export const DEFAULT_EMBED_SETTINGS: EmbedSettings = {
  appearance: {
    colorScheme: "auto",
    density: "comfortable",
  },
  allowedOrigins: [],
};

export function normalizeEmbedAllowedOrigins(values: string[]) {
  const origins = new Set<string>();

  for (const value of values) {
    const candidate = value.trim();
    const url = new URL(candidate);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      candidate.length > 2_048
    ) {
      throw new Error(`Invalid embed origin: ${value}`);
    }

    origins.add(url.origin);
  }

  if (origins.size > 25) {
    throw new Error("Embed policies support at most 25 origins");
  }

  return [...origins];
}

export const PublishedFormSnapshotSchema = z.object({
  embed: EmbedSettingsSchema.default(DEFAULT_EMBED_SETTINGS),
  protocolVersion: z.literal(FORMBRO_EMBED_PROTOCOL_VERSION),
  publicId: z.string().trim().min(1),
  publishedTime: z.number().int().nonnegative(),
  revision: z.string().trim().min(1),
  schema: FormSchema,
});

export type PublishedFormSnapshot = z.output<typeof PublishedFormSnapshotSchema>;

export const PublishedFormSubmissionSchema = z.object({
  revision: z.string().trim().min(1),
  idempotencyKey: z.string().trim().min(1).max(128),
  values: z.record(z.string(), z.string()),
});

export type PublishedFormSubmission = z.output<typeof PublishedFormSubmissionSchema>;

export const EMBED_TELEMETRY_SAMPLE_RATE = 0.01;

export const EmbedTelemetryPayloadSchema = z
  .object({
    protocolVersion: z.literal(FORMBRO_EMBED_PROTOCOL_VERSION),
    publicId: z.string().trim().min(1),
    revision: z.string().trim().min(1),
    started: z.boolean(),
    submitted: z.boolean(),
    hadError: z.boolean(),
    duration: z.enum([
      "under_10_seconds",
      "10_to_29_seconds",
      "30_to_119_seconds",
      "120_plus_seconds",
    ]),
  })
  .strict()
  .refine((payload) => !payload.submitted || payload.started, {
    message: "Submitted sessions must also be started",
  });

export type EmbedTelemetryPayload = z.output<typeof EmbedTelemetryPayloadSchema>;

const embedLifecycleMessageBase = {
  source: z.literal("formbro:embed"),
  protocolVersion: z.literal(FORMBRO_EMBED_PROTOCOL_VERSION),
  publicId: z.string().trim().min(1),
};

export const EmbedLifecycleMessageSchema = z.discriminatedUnion("event", [
  z.object({
    ...embedLifecycleMessageBase,
    event: z.literal("ready"),
    height: z.number().finite().nonnegative(),
  }),
  z.object({
    ...embedLifecycleMessageBase,
    event: z.literal("resize"),
    height: z.number().finite().nonnegative(),
  }),
  z.object({
    ...embedLifecycleMessageBase,
    event: z.literal("started"),
  }),
  z.object({
    ...embedLifecycleMessageBase,
    event: z.literal("progress"),
    percent: z.number().int().min(0).max(100),
  }),
  z.object({
    ...embedLifecycleMessageBase,
    event: z.literal("submitted"),
  }),
  z.object({
    ...embedLifecycleMessageBase,
    event: z.literal("error"),
    code: z.string().trim().min(1).max(64),
  }),
]);

export type EmbedLifecycleMessage = z.output<typeof EmbedLifecycleMessageSchema>;

export function createPublishedFormSnapshot(
  snapshot: Omit<z.input<typeof PublishedFormSnapshotSchema>, "protocolVersion">,
) {
  return PublishedFormSnapshotSchema.parse({
    ...snapshot,
    protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
  });
}
