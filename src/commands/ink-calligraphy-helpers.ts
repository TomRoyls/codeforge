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

export interface StrokeMeasure {
  quality: number
  type: 'kaisho' | 'gyosho' | 'sosho' | 'reisho' | 'tensho' | 'scribble'
  hasHighQuality: boolean
  hasProperPressure: boolean
  hasSmoothTransitions: boolean
  hasProperSpeed: boolean
  hasNoHesitation: boolean
  hasConfidentLines: boolean
  hasNoBleeding: boolean
  hasProperThickness: boolean
  hasNoSmudging: boolean
  hasCleanTermination: boolean
  bleedingCount: number
  smudgingCount: number
}

export interface InkMeasure {
  density: number
  quality: 'sumi' | 'bokushu' | 'india-ink' | 'watercolor' | 'diluted' | 'water'
  hasRichDensity: boolean
  hasProperConsistency: boolean
  hasNoBleeding: boolean
  hasDeepBlack: boolean
  hasProperDilution: boolean
  hasNoPooling: boolean
  hasEvenDistribution: boolean
  hasNoSplatter: boolean
  hasProperSaturation: boolean
  hasNoFading: boolean
  poolingCount: number
  splatterCount: number
}

export interface BrushMeasure {
  control: number
  grip: 'master-grip' | 'firm-grip' | 'proper-grip' | 'loose-grip' | 'weak-grip' | 'no-grip'
  hasHighControl: boolean
  hasProperAngle: boolean
  hasConsistentPressure: boolean
  hasNoTrembling: boolean
  hasProperLift: boolean
  hasNoDropping: boolean
  hasFineDetail: boolean
  hasNoScratching: boolean
  hasProperTwist: boolean
  hasControlledRelease: boolean
  tremblingCount: number
  scratchingCount: number
}

export interface CompositionMeasure {
  balance: number
  layout: 'hanging-scroll' | 'album-leaf' | 'fan' | 'screen' | 'scrap' | 'napkin'
  hasProperBalance: boolean
  hasWhiteSpace: boolean
  hasNoCrowding: boolean
  hasProperMargins: boolean
  hasVisualWeight: boolean
  hasNoImbalance: boolean
  hasProperRhythm: boolean
  hasFocalPoint: boolean
  hasNoClutter: boolean
  hasHarmoniousArrangement: boolean
  crowdingCount: number
  clutterCount: number
}

export interface FlowMeasure {
  level: number
  style: 'running-script' | 'flowing' | 'smooth' | 'labored' | 'jerky' | 'blocked'
  hasGoodFlow: boolean
  hasNaturalMovement: boolean
  hasNoInterruption: boolean
  hasProperPace: boolean
  hasContinuousStroke: boolean
  hasNoBreakInFlow: boolean
  hasProperDirection: boolean
  hasFluidTransitions: boolean
  hasNoStuttering: boolean
  hasRhythmicFlow: boolean
  interruptionCount: number
  stutteringCount: number
}

export interface ExpressionMeasure {
  level: number
  style: 'zen-master' | 'master-calligrapher' | 'artist' | 'craftsman' | 'student' | 'child'
  hasHighExpression: boolean
  hasIntentionality: boolean
  hasCreativity: boolean
  hasPersonalStyle: boolean
  hasNoAccidental: boolean
  hasElegance: boolean
  hasNoPretension: boolean
  hasProperRestraint: boolean
  hasDepth: boolean
  hasNoSuperficiality: boolean
  accidentalCount: number
  pretensionCount: number
}

export interface CalligraphyStroke {
  file: string
  strokeQuality: number
  inkDensity: number
  brushControl: number
  compositionBalance: number
  inkFlow: number
  artisticExpression: number
  stroke: StrokeMeasure
  ink: InkMeasure
  brush: BrushMeasure
  composition: CompositionMeasure
  flow: FlowMeasure
  expression: ExpressionMeasure
  condition: 'national-treasure' | 'masterwork' | 'gallery-piece' | 'practice-sheet' | 'ink-blot' | 'scribble'
  qualityScore: number
}

export interface InkGallery {
  directory: string
  strokes: CalligraphyStroke[]
  avgQuality: number
  avgControl: number
  avgExpression: number
  treasureCount: number
  scribbleCount: number
  highQualityCount: number
  goodFlowCount: number
  galleryType: 'imperial-collection' | 'museum' | 'gallery' | 'studio' | 'classroom' | 'recycling'
  condition: 'world-heritage' | 'national-treasure' | 'exhibition' | 'practice' | 'storage' | 'trash'
}

