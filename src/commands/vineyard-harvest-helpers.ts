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
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface RipenessMeasure {
  level: number
  stage: 'perfect-ripeness' | 'ripe' | 'veraison' | 'green' | 'unripe' | 'rotten'
  hasProperRipeness: boolean
  hasProperSugar: boolean
  hasProperAcid: boolean
  hasProperTannins: boolean
  hasNoOverripeness: boolean
  hasNoGreenPepper: boolean
  hasProperPhenolic: boolean
  hasEvenRipening: boolean
  hasNoSunburn: boolean
  hasProperSkin: boolean
  overripenessCount: number
  sunburnCount: number
}

export interface YieldMeasure {
  quality: number
  volume: 'abundant' | 'generous' | 'moderate' | 'light' | 'poor' | 'crop-failure'
  hasHighQuality: boolean
  hasConsistentQuality: boolean
  hasProperClusterSize: boolean
  hasNoMillerandage: boolean
  hasNoCoulure: boolean
  hasProperConcentration: boolean
  hasNoDilution: boolean
  hasCleanFruit: boolean
  hasNoBotrytis: boolean
  hasProperBunches: boolean
  millerandageCount: number
  coulureCount: number
}

export interface VintageMeasure {
  character: number
  year: 'legendary' | 'exceptional' | 'excellent' | 'good' | 'average' | 'poor'
  hasDistinctiveCharacter: boolean
  hasUniqueExpression: boolean
  hasProperComplexity: boolean
  hasNoBlandness: boolean
  hasMemorableQuality: boolean
  hasNoGeneric: boolean
  hasDepth: boolean
  hasNoOneDimensional: boolean
  hasProperFinish: boolean
  hasNoShortFinish: boolean
  blandCount: number
  genericCount: number
}

export interface BarrelMeasure {
  aging: number
  type: 'french-oak' | 'american-oak' | 'hungarian-oak' | 'stainless' | 'concrete' | 'plastic'
  hasProperRefinement: boolean
  hasSubtleComplexity: boolean
  hasNoOverOak: boolean
  hasNoOveroxidation: boolean
  hasProperMicrooxygenation: boolean
  hasNoVA: boolean
  hasProperToast: boolean
  hasNoTCA: boolean
  hasLees: boolean
  hasNoBrett: boolean
  overOakCount: number
  brettCount: number
}

export interface TerroirMeasure {
  expression: number
  region: 'bordeaux' | 'burgundy' | 'napa' | 'tuscany' | 'generic' | 'industrial'
  hasClearTerroir: boolean
  hasSoilExpression: boolean
  hasClimateExpression: boolean
  hasAspectExpression: boolean
  hasNoHomogenization: boolean
  hasProperMinerality: boolean
  hasNoManipulation: boolean
  hasAuthentic: boolean
  hasNoIndustrial: boolean
  hasSenseOfPlace: boolean
  homogenizationCount: number
  manipulationCount: number
}

export interface CellarMeasure {
  quality: number
  grade: 'first-growth' | 'grand-cru' | 'premier-cru' | 'village' | 'table-wine' | 'vinegar'
  hasHighQuality: boolean
  hasAgingPotential: boolean
  hasProperStructure: boolean
  hasNoFlaws: boolean
  hasCellarWorthy: boolean
  hasNoCorked: boolean
  hasProperBalance: boolean
  hasNoHeatDamage: boolean
  hasIntegration: boolean
  hasNoPremature: boolean
  flawCount: number
  corkedCount: number
}

export interface VineyardGrape {
  file: string
  grapeRipeness: number
  yieldQuality: number
  vintageCharacter: number
  barrelAging: number
  terroirExpression: number
  cellarQuality: number
  ripeness: RipenessMeasure
  yield: YieldMeasure
  vintage: VintageMeasure
  barrel: BarrelMeasure
  terroir: TerroirMeasure
  cellar: CellarMeasure
  condition: 'chateau-margaux' | 'romanee-conti' | 'opus-one' | 'chateau-neuf' | 'box-wine' | 'grape-juice'
  qualityScore: number
}

