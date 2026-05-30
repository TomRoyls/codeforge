// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Weathering grade */
export type WeatheringGrade =
  | 'storm-proof'
  | 'weather-hardy'
  | 'proper-resilience'
  | 'weather-sensitive'
  | 'storm-damaged'
  | 'washed-away'

/** Growth grade */
export type GrowthGrade =
  | 'explosive-growth'
  | 'vigorous-sprout'
  | 'proper-growth'
  | 'slow-growth'
  | 'stunted'
  | 'no-growth'

/** Storm adaptation grade */
export type StormGrade =
  | 'dancing-wind'
  | 'bending-reed'
  | 'proper-flex'
  | 'rigid-trunk'
  | 'breaking-branch'
  | 'uprooted'

/** Root tenacity grade */
export type RootGrade =
  | 'deep-anchor'
  | 'strong-taproot'
  | 'proper-roots'
  | 'shallow-roots'
  | 'surface-feeder'
  | 'no-roots'

/** Bloom recovery grade */
export type BloomGrade =
  | 'resurgent-garden'
  | 'quick-recovery'
  | 'proper-healing'
  | 'slow-recovery'
  | 'permanent-damage'
  | 'no-recovery'

/** Bloom condition */
export type BloomCondition =
  | 'evergreen-paradise'
  | 'blooming-garden'
  | 'proper-garden'
  | 'struggling-patch'
  | 'withered-bed'
  | 'barren-earth'

/** Plot type */
export type PlotType =
  | 'botanical-garden'
  | 'proper-plot'
  | 'decent-bed'
  | 'small-patch'
  | 'window-box'
  | 'no-plot'

/** Plot condition */
export type PlotCondition =
  | 'lush-paradise'
  | 'thriving-garden'
  | 'decent-plot'
  | 'struggling-bed'
  | 'barren-ground'
  | 'void'

/** Gardener grade */
export type GardenerGrade =
  | 'master-horticulturist'
  | 'expert-gardener'
  | 'skilled-cultivator'
  | 'apprentice'
  | 'novice'
  | 'black-thumb'

/** Weathering measurement */
export interface WeatheringMeasure {
  resilience: number
  grade: WeatheringGrade
  hasHighResilience: boolean
  hasErrorHandling: boolean
  hasExceptionRecovery: boolean
  hasNoBareCrash: boolean
  hasDefensiveCode: boolean
  hasNoTrusting: boolean
  hasInputValidation: boolean
  hasNoUnchecked: boolean
  hasBoundaryGuards: boolean
  hasNoUnbounded: boolean
  hasFaultTolerant: boolean
  bareCrashCount: number
  trustingCount: number
}

/** Growing measurement */
export interface GrowingMeasure {
  vitality: number
  growth: GrowthGrade
  hasHighVitality: boolean
  hasExtensible: boolean
  hasScalable: boolean
  hasNoRigid: boolean
  hasRefactorable: boolean
  hasNoEntangled: boolean
  hasEvolving: boolean
  hasNoFrozen: boolean
  hasAdaptable: boolean
  hasNoStatic: boolean
  hasSustainable: boolean
  rigidCount: number
  entangledCount: number
}

/** Adapting measurement */
export interface AdaptingMeasure {
  adaptation: number
  storm: StormGrade
  hasHighAdaptation: boolean
  hasConfigurable: boolean
  hasParameterized: boolean
  hasNoHardcoded: boolean
  hasFlexible: boolean
  hasNoFixed: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasPluggable: boolean
  hasNoLocked: boolean
  hasResponsive: boolean
  hardcodedCount: number
  fixedCount: number
}

/** Holding measurement */
export interface HoldingMeasure {
  tenacity: number
  root: RootGrade
  hasHighTenacity: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasSolidBase: boolean
  hasNoShaky: boolean
  hasVerified: boolean
  hasNoUnverified: boolean
  untestedCount: number
  unsafeCount: number
}

/** Recovering measurement */
export interface RecoveringMeasure {
  recovery: number
  bloom: BloomGrade
  hasHighRecovery: boolean
  hasRetryLogic: boolean
  hasFallbackPaths: boolean
  hasNoSingleFail: boolean
  hasSelfHealing: boolean
  hasNoDegraded: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasRollback: boolean
  hasNoDataLoss: boolean
  hasResilient: boolean
  singleFailCount: number
  degradedCount: number
}

