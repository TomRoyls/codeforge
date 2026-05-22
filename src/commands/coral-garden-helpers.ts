// ─── Interfaces ────────────────────────────────────────────────────────────

export interface CoralMeasure {
  health: number
  species: 'brain-coral' | 'staghorn' | 'elkhorn' | 'table-coral' | 'pillar-coral' | 'sea-fan'
  color: 'vibrant' | 'healthy' | 'pale' | 'bleaching' | 'bleached' | 'dead'
  isHealthy: boolean
  hasVibrantColor: boolean
  hasProperCalcification: boolean
  hasNoBleaching: boolean
  hasNoDisease: boolean
  hasRegeneration: boolean
  hasZooxanthellae: boolean
  hasSpawning: boolean
  hasFragmentation: boolean
  hasRecruitment: boolean
  diseaseCount: number
}

export interface PolypMeasure {
  activity: number
  density: 'high' | 'medium' | 'low' | 'sparse' | 'absent' | 'fossilized'
  isActive: boolean
  hasFeeding: boolean
  hasReproduction: boolean
  hasDefense: boolean
  hasCommunication: boolean
  hasWasteRemoval: boolean
  hasRespiration: boolean
  hasPhotosynthesis: boolean
  hasNematocyst: boolean
  hasMucusProduction: boolean
  activityScore: number
}

export interface DiversityMeasure {
  score: number
  richness: 'high' | 'moderate' | 'low' | 'sparse' | 'monoculture' | 'sterile'
  hasHighRichness: boolean
  hasEvenness: boolean
  hasShannonIndex: boolean
  hasFunctionalDiversity: boolean
  hasStructuralDiversity: boolean
  hasTaxonomicDiversity: boolean
  hasNoMonoculture: boolean
  hasNoInvasive: boolean
  hasEndemic: boolean
  hasKeystone: boolean
  invasiveCount: number
  endemicCount: number
}

export interface SymbiosisMeasure {
  network: number
  type: 'mutualism' | 'commensalism' | 'parasitism' | 'competition' | 'neutralism' | 'amensalism'
  hasMutualBenefit: boolean
  hasCleanerFish: boolean
  hasClownfishAnemone: boolean
  hasParasiticSponge: boolean
  hasCrownOfThorns: boolean
  hasNitrogenFixation: boolean
  hasCarbonSequestration: boolean
  hasBioerosion: boolean
  hasTrophicCascade: boolean
  mutualismCount: number
  parasitismCount: number
}

export interface GrowthMeasure {
  rate: number
  pattern: 'branching' | 'massive' | 'encrusting' | 'foliose' | 'digitate' | 'stunted'
  isHealthyGrowth: boolean
  hasLinearGrowth: boolean
  hasExponentialGrowth: boolean
  hasLogisticGrowth: boolean
  hasSeasonalGrowth: boolean
  hasCalcification: boolean
  hasExtension: boolean
  hasDensityBanding: boolean
  hasBioerosion: boolean
  hasRecruitment: boolean
  growthScore: number
}

export interface EnvironmentMeasure {
  quality: number
  temperature: 'optimal' | 'warm' | 'hot' | 'cool' | 'cold' | 'freezing'
  hasClearWater: boolean
  hasProperSalinity: boolean
  hasGoodCirculation: boolean
  hasNoPollution: boolean
  hasNoSedimentation: boolean
  hasNoAcidification: boolean
  hasUVProtection: boolean
  hasNutrientUpwelling: boolean
  hasTidalExchange: boolean
  hasStormProtection: boolean
  pollutionCount: number
}

export interface CoralSpecimen {
  file: string
  coralHealth: number
  polypActivity: number
  reefDiversity: number
  symbioticNetwork: number
  growthRate: number
  waterQuality: number
  coral: CoralMeasure
  polyp: PolypMeasure
  diversity: DiversityMeasure
  symbiosis: SymbiosisMeasure
  growth: GrowthMeasure
  environment: EnvironmentMeasure
  condition: 'thriving-reef' | 'healthy-garden' | 'recovering-coral' | 'stressed-reef' | 'bleaching-event' | 'dead-skeleton'
  qualityScore: number
}

