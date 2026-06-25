"use client";

import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { initials } from "@formbro/shared/names";
import { twx } from "@formbro/shared/twx";
import { Avatar, AvatarFallback, AvatarImage } from "@formbro/ui/avatar";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { Input } from "@formbro/ui/input";
import { Label } from "@formbro/ui/label";
import { Spinner } from "@formbro/ui/spinner";
import { tuiFont, TypographySubheading } from "@formbro/ui/typography";
import { RiCloseLine, RiDeleteBinLine, RiMailLine, RiUserAddLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useId, useReducer, type FormEvent } from "react";
import { toast } from "sonner";
import { useRequiredWorkspaceSettingsData } from "./_data-provider";

type SettingsData = NonNullable<ReturnType<typeof useRequiredWorkspaceSettingsData>>;
type Member = SettingsData["members"][number];
type Invite = SettingsData["invites"][number];

const inviteExpirationFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatInviteExpiration(expiresTime: number) {
  return inviteExpirationFormatter.format(new Date(expiresTime));
}

type MembersPanelState = {
  cancelingInviteId: string | null;
  email: string;
  inviteDialogOpen: boolean;
  isInviting: boolean;
  removingMemberId: string | null;
};

type MembersPanelAction =
  | { type: "cancel-invite-finished" }
  | { type: "cancel-invite-started"; inviteId: string }
  | { type: "invite-email-changed"; email: string }
  | { type: "invite-finished"; sent: boolean }
  | { type: "invite-started" }
  | { type: "remove-member-finished" }
  | { type: "remove-member-started"; memberId: string }
  | { type: "set-invite-dialog-open"; open: boolean };

const initialMembersPanelState: MembersPanelState = {
  cancelingInviteId: null,
  email: "",
  inviteDialogOpen: false,
  isInviting: false,
  removingMemberId: null,
};

function membersPanelReducer(
  state: MembersPanelState,
  action: MembersPanelAction,
): MembersPanelState {
  switch (action.type) {
    case "cancel-invite-finished":
      return { ...state, cancelingInviteId: null };
    case "cancel-invite-started":
      return { ...state, cancelingInviteId: action.inviteId };
    case "invite-email-changed":
      return { ...state, email: action.email };
    case "invite-finished":
      return {
        ...state,
        email: action.sent ? "" : state.email,
        inviteDialogOpen: action.sent ? false : state.inviteDialogOpen,
        isInviting: false,
      };
    case "invite-started":
      return { ...state, isInviting: true };
    case "remove-member-finished":
      return { ...state, removingMemberId: null };
    case "remove-member-started":
      return { ...state, removingMemberId: action.memberId };
    case "set-invite-dialog-open":
      return { ...state, inviteDialogOpen: action.open };
  }
}

function MemberRoleBadge({ role }: { role: Member["role"] }) {
  const status = role === "owner" ? "success" : role === "admin" ? "info" : "neutral";

  return (
    <Badge variant="outline" status={status} className="uppercase">
      {role}
    </Badge>
  );
}

function MemberRow({
  canRemove,
  isRemoving,
  member,
  onRemove,
}: {
  canRemove: boolean;
  isRemoving: boolean;
  member: Member;
  onRemove: (member: Member) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        className={`size-9 shrink-0 text-sm font-medium ${member.avatarUrl ? "border-0" : "border"}`}
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
      {canRemove ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={`Remove ${member.name}`}
          disabled={isRemoving}
          onClick={() => onRemove(member)}
        >
          {isRemoving ? <Spinner /> : <RiDeleteBinLine className="size-4" />}
        </Button>
      ) : null}
    </div>
  );
}

function InviteRow({
  invite,
  isCanceling,
  onCancel,
}: {
  invite: Invite;
  isCanceling: boolean;
  onCancel: (invite: Invite) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-background">
        <RiMailLine className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={twx(tuiFont, "truncate text-sm font-medium lowercase")}>{invite.email}</p>
        <p className="text-xs text-muted-foreground">
          Expires {formatInviteExpiration(invite.expiresTime)}
        </p>
      </div>
      <Badge variant="outline" status="warning" className="uppercase">
        Pending
      </Badge>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        aria-label={`Cancel invite for ${invite.email}`}
        disabled={isCanceling}
        onClick={() => onCancel(invite)}
      >
        {isCanceling ? <Spinner /> : <RiCloseLine className="size-4" />}
      </Button>
    </div>
  );
}