/** Single file analysis */
export interface StormBloom {
  file: string
  weatheringResilience: number
  growthVitality: number
  stormAdaptation: number
  rootTenacity: number
  bloomRecovery: number
  weathering: WeatheringMeasure
  growing: GrowingMeasure
  adapting: AdaptingMeasure
  holding: HoldingMeasure
  recovering: RecoveringMeasure
  condition: BloomCondition
  qualityScore: number
}

/** Directory-level plot */
export interface StormPlot {
  directory: string
  blooms: StormBloom[]
  avgResilience: number
  avgVitality: number
  avgRecovery: number
  evergreenParadiseCount: number
  barrenEarthCount: number
  plotType: PlotType
  condition: PlotCondition
}

/** Garden summary */
export interface GardenSummary {
  avgResilience: number
  avgVitality: number
  avgRecovery: number
  isThriving: boolean
  overallVerdure: number
}

/** Full stats */
export interface StormGardenStats {
  totalFiles: number
  totalPlots: number
  avgWeatheringResilience: number
  avgGrowthVitality: number
  avgStormAdaptation: number
  avgRootTenacity: number
  avgBloomRecovery: number
  evergreenParadiseCount: number
  bloomingGardenCount: number
  properGardenCount: number
  strugglingPatchCount: number
  witheredBedCount: number
  barrenEarthCount: number
  hasHighResilienceCount: number
  hasHighVitalityCount: number
  hasHighAdaptationCount: number
  hasHighTenacityCount: number
  hasHighRecoveryCount: number
  overallVerdure: number
  gardenerGrade: GardenerGrade
  bestBloom: string
  mostResilient: string
  mostVital: string
  mostAdaptive: string
  bestRecovery: string
}

