// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type FlowGrade = 'silk-waterfall' | 'graceful-cascade' | 'proper-flow' | 'turbulent-rapids' | 'blocked-stream' | 'no-flow'
export type CascadeGrade = 'crystal-steps' | 'clear-terraces' | 'proper-cascade' | 'murky-drops' | 'muddy-slide' | 'no-cascade'
export type PoolGrade = 'deep-jade-pool' | 'proper-depth' | 'decent-pond' | 'shallow-puddle' | 'surface-drip' | 'no-pool'
export type MossGrade = 'ancient-moss' | 'thriving-green' | 'proper-growth' | 'wilting-fern' | 'dead-lichen' | 'no-growth'
export type MistGrade = 'crystal-mist' | 'clear-vapor' | 'proper-transparency' | 'foggy-haze' | 'dense-fog' | 'opaque'
export type DropCondition = 'jade-masterpiece' | 'emerald-falls' | 'proper-waterfall' | 'trickling-stream' | 'dry-bed' | 'drought'
export type TerraceType = 'grand-waterfall' | 'terraced-falls' | 'proper-cascade' | 'small-rapids' | 'drip-trickle' | 'no-terrace'
export type TerraceCondition = 'magnificent-falls' | 'beautiful-cascade' | 'decent-waterfall' | 'modest-stream' | 'dry-cliff' | 'void'
export type KeeperGrade = 'water-master' | 'river-guardian' | 'skilled-steward' | 'apprentice' | 'novice' | 'drought-bringer'

export interface FlowingMeasure {
  grace: number
  grade: FlowGrade
  hasHighGrace: boolean
  hasElegantDataFlow: boolean
  hasCleanTransformations: boolean
  hasNoTangled: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasPipelined: boolean
  hasNoAdhoc: boolean
  hasSequential: boolean
  hasNoRandom: boolean
  hasSmooth: boolean
  tangledCount: number
  circuitCount: number
}

export interface CascadingMeasure {
  clarity: number
  cascade: CascadeGrade
  hasHighClarity: boolean
  hasClearSteps: boolean
  hasDocumentedTransformations: boolean
  hasNoHiddenSteps: boolean
  hasVisiblePipeline: boolean
  hasNoBlackBoxes: boolean
  hasTraceable: boolean
  hasNoUntraceable: boolean
  hasProgressive: boolean
  hasNoAllAtOnce: boolean
  hasExplicit: boolean
  hiddenStepCount: number
  blackBoxCount: number
}

export interface GatheringMeasure {
  depth: number
  pool: PoolGrade
  hasHighDepth: boolean
  hasManagedState: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasPersistent: boolean
  hasNoLost: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasDeep: boolean
  mutableCount: number
  leakedCount: number
}

