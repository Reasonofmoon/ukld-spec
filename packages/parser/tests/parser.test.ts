/**
 * Comprehensive tests for @ukdl/parser
 * Covers all UKDL v2.0 constructs, L0–L5.
 */

import { describe, it, expect } from 'vitest';
import {
  parse,
  validate,
  toJSON,
  fromJSON,
  serialize,
  optimizeContext,
  extractGraph,
  parseAndValidate,
  parseValue,
  parseReference,
  tokenize,
  TokenType,
} from '../src/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_META = `:: meta id=doc:test title="Test"
@author: "test"
@lang: "en"
@version: "1.0"
::`;

// ---------------------------------------------------------------------------
// Lexer tests
// ---------------------------------------------------------------------------

describe('Lexer (tokenize)', () => {
  it('classifies a node open line', () => {
    const tokens = tokenize(':: meta id=doc:foo title="Bar"');
    expect(tokens[0]?.type).toBe(TokenType.NODE_OPEN);
  });

  it('classifies a node close line', () => {
    const tokens = tokenize('::');
    expect(tokens[0]?.type).toBe(TokenType.NODE_CLOSE);
  });

  it('classifies a field line', () => {
    const tokens = tokenize('@author: "alice"');
    expect(tokens[0]?.type).toBe(TokenType.FIELD);
  });

  it('classifies a single-line comment', () => {
    const tokens = tokenize('%% this is a comment');
    expect(tokens[0]?.type).toBe(TokenType.COMMENT_LINE);
  });

  it('classifies block comment start', () => {
    const tokens = tokenize('(( start of block comment');
    expect(tokens[0]?.type).toBe(TokenType.COMMENT_BLOCK_START);
  });

  it('classifies a single-line block comment', () => {
    const tokens = tokenize('(( inline block comment ))');
    expect(tokens[0]?.type).toBe(TokenType.COMMENT_LINE);
  });

  it('classifies directive tokens', () => {
    const cases: [string, TokenType][] = [
      ['|if: @qst:x == beginner|', TokenType.DIRECTIVE_IF],
      ['|elif: @qst:x == advanced|', TokenType.DIRECTIVE_ELIF],
      ['|else|', TokenType.DIRECTIVE_ELSE],
      ['|/if|', TokenType.DIRECTIVE_ENDIF],
      ['|for: x in @pipe:foo|', TokenType.DIRECTIVE_FOR],
      ['|/for|', TokenType.DIRECTIVE_ENDFOR],
      ['|multimodal_output|', TokenType.DIRECTIVE_MULTIMODAL],
      ['|/multimodal_output|', TokenType.DIRECTIVE_MULTIMODAL_END],
      ['|function: greet(name)|', TokenType.DIRECTIVE_FUNCTION],
      ['|/function|', TokenType.DIRECTIVE_FUNCTION_END],
    ];

    for (const [line, expected] of cases) {
      const tokens = tokenize(line);
      expect(tokens[0]?.type, `Expected ${line} to be ${expected}`).toBe(expected);
    }
  });

  it('classifies body text', () => {
    const tokens = tokenize('This is body text.');
    expect(tokens[0]?.type).toBe(TokenType.BODY);
  });

  it('classifies blank lines', () => {
    const tokens = tokenize('   ');
    expect(tokens[0]?.type).toBe(TokenType.BLANK);
  });

  it('tracks line numbers', () => {
    const src = 'line one\nline two\nline three';
    const tokens = tokenize(src);
    expect(tokens[0]?.line).toBe(1);
    expect(tokens[1]?.line).toBe(2);
    expect(tokens[2]?.line).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Value parser tests
// ---------------------------------------------------------------------------

describe('parseValue', () => {
  it('parses null', () => {
    expect(parseValue('null')).toBe(null);
  });

  it('parses booleans', () => {
    expect(parseValue('true')).toBe(true);
    expect(parseValue('false')).toBe(false);
  });

  it('parses integers', () => {
    expect(parseValue('42')).toBe(42);
    expect(parseValue('-1')).toBe(-1);
  });

  it('parses floats', () => {
    expect(parseValue('3.14')).toBe(3.14);
    expect(parseValue('1e10')).toBe(1e10);
  });

  it('parses double-quoted strings', () => {
    expect(parseValue('"hello world"')).toBe('hello world');
    expect(parseValue('"with \\"escape\\""')).toBe('with "escape"');
  });

  it('parses single-quoted raw strings', () => {
    expect(parseValue("'raw\\nstring'")).toBe('raw\\nstring');
  });

  it('parses arrays', () => {
    expect(parseValue('["a", "b", 3]')).toEqual(['a', 'b', 3]);
  });

  it('parses nested arrays', () => {
    expect(parseValue('[[1, 2], [3, 4]]')).toEqual([[1, 2], [3, 4]]);
  });

  it('parses objects with unquoted keys', () => {
    const result = parseValue('{key: "value", n: 42}');
    expect(result).toEqual({ key: 'value', n: 42 });
  });

  it('parses nested objects', () => {
    const result = parseValue('{outer: {inner: "x"}}');
    expect(result).toEqual({ outer: { inner: 'x' } });
  });

  it('parses references', () => {
    const ref = parseValue('@ent:newton');
    expect(ref).toMatchObject({ prefix: 'ent', name: 'newton', key: 'ent:newton' });
  });

  it('parses display references', () => {
    const ref = parseValue('@{ent:newton|Isaac Newton}');
    expect(ref).toMatchObject({
      prefix: 'ent',
      name: 'newton',
      display: 'Isaac Newton',
      key: 'ent:newton',
    });
  });

  it('parses object with mixed value types', () => {
    const result = parseValue('{name: "test", count: 5, active: true, data: null}');
    expect(result).toEqual({ name: 'test', count: 5, active: true, data: null });
  });
});

// ---------------------------------------------------------------------------
// parseReference tests
// ---------------------------------------------------------------------------

describe('parseReference', () => {
  it('parses a bare reference', () => {
    const ref = parseReference('@ent:gravity');
    expect(ref).toMatchObject({ prefix: 'ent', name: 'gravity', key: 'ent:gravity' });
  });

  it('parses a display reference', () => {
    const ref = parseReference('@{ent:newton|Sir Isaac Newton}');
    expect(ref).toMatchObject({ prefix: 'ent', name: 'newton', display: 'Sir Isaac Newton' });
  });

  it('returns null for invalid references', () => {
    expect(parseReference('not-a-ref')).toBeNull();
    expect(parseReference('@invalid')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Parser — basic structure
// ---------------------------------------------------------------------------

describe('parse — empty / minimal documents', () => {
  it('parses an empty string without errors', () => {
    const result = parse('');
    expect(result.errors).toHaveLength(0);
    expect(result.document.nodes.size).toBe(0);
    expect(result.document.meta).toBeNull();
  });

  it('parses a meta-only document', () => {
    const result = parse(MINIMAL_META);
    expect(result.errors).toHaveLength(0);
    expect(result.document.meta).not.toBeNull();
    expect(result.document.meta?.id).toBe('doc:test');
    expect(result.document.meta?.attrs['title']).toBe('Test');
    expect(result.document.meta?.fields['author']).toBe('test');
    expect(result.document.meta?.fields['lang']).toBe('en');
  });

  it('parses comments-only document without errors', () => {
    const src = `%% just a comment\n((\nblock comment\n))\n`;
    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    expect(result.document.nodes.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Parser — L0: blocks
// ---------------------------------------------------------------------------

describe('parse — L0: blocks', () => {
  it('parses a block node', () => {
    const src = `${MINIMAL_META}

