// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Forging grade */
export type ForgingGrade =
  | 'master-forged'
  | 'well-forged'
  | 'proper-blade'
  | 'rough-forged'
  | 'half-formed'
  | 'raw-ore'

/** Hammer grade */
export type HammerGrade =
  | 'surgical-strike'
  | 'precise-blow'
  | 'proper-strike'
  | 'wild-swing'
  | 'mis-hit'
  | 'missed-anvil'

/** Temper grade */
export type TemperGrade =
  | 'perfect-temper'
  | 'spring-steel'
  | 'proper-temper'
  | 'over-hardened'
  | 'too-soft'
  | 'untempered'

/** Spark grade */
export type SparkGrade =
  | 'fireworks'
  | 'bright-sparks'
  | 'proper-sparks'
  | 'few-sparks'
  | 'dull-taps'
  | 'cold-metal'

/** Cooling grade */
export type CoolingGrade =
  | 'controlled-quench'
  | 'proper-cool'
  | 'steady-cool'
  | 'rapid-cool'
  | 'premature-freeze'
  | 'never-cools'

/** Blade condition */
export type BladeCondition =
  | 'legendary-blade'
  | 'master-sword'
  | 'proper-weapon'
  | 'dull-blade'
  | 'bent-nail'
  | 'scrap-metal'

/** Workshop type */
export type WorkshopType =
  | 'master-forge'
  | 'proper-foundry'
  | 'village-smithy'
  | 'backyard-anvil'
  | 'campfire'
  | 'no-forge'

/** Forge condition */
export type ForgeCondition =
  | 'legendary-forge'
  | 'hot-fire'
  | 'warm-coals'
  | 'cooling-embers'
  | 'cold-hearth'
  | 'extinguished'

/** Smith grade */
export type SmithGrade =
  | 'master-smith'
  | 'expert-forger'
  | 'skilled-blacksmith'
  | 'apprentice'
  | 'novice'
  | 'burn-fingers'

/** Forging measurement */
export interface ForgingMeasure {
  strength: number
  grade: ForgingGrade
  hasHighStrength: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasNoWeak: boolean
  hasWellConstructed: boolean
  hasNoFlimsy: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasStrong: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  weakCount: number
  flimsyCount: number
}

/** Hammering measurement */
export interface HammeringMeasure {
  precision: number
  hammer: HammerGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoImprecise: boolean
  hasTargeted: boolean
  hasNoCareless: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasDeliberate: boolean
  hasNoHaphazard: boolean
  hasCalibrated: boolean
  impreciseCount: number
  carelessCount: number
}

/** Tempering measurement */
export interface TemperingMeasure {
  quality: number
  temper: TemperGrade
  hasHighQuality: boolean
  hasBalanced: boolean
  hasFlexible: boolean
  hasNoBrittle: boolean
  hasRightHardness: boolean
  hasNoOverHard: boolean
  hasResilient: boolean
  hasNoRigid: boolean
  hasProperFlex: boolean
  hasNoInflexible: boolean
  hasSpringy: boolean
  brittleCount: number
  rigidCount: number
}

/** Sparking measurement */
export interface SparkingMeasure {
  generation: number
  spark: SparkGrade
  hasHighGeneration: boolean
  hasCreative: boolean
  hasEnergetic: boolean
  hasNoLifeless: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasInnovative: boolean
  hasNoDerivative: boolean
  hasLively: boolean
  hasNoDull: boolean
  hasVibrant: boolean
  lifelessCount: number
  staticCount: number
}

/** Cooling measurement */
export interface CoolingMeasure {
  rate: number
  cooling: CoolingGrade
  hasHighRate: boolean
  hasMeasured: boolean
  hasControlled: boolean
  hasNoRushed: boolean
  hasGradual: boolean
  hasNoAbrupt: boolean
  hasSteady: boolean
  hasNoErratic: boolean
  hasPatient: boolean
  hasNoHasty: boolean
  hasMature: boolean
  rushedCount: number
  abruptCount: number
}

/** Single file analysis */
export interface ForgedBlade {
  file: string
  forgingStrength: number
  hammerPrecision: number
  temperQuality: number
  sparkGeneration: number
  coolingRate: number
  forging: ForgingMeasure
  hammering: HammeringMeasure
  tempering: TemperingMeasure
  sparking: SparkingMeasure
  cooling: CoolingMeasure
  condition: BladeCondition
  qualityScore: number
}

