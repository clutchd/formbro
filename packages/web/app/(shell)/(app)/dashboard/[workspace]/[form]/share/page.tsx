"use client";

import type { Doc } from "@formbro/convex/_generated/dataModel";
import { APP_URL } from "@formbro/shared/brand";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { Input } from "@formbro/ui/input";
import { tuiFont, TypographyH2, TypographyP } from "@formbro/ui/typography";
import { RiClipboardLine, RiExternalLinkLine, RiFileTextLine } from "@remixicon/react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
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
  const [copied, setCopied] = useState(false);
  const shareId = useId();
  const shareUrl = `${APP_URL}/f/${form.slug}`;
  const metadata = getFormMetadata({
    formName: form.name,
    formSlug: form.slug,
    workspaceName: workspace.name,
    baseUrl: APP_URL,
  });
  const ogImageUrl = metadata.openGraph?.images
    ? getOpenGraphImageUrl(metadata.openGraph.images)
    : undefined;

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Share link copied");
        setTimeout(() => setCopied(false), 3000);
      }
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
            <Button onClick={copyToClipboard}>
              <RiClipboardLine className="size-4" />
              {copied ? "Copied" : "Copy"}
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
    </Page>
  );
}
