"use node";

import { Resend } from "@convex-dev/resend";
import SignupComponent, { SignupSubject } from "@formbro/email/transactional/signup";
import { render } from "@react-email/render";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { action, type ActionCtx } from "../_generated/server";

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

const transactional_args = {
  welcome: {
    template: v.literal("welcome"),
    to: v.string(),
  },
} as const;

export const transactional = action({
  args: {
    email: v.union(...Object.values(transactional_args).map((arg) => v.object(arg))),
  },
  handler: async (ctx, { email }) => {
    let component: React.ReactElement;
    let subject: string;

    switch (email.template) {
      case "welcome":
        component = SignupComponent();
        subject = SignupSubject();
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
