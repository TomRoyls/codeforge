// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type DawnGrade = 'crystal-dawn' | 'clear-morning' | 'proper-light' | 'hazy-dawn' | 'foggy-morning' | 'no-dawn'
export type GemGrade = 'perfect-cut' | 'brilliant-facet' | 'proper-cut' | 'rough-facet' | 'uncut-stone' | 'no-gem'
export type HorizonGrade = 'infinite-horizon' | 'far-reaching' | 'proper-vision' | 'short-sighted' | 'tunnel-vision' | 'no-vision'
export type SunriseGrade = 'golden-sunrise' | 'bright-dawn' | 'proper-morning' | 'dim-sunrise' | 'gray-dawn' | 'no-sunrise'
export type TwilightGrade = 'sunset-wisdom' | 'evening-knowledge' | 'proper-learning' | 'forgotten-lessons' | 'no-learning' | 'oblivion'
export type FacetCondition = 'ruby-masterpiece' | 'gemstone-horizon' | 'proper-gem' | 'rough-mineral' | 'dull-stone' | 'gravel'
export type RangeType = 'mountain-range' | 'proper-horizon' | 'decent-ridge' | 'small-hill' | 'flat-plain' | 'no-range'
export type RangeCondition = 'majestic-panorama' | 'beautiful-vista' | 'decent-view' | 'limited-sight' | 'obscured' | 'void'
export type JewelerGrade = 'master-jeweler' | 'expert-gem-cutter' | 'skilled-lapidary' | 'apprentice' | 'novice' | 'rock-smasher'

export interface IlluminatingMeasure {
  clarity: number
  grade: DawnGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasWellStructured: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasClean: boolean
  hasNoDense: boolean
  hasFresh: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface CuttingMeasure {
  faceting: number
  gem: GemGrade
  hasHighFaceting: boolean
  hasPrecise: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasNoVague: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoBlurry: boolean
  hasMultiFaceted: boolean
  approximateCount: number
  vagueCount: number
}

export interface ReachingMeasure {
  reach: number
  horizon: HorizonGrade
  hasHighReach: boolean
  hasExtensible: boolean
  hasScalable: boolean
  hasNoFixedCapacity: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasFutureProof: boolean
  hasNoLegacyBound: boolean
  hasConfigurable: boolean
  hasNoHardcoded: boolean
  hasForward: boolean
  fixedCapacityCount: number
  monolithicCount: number
}

export interface EnergizingMeasure {
  vitality: number
  sunrise: SunriseGrade
  hasHighVitality: boolean
  hasDynamic: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasGrowing: boolean
  hasNoStagnant: boolean
  hasEvolving: boolean
  hasNoFrozen: boolean
  hasResponsive: boolean
  hasNoStatic: boolean
  hasEnergetic: boolean
  deadCount: number
  stagnantCount: number
}

export interface LearningMeasure {
  wisdom: number
  twilight: TwilightGrade
  hasHighWisdom: boolean
  hasIterated: boolean
  hasNoFirstDraft: boolean
  hasImproved: boolean
  hasNoRepeated: boolean
  hasRefactored: boolean
  hasNoUnchanged: boolean
  hasEvolved: boolean
  hasNoStatic: boolean
  hasAdaptive: boolean
  hasNoRigid: boolean
  firstDraftCount: number
  repeatedCount: number
}

export interface RubyFacet {
  file: string
  dawnClarity: number
  gemFaceting: number
  horizonReach: number
  sunriseVitality: number
  twilightWisdom: number
  illuminating: IlluminatingMeasure
  cutting: CuttingMeasure
  reaching: ReachingMeasure
  energizing: EnergizingMeasure
  learning: LearningMeasure
  condition: FacetCondition
  qualityScore: number
}

export interface HorizonRange {
  directory: string
  facets: RubyFacet[]
  avgClarity: number
  avgReach: number
  avgWisdom: number
  rubyMasterpieceCount: number
  gravelCount: number
  rangeType: RangeType
  condition: RangeCondition
}

export interface RubyPanorama {
  avgClarity: number
  avgReach: number
  avgWisdom: number
  isMajestic: boolean
  overallSplendor: number
}

export interface RubyHorizonStats {
  totalFiles: number
  totalRanges: number
  avgDawnClarity: number
  avgGemFaceting: number
  avgHorizonReach: number
  avgSunriseVitality: number
  avgTwilightWisdom: number
  rubyMasterpieceCount: number
  gemstoneHorizonCount: number
  properGemCount: number
  roughMineralCount: number
  dullStoneCount: number
  gravelCount: number
  hasHighClarityCount: number
  hasHighFacetingCount: number
  hasHighReachCount: number
  hasHighVitalityCount: number
  hasHighWisdomCount: number
  overallSplendor: number
  jewelerGrade: JewelerGrade
  bestFacet: string
  clearest: string
  bestCut: string
  farthest: string
  wisest: string
}

export interface RubyHorizonResult {
  facets: RubyFacet[]
  ranges: HorizonRange[]
  panorama: RubyPanorama
  stats: RubyHorizonStats
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
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure dawn clarity (readability)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.grade) // 'crystal-dawn'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0

