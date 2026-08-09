import { describe, expect, it } from "bun:test";
import { renderToReadableStream } from "react-dom/server";
import SubmissionNotificationComponent, {
  SubmissionNotificationSubject,
} from "./submission-notification";

async function renderSubmissionNotification() {
  const stream = await renderToReadableStream(
    <SubmissionNotificationComponent
      formName="Customer intake"
      submittedTime={0}
      submissionsUrl="https://example.com/submissions"
      workspaceName="Acme Inc"
    />,
  );

  return new Response(stream).text();
}

describe("SubmissionNotificationComponent", () => {
  it("renders the form, workspace, and submissions link", async () => {
    const html = await renderSubmissionNotification();

    expect(html).toContain("Customer intake received a new submission.");
    expect(html).toContain("Acme Inc");
    expect(html).toContain('href="https://example.com/submissions"');
  });

  it("builds a form-specific subject", () => {
    expect(SubmissionNotificationSubject({ formName: "Customer intake" })).toBe(
      "New submission for Customer intake",
    );
  });

  it("keeps line breaks out of the subject", () => {
    expect(SubmissionNotificationSubject({ formName: "Customer\r\nintake" })).toBe(
      "New submission for Customer intake",
    );
  });
});
