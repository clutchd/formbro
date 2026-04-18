import type { CompiledValidators } from "@formbro/core/compile";
import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { buildValidators } from "./build-validators";

function getEventValidator(
  validators: ReturnType<typeof buildValidators>,
  fieldId: string,
  event: "onChange" | "onBlur" | "onSubmit" | "onMount",
): z.ZodTypeAny {
  const validator = validators.get(fieldId)?.[event];

  expect(validator).toBeDefined();

  if (!validator || typeof validator === "function" || !(validator instanceof z.ZodType)) {
    throw new Error(`Missing schema validator for ${fieldId}.${event}`);
  }

  return validator;
}

function getFirstIssueMessage(result: { success: boolean; error?: z.ZodError }) {
  if (result.success) {
    throw new Error("Expected validation to fail");
  }

  return result.error?.issues[0]?.message;
}

describe("buildValidators", () => {
  it("returns an empty map when there are no validator plans", () => {
    expect(buildValidators(new Map())).toEqual(new Map());
  });

  it("builds a required string validator", () => {
    const validators: CompiledValidators = new Map([
      [
        "title",
        {
          type: "short_text",
          name: "Title",
          label: "Title",
          rules: {
            onChange: [
              {
                type: "required",
                value: true,
                event: "onChange",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "title", "onChange");

    expect(validator.safeParse("hello").success).toBe(true);
    expect(validator.safeParse("").success).toBe(false);
  });

  it("uses the field label in required error messages", () => {
    const validators: CompiledValidators = new Map([
      [
        "email",
        {
          type: "short_text",
          name: "email",
          label: "Email Address",
          rules: {
            onSubmit: [
              {
                type: "required",
                value: true,
                event: "onSubmit",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "email", "onSubmit");
    const parsed = validator.safeParse("");

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Email Address is required");
  });

  it("keeps fields optional when required is false", () => {
    const validators: CompiledValidators = new Map([
      [
        "nickname",
        {
          type: "short_text",
          name: "Nickname",
          label: "Nickname",
          rules: {
            onChange: [
              {
                type: "required",
                value: false,
                event: "onChange",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "nickname", "onChange");

    expect(validator.safeParse("").success).toBe(true);
    expect(validator.safeParse("Ace").success).toBe(true);
  });

  it("builds a min string validator in isolation", () => {
    const validators: CompiledValidators = new Map([
      [
        "title",
        {
          type: "short_text",
          name: "Title",
          label: "Title",
          rules: {
            onBlur: [
              {
                type: "min",
                value: 3,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "title", "onBlur");

    expect(validator.safeParse("").success).toBe(true);
    expect(validator.safeParse("ab").success).toBe(false);
    expect(validator.safeParse("abc").success).toBe(true);
  });

  it("uses the default min string error message", () => {
    const validators: CompiledValidators = new Map([
      [
        "title",
        {
          type: "short_text",
          name: "Title",
          label: "Title",
          rules: {
            onBlur: [
              {
                type: "min",
                value: 3,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "title", "onBlur");
    const parsed = validator.safeParse("ab");

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Title must be at least 3 characters");
  });

  it("builds a max string validator in isolation", () => {
    const validators: CompiledValidators = new Map([
      [
        "title",
        {
          type: "short_text",
          name: "Title",
          label: "Title",
          rules: {
            onBlur: [
              {
                type: "max",
                value: 5,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "title", "onBlur");

    expect(validator.safeParse("").success).toBe(true);
    expect(validator.safeParse("hello").success).toBe(true);
    expect(validator.safeParse("toolong").success).toBe(false);
  });

  it("uses the default max string error message", () => {
    const validators: CompiledValidators = new Map([
      [
        "title",
        {
          type: "short_text",
          name: "Title",
          label: "Title",
          rules: {
            onBlur: [
              {
                type: "max",
                value: 5,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "title", "onBlur");
    const parsed = validator.safeParse("toolong");

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Title must be at most 5 characters");
  });

  it("builds a regex string validator in isolation", () => {
    const validators: CompiledValidators = new Map([
      [
        "slug",
        {
          type: "short_text",
          name: "Slug",
          label: "Slug",
          rules: {
            onChange: [
              {
                type: "regex",
                value: "^[a-z-]+$",
                event: "onChange",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "slug", "onChange");

    expect(validator.safeParse("").success).toBe(true);
    expect(validator.safeParse("valid-slug").success).toBe(true);
    expect(validator.safeParse("Invalid Slug").success).toBe(false);
  });

  it("uses the default regex string error message", () => {
    const validators: CompiledValidators = new Map([
      [
        "slug",
        {
          type: "short_text",
          name: "Slug",
          label: "Slug",
          rules: {
            onChange: [
              {
                type: "regex",
                value: "^[a-z-]+$",
                event: "onChange",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "slug", "onChange");
    const parsed = validator.safeParse("Invalid Slug");

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Slug must match the regex ^[a-z-]+$");
  });

  it("builds min, max, and regex validators for strings", () => {
    const validators: CompiledValidators = new Map([
      [
        "slug",
        {
          type: "short_text",
          name: "Slug",
          label: "Slug",
          rules: {
            onChange: [
              {
                type: "min",
                value: 3,
                event: "onChange",
              },
              {
                type: "max",
                value: 5,
                event: "onChange",
              },
              {
                type: "regex",
                value: "^[a-z]+$",
                event: "onChange",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "slug", "onChange");

    expect(validator.safeParse("abc").success).toBe(true);
    expect(validator.safeParse("ab").success).toBe(false);
    expect(validator.safeParse("abcdef").success).toBe(false);
    expect(validator.safeParse("ABC").success).toBe(false);
  });

  it("builds min and max validators for numbers", () => {
    const validators: CompiledValidators = new Map([
      [
        "count",
        {
          type: "number",
          name: "Count",
          label: "Count",
          rules: {
            onBlur: [
              {
                type: "min",
                value: 2,
                event: "onBlur",
              },
              {
                type: "max",
                value: 4,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "count", "onBlur");

    expect(validator.safeParse(3).success).toBe(true);
    expect(validator.safeParse(1).success).toBe(false);
    expect(validator.safeParse(5).success).toBe(false);
    expect(validator.safeParse("").success).toBe(true);
  });

  it("builds a min number validator in isolation", () => {
    const validators: CompiledValidators = new Map([
      [
        "count",
        {
          type: "number",
          name: "Count",
          label: "Count",
          rules: {
            onBlur: [
              {
                type: "min",
                value: 2,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "count", "onBlur");

    expect(validator.safeParse("").success).toBe(true);
    expect(validator.safeParse(1).success).toBe(false);
    expect(validator.safeParse(2).success).toBe(true);
  });

  it("uses the default min number error message", () => {
    const validators: CompiledValidators = new Map([
      [
        "count",
        {
          type: "number",
          name: "Count",
          label: "Count",
          rules: {
            onBlur: [
              {
                type: "min",
                value: 2,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "count", "onBlur");
    const parsed = validator.safeParse(1);

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Count must be at least 2");
  });

  it("builds a max number validator in isolation", () => {
    const validators: CompiledValidators = new Map([
      [
        "count",
        {
          type: "number",
          name: "Count",
          label: "Count",
          rules: {
            onBlur: [
              {
                type: "max",
                value: 4,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "count", "onBlur");

    expect(validator.safeParse("").success).toBe(true);
    expect(validator.safeParse(4).success).toBe(true);
    expect(validator.safeParse(5).success).toBe(false);
  });

  it("uses the default max number error message", () => {
    const validators: CompiledValidators = new Map([
      [
        "count",
        {
          type: "number",
          name: "Count",
          label: "Count",
          rules: {
            onBlur: [
              {
                type: "max",
                value: 4,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "count", "onBlur");
    const parsed = validator.safeParse(5);

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Count must be at most 4");
  });

  it("treats required union values as non-empty", () => {
    const validators: CompiledValidators = new Map([
      [
        "count",
        {
          type: "number",
          name: "Count",
          label: "Count",
          rules: {
            onSubmit: [
              {
                type: "required",
                value: true,
                event: "onSubmit",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "count", "onSubmit");

    expect(validator.safeParse(3).success).toBe(true);
    expect(validator.safeParse("").success).toBe(false);
  });

  it("builds separate validators for separate events", () => {
    const validators: CompiledValidators = new Map([
      [
        "title",
        {
          type: "short_text",
          name: "Title",
          label: "Title",
          rules: {
            onChange: [
              {
                type: "min",
                value: 3,
                event: "onChange",
              },
            ],
            onBlur: [
              {
                type: "required",
                value: true,
                event: "onBlur",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const onChangeValidator = getEventValidator(result, "title", "onChange");
    const onBlurValidator = getEventValidator(result, "title", "onBlur");

    expect(onChangeValidator.safeParse("").success).toBe(true);
    expect(onChangeValidator.safeParse("ab").success).toBe(false);
    expect(onBlurValidator.safeParse("").success).toBe(false);
  });

  it("uses custom rule messages when provided", () => {
    const validators: CompiledValidators = new Map([
      [
        "slug",
        {
          type: "short_text",
          name: "Slug",
          label: "Slug",
          rules: {
            onChange: [
              {
                type: "regex",
                value: "^[a-z]+$",
                message: "Lowercase letters only",
                event: "onChange",
              },
            ],
          },
        },
      ],
    ]);

    const result = buildValidators(validators);
    const validator = getEventValidator(result, "slug", "onChange");
    const parsed = validator.safeParse("ABC");

    expect(parsed.success).toBe(false);
    expect(getFirstIssueMessage(parsed)).toBe("Lowercase letters only");
  });

  it("ignores fields that have no sync validator rules", () => {
    const validators: CompiledValidators = new Map([
      [
        "email",
        {
          type: "email",
          name: "Email",
          label: "Email",
          rules: {},
        },
      ],
    ]);

    expect(buildValidators(validators)).toEqual(new Map());
  });
});
