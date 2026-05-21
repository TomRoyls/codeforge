// ─── Types ────────────────────────────────────────────────────────────────────

export type ClayType = 'porcelain' | 'stoneware' | 'earthenware' | 'terra-cotta' | 'clay' | 'mud'
export type Atmosphere = 'oxidation' | 'reduction' | 'neutral' | 'smoky' | 'raw'
export type FinishedGrade = 'masterwork' | 'fine-craft' | 'studio-pottery' | 'production' | 'craft-fair' | 'amateur'
export type PieceCondition = 'masterwork-porcelain' | 'fine-stoneware' | 'quality-earthenware' | 'greenware' | 'raw-clay' | 'cracked-pot'
export type KilnType = 'anagama' | 'gas-kiln' | 'electric-kiln' | 'raku' | 'pit-fire' | 'cold'
export type LoadCondition = 'gallery-exhibition' | 'studio-collection' | 'craft-market' | 'pottery-class' | 'messy-bench' | 'clay-pit'
export type PotterGrade = 'master-potter' | 'studio-potter' | 'production-potter' | 'hobbyist' | 'student' | 'child'

export interface ClayMeasure {
  type: ClayType
  quality: number
  hasImpurities: boolean
  hasAirBubbles: boolean
  isWorkable: boolean
  isConsistent: boolean
  impurityCount: number
  bubbleCount: number
}

export interface GreenMeasure {
  strength: number
  isLeatherHard: boolean
  isBoneDry: boolean
  hasCracks: boolean
  hasWarping: boolean
  crackCount: number
  isReadyForKiln: boolean
}

export interface BisqueMeasure {
  hardness: number
  isFired: boolean
  isBisque: boolean
  hasCrazing: boolean
  hasShivering: boolean
  hasDunting: boolean
  crazingPoints: number
  coverage: number
}

export interface GlazeMeasure {
  quality: number
  hasBaseCoat: boolean
  hasDecorative: boolean
  hasProtective: boolean
  isFoodSafe: boolean
  hasCrawling: boolean
  hasPinholing: boolean
  isEven: boolean
  crawlingCount: number
  pinholeCount: number
}

export interface FiringMeasure {
  temperature: number
  atmosphere: Atmosphere
  soak: number
  ramp: number
  isProperlyFired: boolean
  isOverFired: boolean
  isUnderFired: boolean
  hasThermalShock: boolean
  hasSpalling: boolean
}

export interface FinishedMeasure {
  hardness: number
  ring: string
  isVitrified: boolean
  isPorous: boolean
  isFragile: boolean
  hasStructuralIntegrity: boolean
  grade: FinishedGrade
}

export interface PotteryPiece {
  file: string
  clayQuality: number
  greenStrength: number
  bisqueHardness: number
  glazeQuality: number
  firingTemperature: number
  finalHardness: number
  clay: ClayMeasure
  green: GreenMeasure
  bisque: BisqueMeasure
  glaze: GlazeMeasure
  firing: FiringMeasure
  finished: FinishedMeasure
  condition: PieceCondition
  qualityScore: number
}

export interface KilnLoad {
  directory: string
  pieces: PotteryPiece[]
  avgClayQuality: number
  avgBisqueHardness: number
  avgGlazeQuality: number
  avgFinalHardness: number
  masterworkCount: number
  crackedCount: number
  greenCount: number
  firedCount: number
  kilnType: KilnType
  condition: LoadCondition
}

export interface Studio {
  avgClayQuality: number
  avgBisqueHardness: number
  avgGlazeQuality: number
  avgFinalHardness: number
  masterworkCount: number
  isProductionReady: boolean
  overallHardness: number
}

export interface KilnFireStats {
  totalFiles: number
  totalLoads: number
  avgClayQuality: number
  avgGreenStrength: number
  avgBisqueHardness: number
  avgGlazeQuality: number
  avgFiringTemperature: number
  avgFinalHardness: number
  masterworkPorcelainCount: number
  fineStonewareCount: number
  qualityEarthenwareCount: number
  greenwareCount: number
  rawClayCount: number
  crackedPotCount: number
  porcelainCount: number
  stonewareCount: number
  earthenwareCount: number
  terraCottaCount: number
  hasTestsCount: number
  properlyFiredCount: number
  overFiredCount: number
  underFiredCount: number
  hasDocsCount: number
  hasTypesCount: number
  vitrifiedCount: number
  fragileCount: number
  overallHardness: number
  potterGrade: PotterGrade
  bestPiece: string
  hardestPiece: string
  bestGlazed: string
  mostFragile: string
  needsFiring: string
}

