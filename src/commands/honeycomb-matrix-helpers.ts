// ─── Types ──────────────────────────────────────────────────────────────────

export type CellType = 'worker' | 'drone' | 'queen' | 'honey' | 'pollen' | 'brood'
export type EfficiencyType = 'optimal' | 'efficient' | 'adequate' | 'wasteful' | 'inefficient' | 'destructive'
export type NectarSource = 'wildflower' | 'clover' | 'buckwheat' | 'manuka' | 'orange-blossom' | 'diluted'
export type GeometricQuality = 'perfect' | 'nearly-perfect' | 'good' | 'irregular' | 'distorted' | 'collapsed'
export type CellCondition = 'perfect-comb' | 'golden-comb' | 'freshly-drawn' | 'functional-comb' | 'damaged-comb' | 'wax-moth'
export type FrameType = 'langstroth' | 'top-bar' | 'warre' | 'skep' | 'log-hive' | 'feral'
export type FrameCondition = 'thriving-colony' | 'healthy-hive' | 'established-colony' | 'new-swarm' | 'struggling-colony' | 'colony-collapse'
export type BeekeeperGrade = 'master-beekeeper' | 'senior-beekeeper' | 'beekeeper' | 'apprentice' | 'novice' | 'swarm-catcher'

export interface StructureMeasure {
  quality: number
  cellType: CellType
  isRegularHexagon: boolean
  hasProperGeometry: boolean
  hasConsistentAngles: boolean
  hasFlatTops: boolean
  hasProperDepth: boolean
  hasSharedWalls: boolean
  hasProperVentilation: boolean
  hasSmoothTransitions: boolean
  irregularityCount: number
}

export interface DensityMeasure {
  packing: number
  isOptimallyPacked: boolean
  hasHexagonalPacking: boolean
  hasSquarePacking: boolean
  hasLoosePacking: boolean
  hasOverPacking: boolean
  hasVoidSpaces: boolean
  hasDeadSpace: boolean
  hasTightJunctions: boolean
  voidCount: number
  deadSpaceCount: number
}

export interface WallMeasure {
  thickness: number
  isStrong: boolean
  hasProperEncapsulation: boolean
  hasThinWalls: boolean
  hasThickWalls: boolean
  hasReinforcedJoints: boolean
  hasWaxCapping: boolean
  hasPropolisSeal: boolean
  hasStructuralDamage: boolean
  hasMoistureBarrier: boolean
  damageCount: number
}

export interface EfficiencyMeasure {
  score: number
  type: EfficiencyType
  hasMinimalWax: boolean
  hasMaximumStorage: boolean
  hasOptimalRatio: boolean
  hasResourceConservation: boolean
  hasEnergyEfficiency: boolean
  hasWingBeat: boolean
  hasThermoregulation: boolean
  hasDanceLanguage: boolean
  wastePercent: number
}

export interface NectarMeasure {
  quality: number
  source: NectarSource
  isPure: boolean
  hasRichFlavor: boolean
  hasProperConsistency: boolean
  hasNoContamination: boolean
  hasProperMoisture: boolean
  hasBeenCapped: boolean
  hasBeenRipened: boolean
  hasPollen: boolean
  contaminationCount: number
}

export interface HexagonMeasure {
  perfection: number
  hasEqualSides: boolean
  hasProperAngles: boolean
  hasFlatBottom: boolean
  hasTaperedWalls: boolean
  hasMirrorSymmetry: boolean
  hasRotationalSymmetry: boolean
  isGeometrically: GeometricQuality
  symmetryScore: number
  angleDeviation: number
}

export interface HoneycombCell {
  file: string
  cellStructure: number
  packingDensity: number
  wallThickness: number
  combEfficiency: number
  nectarQuality: number
  hexagonalPerfection: number
  structure: StructureMeasure
  density: DensityMeasure
  wall: WallMeasure
  efficiency: EfficiencyMeasure
  nectar: NectarMeasure
  hexagon: HexagonMeasure
  condition: CellCondition
  qualityScore: number
}

