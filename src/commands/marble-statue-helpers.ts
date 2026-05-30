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
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface FormMeasure {
  quality: number
  style: 'contrapposto' | 'classical' | 'renaissance' | 'baroque' | 'modern' | 'formless'
  hasBeautifulForm: boolean
  hasProperPose: boolean
  hasDynamicTension: boolean
  hasProperVolume: boolean
  hasNoImbalance: boolean
  hasSpatialAwareness: boolean
  hasProperSilhouette: boolean
  hasNoClutter: boolean
  hasGracefulLines: boolean
  hasNoAwkwardness: boolean
  imbalanceCount: number
  clutterCount: number
}

export interface ChiselMeasure {
  precision: number
  technique: 'subtraction' | 'pointing' | 'roughing' | 'rasping' | 'scratching' | 'smashing'
  hasHighPrecision: boolean
  hasCleanCuts: boolean
  hasNoChiselMarks: boolean
  hasProperDepth: boolean
  hasSharpEdges: boolean
  hasNoOvercutting: boolean
  hasNoUndercutting: boolean
  hasProperDetail: boolean
  hasNoGouging: boolean
  hasRefinedFinish: boolean
  gougeCount: number
  overcutCount: number
}

export interface SurfaceMeasure {
  finish: number
  quality: 'mirror-polish' | 'satin' | 'honed' | 'rubble' | 'rough' | 'raw'
  hasHighFinish: boolean
  hasSmoothSurface: boolean
  hasNoScratches: boolean
  hasProperLuster: boolean
  hasNoPitting: boolean
  hasUniformTexture: boolean
  hasProperSheen: boolean
  hasNoToolingMarks: boolean
  hasTranslucency: boolean
  hasNoVeining: boolean
  scratchCount: number
  pittingCount: number
}

export interface ProportionMeasure {
  harmony: number
  system: 'golden-ratio' | 'classical-canon' | 'renaissance-ideal' | 'modern-proportion' | 'approximate' | 'random'
  hasProperProportion: boolean
  hasGoldenSection: boolean
  hasProperScale: boolean
  hasNoDisproportion: boolean
  hasSymmetry: boolean
  hasProperRhythm: boolean
  hasNoElongation: boolean
  hasProperWeight: boolean
  hasNoCompression: boolean
  hasHumanScale: boolean
  disproportionCount: number
  compressionCount: number
}

export interface MaterialMeasure {
  quality: number
  type: 'carrara' | 'statuario' | 'calacatta' | 'thassos' | 'travertine' | 'concrete'
  hasHighQuality: boolean
  hasPureGrain: boolean
  hasNoFlaws: boolean
  hasProperVeining: boolean
  hasNoCracks: boolean
  hasProperDensity: boolean
  hasNoStaining: boolean
  hasTranslucence: boolean
  hasNoInclusions: boolean
  hasProperHardness: boolean
  flawCount: number
  inclusionCount: number
}

export interface MasteryMeasure {
  score: number
  level: 'michelangelo' | 'bernini' | 'rodin' | 'donatello' | 'student' | 'vandal'
  hasArtisticMastery: boolean
  hasVision: boolean
  hasExecution: boolean
  hasExpression: boolean
  hasNoAmateur: boolean
  hasTimelessQuality: boolean
  hasOriginalVoice: boolean
  hasNoDerivative: boolean
  hasProperRestraint: boolean
  hasNoOverworking: boolean
  amateurCount: number
  overworkingCount: number
}

export interface MarbleBlock {
  file: string
  sculpturalForm: number
  chiselPrecision: number
  surfaceFinish: number
  proportionalHarmony: number
  marbleQuality: number
  artisticMastery: number
  form: FormMeasure
  chisel: ChiselMeasure
  surface: SurfaceMeasure
  proportion: ProportionMeasure
  material: MaterialMeasure
  mastery: MasteryMeasure
  condition: 'david' | 'pieta' | 'venus' | 'kouros' | 'bust' | 'rubble'
  qualityScore: number
}

