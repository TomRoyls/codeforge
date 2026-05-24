// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Reflection depth grade */
export type DepthGrade =
  | 'scrying-depth'
  | 'deep-reflection'
  | 'proper-mirror'
  | 'surface-only'
  | 'foggy-reflection'
  | 'blank'

/** Edge sharpness grade */
export type EdgeGrade =
  | 'monomolecular-edge'
  | 'scalpel-sharp'
  | 'proper-edge'
  | 'dull-blade'
  | 'blunt-edge'
  | 'no-edge'

/** Volcanic origin grade */
export type OriginGrade =
  | 'fresh-lava'
  | 'quality-magma'
  | 'proper-flow'
  | 'mixed-ash'
  | 'degraded-rock'
  | 'sediment'

/** Shadow clarity grade */
export type ShadowGrade =
  | 'shadow-master'
  | 'clear-shadows'
  | 'proper-visibility'
  | 'dim-shadows'
  | 'dark-corners'
  | 'pitch-black'

/** Prophecy accuracy grade */
export type ProphecyGrade =
  | 'true-oracle'
  | 'accurate-prediction'
  | 'proper-forecast'
  | 'vague-prophecy'
  | 'wrong-prediction'
  | 'no-prophecy'

/** Oracle condition */
export type OracleCondition =
  | 'scrying-masterpiece'
  | 'polished-oracle'
  | 'proper-scryer'
  | 'rough-crystal'
  | 'shattered-ball'
  | 'dust'

/** Temple type */
export type TempleType =
  | 'delphic-oracle'
  | 'scrying-sanctum'
  | 'proper-temple'
  | 'dark-corner'
  | 'broken-shrine'
  | 'no-temple'

/** Temple condition */
export type TempleCondition =
  | 'oracle-chamber'
  | 'divination-room'
  | 'decent-space'
  | 'dim-corner'
  | 'ruined'
  | 'void'

/** Seer grade */
export type SeerGrade =
  | 'oracle-supreme'
  | 'master-seer'
  | 'skilled-diviner'
  | 'apprentice'
  | 'novice'
  | 'blind-prophet'

/** Reflecting measurement */
export interface ReflectingMeasure {
  depth: number
  grade: DepthGrade
  hasHighDepth: boolean
  hasSelfAware: boolean
  hasIntrospective: boolean
  hasNoBlind: boolean
  hasReflective: boolean
  hasNoOpaque: boolean
  hasRevealing: boolean
  hasNoHidden: boolean
  hasTransparent: boolean
  hasNoConcealing: boolean
  hasInsightful: boolean
  blindCount: number
  opaqueCount: number
}

/** Sharpening measurement */
export interface SharpeningMeasure {
  sharpness: number
  edge: EdgeGrade
  hasHighSharpness: boolean
  hasPrecise: boolean
  hasExact: boolean
  hasNoImprecise: boolean
  hasSharp: boolean
  hasNoBlunt: boolean
  hasFine: boolean
  hasNoCoarse: boolean
  hasDefined: boolean
  hasNoVague: boolean
  hasCrisp: boolean
  impreciseCount: number
  bluntCount: number
}

/** Sourcing measurement */
export interface SourcingMeasure {
  quality: number
  origin: OriginGrade
  hasHighQuality: boolean
  hasPureSource: boolean
  hasCleanOrigin: boolean
  hasNoContaminated: boolean
  hasQualityOrigin: boolean
  hasNoImpure: boolean
  hasAuthentic: boolean
  hasNoFake: boolean
  hasGenuine: boolean
  hasNoSynthetic: boolean
  hasNatural: boolean
  contaminatedCount: number
  impureCount: number
}

/** Revealing measurement */
export interface RevealingMeasure {
  clarity: number
  shadow: ShadowGrade
  hasHighClarity: boolean
  hasVisible: boolean
  hasExposed: boolean
  hasNoHidden: boolean
  hasDetectable: boolean
  hasNoInvisible: boolean
  hasClear: boolean
  hasNoMurky: boolean
  hasRevealed: boolean
  hasNoConcealed: boolean
  hasApparent: boolean
  hiddenCount: number
  invisibleCount: number
}

/** Prophesying measurement */
export interface ProphesyingMeasure {
  accuracy: number
  prophecy: ProphecyGrade
  hasHighAccuracy: boolean
  hasPredictable: boolean
  hasReliable: boolean
  hasNoUnpredictable: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasForeseeable: boolean
  hasNoSurprising: boolean
  hasDependable: boolean
  hasNoRandom: boolean
  hasDeterministic: boolean
  unpredictableCount: number
  erraticCount: number
}

