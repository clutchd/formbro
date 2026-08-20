import { z } from "zod";
import { RuleTypeSchema } from "./rule";

const RegistryEditorPreviewSchema = z.object({
  control: z.enum([
    "input",
    "textarea",
    "select",
    "multi_select",
    "radio_group",
    "heading",
    "description",
    "divider",
    "page_break",
  ]),
  inputType: z.enum(["date", "email", "number", "tel", "text", "url"]).optional(),
  placeholder: z.string().optional(),
  align: z.enum(["center", "start"]).optional(),
  spacing: z.enum(["compact", "normal"]).optional(),
});

const RegistryEditorPropertySchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  control: z.enum(["options", "rule", "select", "text", "textarea"]),
  defaultValue: z.unknown().optional(),
  inputType: z.enum(["number", "text"]).optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .optional(),
  placeholder: z.string().optional(),
  section: z.enum(["behavior", "content", "validation"]).optional(),
  span: z.enum(["full"]).optional(),
});

const RegistrySchema = z.object({
  key: z.string().min(1),
  display: z.string().min(1),
  description: z.string().min(1),
  editor: z
    .object({
      defaults: z.record(z.string(), z.unknown()).optional(),
      preview: RegistryEditorPreviewSchema.optional(),
      properties: z.array(RegistryEditorPropertySchema).optional(),
    })
    .optional(),
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
export type FormRegistryEditor = z.infer<typeof RegistrySchema>["editor"];
export type FormRegistryEditorPreview = z.infer<typeof RegistryEditorPreviewSchema>;
export type FormRegistryEditorProperty = z.infer<typeof RegistryEditorPropertySchema>;
