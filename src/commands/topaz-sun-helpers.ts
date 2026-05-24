// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Warmth glow grade */
export type WarmthGrade =
  | 'golden-sun'
  | 'warm-amber'
  | 'proper-glow'
  | 'cool-light'
  | 'dim-glow'
  | 'dark'

/** Hardness strength grade */
export type HardnessGrade =
  | 'topaz-grade'
  | 'proper-hard'
  | 'good-strength'
  | 'medium-strength'
  | 'soft-stone'
  | 'crumbly'

/** Crystal clarity grade */
export type ClarityGrade =
  | 'flawless-crystal'
  | 'clear-topaz'
  | 'proper-clarity'
  | 'included'
  | 'cloudy'
  | 'opaque'

/** Color vibrancy grade */
export type VibrancyGrade =
  | 'imperial-topaz'
  | 'golden-yellow'
  | 'proper-amber'
  | 'pale-yellow'
  | 'faded'
  | 'colorless'

/** Refraction grade */
export type RefractionGrade =
  | 'double-refraction'
  | 'proper-birefringence'
  | 'multi-angle'
  | 'single-angle'
  | 'flat-view'
  | 'no-depth'

/** Topaz condition */
export type TopazCondition =
  | 'imperial-topaz'
  | 'golden-gem'
  | 'proper-topaz'
  | 'smoky-quartz'
  | 'pebble'
  | 'sand'

/** Deposit type */
export type DepositType =
  | 'brazilian-mine'
  | 'ural-mountains'
  | 'proper-deposit'
  | 'alluvial'
  | 'surface-find'
  | 'no-deposit'

/** Deposit condition */
export type DepositCondition =
  | 'golden-vein'
  | 'rich-seam'
  | 'decent-yield'
  | 'low-grade'
  | 'exhausted'
  | 'barren'

/** Jeweler grade */
export type JewelerGrade =
  | 'master-lapidary'
  | 'gem-expert'
  | 'skilled-cutter'
  | 'appraiser'
  | 'novice'
  | 'rock-hound'

/** Glowing measurement */
export interface GlowingMeasure {
  warmth: number
  grade: WarmthGrade
  hasHighWarmth: boolean
  hasFriendly: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasWelcoming: boolean
  hasNoDistant: boolean
  hasInviting: boolean
  hasNoCold: boolean
  hasWarm: boolean
  hasNoFrosty: boolean
  hasComfortable: boolean
  hostileCount: number
  distantCount: number
}

