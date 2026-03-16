/**
 * UKDL Context Optimizer
 *
 * Implements the 5 context phases defined in §3.6 of the UKDL v2.0 Standard.
 *
 * Phases (progressive degradation as token budget decreases):
 *   full     — return document as-is
 *   summary  — replace collapse=true nodes with their @summary
 *   priority — only include critical/high priority nodes
 *   skeleton — only entity/rel/meta nodes, no bodies
 *   quantum  — only active quantum branch content
 */

import type {
  UKDLDocument,
  UKDLNode,
  ContextPhase,
  UKDLValue,
} from './types.js';

// ---------------------------------------------------------------------------
// Priority ordering
// ---------------------------------------------------------------------------

const PRIORITY_RANK: Record<string, number> = {
  critical: 5,
  high: 4,
  normal: 3,
  low: 2,
  archive: 1,
};

function getPriorityRank(node: UKDLNode): number {
  const priorityVal = node.attrs['priority'] ?? node.fields['priority'];
  if (typeof priorityVal === 'string') {
    return PRIORITY_RANK[priorityVal] ?? 3;
  }
  return 3; // default: normal
}

function isCollapsed(node: UKDLNode): boolean {
  const collapseVal = node.attrs['collapse'] ?? node.fields['collapse'];
  return collapseVal === true || collapseVal === 'true';
}

function getSummary(node: UKDLNode): string {
  const summaryVal = node.fields['summary'] ?? node.attrs['summary'];
  if (typeof summaryVal === 'string') return summaryVal;
  return '';
}

// ---------------------------------------------------------------------------
// Phase implementations
// ---------------------------------------------------------------------------

function phaseFull(document: UKDLDocument): UKDLDocument {
  return document;
}

function phaseSummary(document: UKDLDocument): UKDLDocument {
  const newNodes = new Map<string, UKDLNode>(document.nodes as Map<string, UKDLNode>);

  for (const [id, node] of document.nodes) {
    if (isCollapsed(node)) {
      const summary = getSummary(node);
      const collapsed: UKDLNode = {
        ...node,
        body: summary ? `[Collapsed] ${summary}` : '[Collapsed]',
        directives: [],
      };
      newNodes.set(id, collapsed);
    }
  }

  return { ...document, nodes: newNodes };
}

function phasePriority(document: UKDLDocument): UKDLDocument {
  const newNodes = new Map<string, UKDLNode>();

  for (const [id, node] of document.nodes) {
    // Always keep meta
    if (node.kind === 'meta') {
      newNodes.set(id, node);
      continue;
    }
    const rank = getPriorityRank(node);
    if (rank >= PRIORITY_RANK['high']!) { // critical or high
      newNodes.set(id, node);
    }
  }

  // Rebuild edges to only include those between retained nodes
  const retainedIds = new Set(newNodes.keys());
  const edges = document.edges.filter(e => retainedIds.has(e.from) && retainedIds.has(e.to));

  return { ...document, nodes: newNodes, edges };
}

function phaseSkeleton(document: UKDLDocument): UKDLDocument {
  const newNodes = new Map<string, UKDLNode>();

  for (const [id, node] of document.nodes) {
    if (node.kind === 'meta' || node.kind === 'entity' || node.kind === 'rel') {
      // Keep but strip body
      const stripped: UKDLNode = { ...node, body: '', directives: [] };
      newNodes.set(id, stripped);
    }
  }

  return { ...document, nodes: newNodes };
}

function phaseQuantum(
  document: UKDLDocument,
  observations?: Record<string, string>,
): UKDLDocument {
  const obs = observations ?? document.quantum_state.current_observations;

  if (Object.keys(obs).length === 0) {
    // No observations — fall back to skeleton
    return phaseSkeleton(document);
  }

  const newNodes = new Map<string, UKDLNode>();

  for (const [id, node] of document.nodes) {
    // Always include meta/entity/rel/quantum
    if (
      node.kind === 'meta' ||
      node.kind === 'entity' ||
      node.kind === 'rel' ||
      node.kind === 'quantum'
    ) {
      newNodes.set(id, node);
      continue;
    }

    // For nodes with conditional directives, filter branches
    if (node.directives.length > 0) {
      const filteredDirectives = node.directives.map(d => {
        if (d.type !== 'conditional') return d;
        // Try to select the matching branch
        for (const branch of d.branches) {
          if (branch.condition === null) {
            // else branch — include
            return { ...d, branches: [branch] };
          }
          // Simple evaluation: @qst:x == state
          const conditionResult = evaluateSimpleCondition(branch.condition, obs);
          if (conditionResult) {
            return { ...d, branches: [branch] };
          }
        }
        return d;
      });

      newNodes.set(id, { ...node, directives: filteredDirectives });
      continue;
    }

    newNodes.set(id, node);
  }

  return {
    ...document,
    nodes: newNodes,
    context_tree: { ...document.context_tree, current_phase: 'quantum' },
    quantum_state: {
      ...document.quantum_state,
      current_observations: obs,
    },
  };
}

/**
 * Very simple single-comparison expression evaluator for quantum branch selection.
 * Only handles: @qst:var == value, @qst:var != value
 */
function evaluateSimpleCondition(
  condition: string,
  observations: Record<string, string>,
): boolean {
  // Match patterns like: @qst:varname == value or @prefix:name == value
  const eqMatch = condition.trim().match(/^@([a-zA-Z_][a-zA-Z0-9_-]*):([a-zA-Z0-9_-]+)\s*==\s*(.+)$/);
  if (eqMatch) {
    const key = `${eqMatch[1]}:${eqMatch[2]}`;
    const expectedRaw = (eqMatch[3] ?? '').trim().replace(/^["']|["']$/g, '');
    const observed = observations[key];
    return observed === expectedRaw;
  }

  const neqMatch = condition.trim().match(/^@([a-zA-Z_][a-zA-Z0-9_-]*):([a-zA-Z0-9_-]+)\s*!=\s*(.+)$/);
  if (neqMatch) {
    const key = `${neqMatch[1]}:${neqMatch[2]}`;
    const expectedRaw = (neqMatch[3] ?? '').trim().replace(/^["']|["']$/g, '');
    const observed = observations[key];
    return observed !== expectedRaw;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function optimizeContext(
  document: UKDLDocument,
  phase: ContextPhase,
  _maxTokens?: number,
  observations?: Record<string, string>,
): UKDLDocument {
  const result = (() => {
    switch (phase) {
      case 'full':     return phaseFull(document);
      case 'summary':  return phaseSummary(document);
      case 'priority': return phasePriority(document);
      case 'skeleton': return phaseSkeleton(document);
      case 'quantum':  return phaseQuantum(document, observations);
    }
  })();

  // Update current phase in context tree
  return {
    ...result,
    context_tree: { ...result.context_tree, current_phase: phase },
  };
}
