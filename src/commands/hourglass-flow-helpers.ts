// ─── Interfaces ──────────────────────────────────────────

export type PileShape = 'conical' | 'flat' | 'lopsided' | 'tunnel' | 'overflow' | 'empty'
export type GrainSize = 'fine' | 'medium' | 'coarse' | 'mixed' | 'pebbles' | 'boulders'
export type GrainCondition = 'precision-timer' | 'well-calibrated' | 'standard-hourglass' | 'leaky' | 'clogged' | 'broken-glass'
export type SetType = 'laboratory-set' | 'desk-set' | 'kitchen-timer' | 'egg-timer' | 'toy' | 'broken'
export type SetCondition = 'chronometer' | 'timepiece' | 'timer' | 'hourglass' | 'novelty' | 'wreckage'
export type HorologistGrade = 'master-horologist' | 'horologist' | 'clockmaker' | 'watchmaker' | 'novice' | 'time-blind'

export interface UpperBulbMeasure {
  sandVolume: number
  funnelAngle: number
  hasLumps: boolean
  hasMoisture: boolean
  hasForeignObjects: boolean
  grainTypes: string[]
  isFull: boolean
}

export interface NeckMeasure {
  width: number
  isSmooth: boolean
  isClogged: boolean
  isWide: boolean
  isCalibrated: boolean
  clogPoints: string[]
  throughput: number
  hasFilter: boolean
  hasGrinder: boolean
}

export interface LowerBulbMeasure {
  sandVolume: number
  pileShape: PileShape
  hasSpillage: boolean
  hasContamination: boolean
  hasNeatPile: boolean
  spillageAmount: number
}

export interface FlowMeasure {
  rate: number
  isSteady: boolean
  isPulsing: boolean
  isClogged: boolean
  isGushing: boolean
  hasAirGaps: boolean
  consistency: number
}

export interface GlassMeasure {
  clarity: number
  hasScratches: boolean
  hasBubbles: boolean
  isTransparent: boolean
  isFrosted: boolean
  hasEtchings: boolean
  scratchCount: number
  bubbleCount: number
}

export interface SandMeasure {
  quality: number
  grainSize: GrainSize
  isUniform: boolean
  isClean: boolean
  hasImpurities: boolean
  hasColoredGrains: boolean
  impurityCount: number
}

export interface TimingMeasure {
  precision: number
  hasConsistentTiming: boolean
  hasFastSections: boolean
  hasSlowSections: boolean
  hasStalls: boolean
  efficiency: number
}

export interface SandGrain {
  file: string
  flowRate: number
  neckWidth: number
  sandQuality: number
  grainConsistency: number
  glassClarity: number
  timeMeasurement: number
  upperBulb: UpperBulbMeasure
  neck: NeckMeasure
  lowerBulb: LowerBulbMeasure
  flow: FlowMeasure
  glass: GlassMeasure
  sand: SandMeasure
  timing: TimingMeasure
  condition: GrainCondition
  qualityScore: number
}

export interface HourglassSet {
  directory: string
  grains: SandGrain[]
  avgFlowRate: number
  avgNeckWidth: number
  avgSandQuality: number
  avgGlassClarity: number
  precisionCount: number
  cloggedCount: number
  leakingCount: number
  steadyCount: number
  setType: SetType
  condition: SetCondition
}

export interface Clockshop {
  avgFlowRate: number
  avgNeckWidth: number
  avgSandQuality: number
  avgGlassClarity: number
  isFlowingSmoothly: boolean
  overallFlow: number
}

