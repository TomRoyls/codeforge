import chalk from 'chalk'

import type {
  EcosystemResult,
  EcosystemStats,
  FoodWeb,
  Habitat,
  KeystoneSpecies,
  Organism,
} from './ecosystem-helpers.js'

// ─── Species Colors ────────────────────────────────────────────────────────────

const speciesColors: Record<string, (s: string) => string> = {
  producer: (s) => chalk.rgb(34, 139, 34)(s),
  'primary-consumer': (s) => chalk.rgb(70, 130, 180)(s),
  'secondary-consumer': (s) => chalk.rgb(100, 149, 237)(s),
  apex: (s) => chalk.rgb(220, 20, 60)(s),
  decomposer: (s) => chalk.rgb(160, 82, 45)(s),
  parasite: (s) => chalk.rgb(148, 0, 211)(s),
}

function colorSpecies(species: string, text: string): string {
  const color = speciesColors[species]
  return color ? color(text) : text
}

function colorCondition(condition: string, text: string): string {
  switch (condition) {
    case 'pristine': return chalk.rgb(0, 200, 83)(text)
    case 'healthy': return chalk.rgb(76, 175, 80)(text)
    case 'stressed': return chalk.rgb(255, 193, 7)(text)
    case 'degraded': return chalk.rgb(255, 87, 34)(text)
    case 'barren': return chalk.rgb(158, 158, 158)(text)
    default: return text
  }
}

// ─── Organism Table ────────────────────────────────────────────────────────────

/**
 * Format organisms as a table.
 *
 * @example
 * formatOrganismTable(organisms)
 */
export function formatOrganismTable(organisms: Organism[]): string {
  if (organisms.length === 0) return chalk.gray('  No organisms found')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Species Distribution'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  const header = chalk.gray(
    '  ' + 'File'.padEnd(30) + 'Species'.padEnd(22) + 'Fit'.padEnd(6) + 'Pop'.padEnd(6) + 'End',
  )
  lines.push(header)

  for (const org of organisms.slice(0, 30)) {
    const file = org.file.length > 28 ? '...' + org.file.slice(-25) : org.file.padEnd(30)
    const species = colorSpecies(org.species, org.species.padEnd(22))
    const fit = org.fitness >= 70
      ? chalk.rgb(76, 175, 80)(String(org.fitness).padEnd(6))
      : org.fitness >= 40
        ? chalk.rgb(255, 193, 7)(String(org.fitness).padEnd(6))
        : chalk.rgb(244, 67, 54)(String(org.fitness).padEnd(6))
    const pop = String(org.population).padEnd(6)
    const end = org.endangered ? chalk.rgb(244, 67, 54)('!') : ' '
    lines.push(`  ${file}${species}${fit}${pop}${end}`)
  }

  if (organisms.length > 30) {
    lines.push(chalk.gray(`  ... and ${organisms.length - 30} more`))
  }

  return lines.join('\n')
}

// ─── Food Web ──────────────────────────────────────────────────────────────────

/**
 * Format food web as ASCII diagram.
 *
 * @example
 * formatFoodWeb(foodWeb)
 */
export function formatFoodWeb(foodWeb: FoodWeb): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Food Web'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  const producers = foodWeb.producers.length
  const consumers = foodWeb.consumers.length
  const apex = foodWeb.apex.length
  const decomposers = foodWeb.decomposers.length
  const parasites = foodWeb.parasites.length

  lines.push(`  ${chalk.rgb(220, 20, 60)('▼ Apex')}          ${apex} entry points`)
  lines.push('       │')
  lines.push(`  ${chalk.rgb(100, 149, 237)('◆ Consumers')}    ${consumers} intermediaries`)
  lines.push('       │')
  lines.push(`  ${chalk.rgb(34, 139, 34)('● Producers')}     ${producers} base modules`)
  lines.push('')
  lines.push(`  ${chalk.rgb(160, 82, 45)('♻ Decomposers')}  ${decomposers} test utilities`)
  lines.push(`  ${chalk.rgb(148, 0, 211)('⚠ Parasites')}     ${parasites} non-exporting consumers`)

  return lines.join('\n')
}

