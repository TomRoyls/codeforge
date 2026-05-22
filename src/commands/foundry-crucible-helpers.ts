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
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const PROMISE_REGEX = /\bPromise\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const BREAK_REGEX = /\bbreak\b/g
const CONTINUE_REGEX = /\bcontinue\b/g
const YIELD_REGEX = /\byield\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const DYNAMIC_IMPORT_REGEX = /\bimport\s*\(/g
const CALLBACK_NESTING_REGEX = /\bfunction\s*\([^)]*\)\s*\{[^{}]*\bfunction\s*\([^)]*\)\s*\{/g
const PROMISE_CHAIN_REGEX = /\.then\s*\(/g
const EARLY_RETURN_REGEX = /\bif\s*\([^)]*\)\s*\{[^}]*\breturn\b/g
const GUARD_CLAUSE_REGEX = /\bif\s*\([^)]*\)\s*\{?\s*\n?\s*\breturn\b/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface MetalMeasure {
  purity: number
  grade: 'titanium' | 'steel' | 'iron' | 'copper' | 'bronze' | 'tin'
  isPure: boolean
  hasNoImpurities: boolean
  hasNoSlag: boolean
  hasNoInclusions: boolean
  hasNoBlowholes: boolean
  hasProperCarbonContent: boolean
  hasNoPorosity: boolean
  hasFineGrain: boolean
  hasHomogeneous: boolean
  impurityCount: number
  blowholeCount: number
}

export interface CastingMeasure {
  quality: number
  method: 'investment' | 'sand' | 'die' | 'centrifugal' | 'continuous' | 'hand-poured'
  isWellCast: boolean
  hasSharpDetails: boolean
  hasSmoothSurface: boolean
  hasNoShrinkage: boolean
  hasNoColdShuts: boolean
  hasNoMisruns: boolean
  hasProperDraft: boolean
  hasNoFlash: boolean
  hasNoWarpage: boolean
  hasProperGating: boolean
  shrinkageCount: number
  misrunCount: number
}

export interface ForgingMeasure {
  strength: number
  technique: 'open-die' | 'closed-die' | 'roll' | 'press' | 'hammer' | 'unworked'
  isStrong: boolean
  hasProperGrain: boolean
  hasWorkHardening: boolean
  hasProperFlow: boolean
  hasNoCracking: boolean
  hasNoLaps: boolean
  hasNoSeams: boolean
  hasNoPipes: boolean
  hasProperUpset: boolean
  hasDrawingOut: boolean
  crackCount: number
  lapCount: number
}

export interface TemperMeasure {
  hardness: number
  scale: 'rockwell-60' | 'rockwell-50' | 'rockwell-40' | 'rockwell-30' | 'rockwell-20' | 'annealed'
  isHardened: boolean
  hasProperTemper: boolean
  hasNoBrittleness: boolean
  hasNoSoftSpots: boolean
  hasSpringTemper: boolean
  hasMartensite: boolean
  hasBainite: boolean
  hasPearlite: boolean
  hasAustenite: boolean
  hasNoQuenchCracks: boolean
  quenchCrackCount: number
}

export interface HeatMeasure {
  treatment: number
  process: 'annealing' | 'normalizing' | 'quenching' | 'case-hardening' | 'precipitation' | 'raw'
  isOptimized: boolean
  hasProperAnnealing: boolean
  hasNormalizing: boolean
  hasQuenching: boolean
  hasCaseHardening: boolean
  hasStressRelief: boolean
  hasPrecipitation: boolean
  hasAgeHardening: boolean
  hasSolutionTreatment: boolean
  hasNoOverheating: boolean
  overheatingCount: number
}

export interface AlloyMeasure {
  composition: number
  type: 'stainless-steel' | 'tool-steel' | 'spring-steel' | 'cast-iron' | 'wrought-iron' | 'pot-metal'
  isWellProportioned: boolean
  hasProperCarbon: boolean
  hasProperChromium: boolean
  hasProperNickel: boolean
  hasProperManganese: boolean
  hasProperSilicon: boolean
  hasProperMolybdenum: boolean
  hasBalancedComposition: boolean
  hasNoUndesirable: boolean
  hasNoSegregation: boolean
  undesirableCount: number
  segregationCount: number
}

export interface FoundryCasting {
  file: string
  metalPurity: number
  castingQuality: number
  forgingStrength: number
  temperHardness: number
  heatTreatment: number
  alloyComposition: number
  metal: MetalMeasure
  casting: CastingMeasure
  forging: ForgingMeasure
  temper: TemperMeasure
  heat: HeatMeasure
  alloy: AlloyMeasure
  condition: 'damascus-steel' | 'tool-steel' | 'structural-steel' | 'cast-iron' | 'pig-iron' | 'slag'
  qualityScore: number
}

export interface FoundryFloor {
  directory: string
  castings: FoundryCasting[]
  avgPurity: number
  avgStrength: number
  avgHardness: number
  damascusCount: number
  slagCount: number
  hardenedCount: number
  optimizedCount: number
  floorType: 'precision-foundry' | 'steel-mill' | 'iron-works' | 'brass-foundry' | 'scrap-yard' | 'volcano'
  condition: 'world-class-foundry' | 'modern-steel-works' | 'traditional-forge' | 'backyard-foundry' | 'scrap-metal' | 'cold-ashes'
}

export interface FoundryCrucibleResult {
  castings: FoundryCasting[]
  floors: FoundryFloor[]
  guild: {
    avgPurity: number
    avgStrength: number
    avgHardness: number
    isHighGrade: boolean
    overallStrength: number
  }
  stats: {
    totalFiles: number
    totalFloors: number
    avgMetalPurity: number
    avgCastingQuality: number
    avgForgingStrength: number
    avgTemperHardness: number
    avgHeatTreatment: number
    avgAlloyComposition: number
    damascusSteelCount: number
    toolSteelCount: number
    structuralSteelCount: number
    castIronCount: number
    pigIronCount: number
    slagCount: number
    isPureCount: number
    hasNoImpuritiesCount: number
    isWellCastCount: number
    hasNoShrinkageCount: number
    isStrongCount: number
    hasNoCrackingCount: number
    isHardenedCount: number
    isOptimizedCount: number
    hasNoOverheatingCount: number
    hasBalancedCompositionCount: number
    overallStrength: number
    metallurgistGrade: 'master-metallurgist' | 'metallurgist' | 'blacksmith' | 'apprentice' | 'tinker' | 'scrap-dealer'
    bestCasting: string
    purestMetal: string
    bestForged: string
    hardestTemper: string
    bestAlloy: string
  }
  recommendations: string[]
}

// ─── Counter helpers ────────────────────────────────────────────────────────

/** @example countExports('export const x = 1') returns 1 */
export function countExports(content: string): number {
  return (content.match(EXPORT_REGEX) ?? []).length
}

/** @example countImports('import { x } from "y"') returns 1 */
export function countImports(content: string): number {
  return (content.match(IMPORT_REGEX) ?? []).length
}

/** @example countFunctions('function foo() {}') returns 1 */
export function countFunctions(content: string): number {
  return (content.match(FUNCTION_REGEX) ?? []).length
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return (content.match(ARROW_REGEX) ?? []).length
}

/** @example countClasses('class Foo {}') returns 1 */
export function countClasses(content: string): number {
  return (content.match(CLASS_REGEX) ?? []).length
}

/** @example countInterfaces('interface Foo {}') returns 1 */
export function countInterfaces(content: string): number {
  return (content.match(INTERFACE_REGEX) ?? []).length
}

/** @example countTypeAliases('type X = string') returns 1 */
export function countTypeAliases(content: string): number {
  return (content.match(TYPE_REGEX) ?? []).length
}

/** @example countEnums('enum Color { Red }') returns 1 */
export function countEnums(content: string): number {
  return (content.match(ENUM_REGEX) ?? []).length
}

/** @example countComments('// hello') returns 1 */
export function countComments(content: string): number {
  return (content.match(COMMENT_REGEX) ?? []).length
}

/** @example countJSDoc(content) returns JSDoc count */
export function countJSDoc(content: string): number {
  return (content.match(JSDOC_REGEX) ?? []).length
}

/** @example countBlockComments(content) returns block comment count */
export function countBlockComments(content: string): number {
  return (content.match(BLOCK_COMMENT_REGEX) ?? []).length
}

/** @example countAsync('async function f() {}') returns 1 */
export function countAsync(content: string): number {
  return (content.match(ASYNC_REGEX) ?? []).length
}

/** @example countAwaits('await x') returns 1 */
export function countAwaits(content: string): number {
  return (content.match(AWAIT_REGEX) ?? []).length
}

/** @example countTryCatch('try {}') returns 1 */
export function countTryCatch(content: string): number {
  return (content.match(TRY_CATCH_REGEX) ?? []).length
}

/** @example countCatches('catch(e)') returns 1 */
export function countCatches(content: string): number {
  return (content.match(CATCH_REGEX) ?? []).length
}

/** @example countFinallys('finally {}') returns 1 */
export function countFinallys(content: string): number {
  return (content.match(FINALLY_REGEX) ?? []).length
}

/** @example countThrows('throw new Error()') returns 1 */
export function countThrows(content: string): number {
  return (content.match(THROW_REGEX) ?? []).length
}

/** @example countIfs('if (x)') returns 1 */
export function countIfs(content: string): number {
  return (content.match(IF_REGEX) ?? []).length
}

/** @example countElses('else') returns 1 */
export function countElses(content: string): number {
  return (content.match(ELSE_REGEX) ?? []).length
}

/** @example countSwitches('switch(x)') returns 1 */
export function countSwitches(content: string): number {
  return (content.match(SWITCH_REGEX) ?? []).length
}

/** @example countForLoops('for (;;)') returns 1 */
export function countForLoops(content: string): number {
  return (content.match(FOR_REGEX) ?? []).length
}

/** @example countWhileLoops('while(x)') returns 1 */
export function countWhileLoops(content: string): number {
  return (content.match(WHILE_REGEX) ?? []).length
}

/** @example countNestedBlocks(code) returns nested count */
export function countNestedBlocks(content: string): number {
  return (content.match(NESTED_BLOCK_REGEX) ?? []).length
}

/** @example countDeepNested(code) returns deep nested count */
export function countDeepNested(content: string): number {
  return (content.match(DEEP_NESTED_REGEX) ?? []).length
}

/** @example countTernaries('x ? 1 : 2') returns 1 */
export function countTernaries(content: string): number {
  return (content.match(TERNARY_REGEX) ?? []).length
}

/** @example countConsole('console.log()') returns 1 */
export function countConsole(content: string): number {
  return (content.match(CONSOLE_REGEX) ?? []).length
}

/** @example countTodos('// TODO: fix') returns 1 */
export function countTodos(content: string): number {
  return (content.match(TODO_REGEX) ?? []).length
}

/** @example countErrors('new Error()') returns 1 */
export function countErrors(content: string): number {
  return (content.match(ERROR_REGEX) ?? []).length
}

/** @example countReturns('return x') returns 1 */
export function countReturns(content: string): number {
  return (content.match(RETURN_REGEX) ?? []).length
}

/** @example countDefaultParams('f(x = 1)') returns 1 */
export function countDefaultParams(content: string): number {
  return (content.match(DEFAULT_PARAM_REGEX) ?? []).length
}

/** @example countSpreads('...args') returns 1 */
export function countSpreads(content: string): number {
  return (content.match(SPREAD_REGEX) ?? []).length
}

/** @example countDestructures('{ x } = obj') returns 1 */
export function countDestructures(content: string): number {
  return (content.match(DESTRUCTURE_REGEX) ?? []).length
}

/** @example countGenerics('<T>') returns 1 */
export function countGenerics(content: string): number {
  return (content.match(GENERICS_REGEX) ?? []).length
}

/** @example countAccessModifiers('private x') returns count */
export function countAccessModifiers(content: string): number {
  const priv = (content.match(PRIVATE_REGEX) ?? []).length
  const prot = (content.match(PROTECTED_REGEX) ?? []).length
  const pub = (content.match(PUBLIC_REGEX) ?? []).length
  return priv + prot + pub
}

/** @example countStatic('static x') returns 1 */
export function countStatic(content: string): number {
  return (content.match(STATIC_REGEX) ?? []).length
}

/** @example countAny('any') returns count */
export function countAny(content: string): number {
  return (content.match(ANY_REGEX) ?? []).length
}

/** @example countReadonly('readonly') returns count */
export function countReadonly(content: string): number {
  return (content.match(READONLY_REGEX) ?? []).length
}

/** @example countPromises('Promise') returns count */
export function countPromises(content: string): number {
  return (content.match(PROMISE_REGEX) ?? []).length
}

/** @example countCommentedCode('// function foo()') returns count */
export function countCommentedCode(content: string): number {
  return (content.match(COMMENTED_CODE_REGEX) ?? []).length
}

/** @example countCallbackNesting(code) returns count */
export function countCallbackNesting(content: string): number {
  return (content.match(CALLBACK_NESTING_REGEX) ?? []).length
}

/** @example countPromiseChains('.then(') returns count */
export function countPromiseChains(content: string): number {
  return (content.match(PROMISE_CHAIN_REGEX) ?? []).length
}

/** @example countEarlyReturns(code) returns count */
export function countEarlyReturns(content: string): number {
  return (content.match(EARLY_RETURN_REGEX) ?? []).length
}

/** @example countReexports('export { x } from') returns count */
export function countReexports(content: string): number {
  return (content.match(REEXPORT_REGEX) ?? []).length
}

/** @example countDynamicImports('import(') returns count */
export function countDynamicImports(content: string): number {
  return (content.match(DYNAMIC_IMPORT_REGEX) ?? []).length
}

/** @example countBreaks('break') returns count */
export function countBreaks(content: string): number {
  return (content.match(BREAK_REGEX) ?? []).length
}

/** @example countContinues('continue') returns count */
export function countContinues(content: string): number {
  return (content.match(CONTINUE_REGEX) ?? []).length
}

/** @example countYields('yield x') returns count */
export function countYields(content: string): number {
  return (content.match(YIELD_REGEX) ?? []).length
}

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureMetal(content) returns MetalMeasure */
export function measureMetal(content: string): MetalMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)

  const impurityCount = anyCount + commentedCode
  const blowholeCount = todos + consoleCount
  const hasNoImpurities = impurityCount === 0
  const hasNoSlag = commentedCode === 0
  const hasNoInclusions = anyCount === 0
  const hasNoBlowholes = blowholeCount === 0
  const hasProperCarbonContent = nestedBlocks <= 10
  const hasNoPorosity = exports > 0 || classes > 0
  const hasFineGrain = funcs + classes <= 15
  const hasHomogeneous = (interfaces + types) > 0 === (funcs + classes) > 0 || (interfaces + types + funcs + classes) === 0
  const isPure = hasNoImpurities && hasNoSlag && hasNoBlowholes

  let purity = 0
  if (hasNoImpurities) purity += 20
  if (hasNoSlag) purity += 15
  if (hasNoInclusions) purity += 15
  if (hasNoBlowholes) purity += 10
  if (hasProperCarbonContent) purity += 10
  if (hasNoPorosity) purity += 10
  if (hasFineGrain) purity += 10
  if (hasHomogeneous) purity += 10
  purity = Math.min(purity, 100)
  purity = Math.max(purity, 0)

  let grade: MetalMeasure['grade'] = 'tin'
  if (purity >= 80) grade = 'titanium'
  else if (purity >= 65) grade = 'steel'
  else if (purity >= 50) grade = 'iron'
  else if (purity >= 35) grade = 'copper'
  else if (purity >= 20) grade = 'bronze'
  else grade = 'tin'

  return {
    blowholeCount,
    grade,
    hasFineGrain,
    hasHomogeneous,
    hasNoBlowholes,
    hasNoImpurities,
    hasNoInclusions,
    hasNoPorosity,
    hasNoSlag,
    hasProperCarbonContent,
    impurityCount,
    isPure,
    purity,
  }
}

