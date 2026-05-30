// ─── Interfaces ──────────────────────────────────────────────────────────────

export type ToothProfile = 'involute' | 'cycloidal' | 'triangular' | 'rough' | 'broken'
export type GearCondition = 'precision-engineered' | 'well-machined' | 'serviceable' | 'worn' | 'grinding' | 'seized'
export type GearboxType = 'automatic' | 'manual' | 'cvt' | 'fixed-ratio' | 'stripped' | 'broken'
export type GearboxCondition = 'smooth-running' | 'efficient' | 'adequate' | 'noisy' | 'grinding' | 'broken'
export type MechanicGrade = 'master-machinist' | 'mechanic' | 'tinkerer' | 'apprentice' | 'butcher' | 'scrap-dealer'

export interface TeethInfo {
  count: number
  profile: ToothProfile
  pitch: number
  isWorn: boolean
  isChipped: boolean
  isMissing: boolean
  wornCount: number
  chippedCount: number
}

export interface MeshInfo {
  meshingPartners: number
  meshTightness: number
  hasGrinding: boolean
  hasSlipping: boolean
  hasStripping: boolean
  grindingPoints: string[]
  slipPoints: string[]
}

export interface BearingInfo {
  loadCapacity: number
  friction: number
  runout: number
  isGreased: boolean
  isSeized: boolean
  isNoisy: boolean
}

export interface ShaftInfo {
  diameter: number
  length: number
  isBalanced: boolean
  isBent: boolean
  hasKeyway: boolean
  criticalSpeed: number
}

export interface TransmissionInfo {
  inputTorque: number
  outputTorque: number
  speedRatio: number
  efficiency: number
  hasPowerLoss: boolean
  powerLossPoints: string[]
  hasVibration: boolean
}

export interface Gear {
  file: string
  gearRatio: number
  meshQuality: number
  backlash: number
  torqueTransfer: number
  lubrication: number
  wear: number
  teeth: TeethInfo
  mesh: MeshInfo
  bearing: BearingInfo
  shaft: ShaftInfo
  transmission: TransmissionInfo
  condition: GearCondition
  qualityScore: number
}

export interface Gearbox {
  directory: string
  gears: Gear[]
  avgMeshQuality: number
  avgTorqueTransfer: number
  avgEfficiency: number
  totalFriction: number
  grindingCount: number
  seizedCount: number
  precisionCount: number
  gearboxType: GearboxType
  transmissionEfficiency: number
  condition: GearboxCondition
}

export interface DrivetrainInfo {
  avgMeshQuality: number
  avgTorqueTransfer: number
  avgEfficiency: number
  totalFriction: number
  isSmooth: boolean
  overallEfficiency: number
}

export interface GearTrainStats {
  totalFiles: number
  totalGearboxes: number
  avgGearRatio: number
  avgMeshQuality: number
  avgBacklash: number
  avgTorqueTransfer: number
  avgLubrication: number
  avgWear: number
  avgTeethCount: number
  avgEfficiency: number
  precisionEngineered: number
  wellMachined: number
  serviceable: number
  worn: number
  grinding: number
  seized: number
  totalGrindingPoints: number
  totalSlipPoints: number
  totalPowerLossPoints: number
  involuteProfiles: number
  roughProfiles: number
  brokenProfiles: number
  overallEfficiency: number
  mechanicGrade: MechanicGrade
  bestMeshed: string
  worstMeshed: string
  mostEfficient: string
  mostWorn: string
  mostComplex: string
}

