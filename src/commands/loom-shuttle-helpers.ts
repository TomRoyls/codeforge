// ─── Interfaces ──────────────────────────────────────────

export interface WarpMeasure {
  tension: number
  isTaut: boolean
  isSlack: boolean
  isBroken: boolean
  hasSnags: boolean
  hasVariation: boolean
  isEvenlySpaced: boolean
  threadCount: number
  snagCount: number
  brokenCount: number
}

export interface ShuttleMeasure {
  speed: number
  isSwift: boolean
  isSluggish: boolean
  hasJamming: boolean
  hasMisfires: boolean
  hasSmoothPassage: boolean
  jamCount: number
  misfireCount: number
  passageQuality: number
}

export interface WeaveMeasure {
  pattern: 'plain' | 'twill' | 'satin' | 'basket' | 'leno' | 'jacquard'
  quality: number
  hasTightWeave: boolean
  hasLooseWeave: boolean
  hasBrokenThreads: boolean
  hasCrossedThreads: boolean
  hasPulledThreads: boolean
  hasFringes: boolean
  brokenThreadCount: number
  crossedThreadCount: number
  pulledThreadCount: number
}

export interface FabricMeasure {
  quality: number
  weight: number
  hasStrongFabric: boolean
  hasWeakFabric: boolean
  hasMothHoles: boolean
  hasReinforcement: boolean
  hasDoubleWeave: boolean
  reinforcementCount: number
  mothHoleCount: number
}

export interface PatternMeasure {
  complexity: number
  hasRepeatingPattern: boolean
  hasComplexMotif: boolean
  hasColorChanges: boolean
  hasBorderPattern: boolean
  hasCentralMedallion: boolean
  isSymmetric: boolean
  colorChangeCount: number
}

export interface YarnMeasure {
  type: 'cotton' | 'silk' | 'wool' | 'linen' | 'synthetic' | 'raw'
  quality: number
  isStrong: boolean
  isFragile: boolean
  hasConsistentDiameter: boolean
  hasSlubs: boolean
  isColorfast: boolean
  slubCount: number
}

export interface HeddleMeasure {
  isProperlySet: boolean
  hasCorrectShaft: boolean
  hasTieUp: boolean
  hasDraft: boolean
  isWellTimed: boolean
}

export interface LoomThread {
  file: string
  warpTension: number
  shuttleSpeed: number
  threadCount: number
  weavePattern: number
  fabricQuality: number
  patternComplexity: number
  warp: WarpMeasure
  shuttle: ShuttleMeasure
  weave: WeaveMeasure
  fabric: FabricMeasure
  pattern: PatternMeasure
  yarn: YarnMeasure
  heddle: HeddleMeasure
  condition: 'master-tapestry' | 'fine-cloth' | 'quality-weave' | 'homespun' | 'frayed-fabric' | 'tangled-mess'
  qualityScore: number
}

export interface WeavingWorkshop {
  directory: string
  threads: LoomThread[]
  avgWarpTension: number
  avgWeaveQuality: number
  avgFabricQuality: number
  masterCount: number
  tangledCount: number
  strongFabricCount: number
  threadSafeCount: number
  workshopType: 'master-weaver' | 'textile-mill' | 'handloom' | 'spinning-wheel' | 'tangled-yarn' | 'empty-room'
  condition: 'haute-couture' | 'quality-textile' | 'standard-fabric' | 'rough-cloth' | 'rags' | 'tatters'
}

export interface WeavingGuild {
  avgWarpTension: number
  avgWeaveQuality: number
  avgFabricQuality: number
  isWellWoven: boolean
  overallWeave: number
}

export interface LoomShuttleStats {
  totalFiles: number
  totalWorkshops: number
  avgWarpTension: number
  avgShuttleSpeed: number
  avgThreadCount: number
  avgWeavePattern: number
  avgFabricQuality: number
  avgPatternComplexity: number
  masterTapestryCount: number
  fineClothCount: number
  qualityWeaveCount: number
  homespunCount: number
  frayedFabricCount: number
  tangledMessCount: number
  plainWeaveCount: number
  twillWeaveCount: number
  jacquardWeaveCount: number
  hasSnagsCount: number
  hasJammingCount: number
  hasCrossedThreadsCount: number
  hasPulledThreadsCount: number
  hasMothHolesCount: number
  hasReinforcementCount: number
  isStrongFabricCount: number
  isWellTimedCount: number
  isSymmetricCount: number
  overallWeave: number
  weaverGrade: 'master-weaver' | 'journeyman-weaver' | 'apprentice-weaver' | 'novice' | 'child' | 'cat'
  bestWoven: string
  strongestFabric: string
  fastestShuttle: string
  mostComplex: string
  mostReinforced: string
}

