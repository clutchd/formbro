import { z } from "zod";
import { RuleTypeSchema } from "./rule";

const RegistrySchema = z.object({
  key: z.string().min(1),
  display: z.string().min(1),
  description: z.string().min(1),
  schema: z.any(),
  supported: z.boolean().default(true).optional(),
});

const ElementRegistrySchema = RegistrySchema.extend({
  schema: z.custom<z.ZodObject<z.ZodRawShape>>((value) => value instanceof z.ZodObject),
});

const FieldRegistrySchema = RegistrySchema.extend({
  default: z.unknown().default("").optional(),
  rules: z.union([z.array(RuleTypeSchema), RuleTypeSchema]),
});

export type FormRegistryElement = z.infer<typeof ElementRegistrySchema>;
export type FormRegistryField = z.infer<typeof FieldRegistrySchema>;
