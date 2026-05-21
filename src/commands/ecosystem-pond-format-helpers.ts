import chalk from 'chalk'

import type {
  PondOrganism,
  PondHabitat,
  EcosystemPondStats,
  EcosystemPondResult,
} from './ecosystem-pond-helpers.js'

// ─── Color Helpers ───────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green-tinted string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example clarityColor('crystal') returns blue string */
export function clarityColor(clarity: string): string {
  switch (clarity) {
    case 'crystal': return chalk.rgb(46, 204, 113).bold(clarity)
    case 'clear': return chalk.rgb(52, 152, 219)(clarity)
    case 'cloudy': return chalk.rgb(241, 196, 15)(clarity)
    case 'murky': return chalk.rgb(230, 126, 34)(clarity)
    case 'polluted': return chalk.rgb(231, 76, 60)(clarity)
    case 'toxic': return chalk.rgb(192, 57, 43).bold(clarity)
    default: return clarity
  }
}

/** @example conditionColor('pristine-ecosystem') returns bold string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'pristine-ecosystem': return chalk.rgb(46, 204, 113).bold(condition)
    case 'healthy-pond': return chalk.rgb(52, 152, 219)(condition)
    case 'balanced-habitat': return chalk.rgb(241, 196, 15)(condition)
    case 'stressed-pond': return chalk.rgb(230, 126, 34)(condition)
    case 'polluted-water': return chalk.rgb(231, 76, 60)(condition)
    case 'dead-zone': return chalk.rgb(192, 57, 43).bold(condition)
    default: return condition
  }
}

/** @example speciesRoleColor('producer') returns colored string */
export function speciesRoleColor(role: string): string {
  switch (role) {
    case 'producer': return chalk.rgb(46, 204, 113)(role)
    case 'primary-consumer': return chalk.rgb(52, 152, 219)(role)
    case 'secondary-consumer': return chalk.rgb(155, 89, 182)(role)
    case 'decomposer': return chalk.rgb(241, 196, 15)(role)
    case 'predator': return chalk.rgb(230, 126, 34)(role)
    case 'parasite': return chalk.rgb(231, 76, 60)(role)
    default: return role
  }
}

/** @example oxygenStateColor('saturated') returns colored string */
export function oxygenStateColor(state: string): string {
  switch (state) {
    case 'saturated': return chalk.rgb(46, 204, 113)(state)
    case 'healthy': return chalk.rgb(52, 152, 219)(state)
    case 'adequate': return chalk.rgb(241, 196, 15)(state)
    case 'low': return chalk.rgb(230, 126, 34)(state)
    case 'hypoxic': return chalk.rgb(231, 76, 60)(state)
    case 'anoxic': return chalk.rgb(192, 57, 43)(state)
    default: return state
  }
}

/** @example nutrientEfficiencyColor('closed-loop') returns colored string */
export function nutrientEfficiencyColor(efficiency: string): string {
  switch (efficiency) {
    case 'closed-loop': return chalk.rgb(46, 204, 113)(efficiency)
    case 'efficient': return chalk.rgb(52, 152, 219)(efficiency)
    case 'moderate': return chalk.rgb(241, 196, 15)(efficiency)
    case 'leaky': return chalk.rgb(230, 126, 34)(efficiency)
    case 'broken': return chalk.rgb(231, 76, 60)(efficiency)
    case 'absent': return chalk.rgb(149, 165, 166)(efficiency)
    default: return efficiency
  }
}

/** @example balanceStateColor('equilibrium') returns colored string */
export function balanceStateColor(state: string): string {
  switch (state) {
    case 'equilibrium': return chalk.rgb(46, 204, 113)(state)
    case 'stable': return chalk.rgb(52, 152, 219)(state)
    case 'shifting': return chalk.rgb(241, 196, 15)(state)
    case 'unstable': return chalk.rgb(230, 126, 34)(state)
    case 'collapsing': return chalk.rgb(231, 76, 60)(state)
    case 'dead': return chalk.rgb(192, 57, 43)(state)
    default: return state
  }
}

/** @example ecologistGradeColor('chief-ecologist') returns bold string */
export function ecologistGradeColor(grade: string): string {
  switch (grade) {
    case 'chief-ecologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'senior-ecologist': return chalk.rgb(52, 152, 219)(grade)
    case 'ecologist': return chalk.rgb(241, 196, 15)(grade)
    case 'naturalist': return chalk.rgb(230, 126, 34)(grade)
    case 'angler': return chalk.rgb(231, 76, 60)(grade)
    case 'polluter': return chalk.rgb(192, 57, 43)(grade)
    default: return grade
  }
}

