import { describe, expect, it } from "bun:test";
import { compile } from "@formbro/core/compile";
import type { Doc, Id } from "./_generated/dataModel";
import { buildSubmissionListPage } from "./submissionList";

const formId = "form-id" as Id<"forms">;
const schemaId = "schema-id" as Id<"formSchemas">;
const workspaceId = "workspace-id" as Id<"workspaces">;

function submission(
  id: string,
  submittedTime: number,
  data: Doc<"submissions">["data"],
): Doc<"submissions"> {
  return {
    _id: id as Id<"submissions">,
    _creationTime: submittedTime,
    bytes: 0,
    data,
    formId,
    schemaId,
    submittedTime,
    workspaceId,
  };
}

const compiledForm = compile({
  id: "submission_list",
  name: "Submission list",
  elements: [
    {
      id: "email",
      name: "Email",
      type: "email",
      label: "Email address",
    },
    {
      id: "interests",
      name: "Interests",
      type: "checkbox",
      label: "Interests",
    },
  ],
});

describe("buildSubmissionListPage", () => {
  it("formats rows and carries page column metadata once", () => {
    const rows = buildSubmissionListPage(
      [
        submission("newest", 200, {
          email: "new@example.com",
          interests: ["Product", "Engineering"],
        }),
        submission("oldest", 100, { email: "old@example.com" }),
      ],
      new Map([[schemaId, compiledForm]]),
    );

    expect(rows.map((row) => row.id)).toEqual(["newest", "oldest"]);
    expect(rows[0]?.values).toEqual({
      email: "new@example.com",
      interests: "Product, Engineering",
    });
    expect(rows[0]?.columnHints).toEqual([
      {
        id: "email",
        label: "Email address",
        type: "email",
        firstSeenSubmittedTime: 100,
        lastSeenSubmittedTime: 200,
      },
      {
        id: "interests",
        label: "Interests",
        type: "checkbox",
        firstSeenSubmittedTime: 100,
        lastSeenSubmittedTime: 200,
      },
    ]);
    expect(rows[1]?.columnHints).toEqual([]);
  });

  it("retains unknown historical fields when a schema is unavailable", () => {
    const rows = buildSubmissionListPage(
      [submission("submission", 100, { legacy_field: "Legacy value" })],
      new Map(),
    );

    expect(rows[0]?.columnHints).toEqual([
      {
        id: "legacy_field",
        label: "legacy_field",
        type: null,
        firstSeenSubmittedTime: 100,
        lastSeenSubmittedTime: 100,
      },
    ]);
  });

  it("returns an empty page without column metadata", () => {
    expect(buildSubmissionListPage([], new Map([[schemaId, compiledForm]]))).toEqual([]);
  });
});
