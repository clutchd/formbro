import type { CompiledValidator, CompiledValidators } from "@formbro/core/compile";
import type { FormRule } from "@formbro/core/schema/rule";
import { Registry } from "@formbro/core/registry";
import { SYNC_EVENTS } from "@formbro/core/schema/event";
import { z } from "zod";
import type { TanStackFieldProps } from "../hooks/tanstack";

export function buildValidators(validators: CompiledValidators) {
  const result = new Map<string, TanStackFieldProps["validators"]>();

  for (const [fieldId, validatorPlan] of validators.entries()) {
    const fieldValidators = buildFieldValidators(validatorPlan);

    if (Object.keys(fieldValidators).length > 0) {
      result.set(fieldId, fieldValidators);
    }
  }

  return result;
}

function buildFieldValidators(validatorPlan: CompiledValidator) {
  const baseValidator: z.ZodTypeAny | undefined = Registry[validatorPlan.type]?.schema;
  const validators: NonNullable<TanStackFieldProps["validators"]> = {};

  if (!baseValidator) {
    return validators;
  }

  for (const event of SYNC_EVENTS) {
    const rules = validatorPlan.rules[event];

    if (!rules || rules.length === 0) {
      continue;
    }

    const hasRequiredRule = rules.some((rule) => {
      return rule.type === "required" && rule.value;
    });
    const defaultValidator = hasRequiredRule ? baseValidator : toOptionalValidator(baseValidator);

    let validator: z.ZodTypeAny = defaultValidator;

    for (const rule of rules) {
      switch (rule.type) {
        case "required":
          validator = rule.value ? required(validatorPlan, validator) : validator;
          break;
        case "min":
          validator = min(validatorPlan, rule, validator);
          break;
        case "max":
          validator = max(validatorPlan, rule, validator);
          break;
        case "regex":
          validator = regex(validatorPlan, rule, validator);
          break;
      }
    }

    validators[event] = validator;
  }

  return validators;
}

function required(validatorPlan: CompiledValidator, validator: z.ZodTypeAny): z.ZodTypeAny {
  const unwrapped = validator instanceof z.ZodOptional ? validator.unwrap() : validator;

  if (unwrapped instanceof z.ZodString) {
    return unwrapped.min(1, `${getDisplayName(validatorPlan)} is required`);
  }

  if (unwrapped instanceof z.ZodNumber) {
    return unwrapped;
  }

  if (unwrapped instanceof z.ZodUnion) {
    return unwrapped.refine((value) => value !== "", {
      message: `${getDisplayName(validatorPlan)} is required`,
    });
  }

  return validator;
}

function min(
  validatorPlan: CompiledValidator,
  rule: Extract<FormRule, { type: "min" }>,
  validator: z.ZodTypeAny,
): z.ZodTypeAny {
  const optional = validator instanceof z.ZodOptional;
  const schema = optional ? validator.unwrap() : validator;

  if (schema instanceof z.ZodString) {
    const next = schema.min(
      rule.value,
      rule.message || `${getDisplayName(validatorPlan)} must be at least ${rule.value} characters`,
    );
    return optional ? next.optional() : next;
  }

  if (schema instanceof z.ZodNumber) {
    const next = schema.min(
      rule.value,
      rule.message || `${getDisplayName(validatorPlan)} must be at least ${rule.value}`,
    );
    return optional ? next.optional() : next;
  }

  if (schema instanceof z.ZodUnion) {
    return schema.refine(
      (value) => {
        if (value === "") {
          return true;
        }

        if (typeof value === "string") {
          return value.length >= rule.value;
        }

        if (typeof value === "number") {
          return value >= rule.value;
        }

        return false;
      },
      {
        message: rule.message || getRangeMessage(validatorPlan, "min", rule.value),
      },
    );
  }

  return validator;
}

function max(
  validatorPlan: CompiledValidator,
  rule: Extract<FormRule, { type: "max" }>,
  validator: z.ZodTypeAny,
): z.ZodTypeAny {
  const optional = validator instanceof z.ZodOptional;
  const schema = optional ? validator.unwrap() : validator;

  if (schema instanceof z.ZodString) {
    const next = schema.max(
      rule.value,
      rule.message || `${getDisplayName(validatorPlan)} must be at most ${rule.value} characters`,
    );
    return optional ? next.optional() : next;
  }

  if (schema instanceof z.ZodNumber) {
    const next = schema.max(
      rule.value,
      rule.message || `${getDisplayName(validatorPlan)} must be at most ${rule.value}`,
    );
    return optional ? next.optional() : next;
  }

  if (schema instanceof z.ZodUnion) {
    return schema.refine(
      (value) => {
        if (value === "") {
          return true;
        }

        if (typeof value === "string") {
          return value.length <= rule.value;
        }

        if (typeof value === "number") {
          return value <= rule.value;
        }

        return false;
      },
      {
        message: rule.message || getRangeMessage(validatorPlan, "max", rule.value),
      },
    );
  }

  return validator;
}

function regex(
  validatorPlan: CompiledValidator,
  rule: Extract<FormRule, { type: "regex" }>,
  validator: z.ZodTypeAny,
): z.ZodTypeAny {
  const optional = validator instanceof z.ZodOptional;
  const schema = optional ? validator.unwrap() : validator;

  if (schema instanceof z.ZodString) {
    const next = schema.regex(
      new RegExp(rule.value),
      rule.message || `${getDisplayName(validatorPlan)} must match the regex ${rule.value}`,
    );
    return optional ? next.optional() : next;
  }

  if (schema instanceof z.ZodUnion) {
    return schema.refine(
      (value) => {
        if (value === "") {
          return true;
        }

        return typeof value === "string" && new RegExp(rule.value).test(value);
      },
      {
        message:
          rule.message || `${getDisplayName(validatorPlan)} must match the regex ${rule.value}`,
      },
    );
  }

  return validator;
}
function getDisplayName(validatorPlan: CompiledValidator) {
  return validatorPlan.label || validatorPlan.name;
}

function getRangeMessage(validatorPlan: CompiledValidator, type: "min" | "max", value: number) {
  const direction = type === "min" ? "at least" : "at most";

  if (validatorPlan.type === "number") {
    return `${getDisplayName(validatorPlan)} must be ${direction} ${value}`;
  }

  return `${getDisplayName(validatorPlan)} must be ${direction} ${value} characters`;
}

function toOptionalValidator(validator: z.ZodTypeAny): z.ZodTypeAny {
  if (validator instanceof z.ZodString) {
    return z.union([validator, z.literal("")]);
  }

  if (validator instanceof z.ZodUnion) {
    return validator;
  }

  return validator.optional();
}
