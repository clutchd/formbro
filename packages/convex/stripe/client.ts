import { StripeSubscriptions } from "@convex-dev/stripe";
import { components } from "../_generated/api";

export const client = new StripeSubscriptions(components.stripe, {});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}