export interface ThrivingMeasure {
  resilience: number
  moss: MossGrade
  hasHighResilience: boolean
  hasErrorHandling: boolean
  hasEdgeCaseCoverage: boolean
  hasNoBareCrash: boolean
  hasDefensiveCode: boolean
  hasNoTrusting: boolean
  hasRetryLogic: boolean
  hasNoSingleFail: boolean
  hasFallbackPaths: boolean
  hasNoDeadEnd: boolean
  hasHardy: boolean
  bareCrashCount: number
  trustingCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  mist: MistGrade
  hasHighClarity: boolean
  hasTransparentLogic: boolean
  hasReadableComplexity: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasUnderstandable: boolean
  hasNoImpenetrable: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface WaterDrop {
  file: string
  flowGrace: number
  cascadeClarity: number
  poolDepth: number
  mossResilience: number
  mistClarity: number
  flowing: FlowingMeasure
  cascading: CascadingMeasure
  gathering: GatheringMeasure
  thriving: ThrivingMeasure
  clarifying: ClarifyingMeasure
  condition: DropCondition
  qualityScore: number
}

export interface WaterfallTerrace {
  directory: string
  drops: WaterDrop[]
  avgGrace: number
  avgDepth: number
  avgClarity: number
  jadeMasterpieceCount: number
  droughtCount: number
  terraceType: TerraceType
  condition: TerraceCondition
}

export interface JadeRiver {
  avgGrace: number
  avgDepth: number
  avgClarity: number
  isFlowing: boolean
  overallSerenity: number
}

export interface JadeWaterfallStats {
  totalFiles: number
  totalTerraces: number
  avgFlowGrace: number
  avgCascadeClarity: number
  avgPoolDepth: number
  avgMossResilience: number
  avgMistClarity: number
  jadeMasterpieceCount: number
  emeraldFallsCount: number
  properWaterfallCount: number
  tricklingStreamCount: number
  dryBedCount: number
  droughtCount: number
  hasHighGraceCount: number
  hasHighClarityCount: number
  hasHighDepthCount: number
  hasHighResilienceCount: number
  hasHighMistClarityCount: number
  overallSerenity: number
  keeperGrade: KeeperGrade
  bestDrop: string
  mostGraceful: string
  clearestCascade: string
  deepest: string
  mostResilient: string
}

export interface JadeWaterfallResult {
  drops: WaterDrop[]
  terraces: WaterfallTerrace[]
  river: JadeRiver
  stats: JadeWaterfallStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure flow grace
 * @example
 * const m = measureFlowing(content)
 * console.log(m.grade) // 'silk-waterfall'
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasArrowFunction(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasElegantDataFlow = hasMapFunction(content) && hasArrowFunction(content)
  const hasCleanTransformations = hasConst(content) && hasReturnType(content)
  const hasStreamlined = hasNamedExport(content) && hasAsync(content)
  const hasPipelined = hasMapFunction(content) && hasGenerics(content)
  const hasSequential = hasExport(content) && hasImport(content)
  const hasSmooth = hasInterface(content) && hasStrictEq(content)

  score += hasElegantDataFlow ? 5 : 0
  score += hasCleanTransformations ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasPipelined ? 5 : 0
  score += hasSequential ? 5 : 0
  score += hasSmooth ? 5 : 0

  const grace = Math.min(score, 100)
  const tangledCount = countMatches(/\bvar\b/, content)
  const circuitCount = countMatches(/\bany\b/, content)

  const hasNoTangled = tangledCount === 0
  const hasNoCircuits = circuitCount === 0
  const hasNoAdhoc = !has(/\beval\b/, content)
  const hasNoRandom = !has(/\bdebugger\b/, content)
  const hasHighGrace = grace >= 70

  let grade: FlowGrade
  if (grace >= 85) grade = 'silk-waterfall'
  else if (grace >= 70) grade = 'graceful-cascade'
  else if (grace >= 55) grade = 'proper-flow'
  else if (grace >= 40) grade = 'turbulent-rapids'
  else if (grace >= 25) grade = 'blocked-stream'
  else grade = 'no-flow'

  return {
    grace, grade, hasHighGrace, hasElegantDataFlow, hasCleanTransformations,
    hasNoTangled, hasStreamlined, hasNoCircuits, hasPipelined, hasNoAdhoc,
    hasSequential, hasNoRandom, hasSmooth, tangledCount, circuitCount,
  }
}

/**
 * Measure cascade clarity
 * @example
 * const m = measureCascading(content)
 * console.log(m.cascade) // 'crystal-steps'
 */
export function measureCascading(content: string): CascadingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasClearSteps = hasDocComments(content) && hasReturnType(content)
  const hasDocumentedTransformations = hasInterface(content) && hasNamedExport(content)
  const hasVisiblePipeline = hasMapFunction(content) && hasArrowFunction(content)
  const hasTraceable = hasTypeAlias(content) && hasGenerics(content)
  const hasProgressive = hasOptional(content) && hasStrictEq(content)
  const hasExplicit = hasConst(content) && hasEnum(content)

  score += hasClearSteps ? 5 : 0
  score += hasDocumentedTransformations ? 5 : 0
  score += hasVisiblePipeline ? 5 : 0
  score += hasTraceable ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasExplicit ? 5 : 0

