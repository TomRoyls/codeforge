// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Current = 'effortless-rapids' | 'smooth-flow' | 'proper-current' | 'turbulent-water' | 'stagnant-pool' | 'no-flow'
export type Step = 'crystal-cascade' | 'clear-steps' | 'proper-falls' | 'murky-rapids' | 'dark-current' | 'no-cascade'
export type Pool = 'bottomless-pool' | 'deep-lake' | 'proper-depth' | 'shallow-pond' | 'surface-puddle' | 'no-depth'
export type Mist = 'crystal-mist' | 'clean-spray' | 'proper-mist' | 'murky-spray' | 'dirty-water' | 'no-mist'
export type River = 'ancient-river' | 'wise-stream' | 'proper-creek' | 'young-brook' | 'drying-creek' | 'no-wisdom'
export type DropCondition = 'jade-masterpiece' | 'emerald-falls' | 'proper-waterfall' | 'murky-cascade' | 'trickle' | 'dry-bed'
export type BasinType = 'emerald-lake' | 'jade-pool' | 'proper-basin' | 'small-pond' | 'puddle' | 'no-basin'
export type BasinCondition = 'magnificent-falls' | 'beautiful-cascade' | 'proper-waterfall' | 'murky-stream' | 'dried-river' | 'void'
export type NavigatorGrade = 'master-navigator' | 'river-guide' | 'skilled-rafter' | 'apprentice' | 'novice' | 'landlubber'

export interface FlowingMeasure {
  grace: number
  current: Current
  hasHighGrace: boolean
  hasSmoothFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasGraceful: boolean
  hasNoJerky: boolean
  bottleneckCount: number
  tangledCount: number
}

