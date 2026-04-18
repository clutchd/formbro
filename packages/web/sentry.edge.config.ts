import * as Sentry from "@sentry/nextjs";
import { IS_PROD } from "src/lib/env";

if (IS_PROD && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: true,
    tracesSampleRate: 0.1,
  });
}
