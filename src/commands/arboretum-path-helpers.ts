// ─── Types ──────────────────────────────────────────────────────────────────

export type TrunkSpecies = 'oak' | 'maple' | 'pine' | 'birch' | 'willow' | 'bamboo' | 'bonsai' | 'deadwood'
export type RootSystem = 'taproot' | 'fibrous' | 'adventitious' | 'aerial' | 'mycorrhizal' | 'shallow'
export type CanopyShape = 'conical' | 'rounded' | 'spreading' | 'columnar' | 'weeping' | 'irregular'
export type GrowthRate = 'ancient' | 'mature' | 'established' | 'growing' | 'sapling' | 'seedling'
export type HealthSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'perpetual' | 'dead-season'
export type FitnessNiche = 'climax' | 'pioneer' | 'generalist' | 'specialist' | 'epiphyte' | 'parasite'
export type SpecimenCondition = 'ancient-oak' | 'champion-tree' | 'healthy-specimen' | 'young-sapling' | 'diseased-tree' | 'dead-stump'
export type SectionType = 'old-growth' | 'mature-forest' | 'managed-grove' | 'nursery' | 'plantation' | 'clear-cut'
export type SectionCondition = 'national-park' | 'arboretum' | 'managed-forest' | 'woodland' | 'copse' | 'wasteland'
export type ArboristGrade = 'master-arborist' | 'senior-arborist' | 'arborist' | 'tree-surgeon' | 'gardener' | 'lumberjack'

export interface TrunkMeasure {
  strength: number
  species: TrunkSpecies
  isHeartwood: boolean
  hasSapwood: boolean
  hasBark: boolean
  hasCambium: boolean
  hasHeartRot: boolean
  hasCracks: boolean
  hasBurls: boolean
  isStraightGrained: boolean
  hasKnots: boolean
  crackCount: number
  knotCount: number
}

export interface RootMeasure {
  depth: number
  system: RootSystem
  isDeepRooted: boolean
  hasTaproot: boolean
  hasLateralRoots: boolean
  hasRootHairs: boolean
  hasRootRot: boolean
  hasGirdling: boolean
  hasRootBound: boolean
  hasMycorrhiza: boolean
  hasSinkerRoots: boolean
  rotCount: number
  girdlingCount: number
}

export interface CanopyMeasure {
  spread: number
  shape: CanopyShape
  isFullCanopy: boolean
  hasDenseFoliage: boolean
  hasOpenCanopy: boolean
  hasDeadBranches: boolean
  hasSuckers: boolean
  hasWatersprouts: boolean
  hasProperPruning: boolean
  hasDappledLight: boolean
  isPhotosynthetic: boolean
  deadBranchCount: number
  suckerCount: number
}

export interface GrowthMeasure {
  rings: number
  rate: GrowthRate
  isHealthyGrowth: boolean
  hasAnnualRings: boolean
  hasSpringGrowth: boolean
  hasSummerPeak: boolean
  hasAutumnShedding: boolean
  hasWinterDormancy: boolean
  hasGrowthSpurt: boolean
  hasStuntedGrowth: boolean
  hasDwarfism: boolean
  hasGigantism: boolean
  ringCount: number
}

export interface HealthMeasure {
  seasonal: number
  season: HealthSeason
  isVigorous: boolean
  hasGoodColor: boolean
  hasDisease: boolean
  hasPests: boolean
  hasFungal: boolean
  hasDrought: boolean
  hasOverwatering: boolean
  hasNutrientDeficiency: boolean
  hasSunlight: boolean
  diseaseCount: number
  pestCount: number
}

export interface FitnessMeasure {
  score: number
  niche: FitnessNiche
  isWellAdapted: boolean
  hasCompetitiveAdvantage: boolean
  hasSymbioticRelationships: boolean
  hasInvasiveTendencies: boolean
  hasNativeOrigin: boolean
  hasHybridVigor: boolean
  isEndemic: boolean
  hasResistance: boolean
  hasEvolutionaryPressure: boolean
  symbiosisCount: number
}

