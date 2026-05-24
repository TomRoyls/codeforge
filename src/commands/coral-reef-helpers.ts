// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Biodiversity grade for a file */
export type DiversityGrade =
  | 'great-barrier'
  | 'thriving-reef'
  | 'healthy-colony'
  | 'stressed-reef'
  | 'bleached-coral'
  | 'dead-zone'

/** Colony health classification */
export type ColonyHealth =
  | 'vibrant-colony'
  | 'healthy-colony'
  | 'stable-colony'
  | 'stressed-colony'
  | 'declining-colony'
  | 'collapsed-colony'

/** Polyp strength classification */
export type PolypStrength =
  | 'giant-polyp'
  | 'strong-polyp'
  | 'proper-polyp'
  | 'weak-polyp'
  | 'fragile-polyp'
  | 'dissolved'

/** Reef architecture classification */
export type ReefArchitecture =
  | 'massive-reef'
  | 'branching-reef'
  | 'plate-reef'
  | 'encrusting'
  | 'fragile-framework'
  | 'rubble'

/** Current adaptation classification */
export type CurrentAdaptation =
  | 'deep-current'
  | 'strong-swimmer'
  | 'proper-flow'
  | 'weak-current'
  | 'stagnant'
  | 'beached'

/** Polyp condition */
export type PolypCondition =
  | 'barrier-reef'
  | 'atoll-reef'
  | 'fringing-reef'
  | 'patch-reef'
  | 'dead-coral'
  | 'sandbar'

/** Reef type classification */
export type ReefType =
  | 'great-barrier'
  | 'barrier-reef'
  | 'fringing-reef'
  | 'patch-reef'
  | 'rocky-shore'
  | 'barren-coast'

/** Reef condition classification */
export type ReefCondition =
  | 'pristine-reef'
  | 'healthy-reef'
  | 'fair-reef'
  | 'stressed-reef'
  | 'degraded-reef'
  | 'dead-reef'

/** Marine grade classification */
export type MarineGrade =
  | 'marine-biologist'
  | 'reef-guardian'
  | 'ocean-steward'
  | 'beachcomber'
  | 'tourist'
  | 'polluter'

/** Diversifying measurement */
export interface DiversifyingMeasure {
  diversity: number
  grade: DiversityGrade
  hasHighDiversity: boolean
  hasVaried: boolean
  hasDiverse: boolean
  hasNoMonoculture: boolean
  hasRich: boolean
  hasNoBarren: boolean
  hasColorful: boolean
  hasNoUniform: boolean
  hasAbundant: boolean
  hasNoSparse: boolean
  hasTeeming: boolean
  monocultureCount: number
  barrenCount: number
}

/** Colonizing measurement */
export interface ColonizingMeasure {
  health: number
  colony: ColonyHealth
  hasHighHealth: boolean
  hasConnected: boolean
  hasLinked: boolean
  hasNoIsolated: boolean
  hasCooperative: boolean
  hasNoConflicting: boolean
  hasSymbiotic: boolean
  hasNoParasitic: boolean
  hasIntegrated: boolean
  hasNoFragmented: boolean
  hasCohesive: boolean
  isolatedCount: number
  conflictingCount: number
}

/** Strengthening measurement */
export interface StrengtheningMeasure {
  strength: number
  polyp: PolypStrength
  hasHighStrength: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasDurable: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasTough: boolean
  hasNoCrumbly: boolean
  hasHardy: boolean
  fragileCount: number
  brittleCount: number
}

/** Structuring measurement */
export interface StructuringMeasure {
  structure: number
  architecture: ReefArchitecture
  hasHighStructure: boolean
  hasOrganized: boolean
  hasLayered: boolean
  hasNoChaotic: boolean
  hasStructured: boolean
  hasNoRandom: boolean
  hasPatterned: boolean
  hasNoHaphazard: boolean
  hasSystematic: boolean
  hasNoMessy: boolean
  hasOrdered: boolean
  chaoticCount: number
  randomCount: number
}

/** Adapting measurement */
export interface AdaptingMeasure {
  resilience: number
  adaptation: CurrentAdaptation
  hasHighResilience: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasResponsive: boolean
  hasNoStiff: boolean
  hasEvolving: boolean
  hasNoStuck: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasFlowing: boolean
  rigidCount: number
  stuckCount: number
}