/** Strengthening measurement */
export interface StrengtheningMeasure {
  strength: number
  hardness: HardnessGrade
  hasHighStrength: boolean
  hasDurable: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoWeak: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasSolid: boolean
  hasNoBrittle: boolean
  hasHardy: boolean
  fragileCount: number
  weakCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  crystal: ClarityGrade
  hasHighClarity: boolean
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

/** Vibranting measurement */
export interface VibrantingMeasure {
  vibrancy: number
  color: VibrancyGrade
  hasHighVibrancy: boolean
  hasExpressive: boolean
  hasVivid: boolean
  hasNoDull: boolean
  hasColorful: boolean
  hasNoDrab: boolean
  hasDynamic: boolean
  hasNoFlat: boolean
  hasLively: boolean
  hasNoLifeless: boolean
  hasRich: boolean
  dullCount: number
  drabCount: number
}

/** Refracting measurement */
export interface RefractingMeasure {
  quality: number
  refraction: RefractionGrade
  hasHighQuality: boolean
  hasMultifaceted: boolean
  hasVersatile: boolean
  hasNoOneDimensional: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasLayered: boolean
  hasNoFlat2: boolean
  hasComplex: boolean
  hasNoSimple: boolean
  hasAdaptive: boolean
  oneDimensionalCount: number
  rigidCount: number
}

/** Single file analysis */
export interface TopazRay {
  file: string
  warmthGlow: number
  hardnessStrength: number
  crystalClarity: number
  colorVibrancy: number
  dualRefraction: number
  glowing: GlowingMeasure
  strengthening: StrengtheningMeasure
  clarifying: ClarifyingMeasure
  vibranting: VibrantingMeasure
  refracting: RefractingMeasure
  condition: TopazCondition
  qualityScore: number
}

/** Directory-level deposit */
export interface TopazDeposit {
  directory: string
  rays: TopazRay[]
  avgWarmth: number
  avgStrength: number
  avgClarity: number
  imperialTopazCount: number
  sandCount: number
  depositType: DepositType
  condition: DepositCondition
}

/** Sunshine summary */
export interface SunshineSummary {
  avgWarmth: number
  avgStrength: number
  avgClarity: number
  isGolden: boolean
  overallBrilliance: number
}

/** Full stats */
export interface TopazSunStats {
  totalFiles: number
  totalDeposits: number
  avgWarmthGlow: number
  avgHardnessStrength: number
  avgCrystalClarity: number
  avgColorVibrancy: number
  avgDualRefraction: number
  imperialTopazCount: number
  goldenGemCount: number
  properTopazCount: number
  smokyQuartzCount: number
  pebbleCount: number
  sandCount: number
  hasHighWarmthCount: number
  hasHighStrengthCount: number
  hasHighClarityCount: number
  hasHighVibrancyCount: number
  hasHighQualityCount: number
  overallBrilliance: number
  jewelerGrade: JewelerGrade
  bestRay: string
  warmest: string
  strongest: string
  clearest: string
  mostVibrant: string
}

/** Full result */
export interface TopazSunResult {
  rays: TopazRay[]
  deposits: TopazDeposit[]
  sunshine: SunshineSummary
  stats: TopazSunStats
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
 * Measure warmth glow
 * @example
 * const m = measureGlowing(content)
 * console.log(m.grade) // 'golden-sun'
 */
export function measureGlowing(content: string): GlowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasFriendly = hasDocComments(content) && hasExport(content)
  const hasApproachable = hasReturnType(content) && hasInterface(content)
  const hasWelcoming = hasGenerics(content) && hasConst(content)
  const hasInviting = hasTypeAlias(content) && hasAsync(content)
  const hasWarm = hasClass(content) && hasDocComments(content)
  const hasComfortable = hasNamedExport(content) && hasExport(content)

  score += hasFriendly ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasWelcoming ? 5 : 0
  score += hasInviting ? 5 : 0
  score += hasWarm ? 5 : 0
  score += hasComfortable ? 5 : 0

  const warmth = Math.min(score, 100)
  const hostileCount = count(/\bvar\b/, content)
  const distantCount = count(/\bany\b/, content)

  const hasNoHostile = hostileCount === 0
  const hasNoDistant = distantCount === 0
  const hasNoCold = !has(/\beval\b/, content)
  const hasNoFrosty = !has(/\bdebugger\b/, content)
  const hasHighWarmth = warmth >= 70

  let grade: WarmthGrade
  if (warmth >= 85) grade = 'golden-sun'
  else if (warmth >= 70) grade = 'warm-amber'
  else if (warmth >= 55) grade = 'proper-glow'
  else if (warmth >= 40) grade = 'cool-light'
  else if (warmth >= 25) grade = 'dim-glow'
  else grade = 'dark'