export interface SculptureGallery {
  directory: string
  blocks: MarbleBlock[]
  avgForm: number
  avgFinish: number
  avgMastery: number
  davidCount: number
  rubbleCount: number
  beautifulCount: number
  preciseCount: number
  galleryType: 'uffizi' | 'louvre' | 'met' | 'academy' | 'workshop' | 'quarry-floor'
  condition: 'world-museum' | 'national-gallery' | 'art-institute' | 'studio' | 'storage' | 'dumpster'
}

export interface MarbleStatueResult {
  blocks: MarbleBlock[]
  galleries: SculptureGallery[]
  studio: {
    avgForm: number
    avgFinish: number
    avgMastery: number
    isMasterwork: boolean
    overallMastery: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgSculpturalForm: number
    avgChiselPrecision: number
    avgSurfaceFinish: number
    avgProportionalHarmony: number
    avgMarbleQuality: number
    avgArtisticMastery: number
    davidCount: number
    pietaCount: number
    venusCount: number
    kourosCount: number
    bustCount: number
    rubbleCount: number
    hasBeautifulFormCount: number
    hasHighPrecisionCount: number
    hasHighFinishCount: number
    hasProperProportionCount: number
    hasHighQualityCount: number
    hasArtisticMasteryCount: number
    overallMastery: number
    sculptorGrade: 'divine-sculptor' | 'master-sculptor' | 'sculptor' | 'artisan' | 'apprentice' | 'vandal'
    bestBlock: string
    mostBeautiful: string
    mostPrecise: string
    bestPolished: string
    bestProportioned: string
    finestMarble: string
  }
  recommendations: string[]
}

// ─── Form Measurement ───────────────────────────────────────────────────────

/** @example measureForm(content) returns form analysis */
export function measureForm(content: string): FormMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
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
  if (jsdocCount > 0) quality += 10
  if (exportCount > 0) quality += 10
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 4
  if (genericsCount > 0) quality += 4
  if (privateCount === 0 && protectedCount === 0) quality += 3
  if (commentedCodeCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const imbalanceCount = privateCount + protectedCount
  const clutterCount = anyCount + consoleCount

  const hasBeautifulForm = quality >= 75 && hasStructure && hasTypes
  const hasProperPose = hasStructure && hasTypes && exportCount > 0
  const hasDynamicTension = hasStructure && hasTypes && hasFunctions
  const hasProperVolume = hasStructure && hasTypes && genericsCount > 0
  const hasNoImbalance = imbalanceCount === 0
  const hasSpatialAwareness = hasStructure && hasTypes && importCount > 0
  const hasProperSilhouette = hasStructure && hasTypes && hasFunctions
  const hasNoClutter = clutterCount === 0
  const hasGracefulLines = hasStructure && hasTypes && exportCount > 0
  const hasNoAwkwardness = deepNestedCount === 0 && commentedCodeCount === 0

  let style: FormMeasure['style'] = 'formless'
  if (hasBeautifulForm && hasNoImbalance && hasNoClutter && hasGracefulLines) style = 'contrapposto'
  else if (hasBeautifulForm && hasNoImbalance) style = 'classical'
  else if (hasBeautifulForm) style = 'renaissance'
  else if (hasDynamicTension && hasProperPose) style = 'baroque'
  else if (quality > 30) style = 'modern'

  return {
    quality, style, hasBeautifulForm, hasProperPose, hasDynamicTension,
    hasProperVolume, hasNoImbalance, hasSpatialAwareness, hasProperSilhouette,
    hasNoClutter, hasGracefulLines, hasNoAwkwardness, imbalanceCount, clutterCount,
  }
}

// ─── Chisel Measurement ────────────────────────────────────────────────────

