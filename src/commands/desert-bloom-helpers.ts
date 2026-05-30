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
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g

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
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface DroughtMeasure {
  tolerance: number
  strategy: 'succulent' | 'deep-root' | 'ephemeral' | 'dormant' | 'wilted' | 'dead'
  hasHighTolerance: boolean
  hasWaterConservation: boolean
  hasNoWastefulGrowth: boolean
  hasEfficientMetabolism: boolean
  hasCrassulacean: boolean
  hasNoTranspiration: boolean
  hasProperStomata: boolean
  hasNoOverconsumption: boolean
  hasXerophytic: boolean
  hasNoBloat: boolean
  transpirationCount: number
  bloatCount: number
}

export interface HeatMeasure {
  resistance: number
  tolerance: 'extremophile' | 'thermophile' | 'mesophile' | 'sensitive' | 'wilting' | 'scorched'
  hasHighResistance: boolean
  hasSunscreen: boolean
  hasHeatDissipation: boolean
  hasNoThermalShock: boolean
  hasReflectiveSurface: boolean
  hasNoSunScald: boolean
  hasProperInsulation: boolean
  hasNoHeatStress: boolean
  hasShade: boolean
  hasNoDehydration: boolean
  thermalShockCount: number
  heatStressCount: number
}

export interface StorageMeasure {
  capacity: number
  type: 'cistern' | 'aquifer' | 'succulent' | 'tuber' | 'seed-coat' | 'evaporated'
  hasHighEfficiency: boolean
  hasProperCaching: boolean
  hasNoLeakage: boolean
  hasEfficientRetrieval: boolean
  hasNoEvaporation: boolean
  hasProperCapacity: boolean
  hasNoOverflow: boolean
  hasCompression: boolean
  hasQuickRelease: boolean
  hasNoStagnation: boolean
  leakageCount: number
  stagnationCount: number
}

export interface BloomMeasure {
  quality: number
  rarity: 'superbloom' | 'rare-bloom' | 'seasonal' | 'occasional' | 'rare' | 'never-blooms'
  hasSpectacularBloom: boolean
  hasVibrantDisplay: boolean
  hasProperTiming: boolean
  hasNoMisTiming: boolean
  hasAttracts: boolean
  hasProperDuration: boolean
  hasNoWastedBloom: boolean
  hasFragrance: boolean
  hasProperScale: boolean
  hasNoFalseBloom: boolean
  misTimingCount: number
  falseBloomCount: number
}

export interface SeedMeasure {
  vitality: number
  bank: 'deep-bank' | 'surface-bank' | 'canopy-bank' | 'soil-bank' | 'scatter' | 'barren'
  hasHighVitality: boolean
  hasLongevity: boolean
  hasProperDormancy: boolean
  hasNoPrematureGermination: boolean
  hasProperDispersal: boolean
  hasGerminationTrigger: boolean
  hasNoSeedPredation: boolean
  hasProperCoating: boolean
  hasNoMold: boolean
  hasResilience: boolean
  predationCount: number
  moldCount: number
}

export interface AdaptationMeasure {
  level: number
  type: 'creosote' | 'saguaro' | 'mesquite' | 'ocotillo' | 'tumbleweed' | 'dust'
  hasHighAdaptation: boolean
  hasExtremeSurvival: boolean
  hasSparseEfficiency: boolean
  hasNoOverdependence: boolean
  hasHarshConditionSurvival: boolean
  hasNoFragility: boolean
  hasProperResourcefulness: boolean
  hasNoWastefulness: boolean
  hasMinimalist: boolean
  hasNoVulnerability: boolean
  hasAncientWisdom: boolean
  fragilityCount: number
  vulnerabilityCount: number
}

