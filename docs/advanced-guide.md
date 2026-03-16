# UKDL Advanced Guide: L4–L5 Mastery

A practical reference for developers who are comfortable with L0–L3 and want to build adaptive, self-optimizing systems using quantum states and pipeline orchestration.

---

## 1. Who This Guide Is For

You understand blocks, entities, relations, context phases, and actions. You have written at least one L3 document with actions and `@depends_on` chains. This guide covers the two constructs that have no equivalent in any other document language:

- **Quantum states** (L4): probabilistic state variables that collapse upon observation and remain correlated through entanglement
- **Pipelines** (L5): goal-driven orchestration loops with feedback and circuit breakers

These are not academic features. They exist because real systems have uncertainty, and honest uncertainty is more useful than pretend-certainty. "The learner is probably intermediate" is more actionable than `if level == 3`.

---

## 2. Understanding Quantum States (L4)

### 2.1 Why Probabilistic State?

Binary state is a lie most of the time.

A new employee arriving at an onboarding portal is not simply "junior" or "senior." A learner opening a course module is not simply "beginner" or "advanced." A data pipeline run is not simply "healthy" or "broken." These categories exist on spectrums, and the appropriate system response depends on where on that spectrum the true state probably lies.

Classical conditionals force you to pick a threshold and pretend precision you don't have:

```python
# Pretend precision
if quiz_score > 70:
    show_intermediate_content()
else:
    show_beginner_content()
```

Quantum states let you represent what you actually know:

```ukdl
%% Honest uncertainty
:: quantum id=qst:learner-level
@states: {beginner: 0.45, intermediate: 0.40, advanced: 0.15}
@observe_on: "quiz_complete"
::
```

The probability distribution tells the system: render the version with the highest expected value across all branches, or wait for observation to collapse it before making an irreversible decision.

The "quantum" metaphor is intentional. Before observation, the state is a superposition — all states are simultaneously active with their assigned probabilities. After observation, the state collapses to a definite value. Prior observations influence but do not fully determine future ones. Decay models the fact that certainty fades without new evidence.

### 2.2 Defining a Quantum Node

A complete quantum node with every attribute:

```ukdl
:: quantum id=qst:learner-level
@states: {beginner: 0.30, intermediate: 0.50, advanced: 0.20}
@observe_on: "diagnostic_quiz_complete"
@entangle: @qst:content-difficulty
@decay: {function: "exponential", half_life: "7d"}
@default: "intermediate"
@history: true

The learner's current proficiency level.
Initialized as a superposition; collapses after the diagnostic quiz.
Decays toward uniform distribution if unobserved for 7 days.
::
```

**Attribute reference:**

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `@states` | Yes | Object | Probability distribution. All values must sum to 1.0 exactly. |
| `@observe_on` | Yes | String | Event name that triggers a state collapse observation. |
| `@entangle` | No | Reference | Another `quantum` node whose state is correlated with this one. |
| `@decay` | No | Object | Decay function that degrades certainty over time. |
| `@default` | No | String | Fallback state key if observation fails or is unavailable. |
| `@history` | No | Boolean | Whether past observations are preserved. Useful for trend analysis. |

**The `@states` distribution** sets the prior — the system's belief about the state before any observation. If you genuinely have no prior, use a uniform distribution: `{a: 0.33, b: 0.33, c: 0.34}`. If you have domain knowledge, encode it: most new users of a complex product are beginners, so `{beginner: 0.6, intermediate: 0.3, advanced: 0.1}` is an honest prior.

**The `@observe_on` event** is the moment of collapse. The event string must match a trigger that your L4 runtime emits. When `ukdl observe --event diagnostic_quiz_complete --data result.json` is called, the runtime updates the probability distribution based on the observed evidence and collapses the state to the most probable value.

**The `@default`** is critical for robustness. If the observation event never fires — the user closes the browser, the API times out, the quiz tool errors — the system still needs to render content. The default provides a safe fallback that avoids showing an "uninitialized" placeholder to real users.

### 2.3 Entanglement

Entanglement means two quantum variables collapse together: when one is observed, the other updates proportionally.

Without entanglement, you have to manually keep correlated state in sync. With entanglement, you encode the correlation once and the runtime maintains it automatically.

The simplest entanglement: two variables always collapse to the same category.

```ukdl
:: quantum id=qst:content-difficulty
@states: {basic: 0.30, standard: 0.50, deep: 0.20}
@observe_on: "diagnostic_quiz_complete"
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-basic:              0.80,
  beginner-standard:           0.15,
  beginner-deep:               0.05,
  intermediate-basic:          0.10,
  intermediate-standard:       0.70,
  intermediate-deep:           0.20,
  advanced-basic:              0.00,
  advanced-standard:           0.30,
  advanced-deep:               0.70
}
::
```

**Reading the entanglement matrix:**

Each row key is `{state_of_entangled_node}-{state_of_this_node}`. The value is the conditional probability:

```
P(content-difficulty = basic | learner-level = beginner) = 0.80
P(content-difficulty = standard | learner-level = beginner) = 0.15
P(content-difficulty = deep | learner-level = beginner) = 0.05
```