export interface HoneycombFrame {
  directory: string
  cells: HoneycombCell[]
  avgStructure: number
  avgDensity: number
  avgEfficiency: number
  perfectCombCount: number
  waxMothCount: number
  efficientlyPackedCount: number
  pureNectarCount: number
  frameType: FrameType
  condition: FrameCondition
}

export interface HoneycombMatrixStats {
  totalFiles: number
  totalFrames: number
  avgCellStructure: number
  avgPackingDensity: number
  avgWallThickness: number
  avgCombEfficiency: number
  avgNectarQuality: number
  avgHexagonalPerfection: number
  perfectCombCount: number
  goldenCombCount: number
  freshlyDrawnCount: number
  functionalCombCount: number
  damagedCombCount: number
  waxMothCount: number
  isRegularHexagonCount: number
  hasSharedWallsCount: number
  isOptimallyPackedCount: number
  hasVoidSpacesCount: number
  hasDeadSpaceCount: number
  isStrongCount: number
  hasProperEncapsulationCount: number
  hasMinimalWaxCount: number
  isPureCount: number
  hasBeenCappedCount: number
  hasEqualSidesCount: number
  overallApiary: number
  beekeeperGrade: BeekeeperGrade
  bestCell: string
  bestStructured: string
  densestPacked: string
  mostEfficient: string
  purestNectar: string
}

export interface HoneycombMatrixResult {
  cells: HoneycombCell[]
  frames: HoneycombFrame[]
  apiary: {
    avgStructure: number
    avgDensity: number
    avgEfficiency: number
    isThriving: boolean
    overallApiary: number
  }
  stats: HoneycombMatrixStats
  recommendations: string[]
}

// ─── Regex Constants ────────────────────────────────────────────────────────

