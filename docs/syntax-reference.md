# UKDL Syntax Reference

UKDL v2.0 — Quick-lookup syntax reference. Covers every construct, type, and rule. For rationale and design philosophy see `UKDL-v2.0-Standard.md`.

---

## File Conventions

| Property | Value |
|---|---|
| Extension | `.ukdl` |
| Encoding | UTF-8 (BOM forbidden) |
| MIME type | `text/ukdl` |
| Line endings | LF preferred; CRLF tolerated |
| Max line length | 120 characters (recommended, not enforced) |
| Indentation | 2 spaces (fields and directives within nodes) |
| Index file | `index.ukdl` |
| Config file | `ukdl.config.json` |

---

## Node Syntax

### Canonical Form

```ukdl
:: <kind> id=<prefix:name> [header-attrs...]
@field: <value>
@field: <value>

Body text (Markdown). Supports **bold**, _italic_,
@{ent:some-entity|inline references}, and |if:| directives.

::
```

### Rules

| Rule | Detail |
|---|---|
| Open delimiter | `::` followed by kind and `id=` on one line |
| Close delimiter | `::` alone on its own line |
| Fields | Must appear before the first body line |
| Field pattern | Line starting with `@<identifier>:` |
| Body text | Any line not matching field or directive pattern |
| Nesting | Nodes CANNOT be nested — use references to link them |
| Unknown kind | Treated as `block` with `type=<kind>` |
| Empty node | Valid — no fields and no body required |

### Examples

```ukdl
%% Minimal node
:: entity id=ent:gravity
::

%% Full node
:: block id=blk:first-law type=principle about=@ent:newton-laws priority=high
@confidence: 0.99
@source: "https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion"
@summary: "Objects in motion stay in motion unless acted upon."

Newton's First Law (Law of Inertia): an object at rest remains at rest,
and an object in motion continues at constant velocity, unless acted upon
by a net external force.

::

%% Unknown kind — parsed as block with type=theorem
:: theorem id=blk:pythagorean
::
```

---

## Kind Reference

### Progressive Disclosure Levels

| Level | Name | Kinds Introduced | Replaces |
|---|---|---|---|
| L0 | Pure | `meta`, `block` | Markdown, plain text |
| L1 | Semantic | `entity`, `rel`, `schema` | Wiki markup, RDF/OWL |
| L2 | Context | `context`, `include` | Prompt templates |
| L3 | Executable | `action` | LangChain YAML, DSPy |
| L4 | Dynamic | `quantum` | Custom state machines |
| L5 | Orchestrated | `pipeline` | Airflow, Temporal |

---

## `meta` — Document Metadata (L0)

One per document. Must be the first node.

**Required attributes:** `id` (prefix `doc:`), `title`
**Required fields:** `@author`, `@lang`, `@version`
**Optional attributes:** `created`
**Optional fields:** `@domain`, `@tags`, `@ukdl_level`, `@license`

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

| Field | Type | Description |
|---|---|---|
| `@author` | string | Author name or ID |
| `@lang` | string | BCP 47 language code (e.g. `"en"`, `"ko"`) |
| `@version` | string | Document version (semver recommended) |
| `@domain` | string | Dot-path domain classification |
| `@tags` | array | Freeform classification labels |
| `@ukdl_level` | number | Maximum UKDL level used (0–5); enables parsers to skip unsupported features |
| `@license` | string | SPDX license identifier |

**Notes:** `@ukdl_level` was introduced in v2.0. Omitting it causes parsers to attempt full L5 processing.

---

## `block` — Knowledge Chunk (L0)

The fundamental content unit. Each block is a self-contained piece of knowledge suitable for RAG retrieval.

**Required attributes:** `id` (prefix `blk:`)
**Required fields:** none
**Optional attributes:** `type`, `about`, `priority`, `confidence`, `source`, `summary`, `tags`, `lang`, `deprecated`, `superseded_by`, `generated_by`, `verified`, `valid_from`, `valid_to`, `domain`
**Optional fields:** `@confidence`, `@source`, `@summary`, `@tags`, `@lang`, any universal attribute as `@field`