export interface KilnFireResult {
  pieces: PotteryPiece[]
  loads: KilnLoad[]
  studio: Studio
  stats: KilnFireStats
  recommendations: string[]
}

// ─── Content Primitives ───────────────────────────────────────────────────────

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
 * Count classes
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) ?? []).length
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
 * Count comments markers
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

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

/**
 * Count test indicators
 * @example
 * countTestIndicators('describe("test", () => {})') // 1
 */
export function countTestIndicators(content: string): number {
  return (content.match(/\b(?:describe|it|test|expect)\s*\(/g) ?? []).length
}

// ─── Measurement Functions ────────────────────────────────────────────────────

/**
 * Measure clay quality from code content
 * @example
 * measureClay('export function a(): number { return 1 }') // { type: 'stoneware', ... }
 */
export function measureClay(content: string): ClayMeasure {
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)
  const classes = countClasses(content)
  const branches = countBranches(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)

  const quality = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (loc === 0 ? 0 : (
      (exports > 0 ? 15 : 0) +
      (functions > 0 ? 10 : 0) +
      (imports > 0 ? 10 : 0) +
      (classes > 0 ? 10 : 0) +
      (!consoleCount ? 10 : 0) +
      (todos === 0 ? 10 : 0)
    )),
  )))

  let type: ClayType = 'mud'
  if (quality >= 80) type = 'porcelain'
  else if (quality >= 60) type = 'stoneware'
  else if (quality >= 40) type = 'earthenware'
  else if (quality >= 25) type = 'terra-cotta'
  else if (loc > 0) type = 'clay'

  const impurityCount = todos + consoleCount
  const hasImpurities = impurityCount > 0
  const bubbleCount = functions > 0 && types === 0 ? functions : 0
  const hasAirBubbles = bubbleCount > 0
  const isWorkable = loc > 0 && functions + classes > 0
  const isConsistent = branches > 0 ? errors > 0 : true

  return { type, quality, hasImpurities, hasAirBubbles, isWorkable, isConsistent, impurityCount, bubbleCount }
}

/**
 * Measure green (pre-fire) strength
 * @example
 * measureGreen('export function a() {}') // { strength, ... }
 */
export function measureGreen(content: string): GreenMeasure {
  const functions = countFunctions(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const branches = countBranches(content)
  const loc = countLoc(content)

  const strength = Math.min(100, Math.max(0, Math.round(
    (functions > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (loc >= 10 ? 10 : 0) +
    (branches > 0 && errors > 0 ? 15 : 0),
  )))

  const isLeatherHard = functions > 0 && exports > 0 && types === 0
  const isBoneDry = functions > 0 && exports > 0 && types > 0 && errors > 0
  const crackCount = branches > 0 && errors === 0 ? Math.min(branches, 5) : 0
  const hasCracks = crackCount > 0
  const hasWarping = imports > 0 && exports === 0
  const isReadyForKiln = isBoneDry && !hasCracks

  return { strength, isLeatherHard, isBoneDry, hasCracks, hasWarping, crackCount, isReadyForKiln }
}

/**
 * Measure bisque (testing) hardness
 * @example
 * measureBisque('describe("test", () => { it("works") })') // { hardness, ... }
 */
export function measureBisque(content: string): BisqueMeasure {
  const testIndicators = countTestIndicators(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const loc = countLoc(content)

  const isFired = testIndicators > 0
  const isBisque = testIndicators >= 3
  const hardness = Math.min(100, Math.max(0, Math.round(
    (isFired ? 25 : 0) +
    (isBisque ? 25 : 0) +
    (errors > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0),
  )))

  const hasCrazing = branches > 3 && !isFired
  const hasShivering = isFired && testIndicators < 2
  const hasDunting = isFired && branches > 5 && testIndicators < 3
  const crazingPoints = hasCrazing ? branches - 3 : 0
  const coverage = Math.min(100, Math.max(0, Math.round(
    (isFired ? 40 : 0) +
    (isBisque ? 30 : 0) +
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 10 : 0),
  )))

  return { hardness, isFired, isBisque, hasCrazing, hasShivering, hasDunting, crazingPoints, coverage }
}

/**
 * Measure glaze (documentation) quality
 * @example
 * measureGlaze('export function a() {}') // { quality, ... }
 */
export function measureGlaze(content: string): GlazeMeasure {
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)
  const descriptive = countDescriptiveNames(content)
  const errors = countErrorHandling(content)

  const hasBaseCoat = comments > 0 || jsdoc > 0
  const hasDecorative = jsdoc > 0 && exports > 0
  const hasProtective = types > 0
  const isFoodSafe = types > 0 && errors > 0 && exports > 0
  const hasCrawling = exports > 0 && jsdoc === 0
  const hasPinholing = functions > 0 && types === 0
  const isEven = hasBaseCoat && hasProtective
  const crawlingCount = hasCrawling ? exports : 0
  const pinholeCount = hasPinholing ? functions : 0

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasBaseCoat ? 20 : 0) +
    (hasDecorative ? 20 : 0) +
    (hasProtective ? 25 : 0) +
    (isEven ? 15 : 0) +
    (!hasCrawling ? 10 : 0) +
    (!hasPinholing ? 10 : 0),
  )))

  return { quality, hasBaseCoat, hasDecorative, hasProtective, isFoodSafe, hasCrawling, hasPinholing, isEven, crawlingCount, pinholeCount }
}

