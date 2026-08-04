# FormBro product direction

## Product thesis

FormBro is the open-source operational forms platform for teams whose work does not fit in a flat
questionnaire.

It helps an organization collect structured data from the people doing the work, control who can
use each form through the identity system the organization already trusts, and reliably hand the
result to the next step in the workflow. The form definition, response data, and automation
configuration remain portable.

The wedge is not “a nicer survey.” It is replacing the spreadsheets, PDFs, shared inboxes, and
one-off internal apps used for field reports, inspections, onboarding, approvals, service records,
and other repeatable operations.

## The job to be done

> When work happens in the field or across departments, let me model the real record, give the
> right people a simple way to submit it, and route the result without building and maintaining a
> custom application.

A complete FormBro workflow has four parts:

1. **Model** — describe the real operational record, including nested layouts and repeatable items.
2. **Distribute** — make the right forms available to the right respondents.
3. **Act** — turn a valid submission into explicit, observable workflow actions.
4. **Own** — export or move definitions and data without reconstructing the process by hand.

## Primary users

### Process owner

An operations, IT, safety, HR, or service lead who knows the process but should not need to build a
custom app. They create forms, configure respondent access, connect actions, and inspect failures.

### Respondent

An employee, technician, operator, contractor, or external customer completing a task. They should
see only relevant forms, use them comfortably on a phone, and never need to understand FormBro's
workspace model.

### Platform owner

The person responsible for security and continuity. They connect an identity provider, audit
access and actions, export data, and can self-host or migrate when requirements change.

Workspace members are **authors and administrators**. Respondents are a separate audience. A person
must not become a workspace member merely to fill out an internal form.

## Product pillars

### 1. Operational data modeling

FormBro should model the record the business actually uses rather than force it into a list of
independent answers.

The defining capabilities are:

- repeatable groups, such as one service visit containing any number of equipment items;
- nested sections and matrices with intentional desktop and mobile layouts;
- stable field identifiers and versioned schemas;
- validation across an item, a group, or the whole record;
- drafts that do not change the meaning of already stored submissions.

Repeatable groups are the first priority because they unlock the clearest workflows that flat form
products cannot represent.

### 2. Organization-native distribution

Every published form has one respondent access policy:

- **Public** — anyone with the link can open it.
- **Authenticated** — any signed-in FormBro user can open it.
- **Organization** — the identity provider must attest that the respondent belongs to an allowed
  organization; optional provider groups or roles narrow access further.

An organization connection is provider-neutral. Microsoft Entra ID and Google Workspace are
adapters at this seam, not separate authorization models.

The access decision must use provider-issued immutable identifiers. An email suffix alone is not
proof of organization membership. For Microsoft, the Entra tenant ID is the organization identity;
group IDs and app-role values are entitlements. A friendly domain may be shown in the interface but
must not be the authorization primitive.

The eventual respondent experience is an organization portal: sign in once, then see the forms
whose policies match the respondent's current identity and entitlements.

### 3. Submission workflows

A submission is an event with a durable execution history, not merely a row in a response table.

The first action adapters should cover the common operational handoff:

- send an email;
- call a signed webhook;
- create or update a record through an adapter;
- conditionally branch using submitted values.

Actions run after the submission has been durably accepted. Each run records its input version,
attempts, outcome, and error. Retries must be idempotent, and a failed action must never make a
successful form submission disappear.

### 4. Portability by default

Portability is a product capability, not a promise in marketing copy.

- A form definition downloads as versioned JSON.
- Submissions export with the schema version that interpreted them.
- Attachments have a documented manifest and stable references in bulk exports.
- Action configuration exports without secrets; secret bindings are named placeholders.
- The schema and execution formats are documented independently from the hosted interface.

Open source and self-hosting reinforce this pillar, but a usable export path is required even for
hosted customers who never self-host.

## Domain model

```text
Workspace
├── members (authors and administrators)
├── organization connections (Entra, Google Workspace, ...)
└── forms
    ├── versioned schema
    ├── respondent access policy
    ├── workflow definition
    └── submissions
        ├── schema version
        ├── respondent attribution (when policy requires it)
        └── action runs
```

