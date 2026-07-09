import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from "@x402/core/http";
import {
  PaymentPayloadV2Schema,
  PaymentRequiredV2Schema,
  type PaymentPayloadV2,
  type PaymentRequiredV2,
} from "@x402/core/schemas";
import type { SettleResponse } from "@x402/core/types";

export const X402_VERSION = 2 as const;

export const X402_HEADERS = {
  PAYMENT_REQUIRED: "PAYMENT-REQUIRED",
  PAYMENT_SIGNATURE: "PAYMENT-SIGNATURE",
  PAYMENT_RESPONSE: "PAYMENT-RESPONSE",
} as const;

export type X402Header = (typeof X402_HEADERS)[keyof typeof X402_HEADERS];
export type X402PaymentPayload = PaymentPayloadV2;
export type X402PaymentRequired = PaymentRequiredV2;
export type X402SettlementResponse = SettleResponse;

export type X402PaymentSignatureResult =
  | { status: "invalid" }
  | { status: "missing" }
  | { status: "present"; unverifiedPayload: X402PaymentPayload };

export function parseX402PaymentSignature(headers: Headers): X402PaymentSignatureResult {
  const value = headers.get(X402_HEADERS.PAYMENT_SIGNATURE);
  if (!value) return { status: "missing" };

  try {
    const result = PaymentPayloadV2Schema.safeParse(decodePaymentSignatureHeader(value));

    if (!result.success) return { status: "invalid" };

    return { status: "present", unverifiedPayload: result.data };
  } catch {
    return { status: "invalid" };
  }
}

export function createX402PaymentRequiredHeaders(paymentRequired: X402PaymentRequired) {
  const validatedPaymentRequired = PaymentRequiredV2Schema.parse(paymentRequired);

  return new Headers({
    [X402_HEADERS.PAYMENT_REQUIRED]: encodePaymentRequiredHeader(validatedPaymentRequired),
  });
}

export function createX402PaymentResponseHeaders(paymentResponse: X402SettlementResponse) {
  return new Headers({
    [X402_HEADERS.PAYMENT_RESPONSE]: encodePaymentResponseHeader(paymentResponse),
  });
}
