import { z } from "zod";
import type { CompiledField } from "../compile";
import type { Result } from "../result";
// import type { TanStackForm } from "@/forms/hooks/tanstack";
import type { ExtractFormData } from "./extract";
import { ElementSchema } from "./element";
import { FieldSchema } from "./field";
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

export const FormSchema = z.object({
  version: VersionSchema,
  name: z.string().min(1),
  elements: z.array(z.union([ElementSchema, FieldSchema])),
  listeners: z.array(ListenerSchema).optional(),
  submit: FormSubmitSchema,
  toasts: FormToastsSchema,
  variables: z.record(z.string(), z.string()).optional(),
});

export type FormInput = z.input<typeof FormSchema>;
export type FormValues<T extends FormInput = FormInput> = ExtractFormData<T> &
  Record<string, string>;

export type FormAction<T extends FormInput = FormInput, TData = void> = ({
  values,
  //tanstack,
}: {
  values: FormValues<T>;
  //tanstack?: TanStackForm;
}) => Result<TData> | Promise<Result<TData>>;

export type FormOnMutate<T extends FormInput = FormInput> = ({
  values,
  //tanstack,
}: {
  values: FormValues<T>;
  //tanstack?: TanStackForm;
}) => FormValues<T>;

export type FormOnSuccess<T extends FormInput = FormInput, TData = void> = ({
  result,
  data,
  //tanstack,
}: {
  result: FormValues<T>;
  data: TData;
  //tanstack?: TanStackForm;
}) => void;

export type FormOnError<T extends FormInput = FormInput> = ({
  error,
  //tanstack,
}: {
  error: unknown;
  //tanstack?: TanStackForm;
}) => void;

export interface IFieldProps {
  schema: CompiledField;
  ariaInvalid?: boolean;
}
