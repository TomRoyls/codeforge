import chalk from 'chalk'
import type { InkwellResult, InkStroke, InkBottle, InkwellStats } from './inkwell-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function inkColorColor(c: string): string {
  if (c === 'gold') return chalk.rgb(255, 215, 0)(c)
  if (c === 'black') return chalk.white(c)
  if (c === 'blue') return chalk.blue(c)
  if (c === 'red') return chalk.red(c)
  return chalk.dim(c)
}

function strokeTypeColor(t: string): string {
  if (t === 'bold') return chalk.green(t)
  if (t === 'regular') return chalk.blue(t)
  if (t === 'light') return chalk.cyan(t)
  if (t === 'faded') return chalk.yellow(t)
  if (t === 'blotted') return chalk.rgb(255, 165, 0)(t)
  return chalk.red(t)
}

function classificationColor(c: string): string {
  if (c === 'masterwork') return chalk.rgb(255, 215, 0)(c)
  if (c === 'fine-craft') return chalk.green(c)
  if (c === 'legible') return chalk.blue(c)
  if (c === 'rough-draft') return chalk.yellow(c)
  if (c === 'scribble') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function conditionColor(c: string): string {
  if (c === 'pristine') return chalk.green(c)
  if (c === 'good') return chalk.blue(c)
  if (c === 'fair') return chalk.cyan(c)
  if (c === 'worn') return chalk.yellow(c)
  if (c === 'damaged') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function gradeColor(g: string): string {
  if (g === 'A') return chalk.green(g)
  if (g === 'B') return chalk.blue(g)
  if (g === 'C') return chalk.yellow(g)
  if (g === 'D') return chalk.rgb(255, 165, 0)(g)
  return chalk.red(g)
}

// ─── Stroke Formatting ───────────────────────────────────────────────────────

function formatStroke(s: InkStroke, verbose: boolean): string {
  const markers: string[] = []
  if (s.blemishes.length > 0) markers.push(chalk.red(`[${s.blemishes.length} blemishes]`))
  if (s.flourishes.length > 0) markers.push(chalk.green(`[${s.flourishes.length} flourishes]`))
  if (s.inkBlots.length > 0) markers.push(chalk.rgb(255, 165, 0)(`[${s.inkBlots.length} blots]`))

  const line = `  ${chalk.bold(s.file)} qual:${scoreColor(s.strokeQuality)} dens:${scoreColor(s.inkDensity)} flow:${scoreColor(s.flow)} pen:${scoreColor(s.penmanship)} read:${scoreColor(s.readabilityScore)} ${inkColorColor(s.inkColor)} ${strokeTypeColor(s.strokeType)} ${classificationColor(s.classification)}${markers.length > 0 ? ' ' + markers.join(' ') : ''}`

  if (!verbose) return line

  const details = [line]
  if (s.manuscript.paragraphs > 0) {
    details.push(`    paragraphs:${s.manuscript.paragraphs} sentences:${s.manuscript.sentences} words:${s.manuscript.words} avg-len:${s.manuscript.avgSentenceLength}`)
  }
  if (s.drySpots.length > 0) {
    details.push(`    dry-spots: ${s.drySpots.map(d => chalk.yellow(d)).join(', ')}`)
  }
  if (s.smudges.length > 0) {
    details.push(`    smudges: ${s.smudges.map(m => chalk.rgb(255, 165, 0)(m)).join(', ')}`)
  }
  return details.join('\n')
}

// ─── Bottle Formatting ───────────────────────────────────────────────────────

function formatBottle(b: InkBottle, verbose: boolean): string {
  const line = `  ${chalk.bold(b.directory)} quality:${scoreColor(b.inkQuality)} fullness:${scoreColor(b.bottleFullness)} read:${scoreColor(b.avgReadability)} ${conditionColor(b.condition)} ${chalk.dim(`strokes:${b.strokes.length}`)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    blemishes:${b.totalBlemishes} flourishes:${b.totalFlourishes} blots:${b.totalInkBlots} dry:${b.totalDrySpots} smudges:${b.totalSmudges}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: InkwellStats): string {
  return [
    `  Ink Quality: ${scoreColor(stats.overallInkQuality)} | Penmanship: ${gradeColor(stats.penmanshipGrade)} | Condition: ${conditionColor(stats.manuscriptCondition)}`,
    `  Files: ${stats.totalFiles} | Bottles: ${stats.totalBottles} | Dominant Ink: ${inkColorColor(stats.dominantInkColor)}`,
    `  Avg Quality: ${scoreColor(stats.avgStrokeQuality)} | Avg Density: ${scoreColor(stats.avgInkDensity)} | Avg Flow: ${scoreColor(stats.avgFlow)} | Avg Penmanship: ${scoreColor(stats.avgPenmanship)}`,
    `  Masterworks: ${chalk.rgb(255, 215, 0)(String(stats.masterworks))} | Fine Crafts: ${chalk.green(String(stats.fineCrafts))} | Scribbles: ${chalk.yellow(String(stats.scribbles))} | Illegibles: ${chalk.red(String(stats.illegibles))}`,
    `  Blemishes: ${stats.totalBlemishes} | Flourishes: ${chalk.green(String(stats.totalFlourishes))} | Ink Blots: ${stats.totalInkBlots} | Dry Spots: ${stats.totalDrySpots} | Smudges: ${stats.totalSmudges}`,
    `  Best Written: ${chalk.green(stats.bestWrittenFile)} | Worst Written: ${chalk.red(stats.worstWrittenFile)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format inkwell result as a table
 * @example
 * formatInkwellTable(result, false) // string
 */
export function formatInkwellTable(result: InkwellResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🖊️ Inkwell - Code Writing Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(55)))
  lines.push('')

  lines.push(chalk.bold('📝 Ink Strokes'))
  if (result.strokes.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.strokes : result.strokes.slice(0, 15)
    for (const s of display) {
      lines.push(formatStroke(s, verbose))
    }
    if (!verbose && result.strokes.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.strokes.length - 15} more`))
    }
  }
  lines.push('')

  if (result.bottles.length > 0) {
    lines.push(chalk.bold('🫧 Ink Bottles'))
    for (const b of result.bottles) {
      lines.push(formatBottle(b, verbose))
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
 * Format inkwell result as JSON
 * @example
 * formatInkwellJson(result) // string
 */
export function formatInkwellJson(result: InkwellResult): string {
  return JSON.stringify(result, null, 2)
}
