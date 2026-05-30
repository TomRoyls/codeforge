// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Clarity grade */
export type ClarityGrade =
  | 'crystal-waters'
  | 'clear-depth'
  | 'proper-transparency'
  | 'murky-waters'
  | 'cloudy-depth'
  | 'opaque-sea'

/** Tide grade */
export type TideGrade =
  | 'perfect-tide'
  | 'steady-current'
  | 'proper-rhythm'
  | 'irregular-wave'
  | 'chaotic-surf'
  | 'still-water'

/** Coral grade */
export type CoralGrade =
  | 'great-barrier'
  | 'vibrant-reef'
  | 'proper-ecosystem'
  | 'bleached-coral'
  | 'dead-reef'
  | 'no-ecosystem'

/** Current grade */
export type CurrentGrade =
  | 'gulf-stream'
  | 'strong-current'
  | 'proper-flow'
  | 'sluggish-creek'
  | 'stagnant-pool'
  | 'no-flow'

/** Abyss grade */
export type AbyssGrade =
  | 'mariana-trench'
  | 'deep-survivor'
  | 'proper-depth'
  | 'pressure-crack'
  | 'crushed-hull'
  | 'no-depth'

/** Wave condition */
export type WaveCondition =
  | 'sapphire-masterpiece'
  | 'ocean-jewel'
  | 'proper-sea'
  | 'murky-puddle'
  | 'stagnant-pond'
  | 'dry-land'

/** Depth type */
export type DepthType =
  | 'mariana-trench'
  | 'continental-shelf'
  | 'proper-ocean'
  | 'shallow-sea'
  | 'tidal-pool'
  | 'no-ocean'

/** Depth condition */
export type DepthCondition =
  | 'pristine-ocean'
  | 'clear-waters'
  | 'decent-sea'
  | 'murky-waters'
  | 'polluted-bay'
  | 'void'

/** Navigator grade */
export type NavigatorGrade =
  | 'ocean-master'
  | 'deep-sea-captain'
  | 'skilled-sailor'
  | 'apprentice'
  | 'novice'
  | 'landlubber'

/** Clarifying measurement */
export interface ClarifyingMeasure {
  depth: number
  grade: ClarityGrade
  hasHighDepth: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasClear: boolean
  obfuscatedCount: number
  crypticCount: number
}

/** Pulsing measurement */
export interface PulsingMeasure {
  rhythm: number
  tide: TideGrade
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasPerformant: boolean
  hasNoSluggish: boolean
  hasPredictable: boolean
  hasNoErratic: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasTimely: boolean
  sluggishCount: number
  erraticCount: number
}

/** Thriving measurement */
export interface ThrivingMeasure {
  diversity: number
  coral: CoralGrade
  hasHighDiversity: boolean
  hasMultiplePatterns: boolean
  hasVariedApproaches: boolean
  hasNoSinglePattern: boolean
  hasRichAPI: boolean
  hasNoMinimalAPI: boolean
  hasDiverseTypes: boolean
  hasNoUniformTypes: boolean
  hasMultipleMethods: boolean
  hasNoSingleMethod: boolean
  hasColorful: boolean
  singlePatternCount: number
  minimalAPICount: number
}

/** Flowing measurement */
export interface FlowingMeasure {
  efficiency: number
  current: CurrentGrade
  hasHighEfficiency: boolean
  hasStreamlined: boolean
  hasNoBottlenecks: boolean
  hasDirectPaths: boolean
  hasNoCircuits: boolean
  hasOptimized: boolean
  hasNoRedundant: boolean
  hasCached: boolean
  hasNoRecalculating: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  bottleneckCount: number
  circuitCount: number
}

/** Diving measurement */
export interface DivingMeasure {
  resilience: number
  abyss: AbyssGrade
  hasHighResilience: boolean
  hasErrorHandling: boolean
  hasExceptionRecovery: boolean
  hasNoBareCrash: boolean
  hasEdgeCaseCoverage: boolean
  hasNoUncovered: boolean
  hasNullSafe: boolean
  hasNoBareDereference: boolean
  hasBoundaryChecks: boolean
  hasNoUnbounded: boolean
  hasFaultTolerant: boolean
  bareCrashCount: number
  uncoveredCount: number
}

