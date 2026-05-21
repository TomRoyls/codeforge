// ─── Interfaces ────────────────────────────────────────────────────────────

export interface IceMeasure {
  density: number
  type: 'blue-ice' | 'clear-ice' | 'white-ice' | 'firn' | 'slush' | 'dirty-ice'
  isPure: boolean
  hasNoBubbles: boolean
  hasNoDebris: boolean
  hasCrystalStructure: boolean
  hasProperStratification: boolean
  hasPressureMelting: boolean
  hasInternalDeformation: boolean
  hasNoCracking: boolean
  isCompact: boolean
  bubbleCount: number
  debrisCount: number
}

export interface FlowMeasure {
  rate: number
  state: 'advancing' | 'stable' | 'retreating' | 'surging' | 'stagnant' | 'calving'
  isHealthy: boolean
  hasBasalSlip: boolean
  hasInternalFlow: boolean
  hasCreepFlow: boolean
  hasSurgeBehavior: boolean
  hasCalving: boolean
  hasSteadyAdvance: boolean
  hasRetreat: boolean
  hasOgives: boolean
  hasIceStreams: boolean
  surgeCount: number
  retreatCount: number
}

export interface CrevasseMeasure {
  depth: number
  type: 'crevasse' | 'moulin' | 'ice-fall' | 'serac' | 'snow-bridge' | 'none'
  hasNoCrevasses: boolean
  hasSurfaceCracks: boolean
  hasDeepCrevasses: boolean
  hasHiddenCrevasses: boolean
  hasBergschrund: boolean
  hasMarginalCrevasses: boolean
  hasTransverseCrevasses: boolean
  hasLongitudinalCrevasses: boolean
  hasSnowBridge: boolean
  hasRescue: boolean
  crevasseCount: number
  snowBridgeCount: number
}

export interface MoraineMeasure {
  quality: number
  type: 'lateral' | 'medial' | 'terminal' | 'ground' | 'recessional' | 'push'
  isWellSorted: boolean
  hasHistoricalValue: boolean
  hasErratic: boolean
  hasDrumlin: boolean
  hasEsker: boolean
  hasKettle: boolean
  hasOutwash: boolean
  hasTill: boolean
  hasSortedDeposit: boolean
  erraticCount: number
  kettleCount: number
}

export interface AccumulationMeasure {
  zone: number
  rate: 'heavy-snowfall' | 'steady-accumulation' | 'light-snow' | 'drought' | 'rain' | 'sublimation'
  isHealthy: boolean
  hasFreshSnow: boolean
  hasFirnLine: boolean
  hasSnowPit: boolean
  hasIceCore: boolean
  hasDensityIncrease: boolean
  hasLayerPreservation: boolean
  hasWindSlab: boolean
  hasAvalancheRisk: boolean
  hasSnowBridge: boolean
  avalancheRiskCount: number
}

export interface AblationMeasure {
  zone: number
  method: 'calving' | 'melting' | 'sublimation' | 'evaporation' | 'wind-erosion' | 'none'
  isBalanced: boolean
  hasCleanMelting: boolean
  hasCalving: boolean
  hasSublimation: boolean
  hasIceMargin: boolean
  hasMeltwater: boolean
  hasProglacial: boolean
  hasDeadIce: boolean
  hasOutwash: boolean
  hasMassBalance: boolean
  deadIceCount: number
}

export interface GlacierReading {
  file: string
  iceDensity: number
  flowRate: number
  crevasseDepth: number
  moraineQuality: number
  accumulationZone: number
  ablationZone: number
  ice: IceMeasure
  flow: FlowMeasure
  crevasse: CrevasseMeasure
  moraine: MoraineMeasure
  accumulation: AccumulationMeasure
  ablation: AblationMeasure
  condition: 'crystal-glacier' | 'healthy-glacier' | 'stable-icefield' | 'retreating-glacier' | 'dirty-ice' | 'rock-glacier'
  qualityScore: number
}

export interface IceField {
  directory: string
  readings: GlacierReading[]
  avgIceDensity: number
  avgFlowRate: number
  avgMoraineQuality: number
  crystalGlacierCount: number
  rockGlacierCount: number
  healthyCount: number
  balancedCount: number
  fieldType: 'ice-cap' | 'ice-sheet' | 'valley-glacier' | 'piedmont' | 'cirque' | 'snow-patch'
  condition: 'polar-ice-sheet' | 'alpine-glacier' | 'valley-glacier' | 'rock-glacier' | 'permafrost' | 'mud-slide'
}

