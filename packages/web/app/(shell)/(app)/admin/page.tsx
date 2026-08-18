import { Badge } from "@formbro/ui/badge";
import { Card } from "@formbro/ui/card";
import { TypographyH1, TypographyH2, TypographySubheading } from "@formbro/ui/typography";
import { RiFileAiLine, RiFileCopy2Line, RiShieldCheckLine } from "@remixicon/react";
import { Page } from "@/components/page";

const ADMIN_TOOLS = [
  {
    title: "Form tooling",
    description: "Build, inspect, and manage FormBro forms from one internal workspace.",
    icon: RiFileAiLine,
  },
  {
    title: "Templates",
    description: "Create and publish reusable templates for the public FormBro experience.",
    icon: RiFileCopy2Line,
  },
];

export default function AdminPage() {
  return (
    <Page className="max-w-5xl py-12">
      <div className="mb-10 max-w-2xl">
        <Badge status="success" className="mb-4">
          <RiShieldCheckLine /> Admin only
        </Badge>
        <TypographyH1>Internal tools</TypographyH1>
        <TypographySubheading>
          A private home for FormBro administration and publishing workflows.
        </TypographySubheading>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ADMIN_TOOLS.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="gap-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-10 items-center justify-center border bg-muted text-foreground">
                <Icon className="size-5" />
              </div>
              <Badge status="neutral">Planned</Badge>
            </div>
            <div>
              <TypographyH2>{title}</TypographyH2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
