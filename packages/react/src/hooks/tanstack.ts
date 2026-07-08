import type {
  AppFieldExtendedReactFormApi,
  FormAsyncValidateOrFn,
  FormValidateOrFn,
} from "@tanstack/react-form";
import { createFormHook } from "@tanstack/react-form";
import { SubmitButton } from "../components/submit-button.js";
import { fieldContext, formContext } from "../hooks/tanstack-context.js";
import { FieldComponents } from "../registry.js";

const fieldComponents = Object.fromEntries(
  Object.entries(FieldComponents).map(([key, mod]) => [key, mod.component]),
);

const formComponents = {
  SubmitButton,
};

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents,
  formComponents,
});

export type TanStackForm = AppFieldExtendedReactFormApi<
  Record<string, unknown>,
  FormValidateOrFn<Record<string, unknown>> | undefined,
  FormValidateOrFn<Record<string, unknown>> | undefined,
  FormAsyncValidateOrFn<Record<string, unknown>> | undefined,
  FormValidateOrFn<Record<string, unknown>> | undefined,
  FormAsyncValidateOrFn<Record<string, unknown>> | undefined,
  FormValidateOrFn<Record<string, unknown>> | undefined,
  FormAsyncValidateOrFn<Record<string, unknown>> | undefined,
  FormValidateOrFn<Record<string, unknown>> | undefined,
  FormAsyncValidateOrFn<Record<string, unknown>> | undefined,
  FormAsyncValidateOrFn<Record<string, unknown>> | undefined,
  unknown,
  typeof fieldComponents,
  typeof formComponents
>;
export type TanStackFieldProps = Parameters<TanStackForm["Field"]>[0];
