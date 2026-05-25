// ─── Types ───────────────────────────────────────────────

import { dirname } from 'node:path'
import fg from 'fast-glob'

// ─── Measure Enums ──────────────────────────────────────

export type FlowingCurrent = 'perfect-flow' | 'smooth-stream' | 'proper-current' | 'turbulent-rapids' | 'blocked-stream' | 'no-flow'
export type CascadingStep = 'crystal-steps' | 'clear-cascades' | 'proper-falls' | 'murky-drops' | 'obscured-falls' | 'no-clarity'
export type PoolingPool = 'ancient-depth' | 'deep-pool' | 'proper-depth' | 'shallow-puddle' | 'dry-bed' | 'no-depth'
export type MistingMist = 'pure-vapor' | 'clean-abstraction' | 'proper-mist' | 'foggy-layer' | 'thick-smog' | 'no-mist'
export type CarryingRiver = 'ancient-river' | 'wise-stream' | 'proper-current' | 'seasonal-creek' | 'dry-wash' | 'no-river'
export type JadeCondition = 'jade-masterpiece' | 'emerald-falls' | 'proper-waterfall' | 'murky-stream' | 'dry-creek' | 'void'
export type PoolType = 'grand-waterfall' | 'jade-cascade' | 'proper-pool' | 'small-stream' | 'dry-bed' | 'no-pool'
export type PoolCondition = 'jade-paradise' | 'emerald-pool' | 'proper-waterfall' | 'murky-stream' | 'dry-creek' | 'void'
export type GardenerGrade = 'jade-master' | 'water-keeper' | 'stream-tender' | 'apprentice' | 'novice' | 'drought-bringer'

// ─── Measure Interfaces ─────────────────────────────────

export interface FlowingMeasure {
  grace: number
  current: FlowingCurrent
  hasHighGrace: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasDirect: boolean
  hasNoCircuits: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasPredictable: boolean
  hasNoErratic: boolean
  hasStreamlined: boolean
  hasNatural: boolean
  hasNoForced: boolean
  tangledCount: number
  circuitCount: number
}

export interface CascadingMeasure {
  clarity: number
  step: CascadingStep
  hasHighClarity: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasExplained: boolean
  hasNoSecret: boolean
  hasRevealed: boolean
  hasNoConcealed: boolean
  mysteryCount: number
  obfuscatedCount: number
}

export interface PoolingMeasure {
  depth: number
  pool: PoolingPool
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasStrategic: boolean
  hackedCount: number
  adHocCount: number
}

export interface MistingMeasure {
  purity: number
  mist: MistingMist
  hasHighPurity: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasAbstracted: boolean
  hasNoLeaky: boolean
  hasEncapsulated: boolean
  hasNoExposed: boolean
  hasModular: boolean
  hasPrivate: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasPolished: boolean
  leakyCount: number
  untestedCount: number
}

export interface CarryingMeasure {
  wisdom: number
  river: CarryingRiver
  hasHighWisdom: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasReusable: boolean
  hasNoSingleUse: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasValuable: boolean
  hasNoTrivial: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasImpactful: boolean
  hasNoInsignificant: boolean
  hasEnduring: boolean
  isolatedCount: number
  singleUseCount: number
}

// ─── Core Types ─────────────────────────────────────────

export interface JadeDrop {
  file: string
  flowGrace: number
  cascadeClarity: number
  poolDepth: number
  mistPurity: number
  riverWisdom: number
  flowing: FlowingMeasure
  cascading: CascadingMeasure
  pooling: PoolingMeasure
  misting: MistingMeasure
  carrying: CarryingMeasure
  condition: JadeCondition
  qualityScore: number
}

export interface JadePool {
  directory: string
  drops: JadeDrop[]
  avgGrace: number
  avgClarity: number
  avgWisdom: number
  jadeMasterpieceCount: number
  voidCount: number
  poolType: PoolType
  condition: PoolCondition
}

export interface JadeRiver {
  avgGrace: number
  avgClarity: number
  avgWisdom: number
  isJade: boolean
  overallFlow: number
}

