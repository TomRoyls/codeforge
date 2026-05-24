// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ForgeGrade = 'divine-forge' | 'master-craft' | 'proper-forge' | 'rough-hammer' | 'misshapen-metal' | 'no-forge'
export type StarGrade = 'neutron-star' | 'white-dwarf' | 'proper-star' | 'red-giant' | 'brown-dwarf' | 'no-star'
export type ConstellationGrade = 'orion-belt' | 'big-dipper' | 'proper-stars' | 'scattered-points' | 'random-dots' | 'no-constellation'
export type NebulaGrade = 'crystal-nebula' | 'clear-cosmos' | 'proper-clarity' | 'foggy-nebula' | 'dense-cloud' | 'opaque'
export type CosmicGrade = 'supernova-power' | 'stellar-force' | 'proper-strength' | 'weak-gravity' | 'micro-gravity' | 'no-strength'
export type ForgeCondition = 'celestial-masterpiece' | 'star-forged-tool' | 'proper-instrument' | 'rough-metal' | 'space-debris' | 'stardust'
export type WorkshopType = 'cosmic-foundry' | 'stellar-forge' | 'proper-anvil' | 'small-hammer' | 'cold-iron' | 'no-forge'
export type WorkshopCondition = 'divine-armory' | 'stellar-workshop' | 'decent-forge' | 'humble-anvil' | 'cold-hearth' | 'void'
export type SmithGrade = 'cosmic-smith' | 'star-forge-master' | 'skilled-blacksmith' | 'apprentice' | 'novice' | 'meteor-smasher'

export interface CraftingMeasure {
  forging: number
  grade: ForgeGrade
  hasHighForging: boolean
  hasWellDesigned: boolean
  hasPlanned: boolean
  hasNoHacked: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasIntentional: boolean
  hasNoRandom: boolean
  hasMethodical: boolean
  hasNoAdhoc: boolean
  hasCrafted: boolean
  hackedCount: number
  chaoticCount: number
}

