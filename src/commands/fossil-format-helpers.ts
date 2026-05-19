import chalk from 'chalk'

import {
  type ExcavationEffort,
  type ExcavationResult,
  type Fossil,
  type FossilEra,
  type FossilLayer,
  type FossilSeverity,
  type FossilStats,
  type FossilType,
} from './fossil-helpers.js'

// ─── Color Map ────────────────────────────────────────────────────────────────

const ERA_COLORS: Record<FossilEra, (t: string) => string> = {
  ancient: (t) => chalk.rgb(139, 69, 19)(t),
  old: (t) => chalk.rgb(210, 105, 30)(t),
  recent: (t) => chalk.rgb(255, 193, 7)(t),
  modern: (t) => chalk.rgb(76, 175, 80)(t),
}

const ERA_ICONS: Record<FossilEra, string> = {
  ancient: '🏛',
  old: '🏺',
  recent: '🧪',
  modern: '✨',
}

const EFFORT_ICONS: Record<ExcavationEffort, string> = {
  trivial: '✓',
  easy: '◎',
  moderate: '⚠',
  careful: '⛔',
}

const SEVERITY_COLORS: Record<FossilSeverity, (t: string) => string> = {
  info: (t) => chalk.rgb(135, 206, 250)(t),
  warning: (t) => chalk.rgb(255, 193, 7)(t),
  cleanup: (t) => chalk.rgb(76, 175, 80)(t),
}

/**
 * Get era icon.
 *
 * @example
 * getEraIcon('ancient')
 */
export function getEraIcon(era: FossilEra): string {
  return ERA_ICONS[era] ?? '?'
}

/**
 * Get effort icon.
 *
 * @example
 * getEffortIcon('trivial')
 */
export function getEffortIcon(effort: ExcavationEffort): string {
  return EFFORT_ICONS[effort] ?? '?'
}

/**
 * Get severity color.
 *
 * @example
 * getSeverityColor('warning')
 */
export function getSeverityColor(severity: FossilSeverity): (t: string) => string {
  return SEVERITY_COLORS[severity] ?? chalk.white
}

// ─── Fossil Row ───────────────────────────────────────────────────────────────

/**
 * Format a fossil row.
 *
 * @example
 * formatFossilRow(fossil)
 */
export function formatFossilRow(fossil: Fossil): string {
  const eraFn = ERA_COLORS[fossil.era] ?? chalk.white
  const sevFn = getSeverityColor(fossil.severity)
  const icon = getEraIcon(fossil.era)
  const effort = getEffortIcon(fossil.excavationEffort)
  return `  ${icon} ${fossil.type.padEnd(18)} ${String(fossil.line).padStart(4)}:${fossil.file} ${sevFn(fossil.severity)} ${effort} ${eraFn(fossil.era)}`
}

// ─── Fossil Catalog ───────────────────────────────────────────────────────────

/**
 * Format the fossil catalog.
 *
 * @example
 * formatFossilCatalog(fossils)
 */
export function formatFossilCatalog(fossils: Fossil[]): string {
  if (fossils.length === 0) return chalk.dim('  No fossils found — clean codebase!')
  const lines: string[] = []
  lines.push(chalk.bold('  Fossil Catalog:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Era  Type               Line  File                Severity Effort Era'))

  const sorted = [...fossils].sort((a, b) => {
    const eraOrder: Record<string, number> = { ancient: 0, old: 1, recent: 2, modern: 3 }
    return (eraOrder[a.era] ?? 9) - (eraOrder[b.era] ?? 9)
  })

  for (const fossil of sorted.slice(0, 30)) {
    lines.push(formatFossilRow(fossil))
  }
  if (sorted.length > 30) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 30} more fossils`))
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Layers ───────────────────────────────────────────────────────────────────

/**
 * Format fossil layers.
 *
 * @example
 * formatFossilLayers(layers)
 */
export function formatFossilLayers(layers: FossilLayer[]): string {
  if (layers.length === 0) return chalk.dim('  No stratified layers found.')
  const lines: string[] = []
  lines.push(chalk.bold('  Stratified Layers:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const layer of layers) {
    const icon = getEraIcon(layer.fossils[0]?.era ?? 'ancient')
    lines.push(`  ${icon} ${chalk.bold(layer.name)}`)
    lines.push(chalk.dim(`    ${layer.description}`))
  }

  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format fossil stats.
 *
 * @example
 * formatFossilStats(stats)
 */
export function formatFossilStats(stats: FossilStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Total fossils: ${stats.totalFossils}`)
  lines.push(`  Dead code: ${stats.deadCodeCount} | Commented out: ${stats.commentedOutCount} | Deprecated: ${stats.deprecatedCount}`)
  lines.push(`  Legacy: ${stats.legacyCount} | Cleanup candidates: ${stats.cleanupCandidates}`)
  lines.push(`  Estimated savings: ~${stats.estimatedSavings} lines`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Artifact Highlights ──────────────────────────────────────────────────────

/**
 * Format artifact highlights.
 *
 * @example
 * formatArtifactHighlights(highlights)
 */
export function formatArtifactHighlights(highlights: Fossil[]): string {
  if (highlights.length === 0) return chalk.dim('  No artifact highlights.')
  const lines: string[] = []
  lines.push(chalk.bold('  Artifact Highlights:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const h of highlights) {
    lines.push(`  ${getEraIcon(h.era)} ${chalk.bold(h.type)} at ${h.file}:${h.line}`)
    lines.push(chalk.dim(`    ${h.description}`))
    lines.push(chalk.dim(`    ${h.code}`))
  }

  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
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
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format the full excavation result as table.
 *
 * @example
 * formatFossilTable(result)
 */
export function formatFossilTable(result: ExcavationResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Fossil Excavation Report\n'))
  sections.push(formatFossilCatalog(result.fossils))
  sections.push('')
  sections.push(formatFossilLayers(result.layers))
  sections.push('')
  sections.push(formatArtifactHighlights(result.artifactHighlights))
  sections.push('')
  sections.push(formatFossilStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format excavation result as JSON.
 *
 * @example
 * formatFossilJSON(result)
 */
export function formatFossilJSON(result: ExcavationResult): string {
  return JSON.stringify(result, null, 2)
}
