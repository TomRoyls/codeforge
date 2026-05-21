import chalk from 'chalk'
import type { HoneycombMatrixResult, HoneycombCell, HoneycombFrame, HoneycombMatrixStats } from './honeycomb-matrix-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'perfect-comb') return chalk.rgb(255, 215, 0)(c)
  if (c === 'golden-comb') return chalk.green(c)
  if (c === 'freshly-drawn') return chalk.blue(c)
  if (c === 'functional-comb') return chalk.cyan(c)
  if (c === 'damaged-comb') return chalk.yellow(c)
  return chalk.red(c)
}

function frameColor(t: string): string {
  if (t === 'langstroth') return chalk.rgb(255, 215, 0)(t)
  if (t === 'top-bar') return chalk.green(t)
  if (t === 'warre') return chalk.blue(t)
  if (t === 'skep') return chalk.cyan(t)
  if (t === 'log-hive') return chalk.yellow(t)
  return chalk.red(t)
}

function gradeColor(g: string): string {
  if (g === 'master-beekeeper') return chalk.rgb(255, 215, 0)(g)
  if (g === 'senior-beekeeper') return chalk.green(g)
  if (g === 'beekeeper') return chalk.blue(g)
  if (g === 'apprentice') return chalk.cyan(g)
  if (g === 'novice') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Cell Formatting ───────────────────────────────────────────────────────

function formatCell(c: HoneycombCell): string {
  return `  ${chalk.bold(c.file)} ${conditionColor(c.condition)} quality:${scoreColor(c.qualityScore)} struct:${scoreColor(c.cellStructure)} density:${scoreColor(c.packingDensity)} efficiency:${scoreColor(c.combEfficiency)}`
}

// ─── Frame Formatting ──────────────────────────────────────────────────────

function formatFrame(f: HoneycombFrame): string {
  return `  ${chalk.bold(f.directory)} ${frameColor(f.frameType)} struct:${scoreColor(f.avgStructure)} density:${scoreColor(f.avgDensity)} efficiency:${scoreColor(f.avgEfficiency)} perfect:${f.perfectCombCount} moth:${f.waxMothCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: HoneycombMatrixStats): string {
  return [
    `  Grade: ${gradeColor(stats.beekeeperGrade)} | Apiary: ${scoreColor(stats.overallApiary)} | Files: ${stats.totalFiles} | Frames: ${stats.totalFrames}`,
    `  Structure: ${scoreColor(stats.avgCellStructure)} | Density: ${scoreColor(stats.avgPackingDensity)} | Wall: ${scoreColor(stats.avgWallThickness)} | Efficiency: ${scoreColor(stats.avgCombEfficiency)} | Nectar: ${scoreColor(stats.avgNectarQuality)} | Hexagon: ${scoreColor(stats.avgHexagonalPerfection)}`,
    `  Conditions: Perfect:${stats.perfectCombCount} Golden:${stats.goldenCombCount} Fresh:${stats.freshlyDrawnCount} Functional:${stats.functionalCombCount} Damaged:${stats.damagedCombCount} Moth:${stats.waxMothCount}`,
    `  Best: ${chalk.green(stats.bestCell)} | Structured: ${chalk.cyan(stats.bestStructured)} | Dense: ${chalk.blue(stats.densestPacked)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format honeycomb matrix result as a table
 * @example
 * formatHoneycombMatrixTable(result, false) // string
 */
export function formatHoneycombMatrixTable(result: HoneycombMatrixResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🍯 Honeycomb Matrix - Code Structure/Efficiency/Packing Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🛞 Cells'))
  if (result.cells.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.cells : result.cells.slice(0, 15)
    for (const c of display) {
      lines.push(formatCell(c))
    }
    if (!verbose && result.cells.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.cells.length - 15} more`))
    }
  }
  lines.push('')

  if (result.frames.length > 0) {
    lines.push(chalk.bold('🖼️  Frames'))
    for (const f of result.frames) {
      lines.push(formatFrame(f))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Beekeeper Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format honeycomb matrix result as JSON
 * @example
 * formatHoneycombMatrixJson(result) // string
 */
export function formatHoneycombMatrixJson(result: HoneycombMatrixResult): string {
  return JSON.stringify(result, null, 2)
}
