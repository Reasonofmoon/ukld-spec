/**
 * ukdl context <file> --phase full|summary|priority|skeleton|quantum
 *
 * Applies context phase optimization and shows what content survives,
 * along with token estimates per phase.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse, optimizeContext, serialize } from '@ukdl/parser';
import type { ContextPhase, UKDLDocument } from '@ukdl/parser';
import { c } from '../colors.js';

interface ContextOptions {
  phase?: ContextPhase;
  output?: string;
  quiet?: boolean;
}

/** Rough token estimate: ~4 chars per token */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function runContext(filePath: string, opts: ContextOptions = {}): Promise<void> {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(c.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const source = fs.readFileSync(absPath, 'utf-8');
  const { document, errors } = parse(source);

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

  const allPhases: ContextPhase[] = ['full', 'summary', 'priority', 'skeleton', 'quantum'];

  if (opts.phase) {
    // Single phase: show what content survives
    await showPhase(document, opts.phase, title, opts);
  } else {
    // Show all phases with token estimates
    await showAllPhases(document, source, title, allPhases, opts);
  }
}

async function showAllPhases(
  document: UKDLDocument,
  originalSource: string,
  title: string,
  phases: ContextPhase[],
  opts: ContextOptions,
): Promise<void> {
  console.log();
  console.log(c.bold(`Context Phase Analysis: ${c.cyan(`"${title}"`)}`));
  console.log(c.dim('═'.repeat(50)));
  console.log();

  const originalTokens = estimateTokens(originalSource);

  const phaseDescriptions: Record<ContextPhase, string> = {
    full:     'Everything — all nodes and full bodies',
    summary:  'Collapse low-priority nodes to summaries',
    priority: 'High-priority and critical nodes only',
    skeleton: 'Entity/relation graph and meta, no bodies',
    quantum:  'Active quantum-branch-selected content',
  };

  const phaseColors: Record<ContextPhase, (s: string) => string> = {
    full:     c.green,
    summary:  c.cyan,
    priority: c.yellow,
    skeleton: c.magenta,
    quantum:  c.blue,
  };

  for (const phase of phases) {
    const optimized = optimizeContext(document, phase);
    const serialized = serialize(optimized);
    const tokens = estimateTokens(serialized);
    const pct = Math.round((tokens / originalTokens) * 100);
    const bar = buildBar(pct, 20);

    const colorFn = phaseColors[phase] ?? c.white;
    const nodeCount = optimized.nodes.size;

    console.log(
      `  ${colorFn(phase.padEnd(10))} ` +
      `${c.dim(bar)} ` +
      `${c.yellow(String(tokens).padStart(6))} tokens ` +
      `${c.dim(`(${pct}%)`)} ` +
      `${c.dim(`${nodeCount} nodes`)}`
    );
    console.log(`    ${c.dim(phaseDescriptions[phase])}`);
    console.log();
  }

  console.log(`  ${c.dim('Original:')} ${c.yellow(String(originalTokens))} tokens (source file)`);
  console.log();
}

async function showPhase(
  document: UKDLDocument,
  phase: ContextPhase,
  title: string,
  opts: ContextOptions,
): Promise<void> {
  const optimized = optimizeContext(document, phase);
  const serialized = serialize(optimized);

  if (!opts.quiet) {
    console.log();
    console.log(c.bold(`Context Phase: ${c.cyan(phase)} — "${title}"`));
    console.log(c.dim('═'.repeat(50)));
    console.log();

    const nodeCount = optimized.nodes.size;
    const tokens = estimateTokens(serialized);

    // Show node survival
    console.log(c.bold(`Surviving Nodes (${c.yellow(String(nodeCount))}):`));
    for (const [id, node] of optimized.nodes) {
      const body = node.body.trim();
      const preview = body.length > 60 ? body.slice(0, 57) + '...' : body;
      console.log(
        `  ${c.dim('·')} ${c.cyan(id.padEnd(30))} ` +
        `${c.dim(`[${node.kind}]`)} ` +
        (preview ? c.dim(preview) : c.dim('(no body)'))
      );
    }

    console.log();
    console.log(`  ${c.bold('Estimated tokens:')} ${c.yellow(String(tokens))}`);
    console.log();
    console.log(c.dim('─'.repeat(50)));
    console.log();
  }

  if (opts.output) {
    fs.writeFileSync(path.resolve(opts.output), serialized, 'utf-8');
    if (!opts.quiet) {
      console.error(c.green(`  ✔ Written to ${opts.output}`));
    }
  } else {
    process.stdout.write(serialized);
  }
}

function buildBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}
