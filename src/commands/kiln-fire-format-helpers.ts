import chalk from 'chalk'
import type { PotteryPiece, KilnLoad, KilnFireResult } from './kiln-fire-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'masterwork-porcelain': return chalk.rgb(255, 215, 0)(c)
    case 'fine-stoneware': return chalk.green(c)
    case 'quality-earthenware': return chalk.blue(c)
    case 'greenware': return chalk.cyan(c)
    case 'raw-clay': return chalk.yellow(c)
    case 'cracked-pot': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function clayColor(t: string): string {
  switch (t) {
    case 'porcelain': return chalk.rgb(255, 250, 240)(t)
    case 'stoneware': return chalk.rgb(139, 90, 43)(t)
    case 'earthenware': return chalk.rgb(205, 133, 63)(t)
    case 'terra-cotta': return chalk.rgb(210, 105, 30)(t)
    case 'clay': return chalk.yellow(t)
    case 'mud': return chalk.dim(t)
    default: return t
  }
}

function kilnTypeColor(t: string): string {
  switch (t) {
    case 'anagama': return chalk.rgb(255, 215, 0)(t)
    case 'gas-kiln': return chalk.green(t)
    case 'electric-kiln': return chalk.blue(t)
    case 'raku': return chalk.magenta(t)
    case 'pit-fire': return chalk.yellow(t)
    case 'cold': return chalk.dim(t)
    default: return t
  }
}