/** Single file analysis */
export interface OceanWave {
  file: string
  depthClarity: number
  tidalRhythm: number
  coralDiversity: number
  currentEfficiency: number
  abyssResilience: number
  clarifying: ClarifyingMeasure
  pulsing: PulsingMeasure
  thriving: ThrivingMeasure
  flowing: FlowingMeasure
  diving: DivingMeasure
  condition: WaveCondition
  qualityScore: number
}

/** Directory-level depth */
export interface OceanDepth {
  directory: string
  waves: OceanWave[]
  avgClarity: number
  avgRhythm: number
  avgResilience: number
  sapphireMasterpieceCount: number
  dryLandCount: number
  depthType: DepthType
  condition: DepthCondition
}

/** Ocean summary */
export interface OceanSummary {
  avgClarity: number
  avgRhythm: number
  avgResilience: number
  isPristine: boolean
  overallDepth: number
}

/** Celebration info */
export interface CelebrationInfo {
  milestone: number
  name: string
  message: string
  previousMilestones: number[]
  totalTests: number
}

/** Full stats */
export interface SapphireOceanStats {
  totalFiles: number
  totalDepths: number
  avgDepthClarity: number
  avgTidalRhythm: number
  avgCoralDiversity: number
  avgCurrentEfficiency: number
  avgAbyssResilience: number
  sapphireMasterpieceCount: number
  oceanJewelCount: number
  properSeaCount: number
  murkyPuddleCount: number
  stagnantPondCount: number
  dryLandCount: number
  hasHighDepthCount: number
  hasHighRhythmCount: number
  hasHighDiversityCount: number
  hasHighEfficiencyCount: number
  hasHighResilienceCount: number
  overallDepth: number
  navigatorGrade: NavigatorGrade
  bestWave: string
  clearest: string
  bestRhythm: string
  mostDiverse: string
  mostEfficient: string
}

