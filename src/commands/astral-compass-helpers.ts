// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Navigation clarity grade */
export type ClarityGrade =
  | 'crystal-chart'
  | 'clear-sky'
  | 'proper-bearings'
  | 'cloudy-night'
  | 'lost-at-sea'
  | 'no-navigation'

/** Constellation structure grade */
export type ConstellationGrade =
  | 'great-dipper'
  | 'orion-belt'
  | 'proper-stars'
  | 'scattered-lights'
  | 'random-dots'
  | 'no-pattern'

/** Stellar organization grade */
export type StellarGrade =
  | 'galactic-core'
  | 'star-system'
  | 'proper-orbit'
  | 'drifting-asteroids'
  | 'space-debris'
  | 'no-organization'

/** Orbit harmony grade */
export type OrbitGrade =
  | 'perfect-orbit'
  | 'stable-orbit'
  | 'proper-path'
  | 'elliptical-drift'
  | 'collision-course'
  | 'chaotic-orbit'

/** North star alignment grade */
export type NorthStarGrade =
  | 'true-north'
  | 'steady-bearings'
  | 'proper-aim'
  | 'drifting-compass'
  | 'lost-direction'
  | 'no-north'

/** Star point condition */
export type StarCondition =
  | 'pole-star'
  | 'bright-star'
  | 'proper-star'
  | 'dim-star'
  | 'dark-matter'
  | 'void'

/** Star system type */
export type SystemType =
  | 'galaxy-core'
  | 'star-cluster'
  | 'proper-system'
  | 'binary-system'
  | 'rogue-planet'
  | 'no-system'

/** Star system condition */
export type SystemCondition =
  | 'brilliant-cosmos'
  | 'starlit-sky'
  | 'decent-constellation'
  | 'dim-nebula'
  | 'dark-void'
  | 'void'

/** Navigator grade */
export type NavigatorGrade =
  | 'grand-astronomer'
  | 'star-captain'
  | 'skilled-navigator'
  | 'apprentice'
  | 'novice'
  | 'landlubber'

/** Navigating measurement */
export interface NavigatingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasWellStructured: boolean
  hasNoObfuscated: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasLogical: boolean
  hasNoChaotic: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasNavigable: boolean
  obfuscatedCount: number
  undocumentedCount: number
}

/** Patterning measurement */
export interface PatterningMeasure {
  structure: number
  constellation: ConstellationGrade
  hasHighStructure: boolean
  hasOrganized: boolean
  hasGrouped: boolean
  hasNoScattered: boolean
  hasHierarchical: boolean
  hasNoFlat: boolean
  hasLayered: boolean
  hasNoEntangled: boolean
  hasClustered: boolean
  hasNoIsolated: boolean
  hasCohesive: boolean
  scatteredCount: number
  flatCount: number
}

/** Organizing measurement */
export interface OrganizingMeasure {
  organization: number
  stellar: StellarGrade
  hasHighOrganization: boolean
  hasCleanExports: boolean
  hasNamedImports: boolean
  hasNoStarImports: boolean
  hasProperModules: boolean
  hasNoBarrelLeaking: boolean
  hasTreeShakeable: boolean
  hasNoSideEffects: boolean
  hasScopedImports: boolean
  hasNoPollution: boolean
  hasExplicitReexports: boolean
  starImportCount: number
  barrelLeakingCount: number
}

/** Harmonizing measurement */
export interface HarmonizingMeasure {
  harmony: number
  orbit: OrbitGrade
  hasHighHarmony: boolean
  hasBalancedDeps: boolean
  hasNoCircular: boolean
  hasLooseCoupling: boolean
  hasNoTightCoupling: boolean
  hasMinimalDeps: boolean
  hasNoOverDependence: boolean
  hasStableAPI: boolean
  hasNoBreakingChanges: boolean
  hasVersioned: boolean
  hasNoUnpinned: boolean
  circularCount: number
  tightCouplingCount: number
}

/** Aligning measurement */
export interface AligningMeasure {
  alignment: number
  northStar: NorthStarGrade
  hasHighAlignment: boolean
  hasClearPurpose: boolean
  hasSingleResponsibility: boolean
  hasNoMixedConcerns: boolean
  hasConsistentNaming: boolean
  hasNoMisnamed: boolean
  hasDomainAligned: boolean
  hasNoLeakyAbstraction: boolean
  hasCohesive: boolean
  hasNoScatteredLogic: boolean
  hasIntentional: boolean
  mixedConcernsCount: number
  misnamedCount: number
}

