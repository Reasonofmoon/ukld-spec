import * as vscode from 'vscode';

// ─── Constants ───────────────────────────────────────────────────────────────

const UKDL_LANG = 'ukdl';

const STANDARD_KINDS = [
  'meta', 'block', 'entity', 'rel', 'schema',
  'include', 'context', 'action', 'quantum', 'pipeline'
];

const STANDARD_FIELDS = [
  'author', 'lang', 'version', 'domain', 'tags', 'ukdl_level', 'license',
  'confidence', 'source', 'summary', 'priority', 'generated_by', 'verified',
  'valid_from', 'valid_to', 'deprecated', 'superseded_by',
  'born', 'died', 'aliases', 'same_as',
  'applies_to', 'required_fields', 'optional_fields', 'field_types',
  'filter', 'namespace', 'max_tokens', 'collapse',
  'states', 'observe_on', 'entangle', 'entangle_matrix', 'decay', 'history', 'default',
  'tool', 'input', 'output', 'timeout', 'retry', 'guard', 'depends_on',
  'goal', 'criteria', 'interval', 'max_iterations', 'stages', 'feedback', 'circuit_breaker',
  'when',
];

const STANDARD_PREFIXES = [
  'doc', 'blk', 'ent', 'rel', 'sch', 'inc', 'ctx', 'act', 'qst', 'pipe'
];

const PRIORITY_VALUES = ['critical', 'high', 'normal', 'low', 'archive'];
const DEPTH_VALUES = ['overview', 'standard', 'detailed'];
const ENTITY_TYPES = [
  'Concept', 'Process', 'Person', 'System', 'Event', 'Place',
  'Molecule', 'Organization', 'Tool', 'Theory'
];
const RELATION_TYPES = [
  'is_a', 'part_of', 'causes', 'caused_by', 'occurs_in', 'has_stage',
  'produces', 'consumes', 'discovered', 'depends_on', 'contradicts',
  'supports', 'similar_to', 'used_by', 'about', 'supported_by',
  'formulated', 'uses_concept'
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ParsedNode {
  id: string;
  kind: string;
  title?: string;
  summary?: string;
  states?: Record<string, number>;
  line: number;
}

function parseDocument(doc: vscode.TextDocument): ParsedNode[] {
  const nodes: ParsedNode[] = [];
  const text = doc.getText();
  const lines = text.split('\n');

  let currentNode: ParsedNode | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Node opener: :: kind id=prefix:name ...
    const nodeOpen = line.match(/^::\s+(\w[\w-]*)\s+id=([\w-]+:[\w.-]+)/);
    if (nodeOpen) {
      currentNode = {
        kind: nodeOpen[1],
        id: nodeOpen[2],
        line: i,
      };
      // extract title from header
      const titleMatch = line.match(/title="([^"]+)"/);
      if (titleMatch) {
        currentNode.title = titleMatch[1];
      }
      nodes.push(currentNode);
      continue;
    }

    // Node closer
    if (/^::\s*$/.test(line)) {
      currentNode = null;
      continue;
    }

    // Fields within current node
    if (currentNode) {
      const summaryMatch = line.match(/^@summary:\s+"([^"]+)"/);
      if (summaryMatch) {
        currentNode.summary = summaryMatch[1];
      }

      const statesMatch = line.match(/^@states:\s*\{([^}]+)\}/);
      if (statesMatch) {
        const statesStr = statesMatch[1];
        const states: Record<string, number> = {};
        for (const pair of statesStr.split(',')) {
          const kv = pair.trim().match(/(\w+)\s*:\s*([\d.]+)/);
          if (kv) {
            states[kv[1]] = parseFloat(kv[2]);
          }
        }
        currentNode.states = states;
      }
    }
  }

  return nodes;
}

function getUkdlLevel(doc: vscode.TextDocument): number {
  const text = doc.getText();
  const levelMatch = text.match(/@ukdl_level:\s*(\d)/);
  if (levelMatch) {
    return parseInt(levelMatch[1]);
  }
  // Infer from content
  if (/^:: pipeline\b/m.test(text)) return 5;
  if (/^:: quantum\b/m.test(text)) return 4;
  if (/^:: action\b/m.test(text)) return 3;
  if (/^:: context\b|^:: include\b/m.test(text)) return 2;
  if (/^:: entity\b|^:: rel\b|^:: schema\b/m.test(text)) return 1;
  if (/^:: meta\b|^:: block\b/m.test(text)) return 0;
  return -1;
}

