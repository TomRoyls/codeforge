// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type HardnessGrade = 'flawless-diamond' | 'internally-flawless' | 'very-very-slight' | 'slightly-included' | 'included' | 'industrial-grade'
export type CutType = 'ideal-cut' | 'excellent-cut' | 'very-good-cut' | 'good-cut' | 'fair-cut' | 'poor-cut'
export type FireType = 'maximum-fire' | 'excellent-dispersion' | 'proper-spectrum' | 'limited-color' | 'dull-stone' | 'no-fire'
export type ShineType = 'dazzling-brilliance' | 'bright-shine' | 'proper-glow' | 'dim-luster' | 'dull-surface' | 'no-brilliance'
export type CaratType = 'substantial-gem' | 'proper-weight' | 'decent-carat' | 'light-weight' | 'chip' | 'no-substance'
export type FacetCondition = 'flawless-diamond' | 'premium-gem' | 'proper-diamond' | 'rough-gem' | 'industrial-stone' | 'carbon'
export type MineType = 'kimberley-mine' | 'premium-shaft' | 'proper-tunnel' | 'small-excavation' | 'surface-scraping' | 'no-mine'
export type MineCondition = 'diamond-empire' | 'rich-mine' | 'decent-shaft' | 'played-out' | 'abandoned' | 'void'
export type JewelerGrade = 'master-gemologist' | 'expert-jeweler' | 'skilled-cutter' | 'apprentice' | 'novice' | 'rock-smasher'

export interface EnduringMeasure {
  hardness: number
  grade: HardnessGrade
  hasHighHardness: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface CuttingMeasure {
  precision: number
  cut: CutType
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasWellOrganized: boolean
  hasNoScattered: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  approximateCount: number
  sloppyCount: number
}

export interface DispersingMeasure {
  dispersion: number
  fire: FireType
  hasHighDispersion: boolean
  hasTypeHandling: boolean
  hasCaseCoverage: boolean
  hasNoSinglePath: boolean
  hasPolymorphic: boolean
  hasNoMonomorphic: boolean
  hasGeneric: boolean
  hasNoHardcoded: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasAdaptive: boolean
  singlePathCount: number
  hardcodedCount: number
}

export interface ShiningMeasure {
  brilliance: number
  shine: ShineType
  hasHighBrilliance: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasWellNamed: boolean
  hasNoMisnamed: boolean
  hasBeautiful: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface WeighingMeasure {
  substance: number
  carat: CaratType
  hasHighSubstance: boolean
  hasEssential: boolean
  hasHighValue: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasImpactful: boolean
  hasNoDeadCode: boolean
  hasValuable: boolean
  hasNoRedundant: boolean
  hasSubstantive: boolean
  fillerCount: number
  deadCodeCount: number
}

export interface DiamondFacet {
  file: string
  hardnessClarity: number
  cutPrecision: number
  fireDispersion: number
  brillianceQuality: number
  caratSubstance: number
  enduring: EnduringMeasure
  cutting: CuttingMeasure
  dispersing: DispersingMeasure
  shining: ShiningMeasure
  weighing: WeighingMeasure
  condition: FacetCondition
  qualityScore: number
}

export interface DiamondMine {
  directory: string
  facets: DiamondFacet[]
  avgHardness: number
  avgPrecision: number
  avgBrilliance: number
  flawlessDiamondCount: number
  carbonCount: number
  mineType: MineType
  condition: MineCondition
}

export interface DiamondHorizon {
  avgHardness: number
  avgPrecision: number
  avgBrilliance: number
  isFlawless: boolean
  overallClarity: number
}

export interface DiamondCelebration {
  milestone: number
  name: string
  message: string
  previousMilestones: number[]
  totalTests: number
}

export interface DiamondHorizonStats {
  totalFiles: number
  totalMines: number
  avgHardnessClarity: number
  avgCutPrecision: number
  avgFireDispersion: number
  avgBrillianceQuality: number
  avgCaratSubstance: number
  flawlessDiamondCount: number
  premiumGemCount: number
  properDiamondCount: number
  roughGemCount: number
  industrialStoneCount: number
  carbonCount: number
  hasHighHardnessCount: number
  hasHighPrecisionCount: number
  hasHighDispersionCount: number
  hasHighBrillianceCount: number
  hasHighSubstanceCount: number
  overallClarity: number
  jewelerGrade: JewelerGrade
  bestFacet: string
  hardest: string
  bestCut: string
  mostFire: string
  mostBrilliant: string
}

export interface DiamondHorizonResult {
  facets: DiamondFacet[]
  mines: DiamondMine[]
  horizon: DiamondHorizon
  celebration: DiamondCelebration
  stats: DiamondHorizonStats
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
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^=]/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure hardness clarity (durability + transparency)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.grade) // 'flawless-diamond'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasRobust = hasStrictEq(content) && hasReturnType(content)
  const didTested = hasInterface(content) && hasTryCatch(content)
  const hasTypeSafe = hasReadonly(content) && hasOptional(content)
  const hasTransparent = hasExport(content) && hasInterface(content)
  const hasDurable = hasEnum(content) && hasTypeAlias(content)
  const hasErrorHandled = hasTryCatch(content) && hasStrictEq(content)