```ukdl
:: block id=blk:newton-first-law type=principle about=@ent:newton-laws priority=high
@confidence: 0.99
@source: "https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion"
@summary: "An object at rest stays at rest unless acted upon by a force."

Newton's First Law (Law of Inertia):

An object at rest remains at rest, and an object in motion remains in motion
at constant speed and in a straight line, unless acted on by an unbalanced force.

This was formulated by @{ent:galileo|Galileo Galilei} and refined by @{ent:newton|Isaac Newton}.
::
```

**Standard `type` values:**

| Type | Use |
|---|---|
| `definition` | Formal definition of a term or concept |
| `explanation` | Narrative explanation of a concept |
| `example` | Concrete example or illustration |
| `proof` | Logical or mathematical proof |
| `claim` | Assertable proposition |
| `evidence` | Supporting data or observation |
| `lesson` | Educational content unit |
| `exercise` | Practice problem or activity |
| `function` | A defined callable (see function directives) |
| `note` | Supplementary remark |
| `warning` | Caution or important alert |

**Notes:** The body is parsed as Markdown. Fields appear before body. Unknown `type` values are valid — parsers preserve them.

---

## `entity` — Knowledge Graph Node (L1)

Declares a named concept, person, process, system, or any discrete "thing" in the knowledge domain.

**Required attributes:** `id` (prefix `ent:`), `type`
**Required fields:** none
**Optional attributes:** `labels.<lang>` (multilingual display names), `confidence`, `source`, `domain`, `priority`, `tags`, `deprecated`, `superseded_by`
**Optional fields:** `@aliases`, `@same_as`, `@born`, `@died`, any domain-specific field

```ukdl
:: entity id=ent:newton type=Person labels.en="Isaac Newton" labels.ko="아이작 뉴턴"
@born: "1643-01-04"
@died: "1727-03-31"
@aliases: ["Sir Isaac Newton"]
@same_as: ["https://www.wikidata.org/wiki/Q935"]

English mathematician, physicist, and astronomer.
::
```

**Standard `type` values:**

| Type | Use |
|---|---|
| `Concept` | Abstract idea or principle |
| `Process` | A sequence of steps or transformations |
| `Person` | A human individual |
| `System` | A technical or physical system |
| `Event` | A time-bounded occurrence |
| `Place` | A geographic or conceptual location |
| `Molecule` | A chemical compound or structure |
| `Organization` | An institution, company, or group |
| `Tool` | A software or physical instrument |
| `Theory` | A formal theoretical framework |

**Notes:** `labels.<lang-code>` attributes (e.g. `labels.en`, `labels.fr`) enable multilingual graphs without node duplication. Empty entity nodes (no fields, no body) are valid and commonly used for bare declarations.

---

## `rel` — Relation / Edge (L1)

First-class reifiable relation between any two nodes. Relations carry their own metadata, confidence scores, and provenance.

**Required attributes:** `id` (prefix `rel:`), `type`, `from`, `to`
**Required fields:** none
**Optional attributes:** `confidence`, `source`, `valid_from`, `valid_to`, `priority`, `domain`, `tags`, `deprecated`, `superseded_by`
**Optional fields:** `@confidence`, `@source`, `@valid_from`, any provenance field

```ukdl
:: rel id=rel:newton-gravity type=discovered from=@ent:newton to=@ent:gravity
@confidence: 0.95
@source: "Principia Mathematica, 1687"
@valid_from: "1687-07-05"

Newton formulated the law of universal gravitation.
::
```

**Standard `type` values:**

