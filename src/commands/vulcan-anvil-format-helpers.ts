import chalk from 'chalk'

import type { VulcanAnvilResult } from './vulcan-anvil-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('aegis-shield') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'aegis-shield': return chalk.rgb(46, 204, 113).bold(condition)
    case 'thunderbolt': return chalk.rgb(52, 152, 219)(condition)
    case 'masterwork-sword': return chalk.rgb(155, 89, 182)(condition)
    case 'good-steel': return chalk.rgb(241, 196, 15)(condition)
    case 'pig-iron': return chalk.rgb(230, 126, 34)(condition)
    case 'slag': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('god-of-forge') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'god-of-forge': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-smith': return chalk.rgb(52, 152, 219)(grade)
    case 'journeyman-smith': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice-smith': return chalk.rgb(241, 196, 15)(grade)
    case 'village-smith': return chalk.rgb(230, 126, 34)(grade)
    case 'scrap-collector': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example workshopTypeColor('divine-forge') returns colored string */
export function workshopTypeColor(workshopType: string): string {
  switch (workshopType) {
    case 'divine-forge': return chalk.rgb(46, 204, 113)(workshopType)
    case 'master-workshop': return chalk.rgb(52, 152, 219)(workshopType)
    case 'guild-hall': return chalk.rgb(155, 89, 182)(workshopType)
    case 'village-forge': return chalk.rgb(241, 196, 15)(workshopType)
    case 'campfire': return chalk.rgb(230, 126, 34)(workshopType)
    case 'ruins': return chalk.rgb(231, 76, 60)(workshopType)
    default: return workshopType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatVulcanAnvilJson(result) returns JSON string */
export function formatVulcanAnvilJson(result: VulcanAnvilResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatVulcanAnvilTable(result, verbose) returns formatted string */
export function formatVulcanAnvilTable(result: VulcanAnvilResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Vulcan Anvil Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Pantheon Overview:'))
  lines.push(`    Overall Quality:      ${scoreColor(result.pantheon.overallQuality)}`)
  lines.push(`    Avg Heat:             ${scoreColor(result.pantheon.avgHeat)}`)
  lines.push(`    Avg Stability:        ${scoreColor(result.pantheon.avgStability)}`)
  lines.push(`    Avg Craft:            ${scoreColor(result.pantheon.avgCraft)}`)
  lines.push(`    Divine:               ${result.pantheon.isDivine ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Workshops:          ${result.stats.totalWorkshops}`)
  lines.push(`    Avg Forge Heat:           ${scoreColor(result.stats.avgForgeHeat)}`)
  lines.push(`    Avg Hammer Work:          ${scoreColor(result.stats.avgHammerWork)}`)
  lines.push(`    Avg Anvil Stability:      ${scoreColor(result.stats.avgAnvilStability)}`)
  lines.push(`    Avg Quench Quality:       ${scoreColor(result.stats.avgQuenchQuality)}`)
  lines.push(`    Avg Temper Balance:       ${scoreColor(result.stats.avgTemperBalance)}`)
  lines.push(`    Avg Divine Craft:         ${scoreColor(result.stats.avgDivineCraft)}`)
  lines.push(`    Aegis Shield:             ${result.stats.aegisShieldCount}`)
  lines.push(`    Thunderbolt:              ${result.stats.thunderboltCount}`)
  lines.push(`    Masterwork Sword:         ${result.stats.masterworkSwordCount}`)
  lines.push(`    Good Steel:               ${result.stats.goodSteelCount}`)
  lines.push(`    Pig Iron:                 ${result.stats.pigIronCount}`)
  lines.push(`    Slag:                     ${result.stats.slagCount}`)
  lines.push(`    Proper Heat:              ${result.stats.hasProperHeatCount}`)
  lines.push(`    Proper Refinement:        ${result.stats.hasProperRefinementCount}`)
  lines.push(`    Stable:                   ${result.stats.isStableCount}`)
  lines.push(`    Proper Hardening:         ${result.stats.hasProperHardeningCount}`)
  lines.push(`    Balanced:                 ${result.stats.isBalancedCount}`)
  lines.push(`    Divine:                   ${result.stats.isDivineCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Smith Grade:              ${gradeColor(result.stats.smithGrade)}`)
  lines.push(`    Best Work:                ${result.stats.bestWork || 'N/A'}`)
  lines.push(`    Hottest:                  ${result.stats.hottest || 'N/A'}`)
  lines.push(`    Most Refined:             ${result.stats.mostRefined || 'N/A'}`)
  lines.push(`    Most Stable:              ${result.stats.mostStable || 'N/A'}`)
  lines.push(`    Best Hardened:            ${result.stats.bestHardened || 'N/A'}`)
  lines.push(`    Most Divine:              ${result.stats.mostDivine || 'N/A'}`)
  lines.push('')

  if (verbose && result.works.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Work Breakdown:'))
    for (const w of result.works) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(w.file)}`)
      lines.push(`      Condition:             ${conditionColor(w.condition)}`)
      lines.push(`      Quality Score:         ${scoreColor(w.qualityScore)}`)
      lines.push(`      Heat:                  ${scoreColor(w.forgeHeat)} (${w.heat.source})`)
      lines.push(`      Hammer:                ${scoreColor(w.hammerWork)} (${w.hammer.technique})`)
      lines.push(`      Anvil:                 ${scoreColor(w.anvilStability)} (${w.anvil.material})`)
      lines.push(`      Quench:                ${scoreColor(w.quenchQuality)} (${w.quench.medium})`)
      lines.push(`      Temper:                ${scoreColor(w.temperBalance)} (${w.temper.method})`)
      lines.push(`      Craft:                 ${scoreColor(w.divineCraft)} (${w.craft.level})`)
    }
    lines.push('')
  }

  if (result.workshops.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Workshops:'))
    for (const ws of result.workshops) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(ws.directory)} — ${workshopTypeColor(ws.workshopType)} (${ws.condition})`)
      lines.push(`      Works: ${ws.works.length}, Aegis: ${ws.aegisCount}, Slag: ${ws.slagCount}, Stable: ${ws.stableCount}, Divine: ${ws.divineCount}`)
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
