// ─── Types ─────────────────────────────────────────────────────────────────────

export type TileColor = 'utility' | 'command' | 'core' | 'test' | 'config' | 'type' | 'format'
export type TileCondition = 'pristine' | 'good' | 'worn' | 'damaged' | 'missing'
export type EdgeType = 'import' | 're-export' | 'type' | 'dynamic'
export type SectionCondition = 'masterpiece' | 'gallery' | 'workshop' | 'construction' | 'ruins'

export interface Edge {
  from: string
  to: string
  strength: number
  type: EdgeType
}

export interface Tile {
  file: string
  color: TileColor
  brightness: number
  size: number
  position: [number, number]
  edges: Edge[]
  condition: TileCondition
}

export interface MosaicSection {
  name: string
  tiles: Tile[]
  dominantColor: string
  coherence: number
  completeness: number
  condition: SectionCondition
}

export interface MosaicStats {
  totalTiles: number
  pristineCount: number
  damagedCount: number
  missingCount: number
  avgBrightness: number
  avgCoherence: number
  sectionCount: number
  masterpieceSections: number
  ruinsSections: number
  overallComposition: number
  dominantPattern: string
  patternDiversity: number
}

export interface MosaicResult {
  tiles: Tile[]
  sections: MosaicSection[]
  palette: Record<string, number>
  stats: MosaicStats
  recommendations: string[]
}

// ─── Tile Color ────────────────────────────────────────────────────────────────

/**
 * Classify tile color (pattern type) from file path and content.
 *
 * @example
 * classifyTileColor('mod.test.ts', 'code')
 */
