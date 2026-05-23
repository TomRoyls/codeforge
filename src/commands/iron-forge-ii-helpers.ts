// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Smelting grade */
export type SmeltingGrade =
  | 'pure-steel'
  | 'refined-iron'
  | 'proper-smelt'
  | 'slag-heavy'
  | 'poor-ore'
  | 'raw-iron'

/** Tempering grade */
export type TemperingGrade =
  | 'perfect-temper'
  | 'spring-steel'
  | 'proper-hardness'
  | 'over-hardened'
  | 'too-soft'
  | 'raw-metal'

/** Anvil endurance grade */
export type AnvilGrade =
  | 'titan-anvil'
  | 'strong-block'
  | 'proper-anvil'
  | 'worn-anvil'
  | 'cracking'
  | 'shattered'

/** Hammer rhythm grade */
export type HammerGrade =
  | 'master-rhythm'
  | 'steady-beat'
  | 'proper-cadence'
  | 'irregular'
  | 'erratic'
  | 'no-rhythm'

/** Chain strength grade */
export type ChainGrade =
  | 'unbreakable-chain'
  | 'strong-links'
  | 'proper-chain'
  | 'weak-links'
  | 'rusty-chain'
  | 'broken-chain'

/** Iron condition */
export type IronCondition =
  | 'masterwork-iron'
  | 'fine-steel'
  | 'proper-forging'
  | 'rough-iron'
  | 'pig-iron'
  | 'scrap-heap'

/** Hall type */
export type HallType =
  | 'grand-forge'
  | 'proper-foundry'
  | 'village-forge'
  | 'camp-fire'
  | 'cold-hearth'
  | 'no-forge'

/** Hall condition */
export type HallCondition =
  | 'white-hot'
  | 'red-hot'
  | 'warm-coals'
  | 'cooling'
  | 'cold'
  | 'extinguished'

/** Blacksmith grade */
export type BlacksmithGrade =
  | 'master-blacksmith'
  | 'expert-forger'
  | 'skilled-smith'
  | 'apprentice'
  | 'novice'
  | 'burn-victim'

/** Smelting measurement */
export interface SmeltingMeasure {
  quality: number
  grade: SmeltingGrade
  hasHighQuality: boolean
  hasRefined: boolean
  hasPure: boolean
  hasNoImpure: boolean
  hasClean: boolean
  hasNoContaminated: boolean
  hasExtracted: boolean
  hasNoWasteful: boolean
  hasConcentrated: boolean
  hasNoDiluted: boolean
  hasHighGrade: boolean
  impureCount: number
  contaminatedCount: number
}

/** Tempering measurement */
export interface TemperingMeasure {
  balance: number
  temper: TemperingGrade
  hasHighBalance: boolean
  hasBalanced: boolean
  hasFlexible: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoRigid: boolean
  hasProperHardness: boolean
  hasNoOverHard: boolean
  hasYielding: boolean
  hasNoStiff: boolean
  hasElastic: boolean
  brittleCount: number
  rigidCount: number
}

/** Enduring measurement */
export interface EnduringMeasure {
  endurance: number
  anvil: AnvilGrade
  hasHighEndurance: boolean
  hasSturdy: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoWeak: boolean
  hasEnduring: boolean
  hasNoBreaking: boolean
  hasResilient: boolean
  hasNoCrumbly: boolean
  hasLasting: boolean
  fragileCount: number
  weakCount: number
}

/** Hammering measurement */
export interface HammeringMeasure {
  rhythm: number
  hammer: HammerGrade
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasSteady: boolean
  hasNoErratic: boolean
  hasMeasured: boolean
  hasNoRandom: boolean
  hasRhythmic: boolean
  hasNoChaotic: boolean
  hasPaced: boolean
  hasNoRushed: boolean
  hasDeliberate: boolean
  erraticCount: number
  chaoticCount: number
}

/** Chaining measurement */
export interface ChainingMeasure {
  strength: number
  chain: ChainGrade
  hasHighStrength: boolean
  hasConnected: boolean
  hasLinked: boolean
  hasNoBroken: boolean
  hasSecure: boolean
  hasNoLoose: boolean
  hasBound: boolean
  hasNoDetached: boolean
  hasCoupled: boolean
  hasNoUnlinked: boolean
  hasIntegrated: boolean
  brokenCount: number
  looseCount: number
}