  const clarity = Math.min(score, 100)
  const hiddenStepCount = countMatches(/\bvar\b/, content)
  const blackBoxCount = countMatches(/\bany\b/, content)

  const hasNoHiddenSteps = hiddenStepCount === 0
  const hasNoBlackBoxes = blackBoxCount === 0
  const hasNoUntraceable = !has(/\beval\b/, content)
  const hasNoAllAtOnce = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let cascade: CascadeGrade
  if (clarity >= 85) cascade = 'crystal-steps'
  else if (clarity >= 70) cascade = 'clear-terraces'
  else if (clarity >= 55) cascade = 'proper-cascade'
  else if (clarity >= 40) cascade = 'murky-drops'
  else if (clarity >= 25) cascade = 'muddy-slide'
  else cascade = 'no-cascade'

  return {
    clarity, cascade, hasHighClarity, hasClearSteps, hasDocumentedTransformations,
    hasNoHiddenSteps, hasVisiblePipeline, hasNoBlackBoxes, hasTraceable, hasNoUntraceable,
    hasProgressive, hasNoAllAtOnce, hasExplicit, hiddenStepCount, blackBoxCount,
  }
}

/**
 * Measure pool depth
 * @example
 * const m = measureGathering(content)
 * console.log(m.pool) // 'deep-jade-pool'
 */
export function measureGathering(content: string): GatheringMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasManagedState = hasInterface(content) && hasReadonly(content)
  const hasImmutable = hasConst(content) && hasReturnType(content)
  const hasEncapsulated = hasEnum(content) && hasTypeAlias(content)
  const hasPersistent = hasOptional(content) && hasGenerics(content)
  const hasStructured = hasExport(content) && hasNamedExport(content)
  const hasDeep = hasDocComments(content) && hasStrictEq(content)

  score += hasManagedState ? 5 : 0
  score += hasImmutable ? 5 : 0
  score += hasEncapsulated ? 5 : 0
  score += hasPersistent ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasDeep ? 5 : 0

  const depth = Math.min(score, 100)
  const mutableCount = countMatches(/\bvar\b/, content)
  const leakedCount = countMatches(/\bany\b/, content)

  const hasNoMutable = mutableCount === 0
  const hasNoLeaked = leakedCount === 0
  const hasNoLost = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let pool: PoolGrade
  if (depth >= 85) pool = 'deep-jade-pool'
  else if (depth >= 70) pool = 'proper-depth'
  else if (depth >= 55) pool = 'decent-pond'
  else if (depth >= 40) pool = 'shallow-puddle'
  else if (depth >= 25) pool = 'surface-drip'
  else pool = 'no-pool'

  return {
    depth, pool, hasHighDepth, hasManagedState, hasImmutable, hasNoMutable,
    hasEncapsulated, hasNoLeaked, hasPersistent, hasNoLost, hasStructured,
    hasNoChaotic, hasDeep, mutableCount, leakedCount,
  }
}

/**
 * Measure moss resilience
 * @example
 * const m = measureThriving(content)
 * console.log(m.moss) // 'ancient-moss'
 */
export function measureThriving(content: string): ThrivingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasErrorHandling = hasTryCatch(content) && hasThrow(content)
  const hasEdgeCaseCoverage = hasStrictEq(content) && hasReturnType(content)
  const hasDefensiveCode = hasAsync(content) && hasConst(content)
  const hasRetryLogic = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasFallbackPaths = hasOptional(content) && hasConditional(content)
  const hasHardy = hasInterface(content) && hasEnum(content)

  score += hasErrorHandling ? 5 : 0
  score += hasEdgeCaseCoverage ? 5 : 0
  score += hasDefensiveCode ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasFallbackPaths ? 5 : 0
  score += hasHardy ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const trustingCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoTrusting = trustingCount === 0
  const hasNoSingleFail = !has(/\beval\b/, content)
  const hasNoDeadEnd = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let moss: MossGrade
  if (resilience >= 85) moss = 'ancient-moss'
  else if (resilience >= 70) moss = 'thriving-green'
  else if (resilience >= 55) moss = 'proper-growth'
  else if (resilience >= 40) moss = 'wilting-fern'
  else if (resilience >= 25) moss = 'dead-lichen'
  else moss = 'no-growth'

  return {
    resilience, moss, hasHighResilience, hasErrorHandling, hasEdgeCaseCoverage,
    hasNoBareCrash, hasDefensiveCode, hasNoTrusting, hasRetryLogic, hasNoSingleFail,
    hasFallbackPaths, hasNoDeadEnd, hasHardy, bareCrashCount, trustingCount,
  }
}

