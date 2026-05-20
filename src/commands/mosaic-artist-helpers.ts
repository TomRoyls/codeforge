// ─── Interfaces ───────────────────────────────────────────

export type TileType = 'function' | 'class' | 'module' | 'interface' | 'constant' | 'type' | 'enum'

export type TileShape = 'square' | 'rectangle' | 'irregular' | 'triangular' | 'hexagonal'

export type EdgeDirection = 'imports-from' | 'exports-to' | 'calls' | 'implements' | 'extends' | 'uses-type'

export type EdgeQuality = 'clean' | 'rough' | 'broken' | 'missing'

export type SectionPattern = 'geometric' | 'organic' | 'chaotic' | 'fractal' | 'minimalist'

export type SectionQuality = 'masterpiece' | 'gallery' | 'studio' | 'sketch' | 'doodle'

export type OverallGrade = 'masterwork' | 'accomplished' | 'competent' | 'apprentice' | 'novice'

export interface TileEdge {
  direction: EdgeDirection
  target: string
  quality: EdgeQuality
  groutWidth: number
}

export interface MosaicTile {
  file: string
  name: string
  type: TileType
  size: number
  color: string
  shape: TileShape
  fitScore: number
  edges: TileEdge[]
  beauty: number
}

export interface MosaicSection {
  name: string
  tiles: MosaicTile[]
  harmony: number
  pattern: SectionPattern
  dominantColor: string
  gaps: number
  overlaps: number
  overallQuality: SectionQuality
}

export interface CodePalette {
  primary: string
  secondary: string
  accent: string
  neutral: string
  dark: string
  highlight: string
  harmony: number
}

export interface MosaicStats {
  totalTiles: number
  avgTileSize: number
  avgFitScore: number
  avgBeauty: number
  cleanEdges: number
  roughEdges: number
  brokenEdges: number
  missingEdges: number
  totalGaps: number
  totalOverlaps: number
  harmonyScore: number
  tessellationScore: number
  groutQuality: number
  artisticMerit: number
  masterpieceSections: number
  sketchSections: number
  dominantPattern: string
  dominantStyle: string
  overallGrade: OverallGrade
}

export interface MosaicArtistResult {
  tiles: MosaicTile[]
  sections: MosaicSection[]
  stats: MosaicStats
  palette: CodePalette
  recommendations: string[]
}

export interface MosaicArtistOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Tile Extraction ─────────────────────────────────────

/**
 * Extract all mosaic tiles from file content.
 *
 * @example
 * extractTiles('function add() {}', 'app.ts') // => [MosaicTile]
 */
export function extractTiles(content: string, filePath: string): MosaicTile[] {
  const tiles: MosaicTile[] = []
  if (content.length === 0) return tiles

  const lines = content.split('\n')

  const fnMatches = content.matchAll(/\b(function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>)/g)
  for (const m of fnMatches) {
    const name = m[2] ?? m[3] ?? 'anonymous'
    const startLine = content.substring(0, m.index).split('\n').length
    tiles.push(buildTile(filePath, name, 'function', startLine, content))
  }

  const classMatches = content.matchAll(/\bclass\s+(\w+)/g)
  for (const m of classMatches) {
    const name = m[1]
    const startLine = content.substring(0, m.index).split('\n').length
    tiles.push(buildTile(filePath, name, 'class', startLine, content))
  }

  const ifaceMatches = content.matchAll(/\binterface\s+(\w+)/g)
  for (const m of ifaceMatches) {
    const name = m[1]
    const startLine = content.substring(0, m.index).split('\n').length
    tiles.push(buildTile(filePath, name, 'interface', startLine, content))
  }

  const typeMatches = content.matchAll(/\btype\s+(\w+)\s*=/g)
  for (const m of typeMatches) {
    const name = m[1]
    const startLine = content.substring(0, m.index).split('\n').length
    tiles.push(buildTile(filePath, name, 'type', startLine, content))
  }

  const enumMatches = content.matchAll(/\benum\s+(\w+)/g)
  for (const m of enumMatches) {
    const name = m[1]
    const startLine = content.substring(0, m.index).split('\n').length
    tiles.push(buildTile(filePath, name, 'enum', startLine, content))
  }

  const constMatches = content.matchAll(/\bexport\s+const\s+(\w+)\s*=/g)
  for (const m of constMatches) {
    const name = m[1]
    if (!tiles.some(t => t.name === name)) {
      const startLine = content.substring(0, m.index).split('\n').length
      tiles.push(buildTile(filePath, name, 'constant', startLine, content))
    }
  }

  if (tiles.length === 0 && lines.length > 0) {
    tiles.push(buildTile(filePath, filePath, 'module', 1, content))
  }

  return tiles
}

