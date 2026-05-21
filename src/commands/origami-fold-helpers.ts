// ─── Interfaces ──────────────────────────────────────────────────────────────

export type SheetCondition = 'masterwork' | 'expert' | 'skilled' | 'apprentice' | 'beginner' | 'crumpled'
export type BaseType = 'preliminary' | 'waterbomb' | 'fish' | 'bird' | 'frog' | 'none'
export type PatternType = 'traditional' | 'modern' | 'modular' | 'wet-fold' | 'crumpled' | 'torn'
export type BoxType = 'display-case' | 'jewelry-box' | 'storage-box' | 'cardboard' | 'crumpled-paper' | 'confetti'
export type BoxCondition = 'gallery-quality' | 'well-crafted' | 'serviceable' | 'rough' | 'messy' | 'torn-apart'
export type OrigamiGrade = 'grand-master' | 'master' | 'artisan' | 'folder' | 'beginner' | 'paper-shredder'

export interface FoldsInfo {
  count: number
  depth: number
  hasValleyFold: boolean
  hasMountainFold: boolean
  hasReverseFold: boolean
  hasSquashFold: boolean
  hasPetalFold: boolean
  hasSinkFold: boolean
  valleyCount: number
  mountainCount: number
  squashCount: number
  petalCount: number
}

export interface CreasesInfo {
  sharpness: number
  isClean: boolean
  hasTears: boolean
  hasWrinkles: boolean
  tearCount: number
  wrinkleCount: number
  tearPoints: string[]
  wrinklePoints: string[]
}

export interface PaperInfo {
  area: number
  thickness: number
  isUsed: number
  waste: number
  isEconomical: boolean
  hasOffcuts: boolean
  offcutSize: number
}

export interface StructureInfo {
  hasBase: boolean
  baseType: BaseType
  stability: number
  isBalanced: boolean
  isCollapsible: boolean
  hasWings: boolean
  wingSpan: number
}

export interface CreasePatternInfo {
  isSymmetric: boolean
  isComplex: boolean
  hasMasterCrease: boolean
  hasGuideCreases: boolean
  patternType: PatternType
  elegance: number
}

export interface ModelInfo {
  recognizable: boolean
  detail: number
  isComplete: boolean
  hasFlaps: boolean
  flapCount: number
  isDisplay: boolean
  isPractice: boolean
}

export interface OrigamiSheet {
  file: string
  foldPrecision: number
  creaseSharpness: number
  paperEconomy: number
  structuralIntegrity: number
  complexityReduction: number
  creaseElegance: number
  folds: FoldsInfo
  creases: CreasesInfo
  paper: PaperInfo
  structure: StructureInfo
  creasePattern: CreasePatternInfo
  model: ModelInfo
  condition: SheetCondition
  qualityScore: number
}

export interface OrigamiBox {
  directory: string
  sheets: OrigamiSheet[]
  avgFoldPrecision: number
  avgCreaseSharpness: number
  avgPaperEconomy: number
  avgStructuralIntegrity: number
  masterworkCount: number
  crumpledCount: number
  totalFolds: number
  totalTears: number
  totalWrinkles: number
  boxType: BoxType
  condition: BoxCondition
}

export interface StudioInfo {
  avgFoldPrecision: number
  avgCreaseSharpness: number
  avgPaperEconomy: number
  avgStructuralIntegrity: number
  totalFolds: number
  totalTears: number
  isClean: boolean
  overallCraftsmanship: number
}

export interface OrigamiFoldStats {
  totalFiles: number
  totalBoxes: number
  avgFoldPrecision: number
  avgCreaseSharpness: number
  avgPaperEconomy: number
  avgStructuralIntegrity: number
  avgComplexityReduction: number
  avgCreaseElegance: number
  masterworkCount: number
  expertCount: number
  skilledCount: number
  apprenticeCount: number
  beginnerCount: number
  crumpledCount: number
  totalFolds: number
  totalTears: number
  totalWrinkles: number
  valleyFolds: number
  mountainFolds: number
  squashFolds: number
  petalFolds: number
  economicalFiles: number
  wastefulFiles: number
  symmetricPatterns: number
  crumpledPatterns: number
  overallCraftsmanship: number
  origamiGrade: OrigamiGrade
  bestFolded: string
  worstFolded: string
  mostEconomical: string
  mostElegant: string
  mostTorn: string
}

