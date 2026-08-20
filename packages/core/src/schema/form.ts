import { z } from "zod";
import type { CompiledField } from "../compile";
import type { FieldRegistryKey } from "../registry";
import type { ExtractFormData } from "./extract";
import { ElementSchema } from "./element";
import { FieldSchema } from "./field";
import { IdSchema } from "./id";
import { ListenerSchema } from "./listener";
import { VersionSchema } from "./version";

const FormSubmitSchema = z
  .object({
    label: z.string().optional(),
    size: z.enum(["default", "full-width"]).optional(),
    variant: z.enum(["default", "destructive"]).optional(),
  })
  .optional();

const FormToastsSchema = z
  .union([
    z.boolean(),
    z.object({
      success: z.union([z.string(), z.literal(false)]).optional(),
      error: z.union([z.string(), z.literal(false)]).optional(),
      loading: z.union([z.string(), z.literal(false)]).optional(),
    }),
  ])
  .optional();

export const DEFAULT_FORM_NAME = "Untitled form";

export const FormElementSchema = z.union([ElementSchema, FieldSchema]);

export const FormSchema = z
  .object({
    id: IdSchema,
    version: VersionSchema,
    name: z.string().min(1),
    elements: z.array(FormElementSchema),
    listeners: z.array(ListenerSchema).optional(),
    submit: FormSubmitSchema,
    toasts: FormToastsSchema,
    variables: z.record(z.string(), z.string()).optional(),
  })
  .superRefine((form, ctx) => {
    const seen = new Map<string, number>();

    form.elements.forEach((element, index) => {
      const firstIndex = seen.get(element.id);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: `Element id must be unique: ${element.id}`,
          path: ["elements", index, "id"],
        });
        ctx.addIssue({
          code: "custom",
          message: `Element id must be unique: ${element.id}`,
          path: ["elements", firstIndex, "id"],
        });
        return;
      }

      seen.set(element.id, index);
    });
  });

export type FormInput = z.input<typeof FormSchema>;
export type FormOutput = z.output<typeof FormSchema>;
export type FormElementInput = FormInput["elements"][number];
export type FormFieldInput = Extract<FormElementInput, { type: FieldRegistryKey }>;

export function createDefaultFormSchema({ id, name }: { id: string; name: string }): FormOutput {
  return FormSchema.parse({
    id,
    name,
    elements: [
      {
        id: "title",
        name: "Title",
        type: "heading",
        label: name,
        level: 1,
      },
    ],
  });
}

export function JsonSerialize(schema: FormInput) {
  return JSON.stringify(FormSchema.parse(schema));
}

export function JsonParse(schema: string) {
  return FormSchema.parse(JSON.parse(schema));
}

export type FormValues<T extends FormInput = FormInput> = ExtractFormData<T> &
  Record<string, string>;
export type FormActionResult<TData = undefined, TError = unknown> =
  | { ok: true; data: TData }
  | {
      ok: false;
      data?: unknown;
      error?: TError;
    };

/** Lets a renderer expose its form API without coupling core to that renderer. */
export type FormActionContext<T extends FormInput = FormInput, TFormApi = unknown> = {
  values: FormValues<T>;
  tanstack: TFormApi;
};

export type FormAction<T extends FormInput = FormInput, TData = undefined, TFormApi = unknown> = (
  context: FormActionContext<T, TFormApi>,
) => FormActionResult<TData> | Promise<FormActionResult<TData>>;

export type FormOnMutate<T extends FormInput = FormInput, TFormApi = unknown> = (
  context: FormActionContext<T, TFormApi>,
) => FormValues<T>;

export type FormOnSuccessContext<
  T extends FormInput = FormInput,
  TData = undefined,
  TFormApi = unknown,
> = {
  result: FormValues<T>;
  data: TData;
  tanstack: TFormApi;
};

export type FormOnSuccess<
  T extends FormInput = FormInput,
  TData = undefined,
  TFormApi = unknown,
> = (context: FormOnSuccessContext<T, TData, TFormApi>) => void;

export type FormOnErrorContext<TFormApi = unknown> = {
  error: unknown;
  tanstack: TFormApi;
};

export type FormOnError<_T extends FormInput = FormInput, TFormApi = unknown> = (
  context: FormOnErrorContext<TFormApi>,
) => void;

export type FormFieldAriaAttributes = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "aria-required"?: boolean | "false" | "true";
};

export interface IFieldProps extends FormFieldAriaAttributes {
  schema: CompiledField;
}