  const hasReadable = hasConst(content) && hasExport(content)
  const hasWellStructured = hasInterface(content) && hasReturnType(content)
  const hasSelfDocumenting = hasNamedExport(content) && hasDocComments(content)
  const hasTransparent = hasImport(content) && hasAsync(content)
  const hasClean = hasOptional(content) && hasStrictEq(content)
  const hasFresh = hasArrowFunction(content) && hasMapFunction(content)

  score += hasReadable ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasFresh ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoDense = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: DawnGrade
  if (clarity >= 85) grade = 'crystal-dawn'
  else if (clarity >= 70) grade = 'clear-morning'
  else if (clarity >= 55) grade = 'proper-light'
  else if (clarity >= 40) grade = 'hazy-dawn'
  else if (clarity >= 25) grade = 'foggy-morning'
  else grade = 'no-dawn'

  return {
    clarity, grade, hasHighClarity, hasReadable, hasWellStructured,
    hasNoObfuscated, hasSelfDocumenting, hasNoCryptic, hasTransparent,
    hasNoHidden, hasClean, hasNoDense, hasFresh, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure gem faceting (precision)
 * @example
 * const m = measureCutting(content)
 * console.log(m.gem) // 'perfect-cut'
 */
export function measureCutting(content: string): CuttingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0

  const hasPrecise = hasInterface(content) && hasReturnType(content)
  const hasAccurate = hasReadonly(content) && hasStrictEq(content)
  const hasExact = hasGenerics(content) && hasTypeAlias(content)
  const hasSharp = hasEnum(content) && hasConst(content)
  const hasDefined = hasExport(content) && hasNamedExport(content)
  const hasMultiFaceted = hasOptional(content) && hasUnionType(content)

  score += hasPrecise ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0
  score += hasMultiFaceted ? 5 : 0

  const faceting = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const vagueCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoSloppy = !has(/\beval\b/, content)
  const hasNoBlurry = !has(/\bdebugger\b/, content)
  const hasHighFaceting = faceting >= 70

  let gem: GemGrade
  if (faceting >= 85) gem = 'perfect-cut'
  else if (faceting >= 70) gem = 'brilliant-facet'
  else if (faceting >= 55) gem = 'proper-cut'
  else if (faceting >= 40) gem = 'rough-facet'
  else if (faceting >= 25) gem = 'uncut-stone'
  else gem = 'no-gem'

  return {
    faceting, gem, hasHighFaceting, hasPrecise, hasAccurate, hasNoApproximate,
    hasExact, hasNoVague, hasSharp, hasNoSloppy, hasDefined, hasNoBlurry,
    hasMultiFaceted, approximateCount, vagueCount,
  }
}

/**
 * Measure horizon reach (forward-looking design)
 * @example
 * const m = measureReaching(content)
 * console.log(m.horizon) // 'infinite-horizon'
 */
export function measureReaching(content: string): ReachingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasExtensible = hasInterface(content) && hasGenerics(content)
  const hasScalable = hasExport(content) && hasNamedExport(content)
  const hasModular = hasTypeAlias(content) && hasAsync(content)
  const hasFutureProof = hasOptional(content) && hasMapFunction(content)
  const hasConfigurable = hasArrowFunction(content) && hasConst(content)
  const hasForward = hasReturnType(content) && hasEnum(content)

  score += hasExtensible ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasFutureProof ? 5 : 0
  score += hasConfigurable ? 5 : 0
  score += hasForward ? 5 : 0

  const reach = Math.min(score, 100)
  const fixedCapacityCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoFixedCapacity = fixedCapacityCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoLegacyBound = !has(/\beval\b/, content)
  const hasNoHardcoded = !has(/\bdebugger\b/, content)
  const hasHighReach = reach >= 70

  let horizon: HorizonGrade
  if (reach >= 85) horizon = 'infinite-horizon'
  else if (reach >= 70) horizon = 'far-reaching'
  else if (reach >= 55) horizon = 'proper-vision'
  else if (reach >= 40) horizon = 'short-sighted'
  else if (reach >= 25) horizon = 'tunnel-vision'
  else horizon = 'no-vision'

