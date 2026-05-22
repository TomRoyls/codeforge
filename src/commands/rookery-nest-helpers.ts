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
const SET_REGEX = /\bSet\b/g
const MAP_REGEX = /\bMap\b/g
const LOGICAL_AND_REGEX = /&&/g
const LOGICAL_OR_REGEX = /\|\|/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const DYNAMIC_IMPORT_REGEX = /\bimport\s*\(/g
const CALLBACK_NESTING_REGEX = /\bfunction\s*\([^)]*\)\s*\{[^{}]*\bfunction\s*\([^)]*\)\s*\{/g
const PROMISE_CHAIN_REGEX = /\.then\s*\(/g
const EARLY_RETURN_REGEX = /\bif\s*\([^)]*\)\s*\{[^}]*\breturn\b/g
const GUARD_CLAUSE_REGEX = /\bif\s*\([^)]*\)\s*\{?\s*\n?\s*\breturn\b/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface ConstructionMeasure {
  quality: number
  type: 'weaver' | 'swallow' | 'eagle' | 'woodpecker' | 'penguin' | 'cuckoo'
  isWellBuilt: boolean
  hasProperFoundation: boolean
  hasStructuralIntegrity: boolean
  hasProperEntrance: boolean
  hasVentilation: boolean
  hasInsulation: boolean
  hasReinforcement: boolean
  hasWeatherproofing: boolean
  hasCamouflage: boolean
  hasNoStructuralFlaws: boolean
  flawCount: number
}

export interface DepthMeasure {
  level: number
  category: 'shallow' | 'moderate' | 'deep' | 'abyssal' | 'infinite' | 'flat'
  isAppropriate: boolean
  hasProperAbstraction: boolean
  hasCallbackNesting: boolean
  hasPromiseChains: boolean
  hasAsyncAwait: boolean
  hasNestedConditions: boolean
  hasNestedLoops: boolean
  hasClosureCapture: boolean
  hasEarlyReturns: boolean
  maxDepth: number
  earlyReturnCount: number
}

export interface MaterialMeasure {
  quality: number
  type: 'silk' | 'moss' | 'twigs' | 'mud' | 'straw' | 'debris'
  isHighQuality: boolean
  hasCleanImports: boolean
  hasCleanExports: boolean
  hasProperNaming: boolean
  hasConsistentStyle: boolean
  hasNoDebris: boolean
  hasNoParasites: boolean
  hasNoMold: boolean
  hasRecycledMaterial: boolean
  debrisCount: number
  parasiteCount: number
}

export interface ColonyMeasure {
  organization: number
  pattern: 'communal' | 'territorial' | 'hierarchical' | 'scattered' | 'migratory' | 'solitary'
  isOrganized: boolean
  hasProperGrouping: boolean
  hasModuleBoundaries: boolean
  hasConsistentStructure: boolean
  hasIndexFile: boolean
  hasSeparateTypes: boolean
  hasTestFile: boolean
  hasDocumentation: boolean
  hasConfigFile: boolean
  hasNoOrphans: boolean
  orphanCount: number
}

export interface IncubationMeasure {
  quality: number
  stage: 'egg' | 'nestling' | 'fledgling' | 'juvenile' | 'adult' | 'fossil'
  isMature: boolean
  hasTesting: boolean
  hasTypeChecking: boolean
  hasLinting: boolean
  hasCodeReview: boolean
  hasDocumentation: boolean
  hasExamples: boolean
  hasChangelog: boolean
  hasVersioning: boolean
  hasDeprecationNotices: boolean
  maturityScore: number
}

export interface FledgingMeasure {
  success: number
  readiness: 'flight-ready' | 'nearly-ready' | 'needs-practice' | 'too-young' | 'grounded' | 'extinct'
  isReady: boolean
  hasErrorHandling: boolean
  hasEdgeCaseHandling: boolean
  hasPerformanceTesting: boolean
  hasSecurityReview: boolean
  hasIntegrationTesting: boolean
  hasDeploymentConfig: boolean
  hasRollbackPlan: boolean
  hasMonitoringPlan: boolean
  hasNoKnownBugs: boolean
  knownBugCount: number
}

export interface NestStructure {
  file: string
  nestConstruction: number
  nestingDepth: number
  nestingMaterial: number
  colonyOrganization: number
  incubationQuality: number
  fledgingSuccess: number
  construction: ConstructionMeasure
  depth: DepthMeasure
  material: MaterialMeasure
  colony: ColonyMeasure
  incubation: IncubationMeasure
  fledging: FledgingMeasure
  condition: 'master-weaver' | 'eagle-nest' | 'swallow-colony' | 'pigeon-roost' | 'ground-nest' | 'cuckoo-laying'
  qualityScore: number
}

export interface RookeryTree {
  directory: string
  nests: NestStructure[]
  avgConstruction: number
  avgDepth: number
  avgFledging: number
  masterWeaverCount: number
  cuckooCount: number
  organizedCount: number
  readyCount: number
  treeType: 'ancient-oak' | 'mature-tree' | 'young-tree' | 'hedgerow' | 'cliff-face' | 'ground'
  condition: 'prime-rookery' | 'healthy-colony' | 'established-nesting' | 'new-settlement' | 'abandoned-rookery' | 'fallen-tree'
}

export interface RookeryNestResult {
  nests: NestStructure[]
  trees: RookeryTree[]
  rookery: {
    avgConstruction: number
    avgDepth: number
    avgFledging: number
    isHealthyColony: boolean
    overallColony: number
  }
  stats: {
    totalFiles: number
    totalTrees: number
    avgNestConstruction: number
    avgNestingDepth: number
    avgNestingMaterial: number
    avgColonyOrganization: number
    avgIncubationQuality: number
    avgFledgingSuccess: number
    masterWeaverCount: number
    eagleNestCount: number
    swallowColonyCount: number
    pigeonRoostCount: number
    groundNestCount: number
    cuckooCount: number
    isWellBuiltCount: number
    hasProperAbstractionCount: number
    hasEarlyReturnsCount: number
    isHighQualityCount: number
    hasNoDebrisCount: number
    isOrganizedCount: number
    isMatureCount: number
    isReadyCount: number
    hasNoKnownBugsCount: number
    overallColony: number
    ornithologistGrade: 'master-ornithologist' | 'bird-bander' | 'birdwatcher' | 'amateur' | 'nest-inspector' | 'egg-collector'
    bestNest: string
    bestConstructed: string
    shallowestDepth: string
    bestMaterial: string
    mostOrganized: string
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

/** @example countJSDoc('/** doc *​/') returns 1 */
export function countJSDoc(content: string): number {
  return (content.match(JSDOC_REGEX) ?? []).length
}

/** @example countBlockComments('/** doc *​/') returns 1 */
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

/** @example countTryCatch('try {} catch(e) {}') returns 1 */
export function countTryCatch(content: string): number {
  return (content.match(TRY_CATCH_REGEX) ?? []).length
}

/** @example countCatches('catch(e) {}') returns 1 */
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

/** @example countIfs('if (x) {}') returns 1 */
export function countIfs(content: string): number {
  return (content.match(IF_REGEX) ?? []).length
}

/** @example countElses('else {}') returns 1 */
export function countElses(content: string): number {
  return (content.match(ELSE_REGEX) ?? []).length
}

/** @example countSwitches('switch(x) {}') returns 1 */
export function countSwitches(content: string): number {
  return (content.match(SWITCH_REGEX) ?? []).length
}

/** @example countForLoops('for (;;) {}') returns 1 */
export function countForLoops(content: string): number {
  return (content.match(FOR_REGEX) ?? []).length
}

/** @example countWhileLoops('while(x) {}') returns 1 */
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

/** @example countDefaultParams('function f(x = 1)') returns 1 */
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

/** @example countAccessModifiers('private x') returns 1 */
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

/** @example countAny('any') returns 1 */
export function countAny(content: string): number {
  return (content.match(ANY_REGEX) ?? []).length
}

/** @example countReadonly('readonly x') returns 1 */
export function countReadonly(content: string): number {
  return (content.match(READONLY_REGEX) ?? []).length
}

/** @example countPromises('Promise') returns 1 */
export function countPromises(content: string): number {
  return (content.match(PROMISE_REGEX) ?? []).length
}

/** @example countCommentedCode('// function foo()') returns 1 */
export function countCommentedCode(content: string): number {
  return (content.match(COMMENTED_CODE_REGEX) ?? []).length
}

/** @example countCallbackNesting(code) returns callback nesting count */
export function countCallbackNesting(content: string): number {
  return (content.match(CALLBACK_NESTING_REGEX) ?? []).length
}

/** @example countPromiseChains('.then(') returns 1 */
export function countPromiseChains(content: string): number {
  return (content.match(PROMISE_CHAIN_REGEX) ?? []).length
}

/** @example countEarlyReturns(code) returns early return count */
export function countEarlyReturns(content: string): number {
  return (content.match(EARLY_RETURN_REGEX) ?? []).length
}

/** @example countReexports('export { x } from') returns 1 */
export function countReexports(content: string): number {
  return (content.match(REEXPORT_REGEX) ?? []).length
}

/** @example countDynamicImports('import(') returns 1 */
export function countDynamicImports(content: string): number {
  return (content.match(DYNAMIC_IMPORT_REGEX) ?? []).length
}

/** @example countBreaks('break') returns 1 */
export function countBreaks(content: string): number {
  return (content.match(BREAK_REGEX) ?? []).length
}

/** @example countContinues('continue') returns 1 */
export function countContinues(content: string): number {
  return (content.match(CONTINUE_REGEX) ?? []).length
}

/** @example countYields('yield x') returns 1 */
export function countYields(content: string): number {
  return (content.match(YIELD_REGEX) ?? []).length
}

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureConstruction(content) returns ConstructionMeasure */
export function measureConstruction(content: string): ConstructionMeasure {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const arrows = countArrows(content)
  const jsdoc = countJSDoc(content)
  const tryCatch = countTryCatch(content)
  const accessMods = countAccessModifiers(content)
  const readonly = countReadonly(content)
  const generics = countGenerics(content)
  const errors = countErrors(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const hasProperFoundation = funcs + classes + interfaces + types > 0
  const hasStructuralIntegrity = exports > 0 && imports > 0
  const hasProperEntrance = exports > 0
  const hasVentilation = tryCatch > 0
  const hasInsulation = accessMods + readonly > 0
  const hasReinforcement = generics > 0
  const hasWeatherproofing = errors > 0
  const hasCamouflage = accessMods > 0
  const flawCount = anyCount + commentedCode + todos + consoleCount
  const hasNoStructuralFlaws = flawCount === 0
  const isWellBuilt = hasProperFoundation && hasStructuralIntegrity && flawCount <= 2

  let quality = 0
  if (hasProperFoundation) quality += 20
  if (hasStructuralIntegrity) quality += 15
  if (hasProperEntrance) quality += 10
  if (hasVentilation) quality += 10
  if (hasInsulation) quality += 10
  if (hasReinforcement) quality += 5
  if (hasWeatherproofing) quality += 5
  if (hasCamouflage) quality += 5
  if (jsdoc > 0) quality += 10
  if (arrows > 0) quality += 5
  if (hasNoStructuralFlaws) quality += 5
  quality = Math.min(quality - Math.min(flawCount * 3, 20), 100)
  quality = Math.max(quality, 0)

  let type: ConstructionMeasure['type'] = 'cuckoo'
  if (quality >= 80) type = 'weaver'
  else if (quality >= 65) type = 'swallow'
  else if (quality >= 50) type = 'eagle'
  else if (quality >= 35) type = 'woodpecker'
  else if (quality >= 20) type = 'penguin'
  else type = 'cuckoo'

  return {
    flawCount,
    hasCamouflage,
    hasInsulation,
    hasNoStructuralFlaws,
    hasProperEntrance,
    hasProperFoundation,
    hasReinforcement,
    hasStructuralIntegrity,
    hasVentilation,
    hasWeatherproofing,
    isWellBuilt,
    quality,
    type,
  }
}

/** @example measureDepth(content) returns DepthMeasure */
export function measureDepth(content: string): DepthMeasure {
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)
  const ifs = countIfs(content)
  const forLoops = countForLoops(content)
  const whileLoops = countWhileLoops(content)
  const switches = countSwitches(content)
  const ternaries = countTernaries(content)
  const callbackNesting = countCallbackNesting(content)
  const promiseChains = countPromiseChains(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const earlyReturnCount = countEarlyReturns(content)
  const elseCount = countElses(content)

  const hasCallbackNesting = callbackNesting > 0
  const hasPromiseChains = promiseChains > 0
  const hasAsyncAwait = asyncCount > 0 && awaitCount > 0
  const hasNestedConditions = ifs > 3
  const hasNestedLoops = forLoops + whileLoops > 2
  const hasClosureCapture = nestedBlocks > 0
  const hasEarlyReturns = earlyReturnCount > 0
  const hasProperAbstraction = hasAsyncAwait || (ternaries > 0 && !hasCallbackNesting)

  const maxDepth = deepNested > 0 ? Math.min(deepNested * 2 + 3, 10) : nestedBlocks > 0 ? Math.min(nestedBlocks + 1, 5) : 0

  let level = 0
  level += Math.min(nestedBlocks * 5, 30)
  level += Math.min(deepNested * 10, 30)
  level += Math.min(ifs * 2, 20)
  level += Math.min((forLoops + whileLoops) * 3, 15)
  level += Math.min(elseCount * 2, 5)
  level = Math.min(level, 100)

  const isAppropriate = level <= 40 && maxDepth <= 4

  let category: DepthMeasure['category'] = 'flat'
  if (level >= 80) category = 'infinite'
  else if (level >= 60) category = 'abyssal'
  else if (level >= 40) category = 'deep'
  else if (level >= 20) category = 'moderate'
  else if (level > 0) category = 'shallow'
  else category = 'flat'

  return {
    category,
    earlyReturnCount,
    hasAsyncAwait,
    hasCallbackNesting,
    hasClosureCapture,
    hasEarlyReturns,
    hasNestedConditions,
    hasNestedLoops,
    hasProperAbstraction,
    hasPromiseChains,
    isAppropriate,
    level,
    maxDepth,
  }
}

/** @example measureMaterial(content) returns MaterialMeasure */
export function measureMaterial(content: string): MaterialMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const reexports = countReexports(content)
  const dynamicImports = countDynamicImports(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const blockComments = countBlockComments(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const spreadCount = countSpreads(content)
  const destructureCount = countDestructures(content)

  const hasCleanImports = imports > 0 && imports <= 20
  const hasCleanExports = exports > 0 && reexports === 0
  const hasProperNaming = jsdoc > 0 || comments > 3
  const hasConsistentStyle = blockComments > 0 || jsdoc > 0
  const debrisCount = consoleCount + commentedCode
  const hasNoDebris = debrisCount === 0
  const parasiteCount = anyCount + todos
  const hasNoParasites = parasiteCount === 0
  const hasNoMold = todos === 0
  const hasRecycledMaterial = spreadCount > 0 || destructureCount > 0 || dynamicImports > 0
  const isHighQuality = hasCleanImports && hasCleanExports && hasNoDebris && hasNoParasites

  let quality = 0
  if (hasCleanImports) quality += 15
  if (hasCleanExports) quality += 15
  if (hasProperNaming) quality += 15
  if (hasConsistentStyle) quality += 10
  if (hasNoDebris) quality += 15
  if (hasNoParasites) quality += 10
  if (hasNoMold) quality += 10
  if (hasRecycledMaterial) quality += 10
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let type: MaterialMeasure['type'] = 'debris'
  if (quality >= 80) type = 'silk'
  else if (quality >= 65) type = 'moss'
  else if (quality >= 50) type = 'twigs'
  else if (quality >= 35) type = 'mud'
  else if (quality >= 20) type = 'straw'
  else type = 'debris'

  return {
    debrisCount,
    hasCleanExports,
    hasCleanImports,
    hasConsistentStyle,
    hasNoDebris,
    hasNoMold,
    hasNoParasites,
    hasProperNaming,
    hasRecycledMaterial,
    isHighQuality,
    parasiteCount,
    quality,
    type,
  }
}

/** @example measureColony(content, filePath) returns ColonyMeasure */
export function measureColony(content: string, filePath: string): ColonyMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const classes = countClasses(content)
  const funcs = countFunctions(content)
  const arrows = countArrows(content)
  const jsdoc = countJSDoc(content)
  const accessMods = countAccessModifiers(content)
  const staticCount = countStatic(content)

  const hasProperGrouping = (funcs + arrows) > 0 && (interfaces + types) > 0
  const hasModuleBoundaries = exports > 0 && imports > 0
  const hasConsistentStructure = (interfaces > 0 || types > 0) && (classes > 0 || funcs > 0)
  const hasIndexFile = filePath.endsWith('index.ts') || filePath.endsWith('index.js')
  const hasSeparateTypes = filePath.includes('-types') || filePath.includes('.types.') || filePath.includes('-helpers') || interfaces > 2
  const hasTestFile = filePath.includes('.test.') || filePath.includes('.spec.')
  const hasDocumentation = jsdoc > 0 || content.includes('/**')
  const hasConfigFile = filePath.includes('.config') || filePath.includes('config')
  const orphanCount = exports === 0 && imports === 0 ? 1 : 0
  const hasNoOrphans = orphanCount === 0
  const isOrganized = hasModuleBoundaries && hasConsistentStructure

  let organization = 0
  if (hasProperGrouping) organization += 15
  if (hasModuleBoundaries) organization += 20
  if (hasConsistentStructure) organization += 15
  if (hasIndexFile) organization += 5
  if (hasSeparateTypes) organization += 10
  if (hasDocumentation) organization += 10
  if (hasNoOrphans) organization += 10
  if (accessMods > 0) organization += 5
  if (staticCount > 0) organization += 5
  if (imports > 0 && imports <= 15) organization += 5
  organization = Math.min(organization, 100)
  organization = Math.max(organization, 0)

  let pattern: ColonyMeasure['pattern'] = 'solitary'
  if (organization >= 80) pattern = 'communal'
  else if (organization >= 65) pattern = 'territorial'
  else if (organization >= 50) pattern = 'hierarchical'
  else if (organization >= 35) pattern = 'scattered'
  else if (organization >= 20) pattern = 'migratory'
  else pattern = 'solitary'

  return {
    hasConfigFile,
    hasConsistentStructure,
    hasDocumentation,
    hasIndexFile,
    hasModuleBoundaries,
    hasNoOrphans,
    hasProperGrouping,
    hasSeparateTypes,
    hasTestFile,
    isOrganized,
    organization,
    orphanCount,
    pattern,
  }
}

/** @example measureIncubation(content) returns IncubationMeasure */
export function measureIncubation(content: string): IncubationMeasure {
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const blockComments = countBlockComments(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const accessMods = countAccessModifiers(content)
  const generics = countGenerics(content)
  const tryCatch = countTryCatch(content)
  const readonly = countReadonly(content)
  const enums = countEnums(content)

  const hasTesting = content.includes('describe') || content.includes('test(') || content.includes('it(')
  const hasTypeChecking = interfaces + types > 0
  const hasLinting = accessMods + readonly > 0
  const hasCodeReview = jsdoc > 0 && blockComments > 0
  const hasDocumentation = jsdoc > 2 || comments > 10
  const hasExamples = content.includes('@example') || content.includes('example')
  const hasChangelog = content.includes('changelog') || content.includes('CHANGELOG') || content.includes('version')
  const hasVersioning = content.includes('version') || content.includes('semver')
  const hasDeprecationNotices = content.includes('deprecated') || content.includes('Deprecated') || content.includes('@deprecated')

  let maturityScore = 0
  if (hasTesting) maturityScore += 15
  if (hasTypeChecking) maturityScore += 15
  if (hasLinting) maturityScore += 10
  if (hasCodeReview) maturityScore += 10
  if (hasDocumentation) maturityScore += 15
  if (hasExamples) maturityScore += 10
  if (hasChangelog) maturityScore += 5
  if (hasVersioning) maturityScore += 5
  if (hasDeprecationNotices) maturityScore += 5
  if (generics > 0) maturityScore += 5
  if (enums > 0) maturityScore += 5
  maturityScore = Math.min(maturityScore, 100)

  const isMature = maturityScore >= 60

  let stage: IncubationMeasure['stage'] = 'fossil'
  if (maturityScore >= 80) stage = 'adult'
  else if (maturityScore >= 60) stage = 'juvenile'
  else if (maturityScore >= 40) stage = 'fledgling'
  else if (maturityScore >= 20) stage = 'nestling'
  else if (maturityScore > 0) stage = 'egg'
  else stage = 'fossil'

  let quality = Math.round(maturityScore * 0.4)
  quality += Math.min(Math.round(jsdoc * 5), 20)
  quality += Math.min(Math.round(comments * 2), 20)
  quality += Math.min(Math.round(generics * 3), 10)
  quality += Math.min(Math.round(enums * 5), 10)
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  return {
    hasChangelog,
    hasCodeReview,
    hasDeprecationNotices,
    hasDocumentation,
    hasExamples,
    hasLinting,
    hasTesting,
    hasTypeChecking,
    hasVersioning,
    isMature,
    maturityScore,
    quality,
    stage,
  }
}

/** @example measureFledging(content) returns FledgingMeasure */
export function measureFledging(content: string): FledgingMeasure {
  const tryCatch = countTryCatch(content)
  const catches = countCatches(content)
  const throws = countThrows(content)
  const errors = countErrors(content)
  const ifs = countIfs(content)
  const ternaries = countTernaries(content)
  const nullish = (content.match(NULLISH_REGEX) ?? []).length
  const optionalChain = (content.match(OPTIONAL_CHAIN_REGEX) ?? []).length
  const defaults = countDefaultParams(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const hasErrorHandling = tryCatch > 0 || catches > 0 || throws > 0
  const hasEdgeCaseHandling = ifs > 5 || ternaries > 2 || nullish > 0 || optionalChain > 0
  const hasPerformanceTesting = content.includes('performance') || content.includes('benchmark')
  const hasSecurityReview = content.includes('sanitize') || content.includes('validate') || content.includes('escape')
  const hasIntegrationTesting = content.includes('integration') || content.includes('e2e')
  const hasDeploymentConfig = content.includes('deploy') || content.includes('production') || content.includes('staging')
  const hasRollbackPlan = content.includes('rollback') || content.includes('revert') || tryCatch > 1
  const hasMonitoringPlan = content.includes('monitor') || content.includes('log') || content.includes('metric')
  const knownBugCount = todos
  const hasNoKnownBugs = knownBugCount === 0
  const isReady = hasErrorHandling && hasEdgeCaseHandling && hasNoKnownBugs

  let success = 0
  if (hasErrorHandling) success += 20
  if (hasEdgeCaseHandling) success += 15
  if (hasPerformanceTesting) success += 10
  if (hasSecurityReview) success += 10
  if (hasIntegrationTesting) success += 10
  if (hasDeploymentConfig) success += 5
  if (hasRollbackPlan) success += 10
  if (hasMonitoringPlan) success += 5
  if (hasNoKnownBugs) success += 10
  if (defaults > 0) success += 5
  success = Math.min(success, 100)
  success = Math.max(success, 0)

  let readiness: FledgingMeasure['readiness'] = 'extinct'
  if (success >= 80) readiness = 'flight-ready'
  else if (success >= 65) readiness = 'nearly-ready'
  else if (success >= 45) readiness = 'needs-practice'
  else if (success >= 25) readiness = 'too-young'
  else if (success >= 10) readiness = 'grounded'
  else readiness = 'extinct'

  return {
    hasDeploymentConfig,
    hasEdgeCaseHandling,
    hasErrorHandling,
    hasIntegrationTesting,
    hasMonitoringPlan,
    hasNoKnownBugs,
    hasPerformanceTesting,
    hasRollbackPlan,
    hasSecurityReview,
    isReady,
    knownBugCount,
    readiness,
    success,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(85) returns 'master-weaver' */
export function classifyCondition(score: number): NestStructure['condition'] {
  if (score >= 80) return 'master-weaver'
  if (score >= 65) return 'eagle-nest'
  if (score >= 50) return 'swallow-colony'
  if (score >= 35) return 'pigeon-roost'
  if (score >= 20) return 'ground-nest'
  return 'cuckoo-laying'
}

/** @example classifyTreeType(nests) returns tree type */
export function classifyTreeType(nests: NestStructure[]): RookeryTree['treeType'] {
  if (nests.length === 0) return 'ground'
  const avgQuality = nests.reduce((s, n) => s + n.qualityScore, 0) / nests.length
  const masterWeavers = nests.filter((n) => n.condition === 'master-weaver').length
  if (avgQuality >= 75 && masterWeavers >= Math.ceil(nests.length * 0.3)) return 'ancient-oak'
  if (avgQuality >= 60) return 'mature-tree'
  if (avgQuality >= 40) return 'young-tree'
  if (avgQuality >= 25) return 'hedgerow'
  if (avgQuality >= 10) return 'cliff-face'
  return 'ground'
}

/** @example classifyTreeCondition(avgQuality) returns tree condition */
export function classifyTreeCondition(avgQuality: number): RookeryTree['condition'] {
  if (avgQuality >= 80) return 'prime-rookery'
  if (avgQuality >= 65) return 'healthy-colony'
  if (avgQuality >= 50) return 'established-nesting'
  if (avgQuality >= 35) return 'new-settlement'
  if (avgQuality >= 20) return 'abandoned-rookery'
  return 'fallen-tree'
}

/** @example classifyOrnithologistGrade(85) returns 'master-ornithologist' */
export function classifyOrnithologistGrade(avgColony: number): RookeryNestResult['stats']['ornithologistGrade'] {
  if (avgColony >= 80) return 'master-ornithologist'
  if (avgColony >= 65) return 'bird-bander'
  if (avgColony >= 50) return 'birdwatcher'
  if (avgColony >= 35) return 'amateur'
  if (avgColony >= 20) return 'nest-inspector'
  return 'egg-collector'
}

// ─── Analysis Functions ─────────────────────────────────────────────────────

/** @example analyzeNestStructure(content, filePath) returns NestStructure */
export function analyzeNestStructure(content: string, filePath: string): NestStructure {
  const construction = measureConstruction(content)
  const depth = measureDepth(content)
  const material = measureMaterial(content)
  const colony = measureColony(content, filePath)
  const incubation = measureIncubation(content)
  const fledging = measureFledging(content)

  const qualityScore = Math.round(
    (construction.quality * 0.2 + depth.level * 0.1 + material.quality * 0.2 +
     colony.organization * 0.2 + incubation.quality * 0.15 + fledging.success * 0.15)
  )

  const condition = classifyCondition(qualityScore)

  return {
    colony,
    colonyOrganization: colony.organization,
    condition,
    construction,
    depth,
    fledging,
    fledgingSuccess: fledging.success,
    file: filePath,
    incubation,
    incubationQuality: incubation.quality,
    material,
    nestConstruction: construction.quality,
    nestingDepth: depth.level,
    nestingMaterial: material.quality,
    qualityScore,
  }
}

/** @example analyzeRookeryTree(nests, dirPath) returns RookeryTree */
export function analyzeRookeryTree(nests: NestStructure[], dirPath: string): RookeryTree {
  const avgConstruction = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.nestConstruction, 0) / nests.length) : 0
  const avgDepth = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.nestingDepth, 0) / nests.length) : 0
  const avgFledging = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.fledgingSuccess, 0) / nests.length) : 0
  const masterWeaverCount = nests.filter((n) => n.condition === 'master-weaver').length
  const cuckooCount = nests.filter((n) => n.condition === 'cuckoo-laying').length
  const organizedCount = nests.filter((n) => n.colony.isOrganized).length
  const readyCount = nests.filter((n) => n.fledging.isReady).length

  const treeType = classifyTreeType(nests)
  const avgQuality = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.qualityScore, 0) / nests.length) : 0
  const condition = classifyTreeCondition(avgQuality)

  return {
    avgConstruction,
    avgDepth,
    avgFledging,
    condition,
    cuckooCount,
    directory: dirPath,
    masterWeaverCount,
    nests,
    organizedCount,
    readyCount,
    treeType,
  }
}

