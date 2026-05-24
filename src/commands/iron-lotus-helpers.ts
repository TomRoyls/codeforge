// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Balance grade for strength-through-fragility */
export type BalanceGrade =
  | 'perfect-paradox'
  | 'iron-delicate'
  | 'proper-balance'
  | 'brute-force'
  | 'fragile-only'
  | 'no-balance'

/** Iron grade for discipline */
export type IronGrade =
  | 'unwavering-iron'
  | 'disciplined-steel'
  | 'proper-metal'
  | 'bending-copper'
  | 'soft-lead'
  | 'no-discipline'

/** Petal grade for precision */
export type PetalGrade =
  | 'micron-perfect'
  | 'fine-craftsmanship'
  | 'proper-detail'
  | 'rough-cut'
  | 'hammered-flat'
  | 'no-precision'

/** Root grade for fortitude */
export type RootGrade =
  | 'iron-roots'
  | 'strong-taproot'
  | 'proper-anchoring'
  | 'shallow-hold'
  | 'loose-soil'
  | 'no-roots'

/** Bloom grade for purity */
export type BloomGrade =
  | 'pure-white'
  | 'clean-bloom'
  | 'proper-lotus'
  | 'tainted-petal'
  | 'polluted-flower'
  | 'no-bloom'

/** Petal condition */
export type PetalCondition =
  | 'mythical-bloom'
  | 'forged-flower'
  | 'proper-lotus'
  | 'rusty-petal'
  | 'wilted-iron'
  | 'scrap-metal'

/** Garden type */
export type GardenType =
  | 'forbidden-garden'
  | 'iron-temple'
  | 'proper-garden'
  | 'wild-patch'
  | 'weed-bed'
  | 'no-garden'

/** Garden condition */
export type GardenCondition =
  | 'divine-bloom'
  | 'beautiful-garden'
  | 'decent-plot'
  | 'neglected-bed'
  | 'overgrown'
  | 'void'

/** Smith grade */
export type SmithGrade =
  | 'divine-smith'
  | 'master-forge'
  | 'skilled-crafter'
  | 'apprentice'
  | 'novice'
  | 'no-smith'

/** Balancing measurement (strength through fragility) */
export interface BalancingMeasure {
  strength: number
  grade: BalanceGrade
  hasHighStrength: boolean
  hasPowerfulButCareful: boolean
  hasEdgeCaseHandling: boolean
  hasNoYolo: boolean
  hasNullSafe: boolean
  hasNoAssumption: boolean
  hasTypeGuarded: boolean
  hasNoCasting: boolean
  hasDefensiveButNotParanoid: boolean
  hasNoOverEngineering: boolean
  hasAppropriate: boolean
  yoloCount: number
  assumptionCount: number
}

/** Disciplining measurement (iron discipline) */
export interface DiscipliningMeasure {
  discipline: number
  iron: IronGrade
  hasHighDiscipline: boolean
  hasConsistent: boolean
  hasUniformStyle: boolean
  hasNoMixed: boolean
  hasStrictTyping: boolean
  hasNoLooseTyping: boolean
  hasEnforcedRules: boolean
  hasNoViolations: boolean
  hasRegularPatterns: boolean
  hasNoAdhoc: boolean
  hasRigorous: boolean
  mixedCount: number
  looseTypingCount: number
}

/** Precisioning measurement (petal precision) */
export interface PrecisioningMeasure {
  precision: number
  petal: PetalGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasSpecific: boolean
  hasNoVague: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasPrecise: boolean
  hasNoSloppy: boolean
  hasSharp: boolean
  approximateCount: number
  vagueCount: number
}

/** Fortifying measurement (root fortitude) */
export interface FortifyingMeasure {
  fortitude: number
  root: RootGrade
  hasHighFortitude: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasSolidBase: boolean
  hasNoShaky: boolean
  hasVerified: boolean
  hasNoUnverified: boolean
  untestedCount: number
  unsafeCount: number
}

/** Purifying measurement (bloom purity) */
export interface PurifyingMeasure {
  purity: number
  bloom: BloomGrade
  hasHighPurity: boolean
  hasNoTechnicalDebt: boolean
  hasNoDeadCode: boolean
  hasNoHackComments: boolean
  hasClean: boolean
  hasNoWorkarounds: boolean
  hasProper: boolean
  hasNoTemporary: boolean
  hasFinal: boolean
  hasNoPrototype: boolean
  hasProduction: boolean
  hackCount: number
  workaroundCount: number
}