Each group of rows for a given left-side state must sum to 1.0. In the example above:
- beginner row: 0.80 + 0.15 + 0.05 = 1.0
- intermediate row: 0.10 + 0.70 + 0.20 = 1.0
- advanced row: 0.00 + 0.30 + 0.70 = 1.0

**Validation**: the parser checks this constraint and raises a warning (not an error) if a row does not sum to 1.0, auto-normalizing the distribution. This is intentional — malformed matrices should still produce a runnable document, just with a diagnostic message.

**What happens at runtime**: when `qst:learner-level` collapses to `advanced`, the runtime uses the advanced row of the matrix to update `qst:content-difficulty`'s distribution to `{basic: 0.0, standard: 0.3, deep: 0.7}` and may immediately collapse it as well, depending on the runtime's observation strategy.

### 2.4 Probability Decay

Certainty fades without new evidence. A skill assessment from 30 days ago is less reliable than one from yesterday. A data pipeline's quality state from 48 hours ago is stale. Decay models this honestly.

```ukdl
:: quantum id=qst:certification-status
@states: {current: 0.5, expired: 0.3, unknown: 0.2}
@observe_on: "certification_check_complete"
@decay: {function: "exponential", half_life: "90d"}
@default: "unknown"
::
```

**Decay function types:**

| Type | Behavior | Best for |
|------|----------|----------|
| `exponential` | Rapid initial decay, asymptotic approach to uniform | Skills, certifications, health checks |
| `linear` | Constant decay rate per unit time | Time-limited states with known expiry |

**The `half_life` parameter** specifies how long it takes for certainty to decay by 50% toward a uniform distribution. With `half_life: "90d"` and exponential decay, after 90 days the probability distribution is halfway between its last observed state and uniform. After 180 days, it is three-quarters of the way to uniform.

**Practical example** — a skill assessment that expires:

```ukdl
:: quantum id=qst:python-skill
@states: {novice: 0.2, competent: 0.5, expert: 0.3}
@observe_on: "skill_assessment_complete"
@decay: {function: "exponential", half_life: "30d"}
@default: "competent"
@history: true

Assessed Python skill level. Decays toward uncertainty over 30 days.
After 60 days without reassessment, the system will show a reassessment prompt.
::
```

After 30 days without a new assessment, the distribution approaches `{novice: 0.33, competent: 0.33, expert: 0.33}`. A pipeline can check this decay and trigger a re-assessment action: `if qst:python-skill.entropy > 0.9, trigger reassessment`.

### 2.5 Conditional Content Based on Quantum State

The `|if:|` directive references quantum variables directly. The parser evaluates conditions against the current probability distribution and selects the branch whose state has the highest probability.

```ukdl
:: block id=blk:adaptive-content type=lesson
@when: @qst:learner-level

|if: @qst:learner-level == beginner|
Beginner-appropriate content here.
|elif: @qst:learner-level == intermediate|
Intermediate content here.
|elif: @qst:learner-level == advanced|
Advanced content here.
|else|
Default content for the uninitialized state.
|/if|
::
```

The `@when: @qst:learner-level` field on the block is metadata for the context phase system. In the `quantum` context phase, only blocks whose `@when` references the currently-active quantum variable are included. This dramatically reduces token usage when serving many users simultaneously.

**Using `@when` for block inclusion:**

```ukdl
:: block id=blk:beginner-only type=lesson priority=normal
@when: @qst:learner-level
%% This block is only included when learner-level is in superposition or collapsed to beginner

|if: @qst:learner-level == beginner|
This block body is only shown to beginners.
|/if|
::
```

**Compound conditions:**

```ukdl
|if: @qst:learner-level == advanced and @qst:content-depth == internals|
Expert deep-dive content — only shown when both variables collapse here.
|/if|
```

**Runtime evaluation strategy**: the runtime evaluates conditions against the current collapsed state if one exists, or against the highest-probability state in the superposition if the variable has not yet been observed. This means content is always renderable — you never get a blank page because a quantum variable hasn't been observed yet.

### 2.6 Patterns

**Pattern 1: Multi-variable entanglement with 3+ nodes**

Three quantum variables can be entangled, but only in pairs. Chain them:

```ukdl
:: quantum id=qst:user-tier
@states: {free: 0.6, pro: 0.3, enterprise: 0.1}
@observe_on: "account_verified"
@entangle: @qst:feature-access
@default: "free"
::

:: quantum id=qst:feature-access
@states: {basic: 0.6, standard: 0.3, full: 0.1}
@observe_on: "account_verified"
@entangle: @qst:user-tier
@entangle_matrix: {
  free-basic:           0.90,
  free-standard:        0.09,
  free-full:            0.01,
  pro-basic:            0.05,
  pro-standard:         0.85,
  pro-full:             0.10,
  enterprise-basic:     0.00,
  enterprise-standard:  0.10,
  enterprise-full:      0.90
}
::

%% Third variable: entangle with feature-access rather than user-tier
:: quantum id=qst:support-priority
@states: {standard: 0.6, priority: 0.3, dedicated: 0.1}
@observe_on: "account_verified"
@entangle: @qst:feature-access
@entangle_matrix: {
  basic-standard:    0.95,
  basic-priority:    0.05,
  basic-dedicated:   0.00,
  standard-standard: 0.50,
  standard-priority: 0.45,
  standard-dedicated: 0.05,
  full-standard:     0.10,
  full-priority:     0.40,
  full-dedicated:    0.50
}
::
```

