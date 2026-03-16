/**
 * ANSI color utility — zero external dependencies
 * Respects NO_COLOR env variable and --no-color flag
 */

let colorEnabled = true;

export function setColorEnabled(enabled: boolean): void {
  colorEnabled = enabled;
}

export function isColorEnabled(): boolean {
  return colorEnabled && process.env['NO_COLOR'] === undefined && process.env['TERM'] !== 'dumb';
}

function wrap(code: string, s: string): string {
  if (!isColorEnabled()) return s;
  return `\x1b[${code}m${s}\x1b[0m`;
}

export const c = {
  red:     (s: string) => wrap('31', s),
  green:   (s: string) => wrap('32', s),
  yellow:  (s: string) => wrap('33', s),
  blue:    (s: string) => wrap('34', s),
  magenta: (s: string) => wrap('35', s),
  cyan:    (s: string) => wrap('36', s),
  gray:    (s: string) => wrap('90', s),
  bold:    (s: string) => wrap('1', s),
  dim:     (s: string) => wrap('2', s),
  white:   (s: string) => wrap('37', s),
  /** bright white — used for important values */
  bright:  (s: string) => wrap('97', s),
};
