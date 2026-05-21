// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ThreadConnections {
  warpConnections: number
  weftConnections: number
  crossingPoints: number
  isInterlaced: boolean
  interlaceQuality: number
}

export type ThreadDirection = 'warp' | 'weft' | 'fill' | 'selvedge'
export type ThreadMaterial = 'silk' | 'cotton' | 'linen' | 'wool' | 'synthetic' | 'metallic' | 'rag'

export interface LoomThread {
  file: string
  threadDirection: ThreadDirection
  tension: number
  strength: number
  elasticity: number
  threadCount: number
  material: ThreadMaterial
  dye: string
  isUnderTension: boolean
  isSlack: boolean
  isBroken: boolean
  isKnotted: boolean
  connections: ThreadConnections
}

export interface ShedInfo {
  isOpen: boolean
  isClean: boolean
  isOpeningWidth: number
  hasStickyShed: boolean
}

export interface HeddleInfo {
  count: number
  quality: number
  areProperlySet: boolean
  hasMissingHeddles: boolean
  hasBrokenHeddles: boolean
}

export interface BeamInfo {
  warpBeam: number
  clothBeam: number
  isEvenlyWound: boolean
  hasUnevenWinding: boolean
}

export interface ReedInfo {
  dents: number
  dentsPerInch: number
  isProperlySet: boolean
  hasGaps: boolean
  hasCrowding: boolean
}

export type LoomMechanicsType = 'jacquard' | 'dobby' | 'counterbalance' | 'countermarch' | 'rigid-heddle' | 'inkle' | 'frame'
export type LoomCondition = 'perfectly-tuned' | 'well-tuned' | 'in-tune' | 'needs-adjustment' | 'out-of-tune' | 'broken-down'

export interface LoomMechanics {
  file: string
  warpTension: number
  weftTension: number
  shedClarity: number
  heddleOperation: number
  beamWinding: number
  takeUp: number
  warpCount: number
  weftCount: number
  picksPerInch: number
  isBalancedWeave: boolean
  shed: ShedInfo
  heddles: HeddleInfo
  beams: BeamInfo
  reed: ReedInfo
  mechanics: LoomMechanicsType
  condition: LoomCondition
  qualityScore: number
}

export type BenchCondition = 'workshop' | 'studio' | 'garage' | 'shed' | 'salvage'

export interface LoomBench {
  directory: string
  mechanics: LoomMechanics[]
  avgWarpTension: number
  avgWeftTension: number
  avgShedClarity: number
  avgHeddleOperation: number
  avgBeamWinding: number
  dominantMechanics: string
  tunedCount: number
  brokenCount: number
  balancedWeaveCount: number
  totalMissingHeddles: number
  totalBrokenHeddles: number
  benchQuality: number
  condition: BenchCondition
}

export interface WorkshopInfo {
  avgWarpTension: number
  avgWeftTension: number
  avgShedClarity: number
  avgHeddleOperation: number
  avgBeamWinding: number
  isBalanced: boolean
  overallTuning: number
}

export interface TapestryLoomStats {
  totalFiles: number
  totalBenches: number
  avgWarpTension: number
  avgWeftTension: number
  avgShedClarity: number
  avgHeddleOperation: number
  avgBeamWinding: number
  avgTakeUp: number
  jacquardCount: number
  rigidHeddleCount: number
  frameCount: number
  tunedCount: number
  needsAdjustmentCount: number
  brokenDownCount: number
  balancedWeaveCount: number
  totalMissingHeddles: number
  totalBrokenHeddles: number
  totalGaps: number
  totalCrowding: number
  overallTuning: number
  weaverGrade: 'master-weaver' | 'journeyman' | 'apprentice' | 'novice' | 'clumsy' | 'tangled'
  bestTuned: string
  worstTuned: string
  bestShed: string
  bestHeddles: string
}

