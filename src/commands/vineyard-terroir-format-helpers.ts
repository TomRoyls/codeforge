import chalk from 'chalk'
import type { VineyardTerroirResult, VineyardPlot, WineRegion, VineyardTerroirStats } from './vineyard-terroir-helpers.js'

// ─── Color Helpers ──────────────────────────────────────

/**
 * Colorize a numeric score
 * @example
 * scoreColor(85) // green bold
 */
export function scoreColor(score: number): string {
  if (score >= 70) return chalk.bold.green(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  return chalk.red(String(score))
}

/**
 * Colorize soil type
 * @example
 * soilTypeColor('limestone') // cyan bold
 */
export function soilTypeColor(type: string): string {
  const colors: Record<string, (s: string) => string> = {
    limestone: chalk.cyan,
    clay: chalk.rgb(180, 120, 60),
    gravel: chalk.gray,
    sand: chalk.yellow,
    loam: chalk.rgb(100, 160, 60),
    dirt: chalk.rgb(140, 90, 40),
  }
  return (colors[type] ?? chalk.white)(type)
}

/**
 * Colorize condition label
 * @example
 * conditionColor('grand-cru') // green bold
 */
export function conditionColor(condition: string): string {
  if (condition === 'grand-cru') return chalk.bold.green(condition)
  if (condition === 'premier-cru') return chalk.green(condition)
  if (condition === 'cru-bourgeois') return chalk.cyan(condition)
  if (condition === 'vin-de-pays') return chalk.yellow(condition)
  if (condition === 'table-wine') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

/**
 * Colorize grape type
 * @example
 * grapeTypeColor('cabernet-sauvignon') // magenta
 */
export function grapeTypeColor(type: string): string {
  const colors: Record<string, (s: string) => string> = {
    'cabernet-sauvignon': chalk.magenta,
    'pinot-noir': chalk.red,
    chardonnay: chalk.yellow,
    merlot: chalk.rgb(140, 40, 80),
    riesling: chalk.green,
    'table-grape': chalk.gray,
  }
  return (colors[type] ?? chalk.white)(type)
}

/**
 * Colorize vintage year
 * @example
 * vintageYearColor('legendary') // green bold
 */
export function vintageYearColor(year: string): string {
  if (year === 'legendary') return chalk.bold.green(year)
  if (year === 'exceptional') return chalk.green(year)
  if (year === 'excellent') return chalk.cyan(year)
  if (year === 'good') return chalk.yellow(year)
  if (year === 'average') return chalk.rgb(200, 130, 50)(year)
  return chalk.gray(year)
}

/**
 * Colorize cellar type
 * @example
 * cellarColor('oak-barrel') // yellow
 */
export function cellarColor(cellar: string): string {
  const colors: Record<string, (s: string) => string> = {
    'oak-barrel': chalk.yellow,
    'stainless-steel': chalk.gray,
    'concrete-egg': chalk.cyan,
    amphora: chalk.rgb(180, 130, 60),
    bottle: chalk.green,
    'box-wine': chalk.red,
  }
  return (colors[cellar] ?? chalk.white)(cellar)
}

/**
 * Colorize aroma bouquet
 * @example
 * bouquetColor('complex') // green bold
 */
export function bouquetColor(bouquet: string): string {
  if (bouquet === 'complex') return chalk.bold.green(bouquet)
  if (bouquet === 'elegant') return chalk.green(bouquet)
  if (bouquet === 'fruity') return chalk.cyan(bouquet)
  if (bouquet === 'earthy') return chalk.yellow(bouquet)
  if (bouquet === 'simple') return chalk.gray(bouquet)
  return chalk.red(bouquet)
}

/**
 * Colorize body character
 * @example
 * bodyCharColor('full-bodied') // green
 */
export function bodyCharColor(char: string): string {
  if (char === 'full-bodied') return chalk.bold.green(char)
  if (char === 'medium-bodied') return chalk.green(char)
  if (char === 'light-bodied') return chalk.cyan(char)
  if (char === 'watery') return chalk.gray(char)
  if (char === 'syrupy') return chalk.yellow(char)
  return chalk.red(char)
}

/**
 * Colorize sommelier grade
 * @example
 * sommelierGradeColor('master-sommelier') // green bold
 */
export function sommelierGradeColor(grade: string): string {
  if (grade === 'master-sommelier') return chalk.bold.green(grade)
  if (grade === 'advanced-sommelier') return chalk.green(grade)
  if (grade === 'sommelier') return chalk.cyan(grade)
  if (grade === 'wine-steward') return chalk.yellow(grade)
  if (grade === 'enthusiast') return chalk.rgb(200, 130, 50)(grade)
  return chalk.red(grade)
}

/**
 * Colorize region condition
 * @example
 * regionConditionColor('legendary-region') // green bold
 */
export function regionConditionColor(condition: string): string {
  if (condition === 'legendary-region') return chalk.bold.green(condition)
  if (condition === 'premium-appellation') return chalk.green(condition)
  if (condition === 'quality-region') return chalk.cyan(condition)
  if (condition === 'growing-region') return chalk.yellow(condition)
  if (condition === 'emerging') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

// ─── Plot Formatting ────────────────────────────────────

/**
 * Format a single vineyard plot
 * @example
 * formatPlot(plot, false) // '  file.ts limestone 75 grand-cru'
 */
export function formatPlot(plot: VineyardPlot, verbose: boolean): string {
  const lines: string[] = []
  const score = scoreColor(plot.qualityScore)
  const cond = conditionColor(plot.condition)
  lines.push(`  ${chalk.white(plot.file)} ${soilTypeColor(plot.soil.type)} ${score} ${cond}`)

  if (verbose) {
    lines.push(`    Soil: quality=${scoreColor(plot.soil.quality)} ${soilTypeColor(plot.soil.type)} mineral=${plot.soil.hasMineralComplexity} drainage=${plot.soil.hasGoodDrainage}`)
    lines.push(`    Grape: variety=${scoreColor(plot.grape.variety)} ${grapeTypeColor(plot.grape.type)} noble=${plot.grape.isNobleVariety}`)
    lines.push(`    Vintage: character=${scoreColor(plot.vintage.character)} ${vintageYearColor(plot.vintage.year)} ready=${plot.vintage.isReadyToDrink}`)
    lines.push(`    Aging: potential=${scoreColor(plot.aging.potential)} ${cellarColor(plot.aging.cellar)} worthy=${plot.aging.cellarWorthy}`)
    lines.push(`    Aroma: quality=${scoreColor(plot.aroma.quality)} ${bouquetColor(plot.aroma.bouquet)} cork=${plot.aroma.hasCorkTaint}`)
    lines.push(`    Body: weight=${scoreColor(plot.bodyScore)} ${bodyCharColor(plot.body.character)} finish=${plot.body.finishLength}`)
  }

  return lines.join('\n')
}

// ─── Region Formatting ──────────────────────────────────

/**
 * Format a wine region
 * @example
 * formatRegion(region, false) // '  src/ bordeaux ...'
 */
export function formatRegion(region: WineRegion, verbose: boolean): string {
  const lines: string[] = []
  const soil = scoreColor(region.avgSoilQuality)
  const cond = regionConditionColor(region.condition)

  lines.push(`  ${chalk.white(region.directory)} soil=${soil} vintage=${scoreColor(region.avgVintageCharacter)} ${cond}`)
  lines.push(`    type=${region.regionType} plots=${region.plots.length} grand-cru=${region.grandCruCount} vinegar=${region.vinegarCount}`)

  if (verbose) {
    for (const plot of region.plots) {
      lines.push(formatPlot(plot, false))
    }
  }

  return lines.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line stats
 */
export function formatStats(stats: VineyardTerroirStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold('Files')}: ${stats.totalFiles}  ${chalk.bold('Regions')}: ${stats.totalRegions}`)
  lines.push(`  ${chalk.bold('Avg Soil')}: ${scoreColor(stats.avgSoilQuality)}  ${chalk.bold('Avg Grape')}: ${scoreColor(stats.avgGrapeVariety)}`)
  lines.push(`  ${chalk.bold('Avg Vintage')}: ${scoreColor(stats.avgVintageCharacter)}  ${chalk.bold('Avg Aging')}: ${scoreColor(stats.avgAgingPotential)}`)
  lines.push(`  ${chalk.bold('Avg Bouquet')}: ${scoreColor(stats.avgBouquet)}  ${chalk.bold('Avg Body')}: ${scoreColor(stats.avgBody)}`)
  lines.push(`  ${chalk.bold('Terroir')}: ${scoreColor(stats.overallTerroir)}  ${chalk.bold('Grade')}: ${sommelierGradeColor(stats.sommelierGrade)}`)

  lines.push(`  ${chalk.bold('Conditions')}: grand-cru=${stats.grandCruCount} premier-cru=${stats.premierCruCount} cru-bourgeois=${stats.cruBourgeoisCount} vin-de-pays=${stats.vinDePaysCount} table-wine=${stats.tableWineCount} vinegar=${stats.vinegarCount}`)

  lines.push(`  ${chalk.bold('Best Plot')}: ${stats.bestPlot}`)
  lines.push(`  ${chalk.bold('Best Soil')}: ${stats.bestSoil}`)
  lines.push(`  ${chalk.bold('Best Vintage')}: ${stats.bestVintage}`)
  lines.push(`  ${chalk.bold('Best Aging')}: ${stats.bestAging}`)
  lines.push(`  ${chalk.bold('Best Bouquet')}: ${stats.bestBouquet}`)

  return lines.join('\n')
}

// ─── Table Formatter ────────────────────────────────────

/**
 * Format result as colored table
 * @example
 * formatVineyardTerroirTable(result, false) // colored output
 */
export function formatVineyardTerroirTable(result: VineyardTerroirResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.magenta('🍷 Vineyard Terroir Analysis'))
  lines.push('═'.repeat(50))

  lines.push('')
  lines.push(chalk.bold('🌱 Vineyard Plots'))
  for (const plot of result.plots) {
    lines.push(formatPlot(plot, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('🗺️  Wine Regions'))
  for (const region of result.regions) {
    lines.push(formatRegion(region, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ─────────────────────────────────────

/**
 * Format result as JSON
 * @example
 * formatVineyardTerroirJson(result) // JSON string
 */
export function formatVineyardTerroirJson(result: VineyardTerroirResult): string {
  return JSON.stringify(result, null, 2)
}
