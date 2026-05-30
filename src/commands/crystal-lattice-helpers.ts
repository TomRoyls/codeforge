// ─── Type Definitions ────────────────────────────────────

export type StructureType = 'diamond-cubic' | 'face-centered' | 'body-centered' | 'hexagonal' | 'amorphous' | 'glass'
export type CrystalCondition = 'flawless-diamond' | 'precious-gem' | 'quality-crystal' | 'industrial-crystal' | 'flawed-crystal' | 'gravel'
export type VeinType = 'diamond-mine' | 'quartz-vein' | 'gem-deposit' | 'ore-body' | 'gravel-pit' | 'sand'
export type VeinCondition = 'pristine-lode' | 'quality-vein' | 'workable-deposit' | 'low-grade' | 'tailings' | 'barren'
export type GemologistGrade = 'master-gemologist' | 'gemologist' | 'mineralogist' | 'geologist' | 'rock-collector' | 'child'

export interface StructureMeasure {
  type: StructureType
  regularity: number
  hasUnitCells: boolean
  hasGrainBoundaries: boolean
  hasLongRangeOrder: boolean
  hasShortRangeOrder: boolean
  grainBoundaryCount: number
  unitCellSize: number
}

export interface BondMeasure {
  count: number
  avgStrength: number
  hasStrongBonds: boolean
  hasWeakBonds: boolean
  hasBrokenBonds: boolean
  hasStrainedBonds: boolean
  hasHydrogenBonds: boolean
  hasCovalentBonds: boolean
  hasIonicBonds: boolean
  brokenCount: number
  strainedCount: number
}

export interface DefectMeasure {
  density: number
  hasVacancies: boolean
  hasInterstitials: boolean
  hasDislocations: boolean
  hasSubstitutions: boolean
  hasPrecipitates: boolean
  vacancyCount: number
  dislocationCount: number
  precipitateCount: number
}

export interface CleavageMeasure {
  quality: number
  hasNaturalPlanes: boolean
  hasConchoidalFracture: boolean
  isEasilyCleaved: boolean
  isDifficultToCleaved: boolean
  hasPerfectCleavage: boolean
  cleavagePlanes: number
}

export interface ClarityMeasure {
  transparency: number
  isInclusions: boolean
  hasFractures: boolean
  hasCloudiness: boolean
  isFlawless: boolean
  isOpaque: boolean
  inclusionCount: number
  fractureCount: number
}

export interface HardnessMeasure {
  mohs: number
  isScratchResistant: boolean
  isBrittle: boolean
  isDuctile: boolean
  isElastic: boolean
  toughness: number
}

export interface CrystalAtom {
  file: string
  crystalStructure: number
  bondStrength: number
  latticeEnergy: number
  defectDensity: number
  cleavageQuality: number
  crystalClarity: number
  structure: StructureMeasure
  bonds: BondMeasure
  defects: DefectMeasure
  cleavage: CleavageMeasure
  clarity: ClarityMeasure
  hardness: HardnessMeasure
  condition: CrystalCondition
  qualityScore: number
}

export interface CrystalVein {
  directory: string
  atoms: CrystalAtom[]
  avgStructure: number
  avgBondStrength: number
  avgClarity: number
  flawlessCount: number
  gravelCount: number
  totalDefects: number
  veinType: VeinType
  condition: VeinCondition
}

export interface MineMeasure {
  avgStructure: number
  avgBondStrength: number
  avgClarity: number
  totalDefects: number
  isStable: boolean
  overallPurity: number
}

