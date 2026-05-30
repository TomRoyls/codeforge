// ─── Interfaces ──────────────────────────────────────────

export interface PulseMeasure {
  intensity: number
  period: number
  isStable: boolean
  isVariable: boolean
  hasGlitch: boolean
  hasNulling: boolean
  hasGiantPulse: boolean
  glitchCount: number
  giantPulseCount: number
  pulseType: 'millisecond-pulsar' | 'normal-pulsar' | 'magnetar' | 'x-ray-pulsar' | 'dead-star' | 'black-dwarf'
}

export interface MagneticMeasure {
  fieldStrength: number
  hasStrongField: boolean
  hasWeakField: boolean
  hasReversal: boolean
  hasMultipole: boolean
  isAligned: boolean
  isMisaligned: boolean
  poleCount: number
}

export interface EmissionMeasure {
  spectrum: number
  hasRadioEmission: boolean
  hasXRayEmission: boolean
  hasGammaRay: boolean
  hasOpticalEmission: boolean
  hasInfraredEmission: boolean
  emissionTypes: string[]
  dominantEmission: string
}

export interface BurstMeasure {
  frequency: number
  hasRegularBursts: boolean
  hasIrregularBursts: boolean
  hasSoftGammaRepeater: boolean
  hasAnomalousXRay: boolean
  isQuiescent: boolean
  isActive: boolean
  isHyperactive: boolean
}

export interface EnergyMeasure {
  output: number
  efficiency: number
  hasHighLuminosity: boolean
  hasLowLuminosity: boolean
  hasAccretion: boolean
  hasOutflow: boolean
  luminosityClass: 'supergiant' | 'giant' | 'dwarf' | 'subdwarf' | 'white-dwarf' | 'brown-dwarf'
}

export interface RadiationMeasure {
  level: number
  hasIonizingRadiation: boolean
  hasNonIonizing: boolean
  hasShielding: boolean
  hasRadiationBelts: boolean
  isSafe: boolean
  isDangerous: boolean
  shieldingCount: number
  beltCount: number
}

export interface NebulaMeasure {
  hasRemnant: boolean
  hasProtoplanetary: boolean
  isClear: boolean
  hasDebris: boolean
  debrisCount: number
}

export interface PulsarNode {
  file: string
  pulseIntensity: number
  magneticFieldStrength: number
  emissionSpectrum: number
  burstFrequency: number
  energyOutput: number
  radiationLevel: number
  pulse: PulseMeasure
  magnetic: MagneticMeasure
  emission: EmissionMeasure
  burst: BurstMeasure
  energy: EnergyMeasure
  radiation: RadiationMeasure
  nebula: NebulaMeasure
  condition: 'magnetar-burst' | 'pulsar-beam' | 'steady-star' | 'red-dwarf' | 'brown-dwarf' | 'dead-star'
  qualityScore: number
}

export interface PulsarCluster {
  directory: string
  nodes: PulsarNode[]
  avgPulseIntensity: number
  avgMagneticField: number
  avgEnergyOutput: number
  magnetarCount: number
  deadStarCount: number
  activeCount: number
  safeCount: number
  clusterType: 'globular-cluster' | 'open-cluster' | 'star-forming-region' | 'supernova-remnant' | 'dark-nebula' | 'void'
  condition: 'brilliant-cluster' | 'active-cluster' | 'quiet-cluster' | 'dim-cluster' | 'dark-cluster' | 'empty-space'
}

export interface MagnetarGalaxy {
  avgPulseIntensity: number
  avgMagneticField: number
  avgEnergyOutput: number
  isEnergetic: boolean
  overallEnergy: number
}