export interface GlacierFieldStats {
  totalFiles: number
  totalFields: number
  avgIceDensity: number
  avgFlowRate: number
  avgCrevasseDepth: number
  avgMoraineQuality: number
  avgAccumulationZone: number
  avgAblationZone: number
  crystalGlacierCount: number
  healthyGlacierCount: number
  stableIcefieldCount: number
  retreatingGlacierCount: number
  dirtyIceCount: number
  rockGlacierCount: number
  isPureCount: number
  hasNoDebrisCount: number
  isHealthyCount: number
  hasSurgeBehaviorCount: number
  hasRetreatCount: number
  hasNoCrevassesCount: number
  hasHiddenCrevassesCount: number
  hasSnowBridgeCount: number
  isWellSortedCount: number
  hasDeadIceCount: number
  isBalancedCount: number
  hasMassBalanceCount: number
  overallGlacierHealth: number
  glaciologistGrade: 'chief-glaciologist' | 'senior-glaciologist' | 'glaciologist' | 'geologist' | 'hiker' | 'snowman'
  bestReading: string
  densestIce: string
  healthiestFlow: string
  shallowestCrevasses: string
  bestMoraine: string
}

export interface GlacierFieldResult {
  readings: GlacierReading[]
  fields: IceField[]
  survey: {
    avgIceDensity: number
    avgFlowRate: number
    avgMoraineQuality: number
    isAdvancing: boolean
    overallGlacierHealth: number
  }
  stats: GlacierFieldStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────────────

const TODO_REGEX = /TODO/gi
const FIXME_REGEX = /FIXME/gi
const HACK_REGEX = /HACK/gi
const DEPRECATED_REGEX = /@deprecated/g
const CONSOLE_REGEX = /console\.\w+/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /\/\/\s*@ts-ignore/g
const TS_EXPECT_ERROR_REGEX = /\/\/\s*@ts-expect-error/g
const FUNCTION_REGEX = /\bfunction\b/g
const ARROW_REGEX = /=>\s*{/g
const CLASS_REGEX = /\bclass\b/g
const INTERFACE_REGEX = /\binterface\b/g
const TYPE_REGEX = /\btype\s+\w+\s*=/g
const EXPORT_REGEX = /\bexport\b/g
const IMPORT_REGEX = /\bimport\b/g
const ASYNC_REGEX = /\basync\b/g
const TRY_REGEX = /\btry\s*{/g
const CATCH_REGEX = /\bcatch\s*\(/g
const FINALLY_REGEX = /\bfinally\s*{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const RETURN_REGEX = /\breturn\b/g
const THROW_REGEX = /\bthrow\b/g
const TYPE_ANNOTATION_REGEX = /:\s*(?:string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const LINE_COMMENT_REGEX = /\/\/.*$/gm
const TEST_REGEX = /\b(?:describe|it|test|expect)\b/g
const EMPTY_LINE_REGEX = /^\s*$/gm

// ─── Counting Helpers ──────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

function countEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length === 0).length
}

function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX) + countMatches(content, ARROW_REGEX)
}

function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX) + countMatches(content, SWITCH_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_REGEX) + countMatches(content, CATCH_REGEX) + countMatches(content, FINALLY_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countComments(content: string): number {
  return countMatches(content, JSDOC_REGEX) + countMatches(content, LINE_COMMENT_REGEX)
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX) + countMatches(content, FIXME_REGEX) + countMatches(content, HACK_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX) + countMatches(content, TS_EXPECT_ERROR_REGEX)
}

// ─── Measure Ice ───────────────────────────────────────────────────────────

/** @example measureIce('export function foo(): void {}') returns IceMeasure */
export function measureIce(content: string): IceMeasure {
  const lines = countNonEmptyLines(content)
  const emptyLines = countEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)
  const todos = countTodos(content)
  const smells = countSmells(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const comments = countComments(content)

  const totalDeclarations = funcs + classes + interfaces + typeAliases
  const hasDeclarations = totalDeclarations > 0
  const hasTyped = typeAnnotations > 0
  const hasExports = exports > 0

  // Density: dense code has many declarations per line, typed, no gaps
  const baseDensity = lines === 0 ? 10 : Math.min(50, totalDeclarations * 8 + lines * 2)
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const exportBonus = Math.min(10, exports * 3)
  const gapPenalty = Math.min(15, emptyLines * 2)
  const smellPenalty = Math.min(20, (smells + todos) * 5)
  const density = Math.max(0, Math.min(100, baseDensity + typeBonus + exportBonus - gapPenalty - smellPenalty))

  const isPure = density >= 65 && smells === 0
  const hasNoBubbles = totalDeclarations <= lines || lines === 0
  const hasNoDebris = todos === 0 && deprecated === 0
  const hasCrystalStructure = hasTyped && hasDeclarations
  const hasProperStratification = classes > 0 && interfaces > 0
  const hasPressureMelting = countErrorHandling(content) > 0
  const hasInternalDeformation = comments > 0 && hasDeclarations
  const hasNoCracking = smells === 0
  const isCompact = emptyLines <= lines * 0.3 && lines > 0
  const bubbleCount = Math.max(0, emptyLines - Math.floor(lines * 0.2))
  const debrisCount = todos + deprecated

  let type: IceMeasure['type']
  if (density >= 80 && hasTyped && hasExports) {
    type = 'blue-ice'
  } else if (density >= 65 && hasTyped) {
    type = 'clear-ice'
  } else if (density >= 50 && hasDeclarations) {
    type = 'white-ice'
  } else if (density >= 35) {
    type = 'firn'
  } else if (density >= 20) {
    type = 'slush'
  } else {
    type = 'dirty-ice'
  }

  return {
    density,
    type,
    isPure,
    hasNoBubbles,
    hasNoDebris,
    hasCrystalStructure,
    hasProperStratification,
    hasPressureMelting,
    hasInternalDeformation,
    hasNoCracking,
    isCompact,
    bubbleCount,
    debrisCount,
  }
}

// ─── Measure Flow ──────────────────────────────────────────────────────────

/** @example measureFlow('export async function process(): Promise<void> {}') returns FlowMeasure */
export function measureFlow(content: string): FlowMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const exports = countExports(content)
  const imports = countImports(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const returns = countMatches(content, RETURN_REGEX)
  const throws = countMatches(content, THROW_REGEX)
  const errorHandling = countErrorHandling(content)
  const comments = countComments(content)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)