/** @example habitatCondColor('nature-reserve') returns colored string */
export function habitatCondColor(condition: string): string {
  switch (condition) {
    case 'nature-reserve': return chalk.rgb(46, 204, 113)(condition)
    case 'botanical-garden': return chalk.rgb(52, 152, 219)(condition)
    case 'park-pond': return chalk.rgb(241, 196, 15)(condition)
    case 'farm-pond': return chalk.rgb(230, 126, 34)(condition)
    case 'drainage-basin': return chalk.rgb(231, 76, 60)(condition)
    case 'toxic-dump': return chalk.rgb(192, 57, 43)(condition)
    default: return condition
  }
}

// ─── Format Organism ─────────────────────────────────────────────────────────

/** @example formatOrganism(organism, false) returns formatted string */
export function formatOrganism(organism: PondOrganism, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(organism.file)} ${conditionColor(organism.condition)} ${scoreColor(organism.qualityScore)}`)
  lines.push(`    Water: ${scoreColor(organism.waterQuality)} ${clarityColor(organism.water.clarity)} | Species: ${scoreColor(organism.biodiversity)} ${speciesRoleColor(organism.species.role)}`)
  lines.push(`    Chain: ${scoreColor(organism.foodChain)} | Oxygen: ${scoreColor(organism.oxygenLevel)} ${oxygenStateColor(organism.oxygen.state)}`)
  lines.push(`    Nutrient: ${scoreColor(organism.nutrientCycle)} ${nutrientEfficiencyColor(organism.nutrient.efficiency)} | Balance: ${scoreColor(organism.ecosystemBalance)} ${balanceStateColor(organism.balance.state)}`)

  if (verbose) {
    if (organism.water.pollutantCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Pollutants:')} ${organism.water.pollutantCount}`)
    if (organism.species.isInvasive) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Invasive species detected')}`)
    if (organism.nutrient.hasEutrophication) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Nutrient eutrophication')}`)
    if (organism.oxygen.hasThermalPollution) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Thermal pollution')}`)
  }

  return lines.join('\n')
}

/** @example formatHabitat(habitat, false) returns formatted string */
export function formatHabitat(habitat: PondHabitat, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(habitat.directory)} ${habitatCondColor(habitat.condition)} (${habitat.habitatType})`)
  lines.push(`  Avg Water: ${scoreColor(habitat.avgWaterQuality)} | Avg Diversity: ${scoreColor(habitat.avgBiodiversity)} | Avg Balance: ${scoreColor(habitat.avgBalance)}`)

  if (verbose) {
    lines.push(`  Pristine: ${habitat.pristineCount} | Dead-zone: ${habitat.deadZoneCount} | Balanced: ${habitat.balancedCount} | Native: ${habitat.nativeCount}`)
    for (const org of habitat.organisms) {
      lines.push(formatOrganism(org, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: EcosystemPondStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Ecosystem Pond Statistics ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Habitats: ${stats.totalHabitats}`)
  lines.push(`Avg Water: ${scoreColor(stats.avgWaterQuality)} | Avg Diversity: ${scoreColor(stats.avgBiodiversity)} | Avg Chain: ${scoreColor(stats.avgFoodChain)}`)
  lines.push(`Avg Oxygen: ${scoreColor(stats.avgOxygenLevel)} | Avg Nutrient: ${scoreColor(stats.avgNutrientCycle)} | Avg Balance: ${scoreColor(stats.avgEcosystemBalance)}`)
  lines.push(`Overall Health: ${scoreColor(stats.overallHealth)} | Ecologist Grade: ${ecologistGradeColor(stats.ecologistGrade)}`)
  lines.push(`Conditions: Pristine=${stats.pristineEcosystemCount} Healthy=${stats.healthyPondCount} Balanced=${stats.balancedHabitatCount} Stressed=${stats.stressedPondCount} Polluted=${stats.pollutedWaterCount} Dead=${stats.deadZoneCount}`)
  lines.push(`Best: ${stats.bestOrganism} | Cleanest: ${stats.cleanestWater} | Most Diverse: ${stats.mostDiverse}`)
  return lines.join('\n')
}

// ─── Table Format ────────────────────────────────────────────────────────────

/** @example formatEcosystemPondTable(result, false) returns full table */
export function formatEcosystemPondTable(result: EcosystemPondResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Ecosystem Pond Analysis ===\n'))

  if (result.organisms.length > 0) {
    lines.push(chalk.bold('Organisms:'))
    for (const org of result.organisms) {
      lines.push(formatOrganism(org, verbose))
    }
  }

  if (result.habitats.length > 0) {
    lines.push(chalk.bold('\nHabitats:'))
    for (const hab of result.habitats) {
      lines.push(formatHabitat(hab, verbose))
    }
  }

  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('\nRecommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON Format ─────────────────────────────────────────────────────────────

/** @example formatEcosystemPondJson(result) returns JSON string */
export function formatEcosystemPondJson(result: EcosystemPondResult): string {
  return JSON.stringify(result, null, 2)
}
