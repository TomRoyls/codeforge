// ─── Types ────────────────────────────────────────────────────────────────────

export type MeasurementCondition = 'perfectly-measured' | 'well-proportioned' | 'adequate' | 'misshapen' | 'distorted' | 'monstrosity'
export type VolumeCategory = 'trivial' | 'simple' | 'moderate' | 'complex' | 'highly-complex' | 'extreme'
export type FileSizeCategory = 'nano' | 'micro' | 'small' | 'medium' | 'large' | 'mega' | 'giga'
export type FloorType = 'penthouse' | 'office-floor' | 'warehouse' | 'studio' | 'closet' | 'void'
export type FloorCondition = 'architectural-marvel' | 'well-designed' | 'functional' | 'cramped' | 'sprawling' | 'condemned'
export type ArchitectGrade = 'master-architect' | 'architect' | 'drafter' | 'builder' | 'handyman' | 'demolition'

export interface Dimensions {
  totalLines: number
  codeLines: number
  blankLines: number
  commentLines: number
  maxLineWidth: number
  avgLineWidth: number
  maxWidthViolation: boolean
  maxWidthLine: number
}

export interface DepthMeasure {
  maxNesting: number
  avgNesting: number
  hasDeepNesting: boolean
  hasShallowNesting: boolean
  deepestPoint: string
  deepestLevel: number
}

export interface VolumeMeasure {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  halsteadVolume: number
  hasHighVolume: boolean
  hasLowVolume: boolean
  volumeCategory: VolumeCategory
}

export interface DensityMeasure {
  branchesPerLine: number
  functionsPerLine: number
  commentsPerLine: number
  codeDensity: number
  isDense: boolean
  isSparse: boolean
  isWellBalanced: boolean
}

export interface ProportionMeasure {
  functionCount: number
  avgFunctionLength: number
  maxFunctionLength: number
  minFunctionLength: number
  functionToTotalRatio: number
  hasGiantFunctions: boolean
  hasTinyFunctions: boolean
  hasWellProportioned: boolean
  giantCount: number
  tinyCount: number
  proportionScore: number
}

export interface ScaleMeasure {
  fileSizeCategory: FileSizeCategory
  isRightSized: boolean
  isUndersized: boolean
  isOversized: boolean
  shouldSplit: boolean
  shouldMerge: boolean
  scaleFactor: number
}

export interface Blueprint {
  isRectangular: boolean
  hasTowers: boolean
  hasBasements: boolean
  hasWings: boolean
  isSymmetric: boolean
  towerCount: number
  basementCount: number
}

export interface Measurement {
  file: string
  length: number
  width: number
  depth: number
  volume: number
  density: number
  proportion: number
  scaleFitness: number
  dimensions: Dimensions
  depthMeasure: DepthMeasure
  volumeMeasure: VolumeMeasure
  densityMeasure: DensityMeasure
  proportionMeasure: ProportionMeasure
  scaleMeasure: ScaleMeasure
  blueprint: Blueprint
  condition: MeasurementCondition
  qualityScore: number
}

export interface FloorPlan {
  directory: string
  measurements: Measurement[]
  avgLength: number
  avgDepth: number
  avgVolume: number
  avgProportion: number
  avgScaleFitness: number
  perfectlyMeasuredCount: number
  monstrosityCount: number
  shouldSplitCount: number
  totalLines: number
  floorType: FloorType
  condition: FloorCondition
}

export interface Building {
  avgLength: number
  avgDepth: number
  avgVolume: number
  avgProportion: number
  avgScaleFitness: number
  totalLines: number
  isWellProportioned: boolean
  overallBalance: number
}

export interface TapeMeasureStats {
  totalFiles: number
  totalFloors: number
  totalLines: number
  avgLines: number
  avgMaxWidth: number
  avgMaxNesting: number
  avgFunctionLength: number
  avgDensity: number
  avgProportion: number
  avgScaleFitness: number
  perfectlyMeasuredCount: number
  wellProportionedCount: number
  adequateCount: number
  misshapenCount: number
  distortedCount: number
  monstrosityCount: number
  nanoFiles: number
  microFiles: number
  smallFiles: number
  mediumFiles: number
  largeFiles: number
  megaFiles: number
  gigaFiles: number
  giantFunctions: number
  tinyFunctions: number
  deepNesting: number
  highVolume: number
  shouldSplit: number
  shouldMerge: number
  overallBalance: number
  architectGrade: ArchitectGrade
  bestProportioned: string
  worstProportioned: string
  deepestFile: string
  widestFile: string
  densestFile: string
}

