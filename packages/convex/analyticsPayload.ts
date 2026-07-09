const EVENT_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

type PostHogCapturePayloadInput = {
  apiKey: string;
  deduplicationKey?: string;
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  workspaceId?: string;
};

function uuidBytes(uuid: string) {
  const hex = uuid.replaceAll("-", "");
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

async function deterministicUuid(name: string) {
  const namespace = uuidBytes(EVENT_NAMESPACE);
  const nameBytes = new TextEncoder().encode(name);
  const input = new Uint8Array(namespace.length + nameBytes.length);
  input.set(namespace);
  input.set(nameBytes, namespace.length);

  const hash = new Uint8Array(await crypto.subtle.digest("SHA-1", input));
  const bytes = hash.slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function buildPostHogCapturePayload({
  apiKey,
  deduplicationKey,
  distinctId,
  event,
  properties,
  timestamp,
  workspaceId,
}: PostHogCapturePayloadInput) {
  return {
    api_key: apiKey,
    event,
    ...(deduplicationKey ? { uuid: await deterministicUuid(deduplicationKey) } : {}),
    ...(timestamp ? { timestamp } : {}),
    properties: {
      ...properties,
      $lib: "formbro-convex",
      distinct_id: distinctId,
      ...(workspaceId ? { $groups: { workspace: workspaceId } } : {}),
    },
  };
}
