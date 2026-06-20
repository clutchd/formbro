"use client";

import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { hasActiveWorkspaceSubscriptionStatus } from "@formbro/convex/billingUtils";
import { formatStorage, MEGABYTE, numberFormatter } from "@formbro/convex/lib";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { tuiFont, TypographyH1, TypographySubheading } from "@formbro/ui/typography";
import { RiArrowRightLine, RiBankCardLine, RiFileAiLine, RiFileTextLine } from "@remixicon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkspaceData } from "../_data-provider";
import { CreateForm } from "../create-form-form";
import { useWorkspaceSettingsPrewarmIntent } from "../settings/_data-provider";

type Form = NonNullable<ReturnType<typeof useWorkspaceData>["forms"]>[number];

const lastSubmissionStubs = ["18m ago", "3h ago", "Yesterday", "5d ago"] as const;
const createdDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function getStubFormMetrics(form: Form, index: number) {
  if (form.status === "draft") {
    return {
      submissions: 0,
      storageBytes: 0,
      lastSubmission: "No submissions yet",
    };
  }

  const submissions = (index + 1) * 47;

  return {
    submissions,
    storageBytes: (index + 1) * 9 * MEGABYTE,
    lastSubmission: lastSubmissionStubs[index % lastSubmissionStubs.length] ?? "Recently",
  };
}

function FormStatusBadge({ status }: { status: Form["status"] }) {
  let badgeStatus: "neutral" | "success" | "warning" | "error" = "neutral";
  switch (status) {
    case "open":
      badgeStatus = "success";
      break;
    case "closed":
      badgeStatus = "error";
      break;
    case "archived":
      badgeStatus = "warning";
      break;
  }

  return (
    <Badge
      variant="outline"
      status={badgeStatus}
      className="px-1.5 py-0 text-[10px] leading-4 tracking-normal uppercase"
    >
      {status}
    </Badge>
  );
}

function FormMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className={twx(tuiFont, "text-muted-foreground")}>{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function FormListRow({
  form,
  index,
  workspaceSlug,
}: {
  form: Form;
  index: number;
  workspaceSlug: string;
}) {
  const metrics = getStubFormMetrics(form, index);

  return (
    <Link
      href={`/dashboard/${workspaceSlug}/${form.slug}`}
      prefetch={false}
      className="group/row grid gap-4 border border-b-0 px-5 py-4 transition-colors last:border-b hover:bg-accent md:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(7rem,0.5fr))_auto] md:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center border">
          <RiFileTextLine className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold">{form.name}</p>
            <FormStatusBadge status={form.status} />
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            /{form.slug} · Created {createdDateFormatter.format(form._creationTime)}
          </p>
        </div>
      </div>

      <FormMetric label="Submissions" value={numberFormatter.format(metrics.submissions)} />
      <FormMetric label="Storage" value={formatStorage(metrics.storageBytes)} />
      <FormMetric label="Last Submission" value={metrics.lastSubmission} />

      <RiArrowRightLine className="hidden size-4 text-muted-foreground transition-transform group-hover/row:translate-x-1 md:block" />
    </Link>
  );
}

export default function FormsDashboardContent() {
  const { workspace: workspaceSlug } = useParams<{ workspace: string }>();
  const { forms, workspace } = useWorkspaceData();
  const settingsPrewarm = useWorkspaceSettingsPrewarmIntent(workspaceSlug);

  if (!forms) {
    return <Loading title="forms" />;
  }

  if (workspace && !hasActiveWorkspaceSubscriptionStatus(workspace)) {
    return (
      <PageState
        icon={<RiBankCardLine />}
        title="Subscription required"
        description="Choose a plan to create forms and start collecting submissions."
      >
        <Button asChild>
          <Link {...settingsPrewarm}>
            <RiBankCardLine className="size-4" />
            Manage Billing
          </Link>
        </Button>
      </PageState>
    );
  }

  if (forms.length === 0) {
    return (
      <PageState
        icon={<RiFileAiLine />}
        title="No forms yet"
        description="Create your first form to start collecting data"
      >
        <CreateForm />
      </PageState>
    );
  }

  return (
    <Page>
      <div className="mb-6 flex flex-row items-center justify-between">
        <div>
          <TypographyH1>All Forms</TypographyH1>
          <TypographySubheading>
            {forms.length} form{forms.length === 1 ? "" : "s"}
          </TypographySubheading>
        </div>
        <CreateForm />
      </div>
      {forms.map((form, index) => (
        <FormListRow key={form._id} form={form} index={index} workspaceSlug={workspaceSlug} />
      ))}
    </Page>
  );
}
