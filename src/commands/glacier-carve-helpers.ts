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
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g
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
const COMMENT_REGEX = /\/\/.*$/gm
const DEFAULT_EXPORT_REGEX = /\bexport\s+default\b/g
const NAMESPACE_REGEX = /\bnamespace\s+\w+/g
const ABSTRACT_REGEX = /\babstract\s+/g
const DECORATOR_REGEX = /@\w+/g
const ASSERT_REGEX = /\bassert\b/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface DensityMeasure {
  level: number
  type: 'blue-ice' | 'compact-ice' | 'firn' | 'granular' | 'snow-pack' | 'slush'
  isDense: boolean
  hasHighCompression: boolean
  hasNoAirBubbles: boolean
  hasProperCrystal: boolean
  hasNoMeltwater: boolean
  hasGlacialFlow: boolean
  hasPressureRecrystallization: boolean
  hasNoFractureZones: boolean
  hasStratification: boolean
  hasNoIceLenses: boolean
  airBubbleCount: number
  fractureZoneCount: number
}

export interface CarvingMeasure {
  power: number
  style: 'u-shaped' | 'hanging' | 'cirque' | 'fjord' | 'rock-basin' | 'no-carving'
  hasDeepImpact: boolean
  hasUShapeValley: boolean
  hasHangingValleys: boolean
  hasCirqueBasin: boolean
  hasArrete: boolean
  hasHorn: boolean
  hasNoAvalanche: boolean
  hasNoRockfall: boolean
  hasNoOutburstFlood: boolean
  hasSteadyAdvance: boolean
  avalancheCount: number
  rockfallCount: number
}

export interface MoraineMeasure {
  stability: number
  type: 'terminal' | 'lateral' | 'medial' | 'ground' | 'recessional' | 'none'
  isStable: boolean
  hasProperDeposition: boolean
  hasSortedMaterial: boolean
  hasNoUnstableDebris: boolean
  hasErraticBoulders: boolean
  hasNoDeadIce: boolean
  hasProperDrumlin: boolean
  hasEsker: boolean
  hasKame: boolean
  hasNoKettle: boolean
  debrisCount: number
  deadIceCount: number
}

export interface CrevasseMeasure {
  safety: number
  depth: 'surface' | 'shallow' | 'deep' | 'bergschrund' | 'moulins' | 'bottomless'
  isSafe: boolean
  hasProperBridging: boolean
  hasNoHiddenCrevasses: boolean
  hasSnowBridge: boolean
  hasProperRoping: boolean
  hasNoSeracCollapse: boolean
  hasNoIcefall: boolean
  hasRescuePlan: boolean
  hasNoBergschrund: boolean
  hasAnchorPoints: boolean
  hiddenCrevasseCount: number
  icefallCount: number
}

export interface AgeMeasure {
  depth: number
  era: 'pleistocene' | 'pliocene' | 'miocene' | 'oligocene' | 'recent' | 'permafrost'
  isMature: boolean
  hasIceCore: boolean
  hasDustLayers: boolean
  hasVolcanicAsh: boolean
  hasOxygenIsotopes: boolean
  hasNoPermafrost: boolean
  hasProperThaw: boolean
  hasNoFossilIce: boolean
  hasCalving: boolean
  hasNoStagnation: boolean
  fossilCount: number
  stagnationCount: number
}

export interface AdvanceMeasure {
  rate: number
  status: 'advancing' | 'stable' | 'retreating' | 'surging' | 'stagnating' | 'vanished'
  isAdvancing: boolean
  hasProperAccumulation: boolean
  hasAblationControl: boolean
  hasEquilibrium: boolean
  hasMassBalance: boolean
  hasNoRapidRetreat: boolean
  hasNoSurgeRisk: boolean
  hasTidewater: boolean
  hasIceStream: boolean
  hasNoCalving: boolean
  retreatCount: number
  surgeRiskCount: number
}

export interface IceFormation {
  file: string
  iceDensity: number
  carvingPower: number
  moraineStability: number
  crevasseSafety: number
  iceAgeDepth: number
  glacierAdvance: number
  density: DensityMeasure
  carving: CarvingMeasure
  moraine: MoraineMeasure
  crevasse: CrevasseMeasure
  age: AgeMeasure
  advance: AdvanceMeasure
  condition: 'polar-cap' | 'alpine-glacier' | 'valley-glacier' | 'piedmont' | 'ice-shelf' | 'puddle'
  qualityScore: number
}

