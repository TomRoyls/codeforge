import chalk from 'chalk'

import type { CrystallizationLevel, CrystallizationScore, CrystallizeResult, CrystallizeStats, FileMaturity } from './crystallize-helpers.js'

// ─── Badges ───────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<CrystallizationLevel, { label: string; color: (s: string) => string }> = {
  fluid: { label: 'FLUID', color: (s) => chalk.rgb(100, 100, 255)(s) },
  forming: { label: 'FORMING', color: (s) => chalk.rgb(100, 200, 255)(s) },
  crystallizing: { label: 'CRYSTG', color: (s) => chalk.rgb(200, 200, 100)(s) },
  crystallized: { label: 'CRYSTD', color: (s) => chalk.rgb(100, 255, 100)(s) },
  diamond: { label: 'DIAMND', color: (s) => chalk.rgb(255, 215, 0)(s) },
}

/**
 * Format a crystallization level badge.
 *
 * @example
 * levelBadge('diamond')
 * // => 'DIAMND'
 */
export function levelBadge(level: CrystallizationLevel): string {
  const cfg = LEVEL_CONFIG[level]
  return cfg.color(cfg.label)
}

// ─── Score bar ────────────────────────────────────────────────────────────────

/**
 * Render an ASCII score bar.
 *
 * @example
 * scoreBar(75)
 * // => '███████░░░ 75'
 */
