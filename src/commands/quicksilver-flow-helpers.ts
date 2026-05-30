// ─── Types ─────────────────────────────────────────────────────────────────

export interface FluidMeasure {
  flow: number
  state: 'liquid-perfection' | 'smooth-flow' | 'proper-viscosity' | 'sluggish' | 'viscous' | 'frozen'
  hasHighFlow: boolean
  hasSmoothFlow: boolean
  hasNoBlockage: boolean
  hasFlowing: boolean
  hasNoStagnation: boolean
  hasRapid: boolean
  hasNoBottleneck: boolean
  hasUnimpeded: boolean
  hasNoDam: boolean
  hasFluid: boolean
  blockageCount: number
  stagnationCount: number
}

export interface AdaptableMeasure {
  flexibility: number
  shape: 'perfectly-adaptable' | 'highly-flexible' | 'properly-elastic' | 'somewhat-rigid' | 'stiff' | 'crystalline'
  hasHighFlexibility: boolean
  hasFlexible: boolean
  hasAdaptable: boolean
  hasNoRigidity: boolean
  hasMorphing: boolean
  hasNoFixedForm: boolean
  hasResponsive: boolean
  hasNoBrittleness: boolean
  hasPlastic: boolean
  hasNoStiffness: boolean
  rigidityCount: number
  fixedFormCount: number
}

export interface SpeedMeasure {
  performance: number
  velocity: 'mercury-speed' | 'fast-flow' | 'proper-pace' | 'moderate-speed' | 'slow-flow' | 'glacial'
  hasHighPerformance: boolean
  hasFast: boolean
  hasEfficient: boolean
  hasNoSlowness: boolean
  hasRapid: boolean
  hasNoBloat: boolean
  hasOptimized: boolean
  hasNoWaste: boolean
  hasQuick: boolean
  hasNoLag: boolean
  slownessCount: number
  bloatCount: number
}

export interface StatefulMeasure {
  transitions: number
  quality: 'seamless-transitions' | 'smooth-changes' | 'proper-handling' | 'jarring-shifts' | 'abrupt' | 'broken-transitions'
  hasHighTransitions: boolean
  hasClean: boolean
  hasProper: boolean
  hasNoGlitches: boolean
  hasGraceful: boolean
  hasNoCrashing: boolean
  hasManaged: boolean
  hasNoLeaks: boolean
  hasPredictable: boolean
  hasNoChaos: boolean
  glitchCount: number
  leakCount: number
}

export interface CohesiveMeasure {
  tension: number
  strength: 'high-tension' | 'strong-bonding' | 'proper-cohesion' | 'weak-bonding' | 'separating' | 'disintegrating'
  hasHighTension: boolean
  hasCohesive: boolean
  hasUnified: boolean
  hasNoFragmentation: boolean
  hasBound: boolean
  hasNoSplitting: boolean
  hasConnected: boolean
  hasNoIsolation: boolean
  hasTight: boolean
  hasNoScattering: boolean
  fragmentationCount: number
  isolationCount: number
}

export interface MergingMeasure {
  quality: number
  fusion: 'perfect-fusion' | 'seamless-merge' | 'proper-integration' | 'partial-bonding' | 'rejection' | 'immiscible'
  hasHighQuality: boolean
  hasCompatible: boolean
  hasCleanInterface: boolean
  hasNoConflict: boolean
  hasIntegratable: boolean
  hasNoRejection: boolean
  hasHarmonious: boolean
  hasNoClash: boolean
  hasMergeable: boolean
  hasNoResistance: boolean
  conflictCount: number
  rejectionCount: number
}

export type DropCondition = 'perfect-quicksilver' | 'flowing-mercury' | 'liquid-metal' | 'sluggish-alloy' | 'cooling-metal' | 'frozen-solid'