/** Single file analysis */
export interface IronPetal {
  file: string
  strengthThroughFragility: number
  ironDiscipline: number
  petalPrecision: number
  rootFortitude: number
  bloomPurity: number
  balancing: BalancingMeasure
  disciplining: DiscipliningMeasure
  precisioning: PrecisioningMeasure
  fortifying: FortifyingMeasure
  purifying: PurifyingMeasure
  condition: PetalCondition
  qualityScore: number
}

/** Directory-level garden */
export interface LotusGarden {
  directory: string
  petals: IronPetal[]
  avgStrength: number
  avgDiscipline: number
  avgPurity: number
  mythicalBloomCount: number
  scrapMetalCount: number
  gardenType: GardenType
  condition: GardenCondition
}

/** Forge summary */
export interface ForgeSummary {
  avgStrength: number
  avgDiscipline: number
  avgPurity: number
  isMythical: boolean
  overallPerfection: number
}

/** Full stats */
export interface IronLotusStats {
  totalFiles: number
  totalGardens: number
  avgStrengthThroughFragility: number
  avgIronDiscipline: number
  avgPetalPrecision: number
  avgRootFortitude: number
  avgBloomPurity: number
  mythicalBloomCount: number
  forgedFlowerCount: number
  properLotusCount: number
  rustyPetalCount: number
  wiltedIronCount: number
  scrapMetalCount: number
  hasHighStrengthCount: number
  hasHighDisciplineCount: number
  hasHighPrecisionCount: number
  hasHighFortitudeCount: number
  hasHighPurityCount: number
  overallPerfection: number
  smithGrade: SmithGrade
  bestPetal: string
  strongest: string
  mostDisciplined: string
  mostPrecise: string
  purest: string
}

/** Full result */
export interface IronLotusResult {
  petals: IronPetal[]
  gardens: LotusGarden[]
  forge: ForgeSummary
  stats: IronLotusStats
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
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure strength through fragility (balancing)
 * @example
 * const m = measureBalancing(content)
 * console.log(m.grade) // 'perfect-paradox'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasPowerfulButCareful = hasStrictEq(content) && hasTryCatch(content)
  const hasEdgeCaseHandling = hasOptional(content) && hasNullishCoalescing(content)
  const hasNullSafe = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasTypeGuarded = hasInterface(content) && hasReturnType(content)
  const hasDefensiveButNotParanoid = hasTryCatch(content) && hasConst(content)
  const hasAppropriate = hasReturnType(content) && hasOptional(content)

  score += hasPowerfulButCareful ? 5 : 0
  score += hasEdgeCaseHandling ? 5 : 0
  score += hasNullSafe ? 5 : 0
  score += hasTypeGuarded ? 5 : 0
  score += hasDefensiveButNotParanoid ? 5 : 0
  score += hasAppropriate ? 5 : 0

  const strength = Math.min(score, 100)
  const yoloCount = countMatches(/\bvar\b/, content)
  const assumptionCount = countMatches(/\bany\b/, content)

  const hasNoYolo = yoloCount === 0
  const hasNoAssumption = assumptionCount === 0
  const hasNoCasting = !has(/\beval\b/, content)
  const hasNoOverEngineering = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let grade: BalanceGrade
  if (strength >= 85) grade = 'perfect-paradox'
  else if (strength >= 70) grade = 'iron-delicate'
  else if (strength >= 55) grade = 'proper-balance'
  else if (strength >= 40) grade = 'brute-force'
  else if (strength >= 25) grade = 'fragile-only'
  else grade = 'no-balance'

  return {
    strength, grade, hasHighStrength, hasPowerfulButCareful, hasEdgeCaseHandling,
    hasNoYolo, hasNullSafe, hasNoAssumption, hasTypeGuarded, hasNoCasting,
    hasDefensiveButNotParanoid, hasNoOverEngineering, hasAppropriate,
    yoloCount, assumptionCount,
  }
}

/**
 * Measure iron discipline (disciplining)
 * @example
 * const m = measureDisciplining(content)
 * console.log(m.iron) // 'unwavering-iron'
 */
