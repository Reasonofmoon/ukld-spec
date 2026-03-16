/**
 * ukdl init [name] — Create a new UKDL document from template
 */

import fs from 'node:fs';
import path from 'node:path';
import { c } from '../colors.js';

interface InitOptions {
  level?: number;
  output?: string;
  quiet?: boolean;
}

export async function runInit(name?: string, opts: InitOptions = {}): Promise<void> {
  const docName = name ?? 'my-document';
  const level = opts.level ?? 0;
  const fileName = opts.output ?? `${docName}.ukdl`;
  const docId = docName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

  const today = new Date().toISOString().split('T')[0]!;

  let template: string;

  switch (level) {
    case 0:
      template = generateL0(docId, docName, today);
      break;
    case 1:
      template = generateL1(docId, docName, today);
      break;
    case 2:
      template = generateL2(docId, docName, today);
      break;
    case 3:
      template = generateL3(docId, docName, today);
      break;
    case 4:
      template = generateL4(docId, docName, today);
      break;
    case 5:
      template = generateL5(docId, docName, today);
      break;
    default:
      console.error(c.red(`Error: Level must be 0–5, got: ${level}`));
      process.exit(1);
  }

  if (opts.output === '-') {
    process.stdout.write(template);
    return;
  }

  if (fs.existsSync(fileName)) {
    console.error(c.red(`Error: File already exists: ${fileName}`));
    console.error(c.dim('  Use --output <path> to specify a different location'));
    process.exit(1);
  }

  fs.writeFileSync(fileName, template, 'utf-8');

  if (!opts.quiet) {
    console.log();
    console.log(`  ${c.green('✔')} Created ${c.bold(c.cyan(fileName))}`);
    console.log(`    Level: ${c.cyan(`L${level}`)}`);
    console.log(`    ID:    ${c.dim(`doc:${docId}`)}`);
    console.log();
    console.log(`  ${c.dim('Next steps:')}`);
    console.log(`    ${c.dim('$')} ukdl parse ${fileName}`);
    console.log(`    ${c.dim('$')} ukdl validate ${fileName}`);
    console.log();
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function generateL0(id: string, name: string, today: string): string {
  return `%% UKDL v2.0 — L0 Document Template

:: meta id=doc:${id} title="${name}" created="${today}"
@author: "author-name"
@lang: "en"
@version: "1.0"
@ukdl_level: 0
::

:: block id=blk:introduction type=introduction
@summary: "Introduction to ${name}."

Write your content here. UKDL block bodies support **Markdown** formatting,
including *italics*, \`code spans\`, and [links](https://example.com).

Blocks are self-contained knowledge chunks — each one is independently
retrievable by AI systems.
::

:: block id=blk:main-content type=explanation
@summary: "Main content of ${name}."

This is the main content block. Add as many blocks as you need, each
covering a distinct topic or concept.
::

:: block id=blk:conclusion type=note
@summary: "Concluding remarks."

Summary and conclusion go here.
::
`;
}

function generateL1(id: string, name: string, today: string): string {
  return `%% UKDL v2.0 — L1 Semantic Document Template

:: meta id=doc:${id} title="${name}" created="${today}"
@author: "author-name"
@lang: "en"
@version: "1.0"
@domain: "your.domain.here"
@tags: ["tag1", "tag2"]
@ukdl_level: 1
::

%% ─── Knowledge Graph ───

:: entity id=ent:main-concept type=Concept labels.en="${name}"
@aliases: []

The primary concept in this document.
::

:: entity id=ent:related-concept type=Concept labels.en="Related Concept"

A concept related to the main topic.
::

:: rel id=rel:main-related type=related_to from=@ent:main-concept to=@ent:related-concept
@confidence: 0.9
@source: "your source here"
::

%% ─── Content ───

:: block id=blk:overview type=explanation about=@ent:main-concept priority=high
@summary: "Overview of ${name}."
@confidence: 1.0

This block is about @{ent:main-concept|${name}}. It is connected to the
knowledge graph via the \`about\` attribute.

Key points:
- First key point
- Second key point
- Third key point
::

:: schema id=sch:concept-entity
@applies_to: {kind: "entity", type: "Concept"}
@required_fields: []
@optional_fields: ["aliases", "same_as"]
::
`;
}

function generateL2(id: string, name: string, today: string): string {
  return `%% UKDL v2.0 — L2 Context-Aware Document Template

:: meta id=doc:${id} title="${name}" created="${today}"
@author: "author-name"
@lang: "en"
@version: "1.0"
@domain: "your.domain.here"
@tags: ["tag1", "tag2"]
@ukdl_level: 2
::

%% ─── Knowledge Graph ───

:: entity id=ent:main-concept type=Concept labels.en="${name}"
::

%% ─── Context Nodes (L2) ───

%% This critical context is always included (collapse=false is default)
:: context id=ctx:overview priority=critical depth=overview
@summary: "One-sentence summary of ${name} for context-compressed views."
@collapse: false
@max_tokens: 300

Essential overview content that survives all context phases.
This should capture the most important information in minimal space.
::

%% This detail collapses when tokens are scarce
:: context id=ctx:details priority=normal depth=detailed collapse=true
@summary: "Detailed explanation collapsed to this summary in low-token phases."
@max_tokens: 2000

Detailed content that gets replaced by its summary in the 'summary' phase
and excluded entirely in 'priority' and 'skeleton' phases.

You can write extensive content here without worrying about token budgets —
the context optimizer handles compression automatically.
::

%% Archive content: only appears in 'full' phase
:: context id=ctx:appendix priority=archive depth=detailed collapse=true
@summary: "Appendix material."
@max_tokens: 1000

Supplementary material that is excluded in all compressed phases.
::

%% ─── Content ───

:: block id=blk:introduction type=introduction about=@ent:main-concept priority=high
@summary: "Introduction to ${name}."

Introduction content here. This block has priority=high so it survives
the 'priority' context phase.
::
`;
}

function generateL3(id: string, name: string, today: string): string {
  return `%% UKDL v2.0 — L3 Executable Document Template

:: meta id=doc:${id} title="${name}" created="${today}"
@author: "author-name"
@lang: "en"
@version: "1.0"
@domain: "your.domain.here"
@ukdl_level: 3
::

%% ─── Knowledge Graph ───

:: entity id=ent:main-concept type=Concept labels.en="${name}"
::

%% ─── Context (L2) ───

:: context id=ctx:overview priority=critical depth=overview
@summary: "Overview of ${name}."

Essential content for all context phases.
::

%% ─── Content ───

:: block id=blk:main type=explanation about=@ent:main-concept priority=high
@summary: "Main explanation."

Core content block.
::

%% ─── Actions (L3) ───

:: action id=act:initialize agent=system trigger="document_load"
@tool: "setup_environment"
@input: {
  document: @doc:${id},
  mode: "interactive"
}
@output: "init_result.json"
@timeout: 10000
@retry: {max: 2, backoff: "linear"}

Initialize the document environment. This action runs when the document
is first loaded by an AI agent.
::

:: action id=act:generate-summary agent=ai-assistant trigger="on_demand"
@tool: "text_summarizer"
@input: {
  content: @blk:main,
  length: "short",
  format: "bullet_points"
}
@output: "summary.json"
@depends_on: @act:initialize
@timeout: 30000

Generate an on-demand summary of the main content.
::

%% ─── Inline Conditional Content ───

:: block id=blk:role-specific type=explanation priority=normal

This block demonstrates inline conditionals:

|if: @ctx:overview.priority == critical|
You are viewing critical context. Essential information only.
|else|
Full content is available in this context.
|/if|
::
`;
}

function generateL4(id: string, name: string, today: string): string {
  return `%% UKDL v2.0 — L4 Dynamic (Quantum State) Document Template

:: meta id=doc:${id} title="${name}" created="${today}"
@author: "author-name"
@lang: "en"
@version: "1.0"
@domain: "your.domain.here"
@ukdl_level: 4
::

%% ─── Knowledge Graph ───

:: entity id=ent:main-concept type=Concept labels.en="${name}"
::

%% ─── Quantum States (L4) ───

:: quantum id=qst:user-mode
@states: {simple: 0.5, standard: 0.35, expert: 0.15}
@observe_on: "user_preference_set"
@entangle: @qst:content-depth
@decay: {function: "exponential", half_life: "30d"}
@default: "standard"
@history: true

The user's preferred interaction mode.
Collapses upon preference detection, decays toward uniform distribution
if unobserved for 30 days.
::

:: quantum id=qst:content-depth
@states: {overview: 0.5, detailed: 0.35, comprehensive: 0.15}
@entangle: @qst:user-mode
@entangle_matrix: {
  simple-overview: 0.8, simple-detailed: 0.18, simple-comprehensive: 0.02,
  standard-overview: 0.25, standard-detailed: 0.6, standard-comprehensive: 0.15,
  expert-overview: 0.05, expert-detailed: 0.35, expert-comprehensive: 0.6
}

Depth of content to serve, correlated with user mode.
::

%% ─── Context ───

:: context id=ctx:overview priority=critical
@summary: "Overview of ${name}."

Essential overview content.
::

%% ─── Adaptive Content ───

:: block id=blk:adaptive-explanation type=explanation about=@ent:main-concept priority=high
@summary: "Adaptive explanation of ${name}."

|if: @qst:user-mode == simple|
**${name}** in simple terms:
- Point one, simply explained
- Point two, simply explained
- Point three, simply explained

|elif: @qst:user-mode == standard|
**${name}** standard explanation:

Here is a standard-depth explanation with appropriate detail for most users.
Key concepts are introduced without overwhelming complexity.

|else|
**${name}** — Expert-level treatment:

Detailed, rigorous explanation for expert users. Includes formal notation,
edge cases, and references to primary sources.
|/if|
::

%% ─── Actions ───

:: action id=act:detect-user-mode agent=system trigger="session_start"
@tool: "user_profiler"
@input: {history: true, max_samples: 10}
@output: "user_profile.json"
@timeout: 5000
::
`;
}

function generateL5(id: string, name: string, today: string): string {
  return `%% UKDL v2.0 — L5 Orchestrated Document Template

:: meta id=doc:${id} title="${name}" created="${today}"
@author: "author-name"
@lang: "en"
@version: "1.0"
@domain: "your.domain.here"
@ukdl_level: 5
::

%% ─── Knowledge Graph ───

:: entity id=ent:main-concept type=Concept labels.en="${name}"
::

:: entity id=ent:goal type=Concept labels.en="Primary Goal"
::

:: rel id=rel:concept-goal type=supports from=@ent:main-concept to=@ent:goal
@confidence: 0.95
::

%% ─── Context ───

:: context id=ctx:overview priority=critical depth=overview
@summary: "Overview of ${name}."

Essential overview of the document's purpose and structure.
::

:: context id=ctx:background priority=normal depth=detailed collapse=true
@summary: "Background context for ${name}."
@max_tokens: 1500

Detailed background information that can be collapsed when tokens are scarce.
::

%% ─── Quantum States ───

:: quantum id=qst:user-state
@states: {new: 0.5, learning: 0.35, proficient: 0.15}
@observe_on: "assessment_complete"
@entangle: @qst:content-level
@decay: {function: "exponential", half_life: "14d"}
@default: "learning"
@history: true
::

:: quantum id=qst:content-level
@states: {basic: 0.5, intermediate: 0.35, advanced: 0.15}
@entangle: @qst:user-state
@entangle_matrix: {
  new-basic: 0.85, new-intermediate: 0.13, new-advanced: 0.02,
  learning-basic: 0.2, learning-intermediate: 0.65, learning-advanced: 0.15,
  proficient-basic: 0.05, proficient-intermediate: 0.25, proficient-advanced: 0.7
}
::

%% ─── Content ───

:: block id=blk:main-content type=explanation about=@ent:main-concept priority=high
@summary: "Core explanation."

|if: @qst:user-state == new|
Welcome! Let's start from the beginning.

**${name}** is a concept that helps you accomplish your goals. Here's what
you need to know first...
|elif: @qst:user-state == learning|
You're making progress! Here's the next level of detail:

**${name}** builds on what you already know. The key intermediate concepts are...
|else|
Advanced treatment for proficient users:

**${name}** in depth: formal treatment with nuance and edge cases.
|/if|
::

%% ─── Actions ───

:: action id=act:initial-assessment agent=system trigger="document_open"
@tool: "adaptive_quiz"
@input: {topic: @ent:main-concept, questions: 3, format: "quick_check"}
@output: "assessment.json"
@timeout: 60000
@retry: {max: 2, backoff: "exponential"}
::

:: action id=act:deliver-content agent=system trigger="assessment_complete"
@tool: "content_delivery"
@input: {block: @blk:main-content, user_state: @qst:user-state}
@output: "delivery_result.json"
@depends_on: @act:initial-assessment
@guard: @qst:user-state != "uninitialized"
@timeout: 30000
::

:: action id=act:follow-up agent=system trigger="content_complete"
@tool: "progress_tracker"
@input: {user: @qst:user-state, content: @blk:main-content, action: "record_completion"}
@output: "progress.json"
@depends_on: @act:deliver-content
@timeout: 10000
::

%% ─── Pipeline (L5) ───

:: pipeline id=pipe:${id}-learning
@goal: "maximize_comprehension_and_retention"
@criteria: ["quiz_accuracy", "engagement_time", "return_visits"]
@interval: "every_session"
@max_iterations: 100
@stages: [
  {name: "assess",   action: @act:initial-assessment},
  {name: "classify", quantum: @qst:user-state},
  {name: "deliver",  block: @blk:main-content},
  {name: "track",    action: @act:follow-up}
]
@feedback: {
  positive: "advance_content_level",
  negative: {adjust: {level: "decrease", examples: "increase", pace: "slower"}},
  stagnant: {escalate: "human_review"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 3",
  action: "pause_and_notify"
}

Adaptive learning pipeline for ${name}. Iterates through assessment,
quantum state collapse, content delivery, and progress tracking.
Adjusts content difficulty based on performance feedback.
::
`;
}
