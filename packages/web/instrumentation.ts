import type { Instrumentation } from "next";

const POSTHOG_HOST = "https://us.i.posthog.com";
const SERVICE_NAME = "formbro-next";

type LoggerProviderLike = {
  forceFlush: () => Promise<void>;
};

let loggerProviderPromise: Promise<LoggerProviderLike | null> | null = null;

function serviceVersion() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_REF ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ??
    "local"
  );
}

async function getPostHogLoggerProvider() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return null;

  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!token) return null;

  loggerProviderPromise ??= (async () => {
    const [{ logs }, { OTLPLogExporter }, { resourceFromAttributes }, sdkLogs] = await Promise.all([
      import("@opentelemetry/api-logs"),
      import("@opentelemetry/exporter-logs-otlp-http"),
      import("@opentelemetry/resources"),
      import("@opentelemetry/sdk-logs"),
    ]);

    const provider = new sdkLogs.LoggerProvider({
      resource: resourceFromAttributes({
        "deployment.environment": process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
        "service.name": SERVICE_NAME,
        "service.version": serviceVersion(),
      }),
      processors: [
        new sdkLogs.BatchLogRecordProcessor(
          new OTLPLogExporter({
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            url: `${POSTHOG_HOST}/i/v1/logs`,
          }),
        ),
      ],
    });

    logs.setGlobalLoggerProvider(provider);

    return provider;
  })();

  return loggerProviderPromise;
}

export async function register() {
  await getPostHogLoggerProvider();
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const [
    { logs, SeverityNumber },
    { captureServerException, postHogDistinctIdFromCookie },
    loggerProvider,
  ] = await Promise.all([
    import("@opentelemetry/api-logs"),
    import("./src/lib/posthog-server"),
    getPostHogLoggerProvider(),
  ]);
  const errorMessage = error instanceof Error ? error.message : "Next request error";
  const properties = {
    method: request.method,
    path: request.path,
    render_source: context.renderSource,
    revalidate_reason: context.revalidateReason,
    route_path: context.routePath,
    route_type: context.routeType,
    router_kind: context.routerKind,
    source: "next_request_error",
  };

  logs.getLogger(SERVICE_NAME).emit({
    attributes: properties,
    body: errorMessage,
    severityNumber: SeverityNumber.ERROR,
    severityText: "ERROR",
  });

  await captureServerException(error, {
    distinctId: postHogDistinctIdFromCookie(request.headers.cookie),
    properties,
  });

  await loggerProvider?.forceFlush().catch(() => undefined);
};