export interface CascadingMeasure {
  clarity: number
  step: Step
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasStepByStep: boolean
  hasNoMonolithic: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasUnderstandable: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface PoolingMeasure {
  depth: number
  pool: Pool
  hasHighDepth: boolean
  hasWellManaged: boolean
  hasNoOverComplex: boolean
  hasAbstracted: boolean
  hasNoConcreteSoup: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasEncapsulated: boolean
  hasNoLeaky: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasScalable: boolean
  overComplexCount: number
  leakyCount: number
}

export interface CleansingMeasure {
  purity: number
  mist: Mist
  hasHighPurity: boolean
  hasCleanOutput: boolean
  hasNoSideEffects: boolean
  hasPure: boolean
  hasNoImpure: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasNoDeadCode: boolean
  hasNoHacky: boolean
  hasNoDuplicates: boolean
  hasTidy: boolean
  hasNoMessy: boolean
  hasPristine: boolean
  sideEffectCount: number
  hackyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  river: River
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  adHocCount: number
  hackyCount: number
}

export interface JadeDrop {
  file: string
  flowGrace: number
  cascadeClarity: number
  poolDepth: number
  mistPurity: number
  riverWisdom: number
  flowing: FlowingMeasure
  cascading: CascadingMeasure
  pooling: PoolingMeasure
  cleansing: CleansingMeasure
  knowing: KnowingMeasure
  condition: DropCondition
  qualityScore: number
}

export interface JadeBasin {
  directory: string
  drops: JadeDrop[]
  avgGrace: number
  avgClarity: number
  avgWisdom: number
  jadeMasterpieceCount: number
  dryBedCount: number
  basinType: BasinType
  condition: BasinCondition
}

export interface JadeWaterfallResult {
  drops: JadeDrop[]
  basins: JadeBasin[]
  river: {
    avgGrace: number
    avgClarity: number
    avgWisdom: number
    isJade: boolean
    overallFlow: number
  }
  stats: {
    totalFiles: number
    totalBasins: number
    avgFlowGrace: number
    avgCascadeClarity: number
    avgPoolDepth: number
    avgMistPurity: number
    avgRiverWisdom: number
    jadeMasterpieceCount: number
    emeraldFallsCount: number
    properWaterfallCount: number
    murkyCascadeCount: number
    trickleCount: number
    dryBedCount: number
    hasHighGraceCount: number
    hasHighClarityCount: number
    hasHighDepthCount: number
    hasHighPurityCount: number
    hasHighWisdomCount: number
    overallFlow: number
    navigatorGrade: NavigatorGrade
    bestDrop: string
    mostGraceful: string
    clearest: string
    deepest: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureFlowing ────────────────────────────────────────────────

/**
 * @example measureFlowing('export function foo(x: string): string { return x }')
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasFunction = hasPattern(content, /\bfunction\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasDestructure = hasPattern(content, /\{[^}]+\}\s*=/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDeepNesting = countPattern(content, /\bif\s*\(/) > 5
  const hasCallbackHell = countPattern(content, /function\s*\(/) > 4
  const hasDuplicateLogic = countPattern(content, /\bfor\s*\(/) > 3

  if (hasExport) score += 8
  if (hasImport) score += 8
  if (hasFunction) score += 6
  if (hasArrow) score += 6
  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasReturn) score += 4
  if (hasConst) score += 4
  if (hasPipeline) score += 10
  if (hasOptionalChain) score += 4
  if (hasNullish) score += 4
  if (hasDestructure) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 5, 15)
  if (hasDeepNesting) score -= 8
  if (hasCallbackHell) score -= 6
  if (hasDuplicateLogic) score -= 4

  const grace = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bottleneckCount = (hasDeepNesting ? 1 : 0) + (hasCallbackHell ? 1 : 0)
  const tangledCount = hasDuplicateLogic ? 1 : 0

  return {
    grace,
    current: classifyCurrent(grace),
    hasHighGrace: grace >= 80,
    hasSmoothFlow: hasPipeline || (hasAsync && hasAwait),
    hasNoBottlenecks: !hasDeepNesting,
    hasStreamlined: hasArrow || hasPipeline,
    hasNoCircuits: !hasCallbackHell,
    hasDirectPaths: hasReturn && !hasDeepNesting,
    hasNoIndirection: !hasCallbackHell && !hasDeepNesting,
    hasEfficient: hasPipeline || hasOptionalChain,
    hasNoWasteful: !hasDuplicateLogic,
    hasCleanPipelines: hasPipeline && !hasDeepNesting,
    hasNoTangled: !hasDuplicateLogic,
    hasGraceful: grace >= 70,
    hasNoJerky: !hasVar,
    bottleneckCount,
    tangledCount,
  }
}

// ─── measureCascading ──────────────────────────────────────────────

/**
 * @example measureCascading('export function foo(): string { return "a" }')
 */
export function measureCascading(content: string): CascadingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasWith = hasPattern(content, /\bwith\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasGodFile = content.split('\n').length > 300

  if (hasExport) score += 8
  if (hasNamed) score += 6
  if (hasDoc) score += 10
  if (hasReturnType) score += 8
  if (hasType) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasEnum) score += 4
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasOptional) score += 4

  if (hasEval) score -= 15
  if (hasWith) score -= 10
  if (hasDebugger) score -= 10
  if (hasGodFile) score -= 8

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasWith ? 1 : 0)
  const obfuscatedCount = hasDebugger ? 1 : 0

