// ─── Interfaces ──────────────────────────────────────────

export type MetalType = 'steel' | 'iron' | 'bronze' | 'copper' | 'tin' | 'clay'
export type MetalGrade = 'tool-steel' | 'spring-steel' | 'cast-iron' | 'wrought-iron' | 'pig-iron' | 'scrap'
export type ForgingTechnique = 'folded-steel' | 'cast' | 'machined' | 'hand-forged' | '3d-printed' | 'duct-tape'
export type HeatTreatment = 'quench' | 'anneal' | 'normalize' | 'case-harden' | 'none'
export type PieceCondition = 'masterwork-blade' | 'quality-tool' | 'serviceable-iron' | 'brittle-casting' | 'soft-metal' | 'scrap-iron'
export type ShopType = 'master-forge' | 'village-smithy' | 'factory' | 'workshop' | 'shed' | 'scrap-yard'
export type ShopCondition = 'world-class' | 'professional' | 'functional' | 'amateur' | 'dangerous' | 'condemned'
export type SmithGrade = 'master-smith' | 'journeyman' | 'apprentice' | 'tinkerer' | 'amateur' | 'scavenger'

export interface MetalMeasure {
  type: MetalType
  grade: MetalGrade
  hardness: number
  isAlloy: boolean
  hasImpurities: boolean
  impurityCount: number
  carbonContent: number
}

export interface TemperMeasure {
  quality: number
  isEvenlyTempered: boolean
  hasHardSpots: boolean
  hasSoftSpots: boolean
  isBrittle: boolean
  isDuctile: boolean
  hardSpotCount: number
  softSpotCount: number
}

export interface ImpactMeasure {
  resistance: number
  hasDefenses: boolean
  hasShockAbsorbers: boolean
  hasCrackStoppers: boolean
  hasStressRelief: boolean
  crackCount: number
  crackPoints: string[]
}

export interface ForgingMeasure {
  technique: ForgingTechnique
  quality: number
  hasHammerMarks: boolean
  hasGrindMarks: boolean
  isPolished: boolean
  isRough: boolean
  polishLevel: number
}

export interface TestingMeasure {
  hasHardnessTest: boolean
  hasStressTest: boolean
  hasImpactTest: boolean
  hasFatigueTest: boolean
  anvilMarkCount: number
  testQuality: number
}

export interface HeatMeasure {
  treatmentType: HeatTreatment
  hasBeenHardened: boolean
  isStillHot: boolean
  isCooling: boolean
  hasHeatTint: boolean
  stabilityScore: number
}

export interface ForgedPiece {
  file: string
  hardness: number
  temperQuality: number
  impactResistance: number
  ductility: number
  brittleness: number
  anvilMarks: number
  metal: MetalMeasure
  temper: TemperMeasure
  impact: ImpactMeasure
  forging: ForgingMeasure
  testing: TestingMeasure
  heat: HeatMeasure
  condition: PieceCondition
  qualityScore: number
}

export interface ForgeShop {
  directory: string
  pieces: ForgedPiece[]
  avgHardness: number
  avgTemper: number
  avgImpactResistance: number
  avgDuctility: number
  masterworkCount: number
  scrapCount: number
  testedCount: number
  brittleCount: number
  shopType: ShopType
  condition: ShopCondition
}

export interface Foundry {
  avgHardness: number
  avgTemper: number
  avgImpactResistance: number
  avgDuctility: number
  isBattleReady: boolean
  overallStrength: number
}

export interface ForgeHammerStats {
  totalFiles: number
  totalShops: number
  avgHardness: number
  avgTemperQuality: number
  avgImpactResistance: number
  avgDuctility: number
  avgBrittleness: number
  avgAnvilMarks: number
  masterworkBladeCount: number
  qualityToolCount: number
  serviceableIronCount: number
  brittleCastingCount: number
  softMetalCount: number
  scrapIronCount: number
  steelCount: number
  ironCount: number
  bronzeCount: number
  copperCount: number
  hasHardnessTestCount: number
  hasStressTestCount: number
  hasImpactTestCount: number
  hasFatigueTestCount: number
  evenlyTemperedCount: number
  hasDefensesCount: number
  isPolishedCount: number
  isStillHotCount: number
  overallStrength: number
  smithGrade: SmithGrade
  hardestPiece: string
  toughestPiece: string
  mostBrittle: string
  mostPolished: string
  needsForging: string
}

