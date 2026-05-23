// ─── Types ─────────────────────────────────────────────────────────────────

export interface ConductiveMeasure {
  efficiency: number
  grade: 'superconductor' | 'high-conductivity' | 'proper-copper' | 'resistive' | 'semiconductor' | 'insulator'
  hasHighEfficiency: boolean
  hasSmoothFlow: boolean
  hasNoBottleneck: boolean
  hasEfficient: boolean
  hasNoResistance: boolean
  hasFast: boolean
  hasNoBlocking: boolean
  hasStreamlined: boolean
  hasNoDetour: boolean
  hasDirect: boolean
  bottleneckCount: number
  blockingCount: number
}

export interface SignalMeasure {
  integrity: number
  quality: 'crystal-clear' | 'high-fidelity' | 'proper-signal' | 'some-noise' | 'noisy' | 'static'
  hasHighIntegrity: boolean
  hasPureData: boolean
  hasNoCorruption: boolean
  hasAccurate: boolean
  hasNoDistortion: boolean
  hasFaithful: boolean
  hasNoMutation: boolean
  hasClean: boolean
  hasNoPollution: boolean
  hasPreserved: boolean
  corruptionCount: number
  distortionCount: number
}

export interface InsulationMeasure {
  quality: number
  rating: 'triple-shielded' | 'double-insulated' | 'proper-sheath' | 'single-layer' | 'bare-wire' | 'exposed'
  hasHighQuality: boolean
  hasEncapsulated: boolean
  hasProperBoundaries: boolean
  hasNoLeaking: boolean
  hasProtected: boolean
  hasNoExposure: boolean
  hasSealed: boolean
  hasNoBleed: boolean
  hasIsolated: boolean
  hasNoShort: boolean
  leakingCount: number
  bleedCount: number
}

export interface CircuitMeasure {
  completeness: number
  connection: 'complete-circuit' | 'well-connected' | 'proper-wiring' | 'partial-circuit' | 'open-circuit' | 'disconnected'
  hasHighCompleteness: boolean
  hasCompletePaths: boolean
  hasNoDeadEnds: boolean
  hasProperReturn: boolean
  hasNoOrphan: boolean
  hasConnected: boolean
  hasNoIsolation: boolean
  hasFlowing: boolean
  hasNoBreak: boolean
  hasComplete: boolean
  deadEndCount: number
  orphanCount: number
}

export interface GaugeMeasure {
  capacity: number
  size: 'heavy-gauge' | 'proper-size' | 'right-gauge' | 'undersized' | 'thin-wire' | 'filament'
  hasHighCapacity: boolean
  hasAdequate: boolean
  hasNoOverload: boolean
  hasProperSizing: boolean
  hasNoUndersized: boolean
  hasScalable: boolean
  hasNoLimiting: boolean
  hasRightSized: boolean
  hasNoOverkill: boolean
  hasCapable: boolean
  overloadCount: number
  undersizedCount: number
}

export interface FlexibleMeasure {
  adaptability: number
  bend: 'highly-flexible' | 'proper-flex' | 'reasonable-bend' | 'stiff' | 'rigid' | 'brittle'
  hasHighAdaptability: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasNoRigidity: boolean
  hasExtensible: boolean
  hasNoBrittleness: boolean
  hasModular: boolean
  hasNoMonolith: boolean
  hasVersatile: boolean
  hasNoFixed: boolean
  rigidityCount: number
  brittlenessCount: number
}

export type SegmentCondition = 'perfect-conductor' | 'quality-wire' | 'proper-cable' | 'fraying-wire' | 'corroded-wire' | 'broken-circuit'

export interface WireSegment {
  file: string
  conductivity: number
  signalIntegrity: number
  insulationQuality: number
  circuitCompleteness: number
  wireGauge: number
  flexibility: number
  conductive: ConductiveMeasure
  signal: SignalMeasure
  insulation: InsulationMeasure
  circuit: CircuitMeasure
  gauge: GaugeMeasure
  flexible: FlexibleMeasure
  condition: SegmentCondition
  qualityScore: number
}

