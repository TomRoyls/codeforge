import chalk from 'chalk'
import type { TreasureSpot, TreasureMapResult } from './treasure-map-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function rarityColor(r: string): string {
  switch (r) {
    case 'mythic': return chalk.rgb(255, 0, 255)(r)
    case 'legendary': return chalk.rgb(255, 215, 0)(r)
    case 'epic': return chalk.rgb(163, 53, 238)(r)
    case 'rare': return chalk.blue(r)
    case 'uncommon': return chalk.green(r)
    case 'common': return chalk.white(r)
    case 'cursed': return chalk.rgb(139, 0, 0)(r)
    default: return chalk.dim(r)
  }
}

function typeColor(t: string): string {
  switch (t) {
    case 'gold': return chalk.rgb(255, 215, 0)(t)
    case 'gems': return chalk.rgb(0, 191, 255)(t)
    case 'artifacts': return chalk.rgb(205, 133, 63)(t)
    case 'keys': return chalk.yellow(t)
    case 'tools': return chalk.cyan(t)
    case 'maps': return chalk.blue(t)
    case 'supplies': return chalk.green(t)
    case 'traps': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'pristine-treasure': return chalk.rgb(255, 215, 0)(c)
    case 'well-preserved': return chalk.green(c)
    case 'good-condition': return chalk.blue(c)
    case 'weathered': return chalk.yellow(c)
    case 'decaying': return chalk.rgb(255, 165, 0)(c)
    case 'cursed': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-cartographer': return chalk.rgb(255, 215, 0)(g)
    case 'cartographer': return chalk.green(g)
    case 'navigator': return chalk.blue(g)
    case 'sailor': return chalk.cyan(g)
    case 'landlubber': return chalk.yellow(g)
    case 'shipwrecked': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Spot Formatting ─────────────────────────────────────────────────────────

function formatSpot(sp: TreasureSpot, verbose: boolean): string {
  const line = ` ${rarityColor(sp.rarity)} ${typeColor(sp.treasureType)} ${chalk.bold(sp.file)} val:${scoreColor(sp.treasureValue)} leg:${scoreColor(sp.mapLegibility)} x:${scoreColor(sp.xAccuracy)} danger:${scoreColor(sp.pirateDanger)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    depth:${sp.burialDepth} guards:${sp.guardianCount} condition:${conditionColor(sp.condition)} quality:${scoreColor(sp.qualityScore)}`)
  details.push(`    burial: exposed=${sp.burial.isExposed} hidden=${sp.burial.isHidden} marker=${sp.burial.hasMapMarker} clarity=${scoreColor(sp.burial.markerClarity)}`)
  details.push(`    guardians: dragons=${sp.guardians.dragonCount} traps=${sp.guardians.trapCount} puzzles=${sp.guardians.puzzleCount} complexity=${scoreColor(sp.guardians.complexity)}`)
  details.push(`    danger: ${sp.danger.riskLevel} stable=${sp.danger.isStable} volatile=${sp.danger.isVolatile} curse=${sp.danger.hasCurse}`)
  details.push(`    navigation: ${sp.navigation.pathDifficulty} easyFind=${sp.navigation.isEasyToFind} clearPath=${sp.navigation.hasClearPath}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format treasure map result as a table
 * @example
 * formatTreasureMapTable(result, false) // string
 */
export function formatTreasureMapTable(result: TreasureMapResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🗺️ Treasure Map - Code Value/Discovery Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('💎 Treasure Spots'))
  if (result.spots.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.spots : result.spots.slice(0, 15)
    for (const sp of display) {
      lines.push(formatSpot(sp, verbose))
    }
    if (!verbose && result.spots.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.spots.length - 15} more`))
    }
  }
  lines.push('')

  if (result.islands.length > 0) {
    lines.push(chalk.bold('🏝️ Islands'))
    for (const isl of result.islands) {
      lines.push(`  ${chalk.bold(isl.directory)} ${isl.islandType} val:${scoreColor(isl.avgTreasureValue)} danger:${isl.dangerLevel} spots:${isl.spots.length} dragons:${isl.dragonCount}`)
    }
    lines.push('')
  }

  const arch = result.archipelago
  lines.push(chalk.bold('🌊 Archipelago'))
  lines.push(`  TotalValue:${arch.totalTreasureValue} AvgValue:${scoreColor(arch.avgTreasureValue)} Depth:${scoreColor(arch.avgBurialDepth)} Legendary:${arch.legendarySpots} Cursed:${arch.cursedSpots}`)
  lines.push(`  Dragons:${arch.totalDragons} Traps:${arch.totalTraps} WorthExploring:${arch.isWorthExploring ? chalk.green('YES') : chalk.red('NO')}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.cartographerGrade)} | Quality: ${scoreColor(s.overallMapQuality)} | Files: ${s.totalFiles} | Islands: ${s.totalIslands}`)
  lines.push(`  Gold:${s.goldCount} Gems:${s.gemsCount} Artifacts:${s.artifactsCount} Tools:${s.toolsCount} Traps:${s.trapsCount}`)
  lines.push(`  Legendary:${s.legendaryCount} Mythic:${s.mythicCount} Cursed:${s.cursedCount} Common:${s.commonCount}`)
  lines.push(`  Exposed:${s.exposedCount} Buried:${s.buriedCount} Hidden:${s.hiddenCount} Dragons:${s.dragonCount} Traps:${s.trapCount} Safe:${s.safeFiles} Lethal:${s.lethalFiles}`)
  lines.push(`  MostValuable:${chalk.green(s.mostValuable)} | MostHidden:${chalk.blue(s.mostHidden)} | MostDangerous:${chalk.red(s.mostDangerous)}`)
  lines.push(`  EasiestToFind:${chalk.cyan(s.easiestToFind)} | BestPreserved:${chalk.rgb(255, 215, 0)(s.bestPreserved)}`)

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
 * Format treasure map result as JSON
 * @example
 * formatTreasureMapJson(result) // string
 */
export function formatTreasureMapJson(result: TreasureMapResult): string {
  return JSON.stringify(result, null, 2)
}
