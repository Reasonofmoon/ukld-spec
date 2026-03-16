# UKDL Cookbook: Real-World Patterns

A recipe book for UKDL. Each recipe solves a specific real-world problem with complete, copy-paste-ready code. Every code block is a valid `.ukdl` file you can run through `ukdl parse` immediately.

---

## How to Use This Book

Each recipe follows the same format:

- **Level**: the highest UKDL level the recipe uses (L0–L5)
- **Use case**: one sentence describing the problem it solves
- **Key kinds used**: the UKDL node kinds the recipe demonstrates
- A complete, self-contained `.ukdl` code block
- **How it works**: the pattern explained
- **Variations**: common modifications

---

## Recipe 1: Personal Knowledge Base

**Level**: L0
**Use case**: Replace a notes app or personal wiki with structured, retrievable blocks.
**Key kinds used**: `meta`, `block`

```ukdl
%% Personal knowledge base — replacing Notion, Obsidian, or a notes app

:: meta id=doc:my-kb title="My Knowledge Base" created="2026-03-16"
@author: "your-name"
@lang: "en"
@version: "1.0"
@domain: "personal.knowledge"
@tags: ["personal", "notes", "reference"]
@ukdl_level: 0
::

:: block id=blk:ukdl-definition type=definition
@summary: "UKDL is a document-programming hybrid language."
@tags: ["ukdl", "languages", "tools"]

## What is UKDL?

UKDL (Unified Knowledge & Dynamics Language) is a document format where every
file is simultaneously human-readable text, a machine-parseable knowledge graph,
and an executable program.

At Level 0, writing UKDL is indistinguishable from writing Markdown — you just
wrap your notes in `:: block ... ::` delimiters.
::

:: block id=blk:ukdl-example type=example
@tags: ["ukdl", "examples"]

## Minimal UKDL Document

The simplest valid UKDL document is two nodes: a `meta` header and one `block`.
The body is standard Markdown, so existing writing habits transfer completely.
::

:: block id=blk:coffee-brewing type=note
@summary: "V60 pour-over: 15g coffee, 250g water at 93C, 3 min total brew."
@tags: ["coffee", "recipes", "brewing"]
@confidence: 0.9

## V60 Pour-Over Method

Grind size: medium-fine. Ratio: 1:15 (15g coffee, 225g water).

1. Rinse the paper filter with hot water
2. Add coffee, make a small well in the center
3. Pour 30g of water for a 30-second bloom
4. Pour in slow circles to 150g at 1:00
5. Pour to 225g by 1:45
6. Total draw-down finishes by 3:00–3:30

Aim for **93°C** water temperature. Grind finer if it finishes too fast.
::

:: block id=blk:meeting-template type=note
@tags: ["meetings", "templates", "productivity"]

## 1:1 Meeting Template

**Agenda**
- What's going well?
- What's blocked?
- What needs a decision?

**Always close with**: one concrete next action per person, written down.
::
```

**How it works**: The `type` attribute on each block acts as a category (definition, example, note). The `@tags` field enables cross-referencing — `ukdl query --tag coffee` returns all blocks tagged "coffee". The `@summary` field is a one-line description that appears in collapsed context views and search results.

**Variations**:
- Add `@source` to blocks for citation tracking: `@source: "https://..."`
- Use `type=warning` for blocks that contain gotchas or caveats
- Add `priority=high` to blocks you want pinned in AI context windows

---

## Recipe 2: Research Paper Notes

**Level**: L1
**Use case**: Structure a literature review so you can query "which papers contradict X" or "all claims with confidence below 0.7".
**Key kinds used**: `meta`, `entity`, `rel`, `block`

```ukdl
%% Research literature review — papers, authors, claims, and their relationships

:: meta id=doc:ml-survey title="Survey: Transformer Efficiency" created="2026-03-16"
@author: "researcher"
@lang: "en"
@version: "1.0"
@domain: "research.ml.transformers"
@tags: ["transformers", "efficiency", "survey", "ml"]
@ukdl_level: 1
::

%% ═══ Authors ═══

:: entity id=ent:vaswani type=Person labels.en="Ashish Vaswani"
@aliases: ["A. Vaswani"]
Lead author of "Attention is All You Need".
::

:: entity id=ent:dao type=Person labels.en="Tri Dao"
Lead author of FlashAttention papers.
::

%% ═══ Papers ═══

:: entity id=ent:attention-all-you-need type=Theory labels.en="Attention Is All You Need"
@valid_from: "2017-06-12"
@same_as: ["https://arxiv.org/abs/1706.03762"]
Original transformer architecture paper. Introduced multi-head self-attention.
::

:: entity id=ent:flashattention type=Theory labels.en="FlashAttention"
@valid_from: "2022-05-27"
@same_as: ["https://arxiv.org/abs/2205.14135"]
IO-aware exact attention algorithm, 2–4x faster than standard attention.
::

:: entity id=ent:mamba type=Theory labels.en="Mamba"
@valid_from: "2023-12-01"
@same_as: ["https://arxiv.org/abs/2312.00752"]
Selective state space model claiming to match transformers at lower compute.
::

%% ═══ Concepts ═══

:: entity id=ent:self-attention type=Concept labels.en="Self-Attention"
The core mechanism of transformers. O(n²) in sequence length.
::

:: entity id=ent:ssm type=Concept labels.en="State Space Model"
@aliases: ["SSM"]
Linear recurrence formulation, O(n) in sequence length.
::

%% ═══ Relations ═══

:: rel id=rel:vaswani-authored type=discovered from=@ent:vaswani to=@ent:attention-all-you-need
@confidence: 1.0
@source: "arXiv:1706.03762"
::

:: rel id=rel:dao-authored type=discovered from=@ent:dao to=@ent:flashattention
@confidence: 1.0
::

:: rel id=rel:flash-extends-attn type=extends from=@ent:flashattention to=@ent:attention-all-you-need
@confidence: 0.95
@source: "arXiv:2205.14135, Section 1"
FlashAttention preserves exact attention semantics while improving IO complexity.
::

:: rel id=rel:mamba-challenges type=contradicts from=@ent:mamba to=@ent:self-attention
@confidence: 0.75
@source: "arXiv:2312.00752, Abstract"
Mamba claims SSMs match transformer quality with linear complexity, but results
are contested on long-context benchmarks.
::

:: rel id=rel:ssm-linear type=is_a from=@ent:ssm to=@ent:mamba
@confidence: 1.0
::

%% ═══ Claims and Notes ═══

:: block id=blk:quadratic-bottleneck type=claim about=@ent:self-attention
@confidence: 0.99
@source: "arXiv:1706.03762, Section 3.2"
@tags: ["efficiency", "bottleneck"]
@summary: "Standard attention is O(n²) in both time and memory."

Standard multi-head self-attention scales quadratically with sequence length.
For a sequence of length n with d_model dimensions, attention requires O(n²)
time and O(n²) memory. This becomes prohibitive at n > 8,000 tokens.
::

:: block id=blk:flashattn-claim type=claim about=@ent:flashattention
@confidence: 0.92
@source: "arXiv:2205.14135, Table 1"
@tags: ["efficiency", "speed"]
@summary: "FlashAttention is 2–4x faster and uses 5–20x less memory."

FlashAttention restructures attention computation to minimize HBM reads/writes.
On A100 GPUs, it achieves 2–4x wall-clock speedup and 5–20x memory reduction
versus PyTorch's standard `torch.nn.MultiheadAttention` at sequence length 4096.
::

:: block id=blk:mamba-caveat type=note about=@ent:mamba
@confidence: 0.6
@tags: ["caution", "contested"]
@summary: "Mamba's quality claims are contested on long-context retrieval."

Mamba's paper shows strong results on language modeling perplexity, but
follow-up benchmarks (e.g., RULER, LongBench) suggest quality degrades on
tasks requiring precise long-range retrieval compared to transformer baselines.
Treat quality claims with moderate confidence until more independent replication.
::
```

**How it works**: `entity` nodes for authors and papers create graph vertices. `rel` nodes with types like `contradicts`, `extends`, and `supports` create typed edges with their own confidence scores and provenance. This lets you query the graph: "find all relations of type `contradicts` where `@confidence < 0.8`". The `@same_as` field links to canonical external identifiers for deduplication.

**Variations**:
- Add `@valid_from` and `@valid_to` to track when claims were believed to be true
- Use `type=evidence` blocks to attach empirical data to claims
- Use `rel type=supported_by` to link claims to their evidence blocks

---

## Recipe 3: API Documentation

**Level**: L2
**Use case**: Replace OpenAPI/Swagger with human-readable docs that degrade gracefully for different audiences and token budgets.
**Key kinds used**: `meta`, `entity`, `schema`, `context`, `block`