export interface LoomShuttleResult {
  threads: LoomThread[]
  workshops: WeavingWorkshop[]
  guild: WeavingGuild
  stats: LoomShuttleStats
  recommendations: string[]
}

// ─── Utility helpers ──────────────────────────────────────

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))

function countLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').length
}

function countImports(content: string): number {
  return (content.match(/^import\s/gm) || []).length
}

function countExports(content: string): number {
  return (content.match(/^export\s/gm) || []).length
}

function countFunctions(content: string): number {
  return (content.match(/\bfunction\s+\w+/g) || []).length + (content.match(/\b\w+\s*=\s*(?:async\s+)?\(/g) || []).length
}

function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) || []).length
}

function countInterfaces(content: string): number {
  return (content.match(/\binterface\s+\w+/g) || []).length
}

function countTypeAliases(content: string): number {
  return (content.match(/\btype\s+\w+\s*=/g) || []).length
}

function countAsyncAwait(content: string): number {
  return (content.match(/\basync\s/g) || []).length + (content.match(/\bawait\s/g) || []).length
}

function countPromises(content: string): number {
  return (content.match(/\bPromise\b/g) || []).length
}

function countTryCatch(content: string): number {
  return (content.match(/\btry\s*\{/g) || []).length
}

function countErrorHandling(content: string): number {
  return countTryCatch(content) + (content.match(/\bthrow\s/g) || []).length + (content.match(/\.catch\s*\(/g) || []).length
}

function countCallbacks(content: string): number {
  return (content.match(/\bcallback\b/gi) || []).length + (content.match(/\(\s*(?:err|error)\s*[,\)]/g) || []).length
}

function countEventListeners(content: string): number {
  return (content.match(/\.on\s*\(/g) || []).length + (content.match(/\.addEventListener\s*\(/g) || []).length + (content.match(/\.emit\s*\(/g) || []).length
}

function countLocks(content: string): number {
  return (content.match(/\bMutex\b/gi) || []).length
    + (content.match(/\bSemaphore\b/gi) || []).length
    + (content.match(/\block\s*\(/gi) || []).length
    + (content.match(/\bunlock\s*\(/gi) || []).length
    + (content.match(/\bsynchronized\b/g) || []).length
}

function countSharedState(content: string): number {
  return (content.match(/\bglobal\./g) || []).length
    + (content.match(/\bshared\b/gi) || []).length
    + (content.match(/\bstatic\s+\w+/g) || []).length
}

function countSetTimeout(content: string): number {
  return (content.match(/\bsetTimeout\s*\(/g) || []).length + (content.match(/\bsetInterval\s*\(/g) || []).length
}

function countConditions(content: string): number {
  return (content.match(/\bif\s*\(/g) || []).length
}

function countLoops(content: string): number {
  return (content.match(/\b(for|while)\s*\(/g) || []).length
}

function countNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('}') || trimmed.endsWith('}')) {
      depth = Math.max(0, depth - 1)
    }
    if (trimmed.includes('{')) {
      depth++
      maxDepth = Math.max(maxDepth, depth)
    }
  }
  return maxDepth
}

function countTODO(content: string): number {
  return (content.match(/\bTODO\b/g) || []).length + (content.match(/\bFIXME\b/g) || []).length + (content.match(/\bHACK\b/g) || []).length
}

function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)\b/g) || []).length
    + (content.match(/:\s*\w+\[/g) || []).length
}

function countJSDoc(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
}

function countTests(content: string): number {
  return (content.match(/\b(it|test|describe)\s*\(/g) || []).length
}

function countReturnStatements(content: string): number {
  return (content.match(/\breturn\b/g) || []).length
}

// ─── Measure functions ────────────────────────────────────

/**
 * @example
 * const warp = measureWarp('import { a } from "./x"\nexport function f() {}')
 * // warp.tension > 0
 */
export function measureWarp(content: string): WarpMeasure {
  const loc = countLines(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)

  const threadCount = imports + exports
  const snagCount = countTODO(content)
  const brokenCount = (content.match(/\bundefined\b/g) || []).length > 5 ? 1 : 0

  const tension = loc === 0 ? 100 : clamp(Math.round(
    (imports > 0 && exports > 0 ? 30 : 0) +
    (functions > 0 ? 20 : 0) +
    (snagCount === 0 ? 25 : 0) +
    (brokenCount === 0 ? 25 : 0)
  ), 0, 100)

  const isTaut = tension >= 60
  const isSlack = tension < 30
  const isBroken = brokenCount > 0
  const hasSnags = snagCount > 0
  const hasVariation = imports !== exports && threadCount > 0
  const isEvenlySpaced = Math.abs(imports - exports) <= 2 || threadCount === 0

  return {
    brokenCount,
    hasSnags,
    hasVariation,
    isBroken,
    isEvenlySpaced,
    isSlack,
    isTaut,
    snagCount,
    tension,
    threadCount,
  }
}

/**
 * @example
 * const shuttle = measureShuttle('function fast() { return 1 }')
 * // shuttle.speed > 0
 */
export function measureShuttle(content: string): ShuttleMeasure {
  const loc = countLines(content)
  const functions = countFunctions(content)
  const returns = countReturnStatements(content)
  const asyncOps = countAsyncAwait(content)
  const callbacks = countCallbacks(content)
  const timers = countSetTimeout(content)

  const jamCount = timers + countLoops(content)
  const misfireCount = (content.match(/\bthrow\b/g) || []).length
  const passageQuality = loc === 0 ? 100 : clamp(Math.round(
    (returns > 0 ? 30 : 0) +
    (functions > 0 ? 20 : 0) +
    (asyncOps === 0 ? 20 : 0) +
    (jamCount === 0 ? 15 : 0) +
    (callbacks === 0 ? 15 : 0)
  ), 0, 100)

  const speed = loc === 0 ? 100 : clamp(Math.round(
    (functions > 0 ? 25 : 0) +
    (returns >= functions ? 25 : 0) +
    (asyncOps <= 2 ? 20 : 0) +
    (callbacks <= 1 ? 15 : 0) +
    (jamCount <= 2 ? 15 : 0)
  ), 0, 100)

  const isSwift = speed >= 60
  const isSluggish = speed < 30
  const hasJamming = jamCount > 3
  const hasMisfires = misfireCount > 2
  const hasSmoothPassage = passageQuality >= 60

  return {
    hasJamming,
    hasMisfires,
    hasSmoothPassage,
    isSluggish,
    isSwift,
    jamCount,
    misfireCount,
    passageQuality,
    speed,
  }
}

/**
 * @example
 * const weave = measureWeave('export function a() {}')
 * // weave.quality >= 0
 */
export function measureWeave(content: string): WeaveMeasure {
  const loc = countLines(content)
  const exports = countExports(content)
  const interfaces = countInterfaces(content)
  const classes = countClasses(content)
  const errorHandling = countErrorHandling(content)
  const shared = countSharedState(content)
  const locks = countLocks(content)
  const events = countEventListeners(content)

  const crossedThreadCount = shared
  const pulledThreadCount = events > 3 ? 1 : 0
  const brokenThreadCount = countTODO(content)

  const quality = loc === 0 ? 100 : clamp(Math.round(
    (exports > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (errorHandling > 0 ? 20 : 0) +
    (crossedThreadCount === 0 ? 15 : 0) +
    (pulledThreadCount === 0 ? 15 : 0) +
    (locks > 0 ? 10 : 0) +
    (brokenThreadCount === 0 ? 10 : 0)
  ), 0, 100)

  const hasTightWeave = quality >= 60
  const hasLooseWeave = quality < 30
  const hasBrokenThreads = brokenThreadCount > 0
  const hasCrossedThreads = crossedThreadCount > 0
  const hasPulledThreads = pulledThreadCount > 0
  const hasFringes = exports > 0 && errorHandling === 0

  let pattern: WeaveMeasure['pattern']
  if (quality >= 80 && classes > 0 && interfaces > 0) pattern = 'jacquard'
  else if (quality >= 60 && classes > 0) pattern = 'twill'
  else if (quality >= 45 && exports > 0) pattern = 'satin'
  else if (quality >= 30) pattern = 'basket'
  else if (quality >= 15 && functions_count(content) > 0) pattern = 'leno'
  else pattern = 'plain'

  return {
    brokenThreadCount,
    crossedThreadCount,
    hasBrokenThreads,
    hasCrossedThreads,
    hasFringes,
    hasLooseWeave,
    hasPulledThreads,
    hasTightWeave,
    pattern,
    pulledThreadCount,
    quality,
  }
}

function functions_count(content: string): number {
  return countFunctions(content)
}

/**
 * @example
 * const fabric = measureFabric('try { x() } catch(e) {}')
 * // fabric.hasReinforcement = true
 */
export function measureFabric(content: string): FabricMeasure {
  const loc = countLines(content)
  const errorHandling = countErrorHandling(content)
  const tests = countTests(content)
  const types = countTypeAnnotations(content)
  const locks = countLocks(content)
  const todo = countTODO(content)

  const reinforcementCount = errorHandling + locks
  const mothHoleCount = todo

  const quality = loc === 0 ? 100 : clamp(Math.round(
    (errorHandling > 0 ? 25 : 0) +
    (tests > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (mothHoleCount === 0 ? 15 : 0) +
    (locks > 0 ? 15 : 0)
  ), 0, 100)

  const weight = clamp(Math.round(loc / 4), 0, 100)
  const hasStrongFabric = quality >= 60
  const hasWeakFabric = quality < 30
  const hasMothHoles = mothHoleCount > 0
  const hasReinforcement = reinforcementCount > 0
  const hasDoubleWeave = errorHandling > 1

  return {
    hasDoubleWeave,
    hasMothHoles,
    hasReinforcement,
    hasStrongFabric,
    hasWeakFabric,
    mothHoleCount,
    quality,
    reinforcementCount,
    weight,
  }
}

/**
 * @example
 * const pat = measurePattern('function a() {}')
 * // pat.complexity >= 0
 */
export function measurePattern(content: string): PatternMeasure {
  const loc = countLines(content)
  const asyncOps = countAsyncAwait(content)
  const promises = countPromises(content)
  const callbacks = countCallbacks(content)
  const events = countEventListeners(content)
  const locks = countLocks(content)
  const nesting = countNesting(content)

  const complexity = loc === 0 ? 0 : clamp(Math.round(
    (asyncOps * 10) + (promises * 5) + (callbacks * 8) + (events * 6) + (nesting * 4) + (locks * 12)
  ), 0, 100)

  const hasRepeatingPattern = locks > 0 && errorHandling_exists(content)
  const hasComplexMotif = asyncOps > 3 || nesting > 4
  const colorChangeCount = locks + callbacks
  const hasColorChanges = colorChangeCount > 1
  const hasBorderPattern = countConditions(content) > 0
  const hasCentralMedallion = countClasses(content) > 0
  const isSymmetric = Math.abs(asyncOps - callbacks) <= 2

  return {
    colorChangeCount,
    complexity,
    hasBorderPattern,
    hasCentralMedallion,
    hasColorChanges,
    hasComplexMotif,
    hasRepeatingPattern,
    isSymmetric,
  }
}

function errorHandling_exists(content: string): boolean {
  return countErrorHandling(content) > 0
}

/**
 * @example
 * const yarn = measureYarn('export function core() { return 1 }')
 * // yarn.quality > 0
 */
export function measureYarn(content: string): YarnMeasure {
  const loc = countLines(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)

  const quality = loc === 0 ? 100 : clamp(Math.round(
    (exports > 0 ? 25 : 0) +
    (functions > 0 ? 20 : 0) +
    (interfaces > 0 ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0)
  ), 0, 100)

  const slubCount = countNesting(content) > 3 ? countNesting(content) - 3 : 0
  const isStrong = quality >= 50
  const isFragile = quality < 30
  const hasConsistentDiameter = countNesting(content) < 4
  const hasSlubs = slubCount > 0
  const isColorfast = countTODO(content) === 0

  let type: YarnMeasure['type']
  if (quality >= 80) type = 'silk'
  else if (quality >= 60) type = 'linen'
  else if (quality >= 45) type = 'cotton'
  else if (quality >= 30) type = 'wool'
  else if (quality >= 15) type = 'synthetic'
  else type = 'raw'

  return {
    hasConsistentDiameter,
    hasSlubs,
    isColorfast,
    isFragile,
    isStrong,
    quality,
    slubCount,
    type,
  }
}

/**
 * @example
 * const heddle = measureHeddle('function init() {}')
 * // heddle.isProperlySet is defined
 */
export function measureHeddle(content: string): HeddleMeasure {
  const loc = countLines(content)
  const hasInit = (content.match(/\binit\w*\s*\(/gi) || []).length > 0 || (content.match(/\bconstructor\s*\(/g) || []).length > 0
  const hasAbstraction = countClasses(content) > 0 || countInterfaces(content) > 0
  const hasImports = countImports(content) > 0
  const hasDocs = countJSDoc(content) > 0
  const hasTiming = countAsyncAwait(content) > 0 || (content.match(/\basync\b/g) || []).length > 0

  const isProperlySet = loc === 0 || hasInit || hasAbstraction
  const hasCorrectShaft = hasAbstraction
  const hasTieUp = hasImports
  const hasDraft = hasDocs
  const isWellTimed = loc === 0 || hasTiming || !content.includes('async')

  return {
    hasCorrectShaft,
    hasDraft,
    hasTieUp,
    isProperlySet,
    isWellTimed,
  }
}

// ─── Classification ───────────────────────────────────────

/**
 * @example
 * classifyThreadCondition(85, 80, 75) // 'master-tapestry'
 */
export function classifyThreadCondition(
  warpTension: number,
  weavePattern: number,
  fabricQuality: number,
): LoomThread['condition'] {
  const score = (warpTension + weavePattern + fabricQuality) / 3
  if (score >= 70 && warpTension >= 65) return 'master-tapestry'
  if (score >= 55 && fabricQuality >= 50) return 'fine-cloth'
  if (score >= 40) return 'quality-weave'
  if (score >= 25) return 'homespun'
  if (score >= 12) return 'frayed-fabric'
  return 'tangled-mess'
}

/**
 * @example
 * classifyWorkshopType(threads) // 'master-weaver'
 */
export function classifyWorkshopType(threads: LoomThread[]): WeavingWorkshop['workshopType'] {
  if (threads.length === 0) return 'empty-room'
  const avgWeave = threads.reduce((s, t) => s + t.weave.quality, 0) / threads.length
  const masterRatio = threads.filter((t) => t.condition === 'master-tapestry').length / threads.length
  const tangledRatio = threads.filter((t) => t.condition === 'tangled-mess').length / threads.length

  if (avgWeave >= 65 && masterRatio >= 0.3) return 'master-weaver'
  if (avgWeave >= 50) return 'textile-mill'
  if (avgWeave >= 35) return 'handloom'
  if (tangledRatio >= 0.4) return 'tangled-yarn'
  if (avgWeave >= 15) return 'spinning-wheel'
  return 'empty-room'
}

/**
 * @example
 * classifyWorkshopCondition(avgWeave, avgFabric) // 'haute-couture'
 */
export function classifyWorkshopCondition(
  avgWeave: number,
  avgFabric: number,
): WeavingWorkshop['condition'] {
  const score = (avgWeave + avgFabric) / 2
  if (score >= 75) return 'haute-couture'
  if (score >= 60) return 'quality-textile'
  if (score >= 45) return 'standard-fabric'
  if (score >= 30) return 'rough-cloth'
  if (score >= 15) return 'rags'
  return 'tatters'
}

/**
 * @example
 * classifyWeaverGrade(85) // 'master-weaver'
 */
export function classifyWeaverGrade(avgWeave: number): LoomShuttleStats['weaverGrade'] {
  if (avgWeave >= 80) return 'master-weaver'
  if (avgWeave >= 65) return 'journeyman-weaver'
  if (avgWeave >= 50) return 'apprentice-weaver'
  if (avgWeave >= 35) return 'novice'
  if (avgWeave >= 20) return 'child'
  return 'cat'
}

// ─── Analyze functions ────────────────────────────────────

/**
 * @example
 * const thread = analyzeLoomThread(content, 'src/core.ts')
 * // thread.warpTension >= 0
 */
export function analyzeLoomThread(content: string, filePath: string): LoomThread {
  const warp = measureWarp(content)
  const shuttle = measureShuttle(content)
  const weave = measureWeave(content)
  const fabric = measureFabric(content)
  const pattern = measurePattern(content)
  const yarn = measureYarn(content)
  const heddle = measureHeddle(content)

  const warpTension = warp.tension
  const shuttleSpeed = shuttle.speed
  const threadCount = warp.threadCount
  const weavePattern = weave.quality
  const fabricQuality = fabric.quality
  const patternComplexity = pattern.complexity

  const condition = classifyThreadCondition(warpTension, weavePattern, fabricQuality)

  const qualityScore = clamp(Math.round(
    (warpTension * 0.15) +
    (shuttleSpeed * 0.1) +
    (weavePattern * 0.2) +
    (fabricQuality * 0.2) +
    ((100 - patternComplexity * 0.3) * 0.1) +
    (yarn.quality * 0.1) +
    (shuttle.passageQuality * 0.05) +
    (heddle.isProperlySet ? 10 : 0)
  ), 0, 100)

  return {
    condition,
    fabric,
    fabricQuality,
    heddle,
    pattern,
    patternComplexity,
    qualityScore,
    shuttle,
    shuttleSpeed,
    threadCount,
    warp,
    warpTension,
    weave,
    weavePattern,
    yarn,
    file: filePath,
  }
}

/**
 * @example
 * const workshop = analyzeWeavingWorkshop(threads, 'src')
 * // workshop.workshopType is defined
 */
export function analyzeWeavingWorkshop(threads: LoomThread[], dirPath: string): WeavingWorkshop {
  if (threads.length === 0) {
    return {
      avgFabricQuality: 0,
      avgWarpTension: 0,
      avgWeaveQuality: 0,
      condition: 'tatters',
      directory: dirPath,
      masterCount: 0,
      strongFabricCount: 0,
      tangledCount: 0,
      threadSafeCount: 0,
      threads: [],
      workshopType: 'empty-room',
    }
  }

  const avgWarpTension = Math.round(threads.reduce((s, t) => s + t.warpTension, 0) / threads.length)
  const avgWeaveQuality = Math.round(threads.reduce((s, t) => s + t.weave.quality, 0) / threads.length)
  const avgFabricQuality = Math.round(threads.reduce((s, t) => s + t.fabricQuality, 0) / threads.length)
  const masterCount = threads.filter((t) => t.condition === 'master-tapestry').length
  const tangledCount = threads.filter((t) => t.condition === 'tangled-mess').length
  const strongFabricCount = threads.filter((t) => t.fabric.hasStrongFabric).length
  const threadSafeCount = threads.filter((t) => t.fabric.hasReinforcement).length

  const workshopType = classifyWorkshopType(threads)
  const condition = classifyWorkshopCondition(avgWeaveQuality, avgFabricQuality)

  return {
    avgFabricQuality,
    avgWarpTension,
    avgWeaveQuality,
    condition,
    directory: dirPath,
    masterCount,
    strongFabricCount,
    tangledCount,
    threadSafeCount,
    threads,
    workshopType,
  }
}

// ─── Recommendation generation ────────────────────────────

/**
 * @example
 * const recs = generateRecommendations(threads, workshops, guild, stats)
 * // recs.length > 0
 */
export function generateRecommendations(
  _threads: LoomThread[],
  _workshops: WeavingWorkshop[],
  guild: WeavingGuild,
  stats: LoomShuttleStats,
): string[] {
  const recs: string[] = []

  if (guild.overallWeave < 35) {
    recs.push('Overall weave quality is critically low - add error handling and synchronization')
  }

  if (stats.tangledMessCount > 0) {
    recs.push(`${stats.tangledMessCount} file(s) are tangled messes - restructure data flow and add type safety`)
  }

  if (stats.hasCrossedThreadsCount > 0) {
    recs.push(`${stats.hasCrossedThreadsCount} file(s) have race condition risks - reduce shared mutable state`)
  }

  if (stats.hasPulledThreadsCount > 0) {
    recs.push('Potential deadlock patterns detected - review event listener chains')
  }

  if (stats.hasMothHolesCount > 3) {
    recs.push('Many TODO/FIXME markers found - resolve these moth holes before they become bugs')
  }

  if (stats.frayedFabricCount > stats.totalFiles * 0.3) {
    recs.push('Many files have frayed fabric - add tests and error handling for thread safety')
  }

  if (stats.hasJammingCount > 0) {
    recs.push(`${stats.hasJammingCount} file(s) have execution bottlenecks - review loops and timers`)
  }

  if (guild.avgFabricQuality < 40) {
    recs.push('Fabric quality is low - invest in type annotations, tests, and error boundaries')
  }

  if (recs.length === 0) {
    recs.push('Your loom is producing beautiful, strong fabric - excellent code weaving')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────

/**
 * @example
 * const result = buildLoomShuttleResult(files, contents, {})
 * // result.stats.totalFiles > 0
 */
export function buildLoomShuttleResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): LoomShuttleResult {
  const threads: LoomThread[] = files.map((file, i) =>
    analyzeLoomThread(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, LoomThread[]>()
  for (const thread of threads) {
    const dir = thread.file.includes('/') ? thread.file.substring(0, thread.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(thread)
    } else {
      dirMap.set(dir, [thread])
    }
  }

  const workshops: WeavingWorkshop[] = Array.from(dirMap.entries()).map(([dir, ts]) =>
    analyzeWeavingWorkshop(ts, dir),
  )

  const avgWarpTension = threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.warpTension, 0) / threads.length)
  const avgWeaveQuality = threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.weave.quality, 0) / threads.length)
  const avgFabricQuality = threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.fabricQuality, 0) / threads.length)
  const overallWeave = clamp(Math.round(
    (avgWarpTension * 0.25) + (avgWeaveQuality * 0.3) + (avgFabricQuality * 0.3) +
    (threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.shuttle.speed, 0) / threads.length) * 0.15)
  ), 0, 100)

  const guild: WeavingGuild = {
    avgFabricQuality,
    avgWarpTension,
    avgWeaveQuality,
    isWellWoven: overallWeave >= 55,
    overallWeave,
  }

  const stats: LoomShuttleStats = {
    avgFabricQuality,
    avgPatternComplexity: threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.patternComplexity, 0) / threads.length),
    avgShuttleSpeed: threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.shuttleSpeed, 0) / threads.length),
    avgThreadCount: threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.threadCount, 0) / threads.length),
    avgWarpTension,
    avgWeavePattern: avgWeaveQuality,
    bestWoven: findMax(threads, (t) => t.weave.quality),
    fastestShuttle: findMax(threads, (t) => t.shuttleSpeed),
    fineClothCount: threads.filter((t) => t.condition === 'fine-cloth').length,
    frayedFabricCount: threads.filter((t) => t.condition === 'frayed-fabric').length,
    hasCrossedThreadsCount: threads.filter((t) => t.weave.hasCrossedThreads).length,
    hasJammingCount: threads.filter((t) => t.shuttle.hasJamming).length,
    hasMothHolesCount: threads.filter((t) => t.fabric.hasMothHoles).length,
    hasPulledThreadsCount: threads.filter((t) => t.weave.hasPulledThreads).length,
    hasReinforcementCount: threads.filter((t) => t.fabric.hasReinforcement).length,
    hasSnagsCount: threads.filter((t) => t.warp.hasSnags).length,
    homespunCount: threads.filter((t) => t.condition === 'homespun').length,
    isStrongFabricCount: threads.filter((t) => t.fabric.hasStrongFabric).length,
    isSymmetricCount: threads.filter((t) => t.pattern.isSymmetric).length,
    isWellTimedCount: threads.filter((t) => t.heddle.isWellTimed).length,
    jacquardWeaveCount: threads.filter((t) => t.weave.pattern === 'jacquard').length,
    masterTapestryCount: threads.filter((t) => t.condition === 'master-tapestry').length,
    mostComplex: findMax(threads, (t) => t.patternComplexity),
    mostReinforced: findMax(threads, (t) => t.fabric.reinforcementCount),
    overallWeave,
    plainWeaveCount: threads.filter((t) => t.weave.pattern === 'plain').length,
    qualityWeaveCount: threads.filter((t) => t.condition === 'quality-weave').length,
    strongestFabric: findMax(threads, (t) => t.fabricQuality),
    tangledMessCount: threads.filter((t) => t.condition === 'tangled-mess').length,
    totalFiles: files.length,
    totalWorkshops: workshops.length,
    twillWeaveCount: threads.filter((t) => t.weave.pattern === 'twill').length,
    weaverGrade: classifyWeaverGrade(overallWeave),
  }

  const recommendations = generateRecommendations(threads, workshops, guild, stats)

  return {
    guild,
    recommendations,
    stats,
    threads,
    workshops,
  }
}

function findMax(threads: LoomThread[], getter: (t: LoomThread) => number): string {
  if (threads.length === 0) return 'none'
  let best = threads[0] as LoomThread
  let bestVal = getter(best)
  for (let i = 1; i < threads.length; i++) {
    const thread = threads[i] as LoomThread
    const val = getter(thread)
    if (val > bestVal) {
      best = thread
      bestVal = val
    }
  }
  return best?.file ?? ''
}
