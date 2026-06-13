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

  constructor(error: Error<string, Status>, context?: Record<string, Value | undefined>) {
    const payload =
      context && Object.keys(context).length > 0
        ? {
            ...error,
            context: context
              ? (Object.fromEntries(
                  Object.entries(context).filter(([, value]) => value !== undefined),
                ) as Record<string, Value>)
              : undefined,
          }
        : error;
    super(payload);
    this.name = "FormBroError";
    this.status = error.status;
    this.statusCode = codes[error.status];
  }
}

export function defineErrors<const T extends Record<string, Omit<Error<string, Status>, "code">>>(
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
