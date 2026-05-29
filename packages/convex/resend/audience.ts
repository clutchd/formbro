import { ok } from "@formbro/core/result";
import { split } from "@formbro/shared/names";
import { v } from "convex/values";
import { Resend } from "resend";
import { api, components } from "../_generated/api";
import { action, internalAction } from "../_generated/server";
import { FormBroError } from "../errors";

const resend = new Resend(process.env.RESEND_API_KEY);

const ERRORS = {
  FAILED_TO_ADD_CONTACT: "Failed to add user to audience.",
  FAILED_TO_UPDATE_CONTACT: "Failed to update user in audience.",
  FAILED_TO_FIND_USER: "Failed to find user.",
};

export const add = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    if (!args.email) {
      throw new FormBroError("BAD_REQUEST", {
        message: ERRORS.FAILED_TO_ADD_CONTACT,
        data: {
          email: args.email,
        },
      });
    }

    const { firstName, lastName } = split(args.name);
    const contact = await resend.contacts.create({
      email: args.email,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      unsubscribed: false,
    });

    if (!contact.data || contact.error) {
      throw new FormBroError("INTERNAL_SERVER_ERROR", {
        message: ERRORS.FAILED_TO_ADD_CONTACT,
        data: {
          email: args.email,
          error: contact.error,
        },
      });
    }

    return ok();
  },
});

export const update = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    if (!args.email) {
      throw new FormBroError("BAD_REQUEST", {
        message: ERRORS.FAILED_TO_UPDATE_CONTACT,
        data: {
          email: args.email,
        },
      });
    }

    const { firstName, lastName } = split(args.name);
    const contact = await resend.contacts.update({
      email: args.email,
      firstName: firstName,
      lastName: lastName,
    });

    if (!contact.data || contact.error) {
      throw new FormBroError("INTERNAL_SERVER_ERROR", {
        message: ERRORS.FAILED_TO_UPDATE_CONTACT,
        data: {
          email: args.email,
          error: contact.error,
        },
      });
    }

    return ok();
  },
});

export const upsert = internalAction({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.id) {
      throw new FormBroError("BAD_REQUEST", {
        message: ERRORS.FAILED_TO_ADD_CONTACT,
        data: {
          id: args.id,
        },
      });
    }

    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "_id", operator: "eq", value: args.id }],
    });

    if (!user) {
      throw new FormBroError("NOT_FOUND", {
        message: ERRORS.FAILED_TO_FIND_USER,
        data: {
          id: args.id,
        },
      });
    }

    await ctx.scheduler.runAfter(0, api.resend.audience.add, {
      email: user.email,
      name: user.name,
    });

    return ok();
  },
});
