/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as audience from "../audience.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as billingUtils from "../billingUtils.js";
import type * as emails from "../emails.js";
import type * as errors from "../errors.js";
import type * as forms from "../forms.js";
import type * as http from "../http.js";
import type * as lib from "../lib.js";
import type * as submissions from "../submissions.js";
import type * as system_forms__init from "../system/forms/_init.js";
import type * as system_forms_create_form from "../system/forms/create_form.js";
import type * as system_forms_create_workspace from "../system/forms/create_workspace.js";
import type * as system_initialize from "../system/initialize.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  access: typeof access;
  audience: typeof audience;
  auth: typeof auth;
  billing: typeof billing;
  billingUtils: typeof billingUtils;
  emails: typeof emails;
  errors: typeof errors;
  forms: typeof forms;
  http: typeof http;
  lib: typeof lib;
  submissions: typeof submissions;
  "system/forms/_init": typeof system_forms__init;
  "system/forms/create_form": typeof system_forms_create_form;
  "system/forms/create_workspace": typeof system_forms_create_workspace;
  "system/initialize": typeof system_initialize;
  workspace: typeof workspace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
};