  score += hasRobust ? 5 : 0
  score += didTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasErrorHandled ? 5 : 0

  const hardness = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const bareCrashCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = bareCrashCount === 0
  const hasNoObfuscated = countMatches(/\beval\b/, content) === 0
  const hasNoFragile = !has(/\bdebugger\b/, content)
  const hasNoBareCrash = hasNoFragile
  const hasHighHardness = hardness >= 70

  let grade: HardnessGrade
  if (hardness >= 85) grade = 'flawless-diamond'
  else if (hardness >= 70) grade = 'internally-flawless'
  else if (hardness >= 55) grade = 'very-very-slight'
  else if (hardness >= 40) grade = 'slightly-included'
  else if (hardness >= 25) grade = 'included'
  else grade = 'industrial-grade'

  return {
    hardness, grade, hasHighHardness, hasRobust, hasTested: didTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasTransparent, hasNoObfuscated, hasDurable, hasNoFragile,
    hasErrorHandled, hasNoBareCrash, untestedCount, bareCrashCount,
  }
}

/**
 * Measure cut precision (structural precision)
 * @example
 * const m = measureCutting(content)
 * console.log(m.cut) // 'ideal-cut'
 */
export function measureCutting(content: string): CuttingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasExact = hasStrictEq(content) && hasReturnType(content)
  const hasAccurate = hasInterface(content) && hasExport(content)
  const hasPrecise = hasReadonly(content) && hasOptional(content)
  const hasStructured = hasEnum(content) && hasTypeAlias(content)
  const hasWellOrganized = hasConst(content) && hasGenerics(content)
  const hasSharp = hasDocComments(content) && hasPrivate(content)

  score += hasExact ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasWellOrganized ? 5 : 0
  score += hasSharp ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const sloppyCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = sloppyCount === 0
  const hasNoChaotic = countMatches(/\beval\b/, content) === 0
  const hasNoScattered = !has(/\bdebugger\b/, content)
  const hasNoSloppy = hasNoScattered
  const hasHighPrecision = precision >= 70

  let cut: CutType
  if (precision >= 85) cut = 'ideal-cut'
  else if (precision >= 70) cut = 'excellent-cut'
  else if (precision >= 55) cut = 'very-good-cut'
  else if (precision >= 40) cut = 'good-cut'
  else if (precision >= 25) cut = 'fair-cut'
  else cut = 'poor-cut'

  return {
    precision, cut, hasHighPrecision, hasExact, hasAccurate, hasNoApproximate,
    hasPrecise, hasNoVague, hasStructured, hasNoChaotic, hasWellOrganized,
    hasNoScattered, hasSharp, hasNoSloppy, approximateCount, sloppyCount,
  }
}

/**
 * Measure fire dispersion (diverse case handling)
 * @example
 * const m = measureDispersing(content)
 * console.log(m.fire) // 'maximum-fire'
 */
