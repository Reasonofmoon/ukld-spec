/**
 * ukdl validate <file> — Validate a UKDL file
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse, validate } from '@ukdl/parser';
import { c } from '../colors.js';

interface ValidateOptions {
  quiet?: boolean;
}

export async function runValidate(filePath: string, opts: ValidateOptions = {}): Promise<void> {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(c.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const source = fs.readFileSync(absPath, 'utf-8');
  const parseResult = parse(source);
  const valResult = validate(parseResult.document);

  const totalErrors = parseResult.errors.length + valResult.errors.length;
  const totalWarnings = parseResult.warnings.length + valResult.warnings.length;

  if (!opts.quiet) {
    console.log();
    console.log(c.bold(c.cyan('  UKDL Validation')));
    console.log(c.dim('  ' + '─'.repeat(50)));
    console.log();

    const fileName = path.basename(filePath);
    console.log(`  ${c.bold('File')} ${c.dim(fileName)}`);
    console.log();
  }

  // Parse errors (fatal)
  if (parseResult.errors.length > 0) {
    for (const err of parseResult.errors) {
      console.error(
        `  ${c.red('✖')} ${c.bold(c.red('error'))} ` +
        `${c.dim(`[${err.line}:${err.column}]`)} ` +
        err.message
      );
    }
  }

  // Parse warnings
  for (const w of parseResult.warnings) {
    if (!opts.quiet) {
      console.warn(
        `  ${c.yellow('⚠')} ${c.bold(c.yellow('warning'))} ` +
        `${c.dim(`[${w.line}:${w.column}]`)} ` +
        w.message
      );
    }
  }

  // Validation errors
  for (const err of valResult.errors) {
    console.error(
      `  ${c.red('✖')} ${c.bold(c.red('error'))} ` +
      `${c.dim(`[${err.nodeId}]`)} ` +
      err.message
    );
  }

  // Validation warnings
  for (const w of valResult.warnings) {
    if (!opts.quiet) {
      console.warn(
        `  ${c.yellow('⚠')} ${c.bold(c.yellow('warning'))} ` +
        `${c.dim(`[${w.nodeId}]`)} ` +
        w.message
      );
    }
  }

  if (!opts.quiet) {
    console.log();

    // Summary line
    const errorStr = totalErrors > 0
      ? c.red(`${totalErrors} error(s)`)
      : c.green('0 errors');
    const warnStr = totalWarnings > 0
      ? c.yellow(`${totalWarnings} warning(s)`)
      : c.dim('0 warnings');

    if (totalErrors === 0 && totalWarnings === 0) {
      console.log(`  ${c.green('✔')} ${c.bold(c.green('Valid'))} — No issues found`);
    } else if (totalErrors === 0) {
      console.log(`  ${c.yellow('⚠')} ${warnStr} — ${errorStr}`);
    } else {
      console.log(`  ${c.red('✖')} Invalid — ${errorStr}, ${warnStr}`);
    }

    console.log();
  }

  if (totalErrors > 0) {
    process.exit(1);
  }
}