/** Single file analysis result */
export interface CoralPolyp {
  file: string
  biodiversity: number
  colonyHealth: number
  polypStrength: number
  reefStructure: number
  currentResilience: number
  diversifying: DiversifyingMeasure
  colonizing: ColonizingMeasure
  strengthening: StrengtheningMeasure
  structuring: StructuringMeasure
  adapting: AdaptingMeasure
  condition: PolypCondition
  qualityScore: number
}

/** Directory-level reef result */
export interface ReefSystem {
  directory: string
  polyps: CoralPolyp[]
  avgBiodiversity: number
  avgStructure: number
  avgResilience: number
  barrierReefCount: number
  sandbarCount: number
  reefType: ReefType
  condition: ReefCondition
}

/** Ocean-level summary */
export interface CoralOcean {
  avgBiodiversity: number
  avgStructure: number
  avgResilience: number
  isThriving: boolean
  overallHealth: number
}

/** Full analysis stats */
export interface CoralReefStats {
  totalFiles: number
  totalReefs: number
  avgBiodiversity: number
  avgColonyHealth: number
  avgPolypStrength: number
  avgReefStructure: number
  avgCurrentResilience: number
  barrierReefCount: number
  atollReefCount: number
  fringingReefCount: number
  patchReefCount: number
  deadCoralCount: number
  sandbarCount: number
  hasHighDiversityCount: number
  hasHighHealthCount: number
  hasHighStrengthCount: number
  hasHighStructureCount: number
  hasHighResilienceCount: number
  overallHealth: number
  marineGrade: MarineGrade
  bestPolyp: string
  mostDiverse: string
  healthiest: string
  strongest: string
  bestStructured: string
}

/** Full analysis result */
export interface CoralReefResult {
  polyps: CoralPolyp[]
  reefs: ReefSystem[]
  ocean: CoralOcean
  stats: CoralReefStats
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
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure biodiversity of code
 * @example
 * const m = measureDiversifying(content)
 * console.log(m.grade) // 'great-barrier'
 */
export function measureDiversifying(content: string): DiversifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasVaried = hasExport(content) && hasImport(content)
  const hasDiverse = hasInterface(content) && hasClass(content)
  const hasRich = hasGenerics(content) && hasTypeAlias(content)
  const hasColorful = hasAsync(content) && hasDocComments(content)
  const hasAbundant = hasNamedExport(content) && hasConst(content)
  const hasTeeming = hasExport(content) && hasGenerics(content)

  score += hasVaried ? 5 : 0
  score += hasDiverse ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasColorful ? 5 : 0
  score += hasAbundant ? 5 : 0
  score += hasTeeming ? 5 : 0

  const diversity = Math.min(score, 100)
  const monocultureCount = count(/\bvar\b/, content)
  const barrenCount = count(/\bany\b/, content)

  const hasNoMonoculture = monocultureCount === 0
  const hasNoBarren = barrenCount === 0
  const hasNoUniform = !has(/\beval\b/, content)
  const hasNoSparse = !has(/\bdebugger\b/, content)
  const hasHighDiversity = diversity >= 70

  let grade: DiversityGrade
  if (diversity >= 85) grade = 'great-barrier'
  else if (diversity >= 70) grade = 'thriving-reef'
  else if (diversity >= 55) grade = 'healthy-colony'
  else if (diversity >= 40) grade = 'stressed-reef'
  else if (diversity >= 25) grade = 'bleached-coral'
  else grade = 'dead-zone'

  return {
    diversity,
    grade,
    hasHighDiversity,
    hasVaried,
    hasDiverse,
    hasNoMonoculture,
    hasRich,
    hasNoBarren,
    hasColorful,
    hasNoUniform,
    hasAbundant,
    hasNoSparse,
    hasTeeming,
    monocultureCount,
    barrenCount,
  }
}

/**
 * Measure colony health of code
 * @example
 * const m = measureColonizing(content)
 * console.log(m.colony) // 'vibrant-colony'
 */
