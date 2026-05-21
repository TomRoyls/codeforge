// ─── Type Definitions ────────────────────────────────────

export type MagnetType = 'neodymium' | 'ceramic' | 'alnico' | 'electromagnet' | 'lodestone' | 'demagnetized'
export type FieldShape = 'dipole' | 'quadrupole' | 'solenoid' | 'toroid' | 'uniform' | 'chaotic'
export type PoleCondition = 'superconductor' | 'strong-magnet' | 'ferromagnetic' | 'paramagnetic' | 'diamagnetic' | 'insulator'
export type FieldType = 'fusion-reactor' | 'mri-machine' | 'motor' | 'generator' | 'compass' | 'demagnetized'
export type FieldCondition = 'perfectly-calibrated' | 'well-tuned' | 'functional' | 'misaligned' | 'chaotic' | 'degaussed'
export type PhysicistGrade = 'nobel-laureate' | 'physicist' | 'engineer' | 'technician' | 'student' | 'layman'

export interface MagnetMeasure {
  type: MagnetType
  strength: number
  gauss: number
  isPermanent: boolean
  isTemporary: boolean
  isMagnetized: boolean
  isDemagnetized: boolean
}

export interface FieldMeasure {
  range: number
  shape: FieldShape
  hasStrongField: boolean
  hasWeakField: boolean
  hasGradient: boolean
  fieldLines: number
  isContained: boolean
  hasLeakage: boolean
  leakagePoints: string[]
}

export interface CouplingMeasure {
  attractiveForce: number
  repulsiveForce: number
  netForce: number
  hasStrongAttraction: boolean
  hasStrongRepulsion: boolean
  isNeutral: boolean
  attractedTo: string[]
  repelledBy: string[]
  couplingPartners: number
}

export interface CoercivityMeasure {
  resistance: number
  isHardMagnet: boolean
  isSoftMagnet: boolean
  hasHysteresis: boolean
  hasSaturation: boolean
  hysteresisLoss: number
  isStable: boolean
}

export interface RemanenceMeasure {
  strength: number
  hasHighRemanence: boolean
  hasLowRemanence: boolean
  hasImprint: boolean
  imprintStrength: number
}

export interface PermeabilityMeasure {
  ease: number
  hasHighPermeability: boolean
  hasLowPermeability: boolean
  hasShielding: boolean
  hasSaturation: boolean
  shieldingCount: number
}

export interface PoleMeasure {
  north: number
  south: number
  isMonopole: boolean
  isDipole: boolean
  dominantPole: 'north' | 'south' | 'balanced'
}

export interface MagnetPole {
  file: string
  magneticStrength: number
  polarity: number
  fieldRange: number
  coercivity: number
  remanence: number
  permeability: number
  magnet: MagnetMeasure
  field: FieldMeasure
  coupling: CouplingMeasure
  coercivityDetail: CoercivityMeasure
  remanenceDetail: RemanenceMeasure
  permeabilityDetail: PermeabilityMeasure
  pole: PoleMeasure
  condition: PoleCondition
  qualityScore: number
}

export interface MagneticField {
  directory: string
  poles: MagnetPole[]
  avgStrength: number
  avgCoercivity: number
  avgPermeability: number
  strongMagnetCount: number
  insulatorCount: number
  superconductorCount: number
  hasLeakageCount: number
  fieldType: FieldType
  condition: FieldCondition
}

export interface LabMeasure {
  avgStrength: number
  avgCoercivity: number
  avgPermeability: number
  totalCouplingPartners: number
  isBalanced: boolean
  overallAlignment: number
}

export interface MagnetNeedleStats {
  totalFiles: number
  totalFields: number
  avgMagneticStrength: number
  avgFieldRange: number
  avgCoercivity: number
  avgRemanence: number
  avgPermeability: number
  superconductorCount: number
  strongMagnetCount: number
  ferromagneticCount: number
  paramagneticCount: number
  diamagneticCount: number
  insulatorCount: number
  neodymiumCount: number
  ceramicCount: number
  electromagnetCount: number
  demagnetizedCount: number
  hasStrongFieldCount: number
  hasLeakageCount: number
  hasHysteresisCount: number
  hasShieldingCount: number
  hardMagnetCount: number
  softMagnetCount: number
  strongAttractionCount: number
  isStableCount: number
  overallAlignment: number
  physicistGrade: PhysicistGrade
  strongestMagnet: string
  mostPermeable: string
  mostShielded: string
  highestCoercivity: string
  mostBalanced: string
}

