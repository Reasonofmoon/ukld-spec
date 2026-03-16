<div align="center">

# UKDL

### Unified Knowledge & Dynamics Language

**The language humans write, AI understands, and knowledge executes.**

[![npm](https://img.shields.io/npm/v/@ukdl/parser?label=parser&color=6366f1)](https://www.npmjs.com/package/@ukdl/parser)
[![npm](https://img.shields.io/npm/v/@ukdl/cli?label=cli&color=6366f1)](https://www.npmjs.com/package/@ukdl/cli)
[![CI](https://img.shields.io/github/actions/workflow/status/ukdl/ukdl-language/ci.yml?label=CI)](https://github.com/ukdl/ukdl-language/actions)
[![Coverage](https://img.shields.io/codecov/c/github/ukdl/ukdl-language?color=22c55e)](https://codecov.io/gh/ukdl/ukdl-language)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Spec](https://img.shields.io/badge/spec-v2.0-blue)](./UKDL-v2.0-Standard.md)

[Specification](./UKDL-v2.0-Standard.md) · [Examples](./examples) · [Parser](./packages/parser) · [CLI](./packages/cli) · [VS Code](./packages/vscode)

---

</div>

## What is UKDL?

UKDL is a document-programming hybrid language where every document is simultaneously:

- **A readable text** — as simple as Markdown at Level 0, readable by anyone
- **A knowledge graph** — entities and relations form a queryable, navigable structure
- **An executable program** — actions, pipelines, and adaptive state machines run in real AI systems

A single `.ukdl` file can replace your Markdown notes, your YAML configs, your OpenAPI docs, your LangChain chains, and your state machine definitions — while remaining readable to a non-technical person at a glance.

---

## 30 Seconds to UKDL

The simplest possible document — pure Level 0, as easy as a Markdown file:

```ukdl
%% My notes on machine learning

:: meta id=doc:ml-notes title="Machine Learning Notes" created="2026-03-16"
@author: "student"
@lang: "en"
@version: "1.0"
::

:: block id=blk:supervised type=definition
## Supervised Learning

Training a model on **labeled data** — inputs paired with known outputs.

Examples: linear regression, decision trees, neural networks.
::

:: block id=blk:unsupervised type=definition
## Unsupervised Learning

Finding patterns in data **without labels**.

Examples: k-means clustering, PCA, autoencoders.
::
```

That's it. `::` opens a node, `::` closes it. Everything inside is Markdown.

Now, when you're ready for more — add entities, relations, adaptive content, and AI pipelines. One level at a time.

---

## The Progressive Disclosure Pyramid

UKDL is designed so you only use the complexity you need. Every level is a superset of the one below it.

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

| Level | Name | What You Get | Replaces |
|-------|------|-------------|----------|
| **L0** | Pure | `meta`, `block` — structured Markdown | `.md` files, plain text |
| **L1** | Semantic | `entity`, `rel`, `schema` — knowledge graph | Wiki markup, RDF/OWL |
| **L2** | Context | `context`, `include` — LLM window optimization | Prompt templates |
| **L3** | Executable | `action` — AI agent directives | LangChain YAML, DSPy |
| **L4** | Dynamic | `quantum` — probabilistic adaptive state | Custom state machines |
| **L5** | Orchestrated | `pipeline` — feedback-loop orchestration | Airflow, Temporal |

---

## Why Not Just Use...

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

Every existing format scores at best 3/6. UKDL scores 6/6 — not by being clever, but by being designed for the full stack from day one.

---

## Quick Start

### Install the CLI

```bash
npm install -g @ukdl/cli
```

```bash
# Parse and validate a .ukdl file
ukdl parse examples/hello-world.ukdl

# Export to JSON
ukdl export examples/knowledge-graph.ukdl --format json

# Export to Markdown
ukdl export examples/adaptive-tutorial.ukdl --format markdown

# Check all files in a directory
ukdl validate ./docs/
```

### Use the Parser (TypeScript / JavaScript)

```bash
npm install @ukdl/parser
```

```typescript
import { parse } from '@ukdl/parser';
import { readFileSync } from 'fs';

const source = readFileSync('my-document.ukdl', 'utf-8');
const doc = parse(source);

// Access the knowledge graph
console.log(doc.entities);   // All entity nodes
console.log(doc.relations);  // All relation edges
console.log(doc.blocks);     // All content blocks

// Export to canonical JSON
const json = doc.toJSON();

// Render with quantum state
const rendered = doc.render({ 'qst:skill-level': 'beginner' });
```

### VS Code Extension

Search for **UKDL** in the VS Code Marketplace, or install from source:

```bash
cd packages/vscode
npm install
npm run package
code --install-extension ukdl-*.vsix
```

Features: syntax highlighting, hover documentation, go-to-definition for `@references`, outline view, and validation diagnostics.

---

## Examples

All examples are in [`./examples/`](./examples/):

| File | Level | What It Shows |
|------|-------|--------------|
| [`hello-world.ukdl`](./examples/hello-world.ukdl) | L0 | The absolute minimum — as easy as Markdown |
| [`knowledge-graph.ukdl`](./examples/knowledge-graph.ukdl) | L1 | Entities, relations, and inline references |
| [`adaptive-tutorial.ukdl`](./examples/adaptive-tutorial.ukdl) | L5 | Every feature in one real-world document |
| [`vibe-coding.ukdl`](./examples/vibe-coding.ukdl) | L3 | Write intent; let AI build the app |
| [`api-documentation.ukdl`](./examples/api-documentation.ukdl) | L2 | API docs that are actually readable |

---

## Feature Highlights

### L1: Knowledge Graph in Plain Text

Declare entities and relations directly in your document. No external graph database required at authoring time.

```ukdl
:: entity id=ent:python type=Tool labels.en="Python"
@aliases: ["Python 3", "CPython"]
A high-level, general-purpose programming language.
::

:: entity id=ent:django type=Tool labels.en="Django"
A high-level Python web framework.
::

:: rel id=rel:django-uses-python type=depends_on from=@ent:django to=@ent:python
Django is built entirely on Python and requires Python 3.10+.
::
```

Export to Neo4j, RDF/Turtle, or JSON-LD with a single CLI command.

### L2: AI Context Window Optimization

Tell the AI which parts of your document matter most. UKDL handles compression as token budgets shrink — automatically.

```ukdl
:: context id=ctx:summary priority=critical depth=overview
@summary: "The core idea in one sentence."
@collapse: false

The essential content that must always be included.
::

:: context id=ctx:deep-dive priority=low depth=detailed collapse=true
@summary: "Full derivation (collapsed when tokens are scarce)."
@max_tokens: 3000

The full, detailed explanation that gets folded when the LLM
context window is under pressure.
::
```

Five progressive phases — Full, Summary, Priority, Skeleton, Quantum — automatically degrade content to fit any token budget.

### L3: Actions Express Intent, Not Code

```ukdl
:: action id=act:generate-quiz agent=tutor trigger="lesson_complete"
@tool: "adaptive_quiz_generator"
@input: {topic: @ent:python, difficulty: @qst:skill-level, count: 5}
@output: "quiz.json"
@timeout: 30000
@retry: {max: 3, backoff: "exponential"}

Generate a quiz based on the learner's current proficiency.
::
```

No Python. No YAML boilerplate. No LangChain chains. Just: what tool, what input, what output, what guard.

### L4: Quantum States Model Reality

Real systems are uncertain. `quantum` nodes represent that honestly.

```ukdl
:: quantum id=qst:skill-level
@states: {newcomer: 0.3, familiar: 0.5, experienced: 0.2}
@observe_on: "diagnostic_complete"
@decay: {function: "exponential", half_life: "30d"}
@default: "familiar"
@history: true

The learner's proficiency — a superposition until observed.
::
```

State collapses when a trigger fires. Entangled states collapse together. And if no observation arrives in 30 days, the certainty decays — because that's how knowledge actually works.

### L5: Pipelines Declare Goals

```ukdl
:: pipeline id=pipe:mastery
@goal: "achieve_proficiency"
@criteria: ["quiz_accuracy", "concept_retention"]
@max_iterations: 100
@stages: [
  {name: "assess",   action: @act:diagnostic},
  {name: "calibrate", quantum: @qst:skill-level},
  {name: "teach",    block: @blk:lesson},
  {name: "practice", action: @act:exercises}
]
@feedback: {
  positive: "advance_difficulty",
  negative: {adjust: {examples: "increase", pace: "slower"}},
  stagnant: {escalate: "human_review"}
}
@circuit_breaker: {condition: "consecutive_failures > 3", action: "pause_and_notify"}
::
```

You declare the goal. The system optimizes the path.

### Vibe Coding: Write What You Want

The most radical thing about UKDL is this: at L0, your document IS the specification. At L3+, your document IS the program.

```ukdl
:: block id=blk:vision type=definition priority=critical
I want a REST API that:
- Authenticates users with JWT
- Has CRUD endpoints for "projects" and "tasks"
- Returns paginated results
- Sends email notifications on task assignment
::

:: action id=act:build agent=backend-ai trigger="project_start"
@tool: "api_builder"
@input: {spec: @blk:vision, framework: "fastapi", db: "postgresql"}
@output: "./api/"

Build the API from the vision above.
::
```

Write the intent. The AI builds it. The document is the source of truth.

---

## Repository Structure

```
ukdl-language/
├── UKDL-v2.0-Standard.md    # The formal specification
├── examples/                 # Example .ukdl files
│   ├── hello-world.ukdl      # L0: The absolute minimum
│   ├── knowledge-graph.ukdl  # L1: Solar system knowledge graph
│   ├── adaptive-tutorial.ukdl # L5: Full Python tutorial
│   ├── vibe-coding.ukdl      # L3: Build an app with intent
│   └── api-documentation.ukdl # L2: REST API docs
├── packages/
│   ├── parser/               # @ukdl/parser — TypeScript reference parser
│   ├── cli/                  # @ukdl/cli — Command-line tools
│   └── vscode/               # UKDL VS Code extension
├── package.json              # Monorepo root
└── LICENSE                   # MIT
```

---

## Roadmap

| Phase | Timeline | Status |
|-------|----------|--------|
| **Foundation** | 0–3 months | Reference parser, CLI, VS Code extension |
| **Ecosystem** | 3–6 months | Obsidian plugin, Neo4j exporter, LangChain connector, MCP bridge |
| **Runtime** | 6–9 months | Quantum state engine, pipeline executor, context phase optimizer |
| **Adoption** | 9–12 months | EduTech integrations, enterprise KMS pilot, community spec group |
| **Standard** | 12–18 months | W3C Community Group, IANA MIME registration, formal test suite |

---

## Contributing

We welcome contributions to the spec, the parser, the CLI, and the VS Code extension.

1. Read the [specification](./UKDL-v2.0-Standard.md) — it's the ground truth
2. Check [open issues](https://github.com/ukdl/ukdl-language/issues) for good first contributions
3. Fork, branch, implement, and open a PR
4. All new features must include a `.ukdl` example in `./examples/`

---

## License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">

*UKDL — Where what you see is what you mean, what you mean comes alive, and knowledge evolves itself.*

</div>
