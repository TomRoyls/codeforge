// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Growth vitality grade */
export type VitalityGrade =
  | 'evergreen-cosmos'
  | 'thriving-growth'
  | 'proper-sprout'
  | 'wilting-plant'
  | 'barren-soil'
  | 'dead-seed'

/** Root depth grade */
export type RootGrade =
  | 'deep-cosmic-root'
  | 'strong-taproot'
  | 'proper-roots'
  | 'shallow-roots'
  | 'surface-sprouts'
  | 'no-roots'

/** Bloom diversity grade */
export type BloomGrade =
  | 'rainbow-garden'
  | 'diverse-bed'
  | 'proper-variety'
  | 'monoculture'
  | 'single-stem'
  | 'no-bloom'

/** Celestial harmony grade */
export type CelestialGrade =
  | 'universal-accord'
  | 'cosmic-rhythm'
  | 'proper-harmony'
  | 'discordant-notes'
  | 'cacophony'
  | 'silence'

/** Harvest quality grade */
export type HarvestGrade =
  | 'golden-bounty'
  | 'rich-harvest'
  | 'proper-yield'
  | 'meager-crop'
  | 'failed-harvest'
  | 'no-harvest'

/** Celestial bloom condition */
export type BloomCondition =
  | 'celestial-tree'
  | 'cosmic-rose'
  | 'proper-plant'
  | 'wilting-sprout'
  | 'dried-seed'
  | 'void-spore'

/** Garden constellation type */
export type ConstellationType =
  | 'hanging-gardens'
  | 'cosmic-greenhouse'
  | 'proper-garden'
  | 'wild-patch'
  | 'barren-field'
  | 'no-garden'

/** Garden constellation condition */
export type ConstellationCondition =
  | 'eden-reborn'
  | 'flourishing-realm'
  | 'decent-garden'
  | 'struggling-patch'
  | 'wasteland'
  | 'void'

/** Gardener grade */
export type GardenerGrade =
  | 'cosmic-gardener'
  | 'master-botanist'
  | 'skilled-cultivator'
  | 'apprentice'
  | 'novice'
  | 'brown-thumb'

/** Growing measurement */
export interface GrowingMeasure {
  vitality: number
  grade: VitalityGrade
  hasHighVitality: boolean
  hasExtensible: boolean
  hasScalable: boolean
  hasNoRigid: boolean
  hasAdaptable: boolean
  hasNoFrozen: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasRenewable: boolean
  hasNoDecayed: boolean
  hasSustainable: boolean
  rigidCount: number
  frozenCount: number
}

/** Rooting measurement */
export interface RootingMeasure {
  depth: number
  root: RootGrade
  hasHighDepth: boolean
  hasSolidFoundation: boolean
  hasWellTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasEstablished: boolean
  hasNoExperimental: boolean
  hasProven: boolean
  untestedCount: number
  unsafeCount: number
}

/** Blooming measurement */
export interface BloomingMeasure {
  diversity: number
  bloom: BloomGrade
  hasHighDiversity: boolean
  hasMultiplePatterns: boolean
  hasVariedApproaches: boolean
  hasNoSinglePattern: boolean
  hasRichAPI: boolean
  hasNoMinimalAPI: boolean
  hasDiverseTypes: boolean
  hasNoUniformTypes: boolean
  hasMultipleMethods: boolean
  hasNoSingleMethod: boolean
  hasColorful: boolean
  singlePatternCount: number
  minimalAPICount: number
}

/** Harmonizing measurement */
export interface HarmonizingMeasure {
  harmony: number
  celestial: CelestialGrade
  hasHighHarmony: boolean
  hasStandardsCompliant: boolean
  hasConsistentStyle: boolean
  hasNoStyleViolations: boolean
  hasLintClean: boolean
  hasNoLintErrors: boolean
  hasConventionFollowed: boolean
  hasNoConventionBreaks: boolean
  hasPatternCompliant: boolean
  hasNoAntiPatterns: boolean
  hasIdiomatic: boolean
  styleViolationCount: number
  lintErrorCount: number
}

