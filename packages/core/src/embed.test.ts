import { describe, expect, test } from "bun:test";
import { createPublishedFormSnapshot, PublishedFormSubmissionSchema } from "./embed";

describe("published form snapshot", () => {
  test("creates a portable snapshot pinned to one published revision", () => {
    const snapshot = createPublishedFormSnapshot({
      publicId: "employment-application",
      publishedTime: 1_000,
      revision: "revision-a",
      schema: {
        id: "employment_application",
        name: "Employment application",
        elements: [],
      },
    });

    expect(snapshot).toEqual({
      protocolVersion: 1,
      publicId: "employment-application",
      publishedTime: 1_000,
      revision: "revision-a",
      schema: {
        id: "employment_application",
        version: "1.0.0",
        name: "Employment application",
        elements: [],
      },
    });
  });
});

describe("published form submission", () => {
  test("parses the revision, idempotency key, and response values", () => {
    expect(
      PublishedFormSubmissionSchema.parse({
        revision: "revision-a",
        idempotencyKey: "submission-a",
        values: {
          email: "person@example.com",
        },
      }),
    ).toEqual({
      revision: "revision-a",
      idempotencyKey: "submission-a",
      values: {
        email: "person@example.com",
      },
    });
  });
});
