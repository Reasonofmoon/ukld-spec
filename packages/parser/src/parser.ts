/**
 * UKDL Parser — converts source text into a UKDLDocument AST.
 *
 * Strategy:
 *  1. Tokenise the source with the lexer (line-by-line).
 *  2. Walk the token stream sequentially (single-pass O(n)).
 *  3. Accumulate fields, body lines, and directives inside each node.
 *  4. On NODE_CLOSE, construct the typed node and push it to the document.
 *  5. Build edges, quantum_state, pipelines and context_tree from the nodes.
 */

import { tokenize, TokenType, type Token } from './lexer.js';
import type {
  ParseResult,
  ParseError,
  ParseWarning,
  UKDLDocument,
  UKDLNode,
  UKDLKind,
  UKDLValue,
  UKDLReference,
  UKDLEdge,
  UKDLDirective,
  UKDLConditional,
  UKDLConditionalBranch,
  UKDLLoop,
  UKDLMultimodal,
  UKDLMultimodalEntry,
  UKDLFunctionDef,
  UKDLQuantumState,
  UKDLEntanglement,
  UKDLContextTree,
  UKDLMeta,
} from './types.js';
import { STANDARD_KINDS } from './types.js';

// ---------------------------------------------------------------------------
// parseNodeOpen — extract kind, id, and header attrs from a NODE_OPEN line
// ---------------------------------------------------------------------------

interface NodeOpenResult {
  kind: UKDLKind;
  id: string;
  prefix: string;
  name: string;
  attrs: Record<string, UKDLValue>;
}

const RE_NODE_OPEN_STRIP = /^::\s+/;
const RE_ATTR_TOKEN = /([a-zA-Z_][a-zA-Z0-9_./-]*)=((?:"(?:[^"\\]|\\.)*"|'[^']*'|\[.*?\]|\{.*?\}|[^\s]+))/g;

function parseNodeOpen(line: string): NodeOpenResult | null {
  const stripped = line.trimStart().replace(RE_NODE_OPEN_STRIP, '');
  if (!stripped) return null;

  // The kind is always the first word
  const spaceIdx = stripped.indexOf(' ');
  const kindStr = spaceIdx === -1 ? stripped : stripped.slice(0, spaceIdx);
  const rest = spaceIdx === -1 ? '' : stripped.slice(spaceIdx + 1).trim();

  // Normalise kind: unknown kinds become 'block' (spec §2.3)
  const kind: UKDLKind = (STANDARD_KINDS.has(kindStr) ? kindStr : 'block') as UKDLKind;

  // Parse header attributes key=value
  const attrs: Record<string, UKDLValue> = {};

  // If kind was unknown add synthetic type attr
  if (!STANDARD_KINDS.has(kindStr)) {
    attrs['type'] = kindStr;
  }

  let id = '';
  let prefix = '';
  let name = '';

  // We need a robust attr parser that handles quoted/nested values.
  // Use a stateful character scan so we can handle {nested} and [arrays].
  const attrPairs = extractAttrPairs(rest);

  for (const [k, v] of attrPairs) {
    if (k === 'id') {
      const colonIdx = v.indexOf(':');
      if (colonIdx !== -1) {
        prefix = v.slice(0, colonIdx);
        name = v.slice(colonIdx + 1);
        id = v;
      } else {
        id = v;
        name = v;
      }
    } else {
      attrs[k] = parseValue(v);
    }
  }

  return { kind, id, prefix, name, attrs };
}

/**
 * Extract key=value pairs from a header attribute string.
 * Handles quoted strings, arrays, and objects as values.
 */
function extractAttrPairs(src: string): [string, string][] {
  const pairs: [string, string][] = [];
  let i = 0;
  const len = src.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(src[i] ?? '')) i++;
    if (i >= len) break;

    // Read key: identifier chars + dots for labels.en style
    const keyStart = i;
    while (i < len && /[a-zA-Z0-9_./-]/.test(src[i] ?? '')) i++;
    const key = src.slice(keyStart, i);
    if (!key) { i++; continue; } // skip unexpected char

    // Expect '='
    while (i < len && /\s/.test(src[i] ?? '')) i++;
    if (i >= len || src[i] !== '=') {
      // standalone flag — treat as boolean true
      if (key) pairs.push([key, 'true']);
      continue;
    }
    i++; // consume '='

    // Read value
    const [value, consumed] = readAttrValue(src, i);
    pairs.push([key, value]);
    i += consumed;
  }

  return pairs;
}

