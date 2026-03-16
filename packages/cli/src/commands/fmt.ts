/**
 * ukdl fmt <file> — Format/prettify a UKDL file
 *
 * Parses the document then serializes it back using the canonical serializer.
 * Consistent formatting: 2-space indent for fields, blank line before body.
 * Writes back to file (in-place) or to stdout if --output - is given.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse, serialize } from '@ukdl/parser';
import { c } from '../colors.js';

interface FmtOptions {
  output?: string;
  quiet?: boolean;
  /** Write to stdout instead of in-place */
  stdout?: boolean;
}

export async function runFmt(filePath: string, opts: FmtOptions = {}): Promise<void> {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(c.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const source = fs.readFileSync(absPath, 'utf-8');
  const { document, errors } = parse(source);

  if (errors.length > 0) {
    console.error(c.red(`Cannot format — parse errors in ${filePath}:`));
    for (const err of errors) {
      console.error(c.red(`  [${err.line}:${err.column}] ${err.message}`));
    }
    process.exit(1);
  }

  const formatted = serialize(document);

  if (opts.output === '-' || opts.stdout) {
    process.stdout.write(formatted);
    return;
  }

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.writeFileSync(outPath, formatted, 'utf-8');
    if (!opts.quiet) {
      console.error(c.green(`  ✔ Written to ${outPath}`));
    }
    return;
  }

  // In-place: check if anything changed
  if (formatted === source) {
    if (!opts.quiet) {
      console.log(`  ${c.green('✔')} ${c.dim(filePath)} — already formatted`);
    }
    return;
  }

  // Compute diff summary
  const originalLines = source.split('\n').length;
  const formattedLines = formatted.split('\n').length;

  fs.writeFileSync(absPath, formatted, 'utf-8');

  if (!opts.quiet) {
    const lineDiff = formattedLines - originalLines;
    const diffStr = lineDiff === 0
      ? c.dim('no line change')
      : lineDiff > 0
        ? c.dim(`+${lineDiff} lines`)
        : c.dim(`${lineDiff} lines`);

    console.log(`  ${c.green('✔')} ${c.bold(filePath)} — formatted (${diffStr})`);
  }
}