export interface MagnetNeedleResult {
  poles: MagnetPole[]
  fields: MagneticField[]
  lab: LabMeasure
  stats: MagnetNeedleStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const t = content.match(/\btry\s*\{/g); if (t) count += t.length
  const c = content.match(/\bcatch\s/g); if (c) count += c.length
  const th = content.match(/\bthrow\s/g); if (th) count += th.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const i = content.match(/\bif\s*\(/g); if (i) count += i.length
  const e = content.match(/\belse\s/g); if (e) count += e.length
  const s = content.match(/\bswitch\s*\(/g); if (s) count += s.length
  return count
}

export function maxNesting(content: string): number {
  let max = 0, d = 0
  for (const ch of content) {
    if (ch === '{') { d++; if (d > max) max = d }
    if (ch === '}') d = Math.max(0, d - 1)
  }
  return max
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const s = content.match(/\/\/.*$/gm); if (s) count += s.length
  const b = content.match(/\/\*[\s\S]*?\*\//g); if (b) count += b.length
  return count
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countValidations(content: string): number {
  const m = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return m ? m.length : 0
}

export function extractImportPaths(content: string): string[] {
  const m = content.match(/^import\s+.*?from\s+['"]([^'"]+)['"]/gm)
  if (!m) return []
  return m.map(imp => {
    const pathMatch = imp.match(/from\s+['"]([^'"]+)['"]/)
    return pathMatch ? pathMatch[1] : ''
  }).filter(Boolean)
}

// ─── Magnet Measurement ──────────────────────────────────

/**
 * Measure magnet type and strength
 * @example
 * measureMagnet('export function calc() {}') // { type, strength, ... }
 */
export function measureMagnet(content: string): MagnetMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)

  const strength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (imports > 0 ? 15 : 0),
  )))

  const gauss = Math.min(100, Math.round((imports + exports) * 10))

  const isPermanent = imports > 0 && exports > 0
  const isTemporary = imports > 0 && exports === 0 && loc > 0
  const isMagnetized = imports > 0 || exports > 0
  const isDemagnetized = imports === 0 && exports === 0 && loc > 0

  let type: MagnetType = 'demagnetized'
  if (strength >= 80 && isPermanent) type = 'neodymium'
  else if (strength >= 60 && types > 0) type = 'ceramic'
  else if (strength >= 40 && exports > 0) type = 'alnico'
  else if (isTemporary) type = 'electromagnet'
  else if (loc > 0 && isDemagnetized) type = 'lodestone'

  return { type, strength, gauss, isPermanent, isTemporary, isMagnetized, isDemagnetized }
}

// ─── Field Measurement ───────────────────────────────────

/**
 * Measure field range and shape
 * @example
 * measureField('import { a } from "x"') // { range, shape, ... }
 */
export function measureField(content: string): FieldMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const branches = countBranches(content)

  const range = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports * 15) +
    (exports * 15) +
    (functions > 0 ? 10 : 0) +
    (countTypeAnnotations(content) > 0 ? 10 : 0),
  )))

  const hasStrongField = range >= 50
  const hasWeakField = range > 0 && range < 30
  const hasGradient = imports !== exports && loc > 0
  const fieldLines = imports + exports
  const isContained = exports > 0 && imports <= 2
  const hasLeakage = countConsole(content) > 0 && exports > 0

  const leakagePoints: string[] = []
  if (countConsole(content) > 0) leakagePoints.push('console-leak')
  if (countTodos(content) > 0 && exports > 0) leakagePoints.push('todo-leak')

  let shape: FieldShape = 'chaotic'
  if (imports === 0 && exports === 0 && loc > 0) shape = 'uniform'
  else if (imports > 0 && exports > 0 && Math.abs(imports - exports) <= 1) shape = 'dipole'
  else if (imports > 2 && exports > 2) shape = 'quadrupole'
  else if (functions > 3 && imports === 0) shape = 'solenoid'
  else if (loc > 0) shape = 'toroid'

  return { range, shape, hasStrongField, hasWeakField, hasGradient, fieldLines, isContained, hasLeakage, leakagePoints }
}