export interface CrystalLatticeStats {
  totalFiles: number
  totalVeins: number
  avgCrystalStructure: number
  avgBondStrength: number
  avgLatticeEnergy: number
  avgDefectDensity: number
  avgCleavageQuality: number
  avgCrystalClarity: number
  flawlessDiamondCount: number
  preciousGemCount: number
  qualityCrystalCount: number
  industrialCrystalCount: number
  flawedCrystalCount: number
  gravelCount: number
  diamondCubicCount: number
  faceCenteredCount: number
  amorphousCount: number
  glassCount: number
  hasVacanciesCount: number
  hasDislocationsCount: number
  hasPrecipitatesCount: number
  hasPerfectCleavageCount: number
  isFlawlessCount: number
  isOpaqueCount: number
  isBrittleCount: number
  isDuctileCount: number
  covalentBondCount: number
  ionicBondCount: number
  brokenBondCount: number
  overallPurity: number
  gemologistGrade: GemologistGrade
  purestCrystal: string
  strongestBonds: string
  clearestCrystal: string
  mostDefective: string
  easiestToCleaved: string
}

export interface CrystalLatticeResult {
  atoms: CrystalAtom[]
  veins: CrystalVein[]
  mine: MineMeasure
  stats: CrystalLatticeStats
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

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
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
  const m = content.match(/from\s+['"]([^'"]+)['"]/g)
  if (!m) return []
  return m.map(s => {
    const inner = s.match(/['"]([^'"]+)['"]/)
    return inner?.[1] ?? ''
  }).filter(Boolean)
}

// ─── Structure Measurement ────────────────────────────────

/**
 * Measure crystal structure regularity
 * @example
 * measureStructure('export function f(x: number): number { return x }') // { type, regularity, ... }
 */
export function measureStructure(content: string): StructureMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const interfaces = countInterfaces(content)

  const regularity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const hasUnitCells = functions > 0 && (exports > 0 || types > 0)
  const hasGrainBoundaries = countConsole(content) > 0 || countTodos(content) > 0
  const hasLongRangeOrder = regularity >= 60
  const hasShortRangeOrder = regularity >= 30
  const grainBoundaryCount = countConsole(content) + countTodos(content)
  const unitCellSize = functions + countClasses(content) + interfaces

  let type: StructureType = 'amorphous'
  if (regularity >= 85 && exports > 0 && types > 0 && interfaces > 0) type = 'diamond-cubic'
  else if (regularity >= 70 && exports > 0 && types > 0) type = 'face-centered'
  else if (regularity >= 55 && (exports > 0 || types > 0)) type = 'body-centered'
  else if (regularity >= 40 && functions > 0) type = 'hexagonal'
  else if (loc > 0) type = 'glass'

  return { type, regularity, hasUnitCells, hasGrainBoundaries, hasLongRangeOrder, hasShortRangeOrder, grainBoundaryCount, unitCellSize }
}

// ─── Bond Measurement ────────────────────────────────────

/**
 * Measure coupling bond strength
 * @example
 * measureBonds('import { x } from "y"; export function f(): void {}') // { count, avgStrength, ... }
 */
export function measureBonds(content: string): BondMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const importPaths = extractImportPaths(content)
  const count = importPaths.length

  const avgStrength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (countInterfaces(content) > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (imports > 0 ? 5 : 0),
  )))

  const hasStrongBonds = types > 0 && imports > 0
  const hasWeakBonds = imports > 0 && types === 0
  const hasBrokenBonds = imports > 0 && exports === 0 && loc > 5
  const hasStrainedBonds = maxNesting(content) > 4 && imports > 0
  const hasHydrogenBonds = imports > 0 && countValidations(content) === 0
  const hasCovalentBonds = types > 0 && exports > 0 && countErrorHandling(content) > 0
  const hasIonicBonds = countInterfaces(content) > 0 && imports > 0
  const brokenCount = hasBrokenBonds ? 1 : 0
  const strainedCount = hasStrainedBonds ? 1 : 0

  return { count, avgStrength, hasStrongBonds, hasWeakBonds, hasBrokenBonds, hasStrainedBonds, hasHydrogenBonds, hasCovalentBonds, hasIonicBonds, brokenCount, strainedCount }
}

// ─── Defect Measurement ──────────────────────────────────

/**
 * Measure defect density
 * @example
 * measureDefects('function f() { console.log("TODO") }') // { density, hasVacancies, ... }
 */