/**
 * Read a single attribute value starting at position `start` in `src`.
 * Returns [valueString, charsConsumed].
 */
function readAttrValue(src: string, start: number): [string, number] {
  let i = start;
  const len = src.length;
  const ch = src[i] ?? '';

  if (ch === '"') {
    // Double-quoted string with escape handling
    i++;
    const buf: string[] = ['"'];
    while (i < len) {
      const c = src[i] ?? '';
      if (c === '\\' && i + 1 < len) {
        buf.push(c, src[i + 1] ?? '');
        i += 2;
      } else if (c === '"') {
        buf.push('"');
        i++;
        break;
      } else {
        buf.push(c);
        i++;
      }
    }
    return [buf.join(''), i - start];
  }

  if (ch === "'") {
    // Single-quoted raw string
    i++;
    const buf: string[] = ["'"];
    while (i < len) {
      const c = src[i] ?? '';
      if (c === "'") {
        buf.push("'");
        i++;
        break;
      }
      buf.push(c);
      i++;
    }
    return [buf.join(''), i - start];
  }

  if (ch === '[') {
    const [s, consumed] = readBracketed(src, i, '[', ']');
    return [s, consumed];
  }

  if (ch === '{') {
    const [s, consumed] = readBracketed(src, i, '{', '}');
    return [s, consumed];
  }

  // Unquoted value — read until whitespace
  const valStart = i;
  while (i < len && !/\s/.test(src[i] ?? '')) i++;
  return [src.slice(valStart, i), i - start];
}

/**
 * Read a balanced bracket expression.
 */
function readBracketed(src: string, start: number, open: string, close: string): [string, number] {
  let depth = 0;
  let i = start;
  const len = src.length;
  const buf: string[] = [];

  while (i < len) {
    const c = src[i] ?? '';
    buf.push(c);

    if (c === '"') {
      // Skip quoted string contents
      i++;
      while (i < len) {
        const qc = src[i] ?? '';
        buf.push(qc);
        if (qc === '\\' && i + 1 < len) {
          buf.push(src[i + 1] ?? '');
          i += 2;
        } else if (qc === '"') {
          i++;
          break;
        } else {
          i++;
        }
      }
      continue;
    }

    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    i++;
  }

  return [buf.join(''), i - start];
}

// ---------------------------------------------------------------------------
// parseField — extract @key: value from a FIELD token line
// ---------------------------------------------------------------------------

function parseField(line: string): [string, string] | null {
  const trimmed = line.trimStart();
  // Match @key: or @key :
  const m = trimmed.match(/^@([a-zA-Z_][a-zA-Z0-9_./-]*)\s*:\s*([\s\S]*)$/);
  if (!m) return null;
  const key = m[1] ?? '';
  const rawValue = (m[2] ?? '').trim();
  return [key, rawValue];
}

// ---------------------------------------------------------------------------
// parseValue — parse a raw value string into UKDLValue
// ---------------------------------------------------------------------------

export function parseValue(raw: string): UKDLValue {
  const s = raw.trim();
  if (s === '') return null;
  if (s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;

  // Number
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(s)) {
    return parseFloat(s);
  }

  // Double-quoted string
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    return unescapeDoubleQuoted(s.slice(1, -1));
  }

  // Single-quoted string (raw)
  if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) {
    return s.slice(1, -1);
  }

  // Triple-quoted string
  if (s.startsWith('"""') && s.endsWith('"""') && s.length >= 6) {
    return dedentTriple(s.slice(3, -3));
  }

  // Array
  if (s.startsWith('[') && s.endsWith(']')) {
    return parseArray(s.slice(1, -1));
  }

  // Object
  if (s.startsWith('{') && s.endsWith('}')) {
    return parseObject(s.slice(1, -1));
  }

  // Display reference @{prefix:name|display}
  const dispRefM = s.match(/^@\{([a-zA-Z_][a-zA-Z0-9_-]*):([a-zA-Z0-9_-]+)\|([^}]*)\}$/);
  if (dispRefM) {
    const prefix = dispRefM[1] ?? '';
    const name = dispRefM[2] ?? '';
    const display = dispRefM[3] ?? '';
    const ref: UKDLReference = { prefix, name, display, key: `${prefix}:${name}` };
    return ref;
  }

  // Reference @prefix:name (possibly with field access .fieldName)
  const refM = s.match(/^@([a-zA-Z_][a-zA-Z0-9_-]*):([a-zA-Z0-9_.-]+)$/);
  if (refM) {
    const prefix = refM[1] ?? '';
    const nameWithField = refM[2] ?? '';
    const ref: UKDLReference = { prefix, name: nameWithField, key: `${prefix}:${nameWithField}` };
    return ref;
  }

  // Bare reference without @ but in a reference context — treat as string
  return s;
}