export function measureColonizing(content: string): ColonizingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0

  const hasConnected = hasExport(content) && hasImport(content)
  const hasLinked = hasGenerics(content) && hasAsync(content)
  const hasCooperative = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasSymbiotic = hasInterface(content) && hasReturnType(content)
  const hasIntegrated = hasNamedExport(content) && hasConst(content)
  const hasCohesive = hasExport(content) && hasInterface(content)

  score += hasConnected ? 5 : 0
  score += hasLinked ? 5 : 0
  score += hasCooperative ? 5 : 0
  score += hasSymbiotic ? 5 : 0
  score += hasIntegrated ? 5 : 0
  score += hasCohesive ? 5 : 0

  const health = Math.min(score, 100)
  const isolatedCount = count(/\bvar\b/, content)
  const conflictingCount = count(/\bany\b/, content)

  const hasNoIsolated = isolatedCount === 0
  const hasNoConflicting = conflictingCount === 0
  const hasNoParasitic = !has(/\beval\b/, content)
  const hasNoFragmented = !has(/\bdebugger\b/, content)
  const hasHighHealth = health >= 70

  let colony: ColonyHealth
  if (health >= 85) colony = 'vibrant-colony'
  else if (health >= 70) colony = 'healthy-colony'
  else if (health >= 55) colony = 'stable-colony'
  else if (health >= 40) colony = 'stressed-colony'
  else if (health >= 25) colony = 'declining-colony'
  else colony = 'collapsed-colony'

  return {
    health,
    colony,
    hasHighHealth,
    hasConnected,
    hasLinked,
    hasNoIsolated,
    hasCooperative,
    hasNoConflicting,
    hasSymbiotic,
    hasNoParasitic,
    hasIntegrated,
    hasNoFragmented,
    hasCohesive,
    isolatedCount,
    conflictingCount,
  }
}

/**
 * Measure polyp strength of code
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.polyp) // 'giant-polyp'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasSolid = hasConst(content) && hasStrictEq(content)
  const hasRobust = hasInterface(content) && hasReadonly(content)
  const hasDurable = hasPrivate(content) && hasReadonly(content)
  const hasResilient = hasReturnType(content) && hasGenerics(content)
  const hasTough = hasExport(content) && hasDocComments(content)
  const hasHardy = hasConst(content) && hasReturnType(content)

  score += hasSolid ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasHardy ? 5 : 0

  const strength = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBrittle = brittleCount === 0
  const hasNoBreakable = !has(/\beval\b/, content)
  const hasNoCrumbly = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let polyp: PolypStrength
  if (strength >= 85) polyp = 'giant-polyp'
  else if (strength >= 70) polyp = 'strong-polyp'
  else if (strength >= 55) polyp = 'proper-polyp'
  else if (strength >= 40) polyp = 'weak-polyp'
  else if (strength >= 25) polyp = 'fragile-polyp'
  else polyp = 'dissolved'

  return {
    strength,
    polyp,
    hasHighStrength,
    hasSolid,
    hasRobust,
    hasNoFragile,
    hasDurable,
    hasNoBrittle,
    hasResilient,
    hasNoBreakable,
    hasTough,
    hasNoCrumbly,
    hasHardy,
    fragileCount,
    brittleCount,
  }
}

/**
 * Measure reef structure of code
 * @example
 * const m = measureStructuring(content)
 * console.log(m.architecture) // 'massive-reef'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasOrganized = hasInterface(content) && hasExport(content)
  const hasLayered = hasClass(content) && hasTypeAlias(content)
  const hasStructured = hasGenerics(content) && hasReadonly(content)
  const hasPatterned = hasNamedExport(content) && hasReturnType(content)
  const hasSystematic = hasPrivate(content) && hasConst(content)
  const hasOrdered = hasInterface(content) && hasClass(content)

  score += hasOrganized ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasPatterned ? 5 : 0
  score += hasSystematic ? 5 : 0
  score += hasOrdered ? 5 : 0

  const structure = Math.min(score, 100)
  const chaoticCount = count(/\bvar\b/, content)
  const randomCount = count(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoRandom = randomCount === 0
  const hasNoHaphazard = !has(/\beval\b/, content)
  const hasNoMessy = !has(/\bdebugger\b/, content)
  const hasHighStructure = structure >= 70

  let architecture: ReefArchitecture
  if (structure >= 85) architecture = 'massive-reef'
  else if (structure >= 70) architecture = 'branching-reef'
  else if (structure >= 55) architecture = 'plate-reef'
  else if (structure >= 40) architecture = 'encrusting'
  else if (structure >= 25) architecture = 'fragile-framework'
  else architecture = 'rubble'

  return {
    structure,
    architecture,
    hasHighStructure,
    hasOrganized,
    hasLayered,
    hasNoChaotic,
    hasStructured,
    hasNoRandom,
    hasPatterned,
    hasNoHaphazard,
    hasSystematic,
    hasNoMessy,
    hasOrdered,
    chaoticCount,
    randomCount,
  }
}

/**
 * Measure current resilience of code
 * @example
 * const m = measureAdapting(content)
 * console.log(m.adaptation) // 'deep-current'
 */
