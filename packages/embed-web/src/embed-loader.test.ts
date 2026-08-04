import { describe, expect, test } from "bun:test";
import { embedFrameUrl, normalizeEmbedHeight, parseEmbedLifecycleMessage } from "./embed-loader";

describe("embed parent loader", () => {
  test("builds an encoded hosted-form URL from the loader origin", () => {
    expect(embedFrameUrl("https://embed.formbro.com/embed.js", "job applications")).toBe(
      "https://embed.formbro.com/e/job%20applications",
    );
    expect(embedFrameUrl("https://embed.formbro.com/embed.js", "jobs", true)).toBe(
      "https://embed.formbro.com/g/jobs",
    );
  });

  test("accepts only the versioned public lifecycle contract", () => {
    expect(
      parseEmbedLifecycleMessage({
        source: "formbro:embed",
        protocolVersion: 1,
        publicId: "jobs",
        event: "submitted",
      }),
    ).toMatchObject({ publicId: "jobs", event: "submitted" });

    expect(parseEmbedLifecycleMessage({ event: "submitted" })).toBeNull();
    expect(
      parseEmbedLifecycleMessage({
        source: "formbro:embed",
        protocolVersion: 2,
        publicId: "jobs",
        event: "submitted",
      }),
    ).toBeNull();
  });

  test("bounds parent-controlled iframe heights", () => {
    expect(normalizeEmbedHeight(42)).toBe(160);
    expect(normalizeEmbedHeight(428.2)).toBe(429);
    expect(normalizeEmbedHeight(50_000)).toBe(10_000);
  });
});
