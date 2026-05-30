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
const DEFAULT_EXPORT_REGEX = /\bexport\s+default\s+/g
const PROMISE_REGEX = /\bPromise\b/g
const ARROW_RETURN_REGEX = /=>\s*[^{]/g

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
function countDefaultExports(content: string): number { return countMatches(content, DEFAULT_EXPORT_REGEX) }
function countPromiseUsage(content: string): number { return countMatches(content, PROMISE_REGEX) }
function countArrowReturns(content: string): number { return countMatches(content, ARROW_RETURN_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface BudMeasure {
  vitality: number
  type: 'cherry-blossom' | 'tulip' | 'daffodil' | 'lily' | 'dandelion' | 'dead-seed'
  hasHighVitality: boolean
  hasProperFormation: boolean
  hasNoFrostbite: boolean
  hasProperSwelling: boolean
  hasProtectiveScales: boolean
  hasNoPremature: boolean
  hasDormancyRecovery: boolean
  hasProperTiming: boolean
  hasNoBlight: boolean
  hasReadyToOpen: boolean
  frostbiteCount: number
  blightCount: number
}

export interface BlossomMeasure {
  quality: number
  form: 'full-bloom' | 'half-open' | 'opening' | 'bud' | 'wilted' | 'dead'
  hasBeautifulBlossom: boolean
  hasProperPetals: boolean
  hasVibrantColor: boolean
  hasProperFragrance: boolean
  hasNoWilting: boolean
  hasFullDisplay: boolean
  hasProperStructure: boolean
  hasNoDeformity: boolean
  hasPeakBloom: boolean
  hasNoPetalDrop: boolean
  wiltingCount: number
  petalDropCount: number
}

export interface RootMeasure {
  depth: number
  system: 'taproot' | 'fibrous' | 'rhizome' | 'bulb' | 'adventitious' | 'floating'
  hasDeepRoots: boolean
  hasProperAnchorage: boolean
  hasNutrientAbsorption: boolean
  hasNoRootRot: boolean
  hasMycorrhizae: boolean
  hasProperSpread: boolean
  hasNoGirdling: boolean
  hasWaterUptake: boolean
  hasNoCompaction: boolean
  hasStorageCapacity: boolean
  rootRotCount: number
  girdlingCount: number
}

export interface PollinationMeasure {
  rate: number
  vector: 'bee' | 'butterfly' | 'wind' | 'bird' | 'self' | 'none'
  hasHighPollination: boolean
  hasCrossPollination: boolean
  hasSelfPollination: boolean
  hasAttractants: boolean
  hasNoBarriers: boolean
  hasProperNectar: boolean
  hasPollenTransfer: boolean
  hasNoSterility: boolean
  hasProperTiming: boolean
  hasSeedProduction: boolean
  barrierCount: number
  sterilityCount: number
}

export interface AdaptationMeasure {
  level: number
  season: 'evergreen' | 'spring-ephemeral' | 'summer-bloomer' | 'autumn-flowerer' | 'winter-hardy' | 'annual'
  hasHighAdaptation: boolean
  hasPhenologicalTiming: boolean
  hasNoSeasonalMismatch: boolean
  hasClimateAdaptation: boolean
  hasDroughtTolerance: boolean
  hasFrostResistance: boolean
  hasNoVernalization: boolean
  hasPhotoperiodResponse: boolean
  hasNoHeatStress: boolean
  hasFlexibleBloom: boolean
  mismatchCount: number
  heatStressCount: number
}

export interface HealthMeasure {
  score: number
  status: 'flourishing' | 'blooming' | 'growing' | 'dormant' | 'wilting' | 'dead'
  hasGoodHealth: boolean
  hasNoDisease: boolean
  hasNoPests: boolean
  hasProperNutrition: boolean
  hasNoFungalInfection: boolean
  hasGoodImmuneResponse: boolean
  hasNoNutrientDeficiency: boolean
  hasProperGrowth: boolean
  hasNoChlorosis: boolean
  hasVigor: boolean
  diseaseCount: number
  pestCount: number
}

export interface SpringBlossom {
  file: string
  budVitality: number
  blossomQuality: number
  rootDepth: number
  pollinationRate: number
  seasonalAdaptation: number
  gardenHealth: number
  bud: BudMeasure
  blossom: BlossomMeasure
  root: RootMeasure
  pollination: PollinationMeasure
  adaptation: AdaptationMeasure
  health: HealthMeasure
  condition: 'cherry-blossom-avenue' | 'tulip-field' | 'wildflower-meadow' | 'garden-bed' | 'window-box' | 'compost'
  qualityScore: number
}

export interface BloomGarden {
  directory: string
  blossoms: SpringBlossom[]
  avgVitality: number
  avgQuality: number
  avgHealth: number
  cherryAvenueCount: number
  compostCount: number
  vitalCount: number
  healthyCount: number
  gardenType: 'botanical-garden' | 'flower-field' | 'cottage-garden' | 'greenhouse' | 'window-sill' | 'wasteland'
  condition: 'kensington-gardens' | 'keukenhof' | 'community-garden' | 'backyard' | 'planter' | 'parking-strip'
}

export interface SpringBloomResult {
  blossoms: SpringBlossom[]
  gardens: BloomGarden[]
  meadow: {
    avgVitality: number
    avgQuality: number
    avgHealth: number
    isFlourishing: boolean
    overallBloom: number
  }
  stats: {
    totalFiles: number
    totalGardens: number
    avgBudVitality: number
    avgBlossomQuality: number
    avgRootDepth: number
    avgPollinationRate: number
    avgSeasonalAdaptation: number
    avgGardenHealth: number
    cherryBlossomAvenueCount: number
    tulipFieldCount: number
    wildflowerMeadowCount: number
    gardenBedCount: number
    windowBoxCount: number
    compostCount: number
    hasHighVitalityCount: number
    hasBeautifulBlossomCount: number
    hasDeepRootsCount: number
    hasHighPollinationCount: number
    hasHighAdaptationCount: number
    hasGoodHealthCount: number
    overallBloom: number
    gardenerGrade: 'master-horticulturist' | 'head-gardener' | 'gardener' | 'green-thumb' | 'plant-owner' | 'concrete-lover'
    bestBlossom: string
    mostVital: string
    mostBeautiful: string
    deepestRooted: string
    mostReusable: string
    healthiest: string
  }
  recommendations: string[]
}

// ─── Bud Measurement ────────────────────────────────────────────────────────

/** @example measureBud(content) returns bud analysis */
export function measureBud(content: string): BudMeasure {
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
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let vitality = 20
  if (hasStructure) vitality += 12
  if (hasTypes) vitality += 12
  if (hasFunctions) vitality += 10
  if (jsdocCount > 0) vitality += 10
  if (exportCount > 0) vitality += 8
  if (importCount > 0) vitality += 5
  if (genericsCount > 0) vitality += 5
  if (asyncCount > 0) vitality += 5
  if (anyCount === 0) vitality += 5
  if (consoleCount === 0) vitality += 4
  if (deepNestedCount === 0) vitality += 4
  vitality = Math.min(100, Math.max(0, Math.round(vitality)))

  const frostbiteCount = anyCount + todoCount
  const blightCount = deepNestedCount + consoleCount

  const hasHighVitality = vitality >= 75 && hasStructure && hasTypes
  const hasProperFormation = hasStructure && hasTypes && exportCount > 0
  const hasNoFrostbite = frostbiteCount === 0
  const hasProperSwelling = hasStructure && hasTypes && genericsCount > 0
  const hasProtectiveScales = hasFunctions && jsdocCount > 0
  const hasNoPremature = deepNestedCount === 0
  const hasDormancyRecovery = hasFunctions && exportCount > 0
  const hasProperTiming = importCount > 0 && exportCount > 0
  const hasNoBlight = blightCount === 0
  const hasReadyToOpen = hasStructure && hasTypes && hasFunctions

  let budType: BudMeasure['type'] = 'dead-seed'
  if (hasHighVitality && hasNoFrostbite && hasNoBlight && hasReadyToOpen) budType = 'cherry-blossom'
  else if (hasHighVitality && hasNoFrostbite) budType = 'tulip'
  else if (hasHighVitality) budType = 'daffodil'
  else if (hasProperFormation && hasReadyToOpen) budType = 'lily'
  else if (vitality > 30) budType = 'dandelion'

  return {
    vitality, type: budType, hasHighVitality, hasProperFormation,
    hasNoFrostbite, hasProperSwelling, hasProtectiveScales, hasNoPremature,
    hasDormancyRecovery, hasProperTiming, hasNoBlight, hasReadyToOpen,
    frostbiteCount, blightCount,
  }
}

// ─── Blossom Measurement ────────────────────────────────────────────────────

/** @example measureBlossom(content) returns blossom analysis */
export function measureBlossom(content: string): BlossomMeasure {
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
  if (asyncCount > 0) quality += 5
  if (tryCatchCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const wiltingCount = anyCount + consoleCount
  const petalDropCount = deepNestedCount + commentedCodeCount

  const hasBeautifulBlossom = quality >= 75 && hasStructure && hasTypes
  const hasProperPetals = hasStructure && hasTypes && hasFunctions
  const hasVibrantColor = hasStructure && hasTypes && genericsCount > 0
  const hasProperFragrance = jsdocCount > 0 && exportCount > 0
  const hasNoWilting = wiltingCount === 0
  const hasFullDisplay = hasStructure && hasTypes && hasFunctions && exportCount > 0
  const hasProperStructure = hasStructure && hasTypes && importCount > 0
  const hasNoDeformity = deepNestedCount === 0 && commentedCodeCount === 0
  const hasPeakBloom = quality >= 80 && hasStructure && hasTypes && hasFunctions
  const hasNoPetalDrop = petalDropCount === 0

  let blossomForm: BlossomMeasure['form'] = 'dead'
  if (hasBeautifulBlossom && hasNoWilting && hasNoPetalDrop && hasPeakBloom) blossomForm = 'full-bloom'
  else if (hasBeautifulBlossom && hasNoWilting) blossomForm = 'half-open'
  else if (hasBeautifulBlossom) blossomForm = 'opening'
  else if (hasProperPetals && hasFullDisplay) blossomForm = 'bud'
  else if (quality > 30) blossomForm = 'wilted'

  return {
    quality, form: blossomForm, hasBeautifulBlossom, hasProperPetals,
    hasVibrantColor, hasProperFragrance, hasNoWilting, hasFullDisplay,
    hasProperStructure, hasNoDeformity, hasPeakBloom, hasNoPetalDrop,
    wiltingCount, petalDropCount,
  }
}

// ─── Root Measurement ───────────────────────────────────────────────────────

/** @example measureRoot(content) returns root analysis */
export function measureRoot(content: string): RootMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let depth = 20
  if (hasStructure) depth += 12
  if (hasTypes) depth += 12
  if (hasFunctions) depth += 10
  if (jsdocCount > 0) depth += 8
  if (exportCount > 0) depth += 8
  if (importCount > 0) depth += 5
  if (genericsCount > 0) depth += 5
  if (tryCatchCount > 0) depth += 5
  if (asyncCount > 0) depth += 5
  if (anyCount === 0) depth += 5
  if (consoleCount === 0) depth += 5
  depth = Math.min(100, Math.max(0, Math.round(depth)))

  const rootRotCount = anyCount + todoCount
  const girdlingCount = deepNestedCount

  const hasDeepRoots = depth >= 75 && hasStructure && hasTypes
  const hasProperAnchorage = hasStructure && hasTypes && exportCount > 0
  const hasNutrientAbsorption = importCount > 0 && exportCount > 0
  const hasNoRootRot = rootRotCount === 0
  const hasMycorrhizae = hasStructure && hasTypes && importCount > 0
  const hasProperSpread = hasStructure && hasTypes && hasFunctions
  const hasNoGirdling = girdlingCount === 0
  const hasWaterUptake = hasFunctions && asyncCount > 0
  const hasNoCompaction = consoleCount === 0 && deepNestedCount === 0
  const hasStorageCapacity = tryCatchCount > 0 && genericsCount > 0

  let rootSystem: RootMeasure['system'] = 'floating'
  if (hasDeepRoots && hasNoRootRot && hasNoGirdling && hasStorageCapacity) rootSystem = 'taproot'
  else if (hasDeepRoots && hasNoRootRot) rootSystem = 'fibrous'
  else if (hasDeepRoots) rootSystem = 'rhizome'
  else if (hasProperSpread && hasProperAnchorage) rootSystem = 'bulb'
  else if (depth > 30) rootSystem = 'adventitious'

  return {
    depth, system: rootSystem, hasDeepRoots, hasProperAnchorage,
    hasNutrientAbsorption, hasNoRootRot, hasMycorrhizae, hasProperSpread,
    hasNoGirdling, hasWaterUptake, hasNoCompaction, hasStorageCapacity,
    rootRotCount, girdlingCount,
  }
}

// ─── Pollination Measurement ────────────────────────────────────────────────

/** @example measurePollination(content) returns pollination analysis */
export function measurePollination(content: string): PollinationMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = reExportCount_safe(content)
  const defaultExportCount = countDefaultExports(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)
  const promiseCount = countPromiseUsage(content)
  const arrowReturnCount = countArrowReturns(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let rate = 20
  if (hasStructure) rate += 10
  if (hasTypes) rate += 10
  if (hasFunctions) rate += 8
  if (exportCount > 0) rate += 10
  if (importCount > 0) rate += 8
  if (reExportCount > 0) rate += 8
  if (jsdocCount > 0) rate += 5
  if (genericsCount > 0) rate += 5
  if (promiseCount > 0) rate += 5
  if (arrowReturnCount > 0) rate += 3
  if (anyCount === 0) rate += 4
  if (consoleCount === 0) rate += 4
  rate = Math.min(100, Math.max(0, Math.round(rate)))

  const barrierCount = anyCount + consoleCount
  const sterilityCount = deepNestedCount + commentedCodeCount

  const hasHighPollination = rate >= 75 && exportCount > 0 && importCount > 0
  const hasCrossPollination = reExportCount > 0 && importCount > 0
  const hasSelfPollination = exportCount > 0 && defaultExportCount === 0
  const hasAttractants = jsdocCount > 0 && exportCount > 0
  const hasNoBarriers = barrierCount === 0
  const hasProperNectar = hasStructure && hasTypes && exportCount > 0
  const hasPollenTransfer = importCount > 0 && exportCount > 0
  const hasNoSterility = sterilityCount === 0
  const hasProperTiming = hasFunctions && exportCount > 0
  const hasSeedProduction = hasFunctions && hasTypes && exportCount > 0

  let vector: PollinationMeasure['vector'] = 'none'
  if (hasHighPollination && hasCrossPollination && hasNoBarriers) vector = 'bee'
  else if (hasHighPollination && hasCrossPollination) vector = 'butterfly'
  else if (hasHighPollination || (exportCount > 0 && importCount > 0)) vector = 'wind'
  else if (hasSelfPollination && hasProperNectar) vector = 'bird'
  else if (hasSelfPollination) vector = 'self'

  return {
    rate, vector, hasHighPollination, hasCrossPollination, hasSelfPollination,
    hasAttractants, hasNoBarriers, hasProperNectar, hasPollenTransfer,
    hasNoSterility, hasProperTiming, hasSeedProduction, barrierCount, sterilityCount,
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

  const mismatchCount = todoCount + commentedCodeCount
  const heatStressCount = deepNestedCount + consoleCount

  const hasHighAdaptation = level >= 75 && hasStructure && hasTypes
  const hasPhenologicalTiming = importCount > 0 && exportCount > 0
  const hasNoSeasonalMismatch = mismatchCount === 0
  const hasClimateAdaptation = hasStructure && hasTypes && genericsCount > 0
  const hasDroughtTolerance = tryCatchCount > 0 && asyncCount > 0
  const hasFrostResistance = anyCount === 0 && todoCount === 0
  const hasNoVernalization = deepNestedCount === 0
  const hasPhotoperiodResponse = hasFunctions && jsdocCount > 0
  const hasNoHeatStress = heatStressCount === 0
  const hasFlexibleBloom = hasStructure && hasTypes && hasFunctions

  let season: AdaptationMeasure['season'] = 'annual'
  if (hasHighAdaptation && hasNoSeasonalMismatch && hasNoHeatStress && hasClimateAdaptation) season = 'evergreen'
  else if (hasHighAdaptation && hasNoSeasonalMismatch) season = 'spring-ephemeral'
  else if (hasHighAdaptation) season = 'summer-bloomer'
  else if (hasFlexibleBloom && hasClimateAdaptation) season = 'autumn-flowerer'
  else if (level > 30) season = 'winter-hardy'

  return {
    level, season, hasHighAdaptation, hasPhenologicalTiming,
    hasNoSeasonalMismatch, hasClimateAdaptation, hasDroughtTolerance,
    hasFrostResistance, hasNoVernalization, hasPhotoperiodResponse,
    hasNoHeatStress, hasFlexibleBloom, mismatchCount, heatStressCount,
  }
}

// ─── Health Measurement ─────────────────────────────────────────────────────

/** @example measureHealth(content) returns health analysis */
export function measureHealth(content: string): HealthMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let score = 20
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (exportCount > 0) score += 8
  if (importCount > 0) score += 5
  if (genericsCount > 0) score += 5
  if (tryCatchCount > 0) score += 5
  if (anyCount === 0) score += 5
  if (consoleCount === 0) score += 5
  if (todoCount === 0) score += 5
  score = Math.min(100, Math.max(0, Math.round(score)))

  const diseaseCount = anyCount + todoCount
  const pestCount = deepNestedCount + commentedCodeCount

  const hasGoodHealth = score >= 75 && hasStructure && hasTypes
  const hasNoDisease = diseaseCount === 0
  const hasNoPests = pestCount === 0
  const hasProperNutrition = importCount > 0 && exportCount > 0
  const hasNoFungalInfection = consoleCount === 0 && commentedCodeCount === 0
  const hasGoodImmuneResponse = tryCatchCount > 0
  const hasNoNutrientDeficiency = hasStructure && hasTypes && hasFunctions
  const hasProperGrowth = hasStructure && hasTypes && exportCount > 0
  const hasNoChlorosis = deepNestedCount === 0
  const hasVigor = hasGoodHealth && hasNoDisease && hasNoPests

  let healthStatus: HealthMeasure['status'] = 'dead'
  if (hasGoodHealth && hasNoDisease && hasNoPests && hasVigor) healthStatus = 'flourishing'
  else if (hasGoodHealth && hasNoDisease) healthStatus = 'blooming'
  else if (hasGoodHealth) healthStatus = 'growing'
  else if (hasNoDisease && score > 30) healthStatus = 'dormant'
  else if (score > 30) healthStatus = 'wilting'

  return {
    score, status: healthStatus, hasGoodHealth, hasNoDisease, hasNoPests,
    hasProperNutrition, hasNoFungalInfection, hasGoodImmuneResponse,
    hasNoNutrientDeficiency, hasProperGrowth, hasNoChlorosis, hasVigor,
    diseaseCount, pestCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(blossom) returns condition string */
export function classifyCondition(blossom: SpringBlossom): SpringBlossom['condition'] {
  const { qualityScore } = blossom
  if (qualityScore >= 80) return 'cherry-blossom-avenue'
  if (qualityScore >= 65) return 'tulip-field'
  if (qualityScore >= 50) return 'wildflower-meadow'
  if (qualityScore >= 35) return 'garden-bed'
  if (qualityScore >= 20) return 'window-box'
  return 'compost'
}

// ─── Blossom Analysis ───────────────────────────────────────────────────────

/** @example analyzeSpringBlossom(content, filePath) returns full blossom */
export function analyzeSpringBlossom(content: string, filePath: string): SpringBlossom {
  const bud = measureBud(content)
  const blossom = measureBlossom(content)
  const root = measureRoot(content)
  const pollination = measurePollination(content)
  const adaptation = measureAdaptation(content)
  const health = measureHealth(content)

  const budVitality = bud.vitality
  const blossomQuality = blossom.quality
  const rootDepth = root.depth
  const pollinationRate = pollination.rate
  const seasonalAdaptation = adaptation.level
  const gardenHealth = health.score

  const qualityScore = Math.round(
    budVitality * 0.15 +
    blossomQuality * 0.15 +
    rootDepth * 0.15 +
    pollinationRate * 0.2 +
    seasonalAdaptation * 0.15 +
    gardenHealth * 0.2,
  )

  const result: SpringBlossom = {
    file: filePath,
    budVitality, blossomQuality, rootDepth, pollinationRate,
    seasonalAdaptation, gardenHealth,
    bud, blossom, root, pollination, adaptation, health,
    condition: 'compost',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Garden Analysis ────────────────────────────────────────────────────────

/** @example analyzeBloomGarden(blossoms, dirPath) returns garden */
export function analyzeBloomGarden(blossoms: SpringBlossom[], dirPath: string): BloomGarden {
  if (blossoms.length === 0) {
    return {
      directory: dirPath, blossoms: [], avgVitality: 0, avgQuality: 0, avgHealth: 0,
      cherryAvenueCount: 0, compostCount: 0, vitalCount: 0, healthyCount: 0,
      gardenType: 'wasteland', condition: 'parking-strip',
    }
  }

  const avgVitality = Math.round(blossoms.reduce((s, b) => s + b.budVitality, 0) / blossoms.length)
  const avgQuality = Math.round(blossoms.reduce((s, b) => s + b.blossomQuality, 0) / blossoms.length)
  const avgHealth = Math.round(blossoms.reduce((s, b) => s + b.gardenHealth, 0) / blossoms.length)

  const cherryAvenueCount = blossoms.filter((b) => b.condition === 'cherry-blossom-avenue').length
  const compostCount = blossoms.filter((b) => b.condition === 'compost').length
  const vitalCount = blossoms.filter((b) => b.bud.hasHighVitality).length
  const healthyCount = blossoms.filter((b) => b.health.hasGoodHealth).length

  const gardenType = classifyGardenType(blossoms)
  const avgScore = blossoms.reduce((s, b) => s + b.qualityScore, 0) / blossoms.length
  const condition = classifyGardenCondition(avgScore)

  return {
    directory: dirPath, blossoms, avgVitality, avgQuality, avgHealth,
    cherryAvenueCount, compostCount, vitalCount, healthyCount,
    gardenType, condition,
  }
}

// ─── Garden Classification ──────────────────────────────────────────────────

/** @example classifyGardenType(blossoms) returns garden type */
export function classifyGardenType(blossoms: SpringBlossom[]): BloomGarden['gardenType'] {
  if (blossoms.length === 0) return 'wasteland'
  const avgScore = blossoms.reduce((s, b) => s + b.qualityScore, 0) / blossoms.length
  const cherryCnt = blossoms.filter((b) => b.condition === 'cherry-blossom-avenue').length
  if (avgScore >= 75 && cherryCnt >= Math.ceil(blossoms.length * 0.3)) return 'botanical-garden'
  if (avgScore >= 60) return 'flower-field'
  if (avgScore >= 45) return 'cottage-garden'
  if (avgScore >= 30) return 'greenhouse'
  if (avgScore >= 15) return 'window-sill'
  return 'wasteland'
}

/** @example classifyGardenCondition(avgScore) returns condition */
export function classifyGardenCondition(avgScore: number): BloomGarden['condition'] {
  if (avgScore >= 80) return 'kensington-gardens'
  if (avgScore >= 65) return 'keukenhof'
  if (avgScore >= 50) return 'community-garden'
  if (avgScore >= 35) return 'backyard'
  if (avgScore >= 20) return 'planter'
  return 'parking-strip'
}

/** @example classifyGardenerGrade(avgBloom) returns grade */
export function classifyGardenerGrade(avgBloom: number): SpringBloomResult['stats']['gardenerGrade'] {
  if (avgBloom >= 80) return 'master-horticulturist'
  if (avgBloom >= 65) return 'head-gardener'
  if (avgBloom >= 50) return 'gardener'
  if (avgBloom >= 35) return 'green-thumb'
  if (avgBloom >= 20) return 'plant-owner'
  return 'concrete-lover'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(blossoms, gardens, meadow, stats) returns recommendations */
export function generateRecommendations(
  blossoms: SpringBlossom[],
  gardens: BloomGarden[],
  meadow: SpringBloomResult['meadow'],
  stats: SpringBloomResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgBudVitality < 50) recs.push('Boost bud vitality — nurture your code potential with proper structure')
  if (stats.avgBlossomQuality < 50) recs.push('Improve blossom quality — let your code bloom with clean execution')
  if (stats.avgRootDepth < 50) recs.push('Deepen root systems — build stronger code foundations')
  if (stats.avgPollinationRate < 50) recs.push('Increase pollination — make your code more reusable across modules')
  if (stats.avgSeasonalAdaptation < 50) recs.push('Enhance seasonal adaptation — make code flexible to changing requirements')
  if (stats.avgGardenHealth < 50) recs.push('Restore garden health — remove disease and pests from your codebase')
  if (stats.compostCount > blossoms.length * 0.5) recs.push('Too much compost — over half the codebase needs regeneration')
  if (stats.hasGoodHealthCount === 0) recs.push('No healthy growth found — tend your garden with care and patience')
  if (gardens.length > 0 && meadow.overallBloom < 60) recs.push('Meadow bloom is low — plant better seeds for a vibrant spring')
  if (recs.length === 0) recs.push('Spring is in full bloom — your code garden is a masterpiece of vitality and color')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildSpringBloomResult(files, contents, options) returns full result */
export function buildSpringBloomResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): SpringBloomResult {
  const blossoms: SpringBlossom[] = files.map((file, i) =>
    analyzeSpringBlossom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SpringBlossom[]>()
  for (const blossom of blossoms) {
    const dir = blossom.file.includes('/')
      ? blossom.file.substring(0, blossom.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(blossom)
    } else {
      dirMap.set(dir, [blossom])
    }
  }

  const gardens: BloomGarden[] = Array.from(dirMap.entries()).map(([dir, dirBlossoms]) =>
    analyzeBloomGarden(dirBlossoms, dir),
  )

  const avgVitality = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.budVitality, 0) / blossoms.length)
    : 0
  const avgQuality = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.blossomQuality, 0) / blossoms.length)
    : 0
  const avgHealth = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.gardenHealth, 0) / blossoms.length)
    : 0
  const overallBloom = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.qualityScore, 0) / blossoms.length)
    : 0
  const isFlourishing = overallBloom >= 65

  const meadow: SpringBloomResult['meadow'] = {
    avgVitality, avgQuality, avgHealth, isFlourishing, overallBloom,
  }

  const avgBudVitality = avgVitality
  const avgBlossomQuality = avgQuality
  const avgRootDepth = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.rootDepth, 0) / blossoms.length)
    : 0
  const avgPollinationRate = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.pollinationRate, 0) / blossoms.length)
    : 0
  const avgSeasonalAdaptation = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.seasonalAdaptation, 0) / blossoms.length)
    : 0
  const avgGardenHealth = avgHealth

  const conditionCounts = {
    cherryBlossomAvenue: 0, tulipField: 0, wildflowerMeadow: 0,
    gardenBed: 0, windowBox: 0, compost: 0,
  }
  for (const b of blossoms) {
    switch (b.condition) {
      case 'cherry-blossom-avenue': conditionCounts.cherryBlossomAvenue++; break
      case 'tulip-field': conditionCounts.tulipField++; break
      case 'wildflower-meadow': conditionCounts.wildflowerMeadow++; break
      case 'garden-bed': conditionCounts.gardenBed++; break
      case 'window-box': conditionCounts.windowBox++; break
      case 'compost': conditionCounts.compost++; break
    }
  }

  const hasHighVitalityCount = blossoms.filter((b) => b.bud.hasHighVitality).length
  const hasBeautifulBlossomCount = blossoms.filter((b) => b.blossom.hasBeautifulBlossom).length
  const hasDeepRootsCount = blossoms.filter((b) => b.root.hasDeepRoots).length
  const hasHighPollinationCount = blossoms.filter((b) => b.pollination.hasHighPollination).length
  const hasHighAdaptationCount = blossoms.filter((b) => b.adaptation.hasHighAdaptation).length
  const hasGoodHealthCount = blossoms.filter((b) => b.health.hasGoodHealth).length

  const bestBlossom = blossoms.length > 0
    ? blossoms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const mostVital = blossoms.length > 0
    ? blossoms.reduce((best, b) => b.budVitality > best.budVitality ? b : best).file
    : ''
  const mostBeautiful = blossoms.length > 0
    ? blossoms.reduce((best, b) => b.blossomQuality > best.blossomQuality ? b : best).file
    : ''
  const deepestRooted = blossoms.length > 0
    ? blossoms.reduce((best, b) => b.rootDepth > best.rootDepth ? b : best).file
    : ''
  const mostReusable = blossoms.length > 0
    ? blossoms.reduce((best, b) => b.pollinationRate > best.pollinationRate ? b : best).file
    : ''
  const healthiest = blossoms.length > 0
    ? blossoms.reduce((best, b) => b.gardenHealth > best.gardenHealth ? b : best).file
    : ''

  const gardenerGrade = classifyGardenerGrade(overallBloom)

  const stats: SpringBloomResult['stats'] = {
    totalFiles: files.length, totalGardens: gardens.length,
    avgBudVitality, avgBlossomQuality, avgRootDepth,
    avgPollinationRate, avgSeasonalAdaptation, avgGardenHealth,
    cherryBlossomAvenueCount: conditionCounts.cherryBlossomAvenue,
    tulipFieldCount: conditionCounts.tulipField,
    wildflowerMeadowCount: conditionCounts.wildflowerMeadow,
    gardenBedCount: conditionCounts.gardenBed,
    windowBoxCount: conditionCounts.windowBox,
    compostCount: conditionCounts.compost,
    hasHighVitalityCount, hasBeautifulBlossomCount, hasDeepRootsCount,
    hasHighPollinationCount, hasHighAdaptationCount, hasGoodHealthCount,
    overallBloom, gardenerGrade,
    bestBlossom, mostVital, mostBeautiful,
    deepestRooted, mostReusable, healthiest,
  }

  const recommendations = generateRecommendations(blossoms, gardens, meadow, stats)

  return { blossoms, gardens, meadow, stats, recommendations }
}