/** Single file analysis */
export interface OracleVision {
  file: string
  reflectionDepth: number
  edgeSharpness: number
  volcanicOrigin: number
  shadowClarity: number
  prophecyAccuracy: number
  reflecting: ReflectingMeasure
  sharpening: SharpeningMeasure
  sourcing: SourcingMeasure
  revealing: RevealingMeasure
  prophesying: ProphesyingMeasure
  condition: OracleCondition
  qualityScore: number
}

/** Directory-level temple */
export interface OracleTemple {
  directory: string
  visions: OracleVision[]
  avgDepth: number
  avgSharpness: number
  avgAccuracy: number
  scryingMasterpieceCount: number
  dustCount: number
  templeType: TempleType
  condition: TempleCondition
}

/** Prophecy summary */
export interface ProphecySummary {
  avgDepth: number
  avgSharpness: number
  avgAccuracy: number
  isProphetic: boolean
  overallVision: number
}

/** Full stats */
export interface MidnightOracleStats {
  totalFiles: number
  totalTemples: number
  avgReflectionDepth: number
  avgEdgeSharpness: number
  avgVolcanicOrigin: number
  avgShadowClarity: number
  avgProphecyAccuracy: number
  scryingMasterpieceCount: number
  polishedOracleCount: number
  properScryerCount: number
  roughCrystalCount: number
  shatteredBallCount: number
  dustCount: number
  hasHighDepthCount: number
  hasHighSharpnessCount: number
  hasHighQualityCount: number
  hasHighClarityCount: number
  hasHighAccuracyCount: number
  overallVision: number
  seerGrade: SeerGrade
  bestVision: string
  deepest: string
  sharpest: string
  purest: string
  mostAccurate: string
}

/** Full result */
export interface MidnightOracleResult {
  visions: OracleVision[]
  temples: OracleTemple[]
  prophecy: ProphecySummary
  stats: MidnightOracleStats
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
 * Measure reflection depth
 * @example
 * const m = measureReflecting(content)
 * console.log(m.grade) // 'scrying-depth'
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasSelfAware = hasExport(content) && hasAsync(content)
  const hasIntrospective = hasNamedExport(content) && hasReturnType(content)
  const hasReflective = hasConst(content) && hasImport(content)
  const hasRevealing = hasGenerics(content) && hasInterface(content)
  const hasTransparent = hasDocComments(content) && hasExport(content)
  const hasInsightful = hasTypeAlias(content) && hasConst(content)

  score += hasSelfAware ? 5 : 0
  score += hasIntrospective ? 5 : 0
  score += hasReflective ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasInsightful ? 5 : 0

  const depth = Math.min(score, 100)
  const blindCount = count(/\bvar\b/, content)
  const opaqueCount = count(/\bany\b/, content)

  const hasNoBlind = blindCount === 0
  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoConcealing = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grade: DepthGrade
  if (depth >= 85) grade = 'scrying-depth'
  else if (depth >= 70) grade = 'deep-reflection'
  else if (depth >= 55) grade = 'proper-mirror'
  else if (depth >= 40) grade = 'surface-only'
  else if (depth >= 25) grade = 'foggy-reflection'
  else grade = 'blank'

  return {
    depth, grade, hasHighDepth, hasSelfAware, hasIntrospective, hasNoBlind,
    hasReflective, hasNoOpaque, hasRevealing, hasNoHidden, hasTransparent,
    hasNoConcealing, hasInsightful, blindCount, opaqueCount,
  }
}

/**
 * Measure edge sharpness
 * @example
 * const m = measureSharpening(content)
 * console.log(m.edge) // 'monomolecular-edge'
 */