export interface InkCalligraphyResult {
  strokes: CalligraphyStroke[]
  galleries: InkGallery[]
  exhibition: {
    avgQuality: number
    avgControl: number
    avgExpression: number
    isMasterwork: boolean
    overallMastery: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgStrokeQuality: number
    avgInkDensity: number
    avgBrushControl: number
    avgCompositionBalance: number
    avgInkFlow: number
    avgArtisticExpression: number
    nationalTreasureCount: number
    masterworkCount: number
    galleryPieceCount: number
    practiceSheetCount: number
    inkBlotCount: number
    scribbleCount: number
    hasHighQualityCount: number
    hasRichDensityCount: number
    hasHighControlCount: number
    hasProperBalanceCount: number
    hasGoodFlowCount: number
    hasHighExpressionCount: number
    overallMastery: number
    calligrapherGrade: 'national-living-treasure' | 'master-calligrapher' | 'calligrapher' | 'artist' | 'student' | 'finger-painter'
    bestStroke: string
    highestQuality: string
    richestInk: string
    mostPrecise: string
    bestBalanced: string
    mostFlowing: string
  }
  recommendations: string[]
}

// ─── Stroke Measurement ─────────────────────────────────────────────────────

/** @example measureStroke(content) returns stroke analysis */
export function measureStroke(content: string): StrokeMeasure {
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

  let quality = 25
  if (hasStructure) quality += 15
  if (hasTypes) quality += 15
  if (hasFunctions) quality += 10
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (jsdocCount > 0) quality += 8
  if (asyncCount > 0) quality += 4
  if (consoleCount === 0) quality += 4
  if (anyCount === 0) quality += 4
  if (todoCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const bleedingCount = anyCount + todoCount
  const smudgingCount = deepNestedCount + commentedCodeCount

  const hasHighQuality = quality >= 80 && hasStructure && hasTypes
  const hasProperPressure = hasStructure && hasTypes && exportCount > 0
  const hasSmoothTransitions = hasFunctions && consoleCount === 0
  const hasProperSpeed = asyncCount > 0 || functionCount > 0
  const hasNoHesitation = todoCount === 0 && commentedCodeCount === 0
  const hasConfidentLines = hasStructure && hasTypes && hasFunctions
  const hasNoBleeding = bleedingCount === 0
  const hasProperThickness = hasStructure && hasTypes && hasFunctions
  const hasNoSmudging = smudgingCount === 0
  const hasCleanTermination = hasFunctions && consoleCount === 0

  let type: StrokeMeasure['type'] = 'scribble'
  if (hasHighQuality && hasNoBleeding && hasNoSmudging && hasCleanTermination) type = 'kaisho'
  else if (hasHighQuality && hasNoBleeding) type = 'gyosho'
  else if (hasHighQuality) type = 'sosho'
  else if (hasConfidentLines && hasSmoothTransitions) type = 'reisho'
  else if (quality > 30) type = 'tensho'

  return {
    quality, type, hasHighQuality, hasProperPressure, hasSmoothTransitions,
    hasProperSpeed, hasNoHesitation, hasConfidentLines, hasNoBleeding,
    hasProperThickness, hasNoSmudging, hasCleanTermination,
    bleedingCount, smudgingCount,
  }
}

// ─── Ink Measurement ────────────────────────────────────────────────────────

/** @example measureInk(content) returns ink analysis */
export function measureInk(content: string): InkMeasure {
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

  let density = 20
  if (hasStructure) density += 12
  if (hasTypes) density += 12
  if (hasFunctions) density += 10
  if (jsdocCount > 0) density += 8
  if (genericsCount > 0) density += 5
  if (enumCount > 0) density += 5
  if (exportCount > 0) density += 5
  if (importCount > 0) density += 5
  if (asyncCount > 0) density += 3
  if (tryCatchCount > 0) density += 3
  if (anyCount === 0) density += 4
  if (consoleCount === 0) density += 3
  if (todoCount === 0) density += 5
  density = Math.min(100, Math.max(0, Math.round(density)))

  const poolingCount = todoCount + deepNestedCount
  const splatterCount = consoleCount + anyCount

  const hasRichDensity = density >= 80 && hasStructure && hasTypes
  const hasProperConsistency = hasStructure && hasTypes && hasFunctions
  const hasNoBleeding = anyCount === 0 && todoCount === 0
  const hasDeepBlack = hasStructure && hasTypes && exportCount > 0
  const hasProperDilution = hasStructure && hasTypes && genericsCount > 0
  const hasNoPooling = poolingCount === 0
  const hasEvenDistribution = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoSplatter = splatterCount === 0
  const hasProperSaturation = hasStructure && hasTypes && hasFunctions
  const hasNoFading = commentedCodeCount === 0

  let inkQuality: InkMeasure['quality'] = 'water'
  if (hasRichDensity && hasNoPooling && hasNoSplatter && hasEvenDistribution) inkQuality = 'sumi'
  else if (hasRichDensity && hasNoPooling) inkQuality = 'bokushu'
  else if (hasRichDensity) inkQuality = 'india-ink'
  else if (hasProperConsistency && hasDeepBlack) inkQuality = 'watercolor'
  else if (density > 30) inkQuality = 'diluted'

  return {
    density, quality: inkQuality, hasRichDensity, hasProperConsistency,
    hasNoBleeding, hasDeepBlack, hasProperDilution, hasNoPooling,
    hasEvenDistribution, hasNoSplatter, hasProperSaturation, hasNoFading,
    poolingCount, splatterCount,
  }
}

// ─── Brush Measurement ──────────────────────────────────────────────────────

/** @example measureBrush(content) returns brush analysis */
export function measureBrush(content: string): BrushMeasure {
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
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let control = 25
  if (hasStructure) control += 12
  if (hasTypes) control += 12
  if (hasFunctions) control += 10
  if (jsdocCount > 0) control += 8
  if (genericsCount > 0) control += 5
  if (exportCount > 0) control += 5
  if (importCount > 0) control += 5
  if (tryCatchCount > 0) control += 5
  if (asyncCount > 0) control += 3
  if (consoleCount === 0) control += 4
  if (anyCount === 0) control += 3
  if (deepNestedCount === 0) control += 3
  control = Math.min(100, Math.max(0, Math.round(control)))

  const tremblingCount = anyCount + todoCount
  const scratchingCount = deepNestedCount + consoleCount

  const hasHighControl = control >= 80 && hasStructure && hasTypes
  const hasProperAngle = hasStructure && hasTypes && genericsCount > 0
  const hasConsistentPressure = hasStructure && hasTypes && exportCount > 0
  const hasNoTrembling = tremblingCount === 0
  const hasProperLift = hasStructure && hasTypes && hasFunctions
  const hasNoDropping = consoleCount === 0
  const hasFineDetail = genericsCount > 0 && jsdocCount > 0
  const hasNoScratching = scratchingCount === 0
  const hasProperTwist = hasStructure && hasTypes && tryCatchCount > 0
  const hasControlledRelease = hasFunctions && exportCount > 0

  let grip: BrushMeasure['grip'] = 'no-grip'
  if (hasHighControl && hasNoTrembling && hasFineDetail && hasControlledRelease) grip = 'master-grip'
  else if (hasHighControl && hasNoTrembling) grip = 'firm-grip'
  else if (hasHighControl) grip = 'proper-grip'
  else if (hasProperLift && hasConsistentPressure) grip = 'loose-grip'
  else if (control > 30) grip = 'weak-grip'

  return {
    control, grip, hasHighControl, hasProperAngle, hasConsistentPressure,
    hasNoTrembling, hasProperLift, hasNoDropping, hasFineDetail,
    hasNoScratching, hasProperTwist, hasControlledRelease,
    tremblingCount, scratchingCount,
  }
}

// ─── Composition Measurement ────────────────────────────────────────────────

/** @example measureComposition(content) returns composition analysis */
export function measureComposition(content: string): CompositionMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let balance = 20
  if (hasStructure) balance += 12
  if (hasTypes) balance += 12
  if (hasFunctions) balance += 10
  if (jsdocCount > 0) balance += 10
  if (exportCount > 0) balance += 10
  if (importCount > 0) balance += 5
  if (anyCount === 0) balance += 5
  if (consoleCount === 0) balance += 4
  if (tryCatchCount > 0) balance += 4
  if (privateCount === 0 && protectedCount === 0) balance += 3
  if (commentedCodeCount === 0) balance += 5
  balance = Math.min(100, Math.max(0, Math.round(balance)))

  const crowdingCount = privateCount + protectedCount
  const clutterCount = anyCount + consoleCount

  const hasProperBalance = balance >= 75 && hasStructure && hasTypes
  const hasWhiteSpace = jsdocCount > 0
  const hasNoCrowding = crowdingCount === 0
  const hasProperMargins = hasStructure && hasTypes && exportCount > 0
  const hasVisualWeight = hasStructure && hasTypes && genericsCount > 0
  const hasNoImbalance = commentedCodeCount === 0
  const hasProperRhythm = hasStructure && hasTypes && hasFunctions
  const hasFocalPoint = hasStructure && hasTypes && hasFunctions
  const hasNoClutter = clutterCount === 0
  const hasHarmoniousArrangement = hasStructure && hasTypes && hasFunctions && jsdocCount > 0

  let layout: CompositionMeasure['layout'] = 'napkin'
  if (hasProperBalance && hasNoCrowding && hasNoClutter && hasHarmoniousArrangement) layout = 'hanging-scroll'
  else if (hasProperBalance && hasNoCrowding) layout = 'album-leaf'
  else if (hasProperBalance) layout = 'fan'
  else if (hasProperRhythm && hasProperMargins) layout = 'screen'
  else if (balance > 30) layout = 'scrap'

  return {
    balance, layout, hasProperBalance, hasWhiteSpace, hasNoCrowding,
    hasProperMargins, hasVisualWeight, hasNoImbalance, hasProperRhythm,
    hasFocalPoint, hasNoClutter, hasHarmoniousArrangement,
    crowdingCount, clutterCount,
  }
}

