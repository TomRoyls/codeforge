import chalk from 'chalk'

import type {
  CensusResult,
  CensusStats,
  CityProfile,
  Demographics,
} from './census-helpers.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cityIcon(type: string): string {
  switch (type) {
    case 'metropolis': return chalk.rgb(244, 67, 54)('🏙')
    case 'city': return chalk.rgb(33, 150, 243)('🌆')
    case 'town': return chalk.rgb(76, 175, 80)('🏘')
    case 'village': return chalk.rgb(255, 193, 7)('🏠')
    case 'hamlet': return chalk.rgb(158, 158, 158)('⛺')
    case 'ghost-town': return chalk.rgb(121, 85, 72)('👻')
    default: return '·'
  }
}

// ─── City Directory ────────────────────────────────────────────────────────────

/**
 * Format city directory.
 *
 * @example
 * formatCityDirectory(cities)
 */
export function formatCityDirectory(cities: CityProfile[]): string {
  if (cities.length === 0) return chalk.gray('  No cities')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  City Directory'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  const sorted = [...cities].sort((a, b) => b.population - a.population)
  for (const city of sorted.slice(0, 20)) {
    const icon = cityIcon(city.classification)
    lines.push(`  ${icon} ${city.name.padEnd(30)} pop:${String(city.population).padStart(4)}  density:${String(city.density).padStart(5)}  ${city.classification}`)
  }

  if (cities.length > 20) {
    lines.push(chalk.gray(`  ... and ${cities.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Type Distribution ─────────────────────────────────────────────────────────

/**
 * Format type distribution (population pyramid).
 *
 * @example
 * formatTypeDistribution({ function: 10, class: 5 })
 */
export function formatTypeDistribution(dist: Record<string, number>): string {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return chalk.gray('  No population')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Population Pyramid'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const [type, count] of entries) {
    const bar = chalk.rgb(33, 150, 243)('█'.repeat(Math.min(30, count)))
    lines.push(`  ${type.padEnd(12)} ${bar} ${count}`)
  }

  return lines.join('\n')
}

// ─── Demographics ──────────────────────────────────────────────────────────────

/**
 * Format demographics.
 *
 * @example
 * formatDemographics(demographics)
 */
export function formatDemographics(demographics: Demographics): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Demographics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Population:   ${demographics.totalPopulation}`)
  lines.push(`  Avg Education:      ${demographics.avgEducation}%`)
  lines.push(`  Avg Income:         ${demographics.avgIncome}`)
  lines.push(`  Gini Coefficient:   ${demographics.giniCoefficient}`)
  lines.push(`  Literacy Rate:      ${demographics.literacyRate}%`)
  lines.push(`  Employment Rate:    ${demographics.employmentRate}%`)
  lines.push(`  Dependency Ratio:   ${demographics.dependencyRatio}`)
  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format census stats.
 *
 * @example
 * formatCensusStats(stats)
 */
export function formatCensusStats(stats: CensusStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Census Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Population:      ${stats.totalPopulation}`)
  lines.push(`  Total Cities:          ${stats.totalCities}`)
  lines.push(`  Metropolises:          ${stats.metropolises}`)
  lines.push(`  Ghost Towns:           ${stats.ghostTowns}`)
  lines.push(`  Literacy Rate:         ${stats.literacyRate}%`)
  lines.push(`  Employment Rate:       ${stats.employmentRate}%`)
  lines.push(`  Gini Coefficient:      ${stats.giniCoefficient}`)
  lines.push(`  Avg Pop Density:       ${stats.avgPopulationDensity}`)
  lines.push(`  Largest City:          ${stats.largestCity}`)
  lines.push(`  Smallest City:         ${stats.smallestCity}`)
  lines.push(`  Overall Health:        ${stats.overallHealth}%`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Add docs'])
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

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full census result as table.
 *
 * @example
 * formatCensusTable(result)
 */
export function formatCensusTable(result: CensusResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  Code Census'))
  parts.push(chalk.gray(' ═'.repeat(50)))
  parts.push(formatCityDirectory(result.cities))
  parts.push(formatTypeDistribution(result.demographics.typeDistribution))
  parts.push(formatDemographics(result.demographics))
  parts.push(formatCensusStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format full census result as JSON.
 *
 * @example
 * formatCensusJSON(result)
 */
export function formatCensusJSON(result: CensusResult): string {
  return JSON.stringify(result, null, 2)
}
