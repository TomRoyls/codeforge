import chalk from 'chalk'

import { formatNumber, padRight, padLeft } from '../utils/format-utils.js'
import type { GitStatsResult } from './gitstats-helpers.js'

// ─── Number formatting ───────────────────────────────────

// ─── Bar chart ───────────────────────────────────────────

/**
 * Render an ASCII bar chart from label/value pairs.
 *
 * @example
 * ```ts
 * formatBarChart([{ label: 'Mon', value: 10 }, { label: 'Tue', value: 5 }], 20, 3)
 * ```
 */
export function formatBarChart(
  data: { label: string; value: number }[],
  maxBars: number = 30,
  maxLabelLen: number = 4,
): string {
  if (data.length === 0) return ''

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const lines: string[] = []

  for (const item of data) {
    const label = item.label.padEnd(maxLabelLen)
    const barCount = Math.round((item.value / maxValue) * maxBars)
    const filled = '█'.repeat(barCount)
    const empty = '░'.repeat(maxBars - barCount)
    lines.push(`  ${chalk.cyan(label)} ${filled}${empty} ${chalk.dim(formatNumber(item.value))}`)
  }

  return lines.join('\n')
}

// ─── JSON formatting ─────────────────────────────────────

/**
 * Format GitStatsResult as clean JSON.
 *
 * @example
 * ```ts
 * const json = formatGitStatsJson(result)
 * ```
 */