/**
 * Build a single mosaic tile.
 *
 * @example
 * buildTile('a.ts', 'fn', 'function', 1, code) // => MosaicTile
 */
export function buildTile(file: string, name: string, type: TileType, startLine: number, content: string): MosaicTile {
  const lines = content.split('\n')
  const size = type === 'module' ? lines.length : Math.min(lines.length - startLine + 1, lines.length)
  const color = assignColor(type, content)
  const shape = computeTileShape(type, size, content)
  const edges = analyzeEdges(content, name)
  const fitScore = computeFitScore(edges)
  const beauty = computeBeauty(type, size, content)

  return { file, name, type, size: Math.max(1, size), color, shape, fitScore, edges, beauty }
}

// ─── Color Assignment ────────────────────────────────────

/**
 * Assign a color (style) to a tile based on type and content.
 *
 * @example
 * assignColor('class', content) // => 'structured-blue'
 */
export function assignColor(type: TileType, content: string): string {
  if (type === 'class') return 'structured-blue'
  if (type === 'interface' || type === 'type') return 'abstract-purple'
  if (type === 'enum') return 'categorical-green'
  if (type === 'constant') return 'constant-gold'
  if (type === 'function') {
    if (content.includes('async') && content.includes('await')) return 'async-orange'
    if (content.includes('try') && content.includes('catch')) return 'defensive-red'
    return 'functional-teal'
  }
  return 'modular-gray'
}

// ─── Shape Computation ───────────────────────────────────

/**
 * Compute tile shape based on structure.
 *
 * @example
 * computeTileShape('function', 10, code) // => 'square'
 */
export function computeTileShape(type: TileType, size: number, content: string): TileShape {
  const exports = (content.match(/\bexport\b/g) ?? []).length
  const imports = (content.match(/\bimport\b/g) ?? []).length

  if (type === 'interface' || type === 'type') return 'square'
  if (imports > 5 && exports <= 2) return 'triangular'
  if (exports >= 6) return 'hexagonal'

  const variance = Math.abs(exports - imports)
  if (variance <= 1 && size < 30) return 'square'
  if (variance <= 3 && size < 60) return 'rectangle'

  return 'irregular'
}

// ─── Edge Analysis ───────────────────────────────────────

/**
 * Analyze edges (connections) for a tile from content.
 *
 * @example
 * analyzeEdges(code, 'fnName') // => [TileEdge]
 */
export function analyzeEdges(content: string, _tileName: string): TileEdge[] {
  const edges: TileEdge[] = []

  const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
  for (const m of importMatches) {
    edges.push({
      direction: 'imports-from',
      target: m[1],
      quality: m[1].startsWith('.') ? 'clean' : 'rough',
      groutWidth: m[1].split('/').length,
    })
  }

  const exportMatches = content.matchAll(/export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g)
  for (const m of exportMatches) {
    edges.push({
      direction: 'exports-to',
      target: m[1],
      quality: 'clean',
      groutWidth: 1,
    })
  }

  const extendsMatches = content.matchAll(/\bextends\s+(\w+)/g)
  for (const m of extendsMatches) {
    edges.push({
      direction: 'extends',
      target: m[1],
      quality: 'clean',
      groutWidth: 2,
    })
  }

  const implementsMatches = content.matchAll(/\bimplements\s+(\w+)/g)
  for (const m of implementsMatches) {
    edges.push({
      direction: 'implements',
      target: m[1],
      quality: 'clean',
      groutWidth: 2,
    })
  }

  return edges
}

// ─── Fit Score ───────────────────────────────────────────

/**
 * Compute fit score from edges.
 *
 * @example
 * computeFitScore(edges) // => 85
 */