function loadConditionColor(c: string): string {
  switch (c) {
    case 'gallery-exhibition': return chalk.rgb(255, 215, 0)(c)
    case 'studio-collection': return chalk.green(c)
    case 'craft-market': return chalk.blue(c)
    case 'pottery-class': return chalk.cyan(c)
    case 'messy-bench': return chalk.yellow(c)
    case 'clay-pit': return chalk.red(c)
    default: return c
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-potter': return chalk.rgb(255, 215, 0)(g)
    case 'studio-potter': return chalk.green(g)
    case 'production-potter': return chalk.blue(g)
    case 'hobbyist': return chalk.cyan(g)
    case 'student': return chalk.yellow(g)
    case 'child': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function atmosphereColor(a: string): string {
  switch (a) {
    case 'oxidation': return chalk.rgb(255, 215, 0)(a)
    case 'reduction': return chalk.green(a)
    case 'neutral': return chalk.blue(a)
    case 'smoky': return chalk.yellow(a)
    case 'raw': return chalk.dim(a)
    default: return a
  }
}

// ─── Piece Formatting ─────────────────────────────────────────────────────────

function formatPiece(piece: PotteryPiece, verbose: boolean): string {
  const line = ` ${conditionColor(piece.condition)} ${chalk.bold(piece.file)} ${clayColor(piece.clay.type)} clay:${scoreColor(piece.clayQuality)} green:${scoreColor(piece.greenStrength)} bisque:${scoreColor(piece.bisqueHardness)} glaze:${scoreColor(piece.glazeQuality)} fire:${scoreColor(piece.firingTemperature)} hard:${scoreColor(piece.finalHardness)} score:${scoreColor(piece.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const c = piece.clay
  details.push(`    clay: ${clayColor(c.type)} quality:${scoreColor(c.quality)} impurities:${c.hasImpurities ? chalk.red('Y') : chalk.green('N')} bubbles:${c.hasAirBubbles ? chalk.red('Y') : chalk.green('N')} workable:${c.isWorkable ? chalk.green('Y') : chalk.red('N')} consistent:${c.isConsistent ? chalk.green('Y') : chalk.red('N')}`)
  const g = piece.green
  details.push(`    green: strength:${scoreColor(g.strength)} leather:${g.isLeatherHard ? chalk.yellow('Y') : chalk.dim('N')} boneDry:${g.isBoneDry ? chalk.green('Y') : chalk.red('N')} cracks:${g.hasCracks ? chalk.red(String(g.crackCount)) : 0} warping:${g.hasWarping ? chalk.yellow('Y') : chalk.dim('N')} ready:${g.isReadyForKiln ? chalk.green('Y') : chalk.red('N')}`)
  const b = piece.bisque
  details.push(`    bisque: hardness:${scoreColor(b.hardness)} fired:${b.isFired ? chalk.green('Y') : chalk.red('N')} bisque:${b.isBisque ? chalk.green('Y') : chalk.red('N')} crazing:${b.hasCrazing ? chalk.red('Y') : chalk.green('N')} shiver:${b.hasShivering ? chalk.red('Y') : chalk.green('N')} coverage:${scoreColor(b.coverage)}`)
  const gl = piece.glaze
  details.push(`    glaze: quality:${scoreColor(gl.quality)} base:${gl.hasBaseCoat ? chalk.green('Y') : chalk.red('N')} decorative:${gl.hasDecorative ? chalk.green('Y') : chalk.red('N')} protective:${gl.hasProtective ? chalk.green('Y') : chalk.red('N')} foodSafe:${gl.isFoodSafe ? chalk.green('Y') : chalk.red('N')} even:${gl.isEven ? chalk.green('Y') : chalk.red('N')}`)
  const f = piece.firing
  details.push(`    firing: temp:${scoreColor(f.temperature)} atm:${atmosphereColor(f.atmosphere)} soak:${scoreColor(f.soak)} ramp:${scoreColor(f.ramp)} proper:${f.isProperlyFired ? chalk.green('Y') : chalk.red('N')} over:${f.isOverFired ? chalk.yellow('Y') : chalk.dim('N')} under:${f.isUnderFired ? chalk.red('Y') : chalk.dim('N')}`)
  const fi = piece.finished
  details.push(`    finished: hardness:${scoreColor(fi.hardness)} ring:${fi.ring} vitrified:${fi.isVitrified ? chalk.green('Y') : chalk.red('N')} porous:${fi.isPorous ? chalk.red('Y') : chalk.green('N')} fragile:${fi.isFragile ? chalk.red('Y') : chalk.green('N')} integrity:${fi.hasStructuralIntegrity ? chalk.green('Y') : chalk.red('N')} grade:${fi.grade}`)
  return details.join('\n')
}

// ─── Load Formatting ──────────────────────────────────────────────────────────

function formatLoad(load: KilnLoad): string {
  return `  ${chalk.bold(load.directory)} ${kilnTypeColor(load.kilnType)} ${loadConditionColor(load.condition)} pieces:${load.pieces.length} clay:${scoreColor(load.avgClayQuality)} bisque:${scoreColor(load.avgBisqueHardness)} glaze:${scoreColor(load.avgGlazeQuality)} hard:${scoreColor(load.avgFinalHardness)} master:${load.masterworkCount} cracked:${load.crackedCount}`
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format kiln fire result as a table
 * @example
 * formatKilnFireTable(result, false) // string
 */
export function formatKilnFireTable(result: KilnFireResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔥  Kiln Fire - Code Maturity/Hardening Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🏺 Pieces'))
  if (result.pieces.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.pieces : result.pieces.slice(0, 15)
    for (const piece of display) {
      lines.push(formatPiece(piece, verbose))
    }
    if (!verbose && result.pieces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.pieces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.loads.length > 0) {
    lines.push(chalk.bold('🏭 Kiln Loads'))
    for (const load of result.loads) {
      lines.push(formatLoad(load))
    }
    lines.push('')
  }

  const s = result.studio
  lines.push(chalk.bold('🏠 Studio'))
  lines.push(`  Clay:${scoreColor(s.avgClayQuality)} Bisque:${scoreColor(s.avgBisqueHardness)} Glaze:${scoreColor(s.avgGlazeQuality)} Hardness:${scoreColor(s.avgFinalHardness)} Masterworks:${s.masterworkCount} Production:${s.isProductionReady ? chalk.green('READY') : chalk.red('NOT READY')} Overall:${scoreColor(s.overallHardness)}`)
  lines.push('')

  const st = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(st.potterGrade)} | Hardness: ${scoreColor(st.overallHardness)} | Files: ${st.totalFiles} | Loads: ${st.totalLoads}`)
  lines.push(`  Masterwork:${st.masterworkPorcelainCount} Fine:${st.fineStonewareCount} Quality:${st.qualityEarthenwareCount} Green:${st.greenwareCount} Raw:${st.rawClayCount} Cracked:${st.crackedPotCount}`)
  lines.push(`  Porcelain:${st.porcelainCount} Stone:${st.stonewareCount} Earth:${st.earthenwareCount} TerraCotta:${st.terraCottaCount} | Tests:${st.hasTestsCount} Proper:${st.properlyFiredCount} Over:${st.overFiredCount} Under:${st.underFiredCount}`)
  lines.push(`  Docs:${st.hasDocsCount} Types:${st.hasTypesCount} Vitrified:${st.vitrifiedCount} Fragile:${st.fragileCount}`)
  lines.push(`  Best:${chalk.green(st.bestPiece)} | Hardest:${chalk.blue(st.hardestPiece)} | Glazed:${chalk.magenta(st.bestGlazed)} | Fragile:${chalk.red(st.mostFragile)} | NeedsFire:${chalk.yellow(st.needsFiring)}`)

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
 * Format kiln fire result as JSON
 * @example
 * formatKilnFireJson(result) // string
 */
export function formatKilnFireJson(result: KilnFireResult): string {
  return JSON.stringify(result, null, 2)
}