export interface DesertFlower {
  file: string
  droughtTolerance: number
  heatResistance: number
  waterStorage: number
  rareBloomQuality: number
  seedBankVitality: number
  desertAdaptation: number
  drought: DroughtMeasure
  heat: HeatMeasure
  storage: StorageMeasure
  bloom: BloomMeasure
  seed: SeedMeasure
  adaptation: AdaptationMeasure
  condition: 'superbloom' | 'saguaro-bloom' | 'desert-marigold' | 'prickly-pear' | 'tumbleweed' | 'dust-devil'
  qualityScore: number
}

export interface DesertOasis {
  directory: string
  flowers: DesertFlower[]
  avgTolerance: number
  avgEfficiency: number
  avgResilience: number
  superbloomCount: number
  dustDevilCount: number
  highToleranceCount: number
  highResilienceCount: number
  oasisType: 'verdant-oasis' | 'spring' | 'wadi' | 'dry-lake' | 'sand-dune' | 'salt-flat'
  condition: 'national-monument' | 'wildlife-refuge' | 'conservation-area' | 'recreation-area' | 'wasteland' | 'mine-tailings'
}

export interface DesertBloomResult {
  flowers: DesertFlower[]
  oases: DesertOasis[]
  desert: {
    avgTolerance: number
    avgEfficiency: number
    avgResilience: number
    isResilient: boolean
    overallResilience: number
  }
  stats: {
    totalFiles: number
    totalOases: number
    avgDroughtTolerance: number
    avgHeatResistance: number
    avgWaterStorage: number
    avgRareBloomQuality: number
    avgSeedBankVitality: number
    avgDesertAdaptation: number
    superbloomCount: number
    saguaroBloomCount: number
    desertMarigoldCount: number
    pricklyPearCount: number
    tumbleweedCount: number
    dustDevilCount: number
    hasHighToleranceCount: number
    hasHighResistanceCount: number
    hasHighEfficiencyCount: number
    hasSpectacularBloomCount: number
    hasHighVitalityCount: number
    hasHighAdaptationCount: number
    overallResilience: number
    desertRangerGrade: 'desert-sage' | 'ranger' | 'botanist' | 'hiker' | 'tourist' | 'snowbird'
    bestFlower: string
    mostResilient: string
    mostEfficient: string
    mostImpactful: string
    mostPotential: string
    mostAdapted: string
  }
  recommendations: string[]
}

// ─── Drought Measurement ────────────────────────────────────────────────────

/** @example measureDrought(content) returns drought analysis */
export function measureDrought(content: string): DroughtMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let tolerance = 20
  if (hasStructure) tolerance += 12
  if (hasTypes) tolerance += 12
  if (hasFunctions) tolerance += 10
  if (jsdocCount > 0) tolerance += 8
  if (exportCount > 0) tolerance += 8
  if (genericsCount > 0) tolerance += 5
  if (importCount > 0) tolerance += 5
  if (anyCount === 0) tolerance += 5
  if (consoleCount === 0) tolerance += 5
  if (todoCount === 0) tolerance += 5
  if (commentedCodeCount === 0) tolerance += 5
  tolerance = Math.min(100, Math.max(0, Math.round(tolerance)))

  const transpirationCount = consoleCount + anyCount
  const bloatCount = deepNestedCount + commentedCodeCount

  const hasHighTolerance = tolerance >= 75 && hasStructure && hasTypes
  const hasWaterConservation = consoleCount === 0 && anyCount === 0
  const hasNoWastefulGrowth = deepNestedCount === 0 && commentedCodeCount === 0
  const hasEfficientMetabolism = hasStructure && hasTypes && hasFunctions
  const hasCrassulacean = hasStructure && hasTypes && genericsCount > 0
  const hasNoTranspiration = transpirationCount === 0
  const hasProperStomata = exportCount > 0 && importCount > 0
  const hasNoOverconsumption = todoCount === 0
  const hasXerophytic = hasFunctions && exportCount > 0
  const hasNoBloat = bloatCount === 0

  let strategy: DroughtMeasure['strategy'] = 'dead'
  if (hasHighTolerance && hasNoTranspiration && hasNoBloat) strategy = 'succulent'
  else if (hasHighTolerance && hasNoTranspiration) strategy = 'deep-root'
  else if (hasHighTolerance) strategy = 'ephemeral'
  else if (hasEfficientMetabolism && exportCount > 0) strategy = 'dormant'
  else if (tolerance > 30) strategy = 'wilted'

  return {
    tolerance, strategy, hasHighTolerance, hasWaterConservation,
    hasNoWastefulGrowth, hasEfficientMetabolism, hasCrassulacean,
    hasNoTranspiration, hasProperStomata, hasNoOverconsumption,
    hasXerophytic, hasNoBloat, transpirationCount, bloatCount,
  }
}

