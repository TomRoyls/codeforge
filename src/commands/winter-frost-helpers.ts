// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Crystal clarity grade */
export type ClarityGrade =
  | 'ice-crystal'
  | 'clear-frost'
  | 'proper-crystal'
  | 'cloudy-ice'
  | 'foggy-glass'
  | 'opaque-frost'

/** Freeze resistance grade */
export type FreezeGrade =
  | 'antifreeze-grade'
  | 'cold-resistant'
  | 'proper-handling'
  | 'brittle-in-cold'
  | 'freezing'
  | 'frozen-solid'

/** Ice structure grade */
export type StructureGrade =
  | 'diamond-ice'
  | 'glacier-solid'
  | 'proper-ice'
  | 'slush'
  | 'thin-ice'
  | 'no-structure'

/** Snowflake uniqueness grade */
export type UniquenessGrade =
  | 'unique-crystal'
  | 'distinct-pattern'
  | 'proper-design'
  | 'generic-template'
  | 'cookie-cutter'
  | 'identical-copy'

/** Permafrost stability grade */
export type PermafrostGrade =
  | 'deep-permafrost'
  | 'stable-ground'
  | 'proper-foundation'
  | 'thawing'
  | 'sinking'
  | 'melted'

/** Frost condition */
export type FrostCondition =
  | 'ice-palace'
  | 'frost-garden'
  | 'proper-frost'
  | 'slush-puddle'
  | 'ice-shard'
  | 'dry-ground'

/** Landscape type */
export type LandscapeType =
  | 'arctic-tundra'
  | 'winter-wonderland'
  | 'frozen-lake'
  | 'frost-morning'
  | 'light-dusting'
  | 'no-snow'

/** Landscape condition */
export type LandscapeCondition =
  | 'pristine-winter'
  | 'beautiful-frost'
  | 'proper-cold'
  | 'thawing'
  | 'slushy'
  | 'spring'

/** Cryomancer grade */
export type CryomancerGrade =
  | 'ice-archmage'
  | 'frost-wizard'
  | 'winter-sage'
  | 'cold-acolyte'
  | 'novice'
  | 'snowman'

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasClear: boolean
  hasLucid: boolean
  hasNoMuddy: boolean
  hasTransparent: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasPristine: boolean
  hasNoTainted: boolean
  hasPure: boolean
  muddyCount: number
  opaqueCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resistance: number
  freeze: FreezeGrade
  hasHighResistance: boolean
  hasResilient: boolean
  hasHardened: boolean
  hasNoBrittle: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoCracking: boolean
  hasAdaptive: boolean
  hasNoRigid: boolean
  hasFlexible: boolean
  brittleCount: number
  fragileCount: number
}

/** Structuring measurement */
export interface StructuringMeasure {
  quality: number
  structure: StructureGrade
  hasHighQuality: boolean
  hasSolid: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasStructured: boolean
  hasNoRandom: boolean
  hasCrystalline: boolean
  hasNoAmorphous: boolean
  hasOrdered: boolean
  hasNoDisordered: boolean
  hasRegular: boolean
  chaoticCount: number
  amorphousCount: number
}

/** Uniqueing measurement */
export interface UniqueingMeasure {
  uniqueness: number
  flake: UniquenessGrade
  hasHighUniqueness: boolean
  hasOriginal: boolean
  hasDistinct: boolean
  hasNoDerivative: boolean
  hasCreative: boolean
  hasNoCloned: boolean
  hasInnovative: boolean
  hasNoFormulaic: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasInventive: boolean
  derivativeCount: number
  clonedCount: number
}

/** Stabilizing measurement */
export interface StabilizingMeasure {
  stability: number
  permafrost: PermafrostGrade
  hasHighStability: boolean
  hasStable: boolean
  hasEnduring: boolean
  hasNoShifting: boolean
  hasPermanent: boolean
  hasNoVolatile: boolean
  hasReliable: boolean
  hasNoUnpredictable: boolean
  hasSolid: boolean
  hasNoUnstable: boolean
  hasLasting: boolean
  shiftingCount: number
  volatileCount: number
}