export interface JadeStats {
  totalFiles: number
  totalPools: number
  avgFlowGrace: number
  avgCascadeClarity: number
  avgPoolDepth: number
  avgMistPurity: number
  avgRiverWisdom: number
  jadeMasterpieceCount: number
  emeraldFallsCount: number
  properWaterfallCount: number
  murkyStreamCount: number
  dryCreekCount: number
  voidCount: number
  hasHighGraceCount: number
  hasHighClarityCount: number
  hasHighDepthCount: number
  hasHighPurityCount: number
  hasHighWisdomCount: number
  overallFlow: number
  gardenerGrade: GardenerGrade
  bestDrop: string
  mostGraceful: string
  clearest: string
  deepest: string
  purest: string
  wisest: string
}

export interface JadeWaterfallResult {
  drops: JadeDrop[]
  pools: JadePool[]
  river: JadeRiver
  stats: JadeStats
  recommendations: string[]
}

// ─── Utility ────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Grade Classifiers ──────────────────────────────────

function classifyFlowingCurrent(grace: number): FlowingCurrent {
  if (grace >= 90) return 'perfect-flow'
  if (grace >= 75) return 'smooth-stream'
  if (grace >= 60) return 'proper-current'
  if (grace >= 40) return 'turbulent-rapids'
  if (grace >= 20) return 'blocked-stream'
  return 'no-flow'
}

function classifyCascadingStep(clarity: number): CascadingStep {
  if (clarity >= 90) return 'crystal-steps'
  if (clarity >= 75) return 'clear-cascades'
  if (clarity >= 60) return 'proper-falls'
  if (clarity >= 40) return 'murky-drops'
  if (clarity >= 20) return 'obscured-falls'
  return 'no-clarity'
}

function classifyPoolingPool(depth: number): PoolingPool {
  if (depth >= 90) return 'ancient-depth'
  if (depth >= 75) return 'deep-pool'
  if (depth >= 60) return 'proper-depth'
  if (depth >= 40) return 'shallow-puddle'
  if (depth >= 20) return 'dry-bed'
  return 'no-depth'
}

function classifyMistingMist(purity: number): MistingMist {
  if (purity >= 90) return 'pure-vapor'
  if (purity >= 75) return 'clean-abstraction'
  if (purity >= 60) return 'proper-mist'
  if (purity >= 40) return 'foggy-layer'
  if (purity >= 20) return 'thick-smog'
  return 'no-mist'
}

function classifyCarryingRiver(wisdom: number): CarryingRiver {
  if (wisdom >= 90) return 'ancient-river'
  if (wisdom >= 75) return 'wise-stream'
  if (wisdom >= 60) return 'proper-current'
  if (wisdom >= 40) return 'seasonal-creek'
  if (wisdom >= 20) return 'dry-wash'
  return 'no-river'
}

/**
 * @example classifyJadeCondition(85) // 'jade-masterpiece'
 */
export function classifyJadeCondition(score: number): JadeCondition {
  if (score >= 90) return 'jade-masterpiece'
  if (score >= 75) return 'emerald-falls'
  if (score >= 60) return 'proper-waterfall'
  if (score >= 40) return 'murky-stream'
  if (score >= 20) return 'dry-creek'
  return 'void'
}

/**
 * @example classifyPoolType(drops)
 */
export function classifyPoolType(drops: JadeDrop[]): PoolType {
  if (drops.length === 0) return 'no-pool'
  const avg = drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length
  if (avg >= 85) return 'grand-waterfall'
  if (avg >= 70) return 'jade-cascade'
  if (avg >= 55) return 'proper-pool'
  if (avg >= 35) return 'small-stream'
  if (avg >= 15) return 'dry-bed'
  return 'no-pool'
}

/**
 * @example classifyGardenerGrade(80) // 'jade-master'
 */
