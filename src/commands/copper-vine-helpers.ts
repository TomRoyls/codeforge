// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Malleability grade */
export type MalleabilityGrade =
  | 'pure-copper'
  | 'highly-malleable'
  | 'proper-flex'
  | 'stiff-wire'
  | 'rigid-bar'
  | 'cast-iron'

/** Conductivity grade */
export type ConductivityGrade =
  | 'superconductor'
  | 'high-conductivity'
  | 'proper-flow'
  | 'semiconductor'
  | 'resistor'
  | 'insulator'

/** Patina grade */
export type PatinaGrade =
  | 'verdigris-beauty'
  | 'graceful-patina'
  | 'proper-aging'
  | 'premature-rust'
  | 'corroding'
  | 'decaying'

/** Tendril grade */
export type TendrilGrade =
  | 'spreading-vine'
  | 'far-reaching'
  | 'proper-extent'
  | 'short-reach'
  | 'stunted'
  | 'no-growth'

/** Alloy grade */
export type AlloyGrade =
  | 'bronze-strength'
  | 'brass-tough'
  | 'proper-alloy'
  | 'weak-bond'
  | 'brittle-mix'
  | 'no-bond'

/** Copper condition */
export type CopperCondition =
  | 'living-copper'
  | 'growing-vine'
  | 'proper-tendril'
  | 'rigid-wire'
  | 'corroded-pipe'
  | 'scrap-metal'

/** Garden type */
export type GardenType =
  | 'verdigris-garden'
  | 'copper-arbor'
  | 'proper-trellis'
  | 'wire-fence'
  | 'rusty-pipe'
  | 'no-garden'

/** Garden condition */
export type GardenCondition =
  | 'lush-growth'
  | 'healthy-vine'
  | 'decent-garden'
  | 'struggling-plant'
  | 'dead-vine'
  | 'barren'

/** Gardener grade */
export type GardenerGrade =
  | 'master-metallurgist'
  | 'copper-artisan'
  | 'skilled-craftsman'
  | 'apprentice'
  | 'novice'
  | 'scrap-dealer'

/** Bending measurement */
export interface BendingMeasure {
  malleability: number
  grade: MalleabilityGrade
  hasHighMalleability: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasPliable: boolean
  hasNoStiff: boolean
  hasBendable: boolean
  hasNoInflexible: boolean
  hasYielding: boolean
  hasNoStubborn: boolean
  hasShapable: boolean
  rigidCount: number
  stiffCount: number
}

/** Conducting measurement */
export interface ConductingMeasure {
  conductivity: number
  conductor: ConductivityGrade
  hasHighConductivity: boolean
  hasFlowing: boolean
  hasEfficient: boolean
  hasNoBlocked: boolean
  hasConductive: boolean
  hasNoResistant: boolean
  hasRapid: boolean
  hasNoSluggish: boolean
  hasSmooth: boolean
  hasNoBottleneck: boolean
  hasFast: boolean
  blockedCount: number
  resistantCount: number
}

/** Aging measurement */
export interface AgingMeasure {
  wisdom: number
  patina: PatinaGrade
  hasHighWisdom: boolean
  hasMature: boolean
  hasGraceful: boolean
  hasNoDegenerating: boolean
  hasSeasoned: boolean
  hasNoDeteriorating: boolean
  hasAged: boolean
  hasNoFading: boolean
  hasEnduring: boolean
  hasNoCrumbling: boolean
  hasAntique: boolean
  degeneratingCount: number
  deterioratingCount: number
}

/** Reaching measurement */
export interface ReachingMeasure {
  reach: number
  tendril: TendrilGrade
  hasHighReach: boolean
  hasExtensible: boolean
  hasScalable: boolean
  hasNoLimited: boolean
  hasExpandable: boolean
  hasNoConstrained: boolean
  hasReaching: boolean
  hasNoBounded: boolean
  hasGrowing: boolean
  hasNoShrinking: boolean
  hasSpreading: boolean
  limitedCount: number
  constrainedCount: number
}

/** Alloying measurement */
export interface AlloyingMeasure {
  strength: number
  alloy: AlloyGrade
  hasHighStrength: boolean
  hasIntegrated: boolean
  hasConnected: boolean
  hasNoSeparated: boolean
  hasCoupled: boolean
  hasNoDetached: boolean
  hasBound: boolean
  hasNoLoose: boolean
  hasFused: boolean
  hasNoFragmented: boolean
  hasUnited: boolean
  separatedCount: number
  detachedCount: number
}

