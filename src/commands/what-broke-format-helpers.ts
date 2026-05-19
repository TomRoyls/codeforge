import chalk from 'chalk'

import type {
  CommitChange,
  DiffAnalysis,
  FileChange,
  RegressionIndicator,
  WhatBrokeResult,
} from './what-broke-helpers.js'

// ─── statusIcon ─────────────────────────────────────────

/**
 * @example
 * const icon = statusIcon('added')
 * console.log(icon)
 */
export function statusIcon(status: string): string {
  switch (status) {
    case 'added': return chalk.green('+')
    case 'deleted': return chalk.red('-')
    case 'modified': return chalk.yellow('~')
    case 'renamed': return chalk.cyan('→')
    default: return ' '
  }
}

// ─── riskBadge ──────────────────────────────────────────

/**
 * @example
 * const badge = riskBadge('high')
 * console.log(badge)
 */
export function riskBadge(level: string): string {
  switch (level) {
    case 'high': return chalk.bgRed.white.bold(' HIGH RISK ')
    case 'medium': return chalk.bgRgb(255, 165, 0).black.bold(' MEDIUM RISK ')
    case 'low': return chalk.bgGreen.black.bold(' LOW RISK ')
    default: return level
  }
}

// ─── severityIcon ───────────────────────────────────────

/**
 * @example
 * const icon = severityIcon('critical')
 * console.log(icon)
 */
export function severityIcon(sev: string): string {
  return sev === 'critical' ? chalk.red('⬥') : chalk.yellow('⬦')
}

// ─── formatCommitTimeline ───────────────────────────────

/**
 * @example
 * const text = formatCommitTimeline(commits)
 * console.log(text)
 */
export function formatCommitTimeline(commits: CommitChange[]): string {
  if (commits.length === 0) return chalk.gray('No commits in range')

  const lines: string[] = []
  lines.push(chalk.bold.underline('Commit Timeline'))
  lines.push('')

  for (const c of commits.slice(0, 20)) {
    lines.push(`  ${chalk.cyan(c.shortHash)} ${chalk.gray(c.date.slice(0, 10))} ${chalk.bold(c.author.padEnd(15))} ${c.message}`)
  }

  if (commits.length > 20) {
    lines.push(chalk.gray(`  ... and ${commits.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── formatFileChanges ──────────────────────────────────

/**
 * @example
 * const text = formatFileChanges(files)
 * console.log(text)
 */
export function formatFileChanges(files: FileChange[]): string {
  if (files.length === 0) return chalk.gray('No file changes')

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('File Changes'))
  lines.push('')

  const sorted = [...files].sort((a, b) => b.totalChange - a.totalChange)
  for (const f of sorted.slice(0, 30)) {
    const icon = statusIcon(f.status)
    const adds = chalk.green(`+${f.additions}`)
    const dels = chalk.red(`-${f.deletions}`)
    lines.push(`  ${icon} ${f.file.padEnd(50)} ${adds.padEnd(8)} ${dels}`)
  }

  if (files.length > 30) {
    lines.push(chalk.gray(`  ... and ${files.length - 30} more`))
  }

  return lines.join('\n')
}

// ─── formatIndicators ───────────────────────────────────

/**
 * @example
 * const text = formatIndicators(indicators)
 * console.log(text)
 */
export function formatIndicators(indicators: RegressionIndicator[]): string {
  if (indicators.length === 0) return chalk.gray('No regression indicators')

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Regression Indicators'))
  lines.push('')

  for (const ind of indicators) {
    const icon = severityIcon(ind.severity)
    lines.push(`  ${icon} ${chalk.bold(ind.type)}: ${ind.description}`)
    if (ind.files.length > 0) {
      for (const f of ind.files.slice(0, 5)) {
        lines.push(`      ${chalk.gray(f)}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── formatAnalysisSummary ──────────────────────────────

/**
 * @example
 * const text = formatAnalysisSummary(analysis)
 * console.log(text)
 */
export function formatAnalysisSummary(analysis: DiffAnalysis): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Analysis Summary'))
  lines.push(`  ${riskBadge(analysis.riskLevel)}`)
  lines.push(`  Commits: ${analysis.commits.length}`)
  lines.push(`  Authors: ${analysis.authors.join(', ') || 'none'}`)
  lines.push(`  Files changed: ${analysis.files.length}`)
  lines.push(`  Source files: ${analysis.sourceFilesChanged}  Test files: ${analysis.testFilesChanged}`)
  lines.push(`  Complexity delta: ${analysis.complexityDelta > 0 ? chalk.red(`+${analysis.complexityDelta}`) : chalk.green(String(analysis.complexityDelta))}`)
  lines.push(`  New TODOs: ${analysis.newTodos}  Resolved: ${analysis.resolvedTodos}`)
  lines.push(`  Security issues: ${analysis.newSecurityIssues > 0 ? chalk.red(String(analysis.newSecurityIssues)) : chalk.green('0')}`)

  if (analysis.riskFactors.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Risk Factors:'))
    for (const factor of analysis.riskFactors) {
      lines.push(`    ${chalk.yellow('•')} ${factor}`)
    }
  }

  return lines.join('\n')
}

// ─── formatSuggestions ──────────────────────────────────

/**
 * @example
 * const text = formatSuggestions(['Add tests'])
 * console.log(text)
 */
export function formatSuggestions(suggestions: string[]): string {
  if (suggestions.length === 0) return ''

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Suggestions'))
  lines.push('')

  for (const s of suggestions) {
    lines.push(`  ${chalk.cyan('→')} ${s}`)
  }

  return lines.join('\n')
}

// ─── formatWhatBrokeTable ───────────────────────────────

/**
 * @example
 * const text = formatWhatBrokeTable(result)
 * console.log(text.length)
 */
export function formatWhatBrokeTable(result: WhatBrokeResult): string {
  const parts: string[] = []

  parts.push(formatCommitTimeline(result.analysis.commits))
  parts.push(formatFileChanges(result.analysis.files))
  parts.push(formatAnalysisSummary(result.analysis))
  parts.push(formatIndicators(result.indicators))
  parts.push(formatSuggestions(result.suggestions))
  parts.push('')

  return parts.join('\n')
}

// ─── formatWhatBrokeJson ────────────────────────────────

/**
 * @example
 * const json = formatWhatBrokeJson(result)
 * console.log(JSON.parse(json).indicators.length)
 */
export function formatWhatBrokeJson(result: WhatBrokeResult): string {
  return JSON.stringify(result, null, 2)
}
