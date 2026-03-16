# UKDL - Unified Knowledge & Dynamics Language

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spec](https://img.shields.io/badge/spec-v2.0-purple)](./UKDL-v2.0-Standard.md)
[![Parser](https://img.shields.io/badge/parser-v2.0.0-green)](./packages/parser)
[![Tests](https://img.shields.io/badge/tests-91%20passing-brightgreen)](./packages/parser/tests)

> The language humans write, AI understands, and knowledge executes.

UKDL is the world's first **document-programming hybrid language** designed from the ground up for the AI era. A single `.ukdl` file is simultaneously a human-readable document, a machine-parseable knowledge graph, and an executable adaptive program. It replaces Markdown for authoring, YAML/JSON for configuration, RDF/OWL for knowledge representation, LangChain for AI orchestration, and custom state machines for adaptive behavior — all in one grammar that a non-developer can read at Level 0 and a full-stack AI architect can orchestrate at Level 5.

---

## Origin: Three-Source Fusion

UKDL was born from the fusion of three independent language designs, each solving part of the problem but none solving all of it.

| Source | Core Contribution | Limitation UKDL Solves |
|--------|-------------------|----------------------|
| **UPMD** (Unified Programming for Multimodal Documents) | Quantum state variables, dynamic grammar, multimodal I/O, self-optimization loops, programming control structures | No parser defined, no JSON mapping, ignored knowledge graphs |
| **KDL 0.1** (Knowledge Description Language) | EBNF grammar, 6 core kinds, first-class relations with reification, KDL-JSON mapping, reference system | No context control, not executable, no dynamic state |
| **AIML** (AI Markup Language Vision) | Context window optimization, action execution blocks, progressive disclosure | No implementation specification |

**UKDL's innovation**: merging static knowledge representation (KDL) with dynamic execution and adaptation (UPMD) into one grammar where documents are simultaneously **knowledge repositories and executable programs**.

---

## Why UKDL Exists

Every existing document format forces a tradeoff. Markdown is readable but has zero structure. JSON is parseable but unreadable. RDF has semantics but is expert-only. LangChain YAML is executable but opaque. Jupyter Notebooks mix code and text but lack semantic structure.

UKDL eliminates the tradeoff. One format. Six dimensions. No compromise.

| Dimension | Markdown | Python | YAML/JSON | RDF/OWL | Jupyter | LangChain | UKDL |
|-----------|----------|--------|-----------|---------|---------|-----------|------|
| Human Readable | ● | ◐ | ◐ | ○ | ◐ | ○ | ● |
| Machine Parseable | ◐ | ● | ● | ● | ◐ | ● | ● |
| Knowledge Graph | ○ | ○ | ○ | ● | ○ | ○ | ● |
| Executable Program | ○ | ● | ○ | ○ | ● | ● | ● |
| Adaptive State | ○ | ◐ | ○ | ○ | ○ | ○ | ● |
| AI-Native Context | ○ | ○ | ○ | ○ | ○ | ◐ | ● |

Every existing format scores at most 3/6. **UKDL scores 6/6** — not by being clever, but by being designed for the full stack from day one.

### What Makes UKDL Unique

No other language in existence offers these six properties simultaneously:

| Property | How UKDL Achieves It |
|----------|---------------------|
| **Quantum superposition for state** | `quantum` nodes model uncertainty as probability distributions that collapse on observation |
| **Entanglement between variables** | Entanglement matrices define correlated state collapse across multiple quantum nodes |
| **Context window optimization** | 5-phase progressive degradation: Full, Summary, Priority, Skeleton, Quantum |
| **Self-optimizing pipelines** | `pipeline` nodes define goal-driven stage sequences with feedback loops and circuit breakers |
| **Progressive disclosure** | 6 complexity levels (L0-L5), each a strict superset of the previous |
| **Dual citizenship** | Human-readable Markdown bodies coexist with machine-precise typed fields in the same node |

---

## Features

### Progressive Disclosure: 6 Levels of Complexity

UKDL is designed so you only pay for the complexity you use. Each level is a strict superset of the one below. An L0 document is valid L5. A parser at level N correctly processes all documents at level ≤ N.

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
            │        L1        │  Semantic: entities, relations, graph
           ┌┴──────────────────┴┐
           │         L0          │  Pure: blocks + Markdown body
           └─────────────────────┘
```

| Level | Name | Constructs Added | Typical User | Replaces |
|-------|------|-----------------|--------------|----------|
| **L0** | Pure | `meta`, `block` | Anyone who writes | Markdown, plain text, notes |
| **L1** | Semantic | `entity`, `rel`, `schema` | Knowledge workers, researchers | Wiki markup, RDF/OWL, Wikidata |
| **L2** | Context | `context`, `include` | RAG/LLM engineers, prompt designers | Prompt templates, context packing |
| **L3** | Executable | `action` | AI agent builders, automation engineers | LangChain YAML, DSPy, AutoGPT |
| **L4** | Dynamic | `quantum` | Adaptive system designers, EdTech architects | Custom state machines, A/B testing |
| **L5** | Orchestrated | `pipeline` | Full-stack AI architects | Airflow, Temporal, Prefect |

### The 10-Kind System

Every element in UKDL is a **node**, delimited by `::`. There are exactly 10 standard kinds organized across the 6 levels.

| Kind | Prefix | Level | Purpose | Key Attributes |
|------|--------|-------|---------|---------------|
| `meta` | `doc:` | L0 | Document metadata (1 per file) | `title`, `author`, `lang`, `version`, `domain`, `tags`, `ukdl_level` |
| `block` | `blk:` | L0 | Knowledge chunk (RAG retrieval unit) | `type`, `about`, `priority`, `confidence` |
| `entity` | `ent:` | L1 | Knowledge graph node | `type`, `labels.*`, `aliases`, `same_as` |
| `rel` | `rel:` | L1 | Knowledge graph edge (first-class, reifiable) | `type`, `from`, `to`, `confidence`, `source` |
| `schema` | `sch:` | L1 | Validation rules for other nodes | `applies_to`, `required_fields`, `field_types` |
| `include` | `inc:` | L2 | External file inclusion with filtering | `src`, `filter`, `namespace` |
| `context` | `ctx:` | L2 | LLM context window optimization | `priority`, `depth`, `collapse`, `summary`, `max_tokens` |
| `action` | `act:` | L3 | AI agent execution directive | `agent`, `trigger`, `tool`, `input`, `output`, `timeout`, `retry`, `guard` |
| `quantum` | `qst:` | L4 | Probabilistic state variable | `states`, `observe_on`, `entangle`, `decay`, `history`, `default` |
| `pipeline` | `pipe:` | L5 | Self-optimizing execution pipeline | `goal`, `criteria`, `stages`, `feedback`, `circuit_breaker`, `max_iterations` |

### The Reference System

All cross-node links use the `@prefix:name` pattern, enabling a typed, navigable graph within plain text.

| Reference Style | Syntax | Example | Purpose |
|----------------|--------|---------|---------|
| Bare reference | `@prefix:name` | `@ent:photosynthesis` | Machine link to another node |
| Display reference | `@{prefix:name\|text}` | `@{ent:atp\|ATP molecule}` | Human-readable link with display text |
| Namespaced reference | `@namespace.prefix:name` | `@ch2.ent:gravity` | Cross-file reference via `include` |
| URI reference | `@<uri#prefix:name>` | `@<https://example.com/doc.ukdl#ent:foo>` | External document reference |
| Field access | `@prefix:name.field` | `@ent:newton.born` | Access a specific field value |

### Dynamic Grammar: Inline Directives

UKDL body text supports control structures that render content conditionally based on quantum state.

| Directive | Syntax | Purpose |
|-----------|--------|---------|
| **Conditional** | `\|if: expr\|` ... `\|elif: expr\|` ... `\|else\|` ... `\|/if\|` | Render content based on quantum state |
| **Loop** | `\|for: item in collection\|` ... `\|/for\|` | Iterate over arrays |
| **Multimodal** | `\|multimodal_output\|` `[text]` `[voice]` `[image]` `\|/multimodal_output\|` | Output in multiple modalities |
| **Function** | `\|function: name(params)\|` ... `\|/function\|` | Reusable content generators |

**Expression operators**: `==`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `not`, `and`, `or`

### Context Window Optimization (5 Phases)

UKDL is the only document format natively aware of LLM token budgets. As the context window fills, content degrades gracefully through 5 phases.

| Phase | Strategy | What Survives | Token Budget |
|-------|----------|--------------|--------------|
| **Full** | Everything included | All nodes, full bodies | Plenty |
| **Summary** | Collapse low-priority | `collapse=true` nodes replaced by `@summary` text | Getting tight |
| **Priority** | High-priority only | Only `priority=critical\|high` nodes remain | Limited |
| **Skeleton** | Structure only | Entity/rel graph + meta, no body text | Minimal |
| **Quantum** | Active branches only | Only content matching current quantum state | Extreme |

### Quantum State System

The `quantum` kind models uncertainty honestly. Real systems don't have binary states — learners are "probably intermediate," users are "likely interested." UKDL represents this as probability distributions that collapse upon observation.

| Concept | Description |
|---------|------------|
| **States** | A probability distribution (e.g., `{beginner: 0.3, intermediate: 0.5, advanced: 0.2}`) summing to 1.0 |
| **Observation** | A trigger event (e.g., `"quiz_complete"`) that collapses the superposition to a definite state |
| **Entanglement** | Two quantum nodes whose states are correlated — collapsing one affects the other |
| **Entanglement Matrix** | A probability table defining how state A maps to state B (each row sums to 1.0) |
| **Decay** | A time-based function that drifts probabilities back toward uniform if no observation arrives |
| **History** | Optional preservation of past observations for trend analysis |

### Pipeline Orchestration

Pipelines combine actions, quantum collapses, and content delivery into goal-driven feedback loops.

| Attribute | Purpose |
|-----------|---------|
| `@goal` | The optimization target (e.g., `"maximize_comprehension"`) |
| `@criteria` | Measurable metrics (e.g., `["accuracy", "retention", "engagement"]`) |
| `@stages` | Ordered list of steps, each referencing an action, quantum, or block node |
| `@feedback` | Response rules: `positive` (advance), `negative` (adjust), `stagnant` (escalate) |
| `@circuit_breaker` | Safety valve: halt on repeated failures (e.g., `consecutive_failures > 3`) |
| `@max_iterations` | Hard limit preventing infinite loops |
| `@interval` | How often the pipeline re-evaluates (e.g., `"every_lesson"`) |

---

## Ontology: 4 Knowledge Layers

UKDL documents carry semantic meaning organized across 4 ontology layers.

### Layer 1: Structural Ontology

The document architecture. `Document` contains `Node` objects of 10 `Kind` types. Nodes reference each other via the `@prefix:name` system.

### Layer 2: Semantic Ontology

The meaning of knowledge. Entities carry types that define their role in the domain.

| Entity Type | Description | Example |
|------------|------------|---------|
| `Concept` | An abstract idea | Gravity, Photosynthesis, Democracy |
| `Process` | A sequence of steps | Light Reaction, Compilation, Authentication |
| `Person` | A human individual | Isaac Newton, Ada Lovelace |
| `System` | A composed mechanism | Solar System, Operating System |
| `Event` | A point in time | Apollo 11 Landing, French Revolution |
| `Place` | A physical location | Earth, MIT Campus |
| `Molecule` | A chemical compound | ATP, Glucose, DNA |
| `Organization` | A group entity | NASA, W3C, Google |
| `Tool` | A usable instrument | Python, Telescope, Docker |
| `Theory` | A formal explanation | General Relativity, Evolution |

**Standard relation types**: `is_a`, `part_of`, `causes`, `caused_by`, `occurs_in`, `has_stage`, `produces`, `consumes`, `discovered`, `depends_on`, `contradicts`, `supports`, `similar_to`, `used_by`, `about`, `supported_by`

### Layer 3: Context Ontology

The priority and visibility of knowledge for AI consumption.

| Dimension | Values | Purpose |
|-----------|--------|---------|
| Priority | `critical` > `high` > `normal` > `low` > `archive` | Which content survives token pressure |
| Depth | `overview` < `standard` < `detailed` | How much detail is included |
| Collapse | `true` / `false` | Whether content folds to `@summary` by default |

### Layer 4: Dynamic Ontology

The living, adaptive layer. Quantum states model uncertainty. Pipelines orchestrate behavior. Feedback loops drive continuous improvement.

| Component | Mechanism |
|-----------|----------|
| Quantum State | Probability distribution + observation trigger + entanglement |
| Pipeline Stage | assess -> adapt -> deliver -> evaluate |
| Feedback Loop | positive -> reinforce, negative -> adjust, stagnant -> escalate |

---

## Processing Model: 10-Stage Pipeline

A conformant UKDL parser processes a document through 10 sequential stages.

| Stage | Name | Operation |
|-------|------|-----------|
| 1 | **Line Scan** | Recognize `:: kind ... ::` node boundaries |
| 2 | **Kind Classification** | Map kind string to one of 10 standard kinds (unknown -> `block` fallback) |
| 3 | **Attribute/Field Parsing** | Header `key=value` pairs + body `@key: value` fields |
| 4 | **Reference Resolution** | Convert `@prefix:name` to node links; warn on unresolved refs |
| 5 | **Schema Validation** | Apply `schema` node constraints to matching nodes |
| 6 | **Knowledge Graph Construction** | `entity` nodes -> graph vertices; `rel` nodes -> graph edges; `about=` -> implicit edges |
| 7 | **Quantum State Initialization** | Validate probability sums, register entanglement pairs, start decay clocks |
| 8 | **Context Tree Construction** | Extract priority/depth/collapse; build phase-specific node sets |
| 9 | **Conditional Evaluation** | Evaluate `\|if:\|` blocks based on current quantum state |
| 10 | **Execution Registration** | `action` -> tool invocation schemas; `pipeline` -> orchestration scheduler; detect dependency cycles |

### Error Handling

| Severity | Behavior | Examples |
|----------|----------|---------|
| **Error** | Parsing halts | Unclosed `::`, malformed EBNF, invalid node boundaries |
| **Warning** | Parsing continues | Unresolved references, probability sums != 1.0 (auto-normalized), unknown attributes |
| **Info** | Silent | Deprecated nodes, unused entities, empty bodies |

---

## Standard Attributes (All Nodes)

Every UKDL node can carry these universal metadata fields.

| Attribute | Type | Description |
|-----------|------|-------------|
| `confidence` | 0.0 - 1.0 | Content reliability score |
| `generated_by` | string | Source identifier: AI model ID or `"human"` |
| `verified` | bool / string | Verification status or verifier identity |
| `valid_from` / `valid_to` | date (ISO 8601) | Temporal validity window |
| `source` | URI or reference | Provenance attribution |
| `domain` | dot-path | Hierarchical domain classification (e.g., `"physics.mechanics.classical"`) |
| `priority` | enum | `critical`, `high`, `normal`, `low`, `archive` |
| `summary` | string | Compressed representation for context optimization |
| `tags` | array | Freeform classification labels |
| `lang` | string | BCP 47 language code (e.g., `"en"`, `"ko"`) |
| `deprecated` | bool | Marks node as superseded |
| `superseded_by` | reference | Pointer to replacement node |

---

## UKDL-JSON Canonical Mapping

Every valid UKDL document has a unique canonical JSON representation enabling database storage, API transmission, and programmatic manipulation with guaranteed round-trip fidelity.

```json
{
  "ukdl_version": "2.0",
  "doc": {
    "id": "doc:example",
    "title": "Example Document",
    "author": "author-name",
    "lang": "en"
  },
  "nodes": {
    "ent:concept-a": {
      "kind": "entity",
      "attrs": {"type": "Concept", "labels.en": "Concept A"},
      "fields": {"aliases": ["Alt Name"]},
      "body": "Description text."
    },
    "qst:state-a": {
      "kind": "quantum",
      "fields": {
        "states": {"low": 0.3, "medium": 0.5, "high": 0.2},
        "observe_on": "trigger_event"
      }
    }
  },
  "edges": [
    {"id": "rel:a-b", "from": "ent:concept-a", "to": "ent:concept-b", "type": "causes"}
  ],
  "quantum_state": {
    "variables": ["qst:state-a"],
    "entanglements": []
  },
  "pipelines": []
}
```

**Round-trip guarantee**: `parse(serialize(parse(text))) == parse(text)` — semantic equivalence is preserved through any number of conversions.

---

## Interoperability

### Export Targets

| Target | Mapping |
|--------|---------|
| **JSON** | Canonical UKDL-JSON schema with full round-trip fidelity |
| **Markdown** | Body text rendered with headings from block types |
| **Neo4j / Cypher** | `entity` -> `CREATE` nodes; `rel` -> `CREATE` relationships |
| **RDF / Turtle** | `entity` -> subjects; `rel` -> triples with prefixed predicates |
| **JSON-LD** | `entity`/`rel` -> JSON-LD with `@context` |
| **LangChain** | `action` -> tool definitions; `pipeline` -> chains |
| **MCP** | `action` -> MCP tool invocations |
| **HTML** | Full render with conditional content resolved |
| **PDF** | Static render at current quantum state snapshot |

### Import Sources

| Source | Strategy |
|--------|----------|
| **Markdown** | Each heading section -> `block` node |
| **JSON / YAML** | Key-value pairs -> fields; nested objects -> entities |
| **CSV** | Rows -> entities; columns -> fields |
| **RDF** | Subjects -> entities; predicates -> relations |

---

## Security Considerations

UKDL documents can contain executable directives. Conformant implementations must enforce these security requirements.

| Concern | Requirement |
|---------|------------|
| **Action sandboxing** | L3+ runtimes must sandbox tool execution; no filesystem access beyond declared `@input`/`@output` |
| **Pipeline limits** | `@max_iterations` and `@circuit_breaker` must be enforced to prevent resource exhaustion |
| **Reference injection** | Display references `@{...}` must be sanitized when rendering to HTML to prevent XSS |
| **Quantum audit** | Runtimes should log all state observations for audit trails |
| **Include security** | `include` nodes must not resolve references outside the document's trust boundary without explicit configuration |

---

## Vibe Coding: The UKDL Paradigm

**Vibe coding** means expressing intent in natural language and having the system figure out the implementation. UKDL is the ideal substrate for this paradigm.

| Principle | How UKDL Implements It |
|-----------|----------------------|
| **L0 IS vibe coding** | Write natural text in blocks; the structure is minimal `:: block` delimiters |
| **Semantics are optional** | Add `entity` and `rel` when you want precision; ignore them when you don't |
| **Actions express intent** | `@tool: "generate_quiz"` says WHAT, not HOW |
| **Quantum models honesty** | "The learner is PROBABLY intermediate" is more honest than `if level == 3` |
| **Pipelines declare goals** | `@goal: "maximize_comprehension"` is the vibe; the system optimizes the path |
| **Context handles AI limits** | The document itself knows how to compress for different token budgets |

At L0, **the document IS the specification**. At L3+, **the document IS the program**. The most radical thing about UKDL: there is no gap between what you write and what executes.

```ukdl
:: block id=blk:vision type=definition priority=critical
I want a **todo app** that:
- Lets me add, complete, and delete tasks
- Has a clean, minimal design
- Works offline and syncs when online
- Has dark mode by default
::

:: action id=act:build agent=code-gen trigger="project_start"
@tool: "project_scaffolder"
@input: {framework: "next.js", styling: "tailwind", database: "sqlite"}
@output: "./todo-app/"

Build the app from the vision above.
::
```

Write the intent. The AI builds it. The document is the source of truth.

---

## Requirements

| Requirement | Minimum Version | Notes |
|------------|----------------|-------|
| Node.js | v18+ | Required for parser and CLI |
| npm | v8+ | Package management |
| TypeScript | v5.0+ | Development only |
| VS Code | v1.85+ | Extension support (optional) |

---

## Quick Start

### 1. Install the CLI

```bash
npm install -g @ukdl/cli
```

### 2. Create Your First Document

```bash
ukdl init my-knowledge --level 0
```

This generates a minimal L0 `.ukdl` file — structured Markdown that any text editor can open.

### 3. Parse and Validate

```bash
ukdl parse my-knowledge.ukdl
ukdl validate my-knowledge.ukdl
```

### 4. Export to Other Formats

```bash
ukdl export my-knowledge.ukdl --format json       # Canonical JSON
ukdl export my-knowledge.ukdl --format markdown    # Standard Markdown
ukdl export my-knowledge.ukdl --format cypher      # Neo4j Cypher statements
ukdl export my-knowledge.ukdl --format rdf         # RDF/Turtle triples
```

### 5. Explore Your Document

```bash
ukdl stats my-knowledge.ukdl                       # Comprehensive statistics
ukdl graph my-knowledge.ukdl                       # ASCII knowledge graph
ukdl context my-knowledge.ukdl --phase summary     # Context optimization preview
```

### 6. Scaffold Higher Levels

```bash
ukdl init advanced-doc --level 3    # L3 template with actions
ukdl init full-stack --level 5      # L5 template with everything
```

> **New to UKDL?** Start with the [hello-world.ukdl](./examples/hello-world.ukdl) example. It demonstrates that UKDL at Level 0 is as simple as writing a Markdown file with structure. Then explore [knowledge-graph.ukdl](./examples/knowledge-graph.ukdl) to see entities and relations in action, and [adaptive-tutorial.ukdl](./examples/adaptive-tutorial.ukdl) for the full L5 experience.

---

## Usage

### CLI Commands

| Command | Description |
|---------|------------|
| `ukdl parse <file>` | Parse a `.ukdl` file and show AST summary with node counts by kind |
| `ukdl validate <file>` | Validate against UKDL v2.0 spec (exit code 1 on errors, 0 on success) |
| `ukdl export <file>` | Export to JSON, Markdown, Cypher, or RDF |
| `ukdl graph <file>` | Visualize the knowledge graph as ASCII art with entity types and relation labels |
| `ukdl context <file>` | Show token estimates per context phase with progress bars |
| `ukdl stats <file>` | Show lines, tokens, node breakdown, reference resolution, quantum variables, pipeline goals |
| `ukdl init [name]` | Create a new UKDL document from template (L0-L5) |
| `ukdl fmt <file>` | Parse and re-serialize with consistent formatting |

| Option | Description |
|--------|------------|
| `--format <fmt>` | Export format: `json`, `markdown`, `cypher`, `rdf` |
| `--phase <phase>` | Context phase: `full`, `summary`, `priority`, `skeleton`, `quantum` |
| `--level <0-5>` | Document level for init (default: 0) |
| `--output <file>` | Write output to file instead of stdout |
| `--no-color` | Disable colored output |
| `-q, --quiet` | Suppress non-essential output |

### TypeScript / JavaScript API

```bash
npm install @ukdl/parser
```

```typescript
import {
  parse,
  validate,
  toJSON,
  fromJSON,
  serialize,
  optimizeContext,
  extractGraph,
  parseAndValidate
} from '@ukdl/parser';
import { readFileSync } from 'fs';

// Parse a UKDL file
const source = readFileSync('lesson.ukdl', 'utf-8');
const result = parse(source);

console.log(result.document.nodes);    // Map of all nodes by ID
console.log(result.document.edges);    // All relation edges
console.log(result.errors);            // Parse errors (empty if valid)
console.log(result.warnings);          // Warnings (unresolved refs, etc.)

// Validate semantic constraints
const validation = validate(result.document);
// Checks: required fields, probability sums, dependency cycles, schema compliance

// Export to canonical JSON (round-trip safe)
const json = toJSON(result.document);
const restored = fromJSON(json);

// Optimize for LLM context window
const summarized = optimizeContext(result.document, 'summary');
const skeleton = optimizeContext(result.document, 'skeleton');

// Extract knowledge graph for analysis
const graph = extractGraph(result.document);
console.log(graph.nodes);              // Entity + block nodes
console.log(graph.edges);             // Explicit rel + implicit about edges
console.log(graph.stats);             // Node count, edge count, components, avg degree

// Serialize AST back to formatted UKDL text
const text = serialize(result.document);

// Convenience: parse + validate in one call
const full = parseAndValidate(source);
```

### VS Code Extension

Install from the `packages/vscode` directory:

```bash
cd packages/vscode
npm install && npm run build
```

| Feature | Description |
|---------|------------|
| **Syntax Highlighting** | All 10 kinds with distinct colors (entity=cyan, quantum=pink, pipeline=emerald, action=red, etc.) |
| **UKDL Dark Theme** | Purpose-built dark theme optimized for UKDL readability |
| **20 Snippets** | Templates for all kinds, all directives, and full L0/L1/L3/L5 document scaffolds |
| **Document Outline** | All nodes visible in the sidebar outline with kind-appropriate icons |
| **Hover Documentation** | Hover over `@prefix:name` references to see target node summary and quantum states |
| **Auto-Complete** | Kind names after `::`, field names after `@`, reference IDs from current document |
| **Diagnostics** | Real-time validation: quantum probability sums, unresolved references, missing meta, unclosed nodes |
| **Folding** | `:: ... ::` node blocks and `(( ... ))` block comments fold naturally |
| **Status Bar** | Shows current document level (L0 Pure through L5 Orchestrated) with kind-matching colors |

---

## Syntax Overview by Level

### L0: Pure — As Simple as Markdown

```ukdl
%% My first UKDL document

:: meta id=doc:notes title="My Notes" created="2026-03-16"
@author: "me"
@lang: "en"
@version: "1.0"
::

:: block id=blk:idea type=note
Write **Markdown** here. _Everything_ you know about Markdown works:
lists, links, code blocks, and more.

- Blocks are self-contained knowledge chunks
- They're perfect for RAG retrieval
- And they're as easy to write as a note
::
```

### L1: Semantic — Knowledge Graph in Plain Text

```ukdl
:: entity id=ent:gravity type=Concept labels.en="Gravity"
@aliases: ["Gravitational Force"]
@same_as: ["https://www.wikidata.org/wiki/Q11412"]
The force of attraction between masses.
::

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
@born: "1643-01-04"
::

:: rel id=rel:newton-gravity type=discovered from=@ent:newton to=@ent:gravity
@confidence: 0.99
@source: "Principia Mathematica, 1687"
Newton formulated the law of universal gravitation.
::
```

Export this to Neo4j with one command: `ukdl export doc.ukdl --format cypher`

### L2: Context — AI-Aware Token Optimization

```ukdl
:: context id=ctx:summary priority=critical depth=overview
@summary: "Gravity: force between masses. F = Gm1m2/r^2."
@collapse: false

Essential content that must always be included in the AI context window.
::

:: context id=ctx:derivation priority=low depth=detailed collapse=true
@summary: "Mathematical derivation of gravitational force."
@max_tokens: 3000

6CO2 + 6H2O + light -> C6H12O6 + 6O2
[Full derivation — automatically collapsed when tokens are scarce]
::
```

### L3: Executable — Actions Express Intent

```ukdl
:: action id=act:quiz agent=tutor trigger="lesson_complete"
@tool: "adaptive_quiz_generator"
@input: {topic: @ent:gravity, difficulty: @qst:level, count: 5}
@output: "quiz.json"
@timeout: 30000
@retry: {max: 3, backoff: "exponential"}
@guard: @qst:level != "uninitialized"
@depends_on: @act:prerequisite-check

Generate a quiz based on the learner's current proficiency.
::
```

No Python. No YAML boilerplate. No LangChain chains. Just: what tool, what input, what output, what guard.

### L4: Dynamic — Quantum States Model Uncertainty

```ukdl
:: quantum id=qst:learner-level
@states: {beginner: 0.3, intermediate: 0.5, advanced: 0.2}
@observe_on: "diagnostic_quiz_complete"
@entangle: @qst:content-depth
@decay: {function: "exponential", half_life: "14d"}
@default: "intermediate"
@history: true

The learner's proficiency — a superposition until observed.
::

:: quantum id=qst:content-depth
@states: {basic: 0.3, standard: 0.5, deep: 0.2}
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-basic: 0.8, beginner-standard: 0.15, beginner-deep: 0.05,
  intermediate-basic: 0.1, intermediate-standard: 0.7, intermediate-deep: 0.2,
  advanced-basic: 0.0, advanced-standard: 0.3, advanced-deep: 0.7
}
::
```

Then use quantum states to render adaptive content:

```ukdl
:: block id=blk:adaptive type=lesson about=@ent:gravity
@when: @qst:learner-level

|if: @qst:learner-level == beginner|
Gravity is what makes things fall down. The heavier something is,
the more gravity pulls on it.
|elif: @qst:learner-level == intermediate|
Gravity is a force proportional to mass and inversely proportional
to the square of distance: F = Gm1m2/r^2.
|else|
In general relativity, gravity is not a force but a curvature of
spacetime described by the Einstein field equations: G_uv = 8piT_uv.
|/if|
::
```

### L5: Orchestrated — Goal-Driven Pipelines

```ukdl
:: pipeline id=pipe:mastery
@goal: "achieve_physics_proficiency"
@criteria: ["quiz_accuracy", "concept_retention", "problem_solving_speed"]
@interval: "every_lesson"
@max_iterations: 50
@stages: [
  {name: "assess",    action: @act:diagnostic},
  {name: "calibrate", quantum: @qst:learner-level},
  {name: "teach",     block: @blk:adaptive},
  {name: "practice",  action: @act:quiz}
]
@feedback: {
  positive: "advance_difficulty",
  negative: {adjust: {difficulty: "decrease", examples: "increase", pace: "slower"}},
  stagnant: {escalate: "human_review"}
}
@circuit_breaker: {condition: "consecutive_failures > 3", action: "pause_and_notify"}

Adaptive learning pipeline: diagnose -> calibrate -> teach -> practice -> feedback loop.
::
```

You declare the goal. The system optimizes the path.

---

## Examples

| File | Level | Description |
|------|-------|------------|
| [hello-world.ukdl](./examples/hello-world.ukdl) | L0 | Minimal document — as simple as Markdown with structure |
| [knowledge-graph.ukdl](./examples/knowledge-graph.ukdl) | L1 | Solar system with 5 entities, 4 relations, and display references |
| [api-documentation.ukdl](./examples/api-documentation.ukdl) | L2 | REST API docs with context phases, schema validation, and collapsible sections |
| [vibe-coding.ukdl](./examples/vibe-coding.ukdl) | L3 | Write intent, let AI build — 4 chained actions with dependency graph and pipeline |
| [adaptive-tutorial.ukdl](./examples/adaptive-tutorial.ukdl) | L5 | Full showcase: 5 entities, 6 relations, 2 entangled quantum states, 3 actions, adaptive content, pipeline with circuit breaker |

---

## Conformance Levels

A UKDL implementation must declare which level it supports.

| Conformance | Requirements |
|------------|-------------|
| **L0 Parser** | Parse `meta` + `block`. Render body as Markdown. |
| **L1 Parser** | + `entity`, `rel`, `schema`. Build knowledge graph. |
| **L2 Parser** | + `context`, `include`. Implement 5 context phases. |
| **L3 Runtime** | + `action`. Execute tools via MCP or equivalent. |
| **L4 Runtime** | + `quantum`. Manage probabilistic state with entanglement and decay. |
| **L5 Runtime** | + `pipeline`. Orchestrate with feedback loops and circuit breakers. |
| **Full Standard** | All levels + JSON round-trip + all export targets. |

---

## Parser Metrics

| Metric | Value |
|--------|-------|
| Test suite | 91 tests passing |
| Architecture | Single-pass O(n) state machine |
| Runtime dependencies | Zero |
| Source modules | 10 (lexer, parser, validator, JSON mapper, serializer, context optimizer, graph extractor, types, index, tests) |
| Token types | 17 |
| Node kinds | 10 |
| Export formats | 4 (JSON, Markdown, Cypher, RDF) |
| Context phases | 5 |
| Snippet templates | 20 |
| VS Code features | 9 (highlighting, theme, snippets, outline, hover, completion, diagnostics, folding, status bar) |

---

## Repository Structure

| Path | Description |
|------|------------|
| `UKDL-v2.0-Standard.md` | Formal language specification (EBNF grammar, semantics, processing model, security) |
| `UKDL-v1.0-Specification.md` | Original specification (Korean), documenting the UPMD + KDL + AIML fusion |
| `examples/` | 5 production-quality `.ukdl` documents covering L0 through L5 |
| `packages/parser/` | `@ukdl/parser` — TypeScript reference parser, 0 runtime dependencies, 91 tests |
| `packages/parser/src/` | lexer, parser, validator, json-mapper, serializer, context-optimizer, knowledge-graph, types |
| `packages/parser/tests/` | Comprehensive test suite: all kinds, directives, error handling, round-trip, exports |
| `packages/cli/` | `@ukdl/cli` — 9-command CLI with colored output, ASCII graph visualization |
| `packages/cli/src/commands/` | parse, validate, export, graph, context, stats, init, fmt |
| `packages/vscode/` | VS Code extension: TextMate grammar, dark theme, 20 snippets, extension.ts |
| `packages/vscode/syntaxes/` | `ukdl.tmLanguage.json` — comprehensive TextMate grammar for all 10 kinds |
| `packages/vscode/themes/` | `ukdl-dark.json` — purpose-built dark theme with kind-specific colors |
| `ukdl-ontology-explorer.jsx` | React interactive visualizer with force-directed graph, quantum observer, pipeline animator |
| `package.json` | Monorepo root |
| `LICENSE` | MIT |

---

## Documentation

| Document | Description |
|----------|------------|
| [UKDL v2.0 Standard](./UKDL-v2.0-Standard.md) | Complete language specification: lexical grammar, EBNF, 10 kinds, processing model, JSON mapping, security, conformance |
| [UKDL v1.0 Specification](./UKDL-v1.0-Specification.md) | Original design document (Korean), recording the design decisions behind the three-source fusion |
| [VS Code Extension](./packages/vscode/README.md) | Extension features, snippet reference, theme customization |

---

## Roadmap

| Phase | Timeline | Deliverables | Status |
|-------|----------|-------------|--------|
| **Foundation** | 0-3 months | Reference parser (TypeScript), CLI tool, VS Code extension | Complete |
| **Ecosystem** | 3-6 months | Obsidian plugin, Neo4j live exporter, LangChain connector, MCP bridge, Python parser | Planned |
| **Runtime** | 6-9 months | Quantum state engine, pipeline executor, context phase optimizer, WASM parser | Planned |
| **Adoption** | 9-12 months | EduTech integrations, enterprise KMS pilot, community spec group, documentation translations | Planned |
| **Standard** | 12-18 months | W3C Community Group, IANA MIME type registration (`text/ukdl`), formal conformance test suite | Planned |

---

## Contributing

1. Read the [UKDL v2.0 Standard](./UKDL-v2.0-Standard.md) — it is the ground truth
2. Check [open issues](https://github.com/Reasonofmoon/ukld-spec/issues) for contribution opportunities
3. Fork, branch, implement, and open a PR
4. All new features must include a `.ukdl` example in `./examples/`
5. Parser changes must include tests (current: 91 passing)

> **Contribution areas**: parser improvements, new export formats (JSON-LD, GraphML), VS Code extension features, Obsidian plugin, Python parser port, additional examples, specification refinements, documentation translations (Korean, Japanese, Chinese, Spanish).

---

## Design Philosophy

UKDL is built on three principles that reject the false tradeoffs of existing formats:

**Readability First.** Any UKDL document, at any complexity level, must be immediately comprehensible to a reader who has never seen the spec. If a reader cannot guess what a construct does, the construct is wrong. At L0, UKDL is simpler than Markdown. At L5, the complexity is visible only to those who need it.

**Parse Precision.** Every semantic unit is unambiguously machine-extractable without heuristics. No "maybe it's a heading, maybe it's bold" ambiguity (Markdown's curse). No whitespace-sensitivity (YAML's curse). No bracket-matching nightmares (JSON's curse). The EBNF grammar is simple enough to implement in a single-pass O(n) parser with zero runtime dependencies.

**Living Documents.** Documents are not dead text. They carry probabilistic state, respond to conditions, adapt to context, and orchestrate AI agents. A UKDL file is a program that happens to be readable. Knowledge evolves, and the language that represents it must evolve with it.

> *"The right language is not the one with the most features. It is the one where the simplest use case requires zero learning, and the most complex use case requires no other language."*

---

## License

MIT License

Copyright 2026 UKDL Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies. See [LICENSE](./LICENSE) for full terms.

---

## Support

- **Specification**: [UKDL v2.0 Standard](./UKDL-v2.0-Standard.md)
- **Issues**: [GitHub Issues](https://github.com/Reasonofmoon/ukld-spec/issues)
- **Examples**: [./examples/](./examples/)

---

Made with AI by [UKDL Contributors](https://github.com/Reasonofmoon/ukld-spec)
