"use client";

import { useRouter } from "next/navigation";
import {
  useRoutePrewarmIntent,
  type PrewarmFn,
  type UseRoutePrewarmIntentOptions,
} from "./use-route-prewarm-intent";

export function nextUseRoutePrewarmIntent(
  href: string,
  prewarmFn: PrewarmFn,
  options: UseRoutePrewarmIntentOptions = {},
) {
  const router = useRouter();
  const prewarmIntentHandlers = useRoutePrewarmIntent(() => {
    router.prefetch(href);
    prewarmFn();
  }, options);
  return {
    href,
    prefetch: false,
    ...prewarmIntentHandlers,
  };
}