export interface CoralBed {
  directory: string
  specimens: CoralSpecimen[]
  avgHealth: number
  avgDiversity: number
  avgSymbiosis: number
  thrivingCount: number
  deadCount: number
  mutualismCount: number
  activePolypCount: number
  bedType: 'barrier-reef' | 'atoll' | 'fringing-reef' | 'patch-reef' | 'rocky-shore' | 'sand-flat'
  condition: 'marine-sanctuary' | 'national-park' | 'protected-area' | 'stressed-zone' | 'bleaching-zone' | 'dead-zone'
}

export interface CoralGarden {
  avgHealth: number
  avgDiversity: number
  avgSymbiosis: number
  isThriving: boolean
  overallHealth: number
}

export interface CoralStats {
  totalFiles: number
  totalBeds: number
  avgCoralHealth: number
  avgPolypActivity: number
  avgReefDiversity: number
  avgSymbioticNetwork: number
  avgGrowthRate: number
  avgWaterQuality: number
  thrivingReefCount: number
  healthyGardenCount: number
  recoveringCoralCount: number
  stressedReefCount: number
  bleachingEventCount: number
  deadSkeletonCount: number
  isHealthyCount: number
  hasVibrantColorCount: number
  hasRegenerationCount: number
  isActiveCount: number
  hasHighRichnessCount: number
  hasNoMonocultureCount: number
  hasMutualBenefitCount: number
  hasParasiticSpongeCount: number
  isHealthyGrowthCount: number
  hasClearWaterCount: number
  hasNoPollutionCount: number
  overallHealth: number
  marineGrade: 'marine-biologist' | 'reef-scientist' | 'oceanographer' | 'diver' | 'snorkeler' | 'beachgoer'
  bestSpecimen: string
  healthiestCoral: string
  mostActive: string
  mostDiverse: string
  bestSymbiosis: string
}

export interface CoralGardenResult {
  specimens: CoralSpecimen[]
  beds: CoralBed[]
  garden: CoralGarden
  stats: CoralStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────────────

const TODO_REGEX = /TODO/gi
const FIXME_REGEX = /FIXME/gi
const HACK_REGEX = /HACK/gi
const DEPRECATED_REGEX = /@deprecated/g
const CONSOLE_REGEX = /console\.\w+/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /\/\/\s*@ts-ignore/g
const TS_EXPECT_ERROR_REGEX = /\/\/\s*@ts-expect-error/g
const FUNCTION_REGEX = /\bfunction\b/g
const ARROW_REGEX = /=>\s*{/g
const CLASS_REGEX = /\bclass\b/g
const INTERFACE_REGEX = /\binterface\b/g
const TYPE_REGEX = /\btype\s+\w+\s*=/g
const EXPORT_REGEX = /\bexport\b/g
const IMPORT_REGEX = /\bimport\b/g
const ASYNC_REGEX = /\basync\b/g
const TRY_REGEX = /\btry\s*{/g
const CATCH_REGEX = /\bcatch\s*\(/g
const FINALLY_REGEX = /\bfinally\s*{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const RETURN_REGEX = /\breturn\b/g
const THROW_REGEX = /\bthrow\b/g
const TYPE_ANNOTATION_REGEX = /:\s*(?:string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const LINE_COMMENT_REGEX = /\/\/.*$/gm
const TEST_REGEX = /\b(?:describe|it|test|expect)\b/g
const ENUM_REGEX = /\benum\b/g
const GENERIC_REGEX = /<[^>]+>/g
const SPREAD_REGEX = /\.\.\./g

// ─── Counting Helpers ──────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

function countEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length === 0).length
}

function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX) + countMatches(content, ARROW_REGEX)
}

function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX) + countMatches(content, SWITCH_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_REGEX) + countMatches(content, CATCH_REGEX) + countMatches(content, FINALLY_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countComments(content: string): number {
  return countMatches(content, JSDOC_REGEX) + countMatches(content, LINE_COMMENT_REGEX)
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX) + countMatches(content, FIXME_REGEX) + countMatches(content, HACK_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX) + countMatches(content, TS_EXPECT_ERROR_REGEX)
}

// ─── Measure Coral ─────────────────────────────────────────────────────────

/** @example measureCoral('export function foo(): void {}') returns CoralMeasure */
export function measureCoral(content: string): CoralMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)

  const totalDeclarations = funcs + classes + interfaces + typeAliases
  const hasDeclarations = totalDeclarations > 0
  const hasTyped = typeAnnotations > 0
  const hasExports = exports > 0

  const baseHealth = lines === 0 ? 5 : Math.min(40, totalDeclarations * 7 + lines * 2)
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const exportBonus = Math.min(10, exports * 3)
  const commentBonus = Math.min(10, Math.min(comments, 4) * 2)
  const errorBonus = Math.min(10, errorHandling * 3)
  const smellPenalty = Math.min(20, (smells + todos) * 5)
  const deprecatedPenalty = Math.min(10, deprecated * 5)
  const health = Math.max(0, Math.min(100, baseHealth + typeBonus + exportBonus + commentBonus + errorBonus - smellPenalty - deprecatedPenalty))

  const isHealthy = health >= 60 && smells === 0
  const hasVibrantColor = health >= 80 && hasTyped && hasExports && smells === 0
  const hasProperCalcification = hasDeclarations && hasTyped
  const hasNoBleaching = health >= 40
  const hasNoDisease = smells === 0 && deprecated === 0
  const hasRegeneration = errorHandling > 0
  const hasZooxanthellae = hasExports && countImports(content) > 0
  const hasSpawning = exports > 3
  const hasFragmentation = classes > 0 && funcs > 3
  const hasRecruitment = hasExports && comments > 0
  const diseaseCount = smells + todos + deprecated

  let species: CoralMeasure['species']
  if (health >= 80 && classes > 0 && interfaces > 0) species = 'brain-coral'
  else if (health >= 65 && funcs > 3) species = 'staghorn'
  else if (health >= 50 && classes > 0) species = 'elkhorn'
  else if (health >= 35 && hasDeclarations) species = 'table-coral'
  else if (health >= 20) species = 'pillar-coral'
  else species = 'sea-fan'

  let color: CoralMeasure['color']
  if (health >= 80 && hasNoDisease) color = 'vibrant'
  else if (health >= 65) color = 'healthy'
  else if (health >= 45) color = 'pale'
  else if (health >= 25) color = 'bleaching'
  else if (health >= 10) color = 'bleached'
  else color = 'dead'

  return {
    health,
    species,
    color,
    isHealthy,
    hasVibrantColor,
    hasProperCalcification,
    hasNoBleaching,
    hasNoDisease,
    hasRegeneration,
    hasZooxanthellae,
    hasSpawning,
    hasFragmentation,
    hasRecruitment,
    diseaseCount,
  }
}

