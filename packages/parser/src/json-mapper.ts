/**
 * UKDL <-> JSON canonical mapping
 *
 * Every valid UKDL document has a unique canonical JSON representation
 * as specified in §7 of the UKDL v2.0 Standard.
 */

import type {
  UKDLDocument,
  UKDLNode,
  UKDLValue,
  UKDLReference,
  UKDLMeta,
  UKDLEdge,
  UKDLQuantumState,
  UKDLEntanglement,
  UKDLContextTree,
  UKDLDirective,
} from './types.js';
import { STANDARD_KINDS } from './types.js';

// ---------------------------------------------------------------------------
// toJSON — convert UKDLDocument to canonical JSON object
// ---------------------------------------------------------------------------

export interface CanonicalJSON {
  $schema: string;
  ukdl_version: string;
  doc: Record<string, UKDLValue>;
  nodes: Record<string, CanonicalNode>;
  edges: CanonicalEdge[];
  quantum_state: CanonicalQuantumState;
  pipelines: string[];
  context_tree: CanonicalContextTree;
}

export interface CanonicalNode {
  kind: string;
  attrs: Record<string, UKDLValue>;
  fields: Record<string, UKDLValue>;
  body: string;
  directives: UKDLDirective[];
}

export interface CanonicalEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  attrs: Record<string, UKDLValue>;
}

export interface CanonicalQuantumState {
  variables: string[];
  entanglements: Array<{ a: string; b: string; matrix: Record<string, number> }>;
  current_observations: Record<string, string>;
}

export interface CanonicalContextTree {
  current_phase: string;
  node_priorities: Record<string, string>;
}

export function toJSON(document: UKDLDocument): CanonicalJSON {
  // Build doc metadata from meta node
  const docMeta: Record<string, UKDLValue> = {};
  if (document.meta) {
    docMeta['id'] = document.meta.id;
    // Copy all header attrs and fields into doc
    for (const [k, v] of Object.entries(document.meta.attrs)) {
      if (k !== 'id') docMeta[k] = v;
    }
    for (const [k, v] of Object.entries(document.meta.fields)) {
      docMeta[k] = v;
    }
  }

  // Serialise all nodes
  const nodesObj: Record<string, CanonicalNode> = {};
  for (const [id, node] of document.nodes) {
    nodesObj[id] = {
      kind: node.kind,
      attrs: { ...node.attrs },
      fields: { ...node.fields },
      body: node.body,
      directives: [...node.directives],
    };
  }

  // Edges
  const edges: CanonicalEdge[] = document.edges.map(e => ({
    id: e.id,
    from: e.from,
    to: e.to,
    type: e.type,
    attrs: { ...e.attrs },
  }));

  // Quantum state
  const quantum_state: CanonicalQuantumState = {
    variables: [...document.quantum_state.variables],
    entanglements: document.quantum_state.entanglements.map(ent => ({
      a: ent.a,
      b: ent.b,
      matrix: { ...ent.matrix },
    })),
    current_observations: { ...document.quantum_state.current_observations },
  };

  return {
    $schema: 'https://ukdl.org/schema/v2.0.json',
    ukdl_version: '2.0',
    doc: docMeta,
    nodes: nodesObj,
    edges,
    quantum_state,
    pipelines: [...document.pipelines],
    context_tree: {
      current_phase: document.context_tree.current_phase,
      node_priorities: { ...document.context_tree.node_priorities },
    },
  };
}

// ---------------------------------------------------------------------------
// fromJSON — parse canonical JSON back to UKDLDocument
// ---------------------------------------------------------------------------

type UnknownRecord = Record<string, unknown>;

function isObject(val: unknown): val is UnknownRecord {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function castValue(val: unknown): UKDLValue {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) return val.map(castValue);
  if (isObject(val)) {
    // Check if it looks like a reference
    if ('prefix' in val && 'name' in val && 'key' in val) {
      return val as unknown as UKDLReference;
    }
    const obj: Record<string, UKDLValue> = {};
    for (const [k, v] of Object.entries(val)) {
      obj[k] = castValue(v);
    }
    return obj;
  }
  return String(val);
}

function castRecord(raw: unknown): Record<string, UKDLValue> {
  if (!isObject(raw)) return {};
  const result: Record<string, UKDLValue> = {};
  for (const [k, v] of Object.entries(raw)) {
    result[k] = castValue(v);
  }
  return result;
}