/** Full result */
export interface SapphireOceanResult {
  waves: OceanWave[]
  depths: OceanDepth[]
  ocean: OceanSummary
  celebration: CelebrationInfo
  stats: SapphireOceanStats
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
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasTernary = (c: string) => has(/\?[^?]*:/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasFunction = (c: string) => has(/\bfunction\b/, c)
const hasMethod = (c: string) => has(/\b(?:get|set|static|abstract)\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure depth clarity (clarifying)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.grade) // 'crystal-waters'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasReadable = hasExport(content) && hasReturnType(content)
  const hasTransparent = hasInterface(content) && hasDocComments(content)
  const hasSelfDocumenting = hasReturnType(content) && hasConst(content)
  const hasLayered = hasImport(content) && hasExport(content)
  const hasStructured = hasInterface(content) && hasConst(content)
  const hasClear = hasNamedExport(content) && hasReturnType(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasClear ? 5 : 0

  const depth = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoFlat = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grade: ClarityGrade
  if (depth >= 85) grade = 'crystal-waters'
  else if (depth >= 70) grade = 'clear-depth'
  else if (depth >= 55) grade = 'proper-transparency'
  else if (depth >= 40) grade = 'murky-waters'
  else if (depth >= 25) grade = 'cloudy-depth'
  else grade = 'opaque-sea'

  return {
    depth, grade, hasHighDepth, hasReadable, hasTransparent, hasNoObfuscated,
    hasSelfDocumenting, hasNoCryptic, hasLayered, hasNoFlat, hasStructured,
    hasNoChaotic, hasClear, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure tidal rhythm (pulsing)
 * @example
 * const m = measurePulsing(content)
 * console.log(m.tide) // 'perfect-tide'
 */
export function measurePulsing(content: string): PulsingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasTernary(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0

  const hasConsistent = hasStrictEq(content) && hasConst(content)
  const hasPerformant = hasConst(content) && hasReturnType(content)
  const hasPredictable = hasReturnType(content) && hasExport(content)
  const hasSmooth = hasAsync(content) && hasArrowFunction(content)
  const hasEfficient = hasMapFunction(content) && hasConst(content)
  const hasTimely = hasConditional(content) && hasReturnType(content)

  score += hasConsistent ? 5 : 0
  score += hasPerformant ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasTimely ? 5 : 0

  const rhythm = Math.min(score, 100)
  const sluggishCount = countMatches(/\bvar\b/, content)
  const erraticCount = countMatches(/\bany\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoErratic = erraticCount === 0
  const hasNoJerky = !has(/\beval\b/, content)
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighRhythm = rhythm >= 70

  let tide: TideGrade
  if (rhythm >= 85) tide = 'perfect-tide'
  else if (rhythm >= 70) tide = 'steady-current'
  else if (rhythm >= 55) tide = 'proper-rhythm'
  else if (rhythm >= 40) tide = 'irregular-wave'
  else if (rhythm >= 25) tide = 'chaotic-surf'
  else tide = 'still-water'

  return {
    rhythm, tide, hasHighRhythm, hasConsistent, hasPerformant, hasNoSluggish,
    hasPredictable, hasNoErratic, hasSmooth, hasNoJerky, hasEfficient,
    hasNoWasteful, hasTimely, sluggishCount, erraticCount,
  }
}

/**
 * Measure coral diversity (thriving)
 * @example
 * const m = measureThriving(content)
 * console.log(m.coral) // 'great-barrier'
 */
export function measureThriving(content: string): ThrivingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasUnionType(content) ? 8 : 0
  score += hasFunction(content) ? 8 : 0
  score += hasClass(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasMethod(content) ? 6 : 0

  const hasMultiplePatterns = hasInterface(content) && hasFunction(content)
  const hasVariedApproaches = hasSyncAndAsync(content)
  const hasRichAPI = hasExport(content) && hasNamedExport(content)
  const hasDiverseTypes = hasInterface(content) && hasTypeAlias(content)
  const hasMultipleMethods = hasFunction(content) && hasArrowFunction(content)
  const hasColorful = hasGenerics(content) && hasUnionType(content)

  score += hasMultiplePatterns ? 5 : 0
  score += hasVariedApproaches ? 5 : 0
  score += hasRichAPI ? 5 : 0
  score += hasDiverseTypes ? 5 : 0
  score += hasMultipleMethods ? 5 : 0
  score += hasColorful ? 5 : 0

  const diversity = Math.min(score, 100)
  const singlePatternCount = countMatches(/\bvar\b/, content)
  const minimalAPICount = countMatches(/\bany\b/, content)

  const hasNoSinglePattern = singlePatternCount === 0
  const hasNoMinimalAPI = minimalAPICount === 0
  const hasNoUniformTypes = !has(/\beval\b/, content)
  const hasNoSingleMethod = !has(/\bdebugger\b/, content)
  const hasHighDiversity = diversity >= 70

  let coral: CoralGrade
  if (diversity >= 85) coral = 'great-barrier'
  else if (diversity >= 70) coral = 'vibrant-reef'
  else if (diversity >= 55) coral = 'proper-ecosystem'
  else if (diversity >= 40) coral = 'bleached-coral'
  else if (diversity >= 25) coral = 'dead-reef'
  else coral = 'no-ecosystem'

  return {
    diversity, coral, hasHighDiversity, hasMultiplePatterns, hasVariedApproaches,
    hasNoSinglePattern, hasRichAPI, hasNoMinimalAPI, hasDiverseTypes,
    hasNoUniformTypes, hasMultipleMethods, hasNoSingleMethod, hasColorful,
    singlePatternCount, minimalAPICount,
  }
}

/**
 * Measure current efficiency (flowing)
 * @example
 * const m = measureFlowing(content)
 * console.log(m.current) // 'gulf-stream'
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasArrowFunction(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0

  const hasStreamlined = hasMapFunction(content) && hasArrowFunction(content)
  const hasDirectPaths = hasReturnType(content) && hasConst(content)
  const hasOptimized = hasAsync(content) && hasGenerics(content)
  const hasCached = hasOptional(content) && hasDefaultParam(content)
  const hasEfficient = hasConst(content) && hasMapFunction(content)
  const hasNoRedundant = hasImport(content) && hasExport(content)

  score += hasStreamlined ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasNoRedundant ? 5 : 0

  const efficiency = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const circuitCount = countMatches(/\bany\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoCircuits = circuitCount === 0
  const hasNoRecalculating = !has(/\beval\b/, content)
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighEfficiency = efficiency >= 70

  let current: CurrentGrade
  if (efficiency >= 85) current = 'gulf-stream'
  else if (efficiency >= 70) current = 'strong-current'
  else if (efficiency >= 55) current = 'proper-flow'
  else if (efficiency >= 40) current = 'sluggish-creek'
  else if (efficiency >= 25) current = 'stagnant-pool'
  else current = 'no-flow'

  return {
    efficiency, current, hasHighEfficiency, hasStreamlined, hasNoBottlenecks,
    hasDirectPaths, hasNoCircuits, hasOptimized, hasNoRedundant, hasCached,
    hasNoRecalculating, hasEfficient, hasNoWasteful, bottleneckCount, circuitCount,
  }
}

/**
 * Measure abyss resilience (diving)
 * @example
 * const m = measureDiving(content)
 * console.log(m.abyss) // 'mariana-trench'
 */
export function measureDiving(content: string): DivingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0

  const hasErrorHandling = hasTryCatch(content) && hasReturnType(content)
  const hasExceptionRecovery = hasAsync(content) && hasTryCatch(content)
  const hasEdgeCaseCoverage = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasNullSafe = hasStrictEq(content) && hasNullishCoalescing(content)
  const hasBoundaryChecks = hasConditional(content) && hasStrictEq(content)
  const hasFaultTolerant = hasOptional(content) && hasDefaultParam(content)

  score += hasErrorHandling ? 5 : 0
  score += hasExceptionRecovery ? 5 : 0
  score += hasEdgeCaseCoverage ? 5 : 0
  score += hasNullSafe ? 5 : 0
  score += hasBoundaryChecks ? 5 : 0
  score += hasFaultTolerant ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const uncoveredCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoUncovered = uncoveredCount === 0
  const hasNoBareDereference = !has(/\beval\b/, content)
  const hasNoUnbounded = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let abyss: AbyssGrade
  if (resilience >= 85) abyss = 'mariana-trench'
  else if (resilience >= 70) abyss = 'deep-survivor'
  else if (resilience >= 55) abyss = 'proper-depth'
  else if (resilience >= 40) abyss = 'pressure-crack'
  else if (resilience >= 25) abyss = 'crushed-hull'
  else abyss = 'no-depth'

  return {
    resilience, abyss, hasHighResilience, hasErrorHandling, hasExceptionRecovery,
    hasNoBareCrash, hasEdgeCaseCoverage, hasNoUncovered, hasNullSafe,
    hasNoBareDereference, hasBoundaryChecks, hasNoUnbounded, hasFaultTolerant,
    bareCrashCount, uncoveredCount,
  }
}

// ─── Helper ────────────────────────────────────────────────────────

function hasSyncAndAsync(content: string): boolean {
  return hasAsync(content) && hasFunction(content)
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify wave condition
 * @example
 * classifyWaveCondition(90) // 'sapphire-masterpiece'
 */
export function classifyWaveCondition(score: number): WaveCondition {
  if (score >= 85) return 'sapphire-masterpiece'
  if (score >= 70) return 'ocean-jewel'
  if (score >= 55) return 'proper-sea'
  if (score >= 40) return 'murky-puddle'
  if (score >= 25) return 'stagnant-pond'
  return 'dry-land'
}

/**
 * Classify depth type
 * @example
 * classifyDepthType(waves) // 'mariana-trench'
 */
export function classifyDepthType(waves: OceanWave[]): DepthType {
  if (waves.length === 0) return 'no-ocean'
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
  const masterpieceRatio = waves.filter(w => w.condition === 'sapphire-masterpiece').length / waves.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'mariana-trench'
  if (avgQs >= 60) return 'continental-shelf'
  if (avgQs >= 45) return 'proper-ocean'
  if (avgQs >= 30) return 'shallow-sea'
  if (avgQs >= 15) return 'tidal-pool'
  return 'no-ocean'
}

/**
 * Classify depth condition
 * @example
 * classifyDepthCondition(80) // 'pristine-ocean'
 */
export function classifyDepthCondition(avgQs: number): DepthCondition {
  if (avgQs >= 75) return 'pristine-ocean'
  if (avgQs >= 60) return 'clear-waters'
  if (avgQs >= 45) return 'decent-sea'
  if (avgQs >= 30) return 'murky-waters'
  if (avgQs >= 15) return 'polluted-bay'
  return 'void'
}

/**
 * Classify navigator grade
 * @example
 * classifyNavigatorGrade(85) // 'ocean-master'
 */
export function classifyNavigatorGrade(avgDepth: number): NavigatorGrade {
  if (avgDepth >= 80) return 'ocean-master'
  if (avgDepth >= 65) return 'deep-sea-captain'
  if (avgDepth >= 50) return 'skilled-sailor'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(waves, depths, ocean, stats)
 */
export function generateRecommendations(
  waves: OceanWave[],
  depths: OceanDepth[],
  ocean: OceanSummary,
  stats: SapphireOceanStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDepthClarity < 50) {
    recs.push('Improve depth clarity with readable exports, transparent interfaces, and self-documenting types')
  }
  if (stats.avgTidalRhythm < 50) {
    recs.push('Strengthen tidal rhythm with consistent equality, predictable types, and smooth async patterns')
  }
  if (stats.avgCoralDiversity < 50) {
    recs.push('Enrich coral diversity with multiple patterns, varied approaches, and diverse type systems')
  }
  if (stats.avgCurrentEfficiency < 50) {
    recs.push('Boost current efficiency with streamlined data flows, direct paths, and optimized patterns')
  }
  if (stats.avgAbyssResilience < 50) {
    recs.push('Deepen abyss resilience with error handling, null safety, and comprehensive edge case coverage')
  }
  if (stats.dryLandCount > 0) {
    recs.push(`${stats.dryLandCount} file(s) are dry land — they need complete ocean restoration`)
  }
  if (ocean.overallDepth < 40) {
    recs.push('Overall ocean depth is shallow — focus on depth clarity and abyss resilience first')
  }
  const allDry = depths.every(d => d.depthType === 'no-ocean' || d.depthType === 'tidal-pool')
  if (allDry && depths.length > 0) {
    recs.push('All ocean depths are shallow — consider a major sapphire ocean reconstruction')
  }
  const dryFiles = waves.filter(w => w.condition === 'dry-land').map(w => w.file)
  if (dryFiles.length > 0 && dryFiles.length <= 3) {
    recs.push(`Restore these dry land files into sapphire waves: ${dryFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your sapphire ocean achieves ocean-master grade! Every wave radiates crystalline clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ocean wave
 * @example
 * const w = analyzeOceanWave(content, 'index.ts')
 * console.log(w.condition) // 'sapphire-masterpiece'
 */
export function analyzeOceanWave(content: string, filePath: string): OceanWave {
  const clarifying = measureClarifying(content)
  const pulsing = measurePulsing(content)
  const thriving = measureThriving(content)
  const flowing = measureFlowing(content)
  const diving = measureDiving(content)

  const qualityScore = Math.round(
    clarifying.depth * 0.2 +
    pulsing.rhythm * 0.2 +
    thriving.diversity * 0.2 +
    flowing.efficiency * 0.2 +
    diving.resilience * 0.2,
  )

  return {
    file: filePath,
    depthClarity: clarifying.depth,
    tidalRhythm: pulsing.rhythm,
    coralDiversity: thriving.diversity,
    currentEfficiency: flowing.efficiency,
    abyssResilience: diving.resilience,
    clarifying,
    pulsing,
    thriving,
    flowing,
    diving,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as ocean depth
 * @example
 * const d = analyzeOceanDepth(waves, 'src')
 * console.log(d.depthType) // 'mariana-trench'
 */
export function analyzeOceanDepth(waves: OceanWave[], dirPath: string): OceanDepth {
  if (waves.length === 0) {
    return {
      directory: dirPath, waves: [], avgClarity: 0, avgRhythm: 0,
      avgResilience: 0, sapphireMasterpieceCount: 0, dryLandCount: 0,
      depthType: 'no-ocean', condition: 'void',
    }
  }

  const avgClarity = Math.round(waves.reduce((s, w) => s + w.depthClarity, 0) / waves.length)
  const avgRhythm = Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
  const avgResilience = Math.round(waves.reduce((s, w) => s + w.abyssResilience, 0) / waves.length)
  const sapphireMasterpieceCount = waves.filter(w => w.condition === 'sapphire-masterpiece').length
  const dryLandCount = waves.filter(w => w.condition === 'dry-land').length
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)

  return {
    directory: dirPath, waves, avgClarity, avgRhythm, avgResilience,
    sapphireMasterpieceCount, dryLandCount,
    depthType: classifyDepthType(waves),
    condition: classifyDepthCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete sapphire ocean result
 * @example
 * const result = await buildSapphireOceanResult(files, contents)
 * console.log(result.stats.navigatorGrade) // 'ocean-master'
 */
export async function buildSapphireOceanResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireOceanResult> {
  const waves = files.map((file, i) => analyzeOceanWave(contents[i] ?? '', file))

  const dirMap = new Map<string, OceanWave[]>()
  for (const wave of waves) {
    const dir = path.dirname(wave.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(wave) } else { dirMap.set(dir, [wave]) }
  }

  const depths = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeOceanDepth(dirWaves, dir),
  )

  const avgClarity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.depthClarity, 0) / waves.length) : 0
  const avgRhythm = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length) : 0
  const avgResilience = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.abyssResilience, 0) / waves.length) : 0

  const overallDepth = waves.length > 0
    ? Math.round((avgClarity + avgRhythm + avgResilience) / 3) : 0
  const isPristine = avgClarity >= 60

  const ocean: OceanSummary = { avgClarity, avgRhythm, avgResilience, isPristine, overallDepth }

  const celebration: CelebrationInfo = {
    milestone: 490,
    name: 'sapphire-ocean',
    message: 'Command #490 — The vast sapphire ocean of code. 490 commands, each one a wave in the endless sea of quality.',
    previousMilestones: [420, 430, 440, 450, 460, 470, 480],
    totalTests: 82000,
  }

  const avgCoralDiversity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.coralDiversity, 0) / waves.length) : 0
  const avgCurrentEfficiency = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.currentEfficiency, 0) / waves.length) : 0

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file : ''
  const clearest = waves.length > 0
    ? waves.reduce((best, w) => w.depthClarity > best.depthClarity ? w : best).file : ''
  const bestRhythm = waves.length > 0
    ? waves.reduce((best, w) => w.tidalRhythm > best.tidalRhythm ? w : best).file : ''
  const mostDiverse = waves.length > 0
    ? waves.reduce((best, w) => w.coralDiversity > best.coralDiversity ? w : best).file : ''
  const mostEfficient = waves.length > 0
    ? waves.reduce((best, w) => w.currentEfficiency > best.currentEfficiency ? w : best).file : ''

  const stats: SapphireOceanStats = {
    totalFiles: waves.length,
    totalDepths: depths.length,
    avgDepthClarity: avgClarity,
    avgTidalRhythm: avgRhythm,
    avgCoralDiversity,
    avgCurrentEfficiency,
    avgAbyssResilience: avgResilience,
    sapphireMasterpieceCount: waves.filter(w => w.condition === 'sapphire-masterpiece').length,
    oceanJewelCount: waves.filter(w => w.condition === 'ocean-jewel').length,
    properSeaCount: waves.filter(w => w.condition === 'proper-sea').length,
    murkyPuddleCount: waves.filter(w => w.condition === 'murky-puddle').length,
    stagnantPondCount: waves.filter(w => w.condition === 'stagnant-pond').length,
    dryLandCount: waves.filter(w => w.condition === 'dry-land').length,
    hasHighDepthCount: waves.filter(w => w.clarifying.hasHighDepth).length,
    hasHighRhythmCount: waves.filter(w => w.pulsing.hasHighRhythm).length,
    hasHighDiversityCount: waves.filter(w => w.thriving.hasHighDiversity).length,
    hasHighEfficiencyCount: waves.filter(w => w.flowing.hasHighEfficiency).length,
    hasHighResilienceCount: waves.filter(w => w.diving.hasHighResilience).length,
    overallDepth,
    navigatorGrade: classifyNavigatorGrade(overallDepth),
    bestWave, clearest, bestRhythm, mostDiverse, mostEfficient,
  }

  const recommendations = generateRecommendations(waves, depths, ocean, stats)

  return { waves, depths, ocean, celebration, stats, recommendations }
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