  return {
    reach, horizon, hasHighReach, hasExtensible, hasScalable, hasNoFixedCapacity,
    hasModular, hasNoMonolithic, hasFutureProof, hasNoLegacyBound, hasConfigurable,
    hasNoHardcoded, hasForward, fixedCapacityCount, monolithicCount,
  }
}

/**
 * Measure sunrise vitality (energy/growth)
 * @example
 * const m = measureEnergizing(content)
 * console.log(m.sunrise) // 'golden-sunrise'
 */
export function measureEnergizing(content: string): EnergizingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasArrowFunction(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0

  const hasDynamic = hasAsync(content) && hasMapFunction(content)
  const hasAlive = hasArrowFunction(content) && hasTryCatch(content)
  const hasGrowing = hasThrow(content) && hasConst(content)
  const hasEvolving = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasResponsive = hasConditional(content) && hasExport(content)
  const hasEnergetic = hasImport(content) && hasClass(content)

  score += hasDynamic ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasGrowing ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasEnergetic ? 5 : 0

  const vitality = Math.min(score, 100)
  const deadCount = countMatches(/\bvar\b/, content)
  const stagnantCount = countMatches(/\bany\b/, content)

  const hasNoDead = deadCount === 0
  const hasNoStagnant = stagnantCount === 0
  const hasNoFrozen = !has(/\beval\b/, content)
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  let sunrise: SunriseGrade
  if (vitality >= 85) sunrise = 'golden-sunrise'
  else if (vitality >= 70) sunrise = 'bright-dawn'
  else if (vitality >= 55) sunrise = 'proper-morning'
  else if (vitality >= 40) sunrise = 'dim-sunrise'
  else if (vitality >= 25) sunrise = 'gray-dawn'
  else sunrise = 'no-sunrise'

  return {
    vitality, sunrise, hasHighVitality, hasDynamic, hasAlive, hasNoDead,
    hasGrowing, hasNoStagnant, hasEvolving, hasNoFrozen, hasResponsive,
    hasNoStatic, hasEnergetic, deadCount, stagnantCount,
  }
}

/**
 * Measure twilight wisdom (learning from past)
 * @example
 * const m = measureLearning(content)
 * console.log(m.twilight) // 'sunset-wisdom'
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasIterated = hasTryCatch(content) && hasThrow(content)
  const hasImproved = hasDocComments(content) && hasReturnType(content)
  const hasRefactored = hasStrictEq(content) && hasAsync(content)
  const hasEvolved = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasAdaptive = hasInterface(content) && hasEnum(content)
  const hasNoStaticLearn = hasPrivate(content) && hasReadonly(content)

  score += hasIterated ? 5 : 0
  score += hasImproved ? 5 : 0
  score += hasRefactored ? 5 : 0
  score += hasEvolved ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasNoStaticLearn ? 5 : 0

  const wisdom = Math.min(score, 100)
  const firstDraftCount = countMatches(/\bvar\b/, content)
  const repeatedCount = countMatches(/\bany\b/, content)

  const hasNoFirstDraft = firstDraftCount === 0
  const hasNoRepeated = repeatedCount === 0
  const hasNoUnchanged = !has(/\beval\b/, content)
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasNoStatic = hasNoRigid
  const hasHighWisdom = wisdom >= 70

  let twilight: TwilightGrade
  if (wisdom >= 85) twilight = 'sunset-wisdom'
  else if (wisdom >= 70) twilight = 'evening-knowledge'
  else if (wisdom >= 55) twilight = 'proper-learning'
  else if (wisdom >= 40) twilight = 'forgotten-lessons'
  else if (wisdom >= 25) twilight = 'no-learning'
  else twilight = 'oblivion'

  return {
    wisdom, twilight, hasHighWisdom, hasIterated, hasNoFirstDraft,
    hasImproved, hasNoRepeated, hasRefactored, hasNoUnchanged, hasEvolved,
    hasNoStatic, hasAdaptive, hasNoRigid, firstDraftCount, repeatedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify facet condition
 * @example
 * classifyFacetCondition(90) // 'ruby-masterpiece'
 */
export function classifyFacetCondition(score: number): FacetCondition {
  if (score >= 85) return 'ruby-masterpiece'
  if (score >= 70) return 'gemstone-horizon'
  if (score >= 55) return 'proper-gem'
  if (score >= 40) return 'rough-mineral'
  if (score >= 25) return 'dull-stone'
  return 'gravel'
}

/**
 * Classify range type
 * @example
 * classifyRangeType(facets) // 'mountain-range'
 */
