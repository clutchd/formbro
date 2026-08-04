import { describe, expect, test } from "bun:test";
import { buildEmbedCode } from "./embed-code";

describe("dashboard embed code", () => {
  test("builds hosted, automatic, and iframe integration options", () => {
    expect(
      buildEmbedCode({
        embedUrl: "https://embed.formbro.com/",
        formName: "Employment application",
        publicId: "employment-application",
      }),
    ).toEqual({
      hostedUrl: "https://embed.formbro.com/e/employment-application",
      automatic:
        '<div data-formbro-id="employment-application" data-formbro-title="Employment application"></div>\n<script async src="https://embed.formbro.com/embed.js"></script>',
      iframe:
        '<iframe src="https://embed.formbro.com/e/employment-application" title="Employment application" width="100%" height="640" loading="eager" style="border: 0; display: block;"></iframe>',
      next: 'import "@formbro/embed-react/styles.css";\nimport { FormBroForm } from "@formbro/embed-react/next";\n\nexport default function Page() {\n  return <FormBroForm publicId={"employment-application"} />;\n}',
    });
  });

  test("encodes route segments and escapes HTML attributes", () => {
    const result = buildEmbedCode({
      embedUrl: "https://embed.formbro.com",
      formName: 'Jobs & "Careers"',
      publicId: "jobs/us",
    });

    expect(result.hostedUrl).toBe("https://embed.formbro.com/e/jobs%2Fus");
    expect(result.automatic).toContain('data-formbro-title="Jobs &amp; &quot;Careers&quot;"');
    expect(result.iframe).not.toContain('title="Jobs & "Careers""');
    expect(result.next).toContain('publicId={"jobs/us"}');
  });

  test("uses the guarded route when a domain policy is enabled", () => {
    const result = buildEmbedCode({
      allowedOrigins: ["https://saymechanical.com"],
      embedUrl: "https://embed.formbro.com",
      formName: "Careers",
      publicId: "jobs",
    });

    expect(result.hostedUrl).toBe("https://embed.formbro.com/g/jobs");
    expect(result.automatic).toContain("data-formbro-guarded");
    expect(result.iframe).toContain('src="https://embed.formbro.com/g/jobs"');
  });
});