```ukdl
%% API documentation with schema validation and context-aware rendering

:: meta id=doc:payments-api title="Payments API v2" created="2026-03-16"
@author: "platform-team"
@lang: "en"
@version: "2.0"
@domain: "engineering.api.payments"
@tags: ["api", "rest", "payments", "stripe"]
@ukdl_level: 2
::

%% ═══ Entities ═══

:: entity id=ent:payment type=Concept labels.en="Payment"
@aliases: ["Charge", "Transaction"]
A monetary transfer from a customer to a merchant.
::

:: entity id=ent:payment-intent type=Concept labels.en="PaymentIntent"
Tracks the lifecycle of a payment attempt, from creation to confirmation.
::

:: entity id=ent:webhook type=Concept labels.en="Webhook"
HTTP callback sent to your server when a payment event occurs.
::

%% ═══ Schema ═══

:: schema id=sch:payment-intent-object
@applies_to: {kind: "block", type: "definition"}
@required_fields: ["id", "amount", "currency", "status"]
@optional_fields: ["customer", "description", "metadata"]
@field_types: {
  id: "string(prefix:pi_)",
  amount: "integer(positive)",
  currency: "string(iso4217)",
  status: "enum(requires_payment_method, requires_confirmation, processing, succeeded, canceled)",
  customer: "string(prefix:cus_)",
  description: "string",
  metadata: "object"
}
::

%% ═══ Context Layers ═══

:: context id=ctx:api-quickstart priority=critical depth=overview collapse=false
@summary: "Payments API: create a PaymentIntent, confirm it, handle webhook. Base URL: /api/v2"

## Quick Start

1. Create a `PaymentIntent` with an amount and currency
2. Confirm the PaymentIntent from your client
3. Listen for the `payment_intent.succeeded` webhook

Base URL: `https://api.example.com/v2`
Authentication: `Authorization: Bearer sk_live_...`
::

:: context id=ctx:auth-details priority=high depth=standard collapse=true
@summary: "API keys: sk_live_ for production, sk_test_ for sandbox. Never expose in client code."

## Authentication Details

All requests must include your secret key as a Bearer token. Use `sk_test_`
keys during development — they hit a sandbox environment with no real charges.

Store keys in environment variables. Never commit them to version control.
Never send them to client-side code.
::

:: context id=ctx:error-reference priority=low depth=detailed collapse=true
@summary: "Errors follow RFC 7807. Always check the 'code' field, not just HTTP status."
@max_tokens: 2000

## Error Object Reference

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "https://api.example.com/errors/card_declined",
  "title": "Card Declined",
  "status": 402,
  "detail": "The card was declined by the issuing bank.",
  "code": "card_declined",
  "payment_intent_id": "pi_3Pq..."
}
```

**Error codes**: `card_declined`, `insufficient_funds`, `expired_card`,
`incorrect_cvc`, `processing_error`, `authentication_required`
::

%% ═══ Endpoint Documentation ═══

:: block id=blk:create-payment-intent type=definition about=@ent:payment-intent priority=high
@confidence: 1.0
@tags: ["POST", "create", "payment-intent"]
@summary: "POST /v2/payment-intents — create a new PaymentIntent."

## POST /v2/payment-intents

Creates a PaymentIntent. The `amount` is in the smallest currency unit
(cents for USD).

**Request body:**
```json
{
  "amount": 2000,
  "currency": "usd",
  "description": "Order #1042"
}
```

**Response (201 Created):**
```json
{
  "id": "pi_3Pq7mELkTbc9vC1g0MmgBDtA",
  "amount": 2000,
  "currency": "usd",
  "status": "requires_payment_method",
  "client_secret": "pi_3Pq7...AoRb_secret_...",
  "created": 1742118600
}
```

**Errors:** `400` invalid parameters — `401` unauthenticated
::

:: block id=blk:confirm-payment-intent type=definition about=@ent:payment-intent priority=high
@tags: ["POST", "confirm"]
@summary: "POST /v2/payment-intents/:id/confirm — attach payment method and attempt charge."

## POST /v2/payment-intents/:id/confirm

Attaches a payment method and attempts the charge. Call this from your
server after your client collects card details.

**Request body:**
```json
{
  "payment_method": "pm_card_visa"
}
```

**Response (200 OK):**
```json
{
  "id": "pi_3Pq7mELkTbc9vC1g0MmgBDtA",
  "status": "succeeded",
  "amount_received": 2000
}
```

**Errors:** `402` card declined — `404` PaymentIntent not found
::

:: block id=blk:webhook-events type=definition about=@ent:webhook priority=normal
@tags: ["webhooks", "events"]
@summary: "Key webhook events: payment_intent.succeeded, payment_intent.payment_failed."

## Webhook Events

Register your endpoint at `https://api.example.com/v2/webhooks`.
Verify the `X-Signature` header using your webhook secret before processing.

| Event | When it fires |
|-------|--------------|
| `payment_intent.succeeded` | Payment confirmed and funds captured |
| `payment_intent.payment_failed` | Charge attempt declined |
| `payment_intent.canceled` | PaymentIntent canceled by your code |
| `refund.created` | Refund issued |
::
```

**How it works**: Three `context` nodes form a progressive disclosure stack. The `ctx:api-quickstart` node is `priority=critical` and `collapse=false` — it always renders. The `ctx:auth-details` node is `collapse=true` — it renders as its `@summary` when tokens are scarce. The detailed error reference collapses entirely. An LLM querying this doc at a limited token budget automatically gets the right level of detail. The `schema` node gives validators a machine-readable contract for PaymentIntent objects.

**Variations**:
- Add `@when: @qst:audience-role` on blocks to show/hide endpoints by audience (internal/external)
- Use `rel type=depends_on` between endpoint entities to document sequencing requirements
- Add `include` nodes to split each resource into its own file and include by filter

---

## Recipe 4: Meeting Notes with Actions

**Level**: L3
**Use case**: Meeting minutes that carry their own action items as executable nodes, with dependencies between tasks.
**Key kinds used**: `meta`, `block`, `entity`, `rel`, `action`

```ukdl
%% Meeting notes where action items are first-class executable nodes

:: meta id=doc:q2-planning title="Q2 Planning Meeting — 2026-03-16" created="2026-03-16"
@author: "scribe"
@lang: "en"
@version: "1.0"
@domain: "business.planning.quarterly"
@tags: ["meeting", "q2-2026", "planning", "engineering"]
@ukdl_level: 3
::

%% ═══ Attendees ═══

:: entity id=ent:alice type=Person labels.en="Alice Chen"
@aliases: ["Alice"]
Engineering Lead.
::

:: entity id=ent:bob type=Person labels.en="Bob Torres"
@aliases: ["Bob"]
Product Manager.
::

:: entity id=ent:carol type=Person labels.en="Carol Kim"
@aliases: ["Carol"]
Design Lead.
::

%% ═══ Discussion Topics ═══

:: block id=blk:roadmap-discussion type=note priority=high
@summary: "Team agreed to prioritize the new search feature for Q2."
@tags: ["roadmap", "search"]

## Roadmap Discussion

@{ent:bob|Bob} presented the Q2 roadmap proposal. Key debate: ship search feature
in April or push to May to allow more design polish.

**Decision**: Ship search in May with full design polish. April milestone is
internal beta only with engineering and design using it daily.

@{ent:carol|Carol} will own the design system updates needed before search launch.
@{ent:alice|Alice} raised the concern that the current auth service won't handle
the expected load spike at launch — needs load testing before May.
::

:: block id=blk:infrastructure-concern type=note priority=high
@summary: "Auth service load testing required before May search launch."
@tags: ["infrastructure", "auth", "risk"]

## Infrastructure Risk

Alice's concern: the auth service currently handles ~200 req/s sustained.
The search launch is projected to spike at 800 req/s based on marketing estimates.

**Decision**: Mandatory load test before any public launch. If it fails, launch
date moves, not the load test.
::

:: block id=blk:design-system-update type=note
@summary: "Design system token refresh needed: new color palette and spacing scale."
@tags: ["design", "design-system"]

## Design System Update

Carol presented the proposed token refresh — new color palette aligning with
the rebrand, updated spacing scale (4px base grid to 8px). Estimated 2 sprints.
No visual changes to existing product pages; only new components use new tokens.
::

%% ═══ Relations ═══

:: rel id=rel:search-blocks-launch type=depends_on from=@ent:alice to=@ent:bob
@source: "Q2 Planning Meeting, 2026-03-16"
Load testing must complete before search launch authorization.
::

%% ═══ Action Items ═══

:: action id=act:schedule-load-test agent=ops-bot trigger="meeting_complete"
@tool: "calendar_scheduler"
@input: {
  title: "Auth Service Load Test",
  assignee: "alice-chen",
  due: "2026-04-15",
  priority: "high",
  description: "Run sustained 800 req/s load test against auth service staging. Document results."
}
@output: "load-test-ticket.json"
@timeout: 10000

Schedule the load test before Alice's other Q2 work begins.
::

:: action id=act:create-design-ticket agent=pm-bot trigger="meeting_complete"
@tool: "issue_tracker"
@input: {
  title: "Design System Token Refresh",
  assignee: "carol-kim",
  due: "2026-04-30",
  sprint: "Q2-Sprint-1",
  description: "Implement new color palette and 8px spacing scale. New components only."
}
@output: "design-ticket.json"
@timeout: 10000
::