:: block id=blk:intro type=lesson priority=high
@confidence: 0.9
@summary: "A lesson block."

This is the body text.
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const node = result.document.nodes.get('blk:intro');
    expect(node).toBeDefined();
    expect(node?.kind).toBe('block');
    expect(node?.attrs['type']).toBe('lesson');
    expect(node?.attrs['priority']).toBe('high');
    expect(node?.fields['confidence']).toBe(0.9);
    expect(node?.fields['summary']).toBe('A lesson block.');
    expect(node?.body).toContain('This is the body text.');
  });

  it('parses unknown kinds as block with type attr', () => {
    const src = `${MINIMAL_META}

:: theorem id=blk:pythagoras
::`;
    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const node = result.document.nodes.get('blk:pythagoras');
    expect(node?.kind).toBe('block');
    expect(node?.attrs['type']).toBe('theorem');
  });

  it('parses empty node (no fields, no body)', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:empty
::`;
    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const node = result.document.nodes.get('ent:empty');
    expect(node).toBeDefined();
    expect(node?.body).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Parser — L1: entities and relations
// ---------------------------------------------------------------------------

describe('parse — L1: entities and relations', () => {
  it('parses entity nodes', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:newton type=Person labels.en="Isaac Newton" labels.ko="아이작 뉴턴"
@born: "1643-01-04"
@aliases: ["Sir Isaac Newton"]
@same_as: ["https://www.wikidata.org/wiki/Q935"]

English mathematician, physicist, and astronomer.
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const node = result.document.nodes.get('ent:newton');
    expect(node?.kind).toBe('entity');
    expect(node?.attrs['type']).toBe('Person');
    expect(node?.attrs['labels.en']).toBe('Isaac Newton');
    expect(node?.fields['born']).toBe('1643-01-04');
    expect(node?.fields['aliases']).toEqual(['Sir Isaac Newton']);
    expect(node?.body).toContain('English mathematician');
  });

  it('parses rel nodes and extracts edges', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
::

:: entity id=ent:gravity type=Concept labels.en="Gravity"
::

:: rel id=rel:newton-gravity type=discovered from=@ent:newton to=@ent:gravity
@confidence: 0.95
@source: "Principia Mathematica, 1687"

Newton formulated the law of universal gravitation.
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    expect(result.document.edges).toHaveLength(1);
    const edge = result.document.edges[0]!;
    expect(edge.from).toBe('ent:newton');
    expect(edge.to).toBe('ent:gravity');
    expect(edge.type).toBe('discovered');
    expect(edge.attrs['confidence']).toBe(0.95);
  });

  it('parses schema nodes', () => {
    const src = `${MINIMAL_META}

:: schema id=sch:person-entity
@applies_to: {kind: "entity", type: "Person"}
@required_fields: ["born"]
@optional_fields: ["died", "aliases"]
@field_types: {born: "date", died: "date"}
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const schema = result.document.nodes.get('sch:person-entity');
    expect(schema?.kind).toBe('schema');
    expect(schema?.fields['required_fields']).toEqual(['born']);
  });
});

