import type { PublishedFormSnapshot } from "@formbro/core/embed";
import { describe, expect, test } from "bun:test";
import { embedSnapshotErrorResponse, publishedSnapshotResponse } from "./embed-snapshot";

const snapshot: PublishedFormSnapshot = {
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
};

describe("published snapshot HTTP response", () => {
  test("is publicly readable and cacheable at the CDN without browser staleness", async () => {
    const response = publishedSnapshotResponse(snapshot);

    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(response.headers.get("cdn-cache-control")).toContain("s-maxage=60");
    expect(response.headers.get("etag")).toBe('"revision-a"');
    expect(await response.json()).toEqual(snapshot);
  });

  test("does not cache unavailable form states", async () => {
    const response = embedSnapshotErrorResponse({
      code: "FORM_CLOSED",
      message: "This form is not accepting responses.",
      status: 409,
    });

    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(await response.json()).toEqual({
      error: {
        code: "FORM_CLOSED",
        message: "This form is not accepting responses.",
      },
    });
  });
});
