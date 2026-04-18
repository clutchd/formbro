import { z } from "zod";
import { FieldRegistry } from "../registry";
import { BaseElementSchema } from "./element";
import { LabelSchema } from "./label";
import { RuleSchema, SupportedRuleSchema } from "./rule";

const OrientationSchema = z
  .enum(["vertical", "horizontal", "responsive"])
  .default("vertical")
  .optional();

export const BaseFieldSchema = BaseElementSchema.extend({
  label: LabelSchema,
  description: z.string().optional(),
  placeholder: z.string().optional(),
  default: z.unknown().optional(),
  options: z.array(z.string()).optional(),
  rules: z.array(RuleSchema).optional(),
  orientation: OrientationSchema,
});

export const FieldSchema = z.union([
  ...FieldRegistry.map((f) =>
    BaseFieldSchema.extend({
      type: z.literal(f.key),
      category: z.literal(f.category).default(f.category),
      rules: SupportedRuleSchema(f.rules),
    }),
  ),
]);