  const complexity = conditionals + loops
  const hasCode = funcs > 0 || lines > 0

  const baseRate = lines === 0 ? 10 : Math.min(40, funcs * 8 + lines)
  const asyncBonus = Math.min(15, asyncs * 5)
  const exportBonus = Math.min(15, exports * 5)
  const flowBonus = Math.min(10, (returns + throws) * 3)
  const complexityBonus = Math.min(10, complexity * 2)
  const smellPenalty = Math.min(20, (smells + todos) * 5)
  const rate = Math.max(0, Math.min(100, baseRate + asyncBonus + exportBonus + flowBonus + complexityBonus - smellPenalty))

  const isHealthy = rate >= 40 && rate <= 80
  const hasBasalSlip = asyncs > 0
  const hasInternalFlow = funcs > 0 && (classes > 0 || interfaces > 0)
  const hasCreepFlow = comments > 0 && funcs > 0
  const hasSurgeBehavior = complexity > 10
  const hasCalving = exports > 0 && throws > 0
  const hasSteadyAdvance = exports > 0 && imports > 0
  const hasRetreat = lines > 0 && exports === 0 && funcs === 0
  const hasOgives = loops > 0
  const hasIceStreams = asyncs > 0 && exports > 0
  const surgeCount = Math.max(0, complexity - 8)
  const retreatCount = hasRetreat ? 1 : 0

  let state: FlowMeasure['state']
  if (rate >= 75 && complexity > 5) {
    state = 'surging'
  } else if (rate >= 55 && exports > 0) {
    state = 'advancing'
  } else if (rate >= 40) {
    state = 'stable'
  } else if (rate >= 25 && hasCode) {
    state = 'retreating'
  } else if (rate >= 15) {
    state = 'stagnant'
  } else {
    state = 'calving'
  }

  return {
    rate,
    state,
    isHealthy,
    hasBasalSlip,
    hasInternalFlow,
    hasCreepFlow,
    hasSurgeBehavior,
    hasCalving,
    hasSteadyAdvance,
    hasRetreat,
    hasOgives,
    hasIceStreams,
    surgeCount,
    retreatCount,
  }
}

// ─── Measure Crevasse ──────────────────────────────────────────────────────

