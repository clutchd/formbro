export const X402_VERSION = 2;

export const X402_HEADERS = {
  PAYMENT_REQUIRED: "PAYMENT-REQUIRED",
  PAYMENT_SIGNATURE: "PAYMENT-SIGNATURE",
  PAYMENT_RESPONSE: "PAYMENT-RESPONSE",
} as const;

export type X402Header = (typeof X402_HEADERS)[keyof typeof X402_HEADERS];
export type X402PaymentScheme = "batch-settlement" | "exact" | "upto";
export type X402PaymentStatus = "failed" | "required" | "settled" | "verified";

export type X402ResourceInfo = {
  url: string;
  description?: string;
  mimeType?: string;
  serviceName?: string;
  tags?: string[];
  iconUrl?: string;
};

export type X402PaymentRequirements = {
  scheme: X402PaymentScheme;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
};

export type X402PaymentRequired = {
  x402Version: typeof X402_VERSION;
  resource: X402ResourceInfo;
  accepts: X402PaymentRequirements[];
  error?: string;
  extensions?: Record<string, unknown>;
};

export type X402PaymentPayload = {
  x402Version: typeof X402_VERSION;
  accepted: X402PaymentRequirements;
  payload: Record<string, unknown>;
  resource?: X402ResourceInfo;
  extensions?: Record<string, unknown>;
};

export type X402SettlementResponse = {
  success: boolean;
  transaction?: string;
  network?: string;
  payer?: string;
  errorReason?: string;
};

function bytesToBinary(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 8192;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.slice(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return binary;
}

function binaryToBytes(binary: string) {
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeX402Header(value: unknown): string {
  return btoa(bytesToBinary(new TextEncoder().encode(JSON.stringify(value))));
}

export function decodeX402Header<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(binaryToBytes(atob(value)))) as T;
}

export function getX402PaymentSignature(headers: Headers): X402PaymentPayload | null {
  const value = headers.get(X402_HEADERS.PAYMENT_SIGNATURE);
  if (!value) return null;

  try {
    return decodeX402Header<X402PaymentPayload>(value);
  } catch {
    return null;
  }
}

export function createX402PaymentRequiredHeaders(paymentRequired: X402PaymentRequired) {
  return new Headers({
    [X402_HEADERS.PAYMENT_REQUIRED]: encodeX402Header(paymentRequired),
  });
}

export function createX402PaymentResponseHeaders(paymentResponse: X402SettlementResponse) {
  return new Headers({
    [X402_HEADERS.PAYMENT_RESPONSE]: encodeX402Header(paymentResponse),
  });
}
