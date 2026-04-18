"use node";

import { Resend } from "@convex-dev/resend";
import { components } from "../_generated/api";

export const resendClient = new Resend(components.resend, {
  testMode: false,
});