export interface HourglassFlowStats {
  totalFiles: number
  totalSets: number
  avgFlowRate: number
  avgNeckWidth: number
  avgSandQuality: number
  avgGrainConsistency: number
  avgGlassClarity: number
  avgTimeMeasurement: number
  precisionTimerCount: number
  wellCalibratedCount: number
  standardHourglassCount: number
  leakyCount: number
  cloggedCount: number
  brokenGlassCount: number
  fineGrainCount: number
  mediumGrainCount: number
  coarseGrainCount: number
  steadyFlowCount: number
  pulsingFlowCount: number
  cloggedFlowCount: number
  hasFilterCount: number
  isTransparentCount: number
  hasSpillageCount: number
  isUniformCount: number
  hasColoredGrainsCount: number
  overallFlow: number
  horologistGrade: HorologistGrade
  smoothestFlow: string
  narrowestNeck: string
  finestSand: string
  clearestGlass: string
  mostClogged: string
  mostEfficient: string
}

export interface HourglassFlowResult {
  grains: SandGrain[]
  sets: HourglassSet[]
  clockshop: Clockshop
  stats: HourglassFlowStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const t = content.match(/\btry\s*\{/g); if (t) count += t.length
  const c = content.match(/\bcatch\s/g); if (c) count += c.length
  const th = content.match(/\bthrow\s/g); if (th) count += th.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const i = content.match(/\bif\s*\(/g); if (i) count += i.length
  const e = content.match(/\belse\s/g); if (e) count += e.length
  const s = content.match(/\bswitch\s*\(/g); if (s) count += s.length
  return count
}

export function maxNesting(content: string): number {
  let max = 0, d = 0
  for (const ch of content) {
    if (ch === '{') { d++; if (d > max) max = d }
    if (ch === '}') d = Math.max(0, d - 1)
  }
  return max
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const s = content.match(/\/\/.*$/gm); if (s) count += s.length
  const b = content.match(/\/\*[\s\S]*?\*\//g); if (b) count += b.length
  return count
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countValidations(content: string): number {
  const m = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return m ? m.length : 0
}

// ─── Upper Bulb Measurement ──────────────────────────────

/**
 * Measure upper bulb input properties
 * @example
 * measureUpperBulb('import { x } from "y"') // { sandVolume, ... }
 */
export function measureUpperBulb(content: string): UpperBulbMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)

  const grainTypes: string[] = []
  if (/\bstring\b/.test(content)) grainTypes.push('string')
  if (/\bnumber\b/.test(content)) grainTypes.push('number')
  if (/\bboolean\b/.test(content)) grainTypes.push('boolean')
  if (/\bany\b/.test(content)) grainTypes.push('any')
  if (/\bunknown\b/.test(content)) grainTypes.push('unknown')
  if (grainTypes.length === 0 && loc > 0) grainTypes.push('implicit')

  const sandVolume = imports
  const funnelAngle = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports > 0 ? 30 : 0) +
    (types > 0 ? 30 : 0) +
    (countValidations(content) > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 20 : 0),
  )))
  const hasLumps = imports > 3 && types === 0
  const hasMoisture = countTodos(content) > 0
  const hasForeignObjects = /\bany\b/.test(content)
  const isFull = imports > 5

  return { sandVolume, funnelAngle, hasLumps, hasMoisture, hasForeignObjects, grainTypes, isFull }
}

// ─── Neck Measurement ────────────────────────────────────

/**
 * Measure neck bottleneck properties
 * @example
 * measureNeck('export function validate(x: string): boolean') // { width, ... }
 */
export function measureNeck(content: string): NeckMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const validations = countValidations(content)

  const width = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (validations > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const isSmooth = exports > 0 && types > 0
  const isClogged = exports === 0 && loc > 0
  const isWide = width > 80
  const isCalibrated = width >= 40 && width <= 80
  const hasFilter = errors > 0
  const hasGrinder = validations > 0 && types > 0

  const clogPoints: string[] = []
  if (exports === 0 && loc > 0) clogPoints.push('no-exports')
  if (types === 0 && functions_gt(content, 0)) clogPoints.push('no-types')
  if (errors === 0 && countBranches(content) > 3) clogPoints.push('no-error-handling')

  const throughput = width

  return { width, isSmooth, isClogged, isWide, isCalibrated, clogPoints, throughput, hasFilter, hasGrinder }
}

