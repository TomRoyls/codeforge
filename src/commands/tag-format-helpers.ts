import chalk from 'chalk'

import type { CodeTag, TagAuthor, TagResult, TagStats, TagSummary } from './tag-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityBadge(priority: string): string {
  switch (priority) {
    case 'critical': return chalk.bgRed.white(' CRIT ')
    case 'high': return chalk.red(' HIGH ')
    case 'medium': return chalk.yellow(' MED ')
    default: return chalk.green(' LOW ')
  }
}

function typeBadge(type: string): string {
  switch (type) {
    case 'BUG': return chalk.red('BUG')
    case 'FIXME': return chalk.rgb(255, 100, 0)('FIXME')
    case 'HACK': return chalk.rgb(255, 165, 0)('HACK')
    case 'DEPRECATED': return chalk.rgb(200, 80, 80)('DEPR')
    case 'XXX': return chalk.yellow('XXX')
    case 'TODO': return chalk.cyan('TODO')
    case 'PERF': return chalk.magenta('PERF')
    case 'OPTIMIZE': return chalk.magenta('OPTI')
    case 'NOTE': return chalk.gray('NOTE')
    default: return chalk.white(type)
  }
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length)
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str
}

// ─── Tag Table ────────────────────────────────────────────────────────────────

/**
 * Format tags as a table with type badges and priority.
 *
 * @example
 * formatTagTable(tags) // 'Type  Priority  File  Line  Message'
 */
export function formatTagTable(tags: CodeTag[]): string {
  if (tags.length === 0) return chalk.gray('  No tags found.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Code Tags'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))
  lines.push(`  ${chalk.bold(padRight('Type', 10))} ${chalk.bold(padRight('Priority', 10))} ${chalk.bold(padRight('File', 25))} ${chalk.bold(padRight('Line', 8))} ${chalk.bold('Message')}`)

  for (const tag of tags.slice(0, 30)) {
    const file = truncate(tag.file, 23)
    const msg = truncate(tag.message, 35)
    lines.push(`  ${typeBadge(tag.type)}  ${padRight('', 4)} ${priorityBadge(tag.priority)}  ${padRight(file, 25)} ${padRight(String(tag.line), 8)} ${chalk.gray(msg)}`)
  }

  if (tags.length > 30) {
    lines.push(`  ${chalk.gray(`... and ${tags.length - 30} more`)}`)
  }

  return lines.join('\n')
}

// ─── Summary by Type ──────────────────────────────────────────────────────────

/**
 * Format tag summary grouped by type.
 *
 * @example
 * formatTagSummary(summaries) // 'TODO  5 tags  avg age: 10d  files: 3'
 */
export function formatTagSummary(summaries: TagSummary[]): string {
  if (summaries.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Summary by Type'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const s of summaries) {
    const ageStr = s.averageAge > 0 ? `${s.averageAge}d` : '-'
    lines.push(`  ${typeBadge(s.type)}  ${chalk.bold(String(s.count))} tags  ${chalk.gray(`avg age: ${ageStr}`)}  ${chalk.gray(`files: ${s.files.length}`)}`)
  }

  return lines.join('\n')
}

// ─── Author Breakdown ─────────────────────────────────────────────────────────

/**
 * Format author tag breakdown.
 *
 * @example
 * formatAuthorBreakdown(authors) // 'alice  3 tags  TODO:2 FIXME:1'
 */
export function formatAuthorBreakdown(authors: TagAuthor[]): string {
  if (authors.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Author Breakdown'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const a of authors.slice(0, 10)) {
    const typeStr = Object.entries(a.types).map(([k, v]) => `${k}:${v}`).join(' ')
    lines.push(`  ${chalk.bold(padRight(a.author, 20))} ${chalk.bold(String(a.count))} tags  ${chalk.gray(typeStr)}`)
  }

  return lines.join('\n')
}

// ─── Priority List ────────────────────────────────────────────────────────────

/**
 * Format priority action list.
 *
 * @example
 * formatPriorityList(priority) // '1. [CRIT] app.ts:42 - BUG: fix crash'
 */
export function formatPriorityList(tags: CodeTag[]): string {
  if (tags.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Priority Action List'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const tag of tags.slice(0, 15)) {
    const ageStr = tag.age > 0 ? ` (${tag.age}d old)` : ''
    lines.push(`  ${priorityBadge(tag.priority)} ${chalk.bold(`${tag.file}:${tag.line}`)} - ${typeBadge(tag.type)}: ${chalk.gray(truncate(tag.message, 40))}${chalk.gray(ageStr)}`)
  }

  if (tags.length > 15) {
    lines.push(`  ${chalk.gray(`... and ${tags.length - 15} more`)}`)
  }

  return lines.join('\n')
}

// ─── Density Meter ────────────────────────────────────────────────────────────

/**
 * Format tag density meter.
 *
 * @example
 * formatDensityMeter(2.5) // 'Tag density: 2.5/1000 lines [█░░░░░░░░░]'
 */
export function formatDensityMeter(density: number): string {
  const maxDensity = 20
  const filled = Math.min(Math.round((density / maxDensity) * 10), 10)
  const empty = 10 - filled
  const bar = chalk.red('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))

  const densityColor = density > 10 ? chalk.red : density > 5 ? chalk.yellow : chalk.green
  return `\n  Tag density: ${densityColor(String(density))} per 1000 lines [${bar}]`
}

// ─── Stats Line ───────────────────────────────────────────────────────────────

/**
 * Format stats summary line.
 *
 * @example
 * formatStatsLine(stats) // 'Total: 10  Critical: 0  High: 1  ...'
 */
export function formatStatsLine(stats: TagStats): string {
  return chalk.gray(`\n  Tags: ${stats.totalTags}  Critical: ${stats.criticalCount}  High: ${stats.highCount}  Medium: ${stats.mediumCount}  Low: ${stats.lowCount}  Deprecated: ${stats.deprecatedCount}  Avg Age: ${stats.averageAge}d`)
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete tag result as table output.
 *
 * @example
 * formatTagResultTable(result, false) // full dashboard output
 */
export function formatTagResultTable(result: TagResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatTagTable(result.tags))
  sections.push(formatTagSummary(result.summaries))
  sections.push(formatDensityMeter(result.stats.tagDensity))
  sections.push(formatStatsLine(result.stats))

  if (result.authors.length > 0) {
    sections.push(formatAuthorBreakdown(result.authors))
  }

  if (verbose || result.priority.filter((t) => t.priority === 'critical' || t.priority === 'high').length > 0) {
    sections.push(formatPriorityList(result.priority))
  }

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ─────────────────────────────────────────────────'))
    for (const rec of result.recommendations) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format tag result as JSON.
 *
 * @example
 * formatTagJson(result) // '{"tags":[...]...}'
 */
export function formatTagJson(result: TagResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format tag result as CSV.
 *
 * @example
 * formatTagCsv(result) // 'type,file,line,priority,message'
 */
export function formatTagCsv(result: TagResult): string {
  const lines: string[] = ['type,file,line,priority,message,author,age']

  for (const tag of result.tags) {
    const msg = tag.message.replace(/"/g, '""')
    lines.push(`${tag.type},"${tag.file}",${tag.line},${tag.priority},"${msg}",${tag.author},${tag.age}`)
  }

  return lines.join('\n')
}