export function measureSharpening(content: string): SharpeningMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasPrecise = hasConst(content) && hasStrictEq(content)
  const hasExact = hasReturnType(content) && hasReadonly(content)
  const hasSharp = hasInterface(content) && hasClass(content)
  const hasFine = hasExport(content) && hasImport(content)
  const hasDefined = hasPrivate(content) && hasStrictEq(content)
  const hasCrisp = hasTypeAlias(content) && hasConst(content)

  score += hasPrecise ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasFine ? 5 : 0
  score += hasDefined ? 5 : 0
  score += hasCrisp ? 5 : 0

  const sharpness = Math.min(score, 100)
  const impreciseCount = count(/\bvar\b/, content)
  const bluntCount = count(/\bany\b/, content)

  const hasNoImprecise = impreciseCount === 0
  const hasNoBlunt = bluntCount === 0
  const hasNoCoarse = !has(/\beval\b/, content)
  const hasNoVague = !has(/\bdebugger\b/, content)
  const hasHighSharpness = sharpness >= 70

  let edge: EdgeGrade
  if (sharpness >= 85) edge = 'monomolecular-edge'
  else if (sharpness >= 70) edge = 'scalpel-sharp'
  else if (sharpness >= 55) edge = 'proper-edge'
  else if (sharpness >= 40) edge = 'dull-blade'
  else if (sharpness >= 25) edge = 'blunt-edge'
  else edge = 'no-edge'

  return {
    sharpness, edge, hasHighSharpness, hasPrecise, hasExact, hasNoImprecise,
    hasSharp, hasNoBlunt, hasFine, hasNoCoarse, hasDefined, hasNoVague,
    hasCrisp, impreciseCount, bluntCount,
  }
}

/**
 * Measure volcanic origin quality
 * @example
 * const m = measureSourcing(content)
 * console.log(m.origin) // 'fresh-lava'
 */
export function measureSourcing(content: string): SourcingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasPureSource = hasReturnType(content) && hasImport(content)
  const hasCleanOrigin = hasExport(content) && hasAsync(content)
  const hasQualityOrigin = hasInterface(content) && hasGenerics(content)
  const hasAuthentic = hasNamedExport(content) && hasConst(content)
  const hasGenuine = hasDocComments(content) && hasExport(content)
  const hasNatural = hasClass(content) && hasReturnType(content)

  score += hasPureSource ? 5 : 0
  score += hasCleanOrigin ? 5 : 0
  score += hasQualityOrigin ? 5 : 0
  score += hasAuthentic ? 5 : 0
  score += hasGenuine ? 5 : 0
  score += hasNatural ? 5 : 0

  const quality = Math.min(score, 100)
  const contaminatedCount = count(/\bvar\b/, content)
  const impureCount = count(/\bany\b/, content)

  const hasNoContaminated = contaminatedCount === 0
  const hasNoImpure = impureCount === 0
  const hasNoFake = !has(/\beval\b/, content)
  const hasNoSynthetic = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let origin: OriginGrade
  if (quality >= 85) origin = 'fresh-lava'
  else if (quality >= 70) origin = 'quality-magma'
  else if (quality >= 55) origin = 'proper-flow'
  else if (quality >= 40) origin = 'mixed-ash'
  else if (quality >= 25) origin = 'degraded-rock'
  else origin = 'sediment'

  return {
    quality, origin, hasHighQuality, hasPureSource, hasCleanOrigin, hasNoContaminated,
    hasQualityOrigin, hasNoImpure, hasAuthentic, hasNoFake, hasGenuine, hasNoSynthetic,
    hasNatural, contaminatedCount, impureCount,
  }
}

/**
 * Measure shadow clarity
 * @example
 * const m = measureRevealing(content)
 * console.log(m.shadow) // 'shadow-master'
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasVisible = hasDocComments(content) && hasTypeAlias(content)
  const hasExposed = hasReadonly(content) && hasPrivate(content)
  const hasDetectable = hasInterface(content) && hasGenerics(content)
  const hasClear = hasReturnType(content) && hasExport(content)
  const hasRevealed = hasImport(content) && hasClass(content)
  const hasApparent = hasReadonly(content) && hasDocComments(content)

  score += hasVisible ? 5 : 0
  score += hasExposed ? 5 : 0
  score += hasDetectable ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasRevealed ? 5 : 0
  score += hasApparent ? 5 : 0

  const clarity = Math.min(score, 100)
  const hiddenCount = count(/\bvar\b/, content)
  const invisibleCount = count(/\bany\b/, content)

  const hasNoHidden = hiddenCount === 0
  const hasNoInvisible = invisibleCount === 0
  const hasNoMurky = !has(/\beval\b/, content)
  const hasNoConcealed = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let shadow: ShadowGrade
  if (clarity >= 85) shadow = 'shadow-master'
  else if (clarity >= 70) shadow = 'clear-shadows'
  else if (clarity >= 55) shadow = 'proper-visibility'
  else if (clarity >= 40) shadow = 'dim-shadows'
  else if (clarity >= 25) shadow = 'dark-corners'
  else shadow = 'pitch-black'

  return {
    clarity, shadow, hasHighClarity, hasVisible, hasExposed, hasNoHidden,
    hasDetectable, hasNoInvisible, hasClear, hasNoMurky, hasRevealed,
    hasNoConcealed, hasApparent, hiddenCount, invisibleCount,
  }
}

/**
 * Measure prophecy accuracy
 * @example
 * const m = measureProphesying(content)
 * console.log(m.prophecy) // 'true-oracle'
 */