function unescapeDoubleQuoted(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function dedentTriple(s: string): string {
  const lines = s.split('\n');
  // Find minimum indent (ignoring empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (!isFinite(minIndent)) minIndent = 0;
  return lines
    .map(l => l.slice(minIndent))
    .join('\n')
    .replace(/^\n/, '')
    .replace(/\n$/, '');
}

function parseArray(inner: string): UKDLValue[] {
  const items: UKDLValue[] = [];
  const parts = splitByComma(inner.trim());
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed !== '') {
      items.push(parseValue(trimmed));
    }
  }
  return items;
}

function parseObject(inner: string): Record<string, UKDLValue> {
  const obj: Record<string, UKDLValue> = {};
  const pairs = splitByComma(inner.trim());
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    // Find the colon separating key from value
    const colonIdx = findObjectColon(trimmed);
    if (colonIdx === -1) continue;
    const rawKey = trimmed.slice(0, colonIdx).trim();
    const rawVal = trimmed.slice(colonIdx + 1).trim();
    // Keys can be quoted or bare identifiers
    const key = rawKey.startsWith('"') && rawKey.endsWith('"')
      ? rawKey.slice(1, -1)
      : rawKey.startsWith("'") && rawKey.endsWith("'")
        ? rawKey.slice(1, -1)
        : rawKey;
    if (key) {
      obj[key] = parseValue(rawVal);
    }
  }
  return obj;
}

/**
 * Find the colon that separates an object key from its value,
 * skipping colons inside strings/arrays/objects.
 */
function findObjectColon(s: string): number {
  let depth = 0;
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i] ?? '';
    if (inDouble) {
      if (c === '\\') { i++; continue; }
      if (c === '"') inDouble = false;
      continue;
    }
    if (inSingle) {
      if (c === "'") inSingle = false;
      continue;
    }
    if (c === '"') { inDouble = true; continue; }
    if (c === "'") { inSingle = true; continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    if (c === ']' || c === '}' || c === ')') depth--;
    if (c === ':' && depth === 0) return i;
  }
  return -1;
}

/**
 * Split a string by commas, respecting nested brackets and quotes.
 */
function splitByComma(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inDouble = false;
  let inSingle = false;
  let start = 0;

  for (let i = 0; i < s.length; i++) {
    const c = s[i] ?? '';

    if (inDouble) {
      if (c === '\\') { i++; continue; }
      if (c === '"') inDouble = false;
      continue;
    }
    if (inSingle) {
      if (c === "'") inSingle = false;
      continue;
    }
    if (c === '"') { inDouble = true; continue; }
    if (c === "'") { inSingle = true; continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    if (c === ']' || c === '}' || c === ')') depth--;

    if (c === ',' && depth === 0) {
      parts.push(s.slice(start, i));
      start = i + 1;
    }
  }

  parts.push(s.slice(start));
  return parts;
}

// ---------------------------------------------------------------------------
// parseReference — parse a reference string @prefix:name or @{p:n|d}
// ---------------------------------------------------------------------------

export function parseReference(str: string): UKDLReference | null {
  const s = str.trim();

  const dispRef = s.match(/^@\{([a-zA-Z_][a-zA-Z0-9_-]*):([a-zA-Z0-9_.-]+)\|([^}]*)\}$/);
  if (dispRef) {
    const prefix = dispRef[1] ?? '';
    const name = dispRef[2] ?? '';
    const display = dispRef[3] ?? '';
    return { prefix, name, display, key: `${prefix}:${name}` };
  }

  const ref = s.match(/^@([a-zA-Z_][a-zA-Z0-9_-]*):([a-zA-Z0-9_.-]+)$/);
  if (ref) {
    const prefix = ref[1] ?? '';
    const name = ref[2] ?? '';
    return { prefix, name, key: `${prefix}:${name}` };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Directive parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extract the condition expression from |if: expr| or |elif: expr|
 */
function extractCondition(line: string, keyword: string): string {
  const trimmed = line.trimStart();
  // e.g. "|if: @qst:learner-level == beginner|"
  const after = trimmed.slice(keyword.length).trim();
  // Remove trailing |
  return after.endsWith('|') ? after.slice(0, -1).trim() : after.trim();
}

/**
 * Extract for loop parts from |for: var in expr|
 */
function extractForParts(line: string): { variable: string; iterable: string } | null {
  const trimmed = line.trimStart();
  // "|for: stage in @pipe:...|"
  const after = trimmed.replace(/^\|for\s*:\s*/, '').replace(/\|$/, '').trim();
  const m = after.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.+)$/);
  if (!m) return null;
  return { variable: m[1] ?? '', iterable: (m[2] ?? '').trim() };
}

