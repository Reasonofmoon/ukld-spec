# Getting Started with UKDL

UKDL (Unified Knowledge & Dynamics Language) is a document format that starts as simple as Markdown and scales up to a fully executable knowledge graph with AI-native context control. New syntax takes a minute to get used to — but the surface area at L0 is tiny, and everything else is optional until you need it.

---

## 1. What You Will Learn

By the end of this guide you will have written a real UKDL document from scratch, starting at Level 0 (pure structured text) and progressively adding:

| Level | What You Add | What You Get |
|-------|-------------|-------------|
| L0 | `meta` + `block` nodes | Structured, machine-readable documents |
| L1 | `entity` + `rel` nodes | A queryable knowledge graph |
| L2 | `context` nodes | Token-budget-aware AI context control |
| L3 | `action` nodes | Executable AI agent directives |

Levels L4 (quantum states) and L5 (orchestration pipelines) are covered in the [Advanced Guide](advanced-guide.md).

---

## 2. Prerequisites

**Required:**

- Node.js 18 or later
- npm 9 or later
- Any text editor

**Optional but useful:**

- VS Code with the UKDL extension (syntax highlighting, field completion)

Check your versions:

```bash
node --version   # must be >= 18.0.0
npm --version    # must be >= 9.0.0
```

---

## 3. Installation

Install the UKDL CLI globally:

```bash
npm install -g @ukdl/cli
```

Verify the installation:

```bash
ukdl version
```

Expected output:

```
@ukdl/cli 2.0.0
UKDL Standard: v2.0
Node.js: 18.x.x
```

See all available commands:

```bash
ukdl help
```

---

## 4. Your First UKDL Document (L0)

This section walks you through writing a UKDL document by hand, line by line. Understanding each piece now will make everything in later sections obvious.

### 4.1 Create the File

Create a new file called `notes.ukdl`. Open it in your editor. It starts empty.

### 4.2 The `meta` Node

Every UKDL document begins with exactly one `meta` node. It must be the first node in the file. Type this:

```ukdl
:: meta id=doc:my-notes title="My Learning Notes" created="2026-03-16"
@author: "your-name"
@lang: "en"
@version: "1.0"
::
```

Let's break down what you just wrote:

**`:: meta`** — opens a node of kind `meta`. The double colon `::` is the universal node delimiter. Every node in UKDL opens with `::` and closes with `::` on its own line.

**`id=doc:my-notes`** — assigns this node a unique ID. IDs follow the format `prefix:name`. The `doc:` prefix is reserved for `meta` nodes. The name `my-notes` can be any identifier (letters, numbers, hyphens, underscores).

**`title="My Learning Notes"`** — a header attribute. Attributes on the opening line are concise key=value pairs.

**`@author: "your-name"`** — a field. Fields inside the node body start with `@`, followed by the field name, a colon, a space, and the value. Fields must appear before any body text.

**The closing `::`** — a bare `::` on its own line closes the current node.

> The `meta` node requires `id`, `title`, `@author`, `@lang`, and `@version`. These five pieces of information are all it takes to declare a valid UKDL document.

### 4.3 Add a Comment

Before your first content block, add a comment. UKDL uses `%%` for single-line comments:

```ukdl
%% My learning notes — started March 2026
```

Comments are stripped at parse time. They never appear in output.

### 4.4 Add Your First Block

A `block` is the fundamental unit of content. It holds a self-contained piece of knowledge. Add this after the `meta` node:

```ukdl
:: block id=blk:recursion-def type=definition
@summary: "A function that calls itself to solve subproblems."

## Recursion

**Recursion** is a programming technique where a function calls itself as part of
its own definition. Each recursive call works on a smaller version of the problem
until it reaches a **base case** that can be solved directly.

Every recursive function needs two things:

1. A **base case** — the condition where recursion stops
2. A **recursive case** — the step that reduces the problem toward the base case
::
```

Key points:

**`id=blk:recursion-def`** — block IDs use the `blk:` prefix.

**`type=definition`** — the standard type values for blocks are: `definition`, `explanation`, `example`, `proof`, `claim`, `evidence`, `lesson`, `exercise`, `note`, `warning`. You can use any string — unknown types are valid.

**`@summary:`** — a field providing a compressed one-line description. This is used by AI context optimization at L2.

