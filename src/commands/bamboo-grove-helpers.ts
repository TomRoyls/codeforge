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

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface StrengthMeasure {
  level: number
  grade: 'iron-bamboo' | 'stone-bamboo' | 'timber-bamboo' | 'reed-bamboo' | 'grass-bamboo' | 'rotten'
  isStrong: boolean
  hasFiberDensity: boolean
  hasProperWallThickness: boolean
  hasNoCracks: boolean
  hasNoSplitCulm: boolean
  hasNoPithRot: boolean
  hasNoBorerDamage: boolean
  hasWindResistance: boolean
  hasLoadBearing: boolean
  hasTensileStrength: boolean
  crackCount: number
  borerCount: number
}

export interface NodesMeasure {
  spacing: number
  pattern: 'regular' | 'alternating' | 'clustered' | 'sparse' | 'dense' | 'absent'
  isWellSpaced: boolean
  hasProperInternodes: boolean
  hasBranchNodes: boolean
  hasSheathNodes: boolean
  hasNoCrowdedNodes: boolean
  hasNoGaps: boolean
  hasEmergentShoots: boolean
  hasRootNodes: boolean
  hasAerialRoots: boolean
  hasPropRoots: boolean
  gapCount: number
  crowdedCount: number
}

export interface RhizomeMeasure {
  depth: number
  type: 'running' | 'clumping' | 'mixed' | 'shallow' | 'surface' | 'absent'
  isDeepRooted: boolean
  hasRhizomeNetwork: boolean
  hasProperSpread: boolean
  hasNoInvasiveRoots: boolean
  hasNoRootRot: boolean
  hasMycorrhizae: boolean
  hasWaterStorage: boolean
  hasNutrientCycling: boolean
  hasNoRootCompetition: boolean
  hasNoGirdlingRoots: boolean
  invasiveCount: number
  girdlingCount: number
}

export interface CanopyMeasure {
  spread: number
  density: 'dense' | 'moderate' | 'open' | 'sparse' | 'patchy' | 'bare'
  hasFullCoverage: boolean
  hasProperShade: boolean
  hasLeafCanopy: boolean
  hasBranchStructure: boolean
  hasNoDeadwood: boolean
  hasNoOvergrowth: boolean
  hasPhotosynthesis: boolean
  hasTranspiration: boolean
  hasNoParasiticGrowth: boolean
  hasUnderstory: boolean
  deadwoodCount: number
  parasiticCount: number
}

export interface FlexibilityMeasure {
  index: number
  resilience: 'supple' | 'flexible' | 'moderate' | 'stiff' | 'brittle' | 'fossilized'
  isFlexible: boolean
  hasElasticResponse: boolean
  hasDampingCapacity: boolean
  hasNoRigidJoints: boolean
  hasBendWithoutBreak: boolean
  hasSelfRighting: boolean
  hasAdaptiveGrowth: boolean
  hasNoBrittleFracture: boolean
  hasStressRelief: boolean
  hasThermalExpansion: boolean
  brittleCount: number
  rigidCount: number
}

export interface HealthMeasure {
  score: number
  vitality: 'flourishing' | 'healthy' | 'vigorous' | 'stressed' | 'declining' | 'dead'
  isHealthy: boolean
  hasNewGrowth: boolean
  hasProperIrrigation: boolean
  hasNoDisease: boolean
  hasNoPests: boolean
  hasProperNutrition: boolean
  hasNoFungalInfection: boolean
  hasGoodSoilContact: boolean
  hasSunExposure: boolean
  hasNoWindDamage: boolean
  diseaseCount: number
  pestCount: number
}

export interface BambooCulm {
  file: string
  culmStrength: number
  nodeSpacing: number
  rhizomeDepth: number
  canopySpread: number
  flexibilityIndex: number
  groveHealth: number
  strength: StrengthMeasure
  nodes: NodesMeasure
  rhizome: RhizomeMeasure
  canopy: CanopyMeasure
  flexibility: FlexibilityMeasure
  health: HealthMeasure
  condition: 'moso-bamboo' | 'giant-bamboo' | 'black-bamboo' | 'lucky-bamboo' | 'dried-cane' | 'mulch'
  qualityScore: number
}