/** Directory-level workshop */
export interface ForgeWorkshop {
  directory: string
  blades: ForgedBlade[]
  avgStrength: number
  avgPrecision: number
  avgTemper: number
  legendaryBladeCount: number
  scrapMetalCount: number
  workshopType: WorkshopType
  condition: ForgeCondition
}

/** Forge summary */
export interface ForgeSummary {
  avgStrength: number
  avgPrecision: number
  avgTemper: number
  isForging: boolean
  overallCraftsmanship: number
}

/** Full stats */
export interface ThunderAnvilStats {
  totalFiles: number
  totalWorkshops: number
  avgForgingStrength: number
  avgHammerPrecision: number
  avgTemperQuality: number
  avgSparkGeneration: number
  avgCoolingRate: number
  legendaryBladeCount: number
  masterSwordCount: number
  properWeaponCount: number
  dullBladeCount: number
  bentNailCount: number
  scrapMetalCount: number
  hasHighStrengthCount: number
  hasHighPrecisionCount: number
  hasHighQualityCount: number
  hasHighGenerationCount: number
  hasHighRateCount: number
  overallCraftsmanship: number
  smithGrade: SmithGrade
  bestBlade: string
  strongest: string
  mostPrecise: string
  bestTempered: string
  mostCreative: string
}

/** Full result */
export interface ThunderAnvilResult {
  blades: ForgedBlade[]
  workshops: ForgeWorkshop[]
  forge: ForgeSummary
  stats: ThunderAnvilStats
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
 * Measure forging strength
 * @example
 * const m = measureForging(content)
 * console.log(m.grade) // 'master-forged'
 */
export function measureForging(content: string): ForgingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasSolid = hasExport(content) && hasImport(content)
  const hasRobust = hasInterface(content) && hasClass(content)
  const hasWellConstructed = hasReturnType(content) && hasGenerics(content)
  const hasDurable = hasConst(content) && hasTypeAlias(content)
  const hasStrong = hasNamedExport(content) && hasDocComments(content)
  const hasResilient = hasAsync(content) && hasExport(content)

  score += hasSolid ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasWellConstructed ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasStrong ? 5 : 0
  score += hasResilient ? 5 : 0

  const strength = Math.min(score, 100)
  const weakCount = count(/\bvar\b/, content)
  const flimsyCount = count(/\bany\b/, content)

  const hasNoWeak = weakCount === 0
  const hasNoFlimsy = flimsyCount === 0
  const hasNoFragile = !has(/\beval\b/, content)
  const hasNoBrittle = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let grade: ForgingGrade
  if (strength >= 85) grade = 'master-forged'
  else if (strength >= 70) grade = 'well-forged'
  else if (strength >= 55) grade = 'proper-blade'
  else if (strength >= 40) grade = 'rough-forged'
  else if (strength >= 25) grade = 'half-formed'
  else grade = 'raw-ore'

  return {
    strength, grade, hasHighStrength, hasSolid, hasRobust, hasNoWeak,
    hasWellConstructed, hasNoFlimsy, hasDurable, hasNoFragile, hasStrong,
    hasNoBrittle, hasResilient, weakCount, flimsyCount,
  }
}

/**
 * Measure hammer precision
 * @example
 * const m = measureHammering(content)
 * console.log(m.hammer) // 'surgical-strike'
 */