**The body** — everything after the last field line and before the closing `::` is the body. It is standard Markdown. All inline Markdown formatting works: bold, italic, lists, code spans, links.

### 4.5 Add More Blocks

Add two more blocks to make the document useful:

```ukdl
:: block id=blk:recursion-example type=example
@summary: "Factorial computed recursively in Python."

## Example: Factorial

The factorial of n (written n!) is the product of all positive integers up to n.

```python
def factorial(n):
    if n == 0:       # base case
        return 1
    return n * factorial(n - 1)  # recursive case

print(factorial(5))  # 120
```

Tracing `factorial(3)`:
- `factorial(3)` → `3 * factorial(2)`
- `factorial(2)` → `2 * factorial(1)`
- `factorial(1)` → `1 * factorial(0)`
- `factorial(0)` → `1` (base case)
- Unwinds to: `1 * 1 * 2 * 3 = 6`
::

:: block id=blk:stack-overflow type=warning
@summary: "Recursion without a base case causes a stack overflow."

## Watch Out: Stack Overflow

If you forget the base case, or if the recursive case never reduces toward it,
the function calls itself forever. The call stack fills up and you get:

```
RecursionError: maximum recursion depth exceeded
```

Always verify your base case before testing recursion on large inputs.
::
```

### 4.6 The Complete L0 Document

Your `notes.ukdl` file should now look like this:

```ukdl
%% My learning notes — started March 2026

:: meta id=doc:my-notes title="My Learning Notes" created="2026-03-16"
@author: "your-name"
@lang: "en"
@version: "1.0"
::

:: block id=blk:recursion-def type=definition
@summary: "A function that calls itself to solve subproblems."

## Recursion

**Recursion** is a programming technique where a function calls itself as part of
its own definition. Each recursive call works on a smaller version of the problem
until it reaches a **base case** that can be solved directly.

Every recursive function needs two things:

1. A **base case** — the condition where recursion stops
2. A **recursive case** — the step that reduces the problem toward the base case
::

:: block id=blk:recursion-example type=example
@summary: "Factorial computed recursively in Python."

## Example: Factorial

The factorial of n (written n!) is the product of all positive integers up to n.
::

:: block id=blk:stack-overflow type=warning
@summary: "Recursion without a base case causes a stack overflow."

## Watch Out: Stack Overflow

If you forget the base case, the function calls itself forever and the call stack
fills up with a `RecursionError`.
::
```

### 4.7 Parse and Validate

Run the parser to confirm the document is well-formed:

```bash
ukdl parse notes.ukdl
```

Expected output:

```
Parsed: notes.ukdl
  Nodes: 4 (1 meta, 3 block)
  References: 0
  Warnings: 0
  Errors: 0
UKDL Level: 0
```

Now validate it against the UKDL standard rules:

```bash
ukdl validate notes.ukdl
```

Expected output:

```
Validating: notes.ukdl
  [OK] meta node present and first
  [OK] all required meta fields present
  [OK] all block IDs unique
  [OK] no unresolved references
  Passed: 4 checks, 0 warnings, 0 errors
```

Congratulations. You have a valid L0 UKDL document.

---

## 5. Adding Structure: Knowledge Graph (L1)

An L0 document is great for human reading. L1 makes it machine-queryable by adding **entities** (the concepts your document is about) and **relations** (how those concepts connect).

### 5.1 Declare Entities

Add these nodes after the `meta` node, before the blocks:

```ukdl
%% ═══ Entities ═══

:: entity id=ent:recursion type=Concept labels.en="Recursion"
@aliases: ["recursive algorithm"]
A programming technique where a function calls itself.
::

:: entity id=ent:base-case type=Concept labels.en="Base Case"
The termination condition in a recursive function.
::

:: entity id=ent:call-stack type=System labels.en="Call Stack"
The runtime data structure that tracks active function calls.
::
```

**`id=ent:recursion`** — entity IDs use the `ent:` prefix.

**`type=Concept`** — standard entity type values are: `Concept`, `Process`, `Person`, `System`, `Event`, `Place`, `Organization`, `Tool`, `Theory`. Use the one that best fits.

**`labels.en="Recursion"`** — the human-readable display name for this entity in English. Add `labels.ko=`, `labels.fr=`, etc. for multilingual support.

