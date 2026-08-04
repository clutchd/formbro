function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function createGuardedEmbedResponse({
  allowedOrigins,
  nonce,
  publicId,
}: {
  allowedOrigins: string[];
  nonce: string;
  publicId: string;
}) {
  const encodedId = encodeURIComponent(publicId);
  const escapedNonce = escapeHtmlAttribute(nonce);
  const contentSecurityPolicy = [
    "default-src 'none'",
    "frame-src 'self'",
    `frame-ancestors ${allowedOrigins.join(" ")}`,
    `script-src 'nonce-${nonce}'`,
    "style-src 'unsafe-inline'",
  ].join("; ");
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Form</title>
    <style>html,body{margin:0;min-width:0;background:transparent}iframe{display:block;width:100%;height:160px;border:0}</style>
  </head>
  <body>
    <iframe src="/i/${encodedId}" title="Form" scrolling="no" sandbox="allow-forms allow-same-origin allow-scripts" aria-busy="true"></iframe>
    <script nonce="${escapedNonce}">
      const frame = document.querySelector("iframe");
      window.addEventListener("message", (event) => {
        if (event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
        const message = event.data;
        if (!message || message.source !== "formbro:embed" || message.protocolVersion !== 1 || message.publicId !== ${JSON.stringify(publicId).replaceAll("<", "\\u003c")}) return;
        if ((message.event === "ready" || message.event === "resize") && Number.isFinite(message.height)) {
          const height = Math.min(10000, Math.max(160, Math.ceil(message.height)));
          frame.style.height = height + "px";
          message.height = height;
        }
        if (message.event === "ready") frame.removeAttribute("aria-busy");
        window.parent.postMessage(message, "*");
      });
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Content-Security-Policy": contentSecurityPolicy,
      "Content-Type": "text/html; charset=utf-8",
      "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
