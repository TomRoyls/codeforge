import chalk from 'chalk'
import type { ForgedPiece, ForgeShop, ForgeHammerResult } from './forge-hammer-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'masterwork-blade': return chalk.rgb(255, 215, 0)(c)
    case 'quality-tool': return chalk.green(c)
    case 'serviceable-iron': return chalk.blue(c)
    case 'brittle-casting': return chalk.cyan(c)
    case 'soft-metal': return chalk.yellow(c)
    case 'scrap-iron': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function metalColor(m: string): string {
  switch (m) {
    case 'steel': return chalk.rgb(255, 215, 0)(m)
    case 'iron': return chalk.gray(m)
    case 'bronze': return chalk.rgb(205, 127, 50)(m)
    case 'copper': return chalk.rgb(184, 115, 51)(m)
    case 'tin': return chalk.dim(m)
    case 'clay': return chalk.red(m)
    default: return m
  }
}

function techniqueColor(t: string): string {
  switch (t) {
    case 'folded-steel': return chalk.rgb(255, 215, 0)(t)
    case 'machined': return chalk.green(t)
    case 'hand-forged': return chalk.blue(t)
    case 'cast': return chalk.cyan(t)
    case '3d-printed': return chalk.yellow(t)
    case 'duct-tape': return chalk.red(t)
    default: return t
  }
}

