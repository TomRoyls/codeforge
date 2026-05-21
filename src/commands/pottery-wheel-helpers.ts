// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PieceShape {
  height: number
  width: number
  rim: number
  base: number
  belly: number
  neck: number
}

export interface PieceWalls {
  uniformity: number
  thickness: number
  hasThinSpots: boolean
  hasThickSpots: boolean
  thinSpotCount: number
  thickSpotCount: number
}

export interface PieceSurface {
  smoothness: number
  hasGlaze: boolean
  glazeQuality: number
  hasCracks: boolean
  hasChips: boolean
  hasBlemishes: boolean
  crackCount: number
  chipCount: number
  blemishCount: number
}

export interface WheelMarks {
  fingerTraces: number
  toolMarks: number
  waterMarks: number
  clayResidue: number
}

export interface PieceFiring {
  temperature: number
  duration: number
  result: 'perfect' | 'good' | 'under-fired' | 'over-fired' | 'cracked' | 'exploded'
}

export interface ThrownPiece {
  file: string
  centering: number
  wallUniformity: number
  surfaceSmoothness: number
  proportion: number
  structuralIntegrity: number
  throwingTechnique: number
  form: 'bowl' | 'vase' | 'plate' | 'cup' | 'pitcher' | 'jar' | 'urn' | 'sculpture'
  clayType: 'porcelain' | 'stoneware' | 'earthenware' | 'terracotta' | 'raku' | 'bone-china'
  throwingStyle: 'wheel-thrown' | 'hand-built' | 'slip-cast' | 'coil-built' | 'slab-built' | 'pinch-pot'
  shape: PieceShape
  walls: PieceWalls
  surface: PieceSurface
  wheelMarks: WheelMarks
  firing: PieceFiring
  craftsmanship: 'master' | 'artisan' | 'journeyman' | 'apprentice' | 'student' | 'beginner'
  condition: 'pristine' | 'excellent' | 'good' | 'fair' | 'chipped' | 'cracked' | 'shattered'
  qualityScore: number
  issues: string[]
  highlights: string[]
}

export interface PotteryBatch {
  directory: string
  pieces: ThrownPiece[]
  avgCentering: number
  avgWallUniformity: number
  avgSurfaceSmoothness: number
  avgProportion: number
  avgStructuralIntegrity: number
  avgTechnique: number
  dominantForm: string
  dominantClay: string
  dominantStyle: string
  masterCount: number
  beginnerCount: number
  pristineCount: number
  shatteredCount: number
  totalCracks: number
  totalChips: number
  totalBlemishes: number
  avgFiringResult: string
  batchQuality: number
  kilnCondition: 'optimal' | 'good' | 'adequate' | 'poor' | 'broken'
}

export interface PotteryWheelStats {
  totalFiles: number
  totalBatches: number
  avgCentering: number
  avgWallUniformity: number
  avgSurfaceSmoothness: number
  avgProportion: number
  avgStructuralIntegrity: number
  avgTechnique: number
  masterCraftsman: number
  beginnerCraftsman: number
  pristinePieces: number
  shatteredPieces: number
  porcelainCount: number
  earthenwareCount: number
  wheelThrownCount: number
  handBuiltCount: number
  totalCracks: number
  totalChips: number
  totalBlemishes: number
  perfectFiring: number
  crackedFiring: number
  overallQuality: number
  wheelGrade: 'master-potter' | 'artisan' | 'journeyman' | 'apprentice' | 'student' | 'beginner'
  bestPiece: string
  worstPiece: string
  mostCentered: string
  smoothestPiece: string
  bestProportioned: string
}