function functions_gt(content: string, n: number): boolean {
  return countFunctions(content) > n
}

// ─── Lower Bulb Measurement ──────────────────────────────

/**
 * Measure lower bulb output properties
 * @example
 * measureLowerBulb('export function calc(): number { return 1 }') // { sandVolume, ... }
 */
export function measureLowerBulb(content: string): LowerBulbMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const consoleCount = countConsole(content)

  const sandVolume = exports
  const hasSpillage = consoleCount > 0 && exports > 0
  const hasContamination = countTodos(content) > 0 && exports > 0
  const hasNeatPile = exports > 0 && consoleCount === 0 && countTodos(content) === 0
  const spillageAmount = loc === 0 ? 0 : Math.min(100, Math.max(0, consoleCount * 20 + countTodos(content) * 15))

  let pileShape: PileShape = 'empty'
  if (exports === 0 && loc > 0) pileShape = 'tunnel'
  else if (exports > 5) pileShape = 'overflow'
  else if (hasSpillage) pileShape = 'lopsided'
  else if (exports > 0 && hasNeatPile) pileShape = 'conical'
  else if (exports > 0) pileShape = 'flat'

  return { sandVolume, pileShape, hasSpillage, hasContamination, hasNeatPile, spillageAmount }
}

// ─── Flow Measurement ────────────────────────────────────

/**
 * Measure flow properties
 * @example
 * measureFlow('export function calc(x: number): number { return x * 2 }') // { rate, ... }
 */
export function measureFlow(content: string): FlowMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const rate = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countValidations(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0),
  )))

  const isSteady = rate >= 50
  const isClogged = rate < 20 && loc > 0
  const isGushing = rate > 80
  const isPulsing = !isSteady && !isClogged && loc > 0
  const hasAirGaps = branches > 0 && errors === 0
  const consistency = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    rate * 0.6 +
    (isSteady ? 20 : 0) +
    (!hasAirGaps ? 20 : 0),
  )))

  return { rate, isSteady, isPulsing, isClogged, isGushing, hasAirGaps, consistency }
}

// ─── Glass Measurement ───────────────────────────────────

/**
 * Measure glass clarity properties
 * @example
 * measureGlass('/** docs *\/ export function calc() {}') // { clarity, ... }
 */
export function measureGlass(content: string): GlassMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const descriptive = countDescriptiveNames(content)

  const clarity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (comments > 0 ? 15 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (countExports(content) > 0 ? 10 : 0) +
    (countConsole(content) === 0 ? 10 : 0),
  )))

  const consoleCount = countConsole(content)
  const hasScratches = consoleCount > 0
  const scratchCount = consoleCount
  const hasBubbles = types > 0 && types < countFunctions(content)
  const bubbleCount = hasBubbles ? Math.max(1, countFunctions(content) - types) : 0
  const isTransparent = clarity >= 60
  const isFrosted = clarity < 30 && loc > 0
  const hasEtchings = jsdoc > 0

  return { clarity, hasScratches, hasBubbles, isTransparent, isFrosted, hasEtchings, scratchCount, bubbleCount }
}

// ─── Sand Measurement ────────────────────────────────────

/**
 * Measure sand quality properties
 * @example
 * measureSand('const x: number = 1; const y: string = "a"') // { quality, ... }
 */