export interface ForgeHammerResult {
  pieces: ForgedPiece[]
  shops: ForgeShop[]
  foundry: Foundry
  stats: ForgeHammerStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const matches = content.match(/^import\s/gm)
  return matches ? matches.length : 0
}

export function countExports(content: string): number {
  const matches = content.match(/^export\s/gm)
  return matches ? matches.length : 0
}

export function countFunctions(content: string): number {
  const matches = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return matches ? matches.length : 0
}

export function countClasses(content: string): number {
  const matches = content.match(/\bclass\s+\w+/g)
  return matches ? matches.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const tryMatch = content.match(/\btry\s*\{/g)
  if (tryMatch) count += tryMatch.length
  const catchMatch = content.match(/\bcatch\s/g)
  if (catchMatch) count += catchMatch.length
  const throwMatch = content.match(/\bthrow\s/g)
  if (throwMatch) count += throwMatch.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const matches = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return matches ? matches.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const ifMatch = content.match(/\bif\s*\(/g)
  if (ifMatch) count += ifMatch.length
  const elseMatch = content.match(/\belse\s/g)
  if (elseMatch) count += elseMatch.length
  const switchMatch = content.match(/\bswitch\s*\(/g)
  if (switchMatch) count += switchMatch.length
  const ternaryMatch = content.match(/\?\s*[^?]/g)
  if (ternaryMatch) count += ternaryMatch.length
  return count
}

export function maxNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > maxDepth) maxDepth = depth }
    if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return maxDepth
}

export function countConsole(content: string): number {
  const matches = content.match(/\bconsole\.\w+/g)
  return matches ? matches.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const singleMatch = content.match(/\/\/.*$/gm)
  if (singleMatch) count += singleMatch.length
  const blockMatch = content.match(/\/\*[\s\S]*?\*\//g)
  if (blockMatch) count += blockMatch.length
  return count
}

export function countTodos(content: string): number {
  const matches = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return matches ? matches.length : 0
}

export function countJSDoc(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\//g)
  return matches ? matches.length : 0
}

export function countDescriptiveNames(content: string): number {
  const matches = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return matches ? matches.length : 0
}

export function countTestIndicators(content: string): number {
  const matches = content.match(/\b(describe|it|test|expect|beforeEach|afterEach|beforeAll|afterAll)\s*[\(.]/g)
  return matches ? matches.length : 0
}

export function countValidations(content: string): number {
  const matches = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return matches ? matches.length : 0
}

// ─── Metal Measurement ───────────────────────────────────

/**
 * Measure metal properties
 * @example
 * measureMetal('export function calc() {}') // { type, grade, hardness, ... }
 */
export function measureMetal(content: string): MetalMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const hardness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 && types > 0 ? 15 : 0) +
    (branches > 0 && errors > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (todos === 0 ? 5 : 0),
  )))

  let type: MetalType = 'clay'
  if (hardness >= 80) type = 'steel'
  else if (hardness >= 60) type = 'iron'
  else if (hardness >= 45) type = 'bronze'
  else if (hardness >= 30) type = 'copper'
  else if (hardness >= 15) type = 'tin'

  let grade: MetalGrade = 'scrap'
  if (hardness >= 85 && types > 0) grade = 'tool-steel'
  else if (hardness >= 70) grade = 'spring-steel'
  else if (hardness >= 55) grade = 'cast-iron'
  else if (hardness >= 40) grade = 'wrought-iron'
  else if (hardness >= 20) grade = 'pig-iron'

  const isAlloy = functions > 0 && classes > 0 && types > 0
  const impurityCount = todos + consoleCount
  const hasImpurities = impurityCount > 0
  const carbonContent = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches * 5) +
    (maxNesting(content) * 10),
  )))

  return { type, grade, hardness, isAlloy, hasImpurities, impurityCount, carbonContent }
}

// ─── Temper Measurement ──────────────────────────────────

/**
 * Measure temper quality
 * @example
 * measureTemper('try { x } catch (e) { handle(e) }') // { quality, isEvenlyTempered, ... }
 */
