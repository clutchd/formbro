import { describe, expect, test } from "bun:test";
import { canAcceptPublishedRevision, PUBLISHED_REVISION_GRACE_MS } from "./publishedRevision";

describe("published revision submission policy", () => {
  test("accepts the current published revision", () => {
    expect(
      canAcceptPublishedRevision({
        currentRevisionId: "revision-a",
        now: 1_000,
        revision: {
          id: "revision-a",
          status: "published",
        },
      }),
    ).toBe(true);
  });

  test("accepts a retired revision while a respondent finishes an open form", () => {
    const retiredTime = 1_000;

    expect(
      canAcceptPublishedRevision({
        currentRevisionId: "revision-b",
        now: retiredTime + PUBLISHED_REVISION_GRACE_MS,
        revision: {
          id: "revision-a",
          retiredTime,
          status: "published",
        },
      }),
    ).toBe(true);
  });

  test("rejects draft revisions even when they match the current revision id", () => {
    expect(
      canAcceptPublishedRevision({
        currentRevisionId: "revision-a",
        now: 1_000,
        revision: {
          id: "revision-a",
          status: "draft",
        },
      }),
    ).toBe(false);
  });

  test("rejects a retired revision after the response grace period", () => {
    const retiredTime = 1_000;

    expect(
      canAcceptPublishedRevision({
        currentRevisionId: "revision-b",
        now: retiredTime + PUBLISHED_REVISION_GRACE_MS + 1,
        revision: {
          id: "revision-a",
          retiredTime,
          status: "published",
        },
      }),
    ).toBe(false);
  });

  test("rejects a non-current revision that was never retired", () => {
    expect(
      canAcceptPublishedRevision({
        currentRevisionId: "revision-b",
        now: 1_000,
        revision: {
          id: "revision-a",
          status: "published",
        },
      }),
    ).toBe(false);
  });
});
