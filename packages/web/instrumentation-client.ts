const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

async function initializePosthog() {
  const { initializePosthog: initialize } = await import("@/lib/posthog-init");
  initialize();
}

function schedulePosthog() {
  const start = () => {
    void initializePosthog();
  };

  const requestIdle = window.requestIdleCallback?.bind(window);

  if (requestIdle) {
    requestIdle(start, { timeout: 2_000 });
    return;
  }

  globalThis.setTimeout(start, 0);
}

if (posthogKey && typeof window !== "undefined") {
  if (document.readyState === "complete") {
    schedulePosthog();
  } else {
    window.addEventListener("load", schedulePosthog, { once: true });
  }
}