export function measureDefects(content: string): DefectMeasure {
  const loc = countLoc(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const errors = countErrorHandling(content)

  const density = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (todos * 20) +
    (consoleCount * 10) +
    (maxNesting(content) > 4 ? 15 : 0) +
    (countBranches(content) > 8 ? 10 : 0) +
    (errors === 0 && countFunctions(content) > 2 ? 10 : 0),
  )))

  const hasVacancies = countFunctions(content) > 0 && countExports(content) === 0
  const hasInterstitials = consoleCount > 0
  const hasDislocations = maxNesting(content) > 3
  const hasSubstitutions = todos > 0
  const hasPrecipitates = todos > 1 || (todos > 0 && consoleCount > 0)
  const vacancyCount = hasVacancies ? 1 : 0
  const dislocationCount = Math.max(0, maxNesting(content) - 3)
  const precipitateCount = todos + consoleCount

  return { density, hasVacancies, hasInterstitials, hasDislocations, hasSubstitutions, hasPrecipitates, vacancyCount, dislocationCount, precipitateCount }
}

// ─── Cleavage Measurement ────────────────────────────────

/**
 * Measure cleavage quality
 * @example
 * measureCleavage('export function f(x: number): number { return x }') // { quality, hasNaturalPlanes, ... }
 */
export function measureCleavage(content: string): CleavageMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (functions <= 3 ? 20 : functions <= 6 ? 10 : 0) +
    (maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0) +
    (countImports(content) <= 5 ? 10 : 5) +
    (classes <= 1 ? 10 : 0),
  )))

  const hasNaturalPlanes = exports > 0 && types > 0
  const hasConchoidalFracture = maxNesting(content) > 4 || countBranches(content) > 8
  const isEasilyCleaved = quality >= 60 && functions <= 5
  const isDifficultToCleaved = quality < 30 || functions > 10
  const hasPerfectCleavage = quality >= 80 && hasNaturalPlanes
  const cleavagePlanes = exports + classes

  return { quality, hasNaturalPlanes, hasConchoidalFracture, isEasilyCleaved, isDifficultToCleaved, hasPerfectCleavage, cleavagePlanes }
}

// ─── Clarity Measurement ─────────────────────────────────

/**
 * Measure crystal clarity
 * @example
 * measureClarity('export function validate(x: number): number { return x }') // { transparency, isFlawless, ... }
 */
export function measureClarity(content: string): ClarityMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)

  const transparency = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (countConsole(content) === 0 ? 5 : 0),
  )))

  const isInclusions = maxNesting(content) > 3
  const hasFractures = countBranches(content) > 5 && countErrorHandling(content) === 0
  const hasCloudiness = types === 0 && loc > 5
  const isFlawless = transparency >= 80 && countTodos(content) === 0 && countConsole(content) === 0
  const isOpaque = transparency < 20 && loc > 0
  const inclusionCount = Math.max(0, maxNesting(content) - 2)
  const fractureCount = hasFractures ? Math.max(0, countBranches(content) - 5) : 0

  return { transparency, isInclusions, hasFractures, hasCloudiness, isFlawless, isOpaque, inclusionCount, fractureCount }
}

// ─── Hardness Measurement ────────────────────────────────

/**
 * Measure crystal hardness
 * @example
 * measureHardness('function f(x: number): number { try { return x } catch (e) { return 0 } }') // { mohs, toughness, ... }
 */
export function measureHardness(content: string): HardnessMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const tests = countValidations(content)
  const branches = countBranches(content)

  const mohs = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (tests > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (branches > 0 && branches <= 5 ? 15 : branches > 5 ? 5 : 0) +
    (maxNesting(content) <= 3 ? 15 : 0),
  )))

  const isScratchResistant = mohs >= 70
  const isBrittle = errors === 0 && branches > 3
  const isDuctile = errors > 0 && types > 0
  const isElastic = errors > 0 && branches > 0 && branches <= 5
  const toughness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors * 10) +
    (types > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (branches > 0 ? 10 : 0),
  )))

  return { mohs, isScratchResistant, isBrittle, isDuctile, isElastic, toughness }
}

