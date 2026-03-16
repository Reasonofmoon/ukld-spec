/**
 * ukdl stats <file> — Comprehensive document statistics
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse, optimizeContext, serialize } from '@ukdl/parser';
import type { UKDLDocument, ContextPhase } from '@ukdl/parser';
import { c } from '../colors.js';

interface StatsOptions {
  quiet?: boolean;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function runStats(filePath: string, opts: StatsOptions = {}): Promise<void> {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(c.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const source = fs.readFileSync(absPath, 'utf-8');
  const { document, errors, warnings } = parse(source);

  if (errors.length > 0) {
    console.error(c.red(`Parse errors in ${filePath}:`));
    for (const err of errors) {
      console.error(c.red(`  [${err.line}:${err.column}] ${err.message}`));
    }
    process.exit(1);
  }

  const title = document.meta
    ? String(document.meta.attrs['title'] ?? document.meta.id)
    : path.basename(filePath);

  const stat = fs.statSync(absPath);
  const fileSizeKB = (stat.size / 1024).toFixed(1);
  const sourceTokens = estimateTokens(source);
  const lineCount = source.split('\n').length;

  // Node analysis
  const kindCounts = new Map<string, number>();
  let totalFields = 0;
  let totalBodyLines = 0;
  let totalBodyChars = 0;
  let refCount = 0;
  let unresolvedRefs = 0;

  // First pass: collect all node IDs and basic counts
  const allNodeIds = new Set<string>();
  for (const [id, node] of document.nodes) {
    allNodeIds.add(id);
    kindCounts.set(node.kind, (kindCounts.get(node.kind) ?? 0) + 1);
    totalFields += Object.keys(node.fields).length;
    const bodyLines = node.body ? node.body.split('\n').length : 0;
    totalBodyLines += bodyLines;
    totalBodyChars += node.body.length;
  }

  // Second pass: resolve references (needs full node ID set)
  for (const [, node] of document.nodes) {
    const bodyRefs = node.body.match(/@[a-zA-Z_][a-zA-Z0-9_-]*:[a-zA-Z0-9_.-]+/g) ?? [];
    refCount += bodyRefs.length;
    for (const ref of bodyRefs) {
      const key = ref.slice(1);
      if (!allNodeIds.has(key)) unresolvedRefs++;
    }
    // Count field refs (references embedded as values)
    const fieldAcc: RefAccumulator = { refCount: 0, unresolved: 0 };
    for (const v of Object.values(node.fields)) {
      countRefs(v, allNodeIds, fieldAcc);
    }
    refCount += fieldAcc.refCount;
    unresolvedRefs += fieldAcc.unresolved;
  }

  // Determine highest UKDL level
  const level = detectLevel(document);

  // Context phase token estimates
  const phases: ContextPhase[] = ['full', 'summary', 'priority', 'skeleton', 'quantum'];
  const phaseTokens: Record<string, number> = {};
  for (const phase of phases) {
    const optimized = optimizeContext(document, phase);
    const serialized = serialize(optimized);
    phaseTokens[phase] = estimateTokens(serialized);
  }

  // Context phases available
  const contextNodes = Array.from(document.nodes.values()).filter(n => n.kind === 'context');
  const hasPriority = contextNodes.some(n => {
    const p = n.attrs['priority'];
    return p === 'critical' || p === 'high';
  });
  const hasCollapse = contextNodes.some(n => {
    const col = n.attrs['collapse'] ?? n.fields['collapse'];
    return col === true || col === 'true';
  });

  // Output
  console.log();
  console.log(c.bold(c.cyan('  UKDL Document Statistics')));
  console.log(c.dim('  ' + '─'.repeat(50)));
  console.log();

  // File info
  section('File');
  kv('Path', c.dim(absPath));
  kv('Size', `${fileSizeKB} KB`);
  kv('Lines', String(lineCount));
  kv('Tokens (est.)', c.yellow(String(sourceTokens)));
  console.log();

  // Document info
  section('Document');
  kv('Title', c.bold(title));
  kv('UKDL Level', c.cyan(`L${level}`));
  if (document.meta) {
    const author = document.meta.fields['author'];
    const version = document.meta.fields['version'];
    const lang = document.meta.fields['lang'];
    const domain = document.meta.fields['domain'];
    if (author)  kv('Author', String(author));
    if (version) kv('Version', String(version));
    if (lang)    kv('Lang', String(lang));
    if (domain)  kv('Domain', String(domain));
  }
  console.log();

  // Nodes
  section('Nodes');
  kv('Total', c.yellow(String(document.nodes.size)));

  const kindOrder = ['meta', 'block', 'entity', 'rel', 'schema', 'include', 'context', 'action', 'quantum', 'pipeline'];
  for (const kind of kindOrder) {
    const count = kindCounts.get(kind) ?? 0;
    if (count > 0) {
      kv(`  ${kind}`, String(count));
    }
  }
  kv('Fields (total)', String(totalFields));
  kv('Body lines', String(totalBodyLines));
  kv('Body chars', String(totalBodyChars));
  console.log();

  // References
  section('References');
  kv('Total refs', String(refCount));
  kv('Unresolved', unresolvedRefs > 0 ? c.yellow(String(unresolvedRefs)) : c.green('0'));
  console.log();

  // Knowledge Graph
  if ((kindCounts.get('entity') ?? 0) > 0 || (kindCounts.get('rel') ?? 0) > 0) {
    section('Knowledge Graph');
    kv('Entities', String(kindCounts.get('entity') ?? 0));
    kv('Relations', String(kindCounts.get('rel') ?? 0));
    kv('Edges (total)', String(document.edges.length));
    console.log();
  }

  // Quantum state
  if (document.quantum_state.variables.length > 0) {
    section('Quantum State');
    kv('Variables', String(document.quantum_state.variables.length));
    kv('Entanglements', String(document.quantum_state.entanglements.length));
    for (const varId of document.quantum_state.variables) {
      const qNode = document.nodes.get(varId);
      if (qNode) {
        const states = qNode.fields['states'];
        if (states && typeof states === 'object' && !Array.isArray(states)) {
          const stateNames = Object.keys(states).join(', ');
          kv(`  ${varId}`, `{${stateNames}}`);
        }
      }
    }
    console.log();
  }

  // Pipelines
  if (document.pipelines.length > 0) {
    section('Pipelines');
    kv('Count', String(document.pipelines.length));
    for (const pId of document.pipelines) {
      const pNode = document.nodes.get(pId);
      if (pNode) {
        const goal = pNode.fields['goal'];
        kv(`  ${pId}`, goal ? `goal: ${String(goal)}` : '');
      }
    }
    console.log();
  }

  // Context phases
  if (contextNodes.length > 0) {
    section('Context');
    kv('Context nodes', String(contextNodes.length));
    kv('Has collapse', hasCollapse ? c.cyan('yes') : c.dim('no'));
    kv('Has priority', hasPriority ? c.cyan('yes') : c.dim('no'));
    console.log();
  }

  // Token estimates per phase
  section('Token Estimates (by phase)');
  const maxTokens = Math.max(...Object.values(phaseTokens));
  for (const phase of phases) {
    const t = phaseTokens[phase] ?? 0;
    const pct = maxTokens > 0 ? Math.round((t / maxTokens) * 100) : 100;
    const bar = buildMiniBar(pct, 15);
    kv(phase.padEnd(10), `${c.yellow(String(t).padStart(6))} tokens  ${c.dim(bar)}`);
  }
  console.log();

  // Diagnostics
  if (errors.length > 0 || warnings.length > 0) {
    section('Diagnostics');
    if (errors.length > 0) kv('Errors', c.red(String(errors.length)));
    if (warnings.length > 0) kv('Warnings', c.yellow(String(warnings.length)));
    console.log();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function section(title: string): void {
  console.log(`  ${c.bold(c.cyan(title))}`);
}

function kv(key: string, value: string): void {
  const k = key.padEnd(20);
  console.log(`    ${c.dim(k)} ${value}`);
}

function buildMiniBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

interface RefAccumulator {
  refCount: number;
  unresolved: number;
}

function countRefs(v: unknown, nodeIds: Set<string>, acc: RefAccumulator): void {
  if (!v) return;
  if (typeof v === 'object' && v !== null && 'key' in v) {
    const ref = v as { key: string };
    acc.refCount++;
    if (!nodeIds.has(ref.key)) acc.unresolved++;
  } else if (Array.isArray(v)) {
    for (const item of v) countRefs(item, nodeIds, acc);
  }
}

function detectLevel(document: UKDLDocument): number {
  let level = 0;
  for (const node of document.nodes.values()) {
    switch (node.kind) {
      case 'entity':
      case 'rel':
      case 'schema':
        if (level < 1) level = 1;
        break;
      case 'context':
      case 'include':
        if (level < 2) level = 2;
        break;
      case 'action':
        if (level < 3) level = 3;
        break;
      case 'quantum':
        if (level < 4) level = 4;
        break;
      case 'pipeline':
        if (level < 5) level = 5;
        break;
    }
  }
  // Also check declared level in meta
  if (document.meta) {
    const declared = document.meta.fields['ukdl_level'];
    if (typeof declared === 'number' && declared > level) {
      level = declared;
    }
  }
  return level;
}
