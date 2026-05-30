import chalk from 'chalk'

import type { AsciiResult, AsciiStats } from './ascii-art-helpers.js'

// ─── Colorize ───────────────────────────────────────────

/**
 * @example
 * const lines = colorize(['###'], 'green')
 * console.log(lines[0])
 */
export function colorize(lines: string[], color: string | null): string[] {
  if (!color) return lines
  if (color.startsWith('#')) return lines.map((l) => chalk.hex(color)(l))
  const rgbMatch = color.match(/^(\d+),(\d+),(\d+)$/)
  if (rgbMatch) {
    const [_, r, g, b] = rgbMatch
    return lines.map((l) => chalk.rgb(Number(r), Number(g), Number(b))(l))
  }
  return lines.map((l) => {
    const fn = (chalk as unknown as Record<string, unknown>)[color]
    return typeof fn === 'function' ? (fn as (t: string) => string)(l) : l
  })
}

// ─── Format Stats Line ──────────────────────────────────

/**
 * @example
 * const text = formatAsciiStats(stats)
 * console.log(text)
 */
export function formatAsciiStats(stats: AsciiStats): string {
  const parts: string[] = []
  parts.push(chalk.bold(stats.name))
  parts.push(chalk.cyan(`v${stats.version}`))
  if (stats.commands > 0) parts.push(chalk.gray(`${stats.commands} commands`))
  if (stats.linesOfCode > 0) parts.push(chalk.gray(`${stats.linesOfCode} LOC`))
  if (stats.languages > 0) parts.push(chalk.gray(`${stats.languages} langs`))
  if (stats.testCount > 0) parts.push(chalk.green(`${stats.testCount} tests`))
  if (stats.description) parts.push(chalk.gray(`— ${stats.description}`))
  return parts.join(` ${chalk.gray('│')} `)
}

// ─── Format Banner ──────────────────────────────────────

/**
 * @example
 * const text = formatBanner(result)
 * console.log(text)
 */
export function formatBanner(result: AsciiResult): string {
  const parts: string[] = []

  for (const line of result.banner) {
    parts.push(line)
  }

  if (result.stats) {
    parts.push('')
    parts.push(formatAsciiStats(result.stats))
  }

  parts.push('')
  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatAsciiJson(result)
 * console.log(json.length)
 */
export function formatAsciiJson(result: AsciiResult): string {
  return JSON.stringify(result, null, 2)
}
