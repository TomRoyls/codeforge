// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Forging grade */
export type ForgingGrade =
  | 'masterwork-silver'
  | 'quality-moonlight'
  | 'proper-forge'
  | 'daylight-only'
  | 'dim-workshop'
  | 'dark-forge'

/** Temper grade */
export type TemperGrade =
  | 'master-tempered'
  | 'well-refined'
  | 'proper-temper'
  | 'rough-forged'
  | 'untempered'
  | 'raw-metal'

/** Craft grade */
export type CraftGrade =
  | 'shadow-master'
  | 'skilled-shaper'
  | 'proper-craft'
  | 'visible-only'
  | 'shadow-blind'
  | 'no-craft'

/** Phase grade */
export type PhaseGrade =
  | 'full-moon'
  | 'waxing-gibbous'
  | 'proper-cycle'
  | 'half-moon'
  | 'new-moon'
  | 'eclipse'

/** Starlight grade */
export type StarlightGrade =
  | 'north-star'
  | 'constellation-guide'
  | 'proper-aim'
  | 'lost-star'
  | 'cloudy-night'
  | 'no-stars'

/** Ingot condition */
export type IngotCondition =
  | 'celestial-ingot'
  | 'silver-masterpiece'
  | 'proper-ingot'
  | 'rough-metal'
  | 'tarnished-silver'
  | 'scrap'

/** Forge type */
export type ForgeType =
  | 'grand-moonforge'
  | 'silver-foundry'
  | 'proper-forge'
  | 'small-anvil'
  | 'cold-hearth'
  | 'no-forge'

/** Forge condition */
export type ForgeCondition =
  | 'celestial-foundry'
  | 'moonlit-workshop'
  | 'decent-forge'
  | 'dim-anvil'
  | 'dark-corner'
  | 'void'

/** Smith grade */
export type SmithGrade =
  | 'moon-master'
  | 'silver-smith'
  | 'skilled-forger'
  | 'apprentice'
  | 'novice'
  | 'blind-smith'

/** Forging measurement */
export interface ForgingMeasure {
  quality: number
  grade: ForgingGrade
  hasHighQuality: boolean
  hasProductionReady: boolean
  hasNoPrototypeCode: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasLogged: boolean
  hasNoSilent: boolean
  hasMonitored: boolean
  hasNoUntracked: boolean
  prototypeCodeCount: number
  fragileCount: number
}

/** Tempering measurement */
export interface TemperingMeasure {
  silver: number
  temper: TemperGrade
  hasHighSilver: boolean
  hasRefactored: boolean
  hasNoFirstDraft: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasIterated: boolean
  hasNoSinglePass: boolean
  hasReviewed: boolean
  hasNoUnreviewed: boolean
  hasImproved: boolean
  hasNoStagnant: boolean
  firstDraftCount: number
  roughCount: number
}

/** Crafting measurement */
export interface CraftingMeasure {
  shadow: number
  craft: CraftGrade
  hasHighShadow: boolean
  hasImplicitHandled: boolean
  hasEdgeCasesCovered: boolean
  hasNoUncovered: boolean
  hasSideEffectsControlled: boolean
  hasNoUncontrolled: boolean
  hasStateManaged: boolean
  hasNoLeaked: boolean
  hasHiddenProcessed: boolean
  hasNoIgnored: boolean
  hasAware: boolean
  uncoveredCount: number
  uncontrolledCount: number
}

/** Adapting measurement */
export interface AdaptingMeasure {
  adaptation: number
  phase: PhaseGrade
  hasHighAdaptation: boolean
  hasConfigurable: boolean
  hasEnvironmentAware: boolean
  hasNoHardcoded: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasResponsive: boolean
  hasNoFixed: boolean
  hasAdaptive: boolean
  hasNoRigid: boolean
  hasFlexible: boolean
  hardcodedCount: number
  staticCount: number
}

/** Precisioning measurement */
export interface PrecisioningMeasure {
  precision: number
  starlight: StarlightGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasValidated: boolean
  hasNoUnvalidated: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  approximateCount: number
  vagueCount: number
}

