import chalk from 'chalk'
import type { EmberHearthIiResult } from './ember-hearth-ii-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 165, 0)(String(score))
  if (score >= 60) return chalk.rgb(255, 140, 0)(String(score))
  if (score >= 40) return chalk.rgb(255, 69, 0)(String(score))
  return chalk.rgb(139, 69, 19)(String(score))
}

/** @example warmHeatColor('white-hot-core') returns colored string */
export function warmHeatColor(s: string): string {
  switch (s) {
    case 'white-hot-core': return chalk.rgb(255, 165, 0).bold(s)
    case 'glowing-ember': return chalk.rgb(255, 140, 0)(s)
    case 'steady-warmth': return chalk.rgb(255, 69, 0)(s)
    case 'cooling-coals': return chalk.rgb(205, 92, 92)(s)
    case 'cold-ash': return chalk.rgb(139, 69, 19)(s)
    case 'frozen': return chalk.rgb(100, 100, 100)(s)
    default: return s
  }
}

/** @example burningQualityColor('complete-combustion') returns colored string */
export function burningQualityColor(s: string): string {
  switch (s) {
    case 'complete-combustion': return chalk.rgb(255, 165, 0).bold(s)
    case 'clean-burn': return chalk.rgb(255, 140, 0)(s)
    case 'proper-flame': return chalk.rgb(255, 69, 0)(s)
    case 'smoky-burn': return chalk.rgb(205, 92, 92)(s)
    case 'sputtering': return chalk.rgb(139, 69, 19)(s)
    case 'no-fire': return chalk.rgb(100, 100, 100)(s)
    default: return s
  }
}

/** @example wiseKnowledgeColor('sage-wisdom') returns colored string */
export function wiseKnowledgeColor(s: string): string {
  switch (s) {
    case 'sage-wisdom': return chalk.rgb(255, 165, 0).bold(s)
    case 'experienced-learner': return chalk.rgb(255, 140, 0)(s)
    case 'proper-scholar': return chalk.rgb(255, 69, 0)(s)
    case 'still-learning': return chalk.rgb(205, 92, 92)(s)
    case 'naive': return chalk.rgb(139, 69, 19)(s)
    case 'ignorant': return chalk.rgb(100, 100, 100)(s)
    default: return s
  }
}

/** @example tendingCareColor('master-firekeeper') returns colored string */
export function tendingCareColor(s: string): string {
  switch (s) {
    case 'master-firekeeper': return chalk.rgb(255, 165, 0).bold(s)
    case 'dedicated-tender': return chalk.rgb(255, 140, 0)(s)
    case 'proper-caretaker': return chalk.rgb(255, 69, 0)(s)
    case 'occasional-attention': return chalk.rgb(205, 92, 92)(s)
    case 'neglected': return chalk.rgb(139, 69, 19)(s)
    case 'abandoned': return chalk.rgb(100, 100, 100)(s)
    default: return s
  }
}

/** @example sparkingCreativityColor('fireworks-display') returns colored string */
export function sparkingCreativityColor(s: string): string {
  switch (s) {
    case 'fireworks-display': return chalk.rgb(255, 165, 0).bold(s)
    case 'creative-sparks': return chalk.rgb(255, 140, 0)(s)
    case 'clever-ignition': return chalk.rgb(255, 69, 0)(s)
    case 'routine-flame': return chalk.rgb(205, 92, 92)(s)
    case 'dormant': return chalk.rgb(139, 69, 19)(s)
    case 'no-spark': return chalk.rgb(100, 100, 100)(s)
    default: return s
  }
}

/** @example forgingHeatColor('forge-ready') returns colored string */
export function forgingHeatColor(s: string): string {
  switch (s) {
    case 'forge-ready': return chalk.rgb(255, 165, 0).bold(s)
    case 'glowing-hot': return chalk.rgb(255, 140, 0)(s)
    case 'proper-heat': return chalk.rgb(255, 69, 0)(s)
    case 'warm-metal': return chalk.rgb(205, 92, 92)(s)
    case 'cold-iron': return chalk.rgb(139, 69, 19)(s)
    case 'frozen-solid': return chalk.rgb(100, 100, 100)(s)
    default: return s
  }
}

/** @example emberConditionColor('forge-furnace') returns colored string */
export function emberConditionColor(c: string): string {
  switch (c) {
    case 'forge-furnace': return chalk.rgb(255, 165, 0).bold(c)
    case 'glowing-hearth': return chalk.rgb(255, 140, 0)(c)
    case 'steady-fire': return chalk.rgb(255, 69, 0)(c)
    case 'dying-embers': return chalk.rgb(205, 92, 92)(c)
    case 'cold-ash-pit': return chalk.rgb(139, 69, 19)(c)
    case 'extinguished': return chalk.rgb(100, 100, 100)(c)
    default: return c
  }
}

