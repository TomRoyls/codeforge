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
function countTemplateLiterals(content: string): number { return countMatches(content, STRING_TEMPLATE_REGEX) }
function countDestructures(content: string): number { return countMatches(content, DESTRUCTURE_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface PrecisionMeasure {
  level: number
  fold: 'triple-fold' | 'double-fold' | 'single-fold' | 'partial-fold' | 'crumple' | 'unfolded'
  hasPreciseFolds: boolean
  hasCleanCreases: boolean
  hasNoTearing: boolean
  hasProperAlignment: boolean
  hasSymmetry: boolean
  hasProperTension: boolean
  hasNoWrinkling: boolean
  hasSharpEdges: boolean
  hasNoBuckling: boolean
  hasProperAngle: boolean
  tearCount: number
  wrinkleCount: number
}

export interface PaperMeasure {
  quality: number
  material: 'washi' | 'kami' | 'tant' | 'kraft' | 'newsprint' | 'toilet-paper'
  hasHighQuality: boolean
  hasProperWeight: boolean
  hasProperTexture: boolean
  hasNoGrain: boolean
  hasGoodFolding: boolean
  hasProperSize: boolean
  hasNoDamage: boolean
  hasAcidFree: boolean
  hasProperOpacity: boolean
  hasArchival: boolean
  grainCount: number
  damageCount: number
}

export interface CreaseMeasure {
  accuracy: number
  type: 'mountain' | 'valley' | 'petal' | 'sink' | 'crimp' | 'none'
  hasAccurateCreases: boolean
  hasProperMountain: boolean
  hasProperValley: boolean
  hasNoMisfold: boolean
  hasReversible: boolean
  hasProperSquash: boolean
  hasNoOverfold: boolean
  hasProperPleat: boolean
  hasNoCollapse: boolean
  hasLockFold: boolean
  misfoldCount: number
  overfoldCount: number
}

export interface TransformationMeasure {
  beauty: number
  stage: 'wet-folding' | 'shaping' | 'collapsing' | 'pre-creasing' | 'base-fold' | 'raw-sheet'
  hasBeautifulTransformation: boolean
  hasDimensionalShift: boolean
  hasProperShaping: boolean
  hasNoDistortion: boolean
  hasOrganicForm: boolean
  hasMathematicalBeauty: boolean
  hasNoDeformation: boolean
  hasProperProportion: boolean
  hasCurves: boolean
  hasNoSharpCorners: boolean
  distortionCount: number
  sharpCornerCount: number
}

export interface StructureMeasure {
  integrity: number
  form: 'modular' | 'composite' | 'pureland' | 'action' | 'wet-folded' | 'collapsed'
  hasStrongStructure: boolean
  hasNoRipping: boolean
  hasProperLayering: boolean
  hasInterlocking: boolean
  hasNoGapping: boolean
  hasProperTension: boolean
  hasBoxPleating: boolean
  hasNoUnraveling: boolean
  hasCollapsibility: boolean
  hasNoWeakPoints: boolean
  gapCount: number
  weakPointCount: number
}

export interface MasteryMeasure {
  score: number
  level: 'grand-master' | 'master' | 'advanced' | 'intermediate' | 'beginner' | 'uninitiated'
  hasArtisticMastery: boolean
  hasYoshizawa: boolean
  hasCleanFinish: boolean
  hasProperDisplay: boolean
  hasNoAmateur: boolean
  hasFlowing: boolean
  hasMinimal: boolean
  hasExpressive: boolean
  hasNoOvercomplication: boolean
  hasTimeless: boolean
  amateurCount: number
  overcomplicationCount: number
}

export interface OrigamiModel {
  file: string
  foldingPrecision: number
  paperQuality: number
  creaseAccuracy: number
  transformationBeauty: number
  structuralIntegrity: number
  artisticMastery: number
  precision: PrecisionMeasure
  paper: PaperMeasure
  crease: CreaseMeasure
  transformation: TransformationMeasure
  structure: StructureMeasure
  mastery: MasteryMeasure
  condition: 'tanagra-masterpiece' | 'yoshizawa-grade' | 'exhibition-piece' | 'practice-sheet' | 'crumpled-ball' | 'confetti'
  qualityScore: number
}

export interface OrigamiGallery {
  directory: string
  models: OrigamiModel[]
  avgPrecision: number
  avgStructure: number
  avgMastery: number
  masterpieceCount: number
  confettiCount: number
  preciseCount: number
  masterCount: number
  galleryType: 'museum' | 'exhibition' | 'studio' | 'classroom' | 'playground' | 'recycling-bin'
  condition: 'world-exhibition' | 'national-gallery' | 'art-show' | 'craft-fair' | 'desk-drawer' | 'trash-can'
}

export interface OrigamiFoldResult {
  models: OrigamiModel[]
  galleries: OrigamiGallery[]
  exhibition: {
    avgPrecision: number
    avgStructure: number
    avgMastery: number
    isMasterwork: boolean
    overallElegance: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgFoldingPrecision: number
    avgPaperQuality: number
    avgCreaseAccuracy: number
    avgTransformationBeauty: number
    avgStructuralIntegrity: number
    avgArtisticMastery: number
    masterpieceCount: number
    yoshizawaCount: number
    exhibitionCount: number
    practiceCount: number
    crumpledCount: number
    confettiCount: number
    hasPreciseFoldsCount: number
    hasHighQualityCount: number
    hasAccurateCreasesCount: number
    hasBeautifulTransformationCount: number
    hasStrongStructureCount: number
    hasArtisticMasteryCount: number
    overallElegance: number
    artistGrade: 'living-treasure' | 'master-artist' | 'artist' | 'craftsman' | 'student' | 'paper-cutter'
    bestModel: string
    mostPrecise: string
    bestQuality: string
    mostAccurate: string
    mostBeautiful: string
    strongest: string
  }
  recommendations: string[]
}

// ─── Precision Measurement ──────────────────────────────────────────────────

/** @example measurePrecision(content) returns precision analysis */
export function measurePrecision(content: string): PrecisionMeasure {
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

  const tearCount = todoCount + commentedCodeCount
  const wrinkleCount = deepNestedCount + consoleCount

  const hasPreciseFolds = level >= 80 && hasStructure && hasTypes
  const hasCleanCreases = hasStructure && hasTypes && hasFunctions
  const hasNoTearing = tearCount === 0
  const hasProperAlignment = hasStructure && hasTypes && hasFunctions
  const hasSymmetry = hasStructure && hasTypes && exportCount > 0
  const hasProperTension = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasNoWrinkling = wrinkleCount === 0
  const hasSharpEdges = hasStructure && hasTypes && anyCount === 0
  const hasNoBuckling = deepNestedCount === 0
  const hasProperAngle = hasStructure && hasTypes && hasFunctions

  let fold: PrecisionMeasure['fold'] = 'unfolded'
  if (hasPreciseFolds && hasNoTearing && hasNoWrinkling && hasNoBuckling) fold = 'triple-fold'
  else if (hasPreciseFolds && hasNoTearing) fold = 'double-fold'
  else if (hasPreciseFolds) fold = 'single-fold'
  else if (hasCleanCreases) fold = 'partial-fold'
  else if (level > 30) fold = 'crumple'

  return {
    level,
    fold,
    hasPreciseFolds,
    hasCleanCreases,
    hasNoTearing,
    hasProperAlignment,
    hasSymmetry,
    hasProperTension,
    hasNoWrinkling,
    hasSharpEdges,
    hasNoBuckling,
    hasProperAngle,
    tearCount,
    wrinkleCount,
  }
}

// ─── Paper Measurement ──────────────────────────────────────────────────────

/** @example measurePaper(content) returns paper analysis */
export function measurePaper(content: string): PaperMeasure {
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
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const enumCount = countEnumKeywords(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (enumCount > 0) quality += 5
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (readonlyCount > 0) quality += 3
  if (privateCount > 0 || protectedCount > 0) quality += 3
  if (staticCount > 0) quality += 2
  if (asyncCount > 0) quality += 3
  if (anyCount === 0) quality += 3
  if (consoleCount === 0) quality += 4
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const grainCount = anyCount + consoleCount
  const damageCount = todoCount

  const hasHighQuality = quality >= 80 && hasStructure && hasTypes
  const hasProperWeight = hasStructure && hasTypes && hasFunctions
  const hasProperTexture = jsdocCount > 0 && exportCount > 0
  const hasNoGrain = grainCount === 0
  const hasGoodFolding = hasStructure && hasTypes && exportCount > 0
  const hasProperSize = hasStructure && hasTypes
  const hasNoDamage = damageCount === 0
  const hasAcidFree = anyCount === 0
  const hasProperOpacity = hasStructure && hasTypes && hasFunctions
  const hasArchival = hasHighQuality && hasNoGrain && hasNoDamage

  let material: PaperMeasure['material'] = 'toilet-paper'
  if (hasArchival && genericsCount > 0) material = 'washi'
  else if (hasHighQuality && hasNoGrain) material = 'kami'
  else if (hasHighQuality) material = 'tant'
  else if (hasProperWeight) material = 'kraft'
  else if (quality > 30) material = 'newsprint'

  return {
    quality,
    material,
    hasHighQuality,
    hasProperWeight,
    hasProperTexture,
    hasNoGrain,
    hasGoodFolding,
    hasProperSize,
    hasNoDamage,
    hasAcidFree,
    hasProperOpacity,
    hasArchival,
    grainCount,
    damageCount,
  }
}

// ─── Crease Measurement ─────────────────────────────────────────────────────

/** @example measureCrease(content) returns crease analysis */
export function measureCrease(content: string): CreaseMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
  const conditionalsCount = countConditionals(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let accuracy = 25
  if (hasStructure) accuracy += 12
  if (hasTypes) accuracy += 12
  if (hasFunctions) accuracy += 10
  if (jsdocCount > 0) accuracy += 8
  if (genericsCount > 0) accuracy += 5
  if (exportCount > 0) accuracy += 5
  if (importCount > 0) accuracy += 5
  if (tryCatchCount > 0) accuracy += 5
  if (asyncCount > 0) accuracy += 3
  if (conditionalsCount > 0) accuracy += 3
  if (consoleCount === 0) accuracy += 4
  if (anyCount === 0) accuracy += 3
  accuracy = Math.min(100, Math.max(0, Math.round(accuracy)))

  const misfoldCount = anyCount + todoCount
  const overfoldCount = deepNestedCount

  const hasAccurateCreases = accuracy >= 75 && hasStructure && hasTypes
  const hasProperMountain = hasStructure && hasTypes && hasFunctions
  const hasProperValley = hasStructure && hasTypes && exportCount > 0
  const hasNoMisfold = misfoldCount === 0
  const hasReversible = tryCatchCount > 0
  const hasProperSquash = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasNoOverfold = deepNestedCount === 0
  const hasProperPleat = conditionalsCount > 0 && countLoops(content) > 0
  const hasNoCollapse = consoleCount === 0
  const hasLockFold = privateCount > 0 || protectedCount > 0

  let creaseType: CreaseMeasure['type'] = 'none'
  if (hasAccurateCreases && hasNoMisfold && hasNoOverfold) creaseType = 'mountain'
  else if (hasAccurateCreases && hasNoMisfold) creaseType = 'valley'
  else if (hasAccurateCreases) creaseType = 'petal'
  else if (hasProperMountain) creaseType = 'sink'
  else if (accuracy > 30) creaseType = 'crimp'

  return {
    accuracy,
    type: creaseType,
    hasAccurateCreases,
    hasProperMountain,
    hasProperValley,
    hasNoMisfold,
    hasReversible,
    hasProperSquash,
    hasNoOverfold,
    hasProperPleat,
    hasNoCollapse,
    hasLockFold,
    misfoldCount,
    overfoldCount,
  }
}

// ─── Transformation Measurement ─────────────────────────────────────────────

/** @example measureTransformation(content) returns transformation analysis */
export function measureTransformation(content: string): TransformationMeasure {
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
  const deepNestedCount = countDeepNested(content)
  const destructures = countDestructures(content)
  const templateLiterals = countTemplateLiterals(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let beauty = 20
  if (hasStructure) beauty += 12
  if (hasTypes) beauty += 12
  if (hasFunctions) beauty += 10
  if (jsdocCount > 0) beauty += 5
  if (genericsCount > 0) beauty += 5
  if (asyncCount > 0) beauty += 5
  if (exportCount > 0) beauty += 5
  if (importCount > 0) beauty += 5
  if (reExportCount > 0) beauty += 5
  if (destructures > 0) beauty += 3
  if (templateLiterals > 0) beauty += 3
  if (anyCount === 0) beauty += 3
  if (consoleCount === 0) beauty += 4
  beauty = Math.min(100, Math.max(0, Math.round(beauty)))

  const distortionCount = anyCount + consoleCount
  const sharpCornerCount = deepNestedCount

  const hasBeautifulTransformation = beauty >= 75 && hasStructure && hasTypes
  const hasDimensionalShift = genericsCount > 0 && (destructures > 0 || templateLiterals > 0)
  const hasProperShaping = hasStructure && hasTypes && exportCount > 0
  const hasNoDistortion = distortionCount === 0
  const hasOrganicForm = hasStructure && hasTypes && hasFunctions
  const hasMathematicalBeauty = genericsCount > 0 && hasStructure && hasTypes
  const hasNoDeformation = deepNestedCount === 0
  const hasProperProportion = hasStructure && hasTypes && hasFunctions
  const hasCurves = destructures > 0 || templateLiterals > 0
  const hasNoSharpCorners = deepNestedCount === 0

  let stage: TransformationMeasure['stage'] = 'raw-sheet'
  if (hasBeautifulTransformation && hasDimensionalShift && hasNoDistortion && hasNoDeformation) stage = 'wet-folding'
  else if (hasBeautifulTransformation && hasDimensionalShift && hasNoDistortion) stage = 'shaping'
  else if (hasBeautifulTransformation && hasDimensionalShift) stage = 'collapsing'
  else if (hasBeautifulTransformation) stage = 'pre-creasing'
  else if (hasProperShaping) stage = 'base-fold'

  return {
    beauty,
    stage,
    hasBeautifulTransformation,
    hasDimensionalShift,
    hasProperShaping,
    hasNoDistortion,
    hasOrganicForm,
    hasMathematicalBeauty,
    hasNoDeformation,
    hasProperProportion,
    hasCurves,
    hasNoSharpCorners,
    distortionCount,
    sharpCornerCount,
  }
}

// ─── Structure Measurement ──────────────────────────────────────────────────

/** @example measureStructure(content) returns structure analysis */
export function measureStructure(content: string): StructureMeasure {
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

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let integrity = 25
  if (hasStructure) integrity += 12
  if (hasTypes) integrity += 12
  if (hasFunctions) integrity += 10
  if (jsdocCount > 0) integrity += 8
  if (genericsCount > 0) integrity += 5
  if (exportCount > 0) integrity += 5
  if (importCount > 0) integrity += 5
  if (reExportCount > 0) integrity += 5
  if (asyncCount > 0) integrity += 3
  if (tryCatchCount > 0) integrity += 5
  if (conditionalsCount > 0) integrity += 3
  if (loopsCount > 0) integrity += 2
  if (anyCount === 0) integrity += 3
  if (consoleCount === 0) integrity += 2
  integrity = Math.min(100, Math.max(0, Math.round(integrity)))

  const gapCount = todoCount + deepNestedCount
  const weakPointCount = anyCount + consoleCount

  const hasStrongStructure = integrity >= 75 && hasStructure && hasTypes
  const hasNoRipping = todoCount === 0
  const hasProperLayering = hasStructure && hasTypes && exportCount > 0
  const hasInterlocking = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasNoGapping = gapCount === 0
  const hasProperTension = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasBoxPleating = hasStructure && hasTypes && (conditionalsCount > 0 || loopsCount > 0)
  const hasNoUnraveling = deepNestedCount === 0
  const hasCollapsibility = hasStructure && hasTypes && hasFunctions
  const hasNoWeakPoints = weakPointCount === 0

  let form: StructureMeasure['form'] = 'collapsed'
  if (hasStrongStructure && hasInterlocking && hasNoGapping && hasNoWeakPoints) form = 'modular'
  else if (hasStrongStructure && hasInterlocking) form = 'composite'
  else if (hasStrongStructure) form = 'pureland'
  else if (hasProperLayering) form = 'action'
  else if (integrity > 30) form = 'wet-folded'

  return {
    integrity,
    form,
    hasStrongStructure,
    hasNoRipping,
    hasProperLayering,
    hasInterlocking,
    hasNoGapping,
    hasProperTension,
    hasBoxPleating,
    hasNoUnraveling,
    hasCollapsibility,
    hasNoWeakPoints,
    gapCount,
    weakPointCount,
  }
}

// ─── Mastery Measurement ────────────────────────────────────────────────────

/** @example measureMastery(content) returns mastery analysis */
export function measureMastery(content: string): MasteryMeasure {
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

  const amateurCount = consoleCount + deepNestedCount
  const overcomplicationCount = todoCount + commentedCodeCount

  const hasArtisticMastery = score >= 80 && anyCount === 0 && todoCount === 0
  const hasYoshizawa = hasStructure && hasTypes && genericsCount > 0 && jsdocCount > 0
  const hasCleanFinish = anyCount === 0 && consoleCount === 0
  const hasProperDisplay = jsdocCount > 0 && exportCount > 0
  const hasNoAmateur = amateurCount === 0
  const hasFlowing = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasMinimal = hasStructure && hasTypes && hasFunctions && deepNestedCount === 0
  const hasExpressive = hasStructure && hasTypes && genericsCount > 0
  const hasNoOvercomplication = overcomplicationCount === 0
  const hasTimeless = hasArtisticMastery && hasYoshizawa

  let masteryLevel: MasteryMeasure['level'] = 'uninitiated'
  if (hasArtisticMastery && hasTimeless) masteryLevel = 'grand-master'
  else if (hasArtisticMastery && hasYoshizawa) masteryLevel = 'master'
  else if (hasArtisticMastery) masteryLevel = 'advanced'
  else if (score >= 60 && hasStructure && hasTypes) masteryLevel = 'intermediate'
  else if (score > 30) masteryLevel = 'beginner'

  return {
    score,
    level: masteryLevel,
    hasArtisticMastery,
    hasYoshizawa,
    hasCleanFinish,
    hasProperDisplay,
    hasNoAmateur,
    hasFlowing,
    hasMinimal,
    hasExpressive,
    hasNoOvercomplication,
    hasTimeless,
    amateurCount,
    overcomplicationCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(model) returns condition string */
export function classifyCondition(model: OrigamiModel): OrigamiModel['condition'] {
  const { qualityScore } = model
  if (qualityScore >= 80) return 'tanagra-masterpiece'
  if (qualityScore >= 65) return 'yoshizawa-grade'
  if (qualityScore >= 50) return 'exhibition-piece'
  if (qualityScore >= 35) return 'practice-sheet'
  if (qualityScore >= 20) return 'crumpled-ball'
  return 'confetti'
}

// ─── Model Analysis ─────────────────────────────────────────────────────────

/** @example analyzeOrigamiModel(content, filePath) returns full model */
export function analyzeOrigamiModel(content: string, filePath: string): OrigamiModel {
  const precision = measurePrecision(content)
  const paper = measurePaper(content)
  const crease = measureCrease(content)
  const transformation = measureTransformation(content)
  const structure = measureStructure(content)
  const mastery = measureMastery(content)

  const foldingPrecision = precision.level
  const paperQuality = paper.quality
  const creaseAccuracy = crease.accuracy
  const transformationBeauty = transformation.beauty
  const structuralIntegrity = structure.integrity
  const artisticMastery = mastery.score

  const qualityScore = Math.round(
    foldingPrecision * 0.15 +
    paperQuality * 0.15 +
    creaseAccuracy * 0.2 +
    transformationBeauty * 0.15 +
    structuralIntegrity * 0.15 +
    artisticMastery * 0.2,
  )

  const model: OrigamiModel = {
    file: filePath,
    foldingPrecision,
    paperQuality,
    creaseAccuracy,
    transformationBeauty,
    structuralIntegrity,
    artisticMastery,
    precision,
    paper,
    crease,
    transformation,
    structure,
    mastery,
    condition: 'confetti',
    qualityScore,
  }

  model.condition = classifyCondition(model)

  return model
}

// ─── Gallery Analysis ───────────────────────────────────────────────────────

/** @example analyzeOrigamiGallery(models, dirPath) returns gallery */
export function analyzeOrigamiGallery(models: OrigamiModel[], dirPath: string): OrigamiGallery {
  if (models.length === 0) {
    return {
      directory: dirPath,
      models: [],
      avgPrecision: 0,
      avgStructure: 0,
      avgMastery: 0,
      masterpieceCount: 0,
      confettiCount: 0,
      preciseCount: 0,
      masterCount: 0,
      galleryType: 'recycling-bin',
      condition: 'trash-can',
    }
  }

  const avgPrecision = Math.round(models.reduce((s, m) => s + m.foldingPrecision, 0) / models.length)
  const avgStructure = Math.round(models.reduce((s, m) => s + m.structuralIntegrity, 0) / models.length)
  const avgMastery = Math.round(models.reduce((s, m) => s + m.artisticMastery, 0) / models.length)

  const masterpieceCount = models.filter((m) => m.condition === 'tanagra-masterpiece').length
  const confettiCount = models.filter((m) => m.condition === 'confetti').length
  const preciseCount = models.filter((m) => m.precision.hasPreciseFolds).length
  const masterCount = models.filter((m) => m.mastery.hasArtisticMastery).length

  const galleryType = classifyGalleryType(models)
  const avgQuality = models.reduce((s, m) => s + m.qualityScore, 0) / models.length
  const condition = classifyGalleryCondition(avgQuality)

  return {
    directory: dirPath,
    models,
    avgPrecision,
    avgStructure,
    avgMastery,
    masterpieceCount,
    confettiCount,
    preciseCount,
    masterCount,
    galleryType,
    condition,
  }
}

// ─── Gallery Classification ────────────────────────────────────────────────

/** @example classifyGalleryType(models) returns gallery type */
export function classifyGalleryType(models: OrigamiModel[]): OrigamiGallery['galleryType'] {
  if (models.length === 0) return 'recycling-bin'
  const avgQuality = models.reduce((s, m) => s + m.qualityScore, 0) / models.length
  const masterpieceCnt = models.filter((m) => m.condition === 'tanagra-masterpiece').length
  if (avgQuality >= 75 && masterpieceCnt >= Math.ceil(models.length * 0.3)) return 'museum'
  if (avgQuality >= 60) return 'exhibition'
  if (avgQuality >= 45) return 'studio'
  if (avgQuality >= 30) return 'classroom'
  if (avgQuality >= 15) return 'playground'
  return 'recycling-bin'
}

/** @example classifyGalleryCondition(avgQuality) returns condition */
export function classifyGalleryCondition(avgQuality: number): OrigamiGallery['condition'] {
  if (avgQuality >= 80) return 'world-exhibition'
  if (avgQuality >= 65) return 'national-gallery'
  if (avgQuality >= 50) return 'art-show'
  if (avgQuality >= 35) return 'craft-fair'
  if (avgQuality >= 20) return 'desk-drawer'
  return 'trash-can'
}

/** @example classifyArtistGrade(avgElegance) returns grade */
export function classifyArtistGrade(avgElegance: number): OrigamiFoldResult['stats']['artistGrade'] {
  if (avgElegance >= 80) return 'living-treasure'
  if (avgElegance >= 65) return 'master-artist'
  if (avgElegance >= 50) return 'artist'
  if (avgElegance >= 35) return 'craftsman'
  if (avgElegance >= 20) return 'student'
  return 'paper-cutter'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(models, galleries, exhibition, stats) returns recommendations */
export function generateRecommendations(
  models: OrigamiModel[],
  galleries: OrigamiGallery[],
  exhibition: OrigamiFoldResult['exhibition'],
  stats: OrigamiFoldResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgFoldingPrecision < 50) {
    recs.push('Improve folding precision — refactor code for cleaner structure')
  }
  if (stats.avgPaperQuality < 50) {
    recs.push('Upgrade paper quality — add more valuable code patterns')
  }
  if (stats.avgCreaseAccuracy < 50) {
    recs.push('Sharpen crease accuracy — improve code correctness and typing')
  }
  if (stats.avgTransformationBeauty < 50) {
    recs.push('Enhance transformation beauty — improve code interoperability')
  }
  if (stats.avgStructuralIntegrity < 50) {
    recs.push('Strengthen structural integrity — add error handling and organization')
  }
  if (stats.avgArtisticMastery < 50) {
    recs.push('Elevate artistic mastery — reduce technical debt and improve quality')
  }
  if (stats.confettiCount > models.length * 0.5) {
    recs.push('Too many confetti files — over half the codebase is poor quality')
  }
  if (stats.hasArtisticMasteryCount === 0) {
    recs.push('No masterfully elegant code found — strive for higher code quality')
  }
  if (galleries.length > 0 && exhibition.overallElegance < 60) {
    recs.push('Overall elegance is low — systematic improvement recommended')
  }
  if (recs.length === 0) {
    recs.push('Origami masterpiece — your code folds into breathtaking elegance')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildOrigamiFoldResult(files, contents, options) returns full result */
export function buildOrigamiFoldResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): OrigamiFoldResult {
  const models: OrigamiModel[] = files.map((file, i) =>
    analyzeOrigamiModel(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OrigamiModel[]>()
  for (const model of models) {
    const dir = model.file.includes('/')
      ? model.file.substring(0, model.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(model)
    } else {
      dirMap.set(dir, [model])
    }
  }

  const galleries: OrigamiGallery[] = Array.from(dirMap.entries()).map(([dir, dirModels]) =>
    analyzeOrigamiGallery(dirModels, dir),
  )

  const avgPrecision = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.foldingPrecision, 0) / models.length)
    : 0
  const avgStructure = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.structuralIntegrity, 0) / models.length)
    : 0
  const avgMastery = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.artisticMastery, 0) / models.length)
    : 0
  const overallElegance = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.qualityScore, 0) / models.length)
    : 0
  const isMasterwork = overallElegance >= 65

  const exhibition: OrigamiFoldResult['exhibition'] = {
    avgPrecision,
    avgStructure,
    avgMastery,
    isMasterwork,
    overallElegance,
  }

  const avgFoldingPrecision = avgPrecision
  const avgPaperQuality = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.paperQuality, 0) / models.length)
    : 0
  const avgCreaseAccuracy = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.creaseAccuracy, 0) / models.length)
    : 0
  const avgTransformationBeauty = models.length > 0
    ? Math.round(models.reduce((s, m) => s + m.transformationBeauty, 0) / models.length)
    : 0
  const avgStructuralIntegrity = avgStructure
  const avgArtisticMastery = avgMastery

  const conditionCounts = {
    masterpiece: 0,
    yoshizawa: 0,
    exhibitionPiece: 0,
    practice: 0,
    crumpled: 0,
    confetti: 0,
  }
  for (const m of models) {
    switch (m.condition) {
      case 'tanagra-masterpiece': conditionCounts.masterpiece++; break
      case 'yoshizawa-grade': conditionCounts.yoshizawa++; break
      case 'exhibition-piece': conditionCounts.exhibitionPiece++; break
      case 'practice-sheet': conditionCounts.practice++; break
      case 'crumpled-ball': conditionCounts.crumpled++; break
      case 'confetti': conditionCounts.confetti++; break
    }
  }

  const hasPreciseFoldsCount = models.filter((m) => m.precision.hasPreciseFolds).length
  const hasHighQualityCount = models.filter((m) => m.paper.hasHighQuality).length
  const hasAccurateCreasesCount = models.filter((m) => m.crease.hasAccurateCreases).length
  const hasBeautifulTransformationCount = models.filter((m) => m.transformation.hasBeautifulTransformation).length
  const hasStrongStructureCount = models.filter((m) => m.structure.hasStrongStructure).length
  const hasArtisticMasteryCount = models.filter((m) => m.mastery.hasArtisticMastery).length

  const bestModel = models.length > 0
    ? models.reduce((best, m) => m.qualityScore > best.qualityScore ? m : best).file
    : ''
  const mostPrecise = models.length > 0
    ? models.reduce((best, m) => m.foldingPrecision > best.foldingPrecision ? m : best).file
    : ''
  const bestQuality = models.length > 0
    ? models.reduce((best, m) => m.paperQuality > best.paperQuality ? m : best).file
    : ''
  const mostAccurate = models.length > 0
    ? models.reduce((best, m) => m.creaseAccuracy > best.creaseAccuracy ? m : best).file
    : ''
  const mostBeautiful = models.length > 0
    ? models.reduce((best, m) => m.transformationBeauty > best.transformationBeauty ? m : best).file
    : ''
  const strongest = models.length > 0
    ? models.reduce((best, m) => m.structuralIntegrity > best.structuralIntegrity ? m : best).file
    : ''

  const artistGrade = classifyArtistGrade(overallElegance)

  const stats: OrigamiFoldResult['stats'] = {
    totalFiles: files.length,
    totalGalleries: galleries.length,
    avgFoldingPrecision,
    avgPaperQuality,
    avgCreaseAccuracy,
    avgTransformationBeauty,
    avgStructuralIntegrity,
    avgArtisticMastery,
    masterpieceCount: conditionCounts.masterpiece,
    yoshizawaCount: conditionCounts.yoshizawa,
    exhibitionCount: conditionCounts.exhibitionPiece,
    practiceCount: conditionCounts.practice,
    crumpledCount: conditionCounts.crumpled,
    confettiCount: conditionCounts.confetti,
    hasPreciseFoldsCount,
    hasHighQualityCount,
    hasAccurateCreasesCount,
    hasBeautifulTransformationCount,
    hasStrongStructureCount,
    hasArtisticMasteryCount,
    overallElegance,
    artistGrade,
    bestModel,
    mostPrecise,
    bestQuality,
    mostAccurate,
    mostBeautiful,
    strongest,
  }

  const recommendations = generateRecommendations(models, galleries, exhibition, stats)

  return {
    models,
    galleries,
    exhibition,
    stats,
    recommendations,
  }
}
