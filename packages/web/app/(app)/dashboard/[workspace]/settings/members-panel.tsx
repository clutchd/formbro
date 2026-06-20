import { initials } from "@formbro/shared/names";
import { twx } from "@formbro/shared/twx";
import { Avatar, AvatarFallback, AvatarImage } from "@formbro/ui/avatar";
import { Badge } from "@formbro/ui/badge";
import { Card } from "@formbro/ui/card";
import { tuiFont, TypographySubheading } from "@formbro/ui/typography";
import { useRequiredWorkspaceSettingsData } from "./_data-provider";

type Member = NonNullable<
  NonNullable<ReturnType<typeof useRequiredWorkspaceSettingsData>>["members"]
>[number];

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
  const { members } = useRequiredWorkspaceSettingsData();

  return (
    <div className="flex h-full flex-col">
      <TypographySubheading className={twx(tuiFont, "mb-3")}>
        Members - {members.length}
      </TypographySubheading>
      <Card className="flex flex-1 flex-col">
        <ul className="space-y-4">
          {members.map((member) => (
            <li key={member._id}>
              <MemberRow member={member} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