export function classifyGardenerGrade(avgFlow: number): GardenerGrade {
  if (avgFlow >= 80) return 'jade-master'
  if (avgFlow >= 65) return 'water-keeper'
  if (avgFlow >= 50) return 'stream-tender'
  if (avgFlow >= 35) return 'apprentice'
  if (avgFlow >= 20) return 'novice'
  return 'drought-bringer'
}

/**
 * @example classifyPoolCondition(75) // 'jade-paradise'
 */
export function classifyPoolCondition(avg: number): PoolCondition {
  if (avg >= 85) return 'jade-paradise'
  if (avg >= 70) return 'emerald-pool'
  if (avg >= 55) return 'proper-waterfall'
  if (avg >= 35) return 'murky-stream'
  if (avg >= 15) return 'dry-creek'
  return 'void'
}

// ─── measureFlowing ─────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasArrow, hasPipeline, hasReadonly = 7 → 100

/**
 * @example measureFlowing('export function flow(input: string): Result { return parse(input) }')
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasArrow = hasPattern(content, /=>/)
  const hasPipeline = hasPattern(content, /\.(map|filter|reduce|flatMap)\(/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasArrow) score += 14
  if (hasPipeline) score += 14
  if (hasReadonly) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const tangledCount = hasVar
  const circuitCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  const grace = Math.min(100, Math.max(0, score))

  return {
    grace,
    current: classifyFlowingCurrent(grace),
    hasHighGrace: grace >= 80,
    hasReadable: hasDoc && hasExport,
    hasNoCryptic: tangledCount === 0,
    hasDirect: hasReturnType && hasExport,
    hasNoCircuits: circuitCount === 0,
    hasCleanPipelines: hasReturnType && hasExport,
    hasNoTangled: tangledCount === 0,
    hasEfficient: hasReturnType && !hasAny,
    hasNoWasteful: !hasAny,
    hasSmooth: hasArrow && hasPipeline,
    hasNoJerky: !hasEval,
    hasPredictable: !hasEval && !hasAny,
    hasNoErratic: !hasEval,
    hasStreamlined: hasPipeline && !hasAny,
    hasNatural: hasDoc && hasReturnType && !hasAny,
    hasNoForced: !hasEval,
    tangledCount,
    circuitCount,
  }
}

// ─── measureCascading ───────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasNamed, hasInterface = 6 → 100

/**
 * @example measureCascading('export function cascade(input: string): Result {}')
 */
export function measureCascading(content: string): CascadingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)

  if (hasDoc) score += 17
  if (hasExport) score += 17
  if (hasReturnType) score += 17
  if (hasGenerics) score += 17
  if (hasNamed) score += 16
  if (hasInterface) score += 16

  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const mysteryCount = (hasEval ? 1 : 0) + (hasTsIgnore ? 1 : 0)
  const obfuscatedCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const clarity = Math.min(100, Math.max(0, score))

  return {
    clarity,
    step: classifyCascadingStep(clarity),
    hasHighClarity: clarity >= 80,
    hasSelfDocumenting: hasNamed && hasReturnType,
    hasNoMystery: mysteryCount === 0,
    hasClear: hasReturnType || hasDoc,
    hasNoObfuscated: obfuscatedCount === 0,
    hasTransparent: hasExport && hasReturnType,
    hasNoHidden: !hasAny,
    hasUnderstandable: hasDoc || hasNamed,
    hasNoArcane: !hasEval && !hasAny,
    hasVisible: hasExport,
    hasNoInvisible: !hasEval,
    hasDocumented: hasDoc,
    hasNoUndocumented: !hasAny,
    hasExplained: hasDoc && hasReturnType,
    hasNoSecret: !hasTsIgnore,
    hasRevealed: hasExport && hasDoc,
    hasNoConcealed: !hasEval,
    mysteryCount,
    obfuscatedCount,
  }
}

// ─── measurePooling ─────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasInterface, hasReturnType,
//   hasGenerics, hasReadonly, hasClass, hasPrivate, hasTryCatch = 9 → 100

/**
 * @example measurePooling('export interface Config<T> { readonly items: ReadonlyArray<T> }')
 */