:: action id=act:search-launch-checklist agent=pm-bot trigger="act:schedule-load-test.complete"
@tool: "checklist_generator"
@input: {
  title: "Search Feature Launch Checklist",
  due: "2026-05-01",
  items: [
    "Load test passed (>800 req/s sustained)",
    "Design system tokens merged",
    "Internal beta feedback addressed",
    "Marketing assets ready",
    "On-call runbook updated"
  ]
}
@output: "launch-checklist.json"
@depends_on: [@act:schedule-load-test, @act:create-design-ticket]
@guard: @act:schedule-load-test.status == "complete"

Generate the launch checklist only after load test ticket is created.
::
```

**How it works**: Decisions and discussion are `block` nodes — they're the permanent record. Action items are `action` nodes with `@tool`, `@input`, and `@output` fields. The `@depends_on` and `@guard` fields enforce sequencing: the launch checklist action only fires after both prerequisite actions complete. An L3 runtime executes these when the trigger fires; an L0 reader sees the same document as readable meeting minutes.

**Variations**:
- Use `trigger="weekly_standup"` to create recurring action items
- Add `@retry: {max: 3, backoff: "exponential"}` to actions that hit external systems
- Tag actions with `@tags: ["alice"]` so `ukdl run --filter-tag alice` shows only Alice's items

---

## Recipe 5: Product Requirements Document

**Level**: L3
**Use case**: A PRD where features, user stories, and implementation tasks are a connected knowledge graph rather than a flat document.
**Key kinds used**: `meta`, `entity`, `rel`, `block`, `context`, `action`

```ukdl
%% Product Requirements Document — features as a knowledge graph

:: meta id=doc:search-prd title="Search Feature PRD" created="2026-03-16"
@author: "bob-torres"
@lang: "en"
@version: "1.0"
@domain: "product.features.search"
@tags: ["prd", "search", "q2-2026"]
@ukdl_level: 3
::

%% ═══ Context Layers for Stakeholder Views ═══

:: context id=ctx:executive-summary priority=critical depth=overview collapse=false
@summary: "Full-text search across all content. Ships May 2026. Est. 15% retention lift."

## Executive Summary

Full-text search enables users to find any content in their workspace instantly.
Target: May 2026. Projected impact: 15% improvement in 30-day retention based
on cohort analysis of power users who use workaround search today.
::

:: context id=ctx:technical-details priority=normal depth=detailed collapse=true
@summary: "Elasticsearch 8.x, BM25 ranking, <200ms p99 latency target."

## Technical Approach

Index: Elasticsearch 8.x. Ranking: BM25 with user-signal re-ranking.
Latency target: p99 < 200ms at 500 req/s sustained. Index updates: near-realtime
via change-data-capture from Postgres.
::

%% ═══ Entities ═══

:: entity id=ent:search-feature type=System labels.en="Search Feature"
Full-text search across workspace content.
::

:: entity id=ent:search-index type=System labels.en="Search Index"
Elasticsearch index containing all indexable workspace content.
::

:: entity id=ent:ranking-model type=System labels.en="Ranking Model"
BM25 with user-signal re-ranking layer.
::

:: entity id=ent:user-power type=Concept labels.en="Power User"
Users who create more than 50 items per month.
::

:: entity id=ent:user-standard type=Concept labels.en="Standard User"
Users who create fewer than 50 items per month.
::

%% ═══ User Stories ═══

:: block id=blk:story-instant-find type=definition about=@ent:user-power priority=high
@tags: ["user-story", "power-user"]
@summary: "As a power user, I want to search by keyword so I can find items without remembering location."

## Story: Instant Find

**As a** power user with 500+ items in my workspace,
**I want** to type a few keywords and see matching results instantly,
**So that** I don't have to remember which folder something is in.

**Acceptance criteria:**
- Results appear within 300ms of the last keystroke (debounced 150ms)
- Results show item title, type icon, and path
- Keyboard navigation: arrow keys to move, Enter to open
- Minimum 3 characters before search triggers
::

:: block id=blk:story-filter type=definition about=@ent:user-standard priority=normal
@tags: ["user-story", "standard-user"]
@summary: "As a standard user, I want to filter results by type so I can narrow down quickly."

## Story: Filter by Type

**As a** standard user,
**I want** to filter search results by content type (note, task, file),
**So that** I can quickly narrow results when I know what I'm looking for.

**Acceptance criteria:**
- Filter chips visible above result list
- Type filter applies instantly without re-querying
- Selected filters persist within the session
::

%% ═══ Dependencies ═══

:: rel id=rel:search-needs-index type=depends_on from=@ent:search-feature to=@ent:search-index
@confidence: 1.0
Search cannot function without the index being populated.
::

:: rel id=rel:search-needs-ranking type=depends_on from=@ent:search-feature to=@ent:ranking-model
@confidence: 0.9
Initial launch can use BM25 only; re-ranking is required for quality target.
::

:: rel id=rel:power-user-primary type=used_by from=@ent:search-feature to=@ent:user-power
Primary target user: power users who outgrow folder navigation.
::

%% ═══ Implementation Actions ═══

:: action id=act:build-index agent=backend-eng trigger="sprint_start"
@tool: "task_creator"
@input: {
  title: "Stand up Elasticsearch index and CDC pipeline",
  assignee: "backend-team",
  points: 8,
  sprint: "Q2-Sprint-1"
}
@output: "index-ticket.json"
@timeout: 10000
::

:: action id=act:build-ui agent=frontend-eng trigger="sprint_start"
@tool: "task_creator"
@input: {
  title: "Build search UI: input, results list, filter chips",
  assignee: "frontend-team",
  points: 5,
  sprint: "Q2-Sprint-2"
}
@output: "ui-ticket.json"
@depends_on: @act:build-index
@timeout: 10000
::

:: action id=act:load-test agent=ops-eng trigger="act:build-index.complete"
@tool: "task_creator"
@input: {
  title: "Load test: 500 req/s sustained, p99 latency verification",
  assignee: "ops-team",
  points: 3,
  sprint: "Q2-Sprint-3"
}
@output: "loadtest-ticket.json"
@depends_on: @act:build-index
@guard: @act:build-index.status == "complete"
::
```

**How it works**: Context nodes create stakeholder-specific views of the same document. Executives see `ctx:executive-summary` in all phases; engineers unlock `ctx:technical-details` when `depth=detailed`. Entity and relation nodes make the dependency graph machine-queryable — a planning tool can traverse `depends_on` relations to build a Gantt chart automatically. Action nodes with `@depends_on` enforce ordering when tickets are created.

**Variations**:
- Add a `quantum` node for feature readiness state (planning, building, testing, shipped)
- Use `@priority: critical` on must-have user stories, `low` on nice-to-haves
- Export to JSON-LD and import into a graph database to run dependency queries

---

## Recipe 6: Adaptive Course Material

**Level**: L5
**Use case**: EdTech or corporate training that adjusts content depth, examples, and pacing to each learner's demonstrated proficiency.
**Key kinds used**: `meta`, `entity`, `rel`, `context`, `quantum`, `block`, `action`, `pipeline`

```ukdl
%% Adaptive course — content adjusts to learner proficiency in real time

:: meta id=doc:sql-course title="SQL Mastery: Adaptive Course" created="2026-03-16"
@author: "curriculum-team"
@lang: "en"
@version: "2.0"
@domain: "education.databases.sql"
@tags: ["sql", "databases", "adaptive", "course"]
@ukdl_level: 5
@license: "CC-BY-4.0"
::

%% ═══ L1: Knowledge Graph ═══

:: entity id=ent:sql type=Tool labels.en="SQL"
@aliases: ["Structured Query Language"]
@same_as: ["https://www.wikidata.org/wiki/Q47607"]
Declarative language for querying and manipulating relational databases.
::

:: entity id=ent:select type=Concept labels.en="SELECT Statement"
The primary SQL query construct. Retrieves rows from one or more tables.
::

:: entity id=ent:joins type=Concept labels.en="Joins"
@aliases: ["JOIN", "INNER JOIN", "LEFT JOIN"]
Combine rows from two or more tables based on a related column.
::

:: entity id=ent:indexes type=Concept labels.en="Indexes"
Data structures that speed up row retrieval at the cost of write overhead.
::

:: rel id=rel:joins-prereq type=requires from=@ent:joins to=@ent:select
Understanding SELECT is required before learning JOIN.
::

:: rel id=rel:indexes-optimize type=optimizes from=@ent:indexes to=@ent:select
Proper indexing makes SELECT queries dramatically faster.
::

%% ═══ L2: Context Control ═══

:: context id=ctx:course-intro priority=critical depth=overview collapse=false
@summary: "Adaptive SQL course. Takes a diagnostic quiz, then matches content to your level."

## Welcome

This course adapts to your current SQL knowledge. Complete the diagnostic
quiz and every explanation, example, and exercise will be matched to
exactly where you are.

Complete beginners will see visual analogies. Practitioners see precise
technical language. Experts see internals and performance considerations.
::