/** Single file analysis */
export interface MoonlitIngot {
  file: string
  nocturnalQuality: number
  silverTempering: number
  shadowCraft: number
  moonPhaseAdaptation: number
  starlightPrecision: number
  forging: ForgingMeasure
  tempering: TemperingMeasure
  crafting: CraftingMeasure
  adapting: AdaptingMeasure
  precisioning: PrecisioningMeasure
  condition: IngotCondition
  qualityScore: number
}

/** Directory-level forge */
export interface MoonForge {
  directory: string
  ingots: MoonlitIngot[]
  avgNocturnal: number
  avgTempering: number
  avgPrecision: number
  celestialIngotCount: number
  scrapCount: number
  forgeType: ForgeType
  condition: ForgeCondition
}

/** Night summary */
export interface NightSummary {
  avgNocturnal: number
  avgTempering: number
  avgPrecision: number
  isCelestial: boolean
  overallMoonlight: number
}

/** Full stats */
export interface MoonlitForgeStats {
  totalFiles: number
  totalForges: number
  avgNocturnalQuality: number
  avgSilverTempering: number
  avgShadowCraft: number
  avgMoonPhaseAdaptation: number
  avgStarlightPrecision: number
  celestialIngotCount: number
  silverMasterpieceCount: number
  properIngotCount: number
  roughMetalCount: number
  tarnishedSilverCount: number
  scrapCount: number
  hasHighQualityCount: number
  hasHighSilverCount: number
  hasHighShadowCount: number
  hasHighAdaptationCount: number
  hasHighPrecisionCount: number
  overallMoonlight: number
  smithGrade: SmithGrade
  bestIngot: string
  bestNocturnal: string
  bestTempered: string
  bestShadow: string
  mostPrecise: string
}

/** Full result */
export interface MoonlitForgeResult {
  ingots: MoonlitIngot[]
  forges: MoonForge[]
  night: NightSummary
  stats: MoonlitForgeStats
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
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasSwitch = (c: string) => has(/\bswitch\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure nocturnal quality (forging)
 * @example
 * const m = measureForging(content)
 * console.log(m.grade) // 'masterwork-silver'
 */
export function measureForging(content: string): ForgingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasProductionReady = hasExport(content) && hasReturnType(content)
  const hasRobust = hasTryCatch(content) && hasReturnType(content)
  const hasErrorHandled = hasTryCatch(content) && hasAsync(content)
  const hasLogged = hasTryCatch(content) || hasThrow(content)
  const hasMonitored = hasReturnType(content) && hasStrictEq(content)

  score += hasProductionReady ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasLogged ? 5 : 0
  score += hasMonitored ? 5 : 0

  const quality = Math.min(score, 100)
  const prototypeCodeCount = countMatches(/\bvar\b/, content)
  const fragileCount = countMatches(/\bany\b/, content)

  const hasNoPrototypeCode = prototypeCodeCount === 0
  const hasNoFragile = fragileCount === 0
  const hasNoBareCrash = !has(/\beval\b/, content)
  const hasNoSilent = !has(/\bdebugger\b/, content)
  const hasNoUntracked = !has(/\bconsole\.log\b/, content)
  const hasHighQuality = quality >= 70

  let grade: ForgingGrade
  if (quality >= 85) grade = 'masterwork-silver'
  else if (quality >= 70) grade = 'quality-moonlight'
  else if (quality >= 55) grade = 'proper-forge'
  else if (quality >= 40) grade = 'daylight-only'
  else if (quality >= 25) grade = 'dim-workshop'
  else grade = 'dark-forge'

  return {
    quality, grade, hasHighQuality, hasProductionReady, hasNoPrototypeCode,
    hasRobust, hasNoFragile, hasErrorHandled, hasNoBareCrash, hasLogged,
    hasNoSilent, hasMonitored, hasNoUntracked, prototypeCodeCount, fragileCount,
  }
}

/**
 * Measure silver tempering (tempering)
 * @example
 * const m = measureTempering(content)
 * console.log(m.temper) // 'master-tempered'
 */
export function measureTempering(content: string): TemperingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasRefactored = hasExport(content) && hasImport(content)
  const hasPolished = hasDocComments(content) && hasReturnType(content)
  const hasIterated = hasInterface(content) && hasGenerics(content)
  const hasReviewed = hasNamedExport(content) && hasStrictEq(content)
  const hasImproved = hasReadonly(content) && hasConst(content)

