export const codes = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  UNUSED: 306,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  "I'M_A_TEAPOT": 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export type Status = keyof typeof codes;
export type StatusCode = (typeof codes)[Status];

export type Error<TCode extends string, TStatus extends Status> = {
  code: TCode;
  message: string;
  status: TStatus;
};

type BaseResult<T extends boolean> = { ok: T };
type BaseResultWithData<T extends boolean, TData> = BaseResult<T> & { data: TData };
type BaseResultWithError<
  T extends boolean,
  TErrorCode extends string,
  TStatus extends Status,
> = BaseResult<T> & { error: Error<TErrorCode, TStatus> };
type BaseResultWithDataAndError<
  T extends boolean,
  TData,
  TErrorCode extends string,
  TStatus extends Status,
> = BaseResultWithData<T, TData> & {
  error: Error<TErrorCode, TStatus>;
};

export function ok(): BaseResult<true>;
export function ok<TData>(data: TData): BaseResultWithData<true, TData>;
export function ok<TData>(data?: TData) {
  if (data === undefined) return { ok: true as const };
  return { ok: true as const, data };
}

export function fail(): BaseResult<false>;
export function fail<TData>({ data }: { data: TData }): BaseResultWithData<false, TData>;
export function fail<TCode extends string, TStatus extends Status>({
  error,
}: {
  error: Error<TCode, TStatus>;
}): BaseResultWithError<false, TCode, TStatus>;
export function fail<TData, TCode extends string, TStatus extends Status>({
  data,
  error,
}: {
  data: TData;
  error: Error<TCode, TStatus>;
}): BaseResultWithDataAndError<false, TData, TCode, TStatus>;
export function fail<TData, TErrorCode extends string, TStatus extends Status>(args?: {
  data?: TData;
  error?: Error<TErrorCode, TStatus>;
}) {
  const { data, error } = args ?? {};
  const hasData = data !== undefined;
  const hasError = error !== undefined;

  if (!hasData && !hasError) return { ok: false as const };
  if (hasData && !hasError) return { ok: false as const, data };
  if (!hasData && hasError) return { ok: false as const, error };

  return { ok: false as const, data, error };
}

type OkResult<TData> = BaseResult<true> | BaseResultWithData<true, TData>;
type FailResult<TData, TErrorCode extends string, TStatus extends Status> =
  | BaseResult<false>
  | BaseResultWithData<false, TData>
  | BaseResultWithError<false, TErrorCode, TStatus>
  | BaseResultWithDataAndError<false, TData, TErrorCode, TStatus>;

export type Result<
  TData = void,
  TErrorCode extends string = string,
  TStatus extends Status = Status,
> = OkResult<TData> | FailResult<TData, TErrorCode, TStatus>;