// ─── Measure Polyp ─────────────────────────────────────────────────────────

/** @example measurePolyp('export async function process(): Promise<void> {}') returns PolypMeasure */
export function measurePolyp(content: string): PolypMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const exports = countExports(content)
  const imports = countImports(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const returns = countMatches(content, RETURN_REGEX)
  const throws = countMatches(content, THROW_REGEX)
  const errorHandling = countErrorHandling(content)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const hasCode = funcs > 0 || lines > 0

  const baseActivity = lines === 0 ? 5 : Math.min(35, funcs * 7 + lines)
  const asyncBonus = Math.min(15, asyncs * 5)
  const exportBonus = Math.min(15, exports * 4)
  const flowBonus = Math.min(10, (returns + throws) * 2)
  const complexityBonus = Math.min(10, (conditionals + loops) * 2)
  const smellPenalty = Math.min(20, (smells + todos) * 4)
  const activity = Math.max(0, Math.min(100, baseActivity + asyncBonus + exportBonus + flowBonus + complexityBonus - smellPenalty))

  const isActive = activity >= 40
  const hasFeeding = funcs > 0 && returns > 0
  const hasReproduction = exports > 0 && funcs > 0
  const hasDefense = errorHandling > 0
  const hasCommunication = imports > 0 && exports > 0
  const hasWasteRemoval = errorHandling > 0 && funcs > 0
  const hasRespiration = asyncs > 0
  const hasPhotosynthesis = funcs > 0 && countTypeAnnotations(content) > 0
  const hasNematocyst = throws > 0
  const hasMucusProduction = classes > 0 && errorHandling > 0
  const activityScore = activity

  let density: PolypMeasure['density']
  if (funcs >= 10) density = 'high'
  else if (funcs >= 5) density = 'medium'
  else if (funcs >= 2) density = 'low'
  else if (funcs >= 1) density = 'sparse'
  else if (hasCode) density = 'absent'
  else density = 'fossilized'

  return {
    activity,
    density,
    isActive,
    hasFeeding,
    hasReproduction,
    hasDefense,
    hasCommunication,
    hasWasteRemoval,
    hasRespiration,
    hasPhotosynthesis: funcs > 0 && countTypeAnnotations(content) > 0,
    hasNematocyst,
    hasMucusProduction,
    activityScore,
  }
}