export interface ArborealSpecimen {
  file: string
  trunkStrength: number
  rootDepth: number
  canopySpread: number
  growthRings: number
  seasonalHealth: number
  speciesFitness: number
  trunk: TrunkMeasure
  root: RootMeasure
  canopy: CanopyMeasure
  growth: GrowthMeasure
  health: HealthMeasure
  fitness: FitnessMeasure
  condition: SpecimenCondition
  qualityScore: number
}

export interface ArboretumSection {
  directory: string
  specimens: ArborealSpecimen[]
  avgTrunkStrength: number
  avgRootDepth: number
  avgCanopySpread: number
  ancientOakCount: number
  deadStumpCount: number
  healthySpecimenCount: number
  vigorousCount: number
  sectionType: SectionType
  condition: SectionCondition
}

export interface ArboretumPathStats {
  totalFiles: number
  totalSections: number
  avgTrunkStrength: number
  avgRootDepth: number
  avgCanopySpread: number
  avgGrowthRings: number
  avgSeasonalHealth: number
  avgSpeciesFitness: number
  ancientOakCount: number
  championTreeCount: number
  healthySpecimenCount: number
  youngSaplingCount: number
  diseasedTreeCount: number
  deadStumpCount: number
  isHeartwoodCount: number
  hasHeartRotCount: number
  isDeepRootedCount: number
  hasRootRotCount: number
  hasGirdlingCount: number
  isFullCanopyCount: number
  hasDeadBranchesCount: number
  isHealthyGrowthCount: number
  isVigorousCount: number
  hasDiseaseCount: number
  isWellAdaptedCount: number
  hasSymbioticRelationshipsCount: number
  overallVitality: number
  arboristGrade: ArboristGrade
  bestSpecimen: string
  strongestTrunk: string
  deepestRoots: string
  fullestCanopy: string
  healthiest: string
}

