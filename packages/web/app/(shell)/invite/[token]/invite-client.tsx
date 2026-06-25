"use client";

import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { Spinner } from "@formbro/ui/spinner";
import { RiCheckboxCircleLine, RiCloseCircleLine, RiMailOpenLine } from "@remixicon/react";
import { useAppData } from "app/_data-provider";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { inviteSignInHref, inviteSignUpHref } from "@/lib/auth/callback-url";

function emailMatchesInvite(userEmail: string | null | undefined, inviteEmail: string) {
  return userEmail?.trim().toLowerCase() === inviteEmail.trim().toLowerCase();
}

export function InviteClient({ token }: { token: string }) {
  const router = useRouter();
  const { authUser } = useAppData();
  const invite = useQuery(api.workspace.getInvite, { token });
  const acceptInvite = useMutation(api.workspace.acceptInvite);
  const [isAccepting, setIsAccepting] = useState(false);

  if (invite === undefined) {
    return <Loading title="invite" />;
  }

  if (!invite.ok) {
    return (
      <PageState
        icon={<RiCloseCircleLine className="size-5" />}
        title="Invite unavailable"
        description={getErrorMessage(invite.error)}
        status="error"
      />
    );
  }

  const signedInEmail = authUser?.ok ? authUser.data.email : null;
  const canAcceptInvite = Boolean(
    authUser?.ok && emailMatchesInvite(signedInEmail, invite.data.email),
  );

  if (invite.data.status !== "pending") {
    const title =
      invite.data.status === "accepted"
        ? "Invite already accepted"
        : invite.data.status === "expired"
          ? "Invite expired"
          : "Invite canceled";

    return (
      <PageState
        icon={<RiCloseCircleLine className="size-5" />}
        title={title}
        description={`Ask a workspace owner for a fresh invite to ${invite.data.workspaceName}.`}
        status="warning"
      />
    );
  }

  async function handleAccept() {
    if (isAccepting) return;

    setIsAccepting(true);
    try {
      const result = await acceptInvite({ token });
      if (!result.ok) {
        toast.error("Could not accept invite", { description: getErrorMessage(result.error) });
        return;
      }

      toast.success("Workspace joined");
      router.replace(`/dashboard/${result.data.workspaceSlug}`);
    } catch (error) {
      toast.error("Could not accept invite", { description: getErrorMessage(error) });
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-4 py-16">
      <Card className="w-full gap-6 p-8">
        <div className="flex size-11 items-center justify-center rounded-full border bg-background">
          <RiMailOpenLine className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Workspace invite
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Join {invite.data.workspaceName}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            This invite was sent to{" "}
            <span className="font-medium text-foreground">{invite.data.email}</span>. Sign in with
            that email to join the workspace.
          </p>
        </div>

        {canAcceptInvite ? (
          <Button type="button" size="lg" onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? <Spinner /> : <RiCheckboxCircleLine className="size-5" />}
            Accept invite
          </Button>
        ) : (
          <div className="space-y-3">
            {signedInEmail ? (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                You are signed in as{" "}
                <span className="font-medium text-foreground">{signedInEmail}</span>. Use{" "}
                <span className="font-medium text-foreground">{invite.data.email}</span> to accept
                this invite.
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg">
                <Link href={inviteSignInHref(token)}>
                  {signedInEmail ? "Switch account" : "Sign in"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={inviteSignUpHref(token)}>Create account</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
