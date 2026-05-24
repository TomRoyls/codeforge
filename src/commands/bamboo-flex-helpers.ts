// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Flexibility grade */
export type FlexGrade =
  | 'supple-reed'
  | 'flexible-cane'
  | 'proper-bend'
  | 'stiff-cane'
  | 'brittle-stick'
  | 'frozen-pole'

/** Knot quality */
export type KnotQuality =
  | 'iron-knot'
  | 'strong-joint'
  | 'proper-knot'
  | 'loose-joint'
  | 'weak-bond'
  | 'broken-cane'

/** Hollow core */
export type HollowCore =
  | 'perfectly-hollow'
  | 'efficient-core'
  | 'proper-center'
  | 'solid-center'
  | 'dense-core'
  | 'lead-weight'

/** Growth rate */
export type GrowthRate =
  | 'rocket-growth'
  | 'rapid-sprout'
  | 'steady-growth'
  | 'slow-grow'
  | 'dormant'
  | 'dead-bamboo'

/** Wind resilience */
export type WindResilience =
  | 'typhoon-proof'
  | 'storm-resistant'
  | 'proper-shelter'
  | 'wind-damaged'
  | 'blown-over'
  | 'uprooted'

/** Cane condition */
export type CaneCondition =
  | 'iron-bamboo'
  | 'strong-cane'
  | 'proper-bamboo'
  | 'green-shoot'
  | 'wilted-cane'
  | 'dead-stalk'

/** Grove type */
export type GroveType =
  | 'ancient-grove'
  | 'mature-forest'
  | 'growing-grove'
  | 'bamboo-patch'
  | 'scattered-shoots'
  | 'barren-ground'

/** Grove condition */
export type GroveCondition =
  | 'lush-grove'
  | 'healthy-forest'
  | 'decent-grove'
  | 'struggling-patch'
  | 'withered-grove'
  | 'dead-land'

/** Gardener grade */
export type GardenerGrade =
  | 'zen-master'
  | 'expert-gardener'
  | 'skilled-cultivator'
  | 'apprentice'
  | 'novice'
  | 'lumberjack'

/** Bending measurement */
export interface BendingMeasure {
  flexibility: number
  grade: FlexGrade
  hasHighFlexibility: boolean
  hasAdaptable: boolean
  hasBendable: boolean
  hasNoRigid: boolean
  hasPliable: boolean
  hasNoStiff: boolean
  hasYielding: boolean
  hasNoStubborn: boolean
  hasElastic: boolean
  hasNoInflexible: boolean
  hasResponsive: boolean
  rigidCount: number
  stiffCount: number
}

/** Knotting measurement */
export interface KnottingMeasure {
  strength: number
  knot: KnotQuality
  hasHighStrength: boolean
  hasConnected: boolean
  hasCoupled: boolean
  hasNoDetached: boolean
  hasBound: boolean
  hasNoLoose: boolean
  hasJoined: boolean
  hasNoSeparated: boolean
  hasLinked: boolean
  hasNoUnlinked: boolean
  hasIntegrated: boolean
  detachedCount: number
  looseCount: number
}

/** Hollowing measurement */
export interface HollowingMeasure {
  efficiency: number
  core: HollowCore
  hasHighEfficiency: boolean
  hasLightweight: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasMinimal: boolean
  hasNoExcessive: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasStreamlined: boolean
  hasNoHeavy: boolean
  hasOptimized: boolean
  bloatedCount: number
  wastefulCount: number
}

/** Growing measurement */
export interface GrowingMeasure {
  speed: number
  growth: GrowthRate
  hasHighSpeed: boolean
  hasFast: boolean
  hasRapid: boolean
  hasNoSluggish: boolean
  hasProductive: boolean
  hasNoStagnant: boolean
  hasEvolving: boolean
  hasNoStatic: boolean
  hasDeveloping: boolean
  hasNoFrozen: boolean
  hasProgressing: boolean
  sluggishCount: number
  stagnantCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  windResistance: number
  resilience: WindResilience
  hasHighWindResistance: boolean
  hasResilient: boolean
  hasSturdy: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoWeak: boolean
  hasEnduring: boolean
  hasNoBrittle: boolean
  hasWeatherproof: boolean
  hasNoVulnerable: boolean
  hasHardy: boolean
  fragileCount: number
  weakCount: number
}