/** Single file analysis */
export interface FrostCrystal {
  file: string
  crystalClarity: number
  freezeResistance: number
  iceStructure: number
  snowflakeUniqueness: number
  permafrostStability: number
  clarifying: ClarifyingMeasure
  resisting: ResistingMeasure
  structuring: StructuringMeasure
  uniqueing: UniqueingMeasure
  stabilizing: StabilizingMeasure
  condition: FrostCondition
  qualityScore: number
}

/** Directory-level landscape */
export interface WinterLandscape {
  directory: string
  crystals: FrostCrystal[]
  avgClarity: number
  avgStructure: number
  avgStability: number
  icePalaceCount: number
  dryGroundCount: number
  landscapeType: LandscapeType
  condition: LandscapeCondition
}

/** Tundra summary */
export interface TundraSummary {
  avgClarity: number
  avgStructure: number
  avgStability: number
  isCrystalline: boolean
  overallFrost: number
}

/** Full stats */
export interface WinterFrostStats {
  totalFiles: number
  totalLandscapes: number
  avgCrystalClarity: number
  avgFreezeResistance: number
  avgIceStructure: number
  avgSnowflakeUniqueness: number
  avgPermafrostStability: number
  icePalaceCount: number
  frostGardenCount: number
  properFrostCount: number
  slushPuddleCount: number
  iceShardCount: number
  dryGroundCount: number
  hasHighClarityCount: number
  hasHighResistanceCount: number
  hasHighQualityCount: number
  hasHighUniquenessCount: number
  hasHighStabilityCount: number
  overallFrost: number
  cryomancerGrade: CryomancerGrade
  bestCrystal: string
  clearest: string
  mostResistant: string
  bestStructured: string
  mostUnique: string
}

/** Full result */
export interface WinterFrostResult {
  crystals: FrostCrystal[]
  landscapes: WinterLandscape[]
  tundra: TundraSummary
  stats: WinterFrostStats
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
 * Measure crystal clarity (code lucidity)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.grade) // 'ice-crystal'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasClear = hasReturnType(content) && hasStrictEq(content)
  const hasLucid = hasDocComments(content) && hasInterface(content)
  const hasTransparent = hasGenerics(content) && hasTypeAlias(content)
  const hasVisible = hasReadonly(content) && hasPrivate(content)
  const hasPristine = hasConst(content) && hasReturnType(content)
  const hasPure = hasStrictEq(content) && hasClass(content)

  score += hasClear ? 5 : 0
  score += hasLucid ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasPure ? 5 : 0

  const clarity = Math.min(score, 100)
  const muddyCount = count(/\bvar\b/, content)
  const opaqueCount = count(/\bany\b/, content)

  const hasNoMuddy = muddyCount === 0
  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoTainted = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'ice-crystal'
  else if (clarity >= 70) grade = 'clear-frost'
  else if (clarity >= 55) grade = 'proper-crystal'
  else if (clarity >= 40) grade = 'cloudy-ice'
  else if (clarity >= 25) grade = 'foggy-glass'
  else grade = 'opaque-frost'

  return {
    clarity, grade, hasHighClarity, hasClear, hasLucid, hasNoMuddy,
    hasTransparent, hasNoOpaque, hasVisible, hasNoHidden, hasPristine,
    hasNoTainted, hasPure, muddyCount, opaqueCount,
  }
}