export function measureDispersing(content: string): DispersingMeasure {
  let score = 0
  score += hasUnionType(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasTryCatch(content) ? 4 : 0
  score += hasThrow(content) ? 4 : 0

  const hasTypeHandling = hasUnionType(content) && hasOptional(content)
  const hasCaseCoverage = hasEnum(content) && hasTypeAlias(content)
  const hasPolymorphic = hasGenerics(content) && hasInterface(content)
  const hasGeneric = hasExport(content) && hasConst(content)
  const hasFlexible = hasStrictEq(content) && hasReturnType(content)
  const hasAdaptive = hasTryCatch(content) && hasThrow(content)

  score += hasTypeHandling ? 5 : 0
  score += hasCaseCoverage ? 5 : 0
  score += hasPolymorphic ? 5 : 0
  score += hasGeneric ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasAdaptive ? 5 : 0

  const dispersion = Math.min(score, 100)
  const singlePathCount = countMatches(/\bvar\b/, content)
  const hardcodedCount = countMatches(/\bany\b/, content)

  const hasNoSinglePath = singlePathCount === 0
  const hasNoMonomorphic = hardcodedCount === 0
  const hasNoHardcoded = countMatches(/\beval\b/, content) === 0
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasHighDispersion = dispersion >= 70

  let fire: FireType
  if (dispersion >= 85) fire = 'maximum-fire'
  else if (dispersion >= 70) fire = 'excellent-dispersion'
  else if (dispersion >= 55) fire = 'proper-spectrum'
  else if (dispersion >= 40) fire = 'limited-color'
  else if (dispersion >= 25) fire = 'dull-stone'
  else fire = 'no-fire'

  return {
    dispersion, fire, hasHighDispersion, hasTypeHandling, hasCaseCoverage,
    hasNoSinglePath, hasPolymorphic, hasNoMonomorphic, hasGeneric, hasNoHardcoded,
    hasFlexible, hasNoRigid, hasAdaptive, singlePathCount, hardcodedCount,
  }
}

/**
 * Measure brilliance quality (readability)
 * @example
 * const m = measureShining(content)
 * console.log(m.shine) // 'dazzling-brilliance'
 */
export function measureShining(content: string): ShiningMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasReadable = hasExport(content) && hasInterface(content)
  const hasSelfDocumenting = hasReturnType(content) && hasDocComments(content)
  const hasClear = hasDocComments(content) && hasNamedExport(content)
  const hasElegant = hasEnum(content) && hasTypeAlias(content)
  const hasWellNamed = hasAsync(content) && hasConst(content)
  const hasBeautiful = hasOptional(content) && hasReadonly(content)

  score += hasReadable ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasBeautiful ? 5 : 0

  const brilliance = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const obfuscatedCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoClunky = countMatches(/\beval\b/, content) === 0
  const hasNoMisnamed = !has(/\bdebugger\b/, content)
  const hasHighBrilliance = brilliance >= 70

  let shine: ShineType
  if (brilliance >= 85) shine = 'dazzling-brilliance'
  else if (brilliance >= 70) shine = 'bright-shine'
  else if (brilliance >= 55) shine = 'proper-glow'
  else if (brilliance >= 40) shine = 'dim-luster'
  else if (brilliance >= 25) shine = 'dull-surface'
  else shine = 'no-brilliance'

  return {
    brilliance, shine, hasHighBrilliance, hasReadable, hasSelfDocumenting,
    hasNoCryptic, hasClear, hasNoObfuscated, hasElegant, hasNoClunky,
    hasWellNamed, hasNoMisnamed, hasBeautiful, crypticCount, obfuscatedCount,
  }
}

/**
 * Measure carat substance (value/weight)
 * @example
 * const m = measureWeighing(content)
 * console.log(m.carat) // 'substantial-gem'
 */
