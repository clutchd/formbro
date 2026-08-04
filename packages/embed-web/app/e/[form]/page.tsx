import { formbroApiUrl } from "@/config";
import { loadPublishedForm, publishedFormSubmissionUrl } from "@/published-form";
import { EmbedFrame } from "./embed-frame";
import { EmbeddedForm } from "./embedded-form";

export const revalidate = 60;
export const dynamic = "force-static";

export default async function HostedEmbedPage({ params }: { params: Promise<{ form: string }> }) {
  const { form: publicId } = await params;
  const apiUrl = formbroApiUrl();
  const result = await loadPublishedForm({ apiUrl, publicId });

  if (!result.ok) {
    return (
      <EmbedFrame publicId={publicId}>
        <main className="embed-state" data-error-code={result.code}>
          <div>
            <h1>{result.code === "FORM_CLOSED" ? "Form closed" : "Form unavailable"}</h1>
            <p>{result.message}</p>
          </div>
        </main>
      </EmbedFrame>
    );
  }

  return (
    <EmbedFrame publicId={publicId}>
      <main className="embed-shell">
        <EmbeddedForm
          snapshot={result.snapshot}
          submissionUrl={publishedFormSubmissionUrl(apiUrl, publicId)}
        />
        <footer className="embed-footer">Powered by FormBro</footer>
      </main>
    </EmbedFrame>
  );
}