export interface TapestryLoomResult {
  mechanics: LoomMechanics[]
  benches: LoomBench[]
  workshop: WorkshopInfo
  stats: TapestryLoomStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure warp tension (dependency coupling strength)
 * @example
 * measureWarpTension('import { x } from "y"\nexport function a() {}') // number
 */
export function measureWarpTension(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  return Math.min(100, Math.round(
    Math.min(30, imports * 6) +
    Math.min(30, exports * 6) +
    Math.min(20, types * 4) +
    (countFunctions(content) > 0 ? 10 : 0) +
    (loc <= 150 ? 10 : 0),
  ))
}

/**
 * Measure weft tension (functional coupling strength)
 * @example
 * measureWeftTension('export function calc() { return helper() }') // number
 */
export function measureWeftTension(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countFunctions(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countBranches(content) <= 5 ? 20 : 10) +
    (maxNesting(content) <= 3 ? 20 : 10),
  ))
}

/**
 * Measure shed clarity (layer separation)
 * @example
 * measureShedClarity('export function calc() { return 1 }') // number
 */
export function measureShedClarity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasExports = countExports(content) > 0 ? 25 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 25 : 0
  const lowNesting = maxNesting(content) <= 3 ? 25 : maxNesting(content) <= 5 ? 12 : 0
  const lowConsole = countConsole(content) <= 1 ? 15 : 0
  const hasDocs = countComments(content) > 0 ? 10 : 0
  return Math.min(100, hasExports + hasTypes + lowNesting + lowConsole + hasDocs)
}

/**
 * Measure heddle operation (interface mechanism quality)
 * @example
 * measureHeddleOperation('export interface Config { name: string }') // number
 */
export function measureHeddleOperation(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasInterface = /interface\s+\w/.test(content) ? 25 : 0
  const hasTypeAlias = /type\s+\w+\s*=/.test(content) ? 20 : 0
  const hasExports = countExports(content) > 0 ? 20 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasDocs = /\/\*\*/.test(content) ? 15 : 0
  return Math.min(100, hasInterface + hasTypeAlias + hasExports + hasTypes + hasDocs)
}

/**
 * Measure beam winding (data flow quality)
 * @example
 * measureBeamWinding('export function calc(x: number): number { return x }') // number
 */
export function measureBeamWinding(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasReturn = /\breturn\b/.test(content) ? 20 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 25 : 0
  const hasError = countErrorHandling(content) > 0 ? 20 : 0
  const hasImports = countImports(content) > 0 ? 15 : 0
  const hasExports = countExports(content) > 0 ? 20 : 0
  return Math.min(100, hasReturn + hasTypes + hasError + hasImports + hasExports)
}

/**
 * Measure take-up (code absorption quality)
 * @example
 * measureTakeUp('import { x } from "y"\nexport function a() { return x }') // number
 */
export function measureTakeUp(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const importUsage = countImports(content) > 0 && countExports(content) > 0 ? 30 : 0
  const typeUsage = countTypeAnnotations(content) > 0 ? 25 : 0
  const lowTodos = countTodos(content) === 0 ? 20 : 0
  const lowConsole = countConsole(content) <= 1 ? 15 : 0
  const focused = countFunctions(content) <= 5 ? 10 : 0
  return Math.min(100, importUsage + typeUsage + lowTodos + lowConsole + focused)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify loom mechanics type from content
 * @example
 * classifyMechanics('export interface A {}') // string
 */
export function classifyMechanics(content: string): LoomMechanicsType {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)
  const hasInterface = /interface\s+\w/.test(content)
  const hasClass = /\bclass\s+\w/.test(content)

  if (hasInterface && hasClass && exports > 2) return 'jacquard'
  if (exports > 3 && imports > 1 && functions > 2) return 'dobby'
  if (hasClass && imports > 1) return 'counterbalance'
  if (exports > 1 && imports > 0 && hasInterface) return 'countermarch'
  if (exports === 1 && loc <= 50) return 'rigid-heddle'
  if (loc > 0 && exports === 0 && imports === 0) return 'inkle'
  return 'frame'
}

/**
 * Classify weaver grade from average tuning
 * @example
 * classifyWeaverGrade(80) // 'master-weaver'
 */
export function classifyWeaverGrade(avgTuning: number): TapestryLoomStats['weaverGrade'] {
  if (avgTuning >= 75) return 'master-weaver'
  if (avgTuning >= 60) return 'journeyman'
  if (avgTuning >= 45) return 'apprentice'
  if (avgTuning >= 30) return 'novice'
  if (avgTuning >= 15) return 'clumsy'
  return 'tangled'
}