// ─── Habitat Map ───────────────────────────────────────────────────────────────

/**
 * Format habitats with conditions.
 *
 * @example
 * formatHabitatMap(habitats)
 */
export function formatHabitatMap(habitats: Habitat[]): string {
  if (habitats.length === 0) return chalk.gray('  No habitats found')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Habitat Map'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const hab of habitats) {
    const cond = colorCondition(hab.condition, hab.condition.toUpperCase().padEnd(10))
    const bar = '█'.repeat(Math.round(hab.stability / 5))
    const stabilityBar = chalk.gray(bar.padEnd(20))
    lines.push(`  ${chalk.bold(hab.name.padEnd(25))} ${cond}`)
    lines.push(`  ${' '.repeat(25)} Stability: ${stabilityBar} ${hab.stability}%`)
    lines.push(`  ${' '.repeat(25)} Biodiversity: ${hab.biodiversity}%  Organisms: ${hab.organisms.length}`)
  }

  return lines.join('\n')
}

// ─── Keystone Species ──────────────────────────────────────────────────────────

/**
 * Format keystone species list.
 *
 * @example
 * formatKeystones(keystones)
 */
export function formatKeystones(keystones: KeystoneSpecies[]): string {
  if (keystones.length === 0) return chalk.gray('  No keystone species identified')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Keystone Species'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const k of keystones.slice(0, 10)) {
    const riskColor = k.risk === 'high'
      ? chalk.rgb(244, 67, 54)
      : k.risk === 'medium'
        ? chalk.rgb(255, 193, 7)
        : chalk.rgb(76, 175, 80)
    const risk = riskColor(`[${k.risk.toUpperCase().padEnd(6)}]`)
    lines.push(`  ${risk} ${chalk.bold(k.file)}`)
    lines.push(`         Dependents: ${k.dependents}  Impact: ${k.impact}  Uniqueness: ${k.uniqueness}%`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format ecosystem stats.
 *
 * @example
 * formatEcosystemStats(stats)
 */
export function formatEcosystemStats(stats: EcosystemStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Ecosystem Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Organisms:    ${stats.totalOrganisms}`)
  lines.push(`  Species Diversity:  ${stats.speciesDiversity}%`)
  lines.push(`  Food Chain Length:  ${stats.foodChainLength}`)
  lines.push(`  Keystone Species:   ${stats.keystoneCount}`)
  lines.push(`  Endangered:         ${stats.endangeredCount}`)
  lines.push(`  Producers:          ${stats.producerCount}`)
  lines.push(`  Consumers:          ${stats.consumerCount}`)
  lines.push(`  Apex:               ${stats.apexCount}`)
  lines.push(`  Decomposers:        ${stats.decomposerCount}`)
  lines.push(`  Parasites:          ${stats.parasiteCount}`)
  lines.push(`  Ecosystem Stability:${stats.ecosystemStability}%`)
  lines.push(`  Habitat Count:      ${stats.habitatCount}`)
  lines.push(`  Avg Biodiversity:   ${stats.avgBiodiversity}%`)
  lines.push(`  Trophic Efficiency: ${stats.trophicEfficiency}%`)

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix parasites'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full ecosystem result as table.
 *
 * @example
 * formatEcosystemTable(result)
 */
export function formatEcosystemTable(result: EcosystemResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  Ecosystem Analysis'))
  parts.push(chalk.gray(' ═'.repeat(50)))
  parts.push(formatOrganismTable(result.organisms))
  parts.push(formatFoodWeb(result.foodWeb))
  parts.push(formatHabitatMap(result.habitats))
  parts.push(formatKeystones(result.keystones))
  parts.push(formatEcosystemStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format full ecosystem result as JSON.
 *
 * @example
 * formatEcosystemJSON(result)
 */
export function formatEcosystemJSON(result: EcosystemResult): string {
  return JSON.stringify(result, null, 2)
}