/**
 * Extract function name and params from |function: name(params)|
 */
function extractFunctionDef(line: string): { name: string; params: string[] } | null {
  const trimmed = line.trimStart();
  const after = trimmed.replace(/^\|function\s*:\s*/, '').replace(/\|$/, '').trim();
  const m = after.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
  if (!m) return null;
  const name = m[1] ?? '';
  const paramStr = m[2] ?? '';
  const params = paramStr
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  return { name, params };
}

// ---------------------------------------------------------------------------
// Main parser state machine
// ---------------------------------------------------------------------------

interface NodeAccumulator {
  kind: UKDLKind;
  id: string;
  prefix: string;
  name: string;
  attrs: Record<string, UKDLValue>;
  fields: Record<string, UKDLValue>;
  bodyLines: string[];
  directives: UKDLDirective[];
  startLine: number;
  /** Whether we've seen the first body line (after which no more fields) */
  bodyStarted: boolean;
}

/**
 * Build directives from a sequence of tokens that constitute the body section
 * of a node. Returns the directive list AND remaining pure body text.
 */
function parseDirectivesFromTokens(
  tokens: Token[],
  start: number,
  end: number,
): { directives: UKDLDirective[]; bodyLines: string[] } {
  const directives: UKDLDirective[] = [];
  const bodyLines: string[] = [];
  let i = start;

  while (i < end) {
    const tok = tokens[i];
    if (!tok) { i++; continue; }

    if (tok.type === TokenType.DIRECTIVE_IF) {
      const condition = extractCondition(tok.value, '|if:');
      const branches: UKDLConditionalBranch[] = [];
      const firstBodyLines: string[] = [];
      i++;

      // Collect first branch body
      while (i < end) {
        const t = tokens[i];
        if (!t) { i++; continue; }
        if (
          t.type === TokenType.DIRECTIVE_ELIF ||
          t.type === TokenType.DIRECTIVE_ELSE ||
          t.type === TokenType.DIRECTIVE_ENDIF
        ) break;
        firstBodyLines.push(t.value);
        i++;
      }
      branches.push({ condition, body: firstBodyLines.join('\n') });

      // Collect elif/else branches
      while (i < end) {
        const t = tokens[i];
        if (!t) { i++; continue; }
        if (t.type === TokenType.DIRECTIVE_ENDIF) { i++; break; }

        if (t.type === TokenType.DIRECTIVE_ELIF) {
          const elifCond = extractCondition(t.value, '|elif:');
          i++;
          const branchLines: string[] = [];
          while (i < end) {
            const bt = tokens[i];
            if (!bt) { i++; continue; }
            if (
              bt.type === TokenType.DIRECTIVE_ELIF ||
              bt.type === TokenType.DIRECTIVE_ELSE ||
              bt.type === TokenType.DIRECTIVE_ENDIF
            ) break;
            branchLines.push(bt.value);
            i++;
          }
          branches.push({ condition: elifCond, body: branchLines.join('\n') });
          continue;
        }

        if (t.type === TokenType.DIRECTIVE_ELSE) {
          i++;
          const elseLines: string[] = [];
          while (i < end) {
            const bt = tokens[i];
            if (!bt) { i++; continue; }
            if (bt.type === TokenType.DIRECTIVE_ENDIF) break;
            elseLines.push(bt.value);
            i++;
          }
          branches.push({ condition: null, body: elseLines.join('\n') });
          continue;
        }

        i++;
      }

      const cond: UKDLConditional = { type: 'conditional', condition, branches };
      directives.push(cond);
      continue;
    }

    if (tok.type === TokenType.DIRECTIVE_FOR) {
      const parts = extractForParts(tok.value);
      i++;
      const forLines: string[] = [];
      while (i < end) {
        const t = tokens[i];
        if (!t) { i++; continue; }
        if (t.type === TokenType.DIRECTIVE_ENDFOR) { i++; break; }
        forLines.push(t.value);
        i++;
      }
      if (parts) {
        const loop: UKDLLoop = {
          type: 'loop',
          variable: parts.variable,
          iterable: parts.iterable,
          body: forLines.join('\n'),
        };
        directives.push(loop);
      }
      continue;
    }

    if (tok.type === TokenType.DIRECTIVE_MULTIMODAL) {
      i++;
      const entries: UKDLMultimodalEntry[] = [];
      while (i < end) {
        const t = tokens[i];
        if (!t) { i++; continue; }
        if (t.type === TokenType.DIRECTIVE_MULTIMODAL_END) { i++; break; }
        const mLine = t.value.trim();
        const mMatch = mLine.match(/^\[([^\]]+)\]\s*(.*)/);
        if (mMatch) {
          entries.push({ modality: mMatch[1] ?? '', content: (mMatch[2] ?? '').trim() });
        }
        i++;
      }
      const mm: UKDLMultimodal = { type: 'multimodal', entries };
      directives.push(mm);
      continue;
    }

    if (tok.type === TokenType.DIRECTIVE_FUNCTION) {
      const fnDef = extractFunctionDef(tok.value);
      i++;
      const fnLines: string[] = [];
      while (i < end) {
        const t = tokens[i];
        if (!t) { i++; continue; }
        if (t.type === TokenType.DIRECTIVE_FUNCTION_END) { i++; break; }
        fnLines.push(t.value);
        i++;
      }
      if (fnDef) {
        const fn: UKDLFunctionDef = {
          type: 'function',
          name: fnDef.name,
          params: fnDef.params,
          body: fnLines.join('\n'),
        };
        directives.push(fn);
      }
      continue;
    }

    // Regular body line (BODY, BLANK, etc.)
    if (
      tok.type === TokenType.BODY ||
      tok.type === TokenType.BLANK ||
      tok.type === TokenType.COMMENT_LINE ||
      tok.type === TokenType.COMMENT_BLOCK_START ||
      tok.type === TokenType.COMMENT_BLOCK_END
    ) {
      bodyLines.push(tok.value);
    }

    i++;
  }

  return { directives, bodyLines };
}