export interface MercuryDrop {
  file: string
  fluidity: number
  adaptability: number
  mercurySpeed: number
  stateTransitions: number
  surfaceTension: number
  mergingQuality: number
  fluid: FluidMeasure
  adaptable: AdaptableMeasure
  speed: SpeedMeasure
  stateful: StatefulMeasure
  cohesive: CohesiveMeasure
  merging: MergingMeasure
  condition: DropCondition
  qualityScore: number
}

export type PoolType = 'pure-quicksilver' | 'liquid-mercury' | 'alloy-mix' | 'semi-solid' | 'sludge' | 'solid-metal'
export type PoolCondition = 'pristine-pool' | 'flowing-river' | 'proper-liquid' | 'stagnant-pool' | 'congealing' | 'frozen-solid'

export interface MercuryPool {
  directory: string
  drops: MercuryDrop[]
  avgFluidity: number
  avgSpeed: number
  avgCohesion: number
  perfectQuicksilverCount: number
  frozenSolidCount: number
  flowingMercuryCount: number
  liquidMetalCount: number
  poolType: PoolType
  condition: PoolCondition
}

export interface QuicksilverSystem {
  avgFluidity: number
  avgSpeed: number
  avgCohesion: number
  isFluid: boolean
  overallFluidity: number
}

export type AlchemistGrade = 'grand-alchemist' | 'master-mercurial' | 'skilled-transmuter' | 'apprentice' | 'novice' | 'lead-footed'

export interface QuicksilverFlowStats {
  totalFiles: number
  totalPools: number
  avgFluidity: number
  avgAdaptability: number
  avgMercurySpeed: number
  avgStateTransitions: number
  avgSurfaceTension: number
  avgMergingQuality: number
  perfectQuicksilverCount: number
  flowingMercuryCount: number
  liquidMetalCount: number
  sluggishAlloyCount: number
  coolingMetalCount: number
  frozenSolidCount: number
  hasHighFlowCount: number
  hasHighFlexibilityCount: number
  hasHighPerformanceCount: number
  hasHighTransitionsCount: number
  hasHighTensionCount: number
  hasHighQualityCount: number
  overallFluidity: number
  alchemistGrade: AlchemistGrade
  bestDrop: string
  mostFluid: string
  mostAdaptable: string
  fastest: string
  bestTransitions: string
  mostCohesive: string
}

export interface QuicksilverFlowResult {
  drops: MercuryDrop[]
  pools: MercuryPool[]
  system: QuicksilverSystem
  stats: QuicksilverFlowStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureFluid(content) evaluates code flow */
export function measureFluid(content: string): FluidMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasArrowFn = /=>\s*[^=]/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const blockageMatches = content.match(/\bvar\s+/g)
  const blockageCount = blockageMatches ? blockageMatches.length : 0
  const stagnationMatches = content.match(/\bany\b/g)
  const stagnationCount = stagnationMatches ? stagnationMatches.length : 0

  const hasSmoothFlow = hasAsync && hasArrowFn
  const hasFlowing = hasExport && hasImport
  const hasRapid = hasReturnType && hasNamedExport
  const hasUnimpeded = hasOptionalChaining && hasNullishCoalescing
  const hasFluid = hasConst && hasAsync

  let flow = 0
  if (hasExport) flow += 10
  if (hasImport) flow += 8
  if (hasConst) flow += 10
  if (hasAsync) flow += 10
  if (hasArrowFn) flow += 8
  if (hasReturnType) flow += 8
  if (hasOptionalChaining) flow += 8
  if (hasNullishCoalescing) flow += 7
  if (hasNamedExport) flow += 8
  if (hasSmoothFlow) flow += 5
  if (hasFlowing) flow += 5
  if (hasRapid) flow += 5
  if (hasUnimpeded) flow += 5
  if (hasFluid) flow += 5

  flow = Math.min(100, Math.round(flow))

