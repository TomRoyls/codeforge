import chalk from 'chalk'

import type {
  CodePalette,
  MosaicArtistResult,
  MosaicSection,
  MosaicStats,
  MosaicTile,
  OverallGrade,
  SectionQuality,
  TileEdge,
  TileShape,
  TileType,
} from './mosaic-artist-helpers.js'

// ─── Tile Symbols ────────────────────────────────────────

const TILE_SYMBOL: Record<TileType, string> = {
  function: 'ƒ',
  class: '◆',
  module: '▣',
  interface: '◇',
  constant: '●',
  type: '◈',
  enum: '◀',
}

const SHAPE_SYMBOL: Record<TileShape, string> = {
  square: '■',
  rectangle: '▬',
  irregular: '◈',
  triangular: '▲',
  hexagonal: '⬡',
}

const GRADE_COLOR: Record<OverallGrade, (s: string) => string> = {
  masterwork: chalk.rgb(72, 199, 142),
  accomplished: chalk.rgb(120, 200, 120),
  competent: chalk.rgb(200, 180, 80),
  apprentice: chalk.rgb(220, 150, 80),
  novice: chalk.rgb(220, 80, 80),
}

const QUALITY_COLOR: Record<SectionQuality, (s: string) => string> = {
  masterpiece: chalk.rgb(72, 199, 142),
  gallery: chalk.rgb(120, 200, 120),
  studio: chalk.rgb(200, 180, 80),
  sketch: chalk.rgb(220, 150, 80),
  doodle: chalk.rgb(220, 80, 80),
}

/**
 * Format tile type badge.
 *
 * @example
 * formatTileBadge('function') // => 'ƒ function'
 */
export function formatTileBadge(type: TileType): string {
  return `${TILE_SYMBOL[type]} ${type}`
}

/**
 * Format shape symbol.
 *
 * @example
 * formatShapeSymbol('hexagonal') // => '⬡'
 */
export function formatShapeSymbol(shape: TileShape): string {
  return SHAPE_SYMBOL[shape]
}

/**
 * Format grade label.
 *
 * @example
 * formatGradeLabel('masterwork') // => colored 'masterwork'
 */
export function formatGradeLabel(grade: OverallGrade): string {
  return GRADE_COLOR[grade](grade)
}

/**
 * Format section quality label.
 *
 * @example
 * formatSectionQuality('masterpiece') // => colored
 */
export function formatSectionQuality(quality: SectionQuality): string {
  return QUALITY_COLOR[quality](quality)
}

/**
 * Format beauty bar.
 *
 * @example
 * formatBeautyBar(80) // => '▓▓▓▓▓▓▓▓░░ 80'
 */
export function formatBeautyBar(score: number): string {
  const width = 10
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = score >= 70 ? chalk.rgb(72, 199, 142) : score >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${score}`)
}

/**
 * Format fit score bar.
 *
 * @example
 * formatFitBar(65) // => '▓▓▓▓▓▓░░░░ 65'
 */
export function formatFitBar(score: number): string {
  const width = 10
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = score >= 70 ? chalk.rgb(72, 199, 142) : score >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${score}`)
}

// ─── Mosaic Grid ─────────────────────────────────────────

/**
 * Format ASCII mosaic grid visualization.
 *
 * @example
 * formatMosaicGrid(tiles) // => visual grid
 */
export function formatMosaicGrid(tiles: MosaicTile[]): string {
  if (tiles.length === 0) return 'No tiles to display.'

  const lines: string[] = [chalk.bold('Mosaic Grid:')]
  const cols = Math.min(tiles.length, 8)

  for (let i = 0; i < tiles.length; i += cols) {
    const row = tiles.slice(i, i + cols)
    const symbols = row.map(t => {
      const sym = SHAPE_SYMBOL[t.shape]
      const color = t.beauty >= 70 ? chalk.rgb(72, 199, 142) : t.beauty >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
      return color(sym)
    })
    lines.push(`  ${symbols.join(' ')}`)
  }

  return lines.join('\n')
}

// ─── Tile Inventory ──────────────────────────────────────

/**
 * Format tile inventory table.
 *
 * @example
 * formatTileInventory(tiles) // => table
 */
export function formatTileInventory(tiles: MosaicTile[]): string {
  if (tiles.length === 0) return 'No tiles detected.'

  const header = chalk.bold('Tile                    Type       Shape        Beauty  Fit')
  const separator = '─'.repeat(70)
  const rows = tiles.slice(0, 20).map(t => {
    const name = t.name.substring(0, 22).padEnd(22)
    const type = formatTileBadge(t.type).padEnd(10)
    const shape = `${formatShapeSymbol(t.shape)} ${t.shape}`.padEnd(12)
    const beauty = formatBeautyBar(t.beauty)
    const fit = formatFitBar(t.fitScore)
    return `${name} ${type} ${shape} ${beauty}  ${fit}`
  })

  const extra = tiles.length > 20 ? [`  ... and ${tiles.length - 20} more tiles`] : []
  return [header, separator, ...rows, ...extra].join('\n')
}

// ─── Section Gallery ─────────────────────────────────────

/**
 * Format section gallery.
 *
 * @example
 * formatSectionGallery(sections) // => gallery view
 */