export interface OrigamiFoldResult {
  sheets: OrigamiSheet[]
  boxes: OrigamiBox[]
  studio: StudioInfo
  stats: OrigamiFoldStats
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
 * Count classes
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) ?? []).length
}

/**
 * Count interfaces
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  return (content.match(/\binterface\s+\w+/g) ?? []).length
}

/**
 * Count type aliases
 * @example
 * countTypeAliases('type Foo = string') // 1
 */
export function countTypeAliases(content: string): number {
  return (content.match(/\btype\s+\w+\s*=/g) ?? []).length
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
 * Classify sheet condition from quality score
 * @example
 * classifySheetCondition(90) // 'masterwork'
 */
export function classifySheetCondition(qualityScore: number): SheetCondition {
  if (qualityScore >= 85) return 'masterwork'
  if (qualityScore >= 70) return 'expert'
  if (qualityScore >= 50) return 'skilled'
  if (qualityScore >= 30) return 'apprentice'
  if (qualityScore >= 10) return 'beginner'
  return 'crumpled'
}

/**
 * Classify base type from code patterns
 * @example
 * classifyBaseType('export function a() {}') // BaseType
 */
export function classifyBaseType(content: string): BaseType {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const exports = countExports(content)

  if (classes > 0 && interfaces > 0 && funcs > 0) return 'frog'
  if (classes > 0 && interfaces > 0) return 'bird'
  if (interfaces > 0 && types > 0) return 'fish'
  if (exports > 2 && funcs > 2) return 'waterbomb'
  if (funcs > 0 || classes > 0 || exports > 0) return 'preliminary'
  return 'none'
}

/**
 * Classify crease pattern type
 * @example
 * classifyPatternType('export function a() {}') // PatternType
 */
export function classifyPatternType(content: string): PatternType {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const todos = countTodos(content)
  const nest = maxNesting(content)
  const loc = countLoc(content)

  if (loc === 0) return 'torn'
  if (todos > 3) return 'torn'
  if (nest > 5 && countErrorHandling(content) === 0) return 'crumpled'
  if (classes > 0 && interfaces > 0 && exports > 2) return 'modular'
  if (exports > 0 && funcs > 0 && countTypeAnnotations(content) > 0) return 'wet-fold'
  if (imports > 2 && exports > 0) return 'modern'
  return 'traditional'
}

/**
 * Classify box type from sheets
 * @example
 * classifyBoxType([]) // 'confetti'
 */
export function classifyBoxType(sheets: OrigamiSheet[]): BoxType {
  if (sheets.length === 0) return 'confetti'
  const n = sheets.length
  const masterwork = sheets.filter(s => s.condition === 'masterwork' || s.condition === 'expert').length
  const crumpled = sheets.filter(s => s.condition === 'crumpled' || s.condition === 'beginner').length

  if (crumpled > n * 0.6) return 'confetti'
  if (crumpled > n * 0.3) return 'crumpled-paper'
  if (masterwork > n * 0.7) return 'display-case'
  if (masterwork > n * 0.4) return 'jewelry-box'
  if (masterwork > 0) return 'storage-box'
  return 'cardboard'
}

/**
 * Classify box condition from averages
 * @example
 * classifyBoxCondition(85) // 'gallery-quality'
 */
export function classifyBoxCondition(avgPrecision: number): BoxCondition {
  if (avgPrecision >= 80) return 'gallery-quality'
  if (avgPrecision >= 60) return 'well-crafted'
  if (avgPrecision >= 40) return 'serviceable'
  if (avgPrecision >= 25) return 'rough'
  if (avgPrecision >= 10) return 'messy'
  return 'torn-apart'
}

/**
 * Classify origami grade from average craftsmanship
 * @example
 * classifyOrigamiGrade(85) // 'grand-master'
 */
export function classifyOrigamiGrade(avgCraftsmanship: number): OrigamiGrade {
  if (avgCraftsmanship >= 80) return 'grand-master'
  if (avgCraftsmanship >= 65) return 'master'
  if (avgCraftsmanship >= 45) return 'artisan'
  if (avgCraftsmanship >= 30) return 'folder'
  if (avgCraftsmanship >= 15) return 'beginner'
  return 'paper-shredder'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure folds (abstraction types and counts)
 * @example
 * measureFolds('export function a(): number { return 1 }') // FoldsInfo
 */
export function measureFolds(content: string): FoldsInfo {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const exports = countExports(content)
  const nest = maxNesting(content)
  const branches = countBranches(content)

  const count = funcs + classes + interfaces + types
  const depth = nest

  const hasValleyFold = funcs > 0 && exports > 0
  const hasMountainFold = classes > 0 && interfaces > 0
  const hasReverseFold = /Promise|async|await/.test(content)
  const hasSquashFold = branches > 6 && funcs <= 1
  const hasPetalFold = funcs > 0 && countTypeAnnotations(content) > 0 && countErrorHandling(content) > 0
  const hasSinkFold = nest > 3 && funcs > 1

  const valleyCount = hasValleyFold ? 1 : 0
  const mountainCount = hasMountainFold ? 1 : 0
  const squashCount = hasSquashFold ? 1 : 0
  const petalCount = hasPetalFold ? 1 : 0

  return {
    count, depth, hasValleyFold, hasMountainFold, hasReverseFold,
    hasSquashFold, hasPetalFold, hasSinkFold,
    valleyCount, mountainCount, squashCount, petalCount,
  }
}

/**
 * Measure creases (interface boundaries, tears, wrinkles)
 * @example
 * measureCreases('export function a(): number { return 1 }') // CreasesInfo
 */
export function measureCreases(content: string): CreasesInfo {
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const branches = countBranches(content)

  const sharpness = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (interfaces > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (countLoc(content) > 0 ? 10 : 0),
  )))

  const tearPoints: string[] = []
  const wrinklePoints: string[] = []

  if (exports > 0 && errors === 0) tearPoints.push('Exported functions without error handling')
  if (branches > 5 && errors === 0) tearPoints.push('Complex branching without error boundaries')
  if (todos > 0) wrinklePoints.push('Unresolved markers indicate incomplete folds')

  const hasTears = tearPoints.length > 0
  const hasWrinkles = wrinklePoints.length > 0
  const isClean = !hasTears && !hasWrinkles

  return {
    sharpness, isClean, hasTears, hasWrinkles,
    tearCount: tearPoints.length, wrinkleCount: wrinklePoints.length,
    tearPoints, wrinklePoints,
  }
}

