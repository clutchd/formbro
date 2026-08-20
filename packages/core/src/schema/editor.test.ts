import { describe, expect, it } from "bun:test";
import type { FormElementInput } from "./form";
import { RegistryKeys } from "../registry";
import {
  convertFormElementDraftType,
  createFormElementDraft,
  createFormElementId,
  getRegistryEditorProperties,
  getRegistryEditorPreview,
} from "./editor";

describe("form editor schema helpers", () => {
  it("creates unique ids for draft elements", () => {
    const elements: FormElementInput[] = [
      { id: "short_text_abc", name: "Name", type: "short_text", label: "Name" },
    ];

    expect(createFormElementId({ elements, suffix: "abc", type: "short_text" })).toBe(
      "short_text_abc_2",
    );
  });

  it("creates draft elements from registry defaults", () => {
    expect(createFormElementDraft({ id: "email", type: "email" })).toMatchObject({
      id: "email",
      label: "Email",
      name: "Email",
      placeholder: "you@example.com",
      type: "email",
    });

    expect(createFormElementDraft({ id: "heading", type: "heading" })).toMatchObject({
      id: "heading",
      label: "New heading",
      level: 2,
      type: "heading",
    });

    expect(createFormElementDraft({ id: "choice", type: "radio_group" })).toMatchObject({
      id: "choice",
      label: "Choose one",
      name: "Radio Group",
      options: ["Option 1", "Option 2", "Option 3"],
      type: "radio_group",
    });

    expect(createFormElementDraft({ id: "choices", type: "checkbox_group" })).toMatchObject({
      id: "choices",
      label: "Select all that apply",
      name: "Checkbox Group",
      options: ["Option 1", "Option 2", "Option 3"],
      type: "checkbox_group",
    });
  });

  it("converts element type while preserving useful author state", () => {
    const converted = convertFormElementDraftType({
      element: {
        id: "question",
        name: "Position",
        type: "short_text",
        label: "Position Applied For",
        description: "Pick the closest role.",
        placeholder: "Developer",
        rules: [{ type: "required", value: true }],
      },
      type: "link",
    });

    expect(converted).toMatchObject({
      id: "question",
      label: "Position Applied For",
      name: "Position Applied For",
      description: "Pick the closest role.",
      placeholder: "Developer",
      rules: [{ type: "required", value: true }],
      type: "link",
    });
  });

  it("only preserves options for option-backed targets", () => {
    const source: FormElementInput = {
      id: "choice",
      name: "Choice",
      type: "single_select",
      label: "Favorite option",
      options: ["A", "B"],
    };

    expect(convertFormElementDraftType({ element: source, type: "single_select" })).toMatchObject({
      options: ["A", "B"],
    });
    expect(convertFormElementDraftType({ element: source, type: "radio_group" })).toMatchObject({
      options: ["A", "B"],
    });
    expect(convertFormElementDraftType({ element: source, type: "checkbox_group" })).toMatchObject({
      options: ["A", "B"],
    });
    expect(convertFormElementDraftType({ element: source, type: "short_text" })).not.toHaveProperty(
      "options",
    );
  });

  it("does not carry incompatible defaults across scalar and array fields", () => {
    const checkbox: FormElementInput = {
      id: "choice",
      name: "Choice",
      type: "checkbox_group",
      label: "Favorite options",
      options: ["A", "B"],
      default: ["A"],
    };
    const singleSelect: FormElementInput = {
      id: "choice",
      name: "Choice",
      type: "single_select",
      label: "Favorite option",
      options: ["A", "B"],
      default: "A",
    };

    expect(
      convertFormElementDraftType({ element: checkbox, type: "radio_group" }),
    ).not.toHaveProperty("default");
    expect(
      convertFormElementDraftType({ element: singleSelect, type: "checkbox_group" }),
    ).not.toHaveProperty("default");
  });

  it("declares editor preview and properties for every registry item", () => {
    for (const type of RegistryKeys) {
      expect(getRegistryEditorPreview(type)).toBeDefined();
      expect(getRegistryEditorProperties(type).length).toBeGreaterThan(0);
    }
  });
});
