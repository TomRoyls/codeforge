import chalk from 'chalk'

import type { MosaicResult, MosaicSection, MosaicStats, Tile } from './mosaic-helpers.js'

// ─── Color Map ─────────────────────────────────────────────────────────────────

const tileColorMap: Record<string, (s: string) => string> = {
  utility: (s: string) => chalk.rgb(74, 144, 217)(s),
  command: (s: string) => chalk.rgb(46, 204, 113)(s),
  core: (s: string) => chalk.rgb(231, 76, 60)(s),
  test: (s: string) => chalk.rgb(241, 196, 15)(s),
  config: (s: string) => chalk.rgb(142, 68, 173)(s),
  type: (s: string) => chalk.rgb(26, 188, 156)(s),
  format: (s: string) => chalk.rgb(230, 126, 34)(s),
}

const conditionIcon: Record<string, string> = {
  pristine: '\u{1F48E}',
  good: '\u2705',
  worn: '\u{1F4AA}',
  damaged: '\u26A0\uFE0F',
  missing: '\u274C',
}

const sectionIcon: Record<string, string> = {
  masterpiece: '\u{1F3A8}',
  gallery: '\u{1F5FC}',
  workshop: '\u{1F527}',
  construction: '\u{1F3D7}\uFE0F',
  ruins: '\u{1F3DB}\uFE0F',
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Mosaic Grid ───────────────────────────────────────────────────────────────

/**
 * Format ASCII mosaic grid.
 *
 * @example
 * formatMosaicGrid(tiles)
 */
export function formatMosaicGrid(tiles: Tile[]): string {
  if (tiles.length === 0) return '  No tiles to display\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Mosaic Grid')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const maxPerRow = 8
  const sorted = [...tiles].filter((t) => t.condition !== 'missing').sort((a, b) => {
    if (a.position[0] !== b.position[0]) return a.position[0] - b.position[0]
    return a.position[1] - b.position[1]
  })

  for (let i = 0; i < sorted.length; i += maxPerRow) {
    const row = sorted.slice(i, i + maxPerRow)
    const rowStr = row.map((t) => {
      const color = tileColorMap[t.color] ?? chalk.white
      const icon = conditionIcon[t.condition] ?? '\u2022'
      return `${icon}${color('\u2588\u2588')}`
    }).join(' ')
    lines.push(`  ${rowStr}`)
  }

  return lines.join('\n')
}

// ─── Tile List ─────────────────────────────────────────────────────────────────

/**
 * Format tile details.
 *
 * @example
 * formatTileList(tiles)
 */
export function formatTileList(tiles: Tile[]): string {
  if (tiles.length === 0) return '  No tiles found\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Tile Details')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...tiles].sort((a, b) => b.brightness - a.brightness)
  for (const tile of sorted.slice(0, 15)) {
    const icon = conditionIcon[tile.condition] ?? '\u2022'
    const color = tileColorMap[tile.color] ?? chalk.white
    lines.push(`  ${icon} ${chalk.bold(tile.file)}`)
    lines.push(`    Color: ${color(tile.color)} | Brightness: ${tile.brightness}% | Size: ${tile.size} lines | Condition: ${tile.condition}`)
    if (tile.edges.length > 0) {
      lines.push(`    Edges: ${tile.edges.length} connection${tile.edges.length !== 1 ? 's' : ''}`)
    }
  }

  return lines.join('\n')
}

// ─── Section Breakdown ─────────────────────────────────────────────────────────

/**
 * Format section breakdown.
 *
 * @example
 * formatSectionBreakdown(sections)
 */
export function formatSectionBreakdown(sections: MosaicSection[]): string {
  if (sections.length === 0) return '  No sections found\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Section Breakdown')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const section of sections) {
    const icon = sectionIcon[section.condition] ?? '\u2022'
    lines.push(`  ${icon} ${chalk.bold(section.name)} (${section.tiles.length} tiles)`)
    lines.push(`    Dominant: ${section.dominantColor} | Coherence: ${buildBar(section.coherence)} ${section.coherence}% | Completeness: ${section.completeness}% | ${section.condition}`)
  }

  return lines.join('\n')
}