/** @example measureChisel(content) returns chisel analysis */
export function measureChisel(content: string): ChiselMeasure {
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

  let precision = 25
  if (hasStructure) precision += 12
  if (hasTypes) precision += 12
  if (hasFunctions) precision += 10
  if (jsdocCount > 0) precision += 8
  if (genericsCount > 0) precision += 5
  if (exportCount > 0) precision += 5
  if (importCount > 0) precision += 5
  if (tryCatchCount > 0) precision += 5
  if (asyncCount > 0) precision += 3
  if (consoleCount === 0) precision += 4
  if (anyCount === 0) precision += 3
  if (deepNestedCount === 0) precision += 3
  precision = Math.min(100, Math.max(0, Math.round(precision)))

  const gougeCount = anyCount + todoCount
  const overcutCount = deepNestedCount

  const hasHighPrecision = precision >= 80 && hasStructure && hasTypes
  const hasCleanCuts = hasStructure && hasTypes && exportCount > 0
  const hasNoChiselMarks = todoCount === 0 && countCommentedCode(content) === 0
  const hasProperDepth = hasStructure && hasTypes && genericsCount > 0
  const hasSharpEdges = hasStructure && hasTypes && hasFunctions
  const hasNoOvercutting = deepNestedCount === 0
  const hasNoUndercutting = hasFunctions && exportCount > 0
  const hasProperDetail = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoGouging = gougeCount === 0
  const hasRefinedFinish = hasStructure && hasTypes && consoleCount === 0

  let technique: ChiselMeasure['technique'] = 'smashing'
  if (hasHighPrecision && hasNoGouging && hasNoOvercutting && hasProperDetail) technique = 'subtraction'
  else if (hasHighPrecision && hasNoGouging) technique = 'pointing'
  else if (hasHighPrecision) technique = 'roughing'
  else if (hasSharpEdges && hasCleanCuts) technique = 'rasping'
  else if (precision > 30) technique = 'scratching'

  return {
    precision, technique, hasHighPrecision, hasCleanCuts, hasNoChiselMarks,
    hasProperDepth, hasSharpEdges, hasNoOvercutting, hasNoUndercutting,
    hasProperDetail, hasNoGouging, hasRefinedFinish, gougeCount, overcutCount,
  }
}

// ─── Surface Measurement ───────────────────────────────────────────────────

/** @example measureSurface(content) returns surface analysis */
export function measureSurface(content: string): SurfaceMeasure {
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
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let finish = 20
  if (hasStructure) finish += 12
  if (hasTypes) finish += 12
  if (hasFunctions) finish += 10
  if (jsdocCount > 0) finish += 10
  if (genericsCount > 0) finish += 5
  if (exportCount > 0) finish += 5
  if (importCount > 0) finish += 5
  if (asyncCount > 0) finish += 3
  if (tryCatchCount > 0) finish += 8
  if (anyCount === 0) finish += 5
  if (consoleCount === 0) finish += 5
  finish = Math.min(100, Math.max(0, Math.round(finish)))

  const scratchCount = todoCount + deepNestedCount
  const pittingCount = anyCount + commentedCodeCount

  const hasHighFinish = finish >= 75 && hasStructure && hasTypes
  const hasSmoothSurface = hasStructure && hasTypes && hasFunctions
  const hasNoScratches = scratchCount === 0
  const hasProperLuster = jsdocCount > 0 && genericsCount > 0
  const hasNoPitting = pittingCount === 0
  const hasUniformTexture = consoleCount === 0 && commentedCodeCount === 0
  const hasProperSheen = hasStructure && hasTypes && exportCount > 0
  const hasNoToolingMarks = deepNestedCount === 0 && consoleCount === 0
  const hasTranslucency = hasStructure && hasTypes && genericsCount > 0
  const hasNoVeining = anyCount === 0 && todoCount === 0

  let surfaceQuality: SurfaceMeasure['quality'] = 'raw'
  if (hasHighFinish && hasNoScratches && hasNoPitting && hasNoToolingMarks) surfaceQuality = 'mirror-polish'
  else if (hasHighFinish && hasNoScratches) surfaceQuality = 'satin'
  else if (hasHighFinish) surfaceQuality = 'honed'
  else if (hasSmoothSurface && hasProperSheen) surfaceQuality = 'rubble'
  else if (finish > 30) surfaceQuality = 'rough'

  return {
    finish, quality: surfaceQuality, hasHighFinish, hasSmoothSurface,
    hasNoScratches, hasProperLuster, hasNoPitting, hasUniformTexture,
    hasProperSheen, hasNoToolingMarks, hasTranslucency, hasNoVeining,
    scratchCount, pittingCount,
  }
}

// ─── Proportion Measurement ────────────────────────────────────────────────

