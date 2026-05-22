import chalk from 'chalk'

import type { FoundryCrucibleResult } from './foundry-crucible-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('damascus-steel') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'damascus-steel': return chalk.rgb(46, 204, 113).bold(condition)
    case 'tool-steel': return chalk.rgb(52, 152, 219)(condition)
    case 'structural-steel': return chalk.rgb(155, 89, 182)(condition)
    case 'cast-iron': return chalk.rgb(241, 196, 15)(condition)
    case 'pig-iron': return chalk.rgb(230, 126, 34)(condition)
    case 'slag': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-metallurgist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-metallurgist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'metallurgist': return chalk.rgb(52, 152, 219)(grade)
    case 'blacksmith': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(241, 196, 15)(grade)
    case 'tinker': return chalk.rgb(230, 126, 34)(grade)
    case 'scrap-dealer': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example floorTypeColor('precision-foundry') returns colored string */
export function floorTypeColor(floorType: string): string {
  switch (floorType) {
    case 'precision-foundry': return chalk.rgb(46, 204, 113)(floorType)
    case 'steel-mill': return chalk.rgb(52, 152, 219)(floorType)
    case 'iron-works': return chalk.rgb(155, 89, 182)(floorType)
    case 'brass-foundry': return chalk.rgb(241, 196, 15)(floorType)
    case 'scrap-yard': return chalk.rgb(230, 126, 34)(floorType)
    case 'volcano': return chalk.rgb(231, 76, 60)(floorType)
    default: return floorType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatFoundryCrucibleJson(result) returns JSON string */
export function formatFoundryCrucibleJson(result: FoundryCrucibleResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatFoundryCrucibleTable(result, verbose) returns formatted string */
export function formatFoundryCrucibleTable(result: FoundryCrucibleResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Foundry Crucible Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Guild Overview:'))
  lines.push(`    Overall Strength: ${scoreColor(result.guild.overallStrength)}`)
  lines.push(`    Avg Purity:       ${scoreColor(result.guild.avgPurity)}`)
  lines.push(`    Avg Strength:     ${scoreColor(result.guild.avgStrength)}`)
  lines.push(`    Avg Hardness:     ${scoreColor(result.guild.avgHardness)}`)
  lines.push(`    High Grade:       ${result.guild.isHighGrade ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:      ${result.stats.totalFiles}`)
  lines.push(`    Total Floors:     ${result.stats.totalFloors}`)
  lines.push(`    Damascus Steel:   ${result.stats.damascusSteelCount}`)
  lines.push(`    Tool Steel:       ${result.stats.toolSteelCount}`)
  lines.push(`    Structural Steel: ${result.stats.structuralSteelCount}`)
  lines.push(`    Cast Iron:        ${result.stats.castIronCount}`)
  lines.push(`    Pig Iron:         ${result.stats.pigIronCount}`)
  lines.push(`    Slag:             ${result.stats.slagCount}`)
  lines.push(`    Pure:             ${result.stats.isPureCount}`)
  lines.push(`    Well Cast:        ${result.stats.isWellCastCount}`)
  lines.push(`    Strong:           ${result.stats.isStrongCount}`)
  lines.push(`    Hardened:         ${result.stats.isHardenedCount}`)
  lines.push(`    Optimized:        ${result.stats.isOptimizedCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Metallurgist:     ${gradeColor(result.stats.metallurgistGrade)}`)
  lines.push(`    Best Casting:     ${result.stats.bestCasting || 'N/A'}`)
  lines.push(`    Purest Metal:     ${result.stats.purestMetal || 'N/A'}`)
  lines.push(`    Best Forged:      ${result.stats.bestForged || 'N/A'}`)
  lines.push(`    Hardest Temper:   ${result.stats.hardestTemper || 'N/A'}`)
  lines.push(`    Best Alloy:       ${result.stats.bestAlloy || 'N/A'}`)
  lines.push('')

  if (verbose && result.castings.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Casting Breakdown:'))
    for (const casting of result.castings) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(casting.file)}`)
      lines.push(`      Condition:       ${conditionColor(casting.condition)}`)
      lines.push(`      Quality Score:   ${scoreColor(casting.qualityScore)}`)
      lines.push(`      Metal Purity:    ${scoreColor(casting.metalPurity)} (${casting.metal.grade})`)
      lines.push(`      Casting Quality: ${scoreColor(casting.castingQuality)} (${casting.casting.method})`)
      lines.push(`      Forging:         ${scoreColor(casting.forgingStrength)} (${casting.forging.technique})`)
      lines.push(`      Temper:          ${scoreColor(casting.temperHardness)} (${casting.temper.scale})`)
      lines.push(`      Heat:            ${scoreColor(casting.heatTreatment)} (${casting.heat.process})`)
      lines.push(`      Alloy:           ${scoreColor(casting.alloyComposition)} (${casting.alloy.type})`)
    }
    lines.push('')
  }

  if (result.floors.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Floors:'))
    for (const floor of result.floors) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(floor.directory)} — ${floorTypeColor(floor.floorType)} (${floor.condition})`)
      lines.push(`      Castings: ${floor.castings.length}, Damascus: ${floor.damascusCount}, Hardened: ${floor.hardenedCount}`)
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