export interface TapeMeasureResult {
  measurements: Measurement[]
  floors: FloorPlan[]
  building: Building
  stats: TapeMeasureStats
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
 * Count blank lines
 * @example
 * countBlankLines('const x = 1\n\nconst y = 2') // 1
 */
export function countBlankLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length === 0).length
}

/**
 * Count comment lines
 * @example
 * countCommentLines('// hello\nconst x = 1') // 1
 */
export function countCommentLines(content: string): number {
  return content.split('\n').filter(l => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('*/')
  }).length
}

/**
 * Count code lines (non-blank, non-comment)
 * @example
 * countCodeLines('const x = 1\n// comment\n\nconst y = 2') // 2
 */
export function countCodeLines(content: string): number {
  return countLoc(content) - countCommentLines(content)
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
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
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
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
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
 * Measure max brace nesting depth
 * @example
 * maxNestingDepth('if (a) { if (b) { x } }') // 2
 */
export function maxNestingDepth(content: string): number {
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
}

/**
 * Get max line width
 * @example
 * maxLineWidth('short\nvery long line here') // 20
 */
export function maxLineWidth(content: string): number {
  if (content.length === 0) return 0
  return Math.max(...content.split('\n').map(l => l.length))
}

/**
 * Get average line width
 * @example
 * avgLineWidth('abc\ndefgh') // 4
 */
export function avgLineWidth(content: string): number {
  if (content.length === 0) return 0
  const lines = content.split('\n')
  const total = lines.reduce((s, l) => s + l.length, 0)
  return Math.round(total / lines.length)
}

/**
 * Count operators for halstead volume
 * @example
 * countOperators('x + y - z') // 2
 */
export function countOperators(content: string): number {
  return (content.match(/[+\-*/%=<>!&|^~]+/g) ?? []).length
}

/**
 * Count unique operators
 * @example
 * countUniqueOperators('x + y + z') // 1
 */
export function countUniqueOperators(content: string): number {
  const ops = content.match(/[+\-*/%=<>!&|^~]+/g) ?? []
  return Array.from(new Set(ops)).length
}

/**
 * Count operands (identifiers and literals)
 * @example
 * countOperands('const x = 1 + 2') // 3
 */
export function countOperands(content: string): number {
  return (content.match(/\b[a-zA-Z_]\w*\b/g) ?? []).length + (content.match(/\b\d+\.?\d*\b/g) ?? []).length
}

/**
 * Extract function lengths as array of line counts
 * @example
 * extractFunctionLengths('function a() {\n  x\n  y\n}') // [3]
 */
export function extractFunctionLengths(content: string): number[] {
  const lengths: number[] = []
  const lines = content.split('\n')
  let inFunction = false
  let depth = 0
  let startLine = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!inFunction) {
      if (/\bfunction\s+\w+|=>\s*\{|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/.test(line)) {
        inFunction = true
        depth = 0
        startLine = i
        for (const ch of line) {
          if (ch === '{') depth++
          else if (ch === '}') depth--
        }
        if (depth <= 0) {
          lengths.push(1)
          inFunction = false
        }
      }
    } else {
      for (const ch of line) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      if (depth <= 0) {
        lengths.push(i - startLine + 1)
        inFunction = false
      }
    }
  }
  return lengths
}

// ─── Measurement Functions ────────────────────────────────────────────────────

/**
 * Measure file dimensions
 * @example
 * measureDimensions('const x = 1\nconst y = 2') // { totalLines: 2, ... }
 */