/** @example measureProportion(content) returns proportion analysis */
export function measureProportion(content: string): ProportionMeasure {
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
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let harmony = 20
  if (hasStructure) harmony += 12
  if (hasTypes) harmony += 12
  if (hasFunctions) harmony += 10
  if (jsdocCount > 0) harmony += 10
  if (genericsCount > 0) harmony += 5
  if (enumCount > 0) harmony += 5
  if (anyCount === 0) harmony += 8
  if (consoleCount === 0) harmony += 5
  if (todoCount === 0) harmony += 5
  if (deepNestedCount === 0) harmony += 8
  harmony = Math.min(100, Math.max(0, Math.round(harmony)))

  const disproportionCount = todoCount + commentedCodeCount
  const compressionCount = deepNestedCount + consoleCount

  const hasProperProportion = harmony >= 75 && hasStructure && hasTypes && anyCount === 0
  const hasGoldenSection = hasStructure && hasTypes && genericsCount > 0
  const hasProperScale = hasStructure && hasTypes && hasFunctions
  const hasNoDisproportion = disproportionCount === 0
  const hasSymmetry = exportCount > 0 && importCount > 0
  const hasProperRhythm = jsdocCount > 0 && genericsCount > 0
  const hasNoElongation = deepNestedCount === 0
  const hasProperWeight = hasStructure && hasTypes && exportCount > 0
  const hasNoCompression = compressionCount === 0
  const hasHumanScale = hasFunctions && exportCount > 0

  let system: ProportionMeasure['system'] = 'random'
  if (hasProperProportion && hasGoldenSection && hasSymmetry && hasNoDisproportion) system = 'golden-ratio'
  else if (hasProperProportion && hasGoldenSection) system = 'classical-canon'
  else if (hasProperProportion) system = 'renaissance-ideal'
  else if (hasProperScale && hasProperWeight) system = 'modern-proportion'
  else if (harmony > 30) system = 'approximate'

  return {
    harmony, system, hasProperProportion, hasGoldenSection, hasProperScale,
    hasNoDisproportion, hasSymmetry, hasProperRhythm, hasNoElongation,
    hasProperWeight, hasNoCompression, hasHumanScale, disproportionCount, compressionCount,
  }
}

// ─── Material Measurement ──────────────────────────────────────────────────

/** @example measureMaterial(content) returns material analysis */
export function measureMaterial(content: string): MaterialMeasure {
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
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 25
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (asyncCount > 0) quality += 3
  if (tryCatchCount > 0) quality += 8
  if (anyCount === 0) quality += 3
  if (consoleCount === 0) quality += 4
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const flawCount = anyCount + todoCount
  const inclusionCount = deepNestedCount

  const hasHighQuality = quality >= 80 && hasStructure && hasTypes
  const hasPureGrain = hasStructure && hasTypes && anyCount === 0
  const hasNoFlaws = flawCount === 0
  const hasProperVeining = hasStructure && hasTypes && genericsCount > 0
  const hasNoCracks = deepNestedCount === 0
  const hasProperDensity = hasStructure && hasTypes && hasFunctions
  const hasNoStaining = consoleCount === 0
  const hasTranslucence = tryCatchCount > 0 && asyncCount > 0
  const hasNoInclusions = inclusionCount === 0
  const hasProperHardness = hasStructure && hasTypes && exportCount > 0

  let materialType: MaterialMeasure['type'] = 'concrete'
  if (hasHighQuality && hasNoFlaws && hasNoInclusions && hasTranslucence) materialType = 'carrara'
  else if (hasHighQuality && hasNoFlaws) materialType = 'statuario'
  else if (hasHighQuality) materialType = 'calacatta'
  else if (hasProperDensity && hasProperHardness) materialType = 'thassos'
  else if (quality > 30) materialType = 'travertine'

  return {
    quality, type: materialType, hasHighQuality, hasPureGrain, hasNoFlaws,
    hasProperVeining, hasNoCracks, hasProperDensity, hasNoStaining,
    hasTranslucence, hasNoInclusions, hasProperHardness, flawCount, inclusionCount,
  }
}

// ─── Mastery Measurement ────────────────────────────────────────────────────

