"use client";

import type { ConvexReactClient } from "convex/react";
import type { FunctionArgs, FunctionReference } from "convex/server";
import { getFunctionName } from "convex/server";
import { convexToJson, type Value } from "convex/values";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { IS_DEV } from "../env";

const PREWARM_DEBOUNCE_MS = 120;
const PREWARM_EXTEND_MS = 8_000;
const PREWARM_DEDUPE_MS = 3_000;

function prewarmLog(event: string, details?: Record<string, unknown>) {
  if (!IS_DEV) return;
  console.debug("[prewarm]", event, details ?? "");
}

type RouteQuerySpec<Query extends FunctionReference<"query">> = {
  query: Query;
  args: FunctionArgs<Query>;
  key: string;
};

function buildQueryKey(queryName: string, args: unknown): string {
  return `${queryName}:${JSON.stringify(convexToJson(args as Value))}`;
}

function makeRouteQuerySpec<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>,
): RouteQuerySpec<Query> {
  return {
    query,
    args,
    key: buildQueryKey(getFunctionName(query), args),
  };
}

type PrewarmRouteOptions = {
  dedupeMs?: number;
  extendSubscriptionFor?: number;
};

const lastPrewarmedAt = new Map<string, number>();

export function prewarmRoute(
  convex: ConvexReactClient,
  queries: Array<{
    query: FunctionReference<"query">;
    args: Record<string, unknown>;
  }>,
  options: PrewarmRouteOptions = {},
) {
  const specs = queries.map(({ query, args }) =>
    makeRouteQuerySpec(query, args as FunctionArgs<typeof query>),
  );
  const dedupeMs = options.dedupeMs ?? PREWARM_DEDUPE_MS;
  const extendSubscriptionFor = options.extendSubscriptionFor ?? PREWARM_EXTEND_MS;
  const now = Date.now();
  const prewarmed: string[] = [];
  const skipped: string[] = [];

  for (const spec of specs) {
    const previous = lastPrewarmedAt.get(spec.key);
    if (previous !== undefined && now - previous < dedupeMs) {
      skipped.push(spec.key);
      continue;
    }

    lastPrewarmedAt.set(spec.key, now);

    try {
      convex.prewarmQuery({
        query: spec.query,
        args: spec.args,
        extendSubscriptionFor,
      });
      prewarmed.push(spec.key);
    } catch (error) {
      console.warn("[prewarm] queries.failed", {
        key: spec.key,
        error,
      });
    }
  }

  if (prewarmed.length > 0) {
    prewarmLog("queries", { keys: prewarmed });
  }

  if (skipped.length > 0) {
    prewarmLog("queries.skip", { keys: skipped });
  }
}

export type RoutePrewarmOptions = {
  debounceMs?: number;
  eager?: boolean;
};

type PrewarmFn = () => void | Promise<void>;

export type PrewarmIntentHandlers = {
  onMouseEnter: () => void;
  onFocus: () => void;
  onTouchStart: () => void;
  onMouseLeave: () => void;
  onBlur: () => void;
};

function createRoutePrewarmIntent(
  prewarmFn: PrewarmFn,
  options: Pick<RoutePrewarmOptions, "debounceMs"> = {},
) {
  const debounceMs = options.debounceMs ?? PREWARM_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = undefined;
  };

  const run = () => {
    Promise.resolve(prewarmFn()).catch((error) => {
      console.warn("[prewarm] run.failed", { error });
    });
  };

  const schedule = () => {
    if (timer) return;

    timer = setTimeout(() => {
      timer = undefined;
      run();
    }, debounceMs);
  };

  const handlers: PrewarmIntentHandlers = {
    onMouseEnter: schedule,
    onFocus: schedule,
    onTouchStart: schedule,
    onMouseLeave: cancel,
    onBlur: cancel,
  };

  return { handlers, run, cancel };
}

export function useRoutePrewarm(
  href: string,
  prewarmFn: PrewarmFn,
  options: RoutePrewarmOptions = {},
): PrewarmIntentHandlers & { href: string; prefetch: false } {
  const { eager = false } = options;
  const router = useRouter();
  const prewarmRef = useRef(prewarmFn);
  prewarmRef.current = prewarmFn;

  const prewarm = useCallback(() => {
    prewarmLog("run", { href });
    router.prefetch(href);
    return prewarmRef.current();
  }, [href, router]);

  const controller = useMemo(
    () => createRoutePrewarmIntent(prewarm, options),
    [options.debounceMs, prewarm],
  );

  useEffect(() => {
    if (eager) {
      controller.run();
    }

    return () => {
      controller.cancel();
    };
  }, [controller, eager]);

  return {
    href,
    prefetch: false,
    ...controller.handlers,
  };
}
