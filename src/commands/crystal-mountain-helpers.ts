// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Lattice = 'perfect-crystal' | 'well-formed' | 'proper-lattice' | 'flawed-crystal' | 'amorphous' | 'no-structure'
export type Altitude = 'summit-view' | 'high-ridge' | 'proper-peak' | 'base-camp' | 'valley-floor' | 'no-altitude'
export type Cut = 'ideal-facet' | 'excellent-cut' | 'proper-face' | 'rough-face' | 'uncut-stone' | 'no-facet'
export type Frost = 'permafrost-proof' | 'winter-hardy' | 'proper-coating' | 'frost-sensitive' | 'frozen-solid' | 'no-resilience'
export type Summit = 'panoramic-view' | 'clear-vista' | 'proper-overlook' | 'clouded-peak' | 'foggy-summit' | 'no-view'
export type PeakCondition = 'crystal-pinnacle' | 'gem-peak' | 'proper-summit' | 'rocky-ridge' | 'gravel-slope' | 'dust'
export type RangeType = 'himalayas' | 'alps' | 'proper-range' | 'foothills' | 'mound' | 'no-range'
export type RangeCondition = 'crystal-kingdom' | 'gem-mountains' | 'proper-range' | 'rocky-hills' | 'eroded-peaks' | 'void'
export type AlpinistGrade = 'mountain-master' | 'expert-climber' | 'skilled-alpinist' | 'apprentice' | 'novice' | 'flatlander'