/** Single file analysis */
export interface StarPoint {
  file: string
  navigationClarity: number
  constellationStructure: number
  stellarOrganization: number
  orbitHarmony: number
  northStarAlignment: number
  navigating: NavigatingMeasure
  patterning: PatterningMeasure
  organizing: OrganizingMeasure
  harmonizing: HarmonizingMeasure
  aligning: AligningMeasure
  condition: StarCondition
  qualityScore: number
}

/** Directory-level system */
export interface StarSystem {
  directory: string
  points: StarPoint[]
  avgNavigation: number
  avgOrganization: number
  avgAlignment: number
  poleStarCount: number
  voidCount: number
  systemType: SystemType
  condition: SystemCondition
}

/** Cosmos summary */
export interface CosmosSummary {
  avgNavigation: number
  avgOrganization: number
  avgAlignment: number
  isAligned: boolean
  overallClarity: number
}

/** Full stats */
export interface AstralCompassStats {
  totalFiles: number
  totalSystems: number
  avgNavigationClarity: number
  avgConstellationStructure: number
  avgStellarOrganization: number
  avgOrbitHarmony: number
  avgNorthStarAlignment: number
  poleStarCount: number
  brightStarCount: number
  properStarCount: number
  dimStarCount: number
  darkMatterCount: number
  voidCount: number
  hasHighClarityCount: number
  hasHighStructureCount: number
  hasHighOrganizationCount: number
  hasHighHarmonyCount: number
  hasHighAlignmentCount: number
  overallClarity: number
  navigatorGrade: NavigatorGrade
  bestPoint: string
  clearest: string
  mostStructured: string
  mostOrganized: string
  mostHarmonious: string
}

/** Full result */
export interface AstralCompassResult {
  points: StarPoint[]
  systems: StarSystem[]
  cosmos: CosmosSummary
  stats: AstralCompassStats
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
const hasDefaultExport = (c: string) => has(/\bexport\s+default\b/, c)
const hasStarImport = (c: string) => has(/\bimport\s+\*\s+as\b/, c)
const hasReexport = (c: string) => has(/\bexport\s+\{[^}]*\}\s+from\b/, c)
const hasNamespace = (c: string) => has(/\bnamespace\b/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure navigation clarity
 * @example
 * const m = measureNavigating(content)
 * console.log(m.grade) // 'crystal-chart'
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasReadable = hasConst(content) && hasExport(content)
  const hasWellStructured = hasInterface(content) && hasReturnType(content)
  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasLogical = hasAsync(content) && hasReturnType(content)
  const hasConsistent = hasStrictEq(content) && hasConst(content)
  const hasNavigable = hasNamedExport(content) && hasImport(content)

  score += hasReadable ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasLogical ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasNavigable ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const undocumentedCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoUndocumented = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasNoInconsistent = undocumentedCount === 0
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'crystal-chart'
  else if (clarity >= 70) grade = 'clear-sky'
  else if (clarity >= 55) grade = 'proper-bearings'
  else if (clarity >= 40) grade = 'cloudy-night'
  else if (clarity >= 25) grade = 'lost-at-sea'
  else grade = 'no-navigation'

  return {
    clarity, grade, hasHighClarity, hasReadable, hasWellStructured, hasNoObfuscated,
    hasDocumented, hasNoUndocumented, hasLogical, hasNoChaotic, hasConsistent,
    hasNoInconsistent, hasNavigable, obfuscatedCount, undocumentedCount,
  }
}

/**
 * Measure constellation structure
 * @example
 * const m = measurePatterning(content)
 * console.log(m.constellation) // 'great-dipper'
 */
