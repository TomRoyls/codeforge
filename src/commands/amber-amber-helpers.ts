// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Preservation grade */
export type PreservationGrade =
  | 'perfect-preservation'
  | 'well-preserved'
  | 'proper-state'
  | 'degrading'
  | 'decaying'
  | 'fossilized'

/** Inclusion grade */
export type InclusionGrade =
  | 'perfect-trap'
  | 'well-captured'
  | 'proper-encapsulation'
  | 'partially-exposed'
  | 'escaped'
  | 'no-trap'

/** Clarity grade */
export type ClarityGrade =
  | 'crystal-clear'
  | 'golden-clear'
  | 'proper-transparency'
  | 'cloudy'
  | 'opaque'
  | 'dark-amber'

/** Age grade */
export type AgeGrade =
  | 'ancient-wisdom'
  | 'well-aged'
  | 'proper-maturity'
  | 'immature'
  | 'green'
  | 'fresh-sap'

/** Fracture grade */
export type FractureGrade =
  | 'unbreakable-amber'
  | 'tough-resin'
  | 'proper-hardness'
  | 'brittle-resin'
  | 'cracking'
  | 'shattered'

/** Resin condition */
export type ResinCondition =
  | 'museum-piece'
  | 'fine-amber'
  | 'proper-resin'
  | 'cloudy-amber'
  | 'cracked-resin'
  | 'dust'

/** Collection type */
export type CollectionType =
  | 'museum-collection'
  | 'jewelry-box'
  | 'proper-display'
  | 'drawer-find'
  | 'beach-pebble'
  | 'no-amber'

/** Collection condition */
export type CollectionCondition =
  | 'pristine-collection'
  | 'well-curated'
  | 'decent-display'
  | 'dusty-shelf'
  | 'forgotten-box'
  | 'empty'

/** Curator grade */
export type CuratorGrade =
  | 'master-curator'
  | 'amber-expert'
  | 'skilled-collector'
  | 'apprentice'
  | 'novice'
  | 'fossil-fuel'

/** Preserving measurement */
export interface PreservingMeasure {
  quality: number
  grade: PreservationGrade
  hasHighQuality: boolean
  hasLasting: boolean
  hasEnduring: boolean
  hasNoFleeting: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasPermanent: boolean
  hasNoTemporary: boolean
  hasConserved: boolean
  hasNoEroding: boolean
  hasMaintained: boolean
  fleetingCount: number
  volatileCount: number
}

/** Encapsulating measurement */
export interface EncapsulatingMeasure {
  quality: number
  inclusion: InclusionGrade
  hasHighQuality: boolean
  hasEncapsulated: boolean
  hasContained: boolean
  hasNoLeaking: boolean
  hasEnclosed: boolean
  hasNoExposed: boolean
  hasWrapped: boolean
  hasNoUnwrapped: boolean
  hasSealed: boolean
  hasNoOpen: boolean
  hasIsolated: boolean
  leakingCount: number
  exposedCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  transparency: number
  clarity: ClarityGrade
  hasHighTransparency: boolean
  hasTransparent: boolean
  hasClear: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasRevealing: boolean
  hasNoConcealing: boolean
  hasOpen: boolean
  hasNoSecret: boolean
  hasLucid: boolean
  opaqueCount: number
  hiddenCount: number
}

/** Maturing measurement */
export interface MaturingMeasure {
  wisdom: number
  age: AgeGrade
  hasHighWisdom: boolean
  hasMature: boolean
  hasExperienced: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoUntried: boolean
  hasTested: boolean
  hasNoExperimental: boolean
  hasReliable: boolean
  hasNoUnstable: boolean
  hasBattleHardened: boolean
  naiveCount: number
  untriedCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resistance: number
  fracture: FractureGrade
  hasHighResistance: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasHard: boolean
  hasNoSoft: boolean
  hasSolid: boolean
  fragileCount: number
  brittleCount: number
}