| Type | Meaning |
|---|---|
| `is_a` | Subtype or instance of |
| `part_of` | Component membership |
| `causes` | Causal forward direction |
| `caused_by` | Causal backward direction |
| `occurs_in` | Situates an event in a context |
| `has_stage` | Process decomposition |
| `produces` | Output relationship |
| `consumes` | Input relationship |
| `discovered` | Attribution of discovery |
| `depends_on` | Dependency relationship |
| `contradicts` | Logical or empirical contradiction |
| `supports` | Provides evidence for |
| `similar_to` | Analogy or resemblance |
| `used_by` | Instrument/agent usage |
| `about` | Topical reference |
| `supported_by` | Backed by evidence or argument |

**Notes:** `from` and `to` values are references (`@prefix:name`). Custom relation types are valid; parsers preserve them.

---

## `schema` — Validation Rule (L1)

Defines structural constraints that nodes must satisfy. Applied during Stage 5 of processing.

**Required attributes:** `id` (prefix `sch:`)
**Required fields:** `@applies_to`
**Optional fields:** `@required_fields`, `@optional_fields`, `@field_types`

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

| Field | Type | Description |
|---|---|---|
| `@applies_to` | object | Match criteria: `kind`, `type`, or both |
| `@required_fields` | array | Fields that must be present |
| `@optional_fields` | array | Fields that may be present |
| `@field_types` | object | Map of field name to type descriptor |

**Notes:** Violations are reported as warnings or errors as configured per schema. Schema nodes themselves are not validated against other schemas.

---

## `include` — External File Inclusion (L2)

Splices another `.ukdl` file's nodes into the current document.

**Required attributes:** `id` (prefix `inc:`), `src`
**Required fields:** none
**Optional fields:** `@filter`, `@namespace`

```ukdl
:: include id=inc:chapter2 src="./chapter-2.ukdl"
@filter: {kind: "block", priority: ["high", "critical"]}
@namespace: "ch2"
::
```

| Field/Attr | Type | Description |
|---|---|---|
| `src` | string | Relative or absolute path to `.ukdl` file |
| `@filter` | object | Selective inclusion by `kind`, `type`, or `priority` |
| `@namespace` | string | Prefix added to all included IDs to prevent collisions |

**Namespaced reference syntax:** `@ch2.ent:foo` — resolves `ent:foo` from the `ch2` namespace.

**Notes:** `@filter` is critical for context window management. `@namespace` prevents ID collisions when multiple files are included. Runtimes must not resolve includes outside the document's trust boundary without explicit configuration.

---

## `context` — LLM Context Window Optimization (L2)

Declares how content should be prioritized, summarized, and collapsed as token budgets shrink.

**Required attributes:** `id` (prefix `ctx:`), `priority`
**Required fields:** `@summary`
**Optional attributes:** `depth`, `collapse`
**Optional fields:** `@max_tokens`, `@collapse`

```ukdl
:: context id=ctx:overview priority=critical depth=overview
@summary: "Newton's 3 laws govern classical mechanics."
@collapse: false
@max_tokens: 500

Newton's laws of motion are three physical laws that describe the relationship
between the motion of an object and the forces acting on it.
::

:: context id=ctx:derivation priority=low depth=detailed collapse=true
@summary: "Mathematical derivation of F=ma from first principles."
@max_tokens: 3000

[Detailed derivation collapsed when tokens are scarce...]
::
```

| Attribute/Field | Type | Description |
|---|---|---|
| `priority` | enum | `critical`, `high`, `normal`, `low`, `archive` |
| `depth` | enum | `overview`, `standard`, `detailed` |
| `collapse` | bool | When `true`, node is replaced by `@summary` during Summary phase |
| `@summary` | string | Compressed representation used in degraded context phases |
| `@max_tokens` | number | Soft token budget hint for this node |
| `@collapse` | bool | Same as header `collapse` attr; field form takes precedence |

**Context Phases (progressive degradation):**