// ─── Measure Diversity ─────────────────────────────────────────────────────

/** @example measureDiversity('export class Foo implements Bar {}') returns DiversityMeasure */
export function measureDiversity(content: string): DiversityMeasure {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const enums = countMatches(content, ENUM_REGEX)
  const generics = countMatches(content, GENERIC_REGEX)
  const spreads = countMatches(content, SPREAD_REGEX)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const exports = countExports(content)
  const smells = countSmells(content)

  const constructTypes = [funcs, classes, interfaces, typeAliases, enums]
  const activeTypes = constructTypes.filter((c) => c > 0).length

  const baseScore = Math.min(30, activeTypes * 6)
  const featureBonus = Math.min(20, (generics + asyncs + spreads) * 3)
  const controlBonus = Math.min(15, (conditionals + loops) * 2)
  const exportBonus = Math.min(15, exports * 3)
  const smellPenalty = Math.min(20, smells * 5)
  const score = Math.max(0, Math.min(100, baseScore + featureBonus + controlBonus + exportBonus - smellPenalty))

  const hasHighRichness = activeTypes >= 4
  const hasEvenness = activeTypes >= 2 && Math.max(...constructTypes) <= Math.max(1, ...constructTypes.filter((c) => c > 0)) * 3
  const hasShannonIndex = activeTypes >= 3
  const hasFunctionalDiversity = funcs > 0 && asyncs > 0
  const hasStructuralDiversity = classes > 0 && interfaces > 0
  const hasTaxonomicDiversity = typeAliases > 0 && (interfaces > 0 || generics > 0)
  const hasNoMonoculture = activeTypes >= 2
  const hasNoInvasive = smells === 0
  const hasEndemic = generics > 0 || spreads > 0
  const hasKeystone = exports > 0 && classes > 0
  const invasiveCount = smells
  const endemicCount = generics + spreads

  let richness: DiversityMeasure['richness']
  if (score >= 70) richness = 'high'
  else if (score >= 50) richness = 'moderate'
  else if (score >= 35) richness = 'low'
  else if (score >= 20) richness = 'sparse'
  else if (score >= 10) richness = 'monoculture'
  else richness = 'sterile'

  return {
    score,
    richness,
    hasHighRichness,
    hasEvenness,
    hasShannonIndex,
    hasFunctionalDiversity,
    hasStructuralDiversity,
    hasTaxonomicDiversity,
    hasNoMonoculture,
    hasNoInvasive,
    hasEndemic,
    hasKeystone,
    invasiveCount,
    endemicCount,
  }
}

// ─── Measure Symbiosis ─────────────────────────────────────────────────────

/** @example measureSymbiosis('import { X } from "y"; export class Z implements X {}') returns SymbiosisMeasure */
export function measureSymbiosis(content: string): SymbiosisMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const smells = countSmells(content)
  const funcs = countFunctions(content)
  const lines = countNonEmptyLines(content)
  const hasCode = funcs > 0 || lines > 0

  const balanceScore = exports > 0 && imports > 0 ? 25 : exports > 0 ? 10 : 0
  const structureScore = Math.min(20, (classes + interfaces) * 6)
  const typeScore = Math.min(15, typeAnnotations * 2)
  const docScore = Math.min(10, Math.min(comments, 4) * 2)
  const errorScore = Math.min(10, errorHandling * 3)
  const smellPenalty = Math.min(25, (smells + todos + deprecated) * 5)
  const network = Math.max(0, Math.min(100, 10 + balanceScore + structureScore + typeScore + docScore + errorScore - smellPenalty))

  const hasMutualBenefit = exports > 0 && imports > 0 && smells === 0
  const hasCleanerFish = errorHandling > 0
  const hasClownfishAnemone = classes > 0 && errorHandling > 0
  const hasParasiticSponge = deprecated > 0
  const hasCrownOfThorns = smells > 0 && deprecated > 0
  const hasNitrogenFixation = exports > 0 && imports > 0
  const hasCarbonSequestration = typeAnnotations > 0 && exports > 0
  const hasBioerosion = todos > 0
  const hasTrophicCascade = imports > exports + 3 && hasCode
  const mutualismCount = [hasMutualBenefit, hasCleanerFish, hasClownfishAnemone, hasNitrogenFixation, hasCarbonSequestration].filter(Boolean).length
  const parasitismCount = [hasParasiticSponge, hasCrownOfThorns, hasBioerosion, hasTrophicCascade].filter(Boolean).length

  let type: SymbiosisMeasure['type']
  if (hasMutualBenefit && parasitismCount === 0) type = 'mutualism'
  else if (hasNitrogenFixation && parasitismCount === 0) type = 'commensalism'
  else if (hasCrownOfThorns || parasitismCount > mutualismCount) type = 'parasitism'
  else if (hasTrophicCascade) type = 'competition'
  else if (hasCode) type = 'neutralism'
  else type = 'amensalism'

  return {
    network,
    type,
    hasMutualBenefit,
    hasCleanerFish,
    hasClownfishAnemone,
    hasParasiticSponge,
    hasCrownOfThorns,
    hasNitrogenFixation,
    hasCarbonSequestration,
    hasBioerosion,
    hasTrophicCascade,
    mutualismCount,
    parasitismCount,
  }
}

