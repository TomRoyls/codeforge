import chalk from 'chalk'
import type { SeedVariety, SeedBed, SeedCatalogResult } from './seed-catalog-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'prize-winning': return chalk.rgb(255, 215, 0)(c)
    case 'premium': return chalk.green(c)
    case 'standard': return chalk.blue(c)
    case 'substandard': return chalk.yellow(c)
    case 'sterile': return chalk.rgb(255, 165, 0)(c)
    case 'invasive': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function seedTypeColor(t: string): string {
  switch (t) {
    case 'grain': return chalk.rgb(255, 215, 0)(t)
    case 'vegetable': return chalk.green(t)
    case 'flower': return chalk.magenta(t)
    case 'tree': return chalk.rgb(34, 139, 34)(t)
    case 'vine': return chalk.cyan(t)
    case 'root': return chalk.rgb(139, 90, 43)(t)
    case 'herb': return chalk.rgb(124, 252, 0)(t)
    case 'weed': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function bedTypeColor(b: string): string {
  switch (b) {
    case 'greenhouse': return chalk.rgb(255, 215, 0)(b)
    case 'garden': return chalk.green(b)
    case 'field': return chalk.blue(b)
    case 'wild': return chalk.cyan(b)
    case 'compost': return chalk.rgb(139, 90, 43)(b)
    case 'desert': return chalk.yellow(b)
    default: return chalk.dim(b)
  }
}

function bedConditionColor(c: string): string {
  switch (c) {
    case 'nursery': return chalk.rgb(255, 215, 0)(c)
    case 'productive': return chalk.green(c)
    case 'functional': return chalk.blue(c)
    case 'overgrown': return chalk.yellow(c)
    case 'barren': return chalk.rgb(255, 165, 0)(c)
    case 'toxic': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-gardener': return chalk.rgb(255, 215, 0)(g)
    case 'gardener': return chalk.green(g)
    case 'horticulturist': return chalk.blue(g)
    case 'apprentice': return chalk.cyan(g)
    case 'amateur': return chalk.yellow(g)
    case 'weed-puller': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Variety Formatting ──────────────────────────────────────────────────────

function formatVariety(v: SeedVariety, verbose: boolean): string {
  const line = ` ${conditionColor(v.condition)} ${chalk.bold(v.file)} viability:${scoreColor(v.seedViability)} roots:${scoreColor(v.rootIndependence)} yield:${scoreColor(v.yieldPotential)} hardiness:${scoreColor(v.hardiness)} compat:${scoreColor(v.crossbreedCompat)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    seed: ${seedTypeColor(v.seed.type)} size:${v.seed.size} hull:${v.seed.hasHull ? chalk.red('Y') : chalk.green('N')} core:${v.seed.hasCore ? chalk.green('Y') : chalk.red('N')} shelled:${v.seed.isShelled ? chalk.green('Y') : chalk.red('N')} viable:${v.seed.isViable ? chalk.green('Y') : chalk.red('N')} hullThickness:${scoreColor(v.seed.hullThickness)}`)
  details.push(`    root: depth:${v.root.depth} spread:${v.root.spread} tapRoot:${v.root.isTapRoot ? chalk.green('Y') : chalk.red('N')} fibrous:${v.root.isFibrous ? chalk.yellow('Y') : chalk.green('N')} invasive:${v.root.isInvasive ? chalk.red('Y') : chalk.green('N')} contained:${v.root.isContained ? chalk.green('Y') : chalk.red('N')} deps:${v.root.dependencyCount} external:${v.root.externalDependencyCount}`)
  details.push(`    adaptability: zone:${v.adaptability.zone} frost:${v.adaptability.isFrostResistant ? chalk.green('Y') : chalk.red('N')} drought:${v.adaptability.isDroughtResistant ? chalk.green('Y') : chalk.red('N')} disease:${v.adaptability.isDiseaseResistant ? chalk.green('Y') : chalk.red('N')} pest:${v.adaptability.isPestResistant ? chalk.green('Y') : chalk.red('N')} universal:${v.adaptability.isUniversal ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    germination: tests:${v.germination.hasTests ? chalk.green('Y') : chalk.red('N')} coverage:${scoreColor(v.germination.testCoverage)} quality:${scoreColor(v.germination.testQuality)} easy:${v.germination.isEasyToTest ? chalk.green('Y') : chalk.red('N')} env:${v.germination.testEnvironment} time:${v.germination.germinationTime}`)
  details.push(`    yield: reuse:${scoreColor(v.yield.reuseScore)} abstract:${scoreColor(v.yield.abstractionLevel)} generic:${v.yield.isGeneric ? chalk.green('Y') : chalk.red('N')} specific:${v.yield.isSpecific ? chalk.yellow('Y') : chalk.green('N')} overAbstracted:${v.yield.isOverAbstracted ? chalk.red('Y') : chalk.green('N')} value:${v.yield.hasValue ? chalk.green('Y') : chalk.red('N')} consumers:${v.yield.consumers}`)
  details.push(`    crossbreed: compatible:${v.crossbreed.isCompatible ? chalk.green('Y') : chalk.red('N')} barriers:${v.crossbreed.barrierCount} hybrid:${v.crossbreed.isHybrid ? chalk.yellow('Y') : chalk.green('N')} heritage:${v.crossbreed.isHeritage ? chalk.green('Y') : chalk.red('N')} gmo:${v.crossbreed.isGMO ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    catalog: ${v.catalog.category} [${v.catalog.tags.join(', ')}] season:${v.catalog.season} heirloom:${v.catalog.isHeirloom ? chalk.green('Y') : chalk.red('N')} experimental:${v.catalog.isExperimental ? chalk.yellow('Y') : chalk.green('N')} maturity:${v.catalog.maturityDays}`)
  return details.join('\n')
}

// ─── Bed Formatting ──────────────────────────────────────────────────────────

function formatBed(b: SeedBed): string {
  return `  ${chalk.bold(b.directory)} ${bedTypeColor(b.bedType)} ${bedConditionColor(b.condition)} viability:${scoreColor(b.avgViability)} independence:${scoreColor(b.avgIndependence)} yield:${scoreColor(b.avgYieldPotential)} prize:${b.prizeCount} sterile:${b.sterileCount} invasive:${b.invasiveCount} contained:${b.selfContainedCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format seed catalog result as a table
 * @example
 * formatSeedCatalogTable(result, false) // string
 */
export function formatSeedCatalogTable(result: SeedCatalogResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌱  Seed Catalog - Reusability/Seed Potential Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🌻 Seed Varieties'))
  if (result.varieties.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.varieties : result.varieties.slice(0, 15)
    for (const v of display) {
      lines.push(formatVariety(v, verbose))
    }
    if (!verbose && result.varieties.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.varieties.length - 15} more`))
    }
  }
  lines.push('')

  if (result.beds.length > 0) {
    lines.push(chalk.bold('🌿 Seed Beds'))
    for (const b of result.beds) {
      lines.push(formatBed(b))
    }
    lines.push('')
  }

  const g = result.garden
  lines.push(chalk.bold('🏡 Garden Overview'))
  lines.push(`  Viability:${scoreColor(g.avgViability)} Independence:${scoreColor(g.avgIndependence)} Yield:${scoreColor(g.avgYieldPotential)} PrizeWinners:${g.totalPrizeWinners} Productive:${g.isProductive ? chalk.green('YES') : chalk.red('NO')} OverallYield:${scoreColor(g.overallYield)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.gardenerGrade)} | Yield: ${scoreColor(s.overallYield)} | Files: ${s.totalFiles} | Beds: ${s.totalBeds}`)
  lines.push(`  Prize:${s.prizeWinningCount} Premium:${s.premiumCount} Standard:${s.standardCount} Substandard:${s.substandardCount} Sterile:${s.sterileCount} Invasive:${s.invasiveCount}`)
  lines.push(`  Grain:${s.grainCount} Vegetable:${s.vegetableCount} Tree:${s.treeCount} Vine:${s.vineCount} Weed:${s.weedCount}`)
  lines.push(`  SelfContained:${s.selfContainedCount} Universal:${s.universalCount} HasTests:${s.hasTestsCount} EasyToTest:${s.easyToTestCount}`)
  lines.push(`  Evergreen:${s.evergreenCount} Dormant:${s.dormantCount} Heirloom:${s.heirloomCount} Experimental:${s.experimentalCount}`)
  lines.push(`  Best:${chalk.green(s.bestVariety)} | MostIndependent:${chalk.cyan(s.mostIndependent)} | HighestYield:${chalk.blue(s.highestYield)}`)
  lines.push(`  MostCompatible:${chalk.magenta(s.mostCompatible)} | MostInvasive:${chalk.rgb(255, 69, 0)(s.mostInvasive)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format seed catalog result as JSON
 * @example
 * formatSeedCatalogJson(result) // string
 */
export function formatSeedCatalogJson(result: SeedCatalogResult): string {
  return JSON.stringify(result, null, 2)
}