// ─── Coupling Measurement ────────────────────────────────

/**
 * Measure coupling forces
 * @example
 * measureCoupling('import { x } from "y"') // { attractiveForce, ... }
 */
export function measureCoupling(content: string): CouplingMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const importPaths = extractImportPaths(content)

  const attractiveForce = loc === 0 ? 0 : Math.min(100, imports * 25)
  const repulsiveForce = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countValidations(content) > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 10 : 0),
  )))
  const netForce = attractiveForce - repulsiveForce

  const hasStrongAttraction = attractiveForce >= 50
  const hasStrongRepulsion = repulsiveForce >= 50
  const isNeutral = loc === 0 || (attractiveForce < 20 && repulsiveForce < 20)

  const attractedTo = importPaths.slice(0, 10)
  const repelledBy: string[] = []
  if (countConsole(content) > 0) repelledBy.push('console-side-effect')
  if (countTodos(content) > 0) repelledBy.push('unfinished-code')

  const couplingPartners = imports + exports

  return { attractiveForce, repulsiveForce, netForce, hasStrongAttraction, hasStrongRepulsion, isNeutral, attractedTo, repelledBy, couplingPartners }
}

// ─── Coercivity Measurement ──────────────────────────────

/**
 * Measure resistance to change
 * @example
 * measureCoercivity('export function core() { try {} catch (e) {} }') // { resistance, ... }
 */
export function measureCoercivityMeasure(content: string): CoercivityMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const nesting = maxNesting(content)
  const branches = countBranches(content)

  const resistance = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (nesting > 3 ? 15 : 0) +
    (branches > 5 ? 10 : 0) +
    (countFunctions(content) > 3 ? 15 : 0),
  )))

  const isHardMagnet = resistance >= 60
  const isSoftMagnet = resistance > 0 && resistance < 40
  const hasHysteresis = branches > 3 && errors > 0
  const hasSaturation = couplingPartnersCount(content) > 6
  const hysteresisLoss = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting > 3 ? 30 : 0) +
    (branches > 5 ? 30 : 0) +
    (countTodos(content) * 15),
  )))
  const isStable = errors > 0 && countTodos(content) === 0

  return { resistance, isHardMagnet, isSoftMagnet, hasHysteresis, hasSaturation, hysteresisLoss, isStable }
}

function couplingPartnersCount(content: string): number {
  return countImports(content) + countExports(content)
}

// ─── Remanence Measurement ───────────────────────────────

/**
 * Measure lasting impact of changes
 * @example
 * measureRemanence('export function core() {}') // { strength, ... }
 */
export function measureRemanence(content: string): RemanenceMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)

  const strength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0),
  )))

  const hasHighRemanence = strength >= 60
  const hasLowRemanence = strength > 0 && strength < 30
  const hasImprint = jsdoc > 0 || countComments(content) > 3
  const imprintStrength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 40 : 0) +
    (countComments(content) > 3 ? 30 : 0) +
    (countDescriptiveNames(content) > 0 ? 30 : 0),
  )))

  return { strength, hasHighRemanence, hasLowRemanence, hasImprint, imprintStrength }
}

// ─── Permeability Measurement ────────────────────────────

/**
 * Measure ease of modification
 * @example
 * measurePermeability('export function f(x: number): number { return x }') // { ease, ... }
 */
export function measurePermeability(content: string): PermeabilityMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const nesting = maxNesting(content)
  const branches = countBranches(content)

  const ease = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting <= 3 ? 25 : 10) +
    (branches <= 5 ? 20 : 8) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0),
  )))

  const hasHighPermeability = ease >= 60
  const hasLowPermeability = ease > 0 && ease < 30
  const hasShielding = types > 0 && errors > 0
  const hasSaturation = nesting > 4 && branches > 8
  const shieldingCount = (types > 0 ? 1 : 0) + (errors > 0 ? 1 : 0) + (content.match(/\binterface\s+\w+/g) ? 1 : 0) + (content.match(/\bclass\s+\w+/g) ? 1 : 0)

  return { ease, hasHighPermeability, hasLowPermeability, hasShielding, hasSaturation, shieldingCount }
}