  let state: FluidMeasure['state'] = 'frozen'
  if (flow >= 85) state = 'liquid-perfection'
  else if (flow >= 70) state = 'smooth-flow'
  else if (flow >= 55) state = 'proper-viscosity'
  else if (flow >= 40) state = 'sluggish'
  else if (flow >= 25) state = 'viscous'

  return {
    flow,
    state,
    hasHighFlow: flow >= 70,
    hasSmoothFlow,
    hasNoBlockage: blockageCount === 0,
    hasFlowing,
    hasNoStagnation: stagnationCount === 0,
    hasRapid,
    hasNoBottleneck: blockageCount === 0,
    hasUnimpeded,
    hasNoDam: blockageCount === 0 && stagnationCount === 0,
    hasFluid,
    blockageCount,
    stagnationCount,
  }
}

/** @example measureAdaptable(content) evaluates code flexibility */
export function measureAdaptable(content: string): AdaptableMeasure {
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasExport = /export\s/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const rigidityMatches = content.match(/\bvar\s+/g)
  const rigidityCount = rigidityMatches ? rigidityMatches.length : 0
  const fixedFormMatches = content.match(/\bany\b/g)
  const fixedFormCount = fixedFormMatches ? fixedFormMatches.length : 0

  const hasFlexible = hasOptionalChaining && hasNullishCoalescing
  const hasAdaptable = hasInterface && hasGenerics
  const hasMorphing = hasOptionalParam && hasDefaultParam
  const hasResponsive = hasTypeAlias && hasEnum
  const hasPlastic = hasExport && hasNamedExport

  let flexibility = 0
  if (hasInterface) flexibility += 10
  if (hasGenerics) flexibility += 10
  if (hasTypeAlias) flexibility += 8
  if (hasOptionalParam) flexibility += 10
  if (hasDefaultParam) flexibility += 8
  if (hasEnum) flexibility += 8
  if (hasOptionalChaining) flexibility += 8
  if (hasNullishCoalescing) flexibility += 8
  if (hasExport) flexibility += 8
  if (hasNamedExport) flexibility += 8
  if (hasFlexible) flexibility += 5
  if (hasAdaptable) flexibility += 5
  if (hasMorphing) flexibility += 5
  if (hasResponsive) flexibility += 5
  if (hasPlastic) flexibility += 5

  flexibility = Math.min(100, Math.round(flexibility))

  let shape: AdaptableMeasure['shape'] = 'crystalline'
  if (flexibility >= 85) shape = 'perfectly-adaptable'
  else if (flexibility >= 70) shape = 'highly-flexible'
  else if (flexibility >= 55) shape = 'properly-elastic'
  else if (flexibility >= 40) shape = 'somewhat-rigid'
  else if (flexibility >= 25) shape = 'stiff'

  return {
    flexibility,
    shape,
    hasHighFlexibility: flexibility >= 70,
    hasFlexible,
    hasAdaptable,
    hasNoRigidity: rigidityCount === 0,
    hasMorphing,
    hasNoFixedForm: fixedFormCount === 0,
    hasResponsive,
    hasNoBrittleness: fixedFormCount === 0,
    hasPlastic,
    hasNoStiffness: rigidityCount === 0 && fixedFormCount === 0,
    rigidityCount,
    fixedFormCount,
  }
}