**Pattern 2: Cascading observations**

One action triggers an observation, which triggers another:

```ukdl
:: action id=act:diagnostic agent=tutor trigger="module_start"
@tool: "skill_assessor"
@output: "diagnostic_result.json"
::

%% The quiz result triggers qst:level observation via @observe_on
%% The qst:level collapse then triggers qst:style observation via entanglement
%% Content is now doubly-calibrated before the first lesson renders

:: quantum id=qst:level
@states: {novice: 0.4, experienced: 0.6}
@observe_on: "diagnostic_complete"
@entangle: @qst:style
::

:: quantum id=qst:style
@states: {visual: 0.5, textual: 0.5}
@observe_on: "learning_style_survey_complete"
@entangle: @qst:level
@entangle_matrix: {
  novice-visual:      0.65,
  novice-textual:     0.35,
  experienced-visual: 0.30,
  experienced-textual: 0.70
}
::
```

**Pattern 3: A/B testing via quantum states**

```ukdl
:: quantum id=qst:variant
@states: {control: 0.5, treatment: 0.5}
@observe_on: "user_assigned_to_experiment"
@history: true

A/B experiment variant. Observed from experiment assignment service.
History enabled for statistical analysis across sessions.
::

:: block id=blk:cta type=definition
@when: @qst:variant

|if: @qst:variant == control|
**Get started** — sign up free
|elif: @qst:variant == treatment|
**Try it free for 14 days** — no credit card required
|/if|
::
```

---

## 3. Pipeline Orchestration (L5)

### 3.1 Anatomy of a Pipeline

A complete pipeline with every attribute:

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

**Attribute reference:**

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `@goal` | Yes | String | Human-readable statement of what the pipeline optimizes for. |
| `@criteria` | Yes | Array | Measurable signals the feedback loop evaluates. |
| `@interval` | Yes | String | How often the pipeline runs. `"once"`, `"every_lesson"`, `"daily"`, `"hourly"`. |
| `@max_iterations` | Yes | Integer | Hard cap on iteration count. Prevents infinite loops. |
| `@stages` | Yes | Array | Ordered list of stages. Each stage has a `name` and one of `action`, `quantum`, or `block`. |
| `@feedback` | Yes | Object | What to do when criteria are met, unmet, or plateaued. |
| `@circuit_breaker` | No | Object | Condition and action when the circuit breaks. |

**`@goal` and `@criteria`** are not directly executed — they describe the optimization target so the runtime and human operators understand what "success" means. The runtime evaluates `@criteria` signals after each feedback measurement to determine whether the pipeline is improving, degrading, or plateauing.

**`@interval: "once"`** means the pipeline runs one time and stops regardless of feedback — useful for build pipelines (Recipe 10) where you want to ship once, not loop forever.

**`@max_iterations`** is a safety valve. Even a well-designed pipeline can encounter an edge case where positive feedback never triggers. Setting `@max_iterations: 100` ensures the pipeline eventually stops even if the learner's score is stuck at exactly the threshold between positive and negative.

### 3.2 Stage Types

| Stage type | Key | What the runtime does |
|------------|-----|-----------------------|
| `action` | `action: @act:some-action` | Executes the referenced action node. Waits for completion before advancing. |
| `quantum` | `quantum: @qst:some-state` | Triggers a state observation event. Waits for the quantum variable to collapse. |
| `block` | `block: @blk:some-block` | Evaluates the block's conditional directives and delivers the rendered content. |

A stage can only have one of `action`, `quantum`, or `block` — not multiple. To sequence two actions, use two stages:

```ukdl
@stages: [
  {name: "extract",    action: @act:extract},
  {name: "validate",   action: @act:validate},
  {name: "transform",  action: @act:transform}
]
```

**The ordering guarantee**: stages execute in the order declared. The runtime does not reorder stages. If stage 2 depends on stage 1's output, that is enforced by the ordering, not by `@depends_on` (which governs action-to-action dependencies within the action node itself).

**Parallel stages** are not directly supported within a single pipeline's stage list. To run actions in parallel, express them as separate actions with the same `trigger` and let the runtime's action scheduler handle concurrency. The pipeline stage that follows them can carry a `@guard` on the subsequent action to wait for both to complete.

### 3.3 Feedback Loops

After each pipeline iteration, the runtime evaluates the `@criteria` signals and classifies the result as positive, negative, or stagnant.

```ukdl
@feedback: {
  positive: "advance_difficulty",
  negative: {adjust: {difficulty: "decrease", examples: "increase", pace: "slower"}},
  stagnant: {escalate: "human_review"}
}
```

**Positive feedback**: the learner's quiz accuracy exceeded the threshold, or the data pipeline loaded all rows within SLA. The string value is a named strategy the runtime interprets. Standard strategies: `"advance_difficulty"`, `"advance_to_next_topic"`, `"mark_complete"`, `"deploy"`, `"complete"`.

