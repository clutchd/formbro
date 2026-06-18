import type { FormInput } from "./form";
import { FieldRegistry } from "../registry";

type FieldElementType = (typeof FieldRegistry)[number]["key"];

type ExtractFormDataKeysFromElements<TElements extends readonly unknown[]> =
  TElements extends readonly [infer THead, ...infer TTail]
    ? THead extends {
        type: infer TType;
        id: infer TId;
      }
      ? TType extends FieldElementType
        ? TId extends string
          ? {
              [K in TId]: string;
            } & ExtractFormDataKeysFromElements<TTail>
          : ExtractFormDataKeysFromElements<TTail>
        : ExtractFormDataKeysFromElements<TTail>
      : ExtractFormDataKeysFromElements<TTail>
    : {};

type _ExtractFormDataKeys<T extends FormInput> = T["elements"] extends readonly unknown[]
  ? ExtractFormDataKeysFromElements<T["elements"]>
  : Record<string, unknown>;

export type ExtractFormData<T extends FormInput> = 0 extends 1 & T
  ? Record<string, unknown>
  : string extends keyof _ExtractFormDataKeys<T>
    ? Record<string, unknown>
    : _ExtractFormDataKeys<T>;
