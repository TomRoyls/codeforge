// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Reigning grade */
export type ReigningGrade =
  | 'golden-throne'
  | 'iron-seat'
  | 'proper-throne'
  | 'wooden-chair'
  | 'wobbly-stool'
  | 'no-seat'

/** Coal grade */
export type CoalGrade =
  | 'eternal-ember'
  | 'long-burning'
  | 'proper-coal'
  | 'quick-burn'
  | 'dying-ember'
  | 'cold-ash'

/** Ash grade */
export type AshGrade =
  | 'phoenix-ash'
  | 'wise-cinders'
  | 'proper-ash'
  | 'unburned-lessons'
  | 'wasted-ash'
  | 'no-wisdom'

/** Flame grade */
export type FlameGrade =
  | 'eternal-flame'
  | 'bright-beacon'
  | 'proper-fire'
  | 'flickering-candle'
  | 'dying-spark'
  | 'no-flame'

/** Heat grade */
export type HeatGrade =
  | 'perfect-radiator'
  | 'even-warmth'
  | 'proper-distribution'
  | 'hot-spots'
  | 'cold-corners'
  | 'no-heat'

/** Seat condition */
export type SeatCondition =
  | 'imperial-throne'
  | 'warrior-seat'
  | 'proper-chair'
  | 'common-stool'
  | 'broken-bench'
  | 'rubble'

/** Room type */
export type RoomType =
  | 'grand-hall'
  | 'throne-room'
  | 'proper-chamber'
  | 'small-room'
  | 'closet'
  | 'no-room'

/** Room condition */
export type RoomCondition =
  | 'imperial-palace'
  | 'grand-hall'
  | 'decent-room'
  | 'humble-chamber'
  | 'ruined-hall'
  | 'void'

/** Ruler grade */
export type RulerGrade =
  | 'emperor'
  | 'king'
  | 'noble'
  | 'knight'
  | 'peasant'
  | 'beggar'

/** Reigning measurement */
export interface ReigningMeasure {
  quality: number
  grade: ReigningGrade
  hasHighQuality: boolean
  hasAuthoritative: boolean
  hasSingleResponsibility: boolean
  hasNoGodObjects: boolean
  hasClearOwnership: boolean
  hasNoAmbiguous: boolean
  hasWellScoped: boolean
  hasNoOverreach: boolean
  hasPurposeful: boolean
  hasNoScattered: boolean
  hasCommanding: boolean
  godObjectCount: number
  ambiguousCount: number
}

/** Enduring measurement */
export interface EnduringMeasure {
  endurance: number
  coal: CoalGrade
  hasHighEndurance: boolean
  hasSustainable: boolean
  hasNoShortLived: boolean
  hasMaintainable: boolean
  hasNoDisposable: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  shortLivedCount: number
  disposableCount: number
}

/** Learning measurement */
export interface LearningMeasure {
  wisdom: number
  ash: AshGrade
  hasHighWisdom: boolean
  hasErrorLearning: boolean
  hasRetryLogic: boolean
  hasNoRepeatedMistakes: boolean
  hasImprovement: boolean
  hasNoStagnation: boolean
  hasAdaptive: boolean
  hasNoRepetitive: boolean
  hasEvolving: boolean
  hasNoStatic: boolean
  hasProgressive: boolean
  repeatedMistakesCount: number
  stagnationCount: number
}

/** Commanding measurement */
export interface CommandingMeasure {
  authority: number
  flame: FlameGrade
  hasHighAuthority: boolean
  hasDecisive: boolean
  hasClearLogic: boolean
  hasNoAmbiguous: boolean
  hasDeterministic: boolean
  hasNoNondeterministic: boolean
  hasExplicit: boolean
  hasNoImplicit: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasAuthoritative: boolean
  ambiguousCount: number
  nondeterministicCount: number
}

/** Distributing measurement */
export interface DistributingMeasure {
  distribution: number
  heat: HeatGrade
  hasHighDistribution: boolean
  hasBalanced: boolean
  hasNoOverweight: boolean
  hasEvenWorkload: boolean
  hasNoBottlenecks: boolean
  hasDistributed: boolean
  hasNoConcentrated: boolean
  hasFairAllocation: boolean
  hasNoResourceHoarding: boolean
  hasProportioned: boolean
  hasNoUnbalanced: boolean
  overweightCount: number
  bottleneckCount: number
}