  return {
    warmth, grade, hasHighWarmth, hasFriendly, hasApproachable, hasNoHostile,
    hasWelcoming, hasNoDistant, hasInviting, hasNoCold, hasWarm,
    hasNoFrosty, hasComfortable, hostileCount, distantCount,
  }
}

/**
 * Measure hardness strength
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.hardness) // 'topaz-grade'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasDurable = hasExport(content) && hasImport(content)
  const hasRobust = hasPrivate(content) && hasReadonly(content)
  const hasTough = hasInterface(content) && hasClass(content)
  const hasResilient = hasStrictEq(content) && hasReturnType(content)
  const hasSolid = hasGenerics(content) && hasAsync(content)
  const hasHardy = hasExport(content) && hasGenerics(content)

  score += hasDurable ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasHardy ? 5 : 0

  const strength = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const weakCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoWeak = weakCount === 0
  const hasNoBreakable = !has(/\beval\b/, content)
  const hasNoBrittle = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let hardness: HardnessGrade
  if (strength >= 85) hardness = 'topaz-grade'
  else if (strength >= 70) hardness = 'proper-hard'
  else if (strength >= 55) hardness = 'good-strength'
  else if (strength >= 40) hardness = 'medium-strength'
  else if (strength >= 25) hardness = 'soft-stone'
  else hardness = 'crumbly'

  return {
    strength, hardness, hasHighStrength, hasDurable, hasRobust, hasNoFragile,
    hasTough, hasNoWeak, hasResilient, hasNoBreakable, hasSolid, hasNoBrittle,
    hasHardy, fragileCount, weakCount,
  }
}

/**
 * Measure crystal clarity
 * @example
 * const m = measureClarifying(content)
 * console.log(m.crystal) // 'flawless-crystal'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasTransparent = hasDocComments(content) && hasInterface(content)
  const hasClear = hasGenerics(content) && hasTypeAlias(content)
  const hasVisible = hasReadonly(content) && hasReturnType(content)
  const hasRevealing = hasStrictEq(content) && hasPrivate(content)
  const hasOpen = hasConst(content) && hasInterface(content)
  const hasLucid = hasClass(content) && hasDocComments(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasOpen ? 5 : 0
  score += hasLucid ? 5 : 0

  const clarity = Math.min(score, 100)
  const opaqueCount = count(/\bvar\b/, content)
  const hiddenCount = count(/\bany\b/, content)

  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoConcealing = !has(/\beval\b/, content)
  const hasNoSecret = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let crystal: ClarityGrade
  if (clarity >= 85) crystal = 'flawless-crystal'
  else if (clarity >= 70) crystal = 'clear-topaz'
  else if (clarity >= 55) crystal = 'proper-clarity'
  else if (clarity >= 40) crystal = 'included'
  else if (clarity >= 25) crystal = 'cloudy'
  else crystal = 'opaque'

  return {
    clarity, crystal, hasHighClarity, hasTransparent, hasClear, hasNoOpaque,
    hasVisible, hasNoHidden, hasRevealing, hasNoConcealing, hasOpen,
    hasNoSecret, hasLucid, opaqueCount, hiddenCount,
  }
}

/**
 * Measure color vibrancy
 * @example
 * const m = measureVibranting(content)
 * console.log(m.color) // 'imperial-topaz'
 */
export function measureVibranting(content: string): VibrantingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasExpressive = hasNamedExport(content) && hasExport(content)
  const hasVivid = hasInterface(content) && hasGenerics(content)
  const hasColorful = hasTypeAlias(content) && hasAsync(content)
  const hasDynamic = hasImport(content) && hasClass(content)
  const hasLively = hasReturnType(content) && hasConst(content)
  const hasRich = hasNamedExport(content) && hasInterface(content)

  score += hasExpressive ? 5 : 0
  score += hasVivid ? 5 : 0
  score += hasColorful ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasLively ? 5 : 0
  score += hasRich ? 5 : 0

  const vibrancy = Math.min(score, 100)
  const dullCount = count(/\bvar\b/, content)
  const drabCount = count(/\bany\b/, content)

  const hasNoDull = dullCount === 0
  const hasNoDrab = drabCount === 0
  const hasNoFlat = !has(/\beval\b/, content)
  const hasNoLifeless = !has(/\bdebugger\b/, content)
  const hasHighVibrancy = vibrancy >= 70

  let color: VibrancyGrade
  if (vibrancy >= 85) color = 'imperial-topaz'
  else if (vibrancy >= 70) color = 'golden-yellow'
  else if (vibrancy >= 55) color = 'proper-amber'
  else if (vibrancy >= 40) color = 'pale-yellow'
  else if (vibrancy >= 25) color = 'faded'
  else color = 'colorless'