/** @example measureCasting(content) returns CastingMeasure */
export function measureCasting(content: string): CastingMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const jsdoc = countJSDoc(content)
  const accessMods = countAccessModifiers(content)
  const generics = countGenerics(content)
  const ifs = countIfs(content)
  const returns = countReturns(content)
  const tryCatch = countTryCatch(content)
  const throws = countThrows(content)
  const errors = countErrors(content)

  const hasSharpDetails = generics > 0 && (interfaces + types) > 0
  const hasSmoothSurface = jsdoc > 0 && accessMods > 0
  const hasNoShrinkage = ifs > 0 && returns > 0
  const hasNoColdShuts = tryCatch > 0 || throws > 0
  const hasNoMisruns = exports > 0 && (funcs + classes) > 0
  const hasProperDraft = exports > 0 && imports > 0
  const hasNoFlash = errors <= 3
  const hasNoWarpage = classes <= 5
  const hasProperGating = imports > 0 && imports <= 20
  const shrinkageCount = ifs === 0 ? 1 : 0
  const misrunCount = exports === 0 ? 1 : 0
  const isWellCast = hasSharpDetails && hasNoShrinkage && hasNoMisruns && hasProperDraft

  let quality = 0
  if (hasSharpDetails) quality += 15
  if (hasSmoothSurface) quality += 15
  if (hasNoShrinkage) quality += 10
  if (hasNoColdShuts) quality += 10
  if (hasNoMisruns) quality += 10
  if (hasProperDraft) quality += 10
  if (hasNoFlash) quality += 10
  if (hasNoWarpage) quality += 5
  if (hasProperGating) quality += 10
  if (jsdoc > 0) quality += 5
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let method: CastingMeasure['method'] = 'hand-poured'
  if (quality >= 80) method = 'investment'
  else if (quality >= 65) method = 'die'
  else if (quality >= 50) method = 'centrifugal'
  else if (quality >= 35) method = 'sand'
  else if (quality >= 20) method = 'continuous'
  else method = 'hand-poured'

  return {
    hasNoColdShuts,
    hasNoFlash,
    hasNoMisruns,
    hasNoShrinkage,
    hasNoWarpage,
    hasProperDraft,
    hasProperGating,
    hasSharpDetails,
    hasSmoothSurface,
    isWellCast,
    method,
    misrunCount,
    quality,
    shrinkageCount,
  }
}