export interface HardeningMeasure {
  hardness: number
  star: StarGrade
  hasHighHardness: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasDependable: boolean
  hasNoVolatile: boolean
  hasSolid: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface PatterningMeasure {
  pattern: number
  constellation: ConstellationGrade
  hasHighPattern: boolean
  hasWellOrganized: boolean
  hasConsistentStyle: boolean
  hasNoMixed: boolean
  hasUniformConventions: boolean
  hasNoInconsistent: boolean
  hasRegularPatterns: boolean
  hasNoAdhoc: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasHarmonious: boolean
  mixedCount: number
  inconsistentCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  nebula: NebulaGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasUnderstandable: boolean
  hasNoImpenetrable: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface StrengtheningMeasure {
  strength: number
  cosmic: CosmicGrade
  hasHighStrength: boolean
  hasRobust: boolean
  hasResilient: boolean
  hasNoFragile: boolean
  hasDefensive: boolean
  hasNoTrusting: boolean
  hasValidated: boolean
  hasNoUnchecked: boolean
  hasGuarded: boolean
  hasNoExposed: boolean
  hasFortified: boolean
  fragileCount: number
  uncheckedCount: number
}

export interface StarForge {
  file: string
  celestialForging: number
  starHardness: number
  constellationPattern: number
  nebulaClarity: number
  cosmicStrength: number
  crafting: CraftingMeasure
  hardening: HardeningMeasure
  patterning: PatterningMeasure
  clarifying: ClarifyingMeasure
  strengthening: StrengtheningMeasure
  condition: ForgeCondition
  qualityScore: number
}

export interface CosmicForge {
  directory: string
  forges: StarForge[]
  avgForging: number
  avgHardness: number
  avgStrength: number
  celestialMasterpieceCount: number
  stardustCount: number
  forgeType: WorkshopType
  condition: WorkshopCondition
}

export interface StarlightCosmos {
  avgForging: number
  avgHardness: number
  avgStrength: number
  isCelestial: boolean
  overallPower: number
}

export interface StarlightAnvilStats {
  totalFiles: number
  totalWorkshops: number
  avgCelestialForging: number
  avgStarHardness: number
  avgConstellationPattern: number
  avgNebulaClarity: number
  avgCosmicStrength: number
  celestialMasterpieceCount: number
  starForgedToolCount: number
  properInstrumentCount: number
  roughMetalCount: number
  spaceDebrisCount: number
  stardustCount: number
  hasHighForgingCount: number
  hasHighHardnessCount: number
  hasHighPatternCount: number
  hasHighClarityCount: number
  hasHighStrengthCount: number
  overallPower: number
  smithGrade: SmithGrade
  bestForge: string
  bestCrafted: string
  hardest: string
  bestPattern: string
  strongest: string
}

export interface StarlightAnvilResult {
  forges: StarForge[]
  workshops: CosmicForge[]
  cosmos: StarlightCosmos
  stats: StarlightAnvilStats
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
const hasPrivate = (c: string) => has(/\bprivate\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure celestial forging (creation quality)
 * @example
 * const m = measureCrafting(content)
 * console.log(m.grade) // 'divine-forge'
 */
export function measureCrafting(content: string): CraftingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasWellDesigned = hasInterface(content) && hasTypeAlias(content)
  const hasPlanned = hasEnum(content) && hasExport(content)
  const hasStructured = hasNamedExport(content) && hasReadonly(content)
  const hasIntentional = hasReturnType(content) && hasGenerics(content)
  const hasMethodical = hasOptional(content) && hasDocComments(content)
  const hasCrafted = hasPrivate(content) && hasStrictEq(content)

  score += hasWellDesigned ? 5 : 0
  score += hasPlanned ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasIntentional ? 5 : 0
  score += hasMethodical ? 5 : 0
  score += hasCrafted ? 5 : 0

  const forging = Math.min(score, 100)
  const hackedCount = countMatches(/\bvar\b/, content)
  const chaoticCount = countMatches(/\bany\b/, content)

  const hasNoHacked = hackedCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoRandom = !has(/\beval\b/, content)
  const hasNoAdhoc = !has(/\bdebugger\b/, content)
  const hasHighForging = forging >= 70

  let grade: ForgeGrade
  if (forging >= 85) grade = 'divine-forge'
  else if (forging >= 70) grade = 'master-craft'
  else if (forging >= 55) grade = 'proper-forge'
  else if (forging >= 40) grade = 'rough-hammer'
  else if (forging >= 25) grade = 'misshapen-metal'
  else grade = 'no-forge'

  return {
    forging, grade, hasHighForging, hasWellDesigned, hasPlanned, hasNoHacked,
    hasStructured, hasNoChaotic, hasIntentional, hasNoRandom, hasMethodical,
    hasNoAdhoc, hasCrafted, hackedCount, chaoticCount,
  }
}

/**
 * Measure star hardness (durability)
 * @example
 * const m = measureHardening(content)
 * console.log(m.star) // 'neutron-star'
 */
export function measureHardening(content: string): HardeningMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasTested = hasTryCatch(content) && hasThrow(content)
  const hasTypeSafe = hasStrictEq(content) && hasReturnType(content)
  const hasErrorHandled = hasInterface(content) && hasConst(content)
  const hasReliable = hasAsync(content) && hasNullishCoalescing(content)
  const hasDependable = hasDefaultParam(content) && hasOptional(content)
  const hasSolid = hasEnum(content) && hasReadonly(content)

  score += hasTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasDependable ? 5 : 0
  score += hasSolid ? 5 : 0

  const hardness = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const bareCrashCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoBareCrash = bareCrashCount === 0
  const hasNoUnsafe = !has(/\beval\b/, content)
  const hasNoFlaky = !has(/\bdebugger\b/, content)
  const hasNoVolatile = hasNoFlaky
  const hasHighHardness = hardness >= 70

  let star: StarGrade
  if (hardness >= 85) star = 'neutron-star'
  else if (hardness >= 70) star = 'white-dwarf'
  else if (hardness >= 55) star = 'proper-star'
  else if (hardness >= 40) star = 'red-giant'
  else if (hardness >= 25) star = 'brown-dwarf'
  else star = 'no-star'

  return {
    hardness, star, hasHighHardness, hasTested, hasNoUntested, hasTypeSafe,
    hasNoUnsafe, hasErrorHandled, hasNoBareCrash, hasReliable, hasNoFlaky,
    hasDependable, hasNoVolatile, hasSolid, untestedCount, bareCrashCount,
  }
}

/**
 * Measure constellation pattern (architectural patterns)
 * @example
 * const m = measurePatterning(content)
 * console.log(m.constellation) // 'orion-belt'
 */
export function measurePatterning(content: string): PatterningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasWellOrganized = hasExport(content) && hasImport(content)
  const hasConsistentStyle = hasNamedExport(content) && hasInterface(content)
  const hasUniformConventions = hasTypeAlias(content) && hasConst(content)
  const hasRegularPatterns = hasReturnType(content) && hasGenerics(content)
  const hasStructured = hasMapFunction(content) && hasArrowFunction(content)
  const hasHarmonious = hasAsync(content) && hasEnum(content)

  score += hasWellOrganized ? 5 : 0
  score += hasConsistentStyle ? 5 : 0
  score += hasUniformConventions ? 5 : 0
  score += hasRegularPatterns ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasHarmonious ? 5 : 0

  const patternVal = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const inconsistentCount = countMatches(/\bany\b/, content)

  const hasNoMixed = mixedCount === 0
  const hasNoInconsistent = inconsistentCount === 0
  const hasNoAdhoc = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighPattern = patternVal >= 70

  let constellation: ConstellationGrade
  if (patternVal >= 85) constellation = 'orion-belt'
  else if (patternVal >= 70) constellation = 'big-dipper'
  else if (patternVal >= 55) constellation = 'proper-stars'
  else if (patternVal >= 40) constellation = 'scattered-points'
  else if (patternVal >= 25) constellation = 'random-dots'
  else constellation = 'no-constellation'

  return {
    pattern: patternVal, constellation, hasHighPattern, hasWellOrganized,
    hasConsistentStyle, hasNoMixed, hasUniformConventions, hasNoInconsistent,
    hasRegularPatterns, hasNoAdhoc, hasStructured, hasNoChaotic, hasHarmonious,
    mixedCount, inconsistentCount,
  }
}

/**
 * Measure nebula clarity (readability in complexity)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.nebula) // 'crystal-nebula'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasReadable = hasDocComments(content) && hasExport(content)
  const hasTransparent = hasReturnType(content) && hasImport(content)
  const hasSelfDocumenting = hasInterface(content) && hasNamedExport(content)
  const hasUnderstandable = hasTypeAlias(content) && hasGenerics(content)
  const hasVisible = hasConst(content) && hasStrictEq(content)
  const hasClear = hasEnum(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoImpenetrable = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let nebula: NebulaGrade
  if (clarity >= 85) nebula = 'crystal-nebula'
  else if (clarity >= 70) nebula = 'clear-cosmos'
  else if (clarity >= 55) nebula = 'proper-clarity'
  else if (clarity >= 40) nebula = 'foggy-nebula'
  else if (clarity >= 25) nebula = 'dense-cloud'
  else nebula = 'opaque'

  return {
    clarity, nebula, hasHighClarity, hasReadable, hasTransparent, hasNoObfuscated,
    hasSelfDocumenting, hasNoCryptic, hasUnderstandable, hasNoImpenetrable,
    hasVisible, hasNoHidden, hasClear, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure cosmic strength (overall robustness)
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.cosmic) // 'supernova-power'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0

  const hasRobust = hasTryCatch(content) && hasThrow(content)
  const hasResilient = hasConditional(content) && hasStrictEq(content)
  const hasDefensive = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasValidated = hasOptional(content) && hasReadonly(content)
  const hasGuarded = hasReturnType(content) && hasConst(content)
  const hasFortified = hasAsync(content) && hasInterface(content)

  score += hasRobust ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasDefensive ? 5 : 0
  score += hasValidated ? 5 : 0
  score += hasGuarded ? 5 : 0
  score += hasFortified ? 5 : 0

  const strength = Math.min(score, 100)
  const fragileCount = countMatches(/\bvar\b/, content)
  const uncheckedCount = countMatches(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoUnchecked = uncheckedCount === 0
  const hasNoTrusting = !has(/\beval\b/, content)
  const hasNoExposed = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let cosmic: CosmicGrade
  if (strength >= 85) cosmic = 'supernova-power'
  else if (strength >= 70) cosmic = 'stellar-force'
  else if (strength >= 55) cosmic = 'proper-strength'
  else if (strength >= 40) cosmic = 'weak-gravity'
  else if (strength >= 25) cosmic = 'micro-gravity'
  else cosmic = 'no-strength'

  return {
    strength, cosmic, hasHighStrength, hasRobust, hasResilient, hasNoFragile,
    hasDefensive, hasNoTrusting, hasValidated, hasNoUnchecked, hasGuarded,
    hasNoExposed, hasFortified, fragileCount, uncheckedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify forge condition
 * @example
 * classifyForgeCondition(90) // 'celestial-masterpiece'
 */
export function classifyForgeCondition(score: number): ForgeCondition {
  if (score >= 85) return 'celestial-masterpiece'
  if (score >= 70) return 'star-forged-tool'
  if (score >= 55) return 'proper-instrument'
  if (score >= 40) return 'rough-metal'
  if (score >= 25) return 'space-debris'
  return 'stardust'
}

/**
 * Classify forge type
 * @example
 * classifyForgeType(forges) // 'cosmic-foundry'
 */
export function classifyForgeType(forges: StarForge[]): WorkshopType {
  if (forges.length === 0) return 'no-forge'
  const avgQs = Math.round(forges.reduce((s, f) => s + f.qualityScore, 0) / forges.length)
  const masterpieceRatio = forges.filter(f => f.condition === 'celestial-masterpiece').length / forges.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'cosmic-foundry'
  if (avgQs >= 60) return 'stellar-forge'
  if (avgQs >= 45) return 'proper-anvil'
  if (avgQs >= 30) return 'small-hammer'
  if (avgQs >= 15) return 'cold-iron'
  return 'no-forge'
}

/**
 * Classify workshop condition
 * @example
 * classifyWorkshopCondition(80) // 'divine-armory'
 */
export function classifyWorkshopCondition(avgQs: number): WorkshopCondition {
  if (avgQs >= 75) return 'divine-armory'
  if (avgQs >= 60) return 'stellar-workshop'
  if (avgQs >= 45) return 'decent-forge'
  if (avgQs >= 30) return 'humble-anvil'
  if (avgQs >= 15) return 'cold-hearth'
  return 'void'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'cosmic-smith'
 */
export function classifySmithGrade(avgPower: number): SmithGrade {
  if (avgPower >= 80) return 'cosmic-smith'
  if (avgPower >= 65) return 'star-forge-master'
  if (avgPower >= 50) return 'skilled-blacksmith'
  if (avgPower >= 35) return 'apprentice'
  if (avgPower >= 20) return 'novice'
  return 'meteor-smasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(forges, workshops, cosmos, stats)
 */
export function generateRecommendations(
  forges: StarForge[],
  workshops: CosmicForge[],
  cosmos: StarlightCosmos,
  stats: StarlightAnvilStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCelestialForging < 50) {
    recs.push('Improve celestial forging with well-designed interfaces, planned enums, and structured exports')
  }
  if (stats.avgStarHardness < 50) {
    recs.push('Harden star durability with error handling, type safety, and reliable async patterns')
  }
  if (stats.avgConstellationPattern < 50) {
    recs.push('Align constellation patterns with organized exports, consistent styles, and regular conventions')
  }
  if (stats.avgNebulaClarity < 50) {
    recs.push('Clear nebulae with doc comments, transparent return types, and self-documenting interfaces')
  }
  if (stats.avgCosmicStrength < 50) {
    recs.push('Strengthen cosmic power with robust error handling, defensive nullish checks, and validated types')
  }
  if (stats.stardustCount > 0) {
    recs.push(`${stats.stardustCount} file(s) are stardust — they need complete celestial forging`)
  }
  if (cosmos.overallPower < 40) {
    recs.push('Overall cosmic power is low — focus on celestial forging and star hardness first')
  }
  const allCold = workshops.every(w => w.forgeType === 'no-forge' || w.forgeType === 'cold-iron')
  if (allCold && workshops.length > 0) {
    recs.push('All workshops are cold — consider a major starlight anvil reconstruction')
  }
  const stardustFiles = forges.filter(f => f.condition === 'stardust').map(f => f.file)
  if (stardustFiles.length > 0 && stardustFiles.length <= 3) {
    recs.push(`Reforge these stardust files: ${stardustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your starlight anvil shines with celestial perfection! Every forge is a masterpiece in the cosmic foundry')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as star forge
 * @example
 * const f = analyzeStarForge(content, 'index.ts')
 * console.log(f.condition) // 'celestial-masterpiece'
 */
export function analyzeStarForge(content: string, filePath: string): StarForge {
  const crafting = measureCrafting(content)
  const hardening = measureHardening(content)
  const patterning = measurePatterning(content)
  const clarifying = measureClarifying(content)
  const strengthening = measureStrengthening(content)

  const qualityScore = Math.round(
    crafting.forging * 0.2 +
    hardening.hardness * 0.2 +
    patterning.pattern * 0.2 +
    clarifying.clarity * 0.2 +
    strengthening.strength * 0.2,
  )

  return {
    file: filePath,
    celestialForging: crafting.forging,
    starHardness: hardening.hardness,
    constellationPattern: patterning.pattern,
    nebulaClarity: clarifying.clarity,
    cosmicStrength: strengthening.strength,
    crafting, hardening, patterning, clarifying, strengthening,
    condition: classifyForgeCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as cosmic forge
 * @example
 * const w = analyzeCosmicForge(forges, 'src')
 * console.log(w.forgeType) // 'cosmic-foundry'
 */
export function analyzeCosmicForge(forges: StarForge[], dirPath: string): CosmicForge {
  if (forges.length === 0) {
    return {
      directory: dirPath, forges: [], avgForging: 0, avgHardness: 0,
      avgStrength: 0, celestialMasterpieceCount: 0, stardustCount: 0,
      forgeType: 'no-forge', condition: 'void',
    }
  }

  const avgForging = Math.round(forges.reduce((s, f) => s + f.celestialForging, 0) / forges.length)
  const avgHardness = Math.round(forges.reduce((s, f) => s + f.starHardness, 0) / forges.length)
  const avgStrength = Math.round(forges.reduce((s, f) => s + f.cosmicStrength, 0) / forges.length)
  const celestialMasterpieceCount = forges.filter(f => f.condition === 'celestial-masterpiece').length
  const stardustCount = forges.filter(f => f.condition === 'stardust').length
  const avgQs = Math.round(forges.reduce((s, f) => s + f.qualityScore, 0) / forges.length)

  return {
    directory: dirPath, forges, avgForging, avgHardness, avgStrength,
    celestialMasterpieceCount, stardustCount,
    forgeType: classifyForgeType(forges),
    condition: classifyWorkshopCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete starlight anvil result
 * @example
 * const result = await buildStarlightAnvilResult(files, contents)
 * console.log(result.stats.smithGrade) // 'cosmic-smith'
 */
export async function buildStarlightAnvilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StarlightAnvilResult> {
  const forges = files.map((file, i) => analyzeStarForge(contents[i] ?? '', file))

  const dirMap = new Map<string, StarForge[]>()
  for (const forge of forges) {
    const dir = path.dirname(forge.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(forge) } else { dirMap.set(dir, [forge]) }
  }

  const workshops = Array.from(dirMap.entries()).map(([dir, dirForges]) =>
    analyzeCosmicForge(dirForges, dir),
  )

  const avgForging = forges.length > 0
    ? Math.round(forges.reduce((s, f) => s + f.celestialForging, 0) / forges.length) : 0
  const avgHardness = forges.length > 0
    ? Math.round(forges.reduce((s, f) => s + f.starHardness, 0) / forges.length) : 0
  const avgStrength = forges.length > 0
    ? Math.round(forges.reduce((s, f) => s + f.cosmicStrength, 0) / forges.length) : 0

  const overallPower = forges.length > 0
    ? Math.round((avgForging + avgHardness + avgStrength) / 3) : 0
  const isCelestial = avgForging >= 60

  const cosmos: StarlightCosmos = { avgForging, avgHardness, avgStrength, isCelestial, overallPower }

  const avgConstellationPattern = forges.length > 0
    ? Math.round(forges.reduce((s, f) => s + f.constellationPattern, 0) / forges.length) : 0
  const avgNebulaClarity = forges.length > 0
    ? Math.round(forges.reduce((s, f) => s + f.nebulaClarity, 0) / forges.length) : 0
  const avgCosmicStrength = avgStrength

  const bestForge = forges.length > 0
    ? forges.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const bestCrafted = forges.length > 0
    ? forges.reduce((best, f) => f.celestialForging > best.celestialForging ? f : best).file : ''
  const hardest = forges.length > 0
    ? forges.reduce((best, f) => f.starHardness > best.starHardness ? f : best).file : ''
  const bestPattern = forges.length > 0
    ? forges.reduce((best, f) => f.constellationPattern > best.constellationPattern ? f : best).file : ''
  const strongest = forges.length > 0
    ? forges.reduce((best, f) => f.cosmicStrength > best.cosmicStrength ? f : best).file : ''

  const stats: StarlightAnvilStats = {
    totalFiles: forges.length,
    totalWorkshops: workshops.length,
    avgCelestialForging: avgForging,
    avgStarHardness: avgHardness,
    avgConstellationPattern,
    avgNebulaClarity,
    avgCosmicStrength,
    celestialMasterpieceCount: forges.filter(f => f.condition === 'celestial-masterpiece').length,
    starForgedToolCount: forges.filter(f => f.condition === 'star-forged-tool').length,
    properInstrumentCount: forges.filter(f => f.condition === 'proper-instrument').length,
    roughMetalCount: forges.filter(f => f.condition === 'rough-metal').length,
    spaceDebrisCount: forges.filter(f => f.condition === 'space-debris').length,
    stardustCount: forges.filter(f => f.condition === 'stardust').length,
    hasHighForgingCount: forges.filter(f => f.crafting.hasHighForging).length,
    hasHighHardnessCount: forges.filter(f => f.hardening.hasHighHardness).length,
    hasHighPatternCount: forges.filter(f => f.patterning.hasHighPattern).length,
    hasHighClarityCount: forges.filter(f => f.clarifying.hasHighClarity).length,
    hasHighStrengthCount: forges.filter(f => f.strengthening.hasHighStrength).length,
    overallPower,
    smithGrade: classifySmithGrade(overallPower),
    bestForge, bestCrafted, hardest, bestPattern, strongest,
  }

  const recommendations = generateRecommendations(forges, workshops, cosmos, stats)

  return { forges, workshops, cosmos, stats, recommendations }
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