| Phase | Strategy | What Survives |
|---|---|---|
| Full | No reduction | All nodes, all bodies |
| Summary | Collapse low-priority | `collapse=true` nodes replaced by `@summary` value |
| Priority | High-priority only | Only `priority=critical` or `priority=high` nodes |
| Skeleton | Structure only | Entity/rel graph plus meta; bodies stripped |
| Quantum | Active branches only | Only content selected by current quantum state observations |

**Notes:** `depth` is a hint for content selection tools; it has no hard parser semantics. `@max_tokens` is advisory.

---

## `action` — AI Agent Execution Directive (L3)

Declares a unit of work that an AI agent can execute.

**Required attributes:** `id` (prefix `act:`), `agent`, `trigger`
**Required fields:** `@tool`
**Optional fields:** `@input`, `@output`, `@timeout`, `@retry`, `@depends_on`, `@guard`

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
@guard: @qst:learner-level != "uninitialized" and @act:prerequisite-check.status == "complete"

Generate a diagnostic quiz based on the learner's current quantum state.
::
```

| Field/Attr | Type | Description |
|---|---|---|
| `agent` | string | Agent identifier that executes this action |
| `trigger` | string | Event name that fires execution |
| `@tool` | string | Tool name — use `"ukdl:<fn>"` for inline UKDL functions |
| `@input` | object | Input parameters; values may be references |
| `@output` | string | Output file path or variable name |
| `@timeout` | number | Milliseconds before execution is aborted |
| `@retry` | object | `{max: N, backoff: "linear"|"exponential"}` |
| `@depends_on` | reference | Action that must complete before this one fires |
| `@guard` | expression | Boolean expression; must evaluate true before execution |

**Notes:** `@depends_on` chains are resolved at Stage 10. Cyclic dependencies are an error. Runtimes must sandbox tool execution.

---

## `quantum` — Probabilistic State Variable (L4)

Models uncertain, evolving state as a probability distribution that collapses upon observation.

**Required attributes:** `id` (prefix `qst:`)
**Required fields:** `@states`, `@observe_on`
**Optional fields:** `@entangle`, `@entangle_matrix`, `@decay`, `@default`, `@history`

```ukdl
:: quantum id=qst:learner-level
@states: {beginner: 0.3, intermediate: 0.5, advanced: 0.2}
@observe_on: "diagnostic_quiz_complete"
@entangle: @qst:content-difficulty
@decay: {function: "exponential", half_life: "7d"}
@history: true
@default: "intermediate"

