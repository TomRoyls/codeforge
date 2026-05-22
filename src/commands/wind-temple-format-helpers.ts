import chalk from 'chalk'

import type { WindTempleResult } from './wind-temple-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('mountain-shrine') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'mountain-shrine': return chalk.rgb(46, 204, 113).bold(condition)
    case 'garden-temple': return chalk.rgb(52, 152, 219)(condition)
    case 'forest-sanctuary': return chalk.rgb(155, 89, 182)(condition)
    case 'wayside-shrine': return chalk.rgb(241, 196, 15)(condition)
    case 'abandoned-ruin': return chalk.rgb(230, 126, 34)(condition)
    case 'rubble': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-architect') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-architect': return chalk.rgb(46, 204, 113).bold(grade)
    case 'temple-architect': return chalk.rgb(52, 152, 219)(grade)
    case 'builder': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(241, 196, 15)(grade)
    case 'novice': return chalk.rgb(230, 126, 34)(grade)
    case 'iconoclast': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example complexTypeColor('grand-temple') returns colored string */
export function complexTypeColor(complexType: string): string {
  switch (complexType) {
    case 'grand-temple': return chalk.rgb(46, 204, 113)(complexType)
    case 'monastery': return chalk.rgb(52, 152, 219)(complexType)
    case 'shrine-complex': return chalk.rgb(155, 89, 182)(complexType)
    case 'meditation-garden': return chalk.rgb(241, 196, 15)(complexType)
    case 'clearing': return chalk.rgb(230, 126, 34)(complexType)
    case 'overgrown': return chalk.rgb(231, 76, 60)(complexType)
    default: return complexType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatWindTempleJson(result) returns JSON string */
export function formatWindTempleJson(result: WindTempleResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatWindTempleTable(result, verbose) returns formatted string */
export function formatWindTempleTable(result: WindTempleResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Wind Temple Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Sanctuary Overview:'))
  lines.push(`    Overall Harmony:         ${scoreColor(result.sanctuary.overallHarmony)}`)
  lines.push(`    Avg Flow:                ${scoreColor(result.sanctuary.avgFlow)}`)
  lines.push(`    Avg Harmony:             ${scoreColor(result.sanctuary.avgHarmony)}`)
  lines.push(`    Avg Clarity:             ${scoreColor(result.sanctuary.avgClarity)}`)
  lines.push(`    Is Enlightened:          ${result.sanctuary.isEnlightened ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Complexes:           ${result.stats.totalComplexes}`)
  lines.push(`    Avg Wind Flow:             ${scoreColor(result.stats.avgWindFlow)}`)
  lines.push(`    Avg Temple Harmony:        ${scoreColor(result.stats.avgTempleHarmony)}`)
  lines.push(`    Avg Energy Alignment:      ${scoreColor(result.stats.avgEnergyAlignment)}`)
  lines.push(`    Avg Structural Grace:      ${scoreColor(result.stats.avgStructuralGrace)}`)
  lines.push(`    Avg Openness Quality:      ${scoreColor(result.stats.avgOpennessQuality)}`)
  lines.push(`    Avg Spiritual Clarity:     ${scoreColor(result.stats.avgSpiritualClarity)}`)
  lines.push(`    Mountain Shrine:           ${result.stats.mountainShrineCount}`)
  lines.push(`    Garden Temple:             ${result.stats.gardenTempleCount}`)
  lines.push(`    Forest Sanctuary:          ${result.stats.forestSanctuaryCount}`)
  lines.push(`    Wayside Shrine:            ${result.stats.waysideShrineCount}`)
  lines.push(`    Abandoned Ruin:            ${result.stats.abandonedRuinCount}`)
  lines.push(`    Rubble:                    ${result.stats.rubbleCount}`)
  lines.push(`    Good Flow:                 ${result.stats.hasGoodFlowCount}`)
  lines.push(`    High Harmony:              ${result.stats.hasHighHarmonyCount}`)
  lines.push(`    Proper Alignment:          ${result.stats.hasProperAlignmentCount}`)
  lines.push(`    Graceful Structure:        ${result.stats.hasGracefulStructureCount}`)
  lines.push(`    Transparency:              ${result.stats.hasTransparencyCount}`)
  lines.push(`    High Clarity:              ${result.stats.hasHighClarityCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Architect Grade:           ${gradeColor(result.stats.architectGrade)}`)
  lines.push(`    Best Chamber:              ${result.stats.bestChamber || 'N/A'}`)
  lines.push(`    Best Flow:                 ${result.stats.bestFlow || 'N/A'}`)
  lines.push(`    Most Harmonious:           ${result.stats.mostHarmonious || 'N/A'}`)
  lines.push(`    Best Aligned:              ${result.stats.bestAligned || 'N/A'}`)
  lines.push(`    Most Graceful:             ${result.stats.mostGraceful || 'N/A'}`)
  lines.push(`    Clearest:                  ${result.stats.clearest || 'N/A'}`)
  lines.push('')

  if (verbose && result.chambers.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Chamber Breakdown:'))
    for (const ch of result.chambers) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(ch.file)}`)
      lines.push(`      Condition:              ${conditionColor(ch.condition)}`)
      lines.push(`      Quality Score:          ${scoreColor(ch.qualityScore)}`)
      lines.push(`      Wind Flow:              ${scoreColor(ch.windFlow)} (${ch.flow.pattern})`)
      lines.push(`      Temple Harmony:         ${scoreColor(ch.templeHarmony)} (${ch.harmony.tone})`)
      lines.push(`      Energy Alignment:       ${scoreColor(ch.energyAlignment)} (${ch.alignment.direction})`)
      lines.push(`      Structural Grace:       ${scoreColor(ch.structuralGrace)} (${ch.grace.style})`)
      lines.push(`      Openness Quality:       ${scoreColor(ch.opennessQuality)} (${ch.openness.design})`)
      lines.push(`      Spiritual Clarity:      ${scoreColor(ch.spiritualClarity)} (${ch.clarity.state})`)
    }
    lines.push('')
  }

  if (result.complexes.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Complexes:'))
    for (const cx of result.complexes) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cx.directory)} — ${complexTypeColor(cx.complexType)} (${cx.condition})`)
      lines.push(`      Chambers: ${cx.chambers.length}, Mountain Shrines: ${cx.mountainShrineCount}, Rubble: ${cx.rubbleCount}, Good Flow: ${cx.goodFlowCount}`)
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
