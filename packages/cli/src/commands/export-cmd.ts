/**
 * ukdl export <file> --format json|markdown|cypher|rdf
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse, toJSON, extractGraph } from '@ukdl/parser';
import type { UKDLDocument, UKDLNode, UKDLValue } from '@ukdl/parser';
import { c } from '../colors.js';

export type ExportFormat = 'json' | 'markdown' | 'cypher' | 'rdf';

interface ExportOptions {
  format: ExportFormat;
  output?: string;
  quiet?: boolean;
}

export async function runExport(filePath: string, opts: ExportOptions): Promise<void> {
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

  let output: string;

  switch (opts.format) {
    case 'json':
      output = exportJSON(document);
      break;
    case 'markdown':
      output = exportMarkdown(document);
      break;
    case 'cypher':
      output = exportCypher(document);
      break;
    case 'rdf':
      output = exportRDF(document);
      break;
    default:
      console.error(c.red(`Unknown format: ${(opts as { format: string }).format}`));
      console.error(c.dim('  Supported: json, markdown, cypher, rdf'));
      process.exit(1);
  }

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.writeFileSync(outPath, output, 'utf-8');
    if (!opts.quiet) {
      console.error(c.green(`  ✔ Written to ${outPath}`));
    }
  } else {
    process.stdout.write(output);
  }
}

// ---------------------------------------------------------------------------
// JSON export
// ---------------------------------------------------------------------------

function exportJSON(document: UKDLDocument): string {
  const canonical = toJSON(document);
  return JSON.stringify(canonical, null, 2) + '\n';
}

// ---------------------------------------------------------------------------
// Markdown export
// ---------------------------------------------------------------------------

function valueToString(v: UKDLValue): string {
  if (v === null) return 'null';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(valueToString).join(', ');
  if (typeof v === 'object' && 'key' in v) {
    const ref = v as { key: string; display?: string };
    return ref.display ? `${ref.display} (${ref.key})` : ref.key;
  }
  if (typeof v === 'object') {
    return JSON.stringify(v);
  }
  return String(v);
}

function exportMarkdown(document: UKDLDocument): string {
  const lines: string[] = [];

  const title = document.meta
    ? String(document.meta.attrs['title'] ?? document.meta.id)
    : 'UKDL Document';

  lines.push(`# ${title}`);
  lines.push('');

  if (document.meta) {
    const { fields, attrs } = document.meta;
    const author = fields['author'];
    const version = fields['version'];
    const domain = fields['domain'];
    const tags = fields['tags'];
    const level = fields['ukdl_level'];

    if (author)  lines.push(`> **Author:** ${valueToString(author)}`);
    if (version) lines.push(`> **Version:** ${valueToString(version)}`);
    if (domain)  lines.push(`> **Domain:** ${valueToString(domain)}`);
    if (level !== undefined) lines.push(`> **UKDL Level:** L${valueToString(level)}`);
    if (tags && Array.isArray(tags)) {
      lines.push(`> **Tags:** ${tags.map(valueToString).join(', ')}`);
    }
    lines.push('');
  }

  // Collect entities for knowledge graph section
  const entities: UKDLNode[] = [];
  const rels: UKDLNode[] = [];
  const blocks: UKDLNode[] = [];

  for (const node of document.nodes.values()) {
    if (node.kind === 'meta') continue;
    if (node.kind === 'entity') entities.push(node);
    else if (node.kind === 'rel') rels.push(node);
    else if (node.kind === 'block') blocks.push(node);
  }

  // Content sections from blocks
  for (const block of blocks) {
    const typeVal = block.attrs['type'];
    const type = typeof typeVal === 'string' ? typeVal : 'section';
    const idName = block.id.split(':')[1] ?? block.id;
    const heading = idName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());

    lines.push(`## ${heading}`);
    lines.push('');

    // Emit summary if present
    const summary = block.fields['summary'];
    if (summary) {
      lines.push(`*${valueToString(summary)}*`);
      lines.push('');
    }

    if (block.body.trim()) {
      lines.push(block.body.trim());
      lines.push('');
    }

    // Any notable fields
    const fieldLines: string[] = [];
    for (const [k, v] of Object.entries(block.fields)) {
      if (k === 'summary') continue;
      fieldLines.push(`- **${k}:** ${valueToString(v)}`);
    }
    if (fieldLines.length > 0) {
      lines.push(...fieldLines);
      lines.push('');
    }
  }

  // Entities section
  if (entities.length > 0) {
    lines.push('## Entities');
    lines.push('');
    for (const ent of entities) {
      const typeAttr = ent.attrs['type'];
      const type = typeof typeAttr === 'string' ? typeAttr : 'Entity';
      const labelVal = ent.attrs['labels.en'] ?? ent.attrs['labels'];
      const label = typeof labelVal === 'string' ? labelVal : ent.id;
      lines.push(`- **${label}** *(${type})* — \`${ent.id}\``);
      if (ent.body.trim()) {
        lines.push(`  ${ent.body.trim().split('\n')[0] ?? ''}`);
      }
    }
    lines.push('');
  }

  // Relations section
  if (rels.length > 0) {
    lines.push('## Relations');
    lines.push('');
    for (const rel of rels) {
      const from = rel.attrs['from'];
      const to = rel.attrs['to'];
      const type = rel.attrs['type'];
      const fromStr = typeof from === 'object' && from !== null && 'key' in from
        ? (from as { key: string }).key
        : String(from ?? '?');
      const toStr = typeof to === 'object' && to !== null && 'key' in to
        ? (to as { key: string }).key
        : String(to ?? '?');
      lines.push(`- \`${fromStr}\` —**${String(type ?? 'related')}**→ \`${toStr}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Cypher (Neo4j) export
// ---------------------------------------------------------------------------

function cypherString(v: string): string {
  return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function cypherValue(v: UKDLValue): string {
  if (v === null) return 'null';
  if (typeof v === 'string') return cypherString(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `[${v.map(cypherValue).join(', ')}]`;
  if (typeof v === 'object' && 'key' in v) {
    const ref = v as { key: string; display?: string };
    return cypherString(ref.display ?? ref.key);
  }
  return cypherString(JSON.stringify(v));
}

function safeLabel(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function exportCypher(document: UKDLDocument): string {
  const lines: string[] = [];

  lines.push('// UKDL → Neo4j Cypher');
  lines.push('// Generated by ukdl-cli v2.0.0');
  lines.push('');

  const graph = extractGraph(document);

  // Create entity nodes
  for (const gNode of graph.nodes) {
    if (gNode.kind !== 'entity') continue;

    const label = safeLabel(gNode.type ?? 'Entity');
    const props: string[] = [`id: '${gNode.id}'`];

    const labelEn = gNode.labels['en'];
    if (labelEn) props.push(`name: ${cypherString(labelEn)}`);

    for (const [k, v] of Object.entries(gNode.fields)) {
      if (k === 'summary') continue;
      props.push(`${safeLabel(k)}: ${cypherValue(v)}`);
    }

    lines.push(`CREATE (:${label} {${props.join(', ')}});`);
  }

  if (graph.nodes.some(n => n.kind === 'entity')) {
    lines.push('');
  }

  // Create relationships
  for (const edge of graph.edges) {
    if (edge.implicit) continue;

    const fromLabel = safeLabel(edge.from);
    const toLabel = safeLabel(edge.to);
    const relType = safeLabel(edge.type.toUpperCase());

    const props: string[] = [`id: '${edge.id}'`];
    for (const [k, v] of Object.entries(edge.attrs)) {
      props.push(`${safeLabel(k)}: ${cypherValue(v)}`);
    }

    const propsStr = props.length > 0 ? ` {${props.join(', ')}}` : '';

    lines.push(
      `MATCH (a {id: '${edge.from}'}), (b {id: '${edge.to}'})` +
      ` CREATE (a)-[:${relType}${propsStr}]->(b);`
    );
  }

  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// RDF (Turtle) export
// ---------------------------------------------------------------------------

function turtleStr(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

function rdfValue(v: UKDLValue): string | null {
  if (v === null) return null;
  if (typeof v === 'string') return turtleStr(v);
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return `"${v}"^^xsd:boolean`;
  if (Array.isArray(v)) return null; // skip arrays in simple RDF
  if (typeof v === 'object' && 'key' in v) {
    const ref = v as { key: string };
    return `ukdl:${ref.key.replace(':', '_')}`;
  }
  return null;
}

function exportRDF(document: UKDLDocument): string {
  const lines: string[] = [];

  lines.push('@prefix ukdl: <https://ukdl.org/ns/> .');
  lines.push('@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .');
  lines.push('@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .');
  lines.push('@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .');
  lines.push('@prefix owl:  <http://www.w3.org/2002/07/owl#> .');
  lines.push('');

  // Document metadata
  if (document.meta) {
    const title = document.meta.attrs['title'];
    const docId = document.meta.id.replace(':', '_');
    lines.push(`ukdl:${docId}`);
    lines.push(`  rdf:type ukdl:Document ;`);
    if (typeof title === 'string') {
      lines.push(`  rdfs:label ${turtleStr(title)} ;`);
    }
    const author = document.meta.fields['author'];
    if (typeof author === 'string') {
      lines.push(`  ukdl:author ${turtleStr(author)} ;`);
    }
    lines.push('.');
    lines.push('');
  }

  // Entities
  for (const node of document.nodes.values()) {
    if (node.kind !== 'entity') continue;

    const nodeId = node.id.replace(':', '_');
    const typeAttr = node.attrs['type'];
    const type = typeof typeAttr === 'string' ? typeAttr : 'Entity';

    lines.push(`ukdl:${nodeId}`);
    lines.push(`  rdf:type ukdl:${type} ;`);

    // Labels
    for (const [k, v] of Object.entries(node.attrs)) {
      if (k.startsWith('labels.') && typeof v === 'string') {
        const lang = k.slice('labels.'.length);
        lines.push(`  rdfs:label ${turtleStr(v)}@${lang} ;`);
      }
    }

    // Fields as data properties
    for (const [k, v] of Object.entries(node.fields)) {
      const rv = rdfValue(v);
      if (rv) {
        lines.push(`  ukdl:${k} ${rv} ;`);
      }
    }

    // same_as
    const sameAs = node.fields['same_as'];
    if (Array.isArray(sameAs)) {
      for (const s of sameAs) {
        if (typeof s === 'string' && s.startsWith('http')) {
          lines.push(`  owl:sameAs <${s}> ;`);
        }
      }
    }

    lines.push('.');
    lines.push('');
  }

  // Relations as triples
  for (const edge of document.edges) {
    const fromId = edge.from.replace(':', '_');
    const toId = edge.to.replace(':', '_');
    const relType = edge.type;

    lines.push(`ukdl:${fromId} ukdl:${relType} ukdl:${toId} .`);
  }

  if (document.edges.length > 0) lines.push('');

  return lines.join('\n');
}
