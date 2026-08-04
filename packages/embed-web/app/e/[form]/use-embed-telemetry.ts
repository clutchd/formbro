"use client";

import { useCallback, useEffect, useRef } from "react";
import { createEmbedTelemetryPayload, shouldSampleEmbedTelemetry } from "@/embed-telemetry";

type TelemetrySession = {
  hadError: boolean;
  sent: boolean;
  started: boolean;
  startedAt: number;
  submitted: boolean;
};

export function useEmbedTelemetry({
  publicId,
  revision,
  telemetryUrl,
}: {
  publicId: string;
  revision: string;
  telemetryUrl?: string;
}) {
  const sessionRef = useRef<TelemetrySession | null>(null);
  const flushRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!telemetryUrl || !shouldSampleEmbedTelemetry()) {
      sessionRef.current = null;
      return;
    }

    const session: TelemetrySession = {
      hadError: false,
      sent: false,
      started: false,
      startedAt: performance.now(),
      submitted: false,
    };
    sessionRef.current = session;

    const flush = () => {
      if (session.sent) return;
      session.sent = true;
      navigator.sendBeacon(
        telemetryUrl,
        JSON.stringify(
          createEmbedTelemetryPayload({
            elapsedMs: performance.now() - session.startedAt,
            hadError: session.hadError,
            publicId,
            revision,
            started: session.started,
            submitted: session.submitted,
          }),
        ),
      );
    };
    flushRef.current = flush;
    window.addEventListener("pagehide", flush, { once: true });

    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
      sessionRef.current = null;
      flushRef.current = () => undefined;
    };
  }, [publicId, revision, telemetryUrl]);

  const markStarted = useCallback(() => {
    if (sessionRef.current) sessionRef.current.started = true;
  }, []);
  const markError = useCallback(() => {
    if (sessionRef.current) sessionRef.current.hadError = true;
  }, []);
  const markSubmitted = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.started = true;
    sessionRef.current.submitted = true;
    flushRef.current();
  }, []);

  return { markError, markStarted, markSubmitted };
}