/** Single file analysis */
export interface EmberSeat {
  file: string
  sovereigntyQuality: number
  coalEndurance: number
  ashWisdom: number
  flameAuthority: number
  heatDistribution: number
  reigning: ReigningMeasure
  enduring: EnduringMeasure
  learning: LearningMeasure
  commanding: CommandingMeasure
  distributing: DistributingMeasure
  condition: SeatCondition
  qualityScore: number
}

/** Directory-level room */
export interface ThroneRoom {
  directory: string
  seats: EmberSeat[]
  avgSovereignty: number
  avgEndurance: number
  avgAuthority: number
  imperialThroneCount: number
  rubbleCount: number
  roomType: RoomType
  condition: RoomCondition
}

/** Kingdom summary */
export interface KingdomSummary {
  avgSovereignty: number
  avgEndurance: number
  avgAuthority: number
  isImperial: boolean
  overallMajesty: number
}

/** Full stats */
export interface EmberThroneStats {
  totalFiles: number
  totalRooms: number
  avgSovereigntyQuality: number
  avgCoalEndurance: number
  avgAshWisdom: number
  avgFlameAuthority: number
  avgHeatDistribution: number
  imperialThroneCount: number
  warriorSeatCount: number
  properChairCount: number
  commonStoolCount: number
  brokenBenchCount: number
  rubbleCount: number
  hasHighQualityCount: number
  hasHighEnduranceCount: number
  hasHighWisdomCount: number
  hasHighAuthorityCount: number
  hasHighDistributionCount: number
  overallMajesty: number
  rulerGrade: RulerGrade
  bestSeat: string
  mostSovereign: string
  mostEnduring: string
  wisest: string
  mostAuthoritative: string
}

/** Full result */
export interface EmberThroneResult {
  seats: EmberSeat[]
  rooms: ThroneRoom[]
  kingdom: KingdomSummary
  stats: EmberThroneStats
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
 * Measure sovereignty quality (reigning)
 * @example
 * const m = measureReigning(content)
 * console.log(m.grade) // 'golden-throne'
 */
export function measureReigning(content: string): ReigningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasAuthoritative = hasExport(content) && hasReturnType(content)
  const hasSingleResponsibility = hasInterface(content) && hasExport(content)
  const hasClearOwnership = hasNamedExport(content) && hasConst(content)
  const hasWellScoped = hasReadonly(content) && hasPrivate(content)
  const hasPurposeful = hasDocComments(content) && hasReturnType(content)
  const hasCommanding = hasGenerics(content) && hasInterface(content)

  score += hasAuthoritative ? 5 : 0
  score += hasSingleResponsibility ? 5 : 0
  score += hasClearOwnership ? 5 : 0
  score += hasWellScoped ? 5 : 0
  score += hasPurposeful ? 5 : 0
  score += hasCommanding ? 5 : 0

  const quality = Math.min(score, 100)
  const godObjectCount = countMatches(/\bvar\b/, content)
  const ambiguousCount = countMatches(/\bany\b/, content)

  const hasNoGodObjects = godObjectCount === 0
  const hasNoAmbiguous = ambiguousCount === 0
  const hasNoOverreach = !has(/\beval\b/, content)
  const hasNoScattered = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: ReigningGrade
  if (quality >= 85) grade = 'golden-throne'
  else if (quality >= 70) grade = 'iron-seat'
  else if (quality >= 55) grade = 'proper-throne'
  else if (quality >= 40) grade = 'wooden-chair'
  else if (quality >= 25) grade = 'wobbly-stool'
  else grade = 'no-seat'

  return {
    quality, grade, hasHighQuality, hasAuthoritative, hasSingleResponsibility,
    hasNoGodObjects, hasClearOwnership, hasNoAmbiguous, hasWellScoped,
    hasNoOverreach, hasPurposeful, hasNoScattered, hasCommanding,
    godObjectCount, ambiguousCount,
  }
}