export interface GearTrainResult {
  gears: Gear[]
  gearboxes: Gearbox[]
  drivetrain: DrivetrainInfo
  stats: GearTrainStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling constructs
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify gear condition from quality score
 * @example
 * classifyGearCondition(90) // 'precision-engineered'
 */
export function classifyGearCondition(qualityScore: number): GearCondition {
  if (qualityScore >= 85) return 'precision-engineered'
  if (qualityScore >= 70) return 'well-machined'
  if (qualityScore >= 50) return 'serviceable'
  if (qualityScore >= 30) return 'worn'
  if (qualityScore >= 10) return 'grinding'
  return 'seized'
}

/**
 * Classify gearbox type from gear set
 * @example
 * classifyGearboxType([]) // 'fixed-ratio'
 */
export function classifyGearboxType(gears: Gear[]): GearboxType {
  if (gears.length === 0) return 'fixed-ratio'
  const conditions = gears.map(g => g.condition)
  const seizedCount = conditions.filter(c => c === 'seized').length
  const grindingCount = conditions.filter(c => c === 'grinding').length
  const precisionCount = conditions.filter(c => c === 'precision-engineered').length
  const wellCount = conditions.filter(c => c === 'well-machined').length
  const n = gears.length

  if (seizedCount > n / 2) return 'broken'
  if (grindingCount > n / 2) return 'stripped'
  if (precisionCount + wellCount > n * 0.7) return 'automatic'
  if (precisionCount + wellCount > n * 0.4) return 'manual'
  if (precisionCount > 0) return 'cvt'
  return 'fixed-ratio'
}

/**
 * Classify gearbox condition from average efficiency
 * @example
 * classifyGearboxCondition(85) // 'smooth-running'
 */
export function classifyGearboxCondition(avgEfficiency: number): GearboxCondition {
  if (avgEfficiency >= 80) return 'smooth-running'
  if (avgEfficiency >= 60) return 'efficient'
  if (avgEfficiency >= 40) return 'adequate'
  if (avgEfficiency >= 20) return 'noisy'
  if (avgEfficiency >= 10) return 'grinding'
  return 'broken'
}

/**
 * Classify mechanic grade from average efficiency
 * @example
 * classifyMechanicGrade(85) // 'master-machinist'
 */
export function classifyMechanicGrade(avgEfficiency: number): MechanicGrade {
  if (avgEfficiency >= 80) return 'master-machinist'
  if (avgEfficiency >= 65) return 'mechanic'
  if (avgEfficiency >= 45) return 'tinkerer'
  if (avgEfficiency >= 30) return 'apprentice'
  if (avgEfficiency >= 15) return 'butcher'
  return 'scrap-dealer'
}

/**
 * Classify tooth profile from API quality metrics
 * @example
 * classifyToothProfile(80, 90) // 'involute'
 */
export function classifyToothProfile(pitch: number, qualityScore: number): ToothProfile {
  if (pitch >= 70 && qualityScore >= 65) return 'involute'
  if (pitch >= 55 && qualityScore >= 50) return 'cycloidal'
  if (pitch >= 35) return 'triangular'
  if (pitch >= 15) return 'rough'
  return 'broken'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure teeth (API surface analysis)
 * @example
 * measureTeeth('export function a() {}') // TeethInfo
 */
export function measureTeeth(content: string): TeethInfo {
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const loc = countLoc(content)

  const count = exports + funcs + types
  const pitch = Math.min(100, Math.round(
    (types > 0 ? 30 : 0) +
    (comments > 0 ? 25 : 0) +
    (exports > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  const isWorn = countTodos(content) > 0
  const isChipped = funcs > 0 && types === 0
  const isMissing = loc > 20 && exports === 0
  const wornCount = (content.match(/deprecated/gi) ?? []).length + (countTodos(content) > 0 ? 1 : 0)
  const chippedCount = (funcs > 0 && types === 0 ? 1 : 0) + (exports > 0 && comments === 0 ? 1 : 0)

  const qualityScore = Math.min(100, Math.round(
    (types > 0 ? 25 : 0) +
    (comments > 0 ? 25 : 0) +
    (exports > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0) +
    (countTodos(content) === 0 ? 5 : 0),
  ))

  return {
    count,
    profile: classifyToothProfile(pitch, qualityScore),
    pitch,
    isWorn,
    isChipped,
    isMissing,
    wornCount,
    chippedCount,
  }
}

/**
 * Measure mesh (coupling analysis)
 * @example
 * measureMesh('import { x } from "y"\nexport function a() {}') // MeshInfo
 */
export function measureMesh(content: string): MeshInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const branches = countBranches(content)
  const errors = countErrorHandling(content)

  const meshingPartners = imports + exports
  const meshTightness = Math.min(100, Math.round(
    imports * 12 + exports * 8 + funcs * 5,
  ))

  const hasGrinding = imports > 0 && exports > 0 && errors === 0 && branches > 5
  const hasSlipping = branches > 3 && errors === 0
  const hasStripping = imports > 5 && funcs === 0

  const grindingPoints: string[] = []
  if (hasGrinding) grindingPoints.push('Complex coupling without error handling')
  if (hasStripping) grindingPoints.push('Heavy imports with no functions')

  const slipPoints: string[] = []
  if (hasSlipping) slipPoints.push('Unhandled edge cases in complex logic')

  return {
    meshingPartners,
    meshTightness,
    hasGrinding,
    hasSlipping,
    hasStripping,
    grindingPoints,
    slipPoints,
  }
}

/**
 * Measure bearing (load capacity, friction, runout)
 * @example
 * measureBearing('export function a(): number { return 1 }') // BearingInfo
 */
export function measureBearing(content: string): BearingInfo {
  const loc = countLoc(content)
  const funcs = countFunctions(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const branches = countBranches(content)
  const comments = countComments(content)

  const loadCapacity = Math.min(100, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (funcs > 0 ? 20 : 0) +
    (loc > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0),
  ))

  const friction = Math.min(100, Math.round(
    maxNesting(content) * 8 +
    branches * 5 +
    (loc > 50 ? 15 : 0) +
    (countConsole(content) > 3 ? 10 : 0),
  ))

  const runout = Math.min(100, Math.round(
    (funcs > 0 && types === 0 ? 25 : 0) +
    (exports > 0 && comments === 0 ? 20 : 0) +
    (branches > 5 && errors === 0 ? 20 : 0) +
    (countTodos(content) > 0 ? 15 : 0) +
    (loc > 30 && countComments(content) === 0 ? 20 : 0),
  ))

  const isGreased = types > 0 && comments > 0
  const isSeized = friction > 70 && loadCapacity < 30
  const isNoisy = countConsole(content) > 2 || countTodos(content) > 2

  return { loadCapacity, friction, runout, isGreased, isSeized, isNoisy }
}

/**
 * Measure shaft (file size, function chains, balance)
 * @example
 * measureShaft('function a() {}\nfunction b() {}') // ShaftInfo
 */
export function measureShaft(content: string): ShaftInfo {
  const loc = countLoc(content)
  const funcs = countFunctions(content)
  const exports = countExports(content)
  const nest = maxNesting(content)

  const diameter = Math.min(100, loc)
  const length = Math.min(100, Math.round(funcs * 10 + exports * 8 + nest * 5))

  const lines = content.split('\n').filter(l => l.trim().length > 0)
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  const variance = lines.length > 0
    ? lines.reduce((s, l) => s + (l.length - avgLineLen) ** 2, 0) / lines.length
    : 0
  const isBalanced = variance < 1000 && nest <= 4
  const isBent = variance > 2000 || nest >= 5

  const hasKeyway = exports > 0
  const criticalSpeed = Math.min(100, Math.round(
    (funcs > 0 ? 25 : 0) +
    (nest <= 3 ? 25 : nest <= 5 ? 12 : 0) +
    (countBranches(content) <= 5 ? 25 : countBranches(content) <= 10 ? 12 : 0) +
    (loc <= 100 ? 25 : loc <= 200 ? 12 : 0),
  ))

  return { diameter, length, isBalanced, isBent, hasKeyway, criticalSpeed }
}

/**
 * Measure transmission (torque, efficiency, power loss)
 * @example
 * measureTransmission('export function a(): number { return 1 }') // TransmissionInfo
 */
export function measureTransmission(content: string): TransmissionInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const inputTorque = Math.min(100, Math.round(
    imports * 12 + branches * 5 + maxNesting(content) * 8,
  ))

  const outputTorque = Math.min(100, Math.round(
    exports * 10 + funcs * 8 + types * 5,
  ))

  const speedRatio = inputTorque > 0 ? Math.round((outputTorque / inputTorque) * 100) / 100 : 0

  const efficiency = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0),
  )))

  const powerLossPoints: string[] = []
  const hasPowerLoss = efficiency < 60
  if (types === 0 && funcs > 0) powerLossPoints.push('Functions lack type annotations')
  if (errors === 0 && branches > 3) powerLossPoints.push('Complex logic without error handling')
  if (countTodos(content) > 2) powerLossPoints.push('Excessive TODO markers')

  const hasVibration = branches > 5 && errors === 0

  return { inputTorque, outputTorque, speedRatio, efficiency, hasPowerLoss, powerLossPoints, hasVibration }
}

