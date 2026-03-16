# UKDL — VS Code Extension

**Unified Knowledge & Dynamics Language** support for Visual Studio Code.

## Features

- **Syntax Highlighting** — Full grammar for all 10 UKDL node kinds, fields, references, directives, and inline Markdown
- **UKDL Dark Theme** — Visually distinct colors for each node kind (meta/block/entity/rel/schema/include/context/action/quantum/pipeline)
- **Snippets** — Templates for every kind, all directive types, and complete L0–L5 document scaffolds
- **Document Outline** — All nodes appear in the VS Code outline view (Ctrl+Shift+O)
- **Folding** — `:: ... ::` node blocks and `(( ... ))` block comments fold correctly
- **Hover Tooltips** — Hover any `@prefix:name` reference to see the target node's kind, title, and summary
- **Auto-complete** — Context-aware completions for kind names, field names, reference IDs, priority/depth/type values
- **Diagnostics** — Live warnings for:
  - Quantum probability distributions that don't sum to 1.0
  - Unresolved `@prefix:name` references
  - Missing `meta` as first node
  - Unclosed `::` blocks
- **Status Bar** — Shows current document's UKDL level (L0–L5) with color coding

## Screenshot

![UKDL Dark Theme](./screenshot.png)

## Installation

### From VSIX

```
code --install-extension ukdl-2.0.0.vsix
```

### From Source

```bash
cd packages/vscode
npm install
npm run build
# Then press F5 in VS Code to open Extension Development Host
```

## UKDL Syntax Overview

UKDL documents are composed of **nodes** delimited by `::`:

```ukdl
%% Single-line comment

(( Block comment spanning
   multiple lines ))

:: meta id=doc:my-doc title="My Document" created="2026-03-16"
@author: "author-name"
@lang: "en"
@version: "2.0"
@ukdl_level: 1
::

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
@born: "1643-01-04"
@same_as: ["https://www.wikidata.org/wiki/Q935"]

English mathematician and physicist.
::

:: rel id=rel:newton-gravity type=discovered from=@ent:newton to=@ent:gravity
@confidence: 0.95
@source: "Principia Mathematica, 1687"
::

:: block id=blk:gravity type=explanation about=@ent:gravity priority=high
@summary: "Newton's law of universal gravitation."

Newton's law of universal gravitation states that every particle attracts every
other particle with a force proportional to the product of their masses and
inversely proportional to the square of the distance between them.

|if: @qst:reader-level == beginner|
Think of it as: the heavier the objects and the closer they are, the stronger
they pull toward each other.
|else|
Formally: F = G(m₁m₂)/r²
|/if|
::
```

### The 10 Node Kinds

| Kind | Level | Color | Purpose |
|------|-------|-------|---------|
| `meta` | L0 | Gray | Document metadata |
| `block` | L0 | Purple | Knowledge chunks |
| `entity` | L1 | Cyan | Knowledge graph nodes |
| `rel` | L1 | Teal | Knowledge graph edges |
| `schema` | L1 | Slate | Validation rules |
| `include` | L2 | Indigo | External file inclusion |
| `context` | L2 | Amber | LLM context optimization |
| `action` | L3 | Red | AI agent directives |
| `quantum` | L4 | Pink | Probabilistic state |
| `pipeline` | L5 | Emerald | Orchestration |

### Snippets

Type any of these prefixes and press Tab:

| Prefix | Inserts |
|--------|---------|
| `meta` | Meta node template |
| `block` | Block node template |
| `entity` | Entity node |
| `entity-person` | Person entity |
| `rel` | Relation node |
| `schema` | Schema node |
| `include` | Include node |
| `context` | Context node |
| `action` | Action node |
| `quantum` | Quantum state node |
| `quantum-entangled` | Quantum with entanglement matrix |
| `pipeline` | Pipeline node |
| `if` | Full if/elif/else block |
| `ifs` | Simple if block |
| `for` | For loop |
| `multimodal` | Multimodal output block |
| `function` | Function definition |
| `ref` | Inline reference |
| `dref` | Display reference |
| `l0` | Complete L0 document |
| `l1` | Complete L1 document |
| `l3` | Complete L3 document |
| `l5` | Complete L5 document |

## Links

- [UKDL v2.0 Specification](../../UKDL-v2.0-Standard.md)
- [UKDL GitHub Repository](https://github.com/ukdl/ukdl-language)
- [Parser Package](../parser/)
- [CLI Tool](../../cli/)
