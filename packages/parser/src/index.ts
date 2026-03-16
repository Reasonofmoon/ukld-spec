/**
 * @ukdl/parser — Public API
 * Reference parser for UKDL (Unified Knowledge & Dynamics Language) v2.0
 */

export { parse } from './parser.js';
export { validate } from './validator.js';
export { toJSON, fromJSON } from './json-mapper.js';
export type { CanonicalJSON, CanonicalNode, CanonicalEdge, CanonicalQuantumState, CanonicalContextTree } from './json-mapper.js';
export { serialize, serializeValue } from './serializer.js';
export { optimizeContext } from './context-optimizer.js';
export { extractGraph } from './knowledge-graph.js';
export type { GraphNode, GraphEdge, GraphStats, KnowledgeGraph } from './knowledge-graph.js';
export { tokenize } from './lexer.js';
export { parseValue, parseReference, resolveReferences } from './parser.js';
export type { Token } from './lexer.js';
export { TokenType } from './lexer.js';

export * from './types.js';

// ---------------------------------------------------------------------------
// Convenience function
// ---------------------------------------------------------------------------

import { parse } from './parser.js';
import { validate } from './validator.js';
import type { ParseResult, ValidationError } from './types.js';

export interface ParseAndValidateResult extends ParseResult {
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];
  valid: boolean;
}

/**
 * Parse and validate a UKDL source string in one step.
 * Returns parse errors, parse warnings, validation errors, and validation
 * warnings all together alongside the (normalised) document.
 */
export function parseAndValidate(source: string): ParseAndValidateResult {
  const parseResult = parse(source);
  const valResult = validate(parseResult.document);

  return {
    document: valResult.document,
    errors: parseResult.errors,
    warnings: parseResult.warnings,
    validationErrors: valResult.errors,
    validationWarnings: valResult.warnings,
    valid: parseResult.errors.length === 0 && valResult.valid,
  };
}
