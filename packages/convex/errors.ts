import { codes, type Result, type StatusCode, type Status, type Error } from "@formbro/core/result";
import { ConvexError, type Value } from "convex/values";

function isResultError(
  value: unknown,
): value is Extract<
  Result<unknown>,
  { ok: false; error: { message: string; status: Status | StatusCode } }
>["error"] {
  if (!(value !== null && typeof value === "object")) return false;

  return (
    "code" in value &&
    typeof value.code === "string" &&
    "message" in value &&
    typeof value.message === "string" &&
    "status" in value &&
    (typeof value.status === "string" || typeof value.status === "number")
  );
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (isResultError(error)) return error.message;
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;
    if (typeof data === "string") return data;
    if (isResultError(data)) return data.message;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

export function shouldReportError(error: unknown) {
  if (isResultError(error)) return false;

  if (error && typeof error === "object" && "data" in error && isResultError(error.data)) {
    return false;
  }

  return true;
}

export class FormBroError extends ConvexError<
  Error<string, Status> & {
    context?: Record<string, Value>;
  }
> {
  status: Status;
  statusCode: number;

  constructor(error: Error<string, Status>, context?: Record<string, Value>) {
    const payload = context ? { ...error, context } : error;
    super(payload);
    this.name = "FormBroError";
    this.status = error.status;
    this.statusCode = codes[error.status];
  }
}

function defineErrors<const T extends Record<string, Omit<Error<string, Status>, "code">>>(
  defs: T,
): {
  [K in keyof T]: { code: K & string; message: T[K]["message"]; status: T[K]["status"] };
} {
  const result = {} as {
    [K in keyof T]: { code: K & string; message: T[K]["message"]; status: T[K]["status"] };
  };

  for (const code in defs) {
    const key = code as keyof T & string;
    result[key] = { code: key, ...defs[key] };
  }

  return result;
}

export const errors = defineErrors({
  NOT_AUTHENTICATED: {
    message: "Not authenticated.",
    status: "UNAUTHORIZED",
  },
  ADMIN_REQUIRED: {
    message: "Admin access required.",
    status: "UNAUTHORIZED",
  },
  ADMIN_NOT_CONFIGURED: {
    message: "Admin access is not set.",
    status: "INTERNAL_SERVER_ERROR",
  },
  WORKSPACE_ACCESS_REQUIRED: {
    message: "Workspace access required.",
    status: "FORBIDDEN",
  },
  WORKSPACE_NOT_FOUND: {
    message: "Workspace not found.",
    status: "NOT_FOUND",
  },
  BILLING_OWNER_ONLY: {
    message: "Only workspace owners can manage billing.",
    status: "FORBIDDEN",
  },
  STRIPE_CUSTOMER_NOT_FOUND: {
    message: "No Stripe customer found for this workspace yet.",
    status: "NOT_FOUND",
  },
  UNPAID_WORKSPACE_LIMIT: {
    message: "You can only have one unpaid workspace at a time.",
    status: "CONFLICT",
  },
  ADMIN_USERS_NOT_FOUND: {
    message: "Admin users not found.",
    status: "INTERNAL_SERVER_ERROR",
  },
  SYSTEM_WORKSPACE_INIT_FAILED: {
    message: "Failed to initialize system workspace.",
    status: "INTERNAL_SERVER_ERROR",
  },
  RESEND_AUDIENCE_ADD_INVALID: {
    message: "Failed to add user to audience.",
    status: "BAD_REQUEST",
  },
  RESEND_AUDIENCE_ADD_FAILED: {
    message: "Failed to add user to audience.",
    status: "INTERNAL_SERVER_ERROR",
  },
  RESEND_AUDIENCE_UPDATE_INVALID: {
    message: "Failed to update user in audience.",
    status: "BAD_REQUEST",
  },
  RESEND_AUDIENCE_UPDATE_FAILED: {
    message: "Failed to update user in audience.",
    status: "INTERNAL_SERVER_ERROR",
  },
  RESEND_AUDIENCE_USER_NOT_FOUND: {
    message: "Failed to find user.",
    status: "NOT_FOUND",
  },
});