export function measurePatterning(content: string): PatterningMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasNamespace(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0

  const hasOrganized = hasInterface(content) && hasClass(content)
  const hasGrouped = hasExport(content) && hasImport(content)
  const hasHierarchical = hasClass(content) && hasPrivate(content)
  const hasLayered = hasAsync(content) && hasReturnType(content)
  const hasClustered = hasGenerics(content) && hasInterface(content)
  const hasCohesive = hasConst(content) && hasNamedExport(content)

  score += hasOrganized ? 5 : 0
  score += hasGrouped ? 5 : 0
  score += hasHierarchical ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasClustered ? 5 : 0

  const structure = Math.min(score, 100)
  const scatteredCount = countMatches(/\bvar\b/, content)
  const flatCount = countMatches(/\bany\b/, content)

  const hasNoScattered = scatteredCount === 0
  const hasNoFlat = flatCount === 0
  const hasNoEntangled = !has(/\beval\b/, content)
  const hasNoIsolated = !has(/\bdebugger\b/, content)
  const hasHighStructure = structure >= 70

  let constellation: ConstellationGrade
  if (structure >= 85) constellation = 'great-dipper'
  else if (structure >= 70) constellation = 'orion-belt'
  else if (structure >= 55) constellation = 'proper-stars'
  else if (structure >= 40) constellation = 'scattered-lights'
  else if (structure >= 25) constellation = 'random-dots'
  else constellation = 'no-pattern'

  return {
    structure, constellation, hasHighStructure, hasOrganized, hasGrouped, hasNoScattered,
    hasHierarchical, hasNoFlat, hasLayered, hasNoEntangled, hasClustered, hasNoIsolated,
    hasCohesive, scatteredCount, flatCount,
  }
}

/**
 * Measure stellar organization
 * @example
 * const m = measureOrganizing(content)
 * console.log(m.stellar) // 'galactic-core'
 */
export function measureOrganizing(content: string): OrganizingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 12 : 0
  score += hasImport(content) ? 12 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasCleanExports = hasNamedExport(content) && !hasDefaultExport(content)
  const hasNamedImports = hasImport(content) && !hasStarImport(content)
  const hasProperModules = hasExport(content) && hasImport(content)
  const hasTreeShakeable = hasNamedExport(content) && !hasDefaultExport(content)
  const hasScopedImports = hasImport(content) && hasConst(content)
  const hasExplicitReexports = hasReexport(content)

  score += hasCleanExports ? 5 : 0
  score += hasNamedImports ? 5 : 0
  score += hasProperModules ? 5 : 0
  score += hasTreeShakeable ? 5 : 0

  const organization = Math.min(score, 100)
  const starImportCount = countMatches(/\bimport\s+\*\s+as\b/, content)
  const barrelLeakingCount = countMatches(/\bexport\s+\*\s+from\b/, content)

  const hasNoStarImports = starImportCount === 0
  const hasNoBarrelLeaking = barrelLeakingCount === 0
  const hasNoSideEffects = !has(/\beval\b/, content)
  const hasNoPollution = !has(/\bdebugger\b/, content)
  const hasHighOrganization = organization >= 70

  let stellar: StellarGrade
  if (organization >= 85) stellar = 'galactic-core'
  else if (organization >= 70) stellar = 'star-system'
  else if (organization >= 55) stellar = 'proper-orbit'
  else if (organization >= 40) stellar = 'drifting-asteroids'
  else if (organization >= 25) stellar = 'space-debris'
  else stellar = 'no-organization'

  return {
    organization, stellar, hasHighOrganization, hasCleanExports, hasNamedImports,
    hasNoStarImports, hasProperModules, hasNoBarrelLeaking, hasTreeShakeable,
    hasNoSideEffects, hasScopedImports, hasNoPollution, hasExplicitReexports,
    starImportCount, barrelLeakingCount,
  }
}

