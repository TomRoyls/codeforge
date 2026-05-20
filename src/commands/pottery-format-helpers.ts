import chalk from 'chalk'
import type { PotteryResult, CeramicPiece, PotteryWheel, KilnResult, PotteryStats } from './pottery-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function gradeColor(g: string): string {
  if (g === 'masterwork') return chalk.green(g)
  if (g === 'fine-craft') return chalk.blue(g)
  if (g === 'studio') return chalk.cyan(g)
  if (g === 'student') return chalk.yellow(g)
  return chalk.red(g)
}

function shapeColor(s: string): string {
  if (s === 'vase') return chalk.blue(s)
  if (s === 'bowl') return chalk.green(s)
  if (s === 'plate') return chalk.cyan(s)
  if (s === 'cup') return chalk.yellow(s)
  if (s === 'amphora') return chalk.magenta(s)
  if (s === 'sculpture') return chalk.rgb(255, 165, 0)(s)
  return chalk.red(s)
}

function severityColor(s: string): string {
  if (s === 'structural') return chalk.red(s)
  if (s === 'major') return chalk.yellow(s)
  if (s === 'minor') return chalk.cyan(s)
  return chalk.dim(s)
}

function kilnColor(r: string): string {
  if (r === 'perfect') return chalk.green(r)
  if (r === 'well-fired') return chalk.blue(r)
  if (r === 'under-fired') return chalk.yellow(r)
  if (r === 'over-fired') return chalk.magenta(r)
  return chalk.red(r)
}

function overallGradeColor(g: string): string {
  if (g === 'master-potter') return chalk.green(g)
  if (g === 'artisan') return chalk.blue(g)
  if (g === 'apprentice') return chalk.cyan(g)
  if (g === 'student') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Pieces Formatting ──────────────────────────────────────────────────────────

function formatPieces(pieces: CeramicPiece[], verbose: boolean): string {
  if (pieces.length === 0) return chalk.dim('  No pieces to display.')
  const display = verbose ? pieces : pieces.slice(0, 10)
  return display.map((p, i) => {
    const defectStr = p.defects.length > 0
      ? chalk.red(`  ⚠ ${p.defects.length} defect(s)`)
      : chalk.green('  ✓ No defects')
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(p.file)} ${shapeColor(p.shape)} ${gradeColor(p.grade)}`,
      `     Clay:${scoreColor(p.clay)} Wheel:${scoreColor(p.wheelwork)} Fire:${scoreColor(p.firing)} Glaze:${scoreColor(p.glaze)} Inspect:${scoreColor(p.finalInspection)}`,
      defectStr,
    ].join('\n')
  }).join('\n\n')
}

// ─── Kiln Formatting ────────────────────────────────────────────────────────────

function formatKiln(kiln: KilnResult[]): string {
  if (kiln.length === 0) return chalk.dim('  No kiln results.')
  const display = kiln.slice(0, 10)
  return display.map(k => {
    return `  ${chalk.bold(k.file)} ${kilnColor(k.result)} Temp:${k.temperature}° Duration:${k.duration} lines`
  }).join('\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: PotteryStats): string {
  return [
    `  Craftsmanship: ${chalk.bold(scoreColor(stats.craftsmanshipIndex))}/100 | Grade: ${overallGradeColor(stats.overallGrade)}`,
    `  Pieces: ${chalk.white(String(stats.totalPieces))} (${chalk.green(String(stats.masterworkCount))} masterwork, ${chalk.red(String(stats.kilnWasteCount))} kiln-waste)`,
    `  Avg — Clay:${scoreColor(stats.avgClay)} Wheel:${scoreColor(stats.avgWheelwork)} Fire:${scoreColor(stats.avgFiring)} Glaze:${scoreColor(stats.avgGlaze)}`,
    `  Defects: ${chalk.white(String(stats.totalDefects))} (${chalk.red(`${stats.structuralDefects} structural`)}, ${chalk.dim(`${stats.cosmeticDefects} cosmetic`)})`,
    `  Kiln — Perfect:${chalk.green(String(stats.perfectFirings))} Under-fired:${chalk.yellow(String(stats.underFired))} Avg Temp:${scoreColor(stats.avgTemperature)}°`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format pottery result as a table
 * @example
 * formatPotteryTable(result, false) // string
 */
export function formatPotteryTable(result: PotteryResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏺 Pottery — Code Shaping Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('🎨 Pieces'))
  lines.push(formatPieces(result.pieces, verbose))
  lines.push('')
  lines.push(chalk.bold('🔥 Kiln Results'))
  lines.push(formatKiln(result.kiln))
  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format pottery result as JSON
 * @example
 * formatPotteryJson(result) // string
 */
export function formatPotteryJson(result: PotteryResult): string {
  return JSON.stringify(result, null, 2)
}