// ─── Measure Growth ────────────────────────────────────────────────────────

/** @example measureGrowth('export class Service { async run() {} }') returns GrowthMeasure */
export function measureGrowth(content: string): GrowthMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const hasCode = funcs > 0 || lines > 0

  const baseRate = lines === 0 ? 5 : Math.min(30, funcs * 6 + lines)
  const structureBonus = Math.min(20, (classes + interfaces) * 6)
  const asyncBonus = Math.min(15, asyncs * 5)
  const exportBonus = Math.min(10, exports * 3)
  const importExportBonus = exports > 0 && imports > 0 ? 10 : 0
  const commentBonus = Math.min(10, Math.min(comments, 3) * 2)
  const smellPenalty = Math.min(20, (smells + todos) * 4)
  const rate = Math.max(0, Math.min(100, baseRate + structureBonus + asyncBonus + exportBonus + importExportBonus + commentBonus - smellPenalty))

  const isHealthyGrowth = rate >= 40 && rate <= 85
  const hasLinearGrowth = exports > 0 && imports > 0
  const hasExponentialGrowth = asyncs > 0 && exports > 3
  const hasLogisticGrowth = classes > 0 && interfaces > 0 && exports > 0
  const hasSeasonalGrowth = loops > 0 && conditionals > 0
  const hasCalcification = typeAnnotations > 0 && hasCode
  const hasExtension = exports > 0 && funcs > 0
  const hasDensityBanding = comments > 0 && hasCode
  const hasBioerosion = todos > 0
  const hasRecruitment = exports > 0 && imports > 0 && comments > 0
  const growthScore = rate

  let pattern: GrowthMeasure['pattern']
  if (rate >= 70 && hasExponentialGrowth) pattern = 'branching'
  else if (rate >= 55 && classes > 0) pattern = 'massive'
  else if (rate >= 40 && exports > 0) pattern = 'encrusting'
  else if (rate >= 25 && hasCode) pattern = 'foliose'
  else if (rate >= 15) pattern = 'digitate'
  else pattern = 'stunted'

  return {
    rate,
    pattern,
    isHealthyGrowth,
    hasLinearGrowth,
    hasExponentialGrowth,
    hasLogisticGrowth,
    hasSeasonalGrowth,
    hasCalcification,
    hasExtension,
    hasDensityBanding,
    hasBioerosion,
    hasRecruitment,
    growthScore,
  }
}

// ─── Measure Environment ───────────────────────────────────────────────────