const FUNCTION_RE = /\bfunction\b/g
const ARROW_RE = /\=>\s*[{(]/g
const CLASS_RE = /\bclass\b/g
const INTERFACE_RE = /\binterface\b/g
const TYPE_RE = /\btype\s+\w+\s*=/g
const EXPORT_RE = /\bexport\b/g
const IMPORT_RE = /\bimport\b/g
const RETURN_RE = /\breturn\b/g
const CONST_RE = /\bconst\b/g
const VAR_RE = /\bvar\b/g
const IF_RE = /\bif\s*\(/g
const ELSE_RE = /\belse\b/g
const FOR_RE = /\bfor\s*\(/g
const WHILE_RE = /\bwhile\s*\(/g
const TRY_RE = /\btry\s*\{/g
const CATCH_RE = /\bcatch\b/g
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /\bconsole\.\w+/g
const DEBUGGER_RE = /\bdebugger\b/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const MAP_RE = /\.map\s*\(/g
const FILTER_RE = /\.filter\s*\(/g
const REDUCE_RE = /\.reduce\s*\(/g
const GENERIC_RE = /<\w+>/g
const PRIVATE_RE = /\bprivate\b/g
const PROTECTED_RE = /\bprotected\b/g
const PUBLIC_RE = /\bpublic\b/g

// ─── measureStructure ───────────────────────────────────────────────────────

/**
 * Measure module structure quality
 * @example
 * measureStructure(content) // StructureMeasure
 */
export function measureStructure(content: string): StructureMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const elses = (content.match(ELSE_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const totalFunctions = functions + arrows
  const irregularityCount = anys + debuggers

  const hasProperGeometry = totalFunctions > 0 && classes > 0
  const hasConsistentAngles = totalFunctions > 0 && (types > 0 || interfaces > 0)
  const hasFlatTops = interfaces > 0
  const hasProperDepth = totalFunctions >= 2
  const hasSharedWalls = imports > 0 && exports > 0
  const hasProperVentilation = ifs > 0 && elses > 0
  const hasSmoothTransitions = returns(content) > 0

  const isRegularHexagon = hasProperGeometry && hasConsistentAngles && irregularityCount === 0

  let quality = 15
  if (totalFunctions > 0) quality += 10
  if (classes > 0) quality += 10
  if (interfaces > 0 || types > 0) quality += 10
  if (hasSharedWalls) quality += 10
  if (hasFlatTops) quality += 10
  if (isRegularHexagon) quality += 10
  if (hasProperVentilation) quality += 5
  if (hasProperDepth) quality += 5
  if (hasSmoothTransitions) quality += 5
  if (irregularityCount > 0) quality -= 5 * Math.min(irregularityCount, 3)
  quality = Math.max(0, Math.min(100, quality))

  let cellType: CellType = 'brood'
  if (classes > 0 && exports > 2) cellType = 'queen'
  else if (exports > 0 && imports > 0) cellType = 'worker'
  else if (exports > 0) cellType = 'honey'
  else if (totalFunctions > 3) cellType = 'drone'
  else if (totalFunctions > 0) cellType = 'pollen'

  return {
    quality, cellType, isRegularHexagon, hasProperGeometry, hasConsistentAngles,
    hasFlatTops, hasProperDepth, hasSharedWalls, hasProperVentilation,
    hasSmoothTransitions, irregularityCount,
  }
}

function returns(content: string): number {
  return (content.match(RETURN_RE) ?? []).length
}

// ─── measureDensity ─────────────────────────────────────────────────────────

/**
 * Measure code density
 * @example
 * measureDensity(content) // DensityMeasure
 */
export function measureDensity(content: string): DensityMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const totalFunctions = functions + arrows
  const lines = content.split('\n').filter(l => l.trim().length > 0).length

  const hasVoidSpaces = totalFunctions === 0 && lines > 0
  const hasDeadSpace = debuggers > 0 || anys > 0
  const hasHexagonalPacking = totalFunctions > 0 && exports > 0 && consts > totalFunctions
  const hasSquarePacking = vars > 0
  const hasLoosePacking = lines > 0 && totalFunctions === 0
  const hasOverPacking = totalFunctions > 20
  const hasTightJunctions = exports > 0 && totalFunctions > 0
  const isOptimallyPacked = hasHexagonalPacking && !hasOverPacking && !hasVoidSpaces

  const voidCount = hasVoidSpaces ? 1 : 0
  const deadSpaceCount = debuggers + anys

  let packing = 15
  if (totalFunctions > 0) packing += 10
  if (exports > 0) packing += 10
  if (hasHexagonalPacking) packing += 15
  if (hasTightJunctions) packing += 10
  if (isOptimallyPacked) packing += 10
  if (hasDeadSpace) packing -= 5
  if (hasVoidSpaces) packing -= 5
  if (hasOverPacking) packing -= 5
  if (lines > 10) packing += 5
  if (lines > 50) packing += 5
  packing = Math.max(0, Math.min(100, packing))

  return {
    packing, isOptimallyPacked, hasHexagonalPacking, hasSquarePacking,
    hasLoosePacking, hasOverPacking, hasVoidSpaces, hasDeadSpace,
    hasTightJunctions, voidCount, deadSpaceCount,
  }
}

// ─── measureWall ────────────────────────────────────────────────────────────

/**
 * Measure boundary strength
 * @example
 * measureWall(content) // WallMeasure
 */
export function measureWall(content: string): WallMeasure {
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const privates = (content.match(PRIVATE_RE) ?? []).length
  const protecteds = (content.match(PROTECTED_RE) ?? []).length
  const publics = (content.match(PUBLIC_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const tries = (content.match(TRY_RE) ?? []).length
  const catches = (content.match(CATCH_RE) ?? []).length

  const hasProperEncapsulation = classes > 0 && (privates > 0 || protecteds > 0)
  const hasThinWalls = anys > 0
  const hasThickWalls = privates > 3 || (classes > 0 && publics === 0 && privates === 0 && protecteds === 0)
  const hasReinforcedJoints = classes > 0 && (types > 0 || interfaces > 0)
  const hasWaxCapping = exports > 0 && (types > 0 || interfaces > 0)
  const hasPropolisSeal = tries > 0 && catches > 0
  const hasStructuralDamage = debuggers > 0 || anys > 2
  const hasMoistureBarrier = tries > 0
  const damageCount = debuggers + (anys > 2 ? anys - 2 : 0)
  const isStrong = !hasThinWalls && !hasStructuralDamage

  let thickness = 15
  if (hasProperEncapsulation) thickness += 15
  if (isStrong) thickness += 10
  if (hasReinforcedJoints) thickness += 10
  if (hasWaxCapping) thickness += 10
  if (hasPropolisSeal) thickness += 10
  if (hasMoistureBarrier) thickness += 10
  if (types > 0 || interfaces > 0) thickness += 10
  if (hasThinWalls) thickness -= 10
  if (hasStructuralDamage) thickness -= 10
  thickness = Math.max(0, Math.min(100, thickness))

  return {
    thickness, isStrong, hasProperEncapsulation, hasThinWalls, hasThickWalls,
    hasReinforcedJoints, hasWaxCapping, hasPropolisSeal, hasStructuralDamage,
    hasMoistureBarrier, damageCount,
  }
}

// ─── measureEfficiency ──────────────────────────────────────────────────────

/**
 * Measure algorithmic efficiency
 * @example
 * measureEfficiency(content) // EfficiencyMeasure
 */
export function measureEfficiency(content: string): EfficiencyMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const maps = (content.match(MAP_RE) ?? []).length
  const filters = (content.match(FILTER_RE) ?? []).length
  const reduces = (content.match(REDUCE_RE) ?? []).length
  const fors = (content.match(FOR_RE) ?? []).length
  const whiles = (content.match(WHILE_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const genericCount = (content.match(GENERIC_RE) ?? []).length
  const totalFunctions = functions + arrows
  const functionalOps = maps + filters + reduces
  const imperativeLoops = fors + whiles

  const hasMinimalWax = totalFunctions > 0 && totalFunctions <= 10
  const hasMaximumStorage = exports > 0
  const hasOptimalRatio = totalFunctions > 0 && consts >= totalFunctions
  const hasResourceConservation = functionalOps > 0 && imperativeLoops === 0
  const hasEnergyEfficiency = functionalOps > imperativeLoops
  const hasWingBeat = maps > 0 || filters > 0
  const hasThermoregulation = genericCount > 0
  const hasDanceLanguage = exports > 0 && imports > 0
  const wastePercent = Math.min(100, Math.round(((anys + debuggers) / Math.max(1, totalFunctions)) * 50))

  let score = 15
  if (hasMinimalWax) score += 10
  if (hasMaximumStorage) score += 10
  if (hasOptimalRatio) score += 10
  if (hasResourceConservation) score += 15
  if (hasEnergyEfficiency) score += 10
  if (hasDanceLanguage) score += 10
  if (hasThermoregulation) score += 5
  if (functionalOps > 0) score += 5
  if (wastePercent > 20) score -= 10
  if (anys > 0) score -= 5
  score = Math.max(0, Math.min(100, score))

  let type: EfficiencyType = 'destructive'
  if (score >= 85) type = 'optimal'
  else if (score >= 65) type = 'efficient'
  else if (score >= 45) type = 'adequate'
  else if (score >= 30) type = 'wasteful'
  else if (score >= 15) type = 'inefficient'

  return {
    score, type, hasMinimalWax, hasMaximumStorage, hasOptimalRatio,
    hasResourceConservation, hasEnergyEfficiency, hasWingBeat,
    hasThermoregulation, hasDanceLanguage, wastePercent,
  }
}

// ─── measureNectar ──────────────────────────────────────────────────────────

/**
 * Measure output quality
 * @example
 * measureNectar(content) // NectarMeasure
 */
export function measureNectar(content: string): NectarMeasure {
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const console = (content.match(CONSOLE_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const totalFunctions = functions + arrows

  const isPure = anys === 0 && console === 0
  const hasRichFlavor = exports > 0 && (types > 0 || interfaces > 0)
  const hasProperConsistency = totalFunctions > 0 && returns > 0
  const hasNoContamination = console === 0 && debuggers === 0
  const hasProperMoisture = jsdoc > 0
  const hasBeenCapped = exports > 0 && jsdoc > 0
  const hasBeenRipened = jsdoc > 0 && (types > 0 || interfaces > 0)
  const hasPollen = jsdoc > 0
  const contaminationCount = console + debuggers + anys

  let quality = 10
  if (isPure) quality += 15
  if (hasRichFlavor) quality += 10
  if (hasProperConsistency) quality += 10
  if (hasNoContamination) quality += 10
  if (hasProperMoisture) quality += 10
  if (hasBeenCapped) quality += 10
  if (hasBeenRipened) quality += 10
  if (hasPollen) quality += 5
  if (anys > 0) quality -= 10
  if (console > 0) quality -= 5
  quality = Math.max(0, Math.min(100, quality))

  let source: NectarSource = 'diluted'
  if (quality >= 85) source = 'manuka'
  else if (quality >= 70) source = 'orange-blossom'
  else if (quality >= 55) source = 'wildflower'
  else if (quality >= 40) source = 'clover'
  else if (quality >= 25) source = 'buckwheat'

  return {
    quality, source, isPure, hasRichFlavor, hasProperConsistency,
    hasNoContamination, hasProperMoisture, hasBeenCapped, hasBeenRipened,
    hasPollen, contaminationCount,
  }
}

// ─── measureHexagon ─────────────────────────────────────────────────────────

/**
 * Measure structural perfection
 * @example
 * measureHexagon(content) // HexagonMeasure
 */
export function measureHexagon(content: string): HexagonMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const totalFunctions = functions + arrows

  const hasEqualSides = totalFunctions > 0 && totalFunctions <= 10
  const hasProperAngles = types > 0 || interfaces > 0
  const hasFlatBottom = classes > 0
  const hasTaperedWalls = totalFunctions > 0 && totalFunctions <= 15
  const hasMirrorSymmetry = exports > 0 && imports > 0
  const hasRotationalSymmetry = classes > 0 && totalFunctions > 0

  const symmetryScore = Math.min(100, (hasEqualSides ? 20 : 0) + (hasProperAngles ? 20 : 0) +
    (hasFlatBottom ? 15 : 0) + (hasMirrorSymmetry ? 20 : 0) + (hasRotationalSymmetry ? 15 : 0) +
    (vars === 0 ? 10 : 0))

  const angleDeviation = Math.min(100, (anys * 20) + (vars * 10))

  let isGeometrically: GeometricQuality = 'collapsed'
  if (symmetryScore >= 90 && angleDeviation <= 5) isGeometrically = 'perfect'
  else if (symmetryScore >= 75) isGeometrically = 'nearly-perfect'
  else if (symmetryScore >= 55) isGeometrically = 'good'
  else if (symmetryScore >= 35) isGeometrically = 'irregular'
  else if (symmetryScore >= 15) isGeometrically = 'distorted'

  let perfection = symmetryScore - angleDeviation
  perfection = Math.max(0, Math.min(100, perfection))

  return {
    perfection, hasEqualSides, hasProperAngles, hasFlatBottom, hasTaperedWalls,
    hasMirrorSymmetry, hasRotationalSymmetry, isGeometrically, symmetryScore, angleDeviation,
  }
}

// ─── analyzeHoneycombCell ───────────────────────────────────────────────────

/**
 * Analyze a single file as a honeycomb cell
 * @example
 * analyzeHoneycombCell(content, 'file.ts') // HoneycombCell
 */
export function analyzeHoneycombCell(content: string, filePath: string): HoneycombCell {
  const structure = measureStructure(content)
  const density = measureDensity(content)
  const wall = measureWall(content)
  const efficiency = measureEfficiency(content)
  const nectar = measureNectar(content)
  const hexagon = measureHexagon(content)

  const cellStructure = structure.quality
  const packingDensity = density.packing
  const wallThickness = wall.thickness
  const combEfficiency = efficiency.score
  const nectarQuality = nectar.quality
  const hexagonalPerfection = hexagon.perfection

  const qualityScore = Math.round(
    (cellStructure + packingDensity + wallThickness + combEfficiency + nectarQuality + hexagonalPerfection) / 6,
  )

  let condition: CellCondition = 'wax-moth'
  if (qualityScore >= 80) condition = 'perfect-comb'
  else if (qualityScore >= 65) condition = 'golden-comb'
  else if (qualityScore >= 45) condition = 'freshly-drawn'
  else if (qualityScore >= 30) condition = 'functional-comb'
  else if (qualityScore >= 15) condition = 'damaged-comb'

  return {
    file: filePath, cellStructure, packingDensity, wallThickness,
    combEfficiency, nectarQuality, hexagonalPerfection,
    structure, density, wall, efficiency, nectar, hexagon,
    condition, qualityScore,
  }
}

// ─── classifyFrameType ──────────────────────────────────────────────────────

/**
 * Classify frame by cell quality
 * @example
 * classifyFrameType(cells) // FrameType
 */
export function classifyFrameType(cells: HoneycombCell[]): FrameType {
  if (cells.length === 0) return 'feral'
  const avg = cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length
  if (avg >= 75) return 'langstroth'
  if (avg >= 55) return 'top-bar'
  if (avg >= 35) return 'warre'
  if (avg >= 20) return 'skep'
  if (avg >= 10) return 'log-hive'
  return 'feral'
}

// ─── classifyBeekeeperGrade ─────────────────────────────────────────────────

/**
 * Classify overall beekeeper grade
 * @example
 * classifyBeekeeperGrade(90) // 'master-beekeeper'
 */
export function classifyBeekeeperGrade(avgApiary: number): BeekeeperGrade {
  if (avgApiary >= 85) return 'master-beekeeper'
  if (avgApiary >= 70) return 'senior-beekeeper'
  if (avgApiary >= 50) return 'beekeeper'
  if (avgApiary >= 30) return 'apprentice'
  if (avgApiary >= 15) return 'novice'
  return 'swarm-catcher'
}

// ─── analyzeHoneycombFrame ──────────────────────────────────────────────────

/**
 * Analyze a directory of cells as a honeycomb frame
 * @example
 * analyzeHoneycombFrame(cells, 'src/') // HoneycombFrame
 */
export function analyzeHoneycombFrame(cells: HoneycombCell[], dirPath: string): HoneycombFrame {
  if (cells.length === 0) {
    return {
      directory: dirPath, cells: [], avgStructure: 0, avgDensity: 0,
      avgEfficiency: 0, perfectCombCount: 0, waxMothCount: 0,
      efficientlyPackedCount: 0, pureNectarCount: 0,
      frameType: 'feral', condition: 'colony-collapse',
    }
  }

  const avgStructure = Math.round(cells.reduce((s, c) => s + c.cellStructure, 0) / cells.length)
  const avgDensity = Math.round(cells.reduce((s, c) => s + c.packingDensity, 0) / cells.length)
  const avgEfficiency = Math.round(cells.reduce((s, c) => s + c.combEfficiency, 0) / cells.length)
  const perfectCombCount = cells.filter(c => c.condition === 'perfect-comb').length
  const waxMothCount = cells.filter(c => c.condition === 'wax-moth').length
  const efficientlyPackedCount = cells.filter(c => c.density.isOptimallyPacked).length
  const pureNectarCount = cells.filter(c => c.nectar.isPure).length

  const frameType = classifyFrameType(cells)

  const avg = cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length
  let condition: FrameCondition = 'colony-collapse'
  if (avg >= 75) condition = 'thriving-colony'
  else if (avg >= 55) condition = 'healthy-hive'
  else if (avg >= 35) condition = 'established-colony'
  else if (avg >= 20) condition = 'new-swarm'
  else if (avg >= 10) condition = 'struggling-colony'

  return {
    directory: dirPath, cells, avgStructure, avgDensity, avgEfficiency,
    perfectCombCount, waxMothCount, efficientlyPackedCount, pureNectarCount,
    frameType, condition,
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate recommendations for the apiary
 * @example
 * generateRecommendations(cells, frames, apiary, stats) // string[]
 */
export function generateRecommendations(
  _cells: HoneycombCell[],
  _frames: HoneycombFrame[],
  apiary: HoneycombMatrixResult['apiary'],
  stats: HoneycombMatrixStats,
): string[] {
  const recs: string[] = []

  if (stats.waxMothCount > 0) {
    recs.push(`${stats.waxMothCount} cell(s) have wax moth — complete rewrite recommended`)
  }
  if (stats.hasVoidSpacesCount > 0) {
    recs.push(`${stats.hasVoidSpacesCount} cell(s) have void spaces — add meaningful implementations`)
  }
  if (stats.hasDeadSpaceCount > 0) {
    recs.push(`${stats.hasDeadSpaceCount} cell(s) have dead space — remove debugger/any types`)
  }
  if (stats.avgCellStructure < 30) {
    recs.push('Cell structure poor — add classes, interfaces, and types')
  }
  if (stats.avgPackingDensity < 30) {
    recs.push('Packing density low — improve code density with exports and functions')
  }
  if (stats.avgWallThickness < 30) {
    recs.push('Wall thickness weak — improve encapsulation and error handling')
  }
  if (stats.avgCombEfficiency < 30) {
    recs.push('Comb efficiency low — prefer functional patterns over imperative loops')
  }
  if (stats.avgNectarQuality < 30) {
    recs.push('Nectar quality poor — add documentation and type annotations')
  }
  if (stats.avgHexagonalPerfection < 30) {
    recs.push('Hexagonal perfection low — balance code structure and patterns')
  }
  if (!apiary.isThriving) {
    recs.push('Apiary not thriving — comprehensive quality improvements needed')
  }
  if (apiary.isThriving && stats.overallApiary >= 70) {
    recs.push('Apiary thriving — maintain current standards')
  }
  if (stats.overallApiary >= 85) {
    recs.push('Excellent honeycomb — document patterns for team learning')
  }

  if (recs.length === 0) {
    recs.push('All cells perfectly packed')
  }

  return Array.from(new Set(recs))
}

// ─── buildHoneycombMatrixResult ─────────────────────────────────────────────

/**
 * Build the complete honeycomb matrix analysis result
 * @example
 * buildHoneycombMatrixResult(files, contents, {}) // HoneycombMatrixResult
 */
export function buildHoneycombMatrixResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): HoneycombMatrixResult {
  const cells = files.map((file, i) => analyzeHoneycombCell(contents[i] ?? '', file))

  const dirMap = new Map<string, HoneycombCell[]>()
  for (const cell of cells) {
    const dir = cell.file.includes('/') ? cell.file.substring(0, cell.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(cell)
    } else {
      dirMap.set(dir, [cell])
    }
  }

  const frames = Array.from(dirMap.entries()).map(([dir, cls]) =>
    analyzeHoneycombFrame(cls, dir),
  )

  const avgCellStructure = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.cellStructure, 0) / cells.length) : 0
  const avgPackingDensity = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.packingDensity, 0) / cells.length) : 0
  const avgWallThickness = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.wallThickness, 0) / cells.length) : 0
  const avgCombEfficiency = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.combEfficiency, 0) / cells.length) : 0
  const avgNectarQuality = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.nectarQuality, 0) / cells.length) : 0
  const avgHexagonalPerfection = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.hexagonalPerfection, 0) / cells.length) : 0

  const overallApiary = Math.round(
    (avgCellStructure + avgPackingDensity + avgWallThickness + avgCombEfficiency + avgNectarQuality + avgHexagonalPerfection) / 6,
  )

  const apiaryResult: HoneycombMatrixResult['apiary'] = {
    avgStructure: avgCellStructure, avgDensity: avgPackingDensity,
    avgEfficiency: avgCombEfficiency,
    isThriving: overallApiary >= 50,
    overallApiary,
  }

  const conditionCounts = {
    perfectComb: cells.filter(c => c.condition === 'perfect-comb').length,
    goldenComb: cells.filter(c => c.condition === 'golden-comb').length,
    freshlyDrawn: cells.filter(c => c.condition === 'freshly-drawn').length,
    functionalComb: cells.filter(c => c.condition === 'functional-comb').length,
    damagedComb: cells.filter(c => c.condition === 'damaged-comb').length,
    waxMoth: cells.filter(c => c.condition === 'wax-moth').length,
  }

  const bestCell = cells.length > 0
    ? cells.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const bestStructured = cells.length > 0
    ? cells.reduce((best, c) => c.cellStructure > best.cellStructure ? c : best).file : ''
  const densestPacked = cells.length > 0
    ? cells.reduce((best, c) => c.packingDensity > best.packingDensity ? c : best).file : ''
  const mostEfficient = cells.length > 0
    ? cells.reduce((best, c) => c.combEfficiency > best.combEfficiency ? c : best).file : ''
  const purestNectar = cells.length > 0
    ? cells.reduce((best, c) => c.nectarQuality > best.nectarQuality ? c : best).file : ''

  const stats: HoneycombMatrixStats = {
    totalFiles: files.length,
    totalFrames: frames.length,
    avgCellStructure, avgPackingDensity, avgWallThickness, avgCombEfficiency,
    avgNectarQuality, avgHexagonalPerfection,
    perfectCombCount: conditionCounts.perfectComb,
    goldenCombCount: conditionCounts.goldenComb,
    freshlyDrawnCount: conditionCounts.freshlyDrawn,
    functionalCombCount: conditionCounts.functionalComb,
    damagedCombCount: conditionCounts.damagedComb,
    waxMothCount: conditionCounts.waxMoth,
    isRegularHexagonCount: cells.filter(c => c.structure.isRegularHexagon).length,
    hasSharedWallsCount: cells.filter(c => c.structure.hasSharedWalls).length,
    isOptimallyPackedCount: cells.filter(c => c.density.isOptimallyPacked).length,
    hasVoidSpacesCount: cells.filter(c => c.density.hasVoidSpaces).length,
    hasDeadSpaceCount: cells.filter(c => c.density.hasDeadSpace).length,
    isStrongCount: cells.filter(c => c.wall.isStrong).length,
    hasProperEncapsulationCount: cells.filter(c => c.wall.hasProperEncapsulation).length,
    hasMinimalWaxCount: cells.filter(c => c.efficiency.hasMinimalWax).length,
    isPureCount: cells.filter(c => c.nectar.isPure).length,
    hasBeenCappedCount: cells.filter(c => c.nectar.hasBeenCapped).length,
    hasEqualSidesCount: cells.filter(c => c.hexagon.hasEqualSides).length,
    overallApiary,
    beekeeperGrade: classifyBeekeeperGrade(overallApiary),
    bestCell, bestStructured, densestPacked, mostEfficient, purestNectar,
  }

  const recommendations = generateRecommendations(cells, frames, apiaryResult, stats)

  return { cells, frames, apiary: apiaryResult, stats, recommendations }
}