// ---------------------------------------------------------------------------
// Parser — L2: context and include
// ---------------------------------------------------------------------------

describe('parse — L2: context and include', () => {
  it('parses context nodes', () => {
    const src = `${MINIMAL_META}

:: context id=ctx:overview priority=critical depth=overview
@summary: "Newton's 3 laws: inertia, F=ma, action-reaction."
@collapse: false
@max_tokens: 500

Newton formulated three laws that form the foundation of classical mechanics.
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const ctx = result.document.nodes.get('ctx:overview');
    expect(ctx?.kind).toBe('context');
    expect(ctx?.attrs['priority']).toBe('critical');
    expect(ctx?.fields['collapse']).toBe(false);
    expect(ctx?.fields['max_tokens']).toBe(500);
  });

  it('parses context node with collapse=true', () => {
    const src = `${MINIMAL_META}

:: context id=ctx:derivation priority=low depth=detailed collapse=true
@summary: "Mathematical proof of F=ma."
@max_tokens: 3000

[Detailed derivation...]
::`;

    const result = parse(src);
    const ctx = result.document.nodes.get('ctx:derivation');
    expect(ctx?.attrs['collapse']).toBe(true);
    expect(ctx?.fields['max_tokens']).toBe(3000);
  });

  it('parses include nodes', () => {
    const src = `${MINIMAL_META}

:: include id=inc:chapter2 src="./chapter-2.ukdl"
@filter: {kind: "block", priority: ["high", "critical"]}
@namespace: "ch2"
::`;

    const result = parse(src);
    const inc = result.document.nodes.get('inc:chapter2');
    expect(inc?.kind).toBe('include');
    expect(inc?.attrs['src']).toBe('./chapter-2.ukdl');
    expect(inc?.fields['namespace']).toBe('ch2');
  });
});

// ---------------------------------------------------------------------------
// Parser — L3: action nodes
// ---------------------------------------------------------------------------

describe('parse — L3: action nodes', () => {
  it('parses action nodes', () => {
    const src = `${MINIMAL_META}

:: action id=act:generate-quiz agent=ai-tutor trigger="lesson_complete"
@tool: "adaptive_quiz_generator"
@input: {topic: @ent:newton-laws, count: 5, format: "multiple_choice"}
@output: "quiz_result.json"
@timeout: 30000
@retry: {max: 3, backoff: "exponential"}

Generate a diagnostic quiz.
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const action = result.document.nodes.get('act:generate-quiz');
    expect(action?.kind).toBe('action');
    expect(action?.attrs['agent']).toBe('ai-tutor');
    expect(action?.attrs['trigger']).toBe('lesson_complete');
    expect(action?.fields['tool']).toBe('adaptive_quiz_generator');
    expect(action?.fields['timeout']).toBe(30000);
  });

  it('parses depends_on as a reference', () => {
    const src = `${MINIMAL_META}

:: action id=act:step1 agent=bot trigger="start"
@tool: "tool_a"
::

:: action id=act:step2 agent=bot trigger="step1_done"
@tool: "tool_b"
@depends_on: @act:step1
::`;

    const result = parse(src);
    const step2 = result.document.nodes.get('act:step2');
    const depsOn = step2?.fields['depends_on'];
    expect(depsOn).toMatchObject({ key: 'act:step1' });
  });
});

// ---------------------------------------------------------------------------
// Parser — L4: quantum nodes
// ---------------------------------------------------------------------------