export function classifyRangeType(facets: RubyFacet[]): RangeType {
  if (facets.length === 0) return 'no-range'
  const avgQs = Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length)
  const rubyRatio = facets.filter(f => f.condition === 'ruby-masterpiece').length / facets.length
  if (avgQs >= 75 && rubyRatio >= 0.5) return 'mountain-range'
  if (avgQs >= 60) return 'proper-horizon'
  if (avgQs >= 45) return 'decent-ridge'
  if (avgQs >= 30) return 'small-hill'
  if (avgQs >= 15) return 'flat-plain'
  return 'no-range'
}

/**
 * Classify range condition
 * @example
 * classifyRangeCondition(80) // 'majestic-panorama'
 */
export function classifyRangeCondition(avgQs: number): RangeCondition {
  if (avgQs >= 75) return 'majestic-panorama'
  if (avgQs >= 60) return 'beautiful-vista'
  if (avgQs >= 45) return 'decent-view'
  if (avgQs >= 30) return 'limited-sight'
  if (avgQs >= 15) return 'obscured'
  return 'void'
}

/**
 * Classify jeweler grade
 * @example
 * classifyJewelerGrade(85) // 'master-jeweler'
 */
export function classifyJewelerGrade(avgSplendor: number): JewelerGrade {
  if (avgSplendor >= 80) return 'master-jeweler'
  if (avgSplendor >= 65) return 'expert-gem-cutter'
  if (avgSplendor >= 50) return 'skilled-lapidary'
  if (avgSplendor >= 35) return 'apprentice'
  if (avgSplendor >= 20) return 'novice'
  return 'rock-smasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(facets, ranges, panorama, stats)
 */
export function generateRecommendations(
  facets: RubyFacet[],
  ranges: HorizonRange[],
  panorama: RubyPanorama,
  stats: RubyHorizonStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDawnClarity < 50) {
    recs.push('Improve dawn clarity with readable exports, well-structured interfaces, and self-documenting code')
  }
  if (stats.avgGemFaceting < 50) {
    recs.push('Refine gem faceting with precise interfaces, accurate type annotations, and exact generic patterns')
  }
  if (stats.avgHorizonReach < 50) {
    recs.push('Extend horizon reach with extensible interfaces, scalable exports, and future-proof modular design')
  }
  if (stats.avgSunriseVitality < 50) {
    recs.push('Boost sunrise vitality with dynamic async patterns, alive error handling, and growing const-based flows')
  }
  if (stats.avgTwilightWisdom < 50) {
    recs.push('Grow twilight wisdom with iterated error handling, improved documentation, and refactored patterns')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — they need complete ruby restoration`)
  }
  if (panorama.overallSplendor < 40) {
    recs.push('Overall splendor is low — focus on dawn clarity and gem faceting first')
  }
  const allGravel = ranges.every(r => r.rangeType === 'no-range' || r.rangeType === 'flat-plain')
  if (allGravel && ranges.length > 0) {
    recs.push('All ranges are flat — consider a major ruby horizon reconstruction')
  }
  const gravelFiles = facets.filter(f => f.condition === 'gravel').map(f => f.file)
  if (gravelFiles.length > 0 && gravelFiles.length <= 3) {
    recs.push(`Restore these gravel files: ${gravelFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your ruby horizon shines with perfect splendor! Every facet is a ruby masterpiece in the mountain range')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ruby facet
 * @example
 * const f = analyzeRubyFacet(content, 'index.ts')
 * console.log(f.condition) // 'ruby-masterpiece'
 */
export function analyzeRubyFacet(content: string, filePath: string): RubyFacet {
  const illuminating = measureIlluminating(content)
  const cutting = measureCutting(content)
  const reaching = measureReaching(content)
  const energizing = measureEnergizing(content)
  const learning = measureLearning(content)

  const qualityScore = Math.round(
    illuminating.clarity * 0.2 +
    cutting.faceting * 0.2 +
    reaching.reach * 0.2 +
    energizing.vitality * 0.2 +
    learning.wisdom * 0.2,
  )

  return {
    file: filePath,
    dawnClarity: illuminating.clarity,
    gemFaceting: cutting.faceting,
    horizonReach: reaching.reach,
    sunriseVitality: energizing.vitality,
    twilightWisdom: learning.wisdom,
    illuminating,
    cutting,
    reaching,
    energizing,
    learning,
    condition: classifyFacetCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as horizon range
 * @example
 * const r = analyzeHorizonRange(facets, 'src')
 * console.log(r.rangeType) // 'mountain-range'
 */
export function analyzeHorizonRange(facets: RubyFacet[], dirPath: string): HorizonRange {
  if (facets.length === 0) {
    return {
      directory: dirPath, facets: [], avgClarity: 0, avgReach: 0,
      avgWisdom: 0, rubyMasterpieceCount: 0, gravelCount: 0,
      rangeType: 'no-range', condition: 'void',
    }
  }

  const avgClarity = Math.round(facets.reduce((s, f) => s + f.dawnClarity, 0) / facets.length)
  const avgReach = Math.round(facets.reduce((s, f) => s + f.horizonReach, 0) / facets.length)
  const avgWisdom = Math.round(facets.reduce((s, f) => s + f.twilightWisdom, 0) / facets.length)
  const rubyMasterpieceCount = facets.filter(f => f.condition === 'ruby-masterpiece').length
  const gravelCount = facets.filter(f => f.condition === 'gravel').length
  const avgQs = Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length)

  return {
    directory: dirPath, facets, avgClarity, avgReach, avgWisdom,
    rubyMasterpieceCount, gravelCount,
    rangeType: classifyRangeType(facets),
    condition: classifyRangeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete ruby horizon result
 * @example
 * const result = await buildRubyHorizonResult(files, contents)
 * console.log(result.stats.jewelerGrade) // 'master-jeweler'
 */
export async function buildRubyHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyHorizonResult> {
  const facets = files.map((file, i) => analyzeRubyFacet(contents[i] ?? '', file))

  const dirMap = new Map<string, RubyFacet[]>()
  for (const facet of facets) {
    const dir = path.dirname(facet.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(facet) } else { dirMap.set(dir, [facet]) }
  }

  const ranges = Array.from(dirMap.entries()).map(([dir, dirFacets]) =>
    analyzeHorizonRange(dirFacets, dir),
  )

  const avgClarity = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.dawnClarity, 0) / facets.length) : 0
  const avgReach = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.horizonReach, 0) / facets.length) : 0
  const avgWisdom = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.twilightWisdom, 0) / facets.length) : 0

  const overallSplendor = facets.length > 0
    ? Math.round((avgClarity + avgReach + avgWisdom) / 3) : 0
  const isMajestic = avgClarity >= 60

  const panorama: RubyPanorama = { avgClarity, avgReach, avgWisdom, isMajestic, overallSplendor }

  const avgDawnClarity = avgClarity
  const avgGemFaceting = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.gemFaceting, 0) / facets.length) : 0
  const avgHorizonReach = avgReach
  const avgSunriseVitality = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.sunriseVitality, 0) / facets.length) : 0
  const avgTwilightWisdom = avgWisdom

  const bestFacet = facets.length > 0
    ? facets.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const clearest = facets.length > 0
    ? facets.reduce((best, f) => f.dawnClarity > best.dawnClarity ? f : best).file : ''
  const bestCut = facets.length > 0
    ? facets.reduce((best, f) => f.gemFaceting > best.gemFaceting ? f : best).file : ''
  const farthest = facets.length > 0
    ? facets.reduce((best, f) => f.horizonReach > best.horizonReach ? f : best).file : ''
  const wisest = facets.length > 0
    ? facets.reduce((best, f) => f.twilightWisdom > best.twilightWisdom ? f : best).file : ''

  const stats: RubyHorizonStats = {
    totalFiles: facets.length,
    totalRanges: ranges.length,
    avgDawnClarity,
    avgGemFaceting,
    avgHorizonReach,
    avgSunriseVitality,
    avgTwilightWisdom,
    rubyMasterpieceCount: facets.filter(f => f.condition === 'ruby-masterpiece').length,
    gemstoneHorizonCount: facets.filter(f => f.condition === 'gemstone-horizon').length,
    properGemCount: facets.filter(f => f.condition === 'proper-gem').length,
    roughMineralCount: facets.filter(f => f.condition === 'rough-mineral').length,
    dullStoneCount: facets.filter(f => f.condition === 'dull-stone').length,
    gravelCount: facets.filter(f => f.condition === 'gravel').length,
    hasHighClarityCount: facets.filter(f => f.illuminating.hasHighClarity).length,
    hasHighFacetingCount: facets.filter(f => f.cutting.hasHighFaceting).length,
    hasHighReachCount: facets.filter(f => f.reaching.hasHighReach).length,
    hasHighVitalityCount: facets.filter(f => f.energizing.hasHighVitality).length,
    hasHighWisdomCount: facets.filter(f => f.learning.hasHighWisdom).length,
    overallSplendor,
    jewelerGrade: classifyJewelerGrade(overallSplendor),
    bestFacet, clearest, bestCut, farthest, wisest,
  }

  const recommendations = generateRecommendations(facets, ranges, panorama, stats)

  return { facets, ranges, panorama, stats, recommendations }
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
