import chalk from 'chalk'

import type { ChangelogsResult } from './changelogs-helpers.js'

// ─── Type colors ──────────────────────────────────────────

const TYPE_COLORS: Record<string, (s: string) => string> = {
  build: chalk.dim,
  chore: chalk.dim,
  ci: chalk.dim,
  docs: chalk.blue,
  feat: chalk.green,
  fix: chalk.red,
  other: chalk.white,
  perf: chalk.magenta,
  refactor: chalk.cyan,
  revert: chalk.yellow,
  style: chalk.dim,
  test: chalk.yellow,
}

function formatType(type: string): string {
  const color = TYPE_COLORS[type] ?? chalk.white
  return color(type)
}

// ─── Conventional format ──────────────────────────────────

/**
 * Format changelog in conventional commit style.
 *
 * @example
 * ```ts
 * const output = formatConventional(result)
 * console.log(output)
 * ```
 */
export function formatConventional(result: ChangelogsResult): string {
  const lines: string[] = [chalk.bold('# Changelog'), '']

  for (const version of result.versions) {
    lines.push(chalk.bold(`## [${version.version}] - ${version.date}`))
    lines.push('')

    for (const group of version.groups) {
      if (group.commits.length === 0) continue
      lines.push(chalk.bold(`### ${group.title}`))
      lines.push('')

      for (const commit of group.commits) {
        const prefix = commit.breaking ? chalk.bold.red('⚠ BREAKING ') : ''
        const scope = commit.scope ? chalk.dim(`(${commit.scope}) `) : ''
        const msg = stripTypePrefix(commit.message)
        lines.push(`- ${prefix}${scope}${msg} ${chalk.dim(`(${commit.shortHash})`)}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ─── Simple format ────────────────────────────────────────

/**
 * Format changelog as a flat list.
 *
 * @example
 * ```ts
 * const output = formatSimple(result)
 * console.log(output)
 * ```
 */
export function formatSimple(result: ChangelogsResult): string {
  const lines: string[] = []

  for (const version of result.versions) {
    for (const group of version.groups) {
      for (const commit of group.commits) {
        const date = commit.date.split('T')[0]
        lines.push(`${date} ${chalk.dim(commit.shortHash)} ${commit.message}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── Detailed format ──────────────────────────────────────

/**
 * Format changelog with full details including author and scope.
 *
 * @example
 * ```ts
 * const output = formatDetailed(result, false)
 * console.log(output)
 * ```
 */
export function formatDetailed(result: ChangelogsResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('# Changelog (Detailed)'), '']

  lines.push(`Total commits: ${result.totalCommits}`)
  if (result.dateRange) lines.push(`Date range: ${result.dateRange}`)
  if (result.authors.length > 0) {
    lines.push(`Authors: ${result.authors.join(', ')}`)
  }
  lines.push('')

  for (const version of result.versions) {
    lines.push(chalk.bold(`## [${version.version}] - ${version.date}`))
    lines.push('')

    for (const group of version.groups) {
      if (group.commits.length === 0) continue
      lines.push(chalk.bold(`### ${group.title}`))
      lines.push('')

      for (const commit of group.commits) {
        const prefix = commit.breaking ? chalk.bold.red('⚠ BREAKING ') : ''
        const scope = commit.scope ? chalk.dim(`(${commit.scope}) `) : ''
        const msg = stripTypePrefix(commit.message)
        const typeTag = chalk.dim(`[${formatType(commit.type)}]`)

        lines.push(
          `- ${prefix}${scope}${msg} ${typeTag} ${chalk.dim(`(${commit.shortHash})`)} ${chalk.cyan(`by ${commit.author}`)}`,
        )

        if (verbose && commit.body) {
          lines.push(`    ${chalk.dim(commit.body.split('\n')[0])}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ─── JSON format ──────────────────────────────────────────

/**
 * Format changelog result as JSON.
 *
 * @example
 * ```ts
 * const json = formatChangelogJson(result)
 * console.log(json)
 * ```
 */
export function formatChangelogJson(result: ChangelogsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Utility ──────────────────────────────────────────────

function stripTypePrefix(message: string): string {
  const match = message.match(/^[a-z]+(\([^)]*\))?(\!)?:\s*(.*)/)
  return match?.[3] ?? message
}