/** @example blacksmithGradeColor('master-blacksmith') returns colored string */
export function blacksmithGradeColor(g: string): string {
  switch (g) {
    case 'master-blacksmith': return chalk.rgb(255, 165, 0).bold(g)
    case 'expert-forger': return chalk.rgb(255, 140, 0)(g)
    case 'skilled-smith': return chalk.rgb(255, 69, 0)(g)
    case 'apprentice': return chalk.rgb(205, 92, 92)(g)
    case 'bellows-boy': return chalk.rgb(139, 69, 19)(g)
    case 'cold-hands': return chalk.rgb(100, 100, 100)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatEmberHearthIiJson(result) returns JSON string */
export function formatEmberHearthIiJson(result: EmberHearthIiResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatEmberHearthIiTable(result, verbose) returns formatted string */
export function formatEmberHearthIiTable(result: EmberHearthIiResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 165, 0).bold('  Ember Hearth II Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 165, 0)('  Forge:'))
  lines.push(`    Avg Warmth:            ${scoreColor(result.forge.avgWarmth)}`)
  lines.push(`    Avg Wisdom:            ${scoreColor(result.forge.avgWisdom)}`)
  lines.push(`    Avg Innovation:        ${scoreColor(result.forge.avgInnovation)}`)
  lines.push(`    Is Hot:                ${result.forge.isHot ? chalk.rgb(255, 165, 0)('Yes') : chalk.rgb(100, 100, 100)('No')}`)
  lines.push(`    Overall Heat:          ${scoreColor(result.forge.overallHeat)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 165, 0)('  Statistics:'))
  lines.push(`    Total Files:                ${result.stats.totalFiles}`)
  lines.push(`    Total Circles:              ${result.stats.totalCircles}`)
  lines.push(`    Avg Warmth Deep:            ${scoreColor(result.stats.avgWarmthDeep)}`)
  lines.push(`    Avg Burn Quality:           ${scoreColor(result.stats.avgBurnQuality)}`)
  lines.push(`    Avg Ash Wisdom:             ${scoreColor(result.stats.avgAshWisdom)}`)
  lines.push(`    Avg Fire Tending:           ${scoreColor(result.stats.avgFireTending)}`)
  lines.push(`    Avg Spark Generation:       ${scoreColor(result.stats.avgSparkGeneration)}`)
  lines.push(`    Avg Forge Temperature:      ${scoreColor(result.stats.avgForgeTemperature)}`)
  lines.push(`    Blacksmith Grade:           ${blacksmithGradeColor(result.stats.blacksmithGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 165, 0)('  Condition Counts:'))
  lines.push(`    Forge Furnace:     ${result.stats.forgeFurnaceCount}`)
  lines.push(`    Glowing Hearth:    ${result.stats.glowingHearthCount}`)
  lines.push(`    Steady Fire:       ${result.stats.steadyFireCount}`)
  lines.push(`    Dying Embers:      ${result.stats.dyingEmbersCount}`)
  lines.push(`    Cold Ash Pit:      ${result.stats.coldAshPitCount}`)
  lines.push(`    Extinguished:      ${result.stats.extinguishedCount}`)
  lines.push('')

  if (result.stats.bestEmber) {
    lines.push(chalk.rgb(255, 165, 0)('  Highlights:'))
    lines.push(`    Best Ember:         ${result.stats.bestEmber}`)
    lines.push(`    Warmest:            ${result.stats.warmest}`)
    lines.push(`    Most Efficient:     ${result.stats.mostEfficient}`)
    lines.push(`    Wisest:             ${result.stats.wisest}`)
    lines.push(`    Best Maintained:    ${result.stats.bestMaintained}`)
    lines.push(`    Most Innovative:    ${result.stats.mostInnovative}`)
    lines.push('')
  }

  if (verbose && result.embers.length > 0) {
    lines.push(chalk.rgb(255, 165, 0)('  Per-File Embers:'))
    for (const e of result.embers) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(e.file)}`)
      lines.push(`      Score: ${scoreColor(e.qualityScore)}  Condition: ${emberConditionColor(e.condition)}`)
      lines.push(`      Warm: ${warmHeatColor(e.warm.heat)}(${e.warmthDeep})  Burning: ${burningQualityColor(e.burning.quality)}(${e.burnQuality})  Wise: ${wiseKnowledgeColor(e.wise.knowledge)}(${e.ashWisdom})`)
      lines.push(`      Tending: ${tendingCareColor(e.tending.care)}(${e.fireTending})  Sparking: ${sparkingCreativityColor(e.sparking.creativity)}(${e.sparkGeneration})  Forging: ${forgingHeatColor(e.forging.heat)}(${e.forgeTemperature})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 165, 0)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 165, 0)('\u{1F525}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