export function measurePooling(content: string): PoolingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 11
  if (hasExport) score += 11
  if (hasInterface) score += 11
  if (hasReturnType) score += 11
  if (hasGenerics) score += 11
  if (hasReadonly) score += 11
  if (hasClass) score += 11
  if (hasPrivate) score += 11
  if (hasTryCatch) score += 12

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const hackedCount = hasVar
  const adHocCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const depth = Math.min(100, Math.max(0, score))

  return {
    depth,
    pool: classifyPoolingPool(depth),
    hasHighDepth: depth >= 80,
    hasWellArchitected: hasInterface && !hasAny,
    hasNoHacked: hackedCount === 0,
    hasPrincipled: hasGenerics && hasReturnType,
    hasNoAdHoc: adHocCount === 0,
    hasPatterned: hasInterface || hasClass,
    hasNoReinvented: !hasAny,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasDeep: hasGenerics && hasReadonly,
    hasNoShallow: !hasAny,
    hasInsightful: hasDoc && hasReturnType,
    hasNoObvious: !hasAny,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasAny,
    hasStrategic: hasTryCatch && hasGenerics,
    hackedCount,
    adHocCount,
  }
}

// ─── measureMisting ─────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasReadonly, hasPrivate, hasTryCatch = 7 → 100

/**
 * @example measureMisting('export function mist(input: Readonly<Type>): Type { try { return parse(input) } catch { throw new Error("fail") } }')
 */
export function measureMisting(content: string): MistingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasReadonly) score += 14
  if (hasPrivate) score += 14
  if (hasTryCatch) score += 14

  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const leakyCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)
  const untestedCount = hasVar

  const purity = Math.min(100, Math.max(0, score))

  return {
    purity,
    mist: classifyMistingMist(purity),
    hasHighPurity: purity >= 80,
    hasClean: !hasAny && !hasEval,
    hasNoDirty: !hasEval,
    hasAbstracted: hasGenerics && hasReturnType,
    hasNoLeaky: leakyCount === 0,
    hasEncapsulated: hasPrivate && !hasAny,
    hasNoExposed: !hasAny,
    hasModular: hasReturnType && hasExport,
    hasPrivate: hasPrivate,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasAny,
    hasTested: hasTryCatch,
    hasNoUntested: untestedCount === 0,
    hasPolished: hasReadonly && hasGenerics && !hasAny,
    leakyCount,
    untestedCount,
  }
}

// ─── measureCarrying ────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasNamed, hasInterface = 6 → 100

/**
 * @example measureCarrying('export function carry(input: string): Result {}')
 */
export function measureCarrying(content: string): CarryingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 17
  if (hasExport) score += 17
  if (hasReturnType) score += 17
  if (hasGenerics) score += 17
  if (hasNamed) score += 16
  if (hasInterface) score += 16

  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const isolatedCount = !hasExport ? 1 : 0
  const singleUseCount = hasVar + (hasAny ? 1 : 0)

  const wisdom = Math.min(100, Math.max(0, score))

  return {
    wisdom,
    river: classifyCarryingRiver(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasExported: hasExport,
    hasNoIsolated: isolatedCount === 0,
    hasReusable: hasGenerics && hasExport,
    hasNoSingleUse: singleUseCount === 0,
    hasDocumented: hasDoc,
    hasNoUndocumented: !hasAny,
    hasExtensible: hasGenerics && hasInterface,
    hasNoRigid: !hasAny,
    hasValuable: hasReturnType && hasExport,
    hasNoTrivial: hasNamed,
    hasMaintained: hasDoc && hasReturnType,
    hasNoAbandoned: !hasEval,
    hasImpactful: hasExport && hasDoc && hasReturnType,
    hasNoInsignificant: hasNamed,
    hasEnduring: hasDoc && hasExport,
    isolatedCount,
    singleUseCount,
  }
}

// ─── analyzeJadeDrop ────────────────────────────────────

/**
 * @example analyzeJadeDrop(richContent, 'cascade.ts')
 */
