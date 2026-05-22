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

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface ClarityMeasure {
  level: number
  grade: 'flawless' | 'vvs' | 'vs' | 'si' | 'i' | 'opaque'
  isTransparent: boolean
  hasNoInclusions: boolean
  hasNoFractures: boolean
  hasNoFeathers: boolean
  hasNoClouding: boolean
  hasNoColorZoning: boolean
  isWaterClear: boolean
  hasBrilliance: boolean
  hasDispersion: boolean
  hasLuminescence: boolean
  inclusionCount: number
  fractureCount: number
}

export interface LatticeMeasure {
  structure: number
  system: 'hexagonal' | 'cubic' | 'tetragonal' | 'orthorhombic' | 'monoclinic' | 'amorphous'
  isWellOrdered: boolean
  hasProperSymmetry: boolean
  hasCrystalAxes: boolean
  hasUnitCell: boolean
  hasMillerIndices: boolean
  hasCleavagePlanes: boolean
  hasTwinBoundaries: boolean
  hasNoDislocations: boolean
  hasNoGrainBoundaries: boolean
  hasNoStackingFaults: boolean
  dislocationCount: number
  stackingFaultCount: number
}

export interface ResonanceMeasure {
  frequency: number
  stability: 'ultra-stable' | 'stable' | 'drifting' | 'unstable' | 'erratic' | 'silent'
  isConsistent: boolean
  hasPreciseFrequency: boolean
  hasNoFrequencyDrift: boolean
  hasOvertoneModes: boolean
  hasTemperatureStability: boolean
  hasPiezoelectric: boolean
  hasNoSpurious: boolean
  hasProperQFactor: boolean
  hasNoNoiseFloor: boolean
  hasOscillation: boolean
  spuriousCount: number
  noiseCount: number
}

export interface FacetMeasure {
  quality: number
  cut: 'brilliant' | 'step' | 'mixed' | 'cabochon' | 'rough' | 'shattered'
  isWellCut: boolean
  hasProperAngles: boolean
  hasProportions: boolean
  hasSymmetry: boolean
  hasPolish: boolean
  hasNoChips: boolean
  hasNoScratches: boolean
  hasTable: boolean
  hasCrown: boolean
  hasPavilion: boolean
  chipCount: number
  scratchCount: number
}

export interface TransmissionMeasure {
  quality: number
  spectrum: 'full-spectrum' | 'visible' | 'infrared' | 'ultraviolet' | 'narrow-band' | 'opaque'
  isTransmissive: boolean
  hasHighTransmission: boolean
  hasNoAbsorption: boolean
  hasProperRefraction: boolean
  hasBirefringence: boolean
  hasPleochroism: boolean
  hasFluorescence: boolean
  hasNoInternalReflections: boolean
  hasNoScattering: boolean
  absorptionCount: number
  scatteringCount: number
}

export interface PerfectionMeasure {
  score: number
  carat: number
  hasGemQuality: boolean
  hasCollectorGrade: boolean
  hasMuseumQuality: boolean
  hasInvestmentGrade: boolean
  hasCommercialGrade: boolean
  hasIndustrialGrade: boolean
  hasNoFlaws: boolean
  hasPerfectTermination: boolean
  hasEnhydro: boolean
  hasPhantomGrowth: boolean
  flawCount: number
}

export interface CrystalSpecimen {
  file: string
  crystalClarity: number
  latticeStructure: number
  resonantFrequency: number
  facetQuality: number
  lightTransmission: number
  crystalPerfection: number
  clarity: ClarityMeasure
  lattice: LatticeMeasure
  resonance: ResonanceMeasure
  facet: FacetMeasure
  transmission: TransmissionMeasure
  perfection: PerfectionMeasure
  condition: 'herkimer-diamond' | 'clear-quartz' | 'rutilated' | 'smoky-quartz' | 'milky-quartz' | 'sand'
  qualityScore: number
}

export interface CrystalCave {
  directory: string
  specimens: CrystalSpecimen[]
  avgClarity: number
  avgStructure: number
  avgPerfection: number
  herkimerCount: number
  sandCount: number
  transparentCount: number
  wellCutCount: number
  caveType: 'geode' | 'vein' | 'pegmatite' | 'alluvial' | 'mine-tailings' | 'sandbox'
  condition: 'crystal-cathedral' | 'gem-gallery' | 'mineral-museum' | 'rock-shop' | 'gravel-pit' | 'beach'
}