/** @example measureCrevasse('export function safe(): void { try {} catch(e) {} }') returns CrevasseMeasure */
export function measureCrevasse(content: string): CrevasseMeasure {
  const lines = countNonEmptyLines(content)
  const errorHandling = countErrorHandling(content)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const conditionals = countConditionals(content)
  const returns = countMatches(content, RETURN_REGEX)
  const funcs = countFunctions(content)
  const tests = countMatches(content, TEST_REGEX)
  const loops = countLoops(content)
  const hasCode = funcs > 0 || lines > 0

  // Depth: deep bugs = many smells, no error handling, untested
  const smellScore = Math.min(40, (smells + todos) * 8)
  const untestedPenalty = hasCode && tests === 0 ? 15 : 0
  const noErrorPenalty = hasCode && errorHandling === 0 ? 15 : 0
  const complexityPenalty = Math.min(20, conditionals * 3)
  const errorBonus = Math.min(30, errorHandling * 10)
  const depth = Math.max(0, Math.min(100, 10 + smellScore + untestedPenalty + noErrorPenalty + complexityPenalty - errorBonus))

  const hasNoCrevasses = depth <= 20
  const hasSurfaceCracks = todos > 0 || smells > 0
  const hasDeepCrevasses = depth >= 50
  const hasHiddenCrevasses = hasCode && tests === 0
  const hasBergschrund = lines > 5 && errorHandling === 0
  const hasMarginalCrevasses = conditionals > 3
  const hasTransverseCrevasses = conditionals > 0 && loops > 0
  const hasLongitudinalCrevasses = conditionals > 0 && returns === 0
  const hasSnowBridge = errorHandling > 0
  const hasRescue = errorHandling > 0 && funcs > 0
  const crevasseCount = smells + todos
  const snowBridgeCount = errorHandling

  let type: CrevasseMeasure['type']
  if (depth <= 20) {
    type = 'none'
  } else if (errorHandling > 0 && depth <= 40) {
    type = 'snow-bridge'
  } else if (depth >= 70) {
    type = 'ice-fall'
  } else if (depth >= 50) {
    type = 'serac'
  } else if (conditionals > 5) {
    type = 'moulin'
  } else {
    type = 'crevasse'
  }

  return {
    depth,
    type,
    hasNoCrevasses,
    hasSurfaceCracks,
    hasDeepCrevasses,
    hasHiddenCrevasses,
    hasBergschrund,
    hasMarginalCrevasses,
    hasTransverseCrevasses,
    hasLongitudinalCrevasses,
    hasSnowBridge,
    hasRescue,
    crevasseCount,
    snowBridgeCount,
  }
}

// ─── Measure Moraine ───────────────────────────────────────────────────────

