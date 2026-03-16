/**
 * ukdl graph <file> — Show knowledge graph summary
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse, extractGraph } from '@ukdl/parser';
import { c } from '../colors.js';

interface GraphOptions {
  quiet?: boolean;
  output?: string;
}

export async function runGraph(filePath: string, opts: GraphOptions = {}): Promise<void> {
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

  const graph = extractGraph(document);

  const title = document.meta
    ? String(document.meta.attrs['title'] ?? document.meta.id)
    : path.basename(filePath);

  const lines: string[] = [];

  lines.push('');
  lines.push(c.bold(`Knowledge Graph: ${c.cyan(`"${title}"`)}`));
  lines.push(c.dim('═'.repeat(50)));
  lines.push('');

  // Entities
  const entities = graph.nodes.filter(n => n.kind === 'entity');
  const kindIcons: Record<string, string> = {
    entity: '◆',
    block: '▪',
    context: '◐',
    action: '▶',
    quantum: '⊛',
    pipeline: '≋',
  };

  if (entities.length > 0) {
    lines.push(c.bold(`Entities (${c.yellow(String(entities.length))}):`));
    for (const ent of entities) {
      const typeAttr = ent.attrs['type'];
      const type = typeof typeAttr === 'string' ? typeAttr : '?';
      const labelEn = ent.labels['en'] ?? ent.labels[Object.keys(ent.labels)[0] ?? ''];
      const label = labelEn ? `"${labelEn}"` : '';
      lines.push(
        `  ${c.cyan('◆')} ${c.bold(ent.id)} ` +
        `${c.dim(`[${type}]`)} ` +
        (label ? c.white(label) : '')
      );
    }
    lines.push('');
  }

  // Other non-entity, non-rel nodes
  const otherNodes = graph.nodes.filter(n => n.kind !== 'entity');
  if (otherNodes.length > 0) {
    lines.push(c.bold(`Other Nodes (${c.yellow(String(otherNodes.length))}):`));
    for (const node of otherNodes) {
      const icon = kindIcons[node.kind] ?? '·';
      const typeAttr = node.attrs['type'] ?? node.fields['type'];
      const type = typeof typeAttr === 'string' ? `[${typeAttr}]` : `[${node.kind}]`;
      lines.push(`  ${c.magenta(icon)} ${c.bold(node.id)} ${c.dim(type)}`);
    }
    lines.push('');
  }

  // Relations
  if (graph.edges.length > 0) {
    const explicitEdges = graph.edges.filter(e => !e.implicit);
    const implicitEdges = graph.edges.filter(e => e.implicit);

    if (explicitEdges.length > 0) {
      lines.push(c.bold(`Relations (${c.yellow(String(explicitEdges.length))}):`));
      for (const edge of explicitEdges) {
        const fromShort = edge.from;
        const toShort = edge.to;
        lines.push(
          `  ${c.cyan(fromShort)} ${c.dim('──')}${c.yellow(edge.type)}${c.dim('──▶')} ${c.cyan(toShort)}`
        );
      }
      lines.push('');
    }

    if (implicitEdges.length > 0 && !opts.quiet) {
      lines.push(c.bold(`Implicit Relations (${c.yellow(String(implicitEdges.length))}):`));
      for (const edge of implicitEdges) {
        lines.push(
          `  ${c.dim(edge.from)} ${c.dim('··')}${c.dim(edge.type)}${c.dim('··▷')} ${c.dim(edge.to)}`
        );
      }
      lines.push('');
    }
  } else {
    lines.push(c.dim('  (No relations found)'));
    lines.push('');
  }

  // Stats
  lines.push(c.bold('Stats:'));
  lines.push(
    `  ${c.dim('Nodes:')}      ${c.yellow(String(graph.stats.nodeCount))}` +
    `  (${graph.stats.entityCount} entities)`
  );
  lines.push(
    `  ${c.dim('Edges:')}      ${c.yellow(String(graph.stats.edgeCount))}` +
    `  (${graph.stats.explicitEdges} explicit, ${graph.stats.implicitEdges} implicit)`
  );
  lines.push(
    `  ${c.dim('Components:')} ${c.yellow(String(graph.stats.connectedComponents))}`
  );
  lines.push(
    `  ${c.dim('Isolated:')}   ${c.yellow(String(graph.stats.isolatedNodes))}`
  );
  lines.push(
    `  ${c.dim('Avg degree:')} ${c.yellow(graph.stats.avgDegree.toFixed(2))}`
  );
  lines.push('');

  const output = lines.join('\n');

  if (opts.output) {
    // Strip ANSI when writing to file
    const stripped = output.replace(/\x1b\[\d+m/g, '');
    fs.writeFileSync(path.resolve(opts.output), stripped, 'utf-8');
    if (!opts.quiet) {
      console.error(c.green(`  ✔ Written to ${opts.output}`));
    }
  } else {
    console.log(output);
  }
}