/**
 * Measure mist clarity
 * @example
 * const m = measureClarifying(content)
 * console.log(m.mist) // 'crystal-mist'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasTransparentLogic = hasDocComments(content) && hasExport(content)
  const hasReadableComplexity = hasReturnType(content) && hasImport(content)
  const hasSelfDocumenting = hasInterface(content) && hasNamedExport(content)
  const hasUnderstandable = hasTypeAlias(content) && hasGenerics(content)
  const hasVisible = hasConst(content) && hasStrictEq(content)
  const hasClear = hasEnum(content) && hasAsync(content)

  score += hasTransparentLogic ? 5 : 0
  score += hasReadableComplexity ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoImpenetrable = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let mist: MistGrade
  if (clarity >= 85) mist = 'crystal-mist'
  else if (clarity >= 70) mist = 'clear-vapor'
  else if (clarity >= 55) mist = 'proper-transparency'
  else if (clarity >= 40) mist = 'foggy-haze'
  else if (clarity >= 25) mist = 'dense-fog'
  else mist = 'opaque'

  return {
    clarity, mist, hasHighClarity, hasTransparentLogic, hasReadableComplexity,
    hasNoObfuscated, hasSelfDocumenting, hasNoCryptic, hasUnderstandable,
    hasNoImpenetrable, hasVisible, hasNoHidden, hasClear, obfuscatedCount, crypticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify drop condition
 * @example
 * classifyDropCondition(90) // 'jade-masterpiece'
 */
export function classifyDropCondition(score: number): DropCondition {
  if (score >= 85) return 'jade-masterpiece'
  if (score >= 70) return 'emerald-falls'
  if (score >= 55) return 'proper-waterfall'
  if (score >= 40) return 'trickling-stream'
  if (score >= 25) return 'dry-bed'
  return 'drought'
}

/**
 * Classify terrace type
 * @example
 * classifyTerraceType(drops) // 'grand-waterfall'
 */
export function classifyTerraceType(drops: WaterDrop[]): TerraceType {
  if (drops.length === 0) return 'no-terrace'
  const avgQs = Math.round(drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length)
  const jadeRatio = drops.filter(d => d.condition === 'jade-masterpiece').length / drops.length
  if (avgQs >= 75 && jadeRatio >= 0.5) return 'grand-waterfall'
  if (avgQs >= 60) return 'terraced-falls'
  if (avgQs >= 45) return 'proper-cascade'
  if (avgQs >= 30) return 'small-rapids'
  if (avgQs >= 15) return 'drip-trickle'
  return 'no-terrace'
}

/**
 * Classify terrace condition
 * @example
 * classifyTerraceCondition(80) // 'magnificent-falls'
 */