export interface VineyardBlock {
  directory: string
  grapes: VineyardGrape[]
  avgRipeness: number
  avgQuality: number
  avgVintage: number
  chateauCount: number
  grapeJuiceCount: number
  ripeCount: number
  highQualityCount: number
  blockType: 'grand-cru' | 'premier-cru' | 'village' | 'regional' | 'table' | 'wild'
  condition: 'first-growth-estate' | 'grand-cru-domaine' | 'family-winery' | 'cooperative' | 'bulk-producer' | 'vinegar-factory'
}

export interface VineyardHarvestResult {
  grapes: VineyardGrape[]
  blocks: VineyardBlock[]
  estate: {
    avgRipeness: number
    avgQuality: number
    avgVintage: number
    isExceptional: boolean
    overallQuality: number
  }
  stats: {
    totalFiles: number
    totalBlocks: number
    avgGrapeRipeness: number
    avgYieldQuality: number
    avgVintageCharacter: number
    avgBarrelAging: number
    avgTerroirExpression: number
    avgCellarQuality: number
    chateauMargauxCount: number
    romaneeContiCount: number
    opusOneCount: number
    chateauNeufCount: number
    boxWineCount: number
    grapeJuiceCount: number
    hasProperRipenessCount: number
    hasHighQualityCount: number
    hasDistinctiveCharacterCount: number
    hasProperRefinementCount: number
    hasClearTerroirCount: number
    hasHighQualityCellarCount: number
    overallQuality: number
    winemakerGrade: 'master-sommelier' | 'winemaker' | 'cellar-master' | 'viticulturist' | 'grape-picker' | 'grape-stomper'
    bestGrape: string
    ripest: string
    highestYield: string
    mostDistinctive: string
    mostRefined: string
    bestTerroir: string
  }
  recommendations: string[]
}

// ─── Ripeness Measurement ───────────────────────────────────────────────────