/** Single file analysis */
export interface AmberResin {
  file: string
  preservationQuality: number
  inclusionQuality: number
  transparency: number
  ageWisdom: number
  fractureResistance: number
  preserving: PreservingMeasure
  encapsulating: EncapsulatingMeasure
  clarifying: ClarifyingMeasure
  maturing: MaturingMeasure
  resisting: ResistingMeasure
  condition: ResinCondition
  qualityScore: number
}

/** Directory-level collection */
export interface AmberCollection {
  directory: string
  resins: AmberResin[]
  avgPreservation: number
  avgTransparency: number
  avgResistance: number
  museumPieceCount: number
  dustCount: number
  collectionType: CollectionType
  condition: CollectionCondition
}

/** Museum summary */
export interface MuseumSummary {
  avgPreservation: number
  avgTransparency: number
  avgResistance: number
  isPreserved: boolean
  overallPreservation: number
}

/** Full stats */
export interface AmberAmberStats {
  totalFiles: number
  totalCollections: number
  avgPreservationQuality: number
  avgInclusionQuality: number
  avgTransparency: number
  avgAgeWisdom: number
  avgFractureResistance: number
  museumPieceCount: number
  fineAmberCount: number
  properResinCount: number
  cloudyAmberCount: number
  crackedResinCount: number
  dustCount: number
  hasHighQualityCount: number
  hasHighEncapsulationCount: number
  hasHighTransparencyCount: number
  hasHighWisdomCount: number
  hasHighResistanceCount: number
  overallPreservation: number
  curatorGrade: CuratorGrade
  bestResin: string
  bestPreserved: string
  bestEncapsulated: string
  mostTransparent: string
  wisest: string
}

/** Full result */
export interface AmberAmberResult {
  resins: AmberResin[]
  collections: AmberCollection[]
  museum: MuseumSummary
  stats: AmberAmberStats
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
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure preservation quality (code longevity)
 * @example
 * const m = measurePreserving(content)
 * console.log(m.grade) // 'perfect-preservation'
 */
export function measurePreserving(content: string): PreservingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasLasting = hasReturnType(content) && hasStrictEq(content)
  const hasEnduring = hasDocComments(content) && hasInterface(content)
  const hasStable = hasGenerics(content) && hasTypeAlias(content)
  const hasPermanent = hasConst(content) && hasExport(content)
  const hasConserved = hasImport(content) && hasReturnType(content)
  const hasMaintained = hasStrictEq(content) && hasClass(content)

  score += hasLasting ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasPermanent ? 5 : 0
  score += hasConserved ? 5 : 0
  score += hasMaintained ? 5 : 0

  const quality = Math.min(score, 100)
  const fleetingCount = count(/\bvar\b/, content)
  const volatileCount = count(/\bany\b/, content)

  const hasNoFleeting = fleetingCount === 0
  const hasNoVolatile = volatileCount === 0
  const hasNoTemporary = !has(/\beval\b/, content)
  const hasNoEroding = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: PreservationGrade
  if (quality >= 85) grade = 'perfect-preservation'
  else if (quality >= 70) grade = 'well-preserved'
  else if (quality >= 55) grade = 'proper-state'
  else if (quality >= 40) grade = 'degrading'
  else if (quality >= 25) grade = 'decaying'
  else grade = 'fossilized'

  return {
    quality, grade, hasHighQuality, hasLasting, hasEnduring, hasNoFleeting,
    hasStable, hasNoVolatile, hasPermanent, hasNoTemporary, hasConserved,
    hasNoEroding, hasMaintained, fleetingCount, volatileCount,
  }
}

/**
 * Measure inclusion quality (code encapsulation)
 * @example
 * const m = measureEncapsulating(content)
 * console.log(m.inclusion) // 'perfect-trap'
 */