**Negative feedback**: one or more criteria were not met. The `adjust` object tells the runtime to modify the quantum variable weights before the next iteration. In a learning pipeline:
- `difficulty: "decrease"` shifts `qst:content-difficulty` toward simpler states
- `examples: "increase"` shifts the number of examples upward
- `pace: "slower"` increases time between stages

**Stagnant feedback**: neither clearly positive nor clearly negative — the learner's score is flat across multiple iterations. This signals that the pipeline's own adjustments are not working and a qualitatively different intervention is needed. `escalate: "human_review"` pauses the pipeline and creates a notification for a human to review the case.

**The difference between negative and stagnant:**

| Signal | Meaning | Response |
|--------|---------|----------|
| Negative | Actively getting worse | Reduce difficulty, add support |
| Stagnant | Stuck, not improving or declining | Qualitative change needed |

Stagnant is often more important to catch than negative. A learner who consistently scores 58% when the passing threshold is 60% will receive negative feedback and the system will keep trying to help — but if they stay at 58% for five iterations, the system is wasting everyone's time and a human intervention is appropriate.

### 3.4 Circuit Breakers

The circuit breaker prevents a pipeline from continuing to execute when it is clearly failing.

```ukdl
@circuit_breaker: {
  condition: "consecutive_failures > 3",
  action: "pause_and_notify"
}
```

Without a circuit breaker, a pipeline that always produces negative feedback will run until `@max_iterations` is reached. With one, it stops as soon as the failure pattern is detected.

**Condition expressions:**

| Expression | Meaning |
|-----------|---------|
| `consecutive_failures > 3` | Three iterations in a row produced negative feedback |
| `total_failures > 10` | Ten total negative feedback events |
| `elapsed_time > 7200` | Pipeline has been running for more than 2 hours (seconds) |
| `error_rate > 0.5` | More than 50% of action executions returned an error |

**Available actions:**

| Action | Behavior |
|--------|----------|
| `pause_and_notify` | Stop the pipeline and send a notification to the owner |
| `rollback` | Stop and attempt to reverse any state changes from this run |
| `escalate` | Hand off to a human operator with full context |

**Relationship to `@max_iterations`**: the circuit breaker is an early termination condition; `@max_iterations` is a hard cap. Both are enforced. The circuit breaker fires first if its condition is met before `@max_iterations` is reached.

### 3.5 Pipeline Patterns

**Pattern 1: Linear learning pipeline**

The canonical use case. Assess, calibrate, teach, practice, evaluate. Loop until mastery.

```ukdl
:: pipeline id=pipe:linear-learning
@goal: "achieve_topic_mastery"
@criteria: ["quiz_accuracy_above_80", "practice_completion_rate"]
@interval: "every_lesson"
@max_iterations: 50
@stages: [
  {name: "assess",   action: @act:diagnostic},
  {name: "calibrate", quantum: @qst:skill-level},
  {name: "teach",    block: @blk:lesson-content},
  {name: "practice", action: @act:practice-generator},
  {name: "evaluate", action: @act:quiz}
]
@feedback: {
  positive: "advance_to_next_topic",
  negative: {adjust: {difficulty: "decrease", examples: "increase"}},
  stagnant: {escalate: "human_instructor"}
}
@circuit_breaker: {condition: "consecutive_failures > 5", action: "pause_and_notify"}
::
```

**Pattern 2: Branching pipeline (different paths based on quantum state)**

Use `@guard` fields on actions to implement branching within a pipeline. The pipeline stage list is linear, but stages that fail their guard conditions are skipped, effectively creating branches.

```ukdl
%% Actions with guards create implicit branching

:: action id=act:advanced-track agent=tutor trigger="calibration_complete"
@tool: "advanced_curriculum"
@guard: @qst:skill-level == "expert"
@input: {track: "advanced"}
@output: "advanced_content.json"
::

:: action id=act:standard-track agent=tutor trigger="calibration_complete"
@tool: "standard_curriculum"
@guard: @qst:skill-level != "expert"
@input: {track: "standard"}
@output: "standard_content.json"
::

:: pipeline id=pipe:branching-learning
@goal: "personalized_learning_path"
@criteria: ["track_completion_rate", "quiz_scores"]
@interval: "every_lesson"
@max_iterations: 60
@stages: [
  {name: "calibrate",      quantum: @qst:skill-level},
  {name: "advanced_track", action: @act:advanced-track},
  {name: "standard_track", action: @act:standard-track},
  {name: "assess",         action: @act:quiz}
]
@feedback: {
  positive: "unlock_next_module",
  negative: {adjust: {difficulty: "decrease"}},
  stagnant: {escalate: "human_mentor"}
}
@circuit_breaker: {condition: "consecutive_failures > 3", action: "pause_and_notify"}
::
```

**Pattern 3: Monitoring pipeline (continuous data quality checking)**

```ukdl
:: pipeline id=pipe:data-quality-monitor
@goal: "maintain_data_quality_above_threshold"
@criteria: ["null_rate_below_0.01", "schema_validation_passed", "row_count_within_bounds"]
@interval: "hourly"
@max_iterations: 720
@stages: [
  {name: "check_quality",    action: @act:quality-check},
  {name: "assess_state",     quantum: @qst:data-quality},
  {name: "report",           action: @act:quality-report}
]
@feedback: {
  positive: "update_dashboard",
  negative: {adjust: {retry: "with_fallback_source"}},
  stagnant: {escalate: "data-engineering-oncall"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 3",
  action: "pause_and_notify"
}
::
```

