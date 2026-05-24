// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PowerGrade = 'thunderbolt-strike' | 'lightning-power' | 'proper-charge' | 'static-electricity' | 'dead-battery' | 'no-power'
export type AnvilType = 'mythril-anvil' | 'steel-anvil' | 'proper-anvil' | 'iron-block' | 'cracked-stone' | 'no-anvil'
export type SparkType = 'divine-inspiration' | 'creative-fire' | 'proper-spark' | 'dim-spark' | 'dead-ember' | 'no-spark'
export type TemperType = 'master-temper' | 'proper-heat-treat' | 'decent-temper' | 'uneven-temper' | 'botched-temper' | 'no-temper'
export type StormType = 'storm-master' | 'weather-worker' | 'proper-craft' | 'storm-tossed' | 'storm-damaged' | 'no-craft'
export type IngotCondition = 'legendary-weapon' | 'thunder-forged' | 'proper-blade' | 'rough-metal' | 'slag' | 'dust'
export type ComplexType = 'mythical-forge' | 'grand-forge' | 'proper-workshop' | 'small-anvil' | 'cold-hearth' | 'no-forge'
export type ComplexCondition = 'legendary-armory' | 'thunder-workshop' | 'decent-forge' | 'dim-hearth' | 'cold-ashes' | 'void'
export type SmithGrade = 'thunder-smith' | 'master-forge' | 'skilled-blacksmith' | 'apprentice' | 'novice' | 'scavenger'

export interface PoweringMeasure {
  power: number
  grade: PowerGrade
  hasHighPower: boolean
  hasPerformant: boolean
  hasOptimized: boolean
  hasNoSluggish: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasStrong: boolean
  hasNoAnemic: boolean
  hasEnergetic: boolean
  sluggishCount: number
  wastefulCount: number
}