The learner's proficiency level, determined by diagnostic assessment.
::
```

| Field | Type | Description |
|---|---|---|
| `@states` | object | Probability distribution. Values must sum to 1.0 (auto-normalized with warning if not) |
| `@observe_on` | string | Event name that triggers state collapse |
| `@entangle` | reference | Correlated quantum variable (mutual collapse) |
| `@entangle_matrix` | object | Joint probability table keyed `"stateA-stateB"`. Each source-state row must sum to 1.0 |
| `@decay` | object | `{function: "exponential", half_life: "<Nd>"}` — drifts toward uniform over time |
| `@default` | string | Fallback state name when observation fails |
| `@history` | bool | When `true`, runtime logs all past observations |

**Entanglement matrix example:**

```ukdl
:: quantum id=qst:content-difficulty
@states: {basic: 0.3, standard: 0.5, deep: 0.2}
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-basic:          0.8,
  beginner-standard:       0.15,
  beginner-deep:           0.05,
  intermediate-basic:      0.1,
  intermediate-standard:   0.7,
  intermediate-deep:       0.2,
  advanced-basic:          0.0,
  advanced-standard:       0.3,
  advanced-deep:           0.7
}
::
```

**Notes:** Each row of `@entangle_matrix` (keyed by the source state) must sum to 1.0 — this is a validation rule. State names in keys use hyphen as separator between the two entangled states.

---

## `pipeline` — Self-Optimizing Execution Pipeline (L5)

Orchestrates a sequence of actions, quantum collapses, and content delivery into a feedback loop.

**Required attributes:** `id` (prefix `pipe:`)
**Required fields:** `@goal`, `@stages`
**Optional fields:** `@criteria`, `@interval`, `@max_iterations`, `@feedback`, `@circuit_breaker`

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

| Field | Type | Description |
|---|---|---|
| `@goal` | string | Optimization objective (human-readable intent) |
| `@criteria` | array | Measurable metrics used to evaluate goal progress |
| `@interval` | string | Execution cadence (e.g. `"every_lesson"`, `"daily"`) |
| `@max_iterations` | number | Hard limit on pipeline loop count; prevents infinite loops |
| `@stages` | array | Ordered stage objects; each stage has `name` plus one of `action`, `quantum`, or `block` |
| `@feedback.positive` | string | Strategy when metrics improve |
| `@feedback.negative` | object | Adjustments when metrics decline |
| `@feedback.stagnant` | object | Response to plateau (neither improving nor declining) |
| `@circuit_breaker` | object | `{condition: "<expr>", action: "<strategy>"}` — halts on repeated failure |

**Notes:** `@max_iterations` and `@circuit_breaker` are enforced by runtimes. Omitting them is a warning. `@goal` has no hard parser semantics — it is intent documentation and an optimization hint.

---

## Value Types

| Type | Syntax | Examples |
|---|---|---|
| String (double-quoted) | `"..."` | `"hello"`, `"with \"escapes\""` |
| String (single-quoted) | `'...'` | `'raw\nno-escapes'` |
| String (triple-quoted) | `"""..."""` | Multi-line; leading whitespace stripped to minimum indent |
| Number | JSON number | `42`, `3.14`, `-1`, `1e10` |
| Boolean | `true` / `false` | `true`, `false` |
| Null | `null` | `null` |
| Date | ISO 8601 | `2026-03-16`, `2026-03-16T14:30:00Z` |
| Array | `[...]` | `[1, "two", true]`, `["a", "b", 3]` |
| Object | `{...}` | `{key: "value", nested: {a: 1}}` |
| Reference | `@prefix:name` | `@ent:photosynthesis` |
| Display Reference | `@{prefix:name\|text}` | `@{ent:atp\|ATP molecule}` |

**Object shorthand:** Unquoted keys are valid if they are legal identifiers. Values follow the same type rules recursively.

**Triple-quoted strings:** Introduced in v2.0 to resolve ambiguity between multi-line field values and body text.

```ukdl
@description: """
  First line.
  Second line.
  Leading whitespace stripped to minimum indent.
"""
```

---

## Reference System

### All Five Reference Styles

| Style | Syntax | Resolves To |
|---|---|---|
| Bare | `@prefix:name` | Node within current document |
| Display | `@{prefix:name\|text}` | Node within current document; rendered as display text |
| Namespaced | `@namespace.prefix:name` | Node within included namespace |
| URI | `@<uri#prefix:name>` | Node in external document at URI |
| Field access | `@prefix:name.field_name` | Value of a specific field on the target node |

### Syntax Examples

```ukdl
%% Bare reference
@depends_on: @act:prerequisite-check

%% Display reference — rendered as "Isaac Newton" with link to ent:newton
@{ent:newton|Isaac Newton}

%% Namespaced — resolves ent:foo in the ch2 included namespace
@ch2.ent:foo

%% URI — resolves to external document
@<https://example.com/doc.ukdl#ent:photosynthesis>

%% Field access — resolves the status field of act:check
@act:check.status
```

### Resolution Order

1. Bare `@prefix:name` — searched in current document nodes
2. Namespaced `@ns.prefix:name` — searched in nodes from `include` with matching `@namespace`
3. URI `@<uri#prefix:name>` — fetched from external source (runtime-dependent)
4. Field access `@prefix:name.field` — resolved after node lookup; accesses the named field value

### Unresolved References

