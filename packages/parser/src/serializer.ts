/**
 * UKDL Serializer — converts a UKDLDocument AST back to UKDL source text.
 *
 * Round-trip guarantee (§7.2):
 *   parse(serialize(parse(text))) == parse(text)
 *
 * Formatting (whitespace, comment placement) is NOT preserved — the output
 * is canonical rather than faithful to the original source.
 */

import type {
  UKDLDocument,
  UKDLNode,
  UKDLValue,
  UKDLReference,
  UKDLDirective,
  UKDLConditional,
  UKDLLoop,
  UKDLMultimodal,
  UKDLFunctionDef,
} from './types.js';

// ---------------------------------------------------------------------------
// Value serialisation
// ---------------------------------------------------------------------------

export function serializeValue(value: UKDLValue): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);

  if (typeof value === 'string') {
    // Use double-quoted string; escape special chars
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }

  if (Array.isArray(value)) {
    const items = value.map(serializeValue).join(', ');
    return `[${items}]`;
  }

  if (typeof value === 'object') {
    // Check for reference
    if ('prefix' in value && 'name' in value && 'key' in value) {
      const ref = value as UKDLReference;
      if (ref.display) {
        return `@{${ref.prefix}:${ref.name}|${ref.display}}`;
      }
      return `@${ref.prefix}:${ref.name}`;
    }

    // Plain object
    const entries = Object.entries(value as Record<string, UKDLValue>)
      .map(([k, v]) => `${k}: ${serializeValue(v)}`)
      .join(', ');
    return `{${entries}}`;
  }

  return String(value);
}

// ---------------------------------------------------------------------------
// Attribute serialisation (for the :: header line)
// ---------------------------------------------------------------------------

function serializeAttr(key: string, value: UKDLValue): string {
  // References in attrs can be written without quotes
  if (typeof value === 'object' && value !== null && !Array.isArray(value) && 'key' in value) {
    const ref = value as UKDLReference;
    if (ref.display) return `${key}=@{${ref.prefix}:${ref.name}|${ref.display}}`;
    return `${key}=@${ref.prefix}:${ref.name}`;
  }
  // Strings with spaces need quotes
  if (typeof value === 'string' && /\s/.test(value)) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${key}="${escaped}"`;
  }
  if (typeof value === 'string') {
    return `${key}=${value}`;
  }
  return `${key}=${serializeValue(value)}`;
}

// ---------------------------------------------------------------------------
// Directive serialisation
// ---------------------------------------------------------------------------

function serializeDirective(directive: UKDLDirective): string {
  const lines: string[] = [];

  if (directive.type === 'conditional') {
    const cond = directive as UKDLConditional;
    let first = true;
    for (const branch of cond.branches) {
      if (first) {
        lines.push(`|if: ${cond.condition}|`);
        first = false;
      } else if (branch.condition === null) {
        lines.push('|else|');
      } else {
        lines.push(`|elif: ${branch.condition}|`);
      }
      if (branch.body) lines.push(branch.body);
    }
    lines.push('|/if|');
    return lines.join('\n');
  }

  if (directive.type === 'loop') {
    const loop = directive as UKDLLoop;
    lines.push(`|for: ${loop.variable} in ${loop.iterable}|`);
    if (loop.body) lines.push(loop.body);
    lines.push('|/for|');
    return lines.join('\n');
  }

  if (directive.type === 'multimodal') {
    const mm = directive as UKDLMultimodal;
    lines.push('|multimodal_output|');
    for (const entry of mm.entries) {
      lines.push(`  [${entry.modality}] ${entry.content}`);
    }
    lines.push('|/multimodal_output|');
    return lines.join('\n');
  }

  if (directive.type === 'function') {
    const fn = directive as UKDLFunctionDef;
    lines.push(`|function: ${fn.name}(${fn.params.join(', ')})|`);
    if (fn.body) lines.push(fn.body);
    lines.push('|/function|');
    return lines.join('\n');
  }

  return '';
}

// ---------------------------------------------------------------------------
// Node serialisation
// ---------------------------------------------------------------------------

function serializeNode(node: UKDLNode): string {
  const parts: string[] = [];

  // Build the :: open line
  const headerParts: string[] = [`:: ${node.kind} id=${node.id}`];

  // Attrs (excluding id and type if it was auto-derived from unknown kind)
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k === 'id') continue;
    headerParts.push(serializeAttr(k, v));
  }

  parts.push(headerParts.join(' '));

  // Fields
  for (const [k, v] of Object.entries(node.fields)) {
    parts.push(`@${k}: ${serializeValue(v)}`);
  }

  // Body and directives
  const bodyAndDirectives: string[] = [];

  if (node.body && node.body.trim()) {
    bodyAndDirectives.push('');
    bodyAndDirectives.push(node.body);
  }

  for (const directive of node.directives) {
    bodyAndDirectives.push(serializeDirective(directive));
  }

  if (bodyAndDirectives.length > 0) {
    parts.push(...bodyAndDirectives);
  }

  parts.push('::');
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Document serialisation
// ---------------------------------------------------------------------------

export function serialize(document: UKDLDocument): string {
  const chunks: string[] = [];

  // Meta first
  if (document.meta) {
    chunks.push(serializeNode(document.meta));
  }

  // All other nodes in iteration order
  for (const [id, node] of document.nodes) {
    if (document.meta && id === document.meta.id) continue;
    chunks.push(serializeNode(node));
  }

  return chunks.join('\n\n') + '\n';
}