export function measureEncapsulating(content: string): EncapsulatingMeasure {
  let score = 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasEncapsulated = hasReadonly(content) && hasPrivate(content)
  const hasContained = hasReturnType(content) && hasStrictEq(content)
  const hasEnclosed = hasDocComments(content) && hasInterface(content)
  const hasWrapped = hasGenerics(content) && hasExport(content)
  const hasSealed = hasConst(content) && hasReturnType(content)
  const hasIsolated = hasStrictEq(content) && hasClass(content)

  score += hasEncapsulated ? 5 : 0
  score += hasContained ? 5 : 0
  score += hasEnclosed ? 5 : 0
  score += hasWrapped ? 5 : 0
  score += hasSealed ? 5 : 0
  score += hasIsolated ? 5 : 0

  const quality = Math.min(score, 100)
  const leakingCount = count(/\bvar\b/, content)
  const exposedCount = count(/\bany\b/, content)

  const hasNoLeaking = leakingCount === 0
  const hasNoExposed = exposedCount === 0
  const hasNoUnwrapped = !has(/\beval\b/, content)
  const hasNoOpen = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let inclusion: InclusionGrade
  if (quality >= 85) inclusion = 'perfect-trap'
  else if (quality >= 70) inclusion = 'well-captured'
  else if (quality >= 55) inclusion = 'proper-encapsulation'
  else if (quality >= 40) inclusion = 'partially-exposed'
  else if (quality >= 25) inclusion = 'escaped'
  else inclusion = 'no-trap'

  return {
    quality, inclusion, hasHighQuality, hasEncapsulated, hasContained, hasNoLeaking,
    hasEnclosed, hasNoExposed, hasWrapped, hasNoUnwrapped, hasSealed,
    hasNoOpen, hasIsolated, leakingCount, exposedCount,
  }
}

/**
 * Measure transparency (code clarity)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.clarity) // 'crystal-clear'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasTransparent = hasReturnType(content) && hasStrictEq(content)
  const hasClear = hasReadonly(content) && hasPrivate(content)
  const hasVisible = hasTypeAlias(content) && hasGenerics(content)
  const hasRevealing = hasDocComments(content) && hasInterface(content)
  const hasOpen = hasExport(content) && hasStrictEq(content)
  const hasLucid = hasClass(content) && hasReturnType(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasOpen ? 5 : 0
  score += hasLucid ? 5 : 0

  const transparency = Math.min(score, 100)
  const opaqueCount = count(/\bvar\b/, content)
  const hiddenCount = count(/\bany\b/, content)

  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoConcealing = !has(/\beval\b/, content)
  const hasNoSecret = !has(/\bdebugger\b/, content)
  const hasHighTransparency = transparency >= 70

  let clarity: ClarityGrade
  if (transparency >= 85) clarity = 'crystal-clear'
  else if (transparency >= 70) clarity = 'golden-clear'
  else if (transparency >= 55) clarity = 'proper-transparency'
  else if (transparency >= 40) clarity = 'cloudy'
  else if (transparency >= 25) clarity = 'opaque'
  else clarity = 'dark-amber'

  return {
    transparency, clarity, hasHighTransparency, hasTransparent, hasClear,
    hasNoOpaque, hasVisible, hasNoHidden, hasRevealing, hasNoConcealing,
    hasOpen, hasNoSecret, hasLucid, opaqueCount, hiddenCount,
  }
}

/**
 * Measure age wisdom (code maturity)
 * @example
 * const m = measureMaturing(content)
 * console.log(m.age) // 'ancient-wisdom'
 */
export function measureMaturing(content: string): MaturingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasMature = hasInterface(content) && hasClass(content)
  const hasExperienced = hasExport(content) && hasImport(content)
  const hasProven = hasGenerics(content) && hasTypeAlias(content)
  const hasTested = hasReadonly(content) && hasPrivate(content)
  const hasReliable = hasConst(content) && hasExport(content)
  const hasBattleHardened = hasNamedExport(content) && hasInterface(content)

  score += hasMature ? 5 : 0
  score += hasExperienced ? 5 : 0
  score += hasProven ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasBattleHardened ? 5 : 0

  const wisdom = Math.min(score, 100)
  const naiveCount = count(/\bvar\b/, content)
  const untriedCount = count(/\bany\b/, content)

  const hasNoNaive = naiveCount === 0
  const hasNoUntried = untriedCount === 0
  const hasNoExperimental = !has(/\beval\b/, content)
  const hasNoUnstable = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let age: AgeGrade
  if (wisdom >= 85) age = 'ancient-wisdom'
  else if (wisdom >= 70) age = 'well-aged'
  else if (wisdom >= 55) age = 'proper-maturity'
  else if (wisdom >= 40) age = 'immature'
  else if (wisdom >= 25) age = 'green'
  else age = 'fresh-sap'

  return {
    wisdom, age, hasHighWisdom, hasMature, hasExperienced, hasNoNaive,
    hasProven, hasNoUntried, hasTested, hasNoExperimental, hasReliable,
    hasNoUnstable, hasBattleHardened, naiveCount, untriedCount,
  }
}