export function measureWeighing(content: string): WeighingMeasure {
  let score = 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasInterface(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasTypeAlias(content) ? 4 : 0

  const hasEssential = hasConst(content) && hasStrictEq(content)
  const hasHighValue = hasReturnType(content) && hasExport(content)
  const hasMeaningful = hasAsync(content) && hasMapFunction(content)
  const hasImpactful = hasReadonly(content) && hasGenerics(content)
  const hasValuable = hasEnum(content) && hasInterface(content)
  const hasSubstantive = hasOptional(content) && hasTypeAlias(content)

  score += hasEssential ? 5 : 0
  score += hasHighValue ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasImpactful ? 5 : 0
  score += hasValuable ? 5 : 0
  score += hasSubstantive ? 5 : 0

  const substance = Math.min(score, 100)
  const fillerCount = countMatches(/\bvar\b/, content)
  const deadCodeCount = countMatches(/\beval\b/, content)

  const hasNoFiller = fillerCount === 0
  const hasNoBoilerplate = deadCodeCount === 0
  const hasNoDeadCode = countMatches(/\bany\b/, content) === 0
  const hasNoRedundant = !has(/\bdebugger\b/, content)
  const hasHighSubstance = substance >= 70

  let carat: CaratType
  if (substance >= 85) carat = 'substantial-gem'
  else if (substance >= 70) carat = 'proper-weight'
  else if (substance >= 55) carat = 'decent-carat'
  else if (substance >= 40) carat = 'light-weight'
  else if (substance >= 25) carat = 'chip'
  else carat = 'no-substance'

  return {
    substance, carat, hasHighSubstance, hasEssential, hasHighValue, hasNoFiller,
    hasMeaningful, hasNoBoilerplate, hasImpactful, hasNoDeadCode, hasValuable,
    hasNoRedundant, hasSubstantive, fillerCount, deadCodeCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify facet condition
 * @example
 * classifyFacetCondition(90) // 'flawless-diamond'
 */
export function classifyFacetCondition(score: number): FacetCondition {
  if (score >= 85) return 'flawless-diamond'
  if (score >= 70) return 'premium-gem'
  if (score >= 55) return 'proper-diamond'
  if (score >= 40) return 'rough-gem'
  if (score >= 25) return 'industrial-stone'
  return 'carbon'
}

/**
 * Classify mine type
 * @example
 * classifyMineType(facets) // 'kimberley-mine'
 */
export function classifyMineType(facets: DiamondFacet[]): MineType {
  if (facets.length === 0) return 'no-mine'
  const avgQs = Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length)
  const masterpieceRatio = facets.filter(f => f.condition === 'flawless-diamond').length / facets.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'kimberley-mine'
  if (avgQs >= 60) return 'premium-shaft'
  if (avgQs >= 45) return 'proper-tunnel'
  if (avgQs >= 30) return 'small-excavation'
  if (avgQs >= 15) return 'surface-scraping'
  return 'no-mine'
}

/**
 * Classify mine condition
 * @example
 * classifyMineCondition(80) // 'diamond-empire'
 */
export function classifyMineCondition(avgQs: number): MineCondition {
  if (avgQs >= 75) return 'diamond-empire'
  if (avgQs >= 60) return 'rich-mine'
  if (avgQs >= 45) return 'decent-shaft'
  if (avgQs >= 30) return 'played-out'
  if (avgQs >= 15) return 'abandoned'
  return 'void'
}

/**
 * Classify jeweler grade
 * @example
 * classifyJewelerGrade(85) // 'master-gemologist'
 */
export function classifyJewelerGrade(avgClarity: number): JewelerGrade {
  if (avgClarity >= 80) return 'master-gemologist'
  if (avgClarity >= 65) return 'expert-jeweler'
  if (avgClarity >= 50) return 'skilled-cutter'
  if (avgClarity >= 35) return 'apprentice'
  if (avgClarity >= 20) return 'novice'
  return 'rock-smasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(facets, mines, horizon, stats)
 */
export function generateRecommendations(
  facets: DiamondFacet[],
  mines: DiamondMine[],
  horizon: DiamondHorizon,
  stats: DiamondHorizonStats,
): string[] {
  const recs: string[] = []
  if (stats.avgHardnessClarity < 50) {
    recs.push('Increase hardness clarity with strict equality, type-safe patterns, and robust error handling')
  }
  if (stats.avgCutPrecision < 50) {
    recs.push('Improve cut precision with exact types, precise readonly properties, and well-organized generics')
  }
  if (stats.avgFireDispersion < 50) {
    recs.push('Enhance fire dispersion with union types, optional parameters, and polymorphic generic patterns')
  }
  if (stats.avgBrillianceQuality < 50) {
    recs.push('Boost brilliance quality with documented interfaces, clear named exports, and elegant type aliases')
  }
  if (stats.avgCaratSubstance < 50) {
    recs.push('Add carat substance with impactful const patterns, high-value async flows, and meaningful exports')
  }
  if (stats.carbonCount > 0) {
    recs.push(`${stats.carbonCount} file(s) are carbon — they need to be transformed under extreme pressure into diamonds`)
  }
  if (horizon.overallClarity < 40) {
    recs.push('Overall clarity is dangerously low — focus on hardness clarity and cut precision first')
  }
  const allWeak = mines.every(m => m.mineType === 'no-mine' || m.mineType === 'surface-scraping')
  if (allWeak && mines.length > 0) {
    recs.push('All diamond mines are depleted — consider a major refactoring of the entire codebase')
  }
  const carbonFiles = facets.filter(f => f.condition === 'carbon').map(f => f.file)
  if (carbonFiles.length > 0 && carbonFiles.length <= 3) {
    recs.push(`Transform these carbon files into diamonds: ${carbonFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The diamond horizon gleams with flawless perfection! Every facet radiates hardness, precision, fire, brilliance, and substance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as diamond facet
 * @example
 * const facet = analyzeDiamondFacet(content, 'index.ts')
 * console.log(facet.condition) // 'flawless-diamond'
 */
export function analyzeDiamondFacet(content: string, filePath: string): DiamondFacet {
  const enduring = measureEnduring(content)
  const cutting = measureCutting(content)
  const dispersing = measureDispersing(content)
  const shining = measureShining(content)
  const weighing = measureWeighing(content)

  const qualityScore = Math.round(
    enduring.hardness * 0.2 +
    cutting.precision * 0.2 +
    dispersing.dispersion * 0.2 +
    shining.brilliance * 0.2 +
    weighing.substance * 0.2,
  )

  return {
    file: filePath,
    hardnessClarity: enduring.hardness,
    cutPrecision: cutting.precision,
    fireDispersion: dispersing.dispersion,
    brillianceQuality: shining.brilliance,
    caratSubstance: weighing.substance,
    enduring, cutting, dispersing, shining, weighing,
    condition: classifyFacetCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as diamond mine
 * @example
 * const mine = analyzeDiamondMine(facets, 'src')
 * console.log(mine.mineType) // 'kimberley-mine'
 */
export function analyzeDiamondMine(facets: DiamondFacet[], dirPath: string): DiamondMine {
  if (facets.length === 0) {
    return {
      directory: dirPath, facets: [], avgHardness: 0, avgPrecision: 0,
      avgBrilliance: 0, flawlessDiamondCount: 0, carbonCount: 0,
      mineType: 'no-mine', condition: 'void',
    }
  }

  const avgHardness = Math.round(facets.reduce((s, f) => s + f.hardnessClarity, 0) / facets.length)
  const avgPrecision = Math.round(facets.reduce((s, f) => s + f.cutPrecision, 0) / facets.length)
  const avgBrilliance = Math.round(facets.reduce((s, f) => s + f.brillianceQuality, 0) / facets.length)
  const flawlessDiamondCount = facets.filter(f => f.condition === 'flawless-diamond').length
  const carbonCount = facets.filter(f => f.condition === 'carbon').length
  const avgQs = Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length)

  return {
    directory: dirPath, facets, avgHardness, avgPrecision, avgBrilliance,
    flawlessDiamondCount, carbonCount,
    mineType: classifyMineType(facets),
    condition: classifyMineCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete diamond horizon result
 * @example
 * const result = await buildDiamondHorizonResult(files, contents)
 * console.log(result.stats.jewelerGrade) // 'master-gemologist'
 */
export async function buildDiamondHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<DiamondHorizonResult> {
  const facets = files.map((file, i) => analyzeDiamondFacet(contents[i] ?? '', file))

  const dirMap = new Map<string, DiamondFacet[]>()
  for (const facet of facets) {
    const dir = path.dirname(facet.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(facet) } else { dirMap.set(dir, [facet]) }
  }

  const mines = Array.from(dirMap.entries()).map(([dir, dirFacets]) =>
    analyzeDiamondMine(dirFacets, dir),
  )

  const avgHardness = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.hardnessClarity, 0) / facets.length) : 0
  const avgPrecision = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.cutPrecision, 0) / facets.length) : 0
  const avgBrilliance = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.brillianceQuality, 0) / facets.length) : 0

  const overallClarity = facets.length > 0
    ? Math.round((avgHardness + avgPrecision + avgBrilliance) / 3) : 0
  const isFlawless = avgHardness >= 60

  const horizon: DiamondHorizon = { avgHardness, avgPrecision, avgBrilliance, isFlawless, overallClarity }

  const celebration: DiamondCelebration = {
    milestone: 520,
    name: 'diamond-horizon',
    message: 'Command #520 \u2014 The Diamond Horizon. 520 commands, each one a facet in the diamond of code quality. Harder than anything, clearer than everything, stretching to the horizon.',
    previousMilestones: [420, 430, 440, 450, 460, 470, 480, 490, 500, 510],
    totalTests: 94000,
  }

  const avgFireDispersion = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.fireDispersion, 0) / facets.length) : 0
  const avgCaratSubstance = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.caratSubstance, 0) / facets.length) : 0

  const bestFacet = facets.length > 0
    ? facets.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const hardest = facets.length > 0
    ? facets.reduce((best, f) => f.hardnessClarity > best.hardnessClarity ? f : best).file : ''
  const bestCut = facets.length > 0
    ? facets.reduce((best, f) => f.cutPrecision > best.cutPrecision ? f : best).file : ''
  const mostFire = facets.length > 0
    ? facets.reduce((best, f) => f.fireDispersion > best.fireDispersion ? f : best).file : ''
  const mostBrilliant = facets.length > 0
    ? facets.reduce((best, f) => f.brillianceQuality > best.brillianceQuality ? f : best).file : ''

  const stats: DiamondHorizonStats = {
    totalFiles: facets.length,
    totalMines: mines.length,
    avgHardnessClarity: avgHardness,
    avgCutPrecision: avgPrecision,
    avgFireDispersion,
    avgBrillianceQuality: avgBrilliance,
    avgCaratSubstance,
    flawlessDiamondCount: facets.filter(f => f.condition === 'flawless-diamond').length,
    premiumGemCount: facets.filter(f => f.condition === 'premium-gem').length,
    properDiamondCount: facets.filter(f => f.condition === 'proper-diamond').length,
    roughGemCount: facets.filter(f => f.condition === 'rough-gem').length,
    industrialStoneCount: facets.filter(f => f.condition === 'industrial-stone').length,
    carbonCount: facets.filter(f => f.condition === 'carbon').length,
    hasHighHardnessCount: facets.filter(f => f.enduring.hasHighHardness).length,
    hasHighPrecisionCount: facets.filter(f => f.cutting.hasHighPrecision).length,
    hasHighDispersionCount: facets.filter(f => f.dispersing.hasHighDispersion).length,
    hasHighBrillianceCount: facets.filter(f => f.shining.hasHighBrilliance).length,
    hasHighSubstanceCount: facets.filter(f => f.weighing.hasHighSubstance).length,
    overallClarity,
    jewelerGrade: classifyJewelerGrade(overallClarity),
    bestFacet, hardest, bestCut, mostFire, mostBrilliant,
  }

  const recommendations = generateRecommendations(facets, mines, horizon, stats)

  return { facets, mines, horizon, celebration, stats, recommendations }
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
