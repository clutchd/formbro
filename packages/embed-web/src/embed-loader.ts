import type { EmbedLifecycleMessage } from "@formbro/core/embed";

const EMBED_MESSAGE_SOURCE = "formbro:embed";
const EMBED_PROTOCOL_VERSION: EmbedLifecycleMessage["protocolVersion"] = 1;
const MIN_EMBED_HEIGHT = 160;
const MAX_EMBED_HEIGHT = 10_000;

type EmbedContainer = HTMLElement & {
  dataset: DOMStringMap & {
    formbroId?: string;
    formbroLoading?: "eager" | "lazy";
    formbroTitle?: string;
  };
};

type EmbedEntry = {
  container: EmbedContainer;
  frame: HTMLIFrameElement;
  origin: string;
  publicId: string;
};

type FormBroBrowserApi = {
  mount: (container: HTMLElement) => HTMLIFrameElement | null;
  scan: (root?: ParentNode) => void;
};

declare global {
  interface Window {
    FormBro?: FormBroBrowserApi;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseEmbedLifecycleMessage(value: unknown): EmbedLifecycleMessage | null {
  if (
    !isRecord(value) ||
    value.source !== EMBED_MESSAGE_SOURCE ||
    value.protocolVersion !== EMBED_PROTOCOL_VERSION ||
    typeof value.publicId !== "string" ||
    value.publicId.trim().length === 0
  ) {
    return null;
  }

  switch (value.event) {
    case "ready":
    case "resize":
      return typeof value.height === "number" && Number.isFinite(value.height) && value.height >= 0
        ? (value as EmbedLifecycleMessage)
        : null;
    case "progress":
      return typeof value.percent === "number" &&
        Number.isInteger(value.percent) &&
        value.percent >= 0 &&
        value.percent <= 100
        ? (value as EmbedLifecycleMessage)
        : null;
    case "error":
      return typeof value.code === "string" && value.code.length > 0 && value.code.length <= 64
        ? (value as EmbedLifecycleMessage)
        : null;
    case "started":
    case "submitted":
      return value as EmbedLifecycleMessage;
    default:
      return null;
  }
}

export function normalizeEmbedHeight(height: number) {
  return Math.min(MAX_EMBED_HEIGHT, Math.max(MIN_EMBED_HEIGHT, Math.ceil(height)));
}

export function embedFrameUrl(loaderSource: string, publicId: string) {
  return new URL(`/e/${encodeURIComponent(publicId)}`, loaderSource).toString();
}

function createFrame(container: EmbedContainer, loaderSource: string): EmbedEntry | null {
  const publicId = container.dataset.formbroId?.trim();

  if (!publicId || container.dataset.formbroMounted === "true") {
    return null;
  }

  const source = embedFrameUrl(loaderSource, publicId);
  const frame = document.createElement("iframe");

  frame.src = source;
  frame.title = container.dataset.formbroTitle?.trim() || "Form";
  frame.loading = container.dataset.formbroLoading === "lazy" ? "lazy" : "eager";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.setAttribute("sandbox", "allow-forms allow-same-origin allow-scripts");
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("aria-busy", "true");
  frame.style.border = "0";
  frame.style.display = "block";
  frame.style.height = `${MIN_EMBED_HEIGHT}px`;
  frame.style.width = "100%";

  container.dataset.formbroMounted = "true";
  container.replaceChildren(frame);

  return {
    container,
    frame,
    origin: new URL(source).origin,
    publicId,
  };
}

function dispatchLifecycleEvent(entry: EmbedEntry, message: EmbedLifecycleMessage) {
  entry.container.dispatchEvent(
    new CustomEvent(`formbro:${message.event}`, {
      bubbles: true,
      detail: message,
    }),
  );
}

function installEmbedLoader(loaderSource: string) {
  const entries = new Set<EmbedEntry>();

  const mount = (container: HTMLElement) => {
    const entry = createFrame(container as EmbedContainer, loaderSource);

    if (entry) {
      entries.add(entry);
      return entry.frame;
    }

    return container.querySelector<HTMLIFrameElement>("iframe");
  };

  const scan = (root: ParentNode = document) => {
    if (root instanceof HTMLElement && root.matches("[data-formbro-id]")) {
      mount(root);
    }

    for (const container of root.querySelectorAll<HTMLElement>("[data-formbro-id]")) {
      mount(container);
    }
  };

  window.addEventListener("message", (event) => {
    const message = parseEmbedLifecycleMessage(event.data);

    if (!message) {
      return;
    }

    for (const entry of entries) {
      if (!entry.frame.isConnected) {
        entries.delete(entry);
        continue;
      }

      if (
        event.source !== entry.frame.contentWindow ||
        event.origin !== entry.origin ||
        message.publicId !== entry.publicId
      ) {
        continue;
      }

      if (message.event === "ready" || message.event === "resize") {
        entry.frame.style.height = `${normalizeEmbedHeight(message.height)}px`;
      }

      if (message.event === "ready") {
        entry.frame.removeAttribute("aria-busy");
      }

      dispatchLifecycleEvent(entry, message);
      break;
    }
  });

  const browserApi: FormBroBrowserApi = { mount, scan };
  window.FormBro = browserApi;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => scan(), { once: true });
  } else {
    scan();
  }

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          scan(node);
        }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const loaderSource =
    document.currentScript instanceof HTMLScriptElement
      ? document.currentScript.src
      : window.location.href;

  if (window.FormBro) {
    window.FormBro.scan();
  } else {
    installEmbedLoader(loaderSource);
  }
}