export interface QuartzCrystalResult {
  specimens: CrystalSpecimen[]
  caves: CrystalCave[]
  collection: {
    avgClarity: number
    avgStructure: number
    avgPerfection: number
    isGemQuality: boolean
    overallClarity: number
  }
  stats: {
    totalFiles: number
    totalCaves: number
    avgCrystalClarity: number
    avgLatticeStructure: number
    avgResonantFrequency: number
    avgFacetQuality: number
    avgLightTransmission: number
    avgCrystalPerfection: number
    herkimerDiamondCount: number
    clearQuartzCount: number
    rutilatedCount: number
    smokyQuartzCount: number
    milkyQuartzCount: number
    sandCount: number
    isTransparentCount: number
    hasNoInclusionsCount: number
    isWellOrderedCount: number
    hasNoDislocationsCount: number
    isConsistentCount: number
    hasNoSpuriousCount: number
    isWellCutCount: number
    isTransmissiveCount: number
    hasGemQualityCount: number
    hasNoFlawsCount: number
    overallClarity: number
    gemologistGrade: 'master-gemologist' | 'gemologist' | 'lapidary' | 'collector' | 'rockhound' | 'tourist'
    bestSpecimen: string
    clearestCrystal: string
    bestStructure: string
    mostConsistent: string
    bestFacets: string
  }
  recommendations: string[]
}

// ─── Counter helpers ────────────────────────────────────────────────────────

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