/**
 * Measure paper (code size, density, waste)
 * @example
 * measurePaper('const x = 1') // PaperInfo
 */
export function measurePaper(content: string): PaperInfo {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nest = maxNesting(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const todos = countTodos(content)

  const area = loc
  const thickness = Math.min(100, Math.round(branches * 5 + nest * 8 + funcs * 3))

  const effectiveLines = funcs + types + comments + countExports(content) + countErrorHandling(content)
  const isUsed = loc > 0 ? Math.min(100, Math.round((effectiveLines / loc) * 100)) : 0
  const waste = Math.max(0, 100 - isUsed)

  const isEconomical = waste < 30
  const hasOffcuts = todos > 0 || countConsole(content) > 2
  const offcutSize = Math.min(100, Math.round(todos * 10 + countConsole(content) * 5))

  return { area, thickness, isUsed, waste, isEconomical, hasOffcuts, offcutSize }
}

/**
 * Measure structure (base type, stability, balance)
 * @example
 * measureStructure('export function a() {}') // StructureInfo
 */
export function measureStructure(content: string): StructureInfo {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)

  const hasBase = funcs > 0 || classes > 0 || interfaces > 0
  const baseType = classifyBaseType(content)

  const stability = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (hasBase ? 10 : 0),
  )))

  const isBalanced = Math.abs(exports - imports) <= 2
  const isCollapsible = branches_gt_3_no_abstraction(content)
  const hasWings = exports > 2
  const wingSpan = Math.min(100, exports * 15)

  return { hasBase, baseType, stability, isBalanced, isCollapsible, hasWings, wingSpan }
}

function branches_gt_3_no_abstraction(content: string): boolean {
  return countBranches(content) > 3 && countFunctions(content) === 0 && countClasses(content) === 0
}

/**
 * Measure crease pattern (symmetry, complexity, elegance)
 * @example
 * measureCreasePattern('export function a(): number { return 1 }') // CreasePatternInfo
 */
