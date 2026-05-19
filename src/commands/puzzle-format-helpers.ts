import chalk from 'chalk'

import type { PuzzleBreakdown, PuzzleResult, PuzzleScore, PuzzleStats } from './puzzle-helpers.js'

// ─── DIFFICULTY_META ──────────────────────────────────────────────────────────

const DIFFICULTY_META: Record<string, { icon: string; color: (s: string) => string }> = {
  trivial: { icon: '🏆', color: chalk.green },
  easy: { icon: '🎮', color: chalk.cyan },
  medium: { icon: '🧩', color: chalk.yellow },
  hard: { icon: '⚡', color: chalk.rgb(255, 165, 0) },
  expert: { icon: '💀', color: chalk.red },
  nightmare: { icon: '☠️', color: chalk.magenta },
}

// ─── formatLeaderboard ────────────────────────────────────────────────────────

/**
 * Format the difficulty leaderboard sorted hardest-first.
 *
 * @example
 * formatLeaderboard(scores) // ASCII leaderboard
 */
export function formatLeaderboard(scores: PuzzleScore[]): string {
  if (scores.length === 0) return 'No files to analyze.'

  const lines: string[] = [
    chalk.bold('  Puzzle Difficulty Leaderboard'),
    chalk.bold('  ──────────────────────────────────────────────'),
  ]

  for (let i = 0; i < scores.length; i++) {
    const s = scores[i]!
    const meta = DIFFICULTY_META[s.difficulty] ?? { icon: '?', color: chalk.white }
    const rank = `#${i + 1}`.padStart(3)
    const icon = meta.icon
    const diff = meta.color(s.difficulty.toUpperCase().padEnd(9))
    const score = `${s.score}/100`.padStart(6)
    lines.push(`  ${rank}  ${icon} ${diff} ${score}  ${s.file}`)
  }

  return lines.join('\n')
}

// ─── formatPuzzleCard ─────────────────────────────────────────────────────────

/**
 * Format a single file's puzzle card with breakdown bars.
 *
 * @example
 * formatPuzzleCard(score) // card with breakdown
 */
export function formatPuzzleCard(score: PuzzleScore): string {
  const meta = DIFFICULTY_META[score.difficulty] ?? { icon: '?', color: chalk.white }
  const lines: string[] = [
    chalk.bold('  ┌──────────────────────────────────────────────'),
    chalk.bold('  │') + ` ${meta.icon} ${chalk.bold(score.file)}`,
    chalk.bold('  │') + ` Difficulty: ${meta.color(score.difficulty.toUpperCase())} (${score.score}/100)`,
    chalk.bold('  │') + ` Read time:  ${score.estimatedReadTime}`,
    chalk.bold('  │'),
    formatBreakdownBar('Nesting', score.breakdown.nestingScore),
    formatBreakdownBar('Complex', score.breakdown.complexityScore),
    formatBreakdownBar('Obscure', score.breakdown.obscurityScore),
    formatBreakdownBar('Control', score.breakdown.controlFlowScore),
    formatBreakdownBar('Tokens', score.breakdown.tokenDiversityScore),
    chalk.bold('  │'),
  ]

  if (score.hints.length > 0) {
    lines.push(chalk.bold('  │') + chalk.gray(' Hints:'))
    for (const hint of score.hints) {
      lines.push(chalk.bold('  │') + chalk.gray(`  • ${hint}`))
    }
  }

  lines.push(chalk.bold('  └──────────────────────────────────────────────'))
  return lines.join('\n')
}

function formatBreakdownBar(label: string, value: number): string {
  const filled = Math.round(value / 100 * 20)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = value > 70 ? chalk.red : value > 40 ? chalk.yellow : chalk.green
  return chalk.bold('  │') + ` ${label.padEnd(8)} ${color(bar)} ${value}`
}

// ─── formatDistributionChart ──────────────────────────────────────────────────

/**
 * Format a horizontal bar chart of difficulty distribution.
 *
 * @example
 * formatDistributionChart(distribution) // bar chart
 */
export function formatDistributionChart(distribution: Record<string, number>): string {
  const lines: string[] = [chalk.bold('  Difficulty Distribution')]

  const order = ['trivial', 'easy', 'medium', 'hard', 'expert', 'nightmare']
  for (const diff of order) {
    const count = distribution[diff] ?? 0
    const meta = DIFFICULTY_META[diff] ?? { icon: ' ', color: chalk.white }
    const bar = meta.icon.repeat(count)
    const label = diff.padEnd(9)
    lines.push(`  ${label} ${bar || '─'} (${count})`)
  }

  return lines.join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format puzzle statistics.
 *
 * @example
 * formatStats(stats) // string
 */
export function formatStats(stats: PuzzleStats): string {
  const lines = [
    chalk.bold('  Statistics'),
    `  Files analyzed:     ${stats.totalFiles}`,
    `  Average score:      ${stats.averageScore}`,
    `  Hardest file:       ${stats.hardestFile}`,
    `  Easiest file:       ${stats.easiestFile}`,
    `  Total read time:    ${stats.totalEstimatedReadTime}`,
    `  Nightmare files:    ${stats.nightmareCount}`,
  ]
  return lines.join('\n')
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format puzzle recommendations.
 *
 * @example
 * formatRecommendations(['Refactor X', 'Rename Y']) // numbered list
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.green('  No recommendations needed.')
  const lines = [chalk.bold('  Recommendations')]
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── formatResult ─────────────────────────────────────────────────────────────

/**
 * Format the full PuzzleResult for terminal output.
 *
 * @example
 * formatResult(result) // complete output
 */
export function formatResult(result: PuzzleResult): string {
  const sections: string[] = []

  sections.push(formatLeaderboard(result.leaderboard))
  sections.push('')
  sections.push(formatDistributionChart(result.distribution))
  sections.push('')
  sections.push(formatStats(result.stats))
  sections.push('')

  for (const file of result.leaderboard.slice(0, 5)) {
    sections.push(formatPuzzleCard(file))
    sections.push('')
  }

  if (result.leaderboard.length > 5) {
    sections.push(chalk.gray(`  ... and ${result.leaderboard.length - 5} more files`))
    sections.push('')
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatJson ───────────────────────────────────────────────────────────────

/**
 * JSON output format.
 *
 * @example
 * formatJson(result) // JSON string
 */
export function formatJson(result: PuzzleResult): string {
  return JSON.stringify(result, null, 2)
}
