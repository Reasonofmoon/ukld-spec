/**
 * UKDL Lexer — line-based tokenizer
 *
 * Produces a flat list of Token objects.  The parser is responsible for
 * interpreting structure; the lexer only classifies individual lines.
 */

// ---------------------------------------------------------------------------
// Token types
// ---------------------------------------------------------------------------

export const enum TokenType {
  /** :: kind id=prefix:name [attr=val ...] */
  NODE_OPEN = 'NODE_OPEN',
  /** :: (alone, optionally followed by whitespace) */
  NODE_CLOSE = 'NODE_CLOSE',
  /** @identifier: value */
  FIELD = 'FIELD',
  /** %% ... */
  COMMENT_LINE = 'COMMENT_LINE',
  /** (( ... — start of block comment */
  COMMENT_BLOCK_START = 'COMMENT_BLOCK_START',
  /** ... )) — end of block comment */
  COMMENT_BLOCK_END = 'COMMENT_BLOCK_END',
  /** |if: expr| */
  DIRECTIVE_IF = 'DIRECTIVE_IF',
  /** |elif: expr| */
  DIRECTIVE_ELIF = 'DIRECTIVE_ELIF',
  /** |else| */
  DIRECTIVE_ELSE = 'DIRECTIVE_ELSE',
  /** |/if| */
  DIRECTIVE_ENDIF = 'DIRECTIVE_ENDIF',
  /** |for: var in expr| */
  DIRECTIVE_FOR = 'DIRECTIVE_FOR',
  /** |/for| */
  DIRECTIVE_ENDFOR = 'DIRECTIVE_ENDFOR',
  /** |multimodal_output| */
  DIRECTIVE_MULTIMODAL = 'DIRECTIVE_MULTIMODAL',
  /** |/multimodal_output| */
  DIRECTIVE_MULTIMODAL_END = 'DIRECTIVE_MULTIMODAL_END',
  /** |function: name(params)| */
  DIRECTIVE_FUNCTION = 'DIRECTIVE_FUNCTION',
  /** |/function| */
  DIRECTIVE_FUNCTION_END = 'DIRECTIVE_FUNCTION_END',
  /** Anything else */
  BODY = 'BODY',
  /** Empty / blank line */
  BLANK = 'BLANK',
}

export interface Token {
  readonly type: TokenType;
  /** Raw text of the line (without the terminating newline) */
  readonly value: string;
  /** 1-based line number */
  readonly line: number;
  /** 1-based column of first non-space character (always 1 for line-based) */
  readonly column: number;
}

// ---------------------------------------------------------------------------
// Regexes
// ---------------------------------------------------------------------------

const RE_NODE_OPEN = /^::\s+\S/;
const RE_NODE_CLOSE = /^::[\s]*$/;
const RE_FIELD = /^@[a-zA-Z_][a-zA-Z0-9_./-]*\s*:/;
const RE_COMMENT_LINE = /^%%/;
const RE_COMMENT_BLOCK_START = /^\(\(/;
const RE_COMMENT_BLOCK_END = /\)\)\s*$/;
const RE_DIRECTIVE_IF = /^\|if\s*:/;
const RE_DIRECTIVE_ELIF = /^\|elif\s*:/;
const RE_DIRECTIVE_ELSE = /^\|else\|\s*$/;
const RE_DIRECTIVE_ENDIF = /^\|\/if\|\s*$/;
const RE_DIRECTIVE_FOR = /^\|for\s*:/;
const RE_DIRECTIVE_ENDFOR = /^\|\/for\|\s*$/;
const RE_DIRECTIVE_MULTIMODAL = /^\|multimodal_output\|\s*$/;
const RE_DIRECTIVE_MULTIMODAL_END = /^\|\/multimodal_output\|\s*$/;
const RE_DIRECTIVE_FUNCTION = /^\|function\s*:/;
const RE_DIRECTIVE_FUNCTION_END = /^\|\/function\|\s*$/;

// ---------------------------------------------------------------------------
// Lexer implementation
// ---------------------------------------------------------------------------