export function analyzeJadeDrop(content: string, filePath: string): JadeDrop {
  const flowing = measureFlowing(content)
  const cascading = measureCascading(content)
  const pooling = measurePooling(content)
  const misting = measureMisting(content)
  const carrying = measureCarrying(content)

  const flowGrace = flowing.grace
  const cascadeClarity = cascading.clarity
  const poolDepth = pooling.depth
  const mistPurity = misting.purity
  const riverWisdom = carrying.wisdom

  const qualityScore = Math.round(
    flowGrace * 0.2 +
    cascadeClarity * 0.2 +
    poolDepth * 0.2 +
    mistPurity * 0.2 +
    riverWisdom * 0.2,
  )

  return {
    file: filePath,
    flowGrace,
    cascadeClarity,
    poolDepth,
    mistPurity,
    riverWisdom,
    flowing,
    cascading,
    pooling,
    misting,
    carrying,
    condition: classifyJadeCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeJadePool ────────────────────────────────────

/**
 * @example analyzeJadePool(drops, 'src')
 */
export function analyzeJadePool(drops: JadeDrop[], dirPath: string): JadePool {
  if (drops.length === 0) {
    return {
      directory: dirPath,
      drops: [],
      avgGrace: 0,
      avgClarity: 0,
      avgWisdom: 0,
      jadeMasterpieceCount: 0,
      voidCount: 0,
      poolType: 'no-pool',
      condition: 'void',
    }
  }

  const avgGrace = Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length)
  const avgClarity = Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / drops.length)
  const avgWisdom = Math.round(drops.reduce((s, d) => s + d.riverWisdom, 0) / drops.length)

  const jadeMasterpieceCount = drops.filter(d => d.condition === 'jade-masterpiece').length
  const voidCount = drops.filter(d => d.condition === 'void').length

  const poolType = classifyPoolType(drops)
  const overallAvg = Math.round((avgGrace + avgClarity + avgWisdom) / 3)

  return {
    directory: dirPath,
    drops,
    avgGrace,
    avgClarity,
    avgWisdom,
    jadeMasterpieceCount,
    voidCount,
    poolType,
    condition: classifyPoolCondition(overallAvg),
  }
}

// ─── generateRecommendations ────────────────────────────

/**
 * @example generateRecommendations(drops, pools, river, stats)
 */
export function generateRecommendations(
  drops: JadeDrop[],
  pools: JadePool[],
  river: JadeRiver,
  stats: JadeStats,
): string[] {
  const recs: string[] = []

  if (river.overallFlow >= 90 && stats.voidCount === 0) {
    recs.push('Your jade waterfall flows with perfection! Every drop is wisdom, every cascade is clarity')
    return recs
  }

  if (stats.avgFlowGrace < 50) {
    recs.push('Improve flow grace — add exports, return types, and pipeline patterns for natural execution flow')
  }
  if (stats.avgCascadeClarity < 50) {
    recs.push('Improve cascade clarity — add documentation, clear naming, and transparent logic')
  }
  if (stats.avgPoolDepth < 50) {
    recs.push('Deepen the pools — add interfaces, generics, error handling, and proven patterns')
  }
  if (stats.avgMistPurity < 50) {
    recs.push('Purify the mist — add type safety, encapsulation, and clean abstractions')
  }
  if (stats.avgRiverWisdom < 50) {
    recs.push('Increase river wisdom — add exports, documentation, and extensible patterns for downstream impact')
  }

  const dry = drops.filter(d => d.condition === 'void' || d.condition === 'dry-creek')
  if (dry.length > 0 && dry.length <= 3) {
    recs.push(`Restore these dry creeks: ${dry.map(d => d.file).join(', ')}`)
  } else if (dry.length > 3) {
    recs.push(`${dry.length} dry creeks need restoration — prioritize the most parched`)
  }

  const badPools = pools.filter(p => p.poolType === 'dry-bed' || p.poolType === 'no-pool')
  if (badPools.length > 0) {
    recs.push(`${badPools.length} pool(s) are dry or empty — consider restructuring or removing dead code`)
  }

  if (!river.isJade) {
    recs.push('Overall flow is below 60 — focus on improving core code quality')
  }

  if (recs.length === 0) {
    recs.push('The jade waterfall endures — keep flowing with wisdom')
  }

  return recs
}