/**
 * Measure orbit harmony
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.orbit) // 'perfect-orbit'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasReturnType(content) ? 12 : 0
  score += hasStrictEq(content) ? 12 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0

  const hasBalancedDeps = hasExport(content) && hasImport(content)
  const hasLooseCoupling = hasInterface(content) && hasReturnType(content)
  const hasMinimalDeps = hasConst(content) && !hasStarImport(content)
  const hasStableAPI = hasReturnType(content) && hasStrictEq(content)
  const hasVersioned = hasReadonly(content) && hasPrivate(content)

  score += hasBalancedDeps ? 5 : 0
  score += hasLooseCoupling ? 5 : 0
  score += hasMinimalDeps ? 5 : 0
  score += hasStableAPI ? 5 : 0

  const harmony = Math.min(score, 100)
  const circularCount = countMatches(/\bvar\b/, content)
  const tightCouplingCount = countMatches(/\bany\b/, content)

  const hasNoCircular = circularCount === 0
  const hasNoTightCoupling = tightCouplingCount === 0
  const hasNoOverDependence = !has(/\beval\b/, content)
  const hasNoBreakingChanges = !has(/\bdebugger\b/, content)
  const hasNoUnpinned = !hasStarImport(content)
  const hasHighHarmony = harmony >= 70

  let orbit: OrbitGrade
  if (harmony >= 85) orbit = 'perfect-orbit'
  else if (harmony >= 70) orbit = 'stable-orbit'
  else if (harmony >= 55) orbit = 'proper-path'
  else if (harmony >= 40) orbit = 'elliptical-drift'
  else if (harmony >= 25) orbit = 'collision-course'
  else orbit = 'chaotic-orbit'

  return {
    harmony, orbit, hasHighHarmony, hasBalancedDeps, hasNoCircular, hasLooseCoupling,
    hasNoTightCoupling, hasMinimalDeps, hasNoOverDependence, hasStableAPI,
    hasNoBreakingChanges, hasVersioned, hasNoUnpinned, circularCount, tightCouplingCount,
  }
}

/**
 * Measure north star alignment
 * @example
 * const m = measureAligning(content)
 * console.log(m.northStar) // 'true-north'
 */