export function measureSand(content: string): SandMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const validations = countValidations(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (validations > 0 ? 20 : 0) +
    (consoleCount === 0 ? 15 : 0) +
    (todos === 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  let grainSize: GrainSize = 'boulders'
  if (types > 0 && errors > 0 && validations > 0) grainSize = 'fine'
  else if (types > 0 && errors > 0) grainSize = 'medium'
  else if (types > 0) grainSize = 'coarse'
  else if (loc > 0) grainSize = 'pebbles'

  const isUniform = types > 0 && types >= countFunctions(content)
  const isClean = consoleCount === 0 && todos === 0
  const hasImpurities = consoleCount > 0 || todos > 0
  const hasColoredGrains = types > 0
  const impurityCount = consoleCount + todos

  return { quality, grainSize, isUniform, isClean, hasImpurities, hasColoredGrains, impurityCount }
}

// ─── Timing Measurement ──────────────────────────────────

/**
 * Measure timing efficiency properties
 * @example
 * measureTiming('export function calc(x: number): number { return x }') // { precision, ... }
 */
export function measureTiming(content: string): TimingMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const nesting = maxNesting(content)

  const precision = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (nesting <= 3 ? 15 : 0) +
    (countBranches(content) <= 5 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const hasConsistentTiming = exports > 0 && nesting <= 3
  const hasFastSections = exports > 0 && countBranches(content) <= 3
  const hasSlowSections = nesting > 4 || countBranches(content) > 10
  const hasStalls = /\bawait\b/.test(content) && errors === 0
  const efficiency = precision

  return { precision, hasConsistentTiming, hasFastSections, hasSlowSections, hasStalls, efficiency }
}

// ─── Classification ──────────────────────────────────────

export function classifyCondition(qualityScore: number): GrainCondition {
  if (qualityScore >= 85) return 'precision-timer'
  if (qualityScore >= 68) return 'well-calibrated'
  if (qualityScore >= 50) return 'standard-hourglass'
  if (qualityScore >= 32) return 'leaky'
  if (qualityScore >= 15) return 'clogged'
  return 'broken-glass'
}

export function classifySetType(grains: SandGrain[]): SetType {
  if (grains.length === 0) return 'broken'
  const avg = grains.reduce((s, g) => s + g.qualityScore, 0) / grains.length
  if (avg >= 80) return 'laboratory-set'
  if (avg >= 62) return 'desk-set'
  if (avg >= 45) return 'kitchen-timer'
  if (avg >= 28) return 'egg-timer'
  if (avg >= 12) return 'toy'
  return 'broken'
}

export function classifySetCondition(grains: SandGrain[]): SetCondition {
  if (grains.length === 0) return 'wreckage'
  const avg = grains.reduce((s, g) => s + g.qualityScore, 0) / grains.length
  if (avg >= 80) return 'chronometer'
  if (avg >= 62) return 'timepiece'
  if (avg >= 45) return 'timer'
  if (avg >= 28) return 'hourglass'
  if (avg >= 12) return 'novelty'
  return 'wreckage'
}

export function classifyHorologistGrade(avgFlow: number): HorologistGrade {
  if (avgFlow >= 80) return 'master-horologist'
  if (avgFlow >= 65) return 'horologist'
  if (avgFlow >= 48) return 'clockmaker'
  if (avgFlow >= 32) return 'watchmaker'
  if (avgFlow >= 16) return 'novice'
  return 'time-blind'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a sand grain
 * @example
 * analyzeSandGrain('export function calc() {}', 'calc.ts') // SandGrain
 */
export function analyzeSandGrain(content: string, filePath: string): SandGrain {
  const upperBulb = measureUpperBulb(content)
  const neck = measureNeck(content)
  const lowerBulb = measureLowerBulb(content)
  const flow = measureFlow(content)
  const glass = measureGlass(content)
  const sand = measureSand(content)
  const timing = measureTiming(content)

  const flowRate = flow.rate
  const neckWidth = neck.width
  const sandQuality = sand.quality
  const grainConsistency = flow.consistency
  const glassClarity = glass.clarity
  const timeMeasurement = timing.precision

  const loc = countLoc(content)
  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (flowRate * 0.20) +
    (neckWidth * 0.15) +
    (sandQuality * 0.15) +
    (glassClarity * 0.15) +
    (timeMeasurement * 0.15) +
    (grainConsistency * 0.10) +
    (lowerBulb.hasNeatPile ? 10 : 0),
  )))

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    flowRate, neckWidth, sandQuality, grainConsistency, glassClarity, timeMeasurement,
    upperBulb, neck, lowerBulb, flow, glass, sand, timing,
    condition, qualityScore,
  }
}

