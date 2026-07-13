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
        const nextValue = String(value ?? "");

        for (const step of onChangeSteps) {
          switch (step.type) {
            case "slugify":
              tanstack.setFieldValue(
                step.targetId,
                slugLib.default(nextValue, { lower: true, strict: true, trim: true }),
              );
              break;
            case "uppercase":
              tanstack.setFieldValue(step.targetId, nextValue.toLocaleUpperCase());
              break;
            default: {
              const exhaustive: never = step.type;
              throw new Error(`Unsupported listener: ${exhaustive}`);
            }
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
