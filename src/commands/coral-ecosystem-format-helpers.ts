import chalk from 'chalk'

import type { CoralReefResult } from './coral-ecosystem-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('great-barrier') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'great-barrier': return chalk.rgb(46, 204, 113).bold(condition)
    case 'coral-triangle': return chalk.rgb(52, 152, 219)(condition)
    case 'caribbean': return chalk.rgb(155, 89, 182)(condition)
    case 'red-sea': return chalk.rgb(241, 196, 15)(condition)
    case 'bleached-zone': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-zone': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chief-scientist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chief-scientist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'marine-biologist': return chalk.rgb(52, 152, 219)(grade)
    case 'oceanographer': return chalk.rgb(155, 89, 182)(grade)
    case 'diver': return chalk.rgb(241, 196, 15)(grade)
    case 'snorkeler': return chalk.rgb(230, 126, 34)(grade)
    case 'beachgoer': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example systemTypeColor('atoll-chain') returns colored string */
export function systemTypeColor(systemType: string): string {
  switch (systemType) {
    case 'atoll-chain': return chalk.rgb(46, 204, 113)(systemType)
    case 'barrier-system': return chalk.rgb(52, 152, 219)(systemType)
    case 'fringing-complex': return chalk.rgb(155, 89, 182)(systemType)
    case 'patch-mosaic': return chalk.rgb(241, 196, 15)(systemType)
    case 'seamount': return chalk.rgb(230, 126, 34)(systemType)
    case 'abyssal-plain': return chalk.rgb(231, 76, 60)(systemType)
    default: return systemType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCoralEcosystemJson(result) returns JSON string */
export function formatCoralEcosystemJson(result: CoralReefResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCoralEcosystemTable(result, verbose) returns formatted string */
export function formatCoralEcosystemTable(result: CoralReefResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Coral Ecosystem Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Ocean Overview:'))
  lines.push(`    Overall Health:    ${scoreColor(result.ocean.overallHealth)}`)
  lines.push(`    Avg Density:       ${scoreColor(result.ocean.avgDensity)}`)
  lines.push(`    Avg Complexity:    ${scoreColor(result.ocean.avgComplexity)}`)
  lines.push(`    Avg Vitality:      ${scoreColor(result.ocean.avgVitality)}`)
  lines.push(`    Thriving:          ${result.ocean.isThriving ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:         ${result.stats.totalFiles}`)
  lines.push(`    Total Systems:       ${result.stats.totalSystems}`)
  lines.push(`    Great Barrier:       ${result.stats.greatBarrierCount}`)
  lines.push(`    Coral Triangle:      ${result.stats.coralTriangleCount}`)
  lines.push(`    Caribbean:           ${result.stats.caribbeanCount}`)
  lines.push(`    Red Sea:             ${result.stats.redSeaCount}`)
  lines.push(`    Bleached Zone:       ${result.stats.bleachedZoneCount}`)
  lines.push(`    Dead Zone:           ${result.stats.deadZoneCount}`)
  lines.push(`    Healthy:             ${result.stats.isHealthyCount}`)
  lines.push(`    Complex Structure:   ${result.stats.hasComplexStructureCount}`)
  lines.push(`    Mutualism:           ${result.stats.hasMutualismCount}`)
  lines.push(`    Clear Water:         ${result.stats.isClearCount}`)
  lines.push(`    Quality Deposit:     ${result.stats.hasQualityDepositCount}`)
  lines.push(`    Vital:               ${result.stats.isVitalCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Marine Biologist:    ${gradeColor(result.stats.marineBiologistGrade)}`)
  lines.push(`    Best Colony:         ${result.stats.bestColony || 'N/A'}`)
  lines.push(`    Densest:             ${result.stats.densest || 'N/A'}`)
  lines.push(`    Most Complex:        ${result.stats.mostComplex || 'N/A'}`)
  lines.push(`    Most Symbiotic:      ${result.stats.mostSymbiotic || 'N/A'}`)
  lines.push(`    Clearest:            ${result.stats.clearest || 'N/A'}`)
  lines.push(`    Most Vital:          ${result.stats.mostVital || 'N/A'}`)
  lines.push('')

  if (verbose && result.colonies.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Colony Breakdown:'))
    for (const colony of result.colonies) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(colony.file)}`)
      lines.push(`      Condition:       ${conditionColor(colony.condition)}`)
      lines.push(`      Quality Score:   ${scoreColor(colony.qualityScore)}`)
      lines.push(`      Polyp:           ${scoreColor(colony.polypDensity)} (${colony.polyp.species})`)
      lines.push(`      Complexity:      ${scoreColor(colony.reefComplexity)} (${colony.complexity.formation})`)
      lines.push(`      Symbiotic:       ${scoreColor(colony.symbioticIndex)} (${colony.symbiotic.relationship})`)
      lines.push(`      Clarity:         ${scoreColor(colony.waterClarity)} (${colony.clarity.condition})`)
      lines.push(`      Calcium:         ${scoreColor(colony.calciumDeposit)} (${colony.calcium.hardness})`)
      lines.push(`      Vitality:        ${scoreColor(colony.reefVitality)} (${colony.vitality.status})`)
    }
    lines.push('')
  }

  if (result.systems.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Systems:'))
    for (const system of result.systems) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(system.directory)} — ${systemTypeColor(system.systemType)} (${system.condition})`)
      lines.push(`      Colonies: ${system.colonies.length}, Great Barrier: ${system.greatBarrierCount}, Healthy: ${system.healthyCount}, Mutualism: ${system.mutualismCount}`)
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