// ─── Hourglass Set ───────────────────────────────────────

/**
 * Analyze a directory as an hourglass set
 * @example
 * analyzeHourglassSet(grains, 'src') // HourglassSet
 */
export function analyzeHourglassSet(grains: SandGrain[], dirPath: string): HourglassSet {
  const avgFlowRate = grains.length === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.flowRate, 0) / grains.length)
  const avgNeckWidth = grains.length === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.neckWidth, 0) / grains.length)
  const avgSandQuality = grains.length === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.sandQuality, 0) / grains.length)
  const avgGlassClarity = grains.length === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.glassClarity, 0) / grains.length)
  const precisionCount = grains.filter(g => g.condition === 'precision-timer').length
  const cloggedCount = grains.filter(g => g.condition === 'clogged').length
  const leakingCount = grains.filter(g => g.condition === 'leaky').length
  const steadyCount = grains.filter(g => g.flow.isSteady).length

  return {
    directory: dirPath, grains,
    avgFlowRate, avgNeckWidth, avgSandQuality, avgGlassClarity,
    precisionCount, cloggedCount, leakingCount, steadyCount,
    setType: classifySetType(grains),
    condition: classifySetCondition(grains),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(grains, sets, clockshop, stats) // string[]
 */
export function generateRecommendations(
  _grains: SandGrain[],
  sets: HourglassSet[],
  clockshop: Clockshop,
  stats: HourglassFlowStats,
): string[] {
  const recs: string[] = []

  if (stats.cloggedCount + stats.brokenGlassCount > 0) {
    recs.push(`Blocked flow: ${stats.cloggedCount + stats.brokenGlassCount} file(s) need exports and types for smooth data flow`)
  }
  if (stats.leakyCount > stats.totalFiles * 0.3) {
    recs.push('High leak ratio - add error handling to prevent data loss')
  }
  if (stats.hasFilterCount === 0 && stats.totalFiles > 0) {
    recs.push('No filters detected - add validation to catch bad data')
  }
  if (stats.cloggedFlowCount > 0) {
    recs.push(`Clogged flow: ${stats.cloggedFlowCount} file(s) have insufficient data throughput`)
  }
  if (stats.isTransparentCount === 0 && stats.totalFiles > 0) {
    recs.push('Frosted glass - add documentation to make data flow visible')
  }
  if (clockshop.overallFlow >= 70) {
    recs.push('Smooth flow - excellent data throughput and clarity throughout')
  }
  if (stats.isUniformCount > stats.totalFiles * 0.5) {
    recs.push('Uniform grains - consistent typing across the codebase')
  }
  if (sets.length > 1) {
    const brokenSets = sets.filter(s => s.setType === 'toy' || s.setType === 'broken')
    if (brokenSets.length > 0) {
      recs.push(`Broken sets: ${brokenSets.map(s => s.directory).join(', ')} need recalibration`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete hourglass-flow result
 * @example
 * buildHourglassFlowResult(['a.ts'], ['export function a() {}'], {}) // HourglassFlowResult
 */
export function buildHourglassFlowResult(files: string[], contents: string[], _options: Record<string, unknown>): HourglassFlowResult {
  const grains: SandGrain[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeSandGrain(content ?? '', file)
  })

  const dirMap = new Map<string, SandGrain[]>()
  for (const grain of grains) {
    const parts = grain.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(grain) } else { dirMap.set(dir, [grain]) }
  }

  const sets = Array.from(dirMap.entries()).map(([dir, dirGrains]) =>
    analyzeHourglassSet(dirGrains, dir),
  )

  const totalFiles = grains.length
  const avgFlowRate = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.flowRate, 0) / totalFiles)
  const avgNeckWidth = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.neckWidth, 0) / totalFiles)
  const avgSandQuality = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.sandQuality, 0) / totalFiles)
  const avgGrainConsistency = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.grainConsistency, 0) / totalFiles)
  const avgGlassClarity = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.glassClarity, 0) / totalFiles)
  const avgTimeMeasurement = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.timeMeasurement, 0) / totalFiles)
  const overallFlow = totalFiles === 0 ? 0 : Math.round(grains.reduce((s, g) => s + g.qualityScore, 0) / totalFiles)

  const clockshop: Clockshop = {
    avgFlowRate, avgNeckWidth, avgSandQuality, avgGlassClarity,
    isFlowingSmoothly: overallFlow >= 60,
    overallFlow,
  }

  const condCounts = { precisionTimer: 0, wellCalibrated: 0, standardHourglass: 0, leaky: 0, clogged: 0, brokenGlass: 0 }
  for (const g of grains) {
    switch (g.condition) {
      case 'precision-timer': condCounts.precisionTimer++; break
      case 'well-calibrated': condCounts.wellCalibrated++; break
      case 'standard-hourglass': condCounts.standardHourglass++; break
      case 'leaky': condCounts.leaky++; break
      case 'clogged': condCounts.clogged++; break
      case 'broken-glass': condCounts.brokenGlass++; break
    }
  }

  const smoothestFlow = totalFiles === 0 ? 'none' : grains.reduce((b, g) => g.flowRate > b.flowRate ? g : b).file
  const narrowestNeck = totalFiles === 0 ? 'none' : grains.reduce((b, g) => g.neckWidth < b.neckWidth || (g.neckWidth === b.neckWidth && g.qualityScore < b.qualityScore) ? g : b).file
  const finestSand = totalFiles === 0 ? 'none' : grains.reduce((b, g) => g.sandQuality > b.sandQuality ? g : b).file
  const clearestGlass = totalFiles === 0 ? 'none' : grains.reduce((b, g) => g.glassClarity > b.glassClarity ? g : b).file
  const mostClogged = totalFiles === 0 ? 'none' : grains.reduce((w, g) => g.neck.clogPoints.length > w.neck.clogPoints.length ? g : w).file
  const mostEfficient = totalFiles === 0 ? 'none' : grains.reduce((b, g) => g.timing.efficiency > b.timing.efficiency ? g : b).file

  const stats: HourglassFlowStats = {
    totalFiles,
    totalSets: sets.length,
    avgFlowRate,
    avgNeckWidth,
    avgSandQuality,
    avgGrainConsistency,
    avgGlassClarity,
    avgTimeMeasurement,
    precisionTimerCount: condCounts.precisionTimer,
    wellCalibratedCount: condCounts.wellCalibrated,
    standardHourglassCount: condCounts.standardHourglass,
    leakyCount: condCounts.leaky,
    cloggedCount: condCounts.clogged,
    brokenGlassCount: condCounts.brokenGlass,
    fineGrainCount: grains.filter(g => g.sand.grainSize === 'fine').length,
    mediumGrainCount: grains.filter(g => g.sand.grainSize === 'medium').length,
    coarseGrainCount: grains.filter(g => g.sand.grainSize === 'coarse').length,
    steadyFlowCount: grains.filter(g => g.flow.isSteady).length,
    pulsingFlowCount: grains.filter(g => g.flow.isPulsing).length,
    cloggedFlowCount: grains.filter(g => g.flow.isClogged).length,
    hasFilterCount: grains.filter(g => g.neck.hasFilter).length,
    isTransparentCount: grains.filter(g => g.glass.isTransparent).length,
    hasSpillageCount: grains.filter(g => g.lowerBulb.hasSpillage).length,
    isUniformCount: grains.filter(g => g.sand.isUniform).length,
    hasColoredGrainsCount: grains.filter(g => g.sand.hasColoredGrains).length,
    overallFlow,
    horologistGrade: classifyHorologistGrade(overallFlow),
    smoothestFlow,
    narrowestNeck,
    finestSand,
    clearestGlass,
    mostClogged,
    mostEfficient,
  }

  const recommendations = generateRecommendations(grains, sets, clockshop, stats)

  return { grains, sets, clockshop, stats, recommendations }
}
