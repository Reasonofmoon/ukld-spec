# UKDL — Unified Knowledge & Dynamics Language

## v2.0 Standard Specification

### The language humans write, AI understands, and knowledge executes.

**March 2026 | Formal Standardization**

---

## Abstract

UKDL (Unified Knowledge & Dynamics Language) is a document-programming hybrid language where every document is simultaneously:

- **A readable text** — as simple as Markdown at Level 0
- **A knowledge graph** — entities and relations form queryable structure
- **An executable program** — actions, pipelines, and adaptive state machines

UKDL supersedes Markdown for authoring, YAML/JSON for configuration, and bespoke DSLs for AI orchestration by unifying all three concerns in a single, progressively-disclosed grammar.

---

## 0. Design Principles

### 0.1 The Three Laws of UKDL

1. **Readability First** — Any UKDL document, at any complexity level, must be immediately comprehensible to a human reader who has never seen the spec. If a reader can't guess what a construct does, the construct is wrong.

2. **Parse Precision** — Every semantic unit is unambiguously machine-extractable without heuristics. No "maybe it's a heading, maybe it's bold" ambiguity (Markdown's curse). No whitespace-sensitivity (YAML's curse).

3. **Living Documents** — Documents are not dead text. They carry state, respond to conditions, adapt to context, and orchestrate actions. A UKDL file is a program that happens to be readable.

### 0.2 The Progressive Disclosure Pyramid

```
                    ┌──────────┐
                    │    L5    │  Orchestrated: pipeline, self-optimize
                   ┌┴──────────┴┐
                   │     L4     │  Dynamic: quantum states, entanglement
                  ┌┴────────────┴┐
                  │      L3      │  Executable: actions, triggers, tools
                 ┌┴──────────────┴┐
                 │       L2       │  Context: LLM window optimization
                ┌┴────────────────┴┐
                │        L1        │  Semantic: entities, relations, knowledge graph
               ┌┴──────────────────┴┐
               │         L0          │  Pure: blocks + Markdown body (replaces .md)
               └─────────────────────┘
```

| Level | Name | Constructs Added | Typical User | Replaces |
|-------|------|-----------------|--------------|----------|
| L0 | Pure | `meta`, `block` | Anyone who writes | Markdown, plain text |
| L1 | Semantic | `entity`, `rel`, `schema` | Knowledge workers | Wiki markup, RDF/OWL |
| L2 | Context | `context`, `include` | RAG/LLM engineers | Prompt templates |
| L3 | Executable | `action` | AI agent builders | LangChain YAML, DSPy |
| L4 | Dynamic | `quantum` | Adaptive system designers | Custom state machines |
| L5 | Orchestrated | `pipeline` | Full-stack AI architects | Airflow, Temporal |

**Backward compatibility guarantee**: An L0 document is valid L5. A parser at level N correctly processes all documents at level ≤ N.

---

## 1. Lexical Grammar

### 1.1 Encoding

- Files MUST be UTF-8
- File extension: `.ukdl`
- MIME type: `text/ukdl` (proposed)
- Line endings: LF (U+000A) preferred; CRLF tolerated

### 1.2 Comments

```ukdl
%% Single-line comment (everything after %% to end of line)

(( Multi-line block comment.
   Can span any number of lines.
   Cannot be nested. ))
```

**Rationale**: `%%` is visually distinct from all common programming comment styles (`//`, `#`, `--`), preventing copy-paste confusion. `(( ))` is chosen over `/* */` to avoid conflict with glob patterns and regex.

### 1.3 Identifiers

```
identifier = [a-zA-Z_] [a-zA-Z0-9_-]* ;
```

Identifiers are case-sensitive. Hyphens are allowed (kebab-case is idiomatic for IDs).

### 1.4 String Literals

```ukdl
@field: "double-quoted string with \"escapes\""
@field: 'single-quoted string (no escapes, raw)'
@field: """
  Multi-line string.
  Leading whitespace is stripped to the minimum indent.
"""
```

**New in v2.0**: Triple-quoted strings for multi-line values, resolving the v1.0 ambiguity of where field values end and body text begins.

### 1.5 Value Types

| Type | Syntax | Examples |
|------|--------|---------|
| String | `"..."` or `'...'` | `"hello"`, `'raw\nstring'` |
| Number | JSON number | `42`, `3.14`, `-1`, `1e10` |
| Boolean | `true` / `false` | |
| Null | `null` | |
| Date | ISO 8601 | `2026-03-16`, `2026-03-16T14:30:00Z` |
| Array | `[...]` | `["a", "b", 3]` |
| Object | `{...}` | `{key: "value", n: 42}` |
| Reference | `@prefix:name` | `@ent:photosynthesis` |
| Display Ref | `@{prefix:name\|text}` | `@{ent:atp\|ATP molecule}` |

**Object shorthand**: Keys without quotes are valid identifiers. Values follow the same type rules recursively.

---

## 2. Node Grammar (The Core Construct)

Everything in UKDL is a **node**. A node is opened with `::` and closed with `::` on its own line.

### 2.1 Canonical Form

