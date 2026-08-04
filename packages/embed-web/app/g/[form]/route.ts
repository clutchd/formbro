import { normalizeEmbedAllowedOrigins } from "@formbro/core/embed";
import { formbroApiUrl } from "@/config";
import { createGuardedEmbedResponse } from "@/embed-policy";
import { loadPublishedForm } from "@/published-form";

export async function GET(request: Request, { params }: { params: Promise<{ form: string }> }) {
  const { form: publicId } = await params;
  const result = await loadPublishedForm({ apiUrl: formbroApiUrl(), publicId });

  if (!result.ok) {
    return new Response(result.message, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors *",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
      status: result.status,
    });
  }

  const allowedOrigins = normalizeEmbedAllowedOrigins(result.snapshot.embed.allowedOrigins);

  if (allowedOrigins.length === 0) {
    return Response.redirect(new URL(`/e/${encodeURIComponent(publicId)}`, request.url), 307);
  }

  return createGuardedEmbedResponse({
    allowedOrigins,
    nonce: crypto.randomUUID(),
    publicId,
  });
}
