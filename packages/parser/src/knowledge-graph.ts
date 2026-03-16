/**
 * UKDL Knowledge Graph Extractor
 *
 * Converts a UKDLDocument into a queryable graph structure suitable for
 * analysis, export to Neo4j/Cypher, RDF/Turtle, JSON-LD, etc.
 */

import type {
  UKDLDocument,
  UKDLNode,
  UKDLValue,
  UKDLReference,
} from './types.js';

// ---------------------------------------------------------------------------
// Graph types
// ---------------------------------------------------------------------------

export interface GraphNode {
  id: string;
  kind: string;
  type: string | null;
  labels: Record<string, string>;
  fields: Record<string, UKDLValue>;
  attrs: Record<string, UKDLValue>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  attrs: Record<string, UKDLValue>;
  /** true if derived from an about= attribute, false if from a rel node */
  implicit: boolean;
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  explicitEdges: number;
  implicitEdges: number;
  entityCount: number;
  relCount: number;
  connectedComponents: number;
  isolatedNodes: number;
  /** Average out-degree */
  avgDegree: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function refKey(val: UKDLValue): string | null {
  if (!val) return null;
  if (typeof val === 'string') {
    // Bare "prefix:name" strings from attrs
    if (/^[a-zA-Z_][a-zA-Z0-9_-]*:[a-zA-Z0-9_.-]+$/.test(val)) return val;
    return null;
  }
  if (typeof val === 'object' && !Array.isArray(val) && val !== null && 'key' in val) {
    return (val as UKDLReference).key;
  }
  return null;
}

function extractLabels(node: UKDLNode): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k.startsWith('labels.') && typeof v === 'string') {
      const lang = k.slice('labels.'.length);
      labels[lang] = v;
    }
  }
  return labels;
}

function getType(node: UKDLNode): string | null {
  const v = node.attrs['type'] ?? node.fields['type'];
  return typeof v === 'string' ? v : null;
}

// ---------------------------------------------------------------------------
// Connected component counting (Union-Find)
// ---------------------------------------------------------------------------

class UnionFind {
  private parent: Map<string, string> = new Map();

  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    const p = this.parent.get(x)!;
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return x;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }

  components(ids: string[]): number {
    const roots = new Set<string>();
    for (const id of ids) roots.add(this.find(id));
    return roots.size;
  }
}

// ---------------------------------------------------------------------------
// Main extraction function
// ---------------------------------------------------------------------------

export function extractGraph(document: UKDLDocument): KnowledgeGraph {
  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];

  // Extract entity (and block) nodes as graph nodes
  for (const [id, node] of document.nodes) {
    if (node.kind === 'meta' || node.kind === 'schema' || node.kind === 'include') continue;

    graphNodes.push({
      id,
      kind: node.kind,
      type: getType(node),
      labels: extractLabels(node),
      fields: { ...node.fields },
      attrs: { ...node.attrs },
    });
  }

  // Extract explicit rel-derived edges from document.edges
  for (const edge of document.edges) {
    graphEdges.push({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      attrs: { ...edge.attrs },
      implicit: false,
    });
  }

  // Extract implicit edges from about= attributes
  for (const [id, node] of document.nodes) {
    const aboutVal = node.attrs['about'] ?? node.fields['about'];
    if (!aboutVal) continue;

    const targets = Array.isArray(aboutVal) ? aboutVal : [aboutVal];
    for (const target of targets) {
      const targetKey = refKey(target);
      if (!targetKey) continue;

      graphEdges.push({
        id: `_implicit_${id}_about_${targetKey}`,
        from: id,
        to: targetKey,
        type: 'about',
        attrs: {},
        implicit: true,
      });
    }
  }

  // Compute stats
  const nodeIds = graphNodes.map(n => n.id);
  const uf = new UnionFind();
  const outDegree = new Map<string, number>();

  for (const id of nodeIds) outDegree.set(id, 0);

  for (const edge of graphEdges) {
    uf.union(edge.from, edge.to);
    outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1);
  }

  const connectedComponents = uf.components(nodeIds);
  const isolatedNodes = nodeIds.filter(id => {
    return !graphEdges.some(e => e.from === id || e.to === id);
  }).length;

  const totalDegree = [...outDegree.values()].reduce((a, b) => a + b, 0);
  const avgDegree = nodeIds.length > 0 ? totalDegree / nodeIds.length : 0;

  const explicitEdges = graphEdges.filter(e => !e.implicit).length;
  const implicitEdges = graphEdges.filter(e => e.implicit).length;

  const stats: GraphStats = {
    nodeCount: graphNodes.length,
    edgeCount: graphEdges.length,
    explicitEdges,
    implicitEdges,
    entityCount: graphNodes.filter(n => n.kind === 'entity').length,
    relCount: graphEdges.filter(e => !e.implicit).length,
    connectedComponents,
    isolatedNodes,
    avgDegree,
  };

  return { nodes: graphNodes, edges: graphEdges, stats };
}