export type HarnessType = 'premium-harness' | 'proper-wiring' | 'standard-cable' | 'jury-rigged' | 'spliced-wires' | 'cut-cords'
export type HarnessCondition = 'perfectly-wired' | 'well-harnessed' | 'properly-connected' | 'loose-connections' | 'frayed-harness' | 'severed'

export interface WireHarness {
  directory: string
  segments: WireSegment[]
  avgConductivity: number
  avgCompleteness: number
  avgFlexibility: number
  perfectConductorCount: number
  brokenCircuitCount: number
  qualityWireCount: number
  properCableCount: number
  harnessType: HarnessType
  condition: HarnessCondition
}

export interface WireNetwork {
  avgConductivity: number
  avgCompleteness: number
  avgFlexibility: number
  isConductive: boolean
  overallConductivity: number
}

export type ElectricianGrade = 'master-electrician' | 'expert-wirer' | 'skilled-technician' | 'apprentice' | 'novice' | 'short-circuiter'

export interface CopperWireStats {
  totalFiles: number
  totalHarnesses: number
  avgConductivity: number
  avgSignalIntegrity: number
  avgInsulationQuality: number
  avgCircuitCompleteness: number
  avgWireGauge: number
  avgFlexibility: number
  perfectConductorCount: number
  qualityWireCount: number
  properCableCount: number
  frayingWireCount: number
  corrodedWireCount: number
  brokenCircuitCount: number
  hasHighEfficiencyCount: number
  hasHighIntegrityCount: number
  hasHighQualityCount: number
  hasHighCompletenessCount: number
  hasHighCapacityCount: number
  hasHighAdaptabilityCount: number
  overallConductivity: number
  electricianGrade: ElectricianGrade
  bestSegment: string
  mostConductive: string
  bestSignal: string
  bestInsulated: string
  mostComplete: string
  mostFlexible: string
}

export interface CopperWireResult {
  segments: WireSegment[]
  harnesses: WireHarness[]
  network: WireNetwork
  stats: CopperWireStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureConductive(content) evaluates code data flow */
export function measureConductive(content: string): ConductiveMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasArrowFn = /=>\s*[^=]/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)

  const bottleneckMatches = content.match(/\bvar\s+/g)
  const bottleneckCount = bottleneckMatches ? bottleneckMatches.length : 0
  const blockingMatches = content.match(/\bany\b/g)
  const blockingCount = blockingMatches ? blockingMatches.length : 0

  const hasSmoothFlow = hasAsync && hasArrowFn
  const hasEfficient = hasConst && hasStrictEquality
  const hasFast = hasReturnType && hasNamedExport
  const hasStreamlined = hasOptionalChaining && hasNullishCoalescing
  const hasDirect = hasExport && hasImport

  let efficiency = 0
  if (hasExport) efficiency += 10
  if (hasImport) efficiency += 8
  if (hasConst) efficiency += 10
  if (hasReturnType) efficiency += 10
  if (hasAsync) efficiency += 8
  if (hasArrowFn) efficiency += 8
  if (hasNamedExport) efficiency += 8
  if (hasOptionalChaining) efficiency += 8
  if (hasStrictEquality) efficiency += 10
  if (hasNullishCoalescing) efficiency += 7
  if (hasSmoothFlow) efficiency += 5
  if (hasEfficient) efficiency += 5
  if (hasFast) efficiency += 5
  if (hasStreamlined) efficiency += 5
  if (hasDirect) efficiency += 5

  efficiency = Math.min(100, Math.round(efficiency))

  let grade: ConductiveMeasure['grade'] = 'insulator'
  if (efficiency >= 85) grade = 'superconductor'
  else if (efficiency >= 70) grade = 'high-conductivity'
  else if (efficiency >= 55) grade = 'proper-copper'
  else if (efficiency >= 40) grade = 'resistive'
  else if (efficiency >= 25) grade = 'semiconductor'

  return {
    efficiency,
    grade,
    hasHighEfficiency: efficiency >= 70,
    hasSmoothFlow,
    hasNoBottleneck: bottleneckCount === 0,
    hasEfficient,
    hasNoResistance: bottleneckCount === 0,
    hasFast,
    hasNoBlocking: blockingCount === 0,
    hasStreamlined,
    hasNoDetour: bottleneckCount === 0 && blockingCount === 0,
    hasDirect,
    bottleneckCount,
    blockingCount,
  }
}