// ─── Pole Measurement ────────────────────────────────────

/**
 * Measure north/south pole balance
 * @example
 * measurePole('import { x } from "y"') // { north, south, ... }
 */
export function measurePole(content: string): PoleMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)

  const north = Math.min(100, exports * 20)
  const south = Math.min(100, imports * 20)

  const isMonopole = (exports === 0 && imports > 0) || (imports === 0 && exports > 0)
  const isDipole = exports > 0 && imports > 0
  const dominantPole: 'north' | 'south' | 'balanced' = loc === 0 ? 'balanced' : exports > imports ? 'north' : imports > exports ? 'south' : 'balanced'

  return { north, south, isMonopole, isDipole, dominantPole }
}

// ─── Classification ──────────────────────────────────────

export function classifyPoleCondition(qualityScore: number): PoleCondition {
  if (qualityScore >= 85) return 'superconductor'
  if (qualityScore >= 68) return 'strong-magnet'
  if (qualityScore >= 50) return 'ferromagnetic'
  if (qualityScore >= 32) return 'paramagnetic'
  if (qualityScore >= 15) return 'diamagnetic'
  return 'insulator'
}

export function classifyFieldType(poles: MagnetPole[]): FieldType {
  if (poles.length === 0) return 'demagnetized'
  const avg = poles.reduce((s, p) => s + p.qualityScore, 0) / poles.length
  if (avg >= 80) return 'fusion-reactor'
  if (avg >= 62) return 'mri-machine'
  if (avg >= 45) return 'motor'
  if (avg >= 28) return 'generator'
  if (avg >= 12) return 'compass'
  return 'demagnetized'
}

export function classifyFieldCondition(poles: MagnetPole[]): FieldCondition {
  if (poles.length === 0) return 'degaussed'
  const avg = poles.reduce((s, p) => s + p.qualityScore, 0) / poles.length
  if (avg >= 80) return 'perfectly-calibrated'
  if (avg >= 62) return 'well-tuned'
  if (avg >= 45) return 'functional'
  if (avg >= 28) return 'misaligned'
  if (avg >= 12) return 'chaotic'
  return 'degaussed'
}

export function classifyPhysicistGrade(avgAlignment: number): PhysicistGrade {
  if (avgAlignment >= 80) return 'nobel-laureate'
  if (avgAlignment >= 65) return 'physicist'
  if (avgAlignment >= 48) return 'engineer'
  if (avgAlignment >= 32) return 'technician'
  if (avgAlignment >= 16) return 'student'
  return 'layman'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a magnet pole
 * @example
 * analyzeMagnetPole('export function f(x: number): number { return x }', 'f.ts') // MagnetPole
 */
export function analyzeMagnetPole(content: string, filePath: string): MagnetPole {
  const magnet = measureMagnet(content)
  const field = measureField(content)
  const coupling = measureCoupling(content)
  const coercivityDetail = measureCoercivityMeasure(content)
  const remanenceDetail = measureRemanence(content)
  const permeabilityDetail = measurePermeability(content)
  const pole = measurePole(content)

  const magneticStrength = magnet.strength
  const fieldRange = field.range
  const coercivityScore = coercivityDetail.resistance
  const remanenceScore = remanenceDetail.strength
  const permeabilityScore = permeabilityDetail.ease
  const polarity = pole.north - pole.south

  const loc = countLoc(content)
  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (magneticStrength * 0.20) +
    (fieldRange * 0.10) +
    (coercivityScore * 0.15) +
    (remanenceScore * 0.15) +
    (permeabilityScore * 0.20) +
    (Math.abs(polarity) <= 40 ? 20 : 5),
  )))

  const condition = classifyPoleCondition(qualityScore)

  return {
    file: filePath,
    magneticStrength, polarity, fieldRange, coercivity: coercivityScore, remanence: remanenceScore, permeability: permeabilityScore,
    magnet, field, coupling, coercivityDetail, remanenceDetail, permeabilityDetail, pole,
    condition, qualityScore,
  }
}

