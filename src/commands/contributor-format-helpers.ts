import chalk from 'chalk'

import type { Contributor, ContributorResult, KnowledgeSilos } from './contributor-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length)
}

function riskIcon(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'high': return chalk.red('●')
    case 'medium': return chalk.yellow('●')
    case 'low': return chalk.green('●')
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

// ─── Leaderboard Table ────────────────────────────────────────────────────────

/**
 * Format contributor leaderboard as a table.
 *
 * @example
 * formatLeaderboard(contributors) // '#  Name        Commits  Additions  ...'
 */
export function formatLeaderboard(contributors: Contributor[]): string {
  if (contributors.length === 0) return chalk.gray('  No contributors found.')

  const lines: string[] = []
  lines.push(chalk.bold('  Contributor Leaderboard'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  lines.push(`  ${chalk.bold(padRight('#', 3))} ${chalk.bold(padRight('Name', 20))} ${chalk.bold(padRight('Commits', 10))} ${chalk.bold(padRight('+/-', 12))} ${chalk.bold(padRight('Files', 8))} ${chalk.bold('Active Days')}`)

  for (let i = 0; i < contributors.length; i++) {
    const c = contributors[i]!
    const rank = String(i + 1).padStart(2)
    const name = c.name.length > 18 ? c.name.slice(0, 17) + '…' : c.name
    const netColor = c.netChange >= 0 ? chalk.green : chalk.red
    const netStr = `${c.netChange >= 0 ? '+' : ''}${formatNumber(c.netChange)}`

    lines.push(`  ${chalk.gray(rank)}  ${padRight(name, 20)} ${padRight(String(c.commitCount), 10)} ${netColor(padRight(netStr, 12))} ${padRight(String(c.filesChanged), 8)} ${c.activeDays}`)
  }

  return lines.join('\n')
}

// ─── Distribution Chart ───────────────────────────────────────────────────────

/**
 * Format contribution distribution as an ASCII chart.
 *
 * @example
 * formatDistributionChart(contributors) // visual bar chart of commits per contributor
 */
export function formatDistributionChart(contributors: Contributor[]): string {
  if (contributors.length === 0) return ''

  const maxCommits = Math.max(...contributors.map((c) => c.commitCount), 1)
  const barWidth = 30

  const lines: string[] = []
  lines.push(chalk.bold('\n  Contribution Distribution'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const c of contributors.slice(0, 10)) {
    const barLen = Math.round((c.commitCount / maxCommits) * barWidth)
    const bar = '█'.repeat(barLen)
    const pct = Math.round((c.commitCount / contributors.reduce((s, x) => s + x.commitCount, 0)) * 100)
    lines.push(`  ${chalk.cyan(padRight(c.name.slice(0, 16), 16))} ${chalk.cyan(bar)} ${chalk.bold(String(pct))}%`)
  }

  return lines.join('\n')
}

// ─── Bus Factor Display ───────────────────────────────────────────────────────

/**
 * Format bus factor indicator.
 *
 * @example
 * formatBusFactor(1) // '🚌 Bus Factor: 1 (CRITICAL)'
 */
export function formatBusFactor(busFactor: number): string {
  const label = busFactor <= 1 ? chalk.bgRed.white(' CRITICAL ') : busFactor <= 2 ? chalk.yellow(' WARNING ') : chalk.green(' OK ')
  return `  Bus Factor: ${chalk.bold(String(busFactor))} ${label}`
}

// ─── Knowledge Silo Warnings ──────────────────────────────────────────────────

/**
 * Format knowledge silo warnings.
 *
 * @example
 * formatSilos(silos) // '● src/core.ts — Alice (95%) HIGH RISK'
 */
export function formatSilos(silos: KnowledgeSilos[]): string {
  if (silos.length === 0) return chalk.gray('\n  No knowledge silos detected.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Knowledge Silos'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const s of silos.slice(0, 10)) {
    const pct = Math.round(s.primaryPercentage * 100)
    lines.push(`  ${riskIcon(s.risk)} ${padRight(s.file, 30)} ${chalk.cyan(padRight(s.primaryAuthor, 16))} ${chalk.bold(String(pct))}% ${s.risk === 'high' ? chalk.red('HIGH') : s.risk === 'medium' ? chalk.yellow('MED') : chalk.green('LOW')}`)
  }

  return lines.join('\n')
}

// ─── Expertise Map ────────────────────────────────────────────────────────────

/**
 * Format expertise areas per contributor.
 *
 * @example
 * formatExpertiseMap(contributors) // 'Alice: src/ui, src/components'
 */
export function formatExpertiseMap(contributors: Contributor[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n  Expertise Map'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const c of contributors.slice(0, 10)) {
    if (c.expertise.length > 0) {
      lines.push(`  ${chalk.bold(padRight(c.name, 16))} ${chalk.gray(c.expertise.join(', '))}`)
    }
  }

  return lines.join('\n')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete contributor result as table output.
 *
 * @example
 * formatContributorTable(result, false) // full dashboard output
 */
export function formatContributorTable(result: ContributorResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatLeaderboard(result.contributors))
  sections.push(formatDistributionChart(result.contributors))

  const d = result.distribution
  sections.push(chalk.bold('\n  Distribution Metrics'))
  sections.push(chalk.gray('  ─────────────────────────────────────────'))
  sections.push(`  Gini Coefficient: ${chalk.bold(String(d.giniCoefficient))}  ${d.giniCoefficient > 0.6 ? chalk.red('(uneven)') : chalk.green('(balanced)')}`)
  sections.push(`  Top Contributor: ${chalk.bold(String(Math.round(d.topContributorPercentage * 100)))}%`)
  sections.push(`  Active (90d): ${chalk.bold(String(d.activeContributors))}/${d.totalContributors}  New (30d): ${chalk.bold(String(d.newContributors))}`)
  sections.push(formatBusFactor(d.busFactor))

  sections.push(formatSilos(result.silos))

  if (verbose || result.contributors.length <= 10) {
    sections.push(formatExpertiseMap(result.contributors))
  }

  sections.push(chalk.gray(`\n  Total Commits: ${result.stats.totalCommits}  Contributors: ${result.stats.totalContributors}  Avg: ${result.stats.averageCommitsPerContributor}`))

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ─────────────────────────────────────────'))
    for (const rec of result.recommendations) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format contributor result as JSON.
 *
 * @example
 * formatContributorJson(result) // '{"contributors":[...]...}'
 */
export function formatContributorJson(result: ContributorResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format contributor result as CSV.
 *
 * @example
 * formatContributorCsv(result) // 'name,commitCount,additions,...'
 */
export function formatContributorCsv(result: ContributorResult): string {
  const lines: string[] = ['name,email,commitCount,additions,deletions,netChange,filesChanged,activeDays']

  for (const c of result.contributors) {
    lines.push(`${c.name},${c.email},${c.commitCount},${c.additions},${c.deletions},${c.netChange},${c.filesChanged},${c.activeDays}`)
  }

  return lines.join('\n')
}