export interface ArboretumPathResult {
  specimens: ArborealSpecimen[]
  sections: ArboretumSection[]
  forest: {
    avgTrunkStrength: number
    avgRootDepth: number
    avgCanopySpread: number
    isHealthyForest: boolean
    overallVitality: number
  }
  stats: ArboretumPathStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const EXPORT_DEFAULT_RE = /export\s+default\s+/g
const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const CLASS_RE = /\bclass\s+\w+/g
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/g
const GENERIC_RE = /<\w+>/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const TRY_CATCH_RE = /try\s*\{/g
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const ANY_TYPE_RE = /:\s*any\b/g
const DEAD_CODE_RE = /\b(debugger|with)\s*[(;]/
const ASYNC_RE = /\basync\s+/

// ─── measureTrunk ───────────────────────────────────────────────────────────

/**
 * Measure core stability and trunk strength
 * @example
 * measureTrunk('export class Handler { process(data: Input): Output {} }') // { strength: 70, ... }
 */
export function measureTrunk(content: string): TrunkMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      strength: 0, species: 'deadwood', isHeartwood: false, hasSapwood: false,
      hasBark: false, hasCambium: false, hasHeartRot: false, hasCracks: false,
      hasBurls: false, isStraightGrained: false, hasKnots: false, crackCount: 0, knotCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length

  const isHeartwood = classes > 0 && functions > 0
  const hasSapwood = functions > 0
  const hasBark = types > 0 && interfaces > 0
  const hasCambium = generics > 0
  const hasHeartRot = anyTypes > 0
  const hasCracks = deadCode > 0
  const hasBurls = classes > 0 && anyTypes > 0
  const isStraightGrained = consts > 0 && lets === 0
  const hasKnots = lets > 0 && lets > consts * 0.5

  let strength = 10
  if (isHeartwood) strength += 15
  if (hasSapwood) strength += 10
  if (hasBark) strength += 15
  if (hasCambium) strength += 10
  if (isStraightGrained) strength += 10
  if (exports > 0) strength += 10
  if (hasHeartRot) strength -= 10
  if (hasCracks) strength -= 10
  if (hasKnots) strength -= 5
  strength = Math.max(0, Math.min(100, strength))

  let species: TrunkSpecies = 'deadwood'
  if (strength >= 80) species = 'oak'
  else if (strength >= 65) species = 'maple'
  else if (strength >= 50) species = 'pine'
  else if (strength >= 35) species = 'birch'
  else if (strength >= 25) species = 'willow'
  else if (strength >= 15) species = 'bamboo'
  else if (strength >= 5) species = 'bonsai'

  return {
    strength, species, isHeartwood, hasSapwood, hasBark, hasCambium,
    hasHeartRot, hasCracks, hasBurls, isStraightGrained, hasKnots,
    crackCount: deadCode, knotCount: Math.max(0, lets - Math.floor(consts * 0.5)),
  }
}

// ─── measureRoot ────────────────────────────────────────────────────────────

/**
 * Measure dependency depth and root system
 * @example
 * measureRoot('import { core } from "foundation"; import { util } from "helpers"') // { depth: 60, ... }
 */
export function measureRoot(content: string): RootMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      depth: 0, system: 'shallow', isDeepRooted: false, hasTaproot: false,
      hasLateralRoots: false, hasRootHairs: false, hasRootRot: false,
      hasGirdling: false, hasRootBound: false, hasMycorrhiza: false,
      hasSinkerRoots: false, rotCount: 0, girdlingCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length

  const isDeepRooted = imports >= 3 && types > 0
  const hasTaproot = imports > 0
  const hasLateralRoots = imports >= 2
  const hasRootHairs = imports >= 4
  const hasRootRot = anyTypes > 0
  const hasGirdling = sideEffects > 2 && tryCatch === 0
  const hasRootBound = imports > 0 && exports === 0
  const hasMycorrhiza = interfaces > 0 && imports > 0
  const hasSinkerRoots = generics > 0 && imports > 0

  let depth = 5
  if (hasTaproot) depth += 15
  if (hasLateralRoots) depth += 10
  if (hasRootHairs) depth += 10
  if (isDeepRooted) depth += 15
  if (hasMycorrhiza) depth += 10
  if (hasSinkerRoots) depth += 10
  if (hasRootRot) depth -= 10
  if (hasGirdling) depth -= 10
  if (hasRootBound) depth -= 5
  depth = Math.max(0, Math.min(100, depth))

  let system: RootSystem = 'shallow'
  if (depth >= 80) system = 'taproot'
  else if (depth >= 60) system = 'fibrous'
  else if (depth >= 45) system = 'mycorrhizal'
  else if (depth >= 30) system = 'adventitious'
  else if (depth >= 15) system = 'aerial'

  return {
    depth, system, isDeepRooted, hasTaproot, hasLateralRoots, hasRootHairs,
    hasRootRot, hasGirdling, hasRootBound, hasMycorrhiza, hasSinkerRoots,
    rotCount: anyTypes, girdlingCount: sideEffects > 2 && tryCatch === 0 ? sideEffects : 0,
  }
}

// ─── measureCanopy ──────────────────────────────────────────────────────────

/**
 * Measure API surface and canopy spread
 * @example
 * measureCanopy('export function a() {} export function b() {} export function c() {}') // { spread: 60, ... }
 */
export function measureCanopy(content: string): CanopyMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      spread: 0, shape: 'irregular', isFullCanopy: false, hasDenseFoliage: false,
      hasOpenCanopy: true, hasDeadBranches: false, hasSuckers: false,
      hasWatersprouts: false, hasProperPruning: false, hasDappledLight: false,
      isPhotosynthetic: false, deadBranchCount: 0, suckerCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const defaults = (content.match(EXPORT_DEFAULT_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  const isFullCanopy = exports >= 2 && types > 0
  const hasDenseFoliage = exports >= 4
  const hasOpenCanopy = exports <= 1
  const hasDeadBranches = defaults > 0
  const hasSuckers = sideEffects > 0
  const hasWatersprouts = anyTypes > 0
  const hasProperPruning = exports > 0 && consts > 0 && functions > 0
  const hasDappledLight = interfaces > 0 && types > 0
  const isPhotosynthetic = exports > 0 && pipes > 0

  let spread = 10
  if (isFullCanopy) spread += 15
  if (hasDenseFoliage) spread += 10
  if (hasProperPruning) spread += 15
  if (hasDappledLight) spread += 10
  if (isPhotosynthetic) spread += 10
  if (hasDeadBranches) spread -= 5
  if (hasSuckers) spread -= 5
  if (hasWatersprouts) spread -= 5
  spread = Math.max(0, Math.min(100, spread))

  let shape: CanopyShape = 'irregular'
  if (spread >= 80) shape = 'rounded'
  else if (spread >= 65) shape = 'spreading'
  else if (spread >= 50) shape = 'conical'
  else if (spread >= 35) shape = 'columnar'
  else if (spread >= 20) shape = 'weeping'

  return {
    spread, shape, isFullCanopy, hasDenseFoliage, hasOpenCanopy, hasDeadBranches,
    hasSuckers, hasWatersprouts, hasProperPruning, hasDappledLight, isPhotosynthetic,
    deadBranchCount: defaults, suckerCount: sideEffects,
  }
}

// ─── measureGrowth ──────────────────────────────────────────────────────────

/**
 * Measure code maturity and growth patterns
 * @example
 * measureGrowth('function legacy() {} function modern(): void {} function next(): Promise<void> {}') // { rings: 60, ... }
 */
export function measureGrowth(content: string): GrowthMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      rings: 0, rate: 'seedling', isHealthyGrowth: false, hasAnnualRings: false,
      hasSpringGrowth: false, hasSummerPeak: false, hasAutumnShedding: false,
      hasWinterDormancy: false, hasGrowthSpurt: false, hasStuntedGrowth: true,
      hasDwarfism: true, hasGigantism: false, ringCount: 0,
    }
  }

  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length

  const isHealthyGrowth = functions > 0 && types > 0
  const hasAnnualRings = classes > 0 || interfaces > 0
  const hasSpringGrowth = asyncs > 0
  const hasSummerPeak = functions >= 3 && pipes > 0
  const hasAutumnShedding = comments > 3 || jsdoc > 0
  const hasWinterDormancy = functions === 0
  const hasGrowthSpurt = functions > 5
  const hasStuntedGrowth = functions > 0 && types === 0
  const hasDwarfism = loc < 10
  const hasGigantism = loc > 300

  let rings = 10
  if (isHealthyGrowth) rings += 15
  if (hasAnnualRings) rings += 10
  if (hasSpringGrowth) rings += 10
  if (hasSummerPeak) rings += 10
  if (hasAutumnShedding) rings += 5
  if (generics > 0) rings += 10
  if (consts > 0 && lets === 0) rings += 10
  if (hasStuntedGrowth) rings -= 10
  if (hasDwarfism) rings -= 5
  rings = Math.max(0, Math.min(100, rings))

  let rate: GrowthRate = 'seedling'
  if (rings >= 80) rate = 'ancient'
  else if (rings >= 65) rate = 'mature'
  else if (rings >= 50) rate = 'established'
  else if (rings >= 35) rate = 'growing'
  else if (rings >= 15) rate = 'sapling'

  return {
    rings, rate, isHealthyGrowth, hasAnnualRings, hasSpringGrowth, hasSummerPeak,
    hasAutumnShedding, hasWinterDormancy, hasGrowthSpurt, hasStuntedGrowth,
    hasDwarfism, hasGigantism, ringCount: functions + classes,
  }
}

