// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const ASYNC_REGEX = /\basync\s+/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const PROMISE_REGEX = /\bPromise\b/g
const STRING_TEMPLATE_REGEX = /`[^`]*\$\{/g
const DESTRUCTURE_REGEX = /\{[^}]*\}\s*=/g

// ─── Helper Functions ───────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number { return countMatches(content, IMPORT_REGEX) }
function countExportKeywords(content: string): number { return countMatches(content, EXPORT_REGEX) }
function countClassKeywords(content: string): number { return countMatches(content, CLASS_REGEX) }
function countInterfaceKeywords(content: string): number { return countMatches(content, INTERFACE_REGEX) }
function countTypeKeywords(content: string): number { return countMatches(content, TYPE_REGEX) }
function countEnumKeywords(content: string): number { return countMatches(content, ENUM_REGEX) }
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countStaticMembers(content: string): number { return countMatches(content, STATIC_REGEX) }
function countReadonlyMembers(content: string): number { return countMatches(content, READONLY_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function countConditionals(content: string): number { return countMatches(content, CONDITIONAL_REGEX) }
function countLoops(content: string): number { return countMatches(content, LOOP_REGEX) }
function countPromiseUsage(content: string): number { return countMatches(content, PROMISE_REGEX) }
function countTemplateLiterals(content: string): number { return countMatches(content, STRING_TEMPLATE_REGEX) }
function countDestructures(content: string): number { return countMatches(content, DESTRUCTURE_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ResilienceMeasure {
  level: number
  adaptation: 'barnacle' | 'anemone' | 'starfish' | 'crab' | 'jellyfish' | 'beached'
  hasHighResilience: boolean
  hasTidalAdaptation: boolean
  hasDesiccationResistance: boolean
  hasWaveResistance: boolean
  hasTemperatureTolerance: boolean
  hasSalinityAdaptation: boolean
  hasNoSensitivity: boolean
  hasProperAttachment: boolean
  hasNoDisplacement: boolean
  hasRecoveryCapacity: boolean
  sensitivityCount: number
  displacementCount: number
}

export interface DiversityMeasure {
  level: number
  richness: 'coral-reef' | 'kelp-beds' | 'rocky-shore' | 'sandy-bottom' | 'mud-flat' | 'barren'
  hasHighDiversity: boolean
  hasFunctionalDiversity: boolean
  hasPatternVariety: boolean
  hasSpeciesRichness: boolean
  hasNoMonoculture: boolean
  hasEcologicalNiche: boolean
  hasSymbiosis: boolean
  hasNoInvasiveSpecies: boolean
  hasKeystonePatterns: boolean
  hasNoDominance: boolean
  monocultureCount: number
  invasiveCount: number
}

export interface RetentionMeasure {
  level: number
  capacity: 'deep-pool' | 'basin' | 'depression' | 'saucer' | 'seep' | 'dry'
  hasGoodRetention: boolean
  hasProperStorage: boolean
  hasNoLeakage: boolean
  hasProperCirculation: boolean
  hasTidalExchange: boolean
  hasNoEvaporation: boolean
  hasProperFiltration: boolean
  hasNoContamination: boolean
  hasBufferCapacity: boolean
  hasNoOverflow: boolean
  leakageCount: number
  overflowCount: number
}

export interface SubstrateMeasure {
  stability: number
  type: 'bedrock' | 'boulder' | 'cobble' | 'gravel' | 'sand' | 'quicksand'
  isStable: boolean
  hasSolidBase: boolean
  hasNoErosion: boolean
  hasProperDrainage: boolean
  hasNoUndermining: boolean
  hasAnchorage: boolean
  hasNoShifting: boolean
  hasProperContour: boolean
  hasNoCollapse: boolean
  hasLoadBearing: boolean
  erosionCount: number
  shiftingCount: number
}

export interface NutrientMeasure {
  cycling: number
  flow: 'upwelling' | 'current' | 'tidal' | 'diffusion' | 'stagnant' | 'absent'
  hasProperCycling: boolean
  hasInputProcessing: boolean
  hasOutputGeneration: boolean
  hasNoAccumulation: boolean
  hasProperDecomposition: boolean
  hasEnergyTransfer: boolean
  hasNoBlockage: boolean
  hasProperTransformation: boolean
  hasRecycling: boolean
  hasNoDepletion: boolean
  accumulationCount: number
  blockageCount: number
}

export interface HealthMeasure {
  score: number
  status: 'thriving' | 'healthy' | 'stressed' | 'declining' | 'hypoxic' | 'dead'
  isHealthy: boolean
  hasGoodWaterQuality: boolean
  hasProperOxygenation: boolean
  hasNoPollution: boolean
  hasNoEutrophication: boolean
  hasBiodiversity: boolean
  hasResilience: boolean
  hasNoAcidification: boolean
  hasProperBalance: boolean
  hasNoDieoff: boolean
  pollutionCount: number
  dieoffCount: number
}

export interface TidePoolOrganism {
  file: string
  tidalResilience: number
  organismDiversity: number
  waterRetention: number
  substrateStability: number
  nutrientCycling: number
  poolHealth: number
  resilience: ResilienceMeasure
  diversity: DiversityMeasure
  retention: RetentionMeasure
  substrate: SubstrateMeasure
  nutrient: NutrientMeasure
  health: HealthMeasure
  condition: 'pristine-pool' | 'healthy-tide' | 'thriving-ecosystem' | 'stressed-habitat' | 'degraded-pool' | 'dead-zone'
  qualityScore: number
}

export interface PoolCluster {
  directory: string
  organisms: TidePoolOrganism[]
  avgResilience: number
  avgDiversity: number
  avgHealth: number
  pristineCount: number
  deadCount: number
  resilientCount: number
  healthyCount: number
  clusterType: 'marine-sanctuary' | 'tidal-zone' | 'rocky-shore' | 'sandy-beach' | 'mud-flat' | 'drainage-ditch'
  condition: 'national-park' | 'marine-reserve' | 'conservation' | 'recreational' | 'degraded' | 'industrial'
}

export interface TidePoolResult {
  organisms: TidePoolOrganism[]
  clusters: PoolCluster[]
  coastline: {
    avgResilience: number
    avgDiversity: number
    avgHealth: number
    isThriving: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgTidalResilience: number
    avgOrganismDiversity: number
    avgWaterRetention: number
    avgSubstrateStability: number
    avgNutrientCycling: number
    avgPoolHealth: number
    pristinePoolCount: number
    healthyTideCount: number
    thrivingEcosystemCount: number
    stressedHabitatCount: number
    degradedPoolCount: number
    deadZoneCount: number
    hasHighResilienceCount: number
    hasHighDiversityCount: number
    hasGoodRetentionCount: number
    isStableCount: number
    hasProperCyclingCount: number
    isHealthyCount: number
    overallHealth: number
    marineBiologistGrade: 'chief-scientist' | 'marine-biologist' | 'ecologist' | 'naturalist' | 'beachcomber' | 'tourist'
    bestOrganism: string
    mostResilient: string
    mostDiverse: string
    bestRetention: string
    mostStable: string
    healthiest: string
  }
  recommendations: string[]
}

// ─── Resilience Measurement ─────────────────────────────────────────────────

/** @example measureResilience(content) returns resilience analysis */
export function measureResilience(content: string): ResilienceMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const asyncCount = countAsyncKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)
  const tryCatchCount = countTryCatch(content)
  const promiseCount = countPromiseUsage(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 25
  if (hasStructure) level += 15
  if (hasTypes) level += 15
  if (hasFunctions) level += 10
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (jsdocCount > 0) level += 8
  if (asyncCount > 0) level += 5
  if (consoleCount === 0) level += 4
  if (anyCount === 0) level += 4
  if (todoCount === 0) level += 4
  level = Math.min(100, Math.max(0, Math.round(level)))

  const sensitivityCount = todoCount + commentedCodeCount
  const displacementCount = deepNestedCount + consoleCount

  const hasHighResilience = level >= 80 && hasStructure && hasTypes
  const hasTidalAdaptation = hasStructure && hasTypes && hasFunctions
  const hasDesiccationResistance = hasStructure && hasTypes && exportCount > 0
  const hasWaveResistance = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasTemperatureTolerance = hasStructure && hasTypes && anyCount === 0
  const hasSalinityAdaptation = hasStructure && hasTypes && exportCount > 0 && importCount > 0
  const hasNoSensitivity = sensitivityCount === 0
  const hasProperAttachment = hasStructure && hasTypes && hasFunctions
  const hasNoDisplacement = displacementCount === 0
  const hasRecoveryCapacity = tryCatchCount > 0 || promiseCount > 0

  let adaptation: ResilienceMeasure['adaptation'] = 'beached'
  if (hasHighResilience && hasNoSensitivity && hasNoDisplacement && hasRecoveryCapacity) adaptation = 'barnacle'
  else if (hasHighResilience && hasNoSensitivity) adaptation = 'anemone'
  else if (hasHighResilience) adaptation = 'starfish'
  else if (hasTidalAdaptation) adaptation = 'crab'
  else if (level > 30) adaptation = 'jellyfish'

  return {
    level,
    adaptation,
    hasHighResilience,
    hasTidalAdaptation,
    hasDesiccationResistance,
    hasWaveResistance,
    hasTemperatureTolerance,
    hasSalinityAdaptation,
    hasNoSensitivity,
    hasProperAttachment,
    hasNoDisplacement,
    hasRecoveryCapacity,
    sensitivityCount,
    displacementCount,
  }
}

// ─── Diversity Measurement ──────────────────────────────────────────────────

/** @example measureDiversity(content) returns diversity analysis */
export function measureDiversity(content: string): DiversityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const asyncCount = countAsyncKeywords(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const reExportCount = countReExports(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (enumCount > 0) level += 5
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (readonlyCount > 0) level += 3
  if (privateCount > 0 || protectedCount > 0) level += 3
  if (staticCount > 0) level += 2
  if (asyncCount > 0) level += 3
  if (reExportCount > 0) level += 3
  if (anyCount === 0) level += 2
  if (consoleCount === 0) level += 2
  level = Math.min(100, Math.max(0, Math.round(level)))

  const monocultureCount = anyCount + consoleCount
  const invasiveCount = todoCount

  const hasHighDiversity = level >= 80 && hasStructure && hasTypes
  const hasFunctionalDiversity = hasStructure && hasTypes && hasFunctions
  const hasPatternVariety = genericsCount > 0 && (privateCount > 0 || protectedCount > 0)
  const hasSpeciesRichness = hasStructure && hasTypes && enumCount > 0
  const hasNoMonoculture = monocultureCount === 0
  const hasEcologicalNiche = hasStructure && hasTypes && genericsCount > 0
  const hasSymbiosis = hasStructure && hasTypes && exportCount > 0
  const hasNoInvasiveSpecies = invasiveCount === 0
  const hasKeystonePatterns = hasStructure && hasTypes && jsdocCount > 0
  const hasNoDominance = hasStructure && hasTypes && hasFunctions && deepNestedCount(content) === 0

  let richness: DiversityMeasure['richness'] = 'barren'
  if (hasHighDiversity && hasPatternVariety && hasNoMonoculture && hasNoInvasiveSpecies) richness = 'coral-reef'
  else if (hasHighDiversity && hasPatternVariety) richness = 'kelp-beds'
  else if (hasHighDiversity) richness = 'rocky-shore'
  else if (hasFunctionalDiversity) richness = 'sandy-bottom'
  else if (level > 30) richness = 'mud-flat'

  return {
    level,
    richness,
    hasHighDiversity,
    hasFunctionalDiversity,
    hasPatternVariety,
    hasSpeciesRichness,
    hasNoMonoculture,
    hasEcologicalNiche,
    hasSymbiosis,
    hasNoInvasiveSpecies,
    hasKeystonePatterns,
    hasNoDominance,
    monocultureCount,
    invasiveCount,
  }
}

function deepNestedCount(content: string): number {
  return countMatches(content, DEEP_NESTED_REGEX)
}

// ─── Retention Measurement ──────────────────────────────────────────────────

/** @example measureRetention(content) returns retention analysis */
export function measureRetention(content: string): RetentionMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount2 = countDeepNested(content)
  const promiseCount = countPromiseUsage(content)
  const asyncCount = countAsyncKeywords(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (readonlyCount > 0) level += 3
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (asyncCount > 0) level += 5
  if (promiseCount > 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const leakageCount = anyCount + consoleCount
  const overflowCount = deepNestedCount2

  const hasGoodRetention = level >= 75 && hasStructure && hasTypes
  const hasProperStorage = hasStructure && hasTypes && hasFunctions
  const hasNoLeakage = leakageCount === 0
  const hasProperCirculation = hasFunctions && (asyncCount > 0 || promiseCount > 0)
  const hasTidalExchange = hasStructure && hasTypes && exportCount > 0
  const hasNoEvaporation = todoCount === 0
  const hasProperFiltration = hasStructure && hasTypes && anyCount === 0
  const hasNoContamination = consoleCount === 0 && anyCount === 0
  const hasBufferCapacity = hasStructure && hasTypes && readonlyCount > 0
  const hasNoOverflow = deepNestedCount2 === 0

  let capacity: RetentionMeasure['capacity'] = 'dry'
  if (hasGoodRetention && hasNoLeakage && hasNoOverflow) capacity = 'deep-pool'
  else if (hasGoodRetention && hasNoLeakage) capacity = 'basin'
  else if (hasGoodRetention) capacity = 'depression'
  else if (hasProperStorage) capacity = 'saucer'
  else if (level > 30) capacity = 'seep'

  return {
    level,
    capacity,
    hasGoodRetention,
    hasProperStorage,
    hasNoLeakage,
    hasProperCirculation,
    hasTidalExchange,
    hasNoEvaporation,
    hasProperFiltration,
    hasNoContamination,
    hasBufferCapacity,
    hasNoOverflow,
    leakageCount,
    overflowCount,
  }
}

// ─── Substrate Measurement ──────────────────────────────────────────────────

/** @example measureSubstrate(content) returns substrate analysis */
export function measureSubstrate(content: string): SubstrateMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const conditionalsCount = countConditionals(content)
  const loopsCount = countLoops(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount2 = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let stability = 25
  if (hasStructure) stability += 12
  if (hasTypes) stability += 12
  if (hasFunctions) stability += 10
  if (jsdocCount > 0) stability += 8
  if (genericsCount > 0) stability += 5
  if (exportCount > 0) stability += 5
  if (importCount > 0) stability += 5
  if (reExportCount > 0) stability += 5
  if (asyncCount > 0) stability += 3
  if (tryCatchCount > 0) stability += 5
  if (conditionalsCount > 0) stability += 3
  if (loopsCount > 0) stability += 2
  if (anyCount === 0) stability += 3
  if (consoleCount === 0) stability += 2
  stability = Math.min(100, Math.max(0, Math.round(stability)))

  const erosionCount = todoCount + deepNestedCount2
  const shiftingCount = anyCount + consoleCount

  const isStable = stability >= 75 && hasStructure && hasTypes
  const hasSolidBase = hasStructure && hasTypes
  const hasNoErosion = todoCount === 0
  const hasProperDrainage = hasStructure && hasTypes && exportCount > 0
  const hasNoUndermining = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasAnchorage = hasStructure && hasTypes && exportCount > 0
  const hasNoShifting = shiftingCount === 0
  const hasProperContour = hasStructure && hasTypes && hasFunctions
  const hasNoCollapse = deepNestedCount2 === 0
  const hasLoadBearing = hasStructure && hasTypes && hasFunctions && (asyncCount > 0 || tryCatchCount > 0)

  let substrateType: SubstrateMeasure['type'] = 'quicksand'
  if (isStable && hasNoUndermining && erosionCount === 0 && shiftingCount === 0) substrateType = 'bedrock'
  else if (isStable && hasNoUndermining) substrateType = 'boulder'
  else if (isStable) substrateType = 'cobble'
  else if (hasProperDrainage) substrateType = 'gravel'
  else if (stability > 30) substrateType = 'sand'

  return {
    stability,
    type: substrateType,
    isStable,
    hasSolidBase,
    hasNoErosion,
    hasProperDrainage,
    hasNoUndermining,
    hasAnchorage,
    hasNoShifting,
    hasProperContour,
    hasNoCollapse,
    hasLoadBearing,
    erosionCount,
    shiftingCount,
  }
}

// ─── Nutrient Measurement ───────────────────────────────────────────────────

/** @example measureNutrient(content) returns nutrient analysis */
export function measureNutrient(content: string): NutrientMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const deepNestedCount2 = countDeepNested(content)
  const destructures = countDestructures(content)
  const templateLiterals = countTemplateLiterals(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let cycling = 20
  if (hasStructure) cycling += 12
  if (hasTypes) cycling += 12
  if (hasFunctions) cycling += 10
  if (jsdocCount > 0) cycling += 5
  if (genericsCount > 0) cycling += 5
  if (asyncCount > 0) cycling += 5
  if (exportCount > 0) cycling += 5
  if (importCount > 0) cycling += 5
  if (reExportCount > 0) cycling += 5
  if (destructures > 0) cycling += 3
  if (templateLiterals > 0) cycling += 3
  if (anyCount === 0) cycling += 3
  if (consoleCount === 0) cycling += 4
  if (hasStructure && hasTypes) cycling += 3
  cycling = Math.min(100, Math.max(0, Math.round(cycling)))

  const accumulationCount = anyCount + consoleCount
  const blockageCount = deepNestedCount2

  const hasProperCycling = cycling >= 75 && hasStructure && hasTypes
  const hasInputProcessing = importCount > 0
  const hasOutputGeneration = exportCount > 0
  const hasNoAccumulation = accumulationCount === 0
  const hasProperDecomposition = hasStructure && hasTypes && hasFunctions
  const hasEnergyTransfer = hasFunctions && (asyncCount > 0 || reExportCount > 0)
  const hasNoBlockage = deepNestedCount2 === 0
  const hasProperTransformation = genericsCount > 0 && hasStructure && hasTypes
  const hasRecycling = reExportCount > 0 || (exportCount > 0 && importCount > 0)
  const hasNoDepletion = consoleCount === 0

  let flow: NutrientMeasure['flow'] = 'absent'
  if (hasProperCycling && hasNoAccumulation && hasNoBlockage && hasRecycling) flow = 'upwelling'
  else if (hasProperCycling && hasNoAccumulation) flow = 'current'
  else if (hasProperCycling) flow = 'tidal'
  else if (hasProperDecomposition) flow = 'diffusion'
  else if (cycling > 30) flow = 'stagnant'

  return {
    cycling,
    flow,
    hasProperCycling,
    hasInputProcessing,
    hasOutputGeneration,
    hasNoAccumulation,
    hasProperDecomposition,
    hasEnergyTransfer,
    hasNoBlockage,
    hasProperTransformation,
    hasRecycling,
    hasNoDepletion,
    accumulationCount,
    blockageCount,
  }
}

// ─── Health Measurement ─────────────────────────────────────────────────────

/** @example measureHealth(content) returns health analysis */
export function measureHealth(content: string): HealthMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount2 = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let score = 20
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (enumCount > 0) score += 5
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (asyncCount > 0) score += 5
  if (tryCatchCount > 0) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (privateCount > 0 || protectedCount > 0) score += 3
  if (staticCount > 0) score += 3
  if (readonlyCount > 0) score += 2
  if (anyCount === 0) score += 3
  if (consoleCount === 0) score += 2
  score = Math.min(100, Math.max(0, Math.round(score)))

  const pollutionCount = consoleCount + deepNestedCount2
  const dieoffCount = todoCount + commentedCodeCount

  const isHealthy = score >= 80 && anyCount === 0 && todoCount === 0
  const hasGoodWaterQuality = anyCount === 0 && consoleCount === 0
  const hasProperOxygenation = jsdocCount > 0 && exportCount > 0
  const hasNoPollution = pollutionCount === 0
  const hasNoEutrophication = deepNestedCount2 === 0
  const hasBiodiversity = hasStructure && hasTypes && genericsCount > 0
  const hasResilience = hasStructure && hasTypes && hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasNoAcidification = anyCount === 0
  const hasProperBalance = hasStructure && hasTypes && hasFunctions
  const hasNoDieoff = dieoffCount === 0

  let status: HealthMeasure['status'] = 'dead'
  if (isHealthy && hasBiodiversity && hasResilience && hasNoPollution) status = 'thriving'
  else if (isHealthy && hasBiodiversity) status = 'healthy'
  else if (isHealthy) status = 'stressed'
  else if (score >= 60 && hasStructure && hasTypes) status = 'declining'
  else if (score > 30) status = 'hypoxic'

  return {
    score,
    status,
    isHealthy,
    hasGoodWaterQuality,
    hasProperOxygenation,
    hasNoPollution,
    hasNoEutrophication,
    hasBiodiversity,
    hasResilience,
    hasNoAcidification,
    hasProperBalance,
    hasNoDieoff,
    pollutionCount,
    dieoffCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(organism) returns condition string */
export function classifyCondition(organism: TidePoolOrganism): TidePoolOrganism['condition'] {
  const { qualityScore } = organism
  if (qualityScore >= 80) return 'pristine-pool'
  if (qualityScore >= 65) return 'healthy-tide'
  if (qualityScore >= 50) return 'thriving-ecosystem'
  if (qualityScore >= 35) return 'stressed-habitat'
  if (qualityScore >= 20) return 'degraded-pool'
  return 'dead-zone'
}

// ─── Organism Analysis ──────────────────────────────────────────────────────

/** @example analyzeTidePoolOrganism(content, filePath) returns full organism */
export function analyzeTidePoolOrganism(content: string, filePath: string): TidePoolOrganism {
  const resilience = measureResilience(content)
  const diversity = measureDiversity(content)
  const retention = measureRetention(content)
  const substrate = measureSubstrate(content)
  const nutrient = measureNutrient(content)
  const health = measureHealth(content)

  const tidalResilience = resilience.level
  const organismDiversity = diversity.level
  const waterRetention = retention.level
  const substrateStability = substrate.stability
  const nutrientCycling = nutrient.cycling
  const poolHealth = health.score

  const qualityScore = Math.round(
    tidalResilience * 0.15 +
    organismDiversity * 0.15 +
    waterRetention * 0.15 +
    substrateStability * 0.2 +
    nutrientCycling * 0.15 +
    poolHealth * 0.2,
  )

  const organism: TidePoolOrganism = {
    file: filePath,
    tidalResilience,
    organismDiversity,
    waterRetention,
    substrateStability,
    nutrientCycling,
    poolHealth,
    resilience,
    diversity,
    retention,
    substrate,
    nutrient,
    health,
    condition: 'dead-zone',
    qualityScore,
  }

  organism.condition = classifyCondition(organism)

  return organism
}

// ─── Cluster Analysis ───────────────────────────────────────────────────────

/** @example analyzePoolCluster(organisms, dirPath) returns cluster */
export function analyzePoolCluster(organisms: TidePoolOrganism[], dirPath: string): PoolCluster {
  if (organisms.length === 0) {
    return {
      directory: dirPath,
      organisms: [],
      avgResilience: 0,
      avgDiversity: 0,
      avgHealth: 0,
      pristineCount: 0,
      deadCount: 0,
      resilientCount: 0,
      healthyCount: 0,
      clusterType: 'drainage-ditch',
      condition: 'industrial',
    }
  }

  const avgResilience = Math.round(organisms.reduce((s, o) => s + o.tidalResilience, 0) / organisms.length)
  const avgDiversity = Math.round(organisms.reduce((s, o) => s + o.organismDiversity, 0) / organisms.length)
  const avgHealth = Math.round(organisms.reduce((s, o) => s + o.poolHealth, 0) / organisms.length)

  const pristineCount = organisms.filter((o) => o.condition === 'pristine-pool').length
  const deadCount = organisms.filter((o) => o.condition === 'dead-zone').length
  const resilientCount = organisms.filter((o) => o.resilience.hasHighResilience).length
  const healthyCount = organisms.filter((o) => o.health.isHealthy).length

  const clusterType = classifyClusterType(organisms)
  const avgQuality = organisms.reduce((s, o) => s + o.qualityScore, 0) / organisms.length
  const condition = classifyClusterCondition(avgQuality)

  return {
    directory: dirPath,
    organisms,
    avgResilience,
    avgDiversity,
    avgHealth,
    pristineCount,
    deadCount,
    resilientCount,
    healthyCount,
    clusterType,
    condition,
  }
}

// ─── Cluster Classification ────────────────────────────────────────────────

/** @example classifyClusterType(organisms) returns cluster type */
export function classifyClusterType(organisms: TidePoolOrganism[]): PoolCluster['clusterType'] {
  if (organisms.length === 0) return 'drainage-ditch'
  const avgQuality = organisms.reduce((s, o) => s + o.qualityScore, 0) / organisms.length
  const pristineCnt = organisms.filter((o) => o.condition === 'pristine-pool').length
  if (avgQuality >= 75 && pristineCnt >= Math.ceil(organisms.length * 0.3)) return 'marine-sanctuary'
  if (avgQuality >= 60) return 'tidal-zone'
  if (avgQuality >= 45) return 'rocky-shore'
  if (avgQuality >= 30) return 'sandy-beach'
  if (avgQuality >= 15) return 'mud-flat'
  return 'drainage-ditch'
}

/** @example classifyClusterCondition(avgQuality) returns condition */
export function classifyClusterCondition(avgQuality: number): PoolCluster['condition'] {
  if (avgQuality >= 80) return 'national-park'
  if (avgQuality >= 65) return 'marine-reserve'
  if (avgQuality >= 50) return 'conservation'
  if (avgQuality >= 35) return 'recreational'
  if (avgQuality >= 20) return 'degraded'
  return 'industrial'
}

/** @example classifyMarineBiologistGrade(avgHealth) returns grade */
export function classifyMarineBiologistGrade(avgHealth: number): TidePoolResult['stats']['marineBiologistGrade'] {
  if (avgHealth >= 80) return 'chief-scientist'
  if (avgHealth >= 65) return 'marine-biologist'
  if (avgHealth >= 50) return 'ecologist'
  if (avgHealth >= 35) return 'naturalist'
  if (avgHealth >= 20) return 'beachcomber'
  return 'tourist'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(organisms, clusters, coastline, stats) returns recommendations */
export function generateRecommendations(
  organisms: TidePoolOrganism[],
  clusters: PoolCluster[],
  coastline: TidePoolResult['coastline'],
  stats: TidePoolResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgTidalResilience < 50) {
    recs.push('Improve tidal resilience — strengthen code against changing conditions')
  }
  if (stats.avgOrganismDiversity < 50) {
    recs.push('Increase organism diversity — add more varied code patterns')
  }
  if (stats.avgWaterRetention < 50) {
    recs.push('Improve water retention — enhance data management practices')
  }
  if (stats.avgSubstrateStability < 50) {
    recs.push('Stabilize substrate — strengthen code foundation')
  }
  if (stats.avgNutrientCycling < 50) {
    recs.push('Improve nutrient cycling — optimize code flow and data movement')
  }
  if (stats.avgPoolHealth < 50) {
    recs.push('Improve pool health — reduce technical debt and improve quality')
  }
  if (stats.deadZoneCount > organisms.length * 0.5) {
    recs.push('Too many dead zones — over half the codebase is poor quality')
  }
  if (stats.isHealthyCount === 0) {
    recs.push('No healthy organisms found — strive for higher code quality')
  }
  if (clusters.length > 0 && coastline.overallHealth < 60) {
    recs.push('Overall ecosystem health is low — systematic improvement recommended')
  }
  if (recs.length === 0) {
    recs.push('Pristine tide pool — your code teems with resilient, diverse life')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildTidePoolResult(files, contents, options) returns full result */
export function buildTidePoolResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): TidePoolResult {
  const organisms: TidePoolOrganism[] = files.map((file, i) =>
    analyzeTidePoolOrganism(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TidePoolOrganism[]>()
  for (const organism of organisms) {
    const dir = organism.file.includes('/')
      ? organism.file.substring(0, organism.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(organism)
    } else {
      dirMap.set(dir, [organism])
    }
  }

  const clusters: PoolCluster[] = Array.from(dirMap.entries()).map(([dir, dirOrganisms]) =>
    analyzePoolCluster(dirOrganisms, dir),
  )

  const avgResilience = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.tidalResilience, 0) / organisms.length)
    : 0
  const avgDiversity = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.organismDiversity, 0) / organisms.length)
    : 0
  const avgHealth = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.poolHealth, 0) / organisms.length)
    : 0
  const overallHealth = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.qualityScore, 0) / organisms.length)
    : 0
  const isThriving = overallHealth >= 65

  const coastline: TidePoolResult['coastline'] = {
    avgResilience,
    avgDiversity,
    avgHealth,
    isThriving,
    overallHealth,
  }

  const avgTidalResilience = avgResilience
  const avgOrganismDiversity = avgDiversity
  const avgWaterRetention = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.waterRetention, 0) / organisms.length)
    : 0
  const avgSubstrateStability = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.substrateStability, 0) / organisms.length)
    : 0
  const avgNutrientCycling = organisms.length > 0
    ? Math.round(organisms.reduce((s, o) => s + o.nutrientCycling, 0) / organisms.length)
    : 0
  const avgPoolHealth = avgHealth

  const conditionCounts = {
    pristine: 0,
    healthy: 0,
    thriving: 0,
    stressed: 0,
    degraded: 0,
    dead: 0,
  }
  for (const o of organisms) {
    switch (o.condition) {
      case 'pristine-pool': conditionCounts.pristine++; break
      case 'healthy-tide': conditionCounts.healthy++; break
      case 'thriving-ecosystem': conditionCounts.thriving++; break
      case 'stressed-habitat': conditionCounts.stressed++; break
      case 'degraded-pool': conditionCounts.degraded++; break
      case 'dead-zone': conditionCounts.dead++; break
    }
  }

  const hasHighResilienceCount = organisms.filter((o) => o.resilience.hasHighResilience).length
  const hasHighDiversityCount = organisms.filter((o) => o.diversity.hasHighDiversity).length
  const hasGoodRetentionCount = organisms.filter((o) => o.retention.hasGoodRetention).length
  const isStableCount = organisms.filter((o) => o.substrate.isStable).length
  const hasProperCyclingCount = organisms.filter((o) => o.nutrient.hasProperCycling).length
  const isHealthyCount = organisms.filter((o) => o.health.isHealthy).length

  const bestOrganism = organisms.length > 0
    ? organisms.reduce((best, o) => o.qualityScore > best.qualityScore ? o : best).file
    : ''
  const mostResilient = organisms.length > 0
    ? organisms.reduce((best, o) => o.tidalResilience > best.tidalResilience ? o : best).file
    : ''
  const mostDiverse = organisms.length > 0
    ? organisms.reduce((best, o) => o.organismDiversity > best.organismDiversity ? o : best).file
    : ''
  const bestRetention = organisms.length > 0
    ? organisms.reduce((best, o) => o.waterRetention > best.waterRetention ? o : best).file
    : ''
  const mostStable = organisms.length > 0
    ? organisms.reduce((best, o) => o.substrateStability > best.substrateStability ? o : best).file
    : ''
  const healthiest = organisms.length > 0
    ? organisms.reduce((best, o) => o.poolHealth > best.poolHealth ? o : best).file
    : ''

  const marineBiologistGrade = classifyMarineBiologistGrade(overallHealth)

  const stats: TidePoolResult['stats'] = {
    totalFiles: files.length,
    totalClusters: clusters.length,
    avgTidalResilience,
    avgOrganismDiversity,
    avgWaterRetention,
    avgSubstrateStability,
    avgNutrientCycling,
    avgPoolHealth,
    pristinePoolCount: conditionCounts.pristine,
    healthyTideCount: conditionCounts.healthy,
    thrivingEcosystemCount: conditionCounts.thriving,
    stressedHabitatCount: conditionCounts.stressed,
    degradedPoolCount: conditionCounts.degraded,
    deadZoneCount: conditionCounts.dead,
    hasHighResilienceCount,
    hasHighDiversityCount,
    hasGoodRetentionCount,
    isStableCount,
    hasProperCyclingCount,
    isHealthyCount,
    overallHealth,
    marineBiologistGrade,
    bestOrganism,
    mostResilient,
    mostDiverse,
    bestRetention,
    mostStable,
    healthiest,
  }

  const recommendations = generateRecommendations(organisms, clusters, coastline, stats)

  return {
    organisms,
    clusters,
    coastline,
    stats,
    recommendations,
  }
}