  score += hasRefactored ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasIterated ? 5 : 0
  score += hasReviewed ? 5 : 0
  score += hasImproved ? 5 : 0

  const silver = Math.min(score, 100)
  const firstDraftCount = countMatches(/\bvar\b/, content)
  const roughCount = countMatches(/\bany\b/, content)

  const hasNoFirstDraft = firstDraftCount === 0
  const hasNoRough = roughCount === 0
  const hasNoSinglePass = !has(/\beval\b/, content)
  const hasNoUnreviewed = !has(/\bdebugger\b/, content)
  const hasNoStagnant = !has(/\bconsole\.log\b/, content)
  const hasHighSilver = silver >= 70

  let temper: TemperGrade
  if (silver >= 85) temper = 'master-tempered'
  else if (silver >= 70) temper = 'well-refined'
  else if (silver >= 55) temper = 'proper-temper'
  else if (silver >= 40) temper = 'rough-forged'
  else if (silver >= 25) temper = 'untempered'
  else temper = 'raw-metal'

  return {
    silver, temper, hasHighSilver, hasRefactored, hasNoFirstDraft, hasPolished,
    hasNoRough, hasIterated, hasNoSinglePass, hasReviewed, hasNoUnreviewed,
    hasImproved, hasNoStagnant, firstDraftCount, roughCount,
  }
}

/**
 * Measure shadow craft (crafting)
 * @example
 * const m = measureCrafting(content)
 * console.log(m.craft) // 'shadow-master'
 */