/** @example countForLoops('for (;;)') returns count */
export function countForLoops(content: string): number {
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

/** @example measureClarity(content) returns ClarityMeasure */
export function measureClarity(content: string): ClarityMeasure {
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const nestedBlocks = countNestedBlocks(content)
  const deepNested = countDeepNested(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const jsdoc = countJSDoc(content)

  const inclusionCount = anyCount + commentedCode
  const fractureCount = deepNested
  const hasNoInclusions = inclusionCount === 0
  const hasNoFractures = fractureCount === 0
  const hasNoFeathers = nestedBlocks <= 5
  const hasNoClouding = todos === 0
  const hasNoColorZoning = consoleCount === 0
  const isWaterClear = hasNoInclusions && hasNoFractures && hasNoClouding && hasNoColorZoning
  const hasBrilliance = exports > 0 && imports > 0
  const hasDispersion = exports > 2
  const hasLuminescence = jsdoc > 0
  const isTransparent = hasNoInclusions && hasNoClouding

  let level = 0
  if (hasNoInclusions) level += 20
  if (hasNoFractures) level += 15
  if (hasNoFeathers) level += 10
  if (hasNoClouding) level += 15
  if (hasNoColorZoning) level += 10
  if (isWaterClear) level += 10
  if (hasBrilliance) level += 10
  if (hasLuminescence) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let grade: ClarityMeasure['grade'] = 'opaque'
  if (level >= 80) grade = 'flawless'
  else if (level >= 65) grade = 'vvs'
  else if (level >= 50) grade = 'vs'
  else if (level >= 35) grade = 'si'
  else if (level >= 20) grade = 'i'
  else grade = 'opaque'

  return {
    fractureCount,
    grade,
    hasBrilliance,
    hasDispersion,
    hasLuminescence,
    hasNoClouding,
    hasNoColorZoning,
    hasNoFeathers,
    hasNoFractures,
    hasNoInclusions,
    inclusionCount,
    isTransparent,
    isWaterClear,
    level,
  }
}

/** @example measureLattice(content) returns LatticeMeasure */
export function measureLattice(content: string): LatticeMeasure {
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

  const hasProperSymmetry = (funcs + arrows) > 0 && (interfaces + types) > 0
  const hasCrystalAxes = classes > 0 || funcs > 0
  const hasUnitCell = exports > 0 && imports > 0
  const hasMillerIndices = interfaces > 0 || types > 0
  const hasCleavagePlanes = accessMods > 0
  const hasTwinBoundaries = enums > 0 || generics > 0
  const hasNoDislocations = deepNested <= 2
  const hasNoGrainBoundaries = nestedBlocks <= 10
  const hasNoStackingFaults = nestedBlocks <= 5
  const isWellOrdered = hasProperSymmetry && hasUnitCell && hasMillerIndices
  const dislocationCount = deepNested > 2 ? deepNested : 0
  const stackingFaultCount = nestedBlocks > 5 ? nestedBlocks - 5 : 0

  let structure = 0
  if (hasProperSymmetry) structure += 15
  if (hasCrystalAxes) structure += 10
  if (hasUnitCell) structure += 15
  if (hasMillerIndices) structure += 15
  if (hasCleavagePlanes) structure += 10
  if (hasTwinBoundaries) structure += 10
  if (hasNoDislocations) structure += 10
  if (hasNoGrainBoundaries) structure += 10
  if (hasNoStackingFaults) structure += 5
  structure = Math.min(structure, 100)
  structure = Math.max(structure, 0)

  let system: LatticeMeasure['system'] = 'amorphous'
  if (structure >= 80) system = 'hexagonal'
  else if (structure >= 65) system = 'cubic'
  else if (structure >= 50) system = 'tetragonal'
  else if (structure >= 35) system = 'orthorhombic'
  else if (structure >= 20) system = 'monoclinic'
  else system = 'amorphous'

  return {
    dislocationCount,
    hasCleavagePlanes,
    hasCrystalAxes,
    hasGrainBoundaries: !hasNoGrainBoundaries,
    hasMillerIndices,
    hasNoDislocations,
    hasNoGrainBoundaries,
    hasNoStackingFaults,
    hasProperSymmetry,
    hasTwinBoundaries,
    hasUnitCell,
    isWellOrdered,
    stackingFaultCount,
    structure,
    system,
  }
}

/** @example measureResonance(content) returns ResonanceMeasure */
export function measureResonance(content: string): ResonanceMeasure {
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
  const defaults = (content.match(DEFAULT_PARAM_REGEX) ?? []).length
  const callbacks = countCallbackNesting(content)
  const promiseChains = countPromiseChains(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const hasPreciseFrequency = asyncCount > 0 && awaitCount > 0
  const hasNoFrequencyDrift = callbacks === 0 && promiseChains === 0
  const hasOvertoneModes = switches > 0 || ternaries > 0
  const hasTemperatureStability = tryCatch > 0 && finallys > 0
  const hasPiezoelectric = tryCatch > 0 || catches > 0
  const hasNoSpurious = todos === 0 && consoleCount === 0
  const hasProperQFactor = hasPreciseFrequency && hasPiezoelectric
  const hasNoNoiseFloor = consoleCount === 0
  const hasOscillation = forLoops_count(content) > 0 || countWhileLoops(content) > 0
  const isConsistent = hasPreciseFrequency && hasNoFrequencyDrift && hasNoSpurious
  const spuriousCount = todos + consoleCount
  const noiseCount = consoleCount

  let frequency = 0
  if (hasPreciseFrequency) frequency += 15
  if (hasNoFrequencyDrift) frequency += 15
  if (hasOvertoneModes) frequency += 10
  if (hasTemperatureStability) frequency += 10
  if (hasPiezoelectric) frequency += 10
  if (hasNoSpurious) frequency += 15
  if (hasProperQFactor) frequency += 10
  if (hasNoNoiseFloor) frequency += 10
  if (defaults > 0) frequency += 5
  frequency = Math.min(frequency, 100)
  frequency = Math.max(frequency, 0)

  let stability: ResonanceMeasure['stability'] = 'silent'
  if (frequency >= 80) stability = 'ultra-stable'
  else if (frequency >= 65) stability = 'stable'
  else if (frequency >= 50) stability = 'drifting'
  else if (frequency >= 35) stability = 'unstable'
  else if (frequency >= 20) stability = 'erratic'
  else stability = 'silent'

  return {
    frequency,
    hasNoFrequencyDrift,
    hasNoNoiseFloor,
    hasNoSpurious,
    hasOscillation,
    hasOvertoneModes,
    hasPiezoelectric,
    hasPreciseFrequency,
    hasProperQFactor,
    hasTemperatureStability,
    isConsistent,
    noiseCount,
    spuriousCount,
    stability,
  }
}

function forLoops_count(content: string): number {
  return (content.match(FOR_REGEX) ?? []).length
}

/** @example measureFacet(content) returns FacetMeasure */
export function measureFacet(content: string): FacetMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const arrows = countArrows(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const jsdoc = countJSDoc(content)
  const readonly = countReadonly(content)

  const hasProperAngles = generics > 0 && (interfaces + types) > 0
  const hasProportions = (funcs + arrows) > 0 && (funcs + arrows) <= 15
  const hasSymmetry = exports > 0 && imports > 0
  const hasPolish = jsdoc > 0 && accessMods > 0
  const hasNoChips = exports > 0
  const hasNoScratches = imports > 0 && imports <= 20
  const hasTable = exports > 0
  const hasCrown = interfaces > 0 || types > 0
  const hasPavilion = classes > 0 || funcs > 0
  const isWellCut = hasProperAngles && hasProportions && hasSymmetry && hasTable

  const chipCount = exports === 0 ? 1 : 0
  const scratchCount = imports > 20 ? 1 : 0

  let quality = 0
  if (hasProperAngles) quality += 15
  if (hasProportions) quality += 15
  if (hasSymmetry) quality += 10
  if (hasPolish) quality += 15
  if (hasNoChips) quality += 10
  if (hasNoScratches) quality += 10
  if (hasTable) quality += 5
  if (hasCrown) quality += 10
  if (hasPavilion) quality += 10
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let cut: FacetMeasure['cut'] = 'shattered'
  if (quality >= 80) cut = 'brilliant'
  else if (quality >= 65) cut = 'step'
  else if (quality >= 50) cut = 'mixed'
  else if (quality >= 35) cut = 'cabochon'
  else if (quality >= 20) cut = 'rough'
  else cut = 'shattered'

  return {
    chipCount,
    cut,
    hasCrown,
    hasNoChips,
    hasNoScratches,
    hasPavilion,
    hasPolish,
    hasProperAngles,
    hasProportions,
    hasSymmetry,
    hasTable,
    isWellCut,
    quality,
    scratchCount,
  }
}

/** @example measureTransmission(content) returns TransmissionMeasure */
export function measureTransmission(content: string): TransmissionMeasure {
  const jsdoc = countJSDoc(content)
  const blockComments = countBlockComments(content)
  const comments = countComments(content)
  const types = countTypeAliases(content)
  const interfaces = countInterfaces(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const readonly = countReadonly(content)
  const reexports = countReexports(content)
  const dynamicImports = countDynamicImports(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)

  const hasHighTransmission = jsdoc > 0 && blockComments > 0
  const hasNoAbsorption = jsdoc > 0 || comments > 5
  const hasProperRefraction = generics > 0
  const hasBirefringence = types > 0 && interfaces > 0
  const hasPleochroism = accessMods > 0 && readonly > 0
  const hasFluorescence = reexports > 0 || dynamicImports > 0
  const hasNoInternalReflections = anyCount === 0
  const hasNoScattering = consoleCount === 0
  const isTransmissive = hasHighTransmission || hasNoAbsorption
  const absorptionCount = jsdoc === 0 ? 1 : 0
  const scatteringCount = consoleCount

  let quality = 0
  if (hasHighTransmission) quality += 20
  if (hasNoAbsorption) quality += 15
  if (hasProperRefraction) quality += 10
  if (hasBirefringence) quality += 10
  if (hasPleochroism) quality += 10
  if (hasFluorescence) quality += 5
  if (hasNoInternalReflections) quality += 10
  if (hasNoScattering) quality += 10
  if (jsdoc > 0) quality += 10
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let spectrum: TransmissionMeasure['spectrum'] = 'opaque'
  if (quality >= 80) spectrum = 'full-spectrum'
  else if (quality >= 65) spectrum = 'visible'
  else if (quality >= 50) spectrum = 'infrared'
  else if (quality >= 35) spectrum = 'ultraviolet'
  else if (quality >= 20) spectrum = 'narrow-band'
  else spectrum = 'opaque'

  return {
    absorptionCount,
    hasBirefringence,
    hasFluorescence,
    hasHighTransmission,
    hasNoAbsorption,
    hasNoInternalReflections,
    hasNoScattering,
    hasPleochroism,
    hasProperRefraction,
    isTransmissive,
    quality,
    scatteringCount,
    spectrum,
  }
}

/** @example measurePerfection(content) returns PerfectionMeasure */
export function measurePerfection(content: string): PerfectionMeasure {
  const clarity = measureClarity(content)
  const lattice = measureLattice(content)
  const resonance = measureResonance(content)
  const facet = measureFacet(content)
  const transmission = measureTransmission(content)

  const carat = Math.min(content.split('\n').length, 100)
  const flawCount = clarity.inclusionCount + clarity.fractureCount + lattice.dislocationCount + resonance.spuriousCount
  const hasNoFlaws = flawCount === 0
  const hasGemQuality = clarity.level >= 70 && lattice.structure >= 70 && facet.quality >= 70
  const hasCollectorGrade = clarity.level >= 80 && lattice.structure >= 80 && resonance.frequency >= 60
  const hasMuseumQuality = clarity.level >= 90 && lattice.structure >= 90 && facet.quality >= 80
  const hasInvestmentGrade = clarity.level >= 70 && transmission.quality >= 60
  const hasCommercialGrade = clarity.level >= 50 && facet.quality >= 50
  const hasIndustrialGrade = clarity.level >= 30
  const hasPerfectTermination = clarity.isWaterClear && lattice.hasNoDislocations
  const hasEnhydro = resonance.hasPreciseFrequency && resonance.hasNoFrequencyDrift
  const hasPhantomGrowth = clarity.hasLuminescence && transmission.hasHighTransmission

  const score = Math.round(
    (clarity.level * 0.2 + lattice.structure * 0.2 + resonance.frequency * 0.2 +
     facet.quality * 0.15 + transmission.quality * 0.15 + carat * 0.1)
  )

  return {
    carat,
    flawCount,
    hasCommercialGrade,
    hasCollectorGrade,
    hasEnhydro,
    hasGemQuality,
    hasIndustrialGrade,
    hasInvestmentGrade,
    hasMuseumQuality,
    hasNoFlaws,
    hasPerfectTermination,
    hasPhantomGrowth,
    score,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(85) returns 'herkimer-diamond' */
export function classifyCondition(score: number): CrystalSpecimen['condition'] {
  if (score >= 80) return 'herkimer-diamond'
  if (score >= 65) return 'clear-quartz'
  if (score >= 50) return 'rutilated'
  if (score >= 35) return 'smoky-quartz'
  if (score >= 20) return 'milky-quartz'
  return 'sand'
}

/** @example classifyCaveType(specimens) returns cave type */
export function classifyCaveType(specimens: CrystalSpecimen[]): CrystalCave['caveType'] {
  if (specimens.length === 0) return 'sandbox'
  const avgQuality = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  const herkimer = specimens.filter((sp) => sp.condition === 'herkimer-diamond').length
  if (avgQuality >= 75 && herkimer >= Math.ceil(specimens.length * 0.3)) return 'geode'
  if (avgQuality >= 60) return 'vein'
  if (avgQuality >= 40) return 'pegmatite'
  if (avgQuality >= 25) return 'alluvial'
  if (avgQuality >= 10) return 'mine-tailings'
  return 'sandbox'
}

/** @example classifyCaveCondition(avgQuality) returns cave condition */
export function classifyCaveCondition(avgQuality: number): CrystalCave['condition'] {
  if (avgQuality >= 80) return 'crystal-cathedral'
  if (avgQuality >= 65) return 'gem-gallery'
  if (avgQuality >= 50) return 'mineral-museum'
  if (avgQuality >= 35) return 'rock-shop'
  if (avgQuality >= 20) return 'gravel-pit'
  return 'beach'
}

/** @example classifyGemologistGrade(85) returns 'master-gemologist' */
export function classifyGemologistGrade(avgClarity: number): QuartzCrystalResult['stats']['gemologistGrade'] {
  if (avgClarity >= 80) return 'master-gemologist'
  if (avgClarity >= 65) return 'gemologist'
  if (avgClarity >= 50) return 'lapidary'
  if (avgClarity >= 35) return 'collector'
  if (avgClarity >= 20) return 'rockhound'
  return 'tourist'
}

// ─── Analysis Functions ─────────────────────────────────────────────────────

/** @example analyzeCrystalSpecimen(content, filePath) returns CrystalSpecimen */
export function analyzeCrystalSpecimen(content: string, filePath: string): CrystalSpecimen {
  const clarity = measureClarity(content)
  const lattice = measureLattice(content)
  const resonance = measureResonance(content)
  const facet = measureFacet(content)
  const transmission = measureTransmission(content)
  const perfection = measurePerfection(content)

  const qualityScore = Math.round(
    (clarity.level * 0.2 + lattice.structure * 0.2 + resonance.frequency * 0.15 +
     facet.quality * 0.15 + transmission.quality * 0.15 + perfection.score * 0.15)
  )

  return {
    clarity,
    crystalClarity: clarity.level,
    crystalPerfection: perfection.score,
    condition: classifyCondition(qualityScore),
    facet,
    facetQuality: facet.quality,
    file: filePath,
    lattice,
    latticeStructure: lattice.structure,
    lightTransmission: transmission.quality,
    perfection,
    qualityScore,
    resonance,
    resonantFrequency: resonance.frequency,
    transmission,
  }
}

/** @example analyzeCrystalCave(specimens, dirPath) returns CrystalCave */
export function analyzeCrystalCave(specimens: CrystalSpecimen[], dirPath: string): CrystalCave {
  const avgClarity = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.crystalClarity, 0) / specimens.length) : 0
  const avgStructure = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.latticeStructure, 0) / specimens.length) : 0
  const avgPerfection = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.crystalPerfection, 0) / specimens.length) : 0
  const herkimerCount = specimens.filter((sp) => sp.condition === 'herkimer-diamond').length
  const sandCount = specimens.filter((sp) => sp.condition === 'sand').length
  const transparentCount = specimens.filter((sp) => sp.clarity.isTransparent).length
  const wellCutCount = specimens.filter((sp) => sp.facet.isWellCut).length
  const caveType = classifyCaveType(specimens)
  const avgQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length) : 0
  const condition = classifyCaveCondition(avgQuality)

  return {
    avgClarity,
    avgPerfection,
    avgStructure,
    caveType,
    condition,
    directory: dirPath,
    herkimerCount,
    sandCount,
    specimens,
    transparentCount,
    wellCutCount,
  }
}