// ─── Classification ──────────────────────────────────────

export function classifyCrystalCondition(qualityScore: number): CrystalCondition {
  if (qualityScore >= 85) return 'flawless-diamond'
  if (qualityScore >= 68) return 'precious-gem'
  if (qualityScore >= 50) return 'quality-crystal'
  if (qualityScore >= 32) return 'industrial-crystal'
  if (qualityScore >= 15) return 'flawed-crystal'
  return 'gravel'
}

export function classifyVeinType(atoms: CrystalAtom[]): VeinType {
  if (atoms.length === 0) return 'sand'
  const avg = atoms.reduce((s, a) => s + a.qualityScore, 0) / atoms.length
  if (avg >= 80) return 'diamond-mine'
  if (avg >= 62) return 'quartz-vein'
  if (avg >= 45) return 'gem-deposit'
  if (avg >= 28) return 'ore-body'
  if (avg >= 12) return 'gravel-pit'
  return 'sand'
}

export function classifyVeinCondition(atoms: CrystalAtom[]): VeinCondition {
  if (atoms.length === 0) return 'barren'
  const avg = atoms.reduce((s, a) => s + a.qualityScore, 0) / atoms.length
  if (avg >= 80) return 'pristine-lode'
  if (avg >= 62) return 'quality-vein'
  if (avg >= 45) return 'workable-deposit'
  if (avg >= 28) return 'low-grade'
  if (avg >= 12) return 'tailings'
  return 'barren'
}

export function classifyGemologistGrade(avgPurity: number): GemologistGrade {
  if (avgPurity >= 80) return 'master-gemologist'
  if (avgPurity >= 65) return 'gemologist'
  if (avgPurity >= 48) return 'mineralogist'
  if (avgPurity >= 32) return 'geologist'
  if (avgPurity >= 16) return 'rock-collector'
  return 'child'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a crystal atom
 * @example
 * analyzeCrystalAtom('export function f(x: number): number { return x }', 'f.ts') // CrystalAtom
 */
export function analyzeCrystalAtom(content: string, filePath: string): CrystalAtom {
  const structure = measureStructure(content)
  const bonds = measureBonds(content)
  const defects = measureDefects(content)
  const cleavage = measureCleavage(content)
  const clarity = measureClarity(content)
  const hardness = measureHardness(content)

  const loc = countLoc(content)
  const crystalStructure = structure.regularity
  const bondStrength = bonds.avgStrength
  const latticeEnergy = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (crystalStructure * 0.25) +
    (bondStrength * 0.25) +
    (clarity.transparency * 0.20) +
    (hardness.mohs * 0.15) +
    (100 - defects.density * 0.15),
  )))
  const defectDensity = defects.density
  const cleavageQuality = cleavage.quality
  const crystalClarity = clarity.transparency

  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (crystalStructure * 0.20) +
    (bondStrength * 0.15) +
    (latticeEnergy * 0.15) +
    (100 - defectDensity) * 0.15 +
    (cleavageQuality * 0.15) +
    (crystalClarity * 0.20),
  )))

  const condition = classifyCrystalCondition(qualityScore)

  return {
    file: filePath,
    crystalStructure, bondStrength, latticeEnergy, defectDensity, cleavageQuality, crystalClarity,
    structure, bonds, defects, cleavage, clarity, hardness,
    condition, qualityScore,
  }
}

// ─── Crystal Vein ────────────────────────────────────────

/**
 * Analyze a directory as a crystal vein
 * @example
 * analyzeCrystalVein(atoms, 'src') // CrystalVein
 */