/** @example measureSpeed(content) evaluates code performance */
export function measureSpeed(content: string): SpeedMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasArrowFn = /=>\s*[^=]/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const slownessMatches = content.match(/\bvar\s+/g)
  const slownessCount = slownessMatches ? slownessMatches.length : 0
  const bloatMatches = content.match(/\bany\b/g)
  const bloatCount = bloatMatches ? bloatMatches.length : 0

  const hasFast = hasAsync && hasArrowFn
  const hasEfficient = hasConst && hasStrictEquality
  const hasRapid = hasReturnType && hasNamedExport
  const hasOptimized = hasOptionalChaining && hasReadonly
  const hasQuick = hasExport && hasImport

  let performance = 0
  if (hasConst) performance += 10
  if (hasReturnType) performance += 10
  if (hasAsync) performance += 8
  if (hasArrowFn) performance += 8
  if (hasStrictEquality) performance += 10
  if (hasExport) performance += 8
  if (hasImport) performance += 8
  if (hasOptionalChaining) performance += 8
  if (hasNamedExport) performance += 8
  if (hasReadonly) performance += 8
  if (hasFast) performance += 5
  if (hasEfficient) performance += 5
  if (hasRapid) performance += 5
  if (hasOptimized) performance += 5
  if (hasQuick) performance += 5

  performance = Math.min(100, Math.round(performance))

  let velocity: SpeedMeasure['velocity'] = 'glacial'
  if (performance >= 85) velocity = 'mercury-speed'
  else if (performance >= 70) velocity = 'fast-flow'
  else if (performance >= 55) velocity = 'proper-pace'
  else if (performance >= 40) velocity = 'moderate-speed'
  else if (performance >= 25) velocity = 'slow-flow'

  return {
    performance,
    velocity,
    hasHighPerformance: performance >= 70,
    hasFast,
    hasEfficient,
    hasNoSlowness: slownessCount === 0,
    hasRapid,
    hasNoBloat: bloatCount === 0,
    hasOptimized,
    hasNoWaste: slownessCount === 0 && bloatCount === 0,
    hasQuick,
    hasNoLag: slownessCount === 0,
    slownessCount,
    bloatCount,
  }
}

/** @example measureStateful(content) evaluates code state management */
export function measureStateful(content: string): StatefulMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasPromise = /\bPromise\b/.test(content)
  const hasReturn = /\breturn\b/.test(content)
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)

  const glitchMatches = content.match(/\bvar\s+/g)
  const glitchCount = glitchMatches ? glitchMatches.length : 0
  const leakMatches = content.match(/\bany\b/g)
  const leakCount = leakMatches ? leakMatches.length : 0

  const hasClean = hasReturn && hasReturnType
  const hasProper = hasTryCatch && hasThrow
  const hasGraceful = hasAsync && hasPromise
  const hasManaged = hasExport && hasConst
  const hasPredictable = hasInterface && hasClass

  let transitions = 0
  if (hasTryCatch) transitions += 10
  if (hasThrow) transitions += 8
  if (hasAsync) transitions += 10
  if (hasPromise) transitions += 8
  if (hasReturn) transitions += 10
  if (hasExport) transitions += 8
  if (hasInterface) transitions += 8
  if (hasClass) transitions += 8
  if (hasConst) transitions += 8
  if (hasReturnType) transitions += 8
  if (hasClean) transitions += 5
  if (hasProper) transitions += 5
  if (hasGraceful) transitions += 5
  if (hasManaged) transitions += 5
  if (hasPredictable) transitions += 5

  transitions = Math.min(100, Math.round(transitions))

  let quality: StatefulMeasure['quality'] = 'broken-transitions'
  if (transitions >= 85) quality = 'seamless-transitions'
  else if (transitions >= 70) quality = 'smooth-changes'
  else if (transitions >= 55) quality = 'proper-handling'
  else if (transitions >= 40) quality = 'jarring-shifts'
  else if (transitions >= 25) quality = 'abrupt'

  return {
    transitions,
    quality,
    hasHighTransitions: transitions >= 70,
    hasClean,
    hasProper,
    hasNoGlitches: glitchCount === 0,
    hasGraceful,
    hasNoCrashing: glitchCount === 0 && leakCount === 0,
    hasManaged,
    hasNoLeaks: leakCount === 0,
    hasPredictable,
    hasNoChaos: glitchCount === 0,
    glitchCount,
    leakCount,
  }
}

