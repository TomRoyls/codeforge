import chalk from 'chalk'

import type { AsciiOptions, AsciiResult } from './ascii-helpers.js'

// ─── Color map ────────────────────────────────────────

const COLOR_MAP: Record<string, (text: string) => string> = {
  blue: chalk.blue,
  cyan: chalk.cyan,
  green: chalk.green,
  magenta: chalk.magenta,
  red: chalk.red,
  white: chalk.white,
  yellow: chalk.yellow,
}

// ─── Formatting functions ─────────────────────────────

export function colorize(lines: string[], color: string): string[] {
  const colorFn = COLOR_MAP[color]
  if (!colorFn) return lines
  return lines.map(line => colorFn(line))
}

export function addBorder(lines: string[]): string[] {
  if (lines.length === 0) return []

  const maxWidth = lines.reduce((max, line) => Math.max(max, line.length), 0)
  const padded = lines.map(line => line.padEnd(maxWidth))

  const horizontal = '\u2500'.repeat(maxWidth + 2) // ─
  const top = '\u250C' + horizontal + '\u2510' // ┌─┐
  const bottom = '\u2514' + horizontal + '\u2518' // └─┘
  const middle = padded.map(line => '\u2502 ' + line + ' \u2502') // │ │

  return [top, ...middle, bottom]
}

export function wrapInComment(lines: string[]): string[] {
  if (lines.length === 0) return []
  return ['/*', ...lines.map(line => ' * ' + line), ' */']
}

export function formatAsciiOutput(result: AsciiResult, options: AsciiOptions): string[] {
  let lines = [...result.lines]

  if (options.border) {
    lines = addBorder(lines)
  }

  if (options.comment) {
    lines = wrapInComment(lines)
  }

  if (options.color !== 'none') {
    lines = colorize(lines, options.color)
  }

  return lines
}
