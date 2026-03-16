/**
 * UKDL CLI — help output
 */

import { c } from './colors.js';

export function printHelp(): void {
  const logo = [
    c.cyan('  ╔═══════════════════════════════════════════════╗'),
    c.cyan('  ║') + c.bold('  UKDL — Unified Knowledge & Dynamics Language') + c.cyan(' ║'),
    c.cyan('  ║') + c.dim('  v2.0.0                                       ') + c.cyan(' ║'),
    c.cyan('  ╚═══════════════════════════════════════════════╝'),
  ].join('\n');

  const usage = `
${c.bold('  USAGE')}
    ${c.cyan('ukdl')} ${c.dim('<command>')} ${c.dim('[options]')}

${c.bold('  COMMANDS')}
    ${c.green('parse')}    ${c.dim('<file>')}        Parse a UKDL file and show structure
    ${c.green('validate')} ${c.dim('<file>')}        Validate against the UKDL v2.0 spec
    ${c.green('export')}   ${c.dim('<file>')}        Export to JSON, Markdown, Cypher, or RDF
    ${c.green('graph')}    ${c.dim('<file>')}        Visualize the knowledge graph
    ${c.green('context')}  ${c.dim('<file>')}        Test context window optimization phases
    ${c.green('stats')}    ${c.dim('<file>')}        Show document statistics
    ${c.green('init')}     ${c.dim('[name]')}        Create a new UKDL document
    ${c.green('fmt')}      ${c.dim('<file>')}        Format a UKDL file
    ${c.green('help')}                    Show this help
    ${c.green('version')}                 Show version

${c.bold('  OPTIONS')}
    ${c.yellow('--format')}  ${c.dim('<fmt>')}       Export format: ${c.cyan('json')}, ${c.cyan('markdown')}, ${c.cyan('cypher')}, ${c.cyan('rdf')}
    ${c.yellow('--phase')}   ${c.dim('<phase>')}     Context phase: ${c.cyan('full')}, ${c.cyan('summary')}, ${c.cyan('priority')}, ${c.cyan('skeleton')}, ${c.cyan('quantum')}
    ${c.yellow('--level')}   ${c.dim('<0-5>')}       Document level for init
    ${c.yellow('--output')}  ${c.dim('<file>')}      Write output to file instead of stdout
    ${c.yellow('-q, --quiet')}           Suppress non-essential output
    ${c.yellow('--no-color')}            Disable colored output

${c.bold('  EXAMPLES')}
    ${c.dim('$ ukdl parse lesson.ukdl')}
    ${c.dim('$ ukdl validate lesson.ukdl')}
    ${c.dim('$ ukdl export lesson.ukdl --format json > lesson.json')}
    ${c.dim('$ ukdl graph lesson.ukdl')}
    ${c.dim('$ ukdl context lesson.ukdl --phase summary')}
    ${c.dim('$ ukdl init my-knowledge --level 3')}
    ${c.dim('$ ukdl stats lesson.ukdl')}

${c.bold('  LEARN MORE')}
    Specification: ${c.cyan('https://ukdl.org/spec')}
    GitHub:        ${c.cyan('https://github.com/ukdl/ukdl-language')}
`;

  console.log('\n' + logo + usage);
}

export function printVersion(): void {
  console.log('2.0.0');
}
