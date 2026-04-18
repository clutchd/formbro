import { z } from "zod";

export const ListenerSchema = z.discriminatedUnion("type", [
  z.object({
    source: z.string().min(1),
    target: z.string().min(1),
    type: z.literal("slugify"),
  }),
  z.object({
    source: z.string().min(1),
    target: z.string().min(1),
    type: z.literal("uppercase"),
  }),
]);

export type FormListener = z.infer<typeof ListenerSchema>;
