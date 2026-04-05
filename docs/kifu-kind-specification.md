# UKDL v2.0 Extension: `kifu` (기보) Kind Specification

## 1. Introduction
The `kifu` (기보, Board Record) Kind is an extension to the UKDL v2.0 standard. It represents a documented history of decisions, actions, and their outcomes within a specific context (a "board" or document). 
It serves as the foundation for the "Review" (복기, Bokgi) phase of Gido Coding, allowing developers and AI agents to reflect on past sprint cycles, understand the evolution of the codebase, and extract strategic wisdom.

## 2. Syntax & Attributes

```ukdl
:: kifu id=<prefix:name>
@board: <reference>
@player: <string>
@result: <string>
@moves: [ <MoveObject> ]
::
```

### 2.1 Required Fields
*   `@board` (Reference): A reference to a `meta` (document) or `block` representing the scope of the game (the project, sprint, or feature).
*   `@moves` (Array of MoveObjects): An ordered sequence of the actions taken.

### 2.2 Optional Fields
*   `@player` (String): The entity (human team, agent name) executing the moves.
*   `@result` (String): The outcome of the game/sprint (e.g., `"success"`, `"ongoing"`, `"rollback"`, `"abandoned"`).

## 3. The MoveObject Schema
Each item in the `@moves` array MUST adhere to the following strict schema:

```json
{
  "n": 1,
  "type": "fuseki",
  "target": "@ent:payment",
  "intent": "Initial domain design",
  "impact": "+structure"
}
```

*   `n` (Integer, Required): The sequence number of the move (must be strictly 1-indexed and monotonically increasing).
*   `type` (String, Required): The Gido strategic categorization of the move. Supported values include, but are not limited to:
    *   `"fuseki"` (포석): Foundation laying, diagramming (L1 entity/schema declarations).
    *   `"joseki"` (정석): Standard recognized pattern application (L3 action/include).
    *   `"sente"` (선수): Proactive initiative pushing the opponent (Tests, CI/CD, Contracts).
    *   `"gote"` (후수): Reactive patching (Hotfixes, late test additions).
    *   `"attack"` (공격): Major feature expansion or complex logic generation.
    *   `"defend"` (방어): Refactoring, adding error bounds, type safety enhancements.
    *   `"review"` (복기): Retrospective analysis or documentation generation.
*   `target` (Reference | String, Required): The UKDL node reference `@prefix:name` or the specific file path affected by the move.
*   `intent` (String, Required): A short human-readable justification for the move.
*   `impact` (String, Optional): A normalized string indicating the perceived outcome of the move (e.g., `+structure`, `++reliability`, `-velocity`).

## 4. Processing Model (L5 Orchestration Integration)

A UKDL parser processing a `kifu` node SHOULD perform the following:

1.  **Validation**: Verify that `n` is strictly monotonically increasing.
2.  **State Reconstruction (Optional)**: When integrated with a version control system and an AI agent (like `/paperclip review`), the parser can map the `target` references to git commit hashes or specific UKDL node versions to reconstruct the exact state of the "board" at move `n`.
3.  **Wisdom Extraction (AI Feedback Loop)**: 
    * AI Agents can read `kifu` arrays across multiple projects to identify which `joseki` patterns correlate with high `result: "success"` rates.
    * The system can continuously update the organization's knowledge graph (정석 라이브러리) based on these historical records, effectively allowing the AI to "study professional games" to improve its future recommendations.