/**
 * Measure coal endurance (enduring)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.coal) // 'eternal-ember'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasSustainable = hasConst(content) && hasReadonly(content)
  const hasMaintainable = hasDocComments(content) && hasInterface(content)
  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasTested = hasReturnType(content) && hasExport(content)
  const hasVersioned = hasNamedExport(content) && hasExport(content)
  const hasNoUnversioned = hasExport(content) && hasImport(content)

  score += hasSustainable ? 5 : 0
  score += hasMaintainable ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasNoUnversioned ? 5 : 0

  const endurance = Math.min(score, 100)
  const shortLivedCount = countMatches(/\bvar\b/, content)
  const disposableCount = countMatches(/\bany\b/, content)

  const hasNoShortLived = shortLivedCount === 0
  const hasNoDisposable = disposableCount === 0
  const hasNoUndocumented = !has(/\beval\b/, content)
  const hasNoUntested = !has(/\bdebugger\b/, content)
  const hasHighEndurance = endurance >= 70

  let coal: CoalGrade
  if (endurance >= 85) coal = 'eternal-ember'
  else if (endurance >= 70) coal = 'long-burning'
  else if (endurance >= 55) coal = 'proper-coal'
  else if (endurance >= 40) coal = 'quick-burn'
  else if (endurance >= 25) coal = 'dying-ember'
  else coal = 'cold-ash'

  return {
    endurance, coal, hasHighEndurance, hasSustainable, hasNoShortLived,
    hasMaintainable, hasNoDisposable, hasDocumented, hasNoUndocumented,
    hasTested, hasNoUntested, hasVersioned, hasNoUnversioned,
    shortLivedCount, disposableCount,
  }
}

/**
 * Measure ash wisdom (learning)
 * @example
 * const m = measureLearning(content)
 * console.log(m.ash) // 'phoenix-ash'
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0

  const hasErrorLearning = hasTryCatch(content) && hasReturnType(content)
  const hasRetryLogic = hasAsync(content) && hasTryCatch(content)
  const hasImprovement = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasAdaptive = hasGenerics(content) && hasOptional(content)
  const hasEvolving = hasMapFunction(content) && hasArrowFunction(content)
  const hasProgressive = hasInterface(content) && hasStrictEq(content)

  score += hasErrorLearning ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasImprovement ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasProgressive ? 5 : 0

  const wisdom = Math.min(score, 100)
  const repeatedMistakesCount = countMatches(/\bvar\b/, content)
  const stagnationCount = countMatches(/\bany\b/, content)

  const hasNoRepeatedMistakes = repeatedMistakesCount === 0
  const hasNoStagnation = stagnationCount === 0
  const hasNoRepetitive = !has(/\beval\b/, content)
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let ash: AshGrade
  if (wisdom >= 85) ash = 'phoenix-ash'
  else if (wisdom >= 70) ash = 'wise-cinders'
  else if (wisdom >= 55) ash = 'proper-ash'
  else if (wisdom >= 40) ash = 'unburned-lessons'
  else if (wisdom >= 25) ash = 'wasted-ash'
  else ash = 'no-wisdom'

  return {
    wisdom, ash, hasHighWisdom, hasErrorLearning, hasRetryLogic,
    hasNoRepeatedMistakes, hasImprovement, hasNoStagnation, hasAdaptive,
    hasNoRepetitive, hasEvolving, hasNoStatic, hasProgressive,
    repeatedMistakesCount, stagnationCount,
  }
}

/**
 * Measure flame authority (commanding)
 * @example
 * const m = measureCommanding(content)
 * console.log(m.flame) // 'eternal-flame'
 */