export interface GlacierSystem {
  directory: string
  formations: IceFormation[]
  avgDensity: number
  avgPower: number
  avgStability: number
  polarCapCount: number
  puddleCount: number
  denseCount: number
  safeCount: number
  systemType: 'ice-sheet' | 'ice-cap' | 'ice-field' | 'glacier-complex' | 'ice-stream' | 'permafrost'
  condition: 'polar-stronghold' | 'mountain-fortress' | 'valley-carver' | 'foothills' | 'moraine-field' | 'desert'
}

export interface GlacierCarveResult {
  formations: IceFormation[]
  systems: GlacierSystem[]
  icefield: {
    avgDensity: number
    avgPower: number
    avgStability: number
    isAdvancing: boolean
    overallPower: number
  }
  stats: {
    totalFiles: number
    totalSystems: number
    avgIceDensity: number
    avgCarvingPower: number
    avgMoraineStability: number
    avgCrevasseSafety: number
    avgIceAgeDepth: number
    avgGlacierAdvance: number
    polarCapCount: number
    alpineGlacierCount: number
    valleyGlacierCount: number
    piedmontCount: number
    iceShelfCount: number
    puddleCount: number
    isDenseCount: number
    hasDeepImpactCount: number
    isStableCount: number
    isSafeCount: number
    isMatureCount: number
    isAdvancingCount: number
    overallPower: number
    glaciologistGrade: 'pioneer-glaciologist' | 'senior-glaciologist' | 'glaciologist' | 'researcher' | 'student' | 'tourist'
    bestFormation: string
    densest: string
    mostPowerful: string
    mostStable: string
    safest: string
    mostMature: string
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

/** @example countReexports("export { x } from 'y'") returns count */
export function countReexports(content: string): number {
  return (content.match(REEXPORT_REGEX) ?? []).length
}

/** @example countDynamicImports("import('x')") returns count */
export function countDynamicImports(content: string): number {
  return (content.match(DYNAMIC_IMPORT_REGEX) ?? []).length
}

/** @example countDefaultExports('export default') returns count */
export function countDefaultExports(content: string): number {
  return (content.match(DEFAULT_EXPORT_REGEX) ?? []).length
}

/** @example countNamespaces('namespace X') returns count */
export function countNamespaces(content: string): number {
  return (content.match(NAMESPACE_REGEX) ?? []).length
}

/** @example countAbstracts('abstract class') returns count */
export function countAbstracts(content: string): number {
  return (content.match(ABSTRACT_REGEX) ?? []).length
}

/** @example countDecorators('@Injectable') returns count */
export function countDecorators(content: string): number {
  return (content.match(DECORATOR_REGEX) ?? []).length
}

/** @example countAsserts('assert') returns count */
export function countAsserts(content: string): number {
  return (content.match(ASSERT_REGEX) ?? []).length
}

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureDensity(content) returns DensityMeasure */
export function measureDensity(content: string): DensityMeasure {
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const deepNested = countDeepNested(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const enums = countEnums(content)
  const classes = countClasses(content)
  const jsdoc = countJSDoc(content)
  const accessMods = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)

  const airBubbleCount = consoleCount + todos
  const fractureZoneCount = deepNested
  const hasNoAirBubbles = airBubbleCount === 0
  const hasNoFractureZones = fractureZoneCount === 0
  const hasHighCompression = exports > 0 && imports > 0 && (interfaces > 0 || types > 0)
  const hasProperCrystal = classes > 0 && (interfaces > 0 || enums > 0)
  const hasNoMeltwater = anyCount === 0
  const hasGlacialFlow = exports > 0 && imports > 0
  const hasPressureRecrystallization = jsdoc > 0 && hasNoMeltwater
  const hasStratification = readonlyCount > 0 || accessMods > 0
  const hasNoIceLenses = commentedCode === 0
  const isDense = hasHighCompression && hasNoMeltwater && hasNoFractureZones

  let level = 0
  if (hasNoAirBubbles) level += 15
  if (hasNoFractureZones) level += 15
  if (hasHighCompression) level += 10
  if (hasProperCrystal) level += 10
  if (hasNoMeltwater) level += 10
  if (hasGlacialFlow) level += 10
  if (hasPressureRecrystallization) level += 10
  if (hasStratification) level += 10
  if (hasNoIceLenses) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let type: DensityMeasure['type'] = 'slush'
  if (level >= 80) type = 'blue-ice'
  else if (level >= 65) type = 'compact-ice'
  else if (level >= 50) type = 'firn'
  else if (level >= 35) type = 'granular'
  else if (level >= 20) type = 'snow-pack'

  return {
    airBubbleCount,
    fractureZoneCount,
    hasGlacialFlow,
    hasHighCompression,
    hasNoAirBubbles,
    hasNoFractureZones,
    hasNoIceLenses,
    hasNoMeltwater,
    hasPressureRecrystallization,
    hasProperCrystal,
    hasStratification,
    isDense,
    level,
    type,
  }
}

/** @example measureCarving(content) returns CarvingMeasure */
export function measureCarving(content: string): CarvingMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const functions = countFunctions(content)
  const arrows = countArrows(content)
  const asyncCount = countAsync(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const defaults = countDefaultExports(content)

  const avalancheCount = deepNested
  const rockfallCount = anyCount + consoleCount
  const hasNoAvalanche = avalancheCount === 0
  const hasNoRockfall = rockfallCount === 0
  const hasDeepImpact = classes > 0 && (interfaces > 0 || types > 0)
  const hasUShapeValley = exports > 0 && imports > 0
  const hasHangingValleys = functions > 0 && arrows > 0
  const hasCirqueBasin = interfaces > 0 && types > 0
  const hasArrete = exports > 2
  const hasHorn = classes > 0 && functions > 0
  const hasNoOutburstFlood = anyCount === 0
  const hasSteadyAdvance = asyncCount > 0

  let power = 0
  if (hasDeepImpact) power += 15
  if (hasUShapeValley) power += 15
  if (hasHangingValleys) power += 10
  if (hasCirqueBasin) power += 10
  if (hasArrete) power += 10
  if (hasHorn) power += 10
  if (hasNoAvalanche) power += 10
  if (hasNoRockfall) power += 10
  if (hasNoOutburstFlood) power += 5
  if (hasSteadyAdvance) power += 5
  power = Math.min(power, 100)
  power = Math.max(power, 0)

  let style: CarvingMeasure['style'] = 'no-carving'
  if (hasDeepImpact && hasCirqueBasin) style = 'fjord'
  else if (hasDeepImpact && hasHangingValleys) style = 'u-shaped'
  else if (hasCirqueBasin) style = 'cirque'
  else if (hasHangingValleys) style = 'hanging'
  else if (hasUShapeValley) style = 'rock-basin'

  return {
    avalancheCount,
    hasArrete,
    hasCirqueBasin,
    hasDeepImpact,
    hasHangingValleys,
    hasHorn,
    hasNoAvalanche,
    hasNoOutburstFlood,
    hasNoRockfall,
    hasSteadyAdvance,
    hasUShapeValley,
    power,
    rockfallCount,
    style,
  }
}

/** @example measureMoraine(content) returns MoraineMeasure */
export function measureMoraine(content: string): MoraineMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const enums = countEnums(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const todos = countTodos(content)
  const accessMods = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)
  const defaults = countDefaultExports(content)

  const debrisCount = anyCount + commentedCode + todos
  const deadIceCount = commentedCode
  const hasNoUnstableDebris = debrisCount === 0
  const hasNoDeadIce = deadIceCount === 0
  const hasProperDeposition = exports > 0 && imports > 0
  const hasSortedMaterial = interfaces > 0 && types > 0
  const hasErraticBoulders = classes > 0 && (accessMods > 0 || readonlyCount > 0)
  const hasProperDrumlin = enums > 0
  const hasEsker = defaults > 0
  const hasKame = exports > 2
  const hasNoKettle = todos === 0
  const isStable = hasNoUnstableDebris && hasProperDeposition && hasNoDeadIce

  let stability = 0
  if (hasNoUnstableDebris) stability += 15
  if (hasProperDeposition) stability += 15
  if (hasSortedMaterial) stability += 10
  if (hasNoDeadIce) stability += 10
  if (hasErraticBoulders) stability += 10
  if (hasProperDrumlin) stability += 10
  if (hasEsker) stability += 10
  if (hasKame) stability += 10
  if (hasNoKettle) stability += 10
  stability = Math.min(stability, 100)
  stability = Math.max(stability, 0)

  let type: MoraineMeasure['type'] = 'none'
  if (stability >= 80 && hasErraticBoulders) type = 'terminal'
  else if (stability >= 65 && hasSortedMaterial) type = 'lateral'
  else if (stability >= 50) type = 'medial'
  else if (stability >= 35) type = 'ground'
  else if (stability >= 20) type = 'recessional'

  return {
    debrisCount,
    deadIceCount,
    hasEsker,
    hasErraticBoulders,
    hasKame,
    hasNoDeadIce,
    hasNoKettle,
    hasNoUnstableDebris,
    hasProperDeposition,
    hasProperDrumlin,
    hasSortedMaterial,
    isStable,
    stability,
    type,
  }
}

/** @example measureCrevasse(content) returns CrevasseMeasure */
export function measureCrevasse(content: string): CrevasseMeasure {
  const tryCatch = countTryCatch(content)
  const catches = countCatches(content)
  const finallys = countFinallys(content)
  const throws = countThrows(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const asyncCount = countAsync(content)
  const errors = countErrors(content)

  const hiddenCrevasseCount = deepNested
  const icefallCount = anyCount + consoleCount
  const hasNoHiddenCrevasses = hiddenCrevasseCount === 0
  const hasNoIcefall = icefallCount === 0
  const hasProperBridging = tryCatch > 0
  const hasSnowBridge = finallys > 0
  const hasProperRoping = catches > 0 || throws > 0
  const hasNoSeracCollapse = deepNested === 0
  const hasRescuePlan = errors > 0 || throws > 0
  const hasNoBergschrund = tryCatch > 0 || asyncCount === 0
  const hasAnchorPoints = catches > 0
  const isSafe = hasNoHiddenCrevasses && hasNoIcefall && hasProperBridging

  let safety = 0
  if (hasProperBridging) safety += 15
  if (hasNoHiddenCrevasses) safety += 15
  if (hasSnowBridge) safety += 10
  if (hasProperRoping) safety += 10
  if (hasNoSeracCollapse) safety += 10
  if (hasNoIcefall) safety += 10
  if (hasRescuePlan) safety += 10
  if (hasNoBergschrund) safety += 10
  if (hasAnchorPoints) safety += 10
  safety = Math.min(safety, 100)
  safety = Math.max(safety, 0)

  let depth: CrevasseMeasure['depth'] = 'bottomless'
  if (safety >= 80) depth = 'surface'
  else if (safety >= 65) depth = 'shallow'
  else if (safety >= 50) depth = 'deep'
  else if (safety >= 35) depth = 'bergschrund'
  else if (safety >= 20) depth = 'moulins'

  return {
    depth,
    hasAnchorPoints,
    hasNoBergschrund,
    hasNoHiddenCrevasses,
    hasNoIcefall,
    hasNoSeracCollapse,
    hasProperBridging,
    hasProperRoping,
    hasRescuePlan,
    hasSnowBridge,
    hiddenCrevasseCount,
    icefallCount,
    isSafe,
    safety,
  }
}

/** @example measureAge(content) returns AgeMeasure */
export function measureAge(content: string): AgeMeasure {
  const jsdoc = countJSDoc(content)
  const blockComments = countBlockComments(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const generics = countGenerics(content)
  const abstracts = countAbstracts(content)
  const decorators = countDecorators(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const staticCount = countStatic(content)

  const fossilCount = anyCount + commentedCode
  const stagnationCount = commentedCode
  const hasIceCore = classes > 0 && (interfaces > 0 || types > 0)
  const hasDustLayers = jsdoc > 0 || blockComments > 0
  const hasVolcanicAsh = decorators > 0 || abstracts > 0
  const hasOxygenIsotopes = generics > 0
  const hasNoPermafrost = anyCount === 0
  const hasProperThaw = exports > 0 && imports > 0
  const hasNoFossilIce = commentedCode === 0
  const hasCalving = staticCount > 0
  const hasNoStagnation = commentedCode === 0
  const isMature = hasIceCore && hasDustLayers && hasNoPermafrost && hasNoFossilIce

  let depth_val = 0
  if (hasIceCore) depth_val += 15
  if (hasDustLayers) depth_val += 15
  if (hasVolcanicAsh) depth_val += 10
  if (hasOxygenIsotopes) depth_val += 10
  if (hasNoPermafrost) depth_val += 10
  if (hasProperThaw) depth_val += 10
  if (hasNoFossilIce) depth_val += 10
  if (hasCalving) depth_val += 10
  if (hasNoStagnation) depth_val += 10
  depth_val = Math.min(depth_val, 100)
  depth_val = Math.max(depth_val, 0)

  let era: AgeMeasure['era'] = 'permafrost'
  if (depth_val >= 80) era = 'pleistocene'
  else if (depth_val >= 65) era = 'pliocene'
  else if (depth_val >= 50) era = 'miocene'
  else if (depth_val >= 35) era = 'oligocene'
  else if (depth_val >= 20) era = 'recent'

  return {
    depth: depth_val,
    era,
    fossilCount,
    hasCalving,
    hasDustLayers,
    hasIceCore,
    hasNoFossilIce,
    hasNoPermafrost,
    hasNoStagnation,
    hasOxygenIsotopes,
    hasProperThaw,
    hasVolcanicAsh,
    isMature,
    stagnationCount,
  }
}

/** @example measureAdvance(content) returns AdvanceMeasure */
export function measureAdvance(content: string): AdvanceMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const functions = countFunctions(content)
  const arrows = countArrows(content)
  const classes = countClasses(content)

  const retreatCount = todos + consoleCount
  const surgeRiskCount = anyCount
  const hasProperAccumulation = exports > 0 && imports > 0
  const hasAblationControl = anyCount === 0 && consoleCount === 0
  const hasEquilibrium = functions > 0 && (arrows > 0 || classes > 0)
  const hasMassBalance = exports > 0 && imports > 0 && anyCount === 0
  const hasNoRapidRetreat = todos === 0
  const hasNoSurgeRisk = anyCount === 0
  const hasTidewater = asyncCount > 0
  const hasIceStream = functions > 0 && arrows > 0
  const hasNoCalving = consoleCount === 0
  const isAdvancing = hasProperAccumulation && hasNoRapidRetreat && hasNoSurgeRisk

  let rate = 0
  if (hasProperAccumulation) rate += 15
  if (hasAblationControl) rate += 15
  if (hasEquilibrium) rate += 10
  if (hasMassBalance) rate += 10
  if (hasNoRapidRetreat) rate += 10
  if (hasNoSurgeRisk) rate += 10
  if (hasTidewater) rate += 10
  if (hasIceStream) rate += 10
  if (hasNoCalving) rate += 10
  rate = Math.min(rate, 100)
  rate = Math.max(rate, 0)

  let status: AdvanceMeasure['status'] = 'vanished'
  if (isAdvancing && rate >= 65) status = 'advancing'
  else if (rate >= 60 && hasEquilibrium) status = 'stable'
  else if (rate >= 35) status = 'retreating'
  else if (rate >= 50 && exports > 3) status = 'surging'
  else if (rate >= 20) status = 'stagnating'

  return {
    hasAblationControl,
    hasEquilibrium,
    hasIceStream,
    hasMassBalance,
    hasNoCalving,
    hasNoRapidRetreat,
    hasNoSurgeRisk,
    hasProperAccumulation,
    hasTidewater,
    isAdvancing,
    rate,
    retreatCount,
    status,
    surgeRiskCount,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): IceFormation['condition'] {
  if (score >= 80) return 'polar-cap'
  if (score >= 65) return 'alpine-glacier'
  if (score >= 50) return 'valley-glacier'
  if (score >= 35) return 'piedmont'
  if (score >= 20) return 'ice-shelf'
  return 'puddle'
}

/** @example classifySystemType(formations) returns system type */
export function classifySystemType(formations: IceFormation[]): GlacierSystem['systemType'] {
  if (formations.length === 0) return 'permafrost'
  const avgQuality = formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length
  const polarCount = formations.filter((f) => f.condition === 'polar-cap').length
  if (avgQuality >= 75 && polarCount >= Math.ceil(formations.length * 0.3)) return 'ice-sheet'
  if (avgQuality >= 60) return 'ice-cap'
  if (avgQuality >= 45) return 'ice-field'
  if (avgQuality >= 30) return 'glacier-complex'
  if (avgQuality >= 15) return 'ice-stream'
  return 'permafrost'
}

/** @example classifySystemCondition(avgQuality) returns condition */
export function classifySystemCondition(avgQuality: number): GlacierSystem['condition'] {
  if (avgQuality >= 80) return 'polar-stronghold'
  if (avgQuality >= 65) return 'mountain-fortress'
  if (avgQuality >= 50) return 'valley-carver'
  if (avgQuality >= 35) return 'foothills'
  if (avgQuality >= 20) return 'moraine-field'
  return 'desert'
}

/** @example classifyGlaciologistGrade(avgPower) returns grade */
export function classifyGlaciologistGrade(avgPower: number): GlacierCarveResult['stats']['glaciologistGrade'] {
  if (avgPower >= 80) return 'pioneer-glaciologist'
  if (avgPower >= 65) return 'senior-glaciologist'
  if (avgPower >= 50) return 'glaciologist'
  if (avgPower >= 35) return 'researcher'
  if (avgPower >= 20) return 'student'
  return 'tourist'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeIceFormation(content, filePath) returns IceFormation */
export function analyzeIceFormation(content: string, filePath: string): IceFormation {
  const density = measureDensity(content)
  const carving = measureCarving(content)
  const moraine = measureMoraine(content)
  const crevasse = measureCrevasse(content)
  const age = measureAge(content)
  const advance = measureAdvance(content)

  const qualityScore = Math.round(
    density.level * 0.2 + carving.power * 0.2 + moraine.stability * 0.15 +
    crevasse.safety * 0.15 + age.depth * 0.15 + advance.rate * 0.15,
  )

  return {
    advance,
    age,
    carving,
    carvingPower: carving.power,
    condition: classifyCondition(qualityScore),
    crevasse,
    crevasseSafety: crevasse.safety,
    density,
    file: filePath,
    glacierAdvance: advance.rate,
    iceAgeDepth: age.depth,
    iceDensity: density.level,
    moraine,
    moraineStability: moraine.stability,
    qualityScore,
  }
}

/** @example analyzeGlacierSystem(formations, dirPath) returns GlacierSystem */
export function analyzeGlacierSystem(formations: IceFormation[], dirPath: string): GlacierSystem {
  const avgDensity = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.iceDensity, 0) / formations.length) : 0
  const avgPower = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.carvingPower, 0) / formations.length) : 0
  const avgStability = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.moraineStability, 0) / formations.length) : 0
  const polarCapCount = formations.filter((f) => f.condition === 'polar-cap').length
  const puddleCount = formations.filter((f) => f.condition === 'puddle').length
  const denseCount = formations.filter((f) => f.density.isDense).length
  const safeCount = formations.filter((f) => f.crevasse.isSafe).length
  const systemType = classifySystemType(formations)
  const avgQuality = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length) : 0
  const condition = classifySystemCondition(avgQuality)

  return {
    avgDensity,
    avgPower,
    avgStability,
    condition,
    denseCount,
    directory: dirPath,
    formations,
    polarCapCount,
    puddleCount,
    safeCount,
    systemType,
  }
}