/**
 * Measure fracture resistance (code robustness)
 * @example
 * const m = measureResisting(content)
 * console.log(m.fracture) // 'unbreakable-amber'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasRobust = hasClass(content) && hasInterface(content)
  const hasDurable = hasExport(content) && hasImport(content)
  const hasTough = hasGenerics(content) && hasTypeAlias(content)
  const hasResilient = hasPrivate(content) && hasReadonly(content)
  const hasHard = hasAsync(content) && hasReturnType(content)
  const hasSolid = hasClass(content) && hasGenerics(content)

  score += hasRobust ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasHard ? 5 : 0
  score += hasSolid ? 5 : 0

  const resistance = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBrittle = brittleCount === 0
  const hasNoBreakable = !has(/\beval\b/, content)
  const hasNoSoft = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let fracture: FractureGrade
  if (resistance >= 85) fracture = 'unbreakable-amber'
  else if (resistance >= 70) fracture = 'tough-resin'
  else if (resistance >= 55) fracture = 'proper-hardness'
  else if (resistance >= 40) fracture = 'brittle-resin'
  else if (resistance >= 25) fracture = 'cracking'
  else fracture = 'shattered'

  return {
    resistance, fracture, hasHighResistance, hasRobust, hasDurable, hasNoFragile,
    hasTough, hasNoBrittle, hasResilient, hasNoBreakable, hasHard,
    hasNoSoft, hasSolid, fragileCount, brittleCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify resin condition
 * @example
 * classifyResinCondition(90) // 'museum-piece'
 */
export function classifyResinCondition(score: number): ResinCondition {
  if (score >= 85) return 'museum-piece'
  if (score >= 70) return 'fine-amber'
  if (score >= 55) return 'proper-resin'
  if (score >= 40) return 'cloudy-amber'
  if (score >= 25) return 'cracked-resin'
  return 'dust'
}

/**
 * Classify collection type
 * @example
 * classifyCollectionType(resins) // 'museum-collection'
 */
export function classifyCollectionType(resins: AmberResin[]): CollectionType {
  if (resins.length === 0) return 'no-amber'
  const avgQs = Math.round(resins.reduce((s, r) => s + r.qualityScore, 0) / resins.length)
  const museumRatio = resins.filter(r => r.condition === 'museum-piece').length / resins.length
  if (avgQs >= 75 && museumRatio >= 0.5) return 'museum-collection'
  if (avgQs >= 60) return 'jewelry-box'
  if (avgQs >= 45) return 'proper-display'
  if (avgQs >= 30) return 'drawer-find'
  if (avgQs >= 15) return 'beach-pebble'
  return 'no-amber'
}

/**
 * Classify curator grade
 * @example
 * classifyCuratorGrade(85) // 'master-curator'
 */
export function classifyCuratorGrade(avgPreservation: number): CuratorGrade {
  if (avgPreservation >= 80) return 'master-curator'
  if (avgPreservation >= 65) return 'amber-expert'
  if (avgPreservation >= 50) return 'skilled-collector'
  if (avgPreservation >= 35) return 'apprentice'
  if (avgPreservation >= 20) return 'novice'
  return 'fossil-fuel'
}

/**
 * Classify collection condition
 * @example
 * classifyCollectionCondition(80) // 'pristine-collection'
 */
