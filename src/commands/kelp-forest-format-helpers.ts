import chalk from 'chalk'

import type { KelpForestResult } from './kelp-forest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('giant-kelp') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'giant-kelp': return chalk.rgb(46, 204, 113).bold(condition)
    case 'bull-kelp': return chalk.rgb(52, 152, 219)(condition)
    case 'laminaria': return chalk.rgb(155, 89, 182)(condition)
    case 'rockweed': return chalk.rgb(241, 196, 15)(condition)
    case 'sea-lettuce': return chalk.rgb(230, 126, 34)(condition)
    case 'drift-seaweed': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('research-director') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'research-director': return chalk.rgb(46, 204, 113).bold(grade)
    case 'senior-biologist': return chalk.rgb(52, 152, 219)(grade)
    case 'marine-biologist': return chalk.rgb(155, 89, 182)(grade)
    case 'diver': return chalk.rgb(241, 196, 15)(grade)
    case 'snorkeler': return chalk.rgb(230, 126, 34)(grade)
    case 'beachcomber': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example regionTypeColor('old-growth') returns colored string */
export function regionTypeColor(regionType: string): string {
  switch (regionType) {
    case 'old-growth': return chalk.rgb(46, 204, 113)(regionType)
    case 'mature-forest': return chalk.rgb(52, 152, 219)(regionType)
    case 'young-forest': return chalk.rgb(155, 89, 182)(regionType)
    case 'restoration': return chalk.rgb(241, 196, 15)(regionType)
    case 'meadow': return chalk.rgb(230, 126, 34)(regionType)
    case 'barrens': return chalk.rgb(231, 76, 60)(regionType)
    default: return regionType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatKelpForestJson(result) returns JSON string */
export function formatKelpForestJson(result: KelpForestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatKelpForestTable(result, verbose) returns formatted string */
export function formatKelpForestTable(result: KelpForestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Kelp Forest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Ocean Overview:'))
  lines.push(`    Overall Health:       ${scoreColor(result.ocean.overallHealth)}`)
  lines.push(`    Avg Growth:           ${scoreColor(result.ocean.avgGrowth)}`)
  lines.push(`    Avg Anchoring:        ${scoreColor(result.ocean.avgAnchoring)}`)
  lines.push(`    Avg Health:           ${scoreColor(result.ocean.avgHealth)}`)
  lines.push(`    Thriving:             ${result.ocean.isThriving ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Regions:          ${result.stats.totalRegions}`)
  lines.push(`    Giant Kelp:             ${result.stats.giantKelpCount}`)
  lines.push(`    Bull Kelp:              ${result.stats.bullKelpCount}`)
  lines.push(`    Laminaria:              ${result.stats.laminariaCount}`)
  lines.push(`    Rockweed:               ${result.stats.rockweedCount}`)
  lines.push(`    Sea Lettuce:            ${result.stats.seaLettuceCount}`)
  lines.push(`    Drift Seaweed:          ${result.stats.driftSeaweedCount}`)
  lines.push(`    Growing:                ${result.stats.isGrowingCount}`)
  lines.push(`    Well Anchored:          ${result.stats.isWellAnchoredCount}`)
  lines.push(`    Dense Canopy:           ${result.stats.hasDenseCanopyCount}`)
  lines.push(`    Rich Understory:        ${result.stats.hasRichUnderstoryCount}`)
  lines.push(`    Proper Lift:            ${result.stats.hasProperLiftCount}`)
  lines.push(`    Thriving:               ${result.stats.isThrivingCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Marine Biologist:       ${gradeColor(result.stats.marineBiologistGrade)}`)
  lines.push(`    Best Frond:             ${result.stats.bestFrond || 'N/A'}`)
  lines.push(`    Fastest Growth:         ${result.stats.fastestGrowth || 'N/A'}`)
  lines.push(`    Best Anchored:          ${result.stats.bestAnchored || 'N/A'}`)
  lines.push(`    Densest Canopy:         ${result.stats.densestCanopy || 'N/A'}`)
  lines.push(`    Richest Understory:     ${result.stats.richestUnderstory || 'N/A'}`)
  lines.push(`    Healthiest:             ${result.stats.healthiest || 'N/A'}`)
  lines.push('')

  if (verbose && result.fronds.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Frond Breakdown:'))
    for (const frond of result.fronds) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(frond.file)}`)
      lines.push(`      Condition:          ${conditionColor(frond.condition)}`)
      lines.push(`      Quality Score:      ${scoreColor(frond.qualityScore)}`)
      lines.push(`      Growth:             ${scoreColor(frond.frondGrowth)} (${frond.growth.stage})`)
      lines.push(`      Holdfast:           ${scoreColor(frond.holdfastStrength)} (${frond.holdfast.type})`)
      lines.push(`      Canopy:             ${scoreColor(frond.canopyDensity)} (${frond.canopy.layer})`)
      lines.push(`      Understory:         ${scoreColor(frond.understoryRichness)} (${frond.understory.diversity})`)
      lines.push(`      Bladder:            ${scoreColor(frond.gasBladderBuoyancy)} (${frond.bladder.fill})`)
      lines.push(`      Health:             ${scoreColor(frond.forestHealth)} (${frond.health.status})`)
    }
    lines.push('')
  }

  if (result.regions.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Regions:'))
    for (const region of result.regions) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(region.directory)} — ${regionTypeColor(region.regionType)} (${region.condition})`)
      lines.push(`      Fronds: ${region.fronds.length}, Giant Kelp: ${region.giantKelpCount}, Growing: ${region.growingCount}, Thriving: ${region.thrivingCount}`)
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