export function formatGitStatsJson(result: GitStatsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table formatting ────────────────────────────────────

/**
 * Format GitStatsResult as a colored table with sections.
 *
 * @example
 * ```ts
 * const table = formatGitStatsTable(result, false)
 * ```
 */
export function formatGitStatsTable(result: GitStatsResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n📊 Git Repository Statistics'), '']

  // ─── Repository Overview ────────────────────────────────
  lines.push(chalk.bold.cyan('Repository Overview'))
  lines.push(chalk.dim('─'.repeat(50)))
  lines.push(`  Commits:        ${chalk.green(formatNumber(result.totalCommits))}`)
  lines.push(`  Authors:        ${chalk.green(formatNumber(result.totalAuthors))}`)
  lines.push(`  Branches:       ${chalk.green(formatNumber(result.totalBranches))}`)
  lines.push(`  Tags:           ${chalk.green(formatNumber(result.totalTags))}`)
  lines.push(`  Current Branch: ${chalk.yellow(result.currentBranch)}`)
  lines.push(`  First Commit:   ${chalk.dim(result.firstCommitDate)}`)
  lines.push(`  Last Commit:    ${chalk.dim(result.lastCommitDate)}`)
  lines.push(`  Active Days:    ${chalk.green(formatNumber(result.activeDays))}`)
  lines.push('')

  // ─── Activity Rates ─────────────────────────────────────
  lines.push(chalk.bold.cyan('Activity'))
  lines.push(chalk.dim('─'.repeat(50)))
  lines.push(`  Commits/Day:    ${chalk.green(String(result.commitsPerDay))}`)
  lines.push(`  Commits/Week:   ${chalk.green(String(result.commitsPerWeek))}`)
  lines.push(`  Commits/Month:  ${chalk.green(String(result.commitsPerMonth))}`)
  lines.push(`  Additions:      ${chalk.green('+' + formatNumber(result.totalAdditions))}`)
  lines.push(`  Deletions:      ${chalk.red('-' + formatNumber(result.totalDeletions))}`)
  lines.push('')

  // ─── Peak Times ─────────────────────────────────────────
  lines.push(chalk.bold.cyan('Peak Times'))
  lines.push(chalk.dim('─'.repeat(50)))
  lines.push(`  Peak Hour:      ${chalk.yellow(String(result.peakHour).padStart(2, '0') + ':00')}`)
  lines.push(`  Peak Day:       ${chalk.yellow(result.peakDay)}`)
  lines.push('')

  // ─── Top Contributors ───────────────────────────────────
  const topContributors = result.contributorStats.slice(0, 10)
  if (topContributors.length > 0) {
    lines.push(chalk.bold.cyan('Top Contributors'))
    lines.push(chalk.dim('─'.repeat(50)))

    const nameWidth = Math.max(15, ...topContributors.map((c) => c.name.length))
    const header =
      chalk.cyan(padRight('Name', nameWidth)) +
      '  ' +
      chalk.cyan(padLeft('Commits', 8)) +
      '  ' +
      chalk.cyan(padLeft('+/-', 12)) +
      '  ' +
      chalk.cyan(padLeft('Active Days', 11))
    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const contributor of topContributors) {
      const plusMinus = `${chalk.green('+' + formatNumber(contributor.additions))}/${chalk.red('-' + formatNumber(contributor.deletions))}`
      lines.push(
        padRight(contributor.name, nameWidth) +
          '  ' +
          padLeft(String(contributor.commits), 8) +
          '  ' +
          padLeft(plusMinus, 12 + 9) + // Extra for ANSI codes
          '  ' +
          padLeft(String(contributor.activeDays), 11),
      )
    }
    lines.push('')
  }

  // ─── Hourly Activity ────────────────────────────────────
  lines.push(chalk.bold.cyan('Hourly Activity'))
  lines.push(chalk.dim('─'.repeat(50)))
  const hourlyData = result.hourlyActivity.map((h) => ({
    label: String(h.hour).padStart(2, '0'),
    value: h.count,
  }))
  lines.push(formatBarChart(hourlyData, 20, 2))
  lines.push('')

  // ─── Daily Activity ─────────────────────────────────────
  lines.push(chalk.bold.cyan('Daily Activity'))
  lines.push(chalk.dim('─'.repeat(50)))
  const dailyData = result.dailyActivity.map((d) => ({
    label: d.day,
    value: d.count,
  }))
  lines.push(formatBarChart(dailyData, 20, 3))
  lines.push('')

  // ─── Bus Factor ─────────────────────────────────────────
  lines.push(chalk.bold.cyan('Bus Factor'))
  lines.push(chalk.dim('─'.repeat(50)))
  const busColor = result.busFactor.factor <= 1 ? chalk.red : result.busFactor.factor <= 3 ? chalk.yellow : chalk.green
  lines.push(`  Factor:            ${busColor.bold(String(result.busFactor.factor))}`)
  lines.push(`  Total Contributors: ${chalk.dim(formatNumber(result.busFactor.totalContributors))}`)
  lines.push(`  Coverage:          ${chalk.dim(result.busFactor.coverage + '%')}`)
  if (result.busFactor.topContributors.length > 0) {
    lines.push(`  Key People:        ${chalk.yellow(result.busFactor.topContributors.join(', '))}`)
  }
  lines.push('')

  // ─── Verbose: Weekly activity ───────────────────────────
  if (verbose && result.weeklyActivity.length > 0) {
    lines.push(chalk.bold.cyan('Weekly Activity'))
    lines.push(chalk.dim('─'.repeat(50)))

    const weekWidth = Math.max(10, ...result.weeklyActivity.map((w) => w.date.length))
    const header =
      chalk.cyan(padRight('Week', weekWidth)) +
      '  ' +
      chalk.cyan(padLeft('Commits', 8)) +
      '  ' +
      chalk.cyan(padLeft('+/-', 12))
    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const week of result.weeklyActivity) {
      const plusMinus = `${chalk.green('+' + formatNumber(week.additions))}/${chalk.red('-' + formatNumber(week.deletions))}`
      lines.push(
        padRight(week.date, weekWidth) +
          '  ' +
          padLeft(String(week.count), 8) +
          '  ' +
          padLeft(plusMinus, 12 + 9),
      )
    }
    lines.push('')
  }

  // ─── Verbose: All contributors ──────────────────────────
  if (verbose && result.contributorStats.length > 10) {
    lines.push(chalk.bold.cyan('All Contributors'))
    lines.push(chalk.dim('─'.repeat(50)))

    const nameWidth = Math.max(15, ...result.contributorStats.map((c) => c.name.length))
    for (const contributor of result.contributorStats) {
      lines.push(
        `  ${padRight(contributor.name, nameWidth)}  ${padLeft(String(contributor.commits), 6)} commits  ${contributor.email}`,
      )
    }
    lines.push('')
  }

  return lines.join('\n')
}