/**
 * Measure freeze resistance (edge case handling)
 * @example
 * const m = measureResisting(content)
 * console.log(m.freeze) // 'antifreeze-grade'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0

  const hasResilient = hasPrivate(content) && hasReadonly(content)
  const hasHardened = hasStrictEq(content) && hasReturnType(content)
  const hasRobust = hasDocComments(content) && hasInterface(content)
  const hasTough = hasGenerics(content) && hasAsync(content)
  const hasAdaptive = hasExport(content) && hasImport(content)
  const hasFlexible = hasPrivate(content) && hasGenerics(content)

  score += hasResilient ? 5 : 0
  score += hasHardened ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasFlexible ? 5 : 0

  const resistance = Math.min(score, 100)
  const brittleCount = count(/\bvar\b/, content)
  const fragileCount = count(/\bany\b/, content)

  const hasNoBrittle = brittleCount === 0
  const hasNoFragile = fragileCount === 0
  const hasNoCracking = !has(/\beval\b/, content)
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let freeze: FreezeGrade
  if (resistance >= 85) freeze = 'antifreeze-grade'
  else if (resistance >= 70) freeze = 'cold-resistant'
  else if (resistance >= 55) freeze = 'proper-handling'
  else if (resistance >= 40) freeze = 'brittle-in-cold'
  else if (resistance >= 25) freeze = 'freezing'
  else freeze = 'frozen-solid'

  return {
    resistance, freeze, hasHighResistance, hasResilient, hasHardened, hasNoBrittle,
    hasRobust, hasNoFragile, hasTough, hasNoCracking, hasAdaptive, hasNoRigid,
    hasFlexible, brittleCount, fragileCount,
  }
}

/**
 * Measure ice structure (structural integrity)
 * @example
 * const m = measureStructuring(content)
 * console.log(m.structure) // 'diamond-ice'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasSolid = hasClass(content) && hasInterface(content)
  const hasOrganized = hasExport(content) && hasImport(content)
  const hasStructured = hasGenerics(content) && hasTypeAlias(content)
  const hasCrystalline = hasAsync(content) && hasReturnType(content)
  const hasOrdered = hasPrivate(content) && hasReadonly(content)
  const hasRegular = hasClass(content) && hasGenerics(content)

  score += hasSolid ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasCrystalline ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasRegular ? 5 : 0

  const quality = Math.min(score, 100)
  const chaoticCount = count(/\bvar\b/, content)
  const amorphousCount = count(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoRandom = amorphousCount === 0
  const hasNoAmorphous = !has(/\beval\b/, content)
  const hasNoDisordered = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let structure: StructureGrade
  if (quality >= 85) structure = 'diamond-ice'
  else if (quality >= 70) structure = 'glacier-solid'
  else if (quality >= 55) structure = 'proper-ice'
  else if (quality >= 40) structure = 'slush'
  else if (quality >= 25) structure = 'thin-ice'
  else structure = 'no-structure'

  return {
    quality, structure, hasHighQuality, hasSolid, hasOrganized, hasNoChaotic,
    hasStructured, hasNoRandom, hasCrystalline, hasNoAmorphous, hasOrdered,
    hasNoDisordered, hasRegular, chaoticCount, amorphousCount,
  }
}

/**
 * Measure snowflake uniqueness (code originality)
 * @example
 * const m = measureUniqueing(content)
 * console.log(m.flake) // 'unique-crystal'
 */
export function measureUniqueing(content: string): UniqueingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasOriginal = hasNamedExport(content) && hasGenerics(content)
  const hasDistinct = hasTypeAlias(content) && hasAsync(content)
  const hasCreative = hasDocComments(content) && hasInterface(content)
  const hasInnovative = hasReturnType(content) && hasStrictEq(content)
  const hasFresh = hasReadonly(content) && hasPrivate(content)
  const hasInventive = hasGenerics(content) && hasNamedExport(content)

  score += hasOriginal ? 5 : 0
  score += hasDistinct ? 5 : 0
  score += hasCreative ? 5 : 0
  score += hasInnovative ? 5 : 0
  score += hasFresh ? 5 : 0
  score += hasInventive ? 5 : 0

  const uniqueness = Math.min(score, 100)
  const derivativeCount = count(/\bvar\b/, content)
  const clonedCount = count(/\bany\b/, content)

  const hasNoDerivative = derivativeCount === 0
  const hasNoCloned = clonedCount === 0
  const hasNoFormulaic = !has(/\beval\b/, content)
  const hasNoStale = !has(/\bdebugger\b/, content)
  const hasHighUniqueness = uniqueness >= 70

  let flake: UniquenessGrade
  if (uniqueness >= 85) flake = 'unique-crystal'
  else if (uniqueness >= 70) flake = 'distinct-pattern'
  else if (uniqueness >= 55) flake = 'proper-design'
  else if (uniqueness >= 40) flake = 'generic-template'
  else if (uniqueness >= 25) flake = 'cookie-cutter'
  else flake = 'identical-copy'

  return {
    uniqueness, flake, hasHighUniqueness, hasOriginal, hasDistinct, hasNoDerivative,
    hasCreative, hasNoCloned, hasInnovative, hasNoFormulaic, hasFresh, hasNoStale,
    hasInventive, derivativeCount, clonedCount,
  }
}