/** Single file analysis */
export interface ForgedIron {
  file: string
  smeltingQuality: number
  temperingBalance: number
  anvilEndurance: number
  hammerRhythm: number
  chainStrength: number
  smelting: SmeltingMeasure
  tempering: TemperingMeasure
  enduring: EnduringMeasure
  hammering: HammeringMeasure
  chaining: ChainingMeasure
  condition: IronCondition
  qualityScore: number
}

/** Directory-level hall */
export interface ForgeHall {
  directory: string
  irons: ForgedIron[]
  avgSmelting: number
  avgBalance: number
  avgEndurance: number
  masterworkIronCount: number
  scrapHeapCount: number
  hallType: HallType
  condition: HallCondition
}

/** Guild summary */
export interface GuildSummary {
  avgSmelting: number
  avgBalance: number
  avgEndurance: number
  isForging: boolean
  overallStrength: number
}

/** Full stats */
export interface IronForgeIIStats {
  totalFiles: number
  totalHalls: number
  avgSmeltingQuality: number
  avgTemperingBalance: number
  avgAnvilEndurance: number
  avgHammerRhythm: number
  avgChainStrength: number
  masterworkIronCount: number
  fineSteelCount: number
  properForgingCount: number
  roughIronCount: number
  pigIronCount: number
  scrapHeapCount: number
  hasHighQualityCount: number
  hasHighBalanceCount: number
  hasHighEnduranceCount: number
  hasHighRhythmCount: number
  hasHighStrengthCount: number
  overallStrength: number
  blacksmithGrade: BlacksmithGrade
  bestIron: string
  bestSmelted: string
  bestTempered: string
  mostEnduring: string
  strongestChain: string
}