**Pattern 4: Development pipeline (scaffold, build, test, deploy)**

```ukdl
:: pipeline id=pipe:ci-cd
@goal: "ship_production_feature"
@criteria: ["test_coverage_above_85", "lighthouse_score_above_90", "zero_critical_vulnerabilities"]
@interval: "once"
@max_iterations: 5
@stages: [
  {name: "scaffold",  action: @act:scaffold},
  {name: "build",     action: @act:build},
  {name: "test",      action: @act:test},
  {name: "scan",      action: @act:security-scan},
  {name: "deploy",    action: @act:deploy}
]
@feedback: {
  positive: "complete",
  negative: {adjust: {retry: "with_error_context"}},
  stagnant: {escalate: "human_developer"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 2",
  action: "pause_and_notify"
}
::
```

---

## 4. Combining L4 and L5

The full power of UKDL emerges when multiple quantum variables, entanglement pairs, and a multi-stage pipeline work together. This section walks through a complete adaptive corporate training system from first principles.

**Goal**: A compliance training module that adapts to each employee's role, experience level, and domain, completing in 3 stages per day until certification criteria are met.

```ukdl
%% Full L4+L5 example: adaptive compliance training
%% 3 quantum variables, 2 entanglement pairs, 5 actions, 1 pipeline

:: meta id=doc:compliance-training title="Compliance Training: Adaptive Module" created="2026-03-16"
@author: "training-team"
@lang: "en"
@version: "2.0"
@domain: "hr.training.compliance"
@tags: ["compliance", "training", "adaptive", "l5"]
@ukdl_level: 5
@license: "proprietary"
::

%% ═══ L1: Knowledge Domain ═══

:: entity id=ent:gdpr type=Concept labels.en="GDPR"
@aliases: ["General Data Protection Regulation"]
EU data protection regulation. Applies to all employees handling EU personal data.
::

:: entity id=ent:sec-policy type=Concept labels.en="Security Policy"
Internal information security policy. Applies to all employees.
::

:: entity id=ent:role-engineer type=Concept labels.en="Engineering Role"
::

:: entity id=ent:role-sales type=Concept labels.en="Sales Role"
::

:: entity id=ent:role-finance type=Concept labels.en="Finance Role"
::

%% ═══ L2: Context ═══

:: context id=ctx:training-overview priority=critical depth=overview collapse=false
@summary: "Annual compliance training. Adaptive: role-based and experience-calibrated. Must complete in 5 days."

## Annual Compliance Training

This module covers your role-specific compliance obligations. Completion is
mandatory within 5 days of assignment. The content adapts to your role and
experience level — finish the role selection survey to begin.
::

%% ═══ L4: Quantum Variables ═══

%% Variable 1: Role
:: quantum id=qst:employee-role
@states: {engineer: 0.33, sales: 0.34, finance: 0.33}
@observe_on: "role_survey_complete"
@default: "engineer"
@history: false

Employee's organizational role. Observed from HR system via role survey.
Determines which compliance modules are required.
::

%% Variable 2: Experience level — entangled with role
:: quantum id=qst:experience-level
@states: {junior: 0.35, senior: 0.40, manager: 0.25}
@observe_on: "role_survey_complete"
@entangle: @qst:employee-role
@entangle_matrix: {
  engineer-junior:  0.45,
  engineer-senior:  0.45,
  engineer-manager: 0.10,
  sales-junior:     0.30,
  sales-senior:     0.45,
  sales-manager:    0.25,
  finance-junior:   0.25,
  finance-senior:   0.45,
  finance-manager:  0.30
}
@default: "senior"
@history: true

Employee's seniority level. Determines depth and formality of content.
::

%% Variable 3: Compliance knowledge — entangled with experience level
:: quantum id=qst:compliance-knowledge
@states: {foundational: 0.5, working: 0.35, expert: 0.15}
@observe_on: "pre-assessment_complete"
@entangle: @qst:experience-level
@entangle_matrix: {
  junior-foundational:  0.70,
  junior-working:       0.25,
  junior-expert:        0.05,
  senior-foundational:  0.25,
  senior-working:       0.55,
  senior-expert:        0.20,
  manager-foundational: 0.15,
  manager-working:      0.50,
  manager-expert:       0.35
}
@decay: {function: "exponential", half_life: "365d"}
@default: "working"
@history: true

Actual compliance knowledge level, assessed by pre-test.
Decays yearly — annual re-certification required.
::

%% ═══ L3: Adaptive Content ═══

:: block id=blk:gdpr-overview type=lesson about=@ent:gdpr priority=high
@when: @qst:employee-role

# GDPR Obligations

|if: @qst:employee-role == engineer|
As an engineer, you handle EU personal data in systems you build.
Your primary obligations:

- **Data minimization**: only collect what the product genuinely needs
- **Retention limits**: implement automatic deletion for data past its retention period
- **Breach notification**: if you discover a data breach, notify your manager within 1 hour
- **Access controls**: personal data must only be accessible to systems and people with a need

**Practical rule**: if you wouldn't want this data collected about yourself, think twice.

|elif: @qst:employee-role == sales|
As a sales team member, you handle prospect and customer personal data directly.
Your primary obligations:

- **Consent**: only contact prospects who have consented to be contacted
- **Right to erasure**: if a prospect asks to be removed from your list, do it within 24 hours — no exceptions
- **Data portability**: if a customer requests their data, forward to legal@example.com
- **No unauthorized sharing**: CRM data stays in the CRM

**Practical rule**: if a prospect says stop, you stop — immediately and permanently.

|else|
As a finance team member, you handle financial and payroll personal data.
Your primary obligations:

- **Access logging**: all access to payroll systems is logged and reviewed quarterly
- **Need-to-know**: only access data relevant to your current work
- **Third-party sharing**: financial data shared with third parties requires DPO sign-off
- **Retention**: payroll records must be retained for 7 years, then deleted

**Practical rule**: payroll data is among the most sensitive we hold. Treat it accordingly.
|/if|
::

:: block id=blk:security-policy type=lesson about=@ent:sec-policy priority=high
@when: @qst:compliance-knowledge

# Information Security Policy

|if: @qst:compliance-knowledge == foundational|
Security policies keep our company and our customers safe. The core rules:

1. **Lock your screen** when you leave your desk — Win+L or Cmd+Ctrl+Q
2. **Strong passwords**: at least 16 characters, unique per service — use 1Password
3. **Phishing**: if an email asks you to click a link and enter a password, verify the sender by phone first
4. **Lost device**: report a lost laptop or phone to security@example.com within 30 minutes

These are not optional. They are security controls.

|elif: @qst:compliance-knowledge == working|
You know the basics. Key additions for working-level compliance:

- **MFA**: all critical systems require hardware MFA (Yubikey). No TOTP for production systems.
- **Secrets management**: never commit credentials. Use Vault for all secrets. Rotate on suspicion of exposure.
- **Third-party access**: external contractors get time-limited credentials. Review quarterly.
- **Incident classification**: know the three tiers (P0/P1/P2) and your notification obligations for each.

|else|
Expert-level obligations focus on systemic risk:

- **Threat modeling**: new systems require a threat model before launch. Template in Notion.
- **Security review**: features touching auth, payments, or PII require security team sign-off.
- **Vendor assessment**: new vendor with access to sensitive data requires security questionnaire.
- **Audit log integrity**: security logs must be tamper-evident. Review the SIEM onboarding guide.
|/if|
::

%% ═══ L3: Actions ═══

:: action id=act:role-survey agent=training-system trigger="training_assigned"
@tool: "survey_runner"
@input: {
  survey_id: "compliance_role_survey",
  fields: ["role", "seniority", "gdpr_scope", "previous_training_year"]
}
@output: "role_survey_result.json"
@timeout: 300000

Collect employee role and context before pre-assessment.
::

:: action id=act:pre-assessment agent=training-system trigger="role_survey_complete"
@tool: "compliance_quiz_runner"
@input: {
  topics: [@ent:gdpr, @ent:sec-policy],
  question_count: 10,
  adaptive: true,
  role_context: @qst:employee-role
}
@output: "pre_assessment_result.json"
@depends_on: @act:role-survey
@timeout: 1800000

Pre-assessment to determine baseline compliance knowledge.
::

:: action id=act:generate-quiz agent=training-system trigger="lesson_complete"
@tool: "compliance_quiz_generator"
@input: {
  topics: [@ent:gdpr, @ent:sec-policy],
  role: @qst:employee-role,
  difficulty: @qst:compliance-knowledge,
  count: 5,
  format: "scenario_based"
}
@output: "lesson_quiz_result.json"
@depends_on: @act:pre-assessment
@guard: @qst:compliance-knowledge != "uninitialized"
@timeout: 1200000
::

:: action id=act:issue-certificate agent=training-system trigger="pipe:compliance-training.complete"
@tool: "certificate_issuer"
@input: {
  employee: "current_user",
  modules: [@ent:gdpr, @ent:sec-policy],
  valid_until: "2027-03-16"
}
@output: "certificate.pdf"
@guard: @act:generate-quiz.status == "passed"
@timeout: 30000

Issue completion certificate. Only fires when pipeline completes successfully.
::

:: action id=act:notify-manager agent=training-system trigger="pipe:compliance-training.complete"
@tool: "email_notifier"
@input: {
  to: "employee.manager",
  subject: "Compliance Training Complete",
  body: "Your team member has completed annual compliance training."
}
@depends_on: @act:issue-certificate
@timeout: 10000
::

%% ═══ L5: Training Pipeline ═══

:: pipeline id=pipe:compliance-training
@goal: "achieve_compliance_certification"
@criteria: ["quiz_accuracy_above_85", "all_modules_completed", "scenario_responses_pass"]
@interval: "every_session"
@max_iterations: 15
@stages: [
  {name: "role_survey",      action: @act:role-survey},
  {name: "pre_assess",       action: @act:pre-assessment},
  {name: "calibrate_role",   quantum: @qst:employee-role},
  {name: "calibrate_level",  quantum: @qst:experience-level},
  {name: "calibrate_knowledge", quantum: @qst:compliance-knowledge},
  {name: "gdpr_lesson",      block: @blk:gdpr-overview},
  {name: "security_lesson",  block: @blk:security-policy},
  {name: "quiz",             action: @act:generate-quiz},
  {name: "certify",          action: @act:issue-certificate},
  {name: "notify",           action: @act:notify-manager}
]
@feedback: {
  positive: "complete_and_certify",
  negative: {adjust: {depth: "decrease", examples: "increase", scenarios: "simpler"}},
  stagnant: {escalate: "hr_compliance_coordinator"}
}
@circuit_breaker: {
  condition: "consecutive_failures > 4",
  action: "pause_and_notify"
}

Annual compliance certification pipeline. Adapts to role, seniority, and
prior knowledge. Must complete within 5 calendar days of assignment.
::
```