export function fromJSON(json: object): UKDLDocument {
  const j = json as UnknownRecord;

  const nodesRaw = isObject(j['nodes']) ? (j['nodes'] as UnknownRecord) : {};
  const nodesMap = new Map<string, UKDLNode>();

  for (const [id, rawNode] of Object.entries(nodesRaw)) {
    if (!isObject(rawNode)) continue;
    const rn = rawNode as UnknownRecord;
    const kind = typeof rn['kind'] === 'string' ? rn['kind'] : 'block';
    const colonIdx = id.indexOf(':');
    const prefix = colonIdx !== -1 ? id.slice(0, colonIdx) : '';
    const name = colonIdx !== -1 ? id.slice(colonIdx + 1) : id;

    const attrs = castRecord(rn['attrs']);
    const fields = castRecord(rn['fields']);
    const body = typeof rn['body'] === 'string' ? rn['body'] : '';

    // Directives — just cast them back as-is
    const directivesRaw = Array.isArray(rn['directives']) ? rn['directives'] : [];
    const directives = directivesRaw as UKDLDirective[];

    nodesMap.set(id, {
      kind: (STANDARD_KINDS.has(kind) ? kind : 'block') as UKDLNode['kind'],
      id,
      prefix,
      name,
      attrs,
      fields,
      body,
      directives,
      loc: { startLine: 0, endLine: 0 },
    });
  }

  // Edges
  const edgesRaw = Array.isArray(j['edges']) ? j['edges'] : [];
  const edges: UKDLEdge[] = edgesRaw.map((e) => {
    if (!isObject(e)) return null;
    const er = e as UnknownRecord;
    return {
      id: typeof er['id'] === 'string' ? er['id'] : '',
      from: typeof er['from'] === 'string' ? er['from'] : '',
      to: typeof er['to'] === 'string' ? er['to'] : '',
      type: typeof er['type'] === 'string' ? er['type'] : '',
      attrs: castRecord(er['attrs']),
    };
  }).filter((e): e is UKDLEdge => e !== null);

  // Quantum state
  const qsRaw = isObject(j['quantum_state']) ? j['quantum_state'] as UnknownRecord : {};
  const variables = Array.isArray(qsRaw['variables'])
    ? (qsRaw['variables'] as unknown[]).filter((v): v is string => typeof v === 'string')
    : [];
  const entanglementsRaw = Array.isArray(qsRaw['entanglements']) ? qsRaw['entanglements'] : [];
  const entanglements: UKDLEntanglement[] = entanglementsRaw.map((ent) => {
    if (!isObject(ent)) return null;
    const er = ent as UnknownRecord;
    const matrix: Record<string, number> = {};
    if (isObject(er['matrix'])) {
      for (const [k, v] of Object.entries(er['matrix'] as UnknownRecord)) {
        if (typeof v === 'number') matrix[k] = v;
      }
    }
    return {
      a: typeof er['a'] === 'string' ? er['a'] : '',
      b: typeof er['b'] === 'string' ? er['b'] : '',
      matrix,
    };
  }).filter((e): e is UKDLEntanglement => e !== null);

  const current_observations = castRecord(qsRaw['current_observations']) as Record<string, string>;

  const quantum_state: UKDLQuantumState = { variables, entanglements, current_observations };

  // Pipelines
  const pipelinesRaw = Array.isArray(j['pipelines']) ? j['pipelines'] : [];
  const pipelines = pipelinesRaw.filter((p): p is string => typeof p === 'string');

  // Context tree
  const ctRaw = isObject(j['context_tree']) ? j['context_tree'] as UnknownRecord : {};
  const current_phase = typeof ctRaw['current_phase'] === 'string'
    ? ctRaw['current_phase'] as UKDLDocument['context_tree']['current_phase']
    : 'full';
  const node_priorities = castRecord(ctRaw['node_priorities']) as Record<string, string>;
  const context_tree: UKDLContextTree = { current_phase, node_priorities };

  // Meta
  const meta = nodesMap.get(nodesMap.keys().next().value ?? '') ?? null;
  const metaNode = meta?.kind === 'meta' ? meta as UKDLMeta : (() => {
    for (const n of nodesMap.values()) {
      if (n.kind === 'meta') return n as UKDLMeta;
    }
    return null;
  })();

  return {
    meta: metaNode,
    nodes: nodesMap,
    edges,
    quantum_state,
    pipelines,
    context_tree,
  };
}