export function classifyCollectionCondition(avgQs: number): CollectionCondition {
  if (avgQs >= 75) return 'pristine-collection'
  if (avgQs >= 60) return 'well-curated'
  if (avgQs >= 45) return 'decent-display'
  if (avgQs >= 30) return 'dusty-shelf'
  if (avgQs >= 15) return 'forgotten-box'
  return 'empty'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(resins, collections, museum, stats)
 */
export function generateRecommendations(
  resins: AmberResin[],
  collections: AmberCollection[],
  museum: MuseumSummary,
  stats: AmberAmberStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPreservationQuality < 50) {
    recs.push('Improve preservation quality with return types, strict equality, and lasting type patterns')
  }
  if (stats.avgInclusionQuality < 50) {
    recs.push('Enhance inclusion quality with readonly properties, private access, and sealed encapsulation')
  }
  if (stats.avgTransparency < 50) {
    recs.push('Increase transparency with clear types, visible interfaces, and revealing documentation')
  }
  if (stats.avgAgeWisdom < 50) {
    recs.push('Grow age wisdom with mature interfaces, proven generics, and reliable const patterns')
  }
  if (stats.avgFractureResistance < 50) {
    recs.push('Strengthen fracture resistance with robust classes, durable exports, and solid async patterns')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — consider significant refactoring`)
  }
  if (museum.overallPreservation < 40) {
    recs.push('Overall amber preservation is poor — focus on preservation quality and transparency first')
  }
  const allDust = collections.every(c => c.collectionType === 'no-amber' || c.collectionType === 'beach-pebble')
  if (allDust && collections.length > 0) {
    recs.push('All collections are beach pebbles or empty — consider a major quality overhaul')
  }
  const dust = resins.filter(r => r.condition === 'dust').map(r => r.file)
  if (dust.length > 0 && dust.length <= 3) {
    recs.push(`Restore these dusty files into amber: ${dust.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your amber collection is museum-quality! Every resin perfectly preserves its golden clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as amber resin
 * @example
 * const resin = analyzeAmberResin(content, 'index.ts')
 * console.log(resin.condition) // 'museum-piece'
 */
export function analyzeAmberResin(content: string, filePath: string): AmberResin {
  const preserving = measurePreserving(content)
  const encapsulating = measureEncapsulating(content)
  const clarifying = measureClarifying(content)
  const maturing = measureMaturing(content)
  const resisting = measureResisting(content)

  const qualityScore = Math.round(
    preserving.quality * 0.2 +
    encapsulating.quality * 0.2 +
    clarifying.transparency * 0.2 +
    maturing.wisdom * 0.2 +
    resisting.resistance * 0.2,
  )

  return {
    file: filePath,
    preservationQuality: preserving.quality,
    inclusionQuality: encapsulating.quality,
    transparency: clarifying.transparency,
    ageWisdom: maturing.wisdom,
    fractureResistance: resisting.resistance,
    preserving,
    encapsulating,
    clarifying,
    maturing,
    resisting,
    condition: classifyResinCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as an amber collection
 * @example
 * const collection = analyzeAmberCollection(resins, 'src')
 * console.log(collection.collectionType) // 'museum-collection'
 */
export function analyzeAmberCollection(resins: AmberResin[], dirPath: string): AmberCollection {
  if (resins.length === 0) {
    return {
      directory: dirPath, resins: [], avgPreservation: 0, avgTransparency: 0, avgResistance: 0,
      museumPieceCount: 0, dustCount: 0, collectionType: 'no-amber', condition: 'empty',
    }
  }

  const avgPreservation = Math.round(resins.reduce((s, r) => s + r.preservationQuality, 0) / resins.length)
  const avgTransparency = Math.round(resins.reduce((s, r) => s + r.transparency, 0) / resins.length)
  const avgResistance = Math.round(resins.reduce((s, r) => s + r.fractureResistance, 0) / resins.length)
  const museumPieceCount = resins.filter(r => r.condition === 'museum-piece').length
  const dustCount = resins.filter(r => r.condition === 'dust').length
  const avgQs = Math.round(resins.reduce((s, r) => s + r.qualityScore, 0) / resins.length)

  return {
    directory: dirPath, resins, avgPreservation, avgTransparency, avgResistance,
    museumPieceCount, dustCount, collectionType: classifyCollectionType(resins),
    condition: classifyCollectionCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete amber amber result
 * @example
 * const result = await buildAmberAmberResult(files, contents)
 * console.log(result.stats.curatorGrade) // 'master-curator'
 */
export async function buildAmberAmberResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberAmberResult> {
  const resins = files.map((file, i) => analyzeAmberResin(contents[i] ?? '', file))

  const dirMap = new Map<string, AmberResin[]>()
  for (const resin of resins) {
    const dir = path.dirname(resin.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(resin) } else { dirMap.set(dir, [resin]) }
  }

  const collections = Array.from(dirMap.entries()).map(([dir, dirResins]) =>
    analyzeAmberCollection(dirResins, dir),
  )

  const avgPreservation = resins.length > 0
    ? Math.round(resins.reduce((s, r) => s + r.preservationQuality, 0) / resins.length) : 0
  const avgTransparency = resins.length > 0
    ? Math.round(resins.reduce((s, r) => s + r.transparency, 0) / resins.length) : 0
  const avgResistance = resins.length > 0
    ? Math.round(resins.reduce((s, r) => s + r.fractureResistance, 0) / resins.length) : 0

  const overallPreservation = resins.length > 0
    ? Math.round((avgPreservation + avgTransparency + avgResistance) / 3) : 0
  const isPreserved = avgPreservation >= 60

  const museum: MuseumSummary = { avgPreservation, avgTransparency, avgResistance, isPreserved, overallPreservation }

  const avgInclusionQuality = resins.length > 0
    ? Math.round(resins.reduce((s, r) => s + r.inclusionQuality, 0) / resins.length) : 0
  const avgAgeWisdom = resins.length > 0
    ? Math.round(resins.reduce((s, r) => s + r.ageWisdom, 0) / resins.length) : 0
  const avgFractureResistance = avgResistance

  const bestResin = resins.length > 0
    ? resins.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const bestPreserved = resins.length > 0
    ? resins.reduce((best, r) => r.preservationQuality > best.preservationQuality ? r : best).file : ''
  const bestEncapsulated = resins.length > 0
    ? resins.reduce((best, r) => r.inclusionQuality > best.inclusionQuality ? r : best).file : ''
  const mostTransparent = resins.length > 0
    ? resins.reduce((best, r) => r.transparency > best.transparency ? r : best).file : ''
  const wisest = resins.length > 0
    ? resins.reduce((best, r) => r.ageWisdom > best.ageWisdom ? r : best).file : ''

  const stats: AmberAmberStats = {
    totalFiles: resins.length,
    totalCollections: collections.length,
    avgPreservationQuality: avgPreservation,
    avgInclusionQuality,
    avgTransparency,
    avgAgeWisdom,
    avgFractureResistance,
    museumPieceCount: resins.filter(r => r.condition === 'museum-piece').length,
    fineAmberCount: resins.filter(r => r.condition === 'fine-amber').length,
    properResinCount: resins.filter(r => r.condition === 'proper-resin').length,
    cloudyAmberCount: resins.filter(r => r.condition === 'cloudy-amber').length,
    crackedResinCount: resins.filter(r => r.condition === 'cracked-resin').length,
    dustCount: resins.filter(r => r.condition === 'dust').length,
    hasHighQualityCount: resins.filter(r => r.preserving.hasHighQuality).length,
    hasHighEncapsulationCount: resins.filter(r => r.encapsulating.hasHighQuality).length,
    hasHighTransparencyCount: resins.filter(r => r.clarifying.hasHighTransparency).length,
    hasHighWisdomCount: resins.filter(r => r.maturing.hasHighWisdom).length,
    hasHighResistanceCount: resins.filter(r => r.resisting.hasHighResistance).length,
    overallPreservation,
    curatorGrade: classifyCuratorGrade(overallPreservation),
    bestResin, bestPreserved, bestEncapsulated, mostTransparent, wisest,
  }

  const recommendations = generateRecommendations(resins, collections, museum, stats)

  return { resins, collections, museum, stats, recommendations }
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
