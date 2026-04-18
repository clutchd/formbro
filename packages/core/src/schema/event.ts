import { z } from "zod";

export const SYNC_EVENTS = ["onBlur", "onChange", "onMount", "onSubmit"] as const;
export const ASYNC_EVENTS = ["onBlurAsync", "onChangeAsync", "onSubmitAsync"] as const;
export const ALL_EVENTS = [...SYNC_EVENTS, ...ASYNC_EVENTS] as const;

export const syncEventSchema = z.enum(SYNC_EVENTS).default("onChange").optional();
export const asyncEventSchema = z.enum(ASYNC_EVENTS).default("onChangeAsync").optional();

export type FormEvent = (typeof ALL_EVENTS)[number];