export interface EnduringMeasure {
  strength: number
  anvil: AnvilType
  hasHighStrength: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasSolid: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface CreatingMeasure {
  quality: number
  spark: SparkType
  hasHighQuality: boolean
  hasInnovative: boolean
  hasClever: boolean
  hasNoCopyPaste: boolean
  hasOriginal: boolean
  hasNoDerivative: boolean
  hasElegant: boolean
  hasNoBruteForce: boolean
  hasInventive: boolean
  hasNoRepetitive: boolean
  hasCreative: boolean
  copyPasteCount: number
  bruteForceCount: number
}

export interface TuningMeasure {
  precision: number
  temper: TemperType
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
  hasTuned: boolean
  approximateCount: number
  sloppyCount: number
}

export interface CraftingMeasure {
  craft: number
  storm: StormType
  hasHighCraft: boolean
  hasErrorHandling: boolean
  hasEdgeCaseCoverage: boolean
  hasNoUncovered: boolean
  hasRetryLogic: boolean
  hasNoSingleFail: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasChaosReady: boolean
  hasNoOrderOnly: boolean
  hasResilient: boolean
  uncoveredCount: number
  singleFailCount: number
}

export interface ThunderIngot {
  file: string
  lightningPower: number
  anvilStrength: number
  sparkQuality: number
  temperPrecision: number
  stormCraft: number
  powering: PoweringMeasure
  enduring: EnduringMeasure
  creating: CreatingMeasure
  tuning: TuningMeasure
  crafting: CraftingMeasure
  condition: IngotCondition
  qualityScore: number
}

export interface ForgeComplex {
  directory: string
  ingots: ThunderIngot[]
  avgPower: number
  avgStrength: number
  avgCraft: number
  legendaryWeaponCount: number
  dustCount: number
  complexType: ComplexType
  condition: ComplexCondition
}

export interface ThunderArmory {
  avgPower: number
  avgStrength: number
  avgCraft: number
  isLegendary: boolean
  overallMight: number
}

export interface ThunderForgeStats {
  totalFiles: number
  totalComplexes: number
  avgLightningPower: number
  avgAnvilStrength: number
  avgSparkQuality: number
  avgTemperPrecision: number
  avgStormCraft: number
  legendaryWeaponCount: number
  thunderForgedCount: number
  properBladeCount: number
  roughMetalCount: number
  slagCount: number
  dustCount: number
  hasHighPowerCount: number
  hasHighStrengthCount: number
  hasHighQualityCount: number
  hasHighPrecisionCount: number
  hasHighCraftCount: number
  overallMight: number
  smithGrade: SmithGrade
  bestIngot: string
  mostPowerful: string
  strongest: string
  mostCreative: string
  bestCraft: string
}

export interface ThunderForgeResult {
  ingots: ThunderIngot[]
  complexes: ForgeComplex[]
  armory: ThunderArmory
  stats: ThunderForgeStats
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
 * Measure lightning power (raw execution power)
 * @example
 * const m = measurePowering(content)
 * console.log(m.grade) // 'thunderbolt-strike'
 */
export function measurePowering(content: string): PoweringMeasure {
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

  const hasPerformant = hasConst(content) && hasStrictEq(content)
  const hasOptimized = hasReturnType(content) && hasExport(content)
  const hasEfficient = hasAsync(content) && hasMapFunction(content)
  const hasPowerful = hasReadonly(content) && hasGenerics(content)
  const hasStrong = hasEnum(content) && hasInterface(content)
  const hasEnergetic = hasOptional(content) && hasTypeAlias(content)

  score += hasPerformant ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasPowerful ? 5 : 0
  score += hasStrong ? 5 : 0
  score += hasEnergetic ? 5 : 0

  const power = Math.min(score, 100)
  const sluggishCount = countMatches(/\bvar\b/, content)
  const wastefulCount = countMatches(/\beval\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoWasteful = wastefulCount === 0
  const hasNoWeak = countMatches(/\bany\b/, content) === 0
  const hasNoAnemic = !has(/\bdebugger\b/, content)
  const hasHighPower = power >= 70

  let grade: PowerGrade
  if (power >= 85) grade = 'thunderbolt-strike'
  else if (power >= 70) grade = 'lightning-power'
  else if (power >= 55) grade = 'proper-charge'
  else if (power >= 40) grade = 'static-electricity'
  else if (power >= 25) grade = 'dead-battery'
  else grade = 'no-power'

  return {
    power, grade, hasHighPower, hasPerformant, hasOptimized, hasNoSluggish,
    hasEfficient, hasNoWasteful, hasPowerful, hasNoWeak, hasStrong, hasNoAnemic,
    hasEnergetic, sluggishCount, wastefulCount,
  }
}

/**
 * Measure anvil strength (structural durability)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.anvil) // 'mythril-anvil'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasRobust = hasStrictEq(content) && hasReturnType(content)
  const hasTested = hasInterface(content) && hasExport(content)
  const hasTypeSafe = hasTryCatch(content) && hasConst(content)
  const hasErrorHandled = hasTryCatch(content) && hasThrow(content)
  const hasDurable = hasReadonly(content) && hasOptional(content)
  const hasSolid = hasEnum(content) && hasTypeAlias(content)

  score += hasRobust ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasSolid ? 5 : 0

  const strength = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const bareCrashCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = bareCrashCount === 0
  const hasNoBareCrash = countMatches(/\beval\b/, content) === 0
  const hasNoFragile = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let anvil: AnvilType
  if (strength >= 85) anvil = 'mythril-anvil'
  else if (strength >= 70) anvil = 'steel-anvil'
  else if (strength >= 55) anvil = 'proper-anvil'
  else if (strength >= 40) anvil = 'iron-block'
  else if (strength >= 25) anvil = 'cracked-stone'
  else anvil = 'no-anvil'

  return {
    strength, anvil, hasHighStrength, hasRobust, hasTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasErrorHandled, hasNoBareCrash, hasDurable,
    hasNoFragile, hasSolid, untestedCount, bareCrashCount,
  }
}

/**
 * Measure spark quality (innovation and creativity)
 * @example
 * const m = measureCreating(content)
 * console.log(m.spark) // 'divine-inspiration'
 */
export function measureCreating(content: string): CreatingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasInnovative = hasInterface(content) && hasEnum(content)
  const hasClever = hasExport(content) && hasTypeAlias(content)
  const hasOriginal = hasReturnType(content) && hasConst(content)
  const hasElegant = hasDocComments(content) && hasReadonly(content)
  const hasInventive = hasNamedExport(content) && hasGenerics(content)
  const hasCreative = hasOptional(content) && hasPrivate(content)

  score += hasInnovative ? 5 : 0
  score += hasClever ? 5 : 0
  score += hasOriginal ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasInventive ? 5 : 0
  score += hasCreative ? 5 : 0

  const quality = Math.min(score, 100)
  const copyPasteCount = countMatches(/\bvar\b/, content)
  const bruteForceCount = countMatches(/\bany\b/, content)

  const hasNoCopyPaste = copyPasteCount === 0
  const hasNoDerivative = bruteForceCount === 0
  const hasNoBruteForce = countMatches(/\beval\b/, content) === 0
  const hasNoRepetitive = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let spark: SparkType
  if (quality >= 85) spark = 'divine-inspiration'
  else if (quality >= 70) spark = 'creative-fire'
  else if (quality >= 55) spark = 'proper-spark'
  else if (quality >= 40) spark = 'dim-spark'
  else if (quality >= 25) spark = 'dead-ember'
  else spark = 'no-spark'

  return {
    quality, spark, hasHighQuality, hasInnovative, hasClever, hasNoCopyPaste,
    hasOriginal, hasNoDerivative, hasElegant, hasNoBruteForce, hasInventive,
    hasNoRepetitive, hasCreative, copyPasteCount, bruteForceCount,
  }
}

/**
 * Measure temper precision (heat-treatment precision)
 * @example
 * const m = measureTuning(content)
 * console.log(m.temper) // 'master-temper'
 */
export function measureTuning(content: string): TuningMeasure {
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
  const hasCorrect = hasEnum(content) && hasTypeAlias(content)
  const hasSharp = hasConst(content) && hasGenerics(content)
  const hasTuned = hasDocComments(content) && hasPrivate(content)

  score += hasExact ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasTuned ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const sloppyCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = sloppyCount === 0
  const hasNoAlmostRight = countMatches(/\beval\b/, content) === 0
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let temper: TemperType
  if (precision >= 85) temper = 'master-temper'
  else if (precision >= 70) temper = 'proper-heat-treat'
  else if (precision >= 55) temper = 'decent-temper'
  else if (precision >= 40) temper = 'uneven-temper'
  else if (precision >= 25) temper = 'botched-temper'
  else temper = 'no-temper'

  return {
    precision, temper, hasHighPrecision, hasExact, hasAccurate, hasNoApproximate,
    hasPrecise, hasNoVague, hasCorrect, hasNoAlmostRight, hasSharp, hasNoSloppy,
    hasTuned, approximateCount, sloppyCount,
  }
}

/**
 * Measure storm craft (chaos handling)
 * @example
 * const m = measureCrafting(content)
 * console.log(m.storm) // 'storm-master'
 */
export function measureCrafting(content: string): CraftingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasErrorHandling = hasTryCatch(content) && hasStrictEq(content)
  const hasEdgeCaseCoverage = hasReturnType(content) && hasInterface(content)
  const hasRetryLogic = hasAsync(content) && hasThrow(content)
  const hasGracefulDegradation = hasConditional(content) && hasConst(content)
  const hasChaosReady = hasExport(content) && hasOptional(content)
  const hasResilient = hasGenerics(content) && hasReadonly(content)