export interface GroveCluster {
  directory: string
  culms: BambooCulm[]
  avgStrength: number
  avgSpacing: number
  avgHealth: number
  mosoCount: number
  mulchCount: number
  strongCount: number
  flexibleCount: number
  clusterType: 'forest' | 'grove' | 'thicket' | 'hedge' | 'stand' | 'wasteland'
  condition: 'ancient-forest' | 'mature-grove' | 'young-plantation' | 'nursery' | 'cleared-field' | 'desert'
}

export interface BambooGroveResult {
  culms: BambooCulm[]
  clusters: GroveCluster[]
  grove: {
    avgStrength: number
    avgSpacing: number
    avgHealth: number
    isFlourishing: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgCulmStrength: number
    avgNodeSpacing: number
    avgRhizomeDepth: number
    avgCanopySpread: number
    avgFlexibilityIndex: number
    avgGroveHealth: number
    mosoBambooCount: number
    giantBambooCount: number
    blackBambooCount: number
    luckyBambooCount: number
    driedCaneCount: number
    mulchCount: number
    isStrongCount: number
    isWellSpacedCount: number
    isDeepRootedCount: number
    hasFullCoverageCount: number
    isFlexibleCount: number
    isHealthyCount: number
    overallHealth: number
    gardenerGrade: 'master-gardener' | 'horticulturist' | 'gardener' | 'landscaper' | 'weekend-warrior' | 'concrete-paver'
    bestCulm: string
    strongest: string
    bestSpaced: string
    deepestRooted: string
    bestCoverage: string
    mostFlexible: string
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

/** @example measureStrength(content) returns StrengthMeasure */
export function measureStrength(content: string): StrengthMeasure {
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const jsdoc = countJSDoc(content)

  const crackCount = deepNested
  const borerCount = anyCount + commentedCode
  const hasNoCracks = crackCount === 0
  const hasNoSplitCulm = nestedBlocks <= 5
  const hasNoPithRot = anyCount === 0
  const hasNoBorerDamage = borerCount === 0
  const hasFiberDensity = exports > 2 && imports > 2
  const hasProperWallThickness = jsdoc > 0
  const hasWindResistance = hasNoCracks && hasNoPithRot
  const hasLoadBearing = exports > 0 && imports > 0
  const hasTensileStrength = consoleCount === 0 && todos === 0
  const isStrong = hasNoCracks && hasNoPithRot && hasNoBorerDamage && hasFiberDensity

  let level = 0
  if (hasNoCracks) level += 15
  if (hasNoSplitCulm) level += 10
  if (hasNoPithRot) level += 15
  if (hasNoBorerDamage) level += 15
  if (hasFiberDensity) level += 10
  if (hasProperWallThickness) level += 10
  if (hasWindResistance) level += 10
  if (hasLoadBearing) level += 5
  if (hasTensileStrength) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let grade: StrengthMeasure['grade'] = 'rotten'
  if (level >= 80) grade = 'iron-bamboo'
  else if (level >= 65) grade = 'stone-bamboo'
  else if (level >= 50) grade = 'timber-bamboo'
  else if (level >= 35) grade = 'reed-bamboo'
  else if (level >= 20) grade = 'grass-bamboo'

  return {
    borerCount,
    crackCount,
    grade,
    hasFiberDensity,
    hasLoadBearing,
    hasNoBorerDamage,
    hasNoCracks,
    hasNoPithRot,
    hasNoSplitCulm,
    hasProperWallThickness,
    hasTensileStrength,
    hasWindResistance,
    isStrong,
    level,
  }
}

/** @example measureNodes(content) returns NodesMeasure */
export function measureNodes(content: string): NodesMeasure {
  const funcs = countFunctions(content)
  const arrows = countArrows(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const enums = countEnums(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const accessMods = countAccessModifiers(content)
  const generics = countGenerics(content)
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)

  const hasBranchNodes = exports > 0
  const hasSheathNodes = interfaces > 0 || types > 0
  const hasProperInternodes = funcs > 0 && exports > 0
  const hasNoCrowdedNodes = deepNested === 0
  const hasNoGaps = imports > 0 && exports > 0
  const hasEmergentShoots = generics > 0
  const hasRootNodes = funcs > 0 || classes > 0
  const hasAerialRoots = accessMods > 0
  const hasPropRoots = arrows > 0 || enums > 0
  const isWellSpaced = hasProperInternodes && hasNoCrowdedNodes && hasBranchNodes

  const gapCount = imports === 0 ? 1 : 0
  const crowdedCount = deepNested

  let spacing = 0
  if (hasProperInternodes) spacing += 15
  if (hasBranchNodes) spacing += 10
  if (hasSheathNodes) spacing += 15
  if (hasNoCrowdedNodes) spacing += 15
  if (hasNoGaps) spacing += 10
  if (hasEmergentShoots) spacing += 10
  if (hasRootNodes) spacing += 10
  if (hasAerialRoots) spacing += 5
  if (hasPropRoots) spacing += 10
  spacing = Math.min(spacing, 100)
  spacing = Math.max(spacing, 0)

  const totalDecls = funcs + arrows + classes + interfaces + types + enums
  let pattern: NodesMeasure['pattern'] = 'absent'
  if (totalDecls === 0) pattern = 'absent'
  else if (nestedBlocks > 8) pattern = 'dense'
  else if (nestedBlocks > 4) pattern = 'clustered'
  else if (totalDecls <= 3) pattern = 'sparse'
  else if (totalDecls % 2 === 0) pattern = 'regular'
  else pattern = 'alternating'

  return {
    crowdedCount,
    gapCount,
    hasAerialRoots,
    hasBranchNodes,
    hasEmergentShoots,
    hasNoCrowdedNodes,
    hasNoGaps,
    hasPropRoots,
    hasProperInternodes,
    hasRootNodes,
    hasSheathNodes,
    isWellSpaced,
    pattern,
    spacing,
  }
}

/** @example measureRhizome(content) returns RhizomeMeasure */
export function measureRhizome(content: string): RhizomeMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const reexports = countReexports(content)
  const dynamicImports = countDynamicImports(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const promiseCount = countPromises(content)

  const hasRhizomeNetwork = imports > 0 && exports > 0
  const hasProperSpread = imports > 0 && exports > 0 && imports <= exports * 3
  const hasNoInvasiveRoots = imports <= 10
  const hasNoRootRot = anyCount === 0
  const hasMycorrhizae = reexports > 0 || dynamicImports > 0
  const hasWaterStorage = asyncCount > 0 && awaitCount > 0
  const hasNutrientCycling = promiseCount > 0
  const hasNoRootCompetition = consoleCount === 0
  const hasNoGirdlingRoots = true
  const isDeepRooted = hasRhizomeNetwork && hasProperSpread && hasNoRootRot

  const invasiveCount = imports > 10 ? imports - 10 : 0
  const girdlingCount = 0

  let depth = 0
  if (hasRhizomeNetwork) depth += 20
  if (hasProperSpread) depth += 15
  if (hasNoInvasiveRoots) depth += 10
  if (hasNoRootRot) depth += 15
  if (hasMycorrhizae) depth += 10
  if (hasWaterStorage) depth += 10
  if (hasNutrientCycling) depth += 5
  if (hasNoRootCompetition) depth += 10
  if (hasNoGirdlingRoots) depth += 5
  depth = Math.min(depth, 100)
  depth = Math.max(depth, 0)

  let type: RhizomeMeasure['type'] = 'absent'
  if (imports === 0) type = 'absent'
  else if (hasRhizomeNetwork && hasProperSpread && reexports > 0) type = 'running'
  else if (hasRhizomeNetwork && !hasProperSpread) type = 'clumping'
  else if (imports > 0 && exports > 0) type = 'mixed'
  else if (imports > 0 && exports === 0) type = 'shallow'
  else type = 'surface'

  return {
    depth,
    girdlingCount,
    hasMycorrhizae,
    hasNoGirdlingRoots,
    hasNoInvasiveRoots,
    hasNoRootCompetition,
    hasNoRootRot,
    hasNutrientCycling,
    hasProperSpread,
    hasRhizomeNetwork,
    hasWaterStorage,
    invasiveCount,
    isDeepRooted,
    type,
  }
}

/** @example measureCanopy(content) returns CanopyMeasure */
export function measureCanopy(content: string): CanopyMeasure {
  const jsdoc = countJSDoc(content)
  const blockComments = countBlockComments(content)
  const types = countTypeAliases(content)
  const interfaces = countInterfaces(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const readonly = countReadonly(content)
  const reexports = countReexports(content)
  const dynamicImports = countDynamicImports(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)

  const hasFullCoverage = jsdoc > 0 && blockComments > 0
  const hasProperShade = accessMods > 0
  const hasLeafCanopy = types > 0 && interfaces > 0
  const hasBranchStructure = generics > 0
  const hasNoDeadwood = anyCount === 0
  const hasNoOvergrowth = consoleCount === 0
  const hasPhotosynthesis = jsdoc > 0
  const hasTranspiration = reexports > 0 || dynamicImports > 0
  const hasNoParasiticGrowth = consoleCount === 0 && anyCount === 0
  const hasUnderstory = readonly > 0

  const deadwoodCount = anyCount
  const parasiticCount = consoleCount

  let spread = 0
  if (hasFullCoverage) spread += 15
  if (hasProperShade) spread += 10
  if (hasLeafCanopy) spread += 15
  if (hasBranchStructure) spread += 10
  if (hasNoDeadwood) spread += 15
  if (hasNoOvergrowth) spread += 10
  if (hasPhotosynthesis) spread += 10
  if (hasTranspiration) spread += 5
  if (hasNoParasiticGrowth) spread += 5
  if (hasUnderstory) spread += 5
  spread = Math.min(spread, 100)
  spread = Math.max(spread, 0)

  let density: CanopyMeasure['density'] = 'bare'
  if (jsdoc === 0 && types === 0) density = 'bare'
  else if (jsdoc > 3 && types > 2) density = 'dense'
  else if (jsdoc > 1 && types > 0) density = 'moderate'
  else if (jsdoc > 0 || types > 0) density = 'open'
  else density = 'sparse'

  return {
    deadwoodCount,
    density,
    hasBranchStructure,
    hasFullCoverage,
    hasLeafCanopy,
    hasNoDeadwood,
    hasNoOvergrowth,
    hasNoParasiticGrowth,
    hasPhotosynthesis,
    hasProperShade,
    hasTranspiration,
    hasUnderstory,
    parasiticCount,
    spread,
  }
}

/** @example measureFlexibility(content) returns FlexibilityMeasure */
export function measureFlexibility(content: string): FlexibilityMeasure {
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const tryCatch = countTryCatch(content)
  const catches = countCatches(content)
  const finallys = countFinallys(content)
  const throws = countThrows(content)
  const errors = countErrors(content)
  const ifs = countIfs(content)
  const ternaries = countTernaries(content)
  const switches = countSwitches(content)
  const forLoops = countForLoop_count(content)
  const callbacks = countCallbackNesting(content)
  const promiseChains = countPromiseChains(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const hasElasticResponse = asyncCount > 0 && awaitCount > 0
  const hasDampingCapacity = tryCatch > 0 && catches > 0
  const hasNoRigidJoints = callbacks === 0 && promiseChains === 0
  const hasBendWithoutBreak = hasDampingCapacity && finallys > 0
  const hasSelfRighting = tryCatch > 0 && throws > 0
  const hasAdaptiveGrowth = ifs > 0 || switches > 0 || ternaries > 0
  const hasNoBrittleFracture = errors === 0 || tryCatch > 0
  const hasStressRelief = tryCatch > 0
  const hasThermalExpansion = forLoops > 0 || countWhileLoops(content) > 0
  const isFlexible = hasElasticResponse && hasDampingCapacity && hasNoRigidJoints

  const brittleCount = callbacks + promiseChains
  const rigidCount = consoleCount + todos

  let index = 0
  if (hasElasticResponse) index += 15
  if (hasDampingCapacity) index += 15
  if (hasNoRigidJoints) index += 15
  if (hasBendWithoutBreak) index += 10
  if (hasSelfRighting) index += 10
  if (hasAdaptiveGrowth) index += 10
  if (hasNoBrittleFracture) index += 10
  if (hasStressRelief) index += 5
  if (hasThermalExpansion) index += 10
  index = Math.min(index, 100)
  index = Math.max(index, 0)

  let resilience: FlexibilityMeasure['resilience'] = 'fossilized'
  if (index >= 80) resilience = 'supple'
  else if (index >= 65) resilience = 'flexible'
  else if (index >= 50) resilience = 'moderate'
  else if (index >= 35) resilience = 'stiff'
  else if (index >= 20) resilience = 'brittle'

  return {
    brittleCount,
    hasAdaptiveGrowth,
    hasBendWithoutBreak,
    hasDampingCapacity,
    hasElasticResponse,
    hasNoBrittleFracture,
    hasNoRigidJoints,
    hasSelfRighting,
    hasStressRelief,
    hasThermalExpansion,
    index,
    isFlexible,
    resilience,
    rigidCount,
  }
}

/** @example measureHealth(content) returns HealthMeasure */
export function measureHealth(content: string): HealthMeasure {
  const anyCount = countAny(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const jsdoc = countJSDoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)
  const blockComments = countBlockComments(content)

  const hasNewGrowth = exports > 0
  const hasProperIrrigation = imports > 0 && exports > 0
  const hasNoDisease = anyCount === 0 && commentedCode === 0
  const hasNoPests = todos === 0 && consoleCount === 0
  const hasProperNutrition = jsdoc > 0 || blockComments > 0
  const hasNoFungalInfection = todos === 0
  const hasGoodSoilContact = tryCatch > 0 || asyncCount > 0
  const hasSunExposure = jsdoc > 0
  const hasNoWindDamage = commentedCode === 0
  const isHealthy = hasNoDisease && hasNoPests && hasProperNutrition

  const diseaseCount = anyCount + commentedCode
  const pestCount = todos + consoleCount

  let score = 0
  if (hasNewGrowth) score += 10
  if (hasProperIrrigation) score += 15
  if (hasNoDisease) score += 15
  if (hasNoPests) score += 15
  if (hasProperNutrition) score += 10
  if (hasNoFungalInfection) score += 10
  if (hasGoodSoilContact) score += 10
  if (hasSunExposure) score += 10
  if (hasNoWindDamage) score += 5
  score = Math.min(score, 100)
  score = Math.max(score, 0)

  let vitality: HealthMeasure['vitality'] = 'dead'
  if (score >= 80) vitality = 'flourishing'
  else if (score >= 65) vitality = 'healthy'
  else if (score >= 50) vitality = 'vigorous'
  else if (score >= 35) vitality = 'stressed'
  else if (score >= 20) vitality = 'declining'

  return {
    diseaseCount,
    hasGoodSoilContact,
    hasNewGrowth,
    hasNoDisease,
    hasNoFungalInfection,
    hasNoPests,
    hasNoWindDamage,
    hasProperIrrigation,
    hasProperNutrition,
    hasSunExposure,
    isHealthy,
    pestCount,
    score,
    vitality,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(85) returns 'moso-bamboo' */
export function classifyCondition(score: number): BambooCulm['condition'] {
  if (score >= 80) return 'moso-bamboo'
  if (score >= 65) return 'giant-bamboo'
  if (score >= 50) return 'black-bamboo'
  if (score >= 35) return 'lucky-bamboo'
  if (score >= 20) return 'dried-cane'
  return 'mulch'
}

/** @example classifyClusterType(culms) returns cluster type */
export function classifyClusterType(culms: BambooCulm[]): GroveCluster['clusterType'] {
  if (culms.length === 0) return 'wasteland'
  const avgQuality = culms.reduce((s, c) => s + c.qualityScore, 0) / culms.length
  const moso = culms.filter((c) => c.condition === 'moso-bamboo').length
  if (avgQuality >= 75 && moso >= Math.ceil(culms.length * 0.3)) return 'forest'
  if (avgQuality >= 60) return 'grove'
  if (avgQuality >= 40) return 'thicket'
  if (avgQuality >= 25) return 'hedge'
  if (avgQuality >= 10) return 'stand'
  return 'wasteland'
}

/** @example classifyClusterCondition(avgHealth) returns condition */
export function classifyClusterCondition(avgHealth: number): GroveCluster['condition'] {
  if (avgHealth >= 80) return 'ancient-forest'
  if (avgHealth >= 65) return 'mature-grove'
  if (avgHealth >= 50) return 'young-plantation'
  if (avgHealth >= 35) return 'nursery'
  if (avgHealth >= 20) return 'cleared-field'
  return 'desert'
}

/** @example classifyGardenerGrade(85) returns 'master-gardener' */
export function classifyGardenerGrade(avgHealth: number): BambooGroveResult['stats']['gardenerGrade'] {
  if (avgHealth >= 80) return 'master-gardener'
  if (avgHealth >= 65) return 'horticulturist'
  if (avgHealth >= 50) return 'gardener'
  if (avgHealth >= 35) return 'landscaper'
  if (avgHealth >= 20) return 'weekend-warrior'
  return 'concrete-paver'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeBambooCulm(content, filePath) returns BambooCulm */
export function analyzeBambooCulm(content: string, filePath: string): BambooCulm {
  const strength = measureStrength(content)
  const nodes = measureNodes(content)
  const rhizome = measureRhizome(content)
  const canopy = measureCanopy(content)
  const flexibility = measureFlexibility(content)
  const health = measureHealth(content)

  const qualityScore = Math.round(
    strength.level * 0.2 + nodes.spacing * 0.15 + rhizome.depth * 0.15 +
    canopy.spread * 0.15 + flexibility.index * 0.15 + health.score * 0.2,
  )

  return {
    canopy,
    canopySpread: canopy.spread,
    condition: classifyCondition(qualityScore),
    culmStrength: strength.level,
    file: filePath,
    flexibility,
    flexibilityIndex: flexibility.index,
    groveHealth: health.score,
    health,
    nodeSpacing: nodes.spacing,
    nodes,
    qualityScore,
    rhizome,
    rhizomeDepth: rhizome.depth,
    strength,
  }
}

/** @example analyzeGroveCluster(culms, dirPath) returns GroveCluster */
export function analyzeGroveCluster(culms: BambooCulm[], dirPath: string): GroveCluster {
  const avgStrength = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.culmStrength, 0) / culms.length) : 0
  const avgSpacing = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.nodeSpacing, 0) / culms.length) : 0
  const avgHealth = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.groveHealth, 0) / culms.length) : 0
  const mosoCount = culms.filter((c) => c.condition === 'moso-bamboo').length
  const mulchCount = culms.filter((c) => c.condition === 'mulch').length
  const strongCount = culms.filter((c) => c.strength.isStrong).length
  const flexibleCount = culms.filter((c) => c.flexibility.isFlexible).length
  const clusterType = classifyClusterType(culms)
  const avgQuality = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.qualityScore, 0) / culms.length) : 0
  const condition = classifyClusterCondition(avgQuality)