/** @example measureMoraine('export class LegacyService {}') returns MoraineMeasure */
export function measureMoraine(content: string): MoraineMeasure {
  const lines = countNonEmptyLines(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const comments = countComments(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const todos = countTodos(content)
  const exports = countExports(content)
  const typeAnnotations = countTypeAnnotations(content)

  const totalTypes = classes + interfaces + typeAliases

  // Quality: legacy quality — structured, typed, documented, no deprecated
  const baseQuality = lines === 0 ? 10 : Math.min(40, totalTypes * 10 + lines)
  const typeBonus = Math.min(20, typeAnnotations * 3)
  const commentBonus = Math.min(15, Math.min(comments, 5) * 3)
  const exportBonus = Math.min(10, exports * 3)
  const deprecatedPenalty = Math.min(20, deprecated * 10)
  const todoPenalty = Math.min(15, todos * 5)
  const quality = Math.max(0, Math.min(100, baseQuality + typeBonus + commentBonus + exportBonus - deprecatedPenalty - todoPenalty))

  const isWellSorted = totalTypes > 0 && typeAnnotations > 0
  const hasHistoricalValue = comments > 0 && classes > 0
  const hasErratic = deprecated > 0
  const hasDrumlin = classes > 0 && interfaces > 0
  const hasEsker = typeAliases > 0
  const hasKettle = lines > 10 && exports === 0
  const hasOutwash = deprecated > 0 || todos > 0
  const hasTill = lines > 0 && totalTypes === 0
  const hasSortedDeposit = classes > 0 && interfaces > 0 && typeAnnotations > 0
  const erraticCount = deprecated
  const kettleCount = hasKettle ? 1 : 0

  let type: MoraineMeasure['type']
  if (quality >= 70 && classes > 0 && interfaces > 0) {
    type = 'lateral'
  } else if (quality >= 55 && classes > 0) {
    type = 'medial'
  } else if (quality >= 40 && totalTypes > 0) {
    type = 'terminal'
  } else if (quality >= 25) {
    type = 'ground'
  } else if (quality >= 15) {
    type = 'recessional'
  } else {
    type = 'push'
  }

  return {
    quality,
    type,
    isWellSorted,
    hasHistoricalValue,
    hasErratic,
    hasDrumlin,
    hasEsker,
    hasKettle,
    hasOutwash,
    hasTill,
    hasSortedDeposit,
    erraticCount,
    kettleCount,
  }
}

// ─── Measure Accumulation ──────────────────────────────────────────────────

/** @example measureAccumulation('export function newFeature(): string { return "fresh"; }') returns AccumulationMeasure */
export function measureAccumulation(content: string): AccumulationMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const exports = countExports(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const tests = countMatches(content, TEST_REGEX)
  const todos = countTodos(content)
  const smells = countSmells(content)

  const hasCode = funcs > 0 || lines > 0

  // Zone: new code quality — exports, typed, tested, documented
  const baseZone = lines === 0 ? 10 : Math.min(40, funcs * 8 + lines)
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const testBonus = Math.min(15, tests * 3)
  const exportBonus = Math.min(15, exports * 5)
  const commentBonus = Math.min(10, Math.min(comments, 3) * 2)
  const smellPenalty = Math.min(20, (smells + todos) * 5)
  const zone = Math.max(0, Math.min(100, baseZone + typeBonus + testBonus + exportBonus + commentBonus - smellPenalty))

  const isHealthy = zone >= 40
  const hasFreshSnow = exports > 0 && funcs > 0
  const hasFirnLine = typeAnnotations > 0 && funcs > 0
  const hasSnowPit = tests > 0
  const hasIceCore = comments > 0
  const hasDensityIncrease = typeAnnotations > 0 && exports > 0
  const hasLayerPreservation = comments > 0 && exports > 0
  const hasWindSlab = todos > 0 && funcs > 0
  const hasAvalancheRisk = smells > 0 && hasCode
  const hasSnowBridge = errorHandling > 0
  const avalancheRiskCount = smells + (todos > 2 ? 1 : 0)

  let rate: AccumulationMeasure['rate']
  if (zone >= 75 && exports > 0 && tests > 0) {
    rate = 'heavy-snowfall'
  } else if (zone >= 55 && exports > 0) {
    rate = 'steady-accumulation'
  } else if (zone >= 40 && hasCode) {
    rate = 'light-snow'
  } else if (zone >= 25) {
    rate = 'drought'
  } else if (zone >= 15) {
    rate = 'rain'
  } else {
    rate = 'sublimation'
  }

  return {
    zone,
    rate,
    isHealthy,
    hasFreshSnow,
    hasFirnLine,
    hasSnowPit,
    hasIceCore,
    hasDensityIncrease,
    hasLayerPreservation,
    hasWindSlab,
    hasAvalancheRisk,
    hasSnowBridge,
    avalancheRiskCount,
  }
}

// ─── Measure Ablation ──────────────────────────────────────────────────────

/** @example measureAblation('export function cleanup(): void {}') returns AblationMeasure */
export function measureAblation(content: string): AblationMeasure {
  const lines = countNonEmptyLines(content)
  const emptyLines = countEmptyLines(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errorHandling = countErrorHandling(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const comments = countComments(content)
  const funcs = countFunctions(content)

  // Zone: refactoring quality — clean, balanced imports/exports, error handling
  const baseZone = lines === 0 ? 10 : Math.min(40, lines + exports * 5)
  const balanceBonus = exports > 0 && imports > 0 ? 15 : 0
  const errorBonus = Math.min(15, errorHandling * 5)
  const commentBonus = Math.min(10, Math.min(comments, 3) * 2)
  const deadPenalty = Math.min(20, (todos + deprecated) * 5)
  const zone = Math.max(0, Math.min(100, baseZone + balanceBonus + errorBonus + commentBonus - deadPenalty))

  const isBalanced = exports > 0 && imports <= exports + 3
  const hasCleanMelting = errorHandling > 0 && todos === 0
  const hasCalving = exports > 0 && deprecated > 0
  const hasSublimation = emptyLines > lines * 0.5 && lines > 0
  const hasIceMargin = exports > 0
  const hasMeltwater = errorHandling > 0
  const hasProglacial = imports > 0 && exports > 0
  const hasDeadIce = todos > 0 || deprecated > 0
  const hasOutwash = deprecated > 0
  const hasMassBalance = exports > 0 && imports > 0 && todos === 0
  const deadIceCount = todos + deprecated

  let method: AblationMeasure['method']
  if (zone >= 70 && hasCleanMelting) {
    method = 'calving'
  } else if (zone >= 50 && errorHandling > 0) {
    method = 'melting'
  } else if (zone >= 35) {
    method = 'sublimation'
  } else if (zone >= 25) {
    method = 'evaporation'
  } else if (zone >= 15) {
    method = 'wind-erosion'
  } else {
    method = 'none'
  }

  return {
    zone,
    method,
    isBalanced,
    hasCleanMelting,
    hasCalving,
    hasSublimation,
    hasIceMargin,
    hasMeltwater,
    hasProglacial,
    hasDeadIce,
    hasOutwash,
    hasMassBalance,
    deadIceCount,
  }
}

// ─── Classify Reading Condition ────────────────────────────────────────────

/** @example classifyReadingCondition(80) returns 'crystal-glacier' */
export function classifyReadingCondition(score: number): GlacierReading['condition'] {
  if (score >= 80) return 'crystal-glacier'
  if (score >= 65) return 'healthy-glacier'
  if (score >= 50) return 'stable-icefield'
  if (score >= 35) return 'retreating-glacier'
  if (score >= 20) return 'dirty-ice'
  return 'rock-glacier'
}

// ─── Analyze Glacier Reading ───────────────────────────────────────────────

/** @example analyzeGlacierReading('export function foo(): void {}', 'glacier.ts') returns GlacierReading */
export function analyzeGlacierReading(content: string, filePath: string): GlacierReading {
  const ice = measureIce(content)
  const flow = measureFlow(content)
  const crevasse = measureCrevasse(content)
  const moraine = measureMoraine(content)
  const accumulation = measureAccumulation(content)
  const ablation = measureAblation(content)

  const iceDensity = ice.density
  const flowRate = flow.rate
  const crevasseDepth = crevasse.depth
  const moraineQuality = moraine.quality
  const accumulationZone = accumulation.zone
  const ablationZone = ablation.zone

  // Invert crevasse depth for scoring (lower depth = better)
  const crevasseScore = Math.max(0, 100 - crevasseDepth)

  const qualityScore = Math.round(
    (iceDensity + flowRate + crevasseScore + moraineQuality + accumulationZone + ablationZone) / 6,
  )

  const condition = classifyReadingCondition(qualityScore)

  return {
    file: filePath,
    iceDensity,
    flowRate,
    crevasseDepth,
    moraineQuality,
    accumulationZone,
    ablationZone,
    ice,
    flow,
    crevasse,
    moraine,
    accumulation,
    ablation,
    condition,
    qualityScore,
  }
}

// ─── Classify Field Type ───────────────────────────────────────────────────

/** @example classifyFieldType(readings) returns 'valley-glacier' */
export function classifyFieldType(readings: GlacierReading[]): IceField['fieldType'] {
  if (readings.length === 0) return 'snow-patch'
  const avgScore = Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length)
  const crystalCount = readings.filter((r) => r.condition === 'crystal-glacier').length
  const ratio = crystalCount / readings.length

  if (avgScore >= 75 && ratio >= 0.5) return 'ice-cap'
  if (avgScore >= 60) return 'ice-sheet'
  if (avgScore >= 45) return 'valley-glacier'
  if (avgScore >= 30) return 'piedmont'
  if (avgScore >= 15) return 'cirque'
  return 'snow-patch'
}

/** @example classifyFieldCondition(70) returns 'alpine-glacier' */
export function classifyFieldCondition(avgScore: number): IceField['condition'] {
  if (avgScore >= 80) return 'polar-ice-sheet'
  if (avgScore >= 65) return 'alpine-glacier'
  if (avgScore >= 50) return 'valley-glacier'
  if (avgScore >= 35) return 'rock-glacier'
  if (avgScore >= 20) return 'permafrost'
  return 'mud-slide'
}

// ─── Classify Glaciologist Grade ────────────────────────────────────────────

/** @example classifyGlaciologistGrade(85) returns 'chief-glaciologist' */
export function classifyGlaciologistGrade(avgHealth: number): GlacierFieldStats['glaciologistGrade'] {
  if (avgHealth >= 80) return 'chief-glaciologist'
  if (avgHealth >= 65) return 'senior-glaciologist'
  if (avgHealth >= 50) return 'glaciologist'
  if (avgHealth >= 35) return 'geologist'
  if (avgHealth >= 20) return 'hiker'
  return 'snowman'
}

// ─── Analyze Ice Field ─────────────────────────────────────────────────────

/** @example analyzeIceField(readings, 'src') returns IceField */
export function analyzeIceField(readings: GlacierReading[], dirPath: string): IceField {
  const count = readings.length
  const avgIceDensity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.iceDensity, 0) / count) : 0
  const avgFlowRate = count > 0 ? Math.round(readings.reduce((s, r) => s + r.flowRate, 0) / count) : 0
  const avgMoraineQuality = count > 0 ? Math.round(readings.reduce((s, r) => s + r.moraineQuality, 0) / count) : 0

  const crystalGlacierCount = readings.filter((r) => r.condition === 'crystal-glacier').length
  const rockGlacierCount = readings.filter((r) => r.condition === 'rock-glacier').length
  const healthyCount = readings.filter((r) => r.flow.isHealthy).length
  const balancedCount = readings.filter((r) => r.ablation.isBalanced).length

  const fieldType = classifyFieldType(readings)
  const avgScore = count > 0 ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / count) : 0
  const condition = classifyFieldCondition(avgScore)

  return {
    directory: dirPath,
    readings,
    avgIceDensity,
    avgFlowRate,
    avgMoraineQuality,
    crystalGlacierCount,
    rockGlacierCount,
    healthyCount,
    balancedCount,
    fieldType,
    condition,
  }
}