export function analyzeCrystalVein(atoms: CrystalAtom[], dirPath: string): CrystalVein {
  const n = atoms.length
  const avgStructure = n === 0 ? 0 : Math.round(atoms.reduce((s, a) => s + a.crystalStructure, 0) / n)
  const avgBondStrength = n === 0 ? 0 : Math.round(atoms.reduce((s, a) => s + a.bondStrength, 0) / n)
  const avgClarity = n === 0 ? 0 : Math.round(atoms.reduce((s, a) => s + a.crystalClarity, 0) / n)
  const flawlessCount = atoms.filter(a => a.condition === 'flawless-diamond').length
  const gravelCount = atoms.filter(a => a.condition === 'gravel').length
  const totalDefects = atoms.reduce((s, a) => s + a.defects.precipitateCount, 0)

  return {
    directory: dirPath, atoms,
    avgStructure, avgBondStrength, avgClarity,
    flawlessCount, gravelCount, totalDefects,
    veinType: classifyVeinType(atoms),
    condition: classifyVeinCondition(atoms),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(atoms, veins, mine, stats) // string[]
 */
export function generateRecommendations(
  _atoms: CrystalAtom[],
  veins: CrystalVein[],
  mine: MineMeasure,
  stats: CrystalLatticeStats,
): string[] {
  const recs: string[] = []

  if (stats.gravelCount + stats.flawedCrystalCount > 0) {
    recs.push(`Smoothing required: ${stats.gravelCount + stats.flawedCrystalCount} file(s) need structural refinement`)
  }
  if (stats.hasVacanciesCount > stats.totalFiles * 0.3 && stats.totalFiles > 0) {
    recs.push('Crystal vacancies detected - add exports to fill lattice gaps')
  }
  if (stats.brokenBondCount > 0) {
    recs.push(`Broken bonds: ${stats.brokenBondCount} file(s) have unfulfilled import connections`)
  }
  if (stats.isOpaqueCount > 0) {
    recs.push(`Opaque crystals: ${stats.isOpaqueCount} file(s) lack transparency - add type annotations`)
  }
  if (stats.isBrittleCount > 0) {
    recs.push(`Brittle structure: ${stats.isBrittleCount} file(s) may crack under change - add error handling`)
  }
  if (mine.overallPurity >= 70) {
    recs.push('Pure crystal deposit - excellent structural quality throughout')
  }
  if (stats.hasPerfectCleavageCount > 0) {
    recs.push(`Perfect cleavage: ${stats.hasPerfectCleavageCount} file(s) exhibit ideal modularity`)
  }
  if (veins.length > 1) {
    const barrenVeins = veins.filter(v => v.veinType === 'sand' || v.veinType === 'gravel-pit')
    if (barrenVeins.length > 0) {
      recs.push(`Barren veins: ${barrenVeins.map(v => v.directory).join(', ')} need crystallization`)
    }
  }
  if (stats.amorphousCount + stats.glassCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Amorphous codebase - establish regular patterns with types and exports')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete crystal-lattice result
 * @example
 * buildCrystalLatticeResult(['a.ts'], ['export function a() {}'], {}) // CrystalLatticeResult
 */
export function buildCrystalLatticeResult(files: string[], contents: string[], _options: Record<string, unknown>): CrystalLatticeResult {
  const atoms: CrystalAtom[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeCrystalAtom(content ?? '', file)
  })

  const dirMap = new Map<string, CrystalAtom[]>()
  for (const a of atoms) {
    const parts = a.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(a) } else { dirMap.set(dir, [a]) }
  }

  const veins = Array.from(dirMap.entries()).map(([dir, as]) =>
    analyzeCrystalVein(as, dir),
  )

  const totalFiles = atoms.length
  const avg = (fn: (a: CrystalAtom) => number) => totalFiles === 0 ? 0 : Math.round(atoms.reduce((s, a) => s + fn(a), 0) / totalFiles)
  const overallPurity = avg(a => a.qualityScore)

  const mine: MineMeasure = {
    avgStructure: avg(a => a.crystalStructure),
    avgBondStrength: avg(a => a.bondStrength),
    avgClarity: avg(a => a.crystalClarity),
    totalDefects: atoms.reduce((s, a) => s + a.defects.precipitateCount, 0),
    isStable: overallPurity >= 60,
    overallPurity,
  }

  const condCounts = { flawless: 0, precious: 0, quality: 0, industrial: 0, flawed: 0, gravel: 0 }
  for (const a of atoms) {
    switch (a.condition) {
      case 'flawless-diamond': condCounts.flawless++; break
      case 'precious-gem': condCounts.precious++; break
      case 'quality-crystal': condCounts.quality++; break
      case 'industrial-crystal': condCounts.industrial++; break
      case 'flawed-crystal': condCounts.flawed++; break
      case 'gravel': condCounts.gravel++; break
    }
  }

  const stats: CrystalLatticeStats = {
    totalFiles,
    totalVeins: veins.length,
    avgCrystalStructure: avg(a => a.crystalStructure),
    avgBondStrength: avg(a => a.bondStrength),
    avgLatticeEnergy: avg(a => a.latticeEnergy),
    avgDefectDensity: avg(a => a.defectDensity),
    avgCleavageQuality: avg(a => a.cleavageQuality),
    avgCrystalClarity: avg(a => a.crystalClarity),
    flawlessDiamondCount: condCounts.flawless,
    preciousGemCount: condCounts.precious,
    qualityCrystalCount: condCounts.quality,
    industrialCrystalCount: condCounts.industrial,
    flawedCrystalCount: condCounts.flawed,
    gravelCount: condCounts.gravel,
    diamondCubicCount: atoms.filter(a => a.structure.type === 'diamond-cubic').length,
    faceCenteredCount: atoms.filter(a => a.structure.type === 'face-centered').length,
    amorphousCount: atoms.filter(a => a.structure.type === 'amorphous').length,
    glassCount: atoms.filter(a => a.structure.type === 'glass').length,
    hasVacanciesCount: atoms.filter(a => a.defects.hasVacancies).length,
    hasDislocationsCount: atoms.filter(a => a.defects.hasDislocations).length,
    hasPrecipitatesCount: atoms.filter(a => a.defects.hasPrecipitates).length,
    hasPerfectCleavageCount: atoms.filter(a => a.cleavage.hasPerfectCleavage).length,
    isFlawlessCount: atoms.filter(a => a.clarity.isFlawless).length,
    isOpaqueCount: atoms.filter(a => a.clarity.isOpaque).length,
    isBrittleCount: atoms.filter(a => a.hardness.isBrittle).length,
    isDuctileCount: atoms.filter(a => a.hardness.isDuctile).length,
    covalentBondCount: atoms.filter(a => a.bonds.hasCovalentBonds).length,
    ionicBondCount: atoms.filter(a => a.bonds.hasIonicBonds).length,
    brokenBondCount: atoms.filter(a => a.bonds.hasBrokenBonds).length,
    overallPurity,
    gemologistGrade: classifyGemologistGrade(overallPurity),
    purestCrystal: totalFiles === 0 ? 'none' : atoms.reduce((b, a) => a.crystalStructure > b.crystalStructure ? a : b).file,
    strongestBonds: totalFiles === 0 ? 'none' : atoms.reduce((b, a) => a.bondStrength > b.bondStrength ? a : b).file,
    clearestCrystal: totalFiles === 0 ? 'none' : atoms.reduce((b, a) => a.crystalClarity > b.crystalClarity ? a : b).file,
    mostDefective: totalFiles === 0 ? 'none' : atoms.reduce((b, a) => a.defectDensity > b.defectDensity ? a : b).file,
    easiestToCleaved: totalFiles === 0 ? 'none' : atoms.reduce((b, a) => a.cleavageQuality > b.cleavageQuality ? a : b).file,
  }

  const recommendations = generateRecommendations(atoms, veins, mine, stats)

  return { atoms, veins, mine, stats, recommendations }
}
