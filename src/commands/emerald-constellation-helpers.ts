// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ArrangingGrade = 'galactic-core' | 'star-system' | 'proper-orbit' | 'asteroid-belt' | 'space-debris' | 'no-organization'
export type ClarifyingGem = 'flawless-emerald' | 'clear-gem' | 'proper-transparency' | 'cloudy-stone' | 'opaque-rock' | 'no-gem'
export type HarmonizingOrbit = 'perfect-harmony' | 'stable-orbit' | 'proper-path' | 'elliptical-drift' | 'collision-course' | 'chaotic-orbit'
export type EnergizingGreen = 'fusion-reactor' | 'efficient-solar' | 'proper-energy' | 'wasteful-grid' | 'draining-circuit' | 'no-energy'
export type KnowingConstellation = 'ancient-constellation' | 'wise-stars' | 'proper-pattern' | 'random-points' | 'dim-lights' | 'no-wisdom'
export type StarCondition = 'emerald-masterpiece' | 'green-constellation' | 'proper-star' | 'dim-gem' | 'faded-star' | 'dark-matter'
export type ArmType = 'spiral-arm' | 'star-cluster' | 'proper-group' | 'scattered-stars' | 'rogue-objects' | 'no-arm'
export type ArmCondition = 'brilliant-constellation' | 'starlit-galaxy' | 'decent-cluster' | 'dim-nebula' | 'dark-void' | 'void'
export type AstronomerGrade = 'master-astronomer' | 'star-captain' | 'skilled-navigator' | 'apprentice' | 'novice' | 'lost-soul'

export interface ArrangingMeasure {
  organization: number
  grade: ArrangingGrade
  hasHighOrganization: boolean
  hasWellStructured: boolean
  hasLogicalGrouping: boolean
  hasNoScattered: boolean
  hasHierarchical: boolean
  hasNoFlat: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasClustered: boolean
  hasNoIsolated: boolean
  hasSystematic: boolean
  scatteredCount: number
  flatCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  gem: ClarifyingGem
  hasHighClarity: boolean
  hasTransparent: boolean
  hasReadable: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  hasNoDense: boolean
  hasUnderstandable: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface HarmonizingMeasure {
  harmony: number
  orbit: HarmonizingOrbit
  hasHighHarmony: boolean
  hasBalancedDeps: boolean
  hasNoCircular: boolean
  hasLooseCoupling: boolean
  hasNoTightCoupling: boolean
  hasMinimalDeps: boolean
  hasNoOverDependence: boolean
  hasCleanImports: boolean
  hasNoStarImports: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  circularCount: number
  tightCouplingCount: number
}

export interface EnergizingMeasure {
  energy: number
  green: EnergizingGreen
  hasHighEnergy: boolean
  hasOptimized: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasCached: boolean
  hasNoRedundant: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasSustainable: boolean
  hasNoDisposable: boolean
  hasGreen: boolean
  wastefulCount: number
  bloatedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  constellation: KnowingConstellation
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasPatternBased: boolean
  hasNoAdhoc: boolean
  hasDomainAware: boolean
  hasNoContextFree: boolean
  hasInformed: boolean
  hasNoUninformed: boolean
  hasKnowledgeable: boolean
  crypticCount: number
  adhocCount: number
}

export interface EmeraldStar {
  file: string
  stellarOrganization: number
  gemClarity: number
  orbitHarmony: number
  greenEnergy: number
  constellationWisdom: number
  arranging: ArrangingMeasure
  clarifying: ClarifyingMeasure
  harmonizing: HarmonizingMeasure
  energizing: EnergizingMeasure
  knowing: KnowingMeasure
  condition: StarCondition
  qualityScore: number
}

export interface ConstellationArm {
  directory: string
  stars: EmeraldStar[]
  avgOrganization: number
  avgHarmony: number
  avgWisdom: number
  emeraldMasterpieceCount: number
  darkMatterCount: number
  armType: ArmType
  condition: ArmCondition
}

export interface EmeraldGalaxy {
  avgOrganization: number
  avgHarmony: number
  avgWisdom: number
  isBrilliant: boolean
  overallSplendor: number
}

export interface EmeraldConstellationStats {
  totalFiles: number
  totalArms: number
  avgStellarOrganization: number
  avgGemClarity: number
  avgOrbitHarmony: number
  avgGreenEnergy: number
  avgConstellationWisdom: number
  emeraldMasterpieceCount: number
  greenConstellationCount: number
  properStarCount: number
  dimGemCount: number
  fadedStarCount: number
  darkMatterCount: number
  hasHighOrganizationCount: number
  hasHighClarityCount: number
  hasHighHarmonyCount: number
  hasHighEnergyCount: number
  hasHighWisdomCount: number
  overallSplendor: number
  astronomerGrade: AstronomerGrade
  bestStar: string
  mostOrganized: string
  clearest: string
  mostHarmonious: string
  wisest: string
}

export interface EmeraldConstellationResult {
  stars: EmeraldStar[]
  arms: ConstellationArm[]
  galaxy: EmeraldGalaxy
  stats: EmeraldConstellationStats
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
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure stellar organization (module arrangement)
 * @example
 * const m = measureArranging(content)
 * console.log(m.grade) // 'galactic-core'
 */
export function measureArranging(content: string): ArrangingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasImport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasWellStructured = hasExport(content) && hasInterface(content)
  const hasLogicalGrouping = hasTypeAlias(content) && hasNamedExport(content)
  const hasHierarchical = hasImport(content) && hasReturnType(content)
  const hasOrganized = hasGenerics(content) && hasEnum(content)
  const hasClustered = hasReadonly(content) && hasPrivate(content)
  const hasSystematic = hasClass(content) && hasOptional(content)