**`@aliases:`** — alternative names by which this concept is known.

**Body text** — entity nodes can have a body too. Keep it to one or two sentences: a definition.

### 5.2 Declare Relations

Relations connect entities. Each relation has a `from`, a `to`, and a `type`:

```ukdl
%% ═══ Relations ═══

:: rel id=rel:recursion-requires-base type=depends_on from=@ent:recursion to=@ent:base-case
@confidence: 0.99
A recursive function must have a base case or it will not terminate.
::

:: rel id=rel:recursion-uses-stack type=uses from=@ent:recursion to=@ent:call-stack
@confidence: 1.0
Each recursive call adds a frame to the call stack.
::
```

**`type=depends_on`** — standard relation types include: `is_a`, `part_of`, `causes`, `depends_on`, `uses`, `produces`, `supports`, `contradicts`. You can use any string.

**`from=@ent:recursion`** — a **reference**. The `@` sigil followed by `prefix:name` creates a typed link to another node. References are resolved and validated at parse time.

### 5.3 Link Blocks to Entities

Update your block headers to declare what entity each block is about, and use **display references** in the body to create semantic inline links:

```ukdl
:: block id=blk:recursion-def type=definition about=@ent:recursion
@summary: "A function that calls itself to solve subproblems."

## Recursion

**Recursion** is a technique where a function calls itself. It requires a
@{ent:base-case|base case} to terminate, and each call is tracked on the
@{ent:call-stack|call stack}.
::
```

**`about=@ent:recursion`** — a header attribute linking this block to the entity it describes. This creates an implicit edge in the knowledge graph.

**`@{ent:base-case|base case}`** — a **display reference**. The format is `@{prefix:name|display text}`. It renders as "base case" in human output but carries a semantic link to `ent:base-case` in the graph.

### 5.4 The L1 Document: Before and After

**Before (L0) — 4 nodes, no graph:**

```ukdl
:: meta id=doc:my-notes title="My Learning Notes" created="2026-03-16"
@author: "your-name"
@lang: "en"
@version: "1.0"
::

:: block id=blk:recursion-def type=definition
@summary: "A function that calls itself to solve subproblems."
...
::
```

**After (L1) — 7 nodes, 2 edges, queryable graph:**

```ukdl
:: meta id=doc:my-notes title="My Learning Notes" created="2026-03-16"
@author: "your-name"
@lang: "en"
@version: "1.0"
@ukdl_level: 1
::

:: entity id=ent:recursion type=Concept labels.en="Recursion"
::

:: entity id=ent:base-case type=Concept labels.en="Base Case"
::

:: entity id=ent:call-stack type=System labels.en="Call Stack"
::

:: rel id=rel:recursion-requires-base type=depends_on from=@ent:recursion to=@ent:base-case
::

:: rel id=rel:recursion-uses-stack type=uses from=@ent:recursion to=@ent:call-stack
::

:: block id=blk:recursion-def type=definition about=@ent:recursion
@summary: "A function that calls itself to solve subproblems."

**Recursion** requires a @{ent:base-case|base case} and uses the
@{ent:call-stack|call stack} for each invocation.
::
```

> Add `@ukdl_level: 1` (or higher) to your `meta` node when you introduce features above L0. This tells parsers and tools which capabilities to activate.

### 5.5 Visualize the Graph

```bash
ukdl graph notes.ukdl
```

Expected output:

```
Knowledge Graph: notes.ukdl
  Entities: 3
  Relations: 2

  [ent:recursion] "Recursion" (Concept)
    -- depends_on --> [ent:base-case] "Base Case" (Concept)
    -- uses -------> [ent:call-stack] "Call Stack" (System)
```

### 5.6 Export to Other Formats

```bash
ukdl export notes.ukdl --format json
ukdl export notes.ukdl --format cypher
```

The JSON export produces the canonical UKDL-JSON representation. The Cypher export generates Neo4j `CREATE` statements ready to load into a graph database.

---

## 6. Context Control for AI (L2)

When an AI system uses your document as context, token budgets matter. L2 lets you declare how your content should be prioritized and compressed as the available context window shrinks.

The key construct is the `context` node. Add `@ukdl_level: 2` to your `meta` node, then add these nodes anywhere in the document (typically near the blocks they describe):

