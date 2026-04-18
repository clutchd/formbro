import { z } from "zod";

export const LabelSchema = z.union([z.string(), z.boolean()]).optional();

export type FormLabel = z.infer<typeof LabelSchema>;
