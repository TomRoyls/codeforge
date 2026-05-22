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
const TERNARY_REGEX = /\?[^:]+:/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const RETURN_TYPE_REGEX = /\)\s*:\s*\w+/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const ERROR_THROW_REGEX = /\bthrow\s+/g
const PROMISE_REGEX = /\bPromise\b/g
const STRING_TEMPLATE_REGEX = /`[^`]*\$\{/g
const DESTRUCTURE_REGEX = /\{[^}]*\}\s*=/g
const DECORATOR_REGEX = /@\w+/g

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
function countTernaryOps(content: string): number { return countMatches(content, TERNARY_REGEX) }
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
function countErrorThrows(content: string): number { return countMatches(content, ERROR_THROW_REGEX) }
function countPromiseUsage(content: string): number { return countMatches(content, PROMISE_REGEX) }
function countTemplateLiterals(content: string): number { return countMatches(content, STRING_TEMPLATE_REGEX) }
function countDestructures(content: string): number { return countMatches(content, DESTRUCTURE_REGEX) }
function countDecorators(content: string): number { return countMatches(content, DECORATOR_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface PreservationMeasure {
  quality: number
  state: 'perfect-cast' | 'permineralized' | 'replaced' | 'compressed' | 'impression' | 'disintegrated'
  isWellPreserved: boolean
  hasCellularDetail: boolean
  hasBarkPreservation: boolean
  hasInternalStructure: boolean
  hasNoDecay: boolean
  hasNoCracking: boolean
  hasProperSolidification: boolean
  hasNoErosion: boolean
  hasVascularTissue: boolean
  hasNoWeathering: boolean
  decayCount: number
  erosionCount: number
}

export interface MineralMeasure {
  replacement: number
  type: 'quartz' | 'agate' | 'opal' | 'chalcedony' | 'calcite' | 'unmineralized'
  hasProperMineralization: boolean
  hasSilicaReplacement: boolean
  hasNoOverMineralization: boolean
  hasNoUnderMineralization: boolean
  hasProperCrystalStructure: boolean
  hasNoVoidSpaces: boolean
  hasColorBanding: boolean
  hasProperHardness: boolean
  hasNoFracturing: boolean
  hasGradualTransition: boolean
  voidCount: number
  fracturingCount: number
}

export interface RingsMeasure {
  structure: number
  count: number
  pattern: 'distinct' | 'visible' | 'faint' | 'compressed' | 'obliterated' | 'absent'
  hasClearHistory: boolean
  hasGrowthRings: boolean
  hasSeasonalVariation: boolean
  hasNoFalseRings: boolean
  hasHeartwood: boolean
  hasSapwood: boolean
  hasNoRot: boolean
  hasKnots: boolean
  hasBurl: boolean
  hasNoCompression: boolean
  falseRingCount: number
  rotCount: number
}

export interface ColorationMeasure {
  quality: number
  palette: 'rainbow' | 'vivid' | 'warm' | 'cool' | 'muted' | 'bleached'
  isColorful: boolean
  hasIronOxides: boolean
  hasManganese: boolean
  hasCopper: boolean
  hasNoBleaching: boolean
  hasNaturalPatina: boolean
  hasProperLuster: boolean
  hasNoDiscoloration: boolean
  hasTranslucency: boolean
  hasNoDulling: boolean
  bleachingCount: number
  dullingCount: number
}

export interface FossilMeasure {
  record: number
  completeness: 'complete' | 'partial-skeleton' | 'scattered-bones' | 'fragment' | 'trace' | 'none'
  hasCompleteDocumentation: boolean
  hasContextualInfo: boolean
  hasChronostratigraphy: boolean
  hasNoMissingSections: boolean
  hasProperCataloguing: boolean
  hasIndexFossils: boolean
  hasNoErosion: boolean
  hasTypeSpecimen: boolean
  hasNoContamination: boolean
  hasFieldNotes: boolean
  missingCount: number
  contaminationCount: number
}

export interface AgeMeasure {
  depth: number
  era: 'precambrian' | 'paleozoic' | 'mesozoic' | 'cenozoic' | 'pleistocene' | 'holocene'
  isMature: boolean
  hasGeologicalContext: boolean
  hasStratigraphicPosition: boolean
  hasNoAnachronism: boolean
  hasProperDating: boolean
  hasNoContamination: boolean
  hasEvolutionaryRecord: boolean
  hasExtinctionEvent: boolean
  hasNoGap: boolean
  hasMassAccumulation: boolean
  anachronismCount: number
  gapCount: number
}

export interface PetrifiedLog {
  file: string
  woodPreservation: number
  mineralReplacement: number
  ringStructure: number
  colorationQuality: number
  fossilRecord: number
  geologicalAge: number
  preservation: PreservationMeasure
  mineral: MineralMeasure
  rings: RingsMeasure
  coloration: ColorationMeasure
  fossil: FossilMeasure
  age: AgeMeasure
  condition: 'national-monument' | 'museum-piece' | 'specimen' | 'fragment' | 'shard' | 'dust'
  qualityScore: number
}

export interface FossilBed {
  directory: string
  logs: PetrifiedLog[]
  avgPreservation: number
  avgMineral: number
  avgAge: number
  monumentCount: number
  dustCount: number
  preservedCount: number
  matureCount: number
  bedType: 'national-park' | 'geological-reserve' | 'quarry' | 'roadside' | 'wasteland' | 'beach'
  condition: 'unesco-site' | 'protected-monument' | 'open-collection' | 'commercial-quarry' | 'scattered-debris' | 'eroded-plain'
}

export interface PetrifiedForestResult {
  logs: PetrifiedLog[]
  beds: FossilBed[]
  formation: {
    avgPreservation: number
    avgMineral: number
    avgAge: number
    isPreserved: boolean
    overallPreservation: number
  }
  stats: {
    totalFiles: number
    totalBeds: number
    avgWoodPreservation: number
    avgMineralReplacement: number
    avgRingStructure: number
    avgColorationQuality: number
    avgFossilRecord: number
    avgGeologicalAge: number
    nationalMonumentCount: number
    museumPieceCount: number
    specimenCount: number
    fragmentCount: number
    shardCount: number
    dustCount: number
    isWellPreservedCount: number
    hasProperMineralizationCount: number
    hasClearHistoryCount: number
    isColorfulCount: number
    hasCompleteDocumentationCount: number
    isMatureCount: number
    overallPreservation: number
    paleontologistGrade: 'curator' | 'paleontologist' | 'geologist' | 'collector' | 'rockhound' | 'tourist'
    bestLog: string
    bestPreserved: string
    bestMineralized: string
    oldestHistory: string
    mostColorful: string
    bestDocumented: string
  }
  recommendations: string[]
}

// ─── Preservation Measurement ───────────────────────────────────────────────

/** @example measurePreservation(content) returns preservation analysis */
export function measurePreservation(content: string): PreservationMeasure {
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

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0
  const promiseCount = countPromiseUsage(content)

  let quality = 25
  if (hasStructure) quality += 15
  if (hasTypes) quality += 15
  if (hasFunctions) quality += 10
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (jsdocCount > 0) quality += 8
  if (asyncCount > 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (anyCount === 0) quality += 4
  if (todoCount === 0) quality += 3
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const decayCount = todoCount + commentedCodeCount
  const erosionCount = consoleCount + anyCount

  const isWellPreserved = quality >= 80 && hasStructure && hasTypes
  const hasCellularDetail = hasStructure && hasTypes && hasFunctions
  const hasBarkPreservation = hasStructure && exportCount > 0
  const hasInternalStructure = hasStructure && hasTypes
  const hasNoDecay = decayCount === 0
  const hasNoCracking = deepNestedCount === 0
  const hasProperSolidification = hasStructure && hasTypes && hasFunctions
  const hasNoErosion = consoleCount === 0
  const hasVascularTissue = hasFunctions && (asyncCount > 0 || promiseCount > 0)
  const hasNoWeathering = anyCount === 0 && todoCount === 0

  let state: PreservationMeasure['state'] = 'disintegrated'
  if (isWellPreserved && hasCellularDetail && hasNoDecay && hasNoCracking) state = 'perfect-cast'
  else if (isWellPreserved && hasCellularDetail && hasNoDecay) state = 'permineralized'
  else if (isWellPreserved && hasCellularDetail) state = 'replaced'
  else if (isWellPreserved) state = 'compressed'
  else if (quality > 30) state = 'impression'

  return {
    quality,
    state,
    isWellPreserved,
    hasCellularDetail,
    hasBarkPreservation,
    hasInternalStructure,
    hasNoDecay,
    hasNoCracking,
    hasProperSolidification,
    hasNoErosion,
    hasVascularTissue,
    hasNoWeathering,
    decayCount,
    erosionCount,
  }
}

// ─── Mineral Measurement ────────────────────────────────────────────────────

/** @example measureMineral(content) returns mineral analysis */
export function measureMineral(content: string): MineralMeasure {
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
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let replacement = 25
  if (hasStructure) replacement += 12
  if (hasTypes) replacement += 12
  if (hasFunctions) replacement += 10
  if (jsdocCount > 0) replacement += 8
  if (genericsCount > 0) replacement += 5
  if (exportCount > 0) replacement += 5
  if (importCount > 0) replacement += 5
  if (reExportCount > 0) replacement += 5
  if (asyncCount > 0) replacement += 3
  if (tryCatchCount > 0) replacement += 5
  if (conditionalsCount > 0) replacement += 3
  if (loopsCount > 0) replacement += 2
  if (anyCount === 0) replacement += 3
  if (consoleCount === 0) replacement += 2
  replacement = Math.min(100, Math.max(0, Math.round(replacement)))

  const voidCount = deepNestedCount + todoCount
  const fracturingCount = anyCount + consoleCount

  const hasProperMineralization = replacement >= 75 && hasStructure && hasTypes
  const hasSilicaReplacement = hasStructure && hasTypes && genericsCount > 0
  const hasNoOverMineralization = voidCount === 0
  const hasNoUnderMineralization = fracturingCount === 0
  const hasProperCrystalStructure = hasStructure && hasTypes && hasFunctions
  const hasNoVoidSpaces = voidCount === 0
  const hasColorBanding = hasStructure && hasTypes && (privateCount > 0 || protectedCount > 0)
  const hasProperHardness = hasStructure && hasTypes && tryCatchCount > 0
  const hasNoFracturing = fracturingCount === 0
  const hasGradualTransition = exportCount > 0 && importCount > 0

  let type: MineralMeasure['type'] = 'unmineralized'
  if (hasProperMineralization && hasSilicaReplacement && hasNoOverMineralization && hasNoFracturing) type = 'quartz'
  else if (hasProperMineralization && hasSilicaReplacement) type = 'agate'
  else if (hasProperMineralization) type = 'opal'
  else if (replacement > 50) type = 'chalcedony'
  else if (replacement > 30) type = 'calcite'

  return {
    replacement,
    type,
    hasProperMineralization,
    hasSilicaReplacement,
    hasNoOverMineralization,
    hasNoUnderMineralization,
    hasProperCrystalStructure,
    hasNoVoidSpaces,
    hasColorBanding,
    hasProperHardness,
    hasNoFracturing,
    hasGradualTransition,
    voidCount,
    fracturingCount,
  }
}

// ─── Rings Measurement ──────────────────────────────────────────────────────

/** @example measureRings(content) returns rings analysis */
export function measureRings(content: string): RingsMeasure {
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
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let structure = 20
  if (hasStructure) structure += 12
  if (hasTypes) structure += 12
  if (enumCount > 0) structure += 5
  if (hasFunctions) structure += 10
  if (jsdocCount > 0) structure += 8
  if (genericsCount > 0) structure += 5
  if (asyncCount > 0) structure += 5
  if (tryCatchCount > 0) structure += 5
  if (exportCount > 0) structure += 5
  if (importCount > 0) structure += 5
  if (privateCount > 0 || protectedCount > 0) structure += 3
  if (staticCount > 0) structure += 3
  if (readonlyCount > 0) structure += 2
  if (anyCount === 0) structure += 3
  if (consoleCount === 0) structure += 3
  structure = Math.min(100, Math.max(0, Math.round(structure)))

  const count = classCount + interfaceCount + typeCount + enumCount + functionCount + arrowCount

  const falseRingCount = anyCount + consoleCount
  const rotCount = todoCount + deepNestedCount

  const hasClearHistory = structure >= 75 && hasStructure && hasTypes
  const hasGrowthRings = hasFunctions && exportCount > 0
  const hasSeasonalVariation = hasFunctions && (asyncCount > 0 || genericsCount > 0)
  const hasNoFalseRings = falseRingCount === 0
  const hasHeartwood = hasStructure && hasTypes && (privateCount > 0 || protectedCount > 0)
  const hasSapwood = hasFunctions && exportCount > 0 && importCount > 0
  const hasNoRot = rotCount === 0
  const hasKnots = hasStructure && hasTypes && jsdocCount > 0
  const hasBurl = hasStructure && hasTypes && hasFunctions && genericsCount > 0
  const hasNoCompression = falseRingCount === 0

  let pattern: RingsMeasure['pattern'] = 'absent'
  if (hasClearHistory && hasGrowthRings && hasNoFalseRings && hasNoRot) pattern = 'distinct'
  else if (hasClearHistory && hasGrowthRings) pattern = 'visible'
  else if (hasClearHistory) pattern = 'faint'
  else if (structure >= 50) pattern = 'compressed'
  else if (structure >= 25) pattern = 'obliterated'

  return {
    structure,
    count,
    pattern,
    hasClearHistory,
    hasGrowthRings,
    hasSeasonalVariation,
    hasNoFalseRings,
    hasHeartwood,
    hasSapwood,
    hasNoRot,
    hasKnots,
    hasBurl,
    hasNoCompression,
    falseRingCount,
    rotCount,
  }
}

// ─── Coloration Measurement ─────────────────────────────────────────────────

/** @example measureColoration(content) returns coloration analysis */
export function measureColoration(content: string): ColorationMeasure {
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
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const asyncCount = countAsyncKeywords(content)
  const destructures = countDestructures(content)
  const decorators = countDecorators(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
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
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (readonlyCount > 0) quality += 3
  if (privateCount > 0 || protectedCount > 0) quality += 3
  if (staticCount > 0) quality += 2
  if (asyncCount > 0) quality += 3
  if (destructures > 0) quality += 2
  if (decorators > 0) quality += 2
  if (anyCount === 0) quality += 3
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const bleachingCount = consoleCount + commentedCodeCount
  const dullingCount = todoCount + anyCount

  const isColorful = quality >= 80 && anyCount === 0
  const hasIronOxides = hasStructure && hasTypes && jsdocCount > 0
  const hasManganese = hasStructure && hasTypes && genericsCount > 0
  const hasCopper = hasFunctions && asyncCount > 0
  const hasNoBleaching = bleachingCount === 0
  const hasNaturalPatina = hasStructure && hasTypes && exportCount > 0
  const hasProperLuster = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoDiscoloration = anyCount === 0
  const hasTranslucency = exportCount > 0 && importCount > 0
  const hasNoDulling = dullingCount === 0

  let palette: ColorationMeasure['palette'] = 'bleached'
  if (isColorful && hasIronOxides && hasManganese && hasCopper && hasNoBleaching) palette = 'rainbow'
  else if (hasIronOxides && hasManganese && hasCopper) palette = 'vivid'
  else if (hasIronOxides && hasNaturalPatina) palette = 'warm'
  else if (hasManganese && hasCopper) palette = 'cool'
  else if (quality > 30) palette = 'muted'

  return {
    quality,
    palette,
    isColorful,
    hasIronOxides,
    hasManganese,
    hasCopper,
    hasNoBleaching,
    hasNaturalPatina,
    hasProperLuster,
    hasNoDiscoloration,
    hasTranslucency,
    hasNoDulling,
    bleachingCount,
    dullingCount,
  }
}

// ─── Fossil Measurement ─────────────────────────────────────────────────────

/** @example measureFossil(content) returns fossil analysis */
export function measureFossil(content: string): FossilMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let record = 20
  if (hasStructure) record += 12
  if (hasTypes) record += 12
  if (hasFunctions) record += 10
  if (jsdocCount > 0) record += 15
  if (genericsCount > 0) record += 5
  if (exportCount > 0) record += 5
  if (importCount > 0) record += 5
  if (readonlyCount > 0) record += 3
  if (privateCount > 0 || protectedCount > 0) record += 3
  if (staticCount > 0) record += 2
  if (asyncCount > 0) record += 3
  if (tryCatchCount > 0) record += 5
  if (consoleCount === 0) record += 3
  if (anyCount === 0) record += 3
  record = Math.min(100, Math.max(0, Math.round(record)))

  const missingCount = commentedCodeCount + todoCount
  const contaminationCount = anyCount + consoleCount

  const hasCompleteDocumentation = record >= 75 && jsdocCount > 0 && hasTypes
  const hasContextualInfo = jsdocCount > 0
  const hasChronostratigraphy = hasStructure && hasTypes && exportCount > 0
  const hasNoMissingSections = missingCount === 0
  const hasProperCataloguing = hasStructure && hasTypes && exportCount > 0
  const hasIndexFossils = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoErosion = consoleCount === 0
  const hasTypeSpecimen = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0
  const hasNoContamination = contaminationCount === 0
  const hasFieldNotes = jsdocCount > 0

  let completeness: FossilMeasure['completeness'] = 'none'
  if (hasCompleteDocumentation && hasNoMissingSections && hasNoContamination) completeness = 'complete'
  else if (hasCompleteDocumentation && hasNoMissingSections) completeness = 'partial-skeleton'
  else if (hasCompleteDocumentation) completeness = 'scattered-bones'
  else if (jsdocCount > 0) completeness = 'fragment'
  else if (record > 30) completeness = 'trace'

  return {
    record,
    completeness,
    hasCompleteDocumentation,
    hasContextualInfo,
    hasChronostratigraphy,
    hasNoMissingSections,
    hasProperCataloguing,
    hasIndexFossils,
    hasNoErosion,
    hasTypeSpecimen,
    hasNoContamination,
    hasFieldNotes,
    missingCount,
    contaminationCount,
  }
}

// ─── Age Measurement ────────────────────────────────────────────────────────

/** @example measureAge(content) returns age analysis */
export function measureAge(content: string): AgeMeasure {
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
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let depth = 20
  if (hasStructure) depth += 12
  if (hasTypes) depth += 12
  if (enumCount > 0) depth += 5
  if (hasFunctions) depth += 10
  if (jsdocCount > 0) depth += 8
  if (genericsCount > 0) depth += 5
  if (asyncCount > 0) depth += 5
  if (tryCatchCount > 0) depth += 5
  if (exportCount > 0) depth += 5
  if (importCount > 0) depth += 5
  if (privateCount > 0 || protectedCount > 0) depth += 3
  if (staticCount > 0) depth += 3
  if (readonlyCount > 0) depth += 2
  if (anyCount === 0) depth += 3
  if (consoleCount === 0) depth += 3
  depth = Math.min(100, Math.max(0, Math.round(depth)))

  const anachronismCount = anyCount + consoleCount
  const gapCount = deepNestedCount + todoCount

  const isMature = depth >= 80 && anyCount === 0 && todoCount === 0
  const hasGeologicalContext = hasStructure && hasTypes
  const hasStratigraphicPosition = hasStructure && hasTypes && exportCount > 0
  const hasNoAnachronism = anachronismCount === 0
  const hasProperDating = hasStructure && hasTypes && hasFunctions
  const hasNoContamination = anyCount === 0 && consoleCount === 0
  const hasEvolutionaryRecord = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasExtinctionEvent = tryCatchCount > 0
  const hasNoGap = gapCount === 0
  const hasMassAccumulation = hasStructure && hasTypes && exportCount > 0 && importCount > 0

  let era: AgeMeasure['era'] = 'holocene'
  if (isMature && hasGeologicalContext && hasNoAnachronism && hasNoGap) era = 'precambrian'
  else if (isMature && hasGeologicalContext) era = 'paleozoic'
  else if (hasGeologicalContext && hasStratigraphicPosition) era = 'mesozoic'
  else if (hasGeologicalContext) era = 'cenozoic'
  else if (depth > 30) era = 'pleistocene'

  return {
    depth,
    era,
    isMature,
    hasGeologicalContext,
    hasStratigraphicPosition,
    hasNoAnachronism,
    hasProperDating,
    hasNoContamination,
    hasEvolutionaryRecord,
    hasExtinctionEvent,
    hasNoGap,
    hasMassAccumulation,
    anachronismCount,
    gapCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(log) returns condition string */
export function classifyCondition(log: PetrifiedLog): PetrifiedLog['condition'] {
  const { qualityScore } = log
  if (qualityScore >= 80) return 'national-monument'
  if (qualityScore >= 65) return 'museum-piece'
  if (qualityScore >= 50) return 'specimen'
  if (qualityScore >= 35) return 'fragment'
  if (qualityScore >= 20) return 'shard'
  return 'dust'
}

// ─── Log Analysis ───────────────────────────────────────────────────────────

/** @example analyzePetrifiedLog(content, filePath) returns full log */
export function analyzePetrifiedLog(content: string, filePath: string): PetrifiedLog {
  const preservation = measurePreservation(content)
  const mineral = measureMineral(content)
  const rings = measureRings(content)
  const coloration = measureColoration(content)
  const fossil = measureFossil(content)
  const age = measureAge(content)

  const woodPreservation = preservation.quality
  const mineralReplacement = mineral.replacement
  const ringStructure = rings.structure
  const colorationQuality = coloration.quality
  const fossilRecord = fossil.record
  const geologicalAge = age.depth

  const qualityScore = Math.round(
    woodPreservation * 0.15 +
    mineralReplacement * 0.15 +
    ringStructure * 0.2 +
    colorationQuality * 0.15 +
    fossilRecord * 0.15 +
    geologicalAge * 0.2,
  )

  const log: PetrifiedLog = {
    file: filePath,
    woodPreservation,
    mineralReplacement,
    ringStructure,
    colorationQuality,
    fossilRecord,
    geologicalAge,
    preservation,
    mineral,
    rings,
    coloration,
    fossil,
    age,
    condition: 'dust',
    qualityScore,
  }

  log.condition = classifyCondition(log)

  return log
}

// ─── Bed Analysis ───────────────────────────────────────────────────────────

/** @example analyzeFossilBed(logs, dirPath) returns bed */
export function analyzeFossilBed(logs: PetrifiedLog[], dirPath: string): FossilBed {
  if (logs.length === 0) {
    return {
      directory: dirPath,
      logs: [],
      avgPreservation: 0,
      avgMineral: 0,
      avgAge: 0,
      monumentCount: 0,
      dustCount: 0,
      preservedCount: 0,
      matureCount: 0,
      bedType: 'beach',
      condition: 'eroded-plain',
    }
  }

  const avgPreservation = Math.round(logs.reduce((s, l) => s + l.woodPreservation, 0) / logs.length)
  const avgMineral = Math.round(logs.reduce((s, l) => s + l.mineralReplacement, 0) / logs.length)
  const avgAge = Math.round(logs.reduce((s, l) => s + l.geologicalAge, 0) / logs.length)

  const monumentCount = logs.filter((l) => l.condition === 'national-monument').length
  const dustCount = logs.filter((l) => l.condition === 'dust').length
  const preservedCount = logs.filter((l) => l.preservation.isWellPreserved).length
  const matureCount = logs.filter((l) => l.age.isMature).length

  const bedType = classifyBedType(logs)
  const avgQuality = logs.reduce((s, l) => s + l.qualityScore, 0) / logs.length
  const condition = classifyBedCondition(avgQuality)

  return {
    directory: dirPath,
    logs,
    avgPreservation,
    avgMineral,
    avgAge,
    monumentCount,
    dustCount,
    preservedCount,
    matureCount,
    bedType,
    condition,
  }
}

// ─── Bed Classification ─────────────────────────────────────────────────────

/** @example classifyBedType(logs) returns bed type */
export function classifyBedType(logs: PetrifiedLog[]): FossilBed['bedType'] {
  if (logs.length === 0) return 'beach'
  const avgQuality = logs.reduce((s, l) => s + l.qualityScore, 0) / logs.length
  const monumentCount = logs.filter((l) => l.condition === 'national-monument').length
  if (avgQuality >= 75 && monumentCount >= Math.ceil(logs.length * 0.3)) return 'national-park'
  if (avgQuality >= 60) return 'geological-reserve'
  if (avgQuality >= 45) return 'quarry'
  if (avgQuality >= 30) return 'roadside'
  if (avgQuality >= 15) return 'wasteland'
  return 'beach'
}

/** @example classifyBedCondition(avgQuality) returns condition */
export function classifyBedCondition(avgQuality: number): FossilBed['condition'] {
  if (avgQuality >= 80) return 'unesco-site'
  if (avgQuality >= 65) return 'protected-monument'
  if (avgQuality >= 50) return 'open-collection'
  if (avgQuality >= 35) return 'commercial-quarry'
  if (avgQuality >= 20) return 'scattered-debris'
  return 'eroded-plain'
}

/** @example classifyPaleontologistGrade(avgPreservation) returns grade */
export function classifyPaleontologistGrade(avgPreservation: number): PetrifiedForestResult['stats']['paleontologistGrade'] {
  if (avgPreservation >= 80) return 'curator'
  if (avgPreservation >= 65) return 'paleontologist'
  if (avgPreservation >= 50) return 'geologist'
  if (avgPreservation >= 35) return 'collector'
  if (avgPreservation >= 20) return 'rockhound'
  return 'tourist'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(logs, beds, formation, stats) returns recommendations */
export function generateRecommendations(
  logs: PetrifiedLog[],
  beds: FossilBed[],
  formation: PetrifiedForestResult['formation'],
  stats: PetrifiedForestResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgWoodPreservation < 50) {
    recs.push('Improve wood preservation — strengthen code structure and type safety')
  }
  if (stats.avgMineralReplacement < 50) {
    recs.push('Enhance mineral replacement — modernize code patterns and constructs')
  }
  if (stats.avgRingStructure < 50) {
    recs.push('Strengthen ring structure — build clearer code history and growth patterns')
  }
  if (stats.avgColorationQuality < 50) {
    recs.push('Improve coloration quality — add more diverse and polished code patterns')
  }
  if (stats.avgFossilRecord < 50) {
    recs.push('Boost fossil record — improve documentation completeness')
  }
  if (stats.avgGeologicalAge < 50) {
    recs.push('Deepen geological age — build more mature and battle-tested code')
  }
  if (stats.dustCount > logs.length * 0.5) {
    recs.push('Too much dust — over half the codebase is poorly preserved')
  }
  if (stats.isWellPreservedCount === 0) {
    recs.push('No well-preserved logs found — strive for better code preservation')
  }
  if (beds.length > 0 && formation.overallPreservation < 60) {
    recs.push('Overall preservation is low — systematic improvement recommended')
  }
  if (recs.length === 0) {
    recs.push('Outstanding petrified forest — your code is beautifully preserved for eternity')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildPetrifiedForestResult(files, contents, options) returns full result */
export function buildPetrifiedForestResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): PetrifiedForestResult {
  const logs: PetrifiedLog[] = files.map((file, i) =>
    analyzePetrifiedLog(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PetrifiedLog[]>()
  for (const log of logs) {
    const dir = log.file.includes('/')
      ? log.file.substring(0, log.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(log)
    } else {
      dirMap.set(dir, [log])
    }
  }

  const beds: FossilBed[] = Array.from(dirMap.entries()).map(([dir, dirLogs]) =>
    analyzeFossilBed(dirLogs, dir),
  )

  const avgPreservation = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.woodPreservation, 0) / logs.length)
    : 0
  const avgMineral = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.mineralReplacement, 0) / logs.length)
    : 0
  const avgAge = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.geologicalAge, 0) / logs.length)
    : 0
  const overallPreservation = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.qualityScore, 0) / logs.length)
    : 0
  const isPreserved = overallPreservation >= 65

  const formation: PetrifiedForestResult['formation'] = {
    avgPreservation,
    avgMineral,
    avgAge,
    isPreserved,
    overallPreservation,
  }

  const avgWoodPreservation = avgPreservation
  const avgMineralReplacement = avgMineral
  const avgRingStructure = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.ringStructure, 0) / logs.length)
    : 0
  const avgColorationQuality = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.colorationQuality, 0) / logs.length)
    : 0
  const avgFossilRecord = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + l.fossilRecord, 0) / logs.length)
    : 0
  const avgGeologicalAge = avgAge

  const conditionCounts = {
    nationalMonument: 0,
    museumPiece: 0,
    specimen: 0,
    fragment: 0,
    shard: 0,
    dust: 0,
  }
  for (const l of logs) {
    switch (l.condition) {
      case 'national-monument': conditionCounts.nationalMonument++; break
      case 'museum-piece': conditionCounts.museumPiece++; break
      case 'specimen': conditionCounts.specimen++; break
      case 'fragment': conditionCounts.fragment++; break
      case 'shard': conditionCounts.shard++; break
      case 'dust': conditionCounts.dust++; break
    }
  }

  const isWellPreservedCount = logs.filter((l) => l.preservation.isWellPreserved).length
  const hasProperMineralizationCount = logs.filter((l) => l.mineral.hasProperMineralization).length
  const hasClearHistoryCount = logs.filter((l) => l.rings.hasClearHistory).length
  const isColorfulCount = logs.filter((l) => l.coloration.isColorful).length
  const hasCompleteDocumentationCount = logs.filter((l) => l.fossil.hasCompleteDocumentation).length
  const isMatureCount = logs.filter((l) => l.age.isMature).length

  const bestLog = logs.length > 0
    ? logs.reduce((best, l) => l.qualityScore > best.qualityScore ? l : best).file
    : ''
  const bestPreserved = logs.length > 0
    ? logs.reduce((best, l) => l.woodPreservation > best.woodPreservation ? l : best).file
    : ''
  const bestMineralized = logs.length > 0
    ? logs.reduce((best, l) => l.mineralReplacement > best.mineralReplacement ? l : best).file
    : ''
  const oldestHistory = logs.length > 0
    ? logs.reduce((best, l) => l.ringStructure > best.ringStructure ? l : best).file
    : ''
  const mostColorful = logs.length > 0
    ? logs.reduce((best, l) => l.colorationQuality > best.colorationQuality ? l : best).file
    : ''
  const bestDocumented = logs.length > 0
    ? logs.reduce((best, l) => l.fossilRecord > best.fossilRecord ? l : best).file
    : ''

  const paleontologistGrade = classifyPaleontologistGrade(overallPreservation)

  const stats: PetrifiedForestResult['stats'] = {
    totalFiles: files.length,
    totalBeds: beds.length,
    avgWoodPreservation,
    avgMineralReplacement,
    avgRingStructure,
    avgColorationQuality,
    avgFossilRecord,
    avgGeologicalAge,
    nationalMonumentCount: conditionCounts.nationalMonument,
    museumPieceCount: conditionCounts.museumPiece,
    specimenCount: conditionCounts.specimen,
    fragmentCount: conditionCounts.fragment,
    shardCount: conditionCounts.shard,
    dustCount: conditionCounts.dust,
    isWellPreservedCount,
    hasProperMineralizationCount,
    hasClearHistoryCount,
    isColorfulCount,
    hasCompleteDocumentationCount,
    isMatureCount,
    overallPreservation,
    paleontologistGrade,
    bestLog,
    bestPreserved,
    bestMineralized,
    oldestHistory,
    mostColorful,
    bestDocumented,
  }

  const recommendations = generateRecommendations(logs, beds, formation, stats)

  return {
    logs,
    beds,
    formation,
    stats,
    recommendations,
  }
}