/** @example measureEnvironment('export function clean(): string { return "pure"; }') returns EnvironmentMeasure */
export function measureEnvironment(content: string): EnvironmentMeasure {
  const lines = countNonEmptyLines(content)
  const emptyLines = countEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const tests = countMatches(content, TEST_REGEX)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const hasCode = funcs > 0 || lines > 0

  const baseQuality = lines === 0 ? 5 : Math.min(30, lines + Math.min(15, funcs * 4))
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const errorBonus = Math.min(10, errorHandling * 3)
  const testBonus = Math.min(10, tests * 2)
  const commentBonus = Math.min(5, Math.min(comments, 2) * 2)
  const smellPenalty = Math.min(20, smells * 5)
  const todoPenalty = Math.min(15, (todos + deprecated) * 5)
  const quality = Math.max(0, Math.min(100, baseQuality + typeBonus + errorBonus + testBonus + commentBonus - smellPenalty - todoPenalty))

  const hasClearWater = smells === 0
  const hasProperSalinity = exports > 0 && imports <= exports + 3
  const hasGoodCirculation = exports > 0 && imports > 0
  const hasNoPollution = smells === 0 && todos === 0
  const hasNoSedimentation = deprecated === 0 && todos === 0
  const hasNoAcidification = todos === 0
  const hasUVProtection = tests > 0
  const hasNutrientUpwelling = comments > 0 && typeAnnotations > 0
  const hasTidalExchange = exports > 0 && imports > 0 && hasCode
  const hasStormProtection = errorHandling > 0
  const pollutionCount = smells + todos + deprecated

  let temperature: EnvironmentMeasure['temperature']
  if (quality >= 75 && hasNoPollution) temperature = 'optimal'
  else if (quality >= 60) temperature = 'warm'
  else if (quality >= 45) temperature = 'hot'
  else if (quality >= 30) temperature = 'cool'
  else if (quality >= 15) temperature = 'cold'
  else temperature = 'freezing'

  return {
    quality,
    temperature,
    hasClearWater,
    hasProperSalinity,
    hasGoodCirculation,
    hasNoPollution,
    hasNoSedimentation,
    hasNoAcidification,
    hasUVProtection,
    hasNutrientUpwelling,
    hasTidalExchange,
    hasStormProtection,
    pollutionCount,
  }
}

// ─── Classify Condition ────────────────────────────────────────────────────

/** @example classifyCondition(85) returns 'thriving-reef' */
export function classifyCondition(score: number): CoralSpecimen['condition'] {
  if (score >= 80) return 'thriving-reef'
  if (score >= 65) return 'healthy-garden'
  if (score >= 50) return 'recovering-coral'
  if (score >= 35) return 'stressed-reef'
  if (score >= 20) return 'bleaching-event'
  return 'dead-skeleton'
}

// ─── Analyze Specimen ──────────────────────────────────────────────────────

/** @example analyzeCoralSpecimen('export function foo(): void {}', 'coral.ts') returns CoralSpecimen */
export function analyzeCoralSpecimen(content: string, filePath: string): CoralSpecimen {
  const coral = measureCoral(content)
  const polyp = measurePolyp(content)
  const diversity = measureDiversity(content)
  const symbiosis = measureSymbiosis(content)
  const growth = measureGrowth(content)
  const environment = measureEnvironment(content)

  const coralHealth = coral.health
  const polypActivity = polyp.activity
  const reefDiversity = diversity.score
  const symbioticNetwork = symbiosis.network
  const growthRate = growth.rate
  const waterQuality = environment.quality

  const qualityScore = Math.round(
    (coralHealth + polypActivity + reefDiversity + symbioticNetwork + growthRate + waterQuality) / 6,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    coralHealth,
    polypActivity,
    reefDiversity,
    symbioticNetwork,
    growthRate,
    waterQuality,
    coral,
    polyp,
    diversity,
    symbiosis,
    growth,
    environment,
    condition,
    qualityScore,
  }
}

// ─── Classify Bed Type ─────────────────────────────────────────────────────

/** @example classifyBedType(specimens) returns 'barrier-reef' */
export function classifyBedType(specimens: CoralSpecimen[]): CoralBed['bedType'] {
  if (specimens.length === 0) return 'sand-flat'
  const avgScore = Math.round(specimens.reduce((s, r) => s + r.qualityScore, 0) / specimens.length)
  const thrivingCount = specimens.filter((s) => s.condition === 'thriving-reef').length
  const ratio = thrivingCount / specimens.length

  if (avgScore >= 75 && ratio >= 0.5) return 'barrier-reef'
  if (avgScore >= 60) return 'atoll'
  if (avgScore >= 45) return 'fringing-reef'
  if (avgScore >= 30) return 'patch-reef'
  if (avgScore >= 15) return 'rocky-shore'
  return 'sand-flat'
}

/** @example classifyBedCondition(70) returns 'national-park' */
export function classifyBedCondition(avgScore: number): CoralBed['condition'] {
  if (avgScore >= 80) return 'marine-sanctuary'
  if (avgScore >= 65) return 'national-park'
  if (avgScore >= 50) return 'protected-area'
  if (avgScore >= 35) return 'stressed-zone'
  if (avgScore >= 20) return 'bleaching-zone'
  return 'dead-zone'
}

