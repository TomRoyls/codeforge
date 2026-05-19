import chalk from 'chalk'

import type { AuthorChurn, ChurnResult, ChurnStats, FileChurn, TimeChurn } from './churn-helpers.js'

// ─── Severity Helpers ─────────────────────────────────────────────────────────

/**
 * Format a hotspot indicator.
 *
 * @example
 * hotspotBadge(true) // red '🔥'
 * hotspotBadge(false) // dim '  '
 */
export function hotspotBadge(isHotspot: boolean): string {
  return isHotspot ? chalk.red('🔥') : chalk.dim('  ')
}

/**
 * Format net change with color.
 *
 * @example
 * formatNetChange(50) // green '+50'
 * formatNetChange(-30) // red '-30'
 */
export function formatNetChange(change: number): string {
  if (change > 0) return chalk.green(`+${change}`)
  if (change < 0) return chalk.red(String(change))
  return chalk.dim('0')
}

// ─── ASCII Chart ──────────────────────────────────────────────────────────────

/**
 * Render an ASCII bar chart of churn over time.
 *
 * @example
 * formatTimeChart(timeChurn) // '2024-01 | ████████ 80 | +120 -40'
 */
export function formatTimeChart(timeChurn: TimeChurn[]): string {
  if (timeChurn.length === 0) return chalk.dim('  No time data available')

  const maxCommits = Math.max(...timeChurn.map((t) => t.commits), 1)
  const lines: string[] = []

  for (const tc of timeChurn) {
    const barWidth = 20
    const filled = Math.round((tc.commits / maxCommits) * barWidth)
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled)
    const color = tc.commits > maxCommits * 0.7 ? chalk.red : tc.commits > maxCommits * 0.3 ? chalk.yellow : chalk.green
    lines.push(`  ${chalk.bold(tc.period)} ${color(bar)} ${String(tc.commits).padStart(3)} commits  ${formatNetChange(tc.netChange)}`)
  }

  return lines.join('\n')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format stats summary.
 *
 * @example
 * formatChurnStats(stats) // 'Total commits: 50 ...'
 */
export function formatChurnStats(stats: ChurnStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.dim('Total commits:')}       ${stats.totalCommits}`)
  lines.push(`  ${chalk.dim('Total additions:')}    ${chalk.green(String(stats.totalAdditions))}`)
  lines.push(`  ${chalk.dim('Total deletions:')}    ${chalk.red(String(stats.totalDeletions))}`)
  lines.push(`  ${chalk.dim('Files changed:')}      ${stats.totalFilesChanged}`)
  lines.push(`  ${chalk.dim('Hotspot files:')}      ${stats.hotspotFiles}`)
  lines.push(`  ${chalk.dim('Avg churn score:')}    ${stats.averageChurnScore}`)
  lines.push(`  ${chalk.dim('Most churned file:')}  ${stats.mostChurnedFile || 'N/A'}`)
  lines.push(`  ${chalk.dim('Most active author:')} ${stats.mostActiveAuthor || 'N/A'}`)
  return lines.join('\n')
}

/**
 * Format file churn row.
 *
 * @example
 * formatFileChurnRow(fc) // '🔥 src/core.ts  8 commits  score: 120 ...'
 */
export function formatFileChurnRow(fc: FileChurn): string {
  const badge = hotspotBadge(fc.hotspots)
  const file = fc.file.padEnd(40)
  const commits = String(fc.commitCount).padStart(3)
  const net = formatNetChange(fc.netChange)
  return `  ${badge} ${chalk.dim(file)} ${commits} commits  score:${String(fc.churnScore).padStart(6)}  ${net}`
}

/**
 * Format author churn row.
 *
 * @example
 * formatAuthorChurnRow(ac) // '  Alice  15 commits  +500 -200 ...'
 */
export function formatAuthorChurnRow(ac: AuthorChurn): string {
  const author = ac.author.padEnd(20)
  const commits = String(ac.commitCount).padStart(3)
  const net = formatNetChange(ac.netChange)
  return `  ${chalk.dim(author)} ${commits} commits  +${ac.additions} -${ac.deletions}  ${net}`
}

/**
 * Format the complete churn analysis as a table.
 *
 * @example
 * formatChurnTable(result) // full colored terminal output
 */
export function formatChurnTable(result: ChurnResult, verbose?: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.underline('Code Churn Analysis'))
  lines.push('')

  lines.push(chalk.bold('Overview:'))
  lines.push(formatChurnStats(result.stats))
  lines.push('')

  if (result.fileChurn.length > 0) {
    lines.push(chalk.bold('File Churn (top):'))
    for (const fc of result.fileChurn) {
      lines.push(formatFileChurnRow(fc))
    }
    lines.push('')
  }

  if (result.authorChurn.length > 0) {
    lines.push(chalk.bold('Author Leaderboard:'))
    for (const ac of result.authorChurn) {
      lines.push(formatAuthorChurnRow(ac))
    }
    lines.push('')
  }

  if (result.timeChurn.length > 0) {
    lines.push(chalk.bold('Churn Over Time:'))
    lines.push(formatTimeChart(result.timeChurn))
    lines.push('')
  }

  if (result.hotspots.length > 0) {
    lines.push(chalk.bold.red('Hotspot Warnings:'))
    for (const hs of result.hotspots) {
      lines.push(`  ${chalk.red('⚠')} ${hs.file} — score ${hs.churnScore} (${hs.commitCount} commits, ${hs.authorCount} authors)`)
    }
    lines.push('')
  }

  if (verbose && result.authorChurn.length > 0) {
    lines.push(chalk.bold('Author Details:'))
    for (const ac of result.authorChurn.slice(0, 5)) {
      lines.push(`  ${chalk.bold(ac.author)}: avg change size ${ac.averageChangeSize} lines`)
      for (const f of ac.mostChangedFiles.slice(0, 3)) {
        lines.push(chalk.dim(`    - ${f}`))
      }
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format churn analysis as JSON.
 *
 * @example
 * formatChurnJson(result) // '{"fileChurn":[...],...}'
 */
export function formatChurnJson(result: ChurnResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format file churn as CSV.
 *
 * @example
 * formatChurnCsv(result) // 'file,commits,additions,...'
 */
export function formatChurnCsv(result: ChurnResult): string {
  const header = 'file,commitCount,authorCount,additions,deletions,netChange,churnScore,hotspot'
  const rows = result.fileChurn.map((fc) =>
    `"${fc.file}",${fc.commitCount},${fc.authorCount},${fc.totalAdditions},${fc.totalDeletions},${fc.netChange},${fc.churnScore},${fc.hotspots}`
  )
  return [header, ...rows].join('\n')
}