export function measureCreasePattern(content: string): CreasePatternInfo {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const exports = countExports(content)
  const imports = countImports(content)

  const isSymmetric = Math.abs(exports - imports) <= 1
  const isComplex = funcs + classes + interfaces + types > 5
  const hasMasterCrease = exports > 0 && countErrorHandling(content) > 0
  const hasGuideCreases = interfaces > 0 || types > 0

  const patternType = classifyPatternType(content)

  const elegance = Math.min(100, Math.max(0, Math.round(
    (isSymmetric ? 20 : 0) +
    (hasMasterCrease ? 20 : 0) +
    (hasGuideCreases ? 15 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (patternType === 'wet-fold' || patternType === 'modular' ? 10 : 0),
  )))

  return { isSymmetric, isComplex, hasMasterCrease, hasGuideCreases, patternType, elegance }
}

/**
 * Measure model (recognizability, detail, completeness)
 * @example
 * measureModel('export function a(): number { return 1 }') // ModelInfo
 */
export function measureModel(content: string): ModelInfo {
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const funcs = countFunctions(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)

  const recognizable = exports > 0 && (comments > 0 || types > 0)
  const detail = Math.min(100, Math.round(
    types * 5 + countInterfaces(content) * 10 + comments * 2 + funcs * 3,
  ))
  const isComplete = errors > 0 && todos === 0 && exports > 0
  const hasFlaps = exports > countFunctions(content) + countClasses(content)
  const flapCount = Math.max(0, exports - countFunctions(content) - countClasses(content))
  const isDisplay = isComplete && recognizable && detail > 30
  const isPractice = todos > 0 || exports === 0

  return { recognizable, detail, isComplete, hasFlaps, flapCount, isDisplay, isPractice }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an origami sheet
 * @example
 * analyzeOrigamiSheet('export function calc(): number { return 1 }', 'calc.ts') // OrigamiSheet
 */
export function analyzeOrigamiSheet(content: string, filePath: string): OrigamiSheet {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      foldPrecision: 0, creaseSharpness: 0, paperEconomy: 0,
      structuralIntegrity: 0, complexityReduction: 0, creaseElegance: 0,
      folds: { count: 0, depth: 0, hasValleyFold: false, hasMountainFold: false, hasReverseFold: false, hasSquashFold: false, hasPetalFold: false, hasSinkFold: false, valleyCount: 0, mountainCount: 0, squashCount: 0, petalCount: 0 },
      creases: { sharpness: 0, isClean: true, hasTears: false, hasWrinkles: false, tearCount: 0, wrinkleCount: 0, tearPoints: [], wrinklePoints: [] },
      paper: { area: 0, thickness: 0, isUsed: 0, waste: 100, isEconomical: false, hasOffcuts: false, offcutSize: 0 },
      structure: { hasBase: false, baseType: 'none', stability: 0, isBalanced: true, isCollapsible: false, hasWings: false, wingSpan: 0 },
      creasePattern: { isSymmetric: true, isComplex: false, hasMasterCrease: false, hasGuideCreases: false, patternType: 'torn', elegance: 0 },
      model: { recognizable: false, detail: 0, isComplete: false, hasFlaps: false, flapCount: 0, isDisplay: false, isPractice: true },
      condition: 'crumpled',
      qualityScore: 0,
    }
  }

  const folds = measureFolds(content)
  const creases = measureCreases(content)
  const paper = measurePaper(content)
  const structure = measureStructure(content)
  const creasePattern = measureCreasePattern(content)
  const model = measureModel(content)

  const foldPrecision = Math.min(100, Math.max(0, Math.round(
    (folds.hasValleyFold ? 25 : 0) +
    (folds.hasPetalFold ? 20 : 0) +
    (folds.hasMountainFold ? 15 : 0) +
    (structure.stability * 0.15) +
    (creasePattern.elegance * 0.1) +
    (folds.count > 0 ? 10 : 0) +
    (folds.hasSinkFold ? 5 : 0),
  )))

  const creaseSharpness = creases.sharpness

  const paperEconomy = Math.min(100, Math.max(0, Math.round(
    paper.isUsed * 0.6 +
    (paper.isEconomical ? 20 : 0) +
    (!paper.hasOffcuts ? 20 : 0),
  )))

  const structuralIntegrity = structure.stability

  const complexityReduction = Math.min(100, Math.max(0, Math.round(
    (folds.hasValleyFold ? 25 : 0) +
    (folds.hasPetalFold ? 20 : 0) +
    (folds.count > 0 && folds.depth <= 4 ? 20 : 0) +
    (creases.isClean ? 15 : 0) +
    (structure.isBalanced ? 10 : 0) +
    (model.isComplete ? 10 : 0),
  )))

  const creaseElegance = creasePattern.elegance

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    foldPrecision * 0.2 +
    creaseSharpness * 0.15 +
    paperEconomy * 0.15 +
    structuralIntegrity * 0.15 +
    complexityReduction * 0.15 +
    creaseElegance * 0.1 +
    (model.isDisplay ? 10 : 0),
  )))

  const condition = classifySheetCondition(qualityScore)

  return {
    file: filePath,
    foldPrecision, creaseSharpness, paperEconomy,
    structuralIntegrity, complexityReduction, creaseElegance,
    folds, creases, paper, structure, creasePattern, model,
    condition, qualityScore,
  }
}

