/**
 * ukdl parse <file> — Parse and show AST summary
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@ukdl/parser';
import { c } from '../colors.js';

interface ParseOptions {
  quiet?: boolean;
}

export async function runParse(filePath: string, opts: ParseOptions = {}): Promise<void> {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(c.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const source = fs.readFileSync(absPath, 'utf-8');
  const result = parse(source);
  const { document, errors, warnings } = result;

  if (!opts.quiet) {
    // Header
    const title = document.meta
      ? (document.meta.attrs['title'] as string ?? document.meta.id)
      : path.basename(filePath);

    console.log();
    console.log(c.bold(c.cyan('  UKDL Parse Result')));
    console.log(c.dim('  ' + '─'.repeat(50)));
    console.log();
    console.log(`  ${c.bold('File')}    ${c.dim(absPath)}`);
    console.log(`  ${c.bold('Title')}   ${c.bright(title)}`);

    if (document.meta) {
      const author = document.meta.fields['author'];
      const version = document.meta.fields['version'];
      const lang = document.meta.fields['lang'];
      const level = document.meta.fields['ukdl_level'];
      const domain = document.meta.fields['domain'];

      if (author)  console.log(`  ${c.bold('Author')}  ${String(author)}`);
      if (version) console.log(`  ${c.bold('Version')} ${String(version)}`);
      if (lang)    console.log(`  ${c.bold('Lang')}    ${String(lang)}`);
      if (domain)  console.log(`  ${c.bold('Domain')}  ${String(domain)}`);
      if (level !== undefined) console.log(`  ${c.bold('Level')}   L${String(level)}`);
    }

    console.log();

    // Node counts by kind
    const kindCounts = new Map<string, number>();
    for (const node of document.nodes.values()) {
      kindCounts.set(node.kind, (kindCounts.get(node.kind) ?? 0) + 1);
    }

    const kindOrder = ['meta', 'block', 'entity', 'rel', 'schema', 'include', 'context', 'action', 'quantum', 'pipeline'];
    const kindIcons: Record<string, string> = {
      meta: '◎',
      block: '▪',
      entity: '◆',
      rel: '→',
      schema: '⊞',
      include: '⊕',
      context: '◐',
      action: '▶',
      quantum: '⊛',
      pipeline: '≋',
    };

    console.log(`  ${c.bold('Nodes')}   ${c.yellow(String(document.nodes.size))} total`);
    for (const kind of kindOrder) {
      const count = kindCounts.get(kind);
      if (count) {
        const icon = kindIcons[kind] ?? '·';
        console.log(`    ${c.dim(icon)} ${c.cyan(kind.padEnd(10))} ${c.white(String(count))}`);
      }
    }
    // Any custom kinds
    for (const [kind, count] of kindCounts) {
      if (!kindOrder.includes(kind)) {
        console.log(`    ${c.dim('·')} ${c.magenta(kind.padEnd(10))} ${c.white(String(count))}`);
      }
    }

    // Edges
    if (document.edges.length > 0) {
      console.log();
      console.log(`  ${c.bold('Edges')}   ${c.yellow(String(document.edges.length))} relation(s)`);
    }

    // Quantum state
    if (document.quantum_state.variables.length > 0) {
      console.log();
      console.log(`  ${c.bold('Quantum')} ${c.yellow(String(document.quantum_state.variables.length))} variable(s),` +
        ` ${c.yellow(String(document.quantum_state.entanglements.length))} entanglement(s)`);
    }

    // Pipelines
    if (document.pipelines.length > 0) {
      console.log();
      console.log(`  ${c.bold('Pipelines')} ${c.yellow(String(document.pipelines.length))}: ${document.pipelines.join(', ')}`);
    }

    // Context tree
    const priorities = Object.values(document.context_tree.node_priorities);
    if (priorities.length > 0) {
      console.log();
      const pCounts = priorities.reduce<Record<string, number>>((acc, p) => {
        acc[p] = (acc[p] ?? 0) + 1;
        return acc;
      }, {});
      const parts = Object.entries(pCounts).map(([p, n]) => `${p}:${n}`).join(' ');
      console.log(`  ${c.bold('Priorities')} ${c.dim(parts)}`);
    }

    console.log();
  }

  // Diagnostics
  if (errors.length > 0) {
    console.error(c.red(`  ${errors.length} parse error(s):`));
    for (const err of errors) {
      console.error(`    ${c.red('✖')} ${c.dim(`[${err.line}:${err.column}]`)} ${err.message}`);
    }
    console.log();
  }

  if (warnings.length > 0 && !opts.quiet) {
    console.warn(c.yellow(`  ${warnings.length} warning(s):`));
    for (const w of warnings) {
      console.warn(`    ${c.yellow('⚠')} ${c.dim(`[${w.line}:${w.column}]`)} ${w.message}`);
    }
    console.log();
  }

  if (errors.length === 0 && !opts.quiet) {
    console.log(`  ${c.green('✔')} Parsed successfully`);
    console.log();
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}