/**
 * Detect wear (technical debt indicators)
 * @example
 * detectWear('TODO: fix this\n// HACK: temp') // number
 */
export function detectWear(content: string): number {
  return Math.min(100, Math.round(
    countTodos(content) * 12 +
    countConsole(content) * 5 +
    (countComments(content) === 0 && countLoc(content) > 10 ? 15 : 0) +
    (countTypeAnnotations(content) === 0 && countFunctions(content) > 0 ? 10 : 0),
  ))
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a gear
 * @example
 * analyzeGear('export function calc(): number { return 1 }', 'calc.ts') // Gear
 */
export function analyzeGear(content: string, filePath: string): Gear {
  const loc = countLoc(content)
  if (loc === 0) {
    const teeth = measureTeeth(content)
    const meshInfo = measureMesh(content)
    const bearing = measureBearing(content)
    const shaft = measureShaft(content)
    const transmission = measureTransmission(content)
    return {
      file: filePath,
      gearRatio: 0,
      meshQuality: 0,
      backlash: 100,
      torqueTransfer: 0,
      lubrication: 0,
      wear: 0,
      teeth,
      mesh: meshInfo,
      bearing,
      shaft,
      transmission,
      condition: 'seized',
      qualityScore: 0,
    }
  }
  const teeth = measureTeeth(content)
  const meshInfo = measureMesh(content)
  const bearing = measureBearing(content)
  const shaft = measureShaft(content)
  const transmission = measureTransmission(content)

  const imports = countImports(content)
  const exports = countExports(content)
  const gearRatio = imports > 0 ? Math.round((exports / imports) * 100) / 100 : exports

  const meshQuality = Math.min(100, Math.max(0, Math.round(
    (transmission.efficiency > 0 ? 25 : 0) +
    (teeth.pitch > 50 ? 25 : 0) +
    (bearing.isGreased ? 20 : 0) +
    (!meshInfo.hasGrinding && meshInfo.meshingPartners > 0 ? 15 : 0) +
    (!meshInfo.hasSlipping && meshInfo.meshingPartners > 0 ? 15 : 0),
  )))

  const backlash = Math.min(100, Math.max(0, Math.round(
    100 - meshInfo.meshTightness * 0.3 -
    (teeth.isWorn ? 15 : 0) -
    (teeth.isChipped ? 10 : 0),
  )))

  const torqueTransfer = Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 30 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0),
  )))

  const lubrication = Math.min(100, Math.max(0, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 10 : 0),
  )))

  const wear = detectWear(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    meshQuality * 0.2 +
    torqueTransfer * 0.2 +
    lubrication * 0.15 +
    transmission.efficiency * 0.15 +
    (100 - wear) * 0.1 +
    (bearing.isGreased ? 10 : 0) +
    (shaft.isBalanced ? 5 : 0) +
    (meshInfo.hasGrinding ? -5 : 0) +
    (teeth.count === 0 ? -10 : 0),
  )))

  const condition = classifyGearCondition(qualityScore)
  return {
    file: filePath,
    gearRatio,
    meshQuality,
    backlash,
    torqueTransfer,
    lubrication,
    wear,
    teeth,
    mesh: meshInfo,
    bearing,
    shaft,
    transmission,
    condition,
    qualityScore,
  }
}

