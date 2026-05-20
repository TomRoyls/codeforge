import chalk from 'chalk'
import type { MosaicTileResult, Tile, TilePattern, GroutAnalysis, MosaicTileStats } from './mosaic-tile-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function shapeColor(s: string): string {
  if (s === 'square') return chalk.green(s)
  if (s === 'rectangle') return chalk.blue(s)
  if (s === 'hexagonal') return chalk.cyan(s)
  if (s === 'triangle') return chalk.yellow(s)
  if (s === 'oversized') return chalk.red(s)
  if (s === 'fragment') return chalk.dim(s)
  return chalk.magenta(s)
}

function gradeColor(g: string): string {
  if (g === 'masterpiece-tile') return chalk.green(g)
  if (g === 'quality-tile') return chalk.blue(g)
  if (g === 'standard-tile') return chalk.cyan(g)
  if (g === 'rough-tile') return chalk.yellow(g)
  return chalk.red(g)
}

function overallColor(o: string): string {
  if (o === 'masterwork-mosaic') return chalk.green(o)
  if (o === 'quality-composition') return chalk.blue(o)
  if (o === 'standard-tiling') return chalk.cyan(o)
  if (o === 'rough-patchwork') return chalk.yellow(o)
  return chalk.red(o)
}

function alignmentColor(a: string): string {
  if (a === 'perfect') return chalk.green(a)
  if (a === 'aligned') return chalk.blue(a)
  if (a === 'offset') return chalk.yellow(a)
  return chalk.red(a)
}

function severityColor(s: string): string {
  if (s === 'structural') return chalk.red(s)
  if (s === 'major') return chalk.magenta(s)
  if (s === 'minor') return chalk.yellow(s)
  return chalk.dim(s)
}

// ─── Tile Formatting ────────────────────────────────────────────────────────────

function formatTile(t: Tile): string {
  const issueMarker = t.issues.length > 0 ? chalk.red(` [${t.issues.length}]`) : ''
  return `  ${chalk.bold(t.file)} ${shapeColor(t.shape)} ${chalk.dim(t.color)} fit:${scoreColor(t.fitScore)} beauty:${scoreColor(t.beautyScore)} contrib:${scoreColor(t.contributionScore)} ${gradeColor(t.grade)}${issueMarker}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: MosaicTileStats): string {
  return [
    `  Grade: ${overallColor(stats.overallGrade)} | Fitness: ${scoreColor(stats.mosaicFitness)} | Grout: ${scoreColor(stats.groutIntegrity)} | Diversity: ${scoreColor(stats.tileDiversity)}`,
    `  Fit: ${scoreColor(stats.avgFitScore)} | Beauty: ${scoreColor(stats.avgBeautyScore)} | Contribution: ${scoreColor(stats.avgContributionScore)} | Size: ${stats.avgSize} LOC`,
    `  Masterpieces: ${chalk.green(String(stats.masterpieceTiles))} | Rejects: ${chalk.red(String(stats.rejectTiles))} | Issues: ${stats.totalIssues} | Patterns: ${stats.totalPatterns}`,
    `  Grout Quality: ${scoreColor(stats.avgGroutQuality)} | Misaligned: ${chalk.red(String(stats.misalignedGrout))} | Aligned Patterns: ${chalk.green(String(stats.alignedPatterns))}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format mosaic tile result as a table
 * @example
 * formatMosaicTileTable(result, false) // string
 */
export function formatMosaicTileTable(result: MosaicTileResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧩 Mosaic Tile - Code Tile & Module Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🔲 Tiles'))
  if (result.tiles.length === 0) {
    lines.push(chalk.dim('  No tiles analyzed.'))
  } else {
    const display = verbose ? result.tiles : result.tiles.slice(0, 12)
    for (const t of display) {
      lines.push(formatTile(t))
      if (verbose && t.issues.length > 0) {
        for (const issue of t.issues.slice(0, 3)) {
          lines.push(`    ${severityColor(issue.severity)} ${issue.type}: ${chalk.dim(issue.description)}`)
        }
      }
    }
    if (!verbose && result.tiles.length > 12) {
      lines.push(chalk.dim(`  ... and ${result.tiles.length - 12} more`))
    }
  }
  lines.push('')

  if (result.patterns.length > 0) {
    lines.push(chalk.bold('🔄 Patterns'))
    for (const p of result.patterns) {
      const aligned = p.isGroutAligned ? chalk.green('aligned') : chalk.yellow('offset')
      lines.push(`  ${chalk.cyan(p.name)} consistency:${scoreColor(p.consistency)} ${aligned} (${p.tiles.length} tiles)`)
    }
    lines.push('')
  }

  if (result.grout.length > 0) {
    lines.push(chalk.bold('🧱 Grout'))
    const display = verbose ? result.grout : result.grout.slice(0, 8)
    for (const g of display) {
      lines.push(`  ${chalk.dim(g.file)} <-> ${chalk.dim(g.neighborFile)} ${alignmentColor(g.alignment)} q:${scoreColor(g.groutQuality)} ${chalk.dim(g.description)}`)
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

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format mosaic tile result as JSON
 * @example
 * formatMosaicTileJson(result) // string
 */
export function formatMosaicTileJson(result: MosaicTileResult): string {
  return JSON.stringify(result, null, 2)
}