  return {
    avgHealth,
    avgSpacing,
    avgStrength,
    clusterType,
    condition,
    culms,
    directory: dirPath,
    flexibleCount,
    mosoCount,
    mulchCount,
    strongCount,
  }
}

/** @example generateRecommendations(culms, clusters, grove, stats) returns string[] */
export function generateRecommendations(
  culms: BambooCulm[],
  _clusters: GroveCluster[],
  grove: BambooGroveResult['grove'],
  _stats: BambooGroveResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (grove.overallHealth < 50) {
    recommendations.push('Grove health is declining — focus on reducing technical debt and improving code structure')
  }

  const weakCulms = culms.filter((c) => !c.strength.isStrong)
  if (weakCulms.length > 0) {
    recommendations.push(`${weakCulms.length} culm(s) are weak — remove any types, commented-out code, and reduce nesting`)
  }

  const poorSpacing = culms.filter((c) => !c.nodes.isWellSpaced)
  if (poorSpacing.length > 0) {
    recommendations.push(`${poorSpacing.length} culm(s) have poor node spacing — improve modularity with exports, types, and interfaces`)
  }

  const shallowRoots = culms.filter((c) => !c.rhizome.isDeepRooted)
  if (shallowRoots.length > 0) {
    recommendations.push(`${shallowRoots.length} culm(s) have shallow roots — improve dependency management and reduce any usage`)
  }

  const mulchCulms = culms.filter((c) => c.condition === 'mulch')
  if (mulchCulms.length > 0) {
    recommendations.push(`${mulchCulms.length} culm(s) are mulch quality — consider structural rewrite`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Bamboo grove is flourishing — maintain current growth standards')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildBambooGroveResult(files, contents, options) returns BambooGroveResult */
export function buildBambooGroveResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): BambooGroveResult {
  const culms: BambooCulm[] = files.map((file, i) =>
    analyzeBambooCulm(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, BambooCulm[]>()
  for (const culm of culms) {
    const dir = culm.file.includes('/') ? culm.file.substring(0, culm.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(culm)
    } else {
      dirMap.set(dir, [culm])
    }
  }

  const clusters: GroveCluster[] = Array.from(dirMap.entries()).map(([dir, dirCulms]) =>
    analyzeGroveCluster(dirCulms, dir),
  )

  const avgCulmStrength = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.culmStrength, 0) / culms.length) : 0
  const avgNodeSpacing = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.nodeSpacing, 0) / culms.length) : 0
  const avgRhizomeDepth = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.rhizomeDepth, 0) / culms.length) : 0
  const avgCanopySpread = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.canopySpread, 0) / culms.length) : 0
  const avgFlexibilityIndex = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.flexibilityIndex, 0) / culms.length) : 0
  const avgGroveHealth = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.groveHealth, 0) / culms.length) : 0
  const overallHealth = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.qualityScore, 0) / culms.length) : 0

  const grove = {
    avgHealth: avgGroveHealth,
    avgSpacing: avgNodeSpacing,
    avgStrength: avgCulmStrength,
    isFlourishing: overallHealth >= 50,
    overallHealth,
  }

  const mosoBambooCount = culms.filter((c) => c.condition === 'moso-bamboo').length
  const giantBambooCount = culms.filter((c) => c.condition === 'giant-bamboo').length
  const blackBambooCount = culms.filter((c) => c.condition === 'black-bamboo').length
  const luckyBambooCount = culms.filter((c) => c.condition === 'lucky-bamboo').length
  const driedCaneCount = culms.filter((c) => c.condition === 'dried-cane').length
  const mulchCount = culms.filter((c) => c.condition === 'mulch').length
  const isStrongCount = culms.filter((c) => c.strength.isStrong).length
  const isWellSpacedCount = culms.filter((c) => c.nodes.isWellSpaced).length
  const isDeepRootedCount = culms.filter((c) => c.rhizome.isDeepRooted).length
  const hasFullCoverageCount = culms.filter((c) => c.canopy.hasFullCoverage).length
  const isFlexibleCount = culms.filter((c) => c.flexibility.isFlexible).length
  const isHealthyCount = culms.filter((c) => c.health.isHealthy).length

  const gardenerGrade = classifyGardenerGrade(overallHealth)

  const bestCulm = culms.length > 0
    ? culms.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const strongest = culms.length > 0
    ? culms.reduce((best, c) => c.culmStrength > best.culmStrength ? c : best).file : ''
  const bestSpaced = culms.length > 0
    ? culms.reduce((best, c) => c.nodeSpacing > best.nodeSpacing ? c : best).file : ''
  const deepestRooted = culms.length > 0
    ? culms.reduce((best, c) => c.rhizomeDepth > best.rhizomeDepth ? c : best).file : ''
  const bestCoverage = culms.length > 0
    ? culms.reduce((best, c) => c.canopySpread > best.canopySpread ? c : best).file : ''
  const mostFlexible = culms.length > 0
    ? culms.reduce((best, c) => c.flexibilityIndex > best.flexibilityIndex ? c : best).file : ''

  const stats = {
    avgCanopySpread,
    avgCulmStrength,
    avgFlexibilityIndex,
    avgGroveHealth,
    avgNodeSpacing,
    avgRhizomeDepth,
    bestCoverage,
    bestCulm,
    bestSpaced,
    blackBambooCount,
    deepestRooted,
    driedCaneCount,
    gardenerGrade,
    giantBambooCount,
    hasFullCoverageCount,
    isDeepRootedCount,
    isFlexibleCount,
    isHealthyCount,
    isStrongCount,
    isWellSpacedCount,
    luckyBambooCount,
    mosoBambooCount,
    mostFlexible,
    mulchCount,
    overallHealth,
    strongest,
    totalClusters: clusters.length,
    totalFiles: files.length,
  }

  const recommendations = generateRecommendations(culms, clusters, grove, stats)

  return { clusters, culms, grove, recommendations, stats }
}