The important seams are:

- the **form schema module**, which owns structured layout and values;
- the **respondent access module**, which evaluates normalized provider evidence against a policy;
- the **workflow module**, which accepts a submission event and owns reliable action execution;
- provider **adapters**, which translate Entra, Google, email, or webhook details into those stable
  interfaces.

The public form route asks the respondent access module for a decision. It should not contain
provider-specific checks. Submission creation repeats that authorization server-side; hiding a form
in the portal is never the security control.

## Security and data invariants

- The server authorizes both form reads and submission writes.
- Public metadata never exposes a draft schema or a restricted form's contents.
- Organization access is based on verified provider claims and immutable organization IDs.
- Group and role checks are scoped to the same organization identity that matched the policy.
- A policy defaults closed when required evidence is absent or stale.
- Published schema versions are immutable and every submission references one.
- Workflow secrets are encrypted bindings and are never embedded in exported definitions.
- Submission acceptance and action execution are separate durable states.
- Access-policy changes and workflow runs are auditable.

## Delivery sequence

### Phase 0 — make the contracts honest

1. Support recursive JSON submission values so repeatable groups can be stored without encoding
   arrays as strings.
2. Add a pure respondent access evaluator with normalized identity evidence and explicit denial
   reasons.
3. Let owners download the current form schema as versioned JSON.

These are independent changes and do not alter current public-form behavior.

### Phase 1 — own the operational-form wedge

1. Add a repeatable-group schema node with item-level minimum and maximum counts.
2. Compile nested field paths, defaults, and validators.
3. Add builder controls and an accessible add/remove/reorder respondent experience.
4. Render nested values in submissions and preserve them in JSON/CSV exports.

Exit criterion: a process owner can build an equipment service report with one visit and an
arbitrary number of equipment items without flattening or pre-allocating rows.

### Phase 2 — internal organization portal

1. Persist organization connections separately from workspace membership.
2. Add the Microsoft Entra adapter using tenant ID, group IDs, and app roles.
3. Add form access-policy settings and enforce them on reads and writes.
4. Add the respondent portal listing only forms currently authorized for that identity.
5. Add Google Workspace as the second adapter to prove the seam.

Exit criterion: a City Mechanical employee signs in with Microsoft, sees only forms allowed for
their tenant and entitlements, and can submit without being a FormBro workspace member.

### Phase 3 — reliable actions

1. Introduce versioned workflow definitions and durable action runs.
2. Ship email and signed-webhook adapters.
3. Add retry, replay, observability, and idempotency controls.
4. Add conditional branches over structured submission values.

Exit criterion: an operations lead can see whether every submission's handoff succeeded and safely
retry a failed action.

### Phase 4 — complete portability

1. Export/import a complete form package: schema, access policy, workflow definition, submissions,
   and attachment manifest.
2. Document the package and webhook contracts.
3. Add workspace-level bulk export and a tested restore path.

## What FormBro is not

- It is not a survey-optimization product centered on marketing conversion experiments.
- It is not a general workflow canvas competing on hundreds of shallow integrations.
- It is not an identity provider or employee directory.
- It is not a spreadsheet with a form bolted onto it.
- It does not treat an email domain as sufficient enterprise authorization.

Those products can integrate with FormBro. The durable advantage is the combination of expressive
operational records, organization-native distribution, reliable handoffs, and portable ownership.

## Measures that indicate direction

Prefer measures tied to embedded processes over raw form creation:

- active operational forms receiving submissions each week;
- repeatable-group usage and average items per submission;
- organizations with a configured identity connection;
- weekly authenticated respondents per organization;
- percentage of submissions with at least one successful action;
- action failure time-to-resolution;
- successful schema/data exports and restore tests;
- 30- and 90-day retention of workspaces with a live operational form.

The north-star behavior is a team trusting FormBro with a recurring process, not merely publishing
a form once.