**Walking through this document:**

1. The meta node declares `@ukdl_level: 5` — a parser that only supports L3 will skip the `quantum` and `pipeline` nodes and still render readable content.

2. Three quantum variables form a cascade: `qst:employee-role` (observed from HR data) entangles with `qst:experience-level`, which entangles with `qst:compliance-knowledge`. When the role survey fires, all three variables update in sequence.

3. Two entanglement pairs are declared: role-to-experience and experience-to-knowledge. The matrices encode domain knowledge: finance managers are more likely to have expert compliance knowledge than junior engineers.

4. `qst:compliance-knowledge` has a `@decay` of one year — this is what enforces annual re-certification. After 365 days, the distribution has decayed toward uniform, meaning the system can no longer assume the employee is still compliant and requires a new training run.

5. The pipeline's ten stages execute linearly. The three `quantum` stages (calibrate_role, calibrate_level, calibrate_knowledge) wait for the quantum variables to collapse before the lesson stages render. This ensures the `|if: @qst:employee-role == engineer|` branches always evaluate against a definite value, not a superposition.

6. The `@guard` on `act:issue-certificate` means the certificate is only issued if the quiz was passed. The `@depends_on` on `act:notify-manager` means the manager notification only fires after the certificate is issued successfully.

7. The `@circuit_breaker` fires after four consecutive failures — a sign that the pipeline's adjustments are insufficient and a human HR coordinator should intervene.

