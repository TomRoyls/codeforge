import chalk from 'chalk'

import type { GlacierCarveResult } from './glacier-carve-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('polar-cap') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'polar-cap': return chalk.rgb(46, 204, 113).bold(condition)
    case 'alpine-glacier': return chalk.rgb(52, 152, 219)(condition)
    case 'valley-glacier': return chalk.rgb(155, 89, 182)(condition)
    case 'piedmont': return chalk.rgb(241, 196, 15)(condition)
    case 'ice-shelf': return chalk.rgb(230, 126, 34)(condition)
    case 'puddle': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('pioneer-glaciologist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'pioneer-glaciologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'senior-glaciologist': return chalk.rgb(52, 152, 219)(grade)
    case 'glaciologist': return chalk.rgb(155, 89, 182)(grade)
    case 'researcher': return chalk.rgb(241, 196, 15)(grade)
    case 'student': return chalk.rgb(230, 126, 34)(grade)
    case 'tourist': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example systemTypeColor('ice-sheet') returns colored string */
export function systemTypeColor(systemType: string): string {
  switch (systemType) {
    case 'ice-sheet': return chalk.rgb(46, 204, 113)(systemType)
    case 'ice-cap': return chalk.rgb(52, 152, 219)(systemType)
    case 'ice-field': return chalk.rgb(155, 89, 182)(systemType)
    case 'glacier-complex': return chalk.rgb(241, 196, 15)(systemType)
    case 'ice-stream': return chalk.rgb(230, 126, 34)(systemType)
    case 'permafrost': return chalk.rgb(231, 76, 60)(systemType)
    default: return systemType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatGlacierCarveJson(result) returns JSON string */
export function formatGlacierCarveJson(result: GlacierCarveResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatGlacierCarveTable(result, verbose) returns formatted string */
export function formatGlacierCarveTable(result: GlacierCarveResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Glacier Carve Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Icefield Overview:'))
  lines.push(`    Overall Power:    ${scoreColor(result.icefield.overallPower)}`)
  lines.push(`    Avg Density:      ${scoreColor(result.icefield.avgDensity)}`)
  lines.push(`    Avg Carving:      ${scoreColor(result.icefield.avgPower)}`)
  lines.push(`    Avg Stability:    ${scoreColor(result.icefield.avgStability)}`)
  lines.push(`    Advancing:        ${result.icefield.isAdvancing ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:       ${result.stats.totalFiles}`)
  lines.push(`    Total Systems:     ${result.stats.totalSystems}`)
  lines.push(`    Polar Cap:         ${result.stats.polarCapCount}`)
  lines.push(`    Alpine Glacier:    ${result.stats.alpineGlacierCount}`)
  lines.push(`    Valley Glacier:    ${result.stats.valleyGlacierCount}`)
  lines.push(`    Piedmont:          ${result.stats.piedmontCount}`)
  lines.push(`    Ice Shelf:         ${result.stats.iceShelfCount}`)
  lines.push(`    Puddle:            ${result.stats.puddleCount}`)
  lines.push(`    Dense:             ${result.stats.isDenseCount}`)
  lines.push(`    Deep Impact:       ${result.stats.hasDeepImpactCount}`)
  lines.push(`    Stable:            ${result.stats.isStableCount}`)
  lines.push(`    Safe:              ${result.stats.isSafeCount}`)
  lines.push(`    Mature:            ${result.stats.isMatureCount}`)
  lines.push(`    Advancing:         ${result.stats.isAdvancingCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Glaciologist:      ${gradeColor(result.stats.glaciologistGrade)}`)
  lines.push(`    Best Formation:    ${result.stats.bestFormation || 'N/A'}`)
  lines.push(`    Densest:           ${result.stats.densest || 'N/A'}`)
  lines.push(`    Most Powerful:     ${result.stats.mostPowerful || 'N/A'}`)
  lines.push(`    Most Stable:       ${result.stats.mostStable || 'N/A'}`)
  lines.push(`    Safest:            ${result.stats.safest || 'N/A'}`)
  lines.push(`    Most Mature:       ${result.stats.mostMature || 'N/A'}`)
  lines.push('')

  if (verbose && result.formations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Formation Breakdown:'))
    for (const formation of result.formations) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(formation.file)}`)
      lines.push(`      Condition:     ${conditionColor(formation.condition)}`)
      lines.push(`      Quality Score: ${scoreColor(formation.qualityScore)}`)
      lines.push(`      Density:       ${scoreColor(formation.iceDensity)} (${formation.density.type})`)
      lines.push(`      Carving:       ${scoreColor(formation.carvingPower)} (${formation.carving.style})`)
      lines.push(`      Moraine:       ${scoreColor(formation.moraineStability)} (${formation.moraine.type})`)
      lines.push(`      Crevasse:      ${scoreColor(formation.crevasseSafety)} (${formation.crevasse.depth})`)
      lines.push(`      Age:           ${scoreColor(formation.iceAgeDepth)} (${formation.age.era})`)
      lines.push(`      Advance:       ${scoreColor(formation.glacierAdvance)} (${formation.advance.status})`)
    }
    lines.push('')
  }

  if (result.systems.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Systems:'))
    for (const system of result.systems) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(system.directory)} — ${systemTypeColor(system.systemType)} (${system.condition})`)
      lines.push(`      Formations: ${system.formations.length}, Polar: ${system.polarCapCount}, Dense: ${system.denseCount}, Safe: ${system.safeCount}`)
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