function shopTypeColor(t: string): string {
  switch (t) {
    case 'master-forge': return chalk.rgb(255, 215, 0)(t)
    case 'village-smithy': return chalk.green(t)
    case 'factory': return chalk.blue(t)
    case 'workshop': return chalk.cyan(t)
    case 'shed': return chalk.yellow(t)
    case 'scrap-yard': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-smith': return chalk.rgb(255, 215, 0)(g)
    case 'journeyman': return chalk.green(g)
    case 'apprentice': return chalk.blue(g)
    case 'tinkerer': return chalk.cyan(g)
    case 'amateur': return chalk.yellow(g)
    case 'scavenger': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Forged Piece Formatting ──────────────────────────────────────────────────

function formatForgedPiece(piece: ForgedPiece, verbose: boolean): string {
  const line = ` ${conditionColor(piece.condition)} ${chalk.bold(piece.file)} hard:${scoreColor(piece.hardness)} temp:${scoreColor(piece.temperQuality)} imp:${scoreColor(piece.impactResistance)} duct:${scoreColor(piece.ductility)} brit:${scoreColor(piece.brittleness)} anvil:${piece.anvilMarks} score:${scoreColor(piece.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const m = piece.metal
  details.push(`    metal: ${metalColor(m.type)} grade:${m.grade} hard:${scoreColor(m.hardness)} alloy:${m.isAlloy ? chalk.green('Y') : chalk.dim('N')} impure:${m.hasImpurities ? chalk.yellow('Y') : chalk.dim('N')} carbon:${m.carbonContent}`)
  const t = piece.temper
  details.push(`    temper: qual:${scoreColor(t.quality)} even:${t.isEvenlyTempered ? chalk.green('Y') : chalk.red('N')} brittle:${t.isBrittle ? chalk.red('Y') : chalk.dim('N')} ductile:${t.isDuctile ? chalk.green('Y') : chalk.dim('N')} hardSpots:${t.hardSpotCount} softSpots:${t.softSpotCount}`)
  const i = piece.impact
  details.push(`    impact: res:${scoreColor(i.resistance)} defenses:${i.hasDefenses ? chalk.green('Y') : chalk.red('N')} shock:${i.hasShockAbsorbers ? chalk.green('Y') : chalk.red('N')} cracks:${i.hasCrackStoppers ? chalk.green('Y') : chalk.dim('N')} crackPts:${i.crackCount}`)
  const f = piece.forging
  details.push(`    forging: ${techniqueColor(f.technique)} qual:${scoreColor(f.quality)} polish:${scoreColor(f.polishLevel)} polished:${f.isPolished ? chalk.green('Y') : chalk.dim('N')} rough:${f.isRough ? chalk.red('Y') : chalk.dim('N')}`)
  const te = piece.testing
  details.push(`    testing: hardTest:${te.hasHardnessTest ? chalk.green('Y') : chalk.red('N')} stressTest:${te.hasStressTest ? chalk.green('Y') : chalk.dim('N')} impactTest:${te.hasImpactTest ? chalk.green('Y') : chalk.dim('N')} fatigueTest:${te.hasFatigueTest ? chalk.green('Y') : chalk.dim('N')} anvil:${te.anvilMarkCount} quality:${scoreColor(te.testQuality)}`)
  const h = piece.heat
  details.push(`    heat: ${h.treatmentType} hardened:${h.hasBeenHardened ? chalk.green('Y') : chalk.dim('N')} hot:${h.isStillHot ? chalk.red('Y') : chalk.dim('N')} cooling:${h.isCooling ? chalk.yellow('Y') : chalk.dim('N')} stable:${scoreColor(h.stabilityScore)}`)
  return details.join('\n')
}

// ─── Forge Shop Formatting ────────────────────────────────────────────────────

function formatForgeShop(shop: ForgeShop): string {
  return `  ${chalk.bold(shop.directory)} ${shopTypeColor(shop.shopType)} hard:${scoreColor(shop.avgHardness)} temp:${scoreColor(shop.avgTemper)} imp:${scoreColor(shop.avgImpactResistance)} duct:${scoreColor(shop.avgDuctility)} master:${shop.masterworkCount} scrap:${shop.scrapCount} tested:${shop.testedCount} brittle:${shop.brittleCount}`
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format forge-hammer result as table
 * @example
 * formatForgeHammerTable(result, false) // string
 */
export function formatForgeHammerTable(result: ForgeHammerResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔨  Forge Hammer - Code Resilience/Stress Testing Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('⚙️ Forged Pieces'))
  if (result.pieces.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.pieces : result.pieces.slice(0, 15)
    for (const piece of display) {
      lines.push(formatForgedPiece(piece, verbose))
    }
    if (!verbose && result.pieces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.pieces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.shops.length > 0) {
    lines.push(chalk.bold('🏭 Forge Shops'))
    for (const shop of result.shops) {
      lines.push(formatForgeShop(shop))
    }
    lines.push('')
  }

  const foundry = result.foundry
  lines.push(chalk.bold('🔥 Foundry'))
  lines.push(`  Hardness:${scoreColor(foundry.avgHardness)} Temper:${scoreColor(foundry.avgTemper)} Impact:${scoreColor(foundry.avgImpactResistance)} Ductility:${scoreColor(foundry.avgDuctility)} BattleReady:${foundry.isBattleReady ? chalk.green('YES') : chalk.red('NO')} Strength:${scoreColor(foundry.overallStrength)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.smithGrade)} | Strength: ${scoreColor(s.overallStrength)} | Files: ${s.totalFiles} | Shops: ${s.totalShops}`)
  lines.push(`  Masterwork:${s.masterworkBladeCount} Quality:${s.qualityToolCount} Serviceable:${s.serviceableIronCount} Brittle:${s.brittleCastingCount} Soft:${s.softMetalCount} Scrap:${s.scrapIronCount}`)
  lines.push(`  Steel:${s.steelCount} Iron:${s.ironCount} Bronze:${s.bronzeCount} Copper:${s.copperCount}`)
  lines.push(`  HardTest:${s.hasHardnessTestCount} StressTest:${s.hasStressTestCount} ImpactTest:${s.hasImpactTestCount} FatigueTest:${s.hasFatigueTestCount} Tempered:${s.evenlyTemperedCount} Defenses:${s.hasDefensesCount}`)
  lines.push(`  Hardest:${chalk.green(s.hardestPiece)} | Toughest:${chalk.blue(s.toughestPiece)} | Brittle:${chalk.red(s.mostBrittle)} | Polished:${chalk.magenta(s.mostPolished)} | NeedsForging:${chalk.yellow(s.needsForging)}`)

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

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format forge-hammer result as JSON
 * @example
 * formatForgeHammerJson(result) // string
 */
export function formatForgeHammerJson(result: ForgeHammerResult): string {
  return JSON.stringify(result, null, 2)
}