/** @example measureMastery(content) returns mastery analysis */
export function measureMastery(content: string): MasteryMeasure {
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
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let score = 25
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (reExportCount > 0) score += 5
  if (asyncCount > 0) score += 3
  if (tryCatchCount > 0) score += 5
  if (anyCount === 0) score += 3
  if (consoleCount === 0) score += 2
  score = Math.min(100, Math.max(0, Math.round(score)))

  const amateurCount = todoCount
  const overworkingCount = deepNestedCount

  const hasArtisticMastery = score >= 80 && hasStructure && hasTypes
  const hasVision = jsdocCount > 0 && genericsCount > 0
  const hasExecution = hasStructure && hasTypes && hasFunctions
  const hasExpression = hasStructure && hasTypes && consoleCount === 0
  const hasNoAmateur = amateurCount === 0
  const hasTimelessQuality = hasStructure && hasTypes && reExportCount > 0
  const hasOriginalVoice = enumCount_safe(content) > 0 || reExportCount > 0
  const hasNoDerivative = countCommentedCode(content) === 0
  const hasProperRestraint = hasFunctions && exportCount > 0
  const hasNoOverworking = deepNestedCount === 0 && consoleCount === 0

  let level: MasteryMeasure['level'] = 'vandal'
  if (hasArtisticMastery && hasNoAmateur && hasNoOverworking && hasTimelessQuality) level = 'michelangelo'
  else if (hasArtisticMastery && hasNoAmateur) level = 'bernini'
  else if (hasArtisticMastery) level = 'rodin'
  else if (hasExecution && hasExpression) level = 'donatello'
  else if (score > 30) level = 'student'

  return {
    score, level, hasArtisticMastery, hasVision, hasExecution,
    hasExpression, hasNoAmateur, hasTimelessQuality, hasOriginalVoice,
    hasNoDerivative, hasProperRestraint, hasNoOverworking, amateurCount, overworkingCount,
  }
}

function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(block) returns condition string */
export function classifyCondition(block: MarbleBlock): MarbleBlock['condition'] {
  const { qualityScore } = block
  if (qualityScore >= 80) return 'david'
  if (qualityScore >= 65) return 'pieta'
  if (qualityScore >= 50) return 'venus'
  if (qualityScore >= 35) return 'kouros'
  if (qualityScore >= 20) return 'bust'
  return 'rubble'
}

// ─── Block Analysis ─────────────────────────────────────────────────────────

/** @example analyzeMarbleBlock(content, filePath) returns full block */
export function analyzeMarbleBlock(content: string, filePath: string): MarbleBlock {
  const form = measureForm(content)
  const chisel = measureChisel(content)
  const surface = measureSurface(content)
  const proportion = measureProportion(content)
  const material = measureMaterial(content)
  const mastery = measureMastery(content)

  const sculpturalForm = form.quality
  const chiselPrecision = chisel.precision
  const surfaceFinish = surface.finish
  const proportionalHarmony = proportion.harmony
  const marbleQuality = material.quality
  const artisticMastery = mastery.score

  const qualityScore = Math.round(
    sculpturalForm * 0.15 +
    chiselPrecision * 0.15 +
    surfaceFinish * 0.15 +
    proportionalHarmony * 0.2 +
    marbleQuality * 0.15 +
    artisticMastery * 0.2,
  )

  const block: MarbleBlock = {
    file: filePath,
    sculpturalForm, chiselPrecision, surfaceFinish, proportionalHarmony,
    marbleQuality, artisticMastery,
    form, chisel, surface, proportion, material, mastery,
    condition: 'rubble',
    qualityScore,
  }

  block.condition = classifyCondition(block)

  return block
}

// ─── Gallery Analysis ───────────────────────────────────────────────────────

/** @example analyzeSculptureGallery(blocks, dirPath) returns gallery */
export function analyzeSculptureGallery(blocks: MarbleBlock[], dirPath: string): SculptureGallery {
  if (blocks.length === 0) {
    return {
      directory: dirPath, blocks: [], avgForm: 0, avgFinish: 0, avgMastery: 0,
      davidCount: 0, rubbleCount: 0, beautifulCount: 0, preciseCount: 0,
      galleryType: 'quarry-floor', condition: 'dumpster',
    }
  }

  const avgForm = Math.round(blocks.reduce((s, b) => s + b.sculpturalForm, 0) / blocks.length)
  const avgFinish = Math.round(blocks.reduce((s, b) => s + b.surfaceFinish, 0) / blocks.length)
  const avgMastery = Math.round(blocks.reduce((s, b) => s + b.artisticMastery, 0) / blocks.length)

  const davidCount = blocks.filter((b) => b.condition === 'david').length
  const rubbleCount = blocks.filter((b) => b.condition === 'rubble').length
  const beautifulCount = blocks.filter((b) => b.form.hasBeautifulForm).length
  const preciseCount = blocks.filter((b) => b.chisel.hasHighPrecision).length

  const galleryType = classifyGalleryType(blocks)
  const avgScore = blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length
  const condition = classifyGalleryCondition(avgScore)

  return {
    directory: dirPath, blocks, avgForm, avgFinish, avgMastery,
    davidCount, rubbleCount, beautifulCount, preciseCount,
    galleryType, condition,
  }
}