export function tokenize(source: string): Token[] {
  // Normalise line endings
  const lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const tokens: Token[] = [];

  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const lineNo = i + 1;
    const trimmed = raw.trimStart();

    // -----------------------------------------------------------------------
    // Block comment handling
    // -----------------------------------------------------------------------
    if (inBlockComment) {
      if (RE_COMMENT_BLOCK_END.test(raw)) {
        inBlockComment = false;
        tokens.push({ type: TokenType.COMMENT_BLOCK_END, value: raw, line: lineNo, column: 1 });
      } else {
        // Interior line of a block comment — treat as comment body (BODY type
        // is fine; parsers can ignore it).
        tokens.push({ type: TokenType.COMMENT_LINE, value: raw, line: lineNo, column: 1 });
      }
      continue;
    }

    // -----------------------------------------------------------------------
    // Blank line
    // -----------------------------------------------------------------------
    if (trimmed === '') {
      tokens.push({ type: TokenType.BLANK, value: raw, line: lineNo, column: 1 });
      continue;
    }

    // -----------------------------------------------------------------------
    // Single-line comment
    // -----------------------------------------------------------------------
    if (RE_COMMENT_LINE.test(trimmed)) {
      tokens.push({ type: TokenType.COMMENT_LINE, value: raw, line: lineNo, column: 1 });
      continue;
    }

    // -----------------------------------------------------------------------
    // Block comment start
    // -----------------------------------------------------------------------
    if (RE_COMMENT_BLOCK_START.test(trimmed)) {
      // Check if it also ends on the same line
      if (RE_COMMENT_BLOCK_END.test(raw) && raw.indexOf('((') !== raw.lastIndexOf('))')) {
        // single-line block comment — treat as comment line
        tokens.push({ type: TokenType.COMMENT_LINE, value: raw, line: lineNo, column: 1 });
      } else if (RE_COMMENT_BLOCK_END.test(raw)) {
        // "(( ... ))" on one line
        tokens.push({ type: TokenType.COMMENT_LINE, value: raw, line: lineNo, column: 1 });
      } else {
        inBlockComment = true;
        tokens.push({ type: TokenType.COMMENT_BLOCK_START, value: raw, line: lineNo, column: 1 });
      }
      continue;
    }

    // -----------------------------------------------------------------------
    // Node close (must be checked before node open: both start with ::)
    // -----------------------------------------------------------------------
    if (RE_NODE_CLOSE.test(trimmed)) {
      tokens.push({ type: TokenType.NODE_CLOSE, value: raw, line: lineNo, column: 1 });
      continue;
    }

    // -----------------------------------------------------------------------
    // Node open
    // -----------------------------------------------------------------------
    if (RE_NODE_OPEN.test(trimmed)) {
      tokens.push({ type: TokenType.NODE_OPEN, value: raw, line: lineNo, column: 1 });
      continue;
    }

    // -----------------------------------------------------------------------
    // Field (@key: value)
    // -----------------------------------------------------------------------
    if (RE_FIELD.test(trimmed)) {
      tokens.push({ type: TokenType.FIELD, value: raw, line: lineNo, column: 1 });
      continue;
    }

    // -----------------------------------------------------------------------
    // Directives — check in specificity order
    // -----------------------------------------------------------------------
    if (RE_DIRECTIVE_ENDIF.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_ENDIF, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_ELIF.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_ELIF, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_ELSE.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_ELSE, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_IF.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_IF, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_ENDFOR.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_ENDFOR, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_FOR.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_FOR, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_MULTIMODAL_END.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_MULTIMODAL_END, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_MULTIMODAL.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_MULTIMODAL, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_FUNCTION_END.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_FUNCTION_END, value: raw, line: lineNo, column: 1 });
      continue;
    }
    if (RE_DIRECTIVE_FUNCTION.test(trimmed)) {
      tokens.push({ type: TokenType.DIRECTIVE_FUNCTION, value: raw, line: lineNo, column: 1 });
      continue;
    }

    // -----------------------------------------------------------------------
    // Body text (anything else)
    // -----------------------------------------------------------------------
    tokens.push({ type: TokenType.BODY, value: raw, line: lineNo, column: 1 });
  }

  return tokens;
}