export function measureAdapting(content: string): AdaptingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0

  const hasAdaptable = hasAsync(content) && hasTryCatch(content)
  const hasFlexible = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasResponsive = hasExport(content) && hasImport(content)
  const hasEvolving = hasGenerics(content) && hasAsync(content)
  const hasDynamic = hasInterface(content) && hasReturnType(content)
  const hasFlowing = hasConst(content) && hasExport(content)

  score += hasAdaptable ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasFlowing ? 5 : 0

  const resilience = Math.min(score, 100)
  const rigidCount = count(/\bvar\b/, content)
  const stuckCount = count(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoStuck = stuckCount === 0
  const hasNoStiff = !has(/\beval\b/, content)
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let adaptation: CurrentAdaptation
  if (resilience >= 85) adaptation = 'deep-current'
  else if (resilience >= 70) adaptation = 'strong-swimmer'
  else if (resilience >= 55) adaptation = 'proper-flow'
  else if (resilience >= 40) adaptation = 'weak-current'
  else if (resilience >= 25) adaptation = 'stagnant'
  else adaptation = 'beached'

  return {
    resilience,
    adaptation,
    hasHighResilience,
    hasAdaptable,
    hasFlexible,
    hasNoRigid,
    hasResponsive,
    hasNoStuck,
    hasEvolving,
    hasNoStiff,
    hasDynamic,
    hasNoStatic,
    hasFlowing,
    rigidCount,
    stuckCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify polyp condition based on quality score
 * @example
 * classifyPolypCondition(90) // 'barrier-reef'
 */
export function classifyPolypCondition(score: number): PolypCondition {
  if (score >= 85) return 'barrier-reef'
  if (score >= 70) return 'atoll-reef'
  if (score >= 55) return 'fringing-reef'
  if (score >= 40) return 'patch-reef'
  if (score >= 25) return 'dead-coral'
  return 'sandbar'
}

/**
 * Classify reef type based on polyps
 * @example
 * classifyReefType(polyps) // 'great-barrier'
 */
export function classifyReefType(polyps: CoralPolyp[]): ReefType {
  if (polyps.length === 0) return 'barren-coast'
  const avgQs = Math.round(polyps.reduce((s, p) => s + p.qualityScore, 0) / polyps.length)
  const barrierRatio = polyps.filter(p => p.condition === 'barrier-reef').length / polyps.length
  if (avgQs >= 75 && barrierRatio >= 0.5) return 'great-barrier'
  if (avgQs >= 60) return 'barrier-reef'
  if (avgQs >= 45) return 'fringing-reef'
  if (avgQs >= 30) return 'patch-reef'
  if (avgQs >= 15) return 'rocky-shore'
  return 'barren-coast'
}

/**
 * Classify marine grade based on overall health
 * @example
 * classifyMarineGrade(85) // 'marine-biologist'
 */
export function classifyMarineGrade(avgHealth: number): MarineGrade {
  if (avgHealth >= 80) return 'marine-biologist'
  if (avgHealth >= 65) return 'reef-guardian'
  if (avgHealth >= 50) return 'ocean-steward'
  if (avgHealth >= 35) return 'beachcomber'
  if (avgHealth >= 20) return 'tourist'
  return 'polluter'
}

/**
 * Classify reef condition based on average quality score
 * @example
 * classifyReefCondition(80) // 'pristine-reef'
 */
export function classifyReefCondition(avgQs: number): ReefCondition {
  if (avgQs >= 75) return 'pristine-reef'
  if (avgQs >= 60) return 'healthy-reef'
  if (avgQs >= 45) return 'fair-reef'
  if (avgQs >= 30) return 'stressed-reef'
  if (avgQs >= 15) return 'degraded-reef'
  return 'dead-reef'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(polyps, reefs, ocean, stats)
 */
export function generateRecommendations(
  polyps: CoralPolyp[],
  reefs: ReefSystem[],
  ocean: CoralOcean,
  stats: CoralReefStats,
): string[] {
  const recs: string[] = []
  if (stats.avgBiodiversity < 50) {
    recs.push('Increase biodiversity with varied code patterns, diverse type compositions, and rich abstractions')
  }
  if (stats.avgColonyHealth < 50) {
    recs.push('Improve colony health with stronger interconnections, better imports, and cooperative modules')
  }
  if (stats.avgPolypStrength < 50) {
    recs.push('Strengthen individual polyps with const declarations, strict equality, and robust typing')
  }
  if (stats.avgReefStructure < 50) {
    recs.push('Reinforce reef structure with organized interfaces, layered types, and systematic architecture')
  }
  if (stats.avgCurrentResilience < 50) {
    recs.push('Boost current resilience with async patterns, flexible chaining, and adaptive error handling')
  }
  if (stats.sandbarCount > 0) {
    recs.push(`${stats.sandbarCount} file(s) are sandbars — consider significant refactoring`)
  }
  if (ocean.overallHealth < 40) {
    recs.push('Overall reef health is low — focus on biodiversity and structural improvements')
  }
  const allBarren = reefs.every(r => r.reefType === 'barren-coast' || r.reefType === 'rocky-shore')
  if (allBarren && reefs.length > 0) {
    recs.push('All reef systems are degraded — consider a major quality restoration effort')
  }
  const sandbars = polyps.filter(p => p.condition === 'sandbar').map(p => p.file)
  if (sandbars.length > 0 && sandbars.length <= 3) {
    recs.push(`Restore these sandbar files: ${sandbars.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your coral reef is thriving! The ecosystem is healthy and resilient')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a coral polyp
 * @example
 * const polyp = analyzeCoralPolyp(content, 'index.ts')
 * console.log(polyp.condition) // 'barrier-reef'
 */
export function analyzeCoralPolyp(content: string, filePath: string): CoralPolyp {
  const diversifying = measureDiversifying(content)
  const colonizing = measureColonizing(content)
  const strengthening = measureStrengthening(content)
  const structuring = measureStructuring(content)
  const adapting = measureAdapting(content)

  const qualityScore = Math.round(
    diversifying.diversity * 0.2 +
    colonizing.health * 0.2 +
    strengthening.strength * 0.2 +
    structuring.structure * 0.2 +
    adapting.resilience * 0.2,
  )

  return {
    file: filePath,
    biodiversity: diversifying.diversity,
    colonyHealth: colonizing.health,
    polypStrength: strengthening.strength,
    reefStructure: structuring.structure,
    currentResilience: adapting.resilience,
    diversifying,
    colonizing,
    strengthening,
    structuring,
    adapting,
    condition: classifyPolypCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a reef system
 * @example
 * const reef = analyzeReefSystem(polyps, 'src')
 * console.log(reef.reefType) // 'great-barrier'
 */
export function analyzeReefSystem(polyps: CoralPolyp[], dirPath: string): ReefSystem {
  if (polyps.length === 0) {
    return {
      directory: dirPath,
      polyps: [],
      avgBiodiversity: 0,
      avgStructure: 0,
      avgResilience: 0,
      barrierReefCount: 0,
      sandbarCount: 0,
      reefType: 'barren-coast',
      condition: 'dead-reef',
    }
  }

  const avgBiodiversity = Math.round(polyps.reduce((s, p) => s + p.biodiversity, 0) / polyps.length)
  const avgStructure = Math.round(polyps.reduce((s, p) => s + p.reefStructure, 0) / polyps.length)
  const avgResilience = Math.round(polyps.reduce((s, p) => s + p.currentResilience, 0) / polyps.length)
  const barrierReefCount = polyps.filter(p => p.condition === 'barrier-reef').length
  const sandbarCount = polyps.filter(p => p.condition === 'sandbar').length
  const reefType = classifyReefType(polyps)
  const avgQs = Math.round(polyps.reduce((s, p) => s + p.qualityScore, 0) / polyps.length)

  return {
    directory: dirPath,
    polyps,
    avgBiodiversity,
    avgStructure,
    avgResilience,
    barrierReefCount,
    sandbarCount,
    reefType,
    condition: classifyReefCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete coral reef analysis result
 * @example
 * const result = buildCoralReefResult(files, contents)
 * console.log(result.stats.marineGrade) // 'marine-biologist'
 */
export async function buildCoralReefResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CoralReefResult> {
  const polyps = files.map((file, i) => analyzeCoralPolyp(contents[i] ?? '', file))

  const dirMap = new Map<string, CoralPolyp[]>()
  for (const polyp of polyps) {
    const dir = path.dirname(polyp.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(polyp)
    } else {
      dirMap.set(dir, [polyp])
    }
  }

  const reefs = Array.from(dirMap.entries()).map(([dir, dirPolyps]) =>
    analyzeReefSystem(dirPolyps, dir),
  )

  const avgBiodiversity = polyps.length > 0
    ? Math.round(polyps.reduce((s, p) => s + p.biodiversity, 0) / polyps.length)
    : 0
  const avgStructure = polyps.length > 0
    ? Math.round(polyps.reduce((s, p) => s + p.reefStructure, 0) / polyps.length)
    : 0
  const avgResilience = polyps.length > 0
    ? Math.round(polyps.reduce((s, p) => s + p.currentResilience, 0) / polyps.length)
    : 0

  const overallHealth = polyps.length > 0
    ? Math.round((avgBiodiversity + avgStructure + avgResilience) / 3)
    : 0
  const isThriving = avgBiodiversity >= 60

  const ocean: CoralOcean = { avgBiodiversity, avgStructure, avgResilience, isThriving, overallHealth }

  const avgColonyHealth = polyps.length > 0
    ? Math.round(polyps.reduce((s, p) => s + p.colonyHealth, 0) / polyps.length)
    : 0
  const avgPolypStrength = polyps.length > 0
    ? Math.round(polyps.reduce((s, p) => s + p.polypStrength, 0) / polyps.length)
    : 0
  const avgReefStructure = avgStructure
  const avgCurrentResilience = avgResilience

  const bestPolyp = polyps.length > 0
    ? polyps.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file
    : ''
  const mostDiverse = polyps.length > 0
    ? polyps.reduce((best, p) => p.biodiversity > best.biodiversity ? p : best).file
    : ''
  const healthiest = polyps.length > 0
    ? polyps.reduce((best, p) => p.colonyHealth > best.colonyHealth ? p : best).file
    : ''
  const strongest = polyps.length > 0
    ? polyps.reduce((best, p) => p.polypStrength > best.polypStrength ? p : best).file
    : ''
  const bestStructured = polyps.length > 0
    ? polyps.reduce((best, p) => p.reefStructure > best.reefStructure ? p : best).file
    : ''

  const stats: CoralReefStats = {
    totalFiles: polyps.length,
    totalReefs: reefs.length,
    avgBiodiversity,
    avgColonyHealth,
    avgPolypStrength,
    avgReefStructure,
    avgCurrentResilience,
    barrierReefCount: polyps.filter(p => p.condition === 'barrier-reef').length,
    atollReefCount: polyps.filter(p => p.condition === 'atoll-reef').length,
    fringingReefCount: polyps.filter(p => p.condition === 'fringing-reef').length,
    patchReefCount: polyps.filter(p => p.condition === 'patch-reef').length,
    deadCoralCount: polyps.filter(p => p.condition === 'dead-coral').length,
    sandbarCount: polyps.filter(p => p.condition === 'sandbar').length,
    hasHighDiversityCount: polyps.filter(p => p.diversifying.hasHighDiversity).length,
    hasHighHealthCount: polyps.filter(p => p.colonizing.hasHighHealth).length,
    hasHighStrengthCount: polyps.filter(p => p.strengthening.hasHighStrength).length,
    hasHighStructureCount: polyps.filter(p => p.structuring.hasHighStructure).length,
    hasHighResilienceCount: polyps.filter(p => p.adapting.hasHighResilience).length,
    overallHealth,
    marineGrade: classifyMarineGrade(overallHealth),
    bestPolyp,
    mostDiverse,
    healthiest,
    strongest,
    bestStructured,
  }

  const recommendations = generateRecommendations(polyps, reefs, ocean, stats)

  return { polyps, reefs, ocean, stats, recommendations }
}

/**
 * Gather files matching the given patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  exts: string[],
  ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0
    ? ignore
    : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, {
    cwd: targetPath,
    ignore: ignorePatterns,
    absolute: true,
  })
  return Array.from(new Set(entries)).sort()
}
