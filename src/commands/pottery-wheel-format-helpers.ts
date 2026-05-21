import chalk from 'chalk'
import type { PotteryWheelResult, PotteryPiece, PotteryStudio, PotteryWheelStats } from './pottery-wheel-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'museum-piece') return chalk.rgb(255, 215, 0)(c)
  if (c === 'gallery-quality') return chalk.green(c)
  if (c === 'studio-pottery') return chalk.blue(c)
  if (c === 'production-ware') return chalk.cyan(c)
  if (c === 'student-work') return chalk.yellow(c)
  return chalk.red(c)
}

function studioColor(t: string): string {
  if (t === 'master-studio') return chalk.rgb(255, 215, 0)(t)
  if (t === 'production-pottery') return chalk.green(t)
  if (t === 'teaching-studio') return chalk.blue(t)
  if (t === 'community-center') return chalk.cyan(t)
  if (t === 'hobby-shed') return chalk.yellow(t)
  return chalk.red(t)
}

function gradeColor(g: string): string {
  if (g === 'master-potter') return chalk.rgb(255, 215, 0)(g)
  if (g === 'artisan') return chalk.green(g)
  if (g === 'journeyman') return chalk.blue(g)
  if (g === 'apprentice') return chalk.cyan(g)
  if (g === 'student') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Piece Formatting ──────────────────────────────────────────────────────

function formatPiece(p: PotteryPiece): string {
  return `  ${chalk.bold(p.file)} ${conditionColor(p.condition)} craft:${scoreColor(p.qualityScore)} clay:${scoreColor(p.clayQuality)} shape:${scoreColor(p.shapingSkill)} glaze:${scoreColor(p.glazeFinish)}`
}

// ─── Studio Formatting ─────────────────────────────────────────────────────

function formatStudio(s: PotteryStudio): string {
  return `  ${chalk.bold(s.directory)} ${studioColor(s.studioType)} clay:${scoreColor(s.avgClayQuality)} shape:${scoreColor(s.avgShapingSkill)} kiln:${scoreColor(s.avgKilnStrength)} museum:${s.museumPieceCount} cracked:${s.crackedPotCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: PotteryWheelStats): string {
  return [
    `  Grade: ${gradeColor(stats.potterGrade)} | Craft: ${scoreColor(stats.overallCraftsmanship)} | Files: ${stats.totalFiles} | Studios: ${stats.totalStudios}`,
    `  Clay: ${scoreColor(stats.avgClayQuality)} | Wheel: ${scoreColor(stats.avgWheelSpeed)} | Shape: ${scoreColor(stats.avgShapingSkill)} | Glaze: ${scoreColor(stats.avgGlazeFinish)} | Kiln: ${scoreColor(stats.avgKilnStrength)} | Art: ${scoreColor(stats.avgArtisticMerit)}`,
    `  Conditions: Museum:${stats.museumPieceCount} Gallery:${stats.galleryQualityCount} Studio:${stats.studioPotteryCount} Production:${stats.productionWareCount} Student:${stats.studentWorkCount} Cracked:${stats.crackedPotCount}`,
    `  Best: ${chalk.green(stats.bestPiece)} | Clay: ${chalk.cyan(stats.bestClay)} | Shaped: ${chalk.blue(stats.bestShaped)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format pottery wheel result as a table
 * @example
 * formatPotteryWheelTable(result, false) // string
 */
export function formatPotteryWheelTable(result: PotteryWheelResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏺 Pottery Wheel - Code Shaping/Malleability Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🫖 Pieces'))
  if (result.pieces.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.pieces : result.pieces.slice(0, 15)
    for (const p of display) {
      lines.push(formatPiece(p))
    }
    if (!verbose && result.pieces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.pieces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.studios.length > 0) {
    lines.push(chalk.bold('🏭 Studios'))
    for (const s of result.studios) {
      lines.push(formatStudio(s))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Potter Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format pottery wheel result as JSON
 * @example
 * formatPotteryWheelJson(result) // string
 */
export function formatPotteryWheelJson(result: PotteryWheelResult): string {
  return JSON.stringify(result, null, 2)
}