/** @example measureCohesive(content) evaluates code cohesion */
export function measureCohesive(content: string): CohesiveMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasReturn = /\breturn\b/.test(content)
  const hasConst = /\bconst\s+/.test(content)

  const fragmentationMatches = content.match(/\bvar\s+/g)
  const fragmentationCount = fragmentationMatches ? fragmentationMatches.length : 0
  const isolationMatches = content.match(/\bany\b/g)
  const isolationCount = isolationMatches ? isolationMatches.length : 0

  const hasCohesive = hasInterface && hasClass
  const hasUnified = hasExport && hasImport
  const hasBound = hasPrivate && hasReadonly
  const hasConnected = hasReturn && hasNamedExport
  const hasTight = hasTypeAlias && hasConst

  let tension = 0
  if (hasExport) tension += 10
  if (hasImport) tension += 10
  if (hasInterface) tension += 8
  if (hasClass) tension += 10
  if (hasPrivate) tension += 8
  if (hasReadonly) tension += 8
  if (hasNamedExport) tension += 8
  if (hasTypeAlias) tension += 8
  if (hasReturn) tension += 8
  if (hasConst) tension += 8
  if (hasCohesive) tension += 5
  if (hasUnified) tension += 5
  if (hasBound) tension += 5
  if (hasConnected) tension += 5
  if (hasTight) tension += 5

  tension = Math.min(100, Math.round(tension))

  let strength: CohesiveMeasure['strength'] = 'disintegrating'
  if (tension >= 85) strength = 'high-tension'
  else if (tension >= 70) strength = 'strong-bonding'
  else if (tension >= 55) strength = 'proper-cohesion'
  else if (tension >= 40) strength = 'weak-bonding'
  else if (tension >= 25) strength = 'separating'

  return {
    tension,
    strength,
    hasHighTension: tension >= 70,
    hasCohesive,
    hasUnified,
    hasNoFragmentation: fragmentationCount === 0,
    hasBound,
    hasNoSplitting: fragmentationCount === 0,
    hasConnected,
    hasNoIsolation: isolationCount === 0,
    hasTight,
    hasNoScattering: fragmentationCount === 0 && isolationCount === 0,
    fragmentationCount,
    isolationCount,
  }
}

