import chalk from 'chalk'

import type { ForgeHammerResult } from './forge-hammer-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('excalibur') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'excalibur': return chalk.rgb(46, 204, 113).bold(condition)
    case 'masterwork-blade': return chalk.rgb(52, 152, 219)(condition)
    case 'fine-weapon': return chalk.rgb(155, 89, 182)(condition)
    case 'serviceable-tool': return chalk.rgb(241, 196, 15)(condition)
    case 'rusty-nail': return chalk.rgb(230, 126, 34)(condition)
    case 'scrap-metal': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('legendary-smith') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'legendary-smith': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-smith': return chalk.rgb(52, 152, 219)(grade)
    case 'journeyman': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(241, 196, 15)(grade)
    case 'novice': return chalk.rgb(230, 126, 34)(grade)
    case 'vandal': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example weightClassColor('sledge') returns colored string */
export function weightClassColor(weightClass: string): string {
  switch (weightClass) {
    case 'sledge': return chalk.rgb(46, 204, 113)(weightClass)
    case 'engineer': return chalk.rgb(52, 152, 219)(weightClass)
    case 'cross-peen': return chalk.rgb(155, 89, 182)(weightClass)
    case 'ball-peen': return chalk.rgb(241, 196, 15)(weightClass)
    case 'tack': return chalk.rgb(230, 126, 34)(weightClass)
    case 'feather': return chalk.rgb(231, 76, 60)(weightClass)
    default: return weightClass
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatForgeHammerJson(result) returns JSON string */
export function formatForgeHammerJson(result: ForgeHammerResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatForgeHammerTable(result, verbose) returns formatted string */
export function formatForgeHammerTable(result: ForgeHammerResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Forge Hammer Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Forge Overview:'))
  lines.push(`    Overall Quality:         ${scoreColor(result.forge.overallQuality)}`)
  lines.push(`    Avg Impact:              ${scoreColor(result.forge.avgImpact)}`)
  lines.push(`    Avg Precision:           ${scoreColor(result.forge.avgPrecision)}`)
  lines.push(`    Avg Blade Quality:       ${scoreColor(result.forge.avgQuality)}`)
  lines.push(`    Is Legendary:            ${result.forge.isLegendary ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Armories:            ${result.stats.totalArmories}`)
  lines.push(`    Avg Hammer Weight:         ${scoreColor(result.stats.avgHammerWeight)}`)
  lines.push(`    Avg Strike Precision:      ${scoreColor(result.stats.avgStrikePrecision)}`)
  lines.push(`    Avg Metal Temper:          ${scoreColor(result.stats.avgMetalTemper)}`)
  lines.push(`    Avg Edge Quality:          ${scoreColor(result.stats.avgEdgeQuality)}`)
  lines.push(`    Avg Forging Technique:     ${scoreColor(result.stats.avgForgingTechnique)}`)
  lines.push(`    Avg Blade Quality:         ${scoreColor(result.stats.avgBladeQuality)}`)
  lines.push(`    Smith Grade:               ${gradeColor(result.stats.smithGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Condition Counts:'))
  lines.push(`    Excalibur:                 ${result.stats.excaliburCount}`)
  lines.push(`    Masterwork Blade:          ${result.stats.masterworkBladeCount}`)
  lines.push(`    Fine Weapon:               ${result.stats.fineWeaponCount}`)
  lines.push(`    Serviceable Tool:          ${result.stats.serviceableToolCount}`)
  lines.push(`    Rusty Nail:                ${result.stats.rustyNailCount}`)
  lines.push(`    Scrap Metal:               ${result.stats.scrapMetalCount}`)
  lines.push('')

  if (result.stats.bestBlow) {
    lines.push(chalk.rgb(44, 62, 80)('  Highlights:'))
    lines.push(`    Best Blow:              ${result.stats.bestBlow}`)
    lines.push(`    Heaviest:               ${result.stats.heaviest}`)
    lines.push(`    Most Precise:           ${result.stats.mostPrecise}`)
    lines.push(`    Best Temper:            ${result.stats.bestTemper}`)
    lines.push(`    Sharpest:               ${result.stats.sharpest}`)
    lines.push(`    Finest Craft:           ${result.stats.finestCraft}`)
    lines.push('')
  }

  if (verbose && result.blows.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-File Details:'))
    for (const blow of result.blows) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(blow.file)}`)
      lines.push(`      Score: ${scoreColor(blow.qualityScore)}  Condition: ${conditionColor(blow.condition)}`)
      lines.push(`      Weight: ${weightClassColor(blow.weight.class)}(${blow.hammerWeight})  Precision: ${blow.precision.aim}(${blow.strikePrecision})  Temper: ${blow.temper.grade}(${blow.metalTemper})`)
      lines.push(`      Edge: ${blow.edge.retention}(${blow.edgeQuality})  Technique: ${blow.technique.method}(${blow.forgingTechnique})  Blade: ${blow.blade.grade}(${blow.bladeQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(241, 196, 15)('•')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