```ukdl
:: context id=ctx:overview priority=critical depth=overview
@summary: "Recursion: functions that call themselves, requiring a base case."
@collapse: false

Recursion is a fundamental programming technique. Every recursive function must
have a base case (terminates the recursion) and a recursive case (reduces the
problem). The call stack tracks all active recursive calls.
::

:: context id=ctx:detailed-mechanics priority=low depth=detailed collapse=true
@summary: "How the call stack grows and unwinds during recursion."
@max_tokens: 1500

When a recursive function is called, the current execution state is pushed onto
the call stack as a new frame. The frame stores local variables and the return
address. When the base case is reached, frames are popped in reverse order —
this is the "unwinding" phase. Stack depth equals the recursion depth. For
`factorial(100)`, that is 100 frames.
::
```

**`priority=critical`** — this context node survives all compression phases. It will always be included. Priority levels from highest to lowest: `critical`, `high`, `normal`, `low`, `archive`.

**`depth=overview`** — declares the level of detail: `overview`, `standard`, or `detailed`.

**`collapse=true`** — marks this node as collapsible. When the token budget is tight, the entire body is replaced by the `@summary` value. This lets you keep detailed content in the document without forcing it into every AI prompt.

**`@max_tokens:`** — a hint to the context optimizer about the maximum token cost of this node's body.

The five compression phases, from most to least content:

| Phase | What Happens |
|-------|-------------|
| Full | Every node included with full body |
| Summary | `collapse=true` nodes are replaced by their `@summary` |
| Priority | Only `priority=critical` and `priority=high` nodes kept |
| Skeleton | Entity/relation graph and `meta` only — no block bodies |
| Quantum | Only content selected by active quantum state branches |

### 6.1 Check Token Estimates

```bash
ukdl context notes.ukdl
```

Expected output:

```
Context Analysis: notes.ukdl

Phase: Full
  ctx:overview           ~85 tokens   [priority=critical, collapse=false]
  ctx:detailed-mechanics ~210 tokens  [priority=low, collapse=true]
  blk:recursion-def      ~120 tokens
  blk:recursion-example  ~95 tokens
  blk:stack-overflow     ~70 tokens
  Total: ~580 tokens

Phase: Summary
  ctx:detailed-mechanics collapsed to @summary (~15 tokens saved)
  Total: ~385 tokens

Phase: Priority
  Only critical/high nodes: ~205 tokens
```

### 6.2 View Full Document Statistics

```bash
ukdl stats notes.ukdl
```

Expected output:

```
Document Statistics: notes.ukdl
  UKDL Level: 2
  Total nodes: 9
    meta:    1
    block:   3
    entity:  3
    rel:     2
    context: 2
  References: 4 (all resolved)
  Total body tokens: ~580
  Knowledge graph: 3 entities, 2 relations
```

---

## 7. Making It Executable (L3)

L3 adds `action` nodes — declarations of work that an AI agent can execute. An action says what to do and when; the runtime figures out how.

Add `@ukdl_level: 3` to your `meta` node, then add actions:

```ukdl
:: action id=act:generate-quiz agent=coding-tutor trigger="section_complete"
@tool: "quiz_generator"
@input: {
  topic: @ent:recursion,
  count: 5,
  difficulty: "beginner",
  format: "multiple_choice"
}
@output: "quiz_result.json"
@timeout: 30000
@retry: {max: 3, backoff: "exponential"}
::
```

**`agent=coding-tutor`** — the name of the AI agent responsible for executing this action.

**`trigger="section_complete"`** — the event that fires this action. Triggers are strings that your runtime emits. Common conventions: `"module_start"`, `"lesson_complete"`, `"section_complete"`, `"user_request"`.

**`@tool:`** — the tool the agent will invoke. This maps to an MCP tool, a LangChain tool, or any registered tool in your runtime.