// ─── Box Analysis ─────────────────────────────────────────────────────────────

/**
 * Analyze a directory as an origami box
 * @example
 * analyzeOrigamiBox(sheets, 'src') // OrigamiBox
 */
export function analyzeOrigamiBox(sheets: OrigamiSheet[], dirPath: string): OrigamiBox {
  if (sheets.length === 0) {
    return {
      directory: dirPath, sheets: [],
      avgFoldPrecision: 100, avgCreaseSharpness: 100, avgPaperEconomy: 100,
      avgStructuralIntegrity: 100, masterworkCount: 0, crumpledCount: 0,
      totalFolds: 0, totalTears: 0, totalWrinkles: 0,
      boxType: 'confetti', condition: 'gallery-quality',
    }
  }

  const n = sheets.length
  const avgFoldPrecision = Math.round(sheets.reduce((s, x) => s + x.foldPrecision, 0) / n)
  const avgCreaseSharpness = Math.round(sheets.reduce((s, x) => s + x.creaseSharpness, 0) / n)
  const avgPaperEconomy = Math.round(sheets.reduce((s, x) => s + x.paperEconomy, 0) / n)
  const avgStructuralIntegrity = Math.round(sheets.reduce((s, x) => s + x.structuralIntegrity, 0) / n)

  const masterworkCount = sheets.filter(s => s.condition === 'masterwork' || s.condition === 'expert').length
  const crumpledCount = sheets.filter(s => s.condition === 'crumpled' || s.condition === 'beginner').length
  const totalFolds = sheets.reduce((s, x) => s + x.folds.count, 0)
  const totalTears = sheets.reduce((s, x) => s + x.creases.tearCount, 0)
  const totalWrinkles = sheets.reduce((s, x) => s + x.creases.wrinkleCount, 0)

  const boxType = classifyBoxType(sheets)
  const condition = classifyBoxCondition(avgFoldPrecision)

  return {
    directory: dirPath, sheets,
    avgFoldPrecision, avgCreaseSharpness, avgPaperEconomy, avgStructuralIntegrity,
    masterworkCount, crumpledCount, totalFolds, totalTears, totalWrinkles,
    boxType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate origami fold recommendations
 * @example
 * generateRecommendations(sheets, boxes, studio, stats) // string[]
 */
export function generateRecommendations(
  _sheets: OrigamiSheet[],
  _boxes: OrigamiBox[],
  _studio: StudioInfo,
  stats: OrigamiFoldStats,
): string[] {
  void _sheets
  void _boxes
  void _studio
  const recs: string[] = []

  if (stats.crumpledCount > 0) {
    recs.push(`Crumpled sheets: ${stats.crumpledCount} files need better abstractions`)
  }
  if (stats.totalTears > 0) {
    recs.push(`Leaky abstractions: ${stats.totalTears} tear points detected`)
  }
  if (stats.wastefulFiles > 0) {
    recs.push(`Paper waste: ${stats.wastefulFiles} files have high dead code ratio`)
  }
  if (stats.squashFolds > 0) {
    recs.push(`Squash folds: ${stats.squashFolds} forced abstractions need splitting`)
  }
  if (stats.overallCraftsmanship >= 60) {
    recs.push('Clean folds: abstractions are well-crafted across the codebase')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete origami fold result from files and contents
 * @example
 * buildOrigamiFoldResult(['a.ts'], ['export function a() {}'], {}) // OrigamiFoldResult
 */
export function buildOrigamiFoldResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): OrigamiFoldResult {
  void options

  const sheets: OrigamiSheet[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeOrigamiSheet(content, file)
    } catch {
      return analyzeOrigamiSheet('', file)
    }
  })

  const dirMap = new Map<string, OrigamiSheet[]>()
  for (const s of sheets) {
    const dir = s.file.includes('/') ? s.file.slice(0, s.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(s) } else { dirMap.set(dir, [s]) }
  }

  const boxes: OrigamiBox[] = Array.from(dirMap.entries()).map(([dir, ss]) =>
    analyzeOrigamiBox(ss, dir),
  )

  const n = sheets.length || 1
  const avgFoldPrecision = Math.round(sheets.reduce((s, x) => s + x.foldPrecision, 0) / n)
  const avgCreaseSharpness = Math.round(sheets.reduce((s, x) => s + x.creaseSharpness, 0) / n)
  const avgPaperEconomy = Math.round(sheets.reduce((s, x) => s + x.paperEconomy, 0) / n)
  const avgStructuralIntegrity = Math.round(sheets.reduce((s, x) => s + x.structuralIntegrity, 0) / n)
  const totalFolds = sheets.reduce((s, x) => s + x.folds.count, 0)
  const totalTears = sheets.reduce((s, x) => s + x.creases.tearCount, 0)

  const overallCraftsmanship = Math.min(100, Math.max(0, Math.round(
    avgFoldPrecision * 0.25 +
    avgCreaseSharpness * 0.2 +
    avgPaperEconomy * 0.2 +
    avgStructuralIntegrity * 0.2 +
    (sheets.filter(s => s.creasePattern.isSymmetric).length / n) * 100 * 0.15,
  )))

  const studio: StudioInfo = {
    avgFoldPrecision, avgCreaseSharpness, avgPaperEconomy, avgStructuralIntegrity,
    totalFolds, totalTears,
    isClean: totalTears === 0,
    overallCraftsmanship,
  }

  const stats: OrigamiFoldStats = {
    totalFiles: files.length,
    totalBoxes: boxes.length,
    avgFoldPrecision, avgCreaseSharpness, avgPaperEconomy, avgStructuralIntegrity,
    avgComplexityReduction: Math.round(sheets.reduce((s, x) => s + x.complexityReduction, 0) / n),
    avgCreaseElegance: Math.round(sheets.reduce((s, x) => s + x.creaseElegance, 0) / n),
    masterworkCount: sheets.filter(s => s.condition === 'masterwork').length,
    expertCount: sheets.filter(s => s.condition === 'expert').length,
    skilledCount: sheets.filter(s => s.condition === 'skilled').length,
    apprenticeCount: sheets.filter(s => s.condition === 'apprentice').length,
    beginnerCount: sheets.filter(s => s.condition === 'beginner').length,
    crumpledCount: sheets.filter(s => s.condition === 'crumpled').length,
    totalFolds,
    totalTears,
    totalWrinkles: sheets.reduce((s, x) => s + x.creases.wrinkleCount, 0),
    valleyFolds: sheets.reduce((s, x) => s + x.folds.valleyCount, 0),
    mountainFolds: sheets.reduce((s, x) => s + x.folds.mountainCount, 0),
    squashFolds: sheets.reduce((s, x) => s + x.folds.squashCount, 0),
    petalFolds: sheets.reduce((s, x) => s + x.folds.petalCount, 0),
    economicalFiles: sheets.filter(s => s.paper.isEconomical).length,
    wastefulFiles: sheets.filter(s => !s.paper.isEconomical).length,
    symmetricPatterns: sheets.filter(s => s.creasePattern.isSymmetric).length,
    crumpledPatterns: sheets.filter(s => s.creasePattern.patternType === 'crumpled' || s.creasePattern.patternType === 'torn').length,
    overallCraftsmanship,
    origamiGrade: classifyOrigamiGrade(overallCraftsmanship),
    bestFolded: sheets.length > 0
      ? sheets.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, sheets[0]).file : 'none',
    worstFolded: sheets.length > 0
      ? sheets.reduce((a, b) => b.qualityScore < a.qualityScore ? b : a, sheets[0]).file : 'none',
    mostEconomical: sheets.length > 0
      ? sheets.reduce((a, b) => b.paper.isUsed > a.paper.isUsed ? b : a, sheets[0]).file : 'none',
    mostElegant: sheets.length > 0
      ? sheets.reduce((a, b) => b.creaseElegance > a.creaseElegance ? b : a, sheets[0]).file : 'none',
    mostTorn: sheets.length > 0
      ? sheets.reduce((a, b) => b.creases.tearCount > a.creases.tearCount ? b : a, sheets[0]).file : 'none',
  }

  const recommendations = generateRecommendations(sheets, boxes, studio, stats)

  return { sheets, boxes, studio, stats, recommendations }
}