function collectNodeIds(doc: vscode.TextDocument): string[] {
  const ids: string[] = [];
  const text = doc.getText();
  for (const match of text.matchAll(/^::\s+\w[\w-]*\s+id=([\w-]+:[\w.-]+)/gm)) {
    ids.push(match[1]);
  }
  return ids;
}

// ─── Document Symbol Provider ─────────────────────────────────────────────────

class UkdlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    doc: vscode.TextDocument
  ): vscode.DocumentSymbol[] {
    const nodes = parseDocument(doc);
    return nodes.map((node) => {
      const kindIcon = this.kindToSymbolKind(node.kind);
      const label = node.title ?? node.id;
      const detail = node.kind !== 'meta' ? `${node.kind}` : '';
      const range = new vscode.Range(node.line, 0, node.line, 999);
      return new vscode.DocumentSymbol(label, detail, kindIcon, range, range);
    });
  }

  private kindToSymbolKind(kind: string): vscode.SymbolKind {
    switch (kind) {
      case 'meta':     return vscode.SymbolKind.File;
      case 'block':    return vscode.SymbolKind.Module;
      case 'entity':   return vscode.SymbolKind.Class;
      case 'rel':      return vscode.SymbolKind.Interface;
      case 'schema':   return vscode.SymbolKind.Struct;
      case 'include':  return vscode.SymbolKind.Package;
      case 'context':  return vscode.SymbolKind.Namespace;
      case 'action':   return vscode.SymbolKind.Event;
      case 'quantum':  return vscode.SymbolKind.Variable;
      case 'pipeline': return vscode.SymbolKind.Constructor;
      default:         return vscode.SymbolKind.Object;
    }
  }
}

// ─── Folding Range Provider ───────────────────────────────────────────────────

class UkdlFoldingRangeProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(doc: vscode.TextDocument): vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    const lines = doc.getText().split('\n');
    let openLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^::\s+\w/.test(line)) {
        openLine = i;
      } else if (/^::\s*$/.test(line) && openLine >= 0) {
        if (i > openLine) {
          ranges.push(new vscode.FoldingRange(openLine, i, vscode.FoldingRangeKind.Region));
        }
        openLine = -1;
      }
    }

    // Block comment folding
    let commentOpen = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('((') && commentOpen < 0) {
        commentOpen = i;
      }
      if (line.includes('))') && commentOpen >= 0) {
        if (i > commentOpen) {
          ranges.push(new vscode.FoldingRange(commentOpen, i, vscode.FoldingRangeKind.Comment));
        }
        commentOpen = -1;
      }
    }

    return ranges;
  }
}

// ─── Hover Provider ───────────────────────────────────────────────────────────

class UkdlHoverProvider implements vscode.HoverProvider {
  provideHover(
    doc: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Hover | null {
    const wordRange = doc.getWordRangeAtPosition(
      position,
      /@[\w-]+:[\w.-]+/
    );
    if (!wordRange) return null;

    const word = doc.getText(wordRange);
    const refMatch = word.match(/@([\w-]+):([\w.-]+)/);
    if (!refMatch) return null;

    const targetId = `${refMatch[1]}:${refMatch[2]}`;
    const nodes = parseDocument(doc);
    const target = nodes.find((n) => n.id === targetId);

    if (!target) {
      const md = new vscode.MarkdownString(
        `**Unresolved reference**: \`${targetId}\`\n\nNo node with this ID was found in the document.`
      );
      return new vscode.Hover(md, wordRange);
    }

    const lines: string[] = [
      `**${target.kind}** \`${target.id}\``,
    ];
    if (target.title) {
      lines.push(`*${target.title}*`);
    }
    if (target.summary) {
      lines.push(`\n${target.summary}`);
    }
    if (target.states) {
      lines.push('\n**States:**');
      for (const [state, prob] of Object.entries(target.states)) {
        lines.push(`- \`${state}\`: ${(prob * 100).toFixed(0)}%`);
      }
    }
    lines.push(`\n*Line ${target.line + 1}*`);

    return new vscode.Hover(new vscode.MarkdownString(lines.join('\n')), wordRange);
  }
}

// ─── Completion Provider ──────────────────────────────────────────────────────

class UkdlCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    doc: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    const lineText = doc.lineAt(position).text;
    const prefix = lineText.substring(0, position.character);
    const items: vscode.CompletionItem[] = [];

    // After :: suggest kind names
    if (/^::\s+\w*$/.test(prefix)) {
      for (const kind of STANDARD_KINDS) {
        const item = new vscode.CompletionItem(kind, vscode.CompletionItemKind.Keyword);
        item.detail = `UKDL ${kind} node kind`;
        items.push(item);
      }
      return items;
    }

