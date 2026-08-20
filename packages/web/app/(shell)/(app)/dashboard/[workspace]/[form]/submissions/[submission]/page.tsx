"use client";

import type { FunctionReturnType } from "convex/server";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@formbro/ui/empty";
import { TypographyH1, TypographyH2, TypographySubheading } from "@formbro/ui/typography";
import {
  RiArrowLeftLine,
  RiAttachmentLine,
  RiClipboardLine,
  RiDownloadLine,
  RiFileTextLine,
} from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { useRequiredWorkspaceFormData } from "../../_data-provider";

type SubmissionResult = FunctionReturnType<typeof api.submissions.get>;
type SubmissionData = NonNullable<Extract<SubmissionResult, { ok: true }>["data"]>;
type SubmissionField = SubmissionData["pages"][number]["fields"][number];

const submittedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatSubmittedAt(value: number) {
  return submittedAtFormatter.format(new Date(value));
}

function formatFileSize(bytes: number | null) {
  if (bytes === null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function SubmissionAnswer({ field }: { field: SubmissionField }) {
  if (!field.value) {
    return <span className="text-muted-foreground italic">No answer</span>;
  }

  if (field.type === "email") {
    return (
      <a className="underline underline-offset-4" href={`mailto:${field.value}`}>
        {field.value}
      </a>
    );
  }

  if (field.type === "link") {
    const href = getExternalUrl(field.value);
    if (href) {
      return (
        <a
          className="break-all underline underline-offset-4"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {field.value}
        </a>
      );
    }
  }

  return <span className="whitespace-pre-wrap">{field.value}</span>;
}

function SubmissionMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1 p-4">
      <dt className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium">{value}</dd>
    </div>
  );
}

function SubmissionResponses({ data }: { data: SubmissionData }) {
  if (data.counts.fields === 0) {
    return (
      <Card className="min-h-64">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiFileTextLine className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No response fields</EmptyTitle>
            <EmptyDescription>
              This submission did not contain any field responses.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {data.pages.map((page, pageIndex) => (
        <Card key={`${page.label ?? "page"}-${pageIndex}`} className="overflow-hidden p-0">
          <div className="border-b bg-muted/25 px-5 py-4 sm:px-6">
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {data.pages.length > 1 ? `Page ${pageIndex + 1}` : "Response"}
            </p>
            <TypographyH2 className="mt-0.5">
              {page.label ?? (data.pages.length > 1 ? `Page ${pageIndex + 1}` : "Responses")}
            </TypographyH2>
          </div>

          <dl className="divide-y">
            {page.fields.map((field) => (
              <div
                key={field.id}
                className="grid min-w-0 gap-3 px-5 py-5 sm:px-6 md:grid-cols-[minmax(11rem,0.4fr)_minmax(0,1fr)] md:gap-8"
              >
                <dt className="min-w-0">
                  <p className="text-sm leading-5 font-medium">{field.label}</p>
                  <p className="mt-1 truncate font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {field.type ?? field.id}
                  </p>
                </dt>
                <dd className="min-w-0 text-sm leading-6 break-words">
                  <SubmissionAnswer field={field} />
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  );
}

export default function SubmissionPage() {
  const { submission: submissionId } = useParams<{ submission: string }>();
  const { form, workspace } = useRequiredWorkspaceFormData();
  const submission = useQuery(api.submissions.get, { formId: form._id, submissionId });
  const [copied, setCopied] = useState(false);
  const submissionsPath = `/dashboard/${workspace.slug}/${form.slug}/submissions`;

  if (submission === undefined) {
    return <Loading title="submission" />;
  }

  if (!submission.ok) {
    return (
      <PageState
        title="Submission unavailable"
        description={getErrorMessage(submission.error)}
        status="error"
        icon={<RiFileTextLine className="size-5" />}
      >
        <Button asChild variant="outline">
          <Link href={submissionsPath}>
            <RiArrowLeftLine className="size-4" /> All submissions
          </Link>
        </Button>
      </PageState>
    );
  }

  const data = submission.data;
  const submittedAt = formatSubmittedAt(data.submission.submittedTime);

  async function copySubmissionLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Submission link copied");
      window.setTimeout(() => setCopied(false), 2_000);
    } catch (error) {
      toast.error("Failed to copy submission link");
      console.error(error);
    }
  }

  return (
    <Page className="h-full max-w-5xl overflow-y-auto py-6">
      <Button asChild variant="link" size="dense" className="-ml-2 px-2">
        <Link href={submissionsPath}>
          <RiArrowLeftLine className="size-4" /> All submissions
        </Link>
      </Button>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <TypographyH1>Submission</TypographyH1>
          <TypographySubheading>Submitted {submittedAt}</TypographySubheading>
        </div>
        <Button type="button" variant="outline" onClick={copySubmissionLink}>
          <RiClipboardLine className="size-4" /> {copied ? "Copied" : "Copy link"}
        </Button>
      </div>

      <dl className="mt-5 grid divide-y border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <SubmissionMetric label="Submitted" value={submittedAt} />
        <SubmissionMetric
          label="Answered"
          value={`${data.counts.answered} of ${data.counts.fields} fields`}
        />
        <SubmissionMetric
          label="Response ID"
          value={
            <span className="block truncate font-mono text-xs" title={data.submission.id}>
              {data.submission.id}
            </span>
          }
        />
      </dl>

      {data.files.length > 0 ? (
        <Card className="mt-5 gap-4">
          <div>
            <TypographyH2>Attachments</TypographyH2>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.files.length} file{data.files.length === 1 ? "" : "s"} included with this
              submission.
            </p>
          </div>
          <div className="grid gap-2">
            {data.files.map((file) => (
              <div
                key={file.id}
                className="flex min-w-0 items-center gap-3 rounded-md border px-3 py-2.5"
              >
                <RiAttachmentLine className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {file.contentType ?? "File"} · {formatFileSize(file.size)}
                  </p>
                </div>
                {file.url ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={file.url} target="_blank" rel="noreferrer">
                      <RiDownloadLine className="size-3" /> Download
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="mt-5 pb-6">
        <SubmissionResponses data={data} />
      </div>
    </Page>
  );
}
