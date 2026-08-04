function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildEmbedCode({
  embedUrl,
  formName,
  publicId,
}: {
  embedUrl: string;
  formName: string;
  publicId: string;
}) {
  const embedOrigin = new URL(embedUrl).origin;
  const hostedUrl = `${embedOrigin}/e/${encodeURIComponent(publicId)}`;
  const escapedId = escapeHtmlAttribute(publicId);
  const escapedName = escapeHtmlAttribute(formName);

  return {
    hostedUrl,
    automatic: `<div data-formbro-id="${escapedId}" data-formbro-title="${escapedName}"></div>\n<script async src="${embedOrigin}/embed.js"></script>`,
    iframe: `<iframe src="${hostedUrl}" title="${escapedName}" width="100%" height="640" loading="eager" style="border: 0; display: block;"></iframe>`,
  };
}
