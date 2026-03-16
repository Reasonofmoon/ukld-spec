/**
 * UKDL AST Type Definitions
 * Unified Knowledge & Dynamics Language v2.0
 */

// ---------------------------------------------------------------------------
// Primitive value types
// ---------------------------------------------------------------------------

/** A reference to another UKDL node */
export interface UKDLReference {
  readonly prefix: string;
  readonly name: string;
  readonly display?: string;
  /** Full key: prefix:name */
  readonly key: string;
}

/** All possible field / attribute values */
export type UKDLValue =
  | string
  | number
  | boolean
  | null
  | UKDLReference
  | UKDLValue[]
  | { [key: string]: UKDLValue };

// ---------------------------------------------------------------------------
// Directive types
// ---------------------------------------------------------------------------

export interface UKDLConditionalBranch {
  /** null means this is the |else| branch */
  readonly condition: string | null;
  readonly body: string;
}

export interface UKDLConditional {
  readonly type: 'conditional';
  readonly condition: string;
  readonly branches: UKDLConditionalBranch[];
}

export interface UKDLLoop {
  readonly type: 'loop';
  readonly variable: string;
  readonly iterable: string;
  readonly body: string;
}

export interface UKDLMultimodalEntry {
  readonly modality: string;
  readonly content: string;
}

export interface UKDLMultimodal {
  readonly type: 'multimodal';
  readonly entries: UKDLMultimodalEntry[];
}

export interface UKDLFunctionDef {
  readonly type: 'function';
  readonly name: string;
  readonly params: string[];
  readonly body: string;
}

export type UKDLDirective =
  | UKDLConditional
  | UKDLLoop
  | UKDLMultimodal
  | UKDLFunctionDef;

// ---------------------------------------------------------------------------
// Node kinds
// ---------------------------------------------------------------------------

export type UKDLKind =
  | 'meta'
  | 'block'
  | 'entity'
  | 'rel'
  | 'schema'
  | 'include'
  | 'context'
  | 'action'
  | 'quantum'
  | 'pipeline';

export const STANDARD_KINDS: ReadonlySet<string> = new Set<UKDLKind>([
  'meta',
  'block',
  'entity',
  'rel',
  'schema',
  'include',
  'context',
  'action',
  'quantum',
  'pipeline',
]);

// ---------------------------------------------------------------------------
// Generic node (covers all kinds)
// ---------------------------------------------------------------------------

export interface UKDLNode {
  readonly kind: UKDLKind;
  /** Full id including prefix, e.g. "ent:newton" */
  readonly id: string;
  readonly prefix: string;
  readonly name: string;
  /** Header attributes from the :: line */
  readonly attrs: Record<string, UKDLValue>;
  /** @key: value fields */
  readonly fields: Record<string, UKDLValue>;
  /** Free-form body (Markdown) text */
  readonly body: string;
  /** Inline directives found in the body */
  readonly directives: UKDLDirective[];
  /** Source location */
  readonly loc: SourceLocation;
}

export interface SourceLocation {
  readonly startLine: number;
  readonly endLine: number;
}

// ---------------------------------------------------------------------------
// Typed node aliases for the 10 standard kinds
// (all are UKDLNode with a narrowed kind discriminant)
// ---------------------------------------------------------------------------

export interface UKDLMeta extends UKDLNode {
  readonly kind: 'meta';
}

export interface UKDLBlock extends UKDLNode {
  readonly kind: 'block';
}

export interface UKDLEntity extends UKDLNode {
  readonly kind: 'entity';
}

export interface UKDLRel extends UKDLNode {
  readonly kind: 'rel';
}

export interface UKDLSchema extends UKDLNode {
  readonly kind: 'schema';
}

export interface UKDLInclude extends UKDLNode {
  readonly kind: 'include';
}

export interface UKDLContext extends UKDLNode {
  readonly kind: 'context';
}

export interface UKDLAction extends UKDLNode {
  readonly kind: 'action';
}

export interface UKDLQuantum extends UKDLNode {
  readonly kind: 'quantum';
}

export interface UKDLPipeline extends UKDLNode {
  readonly kind: 'pipeline';
}

// ---------------------------------------------------------------------------
// Knowledge-graph edge (from rel nodes)
// ---------------------------------------------------------------------------

export interface UKDLEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly type: string;
  readonly attrs: Record<string, UKDLValue>;
}

// ---------------------------------------------------------------------------
// Quantum state snapshot
// ---------------------------------------------------------------------------

export interface UKDLEntanglement {
  readonly a: string;
  readonly b: string;
  readonly matrix: Record<string, number>;
}

export interface UKDLQuantumState {
  readonly variables: string[];
  readonly entanglements: UKDLEntanglement[];
  readonly current_observations: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Top-level document
// ---------------------------------------------------------------------------

export interface UKDLDocument {
  /** The meta node – present after successful parse */
  readonly meta: UKDLMeta | null;
  /** All nodes keyed by their full id (e.g. "ent:newton") */
  readonly nodes: ReadonlyMap<string, UKDLNode>;
  /** All rel-derived edges */
  readonly edges: UKDLEdge[];
  /** Aggregated quantum state */
  readonly quantum_state: UKDLQuantumState;
  /** Pipeline node ids in document order */
  readonly pipelines: string[];
  /** Context tree metadata */
  readonly context_tree: UKDLContextTree;
}

export interface UKDLContextTree {
  readonly current_phase: ContextPhase;
  readonly node_priorities: Record<string, string>;
}

export type ContextPhase = 'full' | 'summary' | 'priority' | 'skeleton' | 'quantum';

// ---------------------------------------------------------------------------
// Parse result
// ---------------------------------------------------------------------------

export interface ParseError {
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly severity: 'error';
}

export interface ParseWarning {
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly severity: 'warning';
}

export type ParseDiagnostic = ParseError | ParseWarning;

export interface ParseResult {
  readonly document: UKDLDocument;
  readonly errors: ParseError[];
  readonly warnings: ParseWarning[];
}

// ---------------------------------------------------------------------------
// Validation result
// ---------------------------------------------------------------------------

export interface ValidationError {
  readonly nodeId: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationError[];
  /** Normalised document (probabilities auto-normalised, etc.) */
  readonly document: UKDLDocument;
}
