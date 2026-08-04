"use client";

import type { EmbedLifecycleMessage } from "@formbro/core/embed";
import { type ReactNode, useEffect } from "react";

type EmbedEvent = EmbedLifecycleMessage["event"];
type EmbedMessageInput = {
  [Event in EmbedEvent]: Omit<
    Extract<EmbedLifecycleMessage, { event: Event }>,
    "protocolVersion" | "publicId" | "source"
  >;
}[EmbedEvent];

export function postEmbedMessage(publicId: string, event: EmbedMessageInput) {
  if (window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      source: "formbro:embed",
      protocolVersion: 1,
      publicId,
      ...event,
    } satisfies EmbedLifecycleMessage,
    "*",
  );
}

function documentHeight() {
  return Math.ceil(
    Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.getBoundingClientRect().height,
    ),
  );
}

export function EmbedFrame({ children, publicId }: { children: ReactNode; publicId: string }) {
  useEffect(() => {
    let animationFrame = 0;
    let lastHeight = -1;
    let ready = false;

    const measure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const height = documentHeight();

        if (!ready) {
          postEmbedMessage(publicId, { event: "ready", height });
          ready = true;
        }

        if (height !== lastHeight) {
          postEmbedMessage(publicId, { event: "resize", height });
          lastHeight = height;
        }
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    measure();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [publicId]);

  return children;
}