    // After @prefix: suggest reference completions
    const refPrefixMatch = prefix.match(/@([\w-]+)?:?$/);
    if (refPrefixMatch && !prefix.includes('@{')) {
      // Suggest known node IDs from document
      const nodeIds = collectNodeIds(doc);
      for (const id of nodeIds) {
        const item = new vscode.CompletionItem(`@${id}`, vscode.CompletionItemKind.Reference);
        item.detail = 'UKDL node reference';
        item.insertText = `@${id}`;
        items.push(item);
      }
      // Also suggest standard prefixes
      for (const p of STANDARD_PREFIXES) {
        const item = new vscode.CompletionItem(`@${p}:`, vscode.CompletionItemKind.Module);
        item.detail = `UKDL ${p}: prefix`;
        items.push(item);
      }
      return items;
    }

    // After @ at start of field line (fields)
    if (/^@\w*$/.test(prefix)) {
      for (const field of STANDARD_FIELDS) {
        const item = new vscode.CompletionItem(`@${field}:`, vscode.CompletionItemKind.Field);
        item.detail = `UKDL field`;
        item.insertText = new vscode.SnippetString(`@${field}: $1`);
        items.push(item);
      }
      return items;
    }

    // priority= value completions
    if (/\bpriority=\w*$/.test(prefix)) {
      for (const pv of PRIORITY_VALUES) {
        const item = new vscode.CompletionItem(pv, vscode.CompletionItemKind.EnumMember);
        item.detail = `UKDL priority value`;
        items.push(item);
      }
      return items;
    }

    // depth= value completions
    if (/\bdepth=\w*$/.test(prefix)) {
      for (const dv of DEPTH_VALUES) {
        const item = new vscode.CompletionItem(dv, vscode.CompletionItemKind.EnumMember);
        item.detail = `UKDL depth value`;
        items.push(item);
      }
      return items;
    }

    // type= completions
    if (/\btype=\w*$/.test(prefix)) {
      const lineKindMatch = lineText.match(/^::\s+(\w+)/);
      if (lineKindMatch) {
        const kind = lineKindMatch[1];
        if (kind === 'entity') {
          for (const t of ENTITY_TYPES) {
            items.push(new vscode.CompletionItem(t, vscode.CompletionItemKind.TypeParameter));
          }
          return items;
        }
        if (kind === 'rel') {
          for (const t of RELATION_TYPES) {
            items.push(new vscode.CompletionItem(t, vscode.CompletionItemKind.TypeParameter));
          }
          return items;
        }
      }
    }

    return items;
  }
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

function validateDocument(
  doc: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  if (doc.languageId !== UKDL_LANG) return;

  const diagnostics: vscode.Diagnostic[] = [];
  const nodes = parseDocument(doc);
  const nodeIds = new Set(nodes.map((n) => n.id));
  const text = doc.getText();
  const lines = text.split('\n');

  // Validate quantum probability sums
  for (const node of nodes) {
    if (node.kind === 'quantum' && node.states) {
      const sum = Object.values(node.states).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.01) {
        const range = new vscode.Range(node.line, 0, node.line, 999);
        const diag = new vscode.Diagnostic(
          range,
          `Quantum state probabilities sum to ${sum.toFixed(3)}, expected 1.0 (will be auto-normalized).`,
          vscode.DiagnosticSeverity.Warning
        );
        diag.source = 'ukdl';
        diag.code = 'quantum-probability-sum';
        diagnostics.push(diag);
      }
    }
  }

  // Validate references exist in document
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment lines
    if (/^\s*%%/.test(line)) continue;

    for (const match of line.matchAll(/@(?!\{)([\w-]+):([\w.-]+)/g)) {
      const refId = `${match[1]}:${match[2]}`;
      // Skip if it's known prefix but id is just a placeholder
      if (!nodeIds.has(refId) && !refId.startsWith('doc:')) {
        const startChar = match.index ?? 0;
        const range = new vscode.Range(i, startChar, i, startChar + match[0].length);
        const diag = new vscode.Diagnostic(
          range,
          `Unresolved reference: \`${refId}\` — no node with this ID in the document.`,
          vscode.DiagnosticSeverity.Warning
        );
        diag.source = 'ukdl';
        diag.code = 'unresolved-reference';
        diagnostics.push(diag);
      }
    }
  }

  // Check meta is first node
  const firstNodeLine = nodes.find((n) => n.kind !== undefined);
  if (firstNodeLine && firstNodeLine.kind !== 'meta') {
    const range = new vscode.Range(firstNodeLine.line, 0, firstNodeLine.line, 999);
    const diag = new vscode.Diagnostic(
      range,
      'The first node in a UKDL document should be a `meta` node.',
      vscode.DiagnosticSeverity.Warning
    );
    diag.source = 'ukdl';
    diag.code = 'meta-not-first';
    diagnostics.push(diag);
  }

  // Check for unclosed nodes (unmatched ::)
  let openCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^::\s+\w/.test(line)) {
      openCount++;
    } else if (/^::\s*$/.test(line)) {
      openCount--;
      if (openCount < 0) {
        const range = new vscode.Range(i, 0, i, 2);
        const diag = new vscode.Diagnostic(
          range,
          'Unexpected node closer `::` — no matching node opener.',
          vscode.DiagnosticSeverity.Error
        );
        diag.source = 'ukdl';
        diag.code = 'unmatched-node-closer';
        diagnostics.push(diag);
        openCount = 0;
      }
    }
  }
  if (openCount > 0) {
    const lastLine = lines.length - 1;
    const range = new vscode.Range(lastLine, 0, lastLine, lines[lastLine].length);
    const diag = new vscode.Diagnostic(
      range,
      `${openCount} unclosed node(s) — missing \`::\` closer(s).`,
      vscode.DiagnosticSeverity.Error
    );
    diag.source = 'ukdl';
    diag.code = 'unclosed-node';
    diagnostics.push(diag);
  }

  collection.set(doc.uri, diagnostics);
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

