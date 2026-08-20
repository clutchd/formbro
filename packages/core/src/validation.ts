import { z } from "zod";
import type { CompiledField, CompiledForm, CompiledValidator, CompiledValidators } from "./compile";
import type { FormRule } from "./schema/rule";
import { Registry } from "./registry";
import { SYNC_EVENTS } from "./schema/event";

type SyncFormEvent = (typeof SYNC_EVENTS)[number];

export type BuiltValidators = Map<string, Partial<Record<SyncFormEvent, z.ZodTypeAny>>>;

export type FormValidationIssue = {
  fieldId: string;
  message: string;
};

export type FormValidationResult =
  | { success: true }
  | { issues: FormValidationIssue[]; success: false };

export function buildValidators(validators: CompiledValidators): BuiltValidators {
  const result: BuiltValidators = new Map();

  for (const [fieldId, validatorPlan] of validators.entries()) {
    const fieldValidators = buildFieldValidators(validatorPlan);

    if (Object.keys(fieldValidators).length > 0) {
      result.set(fieldId, fieldValidators);
    }
  }

  return result;
}

export function validateFormSubmission(
  form: CompiledForm,
  data: Record<string, unknown>,
): FormValidationResult {
  const fields = getCompiledFields(form);
  const fieldIds = new Set(fields.map((field) => field.id));
  const validators = buildValidators(form.validators);
  const issues: FormValidationIssue[] = [];

  for (const fieldId of Object.keys(data)) {
    if (!fieldIds.has(fieldId)) {
      issues.push({
        fieldId,
        message: `Unknown field: ${fieldId}`,
      });
    }
  }

  for (const field of fields) {
    const fieldValidators = validators.get(field.id);
    if (!fieldValidators) continue;

    const emptyValue = field.type === "multi_select" ? [] : "";
    const value = valueForValidation(field, data[field.id] ?? emptyValue);

    for (const event of SYNC_EVENTS) {
      const validator = fieldValidators[event];
      if (!validator) continue;

      const parsed = validator.safeParse(value);
      if (!parsed.success) {
        issues.push({
          fieldId: field.id,
          message: parsed.error.issues[0]?.message ?? `${field.label ?? field.name} is invalid`,
        });
        break;
      }
    }
  }

  return issues.length > 0 ? { issues, success: false } : { success: true };
}

function buildFieldValidators(validatorPlan: CompiledValidator) {
  const baseValidator: z.ZodTypeAny | undefined = Registry[validatorPlan.type]?.schema;
  const validators: Partial<Record<SyncFormEvent, z.ZodTypeAny>> = {};

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
    let validator: z.ZodTypeAny = hasRequiredRule
      ? baseValidator
      : toOptionalValidator(baseValidator);

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

function getCompiledFields(form: CompiledForm): CompiledField[] {
  return form.pages.flatMap((page) =>
    page.elements.filter((element): element is CompiledField => element.category === "field"),
  );
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

function required(validatorPlan: CompiledValidator, validator: z.ZodTypeAny): z.ZodTypeAny {
  const unwrapped = validator instanceof z.ZodOptional ? validator.unwrap() : validator;

  if (unwrapped instanceof z.ZodString) {
    return unwrapped.min(1, `${getDisplayName(validatorPlan)} is required`);
  }

  if (unwrapped instanceof z.ZodNumber) {
    return unwrapped;
  }

  if (unwrapped instanceof z.ZodArray) {
    return unwrapped.min(1, `${getDisplayName(validatorPlan)} is required`);
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

function valueForValidation(field: CompiledField, value: unknown) {
  if (field.type !== "number" || value === "") return value;
  if (typeof value === "string") return Number(value);
  return value;
}
