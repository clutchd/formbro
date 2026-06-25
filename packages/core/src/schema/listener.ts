import { z } from "zod";
import { IdSchema } from "./id.js";

export const ListenerSchema = z.discriminatedUnion("type", [
  z.object({
    source: IdSchema,
    target: IdSchema,
    type: z.literal("slugify"),
  }),
  z.object({
    source: IdSchema,
    target: IdSchema,
    type: z.literal("uppercase"),
  }),
]);

export type FormListener = z.infer<typeof ListenerSchema>;