/** Harvesting measurement */
export interface HarvestingMeasure {
  quality: number
  harvest: HarvestGrade
  hasHighQuality: boolean
  hasHighValueOutput: boolean
  hasCompleteCoverage: boolean
  hasNoDeadCode: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  hasProductionReady: boolean
  hasNoPrototypeCode: boolean
  hasCleanExports: boolean
  hasNoInternalLeaking: boolean
  hasDeliverable: boolean
  deadCodeCount: number
  wastefulCount: number
}

/** Single file analysis */
export interface CelestialBloom {
  file: string
  growthVitality: number
  rootDepth: number
  bloomDiversity: number
  celestialHarmony: number
  harvestQuality: number
  growing: GrowingMeasure
  rooting: RootingMeasure
  blooming: BloomingMeasure
  harmonizing: HarmonizingMeasure
  harvesting: HarvestingMeasure
  condition: BloomCondition
  qualityScore: number
}

/** Directory-level constellation */
export interface GardenConstellation {
  directory: string
  blooms: CelestialBloom[]
  avgVitality: number
  avgDepth: number
  avgHarmony: number
  celestialTreeCount: number
  voidSporeCount: number
  constellationType: ConstellationType
  condition: ConstellationCondition
}

/** Garden summary */
export interface GardenSummary {
  avgVitality: number
  avgDepth: number
  avgHarmony: number
  isFlourishing: boolean
  overallFertility: number
}

/** Celebration info */
export interface Celebration {
  milestone: number
  name: string
  message: string
  previousMilestones: number[]
  totalTests: number
}

/** Full stats */
export interface CosmicGardenStats {
  totalFiles: number
  totalConstellations: number
  avgGrowthVitality: number
  avgRootDepth: number
  avgBloomDiversity: number
  avgCelestialHarmony: number
  avgHarvestQuality: number
  celestialTreeCount: number
  cosmicRoseCount: number
  properPlantCount: number
  wiltingSproutCount: number
  driedSeedCount: number
  voidSporeCount: number
  hasHighVitalityCount: number
  hasHighDepthCount: number
  hasHighDiversityCount: number
  hasHighHarmonyCount: number
  hasHighQualityCount: number
  overallFertility: number
  gardenerGrade: GardenerGrade
  bestBloom: string
  mostVital: string
  deepestRooted: string
  mostDiverse: string
  mostHarmonious: string
}

/** Full result */
export interface CosmicGardenResult {
  blooms: CelestialBloom[]
  constellations: GardenConstellation[]
  garden: GardenSummary
  celebration: Celebration
  stats: CosmicGardenStats
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
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasNamespace = (c: string) => has(/\bnamespace\b/, c)
const hasDefaultExport = (c: string) => has(/\bexport\s+default\b/, c)
const hasReexport = (c: string) => has(/\bexport\s+\{[^}]*\}\s+from\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure growth vitality
 * @example
 * const m = measureGrowing(content)
 * console.log(m.grade) // 'evergreen-cosmos'
 */
export function measureGrowing(content: string): GrowingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasDocComments(content) ? 6 : 0

  const hasExtensible = hasGenerics(content) && hasInterface(content)
  const hasScalable = hasExport(content) && hasImport(content)
  const hasAdaptable = hasAsync(content) && hasOptional(content)
  const hasEvolving = hasTypeAlias(content) && hasReturnType(content)
  const hasRenewable = hasConst(content) && hasExport(content)
  const hasSustainable = hasReadonly(content) && hasInterface(content)

  score += hasExtensible ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasAdaptable ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasRenewable ? 5 : 0
  score += hasSustainable ? 5 : 0