/** @example measureSignal(content) evaluates code data quality */
export function measureSignal(content: string): SignalMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const corruptionMatches = content.match(/\bvar\s+/g)
  const corruptionCount = corruptionMatches ? corruptionMatches.length : 0
  const distortionMatches = content.match(/\bany\b/g)
  const distortionCount = distortionMatches ? distortionMatches.length : 0

  const hasPureData = hasConst && hasStrictEquality
  const hasAccurate = hasReturnType && hasTypeAnnotation
  const hasFaithful = hasReadonly && hasConst
  const hasClean = hasInterface && hasNamedExport
  const hasPreserved = hasGenerics && hasOptionalChaining

  let integrity = 0
  if (hasConst) integrity += 10
  if (hasReturnType) integrity += 10
  if (hasTypeAnnotation) integrity += 8
  if (hasStrictEquality) integrity += 10
  if (hasReadonly) integrity += 8
  if (hasInterface) integrity += 10
  if (hasGenerics) integrity += 8
  if (hasOptionalChaining) integrity += 8
  if (hasNamedExport) integrity += 8
  if (hasDocComments) integrity += 8
  if (hasPureData) integrity += 5
  if (hasAccurate) integrity += 5
  if (hasFaithful) integrity += 5
  if (hasClean) integrity += 5
  if (hasPreserved) integrity += 5

  integrity = Math.min(100, Math.round(integrity))

  let quality: SignalMeasure['quality'] = 'static'
  if (integrity >= 85) quality = 'crystal-clear'
  else if (integrity >= 70) quality = 'high-fidelity'
  else if (integrity >= 55) quality = 'proper-signal'
  else if (integrity >= 40) quality = 'some-noise'
  else if (integrity >= 25) quality = 'noisy'

  return {
    integrity,
    quality,
    hasHighIntegrity: integrity >= 70,
    hasPureData,
    hasNoCorruption: corruptionCount === 0,
    hasAccurate,
    hasNoDistortion: distortionCount === 0,
    hasFaithful,
    hasNoMutation: corruptionCount === 0,
    hasClean,
    hasNoPollution: corruptionCount === 0 && distortionCount === 0,
    hasPreserved,
    corruptionCount,
    distortionCount,
  }
}