/** @example measureForging(content) returns ForgingMeasure */
export function measureForging(content: string): ForgingMeasure {
  const funcs = countFunctions(content)
  const arrows = countArrows(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const tryCatch = countTryCatch(content)
  const earlyReturns = countEarlyReturns(content)
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)
  const spreads = countSpreads(content)
  const destructures = countDestructures(content)
  const callbacks = countCallbackNesting(content)

  const hasProperGrain = (funcs + arrows) > 0 && (interfaces + types) > 0
  const hasWorkHardening = tryCatch > 0 && (funcs + arrows) > 0
  const hasProperFlow = asyncCount > 0 && awaitCount > 0
  const hasNoCracking = deepNested <= 2
  const hasNoLaps = callbacks === 0
  const hasNoSeams = spreads > 0 || destructures > 0
  const hasNoPipes = funcs + arrows <= 10
  const hasProperUpset = (funcs + arrows) >= 2 && (funcs + arrows) <= 8
  const hasDrawingOut = asyncCount > 0 || spreads > 0
  const crackCount = deepNested > 2 ? deepNested : 0
  const lapCount = callbacks
  const isStrong = hasProperGrain && hasNoCracking && hasNoLaps

  let strength = 0
  if (hasProperGrain) strength += 15
  if (hasWorkHardening) strength += 15
  if (hasProperFlow) strength += 10
  if (hasNoCracking) strength += 15
  if (hasNoLaps) strength += 10
  if (hasNoSeams) strength += 5
  if (hasNoPipes) strength += 10
  if (hasProperUpset) strength += 10
  if (hasDrawingOut) strength += 10
  strength = Math.min(strength, 100)
  strength = Math.max(strength, 0)

  let technique: ForgingMeasure['technique'] = 'unworked'
  if (strength >= 80) technique = 'closed-die'
  else if (strength >= 65) technique = 'open-die'
  else if (strength >= 50) technique = 'press'
  else if (strength >= 35) technique = 'roll'
  else if (strength >= 20) technique = 'hammer'
  else technique = 'unworked'

  return {
    crackCount,
    hasDrawingOut,
    hasNoCracking,
    hasNoLaps,
    hasNoPipes,
    hasNoSeams,
    hasProperFlow,
    hasProperGrain,
    hasProperUpset,
    hasWorkHardening,
    isStrong,
    lapCount,
    strength,
    technique,
  }
}