```ukdl
:: <kind> id=<prefix:name> [header-attributes...]
@field: <value>
@field: <value>

Free-form body text. Supports **Markdown** inline formatting,
@{ent:some-entity|inline references}, and |if:| conditionals.

::
```

### 2.2 Formal Syntax (EBNF)

```ebnf
document      = { comment | node | blank_line } ;

node          = node_open NL
                { field | directive | body_line }
                node_close NL ;

node_open     = "::" SP kind SP "id=" id_value { SP attr } ;
node_close    = "::" ;

kind          = "meta" | "block" | "entity" | "rel" | "schema"
              | "include" | "context" | "action" | "quantum"
              | "pipeline" | IDENTIFIER ;

id_value      = prefix ":" IDENTIFIER ;
prefix        = "doc" | "blk" | "ent" | "rel" | "sch" | "inc"
              | "ctx" | "act" | "qst" | "pipe" | IDENTIFIER ;

attr          = IDENTIFIER "=" value ;
field         = "@" IDENTIFIER ":" SP value NL ;

reference     = "@" prefix ":" IDENTIFIER ;
display_ref   = "@{" prefix ":" IDENTIFIER "|" TEXT "}" ;

directive     = conditional | multimodal | function_def | loop ;

conditional   = "|if:" expr "|" NL body
                { "|elif:" expr "|" NL body }
                [ "|else|" NL body ]
                "|/if|" NL ;

multimodal    = "|multimodal_output|" NL
                { "[" modality "]" SP content NL }
                "|/multimodal_output|" NL ;

function_def  = "|function:" IDENTIFIER "(" params ")" "|" NL
                body
                "|/function|" NL ;

loop          = "|for:" IDENTIFIER "in" expr "|" NL
                body
                "|/for|" NL ;

body_line     = (* any text not matching field, directive, or node_close *) ;

comment       = "%%" (* to end of line *)
              | "((" (* block text *) "))" ;

value         = STRING | NUMBER | BOOLEAN | NULL | DATE
              | ARRAY | OBJECT | reference | display_ref ;

expr          = reference SP comparator SP value
              | reference SP "in" SP ARRAY
              | "not" SP expr
              | expr SP ("and" | "or") SP expr
              | "(" expr ")" ;

comparator    = "==" | "!=" | ">" | "<" | ">=" | "<=" ;
```

### 2.3 Critical Clarifications (New in v2.0)