  return {
    clarity,
    step: classifyStep(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport || hasConst,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && !hasWith,
    hasClear: hasReturnType || hasConst,
    hasNoObfuscated: !hasDebugger,
    hasTransparent: hasExport && (hasInterface || hasType),
    hasNoHidden: !hasEval,
    hasStepByStep: !hasGodFile,
    hasNoMonolithic: !hasGodFile,
    hasVisible: hasExport,
    hasNoInvisible: !hasWith,
    hasUnderstandable: hasInterface || hasEnum,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measurePooling ────────────────────────────────────────────────

/**
 * @example measurePooling('export interface Foo<T> { readonly id: string }')
 */
export function measurePooling(content: string): PoolingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)

  const hasGodFile = content.split('\n').length > 300
  const hasGlobalLeak = hasPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasTooManyParams = countPattern(content, /\(/) > 15

  if (hasExport) score += 8
  if (hasImport) score += 8
  if (hasInterface) score += 8
  if (hasClass) score += 8
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4
  if (hasType) score += 6
  if (hasEnum) score += 4

  if (hasGodFile) score -= 8
  if (hasGlobalLeak) score -= 8
  if (hasAny) score -= 8
  if (hasTooManyParams) score -= 4

  const depth = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const overComplexCount = (hasGodFile ? 1 : 0) + (hasTooManyParams ? 1 : 0)
  const leakyCount = (hasGlobalLeak ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    depth,
    pool: classifyPool(depth),
    hasHighDepth: depth >= 80,
    hasWellManaged: !hasGodFile && !hasAny,
    hasNoOverComplex: !hasGodFile && !hasTooManyParams,
    hasAbstracted: hasInterface || hasAbstract,
    hasNoConcreteSoup: !hasGodFile,
    hasLayered: hasExtends || hasImplements,
    hasNoFlat: hasInterface || hasClass || hasEnum,
    hasEncapsulated: hasPrivate || hasReadonly,
    hasNoLeaky: !hasGlobalLeak && !hasAny,
    hasModular: hasExport && hasImport,
    hasNoMonolithic: !hasGodFile,
    hasScalable: depth >= 70,
    overComplexCount,
    leakyCount,
  }
}

// ─── measureCleansing ──────────────────────────────────────────────

/**
 * @example measureCleansing('export function add(a: number, b: number): number { return a + b }')
 */
export function measureCleansing(content: string): CleansingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasPurePattern = hasPattern(content, /\breturn\b/) && !hasPattern(content, /\bconsole\b/)

  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasConsole = countPattern(content, /\bconsole\./)

  if (hasExport) score += 8
  if (hasConst) score += 4
  if (hasReturnType) score += 8
  if (hasType) score += 6
  if (hasInterface) score += 6
  if (hasEnum) score += 4
  if (hasReadonly) score += 4
  if (hasArrow) score += 4
  if (hasNamed) score += 6
  if (hasPurePattern) score += 6

  if (hasEval) score -= 15
  if (hasAny) score -= 8
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)
  if (hasDebugger) score -= 10
  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasTodo) score -= 4
  if (hasConsole > 2) score -= 4

  const purity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const sideEffectCount = (hasEval ? 1 : 0) + (hasConsole > 2 ? 1 : 0)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    purity,
    mist: classifyMist(purity),
    hasHighPurity: purity >= 80,
    hasCleanOutput: !hasEval && hasConsole <= 2,
    hasNoSideEffects: !hasEval,
    hasPure: hasPurePattern,
    hasNoImpure: !hasAny && !hasEval,
    hasDeterministic: !hasEval && !hasPattern(content, /\bMath\.random\b/),
    hasNoRandom: !hasPattern(content, /\bMath\.random\b/),
    hasNoDeadCode: !hasDebugger,
    hasNoHacky: hasHackyCast === 0 && !hasDebugger,
    hasNoDuplicates: !hasPattern(content, /\bvar\b/),
    hasTidy: !hasTodo && !hasDebugger,
    hasNoMessy: !hasVar && !hasTodo,
    hasPristine: purity >= 75,
    sideEffectCount,
    hackyCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('export interface Foo { bar: string }')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasAdHoc = countPattern(content, /\bvar\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)

  if (hasDoc) score += 10
  if (hasInterface) score += 8
  if (hasType) score += 8
  if (hasEnum) score += 6
  if (hasClass) score += 8
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasPrivate) score += 4
  if (hasAsync) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4

  if (hasAdHoc > 0) score -= Math.min(hasAdHoc * 5, 15)
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 15)
  if (hasDebugger) score -= 10
  if (hasTodo) score -= 5

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = Math.min(hasAdHoc, 5)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    wisdom,
    river: classifyRiver(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasPattern(content, /\bvar\b/),
    hasPatterned: (hasExtends && hasImplements) || hasAbstract,
    hasNoReinvented: !hasTodo,
    hasPrincipled: hasExport && hasConst && !hasPattern(content, /\bas\s+any\b/),
    hasNoHacky: !hasPattern(content, /\bas\s+any\b/) && !hasDebugger,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasProven: hasExtends || hasImplements,
    hasNoExperimental: !hasTodo,
    hasEstablished: wisdom >= 70,
    adHocCount,
    hackyCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyCurrent(grace: number): Current {
  if (grace >= 90) return 'effortless-rapids'
  if (grace >= 75) return 'smooth-flow'
  if (grace >= 60) return 'proper-current'
  if (grace >= 40) return 'turbulent-water'
  if (grace >= 20) return 'stagnant-pool'
  return 'no-flow'
}

function classifyStep(clarity: number): Step {
  if (clarity >= 90) return 'crystal-cascade'
  if (clarity >= 75) return 'clear-steps'
  if (clarity >= 60) return 'proper-falls'
  if (clarity >= 40) return 'murky-rapids'
  if (clarity >= 20) return 'dark-current'
  return 'no-cascade'
}

function classifyPool(depth: number): Pool {
  if (depth >= 90) return 'bottomless-pool'
  if (depth >= 75) return 'deep-lake'
  if (depth >= 60) return 'proper-depth'
  if (depth >= 40) return 'shallow-pond'
  if (depth >= 20) return 'surface-puddle'
  return 'no-depth'
}

function classifyMist(purity: number): Mist {
  if (purity >= 90) return 'crystal-mist'
  if (purity >= 75) return 'clean-spray'
  if (purity >= 60) return 'proper-mist'
  if (purity >= 40) return 'murky-spray'
  if (purity >= 20) return 'dirty-water'
  return 'no-mist'
}

function classifyRiver(wisdom: number): River {
  if (wisdom >= 90) return 'ancient-river'
  if (wisdom >= 75) return 'wise-stream'
  if (wisdom >= 60) return 'proper-creek'
  if (wisdom >= 40) return 'young-brook'
  if (wisdom >= 20) return 'drying-creek'
  return 'no-wisdom'
}

export function classifyDropCondition(qualityScore: number): DropCondition {
  if (qualityScore >= 90) return 'jade-masterpiece'
  if (qualityScore >= 75) return 'emerald-falls'
  if (qualityScore >= 60) return 'proper-waterfall'
  if (qualityScore >= 40) return 'murky-cascade'
  if (qualityScore >= 20) return 'trickle'
  return 'dry-bed'
}

export function classifyBasinType(drops: JadeDrop[]): BasinType {
  if (drops.length === 0) return 'no-basin'
  const avgQs = drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length
  const masterpieceRatio = drops.filter(d => d.condition === 'jade-masterpiece').length / drops.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'emerald-lake'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'jade-pool'
  if (avgQs >= 55) return 'proper-basin'
  if (avgQs >= 35) return 'small-pond'
  if (avgQs >= 15) return 'puddle'
  return 'no-basin'
}

export function classifyBasinCondition(avgGrace: number): BasinCondition {
  if (avgGrace >= 85) return 'magnificent-falls'
  if (avgGrace >= 70) return 'beautiful-cascade'
  if (avgGrace >= 55) return 'proper-waterfall'
  if (avgGrace >= 35) return 'murky-stream'
  if (avgGrace >= 15) return 'dried-river'
  return 'void'
}

export function classifyNavigatorGrade(avgFlow: number): NavigatorGrade {
  if (avgFlow >= 85) return 'master-navigator'
  if (avgFlow >= 70) return 'river-guide'
  if (avgFlow >= 55) return 'skilled-rafter'
  if (avgFlow >= 40) return 'apprentice'
  if (avgFlow >= 20) return 'novice'
  return 'landlubber'
}

// ─── analyzeJadeDrop ───────────────────────────────────────────────

/**
 * @example analyzeJadeDrop(content, 'src/foo.ts')
 */
export function analyzeJadeDrop(content: string, filePath: string): JadeDrop {
  const flowing = measureFlowing(content)
  const cascading = measureCascading(content)
  const pooling = measurePooling(content)
  const cleansing = measureCleansing(content)
  const knowing = measureKnowing(content)

  const flowGrace = flowing.grace
  const cascadeClarity = cascading.clarity
  const poolDepth = pooling.depth
  const mistPurity = cleansing.purity
  const riverWisdom = knowing.wisdom

  const qualityScore = Math.round(
    flowGrace * 0.2 +
    cascadeClarity * 0.2 +
    poolDepth * 0.2 +
    mistPurity * 0.2 +
    riverWisdom * 0.2,
  )

  return {
    file: filePath,
    flowGrace,
    cascadeClarity,
    poolDepth,
    mistPurity,
    riverWisdom,
    flowing,
    cascading,
    pooling,
    cleansing,
    knowing,
    condition: classifyDropCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeJadeBasin ──────────────────────────────────────────────

/**
 * @example analyzeJadeBasin(drops, 'src')
 */
export function analyzeJadeBasin(drops: JadeDrop[], dirPath: string): JadeBasin {
  if (drops.length === 0) {
    return {
      directory: dirPath,
      drops: [],
      avgGrace: 0,
      avgClarity: 0,
      avgWisdom: 0,
      jadeMasterpieceCount: 0,
      dryBedCount: 0,
      basinType: 'no-basin',
      condition: 'void',
    }
  }

  const avgGrace = Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length)
  const avgClarity = Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / drops.length)
  const avgWisdom = Math.round(drops.reduce((s, d) => s + d.riverWisdom, 0) / drops.length)
  const jadeMasterpieceCount = drops.filter(d => d.condition === 'jade-masterpiece').length
  const dryBedCount = drops.filter(d => d.condition === 'dry-bed').length

  return {
    directory: dirPath,
    drops,
    avgGrace,
    avgClarity,
    avgWisdom,
    jadeMasterpieceCount,
    dryBedCount,
    basinType: classifyBasinType(drops),
    condition: classifyBasinCondition(avgGrace),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(drops, basins, river, stats)
 */
export function generateRecommendations(
  drops: JadeDrop[],
  basins: JadeBasin[],
  river: JadeWaterfallResult['river'],
  stats: JadeWaterfallResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallFlow >= 85 && stats.dryBedCount === 0) {
    recs.push('Jade perfection achieved — the waterfall flows with cosmic grace')
    return recs
  }

  if (stats.avgFlowGrace < 60) {
    recs.push('Smooth the flow — add pipelines (map/filter/reduce), async/await, and arrow functions')
  }
  if (stats.avgCascadeClarity < 60) {
    recs.push('Clarify the cascade — add documentation, return types, and named exports')
  }
  if (stats.avgPoolDepth < 60) {
    recs.push('Deepen the pool — add interfaces, abstractions, and layered architecture')
  }
  if (stats.avgMistPurity < 60) {
    recs.push('Purify the mist — remove eval, as any, debugger, and code smells')
  }
  if (stats.avgRiverWisdom < 60) {
    recs.push('Gain river wisdom — add JSDoc documentation and proven patterns')
  }

  if (stats.dryBedCount > 0) {
    const dryFiles = drops.filter(d => d.condition === 'dry-bed').map(d => d.file)
    if (dryFiles.length <= 3) {
      recs.push(`Dry beds detected: ${dryFiles.join(', ')} — these need water`)
    } else {
      recs.push(`${dryFiles.length} dry beds detected — they need water`)
    }
  }

  if (basins.length > 1) {
    const weakBasins = basins.filter(b => b.condition === 'murky-stream' || b.condition === 'dried-river')
    if (weakBasins.length > 0) {
      recs.push(`${weakBasins.length} basin(s) have murky or dried conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The jade waterfall flows steadily — maintain current flow quality')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildJadeWaterfallResult ───────────────────────────────────────

/**
 * @example buildJadeWaterfallResult(['a.ts'], [content])
 */
export async function buildJadeWaterfallResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeWaterfallResult> {
  const drops: JadeDrop[] = files.map((file, i) =>
    analyzeJadeDrop(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, JadeDrop[]>()
  for (const drop of drops) {
    const dir = path.dirname(drop.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(drop)
    } else {
      dirMap.set(dir, [drop])
    }
  }

  const basins: JadeBasin[] = Array.from(dirMap.entries()).map(([dir, dirDrops]) =>
    analyzeJadeBasin(dirDrops, dir),
  )

  const avgFlowGrace = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length)
    : 0
  const avgCascadeClarity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / drops.length)
    : 0
  const avgPoolDepth = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.poolDepth, 0) / drops.length)
    : 0
  const avgMistPurity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.mistPurity, 0) / drops.length)
    : 0
  const avgRiverWisdom = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.riverWisdom, 0) / drops.length)
    : 0

  const overallFlow = Math.round(
    (avgFlowGrace + avgCascadeClarity + avgRiverWisdom) / 3,
  )

  const river = {
    avgGrace: avgFlowGrace,
    avgClarity: avgCascadeClarity,
    avgWisdom: avgRiverWisdom,
    isJade: overallFlow >= 80,
    overallFlow,
  }

  const bestDrop = drops.length > 0
    ? drops.reduce((best, d) => d.qualityScore > best.qualityScore ? d : best).file
    : ''
  const mostGraceful = drops.length > 0
    ? drops.reduce((best, d) => d.flowGrace > best.flowGrace ? d : best).file
    : ''
  const clearest = drops.length > 0
    ? drops.reduce((best, d) => d.cascadeClarity > best.cascadeClarity ? d : best).file
    : ''
  const deepest = drops.length > 0
    ? drops.reduce((best, d) => d.poolDepth > best.poolDepth ? d : best).file
    : ''
  const wisest = drops.length > 0
    ? drops.reduce((best, d) => d.riverWisdom > best.riverWisdom ? d : best).file
    : ''

  const stats = {
    totalFiles: drops.length,
    totalBasins: basins.length,
    avgFlowGrace,
    avgCascadeClarity,
    avgPoolDepth,
    avgMistPurity,
    avgRiverWisdom,
    jadeMasterpieceCount: drops.filter(d => d.condition === 'jade-masterpiece').length,
    emeraldFallsCount: drops.filter(d => d.condition === 'emerald-falls').length,
    properWaterfallCount: drops.filter(d => d.condition === 'proper-waterfall').length,
    murkyCascadeCount: drops.filter(d => d.condition === 'murky-cascade').length,
    trickleCount: drops.filter(d => d.condition === 'trickle').length,
    dryBedCount: drops.filter(d => d.condition === 'dry-bed').length,
    hasHighGraceCount: drops.filter(d => d.flowing.hasHighGrace).length,
    hasHighClarityCount: drops.filter(d => d.cascading.hasHighClarity).length,
    hasHighDepthCount: drops.filter(d => d.pooling.hasHighDepth).length,
    hasHighPurityCount: drops.filter(d => d.cleansing.hasHighPurity).length,
    hasHighWisdomCount: drops.filter(d => d.knowing.hasHighWisdom).length,
    overallFlow,
    navigatorGrade: classifyNavigatorGrade(overallFlow),
    bestDrop,
    mostGraceful,
    clearest,
    deepest,
    wisest,
  }

  const recommendations = generateRecommendations(drops, basins, river, { ...stats, recommendations: [] } as JadeWaterfallResult['stats'])

  return {
    drops,
    basins,
    river,
    stats,
    recommendations,
  }
}