  const vitality = Math.min(score, 100)
  const rigidCount = countMatches(/\bvar\b/, content)
  const frozenCount = countMatches(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoFrozen = frozenCount === 0
  const hasNoStagnant = !has(/\beval\b/, content)
  const hasNoDecayed = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  let grade: VitalityGrade
  if (vitality >= 85) grade = 'evergreen-cosmos'
  else if (vitality >= 70) grade = 'thriving-growth'
  else if (vitality >= 55) grade = 'proper-sprout'
  else if (vitality >= 40) grade = 'wilting-plant'
  else if (vitality >= 25) grade = 'barren-soil'
  else grade = 'dead-seed'

  return {
    vitality, grade, hasHighVitality, hasExtensible, hasScalable, hasNoRigid,
    hasAdaptable, hasNoFrozen, hasEvolving, hasNoStagnant, hasRenewable,
    hasNoDecayed, hasSustainable, rigidCount, frozenCount,
  }
}

/**
 * Measure root depth
 * @example
 * const m = measureRooting(content)
 * console.log(m.root) // 'deep-cosmic-root'
 */
export function measureRooting(content: string): RootingMeasure {
  let score = 0
  score += hasReturnType(content) ? 12 : 0
  score += hasStrictEq(content) ? 12 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0

  const hasSolidFoundation = hasInterface(content) && hasReturnType(content)
  const hasWellTested = hasStrictEq(content) && hasTryCatch(content)
  const hasTypeSafe = hasReturnType(content) && hasReadonly(content)
  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasEstablished = hasClass(content) && hasPrivate(content)
  const hasProven = hasConst(content) && hasStrictEq(content)

  score += hasSolidFoundation ? 5 : 0
  score += hasWellTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasEstablished ? 5 : 0
  score += hasProven ? 5 : 0

  const depth = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const unsafeCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = unsafeCount === 0
  const hasNoUndocumented = !has(/\beval\b/, content)
  const hasNoExperimental = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let root: RootGrade
  if (depth >= 85) root = 'deep-cosmic-root'
  else if (depth >= 70) root = 'strong-taproot'
  else if (depth >= 55) root = 'proper-roots'
  else if (depth >= 40) root = 'shallow-roots'
  else if (depth >= 25) root = 'surface-sprouts'
  else root = 'no-roots'

  return {
    depth, root, hasHighDepth, hasSolidFoundation, hasWellTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasDocumented, hasNoUndocumented, hasEstablished,
    hasNoExperimental, hasProven, untestedCount, unsafeCount,
  }
}

/**
 * Measure bloom diversity
 * @example
 * const m = measureBlooming(content)
 * console.log(m.bloom) // 'rainbow-garden'
 */
export function measureBlooming(content: string): BloomingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasNamespace(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0

  const hasMultiplePatterns = hasInterface(content) && hasClass(content)
  const hasVariedApproaches = hasAsync(content) && hasGenerics(content)
  const hasRichAPI = hasNamedExport(content) && hasReturnType(content)
  const hasDiverseTypes = hasTypeAlias(content) && hasEnum(content)
  const hasMultipleMethods = hasClass(content) && hasAsync(content)
  const hasColorful = hasGenerics(content) && hasInterface(content) && hasTypeAlias(content)

  score += hasMultiplePatterns ? 5 : 0
  score += hasVariedApproaches ? 5 : 0
  score += hasRichAPI ? 5 : 0
  score += hasDiverseTypes ? 5 : 0
  score += hasMultipleMethods ? 5 : 0
  score += hasColorful ? 5 : 0

  const diversity = Math.min(score, 100)
  const singlePatternCount = countMatches(/\bvar\b/, content)
  const minimalAPICount = countMatches(/\bany\b/, content)

  const hasNoSinglePattern = singlePatternCount === 0
  const hasNoMinimalAPI = minimalAPICount === 0
  const hasNoUniformTypes = !has(/\beval\b/, content)
  const hasNoSingleMethod = !has(/\bdebugger\b/, content)
  const hasHighDiversity = diversity >= 70

  let bloom: BloomGrade
  if (diversity >= 85) bloom = 'rainbow-garden'
  else if (diversity >= 70) bloom = 'diverse-bed'
  else if (diversity >= 55) bloom = 'proper-variety'
  else if (diversity >= 40) bloom = 'monoculture'
  else if (diversity >= 25) bloom = 'single-stem'
  else bloom = 'no-bloom'

  return {
    diversity, bloom, hasHighDiversity, hasMultiplePatterns, hasVariedApproaches,
    hasNoSinglePattern, hasRichAPI, hasNoMinimalAPI, hasDiverseTypes,
    hasNoUniformTypes, hasMultipleMethods, hasNoSingleMethod, hasColorful,
    singlePatternCount, minimalAPICount,
  }
}

/**
 * Measure celestial harmony
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.celestial) // 'universal-accord'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasStandardsCompliant = hasReturnType(content) && hasStrictEq(content)
  const hasConsistentStyle = hasConst(content) && hasNamedExport(content)
  const hasLintClean = hasExport(content) && hasImport(content)
  const hasConventionFollowed = hasInterface(content) && hasReturnType(content)
  const hasPatternCompliant = hasReadonly(content) && hasConst(content)
  const hasIdiomatic = hasOptional(content) && hasNullishCoalescing(content)

  score += hasStandardsCompliant ? 5 : 0
  score += hasConsistentStyle ? 5 : 0
  score += hasLintClean ? 5 : 0
  score += hasConventionFollowed ? 5 : 0
  score += hasPatternCompliant ? 5 : 0
  score += hasIdiomatic ? 5 : 0

  const harmony = Math.min(score, 100)
  const styleViolationCount = countMatches(/\bvar\b/, content)
  const lintErrorCount = countMatches(/\bany\b/, content)

  const hasNoStyleViolations = styleViolationCount === 0
  const hasNoLintErrors = lintErrorCount === 0
  const hasNoConventionBreaks = !has(/\beval\b/, content)
  const hasNoAntiPatterns = !has(/\bdebugger\b/, content)
  const hasHighHarmony = harmony >= 70

  let celestial: CelestialGrade
  if (harmony >= 85) celestial = 'universal-accord'
  else if (harmony >= 70) celestial = 'cosmic-rhythm'
  else if (harmony >= 55) celestial = 'proper-harmony'
  else if (harmony >= 40) celestial = 'discordant-notes'
  else if (harmony >= 25) celestial = 'cacophony'
  else celestial = 'silence'

  return {
    harmony, celestial, hasHighHarmony, hasStandardsCompliant, hasConsistentStyle,
    hasNoStyleViolations, hasLintClean, hasNoLintErrors, hasConventionFollowed,
    hasNoConventionBreaks, hasPatternCompliant, hasNoAntiPatterns, hasIdiomatic,
    styleViolationCount, lintErrorCount,
  }
}

/**
 * Measure harvest quality
 * @example
 * const m = measureHarvesting(content)
 * console.log(m.harvest) // 'golden-bounty'
 */
export function measureHarvesting(content: string): HarvestingMeasure {
  let score = 0
  score += hasExport(content) ? 12 : 0
  score += hasReturnType(content) ? 12 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasReexport(content) ? 4 : 0

  const hasHighValueOutput = hasNamedExport(content) && hasReturnType(content)
  const hasCompleteCoverage = hasInterface(content) && hasConst(content)
  const hasOptimized = hasReadonly(content) && hasExport(content)
  const hasProductionReady = hasReturnType(content) && hasInterface(content)
  const hasCleanExports = hasNamedExport(content) && !hasDefaultExport(content)
  const hasDeliverable = hasExport(content) && hasDocComments(content)

  score += hasHighValueOutput ? 5 : 0
  score += hasCompleteCoverage ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasProductionReady ? 5 : 0
  score += hasCleanExports ? 5 : 0
  score += hasDeliverable ? 5 : 0

  const quality = Math.min(score, 100)
  const deadCodeCount = countMatches(/\bvar\b/, content)
  const wastefulCount = countMatches(/\bany\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoWasteful = wastefulCount === 0
  const hasNoPrototypeCode = !has(/\beval\b/, content)
  const hasNoInternalLeaking = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let harvest: HarvestGrade
  if (quality >= 85) harvest = 'golden-bounty'
  else if (quality >= 70) harvest = 'rich-harvest'
  else if (quality >= 55) harvest = 'proper-yield'
  else if (quality >= 40) harvest = 'meager-crop'
  else if (quality >= 25) harvest = 'failed-harvest'
  else harvest = 'no-harvest'

  return {
    quality, harvest, hasHighQuality, hasHighValueOutput, hasCompleteCoverage,
    hasNoDeadCode, hasOptimized, hasNoWasteful, hasProductionReady,
    hasNoPrototypeCode, hasCleanExports, hasNoInternalLeaking, hasDeliverable,
    deadCodeCount, wastefulCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify bloom condition
 * @example
 * classifyBloomCondition(90) // 'celestial-tree'
 */
export function classifyBloomCondition(score: number): BloomCondition {
  if (score >= 85) return 'celestial-tree'
  if (score >= 70) return 'cosmic-rose'
  if (score >= 55) return 'proper-plant'
  if (score >= 40) return 'wilting-sprout'
  if (score >= 25) return 'dried-seed'
  return 'void-spore'
}

/**
 * Classify constellation type
 * @example
 * classifyConstellationType(blooms) // 'hanging-gardens'
 */
export function classifyConstellationType(blooms: CelestialBloom[]): ConstellationType {
  if (blooms.length === 0) return 'no-garden'
  const avgQs = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)
  const celestialRatio = blooms.filter(b => b.condition === 'celestial-tree').length / blooms.length
  if (avgQs >= 75 && celestialRatio >= 0.5) return 'hanging-gardens'
  if (avgQs >= 60) return 'cosmic-greenhouse'
  if (avgQs >= 45) return 'proper-garden'
  if (avgQs >= 30) return 'wild-patch'
  if (avgQs >= 15) return 'barren-field'
  return 'no-garden'
}

/**
 * Classify constellation condition
 * @example
 * classifyConstellationCondition(80) // 'eden-reborn'
 */
export function classifyConstellationCondition(avgQs: number): ConstellationCondition {
  if (avgQs >= 75) return 'eden-reborn'
  if (avgQs >= 60) return 'flourishing-realm'
  if (avgQs >= 45) return 'decent-garden'
  if (avgQs >= 30) return 'struggling-patch'
  if (avgQs >= 15) return 'wasteland'
  return 'void'
}

/**
 * Classify gardener grade
 * @example
 * classifyGardenerGrade(85) // 'cosmic-gardener'
 */
export function classifyGardenerGrade(avgFertility: number): GardenerGrade {
  if (avgFertility >= 80) return 'cosmic-gardener'
  if (avgFertility >= 65) return 'master-botanist'
  if (avgFertility >= 50) return 'skilled-cultivator'
  if (avgFertility >= 35) return 'apprentice'
  if (avgFertility >= 20) return 'novice'
  return 'brown-thumb'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(blooms, constellations, garden, stats)
 */
export function generateRecommendations(
  blooms: CelestialBloom[],
  constellations: GardenConstellation[],
  garden: GardenSummary,
  stats: CosmicGardenStats,
): string[] {
  const recs: string[] = []
  if (stats.avgGrowthVitality < 50) {
    recs.push('Boost growth vitality with extensible generics, scalable exports, and adaptable async patterns')
  }
  if (stats.avgRootDepth < 50) {
    recs.push('Deepen root foundations with typed returns, strict equality, and comprehensive error handling')
  }
  if (stats.avgBloomDiversity < 50) {
    recs.push('Expand bloom diversity with varied patterns: interfaces, classes, types, enums, and generics')
  }
  if (stats.avgCelestialHarmony < 50) {
    recs.push('Align celestial harmony with consistent style, lint-clean code, and idiomatic patterns')
  }
  if (stats.avgHarvestQuality < 50) {
    recs.push('Improve harvest quality with clean named exports, documented APIs, and production-ready types')
  }
  if (stats.voidSporeCount > 0) {
    recs.push(`${stats.voidSporeCount} file(s) are void spores — they need cultivation and care`)
  }
  if (garden.overallFertility < 40) {
    recs.push('Overall garden fertility is low — focus on root depth and harvest quality first')
  }
  const allBarren = constellations.every(c => c.constellationType === 'no-garden' || c.constellationType === 'barren-field')
  if (allBarren && constellations.length > 0) {
    recs.push('All garden patches are barren — consider a major architectural replanting')
  }
  const voidFiles = blooms.filter(b => b.condition === 'void-spore').map(b => b.file)
  if (voidFiles.length > 0 && voidFiles.length <= 3) {
    recs.push(`Cultivate these void spores into celestial trees: ${voidFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your cosmic garden flourishes at cosmic-gardener quality! Every bloom radiates celestial beauty')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as celestial bloom
 * @example
 * const b = analyzeCelestialBloom(content, 'index.ts')
 * console.log(b.condition) // 'celestial-tree'
 */
export function analyzeCelestialBloom(content: string, filePath: string): CelestialBloom {
  const growing = measureGrowing(content)
  const rooting = measureRooting(content)
  const blooming = measureBlooming(content)
  const harmonizing = measureHarmonizing(content)
  const harvesting = measureHarvesting(content)

  const qualityScore = Math.round(
    growing.vitality * 0.2 +
    rooting.depth * 0.2 +
    blooming.diversity * 0.2 +
    harmonizing.harmony * 0.2 +
    harvesting.quality * 0.2,
  )

  return {
    file: filePath,
    growthVitality: growing.vitality,
    rootDepth: rooting.depth,
    bloomDiversity: blooming.diversity,
    celestialHarmony: harmonizing.harmony,
    harvestQuality: harvesting.quality,
    growing,
    rooting,
    blooming,
    harmonizing,
    harvesting,
    condition: classifyBloomCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as garden constellation
 * @example
 * const c = analyzeGardenConstellation(blooms, 'src')
 * console.log(c.constellationType) // 'hanging-gardens'
 */
export function analyzeGardenConstellation(blooms: CelestialBloom[], dirPath: string): GardenConstellation {
  if (blooms.length === 0) {
    return {
      directory: dirPath, blooms: [], avgVitality: 0, avgDepth: 0, avgHarmony: 0,
      celestialTreeCount: 0, voidSporeCount: 0, constellationType: 'no-garden', condition: 'void',
    }
  }

  const avgVitality = Math.round(blooms.reduce((s, b) => s + b.growthVitality, 0) / blooms.length)
  const avgDepth = Math.round(blooms.reduce((s, b) => s + b.rootDepth, 0) / blooms.length)
  const avgHarmony = Math.round(blooms.reduce((s, b) => s + b.celestialHarmony, 0) / blooms.length)
  const celestialTreeCount = blooms.filter(b => b.condition === 'celestial-tree').length
  const voidSporeCount = blooms.filter(b => b.condition === 'void-spore').length
  const avgQs = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)

  return {
    directory: dirPath, blooms, avgVitality, avgDepth, avgHarmony,
    celestialTreeCount, voidSporeCount, constellationType: classifyConstellationType(blooms),
    condition: classifyConstellationCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete cosmic garden result
 * @example
 * const result = await buildCosmicGardenResult(files, contents)
 * console.log(result.celebration.milestone) // 480
 */
export async function buildCosmicGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CosmicGardenResult> {
  const blooms = files.map((file, i) => analyzeCelestialBloom(contents[i] ?? '', file))

  const dirMap = new Map<string, CelestialBloom[]>()
  for (const bloom of blooms) {
    const dir = path.dirname(bloom.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(bloom) } else { dirMap.set(dir, [bloom]) }
  }

  const constellations = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzeGardenConstellation(dirBlooms, dir),
  )

  const avgVitality = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.growthVitality, 0) / blooms.length) : 0
  const avgDepth = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rootDepth, 0) / blooms.length) : 0
  const avgHarmony = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.celestialHarmony, 0) / blooms.length) : 0

  const overallFertility = blooms.length > 0
    ? Math.round((avgVitality + avgDepth + avgHarmony) / 3) : 0
  const isFlourishing = avgVitality >= 60

  const garden: GardenSummary = { avgVitality, avgDepth, avgHarmony, isFlourishing, overallFertility }

  const celebration: Celebration = {
    milestone: 480,
    name: 'cosmic-garden',
    message: 'Command #480 \u2014 Where cultivation meets the cosmos. 480 commands built, each one a seed that grew into something beautiful.',
    previousMilestones: [420, 430, 440, 450, 460, 470],
    totalTests: 78000,
  }

  const avgBloomDiversity = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.bloomDiversity, 0) / blooms.length) : 0
  const avgHarvestQuality = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.harvestQuality, 0) / blooms.length) : 0

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file : ''
  const mostVital = blooms.length > 0
    ? blooms.reduce((best, b) => b.growthVitality > best.growthVitality ? b : best).file : ''
  const deepestRooted = blooms.length > 0
    ? blooms.reduce((best, b) => b.rootDepth > best.rootDepth ? b : best).file : ''
  const mostDiverse = blooms.length > 0
    ? blooms.reduce((best, b) => b.bloomDiversity > best.bloomDiversity ? b : best).file : ''
  const mostHarmonious = blooms.length > 0
    ? blooms.reduce((best, b) => b.celestialHarmony > best.celestialHarmony ? b : best).file : ''

  const stats: CosmicGardenStats = {
    totalFiles: blooms.length,
    totalConstellations: constellations.length,
    avgGrowthVitality: avgVitality,
    avgRootDepth: avgDepth,
    avgBloomDiversity,
    avgCelestialHarmony: avgHarmony,
    avgHarvestQuality,
    celestialTreeCount: blooms.filter(b => b.condition === 'celestial-tree').length,
    cosmicRoseCount: blooms.filter(b => b.condition === 'cosmic-rose').length,
    properPlantCount: blooms.filter(b => b.condition === 'proper-plant').length,
    wiltingSproutCount: blooms.filter(b => b.condition === 'wilting-sprout').length,
    driedSeedCount: blooms.filter(b => b.condition === 'dried-seed').length,
    voidSporeCount: blooms.filter(b => b.condition === 'void-spore').length,
    hasHighVitalityCount: blooms.filter(b => b.growing.hasHighVitality).length,
    hasHighDepthCount: blooms.filter(b => b.rooting.hasHighDepth).length,
    hasHighDiversityCount: blooms.filter(b => b.blooming.hasHighDiversity).length,
    hasHighHarmonyCount: blooms.filter(b => b.harmonizing.hasHighHarmony).length,
    hasHighQualityCount: blooms.filter(b => b.harvesting.hasHighQuality).length,
    overallFertility,
    gardenerGrade: classifyGardenerGrade(overallFertility),
    bestBloom, mostVital, deepestRooted, mostDiverse, mostHarmonious,
  }

  const recommendations = generateRecommendations(blooms, constellations, garden, stats)

  return { blooms, constellations, garden, celebration, stats, recommendations }
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