/** @example measureTemper(content) returns TemperMeasure */
export function measureTemper(content: string): TemperMeasure {
  const tryCatch = countTryCatch(content)
  const catches = countCatches(content)
  const finallys = countFinallys(content)
  const throws = countThrows(content)
  const errors = countErrors(content)
  const ifs = countIfs(content)
  const ternaries = countTernaries(content)
  const nullish = (content.match(NULLISH_REGEX) ?? []).length
  const optionalChain = (content.match(OPTIONAL_CHAIN_REGEX) ?? []).length
  const defaults = countDefaultParams(content)
  const accessMods = countAccessModifiers(content)
  const readonly = countReadonly(content)
  const staticCount = countStatic(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const hasProperTemper = tryCatch > 0 && (ifs > 0 || ternaries > 0)
  const hasNoBrittleness = accessMods <= 20
  const hasNoSoftSpots = tryCatch > 0 || catches > 0
  const hasSpringTemper = tryCatch > 0 && finallys > 0
  const hasMartensite = errors > 0 && throws > 0
  const hasBainite = tryCatch > 0 && ternaries > 0
  const hasPearlite = accessMods > 0 && readonly > 0
  const hasAustenite = nullish > 0 || optionalChain > 0
  const quenchCrackCount = todos + consoleCount
  const hasNoQuenchCracks = quenchCrackCount === 0
  const isHardened = hasProperTemper && hasNoSoftSpots && hasNoQuenchCracks

  let hardness = 0
  if (hasProperTemper) hardness += 15
  if (hasNoBrittleness) hardness += 10
  if (hasNoSoftSpots) hardness += 10
  if (hasSpringTemper) hardness += 10
  if (hasMartensite) hardness += 10
  if (hasBainite) hardness += 10
  if (hasPearlite) hardness += 10
  if (hasAustenite) hardness += 10
  if (hasNoQuenchCracks) hardness += 10
  if (defaults > 0) hardness += 5
  hardness = Math.min(hardness, 100)
  hardness = Math.max(hardness, 0)

  let scale: TemperMeasure['scale'] = 'annealed'
  if (hardness >= 80) scale = 'rockwell-60'
  else if (hardness >= 65) scale = 'rockwell-50'
  else if (hardness >= 50) scale = 'rockwell-40'
  else if (hardness >= 35) scale = 'rockwell-30'
  else if (hardness >= 20) scale = 'rockwell-20'
  else scale = 'annealed'

  return {
    hasAustenite,
    hasBainite,
    hasMartensite,
    hasNoBrittleness,
    hasNoQuenchCracks,
    hasNoSoftSpots,
    hasPearlite,
    hasProperTemper,
    hasSpringTemper,
    hardness,
    isHardened,
    quenchCrackCount,
    scale,
  }
}

/** @example measureHeat(content) returns HeatMeasure */
export function measureHeat(content: string): HeatMeasure {
  const asyncCount = countAsync(content)
  const promises = countPromises(content)
  const spreads = countSpreads(content)
  const destructures = countDestructures(content)
  const generics = countGenerics(content)
  const jsdoc = countJSDoc(content)
  const blockComments = countBlockComments(content)
  const comments = countComments(content)
  const reexports = countReexports(content)
  const dynamicImports = countDynamicImports(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)

  const hasProperAnnealing = blockComments > 0 && comments > 3
  const hasNormalizing = generics > 0 && (spreads + destructures) > 0
  const hasQuenching = asyncCount > 0 && promises > 0
  const hasCaseHardening = jsdoc > 0
  const hasStressRelief = asyncCount > 0 && promises > 0
  const hasPrecipitation = reexports > 0 || dynamicImports > 0
  const hasAgeHardening = blockComments > 0 && jsdoc > 0
  const hasSolutionTreatment = hasProperAnnealing && hasNormalizing
  const overheatingCount = anyCount + commentedCode + (deepNested > 3 ? deepNested : 0)
  const hasNoOverheating = overheatingCount === 0
  const isOptimized = hasQuenching && hasNormalizing && hasNoOverheating

  let treatment = 0
  if (hasProperAnnealing) treatment += 15
  if (hasNormalizing) treatment += 15
  if (hasQuenching) treatment += 15
  if (hasCaseHardening) treatment += 10
  if (hasStressRelief) treatment += 10
  if (hasPrecipitation) treatment += 5
  if (hasAgeHardening) treatment += 10
  if (hasSolutionTreatment) treatment += 10
  if (hasNoOverheating) treatment += 10
  treatment = Math.min(treatment, 100)
  treatment = Math.max(treatment, 0)

  let process: HeatMeasure['process'] = 'raw'
  if (treatment >= 80) process = 'annealing'
  else if (treatment >= 65) process = 'normalizing'
  else if (treatment >= 50) process = 'quenching'
  else if (treatment >= 35) process = 'case-hardening'
  else if (treatment >= 20) process = 'precipitation'
  else process = 'raw'

  return {
    hasAgeHardening,
    hasCaseHardening,
    hasNormalizing,
    hasNoOverheating,
    hasPrecipitation,
    hasProperAnnealing,
    hasQuenching,
    hasSolutionTreatment,
    hasStressRelief,
    isOptimized,
    overheatingCount,
    process,
    treatment,
  }
}

/** @example measureAlloy(content) returns AlloyMeasure */
export function measureAlloy(content: string): AlloyMeasure {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const enums = countEnums(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const accessMods = countAccessModifiers(content)
  const generics = countGenerics(content)
  const tryCatch = countTryCatch(content)
  const asyncCount = countAsync(content)
  const jsdoc = countJSDoc(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)

  const hasProperCarbon = (funcs + classes) > 0 && (funcs + classes) <= 15
  const hasProperChromium = interfaces + types > 0
  const hasProperNickel = tryCatch > 0
  const hasProperManganese = asyncCount > 0
  const hasProperSilicon = jsdoc > 0 || comments_count(content) > 5
  const hasProperMolybdenum = generics > 0
  const hasBalancedComposition = hasProperCarbon && hasProperChromium && hasProperNickel
  const undesirableCount = anyCount + consoleCount + todos
  const segregationCount = commentedCode
  const hasNoUndesirable = undesirableCount === 0
  const hasNoSegregation = segregationCount === 0
  const isWellProportioned = hasBalancedComposition && hasNoUndesirable

  let composition = 0
  if (hasProperCarbon) composition += 15
  if (hasProperChromium) composition += 15
  if (hasProperNickel) composition += 10
  if (hasProperManganese) composition += 10
  if (hasProperSilicon) composition += 15
  if (hasProperMolybdenum) composition += 10
  if (hasBalancedComposition) composition += 10
  if (hasNoUndesirable) composition += 10
  if (hasNoSegregation) composition += 5
  composition = Math.min(composition, 100)
  composition = Math.max(composition, 0)

  let type: AlloyMeasure['type'] = 'pot-metal'
  if (composition >= 80) type = 'stainless-steel'
  else if (composition >= 65) type = 'tool-steel'
  else if (composition >= 50) type = 'spring-steel'
  else if (composition >= 35) type = 'cast-iron'
  else if (composition >= 20) type = 'wrought-iron'
  else type = 'pot-metal'

  return {
    composition,
    hasBalancedComposition,
    hasNoSegregation,
    hasNoUndesirable,
    hasProperCarbon,
    hasProperChromium,
    hasProperManganese,
    hasProperMolybdenum,
    hasProperNickel,
    hasProperSilicon,
    isWellProportioned,
    segregationCount,
    type,
    undesirableCount,
  }
}

function comments_count(content: string): number {
  return (content.match(COMMENT_REGEX) ?? []).length
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(85) returns 'damascus-steel' */
export function classifyCondition(score: number): FoundryCasting['condition'] {
  if (score >= 80) return 'damascus-steel'
  if (score >= 65) return 'tool-steel'
  if (score >= 50) return 'structural-steel'
  if (score >= 35) return 'cast-iron'
  if (score >= 20) return 'pig-iron'
  return 'slag'
}

/** @example classifyFloorType(castings) returns floor type */
export function classifyFloorType(castings: FoundryCasting[]): FoundryFloor['floorType'] {
  if (castings.length === 0) return 'volcano'
  const avgQuality = castings.reduce((s, c) => s + c.qualityScore, 0) / castings.length
  const damascus = castings.filter((c) => c.condition === 'damascus-steel').length
  if (avgQuality >= 75 && damascus >= Math.ceil(castings.length * 0.3)) return 'precision-foundry'
  if (avgQuality >= 60) return 'steel-mill'
  if (avgQuality >= 40) return 'iron-works'
  if (avgQuality >= 25) return 'brass-foundry'
  if (avgQuality >= 10) return 'scrap-yard'
  return 'volcano'
}

/** @example classifyFloorCondition(avgQuality) returns floor condition */
export function classifyFloorCondition(avgQuality: number): FoundryFloor['condition'] {
  if (avgQuality >= 80) return 'world-class-foundry'
  if (avgQuality >= 65) return 'modern-steel-works'
  if (avgQuality >= 50) return 'traditional-forge'
  if (avgQuality >= 35) return 'backyard-foundry'
  if (avgQuality >= 20) return 'scrap-metal'
  return 'cold-ashes'
}

/** @example classifyMetallurgistGrade(85) returns 'master-metallurgist' */
export function classifyMetallurgistGrade(avgStrength: number): FoundryCrucibleResult['stats']['metallurgistGrade'] {
  if (avgStrength >= 80) return 'master-metallurgist'
  if (avgStrength >= 65) return 'metallurgist'
  if (avgStrength >= 50) return 'blacksmith'
  if (avgStrength >= 35) return 'apprentice'
  if (avgStrength >= 20) return 'tinker'
  return 'scrap-dealer'
}

// ─── Analysis Functions ─────────────────────────────────────────────────────

/** @example analyzeFoundryCasting(content, filePath) returns FoundryCasting */
export function analyzeFoundryCasting(content: string, filePath: string): FoundryCasting {
  const metal = measureMetal(content)
  const casting = measureCasting(content)
  const forging = measureForging(content)
  const temper = measureTemper(content)
  const heat = measureHeat(content)
  const alloy = measureAlloy(content)

  const qualityScore = Math.round(
    (metal.purity * 0.2 + casting.quality * 0.2 + forging.strength * 0.2 +
     temper.hardness * 0.15 + heat.treatment * 0.1 + alloy.composition * 0.15)
  )

  const condition = classifyCondition(qualityScore)

  return {
    alloy,
    alloyComposition: alloy.composition,
    casting,
    castingQuality: casting.quality,
    condition,
    file: filePath,
    forging,
    forgingStrength: forging.strength,
    heat,
    heatTreatment: heat.treatment,
    metal,
    metalPurity: metal.purity,
    qualityScore,
    temper,
    temperHardness: temper.hardness,
  }
}

/** @example analyzeFoundryFloor(castings, dirPath) returns FoundryFloor */
export function analyzeFoundryFloor(castings: FoundryCasting[], dirPath: string): FoundryFloor {
  const avgPurity = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.metalPurity, 0) / castings.length) : 0
  const avgStrength = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.forgingStrength, 0) / castings.length) : 0
  const avgHardness = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.temperHardness, 0) / castings.length) : 0
  const damascusCount = castings.filter((c) => c.condition === 'damascus-steel').length
  const slagCount = castings.filter((c) => c.condition === 'slag').length
  const hardenedCount = castings.filter((c) => c.temper.isHardened).length
  const optimizedCount = castings.filter((c) => c.heat.isOptimized).length

  const floorType = classifyFloorType(castings)
  const avgQuality = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.qualityScore, 0) / castings.length) : 0
  const condition = classifyFloorCondition(avgQuality)

  return {
    avgHardness,
    avgPurity,
    avgStrength,
    castings,
    condition,
    damascusCount,
    directory: dirPath,
    floorType,
    hardenedCount,
    optimizedCount,
    slagCount,
  }
}