/**
 * Measure firing (test thoroughness)
 * @example
 * measureFiring('describe("a", () => { it("b"); it("c") })') // { temperature, ... }
 */
export function measureFiring(content: string): FiringMeasure {
  const testIndicators = countTestIndicators(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)
  const nesting = maxNesting(content)
  const exports = countExports(content)

  const temperature = Math.min(100, Math.max(0, Math.round(
    (testIndicators > 0 ? 30 : 0) +
    (testIndicators >= 5 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0),
  )))

  let atmosphere: Atmosphere = 'raw'
  if (testIndicators >= 5 && errors > 0 && types > 0) atmosphere = 'oxidation'
  else if (testIndicators >= 3 && errors > 0) atmosphere = 'reduction'
  else if (testIndicators > 0) atmosphere = 'neutral'
  else if (errors > 0) atmosphere = 'smoky'

  const soak = Math.min(100, Math.max(0, Math.round(
    (testIndicators > 0 ? 40 : 0) +
    (testIndicators >= 3 ? 30 : 0) +
    (errors > 0 ? 20 : 0) +
    (branches > 0 && testIndicators > 0 ? 10 : 0),
  )))

  const ramp = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 30 : 0) +
    (errors > 0 ? 30 : 0) +
    (functions > 0 ? 20 : 0) +
    (exports > 0 ? 20 : 0),
  )))

  const isProperlyFired = testIndicators >= 2
  const isOverFired = testIndicators > 20 && nesting > 5
  const isUnderFired = testIndicators === 0 && functions > 0
  const hasThermalShock = nesting > 4 && errors === 0
  const hasSpalling = branches > 5 && errors === 0 && testIndicators === 0

  return { temperature, atmosphere, soak, ramp, isProperlyFired, isOverFired, isUnderFired, hasThermalShock, hasSpalling }
}

/**
 * Measure finished piece quality
 * @example
 * measureFinished('export function a(): number { try { return 1 } catch(e) { return 0 } }') // { hardness, ... }
 */
export function measureFinished(content: string): FinishedMeasure {
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const descriptive = countDescriptiveNames(content)
  const branches = countBranches(content)
  const testIndicators = countTestIndicators(content)

  const hardness = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (jsdoc > 0 ? 10 : 0) +
    (descriptive > 0 ? 10 : 0) +
    (testIndicators > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (imports > 0 ? 5 : 0),
  )))

  let ring = 'thud'
  if (hardness >= 80) ring = 'clear-ring'
  else if (hardness >= 60) ring = 'solid-tap'
  else if (hardness >= 40) ring = 'dull-thud'
  else if (hardness >= 20) ring = 'hollow-tap'

  const isVitrified = types > 0 && errors > 0 && exports > 0 && jsdoc > 0
  const isPorous = functions > 0 && types === 0
  const isFragile = branches > 0 && errors === 0
  const hasStructuralIntegrity = isVitrified && !isFragile

  let grade: FinishedGrade = 'amateur'
  if (hardness >= 80 && isVitrified) grade = 'masterwork'
  else if (hardness >= 65 && isVitrified) grade = 'fine-craft'
  else if (hardness >= 50) grade = 'studio-pottery'
  else if (hardness >= 35) grade = 'production'
  else if (hardness >= 20) grade = 'craft-fair'

  return { hardness, ring, isVitrified, isPorous, isFragile, hasStructuralIntegrity, grade }
}

