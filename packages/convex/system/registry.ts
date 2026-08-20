import { CREATE_FORM } from "./forms/create_form";
import { CREATE_WORKSPACE } from "./forms/create_workspace";
import { INVITE_MEMBER } from "./forms/invite_member";

export const SYSTEM_FORMS = {
  [CREATE_WORKSPACE.slug]: CREATE_WORKSPACE,
  [CREATE_FORM.slug]: CREATE_FORM,
  [INVITE_MEMBER.slug]: INVITE_MEMBER,
} as const;

export type SystemFormSlug = keyof typeof SYSTEM_FORMS;

export function isSystemFormSlug(slug: string): slug is SystemFormSlug {
  return Object.hasOwn(SYSTEM_FORMS, slug);
}