export function measureDisciplining(content: string): DiscipliningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasConsistent = hasExport(content) && hasImport(content)
  const hasUniformStyle = hasConst(content) && hasReturnType(content)
  const hasStrictTyping = hasInterface(content) && hasReturnType(content)
  const hasEnforcedRules = hasStrictEq(content) && hasConst(content)
  const hasRegularPatterns = hasNamedExport(content) && hasExport(content)
  const hasRigorous = hasGenerics(content) && hasReadonly(content)

  score += hasConsistent ? 5 : 0
  score += hasUniformStyle ? 5 : 0
  score += hasStrictTyping ? 5 : 0
  score += hasEnforcedRules ? 5 : 0
  score += hasRegularPatterns ? 5 : 0
  score += hasRigorous ? 5 : 0

  const discipline = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const looseTypingCount = countMatches(/\bany\b/, content)

  const hasNoMixed = mixedCount === 0
  const hasNoLooseTyping = looseTypingCount === 0
  const hasNoViolations = !has(/\beval\b/, content)
  const hasNoAdhoc = !has(/\bdebugger\b/, content)
  const hasHighDiscipline = discipline >= 70

  let iron: IronGrade
  if (discipline >= 85) iron = 'unwavering-iron'
  else if (discipline >= 70) iron = 'disciplined-steel'
  else if (discipline >= 55) iron = 'proper-metal'
  else if (discipline >= 40) iron = 'bending-copper'
  else if (discipline >= 25) iron = 'soft-lead'
  else iron = 'no-discipline'

  return {
    discipline, iron, hasHighDiscipline, hasConsistent, hasUniformStyle,
    hasNoMixed, hasStrictTyping, hasNoLooseTyping, hasEnforcedRules,
    hasNoViolations, hasRegularPatterns, hasNoAdhoc, hasRigorous,
    mixedCount, looseTypingCount,
  }
}

/**
 * Measure petal precision (precisioning)
 * @example
 * const m = measurePrecisioning(content)
 * console.log(m.petal) // 'micron-perfect'
 */
export function measurePrecisioning(content: string): PrecisioningMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasAccurate = hasReturnType(content) && hasStrictEq(content)
  const hasExact = hasInterface(content) && hasGenerics(content)
  const hasSpecific = hasConst(content) && hasReturnType(content)
  const hasCorrect = hasDocComments(content) && hasInterface(content)
  const hasPrecise = hasReadonly(content) && hasStrictEq(content)
  const hasSharp = hasOptional(content) && hasNullishCoalescing(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasSpecific ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasSharp ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const vagueCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoAlmostRight = !has(/\beval\b/, content)
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let petal: PetalGrade
  if (precision >= 85) petal = 'micron-perfect'
  else if (precision >= 70) petal = 'fine-craftsmanship'
  else if (precision >= 55) petal = 'proper-detail'
  else if (precision >= 40) petal = 'rough-cut'
  else if (precision >= 25) petal = 'hammered-flat'
  else petal = 'no-precision'

  return {
    precision, petal, hasHighPrecision, hasAccurate, hasExact, hasNoApproximate,
    hasSpecific, hasNoVague, hasCorrect, hasNoAlmostRight, hasPrecise,
    hasNoSloppy, hasSharp, approximateCount, vagueCount,
  }
}

/**
 * Measure root fortitude (fortifying)
 * @example
 * const m = measureFortifying(content)
 * console.log(m.root) // 'iron-roots'
 */
export function measureFortifying(content: string): FortifyingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasClass(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasTested = hasTryCatch(content) && hasReturnType(content)
  const hasTypeSafe = hasInterface(content) && hasReturnType(content)
  const hasWellStructured = hasExport(content) && hasImport(content)
  const hasSolidBase = hasClass(content) && hasPrivate(content)
  const hasVerified = hasStrictEq(content) && hasConst(content)
  const hasNoUnverified = hasGenerics(content) && hasInterface(content)

  score += hasTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasSolidBase ? 5 : 0
  score += hasVerified ? 5 : 0

  const fortitude = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const unsafeCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = unsafeCount === 0
  const hasNoChaotic = !has(/\beval\b/, content)
  const hasNoShaky = !has(/\bdebugger\b/, content)
  const hasHighFortitude = fortitude >= 70

  let root: RootGrade
  if (fortitude >= 85) root = 'iron-roots'
  else if (fortitude >= 70) root = 'strong-taproot'
  else if (fortitude >= 55) root = 'proper-anchoring'
  else if (fortitude >= 40) root = 'shallow-hold'
  else if (fortitude >= 25) root = 'loose-soil'
  else root = 'no-roots'

  return {
    fortitude, root, hasHighFortitude, hasTested, hasNoUntested, hasTypeSafe,
    hasNoUnsafe, hasWellStructured, hasNoChaotic, hasSolidBase, hasNoShaky,
    hasVerified, hasNoUnverified, untestedCount, unsafeCount,
  }
}