export function measureCrafting(content: string): CraftingMeasure {
  let score = 0
  score += hasOptional(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasImplicitHandled = hasOptional(content) && hasDefaultParam(content)
  const hasEdgeCasesCovered = hasNullishCoalescing(content) && hasConditional(content)
  const hasSideEffectsControlled = hasStrictEq(content) && hasConst(content)
  const hasStateManaged = hasReadonly(content) && hasInterface(content)
  const hasHiddenProcessed = hasUnionType(content) && hasEnum(content)
  const hasAware = hasTryCatch(content) && hasReturnType(content)

  score += hasImplicitHandled ? 5 : 0
  score += hasEdgeCasesCovered ? 5 : 0
  score += hasSideEffectsControlled ? 5 : 0
  score += hasStateManaged ? 5 : 0
  score += hasHiddenProcessed ? 5 : 0
  score += hasAware ? 5 : 0

  const shadow = Math.min(score, 100)
  const uncoveredCount = countMatches(/\bvar\b/, content)
  const uncontrolledCount = countMatches(/\bany\b/, content)

  const hasNoUncovered = uncoveredCount === 0
  const hasNoUncontrolled = uncontrolledCount === 0
  const hasNoLeaked = !has(/\beval\b/, content)
  const hasNoIgnored = !has(/\bdebugger\b/, content)
  const hasHighShadow = shadow >= 70

  let craft: CraftGrade
  if (shadow >= 85) craft = 'shadow-master'
  else if (shadow >= 70) craft = 'skilled-shaper'
  else if (shadow >= 55) craft = 'proper-craft'
  else if (shadow >= 40) craft = 'visible-only'
  else if (shadow >= 25) craft = 'shadow-blind'
  else craft = 'no-craft'

  return {
    shadow, craft, hasHighShadow, hasImplicitHandled, hasEdgeCasesCovered,
    hasNoUncovered, hasSideEffectsControlled, hasNoUncontrolled, hasStateManaged,
    hasNoLeaked, hasHiddenProcessed, hasNoIgnored, hasAware,
    uncoveredCount, uncontrolledCount,
  }
}

/**
 * Measure moon phase adaptation (adapting)
 * @example
 * const m = measureAdapting(content)
 * console.log(m.phase) // 'full-moon'
 */
export function measureAdapting(content: string): AdaptingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasUnionType(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasConfigurable = hasOptional(content) && hasDefaultParam(content)
  const hasEnvironmentAware = hasInterface(content) && hasUnionType(content)
  const hasDynamic = hasGenerics(content) && hasInterface(content)
  const hasResponsive = hasAsync(content) && hasConst(content)
  const hasAdaptive = hasEnum(content) && hasTypeAlias(content)
  const hasFlexible = hasExport(content) && hasNamedExport(content)

  score += hasConfigurable ? 5 : 0
  score += hasEnvironmentAware ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasFlexible ? 5 : 0

  const adaptation = Math.min(score, 100)
  const hardcodedCount = countMatches(/\bvar\b/, content)
  const staticCount = countMatches(/\bany\b/, content)

  const hasNoHardcoded = hardcodedCount === 0
  const hasNoStatic = staticCount === 0
  const hasNoFixed = !has(/\beval\b/, content)
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasHighAdaptation = adaptation >= 70

  let phase: PhaseGrade
  if (adaptation >= 85) phase = 'full-moon'
  else if (adaptation >= 70) phase = 'waxing-gibbous'
  else if (adaptation >= 55) phase = 'proper-cycle'
  else if (adaptation >= 40) phase = 'half-moon'
  else if (adaptation >= 25) phase = 'new-moon'
  else phase = 'eclipse'

  return {
    adaptation, phase, hasHighAdaptation, hasConfigurable, hasEnvironmentAware,
    hasNoHardcoded, hasDynamic, hasNoStatic, hasResponsive, hasNoFixed,
    hasAdaptive, hasNoRigid, hasFlexible, hardcodedCount, staticCount,
  }
}

/**
 * Measure starlight precision (precisioning)
 * @example
 * const m = measurePrecisioning(content)
 * console.log(m.starlight) // 'north-star'
 */
export function measurePrecisioning(content: string): PrecisioningMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasSwitch(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasAccurate = hasStrictEq(content) && hasConst(content)
  const hasExact = hasReturnType(content) && hasInterface(content)
  const hasPrecise = hasEnum(content) && hasSwitch(content)
  const hasValidated = hasReturnType(content) && hasStrictEq(content)
  const hasCorrect = hasReadonly(content) && hasConst(content)
  const hasSharp = hasGenerics(content) && hasUnionType(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasValidated ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const vagueCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoUnvalidated = !has(/\beval\b/, content)
  const hasNoAlmostRight = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let starlight: StarlightGrade
  if (precision >= 85) starlight = 'north-star'
  else if (precision >= 70) starlight = 'constellation-guide'
  else if (precision >= 55) starlight = 'proper-aim'
  else if (precision >= 40) starlight = 'lost-star'
  else if (precision >= 25) starlight = 'cloudy-night'
  else starlight = 'no-stars'

  return {
    precision, starlight, hasHighPrecision, hasAccurate, hasExact,
    hasNoApproximate, hasPrecise, hasNoVague, hasValidated, hasNoUnvalidated,
    hasCorrect, hasNoAlmostRight, hasSharp, approximateCount, vagueCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ingot condition
 * @example
 * classifyIngotCondition(90) // 'celestial-ingot'
 */
export function classifyIngotCondition(score: number): IngotCondition {
  if (score >= 85) return 'celestial-ingot'
  if (score >= 70) return 'silver-masterpiece'
  if (score >= 55) return 'proper-ingot'
  if (score >= 40) return 'rough-metal'
  if (score >= 25) return 'tarnished-silver'
  return 'scrap'
}

/**
 * Classify forge type
 * @example
 * classifyForgeType(ingots) // 'grand-moonforge'
 */
export function classifyForgeType(ingots: MoonlitIngot[]): ForgeType {
  if (ingots.length === 0) return 'no-forge'
  const avgQs = Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)
  const celestialRatio = ingots.filter(i => i.condition === 'celestial-ingot').length / ingots.length
  if (avgQs >= 75 && celestialRatio >= 0.5) return 'grand-moonforge'
  if (avgQs >= 60) return 'silver-foundry'
  if (avgQs >= 45) return 'proper-forge'
  if (avgQs >= 30) return 'small-anvil'
  if (avgQs >= 15) return 'cold-hearth'
  return 'no-forge'
}

/**
 * Classify forge condition
 * @example
 * classifyForgeCondition(80) // 'celestial-foundry'
 */
export function classifyForgeCondition(avgQs: number): ForgeCondition {
  if (avgQs >= 75) return 'celestial-foundry'
  if (avgQs >= 60) return 'moonlit-workshop'
  if (avgQs >= 45) return 'decent-forge'
  if (avgQs >= 30) return 'dim-anvil'
  if (avgQs >= 15) return 'dark-corner'
  return 'void'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'moon-master'
 */
export function classifySmithGrade(avgMoonlight: number): SmithGrade {
  if (avgMoonlight >= 80) return 'moon-master'
  if (avgMoonlight >= 65) return 'silver-smith'
  if (avgMoonlight >= 50) return 'skilled-forger'
  if (avgMoonlight >= 35) return 'apprentice'
  if (avgMoonlight >= 20) return 'novice'
  return 'blind-smith'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(ingots, forges, night, stats)
 */
export function generateRecommendations(
  ingots: MoonlitIngot[],
  forges: MoonForge[],
  night: NightSummary,
  stats: MoonlitForgeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgNocturnalQuality < 50) {
    recs.push('Improve nocturnal quality with error handling, production readiness, and robust error recovery')
  }
  if (stats.avgSilverTempering < 50) {
    recs.push('Strengthen silver tempering with documentation, refactoring, and polished type definitions')
  }
  if (stats.avgShadowCraft < 50) {
    recs.push('Enhance shadow craft with implicit behavior handling, edge case coverage, and side effect control')
  }
  if (stats.avgMoonPhaseAdaptation < 50) {
    recs.push('Improve moon phase adaptation with configurable interfaces, dynamic generics, and flexible patterns')
  }
  if (stats.avgStarlightPrecision < 50) {
    recs.push('Sharpen starlight precision with strict equality, exact types, and validated patterns')
  }
  if (stats.scrapCount > 0) {
    recs.push(`${stats.scrapCount} file(s) are scrap — they need complete moonlit forge restoration`)
  }
  if (night.overallMoonlight < 40) {
    recs.push('Overall moonlight is dim — focus on nocturnal quality and starlight precision first')
  }
  const allScrap = forges.every(f => f.forgeType === 'no-forge' || f.forgeType === 'cold-hearth')
  if (allScrap && forges.length > 0) {
    recs.push('All forges are cold — consider a major moonlit reconstruction')
  }
  const scrapFiles = ingots.filter(i => i.condition === 'scrap').map(i => i.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Restore these scrap files into moonlit ingots: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your moonlit forge achieves moon-master grade! Every ingot gleams with celestial silver')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as moonlit ingot
 * @example
 * const i = analyzeMoonlitIngot(content, 'index.ts')
 * console.log(i.condition) // 'celestial-ingot'
 */
export function analyzeMoonlitIngot(content: string, filePath: string): MoonlitIngot {
  const forging = measureForging(content)
  const tempering = measureTempering(content)
  const crafting = measureCrafting(content)
  const adapting = measureAdapting(content)
  const precisioning = measurePrecisioning(content)

  const qualityScore = Math.round(
    forging.quality * 0.2 +
    tempering.silver * 0.2 +
    crafting.shadow * 0.2 +
    adapting.adaptation * 0.2 +
    precisioning.precision * 0.2,
  )

  return {
    file: filePath,
    nocturnalQuality: forging.quality,
    silverTempering: tempering.silver,
    shadowCraft: crafting.shadow,
    moonPhaseAdaptation: adapting.adaptation,
    starlightPrecision: precisioning.precision,
    forging,
    tempering,
    crafting,
    adapting,
    precisioning,
    condition: classifyIngotCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as moon forge
 * @example
 * const f = analyzeMoonForge(ingots, 'src')
 * console.log(f.forgeType) // 'grand-moonforge'
 */
export function analyzeMoonForge(ingots: MoonlitIngot[], dirPath: string): MoonForge {
  if (ingots.length === 0) {
    return {
      directory: dirPath, ingots: [], avgNocturnal: 0, avgTempering: 0,
      avgPrecision: 0, celestialIngotCount: 0, scrapCount: 0,
      forgeType: 'no-forge', condition: 'void',
    }
  }

  const avgNocturnal = Math.round(ingots.reduce((s, i) => s + i.nocturnalQuality, 0) / ingots.length)
  const avgTempering = Math.round(ingots.reduce((s, i) => s + i.silverTempering, 0) / ingots.length)
  const avgPrecision = Math.round(ingots.reduce((s, i) => s + i.starlightPrecision, 0) / ingots.length)
  const celestialIngotCount = ingots.filter(i => i.condition === 'celestial-ingot').length
  const scrapCount = ingots.filter(i => i.condition === 'scrap').length
  const avgQs = Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)

  return {
    directory: dirPath, ingots, avgNocturnal, avgTempering, avgPrecision,
    celestialIngotCount, scrapCount,
    forgeType: classifyForgeType(ingots),
    condition: classifyForgeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete moonlit forge result
 * @example
 * const result = await buildMoonlitForgeResult(files, contents)
 * console.log(result.stats.smithGrade) // 'moon-master'
 */
export async function buildMoonlitForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MoonlitForgeResult> {
  const ingots = files.map((file, i) => analyzeMoonlitIngot(contents[i] ?? '', file))

  const dirMap = new Map<string, MoonlitIngot[]>()
  for (const ingot of ingots) {
    const dir = path.dirname(ingot.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ingot) } else { dirMap.set(dir, [ingot]) }
  }

  const forges = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeMoonForge(dirIngots, dir),
  )

  const avgNocturnal = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.nocturnalQuality, 0) / ingots.length) : 0
  const avgTempering = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.silverTempering, 0) / ingots.length) : 0
  const avgPrecision = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.starlightPrecision, 0) / ingots.length) : 0

  const overallMoonlight = ingots.length > 0
    ? Math.round((avgNocturnal + avgTempering + avgPrecision) / 3) : 0
  const isCelestial = avgNocturnal >= 60

  const night: NightSummary = { avgNocturnal, avgTempering, avgPrecision, isCelestial, overallMoonlight }

  const avgShadowCraft = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.shadowCraft, 0) / ingots.length) : 0
  const avgMoonPhaseAdaptation = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.moonPhaseAdaptation, 0) / ingots.length) : 0

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => i.qualityScore > best.qualityScore ? i : best).file : ''
  const bestNocturnal = ingots.length > 0
    ? ingots.reduce((best, i) => i.nocturnalQuality > best.nocturnalQuality ? i : best).file : ''
  const bestTempered = ingots.length > 0
    ? ingots.reduce((best, i) => i.silverTempering > best.silverTempering ? i : best).file : ''
  const bestShadow = ingots.length > 0
    ? ingots.reduce((best, i) => i.shadowCraft > best.shadowCraft ? i : best).file : ''
  const mostPrecise = ingots.length > 0
    ? ingots.reduce((best, i) => i.starlightPrecision > best.starlightPrecision ? i : best).file : ''

  const stats: MoonlitForgeStats = {
    totalFiles: ingots.length,
    totalForges: forges.length,
    avgNocturnalQuality: avgNocturnal,
    avgSilverTempering: avgTempering,
    avgShadowCraft,
    avgMoonPhaseAdaptation,
    avgStarlightPrecision: avgPrecision,
    celestialIngotCount: ingots.filter(i => i.condition === 'celestial-ingot').length,
    silverMasterpieceCount: ingots.filter(i => i.condition === 'silver-masterpiece').length,
    properIngotCount: ingots.filter(i => i.condition === 'proper-ingot').length,
    roughMetalCount: ingots.filter(i => i.condition === 'rough-metal').length,
    tarnishedSilverCount: ingots.filter(i => i.condition === 'tarnished-silver').length,
    scrapCount: ingots.filter(i => i.condition === 'scrap').length,
    hasHighQualityCount: ingots.filter(i => i.forging.hasHighQuality).length,
    hasHighSilverCount: ingots.filter(i => i.tempering.hasHighSilver).length,
    hasHighShadowCount: ingots.filter(i => i.crafting.hasHighShadow).length,
    hasHighAdaptationCount: ingots.filter(i => i.adapting.hasHighAdaptation).length,
    hasHighPrecisionCount: ingots.filter(i => i.precisioning.hasHighPrecision).length,
    overallMoonlight,
    smithGrade: classifySmithGrade(overallMoonlight),
    bestIngot, bestNocturnal, bestTempered, bestShadow, mostPrecise,
  }

  const recommendations = generateRecommendations(ingots, forges, night, stats)

  return { ingots, forges, night, stats, recommendations }
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