export function measureTemper(content: string): TemperMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const types = countTypeAnnotations(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (branches > 0 && errors > 0 ? 20 : 0) +
    (errors >= 2 ? 15 : 0) +
    (branches <= 10 ? 10 : 0) +
    (maxNesting(content) <= 3 ? 10 : 0),
  )))

  const isEvenlyTempered = errors > 0 && branches > 0 && Math.abs(errors - branches) <= 3
  const hardSpotCount = branches > 0 && errors === 0 ? 1 : 0
  const softSpotCount = errors > 0 && branches > errors * 2 ? 1 : 0
  const hasHardSpots = hardSpotCount > 0
  const hasSoftSpots = softSpotCount > 0
  const isBrittle = branches > 5 && errors === 0
  const isDuctile = errors > 0 && types > 0 && branches <= 10

  return { quality, isEvenlyTempered, hasHardSpots, hasSoftSpots, isBrittle, isDuctile, hardSpotCount, softSpotCount }
}

// ─── Impact Measurement ──────────────────────────────────

/**
 * Measure impact resistance
 * @example
 * measureImpact('if (x === null) return') // { resistance, hasDefenses, ... }
 */
export function measureImpact(content: string): ImpactMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const validations = countValidations(content)
  const branches = countBranches(content)

  const resistance = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (validations > 0 ? 20 : 0) +
    (branches > 0 && errors > 0 ? 20 : 0) +
    (errors >= 2 ? 15 : 0) +
    (countTypeAnnotations(content) > 0 ? 10 : 0) +
    (loc <= 50 ? 10 : 0),
  )))

  const hasDefenses = validations > 0
  const hasShockAbsorbers = errors > 0
  const hasCrackStoppers = /\btry\s*\{/.test(content) && /\bcatch\s/.test(content)
  const hasStressRelief = /\bretry\b|\bfallback\b|\bdefault\b|\belse\b/.test(content)

  const crackPoints: string[] = []
  if (branches > 0 && errors === 0) crackPoints.push('unhandled-branches')
  if (loc > 50 && errors === 0) crackPoints.push('long-file-no-errors')
  if (maxNesting(content) > 3 && errors === 0) crackPoints.push('deep-nesting-no-handling')
  if (countFunctions(content) > 3 && errors === 0) crackPoints.push('many-functions-no-handling')

  const crackCount = crackPoints.length

  return { resistance, hasDefenses, hasShockAbsorbers, hasCrackStoppers, hasStressRelief, crackCount, crackPoints }
}

// ─── Forging Measurement ─────────────────────────────────

/**
 * Measure forging quality
 * @example
 * measureForging('export function calc() {}') // { technique, quality, ... }
 */
export function measureForging(content: string): ForgingMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const descriptive = countDescriptiveNames(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0) +
    (descriptive > 0 ? 10 : 0) +
    (countFunctions(content) > 0 ? 10 : 0) +
    (countClasses(content) > 0 ? 5 : 0) +
    (countTodos(content) === 0 ? 10 : 0),
  )))

  let technique: ForgingTechnique = 'duct-tape'
  if (exports > 0 && imports > 0 && types > 0 && jsdoc > 0) technique = 'folded-steel'
  else if (exports > 0 && types > 0) technique = 'machined'
  else if (exports > 0 && imports > 0) technique = 'hand-forged'
  else if (exports > 0) technique = 'cast'
  else if (loc > 0) technique = '3d-printed'

  const hasHammerMarks = comments > 2 || jsdoc > 0
  const hasGrindMarks = comments > 0 && exports > 0
  const polishLevel = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (descriptive > 0 ? 20 : 0) +
    (countTodos(content) === 0 ? 15 : 0) +
    (countConsole(content) === 0 ? 15 : 0),
  )))
  const isPolished = polishLevel >= 60
  const isRough = polishLevel < 30 && loc > 0

  return { technique, quality, hasHammerMarks, hasGrindMarks, isPolished, isRough, polishLevel }
}

// ─── Testing Measurement ─────────────────────────────────

/**
 * Measure testing evidence
 * @example
 * measureTesting('describe("x", () => { it("y") })') // { hasHardnessTest, ... }
 */