---

## 5. Debugging Adaptive Systems

### 5.1 Inspecting Quantum State

```bash
# Show current probability distributions for all quantum variables
ukdl stats --file training.ukdl

# Output:
# qst:employee-role       {engineer: 0.33, sales: 0.34, finance: 0.33}  [superposition]
# qst:experience-level    {junior: 0.35, senior: 0.40, manager: 0.25}   [superposition]
# qst:compliance-knowledge {foundational: 0.5, working: 0.35, expert: 0.15} [superposition]

# After observation:
ukdl stats --file training.ukdl --observation-file results.json

# Output:
# qst:employee-role       {engineer: 1.0, sales: 0.0, finance: 0.0}     [collapsed: engineer]
# qst:experience-level    {junior: 0.1, senior: 0.8, manager: 0.1}      [collapsed: senior]
# qst:compliance-knowledge {foundational: 0.25, working: 0.60, expert: 0.15} [collapsed: working]
```

```bash
# Check how much a quantum variable has decayed since last observation
ukdl stats --file training.ukdl --check-decay qst:compliance-knowledge --last-observed 2025-03-16

# Output:
# qst:compliance-knowledge: 365 days since observation (half_life: 365d)
# Current distribution: {foundational: 0.415, working: 0.425, expert: 0.16}
# Entropy: 1.08 (approaching maximum 1.58 for 3-state variable)
# Recommendation: re-assessment warranted
```

### 5.2 Inspecting Conditional Branches

```bash
# Render content as it appears for a specific quantum state combination
ukdl context --file training.ukdl --phase quantum \
  --set qst:employee-role=engineer \
  --set qst:compliance-knowledge=foundational

# Output: renders only the blocks whose @when conditions match the specified state
```

```bash
# Show which branches are active given current quantum state
ukdl context --file training.ukdl --explain-branches

# Output:
# blk:gdpr-overview: |if: qst:employee-role == engineer| → ACTIVE (p=1.0)
# blk:security-policy: |if: qst:compliance-knowledge == foundational| → ACTIVE (p=0.25)
#                       |elif: qst:compliance-knowledge == working|    → PROBABLE (p=0.60)
#                       |else|                                          → inactive (p=0.15)
```

### 5.3 Common Mistakes

**Probabilities that do not sum to 1.0**

```ukdl
%% Wrong — sums to 0.95
:: quantum id=qst:bad-sum
@states: {a: 0.5, b: 0.3, c: 0.15}
::
```

The parser auto-normalizes this and emits a warning. The document is still valid, but the warning signals a logic error in your model. Always verify your distributions sum to exactly 1.0.

**Entanglement matrix rows that do not sum to 1.0**

```ukdl
%% Wrong — beginner row sums to 0.85
@entangle_matrix: {
  beginner-basic:    0.70,
  beginner-standard: 0.15,
  beginner-deep:     0.00,   %% should be 0.15 to reach 1.0
  ...
}
```