// ─── measureHealth ──────────────────────────────────────────────────────────

/**
 * Measure maintenance health and seasonal condition
 * @example
 * measureHealth('/** Well documented *\/ function clean(): void {} try {} catch {}') // { seasonal: 70, ... }
 */
export function measureHealth(content: string): HealthMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      seasonal: 0, season: 'dead-season', isVigorous: false, hasGoodColor: false,
      hasDisease: false, hasPests: false, hasFungal: false, hasDrought: true,
      hasOverwatering: false, hasNutrientDeficiency: true, hasSunlight: false,
      diseaseCount: 0, pestCount: 0,
    }
  }

  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length

  const isVigorous = types > 0 && jsdoc > 0 && tryCatch > 0
  const hasGoodColor = consts > 0 && lets === 0
  const hasDisease = anyTypes > 0 || deadCode > 0
  const hasPests = mutations > 2
  const hasFungal = sideEffects > 1 && tryCatch === 0
  const hasDrought = jsdoc === 0 && comments === 0
  const hasOverwatering = comments > loc * 0.5
  const hasNutrientDeficiency = types === 0
  const hasSunlight = jsdoc > 0

  let seasonal = 15
  if (isVigorous) seasonal += 15
  if (hasGoodColor) seasonal += 10
  if (hasSunlight) seasonal += 10
  if (tryCatch > 0) seasonal += 10
  if (pipes > 0) seasonal += 5
  if (hasDisease) seasonal -= 10
  if (hasPests) seasonal -= 5
  if (hasFungal) seasonal -= 10
  if (hasDrought) seasonal -= 5
  seasonal = Math.max(0, Math.min(100, seasonal))

  let season: HealthSeason = 'dead-season'
  if (seasonal >= 80) season = 'perpetual'
  else if (seasonal >= 65) season = 'spring'
  else if (seasonal >= 50) season = 'summer'
  else if (seasonal >= 35) season = 'autumn'
  else if (seasonal >= 15) season = 'winter'

  return {
    seasonal, season, isVigorous, hasGoodColor, hasDisease, hasPests,
    hasFungal, hasDrought, hasOverwatering, hasNutrientDeficiency, hasSunlight,
    diseaseCount: anyTypes + deadCode, pestCount: mutations,
  }
}

