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
const GENERIC_CALL_REGEX = /\w+<[^>]+>/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const ERROR_THROW_REGEX = /\bthrow\s+/g
const PROMISE_REGEX = /\bPromise\b/g
const STRING_TEMPLATE_REGEX = /`[^`]*\$\{/g
const NULLABLE_REGEX = /[!?]\./g
const DECORATOR_REGEX = /@\w+/g
const DEFAULT_PARAM_REGEX = /\w+\s*=\s*[^,)]+/g
const REST_PARAM_REGEX = /\.\.\.\w+/g
const DESTRUCTURE_REGEX = /\{[^}]*\}\s*=/g
const AS_KEYWORD_REGEX = /\bas\b/g
const TYPE_ASSERTION_REGEX = /<\w+>/g
const METHOD_REGEX = /\b\w+\s*\([^)]*\)\s*[:{]/g
const RETURN_TYPE_REGEX = /\)\s*:\s*\w+/g
const CALLBACK_REGEX = /\w+\s*=>\s*\w+/g
const COGNITIVE_COMPLEXITY_REGEX = /\b(if|else|for|while|case|catch|&&|\|\||\?)/g

// ─── Helper Functions ───────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countExportKeywords(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countClassKeywords(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaceKeywords(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeKeywords(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countEnumKeywords(content: string): number {
  return countMatches(content, ENUM_REGEX)
}

function countFunctionKeywords(content: string): number {
  return countMatches(content, FUNCTION_REGEX)
}

function countArrowFunctions(content: string): number {
  return countMatches(content, ARROW_REGEX)
}

function countJSDocBlocks(content: string): number {
  return countMatches(content, JSDOC_REGEX)
}

function countAsyncKeywords(content: string): number {
  return countMatches(content, ASYNC_REGEX)
}