// ─── Classification Functions ─────────────────────────────────────────────────

/**
 * Classify piece condition from quality score
 * @example
 * classifyPieceCondition(90) // 'masterwork-porcelain'
 */
export function classifyPieceCondition(score: number): PieceCondition {
  if (score >= 80) return 'masterwork-porcelain'
  if (score >= 60) return 'fine-stoneware'
  if (score >= 40) return 'quality-earthenware'
  if (score >= 20) return 'greenware'
  if (score >= 5) return 'raw-clay'
  return 'cracked-pot'
}

/**
 * Classify kiln type from pieces
 * @example
 * classifyKilnType([]) // 'cold'
 */
export function classifyKilnType(pieces: PotteryPiece[]): KilnType {
  if (pieces.length === 0) return 'cold'
  const n = pieces.length
  const fired = pieces.filter(p => p.firing.isProperlyFired).length
  const masterwork = pieces.filter(p => p.condition === 'masterwork-porcelain').length

  if (masterwork > n * 0.5) return 'anagama'
  if (fired > n * 0.5) return 'gas-kiln'
  if (fired > n * 0.25) return 'electric-kiln'
  if (pieces.some(p => p.firing.isProperlyFired)) return 'raku'
  if (n >= 3) return 'pit-fire'
  return 'cold'
}

/**
 * Classify load condition from avg score
 * @example
 * classifyLoadCondition(80) // 'gallery-exhibition'
 */
export function classifyLoadCondition(avgScore: number): LoadCondition {
  if (avgScore >= 75) return 'gallery-exhibition'
  if (avgScore >= 55) return 'studio-collection'
  if (avgScore >= 40) return 'craft-market'
  if (avgScore >= 25) return 'pottery-class'
  if (avgScore >= 10) return 'messy-bench'
  return 'clay-pit'
}

/**
 * Classify potter grade from avg hardness
 * @example
 * classifyPotterGrade(85) // 'master-potter'
 */
export function classifyPotterGrade(avgHardness: number): PotterGrade {
  if (avgHardness >= 75) return 'master-potter'
  if (avgHardness >= 60) return 'studio-potter'
  if (avgHardness >= 45) return 'production-potter'
  if (avgHardness >= 30) return 'hobbyist'
  if (avgHardness >= 15) return 'student'
  return 'child'
}

// ─── Core Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze a single file as a pottery piece
 * @example
 * analyzePotteryPiece('export function a(): number { return 1 }', 'a.ts') // PotteryPiece
 */
export function analyzePotteryPiece(content: string, filePath: string): PotteryPiece {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      clayQuality: 0, greenStrength: 0, bisqueHardness: 0, glazeQuality: 0, firingTemperature: 0, finalHardness: 0,
      clay: { type: 'mud', quality: 0, hasImpurities: false, hasAirBubbles: false, isWorkable: false, isConsistent: true, impurityCount: 0, bubbleCount: 0 },
      green: { strength: 0, isLeatherHard: false, isBoneDry: false, hasCracks: false, hasWarping: false, crackCount: 0, isReadyForKiln: false },
      bisque: { hardness: 0, isFired: false, isBisque: false, hasCrazing: false, hasShivering: false, hasDunting: false, crazingPoints: 0, coverage: 0 },
      glaze: { quality: 0, hasBaseCoat: false, hasDecorative: false, hasProtective: false, isFoodSafe: false, hasCrawling: false, hasPinholing: false, isEven: false, crawlingCount: 0, pinholeCount: 0 },
      firing: { temperature: 0, atmosphere: 'raw', soak: 0, ramp: 0, isProperlyFired: false, isOverFired: false, isUnderFired: false, hasThermalShock: false, hasSpalling: false },
      finished: { hardness: 0, ring: 'thud', isVitrified: false, isPorous: false, isFragile: false, hasStructuralIntegrity: false, grade: 'amateur' },
      condition: 'cracked-pot',
      qualityScore: 0,
    }
  }

  const clay = measureClay(content)
  const green = measureGreen(content)
  const bisque = measureBisque(content)
  const glaze = measureGlaze(content)
  const firing = measureFiring(content)
  const finished = measureFinished(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    clay.quality * 0.2 +
    green.strength * 0.15 +
    bisque.hardness * 0.2 +
    glaze.quality * 0.15 +
    firing.temperature * 0.15 +
    finished.hardness * 0.15,
  )))

  return {
    file: filePath,
    clayQuality: clay.quality,
    greenStrength: green.strength,
    bisqueHardness: bisque.hardness,
    glazeQuality: glaze.quality,
    firingTemperature: firing.temperature,
    finalHardness: finished.hardness,
    clay, green, bisque, glaze, firing, finished,
    condition: classifyPieceCondition(qualityScore),
    qualityScore,
  }
}