  score += hasErrorHandling ? 5 : 0
  score += hasEdgeCaseCoverage ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasChaosReady ? 5 : 0
  score += hasResilient ? 5 : 0

  const craft = Math.min(score, 100)
  const uncoveredCount = countMatches(/\bvar\b/, content)
  const singleFailCount = countMatches(/\bany\b/, content)

  const hasNoUncovered = uncoveredCount === 0
  const hasNoSingleFail = singleFailCount === 0
  const hasNoHardCrash = countMatches(/\beval\b/, content) === 0
  const hasNoOrderOnly = !has(/\bdebugger\b/, content)
  const hasHighCraft = craft >= 70

  let storm: StormType
  if (craft >= 85) storm = 'storm-master'
  else if (craft >= 70) storm = 'weather-worker'
  else if (craft >= 55) storm = 'proper-craft'
  else if (craft >= 40) storm = 'storm-tossed'
  else if (craft >= 25) storm = 'storm-damaged'
  else storm = 'no-craft'

  return {
    craft, storm, hasHighCraft, hasErrorHandling, hasEdgeCaseCoverage, hasNoUncovered,
    hasRetryLogic, hasNoSingleFail, hasGracefulDegradation, hasNoHardCrash,
    hasChaosReady, hasNoOrderOnly, hasResilient, uncoveredCount, singleFailCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ingot condition
 * @example
 * classifyIngotCondition(90) // 'legendary-weapon'
 */
export function classifyIngotCondition(score: number): IngotCondition {
  if (score >= 85) return 'legendary-weapon'
  if (score >= 70) return 'thunder-forged'
  if (score >= 55) return 'proper-blade'
  if (score >= 40) return 'rough-metal'
  if (score >= 25) return 'slag'
  return 'dust'
}

/**
 * Classify complex type
 * @example
 * classifyComplexType(ingots) // 'mythical-forge'
 */
export function classifyComplexType(ingots: ThunderIngot[]): ComplexType {
  if (ingots.length === 0) return 'no-forge'
  const avgQs = Math.round(ingots.reduce((s, ig) => s + ig.qualityScore, 0) / ingots.length)
  const masterpieceRatio = ingots.filter(ig => ig.condition === 'legendary-weapon').length / ingots.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'mythical-forge'
  if (avgQs >= 60) return 'grand-forge'
  if (avgQs >= 45) return 'proper-workshop'
  if (avgQs >= 30) return 'small-anvil'
  if (avgQs >= 15) return 'cold-hearth'
  return 'no-forge'
}

/**
 * Classify complex condition
 * @example
 * classifyComplexCondition(80) // 'legendary-armory'
 */
export function classifyComplexCondition(avgQs: number): ComplexCondition {
  if (avgQs >= 75) return 'legendary-armory'
  if (avgQs >= 60) return 'thunder-workshop'
  if (avgQs >= 45) return 'decent-forge'
  if (avgQs >= 30) return 'dim-hearth'
  if (avgQs >= 15) return 'cold-ashes'
  return 'void'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'thunder-smith'
 */
export function classifySmithGrade(avgMight: number): SmithGrade {
  if (avgMight >= 80) return 'thunder-smith'
  if (avgMight >= 65) return 'master-forge'
  if (avgMight >= 50) return 'skilled-blacksmith'
  if (avgMight >= 35) return 'apprentice'
  if (avgMight >= 20) return 'novice'
  return 'scavenger'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(ingots, complexes, armory, stats)
 */
export function generateRecommendations(
  ingots: ThunderIngot[],
  complexes: ForgeComplex[],
  armory: ThunderArmory,
  stats: ThunderForgeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLightningPower < 50) {
    recs.push('Boost lightning power with performant patterns, optimized types, and efficient async flows')
  }
  if (stats.avgAnvilStrength < 50) {
    recs.push('Reinforce anvil strength with strict equality, error handling, and type-safe structures')
  }
  if (stats.avgSparkQuality < 50) {
    recs.push('Ignite spark quality with innovative interfaces, creative enums, and elegant type aliases')
  }
  if (stats.avgTemperPrecision < 50) {
    recs.push('Sharpen temper precision with exact types, precise generics, and correctly tuned patterns')
  }
  if (stats.avgStormCraft < 50) {
    recs.push('Master storm craft with try/catch error handling, edge case coverage, and graceful degradation')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — they need complete re-forging from raw materials`)
  }
  if (armory.overallMight < 40) {
    recs.push('Overall might is dangerously low — focus on lightning power and anvil strength first')
  }
  const allWeak = complexes.every(c => c.complexType === 'no-forge' || c.complexType === 'cold-hearth')
  if (allWeak && complexes.length > 0) {
    recs.push('All forge complexes are weak — consider a major system-wide re-forging')
  }
  const dustFiles = ingots.filter(ig => ig.condition === 'dust').map(ig => ig.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Re-forge these dust files: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The thunder forge blazes with legendary power! Every ingot radiates power, strength, creativity, precision, and craft')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as thunder ingot
 * @example
 * const ingot = analyzeThunderIngot(content, 'index.ts')
 * console.log(ingot.condition) // 'legendary-weapon'
 */
export function analyzeThunderIngot(content: string, filePath: string): ThunderIngot {
  const powering = measurePowering(content)
  const enduring = measureEnduring(content)
  const creating = measureCreating(content)
  const tuning = measureTuning(content)
  const crafting = measureCrafting(content)

  const qualityScore = Math.round(
    powering.power * 0.2 +
    enduring.strength * 0.2 +
    creating.quality * 0.2 +
    tuning.precision * 0.2 +
    crafting.craft * 0.2,
  )

  return {
    file: filePath,
    lightningPower: powering.power,
    anvilStrength: enduring.strength,
    sparkQuality: creating.quality,
    temperPrecision: tuning.precision,
    stormCraft: crafting.craft,
    powering, enduring, creating, tuning, crafting,
    condition: classifyIngotCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as forge complex
 * @example
 * const complex = analyzeForgeComplex(ingots, 'src')
 * console.log(complex.complexType) // 'mythical-forge'
 */
export function analyzeForgeComplex(ingots: ThunderIngot[], dirPath: string): ForgeComplex {
  if (ingots.length === 0) {
    return {
      directory: dirPath, ingots: [], avgPower: 0, avgStrength: 0,
      avgCraft: 0, legendaryWeaponCount: 0, dustCount: 0,
      complexType: 'no-forge', condition: 'void',
    }
  }

  const avgPower = Math.round(ingots.reduce((s, ig) => s + ig.lightningPower, 0) / ingots.length)
  const avgStrength = Math.round(ingots.reduce((s, ig) => s + ig.anvilStrength, 0) / ingots.length)
  const avgCraft = Math.round(ingots.reduce((s, ig) => s + ig.stormCraft, 0) / ingots.length)
  const legendaryWeaponCount = ingots.filter(ig => ig.condition === 'legendary-weapon').length
  const dustCount = ingots.filter(ig => ig.condition === 'dust').length
  const avgQs = Math.round(ingots.reduce((s, ig) => s + ig.qualityScore, 0) / ingots.length)

  return {
    directory: dirPath, ingots, avgPower, avgStrength, avgCraft,
    legendaryWeaponCount, dustCount,
    complexType: classifyComplexType(ingots),
    condition: classifyComplexCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete thunder forge result
 * @example
 * const result = await buildThunderForgeResult(files, contents)
 * console.log(result.stats.smithGrade) // 'thunder-smith'
 */
export async function buildThunderForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ThunderForgeResult> {
  const ingots = files.map((file, i) => analyzeThunderIngot(contents[i] ?? '', file))

  const dirMap = new Map<string, ThunderIngot[]>()
  for (const ingot of ingots) {
    const dir = path.dirname(ingot.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ingot) } else { dirMap.set(dir, [ingot]) }
  }

  const complexes = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeForgeComplex(dirIngots, dir),
  )

  const avgPower = ingots.length > 0
    ? Math.round(ingots.reduce((s, ig) => s + ig.lightningPower, 0) / ingots.length) : 0
  const avgStrength = ingots.length > 0
    ? Math.round(ingots.reduce((s, ig) => s + ig.anvilStrength, 0) / ingots.length) : 0
  const avgCraft = ingots.length > 0
    ? Math.round(ingots.reduce((s, ig) => s + ig.stormCraft, 0) / ingots.length) : 0

  const overallMight = ingots.length > 0
    ? Math.round((avgPower + avgStrength + avgCraft) / 3) : 0
  const isLegendary = avgPower >= 60

  const armory: ThunderArmory = { avgPower, avgStrength, avgCraft, isLegendary, overallMight }

  const avgSparkQuality = ingots.length > 0
    ? Math.round(ingots.reduce((s, ig) => s + ig.sparkQuality, 0) / ingots.length) : 0
  const avgTemperPrecision = ingots.length > 0
    ? Math.round(ingots.reduce((s, ig) => s + ig.temperPrecision, 0) / ingots.length) : 0
  const avgStormCraft = avgCraft

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, ig) => ig.qualityScore > best.qualityScore ? ig : best).file : ''
  const mostPowerful = ingots.length > 0
    ? ingots.reduce((best, ig) => ig.lightningPower > best.lightningPower ? ig : best).file : ''
  const strongest = ingots.length > 0
    ? ingots.reduce((best, ig) => ig.anvilStrength > best.anvilStrength ? ig : best).file : ''
  const mostCreative = ingots.length > 0
    ? ingots.reduce((best, ig) => ig.sparkQuality > best.sparkQuality ? ig : best).file : ''
  const bestCraft = ingots.length > 0
    ? ingots.reduce((best, ig) => ig.stormCraft > best.stormCraft ? ig : best).file : ''

  const stats: ThunderForgeStats = {
    totalFiles: ingots.length,
    totalComplexes: complexes.length,
    avgLightningPower: avgPower,
    avgAnvilStrength: avgStrength,
    avgSparkQuality,
    avgTemperPrecision,
    avgStormCraft,
    legendaryWeaponCount: ingots.filter(ig => ig.condition === 'legendary-weapon').length,
    thunderForgedCount: ingots.filter(ig => ig.condition === 'thunder-forged').length,
    properBladeCount: ingots.filter(ig => ig.condition === 'proper-blade').length,
    roughMetalCount: ingots.filter(ig => ig.condition === 'rough-metal').length,
    slagCount: ingots.filter(ig => ig.condition === 'slag').length,
    dustCount: ingots.filter(ig => ig.condition === 'dust').length,
    hasHighPowerCount: ingots.filter(ig => ig.powering.hasHighPower).length,
    hasHighStrengthCount: ingots.filter(ig => ig.enduring.hasHighStrength).length,
    hasHighQualityCount: ingots.filter(ig => ig.creating.hasHighQuality).length,
    hasHighPrecisionCount: ingots.filter(ig => ig.tuning.hasHighPrecision).length,
    hasHighCraftCount: ingots.filter(ig => ig.crafting.hasHighCraft).length,
    overallMight,
    smithGrade: classifySmithGrade(overallMight),
    bestIngot, mostPowerful, strongest, mostCreative, bestCraft,
  }

  const recommendations = generateRecommendations(ingots, complexes, armory, stats)

  return { ingots, complexes, armory, stats, recommendations }
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