/** @example generateRecommendations(castings, floors, guild, stats) returns string[] */
export function generateRecommendations(
  castings: FoundryCasting[],
  _floors: FoundryFloor[],
  guild: FoundryCrucibleResult['guild'],
  _stats: FoundryCrucibleResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (guild.overallStrength < 50) {
    recommendations.push('Overall foundry strength is low — prioritize refactoring weak castings')
  }

  const impureCastings = castings.filter((c) => !c.metal.isPure)
  if (impureCastings.length > 0) {
    recommendations.push(`${impureCastings.length} file(s) have code impurities — remove any types, dead code, and console statements`)
  }

  const weakCastings = castings.filter((c) => c.forging.strength < 40)
  if (weakCastings.length > 0) {
    recommendations.push(`${weakCastings.length} file(s) have weak forging — improve code structure and reduce nesting depth`)
  }

  const brittleCastings = castings.filter((c) => !c.temper.hasProperTemper)
  if (brittleCastings.length > 0) {
    recommendations.push(`${brittleCastings.length} file(s) lack proper tempering — add error handling and edge case coverage`)
  }

  const rawCastings = castings.filter((c) => c.heat.process === 'raw')
  if (rawCastings.length > 0) {
    recommendations.push(`${rawCastings.length} file(s) are raw/untreated — add documentation, types, and async patterns`)
  }

  const slagCastings = castings.filter((c) => c.condition === 'slag')
  if (slagCastings.length > 0) {
    recommendations.push(`${slagCastings.length} file(s) are slag quality — consider complete rewrite`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Foundry is producing high-grade steel — maintain current quality standards')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildFoundryCrucibleResult(files, contents, options) returns FoundryCrucibleResult */
export function buildFoundryCrucibleResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): FoundryCrucibleResult {
  const castings: FoundryCasting[] = files.map((file, i) =>
    analyzeFoundryCasting(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, FoundryCasting[]>()
  for (const casting of castings) {
    const dir = casting.file.includes('/') ? casting.file.substring(0, casting.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(casting)
    } else {
      dirMap.set(dir, [casting])
    }
  }

  const floors: FoundryFloor[] = Array.from(dirMap.entries()).map(([dir, dirCastings]) =>
    analyzeFoundryFloor(dirCastings, dir),
  )

  const avgPurity = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.metalPurity, 0) / castings.length) : 0
  const avgStrength = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.forgingStrength, 0) / castings.length) : 0
  const avgHardness = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.temperHardness, 0) / castings.length) : 0
  const overallStrength = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.qualityScore, 0) / castings.length) : 0

  const guild = {
    avgHardness,
    avgPurity,
    avgStrength,
    isHighGrade: overallStrength >= 50,
    overallStrength,
  }

  const damascusSteelCount = castings.filter((c) => c.condition === 'damascus-steel').length
  const toolSteelCount = castings.filter((c) => c.condition === 'tool-steel').length
  const structuralSteelCount = castings.filter((c) => c.condition === 'structural-steel').length
  const castIronCount = castings.filter((c) => c.condition === 'cast-iron').length
  const pigIronCount = castings.filter((c) => c.condition === 'pig-iron').length
  const slagCount = castings.filter((c) => c.condition === 'slag').length
  const isPureCount = castings.filter((c) => c.metal.isPure).length
  const hasNoImpuritiesCount = castings.filter((c) => c.metal.hasNoImpurities).length
  const isWellCastCount = castings.filter((c) => c.casting.isWellCast).length
  const hasNoShrinkageCount = castings.filter((c) => c.casting.hasNoShrinkage).length
  const isStrongCount = castings.filter((c) => c.forging.isStrong).length
  const hasNoCrackingCount = castings.filter((c) => c.forging.hasNoCracking).length
  const isHardenedCount = castings.filter((c) => c.temper.isHardened).length
  const isOptimizedCount = castings.filter((c) => c.heat.isOptimized).length
  const hasNoOverheatingCount = castings.filter((c) => c.heat.hasNoOverheating).length
  const hasBalancedCompositionCount = castings.filter((c) => c.alloy.hasBalancedComposition).length

  const avgMetalPurity = avgPurity
  const avgCastingQuality = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.castingQuality, 0) / castings.length) : 0
  const avgForgingStrength = avgStrength
  const avgTemperHardness = avgHardness
  const avgHeatTreatment = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.heatTreatment, 0) / castings.length) : 0
  const avgAlloyComposition = castings.length > 0 ? Math.round(castings.reduce((s, c) => s + c.alloyComposition, 0) / castings.length) : 0

  const metallurgistGrade = classifyMetallurgistGrade(overallStrength)

  const bestCasting = castings.length > 0
    ? castings.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file
    : ''
  const purestMetal = castings.length > 0
    ? castings.reduce((best, c) => c.metalPurity > best.metalPurity ? c : best).file
    : ''
  const bestForged = castings.length > 0
    ? castings.reduce((best, c) => c.forgingStrength > best.forgingStrength ? c : best).file
    : ''
  const hardestTemper = castings.length > 0
    ? castings.reduce((best, c) => c.temperHardness > best.temperHardness ? c : best).file
    : ''
  const bestAlloy = castings.length > 0
    ? castings.reduce((best, c) => c.alloyComposition > best.alloyComposition ? c : best).file
    : ''

  const stats = {
    avgAlloyComposition,
    avgCastingQuality,
    avgForgingStrength,
    avgHeatTreatment,
    avgMetalPurity,
    avgTemperHardness,
    bestAlloy,
    bestCasting,
    bestForged,
    castIronCount,
    damascusSteelCount,
    hardestTemper,
    hasBalancedCompositionCount,
    hasNoCrackingCount,
    hasNoImpuritiesCount,
    hasNoOverheatingCount,
    hasNoShrinkageCount,
    isHardenedCount,
    isOptimizedCount,
    isPureCount,
    isStrongCount,
    isWellCastCount,
    metallurgistGrade,
    overallStrength,
    pigIronCount,
    purestMetal,
    slagCount,
    structuralSteelCount,
    toolSteelCount,
    totalFiles: files.length,
    totalFloors: floors.length,
  }

  const recommendations = generateRecommendations(castings, floors, guild, stats)

  return {
    castings,
    floors,
    guild,
    recommendations,
    stats,
  }
}
