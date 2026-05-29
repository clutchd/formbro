import { codes, type Result, type Status, type StatusCodeName } from "@formbro/core/result";
import { ConvexError, type Value } from "convex/values";

const statusCodeToName: Record<Status, StatusCodeName> = Object.fromEntries(
  (Object.entries(codes) as [StatusCodeName, Status][]).map(([name, code]) => [code, name]),
) as Record<Status, StatusCodeName>;

function defaultDataFor(status: StatusCodeName | Status): StatusCodeName | string {
  return typeof status === "number" ? (statusCodeToName[status] ?? status.toString()) : status;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

type ResultError = Extract<
  Result<unknown>,
  { ok: false; error: { message: string; status: StatusCodeName | Status } }
>["error"];

function isResultError(value: unknown): value is ResultError {
  if (!isRecord(value)) return false;

  return (
    typeof value.code === "string" &&
    typeof value.message === "string" &&
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

export class FormBroError<TData extends Value> extends ConvexError<TData> {
  status: StatusCodeName | Status = "INTERNAL_SERVER_ERROR";
  statusCode: number;

  constructor(status: StatusCodeName | Status = "INTERNAL_SERVER_ERROR", data?: TData) {
    const payload = (data ?? defaultDataFor(status)) as TData;
    super(payload);
    this.name = "FormBroError";
    this.status = status;
    this.statusCode = typeof status === "number" ? status : codes[status];
  }
}