/** @example measureRipeness(content) returns ripeness analysis */
export function measureRipeness(content: string): RipenessMeasure {
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
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (exportCount > 0) level += 8
  if (importCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  if (privateCount === 0 && protectedCount === 0) level += 3
  level = Math.min(100, Math.max(0, Math.round(level)))

  const overripenessCount = privateCount + protectedCount
  const sunburnCount = consoleCount + anyCount

  const hasProperRipeness = level >= 75 && hasStructure && hasTypes
  const hasProperSugar = hasStructure && hasTypes && genericsCount > 0
  const hasProperAcid = anyCount === 0 && consoleCount === 0
  const hasProperTannins = hasStructure && hasTypes && hasFunctions
  const hasNoOverripeness = overripenessCount === 0
  const hasNoGreenPepper = deepNestedCount === 0
  const hasProperPhenolic = jsdocCount > 0 && genericsCount > 0
  const hasEvenRipening = exportCount > 0 && importCount > 0
  const hasNoSunburn = sunburnCount === 0
  const hasProperSkin = hasFunctions && exportCount > 0

  let stage: RipenessMeasure['stage'] = 'rotten'
  if (hasProperRipeness && hasNoOverripeness && hasNoSunburn && hasProperSugar) stage = 'perfect-ripeness'
  else if (hasProperRipeness && hasNoOverripeness) stage = 'ripe'
  else if (hasProperRipeness) stage = 'veraison'
  else if (hasProperTannins && exportCount > 0) stage = 'green'
  else if (level > 30) stage = 'unripe'

  return {
    level, stage, hasProperRipeness, hasProperSugar, hasProperAcid,
    hasProperTannins, hasNoOverripeness, hasNoGreenPepper, hasProperPhenolic,
    hasEvenRipening, hasNoSunburn, hasProperSkin, overripenessCount, sunburnCount,
  }
}

// ─── Yield Measurement ──────────────────────────────────────────────────────

/** @example measureYield(content) returns yield analysis */
export function measureYield(content: string): YieldMeasure {
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
  if (importCount > 0) quality += 5
  if (genericsCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (todoCount === 0) quality += 5
  if (commentedCodeCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const millerandageCount = todoCount + commentedCodeCount
  const coulureCount = consoleCount + anyCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes
  const hasConsistentQuality = hasStructure && hasTypes && exportCount > 0
  const hasProperClusterSize = hasStructure && hasTypes && hasFunctions
  const hasNoMillerandage = millerandageCount === 0
  const hasNoCoulure = coulureCount === 0
  const hasProperConcentration = hasStructure && hasTypes && genericsCount > 0
  const hasNoDilution = consoleCount === 0 && commentedCodeCount === 0
  const hasCleanFruit = anyCount === 0 && todoCount === 0
  const hasNoBotrytis = deepNestedCount(content) === 0
  const hasProperBunches = hasFunctions && exportCount > 0

  let volume: YieldMeasure['volume'] = 'crop-failure'
  if (hasHighQuality && hasNoMillerandage && hasNoCoulure && hasProperConcentration) volume = 'abundant'
  else if (hasHighQuality && hasNoMillerandage) volume = 'generous'
  else if (hasHighQuality) volume = 'moderate'
  else if (hasProperClusterSize && hasConsistentQuality) volume = 'light'
  else if (quality > 30) volume = 'poor'

  return {
    quality, volume, hasHighQuality, hasConsistentQuality, hasProperClusterSize,
    hasNoMillerandage, hasNoCoulure, hasProperConcentration, hasNoDilution,
    hasCleanFruit, hasNoBotrytis, hasProperBunches, millerandageCount, coulureCount,
  }
}

function deepNestedCount(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }

// ─── Vintage Measurement ────────────────────────────────────────────────────

/** @example measureVintage(content) returns vintage analysis */
export function measureVintage(content: string): VintageMeasure {
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
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount_val = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let character = 20
  if (hasStructure) character += 10
  if (hasTypes) character += 10
  if (hasFunctions) character += 10
  if (jsdocCount > 0) character += 8
  if (enumCount > 0) character += 5
  if (genericsCount > 0) character += 5
  if (exportCount > 0) character += 8
  if (importCount > 0) character += 5
  if (anyCount === 0) character += 5
  if (consoleCount === 0) character += 5
  if (deepNestedCount_val === 0) character += 5
  if (commentedCodeCount === 0) character += 4
  character = Math.min(100, Math.max(0, Math.round(character)))

  const blandCount = consoleCount + anyCount
  const genericCount = deepNestedCount_val + commentedCodeCount

  const hasDistinctiveCharacter = character >= 75 && hasStructure && hasTypes
  const hasUniqueExpression = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasProperComplexity = hasStructure && hasTypes && genericsCount > 0
  const hasNoBlandness = blandCount === 0
  const hasMemorableQuality = hasStructure && hasTypes && jsdocCount > 0
  const hasNoGeneric = genericCount === 0
  const hasDepth = hasStructure && hasTypes && hasFunctions
  const hasNoOneDimensional = importCount > 0 && exportCount > 0
  const hasProperFinish = hasFunctions && jsdocCount > 0
  const hasNoShortFinish = deepNestedCount_val === 0 && consoleCount === 0

  let vintageYear: VintageMeasure['year'] = 'poor'
  if (hasDistinctiveCharacter && hasNoBlandness && hasNoGeneric && hasUniqueExpression) vintageYear = 'legendary'
  else if (hasDistinctiveCharacter && hasNoBlandness) vintageYear = 'exceptional'
  else if (hasDistinctiveCharacter) vintageYear = 'excellent'
  else if (hasDepth && hasProperFinish) vintageYear = 'good'
  else if (character > 30) vintageYear = 'average'

  return {
    character, year: vintageYear, hasDistinctiveCharacter, hasUniqueExpression,
    hasProperComplexity, hasNoBlandness, hasMemorableQuality, hasNoGeneric,
    hasDepth, hasNoOneDimensional, hasProperFinish, hasNoShortFinish,
    blandCount, genericCount,
  }
}

// ─── Barrel Measurement ─────────────────────────────────────────────────────

/** @example measureBarrel(content) returns barrel analysis */
export function measureBarrel(content: string): BarrelMeasure {
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
  const todoCount = countTodoComments(content)
  const deepNestedCount_val = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let aging = 20
  if (hasStructure) aging += 12
  if (hasTypes) aging += 12
  if (hasFunctions) aging += 10
  if (jsdocCount > 0) aging += 8
  if (tryCatchCount > 0) aging += 8
  if (genericsCount > 0) aging += 5
  if (exportCount > 0) aging += 5
  if (importCount > 0) aging += 5
  if (asyncCount > 0) aging += 5
  if (anyCount === 0) aging += 5
  if (consoleCount === 0) aging += 5
  aging = Math.min(100, Math.max(0, Math.round(aging)))

  const overOakCount = todoCount + anyCount
  const brettCount = deepNestedCount_val

  const hasProperRefinement = aging >= 75 && hasStructure && hasTypes
  const hasSubtleComplexity = hasStructure && hasTypes && genericsCount > 0
  const hasNoOverOak = overOakCount === 0
  const hasNoOveroxidation = consoleCount === 0
  const hasProperMicrooxygenation = tryCatchCount > 0 && asyncCount > 0
  const hasNoVA = todoCount === 0
  const hasProperToast = hasStructure && hasTypes && exportCount > 0
  const hasNoTCA = anyCount === 0
  const hasLees = jsdocCount > 0 && genericsCount > 0
  const hasNoBrett = brettCount === 0

  let barrelType: BarrelMeasure['type'] = 'plastic'
  if (hasProperRefinement && hasNoOverOak && hasNoBrett && hasProperMicrooxygenation) barrelType = 'french-oak'
  else if (hasProperRefinement && hasNoOverOak) barrelType = 'american-oak'
  else if (hasProperRefinement) barrelType = 'hungarian-oak'
  else if (hasProperToast && hasSubtleComplexity) barrelType = 'stainless'
  else if (aging > 30) barrelType = 'concrete'

  return {
    aging, type: barrelType, hasProperRefinement, hasSubtleComplexity,
    hasNoOverOak, hasNoOveroxidation, hasProperMicrooxygenation, hasNoVA,
    hasProperToast, hasNoTCA, hasLees, hasNoBrett, overOakCount, brettCount,
  }
}

// ─── Terroir Measurement ────────────────────────────────────────────────────

/** @example measureTerroir(content) returns terroir analysis */
export function measureTerroir(content: string): TerroirMeasure {
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
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount_val = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let expression = 20
  if (hasStructure) expression += 10
  if (hasTypes) expression += 10
  if (hasFunctions) expression += 10
  if (jsdocCount > 0) expression += 8
  if (enumCount > 0) expression += 5
  if (genericsCount > 0) expression += 5
  if (exportCount > 0) expression += 8
  if (importCount > 0) expression += 5
  if (anyCount === 0) expression += 5
  if (consoleCount === 0) expression += 5
  if (deepNestedCount_val === 0) expression += 5
  if (commentedCodeCount === 0) expression += 4
  expression = Math.min(100, Math.max(0, Math.round(expression)))

  const homogenizationCount = consoleCount + anyCount
  const manipulationCount = todoCount + commentedCodeCount

  const hasClearTerroir = expression >= 75 && hasStructure && hasTypes
  const hasSoilExpression = hasStructure && hasTypes && genericsCount > 0
  const hasClimateExpression = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasAspectExpression = jsdocCount > 0 && genericsCount > 0
  const hasNoHomogenization = homogenizationCount === 0
  const hasProperMinerality = importCount > 0 && exportCount > 0
  const hasNoManipulation = manipulationCount === 0
  const hasAuthentic = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoIndustrial = deepNestedCount_val === 0 && commentedCodeCount === 0
  const hasSenseOfPlace = hasFunctions && exportCount > 0

  let region: TerroirMeasure['region'] = 'industrial'
  if (hasClearTerroir && hasNoHomogenization && hasNoManipulation && hasSoilExpression) region = 'bordeaux'
  else if (hasClearTerroir && hasNoHomogenization) region = 'burgundy'
  else if (hasClearTerroir) region = 'napa'
  else if (hasProperMinerality && hasAspectExpression) region = 'tuscany'
  else if (expression > 30) region = 'generic'

  return {
    expression, region, hasClearTerroir, hasSoilExpression, hasClimateExpression,
    hasAspectExpression, hasNoHomogenization, hasProperMinerality, hasNoManipulation,
    hasAuthentic, hasNoIndustrial, hasSenseOfPlace, homogenizationCount, manipulationCount,
  }
}

// ─── Cellar Measurement ─────────────────────────────────────────────────────

/** @example measureCellar(content) returns cellar analysis */
export function measureCellar(content: string): CellarMeasure {
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
  const deepNestedCount_val = countDeepNested(content)

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
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (todoCount === 0) quality += 5
  if (deepNestedCount_val === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const flawCount = anyCount + todoCount
  const corkedCount = deepNestedCount_val

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes
  const hasAgingPotential = hasStructure && hasTypes && reExportCount_safe(content) > 0
  const hasProperStructure = hasStructure && hasTypes && hasFunctions
  const hasNoFlaws = flawCount === 0
  const hasCellarWorthy = hasHighQuality && hasNoFlaws
  const hasNoCorked = corkedCount === 0
  const hasProperBalance = importCount > 0 && exportCount > 0
  const hasNoHeatDamage = consoleCount === 0
  const hasIntegration = hasFunctions && jsdocCount > 0
  const hasNoPremature = deepNestedCount_val === 0

  let grade: CellarMeasure['grade'] = 'vinegar'
  if (hasHighQuality && hasNoFlaws && hasNoCorked && hasAgingPotential) grade = 'first-growth'
  else if (hasHighQuality && hasNoFlaws) grade = 'grand-cru'
  else if (hasHighQuality) grade = 'premier-cru'
  else if (hasProperStructure && hasProperBalance) grade = 'village'
  else if (quality > 30) grade = 'table-wine'

  return {
    quality, grade, hasHighQuality, hasAgingPotential, hasProperStructure,
    hasNoFlaws, hasCellarWorthy, hasNoCorked, hasProperBalance, hasNoHeatDamage,
    hasIntegration, hasNoPremature, flawCount, corkedCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(grape) returns condition string */
export function classifyCondition(grape: VineyardGrape): VineyardGrape['condition'] {
  const { qualityScore } = grape
  if (qualityScore >= 80) return 'chateau-margaux'
  if (qualityScore >= 65) return 'romanee-conti'
  if (qualityScore >= 50) return 'opus-one'
  if (qualityScore >= 35) return 'chateau-neuf'
  if (qualityScore >= 20) return 'box-wine'
  return 'grape-juice'
}

// ─── Grape Analysis ─────────────────────────────────────────────────────────

/** @example analyzeVineyardGrape(content, filePath) returns full grape */
export function analyzeVineyardGrape(content: string, filePath: string): VineyardGrape {
  const ripeness = measureRipeness(content)
  const yieldMeasure = measureYield(content)
  const vintage = measureVintage(content)
  const barrel = measureBarrel(content)
  const terroir = measureTerroir(content)
  const cellar = measureCellar(content)

  const grapeRipeness = ripeness.level
  const yieldQuality = yieldMeasure.quality
  const vintageCharacter = vintage.character
  const barrelAging = barrel.aging
  const terroirExpression = terroir.expression
  const cellarQuality = cellar.quality

  const qualityScore = Math.round(
    grapeRipeness * 0.15 +
    yieldQuality * 0.15 +
    vintageCharacter * 0.15 +
    barrelAging * 0.2 +
    terroirExpression * 0.15 +
    cellarQuality * 0.2,
  )

  const result: VineyardGrape = {
    file: filePath,
    grapeRipeness, yieldQuality, vintageCharacter, barrelAging,
    terroirExpression, cellarQuality,
    ripeness, yield: yieldMeasure, vintage, barrel, terroir, cellar,
    condition: 'grape-juice',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Block Analysis ─────────────────────────────────────────────────────────

/** @example analyzeVineyardBlock(grapes, dirPath) returns block */
export function analyzeVineyardBlock(grapes: VineyardGrape[], dirPath: string): VineyardBlock {
  if (grapes.length === 0) {
    return {
      directory: dirPath, grapes: [], avgRipeness: 0, avgQuality: 0, avgVintage: 0,
      chateauCount: 0, grapeJuiceCount: 0, ripeCount: 0, highQualityCount: 0,
      blockType: 'wild', condition: 'vinegar-factory',
    }
  }

  const avgRipeness = Math.round(grapes.reduce((s, g) => s + g.grapeRipeness, 0) / grapes.length)
  const avgQuality = Math.round(grapes.reduce((s, g) => s + g.yieldQuality, 0) / grapes.length)
  const avgVintage = Math.round(grapes.reduce((s, g) => s + g.vintageCharacter, 0) / grapes.length)

  const chateauCount = grapes.filter((g) => g.condition === 'chateau-margaux').length
  const grapeJuiceCount = grapes.filter((g) => g.condition === 'grape-juice').length
  const ripeCount = grapes.filter((g) => g.ripeness.hasProperRipeness).length
  const highQualityCount = grapes.filter((g) => g.cellar.hasHighQuality).length

  const blockType = classifyBlockType(grapes)
  const avgScore = grapes.reduce((s, g) => s + g.qualityScore, 0) / grapes.length
  const condition = classifyBlockCondition(avgScore)

  return {
    directory: dirPath, grapes, avgRipeness, avgQuality, avgVintage,
    chateauCount, grapeJuiceCount, ripeCount, highQualityCount,
    blockType, condition,
  }
}

// ─── Block Classification ───────────────────────────────────────────────────

/** @example classifyBlockType(grapes) returns block type */
export function classifyBlockType(grapes: VineyardGrape[]): VineyardBlock['blockType'] {
  if (grapes.length === 0) return 'wild'
  const avgScore = grapes.reduce((s, g) => s + g.qualityScore, 0) / grapes.length
  const chateauCnt = grapes.filter((g) => g.condition === 'chateau-margaux').length
  if (avgScore >= 75 && chateauCnt >= Math.ceil(grapes.length * 0.3)) return 'grand-cru'
  if (avgScore >= 60) return 'premier-cru'
  if (avgScore >= 45) return 'village'
  if (avgScore >= 30) return 'regional'
  if (avgScore >= 15) return 'table'
  return 'wild'
}

/** @example classifyBlockCondition(avgScore) returns condition */
export function classifyBlockCondition(avgScore: number): VineyardBlock['condition'] {
  if (avgScore >= 80) return 'first-growth-estate'
  if (avgScore >= 65) return 'grand-cru-domaine'
  if (avgScore >= 50) return 'family-winery'
  if (avgScore >= 35) return 'cooperative'
  if (avgScore >= 20) return 'bulk-producer'
  return 'vinegar-factory'
}

/** @example classifyWinemakerGrade(avgQuality) returns grade */
export function classifyWinemakerGrade(avgQuality: number): VineyardHarvestResult['stats']['winemakerGrade'] {
  if (avgQuality >= 80) return 'master-sommelier'
  if (avgQuality >= 65) return 'winemaker'
  if (avgQuality >= 50) return 'cellar-master'
  if (avgQuality >= 35) return 'viticulturist'
  if (avgQuality >= 20) return 'grape-picker'
  return 'grape-stomper'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(grapes, blocks, estate, stats) returns recommendations */
export function generateRecommendations(
  grapes: VineyardGrape[],
  blocks: VineyardBlock[],
  estate: VineyardHarvestResult['estate'],
  stats: VineyardHarvestResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgGrapeRipeness < 50) recs.push('Improve grape ripeness — allow code to mature properly before harvest')
  if (stats.avgYieldQuality < 50) recs.push('Improve yield quality — focus on clean, consistent code output')
  if (stats.avgVintageCharacter < 50) recs.push('Enhance vintage character — develop distinctive code personality')
  if (stats.avgBarrelAging < 50) recs.push('Refine barrel aging — improve error handling and code refinement')
  if (stats.avgTerroirExpression < 50) recs.push('Express terroir — let your code foundation show its character')
  if (stats.avgCellarQuality < 50) recs.push('Improve cellar quality — eliminate flaws and build lasting quality')
  if (stats.grapeJuiceCount > grapes.length * 0.5) recs.push('Too much grape juice — over half the codebase is unfermented')
  if (stats.hasHighQualityCellarCount === 0) recs.push('No cellar-worthy code found — tend the vines with patience')
  if (blocks.length > 0 && estate.overallQuality < 60) recs.push('Estate quality is low — consult the master sommelier')
  if (recs.length === 0) recs.push('Exceptional vintage achieved — your cellar rivals Chateau Margaux')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildVineyardHarvestResult(files, contents, options) returns full result */
export function buildVineyardHarvestResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): VineyardHarvestResult {
  const grapes: VineyardGrape[] = files.map((file, i) =>
    analyzeVineyardGrape(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, VineyardGrape[]>()
  for (const grape of grapes) {
    const dir = grape.file.includes('/')
      ? grape.file.substring(0, grape.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(grape)
    } else {
      dirMap.set(dir, [grape])
    }
  }

  const blocks: VineyardBlock[] = Array.from(dirMap.entries()).map(([dir, dirGrapes]) =>
    analyzeVineyardBlock(dirGrapes, dir),
  )

  const avgRipeness = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.grapeRipeness, 0) / grapes.length)
    : 0
  const avgQuality = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.yieldQuality, 0) / grapes.length)
    : 0
  const avgVintage = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.vintageCharacter, 0) / grapes.length)
    : 0
  const overallQuality = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.qualityScore, 0) / grapes.length)
    : 0
  const isExceptional = overallQuality >= 65

  const estate: VineyardHarvestResult['estate'] = {
    avgRipeness, avgQuality, avgVintage, isExceptional, overallQuality,
  }

  const avgGrapeRipeness = avgRipeness
  const avgYieldQuality = avgQuality
  const avgVintageCharacter = avgVintage
  const avgBarrelAging = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.barrelAging, 0) / grapes.length)
    : 0
  const avgTerroirExpression = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.terroirExpression, 0) / grapes.length)
    : 0
  const avgCellarQuality = grapes.length > 0
    ? Math.round(grapes.reduce((s, g) => s + g.cellarQuality, 0) / grapes.length)
    : 0

  const conditionCounts = {
    chateauMargaux: 0, romaneeConti: 0, opusOne: 0,
    chateauNeuf: 0, boxWine: 0, grapeJuice: 0,
  }
  for (const g of grapes) {
    switch (g.condition) {
      case 'chateau-margaux': conditionCounts.chateauMargaux++; break
      case 'romanee-conti': conditionCounts.romaneeConti++; break
      case 'opus-one': conditionCounts.opusOne++; break
      case 'chateau-neuf': conditionCounts.chateauNeuf++; break
      case 'box-wine': conditionCounts.boxWine++; break
      case 'grape-juice': conditionCounts.grapeJuice++; break
    }
  }

  const hasProperRipenessCount = grapes.filter((g) => g.ripeness.hasProperRipeness).length
  const hasHighQualityCount = grapes.filter((g) => g.yield.hasHighQuality).length
  const hasDistinctiveCharacterCount = grapes.filter((g) => g.vintage.hasDistinctiveCharacter).length
  const hasProperRefinementCount = grapes.filter((g) => g.barrel.hasProperRefinement).length
  const hasClearTerroirCount = grapes.filter((g) => g.terroir.hasClearTerroir).length
  const hasHighQualityCellarCount = grapes.filter((g) => g.cellar.hasHighQuality).length

  const bestGrape = grapes.length > 0
    ? grapes.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file
    : ''
  const ripest = grapes.length > 0
    ? grapes.reduce((best, g) => g.grapeRipeness > best.grapeRipeness ? g : best).file
    : ''
  const highestYield = grapes.length > 0
    ? grapes.reduce((best, g) => g.yieldQuality > best.yieldQuality ? g : best).file
    : ''
  const mostDistinctive = grapes.length > 0
    ? grapes.reduce((best, g) => g.vintageCharacter > best.vintageCharacter ? g : best).file
    : ''
  const mostRefined = grapes.length > 0
    ? grapes.reduce((best, g) => g.barrelAging > best.barrelAging ? g : best).file
    : ''
  const bestTerroir = grapes.length > 0
    ? grapes.reduce((best, g) => g.terroirExpression > best.terroirExpression ? g : best).file
    : ''

  const winemakerGrade = classifyWinemakerGrade(overallQuality)

  const stats: VineyardHarvestResult['stats'] = {
    totalFiles: files.length, totalBlocks: blocks.length,
    avgGrapeRipeness, avgYieldQuality, avgVintageCharacter,
    avgBarrelAging, avgTerroirExpression, avgCellarQuality,
    chateauMargauxCount: conditionCounts.chateauMargaux,
    romaneeContiCount: conditionCounts.romaneeConti,
    opusOneCount: conditionCounts.opusOne,
    chateauNeufCount: conditionCounts.chateauNeuf,
    boxWineCount: conditionCounts.boxWine,
    grapeJuiceCount: conditionCounts.grapeJuice,
    hasProperRipenessCount, hasHighQualityCount, hasDistinctiveCharacterCount,
    hasProperRefinementCount, hasClearTerroirCount, hasHighQualityCellarCount,
    overallQuality, winemakerGrade,
    bestGrape, ripest, highestYield,
    mostDistinctive, mostRefined, bestTerroir,
  }

  const recommendations = generateRecommendations(grapes, blocks, estate, stats)

  return { grapes, blocks, estate, stats, recommendations }
}