export function MembersPanel() {
  const { invites, members, workspace } = useRequiredWorkspaceSettingsData();
  const inviteMember = useMutation(api.workspace.inviteMember);
  const cancelInvite = useMutation(api.workspace.cancelInvite);
  const removeMember = useMutation(api.workspace.removeMember);
  const emailInputId = useId();
  const [state, dispatch] = useReducer(membersPanelReducer, initialMembersPanelState);
  const canManageMembers =
    workspace.role === "owner" || workspace.role === "admin" || workspace.role === "member";

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = state.email.trim();
    if (!nextEmail || state.isInviting) return;

    dispatch({ type: "invite-started" });
    try {
      const result = await inviteMember({ workspaceId: workspace._id, email: nextEmail });
      if (!result.ok) {
        toast.error("Could not send invite", { description: getErrorMessage(result.error) });
        return;
      }

      toast.success("Invite sent");
      dispatch({ type: "invite-finished", sent: true });
    } catch (error) {
      toast.error("Could not send invite", { description: getErrorMessage(error) });
    } finally {
      dispatch({ type: "invite-finished", sent: false });
    }
  }

  async function handleCancelInvite(invite: Invite) {
    if (state.cancelingInviteId) return;

    dispatch({ type: "cancel-invite-started", inviteId: invite._id });
    try {
      const result = await cancelInvite({ workspaceId: workspace._id, inviteId: invite._id });
      if (!result.ok) {
        toast.error("Could not cancel invite", { description: getErrorMessage(result.error) });
        return;
      }

      toast.success("Invite canceled");
    } catch (error) {
      toast.error("Could not cancel invite", { description: getErrorMessage(error) });
    } finally {
      dispatch({ type: "cancel-invite-finished" });
    }
  }

  async function handleRemoveMember(member: Member) {
    if (state.removingMemberId) return;

    dispatch({ type: "remove-member-started", memberId: member._id });
    try {
      const result = await removeMember({ workspaceId: workspace._id, memberId: member._id });
      if (!result.ok) {
        toast.error("Could not remove member", { description: getErrorMessage(result.error) });
        return;
      }

      toast.success("Member removed");
    } catch (error) {
      toast.error("Could not remove member", { description: getErrorMessage(error) });
    } finally {
      dispatch({ type: "remove-member-finished" });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <TypographySubheading className={twx(tuiFont)}>
          Members - {members.length}
        </TypographySubheading>
        {canManageMembers ? (
          <Dialog
            open={state.inviteDialogOpen}
            onOpenChange={(open) => dispatch({ type: "set-invite-dialog-open", open })}
          >
            <DialogTrigger asChild>
              <Button type="button" size="dense">
                <RiUserAddLine className="size-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Invite member</DialogTitle>
                  <DialogDescription>
                    Send an invite to join {workspace.name}. New members can edit forms, review
                    submissions, and update workspace settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-5 space-y-2">
                  <Label htmlFor={emailInputId}>Email address</Label>
                  <Input
                    id={emailInputId}
                    type="email"
                    value={state.email}
                    autoComplete="email"
                    placeholder="teammate@example.com"
                    disabled={state.isInviting}
                    onChange={(event) =>
                      dispatch({ type: "invite-email-changed", email: event.target.value })
                    }
                  />
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={state.isInviting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={state.isInviting || !state.email.trim()}>
                    {state.isInviting ? <Spinner /> : <RiMailLine className="size-4" />}
                    Send invite
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Card className="flex flex-1 flex-col gap-6">
        <ul className="space-y-4">
          {members.map((member) => (
            <li key={member._id}>
              <MemberRow
                canRemove={canManageMembers && member.role !== "owner"}
                isRemoving={state.removingMemberId === member._id}
                member={member}
                onRemove={handleRemoveMember}
              />
            </li>
          ))}
        </ul>

        {invites.length > 0 ? (
          <div className="space-y-3 border-t pt-5">
            <TypographySubheading className={twx(tuiFont, "text-muted-foreground")}>
              Pending invites - {invites.length}
            </TypographySubheading>
            <ul className="space-y-4">
              {invites.map((invite) => (
                <li key={invite._id}>
                  <InviteRow
                    invite={invite}
                    isCanceling={state.cancelingInviteId === invite._id}
                    onCancel={handleCancelInvite}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