export function measureDimensions(content: string): Dimensions {
  const totalLines = content.length === 0 ? 0 : content.split('\n').length
  const codeLines = countCodeLines(content)
  const blankLines = countBlankLines(content)
  const commentLines = countCommentLines(content)
  const maxWidth = maxLineWidth(content)
  const avgWidth = avgLineWidth(content)
  const maxWidthLine = maxWidth
  const maxWidthViolation = maxWidth > 120

  return {
    totalLines, codeLines, blankLines, commentLines,
    maxLineWidth: maxWidth, avgLineWidth: avgWidth,
    maxWidthViolation, maxWidthLine,
  }
}

/**
 * Measure nesting depth
 * @example
 * measureDepth('if (a) { if (b) { x } }') // { maxNesting: 2, ... }
 */
export function measureDepth(content: string): DepthMeasure {
  const lines = content.split('\n')
  const maxNest = maxNestingDepth(content)

  let deepestPoint = ''
  let deepestLevel = 0
  let currentDepth = 0
  for (const line of lines) {
    for (const ch of line) {
      if (ch === '{') currentDepth++
      else if (ch === '}') currentDepth = Math.max(0, currentDepth - 1)
    }
    if (currentDepth > deepestLevel) {
      deepestLevel = currentDepth
      deepestPoint = line.trim().slice(0, 60)
    }
  }

  const nestingLevels: number[] = []
  currentDepth = 0
  for (const line of lines) {
    for (const ch of line) {
      if (ch === '{') currentDepth++
      else if (ch === '}') currentDepth = Math.max(0, currentDepth - 1)
    }
    if (line.trim().length > 0) nestingLevels.push(currentDepth)
  }
  const avgNesting = nestingLevels.length > 0
    ? Math.round(nestingLevels.reduce((s, d) => s + d, 0) / nestingLevels.length)
    : 0

  return {
    maxNesting: maxNest,
    avgNesting,
    hasDeepNesting: maxNest > 4,
    hasShallowNesting: maxNest <= 2 && lines.length > 0,
    deepestPoint: deepestPoint || 'none',
    deepestLevel: deepestLevel,
  }
}

/**
 * Measure cognitive/volume complexity
 * @example
 * measureVolume('if (a) { if (b) {} }') // { cyclomaticComplexity: 2, ... }
 */
export function measureVolume(content: string): VolumeMeasure {
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)

  const cyclomaticComplexity = branches + 1
  const cognitiveComplexity = branches + Math.max(0, maxNestingDepth(content) - 1) * 2

  const operators = Math.max(countOperators(content), 1)
  const uniqueOps = Math.max(countUniqueOperators(content), 1)
  const operands = Math.max(countOperands(content), 1)
  const halsteadVolume = Math.round(loc > 0 ? Math.log2(operators + operands) * (operators + operands) / 10 : 0)

  const hasHighVolume = cyclomaticComplexity > 20 || cognitiveComplexity > 30
  const hasLowVolume = cyclomaticComplexity <= 2 && loc < 20

  let volumeCategory: VolumeCategory = 'trivial'
  if (cognitiveComplexity >= 50) volumeCategory = 'extreme'
  else if (cognitiveComplexity >= 30) volumeCategory = 'highly-complex'
  else if (cognitiveComplexity >= 15) volumeCategory = 'complex'
  else if (cognitiveComplexity >= 8) volumeCategory = 'moderate'
  else if (cognitiveComplexity >= 3) volumeCategory = 'simple'

  return { cyclomaticComplexity, cognitiveComplexity, halsteadVolume, hasHighVolume, hasLowVolume, volumeCategory }
}

/**
 * Measure code density
 * @example
 * measureDensity('if (a) { x }') // { branchesPerLine, ... }
 */
export function measureDensity(content: string): DensityMeasure {
  const loc = Math.max(countLoc(content), 1)
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const comments = countComments(content)
  const codeLines = countCodeLines(content)

  const branchesPerLine = Math.round((branches / loc) * 100) / 100
  const functionsPerLine = Math.round((functions / loc) * 100) / 100
  const commentsPerLine = Math.round((comments / loc) * 100) / 100
  const codeDensity = Math.min(100, Math.max(0, Math.round(
    (codeLines / loc) * 100,
  )))

  const isDense = branchesPerLine > 0.3
  const isSparse = branchesPerLine < 0.05 && functionsPerLine < 0.05
  const isWellBalanced = !isDense && !isSparse && codeDensity >= 40 && codeDensity <= 80

  return { branchesPerLine, functionsPerLine, commentsPerLine, codeDensity, isDense, isSparse, isWellBalanced }
}

