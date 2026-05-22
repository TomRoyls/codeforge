// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const ASYNC_REGEX = /\basync\s+/g
const AWAIT_REGEX = /\bawait\b/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const CATCH_REGEX = /\bcatch\b/g
const FINALLY_REGEX = /\bfinally\b/g
const THROW_REGEX = /\bthrow\b/g
const IF_REGEX = /\bif\s*\(/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const FOR_REGEX = /\bfor\s*[\(;]/g
const WHILE_REGEX = /\bwhile\s*\(/g
const NESTED_BLOCK_REGEX = /\{[^{}]*\{[^{}]*\}/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const TERNARY_REGEX = /\?[^:]+:/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const ERROR_REGEX = /\bnew\s+Error\b/g
const RETURN_REGEX = /\breturn\b/g
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
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const DYNAMIC_IMPORT_REGEX = /\bimport\s*\(/g
const CALLBACK_NESTING_REGEX = /\bfunction\s*\([^)]*\)\s*\{[^{}]*\bfunction\s*\([^)]*\)\s*\{/g
const PROMISE_CHAIN_REGEX = /\.then\s*\(/g
const EARLY_RETURN_REGEX = /\bif\s*\([^)]*\)\s*\{[^}]*\breturn\b/g
const COMMENT_REGEX = /\/\/.*$/gm

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface SharpnessMeasure {
  edge: number
  grade: 'razor' | 'sharp' | 'keen' | 'dull' | 'blunt' | 'rusty'
  isRazorSharp: boolean
  hasProperEdge: boolean
  hasNoNicks: boolean
  hasNoChips: boolean
  hasNoBurr: boolean
  hasMirrorPolish: boolean
  hasProperBevel: boolean
  hasConsistentEdge: boolean
  hasNoEdgeRolling: boolean
  hasNoCorrosion: boolean
  nickCount: number
  chipCount: number
}

export interface TemperMeasure {
  hardness: number
  method: 'differential' | 'through-hardened' | 'selective' | 'uneven' | 'raw' | 'no-temper'
  isProperlyTempered: boolean
  hasProperHardness: boolean
  hasNoCracking: boolean
  hasNoWarping: boolean
  hasGoodEdgeRetention: boolean
  hasProperSpineFlex: boolean
  hasNoBrittleEdge: boolean
  hasNoSoftSpots: boolean
  hasMagneticQuality: boolean
  hasNoRust: boolean
  crackCount: number
  warpCount: number
}

export interface FoldingMeasure {
  layers: number
  technique: 'thousand-fold' | 'hundred-fold' | 'fifteen-fold' | 'five-fold' | 'single-fold' | 'unforged'
  isWellRefined: boolean
  hasUniformGrain: boolean
  hasNoImpurities: boolean
  hasProperCarbon: boolean
  hasNoSlag: boolean
  hasFineStructure: boolean
  hasLayerVisibility: boolean
  hasNoDelamination: boolean
  hasProperHeatCycle: boolean
  hasNoBurnoff: boolean
  impurityCount: number
  slagCount: number
}

export interface HamonMeasure {
  clarity: number
  style: 'notare' | 'gunome' | 'choji' | 'suguha' | 'irregular' | 'absent'
  hasClearBoundaries: boolean
  hasProperInterface: boolean
  hasNoBoundaryLeak: boolean
  hasUtsuri: boolean
  hasNie: boolean
  hasNioi: boolean
  hasNoHataraki: boolean
  hasActivity: boolean
  hasNoKizu: boolean
  hasAshi: boolean
  leakCount: number
  kizuCount: number
}

export interface SayaMeasure {
  fit: number
  material: 'honoki' | 'magnolia' | 'bamboo' | 'synthetic' | 'cardboard' | 'none'
  isWellEncapsulated: boolean
  hasProperScabbard: boolean
  hasGoodTolerance: boolean
  hasKojiri: boolean
  hasKurikata: boolean
  hasHabaki: boolean
  hasSeppa: boolean
  hasTsuba: boolean
  hasNoRattle: boolean
  hasNoSticking: boolean
  rattleCount: number
  stickingCount: number
}

export interface BushidoMeasure {
  spirit: number
  virtue: 'perfect-harmony' | 'righteousness' | 'courage' | 'respect' | 'honesty' | 'dishonor'
  hasDiscipline: boolean
  hasGi: boolean
  hasYu: boolean
  hasJin: boolean
  hasRei: boolean
  hasMakoto: boolean
  hasMeiyo: boolean
  hasChugi: boolean
  hasNoKiri: boolean
  hasNoShame: boolean
  shameCount: number
  kiriCount: number
}

export interface ForgedBlade {
  file: string
  bladeSharpness: number
  steelTemper: number
  foldingTechnique: number
  hamonLine: number
  sayaFit: number
  bushidoSpirit: number
  sharpness: SharpnessMeasure
  temper: TemperMeasure
  folding: FoldingMeasure
  hamon: HamonMeasure
  saya: SayaMeasure
  bushido: BushidoMeasure
  condition: 'masterpiece' | 'masterwork' | 'fine-blade' | 'serviceable' | 'practice-blade' | 'scrap-iron'
  qualityScore: number
}

export interface ForgeCluster {
  directory: string
  blades: ForgedBlade[]
  avgSharpness: number
  avgTemper: number
  avgSpirit: number
  masterpieceCount: number
  scrapCount: number
  razorSharpCount: number
  disciplinedCount: number
  forgeType: 'imperial-armory' | 'master-forge' | 'village-forge' | 'field-forge' | 'backyard-anvil' | 'scrap-heap'
  condition: 'shogun-collection' | 'daimyo-armory' | 'samurai-rack' | 'ashigaru-stand' | 'rusty-pile' | 'scrap-bin'
}

export interface SamuraiForgeResult {
  blades: ForgedBlade[]
  clusters: ForgeCluster[]
  armory: {
    avgSharpness: number
    avgTemper: number
    avgSpirit: number
    isMasterwork: boolean
    overallQuality: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgBladeSharpness: number
    avgSteelTemper: number
    avgFoldingTechnique: number
    avgHamonLine: number
    avgSayaFit: number
    avgBushidoSpirit: number
    masterpieceCount: number
    masterworkCount: number
    fineBladeCount: number
    serviceableCount: number
    practiceBladeCount: number
    scrapIronCount: number
    isRazorSharpCount: number
    isProperlyTemperedCount: number
    isWellRefinedCount: number
    hasClearBoundariesCount: number
    isWellEncapsulatedCount: number
    hasDisciplineCount: number
    overallQuality: number
    smithGrade: 'divine-smith' | 'master-smith' | 'journeyman-smith' | 'apprentice-smith' | 'village-smith' | 'scrap-collector'
    bestBlade: string
    sharpest: string
    bestTempered: string
    bestFolded: string
    bestHamon: string
    mostDisciplined: string
  }
  recommendations: string[]
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

/** @example countExports('export const x = 1') returns 1 */
export function countExports(content: string): number {
  return (content.match(EXPORT_REGEX) ?? []).length
}

/** @example countImports('import { x }') returns 1 */
export function countImports(content: string): number {
  return (content.match(IMPORT_REGEX) ?? []).length
}

/** @example countFunctions('function foo()') returns 1 */
export function countFunctions(content: string): number {
  return (content.match(FUNCTION_REGEX) ?? []).length
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return (content.match(ARROW_REGEX) ?? []).length
}

/** @example countClasses('class Foo') returns 1 */
export function countClasses(content: string): number {
  return (content.match(CLASS_REGEX) ?? []).length
}

/** @example countInterfaces('interface Foo') returns 1 */
export function countInterfaces(content: string): number {
  return (content.match(INTERFACE_REGEX) ?? []).length
}

/** @example countTypeAliases('type X = string') returns 1 */
export function countTypeAliases(content: string): number {
  return (content.match(TYPE_REGEX) ?? []).length
}

/** @example countEnums('enum X') returns 1 */
export function countEnums(content: string): number {
  return (content.match(ENUM_REGEX) ?? []).length
}

/** @example countJSDoc(content) returns JSDoc count */
export function countJSDoc(content: string): number {
  return (content.match(JSDOC_REGEX) ?? []).length
}

/** @example countBlockComments(content) returns count */
export function countBlockComments(content: string): number {
  return (content.match(BLOCK_COMMENT_REGEX) ?? []).length
}

/** @example countComments(content) returns count */
export function countComments(content: string): number {
  return (content.match(COMMENT_REGEX) ?? []).length
}

/** @example countAsync('async function') returns count */
export function countAsync(content: string): number {
  return (content.match(ASYNC_REGEX) ?? []).length
}

/** @example countAwaits('await x') returns count */
export function countAwaits(content: string): number {
  return (content.match(AWAIT_REGEX) ?? []).length
}

/** @example countTryCatch('try {') returns count */
export function countTryCatch(content: string): number {
  return (content.match(TRY_CATCH_REGEX) ?? []).length
}

/** @example countCatches('catch') returns count */
export function countCatches(content: string): number {
  return (content.match(CATCH_REGEX) ?? []).length
}

/** @example countFinallys('finally') returns count */
export function countFinallys(content: string): number {
  return (content.match(FINALLY_REGEX) ?? []).length
}

/** @example countThrows('throw') returns count */
export function countThrows(content: string): number {
  return (content.match(THROW_REGEX) ?? []).length
}

/** @example countIfs('if (x)') returns count */
export function countIfs(content: string): number {
  return (content.match(IF_REGEX) ?? []).length
}

/** @example countSwitches('switch(x)') returns count */
export function countSwitches(content: string): number {
  return (content.match(SWITCH_REGEX) ?? []).length
}

/** @example countForLoops_count('for (;;)') returns count */
export function countForLoop_count(content: string): number {
  return (content.match(FOR_REGEX) ?? []).length
}

/** @example countWhileLoops('while(x)') returns count */
export function countWhileLoops(content: string): number {
  return (content.match(WHILE_REGEX) ?? []).length
}

/** @example countNestedBlocks(code) returns count */
export function countNestedBlocks(content: string): number {
  return (content.match(NESTED_BLOCK_REGEX) ?? []).length
}

/** @example countDeepNested(code) returns count */
export function countDeepNested(content: string): number {
  return (content.match(DEEP_NESTED_REGEX) ?? []).length
}

/** @example countTernaries('x ? 1 : 2') returns count */
export function countTernaries(content: string): number {
  return (content.match(TERNARY_REGEX) ?? []).length
}

/** @example countConsole('console.log()') returns count */
export function countConsole(content: string): number {
  return (content.match(CONSOLE_REGEX) ?? []).length
}

/** @example countTodos('// TODO') returns count */
export function countTodos(content: string): number {
  return (content.match(TODO_REGEX) ?? []).length
}

/** @example countErrors('new Error()') returns count */
export function countErrors(content: string): number {
  return (content.match(ERROR_REGEX) ?? []).length
}

/** @example countReturns('return x') returns count */
export function countReturns(content: string): number {
  return (content.match(RETURN_REGEX) ?? []).length
}

/** @example countSpreads('...args') returns count */
export function countSpreads(content: string): number {
  return (content.match(SPREAD_REGEX) ?? []).length
}

/** @example countDestructures('{x}=o') returns count */
export function countDestructures(content: string): number {
  return (content.match(DESTRUCTURE_REGEX) ?? []).length
}

/** @example countGenerics('<T>') returns count */
export function countGenerics(content: string): number {
  return (content.match(GENERICS_REGEX) ?? []).length
}

/** @example countAccessModifiers('private x') returns count */
export function countAccessModifiers(content: string): number {
  return (
    (content.match(PRIVATE_REGEX) ?? []).length +
    (content.match(PROTECTED_REGEX) ?? []).length +
    (content.match(PUBLIC_REGEX) ?? []).length
  )
}

/** @example countStatic('static x') returns count */
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

/** @example countCommentedCode('// function') returns count */
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

/** @example countReexports("export { x } from 'y'") returns count */
export function countReexports(content: string): number {
  return (content.match(REEXPORT_REGEX) ?? []).length
}

/** @example countDynamicImports("import('x')") returns count */
export function countDynamicImports(content: string): number {
  return (content.match(DYNAMIC_IMPORT_REGEX) ?? []).length
}

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureSharpness(content) returns SharpnessMeasure */
export function measureSharpness(content: string): SharpnessMeasure {
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const jsdoc = countJSDoc(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)

  const nickCount = deepNested
  const chipCount = anyCount + commentedCode
  const hasNoNicks = nickCount === 0
  const hasNoChips = chipCount === 0
  const hasNoBurr = consoleCount === 0
  const hasMirrorPolish = jsdoc > 0 && hasNoNicks && hasNoChips
  const hasProperBevel = interfaces > 0 || types > 0
  const hasProperEdge = exports > 0 && imports > 0
  const hasConsistentEdge = hasNoNicks && hasNoBurr
  const hasNoEdgeRolling = todos === 0
  const hasNoCorrosion = consoleCount === 0 && todos === 0
  const isRazorSharp = hasMirrorPolish && hasProperBevel && hasNoCorrosion

  let edge = 0
  if (hasNoNicks) edge += 15
  if (hasNoChips) edge += 15
  if (hasNoBurr) edge += 10
  if (hasMirrorPolish) edge += 10
  if (hasProperBevel) edge += 10
  if (hasProperEdge) edge += 10
  if (hasConsistentEdge) edge += 10
  if (hasNoEdgeRolling) edge += 10
  if (hasNoCorrosion) edge += 10
  edge = Math.min(edge, 100)
  edge = Math.max(edge, 0)

  let grade: SharpnessMeasure['grade'] = 'rusty'
  if (edge >= 80) grade = 'razor'
  else if (edge >= 65) grade = 'sharp'
  else if (edge >= 50) grade = 'keen'
  else if (edge >= 35) grade = 'dull'
  else if (edge >= 20) grade = 'blunt'

  return {
    chipCount,
    edge,
    grade,
    hasConsistentEdge,
    hasMirrorPolish,
    hasNoBurr,
    hasNoChips,
    hasNoCorrosion,
    hasNoEdgeRolling,
    hasNoNicks,
    hasProperBevel,
    hasProperEdge,
    isRazorSharp,
    nickCount,
  }
}

/** @example measureTemper(content) returns TemperMeasure */
export function measureTemper(content: string): TemperMeasure {
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const deepNested = countDeepNested(content)
  const nestedBlocks = countNestedBlocks(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)

  const crackCount = deepNested
  const warpCount = nestedBlocks > 8 ? nestedBlocks - 8 : 0
  const hasNoCracking = crackCount === 0
  const hasNoWarping = warpCount === 0
  const hasProperHardness = exports > 0 && imports > 0
  const hasGoodEdgeRetention = asyncCount > 0
  const hasProperSpineFlex = tryCatch > 0
  const hasNoBrittleEdge = anyCount === 0
  const hasNoSoftSpots = consoleCount === 0
  const hasMagneticQuality = exports > 2
  const hasNoRust = todos === 0
  const isProperlyTempered = hasNoCracking && hasNoBrittleEdge && hasProperHardness

  let hardness = 0
  if (hasNoCracking) hardness += 15
  if (hasNoWarping) hardness += 10
  if (hasProperHardness) hardness += 15
  if (hasGoodEdgeRetention) hardness += 10
  if (hasProperSpineFlex) hardness += 10
  if (hasNoBrittleEdge) hardness += 15
  if (hasNoSoftSpots) hardness += 10
  if (hasMagneticQuality) hardness += 5
  if (hasNoRust) hardness += 10
  hardness = Math.min(hardness, 100)
  hardness = Math.max(hardness, 0)

  let method: TemperMeasure['method'] = 'no-temper'
  if (hardness >= 80 && asyncCount > 0 && tryCatch > 0) method = 'differential'
  else if (hardness >= 65 && tryCatch > 0) method = 'through-hardened'
  else if (hardness >= 50 && asyncCount > 0) method = 'selective'
  else if (hardness >= 35) method = 'uneven'
  else if (hardness >= 20) method = 'raw'

  return {
    crackCount,
    hasGoodEdgeRetention,
    hasMagneticQuality,
    hasNoBrittleEdge,
    hasNoCracking,
    hasNoRust,
    hasNoSoftSpots,
    hasNoWarping,
    hasProperHardness,
    hasProperSpineFlex,
    hardness,
    isProperlyTempered,
    method,
    warpCount,
  }
}

/** @example measureFolding(content) returns FoldingMeasure */
export function measureFolding(content: string): FoldingMeasure {
  const funcs = countFunctions(content)
  const arrows = countArrows(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const enums = countEnums(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const readonly = countReadonly(content)

  const impurityCount = anyCount + commentedCode
  const slagCount = commentedCode
  const hasNoImpurities = impurityCount === 0
  const hasNoSlag = slagCount === 0
  const hasProperCarbon = generics > 0
  const hasUniformGrain = funcs > 0 && arrows > 0
  const hasFineStructure = interfaces > 0 && types > 0
  const hasLayerVisibility = readonly > 0 || accessMods > 0
  const hasNoDelamination = enums > 0 || classes > 0
  const hasProperHeatCycle = funcs > 0 && exports_count(content) > 0
  const hasNoBurnoff = true
  const isWellRefined = hasNoImpurities && hasFineStructure && hasUniformGrain

  const layers = funcs + arrows + classes + interfaces + types + enums

  let technique: FoldingMeasure['technique'] = 'unforged'
  if (layers >= 15) technique = 'thousand-fold'
  else if (layers >= 10) technique = 'hundred-fold'
  else if (layers >= 5) technique = 'fifteen-fold'
  else if (layers >= 3) technique = 'five-fold'
  else if (layers >= 1) technique = 'single-fold'

  let foldingScore = 0
  if (hasNoImpurities) foldingScore += 15
  if (hasNoSlag) foldingScore += 10
  if (hasProperCarbon) foldingScore += 10
  if (hasUniformGrain) foldingScore += 15
  if (hasFineStructure) foldingScore += 15
  if (hasLayerVisibility) foldingScore += 10
  if (hasNoDelamination) foldingScore += 10
  if (hasProperHeatCycle) foldingScore += 10
  if (hasNoBurnoff) foldingScore += 5
  foldingScore = Math.min(foldingScore, 100)
  foldingScore = Math.max(foldingScore, 0)

  return {
    hasFineStructure,
    hasLayerVisibility,
    hasNoBurnoff,
    hasNoDelamination,
    hasNoImpurities,
    hasNoSlag,
    hasProperCarbon,
    hasProperHeatCycle,
    hasUniformGrain,
    impurityCount,
    isWellRefined,
    layers,
    slagCount,
    technique,
  }
}

/** @example measureHamon(content) returns HamonMeasure */
export function measureHamon(content: string): HamonMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const jsdoc = countJSDoc(content)
  const reexports = countReexports(content)

  const hasClearBoundaries = interfaces > 0 || types > 0
  const hasProperInterface = exports > 0 && imports > 0
  const hasNoBoundaryLeak = anyCount === 0
  const hasUtsuri = generics > 0
  const hasNie = reexports > 0
  const hasNioi = accessMods > 0
  const hasNoHataraki = consoleCount === 0
  const hasActivity = jsdoc > 0
  const hasNoKizu = hasNoBoundaryLeak && hasNoHataraki
  const hasAshi = exports > 2
  const leakCount = anyCount
  const kizuCount = consoleCount

  let clarity = 0
  if (hasClearBoundaries) clarity += 20
  if (hasProperInterface) clarity += 15
  if (hasNoBoundaryLeak) clarity += 15
  if (hasUtsuri) clarity += 10
  if (hasNie) clarity += 5
  if (hasNioi) clarity += 10
  if (hasNoHataraki) clarity += 10
  if (hasActivity) clarity += 10
  if (hasNoKizu) clarity += 5
  clarity = Math.min(clarity, 100)
  clarity = Math.max(clarity, 0)

  let style: HamonMeasure['style'] = 'absent'
  if (!hasClearBoundaries) style = 'absent'
  else if (hasNie && hasNioi) style = 'choji'
  else if (hasNioi) style = 'gunome'
  else if (hasUtsuri) style = 'notare'
  else if (hasClearBoundaries) style = 'suguha'
  else style = 'irregular'

  return {
    clarity,
    hasActivity,
    hasAshi,
    hasClearBoundaries,
    hasNie,
    hasNioi,
    hasNoBoundaryLeak,
    hasNoHataraki,
    hasNoKizu,
    hasProperInterface,
    hasUtsuri,
    kizuCount,
    leakCount,
    style,
  }
}

/** @example measureSaya(content) returns SayaMeasure */
export function measureSaya(content: string): SayaMeasure {
  const accessMods = countAccessModifiers(content)
  const readonly = countReadonly(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const jsdoc = countJSDoc(content)
  const blockComments = countBlockComments(content)
  const classes = countClasses(content)
  const generics = countGenerics(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)

  const hasProperScabbard = accessMods > 0
  const hasGoodTolerance = imports > 0 && exports > 0
  const hasKojiri = blockComments > 0 || jsdoc > 0
  const hasKurikata = exports > 0
  const hasHabaki = interfaces > 0
  const hasSeppa = generics > 0
  const hasTsuba = readonly > 0 || accessMods > 0
  const hasNoRattle = anyCount === 0
  const hasNoSticking = consoleCount === 0
  const isWellEncapsulated = hasProperScabbard && hasHabaki && hasNoRattle

  const rattleCount = anyCount
  const stickingCount = consoleCount

  let fit = 0
  if (hasProperScabbard) fit += 15
  if (hasGoodTolerance) fit += 15
  if (hasKojiri) fit += 10
  if (hasKurikata) fit += 10
  if (hasHabaki) fit += 10
  if (hasSeppa) fit += 10
  if (hasTsuba) fit += 10
  if (hasNoRattle) fit += 10
  if (hasNoSticking) fit += 10
  fit = Math.min(fit, 100)
  fit = Math.max(fit, 0)

  let material: SayaMeasure['material'] = 'none'
  if (fit >= 80 && accessMods > 2) material = 'honoki'
  else if (fit >= 65 && accessMods > 0) material = 'magnolia'
  else if (fit >= 50) material = 'bamboo'
  else if (fit >= 35) material = 'synthetic'
  else if (fit >= 20) material = 'cardboard'

  return {
    fit,
    hasGoodTolerance,
    hasHabaki,
    hasKojiri,
    hasKurikata,
    hasNoRattle,
    hasNoSticking,
    hasProperScabbard,
    hasSeppa,
    hasTsuba,
    isWellEncapsulated,
    material,
    rattleCount,
    stickingCount,
  }
}

/** @example measureBushido(content) returns BushidoMeasure */
export function measureBushido(content: string): BushidoMeasure {
  const anyCount = countAny(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const jsdoc = countJSDoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)
  const throws = countThrows(content)

  const hasGi = anyCount === 0
  const hasYu = tryCatch > 0 && throws > 0
  const hasJin = jsdoc > 0
  const hasRei = exports > 0 && imports > 0
  const hasMakoto = commentedCode === 0
  const hasMeiyo = asyncCount > 0
  const hasChugi = tryCatch > 0
  const hasNoKiri = todos === 0
  const hasNoShame = consoleCount === 0
  const hasDiscipline = hasGi && hasMakoto && hasNoKiri && hasNoShame

  const shameCount = consoleCount + todos
  const kiriCount = todos

  let spirit = 0
  if (hasGi) spirit += 15
  if (hasYu) spirit += 10
  if (hasJin) spirit += 10
  if (hasRei) spirit += 15
  if (hasMakoto) spirit += 15
  if (hasMeiyo) spirit += 10
  if (hasChugi) spirit += 10
  if (hasNoKiri) spirit += 10
  if (hasNoShame) spirit += 5
  spirit = Math.min(spirit, 100)
  spirit = Math.max(spirit, 0)

  let virtue: BushidoMeasure['virtue'] = 'dishonor'
  if (spirit >= 80) virtue = 'perfect-harmony'
  else if (spirit >= 65) virtue = 'righteousness'
  else if (spirit >= 50) virtue = 'courage'
  else if (spirit >= 35) virtue = 'respect'
  else if (spirit >= 20) virtue = 'honesty'

  return {
    hasChugi,
    hasDiscipline,
    hasGi,
    hasJin,
    hasMakoto,
    hasMeiyo,
    hasNoKiri,
    hasNoShame,
    hasRei,
    hasYu,
    kiriCount,
    shameCount,
    spirit,
    virtue,
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function exports_count(content: string): number {
  return (content.match(EXPORT_REGEX) ?? []).length
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(85) returns 'masterpiece' */
export function classifyCondition(score: number): ForgedBlade['condition'] {
  if (score >= 80) return 'masterpiece'
  if (score >= 65) return 'masterwork'
  if (score >= 50) return 'fine-blade'
  if (score >= 35) return 'serviceable'
  if (score >= 20) return 'practice-blade'
  return 'scrap-iron'
}

/** @example classifyForgeType(blades) returns forge type */
export function classifyForgeType(blades: ForgedBlade[]): ForgeCluster['forgeType'] {
  if (blades.length === 0) return 'scrap-heap'
  const avgQuality = blades.reduce((s, b) => s + b.qualityScore, 0) / blades.length
  const masterpiece = blades.filter((b) => b.condition === 'masterpiece').length
  if (avgQuality >= 75 && masterpiece >= Math.ceil(blades.length * 0.3)) return 'imperial-armory'
  if (avgQuality >= 60) return 'master-forge'
  if (avgQuality >= 40) return 'village-forge'
  if (avgQuality >= 25) return 'field-forge'
  if (avgQuality >= 10) return 'backyard-anvil'
  return 'scrap-heap'
}

/** @example classifyClusterCondition(avgQuality) returns condition */
export function classifyClusterCondition(avgQuality: number): ForgeCluster['condition'] {
  if (avgQuality >= 80) return 'shogun-collection'
  if (avgQuality >= 65) return 'daimyo-armory'
  if (avgQuality >= 50) return 'samurai-rack'
  if (avgQuality >= 35) return 'ashigaru-stand'
  if (avgQuality >= 20) return 'rusty-pile'
  return 'scrap-bin'
}

/** @example classifySmithGrade(85) returns 'divine-smith' */
export function classifySmithGrade(avgQuality: number): SamuraiForgeResult['stats']['smithGrade'] {
  if (avgQuality >= 80) return 'divine-smith'
  if (avgQuality >= 65) return 'master-smith'
  if (avgQuality >= 50) return 'journeyman-smith'
  if (avgQuality >= 35) return 'apprentice-smith'
  if (avgQuality >= 20) return 'village-smith'
  return 'scrap-collector'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeForgedBlade(content, filePath) returns ForgedBlade */
export function analyzeForgedBlade(content: string, filePath: string): ForgedBlade {
  const sharpness = measureSharpness(content)
  const temper = measureTemper(content)
  const folding = measureFolding(content)
  const hamon = measureHamon(content)
  const saya = measureSaya(content)
  const bushido = measureBushido(content)

  const foldingScore = folding.isWellRefined ? 80 : (folding.layers > 5 ? 50 : 20)
  const qualityScore = Math.round(
    sharpness.edge * 0.2 + temper.hardness * 0.15 + foldingScore * 0.15 +
    hamon.clarity * 0.15 + saya.fit * 0.15 + bushido.spirit * 0.2,
  )

  return {
    bladeSharpness: sharpness.edge,
    bushido,
    bushidoSpirit: bushido.spirit,
    condition: classifyCondition(qualityScore),
    file: filePath,
    folding,
    foldingTechnique: foldingScore,
    hamon,
    hamonLine: hamon.clarity,
    qualityScore,
    saya,
    sayaFit: saya.fit,
    sharpness,
    steelTemper: temper.hardness,
    temper,
  }
}

/** @example analyzeForgeCluster(blades, dirPath) returns ForgeCluster */
export function analyzeForgeCluster(blades: ForgedBlade[], dirPath: string): ForgeCluster {
  const avgSharpness = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.bladeSharpness, 0) / blades.length) : 0
  const avgTemper = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.steelTemper, 0) / blades.length) : 0
  const avgSpirit = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.bushidoSpirit, 0) / blades.length) : 0
  const masterpieceCount = blades.filter((b) => b.condition === 'masterpiece').length
  const scrapCount = blades.filter((b) => b.condition === 'scrap-iron').length
  const razorSharpCount = blades.filter((b) => b.sharpness.isRazorSharp).length
  const disciplinedCount = blades.filter((b) => b.bushido.hasDiscipline).length
  const forgeType = classifyForgeType(blades)
  const avgQuality = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.qualityScore, 0) / blades.length) : 0
  const condition = classifyClusterCondition(avgQuality)

  return {
    avgSharpness,
    avgSpirit,
    avgTemper,
    blades,
    condition,
    directory: dirPath,
    disciplinedCount,
    forgeType,
    masterpieceCount,
    razorSharpCount,
    scrapCount,
  }
}

/** @example generateRecommendations(blades, clusters, armory, stats) returns string[] */
export function generateRecommendations(
  blades: ForgedBlade[],
  _clusters: ForgeCluster[],
  armory: SamuraiForgeResult['armory'],
  _stats: SamuraiForgeResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (armory.overallQuality < 50) {
    recommendations.push('Forge quality is poor — focus on removing code impurities and improving structural integrity')
  }

  const dullBlades = blades.filter((b) => !b.sharpness.isRazorSharp)
  if (dullBlades.length > 0) {
    recommendations.push(`${dullBlades.length} blade(s) lack sharpness — add JSDoc, types, and remove any usage`)
  }

  const untemperedBlades = blades.filter((b) => !b.temper.isProperlyTempered)
  if (untemperedBlades.length > 0) {
    recommendations.push(`${untemperedBlades.length} blade(s) are improperly tempered — add error handling and remove nesting`)
  }

  const scrapBlades = blades.filter((b) => b.condition === 'scrap-iron')
  if (scrapBlades.length > 0) {
    recommendations.push(`${scrapBlades.length} blade(s) are scrap iron — consider complete rewrite`)
  }

  const dishonorableBlades = blades.filter((b) => !b.bushido.hasDiscipline)
  if (dishonorableBlades.length > 0) {
    recommendations.push(`${dishonorableBlades.length} blade(s) lack bushido discipline — remove console, TODO, and commented-out code`)
  }

  if (recommendations.length === 0) {
    recommendations.push('All blades are masterfully forged — maintain current forging standards')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildSamuraiForgeResult(files, contents, options) returns SamuraiForgeResult */
export function buildSamuraiForgeResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): SamuraiForgeResult {
  const blades: ForgedBlade[] = files.map((file, i) =>
    analyzeForgedBlade(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ForgedBlade[]>()
  for (const blade of blades) {
    const dir = blade.file.includes('/') ? blade.file.substring(0, blade.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(blade)
    } else {
      dirMap.set(dir, [blade])
    }
  }

  const clusters: ForgeCluster[] = Array.from(dirMap.entries()).map(([dir, dirBlades]) =>
    analyzeForgeCluster(dirBlades, dir),
  )

  const avgBladeSharpness = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.bladeSharpness, 0) / blades.length) : 0
  const avgSteelTemper = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.steelTemper, 0) / blades.length) : 0
  const avgFoldingTechnique = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.foldingTechnique, 0) / blades.length) : 0
  const avgHamonLine = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.hamonLine, 0) / blades.length) : 0
  const avgSayaFit = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.sayaFit, 0) / blades.length) : 0
  const avgBushidoSpirit = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.bushidoSpirit, 0) / blades.length) : 0
  const overallQuality = blades.length > 0 ? Math.round(blades.reduce((s, b) => s + b.qualityScore, 0) / blades.length) : 0

  const armory = {
    avgSharpness: avgBladeSharpness,
    avgSpirit: avgBushidoSpirit,
    avgTemper: avgSteelTemper,
    isMasterwork: overallQuality >= 50,
    overallQuality,
  }

  const masterpieceCount = blades.filter((b) => b.condition === 'masterpiece').length
  const masterworkCount = blades.filter((b) => b.condition === 'masterwork').length
  const fineBladeCount = blades.filter((b) => b.condition === 'fine-blade').length
  const serviceableCount = blades.filter((b) => b.condition === 'serviceable').length
  const practiceBladeCount = blades.filter((b) => b.condition === 'practice-blade').length
  const scrapIronCount = blades.filter((b) => b.condition === 'scrap-iron').length
  const isRazorSharpCount = blades.filter((b) => b.sharpness.isRazorSharp).length
  const isProperlyTemperedCount = blades.filter((b) => b.temper.isProperlyTempered).length
  const isWellRefinedCount = blades.filter((b) => b.folding.isWellRefined).length
  const hasClearBoundariesCount = blades.filter((b) => b.hamon.hasClearBoundaries).length
  const isWellEncapsulatedCount = blades.filter((b) => b.saya.isWellEncapsulated).length
  const hasDisciplineCount = blades.filter((b) => b.bushido.hasDiscipline).length

  const smithGrade = classifySmithGrade(overallQuality)

  const bestBlade = blades.length > 0
    ? blades.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file : ''
  const sharpest = blades.length > 0
    ? blades.reduce((best, b) => b.bladeSharpness > best.bladeSharpness ? b : best).file : ''
  const bestTempered = blades.length > 0
    ? blades.reduce((best, b) => b.steelTemper > best.steelTemper ? b : best).file : ''
  const bestFolded = blades.length > 0
    ? blades.reduce((best, b) => b.foldingTechnique > best.foldingTechnique ? b : best).file : ''
  const bestHamon = blades.length > 0
    ? blades.reduce((best, b) => b.hamonLine > best.hamonLine ? b : best).file : ''
  const mostDisciplined = blades.length > 0
    ? blades.reduce((best, b) => b.bushidoSpirit > best.bushidoSpirit ? b : best).file : ''

  const stats = {
    avgBladeSharpness,
    avgBushidoSpirit,
    avgFoldingTechnique,
    avgHamonLine,
    avgSayaFit,
    avgSteelTemper,
    bestBlade,
    bestFolded,
    bestHamon,
    bestTempered,
    fineBladeCount,
    hasClearBoundariesCount,
    hasDisciplineCount,
    isProperlyTemperedCount,
    isRazorSharpCount,
    isWellEncapsulatedCount,
    isWellRefinedCount,
    masterpieceCount,
    masterworkCount,
    mostDisciplined,
    overallQuality,
    practiceBladeCount,
    scrapIronCount,
    serviceableCount,
    sharpest,
    smithGrade,
    totalClusters: clusters.length,
    totalFiles: files.length,
  }

  const recommendations = generateRecommendations(blades, clusters, armory, stats)

  return { armory, blades, clusters, recommendations, stats }
}
