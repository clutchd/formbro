import type { FunctionReturnType } from "convex/server";
import { api } from "@formbro/convex/_generated/api";
import { initials } from "@formbro/shared/names";
import { twx } from "@formbro/shared/twx";
import { Avatar, AvatarFallback, AvatarImage } from "@formbro/ui/avatar";
import { Badge } from "@formbro/ui/badge";
import { Card } from "@formbro/ui/card";
import { Spinner } from "@formbro/ui/spinner";
import { tuiFont, TypographySubheading } from "@formbro/ui/typography";
import { useQuery } from "convex/react";
import { useRequiredWorkspaceData } from "../data-provider";

type Member = Extract<
  FunctionReturnType<typeof api.workspace.listMembers>,
  { ok: true }
>["data"][number];

function MemberRoleBadge({ role }: { role: Member["role"] }) {
  const status = role === "owner" ? "success" : role === "admin" ? "info" : "neutral";

  return (
    <Badge variant="outline" status={status} className="uppercase">
      {role}
    </Badge>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        className={`size-8 shrink-0 text-sm font-medium ${member.avatarUrl ? "border-0" : "border"}`}
      >
        {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
        <AvatarFallback>{initials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.name}</p>
        <p className={twx(tuiFont, "truncate text-xs text-muted-foreground lowercase")}>
          {member.email}
        </p>
      </div>
      <MemberRoleBadge role={member.role} />
    </div>
  );
}

export function MembersPanel() {
  const { workspace } = useRequiredWorkspaceData();
  const membersResult = useQuery(api.workspace.listMembers, { workspaceId: workspace._id });
  const members = membersResult?.ok ? membersResult.data : undefined;

  return (
    <Card className="flex flex-col">
      <TypographySubheading className={twx(tuiFont, "mb-5")}>Members</TypographySubheading>

      {members === undefined ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <ul className="space-y-4">
          {members.map((member) => (
            <li key={member._id}>
              <MemberRow member={member} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