function updateStatusBar(
  statusBar: vscode.StatusBarItem,
  editor: vscode.TextEditor | undefined
): void {
  if (!editor || editor.document.languageId !== UKDL_LANG) {
    statusBar.hide();
    return;
  }

  const level = getUkdlLevel(editor.document);
  const levelNames = ['Pure', 'Semantic', 'Context', 'Executable', 'Dynamic', 'Orchestrated'];
  const levelColors: Record<number, string> = {
    0: '#6B7280',
    1: '#06B6D4',
    2: '#F59E0B',
    3: '#EF4444',
    4: '#EC4899',
    5: '#10B981',
  };

  if (level >= 0) {
    const name = levelNames[level] ?? 'Unknown';
    statusBar.text = `$(circuit-board) UKDL L${level} — ${name}`;
    statusBar.tooltip = `UKDL Level ${level}: ${name}\nClick for UKDL spec`;
    statusBar.color = levelColors[level];
    statusBar.show();
  } else {
    statusBar.text = `$(circuit-board) UKDL`;
    statusBar.tooltip = 'UKDL language file';
    statusBar.color = undefined;
    statusBar.show();
  }
}

// ─── Activation ───────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext): void {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection(UKDL_LANG);
  context.subscriptions.push(diagnosticCollection);

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.command = 'ukdl.openSpec';
  context.subscriptions.push(statusBar);

  // Register document symbol provider (outline view)
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: UKDL_LANG },
      new UkdlDocumentSymbolProvider()
    )
  );

  // Register folding range provider
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      { language: UKDL_LANG },
      new UkdlFoldingRangeProvider()
    )
  );

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { language: UKDL_LANG },
      new UkdlHoverProvider()
    )
  );

  // Register completion provider
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { language: UKDL_LANG },
      new UkdlCompletionProvider(),
      ':', '@', '=', ' '
    )
  );

  // Command: open spec
  context.subscriptions.push(
    vscode.commands.registerCommand('ukdl.openSpec', () => {
      vscode.env.openExternal(
        vscode.Uri.parse('https://github.com/ukdl/ukdl-language')
      );
    })
  );

  // Validate on open and on save
  const validateAndUpdate = (doc: vscode.TextDocument): void => {
    validateDocument(doc, diagnosticCollection);
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(validateAndUpdate),
    vscode.workspace.onDidSaveTextDocument(validateAndUpdate),
    vscode.workspace.onDidChangeTextDocument((e) => {
      // Debounce slightly for typing
      validateDocument(e.document, diagnosticCollection);
    })
  );

  // Update status bar on editor switch
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      updateStatusBar(statusBar, editor);
    })
  );

  // Initial state
  updateStatusBar(statusBar, vscode.window.activeTextEditor);

  // Validate all already-open UKDL documents
  for (const doc of vscode.workspace.textDocuments) {
    if (doc.languageId === UKDL_LANG) {
      validateDocument(doc, diagnosticCollection);
    }
  }
}

export function deactivate(): void {
  // Nothing to clean up — subscriptions handle disposal
}
