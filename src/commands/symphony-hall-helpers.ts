// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const COMMENT_REGEX = /\/\/.*$/gm
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const STRING_REGEX = /(["'`])(?:(?!\1|\\).|\\.)*\1/g
const TEMPLATE_REGEX = /`[^`]*`/g
const ASYNC_REGEX = /\basync\s+/g
const AWAIT_REGEX = /\bawait\b/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const CATCH_REGEX = /\bcatch\b/g
const FINALLY_REGEX = /\bfinally\b/g
const THROW_REGEX = /\bthrow\b/g
const IF_REGEX = /\bif\s*\(/g
const ELSE_REGEX = /\belse\b/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const FOR_REGEX = /\bfor\s*[\(;]/g
const WHILE_REGEX = /\bwhile\s*\(/g
const NESTED_BLOCK_REGEX = /\{[^{}]*\{[^{}]*\}/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const TERNARY_REGEX = /\?[^:]+:/g
const NULLISH_REGEX = /\?\?/g
const OPTIONAL_CHAIN_REGEX = /\?\./g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const ERROR_REGEX = /\bnew\s+Error\b/g
const RETURN_REGEX = /\breturn\b/g
const DEFAULT_PARAM_REGEX = /\w+\s*=\s*[^,)]+/g
const SPREAD_REGEX = /\.\.\./g
const DESTRUCTURE_REGEX = /\{[^{}]*\}\s*=/g
const GENERICS_REGEX = /<[^>]+>/g
const UTILITY_TYPE_REGEX = /\b(?:Partial|Required|Readonly|Record|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|InstanceType|Parameters)\b/g
const DECORATOR_REGEX = /@\w+/g
const NAMESPACE_REGEX = /\bnamespace\s+\w+/g
const ABSTRACT_REGEX = /\babstract\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const READONLY_REGEX = /\breadonly\b/g
const OVERRIDE_REGEX = /\boverride\b/g
const PROMISE_REGEX = /\bPromise\b/g
const TYPE_GUARD_REGEX = /\b(?:typeof|instanceof)\b/g
const CONST_ASSERTION_REGEX = /\bas\s+const\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const DYNAMIC_IMPORT_REGEX = /\bimport\s*\(/g
const ANY_REGEX = /\bany\b/g
const NEVER_REGEX = /\bnever\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const ASSERT_REGEX = /\bassert\b/g
const BREAK_REGEX = /\bbreak\b/g
const CONTINUE_REGEX = /\bcontinue\b/g
const YIELD_REGEX = /\byield\b/g
const SET_REGEX = /\bSet\b/g
const MAP_REGEX = /\bMap\b/g
const LOGICAL_AND_REGEX = /&&/g
const LOGICAL_OR_REGEX = /\|\|/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface HarmonyMeasure {
  coordination: number
  key: 'C-major' | 'G-major' | 'D-minor' | 'A-minor' | 'chromatic' | 'atonal'
  isHarmonious: boolean
  hasProperChords: boolean
  hasCounterpoint: boolean
  hasDissonance: boolean
  hasResolution: boolean
  hasModulation: boolean
  hasVoiceLeading: boolean
  hasParallelMotion: boolean
  hasContraryMotion: boolean
  hasSustainedPedal: boolean
  dissonanceCount: number
}

export interface RhythmMeasure {
  precision: number
  timeSignature: '4/4' | '3/4' | '6/8' | '5/4' | '7/8' | 'free'
  isPrecise: boolean
  hasSteadyBeat: boolean
  hasSyncopation: boolean
  hasPolyrhythm: boolean
  hasRubato: boolean
  hasProperTempo: boolean
  hasAccelerando: boolean
  hasRitardando: boolean
  hasFermata: boolean
  hasGraceNotes: boolean
  syncopationCount: number
}

export interface DynamicsMeasure {
  range: number
  marking: 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff'
  hasWideRange: boolean
  hasProperCrescendo: boolean
  hasProperDecrescendo: boolean
  hasSforzando: boolean
  hasFortepiano: boolean
  hasSubito: boolean
  hasTremolo: boolean
  hasNoDistortion: boolean
  hasProperHeadroom: boolean
  hasDynamicControl: boolean
  distortionCount: number
}

export interface SectionsMeasure {
  balance: number
  strings: number
  woodwinds: number
  brass: number
  percussion: number
  keyboard: number
  isBalanced: boolean
  hasProperMix: boolean
  hasNoDominance: boolean
  hasFullOrchestra: boolean
  hasChamberEnsemble: boolean
  hasSolo: boolean
  hasTutti: boolean
  dominanceCount: number
}

export interface ScoreMeasure {
  fidelity: number
  isComplete: boolean
  hasProperNotation: boolean
  hasRehearsalMarks: boolean
  hasMeasureNumbers: boolean
  hasDynamicsMarkings: boolean
  hasArticulation: boolean
  hasPhrasing: boolean
  hasOrnamentation: boolean
  hasCadence: boolean
  hasNoMissingBars: boolean
  hasNoWrongNotes: boolean
  missingBarCount: number
  wrongNoteCount: number
}

export interface PerformanceMeasure {
  quality: number
  venue: 'carnegie-hall' | 'royal-albert' | 'concertgebouw' | 'local-hall' | 'school-gym' | 'street-corner'
  isPolished: boolean
  hasEmotionalDepth: boolean
  hasTechnicalVirtuosity: boolean
  hasEnsemblePrecision: boolean
  hasMusicality: boolean
  hasInterpretation: boolean
  hasNoWrongNotes: boolean
  hasNoMemorySlips: boolean
  hasNoBreakdowns: boolean
  hasStandingOvation: boolean
  wrongNoteCount: number
  breakdownCount: number
}

export interface SymphonyMovement {
  file: string
  harmonicCoordination: number
  rhythmicPrecision: number
  dynamicRange: number
  sectionBalance: number
  scoreFidelity: number
  performanceQuality: number
  harmony: HarmonyMeasure
  rhythm: RhythmMeasure
  dynamics: DynamicsMeasure
  sections: SectionsMeasure
  score: ScoreMeasure
  performance: PerformanceMeasure
  condition: 'standing-ovation' | 'bravo' | 'applause' | 'polite-clapping' | 'silence' | 'booing'
  qualityScore: number
}

export interface ConcertHall {
  directory: string
  movements: SymphonyMovement[]
  avgHarmony: number
  avgRhythm: number
  avgPerformance: number
  standingOvationCount: number
  booingCount: number
  balancedCount: number
  polishedCount: number
  hallType: 'world-class' | 'regional-philharmonic' | 'community-orchestra' | 'school-band' | 'garage-band' | 'kazoo-ensemble'
  condition: 'grand-season' | 'concert-series' | 'recital' | 'rehearsal' | 'practice-room' | 'noise-complaint'
}

export interface SymphonyHallResult {
  movements: SymphonyMovement[]
  halls: ConcertHall[]
  festival: {
    avgHarmony: number
    avgRhythm: number
    avgPerformance: number
    isHarmonious: boolean
    overallSymphony: number
  }
  stats: {
    totalFiles: number
    totalHalls: number
    avgHarmonicCoordination: number
    avgRhythmicPrecision: number
    avgDynamicRange: number
    avgSectionBalance: number
    avgScoreFidelity: number
    avgPerformanceQuality: number
    standingOvationCount: number
    bravoCount: number
    applauseCount: number
    politeClappingCount: number
    silenceCount: number
    booingCount: number
    isHarmoniousCount: number
    hasDissonanceCount: number
    isPreciseCount: number
    hasSyncopationCount: number
    hasWideRangeCount: number
    isBalancedCount: number
    hasNoMissingBarsCount: number
    hasNoWrongNotesCount: number
    isPolishedCount: number
    hasStandingOvationCount: number
    overallSymphony: number
    conductorGrade: 'maestro' | 'principal-conductor' | 'conductor' | 'assistant-conductor' | 'rehearsal-pianist' | 'metronome'
    bestMovement: string
    mostHarmonious: string
    mostPrecise: string
    bestBalanced: string
    bestPerformed: string
  }
  recommendations: string[]
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

/** @example countExports('export function foo() {}') returns 1 */
export function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

/** @example countImports("import { foo } from 'bar'") returns 1 */
export function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

/** @example countFunctions('function foo() {}') returns 1 */
export function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX)
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return countMatches(content, ARROW_REGEX)
}

/** @example countClasses('class Foo {}') returns 1 */
export function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

/** @example countInterfaces('interface Foo {}') returns 1 */
export function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

/** @example countTypeAliases('type Foo = string') returns 1 */
export function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

/** @example countComments('// hello') returns 1 */
export function countComments(content: string): number {
  return countMatches(content, COMMENT_REGEX) + countMatches(content, BLOCK_COMMENT_REGEX)
}

/** @example countJSDoc('/** docs *​/') returns 1 */
export function countJSDoc(content: string): number {
  return countMatches(content, JSDOC_REGEX)
}

/** @example countAsync('async function foo() {}') returns 1 */
export function countAsync(content: string): number {
  return countMatches(content, ASYNC_REGEX)
}

/** @example countAwaits('await x') returns 1 */
export function countAwaits(content: string): number {
  return countMatches(content, AWAIT_REGEX)
}

/** @example countTryCatch('try {') returns 1 */
export function countTryCatch(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

/** @example countCatches('catch') returns 1 */
export function countCatches(content: string): number {
  return countMatches(content, CATCH_REGEX)
}

/** @example countFinallys('finally') returns 1 */
export function countFinallys(content: string): number {
  return countMatches(content, FINALLY_REGEX)
}

/** @example countThrows('throw new Error()') returns 1 */
export function countThrows(content: string): number {
  return countMatches(content, THROW_REGEX)
}

/** @example countIfs('if (x)') returns 1 */
export function countIfs(content: string): number {
  return countMatches(content, IF_REGEX)
}

/** @example countElses('else') returns 1 */
export function countElses(content: string): number {
  return countMatches(content, ELSE_REGEX)
}

/** @example countNestedBlocks('if { if {} }') returns 1 */
export function countNestedBlocks(content: string): number {
  return countMatches(content, NESTED_BLOCK_REGEX)
}

/** @example countDeepNested('if { if { if } }') returns 1 */
export function countDeepNested(content: string): number {
  return countMatches(content, DEEP_NESTED_REGEX)
}

/** @example countTernaries('x ? 1 : 0') returns 1 */
export function countTernaries(content: string): number {
  return countMatches(content, TERNARY_REGEX)
}

/** @example countConsole('console.log(x)') returns 1 */
export function countConsole(content: string): number {
  return countMatches(content, CONSOLE_REGEX)
}

/** @example countTodos('// TODO: fix') returns 1 */
export function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX)
}

/** @example countErrors('new Error()') returns 1 */
export function countErrors(content: string): number {
  return countMatches(content, ERROR_REGEX)
}

/** @example countReturns('return x') returns 1 */
export function countReturns(content: string): number {
  return countMatches(content, RETURN_REGEX)
}

/** @example countSpreads('...args') returns 1 */
export function countSpreads(content: string): number {
  return countMatches(content, SPREAD_REGEX)
}

/** @example countDestructures('{ a, b } = obj') returns 1 */
export function countDestructures(content: string): number {
  return countMatches(content, DESTRUCTURE_REGEX)
}

/** @example countDefaultParams('function f(x = 1)') returns 1 */
export function countDefaultParams(content: string): number {
  return countMatches(content, DEFAULT_PARAM_REGEX)
}

/** @example countGenerics('function foo<T>() {}') returns 1 */
export function countGenerics(content: string): number {
  return countMatches(content, GENERICS_REGEX)
}

/** @example countAccessModifiers('private x') returns 1 */
export function countAccessModifiers(content: string): number {
  return countMatches(content, PRIVATE_REGEX) + countMatches(content, PROTECTED_REGEX) + countMatches(content, PUBLIC_REGEX)
}

/** @example countReadonly('readonly x') returns 1 */
export function countReadonly(content: string): number {
  return countMatches(content, READONLY_REGEX)
}

/** @example countStatic('static x') returns 1 */
export function countStatic(content: string): number {
  return countMatches(content, STATIC_REGEX)
}

/** @example countAny('any') returns 1 */
export function countAny(content: string): number {
  return countMatches(content, ANY_REGEX)
}

/** @example countCommentedCode('// function foo()') returns 1 */
export function countCommentedCode(content: string): number {
  return countMatches(content, COMMENTED_CODE_REGEX)
}

/** @example countPromises('Promise<string>') returns 1 */
export function countPromises(content: string): number {
  return countMatches(content, PROMISE_REGEX)
}

// ─── Harmony Measure ────────────────────────────────────────────────────────

/** @example measureHarmony('export function foo() {}') returns HarmonyMeasure */
export function measureHarmony(content: string): HarmonyMeasure {
  const exportCount = countExports(content)
  const importCount = countImports(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const classCount = countClasses(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const anyCount = countAny(content)
  const nestedCount = countNestedBlocks(content)
  const deepNestedCount = countDeepNested(content)

  const dissonanceCount = anyCount + deepNestedCount

  let coordination = 30
  coordination += Math.min(exportCount * 2, 10)
  coordination += Math.min(importCount * 2, 10)
  coordination += Math.min(interfaceCount * 3, 10)
  coordination += Math.min(typeCount * 2, 10)
  coordination += Math.min(classCount, 5)
  coordination += Math.min(functionCount, 5)
  coordination += Math.min(arrowCount, 5)
  coordination -= Math.min(anyCount * 5, 15)
  coordination -= Math.min(deepNestedCount * 3, 10)
  coordination = Math.max(0, Math.min(Math.round(coordination), 100))

  const key = coordination >= 80 ? 'C-major' : coordination >= 60 ? 'G-major' : coordination >= 40 ? 'D-minor' : coordination >= 25 ? 'A-minor' : coordination >= 10 ? 'chromatic' : 'atonal'

  return {
    coordination,
    key,
    isHarmonious: coordination >= 60,
    hasProperChords: interfaceCount > 0 && classCount > 0,
    hasCounterpoint: functionCount > 0 && arrowCount > 0,
    hasDissonance: anyCount > 0,
    hasResolution: anyCount === 0 || nestedCount === 0,
    hasModulation: interfaceCount > 0,
    hasVoiceLeading: exportCount > 0 && importCount > 0,
    hasParallelMotion: functionCount > 1,
    hasContraryMotion: classCount > 0 && interfaceCount > 0,
    hasSustainedPedal: functionCount > 0,
    dissonanceCount,
  }
}

// ─── Rhythm Measure ─────────────────────────────────────────────────────────

/** @example measureRhythm('async function foo() { await bar() }') returns RhythmMeasure */
export function measureRhythm(content: string): RhythmMeasure {
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const tryCatchCount = countTryCatch(content)
  const finallyCount = countFinallys(content)
  const ifCount = countIfs(content)
  const forCount = countMatches(content, FOR_REGEX)
  const whileCount = countMatches(content, WHILE_REGEX)
  const ternaryCount = countTernaries(content)
  const nestedCount = countNestedBlocks(content)
  const deepNestedCount = countDeepNested(content)
  const spreadCount = countSpreads(content)

  const syncopationCount = ternaryCount + deepNestedCount

  let precision = 50
  precision += Math.min(asyncCount * 3, 10)
  precision += Math.min(awaitCount * 2, 8)
  precision += Math.min(tryCatchCount * 2, 8)
  precision += Math.min(finallyCount * 3, 5)
  precision += Math.min(spreadCount, 5)
  precision -= Math.min(deepNestedCount * 3, 15)
  precision -= Math.min(ternaryCount, 5)
  precision -= Math.min(nestedCount, 5)
  precision = Math.max(0, Math.min(Math.round(precision), 100))

  const timeSignature = precision >= 80 ? '4/4' : precision >= 60 ? '3/4' : precision >= 40 ? '6/8' : precision >= 25 ? '5/4' : precision >= 10 ? '7/8' : 'free'

  return {
    precision,
    timeSignature,
    isPrecise: precision >= 60,
    hasSteadyBeat: forCount > 0 || whileCount > 0,
    hasSyncopation: ternaryCount > 2,
    hasPolyrhythm: asyncCount > 1 && forCount > 0,
    hasRubato: asyncCount > 0 && ternaryCount > 0,
    hasProperTempo: ifCount < 20,
    hasAccelerando: asyncCount > 2,
    hasRitardando: finallyCount > 0,
    hasFermata: awaitCount > 0,
    hasGraceNotes: spreadCount > 0,
    syncopationCount,
  }
}

// ─── Dynamics Measure ───────────────────────────────────────────────────────

/** @example measureDynamics('function foo<T>(x: T): Partial<T> {}') returns DynamicsMeasure */
export function measureDynamics(content: string): DynamicsMeasure {
  const genericCount = countGenerics(content)
  const unionTypeCount = countMatches(content, /\w+\s*\|\s*\w+/g)
  const utilityTypeCount = countMatches(content, UTILITY_TYPE_REGEX)
  const defaultParamCount = countDefaultParams(content)
  const optionalChainCount = countMatches(content, OPTIONAL_CHAIN_REGEX)
  const nullishCount = countMatches(content, NULLISH_REGEX)
  const destructureCount = countDestructures(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const nestedCount = countNestedBlocks(content)

  const distortionCount = anyCount + consoleCount

  let range = 20
  range += Math.min(genericCount * 3, 15)
  range += Math.min(unionTypeCount * 2, 10)
  range += Math.min(utilityTypeCount * 2, 10)
  range += Math.min(defaultParamCount * 2, 8)
  range += Math.min(optionalChainCount * 2, 5)
  range += Math.min(nullishCount * 2, 5)
  range += Math.min(destructureCount, 5)
  range -= Math.min(anyCount * 3, 10)
  range -= Math.min(consoleCount, 5)
  range = Math.max(0, Math.min(Math.round(range), 100))

  const marking = range >= 90 ? 'fff' : range >= 75 ? 'ff' : range >= 60 ? 'f' : range >= 45 ? 'mf' : range >= 30 ? 'mp' : range >= 20 ? 'p' : range >= 10 ? 'pp' : 'ppp'

  return {
    range,
    marking,
    hasWideRange: range >= 60,
    hasProperCrescendo: genericCount > 0 && defaultParamCount > 0,
    hasProperDecrescendo: utilityTypeCount > 0,
    hasSforzando: unionTypeCount > 2,
    hasFortepiano: optionalChainCount > 0 && nullishCount > 0,
    hasSubito: ternaryCount(content) > 3,
    hasTremolo: nestedCount > 5,
    hasNoDistortion: distortionCount === 0,
    hasProperHeadroom: range >= 40,
    hasDynamicControl: genericCount > 0,
    distortionCount,
  }
}

function ternaryCount(content: string): number {
  return countMatches(content, TERNARY_REGEX)
}

// ─── Sections Measure ───────────────────────────────────────────────────────

/** @example measureSections('function foo() {} class Bar {}') returns SectionsMeasure */
export function measureSections(content: string): SectionsMeasure {
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const enumCount = countMatches(content, ENUM_REGEX)
  const tryCatchCount = countTryCatch(content)
  const catchCount = countCatches(content)
  const throwCount = countThrows(content)
  const readonlyCount = countReadonly(content)
  const accessModCount = countAccessModifiers(content)
  const staticCount = countStatic(content)
  const decoratorCount = countMatches(content, DECORATOR_REGEX)
  const namespaceCount = countMatches(content, NAMESPACE_REGEX)

  const strings = Math.min(Math.round(functionCount * 5 + arrowCount * 3), 100)
  const woodwinds = Math.min(Math.round(typeCount * 5 + enumCount * 8 + decoratorCount * 5), 100)
  const brass = Math.min(Math.round(exportCount(content) * 3 + importCount(content) * 3), 100)
  const percussion = Math.min(Math.round(tryCatchCount * 10 + catchCount * 5 + throwCount * 5), 100)
  const keyboard = Math.min(Math.round(readonlyCount * 5 + accessModCount * 3 + staticCount * 3 + namespaceCount * 5), 100)

  const sections = [strings, woodwinds, brass, percussion, keyboard]
  const maxSection = Math.max(...sections)
  const minSection = Math.min(...sections)
  const spread = maxSection - minSection

  const dominanceCount = sections.filter(s => s > 60 && s > maxSection * 0.8).length

  let balance = 60
  balance -= Math.min(spread, 30)
  if (classCount > 0 && interfaceCount > 0) balance += 10
  if (functionCount > 0) balance += 5
  balance = Math.max(0, Math.min(Math.round(balance), 100))

  return {
    balance,
    strings,
    woodwinds,
    brass,
    percussion,
    keyboard,
    isBalanced: balance >= 50,
    hasProperMix: strings > 0 && brass > 0,
    hasNoDominance: dominanceCount <= 2,
    hasFullOrchestra: strings > 0 && woodwinds > 0 && brass > 0 && percussion > 0 && keyboard > 0,
    hasChamberEnsemble: strings > 0 && (woodwinds > 0 || brass > 0),
    hasSolo: maxSection > 60,
    hasTutti: strings > 20 && brass > 20,
    dominanceCount,
  }
}

function exportCount(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function importCount(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

// ─── Score Measure ──────────────────────────────────────────────────────────

/** @example measureScore('export function foo() { return 1 }') returns ScoreMeasure */
export function measureScore(content: string): ScoreMeasure {
  const exportCount2 = countExports(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const classCount = countClasses(content)
  const jsdocCount = countJSDoc(content)
  const commentCount = countComments(content)
  const returnCount = countReturns(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const anyCount = countAny(content)
  const commentedCodeCount = countCommentedCode(content)
  const todoCount = countTodos(content)
  const errorCount = countErrors(content)

  const missingBarCount = commentedCodeCount + todoCount
  const wrongNoteCount = anyCount + errorCount

  let fidelity = 40
  fidelity += Math.min(exportCount2 * 2, 10)
  fidelity += Math.min(functionCount * 2, 10)
  fidelity += Math.min(jsdocCount * 3, 10)
  fidelity += Math.min(interfaceCount * 2, 5)
  fidelity += Math.min(typeCount, 5)
  if (returnCount > 0) fidelity += 5
  if (classCount > 0) fidelity += 5
  fidelity -= Math.min(anyCount * 3, 10)
  fidelity -= Math.min(commentedCodeCount * 2, 10)
  fidelity -= Math.min(todoCount, 5)
  fidelity = Math.max(0, Math.min(Math.round(fidelity), 100))

  return {
    fidelity,
    isComplete: missingBarCount === 0 && wrongNoteCount === 0,
    hasProperNotation: jsdocCount > 0,
    hasRehearsalMarks: commentCount > 0,
    hasMeasureNumbers: functionCount > 0 || arrowCount > 0,
    hasDynamicsMarkings: jsdocCount > 0 || commentCount > functionCount,
    hasArticulation: interfaceCount > 0 || typeCount > 0,
    hasPhrasing: functionCount > 0 && returnCount > 0,
    hasOrnamentation: arrowCount > 0,
    hasCadence: returnCount > 0,
    hasNoMissingBars: missingBarCount === 0,
    hasNoWrongNotes: wrongNoteCount === 0,
    missingBarCount,
    wrongNoteCount,
  }
}

// ─── Performance Measure ────────────────────────────────────────────────────

/** @example measurePerformance('try { foo() } catch (e) { throw new Error() }') returns PerformanceMeasure */
export function measurePerformance(content: string): PerformanceMeasure {
  const tryCatchCount = countTryCatch(content)
  const catchCount = countCatches(content)
  const finallyCount = countFinallys(content)
  const throwCount = countThrows(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const anyCount = countAny(content)
  const deepNestedCount = countDeepNested(content)
  const errorCount = countErrors(content)
  const jsdocCount = countJSDoc(content)
  const commentCount = countComments(content)
  const consoleCount = countConsole(content)

  const wrongNoteCount = anyCount + errorCount
  const breakdownCount = deepNestedCount + (anyCount > 0 ? 1 : 0)

  let quality = 40
  quality += Math.min(tryCatchCount * 3, 8)
  quality += Math.min(catchCount * 2, 5)
  quality += Math.min(finallyCount * 3, 5)
  quality += Math.min(jsdocCount * 2, 8)
  quality += Math.min(Math.round(commentCount * 0.3), 5)
  if (asyncCount > 0 && tryCatchCount > 0) quality += 5
  if (throwCount > 0) quality += 3
  quality -= Math.min(anyCount * 5, 15)
  quality -= Math.min(deepNestedCount * 3, 10)
  quality -= Math.min(consoleCount * 0.5, 5)
  quality = Math.max(0, Math.min(Math.round(quality), 100))

  const venue = quality >= 85 ? 'carnegie-hall' : quality >= 70 ? 'royal-albert' : quality >= 55 ? 'concertgebouw' : quality >= 40 ? 'local-hall' : quality >= 20 ? 'school-gym' : 'street-corner'

  return {
    quality,
    venue,
    isPolished: quality >= 60,
    hasEmotionalDepth: tryCatchCount > 0 && finallyCount > 0,
    hasTechnicalVirtuosity: asyncCount > 0 && awaitCount > 0 && tryCatchCount > 0,
    hasEnsemblePrecision: tryCatchCount > 0,
    hasMusicality: jsdocCount > 0 && commentCount > 0,
    hasInterpretation: asyncCount > 0 && throwCount > 0,
    hasNoWrongNotes: wrongNoteCount === 0,
    hasNoMemorySlips: finallyCount > 0 || catchCount > 0,
    hasNoBreakdowns: breakdownCount === 0,
    hasStandingOvation: quality >= 80,
    wrongNoteCount,
    breakdownCount,
  }
}

// ─── Classification Helpers ─────────────────────────────────────────────────

/** @example classifyCondition(80) returns 'standing-ovation' */
export function classifyCondition(score: number): 'standing-ovation' | 'bravo' | 'applause' | 'polite-clapping' | 'silence' | 'booing' {
  if (score >= 80) return 'standing-ovation'
  if (score >= 60) return 'bravo'
  if (score >= 40) return 'applause'
  if (score >= 20) return 'polite-clapping'
  if (score >= 10) return 'silence'
  return 'booing'
}

/** @example classifyHallType(movements) returns hall type */
export function classifyHallType(movements: SymphonyMovement[]): 'world-class' | 'regional-philharmonic' | 'community-orchestra' | 'school-band' | 'garage-band' | 'kazoo-ensemble' {
  if (movements.length === 0) return 'kazoo-ensemble'
  const avg = movements.reduce((s, m) => s + m.qualityScore, 0) / movements.length
  if (avg >= 80) return 'world-class'
  if (avg >= 60) return 'regional-philharmonic'
  if (avg >= 40) return 'community-orchestra'
  if (avg >= 20) return 'school-band'
  if (avg >= 10) return 'garage-band'
  return 'kazoo-ensemble'
}

/** @example classifyHallCondition(avg) returns hall condition */
export function classifyHallCondition(avg: number): 'grand-season' | 'concert-series' | 'recital' | 'rehearsal' | 'practice-room' | 'noise-complaint' {
  if (avg >= 80) return 'grand-season'
  if (avg >= 60) return 'concert-series'
  if (avg >= 40) return 'recital'
  if (avg >= 20) return 'rehearsal'
  if (avg >= 10) return 'practice-room'
  return 'noise-complaint'
}

/** @example classifyConductorGrade(80) returns 'maestro' */
export function classifyConductorGrade(symphony: number): 'maestro' | 'principal-conductor' | 'conductor' | 'assistant-conductor' | 'rehearsal-pianist' | 'metronome' {
  if (symphony >= 85) return 'maestro'
  if (symphony >= 70) return 'principal-conductor'
  if (symphony >= 55) return 'conductor'
  if (symphony >= 40) return 'assistant-conductor'
  if (symphony >= 25) return 'rehearsal-pianist'
  return 'metronome'
}

// ─── Analyze Movement ───────────────────────────────────────────────────────

/** @example analyzeSymphonyMovement(content, 'foo.ts') returns SymphonyMovement */
export function analyzeSymphonyMovement(content: string, filePath: string): SymphonyMovement {
  const harmony = measureHarmony(content)
  const rhythm = measureRhythm(content)
  const dynamics = measureDynamics(content)
  const sections = measureSections(content)
  const score = measureScore(content)
  const performance = measurePerformance(content)

  const qualityScore = Math.round((harmony.coordination + rhythm.precision + dynamics.range + sections.balance + score.fidelity + performance.quality) / 6)
  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    harmonicCoordination: harmony.coordination,
    rhythmicPrecision: rhythm.precision,
    dynamicRange: dynamics.range,
    sectionBalance: sections.balance,
    scoreFidelity: score.fidelity,
    performanceQuality: performance.quality,
    harmony,
    rhythm,
    dynamics,
    sections,
    score,
    performance,
    condition,
    qualityScore,
  }
}

// ─── Analyze Concert Hall ───────────────────────────────────────────────────

/** @example analyzeConcertHall(movements, 'src/') returns ConcertHall */
export function analyzeConcertHall(movements: SymphonyMovement[], dirPath: string): ConcertHall {
  const avgHarmony = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.harmonicCoordination, 0) / movements.length) : 0
  const avgRhythm = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.rhythmicPrecision, 0) / movements.length) : 0
  const avgPerformance = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.performanceQuality, 0) / movements.length) : 0

  return {
    directory: dirPath,
    movements,
    avgHarmony,
    avgRhythm,
    avgPerformance,
    standingOvationCount: movements.filter(m => m.condition === 'standing-ovation').length,
    booingCount: movements.filter(m => m.condition === 'booing').length,
    balancedCount: movements.filter(m => m.sections.isBalanced).length,
    polishedCount: movements.filter(m => m.performance.isPolished).length,
    hallType: classifyHallType(movements),
    condition: classifyHallCondition(movements.length > 0 ? movements.reduce((s, m) => s + m.qualityScore, 0) / movements.length : 0),
  }
}

// ─── Generate Recommendations ───────────────────────────────────────────────

/** @example generateRecommendations(movements, [], festival, stats) returns string[] */
export function generateRecommendations(movements: SymphonyMovement[], halls: ConcertHall[], festival: SymphonyHallResult['festival'], stats: SymphonyHallResult['stats']): string[] {
  const recs: string[] = []

  if (festival.overallSymphony < 40) {
    recs.push('Overall symphony quality is critically low — consider major refactoring')
  }
  if (stats.avgHarmonicCoordination < 40) {
    recs.push('Improve harmonic coordination by adding interfaces and reducing `any` types')
  }
  if (stats.hasDissonanceCount > stats.totalFiles * 0.3) {
    recs.push('Reduce code dissonance — eliminate `any` types and deep nesting')
  }
  if (stats.avgRhythmicPrecision < 40) {
    recs.push('Improve rhythmic precision with better async/await patterns and error handling')
  }
  if (stats.booingCount > 0) {
    recs.push(`Address ${stats.booingCount} file(s) receiving booing — these need immediate attention`)
  }
  if (stats.avgDynamicRange < 30) {
    recs.push('Expand dynamic range with generics, union types, and optional chaining')
  }
  if (halls.some(h => h.condition === 'noise-complaint')) {
    recs.push('One or more halls have noise complaints — restructure low-quality directories')
  }
  if (recs.length === 0) {
    recs.push('Symphony is well-orchestrated — maintain current coordination and quality standards')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildSymphonyHallResult(['a.ts'], ['export const x = 1']) returns SymphonyHallResult */
export function buildSymphonyHallResult(
  files: string[],
  contents: string[],
  options?: { verbose?: boolean },
): SymphonyHallResult {
  const movements: SymphonyMovement[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    return analyzeSymphonyMovement(content, file)
  })

  const dirMap = new Map<string, SymphonyMovement[]>()
  for (const movement of movements) {
    const dir = movement.file.includes('/') ? movement.file.substring(0, movement.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(movement)
    } else {
      dirMap.set(dir, [movement])
    }
  }

  const halls: ConcertHall[] = Array.from(dirMap.entries()).map(([dir, dirMovements]) =>
    analyzeConcertHall(dirMovements, dir),
  )

  const avgHarmonicCoordination = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.harmonicCoordination, 0) / movements.length) : 0
  const avgRhythmicPrecision = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.rhythmicPrecision, 0) / movements.length) : 0
  const avgDynamicRange = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.dynamicRange, 0) / movements.length) : 0
  const avgSectionBalance = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.sectionBalance, 0) / movements.length) : 0
  const avgScoreFidelity = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.scoreFidelity, 0) / movements.length) : 0
  const avgPerformanceQuality = movements.length > 0 ? Math.round(movements.reduce((s, m) => s + m.performanceQuality, 0) / movements.length) : 0

  const overallSymphony = movements.length > 0
    ? Math.round((avgHarmonicCoordination + avgRhythmicPrecision + avgDynamicRange + avgSectionBalance + avgScoreFidelity + avgPerformanceQuality) / 6)
    : 0

  const festival = {
    avgHarmony: avgHarmonicCoordination,
    avgRhythm: avgRhythmicPrecision,
    avgPerformance: avgPerformanceQuality,
    isHarmonious: overallSymphony >= 50,
    overallSymphony,
  }

  const conductorGrade = classifyConductorGrade(overallSymphony)

  const bestMovement = movements.length > 0
    ? movements.reduce((best, m) => m.qualityScore > best.qualityScore ? m : best, movements[0]).file
    : ''
  const mostHarmonious = movements.length > 0
    ? movements.reduce((best, m) => m.harmonicCoordination > best.harmonicCoordination ? m : best, movements[0]).file
    : ''
  const mostPrecise = movements.length > 0
    ? movements.reduce((best, m) => m.rhythmicPrecision > best.rhythmicPrecision ? m : best, movements[0]).file
    : ''
  const bestBalanced = movements.length > 0
    ? movements.reduce((best, m) => m.sectionBalance > best.sectionBalance ? m : best, movements[0]).file
    : ''
  const bestPerformed = movements.length > 0
    ? movements.reduce((best, m) => m.performanceQuality > best.performanceQuality ? m : best, movements[0]).file
    : ''

  void options

  const stats = {
    totalFiles: movements.length,
    totalHalls: halls.length,
    avgHarmonicCoordination,
    avgRhythmicPrecision,
    avgDynamicRange,
    avgSectionBalance,
    avgScoreFidelity,
    avgPerformanceQuality,
    standingOvationCount: movements.filter(m => m.condition === 'standing-ovation').length,
    bravoCount: movements.filter(m => m.condition === 'bravo').length,
    applauseCount: movements.filter(m => m.condition === 'applause').length,
    politeClappingCount: movements.filter(m => m.condition === 'polite-clapping').length,
    silenceCount: movements.filter(m => m.condition === 'silence').length,
    booingCount: movements.filter(m => m.condition === 'booing').length,
    isHarmoniousCount: movements.filter(m => m.harmony.isHarmonious).length,
    hasDissonanceCount: movements.filter(m => m.harmony.hasDissonance).length,
    isPreciseCount: movements.filter(m => m.rhythm.isPrecise).length,
    hasSyncopationCount: movements.filter(m => m.rhythm.hasSyncopation).length,
    hasWideRangeCount: movements.filter(m => m.dynamics.hasWideRange).length,
    isBalancedCount: movements.filter(m => m.sections.isBalanced).length,
    hasNoMissingBarsCount: movements.filter(m => m.score.hasNoMissingBars).length,
    hasNoWrongNotesCount: movements.filter(m => m.score.hasNoWrongNotes).length,
    isPolishedCount: movements.filter(m => m.performance.isPolished).length,
    hasStandingOvationCount: movements.filter(m => m.performance.hasStandingOvation).length,
    overallSymphony,
    conductorGrade,
    bestMovement,
    mostHarmonious,
    mostPrecise,
    bestBalanced,
    bestPerformed,
  }

  const recommendations = generateRecommendations(movements, halls, festival, stats)

  return {
    movements,
    halls,
    festival,
    stats,
    recommendations,
  }
}
