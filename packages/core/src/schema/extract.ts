import type { FormInput } from "./form";
import { FieldRegistry } from "../registry";

type FieldElementType = (typeof FieldRegistry)[number]["key"];
export type FormValue = string | string[];

type FieldValue<TType> = TType extends "multi_select" ? string[] : string;

type ExtractFormDataKeysFromElements<TElements extends readonly unknown[]> =
  TElements extends readonly [infer THead, ...infer TTail]
    ? THead extends {
        type: infer TType;
        id: infer TId;
      }
      ? TType extends FieldElementType
        ? TId extends string
          ? {
              [K in TId]: FieldValue<TType>;
            } & ExtractFormDataKeysFromElements<TTail>
          : ExtractFormDataKeysFromElements<TTail>
        : ExtractFormDataKeysFromElements<TTail>
      : ExtractFormDataKeysFromElements<TTail>
    : {};

type _ExtractFormDataKeys<T extends FormInput> = T["elements"] extends readonly unknown[]
  ? ExtractFormDataKeysFromElements<T["elements"]>
  : Record<string, FormValue>;

export type ExtractFormData<T extends FormInput> = 0 extends 1 & T
  ? Record<string, FormValue>
  : T["elements"] extends readonly [unknown, ...unknown[]]
    ? _ExtractFormDataKeys<T>
    : Record<string, FormValue>;