// ─── Flow Measurement ───────────────────────────────────────────────────────

/** @example measureFlow(content) returns flow analysis */
export function measureFlow(content: string): FlowMeasure {
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
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (genericsCount > 0) level += 5
  if (enumCount > 0) level += 5
  if (anyCount === 0) level += 8
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (deepNestedCount === 0) level += 8
  level = Math.min(100, Math.max(0, Math.round(level)))

  const interruptionCount = todoCount + commentedCodeCount
  const stutteringCount = deepNestedCount + consoleCount

  const hasGoodFlow = level >= 80 && anyCount === 0 && todoCount === 0
  const hasNaturalMovement = hasStructure && hasTypes && hasFunctions
  const hasNoInterruption = interruptionCount === 0
  const hasProperPace = asyncCount > 0 || tryCatchCount > 0
  const hasContinuousStroke = hasFunctions && exportCount > 0
  const hasNoBreakInFlow = deepNestedCount === 0 && commentedCodeCount === 0
  const hasProperDirection = hasStructure && hasTypes && exportCount > 0
  const hasFluidTransitions = hasStructure && hasTypes && genericsCount > 0
  const hasNoStuttering = stutteringCount === 0
  const hasRhythmicFlow = hasStructure && hasTypes && hasFunctions && jsdocCount > 0

  let style: FlowMeasure['style'] = 'blocked'
  if (hasGoodFlow && hasNoInterruption && hasNoStuttering && hasRhythmicFlow) style = 'running-script'
  else if (hasGoodFlow && hasNoInterruption) style = 'flowing'
  else if (hasGoodFlow) style = 'smooth'
  else if (hasNaturalMovement && hasProperDirection) style = 'labored'
  else if (level > 30) style = 'jerky'

  return {
    level, style, hasGoodFlow, hasNaturalMovement, hasNoInterruption,
    hasProperPace, hasContinuousStroke, hasNoBreakInFlow, hasProperDirection,
    hasFluidTransitions, hasNoStuttering, hasRhythmicFlow,
    interruptionCount, stutteringCount,
  }
}