export function measureHammering(content: string): HammeringMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasAccurate = hasStrictEq(content) && hasConst(content)
  const hasExact = hasReturnType(content) && hasReadonly(content)
  const hasTargeted = hasPrivate(content) && hasClass(content)
  const hasFocused = hasInterface(content) && hasGenerics(content)
  const hasDeliberate = hasExport(content) && hasTypeAlias(content)
  const hasCalibrated = hasStrictEq(content) && hasReturnType(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasTargeted ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasDeliberate ? 5 : 0
  score += hasCalibrated ? 5 : 0

  const precision = Math.min(score, 100)
  const impreciseCount = count(/\bvar\b/, content)
  const carelessCount = count(/\bany\b/, content)

  const hasNoImprecise = impreciseCount === 0
  const hasNoCareless = carelessCount === 0
  const hasNoScattered = !has(/\beval\b/, content)
  const hasNoHaphazard = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let hammer: HammerGrade
  if (precision >= 85) hammer = 'surgical-strike'
  else if (precision >= 70) hammer = 'precise-blow'
  else if (precision >= 55) hammer = 'proper-strike'
  else if (precision >= 40) hammer = 'wild-swing'
  else if (precision >= 25) hammer = 'mis-hit'
  else hammer = 'missed-anvil'

  return {
    precision, hammer, hasHighPrecision, hasAccurate, hasExact, hasNoImprecise,
    hasTargeted, hasNoCareless, hasFocused, hasNoScattered, hasDeliberate,
    hasNoHaphazard, hasCalibrated, impreciseCount, carelessCount,
  }
}

/**
 * Measure temper quality
 * @example
 * const m = measureTempering(content)
 * console.log(m.temper) // 'perfect-temper'
 */
export function measureTempering(content: string): TemperingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0

  const hasBalanced = hasConst(content) && hasReadonly(content)
  const hasFlexible = hasStrictEq(content) && hasPrivate(content)
  const hasRightHardness = hasReturnType(content) && hasInterface(content)
  const hasResilient = hasGenerics(content) && hasClass(content)
  const hasProperFlex = hasDocComments(content) && hasStrictEq(content)
  const hasSpringy = hasConst(content) && hasGenerics(content)

  score += hasBalanced ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasRightHardness ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasProperFlex ? 5 : 0
  score += hasSpringy ? 5 : 0

  const quality = Math.min(score, 100)
  const brittleCount = count(/\bvar\b/, content)
  const rigidCount = count(/\bany\b/, content)

  const hasNoBrittle = brittleCount === 0
  const hasNoRigid = rigidCount === 0
  const hasNoOverHard = !has(/\beval\b/, content)
  const hasNoInflexible = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let temper: TemperGrade
  if (quality >= 85) temper = 'perfect-temper'
  else if (quality >= 70) temper = 'spring-steel'
  else if (quality >= 55) temper = 'proper-temper'
  else if (quality >= 40) temper = 'over-hardened'
  else if (quality >= 25) temper = 'too-soft'
  else temper = 'untempered'

  return {
    quality, temper, hasHighQuality, hasBalanced, hasFlexible, hasNoBrittle,
    hasRightHardness, hasNoOverHard, hasResilient, hasNoRigid, hasProperFlex,
    hasNoInflexible, hasSpringy, brittleCount, rigidCount,
  }
}

/**
 * Measure spark generation
 * @example
 * const m = measureSparking(content)
 * console.log(m.spark) // 'fireworks'
 */
export function measureSparking(content: string): SparkingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasCreative = hasDocComments(content) && hasAsync(content)
  const hasEnergetic = hasExport(content) && hasInterface(content)
  const hasDynamic = hasGenerics(content) && hasClass(content)
  const hasInnovative = hasNamedExport(content) && hasTypeAlias(content)
  const hasLively = hasConst(content) && hasAsync(content)
  const hasVibrant = hasDocComments(content) && hasGenerics(content)

  score += hasCreative ? 5 : 0
  score += hasEnergetic ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasInnovative ? 5 : 0
  score += hasLively ? 5 : 0
  score += hasVibrant ? 5 : 0

  const generation = Math.min(score, 100)
  const lifelessCount = count(/\bvar\b/, content)
  const staticCount = count(/\bany\b/, content)

  const hasNoLifeless = lifelessCount === 0
  const hasNoStatic = staticCount === 0
  const hasNoDerivative = !has(/\beval\b/, content)
  const hasNoDull = !has(/\bdebugger\b/, content)
  const hasHighGeneration = generation >= 70

  let spark: SparkGrade
  if (generation >= 85) spark = 'fireworks'
  else if (generation >= 70) spark = 'bright-sparks'
  else if (generation >= 55) spark = 'proper-sparks'
  else if (generation >= 40) spark = 'few-sparks'
  else if (generation >= 25) spark = 'dull-taps'
  else spark = 'cold-metal'

  return {
    generation, spark, hasHighGeneration, hasCreative, hasEnergetic, hasNoLifeless,
    hasDynamic, hasNoStatic, hasInnovative, hasNoDerivative, hasLively,
    hasNoDull, hasVibrant, lifelessCount, staticCount,
  }
}