/** Full result */
export interface StormGardenResult {
  blooms: StormBloom[]
  plots: StormPlot[]
  garden: GardenSummary
  stats: StormGardenStats
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
const hasSwitch = (c: string) => has(/\bswitch\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasTernary = (c: string) => has(/\?[^?]*:/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure weathering resilience (weathering)
 * @example
 * const m = measureWeathering(content)
 * console.log(m.grade) // 'storm-proof'
 */
export function measureWeathering(content: string): WeatheringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasErrorHandling = hasTryCatch(content) && hasReturnType(content)
  const hasExceptionRecovery = hasAsync(content) && hasTryCatch(content)
  const hasDefensiveCode = hasStrictEq(content) && hasOptional(content)
  const hasInputValidation = hasInterface(content) && hasReturnType(content)
  const hasBoundaryGuards = hasOptional(content) && hasNullishCoalescing(content)
  const hasFaultTolerant = hasDefaultParam(content) && hasTryCatch(content)

  score += hasErrorHandling ? 5 : 0
  score += hasExceptionRecovery ? 5 : 0
  score += hasDefensiveCode ? 5 : 0
  score += hasInputValidation ? 5 : 0
  score += hasBoundaryGuards ? 5 : 0
  score += hasFaultTolerant ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const trustingCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoTrusting = trustingCount === 0
  const hasNoUnchecked = !has(/\beval\b/, content)
  const hasNoUnbounded = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let grade: WeatheringGrade
  if (resilience >= 85) grade = 'storm-proof'
  else if (resilience >= 70) grade = 'weather-hardy'
  else if (resilience >= 55) grade = 'proper-resilience'
  else if (resilience >= 40) grade = 'weather-sensitive'
  else if (resilience >= 25) grade = 'storm-damaged'
  else grade = 'washed-away'

  return {
    resilience, grade, hasHighResilience, hasErrorHandling, hasExceptionRecovery,
    hasNoBareCrash, hasDefensiveCode, hasNoTrusting, hasInputValidation,
    hasNoUnchecked, hasBoundaryGuards, hasNoUnbounded, hasFaultTolerant,
    bareCrashCount, trustingCount,
  }
}

/**
 * Measure growth vitality (growing)
 * @example
 * const m = measureGrowing(content)
 * console.log(m.growth) // 'explosive-growth'
 */
export function measureGrowing(content: string): GrowingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0

  const hasExtensible = hasExport(content) && hasInterface(content)
  const hasScalable = hasGenerics(content) && hasNamedExport(content)
  const hasRefactorable = hasDocComments(content) && hasExport(content)
  const hasEvolving = hasAsync(content) && hasMapFunction(content)
  const hasAdaptable = hasGenerics(content) && hasOptional(content)
  const hasSustainable = hasReadonly(content) && hasConst(content)

  score += hasExtensible ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasRefactorable ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasAdaptable ? 5 : 0
  score += hasSustainable ? 5 : 0

  const vitality = Math.min(score, 100)
  const rigidCount = countMatches(/\bvar\b/, content)
  const entangledCount = countMatches(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoEntangled = entangledCount === 0
  const hasNoFrozen = !has(/\beval\b/, content)
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  let growth: GrowthGrade
  if (vitality >= 85) growth = 'explosive-growth'
  else if (vitality >= 70) growth = 'vigorous-sprout'
  else if (vitality >= 55) growth = 'proper-growth'
  else if (vitality >= 40) growth = 'slow-growth'
  else if (vitality >= 25) growth = 'stunted'
  else growth = 'no-growth'

  return {
    vitality, growth, hasHighVitality, hasExtensible, hasScalable,
    hasNoRigid, hasRefactorable, hasNoEntangled, hasEvolving, hasNoFrozen,
    hasAdaptable, hasNoStatic, hasSustainable, rigidCount, entangledCount,
  }
}

/**
 * Measure storm adaptation (adapting)
 * @example
 * const m = measureAdapting(content)
 * console.log(m.storm) // 'dancing-wind'
 */
export function measureAdapting(content: string): AdaptingMeasure {
  let score = 0
  score += hasGenerics(content) ? 10 : 0
  score += hasDefaultParam(content) ? 10 : 0
  score += hasOptional(content) ? 10 : 0
  score += hasUnionType(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasSwitch(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasTernary(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0

  const hasConfigurable = hasDefaultParam(content) && hasOptional(content)
  const hasParameterized = hasGenerics(content) && hasReturnType(content)
  const hasFlexible = hasOptional(content) && hasUnionType(content)
  const hasDynamic = hasEnum(content) && hasSwitch(content)
  const hasPluggable = hasInterface(content) && hasGenerics(content)
  const hasResponsive = hasConditional(content) && hasTernary(content)

  score += hasConfigurable ? 5 : 0
  score += hasParameterized ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasPluggable ? 5 : 0
  score += hasResponsive ? 5 : 0

  const adaptation = Math.min(score, 100)
  const hardcodedCount = countMatches(/\bvar\b/, content)
  const fixedCount = countMatches(/\bany\b/, content)

  const hasNoHardcoded = hardcodedCount === 0
  const hasNoFixed = fixedCount === 0
  const hasNoStatic = !has(/\beval\b/, content)
  const hasNoLocked = !has(/\bdebugger\b/, content)
  const hasHighAdaptation = adaptation >= 70

  let storm: StormGrade
  if (adaptation >= 85) storm = 'dancing-wind'
  else if (adaptation >= 70) storm = 'bending-reed'
  else if (adaptation >= 55) storm = 'proper-flex'
  else if (adaptation >= 40) storm = 'rigid-trunk'
  else if (adaptation >= 25) storm = 'breaking-branch'
  else storm = 'uprooted'

  return {
    adaptation, storm, hasHighAdaptation, hasConfigurable, hasParameterized,
    hasNoHardcoded, hasFlexible, hasNoFixed, hasDynamic, hasNoStatic,
    hasPluggable, hasNoLocked, hasResponsive, hardcodedCount, fixedCount,
  }
}

/**
 * Measure root tenacity (holding)
 * @example
 * const m = measureHolding(content)
 * console.log(m.root) // 'deep-anchor'
 */
export function measureHolding(content: string): HoldingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasTested = hasReturnType(content) && hasExport(content)
  const hasTypeSafe = hasInterface(content) && hasStrictEq(content)
  const hasWellStructured = hasDocComments(content) && hasInterface(content)
  const hasSolidBase = hasConst(content) && hasReadonly(content)
  const hasVerified = hasExport(content) && hasReturnType(content)
  const hasNoUnsafe = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)

  score += hasTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasSolidBase ? 5 : 0
  score += hasVerified ? 5 : 0

  const tenacity = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const unsafeCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnverified = unsafeCount === 0
  const hasNoShaky = !has(/\beval\b/, content)
  const hasHighTenacity = tenacity >= 70

  let root: RootGrade
  if (tenacity >= 85) root = 'deep-anchor'
  else if (tenacity >= 70) root = 'strong-taproot'
  else if (tenacity >= 55) root = 'proper-roots'
  else if (tenacity >= 40) root = 'shallow-roots'
  else if (tenacity >= 25) root = 'surface-feeder'
  else root = 'no-roots'

  return {
    tenacity, root, hasHighTenacity, hasTested, hasNoUntested, hasTypeSafe,
    hasNoUnsafe, hasWellStructured, hasNoChaotic, hasSolidBase, hasNoShaky,
    hasVerified, hasNoUnverified, untestedCount, unsafeCount,
  }
}

/**
 * Measure bloom recovery (recovering)
 * @example
 * const m = measureRecovering(content)
 * console.log(m.bloom) // 'resurgent-garden'
 */
export function measureRecovering(content: string): RecoveringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0

  const hasRetryLogic = hasAsync(content) && hasTryCatch(content)
  const hasFallbackPaths = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasSelfHealing = hasDefaultParam(content) && hasTryCatch(content)
  const hasGracefulDegradation = hasOptional(content) && hasNullishCoalescing(content)
  const hasRollback = hasTryCatch(content) && hasConst(content)
  const hasResilient = hasInterface(content) && hasReturnType(content)

  score += hasRetryLogic ? 5 : 0
  score += hasFallbackPaths ? 5 : 0
  score += hasSelfHealing ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasRollback ? 5 : 0
  score += hasResilient ? 5 : 0

  const recovery = Math.min(score, 100)
  const singleFailCount = countMatches(/\bvar\b/, content)
  const degradedCount = countMatches(/\bany\b/, content)

  const hasNoSingleFail = singleFailCount === 0
  const hasNoDegraded = degradedCount === 0
  const hasNoHardCrash = !has(/\beval\b/, content)
  const hasNoDataLoss = !has(/\bdebugger\b/, content)
  const hasHighRecovery = recovery >= 70

  let bloom: BloomGrade
  if (recovery >= 85) bloom = 'resurgent-garden'
  else if (recovery >= 70) bloom = 'quick-recovery'
  else if (recovery >= 55) bloom = 'proper-healing'
  else if (recovery >= 40) bloom = 'slow-recovery'
  else if (recovery >= 25) bloom = 'permanent-damage'
  else bloom = 'no-recovery'

  return {
    recovery, bloom, hasHighRecovery, hasRetryLogic, hasFallbackPaths,
    hasNoSingleFail, hasSelfHealing, hasNoDegraded, hasGracefulDegradation,
    hasNoHardCrash, hasRollback, hasNoDataLoss, hasResilient,
    singleFailCount, degradedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify bloom condition
 * @example
 * classifyBloomCondition(90) // 'evergreen-paradise'
 */
export function classifyBloomCondition(score: number): BloomCondition {
  if (score >= 85) return 'evergreen-paradise'
  if (score >= 70) return 'blooming-garden'
  if (score >= 55) return 'proper-garden'
  if (score >= 40) return 'struggling-patch'
  if (score >= 25) return 'withered-bed'
  return 'barren-earth'
}

/**
 * Classify plot type
 * @example
 * classifyPlotType(blooms) // 'botanical-garden'
 */
export function classifyPlotType(blooms: StormBloom[]): PlotType {
  if (blooms.length === 0) return 'no-plot'
  const avgQs = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)
  const paradiseRatio = blooms.filter(b => b.condition === 'evergreen-paradise').length / blooms.length
  if (avgQs >= 75 && paradiseRatio >= 0.5) return 'botanical-garden'
  if (avgQs >= 60) return 'proper-plot'
  if (avgQs >= 45) return 'decent-bed'
  if (avgQs >= 30) return 'small-patch'
  if (avgQs >= 15) return 'window-box'
  return 'no-plot'
}

/**
 * Classify plot condition
 * @example
 * classifyPlotCondition(80) // 'lush-paradise'
 */
export function classifyPlotCondition(avgQs: number): PlotCondition {
  if (avgQs >= 75) return 'lush-paradise'
  if (avgQs >= 60) return 'thriving-garden'
  if (avgQs >= 45) return 'decent-plot'
  if (avgQs >= 30) return 'struggling-bed'
  if (avgQs >= 15) return 'barren-ground'
  return 'void'
}

/**
 * Classify gardener grade
 * @example
 * classifyGardenerGrade(85) // 'master-horticulturist'
 */
export function classifyGardenerGrade(avgVerdure: number): GardenerGrade {
  if (avgVerdure >= 80) return 'master-horticulturist'
  if (avgVerdure >= 65) return 'expert-gardener'
  if (avgVerdure >= 50) return 'skilled-cultivator'
  if (avgVerdure >= 35) return 'apprentice'
  if (avgVerdure >= 20) return 'novice'
  return 'black-thumb'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(blooms, plots, garden, stats)
 */
export function generateRecommendations(
  blooms: StormBloom[],
  plots: StormPlot[],
  garden: GardenSummary,
  stats: StormGardenStats,
): string[] {
  const recs: string[] = []
  if (stats.avgWeatheringResilience < 50) {
    recs.push('Strengthen weathering resilience with error handling, defensive coding, and input validation')
  }
  if (stats.avgGrowthVitality < 50) {
    recs.push('Boost growth vitality with extensible exports, scalable generics, and sustainable patterns')
  }
  if (stats.avgStormAdaptation < 50) {
    recs.push('Improve storm adaptation with configurable defaults, parameterized types, and flexible unions')
  }
  if (stats.avgRootTenacity < 50) {
    recs.push('Deepen root tenacity with type safety, documentation, and well-structured interfaces')
  }
  if (stats.avgBloomRecovery < 50) {
    recs.push('Enhance bloom recovery with retry logic, fallback paths, and graceful degradation')
  }
  if (stats.barrenEarthCount > 0) {
    recs.push(`${stats.barrenEarthCount} file(s) are barren earth — they need complete storm garden restoration`)
  }
  if (garden.overallVerdure < 40) {
    recs.push('Overall garden verdure is low — focus on weathering resilience and bloom recovery first')
  }
  const allBroken = plots.every(p => p.plotType === 'no-plot' || p.plotType === 'window-box')
  if (allBroken && plots.length > 0) {
    recs.push('All plots are struggling — consider a major garden reconstruction')
  }
  const barrenFiles = blooms.filter(b => b.condition === 'barren-earth').map(b => b.file)
  if (barrenFiles.length > 0 && barrenFiles.length <= 3) {
    recs.push(`Restore these barren files into storm garden blooms: ${barrenFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your storm garden achieves master horticulturist quality! Every bloom thrives through storm and sunshine')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as storm bloom
 * @example
 * const b = analyzeStormBloom(content, 'index.ts')
 * console.log(b.condition) // 'evergreen-paradise'
 */
export function analyzeStormBloom(content: string, filePath: string): StormBloom {
  const weathering = measureWeathering(content)
  const growing = measureGrowing(content)
  const adapting = measureAdapting(content)
  const holding = measureHolding(content)
  const recovering = measureRecovering(content)

  const qualityScore = Math.round(
    weathering.resilience * 0.2 +
    growing.vitality * 0.2 +
    adapting.adaptation * 0.2 +
    holding.tenacity * 0.2 +
    recovering.recovery * 0.2,
  )

  return {
    file: filePath,
    weatheringResilience: weathering.resilience,
    growthVitality: growing.vitality,
    stormAdaptation: adapting.adaptation,
    rootTenacity: holding.tenacity,
    bloomRecovery: recovering.recovery,
    weathering,
    growing,
    adapting,
    holding,
    recovering,
    condition: classifyBloomCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as storm plot
 * @example
 * const p = analyzeStormPlot(blooms, 'src')
 * console.log(p.plotType) // 'botanical-garden'
 */
export function analyzeStormPlot(blooms: StormBloom[], dirPath: string): StormPlot {
  if (blooms.length === 0) {
    return {
      directory: dirPath, blooms: [], avgResilience: 0, avgVitality: 0,
      avgRecovery: 0, evergreenParadiseCount: 0, barrenEarthCount: 0,
      plotType: 'no-plot', condition: 'void',
    }
  }

  const avgResilience = Math.round(blooms.reduce((s, b) => s + b.weatheringResilience, 0) / blooms.length)
  const avgVitality = Math.round(blooms.reduce((s, b) => s + b.growthVitality, 0) / blooms.length)
  const avgRecovery = Math.round(blooms.reduce((s, b) => s + b.bloomRecovery, 0) / blooms.length)
  const evergreenParadiseCount = blooms.filter(b => b.condition === 'evergreen-paradise').length
  const barrenEarthCount = blooms.filter(b => b.condition === 'barren-earth').length
  const avgQs = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)

  return {
    directory: dirPath, blooms, avgResilience, avgVitality, avgRecovery,
    evergreenParadiseCount, barrenEarthCount,
    plotType: classifyPlotType(blooms),
    condition: classifyPlotCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete storm garden result
 * @example
 * const result = await buildStormGardenResult(files, contents)
 * console.log(result.stats.gardenerGrade) // 'master-horticulturist'
 */
export async function buildStormGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StormGardenResult> {
  const blooms = files.map((file, i) => analyzeStormBloom(contents[i] ?? '', file))

  const dirMap = new Map<string, StormBloom[]>()
  for (const bloom of blooms) {
    const dir = path.dirname(bloom.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(bloom) } else { dirMap.set(dir, [bloom]) }
  }

  const plots = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzeStormPlot(dirBlooms, dir),
  )

  const avgResilience = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.weatheringResilience, 0) / blooms.length) : 0
  const avgVitality = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.growthVitality, 0) / blooms.length) : 0
  const avgRecovery = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.bloomRecovery, 0) / blooms.length) : 0

  const overallVerdure = blooms.length > 0
    ? Math.round((avgResilience + avgVitality + avgRecovery) / 3) : 0
  const isThriving = avgResilience >= 60

  const garden: GardenSummary = { avgResilience, avgVitality, avgRecovery, isThriving, overallVerdure }

  const avgStormAdaptation = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.stormAdaptation, 0) / blooms.length) : 0
  const avgRootTenacity = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rootTenacity, 0) / blooms.length) : 0
    ? Math.round(blooms.reduce((s, b) => s + b.bloomRecovery, 0) / blooms.length) : 0

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file : ''
  const mostResilient = blooms.length > 0
    ? blooms.reduce((best, b) => b.weatheringResilience > best.weatheringResilience ? b : best).file : ''
  const mostVital = blooms.length > 0
    ? blooms.reduce((best, b) => b.growthVitality > best.growthVitality ? b : best).file : ''
  const mostAdaptive = blooms.length > 0
    ? blooms.reduce((best, b) => b.stormAdaptation > best.stormAdaptation ? b : best).file : ''
  const bestRecovery = blooms.length > 0
    ? blooms.reduce((best, b) => b.bloomRecovery > best.bloomRecovery ? b : best).file : ''

  const stats: StormGardenStats = {
    totalFiles: blooms.length,
    totalPlots: plots.length,
    avgWeatheringResilience: avgResilience,
    avgGrowthVitality: avgVitality,
    avgStormAdaptation,
    avgRootTenacity,
    avgBloomRecovery: avgRecovery,
    evergreenParadiseCount: blooms.filter(b => b.condition === 'evergreen-paradise').length,
    bloomingGardenCount: blooms.filter(b => b.condition === 'blooming-garden').length,
    properGardenCount: blooms.filter(b => b.condition === 'proper-garden').length,
    strugglingPatchCount: blooms.filter(b => b.condition === 'struggling-patch').length,
    witheredBedCount: blooms.filter(b => b.condition === 'withered-bed').length,
    barrenEarthCount: blooms.filter(b => b.condition === 'barren-earth').length,
    hasHighResilienceCount: blooms.filter(b => b.weathering.hasHighResilience).length,
    hasHighVitalityCount: blooms.filter(b => b.growing.hasHighVitality).length,
    hasHighAdaptationCount: blooms.filter(b => b.adapting.hasHighAdaptation).length,
    hasHighTenacityCount: blooms.filter(b => b.holding.hasHighTenacity).length,
    hasHighRecoveryCount: blooms.filter(b => b.recovering.hasHighRecovery).length,
    overallVerdure,
    gardenerGrade: classifyGardenerGrade(overallVerdure),
    bestBloom, mostResilient, mostVital, mostAdaptive, bestRecovery,
  }

  const recommendations = generateRecommendations(blooms, plots, garden, stats)

  return { blooms, plots, garden, stats, recommendations }
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
