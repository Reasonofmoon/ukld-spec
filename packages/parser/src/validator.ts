/**
 * UKDL Validator
 *
 * Performs semantic validation on a parsed UKDLDocument:
 *  - Required attributes/fields per kind
 *  - Quantum probability sums (with auto-normalisation)
 *  - Entanglement matrix rows
 *  - Circular depends_on chains
 *  - Pipeline stage reference resolution
 *  - Schema constraints
 */

import type {
  UKDLDocument,
  UKDLNode,
  UKDLValue,
  UKDLReference,
  ValidationResult,
  ValidationError,
  UKDLEdge,
  UKDLQuantumState,
  UKDLEntanglement,
} from './types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function refKey(val: UKDLValue): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && !Array.isArray(val) && val !== null && 'key' in val) {
    return (val as UKDLReference).key;
  }
  return null;
}

function getStringField(node: UKDLNode, key: string): string | null {
  const v = node.fields[key] ?? node.attrs[key];
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  return null;
}

function getField(node: UKDLNode, key: string): UKDLValue | undefined {
  return node.fields[key] ?? node.attrs[key];
}

// ---------------------------------------------------------------------------
// Kind-specific required attribute / field tables
// ---------------------------------------------------------------------------

const REQUIRED_ATTRS: Partial<Record<string, string[]>> = {
  rel: ['from', 'to', 'type'],
  action: ['agent', 'trigger'],
};

const REQUIRED_FIELDS: Partial<Record<string, string[]>> = {
  meta: ['author', 'lang', 'version'],
  action: ['tool'],
  quantum: ['states', 'observe_on'],
};

// ---------------------------------------------------------------------------
// Circular dependency detection
// ---------------------------------------------------------------------------

function detectCircularDeps(
  nodes: ReadonlyMap<string, UKDLNode>,
): string[] {
  // Build adjacency list for depends_on
  const graph = new Map<string, string[]>();
  for (const [id, node] of nodes) {
    if (node.kind === 'action') {
      const depsVal = node.fields['depends_on'] ?? node.attrs['depends_on'];
      if (!depsVal) { graph.set(id, []); continue; }
      const deps: string[] = [];
      if (Array.isArray(depsVal)) {
        for (const v of depsVal) {
          const k = refKey(v);
          if (k) deps.push(k);
        }
      } else {
        const k = refKey(depsVal);
        if (k) deps.push(k);
      }
      graph.set(id, deps);
    }
  }

  const cycles: string[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string): boolean {
    if (inStack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);
    for (const dep of (graph.get(id) ?? [])) {
      if (dfs(dep)) {
        cycles.push(`${id} -> ${dep}`);
      }
    }
    inStack.delete(id);
    return false;
  }

  for (const id of graph.keys()) {
    if (!visited.has(id)) dfs(id);
  }

  return cycles;
}

// ---------------------------------------------------------------------------
// Quantum probability validation + normalisation
// ---------------------------------------------------------------------------

interface NormalisedStates {
  states: Record<string, number>;
  wasNormalised: boolean;
}

function normaliseStates(statesVal: UKDLValue): NormalisedStates | null {
  if (!statesVal || typeof statesVal !== 'object' || Array.isArray(statesVal)) return null;
  const raw = statesVal as Record<string, UKDLValue>;
  const states: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'number') states[k] = v;
  }
  const sum = Object.values(states).reduce((a, b) => a + b, 0);
  if (sum === 0) return { states, wasNormalised: false };
  const epsilon = 1e-9;
  const wasNormalised = Math.abs(sum - 1.0) > epsilon;
  if (wasNormalised) {
    for (const k of Object.keys(states)) {
      (states as Record<string, number>)[k] = (states[k] ?? 0) / sum;
    }
  }
  return { states, wasNormalised };
}