  score += hasWellStructured ? 5 : 0
  score += hasLogicalGrouping ? 5 : 0
  score += hasHierarchical ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasClustered ? 5 : 0
  score += hasSystematic ? 5 : 0

  const organization = Math.min(score, 100)
  const scatteredCount = countMatches(/\bvar\b/, content)
  const flatCount = countMatches(/\bany\b/, content)

  const hasNoScattered = scatteredCount === 0
  const hasNoFlat = flatCount === 0
  const hasNoChaotic = !has(/\beval\b/, content)
  const hasNoIsolated = !has(/\bdebugger\b/, content)
  const hasHighOrganization = organization >= 70

  let grade: ArrangingGrade
  if (organization >= 85) grade = 'galactic-core'
  else if (organization >= 70) grade = 'star-system'
  else if (organization >= 55) grade = 'proper-orbit'
  else if (organization >= 40) grade = 'asteroid-belt'
  else if (organization >= 25) grade = 'space-debris'
  else grade = 'no-organization'

  return {
    organization, grade, hasHighOrganization, hasWellStructured, hasLogicalGrouping,
    hasNoScattered, hasHierarchical, hasNoFlat, hasOrganized, hasNoChaotic,
    hasClustered, hasNoIsolated, hasSystematic, scatteredCount, flatCount,
  }
}

/**
 * Measure gem clarity (transparency within modules)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.gem) // 'flawless-emerald'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasTransparent = hasDocComments(content) && hasReturnType(content)
  const hasReadable = hasInterface(content) && hasNamedExport(content)
  const hasSelfDocumenting = hasTypeAlias(content) && hasGenerics(content)
  const hasClear = hasConst(content) && hasExport(content)
  const hasUnderstandable = hasStrictEq(content) && hasOptional(content)
  const hasVisible = hasReadonly(content) && hasEnum(content)

  score += hasTransparent ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoDense = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let gem: ClarifyingGem
  if (clarity >= 85) gem = 'flawless-emerald'
  else if (clarity >= 70) gem = 'clear-gem'
  else if (clarity >= 55) gem = 'proper-transparency'
  else if (clarity >= 40) gem = 'cloudy-stone'
  else if (clarity >= 25) gem = 'opaque-rock'
  else gem = 'no-gem'

  return {
    clarity, gem, hasHighClarity, hasTransparent, hasReadable,
    hasNoObfuscated, hasSelfDocumenting, hasNoCryptic, hasVisible,
    hasNoHidden, hasClear, hasNoDense, hasUnderstandable, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure orbit harmony (dependency relationships)
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.orbit) // 'perfect-harmony'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasImport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasBalancedDeps = hasImport(content) && hasExport(content)
  const hasLooseCoupling = hasNamedExport(content) && hasInterface(content)
  const hasMinimalDeps = hasTypeAlias(content) && hasConst(content)
  const hasCleanImports = hasAsync(content) && hasReturnType(content)
  const hasStable = hasOptional(content) && hasGenerics(content)
  const hasNoCircular = hasTryCatch(content) && hasStrictEq(content)

  score += hasBalancedDeps ? 5 : 0
  score += hasLooseCoupling ? 5 : 0
  score += hasMinimalDeps ? 5 : 0
  score += hasCleanImports ? 5 : 0
  score += hasStable ? 5 : 0
  score += (hasNoCircular ? 5 : 0)

  const harmony = Math.min(score, 100)
  const circularCount = countMatches(/\bvar\b/, content)
  const tightCouplingCount = countMatches(/\bany\b/, content)

  const hasNoTightCoupling = tightCouplingCount === 0
  const hasNoOverDependence = !has(/\beval\b/, content)
  const hasNoStarImports = !has(/\bdebugger\b/, content)
  const hasNoVolatile = !has(/\bdebugger\b/, content)
  const hasHighHarmony = harmony >= 70

  let orbit: HarmonizingOrbit
  if (harmony >= 85) orbit = 'perfect-harmony'
  else if (harmony >= 70) orbit = 'stable-orbit'
  else if (harmony >= 55) orbit = 'proper-path'
  else if (harmony >= 40) orbit = 'elliptical-drift'
  else if (harmony >= 25) orbit = 'collision-course'
  else orbit = 'chaotic-orbit'

  return {
    harmony, orbit, hasHighHarmony, hasBalancedDeps, hasNoCircular,
    hasLooseCoupling, hasNoTightCoupling, hasMinimalDeps, hasNoOverDependence,
    hasCleanImports, hasNoStarImports, hasStable, hasNoVolatile,
    circularCount, tightCouplingCount,
  }
}

/**
 * Measure green energy (sustainable efficiency)
 * @example
 * const m = measureEnergizing(content)
 * console.log(m.green) // 'fusion-reactor'
 */
export function measureEnergizing(content: string): EnergizingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasArrowFunction(content) ? 10 : 0
  score += hasMapFunction(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasOptimized = hasConst(content) && hasArrowFunction(content)
  const hasEfficient = hasMapFunction(content) && hasAsync(content)
  const hasCached = hasReturnType(content) && hasGenerics(content)
  const hasLean = hasStrictEq(content) && hasOptional(content)
  const hasSustainable = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasGreen = hasReadonly(content) && hasEnum(content)

  score += hasOptimized ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasSustainable ? 5 : 0
  score += hasGreen ? 5 : 0

  const energy = Math.min(score, 100)
  const wastefulCount = countMatches(/\bvar\b/, content)
  const bloatedCount = countMatches(/\bany\b/, content)

  const hasNoWasteful = wastefulCount === 0
  const hasNoRedundant = bloatedCount === 0
  const hasNoBloated = !has(/\beval\b/, content)
  const hasNoDisposable = !has(/\bdebugger\b/, content)
  const hasHighEnergy = energy >= 70

  let green: EnergizingGreen
  if (energy >= 85) green = 'fusion-reactor'
  else if (energy >= 70) green = 'efficient-solar'
  else if (energy >= 55) green = 'proper-energy'
  else if (energy >= 40) green = 'wasteful-grid'
  else if (energy >= 25) green = 'draining-circuit'
  else green = 'no-energy'

  return {
    energy, green, hasHighEnergy, hasOptimized, hasEfficient,
    hasNoWasteful, hasCached, hasNoRedundant, hasLean, hasNoBloated,
    hasSustainable, hasNoDisposable, hasGreen, wastefulCount, bloatedCount,
  }
}

/**
 * Measure constellation wisdom (collective knowledge)
 * @example
 * const m = measureKnowing(content)
 * console.log(m.constellation) // 'ancient-constellation'
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasWellNamed = hasInterface(content) && hasReturnType(content)
  const hasPatternBased = hasTypeAlias(content) && hasNamedExport(content)
  const hasDomainAware = hasEnum(content) && hasConst(content)
  const hasInformed = hasStrictEq(content) && hasGenerics(content)
  const hasKnowledgeable = hasAsync(content) && hasPrivate(content)

  score += hasDocumented ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasPatternBased ? 5 : 0
  score += hasDomainAware ? 5 : 0
  score += hasInformed ? 5 : 0
  score += hasKnowledgeable ? 5 : 0

  const wisdom = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const adhocCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoAdhoc = adhocCount === 0
  const hasNoContextFree = !has(/\beval\b/, content)
  const hasNoUninformed = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let constellation: KnowingConstellation
  if (wisdom >= 85) constellation = 'ancient-constellation'
  else if (wisdom >= 70) constellation = 'wise-stars'
  else if (wisdom >= 55) constellation = 'proper-pattern'
  else if (wisdom >= 40) constellation = 'random-points'
  else if (wisdom >= 25) constellation = 'dim-lights'
  else constellation = 'no-wisdom'

  return {
    wisdom, constellation, hasHighWisdom, hasDocumented, hasWellNamed,
    hasNoCryptic, hasPatternBased, hasNoAdhoc, hasDomainAware,
    hasNoContextFree, hasInformed, hasNoUninformed, hasKnowledgeable,
    crypticCount, adhocCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify star condition
 * @example
 * classifyStarCondition(90) // 'emerald-masterpiece'
 */
export function classifyStarCondition(score: number): StarCondition {
  if (score >= 85) return 'emerald-masterpiece'
  if (score >= 70) return 'green-constellation'
  if (score >= 55) return 'proper-star'
  if (score >= 40) return 'dim-gem'
  if (score >= 25) return 'faded-star'
  return 'dark-matter'
}

/**
 * Classify arm type
 * @example
 * classifyArmType(stars) // 'spiral-arm'
 */
export function classifyArmType(stars: EmeraldStar[]): ArmType {
  if (stars.length === 0) return 'no-arm'
  const avgQs = Math.round(stars.reduce((s, st) => s + st.qualityScore, 0) / stars.length)
  const masterpieceRatio = stars.filter(st => st.condition === 'emerald-masterpiece').length / stars.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'spiral-arm'
  if (avgQs >= 60) return 'star-cluster'
  if (avgQs >= 45) return 'proper-group'
  if (avgQs >= 30) return 'scattered-stars'
  if (avgQs >= 15) return 'rogue-objects'
  return 'no-arm'
}

/**
 * Classify arm condition
 * @example
 * classifyArmCondition(80) // 'brilliant-constellation'
 */
export function classifyArmCondition(avgQs: number): ArmCondition {
  if (avgQs >= 75) return 'brilliant-constellation'
  if (avgQs >= 60) return 'starlit-galaxy'
  if (avgQs >= 45) return 'decent-cluster'
  if (avgQs >= 30) return 'dim-nebula'
  if (avgQs >= 15) return 'dark-void'
  return 'void'
}

/**
 * Classify astronomer grade
 * @example
 * classifyAstronomerGrade(85) // 'master-astronomer'
 */
export function classifyAstronomerGrade(avgSplendor: number): AstronomerGrade {
  if (avgSplendor >= 80) return 'master-astronomer'
  if (avgSplendor >= 65) return 'star-captain'
  if (avgSplendor >= 50) return 'skilled-navigator'
  if (avgSplendor >= 35) return 'apprentice'
  if (avgSplendor >= 20) return 'novice'
  return 'lost-soul'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(stars, arms, galaxy, stats)
 */
export function generateRecommendations(
  stars: EmeraldStar[],
  arms: ConstellationArm[],
  galaxy: EmeraldGalaxy,
  stats: EmeraldConstellationStats,
): string[] {
  const recs: string[] = []
  if (stats.avgStellarOrganization < 50) {
    recs.push('Improve stellar organization with structured exports, interfaces, and logical module grouping')
  }
  if (stats.avgGemClarity < 50) {
    recs.push('Enhance gem clarity with documentation, self-documenting types, and transparent naming')
  }
  if (stats.avgOrbitHarmony < 50) {
    recs.push('Harmonize orbits with balanced imports/exports, loose coupling, and clean dependency patterns')
  }
  if (stats.avgGreenEnergy < 50) {
    recs.push('Boost green energy with const declarations, arrow functions, and sustainable code patterns')
  }
  if (stats.avgConstellationWisdom < 50) {
    recs.push('Grow constellation wisdom with documentation, pattern-based designs, and domain-aware types')
  }
  if (stats.darkMatterCount > 0) {
    recs.push(`${stats.darkMatterCount} file(s) are dark matter — they need complete stellar reconstruction`)
  }
  if (galaxy.overallSplendor < 40) {
    recs.push('Galaxy splendor is dim — focus on stellar organization and gem clarity first')
  }
  const allDark = arms.every(a => a.armType === 'no-arm' || a.armType === 'rogue-objects')
  if (allDark && arms.length > 0) {
    recs.push('All arms are dark — consider a major constellation reconstruction')
  }
  const darkFiles = stars.filter(st => st.condition === 'dark-matter').map(st => st.file)
  if (darkFiles.length > 0 && darkFiles.length <= 3) {
    recs.push(`Illuminate these dark stars: ${darkFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your emerald constellation shines with brilliant splendor! Every star is perfectly placed')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as emerald star
 * @example
 * const star = analyzeEmeraldStar(content, 'index.ts')
 * console.log(star.condition) // 'emerald-masterpiece'
 */
export function analyzeEmeraldStar(content: string, filePath: string): EmeraldStar {
  const arranging = measureArranging(content)
  const clarifying = measureClarifying(content)
  const harmonizing = measureHarmonizing(content)
  const energizing = measureEnergizing(content)
  const knowing = measureKnowing(content)

  const qualityScore = Math.round(
    arranging.organization * 0.2 +
    clarifying.clarity * 0.2 +
    harmonizing.harmony * 0.2 +
    energizing.energy * 0.2 +
    knowing.wisdom * 0.2,
  )

  return {
    file: filePath,
    stellarOrganization: arranging.organization,
    gemClarity: clarifying.clarity,
    orbitHarmony: harmonizing.harmony,
    greenEnergy: energizing.energy,
    constellationWisdom: knowing.wisdom,
    arranging, clarifying, harmonizing, energizing, knowing,
    condition: classifyStarCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as constellation arm
 * @example
 * const arm = analyzeConstellationArm(stars, 'src')
 * console.log(arm.armType) // 'spiral-arm'
 */
export function analyzeConstellationArm(stars: EmeraldStar[], dirPath: string): ConstellationArm {
  if (stars.length === 0) {
    return {
      directory: dirPath, stars: [], avgOrganization: 0, avgHarmony: 0,
      avgWisdom: 0, emeraldMasterpieceCount: 0, darkMatterCount: 0,
      armType: 'no-arm', condition: 'void',
    }
  }

  const avgOrganization = Math.round(stars.reduce((s, st) => s + st.stellarOrganization, 0) / stars.length)
  const avgHarmony = Math.round(stars.reduce((s, st) => s + st.orbitHarmony, 0) / stars.length)
  const avgWisdom = Math.round(stars.reduce((s, st) => s + st.constellationWisdom, 0) / stars.length)
  const emeraldMasterpieceCount = stars.filter(st => st.condition === 'emerald-masterpiece').length
  const darkMatterCount = stars.filter(st => st.condition === 'dark-matter').length
  const avgQs = Math.round(stars.reduce((s, st) => s + st.qualityScore, 0) / stars.length)

  return {
    directory: dirPath, stars, avgOrganization, avgHarmony, avgWisdom,
    emeraldMasterpieceCount, darkMatterCount,
    armType: classifyArmType(stars),
    condition: classifyArmCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete emerald constellation result
 * @example
 * const result = await buildEmeraldConstellationResult(files, contents)
 * console.log(result.stats.astronomerGrade) // 'master-astronomer'
 */
export async function buildEmeraldConstellationResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldConstellationResult> {
  const stars = files.map((file, i) => analyzeEmeraldStar(contents[i] ?? '', file))

  const dirMap = new Map<string, EmeraldStar[]>()
  for (const star of stars) {
    const dir = path.dirname(star.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(star) } else { dirMap.set(dir, [star]) }
  }

  const arms = Array.from(dirMap.entries()).map(([dir, dirStars]) =>
    analyzeConstellationArm(dirStars, dir),
  )

  const avgOrganization = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.stellarOrganization, 0) / stars.length) : 0
  const avgHarmony = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.orbitHarmony, 0) / stars.length) : 0
  const avgWisdom = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.constellationWisdom, 0) / stars.length) : 0

  const overallSplendor = stars.length > 0
    ? Math.round((avgOrganization + avgHarmony + avgWisdom) / 3) : 0
  const isBrilliant = avgOrganization >= 60

  const galaxy: EmeraldGalaxy = { avgOrganization, avgHarmony, avgWisdom, isBrilliant, overallSplendor }

  const avgGemClarity = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.gemClarity, 0) / stars.length) : 0
  const avgGreenEnergy = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.greenEnergy, 0) / stars.length) : 0

  const bestStar = stars.length > 0
    ? stars.reduce((best, st) => st.qualityScore > best.qualityScore ? st : best).file : ''
  const mostOrganized = stars.length > 0
    ? stars.reduce((best, st) => st.stellarOrganization > best.stellarOrganization ? st : best).file : ''
  const clearest = stars.length > 0
    ? stars.reduce((best, st) => st.gemClarity > best.gemClarity ? st : best).file : ''
  const mostHarmonious = stars.length > 0
    ? stars.reduce((best, st) => st.orbitHarmony > best.orbitHarmony ? st : best).file : ''
  const wisest = stars.length > 0
    ? stars.reduce((best, st) => st.constellationWisdom > best.constellationWisdom ? st : best).file : ''

  const stats: EmeraldConstellationStats = {
    totalFiles: stars.length,
    totalArms: arms.length,
    avgStellarOrganization: avgOrganization,
    avgGemClarity,
    avgOrbitHarmony: avgHarmony,
    avgGreenEnergy,
    avgConstellationWisdom: avgWisdom,
    emeraldMasterpieceCount: stars.filter(st => st.condition === 'emerald-masterpiece').length,
    greenConstellationCount: stars.filter(st => st.condition === 'green-constellation').length,
    properStarCount: stars.filter(st => st.condition === 'proper-star').length,
    dimGemCount: stars.filter(st => st.condition === 'dim-gem').length,
    fadedStarCount: stars.filter(st => st.condition === 'faded-star').length,
    darkMatterCount: stars.filter(st => st.condition === 'dark-matter').length,
    hasHighOrganizationCount: stars.filter(st => st.arranging.hasHighOrganization).length,
    hasHighClarityCount: stars.filter(st => st.clarifying.hasHighClarity).length,
    hasHighHarmonyCount: stars.filter(st => st.harmonizing.hasHighHarmony).length,
    hasHighEnergyCount: stars.filter(st => st.energizing.hasHighEnergy).length,
    hasHighWisdomCount: stars.filter(st => st.knowing.hasHighWisdom).length,
    overallSplendor,
    astronomerGrade: classifyAstronomerGrade(overallSplendor),
    bestStar, mostOrganized, clearest, mostHarmonious, wisest,
  }

  const recommendations = generateRecommendations(stars, arms, galaxy, stats)

  return { stars, arms, galaxy, stats, recommendations }
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