export interface StructuringMeasure {
  structure: number
  lattice: Lattice
  hasHighStructure: boolean
  hasOrganized: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasOrdered: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface AscendingMeasure {
  clarity: number
  altitude: Altitude
  hasHighClarity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasLuminous: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface FacetingMeasure {
  precision: number
  cut: Cut
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  approximateCount: number
  sloppyCount: number
}

export interface EnduringMeasure {
  resilience: number
  frost: Frost
  hasHighResilience: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface ElevatingMeasure {
  wisdom: number
  summit: Summit
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellArchitected: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasVisionary: boolean
  hasNoTunnelVision: boolean
  hasStrategic: boolean
  adHocCount: number
  hackyCount: number
}

export interface CrystalPeak {
  file: string
  crystallineStructure: number
  peakClarity: number
  facetPrecision: number
  frostResilience: number
  summitWisdom: number
  structuring: StructuringMeasure
  ascending: AscendingMeasure
  faceting: FacetingMeasure
  enduring: EnduringMeasure
  elevating: ElevatingMeasure
  condition: PeakCondition
  qualityScore: number
}

export interface CrystalRange {
  directory: string
  peaks: CrystalPeak[]
  avgStructure: number
  avgClarity: number
  avgWisdom: number
  crystalPinnacleCount: number
  dustCount: number
  rangeType: RangeType
  condition: RangeCondition
}

export interface CrystalMassif {
  avgStructure: number
  avgClarity: number
  avgWisdom: number
  isCrystalline: boolean
  overallAltitude: number
}

export interface CrystalMountainStats {
  totalFiles: number
  totalRanges: number
  avgCrystallineStructure: number
  avgPeakClarity: number
  avgFacetPrecision: number
  avgFrostResilience: number
  avgSummitWisdom: number
  crystalPinnacleCount: number
  gemPeakCount: number
  properSummitCount: number
  rockyRidgeCount: number
  gravelSlopeCount: number
  dustCount: number
  hasHighStructureCount: number
  hasHighClarityCount: number
  hasHighPrecisionCount: number
  hasHighResilienceCount: number
  hasHighWisdomCount: number
  overallAltitude: number
  alpinistGrade: AlpinistGrade
  bestPeak: string
  mostStructured: string
  clearest: string
  mostPrecise: string
  wisest: string
}

export interface CrystalMountainResult {
  peaks: CrystalPeak[]
  ranges: CrystalRange[]
  massif: CrystalMassif
  stats: CrystalMountainStats
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
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)

// ─── Grade Helpers ─────────────────────────────────────────────────

function classifyLattice(structure: number): Lattice {
  if (structure >= 85) return 'perfect-crystal'
  if (structure >= 70) return 'well-formed'
  if (structure >= 55) return 'proper-lattice'
  if (structure >= 40) return 'flawed-crystal'
  if (structure >= 25) return 'amorphous'
  return 'no-structure'
}

function classifyAltitude(clarity: number): Altitude {
  if (clarity >= 85) return 'summit-view'
  if (clarity >= 70) return 'high-ridge'
  if (clarity >= 55) return 'proper-peak'
  if (clarity >= 40) return 'base-camp'
  if (clarity >= 25) return 'valley-floor'
  return 'no-altitude'
}

function classifyCut(precision: number): Cut {
  if (precision >= 85) return 'ideal-facet'
  if (precision >= 70) return 'excellent-cut'
  if (precision >= 55) return 'proper-face'
  if (precision >= 40) return 'rough-face'
  if (precision >= 25) return 'uncut-stone'
  return 'no-facet'
}

function classifyFrost(resilience: number): Frost {
  if (resilience >= 85) return 'permafrost-proof'
  if (resilience >= 70) return 'winter-hardy'
  if (resilience >= 55) return 'proper-coating'
  if (resilience >= 40) return 'frost-sensitive'
  if (resilience >= 25) return 'frozen-solid'
  return 'no-resilience'
}

function classifySummit(wisdom: number): Summit {
  if (wisdom >= 85) return 'panoramic-view'
  if (wisdom >= 70) return 'clear-vista'
  if (wisdom >= 55) return 'proper-overlook'
  if (wisdom >= 40) return 'clouded-peak'
  if (wisdom >= 25) return 'foggy-summit'
  return 'no-view'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure crystalline structure (organized atomic structure)
 * @example
 * const m = measureStructuring(content)
 * console.log(m.lattice) // 'perfect-crystal'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasOrganized = hasInterface(content) && hasReturnType(content)
  const hasWellStructured = hasReadonly(content) && hasTypeAlias(content)
  const hasLayered = hasEnum(content) && hasConst(content)
  const hasModular = hasExport(content) && hasOptional(content)
  const hasSystematic = hasGenerics(content) && hasDocComments(content)
  const hasOrdered = hasPrivate(content) && hasAsync(content)

  score += hasOrganized ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasSystematic ? 5 : 0
  score += hasOrdered ? 5 : 0

  const structure = Math.min(score, 100)
  const chaoticCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoFlat = countMatches(/\beval\b/, content) === 0
  const hasNoHaphazard = !has(/\bdebugger\b/, content)
  const hasHighStructure = structure >= 70

  return {
    structure, lattice: classifyLattice(structure), hasHighStructure, hasOrganized,
    hasWellStructured, hasNoChaotic, hasLayered, hasNoFlat, hasModular, hasNoMonolithic,
    hasSystematic, hasNoHaphazard, hasOrdered, chaoticCount, monolithicCount,
  }
}

/**
 * Measure peak clarity (altitude of understanding)
 * @example
 * const m = measureAscending(content)
 * console.log(m.altitude) // 'summit-view'
 */
export function measureAscending(content: string): AscendingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasReadable = hasExport(content) && hasInterface(content)
  const hasTransparent = hasDocComments(content) && hasReturnType(content)
  const hasClear = hasConst(content) && hasNamedExport(content)
  const hasUnderstandable = hasTypeAlias(content) && hasReadonly(content)
  const hasVisible = hasGenerics(content) && hasOptional(content)
  const hasLuminous = hasPrivate(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasLuminous ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bany\b/, content)
  const crypticCount = countMatches(/\bvar\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoArcane = countMatches(/\beval\b/, content) === 0
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  return {
    clarity, altitude: classifyAltitude(clarity), hasHighClarity, hasReadable, hasTransparent,
    hasNoObfuscated, hasClear, hasNoCryptic, hasUnderstandable, hasNoArcane, hasVisible,
    hasNoHidden, hasLuminous, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure facet precision (multi-faced correctness)
 * @example
 * const m = measureFaceting(content)
 * console.log(m.cut) // 'ideal-facet'
 */
export function measureFaceting(content: string): FacetingMeasure {
  let score = 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasAsync(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasExact = hasReturnType(content) && hasReadonly(content)
  const hasAccurate = hasEnum(content) && hasInterface(content)
  const hasPrecise = hasConst(content) && hasTypeAlias(content)
  const hasCorrect = hasExport(content) && hasGenerics(content)
  const hasSharp = hasOptional(content) && hasPrivate(content)
  const hasDefined = hasAsync(content) && hasDocComments(content)

  score += hasExact ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bany\b/, content)
  const sloppyCount = countMatches(/\bvar\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = sloppyCount === 0
  const hasNoAlmostRight = countMatches(/\beval\b/, content) === 0
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  return {
    precision, cut: classifyCut(precision), hasHighPrecision, hasExact, hasAccurate,
    hasNoApproximate, hasPrecise, hasNoVague, hasCorrect, hasNoAlmostRight, hasSharp,
    hasNoSloppy, hasDefined, approximateCount, sloppyCount,
  }
}

/**
 * Measure frost resilience (harsh condition survival)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.frost) // 'permafrost-proof'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasTested = hasTryCatch(content) && hasInterface(content)
  const hasErrorHandled = hasOptional(content) && hasReadonly(content)
  const hasTypeSafe = hasThrow(content) && hasTypeAlias(content)
  const hasDefensive = hasEnum(content) && hasConst(content)
  const hasRobust = hasExport(content) && hasReturnType(content)
  const hasNoFragile = hasGenerics(content) && hasAsync(content)

  score += hasTested ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasDefensive ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasNoFragile ? 5 : 0

  const resilience = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const bareCrashCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoBareCrash = bareCrashCount === 0
  const hasNoUnsafe = countMatches(/\beval\b/, content) === 0
  const hasNoNaive = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  return {
    resilience, frost: classifyFrost(resilience), hasHighResilience, hasTested, hasNoUntested,
    hasErrorHandled, hasNoBareCrash, hasTypeSafe, hasNoUnsafe, hasDefensive, hasNoNaive,
    hasRobust, hasNoFragile, untestedCount, bareCrashCount,
  }
}

/**
 * Measure summit wisdom (elevated perspective)
 * @example
 * const m = measureElevating(content)
 * console.log(m.summit) // 'panoramic-view'
 */
export function measureElevating(content: string): ElevatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasDocumented = hasDocComments(content) && hasInterface(content)
  const hasWellArchitected = hasReturnType(content) && hasAsync(content)
  const hasPatterned = hasThrow(content) && hasExport(content)
  const hasPrincipled = hasConst(content) && hasTryCatch(content)
  const hasVisionary = hasEnum(content) && hasTypeAlias(content)
  const hasStrategic = hasGenerics(content) && hasReadonly(content)

  score += hasDocumented ? 5 : 0
  score += hasWellArchitected ? 5 : 0
  score += hasPatterned ? 5 : 0
  score += hasPrincipled ? 5 : 0
  score += hasVisionary ? 5 : 0
  score += hasStrategic ? 5 : 0

  const wisdom = Math.min(score, 100)
  const adHocCount = countMatches(/\bvar\b/, content)
  const hackyCount = countMatches(/\bany\b/, content)

  const hasNoAdHoc = adHocCount === 0
  const hasNoReinvented = hackyCount === 0
  const hasNoHacky = countMatches(/\beval\b/, content) === 0
  const hasNoTunnelVision = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  return {
    wisdom, summit: classifySummit(wisdom), hasHighWisdom, hasDocumented, hasWellArchitected,
    hasNoAdHoc, hasPatterned, hasNoReinvented, hasPrincipled, hasNoHacky, hasVisionary,
    hasNoTunnelVision, hasStrategic, adHocCount, hackyCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify peak condition
 * @example
 * classifyPeakCondition(90) // 'crystal-pinnacle'
 */
export function classifyPeakCondition(score: number): PeakCondition {
  if (score >= 85) return 'crystal-pinnacle'
  if (score >= 70) return 'gem-peak'
  if (score >= 55) return 'proper-summit'
  if (score >= 40) return 'rocky-ridge'
  if (score >= 25) return 'gravel-slope'
  return 'dust'
}

/**
 * Classify range type
 * @example
 * classifyRangeType(peaks) // 'himalayas'
 */
export function classifyRangeType(peaks: CrystalPeak[]): RangeType {
  if (peaks.length === 0) return 'no-range'
  const avgQs = Math.round(peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length)
  const pinnacleRatio = peaks.filter(p => p.condition === 'crystal-pinnacle').length / peaks.length
  if (avgQs >= 75 && pinnacleRatio >= 0.5) return 'himalayas'
  if (avgQs >= 60) return 'alps'
  if (avgQs >= 45) return 'proper-range'
  if (avgQs >= 30) return 'foothills'
  if (avgQs >= 15) return 'mound'
  return 'no-range'
}

/**
 * Classify range condition
 * @example
 * classifyRangeCondition(80) // 'crystal-kingdom'
 */
export function classifyRangeCondition(avgQs: number): RangeCondition {
  if (avgQs >= 75) return 'crystal-kingdom'
  if (avgQs >= 60) return 'gem-mountains'
  if (avgQs >= 45) return 'proper-range'
  if (avgQs >= 30) return 'rocky-hills'
  if (avgQs >= 15) return 'eroded-peaks'
  return 'void'
}

/**
 * Classify alpinist grade
 * @example
 * classifyAlpinistGrade(85) // 'mountain-master'
 */
export function classifyAlpinistGrade(avgAltitude: number): AlpinistGrade {
  if (avgAltitude >= 80) return 'mountain-master'
  if (avgAltitude >= 65) return 'expert-climber'
  if (avgAltitude >= 50) return 'skilled-alpinist'
  if (avgAltitude >= 35) return 'apprentice'
  if (avgAltitude >= 20) return 'novice'
  return 'flatlander'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(peaks, ranges, massif, stats)
 */
export function generateRecommendations(
  peaks: CrystalPeak[],
  ranges: CrystalRange[],
  massif: CrystalMassif,
  stats: CrystalMountainStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCrystallineStructure < 50) {
    recs.push('Crystallize code structure with organized interfaces, layered enums, and modular export patterns')
  }
  if (stats.avgPeakClarity < 50) {
    recs.push('Ascend to clearer peaks with readable exports, transparent documentation, and clean type architecture')
  }
  if (stats.avgFacetPrecision < 50) {
    recs.push('Hone facet precision with exact return types, accurate enums, and precise const patterns')
  }
  if (stats.avgFrostResilience < 50) {
    recs.push('Build frost resilience with tested try-catch blocks, error-handled optional properties, and type-safe throw patterns')
  }
  if (stats.avgSummitWisdom < 50) {
    recs.push('Gain summit wisdom with documented interfaces, well-architected return types, and principled error handling')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} peak(s) are dust — they need crystalline pressure to form crystal peaks`)
  }
  if (massif.overallAltitude < 40) {
    recs.push('Overall altitude is dangerously low — focus on crystalline structure and summit wisdom first')
  }
  const allWeak = ranges.every(r => r.rangeType === 'no-range' || r.rangeType === 'mound')
  if (allWeak && ranges.length > 0) {
    recs.push('All ranges are mounds — consider a major refactoring of the entire codebase')
  }
  const dustFiles = peaks.filter(p => p.condition === 'dust').map(p => p.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Crystallize these dust peaks: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The crystal mountain gleams with crystalline perfection! Every peak radiates structure, clarity, and summit wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as crystal peak
 * @example
 * const peak = analyzeCrystalPeak(content, 'index.ts')
 * console.log(peak.condition) // 'crystal-pinnacle'
 */
export function analyzeCrystalPeak(content: string, filePath: string): CrystalPeak {
  const structuring = measureStructuring(content)
  const ascending = measureAscending(content)
  const faceting = measureFaceting(content)
  const enduring = measureEnduring(content)
  const elevating = measureElevating(content)

  const qualityScore = Math.round(
    structuring.structure * 0.2 +
    ascending.clarity * 0.2 +
    faceting.precision * 0.2 +
    enduring.resilience * 0.2 +
    elevating.wisdom * 0.2,
  )

  return {
    file: filePath,
    crystallineStructure: structuring.structure,
    peakClarity: ascending.clarity,
    facetPrecision: faceting.precision,
    frostResilience: enduring.resilience,
    summitWisdom: elevating.wisdom,
    structuring, ascending, faceting, enduring, elevating,
    condition: classifyPeakCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as crystal range
 * @example
 * const range = analyzeCrystalRange(peaks, 'src')
 * console.log(range.rangeType) // 'himalayas'
 */
export function analyzeCrystalRange(peaks: CrystalPeak[], dirPath: string): CrystalRange {
  if (peaks.length === 0) {
    return {
      directory: dirPath, peaks: [], avgStructure: 0, avgClarity: 0,
      avgWisdom: 0, crystalPinnacleCount: 0, dustCount: 0,
      rangeType: 'no-range', condition: 'void',
    }
  }

  const avgStructure = Math.round(peaks.reduce((s, p) => s + p.crystallineStructure, 0) / peaks.length)
  const avgClarity = Math.round(peaks.reduce((s, p) => s + p.peakClarity, 0) / peaks.length)
  const avgWisdom = Math.round(peaks.reduce((s, p) => s + p.summitWisdom, 0) / peaks.length)
  const crystalPinnacleCount = peaks.filter(p => p.condition === 'crystal-pinnacle').length
  const dustCount = peaks.filter(p => p.condition === 'dust').length
  const avgQs = Math.round(peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length)

  return {
    directory: dirPath, peaks, avgStructure, avgClarity, avgWisdom,
    crystalPinnacleCount, dustCount,
    rangeType: classifyRangeType(peaks),
    condition: classifyRangeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete crystal mountain result
 * @example
 * const result = await buildCrystalMountainResult(files, contents)
 * console.log(result.stats.alpinistGrade) // 'mountain-master'
 */
export async function buildCrystalMountainResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrystalMountainResult> {
  const peaks = files.map((file, i) => analyzeCrystalPeak(contents[i] ?? '', file))

  const dirMap = new Map<string, CrystalPeak[]>()
  for (const peak of peaks) {
    const dir = path.dirname(peak.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(peak) } else { dirMap.set(dir, [peak]) }
  }

  const ranges = Array.from(dirMap.entries()).map(([dir, dirPeaks]) =>
    analyzeCrystalRange(dirPeaks, dir),
  )

  const avgStructure = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.crystallineStructure, 0) / peaks.length) : 0
  const avgClarity = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.peakClarity, 0) / peaks.length) : 0
  const avgWisdom = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.summitWisdom, 0) / peaks.length) : 0

  const overallAltitude = peaks.length > 0
    ? Math.round((avgStructure + avgClarity + avgWisdom) / 3) : 0
  const isCrystalline = avgStructure >= 60

  const massif: CrystalMassif = { avgStructure, avgClarity, avgWisdom, isCrystalline, overallAltitude }

  const avgFacetPrecision = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.facetPrecision, 0) / peaks.length) : 0
  const avgFrostResilience = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.frostResilience, 0) / peaks.length) : 0
  const avgSummitWisdom = avgWisdom

  const bestPeak = peaks.length > 0
    ? peaks.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const mostStructured = peaks.length > 0
    ? peaks.reduce((best, p) => p.crystallineStructure > best.crystallineStructure ? p : best).file : ''
  const clearest = peaks.length > 0
    ? peaks.reduce((best, p) => p.peakClarity > best.peakClarity ? p : best).file : ''
  const mostPrecise = peaks.length > 0
    ? peaks.reduce((best, p) => p.facetPrecision > best.facetPrecision ? p : best).file : ''
  const wisest = peaks.length > 0
    ? peaks.reduce((best, p) => p.summitWisdom > best.summitWisdom ? p : best).file : ''

  const stats: CrystalMountainStats = {
    totalFiles: peaks.length,
    totalRanges: ranges.length,
    avgCrystallineStructure: avgStructure,
    avgPeakClarity: avgClarity,
    avgFacetPrecision,
    avgFrostResilience,
    avgSummitWisdom,
    crystalPinnacleCount: peaks.filter(p => p.condition === 'crystal-pinnacle').length,
    gemPeakCount: peaks.filter(p => p.condition === 'gem-peak').length,
    properSummitCount: peaks.filter(p => p.condition === 'proper-summit').length,
    rockyRidgeCount: peaks.filter(p => p.condition === 'rocky-ridge').length,
    gravelSlopeCount: peaks.filter(p => p.condition === 'gravel-slope').length,
    dustCount: peaks.filter(p => p.condition === 'dust').length,
    hasHighStructureCount: peaks.filter(p => p.structuring.hasHighStructure).length,
    hasHighClarityCount: peaks.filter(p => p.ascending.hasHighClarity).length,
    hasHighPrecisionCount: peaks.filter(p => p.faceting.hasHighPrecision).length,
    hasHighResilienceCount: peaks.filter(p => p.enduring.hasHighResilience).length,
    hasHighWisdomCount: peaks.filter(p => p.elevating.hasHighWisdom).length,
    overallAltitude,
    alpinistGrade: classifyAlpinistGrade(overallAltitude),
    bestPeak, mostStructured, clearest, mostPrecise, wisest,
  }

  const recommendations = generateRecommendations(peaks, ranges, massif, stats)

  return { peaks, ranges, massif, stats, recommendations }
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