/** Full result */
export interface IronForgeIIResult {
  irons: ForgedIron[]
  halls: ForgeHall[]
  guild: GuildSummary
  stats: IronForgeIIStats
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
 * Measure smelting quality (code extraction/refinement)
 * @example
 * const m = measureSmelting(content)
 * console.log(m.grade) // 'pure-steel'
 */
export function measureSmelting(content: string): SmeltingMeasure {
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

  const hasRefined = hasReturnType(content) && hasStrictEq(content)
  const hasPure = hasDocComments(content) && hasInterface(content)
  const hasExtracted = hasGenerics(content) && hasTypeAlias(content)
  const hasConcentrated = hasConst(content) && hasExport(content)
  const hasClean = hasImport(content) && hasReturnType(content)
  const hasHighGrade = hasStrictEq(content) && hasClass(content)

  score += hasRefined ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasExtracted ? 5 : 0
  score += hasConcentrated ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasHighGrade ? 5 : 0

  const quality = Math.min(score, 100)
  const impureCount = count(/\bvar\b/, content)
  const contaminatedCount = count(/\bany\b/, content)

  const hasNoImpure = impureCount === 0
  const hasNoContaminated = contaminatedCount === 0
  const hasNoWasteful = !has(/\beval\b/, content)
  const hasNoDiluted = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: SmeltingGrade
  if (quality >= 85) grade = 'pure-steel'
  else if (quality >= 70) grade = 'refined-iron'
  else if (quality >= 55) grade = 'proper-smelt'
  else if (quality >= 40) grade = 'slag-heavy'
  else if (quality >= 25) grade = 'poor-ore'
  else grade = 'raw-iron'

  return {
    quality, grade, hasHighQuality, hasRefined, hasPure, hasNoImpure,
    hasClean, hasNoContaminated, hasExtracted, hasNoWasteful, hasConcentrated,
    hasNoDiluted, hasHighGrade, impureCount, contaminatedCount,
  }
}

/**
 * Measure tempering balance (hardness/flexibility)
 * @example
 * const m = measureTempering(content)
 * console.log(m.temper) // 'perfect-temper'
 */
export function measureTempering(content: string): TemperingMeasure {
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

  const hasBalanced = hasReadonly(content) && hasPrivate(content)
  const hasFlexible = hasReturnType(content) && hasStrictEq(content)
  const hasResilient = hasDocComments(content) && hasInterface(content)
  const hasProperHardness = hasGenerics(content) && hasExport(content)
  const hasYielding = hasConst(content) && hasReturnType(content)
  const hasElastic = hasStrictEq(content) && hasClass(content)

  score += hasBalanced ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasProperHardness ? 5 : 0
  score += hasYielding ? 5 : 0
  score += hasElastic ? 5 : 0

  const balance = Math.min(score, 100)
  const brittleCount = count(/\bvar\b/, content)
  const rigidCount = count(/\bany\b/, content)

  const hasNoBrittle = brittleCount === 0
  const hasNoRigid = rigidCount === 0
  const hasNoOverHard = !has(/\beval\b/, content)
  const hasNoStiff = !has(/\bdebugger\b/, content)
  const hasHighBalance = balance >= 70

  let temper: TemperingGrade
  if (balance >= 85) temper = 'perfect-temper'
  else if (balance >= 70) temper = 'spring-steel'
  else if (balance >= 55) temper = 'proper-hardness'
  else if (balance >= 40) temper = 'over-hardened'
  else if (balance >= 25) temper = 'too-soft'
  else temper = 'raw-metal'

  return {
    balance, temper, hasHighBalance, hasBalanced, hasFlexible, hasNoBrittle,
    hasResilient, hasNoRigid, hasProperHardness, hasNoOverHard, hasYielding,
    hasNoStiff, hasElastic, brittleCount, rigidCount,
  }
}

/**
 * Measure anvil endurance (stress endurance)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.anvil) // 'titan-anvil'
 */
export function measureEnduring(content: string): EnduringMeasure {
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

  const hasSturdy = hasInterface(content) && hasClass(content)
  const hasRobust = hasExport(content) && hasImport(content)
  const hasTough = hasGenerics(content) && hasTypeAlias(content)
  const hasEnduring = hasReadonly(content) && hasPrivate(content)
  const hasResilient = hasConst(content) && hasExport(content)
  const hasLasting = hasNamedExport(content) && hasInterface(content)

  score += hasSturdy ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasLasting ? 5 : 0

  const endurance = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const weakCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoWeak = weakCount === 0
  const hasNoBreaking = !has(/\beval\b/, content)
  const hasNoCrumbly = !has(/\bdebugger\b/, content)
  const hasHighEndurance = endurance >= 70

  let anvil: AnvilGrade
  if (endurance >= 85) anvil = 'titan-anvil'
  else if (endurance >= 70) anvil = 'strong-block'
  else if (endurance >= 55) anvil = 'proper-anvil'
  else if (endurance >= 40) anvil = 'worn-anvil'
  else if (endurance >= 25) anvil = 'cracking'
  else anvil = 'shattered'

  return {
    endurance, anvil, hasHighEndurance, hasSturdy, hasRobust, hasNoFragile,
    hasTough, hasNoWeak, hasEnduring, hasNoBreaking, hasResilient,
    hasNoCrumbly, hasLasting, fragileCount, weakCount,
  }
}

/**
 * Measure hammer rhythm (development cadence)
 * @example
 * const m = measureHammering(content)
 * console.log(m.hammer) // 'master-rhythm'
 */
export function measureHammering(content: string): HammeringMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasConsistent = hasStrictEq(content) && hasReturnType(content)
  const hasSteady = hasReadonly(content) && hasPrivate(content)
  const hasMeasured = hasTypeAlias(content) && hasGenerics(content)
  const hasRhythmic = hasDocComments(content) && hasExport(content)
  const hasPaced = hasConst(content) && hasStrictEq(content)
  const hasDeliberate = hasClass(content) && hasReturnType(content)

  score += hasConsistent ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasMeasured ? 5 : 0
  score += hasRhythmic ? 5 : 0
  score += hasPaced ? 5 : 0
  score += hasDeliberate ? 5 : 0

  const rhythm = Math.min(score, 100)
  const erraticCount = count(/\bvar\b/, content)
  const chaoticCount = count(/\bany\b/, content)

  const hasNoErratic = erraticCount === 0
  const hasNoRandom = !has(/\beval\b/, content)
  const hasNoChaotic = chaoticCount === 0
  const hasNoRushed = !has(/\bdebugger\b/, content)
  const hasHighRhythm = rhythm >= 70

