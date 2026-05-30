import chalk from 'chalk'

import type { ChangelogResult } from './changelog-helpers.js'

// ─── Markdown formatting ────────────────────────────────

/**
 * Format a changelog result as markdown.
 *
 * @example
 * const md = formatChangelogMarkdown(result, false)
 */
export function formatChangelogMarkdown(result: ChangelogResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('# Changelog')
  lines.push(`_Generated on ${result.generatedAt}_`)
  lines.push('')

  if (result.from && result.to) {
    lines.push(`## ${result.from}..${result.to}`)
    lines.push('')
  }

  lines.push(`**Total commits: ${result.totalCommits}**`)
  lines.push('')

  for (const group of result.groups) {
    lines.push(`### ${group.title}`)
    lines.push('')

    for (const commit of group.commits) {
      const hash = verbose ? commit.hash : commit.shortHash
      const scopePart = commit.scope ? `**${commit.scope}**: ` : ''
      const breakingTag = commit.breaking ? ' ⚠️ BREAKING' : ''
      lines.push(`- ${scopePart}${commit.subject}${breakingTag} (${hash})`)
    }

    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

// ─── Text formatting ────────────────────────────────────

const TYPE_COLORS: Record<string, (text: string) => string> = {
  chore: chalk.gray,
  docs: chalk.blue,
  feat: chalk.green,
  fix: chalk.red,
  other: chalk.white,
  perf: chalk.magenta,
  refactor: chalk.cyan,
  test: chalk.yellow,
}

/**
 * Format a changelog result as colored plain text.
 *
 * @example
 * const text = formatChangelogText(result, false)
 */
export function formatChangelogText(result: ChangelogResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push(chalk.bold('Changelog'))
  lines.push(chalk.dim(`Generated on ${result.generatedAt}`))
  lines.push('')

  if (result.from && result.to) {
    lines.push(chalk.bold(`${result.from}..${result.to}`))
    lines.push('')
  }

  lines.push(chalk.dim(`Total commits: ${result.totalCommits}`))
  lines.push('')

  for (const group of result.groups) {
    const colorFn = TYPE_COLORS[group.type] ?? ((text: string) => chalk.white(text))
    lines.push(chalk.bold(colorFn(group.title)))
    lines.push('')

    for (const commit of group.commits) {
      const hash = verbose ? commit.hash : commit.shortHash
      const scopePart = commit.scope ? chalk.bold(`${commit.scope}: `) : ''
      const breakingTag = commit.breaking ? chalk.bgRed.white(' BREAKING ') : ''
      lines.push(`  ${scopePart}${commit.subject}${breakingTag} ${chalk.dim(`(${hash})`)}`)
    }

    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format a changelog result as pretty-printed JSON.
 *
 * @example
 * const json = formatChangelogJson(result)
 */
export function formatChangelogJson(result: ChangelogResult): string {
  return JSON.stringify(result, null, 2)
}
