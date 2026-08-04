import { describe, expect, test } from "bun:test";
import {
  createPublishedFormSnapshot,
  DEFAULT_EMBED_SETTINGS,
  EmbedLifecycleMessageSchema,
  EmbedTelemetryPayloadSchema,
  FORMBRO_EMBED_PROTOCOL_VERSION,
  normalizeEmbedAllowedOrigins,
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
      embed: DEFAULT_EMBED_SETTINGS,
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

describe("embed settings", () => {
  test("normalizes exact HTTP origins and removes duplicates", () => {
    expect(
      normalizeEmbedAllowedOrigins([
        "https://saymechanical.com/",
        "https://saymechanical.com",
        "http://localhost:3000",
      ]),
    ).toEqual(["https://saymechanical.com", "http://localhost:3000"]);
  });

  test("rejects paths, credentials, non-HTTP protocols, and oversized policies", () => {
    for (const origin of [
      "https://saymechanical.com/careers",
      "https://user:pass@saymechanical.com",
      "javascript:alert(1)",
    ]) {
      expect(() => normalizeEmbedAllowedOrigins([origin])).toThrow();
    }

    expect(() =>
      normalizeEmbedAllowedOrigins(
        Array.from({ length: 26 }, (_, index) => `https://${index}.example.com`),
      ),
    ).toThrow();
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

describe("embed telemetry payload", () => {
  test("accepts coarse session outcomes without respondent or identity fields", () => {
    expect(
      EmbedTelemetryPayloadSchema.parse({
        protocolVersion: 1,
        publicId: "jobs",
        revision: "revision-a",
        started: true,
        submitted: false,
        hadError: true,
        duration: "30_to_119_seconds",
      }),
    ).toMatchObject({ started: true, submitted: false, hadError: true });

    expect(
      EmbedTelemetryPayloadSchema.safeParse({
        protocolVersion: 1,
        publicId: "jobs",
        revision: "revision-a",
        started: false,
        submitted: false,
        hadError: false,
        duration: "under_10_seconds",
        email: "person@example.com",
      }).success,
    ).toBe(false);
  });
});