/**
 * Measure function proportions
 * @example
 * measureProportion('function a() {\n  x\n  y\n  z\n}') // { functionCount: 1, ... }
 */
export function measureProportion(content: string): ProportionMeasure {
  const functionCount = countFunctions(content)
  const loc = Math.max(countLoc(content), 1)
  const funcLengths = extractFunctionLengths(content)

  const avgFunctionLength = funcLengths.length > 0
    ? Math.round(funcLengths.reduce((s, l) => s + l, 0) / funcLengths.length)
    : 0
  const maxFunctionLength = funcLengths.length > 0 ? Math.max(...funcLengths) : 0
  const minFunctionLength = funcLengths.length > 0 ? Math.min(...funcLengths) : 0
  const functionToTotalRatio = functionCount > 0 ? Math.min(1, Math.round((functionCount / loc) * 100) / 100) : 0

  const giantCount = funcLengths.filter(l => l > 50).length
  const tinyCount = funcLengths.filter(l => l < 5).length
  const hasGiantFunctions = giantCount > 0
  const hasTinyFunctions = tinyCount > 0 && funcLengths.length === tinyCount
  const hasWellProportioned = funcLengths.some(l => l >= 5 && l <= 30)

  const proportionScore = Math.min(100, Math.max(0, Math.round(
    (functionCount > 0 ? 20 : 0) +
    (avgFunctionLength >= 5 && avgFunctionLength <= 30 ? 30 : 0) +
    (!hasGiantFunctions ? 20 : 0) +
    (hasWellProportioned ? 15 : 0) +
    (functionToTotalRatio > 0 ? 15 : 0),
  )))

  return {
    functionCount, avgFunctionLength, maxFunctionLength, minFunctionLength,
    functionToTotalRatio, hasGiantFunctions, hasTinyFunctions, hasWellProportioned,
    giantCount, tinyCount, proportionScore,
  }
}

/**
 * Measure file scale
 * @example
 * measureScale('const x = 1') // { fileSizeCategory: 'nano', ... }
 */
export function measureScale(content: string): ScaleMeasure {
  const loc = countLoc(content)

  let fileSizeCategory: FileSizeCategory = 'nano'
  if (loc > 1000) fileSizeCategory = 'giga'
  else if (loc > 500) fileSizeCategory = 'mega'
  else if (loc > 200) fileSizeCategory = 'large'
  else if (loc > 50) fileSizeCategory = 'medium'
  else if (loc > 20) fileSizeCategory = 'small'
  else if (loc > 5) fileSizeCategory = 'micro'

  const functions = countFunctions(content)
  const classes = countClasses(content)
  const hasSubstance = functions > 0 || classes > 0

  const isRightSized = (loc >= 10 && loc <= 300 && hasSubstance)
  const isUndersized = loc < 10 && hasSubstance
  const isOversized = loc > 500
  const shouldSplit = loc > 300 && functions > 5
  const shouldMerge = loc < 10 && functions <= 1 && !classes

  let scaleFactor = 50
  if (isRightSized) scaleFactor = Math.min(100, 60 + Math.min(loc, 100) / 5)
  else if (isOversized) scaleFactor = Math.max(0, 50 - (loc - 500) / 20)
  else if (isUndersized) scaleFactor = Math.max(0, 30 + loc)
  else scaleFactor = Math.min(100, Math.max(0, 50 + (hasSubstance ? 10 : -10)))

  return {
    fileSizeCategory, isRightSized, isUndersized, isOversized,
    shouldSplit, shouldMerge, scaleFactor: Math.round(scaleFactor),
  }
}

/**
 * Measure blueprint shape
 * @example
 * measureBlueprint('const x = 1') // { isRectangular: true, ... }
 */
