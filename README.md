# UKDL - Unified Knowledge & Dynamics Language

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spec](https://img.shields.io/badge/spec-v2.0-purple)](./UKDL-v2.0-Standard.md)
[![Parser](https://img.shields.io/badge/parser-v2.0.0-green)](./packages/parser)
[![Tests](https://img.shields.io/badge/tests-91%20passing-brightgreen)](./packages/parser/tests)

> The language humans write, AI understands, and knowledge executes.

UKDL is a document-programming hybrid language that unifies human-readable text, machine-parseable knowledge graphs, and executable AI orchestration into a single grammar. A `.ukdl` file simultaneously replaces Markdown, YAML/JSON configs, OpenAPI specs, prompt templates, and AI orchestration chains — while remaining readable to anyone at a glance.

---

## What is UKDL?

Every existing document format forces a tradeoff. Markdown is readable but has zero structure. JSON is parseable but unreadable. RDF has semantics but is expert-only. LangChain YAML is executable but opaque.

UKDL eliminates the tradeoff. One format. Six dimensions. No compromise.

| Dimension | Markdown | Python | YAML/JSON | RDF/OWL | LangChain | UKDL |
|-----------|----------|--------|-----------|---------|-----------|------|
| Human Readable | ● | ◐ | ◐ | ○ | ○ | ● |
| Machine Parseable | ◐ | ● | ● | ● | ● | ● |
| Knowledge Graph | ○ | ○ | ○ | ● | ○ | ● |
| Executable Program | ○ | ● | ○ | ○ | ● | ● |
| Adaptive State | ○ | ◐ | ○ | ○ | ○ | ● |
| AI-Native Context | ○ | ○ | ○ | ○ | ◐ | ● |

Every existing format scores at most 3/6. UKDL scores 6/6.

---

## Features

### Progressive Disclosure: 6 Levels of Complexity

UKDL is designed so you only pay for the complexity you use. Each level is a strict superset of the one below.

```
                ┌──────────┐
                │    L5    │  Orchestrated
               ┌┴──────────┴┐
               │     L4     │  Dynamic
              ┌┴────────────┴┐
              │      L3      │  Executable
             ┌┴──────────────┴┐
             │       L2       │  Context
            ┌┴────────────────┴┐
            │        L1        │  Semantic
           ┌┴──────────────────┴┐
           │         L0          │  Pure
           └─────────────────────┘
```

| Level | Name | Constructs | Typical User | Replaces |
|-------|------|-----------|--------------|----------|
| **L0** | Pure | `meta`, `block` | Anyone who writes | Markdown, plain text |
| **L1** | Semantic | `entity`, `rel`, `schema` | Knowledge workers | Wiki markup, RDF/OWL |
| **L2** | Context | `context`, `include` | RAG/LLM engineers | Prompt templates |
| **L3** | Executable | `action` | AI agent builders | LangChain YAML, DSPy |
| **L4** | Dynamic | `quantum` | Adaptive system designers | Custom state machines |
| **L5** | Orchestrated | `pipeline` | Full-stack AI architects | Airflow, Temporal |

### The 10-Kind System

Every element in UKDL is a **node**, delimited by `::`. There are exactly 10 standard kinds.

| Kind | Prefix | Level | Purpose |
|------|--------|-------|---------|
| `meta` | `doc:` | L0 | Document metadata (1 per file) |
| `block` | `blk:` | L0 | Knowledge chunk (RAG retrieval unit) |
| `entity` | `ent:` | L1 | Knowledge graph node |
| `rel` | `rel:` | L1 | Knowledge graph edge (first-class, reifiable) |
| `schema` | `sch:` | L1 | Validation rules |
| `include` | `inc:` | L2 | External file inclusion with filtering |
| `context` | `ctx:` | L2 | LLM context window optimization |
| `action` | `act:` | L3 | AI agent execution directive |
| `quantum` | `qst:` | L4 | Probabilistic state variable |
| `pipeline` | `pipe:` | L5 | Self-optimizing execution pipeline |

### Key Capabilities

| Capability | Description |
|-----------|-------------|
| **Knowledge Graph** | Entity/relation nodes auto-build a queryable graph. Export to Neo4j, RDF, JSON-LD. |
| **Context Optimization** | 5-phase progressive degradation (Full, Summary, Priority, Skeleton, Quantum) for LLM token budgets. |
| **Quantum States** | Probabilistic variables with observation triggers, entanglement, and decay functions. |
| **Conditional Content** | `\|if:\|` / `\|elif:\|` / `\|else\|` directives render content based on quantum state. |
| **Multimodal I/O** | `[text]`, `[voice]`, `[image]`, `[video]`, `[braille]` output modalities per block. |
| **Pipeline Orchestration** | Goal-driven stage sequences with feedback loops and circuit breakers. |
| **Action Execution** | Agent/tool/trigger directives with timeout, retry, guards, and dependency chains. |
| **JSON Round-Trip** | Lossless UKDL-to-JSON-to-UKDL conversion via canonical mapping. |
| **Schema Validation** | Inline schema nodes enforce structural constraints on other nodes. |
| **Vibe Coding** | At L0, the document IS the spec. At L3+, the document IS the program. |

### Parser Metrics

| Metric | Value |
|--------|-------|
| Test suite | 91 tests passing |
| Architecture | Single-pass O(n) state machine |
| Dependencies | Zero runtime dependencies |
| Formats | 10 node kinds, 17 token types |
| Exports | JSON, Markdown, Neo4j Cypher, RDF/Turtle |
| Context phases | 5 optimization levels |

---

## Requirements

| Requirement | Minimum Version | Notes |
|------------|----------------|-------|
| Node.js | v18+ | Required for parser and CLI |
| npm | v8+ | Package management |
| TypeScript | v5.0+ | Development only |
| VS Code | v1.85+ | Extension support |

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

This generates a minimal L0 `.ukdl` file. Open it in any text editor.

### 3. Parse and Validate

```bash
ukdl parse my-knowledge.ukdl
ukdl validate my-knowledge.ukdl
```

### 4. Export

```bash
ukdl export my-knowledge.ukdl --format json
ukdl export my-knowledge.ukdl --format markdown
ukdl export my-knowledge.ukdl --format cypher
```

### 5. Explore Statistics

```bash
ukdl stats my-knowledge.ukdl
ukdl graph my-knowledge.ukdl
ukdl context my-knowledge.ukdl --phase summary
```

> **New to UKDL?** Start with the [hello-world.ukdl](./examples/hello-world.ukdl) example. It demonstrates that UKDL at Level 0 is as simple as writing a Markdown file with structure. Then explore [knowledge-graph.ukdl](./examples/knowledge-graph.ukdl) to see how entities and relations work.

---

## Usage

### CLI Commands

| Command | Description |
|---------|------------|
| `ukdl parse <file>` | Parse a `.ukdl` file and show AST summary |
| `ukdl validate <file>` | Validate against the UKDL v2.0 spec |
| `ukdl export <file>` | Export to JSON, Markdown, Cypher, or RDF |
| `ukdl graph <file>` | Visualize the knowledge graph in ASCII |
| `ukdl context <file>` | Test context window optimization phases |
| `ukdl stats <file>` | Show comprehensive document statistics |
| `ukdl init [name]` | Create a new UKDL document from template |
| `ukdl fmt <file>` | Format/prettify a UKDL file |

| Option | Description |
|--------|------------|
| `--format <fmt>` | Export format: `json`, `markdown`, `cypher`, `rdf` |
| `--phase <phase>` | Context phase: `full`, `summary`, `priority`, `skeleton`, `quantum` |
| `--level <0-5>` | Document level for init (default: 0) |
| `--output <file>` | Write output to file instead of stdout |
| `--no-color` | Disable colored output |

### TypeScript/JavaScript API

```bash
npm install @ukdl/parser
```

```typescript
import { parse, validate, toJSON, serialize, optimizeContext, extractGraph } from '@ukdl/parser';
import { readFileSync } from 'fs';

const source = readFileSync('lesson.ukdl', 'utf-8');
const result = parse(source);

// Inspect the document
console.log(result.document.nodes);    // All nodes by ID
console.log(result.document.edges);    // All relation edges
console.log(result.errors);            // Parse errors
console.log(result.warnings);          // Parse warnings

// Validate
const validation = validate(result.document);

// Export to canonical JSON
const json = toJSON(result.document);

// Optimize for LLM context window
const summarized = optimizeContext(result.document, 'summary');

// Extract knowledge graph
const graph = extractGraph(result.document);
console.log(graph.nodes);     // Entity nodes
console.log(graph.edges);     // Relation edges
console.log(graph.stats);     // Graph statistics

// Serialize back to UKDL text
const text = serialize(result.document);
```

### VS Code Extension

Install from the `packages/vscode` directory:

```bash
cd packages/vscode
npm install
npm run build
```

| Feature | Description |
|---------|------------|
| **Syntax Highlighting** | All 10 kinds with distinct colors |
| **UKDL Dark Theme** | Purpose-built theme with kind-specific coloring |
| **20 Snippets** | Templates for all kinds, directives, and full documents |
| **Document Outline** | All nodes visible in the outline panel |
| **Hover Documentation** | Hover over `@references` to see target node details |
| **Diagnostics** | Real-time validation of quantum probabilities, references, structure |
| **Auto-Complete** | Kind names, field names, references from current document |
| **Folding** | `:: ... ::` node blocks fold naturally |

---

## Syntax Overview

### L0: The Absolute Minimum

```ukdl
:: meta id=doc:notes title="My Notes" created="2026-03-16"
@author: "me"
@lang: "en"
@version: "1.0"
::

:: block id=blk:idea type=note
Write **Markdown** here. That's it.
::
```

### L1: Knowledge Graph

```ukdl
:: entity id=ent:gravity type=Concept labels.en="Gravity"
The force of attraction between masses.
::

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
::

:: rel id=rel:newton-gravity type=discovered from=@ent:newton to=@ent:gravity
@confidence: 0.99
@source: "Principia Mathematica, 1687"
::
```

### L2: Context Window Optimization

```ukdl
:: context id=ctx:summary priority=critical depth=overview
@summary: "Gravity: force of attraction between masses. F = Gm1m2/r^2."
@collapse: false

Essential content that must always be included.
::

:: context id=ctx:derivation priority=low depth=detailed collapse=true
@summary: "Mathematical derivation of gravitational force."
@max_tokens: 3000

[Detailed content — automatically collapsed when tokens are scarce]
::
```

### L3: Actions

```ukdl
:: action id=act:quiz agent=tutor trigger="lesson_complete"
@tool: "quiz_generator"
@input: {topic: @ent:gravity, difficulty: @qst:level, count: 5}
@output: "quiz.json"
@timeout: 30000
@retry: {max: 3, backoff: "exponential"}
@guard: @qst:level != "uninitialized"
::
```

### L4: Quantum States

```ukdl
:: quantum id=qst:level
@states: {beginner: 0.3, intermediate: 0.5, advanced: 0.2}
@observe_on: "diagnostic_complete"
@entangle: @qst:content-depth
@decay: {function: "exponential", half_life: "14d"}
@default: "intermediate"
::
```

### L5: Pipelines

```ukdl
:: pipeline id=pipe:learning
@goal: "maximize_comprehension"
@criteria: ["accuracy", "retention", "engagement"]
@max_iterations: 50
@stages: [
  {name: "assess",   action: @act:diagnostic},
  {name: "calibrate", quantum: @qst:level},
  {name: "teach",    block: @blk:lesson},
  {name: "practice", action: @act:quiz}
]
@feedback: {
  positive: "advance",
  negative: {adjust: {difficulty: "decrease", examples: "increase"}},
  stagnant: {escalate: "human_review"}
}
@circuit_breaker: {condition: "consecutive_failures > 3", action: "pause"}
::
```

---

## Examples

| File | Level | Description |
|------|-------|------------|
| [hello-world.ukdl](./examples/hello-world.ukdl) | L0 | Minimal document — as simple as Markdown |
| [knowledge-graph.ukdl](./examples/knowledge-graph.ukdl) | L1 | Solar system with entities, relations, and display references |
| [api-documentation.ukdl](./examples/api-documentation.ukdl) | L2 | REST API docs with context phases and schema validation |
| [vibe-coding.ukdl](./examples/vibe-coding.ukdl) | L3 | Write intent, let AI build — action chains and dependency graphs |
| [adaptive-tutorial.ukdl](./examples/adaptive-tutorial.ukdl) | L5 | Full showcase: quantum entanglement, adaptive content, pipeline orchestration |

---

## Repository Structure

| Path | Description |
|------|------------|
| `UKDL-v2.0-Standard.md` | Formal language specification |
| `UKDL-v1.0-Specification.md` | Original specification (Korean) |
| `examples/` | 5 production-quality example documents |
| `packages/parser/` | `@ukdl/parser` — TypeScript reference parser (0 deps, 91 tests) |
| `packages/parser/src/` | Lexer, parser, validator, JSON mapper, serializer, context optimizer, graph extractor |
| `packages/cli/` | `@ukdl/cli` — 9-command CLI tool |
| `packages/vscode/` | VS Code extension: grammar, theme, snippets, diagnostics |
| `ukdl-ontology-explorer.jsx` | React interactive document visualizer |
| `package.json` | Monorepo root |
| `LICENSE` | MIT |

---

## Documentation

| Document | Description |
|----------|------------|
| [UKDL v2.0 Standard](./UKDL-v2.0-Standard.md) | Complete language specification: grammar, semantics, processing model, security |
| [UKDL v1.0 Specification](./UKDL-v1.0-Specification.md) | Original design (Korean), documenting the UPMD + KDL + AIML fusion |
| [Parser README](./packages/parser/README.md) | API reference for `@ukdl/parser` |
| [VS Code README](./packages/vscode/README.md) | Extension features and configuration |

---

## Roadmap

| Phase | Timeline | Deliverables | Status |
|-------|----------|-------------|--------|
| **Foundation** | 0-3 months | Reference parser, CLI, VS Code extension | Complete |
| **Ecosystem** | 3-6 months | Obsidian plugin, Neo4j exporter, LangChain connector, MCP bridge | Planned |
| **Runtime** | 6-9 months | Quantum state engine, pipeline executor, context phase optimizer | Planned |
| **Adoption** | 9-12 months | EduTech integrations, enterprise KMS pilot, community spec group | Planned |
| **Standard** | 12-18 months | W3C Community Group, IANA MIME registration, formal test suite | Planned |

---

## Contributing

1. Read the [UKDL v2.0 Standard](./UKDL-v2.0-Standard.md) — it is the ground truth
2. Check [open issues](https://github.com/Reasonofmoon/ukld-spec/issues) for contribution opportunities
3. Fork, branch, implement, and open a PR
4. All new features must include a `.ukdl` example in `./examples/`
5. Parser changes must include tests (current: 91 passing)

> **Contribution areas**: parser improvements, new export formats, VS Code extension features, Obsidian plugin, additional examples, specification refinements, documentation translations.

---

## Design Philosophy

UKDL is built on three principles that reject the false tradeoffs of existing formats:

**Readability First.** Any UKDL document, at any complexity level, must be immediately comprehensible to a reader who has never seen the spec. If you can't guess what a construct does, the construct is wrong.

**Parse Precision.** Every semantic unit is unambiguously machine-extractable without heuristics. No "maybe it's a heading, maybe it's bold" ambiguity. No whitespace-sensitivity. The EBNF grammar is simple enough to implement in a single-pass O(n) parser with zero dependencies.

**Living Documents.** Documents are not dead text. They carry probabilistic state, respond to conditions, adapt to context, and orchestrate AI agents. A UKDL file is a program that happens to be readable.

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