%% ═══ L4: Quantum States ═══

:: quantum id=qst:learner-level
@states: {beginner: 0.4, practitioner: 0.4, expert: 0.2}
@observe_on: "diagnostic_complete"
@entangle: @qst:content-depth
@decay: {function: "exponential", half_life: "21d"}
@default: "practitioner"
@history: true

Learner's SQL proficiency level. Initialized as superposition across all states.
Collapses to a definite state after the diagnostic assessment.
::

:: quantum id=qst:content-depth
@states: {conceptual: 0.4, technical: 0.4, internals: 0.2}
@observe_on: "diagnostic_complete"
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-conceptual:    0.75,
  beginner-technical:     0.20,
  beginner-internals:     0.05,
  practitioner-conceptual: 0.15,
  practitioner-technical:  0.65,
  practitioner-internals:  0.20,
  expert-conceptual:       0.05,
  expert-technical:        0.30,
  expert-internals:        0.65
}

Depth of explanation to deliver, correlated with learner level.
::

%% ═══ L3: Adaptive Content ═══

:: block id=blk:select-lesson type=lesson about=@ent:select priority=high
@when: @qst:learner-level
@confidence: 0.98

# The SELECT Statement

|if: @qst:learner-level == beginner|
Think of a database table like a spreadsheet. A SELECT statement is how
you ask: "Show me the rows I care about."

```sql
-- Show all columns from the customers table
SELECT * FROM customers;

-- Show only name and email columns
SELECT name, email FROM customers;
```

The `*` means "every column." Try it — then replace `*` with just
the columns you want.

|elif: @qst:learner-level == practitioner|
SELECT retrieves a result set from one or more tables. Column selection,
filtering, ordering, and aggregation are all part of the SELECT statement.

```sql
SELECT
    customer_id,
    name,
    email,
    COUNT(orders.id) AS order_count
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
WHERE customers.created_at > '2025-01-01'
GROUP BY customers.id, customers.name, customers.email
ORDER BY order_count DESC
LIMIT 20;
```

Key point: GROUP BY requires all non-aggregate columns in the SELECT list.

|else|
SELECT in the SQL standard is a relational algebra expression. The logical
query processing order is: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.
This differs from the written order.

```sql
-- Execution plan inspection (PostgreSQL)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT customer_id, SUM(amount) AS total
FROM orders
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY customer_id
HAVING SUM(amount) > 1000;
```

The planner chooses between seq scan, index scan, and bitmap index scan
based on selectivity estimates from pg_statistic.
|/if|
::

:: block id=blk:joins-lesson type=lesson about=@ent:joins priority=high
@when: @qst:learner-level

# Joins

|if: @qst:learner-level == beginner|
A JOIN combines two tables when they share related data. Think of it as
merging two spreadsheets by matching a column they have in common.

```sql
-- Get each order with the customer's name
SELECT orders.id, customers.name, orders.amount
FROM orders
JOIN customers ON orders.customer_id = customers.id;
```

The ON clause is the matching rule: "connect each order to the customer
whose id matches the order's customer_id."

|elif: @qst:learner-level == practitioner|
SQL has four join types. INNER JOIN returns only matching rows. LEFT JOIN
returns all rows from the left table with NULLs for non-matching right rows.

```sql
-- All customers, with total order value (NULL if no orders)
SELECT
    c.name,
    COALESCE(SUM(o.amount), 0) AS lifetime_value
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
```

Use LEFT JOIN when you want to preserve all rows from the left table.

|else|
Join algorithms: nested loop (small tables), hash join (equality on large
tables), merge join (pre-sorted inputs). The planner picks based on statistics.

```sql
-- Force hash join for analysis
SET enable_nestloop = off;
SET enable_mergejoin = off;

EXPLAIN ANALYZE
SELECT c.id, COUNT(o.id)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id;
```

Correlated subqueries often compile to nested loop joins. Rewrite as
explicit JOINs to allow the planner to choose a better algorithm.
|/if|
::

%% ═══ L3: Actions ═══

:: action id=act:diagnostic agent=sql-tutor trigger="course_start"
@tool: "sql_skill_assessor"
@input: {
  topics: [@ent:select, @ent:joins, @ent:indexes],
  question_count: 8,
  format: "practical_query"
}
@output: "diagnostic_result.json"
@timeout: 120000
@retry: {max: 2, backoff: "linear"}

Assess learner's current SQL proficiency across core topics.
::

:: action id=act:generate-exercises agent=sql-tutor trigger="lesson_complete"
@tool: "sql_exercise_generator"
@input: {
  topic: @ent:select,
  difficulty: @qst:learner-level,
  count: 3,
  database: "ecommerce_sample"
}
@output: "exercises.json"
@depends_on: @act:diagnostic
@guard: @qst:learner-level != "uninitialized"
@timeout: 30000
::

:: action id=act:evaluate-submission agent=sql-tutor trigger="exercise_submitted"
@tool: "sql_query_evaluator"
@input: {
  submission: "user_query.sql",
  expected_output: "expected_result.csv",
  rubric: {correctness: 0.6, efficiency: 0.3, style: 0.1}
}
@output: "evaluation.json"
@depends_on: @act:generate-exercises
@timeout: 15000
::

%% ═══ L5: Learning Pipeline ═══