export function measureTesting(content: string): TestingMeasure {
  const tests = countTestIndicators(content)
  const hasDescribe = /\bdescribe\s*[\(.]/.test(content)
  const hasExpect = /\bexpect\s*\(/.test(content)
  const hasBeforeEach = /\b(beforeEach|afterEach|beforeAll|afterAll)\s*[\(.]/.test(content)

  const hasHardnessTest = hasDescribe || tests > 0
  const hasStressTest = hasDescribe && hasExpect
  const hasImpactTest = hasExpect && countBranches(content) > 0
  const hasFatigueTest = hasBeforeEach
  const anvilMarkCount = tests

  const testQuality = tests === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (tests >= 2 ? 30 : 15) +
    (hasDescribe ? 20 : 0) +
    (hasExpect ? 20 : 0) +
    (hasBeforeEach ? 15 : 0) +
    (tests >= 5 ? 15 : 0),
  )))

  return { hasHardnessTest, hasStressTest, hasImpactTest, hasFatigueTest, anvilMarkCount, testQuality }
}

// ─── Heat Measurement ────────────────────────────────────

/**
 * Measure heat treatment and stability
 * @example
 * measureHeat('export function calc() {}') // { treatmentType, hasBeenHardened, ... }
 */
export function measureHeat(content: string): HeatMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const tests = countTestIndicators(content)
  const todos = countTodos(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)

  const hasBeenHardened = errors > 0 || tests > 0
  const isStillHot = todos > 0
  const isCooling = todos > 0 && errors > 0
  const hasHeatTint = comments > 0 && errors > 0

  let treatmentType: HeatTreatment = 'none'
  if (errors > 0 && tests > 0 && jsdoc > 0) treatmentType = 'quench'
  else if (errors > 0 && tests > 0) treatmentType = 'case-harden'
  else if (errors > 0) treatmentType = 'anneal'
  else if (tests > 0) treatmentType = 'normalize'

  const stabilityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasBeenHardened ? 30 : 0) +
    (todos === 0 ? 25 : 0) +
    (tests > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (!isStillHot ? 10 : 0),
  )))

  return { treatmentType, hasBeenHardened, isStillHot, isCooling, hasHeatTint, stabilityScore }
}

// ─── Condition Classification ────────────────────────────

export function classifyCondition(qualityScore: number): PieceCondition {
  if (qualityScore >= 85) return 'masterwork-blade'
  if (qualityScore >= 68) return 'quality-tool'
  if (qualityScore >= 50) return 'serviceable-iron'
  if (qualityScore >= 32) return 'brittle-casting'
  if (qualityScore >= 15) return 'soft-metal'
  return 'scrap-iron'
}

export function classifyShopType(pieces: ForgedPiece[]): ShopType {
  if (pieces.length === 0) return 'scrap-yard'
  const avg = pieces.reduce((s, p) => s + p.qualityScore, 0) / pieces.length
  if (avg >= 80) return 'master-forge'
  if (avg >= 62) return 'village-smithy'
  if (avg >= 45) return 'factory'
  if (avg >= 28) return 'workshop'
  if (avg >= 12) return 'shed'
  return 'scrap-yard'
}

export function classifyShopCondition(pieces: ForgedPiece[]): ShopCondition {
  if (pieces.length === 0) return 'condemned'
  const avg = pieces.reduce((s, p) => s + p.qualityScore, 0) / pieces.length
  if (avg >= 80) return 'world-class'
  if (avg >= 62) return 'professional'
  if (avg >= 45) return 'functional'
  if (avg >= 28) return 'amateur'
  if (avg >= 12) return 'dangerous'
  return 'condemned'
}

export function classifySmithGrade(avgStrength: number): SmithGrade {
  if (avgStrength >= 80) return 'master-smith'
  if (avgStrength >= 65) return 'journeyman'
  if (avgStrength >= 48) return 'apprentice'
  if (avgStrength >= 32) return 'tinkerer'
  if (avgStrength >= 16) return 'amateur'
  return 'scavenger'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a forged piece
 * @example
 * analyzeForgedPiece('export function calc() {}', 'calc.ts') // ForgedPiece
 */
export function analyzeForgedPiece(content: string, filePath: string): ForgedPiece {
  const metal = measureMetal(content)
  const temper = measureTemper(content)
  const impact = measureImpact(content)
  const forging = measureForging(content)
  const testing = measureTesting(content)
  const heat = measureHeat(content)

  const hardness = metal.hardness
  const temperQuality = temper.quality
  const impactResistance = impact.resistance
  const loc = countLoc(content)
  const ductility = loc === 0 ? 0 : temper.isDuctile ? Math.min(100, temper.quality + 10) : temper.quality
  const brittleness = loc === 0 ? 0 : temper.isBrittle ? Math.min(100, 100 - temper.quality + 20) : Math.max(0, 100 - temper.quality - 20)
  const anvilMarks = testing.anvilMarkCount

  const qualityScore = countLoc(content) === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hardness * 0.20) +
    (temperQuality * 0.15) +
    (impactResistance * 0.20) +
    (forging.quality * 0.15) +
    (testing.testQuality * 0.15) +
    (heat.stabilityScore * 0.15),
  )))

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    hardness, temperQuality, impactResistance, ductility, brittleness, anvilMarks,
    metal, temper, impact, forging, testing, heat,
    condition, qualityScore,
  }
}