/**
 * Measure permafrost stability (long-term stability)
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.permafrost) // 'deep-permafrost'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasStable = hasInterface(content) && hasClass(content)
  const hasEnduring = hasExport(content) && hasImport(content)
  const hasPermanent = hasGenerics(content) && hasTypeAlias(content)
  const hasReliable = hasConst(content) && hasExport(content)
  const hasSolid = hasReadonly(content) && hasPrivate(content)
  const hasLasting = hasReturnType(content) && hasInterface(content)

  score += hasStable ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasPermanent ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasLasting ? 5 : 0

  const stability = Math.min(score, 100)
  const shiftingCount = count(/\bvar\b/, content)
  const volatileCount = count(/\bany\b/, content)

  const hasNoShifting = shiftingCount === 0
  const hasNoVolatile = volatileCount === 0
  const hasNoUnpredictable = !has(/\beval\b/, content)
  const hasNoUnstable = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let permafrost: PermafrostGrade
  if (stability >= 85) permafrost = 'deep-permafrost'
  else if (stability >= 70) permafrost = 'stable-ground'
  else if (stability >= 55) permafrost = 'proper-foundation'
  else if (stability >= 40) permafrost = 'thawing'
  else if (stability >= 25) permafrost = 'sinking'
  else permafrost = 'melted'

  return {
    stability, permafrost, hasHighStability, hasStable, hasEnduring, hasNoShifting,
    hasPermanent, hasNoVolatile, hasReliable, hasNoUnpredictable, hasSolid,
    hasNoUnstable, hasLasting, shiftingCount, volatileCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify frost condition
 * @example
 * classifyFrostCondition(90) // 'ice-palace'
 */
export function classifyFrostCondition(score: number): FrostCondition {
  if (score >= 85) return 'ice-palace'
  if (score >= 70) return 'frost-garden'
  if (score >= 55) return 'proper-frost'
  if (score >= 40) return 'slush-puddle'
  if (score >= 25) return 'ice-shard'
  return 'dry-ground'
}

/**
 * Classify landscape type
 * @example
 * classifyLandscapeType(crystals) // 'arctic-tundra'
 */
export function classifyLandscapeType(crystals: FrostCrystal[]): LandscapeType {
  if (crystals.length === 0) return 'no-snow'
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)
  const palaceRatio = crystals.filter(c => c.condition === 'ice-palace').length / crystals.length
  if (avgQs >= 75 && palaceRatio >= 0.5) return 'arctic-tundra'
  if (avgQs >= 60) return 'winter-wonderland'
  if (avgQs >= 45) return 'frozen-lake'
  if (avgQs >= 30) return 'frost-morning'
  if (avgQs >= 15) return 'light-dusting'
  return 'no-snow'
}

/**
 * Classify landscape condition
 * @example
 * classifyLandscapeCondition(80) // 'pristine-winter'
 */
export function classifyLandscapeCondition(avgQs: number): LandscapeCondition {
  if (avgQs >= 75) return 'pristine-winter'
  if (avgQs >= 60) return 'beautiful-frost'
  if (avgQs >= 45) return 'proper-cold'
  if (avgQs >= 30) return 'thawing'
  if (avgQs >= 15) return 'slushy'
  return 'spring'
}

/**
 * Classify cryomancer grade
 * @example
 * classifyCryomancerGrade(85) // 'ice-archmage'
 */