export function measureBlueprint(content: string): Blueprint {
  const lines = content.split('\n').filter(l => l.trim().length > 0)
  const maxWidth = maxLineWidth(content)
  const avgWidth = avgLineWidth(content)
  const maxNest = maxNestingDepth(content)

  const widthVariance = lines.length > 0
    ? Math.sqrt(lines.reduce((s, l) => s + Math.pow(l.length - avgWidth, 2), 0) / lines.length)
    : 0
  const isRectangular = widthVariance < 20

  const towers = lines.filter(l => l.length > 120).length
  const hasTowers = towers > 0

  const basements = maxNest > 4 ? 1 : 0
  const hasBasements = basements > 0

  const codeDensity = measureDensity(content)
  const hasWings = codeDensity.isDense && lines.length > 20

  const hasTopSection = lines.length > 0 && (lines[0]?.trim().startsWith('import') || lines[0]?.trim().startsWith('//'))
  const hasBottomSection = lines.length > 2 && (lines[lines.length - 1]?.trim().startsWith('}') || lines[lines.length - 1]?.trim().startsWith('export'))
  const isSymmetric = hasTopSection && hasBottomSection && !hasTowers && !hasBasements

  return {
    isRectangular, hasTowers, hasBasements, hasWings, isSymmetric,
    towerCount: towers, basementCount: basements,
  }
}

// ─── Classification Functions ─────────────────────────────────────────────────

/**
 * Classify measurement condition from quality score
 * @example
 * classifyMeasurementCondition(85) // 'perfectly-measured'
 */
export function classifyMeasurementCondition(score: number): MeasurementCondition {
  if (score >= 80) return 'perfectly-measured'
  if (score >= 60) return 'well-proportioned'
  if (score >= 40) return 'adequate'
  if (score >= 25) return 'misshapen'
  if (score >= 10) return 'distorted'
  return 'monstrosity'
}

/**
 * Classify floor type from measurements
 * @example
 * classifyFloorType([]) // 'void'
 */
export function classifyFloorType(measurements: Measurement[]): FloorType {
  if (measurements.length === 0) return 'void'
  const n = measurements.length
  const avgScore = measurements.reduce((s, m) => s + m.qualityScore, 0) / n
  const perfect = measurements.filter(m => m.condition === 'perfectly-measured').length

  if (perfect > n * 0.5) return 'penthouse'
  if (avgScore >= 60) return 'office-floor'
  if (n >= 5 && avgScore >= 40) return 'warehouse'
  if (avgScore >= 30) return 'studio'
  if (n < 3) return 'closet'
  return 'void'
}

/**
 * Classify floor condition from avg score
 * @example
 * classifyFloorCondition(80) // 'architectural-marvel'
 */
export function classifyFloorCondition(avgScore: number): FloorCondition {
  if (avgScore >= 75) return 'architectural-marvel'
  if (avgScore >= 60) return 'well-designed'
  if (avgScore >= 40) return 'functional'
  if (avgScore >= 25) return 'cramped'
  if (avgScore >= 10) return 'sprawling'
  return 'condemned'
}

/**
 * Classify architect grade from overall balance
 * @example
 * classifyArchitectGrade(85) // 'master-architect'
 */
export function classifyArchitectGrade(avgBalance: number): ArchitectGrade {
  if (avgBalance >= 75) return 'master-architect'
  if (avgBalance >= 60) return 'architect'
  if (avgBalance >= 45) return 'drafter'
  if (avgBalance >= 30) return 'builder'
  if (avgBalance >= 15) return 'handyman'
  return 'demolition'
}

// ─── Core Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze a single file as a measurement
 * @example
 * analyzeMeasurement('const x = 1', 'a.ts') // Measurement
 */
