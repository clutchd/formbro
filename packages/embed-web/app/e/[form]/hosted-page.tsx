import { formbroApiUrl, formbroTelemetryUrl } from "@/config";
import { loadPublishedForm, publishedFormSubmissionUrl } from "@/published-form";
import { EmbedFrame } from "./embed-frame";
import { EmbeddedForm } from "./embedded-form";

function EmbedUnavailable({
  code,
  message,
  publicId,
}: {
  code: string;
  message: string;
  publicId: string;
}) {
  return (
    <EmbedFrame publicId={publicId}>
      <main className="embed-state" data-error-code={code}>
        <div>
          <h1>{code === "FORM_CLOSED" ? "Form closed" : "Form unavailable"}</h1>
          <p>{message}</p>
        </div>
      </main>
    </EmbedFrame>
  );
}

export async function HostedFormPage({
  allowRestricted,
  publicId,
}: {
  allowRestricted: boolean;
  publicId: string;
}) {
  const apiUrl = formbroApiUrl();
  const result = await loadPublishedForm({ apiUrl, publicId });

  if (!result.ok) {
    return <EmbedUnavailable code={result.code} message={result.message} publicId={publicId} />;
  }

  if (!allowRestricted && result.snapshot.embed.allowedOrigins.length > 0) {
    return (
      <EmbedUnavailable
        code="EMBED_RESTRICTED"
        message="This form requires its current domain-restricted embed code."
        publicId={publicId}
      />
    );
  }

  return (
    <EmbedFrame publicId={publicId}>
      <main
        className="embed-shell"
        data-color-scheme={result.snapshot.embed.appearance.colorScheme}
        data-density={result.snapshot.embed.appearance.density}
      >
        <EmbeddedForm
          snapshot={result.snapshot}
          submissionUrl={publishedFormSubmissionUrl(apiUrl, publicId)}
          telemetryUrl={formbroTelemetryUrl()}
        />
        <footer className="embed-footer">Powered by FormBro</footer>
      </main>
    </EmbedFrame>
  );
}