// ─── Heat Measurement ───────────────────────────────────────────────────────

/** @example measureHeat(content) returns heat analysis */
export function measureHeat(content: string): HeatMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let resistance = 20
  if (hasStructure) resistance += 12
  if (hasTypes) resistance += 12
  if (hasFunctions) resistance += 10
  if (tryCatchCount > 0) resistance += 10
  if (jsdocCount > 0) resistance += 8
  if (exportCount > 0) resistance += 8
  if (genericsCount > 0) resistance += 5
  if (asyncCount > 0) resistance += 5
  if (importCount > 0) resistance += 5
  if (anyCount === 0) resistance += 5
  resistance = Math.min(100, Math.max(0, Math.round(resistance)))

  const thermalShockCount = anyCount + consoleCount
  const heatStressCount = deepNestedCount

  const hasHighResistance = resistance >= 75 && hasStructure && hasTypes
  const hasSunscreen = hasStructure && hasTypes && anyCount === 0
  const hasHeatDissipation = tryCatchCount > 0 && asyncCount > 0
  const hasNoThermalShock = thermalShockCount === 0
  const hasReflectiveSurface = hasStructure && hasTypes && genericsCount > 0
  const hasNoSunScald = consoleCount === 0
  const hasProperInsulation = hasStructure && hasTypes && exportCount > 0
  const hasNoHeatStress = deepNestedCount === 0
  const hasShade = hasFunctions && jsdocCount > 0
  const hasNoDehydration = hasFunctions && exportCount > 0

  let heatTolerance: HeatMeasure['tolerance'] = 'scorched'
  if (hasHighResistance && hasNoThermalShock && hasNoHeatStress && hasHeatDissipation) heatTolerance = 'extremophile'
  else if (hasHighResistance && hasNoThermalShock) heatTolerance = 'thermophile'
  else if (hasHighResistance) heatTolerance = 'mesophile'
  else if (hasSunscreen && hasProperInsulation) heatTolerance = 'sensitive'
  else if (resistance > 30) heatTolerance = 'wilting'

  return {
    resistance, tolerance: heatTolerance, hasHighResistance, hasSunscreen,
    hasHeatDissipation, hasNoThermalShock, hasReflectiveSurface, hasNoSunScald,
    hasProperInsulation, hasNoHeatStress, hasShade, hasNoDehydration,
    thermalShockCount, heatStressCount,
  }
}

// ─── Storage Measurement ────────────────────────────────────────────────────