**`@input:`** — an object of inputs passed to the tool. Values can be literals or references (like `@ent:recursion` here, which passes the entity node's data).

**`@output:`** — where the tool writes its result.

**`@timeout:`** — maximum milliseconds before the action is considered failed.

**`@retry:`** — retry policy on failure. `backoff` can be `"linear"` or `"exponential"`.

### 7.1 Chaining Actions with `@depends_on`

```ukdl
:: action id=act:review-answers agent=coding-tutor trigger="quiz_submitted"
@tool: "answer_reviewer"
@input: {
  quiz_file: "quiz_result.json",
  rubric: @blk:recursion-def
}
@output: "feedback_report.json"
@depends_on: @act:generate-quiz
@timeout: 20000
::
```

**`@depends_on:`** — this action will not execute until `act:generate-quiz` has completed successfully. The runtime detects cycles in dependency chains and raises an error.

### 7.2 Preconditions with `@guard`

```ukdl
:: action id=act:advanced-problems agent=coding-tutor trigger="quiz_passed"
@tool: "problem_generator"
@input: {topic: @ent:recursion, difficulty: "advanced", count: 3}
@output: "advanced_problems.json"
@depends_on: @act:review-answers
@guard: @act:review-answers.status == "complete"
@timeout: 25000
::
```

**`@guard:`** — a boolean expression evaluated before execution. If the guard is false, the action is skipped without error. This prevents running actions when preconditions are not met.

---

## 8. Understanding References

References are the connective tissue of UKDL. There are three forms:

| Syntax | Name | When to Use |
|--------|------|-------------|
| `@ent:recursion` | Bare reference | In fields and header attributes (`from=`, `about=`, `@depends_on:`) |
| `@{ent:recursion\|display text}` | Display reference | In block body text — renders as the display text with a semantic link |
| `@ent:recursion.field_name` | Field access | To read a specific field value from a referenced node |

**Bare reference in a field:**

```ukdl
:: rel id=rel:example type=uses from=@ent:recursion to=@ent:call-stack
::
```

**Display reference in body text:**

```ukdl
The @{ent:call-stack|call stack} grows with each recursive invocation.
```

Renders as: "The call stack grows with each recursive invocation." — where "call stack" is a semantic link to `ent:call-stack`.

**Field access:**

```ukdl
@guard: @act:prerequisite.status == "complete"
```

Reads the `status` field from the node `act:prerequisite` and compares it.

**All standard prefixes:**

| Prefix | Kind | Example |
|--------|------|---------|
| `doc:` | meta | `@doc:my-notes` |
| `blk:` | block | `@blk:recursion-def` |
| `ent:` | entity | `@ent:recursion` |
| `rel:` | rel | `@rel:recursion-requires-base` |
| `sch:` | schema | `@sch:concept-entity` |
| `inc:` | include | `@inc:chapter-two` |
| `ctx:` | context | `@ctx:overview` |
| `act:` | action | `@act:generate-quiz` |
| `qst:` | quantum | `@qst:learner-level` |
| `pipe:` | pipeline | `@pipe:learning-loop` |

---

## 9. Comments and Formatting

### 9.1 Comment Syntax

**Single-line comment** — everything after `%%` to the end of the line:

```ukdl
%% This entire line is a comment

:: block id=blk:example type=note  %% inline comment after node open
This is body text.
::
```

**Block comment** — spans multiple lines, using `(( ... ))`:

```ukdl
((
  This is a block comment.
  It can span as many lines as you need.
  Useful for temporarily disabling a section.

  :: block id=blk:disabled type=note
  This block is commented out.
  ::
))
```

Block comments cannot be nested.

### 9.2 Indentation Conventions

UKDL is not whitespace-sensitive, but the community convention is:

- **2 spaces** for fields inside nodes
- **Blank line** between the last field and the body text
- **Blank line** between nodes

```ukdl
:: block id=blk:example type=note
@summary: "An example block."
@source: "https://example.com"

This is the body text. There is a blank line between the last field
and the first line of body text.
::

%% blank line between nodes

:: block id=blk:next type=note
Body of the next block.
::
```

### 9.3 Node Boundaries

The `::` on its own line closes the most recently opened node. There is no exception to this rule. If you need a `::` in body text, escape it:

```ukdl
:: block id=blk:about-ukdl type=explanation
The node delimiter is \:: — two colons. On its own line it closes a node.
::
```

---

## 10. Value Types

Every field value is one of these types:

| Type | Syntax | Example |
|------|--------|---------|
| Double-quoted string | `"..."` | `@title: "My Notes"` |
| Single-quoted string | `'...'` | `@pattern: 'raw \n no escape'` |
| Triple-quoted string | `""" ... """` | Multi-line values (see below) |
| Integer | bare number | `@count: 42` |
| Float | bare decimal | `@confidence: 0.95` |
| Boolean | `true` / `false` | `@verified: true` |
| Null | `null` | `@deprecated: null` |
| Date | ISO 8601 | `@created: "2026-03-16"` |
| Array | `[...]` | `@tags: ["ai", "graphs"]` |
| Object | `{...}` | `@retry: {max: 3, backoff: "exponential"}` |
| Bare reference | `@prefix:name` | `@about: @ent:recursion` |
| Display reference | `@{prefix:name\|text}` | In body text only |

**Triple-quoted strings** are useful for multi-line field values:

```ukdl
@description: """
  This is a multi-line string value.
  Leading whitespace is stripped to the minimum indent level.
  Use this for long field values that would be unreadable on one line.
"""
```

**Single-quoted strings** are raw — no escape sequences are processed:

```ukdl
@regex: 'https?://[^\s]+'
```

**Object keys** do not need quotes when they are valid identifiers:

```ukdl
@retry: {max: 3, backoff: "exponential", on_failure: "skip"}
```

---

## 11. Common Patterns

These are starting points, not templates. Adapt them to your needs.

### Knowledge Base Document

Start with entities for your core concepts, relate them with `rel` nodes, then write blocks with `about=` attributes. This pattern works well for technical documentation, research notes, and glossaries.

```ukdl
:: meta id=doc:my-kb title="My Knowledge Base" created="2026-03-16"
@author: "your-name"
@lang: "en"
@version: "1.0"
@ukdl_level: 1
::

:: entity id=ent:concept-a type=Concept labels.en="Concept A"
::

:: entity id=ent:concept-b type=Concept labels.en="Concept B"
::

:: rel id=rel:a-causes-b type=causes from=@ent:concept-a to=@ent:concept-b
::

:: block id=blk:concept-a-detail type=explanation about=@ent:concept-a
Detailed explanation of @{ent:concept-a|Concept A} and how it causes
@{ent:concept-b|Concept B}.
::
```

### API Documentation

Use `type=function` blocks for each endpoint or function. Add entities for data types.

```ukdl
:: meta id=doc:my-api title="My API Reference" created="2026-03-16"
@author: "api-team"
@lang: "en"
@version: "1.0"
@domain: "engineering.api"
::

:: entity id=ent:user type=Concept labels.en="User"
@aliases: ["Account"]
::

:: block id=blk:get-user type=function about=@ent:user
@summary: "Retrieve a user by ID."
@source: "https://api.example.com/docs/users"

## GET /users/{id}

Returns a single @{ent:user|User} object.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | The user's UUID |

**Returns:** `200 OK` with user JSON body, or `404 Not Found`.
::
```

### Meeting Notes with Action Items

Use `type=note` blocks for discussion, `action` nodes for follow-ups.

```ukdl
:: meta id=doc:meeting-2026-03-16 title="Sprint Planning 2026-03-16" created="2026-03-16"
@author: "team"
@lang: "en"
@version: "1.0"
@ukdl_level: 3
@tags: ["meeting", "sprint", "planning"]
::

:: block id=blk:decisions type=note
@summary: "Key decisions from sprint planning."

Decided to prioritize the user authentication feature. Performance work
pushed to next sprint. Alice owns the auth PR.
::

:: action id=act:send-summary agent=secretary trigger="meeting_end"
@tool: "email_sender"
@input: {
  to: ["team@example.com"],
  subject: "Sprint Planning Summary",
  body: @blk:decisions
}
@timeout: 10000
::
```

### Project Specification

Use `context` nodes to control what goes into AI prompts. Put requirements in `priority=critical` context, implementation details in `priority=low collapse=true` context.

```ukdl
:: meta id=doc:project-spec title="Project Specification" created="2026-03-16"
@author: "product-team"
@lang: "en"
@version: "1.0"
@ukdl_level: 2
::

:: context id=ctx:requirements priority=critical depth=overview
@summary: "Build a real-time chat feature with end-to-end encryption."
@collapse: false

Core requirements: WebSocket-based messaging, E2E encryption via Signal
Protocol, message persistence in PostgreSQL, support for 10k concurrent users.
::

:: context id=ctx:implementation priority=low depth=detailed collapse=true
@summary: "Implementation details: Redis for presence, S3 for media."
@max_tokens: 3000

[Detailed implementation notes that collapse in tight contexts...]
::
```

### Course Material

Combine quantum states (L4) for adaptive difficulty with context nodes for AI optimization. See the [Advanced Guide](advanced-guide.md) for the full pattern.

---

## 12. What's Next

You have covered L0 through L3. Here is where to go next:

| Resource | What It Covers |
|----------|---------------|
| [Syntax Reference](syntax-reference.md) | Complete grammar, all fields, all directive forms |
| [Cookbook](cookbook.md) | Copy-paste patterns for common tasks |
| [Advanced Guide](advanced-guide.md) | L4 quantum states, L5 pipelines, entanglement matrices |
| [UKDL v2.0 Standard](../UKDL-v2.0-Standard.md) | The complete formal specification |
| [Examples directory](../examples/) | `hello-world.ukdl`, `knowledge-graph.ukdl`, `adaptive-tutorial.ukdl`, `api-documentation.ukdl` |

The examples directory is the fastest way to see complete working documents at each level. Start with `hello-world.ukdl` to confirm your tooling works, then read `knowledge-graph.ukdl` for a clean L1 example.

---

## 13. Quick Reference Card

### The 10 Standard Kinds

| Kind | Prefix | Level | Purpose |
|------|--------|-------|---------|
| `meta` | `doc:` | L0 | Document metadata; one per file, must be first |
| `block` | `blk:` | L0 | Self-contained knowledge chunk with Markdown body |
| `entity` | `ent:` | L1 | Named concept, person, system, or thing in the domain |
| `rel` | `rel:` | L1 | Typed, reifiable edge between two entities |
| `schema` | `sch:` | L1 | Structural validation rules for matching nodes |
| `include` | `inc:` | L2 | External file inclusion with optional filtering |
| `context` | `ctx:` | L2 | LLM context window priority and collapse control |
| `action` | `act:` | L3 | AI agent execution directive with tool, input, output |
| `quantum` | `qst:` | L4 | Probabilistic state variable with observation trigger |
| `pipeline` | `pipe:` | L5 | Goal-driven stage sequence with feedback loop |

### Node Syntax at a Glance

```ukdl
:: kind id=prefix:name attr=value attr2=value
@field: value
@field: value

Body text in Markdown. @{ent:thing|display text}. More text.

::
```

### Directive Syntax

| Syntax | Name | Level |
|--------|------|-------|
| `\|if: expr\|` ... `\|/if\|` | Conditional rendering | L4 |
| `\|elif: expr\|` | Else-if branch | L4 |
| `\|else\|` | Else branch | L4 |
| `\|for: x in expr\|` ... `\|/for\|` | Iteration | L4 |
| `\|multimodal_output\|` ... `\|/multimodal_output\|` | Multi-format output | L4 |
| `\|function: name(params)\|` ... `\|/function\|` | Function definition | L4 |

### Standard Field Names (Most Common)

| Field | Type | Used On |
|-------|------|---------|
| `@author` | string | meta |
| `@lang` | BCP 47 string | meta |
| `@version` | string | meta |
| `@domain` | dot-path string | meta |
| `@tags` | array | meta, block |
| `@ukdl_level` | integer 0–5 | meta |
| `@summary` | string | block, context |
| `@source` | URI or ref | block, rel |
| `@confidence` | float 0.0–1.0 | block, rel, entity |
| `@aliases` | array | entity |
| `@same_as` | array of URIs | entity |
| `@tool` | string | action |
| `@input` | object | action |
| `@output` | string | action |
| `@timeout` | integer (ms) | action |
| `@retry` | object | action |
| `@depends_on` | reference | action |
| `@guard` | expression | action |
| `@states` | object | quantum |
| `@observe_on` | string | quantum |
| `@goal` | string | pipeline |
| `@stages` | array | pipeline |
| `@max_iterations` | integer | pipeline |
| `@circuit_breaker` | object | pipeline |

### Comment Syntax

```ukdl
%% Single-line comment — to end of line

(( Block comment.
   Spans multiple lines.
   Cannot be nested. ))
```

### Universal Header Attributes (Any Node)

```
priority=critical|high|normal|low|archive
confidence=0.0..1.0
domain=dot.path.string
tags=["array", "of", "tags"]
deprecated=true|false
```
