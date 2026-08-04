import { describe, expect, test } from "bun:test";
import {
  createPublishedFormSnapshot,
  EmbedLifecycleMessageSchema,
  FORMBRO_EMBED_PROTOCOL_VERSION,
  PublishedFormSubmissionSchema,
} from "./embed";

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

describe("embed lifecycle protocol", () => {
  test("parses responsive and lifecycle messages", () => {
    expect(
      EmbedLifecycleMessageSchema.parse({
        source: "formbro:embed",
        protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
        publicId: "jobs",
        event: "ready",
        height: 428,
      }),
    ).toEqual({
      source: "formbro:embed",
      protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
      publicId: "jobs",
      event: "ready",
      height: 428,
    });

    expect(
      EmbedLifecycleMessageSchema.parse({
        source: "formbro:embed",
        protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
        publicId: "jobs",
        event: "progress",
        percent: 50,
      }),
    ).toMatchObject({ event: "progress", percent: 50 });
  });

  test("rejects malformed or unversioned cross-frame messages", () => {
    expect(
      EmbedLifecycleMessageSchema.safeParse({
        source: "another-widget",
        protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
        publicId: "jobs",
        event: "resize",
        height: 428,
      }).success,
    ).toBe(false);

    expect(
      EmbedLifecycleMessageSchema.safeParse({
        source: "formbro:embed",
        protocolVersion: FORMBRO_EMBED_PROTOCOL_VERSION,
        publicId: "jobs",
        event: "progress",
        percent: 101,
      }).success,
    ).toBe(false);
  });
});
