import type {
  AppFieldExtendedReactFormApi,
  FormAsyncValidateOrFn,
  FormValidateOrFn,
} from "@tanstack/react-form-nextjs";
import { createFormHook } from "@tanstack/react-form-nextjs";
import { SubmitButton } from "../components/submit-button";
import { fieldContext, formContext } from "../hooks/tanstack-context";
import { FieldComponents } from "../registry";

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
