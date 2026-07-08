# Agent-native route

FormBro should become the default form and survey platform for agents by giving agents first-class identity, scoped capabilities, and native pay-per-action access.

## Target agent flow

1. Agent discovers FormBro at `/.well-known/agent-configuration`.
2. Agent registers through Better Auth Agent Auth with delegated or autonomous mode.
3. Human owner approves scoped capabilities, or an autonomous host receives preapproved low-risk capabilities.
4. Agent creates a workspace, configures x402 payment requirements, creates forms, publishes forms, and reads/submits responses.
5. Paid agent calls use x402 over HTTP: server returns `402` with `PAYMENT-REQUIRED`, agent retries with `PAYMENT-SIGNATURE`, server returns `PAYMENT-RESPONSE`.

## Auth protocol

Use Better Auth Agent Auth as the agent identity layer, not FormBro-specific API keys.

- `@better-auth/agent-auth` owns agent registration, hosts, grants, approvals, and short-lived signed agent JWTs.
- FormBro capabilities should be narrow actions such as `workspace.create`, `form.create`, `form.update_schema`, `form.publish`, `submission.read`, and `x402.payment.configure`.
- FormBro should store only product-specific bindings and telemetry: which Better Auth agent/host can act in which workspace, which x402 payment config was used, and what usage occurred.
- Enabling the plugin requires a Better Auth schema migration that includes `agentHost`, `agent`, `agentCapabilityGrant`, and `approvalRequest`.

## Payment protocol

Use x402 as the agent payment negotiation protocol.

- HTTP transport headers:
  - `PAYMENT-REQUIRED`: server to agent, base64 JSON `PaymentRequired`.
  - `PAYMENT-SIGNATURE`: agent to server, base64 JSON `PaymentPayload`.
  - `PAYMENT-RESPONSE`: server to agent, base64 JSON settlement result.
- Start with fixed-price actions:
  - create workspace
  - create form
  - publish form
  - AI schema edit
  - read submission batch
- Later add metered usage and overages once action prices and abuse controls are proven.

## Implementation phases

### Phase 1: protocol foundation

- Add Better Auth Agent Auth dependency and FormBro capability definitions.
- Add x402 wire helpers in shared code.
- Add Convex tables for FormBro-specific workspace bindings, x402 configs/events, and usage events.

### Phase 2: auth activation

- Generate or localize the Better Auth Convex schema with Agent Auth tables.
- Enable `agentAuth()` in `createAuth`.
- Expose `/.well-known/agent-configuration`.
- Add the device approval page for capability grants.

### Phase 3: agent API

- Add `/v1` HTTP routes with OpenAPI operation IDs matching capability names.
- Verify agent sessions with `auth.api.getAgentSession({ headers })`.
- Enforce workspace binding, capability grants, constraints, subscription state, and x402 payment state.
- Publish OpenAPI for Better Auth's OpenAPI adapter and agent discovery.

### Phase 4: paid execution

- Gate paid `/v1` operations behind x402.
- Persist every required, verified, settled, and failed payment event.
- Persist usage events with Better Auth agent/host IDs.
- Enforce monthly submission and storage limits on all write paths.

### Phase 5: ecosystem

- Ship an MCP server backed by the same `/v1` routes.
- Publish agent examples for Cursor, Claude, OpenAI Agents, and Vercel AI SDK.
- Add marketplace-ready docs: capabilities, prices, budgets, x402 networks, and examples.

## Review boundaries

Keep these changes isolated:

- Agent identity and capability contracts.
- x402 wire protocol helpers.
- `/v1` API routes and OpenAPI.
- Better Auth schema migration and plugin activation.
- x402 settlement verification and usage billing.