/** @example generateRecommendations(specimens, caves, collection, stats) returns string[] */
export function generateRecommendations(
  specimens: CrystalSpecimen[],
  _caves: CrystalCave[],
  collection: QuartzCrystalResult['collection'],
  _stats: QuartzCrystalResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (collection.overallClarity < 50) {
    recommendations.push('Overall crystal clarity is low — focus on removing code impurities and improving readability')
  }

  const cloudySpecimens = specimens.filter((sp) => !sp.clarity.isTransparent)
  if (cloudySpecimens.length > 0) {
    recommendations.push(`${cloudySpecimens.length} file(s) are not transparent — remove any types, console statements, and TODO comments`)
  }

  const disorderedSpecimens = specimens.filter((sp) => !sp.lattice.isWellOrdered)
  if (disorderedSpecimens.length > 0) {
    recommendations.push(`${disorderedSpecimens.length} file(s) have disordered lattice — add interfaces, types, and organize exports`)
  }

  const inconsistentSpecimens = specimens.filter((sp) => !sp.resonance.isConsistent)
  if (inconsistentSpecimens.length > 0) {
    recommendations.push(`${inconsistentSpecimens.length} file(s) have inconsistent resonance — adopt async/await and add error handling`)
  }

  const opaqueSpecimens = specimens.filter((sp) => !sp.transmission.isTransmissive)
  if (opaqueSpecimens.length > 0) {
    recommendations.push(`${opaqueSpecimens.length} file(s) have opaque transmission — add JSDoc documentation and type annotations`)
  }

  const sandSpecimens = specimens.filter((sp) => sp.condition === 'sand')
  if (sandSpecimens.length > 0) {
    recommendations.push(`${sandSpecimens.length} file(s) are sand quality — consider structural rewrite`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Crystal collection is gem quality — maintain current clarity standards')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildQuartzCrystalResult(files, contents, options) returns QuartzCrystalResult */
export function buildQuartzCrystalResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): QuartzCrystalResult {
  const specimens: CrystalSpecimen[] = files.map((file, i) =>
    analyzeCrystalSpecimen(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CrystalSpecimen[]>()
  for (const sp of specimens) {
    const dir = sp.file.includes('/') ? sp.file.substring(0, sp.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(sp)
    } else {
      dirMap.set(dir, [sp])
    }
  }

  const caves: CrystalCave[] = Array.from(dirMap.entries()).map(([dir, dirSpecimens]) =>
    analyzeCrystalCave(dirSpecimens, dir),
  )

  const avgClarity = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.crystalClarity, 0) / specimens.length) : 0
  const avgStructure = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.latticeStructure, 0) / specimens.length) : 0
  const avgPerfection = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.crystalPerfection, 0) / specimens.length) : 0
  const overallClarity = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length) : 0

  const collection = {
    avgClarity,
    avgPerfection,
    avgStructure,
    isGemQuality: overallClarity >= 50,
    overallClarity,
  }

  const herkimerDiamondCount = specimens.filter((sp) => sp.condition === 'herkimer-diamond').length
  const clearQuartzCount = specimens.filter((sp) => sp.condition === 'clear-quartz').length
  const rutilatedCount = specimens.filter((sp) => sp.condition === 'rutilated').length
  const smokyQuartzCount = specimens.filter((sp) => sp.condition === 'smoky-quartz').length
  const milkyQuartzCount = specimens.filter((sp) => sp.condition === 'milky-quartz').length
  const sandCount = specimens.filter((sp) => sp.condition === 'sand').length
  const isTransparentCount = specimens.filter((sp) => sp.clarity.isTransparent).length
  const hasNoInclusionsCount = specimens.filter((sp) => sp.clarity.hasNoInclusions).length
  const isWellOrderedCount = specimens.filter((sp) => sp.lattice.isWellOrdered).length
  const hasNoDislocationsCount = specimens.filter((sp) => sp.lattice.hasNoDislocations).length
  const isConsistentCount = specimens.filter((sp) => sp.resonance.isConsistent).length
  const hasNoSpuriousCount = specimens.filter((sp) => sp.resonance.hasNoSpurious).length
  const isWellCutCount = specimens.filter((sp) => sp.facet.isWellCut).length
  const isTransmissiveCount = specimens.filter((sp) => sp.transmission.isTransmissive).length
  const hasGemQualityCount = specimens.filter((sp) => sp.perfection.hasGemQuality).length
  const hasNoFlawsCount = specimens.filter((sp) => sp.perfection.hasNoFlaws).length

  const avgCrystalClarity = avgClarity
  const avgLatticeStructure = avgStructure
  const avgResonantFrequency = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.resonantFrequency, 0) / specimens.length) : 0
  const avgFacetQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.facetQuality, 0) / specimens.length) : 0
  const avgLightTransmission = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.lightTransmission, 0) / specimens.length) : 0
  const avgCrystalPerfection = avgPerfection

  const gemologistGrade = classifyGemologistGrade(overallClarity)

  const bestSpecimen = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.qualityScore > best.qualityScore ? sp : best).file : ''
  const clearestCrystal = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.crystalClarity > best.crystalClarity ? sp : best).file : ''
  const bestStructure = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.latticeStructure > best.latticeStructure ? sp : best).file : ''
  const mostConsistent = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.resonantFrequency > best.resonantFrequency ? sp : best).file : ''
  const bestFacets = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.facetQuality > best.facetQuality ? sp : best).file : ''

  const stats = {
    avgCrystalClarity,
    avgCrystalPerfection,
    avgFacetQuality,
    avgLatticeStructure,
    avgLightTransmission,
    avgResonantFrequency,
    bestFacets,
    bestSpecimen,
    bestStructure,
    clearestCrystal,
    clearQuartzCount,
    gemologistGrade,
    hasGemQualityCount,
    hasNoDislocationsCount,
    hasNoFlawsCount,
    hasNoInclusionsCount,
    hasNoSpuriousCount,
    herkimerDiamondCount,
    isConsistentCount,
    isTransmissiveCount,
    isTransparentCount,
    isWellCutCount,
    isWellOrderedCount,
    milkyQuartzCount,
    mostConsistent,
    overallClarity,
    rutilatedCount,
    sandCount,
    smokyQuartzCount,
    totalCaves: caves.length,
    totalFiles: files.length,
  }

  const recommendations = generateRecommendations(specimens, caves, collection, stats)

  return { caves, collection, recommendations, specimens, stats }
}
