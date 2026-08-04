function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildEmbedCode({
  allowedOrigins = [],
  embedUrl,
  formName,
  publicId,
}: {
  allowedOrigins?: string[];
  embedUrl: string;
  formName: string;
  publicId: string;
}) {
  const embedOrigin = new URL(embedUrl).origin;
  const guarded = allowedOrigins.length > 0;
  const route = guarded ? "g" : "e";
  const hostedUrl = `${embedOrigin}/${route}/${encodeURIComponent(publicId)}`;
  const escapedId = escapeHtmlAttribute(publicId);
  const escapedName = escapeHtmlAttribute(formName);

  return {
    hostedUrl,
    automatic: `<div data-formbro-id="${escapedId}" data-formbro-title="${escapedName}"${guarded ? " data-formbro-guarded" : ""}></div>\n<script async src="${embedOrigin}/embed.js"></script>`,
    iframe: `<iframe src="${hostedUrl}" title="${escapedName}" width="100%" height="640" loading="eager" style="border: 0; display: block;"></iframe>`,
    next: `import "@formbro/embed-react/styles.css";\nimport { FormBroForm } from "@formbro/embed-react/next";\n\nexport default function Page() {\n  return <FormBroForm publicId={${JSON.stringify(publicId)}} />;\n}`,
  };
}