/** Single file analysis */
export interface CopperTendril {
  file: string
  malleability: number
  conductivity: number
  patinaWisdom: number
  tendrilReach: number
  alloyStrength: number
  bending: BendingMeasure
  conducting: ConductingMeasure
  aging: AgingMeasure
  reaching: ReachingMeasure
  alloying: AlloyingMeasure
  condition: CopperCondition
  qualityScore: number
}

/** Directory-level garden */
export interface CopperGarden {
  directory: string
  tendrils: CopperTendril[]
  avgMalleability: number
  avgConductivity: number
  avgStrength: number
  livingCopperCount: number
  scrapMetalCount: number
  gardenType: GardenType
  condition: GardenCondition
}

/** Forest summary */
export interface ForestSummary {
  avgMalleability: number
  avgConductivity: number
  avgStrength: number
  isGrowing: boolean
  overallVitality: number
}

/** Full stats */
export interface CopperVineStats {
  totalFiles: number
  totalGardens: number
  avgMalleability: number
  avgConductivity: number
  avgPatinaWisdom: number
  avgTendrilReach: number
  avgAlloyStrength: number
  livingCopperCount: number
  growingVineCount: number
  properTendrilCount: number
  rigidWireCount: number
  corrodedPipeCount: number
  scrapMetalCount: number
  hasHighMalleabilityCount: number
  hasHighConductivityCount: number
  hasHighWisdomCount: number
  hasHighReachCount: number
  hasHighStrengthCount: number
  overallVitality: number
  gardenerGrade: GardenerGrade
  bestTendril: string
  mostMalleable: string
  mostConductive: string
  wisest: string
  mostExpansive: string
}