export function analyzeMeasurement(content: string, filePath: string): Measurement {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      length: 0, width: 0, depth: 0, volume: 0, density: 0, proportion: 0, scaleFitness: 0,
      dimensions: { totalLines: 0, codeLines: 0, blankLines: 0, commentLines: 0, maxLineWidth: 0, avgLineWidth: 0, maxWidthViolation: false, maxWidthLine: 0 },
      depthMeasure: { maxNesting: 0, avgNesting: 0, hasDeepNesting: false, hasShallowNesting: false, deepestPoint: 'none', deepestLevel: 0 },
      volumeMeasure: { cyclomaticComplexity: 1, cognitiveComplexity: 0, halsteadVolume: 0, hasHighVolume: false, hasLowVolume: true, volumeCategory: 'trivial' },
      densityMeasure: { branchesPerLine: 0, functionsPerLine: 0, commentsPerLine: 0, codeDensity: 0, isDense: false, isSparse: true, isWellBalanced: false },
      proportionMeasure: { functionCount: 0, avgFunctionLength: 0, maxFunctionLength: 0, minFunctionLength: 0, functionToTotalRatio: 0, hasGiantFunctions: false, hasTinyFunctions: false, hasWellProportioned: false, giantCount: 0, tinyCount: 0, proportionScore: 0 },
      scaleMeasure: { fileSizeCategory: 'nano', isRightSized: false, isUndersized: false, isOversized: false, shouldSplit: false, shouldMerge: false, scaleFactor: 40 },
      blueprint: { isRectangular: true, hasTowers: false, hasBasements: false, hasWings: false, isSymmetric: false, towerCount: 0, basementCount: 0 },
      condition: 'monstrosity',
      qualityScore: 0,
    }
  }

  const dimensions = measureDimensions(content)
  const depthM = measureDepth(content)
  const volumeM = measureVolume(content)
  const densityM = measureDensity(content)
  const proportionM = measureProportion(content)
  const scaleM = measureScale(content)
  const blueprintM = measureBlueprint(content)

  const length = Math.min(100, Math.max(0, Math.round(
    (dimensions.codeLines > 0 ? 20 : 0) +
    (dimensions.totalLines >= 10 && dimensions.totalLines <= 300 ? 30 : 0) +
    (dimensions.totalLines >= 5 ? 20 : 0) +
    (dimensions.commentLines > 0 ? 15 : 0) +
    (!dimensions.maxWidthViolation ? 15 : 0),
  )))

  const width = Math.min(100, Math.max(0, Math.round(
    (!dimensions.maxWidthViolation ? 40 : Math.max(0, 40 - (dimensions.maxLineWidth - 120))) +
    (dimensions.avgLineWidth >= 20 && dimensions.avgLineWidth <= 80 ? 30 : 0) +
    (blueprintM.isRectangular ? 30 : 0),
  )))

  const depthScore = Math.min(100, Math.max(0, Math.round(
    (!depthM.hasDeepNesting ? 40 : Math.max(0, 40 - (depthM.maxNesting - 4) * 10)) +
    (depthM.avgNesting <= 2 ? 30 : Math.max(0, 30 - depthM.avgNesting * 5)) +
    (!depthM.hasDeepNesting ? 30 : 0),
  )))

  const volumeScore = Math.min(100, Math.max(0, Math.round(
    (!volumeM.hasHighVolume ? 30 : 0) +
    (volumeM.cognitiveComplexity <= 10 ? 30 : Math.max(0, 30 - (volumeM.cognitiveComplexity - 10))) +
    (!volumeM.hasLowVolume ? 20 : 0) +
    (volumeM.volumeCategory !== 'extreme' ? 20 : 0),
  )))

  const densityScore = Math.min(100, Math.max(0, Math.round(
    (densityM.isWellBalanced ? 40 : 0) +
    (!densityM.isDense ? 25 : 0) +
    (densityM.codeDensity >= 40 && densityM.codeDensity <= 80 ? 35 : 0),
  )))

  const proportionScore = proportionM.proportionScore

  const scaleFitness = scaleM.scaleFactor

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    length * 0.15 +
    width * 0.1 +
    depthScore * 0.2 +
    volumeScore * 0.2 +
    densityScore * 0.1 +
    proportionScore * 0.15 +
    scaleFitness * 0.1,
  )))

  return {
    file: filePath,
    length: length,
    width: width,
    depth: depthScore,
    volume: volumeScore,
    density: densityScore,
    proportion: proportionScore,
    scaleFitness: scaleFitness,
    dimensions, depthMeasure: depthM, volumeMeasure: volumeM,
    densityMeasure: densityM, proportionMeasure: proportionM,
    scaleMeasure: scaleM, blueprint: blueprintM,
    condition: classifyMeasurementCondition(qualityScore),
    qualityScore,
  }
}

// ─── Floor Plan Analysis ──────────────────────────────────────────────────────

