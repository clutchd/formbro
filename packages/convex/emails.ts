"use node";

import { Resend } from "@convex-dev/resend";
import SignupComponent, { SignupSubject } from "@formbro/email/transactional/signup";
import SubmissionNotificationComponent, {
  SubmissionNotificationSubject,
} from "@formbro/email/transactional/submission-notification";
import WorkspaceInviteComponent, {
  WorkspaceInviteSubject,
} from "@formbro/email/transactional/workspace-invite";
import { render } from "@react-email/render";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalAction, type ActionCtx } from "./_generated/server";

export const resendClient = new Resend(components.resend, {
  testMode: false,
});

async function _send(
  ctx: ActionCtx,
  {
    component,
    subject,
    to,
    from,
  }: { component: React.ReactElement; subject: string; to: string; from: string },
) {
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ]);

  const emailId = await resendClient.sendEmail(ctx, {
    from,
    to,
    subject,
    html,
    text,
  });

  return emailId;
}

const welcomeEmail = v.object({
  template: v.literal("welcome"),
  to: v.string(),
});
const workspaceInviteEmail = v.object({
  template: v.literal("workspaceInvite"),
  to: v.string(),
  workspaceName: v.string(),
  inviterName: v.string(),
  acceptUrl: v.string(),
  expiresTime: v.number(),
});
const submissionNotificationEmail = v.object({
  template: v.literal("submissionNotification"),
  to: v.string(),
  formName: v.string(),
  submittedTime: v.number(),
  submissionsUrl: v.string(),
  workspaceName: v.string(),
});

export const transactional = internalAction({
  args: {
    email: v.union(welcomeEmail, workspaceInviteEmail, submissionNotificationEmail),
  },
  handler: async (ctx, { email }) => {
    let component: React.ReactElement;
    let subject: string;

    switch (email.template) {
      case "welcome":
        component = SignupComponent();
        subject = SignupSubject();
        break;
      case "workspaceInvite":
        component = WorkspaceInviteComponent({
          acceptUrl: email.acceptUrl,
          expiresTime: email.expiresTime,
          inviterName: email.inviterName,
          workspaceName: email.workspaceName,
        });
        subject = WorkspaceInviteSubject({ workspaceName: email.workspaceName });
        break;
      case "submissionNotification":
        component = SubmissionNotificationComponent({
          formName: email.formName,
          submittedTime: email.submittedTime,
          submissionsUrl: email.submissionsUrl,
          workspaceName: email.workspaceName,
        });
        subject = SubmissionNotificationSubject({ formName: email.formName });
        break;
    }

    return _send(ctx, {
      from: "FormBro <notifications@mail.formbro.com>",
      component,
      subject,
      to: email.to,
    });
  },
});