export interface PotteryWheelResult {
  pieces: ThrownPiece[]
  batches: PotteryBatch[]
  stats: PotteryWheelStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const GENERIC_RE = /<\w+(\s+extends\s+\w+)?>/g
const TEST_RE = /(?:describe|it|test)\s*\(/g
const TRY_CATCH_RE = /try\s*\{/g
const ARROW_RE = /=>\s*[{(]/g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify form from code structure
 * @example
 * classifyForm(3, 5, 2) // 'vase'
 */
export function classifyForm(classes: number, functions: number, interfaces: number): ThrownPiece['form'] {
  if (classes >= 3 && interfaces >= 2) return 'urn'
  if (classes >= 2 && functions >= 5) return 'vase'
  if (functions >= 5 && classes === 0) return 'pitcher'
  if (classes >= 1 && interfaces >= 1) return 'jar'
  if (classes >= 2) return 'sculpture'
  if (functions >= 3) return 'bowl'
  if (functions >= 1 || classes >= 1) return 'cup'
  return 'plate'
}

/**
 * Classify clay type from quality score
 * @example
 * classifyClayType(90) // 'porcelain'
 */
export function classifyClayType(quality: number): ThrownPiece['clayType'] {
  if (quality >= 85) return 'porcelain'
  if (quality >= 70) return 'bone-china'
  if (quality >= 55) return 'stoneware'
  if (quality >= 40) return 'earthenware'
  if (quality >= 25) return 'terracotta'
  return 'raku'
}

/**
 * Classify throwing style from implementation approach
 * @example
 * classifyThrowingStyle(3, 5, 2) // 'wheel-thrown'
 */
export function classifyThrowingStyle(generics: number, exports: number, classes: number): ThrownPiece['throwingStyle'] {
  if (generics >= 3 && exports >= 3) return 'wheel-thrown'
  if (classes >= 3) return 'slip-cast'
  if (exports >= 5) return 'coil-built'
  if (generics >= 1 && classes >= 1) return 'hand-built'
  if (exports >= 2) return 'slab-built'
  return 'pinch-pot'
}

/**
 * Classify craftsmanship from quality score
 * @example
 * classifyCraftsmanship(90) // 'master'
 */
export function classifyCraftsmanship(quality: number): ThrownPiece['craftsmanship'] {
  if (quality >= 85) return 'master'
  if (quality >= 70) return 'artisan'
  if (quality >= 55) return 'journeyman'
  if (quality >= 40) return 'apprentice'
  if (quality >= 20) return 'student'
  return 'beginner'
}

/**
 * Classify wheel grade from overall quality
 * @example
 * classifyWheelGrade(85) // 'master-potter'
 */
export function classifyWheelGrade(avgQuality: number): PotteryWheelStats['wheelGrade'] {
  if (avgQuality >= 85) return 'master-potter'
  if (avgQuality >= 70) return 'artisan'
  if (avgQuality >= 55) return 'journeyman'
  if (avgQuality >= 40) return 'apprentice'
  if (avgQuality >= 20) return 'student'
  return 'beginner'
}

/**
 * Classify condition from quality score and defects
 * @example
 * classifyCondition(90, false) // 'pristine'
 */
export function classifyCondition(quality: number, hasCracks: boolean): ThrownPiece['condition'] {
  if (quality >= 80 && !hasCracks) return 'pristine'
  if (quality >= 65) return 'excellent'
  if (quality >= 50) return 'good'
  if (quality >= 35) return 'fair'
  if (hasCracks && quality < 25) return 'shattered'
  if (hasCracks) return 'cracked'
  return 'chipped'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect thin spots (under-implemented areas)
 * @example
 * detectThinSpots('function f() {}') // { count: 1, present: true }
 */
export function detectThinSpots(content: string): { count: number; present: boolean } {
  let count = 0
  const emptyFunctions = (content.match(/function\s+\w+\s*\(\s*\)\s*\{\s*\}/g) ?? []).length
  count += emptyFunctions
  const anyParams = (content.match(/:\s*any\s*[,)]/g) ?? []).length
  count += anyParams
  return { count, present: count > 0 }
}

/**
 * Detect thick spots (over-engineered areas)
 * @example
 * detectThickSpots(content) // { count: 2, present: true }
 */
export function detectThickSpots(content: string): { count: number; present: boolean } {
  let count = 0
  const deepNesting = (content.match(/\{\s*\{\s*\{/g) ?? []).length
  count += deepNesting
  const longLines = content.split('\n').filter(l => l.length > 150).length
  count += Math.min(3, longLines)
  return { count, present: count > 0 }
}

/**
 * Assess firing (testing quality)
 * @example
 * assessFiring(5, 3) // 'perfect'
 */
export function assessFiring(testRefs: number, tryCatch: number): PieceFiring['result'] {
  const score = testRefs * 2 + tryCatch
  if (score >= 10) return 'perfect'
  if (score >= 6) return 'good'
  if (score >= 3) return 'under-fired'
  if (tryCatch === 0 && testRefs === 0) return 'exploded'
  if (tryCatch > 5 && testRefs < 2) return 'over-fired'
  return 'cracked'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a thrown piece
 * @example
 * analyzeThrownPiece('export function a() {}', 'a.ts') // ThrownPiece
 */
export function analyzeThrownPiece(content: string, filePath: string): ThrownPiece {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const testRefs = (content.match(TEST_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length

  const centering = computeCentering(exports, interfaces + types, jsdoc, anys, codeLines.length)
  const wallUniformity = computeWallUniformity(jsdoc, functions, classes, codeLines.length)
  const surfaceSmoothness = computeSurfaceSmoothness(jsdoc, anys, todos, codeLines.length)
  const proportion = computeProportion(exports, functions + classes, interfaces + types, codeLines.length)
  const structuralIntegrity = computeStructuralIntegrity(tryCatch, anys, todos, jsdoc, codeLines.length)
  const throwingTechnique = computeThrowingTechnique(generics, interfaces, types, arrows, jsdoc, anys, codeLines.length)

  const form = classifyForm(classes, functions, interfaces)
  const clayType = classifyClayType(throwingTechnique)
  const throwingStyle = classifyThrowingStyle(generics, exports, classes)

  const shape = computeShape(codeLines.length, exports, functions, classes, interfaces + types, generics)
  const walls = computeWalls(content, wallUniformity, jsdoc, anys, codeLines.length)
  const surface = computeSurface(content, surfaceSmoothness, jsdoc, anys, todos, consoles)
  const wheelMarks = computeWheelMarks(todos, anys, consoles, codeLines.length)
  const firing = computeFiring(testRefs, tryCatch)

  const qualityScore = computeQualityScore(centering, wallUniformity, surfaceSmoothness, proportion, structuralIntegrity, throwingTechnique)
  const craftsmanship = classifyCraftsmanship(qualityScore)
  const condition = classifyCondition(qualityScore, surface.hasCracks)

  const { issues, highlights } = collectIssuesHighlights(surface, walls, qualityScore, jsdoc, exports)

  return {
    file: filePath,
    centering,
    wallUniformity,
    surfaceSmoothness,
    proportion,
    structuralIntegrity,
    throwingTechnique,
    form,
    clayType,
    throwingStyle,
    shape,
    walls,
    surface,
    wheelMarks,
    firing,
    craftsmanship,
    condition,
    qualityScore,
    issues,
    highlights,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeCentering(exports: number, structural: number, jsdoc: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(20, exports * 3)
  score += Math.min(20, structural * 4)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeWallUniformity(jsdoc: number, functions: number, classes: number, lines: number): number {
  if (lines === 0) return 0
  const consistency = functions > 0 && classes > 0 ? 20 : functions > 0 || classes > 0 ? 10 : 5
  let score = 20 + consistency
  score += Math.min(20, jsdoc * 3)
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeSurfaceSmoothness(jsdoc: number, anys: number, todos: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(25, jsdoc * 4)
  score -= anys * 6
  score -= todos * 4
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeProportion(exports: number, constructs: number, structural: number, lines: number): number {
  if (lines === 0) return 0
  const density = constructs > 0 ? Math.min(30, Math.round(exports / constructs * 20 + 10)) : 10
  const structBonus = Math.min(20, structural * 5)
  return Math.min(100, Math.max(0, density + structBonus + 20))
}

function computeStructuralIntegrity(tryCatch: number, anys: number, todos: number, jsdoc: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(20, tryCatch * 5)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 8
  score -= todos * 4
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeThrowingTechnique(generics: number, interfaces: number, types: number, arrows: number, jsdoc: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 15
  score += Math.min(15, generics * 4)
  score += Math.min(15, (interfaces + types) * 4)
  score += Math.min(10, arrows * 2)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeShape(lines: number, exports: number, functions: number, classes: number, structural: number, generics: number): PieceShape {
  return {
    height: Math.min(100, Math.max(0, lines)),
    width: Math.min(100, (exports + functions + classes) * 5),
    rim: Math.min(100, exports * 8),
    base: Math.min(100, (classes + structural) * 8),
    belly: Math.min(100, functions * 6),
    neck: Math.min(100, generics * 10),
  }
}

function computeWalls(content: string, uniformity: number, jsdoc: number, anys: number, lines: number): PieceWalls {
  const thin = detectThinSpots(content)
  const thick = detectThickSpots(content)
  const thickness = Math.min(100, Math.max(0, Math.round(30 + jsdoc * 3 - anys * 5 + (lines > 0 ? 20 : 0))))
  return {
    uniformity,
    thickness,
    hasThinSpots: thin.present,
    hasThickSpots: thick.present,
    thinSpotCount: thin.count,
    thickSpotCount: thick.count,
  }
}

function computeSurface(content: string, smoothness: number, jsdoc: number, anys: number, todos: number, consoles: number): PieceSurface {
  const hasGlaze = jsdoc >= 2
  const glazeQuality = hasGlaze ? Math.min(100, jsdoc * 12) : 0
  const crackCount = anys
  const chipCount = todos
  const blemishCount = Math.min(10, consoles)

  return {
    smoothness,
    hasGlaze,
    glazeQuality,
    hasCracks: crackCount > 0,
    hasChips: chipCount > 0,
    hasBlemishes: blemishCount > 0,
    crackCount,
    chipCount,
    blemishCount,
  }
}

function computeWheelMarks(todos: number, anys: number, consoles: number, lines: number): WheelMarks {
  return {
    fingerTraces: Math.min(10, anys),
    toolMarks: Math.min(10, todos),
    waterMarks: Math.min(10, consoles),
    clayResidue: Math.min(10, Math.floor((lines > 0 ? 0 : 1) + anys * 0.5)),
  }
}

function computeFiring(testRefs: number, tryCatch: number): PieceFiring {
  const temperature = Math.min(100, (testRefs + tryCatch) * 10)
  const duration = Math.min(100, testRefs * 8 + tryCatch * 5)
  const result = assessFiring(testRefs, tryCatch)
  return { temperature, duration, result }
}

function computeQualityScore(centering: number, uniformity: number, smoothness: number, proportion: number, integrity: number, technique: number): number {
  const raw = centering * 0.2 + uniformity * 0.15 + smoothness * 0.2 + proportion * 0.15 + integrity * 0.15 + technique * 0.15
  return Math.min(100, Math.max(0, Math.round(raw)))
}

function collectIssuesHighlights(surface: PieceSurface, walls: PieceWalls, quality: number, jsdoc: number, exports: number): { issues: string[]; highlights: string[] } {
  const issues: string[] = []
  const highlights: string[] = []

  if (surface.hasCracks) issues.push(`has ${surface.crackCount} crack(s)`)
  if (surface.hasChips) issues.push(`has ${surface.chipCount} chip(s)`)
  if (walls.hasThinSpots) issues.push(`${walls.thinSpotCount} thin spot(s)`)
  if (walls.hasThickSpots) issues.push(`${walls.thickSpotCount} thick spot(s)`)
  if (jsdoc >= 3) highlights.push('well-documented')
  if (exports >= 3 && quality >= 60) highlights.push('strong API surface')
  if (quality >= 80) highlights.push('masterful craftsmanship')

  return { issues, highlights }
}

// ─── Cluster Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a pottery batch
 * @example
 * analyzePotteryBatch(pieces, 'src') // PotteryBatch
 */
export function analyzePotteryBatch(pieces: ThrownPiece[], dirPath: string): PotteryBatch {
  if (pieces.length === 0) {
    return {
      directory: dirPath,
      pieces: [],
      avgCentering: 0,
      avgWallUniformity: 0,
      avgSurfaceSmoothness: 0,
      avgProportion: 0,
      avgStructuralIntegrity: 0,
      avgTechnique: 0,
      dominantForm: 'plate',
      dominantClay: 'raku',
      dominantStyle: 'pinch-pot',
      masterCount: 0,
      beginnerCount: 0,
      pristineCount: 0,
      shatteredCount: 0,
      totalCracks: 0,
      totalChips: 0,
      totalBlemishes: 0,
      avgFiringResult: 'exploded',
      batchQuality: 0,
      kilnCondition: 'broken',
    }
  }

  const n = pieces.length
  const avgCentering = Math.round(pieces.reduce((s, p) => s + p.centering, 0) / n)
  const avgWallUniformity = Math.round(pieces.reduce((s, p) => s + p.wallUniformity, 0) / n)
  const avgSurfaceSmoothness = Math.round(pieces.reduce((s, p) => s + p.surfaceSmoothness, 0) / n)
  const avgProportion = Math.round(pieces.reduce((s, p) => s + p.proportion, 0) / n)
  const avgStructuralIntegrity = Math.round(pieces.reduce((s, p) => s + p.structuralIntegrity, 0) / n)
  const avgTechnique = Math.round(pieces.reduce((s, p) => s + p.throwingTechnique, 0) / n)

  const dominantForm = findDominant(pieces.map(p => p.form))
  const dominantClay = findDominant(pieces.map(p => p.clayType))
  const dominantStyle = findDominant(pieces.map(p => p.throwingStyle))

  const masterCount = pieces.filter(p => p.craftsmanship === 'master').length
  const beginnerCount = pieces.filter(p => p.craftsmanship === 'beginner').length
  const pristineCount = pieces.filter(p => p.condition === 'pristine').length
  const shatteredCount = pieces.filter(p => p.condition === 'shattered').length

  const totalCracks = pieces.reduce((s, p) => s + p.surface.crackCount, 0)
  const totalChips = pieces.reduce((s, p) => s + p.surface.chipCount, 0)
  const totalBlemishes = pieces.reduce((s, p) => s + p.surface.blemishCount, 0)

  const firingResults = pieces.map(p => p.firing.result)
  const avgFiringResult = findDominant(firingResults)

  const batchQuality = Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / n)
  const kilnCondition = classifyKilnCondition(batchQuality)

  return {
    directory: dirPath,
    pieces,
    avgCentering,
    avgWallUniformity,
    avgSurfaceSmoothness,
    avgProportion,
    avgStructuralIntegrity,
    avgTechnique,
    dominantForm,
    dominantClay,
    dominantStyle,
    masterCount,
    beginnerCount,
    pristineCount,
    shatteredCount,
    totalCracks,
    totalChips,
    totalBlemishes,
    avgFiringResult,
    batchQuality,
    kilnCondition,
  }
}

function classifyKilnCondition(quality: number): PotteryBatch['kilnCondition'] {
  if (quality >= 75) return 'optimal'
  if (quality >= 55) return 'good'
  if (quality >= 35) return 'adequate'
  if (quality >= 15) return 'poor'
  return 'broken'
}

function findDominant(items: string[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let dominant = items[0] ?? 'none'
  let max = 0
  for (const [item, count] of counts) {
    if (count > max) { max = count; dominant = item }
  }
  return dominant
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving pottery quality
 * @example
 * generateRecommendations(pieces, batches, stats) // string[]
 */
export function generateRecommendations(
  pieces: ThrownPiece[],
  batches: PotteryBatch[],
  stats: PotteryWheelStats,
): string[] {
  const recs: string[] = []

  const poorCenter = pieces.filter(p => p.centering < 30)
  if (poorCenter.length > 0) recs.push(`${poorCenter.length} piece(s) with poor centering - rebalance concerns`)

  const cracked = pieces.filter(p => p.surface.hasCracks)
  if (cracked.length > 0) recs.push(`${cracked.length} piece(s) with cracks - fix structural issues`)

  const thinWalls = pieces.filter(p => p.walls.hasThinSpots)
  if (thinWalls.length > 0) recs.push(`${thinWalls.length} piece(s) with thin walls - strengthen fragile code`)

  const badFiring = pieces.filter(p => p.firing.result === 'exploded' || p.firing.result === 'cracked')
  if (badFiring.length > 0) recs.push(`${badFiring.length} piece(s) poorly fired - add tests and error handling`)

  const badProp = pieces.filter(p => p.proportion < 25)
  if (badProp.length > 0) recs.push(`${badProp.length} piece(s) with bad proportion - right-size modules`)

  const brokenKilns = batches.filter(b => b.kilnCondition === 'broken' || b.kilnCondition === 'poor')
  if (brokenKilns.length > 0) recs.push(`${brokenKilns.length} batch(es) with poor kiln condition - improve testing practices`)

  if (stats.overallQuality >= 70) {
    recs.push('Quality pottery - the wheel is well-centered and the clay is well-prepared')
  }

  if (recs.length === 0) recs.push('Masterful throwing - all pieces are well-formed and beautifully crafted')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete pottery wheel analysis result
 * @example
 * buildPotteryWheelResult(files, contents, {}) // PotteryWheelResult
 */
export function buildPotteryWheelResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): PotteryWheelResult {
  const pieces: ThrownPiece[] = []
  for (let i = 0; i < files.length; i++) {
    pieces.push(analyzeThrownPiece(contents[i], files[i]))
  }

  const dirMap = new Map<string, ThrownPiece[]>()
  for (const piece of pieces) {
    const normalized = piece.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(piece)
    else dirMap.set(dir, [piece])
  }

  const batches: PotteryBatch[] = []
  for (const [dir, dirPieces] of dirMap) {
    batches.push(analyzePotteryBatch(dirPieces, dir))
  }

  const stats = computeStats(pieces, batches)
  const recommendations = generateRecommendations(pieces, batches, stats)

  return { pieces, batches, stats, recommendations }
}

function computeStats(pieces: ThrownPiece[], batches: PotteryBatch[]): PotteryWheelStats {
  const totalFiles = pieces.length
  const totalBatches = batches.length

  const avgCentering = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.centering, 0) / totalFiles) : 0
  const avgWallUniformity = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.wallUniformity, 0) / totalFiles) : 0
  const avgSurfaceSmoothness = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.surfaceSmoothness, 0) / totalFiles) : 0
  const avgProportion = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.proportion, 0) / totalFiles) : 0
  const avgStructuralIntegrity = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.structuralIntegrity, 0) / totalFiles) : 0
  const avgTechnique = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.throwingTechnique, 0) / totalFiles) : 0

  const masterCraftsman = pieces.filter(p => p.craftsmanship === 'master').length
  const beginnerCraftsman = pieces.filter(p => p.craftsmanship === 'beginner').length
  const pristinePieces = pieces.filter(p => p.condition === 'pristine').length
  const shatteredPieces = pieces.filter(p => p.condition === 'shattered').length

  const porcelainCount = pieces.filter(p => p.clayType === 'porcelain' || p.clayType === 'bone-china').length
  const earthenwareCount = pieces.filter(p => p.clayType === 'earthenware' || p.clayType === 'terracotta' || p.clayType === 'raku').length
  const wheelThrownCount = pieces.filter(p => p.throwingStyle === 'wheel-thrown').length
  const handBuiltCount = pieces.filter(p => p.throwingStyle === 'hand-built' || p.throwingStyle === 'coil-built' || p.throwingStyle === 'slab-built').length

  const totalCracks = pieces.reduce((s, p) => s + p.surface.crackCount, 0)
  const totalChips = pieces.reduce((s, p) => s + p.surface.chipCount, 0)
  const totalBlemishes = pieces.reduce((s, p) => s + p.surface.blemishCount, 0)

  const perfectFiring = pieces.filter(p => p.firing.result === 'perfect').length
  const crackedFiring = pieces.filter(p => p.firing.result === 'cracked' || p.firing.result === 'exploded').length

  const overallQuality = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / totalFiles) : 0
  const wheelGrade = classifyWheelGrade(overallQuality)

  const sortedByQuality = [...pieces].sort((a, b) => b.qualityScore - a.qualityScore)
  const bestPiece = sortedByQuality.length > 0 ? sortedByQuality[0].file : 'none'
  const worstPiece = sortedByQuality.length > 0 ? sortedByQuality[sortedByQuality.length - 1].file : 'none'

  const sortedByCenter = [...pieces].sort((a, b) => b.centering - a.centering)
  const mostCentered = sortedByCenter.length > 0 ? sortedByCenter[0].file : 'none'

  const sortedBySmooth = [...pieces].sort((a, b) => b.surfaceSmoothness - a.surfaceSmoothness)
  const smoothestPiece = sortedBySmooth.length > 0 ? sortedBySmooth[0].file : 'none'

  const sortedByProp = [...pieces].sort((a, b) => b.proportion - a.proportion)
  const bestProportioned = sortedByProp.length > 0 ? sortedByProp[0].file : 'none'

  return {
    totalFiles, totalBatches,
    avgCentering, avgWallUniformity, avgSurfaceSmoothness,
    avgProportion, avgStructuralIntegrity, avgTechnique,
    masterCraftsman, beginnerCraftsman, pristinePieces, shatteredPieces,
    porcelainCount, earthenwareCount, wheelThrownCount, handBuiltCount,
    totalCracks, totalChips, totalBlemishes,
    perfectFiring, crackedFiring,
    overallQuality, wheelGrade,
    bestPiece, worstPiece, mostCentered, smoothestPiece, bestProportioned,
  }
}