/** @example generateRecommendations(nests, trees, rookery, stats) returns string[] */
export function generateRecommendations(
  nests: NestStructure[],
  _trees: RookeryTree[],
  rookery: RookeryNestResult['rookery'],
  _stats: RookeryNestResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (rookery.overallColony < 50) {
    recommendations.push('Overall colony health is low — consider refactoring high-complexity nests')
  }

  const deepNests = nests.filter((n) => n.depth.level > 60)
  if (deepNests.length > 0) {
    recommendations.push(`${deepNests.length} file(s) have excessive nesting depth — extract functions to reduce complexity`)
  }

  const debrisNests = nests.filter((n) => n.material.debrisCount > 5)
  if (debrisNests.length > 0) {
    recommendations.push(`${debrisNests.length} file(s) contain code debris — remove commented-out code and console statements`)
  }

  const immatureNests = nests.filter((n) => !n.incubation.isMature)
  if (immatureNests.length > 0) {
    recommendations.push(`${immatureNests.length} file(s) need better documentation and type coverage for maturity`)
  }

  const unreadyNests = nests.filter((n) => !n.fledging.isReady)
  if (unreadyNests.length > nests.length * 0.5) {
    recommendations.push('More than half of files lack deployment readiness — add error handling and edge case coverage')
  }

  const cuckooNests = nests.filter((n) => n.condition === 'cuckoo-laying')
  if (cuckooNests.length > 0) {
    recommendations.push(`${cuckooNests.length} file(s) are in poor condition — prioritize structural improvements`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Colony is healthy — maintain current standards and continue monitoring')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildRookeryNestResult(files, contents, options) returns RookeryNestResult */
export function buildRookeryNestResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): RookeryNestResult {
  const nests: NestStructure[] = files.map((file, i) =>
    analyzeNestStructure(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, NestStructure[]>()
  for (const nest of nests) {
    const dir = nest.file.includes('/') ? nest.file.substring(0, nest.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(nest)
    } else {
      dirMap.set(dir, [nest])
    }
  }

  const trees: RookeryTree[] = Array.from(dirMap.entries()).map(([dir, dirNests]) =>
    analyzeRookeryTree(dirNests, dir),
  )

  const avgConstruction = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.nestConstruction, 0) / nests.length) : 0
  const avgDepth = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.nestingDepth, 0) / nests.length) : 0
  const avgFledging = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.fledgingSuccess, 0) / nests.length) : 0
  const overallColony = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.qualityScore, 0) / nests.length) : 0

  const rookery = {
    avgConstruction,
    avgDepth,
    avgFledging,
    isHealthyColony: overallColony >= 50,
    overallColony,
  }

  const masterWeaverCount = nests.filter((n) => n.condition === 'master-weaver').length
  const eagleNestCount = nests.filter((n) => n.condition === 'eagle-nest').length
  const swallowColonyCount = nests.filter((n) => n.condition === 'swallow-colony').length
  const pigeonRoostCount = nests.filter((n) => n.condition === 'pigeon-roost').length
  const groundNestCount = nests.filter((n) => n.condition === 'ground-nest').length
  const cuckooCount = nests.filter((n) => n.condition === 'cuckoo-laying').length
  const isWellBuiltCount = nests.filter((n) => n.construction.isWellBuilt).length
  const hasProperAbstractionCount = nests.filter((n) => n.depth.hasProperAbstraction).length
  const hasEarlyReturnsCount = nests.filter((n) => n.depth.hasEarlyReturns).length
  const isHighQualityCount = nests.filter((n) => n.material.isHighQuality).length
  const hasNoDebrisCount = nests.filter((n) => n.material.hasNoDebris).length
  const isOrganizedCount = nests.filter((n) => n.colony.isOrganized).length
  const isMatureCount = nests.filter((n) => n.incubation.isMature).length
  const isReadyCount = nests.filter((n) => n.fledging.isReady).length
  const hasNoKnownBugsCount = nests.filter((n) => n.fledging.hasNoKnownBugs).length

  const avgNestingMaterial = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.nestingMaterial, 0) / nests.length) : 0
  const avgColonyOrganization = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.colonyOrganization, 0) / nests.length) : 0
  const avgIncubationQuality = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.incubationQuality, 0) / nests.length) : 0
  const avgFledgingSuccess = nests.length > 0 ? Math.round(nests.reduce((s, n) => s + n.fledgingSuccess, 0) / nests.length) : 0

  const ornithologistGrade = classifyOrnithologistGrade(overallColony)

  const bestNest = nests.length > 0
    ? nests.reduce((best, n) => n.qualityScore > best.qualityScore ? n : best).file
    : ''
  const bestConstructed = nests.length > 0
    ? nests.reduce((best, n) => n.nestConstruction > best.nestConstruction ? n : best).file
    : ''
  const shallowestDepth = nests.length > 0
    ? nests.reduce((best, n) => n.nestingDepth < best.nestingDepth ? n : best).file
    : ''
  const bestMaterial = nests.length > 0
    ? nests.reduce((best, n) => n.nestingMaterial > best.nestingMaterial ? n : best).file
    : ''
  const mostOrganized = nests.length > 0
    ? nests.reduce((best, n) => n.colonyOrganization > best.colonyOrganization ? n : best).file
    : ''

  const stats = {
    avgColonyOrganization,
    avgFledgingSuccess,
    avgIncubationQuality,
    avgNestConstruction: avgConstruction,
    avgNestingDepth: avgDepth,
    avgNestingMaterial,
    bestConstructed,
    bestMaterial,
    bestNest,
    cuckooCount,
    eagleNestCount,
    groundNestCount,
    hasEarlyReturnsCount,
    hasNoDebrisCount,
    hasNoKnownBugsCount,
    hasProperAbstractionCount,
    isHighQualityCount,
    isMatureCount,
    isOrganizedCount,
    isReadyCount,
    isWellBuiltCount,
    masterWeaverCount,
    mostOrganized,
    ornithologistGrade,
    overallColony,
    pigeonRoostCount,
    shallowestDepth,
    swallowColonyCount,
    totalFiles: files.length,
    totalTrees: trees.length,
  }

  const recommendations = generateRecommendations(nests, trees, rookery, stats)

  return {
    nests,
    recommendations,
    rookery,
    stats,
    trees,
  }
}