/** @example measureInsulation(content) evaluates code encapsulation */
export function measureInsulation(content: string): InsulationMeasure {
  const hasExport = /export\s/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)

  const leakingMatches = content.match(/\bvar\s+/g)
  const leakingCount = leakingMatches ? leakingMatches.length : 0
  const bleedMatches = content.match(/\bany\b/g)
  const bleedCount = bleedMatches ? bleedMatches.length : 0

  const hasEncapsulated = hasClass && hasPrivate
  const hasProperBoundaries = hasInterface && hasNamedExport
  const hasProtected = hasReadonly && hasPrivate
  const hasSealed = hasEnum && hasReadonly
  const hasIsolated = hasGenerics && hasTypeAlias

  let quality = 0
  if (hasExport) quality += 10
  if (hasClass) quality += 10
  if (hasInterface) quality += 8
  if (hasPrivate) quality += 10
  if (hasReadonly) quality += 8
  if (hasGenerics) quality += 8
  if (hasTypeAlias) quality += 8
  if (hasNamedExport) quality += 8
  if (hasEnum) quality += 8
  if (hasReturnType) quality += 8
  if (hasEncapsulated) quality += 5
  if (hasProperBoundaries) quality += 5
  if (hasProtected) quality += 5
  if (hasSealed) quality += 5
  if (hasIsolated) quality += 5

  quality = Math.min(100, Math.round(quality))

  let rating: InsulationMeasure['rating'] = 'exposed'
  if (quality >= 85) rating = 'triple-shielded'
  else if (quality >= 70) rating = 'double-insulated'
  else if (quality >= 55) rating = 'proper-sheath'
  else if (quality >= 40) rating = 'single-layer'
  else if (quality >= 25) rating = 'bare-wire'

  return {
    quality,
    rating,
    hasHighQuality: quality >= 70,
    hasEncapsulated,
    hasProperBoundaries,
    hasNoLeaking: leakingCount === 0,
    hasProtected,
    hasNoExposure: leakingCount === 0 && bleedCount === 0,
    hasSealed,
    hasNoBleed: bleedCount === 0,
    hasIsolated,
    hasNoShort: leakingCount === 0,
    leakingCount,
    bleedCount,
  }
}

/** @example measureCircuit(content) evaluates code connectivity */
export function measureCircuit(content: string): CircuitMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasReturn = /\breturn\b/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasPromise = /\bPromise\b/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)

  const deadEndMatches = content.match(/\bvar\s+/g)
  const deadEndCount = deadEndMatches ? deadEndMatches.length : 0
  const orphanMatches = content.match(/\bany\b/g)
  const orphanCount = orphanMatches ? orphanMatches.length : 0

  const hasCompletePaths = hasReturn && hasNamedExport
  const hasProperReturn = hasTryCatch && hasThrow
  const hasConnected = hasExport && hasImport
  const hasFlowing = hasAsync && hasPromise
  const hasComplete = hasClass && hasInterface

  let completeness = 0
  if (hasExport) completeness += 10
  if (hasImport) completeness += 10
  if (hasReturn) completeness += 8
  if (hasAsync) completeness += 8
  if (hasTryCatch) completeness += 10
  if (hasThrow) completeness += 8
  if (hasNamedExport) completeness += 8
  if (hasInterface) completeness += 8
  if (hasPromise) completeness += 8
  if (hasClass) completeness += 8
  if (hasCompletePaths) completeness += 5
  if (hasProperReturn) completeness += 5
  if (hasConnected) completeness += 5
  if (hasFlowing) completeness += 5
  if (hasComplete) completeness += 5

  completeness = Math.min(100, Math.round(completeness))

  let connection: CircuitMeasure['connection'] = 'disconnected'
  if (completeness >= 85) connection = 'complete-circuit'
  else if (completeness >= 70) connection = 'well-connected'
  else if (completeness >= 55) connection = 'proper-wiring'
  else if (completeness >= 40) connection = 'partial-circuit'
  else if (completeness >= 25) connection = 'open-circuit'

  return {
    completeness,
    connection,
    hasHighCompleteness: completeness >= 70,
    hasCompletePaths,
    hasNoDeadEnds: deadEndCount === 0,
    hasProperReturn,
    hasNoOrphan: orphanCount === 0,
    hasConnected,
    hasNoIsolation: deadEndCount === 0 && orphanCount === 0,
    hasFlowing,
    hasNoBreak: deadEndCount === 0,
    hasComplete,
    deadEndCount,
    orphanCount,
  }
}