export function classifyTerraceCondition(avgQs: number): TerraceCondition {
  if (avgQs >= 75) return 'magnificent-falls'
  if (avgQs >= 60) return 'beautiful-cascade'
  if (avgQs >= 45) return 'decent-waterfall'
  if (avgQs >= 30) return 'modest-stream'
  if (avgQs >= 15) return 'dry-cliff'
  return 'void'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'water-master'
 */
export function classifyKeeperGrade(avgSerenity: number): KeeperGrade {
  if (avgSerenity >= 80) return 'water-master'
  if (avgSerenity >= 65) return 'river-guardian'
  if (avgSerenity >= 50) return 'skilled-steward'
  if (avgSerenity >= 35) return 'apprentice'
  if (avgSerenity >= 20) return 'novice'
  return 'drought-bringer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(drops, terraces, river, stats)
 */
export function generateRecommendations(
  drops: WaterDrop[],
  terraces: WaterfallTerrace[],
  river: JadeRiver,
  stats: JadeWaterfallStats,
): string[] {
  const recs: string[] = []
  if (stats.avgFlowGrace < 50) {
    recs.push('Improve flow grace with streamlined data transformations, pipelined operations, and elegant data flow')
  }
  if (stats.avgCascadeClarity < 50) {
    recs.push('Clarify cascade steps with documented transformations, visible pipelines, and traceable operations')
  }
  if (stats.avgPoolDepth < 50) {
    recs.push('Deepen pool depth with managed state, immutable patterns, and encapsulated data structures')
  }
  if (stats.avgMossResilience < 50) {
    recs.push('Strengthen moss resilience with error handling, defensive code, and fallback paths')
  }
  if (stats.avgMistClarity < 50) {
    recs.push('Clear the mist with transparent logic, self-documenting code, and readable complexity')
  }
  if (stats.droughtCount > 0) {
    recs.push(`${stats.droughtCount} file(s) are in drought — they need complete water restoration`)
  }
  if (river.overallSerenity < 40) {
    recs.push('Overall serenity is low — focus on flow grace and cascade clarity first')
  }
  const allDrought = terraces.every(t => t.terraceType === 'no-terrace' || t.terraceType === 'drip-trickle')
  if (allDrought && terraces.length > 0) {
    recs.push('All terraces are dry — consider a major waterfall reconstruction')
  }
  const droughtDrops = drops.filter(d => d.condition === 'drought').map(d => d.file)
  if (droughtDrops.length > 0 && droughtDrops.length <= 3) {
    recs.push(`Restore these drought-stricken files: ${droughtDrops.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your jade waterfall flows with perfect serenity! Every drop is a jade masterpiece in the grand waterfall')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as water drop
 * @example
 * const d = analyzeWaterDrop(content, 'index.ts')
 * console.log(d.condition) // 'jade-masterpiece'
 */
export function analyzeWaterDrop(content: string, filePath: string): WaterDrop {
  const flowing = measureFlowing(content)
  const cascading = measureCascading(content)
  const gathering = measureGathering(content)
  const thriving = measureThriving(content)
  const clarifying = measureClarifying(content)

  const qualityScore = Math.round(
    flowing.grace * 0.2 +
    cascading.clarity * 0.2 +
    gathering.depth * 0.2 +
    thriving.resilience * 0.2 +
    clarifying.clarity * 0.2,
  )

  return {
    file: filePath,
    flowGrace: flowing.grace,
    cascadeClarity: cascading.clarity,
    poolDepth: gathering.depth,
    mossResilience: thriving.resilience,
    mistClarity: clarifying.clarity,
    flowing,
    cascading,
    gathering,
    thriving,
    clarifying,
    condition: classifyDropCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as waterfall terrace
 * @example
 * const t = analyzeWaterfallTerrace(drops, 'src')
 * console.log(t.terraceType) // 'grand-waterfall'
 */
export function analyzeWaterfallTerrace(drops: WaterDrop[], dirPath: string): WaterfallTerrace {
  if (drops.length === 0) {
    return {
      directory: dirPath, drops: [], avgGrace: 0, avgDepth: 0,
      avgClarity: 0, jadeMasterpieceCount: 0, droughtCount: 0,
      terraceType: 'no-terrace', condition: 'void',
    }
  }

  const avgGrace = Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length)
  const avgDepth = Math.round(drops.reduce((s, d) => s + d.poolDepth, 0) / drops.length)
  const avgClarity = Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / drops.length)
  const jadeMasterpieceCount = drops.filter(d => d.condition === 'jade-masterpiece').length
  const droughtCount = drops.filter(d => d.condition === 'drought').length
  const avgQs = Math.round(drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length)

  return {
    directory: dirPath, drops, avgGrace, avgDepth, avgClarity,
    jadeMasterpieceCount, droughtCount,
    terraceType: classifyTerraceType(drops),
    condition: classifyTerraceCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete jade waterfall result
 * @example
 * const result = await buildJadeWaterfallResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'water-master'
 */
export async function buildJadeWaterfallResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeWaterfallResult> {
  const drops = files.map((file, i) => analyzeWaterDrop(contents[i] ?? '', file))

  const dirMap = new Map<string, WaterDrop[]>()
  for (const drop of drops) {
    const dir = path.dirname(drop.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(drop) } else { dirMap.set(dir, [drop]) }
  }

  const terraces = Array.from(dirMap.entries()).map(([dir, dirDrops]) =>
    analyzeWaterfallTerrace(dirDrops, dir),
  )

  const avgGrace = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length) : 0
  const avgDepth = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.poolDepth, 0) / drops.length) : 0
  const avgClarity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / drops.length) : 0

  const overallSerenity = drops.length > 0
    ? Math.round((avgGrace + avgDepth + avgClarity) / 3) : 0
  const isFlowing = avgGrace >= 60

  const river: JadeRiver = { avgGrace, avgDepth, avgClarity, isFlowing, overallSerenity }

  const avgMossResilience = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.mossResilience, 0) / drops.length) : 0
  const avgMistClarity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.mistClarity, 0) / drops.length) : 0

  const bestDrop = drops.length > 0
    ? drops.reduce((best, d) => d.qualityScore > best.qualityScore ? d : best).file : ''
  const mostGraceful = drops.length > 0
    ? drops.reduce((best, d) => d.flowGrace > best.flowGrace ? d : best).file : ''
  const clearestCascade = drops.length > 0
    ? drops.reduce((best, d) => d.cascadeClarity > best.cascadeClarity ? d : best).file : ''
  const deepest = drops.length > 0
    ? drops.reduce((best, d) => d.poolDepth > best.poolDepth ? d : best).file : ''
  const mostResilient = drops.length > 0
    ? drops.reduce((best, d) => d.mossResilience > best.mossResilience ? d : best).file : ''

  const stats: JadeWaterfallStats = {
    totalFiles: drops.length,
    totalTerraces: terraces.length,
    avgFlowGrace: avgGrace,
    avgCascadeClarity: avgClarity,
    avgPoolDepth: avgDepth,
    avgMossResilience,
    avgMistClarity,
    jadeMasterpieceCount: drops.filter(d => d.condition === 'jade-masterpiece').length,
    emeraldFallsCount: drops.filter(d => d.condition === 'emerald-falls').length,
    properWaterfallCount: drops.filter(d => d.condition === 'proper-waterfall').length,
    tricklingStreamCount: drops.filter(d => d.condition === 'trickling-stream').length,
    dryBedCount: drops.filter(d => d.condition === 'dry-bed').length,
    droughtCount: drops.filter(d => d.condition === 'drought').length,
    hasHighGraceCount: drops.filter(d => d.flowing.hasHighGrace).length,
    hasHighClarityCount: drops.filter(d => d.cascading.hasHighClarity).length,
    hasHighDepthCount: drops.filter(d => d.gathering.hasHighDepth).length,
    hasHighResilienceCount: drops.filter(d => d.thriving.hasHighResilience).length,
    hasHighMistClarityCount: drops.filter(d => d.clarifying.hasHighClarity).length,
    overallSerenity,
    keeperGrade: classifyKeeperGrade(overallSerenity),
    bestDrop, mostGraceful, clearestCascade, deepest, mostResilient,
  }

  const recommendations = generateRecommendations(drops, terraces, river, stats)

  return { drops, terraces, river, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
