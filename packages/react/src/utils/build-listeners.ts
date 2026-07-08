import { type CompiledListeners } from "@formbro/core/compile";
import * as slugLib from "slugify";
import type { TanStackFieldProps, TanStackForm } from "../hooks/tanstack.js";

type ListenerFormApi = Pick<TanStackForm, "setFieldValue">;

export function buildListeners(tanstack: ListenerFormApi, listeners: CompiledListeners) {
  const result = new Map<string, TanStackFieldProps["listeners"]>();

  for (const [sourceId, steps] of listeners.entries()) {
    const sourceListeners: TanStackFieldProps["listeners"] = {};

    const onChangeSteps = steps.filter((step) => step.event === "onChange");

    if (onChangeSteps.length > 0) {
      sourceListeners.onChange = ({ value }) => {
        for (const step of onChangeSteps) {
          switch (step.type) {
            case "slugify":
              slugify(tanstack, step.targetId)({ value: String(value ?? "") });
              break;
            case "uppercase":
              uppercase(tanstack, step.targetId)({ value: String(value ?? "") });
              break;
          }
        }
      };
    }

    if (Object.keys(sourceListeners).length > 0) {
      result.set(sourceId, sourceListeners);
    }
  }

  return result;
}

function slugify(tanstack: ListenerFormApi, target: string) {
  return ({ value }: { value: string }) => {
    tanstack.setFieldValue(
      target,
      slugLib.default(value, { lower: true, strict: true, trim: true }),
    );
  };
}

function uppercase(tanstack: ListenerFormApi, target: string) {
  return async ({ value }: { value: string }) => {
    tanstack.setFieldValue(target, value.toLocaleUpperCase());
  };
}