/** Full result */
export interface CopperVineResult {
  tendrils: CopperTendril[]
  gardens: CopperGarden[]
  forest: ForestSummary
  stats: CopperVineStats
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
 * Measure malleability
 * @example
 * const m = measureBending(content)
 * console.log(m.grade) // 'pure-copper'
 */
export function measureBending(content: string): BendingMeasure {
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

  const hasAdaptable = hasExport(content) && hasAsync(content)
  const hasFlexible = hasNamedExport(content) && hasReturnType(content)
  const hasPliable = hasConst(content) && hasImport(content)
  const hasBendable = hasGenerics(content) && hasInterface(content)
  const hasYielding = hasDocComments(content) && hasExport(content)
  const hasShapable = hasTypeAlias(content) && hasConst(content)

  score += hasAdaptable ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasPliable ? 5 : 0
  score += hasBendable ? 5 : 0
  score += hasYielding ? 5 : 0
  score += hasShapable ? 5 : 0

  const malleability = Math.min(score, 100)
  const rigidCount = count(/\bvar\b/, content)
  const stiffCount = count(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoStiff = stiffCount === 0
  const hasNoInflexible = !has(/\beval\b/, content)
  const hasNoStubborn = !has(/\bdebugger\b/, content)
  const hasHighMalleability = malleability >= 70

  let grade: MalleabilityGrade
  if (malleability >= 85) grade = 'pure-copper'
  else if (malleability >= 70) grade = 'highly-malleable'
  else if (malleability >= 55) grade = 'proper-flex'
  else if (malleability >= 40) grade = 'stiff-wire'
  else if (malleability >= 25) grade = 'rigid-bar'
  else grade = 'cast-iron'

  return {
    malleability, grade, hasHighMalleability, hasAdaptable, hasFlexible, hasNoRigid,
    hasPliable, hasNoStiff, hasBendable, hasNoInflexible, hasYielding, hasNoStubborn,
    hasShapable, rigidCount, stiffCount,
  }
}

/**
 * Measure conductivity
 * @example
 * const m = measureConducting(content)
 * console.log(m.conductor) // 'superconductor'
 */
export function measureConducting(content: string): ConductingMeasure {
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

  const hasFlowing = hasReturnType(content) && hasImport(content)
  const hasEfficient = hasExport(content) && hasAsync(content)
  const hasConductive = hasInterface(content) && hasGenerics(content)
  const hasRapid = hasNamedExport(content) && hasConst(content)
  const hasSmooth = hasDocComments(content) && hasExport(content)
  const hasFast = hasClass(content) && hasReturnType(content)

  score += hasFlowing ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasConductive ? 5 : 0
  score += hasRapid ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasFast ? 5 : 0

  const conductivity = Math.min(score, 100)
  const blockedCount = count(/\bvar\b/, content)
  const resistantCount = count(/\bany\b/, content)

  const hasNoBlocked = blockedCount === 0
  const hasNoResistant = resistantCount === 0
  const hasNoSluggish = !has(/\beval\b/, content)
  const hasNoBottleneck = !has(/\bdebugger\b/, content)
  const hasHighConductivity = conductivity >= 70

  let conductor: ConductivityGrade
  if (conductivity >= 85) conductor = 'superconductor'
  else if (conductivity >= 70) conductor = 'high-conductivity'
  else if (conductivity >= 55) conductor = 'proper-flow'
  else if (conductivity >= 40) conductor = 'semiconductor'
  else if (conductivity >= 25) conductor = 'resistor'
  else conductor = 'insulator'

  return {
    conductivity, conductor, hasHighConductivity, hasFlowing, hasEfficient, hasNoBlocked,
    hasConductive, hasNoResistant, hasRapid, hasNoSluggish, hasSmooth, hasNoBottleneck,
    hasFast, blockedCount, resistantCount,
  }
}

/**
 * Measure patina wisdom
 * @example
 * const m = measureAging(content)
 * console.log(m.patina) // 'verdigris-beauty'
 */
export function measureAging(content: string): AgingMeasure {
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

  const hasMature = hasDocComments(content) && hasTypeAlias(content)
  const hasGraceful = hasReadonly(content) && hasPrivate(content)
  const hasSeasoned = hasInterface(content) && hasGenerics(content)
  const hasAged = hasReturnType(content) && hasExport(content)
  const hasEnduring = hasImport(content) && hasClass(content)
  const hasAntique = hasReadonly(content) && hasDocComments(content)

  score += hasMature ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasSeasoned ? 5 : 0
  score += hasAged ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasAntique ? 5 : 0

  const wisdom = Math.min(score, 100)
  const degeneratingCount = count(/\bvar\b/, content)
  const deterioratingCount = count(/\bany\b/, content)

  const hasNoDegenerating = degeneratingCount === 0
  const hasNoDeteriorating = deterioratingCount === 0
  const hasNoFading = !has(/\beval\b/, content)
  const hasNoCrumbling = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let patina: PatinaGrade
  if (wisdom >= 85) patina = 'verdigris-beauty'
  else if (wisdom >= 70) patina = 'graceful-patina'
  else if (wisdom >= 55) patina = 'proper-aging'
  else if (wisdom >= 40) patina = 'premature-rust'
  else if (wisdom >= 25) patina = 'corroding'
  else patina = 'decaying'

  return {
    wisdom, patina, hasHighWisdom, hasMature, hasGraceful, hasNoDegenerating,
    hasSeasoned, hasNoDeteriorating, hasAged, hasNoFading, hasEnduring, hasNoCrumbling,
    hasAntique, degeneratingCount, deterioratingCount,
  }
}

/**
 * Measure tendril reach
 * @example
 * const m = measureReaching(content)
 * console.log(m.tendril) // 'spreading-vine'
 */
export function measureReaching(content: string): ReachingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasExtensible = hasExport(content) && hasInterface(content)
  const hasScalable = hasGenerics(content) && hasAsync(content)
  const hasExpandable = hasNamedExport(content) && hasReturnType(content)
  const hasReaching = hasConst(content) && hasImport(content)
  const hasGrowing = hasTypeAlias(content) && hasClass(content)
  const hasSpreading = hasExport(content) && hasGenerics(content)

  score += hasExtensible ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasExpandable ? 5 : 0
  score += hasReaching ? 5 : 0
  score += hasGrowing ? 5 : 0
  score += hasSpreading ? 5 : 0

  const reach = Math.min(score, 100)
  const limitedCount = count(/\bvar\b/, content)
  const constrainedCount = count(/\bany\b/, content)

  const hasNoLimited = limitedCount === 0
  const hasNoConstrained = constrainedCount === 0
  const hasNoBounded = !has(/\beval\b/, content)
  const hasNoShrinking = !has(/\bdebugger\b/, content)
  const hasHighReach = reach >= 70

  let tendril: TendrilGrade
  if (reach >= 85) tendril = 'spreading-vine'
  else if (reach >= 70) tendril = 'far-reaching'
  else if (reach >= 55) tendril = 'proper-extent'
  else if (reach >= 40) tendril = 'short-reach'
  else if (reach >= 25) tendril = 'stunted'
  else tendril = 'no-growth'

  return {
    reach, tendril, hasHighReach, hasExtensible, hasScalable, hasNoLimited,
    hasExpandable, hasNoConstrained, hasReaching, hasNoBounded, hasGrowing, hasNoShrinking,
    hasSpreading, limitedCount, constrainedCount,
  }
}

/**
 * Measure alloy strength
 * @example
 * const m = measureAlloying(content)
 * console.log(m.alloy) // 'bronze-strength'
 */
export function measureAlloying(content: string): AlloyingMeasure {
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

  const hasIntegrated = hasExport(content) && hasImport(content)
  const hasConnected = hasConst(content) && hasStrictEq(content)
  const hasCoupled = hasInterface(content) && hasClass(content)
  const hasBound = hasReturnType(content) && hasReadonly(content)
  const hasFused = hasAsync(content) && hasExport(content)
  const hasUnited = hasGenerics(content) && hasImport(content)

  score += hasIntegrated ? 5 : 0
  score += hasConnected ? 5 : 0
  score += hasCoupled ? 5 : 0
  score += hasBound ? 5 : 0
  score += hasFused ? 5 : 0
  score += hasUnited ? 5 : 0

  const strength = Math.min(score, 100)
  const separatedCount = count(/\bvar\b/, content)
  const detachedCount = count(/\bany\b/, content)

  const hasNoSeparated = separatedCount === 0
  const hasNoDetached = detachedCount === 0
  const hasNoLoose = !has(/\beval\b/, content)
  const hasNoFragmented = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let alloy: AlloyGrade
  if (strength >= 85) alloy = 'bronze-strength'
  else if (strength >= 70) alloy = 'brass-tough'
  else if (strength >= 55) alloy = 'proper-alloy'
  else if (strength >= 40) alloy = 'weak-bond'
  else if (strength >= 25) alloy = 'brittle-mix'
  else alloy = 'no-bond'

  return {
    strength, alloy, hasHighStrength, hasIntegrated, hasConnected, hasNoSeparated,
    hasCoupled, hasNoDetached, hasBound, hasNoLoose, hasFused, hasNoFragmented,
    hasUnited, separatedCount, detachedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify copper condition
 * @example
 * classifyCopperCondition(90) // 'living-copper'
 */
export function classifyCopperCondition(score: number): CopperCondition {
  if (score >= 85) return 'living-copper'
  if (score >= 70) return 'growing-vine'
  if (score >= 55) return 'proper-tendril'
  if (score >= 40) return 'rigid-wire'
  if (score >= 25) return 'corroded-pipe'
  return 'scrap-metal'
}

/**
 * Classify garden type
 * @example
 * classifyGardenType(tendrils) // 'verdigris-garden'
 */
export function classifyGardenType(tendrils: CopperTendril[]): GardenType {
  if (tendrils.length === 0) return 'no-garden'
  const avgQs = Math.round(tendrils.reduce((s, t) => s + t.qualityScore, 0) / tendrils.length)
  const livingRatio = tendrils.filter(t => t.condition === 'living-copper').length / tendrils.length
  if (avgQs >= 75 && livingRatio >= 0.5) return 'verdigris-garden'
  if (avgQs >= 60) return 'copper-arbor'
  if (avgQs >= 45) return 'proper-trellis'
  if (avgQs >= 30) return 'wire-fence'
  if (avgQs >= 15) return 'rusty-pipe'
  return 'no-garden'
}

/**
 * Classify garden condition
 * @example
 * classifyGardenCondition(80) // 'lush-growth'
 */
export function classifyGardenCondition(avgQs: number): GardenCondition {
  if (avgQs >= 75) return 'lush-growth'
  if (avgQs >= 60) return 'healthy-vine'
  if (avgQs >= 45) return 'decent-garden'
  if (avgQs >= 30) return 'struggling-plant'
  if (avgQs >= 15) return 'dead-vine'
  return 'barren'
}

/**
 * Classify gardener grade
 * @example
 * classifyGardenerGrade(85) // 'master-metallurgist'
 */
export function classifyGardenerGrade(avgVitality: number): GardenerGrade {
  if (avgVitality >= 80) return 'master-metallurgist'
  if (avgVitality >= 65) return 'copper-artisan'
  if (avgVitality >= 50) return 'skilled-craftsman'
  if (avgVitality >= 35) return 'apprentice'
  if (avgVitality >= 20) return 'novice'
  return 'scrap-dealer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(tendrils, gardens, forest, stats)
 */
export function generateRecommendations(
  tendrils: CopperTendril[],
  gardens: CopperGarden[],
  forest: ForestSummary,
  stats: CopperVineStats,
): string[] {
  const recs: string[] = []
  if (stats.avgMalleability < 50) {
    recs.push('Increase malleability with adaptable async/export pairs, flexible named exports, and pliable const/import patterns')
  }
  if (stats.avgConductivity < 50) {
    recs.push('Boost conductivity with flowing return types, efficient async/exports, and conductive interface/generics pairs')
  }
  if (stats.avgPatinaWisdom < 50) {
    recs.push('Grow patina wisdom with mature doc comments, graceful readonly/private guards, and seasoned interface patterns')
  }
  if (stats.avgTendrilReach < 50) {
    recs.push('Extend tendril reach with extensible exports/interfaces, scalable generics/async, and expandable named exports')
  }
  if (stats.avgAlloyStrength < 50) {
    recs.push('Strengthen alloy bonds with integrated export/import pairs, connected const/strict-eq, and coupled interfaces')
  }
  if (stats.scrapMetalCount > 0) {
    recs.push(`${stats.scrapMetalCount} file(s) are scrap metal — consider significant refactoring`)
  }
  if (forest.overallVitality < 40) {
    recs.push('Overall copper vitality is low — focus on malleability and conductivity first')
  }
  const allBarren = gardens.every(g => g.gardenType === 'no-garden' || g.gardenType === 'rusty-pipe')
  if (allBarren && gardens.length > 0) {
    recs.push('All gardens are barren or rusty — consider a major quality overhaul')
  }
  const scraps = tendrils.filter(t => t.condition === 'scrap-metal').map(t => t.file)
  if (scraps.length > 0 && scraps.length <= 3) {
    recs.push(`Refine these scrap metal files into living copper: ${scraps.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your copper vine is master-metallurgist quality! Every tendril grows with strength and wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as copper tendril
 * @example
 * const tendril = analyzeCopperTendril(content, 'index.ts')
 * console.log(tendril.condition) // 'living-copper'
 */
export function analyzeCopperTendril(content: string, filePath: string): CopperTendril {
  const bending = measureBending(content)
  const conducting = measureConducting(content)
  const aging = measureAging(content)
  const reaching = measureReaching(content)
  const alloying = measureAlloying(content)

  const qualityScore = Math.round(
    bending.malleability * 0.2 +
    conducting.conductivity * 0.2 +
    aging.wisdom * 0.2 +
    reaching.reach * 0.2 +
    alloying.strength * 0.2,
  )

  return {
    file: filePath,
    malleability: bending.malleability,
    conductivity: conducting.conductivity,
    patinaWisdom: aging.wisdom,
    tendrilReach: reaching.reach,
    alloyStrength: alloying.strength,
    bending,
    conducting,
    aging,
    reaching,
    alloying,
    condition: classifyCopperCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a copper garden
 * @example
 * const garden = analyzeCopperGarden(tendrils, 'src')
 * console.log(garden.gardenType) // 'verdigris-garden'
 */
export function analyzeCopperGarden(tendrils: CopperTendril[], dirPath: string): CopperGarden {
  if (tendrils.length === 0) {
    return {
      directory: dirPath, tendrils: [], avgMalleability: 0, avgConductivity: 0, avgStrength: 0,
      livingCopperCount: 0, scrapMetalCount: 0, gardenType: 'no-garden', condition: 'barren',
    }
  }

  const avgMalleability = Math.round(tendrils.reduce((s, t) => s + t.malleability, 0) / tendrils.length)
  const avgConductivity = Math.round(tendrils.reduce((s, t) => s + t.conductivity, 0) / tendrils.length)
  const avgStrength = Math.round(tendrils.reduce((s, t) => s + t.alloyStrength, 0) / tendrils.length)
  const livingCopperCount = tendrils.filter(t => t.condition === 'living-copper').length
  const scrapMetalCount = tendrils.filter(t => t.condition === 'scrap-metal').length
  const avgQs = Math.round(tendrils.reduce((s, t) => s + t.qualityScore, 0) / tendrils.length)

  return {
    directory: dirPath, tendrils, avgMalleability, avgConductivity, avgStrength,
    livingCopperCount, scrapMetalCount, gardenType: classifyGardenType(tendrils),
    condition: classifyGardenCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete copper vine result
 * @example
 * const result = await buildCopperVineResult(files, contents)
 * console.log(result.stats.gardenerGrade) // 'master-metallurgist'
 */
export async function buildCopperVineResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperVineResult> {
  const tendrils = files.map((file, i) => analyzeCopperTendril(contents[i] ?? '', file))

  const dirMap = new Map<string, CopperTendril[]>()
  for (const tendril of tendrils) {
    const dir = path.dirname(tendril.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(tendril) } else { dirMap.set(dir, [tendril]) }
  }

  const gardens = Array.from(dirMap.entries()).map(([dir, dirTendrils]) =>
    analyzeCopperGarden(dirTendrils, dir),
  )

  const avgMalleability = tendrils.length > 0
    ? Math.round(tendrils.reduce((s, t) => s + t.malleability, 0) / tendrils.length) : 0
  const avgConductivity = tendrils.length > 0
    ? Math.round(tendrils.reduce((s, t) => s + t.conductivity, 0) / tendrils.length) : 0
  const avgStrength = tendrils.length > 0
    ? Math.round(tendrils.reduce((s, t) => s + t.alloyStrength, 0) / tendrils.length) : 0

  const overallVitality = tendrils.length > 0
    ? Math.round((avgMalleability + avgConductivity + avgStrength) / 3) : 0
  const isGrowing = avgMalleability >= 60

  const forest: ForestSummary = { avgMalleability, avgConductivity, avgStrength, isGrowing, overallVitality }

  const avgPatinaWisdom = tendrils.length > 0
    ? Math.round(tendrils.reduce((s, t) => s + t.patinaWisdom, 0) / tendrils.length) : 0
  const avgTendrilReach = tendrils.length > 0
    ? Math.round(tendrils.reduce((s, t) => s + t.tendrilReach, 0) / tendrils.length) : 0

  const bestTendril = tendrils.length > 0
    ? tendrils.reduce((best, t) => t.qualityScore > best.qualityScore ? t : best).file : ''
  const mostMalleable = tendrils.length > 0
    ? tendrils.reduce((best, t) => t.malleability > best.malleability ? t : best).file : ''
  const mostConductive = tendrils.length > 0
    ? tendrils.reduce((best, t) => t.conductivity > best.conductivity ? t : best).file : ''
  const wisest = tendrils.length > 0
    ? tendrils.reduce((best, t) => t.patinaWisdom > best.patinaWisdom ? t : best).file : ''
  const mostExpansive = tendrils.length > 0
    ? tendrils.reduce((best, t) => t.tendrilReach > best.tendrilReach ? t : best).file : ''

  const stats: CopperVineStats = {
    totalFiles: tendrils.length,
    totalGardens: gardens.length,
    avgMalleability,
    avgConductivity,
    avgPatinaWisdom,
    avgTendrilReach,
    avgAlloyStrength: avgStrength,
    livingCopperCount: tendrils.filter(t => t.condition === 'living-copper').length,
    growingVineCount: tendrils.filter(t => t.condition === 'growing-vine').length,
    properTendrilCount: tendrils.filter(t => t.condition === 'proper-tendril').length,
    rigidWireCount: tendrils.filter(t => t.condition === 'rigid-wire').length,
    corrodedPipeCount: tendrils.filter(t => t.condition === 'corroded-pipe').length,
    scrapMetalCount: tendrils.filter(t => t.condition === 'scrap-metal').length,
    hasHighMalleabilityCount: tendrils.filter(t => t.bending.hasHighMalleability).length,
    hasHighConductivityCount: tendrils.filter(t => t.conducting.hasHighConductivity).length,
    hasHighWisdomCount: tendrils.filter(t => t.aging.hasHighWisdom).length,
    hasHighReachCount: tendrils.filter(t => t.reaching.hasHighReach).length,
    hasHighStrengthCount: tendrils.filter(t => t.alloying.hasHighStrength).length,
    overallVitality,
    gardenerGrade: classifyGardenerGrade(overallVitality),
    bestTendril, mostMalleable, mostConductive, wisest, mostExpansive,
  }

  const recommendations = generateRecommendations(tendrils, gardens, forest, stats)

  return { tendrils, gardens, forest, stats, recommendations }
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