// ─── Kiln Load Analysis ───────────────────────────────────────────────────────

/**
 * Analyze a directory as a kiln load
 * @example
 * analyzeKilnLoad(pieces, 'src') // KilnLoad
 */
export function analyzeKilnLoad(pieces: PotteryPiece[], dirPath: string): KilnLoad {
  if (pieces.length === 0) {
    return {
      directory: dirPath, pieces: [],
      avgClayQuality: 0, avgBisqueHardness: 0, avgGlazeQuality: 0, avgFinalHardness: 0,
      masterworkCount: 0, crackedCount: 0, greenCount: 0, firedCount: 0,
      kilnType: 'cold', condition: 'clay-pit',
    }
  }

  const n = pieces.length
  const avgClayQuality = Math.round(pieces.reduce((s, p) => s + p.clayQuality, 0) / n)
  const avgBisqueHardness = Math.round(pieces.reduce((s, p) => s + p.bisqueHardness, 0) / n)
  const avgGlazeQuality = Math.round(pieces.reduce((s, p) => s + p.glazeQuality, 0) / n)
  const avgFinalHardness = Math.round(pieces.reduce((s, p) => s + p.finalHardness, 0) / n)
  const masterworkCount = pieces.filter(p => p.condition === 'masterwork-porcelain').length
  const crackedCount = pieces.filter(p => p.condition === 'cracked-pot').length
  const greenCount = pieces.filter(p => p.condition === 'greenware' || p.condition === 'raw-clay').length
  const firedCount = pieces.filter(p => p.firing.isProperlyFired).length

  const kilnType = classifyKilnType(pieces)
  const avgScore = Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / n)
  const condition = classifyLoadCondition(avgScore)

  return {
    directory: dirPath, pieces,
    avgClayQuality, avgBisqueHardness, avgGlazeQuality, avgFinalHardness,
    masterworkCount, crackedCount, greenCount, firedCount,
    kilnType, condition,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate kiln fire recommendations
 * @example
 * generateRecommendations(pieces, loads, studio, stats) // string[]
 */
export function generateRecommendations(
  _pieces: PotteryPiece[],
  _loads: KilnLoad[],
  _studio: Studio,
  stats: KilnFireStats,
): string[] {
  void _pieces
  void _loads
  void _studio
  const recs: string[] = []

  if (stats.crackedPotCount > 0) {
    recs.push(`Cracked pots: ${stats.crackedPotCount} files are critically under-developed`)
  }
  if (stats.underFiredCount > stats.totalFiles * 0.3) {
    recs.push(`Under-fired: ${stats.underFiredCount} files need more testing`)
  }
  if (stats.overallHardness >= 60) {
    recs.push('Well-fired studio: codebase shows good maturity and hardness')
  }
  if (stats.fragileCount > 3) {
    recs.push(`Fragile pieces: ${stats.fragileCount} files have branches without error handling`)
  }
  if (stats.rawClayCount > stats.totalFiles * 0.5) {
    recs.push('Raw clay majority: most files lack basic type safety and error handling')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete kiln fire result from files and contents
 * @example
 * buildKilnFireResult(['a.ts'], ['export function a() {}'], {}) // KilnFireResult
 */
export function buildKilnFireResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): KilnFireResult {
  void options

  const pieces: PotteryPiece[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzePotteryPiece(content, file)
    } catch {
      return analyzePotteryPiece('', file)
    }
  })

  const dirMap = new Map<string, PotteryPiece[]>()
  for (const piece of pieces) {
    const dir = piece.file.includes('/') ? piece.file.slice(0, piece.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(piece) } else { dirMap.set(dir, [piece]) }
  }

  const loads: KilnLoad[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeKilnLoad(ps, dir),
  )

  const n = pieces.length || 1
  const avgClayQuality = Math.round(pieces.reduce((s, p) => s + p.clayQuality, 0) / n)
  const avgBisqueHardness = Math.round(pieces.reduce((s, p) => s + p.bisqueHardness, 0) / n)
  const avgGlazeQuality = Math.round(pieces.reduce((s, p) => s + p.glazeQuality, 0) / n)
  const avgFinalHardness = Math.round(pieces.reduce((s, p) => s + p.finalHardness, 0) / n)

  const overallHardness = Math.min(100, Math.max(0, Math.round(
    avgClayQuality * 0.2 +
    avgBisqueHardness * 0.25 +
    avgGlazeQuality * 0.2 +
    avgFinalHardness * 0.35,
  )))

  const masterworkCount = pieces.filter(p => p.condition === 'masterwork-porcelain').length

  const studio: Studio = {
    avgClayQuality, avgBisqueHardness, avgGlazeQuality, avgFinalHardness,
    masterworkCount,
    isProductionReady: overallHardness >= 50,
    overallHardness,
  }

  const stats: KilnFireStats = {
    totalFiles: files.length,
    totalLoads: loads.length,
    avgClayQuality,
    avgGreenStrength: Math.round(pieces.reduce((s, p) => s + p.greenStrength, 0) / n),
    avgBisqueHardness,
    avgGlazeQuality,
    avgFiringTemperature: Math.round(pieces.reduce((s, p) => s + p.firingTemperature, 0) / n),
    avgFinalHardness,
    masterworkPorcelainCount: pieces.filter(p => p.condition === 'masterwork-porcelain').length,
    fineStonewareCount: pieces.filter(p => p.condition === 'fine-stoneware').length,
    qualityEarthenwareCount: pieces.filter(p => p.condition === 'quality-earthenware').length,
    greenwareCount: pieces.filter(p => p.condition === 'greenware').length,
    rawClayCount: pieces.filter(p => p.condition === 'raw-clay').length,
    crackedPotCount: pieces.filter(p => p.condition === 'cracked-pot').length,
    porcelainCount: pieces.filter(p => p.clay.type === 'porcelain').length,
    stonewareCount: pieces.filter(p => p.clay.type === 'stoneware').length,
    earthenwareCount: pieces.filter(p => p.clay.type === 'earthenware').length,
    terraCottaCount: pieces.filter(p => p.clay.type === 'terra-cotta').length,
    hasTestsCount: pieces.filter(p => p.bisque.isFired).length,
    properlyFiredCount: pieces.filter(p => p.firing.isProperlyFired).length,
    overFiredCount: pieces.filter(p => p.firing.isOverFired).length,
    underFiredCount: pieces.filter(p => p.firing.isUnderFired).length,
    hasDocsCount: pieces.filter(p => p.glaze.hasBaseCoat).length,
    hasTypesCount: pieces.filter(p => p.glaze.hasProtective).length,
    vitrifiedCount: pieces.filter(p => p.finished.isVitrified).length,
    fragileCount: pieces.filter(p => p.finished.isFragile).length,
    overallHardness,
    potterGrade: classifyPotterGrade(overallHardness),
    bestPiece: pieces.length > 0
      ? pieces.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, pieces[0]).file : 'none',
    hardestPiece: pieces.length > 0
      ? pieces.reduce((a, b) => b.finalHardness > a.finalHardness ? b : a, pieces[0]).file : 'none',
    bestGlazed: pieces.length > 0
      ? pieces.reduce((a, b) => b.glazeQuality > a.glazeQuality ? b : a, pieces[0]).file : 'none',
    mostFragile: pieces.length > 0
      ? pieces.reduce((a, b) => b.finalHardness < a.finalHardness ? b : a, pieces[0]).file : 'none',
    needsFiring: pieces.length > 0
      ? pieces.reduce((a, b) => b.firingTemperature < a.firingTemperature ? b : a, pieces[0]).file : 'none',
  }

  const recommendations = generateRecommendations(pieces, loads, studio, stats)

  return { pieces, loads, studio, stats, recommendations }
}