export function measureAligning(content: string): AligningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasClearPurpose = hasNamedExport(content) && hasReturnType(content)
  const hasSingleResponsibility = hasExport(content) && hasInterface(content)
  const hasConsistentNaming = hasConst(content) && hasImport(content)
  const hasDomainAligned = hasGenerics(content) && hasInterface(content)
  const hasCohesive = hasClass(content) && hasPrivate(content)
  const hasIntentional = hasDocComments(content) && hasReturnType(content)

  score += hasClearPurpose ? 5 : 0
  score += hasSingleResponsibility ? 5 : 0
  score += hasConsistentNaming ? 5 : 0
  score += hasDomainAligned ? 5 : 0
  score += hasCohesive ? 5 : 0
  score += hasIntentional ? 5 : 0

  const alignment = Math.min(score, 100)
  const mixedConcernsCount = countMatches(/\bvar\b/, content)
  const misnamedCount = countMatches(/\bany\b/, content)

  const hasNoMixedConcerns = mixedConcernsCount === 0
  const hasNoMisnamed = misnamedCount === 0
  const hasNoLeakyAbstraction = !has(/\beval\b/, content)
  const hasNoScatteredLogic = !has(/\bdebugger\b/, content)
  const hasHighAlignment = alignment >= 70

  let northStar: NorthStarGrade
  if (alignment >= 85) northStar = 'true-north'
  else if (alignment >= 70) northStar = 'steady-bearings'
  else if (alignment >= 55) northStar = 'proper-aim'
  else if (alignment >= 40) northStar = 'drifting-compass'
  else if (alignment >= 25) northStar = 'lost-direction'
  else northStar = 'no-north'

  return {
    alignment, northStar, hasHighAlignment, hasClearPurpose, hasSingleResponsibility,
    hasNoMixedConcerns, hasConsistentNaming, hasNoMisnamed, hasDomainAligned,
    hasNoLeakyAbstraction, hasCohesive, hasNoScatteredLogic, hasIntentional,
    mixedConcernsCount, misnamedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify star condition
 * @example
 * classifyStarCondition(90) // 'pole-star'
 */
export function classifyStarCondition(score: number): StarCondition {
  if (score >= 85) return 'pole-star'
  if (score >= 70) return 'bright-star'
  if (score >= 55) return 'proper-star'
  if (score >= 40) return 'dim-star'
  if (score >= 25) return 'dark-matter'
  return 'void'
}

/**
 * Classify system type
 * @example
 * classifySystemType(points) // 'galaxy-core'
 */
export function classifySystemType(points: StarPoint[]): SystemType {
  if (points.length === 0) return 'no-system'
  const avgQs = Math.round(points.reduce((s, p) => s + p.qualityScore, 0) / points.length)
  const poleRatio = points.filter(p => p.condition === 'pole-star').length / points.length
  if (avgQs >= 75 && poleRatio >= 0.5) return 'galaxy-core'
  if (avgQs >= 60) return 'star-cluster'
  if (avgQs >= 45) return 'proper-system'
  if (avgQs >= 30) return 'binary-system'
  if (avgQs >= 15) return 'rogue-planet'
  return 'no-system'
}

/**
 * Classify system condition
 * @example
 * classifySystemCondition(80) // 'brilliant-cosmos'
 */
export function classifySystemCondition(avgQs: number): SystemCondition {
  if (avgQs >= 75) return 'brilliant-cosmos'
  if (avgQs >= 60) return 'starlit-sky'
  if (avgQs >= 45) return 'decent-constellation'
  if (avgQs >= 30) return 'dim-nebula'
  if (avgQs >= 15) return 'dark-void'
  return 'void'
}

/**
 * Classify navigator grade
 * @example
 * classifyNavigatorGrade(85) // 'grand-astronomer'
 */
export function classifyNavigatorGrade(avgClarity: number): NavigatorGrade {
  if (avgClarity >= 80) return 'grand-astronomer'
  if (avgClarity >= 65) return 'star-captain'
  if (avgClarity >= 50) return 'skilled-navigator'
  if (avgClarity >= 35) return 'apprentice'
  if (avgClarity >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(points, systems, cosmos, stats)
 */
export function generateRecommendations(
  points: StarPoint[],
  systems: StarSystem[],
  cosmos: CosmosSummary,
  stats: AstralCompassStats,
): string[] {
  const recs: string[] = []
  if (stats.avgNavigationClarity < 50) {
    recs.push('Improve navigation clarity with documented exports, typed return values, and consistent naming')
  }
  if (stats.avgConstellationStructure < 50) {
    recs.push('Strengthen constellation structure with organized interfaces, hierarchical classes, and layered patterns')
  }
  if (stats.avgStellarOrganization < 50) {
    recs.push('Enhance stellar organization with named exports, clean imports, and tree-shakeable modules')
  }
  if (stats.avgOrbitHarmony < 50) {
    recs.push('Balance orbit harmony with typed APIs, loose coupling, and minimal dependency chains')
  }
  if (stats.avgNorthStarAlignment < 50) {
    recs.push('Sharpen north-star alignment with clear purpose, single responsibility, and domain-aligned naming')
  }
  if (stats.voidCount > 0) {
    recs.push(`${stats.voidCount} file(s) are void — they need navigation guidance`)
  }
  if (cosmos.overallClarity < 40) {
    recs.push('Overall cosmic clarity is low — focus on navigation clarity and stellar organization first')
  }
  const allDark = systems.every(s => s.systemType === 'no-system' || s.systemType === 'rogue-planet')
  if (allDark && systems.length > 0) {
    recs.push('All star systems are dark or rogue — consider a major architectural realignment')
  }
  const voidFiles = points.filter(p => p.condition === 'void').map(p => p.file)
  if (voidFiles.length > 0 && voidFiles.length <= 3) {
    recs.push(`Transform these void files into pole stars: ${voidFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your astral compass points to grand-astronomer quality! Every star shines with crystal clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as star point
 * @example
 * const p = analyzeStarPoint(content, 'index.ts')
 * console.log(p.condition) // 'pole-star'
 */
export function analyzeStarPoint(content: string, filePath: string): StarPoint {
  const navigating = measureNavigating(content)
  const patterning = measurePatterning(content)
  const organizing = measureOrganizing(content)
  const harmonizing = measureHarmonizing(content)
  const aligning = measureAligning(content)

  const qualityScore = Math.round(
    navigating.clarity * 0.2 +
    patterning.structure * 0.2 +
    organizing.organization * 0.2 +
    harmonizing.harmony * 0.2 +
    aligning.alignment * 0.2,
  )

  return {
    file: filePath,
    navigationClarity: navigating.clarity,
    constellationStructure: patterning.structure,
    stellarOrganization: organizing.organization,
    orbitHarmony: harmonizing.harmony,
    northStarAlignment: aligning.alignment,
    navigating,
    patterning,
    organizing,
    harmonizing,
    aligning,
    condition: classifyStarCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as star system
 * @example
 * const s = analyzeStarSystem(points, 'src')
 * console.log(s.systemType) // 'galaxy-core'
 */
export function analyzeStarSystem(points: StarPoint[], dirPath: string): StarSystem {
  if (points.length === 0) {
    return {
      directory: dirPath, points: [], avgNavigation: 0, avgOrganization: 0, avgAlignment: 0,
      poleStarCount: 0, voidCount: 0, systemType: 'no-system', condition: 'void',
    }
  }

  const avgNavigation = Math.round(points.reduce((s, p) => s + p.navigationClarity, 0) / points.length)
  const avgOrganization = Math.round(points.reduce((s, p) => s + p.stellarOrganization, 0) / points.length)
  const avgAlignment = Math.round(points.reduce((s, p) => s + p.northStarAlignment, 0) / points.length)
  const poleStarCount = points.filter(p => p.condition === 'pole-star').length
  const voidCount = points.filter(p => p.condition === 'void').length
  const avgQs = Math.round(points.reduce((s, p) => s + p.qualityScore, 0) / points.length)

  return {
    directory: dirPath, points, avgNavigation, avgOrganization, avgAlignment,
    poleStarCount, voidCount, systemType: classifySystemType(points),
    condition: classifySystemCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete astral compass result
 * @example
 * const result = await buildAstralCompassResult(files, contents)
 * console.log(result.stats.navigatorGrade) // 'grand-astronomer'
 */
export async function buildAstralCompassResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AstralCompassResult> {
  const points = files.map((file, i) => analyzeStarPoint(contents[i] ?? '', file))

  const dirMap = new Map<string, StarPoint[]>()
  for (const point of points) {
    const dir = path.dirname(point.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(point) } else { dirMap.set(dir, [point]) }
  }

  const systems = Array.from(dirMap.entries()).map(([dir, dirPoints]) =>
    analyzeStarSystem(dirPoints, dir),
  )

  const avgNavigation = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.navigationClarity, 0) / points.length) : 0
  const avgOrganization = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.stellarOrganization, 0) / points.length) : 0
  const avgAlignment = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.northStarAlignment, 0) / points.length) : 0

  const overallClarity = points.length > 0
    ? Math.round((avgNavigation + avgOrganization + avgAlignment) / 3) : 0
  const isAligned = avgNavigation >= 60

  const cosmos: CosmosSummary = { avgNavigation, avgOrganization, avgAlignment, isAligned, overallClarity }

  const avgConstellationStructure = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.constellationStructure, 0) / points.length) : 0
  const avgOrbitHarmony = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.orbitHarmony, 0) / points.length) : 0

  const bestPoint = points.length > 0
    ? points.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const clearest = points.length > 0
    ? points.reduce((best, p) => p.navigationClarity > best.navigationClarity ? p : best).file : ''
  const mostStructured = points.length > 0
    ? points.reduce((best, p) => p.constellationStructure > best.constellationStructure ? p : best).file : ''
  const mostOrganized = points.length > 0
    ? points.reduce((best, p) => p.stellarOrganization > best.stellarOrganization ? p : best).file : ''
  const mostHarmonious = points.length > 0
    ? points.reduce((best, p) => p.orbitHarmony > best.orbitHarmony ? p : best).file : ''

  const stats: AstralCompassStats = {
    totalFiles: points.length,
    totalSystems: systems.length,
    avgNavigationClarity: avgNavigation,
    avgConstellationStructure,
    avgStellarOrganization: avgOrganization,
    avgOrbitHarmony,
    avgNorthStarAlignment: avgAlignment,
    poleStarCount: points.filter(p => p.condition === 'pole-star').length,
    brightStarCount: points.filter(p => p.condition === 'bright-star').length,
    properStarCount: points.filter(p => p.condition === 'proper-star').length,
    dimStarCount: points.filter(p => p.condition === 'dim-star').length,
    darkMatterCount: points.filter(p => p.condition === 'dark-matter').length,
    voidCount: points.filter(p => p.condition === 'void').length,
    hasHighClarityCount: points.filter(p => p.navigating.hasHighClarity).length,
    hasHighStructureCount: points.filter(p => p.patterning.hasHighStructure).length,
    hasHighOrganizationCount: points.filter(p => p.organizing.hasHighOrganization).length,
    hasHighHarmonyCount: points.filter(p => p.harmonizing.hasHighHarmony).length,
    hasHighAlignmentCount: points.filter(p => p.aligning.hasHighAlignment).length,
    overallClarity,
    navigatorGrade: classifyNavigatorGrade(overallClarity),
    bestPoint, clearest, mostStructured, mostOrganized, mostHarmonious,
  }

  const recommendations = generateRecommendations(points, systems, cosmos, stats)

  return { points, systems, cosmos, stats, recommendations }
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