// ─── measureFitness ─────────────────────────────────────────────────────────

/**
 * Measure pattern fitness and ecological niche
 * @example
 * measureFitness('export function core(): Result {} import { Config } from "config"') // { score: 60, ... }
 */
export function measureFitness(content: string): FitnessMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      score: 0, niche: 'parasite', isWellAdapted: false, hasCompetitiveAdvantage: false,
      hasSymbioticRelationships: false, hasInvasiveTendencies: false, hasNativeOrigin: false,
      hasHybridVigor: false, isEndemic: false, hasResistance: false,
      hasEvolutionaryPressure: false, symbiosisCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const isWellAdapted = exports > 0 && types > 0
  const hasCompetitiveAdvantage = generics > 0 && pipes > 0
  const hasSymbioticRelationships = imports > 0 && exports > 0
  const hasInvasiveTendencies = exports > 5
  const hasNativeOrigin = classes > 0 || interfaces > 0
  const hasHybridVigor = pipes > 0 && classes > 0
  const isEndemic = functions > 0 && imports === 0 && exports === 0
  const hasResistance = anyTypes === 0 && sideEffects === 0
  const hasEvolutionaryPressure = generics > 0 || async_count(content) > 0

  let score = 10
  if (isWellAdapted) score += 15
  if (hasCompetitiveAdvantage) score += 15
  if (hasSymbioticRelationships) score += 10
  if (hasNativeOrigin) score += 10
  if (hasHybridVigor) score += 10
  if (hasResistance) score += 10
  if (hasInvasiveTendencies) score -= 5
  if (isEndemic) score -= 5
  score = Math.max(0, Math.min(100, score))

  let niche: FitnessNiche = 'parasite'
  if (score >= 80) niche = 'climax'
  else if (score >= 65) niche = 'generalist'
  else if (score >= 50) niche = 'pioneer'
  else if (score >= 35) niche = 'specialist'
  else if (score >= 20) niche = 'epiphyte'

  return {
    score, niche, isWellAdapted, hasCompetitiveAdvantage, hasSymbioticRelationships,
    hasInvasiveTendencies, hasNativeOrigin, hasHybridVigor, isEndemic,
    hasResistance, hasEvolutionaryPressure, symbiosisCount: Math.min(imports, exports),
  }
}

function async_count(content: string): number {
  return (content.match(ASYNC_RE) ?? []).length
}

// ─── analyzeArborealSpecimen ────────────────────────────────────────────────