/** Single file analysis */
export interface BambooCane {
  file: string
  flexibility: number
  knotStrength: number
  hollowEfficiency: number
  growthSpeed: number
  windResistance: number
  bending: BendingMeasure
  knotting: KnottingMeasure
  hollowing: HollowingMeasure
  growing: GrowingMeasure
  resisting: ResistingMeasure
  condition: CaneCondition
  qualityScore: number
}

/** Directory-level grove */
export interface BambooGrove {
  directory: string
  canes: BambooCane[]
  avgFlexibility: number
  avgStrength: number
  avgEfficiency: number
  ironBambooCount: number
  deadStalkCount: number
  groveType: GroveType
  condition: GroveCondition
}

/** Forest summary */
export interface ForestSummary {
  avgFlexibility: number
  avgStrength: number
  avgEfficiency: number
  isResilient: boolean
  overallVitality: number
}

/** Full stats */
export interface BambooFlexStats {
  totalFiles: number
  totalGroves: number
  avgFlexibility: number
  avgKnotStrength: number
  avgHollowEfficiency: number
  avgGrowthSpeed: number
  avgWindResistance: number
  ironBambooCount: number
  strongCaneCount: number
  properBambooCount: number
  greenShootCount: number
  wiltedCaneCount: number
  deadStalkCount: number
  hasHighFlexibilityCount: number
  hasHighStrengthCount: number
  hasHighEfficiencyCount: number
  hasHighSpeedCount: number
  hasHighWindResistanceCount: number
  overallVitality: number
  gardenerGrade: GardenerGrade
  bestCane: string
  mostFlexible: string
  strongest: string
  mostEfficient: string
  fastestGrowing: string
}

/** Full result */
export interface BambooFlexResult {
  canes: BambooCane[]
  groves: BambooGrove[]
  forest: ForestSummary
  stats: BambooFlexStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
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
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure code flexibility
 * @example
 * const m = measureBending(content)
 * console.log(m.grade) // 'supple-reed'
 */
export function measureBending(content: string): BendingMeasure {
  let score = 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasAdaptable = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasBendable = hasTryCatch(content) && hasAsync(content)
  const hasPliable = hasInterface(content) && hasGenerics(content)
  const hasYielding = hasReadonly(content) && hasConst(content)
  const hasElastic = hasExport(content) && hasImport(content)
  const hasResponsive = hasReturnType(content) && hasOptionalChaining(content)

  score += hasAdaptable ? 5 : 0
  score += hasBendable ? 5 : 0
  score += hasPliable ? 5 : 0
  score += hasYielding ? 5 : 0
  score += hasElastic ? 5 : 0
  score += hasResponsive ? 5 : 0

  const flexibility = Math.min(score, 100)
  const rigidCount = count(/\bvar\b/, content)
  const stiffCount = count(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoStiff = stiffCount === 0
  const hasNoStubborn = !has(/\beval\b/, content)
  const hasNoInflexible = !has(/\bdebugger\b/, content)
  const hasHighFlexibility = flexibility >= 70

  let grade: FlexGrade
  if (flexibility >= 85) grade = 'supple-reed'
  else if (flexibility >= 70) grade = 'flexible-cane'
  else if (flexibility >= 55) grade = 'proper-bend'
  else if (flexibility >= 40) grade = 'stiff-cane'
  else if (flexibility >= 25) grade = 'brittle-stick'
  else grade = 'frozen-pole'

  return {
    flexibility, grade, hasHighFlexibility, hasAdaptable, hasBendable, hasNoRigid,
    hasPliable, hasNoStiff, hasYielding, hasNoStubborn, hasElastic, hasNoInflexible,
    hasResponsive, rigidCount, stiffCount,
  }
}

/**
 * Measure knot strength
 * @example
 * const m = measureKnotting(content)
 * console.log(m.knot) // 'iron-knot'
 */
export function measureKnotting(content: string): KnottingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasConnected = hasExport(content) && hasImport(content)
  const hasCoupled = hasInterface(content) && hasClass(content)
  const hasBound = hasGenerics(content) && hasTypeAlias(content)
  const hasJoined = hasAsync(content) && hasNamedExport(content)
  const hasLinked = hasReturnType(content) && hasConst(content)
  const hasIntegrated = hasExport(content) && hasInterface(content)

  score += hasConnected ? 5 : 0
  score += hasCoupled ? 5 : 0
  score += hasBound ? 5 : 0
  score += hasJoined ? 5 : 0
  score += hasLinked ? 5 : 0
  score += hasIntegrated ? 5 : 0

  const strength = Math.min(score, 100)
  const detachedCount = count(/\bvar\b/, content)
  const looseCount = count(/\bany\b/, content)

  const hasNoDetached = detachedCount === 0
  const hasNoLoose = looseCount === 0
  const hasNoSeparated = !has(/\beval\b/, content)
  const hasNoUnlinked = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let knot: KnotQuality
  if (strength >= 85) knot = 'iron-knot'
  else if (strength >= 70) knot = 'strong-joint'
  else if (strength >= 55) knot = 'proper-knot'
  else if (strength >= 40) knot = 'loose-joint'
  else if (strength >= 25) knot = 'weak-bond'
  else knot = 'broken-cane'

  return {
    strength, knot, hasHighStrength, hasConnected, hasCoupled, hasNoDetached,
    hasBound, hasNoLoose, hasJoined, hasNoSeparated, hasLinked, hasNoUnlinked,
    hasIntegrated, detachedCount, looseCount,
  }
}

/**
 * Measure hollow efficiency
 * @example
 * const m = measureHollowing(content)
 * console.log(m.core) // 'perfectly-hollow'
 */
export function measureHollowing(content: string): HollowingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasLightweight = hasConst(content) && hasStrictEq(content)
  const hasLean = hasExport(content) && hasDocComments(content)
  const hasMinimal = hasReadonly(content) && hasPrivate(content)
  const hasEfficient = hasInterface(content) && hasTypeAlias(content)
  const hasStreamlined = hasReturnType(content) && hasGenerics(content)
  const hasOptimized = hasConst(content) && hasExport(content)

