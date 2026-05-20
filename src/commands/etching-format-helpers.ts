import chalk from 'chalk'
import type { EtchingResult, EngravingLine, EtchingPlate, EtchingStats } from './etching-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function plateTypeColor(t: string): string {
  switch (t) {
    case 'copper': return chalk.rgb(184, 115, 51)(t)
    case 'steel': return chalk.gray(t)
    case 'zinc': return chalk.blue(t)
    case 'wood': return chalk.rgb(139, 90, 43)(t)
    case 'stone': return chalk.dim(t)
    default: return chalk.red(t)
  }
}

function styleColor(s: string): string {
  switch (s) {
    case 'burin': return chalk.rgb(255, 215, 0)(s)
    case 'drypoint': return chalk.green(s)
    case 'etching': return chalk.blue(s)
    case 'aquatint': return chalk.cyan(s)
    case 'mezzotint': return chalk.magenta(s)
    default: return chalk.dim(s)
  }
}

function craftsmanshipColor(c: string): string {
  switch (c) {
    case 'master': return chalk.rgb(255, 215, 0)(c)
    case 'journeyman': return chalk.green(c)
    case 'apprentice': return chalk.blue(c)
    case 'novice': return chalk.yellow(c)
    default: return chalk.red(c)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'pristine': return chalk.rgb(255, 215, 0)(c)
    case 'good': return chalk.green(c)
    case 'fair': return chalk.blue(c)
    case 'worn': return chalk.yellow(c)
    case 'damaged': return chalk.rgb(255, 165, 0)(c)
    default: return chalk.red(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'grand-master': return chalk.rgb(255, 215, 0)(g)
    case 'master': return chalk.green(g)
    case 'journeyman': return chalk.blue(g)
    case 'apprentice': return chalk.yellow(g)
    case 'novice': return chalk.rgb(255, 165, 0)(g)
    default: return chalk.red(g)
  }
}

// ─── Engraving Formatting ────────────────────────────────────────────────────

function formatEngraving(e: EngravingLine, verbose: boolean): string {
  const line = `  ${chalk.bold(e.file)} prec:${scoreColor(e.linePrecision)} depth:${scoreColor(e.depthControl)} plate:${scoreColor(e.plateQuality)} cross:${scoreColor(e.crossHatching)} burin:${scoreColor(e.burinWork)} ${craftsmanshipColor(e.craftsmanship)} ${plateTypeColor(e.plateType)} ${styleColor(e.etchingStyle)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    lines:${e.lineCount} avgLen:${e.avgLineLength} var:${e.lineVariance} density:${e.etchingDensity}%`)
  details.push(`    groove: depth:${e.groove.depth} width:${e.groove.width} angle:${e.groove.angle}`)
  details.push(`    bold:${e.lines.bold} fine:${e.lines.fine} rough:${e.lines.rough} over:${e.lines.overworked} feather:${e.lines.feathered}`)
  details.push(`    burrs:${e.blemishes.burrs} scratches:${e.blemishes.scratches} wear:${e.blemishes.plateWear} acid:${e.blemishes.acidSpots} ghost:${e.blemishes.ghosting}`)
  return details.join('\n')
}

// ─── Plate Formatting ────────────────────────────────────────────────────────

function formatPlate(p: EtchingPlate, verbose: boolean): string {
  const line = `  ${chalk.bold(p.directory)} prec:${scoreColor(p.avgPrecision)} depth:${scoreColor(p.avgDepthControl)} ${conditionColor(p.plateCondition)} ${styleColor(p.dominantStyle)} quality:${scoreColor(p.overallQuality)} engravings:${p.engravings.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    master:${p.masterEngravings} amateur:${p.amateurEngravings} blemishes:${p.totalBlemishes} edition:${p.edition}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: EtchingStats): string {
  return [
    `  Grade: ${gradeColor(stats.craftsmanshipGrade)} | Precision: ${scoreColor(stats.overallPrecision)} | Style: ${styleColor(stats.dominantStyle)} | Plate: ${stats.dominantPlate}`,
    `  Files: ${stats.totalFiles} | Plates: ${stats.totalPlates}`,
    `  Avg Precision: ${scoreColor(stats.avgLinePrecision)} | Depth: ${scoreColor(stats.avgDepthControl)} | Quality: ${scoreColor(stats.avgPlateQuality)} | Cross: ${scoreColor(stats.avgCrossHatching)} | Burin: ${scoreColor(stats.avgBurinWork)}`,
    `  Master: ${chalk.rgb(255, 215, 0)(String(stats.masterCraftsman))} | Journeyman: ${chalk.green(String(stats.journeymanCraftsman))} | Apprentice: ${chalk.blue(String(stats.apprenticeCraftsman))} | Novice: ${chalk.yellow(String(stats.noviceCraftsman))} | Amateur: ${chalk.red(String(stats.amateurCraftsman))}`,
    `  Bold: ${stats.totalBoldLines} | Fine: ${stats.totalFineLines} | Rough: ${stats.totalRoughLines} | Overworked: ${stats.totalOverworkedLines} | Feathered: ${stats.totalFeatheredLines}`,
    `  Burrs: ${chalk.red(String(stats.totalBurrs))} | Scratches: ${chalk.yellow(String(stats.totalScratches))} | Acid: ${chalk.rgb(255, 165, 0)(String(stats.totalAcidSpots))} | Ghost: ${chalk.dim(String(stats.totalGhosting))}`,
    `  Best: ${chalk.green(stats.bestEngraving)} | Worst: ${chalk.red(stats.worstEngraving)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format etching result as a table
 * @example
 * formatEtchingTable(result, false) // string
 */
export function formatEtchingTable(result: EtchingResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔨 Etching - Code Engraving Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🖌️ Engravings'))
  if (result.engravings.length === 0) {
    lines.push(chalk.dim('  No engravings detected.'))
  } else {
    const display = verbose ? result.engravings : result.engravings.slice(0, 15)
    for (const e of display) {
      lines.push(formatEngraving(e, verbose))
    }
    if (!verbose && result.engravings.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.engravings.length - 15} more`))
    }
  }
  lines.push('')

  if (result.plates.length > 0) {
    lines.push(chalk.bold('🪨 Plates'))
    for (const p of result.plates) {
      lines.push(formatPlate(p, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Statistics'))
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
 * Format etching result as JSON
 * @example
 * formatEtchingJson(result) // string
 */
export function formatEtchingJson(result: EtchingResult): string {
  return JSON.stringify(result, null, 2)
}