/** @example measureMerging(content) evaluates code integration */
export function measureMerging(content: string): MergingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)

  const conflictMatches = content.match(/\bvar\s+/g)
  const conflictCount = conflictMatches ? conflictMatches.length : 0
  const rejectionMatches = content.match(/\bany\b/g)
  const rejectionCount = rejectionMatches ? rejectionMatches.length : 0

  const hasCompatible = hasExport && hasImport
  const hasCleanInterface = hasInterface && hasReturnType
  const hasIntegratable = hasGenerics && hasNamedExport
  const hasHarmonious = hasDocComments && hasTypeAlias
  const hasMergeable = hasAsync && hasConst

  let quality = 0
  if (hasExport) quality += 10
  if (hasImport) quality += 10
  if (hasInterface) quality += 8
  if (hasReturnType) quality += 10
  if (hasGenerics) quality += 8
  if (hasNamedExport) quality += 8
  if (hasDocComments) quality += 8
  if (hasTypeAlias) quality += 8
  if (hasAsync) quality += 8
  if (hasConst) quality += 8
  if (hasCompatible) quality += 5
  if (hasCleanInterface) quality += 5
  if (hasIntegratable) quality += 5
  if (hasHarmonious) quality += 5
  if (hasMergeable) quality += 5

  quality = Math.min(100, Math.round(quality))

  let fusion: MergingMeasure['fusion'] = 'immiscible'
  if (quality >= 85) fusion = 'perfect-fusion'
  else if (quality >= 70) fusion = 'seamless-merge'
  else if (quality >= 55) fusion = 'proper-integration'
  else if (quality >= 40) fusion = 'partial-bonding'
  else if (quality >= 25) fusion = 'rejection'

  return {
    quality,
    fusion,
    hasHighQuality: quality >= 70,
    hasCompatible,
    hasCleanInterface,
    hasNoConflict: conflictCount === 0,
    hasIntegratable,
    hasNoRejection: rejectionCount === 0,
    hasHarmonious,
    hasNoClash: conflictCount === 0 && rejectionCount === 0,
    hasMergeable,
    hasNoResistance: conflictCount === 0,
    conflictCount,
    rejectionCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'perfect-quicksilver' */
export function classifyCondition(score: number): DropCondition {
  if (score >= 85) return 'perfect-quicksilver'
  if (score >= 70) return 'flowing-mercury'
  if (score >= 55) return 'liquid-metal'
  if (score >= 40) return 'sluggish-alloy'
  if (score >= 25) return 'cooling-metal'
  return 'frozen-solid'
}

/** @example classifyPoolType(drops) returns pool classification */
export function classifyPoolType(drops: MercuryDrop[]): PoolType {
  if (drops.length === 0) return 'solid-metal'
  const avgQs = drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length
  const perfectCount = drops.filter((d) => d.condition === 'perfect-quicksilver').length
  const ratio = perfectCount / drops.length
  if (avgQs >= 75 && ratio >= 0.5) return 'pure-quicksilver'
  if (avgQs >= 60) return 'liquid-mercury'
  if (avgQs >= 45) return 'alloy-mix'
  if (avgQs >= 30) return 'semi-solid'
  if (avgQs >= 15) return 'sludge'
  return 'solid-metal'
}

/** @example classifyPoolCondition(avgQs) returns pool condition */
export function classifyPoolCondition(avgQs: number): PoolCondition {
  if (avgQs >= 75) return 'pristine-pool'
  if (avgQs >= 60) return 'flowing-river'
  if (avgQs >= 45) return 'proper-liquid'
  if (avgQs >= 30) return 'stagnant-pool'
  if (avgQs >= 15) return 'congealing'
  return 'frozen-solid'
}

/** @example classifyAlchemistGrade(80) returns 'grand-alchemist' */
export function classifyAlchemistGrade(avgFluidity: number): AlchemistGrade {
  if (avgFluidity >= 80) return 'grand-alchemist'
  if (avgFluidity >= 65) return 'master-mercurial'
  if (avgFluidity >= 50) return 'skilled-transmuter'
  if (avgFluidity >= 35) return 'apprentice'
  if (avgFluidity >= 20) return 'novice'
  return 'lead-footed'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeMercuryDrop(content, filePath) evaluates single file */
export function analyzeMercuryDrop(content: string, filePath: string): MercuryDrop {
  const fluid = measureFluid(content)
  const adaptable = measureAdaptable(content)
  const speed = measureSpeed(content)
  const stateful = measureStateful(content)
  const cohesive = measureCohesive(content)
  const merging = measureMerging(content)

  const qualityScore = Math.round(
    fluid.flow * 0.2 +
    adaptable.flexibility * 0.15 +
    speed.performance * 0.15 +
    stateful.transitions * 0.15 +
    cohesive.tension * 0.15 +
    merging.quality * 0.2,
  )

  return {
    file: filePath,
    fluidity: fluid.flow,
    adaptability: adaptable.flexibility,
    mercurySpeed: speed.performance,
    stateTransitions: stateful.transitions,
    surfaceTension: cohesive.tension,
    mergingQuality: merging.quality,
    fluid,
    adaptable,
    speed,
    stateful,
    cohesive,
    merging,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeMercuryPool(drops, dirPath) evaluates directory */
export function analyzeMercuryPool(drops: MercuryDrop[], dirPath: string): MercuryPool {
  if (drops.length === 0) {
    return {
      directory: dirPath,
      drops: [],
      avgFluidity: 0,
      avgSpeed: 0,
      avgCohesion: 0,
      perfectQuicksilverCount: 0,
      frozenSolidCount: 0,
      flowingMercuryCount: 0,
      liquidMetalCount: 0,
      poolType: 'solid-metal',
      condition: 'frozen-solid',
    }
  }

  const avgFluidity = Math.round(drops.reduce((s, d) => s + d.fluidity, 0) / drops.length)
  const avgSpeed = Math.round(drops.reduce((s, d) => s + d.mercurySpeed, 0) / drops.length)
  const avgCohesion = Math.round(drops.reduce((s, d) => s + d.surfaceTension, 0) / drops.length)

  const perfectQuicksilverCount = drops.filter((d) => d.condition === 'perfect-quicksilver').length
  const frozenSolidCount = drops.filter((d) => d.condition === 'frozen-solid').length
  const flowingMercuryCount = drops.filter((d) => d.condition === 'flowing-mercury').length
  const liquidMetalCount = drops.filter((d) => d.condition === 'liquid-metal').length

  const avgQs = drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length

  return {
    directory: dirPath,
    drops,
    avgFluidity,
    avgSpeed,
    avgCohesion,
    perfectQuicksilverCount,
    frozenSolidCount,
    flowingMercuryCount,
    liquidMetalCount,
    poolType: classifyPoolType(drops),
    condition: classifyPoolCondition(avgQs),
  }
}

/** @example generateRecommendations(drops, pools, system, stats) generates advice */
export function generateRecommendations(
  drops: MercuryDrop[],
  pools: MercuryPool[],
  system: QuicksilverSystem,
  stats: QuicksilverFlowStats,
): string[] {
  const recs: string[] = []

  if (stats.avgFluidity < 50) {
    recs.push('Improve fluidity with async/await, arrow functions, and const declarations')
  }
  if (stats.avgAdaptability < 50) {
    recs.push('Increase adaptability with interfaces, generics, and optional parameters')
  }
  if (stats.avgMercurySpeed < 50) {
    recs.push('Boost mercury speed with strict equality, return types, and readonly properties')
  }
  if (stats.avgStateTransitions < 50) {
    recs.push('Enhance state transitions with try/catch, error handling, and typed returns')
  }
  if (stats.avgSurfaceTension < 50) {
    recs.push('Strengthen surface tension with exports, imports, and cohesive class designs')
  }
  if (stats.avgMergingQuality < 50) {
    recs.push('Improve merging quality with clean exports, generics, and documentation')
  }
  if (stats.frozenSolidCount > 0) {
    recs.push(`${String(stats.frozenSolidCount)} file(s) are frozen solid — consider significant refactoring`)
  }
  if (system.overallFluidity < 40) {
    recs.push('Overall system fluidity is low — prioritize flow and integration improvements')
  }
  if (pools.length > 0 && pools.every((p) => p.poolType === 'solid-metal' || p.poolType === 'sludge')) {
    recs.push('All pools are degraded — consider a major quality improvement effort')
  }

  const frozen = drops.filter((d) => d.condition === 'frozen-solid')
  if (frozen.length > 0 && frozen.length <= 3) {
    const names = frozen.map((d) => d.file).join(', ')
    recs.push(`Thaw these frozen files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code flows like quicksilver! Perfect fluidity and seamless integration')
  }

  return Array.from(new Set(recs))
}

/** @example buildQuicksilverFlowResult(files, contents, options) orchestrates analysis */
export function buildQuicksilverFlowResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): QuicksilverFlowResult {
  const drops = files.map((file, i) => analyzeMercuryDrop(contents[i] ?? '', file))

  const pMap = new Map<string, MercuryDrop[]>()
  for (const drop of drops) {
    const dir = drop.file.includes('/') ? drop.file.split('/').slice(0, -1).join('/') : '.'
    const existing = pMap.get(dir)
    if (existing) {
      existing.push(drop)
    } else {
      pMap.set(dir, [drop])
    }
  }

  const pools = Array.from(pMap.entries()).map(([dir, dirDrops]) =>
    analyzeMercuryPool(dirDrops, dir),
  )

  const totalFiles = drops.length
  const avgFluidity = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.fluidity, 0) / totalFiles) : 0
  const avgAdaptability = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.adaptability, 0) / totalFiles) : 0
  const avgMercurySpeed = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.mercurySpeed, 0) / totalFiles) : 0
  const avgStateTransitions = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.stateTransitions, 0) / totalFiles) : 0
  const avgSurfaceTension = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.surfaceTension, 0) / totalFiles) : 0
  const avgMergingQuality = totalFiles > 0 ? Math.round(drops.reduce((s, d) => s + d.mergingQuality, 0) / totalFiles) : 0

  const avgSpeed = avgMercurySpeed
  const avgCohesion = avgSurfaceTension

  const overallFluidity = totalFiles > 0
    ? Math.round((avgFluidity + avgSpeed + avgCohesion) / 3)
    : 0

  const system: QuicksilverSystem = {
    avgFluidity,
    avgSpeed,
    avgCohesion,
    isFluid: avgFluidity >= 60,
    overallFluidity,
  }

  const bestDrop = totalFiles > 0
    ? drops.reduce((best, d) => (d.qualityScore > best.qualityScore ? d : best), drops[0] as typeof drops[number]).file
    : ''
  const mostFluid = totalFiles > 0
    ? drops.reduce((best, d) => (d.fluidity > best.fluidity ? d : best), drops[0] as typeof drops[number]).file
    : ''
  const mostAdaptable = totalFiles > 0
    ? drops.reduce((best, d) => (d.adaptability > best.adaptability ? d : best), drops[0] as typeof drops[number]).file
    : ''
  const fastest = totalFiles > 0
    ? drops.reduce((best, d) => (d.mercurySpeed > best.mercurySpeed ? d : best), drops[0] as typeof drops[number]).file
    : ''
  const bestTransitions = totalFiles > 0
    ? drops.reduce((best, d) => (d.stateTransitions > best.stateTransitions ? d : best), drops[0] as typeof drops[number]).file
    : ''
  const mostCohesive = totalFiles > 0
    ? drops.reduce((best, d) => (d.surfaceTension > best.surfaceTension ? d : best), drops[0] as typeof drops[number]).file
    : ''

  const stats: QuicksilverFlowStats = {
    totalFiles,
    totalPools: pools.length,
    avgFluidity,
    avgAdaptability,
    avgMercurySpeed,
    avgStateTransitions,
    avgSurfaceTension,
    avgMergingQuality,
    perfectQuicksilverCount: drops.filter((d) => d.condition === 'perfect-quicksilver').length,
    flowingMercuryCount: drops.filter((d) => d.condition === 'flowing-mercury').length,
    liquidMetalCount: drops.filter((d) => d.condition === 'liquid-metal').length,
    sluggishAlloyCount: drops.filter((d) => d.condition === 'sluggish-alloy').length,
    coolingMetalCount: drops.filter((d) => d.condition === 'cooling-metal').length,
    frozenSolidCount: drops.filter((d) => d.condition === 'frozen-solid').length,
    hasHighFlowCount: drops.filter((d) => d.fluid.hasHighFlow).length,
    hasHighFlexibilityCount: drops.filter((d) => d.adaptable.hasHighFlexibility).length,
    hasHighPerformanceCount: drops.filter((d) => d.speed.hasHighPerformance).length,
    hasHighTransitionsCount: drops.filter((d) => d.stateful.hasHighTransitions).length,
    hasHighTensionCount: drops.filter((d) => d.cohesive.hasHighTension).length,
    hasHighQualityCount: drops.filter((d) => d.merging.hasHighQuality).length,
    overallFluidity,
    alchemistGrade: classifyAlchemistGrade(overallFluidity),
    bestDrop,
    mostFluid,
    mostAdaptable,
    fastest,
    bestTransitions,
    mostCohesive,
  }

  const recommendations = generateRecommendations(drops, pools, system, stats)

  return { drops, pools, system, stats, recommendations }
}