/**
 * Analyze a single file as an arboreal specimen
 * @example
 * analyzeArborealSpecimen('export class Handler {}', 'handler.ts') // { qualityScore: 50, ... }
 */
export function analyzeArborealSpecimen(content: string, filePath: string): ArborealSpecimen {
  const trunk = measureTrunk(content)
  const root = measureRoot(content)
  const canopy = measureCanopy(content)
  const growth = measureGrowth(content)
  const health = measureHealth(content)
  const fitness = measureFitness(content)

  const trunkStrength = trunk.strength
  const rootDepth = root.depth
  const canopySpread = canopy.spread
  const growthRings = growth.rings
  const seasonalHealth = health.seasonal
  const speciesFitness = fitness.score

  const qualityScore = Math.round(
    (trunkStrength + rootDepth + canopySpread + growthRings + seasonalHealth + speciesFitness) / 6,
  )

  let condition: SpecimenCondition = 'dead-stump'
  if (qualityScore >= 90) condition = 'ancient-oak'
  else if (qualityScore >= 75) condition = 'champion-tree'
  else if (qualityScore >= 55) condition = 'healthy-specimen'
  else if (qualityScore >= 35) condition = 'young-sapling'
  else if (qualityScore >= 15) condition = 'diseased-tree'

  return {
    file: filePath,
    trunkStrength, rootDepth, canopySpread, growthRings, seasonalHealth, speciesFitness,
    trunk, root, canopy, growth, health, fitness,
    condition, qualityScore,
  }
}

// ─── classifySectionType ────────────────────────────────────────────────────

/**
 * Classify section type based on specimens
 * @example
 * classifySectionType(specimens) // 'old-growth'
 */
export function classifySectionType(specimens: ArborealSpecimen[]): SectionType {
  if (specimens.length === 0) return 'clear-cut'
  const avgQuality = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  const ancientCount = specimens.filter((sp) => sp.condition === 'ancient-oak').length

  if (avgQuality >= 80 && ancientCount >= 2) return 'old-growth'
  if (avgQuality >= 65) return 'mature-forest'
  if (avgQuality >= 50) return 'managed-grove'
  if (avgQuality >= 35) return 'nursery'
  if (avgQuality >= 15) return 'plantation'
  return 'clear-cut'
}

// ─── classifyArboristGrade ──────────────────────────────────────────────────

/**
 * Classify arborist grade based on average vitality
 * @example
 * classifyArboristGrade(85) // 'senior-arborist'
 */
export function classifyArboristGrade(avgVitality: number): ArboristGrade {
  if (avgVitality >= 90) return 'master-arborist'
  if (avgVitality >= 75) return 'senior-arborist'
  if (avgVitality >= 55) return 'arborist'
  if (avgVitality >= 35) return 'tree-surgeon'
  if (avgVitality >= 15) return 'gardener'
  return 'lumberjack'
}

// ─── classifySectionCondition ───────────────────────────────────────────────

function classifySectionCondition(avgQuality: number): SectionCondition {
  if (avgQuality >= 80) return 'national-park'
  if (avgQuality >= 65) return 'arboretum'
  if (avgQuality >= 45) return 'managed-forest'
  if (avgQuality >= 25) return 'woodland'
  if (avgQuality >= 10) return 'copse'
  return 'wasteland'
}

// ─── analyzeArboretumSection ────────────────────────────────────────────────

/**
 * Analyze a directory as an arboretum section
 * @example
 * analyzeArboretumSection(specimens, 'src/') // { sectionType: 'managed-grove', ... }
 */