/** @example measureGauge(content) evaluates code capacity */
export function measureGauge(content: string): GaugeMeasure {
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)

  const overloadMatches = content.match(/\bvar\s+/g)
  const overloadCount = overloadMatches ? overloadMatches.length : 0
  const undersizedMatches = content.match(/\bany\b/g)
  const undersizedCount = undersizedMatches ? undersizedMatches.length : 0

  const hasAdequate = hasConst && hasReturnType
  const hasProperSizing = hasInterface && hasGenerics
  const hasScalable = hasOptionalParam && hasDefaultParam
  const hasRightSized = hasEnum && hasReadonly
  const hasCapable = hasNamedExport && hasTypeAlias

  let capacity = 0
  if (hasInterface) capacity += 10
  if (hasGenerics) capacity += 10
  if (hasTypeAlias) capacity += 8
  if (hasEnum) capacity += 8
  if (hasOptionalParam) capacity += 8
  if (hasDefaultParam) capacity += 8
  if (hasReadonly) capacity += 8
  if (hasNamedExport) capacity += 8
  if (hasAsync) capacity += 8
  if (hasConst) capacity += 8
  if (hasAdequate) capacity += 5
  if (hasProperSizing) capacity += 5
  if (hasScalable) capacity += 5
  if (hasRightSized) capacity += 5
  if (hasCapable) capacity += 5

  capacity = Math.min(100, Math.round(capacity))

  let size: GaugeMeasure['size'] = 'filament'
  if (capacity >= 85) size = 'heavy-gauge'
  else if (capacity >= 70) size = 'proper-size'
  else if (capacity >= 55) size = 'right-gauge'
  else if (capacity >= 40) size = 'undersized'
  else if (capacity >= 25) size = 'thin-wire'

  return {
    capacity,
    size,
    hasHighCapacity: capacity >= 70,
    hasAdequate,
    hasNoOverload: overloadCount === 0,
    hasProperSizing,
    hasNoUndersized: undersizedCount === 0,
    hasScalable,
    hasNoLimiting: overloadCount === 0 && undersizedCount === 0,
    hasRightSized,
    hasNoOverkill: overloadCount === 0,
    hasCapable,
    overloadCount,
    undersizedCount,
  }
}

