import type { FormInput } from "./form";
import { FieldRegistry } from "../registry";

type IsAlphaNumeric<C extends string> = C extends
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  ? true
  : false;

type StripNonAlphaNumeric<S extends string> = S extends `${infer First}${infer Rest}`
  ? IsAlphaNumeric<Lowercase<First>> extends true
    ? `${Lowercase<First>}${StripNonAlphaNumeric<Rest>}`
    : StripNonAlphaNumeric<Rest>
  : "";

type CleanFieldName<T extends string> = StripNonAlphaNumeric<T>;

type FieldElementType = (typeof FieldRegistry)[number]["key"];

type Counts = Record<string, readonly unknown[]>;

type NextCounts<TCounts extends Counts, TKey extends string> = {
  [K in keyof TCounts | TKey]: K extends TKey
    ? K extends keyof TCounts
      ? TCounts[K] extends readonly unknown[]
        ? [...TCounts[K], unknown]
        : [unknown]
      : [unknown]
    : K extends keyof TCounts
      ? TCounts[K]
      : never;
};

type FieldOccurrence<TCounts extends Counts, TKey extends string> = TKey extends keyof TCounts
  ? TCounts[TKey] extends readonly unknown[]
    ? [...TCounts[TKey], unknown]["length"]
    : 1
  : 1;

type UniqueFieldId<TCounts extends Counts, TName extends string> =
  FieldOccurrence<TCounts, CleanFieldName<TName>> extends 1
    ? CleanFieldName<TName>
    : `${CleanFieldName<TName>}_${FieldOccurrence<TCounts, CleanFieldName<TName>> & number}`;

type ExtractFormDataKeysFromElements<
  TElements extends readonly unknown[],
  TCounts extends Counts = {},
> = TElements extends readonly [infer THead, ...infer TTail]
  ? THead extends {
      type: infer TType;
      name: infer TName;
    }
    ? TType extends FieldElementType
      ? TName extends string
        ? {
            [K in UniqueFieldId<TCounts, TName>]: string;
          } & ExtractFormDataKeysFromElements<TTail, NextCounts<TCounts, CleanFieldName<TName>>>
        : ExtractFormDataKeysFromElements<TTail, TCounts>
      : ExtractFormDataKeysFromElements<TTail, TCounts>
    : ExtractFormDataKeysFromElements<TTail, TCounts>
  : {};

type _ExtractFormDataKeys<T extends FormInput> = T["elements"] extends readonly unknown[]
  ? ExtractFormDataKeysFromElements<T["elements"]>
  : Record<string, unknown>;

export type ExtractFormData<T extends FormInput> = 0 extends 1 & T
  ? Record<string, unknown>
  : string extends keyof _ExtractFormDataKeys<T>
    ? Record<string, unknown>
    : _ExtractFormDataKeys<T>;