Unresolved references produce a **Warning** (not an Error). Parsing continues. The reference is preserved in the output as-is for deferred resolution.

---

## Prefix Table

| Prefix | Kind | Example ID |
|---|---|---|
| `doc:` | meta | `doc:my-document` |
| `blk:` | block | `blk:newton-first-law` |
| `ent:` | entity | `ent:gravity` |
| `rel:` | rel | `rel:newton-gravity` |
| `sch:` | schema | `sch:person-entity` |
| `inc:` | include | `inc:chapter2` |
| `ctx:` | context | `ctx:overview` |
| `act:` | action | `act:generate-quiz` |
| `qst:` | quantum | `qst:learner-level` |
| `pipe:` | pipeline | `pipe:adaptive-learning` |

Custom prefixes are valid. They are treated as `block` with `type=<kind>`.

---

## Directives

Directives appear inside node bodies. They are inline dynamic constructs delimited by `|...|`.

### Conditional

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

- `|elif:|` and `|else|` are optional.
- Multiple `|elif:|` blocks are allowed.
- Expressions follow the Expression Syntax rules below.

### Loop

```ukdl
|for: item in @pipe:adaptive-learning.stages|
  Stage: @{item.name} — Status: @{item.status}
|/for|
```

- `item` is the loop variable name (any identifier).
- The `in` target is a reference to an array-valued field.
- Loop variable fields are accessed with `.` syntax: `@{item.name}`.

### Multimodal Output

```ukdl
|multimodal_output|
  [text]    Photosynthesis converts light energy to chemical energy.
  [voice]   tts("Photosynthesis converts light energy to chemical energy.", lang="en")
  [image]   render(@ent:photosynthesis-diagram)
  [video]   play(@blk:animation-photosynthesis, autoplay=false)
  [braille] braille("Photosynthesis converts light energy to chemical energy.")
|/multimodal_output|
```

**Supported modalities:**

| Modality | Content form |
|---|---|
| `[text]` | Plain or Markdown-formatted text |
| `[voice]` | `tts("text", lang="<bcp47>")` |
| `[image]` | `render(@ref)` |
| `[video]` | `play(@ref, autoplay=<bool>)` |
| `[braille]` | `braille("text")` |

`[video]` and `[braille]` were added in v2.0.

### Function Definition

```ukdl
|function: greet(name, level)|
  |if: @level == beginner|
    Welcome, @name! Let's start learning.
  |else|
    @name, welcome to the advanced track.
  |/if|
|/function|
```

- Function body is rendered text, not code.
- Functions return their rendered body.
- Invocation from action nodes: `@tool: "ukdl:greet"`.
- Functions can contain nested directives.

---

## Expression Syntax

Used in `|if:|`, `|elif:|`, `@guard`, and `@circuit_breaker.condition`.

### Operators

| Operator | Type | Example |
|---|---|---|
| `==` | Equality | `@qst:level == beginner` |
| `!=` | Inequality | `@qst:level != "uninitialized"` |
| `>` | Greater than | `@act:score.value > 80` |
| `<` | Less than | `@ent:age.value < 18` |
| `>=` | Greater or equal | `@qst:score >= 0.9` |
| `<=` | Less or equal | `@qst:attempts <= 3` |
| `in` | Membership | `@qst:level in ["beginner", "intermediate"]` |
| `not` | Negation | `not @qst:level == advanced` |
| `and` | Conjunction | `@qst:level == expert and @act:check.status == "complete"` |
| `or` | Disjunction | `@qst:level == beginner or @qst:level == intermediate` |

### Precedence (highest to lowest)

1. Parentheses `( )`
2. `not`
3. Comparison operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `in`
4. `and`
5. `or`

### Grouping

```ukdl
|if: (@qst:level == beginner or @qst:level == intermediate) and @act:pre-check.status == "done"|
  Show intermediate content.
|/if|
```

---

## Comments

