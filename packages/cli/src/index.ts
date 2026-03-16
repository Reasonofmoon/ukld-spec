#!/usr/bin/env node
/**
 * UKDL CLI — Command-line interface for the Unified Knowledge & Dynamics Language
 * v2.0.0
 *
 * Usage: ukdl <command> [options]
 */

import { setColorEnabled } from './colors.js';
import { printHelp, printVersion } from './help.js';
import { runParse } from './commands/parse.js';
import { runValidate } from './commands/validate.js';
import { runExport } from './commands/export-cmd.js';
import type { ExportFormat } from './commands/export-cmd.js';
import { runGraph } from './commands/graph.js';
import { runContext } from './commands/context.js';
import type { ContextPhase } from '@ukdl/parser';
import { runStats } from './commands/stats.js';
import { runInit } from './commands/init.js';
import { runFmt } from './commands/fmt.js';
import { c } from './colors.js';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface ParsedArgs {
  command: string | null;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2); // strip node + script path
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let command: string | null = null;

  let i = 0;
  while (i < args.length) {
    const arg = args[i]!;

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else {
      if (command === null) {
        command = arg;
      } else {
        positionals.push(arg);
      }
      i++;
    }
  }

  return { command, positionals, flags };
}

// ---------------------------------------------------------------------------
// Shared option helpers
// ---------------------------------------------------------------------------

function getString(flags: Record<string, string | boolean>, key: string): string | undefined {
  const v = flags[key];
  return typeof v === 'string' ? v : undefined;
}

function getBool(flags: Record<string, string | boolean>, ...keys: string[]): boolean {
  return keys.some(k => flags[k] === true);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { command, positionals, flags } = parseArgs(process.argv);

  // Global flags
  if (flags['no-color']) {
    setColorEnabled(false);
  }

  const quiet = getBool(flags, 'q', 'quiet');

  if (!command || command === 'help' || flags['help'] || flags['h']) {
    printHelp();
    return;
  }

  if (command === 'version' || flags['version'] || flags['v']) {
    printVersion();
    return;
  }

  switch (command) {
    // -----------------------------------------------------------------------
    case 'parse': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl parse <file.ukdl>'));
        process.exit(1);
      }
      await runParse(file, { quiet });
      break;
    }

    // -----------------------------------------------------------------------
    case 'validate': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl validate <file.ukdl>'));
        process.exit(1);
      }
      await runValidate(file, { quiet });
      break;
    }

    // -----------------------------------------------------------------------
    case 'export': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl export <file.ukdl> --format json|markdown|cypher|rdf'));
        process.exit(1);
      }
      const format = (getString(flags, 'format') ?? 'json') as ExportFormat;
      const validFormats: ExportFormat[] = ['json', 'markdown', 'cypher', 'rdf'];
      if (!validFormats.includes(format)) {
        console.error(c.red(`Error: Unknown format "${format}"`));
        console.error(c.dim(`  Valid formats: ${validFormats.join(', ')}`));
        process.exit(1);
      }
      await runExport(file, {
        format,
        output: getString(flags, 'output'),
        quiet,
      });
      break;
    }

    // -----------------------------------------------------------------------
    case 'graph': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl graph <file.ukdl>'));
        process.exit(1);
      }
      await runGraph(file, {
        quiet,
        output: getString(flags, 'output'),
      });
      break;
    }

    // -----------------------------------------------------------------------
    case 'context': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl context <file.ukdl> [--phase full|summary|priority|skeleton|quantum]'));
        process.exit(1);
      }
      const phaseRaw = getString(flags, 'phase');
      const validPhases: ContextPhase[] = ['full', 'summary', 'priority', 'skeleton', 'quantum'];
      if (phaseRaw && !validPhases.includes(phaseRaw as ContextPhase)) {
        console.error(c.red(`Error: Unknown phase "${phaseRaw}"`));
        console.error(c.dim(`  Valid phases: ${validPhases.join(', ')}`));
        process.exit(1);
      }
      await runContext(file, {
        phase: phaseRaw as ContextPhase | undefined,
        output: getString(flags, 'output'),
        quiet,
      });
      break;
    }

    // -----------------------------------------------------------------------
    case 'stats': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl stats <file.ukdl>'));
        process.exit(1);
      }
      await runStats(file, { quiet });
      break;
    }

    // -----------------------------------------------------------------------
    case 'init': {
      const name = positionals[0];
      const levelRaw = getString(flags, 'level');
      let level: number | undefined;
      if (levelRaw !== undefined) {
        level = parseInt(levelRaw, 10);
        if (isNaN(level) || level < 0 || level > 5) {
          console.error(c.red(`Error: --level must be 0–5, got: "${levelRaw}"`));
          process.exit(1);
        }
      }
      await runInit(name, {
        level,
        output: getString(flags, 'output'),
        quiet,
      });
      break;
    }

    // -----------------------------------------------------------------------
    case 'fmt': {
      const file = positionals[0];
      if (!file) {
        console.error(c.red('Error: Missing file argument'));
        console.error(c.dim('  Usage: ukdl fmt <file.ukdl>'));
        process.exit(1);
      }
      const outputFlag = getString(flags, 'output');
      await runFmt(file, {
        output: outputFlag,
        stdout: outputFlag === '-',
        quiet,
      });
      break;
    }

    // -----------------------------------------------------------------------
    default: {
      console.error(c.red(`Unknown command: "${command}"`));
      console.error(c.dim('  Run ukdl help for available commands'));
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error(c.red('Fatal error:'), err instanceof Error ? err.message : String(err));
  if (process.env['DEBUG']) {
    console.error(err);
  }
  process.exit(1);
});