// ─── Classify Marine Grade ─────────────────────────────────────────────────

/** @example classifyMarineGrade(85) returns 'marine-biologist' */
export function classifyMarineGrade(avgHealth: number): CoralStats['marineGrade'] {
  if (avgHealth >= 80) return 'marine-biologist'
  if (avgHealth >= 65) return 'reef-scientist'
  if (avgHealth >= 50) return 'oceanographer'
  if (avgHealth >= 35) return 'diver'
  if (avgHealth >= 20) return 'snorkeler'
  return 'beachgoer'
}

// ─── Analyze Coral Bed ─────────────────────────────────────────────────────

/** @example analyzeCoralBed(specimens, 'src') returns CoralBed */
export function analyzeCoralBed(specimens: CoralSpecimen[], dirPath: string): CoralBed {
  const count = specimens.length
  const avgHealth = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.coralHealth, 0) / count) : 0
  const avgDiversity = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.reefDiversity, 0) / count) : 0
  const avgSymbiosis = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.symbioticNetwork, 0) / count) : 0

  const thrivingCount = specimens.filter((s) => s.condition === 'thriving-reef').length
  const deadCount = specimens.filter((s) => s.condition === 'dead-skeleton').length
  const mutualismCount = specimens.filter((s) => s.symbiosis.hasMutualBenefit).length
  const activePolypCount = specimens.filter((s) => s.polyp.isActive).length

  const bedType = classifyBedType(specimens)
  const avgScore = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.qualityScore, 0) / count) : 0
  const condition = classifyBedCondition(avgScore)

  return {
    directory: dirPath,
    specimens,
    avgHealth,
    avgDiversity,
    avgSymbiosis,
    thrivingCount,
    deadCount,
    mutualismCount,
    activePolypCount,
    bedType,
    condition,
  }
}

// ─── Generate Recommendations ──────────────────────────────────────────────