  return {
    vibrancy, color, hasHighVibrancy, hasExpressive, hasVivid, hasNoDull,
    hasColorful, hasNoDrab, hasDynamic, hasNoFlat, hasLively, hasNoLifeless,
    hasRich, dullCount, drabCount,
  }
}

/**
 * Measure dual refraction
 * @example
 * const m = measureRefracting(content)
 * console.log(m.refraction) // 'double-refraction'
 */
export function measureRefracting(content: string): RefractingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasMultifaceted = hasReturnType(content) && hasStrictEq(content)
  const hasVersatile = hasReadonly(content) && hasPrivate(content)
  const hasFlexible = hasInterface(content) && hasGenerics(content)
  const hasLayered = hasTypeAlias(content) && hasDocComments(content)
  const hasComplex = hasClass(content) && hasReturnType(content)
  const hasAdaptive = hasConst(content) && hasStrictEq(content)

  score += hasMultifaceted ? 5 : 0
  score += hasVersatile ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasComplex ? 5 : 0
  score += hasAdaptive ? 5 : 0

  const quality = Math.min(score, 100)
  const oneDimensionalCount = count(/\bvar\b/, content)
  const rigidCount = count(/\bany\b/, content)

  const hasNoOneDimensional = oneDimensionalCount === 0
  const hasNoRigid = rigidCount === 0
  const hasNoFlat2 = !has(/\beval\b/, content)
  const hasNoSimple = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let refraction: RefractionGrade
  if (quality >= 85) refraction = 'double-refraction'
  else if (quality >= 70) refraction = 'proper-birefringence'
  else if (quality >= 55) refraction = 'multi-angle'
  else if (quality >= 40) refraction = 'single-angle'
  else if (quality >= 25) refraction = 'flat-view'
  else refraction = 'no-depth'

  return {
    quality, refraction, hasHighQuality, hasMultifaceted, hasVersatile,
    hasNoOneDimensional, hasFlexible, hasNoRigid, hasLayered, hasNoFlat2,
    hasComplex, hasNoSimple, hasAdaptive, oneDimensionalCount, rigidCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify topaz condition
 * @example
 * classifyTopazCondition(90) // 'imperial-topaz'
 */
export function classifyTopazCondition(score: number): TopazCondition {
  if (score >= 85) return 'imperial-topaz'
  if (score >= 70) return 'golden-gem'
  if (score >= 55) return 'proper-topaz'
  if (score >= 40) return 'smoky-quartz'
  if (score >= 25) return 'pebble'
  return 'sand'
}

/**
 * Classify deposit type
 * @example
 * classifyDepositType(rays) // 'brazilian-mine'
 */
export function classifyDepositType(rays: TopazRay[]): DepositType {
  if (rays.length === 0) return 'no-deposit'
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const imperialRatio = rays.filter(r => r.condition === 'imperial-topaz').length / rays.length
  if (avgQs >= 75 && imperialRatio >= 0.5) return 'brazilian-mine'
  if (avgQs >= 60) return 'ural-mountains'
  if (avgQs >= 45) return 'proper-deposit'
  if (avgQs >= 30) return 'alluvial'
  if (avgQs >= 15) return 'surface-find'
  return 'no-deposit'
}

/**
 * Classify deposit condition
 * @example
 * classifyDepositCondition(80) // 'golden-vein'
 */
export function classifyDepositCondition(avgQs: number): DepositCondition {
  if (avgQs >= 75) return 'golden-vein'
  if (avgQs >= 60) return 'rich-seam'
  if (avgQs >= 45) return 'decent-yield'
  if (avgQs >= 30) return 'low-grade'
  if (avgQs >= 15) return 'exhausted'
  return 'barren'
}

/**
 * Classify jeweler grade
 * @example
 * classifyJewelerGrade(85) // 'master-lapidary'
 */
export function classifyJewelerGrade(avgBrilliance: number): JewelerGrade {
  if (avgBrilliance >= 80) return 'master-lapidary'
  if (avgBrilliance >= 65) return 'gem-expert'
  if (avgBrilliance >= 50) return 'skilled-cutter'
  if (avgBrilliance >= 35) return 'appraiser'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-hound'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(rays, deposits, sunshine, stats)
 */
export function generateRecommendations(
  rays: TopazRay[],
  deposits: TopazDeposit[],
  sunshine: SunshineSummary,
  stats: TopazSunStats,
): string[] {
  const recs: string[] = []
  if (stats.avgWarmthGlow < 50) {
    recs.push('Increase warmth glow with friendly doc comments, approachable return types, and welcoming named exports')
  }
  if (stats.avgHardnessStrength < 50) {
    recs.push('Strengthen hardness with durable imports, robust private fields, and tough interface foundations')
  }
  if (stats.avgCrystalClarity < 50) {
    recs.push('Improve crystal clarity with transparent doc comments, clear generics, and visible readonly patterns')
  }
  if (stats.avgColorVibrancy < 50) {
    recs.push('Boost color vibrancy with expressive named exports, vivid interfaces, and colorful type transformations')
  }
  if (stats.avgDualRefraction < 50) {
    recs.push('Enhance dual refraction with multifaceted return types, versatile readonly guards, and flexible type definitions')
  }
  if (stats.sandCount > 0) {
    recs.push(`${stats.sandCount} file(s) are sand — consider significant refactoring`)
  }
  if (sunshine.overallBrilliance < 40) {
    recs.push('Overall topaz brilliance is poor — focus on warmth glow and hardness first')
  }
  const allEmpty = deposits.every(d => d.depositType === 'no-deposit' || d.depositType === 'surface-find')
  if (allEmpty && deposits.length > 0) {
    recs.push('All deposits are surface finds or empty — consider a major quality overhaul')
  }
  const sand = rays.filter(r => r.condition === 'sand').map(r => r.file)
  if (sand.length > 0 && sand.length <= 3) {
    recs.push(`Polish these sand files into topaz: ${sand.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your topaz collection is master-lapidary quality! Every gem glows with golden sunshine')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as topaz ray
 * @example
 * const ray = analyzeTopazRay(content, 'index.ts')
 * console.log(ray.condition) // 'imperial-topaz'
 */
export function analyzeTopazRay(content: string, filePath: string): TopazRay {
  const glowing = measureGlowing(content)
  const strengthening = measureStrengthening(content)
  const clarifying = measureClarifying(content)
  const vibranting = measureVibranting(content)
  const refracting = measureRefracting(content)

  const qualityScore = Math.round(
    glowing.warmth * 0.2 +
    strengthening.strength * 0.2 +
    clarifying.clarity * 0.2 +
    vibranting.vibrancy * 0.2 +
    refracting.quality * 0.2,
  )

  return {
    file: filePath,
    warmthGlow: glowing.warmth,
    hardnessStrength: strengthening.strength,
    crystalClarity: clarifying.clarity,
    colorVibrancy: vibranting.vibrancy,
    dualRefraction: refracting.quality,
    glowing,
    strengthening,
    clarifying,
    vibranting,
    refracting,
    condition: classifyTopazCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a topaz deposit
 * @example
 * const deposit = analyzeTopazDeposit(rays, 'src')
 * console.log(deposit.depositType) // 'brazilian-mine'
 */
export function analyzeTopazDeposit(rays: TopazRay[], dirPath: string): TopazDeposit {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [], avgWarmth: 0, avgStrength: 0, avgClarity: 0,
      imperialTopazCount: 0, sandCount: 0, depositType: 'no-deposit', condition: 'barren',
    }
  }

  const avgWarmth = Math.round(rays.reduce((s, r) => s + r.warmthGlow, 0) / rays.length)
  const avgStrength = Math.round(rays.reduce((s, r) => s + r.hardnessStrength, 0) / rays.length)
  const avgClarity = Math.round(rays.reduce((s, r) => s + r.crystalClarity, 0) / rays.length)
  const imperialTopazCount = rays.filter(r => r.condition === 'imperial-topaz').length
  const sandCount = rays.filter(r => r.condition === 'sand').length
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)

  return {
    directory: dirPath, rays, avgWarmth, avgStrength, avgClarity,
    imperialTopazCount, sandCount, depositType: classifyDepositType(rays),
    condition: classifyDepositCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete topaz sun result
 * @example
 * const result = await buildTopazSunResult(files, contents)
 * console.log(result.stats.jewelerGrade) // 'master-lapidary'
 */
export async function buildTopazSunResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TopazSunResult> {
  const rays = files.map((file, i) => analyzeTopazRay(contents[i] ?? '', file))

  const dirMap = new Map<string, TopazRay[]>()
  for (const ray of rays) {
    const dir = path.dirname(ray.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ray) } else { dirMap.set(dir, [ray]) }
  }

  const deposits = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeTopazDeposit(dirRays, dir),
  )

  const avgWarmth = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.warmthGlow, 0) / rays.length) : 0
  const avgStrength = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.hardnessStrength, 0) / rays.length) : 0
  const avgClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.crystalClarity, 0) / rays.length) : 0

  const overallBrilliance = rays.length > 0
    ? Math.round((avgWarmth + avgStrength + avgClarity) / 3) : 0
  const isGolden = avgWarmth >= 60

  const sunshine: SunshineSummary = { avgWarmth, avgStrength, avgClarity, isGolden, overallBrilliance }

  const avgColorVibrancy = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.colorVibrancy, 0) / rays.length) : 0
  const avgDualRefraction = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.dualRefraction, 0) / rays.length) : 0

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const warmest = rays.length > 0
    ? rays.reduce((best, r) => r.warmthGlow > best.warmthGlow ? r : best).file : ''
  const strongest = rays.length > 0
    ? rays.reduce((best, r) => r.hardnessStrength > best.hardnessStrength ? r : best).file : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => r.crystalClarity > best.crystalClarity ? r : best).file : ''
  const mostVibrant = rays.length > 0
    ? rays.reduce((best, r) => r.colorVibrancy > best.colorVibrancy ? r : best).file : ''

  const stats: TopazSunStats = {
    totalFiles: rays.length,
    totalDeposits: deposits.length,
    avgWarmthGlow: avgWarmth,
    avgHardnessStrength: avgStrength,
    avgCrystalClarity: avgClarity,
    avgColorVibrancy,
    avgDualRefraction,
    imperialTopazCount: rays.filter(r => r.condition === 'imperial-topaz').length,
    goldenGemCount: rays.filter(r => r.condition === 'golden-gem').length,
    properTopazCount: rays.filter(r => r.condition === 'proper-topaz').length,
    smokyQuartzCount: rays.filter(r => r.condition === 'smoky-quartz').length,
    pebbleCount: rays.filter(r => r.condition === 'pebble').length,
    sandCount: rays.filter(r => r.condition === 'sand').length,
    hasHighWarmthCount: rays.filter(r => r.glowing.hasHighWarmth).length,
    hasHighStrengthCount: rays.filter(r => r.strengthening.hasHighStrength).length,
    hasHighClarityCount: rays.filter(r => r.clarifying.hasHighClarity).length,
    hasHighVibrancyCount: rays.filter(r => r.vibranting.hasHighVibrancy).length,
    hasHighQualityCount: rays.filter(r => r.refracting.hasHighQuality).length,
    overallBrilliance,
    jewelerGrade: classifyJewelerGrade(overallBrilliance),
    bestRay, warmest, strongest, clearest, mostVibrant,
  }

  const recommendations = generateRecommendations(rays, deposits, sunshine, stats)

  return { rays, deposits, sunshine, stats, recommendations }
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