/** @example measureFlexible(content) evaluates code adaptability */
export function measureFlexible(content: string): FlexibleMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)

  const rigidityMatches = content.match(/\bvar\s+/g)
  const rigidityCount = rigidityMatches ? rigidityMatches.length : 0
  const brittlenessMatches = content.match(/\bany\b/g)
  const brittlenessCount = brittlenessMatches ? brittlenessMatches.length : 0

  const hasAdaptable = hasInterface && hasGenerics
  const hasFlexible = hasOptionalChaining && hasNullishCoalescing
  const hasExtensible = hasTypeAlias && hasEnum
  const hasModular = hasExport && hasNamedExport
  const hasVersatile = hasOptionalParam && hasDefaultParam

  let adaptability = 0
  if (hasExport) adaptability += 10
  if (hasInterface) adaptability += 10
  if (hasGenerics) adaptability += 10
  if (hasTypeAlias) adaptability += 8
  if (hasOptionalChaining) adaptability += 8
  if (hasOptionalParam) adaptability += 8
  if (hasDefaultParam) adaptability += 8
  if (hasEnum) adaptability += 8
  if (hasNamedExport) adaptability += 8
  if (hasNullishCoalescing) adaptability += 7
  if (hasAdaptable) adaptability += 5
  if (hasFlexible) adaptability += 5
  if (hasExtensible) adaptability += 5
  if (hasModular) adaptability += 5
  if (hasVersatile) adaptability += 5

  adaptability = Math.min(100, Math.round(adaptability))

  let bend: FlexibleMeasure['bend'] = 'brittle'
  if (adaptability >= 85) bend = 'highly-flexible'
  else if (adaptability >= 70) bend = 'proper-flex'
  else if (adaptability >= 55) bend = 'reasonable-bend'
  else if (adaptability >= 40) bend = 'stiff'
  else if (adaptability >= 25) bend = 'rigid'

  return {
    adaptability,
    bend,
    hasHighAdaptability: adaptability >= 70,
    hasAdaptable,
    hasFlexible,
    hasNoRigidity: rigidityCount === 0,
    hasExtensible,
    hasNoBrittleness: brittlenessCount === 0,
    hasModular,
    hasNoMonolith: rigidityCount === 0 && brittlenessCount === 0,
    hasVersatile,
    hasNoFixed: rigidityCount === 0,
    rigidityCount,
    brittlenessCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'perfect-conductor' */
export function classifyCondition(score: number): SegmentCondition {
  if (score >= 85) return 'perfect-conductor'
  if (score >= 70) return 'quality-wire'
  if (score >= 55) return 'proper-cable'
  if (score >= 40) return 'fraying-wire'
  if (score >= 25) return 'corroded-wire'
  return 'broken-circuit'
}

/** @example classifyHarnessType(segments) returns harness classification */
export function classifyHarnessType(segments: WireSegment[]): HarnessType {
  if (segments.length === 0) return 'cut-cords'
  const avgQs = segments.reduce((s, r) => s + r.qualityScore, 0) / segments.length
  const perfectCount = segments.filter((s) => s.condition === 'perfect-conductor').length
  const ratio = perfectCount / segments.length
  if (avgQs >= 75 && ratio >= 0.5) return 'premium-harness'
  if (avgQs >= 60) return 'proper-wiring'
  if (avgQs >= 45) return 'standard-cable'
  if (avgQs >= 30) return 'jury-rigged'
  if (avgQs >= 15) return 'spliced-wires'
  return 'cut-cords'
}

/** @example classifyHarnessCondition(avgQs) returns harness condition */
export function classifyHarnessCondition(avgQs: number): HarnessCondition {
  if (avgQs >= 75) return 'perfectly-wired'
  if (avgQs >= 60) return 'well-harnessed'
  if (avgQs >= 45) return 'properly-connected'
  if (avgQs >= 30) return 'loose-connections'
  if (avgQs >= 15) return 'frayed-harness'
  return 'severed'
}

/** @example classifyElectricianGrade(80) returns 'master-electrician' */
export function classifyElectricianGrade(avgConductivity: number): ElectricianGrade {
  if (avgConductivity >= 80) return 'master-electrician'
  if (avgConductivity >= 65) return 'expert-wirer'
  if (avgConductivity >= 50) return 'skilled-technician'
  if (avgConductivity >= 35) return 'apprentice'
  if (avgConductivity >= 20) return 'novice'
  return 'short-circuiter'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeWireSegment(content, filePath) evaluates single file */
export function analyzeWireSegment(content: string, filePath: string): WireSegment {
  const conductive = measureConductive(content)
  const signal = measureSignal(content)
  const insulation = measureInsulation(content)
  const circuit = measureCircuit(content)
  const gauge = measureGauge(content)
  const flexible = measureFlexible(content)

  const qualityScore = Math.round(
    conductive.efficiency * 0.2 +
    signal.integrity * 0.15 +
    insulation.quality * 0.15 +
    circuit.completeness * 0.15 +
    gauge.capacity * 0.15 +
    flexible.adaptability * 0.2,
  )

  return {
    file: filePath,
    conductivity: conductive.efficiency,
    signalIntegrity: signal.integrity,
    insulationQuality: insulation.quality,
    circuitCompleteness: circuit.completeness,
    wireGauge: gauge.capacity,
    flexibility: flexible.adaptability,
    conductive,
    signal,
    insulation,
    circuit,
    gauge,
    flexible,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeWireHarness(segments, dirPath) evaluates directory */
export function analyzeWireHarness(segments: WireSegment[], dirPath: string): WireHarness {
  if (segments.length === 0) {
    return {
      directory: dirPath,
      segments: [],
      avgConductivity: 0,
      avgCompleteness: 0,
      avgFlexibility: 0,
      perfectConductorCount: 0,
      brokenCircuitCount: 0,
      qualityWireCount: 0,
      properCableCount: 0,
      harnessType: 'cut-cords',
      condition: 'severed',
    }
  }

  const avgConductivity = Math.round(segments.reduce((s, r) => s + r.conductivity, 0) / segments.length)
  const avgCompleteness = Math.round(segments.reduce((s, r) => s + r.circuitCompleteness, 0) / segments.length)
  const avgFlexibility = Math.round(segments.reduce((s, r) => s + r.flexibility, 0) / segments.length)

  const perfectConductorCount = segments.filter((s) => s.condition === 'perfect-conductor').length
  const brokenCircuitCount = segments.filter((s) => s.condition === 'broken-circuit').length
  const qualityWireCount = segments.filter((s) => s.condition === 'quality-wire').length
  const properCableCount = segments.filter((s) => s.condition === 'proper-cable').length

  const avgQs = segments.reduce((s, r) => s + r.qualityScore, 0) / segments.length

  return {
    directory: dirPath,
    segments,
    avgConductivity,
    avgCompleteness,
    avgFlexibility,
    perfectConductorCount,
    brokenCircuitCount,
    qualityWireCount,
    properCableCount,
    harnessType: classifyHarnessType(segments),
    condition: classifyHarnessCondition(avgQs),
  }
}

/** @example generateRecommendations(segments, harnesses, network, stats) generates advice */
export function generateRecommendations(
  segments: WireSegment[],
  harnesses: WireHarness[],
  network: WireNetwork,
  stats: CopperWireStats,
): string[] {
  const recs: string[] = []

  if (stats.avgConductivity < 50) {
    recs.push('Improve conductivity with exports, imports, const, and async patterns')
  }
  if (stats.avgSignalIntegrity < 50) {
    recs.push('Boost signal integrity with strict equality, readonly, and type annotations')
  }
  if (stats.avgInsulationQuality < 50) {
    recs.push('Enhance insulation quality with classes, private fields, and readonly properties')
  }
  if (stats.avgCircuitCompleteness < 50) {
    recs.push('Improve circuit completeness with try/catch, exports, and return paths')
  }
  if (stats.avgWireGauge < 50) {
    recs.push('Upgrade wire gauge with generics, enums, and optional parameters')
  }
  if (stats.avgFlexibility < 50) {
    recs.push('Increase flexibility with interfaces, generics, and optional chaining')
  }
  if (stats.brokenCircuitCount > 0) {
    recs.push(`${String(stats.brokenCircuitCount)} file(s) have broken circuits — consider significant refactoring`)
  }
  if (network.overallConductivity < 40) {
    recs.push('Overall network conductivity is low — prioritize data flow and connectivity')
  }
  if (harnesses.length > 0 && harnesses.every((h) => h.harnessType === 'cut-cords' || h.harnessType === 'spliced-wires')) {
    recs.push('All harnesses are degraded — consider a major quality improvement effort')
  }

  const broken = segments.filter((s) => s.condition === 'broken-circuit')
  if (broken.length > 0 && broken.length <= 3) {
    const names = broken.map((s) => s.file).join(', ')
    recs.push(`Repair these broken circuits: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a perfect conductor! Data flows with minimal resistance')
  }

  return Array.from(new Set(recs))
}

/** @example buildCopperWireResult(files, contents, options) orchestrates analysis */
export function buildCopperWireResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): CopperWireResult {
  const segments = files.map((file, i) => analyzeWireSegment(contents[i] ?? '', file))

  const hMap = new Map<string, WireSegment[]>()
  for (const seg of segments) {
    const dir = seg.file.includes('/') ? seg.file.split('/').slice(0, -1).join('/') : '.'
    const existing = hMap.get(dir)
    if (existing) {
      existing.push(seg)
    } else {
      hMap.set(dir, [seg])
    }
  }

  const harnesses = Array.from(hMap.entries()).map(([dir, dirSegments]) =>
    analyzeWireHarness(dirSegments, dir),
  )

  const totalFiles = segments.length
  const avgConductivity = totalFiles > 0 ? Math.round(segments.reduce((s, r) => s + r.conductivity, 0) / totalFiles) : 0
  const avgSignalIntegrity = totalFiles > 0 ? Math.round(segments.reduce((s, r) => s + r.signalIntegrity, 0) / totalFiles) : 0
  const avgInsulationQuality = totalFiles > 0 ? Math.round(segments.reduce((s, r) => s + r.insulationQuality, 0) / totalFiles) : 0
  const avgCircuitCompleteness = totalFiles > 0 ? Math.round(segments.reduce((s, r) => s + r.circuitCompleteness, 0) / totalFiles) : 0
  const avgWireGauge = totalFiles > 0 ? Math.round(segments.reduce((s, r) => s + r.wireGauge, 0) / totalFiles) : 0
  const avgFlexibility = totalFiles > 0 ? Math.round(segments.reduce((s, r) => s + r.flexibility, 0) / totalFiles) : 0

  const overallConductivity = totalFiles > 0
    ? Math.round((avgConductivity + avgCircuitCompleteness + avgFlexibility) / 3)
    : 0

  const network: WireNetwork = {
    avgConductivity,
    avgCompleteness: avgCircuitCompleteness,
    avgFlexibility,
    isConductive: avgConductivity >= 60,
    overallConductivity,
  }

  const bestSegment = totalFiles > 0
    ? segments.reduce((best, s) => (s.qualityScore > best.qualityScore ? s : best), segments[0]).file
    : ''
  const mostConductive = totalFiles > 0
    ? segments.reduce((best, s) => (s.conductivity > best.conductivity ? s : best), segments[0]).file
    : ''
  const bestSignal = totalFiles > 0
    ? segments.reduce((best, s) => (s.signalIntegrity > best.signalIntegrity ? s : best), segments[0]).file
    : ''
  const bestInsulated = totalFiles > 0
    ? segments.reduce((best, s) => (s.insulationQuality > best.insulationQuality ? s : best), segments[0]).file
    : ''
  const mostComplete = totalFiles > 0
    ? segments.reduce((best, s) => (s.circuitCompleteness > best.circuitCompleteness ? s : best), segments[0]).file
    : ''
  const mostFlexible = totalFiles > 0
    ? segments.reduce((best, s) => (s.flexibility > best.flexibility ? s : best), segments[0]).file
    : ''

  const stats: CopperWireStats = {
    totalFiles,
    totalHarnesses: harnesses.length,
    avgConductivity,
    avgSignalIntegrity,
    avgInsulationQuality,
    avgCircuitCompleteness,
    avgWireGauge,
    avgFlexibility,
    perfectConductorCount: segments.filter((s) => s.condition === 'perfect-conductor').length,
    qualityWireCount: segments.filter((s) => s.condition === 'quality-wire').length,
    properCableCount: segments.filter((s) => s.condition === 'proper-cable').length,
    frayingWireCount: segments.filter((s) => s.condition === 'fraying-wire').length,
    corrodedWireCount: segments.filter((s) => s.condition === 'corroded-wire').length,
    brokenCircuitCount: segments.filter((s) => s.condition === 'broken-circuit').length,
    hasHighEfficiencyCount: segments.filter((s) => s.conductive.hasHighEfficiency).length,
    hasHighIntegrityCount: segments.filter((s) => s.signal.hasHighIntegrity).length,
    hasHighQualityCount: segments.filter((s) => s.insulation.hasHighQuality).length,
    hasHighCompletenessCount: segments.filter((s) => s.circuit.hasHighCompleteness).length,
    hasHighCapacityCount: segments.filter((s) => s.gauge.hasHighCapacity).length,
    hasHighAdaptabilityCount: segments.filter((s) => s.flexible.hasHighAdaptability).length,
    overallConductivity,
    electricianGrade: classifyElectricianGrade(overallConductivity),
    bestSegment,
    mostConductive,
    bestSignal,
    bestInsulated,
    mostComplete,
    mostFlexible,
  }

  const recommendations = generateRecommendations(segments, harnesses, network, stats)

  return { segments, harnesses, network, stats, recommendations }
}