describe('parse — L4: quantum nodes', () => {
  it('parses quantum nodes', () => {
    const src = `${MINIMAL_META}

:: quantum id=qst:learner-level
@states: {beginner: 0.3, intermediate: 0.5, advanced: 0.2}
@observe_on: "diagnostic_quiz_complete"
@default: "intermediate"
@history: true
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const q = result.document.nodes.get('qst:learner-level');
    expect(q?.kind).toBe('quantum');
    expect(q?.fields['states']).toEqual({ beginner: 0.3, intermediate: 0.5, advanced: 0.2 });
    expect(q?.fields['observe_on']).toBe('diagnostic_quiz_complete');
    expect(q?.fields['default']).toBe('intermediate');
  });

  it('registers quantum variables in document.quantum_state', () => {
    const src = `${MINIMAL_META}

:: quantum id=qst:difficulty
@states: {easy: 0.5, hard: 0.5}
@observe_on: "test_complete"
::`;

    const result = parse(src);
    expect(result.document.quantum_state.variables).toContain('qst:difficulty');
  });

  it('parses entangle_matrix', () => {
    const src = `${MINIMAL_META}

:: quantum id=qst:level
@states: {novice: 0.5, expert: 0.5}
@observe_on: "assessment_done"
::

:: quantum id=qst:depth
@states: {basic: 0.5, deep: 0.5}
@entangle: @qst:level
@entangle_matrix: {novice-basic: 0.8, novice-deep: 0.2, expert-basic: 0.1, expert-deep: 0.9}
::`;

    const result = parse(src);
    expect(result.document.quantum_state.entanglements).toHaveLength(1);
    const ent = result.document.quantum_state.entanglements[0]!;
    expect(ent.a).toBe('qst:depth');
    expect(ent.b).toBe('qst:level');
    expect(ent.matrix['novice-basic']).toBe(0.8);
  });
});

// ---------------------------------------------------------------------------
// Parser — L5: pipeline nodes
// ---------------------------------------------------------------------------

describe('parse — L5: pipeline nodes', () => {
  it('parses pipeline nodes', () => {
    const src = `${MINIMAL_META}

:: action id=act:diagnose agent=bot trigger="start"
@tool: "quiz_gen"
::

:: quantum id=qst:level
@states: {novice: 0.5, expert: 0.5}
@observe_on: "quiz_done"
::

:: pipeline id=pipe:learning
@goal: "maximize_comprehension"
@criteria: ["quiz_accuracy", "retention"]
@interval: "every_lesson"
@max_iterations: 50
@stages: [
  {name: "assess",   action: @act:diagnose},
  {name: "classify", quantum: @qst:level}
]
@feedback: {positive: "advance", negative: {adjust: {depth: "decrease"}}}
@circuit_breaker: {condition: "failures > 3", action: "pause"}

Adaptive learning pipeline.
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const pipeline = result.document.nodes.get('pipe:learning');
    expect(pipeline?.kind).toBe('pipeline');
    expect(pipeline?.fields['goal']).toBe('maximize_comprehension');
    expect(pipeline?.fields['max_iterations']).toBe(50);
    expect(pipeline?.fields['criteria']).toEqual(['quiz_accuracy', 'retention']);
    expect(result.document.pipelines).toContain('pipe:learning');
  });
});

// ---------------------------------------------------------------------------
// Parser — directives
// ---------------------------------------------------------------------------

describe('parse — conditional directives', () => {
  it('parses if/elif/else/endif directives', () => {
    const src = `${MINIMAL_META}

:: block id=blk:adaptive type=lesson
@summary: "Adaptive content"

|if: @qst:level == beginner|
Simple explanation.
|elif: @qst:level == intermediate|
Standard explanation.
|else|
Advanced explanation.
|/if|
::`;

    const result = parse(src);
    expect(result.errors).toHaveLength(0);
    const node = result.document.nodes.get('blk:adaptive');
    expect(node?.directives).toHaveLength(1);
    const cond = node?.directives[0];
    expect(cond?.type).toBe('conditional');
    if (cond?.type === 'conditional') {
      expect(cond.branches).toHaveLength(3);
      expect(cond.branches[0]?.condition).toBe('@qst:level == beginner');
      expect(cond.branches[0]?.body).toContain('Simple explanation');
      expect(cond.branches[1]?.condition).toBe('@qst:level == intermediate');
      expect(cond.branches[2]?.condition).toBeNull(); // else
      expect(cond.branches[2]?.body).toContain('Advanced explanation');
    }
  });

  it('parses for loop directives', () => {
    const src = `${MINIMAL_META}

:: block id=blk:loop-test type=note

|for: stage in @pipe:learning.stages|
  Stage: {stage}
|/for|
::`;

    const result = parse(src);
    const node = result.document.nodes.get('blk:loop-test');
    const loopDir = node?.directives.find(d => d.type === 'loop');
    expect(loopDir).toBeDefined();
    if (loopDir?.type === 'loop') {
      expect(loopDir.variable).toBe('stage');
      expect(loopDir.iterable).toBe('@pipe:learning.stages');
    }
  });

  it('parses multimodal output blocks', () => {
    const src = `${MINIMAL_META}

:: block id=blk:multi type=explanation

|multimodal_output|
  [text] Photosynthesis converts light energy to chemical energy.
  [voice] tts("Photosynthesis...", lang="en")
  [image] render(@ent:photosynthesis-diagram)
  [video] play(@blk:animation, autoplay=false)
  [braille] braille("Photosynthesis converts light energy.")
|/multimodal_output|
::`;

    const result = parse(src);
    const node = result.document.nodes.get('blk:multi');
    const mmDir = node?.directives.find(d => d.type === 'multimodal');
    expect(mmDir).toBeDefined();
    if (mmDir?.type === 'multimodal') {
      expect(mmDir.entries).toHaveLength(5);
      expect(mmDir.entries[0]?.modality).toBe('text');
      expect(mmDir.entries[1]?.modality).toBe('voice');
      expect(mmDir.entries[2]?.modality).toBe('image');
      expect(mmDir.entries[4]?.modality).toBe('braille');
    }
  });

  it('parses function definitions', () => {
    const src = `${MINIMAL_META}

:: block id=blk:fn-test type=note

|function: greet(name, level)|
  |if: @level == beginner|
    Welcome, @name!
  |else|
    Advanced welcome.
  |/if|
|/function|
::`;

    const result = parse(src);
    const node = result.document.nodes.get('blk:fn-test');
    const fnDir = node?.directives.find(d => d.type === 'function');
    expect(fnDir).toBeDefined();
    if (fnDir?.type === 'function') {
      expect(fnDir.name).toBe('greet');
      expect(fnDir.params).toEqual(['name', 'level']);
    }
  });
});