export function analyzeArboretumSection(specimens: ArborealSpecimen[], dirPath: string): ArboretumSection {
  if (specimens.length === 0) {
    return {
      directory: dirPath, specimens: [],
      avgTrunkStrength: 0, avgRootDepth: 0, avgCanopySpread: 0,
      ancientOakCount: 0, deadStumpCount: 0, healthySpecimenCount: 0, vigorousCount: 0,
      sectionType: 'clear-cut', condition: 'wasteland',
    }
  }

  const avgTrunkStrength = Math.round(specimens.reduce((s, sp) => s + sp.trunkStrength, 0) / specimens.length)
  const avgRootDepth = Math.round(specimens.reduce((s, sp) => s + sp.rootDepth, 0) / specimens.length)
  const avgCanopySpread = Math.round(specimens.reduce((s, sp) => s + sp.canopySpread, 0) / specimens.length)
  const avgQuality = Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length)

  return {
    directory: dirPath, specimens,
    avgTrunkStrength, avgRootDepth, avgCanopySpread,
    ancientOakCount: specimens.filter((sp) => sp.condition === 'ancient-oak').length,
    deadStumpCount: specimens.filter((sp) => sp.condition === 'dead-stump').length,
    healthySpecimenCount: specimens.filter((sp) => sp.condition === 'healthy-specimen').length,
    vigorousCount: specimens.filter((sp) => sp.health.isVigorous).length,
    sectionType: classifySectionType(specimens),
    condition: classifySectionCondition(avgQuality),
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(specimens, sections, forest, stats) // ['Strengthen trunk...']
 */
export function generateRecommendations(
  specimens: ArborealSpecimen[],
  sections: ArboretumSection[],
  _forest: { avgTrunkStrength: number; avgRootDepth: number; avgCanopySpread: number; isHealthyForest: boolean; overallVitality: number },
  stats: ArboretumPathStats,
): string[] {
  const recs: string[] = []

  if (stats.deadStumpCount > stats.totalFiles * 0.3) {
    recs.push('Too many dead stumps — remove or completely rewrite critically damaged files')
  }
  if (stats.avgTrunkStrength < 40) {
    recs.push('Weak trunks — add classes, type annotations, and consistent const usage')
  }
  if (stats.hasRootRotCount > stats.totalFiles * 0.2) {
    recs.push('Root rot spreading — eliminate any types throughout the codebase')
  }
  if (stats.avgRootDepth < 40) {
    recs.push('Shallow roots — add imports, interfaces, and shared utility dependencies')
  }
  if (stats.hasDiseaseCount > stats.totalFiles * 0.3) {
    recs.push('Disease outbreak — fix code rot: remove debugger statements and any types')
  }
  if (stats.avgSeasonalHealth < 40) {
    recs.push('Poor seasonal health — add JSDoc, try-catch blocks, and use const over let')
  }
  if (stats.avgSpeciesFitness < 40) {
    recs.push('Poor species fitness — improve exports, add generics, and create beneficial patterns')
  }

  const worst = specimens.length > 0
    ? specimens.reduce((w, sp) => sp.qualityScore < w.qualityScore ? sp : w, specimens[0] as typeof specimens[number])
    : null
  if (worst && worst.qualityScore < 25) {
    recs.push(`Worst specimen "${worst.file}" needs replanting (score: ${worst.qualityScore})`)
  }

  if (sections.some((s) => s.condition === 'wasteland')) {
    recs.push('Wasteland sections detected — some directories need major reforestation')
  }

  return recs.length > 0 ? recs : ['Forest is thriving — continue current stewardship practices!']
}

// ─── buildArboretumPathResult ───────────────────────────────────────────────

/**
 * Build the complete arboretum path result
 * @example
 * buildArboretumPathResult(['a.ts'], ['export function run(): void {}'], {}) // { specimens: [...], ... }
 */
export function buildArboretumPathResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ArboretumPathResult {
  const specimens: ArborealSpecimen[] = []
  for (let i = 0; i < files.length; i++) {
    specimens.push(analyzeArborealSpecimen(contents[i] ?? '', files[i] ?? ''))
  }

  const dirMap = new Map<string, ArborealSpecimen[]>()
  for (const spec of specimens) {
    const dir = spec.file.includes('/') ? spec.file.substring(0, spec.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(spec)
    } else {
      dirMap.set(dir, [spec])
    }
  }

  const sections: ArboretumSection[] = []
  for (const [dir, dirSpecs] of dirMap) {
    sections.push(analyzeArboretumSection(dirSpecs, dir))
  }

  const avgTrunkStrength = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.trunkStrength, 0) / specimens.length) : 0
  const avgRootDepth = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.rootDepth, 0) / specimens.length) : 0
  const avgCanopySpread = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.canopySpread, 0) / specimens.length) : 0
  const overallVitality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length) : 0

  const forest = {
    avgTrunkStrength, avgRootDepth, avgCanopySpread,
    isHealthyForest: overallVitality >= 60,
    overallVitality,
  }

  const conditions = specimens.map((sp) => sp.condition)
  const bestSpecimen = specimens.length > 0
    ? specimens.reduce((b, sp) => sp.qualityScore > b.qualityScore ? sp : b, specimens[0] as typeof specimens[number])
    : null
  const strongestTrunk = specimens.length > 0
    ? specimens.reduce((b, sp) => sp.trunkStrength > b.trunkStrength ? sp : b, specimens[0] as typeof specimens[number])
    : null
  const deepestRoots = specimens.length > 0
    ? specimens.reduce((b, sp) => sp.rootDepth > b.rootDepth ? sp : b, specimens[0] as typeof specimens[number])
    : null
  const fullestCanopy = specimens.length > 0
    ? specimens.reduce((b, sp) => sp.canopySpread > b.canopySpread ? sp : b, specimens[0] as typeof specimens[number])
    : null
  const healthiest = specimens.length > 0
    ? specimens.reduce((b, sp) => sp.seasonalHealth > b.seasonalHealth ? sp : b, specimens[0] as typeof specimens[number])
    : null

  const stats: ArboretumPathStats = {
    totalFiles: specimens.length,
    totalSections: sections.length,
    avgTrunkStrength,
    avgRootDepth,
    avgCanopySpread,
    avgGrowthRings: specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.growthRings, 0) / specimens.length) : 0,
    avgSeasonalHealth: specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.seasonalHealth, 0) / specimens.length) : 0,
    avgSpeciesFitness: specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.speciesFitness, 0) / specimens.length) : 0,
    ancientOakCount: conditions.filter((c) => c === 'ancient-oak').length,
    championTreeCount: conditions.filter((c) => c === 'champion-tree').length,
    healthySpecimenCount: conditions.filter((c) => c === 'healthy-specimen').length,
    youngSaplingCount: conditions.filter((c) => c === 'young-sapling').length,
    diseasedTreeCount: conditions.filter((c) => c === 'diseased-tree').length,
    deadStumpCount: conditions.filter((c) => c === 'dead-stump').length,
    isHeartwoodCount: specimens.filter((sp) => sp.trunk.isHeartwood).length,
    hasHeartRotCount: specimens.filter((sp) => sp.trunk.hasHeartRot).length,
    isDeepRootedCount: specimens.filter((sp) => sp.root.isDeepRooted).length,
    hasRootRotCount: specimens.filter((sp) => sp.root.hasRootRot).length,
    hasGirdlingCount: specimens.filter((sp) => sp.root.hasGirdling).length,
    isFullCanopyCount: specimens.filter((sp) => sp.canopy.isFullCanopy).length,
    hasDeadBranchesCount: specimens.filter((sp) => sp.canopy.hasDeadBranches).length,
    isHealthyGrowthCount: specimens.filter((sp) => sp.growth.isHealthyGrowth).length,
    isVigorousCount: specimens.filter((sp) => sp.health.isVigorous).length,
    hasDiseaseCount: specimens.filter((sp) => sp.health.hasDisease).length,
    isWellAdaptedCount: specimens.filter((sp) => sp.fitness.isWellAdapted).length,
    hasSymbioticRelationshipsCount: specimens.filter((sp) => sp.fitness.hasSymbioticRelationships).length,
    overallVitality,
    arboristGrade: classifyArboristGrade(overallVitality),
    bestSpecimen: bestSpecimen?.file ?? '',
    strongestTrunk: strongestTrunk?.file ?? '',
    deepestRoots: deepestRoots?.file ?? '',
    fullestCanopy: fullestCanopy?.file ?? '',
    healthiest: healthiest?.file ?? '',
  }

  const recommendations = generateRecommendations(specimens, sections, forest, stats)

  return { specimens, sections, forest, stats, recommendations }
}