/**
 * Classify loom condition from quality score
 * @example
 * classifyLoomCondition(80) // 'well-tuned'
 */
export function classifyLoomCondition(quality: number): LoomCondition {
  if (quality >= 85) return 'perfectly-tuned'
  if (quality >= 70) return 'well-tuned'
  if (quality >= 50) return 'in-tune'
  if (quality >= 30) return 'needs-adjustment'
  if (quality >= 15) return 'out-of-tune'
  return 'broken-down'
}

/**
 * Classify bench condition from quality
 * @example
 * classifyBenchCondition(80) // 'workshop'
 */
export function classifyBenchCondition(quality: number): BenchCondition {
  if (quality >= 70) return 'workshop'
  if (quality >= 50) return 'studio'
  if (quality >= 30) return 'garage'
  if (quality >= 15) return 'shed'
  return 'salvage'
}

/**
 * Classify thread material from content
 * @example
 * classifyThreadMaterial('export function calc() {}') // string
 */
export function classifyThreadMaterial(content: string): ThreadMaterial {
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)
  const exports = countExports(content)
  const errorHandling = countErrorHandling(content)

  if (types > 3 && exports > 0 && loc > 20) return 'silk'
  if (types > 0 && errorHandling > 0) return 'cotton'
  if (types > 0) return 'linen'
  if (errorHandling > 0 && exports > 0) return 'wool'
  if (/async|Promise/.test(content)) return 'synthetic'
  if (/class\s+\w/.test(content)) return 'metallic'
  return 'rag'
}

// ─── Sub-Analysis Functions ──────────────────────────────────────────────────

/**
 * Analyze shed (separation clarity)
 * @example
 * analyzeShed(content) // ShedInfo
 */
export function analyzeShed(content: string): ShedInfo {
  const nesting = maxNesting(content)
  const branches = countBranches(content)
  const console_ = countConsole(content)

  const isOpeningWidth = Math.min(100, Math.round(
    (nesting <= 2 ? 40 : nesting <= 4 ? 20 : 0) +
    (branches <= 3 ? 30 : branches <= 7 ? 15 : 0) +
    (console_ === 0 ? 30 : 10),
  ))

  const isOpen = isOpeningWidth >= 60
  const isClean = nesting <= 4 && console_ <= 2
  const hasStickyShed = nesting > 4 || (branches > 8 && console_ > 2)

  return { isOpen, isClean, isOpeningWidth, hasStickyShed }
}

/**
 * Analyze heddles (interface mechanism quality)
 * @example
 * analyzeHeddles(content) // HeddleInfo
 */
export function analyzeHeddles(content: string): HeddleInfo {
  const count = countExports(content) + countTypeAnnotations(content)
  const quality = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countExports(content) > 0 ? 25 : 0) +
    (/interface|type\s+\w/.test(content) ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0),
  ))

  const areProperlySet = quality >= 50
  const hasMissingHeddles = countExports(content) > 0 && countTypeAnnotations(content) === 0
  const hasBrokenHeddles = countErrorHandling(content) === 0 && countExports(content) > 0 && countLoc(content) > 30

  return { count, quality, areProperlySet, hasMissingHeddles, hasBrokenHeddles }
}

/**
 * Analyze beams (data flow quality)
 * @example
 * analyzeBeams(content) // BeamInfo
 */
