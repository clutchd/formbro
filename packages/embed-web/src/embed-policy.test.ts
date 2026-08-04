import { describe, expect, test } from "bun:test";
import { createGuardedEmbedResponse } from "./embed-policy";

describe("guarded embed document", () => {
  test("enforces allowed ancestors and forwards only the inner FormBro frame", async () => {
    const response = createGuardedEmbedResponse({
      allowedOrigins: ["https://saymechanical.com", "https://www.saymechanical.com"],
      nonce: "test-nonce",
      publicId: "jobs",
    });
    const html = await response.text();

    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors https://saymechanical.com https://www.saymechanical.com",
    );
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(response.headers.get("cdn-cache-control")).toContain("s-maxage=60");
    expect(html).toContain('src="/i/jobs"');
    expect(html).toContain("event.source !== frame.contentWindow");
    expect(html).toContain("event.origin !== window.location.origin");
  });
});
