import chalk from 'chalk'

import type { DesertBloomResult } from './desert-bloom-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('superbloom') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'superbloom': return chalk.rgb(255, 215, 0).bold(condition)
    case 'saguaro-bloom': return chalk.rgb(46, 204, 113)(condition)
    case 'desert-marigold': return chalk.rgb(255, 165, 0)(condition)
    case 'prickly-pear': return chalk.rgb(155, 89, 182)(condition)
    case 'tumbleweed': return chalk.rgb(230, 126, 34)(condition)
    case 'dust-devil': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('desert-sage') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'desert-sage': return chalk.rgb(46, 204, 113).bold(grade)
    case 'ranger': return chalk.rgb(52, 152, 219)(grade)
    case 'botanist': return chalk.rgb(155, 89, 182)(grade)
    case 'hiker': return chalk.rgb(241, 196, 15)(grade)
    case 'tourist': return chalk.rgb(230, 126, 34)(grade)
    case 'snowbird': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example strategyColor('succulent') returns colored string */
export function strategyColor(strategy: string): string {
  switch (strategy) {
    case 'succulent': return chalk.rgb(46, 204, 113)(strategy)
    case 'deep-root': return chalk.rgb(52, 152, 219)(strategy)
    case 'ephemeral': return chalk.rgb(255, 215, 0)(strategy)
    case 'dormant': return chalk.rgb(241, 196, 15)(strategy)
    case 'wilted': return chalk.rgb(230, 126, 34)(strategy)
    case 'dead': return chalk.rgb(231, 76, 60)(strategy)
    default: return strategy
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatDesertBloomJson(result) returns JSON string */
export function formatDesertBloomJson(result: DesertBloomResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatDesertBloomTable(result, verbose) returns formatted string */
export function formatDesertBloomTable(result: DesertBloomResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(210, 180, 140).bold('  Desert Bloom Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Desert Overview:'))
  lines.push(`    Overall Resilience:     ${scoreColor(result.desert.overallResilience)}`)
  lines.push(`    Avg Tolerance:          ${scoreColor(result.desert.avgTolerance)}`)
  lines.push(`    Avg Efficiency:         ${scoreColor(result.desert.avgEfficiency)}`)
  lines.push(`    Avg Resilience:         ${scoreColor(result.desert.avgResilience)}`)
  lines.push(`    Is Resilient:           ${result.desert.isResilient ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Oases:                   ${result.stats.totalOases}`)
  lines.push(`    Avg Drought Tolerance:         ${scoreColor(result.stats.avgDroughtTolerance)}`)
  lines.push(`    Avg Heat Resistance:           ${scoreColor(result.stats.avgHeatResistance)}`)
  lines.push(`    Avg Water Storage:             ${scoreColor(result.stats.avgWaterStorage)}`)
  lines.push(`    Avg Rare Bloom Quality:        ${scoreColor(result.stats.avgRareBloomQuality)}`)
  lines.push(`    Avg Seed Bank Vitality:        ${scoreColor(result.stats.avgSeedBankVitality)}`)
  lines.push(`    Avg Desert Adaptation:         ${scoreColor(result.stats.avgDesertAdaptation)}`)
  lines.push(`    Desert Ranger Grade:           ${gradeColor(result.stats.desertRangerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Superbloom:                    ${result.stats.superbloomCount}`)
  lines.push(`    Saguaro Bloom:                 ${result.stats.saguaroBloomCount}`)
  lines.push(`    Desert Marigold:               ${result.stats.desertMarigoldCount}`)
  lines.push(`    Prickly Pear:                  ${result.stats.pricklyPearCount}`)
  lines.push(`    Tumbleweed:                    ${result.stats.tumbleweedCount}`)
  lines.push(`    Dust Devil:                    ${result.stats.dustDevilCount}`)
  lines.push('')

  if (result.stats.bestFlower) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Flower:       ${result.stats.bestFlower}`)
    lines.push(`    Most Resilient:    ${result.stats.mostResilient}`)
    lines.push(`    Most Efficient:    ${result.stats.mostEfficient}`)
    lines.push(`    Most Impactful:    ${result.stats.mostImpactful}`)
    lines.push(`    Most Potential:    ${result.stats.mostPotential}`)
    lines.push(`    Most Adapted:      ${result.stats.mostAdapted}`)
    lines.push('')
  }

  if (verbose && result.flowers.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const flower of result.flowers) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(flower.file)}`)
      lines.push(`      Score: ${scoreColor(flower.qualityScore)}  Condition: ${conditionColor(flower.condition)}`)
      lines.push(`      Drought: ${strategyColor(flower.drought.strategy)}(${flower.droughtTolerance})  Heat: ${flower.heat.tolerance}(${flower.heatResistance})  Storage: ${flower.storage.type}(${flower.waterStorage})`)
      lines.push(`      Bloom: ${flower.bloom.rarity}(${flower.rareBloomQuality})  Seed: ${flower.seed.bank}(${flower.seedBankVitality})  Adaptation: ${flower.adaptation.type}(${flower.desertAdaptation})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 215, 0)('🌵')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