  score += hasLightweight ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasMinimal ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasOptimized ? 5 : 0

  const efficiency = Math.min(score, 100)
  const bloatedCount = count(/\bvar\b/, content)
  const wastefulCount = count(/\bany\b/, content)

  const hasNoBloated = bloatedCount === 0
  const hasNoWasteful = wastefulCount === 0
  const hasNoExcessive = !has(/\beval\b/, content)
  const hasNoHeavy = !has(/\bdebugger\b/, content)
  const hasHighEfficiency = efficiency >= 70

  let core: HollowCore
  if (efficiency >= 85) core = 'perfectly-hollow'
  else if (efficiency >= 70) core = 'efficient-core'
  else if (efficiency >= 55) core = 'proper-center'
  else if (efficiency >= 40) core = 'solid-center'
  else if (efficiency >= 25) core = 'dense-core'
  else core = 'lead-weight'

  return {
    efficiency, core, hasHighEfficiency, hasLightweight, hasLean, hasNoBloated,
    hasMinimal, hasNoExcessive, hasEfficient, hasNoWasteful, hasStreamlined,
    hasNoHeavy, hasOptimized, bloatedCount, wastefulCount,
  }
}

/**
 * Measure growth speed
 * @example
 * const m = measureGrowing(content)
 * console.log(m.growth) // 'rocket-growth'
 */
export function measureGrowing(content: string): GrowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasFast = hasDocComments(content) && hasExport(content)
  const hasRapid = hasInterface(content) && hasClass(content)
  const hasProductive = hasGenerics(content) && hasTypeAlias(content)
  const hasEvolving = hasNamedExport(content) && hasReturnType(content)
  const hasDeveloping = hasAsync(content) && hasDocComments(content)
  const hasProgressing = hasExport(content) && hasGenerics(content)

  score += hasFast ? 5 : 0
  score += hasRapid ? 5 : 0
  score += hasProductive ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasDeveloping ? 5 : 0
  score += hasProgressing ? 5 : 0

  const speed = Math.min(score, 100)
  const sluggishCount = count(/\bvar\b/, content)
  const stagnantCount = count(/\bany\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoStagnant = stagnantCount === 0
  const hasNoStatic = !has(/\beval\b/, content)
  const hasNoFrozen = !has(/\bdebugger\b/, content)
  const hasHighSpeed = speed >= 70

  let growth: GrowthRate
  if (speed >= 85) growth = 'rocket-growth'
  else if (speed >= 70) growth = 'rapid-sprout'
  else if (speed >= 55) growth = 'steady-growth'
  else if (speed >= 40) growth = 'slow-grow'
  else if (speed >= 25) growth = 'dormant'
  else growth = 'dead-bamboo'

  return {
    speed, growth, hasHighSpeed, hasFast, hasRapid, hasNoSluggish,
    hasProductive, hasNoStagnant, hasEvolving, hasNoStatic, hasDeveloping,
    hasNoFrozen, hasProgressing, sluggishCount, stagnantCount,
  }
}