export function formatSectionGallery(sections: MosaicSection[]): string {
  if (sections.length === 0) return 'No sections detected.'

  const lines: string[] = [chalk.bold('Section Gallery:')]

  for (const section of sections) {
    const quality = formatSectionQuality(section.overallQuality)
    lines.push(`  ${chalk.bold(section.name)} — ${quality}`)
    lines.push(`    Tiles: ${section.tiles.length} | Harmony: ${section.harmony} | Pattern: ${section.pattern}`)
    lines.push(`    Color: ${section.dominantColor} | Gaps: ${section.gaps} | Overlaps: ${section.overlaps}`)
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Edge Report ─────────────────────────────────────────

/**
 * Format edge quality report.
 *
 * @example
 * formatEdgeReport(edges) // => edge summary
 */
export function formatEdgeReport(edges: TileEdge[]): string {
  if (edges.length === 0) return 'No edges detected.'

  const clean = edges.filter(e => e.quality === 'clean').length
  const rough = edges.filter(e => e.quality === 'rough').length
  const broken = edges.filter(e => e.quality === 'broken').length
  const missing = edges.filter(e => e.quality === 'missing').length

  const lines = [
    chalk.bold('Edge Quality Report:'),
    `  Total: ${edges.length}`,
    `  ${chalk.rgb(72, 199, 142)(`Clean: ${clean}`)} | ${chalk.rgb(200, 180, 80)(`Rough: ${rough}`)} | ${chalk.rgb(220, 80, 80)(`Broken: ${broken}`)} | ${chalk.rgb(150, 150, 150)(`Missing: ${missing}`)}`,
  ]

  return lines.join('\n')
}

// ─── Palette Display ─────────────────────────────────────

/**
 * Format code palette.
 *
 * @example
 * formatPalette(palette) // => color palette
 */
export function formatPalette(palette: CodePalette): string {
  const lines = [
    chalk.bold('Code Palette:'),
    `  Primary: ${palette.primary} | Secondary: ${palette.secondary}`,
    `  Accent: ${palette.accent} | Neutral: ${palette.neutral}`,
    `  Dark: ${palette.dark} | Highlight: ${palette.highlight}`,
    `  Harmony: ${palette.harmony}`,
  ]
  return lines.join('\n')
}

// ─── Stats Summary ───────────────────────────────────────

/**
 * Format mosaic artist stats.
 *
 * @example
 * formatMosaicStats(stats) // => stats summary
 */
export function formatMosaicStats(stats: MosaicStats): string {
  const lines = [
    chalk.bold('Mosaic Artist Statistics:'),
    `  Tiles: ${stats.totalTiles} | Avg size: ${stats.avgTileSize} lines`,
    `  Avg beauty: ${stats.avgBeauty} | Avg fit: ${stats.avgFitScore}`,
    `  Harmony: ${stats.harmonyScore} | Tessellation: ${stats.tessellationScore}`,
    `  Grout quality: ${stats.groutQuality} | Artistic merit: ${stats.artisticMerit}`,
    `  Masterpiece sections: ${stats.masterpieceSections} | Sketch sections: ${stats.sketchSections}`,
    `  Dominant pattern: ${stats.dominantPattern} | Style: ${stats.dominantStyle}`,
    `  Overall grade: ${formatGradeLabel(stats.overallGrade)}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatMosaicRecommendations(['Clean edges']) // => bullet list
 */
export function formatMosaicRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.rgb(72, 199, 142)('✓ Mosaic is a masterpiece — no concerns')
  const lines = [chalk.bold('🎨 Recommendations:')]
  for (const rec of recommendations) {
    lines.push(`  • ${rec}`)
  }
  return lines.join('\n')
}

// ─── Full Output ─────────────────────────────────────────

/**
 * Format full mosaic artist result as table.
 *
 * @example
 * formatMosaicArtistTable(result, false) // => full output
 */
export function formatMosaicArtistTable(result: MosaicArtistResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold('\nMosaic Artist — Code Composition Analysis\n'))
  sections.push(formatMosaicStats(result.stats))
  sections.push('')

  if (result.tiles.length > 0) {
    sections.push(formatMosaicGrid(result.tiles))
    sections.push('')
  }

  sections.push(formatPalette(result.palette))
  sections.push('')

  if (result.tiles.length > 0) {
    sections.push(chalk.bold('Tile Inventory:'))
    sections.push(verbose ? result.tiles.map(t => `  ${formatTileBadge(t.type)} ${t.name} (${t.shape}, beauty:${t.beauty}, fit:${t.fitScore})`).join('\n') : formatTileInventory(result.tiles))
    sections.push('')
  }

  if (result.sections.length > 0) {
    sections.push(formatSectionGallery(result.sections))
  }

  const allEdges = result.tiles.flatMap(t => t.edges)
  if (allEdges.length > 0) {
    sections.push(formatEdgeReport(allEdges))
    sections.push('')
  }

  sections.push(formatMosaicRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format mosaic artist result as JSON.
 *
 * @example
 * formatMosaicArtistJson(result) // => JSON string
 */
export function formatMosaicArtistJson(result: MosaicArtistResult): string {
  return JSON.stringify(result, null, 2)
}
