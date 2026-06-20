"use client";

import { Badge } from "@formbro/ui/badge";
import { Card } from "@formbro/ui/card";
import { TypographyH1, TypographyP, TypographySubheading } from "@formbro/ui/typography";
import { Page } from "@/components/page";
import { useRequiredWorkspaceFormData } from "./_data-provider";

export default function WorkspaceFormPage() {
  const { form, workspace } = useRequiredWorkspaceFormData();

  return (
    <Page className="space-y-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <TypographyH1>{form.name}</TypographyH1>
          <FormStatusBadge status={form.status} />
        </div>
        <TypographySubheading>
          /{workspace.slug}/{form.slug}
        </TypographySubheading>
      </div>

      <Card>
        <TypographySubheading className="text-foreground">Builder</TypographySubheading>
        <TypographyP className="mt-2 text-sm text-muted-foreground">
          Form editing tools will appear here.
        </TypographyP>
      </Card>
    </Page>
  );
}