export function analyzeBeams(content: string): BeamInfo {
  const warpBeam = Math.min(100, Math.round(
    (countImports(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 25 : 0) +
    (countLoc(content) > 10 ? 25 : 0),
  ))

  const clothBeam = Math.min(100, Math.round(
    (countExports(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (/\breturn\b/.test(content) ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0),
  ))

  const diff = Math.abs(warpBeam - clothBeam)
  const isEvenlyWound = diff <= 20
  const hasUnevenWinding = diff > 30

  return { warpBeam, clothBeam, isEvenlyWound, hasUnevenWinding }
}

/**
 * Analyze reed (interface density)
 * @example
 * analyzeReed(content) // ReedInfo
 */
export function analyzeReed(content: string): ReedInfo {
  const dents = countExports(content) + countFunctions(content)
  const loc = countLoc(content)
  const dentsPerInch = loc > 0 ? Math.round((dents / loc) * 100) : 0

  const isProperlySet = dentsPerInch >= 10 && dentsPerInch <= 60
  const hasGaps = dentsPerInch < 10 && loc > 20
  const hasCrowding = dentsPerInch > 60

  return { dents, dentsPerInch, isProperlySet, hasGaps, hasCrowding }
}

// ─── Thread Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze thread connections
 * @example
 * analyzeConnections(content) // ThreadConnections
 */
export function analyzeConnections(content: string): ThreadConnections {
  const warpConnections = countImports(content)
  const weftConnections = countExports(content)
  const crossingPoints = Math.min(warpConnections, weftConnections)
  const isInterlaced = warpConnections > 0 && weftConnections > 0
  const interlaceQuality = Math.min(100, Math.round(
    (isInterlaced ? 40 : 0) +
    (crossingPoints > 0 ? 30 : 0) +
    (countTypeAnnotations(content) > 0 ? 30 : 0),
  ))

  return { warpConnections, weftConnections, crossingPoints, isInterlaced, interlaceQuality }
}

/**
 * Classify thread direction from content
 * @example
 * classifyThreadDirection('import { x } from "y"') // string
 */
export function classifyThreadDirection(content: string): ThreadDirection {
  const imports = countImports(content)
  const exports = countExports(content)

  if (imports > exports) return 'warp'
  if (exports > imports) return 'weft'
  if (imports > 0 && exports > 0) return 'fill'
  return 'selvedge'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as loom mechanics
 * @example
 * analyzeLoomMechanics('export function calc() { return 1 }', 'calc.ts') // LoomMechanics
 */
export function analyzeLoomMechanics(content: string, filePath: string): LoomMechanics {
  const warpTension = measureWarpTension(content)
  const weftTension = measureWeftTension(content)
  const shedClarity = measureShedClarity(content)
  const heddleOperation = measureHeddleOperation(content)
  const beamWinding = measureBeamWinding(content)
  const takeUp = measureTakeUp(content)

  const warpCount = countImports(content)
  const weftCount = countExports(content)
  const loc = countLoc(content)
  const picksPerInch = loc > 0 ? Math.round((warpCount + weftCount) / loc * 100) : 0

  const isBalancedWeave = Math.abs(warpTension - weftTension) <= 25

  const shed = analyzeShed(content)
  const heddles = analyzeHeddles(content)
  const beams = analyzeBeams(content)
  const reed = analyzeReed(content)

  const mechanics = classifyMechanics(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    warpTension * 0.15 +
    weftTension * 0.15 +
    shedClarity * 0.2 +
    heddleOperation * 0.15 +
    beamWinding * 0.15 +
    takeUp * 0.1 +
    (isBalancedWeave ? 10 : 0),
  )))

  const condition = classifyLoomCondition(qualityScore)

  return {
    file: filePath, warpTension, weftTension, shedClarity,
    heddleOperation, beamWinding, takeUp, warpCount, weftCount,
    picksPerInch, isBalancedWeave, shed, heddles, beams, reed,
    mechanics, condition, qualityScore,
  }
}

// ─── Bench Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a loom bench
 * @example
 * analyzeLoomBench(mechanics, 'src') // LoomBench
 */
export function analyzeLoomBench(mechanics: LoomMechanics[], dirPath: string): LoomBench {
  if (mechanics.length === 0) {
    return {
      directory: dirPath, mechanics: [], avgWarpTension: 0,
      avgWeftTension: 0, avgShedClarity: 0, avgHeddleOperation: 0,
      avgBeamWinding: 0, dominantMechanics: 'frame', tunedCount: 0,
      brokenCount: 0, balancedWeaveCount: 0, totalMissingHeddles: 0,
      totalBrokenHeddles: 0, benchQuality: 0, condition: 'salvage',
    }
  }

  const n = mechanics.length
  const avgWarpTension = Math.round(mechanics.reduce((s, m) => s + m.warpTension, 0) / n)
  const avgWeftTension = Math.round(mechanics.reduce((s, m) => s + m.weftTension, 0) / n)
  const avgShedClarity = Math.round(mechanics.reduce((s, m) => s + m.shedClarity, 0) / n)
  const avgHeddleOperation = Math.round(mechanics.reduce((s, m) => s + m.heddleOperation, 0) / n)
  const avgBeamWinding = Math.round(mechanics.reduce((s, m) => s + m.beamWinding, 0) / n)

  const typeCounts: Record<string, number> = {}
  for (const m of mechanics) {
    typeCounts[m.mechanics] = (typeCounts[m.mechanics] ?? 0) + 1
  }
  const dominantMechanics = Array.from(Object.entries(typeCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'frame'

  const tunedCount = mechanics.filter(m => m.condition === 'perfectly-tuned' || m.condition === 'well-tuned' || m.condition === 'in-tune').length
  const brokenCount = mechanics.filter(m => m.condition === 'out-of-tune' || m.condition === 'broken-down').length
  const balancedWeaveCount = mechanics.filter(m => m.isBalancedWeave).length
  const totalMissingHeddles = mechanics.reduce((s, m) => s + (m.heddles.hasMissingHeddles ? 1 : 0), 0)
  const totalBrokenHeddles = mechanics.reduce((s, m) => s + (m.heddles.hasBrokenHeddles ? 1 : 0), 0)

  const benchQuality = Math.round(
    avgWarpTension * 0.15 + avgWeftTension * 0.15 + avgShedClarity * 0.2 +
    avgHeddleOperation * 0.2 + avgBeamWinding * 0.15 +
    (tunedCount / n * 100) * 0.15,
  )

  const condition = classifyBenchCondition(benchQuality)

  return {
    directory: dirPath, mechanics, avgWarpTension, avgWeftTension,
    avgShedClarity, avgHeddleOperation, avgBeamWinding,
    dominantMechanics, tunedCount, brokenCount, balancedWeaveCount,
    totalMissingHeddles, totalBrokenHeddles, benchQuality, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate tapestry loom recommendations
 * @example
 * generateLoomRecommendations(mechanics, benches, workshop, stats) // string[]
 */
export function generateLoomRecommendations(
  mechanics: LoomMechanics[],
  benches: LoomBench[],
  _workshop: WorkshopInfo,
  stats: TapestryLoomStats,
): string[] {
  void _workshop
  const recs: string[] = []

  if (stats.totalMissingHeddles > 0) {
    recs.push(`Missing heddles: ${stats.totalMissingHeddles} files need interface definitions`)
  }

  if (stats.totalBrokenHeddles > 0) {
    recs.push(`Broken heddles: ${stats.totalBrokenHeddles} exported functions lack error handling`)
  }

  if (stats.totalGaps > 0) {
    recs.push(`Reed gaps: ${stats.totalGaps} files have sparse connections — add more exports`)
  }

  if (stats.totalCrowding > 0) {
    recs.push(`Reed crowding: ${stats.totalCrowding} files are too dense — reduce connections`)
  }

  if (stats.brokenDownCount > 0) {
    recs.push(`Broken looms: ${stats.brokenDownCount} files need complete restructuring`)
  }

  if (stats.needsAdjustmentCount > 3) {
    recs.push(`Tuning needed: ${stats.needsAdjustmentCount} files require adjustment`)
  }

  if (stats.overallTuning >= 60) {
    recs.push('Good tuning: loom mechanics are generally well-adjusted')
  }

  const salvageBenches = benches.filter(b => b.condition === 'salvage')
  if (salvageBenches.length > 0) {
    recs.push(`Salvage benches: ${salvageBenches.length} directories need major overhaul`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete tapestry loom result from files and contents
 * @example
 * buildTapestryLoomResult(['a.ts'], ['export function a() {}'], {}) // TapestryLoomResult
 */
export function buildTapestryLoomResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TapestryLoomResult {
  void options

  const mechanics: LoomMechanics[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeLoomMechanics(content, file)
    } catch {
      return analyzeLoomMechanics('', file)
    }
  })

  const dirMap = new Map<string, LoomMechanics[]>()
  for (const m of mechanics) {
    const dir = m.file.includes('/') ? m.file.slice(0, m.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(m) } else { dirMap.set(dir, [m]) }
  }

  const benches: LoomBench[] = Array.from(dirMap.entries()).map(([dir, ms]) =>
    analyzeLoomBench(ms, dir),
  )

  const n = mechanics.length || 1
  const avgWarpTension = Math.round(mechanics.reduce((s, m) => s + m.warpTension, 0) / n)
  const avgWeftTension = Math.round(mechanics.reduce((s, m) => s + m.weftTension, 0) / n)
  const avgShedClarity = Math.round(mechanics.reduce((s, m) => s + m.shedClarity, 0) / n)
  const avgHeddleOperation = Math.round(mechanics.reduce((s, m) => s + m.heddleOperation, 0) / n)
  const avgBeamWinding = Math.round(mechanics.reduce((s, m) => s + m.beamWinding, 0) / n)
  const avgTakeUp = Math.round(mechanics.reduce((s, m) => s + m.takeUp, 0) / n)

  const overallTuning = Math.round(
    avgWarpTension * 0.15 + avgWeftTension * 0.15 + avgShedClarity * 0.2 +
    avgHeddleOperation * 0.2 + avgBeamWinding * 0.15 + avgTakeUp * 0.15,
  )

  const isBalanced = Math.abs(avgWarpTension - avgWeftTension) <= 20

  const workshop: WorkshopInfo = {
    avgWarpTension, avgWeftTension, avgShedClarity,
    avgHeddleOperation, avgBeamWinding, isBalanced, overallTuning,
  }

  const stats: TapestryLoomStats = {
    totalFiles: files.length,
    totalBenches: benches.length,
    avgWarpTension, avgWeftTension, avgShedClarity,
    avgHeddleOperation, avgBeamWinding, avgTakeUp,
    jacquardCount: mechanics.filter(m => m.mechanics === 'jacquard').length,
    rigidHeddleCount: mechanics.filter(m => m.mechanics === 'rigid-heddle').length,
    frameCount: mechanics.filter(m => m.mechanics === 'frame').length,
    tunedCount: mechanics.filter(m => m.condition === 'perfectly-tuned' || m.condition === 'well-tuned').length,
    needsAdjustmentCount: mechanics.filter(m => m.condition === 'needs-adjustment').length,
    brokenDownCount: mechanics.filter(m => m.condition === 'broken-down').length,
    balancedWeaveCount: mechanics.filter(m => m.isBalancedWeave).length,
    totalMissingHeddles: mechanics.reduce((s, m) => s + (m.heddles.hasMissingHeddles ? 1 : 0), 0),
    totalBrokenHeddles: mechanics.reduce((s, m) => s + (m.heddles.hasBrokenHeddles ? 1 : 0), 0),
    totalGaps: mechanics.reduce((s, m) => s + (m.reed.hasGaps ? 1 : 0), 0),
    totalCrowding: mechanics.reduce((s, m) => s + (m.reed.hasCrowding ? 1 : 0), 0),
    overallTuning,
    weaverGrade: classifyWeaverGrade(overallTuning),
    bestTuned: mechanics.length > 0
      ? mechanics.reduce((b, m) => m.qualityScore > b.qualityScore ? m : b, mechanics[0]).file : 'none',
    worstTuned: mechanics.length > 0
      ? mechanics.reduce((w, m) => m.qualityScore < w.qualityScore ? m : w, mechanics[0]).file : 'none',
    bestShed: mechanics.length > 0
      ? mechanics.reduce((b, m) => m.shedClarity > b.shedClarity ? m : b, mechanics[0]).file : 'none',
    bestHeddles: mechanics.length > 0
      ? mechanics.reduce((b, m) => m.heddleOperation > b.heddleOperation ? m : b, mechanics[0]).file : 'none',
  }

  const recommendations = generateLoomRecommendations(mechanics, benches, workshop, stats)

  return { mechanics, benches, workshop, stats, recommendations }
}