/**
 * Analyze a directory as a floor plan
 * @example
 * analyzeFloorPlan(measurements, 'src') // FloorPlan
 */
export function analyzeFloorPlan(measurements: Measurement[], dirPath: string): FloorPlan {
  if (measurements.length === 0) {
    return {
      directory: dirPath, measurements: [],
      avgLength: 0, avgDepth: 0, avgVolume: 0, avgProportion: 0, avgScaleFitness: 0,
      perfectlyMeasuredCount: 0, monstrosityCount: 0, shouldSplitCount: 0, totalLines: 0,
      floorType: 'void', condition: 'condemned',
    }
  }

  const n = measurements.length
  const avgLength = Math.round(measurements.reduce((s, m) => s + m.length, 0) / n)
  const avgDepth = Math.round(measurements.reduce((s, m) => s + m.depth, 0) / n)
  const avgVolume = Math.round(measurements.reduce((s, m) => s + m.volume, 0) / n)
  const avgProportion = Math.round(measurements.reduce((s, m) => s + m.proportion, 0) / n)
  const avgScaleFitness = Math.round(measurements.reduce((s, m) => s + m.scaleFitness, 0) / n)
  const perfectlyMeasuredCount = measurements.filter(m => m.condition === 'perfectly-measured').length
  const monstrosityCount = measurements.filter(m => m.condition === 'monstrosity').length
  const shouldSplitCount = measurements.filter(m => m.scaleMeasure.shouldSplit).length
  const totalLines = measurements.reduce((s, m) => s + m.dimensions.totalLines, 0)

  const floorType = classifyFloorType(measurements)
  const avgScore = Math.round(measurements.reduce((s, m) => s + m.qualityScore, 0) / n)
  const condition = classifyFloorCondition(avgScore)

  return {
    directory: dirPath, measurements,
    avgLength, avgDepth, avgVolume, avgProportion, avgScaleFitness,
    perfectlyMeasuredCount, monstrosityCount, shouldSplitCount, totalLines,
    floorType, condition,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate tape measure recommendations
 * @example
 * generateRecommendations(measurements, floors, building, stats) // string[]
 */
export function generateRecommendations(
  _measurements: Measurement[],
  _floors: FloorPlan[],
  _building: Building,
  stats: TapeMeasureStats,
): string[] {
  void _measurements
  void _floors
  void _building
  const recs: string[] = []

  if (stats.monstrosityCount > 0) {
    recs.push(`Monstrosities found: ${stats.monstrosityCount} files have terrible proportions`)
  }
  if (stats.giantFunctions > 3) {
    recs.push(`Giant functions detected: ${stats.giantFunctions} functions exceed 50 lines - consider splitting`)
  }
  if (stats.deepNesting > 5) {
    recs.push(`Deep nesting: ${stats.deepNesting} files have nesting deeper than 4 levels`)
  }
  if (stats.shouldSplit > 0) {
    recs.push(`Oversized files: ${stats.shouldSplit} files should be split into smaller modules`)
  }
  if (stats.overallBalance >= 60) {
    recs.push('Well-proportioned codebase: dimensions are generally well-balanced')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete tape measure result from files and contents
 * @example
 * buildTapeMeasureResult(['a.ts'], ['const x = 1'], {}) // TapeMeasureResult
 */
export function buildTapeMeasureResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TapeMeasureResult {
  void options

  const measurements: Measurement[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeMeasurement(content, file)
    } catch {
      return analyzeMeasurement('', file)
    }
  })

  const dirMap = new Map<string, Measurement[]>()
  for (const m of measurements) {
    const dir = m.file.includes('/') ? m.file.slice(0, m.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(m) } else { dirMap.set(dir, [m]) }
  }

  const floors: FloorPlan[] = Array.from(dirMap.entries()).map(([dir, ms]) =>
    analyzeFloorPlan(ms, dir),
  )

  const n = measurements.length || 1
  const avgLength = Math.round(measurements.reduce((s, m) => s + m.length, 0) / n)
  const avgDepth = Math.round(measurements.reduce((s, m) => s + m.depth, 0) / n)
  const avgVolume = Math.round(measurements.reduce((s, m) => s + m.volume, 0) / n)
  const avgProportion = Math.round(measurements.reduce((s, m) => s + m.proportion, 0) / n)
  const avgScaleFitness = Math.round(measurements.reduce((s, m) => s + m.scaleFitness, 0) / n)
  const totalLines = measurements.reduce((s, m) => s + m.dimensions.totalLines, 0)

  const overallBalance = Math.min(100, Math.max(0, Math.round(
    avgLength * 0.2 +
    avgDepth * 0.25 +
    avgVolume * 0.2 +
    avgProportion * 0.2 +
    avgScaleFitness * 0.15,
  )))

  const building: Building = {
    avgLength, avgDepth, avgVolume, avgProportion, avgScaleFitness,
    totalLines,
    isWellProportioned: overallBalance >= 50,
    overallBalance,
  }

  const stats: TapeMeasureStats = {
    totalFiles: files.length,
    totalFloors: floors.length,
    totalLines,
    avgLines: files.length > 0 ? Math.round(totalLines / files.length) : 0,
    avgMaxWidth: Math.round(measurements.reduce((s, m) => s + m.dimensions.maxLineWidth, 0) / n),
    avgMaxNesting: Math.round(measurements.reduce((s, m) => s + m.depthMeasure.maxNesting, 0) / n),
    avgFunctionLength: Math.round(measurements.reduce((s, m) => s + m.proportionMeasure.avgFunctionLength, 0) / n),
    avgDensity: Math.round(measurements.reduce((s, m) => s + m.densityMeasure.codeDensity, 0) / n),
    avgProportion,
    avgScaleFitness,
    perfectlyMeasuredCount: measurements.filter(m => m.condition === 'perfectly-measured').length,
    wellProportionedCount: measurements.filter(m => m.condition === 'well-proportioned').length,
    adequateCount: measurements.filter(m => m.condition === 'adequate').length,
    misshapenCount: measurements.filter(m => m.condition === 'misshapen').length,
    distortedCount: measurements.filter(m => m.condition === 'distorted').length,
    monstrosityCount: measurements.filter(m => m.condition === 'monstrosity').length,
    nanoFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'nano').length,
    microFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'micro').length,
    smallFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'small').length,
    mediumFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'medium').length,
    largeFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'large').length,
    megaFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'mega').length,
    gigaFiles: measurements.filter(m => m.scaleMeasure.fileSizeCategory === 'giga').length,
    giantFunctions: measurements.reduce((s, m) => s + m.proportionMeasure.giantCount, 0),
    tinyFunctions: measurements.reduce((s, m) => s + m.proportionMeasure.tinyCount, 0),
    deepNesting: measurements.filter(m => m.depthMeasure.hasDeepNesting).length,
    highVolume: measurements.filter(m => m.volumeMeasure.hasHighVolume).length,
    shouldSplit: measurements.filter(m => m.scaleMeasure.shouldSplit).length,
    shouldMerge: measurements.filter(m => m.scaleMeasure.shouldMerge).length,
    overallBalance,
    architectGrade: classifyArchitectGrade(overallBalance),
    bestProportioned: measurements.length > 0
      ? measurements.reduce((a, b) => b.proportion > a.proportion ? b : a, measurements[0]).file : 'none',
    worstProportioned: measurements.length > 0
      ? measurements.reduce((a, b) => b.proportion < a.proportion ? b : a, measurements[0]).file : 'none',
    deepestFile: measurements.length > 0
      ? measurements.reduce((a, b) => b.depthMeasure.maxNesting > a.depthMeasure.maxNesting ? b : a, measurements[0]).file : 'none',
    widestFile: measurements.length > 0
      ? measurements.reduce((a, b) => b.dimensions.maxLineWidth > a.dimensions.maxLineWidth ? b : a, measurements[0]).file : 'none',
    densestFile: measurements.length > 0
      ? measurements.reduce((a, b) => b.densityMeasure.codeDensity > a.densityMeasure.codeDensity ? b : a, measurements[0]).file : 'none',
  }

  const recommendations = generateRecommendations(measurements, floors, building, stats)

  return { measurements, floors, building, stats, recommendations }
}