/**
 * Measure wind resistance
 * @example
 * const m = measureResisting(content)
 * console.log(m.resilience) // 'typhoon-proof'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasResilient = hasTryCatch(content) && hasAsync(content)
  const hasSturdy = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasTough = hasStrictEq(content) && hasConst(content)
  const hasEnduring = hasReadonly(content) && hasPrivate(content)
  const hasWeatherproof = hasInterface(content) && hasReturnType(content)
  const hasHardy = hasTryCatch(content) && hasConst(content)

  score += hasResilient ? 5 : 0
  score += hasSturdy ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasWeatherproof ? 5 : 0
  score += hasHardy ? 5 : 0

  const windResistance = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const weakCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoWeak = weakCount === 0
  const hasNoBrittle = !has(/\beval\b/, content)
  const hasNoVulnerable = !has(/\bdebugger\b/, content)
  const hasHighWindResistance = windResistance >= 70

  let resilience: WindResilience
  if (windResistance >= 85) resilience = 'typhoon-proof'
  else if (windResistance >= 70) resilience = 'storm-resistant'
  else if (windResistance >= 55) resilience = 'proper-shelter'
  else if (windResistance >= 40) resilience = 'wind-damaged'
  else if (windResistance >= 25) resilience = 'blown-over'
  else resilience = 'uprooted'

  return {
    windResistance, resilience, hasHighWindResistance, hasResilient, hasSturdy,
    hasNoFragile, hasTough, hasNoWeak, hasEnduring, hasNoBrittle, hasWeatherproof,
    hasNoVulnerable, hasHardy, fragileCount, weakCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify cane condition
 * @example
 * classifyCaneCondition(90) // 'iron-bamboo'
 */
export function classifyCaneCondition(score: number): CaneCondition {
  if (score >= 85) return 'iron-bamboo'
  if (score >= 70) return 'strong-cane'
  if (score >= 55) return 'proper-bamboo'
  if (score >= 40) return 'green-shoot'
  if (score >= 25) return 'wilted-cane'
  return 'dead-stalk'
}

/**
 * Classify grove type
 * @example
 * classifyGroveType(canes) // 'ancient-grove'
 */
export function classifyGroveType(canes: BambooCane[]): GroveType {
  if (canes.length === 0) return 'barren-ground'
  const avgQs = Math.round(canes.reduce((s, c) => s + c.qualityScore, 0) / canes.length)
  const ironRatio = canes.filter(c => c.condition === 'iron-bamboo').length / canes.length
  if (avgQs >= 75 && ironRatio >= 0.5) return 'ancient-grove'
  if (avgQs >= 60) return 'mature-forest'
  if (avgQs >= 45) return 'growing-grove'
  if (avgQs >= 30) return 'bamboo-patch'
  if (avgQs >= 15) return 'scattered-shoots'
  return 'barren-ground'
}

/**
 * Classify gardener grade
 * @example
 * classifyGardenerGrade(85) // 'zen-master'
 */
export function classifyGardenerGrade(avgVitality: number): GardenerGrade {
  if (avgVitality >= 80) return 'zen-master'
  if (avgVitality >= 65) return 'expert-gardener'
  if (avgVitality >= 50) return 'skilled-cultivator'
  if (avgVitality >= 35) return 'apprentice'
  if (avgVitality >= 20) return 'novice'
  return 'lumberjack'
}

/**
 * Classify grove condition
 * @example
 * classifyGroveCondition(80) // 'lush-grove'
 */