export function measureProphesying(content: string): ProphesyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0

  const hasPredictable = hasExport(content) && hasImport(content)
  const hasReliable = hasConst(content) && hasStrictEq(content)
  const hasConsistent = hasInterface(content) && hasClass(content)
  const hasForeseeable = hasReturnType(content) && hasReadonly(content)
  const hasDependable = hasAsync(content) && hasExport(content)
  const hasDeterministic = hasGenerics(content) && hasImport(content)

  score += hasPredictable ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasForeseeable ? 5 : 0
  score += hasDependable ? 5 : 0
  score += hasDeterministic ? 5 : 0

  const accuracy = Math.min(score, 100)
  const unpredictableCount = count(/\bvar\b/, content)
  const erraticCount = count(/\bany\b/, content)

  const hasNoUnpredictable = unpredictableCount === 0
  const hasNoErratic = erraticCount === 0
  const hasNoSurprising = !has(/\beval\b/, content)
  const hasNoRandom = !has(/\bdebugger\b/, content)
  const hasHighAccuracy = accuracy >= 70

  let prophecy: ProphecyGrade
  if (accuracy >= 85) prophecy = 'true-oracle'
  else if (accuracy >= 70) prophecy = 'accurate-prediction'
  else if (accuracy >= 55) prophecy = 'proper-forecast'
  else if (accuracy >= 40) prophecy = 'vague-prophecy'
  else if (accuracy >= 25) prophecy = 'wrong-prediction'
  else prophecy = 'no-prophecy'

  return {
    accuracy, prophecy, hasHighAccuracy, hasPredictable, hasReliable, hasNoUnpredictable,
    hasConsistent, hasNoErratic, hasForeseeable, hasNoSurprising, hasDependable,
    hasNoRandom, hasDeterministic, unpredictableCount, erraticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify oracle condition
 * @example
 * classifyOracleCondition(90) // 'scrying-masterpiece'
 */
export function classifyOracleCondition(score: number): OracleCondition {
  if (score >= 85) return 'scrying-masterpiece'
  if (score >= 70) return 'polished-oracle'
  if (score >= 55) return 'proper-scryer'
  if (score >= 40) return 'rough-crystal'
  if (score >= 25) return 'shattered-ball'
  return 'dust'
}

/**
 * Classify temple type
 * @example
 * classifyTempleType(visions) // 'delphic-oracle'
 */
export function classifyTempleType(visions: OracleVision[]): TempleType {
  if (visions.length === 0) return 'no-temple'
  const avgQs = Math.round(visions.reduce((s, v) => s + v.qualityScore, 0) / visions.length)
  const masterpieceRatio = visions.filter(v => v.condition === 'scrying-masterpiece').length / visions.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'delphic-oracle'
  if (avgQs >= 60) return 'scrying-sanctum'
  if (avgQs >= 45) return 'proper-temple'
  if (avgQs >= 30) return 'dark-corner'
  if (avgQs >= 15) return 'broken-shrine'
  return 'no-temple'
}

/**
 * Classify temple condition
 * @example
 * classifyTempleCondition(80) // 'oracle-chamber'
 */
export function classifyTempleCondition(avgQs: number): TempleCondition {
  if (avgQs >= 75) return 'oracle-chamber'
  if (avgQs >= 60) return 'divination-room'
  if (avgQs >= 45) return 'decent-space'
  if (avgQs >= 30) return 'dim-corner'
  if (avgQs >= 15) return 'ruined'
  return 'void'
}

/**
 * Classify seer grade
 * @example
 * classifySeerGrade(85) // 'oracle-supreme'
 */
export function classifySeerGrade(avgVision: number): SeerGrade {
  if (avgVision >= 80) return 'oracle-supreme'
  if (avgVision >= 65) return 'master-seer'
  if (avgVision >= 50) return 'skilled-diviner'
  if (avgVision >= 35) return 'apprentice'
  if (avgVision >= 20) return 'novice'
  return 'blind-prophet'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(visions, temples, prophecy, stats)
 */
export function generateRecommendations(
  visions: OracleVision[],
  temples: OracleTemple[],
  prophecy: ProphecySummary,
  stats: MidnightOracleStats,
): string[] {
  const recs: string[] = []
  if (stats.avgReflectionDepth < 50) {
    recs.push('Deepen reflection with self-aware async/export pairs, introspective named exports, and reflective const/import patterns')
  }
  if (stats.avgEdgeSharpness < 50) {
    recs.push('Boost edge sharpness with precise const/strict-eq, exact return types/readonly, and sharp interfaces')
  }
  if (stats.avgVolcanicOrigin < 50) {
    recs.push('Purify volcanic origin with pure return types/imports, clean export/async, and quality interfaces')
  }
  if (stats.avgShadowClarity < 50) {
    recs.push('Clarify shadows with visible doc comments, exposed readonly/private, and detectable interfaces')
  }
  if (stats.avgProphecyAccuracy < 50) {
    recs.push('Improve prophecy accuracy with predictable exports/imports, reliable const/strict-eq, and consistent interfaces')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — consider significant refactoring`)
  }
  if (prophecy.overallVision < 40) {
    recs.push('Overall oracle vision is dim — focus on reflection depth and edge sharpness first')
  }
  const allBroken = temples.every(t => t.templeType === 'no-temple' || t.templeType === 'broken-shrine')
  if (allBroken && temples.length > 0) {
    recs.push('All temples are broken or void — consider a major quality overhaul')
  }
  const dustFiles = visions.filter(v => v.condition === 'dust').map(v => v.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Polish these dust files into scrying masterpieces: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your midnight oracle is oracle-supreme quality! Every vision reveals perfect prophecy')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as oracle vision
 * @example
 * const v = analyzeOracleVision(content, 'index.ts')
 * console.log(v.condition) // 'scrying-masterpiece'
 */
export function analyzeOracleVision(content: string, filePath: string): OracleVision {
  const reflecting = measureReflecting(content)
  const sharpening = measureSharpening(content)
  const sourcing = measureSourcing(content)
  const revealing = measureRevealing(content)
  const prophesying = measureProphesying(content)

  const qualityScore = Math.round(
    reflecting.depth * 0.2 +
    sharpening.sharpness * 0.2 +
    sourcing.quality * 0.2 +
    revealing.clarity * 0.2 +
    prophesying.accuracy * 0.2,
  )

  return {
    file: filePath,
    reflectionDepth: reflecting.depth,
    edgeSharpness: sharpening.sharpness,
    volcanicOrigin: sourcing.quality,
    shadowClarity: revealing.clarity,
    prophecyAccuracy: prophesying.accuracy,
    reflecting,
    sharpening,
    sourcing,
    revealing,
    prophesying,
    condition: classifyOracleCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as oracle temple
 * @example
 * const t = analyzeOracleTemple(visions, 'src')
 * console.log(t.templeType) // 'delphic-oracle'
 */
export function analyzeOracleTemple(visions: OracleVision[], dirPath: string): OracleTemple {
  if (visions.length === 0) {
    return {
      directory: dirPath, visions: [], avgDepth: 0, avgSharpness: 0, avgAccuracy: 0,
      scryingMasterpieceCount: 0, dustCount: 0, templeType: 'no-temple', condition: 'void',
    }
  }

  const avgDepth = Math.round(visions.reduce((s, v) => s + v.reflectionDepth, 0) / visions.length)
  const avgSharpness = Math.round(visions.reduce((s, v) => s + v.edgeSharpness, 0) / visions.length)
  const avgAccuracy = Math.round(visions.reduce((s, v) => s + v.prophecyAccuracy, 0) / visions.length)
  const scryingMasterpieceCount = visions.filter(v => v.condition === 'scrying-masterpiece').length
  const dustCount = visions.filter(v => v.condition === 'dust').length
  const avgQs = Math.round(visions.reduce((s, v) => s + v.qualityScore, 0) / visions.length)

  return {
    directory: dirPath, visions, avgDepth, avgSharpness, avgAccuracy,
    scryingMasterpieceCount, dustCount, templeType: classifyTempleType(visions),
    condition: classifyTempleCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete midnight oracle result
 * @example
 * const result = await buildMidnightOracleResult(files, contents)
 * console.log(result.stats.seerGrade) // 'oracle-supreme'
 */
export async function buildMidnightOracleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MidnightOracleResult> {
  const visions = files.map((file, i) => analyzeOracleVision(contents[i] ?? '', file))

  const dirMap = new Map<string, OracleVision[]>()
  for (const vision of visions) {
    const dir = path.dirname(vision.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(vision) } else { dirMap.set(dir, [vision]) }
  }

  const temples = Array.from(dirMap.entries()).map(([dir, dirVisions]) =>
    analyzeOracleTemple(dirVisions, dir),
  )

  const avgReflectionDepth = visions.length > 0
    ? Math.round(visions.reduce((s, v) => s + v.reflectionDepth, 0) / visions.length) : 0
  const avgEdgeSharpness = visions.length > 0
    ? Math.round(visions.reduce((s, v) => s + v.edgeSharpness, 0) / visions.length) : 0
  const avgAccuracy = visions.length > 0
    ? Math.round(visions.reduce((s, v) => s + v.prophecyAccuracy, 0) / visions.length) : 0

  const overallVision = visions.length > 0
    ? Math.round((avgReflectionDepth + avgEdgeSharpness + avgAccuracy) / 3) : 0
  const isProphetic = avgReflectionDepth >= 60

  const prophecySummary: ProphecySummary = { avgDepth: avgReflectionDepth, avgSharpness: avgEdgeSharpness, avgAccuracy, isProphetic, overallVision }

  const avgVolcanicOrigin = visions.length > 0
    ? Math.round(visions.reduce((s, v) => s + v.volcanicOrigin, 0) / visions.length) : 0
  const avgShadowClarity = visions.length > 0
    ? Math.round(visions.reduce((s, v) => s + v.shadowClarity, 0) / visions.length) : 0
  const avgProphecyAccuracy = visions.length > 0
    ? Math.round(visions.reduce((s, v) => s + v.prophecyAccuracy, 0) / visions.length) : 0

  const bestVision = visions.length > 0
    ? visions.reduce((best, v) => v.qualityScore > best.qualityScore ? v : best).file : ''
  const deepest = visions.length > 0
    ? visions.reduce((best, v) => v.reflectionDepth > best.reflectionDepth ? v : best).file : ''
  const sharpest = visions.length > 0
    ? visions.reduce((best, v) => v.edgeSharpness > best.edgeSharpness ? v : best).file : ''
  const purest = visions.length > 0
    ? visions.reduce((best, v) => v.volcanicOrigin > best.volcanicOrigin ? v : best).file : ''
  const mostAccurate = visions.length > 0
    ? visions.reduce((best, v) => v.prophecyAccuracy > best.prophecyAccuracy ? v : best).file : ''

  const stats: MidnightOracleStats = {
    totalFiles: visions.length,
    totalTemples: temples.length,
    avgReflectionDepth,
    avgEdgeSharpness,
    avgVolcanicOrigin,
    avgShadowClarity,
    avgProphecyAccuracy,
    scryingMasterpieceCount: visions.filter(v => v.condition === 'scrying-masterpiece').length,
    polishedOracleCount: visions.filter(v => v.condition === 'polished-oracle').length,
    properScryerCount: visions.filter(v => v.condition === 'proper-scryer').length,
    roughCrystalCount: visions.filter(v => v.condition === 'rough-crystal').length,
    shatteredBallCount: visions.filter(v => v.condition === 'shattered-ball').length,
    dustCount: visions.filter(v => v.condition === 'dust').length,
    hasHighDepthCount: visions.filter(v => v.reflecting.hasHighDepth).length,
    hasHighSharpnessCount: visions.filter(v => v.sharpening.hasHighSharpness).length,
    hasHighQualityCount: visions.filter(v => v.sourcing.hasHighQuality).length,
    hasHighClarityCount: visions.filter(v => v.revealing.hasHighClarity).length,
    hasHighAccuracyCount: visions.filter(v => v.prophesying.hasHighAccuracy).length,
    overallVision,
    seerGrade: classifySeerGrade(overallVision),
    bestVision, deepest, sharpest, purest, mostAccurate,
  }

  const recommendations = generateRecommendations(visions, temples, prophecySummary, stats)

  return { visions, temples, prophecy: prophecySummary, stats, recommendations }
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