export function computeFitScore(edges: TileEdge[]): number {
  if (edges.length === 0) return 50

  let score = 70

  const cleanCount = edges.filter(e => e.quality === 'clean').length
  const roughCount = edges.filter(e => e.quality === 'rough').length
  const brokenCount = edges.filter(e => e.quality === 'broken').length

  score += cleanCount * 5
  score -= roughCount * 5
  score -= brokenCount * 15

  const avgGrout = edges.reduce((s, e) => s + e.groutWidth, 0) / edges.length
  if (avgGrout > 3) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── Beauty ──────────────────────────────────────────────

/**
 * Compute beauty score for a tile.
 *
 * @example
 * computeBeauty('function', 20, code) // => 85
 */
export function computeBeauty(type: TileType, size: number, content: string): number {
  let score = 70

  if (size > 0 && size <= 20) score += 15
  else if (size > 20 && size <= 50) score += 10
  else if (size > 100) score -= 10

  if (content.includes('/**') || content.includes('*')) score += 10
  if (/\bfunction\b\s+\w+/.test(content) || /const\s+\w+\s*=/.test(content)) score += 5

  if (type === 'interface' || type === 'type') score += 5
  if (type === 'class' && content.includes('private')) score += 5

  if ((content.match(/console\.log/g) ?? []).length > 3) score -= 10
  if ((content.match(/TODO|FIXME|HACK/g) ?? []).length > 0) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── Section Harmony ─────────────────────────────────────

/**
 * Compute harmony score for a section of tiles.
 *
 * @example
 * computeSectionHarmony(tiles) // => 80
 */
export function computeSectionHarmony(tiles: MosaicTile[]): number {
  if (tiles.length === 0) return 100

  const types = new Set(tiles.map(t => t.type))
  const colors = new Set(tiles.map(t => t.color))
  const avgBeauty = tiles.reduce((s, t) => s + t.beauty, 0) / tiles.length
  const avgFit = tiles.reduce((s, t) => s + t.fitScore, 0) / tiles.length

  let harmony = (avgBeauty + avgFit) / 2

  if (colors.size <= 2) harmony += 10
  else if (colors.size >= 5) harmony -= 5

  if (types.size <= 2) harmony += 5

  return Math.max(0, Math.min(100, Math.round(harmony)))
}

// ─── Section Pattern ─────────────────────────────────────

/**
 * Detect the pattern of a section.
 *
 * @example
 * detectSectionPattern(tiles) // => 'geometric'
 */
export function detectSectionPattern(tiles: MosaicTile[]): SectionPattern {
  if (tiles.length === 0) return 'minimalist'
  if (tiles.length === 1) return 'minimalist'

  const types = tiles.map(t => t.type)
  const uniqueTypes = new Set(types)
  const sizes = tiles.map(t => t.size)
  const avgSize = sizes.reduce((s, sz) => s + sz, 0) / sizes.length
  const sizeVariance = sizes.reduce((s, sz) => s + Math.abs(sz - avgSize), 0) / sizes.length

  if (sizeVariance < 3 && uniqueTypes.size <= 2) return 'geometric'
  if (uniqueTypes.size >= 4 && sizeVariance > 10) return 'chaotic'
  if (tiles.length > 5 && uniqueTypes.size >= 3) return 'fractal'
  if (sizeVariance > 5) return 'organic'

  return 'geometric'
}

// ─── Section Quality ─────────────────────────────────────

/**
 * Classify section quality from harmony.
 *
 * @example
 * classifySectionQuality(90) // => 'masterpiece'
 */
export function classifySectionQuality(harmony: number): SectionQuality {
  if (harmony >= 85) return 'masterpiece'
  if (harmony >= 70) return 'gallery'
  if (harmony >= 55) return 'studio'
  if (harmony >= 35) return 'sketch'
  return 'doodle'
}

// ─── Code Palette ────────────────────────────────────────

/**
 * Build a code palette from all tiles.
 *
 * @example
 * buildCodePalette(tiles) // => CodePalette
 */
export function buildCodePalette(tiles: MosaicTile[]): CodePalette {
  const colorCounts = new Map<string, number>()
  for (const tile of tiles) {
    colorCounts.set(tile.color, (colorCounts.get(tile.color) ?? 0) + 1)
  }

  const sorted = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])
  const primary = sorted[0]?.[0] ?? 'modular-gray'
  const secondary = sorted[1]?.[0] ?? primary
  const accent = sorted.length > 2 ? sorted[sorted.length - 1]?.[0] ?? primary : primary
  const neutral = sorted.find(s => s[0].includes('gray'))?.[0] ?? primary
  const dark = sorted.find(s => s[0].includes('red') || s[0].includes('orange'))?.[0] ?? primary
  const highlight = sorted.find(s => s[0].includes('teal') || s[0].includes('blue'))?.[0] ?? primary

  const uniqueColors = sorted.length
  const harmony = uniqueColors <= 3 ? 90 : uniqueColors <= 5 ? 70 : 50

  return { primary, secondary, accent, neutral, dark, highlight, harmony }
}

// ─── Tessellation ────────────────────────────────────────

/**
 * Compute tessellation score — how well tiles repeat.
 *
 * @example
 * computeTessellation(tiles) // => 75
 */