// ---------------------------------------------------------------------------
// resolveReferences — walk document and warn about unresolved refs
// ---------------------------------------------------------------------------

function collectNodeIds(nodes: Map<string, UKDLNode>): Set<string> {
  return new Set(nodes.keys());
}

function resolveValueRefs(
  value: UKDLValue,
  nodeIds: Set<string>,
  warnings: ParseWarning[],
  context: string,
): void {
  if (value === null || value === undefined) return;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return;

  if (Array.isArray(value)) {
    for (const v of value) resolveValueRefs(v, nodeIds, warnings, context);
    return;
  }

  if (typeof value === 'object') {
    if ('prefix' in value && 'name' in value && 'key' in value) {
      // It's a UKDLReference
      const ref = value as UKDLReference;
      if (!nodeIds.has(ref.key)) {
        warnings.push({
          line: 0,
          column: 0,
          message: `Unresolved reference @${ref.key} in ${context}`,
          severity: 'warning',
        });
      }
      return;
    }
    for (const v of Object.values(value as Record<string, UKDLValue>)) {
      resolveValueRefs(v, nodeIds, warnings, context);
    }
  }
}

export function resolveReferences(
  document: UKDLDocument,
  warnings: ParseWarning[],
): void {
  const nodeIds = collectNodeIds(document.nodes as Map<string, UKDLNode>);

  for (const [id, node] of document.nodes) {
    const ctx = `node ${id}`;
    for (const v of Object.values(node.attrs)) {
      resolveValueRefs(v, nodeIds, warnings, ctx);
    }
    for (const v of Object.values(node.fields)) {
      resolveValueRefs(v, nodeIds, warnings, ctx);
    }
  }
}