/**
 * Measure cooling rate
 * @example
 * const m = measureCooling(content)
 * console.log(m.cooling) // 'controlled-quench'
 */
export function measureCooling(content: string): CoolingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasMeasured = hasReturnType(content) && hasConst(content)
  const hasControlled = hasReadonly(content) && hasStrictEq(content)
  const hasGradual = hasExport(content) && hasInterface(content)
  const hasSteady = hasDocComments(content) && hasPrivate(content)
  const hasPatient = hasTypeAlias(content) && hasClass(content)
  const hasMature = hasReturnType(content) && hasDocComments(content)

  score += hasMeasured ? 5 : 0
  score += hasControlled ? 5 : 0
  score += hasGradual ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasPatient ? 5 : 0
  score += hasMature ? 5 : 0

  const rate = Math.min(score, 100)
  const rushedCount = count(/\bvar\b/, content)
  const abruptCount = count(/\bany\b/, content)

  const hasNoRushed = rushedCount === 0
  const hasNoAbrupt = abruptCount === 0
  const hasNoErratic = !has(/\beval\b/, content)
  const hasNoHasty = !has(/\bdebugger\b/, content)
  const hasHighRate = rate >= 70

  let cooling: CoolingGrade
  if (rate >= 85) cooling = 'controlled-quench'
  else if (rate >= 70) cooling = 'proper-cool'
  else if (rate >= 55) cooling = 'steady-cool'
  else if (rate >= 40) cooling = 'rapid-cool'
  else if (rate >= 25) cooling = 'premature-freeze'
  else cooling = 'never-cools'

  return {
    rate, cooling, hasHighRate, hasMeasured, hasControlled, hasNoRushed,
    hasGradual, hasNoAbrupt, hasSteady, hasNoErratic, hasPatient,
    hasNoHasty, hasMature, rushedCount, abruptCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify blade condition
 * @example
 * classifyBladeCondition(90) // 'legendary-blade'
 */
export function classifyBladeCondition(score: number): BladeCondition {
  if (score >= 85) return 'legendary-blade'
  if (score >= 70) return 'master-sword'
  if (score >= 55) return 'proper-weapon'
  if (score >= 40) return 'dull-blade'
  if (score >= 25) return 'bent-nail'
  return 'scrap-metal'
}

/**
 * Classify workshop type
 * @example
 * classifyWorkshopType(blades) // 'master-forge'
 */
export function classifyWorkshopType(blades: ForgedBlade[]): WorkshopType {
  if (blades.length === 0) return 'no-forge'
  const avgQs = Math.round(blades.reduce((s, b) => s + b.qualityScore, 0) / blades.length)
  const legendaryRatio = blades.filter(b => b.condition === 'legendary-blade').length / blades.length
  if (avgQs >= 75 && legendaryRatio >= 0.5) return 'master-forge'
  if (avgQs >= 60) return 'proper-foundry'
  if (avgQs >= 45) return 'village-smithy'
  if (avgQs >= 30) return 'backyard-anvil'
  if (avgQs >= 15) return 'campfire'
  return 'no-forge'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'master-smith'
 */
export function classifySmithGrade(avgCraftsmanship: number): SmithGrade {
  if (avgCraftsmanship >= 80) return 'master-smith'
  if (avgCraftsmanship >= 65) return 'expert-forger'
  if (avgCraftsmanship >= 50) return 'skilled-blacksmith'
  if (avgCraftsmanship >= 35) return 'apprentice'
  if (avgCraftsmanship >= 20) return 'novice'
  return 'burn-fingers'
}

/**
 * Classify forge condition
 * @example
 * classifyForgeCondition(80) // 'legendary-forge'
 */
export function classifyForgeCondition(avgQs: number): ForgeCondition {
  if (avgQs >= 75) return 'legendary-forge'
  if (avgQs >= 60) return 'hot-fire'
  if (avgQs >= 45) return 'warm-coals'
  if (avgQs >= 30) return 'cooling-embers'
  if (avgQs >= 15) return 'cold-hearth'
  return 'extinguished'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(blades, workshops, forge, stats)
 */
export function generateRecommendations(
  blades: ForgedBlade[],
  workshops: ForgeWorkshop[],
  forge: ForgeSummary,
  stats: ThunderAnvilStats,
): string[] {
  const recs: string[] = []
  if (stats.avgForgingStrength < 50) {
    recs.push('Strengthen forging with solid exports, robust interfaces, and well-constructed type systems')
  }
  if (stats.avgHammerPrecision < 50) {
    recs.push('Improve hammer precision with accurate strict equality, exact return types, and targeted patterns')
  }
  if (stats.avgTemperQuality < 50) {
    recs.push('Refine temper quality with balanced const/readonly usage, flexible generics, and resilient patterns')
  }
  if (stats.avgSparkGeneration < 50) {
    recs.push('Generate more sparks with creative documentation, energetic async patterns, and dynamic generics')
  }
  if (stats.avgCoolingRate < 50) {
    recs.push('Control cooling rate with measured return types, gradual exports, and patient type coverage')
  }
  if (stats.scrapMetalCount > 0) {
    recs.push(`${stats.scrapMetalCount} file(s) are scrap metal — consider significant refactoring`)
  }
  if (forge.overallCraftsmanship < 40) {
    recs.push('Overall craftsmanship is poor — focus on forging strength and hammer precision first')
  }
  const allNoForge = workshops.every(w => w.workshopType === 'no-forge' || w.workshopType === 'campfire')
  if (allNoForge && workshops.length > 0) {
    recs.push('All workshops are bare or minimal — consider a major quality overhaul')
  }
  const scrap = blades.filter(b => b.condition === 'scrap-metal').map(b => b.file)
  if (scrap.length > 0 && scrap.length <= 3) {
    recs.push(`Reforged these scrap-metal files: ${scrap.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your thunder anvil rings with mastery! Every blade gleams with craftsmanship')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a forged blade
 * @example
 * const blade = analyzeForgedBlade(content, 'index.ts')
 * console.log(blade.condition) // 'legendary-blade'
 */
export function analyzeForgedBlade(content: string, filePath: string): ForgedBlade {
  const forging = measureForging(content)
  const hammering = measureHammering(content)
  const tempering = measureTempering(content)
  const sparking = measureSparking(content)
  const cooling = measureCooling(content)

  const qualityScore = Math.round(
    forging.strength * 0.2 +
    hammering.precision * 0.2 +
    tempering.quality * 0.2 +
    sparking.generation * 0.2 +
    cooling.rate * 0.2,
  )

  return {
    file: filePath,
    forgingStrength: forging.strength,
    hammerPrecision: hammering.precision,
    temperQuality: tempering.quality,
    sparkGeneration: sparking.generation,
    coolingRate: cooling.rate,
    forging,
    hammering,
    tempering,
    sparking,
    cooling,
    condition: classifyBladeCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a forge workshop
 * @example
 * const workshop = analyzeForgeWorkshop(blades, 'src')
 * console.log(workshop.workshopType) // 'master-forge'
 */
export function analyzeForgeWorkshop(blades: ForgedBlade[], dirPath: string): ForgeWorkshop {
  if (blades.length === 0) {
    return {
      directory: dirPath, blades: [], avgStrength: 0, avgPrecision: 0, avgTemper: 0,
      legendaryBladeCount: 0, scrapMetalCount: 0, workshopType: 'no-forge', condition: 'extinguished',
    }
  }

  const avgStrength = Math.round(blades.reduce((s, b) => s + b.forgingStrength, 0) / blades.length)
  const avgPrecision = Math.round(blades.reduce((s, b) => s + b.hammerPrecision, 0) / blades.length)
  const avgTemper = Math.round(blades.reduce((s, b) => s + b.temperQuality, 0) / blades.length)
  const legendaryBladeCount = blades.filter(b => b.condition === 'legendary-blade').length
  const scrapMetalCount = blades.filter(b => b.condition === 'scrap-metal').length
  const avgQs = Math.round(blades.reduce((s, b) => s + b.qualityScore, 0) / blades.length)

  return {
    directory: dirPath, blades, avgStrength, avgPrecision, avgTemper,
    legendaryBladeCount, scrapMetalCount, workshopType: classifyWorkshopType(blades),
    condition: classifyForgeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete thunder anvil result
 * @example
 * const result = await buildThunderAnvilResult(files, contents)
 * console.log(result.stats.smithGrade) // 'master-smith'
 */
export async function buildThunderAnvilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ThunderAnvilResult> {
  const blades = files.map((file, i) => analyzeForgedBlade(contents[i] ?? '', file))

  const dirMap = new Map<string, ForgedBlade[]>()
  for (const blade of blades) {
    const dir = path.dirname(blade.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(blade) } else { dirMap.set(dir, [blade]) }
  }

  const workshops = Array.from(dirMap.entries()).map(([dir, dirBlades]) =>
    analyzeForgeWorkshop(dirBlades, dir),
  )

  const avgStrength = blades.length > 0
    ? Math.round(blades.reduce((s, b) => s + b.forgingStrength, 0) / blades.length) : 0
  const avgPrecision = blades.length > 0
    ? Math.round(blades.reduce((s, b) => s + b.hammerPrecision, 0) / blades.length) : 0
  const avgTemper = blades.length > 0
    ? Math.round(blades.reduce((s, b) => s + b.temperQuality, 0) / blades.length) : 0

  const overallCraftsmanship = blades.length > 0
    ? Math.round((avgStrength + avgPrecision + avgTemper) / 3) : 0
  const isForging = avgStrength >= 60

  const forge: ForgeSummary = { avgStrength, avgPrecision, avgTemper, isForging, overallCraftsmanship }

  const avgSparkGeneration = blades.length > 0
    ? Math.round(blades.reduce((s, b) => s + b.sparkGeneration, 0) / blades.length) : 0
  const avgCoolingRate = blades.length > 0
    ? Math.round(blades.reduce((s, b) => s + b.coolingRate, 0) / blades.length) : 0

  const bestBlade = blades.length > 0
    ? blades.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file : ''
  const strongest = blades.length > 0
    ? blades.reduce((best, b) => b.forgingStrength > best.forgingStrength ? b : best).file : ''
  const mostPrecise = blades.length > 0
    ? blades.reduce((best, b) => b.hammerPrecision > best.hammerPrecision ? b : best).file : ''
  const bestTempered = blades.length > 0
    ? blades.reduce((best, b) => b.temperQuality > best.temperQuality ? b : best).file : ''
  const mostCreative = blades.length > 0
    ? blades.reduce((best, b) => b.sparkGeneration > best.sparkGeneration ? b : best).file : ''

  const stats: ThunderAnvilStats = {
    totalFiles: blades.length,
    totalWorkshops: workshops.length,
    avgForgingStrength: avgStrength,
    avgHammerPrecision: avgPrecision,
    avgTemperQuality: avgTemper,
    avgSparkGeneration,
    avgCoolingRate,
    legendaryBladeCount: blades.filter(b => b.condition === 'legendary-blade').length,
    masterSwordCount: blades.filter(b => b.condition === 'master-sword').length,
    properWeaponCount: blades.filter(b => b.condition === 'proper-weapon').length,
    dullBladeCount: blades.filter(b => b.condition === 'dull-blade').length,
    bentNailCount: blades.filter(b => b.condition === 'bent-nail').length,
    scrapMetalCount: blades.filter(b => b.condition === 'scrap-metal').length,
    hasHighStrengthCount: blades.filter(b => b.forging.hasHighStrength).length,
    hasHighPrecisionCount: blades.filter(b => b.hammering.hasHighPrecision).length,
    hasHighQualityCount: blades.filter(b => b.tempering.hasHighQuality).length,
    hasHighGenerationCount: blades.filter(b => b.sparking.hasHighGeneration).length,
    hasHighRateCount: blades.filter(b => b.cooling.hasHighRate).length,
    overallCraftsmanship,
    smithGrade: classifySmithGrade(overallCraftsmanship),
    bestBlade, strongest, mostPrecise, bestTempered, mostCreative,
  }

  const recommendations = generateRecommendations(blades, workshops, forge, stats)

  return { blades, workshops, forge, stats, recommendations }
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
