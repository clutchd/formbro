import { z } from "zod";
import { FormSchema } from "./schema/form";

export const FORMBRO_EMBED_PROTOCOL_VERSION = 1;

export const PublishedFormSnapshotSchema = z.object({
  protocolVersion: z.literal(FORMBRO_EMBED_PROTOCOL_VERSION),
  publicId: z.string().trim().min(1),
  publishedTime: z.number().int().nonnegative(),
  revision: z.string().trim().min(1),
  schema: FormSchema,
});

export type PublishedFormSnapshot = z.output<typeof PublishedFormSnapshotSchema>;

export function createPublishedFormSnapshot(
  snapshot: Omit<z.input<typeof PublishedFormSnapshotSchema>, "protocolVersion">,
) {
  return PublishedFormSnapshotSchema.parse({
    ...snapshot,
    protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
  });
}
