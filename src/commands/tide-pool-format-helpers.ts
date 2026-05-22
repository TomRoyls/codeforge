import chalk from 'chalk'

import type { TidePoolResult } from './tide-pool-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('pristine-pool') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'pristine-pool': return chalk.rgb(46, 204, 113).bold(condition)
    case 'healthy-tide': return chalk.rgb(52, 152, 219)(condition)
    case 'thriving-ecosystem': return chalk.rgb(155, 89, 182)(condition)
    case 'stressed-habitat': return chalk.rgb(241, 196, 15)(condition)
    case 'degraded-pool': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-zone': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chief-scientist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chief-scientist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'marine-biologist': return chalk.rgb(52, 152, 219)(grade)
    case 'ecologist': return chalk.rgb(155, 89, 182)(grade)
    case 'naturalist': return chalk.rgb(241, 196, 15)(grade)
    case 'beachcomber': return chalk.rgb(230, 126, 34)(grade)
    case 'tourist': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example clusterTypeColor('marine-sanctuary') returns colored string */
export function clusterTypeColor(clusterType: string): string {
  switch (clusterType) {
    case 'marine-sanctuary': return chalk.rgb(46, 204, 113)(clusterType)
    case 'tidal-zone': return chalk.rgb(52, 152, 219)(clusterType)
    case 'rocky-shore': return chalk.rgb(155, 89, 182)(clusterType)
    case 'sandy-beach': return chalk.rgb(241, 196, 15)(clusterType)
    case 'mud-flat': return chalk.rgb(230, 126, 34)(clusterType)
    case 'drainage-ditch': return chalk.rgb(231, 76, 60)(clusterType)
    default: return clusterType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatTidePoolJson(result) returns JSON string */
export function formatTidePoolJson(result: TidePoolResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatTidePoolTable(result, verbose) returns formatted string */
export function formatTidePoolTable(result: TidePoolResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Tide Pool Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Coastline Overview:'))
  lines.push(`    Overall Health:         ${scoreColor(result.coastline.overallHealth)}`)
  lines.push(`    Avg Resilience:         ${scoreColor(result.coastline.avgResilience)}`)
  lines.push(`    Avg Diversity:          ${scoreColor(result.coastline.avgDiversity)}`)
  lines.push(`    Avg Health:             ${scoreColor(result.coastline.avgHealth)}`)
  lines.push(`    Is Thriving:            ${result.coastline.isThriving ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:            ${result.stats.totalClusters}`)
  lines.push(`    Avg Tidal Resilience:      ${scoreColor(result.stats.avgTidalResilience)}`)
  lines.push(`    Avg Organism Diversity:    ${scoreColor(result.stats.avgOrganismDiversity)}`)
  lines.push(`    Avg Water Retention:       ${scoreColor(result.stats.avgWaterRetention)}`)
  lines.push(`    Avg Substrate Stability:   ${scoreColor(result.stats.avgSubstrateStability)}`)
  lines.push(`    Avg Nutrient Cycling:      ${scoreColor(result.stats.avgNutrientCycling)}`)
  lines.push(`    Avg Pool Health:           ${scoreColor(result.stats.avgPoolHealth)}`)
  lines.push(`    Pristine Pool:             ${result.stats.pristinePoolCount}`)
  lines.push(`    Healthy Tide:              ${result.stats.healthyTideCount}`)
  lines.push(`    Thriving Ecosystem:        ${result.stats.thrivingEcosystemCount}`)
  lines.push(`    Stressed Habitat:          ${result.stats.stressedHabitatCount}`)
  lines.push(`    Degraded Pool:             ${result.stats.degradedPoolCount}`)
  lines.push(`    Dead Zone:                 ${result.stats.deadZoneCount}`)
  lines.push(`    High Resilience:           ${result.stats.hasHighResilienceCount}`)
  lines.push(`    High Diversity:            ${result.stats.hasHighDiversityCount}`)
  lines.push(`    Good Retention:            ${result.stats.hasGoodRetentionCount}`)
  lines.push(`    Stable:                    ${result.stats.isStableCount}`)
  lines.push(`    Proper Cycling:            ${result.stats.hasProperCyclingCount}`)
  lines.push(`    Healthy:                   ${result.stats.isHealthyCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Marine Biologist Grade:    ${gradeColor(result.stats.marineBiologistGrade)}`)
  lines.push(`    Best Organism:             ${result.stats.bestOrganism || 'N/A'}`)
  lines.push(`    Most Resilient:            ${result.stats.mostResilient || 'N/A'}`)
  lines.push(`    Most Diverse:              ${result.stats.mostDiverse || 'N/A'}`)
  lines.push(`    Best Retention:            ${result.stats.bestRetention || 'N/A'}`)
  lines.push(`    Most Stable:               ${result.stats.mostStable || 'N/A'}`)
  lines.push(`    Healthiest:                ${result.stats.healthiest || 'N/A'}`)
  lines.push('')

  if (verbose && result.organisms.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Organism Breakdown:'))
    for (const o of result.organisms) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(o.file)}`)
      lines.push(`      Condition:              ${conditionColor(o.condition)}`)
      lines.push(`      Quality Score:          ${scoreColor(o.qualityScore)}`)
      lines.push(`      Tidal Resilience:       ${scoreColor(o.tidalResilience)} (${o.resilience.adaptation})`)
      lines.push(`      Organism Diversity:     ${scoreColor(o.organismDiversity)} (${o.diversity.richness})`)
      lines.push(`      Water Retention:        ${scoreColor(o.waterRetention)} (${o.retention.capacity})`)
      lines.push(`      Substrate Stability:    ${scoreColor(o.substrateStability)} (${o.substrate.type})`)
      lines.push(`      Nutrient Cycling:       ${scoreColor(o.nutrientCycling)} (${o.nutrient.flow})`)
      lines.push(`      Pool Health:            ${scoreColor(o.poolHealth)} (${o.health.status})`)
    }
    lines.push('')
  }

  if (result.clusters.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Clusters:'))
    for (const c of result.clusters) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(c.directory)} — ${clusterTypeColor(c.clusterType)} (${c.condition})`)
      lines.push(`      Organisms: ${c.organisms.length}, Pristine: ${c.pristineCount}, Dead: ${c.deadCount}, Resilient: ${c.resilientCount}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    • ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