// ─── Gallery Classification ─────────────────────────────────────────────────

/** @example classifyGalleryType(blocks) returns gallery type */
export function classifyGalleryType(blocks: MarbleBlock[]): SculptureGallery['galleryType'] {
  if (blocks.length === 0) return 'quarry-floor'
  const avgScore = blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length
  const davidCnt = blocks.filter((b) => b.condition === 'david').length
  if (avgScore >= 75 && davidCnt >= Math.ceil(blocks.length * 0.3)) return 'uffizi'
  if (avgScore >= 60) return 'louvre'
  if (avgScore >= 45) return 'met'
  if (avgScore >= 30) return 'academy'
  if (avgScore >= 15) return 'workshop'
  return 'quarry-floor'
}

/** @example classifyGalleryCondition(avgScore) returns condition */
export function classifyGalleryCondition(avgScore: number): SculptureGallery['condition'] {
  if (avgScore >= 80) return 'world-museum'
  if (avgScore >= 65) return 'national-gallery'
  if (avgScore >= 50) return 'art-institute'
  if (avgScore >= 35) return 'studio'
  if (avgScore >= 20) return 'storage'
  return 'dumpster'
}

/** @example classifySculptorGrade(avgMastery) returns grade */
export function classifySculptorGrade(avgMastery: number): MarbleStatueResult['stats']['sculptorGrade'] {
  if (avgMastery >= 80) return 'divine-sculptor'
  if (avgMastery >= 65) return 'master-sculptor'
  if (avgMastery >= 50) return 'sculptor'
  if (avgMastery >= 35) return 'artisan'
  if (avgMastery >= 20) return 'apprentice'
  return 'vandal'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(blocks, galleries, studio, stats) returns recommendations */
export function generateRecommendations(
  blocks: MarbleBlock[],
  galleries: SculptureGallery[],
  studio: MarbleStatueResult['studio'],
  stats: MarbleStatueResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgSculpturalForm < 50) recs.push('Improve sculptural form — shape your code architecture with intention')
  if (stats.avgChiselPrecision < 50) recs.push('Refine chisel precision — make your code cuts cleaner and more precise')
  if (stats.avgSurfaceFinish < 50) recs.push('Polish surface finish — smooth out code roughness and imperfections')
  if (stats.avgProportionalHarmony < 50) recs.push('Balance proportional harmony — ensure code elements are in proper ratio')
  if (stats.avgMarbleQuality < 50) recs.push('Select better marble — improve the quality of your code material')
  if (stats.avgArtisticMastery < 50) recs.push('Develop artistic mastery — elevate code from craft to art')
  if (stats.rubbleCount > blocks.length * 0.5) recs.push('Too much rubble — over half the codebase is unfinished')
  if (stats.hasArtisticMasteryCount === 0) recs.push('No masterwork found — study the masters and practice your craft')
  if (galleries.length > 0 && studio.overallMastery < 60) recs.push('Studio mastery is low — patient chiseling recommended')
  if (recs.length === 0) recs.push('Masterwork achieved — your code stands like David in the Galleria dell\'Accademia')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildMarbleStatueResult(files, contents, options) returns full result */
export function buildMarbleStatueResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): MarbleStatueResult {
  const blocks: MarbleBlock[] = files.map((file, i) =>
    analyzeMarbleBlock(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, MarbleBlock[]>()
  for (const block of blocks) {
    const dir = block.file.includes('/')
      ? block.file.substring(0, block.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(block)
    } else {
      dirMap.set(dir, [block])
    }
  }

  const galleries: SculptureGallery[] = Array.from(dirMap.entries()).map(([dir, dirBlocks]) =>
    analyzeSculptureGallery(dirBlocks, dir),
  )

  const avgForm = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.sculpturalForm, 0) / blocks.length)
    : 0
  const avgFinish = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.surfaceFinish, 0) / blocks.length)
    : 0
  const avgMastery = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.artisticMastery, 0) / blocks.length)
    : 0
  const overallMastery = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length)
    : 0
  const isMasterwork = overallMastery >= 65

  const studio: MarbleStatueResult['studio'] = {
    avgForm, avgFinish, avgMastery, isMasterwork, overallMastery,
  }

  const avgSculpturalForm = avgForm
  const avgChiselPrecision = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.chiselPrecision, 0) / blocks.length)
    : 0
  const avgSurfaceFinish = avgFinish
  const avgProportionalHarmony = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.proportionalHarmony, 0) / blocks.length)
    : 0
  const avgMarbleQuality = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.marbleQuality, 0) / blocks.length)
    : 0
  const avgArtisticMastery = avgMastery

  const conditionCounts = {
    david: 0, pieta: 0, venus: 0, kouros: 0, bust: 0, rubble: 0,
  }
  for (const b of blocks) {
    switch (b.condition) {
      case 'david': conditionCounts.david++; break
      case 'pieta': conditionCounts.pieta++; break
      case 'venus': conditionCounts.venus++; break
      case 'kouros': conditionCounts.kouros++; break
      case 'bust': conditionCounts.bust++; break
      case 'rubble': conditionCounts.rubble++; break
    }
  }

  const hasBeautifulFormCount = blocks.filter((b) => b.form.hasBeautifulForm).length
  const hasHighPrecisionCount = blocks.filter((b) => b.chisel.hasHighPrecision).length
  const hasHighFinishCount = blocks.filter((b) => b.surface.hasHighFinish).length
  const hasProperProportionCount = blocks.filter((b) => b.proportion.hasProperProportion).length
  const hasHighQualityCount = blocks.filter((b) => b.material.hasHighQuality).length
  const hasArtisticMasteryCount = blocks.filter((b) => b.mastery.hasArtisticMastery).length

  const bestBlock = blocks.length > 0
    ? blocks.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const mostBeautiful = blocks.length > 0
    ? blocks.reduce((best, b) => b.sculpturalForm > best.sculpturalForm ? b : best).file
    : ''
  const mostPrecise = blocks.length > 0
    ? blocks.reduce((best, b) => b.chiselPrecision > best.chiselPrecision ? b : best).file
    : ''
  const bestPolished = blocks.length > 0
    ? blocks.reduce((best, b) => b.surfaceFinish > best.surfaceFinish ? b : best).file
    : ''
  const bestProportioned = blocks.length > 0
    ? blocks.reduce((best, b) => b.proportionalHarmony > best.proportionalHarmony ? b : best).file
    : ''
  const finestMarble = blocks.length > 0
    ? blocks.reduce((best, b) => b.marbleQuality > best.marbleQuality ? b : best).file
    : ''

  const sculptorGrade = classifySculptorGrade(overallMastery)

  const stats: MarbleStatueResult['stats'] = {
    totalFiles: files.length, totalGalleries: galleries.length,
    avgSculpturalForm, avgChiselPrecision, avgSurfaceFinish,
    avgProportionalHarmony, avgMarbleQuality, avgArtisticMastery,
    davidCount: conditionCounts.david, pietaCount: conditionCounts.pieta,
    venusCount: conditionCounts.venus, kourosCount: conditionCounts.kouros,
    bustCount: conditionCounts.bust, rubbleCount: conditionCounts.rubble,
    hasBeautifulFormCount, hasHighPrecisionCount, hasHighFinishCount,
    hasProperProportionCount, hasHighQualityCount, hasArtisticMasteryCount,
    overallMastery, sculptorGrade,
    bestBlock, mostBeautiful, mostPrecise, bestPolished, bestProportioned, finestMarble,
  }

  const recommendations = generateRecommendations(blocks, galleries, studio, stats)

  return { blocks, galleries, studio, stats, recommendations }
}
