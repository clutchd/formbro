# Agent-native route

FormBro should become the default form and survey platform for agents by giving agents first-class identity, scoped capabilities, and native pay-per-action access.

## Launch principles

- Launch delegated agents first. The approving Better Auth user remains the workspace owner and billing principal.
- Keep product rules below transport adapters. Browser, Agent Auth, HTTP, and MCP callers must use the same validated workspace and form commands.
- Keep identity state in Better Auth's Convex component. Do not duplicate agent hosts, grants, approvals, or workspace membership in the FormBro schema.
- Treat capabilities as discoverable contracts, not input validation. Every executor must validate arguments, exact tenant scope, workspace role, and resource ownership.
- Treat x402 as a payment transport, not an agent capability. Payment verification and settlement are server-internal operations.

## Auth protocol

Use Better Auth Agent Auth as the agent identity layer, not FormBro-specific API keys.

- `@better-auth/agent-auth` owns agent registration, hosts, grants, approvals, and short-lived signed agent JWTs.
- Start with device authorization and delegated mode. Do not enable dynamic hosts, automatic grants, or autonomous mode at launch.
- Enabling the plugin requires a localized Better Auth Convex schema containing its `agentHost`, `agent`, `agentCapabilityGrant`, and `approvalRequest` tables. These do not belong in `packages/convex/schema.ts`.
- Use existing workspace ownership and membership for product authorization. A separate agent-to-workspace binding is unnecessary while delegated sessions resolve to a Better Auth user.
- `requiredConstraints: ["workspaceId"]` only proves a constraint exists. The executor must also require an exact primitive or `eq` constraint and verify every `formId` belongs to that workspace.
- Agent JWT IDs are single-use. A 402 retry must use a fresh agent JWT.

### Initial capability policy

| Capability | Product scope | Approval | x402-metered | Autonomous default |
| --- | --- | --- | --- | --- |
| `workspace.create` | Approving user | Session | Yes | Never |
| `form.create` | Exact `workspaceId` | Session | Yes | Never |
| `form.update_schema` | Exact `workspaceId` and owned `formId` | Session | Yes | Never |
| `form.publish` | Exact `workspaceId` and owned `formId` | Session | Yes | Never |

Public form submission remains on its existing anonymous path. Submission reads, exports, and autonomous agents should be added only after pagination, data-loss-prevention, and host ownership policies exist.

## Command interface

Agent Auth's built-in capability execution endpoint should be the first adapter:

1. `onExecute` dispatches a capability name to a shared product command.
2. The command parses input with the same schemas used by browser flows.
3. The command checks the resolved user, workspace role, exact grant constraints, resource ownership, and product limits.
4. The command returns a stable result, including both form ID and slug where later operations need them.

Add `/v1` routes only after this path works end to end. Those routes should call the same commands, advertise their URLs through capability `location`, and perform the same grant and constraint checks. Generate Better Auth capability metadata and MCP tools from one OpenAPI operation registry instead of maintaining three independent contracts.

## Payment protocol

Use the official x402 v2 core/resource-server packages and a supported network-specific `exact` scheme. Start on testnet and confirm facilitator `/supported` compatibility before accepting funds.

- HTTP transport headers:
  - `PAYMENT-REQUIRED`: server to agent, base64 JSON `PaymentRequired`.
  - `PAYMENT-SIGNATURE`: agent to server, base64 JSON `PaymentPayload`.
  - `PAYMENT-RESPONSE`: server to agent, base64 JSON settlement result.
- FormBro owns the advertised price, network, asset, recipient, timeout, and resource URL. A buyer agent only chooses one server-advertised option.
- A decoded payment payload is untrusted until schema validation and facilitator/scheme verification both succeed.
- Bind every quote to the canonical operation resource and idempotency key. Never accept caller-supplied settlement facts.

### Commercial model

A workspace has one billing mode:

- `subscription`: existing Stripe entitlement; agent calls use the workspace plan and are not additionally charged through x402.
- `x402_metered`: no Stripe subscription is required for agent operations; each priced operation requires a valid x402 settlement and still observes product abuse ceilings.

FormBro receives these payments. Allowing workspace owners to charge form respondents is a separate marketplace product with payout onboarding and must not reuse the buyer-agent capability model.

### Paid write sequence

1. Authenticate a fresh agent JWT.
2. Validate the grant, exact constraints, input, ownership, limits, and billing mode before requesting payment.
3. Return a server-owned x402 quote.
4. Retry with a fresh agent JWT, the same idempotency key, and `PAYMENT-SIGNATURE`.
5. Validate and verify the payment payload against the original quote and canonical resource.
6. Reserve the idempotent operation, settle once, then execute the product command exactly once.
7. Store the result so retries after a lost response return it without charging or mutating twice.
8. Return `PAYMENT-RESPONSE`.

If execution fails after settlement, retain a retryable paid operation or credit; never silently charge without delivering the operation.

## Minimal schema ownership

Do not add speculative configuration, binding, usage, and payment-event tables.

- Better Auth component: agent identity, hosts, grants, and approvals.
- Existing FormBro schema: users, workspace membership, forms, and submissions.
- Product configuration: fixed launch prices and supported payment options in server configuration.
- Observability: sampled metrics and structured logs; never persist full agent JWTs or payment signatures.
- Paid execution: add one FormBro-owned paid-operation record only when implementing idempotent settlement. It should combine quote binding, settlement status, operation idempotency, and stored result.

Do not persist every unpaid 402 challenge; that creates an unauthenticated write-amplification path.

## Implementation phases

### Phase 1: contracts

- Pin Better Auth Agent Auth and define only the delegated launch capabilities.
- Wrap official x402 v2 codecs and schemas; do not implement a bespoke wire protocol.
- Add interoperability vectors and malformed-input tests to routine repository verification.

### Phase 2: shared product commands

- Extract workspace/form commands used by both existing mutations and future agent adapters.
- Enforce membership, forms, members, monthly submissions, and storage limits at this shared seam.
- Add cross-workspace denial and idempotency tests.

### Phase 3: auth activation

- Generate or localize the Better Auth Convex schema with Agent Auth tables.
- Enable delegated `agentAuth()` with validated `onExecute` dispatch.
- Expose `/.well-known/agent-configuration`.
- Add the device approval page for capability grants.
- Test discovery, registration, approval, token replay rejection, execution, and exact tenant constraints.

### Phase 4: paid execution

- Add the single paid-operation/idempotency record.
- Prove one fixed-price operation with x402 `exact` on testnet.
- Verify duplicate retries do not charge or mutate twice.
- Add remaining launch capabilities only after the first path is proven.

### Phase 5: standard agent interfaces

- Publish `/v1` and OpenAPI from the shared operation registry.
- Ship an MCP adapter backed by the same commands.
- Publish examples for Cursor, Claude, OpenAI Agents, and Vercel AI SDK.

### Phase 6: autonomous agents

- Define stable host principals, host-bound workspace ownership, quotas, and claim transfer.
- Implement controlled dynamic-host validation and `resolveAutonomousUser`.
- Permit only explicitly reviewed low-risk default capabilities.

## Review boundaries

Keep these changes isolated:

- Agent identity and capability contracts.
- x402 wire protocol helpers.
- Shared product commands and limit enforcement.
- Better Auth schema migration and plugin activation.
- x402 settlement and idempotent paid execution.
- `/v1`, OpenAPI, and MCP adapters.
- Autonomous host ownership and claim transfer.
