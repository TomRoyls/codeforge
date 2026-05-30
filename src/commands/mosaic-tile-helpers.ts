// ─── Types ──────────────────────────────────────────────────────────────────────

export type TileShape = 'square' | 'rectangle' | 'hexagonal' | 'triangle' | 'irregular' | 'oversized' | 'fragment'
export type EdgeDirection = 'top' | 'bottom' | 'left' | 'right'
export type EdgeType = 'imports' | 'exports' | 'calls' | 'inherits' | 'implements'
export type EdgeQuality = 'clean' | 'rough' | 'chipped' | 'broken'
export type IssueType = 'oversized' | 'undersized' | 'misshapen' | 'chipped' | 'wrong-color' | 'loose' | 'duplicated' | 'cracked'
export type IssueSeverity = 'cosmetic' | 'minor' | 'major' | 'structural'
export type TileGrade = 'masterpiece-tile' | 'quality-tile' | 'standard-tile' | 'rough-tile' | 'reject'
export type GroutAlignment = 'perfect' | 'aligned' | 'offset' | 'misaligned'
export type OverallGrade = 'masterwork-mosaic' | 'quality-composition' | 'standard-tiling' | 'rough-patchwork' | 'broken-mosaic'

export interface TileEdge {
  direction: EdgeDirection
  type: EdgeType
  target: string
  quality: EdgeQuality
  groutWidth: number
}

export interface TileIssue {
  type: IssueType
  description: string
  severity: IssueSeverity
  fix: string
}

export interface Tile {
  file: string
  shape: TileShape
  size: number
  color: string
  edges: TileEdge[]
  fitScore: number
  beautyScore: number
  contributionScore: number
  issues: TileIssue[]
  grade: TileGrade
}

export interface TilePattern {
  name: string
  tiles: string[]
  consistency: number
  isGroutAligned: boolean
}

export interface GroutAnalysis {
  file: string
  neighborFile: string
  groutQuality: number
  alignment: GroutAlignment
  gaps: number
  overlaps: number
  description: string
}

export interface MosaicTileStats {
  totalTiles: number
  avgSize: number
  avgFitScore: number
  avgBeautyScore: number
  avgContributionScore: number
  masterpieceTiles: number
  rejectTiles: number
  totalIssues: number
  oversizedTiles: number
  chippedTiles: number
  looseTiles: number
  duplicatedTiles: number
  totalPatterns: number
  alignedPatterns: number
  avgGroutQuality: number
  misalignedGrout: number
  tileDiversity: number
  groutIntegrity: number
  mosaicFitness: number
  overallGrade: OverallGrade
}

export interface MosaicTileResult {
  tiles: Tile[]
  patterns: TilePattern[]
  grout: GroutAnalysis[]
  stats: MosaicTileStats
  recommendations: string[]
}

// ─── classifyShape ──────────────────────────────────────────────────────────────

/**
 * Classify tile shape based on code structure
 * @example
 * classifyShape('export function f() {}', 'a.ts') // 'square'
 */
export function classifyShape(content: string, _filePath: string): TileShape {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  const exports = (content.match(/export\s/g) || []).length
  const imports = (content.match(/import\s/g) || []).length
  const functions = (content.match(/function\s|=>/g) || []).length
  const classes = (content.match(/class\s+\w+/g) || []).length
  const interfaces = (content.match(/interface\s+\w+/g) || []).length

  if (lines > 300) return 'oversized'
  if (lines < 5 && exports < 2) return 'fragment'

  const totalSymbols = functions + classes + interfaces
  const exportRatio = exports / Math.max(1, totalSymbols)
  const importRatio = imports / Math.max(1, totalSymbols)

  if (exports >= 5 && imports >= 3 && totalSymbols >= 5) return 'hexagonal'
  if (Math.abs(exportRatio - importRatio) < 0.3 && totalSymbols > 0) return 'square'
  if (exportRatio > 0.7 || importRatio > 0.7) return 'triangle'
  if (totalSymbols === 0 || (exports === 0 && imports === 0)) return 'irregular'
  return 'rectangle'
}

// ─── detectColor ────────────────────────────────────────────────────────────────

function detectColor(content: string): string {
  if (/class\s+\w+/.test(content) && /export\s+function/.test(content)) return 'mixed-style'
  if (/class\s+\w+/.test(content)) return 'oop'
  if (/export\s+function/.test(content)) return 'functional'
  if (/interface\s+\w+/.test(content) && !/function/.test(content)) return 'declarative'
  if (/export\s+const\s+\w+\s*=/.test(content) && !/function|class/.test(content)) return 'config'
  return 'plain'
}