export function classifyTileColor(file: string, content: string): TileColor {
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file)) return 'test'
  if (/^test/.test(file) || /^tests?\//.test(file) || /__tests__/.test(file)) return 'test'
  if (/\.(json|yaml|yml|toml|rc)$/.test(file) || /config/i.test(file)) return 'config'
  if (/format-helper/.test(file)) return 'format'
  if (/\/commands\//.test(file)) return 'command'
  if (/\/core\//.test(file)) return 'core'
  if (content.includes('export type ') || content.includes('export interface ')) {
    const typeCount = (content.match(/\b(type|interface)\b/g) || []).length
    const totalCount = (content.match(/\b(function|const|let)\b/g) || []).length
    if (typeCount > totalCount * 0.5) return 'type'
  }
  return 'utility'
}

// ─── Brightness ────────────────────────────────────────────────────────────────

/**
 * Compute tile brightness (code quality 0-100).
 *
 * @example
 * computeBrightness('const x: number = 1')
 */
export function computeBrightness(content: string): number {
  if (content.length === 0) return 20

  let score = 40

  const lines = content.split('\n').filter((l) => l.trim().length > 0)
  const avgLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  if (avgLen > 0 && avgLen < 80) score += 15
  else if (avgLen >= 80 && avgLen < 120) score += 5

  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  if (jsdoc > 0) score += Math.min(15, jsdoc * 3)

  const typeAnnotations = (content.match(/:\s*(string|number|boolean|void|unknown|never)\b/g) || []).length
  score += Math.min(10, typeAnnotations * 2)

  const goodNames = (content.match(/(?:const|let|function|class)\s+[a-z][a-zA-Z0-9]{2,}/g) || []).length
  if (goodNames > 2) score += 10
  else if (goodNames > 0) score += 5

  const anyUsage = (content.match(/:\s*any\b/g) || []).length
  score -= anyUsage * 5

  const complexPatterns = (content.match(/\bif\b|\bfor\b|\bwhile\b|\bswitch\b/g) || []).length
  if (complexPatterns > 20) score -= 10
  else if (complexPatterns > 10) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── Tile Condition ─────────────────────────────────────────────────────────────

/**
 * Classify tile condition from brightness.
 *
 * @example
 * computeTileCondition(90)
 */
export function computeTileCondition(brightness: number): TileCondition {
  if (brightness > 85) return 'pristine'
  if (brightness > 65) return 'good'
  if (brightness > 45) return 'worn'
  if (brightness > 25) return 'damaged'
  return 'damaged'
}

// ─── Edges ──────────────────────────────────────────────────────────────────────

/**
 * Find edges (connections) from a tile to other files.
 *
 * @example
 * findEdges('mod.ts', 'import x from "./y"', ['y.ts', 'z.ts'])
 */
export function findEdges(file: string, content: string, allFiles: string[]): Edge[] {
  const edges: Edge[] = []

  const importMatches = content.matchAll(/^import\s+.*from\s+['"](\.\.?\/[^'"]+)['"]/gm)
  for (const m of importMatches) {
    const target = m[1]
    if (!target) continue
    const resolved = resolveImport(target, allFiles)
    if (resolved) {
      edges.push({ from: file, to: resolved, strength: 3, type: 'import' })
    }
  }

  const reExports = content.matchAll(/^export\s+\{[^}]*\}\s+from\s+['"](\.\.?\/[^'"]+)['"]/gm)
  for (const m of reExports) {
    const target = m[1]
    if (!target) continue
    const resolved = resolveImport(target, allFiles)
    if (resolved) {
      edges.push({ from: file, to: resolved, strength: 2, type: 're-export' })
    }
  }

  const typeImports = content.matchAll(/^import\s+type\s+.*from\s+['"](\.\.?\/[^'"]+)['"]/gm)
  for (const m of typeImports) {
    const target = m[1]
    if (!target) continue
    const resolved = resolveImport(target, allFiles)
    if (resolved) {
      edges.push({ from: file, to: resolved, strength: 1, type: 'type' })
    }
  }

  const dynamicImports = content.matchAll(/import\s*\(\s*['"](\.\.?\/[^'"]+)['"]\s*\)/g)
  for (const m of dynamicImports) {
    const target = m[1]
    if (!target) continue
    const resolved = resolveImport(target, allFiles)
    if (resolved) {
      edges.push({ from: file, to: resolved, strength: 2, type: 'dynamic' })
    }
  }

  return edges
}

function resolveImport(target: string, allFiles: string[]): string | null {
  const clean = target.replace(/\.(ts|tsx|js|jsx)$/, '')
  for (const f of allFiles) {
    const fClean = f.replace(/\.(ts|tsx|js|jsx)$/, '')
    if (fClean === clean || fClean.endsWith('/' + clean) || fClean === clean.replace(/^\.\//, '')) {
      return f
    }
  }
  return null
}

// ─── Position ──────────────────────────────────────────────────────────────────

/**
 * Compute tile position in the mosaic.
 *
 * @example
 * computePosition('src/a.ts', ['src/a.ts', 'src/b.ts'])
 */
export function computePosition(file: string, allFiles: string[]): [number, number] {
  const depth = (file.match(/\//g) || []).length
  const sorted = [...allFiles].sort()
  const idx = sorted.indexOf(file)
  return [depth, idx >= 0 ? idx : 0]
}

// ─── Sections ──────────────────────────────────────────────────────────────────

/**
 * Group tiles into sections by directory.
 *
 * @example
 * groupIntoSections(tiles, files)
 */
export function groupIntoSections(tiles: Tile[], _files: string[]): MosaicSection[] {
  const dirMap = new Map<string, Tile[]>()

  for (const tile of tiles) {
    const idx = tile.file.lastIndexOf('/')
    const dir = idx >= 0 ? tile.file.substring(0, idx) : '.'
    if (!dirMap.has(dir)) dirMap.set(dir, [])
    dirMap.get(dir)!.push(tile)
  }

  const sections: MosaicSection[] = []
  for (const [name, sectionTiles] of dirMap) {
    const colorCounts = new Map<string, number>()
    for (const t of sectionTiles) {
      colorCounts.set(t.color, (colorCounts.get(t.color) || 0) + 1)
    }
    const dominantColor = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'utility'

    const coherence = computeSectionCoherence(sectionTiles)
    const completeness = computeSectionCompleteness(sectionTiles)
    const condition = classifySectionCondition(coherence, completeness)

    sections.push({ name, tiles: sectionTiles, dominantColor, coherence, completeness, condition })
  }

  return sections
}

// ─── Section Coherence ─────────────────────────────────────────────────────────

/**
 * Compute section coherence (how well tiles fit together 0-100).
 *
 * @example
 * computeSectionCoherence(tiles)
 */
export function computeSectionCoherence(tiles: Tile[]): number {
  if (tiles.length === 0) return 0

  const colors = new Set(tiles.map((t) => t.color))
  const colorUniformity = 100 - (colors.size - 1) * 15

  const avgBrightness = tiles.reduce((s, t) => s + t.brightness, 0) / tiles.length
  const brightnessVariance = tiles.reduce((s, t) => s + Math.pow(t.brightness - avgBrightness, 2), 0) / tiles.length
  const brightnessConsistency = Math.max(0, 100 - Math.sqrt(brightnessVariance))

  const conditionScores: Record<string, number> = { pristine: 100, good: 80, worn: 60, damaged: 30, missing: 0 }
  const avgCondition = tiles.reduce((s, t) => s + (conditionScores[t.condition] ?? 50), 0) / tiles.length

  return Math.round(
    Math.max(0, Math.min(100, colorUniformity * 0.2 + brightnessConsistency * 0.3 + avgCondition * 0.5)),
  )
}

// ─── Section Completeness ──────────────────────────────────────────────────────

/**
 * Compute section completeness (% of expected tiles present).
 *
 * @example
 * computeSectionCompleteness(tiles)
 */
export function computeSectionCompleteness(tiles: Tile[]): number {
  if (tiles.length === 0) return 0

  const hasTests = tiles.some((t) => t.color === 'test')
  const nonTestTiles = tiles.filter((t) => t.color !== 'test')
  const nonTestCount = nonTestTiles.length

  if (nonTestCount === 0) return 100

  let score = 60
  if (hasTests) score += 25
  if (nonTestCount >= 3) score += 10
  if (tiles.every((t) => t.condition !== 'missing')) score += 5

  return Math.min(100, score)
}

// ─── Section Condition ─────────────────────────────────────────────────────────

/**
 * Classify section condition from coherence and completeness.
 *
 * @example
 * classifySectionCondition(80, 90)
 */
export function classifySectionCondition(coherence: number, completeness: number): SectionCondition {
  const combined = coherence * 0.6 + completeness * 0.4
  if (combined >= 80) return 'masterpiece'
  if (combined >= 60) return 'gallery'
  if (combined >= 40) return 'workshop'
  if (combined >= 20) return 'construction'
  return 'ruins'
}

// ─── Composition ───────────────────────────────────────────────────────────────

/**
 * Compute overall composition score 0-100.
 *
 * @example
 * computeComposition(tiles, sections)
 */
export function computeComposition(tiles: Tile[], sections: MosaicSection[]): number {
  if (tiles.length === 0) return 0

  const avgBrightness = tiles.reduce((s, t) => s + t.brightness, 0) / tiles.length
  const avgCoherence = sections.length > 0 ? sections.reduce((s, sec) => s + sec.coherence, 0) / sections.length : 50

  const goodCondition = tiles.filter((t) => t.condition === 'pristine' || t.condition === 'good').length
  const conditionRatio = goodCondition / tiles.length

  const connectedTiles = tiles.filter((t) => t.edges.length > 0).length
  const connectivity = tiles.length > 1 ? connectedTiles / tiles.length : 0.5

  return Math.round(
    Math.max(0, Math.min(100, avgBrightness * 0.25 + avgCoherence * 0.3 + conditionRatio * 100 * 0.25 + connectivity * 100 * 0.2)),
  )
}

// ─── Pattern Diversity ─────────────────────────────────────────────────────────

/**
 * Compute Shannon diversity of pattern palette.
 *
 * @example
 * computePatternDiversity({ utility: 5, test: 3, core: 2 })
 */
export function computePatternDiversity(palette: Record<string, number>): number {
  const values = Object.values(palette)
  if (values.length === 0) return 0

  const total = values.reduce((s, v) => s + v, 0)
  if (total === 0) return 0

  let entropy = 0
  for (const count of values) {
    if (count > 0) {
      const p = count / total
      entropy -= p * Math.log2(p)
    }
  }

  const maxEntropy = Math.log2(values.length)
  return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate mosaic recommendations.
 *
 * @example
 * generateRecommendations(tiles, sections, stats)
 */
export function generateRecommendations(tiles: Tile[], sections: MosaicSection[], stats: MosaicStats): string[] {
  const recs: string[] = []

  const damaged = tiles.filter((t) => t.condition === 'damaged')
  if (damaged.length > 0) {
    recs.push(`${damaged.length} damaged tile(s) need repair — improve code quality in: ${damaged.slice(0, 3).map((t) => t.file).join(', ')}`)
  }

  if (stats.missingCount > 0) {
    recs.push(`${stats.missingCount} missing tile(s) detected — add test files or missing modules`)
  }

  const lowCoherence = sections.filter((s) => s.coherence < 40)
  if (lowCoherence.length > 0) {
    recs.push(`${lowCoherence.length} section(s) have low coherence — unify patterns in: ${lowCoherence.map((s) => s.name).join(', ')}`)
  }

  const ruins = sections.filter((s) => s.condition === 'ruins')
  if (ruins.length > 0) {
    recs.push(`${ruins.length} section(s) in ruins condition — consider rebuilding: ${ruins.map((s) => s.name).join(', ')}`)
  }

  if (stats.patternDiversity < 30) {
    recs.push('Low pattern diversity — the mosaic lacks variety, consider introducing different tile types')
  }

  if (stats.overallComposition > 75) {
    recs.push('The mosaic composition is strong — maintain current quality standards')
  } else if (stats.overallComposition < 40) {
    recs.push('Overall composition is weak — focus on improving tile brightness and section coherence')
  }

  if (recs.length === 0) {
    recs.push('The mosaic is well-composed with good tile quality and section coherence')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete mosaic result.
 *
 * @example
 * buildMosaicResult(['a.ts'], ['code'], {})
 */
export function buildMosaicResult(files: string[], contents: string[], _options?: Record<string, unknown>): MosaicResult {
  if (files.length === 0) {
    const emptyStats: MosaicStats = {
      totalTiles: 0, pristineCount: 0, damagedCount: 0, missingCount: 0,
      avgBrightness: 0, avgCoherence: 0, sectionCount: 0,
      masterpieceSections: 0, ruinsSections: 0, overallComposition: 0,
      dominantPattern: 'none', patternDiversity: 0,
    }
    return { tiles: [], sections: [], palette: {}, stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const tiles: Tile[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const color = classifyTileColor(file, content)
    const brightness = computeBrightness(content)
    const size = content.split('\n').length
    const position = computePosition(file, files)
    const edges = findEdges(file, content, files)
    const condition = computeTileCondition(brightness)

    return { file, color, brightness, size, position, edges, condition }
  })

  const missingTiles = findMissingTiles(files)
  tiles.push(...missingTiles)

  const sections = groupIntoSections(tiles, files)

  const palette: Record<string, number> = {}
  for (const tile of tiles) {
    palette[tile.color] = (palette[tile.color] || 0) + 1
  }

  const pristineCount = tiles.filter((t) => t.condition === 'pristine').length
  const damagedCount = tiles.filter((t) => t.condition === 'damaged').length
  const missingCount = tiles.filter((t) => t.condition === 'missing').length
  const avgBrightness = Math.round(tiles.reduce((s, t) => s + t.brightness, 0) / tiles.length)
  const avgCoherence = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.coherence, 0) / sections.length) : 0
  const masterpieceSections = sections.filter((s) => s.condition === 'masterpiece').length
  const ruinsSections = sections.filter((s) => s.condition === 'ruins').length

  const overallComposition = computeComposition(tiles, sections)
  const dominantPattern = Object.entries(palette).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none'
  const patternDiversity = computePatternDiversity(palette)

  const stats: MosaicStats = {
    totalTiles: tiles.length,
    pristineCount,
    damagedCount,
    missingCount,
    avgBrightness,
    avgCoherence,
    sectionCount: sections.length,
    masterpieceSections,
    ruinsSections,
    overallComposition,
    dominantPattern,
    patternDiversity,
  }

  const recommendations = generateRecommendations(tiles, sections, stats)

  return { tiles, sections, palette, stats, recommendations }
}

/**
 * Find missing tiles (e.g., source files without corresponding tests).
 *
 * @example
 * findMissingTiles(['src/a.ts', 'src/b.ts'])
 */
export function findMissingTiles(files: string[]): Tile[] {
  const missing: Tile[] = []
  const testFiles = new Set(files.filter((f) => /\.(test|spec)\./.test(f) || /^test/.test(f)))

  for (const file of files) {
    if (file.includes('.test.') || file.includes('.spec.') || file.startsWith('test')) continue

    const base = file.replace(/\.(ts|tsx|js|jsx)$/, '')
    const hasTest = testFiles.has(base + '.test.ts') || testFiles.has(base + '.spec.ts') ||
      files.some((f) => f === base.replace(/^src\//, 'test/') + '.test.ts')

    if (!hasTest && !file.endsWith('.json') && !file.endsWith('.yaml') && !file.includes('config')) {
      missing.push({
        file: base + '.test.ts',
        color: 'test',
        brightness: 0,
        size: 0,
        position: [0, 0],
        edges: [],
        condition: 'missing',
      })
    }
  }

  return missing
}
