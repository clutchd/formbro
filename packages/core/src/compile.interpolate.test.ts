import { describe, expect, it } from "bun:test";
import { _private } from "./compile.js";

describe("compile:interpolate", () => {
  describe("string interpolation", () => {
    it("should replace single variable", () => {
      const result = _private.interpolate("Hello {{name}}", { name: "World" });
      expect(result).toBe("Hello World");
    });

    it("should replace multiple variables", () => {
      const result = _private.interpolate("{{greeting}} {{name}}!", {
        greeting: "Hello",
        name: "World",
      });
      expect(result).toBe("Hello World!");
    });

    it("should preserve unmatched variables", () => {
      const result = _private.interpolate("Hello {{name}} and {{other}}", {
        name: "World",
      });
      expect(result).toBe("Hello World and {{other}}");
    });

    it("should handle string without variables", () => {
      const result = _private.interpolate("Hello World", { name: "Test" });
      expect(result).toBe("Hello World");
    });

    it("should handle empty variables object", () => {
      const result = _private.interpolate("Hello {{name}}", {});
      expect(result).toBe("Hello {{name}}");
    });

    it("should handle empty string", () => {
      const result = _private.interpolate("", { name: "Test" });
      expect(result).toBe("");
    });
  });

  describe("array interpolation", () => {
    it("should interpolate strings in arrays", () => {
      const result = _private.interpolate(["Hello {{name}}", "Bye {{name}}"], {
        name: "World",
      });
      expect(result).toEqual(["Hello World", "Bye World"]);
    });

    it("should handle nested arrays", () => {
      const result = _private.interpolate([["Hello {{name}}"]], { name: "World" });
      expect(result).toEqual([["Hello World"]]);
    });

    it("should handle empty arrays", () => {
      const result = _private.interpolate([], { name: "World" });
      expect(result).toEqual([]);
    });
  });

  describe("object interpolation", () => {
    it("should interpolate values in objects", () => {
      const result = _private.interpolate({ greeting: "Hello {{name}}" }, { name: "World" });
      expect(result).toEqual({ greeting: "Hello World" });
    });

    it("should interpolate nested objects", () => {
      const result = _private.interpolate(
        {
          outer: {
            inner: "Hello {{name}}",
          },
        },
        { name: "World" },
      );
      expect(result).toEqual({
        outer: {
          inner: "Hello World",
        },
      });
    });

    it("should NOT interpolate the variables key itself", () => {
      const result = _private.interpolate(
        {
          message: "Hello {{name}}",
          variables: { name: "{{name}}" },
        },
        { name: "World" },
      );
      expect(result).toEqual({
        message: "Hello World",
        variables: { name: "{{name}}" },
      });
    });

    it("should handle empty objects", () => {
      const result = _private.interpolate({}, { name: "World" });
      expect(result).toEqual({});
    });
  });

  describe("primitive values", () => {
    it("should return numbers unchanged", () => {
      const result = _private.interpolate(42, { name: "World" });
      expect(result).toBe(42);
    });

    it("should return booleans unchanged", () => {
      const result = _private.interpolate(true, { name: "World" });
      expect(result).toBe(true);
    });

    it("should return null unchanged", () => {
      const result = _private.interpolate(null, { name: "World" });
      expect(result).toBe(null);
    });

    it("should return undefined unchanged", () => {
      const result = _private.interpolate(undefined, { name: "World" });
      expect(result).toBe(undefined);
    });
  });

  describe("form schema interpolation", () => {
    it("should interpolate a form schema", () => {
      const schema = {
        name: "Contact {{companyName}}",
        elements: [
          {
            id: "email",
            name: "Email",
            type: "short_text",
            label: "Email for {{companyName}}",
            props: {
              placeholder: "Enter your {{companyName}} email",
            },
          },
        ],
        variables: {
          companyName: "{{companyName}}",
        },
      };

      const result = _private.interpolate(schema, { companyName: "Acme Inc" });

      expect(result.name).toBe("Contact Acme Inc");
      expect(result.elements[0]?.label).toBe("Email for Acme Inc");
      expect(result.elements[0]?.props?.placeholder).toBe("Enter your Acme Inc email");
      expect(result.variables.companyName).toBe("{{companyName}}");
    });
  });

  describe("edge cases", () => {
    it("should handle variable names with underscores", () => {
      const result = _private.interpolate("Hello {{user_name}}", { user_name: "World" });
      expect(result).toBe("Hello World");
    });

    it("should handle variable names with numbers", () => {
      const result = _private.interpolate("Value: {{item1}}", { item1: "Test" });
      expect(result).toBe("Value: Test");
    });

    it("should handle multiple occurrences of same variable", () => {
      const result = _private.interpolate("{{x}} + {{x}} = 2{{x}}", { x: "1" });
      expect(result).toBe("1 + 1 = 21");
    });

    it("should handle adjacent variables", () => {
      const result = _private.interpolate("{{a}}{{b}}", { a: "Hello", b: "World" });
      expect(result).toBe("HelloWorld");
    });
  });
});
