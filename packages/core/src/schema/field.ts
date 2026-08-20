import { z } from "zod";
import { FieldRegistry } from "../registry";
import { BaseElementSchema } from "./element";
import { LabelSchema } from "./label";
import { RuleSchema, SupportedRuleSchema } from "./rule";

const OrientationSchema = z
  .enum(["vertical", "horizontal", "responsive"])
  .default("vertical")
  .optional();
const DEFAULT_MULTI_SELECT_OPTIONS = ["Option 1", "Option 2", "Option 3"];
const MultiSelectDefaultSchema = z.array(z.string());

export const BaseFieldSchema = BaseElementSchema.extend({
  label: LabelSchema,
  description: z.string().optional(),
  placeholder: z.string().optional(),
  default: z.unknown().optional(),
  options: z.array(z.string()).optional(),
  rules: z.array(RuleSchema).optional(),
  orientation: OrientationSchema,
});

export const FieldSchema = z
  .union(
    FieldRegistry.map((f) =>
      BaseFieldSchema.extend({
        type: z.literal(f.key),
        category: z.literal(f.category).default(f.category),
        rules: SupportedRuleSchema(f.rules),
      }),
    ),
  )
  .superRefine((field, ctx) => {
    if (field.type !== "multi_select" || field.default === undefined) return;

    const parsedDefault = MultiSelectDefaultSchema.safeParse(field.default);
    if (!parsedDefault.success) {
      ctx.addIssue({
        code: "custom",
        message: "Multi select default must be an array of strings",
        path: ["default"],
      });
      return;
    }

    const validOptions = [
      ...new Set(
        (field.options?.length ? field.options : DEFAULT_MULTI_SELECT_OPTIONS).filter(
          (option) => option.trim().length > 0,
        ),
      ),
    ];
    const configuredOptions = validOptions.length > 0 ? validOptions : DEFAULT_MULTI_SELECT_OPTIONS;
    const invalidDefault = parsedDefault.data.find((value) => !configuredOptions.includes(value));

    if (invalidDefault !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: `Multi select default is not a configured option: ${invalidDefault}`,
        path: ["default"],
      });
    }

    if (new Set(parsedDefault.data).size !== parsedDefault.data.length) {
      ctx.addIssue({
        code: "custom",
        message: "Multi select default must not contain duplicate options",
        path: ["default"],
      });
    }
  });