// ─── analyzeEdges ───────────────────────────────────────────────────────────────

/**
 * Analyze tile edges (interfaces)
 * @example
 * analyzeEdges('import { x } from "./a"', 'b.ts', ['a.ts']) // TileEdge[]
 */
export function analyzeEdges(content: string, _filePath: string, _allFiles: string[]): TileEdge[] {
  const edges: TileEdge[] = []

  const importMatches = content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []
  for (const m of importMatches) {
    const target = m[1] ?? ''
    const idx = m.index ?? 0
    const hasTypes = /import\s+type\s/.test(content.slice(idx, idx + 200))
    edges.push({
      direction: 'top',
      type: 'imports',
      target,
      quality: hasTypes ? 'clean' : 'rough',
      groutWidth: (target.match(/\//g) || []).length + 1,
    })
  }

  const exportMatches = content.matchAll(/export\s+(?:function|class|const|interface|type)\s+(\w+)/g) || []
  for (const m of exportMatches) {
    const idx = m.index ?? 0
    const hasDocs = content.slice(Math.max(0, idx - 50), idx).includes('/**')
    edges.push({
      direction: 'bottom',
      type: 'exports',
      target: m[1] ?? '',
      quality: hasDocs ? 'clean' : 'chipped',
      groutWidth: 1,
    })
  }

  const classMatches = content.matchAll(/class\s+\w+\s+extends\s+(\w+)/g) || []
  for (const m of classMatches) {
    edges.push({
      direction: 'left',
      type: 'inherits',
      target: m[1] ?? '',
      quality: 'clean',
      groutWidth: 1,
    })
  }

  const implMatches = content.matchAll(/class\s+\w+\s+implements\s+(\w+)/g) || []
  for (const m of implMatches) {
    edges.push({
      direction: 'right',
      type: 'implements',
      target: m[1] ?? '',
      quality: 'clean',
      groutWidth: 1,
    })
  }

  return edges
}

// ─── detectTileIssues ───────────────────────────────────────────────────────────

/**
 * Detect tile issues
 * @example
 * detectTileIssues('const x = 1', 'a.ts') // TileIssue[]
 */
export function detectTileIssues(content: string, _filePath: string): TileIssue[] {
  const issues: TileIssue[] = []
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  if (codeLines.length > 300) {
    issues.push({
      type: 'oversized',
      description: `Tile has ${codeLines.length} lines - too many responsibilities`,
      severity: 'major',
      fix: 'Split into focused modules with fewer responsibilities',
    })
  }

  if (codeLines.length < 5 && !/import/.test(content)) {
    issues.push({
      type: 'undersized',
      description: `Tile has only ${codeLines.length} lines - may not justify separate file`,
      severity: 'minor',
      fix: 'Consider merging with a related module',
    })
  }

  const exports = (content.match(/export\s/g) || []).length
  const imports = (content.match(/import\s/g) || []).length
  const hasAny = /:\s*any\b/.test(content)

  if (hasAny) {
    issues.push({
      type: 'cracked',
      description: 'Uses `any` type - structural weakness in tile',
      severity: 'major',
      fix: 'Replace `any` with proper type definitions',
    })
  }

  const documentedExports = (content.match(/\/\*\*[\s\S]*?\*\/\s*export/g) || []).length
  if (exports > 3 && documentedExports === 0) {
    issues.push({
      type: 'chipped',
      description: `${exports} exports with no JSDoc documentation`,
      severity: 'minor',
      fix: 'Add JSDoc documentation to exported symbols',
    })
  }

  if (exports === 0 && imports === 0 && codeLines.length > 5) {
    issues.push({
      type: 'loose',
      description: 'No exports or imports - tile is disconnected from mosaic',
      severity: 'major',
      fix: 'Export functionality or integrate with other modules',
    })
  }

  const hasVar = /\bvar\s/.test(content)
  const hasConst = /\bconst\s/.test(content)
  if (hasVar && hasConst) {
    issues.push({
      type: 'wrong-color',
      description: 'Mixed var and const declarations - inconsistent style',
      severity: 'cosmetic',
      fix: 'Use const/let consistently, avoid var',
    })
  }

  const avgLineLen = codeLines.reduce((s, l) => s + l.length, 0) / Math.max(1, codeLines.length)
  if (avgLineLen > 120) {
    issues.push({
      type: 'misshapen',
      description: `Average line length ${Math.round(avgLineLen)} - irregular shape`,
      severity: 'minor',
      fix: 'Break long lines for better readability',
    })
  }

  return issues
}

// ─── computeFitScore ────────────────────────────────────────────────────────────

function computeFitScore(edges: TileEdge[], _content: string): number {
  let score = 40
  const imports = edges.filter(e => e.type === 'imports').length
  const exports = edges.filter(e => e.type === 'exports').length

  if (imports > 0 && exports > 0) score += 20
  else if (imports > 0 || exports > 0) score += 10

  const cleanEdges = edges.filter(e => e.quality === 'clean').length
  const totalEdges = edges.length
  if (totalEdges > 0) score += Math.round((cleanEdges / totalEdges) * 30)

  if (exports > 0 && imports > 0) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeBeautyScore ─────────────────────────────────────────────────────────

function computeBeautyScore(content: string): number {
  let score = 35
  const hasDocs = /\/\*\*/.test(content)
  if (hasDocs) score += 15

  const hasTypes = /:\s*(string|number|boolean|void|Promise)/.test(content)
  if (hasTypes) score += 10

  const hasConst = /\bconst\s/.test(content)
  if (hasConst) score += 10

  const lines = content.split('\n')
  const avgLen = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)
  if (avgLen < 80) score += 10

  const hasErrorHandling = /try\s*\{|catch\s*\(/.test(content)
  if (hasErrorHandling) score += 10

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeContributionScore ───────────────────────────────────────────────────

function computeContributionScore(content: string): number {
  let score = 30
  const exports = (content.match(/export\s+(function|class|const|interface|type)/g) || []).length
  score += Math.min(30, exports * 10)

  const hasTests = /test\(|describe\(|it\(|expect\(/.test(content)
  if (hasTests) score += 20

  const hasDocs = /\/\*\*/.test(content)
  if (hasDocs) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── classifyTileGrade ──────────────────────────────────────────────────────────

/**
 * Classify tile grade
 * @example
 * classifyTileGrade(80, 75, 0) // 'masterpiece-tile'
 */
export function classifyTileGrade(fitScore: number, beautyScore: number, issueCount: number): TileGrade {
  const avg = (fitScore + beautyScore) / 2
  if (avg >= 75 && issueCount === 0) return 'masterpiece-tile'
  if (avg >= 60 && issueCount <= 1) return 'quality-tile'
  if (avg >= 45 && issueCount <= 3) return 'standard-tile'
  if (avg >= 30) return 'rough-tile'
  return 'reject'
}

// ─── analyzeTile ────────────────────────────────────────────────────────────────

/**
 * Analyze a single tile
 * @example
 * analyzeTile('export function f() {}', 'a.ts', ['a.ts']) // Tile
 */
export function analyzeTile(content: string, filePath: string, allFiles: string[]): Tile {
  const shape = classifyShape(content, filePath)
  const size = content.split('\n').filter(l => l.trim().length > 0).length
  const color = detectColor(content)
  const edges = analyzeEdges(content, filePath, allFiles)
  const issues = detectTileIssues(content, filePath)
  const fitScore = computeFitScore(edges, content)
  const beautyScore = computeBeautyScore(content)
  const contributionScore = computeContributionScore(content)
  const grade = classifyTileGrade(fitScore, beautyScore, issues.length)

  return {
    file: filePath,
    shape,
    size,
    color,
    edges,
    fitScore,
    beautyScore,
    contributionScore,
    issues,
    grade,
  }
}

// ─── analyzeGrout ───────────────────────────────────────────────────────────────

/**
 * Analyze grout between two tiles
 * @example
 * analyzeGrout(tileA, tileB) // GroutAnalysis
 */
export function analyzeGrout(tile: Tile, neighbor: Tile): GroutAnalysis {
  const tileExports = tile.edges.filter(e => e.type === 'exports').map(e => e.target)
  const neighborImports = neighbor.edges.filter(e => e.type === 'imports').map(e => e.target)

  const gaps = tileExports.filter(e => !neighborImports.includes(e)).length
  const overlaps = neighborImports.filter(i => !tileExports.includes(i) && i !== '').length

  const cleanEdges = [...tile.edges, ...neighbor.edges].filter(e => e.quality === 'clean').length
  const totalEdges = tile.edges.length + neighbor.edges.length
  const groutQuality = totalEdges > 0 ? Math.round((cleanEdges / totalEdges) * 100) : 50

  let alignment: GroutAlignment = 'offset'
  if (gaps === 0 && overlaps === 0 && groutQuality >= 80) alignment = 'perfect'
  else if (gaps <= 1 && overlaps <= 1 && groutQuality >= 60) alignment = 'aligned'
  else if (gaps > 2 || overlaps > 2) alignment = 'misaligned'

  const description = gaps > 0 ? `${gaps} gap(s) in grout` : overlaps > 0 ? `${overlaps} overlap(s) detected` : 'Grout well-sealed'

  return {
    file: tile.file,
    neighborFile: neighbor.file,
    groutQuality,
    alignment,
    gaps,
    overlaps,
    description,
  }
}

// ─── findTilePatterns ───────────────────────────────────────────────────────────

/**
 * Find repeating tile patterns
 * @example
 * findTilePatterns(tiles) // TilePattern[]
 */
export function findTilePatterns(tiles: Tile[]): TilePattern[] {
  const patterns: TilePattern[] = []

  const colorGroups = new Map<string, Tile[]>()
  for (const t of tiles) {
    const group = colorGroups.get(t.color) || []
    group.push(t)
    colorGroups.set(t.color, group)
  }

  for (const [color, group] of colorGroups) {
    if (group.length >= 2) {
      const avgFit = group.reduce((s, t) => s + t.fitScore, 0) / group.length
      const allClean = group.every(t => t.edges.every(e => e.quality === 'clean' || e.quality === 'rough'))
      patterns.push({
        name: `${color}-pattern`,
        tiles: group.map(t => t.file),
        consistency: Math.round(avgFit),
        isGroutAligned: allClean,
      })
    }
  }

  const shapeGroups = new Map<string, Tile[]>()
  for (const t of tiles) {
    const group = shapeGroups.get(t.shape) || []
    group.push(t)
    shapeGroups.set(t.shape, group)
  }

  for (const [shape, group] of shapeGroups) {
    if (group.length >= 3) {
      patterns.push({
        name: `${shape}-cluster`,
        tiles: group.map(t => t.file),
        consistency: Math.round(group.reduce((s, t) => s + t.beautyScore, 0) / group.length),
        isGroutAligned: true,
      })
    }
  }

  return patterns
}

// ─── computeTileDiversity ───────────────────────────────────────────────────────

/**
 * Compute tile diversity 0-100
 * @example
 * computeTileDiversity(tiles) // 75
 */
export function computeTileDiversity(tiles: Tile[]): number {
  if (tiles.length === 0) return 50
  const shapes = Array.from(new Set(tiles.map(t => t.shape)))
  const colors = Array.from(new Set(tiles.map(t => t.color)))
  const shapeDiversity = Math.min(100, shapes.length * 15)
  const colorDiversity = Math.min(100, colors.length * 20)
  return Math.round((shapeDiversity + colorDiversity) / 2)
}

// ─── computeGroutIntegrity ──────────────────────────────────────────────────────

/**
 * Compute grout integrity 0-100
 * @example
 * computeGroutIntegrity(grout) // 70
 */
export function computeGroutIntegrity(grout: GroutAnalysis[]): number {
  if (grout.length === 0) return 75
  return Math.round(grout.reduce((s, g) => s + g.groutQuality, 0) / grout.length)
}

// ─── computeMosaicFitness ───────────────────────────────────────────────────────

/**
 * Compute mosaic fitness 0-100
 * @example
 * computeMosaicFitness(tiles, grout) // 65
 */
export function computeMosaicFitness(tiles: Tile[], grout: GroutAnalysis[]): number {
  if (tiles.length === 0) return 50
  const avgFit = tiles.reduce((s, t) => s + t.fitScore, 0) / tiles.length
  const avgBeauty = tiles.reduce((s, t) => s + t.beautyScore, 0) / tiles.length
  const groutAvg = grout.length > 0
    ? grout.reduce((s, g) => s + g.groutQuality, 0) / grout.length
    : 75
  return Math.round(avgFit * 0.4 + avgBeauty * 0.3 + groutAvg * 0.3)
}

// ─── classifyOverall ────────────────────────────────────────────────────────────

/**
 * Classify overall mosaic grade
 * @example
 * classifyOverall(80, 75, 2) // 'masterwork-mosaic'
 */
export function classifyOverall(fitness: number, groutIntegrity: number, issues: number): OverallGrade {
  const avg = (fitness + groutIntegrity) / 2
  if (avg >= 75 && issues <= 3) return 'masterwork-mosaic'
  if (avg >= 60 && issues <= 8) return 'quality-composition'
  if (avg >= 45) return 'standard-tiling'
  if (avg >= 30) return 'rough-patchwork'
  return 'broken-mosaic'
}

// ─── generateRecommendations ────────────────────────────────────────────────────

/**
 * Generate mosaic tile recommendations
 * @example
 * generateRecommendations(tiles, patterns, grout, stats) // string[]
 */
export function generateRecommendations(
  tiles: Tile[],
  _patterns: TilePattern[],
  grout: GroutAnalysis[],
  stats: MosaicTileStats,
): string[] {
  const recs: string[] = []

  const oversized = tiles.filter(t => t.issues.some(i => i.type === 'oversized'))
  if (oversized.length > 0) {
    recs.push(`Split ${oversized.length} oversized tile(s) into focused modules`)
  }

  const chipped = tiles.filter(t => t.issues.some(i => i.type === 'chipped'))
  if (chipped.length > 0) {
    recs.push(`Complete interfaces for ${chipped.length} chipped tile(s)`)
  }

  const misaligned = grout.filter(g => g.alignment === 'misaligned')
  if (misaligned.length > 0) {
    recs.push(`Align interfaces in ${misaligned.length} misaligned grout connection(s)`)
  }

  const loose = tiles.filter(t => t.issues.some(i => i.type === 'loose'))
  if (loose.length > 0) {
    recs.push(`Connect or integrate ${loose.length} loose tile(s)`)
  }

  const cracked = tiles.filter(t => t.issues.some(i => i.type === 'cracked'))
  if (cracked.length > 0) {
    recs.push(`Fix structural issues in ${cracked.length} cracked tile(s)`)
  }

  if (stats.mosaicFitness < 40) {
    recs.push('Low mosaic fitness - improve tile cohesion and interface quality')
  }

  if (stats.groutIntegrity < 40) {
    recs.push('Low grout integrity - review module boundaries and interfaces')
  }

  if (stats.rejectTiles > stats.totalTiles * 0.3 && stats.totalTiles > 0) {
    recs.push('High reject rate - consider comprehensive refactoring')
  }

  return Array.from(new Set(recs))
}

// ─── buildMosaicTileResult ──────────────────────────────────────────────────────

/**
 * Build complete mosaic tile analysis result
 * @example
 * buildMosaicTileResult(['a.ts'], ['export function f() {}'], {}) // MosaicTileResult
 */
export function buildMosaicTileResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MosaicTileResult {
  const tiles: Tile[] = []

  for (let i = 0; i < files.length; i++) {
    tiles.push(analyzeTile(contents[i] ?? '', files[i] ?? '', files))
  }

  const patterns = findTilePatterns(tiles)

  const grout: GroutAnalysis[] = []
  for (let i = 0; i < tiles.length; i++) {
    const tileA = tiles[i]
    if (!tileA) continue
    for (let j = i + 1; j < tiles.length; j++) {
      const tileB = tiles[j]
      if (!tileB) continue
      const hasConnection = tileA.edges.some(e =>
        tileB.edges.some(e2 => e.target === e2.target)
      )
      if (hasConnection) {
        grout.push(analyzeGrout(tileA, tileB))
      }
    }
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const allIssues = tiles.flatMap(t => t.issues)
  const masterpieceTiles = tiles.filter(t => t.grade === 'masterpiece-tile').length
  const rejectTiles = tiles.filter(t => t.grade === 'reject').length
  const oversizedTiles = allIssues.filter(i => i.type === 'oversized').length
  const chippedTiles = allIssues.filter(i => i.type === 'chipped').length
  const looseTiles = allIssues.filter(i => i.type === 'loose').length
  const duplicatedTiles = allIssues.filter(i => i.type === 'duplicated').length

  const tileDiversity = computeTileDiversity(tiles)
  const groutIntegrity = computeGroutIntegrity(grout)
  const mosaicFitness = computeMosaicFitness(tiles, grout)
  const overallGrade = classifyOverall(mosaicFitness, groutIntegrity, allIssues.length)

  const stats: MosaicTileStats = {
    totalTiles: tiles.length,
    avgSize: avg(tiles.map(t => t.size)),
    avgFitScore: avg(tiles.map(t => t.fitScore)),
    avgBeautyScore: avg(tiles.map(t => t.beautyScore)),
    avgContributionScore: avg(tiles.map(t => t.contributionScore)),
    masterpieceTiles,
    rejectTiles,
    totalIssues: allIssues.length,
    oversizedTiles,
    chippedTiles,
    looseTiles,
    duplicatedTiles,
    totalPatterns: patterns.length,
    alignedPatterns: patterns.filter(p => p.isGroutAligned).length,
    avgGroutQuality: grout.length > 0 ? avg(grout.map(g => g.groutQuality)) : 75,
    misalignedGrout: grout.filter(g => g.alignment === 'misaligned').length,
    tileDiversity,
    groutIntegrity,
    mosaicFitness,
    overallGrade,
  }

  const recommendations = generateRecommendations(tiles, patterns, grout, stats)

  return { tiles, patterns, grout, stats, recommendations }
}