function countTryCatch(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

function countDeepNested(content: string): number {
  return countMatches(content, DEEP_NESTED_REGEX)
}

function countTernaryOps(content: string): number {
  return countMatches(content, TERNARY_REGEX)
}

function countConsoleUsage(content: string): number {
  return countMatches(content, CONSOLE_REGEX)
}

function countTodoComments(content: string): number {
  return countMatches(content, TODO_REGEX)
}

function countGenericsUsage(content: string): number {
  return countMatches(content, GENERICS_REGEX)
}

function countPrivateMembers(content: string): number {
  return countMatches(content, PRIVATE_REGEX)
}

function countProtectedMembers(content: string): number {
  return countMatches(content, PROTECTED_REGEX)
}

function countPublicMembers(content: string): number {
  return countMatches(content, PUBLIC_REGEX)
}

function countStaticMembers(content: string): number {
  return countMatches(content, STATIC_REGEX)
}

function countReadonlyMembers(content: string): number {
  return countMatches(content, READONLY_REGEX)
}

function countAnyUsage(content: string): number {
  return countMatches(content, ANY_REGEX)
}

function countCommentedCode(content: string): number {
  return countMatches(content, COMMENTED_CODE_REGEX)
}

function countReExports(content: string): number {
  return countMatches(content, REEXPORT_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, CONDITIONAL_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, LOOP_REGEX)
}

function countSwitchUsage(content: string): number {
  return countMatches(content, SWITCH_REGEX)
}

function countErrorThrows(content: string): number {
  return countMatches(content, ERROR_THROW_REGEX)
}

function countPromiseUsage(content: string): number {
  return countMatches(content, PROMISE_REGEX)
}

function countTemplateLiterals(content: string): number {
  return countMatches(content, STRING_TEMPLATE_REGEX)
}

function countCognitiveComplexity(content: string): number {
  return countMatches(content, COGNITIVE_COMPLEXITY_REGEX)
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface EdgeMeasure {
  sharpness: number
  grade: 'monomolecular' | 'surgical' | 'razor' | 'sharp' | 'dull' | 'broken'
  isMonoSharp: boolean
  hasCleanEdge: boolean
  hasNoMicroFractures: boolean
  hasProperBevel: boolean
  hasConsistentEdge: boolean
  hasNoChipping: boolean
  hasNoRounding: boolean
  hasMirrorFinish: boolean
  hasNoSubduction: boolean
  hasKeenPoint: boolean
  microFractureCount: number
  chipCount: number
}

export interface FractureMeasure {
  quality: number
  type: 'conchoidal' | 'hackly' | 'uneven' | 'splintery' | 'earthy' | 'none'
  hasCleanBreak: boolean
  hasConchoidalPattern: boolean
  hasRippleMarks: boolean
  hasNoIrregularBreak: boolean
  hasNoShattering: boolean
  hasPercussionBulb: boolean
  hasStriation: boolean
  hasNoHingeFracture: boolean
  hasProperFlake: boolean
  hasNoStepTermination: boolean
  shatterCount: number
  hingeCount: number
}

export interface PurityMeasure {
  level: number
  source: 'rhyolitic' | 'andesitic' | 'basaltic' | 'trachytic' | 'mixed' | 'contaminated'
  isPure: boolean
  hasNoInclusions: boolean
  hasNoCrystallites: boolean
  hasProperFlow: boolean
  hasNoDevitrification: boolean
  hasVitreous: boolean
  hasNoSpherulites: boolean
  hasProperComposition: boolean
  hasNoXenoliths: boolean
  hasHomogeneous: boolean
  inclusionCount: number
  xenolithCount: number
}

export interface BeautyMeasure {
  score: number
  color: 'midnight-black' | 'mahogany' | 'rainbow' | 'gold-sheen' | 'silver-sheen' | 'dull-gray'
  isBeautiful: boolean
  hasTranslucency: boolean
  hasChatoyance: boolean
  hasIridescence: boolean
  hasProperSheen: boolean
  hasNoImperfections: boolean
  hasGemQuality: boolean
  hasMuseumSpecimen: boolean
  hasNoClouding: boolean
  hasDepthPerception: boolean
  imperfectionCount: number
  cloudingCount: number
}

export interface PrecisionMeasure {
  level: number
  craft: 'surgeon' | 'master-knapper' | 'expert' | 'apprentice' | 'novice' | 'careless'
  hasSurgicalPrecision: boolean
  hasBifacialWork: boolean
  hasPressureFlaking: boolean
  hasNoOverworked: boolean
  hasProperRetouch: boolean
  hasPlatformPreparation: boolean
  hasNoHastyWork: boolean
  hasNoPlowMarks: boolean
  hasFineDetail: boolean
  hasNoCortex: boolean
  hastyCount: number
  plowMarkCount: number
}

export interface MasteryMeasure {
  score: number
  rank: 'master-bladesmith' | 'expert-knapper' | 'skilled-artisan' | 'apprentice' | 'beginner' | 'rock-thrower'
  isMasterwork: boolean
  hasCompleteTool: boolean
  hasHafting: boolean
  hasNoIncomplete: boolean
  hasProperWeight: boolean
  hasBalanced: boolean
  hasFunctional: boolean
  hasNoDefects: boolean
  hasProperUse: boolean
  hasNoDiscard: boolean
  incompleteCount: number
  discardCount: number
}

export interface ObsidianShard {
  file: string
  edgeSharpness: number
  fractureQuality: number
  volcanicPurity: number
  conchoidalBeauty: number
  surgicalPrecision: number
  bladeMastery: number
  edge: EdgeMeasure
  fracture: FractureMeasure
  purity: PurityMeasure
  beauty: BeautyMeasure
  precision: PrecisionMeasure
  mastery: MasteryMeasure
  condition: 'macuahuitl' | 'scalpel' | 'knife' | 'spear-point' | 'scraper' | 'gravel'
  qualityScore: number
}

export interface ObsidianCache {
  directory: string
  shards: ObsidianShard[]
  avgSharpness: number
  avgPurity: number
  avgMastery: number
  macuahuitlCount: number
  gravelCount: number
  monoSharpCount: number
  masterworkCount: number
  cacheType: 'temple-vault' | 'workshop' | 'quarry' | 'worksite' | 'midden' | 'talus'
  condition: 'armory' | 'toolkit' | 'collection' | 'workshop' | 'debris' | 'rubble'
}

export interface ObsidianBladeResult {
  shards: ObsidianShard[]
  caches: ObsidianCache[]
  quarry: {
    avgSharpness: number
    avgPurity: number
    avgMastery: number
    isMasterwork: boolean
    overallQuality: number
  }
  stats: {
    totalFiles: number
    totalCaches: number
    avgEdgeSharpness: number
    avgFractureQuality: number
    avgVolcanicPurity: number
    avgConchoidalBeauty: number
    avgSurgicalPrecision: number
    avgBladeMastery: number
    macuahuitlCount: number
    scalpelCount: number
    knifeCount: number
    spearPointCount: number
    scraperCount: number
    gravelCount: number
    isMonoSharpCount: number
    hasCleanBreakCount: number
    isPureCount: number
    isBeautifulCount: number
    hasSurgicalPrecisionCount: number
    isMasterworkCount: number
    overallQuality: number
    artisanGrade: 'master-artisan' | 'expert-flintknapper' | 'skilled-crafter' | 'apprentice' | 'novice' | 'clumsy'
    bestShard: string
    sharpest: string
    cleanest: string
    purest: string
    mostBeautiful: string
    mostPrecise: string
  }
  recommendations: string[]
}

// ─── Edge Measurement ───────────────────────────────────────────────────────

/** @example measureEdge(content) returns edge analysis */
export function measureEdge(content: string): EdgeMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const returnTypes = countMatches(content, RETURN_TYPE_REGEX)
  const methods = countMatches(content, METHOD_REGEX)
  const ternaryCount = countTernaryOps(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const anyCount = countAnyUsage(content)
  const commentedCodeCount = countCommentedCode(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  // Sharpness: how precise the code is
  let sharpness = 30
  if (hasStructure) sharpness += 15
  if (hasTypes) sharpness += 15
  if (hasFunctions) sharpness += 10
  if (exportCount > 0) sharpness += 5
  if (importCount > 0) sharpness += 5
  if (jsdocCount > 0) sharpness += 5
  if (genericsCount > 0) sharpness += 5
  if (readonlyCount > 0) sharpness += 3
  if (privateCount > 0 || protectedCount > 0) sharpness += 2
  if (returnTypes > 0) sharpness += 5
  sharpness = Math.min(100, Math.max(0, Math.round(sharpness)))

  const microFractureCount = ternaryCount + anyCount
  const chipCount = consoleCount + commentedCodeCount

  const hasCleanEdge = hasStructure && hasTypes && ternaryCount === 0
  const hasNoMicroFractures = anyCount === 0 && ternaryCount <= 2
  const hasProperBevel = exportCount > 0 && importCount > 0
  const hasConsistentEdge = hasFunctions && hasTypes
  const hasNoChipping = consoleCount === 0 && commentedCodeCount === 0
  const hasNoRounding = todoCount === 0 && deepNestedCount === 0
  const hasMirrorFinish = hasStructure && hasTypes && hasFunctions && jsdocCount > 0 && ternaryCount === 0 && anyCount === 0
  const hasNoSubduction = deepNestedCount === 0
  const hasKeenPoint = hasStructure && hasFunctions && methods > 0
  const isMonoSharp = sharpness >= 90 && hasMirrorFinish

  let grade: EdgeMeasure['grade'] = 'broken'
  if (isMonoSharp) grade = 'monomolecular'
  else if (sharpness >= 80) grade = 'surgical'
  else if (sharpness >= 65) grade = 'razor'
  else if (sharpness >= 45) grade = 'sharp'
  else if (sharpness >= 25) grade = 'dull'

  return {
    sharpness,
    grade,
    isMonoSharp,
    hasCleanEdge,
    hasNoMicroFractures,
    hasProperBevel,
    hasConsistentEdge,
    hasNoChipping,
    hasNoRounding,
    hasMirrorFinish,
    hasNoSubduction,
    hasKeenPoint,
    microFractureCount,
    chipCount,
  }
}

// ─── Fracture Measurement ───────────────────────────────────────────────────

/** @example measureFracture(content) returns fracture analysis */
export function measureFracture(content: string): FractureMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const errorThrowCount = countErrorThrows(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const deepNestedCount = countDeepNested(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const conditionalsCount = countConditionals(content)
  const loopsCount = countLoops(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0

  let quality = 25
  if (hasStructure) quality += 15
  if (hasTypes) quality += 15
  if (tryCatchCount > 0) quality += 10
  if (errorThrowCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (reExportCount > 0) quality += 5
  if (functionCount > 0) quality += 5
  if (conditionalsCount > 0) quality += 5
  if (loopsCount > 0) quality += 3
  if (anyCount === 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const shatterCount = deepNestedCount + consoleCount
  const hingeCount = anyCount + countTodoComments(content)

  const hasCleanBreak = hasStructure && hasTypes && tryCatchCount > 0
  const hasConchoidalPattern = hasStructure && hasTypes && exportCount > 0
  const hasRippleMarks = hasStructure && importCount > 0 && exportCount > 0
  const hasNoIrregularBreak = deepNestedCount === 0
  const hasNoShattering = shatterCount === 0
  const hasPercussionBulb = classCount > 0 && functionCount > 0
  const hasStriation = conditionalsCount > 0 && loopsCount > 0
  const hasNoHingeFracture = anyCount === 0 && countTodoComments(content) === 0
  const hasProperFlake = reExportCount > 0 || (exportCount > 0 && importCount > 0)
  const hasNoStepTermination = deepNestedCount === 0 && consoleCount === 0

  let type: FractureMeasure['type'] = 'none'
  if (hasCleanBreak && hasConchoidalPattern && hasRippleMarks && hasNoShattering) type = 'conchoidal'
  else if (hasCleanBreak && hasPercussionBulb) type = 'hackly'
  else if (hasCleanBreak) type = 'uneven'
  else if (hasPercussionBulb) type = 'splintery'
  else if (quality > 20) type = 'earthy'

  return {
    quality,
    type,
    hasCleanBreak,
    hasConchoidalPattern,
    hasRippleMarks,
    hasNoIrregularBreak,
    hasNoShattering,
    hasPercussionBulb,
    hasStriation,
    hasNoHingeFracture,
    hasProperFlake,
    hasNoStepTermination,
    shatterCount,
    hingeCount,
  }
}

// ─── Purity Measurement ─────────────────────────────────────────────────────

/** @example measurePurity(content) returns purity analysis */
export function measurePurity(content: string): PurityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const commentedCodeCount = countCommentedCode(content)
  const deepNestedCount = countDeepNested(content)
  const asyncCount = countAsyncKeywords(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const staticCount = countStaticMembers(content)
  const readonlyCount = countReadonlyMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0

  let level = 25
  if (hasStructure) level += 15
  if (hasTypes) level += 15
  if (enumCount > 0) level += 5
  if (hasFunctions) level += 10
  if (asyncCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (staticCount > 0) level += 3
  if (readonlyCount > 0) level += 2
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const inclusionCount = consoleCount + todoCount
  const xenolithCount = anyCount + commentedCodeCount

  const isPure = hasStructure && hasTypes && anyCount === 0 && consoleCount === 0
  const hasNoInclusions = consoleCount === 0 && todoCount === 0
  const hasNoCrystallites = deepNestedCount === 0
  const hasProperFlow = hasFunctions && importCount > 0
  const hasNoDevitrification = todoCount === 0
  const hasVitreous = hasStructure && hasTypes && anyCount === 0
  const hasNoSpherulites = deepNestedCount === 0 && anyCount === 0
  const hasProperComposition = exportCount > 0 && importCount > 0
  const hasNoXenoliths = anyCount === 0 && commentedCodeCount === 0
  const hasHomogeneous = hasStructure && hasTypes && hasFunctions

  let source: PurityMeasure['source'] = 'contaminated'
  if (isPure && hasHomogeneous) source = 'rhyolitic'
  else if (isPure) source = 'andesitic'
  else if (hasVitreous) source = 'basaltic'
  else if (hasNoInclusions) source = 'trachytic'
  else if (level > 25) source = 'mixed'

  return {
    level,
    source,
    isPure,
    hasNoInclusions,
    hasNoCrystallites,
    hasProperFlow,
    hasNoDevitrification,
    hasVitreous,
    hasNoSpherulites,
    hasProperComposition,
    hasNoXenoliths,
    hasHomogeneous,
    inclusionCount,
    xenolithCount,
  }
}

// ─── Beauty Measurement ─────────────────────────────────────────────────────

/** @example measureBeauty(content) returns beauty analysis */
export function measureBeauty(content: string): BeautyMeasure {
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
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const staticCount = countStaticMembers(content)
  const templateLiterals = countTemplateLiterals(content)
  const ternaryCount = countTernaryOps(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let score = 20
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (hasFunctions) score += 8
  if (jsdocCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (asyncCount > 0) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (privateCount > 0 || protectedCount > 0) score += 3
  if (readonlyCount > 0) score += 3
  if (staticCount > 0) score += 2
  if (templateLiterals > 0) score += 2
  if (anyCount === 0) score += 5
  if (consoleCount === 0) score += 5
  score = Math.min(100, Math.max(0, Math.round(score)))

  const imperfectionCount = ternaryCount + consoleCount + todoCount
  const cloudingCount = anyCount + deepNestedCount

  const isBeautiful = score >= 75
  const hasTranslucency = hasStructure && hasTypes && hasFunctions
  const hasChatoyance = genericsCount > 0 && asyncCount > 0
  const hasIridescence = privateCount > 0 && protectedCount > 0 && readonlyCount > 0
  const hasProperSheen = jsdocCount > 0 && exportCount > 0
  const hasNoImperfections = imperfectionCount === 0
  const hasGemQuality = score >= 85 && hasNoImperfections
  const hasMuseumSpecimen = score >= 90 && hasNoImperfections && cloudingCount === 0
  const hasNoClouding = cloudingCount === 0
  const hasDepthPerception = hasStructure && hasTypes && genericsCount > 0

  let color: BeautyMeasure['color'] = 'dull-gray'
  if (score >= 90) color = 'midnight-black'
  else if (score >= 80) color = 'rainbow'
  else if (score >= 70) color = 'gold-sheen'
  else if (score >= 55) color = 'silver-sheen'
  else if (score >= 40) color = 'mahogany'

  return {
    score,
    color,
    isBeautiful,
    hasTranslucency,
    hasChatoyance,
    hasIridescence,
    hasProperSheen,
    hasNoImperfections,
    hasGemQuality,
    hasMuseumSpecimen,
    hasNoClouding,
    hasDepthPerception,
    imperfectionCount,
    cloudingCount,
  }
}

// ─── Precision Measurement ──────────────────────────────────────────────────

/** @example measurePrecision(content) returns precision analysis */
export function measurePrecision(content: string): PrecisionMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const returnTypes = countMatches(content, RETURN_TYPE_REGEX)
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0

  let level = 25
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (tryCatchCount > 0) level += 5
  if (returnTypes > 0) level += 5
  if (readonlyCount > 0) level += 3
  if (privateCount > 0 || protectedCount > 0) level += 3
  if (staticCount > 0) level += 2
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const hastyCount = todoCount + consoleCount
  const plowMarkCount = deepNestedCount + commentedCodeCount

  const hasSurgicalPrecision = level >= 85 && anyCount === 0
  const hasBifacialWork = hasStructure && hasTypes
  const hasPressureFlaking = jsdocCount > 0 && genericsCount > 0
  const hasNoOverworked = deepNestedCount === 0 && genericsCount <= 10
  const hasProperRetouch = tryCatchCount > 0 && functionCount > 0
  const hasPlatformPreparation = importCount > 0 && exportCount > 0
  const hasNoHastyWork = todoCount === 0 && consoleCount === 0
  const hasNoPlowMarks = deepNestedCount === 0 && commentedCodeCount === 0
  const hasFineDetail = returnTypes > 0 && readonlyCount > 0
  const hasNoCortex = commentedCodeCount === 0

  let craft: PrecisionMeasure['craft'] = 'careless'
  if (hasSurgicalPrecision) craft = 'surgeon'
  else if (level >= 75) craft = 'master-knapper'
  else if (level >= 60) craft = 'expert'
  else if (level >= 45) craft = 'apprentice'
  else if (level >= 30) craft = 'novice'

  return {
    level,
    craft,
    hasSurgicalPrecision,
    hasBifacialWork,
    hasPressureFlaking,
    hasNoOverworked,
    hasProperRetouch,
    hasPlatformPreparation,
    hasNoHastyWork,
    hasNoPlowMarks,
    hasFineDetail,
    hasNoCortex,
    hastyCount,
    plowMarkCount,
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
  const hasErrorHandling = tryCatchCount > 0

  let score = 20
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (enumCount > 0) score += 5
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (asyncCount > 0) score += 5
  if (hasErrorHandling) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (privateCount > 0 || protectedCount > 0) score += 3
  if (staticCount > 0) score += 3
  if (readonlyCount > 0) score += 2
  if (anyCount === 0) score += 3
  if (consoleCount === 0) score += 2
  score = Math.min(100, Math.max(0, Math.round(score)))

  const incompleteCount = todoCount + deepNestedCount
  const discardCount = consoleCount + anyCount

  const isMasterwork = score >= 85 && anyCount === 0 && todoCount === 0
  const hasCompleteTool = hasStructure && hasTypes && hasFunctions
  const hasHafting = exportCount > 0 && importCount > 0
  const hasNoIncomplete = todoCount === 0
  const hasProperWeight = hasStructure && hasFunctions && !deepNestedCount
  const hasBalanced = hasStructure && hasTypes && hasFunctions && hasErrorHandling
  const hasFunctional = hasFunctions && exportCount > 0
  const hasNoDefects = consoleCount === 0 && anyCount === 0 && todoCount === 0
  const hasProperUse = jsdocCount > 0 && (privateCount > 0 || protectedCount > 0)
  const hasNoDiscard = consoleCount === 0 && anyCount === 0

  let rank: MasteryMeasure['rank'] = 'rock-thrower'
  if (isMasterwork && hasCompleteTool) rank = 'master-bladesmith'
  else if (score >= 75) rank = 'expert-knapper'
  else if (score >= 60) rank = 'skilled-artisan'
  else if (score >= 40) rank = 'apprentice'
  else if (score >= 25) rank = 'beginner'

  return {
    score,
    rank,
    isMasterwork,
    hasCompleteTool,
    hasHafting,
    hasNoIncomplete,
    hasProperWeight,
    hasBalanced,
    hasFunctional,
    hasNoDefects,
    hasProperUse,
    hasNoDiscard,
    incompleteCount,
    discardCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(shard) returns condition string */
export function classifyCondition(shard: ObsidianShard): ObsidianShard['condition'] {
  const { qualityScore } = shard
  if (qualityScore >= 80) return 'macuahuitl'
  if (qualityScore >= 65) return 'scalpel'
  if (qualityScore >= 50) return 'knife'
  if (qualityScore >= 35) return 'spear-point'
  if (qualityScore >= 20) return 'scraper'
  return 'gravel'
}

// ─── Shard Analysis ─────────────────────────────────────────────────────────

/** @example analyzeObsidianShard(content, filePath) returns full shard */
export function analyzeObsidianShard(content: string, filePath: string): ObsidianShard {
  const edge = measureEdge(content)
  const fracture = measureFracture(content)
  const purity = measurePurity(content)
  const beauty = measureBeauty(content)
  const precision = measurePrecision(content)
  const mastery = measureMastery(content)

  const edgeSharpness = edge.sharpness
  const fractureQuality = fracture.quality
  const volcanicPurity = purity.level
  const conchoidalBeauty = beauty.score
  const surgicalPrecision = precision.level
  const bladeMastery = mastery.score

  const qualityScore = Math.round(
    edgeSharpness * 0.2 +
    fractureQuality * 0.15 +
    volcanicPurity * 0.15 +
    conchoidalBeauty * 0.15 +
    surgicalPrecision * 0.15 +
    bladeMastery * 0.2,
  )

  const shard: ObsidianShard = {
    file: filePath,
    edgeSharpness,
    fractureQuality,
    volcanicPurity,
    conchoidalBeauty,
    surgicalPrecision,
    bladeMastery,
    edge,
    fracture,
    purity,
    beauty,
    precision,
    mastery,
    condition: 'gravel',
    qualityScore,
  }

  shard.condition = classifyCondition(shard)

  return shard
}

// ─── Cache Analysis ─────────────────────────────────────────────────────────

/** @example analyzeObsidianCache(shards, dirPath) returns cache */
export function analyzeObsidianCache(shards: ObsidianShard[], dirPath: string): ObsidianCache {
  if (shards.length === 0) {
    return {
      directory: dirPath,
      shards: [],
      avgSharpness: 0,
      avgPurity: 0,
      avgMastery: 0,
      macuahuitlCount: 0,
      gravelCount: 0,
      monoSharpCount: 0,
      masterworkCount: 0,
      cacheType: 'talus',
      condition: 'rubble',
    }
  }

  const avgSharpness = Math.round(shards.reduce((s, sh) => s + sh.edgeSharpness, 0) / shards.length)
  const avgPurity = Math.round(shards.reduce((s, sh) => s + sh.volcanicPurity, 0) / shards.length)
  const avgMastery = Math.round(shards.reduce((s, sh) => s + sh.bladeMastery, 0) / shards.length)

  const macuahuitlCount = shards.filter((s) => s.condition === 'macuahuitl').length
  const gravelCount = shards.filter((s) => s.condition === 'gravel').length
  const monoSharpCount = shards.filter((s) => s.edge.isMonoSharp).length
  const masterworkCount = shards.filter((s) => s.mastery.isMasterwork).length

  const cacheType = classifyCacheType(shards)
  const avgQuality = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  const condition = classifyCacheCondition(avgQuality)

  return {
    directory: dirPath,
    shards,
    avgSharpness,
    avgPurity,
    avgMastery,
    macuahuitlCount,
    gravelCount,
    monoSharpCount,
    masterworkCount,
    cacheType,
    condition,
  }
}

// ─── Cache Classification ───────────────────────────────────────────────────

/** @example classifyCacheType(shards) returns cache type */
export function classifyCacheType(shards: ObsidianShard[]): ObsidianCache['cacheType'] {
  if (shards.length === 0) return 'talus'
  const avgQuality = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  const macuahuitlCount = shards.filter((s) => s.condition === 'macuahuitl').length
  if (avgQuality >= 75 && macuahuitlCount >= Math.ceil(shards.length * 0.3)) return 'temple-vault'
  if (avgQuality >= 60) return 'workshop'
  if (avgQuality >= 45) return 'quarry'
  if (avgQuality >= 30) return 'worksite'
  if (avgQuality >= 15) return 'midden'
  return 'talus'
}

/** @example classifyCacheCondition(avgQuality) returns condition */
export function classifyCacheCondition(avgQuality: number): ObsidianCache['condition'] {
  if (avgQuality >= 80) return 'armory'
  if (avgQuality >= 65) return 'toolkit'
  if (avgQuality >= 50) return 'collection'
  if (avgQuality >= 35) return 'workshop'
  if (avgQuality >= 20) return 'debris'
  return 'rubble'
}

/** @example classifyArtisanGrade(avgQuality) returns grade */
export function classifyArtisanGrade(avgQuality: number): ObsidianBladeResult['stats']['artisanGrade'] {
  if (avgQuality >= 80) return 'master-artisan'
  if (avgQuality >= 65) return 'expert-flintknapper'
  if (avgQuality >= 50) return 'skilled-crafter'
  if (avgQuality >= 35) return 'apprentice'
  if (avgQuality >= 20) return 'novice'
  return 'clumsy'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(shards, caches, quarry, stats) returns recommendations */
export function generateRecommendations(
  shards: ObsidianShard[],
  caches: ObsidianCache[],
  quarry: ObsidianBladeResult['quarry'],
  stats: ObsidianBladeResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgEdgeSharpness < 50) {
    recs.push('Sharpen your code edge — add stronger typing and structure')
  }
  if (stats.avgFractureQuality < 50) {
    recs.push('Improve fracture quality — add error handling and clean code breaks')
  }
  if (stats.avgVolcanicPurity < 50) {
    recs.push('Increase volcanic purity — remove console usage and unnecessary complexity')
  }
  if (stats.avgConchoidalBeauty < 50) {
    recs.push('Enhance conchoidal beauty — add documentation and improve code elegance')
  }
  if (stats.avgSurgicalPrecision < 50) {
    recs.push('Refine surgical precision — add JSDoc, generics, and proper type annotations')
  }
  if (stats.avgBladeMastery < 50) {
    recs.push('Improve blade mastery — build complete, well-integrated tools')
  }
  if (stats.gravelCount > shards.length * 0.5) {
    recs.push('Too much gravel — over half your files are low quality')
  }
  if (stats.isMonoSharpCount === 0) {
    recs.push('No monomolecular edges found — strive for extreme precision')
  }
  if (stats.isMasterworkCount === 0) {
    recs.push('No masterwork shards — aim for defect-free, complete code')
  }
  if (caches.length > 0 && quarry.overallQuality < 60) {
    recs.push('Overall quarry quality is low — systematic refactoring recommended')
  }
  if (recs.length === 0) {
    recs.push('Excellent craftsmanship — your obsidian blades are razor-sharp')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildObsidianBladeResult(files, contents, options) returns full result */
export function buildObsidianBladeResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): ObsidianBladeResult {
  // Analyze each file as a shard
  const shards: ObsidianShard[] = files.map((file, i) =>
    analyzeObsidianShard(contents[i] ?? '', file),
  )

  // Group shards by directory for caches
  const dirMap = new Map<string, ObsidianShard[]>()
  for (const shard of shards) {
    const dir = shard.file.includes('/')
      ? shard.file.substring(0, shard.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(shard)
    } else {
      dirMap.set(dir, [shard])
    }
  }

  const caches: ObsidianCache[] = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeObsidianCache(dirShards, dir),
  )

  // Quarry-level analysis
  const avgSharpness = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.edgeSharpness, 0) / shards.length)
    : 0
  const avgPurity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.volcanicPurity, 0) / shards.length)
    : 0
  const avgMastery = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.bladeMastery, 0) / shards.length)
    : 0
  const overallQuality = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
    : 0
  const isMasterwork = overallQuality >= 65

  const quarry: ObsidianBladeResult['quarry'] = {
    avgSharpness,
    avgPurity,
    avgMastery,
    isMasterwork,
    overallQuality,
  }

  // Stats
  const avgEdgeSharpness = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.edgeSharpness, 0) / shards.length)
    : 0
  const avgFractureQuality = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.fractureQuality, 0) / shards.length)
    : 0
  const avgVolcanicPurity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.volcanicPurity, 0) / shards.length)
    : 0
  const avgConchoidalBeauty = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.conchoidalBeauty, 0) / shards.length)
    : 0
  const avgSurgicalPrecision = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.surgicalPrecision, 0) / shards.length)
    : 0
  const avgBladeMastery = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.bladeMastery, 0) / shards.length)
    : 0

  const conditionCounts = {
    macuahuitl: 0,
    scalpel: 0,
    knife: 0,
    spearPoint: 0,
    scraper: 0,
    gravel: 0,
  }
  for (const sh of shards) {
    conditionCounts[sh.condition === 'spear-point' ? 'spearPoint' : sh.condition]++
  }

  const isMonoSharpCount = shards.filter((s) => s.edge.isMonoSharp).length
  const hasCleanBreakCount = shards.filter((s) => s.fracture.hasCleanBreak).length
  const isPureCount = shards.filter((s) => s.purity.isPure).length
  const isBeautifulCount = shards.filter((s) => s.beauty.isBeautiful).length
  const hasSurgicalPrecisionCount = shards.filter((s) => s.precision.hasSurgicalPrecision).length
  const isMasterworkCount = shards.filter((s) => s.mastery.isMasterwork).length

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file
    : ''
  const sharpest = shards.length > 0
    ? shards.reduce((best, sh) => sh.edgeSharpness > best.edgeSharpness ? sh : best).file
    : ''
  const cleanest = shards.length > 0
    ? shards.reduce((best, sh) => sh.fractureQuality > best.fractureQuality ? sh : best).file
    : ''
  const purest = shards.length > 0
    ? shards.reduce((best, sh) => sh.volcanicPurity > best.volcanicPurity ? sh : best).file
    : ''
  const mostBeautiful = shards.length > 0
    ? shards.reduce((best, sh) => sh.conchoidalBeauty > best.conchoidalBeauty ? sh : best).file
    : ''
  const mostPrecise = shards.length > 0
    ? shards.reduce((best, sh) => sh.surgicalPrecision > best.surgicalPrecision ? sh : best).file
    : ''

  const artisanGrade = classifyArtisanGrade(overallQuality)

  const stats: ObsidianBladeResult['stats'] = {
    totalFiles: files.length,
    totalCaches: caches.length,
    avgEdgeSharpness,
    avgFractureQuality,
    avgVolcanicPurity,
    avgConchoidalBeauty,
    avgSurgicalPrecision,
    avgBladeMastery,
    macuahuitlCount: conditionCounts.macuahuitl,
    scalpelCount: conditionCounts.scalpel,
    knifeCount: conditionCounts.knife,
    spearPointCount: conditionCounts.spearPoint,
    scraperCount: conditionCounts.scraper,
    gravelCount: conditionCounts.gravel,
    isMonoSharpCount,
    hasCleanBreakCount,
    isPureCount,
    isBeautifulCount,
    hasSurgicalPrecisionCount,
    isMasterworkCount,
    overallQuality,
    artisanGrade,
    bestShard,
    sharpest,
    cleanest,
    purest,
    mostBeautiful,
    mostPrecise,
  }

  const recommendations = generateRecommendations(shards, caches, quarry, stats)

  return {
    shards,
    caches,
    quarry,
    stats,
    recommendations,
  }
}