export function classifyGroveCondition(avgQs: number): GroveCondition {
  if (avgQs >= 75) return 'lush-grove'
  if (avgQs >= 60) return 'healthy-forest'
  if (avgQs >= 45) return 'decent-grove'
  if (avgQs >= 30) return 'struggling-patch'
  if (avgQs >= 15) return 'withered-grove'
  return 'dead-land'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(canes, groves, forest, stats)
 */
export function generateRecommendations(
  canes: BambooCane[],
  groves: BambooGrove[],
  forest: ForestSummary,
  stats: BambooFlexStats,
): string[] {
  const recs: string[] = []
  if (stats.avgFlexibility < 50) {
    recs.push('Increase flexibility with optional chaining, null coalescing, and adaptive patterns')
  }
  if (stats.avgKnotStrength < 50) {
    recs.push('Strengthen connections with better module binding, impactful interfaces, and joined exports')
  }
  if (stats.avgHollowEfficiency < 50) {
    recs.push('Improve efficiency with strict equality, readonly properties, and streamlined types')
  }
  if (stats.avgGrowthSpeed < 50) {
    recs.push('Accelerate growth with clear documentation, engaging interfaces, and progressive exports')
  }
  if (stats.avgWindResistance < 50) {
    recs.push('Boost wind resistance with robust error handling, flexible chaining, and modular patterns')
  }
  if (stats.deadStalkCount > 0) {
    recs.push(`${stats.deadStalkCount} file(s) are dead stalks — consider significant refactoring`)
  }
  if (forest.overallVitality < 40) {
    recs.push('Overall vitality is low — focus on flexibility and connection strength')
  }
  const allDead = groves.every(g => g.groveType === 'barren-ground' || g.groveType === 'scattered-shoots')
  if (allDead && groves.length > 0) {
    recs.push('All groves are barren — consider a major cultivation effort')
  }
  const dead = canes.filter(c => c.condition === 'dead-stalk').map(c => c.file)
  if (dead.length > 0 && dead.length <= 3) {
    recs.push(`Revive these dead stalks: ${dead.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your bamboo forest is a masterpiece! Every cane bends with grace and strength')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a bamboo cane
 * @example
 * const cane = analyzeBambooCane(content, 'index.ts')
 * console.log(cane.condition) // 'iron-bamboo'
 */
export function analyzeBambooCane(content: string, filePath: string): BambooCane {
  const bending = measureBending(content)
  const knotting = measureKnotting(content)
  const hollowing = measureHollowing(content)
  const growing = measureGrowing(content)
  const resisting = measureResisting(content)

  const qualityScore = Math.round(
    bending.flexibility * 0.2 +
    knotting.strength * 0.2 +
    hollowing.efficiency * 0.2 +
    growing.speed * 0.2 +
    resisting.windResistance * 0.2,
  )

  return {
    file: filePath,
    flexibility: bending.flexibility,
    knotStrength: knotting.strength,
    hollowEfficiency: hollowing.efficiency,
    growthSpeed: growing.speed,
    windResistance: resisting.windResistance,
    bending,
    knotting,
    hollowing,
    growing,
    resisting,
    condition: classifyCaneCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a bamboo grove
 * @example
 * const grove = analyzeBambooGrove(canes, 'src')
 * console.log(grove.groveType) // 'ancient-grove'
 */
export function analyzeBambooGrove(canes: BambooCane[], dirPath: string): BambooGrove {
  if (canes.length === 0) {
    return {
      directory: dirPath, canes: [], avgFlexibility: 0, avgStrength: 0, avgEfficiency: 0,
      ironBambooCount: 0, deadStalkCount: 0, groveType: 'barren-ground', condition: 'dead-land',
    }
  }

  const avgFlexibility = Math.round(canes.reduce((s, c) => s + c.flexibility, 0) / canes.length)
  const avgStrength = Math.round(canes.reduce((s, c) => s + c.knotStrength, 0) / canes.length)
  const avgEfficiency = Math.round(canes.reduce((s, c) => s + c.hollowEfficiency, 0) / canes.length)
  const ironBambooCount = canes.filter(c => c.condition === 'iron-bamboo').length
  const deadStalkCount = canes.filter(c => c.condition === 'dead-stalk').length
  const avgQs = Math.round(canes.reduce((s, c) => s + c.qualityScore, 0) / canes.length)

  return {
    directory: dirPath, canes, avgFlexibility, avgStrength, avgEfficiency,
    ironBambooCount, deadStalkCount, groveType: classifyGroveType(canes),
    condition: classifyGroveCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete bamboo flex result
 * @example
 * const result = await buildBambooFlexResult(files, contents)
 * console.log(result.stats.gardenerGrade) // 'zen-master'
 */
export async function buildBambooFlexResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<BambooFlexResult> {
  const canes = files.map((file, i) => analyzeBambooCane(contents[i] ?? '', file))

  const dirMap = new Map<string, BambooCane[]>()
  for (const cane of canes) {
    const dir = path.dirname(cane.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(cane) } else { dirMap.set(dir, [cane]) }
  }

  const groves = Array.from(dirMap.entries()).map(([dir, dirCanes]) =>
    analyzeBambooGrove(dirCanes, dir),
  )

  const avgFlexibility = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.flexibility, 0) / canes.length) : 0
  const avgStrength = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.knotStrength, 0) / canes.length) : 0
  const avgEfficiency = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.hollowEfficiency, 0) / canes.length) : 0

  const overallVitality = canes.length > 0
    ? Math.round((avgFlexibility + avgStrength + avgEfficiency) / 3) : 0
  const isResilient = avgFlexibility >= 60

  const forest: ForestSummary = { avgFlexibility, avgStrength, avgEfficiency, isResilient, overallVitality }

  const avgKnotStrength = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.knotStrength, 0) / canes.length) : 0
  const avgHollowEfficiency = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.hollowEfficiency, 0) / canes.length) : 0
  const avgGrowthSpeed = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.growthSpeed, 0) / canes.length) : 0
  const avgWindResistance = canes.length > 0
    ? Math.round(canes.reduce((s, c) => s + c.windResistance, 0) / canes.length) : 0

  const bestCane = canes.length > 0
    ? canes.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const mostFlexible = canes.length > 0
    ? canes.reduce((best, c) => c.flexibility > best.flexibility ? c : best).file : ''
  const strongest = canes.length > 0
    ? canes.reduce((best, c) => c.knotStrength > best.knotStrength ? c : best).file : ''
  const mostEfficient = canes.length > 0
    ? canes.reduce((best, c) => c.hollowEfficiency > best.hollowEfficiency ? c : best).file : ''
  const fastestGrowing = canes.length > 0
    ? canes.reduce((best, c) => c.growthSpeed > best.growthSpeed ? c : best).file : ''

  const stats: BambooFlexStats = {
    totalFiles: canes.length,
    totalGroves: groves.length,
    avgFlexibility,
    avgKnotStrength,
    avgHollowEfficiency,
    avgGrowthSpeed,
    avgWindResistance,
    ironBambooCount: canes.filter(c => c.condition === 'iron-bamboo').length,
    strongCaneCount: canes.filter(c => c.condition === 'strong-cane').length,
    properBambooCount: canes.filter(c => c.condition === 'proper-bamboo').length,
    greenShootCount: canes.filter(c => c.condition === 'green-shoot').length,
    wiltedCaneCount: canes.filter(c => c.condition === 'wilted-cane').length,
    deadStalkCount: canes.filter(c => c.condition === 'dead-stalk').length,
    hasHighFlexibilityCount: canes.filter(c => c.bending.hasHighFlexibility).length,
    hasHighStrengthCount: canes.filter(c => c.knotting.hasHighStrength).length,
    hasHighEfficiencyCount: canes.filter(c => c.hollowing.hasHighEfficiency).length,
    hasHighSpeedCount: canes.filter(c => c.growing.hasHighSpeed).length,
    hasHighWindResistanceCount: canes.filter(c => c.resisting.hasHighWindResistance).length,
    overallVitality,
    gardenerGrade: classifyGardenerGrade(overallVitality),
    bestCane, mostFlexible, strongest, mostEfficient, fastestGrowing,
  }

  const recommendations = generateRecommendations(canes, groves, forest, stats)

  return { canes, groves, forest, stats, recommendations }
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