export function computeTessellation(tiles: MosaicTile[]): number {
  if (tiles.length === 0) return 100

  const shapes = tiles.map(t => t.shape)
  const shapeCounts = new Map<string, number>()
  for (const s of shapes) {
    shapeCounts.set(s, (shapeCounts.get(s) ?? 0) + 1)
  }

  const dominantShape = [...shapeCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (!dominantShape) return 50

  const dominantRatio = dominantShape[1] / tiles.length
  return Math.round(dominantRatio * 100)
}

// ─── Grout Quality ───────────────────────────────────────

/**
 * Compute grout quality from all edges.
 *
 * @example
 * computeGroutQuality(edges) // => 80
 */
export function computeGroutQuality(edges: TileEdge[]): number {
  if (edges.length === 0) return 100

  const clean = edges.filter(e => e.quality === 'clean').length
  const avgGrout = edges.reduce((s, e) => s + e.groutWidth, 0) / edges.length

  let quality = (clean / edges.length) * 80
  quality += Math.max(0, (4 - avgGrout) * 5)

  return Math.max(0, Math.min(100, Math.round(quality)))
}

// ─── Artistic Merit ──────────────────────────────────────

/**
 * Compute overall artistic merit.
 *
 * @example
 * computeArtisticMerit(tiles, sections) // => 82
 */
export function computeArtisticMerit(tiles: MosaicTile[], sections: MosaicSection[]): number {
  if (tiles.length === 0) return 100

  const avgBeauty = tiles.reduce((s, t) => s + t.beauty, 0) / tiles.length
  const avgFit = tiles.reduce((s, t) => s + t.fitScore, 0) / tiles.length
  const sectionHarmony = sections.length > 0
    ? sections.reduce((s, sec) => s + sec.harmony, 0) / sections.length
    : 80

  return Math.round((avgBeauty * 0.4 + avgFit * 0.3 + sectionHarmony * 0.3))
}

// ─── Overall Grade ───────────────────────────────────────

/**
 * Classify overall grade from scores.
 *
 * @example
 * classifyOverallGrade(85, 80, 90) // => 'masterwork'
 */
export function classifyOverallGrade(merit: number, harmony: number, grout: number): OverallGrade {
  const composite = (merit + harmony + grout) / 3

  if (composite >= 85) return 'masterwork'
  if (composite >= 70) return 'accomplished'
  if (composite >= 55) return 'competent'
  if (composite >= 35) return 'apprentice'
  return 'novice'
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate mosaic artist recommendations.
 *
 * @example
 * generateRecommendations(tiles, sections, stats, palette) // => ['Clean edges']
 */
export function generateRecommendations(
  tiles: MosaicTile[],
  sections: MosaicSection[],
  stats: MosaicStats,
  _palette: CodePalette,
): string[] {
  const recs: string[] = []

  const roughEdges = tiles.flatMap(t => t.edges).filter(e => e.quality === 'rough').length
  if (roughEdges > 3) {
    recs.push(`Clean up ${roughEdges} rough edge${roughEdges > 1 ? 's' : ''} — improve external dependency interfaces`)
  }

  if (stats.totalGaps > 0) {
    recs.push(`Fill ${stats.totalGaps} gap${stats.totalGaps > 1 ? 's' : ''} — add missing implementations or documentation`)
  }

  if (stats.totalOverlaps > 0) {
    recs.push(`Consolidate ${stats.totalOverlaps} overlap${stats.totalOverlaps > 1 ? 's' : ''} — remove duplicate code`)
  }

  const lowBeauty = tiles.filter(t => t.beauty < 50)
  if (lowBeauty.length > 0) {
    recs.push(`Refactor ${lowBeauty.length} low-beauty tile${lowBeauty.length > 1 ? 's' : ''} for improved readability`)
  }

  const chaotic = sections.filter(s => s.pattern === 'chaotic')
  if (chaotic.length > 0) {
    recs.push(`Establish conventions in ${chaotic.length} chaotic section${chaotic.length > 1 ? 's' : ''}`)
  }

  if (stats.groutQuality < 50) {
    recs.append ? recs.push('Improve grout quality by simplifying interfaces between modules') : recs.push('Improve grout quality by simplifying interfaces between modules')
  }

  if (recs.length === 0) return []
  return recs
}

// ─── Build Sections ──────────────────────────────────────

/**
 * Build sections from tiles grouped by directory.
 *
 * @example
 * buildSections(tiles) // => [MosaicSection]
 */
export function buildSections(tiles: MosaicTile[]): MosaicSection[] {
  const dirMap = new Map<string, MosaicTile[]>()

  for (const tile of tiles) {
    const dir = tile.file.includes('/') ? tile.file.substring(0, tile.file.lastIndexOf('/')) : '.'
    const list = dirMap.get(dir) ?? []
    list.push(tile)
    dirMap.set(dir, list)
  }

  const sections: MosaicSection[] = []
  for (const [name, sectionTiles] of dirMap) {
    const harmony = computeSectionHarmony(sectionTiles)
    const pattern = detectSectionPattern(sectionTiles)
    const dominantColor = getDominantColor(sectionTiles)
    const gaps = sectionTiles.filter(t => t.fitScore < 30).length
    const overlaps = countOverlaps(sectionTiles)
    const overallQuality = classifySectionQuality(harmony)

    sections.push({
      name,
      tiles: sectionTiles,
      harmony,
      pattern,
      dominantColor,
      gaps,
      overlaps,
      overallQuality,
    })
  }

  return sections
}

/**
 * Get dominant color from tiles.
 *
 * @example
 * getDominantColor(tiles) // => 'functional-teal'
 */
export function getDominantColor(tiles: MosaicTile[]): string {
  if (tiles.length === 0) return 'modular-gray'
  const counts = new Map<string, number>()
  for (const t of tiles) {
    counts.set(t.color, (counts.get(t.color) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

/**
 * Count overlapping tiles (same name across different files).
 *
 * @example
 * countOverlaps(tiles) // => 2
 */
export function countOverlaps(tiles: MosaicTile[]): number {
  const nameCount = new Map<string, number>()
  for (const t of tiles) {
    nameCount.set(t.name, (nameCount.get(t.name) ?? 0) + 1)
  }
  return [...nameCount.values()].filter(c => c > 1).length
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete mosaic artist result.
 *
 * @example
 * buildMosaicArtistResult(['a.ts'], ['code'], {}) // => MosaicArtistResult
 */
export function buildMosaicArtistResult(files: string[], contents: string[], options: MosaicArtistOptions): MosaicArtistResult {
  const allTiles: MosaicTile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const tiles = extractTiles(content, file)
    allTiles.push(...tiles)
  }

  const sections = buildSections(allTiles)
  const palette = buildCodePalette(allTiles)
  const allEdges = allTiles.flatMap(t => t.edges)

  const totalTiles = allTiles.length
  const avgTileSize = totalTiles > 0 ? Math.round(allTiles.reduce((s, t) => s + t.size, 0) / totalTiles) : 0
  const avgFitScore = totalTiles > 0 ? Math.round(allTiles.reduce((s, t) => s + t.fitScore, 0) / totalTiles) : 0
  const avgBeauty = totalTiles > 0 ? Math.round(allTiles.reduce((s, t) => s + t.beauty, 0) / totalTiles) : 0

  const cleanEdges = allEdges.filter(e => e.quality === 'clean').length
  const roughEdges = allEdges.filter(e => e.quality === 'rough').length
  const brokenEdges = allEdges.filter(e => e.quality === 'broken').length
  const missingEdges = allEdges.filter(e => e.quality === 'missing').length

  const totalGaps = sections.reduce((s, sec) => s + sec.gaps, 0)
  const totalOverlaps = sections.reduce((s, sec) => s + sec.overlaps, 0)
  const harmonyScore = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.harmony, 0) / sections.length) : 100
  const tessellationScore = computeTessellation(allTiles)
  const groutQuality = computeGroutQuality(allEdges)
  const artisticMerit = computeArtisticMerit(allTiles, sections)

  const masterpieceSections = sections.filter(s => s.overallQuality === 'masterpiece').length
  const sketchSections = sections.filter(s => s.overallQuality === 'sketch' || s.overallQuality === 'doodle').length

  const dominantPattern = sections.length > 0
    ? [...new Map(sections.map(s => [s.pattern, (sections.filter(ss => ss.pattern === s.pattern)).length])).entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'minimalist'
    : 'minimalist'

  const overallGrade = classifyOverallGrade(artisticMerit, harmonyScore, groutQuality)

  const stats: MosaicStats = {
    totalTiles,
    avgTileSize,
    avgFitScore,
    avgBeauty,
    cleanEdges,
    roughEdges,
    brokenEdges,
    missingEdges,
    totalGaps,
    totalOverlaps,
    harmonyScore,
    tessellationScore,
    groutQuality,
    artisticMerit,
    masterpieceSections,
    sketchSections,
    dominantPattern,
    dominantStyle: palette.primary,
    overallGrade,
  }

  const recommendations = generateRecommendations(allTiles, sections, stats, palette)

  return { tiles: allTiles, sections, stats, palette, recommendations }
}