/** @example measureStorage(content) returns storage analysis */
export function measureStorage(content: string): StorageMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let capacity = 20
  if (hasStructure) capacity += 12
  if (hasTypes) capacity += 12
  if (hasFunctions) capacity += 10
  if (jsdocCount > 0) capacity += 8
  if (exportCount > 0) capacity += 8
  if (genericsCount > 0) capacity += 5
  if (importCount > 0) capacity += 5
  if (asyncCount > 0) capacity += 5
  if (tryCatchCount > 0) capacity += 5
  if (anyCount === 0) capacity += 5
  if (consoleCount === 0) capacity += 5
  capacity = Math.min(100, Math.max(0, Math.round(capacity)))

  const leakageCount = anyCount + consoleCount
  const stagnationCount = deepNestedCount + commentedCodeCount

  const hasHighEfficiency = capacity >= 75 && hasStructure && hasTypes
  const hasProperCaching = hasStructure && hasTypes && genericsCount > 0
  const hasNoLeakage = leakageCount === 0
  const hasEfficientRetrieval = hasFunctions && exportCount > 0
  const hasNoEvaporation = importCount > 0 && exportCount > 0
  const hasProperCapacity = hasStructure && hasTypes && hasFunctions
  const hasNoOverflow = deepNestedCount === 0
  const hasCompression = tryCatchCount > 0 && asyncCount > 0
  const hasQuickRelease = hasFunctions && jsdocCount > 0
  const hasNoStagnation = stagnationCount === 0

  let storageType: StorageMeasure['type'] = 'evaporated'
  if (hasHighEfficiency && hasNoLeakage && hasNoStagnation && hasCompression) storageType = 'cistern'
  else if (hasHighEfficiency && hasNoLeakage) storageType = 'aquifer'
  else if (hasHighEfficiency) storageType = 'succulent'
  else if (hasProperCapacity && hasProperCaching) storageType = 'tuber'
  else if (capacity > 30) storageType = 'seed-coat'

  return {
    capacity, type: storageType, hasHighEfficiency, hasProperCaching,
    hasNoLeakage, hasEfficientRetrieval, hasNoEvaporation, hasProperCapacity,
    hasNoOverflow, hasCompression, hasQuickRelease, hasNoStagnation,
    leakageCount, stagnationCount,
  }
}

// ─── Bloom Measurement ──────────────────────────────────────────────────────

