import chalk from 'chalk'
import type { PotteryWheelResult, ThrownPiece, PotteryBatch, PotteryWheelStats } from './pottery-wheel-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function formColor(f: string): string {
  switch (f) {
    case 'bowl': return chalk.blue(f)
    case 'vase': return chalk.magenta(f)
    case 'plate': return chalk.gray(f)
    case 'cup': return chalk.green(f)
    case 'pitcher': return chalk.cyan(f)
    case 'jar': return chalk.rgb(210, 180, 140)(f)
    case 'urn': return chalk.rgb(255, 215, 0)(f)
    case 'sculpture': return chalk.rgb(255, 165, 0)(f)
    default: return chalk.dim(f)
  }
}

function clayColor(c: string): string {
  switch (c) {
    case 'porcelain': return chalk.rgb(255, 250, 250)(c)
    case 'bone-china': return chalk.rgb(245, 245, 220)(c)
    case 'stoneware': return chalk.gray(c)
    case 'earthenware': return chalk.rgb(210, 180, 140)(c)
    case 'terracotta': return chalk.rgb(204, 119, 34)(c)
    case 'raku': return chalk.rgb(139, 69, 19)(c)
    default: return chalk.dim(c)
  }
}

function craftColor(c: string): string {
  switch (c) {
    case 'master': return chalk.rgb(255, 215, 0)(c)
    case 'artisan': return chalk.green(c)
    case 'journeyman': return chalk.blue(c)
    case 'apprentice': return chalk.yellow(c)
    case 'student': return chalk.rgb(255, 165, 0)(c)
    case 'beginner': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function condColor(c: string): string {
  switch (c) {
    case 'pristine': return chalk.rgb(255, 215, 0)(c)
    case 'excellent': return chalk.green(c)
    case 'good': return chalk.blue(c)
    case 'fair': return chalk.yellow(c)
    case 'chipped': return chalk.rgb(255, 165, 0)(c)
    case 'cracked': return chalk.red(c)
    case 'shattered': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-potter': return chalk.rgb(255, 215, 0)(g)
    case 'artisan': return chalk.green(g)
    case 'journeyman': return chalk.blue(g)
    case 'apprentice': return chalk.yellow(g)
    case 'student': return chalk.rgb(255, 165, 0)(g)
    case 'beginner': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function kilnColor(k: string): string {
  switch (k) {
    case 'optimal': return chalk.green(k)
    case 'good': return chalk.blue(k)
    case 'adequate': return chalk.yellow(k)
    case 'poor': return chalk.rgb(255, 165, 0)(k)
    case 'broken': return chalk.red(k)
    default: return chalk.dim(k)
  }
}

// ─── Piece Formatting ────────────────────────────────────────────────────────

function formatPiece(p: ThrownPiece, verbose: boolean): string {
  const markers: string[] = []
  if (p.surface.hasCracks) markers.push(chalk.red('CR'))
  if (p.surface.hasChips) markers.push(chalk.yellow('CH'))
  if (p.surface.hasGlaze) markers.push(chalk.green('GL'))
  if (p.condition === 'pristine') markers.push(chalk.rgb(255, 215, 0)('PR'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(p.file)} ${formColor(p.form)} ${clayColor(p.clayType)} cent:${scoreColor(p.centering)} wall:${scoreColor(p.wallUniformity)} smooth:${scoreColor(p.surfaceSmoothness)} ${craftColor(p.craftsmanship)} ${condColor(p.condition)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    prop:${scoreColor(p.proportion)} int:${scoreColor(p.structuralIntegrity)} tech:${scoreColor(p.throwingTechnique)} qual:${scoreColor(p.qualityScore)} style:${p.throwingStyle} fire:${p.firing.result}`)
  details.push(`    shape: h:${p.shape.height} w:${p.shape.width} rim:${p.shape.rim} base:${p.shape.base} belly:${p.shape.belly} neck:${p.shape.neck}`)
  details.push(`    walls: unif:${p.walls.uniformity} thick:${p.walls.thickness} thin:${p.walls.thinSpotCount} thick:${p.walls.thickSpotCount}`)
  details.push(`    surface: smooth:${p.surface.smoothness} glaze:${p.surface.glazeQuality} cracks:${p.surface.crackCount} chips:${p.surface.chipCount} blem:${p.surface.blemishCount}`)
  if (p.issues.length > 0) details.push(`    issues: ${p.issues.join(', ')}`)
  if (p.highlights.length > 0) details.push(`    highlights: ${p.highlights.join(', ')}`)
  return details.join('\n')
}

// ─── Batch Formatting ────────────────────────────────────────────────────────

function formatBatch(b: PotteryBatch, verbose: boolean): string {
  const line = `  ${chalk.bold(b.directory)} ${kilnColor(b.kilnCondition)} pieces:${b.pieces.length} qual:${scoreColor(b.batchQuality)} cent:${scoreColor(b.avgCentering)} tech:${scoreColor(b.avgTechnique)} ${b.dominantForm}`

  if (!verbose) return line
  const details = [line]
  details.push(`    wall:${scoreColor(b.avgWallUniformity)} smooth:${scoreColor(b.avgSurfaceSmoothness)} prop:${scoreColor(b.avgProportion)} int:${scoreColor(b.avgStructuralIntegrity)} clay:${b.dominantClay} style:${b.dominantStyle}`)
  details.push(`    master:${b.masterCount} beginner:${b.beginnerCount} pristine:${b.pristineCount} shattered:${b.shatteredCount} cracks:${b.totalCracks} chips:${b.totalChips} fire:${b.avgFiringResult}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: PotteryWheelStats): string {
  return [
    `  Files: ${stats.totalFiles} | Batches: ${stats.totalBatches} | Centering: ${scoreColor(stats.avgCentering)} | Uniformity: ${scoreColor(stats.avgWallUniformity)} | Smoothness: ${scoreColor(stats.avgSurfaceSmoothness)}`,
    `  Proportion: ${scoreColor(stats.avgProportion)} | Integrity: ${scoreColor(stats.avgStructuralIntegrity)} | Technique: ${scoreColor(stats.avgTechnique)} | Quality: ${scoreColor(stats.overallQuality)}`,
    `  Master: ${chalk.rgb(255, 215, 0)(String(stats.masterCraftsman))} | Beginner: ${chalk.red(String(stats.beginnerCraftsman))} | Pristine: ${chalk.green(String(stats.pristinePieces))} | Shattered: ${chalk.red(String(stats.shatteredPieces))}`,
    `  Porcelain: ${chalk.rgb(255, 250, 250)(String(stats.porcelainCount))} | Earthenware: ${chalk.rgb(210, 180, 140)(String(stats.earthenwareCount))} | Wheel-thrown: ${chalk.blue(String(stats.wheelThrownCount))} | Hand-built: ${chalk.green(String(stats.handBuiltCount))}`,
    `  Cracks: ${chalk.red(String(stats.totalCracks))} | Chips: ${chalk.yellow(String(stats.totalChips))} | Blemishes: ${chalk.rgb(255, 165, 0)(String(stats.totalBlemishes))} | Perfect fire: ${chalk.green(String(stats.perfectFiring))} | Cracked fire: ${chalk.red(String(stats.crackedFiring))}`,
    `  Grade: ${gradeColor(stats.wheelGrade)} | Best: ${chalk.green(stats.bestPiece)} | Worst: ${chalk.red(stats.worstPiece)}`,
    `  Centered: ${chalk.blue(stats.mostCentered)} | Smooth: ${chalk.cyan(stats.smoothestPiece)} | Proportioned: ${chalk.magenta(stats.bestProportioned)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format pottery wheel result as a table
 * @example
 * formatPotteryWheelTable(result, false) // string
 */
export function formatPotteryWheelTable(result: PotteryWheelResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏺 Pottery Wheel - Code Shaping Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🫕 Thrown Pieces'))
  if (result.pieces.length === 0) {
    lines.push(chalk.dim('  No pieces detected.'))
  } else {
    const display = verbose ? result.pieces : result.pieces.slice(0, 15)
    for (const p of display) {
      lines.push(formatPiece(p, verbose))
    }
    if (!verbose && result.pieces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.pieces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.batches.length > 0) {
    lines.push(chalk.bold('🔥 Pottery Batches'))
    for (const b of result.batches) {
      lines.push(formatBatch(b, verbose))
    }
    lines.push('')
  }

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

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format pottery wheel result as JSON
 * @example
 * formatPotteryWheelJson(result) // string
 */
export function formatPotteryWheelJson(result: PotteryWheelResult): string {
  return JSON.stringify(result, null, 2)
}