export function measureCommanding(content: string): CommandingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasTernary(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasSwitch(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0

  const hasDecisive = hasStrictEq(content) && hasConst(content)
  const hasClearLogic = hasReturnType(content) && hasConditional(content)
  const hasDeterministic = hasEnum(content) && hasSwitch(content)
  const hasExplicit = hasReturnType(content) && hasExport(content)
  const hasPredictable = hasConst(content) && hasStrictEq(content)
  const hasAuthoritative = hasInterface(content) && hasNamedExport(content)

  score += hasDecisive ? 5 : 0
  score += hasClearLogic ? 5 : 0
  score += hasDeterministic ? 5 : 0
  score += hasExplicit ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasAuthoritative ? 5 : 0

  const authority = Math.min(score, 100)
  const ambiguousCount = countMatches(/\bvar\b/, content)
  const nondeterministicCount = countMatches(/\bany\b/, content)

  const hasNoAmbiguous = ambiguousCount === 0
  const hasNoNondeterministic = nondeterministicCount === 0
  const hasNoImplicit = !has(/\beval\b/, content)
  const hasNoSurprising = !has(/\bdebugger\b/, content)
  const hasHighAuthority = authority >= 70

  let flame: FlameGrade
  if (authority >= 85) flame = 'eternal-flame'
  else if (authority >= 70) flame = 'bright-beacon'
  else if (authority >= 55) flame = 'proper-fire'
  else if (authority >= 40) flame = 'flickering-candle'
  else if (authority >= 25) flame = 'dying-spark'
  else flame = 'no-flame'

  return {
    authority, flame, hasHighAuthority, hasDecisive, hasClearLogic,
    hasNoAmbiguous, hasDeterministic, hasNoNondeterministic, hasExplicit,
    hasNoImplicit, hasPredictable, hasNoSurprising, hasAuthoritative,
    ambiguousCount, nondeterministicCount,
  }
}

/**
 * Measure heat distribution (distributing)
 * @example
 * const m = measureDistributing(content)
 * console.log(m.heat) // 'perfect-radiator'
 */
export function measureDistributing(content: string): DistributingMeasure {
  let score = 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasArrowFunction(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0

  const hasBalanced = hasMapFunction(content) && hasArrowFunction(content)
  const hasEvenWorkload = hasAsync(content) && hasConst(content)
  const hasDistributed = hasGenerics(content) && hasInterface(content)
  const hasFairAllocation = hasOptional(content) && hasDefaultParam(content)
  const hasProportioned = hasExport(content) && hasNamedExport(content)
  const hasNoUnbalanced = hasImport(content) && hasReturnType(content)

  score += hasBalanced ? 5 : 0
  score += hasEvenWorkload ? 5 : 0
  score += hasDistributed ? 5 : 0
  score += hasFairAllocation ? 5 : 0
  score += hasProportioned ? 5 : 0
  score += hasNoUnbalanced ? 5 : 0

  const distribution = Math.min(score, 100)
  const overweightCount = countMatches(/\bvar\b/, content)
  const bottleneckCount = countMatches(/\bany\b/, content)

  const hasNoOverweight = overweightCount === 0
  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoConcentrated = !has(/\beval\b/, content)
  const hasNoResourceHoarding = !has(/\bdebugger\b/, content)
  const hasHighDistribution = distribution >= 70

  let heat: HeatGrade
  if (distribution >= 85) heat = 'perfect-radiator'
  else if (distribution >= 70) heat = 'even-warmth'
  else if (distribution >= 55) heat = 'proper-distribution'
  else if (distribution >= 40) heat = 'hot-spots'
  else if (distribution >= 25) heat = 'cold-corners'
  else heat = 'no-heat'

  return {
    distribution, heat, hasHighDistribution, hasBalanced, hasNoOverweight,
    hasEvenWorkload, hasNoBottlenecks, hasDistributed, hasNoConcentrated,
    hasFairAllocation, hasNoResourceHoarding, hasProportioned, hasNoUnbalanced,
    overweightCount, bottleneckCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify seat condition
 * @example
 * classifySeatCondition(90) // 'imperial-throne'
 */
export function classifySeatCondition(score: number): SeatCondition {
  if (score >= 85) return 'imperial-throne'
  if (score >= 70) return 'warrior-seat'
  if (score >= 55) return 'proper-chair'
  if (score >= 40) return 'common-stool'
  if (score >= 25) return 'broken-bench'
  return 'rubble'
}

/**
 * Classify room type
 * @example
 * classifyRoomType(seats) // 'grand-hall'
 */
export function classifyRoomType(seats: EmberSeat[]): RoomType {
  if (seats.length === 0) return 'no-room'
  const avgQs = Math.round(seats.reduce((s, e) => s + e.qualityScore, 0) / seats.length)
  const imperialRatio = seats.filter(e => e.condition === 'imperial-throne').length / seats.length
  if (avgQs >= 75 && imperialRatio >= 0.5) return 'grand-hall'
  if (avgQs >= 60) return 'throne-room'
  if (avgQs >= 45) return 'proper-chamber'
  if (avgQs >= 30) return 'small-room'
  if (avgQs >= 15) return 'closet'
  return 'no-room'
}

/**
 * Classify room condition
 * @example
 * classifyRoomCondition(80) // 'imperial-palace'
 */
export function classifyRoomCondition(avgQs: number): RoomCondition {
  if (avgQs >= 75) return 'imperial-palace'
  if (avgQs >= 60) return 'grand-hall'
  if (avgQs >= 45) return 'decent-room'
  if (avgQs >= 30) return 'humble-chamber'
  if (avgQs >= 15) return 'ruined-hall'
  return 'void'
}

/**
 * Classify ruler grade
 * @example
 * classifyRulerGrade(85) // 'emperor'
 */
export function classifyRulerGrade(avgMajesty: number): RulerGrade {
  if (avgMajesty >= 80) return 'emperor'
  if (avgMajesty >= 65) return 'king'
  if (avgMajesty >= 50) return 'noble'
  if (avgMajesty >= 35) return 'knight'
  if (avgMajesty >= 20) return 'peasant'
  return 'beggar'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(seats, rooms, kingdom, stats)
 */
export function generateRecommendations(
  seats: EmberSeat[],
  rooms: ThroneRoom[],
  kingdom: KingdomSummary,
  stats: EmberThroneStats,
): string[] {
  const recs: string[] = []
  if (stats.avgSovereigntyQuality < 50) {
    recs.push('Improve sovereignty quality with clear ownership, single responsibility, and authoritative exports')
  }
  if (stats.avgCoalEndurance < 50) {
    recs.push('Strengthen coal endurance with documentation, sustainable patterns, and versioned interfaces')
  }
  if (stats.avgAshWisdom < 50) {
    recs.push('Deepen ash wisdom with error learning, retry logic, and adaptive evolution')
  }
  if (stats.avgFlameAuthority < 50) {
    recs.push('Sharpen flame authority with decisive logic, deterministic patterns, and explicit types')
  }
  if (stats.avgHeatDistribution < 50) {
    recs.push('Even out heat distribution with balanced workloads, distributed generics, and fair allocation')
  }
  if (stats.rubbleCount > 0) {
    recs.push(`${stats.rubbleCount} file(s) are rubble — they need complete ember throne restoration`)
  }
  if (kingdom.overallMajesty < 40) {
    recs.push('Overall kingdom majesty is low — focus on sovereignty quality and flame authority first')
  }
  const allBroken = rooms.every(r => r.roomType === 'no-room' || r.roomType === 'closet')
  if (allBroken && rooms.length > 0) {
    recs.push('All throne rooms are ruined — consider a major kingdom reconstruction')
  }
  const rubbleFiles = seats.filter(e => e.condition === 'rubble').map(e => e.file)
  if (rubbleFiles.length > 0 && rubbleFiles.length <= 3) {
    recs.push(`Restore these rubble files into ember throne seats: ${rubbleFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your ember throne achieves emperor-grade majesty! Every seat radiates sovereign authority')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ember seat
 * @example
 * const s = analyzeEmberSeat(content, 'index.ts')
 * console.log(s.condition) // 'imperial-throne'
 */
export function analyzeEmberSeat(content: string, filePath: string): EmberSeat {
  const reigning = measureReigning(content)
  const enduring = measureEnduring(content)
  const learning = measureLearning(content)
  const commanding = measureCommanding(content)
  const distributing = measureDistributing(content)

  const qualityScore = Math.round(
    reigning.quality * 0.2 +
    enduring.endurance * 0.2 +
    learning.wisdom * 0.2 +
    commanding.authority * 0.2 +
    distributing.distribution * 0.2,
  )

  return {
    file: filePath,
    sovereigntyQuality: reigning.quality,
    coalEndurance: enduring.endurance,
    ashWisdom: learning.wisdom,
    flameAuthority: commanding.authority,
    heatDistribution: distributing.distribution,
    reigning,
    enduring,
    learning,
    commanding,
    distributing,
    condition: classifySeatCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as throne room
 * @example
 * const r = analyzeThroneRoom(seats, 'src')
 * console.log(r.roomType) // 'grand-hall'
 */
export function analyzeThroneRoom(seats: EmberSeat[], dirPath: string): ThroneRoom {
  if (seats.length === 0) {
    return {
      directory: dirPath, seats: [], avgSovereignty: 0, avgEndurance: 0,
      avgAuthority: 0, imperialThroneCount: 0, rubbleCount: 0,
      roomType: 'no-room', condition: 'void',
    }
  }

  const avgSovereignty = Math.round(seats.reduce((s, e) => s + e.sovereigntyQuality, 0) / seats.length)
  const avgEndurance = Math.round(seats.reduce((s, e) => s + e.coalEndurance, 0) / seats.length)
  const avgAuthority = Math.round(seats.reduce((s, e) => s + e.flameAuthority, 0) / seats.length)
  const imperialThroneCount = seats.filter(e => e.condition === 'imperial-throne').length
  const rubbleCount = seats.filter(e => e.condition === 'rubble').length
  const avgQs = Math.round(seats.reduce((s, e) => s + e.qualityScore, 0) / seats.length)

  return {
    directory: dirPath, seats, avgSovereignty, avgEndurance, avgAuthority,
    imperialThroneCount, rubbleCount,
    roomType: classifyRoomType(seats),
    condition: classifyRoomCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete ember throne result
 * @example
 * const result = await buildEmberThroneResult(files, contents)
 * console.log(result.stats.rulerGrade) // 'emperor'
 */
export async function buildEmberThroneResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmberThroneResult> {
  const seats = files.map((file, i) => analyzeEmberSeat(contents[i] ?? '', file))

  const dirMap = new Map<string, EmberSeat[]>()
  for (const seat of seats) {
    const dir = path.dirname(seat.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(seat) } else { dirMap.set(dir, [seat]) }
  }

  const rooms = Array.from(dirMap.entries()).map(([dir, dirSeats]) =>
    analyzeThroneRoom(dirSeats, dir),
  )

  const avgSovereignty = seats.length > 0
    ? Math.round(seats.reduce((s, e) => s + e.sovereigntyQuality, 0) / seats.length) : 0
  const avgEndurance = seats.length > 0
    ? Math.round(seats.reduce((s, e) => s + e.coalEndurance, 0) / seats.length) : 0
  const avgAuthority = seats.length > 0
    ? Math.round(seats.reduce((s, e) => s + e.flameAuthority, 0) / seats.length) : 0

  const overallMajesty = seats.length > 0
    ? Math.round((avgSovereignty + avgEndurance + avgAuthority) / 3) : 0
  const isImperial = avgSovereignty >= 60

  const kingdom: KingdomSummary = { avgSovereignty, avgEndurance, avgAuthority, isImperial, overallMajesty }

  const avgAshWisdom = seats.length > 0
    ? Math.round(seats.reduce((s, e) => s + e.ashWisdom, 0) / seats.length) : 0
  const avgHeatDistribution = seats.length > 0
    ? Math.round(seats.reduce((s, e) => s + e.heatDistribution, 0) / seats.length) : 0

  const bestSeat = seats.length > 0
    ? seats.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const mostSovereign = seats.length > 0
    ? seats.reduce((best, e) => e.sovereigntyQuality > best.sovereigntyQuality ? e : best).file : ''
  const mostEnduring = seats.length > 0
    ? seats.reduce((best, e) => e.coalEndurance > best.coalEndurance ? e : best).file : ''
  const wisest = seats.length > 0
    ? seats.reduce((best, e) => e.ashWisdom > best.ashWisdom ? e : best).file : ''
  const mostAuthoritative = seats.length > 0
    ? seats.reduce((best, e) => e.flameAuthority > best.flameAuthority ? e : best).file : ''

  const stats: EmberThroneStats = {
    totalFiles: seats.length,
    totalRooms: rooms.length,
    avgSovereigntyQuality: avgSovereignty,
    avgCoalEndurance: avgEndurance,
    avgAshWisdom,
    avgFlameAuthority: avgAuthority,
    avgHeatDistribution,
    imperialThroneCount: seats.filter(e => e.condition === 'imperial-throne').length,
    warriorSeatCount: seats.filter(e => e.condition === 'warrior-seat').length,
    properChairCount: seats.filter(e => e.condition === 'proper-chair').length,
    commonStoolCount: seats.filter(e => e.condition === 'common-stool').length,
    brokenBenchCount: seats.filter(e => e.condition === 'broken-bench').length,
    rubbleCount: seats.filter(e => e.condition === 'rubble').length,
    hasHighQualityCount: seats.filter(e => e.reigning.hasHighQuality).length,
    hasHighEnduranceCount: seats.filter(e => e.enduring.hasHighEndurance).length,
    hasHighWisdomCount: seats.filter(e => e.learning.hasHighWisdom).length,
    hasHighAuthorityCount: seats.filter(e => e.commanding.hasHighAuthority).length,
    hasHighDistributionCount: seats.filter(e => e.distributing.hasHighDistribution).length,
    overallMajesty,
    rulerGrade: classifyRulerGrade(overallMajesty),
    bestSeat, mostSovereign, mostEnduring, wisest, mostAuthoritative,
  }

  const recommendations = generateRecommendations(seats, rooms, kingdom, stats)

  return { seats, rooms, kingdom, stats, recommendations }
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