// ─── Palette Chart ─────────────────────────────────────────────────────────────

/**
 * Format palette chart.
 *
 * @example
 * formatPaletteChart(palette)
 */
export function formatPaletteChart(palette: Record<string, number>): string {
  const entries = Object.entries(palette)
  if (entries.length === 0) return '  No palette data\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Palette')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const maxCount = Math.max(...entries.map(([, c]) => c))
  for (const [color, count] of entries) {
    const colorFn = tileColorMap[color] ?? chalk.white
    const barWidth = maxCount > 0 ? Math.round((count / maxCount) * 15) : 0
    const bar = '\u2588'.repeat(Math.max(barWidth, 1))
    lines.push(`  ${colorFn(color.padEnd(10))} ${colorFn(bar)} ${count}`)
  }

  return lines.join('\n')
}

// ─── Missing Tiles ─────────────────────────────────────────────────────────────

/**
 * Format missing tile alerts.
 *
 * @example
 * formatMissingTiles(tiles)
 */
export function formatMissingTiles(tiles: Tile[]): string {
  const missing = tiles.filter((t) => t.condition === 'missing')
  if (missing.length === 0) return '  No missing tiles\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Missing Tiles')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const tile of missing.slice(0, 10)) {
    lines.push(`  \u274C ${tile.file}`)
  }
  if (missing.length > 10) {
    lines.push(`  ... and ${missing.length - 10} more`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format mosaic stats.
 *
 * @example
 * formatMosaicStats(stats)
 */
export function formatMosaicStats(stats: MosaicStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Mosaic Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Tiles:          ${stats.totalTiles}`)
  lines.push(`  Pristine:             ${stats.pristineCount}`)
  lines.push(`  Damaged:              ${stats.damagedCount}`)
  lines.push(`  Missing:              ${stats.missingCount}`)
  lines.push(`  Avg Brightness:       ${buildBar(stats.avgBrightness)} ${stats.avgBrightness}%`)
  lines.push(`  Avg Coherence:        ${buildBar(stats.avgCoherence)} ${stats.avgCoherence}%`)
  lines.push(`  Sections:             ${stats.sectionCount}`)
  lines.push(`  Masterpieces:         ${stats.masterpieceSections}`)
  lines.push(`  Ruins:                ${stats.ruinsSections}`)
  lines.push(`  Overall Composition:  ${buildBar(stats.overallComposition)} ${stats.overallComposition}%`)
  lines.push(`  Dominant Pattern:     ${chalk.bold(stats.dominantPattern)}`)
  lines.push(`  Pattern Diversity:    ${buildBar(stats.patternDiversity)} ${stats.patternDiversity}%`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format mosaic recommendations.
 *
 * @example
 * formatMosaicRecommendations(recs)
 */
export function formatMosaicRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Recommendations')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format complete mosaic result as table.
 *
 * @example
 * formatMosaicTable(result)
 */
export function formatMosaicTable(result: MosaicResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F3A8} ${chalk.bold('Mosaic Analysis')} \u2014 ${result.stats.totalTiles} tiles across ${result.stats.sectionCount} sections`)
  parts.push('')
  parts.push(formatMosaicGrid(result.tiles))
  parts.push('')
  parts.push(formatTileList(result.tiles))
  parts.push('')
  parts.push(formatSectionBreakdown(result.sections))
  parts.push('')
  parts.push(formatPaletteChart(result.palette))
  parts.push('')
  parts.push(formatMissingTiles(result.tiles))
  parts.push('')
  parts.push(formatMosaicStats(result.stats))
  parts.push('')
  parts.push(formatMosaicRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format mosaic result as JSON.
 *
 * @example
 * formatMosaicJSON(result)
 */
export function formatMosaicJSON(result: MosaicResult): string {
  return JSON.stringify(result, null, 2)
}