function validateEntanglementMatrix(
  nodeId: string,
  statesVal: UKDLValue,
  matrixVal: UKDLValue,
  errors: ValidationError[],
): void {
  if (!statesVal || typeof statesVal !== 'object' || Array.isArray(statesVal)) return;
  if (!matrixVal || typeof matrixVal !== 'object' || Array.isArray(matrixVal)) return;

  const states = Object.keys(statesVal as Record<string, UKDLValue>);
  const matrix = matrixVal as Record<string, UKDLValue>;

  // Group matrix keys by the source state (prefix before '-')
  const rowSums = new Map<string, number>();
  for (const [k, v] of Object.entries(matrix)) {
    if (typeof v !== 'number') continue;
    const dashIdx = k.indexOf('-');
    if (dashIdx === -1) continue;
    const fromState = k.slice(0, dashIdx);
    rowSums.set(fromState, (rowSums.get(fromState) ?? 0) + v);
  }

  const epsilon = 1e-6;
  for (const [state, sum] of rowSums) {
    if (Math.abs(sum - 1.0) > epsilon) {
      errors.push({
        nodeId,
        message: `Entanglement matrix row '${state}' sums to ${sum.toFixed(6)}, expected 1.0`,
        severity: 'warning',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Main validate function
// ---------------------------------------------------------------------------

export function validate(document: UKDLDocument): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Track mutated quantum states for the normalised document
  const normalisedNodes = new Map<string, UKDLNode>(document.nodes as Map<string, UKDLNode>);

  // 1. Meta node existence and order
  if (!document.meta) {
    errors.push({ nodeId: '_document', message: 'Document is missing a meta node', severity: 'error' });
  }

  // 2. Per-node validation
  let firstNode = true;
  for (const [id, node] of document.nodes) {
    // Meta must be first
    if (firstNode && node.kind !== 'meta') {
      warnings.push({ nodeId: id, message: 'First node is not a meta node', severity: 'warning' });
    }
    firstNode = false;

    // Required attributes
    const reqAttrs = REQUIRED_ATTRS[node.kind] ?? [];
    for (const attr of reqAttrs) {
      const val = node.attrs[attr] ?? node.fields[attr];
      if (val === undefined || val === null || val === '') {
        errors.push({ nodeId: id, message: `Missing required attribute '${attr}' on ${node.kind} node`, severity: 'error' });
      }
    }

    // Required fields
    const reqFields = REQUIRED_FIELDS[node.kind] ?? [];
    for (const field of reqFields) {
      const val = node.fields[field] ?? node.attrs[field];
      if (val === undefined || val === null || val === '') {
        errors.push({ nodeId: id, message: `Missing required field '@${field}' on ${node.kind} node`, severity: 'error' });
      }
    }

    // Quantum-specific
    if (node.kind === 'quantum') {
      const statesVal: UKDLValue = node.fields['states'] ?? node.attrs['states'] ?? null;
      const result = normaliseStates(statesVal);

      if (result) {
        if (result.wasNormalised) {
          warnings.push({
            nodeId: id,
            message: `Quantum states for '${id}' do not sum to 1.0 — auto-normalised`,
            severity: 'warning',
          });
          // Patch the node with normalised states
          const patched: UKDLNode = {
            ...node,
            fields: { ...node.fields, states: result.states as unknown as UKDLValue },
          };
          normalisedNodes.set(id, patched);
        }

        const matrixVal: UKDLValue = node.fields['entangle_matrix'] ?? node.attrs['entangle_matrix'] ?? null;
        if (matrixVal) {
          validateEntanglementMatrix(id, statesVal, matrixVal, warnings);
        }
      }
    }

    // Rel: from/to must reference real nodes
    if (node.kind === 'rel') {
      const fromVal: UKDLValue = node.attrs['from'] ?? node.fields['from'] ?? null;
      const toVal: UKDLValue = node.attrs['to'] ?? node.fields['to'] ?? null;
      const fromKey = refKey(fromVal);
      const toKey = refKey(toVal);
      if (fromKey && !document.nodes.has(fromKey)) {
        warnings.push({ nodeId: id, message: `rel 'from' references unknown node '${fromKey}'`, severity: 'warning' });
      }
      if (toKey && !document.nodes.has(toKey)) {
        warnings.push({ nodeId: id, message: `rel 'to' references unknown node '${toKey}'`, severity: 'warning' });
      }
    }

    // Pipeline stages reference validation
    if (node.kind === 'pipeline') {
      const stagesVal = node.fields['stages'] ?? node.attrs['stages'];
      if (Array.isArray(stagesVal)) {
        for (const stage of stagesVal) {
          if (typeof stage !== 'object' || stage === null || Array.isArray(stage)) continue;
          const stageObj = stage as Record<string, UKDLValue>;
          for (const stageKey of ['action', 'quantum', 'block'] as const) {
            const ref = stageObj[stageKey];
            if (ref) {
              const key = refKey(ref);
              if (key && !document.nodes.has(key)) {
                warnings.push({
                  nodeId: id,
                  message: `Pipeline stage '${stageKey}' references unknown node '${key}'`,
                  severity: 'warning',
                });
              }
            }
          }
        }
      }
    }
  }

  // 3. Circular depends_on
  const cycles = detectCircularDeps(document.nodes as Map<string, UKDLNode>);
  for (const cycle of cycles) {
    errors.push({ nodeId: '_actions', message: `Circular depends_on detected: ${cycle}`, severity: 'error' });
  }

  // 4. Schema validation against schema nodes
  for (const [id, node] of document.nodes) {
    if (node.kind !== 'schema') continue;
    const appliesToVal = node.fields['applies_to'] ?? node.attrs['applies_to'];
    const requiredFieldsVal = node.fields['required_fields'] ?? node.attrs['required_fields'];

    if (!appliesToVal || typeof appliesToVal !== 'object' || Array.isArray(appliesToVal)) continue;
    const appliesTo = appliesToVal as Record<string, UKDLValue>;
    const schemaKind = appliesTo['kind'];
    const schemaType = appliesTo['type'];

    const reqFieldsList: string[] = [];
    if (Array.isArray(requiredFieldsVal)) {
      for (const f of requiredFieldsVal) {
        if (typeof f === 'string') reqFieldsList.push(f);
      }
    }

    // Find matching nodes
    for (const [targetId, targetNode] of document.nodes) {
      if (targetNode.kind === 'schema') continue;
      const matchesKind = !schemaKind || schemaKind === targetNode.kind;
      const targetType = targetNode.attrs['type'] ?? targetNode.fields['type'];
      const matchesType = !schemaType || schemaType === targetType;
      if (!matchesKind || !matchesType) continue;

      for (const reqField of reqFieldsList) {
        const val = targetNode.fields[reqField] ?? targetNode.attrs[reqField];
        if (val === undefined || val === null) {
          warnings.push({
            nodeId: targetId,
            message: `Schema '${id}' requires field '@${reqField}' on ${targetNode.kind}(type=${String(targetType)}) nodes`,
            severity: 'warning',
          });
        }
      }
    }
  }

  // Rebuild document with normalised nodes
  const normalisedDoc: UKDLDocument = {
    ...document,
    nodes: normalisedNodes,
    meta: normalisedNodes.get(document.meta?.id ?? '') as typeof document.meta ?? document.meta,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    document: normalisedDoc,
  };
}
