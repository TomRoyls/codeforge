import chalk from 'chalk'

import type {
  EvolutionaryStage,
  ExtinctPattern,
  FossilRecordResult,
  FossilRecordStats,
  FossilLayer,
  LivingFossil,
} from './fossil-record-helpers.js'

// ─── Era Colors ───────────────────────────────────────────────────────────────

const ERA_COLORS: Record<string, (t: string) => string> = {
  'Scaffold Era': (t) => chalk.rgb(139, 195, 74)(t),
  'Migration Era': (t) => chalk.rgb(255, 152, 0)(t),
  'Test Expansion Era': (t) => chalk.rgb(33, 150, 243)(t),
  'Feature Growth Era': (t) => chalk.rgb(76, 175, 80)(t),
  'Bug Fix Era': (t) => chalk.rgb(244, 67, 54)(t),
  'Dependency Era': (t) => chalk.rgb(156, 39, 176)(t),
  'Documentation Era': (t) => chalk.rgb(121, 85, 72)(t),
  'Cleanup Era': (t) => chalk.rgb(158, 158, 158)(t),
  'Performance Era': (t) => chalk.rgb(0, 188, 212)(t),
  'Security Era': (t) => chalk.rgb(233, 30, 99)(t),
  'Infrastructure Era': (t) => chalk.rgb(63, 81, 181)(t),
}

/**
 * Get era color.
 *
 * @example
 * getEraColor('Feature Growth Era')
 */
export function getEraColor(era: string): (t: string) => string {
  return ERA_COLORS[era] ?? chalk.white
}

// ─── Risk Colors ──────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, (t: string) => string> = {
  none: chalk.green,
  low: chalk.rgb(255, 193, 7),
  medium: chalk.rgb(255, 152, 0),
  high: chalk.rgb(244, 67, 54),
}

/**
 * Get risk badge.
 *
 * @example
 * getRiskBadge('high')
 */
export function getRiskBadge(risk: LivingFossil['risk']): string {
  const fn = RISK_COLORS[risk] ?? chalk.white
  return fn(`[${risk.toUpperCase()}]`)
}

// ─── Stability Meter ──────────────────────────────────────────────────────────

/**
 * Format stability meter.
 *
 * @example
 * formatStabilityMeter(75)
 */
export function formatStabilityMeter(stability: number): string {
  const filled = Math.round(stability / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (stability >= 70) colorFn = chalk.green
  else if (stability >= 40) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `  Stability: ${bar} ${stability}%`
}

// ─── Velocity Graph ───────────────────────────────────────────────────────────

/**
 * Format ASCII velocity graph.
 *
 * @example
 * formatVelocityGraph(layers)
 */
export function formatVelocityGraph(layers: FossilLayer[]): string {
  if (layers.length === 0) return chalk.dim('  No commit history.')

  const lines: string[] = []
  lines.push(chalk.bold('  Commit History:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))

  const shown = layers.slice(0, 20)
  for (const layer of shown) {
    const eraFn = getEraColor(layer.era)
    const totalChanges = layer.insertions + layer.deletions
    const barLen = Math.min(Math.round(totalChanges / 10), 30)
    const bar = chalk.green('+'.repeat(Math.min(layer.insertions / 10, 30))) + chalk.red('-'.repeat(Math.min(layer.deletions / 10, 30)))
    const hash = layer.commitHash.slice(0, 7)
    lines.push(`  ${hash} ${eraFn(layer.era.padEnd(22))} ${bar.slice(0, 40)}`)
  }

  if (layers.length > 20) {
    lines.push(chalk.dim(`  ... and ${layers.length - 20} more commits`))
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Extinct Pattern Table ────────────────────────────────────────────────────

/**
 * Format extinct pattern table.
 *
 * @example
 * formatExtinctTable(patterns)
 */
export function formatExtinctTable(patterns: ExtinctPattern[]): string {
  if (patterns.length === 0) return chalk.dim('  No extinct patterns detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Extinct Patterns:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Pattern                Category      Replacement                Files'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))

  for (const p of patterns) {
    const fileCount = String(p.files.length).padStart(2)
    lines.push(`  ${p.pattern.padEnd(22)} ${p.category.padEnd(13)} ${(p.replacement).padEnd(26)} ×${fileCount}`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Living Fossil List ───────────────────────────────────────────────────────

/**
 * Format living fossil list.
 *
 * @example
 * formatLivingFossilList(fossils)
 */
export function formatLivingFossilList(fossils: LivingFossil[]): string {
  if (fossils.length === 0) return chalk.dim('  No living fossils detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Living Fossils:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))

  const sorted = [...fossils].sort((a, b) => b.age - a.age)
  for (const f of sorted) {
    const badge = getRiskBadge(f.risk)
    const catColor = f.category === 'ancient' ? chalk.red : f.category === 'dormant' ? chalk.yellow : chalk.dim
    const ageTag = `${f.age}d`
    lines.push(`  ${badge} ${f.file.padEnd(40)} ${catColor(f.category.padEnd(10))} Age:${ageTag.padStart(5)}  Stability:${f.stability}%`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Era Timeline ─────────────────────────────────────────────────────────────

/**
 * Format era timeline.
 *
 * @example
 * formatEraTimeline(stages)
 */
export function formatEraTimeline(stages: EvolutionaryStage[]): string {
  if (stages.length === 0) return chalk.dim('  No evolutionary stages detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Evolutionary Timeline:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))

  for (const stage of stages) {
    const eraFn = getEraColor(stage.name)
    const endLabel = stage.endDate ?? 'present'
    lines.push(`  ${eraFn(stage.name.padEnd(24))} ${stage.startDate} → ${endLabel}`)
    lines.push(`    Changes: ${stage.totalChanges} | Files: ${stage.fileCount}`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format fossil record stats.
 *
 * @example
 * formatFossilRecordStats(stats)
 */
export function formatFossilRecordStats(stats: FossilRecordStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
  lines.push(`  Layers: ${stats.totalLayers} | Extinct: ${stats.extinctCount} | Living fossils: ${stats.livingFossilCount} | Stages: ${stats.stageCount}`)
  lines.push(`  Velocity: ${stats.changeVelocity} commits/wk | Avg age: ${stats.averageFileAge}d | Stability: ${stats.stabilityIndex}%`)
  if (stats.oldestActiveFile) {
    lines.push(`  Oldest file: ${stats.oldestActiveFile}`)
  }
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format full fossil record table.
 *
 * @example
 * formatFossilRecordTable(result)
 */
export function formatFossilRecordTable(result: FossilRecordResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Fossil Record Analysis\n'))
  sections.push(formatStabilityMeter(result.stats.stabilityIndex))
  sections.push('')
  sections.push(formatVelocityGraph(result.layers))
  sections.push('')
  sections.push(formatExtinctTable(result.extinctPatterns))
  sections.push('')
  sections.push(formatLivingFossilList(result.livingFossils))
  sections.push('')
  sections.push(formatEraTimeline(result.evolutionaryStages))
  sections.push('')
  sections.push(formatFossilRecordStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format fossil record as JSON.
 *
 * @example
 * formatFossilRecordJSON(result)
 */
export function formatFossilRecordJSON(result: FossilRecordResult): string {
  return JSON.stringify(result, null, 2)
}