export function scoreBar(score: number): string {
  const filled = Math.round(score / 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = score >= 80 ? chalk.rgb(255, 215, 0) : score >= 60 ? chalk.green : score >= 40 ? chalk.yellow : chalk.rgb(255, 100, 100)
  return color(`${bar} ${score}`)
}

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Format the crystallization summary table.
 *
 * @example
 * formatCrystallizationTable(scores)
 */
export function formatCrystallizationTable(scores: CrystallizationScore[]): string {
  if (scores.length === 0) return chalk.dim('  (no files)')

  const rows = scores.map((s) => {
    const badge = levelBadge(s.level)
    const bar = scoreBar(s.score)
    return `  ${badge} ${bar.padEnd(20)} ${chalk.dim(s.file)}`
  })

  return rows.join('\n')
}

/**
 * Format the factor breakdown for a file.
 *
 * @example
 * formatFactorBreakdown(score)
 */
export function formatFactorBreakdown(score: CrystallizationScore): string {
  const rows = score.factors.map((f) => {
    const pct = String(f.score).padStart(3)
    const weight = `${Math.round(f.weight * 100)}%`.padStart(4)
    return `    ${chalk.bold(f.name.padEnd(16))} ${pct}/100  weight:${weight}  ${chalk.dim(f.evidence)}`
  })

  return `  ${chalk.bold(score.file)} (${score.score}/100, ${levelBadge(score.level)})\n${rows.join('\n')}`
}

/**
 * Format the maturity data table.
 *
 * @example
 * formatMaturityTable(maturity)
 */
export function formatMaturityTable(maturity: FileMaturity[]): string {
  if (maturity.length === 0) return chalk.dim('  (no maturity data)')

  const rows = maturity.map((m) => {
    const entry = m.isEntryFile ? chalk.cyan('E') : ' '
    return `  ${entry} ${chalk.bold(m.file.padEnd(30))} age:${String(m.age).padStart(4)}d  changes:${String(m.changeCount).padStart(3)}  doc:${String(m.documentationCoverage).padStart(3)}%  test:${String(m.testCoverage).padStart(3)}%  cx:${String(m.complexity).padStart(3)}`
  })

  return rows.join('\n')
}

// ─── Stats formatting ─────────────────────────────────────────────────────────

/**
 * Format the statistics summary.
 *
 * @example
 * formatCrystallizeStats(stats)
 */
export function formatCrystallizeStats(stats: CrystallizeStats): string {
  const lines = [
    chalk.bold('  Total Files:          ') + String(stats.totalFiles),
    chalk.bold('  Average Score:        ') + String(stats.averageScore),
    chalk.bold('  Fluid:                ') + chalk.rgb(100, 100, 255)(String(stats.fluidCount)),
    chalk.bold('  Forming:              ') + chalk.rgb(100, 200, 255)(String(stats.formingCount)),
    chalk.bold('  Crystallizing:        ') + chalk.rgb(200, 200, 100)(String(stats.crystallizingCount)),
    chalk.bold('  Crystallized:         ') + chalk.green(String(stats.crystallizedCount)),
    chalk.bold('  Diamond:              ') + chalk.rgb(255, 215, 0)(String(stats.diamondCount)),
    chalk.bold('  Average Age:          ') + `${stats.averageAge} days`,
    chalk.bold('  Average Test Cov:     ') + `${stats.averageTestCoverage}%`,
    chalk.bold('  Average Doc Cov:      ') + `${stats.averageDocCoverage}%`,
  ]
  return lines.join('\n')
}

// ─── Distribution chart ───────────────────────────────────────────────────────

/**
 * Render a level distribution histogram.
 *
 * @example
 * formatDistribution(stats)
 */
export function formatDistribution(stats: CrystallizeStats): string {
  const max = Math.max(stats.fluidCount, stats.formingCount, stats.crystallizingCount, stats.crystallizedCount, stats.diamondCount, 1)
  const levels: Array<{ label: string; count: number; color: (s: string) => string }> = [
    { label: 'Fluid    ', count: stats.fluidCount, color: chalk.rgb(100, 100, 255) },
    { label: 'Forming  ', count: stats.formingCount, color: chalk.rgb(100, 200, 255) },
    { label: 'Crystg   ', count: stats.crystallizingCount, color: chalk.rgb(200, 200, 100) },
    { label: 'Crystd   ', count: stats.crystallizedCount, color: chalk.green },
    { label: 'Diamond  ', count: stats.diamondCount, color: chalk.rgb(255, 215, 0) },
  ]

  const rows = levels.map((l) => {
    const barLen = max > 0 ? Math.round((l.count / max) * 20) : 0
    const bar = '█'.repeat(barLen)
    return `  ${l.label} ${l.color(bar)} ${l.count}`
  })

  return rows.join('\n')
}

// ─── Needs attention / best practices ─────────────────────────────────────────

/**
 * Format needs-attention warnings.
 *
 * @example
 * formatNeedsAttention(scores)
 */
export function formatNeedsAttention(scores: CrystallizationScore[]): string {
  if (scores.length === 0) return chalk.dim('  (all files score above 30)')
  return scores.map((s) => {
    return `  ${chalk.red('⚠')} ${scoreBar(s.score)} ${chalk.bold(s.file)} — ${s.recommendations[0] ?? 'needs work'}`
  }).join('\n')
}

/**
 * Format best-practice highlights.
 *
 * @example
 * formatBestPractices(scores)
 */
export function formatBestPractices(scores: CrystallizationScore[]): string {
  if (scores.length === 0) return chalk.dim('  (no files score above 80)')
  return scores.map((s) => {
    return `  ${chalk.rgb(255, 215, 0)('★')} ${scoreBar(s.score)} ${chalk.bold(s.file)}`
  }).join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations as a bullet list.
 *
 * @example
 * formatCrystallizeRecommendations(recs)
 */
export function formatCrystallizeRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('  (no recommendations)')
  return recommendations.map((r) => `  ${chalk.cyan('→')} ${r}`).join('\n')
}

// ─── Full output ──────────────────────────────────────────────────────────────

/**
 * Format the full console output.
 *
 * @example
 * formatCrystallizeOutput(result)
 */
export function formatCrystallizeOutput(result: CrystallizeResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(150, 220, 255)('\n╔═ Crystallization Statistics ════════════════════════════╗'))
  sections.push(formatCrystallizeStats(result.stats))
  sections.push('')

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Level Distribution ════════════════════════════════════╗'))
  sections.push(formatDistribution(result.stats))
  sections.push('')

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ File Scores ═══════════════════════════════════════════╗'))
  sections.push(formatCrystallizationTable(result.files))
  sections.push('')

  if (result.needsAttention.length > 0) {
    sections.push(chalk.bold.rgb(255, 100, 100)('╔═ Needs Attention (score < 30) ═════════════════════════╗'))
    sections.push(formatNeedsAttention(result.needsAttention))
    sections.push('')
  }

  if (result.bestPractices.length > 0) {
    sections.push(chalk.bold.rgb(255, 215, 0)('╔═ Best Practices (score > 80) ══════════════════════════╗'))
    sections.push(formatBestPractices(result.bestPractices))
    sections.push('')
  }

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Recommendations ══════════════════════════════════════╗'))
  sections.push(formatCrystallizeRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * Format the result as JSON.
 *
 * @example
 * formatCrystallizeJson(result)
 */
export function formatCrystallizeJson(result: CrystallizeResult): string {
  return JSON.stringify(result, null, 2)
}