// ---------------------------------------------------------------------------
// Parser — error handling
// ---------------------------------------------------------------------------

describe('parse — error handling', () => {
  it('reports error for unclosed node', () => {
    const src = `:: meta id=doc:test title="Test"
@author: "test"
@lang: "en"
@version: "1.0"
:: block id=blk:unclosed type=note
@summary: "this node was not closed"`;

    const result = parse(src);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('collects errors and still returns a partial document', () => {
    const src = `:: block id=blk:orphan type=note
Body text outside of meta.
::

:: meta id=doc:test title="Test"
@author: "tester"
@lang: "en"
@version: "1.0"
::`;

    const result = parse(src);
    // No hard errors here, but we get warnings about meta not being first
    expect(result.document.nodes.size).toBe(2);
  });

  it('warns about content outside nodes', () => {
    const src = `${MINIMAL_META}

Some content outside a node.`;
    const result = parse(src);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('does not throw on completely malformed input', () => {
    expect(() => parse('::::: bad ::::: id')).not.toThrow();
    expect(() => parse('{{{not valid ukdl}}}')).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Validator tests
// ---------------------------------------------------------------------------

describe('validate', () => {
  it('validates a well-formed document with no errors', () => {
    const src = `:: meta id=doc:test title="Test"
@author: "alice"
@lang: "en"
@version: "2.0"
::

:: entity id=ent:concept type=Concept labels.en="Test Concept"
::`;

    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.valid).toBe(true);
    expect(valResult.errors).toHaveLength(0);
  });

  it('reports error when meta node is missing', () => {
    const result = parse('');
    const valResult = validate(result.document);
    expect(valResult.valid).toBe(false);
    expect(valResult.errors.some(e => e.message.includes('meta'))).toBe(true);
  });

  it('reports error for rel missing from/to', () => {
    const src = `${MINIMAL_META}

:: rel id=rel:broken type=causes
::`;

    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.valid).toBe(false);
    expect(valResult.errors.some(e => e.nodeId === 'rel:broken')).toBe(true);
  });

  it('reports error for action missing @tool', () => {
    const src = `${MINIMAL_META}

:: action id=act:bad agent=bot trigger="start"
@input: {topic: "test"}
::`;

    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.valid).toBe(false);
    expect(valResult.errors.some(e => e.nodeId === 'act:bad' && e.message.includes('tool'))).toBe(true);
  });

  it('auto-normalises quantum probabilities that do not sum to 1.0', () => {
    const src = `${MINIMAL_META}

:: quantum id=qst:test
@states: {a: 0.4, b: 0.4, c: 0.4}
@observe_on: "done"
::`;

    const result = parse(src);
    const valResult = validate(result.document);

    // Should warn but still normalise
    expect(valResult.warnings.some(w => w.nodeId === 'qst:test' && w.message.includes('sum'))).toBe(true);

    const normNode = valResult.document.nodes.get('qst:test');
    const states = normNode?.fields['states'] as Record<string, number>;
    const sum = Object.values(states).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(1e-9);
  });

  it('warns about entanglement matrix rows not summing to 1.0', () => {
    const src = `${MINIMAL_META}

:: quantum id=qst:a
@states: {x: 0.5, y: 0.5}
@observe_on: "done"
::

:: quantum id=qst:b
@states: {p: 0.5, q: 0.5}
@entangle: @qst:a
@entangle_matrix: {x-p: 0.9, x-q: 0.5, y-p: 0.5, y-q: 0.5}
@observe_on: "done"
::`;

    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.warnings.some(w => w.message.includes('matrix'))).toBe(true);
  });

  it('detects circular depends_on chains', () => {
    const src = `${MINIMAL_META}

:: action id=act:a agent=bot trigger="t1"
@tool: "tool_a"
@depends_on: @act:b
::

:: action id=act:b agent=bot trigger="t2"
@tool: "tool_b"
@depends_on: @act:a
::`;

    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.errors.some(e => e.message.includes('Circular'))).toBe(true);
  });

  it('warns for pipeline stage referencing unknown node', () => {
    const src = `${MINIMAL_META}

:: pipeline id=pipe:test
@goal: "test"
@stages: [{name: "step1", action: @act:nonexistent}]
::`;

    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.warnings.some(w => w.message.includes('nonexistent'))).toBe(true);
  });

  it('applies schema validation constraints', () => {
    const src = `${MINIMAL_META}

:: schema id=sch:person
@applies_to: {kind: "entity", type: "Person"}
@required_fields: ["born"]
::

:: entity id=ent:unknown-person type=Person labels.en="Unknown"
::`;

    // Person entity is missing @born — should warn
    const result = parse(src);
    const valResult = validate(result.document);
    expect(valResult.warnings.some(w => w.nodeId === 'ent:unknown-person' && w.message.includes('born'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON mapper tests
// ---------------------------------------------------------------------------

describe('toJSON / fromJSON', () => {
  it('converts a document to canonical JSON', () => {
    const result = parse(MINIMAL_META);
    const json = toJSON(result.document);
    expect(json['$schema']).toBe('https://ukdl.org/schema/v2.0.json');
    expect(json.ukdl_version).toBe('2.0');
    expect(json.doc['id']).toBe('doc:test');
    expect(json.nodes['doc:test']).toBeDefined();
  });

  it('preserves nodes in JSON round-trip', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:gravity type=Concept labels.en="Gravity"
@domain: "physics"
::`;

    const parsed = parse(src);
    const json = toJSON(parsed.document);
    const restored = fromJSON(json);
    expect(restored.nodes.has('ent:gravity')).toBe(true);
    const entity = restored.nodes.get('ent:gravity');
    expect(entity?.attrs['type']).toBe('Concept');
    expect(entity?.fields['domain']).toBe('physics');
  });

  it('preserves edges in JSON round-trip', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:a type=Concept labels.en="A"
::

:: entity id=ent:b type=Concept labels.en="B"
::

:: rel id=rel:a-b type=causes from=@ent:a to=@ent:b
@confidence: 0.9
::`;

    const parsed = parse(src);
    const json = toJSON(parsed.document);
    const restored = fromJSON(json);
    expect(restored.edges).toHaveLength(1);
    expect(restored.edges[0]?.from).toBe('ent:a');
    expect(restored.edges[0]?.to).toBe('ent:b');
  });

  it('preserves quantum state in JSON round-trip', () => {
    const src = `${MINIMAL_META}

:: quantum id=qst:level
@states: {novice: 0.5, expert: 0.5}
@observe_on: "done"
::`;

    const parsed = parse(src);
    const json = toJSON(parsed.document);
    const restored = fromJSON(json);
    expect(restored.quantum_state.variables).toContain('qst:level');
  });
});

// ---------------------------------------------------------------------------
// Serializer tests
// ---------------------------------------------------------------------------

describe('serialize', () => {
  it('serializes a document back to UKDL text', () => {
    const result = parse(MINIMAL_META);
    const text = serialize(result.document);
    expect(text).toContain(':: meta id=doc:test');
    expect(text).toContain('@author:');
    expect(text).toContain('::');
  });

  it('round-trips parse -> serialize -> parse (semantic equivalence)', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
@born: "1643-01-04"

English mathematician.
::

:: rel id=rel:test type=example from=@ent:newton to=@ent:newton
@confidence: 0.5
::`;

    const pass1 = parse(src);
    const text = serialize(pass1.document);
    const pass2 = parse(text);

    // Both should have the same nodes
    expect([...pass2.document.nodes.keys()].sort()).toEqual(
      [...pass1.document.nodes.keys()].sort(),
    );

    // Entity should have same fields
    const newton1 = pass1.document.nodes.get('ent:newton');
    const newton2 = pass2.document.nodes.get('ent:newton');
    expect(newton2?.fields['born']).toBe(newton1?.fields['born']);
    expect(newton2?.attrs['type']).toBe(newton1?.attrs['type']);
  });
});

// ---------------------------------------------------------------------------
// Context optimizer tests
// ---------------------------------------------------------------------------

describe('optimizeContext', () => {
  const fullDoc = () => parse(`${MINIMAL_META}

:: context id=ctx:overview priority=critical depth=overview
@summary: "Overview summary."
@collapse: false

Full overview content.
::

:: context id=ctx:derivation priority=low depth=detailed collapse=true
@summary: "Collapsed derivation."
@max_tokens: 2000

Long detailed derivation...
::

:: entity id=ent:concept type=Concept labels.en="Concept"
@domain: "test"
::

:: block id=blk:note type=note priority=normal
@summary: "A note."

Note body text.
::
`).document;

  it('full phase returns document unchanged (same node count)', () => {
    const doc = fullDoc();
    const optimized = optimizeContext(doc, 'full');
    expect(optimized.nodes.size).toBe(doc.nodes.size);
    expect(optimized.context_tree.current_phase).toBe('full');
  });

  it('summary phase collapses low-priority collapse=true nodes', () => {
    const doc = fullDoc();
    const optimized = optimizeContext(doc, 'summary');
    const derivation = optimized.nodes.get('ctx:derivation');
    expect(derivation?.body).toContain('[Collapsed]');
    expect(derivation?.body).toContain('Collapsed derivation');

    // Non-collapsed node should be untouched
    const overview = optimized.nodes.get('ctx:overview');
    expect(overview?.body).toContain('Full overview content');
  });

  it('priority phase only keeps critical/high priority nodes', () => {
    const doc = fullDoc();
    const optimized = optimizeContext(doc, 'priority');
    // meta is always kept
    expect(optimized.nodes.has('doc:test')).toBe(true);
    // critical priority ctx
    expect(optimized.nodes.has('ctx:overview')).toBe(true);
    // low priority ctx should be removed
    expect(optimized.nodes.has('ctx:derivation')).toBe(false);
    // normal priority blk should be removed
    expect(optimized.nodes.has('blk:note')).toBe(false);
  });

  it('skeleton phase only keeps meta/entity/rel nodes without bodies', () => {
    const doc = fullDoc();
    const optimized = optimizeContext(doc, 'skeleton');
    // Entity should be kept (stripped)
    expect(optimized.nodes.has('ent:concept')).toBe(true);
    expect(optimized.nodes.get('ent:concept')?.body).toBe('');
    // Block should be removed
    expect(optimized.nodes.has('blk:note')).toBe(false);
    // Context should be removed
    expect(optimized.nodes.has('ctx:overview')).toBe(false);
  });

  it('quantum phase selects matching branches', () => {
    const src = `${MINIMAL_META}

:: block id=blk:content type=lesson

|if: @qst:level == novice|
Novice content.
|elif: @qst:level == expert|
Expert content.
|else|
Default content.
|/if|
::`;

    const doc = parse(src).document;
    const optimized = optimizeContext(doc, 'quantum', undefined, { 'qst:level': 'novice' });
    expect(optimized.context_tree.current_phase).toBe('quantum');
  });

  it('sets current_phase in context_tree', () => {
    const doc = fullDoc();
    for (const phase of ['full', 'summary', 'priority', 'skeleton', 'quantum'] as const) {
      const opt = optimizeContext(doc, phase);
      expect(opt.context_tree.current_phase).toBe(phase);
    }
  });
});

// ---------------------------------------------------------------------------
// Knowledge graph extraction tests
// ---------------------------------------------------------------------------

describe('extractGraph', () => {
  it('extracts entity nodes as graph nodes', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:a type=Concept labels.en="Concept A"
::

:: entity id=ent:b type=Concept labels.en="Concept B"
::`;

    const doc = parse(src).document;
    const graph = extractGraph(doc);
    const nodeIds = graph.nodes.map(n => n.id);
    expect(nodeIds).toContain('ent:a');
    expect(nodeIds).toContain('ent:b');
  });

  it('extracts rel nodes as graph edges', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:cause type=Concept labels.en="Cause"
::

:: entity id=ent:effect type=Concept labels.en="Effect"
::

:: rel id=rel:c-e type=causes from=@ent:cause to=@ent:effect
@confidence: 0.9
::`;

    const doc = parse(src).document;
    const graph = extractGraph(doc);
    const explicitEdges = graph.edges.filter(e => !e.implicit);
    expect(explicitEdges).toHaveLength(1);
    expect(explicitEdges[0]?.from).toBe('ent:cause');
    expect(explicitEdges[0]?.to).toBe('ent:effect');
  });

  it('extracts implicit edges from about= attrs', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:topic type=Concept labels.en="Topic"
::

:: block id=blk:text type=lesson about=@ent:topic
Body text about the topic.
::`;

    const doc = parse(src).document;
    const graph = extractGraph(doc);
    const implicitEdges = graph.edges.filter(e => e.implicit);
    expect(implicitEdges).toHaveLength(1);
    expect(implicitEdges[0]?.from).toBe('blk:text');
    expect(implicitEdges[0]?.to).toBe('ent:topic');
    expect(implicitEdges[0]?.type).toBe('about');
  });

  it('computes graph stats correctly', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:a type=Concept labels.en="A"
::

:: entity id=ent:b type=Concept labels.en="B"
::

:: rel id=rel:ab type=causes from=@ent:a to=@ent:b
::`;

    const doc = parse(src).document;
    const graph = extractGraph(doc);
    expect(graph.stats.entityCount).toBe(2);
    expect(graph.stats.relCount).toBe(1);
    expect(graph.stats.nodeCount).toBeGreaterThanOrEqual(2);
    expect(graph.stats.edgeCount).toBeGreaterThanOrEqual(1);
  });

  it('identifies isolated nodes', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:isolated type=Concept labels.en="Isolated"
::

:: entity id=ent:connected1 type=Concept labels.en="C1"
::

:: entity id=ent:connected2 type=Concept labels.en="C2"
::

:: rel id=rel:c1-c2 type=causes from=@ent:connected1 to=@ent:connected2
::`;

    const doc = parse(src).document;
    const graph = extractGraph(doc);
    // ent:isolated should be isolated
    expect(graph.stats.isolatedNodes).toBeGreaterThanOrEqual(1);
  });

  it('extracts multilingual labels', () => {
    const src = `${MINIMAL_META}

:: entity id=ent:newton type=Person labels.en="Isaac Newton" labels.ko="아이작 뉴턴"
::`;

    const doc = parse(src).document;
    const graph = extractGraph(doc);
    const newton = graph.nodes.find(n => n.id === 'ent:newton');
    expect(newton?.labels['en']).toBe('Isaac Newton');
    expect(newton?.labels['ko']).toBe('아이작 뉴턴');
  });
});

// ---------------------------------------------------------------------------
// Full round-trip: parse -> toJSON -> fromJSON -> serialize -> parse
// ---------------------------------------------------------------------------

describe('full round-trip fidelity', () => {
  const COMPLEX_DOC = `:: meta id=doc:physics title="Newton's Laws" created="2026-03-16"
@author: "physics-team"
@lang: "en"
@version: "2.0"
@domain: "physics.mechanics.classical"
@tags: ["physics", "newton"]
@ukdl_level: 5
::

:: entity id=ent:newton type=Person labels.en="Isaac Newton"
@born: "1643-01-04"
@same_as: ["https://www.wikidata.org/wiki/Q935"]

English mathematician, physicist, and astronomer.
::

:: entity id=ent:first-law type=Concept labels.en="First Law of Motion"
@aliases: ["Law of Inertia"]
::

:: rel id=rel:newton-first type=formulated from=@ent:newton to=@ent:first-law
@source: "Principia Mathematica, 1687"
::

:: quantum id=qst:level
@states: {novice: 0.4, intermediate: 0.4, expert: 0.2}
@observe_on: "assessment_done"
@default: "intermediate"
::

:: action id=act:assess agent=tutor trigger="start"
@tool: "quiz_gen"
@input: {topic: @ent:first-law, count: 5}
@timeout: 30000
::

:: pipeline id=pipe:learn
@goal: "maximize_comprehension"
@stages: [{name: "assess", action: @act:assess}, {name: "classify", quantum: @qst:level}]
::`;

  it('parse -> toJSON -> fromJSON produces same nodes', () => {
    const parsed = parse(COMPLEX_DOC);
    const json = toJSON(parsed.document);
    const restored = fromJSON(json);

    const originalIds = [...parsed.document.nodes.keys()].sort();
    const restoredIds = [...restored.nodes.keys()].sort();
    expect(restoredIds).toEqual(originalIds);
  });

  it('parse -> serialize -> parse produces semantically equivalent document', () => {
    const pass1 = parse(COMPLEX_DOC);
    const serialized = serialize(pass1.document);
    const pass2 = parse(serialized);

    const ids1 = [...pass1.document.nodes.keys()].sort();
    const ids2 = [...pass2.document.nodes.keys()].sort();
    expect(ids2).toEqual(ids1);

    // Check specific fields survive
    const newton1 = pass1.document.nodes.get('ent:newton');
    const newton2 = pass2.document.nodes.get('ent:newton');
    expect(newton2?.fields['born']).toBe(newton1?.fields['born']);
  });
});

// ---------------------------------------------------------------------------
// parseAndValidate convenience function
// ---------------------------------------------------------------------------

describe('parseAndValidate', () => {
  it('returns parse + validation results together', () => {
    const result = parseAndValidate(MINIMAL_META);
    expect(result.document).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(result.warnings).toBeDefined();
    expect(result.validationErrors).toBeDefined();
    expect(result.validationWarnings).toBeDefined();
    expect(result.valid).toBe(true);
  });

  it('marks invalid=false when there are errors', () => {
    const result = parseAndValidate('');
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Complete example from the spec appendix
// ---------------------------------------------------------------------------

describe('parse — Appendix A complete example', () => {
  const APPENDIX_A = `%% UKDL v2.0 — Newton's Laws: Adaptive Learning Module

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
@observe_on: "pre-assessment_complete"
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
**Newton's First Law** says: things that are still, stay still.

|elif: @qst:student-level == intermediate|
**Newton's First Law (Law of Inertia)**: An object at rest stays at rest.

|else|
**Newton's First Law** establishes inertial reference frames.
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
@guard: "@qst:student-level != uninitialized"
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
::`;

  it('parses the complete Appendix A example without errors', () => {
    const result = parse(APPENDIX_A);
    expect(result.errors).toHaveLength(0);
  });

  it('extracts all entity nodes', () => {
    const result = parse(APPENDIX_A);
    expect(result.document.nodes.has('ent:newton')).toBe(true);
    expect(result.document.nodes.has('ent:first-law')).toBe(true);
    expect(result.document.nodes.has('ent:second-law')).toBe(true);
    expect(result.document.nodes.has('ent:third-law')).toBe(true);
    expect(result.document.nodes.has('ent:force')).toBe(true);
  });

  it('extracts all rel edges', () => {
    const result = parse(APPENDIX_A);
    expect(result.document.edges).toHaveLength(4);
  });

  it('registers quantum variables', () => {
    const result = parse(APPENDIX_A);
    expect(result.document.quantum_state.variables).toContain('qst:student-level');
    expect(result.document.quantum_state.variables).toContain('qst:explanation-depth');
  });

  it('registers the pipeline', () => {
    const result = parse(APPENDIX_A);
    expect(result.document.pipelines).toContain('pipe:newton-learning');
  });

  it('registers meta node', () => {
    const result = parse(APPENDIX_A);
    expect(result.document.meta?.id).toBe('doc:newton-laws');
    expect(result.document.meta?.attrs['title']).toBe("Newton's Laws of Motion");
    expect(result.document.meta?.fields['lang']).toBe('en');
    expect(result.document.meta?.fields['ukdl_level']).toBe(5);
  });

  it('extracts knowledge graph with correct stats', () => {
    const result = parse(APPENDIX_A);
    const graph = extractGraph(result.document);
    expect(graph.stats.entityCount).toBe(5);
    expect(graph.stats.relCount).toBe(4);
    expect(graph.stats.edgeCount).toBeGreaterThan(4); // includes implicit edges
  });

  it('validates the full example with only warnings (no hard errors)', () => {
    const result = parse(APPENDIX_A);
    const valResult = validate(result.document);
    expect(valResult.errors).toHaveLength(0);
  });
});