  let hammer: HammerGrade
  if (rhythm >= 85) hammer = 'master-rhythm'
  else if (rhythm >= 70) hammer = 'steady-beat'
  else if (rhythm >= 55) hammer = 'proper-cadence'
  else if (rhythm >= 40) hammer = 'irregular'
  else if (rhythm >= 25) hammer = 'erratic'
  else hammer = 'no-rhythm'

  return {
    rhythm, hammer, hasHighRhythm, hasConsistent, hasSteady, hasNoErratic,
    hasMeasured, hasNoRandom, hasRhythmic, hasNoChaotic, hasPaced,
    hasNoRushed, hasDeliberate, erraticCount, chaoticCount,
  }
}

/**
 * Measure chain strength (dependency/link strength)
 * @example
 * const m = measureChaining(content)
 * console.log(m.chain) // 'unbreakable-chain'
 */
export function measureChaining(content: string): ChainingMeasure {
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

  const hasConnected = hasClass(content) && hasInterface(content)
  const hasLinked = hasExport(content) && hasImport(content)
  const hasSecure = hasGenerics(content) && hasTypeAlias(content)
  const hasBound = hasPrivate(content) && hasReadonly(content)
  const hasCoupled = hasAsync(content) && hasReturnType(content)
  const hasIntegrated = hasClass(content) && hasGenerics(content)

  score += hasConnected ? 5 : 0
  score += hasLinked ? 5 : 0
  score += hasSecure ? 5 : 0
  score += hasBound ? 5 : 0
  score += hasCoupled ? 5 : 0
  score += hasIntegrated ? 5 : 0

  const strength = Math.min(score, 100)
  const brokenCount = count(/\bvar\b/, content)
  const looseCount = count(/\bany\b/, content)

  const hasNoBroken = brokenCount === 0
  const hasNoLoose = looseCount === 0
  const hasNoDetached = !has(/\beval\b/, content)
  const hasNoUnlinked = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let chain: ChainGrade
  if (strength >= 85) chain = 'unbreakable-chain'
  else if (strength >= 70) chain = 'strong-links'
  else if (strength >= 55) chain = 'proper-chain'
  else if (strength >= 40) chain = 'weak-links'
  else if (strength >= 25) chain = 'rusty-chain'
  else chain = 'broken-chain'

  return {
    strength, chain, hasHighStrength, hasConnected, hasLinked, hasNoBroken,
    hasSecure, hasNoLoose, hasBound, hasNoDetached, hasCoupled,
    hasNoUnlinked, hasIntegrated, brokenCount, looseCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify iron condition
 * @example
 * classifyIronCondition(90) // 'masterwork-iron'
 */
export function classifyIronCondition(score: number): IronCondition {
  if (score >= 85) return 'masterwork-iron'
  if (score >= 70) return 'fine-steel'
  if (score >= 55) return 'proper-forging'
  if (score >= 40) return 'rough-iron'
  if (score >= 25) return 'pig-iron'
  return 'scrap-heap'
}

/**
 * Classify hall type
 * @example
 * classifyHallType(irons) // 'grand-forge'
 */
export function classifyHallType(irons: ForgedIron[]): HallType {
  if (irons.length === 0) return 'no-forge'
  const avgQs = Math.round(irons.reduce((s, r) => s + r.qualityScore, 0) / irons.length)
  const masterRatio = irons.filter(r => r.condition === 'masterwork-iron').length / irons.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'grand-forge'
  if (avgQs >= 60) return 'proper-foundry'
  if (avgQs >= 45) return 'village-forge'
  if (avgQs >= 30) return 'camp-fire'
  if (avgQs >= 15) return 'cold-hearth'
  return 'no-forge'
}

/**
 * Classify blacksmith grade
 * @example
 * classifyBlacksmithGrade(85) // 'master-blacksmith'
 */
export function classifyBlacksmithGrade(avgStrength: number): BlacksmithGrade {
  if (avgStrength >= 80) return 'master-blacksmith'
  if (avgStrength >= 65) return 'expert-forger'
  if (avgStrength >= 50) return 'skilled-smith'
  if (avgStrength >= 35) return 'apprentice'
  if (avgStrength >= 20) return 'novice'
  return 'burn-victim'
}

/**
 * Classify hall condition
 * @example
 * classifyHallCondition(80) // 'white-hot'
 */
export function classifyHallCondition(avgQs: number): HallCondition {
  if (avgQs >= 75) return 'white-hot'
  if (avgQs >= 60) return 'red-hot'
  if (avgQs >= 45) return 'warm-coals'
  if (avgQs >= 30) return 'cooling'
  if (avgQs >= 15) return 'cold'
  return 'extinguished'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(irons, halls, guild, stats)
 */
export function generateRecommendations(
  irons: ForgedIron[],
  halls: ForgeHall[],
  guild: GuildSummary,
  stats: IronForgeIIStats,
): string[] {
  const recs: string[] = []
  if (stats.avgSmeltingQuality < 50) {
    recs.push('Improve smelting quality with return types, strict equality, and refined type extraction')
  }
  if (stats.avgTemperingBalance < 50) {
    recs.push('Balance tempering with readonly properties, private access, and flexible type patterns')
  }
  if (stats.avgAnvilEndurance < 50) {
    recs.push('Strengthen anvil endurance with durable interfaces, resilient generics, and robust exports')
  }
  if (stats.avgHammerRhythm < 50) {
    recs.push('Steady hammer rhythm with consistent patterns, measured types, and deliberate structure')
  }
  if (stats.avgChainStrength < 50) {
    recs.push('Forge stronger chains with solid classes, linked exports, and secure dependency bonds')
  }
  if (stats.scrapHeapCount > 0) {
    recs.push(`${stats.scrapHeapCount} file(s) are scrap heap — consider significant refactoring`)
  }
  if (guild.overallStrength < 40) {
    recs.push('Overall forge strength is low — focus on smelting quality and tempering balance first')
  }
  const allCold = halls.every(h => h.hallType === 'no-forge' || h.hallType === 'cold-hearth')
  if (allCold && halls.length > 0) {
    recs.push('All forge halls are cold or empty — consider a major quality overhaul')
  }
  const scrap = irons.filter(r => r.condition === 'scrap-heap').map(r => r.file)
  if (scrap.length > 0 && scrap.length <= 3) {
    recs.push(`Reforge these scrap files into iron: ${scrap.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your iron forge produces masterwork! Every ingot is pure steel, every chain unbreakable')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as forged iron
 * @example
 * const iron = analyzeForgedIron(content, 'index.ts')
 * console.log(iron.condition) // 'masterwork-iron'
 */
export function analyzeForgedIron(content: string, filePath: string): ForgedIron {
  const smelting = measureSmelting(content)
  const tempering = measureTempering(content)
  const enduring = measureEnduring(content)
  const hammering = measureHammering(content)
  const chaining = measureChaining(content)

  const qualityScore = Math.round(
    smelting.quality * 0.2 +
    tempering.balance * 0.2 +
    enduring.endurance * 0.2 +
    hammering.rhythm * 0.2 +
    chaining.strength * 0.2,
  )

  return {
    file: filePath,
    smeltingQuality: smelting.quality,
    temperingBalance: tempering.balance,
    anvilEndurance: enduring.endurance,
    hammerRhythm: hammering.rhythm,
    chainStrength: chaining.strength,
    smelting,
    tempering,
    enduring,
    hammering,
    chaining,
    condition: classifyIronCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a forge hall
 * @example
 * const hall = analyzeForgeHall(irons, 'src')
 * console.log(hall.hallType) // 'grand-forge'
 */
export function analyzeForgeHall(irons: ForgedIron[], dirPath: string): ForgeHall {
  if (irons.length === 0) {
    return {
      directory: dirPath, irons: [], avgSmelting: 0, avgBalance: 0, avgEndurance: 0,
      masterworkIronCount: 0, scrapHeapCount: 0, hallType: 'no-forge', condition: 'extinguished',
    }
  }

  const avgSmelting = Math.round(irons.reduce((s, r) => s + r.smeltingQuality, 0) / irons.length)
  const avgBalance = Math.round(irons.reduce((s, r) => s + r.temperingBalance, 0) / irons.length)
  const avgEndurance = Math.round(irons.reduce((s, r) => s + r.anvilEndurance, 0) / irons.length)
  const masterworkIronCount = irons.filter(r => r.condition === 'masterwork-iron').length
  const scrapHeapCount = irons.filter(r => r.condition === 'scrap-heap').length
  const avgQs = Math.round(irons.reduce((s, r) => s + r.qualityScore, 0) / irons.length)

  return {
    directory: dirPath, irons, avgSmelting, avgBalance, avgEndurance,
    masterworkIronCount, scrapHeapCount, hallType: classifyHallType(irons),
    condition: classifyHallCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete iron forge II result
 * @example
 * const result = await buildIronForgeIIResult(files, contents)
 * console.log(result.stats.blacksmithGrade) // 'master-blacksmith'
 */
export async function buildIronForgeIIResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronForgeIIResult> {
  const irons = files.map((file, i) => analyzeForgedIron(contents[i] ?? '', file))

  const dirMap = new Map<string, ForgedIron[]>()
  for (const iron of irons) {
    const dir = path.dirname(iron.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(iron) } else { dirMap.set(dir, [iron]) }
  }

  const halls = Array.from(dirMap.entries()).map(([dir, dirIrons]) =>
    analyzeForgeHall(dirIrons, dir),
  )

  const avgSmelting = irons.length > 0
    ? Math.round(irons.reduce((s, r) => s + r.smeltingQuality, 0) / irons.length) : 0
  const avgBalance = irons.length > 0
    ? Math.round(irons.reduce((s, r) => s + r.temperingBalance, 0) / irons.length) : 0
  const avgEndurance = irons.length > 0
    ? Math.round(irons.reduce((s, r) => s + r.anvilEndurance, 0) / irons.length) : 0

  const overallStrength = irons.length > 0
    ? Math.round((avgSmelting + avgBalance + avgEndurance) / 3) : 0
  const isForging = avgSmelting >= 60

  const guild: GuildSummary = { avgSmelting, avgBalance, avgEndurance, isForging, overallStrength }

  const avgHammerRhythm = irons.length > 0
    ? Math.round(irons.reduce((s, r) => s + r.hammerRhythm, 0) / irons.length) : 0
  const avgChainStrength = irons.length > 0
    ? Math.round(irons.reduce((s, r) => s + r.chainStrength, 0) / irons.length) : 0

  const bestIron = irons.length > 0
    ? irons.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const bestSmelted = irons.length > 0
    ? irons.reduce((best, r) => r.smeltingQuality > best.smeltingQuality ? r : best).file : ''
  const bestTempered = irons.length > 0
    ? irons.reduce((best, r) => r.temperingBalance > best.temperingBalance ? r : best).file : ''
  const mostEnduring = irons.length > 0
    ? irons.reduce((best, r) => r.anvilEndurance > best.anvilEndurance ? r : best).file : ''
  const strongestChain = irons.length > 0
    ? irons.reduce((best, r) => r.chainStrength > best.chainStrength ? r : best).file : ''

  const stats: IronForgeIIStats = {
    totalFiles: irons.length,
    totalHalls: halls.length,
    avgSmeltingQuality: avgSmelting,
    avgTemperingBalance: avgBalance,
    avgAnvilEndurance: avgEndurance,
    avgHammerRhythm,
    avgChainStrength,
    masterworkIronCount: irons.filter(r => r.condition === 'masterwork-iron').length,
    fineSteelCount: irons.filter(r => r.condition === 'fine-steel').length,
    properForgingCount: irons.filter(r => r.condition === 'proper-forging').length,
    roughIronCount: irons.filter(r => r.condition === 'rough-iron').length,
    pigIronCount: irons.filter(r => r.condition === 'pig-iron').length,
    scrapHeapCount: irons.filter(r => r.condition === 'scrap-heap').length,
    hasHighQualityCount: irons.filter(r => r.smelting.hasHighQuality).length,
    hasHighBalanceCount: irons.filter(r => r.tempering.hasHighBalance).length,
    hasHighEnduranceCount: irons.filter(r => r.enduring.hasHighEndurance).length,
    hasHighRhythmCount: irons.filter(r => r.hammering.hasHighRhythm).length,
    hasHighStrengthCount: irons.filter(r => r.chaining.hasHighStrength).length,
    overallStrength,
    blacksmithGrade: classifyBlacksmithGrade(overallStrength),
    bestIron, bestSmelted, bestTempered, mostEnduring, strongestChain,
  }

  const recommendations = generateRecommendations(irons, halls, guild, stats)

  return { irons, halls, guild, stats, recommendations }
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
