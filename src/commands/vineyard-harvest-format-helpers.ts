import chalk from 'chalk'

import type { VineyardHarvestResult } from './vineyard-harvest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('chateau-margaux') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'chateau-margaux': return chalk.rgb(128, 0, 0).bold(condition)
    case 'romanee-conti': return chalk.rgb(139, 69, 19)(condition)
    case 'opus-one': return chalk.rgb(178, 34, 34)(condition)
    case 'chateau-neuf': return chalk.rgb(255, 140, 0)(condition)
    case 'box-wine': return chalk.rgb(230, 126, 34)(condition)
    case 'grape-juice': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-sommelier') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-sommelier': return chalk.rgb(128, 0, 0).bold(grade)
    case 'winemaker': return chalk.rgb(139, 69, 19)(grade)
    case 'cellar-master': return chalk.rgb(178, 34, 34)(grade)
    case 'viticulturist': return chalk.rgb(241, 196, 15)(grade)
    case 'grape-picker': return chalk.rgb(230, 126, 34)(grade)
    case 'grape-stomper': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example stageColor('perfect-ripeness') returns colored string */
export function stageColor(stage: string): string {
  switch (stage) {
    case 'perfect-ripeness': return chalk.rgb(46, 204, 113)(stage)
    case 'ripe': return chalk.rgb(139, 69, 19)(stage)
    case 'veraison': return chalk.rgb(155, 89, 182)(stage)
    case 'green': return chalk.rgb(241, 196, 15)(stage)
    case 'unripe': return chalk.rgb(230, 126, 34)(stage)
    case 'rotten': return chalk.rgb(231, 76, 60)(stage)
    default: return stage
  }
}

/** @example volumeColor('abundant') returns colored string */
export function volumeColor(volume: string): string {
  switch (volume) {
    case 'abundant': return chalk.rgb(46, 204, 113)(volume)
    case 'generous': return chalk.rgb(52, 152, 219)(volume)
    case 'moderate': return chalk.rgb(241, 196, 15)(volume)
    case 'light': return chalk.rgb(230, 126, 34)(volume)
    case 'poor': return chalk.rgb(231, 76, 60)(volume)
    case 'crop-failure': return chalk.rgb(192, 57, 43).bold(volume)
    default: return volume
  }
}

/** @example regionColor('bordeaux') returns colored string */
export function regionColor(region: string): string {
  switch (region) {
    case 'bordeaux': return chalk.rgb(128, 0, 0).bold(region)
    case 'burgundy': return chalk.rgb(139, 69, 19)(region)
    case 'napa': return chalk.rgb(46, 204, 113)(region)
    case 'tuscany': return chalk.rgb(255, 215, 0)(region)
    case 'generic': return chalk.rgb(230, 126, 34)(region)
    case 'industrial': return chalk.rgb(231, 76, 60)(region)
    default: return region
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatVineyardHarvestJson(result) returns JSON string */
export function formatVineyardHarvestJson(result: VineyardHarvestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatVineyardHarvestTable(result, verbose) returns formatted string */
export function formatVineyardHarvestTable(result: VineyardHarvestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(128, 0, 0).bold('  Vineyard Harvest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Estate Overview:'))
  lines.push(`    Overall Quality:      ${scoreColor(result.estate.overallQuality)}`)
  lines.push(`    Avg Ripeness:         ${scoreColor(result.estate.avgRipeness)}`)
  lines.push(`    Avg Quality:          ${scoreColor(result.estate.avgQuality)}`)
  lines.push(`    Avg Vintage:          ${scoreColor(result.estate.avgVintage)}`)
  lines.push(`    Is Exceptional:       ${result.estate.isExceptional ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Blocks:                  ${result.stats.totalBlocks}`)
  lines.push(`    Avg Grape Ripeness:            ${scoreColor(result.stats.avgGrapeRipeness)}`)
  lines.push(`    Avg Yield Quality:             ${scoreColor(result.stats.avgYieldQuality)}`)
  lines.push(`    Avg Vintage Character:         ${scoreColor(result.stats.avgVintageCharacter)}`)
  lines.push(`    Avg Barrel Aging:              ${scoreColor(result.stats.avgBarrelAging)}`)
  lines.push(`    Avg Terroir Expression:        ${scoreColor(result.stats.avgTerroirExpression)}`)
  lines.push(`    Avg Cellar Quality:            ${scoreColor(result.stats.avgCellarQuality)}`)
  lines.push(`    Winemaker Grade:               ${gradeColor(result.stats.winemakerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Chateau Margaux:               ${result.stats.chateauMargauxCount}`)
  lines.push(`    Romanee Conti:                 ${result.stats.romaneeContiCount}`)
  lines.push(`    Opus One:                      ${result.stats.opusOneCount}`)
  lines.push(`    Chateau Neuf:                  ${result.stats.chateauNeufCount}`)
  lines.push(`    Box Wine:                      ${result.stats.boxWineCount}`)
  lines.push(`    Grape Juice:                   ${result.stats.grapeJuiceCount}`)
  lines.push('')

  if (result.stats.bestGrape) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Grape:          ${result.stats.bestGrape}`)
    lines.push(`    Ripest:              ${result.stats.ripest}`)
    lines.push(`    Highest Yield:       ${result.stats.highestYield}`)
    lines.push(`    Most Distinctive:    ${result.stats.mostDistinctive}`)
    lines.push(`    Most Refined:        ${result.stats.mostRefined}`)
    lines.push(`    Best Terroir:        ${result.stats.bestTerroir}`)
    lines.push('')
  }

  if (verbose && result.grapes.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const grape of result.grapes) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(grape.file)}`)
      lines.push(`      Score: ${scoreColor(grape.qualityScore)}  Condition: ${conditionColor(grape.condition)}`)
      lines.push(`      Ripeness: ${stageColor(grape.ripeness.stage)}(${grape.grapeRipeness})  Yield: ${volumeColor(grape.yield.volume)}(${grape.yieldQuality})  Vintage: ${grape.vintage.year}(${grape.vintageCharacter})`)
      lines.push(`      Barrel: ${grape.barrel.type}(${grape.barrelAging})  Terroir: ${regionColor(grape.terroir.region)}(${grape.terroirExpression})  Cellar: ${grape.cellar.grade}(${grape.cellarQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(139, 69, 19)('\u{1F377}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