// ─── Forge Shop ──────────────────────────────────────────

/**
 * Analyze a directory as a forge shop
 * @example
 * analyzeForgeShop(pieces, 'src') // ForgeShop
 */
export function analyzeForgeShop(pieces: ForgedPiece[], dirPath: string): ForgeShop {
  const avgHardness = pieces.length === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.hardness, 0) / pieces.length)
  const avgTemper = pieces.length === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.temperQuality, 0) / pieces.length)
  const avgImpactResistance = pieces.length === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.impactResistance, 0) / pieces.length)
  const avgDuctility = pieces.length === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.ductility, 0) / pieces.length)
  const masterworkCount = pieces.filter(p => p.condition === 'masterwork-blade').length
  const scrapCount = pieces.filter(p => p.condition === 'scrap-iron' || p.condition === 'soft-metal').length
  const testedCount = pieces.filter(p => p.testing.hasHardnessTest).length
  const brittleCount = pieces.filter(p => p.temper.isBrittle).length

  const shopType = classifyShopType(pieces)
  const condition = classifyShopCondition(pieces)

  return {
    directory: dirPath, pieces,
    avgHardness, avgTemper, avgImpactResistance, avgDuctility,
    masterworkCount, scrapCount, testedCount, brittleCount,
    shopType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(pieces, shops, foundry, stats) // string[]
 */
export function generateRecommendations(
  pieces: ForgedPiece[],
  shops: ForgeShop[],
  foundry: Foundry,
  stats: ForgeHammerStats,
): string[] {
  const recs: string[] = []

  if (stats.scrapIronCount + stats.softMetalCount > 0) {
    recs.push(`Weak metal: ${stats.scrapIronCount + stats.softMetalCount} file(s) need hardening with error handling`)
  }
  if (stats.brittleCastingCount > stats.totalFiles * 0.3) {
    recs.push('High brittleness ratio - add error handling to prevent shattering under stress')
  }
  if (stats.hasHardnessTestCount === 0 && stats.totalFiles > 0) {
    recs.push('No hardness testing detected - add unit tests to verify metal quality')
  }
  if (stats.isStillHotCount > 0) {
    recs.push(`Still hot: ${stats.isStillHotCount} file(s) contain TODOs and may be unstable`)
  }
  if (stats.evenlyTemperedCount === 0 && stats.totalFiles > 0) {
    recs.push('No evenly tempered code - balance error handling with control flow')
  }
  if (foundry.overallStrength >= 70) {
    recs.push('Battle-ready codebase - good hardness and temper across the foundry')
  }
  if (stats.isPolishedCount > stats.totalFiles * 0.5) {
    recs.push('Well-polished code - clean documentation and typing throughout')
  }
  if (shops.length > 1) {
    const weakShops = shops.filter(s => s.shopType === 'shed' || s.shopType === 'scrap-yard')
    if (weakShops.length > 0) {
      recs.push(`Weak shops: ${weakShops.map(s => s.directory).join(', ')} need reinforcement`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete forge-hammer result
 * @example
 * buildForgeHammerResult(['a.ts'], ['export function a() {}'], {}) // ForgeHammerResult
 */
export function buildForgeHammerResult(files: string[], contents: string[], _options: Record<string, unknown>): ForgeHammerResult {
  const pieces: ForgedPiece[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeForgedPiece(content, file)
  })

  const dirMap = new Map<string, ForgedPiece[]>()
  for (const piece of pieces) {
    const parts = piece.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(piece) } else { dirMap.set(dir, [piece]) }
  }

  const shops = Array.from(dirMap.entries()).map(([dir, dirPieces]) =>
    analyzeForgeShop(dirPieces, dir),
  )

  const totalFiles = pieces.length
  const avgHardness = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.hardness, 0) / totalFiles)
  const avgTemperQuality = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.temperQuality, 0) / totalFiles)
  const avgImpactResistance = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.impactResistance, 0) / totalFiles)
  const avgDuctility = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.ductility, 0) / totalFiles)
  const avgBrittleness = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.brittleness, 0) / totalFiles)
  const avgAnvilMarks = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.anvilMarks, 0) / totalFiles)
  const overallStrength = totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / totalFiles)

  const foundry: Foundry = {
    avgHardness,
    avgTemper: avgTemperQuality,
    avgImpactResistance,
    avgDuctility,
    isBattleReady: overallStrength >= 60,
    overallStrength,
  }

  const conditionCounts = { masterworkBlade: 0, qualityTool: 0, serviceableIron: 0, brittleCasting: 0, softMetal: 0, scrapIron: 0 }
  const metalCounts = { steel: 0, iron: 0, bronze: 0, copper: 0, tin: 0, clay: 0 }

  for (const piece of pieces) {
    switch (piece.condition) {
      case 'masterwork-blade': conditionCounts.masterworkBlade++; break
      case 'quality-tool': conditionCounts.qualityTool++; break
      case 'serviceable-iron': conditionCounts.serviceableIron++; break
      case 'brittle-casting': conditionCounts.brittleCasting++; break
      case 'soft-metal': conditionCounts.softMetal++; break
      case 'scrap-iron': conditionCounts.scrapIron++; break
    }
    switch (piece.metal.type) {
      case 'steel': metalCounts.steel++; break
      case 'iron': metalCounts.iron++; break
      case 'bronze': metalCounts.bronze++; break
      case 'copper': metalCounts.copper++; break
      case 'tin': metalCounts.tin++; break
      case 'clay': metalCounts.clay++; break
    }
  }

  const hardestPiece = totalFiles === 0 ? 'none' :
    pieces.reduce((best, p) => p.hardness > best.hardness ? p : best).file
  const toughestPiece = totalFiles === 0 ? 'none' :
    pieces.reduce((best, p) => p.impactResistance > best.impactResistance ? p : best).file
  const mostBrittle = totalFiles === 0 ? 'none' :
    pieces.reduce((worst, p) => p.brittleness > worst.brittleness ? p : worst).file
  const mostPolished = totalFiles === 0 ? 'none' :
    pieces.reduce((best, p) => p.forging.polishLevel > best.forging.polishLevel ? p : best).file
  const needsForging = totalFiles === 0 ? 'none' :
    pieces.reduce((worst, p) => p.qualityScore < worst.qualityScore ? p : worst).file

  const stats: ForgeHammerStats = {
    totalFiles,
    totalShops: shops.length,
    avgHardness,
    avgTemperQuality,
    avgImpactResistance,
    avgDuctility,
    avgBrittleness,
    avgAnvilMarks,
    masterworkBladeCount: conditionCounts.masterworkBlade,
    qualityToolCount: conditionCounts.qualityTool,
    serviceableIronCount: conditionCounts.serviceableIron,
    brittleCastingCount: conditionCounts.brittleCasting,
    softMetalCount: conditionCounts.softMetal,
    scrapIronCount: conditionCounts.scrapIron,
    steelCount: metalCounts.steel,
    ironCount: metalCounts.iron,
    bronzeCount: metalCounts.bronze,
    copperCount: metalCounts.copper,
    hasHardnessTestCount: pieces.filter(p => p.testing.hasHardnessTest).length,
    hasStressTestCount: pieces.filter(p => p.testing.hasStressTest).length,
    hasImpactTestCount: pieces.filter(p => p.testing.hasImpactTest).length,
    hasFatigueTestCount: pieces.filter(p => p.testing.hasFatigueTest).length,
    evenlyTemperedCount: pieces.filter(p => p.temper.isEvenlyTempered).length,
    hasDefensesCount: pieces.filter(p => p.impact.hasDefenses).length,
    isPolishedCount: pieces.filter(p => p.forging.isPolished).length,
    isStillHotCount: pieces.filter(p => p.heat.isStillHot).length,
    overallStrength,
    smithGrade: classifySmithGrade(overallStrength),
    hardestPiece,
    toughestPiece,
    mostBrittle,
    mostPolished,
    needsForging,
  }

  const recommendations = generateRecommendations(pieces, shops, foundry, stats)

  return { pieces, shops, foundry, stats, recommendations }
}