/**
 * Measure bloom purity (purifying)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.bloom) // 'pure-white'
 */
export function measurePurifying(content: string): PurifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasNoTechnicalDebt = hasConst(content) && hasStrictEq(content)
  const hasClean = hasDocComments(content) && hasReturnType(content)
  const hasProper = hasInterface(content) && hasNamedExport(content)
  const hasFinal = hasExport(content) && hasImport(content)
  const hasNoDeadCode = hasNamedExport(content) && hasConst(content)
  const hasProduction = hasReadonly(content) && hasReturnType(content)

  score += hasNoTechnicalDebt ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasProper ? 5 : 0
  score += hasFinal ? 5 : 0
  score += hasNoDeadCode ? 5 : 0
  score += hasProduction ? 5 : 0

  const purity = Math.min(score, 100)
  const hackCount = countMatches(/\bvar\b/, content)
  const workaroundCount = countMatches(/\bany\b/, content)

  const hasNoHackComments = hackCount === 0
  const hasNoWorkarounds = workaroundCount === 0
  const hasNoTemporary = !has(/\beval\b/, content)
  const hasNoPrototype = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let bloom: BloomGrade
  if (purity >= 85) bloom = 'pure-white'
  else if (purity >= 70) bloom = 'clean-bloom'
  else if (purity >= 55) bloom = 'proper-lotus'
  else if (purity >= 40) bloom = 'tainted-petal'
  else if (purity >= 25) bloom = 'polluted-flower'
  else bloom = 'no-bloom'

  return {
    purity, bloom, hasHighPurity, hasNoTechnicalDebt, hasNoDeadCode,
    hasNoHackComments, hasClean, hasNoWorkarounds, hasProper, hasNoTemporary,
    hasFinal, hasNoPrototype, hasProduction, hackCount, workaroundCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify petal condition
 * @example
 * classifyPetalCondition(90) // 'mythical-bloom'
 */
export function classifyPetalCondition(score: number): PetalCondition {
  if (score >= 85) return 'mythical-bloom'
  if (score >= 70) return 'forged-flower'
  if (score >= 55) return 'proper-lotus'
  if (score >= 40) return 'rusty-petal'
  if (score >= 25) return 'wilted-iron'
  return 'scrap-metal'
}

/**
 * Classify garden type
 * @example
 * classifyGardenType(petals) // 'forbidden-garden'
 */
export function classifyGardenType(petals: IronPetal[]): GardenType {
  if (petals.length === 0) return 'no-garden'
  const avgQs = Math.round(petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length)
  const mythicalRatio = petals.filter(p => p.condition === 'mythical-bloom').length / petals.length
  if (avgQs >= 75 && mythicalRatio >= 0.5) return 'forbidden-garden'
  if (avgQs >= 60) return 'iron-temple'
  if (avgQs >= 45) return 'proper-garden'
  if (avgQs >= 30) return 'wild-patch'
  if (avgQs >= 15) return 'weed-bed'
  return 'no-garden'
}

/**
 * Classify garden condition
 * @example
 * classifyGardenCondition(80) // 'divine-bloom'
 */
export function classifyGardenCondition(avgQs: number): GardenCondition {
  if (avgQs >= 75) return 'divine-bloom'
  if (avgQs >= 60) return 'beautiful-garden'
  if (avgQs >= 45) return 'decent-plot'
  if (avgQs >= 30) return 'neglected-bed'
  if (avgQs >= 15) return 'overgrown'
  return 'void'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'divine-smith'
 */
export function classifySmithGrade(avgPerfection: number): SmithGrade {
  if (avgPerfection >= 80) return 'divine-smith'
  if (avgPerfection >= 65) return 'master-forge'
  if (avgPerfection >= 50) return 'skilled-crafter'
  if (avgPerfection >= 35) return 'apprentice'
  if (avgPerfection >= 20) return 'novice'
  return 'no-smith'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(petals, gardens, forge, stats)
 */
export function generateRecommendations(
  petals: IronPetal[],
  gardens: LotusGarden[],
  forge: ForgeSummary,
  stats: IronLotusStats,
): string[] {
  const recs: string[] = []
  if (stats.avgStrengthThroughFragility < 50) {
    recs.push('Forge strength through fragility — balance powerful code with delicate edge case handling')
  }
  if (stats.avgIronDiscipline < 50) {
    recs.push('Strengthen iron discipline with consistent patterns, strict typing, and uniform style')
  }
  if (stats.avgPetalPrecision < 50) {
    recs.push('Hone petal precision with exact types, accurate comparisons, and specific constants')
  }
  if (stats.avgRootFortitude < 50) {
    recs.push('Grow root fortitude with tested code, type-safe foundations, and solid base classes')
  }
  if (stats.avgBloomPurity < 50) {
    recs.push('Purify bloom with clean code, no technical debt, proper exports, and final-quality patterns')
  }
  if (stats.scrapMetalCount > 0) {
    recs.push(`${stats.scrapMetalCount} file(s) are scrap metal — they need iron lotus restoration`)
  }
  if (forge.overallPerfection < 40) {
    recs.push('Overall perfection is low — focus on balancing strength and discipline first')
  }
  const allWeeds = gardens.every(g => g.gardenType === 'no-garden' || g.gardenType === 'weed-bed')
  if (allWeeds && gardens.length > 0) {
    recs.push('All gardens are overgrown with weeds — consider a major horticultural redesign')
  }
  const scrapFiles = petals.filter(p => p.condition === 'scrap-metal').map(p => p.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Restore these scrap metal files into iron lotus blooms: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your iron lotus garden achieves divine smith perfection! Every petal blooms with iron grace')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as iron petal
 * @example
 * const p = analyzeIronPetal(content, 'index.ts')
 * console.log(p.condition) // 'mythical-bloom'
 */
export function analyzeIronPetal(content: string, filePath: string): IronPetal {
  const balancing = measureBalancing(content)
  const disciplining = measureDisciplining(content)
  const precisioning = measurePrecisioning(content)
  const fortifying = measureFortifying(content)
  const purifying = measurePurifying(content)

  const qualityScore = Math.round(
    balancing.strength * 0.2 +
    disciplining.discipline * 0.2 +
    precisioning.precision * 0.2 +
    fortifying.fortitude * 0.2 +
    purifying.purity * 0.2,
  )

  return {
    file: filePath,
    strengthThroughFragility: balancing.strength,
    ironDiscipline: disciplining.discipline,
    petalPrecision: precisioning.precision,
    rootFortitude: fortifying.fortitude,
    bloomPurity: purifying.purity,
    balancing,
    disciplining,
    precisioning,
    fortifying,
    purifying,
    condition: classifyPetalCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as lotus garden
 * @example
 * const g = analyzeLotusGarden(petals, 'src')
 * console.log(g.gardenType) // 'forbidden-garden'
 */
export function analyzeLotusGarden(petals: IronPetal[], dirPath: string): LotusGarden {
  if (petals.length === 0) {
    return {
      directory: dirPath, petals: [], avgStrength: 0, avgDiscipline: 0,
      avgPurity: 0, mythicalBloomCount: 0, scrapMetalCount: 0,
      gardenType: 'no-garden', condition: 'void',
    }
  }

  const avgStrength = Math.round(petals.reduce((s, p) => s + p.strengthThroughFragility, 0) / petals.length)
  const avgDiscipline = Math.round(petals.reduce((s, p) => s + p.ironDiscipline, 0) / petals.length)
  const avgPurity = Math.round(petals.reduce((s, p) => s + p.bloomPurity, 0) / petals.length)
  const mythicalBloomCount = petals.filter(p => p.condition === 'mythical-bloom').length
  const scrapMetalCount = petals.filter(p => p.condition === 'scrap-metal').length
  const avgQs = Math.round(petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length)

  return {
    directory: dirPath, petals, avgStrength, avgDiscipline, avgPurity,
    mythicalBloomCount, scrapMetalCount, gardenType: classifyGardenType(petals),
    condition: classifyGardenCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete iron lotus result
 * @example
 * const result = await buildIronLotusResult(files, contents)
 * console.log(result.stats.smithGrade) // 'divine-smith'
 */
export async function buildIronLotusResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronLotusResult> {
  const petals = files.map((file, i) => analyzeIronPetal(contents[i] ?? '', file))

  const dirMap = new Map<string, IronPetal[]>()
  for (const petal of petals) {
    const dir = path.dirname(petal.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(petal) } else { dirMap.set(dir, [petal]) }
  }

  const gardens = Array.from(dirMap.entries()).map(([dir, dirPetals]) =>
    analyzeLotusGarden(dirPetals, dir),
  )

  const avgStrength = petals.length > 0
    ? Math.round(petals.reduce((s, p) => s + p.strengthThroughFragility, 0) / petals.length) : 0
  const avgDiscipline = petals.length > 0
    ? Math.round(petals.reduce((s, p) => s + p.ironDiscipline, 0) / petals.length) : 0
  const avgPurity = petals.length > 0
    ? Math.round(petals.reduce((s, p) => s + p.bloomPurity, 0) / petals.length) : 0

  const overallPerfection = petals.length > 0
    ? Math.round((avgStrength + avgDiscipline + avgPurity) / 3) : 0
  const isMythical = avgStrength >= 60

  const forge: ForgeSummary = { avgStrength, avgDiscipline, avgPurity, isMythical, overallPerfection }

  const avgPetalPrecision = petals.length > 0
    ? Math.round(petals.reduce((s, p) => s + p.petalPrecision, 0) / petals.length) : 0
  const avgRootFortitude = petals.length > 0
    ? Math.round(petals.reduce((s, p) => s + p.rootFortitude, 0) / petals.length) : 0
  const avgBloomPurity = petals.length > 0
    ? Math.round(petals.reduce((s, p) => s + p.bloomPurity, 0) / petals.length) : 0

  const bestPetal = petals.length > 0
    ? petals.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const strongest = petals.length > 0
    ? petals.reduce((best, p) => p.strengthThroughFragility > best.strengthThroughFragility ? p : best).file : ''
  const mostDisciplined = petals.length > 0
    ? petals.reduce((best, p) => p.ironDiscipline > best.ironDiscipline ? p : best).file : ''
  const mostPrecise = petals.length > 0
    ? petals.reduce((best, p) => p.petalPrecision > best.petalPrecision ? p : best).file : ''
  const purest = petals.length > 0
    ? petals.reduce((best, p) => p.bloomPurity > best.bloomPurity ? p : best).file : ''

  const stats: IronLotusStats = {
    totalFiles: petals.length,
    totalGardens: gardens.length,
    avgStrengthThroughFragility: avgStrength,
    avgIronDiscipline: avgDiscipline,
    avgPetalPrecision,
    avgRootFortitude,
    avgBloomPurity,
    mythicalBloomCount: petals.filter(p => p.condition === 'mythical-bloom').length,
    forgedFlowerCount: petals.filter(p => p.condition === 'forged-flower').length,
    properLotusCount: petals.filter(p => p.condition === 'proper-lotus').length,
    rustyPetalCount: petals.filter(p => p.condition === 'rusty-petal').length,
    wiltedIronCount: petals.filter(p => p.condition === 'wilted-iron').length,
    scrapMetalCount: petals.filter(p => p.condition === 'scrap-metal').length,
    hasHighStrengthCount: petals.filter(p => p.balancing.hasHighStrength).length,
    hasHighDisciplineCount: petals.filter(p => p.disciplining.hasHighDiscipline).length,
    hasHighPrecisionCount: petals.filter(p => p.precisioning.hasHighPrecision).length,
    hasHighFortitudeCount: petals.filter(p => p.fortifying.hasHighFortitude).length,
    hasHighPurityCount: petals.filter(p => p.purifying.hasHighPurity).length,
    overallPerfection,
    smithGrade: classifySmithGrade(overallPerfection),
    bestPetal, strongest, mostDisciplined, mostPrecise, purest,
  }

  const recommendations = generateRecommendations(petals, gardens, forge, stats)

  return { petals, gardens, forge, stats, recommendations }
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