// ─── Gearbox Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a gearbox
 * @example
 * analyzeGearbox(gears, 'src') // Gearbox
 */
export function analyzeGearbox(gears: Gear[], dirPath: string): Gearbox {
  if (gears.length === 0) {
    return {
      directory: dirPath, gears: [],
      avgMeshQuality: 0, avgTorqueTransfer: 0, avgEfficiency: 0,
      totalFriction: 0, grindingCount: 0, seizedCount: 0, precisionCount: 0,
      gearboxType: 'fixed-ratio', transmissionEfficiency: 100,
      condition: 'smooth-running',
    }
  }

  const n = gears.length
  const avgMeshQuality = Math.round(gears.reduce((s, g) => s + g.meshQuality, 0) / n)
  const avgTorqueTransfer = Math.round(gears.reduce((s, g) => s + g.torqueTransfer, 0) / n)
  const avgEfficiency = Math.round(gears.reduce((s, g) => s + g.transmission.efficiency, 0) / n)
  const totalFriction = Math.round(gears.reduce((s, g) => s + g.bearing.friction, 0) / n)
  const grindingCount = gears.filter(g => g.condition === 'grinding' || g.mesh.hasGrinding).length
  const seizedCount = gears.filter(g => g.condition === 'seized' || g.bearing.isSeized).length
  const precisionCount = gears.filter(g => g.condition === 'precision-engineered').length

  const gearboxType = classifyGearboxType(gears)
  const transmissionEfficiency = Math.min(100, Math.max(0, Math.round(
    avgMeshQuality * 0.3 +
    avgTorqueTransfer * 0.3 +
    avgEfficiency * 0.2 +
    (grindingCount === 0 ? 10 : 0) +
    (seizedCount === 0 ? 10 : 0),
  )))

  const condition = classifyGearboxCondition(transmissionEfficiency)

  return {
    directory: dirPath, gears,
    avgMeshQuality, avgTorqueTransfer, avgEfficiency,
    totalFriction, grindingCount, seizedCount, precisionCount,
    gearboxType, transmissionEfficiency, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate gear train recommendations
 * @example
 * generateRecommendations(gears, gearboxes, drivetrain, stats) // string[]
 */
export function generateRecommendations(
  gears: Gear[],
  gearboxes: Gearbox[],
  _drivetrain: DrivetrainInfo,
  stats: GearTrainStats,
): string[] {
  void gears
  void gearboxes
  void _drivetrain
  const recs: string[] = []

  if (stats.seized > 0) {
    recs.push(`Seized gears: ${stats.seized} files are completely locked up`)
  }
  if (stats.grinding > 0) {
    recs.push(`Grinding gears: ${stats.grinding} files have rough meshing patterns`)
  }
  if (stats.totalGrindingPoints > 0) {
    recs.push(`Grinding points: ${stats.totalGrindingPoints} coupling conflicts detected`)
  }
  if (stats.totalSlipPoints > 0) {
    recs.push(`Slip points: ${stats.totalSlipPoints} unhandled edge cases in complex logic`)
  }
  if (stats.totalPowerLossPoints > 0) {
    recs.push(`Power loss: ${stats.totalPowerLossPoints} sources of unnecessary complexity`)
  }
  if (stats.avgLubrication < 40) {
    recs.push('Low lubrication: consider adding type annotations and documentation')
  }
  if (stats.overallEfficiency >= 60) {
    recs.push('Good efficiency: the gear train transfers data flow smoothly')
  }
  if (stats.brokenProfiles > 0) {
    recs.push(`Broken profiles: ${stats.brokenProfiles} files have degraded API surfaces`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete gear train result from files and contents
 * @example
 * buildGearTrainResult(['a.ts'], ['export function a() {}'], {}) // GearTrainResult
 */
export function buildGearTrainResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): GearTrainResult {
  void options

  const gears: Gear[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeGear(content, file)
    } catch {
      return analyzeGear('', file)
    }
  })

  const dirMap = new Map<string, Gear[]>()
  for (const g of gears) {
    const dir = g.file.includes('/') ? g.file.slice(0, g.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(g) } else { dirMap.set(dir, [g]) }
  }

  const gearboxes: Gearbox[] = Array.from(dirMap.entries()).map(([dir, gs]) =>
    analyzeGearbox(gs, dir),
  )

  const n = gears.length || 1
  const avgMeshQuality = Math.round(gears.reduce((s, g) => s + g.meshQuality, 0) / n)
  const avgTorqueTransfer = Math.round(gears.reduce((s, g) => s + g.torqueTransfer, 0) / n)
  const avgEfficiency = Math.round(gears.reduce((s, g) => s + g.transmission.efficiency, 0) / n)
  const totalFriction = Math.round(gears.reduce((s, g) => s + g.bearing.friction, 0) / n)

  const overallEfficiency = Math.min(100, Math.max(0, Math.round(
    avgMeshQuality * 0.3 +
    avgTorqueTransfer * 0.3 +
    avgEfficiency * 0.2 +
    (gears.filter(g => g.condition === 'seized').length === 0 ? 10 : 0) +
    (gears.filter(g => g.mesh.hasGrinding).length === 0 ? 10 : 0),
  )))

  const drivetrain: DrivetrainInfo = {
    avgMeshQuality,
    avgTorqueTransfer,
    avgEfficiency,
    totalFriction,
    isSmooth: overallEfficiency >= 60,
    overallEfficiency,
  }

  const stats: GearTrainStats = {
    totalFiles: files.length,
    totalGearboxes: gearboxes.length,
    avgGearRatio: Math.round(gears.reduce((s, g) => s + g.gearRatio, 0) / n * 100) / 100,
    avgMeshQuality,
    avgBacklash: Math.round(gears.reduce((s, g) => s + g.backlash, 0) / n),
    avgTorqueTransfer,
    avgLubrication: Math.round(gears.reduce((s, g) => s + g.lubrication, 0) / n),
    avgWear: Math.round(gears.reduce((s, g) => s + g.wear, 0) / n),
    avgTeethCount: Math.round(gears.reduce((s, g) => s + g.teeth.count, 0) / n),
    avgEfficiency,
    precisionEngineered: gears.filter(g => g.condition === 'precision-engineered').length,
    wellMachined: gears.filter(g => g.condition === 'well-machined').length,
    serviceable: gears.filter(g => g.condition === 'serviceable').length,
    worn: gears.filter(g => g.condition === 'worn').length,
    grinding: gears.filter(g => g.condition === 'grinding').length,
    seized: gears.filter(g => g.condition === 'seized').length,
    totalGrindingPoints: gears.reduce((s, g) => s + g.mesh.grindingPoints.length, 0),
    totalSlipPoints: gears.reduce((s, g) => s + g.mesh.slipPoints.length, 0),
    totalPowerLossPoints: gears.reduce((s, g) => s + g.transmission.powerLossPoints.length, 0),
    involuteProfiles: gears.filter(g => g.teeth.profile === 'involute').length,
    roughProfiles: gears.filter(g => g.teeth.profile === 'rough').length,
    brokenProfiles: gears.filter(g => g.teeth.profile === 'broken').length,
    overallEfficiency,
    mechanicGrade: classifyMechanicGrade(overallEfficiency),
    bestMeshed: gears.length > 0
      ? gears.reduce((a, b) => b.meshQuality > a.meshQuality ? b : a, gears[0] as typeof gears[number]).file : 'none',
    worstMeshed: gears.length > 0
      ? gears.reduce((a, b) => b.meshQuality < a.meshQuality ? b : a, gears[0] as typeof gears[number]).file : 'none',
    mostEfficient: gears.length > 0
      ? gears.reduce((a, b) => b.transmission.efficiency > a.transmission.efficiency ? b : a, gears[0] as typeof gears[number]).file : 'none',
    mostWorn: gears.length > 0
      ? gears.reduce((a, b) => b.wear > a.wear ? b : a, gears[0] as typeof gears[number]).file : 'none',
    mostComplex: gears.length > 0
      ? gears.reduce((a, b) => b.gearRatio > a.gearRatio ? b : a, gears[0] as typeof gears[number]).file : 'none',
  }

  const recommendations = generateRecommendations(gears, gearboxes, drivetrain, stats)

  return { gears, gearboxes, drivetrain, stats, recommendations }
}