/** @example generateRecommendations(formations, systems, icefield, stats) returns string[] */
export function generateRecommendations(
  formations: IceFormation[],
  _systems: GlacierSystem[],
  icefield: GlacierCarveResult['icefield'],
  _stats: GlacierCarveResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (icefield.overallPower < 50) {
    recommendations.push('Glacial power is low — increase code density and structural integrity')
  }

  const weakFormations = formations.filter((f) => f.carvingPower < 50)
  if (weakFormations.length > 0) {
    recommendations.push(`${weakFormations.length} formation(s) have weak carving power — add abstractions, classes, and type safety`)
  }

  const unsafeFormations = formations.filter((f) => !f.crevasse.isSafe)
  if (unsafeFormations.length > 0) {
    recommendations.push(`${unsafeFormations.length} formation(s) have crevasse hazards — add error handling and reduce nesting`)
  }

  const puddleFormations = formations.filter((f) => f.condition === 'puddle')
  if (puddleFormations.length > 0) {
    recommendations.push(`${puddleFormations.length} formation(s) are puddles — consider complete refactoring`)
  }

  const retreatingFormations = formations.filter((f) => !f.advance.isAdvancing)
  if (retreatingFormations.length > 0) {
    recommendations.push(`${retreatingFormations.length} formation(s) are retreating — remove technical debt and console usage`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Glacial formations are powerful and advancing — maintain current carving standards')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildGlacierCarveResult(files, contents, options) returns GlacierCarveResult */
export function buildGlacierCarveResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): GlacierCarveResult {
  const formations: IceFormation[] = files.map((file, i) =>
    analyzeIceFormation(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, IceFormation[]>()
  for (const formation of formations) {
    const dir = formation.file.includes('/') ? formation.file.substring(0, formation.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(formation)
    } else {
      dirMap.set(dir, [formation])
    }
  }

  const systems: GlacierSystem[] = Array.from(dirMap.entries()).map(([dir, dirFormations]) =>
    analyzeGlacierSystem(dirFormations, dir),
  )

  const avgIceDensity = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.iceDensity, 0) / formations.length) : 0
  const avgCarvingPower = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.carvingPower, 0) / formations.length) : 0
  const avgMoraineStability = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.moraineStability, 0) / formations.length) : 0
  const avgCrevasseSafety = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.crevasseSafety, 0) / formations.length) : 0
  const avgIceAgeDepth = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.iceAgeDepth, 0) / formations.length) : 0
  const avgGlacierAdvance = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.glacierAdvance, 0) / formations.length) : 0
  const overallPower = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length) : 0

  const icefield = {
    avgDensity: avgIceDensity,
    avgPower: avgCarvingPower,
    avgStability: avgMoraineStability,
    isAdvancing: overallPower >= 50,
    overallPower,
  }

  const polarCapCount = formations.filter((f) => f.condition === 'polar-cap').length
  const alpineGlacierCount = formations.filter((f) => f.condition === 'alpine-glacier').length
  const valleyGlacierCount = formations.filter((f) => f.condition === 'valley-glacier').length
  const piedmontCount = formations.filter((f) => f.condition === 'piedmont').length
  const iceShelfCount = formations.filter((f) => f.condition === 'ice-shelf').length
  const puddleCount = formations.filter((f) => f.condition === 'puddle').length
  const isDenseCount = formations.filter((f) => f.density.isDense).length
  const hasDeepImpactCount = formations.filter((f) => f.carving.hasDeepImpact).length
  const isStableCount = formations.filter((f) => f.moraine.isStable).length
  const isSafeCount = formations.filter((f) => f.crevasse.isSafe).length
  const isMatureCount = formations.filter((f) => f.age.isMature).length
  const isAdvancingCount = formations.filter((f) => f.advance.isAdvancing).length

  const glaciologistGrade = classifyGlaciologistGrade(overallPower)

  const bestFormation = formations.length > 0
    ? formations.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const densest = formations.length > 0
    ? formations.reduce((best, f) => f.iceDensity > best.iceDensity ? f : best).file : ''
  const mostPowerful = formations.length > 0
    ? formations.reduce((best, f) => f.carvingPower > best.carvingPower ? f : best).file : ''
  const mostStable = formations.length > 0
    ? formations.reduce((best, f) => f.moraineStability > best.moraineStability ? f : best).file : ''
  const safest = formations.length > 0
    ? formations.reduce((best, f) => f.crevasseSafety > best.crevasseSafety ? f : best).file : ''
  const mostMature = formations.length > 0
    ? formations.reduce((best, f) => f.iceAgeDepth > best.iceAgeDepth ? f : best).file : ''

  const stats = {
    alpineGlacierCount,
    avgCarvingPower,
    avgCrevasseSafety,
    avgGlacierAdvance,
    avgIceAgeDepth,
    avgIceDensity,
    avgMoraineStability,
    bestFormation,
    densest,
    glaciologistGrade,
    hasDeepImpactCount,
    iceShelfCount,
    isAdvancingCount,
    isDenseCount,
    isMatureCount,
    isSafeCount,
    isStableCount,
    mostMature,
    mostPowerful,
    mostStable,
    overallPower,
    piedmontCount,
    polarCapCount,
    puddleCount,
    safest,
    totalFiles: files.length,
    totalSystems: systems.length,
    valleyGlacierCount,
  }

  const recommendations = generateRecommendations(formations, systems, icefield, stats)

  return { formations, icefield, recommendations, stats, systems }
}