```ukdl
%% Single-line comment — everything from %% to end of line is ignored.

(( Multi-line block comment.
   Can span any number of lines.
   Cannot be nested. ))
```

| Style | Delimiter | Nestable |
|---|---|---|
| Single-line | `%%` to end of line | N/A |
| Block | `((` ... `))` | No |

**Note:** Block comments cannot be nested. `((` inside a block comment is not treated as an opener.

---

## Standard Attributes

Applicable to all node kinds unless otherwise noted.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `confidence` | number (0.0–1.0) | — | Content reliability score |
| `generated_by` | string | — | Source: AI model ID or `"human"` |
| `verified` | bool or string | — | Verification status or verifier ID |
| `valid_from` | date | — | Start of validity period |
| `valid_to` | date | — | End of validity period |
| `source` | URI or ref | — | Provenance URI or `@ref` |
| `domain` | string | — | Hierarchical dot-path classification (e.g. `"physics.mechanics.classical"`) |
| `priority` | enum | `normal` | Importance level (see Priority Values) |
| `summary` | string | — | Compressed representation for context optimization |
| `tags` | array | — | Freeform string labels |
| `lang` | string | — | BCP 47 language code |
| `deprecated` | bool | `false` | Marks node as superseded |
| `superseded_by` | ref | — | Reference to replacement node |

Universal attributes may appear in both header position (`attr=value`) or as fields (`@attr: value`). Field form takes precedence when both are present.

`deprecated` and `superseded_by` were added in v2.0.

---

## Reserved Prefixes

| Prefix Pattern | Reserved For | Example |
|---|---|---|
| `labels.*` | Multilingual display names | `labels.en="Gravity"`, `labels.ko="중력"` |
| `x-*` | User-defined extensions | `x-internal-id="abc123"` |
| `_*` | Parser/tool internal metadata | `_parsed_at`, `_source_line` |

`labels.*` attributes appear in the node header. They do not conflict with field names. `x-*` attributes are preserved by parsers and ignored by validators.

---

## Standard Entity Types

| Type | Use |
|---|---|
| `Concept` | Abstract idea or principle |
| `Process` | Sequence of steps or transformations |
| `Person` | Human individual |
| `System` | Technical or physical system |
| `Event` | Time-bounded occurrence |
| `Place` | Geographic or conceptual location |
| `Molecule` | Chemical compound or structure |
| `Organization` | Institution, company, or group |
| `Tool` | Software or physical instrument |
| `Theory` | Formal theoretical framework |

---

## Standard Relation Types

| Type | Direction | Meaning |
|---|---|---|
| `is_a` | A → B | A is a subtype or instance of B |
| `part_of` | A → B | A is a component of B |
| `causes` | A → B | A causes B |
| `caused_by` | A → B | A is caused by B |
| `occurs_in` | A → B | Event A occurs in context B |
| `has_stage` | A → B | Process A has stage B |
| `produces` | A → B | A produces B as output |
| `consumes` | A → B | A consumes B as input |
| `discovered` | A → B | Person/entity A discovered B |
| `depends_on` | A → B | A depends on B |
| `contradicts` | A → B | A logically or empirically contradicts B |
| `supports` | A → B | A provides evidence for B |
| `similar_to` | A ↔ B | A is analogous to B |
| `used_by` | A → B | Tool/instrument A is used by B |
| `about` | A → B | Content A is about entity B |
| `supported_by` | A → B | Claim A is backed by argument/evidence B |

---

## Standard Block Types

| Type | Use |
|---|---|
| `definition` | Formal definition of a term or concept |
| `explanation` | Narrative explanation |
| `example` | Concrete illustration |
| `proof` | Logical or mathematical proof |
| `claim` | Assertable proposition |
| `evidence` | Supporting data or observation |
| `lesson` | Educational content unit |
| `exercise` | Practice problem or activity |
| `function` | A defined callable |
| `note` | Supplementary remark |
| `warning` | Caution or important alert |

