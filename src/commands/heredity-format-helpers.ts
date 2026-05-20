import chalk from 'chalk'

import type {
  CodeMutation,
  CodeTrait,
  GenePool,
  HeredityResult,
  HeredityStats,
  Lineage,
  LineageHealth,
  OverallHealth,
} from './heredity-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const LINEAGE_COLOR: Record<LineageHealth, (s: string) => string> = {
  thriving: chalk.rgb(72, 199, 142),
  healthy: chalk.rgb(100, 200, 180),
  stable: chalk.rgb(200, 200, 80),
  stressed: chalk.rgb(220, 150, 80),
  inbred: chalk.rgb(220, 80, 80),
}

const OVERALL_COLOR: Record<OverallHealth, (s: string) => string> = {
  robust: chalk.rgb(72, 199, 142),
  healthy: chalk.rgb(100, 200, 180),
  stable: chalk.rgb(200, 200, 80),
  fragile: chalk.rgb(220, 150, 80),
  degenerate: chalk.rgb(220, 80, 80),
}

const BENEFIT_COLOR: Record<string, (s: string) => string> = {
  positive: chalk.rgb(72, 199, 142),
  neutral: chalk.rgb(200, 200, 80),
  negative: chalk.rgb(220, 80, 80),
}

// ─── Label Formatters ──────────────────────────────────────────────────────────

/**
 * Format lineage health label.
 *
 * @example
 * formatLineageHealthLabel('thriving') // => colored string
 */
export function formatLineageHealthLabel(health: LineageHealth): string {
  return (LINEAGE_COLOR[health] ?? ((s: string) => s))(health)
}

/**
 * Format overall health label.
 *
 * @example
 * formatOverallHealthLabel('robust') // => colored string
 */
export function formatOverallHealthLabel(health: OverallHealth): string {
  return (OVERALL_COLOR[health] ?? ((s: string) => s))(health)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a diversity gauge.
 *
 * @example
 * formatDiversityGauge(75) // => gauge string
 */
export function formatDiversityGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Traits ────────────────────────────────────────────────────────────────────

/**
 * Format trait list.
 *
 * @example
 * formatTraits(traits) // => trait table
 */
export function formatTraits(traits: CodeTrait[]): string {
  const header = chalk.bold('Code Traits')
  const separator = '\u2500'.repeat(70)

  if (traits.length === 0) {
    return `${header}\n${separator}\nNo traits detected.`
  }

  const lines = [header, separator]
  for (const t of traits) {
    const tag = t.isDominant ? chalk.rgb(255, 165, 0)(' DOM') : ''
    const mut = t.isMutated ? chalk.rgb(220, 80, 80)(' MUT') : ''
    lines.push(`${chalk.cyan(t.name.padEnd(25))} ${t.type.padEnd(10)} carriers:${t.carriers.length}  ${t.expression}${tag}${mut}`)
  }

  return lines.join('\n')
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Format mutation list.
 *
 * @example
 * formatMutations(mutations) // => mutation report
 */
export function formatMutations(mutations: CodeMutation[]): string {
  const header = chalk.bold('Code Mutations')
  const separator = '\u2500'.repeat(65)

  if (mutations.length === 0) {
    return `${header}\n${separator}\nNo mutations detected.`
  }

  const lines = [header, separator]
  for (const m of mutations) {
    const benefitColor = BENEFIT_COLOR[m.benefit] ?? ((s: string) => s)
    lines.push(`${benefitColor(m.benefit).padEnd(10)} ${m.type.padEnd(14)} ${m.trait}: ${m.from} \u2192 ${m.to}`)
  }

  return lines.join('\n')
}

// ─── Lineages ──────────────────────────────────────────────────────────────────

/**
 * Format lineage hierarchy.
 *
 * @example
 * formatLineages(lineages) // => lineage tree
 */
export function formatLineages(lineages: Lineage[]): string {
  const header = chalk.bold('Inheritance Lineages')
  const separator = '\u2500'.repeat(60)

  if (lineages.length === 0) {
    return `${header}\n${separator}\nNo inheritance chains detected.`
  }

  const lines = [header, separator]
  for (const l of lineages) {
    const health = formatLineageHealthLabel(l.health)
    lines.push(`${chalk.cyan(l.root.padEnd(20))} depth:${l.depth}  breadth:${l.breadth}  diversity:${l.diversity}%  ${health}`)
    lines.push(`  descendants: ${l.descendants.join(', ')}`)
  }

  return lines.join('\n')
}

// ─── Pools ─────────────────────────────────────────────────────────────────────

/**
 * Format gene pool table.
 *
 * @example
 * formatPools(pools) // => pool table
 */
export function formatPools(pools: GenePool[]): string {
  const header = chalk.bold('Gene Pools')
  const separator = '\u2500'.repeat(70)

  if (pools.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]
  for (const p of pools) {
    lines.push(`${chalk.cyan(p.file.padEnd(35))} fitness:${p.fitness}  traits:${p.traits.length}  dom:${p.dominantTraits.length}  muts:${p.mutations.length}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format heredity stats summary.
 *
 * @example
 * formatHeredityStats(stats) // => stats summary
 */
export function formatHeredityStats(stats: HeredityStats): string {
  const header = chalk.bold('Heredity Analysis')
  const separator = '\u2500'.repeat(55)
  const health = formatOverallHealthLabel(stats.overallHealth)

  return [
    header,
    separator,
    `Traits:          ${stats.totalTraits} (dominant:${stats.dominantTraits} recessive:${stats.recessiveTraits})`,
    `Mutations:       ${stats.totalMutations} (positive:${stats.positiveMutations} negative:${stats.negativeMutations})`,
    `Lineages:        ${stats.totalLineages} (thriving:${stats.thrivingLineages} inbred:${stats.inbredLineages})`,
    `Max Depth:       ${stats.maxLineageDepth}`,
    separator,
    `Diversity:       ${formatDiversityGauge(stats.avgDiversity, 15)}`,
    `Fitness:         ${formatDiversityGauge(stats.avgFitness, 15)}`,
    `Trait Coverage:  ${formatDiversityGauge(stats.traitCoverage, 15)}`,
    `Mutation Rate:   ${stats.mutationRate}%`,
    separator,
    `Overall Health:  ${health}`,
  ].join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Healthy heredity!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full heredity table output.
 *
 * @example
 * formatHeredityTable(result) // => full table string
 */
export function formatHeredityTable(result: HeredityResult): string {
  return [
    formatHeredityStats(result.stats),
    '',
    formatPools(result.pools),
    '',
    formatTraits(result.traits),
    '',
    formatLineages(result.lineages),
    '',
    formatMutations(result.mutations),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format heredity result as JSON.
 *
 * @example
 * formatHeredityJson(result) // => JSON string
 */
export function formatHeredityJson(result: HeredityResult): string {
  return JSON.stringify(result, null, 2)
}