// ─── gatherFiles ────────────────────────────────────────

/**
 * @example gatherFiles('/path', ['.ts'], ['ignore-patterns'])
 */
export async function gatherFiles(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*${ext}`)
  const entries = await fg(patterns, {
    cwd: rootDir,
    ignore: ignorePatterns,
    absolute: false,
    onlyFiles: true,
  })
  return entries.sort()
}

// ─── buildJadeWaterfallResult ───────────────────────────

/**
 * @example buildJadeWaterfallResult(['a.ts'], [content])
 */
export async function buildJadeWaterfallResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeWaterfallResult> {
  const drops = files.map((file, i) =>
    analyzeJadeDrop(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, JadeDrop[]>()
  for (const d of drops) {
    const dir = dirname(d.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(d)
    } else {
      dirMap.set(dir, [d])
    }
  }

  const pools = Array.from(dirMap.entries()).map(([dir, ds]) =>
    analyzeJadePool(ds, dir),
  )

  const totalFiles = drops.length
  const avgFlowGrace = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / totalFiles) : 0
  const avgCascadeClarity = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / totalFiles) : 0
  const avgPoolDepth = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.poolDepth, 0) / totalFiles) : 0
  const avgMistPurity = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.mistPurity, 0) / totalFiles) : 0
  const avgRiverWisdom = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.riverWisdom, 0) / totalFiles) : 0

  const overallFlow = Math.round(
    (avgFlowGrace + avgCascadeClarity + avgPoolDepth + avgMistPurity + avgRiverWisdom) / 5,
  )

  const bestBy = (fn: (d: JadeDrop) => number) =>
    drops.length > 0 ? drops.reduce((best, d) => fn(d) > fn(best) ? d : best).file : 'none'

  const stats: JadeStats = {
    totalFiles,
    totalPools: pools.length,
    avgFlowGrace,
    avgCascadeClarity,
    avgPoolDepth,
    avgMistPurity,
    avgRiverWisdom,
    jadeMasterpieceCount: drops.filter(d => d.condition === 'jade-masterpiece').length,
    emeraldFallsCount: drops.filter(d => d.condition === 'emerald-falls').length,
    properWaterfallCount: drops.filter(d => d.condition === 'proper-waterfall').length,
    murkyStreamCount: drops.filter(d => d.condition === 'murky-stream').length,
    dryCreekCount: drops.filter(d => d.condition === 'dry-creek').length,
    voidCount: drops.filter(d => d.condition === 'void').length,
    hasHighGraceCount: drops.filter(d => d.flowing.hasHighGrace).length,
    hasHighClarityCount: drops.filter(d => d.cascading.hasHighClarity).length,
    hasHighDepthCount: drops.filter(d => d.pooling.hasHighDepth).length,
    hasHighPurityCount: drops.filter(d => d.misting.hasHighPurity).length,
    hasHighWisdomCount: drops.filter(d => d.carrying.hasHighWisdom).length,
    overallFlow,
    gardenerGrade: classifyGardenerGrade(overallFlow),
    bestDrop: bestBy(d => d.qualityScore),
    mostGraceful: bestBy(d => d.flowGrace),
    clearest: bestBy(d => d.cascadeClarity),
    deepest: bestBy(d => d.poolDepth),
    purest: bestBy(d => d.mistPurity),
    wisest: bestBy(d => d.riverWisdom),
  }

  const river: JadeRiver = {
    avgGrace: avgFlowGrace,
    avgClarity: avgCascadeClarity,
    avgWisdom: avgRiverWisdom,
    isJade: overallFlow >= 60,
    overallFlow,
  }

  const recommendations = generateRecommendations(drops, pools, river, stats)

  return { drops, pools, river, stats, recommendations }
}