// ---------------------------------------------------------------------------
// buildDocument — construct UKDLDocument from the accumulated node list
// ---------------------------------------------------------------------------

function buildDocument(nodes: UKDLNode[]): UKDLDocument {
  const nodesMap = new Map<string, UKDLNode>();
  let meta = null as UKDLMeta | null;
  const edges: UKDLEdge[] = [];
  const quantumVars: string[] = [];
  const entanglements: UKDLEntanglement[] = [];
  const pipelines: string[] = [];
  const nodePriorities: Record<string, string> = {};

  for (const node of nodes) {
    if (node.id) {
      nodesMap.set(node.id, node);
    }

    if (node.kind === 'meta' && meta === null) {
      meta = node as UKDLMeta;
    }

    if (node.kind === 'rel') {
      const fromVal = node.attrs['from'] ?? node.fields['from'];
      const toVal = node.attrs['to'] ?? node.fields['to'];
      const typeVal = node.attrs['type'] ?? node.fields['type'];

      const fromStr = refOrString(fromVal);
      const toStr = refOrString(toVal);
      const typeStr = typeof typeVal === 'string' ? typeVal : '';

      if (fromStr && toStr) {
        // Build edge attrs excluding from/to/type
        const edgeAttrs: Record<string, UKDLValue> = {};
        for (const [k, v] of Object.entries(node.attrs)) {
          if (k !== 'from' && k !== 'to' && k !== 'type' && k !== 'id') {
            edgeAttrs[k] = v;
          }
        }
        for (const [k, v] of Object.entries(node.fields)) {
          edgeAttrs[k] = v;
        }
        edges.push({ id: node.id, from: fromStr, to: toStr, type: typeStr, attrs: edgeAttrs });
      }
    }

    if (node.kind === 'quantum') {
      quantumVars.push(node.id);

      const entangleVal = node.fields['entangle'] ?? node.attrs['entangle'];
      const matrixVal = node.fields['entangle_matrix'] ?? node.attrs['entangle_matrix'];

      if (entangleVal) {
        const partner = refOrString(entangleVal);
        if (partner) {
          const matrix: Record<string, number> = {};
          if (matrixVal && typeof matrixVal === 'object' && !Array.isArray(matrixVal)) {
            for (const [k, v] of Object.entries(matrixVal as Record<string, UKDLValue>)) {
              if (typeof v === 'number') matrix[k] = v;
            }
          }
          entanglements.push({ a: node.id, b: partner, matrix });
        }
      }
    }

    if (node.kind === 'pipeline') {
      pipelines.push(node.id);
    }

    // Build context tree priorities
    const priorityVal = node.attrs['priority'] ?? node.fields['priority'];
    if (typeof priorityVal === 'string') {
      nodePriorities[node.id] = priorityVal;
    }
  }

  const quantum_state: UKDLQuantumState = {
    variables: quantumVars,
    entanglements,
    current_observations: {},
  };

  const context_tree: UKDLContextTree = {
    current_phase: 'full',
    node_priorities: nodePriorities,
  };

  return {
    meta,
    nodes: nodesMap,
    edges,
    quantum_state,
    pipelines,
    context_tree,
  };
}

function refOrString(val: UKDLValue | undefined): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
    if ('key' in val) return (val as UKDLReference).key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main parse function
// ---------------------------------------------------------------------------