// ─── Expression Measurement ─────────────────────────────────────────────────

/** @example measureExpression(content) returns expression analysis */
export function measureExpression(content: string): ExpressionMeasure {
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
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 25
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (reExportCount > 0) level += 5
  if (asyncCount > 0) level += 3
  if (tryCatchCount > 0) level += 5
  if (anyCount === 0) level += 3
  if (consoleCount === 0) level += 2
  level = Math.min(100, Math.max(0, Math.round(level)))

  const accidentalCount = todoCount
  const pretensionCount = deepNestedCount

  const hasHighExpression = level >= 80 && hasStructure && hasTypes
  const hasIntentionality = hasStructure && hasTypes && hasFunctions && todoCount === 0
  const hasCreativity = genericsCount > 0 || reExportCount > 0
  const hasPersonalStyle = hasStructure && hasTypes && genericsCount > 0
  const hasNoAccidental = accidentalCount === 0
  const hasElegance = hasStructure && hasTypes && hasFunctions && consoleCount === 0
  const hasNoPretension = deepNestedCount === 0
  const hasProperRestraint = hasFunctions && exportCount > 0
  const hasDepth = hasStructure && hasTypes && (asyncCount > 0 || tryCatchCount > 0)
  const hasNoSuperficiality = jsdocCount > 0 && exportCount > 0

  let style: ExpressionMeasure['style'] = 'child'
  if (hasHighExpression && hasNoAccidental && hasNoPretension && hasDepth && hasNoSuperficiality) style = 'zen-master'
  else if (hasHighExpression && hasNoAccidental && hasNoPretension) style = 'master-calligrapher'
  else if (hasHighExpression && hasNoAccidental) style = 'artist'
  else if (hasHighExpression) style = 'craftsman'
  else if (level > 30) style = 'student'

  return {
    level, style, hasHighExpression, hasIntentionality, hasCreativity,
    hasPersonalStyle, hasNoAccidental, hasElegance, hasNoPretension,
    hasProperRestraint, hasDepth, hasNoSuperficiality,
    accidentalCount, pretensionCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(stroke) returns condition string */
export function classifyCondition(stroke: CalligraphyStroke): CalligraphyStroke['condition'] {
  const { qualityScore } = stroke
  if (qualityScore >= 80) return 'national-treasure'
  if (qualityScore >= 65) return 'masterwork'
  if (qualityScore >= 50) return 'gallery-piece'
  if (qualityScore >= 35) return 'practice-sheet'
  if (qualityScore >= 20) return 'ink-blot'
  return 'scribble'
}

// ─── Stroke Analysis ────────────────────────────────────────────────────────

/** @example analyzeCalligraphyStroke(content, filePath) returns full stroke */
export function analyzeCalligraphyStroke(content: string, filePath: string): CalligraphyStroke {
  const stroke = measureStroke(content)
  const ink = measureInk(content)
  const brush = measureBrush(content)
  const composition = measureComposition(content)
  const flow = measureFlow(content)
  const expression = measureExpression(content)

  const strokeQuality = stroke.quality
  const inkDensity = ink.density
  const brushControl = brush.control
  const compositionBalance = composition.balance
  const inkFlow = flow.level
  const artisticExpression = expression.level

  const qualityScore = Math.round(
    strokeQuality * 0.15 +
    inkDensity * 0.15 +
    brushControl * 0.15 +
    compositionBalance * 0.2 +
    inkFlow * 0.15 +
    artisticExpression * 0.2,
  )

  const calligraphyStroke: CalligraphyStroke = {
    file: filePath,
    strokeQuality, inkDensity, brushControl, compositionBalance,
    inkFlow, artisticExpression,
    stroke, ink, brush, composition, flow, expression,
    condition: 'scribble',
    qualityScore,
  }

  calligraphyStroke.condition = classifyCondition(calligraphyStroke)

  return calligraphyStroke
}

// ─── Gallery Analysis ───────────────────────────────────────────────────────

/** @example analyzeInkGallery(strokes, dirPath) returns gallery */
export function analyzeInkGallery(strokes: CalligraphyStroke[], dirPath: string): InkGallery {
  if (strokes.length === 0) {
    return {
      directory: dirPath, strokes: [], avgQuality: 0, avgControl: 0,
      avgExpression: 0, treasureCount: 0, scribbleCount: 0,
      highQualityCount: 0, goodFlowCount: 0,
      galleryType: 'recycling', condition: 'trash',
    }
  }

  const avgQuality = Math.round(strokes.reduce((s, st) => s + st.strokeQuality, 0) / strokes.length)
  const avgControl = Math.round(strokes.reduce((s, st) => s + st.brushControl, 0) / strokes.length)
  const avgExpression = Math.round(strokes.reduce((s, st) => s + st.artisticExpression, 0) / strokes.length)

  const treasureCount = strokes.filter((st) => st.condition === 'national-treasure').length
  const scribbleCount = strokes.filter((st) => st.condition === 'scribble').length
  const highQualityCount = strokes.filter((st) => st.stroke.hasHighQuality).length
  const goodFlowCount = strokes.filter((st) => st.flow.hasGoodFlow).length

  const galleryType = classifyGalleryType(strokes)
  const avgScore = strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length
  const condition = classifyGalleryCondition(avgScore)

  return {
    directory: dirPath, strokes, avgQuality, avgControl, avgExpression,
    treasureCount, scribbleCount, highQualityCount, goodFlowCount,
    galleryType, condition,
  }
}

// ─── Gallery Classification ─────────────────────────────────────────────────

/** @example classifyGalleryType(strokes) returns gallery type */
export function classifyGalleryType(strokes: CalligraphyStroke[]): InkGallery['galleryType'] {
  if (strokes.length === 0) return 'recycling'
  const avgScore = strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length
  const treasureCnt = strokes.filter((st) => st.condition === 'national-treasure').length
  if (avgScore >= 75 && treasureCnt >= Math.ceil(strokes.length * 0.3)) return 'imperial-collection'
  if (avgScore >= 60) return 'museum'
  if (avgScore >= 45) return 'gallery'
  if (avgScore >= 30) return 'studio'
  if (avgScore >= 15) return 'classroom'
  return 'recycling'
}

/** @example classifyGalleryCondition(avgScore) returns condition */
export function classifyGalleryCondition(avgScore: number): InkGallery['condition'] {
  if (avgScore >= 80) return 'world-heritage'
  if (avgScore >= 65) return 'national-treasure'
  if (avgScore >= 50) return 'exhibition'
  if (avgScore >= 35) return 'practice'
  if (avgScore >= 20) return 'storage'
  return 'trash'
}

/** @example classifyCalligrapherGrade(avgMastery) returns grade */
export function classifyCalligrapherGrade(avgMastery: number): InkCalligraphyResult['stats']['calligrapherGrade'] {
  if (avgMastery >= 80) return 'national-living-treasure'
  if (avgMastery >= 65) return 'master-calligrapher'
  if (avgMastery >= 50) return 'calligrapher'
  if (avgMastery >= 35) return 'artist'
  if (avgMastery >= 20) return 'student'
  return 'finger-painter'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(strokes, galleries, exhibition, stats) returns recommendations */
export function generateRecommendations(
  strokes: CalligraphyStroke[],
  galleries: InkGallery[],
  exhibition: InkCalligraphyResult['exhibition'],
  stats: InkCalligraphyResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgStrokeQuality < 50) recs.push('Improve stroke quality — refine code execution and structure')
  if (stats.avgInkDensity < 50) recs.push('Deepen ink density — enrich code with more meaningful patterns')
  if (stats.avgBrushControl < 50) recs.push('Strengthen brush control — improve code precision and type safety')
  if (stats.avgCompositionBalance < 50) recs.push('Balance composition — improve code structure and organization')
  if (stats.avgInkFlow < 50) recs.push('Smooth ink flow — improve code readability and reduce interruptions')
  if (stats.avgArtisticExpression < 50) recs.push('Express artistry — add more intentional, elegant code patterns')
  if (stats.scribbleCount > strokes.length * 0.5) recs.push('Too many scribbles — over half the codebase is poor quality')
  if (stats.hasHighQualityCount === 0) recs.push('No high-quality strokes found — practice fundamental patterns')
  if (galleries.length > 0 && exhibition.overallMastery < 60) recs.push('Overall mastery is low — systematic practice recommended')
  if (recs.length === 0) recs.push('Calligraphic masterpiece — your code flows with the grace of a zen master')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildInkCalligraphyResult(files, contents, options) returns full result */
export function buildInkCalligraphyResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): InkCalligraphyResult {
  const strokes: CalligraphyStroke[] = files.map((file, i) =>
    analyzeCalligraphyStroke(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CalligraphyStroke[]>()
  for (const stroke of strokes) {
    const dir = stroke.file.includes('/')
      ? stroke.file.substring(0, stroke.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(stroke)
    } else {
      dirMap.set(dir, [stroke])
    }
  }

  const galleries: InkGallery[] = Array.from(dirMap.entries()).map(([dir, dirStrokes]) =>
    analyzeInkGallery(dirStrokes, dir),
  )

  const avgQuality = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.strokeQuality, 0) / strokes.length)
    : 0
  const avgControl = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.brushControl, 0) / strokes.length)
    : 0
  const avgExpression = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.artisticExpression, 0) / strokes.length)
    : 0
  const overallMastery = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length)
    : 0
  const isMasterwork = overallMastery >= 65

  const exhibition: InkCalligraphyResult['exhibition'] = {
    avgQuality, avgControl, avgExpression, isMasterwork, overallMastery,
  }

  const avgStrokeQuality = avgQuality
  const avgInkDensity = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.inkDensity, 0) / strokes.length)
    : 0
  const avgBrushControl = avgControl
  const avgCompositionBalance = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.compositionBalance, 0) / strokes.length)
    : 0
  const avgInkFlow = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.inkFlow, 0) / strokes.length)
    : 0
  const avgArtisticExpression = avgExpression

  const conditionCounts = {
    nationalTreasure: 0, masterwork: 0, galleryPiece: 0,
    practiceSheet: 0, inkBlot: 0, scribbleCnt: 0,
  }
  for (const st of strokes) {
    switch (st.condition) {
      case 'national-treasure': conditionCounts.nationalTreasure++; break
      case 'masterwork': conditionCounts.masterwork++; break
      case 'gallery-piece': conditionCounts.galleryPiece++; break
      case 'practice-sheet': conditionCounts.practiceSheet++; break
      case 'ink-blot': conditionCounts.inkBlot++; break
      case 'scribble': conditionCounts.scribbleCnt++; break
    }
  }

  const hasHighQualityCount = strokes.filter((st) => st.stroke.hasHighQuality).length
  const hasRichDensityCount = strokes.filter((st) => st.ink.hasRichDensity).length
  const hasHighControlCount = strokes.filter((st) => st.brush.hasHighControl).length
  const hasProperBalanceCount = strokes.filter((st) => st.composition.hasProperBalance).length
  const hasGoodFlowCount = strokes.filter((st) => st.flow.hasGoodFlow).length
  const hasHighExpressionCount = strokes.filter((st) => st.expression.hasHighExpression).length

  const bestStroke = strokes.length > 0
    ? strokes.reduce((best, st) => st.qualityScore > best.qualityScore ? st : best).file
    : ''
  const highestQuality = strokes.length > 0
    ? strokes.reduce((best, st) => st.strokeQuality > best.strokeQuality ? st : best).file
    : ''
  const richestInk = strokes.length > 0
    ? strokes.reduce((best, st) => st.inkDensity > best.inkDensity ? st : best).file
    : ''
  const mostPrecise = strokes.length > 0
    ? strokes.reduce((best, st) => st.brushControl > best.brushControl ? st : best).file
    : ''
  const bestBalanced = strokes.length > 0
    ? strokes.reduce((best, st) => st.compositionBalance > best.compositionBalance ? st : best).file
    : ''
  const mostFlowing = strokes.length > 0
    ? strokes.reduce((best, st) => st.inkFlow > best.inkFlow ? st : best).file
    : ''

  const calligrapherGrade = classifyCalligrapherGrade(overallMastery)

  const stats: InkCalligraphyResult['stats'] = {
    totalFiles: files.length, totalGalleries: galleries.length,
    avgStrokeQuality, avgInkDensity, avgBrushControl,
    avgCompositionBalance, avgInkFlow, avgArtisticExpression,
    nationalTreasureCount: conditionCounts.nationalTreasure,
    masterworkCount: conditionCounts.masterwork,
    galleryPieceCount: conditionCounts.galleryPiece,
    practiceSheetCount: conditionCounts.practiceSheet,
    inkBlotCount: conditionCounts.inkBlot,
    scribbleCount: conditionCounts.scribbleCnt,
    hasHighQualityCount, hasRichDensityCount, hasHighControlCount,
    hasProperBalanceCount, hasGoodFlowCount, hasHighExpressionCount,
    overallMastery, calligrapherGrade,
    bestStroke, highestQuality, richestInk, mostPrecise, bestBalanced, mostFlowing,
  }

  const recommendations = generateRecommendations(strokes, galleries, exhibition, stats)

  return { strokes, galleries, exhibition, stats, recommendations }
}