Same auto-normalization behavior. Run `ukdl validate --strict` to catch these as errors rather than warnings during development.

**Missing `@default` on a quantum variable**

Without `@default`, if an observation event fails or never fires, the variable stays in superposition. Conditional branches evaluate against the highest-probability state, which works, but error messages and logs show "uninitialized" rather than a clear fallback label. Always set `@default` to the most reasonable fallback state.

**Circular dependencies in action chains**

```ukdl
%% Wrong — circular dependency
:: action id=act:a
@depends_on: @act:b
::

:: action id=act:b
@depends_on: @act:a
::
```

This is a parse-time error: "circular dependency detected in action dependency graph." The parser will halt and report which actions form the cycle. Resolve by removing one dependency or introducing an intermediate action.

**Pipeline stages referencing non-existent nodes**

```ukdl
@stages: [
  {name: "assess", action: @act:nonexistent-action}
]
```

This is a parse-time warning: "unresolved reference @act:nonexistent-action in pipeline stages." The pipeline is valid but the stage will be skipped at runtime. Catch this with `ukdl validate` before deploying.

**Using `@feedback.stagnant` without a `@max_iterations` cap**

```ukdl
%% Dangerous — no iterations cap, stagnant handler never reaches limit
:: pipeline id=pipe:dangerous
@interval: "every_session"
%% missing @max_iterations
@feedback: {
  positive: "complete",
  negative: {adjust: {retry: "with_less"}},
  stagnant: {escalate: "human"}
}
::
```

Without `@max_iterations`, the pipeline can run indefinitely if positive feedback never triggers and the stagnant handler keeps re-engaging the user. Always set `@max_iterations`. A reasonable default for learning pipelines is 50–100; for monitoring pipelines, set it to `8760` (once per hour for a year) or higher.

---

## 6. Performance Considerations

### 6.1 Document Size

The UKDL parser is O(n) in document size — a single pass from top to bottom. Documents up to 10,000 lines parse in under 100ms on modern hardware. Documents over 50,000 lines are a design smell: use `include` nodes to split large documents into focused files.

```ukdl
%% Preferred for large knowledge bases: one file per topic
:: include id=inc:gdpr src="./compliance/gdpr.ukdl"
@filter: {kind: "block", priority: ["high", "critical"]}
@namespace: "gdpr"
::

:: include id=inc:security src="./compliance/security.ukdl"
@filter: {kind: "block", priority: ["high", "critical"]}
@namespace: "sec"
::
```

The `@filter` field ensures only high-priority blocks are included in the primary document's context window.

### 6.2 Quantum State Complexity

Quantum state evaluation is O(n * m) where n is the number of quantum variables and m is the number of states per variable. For typical documents (3–5 quantum variables, 3–5 states each), this is negligible.

Entanglement matrix storage is O(m1 * m2) per entanglement pair. A pair with 5 states each requires a 25-entry matrix. With 10 quantum variables fully entangled pairwise, you have 45 matrices and up to 1,125 entries. This is still fast, but signals that your model has grown complex enough to warrant splitting into multiple independent documents.

**Practical guidelines:**
- 3–5 quantum variables per document is comfortable
- 2–3 entanglement pairs per document is manageable
- Beyond 5 variables or 4 entanglement pairs, consider whether you need a dedicated quantum state service rather than embedding everything in UKDL

### 6.3 Pipeline Iteration Budgets

Every pipeline iteration involves at least one action execution, which typically calls an external tool. Budget accordingly:

| Scenario | Recommended `@max_iterations` | Reasoning |
|---------|-------------------------------|-----------|
| One-shot build pipeline | 5–10 | Low retry cost; fail fast |
| Learning module (per lesson) | 50–100 | Users need multiple attempts |
| Daily data pipeline | 3 | Strict SLA; escalate fast |
| Hourly monitoring | 8760 | One year of hourly checks |
| Annual compliance loop | 15 | 5-day window at 3 sessions/day |

Set `@max_iterations` based on your actual SLA and the cost of a failed iteration, not on an arbitrary large number.

### 6.4 Context Phase Token Estimates

Use these estimates when configuring `@max_tokens` on context nodes:

| Context Phase | Typical Token Range | What's Included |
|--------------|---------------------|----------------|
| Full | 2,000–20,000 | Everything |
| Summary | 500–3,000 | Critical nodes + summaries of collapsed nodes |
| Priority | 200–1,000 | Critical and high-priority nodes only |
| Skeleton | 100–500 | Entity/rel graph + meta only |
| Quantum | 50–300 | Only quantum-state-selected blocks |

For a RAG-powered chatbot with a 4,096-token context window, configure your knowledge base to operate in the Priority or Summary phase. Set `@max_tokens: 3000` on context nodes that contain large reference sections, and `@collapse: true` on all non-critical context nodes. The `ctx:quick-answers` pattern from Recipe 7 (Chatbot Knowledge Base) is the right model.

---

> Use `ukdl stats`, `ukdl validate --strict`, and `ukdl context --explain-branches` throughout development. Quantum states and pipelines are most reliable when their distributions, matrices, and iteration budgets are verified before deployment.