export function parse(source: string): ParseResult {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const allNodes: UKDLNode[] = [];

  const tokens = tokenize(source);
  const len = tokens.length;
  let i = 0;

  while (i < len) {
    const tok = tokens[i];
    if (!tok) { i++; continue; }

    // Skip comments, blanks outside nodes
    if (
      tok.type === TokenType.COMMENT_LINE ||
      tok.type === TokenType.COMMENT_BLOCK_START ||
      tok.type === TokenType.COMMENT_BLOCK_END ||
      tok.type === TokenType.BLANK
    ) {
      i++;
      continue;
    }

    if (tok.type === TokenType.NODE_OPEN) {
      const openResult = parseNodeOpen(tok.value);
      if (!openResult) {
        errors.push({
          line: tok.line,
          column: tok.column,
          message: `Malformed node open: ${tok.value}`,
          severity: 'error',
        });
        i++;
        continue;
      }

      if (!openResult.id) {
        errors.push({
          line: tok.line,
          column: tok.column,
          message: `Node at line ${tok.line} is missing required 'id' attribute`,
          severity: 'error',
        });
      }

      const acc: NodeAccumulator = {
        kind: openResult.kind,
        id: openResult.id,
        prefix: openResult.prefix,
        name: openResult.name,
        attrs: openResult.attrs,
        fields: {},
        bodyLines: [],
        directives: [],
        startLine: tok.line,
        bodyStarted: false,
      };

      i++;

      // Collect field/body/directive tokens until NODE_CLOSE
      const bodyTokenStart = i; // We need to know where body tokens begin
      const bodyTokens: Token[] = [];

      while (i < len) {
        const inner = tokens[i];
        if (!inner) { i++; continue; }

        if (inner.type === TokenType.NODE_CLOSE) {
          i++; // consume the close
          break;
        }

        if (inner.type === TokenType.NODE_OPEN) {
          // Un-closed node — emit error and treat this as the close
          errors.push({
            line: inner.line,
            column: inner.column,
            message: `Unclosed node '${acc.id}': found new node open at line ${inner.line} without closing '::'`,
            severity: 'error',
          });
          // Do NOT consume — let the outer loop handle it
          break;
        }

        if (inner.type === TokenType.FIELD && !acc.bodyStarted) {
          const fieldResult = parseField(inner.value);
          if (fieldResult) {
            const [key, rawVal] = fieldResult;
            acc.fields[key] = parseValue(rawVal);
          } else {
            warnings.push({
              line: inner.line,
              column: inner.column,
              message: `Malformed field line: ${inner.value}`,
              severity: 'warning',
            });
          }
        } else {
          // Once we see non-field content, body has started
          if (inner.type !== TokenType.COMMENT_LINE &&
              inner.type !== TokenType.COMMENT_BLOCK_START &&
              inner.type !== TokenType.COMMENT_BLOCK_END) {
            acc.bodyStarted = true;
          }
          bodyTokens.push(inner);
        }

        i++;
      }

      // Parse directives from body tokens
      const { directives, bodyLines } = parseDirectivesFromTokens(
        bodyTokens,
        0,
        bodyTokens.length,
      );

      acc.directives = directives;
      acc.bodyLines = bodyLines;

      // Find the close line for location
      const endLine = i > 0 ? (tokens[i - 1]?.line ?? acc.startLine) : acc.startLine;

      const node: UKDLNode = {
        kind: acc.kind,
        id: acc.id,
        prefix: acc.prefix,
        name: acc.name,
        attrs: acc.attrs,
        fields: acc.fields,
        body: bodyLines
          .join('\n')
          .replace(/^\n+/, '')
          .replace(/\n+$/, ''),
        directives: acc.directives,
        loc: { startLine: acc.startLine, endLine },
      };

      allNodes.push(node);
      continue;
    }

    // NODE_CLOSE outside a node — ignore with warning
    if (tok.type === TokenType.NODE_CLOSE) {
      warnings.push({
        line: tok.line,
        column: tok.column,
        message: `Unexpected node close '::' outside of a node at line ${tok.line}`,
        severity: 'warning',
      });
      i++;
      continue;
    }

    // Anything else at top level is a warning
    if (tok.type === TokenType.BODY || tok.type === TokenType.FIELD) {
      warnings.push({
        line: tok.line,
        column: tok.column,
        message: `Content outside of a node at line ${tok.line}: ${tok.value.slice(0, 40)}`,
        severity: 'warning',
      });
    }

    i++;
  }

  // Build document
  const document = buildDocument(allNodes);

  // Resolve references and collect warnings
  resolveReferences(document, warnings);

  // Meta validation
  if (allNodes.length > 0 && allNodes[0]?.kind !== 'meta') {
    warnings.push({
      line: allNodes[0]?.loc.startLine ?? 1,
      column: 1,
      message: 'First node is not a meta node. UKDL spec requires meta to be the first node.',
      severity: 'warning',
    });
  }

  return { document, errors, warnings };
}