// ─── Magnetic Field ──────────────────────────────────────

/**
 * Analyze a directory as a magnetic field
 * @example
 * analyzeMagneticField(poles, 'src') // MagneticField
 */
export function analyzeMagneticField(poles: MagnetPole[], dirPath: string): MagneticField {
  const n = poles.length
  const avgStrength = n === 0 ? 0 : Math.round(poles.reduce((s, p) => s + p.magneticStrength, 0) / n)
  const avgCoercivity = n === 0 ? 0 : Math.round(poles.reduce((s, p) => s + p.coercivity, 0) / n)
  const avgPermeability = n === 0 ? 0 : Math.round(poles.reduce((s, p) => s + p.permeability, 0) / n)
  const strongMagnetCount = poles.filter(p => p.condition === 'strong-magnet' || p.condition === 'superconductor').length
  const insulatorCount = poles.filter(p => p.condition === 'insulator').length
  const superconductorCount = poles.filter(p => p.condition === 'superconductor').length
  const hasLeakageCount = poles.filter(p => p.field.hasLeakage).length

  return {
    directory: dirPath, poles,
    avgStrength, avgCoercivity, avgPermeability,
    strongMagnetCount, insulatorCount, superconductorCount, hasLeakageCount,
    fieldType: classifyFieldType(poles),
    condition: classifyFieldCondition(poles),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(poles, fields, lab, stats) // string[]
 */
export function generateRecommendations(
  poles: MagnetPole[],
  fields: MagneticField[],
  lab: LabMeasure,
  stats: MagnetNeedleStats,
): string[] {
  const recs: string[] = []

  if (stats.insulatorCount + stats.diamagneticCount > 0) {
    recs.push(`Weak field: ${stats.insulatorCount + stats.diamagneticCount} file(s) need exports and types to generate coupling`)
  }
  if (stats.hasLeakageCount > 0) {
    recs.push(`Field leakage: ${stats.hasLeakageCount} file(s) have unintended coupling through console or TODOs`)
  }
  if (stats.hardMagnetCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('High coercivity - code is resistant to change, consider reducing nesting and branches')
  }
  if (stats.strongAttractionCount > stats.totalFiles * 0.6 && stats.totalFiles > 0) {
    recs.push('Over-attracted - too many tight couplings, consider dependency injection')
  }
  if (stats.demagnetizedCount > 0) {
    recs.push(`Demagnetized files: ${stats.demagnetizedCount} have no coupling at all`)
  }
  if (lab.overallAlignment >= 70) {
    recs.push('Well-calibrated field - excellent coupling balance throughout')
  }
  if (stats.isStableCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Stable magnets - good error handling keeps the field steady')
  }
  if (fields.length > 1) {
    const badFields = fields.filter(f => f.fieldType === 'demagnetized' || f.fieldType === 'compass')
    if (badFields.length > 0) {
      recs.push(`Weak fields: ${badFields.map(f => f.directory).join(', ')} need more coupling`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete magnet-needle result
 * @example
 * buildMagnetNeedleResult(['a.ts'], ['export function a() {}'], {}) // MagnetNeedleResult
 */
export function buildMagnetNeedleResult(files: string[], contents: string[], _options: Record<string, unknown>): MagnetNeedleResult {
  const poles: MagnetPole[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeMagnetPole(content, file)
  })

  const dirMap = new Map<string, MagnetPole[]>()
  for (const pole of poles) {
    const parts = pole.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(pole) } else { dirMap.set(dir, [pole]) }
  }

  const fields = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeMagneticField(ps, dir),
  )

  const totalFiles = poles.length
  const avg = (fn: (p: MagnetPole) => number) => totalFiles === 0 ? 0 : Math.round(poles.reduce((s, p) => s + fn(p), 0) / totalFiles)
  const overallAlignment = avg(p => p.qualityScore)
  const totalCouplingPartners = poles.reduce((s, p) => s + p.coupling.couplingPartners, 0)

  const lab: LabMeasure = {
    avgStrength: avg(p => p.magneticStrength),
    avgCoercivity: avg(p => p.coercivity),
    avgPermeability: avg(p => p.permeability),
    totalCouplingPartners,
    isBalanced: overallAlignment >= 60,
    overallAlignment,
  }

  const condCounts = { superconductor: 0, strongMagnet: 0, ferromagnetic: 0, paramagnetic: 0, diamagnetic: 0, insulator: 0 }
  const typeCounts = { neodymium: 0, ceramic: 0, electromagnet: 0, demagnetized: 0 }
  for (const p of poles) {
    switch (p.condition) {
      case 'superconductor': condCounts.superconductor++; break
      case 'strong-magnet': condCounts.strongMagnet++; break
      case 'ferromagnetic': condCounts.ferromagnetic++; break
      case 'paramagnetic': condCounts.paramagnetic++; break
      case 'diamagnetic': condCounts.diamagnetic++; break
      case 'insulator': condCounts.insulator++; break
    }
    switch (p.magnet.type) {
      case 'neodymium': typeCounts.neodymium++; break
      case 'ceramic': typeCounts.ceramic++; break
      case 'electromagnet': typeCounts.electromagnet++; break
      case 'demagnetized': typeCounts.demagnetized++; break
    }
  }

  const bestBalance = totalFiles === 0 ? 'none' : poles.reduce((b, p) => Math.abs(p.pole.north - p.pole.south) < Math.abs(b.pole.north - b.pole.south) ? p : b).file

  const stats: MagnetNeedleStats = {
    totalFiles,
    totalFields: fields.length,
    avgMagneticStrength: avg(p => p.magneticStrength),
    avgFieldRange: avg(p => p.fieldRange),
    avgCoercivity: avg(p => p.coercivity),
    avgRemanence: avg(p => p.remanence),
    avgPermeability: avg(p => p.permeability),
    superconductorCount: condCounts.superconductor,
    strongMagnetCount: condCounts.strongMagnet,
    ferromagneticCount: condCounts.ferromagnetic,
    paramagneticCount: condCounts.paramagnetic,
    diamagneticCount: condCounts.diamagnetic,
    insulatorCount: condCounts.insulator,
    neodymiumCount: typeCounts.neodymium,
    ceramicCount: typeCounts.ceramic,
    electromagnetCount: typeCounts.electromagnet,
    demagnetizedCount: typeCounts.demagnetized,
    hasStrongFieldCount: poles.filter(p => p.field.hasStrongField).length,
    hasLeakageCount: poles.filter(p => p.field.hasLeakage).length,
    hasHysteresisCount: poles.filter(p => p.coercivityDetail.hasHysteresis).length,
    hasShieldingCount: poles.filter(p => p.permeabilityDetail.hasShielding).length,
    hardMagnetCount: poles.filter(p => p.coercivityDetail.isHardMagnet).length,
    softMagnetCount: poles.filter(p => p.coercivityDetail.isSoftMagnet).length,
    strongAttractionCount: poles.filter(p => p.coupling.hasStrongAttraction).length,
    isStableCount: poles.filter(p => p.coercivityDetail.isStable).length,
    overallAlignment,
    physicistGrade: classifyPhysicistGrade(overallAlignment),
    strongestMagnet: totalFiles === 0 ? 'none' : poles.reduce((b, p) => p.magneticStrength > b.magneticStrength ? p : b).file,
    mostPermeable: totalFiles === 0 ? 'none' : poles.reduce((b, p) => p.permeability > b.permeability ? p : b).file,
    mostShielded: totalFiles === 0 ? 'none' : poles.reduce((b, p) => p.permeabilityDetail.shieldingCount > b.permeabilityDetail.shieldingCount ? p : b).file,
    highestCoercivity: totalFiles === 0 ? 'none' : poles.reduce((b, p) => p.coercivity > b.coercivity ? p : b).file,
    mostBalanced: bestBalance,
  }

  const recommendations = generateRecommendations(poles, fields, lab, stats)

  return { poles, fields, lab, stats, recommendations }
}