export function classifyCryomancerGrade(avgFrost: number): CryomancerGrade {
  if (avgFrost >= 80) return 'ice-archmage'
  if (avgFrost >= 65) return 'frost-wizard'
  if (avgFrost >= 50) return 'winter-sage'
  if (avgFrost >= 35) return 'cold-acolyte'
  if (avgFrost >= 20) return 'novice'
  return 'snowman'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(crystals, landscapes, tundra, stats)
 */
export function generateRecommendations(
  crystals: FrostCrystal[],
  landscapes: WinterLandscape[],
  tundra: TundraSummary,
  stats: WinterFrostStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCrystalClarity < 50) {
    recs.push('Improve crystal clarity with return types, strict equality, and clear documentation')
  }
  if (stats.avgFreezeResistance < 50) {
    recs.push('Strengthen freeze resistance with private access, readonly properties, and robust error handling')
  }
  if (stats.avgIceStructure < 50) {
    recs.push('Reinforce ice structure with solid classes, organized interfaces, and crystalline type patterns')
  }
  if (stats.avgSnowflakeUniqueness < 50) {
    recs.push('Enhance snowflake uniqueness with original generics, distinct type aliases, and creative patterns')
  }
  if (stats.avgPermafrostStability < 50) {
    recs.push('Bolster permafrost stability with stable interfaces, enduring exports, and permanent type foundations')
  }
  if (stats.dryGroundCount > 0) {
    recs.push(`${stats.dryGroundCount} file(s) are dry ground — consider significant refactoring`)
  }
  if (tundra.overallFrost < 40) {
    recs.push('Overall winter frost is poor — focus on crystal clarity and ice structure first')
  }
  const allDry = landscapes.every(l => l.landscapeType === 'no-snow' || l.landscapeType === 'light-dusting')
  if (allDry && landscapes.length > 0) {
    recs.push('All landscapes are light dustings or bare — consider a major quality overhaul')
  }
  const dry = crystals.filter(c => c.condition === 'dry-ground').map(c => c.file)
  if (dry.length > 0 && dry.length <= 3) {
    recs.push(`Transform these dry ground files into ice crystals: ${dry.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your winter landscape is pristine! Every crystal displays perfect frost patterns')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as frost crystal
 * @example
 * const crystal = analyzeFrostCrystal(content, 'index.ts')
 * console.log(crystal.condition) // 'ice-palace'
 */
export function analyzeFrostCrystal(content: string, filePath: string): FrostCrystal {
  const clarifying = measureClarifying(content)
  const resisting = measureResisting(content)
  const structuring = measureStructuring(content)
  const uniqueing = measureUniqueing(content)
  const stabilizing = measureStabilizing(content)

  const qualityScore = Math.round(
    clarifying.clarity * 0.2 +
    resisting.resistance * 0.2 +
    structuring.quality * 0.2 +
    uniqueing.uniqueness * 0.2 +
    stabilizing.stability * 0.2,
  )

  return {
    file: filePath,
    crystalClarity: clarifying.clarity,
    freezeResistance: resisting.resistance,
    iceStructure: structuring.quality,
    snowflakeUniqueness: uniqueing.uniqueness,
    permafrostStability: stabilizing.stability,
    clarifying,
    resisting,
    structuring,
    uniqueing,
    stabilizing,
    condition: classifyFrostCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a winter landscape
 * @example
 * const landscape = analyzeWinterLandscape(crystals, 'src')
 * console.log(landscape.landscapeType) // 'arctic-tundra'
 */
export function analyzeWinterLandscape(crystals: FrostCrystal[], dirPath: string): WinterLandscape {
  if (crystals.length === 0) {
    return {
      directory: dirPath, crystals: [], avgClarity: 0, avgStructure: 0, avgStability: 0,
      icePalaceCount: 0, dryGroundCount: 0, landscapeType: 'no-snow', condition: 'spring',
    }
  }

  const avgClarity = Math.round(crystals.reduce((s, c) => s + c.crystalClarity, 0) / crystals.length)
  const avgStructure = Math.round(crystals.reduce((s, c) => s + c.iceStructure, 0) / crystals.length)
  const avgStability = Math.round(crystals.reduce((s, c) => s + c.permafrostStability, 0) / crystals.length)
  const icePalaceCount = crystals.filter(c => c.condition === 'ice-palace').length
  const dryGroundCount = crystals.filter(c => c.condition === 'dry-ground').length
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)

  return {
    directory: dirPath, crystals, avgClarity, avgStructure, avgStability,
    icePalaceCount, dryGroundCount, landscapeType: classifyLandscapeType(crystals),
    condition: classifyLandscapeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete winter frost result
 * @example
 * const result = await buildWinterFrostResult(files, contents)
 * console.log(result.stats.cryomancerGrade) // 'ice-archmage'
 */
export async function buildWinterFrostResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<WinterFrostResult> {
  const crystals = files.map((file, i) => analyzeFrostCrystal(contents[i] ?? '', file))

  const dirMap = new Map<string, FrostCrystal[]>()
  for (const crystal of crystals) {
    const dir = path.dirname(crystal.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(crystal) } else { dirMap.set(dir, [crystal]) }
  }

  const landscapes = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeWinterLandscape(dirCrystals, dir),
  )

  const avgClarity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.crystalClarity, 0) / crystals.length) : 0
  const avgStructure = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.iceStructure, 0) / crystals.length) : 0
  const avgStability = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.permafrostStability, 0) / crystals.length) : 0

  const overallFrost = crystals.length > 0
    ? Math.round((avgClarity + avgStructure + avgStability) / 3) : 0
  const isCrystalline = avgClarity >= 60

  const tundra: TundraSummary = { avgClarity, avgStructure, avgStability, isCrystalline, overallFrost }

  const avgFreezeResistance = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.freezeResistance, 0) / crystals.length) : 0
  const avgSnowflakeUniqueness = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.snowflakeUniqueness, 0) / crystals.length) : 0
  const avgPermafrostStability = avgStability

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const clearest = crystals.length > 0
    ? crystals.reduce((best, c) => c.crystalClarity > best.crystalClarity ? c : best).file : ''
  const mostResistant = crystals.length > 0
    ? crystals.reduce((best, c) => c.freezeResistance > best.freezeResistance ? c : best).file : ''
  const bestStructured = crystals.length > 0
    ? crystals.reduce((best, c) => c.iceStructure > best.iceStructure ? c : best).file : ''
  const mostUnique = crystals.length > 0
    ? crystals.reduce((best, c) => c.snowflakeUniqueness > best.snowflakeUniqueness ? c : best).file : ''

  const stats: WinterFrostStats = {
    totalFiles: crystals.length,
    totalLandscapes: landscapes.length,
    avgCrystalClarity: avgClarity,
    avgFreezeResistance,
    avgIceStructure: avgStructure,
    avgSnowflakeUniqueness,
    avgPermafrostStability,
    icePalaceCount: crystals.filter(c => c.condition === 'ice-palace').length,
    frostGardenCount: crystals.filter(c => c.condition === 'frost-garden').length,
    properFrostCount: crystals.filter(c => c.condition === 'proper-frost').length,
    slushPuddleCount: crystals.filter(c => c.condition === 'slush-puddle').length,
    iceShardCount: crystals.filter(c => c.condition === 'ice-shard').length,
    dryGroundCount: crystals.filter(c => c.condition === 'dry-ground').length,
    hasHighClarityCount: crystals.filter(c => c.clarifying.hasHighClarity).length,
    hasHighResistanceCount: crystals.filter(c => c.resisting.hasHighResistance).length,
    hasHighQualityCount: crystals.filter(c => c.structuring.hasHighQuality).length,
    hasHighUniquenessCount: crystals.filter(c => c.uniqueing.hasHighUniqueness).length,
    hasHighStabilityCount: crystals.filter(c => c.stabilizing.hasHighStability).length,
    overallFrost,
    cryomancerGrade: classifyCryomancerGrade(overallFrost),
    bestCrystal, clearest, mostResistant, bestStructured, mostUnique,
  }

  const recommendations = generateRecommendations(crystals, landscapes, tundra, stats)

  return { crystals, landscapes, tundra, stats, recommendations }
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
