import { describe, expect, test } from "bun:test";
import {
  createX402PaymentRequiredHeaders,
  createX402PaymentResponseHeaders,
  decodeX402Header,
  encodeX402Header,
  getX402PaymentSignature,
  X402_HEADERS,
  X402_VERSION,
  type X402PaymentPayload,
  type X402PaymentRequired,
  type X402SettlementResponse,
} from "./x402";

const paymentRequired = {
  x402Version: X402_VERSION,
  error: "PAYMENT-SIGNATURE header is required",
  resource: {
    url: "https://api.formbro.com/v1/forms",
    description: "Create a FormBro form",
    mimeType: "application/json",
    serviceName: "FormBro",
    tags: ["forms", "agents"],
  },
  accepts: [
    {
      scheme: "exact",
      network: "eip155:8453",
      amount: "10000",
      asset: "0x0000000000000000000000000000000000000000",
      payTo: "0x1111111111111111111111111111111111111111",
      maxTimeoutSeconds: 60,
      extra: {
        name: "USDC",
        label: "Form creation – FormBro",
      },
    },
  ],
} satisfies X402PaymentRequired;

describe("x402 helpers", () => {
  test("round trips base64 encoded JSON headers", () => {
    const encoded = encodeX402Header(paymentRequired);

    expect(decodeX402Header<X402PaymentRequired>(encoded)).toEqual(paymentRequired);
  });

  test("creates payment required headers", () => {
    const headers = createX402PaymentRequiredHeaders(paymentRequired);
    const decoded = decodeX402Header<X402PaymentRequired>(
      headers.get(X402_HEADERS.PAYMENT_REQUIRED) ?? "",
    );

    expect(decoded.accepts[0]?.scheme).toBe("exact");
    expect(decoded.resource.serviceName).toBe("FormBro");
  });

  test("creates payment response headers", () => {
    const response = {
      success: true,
      transaction: "0x123",
      network: "eip155:8453",
      payer: "0x2222222222222222222222222222222222222222",
    } satisfies X402SettlementResponse;
    const headers = createX402PaymentResponseHeaders(response);

    expect(decodeX402Header<X402SettlementResponse>(headers.get("PAYMENT-RESPONSE") ?? "")).toEqual(
      response,
    );
  });

  test("parses payment signature payloads", () => {
    const payload = {
      x402Version: X402_VERSION,
      accepted: paymentRequired.accepts[0],
      resource: paymentRequired.resource,
      payload: {
        signature: "0xabc",
        authorization: {
          from: "0x2222222222222222222222222222222222222222",
          to: paymentRequired.accepts[0].payTo,
          value: paymentRequired.accepts[0].amount,
        },
      },
    } satisfies X402PaymentPayload;
    const headers = new Headers({
      [X402_HEADERS.PAYMENT_SIGNATURE]: encodeX402Header(payload),
    });

    expect(getX402PaymentSignature(headers)).toEqual(payload);
  });

  test("returns null for missing or malformed payment signatures", () => {
    expect(getX402PaymentSignature(new Headers())).toBeNull();
    expect(
      getX402PaymentSignature(new Headers({ [X402_HEADERS.PAYMENT_SIGNATURE]: "not base64" })),
    ).toBeNull();
  });
});
