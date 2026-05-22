import chalk from 'chalk'

import type { ThunderStormResult } from './thunder-storm-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('category-5') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'category-5': return chalk.rgb(46, 204, 113).bold(condition)
    case 'category-4': return chalk.rgb(52, 152, 219)(condition)
    case 'category-3': return chalk.rgb(155, 89, 182)(condition)
    case 'category-2': return chalk.rgb(241, 196, 15)(condition)
    case 'tropical-storm': return chalk.rgb(230, 126, 34)(condition)
    case 'clear-day': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chief-meteorologist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chief-meteorologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'senior-forecaster': return chalk.rgb(52, 152, 219)(grade)
    case 'meteorologist': return chalk.rgb(155, 89, 182)(grade)
    case 'weather-observer': return chalk.rgb(241, 196, 15)(grade)
    case 'storm-chaser': return chalk.rgb(230, 126, 34)(grade)
    case 'umbrella-carrier': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example clusterTypeColor('hurricane') returns colored string */
export function clusterTypeColor(clusterType: string): string {
  switch (clusterType) {
    case 'hurricane': return chalk.rgb(46, 204, 113)(clusterType)
    case 'typhoon': return chalk.rgb(52, 152, 219)(clusterType)
    case 'cyclone': return chalk.rgb(155, 89, 182)(clusterType)
    case 'squall': return chalk.rgb(241, 196, 15)(clusterType)
    case 'shower': return chalk.rgb(230, 126, 34)(clusterType)
    case 'drought': return chalk.rgb(231, 76, 60)(clusterType)
    default: return clusterType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatThunderStormJson(result) returns JSON string */
export function formatThunderStormJson(result: ThunderStormResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatThunderStormTable(result, verbose) returns formatted string */
export function formatThunderStormTable(result: ThunderStormResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Thunder Storm Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Atmosphere Overview:'))
  lines.push(`    Overall Power:     ${scoreColor(result.atmosphere.overallPower)}`)
  lines.push(`    Avg Intensity:     ${scoreColor(result.atmosphere.avgIntensity)}`)
  lines.push(`    Avg Reach:         ${scoreColor(result.atmosphere.avgReach)}`)
  lines.push(`    Avg Power:         ${scoreColor(result.atmosphere.avgPower)}`)
  lines.push(`    Electrifying:      ${result.atmosphere.isElectrifying ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:       ${result.stats.totalClusters}`)
  lines.push(`    Category 5:           ${result.stats.category5Count}`)
  lines.push(`    Category 4:           ${result.stats.category4Count}`)
  lines.push(`    Category 3:           ${result.stats.category3Count}`)
  lines.push(`    Category 2:           ${result.stats.category2Count}`)
  lines.push(`    Tropical Storm:       ${result.stats.tropicalStormCount}`)
  lines.push(`    Clear Day:            ${result.stats.clearDayCount}`)
  lines.push(`    High Impact:          ${result.stats.hasHighImpactCount}`)
  lines.push(`    Wide Reach:           ${result.stats.hasWideReachCount}`)
  lines.push(`    High Velocity:        ${result.stats.hasHighVelocityCount}`)
  lines.push(`    High Output:          ${result.stats.hasHighOutputCount}`)
  lines.push(`    Proper Complexity:    ${result.stats.hasProperComplexityCount}`)
  lines.push(`    Powerful:             ${result.stats.isPowerfulCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Meteorologist:        ${gradeColor(result.stats.meteorologistGrade)}`)
  lines.push(`    Best Cell:            ${result.stats.bestCell || 'N/A'}`)
  lines.push(`    Most Intense:         ${result.stats.mostIntense || 'N/A'}`)
  lines.push(`    Widest Reach:         ${result.stats.widestReach || 'N/A'}`)
  lines.push(`    Fastest:              ${result.stats.fastest || 'N/A'}`)
  lines.push(`    Highest Output:       ${result.stats.highestOutput || 'N/A'}`)
  lines.push(`    Most Powerful:        ${result.stats.mostPowerful || 'N/A'}`)
  lines.push('')

  if (verbose && result.cells.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Cell Breakdown:'))
    for (const cell of result.cells) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cell.file)}`)
      lines.push(`      Condition:        ${conditionColor(cell.condition)}`)
      lines.push(`      Quality Score:    ${scoreColor(cell.qualityScore)}`)
      lines.push(`      Lightning:        ${scoreColor(cell.lightningIntensity)} (${cell.lightning.type})`)
      lines.push(`      Thunder:          ${scoreColor(cell.thunderResonance)} (${cell.thunder.volume})`)
      lines.push(`      Wind:             ${scoreColor(cell.windForce)} (${cell.wind.scale})`)
      lines.push(`      Rainfall:         ${scoreColor(cell.rainfallVolume)} (${cell.rainfall.intensity})`)
      lines.push(`      Pressure:         ${scoreColor(cell.atmosphericPressure)} (${cell.pressure.system})`)
      lines.push(`      Storm:            ${scoreColor(cell.stormCategory)} (${cell.storm.classification})`)
    }
    lines.push('')
  }

  if (result.clusters.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Clusters:'))
    for (const cluster of result.clusters) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cluster.directory)} — ${clusterTypeColor(cluster.clusterType)} (${cluster.condition})`)
      lines.push(`      Cells: ${cluster.cells.length}, Cat5: ${cluster.cat5Count}, High Impact: ${cluster.highImpactCount}, Powerful: ${cluster.powerfulCount}`)
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