export interface MagnetarPulseStats {
  totalFiles: number
  totalClusters: number
  avgPulseIntensity: number
  avgMagneticFieldStrength: number
  avgEmissionSpectrum: number
  avgBurstFrequency: number
  avgEnergyOutput: number
  avgRadiationLevel: number
  magnetarBurstCount: number
  pulsarBeamCount: number
  steadyStarCount: number
  redDwarfCount: number
  brownDwarfCount: number
  deadStarCount: number
  millisecondPulsarCount: number
  normalPulsarCount: number
  magnetarTypeCount: number
  hasGlitchCount: number
  hasGiantPulseCount: number
  hasStrongFieldCount: number
  hasReversalCount: number
  hasGammaRayCount: number
  hasShieldingCount: number
  isSafeCount: number
  isDangerousCount: number
  highLuminosityCount: number
  lowLuminosityCount: number
  overallEnergy: number
  astrophysicistGrade: 'pulsar-astronomer' | 'radio-astronomer' | 'xray-astronomer' | 'amateur' | 'stargazer' | 'blind'
  mostIntense: string
  strongestField: string
  mostProductive: string
  safestNode: string
  mostDangerous: string
  mostVariable: string
}

export interface MagnetarPulseResult {
  nodes: PulsarNode[]
  clusters: PulsarCluster[]
  galaxy: MagnetarGalaxy
  stats: MagnetarPulseStats
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

function countTryCatch(content: string): number {
  return (content.match(/\btry\s*\{/g) || []).length
}

function countThrow(content: string): number {
  return (content.match(/\bthrow\s/g) || []).length
}

function countErrorHandling(content: string): number {
  return countTryCatch(content) + countThrow(content) + (content.match(/\.catch\s*\(/g) || []).length
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

function countConditions(content: string): number {
  return (content.match(/\bif\s*\(/g) || []).length
}

function countLoops(content: string): number {
  return (content.match(/\b(for|while)\s*\(/g) || []).length
}

function countAsyncAwait(content: string): number {
  return (content.match(/\basync\s/g) || []).length + (content.match(/\bawait\s/g) || []).length
}

function countConsoleLog(content: string): number {
  return (content.match(/\bconsole\.\w+\s*\(/g) || []).length
}

function countReturnStatements(content: string): number {
  return (content.match(/\breturn\b/g) || []).length
}

function countComments(content: string): number {
  return (content.match(/\/\/.*$/gm) || []).length + (content.match(/\/\*[\s\S]*?\*\//g) || []).length
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

function countDeprecated(content: string): number {
  return (content.match(/@deprecated\b/g) || []).length
}

// ─── Measure functions ────────────────────────────────────

/**
 * @example
 * const pulse = measurePulse('export function a() {}\nexport function b() {}')
 * // pulse.intensity > 0
 */
export function measurePulse(content: string): PulseMeasure {
  const loc = countLines(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const conditions = countConditions(content)
  const loops = countLoops(content)

  const intensity = loc === 0 ? 0 : clamp(Math.round(
    (functions * 10) + (exports * 8) + (conditions * 5) + (loops * 3)
  ), 0, 100)

  const period = loc === 0 ? 100 : clamp(Math.round(
    100 - Math.abs(functions - exports) * 10 - (conditions > loops * 3 ? 15 : 0)
  ), 0, 100)

  const glitchCount = countTODO(content)
  const giantPulseCount = functions >= 10 ? 1 : 0
  const hasGlitch = glitchCount > 0
  const hasGiantPulse = giantPulseCount > 0
  const hasNulling = loc > 5 && functions === 0
  const isStable = period >= 60 && !hasGlitch
  const isVariable = !isStable || hasNulling

  let pulseType: PulseMeasure['pulseType']
  if (intensity >= 80 && exports >= 5) pulseType = 'magnetar'
  else if (intensity >= 60 && isStable) pulseType = 'millisecond-pulsar'
  else if (intensity >= 40) pulseType = 'normal-pulsar'
  else if (intensity >= 25) pulseType = 'x-ray-pulsar'
  else if (intensity >= 10) pulseType = 'dead-star'
  else pulseType = 'black-dwarf'

  return {
    giantPulseCount,
    glitchCount,
    hasGlitch,
    hasGiantPulse,
    hasNulling,
    intensity,
    isStable,
    isVariable,
    period,
    pulseType,
  }
}

/**
 * @example
 * const mag = measureMagnetic('import { a } from "./x"\nimport { b } from "./y"')
 * // mag.fieldStrength > 0
 */
export function measureMagnetic(content: string): MagneticMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)

  const poleCount = imports + exports
  const fieldStrength = clamp(Math.round(
    (imports * 12) + (exports * 10) + (classes * 8) + (interfaces * 5)
  ), 0, 100)

  const hasStrongField = fieldStrength >= 50
  const hasWeakField = fieldStrength < 20
  const hasReversal = imports > 0 && exports > 0 && Math.abs(imports - exports) > 3
  const hasMultipole = imports > 3 && exports > 3
  const isAligned = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 2
  const isMisaligned = !isAligned && poleCount > 0

  return {
    fieldStrength,
    hasMultipole,
    hasReversal,
    hasStrongField,
    hasWeakField,
    isAligned,
    isMisaligned,
    poleCount,
  }
}

/**
 * @example
 * const em = measureEmission('console.log("hi")\nreturn data')
 * // em.hasRadioEmission = true
 */
export function measureEmission(content: string): EmissionMeasure {
  const returns = countReturnStatements(content)
  const consoleCalls = countConsoleLog(content)
  const sideEffects = (content.match(/\bfs\.\w+\s*\(/g) || []).length
    + (content.match(/\bprocess\.\w+/g) || []).length
    + (content.match(/\bfetch\s*\(/g) || []).length
  const critical = (content.match(/\bdelete\b/g) || []).length
    + (content.match(/\brm\b/g) || []).length
    + (content.match(/\bwriteFile\b/g) || []).length
  const ui = (content.match(/\brender\b/g) || []).length
    + (content.match(/\bdocument\.\w+/g) || []).length
  const asyncOps = countAsyncAwait(content)

  const emissionTypes: string[] = []
  const hasRadioEmission = returns > 0 || consoleCalls > 0
  const hasXRayEmission = sideEffects > 0
  const hasGammaRay = critical > 0
  const hasOpticalEmission = ui > 0
  const hasInfraredEmission = asyncOps > 0

  if (hasRadioEmission) emissionTypes.push('radio')
  if (hasXRayEmission) emissionTypes.push('x-ray')
  if (hasGammaRay) emissionTypes.push('gamma-ray')
  if (hasOpticalEmission) emissionTypes.push('optical')
  if (hasInfraredEmission) emissionTypes.push('infrared')

  const spectrum = clamp(Math.round(
    emissionTypes.length * 20 + returns * 5
  ), 0, 100)

  const dominantEmission = emissionTypes.length > 0 ? emissionTypes[0] : 'none'

  return {
    dominantEmission: dominantEmission ?? '',
    emissionTypes,
    hasGammaRay,
    hasInfraredEmission,
    hasOpticalEmission,
    hasRadioEmission,
    hasXRayEmission,
    spectrum,
  }
}

/**
 * @example
 * const burst = measureBurst('function a() {}\nfunction b() {}')
 * // burst.frequency >= 0
 */
export function measureBurst(content: string): BurstMeasure {
  const loc = countLines(content)
  const functions = countFunctions(content)
  const conditions = countConditions(content)
  const loops = countLoops(content)

  const frequency = loc === 0 ? 0 : clamp(Math.round(
    (functions * 8) + (conditions * 4) + (loops * 3)
  ), 0, 100)

  const hasRegularBursts = frequency >= 20 && frequency <= 60
  const hasIrregularBursts = frequency > 60
  const hasSoftGammaRepeater = countTODO(content) > 2
  const hasAnomalousXRay = countDeprecated(content) > 0
  const isQuiescent = frequency < 15
  const isActive = frequency >= 30 && frequency <= 70
  const isHyperactive = frequency > 70

  return {
    frequency,
    hasAnomalousXRay,
    hasIrregularBursts,
    hasRegularBursts,
    hasSoftGammaRepeater,
    isActive,
    isHyperactive,
    isQuiescent,
  }
}

/**
 * @example
 * const energy = measureEnergy('export function core() { return 1 }')
 * // energy.output > 0
 */
export function measureEnergy(content: string): EnergyMeasure {
  const loc = countLines(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const classes = countClasses(content)
  const returns = countReturnStatements(content)
  const nesting = countNesting(content)

  const output = loc === 0 ? 0 : clamp(Math.round(
    (exports * 12) + (functions * 6) + (classes * 8) + (returns * 3)
  ), 0, 100)

  const complexity = nesting * 5 + conditions_count(content)
  const efficiency = output === 0 ? 100 : clamp(Math.round(
    (output / Math.max(complexity, 1)) * 50
  ), 0, 100)

  const hasHighLuminosity = output >= 60
  const hasLowLuminosity = output < 20
  const hasAccretion = nesting >= 3
  const hasOutflow = exports > 0 && returns > 0

  let luminosityClass: EnergyMeasure['luminosityClass']
  if (output >= 70) luminosityClass = 'supergiant'
  else if (output >= 50) luminosityClass = 'giant'
  else if (output >= 35) luminosityClass = 'dwarf'
  else if (output >= 20) luminosityClass = 'subdwarf'
  else if (output >= 10) luminosityClass = 'white-dwarf'
  else luminosityClass = 'brown-dwarf'

  return {
    efficiency,
    hasAccretion,
    hasHighLuminosity,
    hasLowLuminosity,
    hasOutflow,
    luminosityClass,
    output,
  }
}

function conditions_count(content: string): number {
  return countConditions(content) + countLoops(content)
}

/**
 * @example
 * const rad = measureRadiation('try { x() } catch(e) {}')
 * // rad.hasShielding = true
 */
export function measureRadiation(content: string): RadiationMeasure {
  const loc = countLines(content)
  const errorHandling = countErrorHandling(content)
  const tryCatch = countTryCatch(content)
  const catches = (content.match(/\.catch\s*\(/g) || []).length
  const tests = countTests(content)
  const types = countTypeAnnotations(content)

  const rawRisk = loc === 0 ? 0 : clamp(Math.round(
    100 - (errorHandling > 0 ? 25 : 0) - (tests > 0 ? 25 : 0) - (types > 0 ? 20 : 0) - (tryCatch > 0 ? 15 : 0) - (catches > 0 ? 15 : 0)
  ), 0, 100)

  const level = rawRisk
  const shieldingCount = tryCatch + catches
  const beltCount = tests > 0 ? 1 : 0
  const hasIonizingRadiation = level >= 60
  const hasNonIonizing = level < 40
  const hasShielding = shieldingCount > 0
  const hasRadiationBelts = beltCount > 0 && hasShielding
  const isSafe = level < 30
  const isDangerous = level >= 70

  return {
    beltCount,
    hasIonizingRadiation,
    hasNonIonizing,
    hasRadiationBelts,
    hasShielding,
    isDangerous,
    isSafe,
    level,
    shieldingCount,
  }
}

/**
 * @example
 * const nebula = measureNebula('function legacy() {}')
 * // nebula.hasRemnant = false
 */
export function measureNebula(content: string): NebulaMeasure {
  const deprecated = countDeprecated(content)
  const comments = countComments(content)
  const todo = countTODO(content)

  const hasRemnant = deprecated > 0
  const hasProtoplanetary = comments > 5 && countJSDoc(content) > 2
  const hasDebris = todo > 0
  const debrisCount = todo
  const isClear = !hasRemnant && !hasDebris

  return {
    debrisCount,
    hasDebris,
    hasProtoplanetary,
    hasRemnant,
    isClear,
  }
}

// ─── Classification ───────────────────────────────────────

/**
 * @example
 * classifyNodeCondition(85, 80, 75) // 'magnetar-burst'
 */
export function classifyNodeCondition(
  pulseIntensity: number,
  magneticField: number,
  energyOutput: number,
): PulsarNode['condition'] {
  const score = (pulseIntensity + magneticField + energyOutput) / 3
  if (score >= 70 && pulseIntensity >= 65) return 'magnetar-burst'
  if (score >= 55 && energyOutput >= 45) return 'pulsar-beam'
  if (score >= 40) return 'steady-star'
  if (score >= 25) return 'red-dwarf'
  if (score >= 12) return 'brown-dwarf'
  return 'dead-star'
}

/**
 * @example
 * classifyClusterType(nodes) // 'globular-cluster'
 */
export function classifyClusterType(nodes: PulsarNode[]): PulsarCluster['clusterType'] {
  if (nodes.length === 0) return 'void'
  const avgPulse = nodes.reduce((s, n) => s + n.pulseIntensity, 0) / nodes.length
  const magnetarRatio = nodes.filter((n) => n.condition === 'magnetar-burst').length / nodes.length
  const deadRatio = nodes.filter((n) => n.condition === 'dead-star').length / nodes.length

  if (avgPulse >= 60 && magnetarRatio >= 0.3) return 'globular-cluster'
  if (avgPulse >= 40) return 'open-cluster'
  if (avgPulse >= 25) return 'star-forming-region'
  if (deadRatio >= 0.5) return 'dark-nebula'
  if (avgPulse >= 10) return 'supernova-remnant'
  return 'void'
}

/**
 * @example
 * classifyClusterCondition(avgPulse, avgEnergy) // 'brilliant-cluster'
 */
export function classifyClusterCondition(
  avgPulse: number,
  avgEnergy: number,
): PulsarCluster['condition'] {
  const score = (avgPulse + avgEnergy) / 2
  if (score >= 75) return 'brilliant-cluster'
  if (score >= 55) return 'active-cluster'
  if (score >= 40) return 'quiet-cluster'
  if (score >= 25) return 'dim-cluster'
  if (score >= 10) return 'dark-cluster'
  return 'empty-space'
}

/**
 * @example
 * classifyAstrophysicistGrade(85) // 'pulsar-astronomer'
 */
export function classifyAstrophysicistGrade(avgEnergy: number): MagnetarPulseStats['astrophysicistGrade'] {
  if (avgEnergy >= 80) return 'pulsar-astronomer'
  if (avgEnergy >= 65) return 'radio-astronomer'
  if (avgEnergy >= 50) return 'xray-astronomer'
  if (avgEnergy >= 35) return 'amateur'
  if (avgEnergy >= 20) return 'stargazer'
  return 'blind'
}

// ─── Analyze functions ────────────────────────────────────

/**
 * @example
 * const node = analyzePulsarNode(content, 'src/core.ts')
 * // node.pulseIntensity >= 0
 */
export function analyzePulsarNode(content: string, filePath: string): PulsarNode {
  const pulse = measurePulse(content)
  const magnetic = measureMagnetic(content)
  const emission = measureEmission(content)
  const burst = measureBurst(content)
  const energy = measureEnergy(content)
  const radiation = measureRadiation(content)
  const nebula = measureNebula(content)

  const pulseIntensity = pulse.intensity
  const magneticFieldStrength = magnetic.fieldStrength
  const emissionSpectrum = emission.spectrum
  const burstFrequency = burst.frequency
  const energyOutput = energy.output
  const radiationLevel = radiation.level

  const condition = classifyNodeCondition(pulseIntensity, magneticFieldStrength, energyOutput)

  const qualityScore = clamp(Math.round(
    (pulseIntensity * 0.15) +
    (magneticFieldStrength * 0.1) +
    (emissionSpectrum * 0.1) +
    (energyOutput * 0.2) +
    ((100 - radiationLevel) * 0.2) +
    (burst.frequency > 0 ? 10 : 0) +
    (nebula.isClear ? 10 : 0) +
    (pulse.isStable ? 5 : 0)
  ), 0, 100)

  return {
    burst,
    burstFrequency,
    condition,
    emission,
    emissionSpectrum,
    energy,
    energyOutput,
    magnetic,
    magneticFieldStrength,
    nebula,
    pulse,
    pulseIntensity,
    qualityScore,
    radiation,
    radiationLevel,
    file: filePath,
  }
}

/**
 * @example
 * const cluster = analyzePulsarCluster(nodes, 'src')
 * // cluster.clusterType is defined
 */
export function analyzePulsarCluster(nodes: PulsarNode[], dirPath: string): PulsarCluster {
  if (nodes.length === 0) {
    return {
      activeCount: 0,
      avgEnergyOutput: 0,
      avgMagneticField: 0,
      avgPulseIntensity: 0,
      clusterType: 'void',
      condition: 'empty-space',
      deadStarCount: 0,
      directory: dirPath,
      magnetarCount: 0,
      nodes: [],
      safeCount: 0,
    }
  }

  const avgPulseIntensity = Math.round(nodes.reduce((s, n) => s + n.pulseIntensity, 0) / nodes.length)
  const avgMagneticField = Math.round(nodes.reduce((s, n) => s + n.magneticFieldStrength, 0) / nodes.length)
  const avgEnergyOutput = Math.round(nodes.reduce((s, n) => s + n.energyOutput, 0) / nodes.length)
  const magnetarCount = nodes.filter((n) => n.condition === 'magnetar-burst').length
  const deadStarCount = nodes.filter((n) => n.condition === 'dead-star').length
  const activeCount = nodes.filter((n) => n.pulse.isStable && n.pulseIntensity >= 30).length
  const safeCount = nodes.filter((n) => n.radiation.isSafe).length

  const clusterType = classifyClusterType(nodes)
  const condition = classifyClusterCondition(avgPulseIntensity, avgEnergyOutput)

  return {
    activeCount,
    avgEnergyOutput,
    avgMagneticField,
    avgPulseIntensity,
    clusterType,
    condition,
    deadStarCount,
    directory: dirPath,
    magnetarCount,
    nodes,
    safeCount,
  }
}

// ─── Recommendation generation ────────────────────────────

/**
 * @example
 * const recs = generateRecommendations(nodes, clusters, galaxy, stats)
 * // recs.length > 0
 */
export function generateRecommendations(
  _nodes: PulsarNode[],
  _clusters: PulsarCluster[],
  galaxy: MagnetarGalaxy,
  stats: MagnetarPulseStats,
): string[] {
  const recs: string[] = []

  if (galaxy.overallEnergy < 30) {
    recs.push('Galaxy energy is critically low - consider increasing code output and productivity')
  }

  if (stats.isDangerousCount > 0) {
    recs.push(`${stats.isDangerousCount} node(s) have dangerous radiation levels - add error handling and tests`)
  }

  if (stats.hasGlitchCount > 3) {
    recs.push('Many TODO/FIXME markers found - resolve glitches to stabilize pulse patterns')
  }

  if (stats.hasGammaRayCount > 2) {
    recs.push('Critical operations detected - add safeguards around destructive actions')
  }

  if (stats.deadStarCount > stats.totalFiles * 0.3) {
    recs.push('Many dead-star files detected - consider removing or revitalizing inactive code')
  }

  if (stats.lowLuminosityCount > stats.totalFiles * 0.5) {
    recs.push('Majority of files have low luminosity - increase exports and return values')
  }

  if (stats.hasStrongFieldCount > stats.totalFiles * 0.6) {
    recs.push('High coupling detected across many files - consider reducing import dependencies')
  }

  if (stats.hasReversalCount > 0) {
    recs.push(`${stats.hasReversalCount} node(s) have coupling reversals - balance imports and exports`)
  }

  if (galaxy.avgEnergyOutput < 40 && galaxy.avgPulseIntensity > 50) {
    recs.push('High pulse intensity but low energy output - focus on productive output, not just activity')
  }

  if (recs.length === 0) {
    recs.push('Your code galaxy is emitting healthy, focused energy - excellent code intensity')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────

/**
 * @example
 * const result = buildMagnetarPulseResult(files, contents, {})
 * // result.stats.totalFiles > 0
 */
export function buildMagnetarPulseResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MagnetarPulseResult {
  const nodes: PulsarNode[] = files.map((file, i) =>
    analyzePulsarNode(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PulsarNode[]>()
  for (const node of nodes) {
    const dir = node.file.includes('/') ? node.file.substring(0, node.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(node)
    } else {
      dirMap.set(dir, [node])
    }
  }

  const clusters: PulsarCluster[] = Array.from(dirMap.entries()).map(([dir, ns]) =>
    analyzePulsarCluster(ns, dir),
  )

  const avgPulseIntensity = nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.pulseIntensity, 0) / nodes.length)
  const avgMagneticField = nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.magneticFieldStrength, 0) / nodes.length)
  const avgEnergyOutput = nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.energyOutput, 0) / nodes.length)
  const overallEnergy = clamp(Math.round(
    (avgPulseIntensity * 0.3) + (avgEnergyOutput * 0.3) + (avgMagneticField * 0.15) +
    ((100 - (nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.radiationLevel, 0) / nodes.length))) * 0.25)
  ), 0, 100)

  const galaxy: MagnetarGalaxy = {
    avgEnergyOutput,
    avgMagneticField,
    avgPulseIntensity,
    isEnergetic: overallEnergy >= 55,
    overallEnergy,
  }

  const avgEmissionSpectrum = nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.emissionSpectrum, 0) / nodes.length)
  const avgBurstFrequency = nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.burstFrequency, 0) / nodes.length)
  const avgRadiationLevel = nodes.length === 0 ? 0 : Math.round(nodes.reduce((s, n) => s + n.radiationLevel, 0) / nodes.length)

  const stats: MagnetarPulseStats = {
    avgBurstFrequency,
    avgEmissionSpectrum,
    avgEnergyOutput,
    avgMagneticFieldStrength: avgMagneticField,
    avgPulseIntensity,
    avgRadiationLevel,
    astrophysicistGrade: classifyAstrophysicistGrade(overallEnergy),
    brownDwarfCount: nodes.filter((n) => n.condition === 'brown-dwarf').length,
    deadStarCount: nodes.filter((n) => n.condition === 'dead-star').length,
    hasGammaRayCount: nodes.filter((n) => n.emission.hasGammaRay).length,
    hasGiantPulseCount: nodes.filter((n) => n.pulse.hasGiantPulse).length,
    hasGlitchCount: nodes.filter((n) => n.pulse.hasGlitch).length,
    hasReversalCount: nodes.filter((n) => n.magnetic.hasReversal).length,
    hasShieldingCount: nodes.filter((n) => n.radiation.hasShielding).length,
    hasStrongFieldCount: nodes.filter((n) => n.magnetic.hasStrongField).length,
    highLuminosityCount: nodes.filter((n) => n.energy.hasHighLuminosity).length,
    isDangerousCount: nodes.filter((n) => n.radiation.isDangerous).length,
    isSafeCount: nodes.filter((n) => n.radiation.isSafe).length,
    lowLuminosityCount: nodes.filter((n) => n.energy.hasLowLuminosity).length,
    magnetarBurstCount: nodes.filter((n) => n.condition === 'magnetar-burst').length,
    magnetarTypeCount: nodes.filter((n) => n.pulse.pulseType === 'magnetar').length,
    millisecondPulsarCount: nodes.filter((n) => n.pulse.pulseType === 'millisecond-pulsar').length,
    mostDangerous: findExtreme(nodes, (n) => n.radiationLevel),
    mostIntense: findExtreme(nodes, (n) => n.pulseIntensity),
    mostProductive: findExtreme(nodes, (n) => n.energyOutput),
    mostVariable: findExtreme(nodes, (n) => n.pulse.isVariable ? 1 : 0),
    normalPulsarCount: nodes.filter((n) => n.pulse.pulseType === 'normal-pulsar').length,
    overallEnergy,
    pulsarBeamCount: nodes.filter((n) => n.condition === 'pulsar-beam').length,
    redDwarfCount: nodes.filter((n) => n.condition === 'red-dwarf').length,
    safestNode: findMin(nodes, (n) => n.radiationLevel),
    steadyStarCount: nodes.filter((n) => n.condition === 'steady-star').length,
    strongestField: findExtreme(nodes, (n) => n.magneticFieldStrength),
    totalClusters: clusters.length,
    totalFiles: files.length,
  }

  const recommendations = generateRecommendations(nodes, clusters, galaxy, stats)

  return {
    clusters,
    galaxy,
    nodes,
    recommendations,
    stats,
  }
}

function findExtreme(nodes: PulsarNode[], getter: (n: PulsarNode) => number): string {
  if (nodes.length === 0) return 'none'
  let best = nodes[0] as PulsarNode
  let bestVal = getter(best)
  for (let i = 1; i < nodes.length; i++) {
    const node = nodes[i] as PulsarNode
    const val = getter(node)
    if (val > bestVal) {
      best = node
      bestVal = val
    }
  }
  return best?.file ?? ''
}

function findMin(nodes: PulsarNode[], getter: (n: PulsarNode) => number): string {
  if (nodes.length === 0) return 'none'
  let best = nodes[0] as PulsarNode
  let bestVal = getter(best)
  for (let i = 1; i < nodes.length; i++) {
    const node = nodes[i] as PulsarNode
    const val = getter(node)
    if (val < bestVal) {
      best = node
      bestVal = val
    }
  }
  return best?.file ?? ''
}
