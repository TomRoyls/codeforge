import chalk from 'chalk'

import type { AlchemistResult, AlchemistStats, Element, Transmutation } from './alchemist-helpers.js'

// ─── Grade Colors ─────────────────────────────────────────────────────────────

const gradeColor: Record<string, (s: string) => string> = {
  Lead: (s: string) => chalk.rgb(120, 120, 120)(s),
  Copper: (s: string) => chalk.rgb(184, 115, 51)(s),
  Bronze: (s: string) => chalk.rgb(205, 127, 50)(s),
  Silver: (s: string) => chalk.rgb(192, 192, 192)(s),
  Gold: (s: string) => chalk.rgb(255, 215, 0)(s),
  Platinum: (s: string) => chalk.rgb(229, 228, 226)(s),
}

// ─── Element Table ────────────────────────────────────────────────────────────

/**
 * Format element values for a file.
 *
 * @example
 * formatElementTable(elements)
 */
export function formatElementTable(elements: Element[]): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  ${'Element'.padEnd(6)} ${'Name'.padEnd(12)} ${'Property'.padEnd(16)} ${'Value'.padEnd(8)} Weight`)
  lines.push('  ────────────────────────────────────────────────────')

  for (const e of elements) {
    const bar = buildValueBar(e.value)
    lines.push(`  ${e.symbol.padEnd(6)} ${e.name.padEnd(12)} ${e.property.padEnd(16)} ${bar} ${e.value}/100  ×${e.weight}`)
  }

  return lines.join('\n')
}

function buildValueBar(value: number): string {
  const filled = Math.round(value / 10)
  const empty = 10 - filled
  return '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
}

// ─── Grade Badge ──────────────────────────────────────────────────────────────

/**
 * Format a grade badge for a file.
 *
 * @example
 * formatGradeBadge('Gold', 85.5)
 */
export function formatGradeBadge(grade: string, purity: number): string {
  const color = gradeColor[grade] ?? chalk.white
  const bar = buildValueBar(purity)
  return `${color(`[${grade}]`)} ${bar} ${purity}%`
}

// ─── Transmutation Plan ───────────────────────────────────────────────────────

/**
 * Format transmutation plan for a file.
 *
 * @example
 * formatTransmutationPlan(transmutation)
 */
export function formatTransmutationPlan(t: Transmutation): string {
  const lines: string[] = []
  const color = gradeColor[t.currentGrade] ?? chalk.white

  lines.push(`  ${chalk.bold(t.file)} ${color(`[${t.currentGrade}]`)} → ${gradeColor[t.nextGrade]?.(`[${t.nextGrade}]`) ?? chalk.white(`[${t.nextGrade}]`)} (need ${t.requiredPurity}%)`)
  lines.push(`  Purity: ${formatGradeBadge(t.currentGrade, t.currentPurity)}`)
  lines.push(`  Effort: ${t.estimatedEffort}`)

  if (t.steps.length > 0) {
    lines.push('  Steps:')
    for (let i = 0; i < t.steps.length; i++) {
      const s = t.steps[i]!
      const diffColor = s.difficulty === 'easy' ? chalk.green : s.difficulty === 'medium' ? chalk.yellow : chalk.red
      lines.push(`    ${i + 1}. ${s.description}`)
      lines.push(`       Impact: +${s.impact} purity | Difficulty: ${diffColor(s.difficulty)}`)
    }
  }

  return lines.join('\n')
}

// ─── Purity Meter ─────────────────────────────────────────────────────────────

/**
 * Format overall purity meter.
 *
 * @example
 * formatPurityMeter(72.5)
 */
export function formatPurityMeter(purity: number): string {
  const filled = Math.round(purity / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
  const color = purity >= 76 ? chalk.rgb(255, 215, 0) : purity >= 61 ? chalk.rgb(192, 192, 192) : purity >= 41 ? chalk.rgb(205, 127, 50) : chalk.rgb(120, 120, 120)

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Average Purity: ${color(`${bar} ${purity}%`)}`)
  lines.push('  ────────────────────────────────────────────────────')
  return lines.join('\n')
}

// ─── Grade Distribution Chart ─────────────────────────────────────────────────

/**
 * Format grade distribution chart.
 *
 * @example
 * formatGradeDistribution({ Gold: 3, Silver: 5 })
 */
export function formatGradeDistribution(distribution: Record<string, number>): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Grade Distribution')
  lines.push('  ────────────────────────────────────────────────────')

  const grades = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Copper', 'Lead']
  for (const g of grades) {
    const count = distribution[g] ?? 0
    const color = gradeColor[g] ?? chalk.white
    const bar = '█'.repeat(count)
    lines.push(`  ${color(g.padEnd(10))} ${color(bar)} ${count}`)
  }

  return lines.join('\n')
}

// ─── Philosopher's Stone Progress ─────────────────────────────────────────────

/**
 * Format philosopher's stone progress.
 *
 * @example
 * formatPhilosopherStoneProgress(75)
 */
export function formatPhilosopherStoneProgress(score: number): string {
  const filled = Math.round(score / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
  const color = score >= 80 ? chalk.rgb(255, 215, 0) : score >= 50 ? chalk.rgb(192, 192, 192) : chalk.rgb(120, 120, 120)

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Philosopher's Stone: ${color(`${bar} ${score}%`)}`)
  lines.push('  ────────────────────────────────────────────────────')
  return lines.join('\n')
}

// ─── Stats Display ────────────────────────────────────────────────────────────

/**
 * Format alchemist stats.
 *
 * @example
 * formatAlchemistStats(stats)
 */
export function formatAlchemistStats(stats: AlchemistStats): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Alchemical Summary')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Total Files:              ${stats.totalFiles}`)
  lines.push(`  Average Purity:           ${stats.avgPurity}%`)
  lines.push(`  Highest Purity:           ${stats.highestPurity}`)
  lines.push(`  Lowest Purity:            ${stats.lowestPurity}`)
  lines.push(`  Gold/Platinum Files:      ${stats.goldCount}`)
  lines.push(`  Lead Files:               ${stats.leadCount}`)
  lines.push(`  Transmutation Potential:  ${stats.transmutationPotential}%`)
  lines.push(`  Philosopher's Stone:      ${stats.philosopherStoneScore}%`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Transmute lead files first'])
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Recommendations')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format complete alchemist result as table.
 *
 * @example
 * formatAlchemistTable(result)
 */
export function formatAlchemistTable(result: AlchemistResult): string {
  const parts: string[] = []

  parts.push(`  ${chalk.bold('Element Reference Table')}`)
  parts.push(formatElementTable(result.elements))
  parts.push('')

  for (const t of result.transmutations) {
    parts.push(formatTransmutationPlan(t))
    parts.push(formatElementTable(t.elements))
    parts.push('')
  }

  parts.push(formatPurityMeter(result.stats.avgPurity))
  parts.push('')
  parts.push(formatGradeDistribution(result.stats.gradeDistribution))
  parts.push('')
  parts.push(formatPhilosopherStoneProgress(result.stats.philosopherStoneScore))
  parts.push('')
  parts.push(formatAlchemistStats(result.stats))
  parts.push('')
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format alchemist result as JSON.
 *
 * @example
 * formatAlchemistJSON(result)
 */
export function formatAlchemistJSON(result: AlchemistResult): string {
  return JSON.stringify(result, null, 2)
}