---

## Priority Values

In descending order:

| Priority | Order | Typical Use |
|---|---|---|
| `critical` | 1 (highest) | Must always be present; never collapsed |
| `high` | 2 | Important; survives Priority phase |
| `normal` | 3 (default) | Standard content |
| `low` | 4 | Supplementary; collapsed in Summary phase |
| `archive` | 5 (lowest) | Historical; excluded from all active phases |

Context phases that include a level include all higher levels. `critical` survives all phases. `archive` is excluded from all phases except Full.

---

## Context Phases

| Phase | Token Budget | What Survives |
|---|---|---|
| Full | Unlimited | All nodes with complete bodies |
| Summary | Medium | `collapse=false` nodes at full; `collapse=true` nodes replaced by `@summary` |
| Priority | Constrained | Only `priority=critical` and `priority=high` nodes |
| Skeleton | Minimal | Entity/rel graph, meta node, no bodies |
| Quantum | Variable | Only content matching the current active quantum-state branches |

---

## EBNF Grammar

Complete formal grammar as specified in UKDL v2.0.

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

**Identifier rule:**

```ebnf
IDENTIFIER = [a-zA-Z_] [a-zA-Z0-9_-]* ;
```

Identifiers are case-sensitive. Hyphens are allowed (kebab-case is idiomatic for IDs).

---

## Error Severity

| Severity | Behavior | Triggers |
|---|---|---|
| Error | Parsing halts | Invalid node boundaries, unclosed `::`, malformed EBNF |
| Warning | Parsing continues | Unresolved references, probability distribution sum != 1.0 (auto-normalized), unknown attributes |
| Info | Silent; parsing continues | Deprecated nodes, unused entities, empty bodies |

---

## Identifier Grammar

```
identifier = [a-zA-Z_] [a-zA-Z0-9_-]*
```

- Case-sensitive
- Hyphens allowed (kebab-case idiomatic for IDs)
- Node IDs take the form `prefix:identifier` (e.g. `ent:newton`, `blk:first-law`)

---

## Processing Stages (Overview)

Parsers process UKDL in 10 sequential stages:

| Stage | Name | Action |
|---|---|---|
| 1 | Line Scan | Recognize `::` node boundaries; classify lines as comment, field, directive, or body |
| 2 | Kind Classification | Map kind string to one of 10 standard kinds; unknown kinds fall back to `block` |
| 3 | Attribute & Field Parsing | Parse header key=value pairs and body `@key: value` fields; type coerce per schema |
| 4 | Reference Resolution | Resolve `@prefix:name`, display refs, namespaced refs; unresolved = warning |
| 5 | Schema Validation | Apply schema constraints; report violations |
| 6 | Knowledge Graph Construction | entity nodes to vertices; rel nodes to edges; `about=` to implicit edges |
| 7 | Quantum State Init | Validate probability distributions; register entanglements; initialize decay clocks |
| 8 | Context Tree Construction | Assign priority/depth/collapse to all nodes; build phase-specific node sets |
| 9 | Conditional Evaluation | Evaluate `|if:|` / `|for:|` directives; select quantum branches; render multimodal blocks |
| 10 | Execution Registration | action nodes to tool schemas; pipeline nodes to scheduler; resolve `depends_on` chains (cycles = error) |

---

## Conformance Levels

| Level | Requirements |
|---|---|
| L0 Parser | Parse `meta` + `block`. Render body as Markdown. |
| L1 Parser | + `entity`, `rel`, `schema`. Build knowledge graph. |
| L2 Parser | + `context`, `include`. Implement context phases. |
| L3 Runtime | + `action`. Execute tools via MCP or equivalent. |
| L4 Runtime | + `quantum`. Manage probabilistic state. |
| L5 Runtime | + `pipeline`. Orchestrate with feedback loops. |
| Full Standard | All levels + JSON round-trip + all export targets. |
