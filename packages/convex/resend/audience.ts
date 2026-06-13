import { ok } from "@formbro/core/result";
import { hasString } from "@formbro/core/util";
import { split } from "@formbro/shared/names";
import { v } from "convex/values";
import {
  CreateContactOptions,
  CreateContactResponse,
  Resend,
  UpdateContactOptions,
  UpdateContactResponse,
} from "resend";
import { action } from "../_generated/server";
import { defineErrors, FormBroError } from "../errors";

const resend = new Resend(process.env.RESEND_API_KEY);

const ERRORS = defineErrors({
  AUDIENCE_SYNC_FAILED: {
    message: "Failed to sync contact to audience.",
    status: "INTERNAL_SERVER_ERROR",
  },
  EMAIL_REQUIRED: {
    message: "Email is required to add or update a contact in the audience.",
    status: "BAD_REQUEST",
  },
  USER_ID_REQUIRED: {
    message: "User id is required to add or update a contact in the audience.",
    status: "BAD_REQUEST",
  },
});

async function syncToAudience(
  input:
    | ({ action: "add"; name?: string } & CreateContactOptions)
    | ({ action: "update"; name?: string } & UpdateContactOptions),
) {
  if (!hasString(input.email)) {
    throw new FormBroError(ERRORS.EMAIL_REQUIRED, { email: input.email, name: input.name });
  }

  const { firstName, lastName } = split(input.name);

  let contact: CreateContactResponse | UpdateContactResponse;

  switch (input.action) {
    case "add": {
      const { action: _action, name: _name, email, ...options } = input;
      contact = await resend.contacts.create({
        email,
        ...options,
        firstName,
        lastName,
      });
      break;
    }
    case "update": {
      const { action: _action, name: _name, email, id: _id, ...options } = input;
      contact = await resend.contacts.update({
        email,
        ...options,
        firstName,
        lastName,
      });
      break;
    }
  }

  if (!contact.data || contact.error) {
    throw new FormBroError(ERRORS.AUDIENCE_SYNC_FAILED, {
      email: input.email,
      name: input.name,
      resend: contact,
    });
  }

  return ok();
}

export const add = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    return await syncToAudience({
      email: args.email,
      name: args.name,
      action: "add",
    });
  },
});

export const update = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    return await syncToAudience({
      email: args.email,
      name: args.name,
      action: "update",
    });
  },
});
