import { z } from "zod";
import { syncEventSchema } from "./event.js";

const RULE_SCHEMAS = {
  required: z.object({
    type: z.literal("required"),
    value: z.boolean(),
    message: z.string().optional(),
    event: syncEventSchema,
  }),
  min: z.object({
    type: z.literal("min"),
    value: z.number(),
    message: z.string().optional(),
    event: syncEventSchema,
  }),
  max: z.object({
    type: z.literal("max"),
    value: z.number(),
    message: z.string().optional(),
    event: syncEventSchema,
  }),
  regex: z.object({
    type: z.literal("regex"),
    value: z.string(),
    message: z.string().optional(),
    event: syncEventSchema,
  }),
};

export const RuleSchema = z.discriminatedUnion("type", [
  RULE_SCHEMAS.required,
  RULE_SCHEMAS.min,
  RULE_SCHEMAS.max,
  RULE_SCHEMAS.regex,
]);
export const RuleTypeSchema = z.enum(
  Object.keys(RULE_SCHEMAS) as [FormRuleType, ...FormRuleType[]],
);

export type FormRule = z.infer<typeof RuleSchema>;
export type FormRuleType = FormRule["type"];

export function SupportedRuleSchema<const T extends readonly [FormRuleType, ...FormRuleType[]]>(
  types: T,
) {
  return z.array(z.union(types.map((t) => RULE_SCHEMAS[t]))).optional();
}