:: pipeline id=pipe:sql-mastery
@goal: "achieve_sql_proficiency"
@criteria: ["quiz_accuracy", "query_correctness", "query_efficiency", "completion_rate"]
@interval: "every_lesson"
@max_iterations: 80
@stages: [
  {name: "assess",     action: @act:diagnostic},
  {name: "calibrate",  quantum: @qst:learner-level},
  {name: "teach_select", block: @blk:select-lesson},
  {name: "teach_joins",  block: @blk:joins-lesson},
  {name: "practice",   action: @act:generate-exercises},
  {name: "evaluate",   action: @act:evaluate-submission}
]
@feedback: {
  positive: "advance_to_next_topic",
  negative: {adjust: {difficulty: "decrease", hints: "more", examples: "increase"}},
  stagnant: {escalate: "human_instructor"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 4",
  action: "pause_and_notify"
}

Full adaptive SQL learning pipeline. Optimizes for comprehension, not speed.
::
```

**How it works**: Two entangled quantum variables (`qst:learner-level` and `qst:content-depth`) collapse together when the diagnostic completes. The entanglement matrix ensures that if a learner is observed as a beginner, there is a 75% probability they get conceptual content and only 5% probability they get internals content. The pipeline runs this assess-calibrate-teach-practice-evaluate loop until the criteria are met or `@max_iterations` is reached. The `@circuit_breaker` prevents the system from hammering a confused learner indefinitely.

**Variations**:
- Add a third quantum variable `qst:preferred-modality` (visual/textual/hands-on) for multi-dimensional adaptation
- Use `@decay: {function: "linear", half_life: "7d"}` for skills that require constant practice to retain
- Set `@feedback.stagnant: {escalate: "human_instructor"}` to hand off plateaued learners to a human coach

---

## Recipe 7: Chatbot Knowledge Base

**Level**: L2
**Use case**: A structured knowledge base for a RAG-powered customer support bot, with context phases optimized for different token budgets.
**Key kinds used**: `meta`, `entity`, `schema`, `context`, `block`

```ukdl
%% Customer support knowledge base optimized for RAG retrieval

:: meta id=doc:support-kb title="Customer Support Knowledge Base" created="2026-03-16"
@author: "support-team"
@lang: "en"
@version: "1.0"
@domain: "support.faq"
@tags: ["support", "faq", "rag", "chatbot"]
@ukdl_level: 2
::

%% ═══ Topic Entities ═══

:: entity id=ent:billing type=Concept labels.en="Billing"
@aliases: ["payments", "invoices", "charges"]
Questions related to charges, invoices, refunds, and payment methods.
::

:: entity id=ent:account type=Concept labels.en="Account"
@aliases: ["profile", "login", "password"]
Questions related to account creation, login, and settings.
::

:: entity id=ent:product type=Concept labels.en="Product"
@aliases: ["features", "how-to", "usage"]
Questions about product features and how to use them.
::

%% ═══ Schema ═══

:: schema id=sch:faq-block
@applies_to: {kind: "block", type: "definition"}
@required_fields: ["summary", "tags"]
@optional_fields: ["source", "confidence"]
@field_types: {
  summary: "string",
  tags: "array<string>",
  confidence: "number"
}
::

%% ═══ Context Layers ═══

:: context id=ctx:quick-answers priority=critical depth=overview collapse=false
@summary: "Top 5 support topics: refunds (3-5 days), password reset (email link), plan upgrade (instant), data export (Settings > Export), cancellation (no fee, instant)."

## Quick Reference

The five most common support queries and their one-line answers:

1. **Refund** — Processed in 3–5 business days to original payment method
2. **Password reset** — Click "Forgot password" on login page; link expires in 1 hour
3. **Plan upgrade** — Instant; billing prorated for remainder of billing period
4. **Data export** — Settings > Account > Export Data; CSV and JSON available
5. **Cancellation** — No cancellation fee; effective end of current billing period
::

:: context id=ctx:detailed-procedures priority=normal depth=standard collapse=true
@summary: "Detailed procedures for refunds, escalations, and account recovery."
@max_tokens: 3000

## Detailed Procedures

**Refund escalation path**: Agent initiates → billing system auto-approves under $50 →
manager approval required $50–$500 → VP Finance approval over $500.

**Account recovery without email access**: Requires photo ID verification submitted
via secure upload form. Processing time 2–3 business days.
::

%% ═══ FAQ Blocks ═══

:: block id=blk:refund-policy type=definition about=@ent:billing priority=high
@confidence: 0.99
@tags: ["refund", "billing", "money-back"]
@summary: "Full refund within 14 days of purchase. Pro-rated refunds after 14 days on annual plans."

## Refund Policy

**Within 14 days of purchase**: Full refund, no questions asked. Submit via
Settings > Billing > Request Refund.

**After 14 days on a monthly plan**: No refunds. Cancel to stop future charges.

**After 14 days on an annual plan**: Pro-rated refund for unused months.
Email support@example.com with your account email to request.

**Refund processing time**: 3–5 business days to the original payment method.
Bank processing may add 2–5 additional business days depending on your bank.
::

:: block id=blk:password-reset type=definition about=@ent:account priority=high
@confidence: 1.0
@tags: ["password", "login", "reset", "account"]
@summary: "Password reset via email link. Link expires in 1 hour. Check spam folder."

## Password Reset

1. Go to the login page and click **Forgot password?**
2. Enter your account email address
3. Check your inbox for a reset link (arrives within 2 minutes)
4. Click the link — it expires after **1 hour**
5. Set your new password (minimum 12 characters)

**Not receiving the email?** Check your spam/junk folder. Add
`noreply@example.com` to your contacts. If still no email after 5 minutes,
try the reset form again.

**No longer have access to the email?** Contact support for identity verification.
::

:: block id=blk:plan-upgrade type=definition about=@ent:billing priority=normal
@confidence: 1.0
@tags: ["upgrade", "plan", "billing", "pricing"]
@summary: "Upgrades are instant and prorated. No downtime."

## Upgrading Your Plan

Upgrades take effect **immediately** with no downtime.

Billing is prorated: you pay only for the days remaining in your current
billing period at the new plan price, minus credit for unused days on your
old plan.

**Example**: Upgrade from $10/mo to $20/mo on day 15 of a 30-day cycle.
You owe $5 (half of $10 additional for the remaining 15 days).

To upgrade: Settings > Billing > Change Plan.
::

:: block id=blk:data-export type=definition about=@ent:account priority=normal
@confidence: 1.0
@tags: ["export", "data", "portability", "download"]
@summary: "Export all data via Settings > Account > Export Data. CSV and JSON formats."

## Exporting Your Data

You can export all your data at any time:

1. Go to **Settings > Account > Export Data**
2. Choose format: **CSV** (spreadsheets) or **JSON** (developers)
3. Click **Request Export**
4. You'll receive a download link by email within 30 minutes

The export includes all your content, settings, and account history.
Export files are available for download for 7 days.
::

:: block id=blk:cancellation type=definition about=@ent:billing priority=normal
@confidence: 1.0
@tags: ["cancel", "cancellation", "subscription"]
@summary: "Cancel anytime, no fee. Access continues until end of billing period."

## Cancelling Your Subscription

You can cancel any time: **Settings > Billing > Cancel Subscription**.

- **No cancellation fee** for any plan
- **Access continues** until the end of your current billing period
- **Data is retained** for 90 days after cancellation; export before it expires
- **Reactivation**: Simply subscribe again; your data is restored immediately

Cancellation is immediate and does not trigger a refund for the current period.
::
```

**How it works**: The `ctx:quick-answers` node is always included (`collapse=false`, `priority=critical`) and contains a dense one-line summary of every FAQ topic. When a RAG system operates with a small token budget, it retrieves this summary block first. The full FAQ blocks have high `@confidence` and clear `@tags` for retrieval. Entity nodes for topics enable graph-based routing: a question tagged "billing" can be matched against blocks with `about=@ent:billing`.

**Variations**:
- Add `@lang` fields and duplicate blocks in multiple languages for multilingual support
- Use `priority=archive` on outdated FAQ entries rather than deleting them — they're still queryable but de-prioritized
- Add `include` nodes to pull in product-specific FAQ files: `@filter: {kind: "block", tags: ["billing"]}`

---

## Recipe 8: Project Architecture Document

**Level**: L1
**Use case**: Document system architecture as a queryable knowledge graph — services, dependencies, and communication patterns all first-class.
**Key kinds used**: `meta`, `entity`, `rel`, `block`, `schema`

```ukdl
%% System architecture as a knowledge graph

:: meta id=doc:platform-arch title="Platform Architecture" created="2026-03-16"
@author: "architecture-team"
@lang: "en"
@version: "1.0"
@domain: "engineering.architecture.platform"
@tags: ["architecture", "services", "infra"]
@ukdl_level: 1
::

%% ═══ Schema ═══

:: schema id=sch:service-entity
@applies_to: {kind: "entity", type: "System"}
@required_fields: ["lang"]
@optional_fields: ["repo", "owner", "sla_uptime", "sla_latency"]
@field_types: {
  lang: "string",
  repo: "string(uri)",
  owner: "string",
  sla_uptime: "number",
  sla_latency: "string"
}
::

%% ═══ Services ═══

:: entity id=ent:api-gateway type=System labels.en="API Gateway"
@lang: "go"
@repo: "https://github.com/example/api-gateway"
@owner: "platform-team"
@sla_uptime: 99.99
@sla_latency: "p99 < 50ms"

Single ingress point for all external traffic. Handles auth token validation,
rate limiting, and routing to downstream services.
::

:: entity id=ent:auth-service type=System labels.en="Auth Service"
@lang: "go"
@repo: "https://github.com/example/auth-service"
@owner: "security-team"
@sla_uptime: 99.99
@sla_latency: "p99 < 30ms"

Issues and validates JWT tokens. Source of truth for user identity.
::

:: entity id=ent:search-service type=System labels.en="Search Service"
@lang: "python"
@repo: "https://github.com/example/search-service"
@owner: "search-team"
@sla_uptime: 99.9
@sla_latency: "p99 < 200ms"

Full-text search over user content. Backed by Elasticsearch 8.x.
::

:: entity id=ent:content-service type=System labels.en="Content Service"
@lang: "typescript"
@repo: "https://github.com/example/content-service"
@owner: "product-team"
@sla_uptime: 99.95
@sla_latency: "p99 < 100ms"

CRUD operations for all user-created content. Publishes change events
to Kafka for downstream consumers.
::

:: entity id=ent:notification-service type=System labels.en="Notification Service"
@lang: "python"
@owner: "platform-team"
@sla_uptime: 99.5

Sends email, push, and in-app notifications. Consumes events from Kafka.
::

%% ═══ Databases and Infrastructure ═══

:: entity id=ent:postgres type=System labels.en="PostgreSQL"
@aliases: ["Postgres", "RDS"]
Primary relational database. Hosts content, user, and auth data.
::

:: entity id=ent:elasticsearch type=System labels.en="Elasticsearch"
Search index. Populated via CDC from Postgres.
::

:: entity id=ent:kafka type=System labels.en="Kafka"
@aliases: ["Message Queue", "Event Bus"]
Event streaming platform. Decouples content writes from downstream consumers.
::

:: entity id=ent:redis type=System labels.en="Redis"
Session cache and rate limit counters. Used by api-gateway and auth-service.
::

%% ═══ Relations ═══

:: rel id=rel:gateway-calls-auth type=communicates_with from=@ent:api-gateway to=@ent:auth-service
@confidence: 1.0
All requests are authenticated at the gateway before forwarding.
::

:: rel id=rel:gateway-routes-content type=communicates_with from=@ent:api-gateway to=@ent:content-service
@confidence: 1.0
::

:: rel id=rel:gateway-routes-search type=communicates_with from=@ent:api-gateway to=@ent:search-service
@confidence: 1.0
::

:: rel id=rel:content-uses-postgres type=deployed_on from=@ent:content-service to=@ent:postgres
@confidence: 1.0
::

:: rel id=rel:content-publishes-kafka type=produces from=@ent:content-service to=@ent:kafka
@confidence: 1.0
Content change events (created, updated, deleted) published to `content.changes` topic.
::

:: rel id=rel:search-consumes-kafka type=consumes from=@ent:search-service to=@ent:kafka
@confidence: 1.0
Consumes `content.changes` to keep Elasticsearch index current.
::

:: rel id=rel:notifications-consumes-kafka type=consumes from=@ent:notification-service to=@ent:kafka
@confidence: 1.0
Consumes `content.changes` and `user.events` topics.
::

:: rel id=rel:search-uses-es type=deployed_on from=@ent:search-service to=@ent:elasticsearch
@confidence: 1.0
::

:: rel id=rel:gateway-uses-redis type=deployed_on from=@ent:api-gateway to=@ent:redis
Used for rate limit counters and session token cache.
::

:: rel id=rel:auth-depends-postgres type=depends_on from=@ent:auth-service to=@ent:postgres
User records and token revocation list stored in Postgres.
::

%% ═══ Architecture Notes ═══

:: block id=blk:data-flow type=explanation priority=high
@summary: "Write path: gateway -> content-service -> postgres + kafka -> search/notifications."

## Data Flow

**Write path**: External client → API Gateway (auth check) → Content Service
→ Postgres (source of truth) + Kafka (event publish) → Search Service
(index update) and Notification Service (fan-out).

**Read path**: External client → API Gateway → Content Service (direct Postgres
query) or Search Service (Elasticsearch query).

The search index is eventually consistent. Typical lag is under 500ms.
::

:: block id=blk:failure-modes type=warning priority=high
@summary: "Elasticsearch failure degrades search but doesn't affect reads/writes."

## Failure Mode Analysis

| Service fails | Impact | Degraded behavior |
|--------------|--------|-------------------|
| auth-service | All requests blocked | Cached tokens valid for 5 min |
| content-service | No writes | Reads from read replica |
| search-service | Search unavailable | Content browsing unaffected |
| kafka | No event propagation | Search index stale; notifications delayed |
| postgres | Full outage | No mitigation; highest priority restore |
::
```

**How it works**: Each service is an `entity` with typed fields for owner, repo, and SLA. The `schema` node validates that every `System` entity has a `lang` field — missing owners and languages are caught at parse time. Relations with types like `communicates_with`, `depends_on`, `produces`, and `consumes` form a directed graph that can be exported to Cypher or GraphViz automatically. `ukdl export --format cypher` produces a Neo4j import file from this document.

**Variations**:
- Add `@valid_from` and `@valid_to` to relations to track when dependencies were introduced or removed
- Use `@deprecated: true` on decommissioned services with `@superseded_by` pointing to their replacement
- Add `rel type=similar_to` between services to document intended consolidation targets

---

## Recipe 9: Onboarding Guide

**Level**: L4
**Use case**: New employee onboarding that adapts content based on their role and experience level, so engineers, designers, and PMs each see relevant information first.
**Key kinds used**: `meta`, `entity`, `context`, `quantum`, `block`

```ukdl
%% Adaptive new hire onboarding — adapts to role and experience level

:: meta id=doc:onboarding title="New Employee Onboarding Guide" created="2026-03-16"
@author: "people-team"
@lang: "en"
@version: "2.0"
@domain: "people.onboarding"
@tags: ["onboarding", "new-hire", "adaptive"]
@ukdl_level: 4
::

%% ═══ Context Layers ═══

:: context id=ctx:day-one priority=critical depth=overview collapse=false
@summary: "Day 1: laptop setup, badge pickup at reception, 10am welcome call with your manager."

## Day One Checklist

Everything you need for your first day, regardless of role:

1. Pick up your badge and laptop from reception (bring government ID)
2. Join the 10am welcome call — link in your offer letter email
3. Set up your accounts: see IT setup instructions below
4. Meet your onboarding buddy — they'll reach out by 11am
::

:: context id=ctx:company-values priority=high depth=standard collapse=true
@summary: "Core values: ship fast, own your work, be direct, assume good faith."

## Company Values

**Ship fast** — a working thing is better than a perfect plan. We iterate.
**Own your work** — if you see a problem, you own it until it's solved.
**Be direct** — say what you mean, especially in disagreement.
**Assume good faith** — when in doubt, assume positive intent.

Values are lived, not posted. Ask your manager for examples from the last quarter.
::

%% ═══ Role Quantum State ═══

:: quantum id=qst:role
@states: {engineer: 0.34, designer: 0.33, pm: 0.33}
@observe_on: "role_selection"
@default: "engineer"
@history: false

New hire's role. Observed from their role selection on the onboarding portal.
No decay — role is permanent.
::

:: quantum id=qst:experience-level
@states: {junior: 0.33, mid: 0.34, senior: 0.33}
@observe_on: "experience_selection"
@entangle: @qst:role
@entangle_matrix: {
  engineer-junior: 0.4, engineer-mid: 0.4, engineer-senior: 0.2,
  designer-junior: 0.35, designer-mid: 0.45, designer-senior: 0.2,
  pm-junior:       0.25, pm-mid:       0.45, pm-senior:      0.3
}
@default: "mid"
@history: false

Self-reported experience level, correlated with role.
::

%% ═══ Adaptive Content ═══

:: block id=blk:tools-setup type=lesson priority=high
@when: @qst:role
@summary: "Role-specific tool setup instructions."

# Tool Setup

|if: @qst:role == engineer|
## Engineering Setup

1. **Clone the repo**: `git clone git@github.com:example/platform.git`
2. **Install dependencies**: run `make bootstrap` in the repo root
3. **Start local services**: `docker compose up -d`
4. **Run tests**: `make test` — all should pass before you write a line

Your first PR should be a small, uncontroversial change. Fix a typo,
add a missing test, update a doc comment. Get familiar with the review process.

|elif: @qst:role == designer|
## Design Setup

1. **Figma**: Accept the organization invite in your email
2. **Design system**: Open the `Platform Design System` file and duplicate it
3. **Storybook**: Run `npm run storybook` in the `frontend` repo to see all components
4. **Tokens**: All design tokens are in `design-tokens/` as JSON; export from Figma syncs automatically

First task: review the current component library and note anything
that seems inconsistent. Bring your notes to your first design review.

|else|
## PM Setup

1. **Linear**: Accept the workspace invite; you'll see all active projects
2. **Notion**: The product wiki is your primary reference; link in your email
3. **Mixpanel**: Request access via the #analytics Slack channel
4. **Roadmap**: The current roadmap is in Linear under the `Roadmap` view

First week goal: read the last three post-mortems. They'll tell you more
about how we actually work than any wiki page.
|/if|
::

:: block id=blk:first-week type=lesson priority=high
@when: @qst:experience-level
@summary: "First week expectations, calibrated to experience level."

# First Week Expectations

|if: @qst:experience-level == junior|
Your first week is observation mode. Attend every meeting you're invited to,
take notes, and ask questions freely — there are no dumb questions in week one.

**Your only goal**: understand how information flows. Who talks to whom?
Where do decisions get made? How do you find out about work?

Don't ship anything in week one. Focus entirely on learning the system.

|elif: @qst:experience-level == mid|
You have enough experience to start contributing quickly, but resist the urge
to change things in week one. Understand the why before proposing the how.

**Your goal by end of week**: one small contribution merged (engineer/designer)
or one spec read and annotated with questions (PM). Make your presence known
without stepping on anyone's flow.

|else|
Senior hires have a specific risk: moving too fast based on pattern-matching
to previous companies. Our context is different.

**Your goal week one**: identify three ways we work that surprise you. These
are either opportunities or things to understand more deeply before acting.

By week two, you'll have a clearer picture of where your leverage is highest.
Don't commit to a direction until then.
|/if|
::

:: block id=blk:key-people type=note priority=normal
@summary: "Key contacts: IT (it@example.com), HR (hr@example.com), your manager."

## Key Contacts

| Role | Contact | For |
|------|---------|-----|
| IT Support | it@example.com | Laptop issues, access requests |
| HR | hr@example.com | Benefits, payroll, policies |
| Your manager | In your calendar invite | Everything else |
| Onboarding buddy | Reaches out day 1 | Unofficial questions |

The #new-hires Slack channel is the best place for questions you don't
know who to ask. Someone always knows the answer.
::
```

**How it works**: Two quantum variables — `qst:role` and `qst:experience-level` — are observed from the new hire's selections on the onboarding portal. The entanglement matrix encodes domain knowledge: PMs skew toward senior, engineers skew toward mid and junior. Each content block uses `@when` and `|if:|` directives to serve role-specific or level-specific content. A senior PM and a junior engineer reading the same `.ukdl` file see completely different "first week expectations" sections.

**Variations**:
- Add a third quantum variable `qst:team` for team-specific content
- Use `include` nodes to pull in team-specific `.ukdl` files: `@filter: {tags: ["engineering"]}`
- Add `@decay: {function: "exponential", half_life: "90d"}` to the experience-level quantum so the system re-assesses after three months

---

## Recipe 10: Vibe Coding — App from Intent

**Level**: L3
**Use case**: Describe what you want in plain language; an AI agent chain scaffolds, builds, tests, and deploys it.
**Key kinds used**: `meta`, `entity`, `rel`, `block`, `action`, `pipeline`

```ukdl
%% Vibe coding — describe what you want, let the AI figure out how

:: meta id=doc:link-manager title="Build Me a Link Manager" created="2026-03-16"
@author: "vibe-coder"
@lang: "en"
@version: "1.0"
@domain: "engineering.web.productivity"
@tags: ["vibe-coding", "link-manager", "ai-generated"]
@ukdl_level: 3
::

%% ═══ Vision ═══

:: block id=blk:vision type=definition priority=critical
@confidence: 1.0

## What I Want

A **personal link manager** that:
- Saves URLs with automatic title and description extraction
- Organizes links by tag (not folder — tags, so one link can be in multiple categories)
- Full-text search across titles, descriptions, and tags
- Browser extension for one-click saving while browsing
- Clean, fast web UI — no accounts, no sharing, single user
- Data stored locally with optional Dropbox/iCloud sync

**Not wanted**: social features, recommendations, RSS, newsletters.
Keep it simple and fast. The whole app should feel like it loads in 50ms.
::

%% ═══ Knowledge Graph ═══

:: entity id=ent:link type=Concept labels.en="Link"
@aliases: ["Bookmark", "URL"]
A saved URL with extracted metadata.
::

:: entity id=ent:tag type=Concept labels.en="Tag"
A user-defined label that can be applied to multiple links.
::

:: entity id=ent:search-index type=System labels.en="Local Search Index"
Full-text search index over saved links. Client-side using SQLite FTS5.
::

:: entity id=ent:sync-adapter type=System labels.en="Sync Adapter"
Handles optional cloud sync to Dropbox or iCloud Drive via file-based sync.
::

:: rel id=rel:link-has-tags type=part_of from=@ent:link to=@ent:tag
Links can have multiple tags; tags can contain multiple links.
::

:: rel id=rel:search-indexes-links type=about from=@ent:search-index to=@ent:link
::

:: rel id=rel:sync-manages-links type=manages from=@ent:sync-adapter to=@ent:link
::

%% ═══ Actions ═══

:: action id=act:scaffold agent=code-gen trigger="project_start"
@tool: "project_scaffolder"
@input: {
  stack: "sveltekit",
  database: "sqlite",
  styling: "tailwind",
  entities: [@ent:link, @ent:tag, @ent:search-index, @ent:sync-adapter]
}
@output: "./link-manager/"
@timeout: 60000

Scaffold the project. SvelteKit for the web app, SQLite for local storage,
Tailwind for styling. Generate folder structure, package.json, and db schema.
::

:: action id=act:build-core agent=backend-ai trigger="scaffold_complete"
@tool: "feature_builder"
@input: {
  features: ["link_crud", "tag_management", "metadata_extraction", "fts_search"],
  database: "sqlite_fts5",
  api: "rest"
}
@output: "./link-manager/src/lib/"
@depends_on: @act:scaffold
@timeout: 120000

Build the core: CRUD for links and tags, metadata extraction via OpenGraph,
and SQLite FTS5 search. Keep it all local, no external services.
::

:: action id=act:build-ui agent=frontend-ai trigger="scaffold_complete"
@tool: "ui_builder"
@input: {
  design: "minimal, fast, single-page, no animations",
  views: ["link_list", "tag_filter", "search", "add_link"],
  keyboard_shortcuts: true,
  dark_mode: true
}
@output: "./link-manager/src/routes/"
@depends_on: @act:scaffold
@timeout: 120000

Build the UI. Prioritize keyboard navigation and sub-50ms interactions.
No skeleton loaders — if it needs a loader, make it faster instead.
::

:: action id=act:build-extension agent=frontend-ai trigger="act:build-core.complete"
@tool: "browser_extension_builder"
@input: {
  manifest_version: 3,
  action: "save_current_page",
  api_base: "http://localhost:5173"
}
@output: "./link-manager-extension/"
@depends_on: @act:build-core
@timeout: 60000

Build a minimal Manifest V3 browser extension. One button: save this page.
Calls the local app's API. No permissions beyond `activeTab`.
::

:: action id=act:test agent=qa-ai trigger="all_implementations_complete"
@tool: "test_suite_builder"
@input: {
  coverage_target: 85,
  types: ["unit", "integration"],
  framework: "vitest",
  focus: ["search_correctness", "metadata_extraction", "sync_roundtrip"]
}
@output: "./link-manager/tests/"
@depends_on: [@act:build-core, @act:build-ui]
@timeout: 90000
::

%% ═══ Pipeline ═══

:: pipeline id=pipe:build-link-manager
@goal: "ship_working_link_manager"
@criteria: ["test_coverage", "lighthouse_performance_score", "e2e_core_flow_passing"]
@interval: "once"
@max_iterations: 8
@stages: [
  {name: "scaffold",        action: @act:scaffold},
  {name: "build_core",      action: @act:build-core},
  {name: "build_ui",        action: @act:build-ui},
  {name: "build_extension", action: @act:build-extension},
  {name: "test",            action: @act:test}
]
@feedback: {
  positive: "complete",
  negative: {adjust: {retry: "with_error_context"}},
  stagnant: {escalate: "human_developer"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 3",
  action: "pause_and_notify"
}

Build the link manager from intent to shipping. Stop when tests pass.
::
```

**How it works**: The vision block is free-form English describing what you want. Entity and relation nodes translate that intent into a machine-readable knowledge graph. Each action node expresses WHAT to build (scaffold, build core, build UI) and passes entity references as structured input — the AI agent receives `@ent:link` and `@ent:tag` as context rather than unstructured English. The pipeline enforces ordering: the extension can't be built until the core API exists. `@depends_on` creates a partial order that the runtime resolves into a parallel build plan.

**Variations**:
- Add `@input: {style_reference: "https://...screenshot.png"}` to pass visual references to UI agents
- Remove the pipeline for a simpler sequential run: trigger each action manually with `ukdl run --action act:scaffold`
- Add a `quantum` node for tech stack preference and let the system adapt the scaffold

---

## Recipe 11: Multi-Language Documentation

**Level**: L1
**Use case**: An internationalized knowledge base where entities and blocks carry native labels, enabling language-specific rendering without document duplication.
**Key kinds used**: `meta`, `entity`, `rel`, `block`, `include`

```ukdl
%% Multilingual knowledge base — one document, multiple languages

:: meta id=doc:ml-concepts title="Machine Learning Core Concepts" created="2026-03-16"
@author: "ml-team"
@lang: "en"
@version: "1.0"
@domain: "ml.concepts"
@tags: ["ml", "multilingual", "concepts"]
@ukdl_level: 1
::

%% ═══ Multilingual Entities ═══

:: entity id=ent:neural-network type=Concept
  labels.en="Neural Network"
  labels.ko="신경망"
  labels.ja="ニューラルネットワーク"
  labels.zh="神经网络"
@aliases: ["NN", "ANN", "Artificial Neural Network"]
@same_as: ["https://www.wikidata.org/wiki/Q11660"]

A computing system loosely inspired by the biological neural networks
that constitute animal brains.
::

:: entity id=ent:gradient-descent type=Process
  labels.en="Gradient Descent"
  labels.ko="경사 하강법"
  labels.ja="勾配降下法"
  labels.zh="梯度下降"
@aliases: ["SGD", "Stochastic Gradient Descent"]
@same_as: ["https://www.wikidata.org/wiki/Q1157346"]

An iterative optimization algorithm for finding a function's local minimum.
::

:: entity id=ent:backpropagation type=Process
  labels.en="Backpropagation"
  labels.ko="역전파"
  labels.ja="誤差逆伝播法"
  labels.zh="反向传播"
@aliases: ["backprop", "backward pass"]

Algorithm for efficiently computing gradients in neural networks
by applying the chain rule layer by layer.
::

:: entity id=ent:loss-function type=Concept
  labels.en="Loss Function"
  labels.ko="손실 함수"
  labels.ja="損失関数"
  labels.zh="损失函数"
@aliases: ["cost function", "objective function"]

A function that measures how far the model's predictions are from the truth.
::

%% ═══ Relations ═══

:: rel id=rel:backprop-computes type=part_of from=@ent:backpropagation to=@ent:gradient-descent
@confidence: 1.0
Backpropagation is the algorithm that computes the gradient efficiently.
Gradient descent then uses that gradient to update weights.
::

:: rel id=rel:training-loop type=causes from=@ent:gradient-descent to=@ent:loss-function
@confidence: 0.99
The goal of gradient descent is to minimize the loss function.
::

%% ═══ Content Blocks (English) ═══

:: block id=blk:nn-overview type=explanation about=@ent:neural-network priority=high
@lang: "en"
@summary: "Neural networks are composed of layers of interconnected nodes."

## Neural Networks

@{ent:neural-network|Neural networks} are organized in layers: an input layer,
one or more hidden layers, and an output layer. Each node applies a non-linear
activation function to a weighted sum of its inputs.

Training adjusts the weights to minimize the @{ent:loss-function|loss function}
using @{ent:gradient-descent|gradient descent} computed by
@{ent:backpropagation|backpropagation}.
::

:: block id=blk:training-overview type=explanation about=@ent:gradient-descent priority=high
@lang: "en"
@summary: "Training: forward pass computes loss, backward pass computes gradients, optimizer updates weights."

## The Training Loop

1. **Forward pass**: run the input through the network, compute predictions
2. **Compute loss**: measure how wrong the predictions are
3. **Backward pass**: run backpropagation to compute gradients for every weight
4. **Update weights**: apply gradient descent to reduce the loss
5. Repeat for the next batch

One full pass through the training dataset is called an **epoch**.
::

%% ═══ Language-Specific Includes ═══

:: include id=inc:ko-content src="./ml-concepts.ko.ukdl"
@filter: {kind: "block", lang: "ko"}
@namespace: "ko"
::

:: include id=inc:ja-content src="./ml-concepts.ja.ukdl"
@filter: {kind: "block", lang: "ja"}
@namespace: "ja"
::
```

**How it works**: Every entity carries `labels.<lang-code>` attributes for all supported languages. A renderer calling `ukdl render --lang ko` automatically replaces entity display names with their Korean labels throughout the document. The `include` nodes pull in language-specific content files for blocks that need full translation rather than just label substitution. The entity IDs remain stable across languages, so the knowledge graph structure is language-agnostic.

**Variations**:
- Use `@lang` on blocks to indicate the language of the body text
- Run `ukdl export --format json-ld --lang ko` to produce a Korean-labeled knowledge graph
- Add `labels.en-GB` alongside `labels.en-US` for regional variants

---

## Recipe 12: Data Pipeline Specification

**Level**: L5
**Use case**: Replace an Airflow DAG definition with a human-readable, machine-executable UKDL pipeline that includes data quality monitoring and circuit breaking.
**Key kinds used**: `meta`, `entity`, `rel`, `schema`, `context`, `quantum`, `block`, `action`, `pipeline`

```ukdl
%% Data pipeline specification — replacing Airflow DAG definitions

:: meta id=doc:etl-pipeline title="User Events ETL Pipeline" created="2026-03-16"
@author: "data-team"
@lang: "en"
@version: "1.0"
@domain: "data.pipelines.etl"
@tags: ["etl", "data-pipeline", "events", "warehouse"]
@ukdl_level: 5
::

%% ═══ Schema ═══

:: schema id=sch:data-source
@applies_to: {kind: "entity", type: "System"}
@required_fields: ["connection_string", "owner"]
@optional_fields: ["sla_freshness", "record_volume_daily"]
@field_types: {
  connection_string: "string",
  owner: "string",
  sla_freshness: "string",
  record_volume_daily: "integer"
}
::

%% ═══ Context ═══

:: context id=ctx:pipeline-overview priority=critical depth=overview collapse=false
@summary: "Daily ETL: Postgres events -> S3 raw -> transform -> Snowflake warehouse. Runs at 02:00 UTC."

## Pipeline Overview

Extracts user event data from the Postgres operational database, stages it
in S3, transforms and cleans it, and loads it into Snowflake for analytics.

Schedule: daily at 02:00 UTC. SLA: complete by 04:00 UTC.
Owner: data-engineering@example.com
::

%% ═══ Data Sources and Sinks ═══

:: entity id=ent:events-db type=System labels.en="Events Database"
@connection_string: "postgresql://events-reader:***@db.prod/events"
@owner: "platform-team"
@sla_freshness: "realtime"
@record_volume_daily: 5000000

Operational Postgres database. Source of truth for raw user events.
::

:: entity id=ent:s3-staging type=System labels.en="S3 Staging Bucket"
@connection_string: "s3://example-data-staging/events/"
@owner: "data-team"

Intermediate staging area for raw extracted data. Partitioned by date.
::

:: entity id=ent:snowflake-warehouse type=System labels.en="Snowflake Warehouse"
@connection_string: "snowflake://account.snowflakecomputing.com/events_dw"
@owner: "data-team"
@sla_freshness: "T+4h"

Analytics data warehouse. Target for transformed, cleaned event data.
::

:: entity id=ent:transform-job type=Process labels.en="Transform Job"
dbt model running on Spark. Applies cleaning, deduplication, and enrichment.
::

%% ═══ Relations ═══

:: rel id=rel:extract-from type=consumes from=@ent:transform-job to=@ent:events-db
@confidence: 1.0
::

:: rel id=rel:stage-to type=produces from=@ent:transform-job to=@ent:s3-staging
@confidence: 1.0
::

:: rel id=rel:load-to type=produces from=@ent:transform-job to=@ent:snowflake-warehouse
@confidence: 1.0
::

%% ═══ Quantum State for Data Quality ═══

:: quantum id=qst:data-quality
@states: {healthy: 0.8, degraded: 0.15, critical: 0.05}
@observe_on: "quality_check_complete"
@decay: {function: "exponential", half_life: "1d"}
@default: "healthy"
@history: true

Data quality state, observed after each pipeline run's quality checks.
Decays toward uncertainty after 24 hours if no new check runs.
::

%% ═══ Pipeline Actions ═══

:: action id=act:extract agent=etl-runner trigger="schedule_02:00_UTC"
@tool: "postgres_extractor"
@input: {
  source: @ent:events-db,
  query: "SELECT * FROM events WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE",
  output_format: "parquet",
  compression: "snappy"
}
@output: "s3://example-data-staging/events/{{date}}/raw/"
@timeout: 3600000
@retry: {max: 3, backoff: "exponential"}

Extract yesterday's events from Postgres to S3.
::

:: action id=act:validate-extract agent=etl-runner trigger="act:extract.complete"
@tool: "data_validator"
@input: {
  path: "s3://example-data-staging/events/{{date}}/raw/",
  checks: [
    {name: "row_count", min: 1000000, max: 20000000},
    {name: "null_rate", column: "user_id", max: 0.001},
    {name: "schema_match", expected: "event_schema_v3.json"}
  ]
}
@output: "validation_result.json"
@depends_on: @act:extract
@timeout: 600000

Validate extracted data quality before transformation begins.
::

:: action id=act:transform agent=etl-runner trigger="act:validate-extract.complete"
@tool: "dbt_runner"
@input: {
  project: "s3://example-dbt/events-transform/",
  target_db: @ent:snowflake-warehouse,
  models: ["stg_events", "fct_events", "dim_users"],
  vars: {run_date: "{{date}}"}
}
@output: "transform_result.json"
@depends_on: @act:validate-extract
@guard: @act:validate-extract.status == "passed"
@timeout: 5400000
@retry: {max: 2, backoff: "exponential"}

Run dbt transformation. Skipped if validation fails.
::

:: action id=act:quality-check agent=etl-runner trigger="act:transform.complete"
@tool: "great_expectations_runner"
@input: {
  suite: "events_warehouse_suite",
  datasource: @ent:snowflake-warehouse,
  table: "fct_events",
  partition: "{{date}}"
}
@output: "quality_check_result.json"
@depends_on: @act:transform
@timeout: 600000

Run Great Expectations suite against loaded data.
::

:: action id=act:notify-success agent=etl-runner trigger="act:quality-check.complete"
@tool: "slack_notifier"
@input: {
  channel: "#data-pipelines",
  message: "Events ETL complete for {{date}}. Rows loaded: {{act:transform.output.rows_loaded}}."
}
@depends_on: @act:quality-check
@guard: @qst:data-quality == "healthy"
@timeout: 10000
::

:: action id=act:notify-failure agent=etl-runner trigger="pipeline_circuit_broken"
@tool: "pagerduty_alerter"
@input: {
  service: "data-pipeline-etl",
  severity: "high",
  summary: "Events ETL failed for {{date}}. Check logs in S3."
}
@timeout: 10000
::

%% ═══ Pipeline ═══

:: pipeline id=pipe:events-etl
@goal: "load_daily_events_to_warehouse"
@criteria: ["row_count_within_range", "null_rate_below_threshold", "schema_validation_passed"]
@interval: "daily"
@max_iterations: 3
@stages: [
  {name: "extract",          action: @act:extract},
  {name: "validate_extract", action: @act:validate-extract},
  {name: "assess_quality",   quantum: @qst:data-quality},
  {name: "transform",        action: @act:transform},
  {name: "quality_check",    action: @act:quality-check},
  {name: "notify",           action: @act:notify-success}
]
@feedback: {
  positive: "mark_complete_and_update_catalog",
  negative: {adjust: {retry: "with_backfill_flag"}},
  stagnant: {escalate: "on-call-data-engineer"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 2",
  action: "pause_and_notify"
}

Daily ETL pipeline for user events. SLA: complete by 04:00 UTC.
::
```

**How it works**: The pipeline sequence mirrors an Airflow DAG but is written in human-readable UKDL. The `@guard: @act:validate-extract.status == "passed"` field on the transform action implements skip logic — if extraction validation fails, the transform is never attempted. The quantum variable `qst:data-quality` collapses after quality checks run, enabling downstream conditional content. The `@circuit_breaker` fires after two consecutive failures, triggering PagerDuty via `act:notify-failure`. Unlike Airflow Python DAGs, this file is readable by a data analyst without knowing Python.

**Variations**:
- Add `@entangle_matrix` between `qst:data-quality` and a `qst:source-health` variable to model correlated failures
- Use `@interval: "hourly"` for near-realtime pipelines
- Add `@filter: {priority: "critical"}` to a `context` node to produce an on-call runbook view

---

> All recipes in this cookbook produce valid UKDL that passes `ukdl parse` at the declared level. Copy any code block directly to a `.ukdl` file to use it.