/** @example generateRecommendations(specimens, beds, garden, stats) returns string[] */
export function generateRecommendations(
  specimens: CoralSpecimen[],
  _beds: CoralBed[],
  _garden: CoralGarden,
  _stats: CoralStats,
): string[] {
  const recommendations: string[] = []

  const hasDead = specimens.some((s) => s.condition === 'dead-skeleton')
  if (hasDead) {
    recommendations.push('Revive dead coral skeletons — add exports, functions, and type annotations to empty files')
  }

  const hasBleaching = specimens.some((s) => s.coral.hasNoBleaching === false)
  if (hasBleaching) {
    recommendations.push('Stop coral bleaching — improve code health with better structure and error handling')
  }

  const hasDisease = specimens.some((s) => s.coral.diseaseCount > 0)
  if (hasDisease) {
    recommendations.push('Cure coral diseases — remove console calls, any types, TODOs, and deprecated markers')
  }

  const hasParasitic = specimens.some((s) => s.symbiosis.hasParasiticSponge)
  if (hasParasitic) {
    recommendations.push('Remove parasitic sponges — eliminate deprecated code harming symbiotic network')
  }

  const hasCrownOfThorns = specimens.some((s) => s.symbiosis.hasCrownOfThorns)
  if (hasCrownOfThorns) {
    recommendations.push('Remove crown-of-thorns — clean up code smells and deprecated code combinations')
  }

  const hasPollution = specimens.some((s) => s.environment.pollutionCount > 0)
  if (hasPollution) {
    recommendations.push('Clean water pollution — remove smells, TODOs, and deprecated markers')
  }

  const hasBioerosion = specimens.some((s) => s.symbiosis.hasBioerosion)
  if (hasBioerosion) {
    recommendations.push('Stop bioerosion — resolve TODOs that erode codebase quality')
  }

  const hasStunted = specimens.some((s) => s.growth.pattern === 'stunted')
  if (hasStunted) {
    recommendations.push('Encourage growth — add classes, async patterns, and exports to stunted files')
  }

  if (recommendations.length === 0) {
    recommendations.push('The coral garden is a thriving marine sanctuary — vibrant biodiversity achieved')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildCoralGardenResult(['a.ts'], ['export function foo(): void {}']) returns CoralGardenResult */
export function buildCoralGardenResult(
  files: string[],
  contents: string[],
  options?: { ignore?: string[]; ext?: string[] },
): CoralGardenResult {
  const _opts = options ?? {}

  const specimens: CoralSpecimen[] = files.map((file, i) =>
    analyzeCoralSpecimen(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CoralSpecimen[]>()
  for (const spec of specimens) {
    const dir = spec.file.includes('/') ? spec.file.substring(0, spec.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(spec)
    } else {
      dirMap.set(dir, [spec])
    }
  }

  const beds: CoralBed[] = Array.from(dirMap.entries()).map(
    ([dir, dirSpecs]) => analyzeCoralBed(dirSpecs, dir),
  )

  const count = specimens.length
  const avgCoralHealth = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.coralHealth, 0) / count) : 0
  const avgPolypActivity = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.polypActivity, 0) / count) : 0
  const avgReefDiversity = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.reefDiversity, 0) / count) : 0
  const avgSymbioticNetwork = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.symbioticNetwork, 0) / count) : 0
  const avgGrowthRate = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.growthRate, 0) / count) : 0
  const avgWaterQuality = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.waterQuality, 0) / count) : 0
  const overallHealth = count > 0 ? Math.round(specimens.reduce((s, r) => s + r.qualityScore, 0) / count) : 0

  const garden: CoralGarden = {
    avgHealth: avgCoralHealth,
    avgDiversity: avgReefDiversity,
    avgSymbiosis: avgSymbioticNetwork,
    isThriving: overallHealth >= 70,
    overallHealth,
  }

  const stats: CoralStats = {
    totalFiles: count,
    totalBeds: beds.length,
    avgCoralHealth,
    avgPolypActivity,
    avgReefDiversity,
    avgSymbioticNetwork,
    avgGrowthRate,
    avgWaterQuality,
    thrivingReefCount: specimens.filter((s) => s.condition === 'thriving-reef').length,
    healthyGardenCount: specimens.filter((s) => s.condition === 'healthy-garden').length,
    recoveringCoralCount: specimens.filter((s) => s.condition === 'recovering-coral').length,
    stressedReefCount: specimens.filter((s) => s.condition === 'stressed-reef').length,
    bleachingEventCount: specimens.filter((s) => s.condition === 'bleaching-event').length,
    deadSkeletonCount: specimens.filter((s) => s.condition === 'dead-skeleton').length,
    isHealthyCount: specimens.filter((s) => s.coral.isHealthy).length,
    hasVibrantColorCount: specimens.filter((s) => s.coral.hasVibrantColor).length,
    hasRegenerationCount: specimens.filter((s) => s.coral.hasRegeneration).length,
    isActiveCount: specimens.filter((s) => s.polyp.isActive).length,
    hasHighRichnessCount: specimens.filter((s) => s.diversity.hasHighRichness).length,
    hasNoMonocultureCount: specimens.filter((s) => s.diversity.hasNoMonoculture).length,
    hasMutualBenefitCount: specimens.filter((s) => s.symbiosis.hasMutualBenefit).length,
    hasParasiticSpongeCount: specimens.filter((s) => s.symbiosis.hasParasiticSponge).length,
    isHealthyGrowthCount: specimens.filter((s) => s.growth.isHealthyGrowth).length,
    hasClearWaterCount: specimens.filter((s) => s.environment.hasClearWater).length,
    hasNoPollutionCount: specimens.filter((s) => s.environment.hasNoPollution).length,
    overallHealth,
    marineGrade: classifyMarineGrade(overallHealth),
    bestSpecimen: count > 0
      ? specimens.reduce((best, s) => s.qualityScore > best.qualityScore ? s : best).file
      : '',
    healthiestCoral: count > 0
      ? specimens.reduce((best, s) => s.coralHealth > best.coralHealth ? s : best).file
      : '',
    mostActive: count > 0
      ? specimens.reduce((best, s) => s.polypActivity > best.polypActivity ? s : best).file
      : '',
    mostDiverse: count > 0
      ? specimens.reduce((best, s) => s.reefDiversity > best.reefDiversity ? s : best).file
      : '',
    bestSymbiosis: count > 0
      ? specimens.reduce((best, s) => s.symbioticNetwork > best.symbioticNetwork ? s : best).file
      : '',
  }

  const recommendations = generateRecommendations(specimens, beds, garden, stats)

  return { specimens, beds, garden, stats, recommendations }
}