// ─── Generate Recommendations ──────────────────────────────────────────────

/** @example generateRecommendations(readings, fields, survey, stats) returns string[] */
export function generateRecommendations(
  readings: GlacierReading[],
  _fields: IceField[],
  _survey: GlacierFieldResult['survey'],
  _stats: GlacierFieldStats,
): string[] {
  const recommendations: string[] = []

  const hasDirtyIce = readings.some((r) => r.ice.type === 'dirty-ice' || r.ice.type === 'slush')
  if (hasDirtyIce) {
    recommendations.push('Clean dirty ice — remove TODOs, console calls, and deprecated markers')
  }

  const hasCrevasses = readings.some((r) => r.crevasse.crevasseCount > 0)
  if (hasCrevasses) {
    recommendations.push('Fill crevasses — fix code smells and add error handling for structural integrity')
  }

  const hasRetreat = readings.some((r) => r.flow.hasRetreat)
  if (hasRetreat) {
    recommendations.push('Reverse glacier retreat — add exports and functions to stagnant code')
  }

  const hasDeadIce = readings.some((r) => r.ablation.hasDeadIce)
  if (hasDeadIce) {
    recommendations.push('Remove dead ice — clean up TODOs and deprecated code blocking ablation')
  }

  const hasErratics = readings.some((r) => r.moraine.hasErratic)
  if (hasErratics) {
    recommendations.push('Clear erratic boulders — remove deprecated code from moraine deposits')
  }

  const hasAvalancheRisk = readings.some((r) => r.accumulation.hasAvalancheRisk)
  if (hasAvalancheRisk) {
    recommendations.push('Reduce avalanche risk — fix code smells in new accumulation zones')
  }

  const hasSurging = readings.some((r) => r.flow.state === 'surging')
  if (hasSurging) {
    recommendations.push('Slow surging glaciers — reduce cyclomatic complexity for stable flow')
  }

  const hasBergschrund = readings.some((r) => r.crevasse.hasBergschrund)
  if (hasBergschrund) {
    recommendations.push('Bridge bergschrund — add error handling to close gaps between new and old code')
  }

  if (recommendations.length === 0) {
    recommendations.push('Glacier field is in pristine condition — crystal-clear ice with balanced flow')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildGlacierFieldResult(['a.ts'], ['export function foo(): void {}']) returns GlacierFieldResult */
export function buildGlacierFieldResult(
  files: string[],
  contents: string[],
  options?: { ignore?: string[]; ext?: string[] },
): GlacierFieldResult {
  const _opts = options ?? {}

  const readings: GlacierReading[] = files.map((file, i) =>
    analyzeGlacierReading(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, GlacierReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      dirMap.set(dir, [reading])
    }
  }

  const fields: IceField[] = Array.from(dirMap.entries()).map(
    ([dir, dirReadings]) => analyzeIceField(dirReadings, dir),
  )

  const count = readings.length
  const avgIceDensity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.iceDensity, 0) / count) : 0
  const avgFlowRate = count > 0 ? Math.round(readings.reduce((s, r) => s + r.flowRate, 0) / count) : 0
  const avgMoraineQuality = count > 0 ? Math.round(readings.reduce((s, r) => s + r.moraineQuality, 0) / count) : 0
  const overallGlacierHealth = count > 0 ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / count) : 0

  const survey: GlacierFieldResult['survey'] = {
    avgIceDensity,
    avgFlowRate,
    avgMoraineQuality,
    isAdvancing: avgFlowRate >= 50,
    overallGlacierHealth,
  }

  const avgCrevasseDepth = count > 0 ? Math.round(readings.reduce((s, r) => s + r.crevasseDepth, 0) / count) : 0
  const avgAccumulationZone = count > 0 ? Math.round(readings.reduce((s, r) => s + r.accumulationZone, 0) / count) : 0
  const avgAblationZone = count > 0 ? Math.round(readings.reduce((s, r) => s + r.ablationZone, 0) / count) : 0

  const crystalGlacierCount = readings.filter((r) => r.condition === 'crystal-glacier').length
  const healthyGlacierCount = readings.filter((r) => r.condition === 'healthy-glacier').length
  const stableIcefieldCount = readings.filter((r) => r.condition === 'stable-icefield').length
  const retreatingGlacierCount = readings.filter((r) => r.condition === 'retreating-glacier').length
  const dirtyIceCount = readings.filter((r) => r.condition === 'dirty-ice').length
  const rockGlacierCount = readings.filter((r) => r.condition === 'rock-glacier').length

  const isPureCount = readings.filter((r) => r.ice.isPure).length
  const hasNoDebrisCount = readings.filter((r) => r.ice.hasNoDebris).length
  const isHealthyCount = readings.filter((r) => r.flow.isHealthy).length
  const hasSurgeBehaviorCount = readings.filter((r) => r.flow.hasSurgeBehavior).length
  const hasRetreatCount = readings.filter((r) => r.flow.hasRetreat).length
  const hasNoCrevassesCount = readings.filter((r) => r.crevasse.hasNoCrevasses).length
  const hasHiddenCrevassesCount = readings.filter((r) => r.crevasse.hasHiddenCrevasses).length
  const hasSnowBridgeCount = readings.filter((r) => r.crevasse.hasSnowBridge).length
  const isWellSortedCount = readings.filter((r) => r.moraine.isWellSorted).length
  const hasDeadIceCount = readings.filter((r) => r.ablation.hasDeadIce).length
  const isBalancedCount = readings.filter((r) => r.ablation.isBalanced).length
  const hasMassBalanceCount = readings.filter((r) => r.ablation.hasMassBalance).length

  const glaciologistGrade = classifyGlaciologistGrade(overallGlacierHealth)

  const bestReading = count > 0
    ? readings.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const densestIce = count > 0
    ? readings.reduce((best, r) => r.iceDensity > best.iceDensity ? r : best).file
    : ''
  const healthiestFlow = count > 0
    ? readings.reduce((best, r) => r.flowRate > best.flowRate ? r : best).file
    : ''
  const shallowestCrevasses = count > 0
    ? readings.reduce((best, r) => r.crevasseDepth < best.crevasseDepth ? r : best).file
    : ''
  const bestMoraine = count > 0
    ? readings.reduce((best, r) => r.moraineQuality > best.moraineQuality ? r : best).file
    : ''

  const stats: GlacierFieldStats = {
    totalFiles: count,
    totalFields: fields.length,
    avgIceDensity,
    avgFlowRate,
    avgCrevasseDepth,
    avgMoraineQuality,
    avgAccumulationZone,
    avgAblationZone,
    crystalGlacierCount,
    healthyGlacierCount,
    stableIcefieldCount,
    retreatingGlacierCount,
    dirtyIceCount,
    rockGlacierCount,
    isPureCount,
    hasNoDebrisCount,
    isHealthyCount,
    hasSurgeBehaviorCount,
    hasRetreatCount,
    hasNoCrevassesCount,
    hasHiddenCrevassesCount,
    hasSnowBridgeCount,
    isWellSortedCount,
    hasDeadIceCount,
    isBalancedCount,
    hasMassBalanceCount,
    overallGlacierHealth,
    glaciologistGrade,
    bestReading,
    densestIce,
    healthiestFlow,
    shallowestCrevasses,
    bestMoraine,
  }

  const recommendations = generateRecommendations(readings, fields, survey, stats)

  return { readings, fields, survey, stats, recommendations }
}