/** @example measureBloom(content) returns bloom analysis */
export function measureBloom(content: string): BloomMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (exportCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (asyncCount > 0) quality += 5
  if (tryCatchCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const misTimingCount = deepNestedCount + commentedCodeCount
  const falseBloomCount = consoleCount + anyCount

  const hasSpectacularBloom = quality >= 80 && hasStructure && hasTypes
  const hasVibrantDisplay = hasStructure && hasTypes && genericsCount > 0
  const hasProperTiming = importCount > 0 && exportCount > 0
  const hasNoMisTiming = misTimingCount === 0
  const hasAttracts = jsdocCount > 0 && exportCount > 0
  const hasProperDuration = hasStructure && hasTypes && hasFunctions
  const hasNoWastedBloom = falseBloomCount === 0
  const hasFragrance = hasFunctions && jsdocCount > 0
  const hasProperScale = hasStructure && hasTypes && exportCount > 0
  const hasNoFalseBloom = falseBloomCount === 0

  let rarity: BloomMeasure['rarity'] = 'never-blooms'
  if (hasSpectacularBloom && hasNoMisTiming && hasNoWastedBloom && hasVibrantDisplay) rarity = 'superbloom'
  else if (hasSpectacularBloom && hasNoMisTiming) rarity = 'rare-bloom'
  else if (hasSpectacularBloom) rarity = 'seasonal'
  else if (hasProperDuration && hasProperScale) rarity = 'occasional'
  else if (quality > 30) rarity = 'rare'

  return {
    quality, rarity, hasSpectacularBloom, hasVibrantDisplay, hasProperTiming,
    hasNoMisTiming, hasAttracts, hasProperDuration, hasNoWastedBloom,
    hasFragrance, hasProperScale, hasNoFalseBloom, misTimingCount, falseBloomCount,
  }
}

// ─── Seed Measurement ───────────────────────────────────────────────────────

/** @example measureSeed(content) returns seed analysis */
export function measureSeed(content: string): SeedMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = reExportCount_safe(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const todoCount = countTodoComments(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let vitality = 20
  if (hasStructure) vitality += 12
  if (hasTypes) vitality += 12
  if (hasFunctions) vitality += 10
  if (jsdocCount > 0) vitality += 8
  if (genericsCount > 0) vitality += 5
  if (enumCount > 0) vitality += 5
  if (exportCount > 0) vitality += 8
  if (importCount > 0) vitality += 5
  if (reExportCount > 0) vitality += 5
  if (anyCount === 0) vitality += 5
  if (consoleCount === 0) vitality += 5
  vitality = Math.min(100, Math.max(0, Math.round(vitality)))

  const predationCount = todoCount + anyCount
  const moldCount = deepNestedCount

  const hasHighVitality = vitality >= 75 && hasStructure && hasTypes
  const hasLongevity = hasStructure && hasTypes && reExportCount > 0
  const hasProperDormancy = hasFunctions && exportCount > 0
  const hasNoPrematureGermination = deepNestedCount === 0
  const hasProperDispersal = importCount > 0 && exportCount > 0
  const hasGerminationTrigger = jsdocCount > 0 && genericsCount > 0
  const hasNoSeedPredation = predationCount === 0
  const hasProperCoating = hasStructure && hasTypes && genericsCount > 0
  const hasNoMold = moldCount === 0
  const hasResilience = hasHighVitality && hasNoSeedPredation

  let seedBank: SeedMeasure['bank'] = 'barren'
  if (hasHighVitality && hasLongevity && hasNoSeedPredation && hasNoMold) seedBank = 'deep-bank'
  else if (hasHighVitality && hasLongevity) seedBank = 'surface-bank'
  else if (hasHighVitality) seedBank = 'canopy-bank'
  else if (hasProperDispersal && hasProperCoating) seedBank = 'soil-bank'
  else if (vitality > 30) seedBank = 'scatter'

  return {
    vitality, bank: seedBank, hasHighVitality, hasLongevity, hasProperDormancy,
    hasNoPrematureGermination, hasProperDispersal, hasGerminationTrigger,
    hasNoSeedPredation, hasProperCoating, hasNoMold, hasResilience,
    predationCount, moldCount,
  }
}

// ─── Adaptation Measurement ─────────────────────────────────────────────────

/** @example measureAdaptation(content) returns adaptation analysis */
export function measureAdaptation(content: string): AdaptationMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 10
  if (hasTypes) level += 10
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (enumCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 8
  if (importCount > 0) level += 5
  if (asyncCount > 0) level += 5
  if (tryCatchCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 4
  level = Math.min(100, Math.max(0, Math.round(level)))

  const fragilityCount = todoCount + commentedCodeCount
  const vulnerabilityCount = deepNestedCount + consoleCount

  const hasHighAdaptation = level >= 75 && hasStructure && hasTypes
  const hasExtremeSurvival = tryCatchCount > 0 && asyncCount > 0
  const hasSparseEfficiency = hasStructure && hasTypes && genericsCount > 0
  const hasNoOverdependence = importCount > 0 && exportCount > 0
  const hasHarshConditionSurvival = hasStructure && hasTypes && anyCount === 0
  const hasNoFragility = fragilityCount === 0
  const hasProperResourcefulness = hasFunctions && jsdocCount > 0
  const hasNoWastefulness = consoleCount === 0 && commentedCodeCount === 0
  const hasMinimalist = hasStructure && hasTypes && exportCount > 0
  const hasNoVulnerability = vulnerabilityCount === 0
  const hasAncientWisdom = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0

  let adaptationType: AdaptationMeasure['type'] = 'dust'
  if (hasHighAdaptation && hasNoFragility && hasNoVulnerability && hasSparseEfficiency) adaptationType = 'creosote'
  else if (hasHighAdaptation && hasNoFragility) adaptationType = 'saguaro'
  else if (hasHighAdaptation) adaptationType = 'mesquite'
  else if (hasMinimalist && hasProperResourcefulness) adaptationType = 'ocotillo'
  else if (level > 30) adaptationType = 'tumbleweed'

  return {
    level, type: adaptationType, hasHighAdaptation, hasExtremeSurvival,
    hasSparseEfficiency, hasNoOverdependence, hasHarshConditionSurvival,
    hasNoFragility, hasProperResourcefulness, hasNoWastefulness,
    hasMinimalist, hasNoVulnerability, hasAncientWisdom,
    fragilityCount, vulnerabilityCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(flower) returns condition string */
export function classifyCondition(flower: DesertFlower): DesertFlower['condition'] {
  const { qualityScore } = flower
  if (qualityScore >= 80) return 'superbloom'
  if (qualityScore >= 65) return 'saguaro-bloom'
  if (qualityScore >= 50) return 'desert-marigold'
  if (qualityScore >= 35) return 'prickly-pear'
  if (qualityScore >= 20) return 'tumbleweed'
  return 'dust-devil'
}

// ─── Flower Analysis ────────────────────────────────────────────────────────

/** @example analyzeDesertFlower(content, filePath) returns full flower */
export function analyzeDesertFlower(content: string, filePath: string): DesertFlower {
  const drought = measureDrought(content)
  const heat = measureHeat(content)
  const storage = measureStorage(content)
  const bloom = measureBloom(content)
  const seed = measureSeed(content)
  const adaptation = measureAdaptation(content)

  const droughtTolerance = drought.tolerance
  const heatResistance = heat.resistance
  const waterStorage = storage.capacity
  const rareBloomQuality = bloom.quality
  const seedBankVitality = seed.vitality
  const desertAdaptation = adaptation.level

  const qualityScore = Math.round(
    droughtTolerance * 0.15 +
    heatResistance * 0.15 +
    waterStorage * 0.15 +
    rareBloomQuality * 0.2 +
    seedBankVitality * 0.15 +
    desertAdaptation * 0.2,
  )

  const result: DesertFlower = {
    file: filePath,
    droughtTolerance, heatResistance, waterStorage, rareBloomQuality,
    seedBankVitality, desertAdaptation,
    drought, heat, storage, bloom, seed, adaptation,
    condition: 'dust-devil',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Oasis Analysis ─────────────────────────────────────────────────────────

/** @example analyzeDesertOasis(flowers, dirPath) returns oasis */
export function analyzeDesertOasis(flowers: DesertFlower[], dirPath: string): DesertOasis {
  if (flowers.length === 0) {
    return {
      directory: dirPath, flowers: [], avgTolerance: 0, avgEfficiency: 0,
      avgResilience: 0, superbloomCount: 0, dustDevilCount: 0,
      highToleranceCount: 0, highResilienceCount: 0,
      oasisType: 'salt-flat', condition: 'mine-tailings',
    }
  }

  const avgTolerance = Math.round(flowers.reduce((s, f) => s + f.droughtTolerance, 0) / flowers.length)
  const avgEfficiency = Math.round(flowers.reduce((s, f) => s + f.waterStorage, 0) / flowers.length)
  const avgResilience = Math.round(flowers.reduce((s, f) => s + f.desertAdaptation, 0) / flowers.length)

  const superbloomCount = flowers.filter((f) => f.condition === 'superbloom').length
  const dustDevilCount = flowers.filter((f) => f.condition === 'dust-devil').length
  const highToleranceCount = flowers.filter((f) => f.drought.hasHighTolerance).length
  const highResilienceCount = flowers.filter((f) => f.adaptation.hasHighAdaptation).length

  const oasisType = classifyOasisType(flowers)
  const avgScore = flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length
  const condition = classifyOasisCondition(avgScore)

  return {
    directory: dirPath, flowers, avgTolerance, avgEfficiency, avgResilience,
    superbloomCount, dustDevilCount, highToleranceCount, highResilienceCount,
    oasisType, condition,
  }
}

// ─── Oasis Classification ───────────────────────────────────────────────────

/** @example classifyOasisType(flowers) returns oasis type */
export function classifyOasisType(flowers: DesertFlower[]): DesertOasis['oasisType'] {
  if (flowers.length === 0) return 'salt-flat'
  const avgScore = flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length
  const superbloomCnt = flowers.filter((f) => f.condition === 'superbloom').length
  if (avgScore >= 75 && superbloomCnt >= Math.ceil(flowers.length * 0.3)) return 'verdant-oasis'
  if (avgScore >= 60) return 'spring'
  if (avgScore >= 45) return 'wadi'
  if (avgScore >= 30) return 'dry-lake'
  if (avgScore >= 15) return 'sand-dune'
  return 'salt-flat'
}

/** @example classifyOasisCondition(avgScore) returns condition */
export function classifyOasisCondition(avgScore: number): DesertOasis['condition'] {
  if (avgScore >= 80) return 'national-monument'
  if (avgScore >= 65) return 'wildlife-refuge'
  if (avgScore >= 50) return 'conservation-area'
  if (avgScore >= 35) return 'recreation-area'
  if (avgScore >= 20) return 'wasteland'
  return 'mine-tailings'
}

/** @example classifyDesertRangerGrade(avgResilience) returns grade */
export function classifyDesertRangerGrade(avgResilience: number): DesertBloomResult['stats']['desertRangerGrade'] {
  if (avgResilience >= 80) return 'desert-sage'
  if (avgResilience >= 65) return 'ranger'
  if (avgResilience >= 50) return 'botanist'
  if (avgResilience >= 35) return 'hiker'
  if (avgResilience >= 20) return 'tourist'
  return 'snowbird'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(flowers, oases, desert, stats) returns recommendations */
export function generateRecommendations(
  flowers: DesertFlower[],
  oases: DesertOasis[],
  desert: DesertBloomResult['desert'],
  stats: DesertBloomResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgDroughtTolerance < 50) recs.push('Improve drought tolerance — trim unnecessary code and conserve resources')
  if (stats.avgHeatResistance < 50) recs.push('Strengthen heat resistance — add error handling and stress tolerance')
  if (stats.avgWaterStorage < 50) recs.push('Enhance water storage — improve code efficiency and caching')
  if (stats.avgRareBloomQuality < 50) recs.push('Elevate bloom quality — make your code impact spectacular')
  if (stats.avgSeedBankVitality < 50) recs.push('Nurture seed bank vitality — build code with lasting potential')
  if (stats.avgDesertAdaptation < 50) recs.push('Strengthen desert adaptation — make code resilient to harsh conditions')
  if (stats.dustDevilCount > flowers.length * 0.5) recs.push('Too many dust devils — over half the codebase is debris')
  if (stats.hasHighAdaptationCount === 0) recs.push('No resilient species found — plant seeds that can survive the desert')
  if (oases.length > 0 && desert.overallResilience < 60) recs.push('Desert resilience is low — seek the wisdom of ancient creosote')
  if (recs.length === 0) recs.push('Superbloom achieved — your desert garden rivals the Atacama in rare beauty')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildDesertBloomResult(files, contents, options) returns full result */
export function buildDesertBloomResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): DesertBloomResult {
  const flowers: DesertFlower[] = files.map((file, i) =>
    analyzeDesertFlower(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, DesertFlower[]>()
  for (const flower of flowers) {
    const dir = flower.file.includes('/')
      ? flower.file.substring(0, flower.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(flower)
    } else {
      dirMap.set(dir, [flower])
    }
  }

  const oases: DesertOasis[] = Array.from(dirMap.entries()).map(([dir, dirFlowers]) =>
    analyzeDesertOasis(dirFlowers, dir),
  )

  const avgTolerance = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.droughtTolerance, 0) / flowers.length)
    : 0
  const avgEfficiency = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.waterStorage, 0) / flowers.length)
    : 0
  const avgResilience = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.desertAdaptation, 0) / flowers.length)
    : 0
  const overallResilience = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length)
    : 0
  const isResilient = overallResilience >= 65

  const desert: DesertBloomResult['desert'] = {
    avgTolerance, avgEfficiency, avgResilience, isResilient, overallResilience,
  }

  const avgDroughtTolerance = avgTolerance
  const avgHeatResistance = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.heatResistance, 0) / flowers.length)
    : 0
  const avgWaterStorage = avgEfficiency
  const avgRareBloomQuality = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.rareBloomQuality, 0) / flowers.length)
    : 0
  const avgSeedBankVitality = flowers.length > 0
    ? Math.round(flowers.reduce((s, f) => s + f.seedBankVitality, 0) / flowers.length)
    : 0
  const avgDesertAdaptation = avgResilience

  const conditionCounts = {
    superbloom: 0, saguaroBloom: 0, desertMarigold: 0,
    pricklyPear: 0, tumbleweed: 0, dustDevil: 0,
  }
  for (const f of flowers) {
    switch (f.condition) {
      case 'superbloom': conditionCounts.superbloom++; break
      case 'saguaro-bloom': conditionCounts.saguaroBloom++; break
      case 'desert-marigold': conditionCounts.desertMarigold++; break
      case 'prickly-pear': conditionCounts.pricklyPear++; break
      case 'tumbleweed': conditionCounts.tumbleweed++; break
      case 'dust-devil': conditionCounts.dustDevil++; break
    }
  }

  const hasHighToleranceCount = flowers.filter((f) => f.drought.hasHighTolerance).length
  const hasHighResistanceCount = flowers.filter((f) => f.heat.hasHighResistance).length
  const hasHighEfficiencyCount = flowers.filter((f) => f.storage.hasHighEfficiency).length
  const hasSpectacularBloomCount = flowers.filter((f) => f.bloom.hasSpectacularBloom).length
  const hasHighVitalityCount = flowers.filter((f) => f.seed.hasHighVitality).length
  const hasHighAdaptationCount = flowers.filter((f) => f.adaptation.hasHighAdaptation).length

  const bestFlower = flowers.length > 0
    ? flowers.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file
    : ''
  const mostResilient = flowers.length > 0
    ? flowers.reduce((best, f) => f.desertAdaptation > best.desertAdaptation ? f : best).file
    : ''
  const mostEfficient = flowers.length > 0
    ? flowers.reduce((best, f) => f.waterStorage > best.waterStorage ? f : best).file
    : ''
  const mostImpactful = flowers.length > 0
    ? flowers.reduce((best, f) => f.rareBloomQuality > best.rareBloomQuality ? f : best).file
    : ''
  const mostPotential = flowers.length > 0
    ? flowers.reduce((best, f) => f.seedBankVitality > best.seedBankVitality ? f : best).file
    : ''
  const mostAdapted = flowers.length > 0
    ? flowers.reduce((best, f) => f.desertAdaptation > best.desertAdaptation ? f : best).file
    : ''

  const desertRangerGrade = classifyDesertRangerGrade(overallResilience)

  const stats: DesertBloomResult['stats'] = {
    totalFiles: files.length, totalOases: oases.length,
    avgDroughtTolerance, avgHeatResistance, avgWaterStorage,
    avgRareBloomQuality, avgSeedBankVitality, avgDesertAdaptation,
    superbloomCount: conditionCounts.superbloom,
    saguaroBloomCount: conditionCounts.saguaroBloom,
    desertMarigoldCount: conditionCounts.desertMarigold,
    pricklyPearCount: conditionCounts.pricklyPear,
    tumbleweedCount: conditionCounts.tumbleweed,
    dustDevilCount: conditionCounts.dustDevil,
    hasHighToleranceCount, hasHighResistanceCount, hasHighEfficiencyCount,
    hasSpectacularBloomCount, hasHighVitalityCount, hasHighAdaptationCount,
    overallResilience, desertRangerGrade,
    bestFlower, mostResilient, mostEfficient,
    mostImpactful, mostPotential, mostAdapted,
  }

  const recommendations = generateRecommendations(flowers, oases, desert, stats)

  return { flowers, oases, desert, stats, recommendations }
}
