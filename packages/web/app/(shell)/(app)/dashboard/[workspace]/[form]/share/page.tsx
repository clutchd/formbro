"use client";

import type { Doc } from "@formbro/convex/_generated/dataModel";
import { APP_URL, EMBED_URL } from "@formbro/shared/brand";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { Input } from "@formbro/ui/input";
import { tuiFont, TypographyH2, TypographyP } from "@formbro/ui/typography";
import { RiClipboardLine, RiExternalLinkLine, RiFileTextLine } from "@remixicon/react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { buildEmbedCode } from "@/lib/embed-code";
import { getFormMetadata, getOpenGraphImageUrl } from "@/lib/form-metadata";
import { useRequiredWorkspaceFormData } from "../_data-provider";

function getShareMessage(status: Doc<"forms">["status"]) {
  switch (status) {
    case "open":
      return "Your form is live! Copy this link to share it anywhere.";
    case "draft":
      return "Your form is not quite ready to share. Publish it to start collecting responses!";
    case "closed":
      return "Your form is closed to new submissions, but the link still works if you need to share it.";
    default: {
      const exhaustiveStatus: never = status;
      return exhaustiveStatus;
    }
  }
}

export default function ShareFormPage() {
  const { form, workspace } = useRequiredWorkspaceFormData();
  const [copied, setCopied] = useState<"automatic" | "iframe" | "share" | null>(null);
  const [embedMethod, setEmbedMethod] = useState<"automatic" | "iframe">("automatic");
  const shareId = useId();
  const shareUrl = `${APP_URL}/f/${form.slug}`;
  const embedCode = buildEmbedCode({
    embedUrl: EMBED_URL,
    formName: form.name,
    publicId: form.slug,
  });
  const canEmbed = form.status !== "draft" && Boolean(form.publishedSchemaId);
  const metadata = getFormMetadata({
    formName: form.name,
    formSlug: form.slug,
    workspaceName: workspace.name,
    baseUrl: APP_URL,
  });
  const ogImageUrl = metadata.openGraph?.images
    ? getOpenGraphImageUrl(metadata.openGraph.images)
    : undefined;

  const copyToClipboard = async (
    value: string,
    target: "automatic" | "iframe" | "share",
    successMessage: string,
  ) => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API is unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCopied(target);
      toast.success(successMessage);
      setTimeout(() => setCopied(null), 3000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error(error);
    }
  };

  return (
    <Page className="space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5 lg:gap-4">
        <Card className="gap-5 lg:col-span-3">
          <div>
            <TypographyH2>Share Link</TypographyH2>
            <TypographyP className="text-sm text-muted-foreground">
              {getShareMessage(form.status)}
            </TypographyP>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Input id={shareId} value={shareUrl} readOnly className="font-mono text-xs" />
            <Button onClick={() => copyToClipboard(shareUrl, "share", "Share link copied")}>
              <RiClipboardLine className="size-4" />
              {copied === "share" ? "Copied" : "Copy"}
            </Button>
            <Button asChild variant="outline">
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <RiExternalLinkLine className="size-4" />
                Open
              </a>
            </Button>
          </div>
        </Card>

        <Card className="gap-5 rounded-none lg:col-span-2">
          <div>
            <TypographyH2>Link Preview</TypographyH2>
            <TypographyP className="text-sm text-muted-foreground">
              This is how your link appears when shared on social media, in messages, and more.
            </TypographyP>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-muted/20">
              <div className="space-y-1 px-3.5 py-3">
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  {metadata.openGraph?.siteName}
                </p>
                <p className="text-sm leading-snug font-semibold">
                  {metadata.openGraph?.title?.toString()}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {metadata.openGraph?.description}
                </p>
              </div>
              <div className="flex aspect-2/1 items-center justify-center border-t bg-muted/40">
                {ogImageUrl ? (
                  <img src={ogImageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="flex size-10 items-center justify-center border bg-background">
                      <RiFileTextLine className="size-5" />
                    </div>
                    <p className={twx(tuiFont, "text-muted-foreground")}>og:image not set</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TypographyH2>Embed Form</TypographyH2>
              {form.status === "open" ? (
                <Badge status="success">Live</Badge>
              ) : form.status === "closed" ? (
                <Badge status="warning">Closed</Badge>
              ) : (
                <Badge status="neutral">Publish required</Badge>
              )}
            </div>
            <TypographyP className="max-w-2xl text-sm text-muted-foreground">
              Add this form to any website. Published changes are reflected automatically without
              replacing the embed code.
            </TypographyP>
          </div>
          {canEmbed ? (
            <Button asChild variant="outline">
              <a href={embedCode.hostedUrl} target="_blank" rel="noreferrer">
                <RiExternalLinkLine className="size-4" />
                Preview embed
              </a>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <RiExternalLinkLine className="size-4" />
              Preview embed
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2" aria-label="Embed method">
            <Button
              type="button"
              size="sm"
              variant={embedMethod === "automatic" ? "default" : "outline"}
              onClick={() => setEmbedMethod("automatic")}
              aria-pressed={embedMethod === "automatic"}
            >
              Auto-resizing
            </Button>
            <Button
              type="button"
              size="sm"
              variant={embedMethod === "iframe" ? "default" : "outline"}
              onClick={() => setEmbedMethod("iframe")}
              aria-pressed={embedMethod === "iframe"}
            >
              Plain iframe
            </Button>
            {embedMethod === "automatic" ? <Badge status="info">Recommended</Badge> : null}
          </div>

          <div className="overflow-hidden rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {embedMethod === "automatic" ? "Responsive embed" : "Fixed-height fallback"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {embedMethod === "automatic"
                    ? "Loads server-rendered markup and follows the form height automatically."
                    : "Works without the loader script; adjust the height for your page."}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  copyToClipboard(embedCode[embedMethod], embedMethod, "Embed code copied")
                }
                disabled={!canEmbed}
              >
                <RiClipboardLine className="size-4" />
                {copied === embedMethod ? "Copied" : "Copy code"}
              </Button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
              <code>{embedCode[embedMethod]}</code>
            </pre>
          </div>

          {!canEmbed ? (
            <p className="text-sm text-muted-foreground">
              Publish this form before copying the embed code. The same snippet will continue to
              work for every future revision.
            </p>
          ) : (
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <p>Server-rendered form markup</p>
              <p>CDN-served page and loader</p>
              <p>Published updates within about 60 seconds</p>
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}