**Field vs. Body boundary**: Lines starting with `@` followed by a valid identifier and `:` are fields. All other lines (including lines starting with `@` that don't match this pattern) are body text. Fields MUST appear before the first body line.

**Nested nodes**: Nodes CANNOT be nested. Use references to link nodes. This keeps the parser a simple state machine (O(n) single-pass).

**Unknown kinds**: Any `kind` not in the standard 10 is treated as an alias for `block` with `type=<kind>`. This enables domain-specific extensions without parser changes:

```ukdl
:: theorem id=blk:pythagorean type=theorem
%% Parsed as block with type=theorem
::
```

**Empty nodes**: A node with no fields and no body is valid. Useful for declaring entities:

```ukdl
:: entity id=ent:gravity type=Concept labels.en="Gravity"
::
```

---

## 3. The 10 Standard Kinds

### 3.0 `meta` — Document Metadata (L0)

One per document, MUST be the first node.

```ukdl
:: meta id=doc:my-document title="Document Title" created="2026-03-16"
@author: "author-name"
@lang: "en"
@version: "2.0"
@domain: "science.physics.mechanics"
@tags: ["physics", "newton", "classical"]
@ukdl_level: 3
@license: "CC-BY-4.0"
::
```

**Required attributes**: `id`, `title`
**Required fields**: `@author`, `@lang`, `@version`
**New in v2.0**: `@ukdl_level` declares the maximum complexity level used, enabling parsers to skip unsupported features gracefully. `@license` for open knowledge sharing.

### 3.1 `block` — Knowledge Chunk (L0)

The fundamental content unit. Each block is a self-contained piece of knowledge suitable for RAG retrieval.

```ukdl
:: block id=blk:newton-first-law type=principle about=@ent:newton-laws priority=high
@confidence: 0.99
@source: "https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion"
@summary: "An object at rest stays at rest unless acted upon by a force."

Newton's First Law (Law of Inertia):

An object at rest remains at rest, and an object in motion remains in motion
at constant speed and in a straight line, unless acted on by an unbalanced force.

This is sometimes called the **law of inertia**. It was first formulated by
@{ent:galileo|Galileo Galilei} and later refined by @{ent:newton|Isaac Newton}.
::
```

**Standard `type` values**: `definition`, `explanation`, `example`, `proof`, `claim`, `evidence`, `lesson`, `exercise`, `function`, `note`, `warning`

### 3.2 `entity` — Knowledge Graph Node (L1)

Declares a named concept, person, process, system, or any discrete "thing" in the knowledge domain.

```ukdl
:: entity id=ent:newton type=Person labels.en="Isaac Newton" labels.ko="아이작 뉴턴"
@born: "1643-01-04"
@died: "1727-03-31"
@aliases: ["Sir Isaac Newton"]
@same_as: ["https://www.wikidata.org/wiki/Q935"]

English mathematician, physicist, and astronomer.
::
```

**Standard `type` values**: `Concept`, `Process`, `Person`, `System`, `Event`, `Place`, `Molecule`, `Organization`, `Tool`, `Theory`

**Multilingual labels**: `labels.<lang-code>` attributes enable multilingual knowledge graphs without duplication.

### 3.3 `rel` — Relation / Edge (L1)

First-class, reifiable relation between any two nodes. Unlike most knowledge formats where edges are second-class, UKDL relations carry their own metadata, confidence scores, and provenance.

```ukdl
:: rel id=rel:newton-gravity type=discovered from=@ent:newton to=@ent:gravity
@confidence: 0.95
@source: "Principia Mathematica, 1687"
@valid_from: "1687-07-05"

Newton formulated the law of universal gravitation.
::
```

**Required attributes**: `type`, `from`, `to`

**Standard relation types**: `is_a`, `part_of`, `causes`, `caused_by`, `occurs_in`, `has_stage`, `produces`, `consumes`, `discovered`, `depends_on`, `contradicts`, `supports`, `similar_to`, `used_by`, `about`

### 3.4 `schema` — Validation Rule (L1)

Defines structural constraints that nodes must satisfy.

```ukdl
:: schema id=sch:person-entity
@applies_to: {kind: "entity", type: "Person"}
@required_fields: ["born"]
@optional_fields: ["died", "aliases", "same_as"]
@field_types: {
  born: "date",
  died: "date",
  aliases: "array<string>",
  same_as: "array<uri>"
}
::
```

### 3.5 `include` — External File Inclusion (L2)

```ukdl
:: include id=inc:chapter2 src="./chapter-2.ukdl"
@filter: {kind: "block", priority: ["high", "critical"]}
@namespace: "ch2"
::
```

**New in v2.0**: `@filter` allows selective inclusion (critical for context window management). `@namespace` prevents ID collisions across included files.

### 3.6 `context` — LLM Context Window Optimization (L2)

The construct that makes UKDL natively AI-aware. Each context node declares how its content should be prioritized, summarized, and collapsed as token budgets shrink.

```ukdl
:: context id=ctx:overview priority=critical depth=overview
@summary: "Newton's three laws govern classical mechanics."
@collapse: false
@max_tokens: 500

Newton's laws of motion are three physical laws that describe the relationship
between the motion of an object and the forces acting on it.
::

:: context id=ctx:derivation priority=low depth=detailed collapse=true
@summary: "Mathematical derivation of F=ma from first principles."
@max_tokens: 3000

[Detailed derivation that gets collapsed when tokens are scarce...]
::
```

**The 5 Context Phases** (progressive degradation as token budget decreases):

| Phase | Strategy | What's Included |
|-------|----------|-----------------|
| **Full** | Everything | All nodes, full bodies |
| **Summary** | Collapse low-priority | `collapse=true` nodes replaced by `@summary` |
| **Priority** | High-priority only | Only `priority=critical\|high` nodes |
| **Skeleton** | Structure only | Entity/rel graph + meta, no bodies |
| **Quantum** | Active branches only | Only quantum-state-selected content |

### 3.7 `action` — AI Agent Execution Directive (L3)

Declares a unit of work that an AI agent can execute.

```ukdl
:: action id=act:generate-quiz agent=ai-tutor trigger="lesson_complete"
@tool: "adaptive_quiz_generator"
@input: {
  topic: @ent:newton-laws,
  count: 5,
  difficulty: @qst:learner-level,
  format: "multiple_choice"
}
@output: "quiz_result.json"
@timeout: 30000
@retry: {max: 3, backoff: "exponential"}
@depends_on: @act:prerequisite-check

Generate a diagnostic quiz based on the learner's current quantum state.
::
```

**Required attributes**: `agent`, `trigger`
**Required fields**: `@tool`

**New in v2.0**:
- `@timeout` (ms) — prevents runaway agent execution
- `@retry` — resilience policy
- `@guard` — precondition expression that must be true before execution

```ukdl
@guard: @qst:learner-level != "uninitialized" and @act:prerequisite-check.status == "complete"
```

### 3.8 `quantum` — Probabilistic State Variable (L4)

Models uncertain, evolving state as a probability distribution that "collapses" upon observation.

```ukdl
:: quantum id=qst:learner-level
@states: {beginner: 0.3, intermediate: 0.5, advanced: 0.2}
@observe_on: "diagnostic_quiz_complete"
@entangle: @qst:content-difficulty
@decay: {function: "exponential", half_life: "7d"}
@history: true
@default: "intermediate"

The learner's proficiency level, determined by diagnostic assessment.
Decays toward uniform distribution if unobserved for 7 days.
::
```

**Required fields**: `@states` (probability distribution summing to 1.0), `@observe_on`

**Entanglement Matrix** (correlated collapse):

```ukdl
:: quantum id=qst:content-difficulty
@states: {basic: 0.3, standard: 0.5, deep: 0.2}
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-basic:     0.8,
  beginner-standard:  0.15,
  beginner-deep:      0.05,
  intermediate-basic: 0.1,
  intermediate-standard: 0.7,
  intermediate-deep:  0.2,
  advanced-basic:     0.0,
  advanced-standard:  0.3,
  advanced-deep:      0.7
}
::
```

**New in v2.0**:
- `@default` — fallback state when observation fails
- `@decay` — formalized decay function spec (was informal in v1.0)
- Each row of the entangle_matrix MUST sum to 1.0 (validation rule)

### 3.9 `pipeline` — Self-Optimizing Execution Pipeline (L5)

Orchestrates a sequence of actions, quantum collapses, and content delivery into a feedback loop.

```ukdl
:: pipeline id=pipe:adaptive-learning
@goal: "maximize_comprehension"
@criteria: ["quiz_accuracy", "concept_retention", "engagement_time"]
@interval: "every_lesson"
@max_iterations: 100
@stages: [
  {name: "diagnose",       action: @act:diagnostic-quiz},
  {name: "collapse_state", quantum: @qst:learner-level},
  {name: "deliver",        block: @blk:adaptive-explanation},
  {name: "assess",         action: @act:performance-check}
]
@feedback: {
  positive: "advance_difficulty",
  negative: {adjust: {difficulty: "decrease", examples: "increase", pace: "slower"}},
  stagnant: {escalate: "human_review"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 3",
  action: "pause_and_notify"
}

Adaptive learning orchestration pipeline.
::
```

**New in v2.0**:
- `@max_iterations` — prevents infinite loops
- `@circuit_breaker` — halts pipeline on repeated failures
- `@feedback.stagnant` — handles plateau states (neither improving nor declining)

---

## 4. Dynamic Grammar (Inline Directives)

### 4.1 Conditional Rendering

```ukdl
|if: @qst:learner-level == beginner|
Simple explanation here.
|elif: @qst:learner-level == intermediate|
Standard explanation with more detail.
|elif: @qst:learner-level == advanced|
Advanced explanation with formal notation.
|else|
Default explanation.
|/if|
```

**Expression operators**: `==`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `not`, `and`, `or`

### 4.2 Iteration (New in v2.0)

```ukdl
|for: stage in @pipe:adaptive-learning.stages|
  Stage: @{stage.name} — Status: @{stage.status}
|/for|
```

### 4.3 Multimodal Output

```ukdl
|multimodal_output|
  [text] Photosynthesis converts light energy to chemical energy.
  [voice] tts("Photosynthesis converts light energy to chemical energy.", lang="en")
  [image] render(@ent:photosynthesis-diagram)
  [video] play(@blk:animation-photosynthesis, autoplay=false)
  [braille] braille("Photosynthesis converts light energy to chemical energy.")
|/multimodal_output|
```

**New in v2.0**: `[video]` and `[braille]` modalities for accessibility.

### 4.4 Function Definition

```ukdl
|function: greet(name, level)|
  |if: @level == beginner|
    Welcome, @name! Let's start learning.
  |else|
    @name, welcome to the advanced track.
  |/if|
|/function|
```

Functions return their rendered body text. They can be invoked from action nodes via `@tool: "ukdl:greet"`.

---

## 5. Standard Attribute Vocabulary

### 5.1 Universal Attributes (All Nodes)

| Attribute | Type | Description |
|-----------|------|-------------|
| `confidence` | 0.0–1.0 | Content reliability score |
| `generated_by` | string | Source: AI model ID or `"human"` |
| `verified` | bool or string | Verification status or verifier ID |
| `valid_from` | date | Start of validity period |
| `valid_to` | date | End of validity period |
| `source` | URI or ref | Provenance |
| `domain` | dot-path | Hierarchical domain classification |
| `priority` | enum | `critical`, `high`, `normal`, `low`, `archive` |
| `summary` | string | Compressed representation for context optimization |
| `tags` | array | Freeform classification labels |
| `lang` | string | BCP 47 language code |
| `deprecated` | bool | Marks node as superseded (new in v2.0) |
| `superseded_by` | ref | Pointer to replacement node (new in v2.0) |

### 5.2 Reserved Attribute Prefixes

| Prefix | Reserved For |
|--------|-------------|
| `labels.*` | Multilingual display names |
| `x-*` | User-defined extensions |
| `_*` | Parser/tool internal metadata |

---

## 6. Reference System

### 6.1 Standard Prefixes

| Prefix | Kind | Example |
|--------|------|---------|
| `doc:` | meta | `@doc:my-document` |
| `blk:` | block | `@blk:newton-first-law` |
| `ent:` | entity | `@ent:gravity` |
| `rel:` | rel | `@rel:newton-gravity` |
| `sch:` | schema | `@sch:person-entity` |
| `inc:` | include | `@inc:chapter2` |
| `ctx:` | context | `@ctx:overview` |
| `act:` | action | `@act:generate-quiz` |
| `qst:` | quantum | `@qst:learner-level` |
| `pipe:` | pipeline | `@pipe:adaptive-learning` |

### 6.2 Reference Resolution Rules

1. Bare reference `@ent:foo` — resolves within current document
2. Namespaced reference `@ch2.ent:foo` — resolves within included namespace
3. URI reference `@<https://example.com/doc.ukdl#ent:foo>` — resolves to external document (new in v2.0)
4. Field access `@ent:foo.field_name` — resolves to a specific field value (new in v2.0)

### 6.3 Display References

```ukdl
@{ent:newton|Sir Isaac Newton}
```

Rendered as "Sir Isaac Newton" with a semantic link to `ent:newton`. Parsers MUST preserve both the reference and the display text.

---

## 7. UKDL-JSON Canonical Mapping

Every valid UKDL document has a unique canonical JSON representation. This enables:
- Database storage
- API transmission
- Programmatic manipulation
- Round-trip fidelity (UKDL → JSON → UKDL)

### 7.1 Schema

```json
{
  "$schema": "https://ukdl.org/schema/v2.0.json",
  "ukdl_version": "2.0",
  "doc": {
    "id": "doc:<name>",
    "title": "<string>",
    "author": "<string>",
    "lang": "<bcp47>",
    "version": "<semver>",
    "domain": "<dot-path>",
    "tags": ["<string>"],
    "ukdl_level": "<0-5>",
    "created": "<iso-date>",
    "license": "<spdx-id>"
  },
  "nodes": {
    "<prefix:name>": {
      "kind": "<kind>",
      "attrs": { "<key>": "<value>" },
      "fields": { "<key>": "<value>" },
      "body": "<markdown-string>",
      "directives": [
        {
          "type": "conditional",
          "condition": "<expr>",
          "branches": [
            { "condition": "<expr>", "body": "<string>" }
          ]
        }
      ]
    }
  },
  "edges": [
    {
      "id": "rel:<name>",
      "from": "<prefix:name>",
      "to": "<prefix:name>",
      "type": "<relation-type>",
      "attrs": {}
    }
  ],
  "quantum_state": {
    "variables": ["qst:<name>"],
    "entanglements": [
      { "a": "qst:<name>", "b": "qst:<name>", "matrix": {} }
    ],
    "current_observations": {}
  },
  "pipelines": ["pipe:<name>"],
  "context_tree": {
    "current_phase": "full",
    "node_priorities": {}
  }
}
```

### 7.2 Round-Trip Guarantee

`parse(serialize(parse(ukdl_text))) == parse(ukdl_text)` — Semantic equivalence is preserved through any number of round trips. Formatting (whitespace, comment placement) is NOT preserved.

---

## 8. Processing Model

### 8.1 The 10-Stage Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  UKDL Source Text (.ukdl file)                               │
└──────────────┬───────────────────────────────────────────────┘
               ▼
  ┌─── Stage 1: LINE SCAN ──────────────────────────────────┐
  │  Recognize :: ... :: node boundaries                     │
  │  Classify lines: comment / field / directive / body      │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 2: KIND CLASSIFICATION ────────────────────────┐
  │  Map kind string to one of 10 standard kinds             │
  │  Unknown kinds → block fallback with type=<kind>         │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 3: ATTRIBUTE & FIELD PARSING ──────────────────┐
  │  Header: key=value pairs                                 │
  │  Body: @key: value fields                                │
  │  Type coercion per schema (if present)                   │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 4: REFERENCE RESOLUTION ───────────────────────┐
  │  @prefix:name → node link                                │
  │  @{prefix:name|text} → display link                      │
  │  @namespace.prefix:name → cross-file link                │
  │  Unresolved refs → warning (not error)                   │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 5: SCHEMA VALIDATION ──────────────────────────┐
  │  Apply schema constraints to matching nodes              │
  │  Report violations as warnings or errors per schema      │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 6: KNOWLEDGE GRAPH CONSTRUCTION ───────────────┐
  │  entity nodes → graph vertices                           │
  │  rel nodes → graph edges (with reification metadata)     │
  │  about= attrs → implicit edges                           │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 7: QUANTUM STATE INITIALIZATION ───────────────┐
  │  Validate probability distributions (sum = 1.0)          │
  │  Register entanglement pairs                             │
  │  Initialize decay clocks                                 │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 8: CONTEXT TREE CONSTRUCTION ──────────────────┐
  │  Assign priority/depth/collapse to all nodes             │
  │  Build phase-specific node sets                          │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 9: CONDITIONAL EVALUATION ─────────────────────┐
  │  Evaluate |if:| / |for:| directives                      │
  │  Select branches based on current quantum state          │
  │  Render multimodal output blocks                         │
  └──────────────┬──────────────────────────────────────────┘
               ▼
  ┌─── Stage 10: EXECUTION REGISTRATION ────────────────────┐
  │  action nodes → tool invocation schemas                  │
  │  pipeline nodes → orchestration scheduler                │
  │  Resolve depends_on chains (detect cycles → error)       │
  └────────────────────────────────────────────────────────┘
```

### 8.2 Error Handling

| Severity | Behavior |
|----------|----------|
| **Error** | Parsing halts. Invalid node boundaries, unclosed `::`, malformed EBNF. |
| **Warning** | Parsing continues. Unresolved references, probability sums ≠ 1.0 (auto-normalized), unknown attributes. |
| **Info** | Parsing continues silently. Deprecated nodes, unused entities, empty bodies. |

---

## 9. Why UKDL Supersedes Existing Languages

### 9.1 vs. Markdown

| Dimension | Markdown | UKDL L0 |
|-----------|----------|---------|
| Readability | Excellent | Excellent (Markdown body preserved) |
| Structure | None (headings are cosmetic) | Explicit node boundaries |
| Semantics | Zero | Entity/relation knowledge graph |
| Machine parsing | Ambiguous (CommonMark has 600+ rules) | Unambiguous (simple EBNF) |
| AI context control | None | 5-phase context optimization |
| Extensibility | Impossible without HTML | Kind system + `x-*` attributes |

**UKDL L0 is a strict superset of what most people use Markdown for, with zero additional complexity for the writer.** A block body IS Markdown. The `::` delimiters add structure without sacrificing readability.

### 9.2 vs. Python / Programming Languages

| Dimension | Python | UKDL |
|-----------|--------|------|
| Primary purpose | Compute | Knowledge + Compute |
| Learning curve | Steep | L0 = zero, scales to L5 |
| Human readability | Code | Natural language + structure |
| AI understanding | Requires parsing AST | Native semantic units |
| State management | Imperative mutation | Quantum probabilistic states |
| Knowledge representation | Not a concern | First-class knowledge graph |
| Vibe coding | Write code → hope it works | Write intent → system adapts |

**UKDL doesn't replace Python for computation. It replaces the need to write Python** for knowledge management, AI orchestration, and adaptive systems. At L3+, UKDL actions can invoke Python tools — but the orchestration logic is expressed in human-readable UKDL, not code.

### 9.3 vs. YAML / JSON / TOML

| Dimension | YAML/JSON | UKDL |
|-----------|-----------|------|
| Human authoring | YAML ok, JSON terrible | Excellent |
| Semantic meaning | None (just structure) | Entity types, relations, ontology |
| Executable | No | Actions, pipelines, triggers |
| Context-aware | No | 5-phase token optimization |
| Validation | External JSON Schema | Inline `schema` nodes |
| Knowledge graph | Manual construction | Automatic from entity/rel |

### 9.4 vs. RDF / OWL / Semantic Web

| Dimension | RDF/OWL | UKDL |
|-----------|---------|------|
| Readability | Expert-only | Anyone |
| Learning curve | Months | Minutes (L0) to days (L5) |
| Tooling required | Specialized | Text editor |
| Dynamic behavior | None | Quantum states, pipelines |
| AI-native | Retrofitted | Designed for LLMs |
| Adoption | Niche academic | Designed for mass adoption |

### 9.5 The "Vibe Coding" Argument

**Vibe coding** = expressing intent in natural language and having the system figure out the implementation. UKDL is the ideal substrate for vibe coding because:

1. **L0 IS vibe coding** — write natural text in blocks, the structure is minimal
2. **Semantic annotations are optional** — add `entity` and `rel` when you want precision, ignore them when you don't
3. **Actions express intent, not implementation** — `@tool: "generate_quiz"` says WHAT, not HOW
4. **Quantum states model uncertainty** — "the learner is PROBABLY intermediate" is more honest than `if level == 3`
5. **Pipelines declare goals** — `@goal: "maximize_comprehension"` is vibes. The system optimizes.
6. **Context phases handle AI limitations** — the document itself knows how to compress for different token budgets

**In vibe coding, the document IS the program.** UKDL makes this literal.

---

## 10. Ontology Layers

### Layer 1: Structural (Document Architecture)

```
Document
├── meta (1 per doc)
├── block (content chunks)
├── entity (knowledge nodes)
├── rel (knowledge edges)
├── schema (validation rules)
└── include (external references)
```

### Layer 2: Semantic (Knowledge Types)

**Entity Types**: `Concept`, `Process`, `Person`, `System`, `Event`, `Place`, `Molecule`, `Organization`, `Tool`, `Theory`

**Relation Types**: `is_a`, `part_of`, `causes`, `caused_by`, `occurs_in`, `has_stage`, `produces`, `consumes`, `discovered`, `depends_on`, `contradicts`, `supports`, `similar_to`, `used_by`, `about`, `supported_by`

### Layer 3: Context (AI Optimization)

**Priority**: `critical` > `high` > `normal` > `low` > `archive`
**Depth**: `overview` < `standard` < `detailed`
**Collapse**: `true` (default folded) / `false` (always shown)

### Layer 4: Dynamic (State & Execution)

**Quantum States**: Probability distributions with observation triggers and entanglement
**Actions**: Agent-executed tool invocations with triggers and dependencies
**Pipelines**: Goal-driven stage sequences with feedback loops

---

## 11. Interoperability

### 11.1 Export Targets

| Target | Mapping |
|--------|---------|
| **Markdown** | Render body text with headings from block types |
| **JSON-LD** | entity/rel → JSON-LD with @context |
| **Neo4j/Cypher** | entity → nodes, rel → relationships |
| **RDF/Turtle** | entity → subjects, rel → triples |
| **LangChain** | action → tool definitions, pipeline → chains |
| **MCP** | action → MCP tool invocations |
| **HTML** | Full render with conditional content |
| **PDF** | Static render at current quantum state |

### 11.2 Import Sources

| Source | Strategy |
|--------|----------|
| **Markdown** | Each heading section → block node |
| **JSON/YAML** | Key-value → fields, nested → entities |
| **CSV** | Rows → entities, columns → fields |
| **RDF** | Subjects → entities, predicates → relations |

---

## 12. File Conventions

| Convention | Value |
|------------|-------|
| File extension | `.ukdl` |
| Index file | `index.ukdl` |
| Config file | `ukdl.config.json` |
| MIME type | `text/ukdl` |
| Encoding | UTF-8 (BOM forbidden) |
| Line endings | LF preferred |
| Max line length | Recommended 120 characters, not enforced |
| Indentation | 2 spaces (for fields/directives within nodes) |

---

## 13. Conformance Levels

A UKDL implementation MUST declare which level it supports:

| Conformance | Requirements |
|-------------|-------------|
| **L0 Parser** | Parse meta + block. Render body as Markdown. |
| **L1 Parser** | + entity, rel, schema. Build knowledge graph. |
| **L2 Parser** | + context, include. Implement context phases. |
| **L3 Runtime** | + action. Execute tools via MCP or equivalent. |
| **L4 Runtime** | + quantum. Manage probabilistic state. |
| **L5 Runtime** | + pipeline. Orchestrate with feedback loops. |
| **Full Standard** | All levels + JSON round-trip + all exports. |

---

## 14. Security Considerations

- **Action sandboxing**: L3+ runtimes MUST sandbox tool execution. Actions MUST NOT have filesystem access beyond declared inputs/outputs.
- **Pipeline limits**: `@max_iterations` and `@circuit_breaker` MUST be enforced to prevent resource exhaustion.
- **Reference injection**: Display references `@{...}` MUST be sanitized when rendering to HTML to prevent XSS.
- **Quantum state tampering**: Runtimes SHOULD log all state observations for audit.
- **Include security**: `include` nodes MUST NOT resolve references outside the document's trust boundary without explicit configuration.

---

## 15. Comparison Summary

```
                    Human       Machine     Knowledge   Executable   Adaptive    AI-Native
                    Readable    Parseable   Graph       Program      State       Context
─────────────────────────────────────────────────────────────────────────────────────────────
Markdown              ●           ◐           ○            ○            ○            ○
Python                ◐           ●           ○            ●            ◐            ○
YAML/JSON             ◐           ●           ○            ○            ○            ○
RDF/OWL               ○           ●           ●            ○            ○            ○
Jupyter               ◐           ◐           ○            ●            ○            ○
LangChain YAML        ○           ●           ○            ●            ○            ◐
─────────────────────────────────────────────────────────────────────────────────────────────
UKDL                  ●           ●           ●            ●            ●            ●

● = full support   ◐ = partial   ○ = none
```

---

## 16. Roadmap to W3C Standardization

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **1. Foundation** | 0–3 months | Reference parser (TypeScript + Python), CLI tool, VS Code extension, `.ukdl` syntax highlighting |
| **2. Ecosystem** | 3–6 months | Obsidian plugin, Neo4j exporter, LangChain connector, MCP bridge, npm/pip packages |
| **3. Runtime** | 6–9 months | Quantum state engine, Pipeline executor, Context phase optimizer |
| **4. Adoption** | 9–12 months | EduTech integrations, Enterprise KMS pilot, Community spec group |
| **5. Standard** | 12–18 months | W3C Community Group, IANA MIME registration, formal test suite |

---

## Appendix A: Complete Example

```ukdl
%% UKDL v2.0 — Newton's Laws: Adaptive Learning Module

:: meta id=doc:newton-laws title="Newton's Laws of Motion" created="2026-03-16"
@author: "physics-team"
@lang: "en"
@version: "2.0"
@domain: "physics.mechanics.classical"
@tags: ["physics", "newton", "mechanics", "adaptive"]
@ukdl_level: 5
@license: "CC-BY-4.0"
::

%% ═══ L1: Knowledge Graph ═══

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
@born: "1643-01-04"
@same_as: ["https://www.wikidata.org/wiki/Q935"]
::

:: entity id=ent:first-law type=Concept labels.en="First Law of Motion"
@aliases: ["Law of Inertia"]
::

:: entity id=ent:second-law type=Concept labels.en="Second Law of Motion"
@aliases: ["F = ma"]
::

:: entity id=ent:third-law type=Concept labels.en="Third Law of Motion"
@aliases: ["Action-Reaction"]
::

:: entity id=ent:force type=Concept labels.en="Force"
::

:: rel id=rel:newton-first type=formulated from=@ent:newton to=@ent:first-law
@source: "Principia Mathematica, 1687"
::

:: rel id=rel:newton-second type=formulated from=@ent:newton to=@ent:second-law
::

:: rel id=rel:newton-third type=formulated from=@ent:newton to=@ent:third-law
::

:: rel id=rel:second-uses-force type=uses_concept from=@ent:second-law to=@ent:force
::

%% ═══ L2: Context Control ═══

:: context id=ctx:laws-overview priority=critical depth=overview
@summary: "Newton's 3 laws: inertia, F=ma, action-reaction."

Newton formulated three laws that form the foundation of classical mechanics.
::

:: context id=ctx:math-derivation priority=low depth=detailed collapse=true
@summary: "Mathematical proof of F=ma from momentum definition."
@max_tokens: 2000

Force is defined as the rate of change of momentum:
F = dp/dt = d(mv)/dt = m(dv/dt) = ma (when mass is constant)
::

%% ═══ L4: Quantum States ═══

:: quantum id=qst:student-level
@states: {novice: 0.4, intermediate: 0.4, expert: 0.2}
@observe_on: "pre-assessment_complete"
@entangle: @qst:explanation-depth
@decay: {function: "exponential", half_life: "14d"}
@default: "intermediate"
@history: true
::

:: quantum id=qst:explanation-depth
@states: {intuitive: 0.4, mathematical: 0.4, rigorous: 0.2}
@entangle: @qst:student-level
@entangle_matrix: {
  novice-intuitive: 0.8, novice-mathematical: 0.15, novice-rigorous: 0.05,
  intermediate-intuitive: 0.2, intermediate-mathematical: 0.6, intermediate-rigorous: 0.2,
  expert-intuitive: 0.05, expert-mathematical: 0.35, expert-rigorous: 0.6
}
::

%% ═══ L3: Adaptive Content ═══

:: block id=blk:first-law-explanation type=lesson about=@ent:first-law priority=high
@when: @qst:student-level

|if: @qst:student-level == novice|
**Newton's First Law** says: things that are still, stay still. Things that are
moving, keep moving — unless something pushes or pulls them.

Think of a hockey puck on ice: it slides forever (almost) because there's very
little friction to slow it down.

|elif: @qst:student-level == intermediate|
**Newton's First Law (Law of Inertia)**: An object at rest stays at rest, and an
object in uniform motion continues in that motion, unless acted upon by a net
external force.

Key insight: this law defines what a **force** is — it's whatever changes an
object's velocity. No force = no acceleration.

|else|
**Newton's First Law** establishes the existence of @{ent:force|inertial reference frames}.
In modern formulation: there exist frames of reference in which a body subject to
no net force moves in a straight line at constant speed (or remains at rest).

This is equivalent to the statement that spacetime is locally Minkowskian, connecting
Newtonian mechanics to special relativity's foundational assumptions.
|/if|
::

%% ═══ L3: Actions ═══

:: action id=act:pre-assessment agent=physics-tutor trigger="module_start"
@tool: "adaptive_quiz_generator"
@input: {topic: @ent:first-law, count: 5, format: "multiple_choice"}
@output: "assessment_result.json"
@timeout: 30000
::

:: action id=act:practice-problems agent=physics-tutor trigger="lesson_complete"
@tool: "problem_generator"
@input: {
  topics: [@ent:first-law, @ent:second-law, @ent:third-law],
  difficulty: @qst:student-level,
  count: 3
}
@output: "practice_set.json"
@depends_on: @act:pre-assessment
@guard: @qst:student-level != "uninitialized"
::

%% ═══ L5: Learning Pipeline ═══

:: pipeline id=pipe:newton-learning
@goal: "maximize_physics_comprehension"
@criteria: ["quiz_accuracy", "concept_retention", "problem_solving_speed"]
@interval: "every_lesson"
@max_iterations: 50
@stages: [
  {name: "assess",   action: @act:pre-assessment},
  {name: "classify", quantum: @qst:student-level},
  {name: "teach",    block: @blk:first-law-explanation},
  {name: "practice", action: @act:practice-problems}
]
@feedback: {
  positive: "advance_difficulty",
  negative: {adjust: {depth: "decrease", examples: "increase"}},
  stagnant: {escalate: "human_review"}
}
@circuit_breaker: {condition: "consecutive_failures > 3", action: "pause_and_notify"}
::
```

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Node** | The fundamental UKDL element, delimited by `::` |
| **Kind** | The type of a node (one of 10 standard kinds) |
| **Field** | A typed key-value pair within a node (`@key: value`) |
| **Body** | Free-form Markdown text within a node |
| **Reference** | A typed link to another node (`@prefix:name`) |
| **Quantum State** | A probabilistic variable that collapses upon observation |
| **Entanglement** | Correlated collapse between two quantum states |
| **Context Phase** | A level of content reduction for token budget management |
| **Pipeline** | A goal-driven orchestration of actions and state transitions |
| **Collapse** | The moment a quantum state resolves to a definite value |
| **Vibe Coding** | Expressing intent in natural language; UKDL makes documents executable intents |

---

*UKDL — Where what you see is what you mean, what you mean comes alive, and knowledge evolves itself.*
