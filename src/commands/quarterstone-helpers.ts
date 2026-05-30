// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface MasonryInfo {
  pattern: 'running-bond' | 'stack-bond' | 'english-bond' | 'flemish-bond' | 'random' | 'ashlar'
  jointThickness: number
  mortarQuality: number
  pointing: number
}

export interface StructuralProps {
  compressiveStrength: number
  tensileStrength: number
  shearResistance: number
  weathering: number
  hasSettled: boolean
  isSettling: boolean
  isShifting: boolean
  cracks: number
  spalls: number
  efflorescence: number
}

export interface LoadInfo {
  selfWeight: number
  supportedWeight: number
  totalLoad: number
  loadCapacity: number
  isOverloaded: boolean
  loadRatio: number
}

export interface ConnectionInfo {
  restsUpon: string[]
  supports: string[]
  adjacentTo: string[]
  isAnchored: boolean
  anchorCount: number
}

export interface WeatheringInfo {
  age: 'fresh' | 'new' | 'seasoned' | 'weathered' | 'ancient' | 'ruined'
  condition: 'pristine' | 'excellent' | 'good' | 'fair' | 'weathered' | 'eroded' | 'crumbling'
  maintenanceNeeded: string[]
}

export interface FoundationStone {
  file: string
  stoneQuality: number
  mortarStrength: number
  plumbAlignment: number
  levelness: number
  squareness: number
  isCornerstone: boolean
  isKeystone: boolean
  isCapstone: boolean
  isFoundation: boolean
  isLoadBearing: boolean
  stoneType: 'granite' | 'marble' | 'limestone' | 'sandstone' | 'slate' | 'brick' | 'concrete' | 'wood' | 'straw'
  stoneShape: 'ashlar' | 'rubble' | 'fieldstone' | 'cut-stone' | 'dressed-stone' | 'rough-hewn'
  position: 'cornerstone' | 'foundation' | 'wall-stone' | 'arch-stone' | 'keystone' | 'capstone' | 'infill' | 'veneer'
  masonry: MasonryInfo
  structural: StructuralProps
  load: LoadInfo
  connections: ConnectionInfo
  weathering: WeatheringInfo
  qualityScore: number
}

export interface MasonrySection {
  directory: string
  stones: FoundationStone[]
  cornerstone: string
  keystone: string
  avgStoneQuality: number
  avgMortarStrength: number
  avgPlumbAlignment: number
  avgLevelness: number
  avgSquareness: number
  foundationCount: number
  keystoneCount: number
  loadBearingCount: number
  overloadedCount: number
  totalLoad: number
  totalCapacity: number
  structuralHealth: number
  isSound: boolean
  sectionType: 'foundation' | 'walls' | 'arches' | 'columns' | 'buttresses' | 'roof' | 'decoration'
  condition: 'monumental' | 'sturdy' | 'serviceable' | 'degraded' | 'failing' | 'collapsed'
}

export interface BuildingInfo {
  cornerstone: string
  keystone: string
  avgStoneQuality: number
  avgMortarStrength: number
  avgPlumbAlignment: number
  avgLevelness: number
  avgSquareness: number
  totalLoad: number
  totalCapacity: number
  loadRatio: number
  isStructurallySound: boolean
  structuralHealth: number
  foundationDepth: number
  buildingHeight: number
  isPlumb: boolean
  isLevel: boolean
  isSquare: boolean
}

export interface QuarterstoneStats {
  totalFiles: number
  totalSections: number
  cornerstones: number
  keystones: number
  capstones: number
  loadBearingStones: number
  overloadedStones: number
  foundationStones: number
  graniteStones: number
  strawStones: number
  avgStoneQuality: number
  avgMortarStrength: number
  avgPlumbAlignment: number
  avgLevelness: number
  avgSquareness: number
  totalCracks: number
  totalSpalls: number
  totalEfflorescence: number
  settledStones: number
  shiftingStones: number
  overallStructuralHealth: number
  masterMasonGrade: 'master-mason' | 'mason' | 'apprentice' | 'laborer' | 'amateur' | 'child'
  cornerstoneFile: string
  keystoneFile: string
  strongestStone: string
  weakestStone: string
  heaviestLoad: string
  bestMasonry: string
}

export interface QuarterstoneResult {
  stones: FoundationStone[]
  sections: MasonrySection[]
  building: BuildingInfo
  stats: QuarterstoneStats
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
 * Measure max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
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
 * Count TODO/FIXME markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
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
 * Extract import paths
 * @example
 * extractImportPaths('import { x } from "./y"') // ["./y"]
 */
export function extractImportPaths(content: string): string[] {
  const matches = content.match(/from\s+['"]([^'"]+)['"]/g) ?? []
  return matches.map(m => {
    const inner = m.match(/['"]([^'"]+)['"]/)
    return inner?.[1] ?? ''
  }).filter(Boolean)
}

// ─── Core Measurements ───────────────────────────────────────────────────────

/**
 * Measure stone quality (code quality of foundational file)
 * @example
 * measureStoneQuality('export function calc() { return 1 }') // number
 */
export function measureStoneQuality(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasError = countErrorHandling(content) > 0 ? 15 : 0
  const hasExports = countExports(content) > 0 ? 15 : 0
  const hasDocs = countComments(content) > 0 ? 10 : 0
  const lowNesting = maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0
  const sizeOk = loc <= 150 ? 15 : loc <= 300 ? 8 : 0
  const lowTodos = countTodos(content) <= 2 ? 10 : 0

  return Math.min(100, hasTypes + hasError + hasExports + hasDocs + lowNesting + sizeOk + lowTodos)
}

/**
 * Measure mortar strength (integration quality)
 * @example
 * measureMortarStrength('import { x } from "y"\nexport function a() {}') // number
 */
export function measureMortarStrength(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasExports = countExports(content) > 0 ? 20 : 0
  const hasImports = countImports(content) > 0 ? 15 : 0
  const balanced = (() => {
    const imp = countImports(content)
    const exp = countExports(content)
    return imp > 0 && exp > 0 ? 20 : 5
  })()
  const hasTypes = countTypeAnnotations(content) > 0 ? 15 : 0
  const hasError = countErrorHandling(content) > 0 ? 10 : 0
  const fewConsole = countConsole(content) <= 1 ? 10 : 0
  const sizeOk = loc <= 200 ? 10 : 0

  return Math.min(100, hasExports + hasImports + balanced + hasTypes + hasError + fewConsole + sizeOk)
}

/**
 * Measure plumb alignment (architectural alignment)
 * @example
 * measurePlumbAlignment('export function calc(x: number): number { return x }') // number
 */
export function measurePlumbAlignment(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 25 : 0
  const hasReturn = /\breturn\b/.test(content) ? 15 : 0
  const lowBranches = countBranches(content) <= 5 ? 20 : countBranches(content) <= 10 ? 10 : 0
  const singleExport = countExports(content) === 1 ? 20 : countExports(content) <= 3 ? 10 : 0
  const sizeOk = loc <= 100 ? 20 : loc <= 200 ? 10 : 0

  return Math.min(100, hasTypes + hasReturn + lowBranches + singleExport + sizeOk)
}

/**
 * Measure levelness (balanced design)
 * @example
 * measureLevelness('function a() {}\nfunction b() {}') // number
 */
export function measureLevelness(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const funcs = countFunctions(content)
  const exports = countExports(content)
  const balanced = funcs > 0 && exports > 0 ? 25 : 5

  const funcSize = funcs > 0 ? Math.min(25, Math.round(100 / Math.max(1, Math.abs(funcs - exports) + 1))) : 10

  const lowNesting = maxNesting(content) <= 3 ? 25 : maxNesting(content) <= 5 ? 12 : 0
  const sizeOk = loc <= 150 ? 25 : loc <= 300 ? 12 : 0

  return Math.min(100, balanced + funcSize + lowNesting + sizeOk)
}

/**
 * Measure squareness (correct patterns)
 * @example
 * measureSquareness('export function calc(x: number): number { try { return x } catch { return 0 } }') // number
 */
export function measureSquareness(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasError = countErrorHandling(content) > 0 ? 20 : 0
  const hasDocs = /\/\*\*/.test(content) ? 15 : 0
  const hasConst = /\bconst\b/.test(content) ? 10 : 0
  const noVar = !/\bvar\b/.test(content) ? 15 : 0
  const lowConsole = countConsole(content) === 0 ? 10 : 0
  const lowTodos = countTodos(content) === 0 ? 10 : 0

  return Math.min(100, hasTypes + hasError + hasDocs + hasConst + noVar + lowConsole + lowTodos)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify stone type from quality score
 * @example
 * classifyStoneType(90) // 'granite'
 */
export function classifyStoneType(quality: number): FoundationStone['stoneType'] {
  if (quality >= 80) return 'granite'
  if (quality >= 70) return 'marble'
  if (quality >= 60) return 'limestone'
  if (quality >= 45) return 'sandstone'
  if (quality >= 35) return 'slate'
  if (quality >= 25) return 'brick'
  if (quality >= 15) return 'concrete'
  if (quality >= 5) return 'wood'
  return 'straw'
}

/**
 * Classify stone shape from code structure
 * @example
 * classifyStoneShape('export function calc() { return 1 }') // string
 */
export function classifyStoneShape(content: string): FoundationStone['stoneShape'] {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  if (exports > 0 && types > 0 && errors > 0 && loc > 10) return 'ashlar'
  if (exports > 0 && types > 0) return 'cut-stone'
  if (exports > 0 && loc > 10) return 'dressed-stone'
  if (exports > 0) return 'fieldstone'
  if (loc > 5) return 'rubble'
  return 'rough-hewn'
}

/**
 * Classify position from imports and dependents count
 * @example
 * classifyPosition(0, 10) // 'cornerstone'
 */
export function classifyPosition(imports: number, dependents: number): FoundationStone['position'] {
  if (dependents >= 5 && imports <= 2) return 'cornerstone'
  if (dependents >= 3 && imports <= 3) return 'foundation'
  if (dependents >= 5 && imports >= 3) return 'keystone'
  if (dependents >= 3 && imports >= 3) return 'arch-stone'
  if (dependents > 0 && dependents < 3 && imports === 0) return 'capstone'
  if (imports > 0 && dependents === 0) return 'veneer'
  if (dependents > 0) return 'wall-stone'
  return 'infill'
}

/**
 * Classify master mason grade
 * @example
 * classifyMasterMasonGrade(80) // 'master-mason'
 */
export function classifyMasterMasonGrade(avgHealth: number): QuarterstoneStats['masterMasonGrade'] {
  if (avgHealth >= 75) return 'master-mason'
  if (avgHealth >= 60) return 'mason'
  if (avgHealth >= 40) return 'apprentice'
  if (avgHealth >= 25) return 'laborer'
  if (avgHealth >= 10) return 'amateur'
  return 'child'
}

/**
 * Classify section condition from health
 * @example
 * classifySectionCondition(85) // 'monumental'
 */
export function classifySectionCondition(health: number): MasonrySection['condition'] {
  if (health >= 80) return 'monumental'
  if (health >= 60) return 'sturdy'
  if (health >= 40) return 'serviceable'
  if (health >= 25) return 'degraded'
  if (health >= 10) return 'failing'
  return 'collapsed'
}

/**
 * Classify section type from stone composition
 * @example
 * classifySectionType(0.7, 0.3) // 'foundation'
 */
export function classifySectionType(foundationRatio: number, loadBearingRatio: number): MasonrySection['sectionType'] {
  if (foundationRatio >= 0.5) return 'foundation'
  if (loadBearingRatio >= 0.5) return 'columns'
  if (loadBearingRatio >= 0.3) return 'arches'
  if (foundationRatio >= 0.2) return 'walls'
  if (loadBearingRatio >= 0.1) return 'buttresses'
  if (foundationRatio > 0) return 'roof'
  return 'decoration'
}

/**
 * Classify masonry pattern from code structure
 * @example
 * classifyMasonryPattern(5, 3, 10) // string
 */
export function classifyMasonryPattern(exports: number, imports: number, loc: number): MasonryInfo['pattern'] {
  if (exports > 0 && imports > 0 && loc > 20) return 'english-bond'
  if (exports > 0 && imports > 0) return 'flemish-bond'
  if (exports > 2 && loc > 10) return 'running-bond'
  if (exports > 0 && loc > 5) return 'stack-bond'
  if (exports > 0) return 'ashlar'
  return 'random'
}

/**
 * Classify weathering age from code characteristics
 * @example
 * classifyWeatheringAge(50, true, 3) // string
 */
export function classifyWeatheringAge(loc: number, hasDocs: boolean, todos: number): WeatheringInfo['age'] {
  if (loc > 100 && hasDocs && todos === 0) return 'ancient'
  if (loc > 50 && hasDocs) return 'seasoned'
  if (loc > 30) return 'weathered'
  if (loc > 10) return 'new'
  if (loc > 0) return 'fresh'
  return 'ruined'
}

/**
 * Classify weathering condition from quality score
 * @example
 * classifyWeatheringCondition(85) // 'pristine'
 */
export function classifyWeatheringCondition(qualityScore: number): WeatheringInfo['condition'] {
  if (qualityScore >= 85) return 'pristine'
  if (qualityScore >= 70) return 'excellent'
  if (qualityScore >= 55) return 'good'
  if (qualityScore >= 40) return 'fair'
  if (qualityScore >= 25) return 'weathered'
  if (qualityScore >= 10) return 'eroded'
  return 'crumbling'
}

// ─── Structural Analysis ─────────────────────────────────────────────────────

/**
 * Analyze structural properties of a foundation stone
 * @example
 * analyzeStructural(content) // StructuralProps
 */
export function analyzeStructural(content: string): StructuralProps {
  const nesting = maxNesting(content)
  const branches = countBranches(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)

  const compressiveStrength = Math.min(100, Math.round(
    (errors > 0 ? 30 : 0) +
    (nesting <= 3 ? 25 : nesting <= 5 ? 15 : 5) +
    (branches <= 5 ? 25 : branches <= 10 ? 12 : 0) +
    (loc <= 150 ? 20 : loc <= 300 ? 10 : 0),
  ))

  const tensileStrength = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (errors > 0 ? 25 : 0) +
    (countExports(content) <= 3 ? 25 : 10) +
    (loc <= 200 ? 20 : 10),
  ))

  const shearResistance = Math.min(100, Math.round(
    (countImports(content) <= 3 ? 30 : countImports(content) <= 6 ? 15 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countConsole(content) === 0 ? 25 : 5),
  ))

  const weathering = Math.min(100, Math.round(
    (countComments(content) > 0 ? 25 : 0) +
    (/\/\*\*/.test(content) ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countTodos(content) === 0 ? 20 : 5),
  ))

  const cracks = countTodos(content) + countConsole(content)
  const spalls = Math.max(0, nesting - 3) + Math.max(0, branches - 5)
  const efflorescence = Math.max(0, countImports(content) - 5) + Math.max(0, loc - 200) / 50

  return {
    compressiveStrength,
    tensileStrength,
    shearResistance,
    weathering: Math.round(weathering),
    hasSettled: cracks === 0 && errors > 0,
    isSettling: cracks <= 2 && loc > 10,
    isShifting: cracks > 3 || nesting > 5,
    cracks,
    spalls,
    efflorescence: Math.round(efflorescence),
  }
}

// ─── Masonry Analysis ────────────────────────────────────────────────────────

/**
 * Analyze masonry properties
 * @example
 * analyzeMasonry(content) // MasonryInfo
 */
export function analyzeMasonry(content: string): MasonryInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const loc = countLoc(content)

  return {
    pattern: classifyMasonryPattern(exports, imports, loc),
    jointThickness: Math.min(100, Math.round((imports + 1) * 8)),
    mortarQuality: measureMortarStrength(content),
    pointing: Math.min(100, Math.round(
      (countTypeAnnotations(content) > 0 ? 40 : 0) +
      (countComments(content) > 0 ? 30 : 0) +
      (exports > 0 ? 30 : 0),
    )),
  }
}

// ─── Weathering Assessment ───────────────────────────────────────────────────

/**
 * Assess weathering of a stone
 * @example
 * assessWeathering(content, 50) // WeatheringInfo
 */
export function assessWeathering(content: string, qualityScore: number): WeatheringInfo {
  const loc = countLoc(content)
  const hasDocs = countComments(content) > 0
  const todos = countTodos(content)

  const maintenanceNeeded: string[] = []
  if (todos > 0) maintenanceNeeded.push(`Remove ${todos} TODO markers`)
  if (countConsole(content) > 2) maintenanceNeeded.push('Reduce console statements')
  if (maxNesting(content) > 4) maintenanceNeeded.push('Reduce nesting depth')
  if (qualityScore < 40) maintenanceNeeded.push('Improve code quality')
  if (countTypeAnnotations(content) === 0 && loc > 10) maintenanceNeeded.push('Add type annotations')

  return {
    age: classifyWeatheringAge(loc, hasDocs, todos),
    condition: classifyWeatheringCondition(qualityScore),
    maintenanceNeeded,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a foundation stone
 * @example
 * analyzeFoundationStone('export function a() {}', 'a.ts', 1, 2) // FoundationStone
 */
export function analyzeFoundationStone(
  content: string,
  filePath: string,
  importsCount: number,
  dependentsCount: number,
): FoundationStone {
  const stoneQuality = measureStoneQuality(content)
  const mortarStrength = measureMortarStrength(content)
  const plumbAlignment = measurePlumbAlignment(content)
  const levelness = measureLevelness(content)
  const squareness = measureSquareness(content)

  const loc = countLoc(content)
  const exports = countExports(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    stoneQuality * 0.25 +
    mortarStrength * 0.2 +
    plumbAlignment * 0.2 +
    levelness * 0.15 +
    squareness * 0.2,
  )))

  const isFoundation = dependentsCount > 0 && importsCount <= 3
  const isLoadBearing = dependentsCount >= 3 || exports >= 3
  const isCornerstone = dependentsCount >= 5 && importsCount <= 2
  const isKeystone = dependentsCount >= 3 && importsCount >= 3 && exports > 0
  const isCapstone = exports > 0 && dependentsCount === 0 && importsCount === 0

  const stoneType = classifyStoneType(qualityScore)
  const stoneShape = classifyStoneShape(content)
  const position = classifyPosition(importsCount, dependentsCount)

  const masonry = analyzeMasonry(content)
  const structural = analyzeStructural(content)

  const selfWeight = Math.min(100, Math.round(loc / 3))
  const supportedWeight = Math.min(100, dependentsCount * 10)
  const totalLoad = selfWeight + supportedWeight
  const loadCapacity = Math.max(1, stoneQuality + mortarStrength)
  const isOverloaded = totalLoad > loadCapacity
  const loadRatio = Math.round((totalLoad / loadCapacity) * 100) / 100

  const load: LoadInfo = {
    selfWeight, supportedWeight, totalLoad, loadCapacity, isOverloaded, loadRatio,
  }

  const importPaths = extractImportPaths(content)
  const connections: ConnectionInfo = {
    restsUpon: importPaths,
    supports: [],
    adjacentTo: [],
    isAnchored: importsCount <= 2 && dependentsCount > 0,
    anchorCount: importsCount + dependentsCount,
  }

  const weathering = assessWeathering(content, qualityScore)

  return {
    file: filePath, stoneQuality, mortarStrength, plumbAlignment,
    levelness, squareness, isCornerstone, isKeystone, isCapstone,
    isFoundation, isLoadBearing, stoneType, stoneShape, position,
    masonry, structural, load, connections, weathering, qualityScore,
  }
}

// ─── Section Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a masonry section
 * @example
 * analyzeMasonrySection(stones, 'src') // MasonrySection
 */
export function analyzeMasonrySection(stones: FoundationStone[], dirPath: string): MasonrySection {
  if (stones.length === 0) {
    return {
      directory: dirPath, stones: [], cornerstone: 'none', keystone: 'none',
      avgStoneQuality: 0, avgMortarStrength: 0, avgPlumbAlignment: 0,
      avgLevelness: 0, avgSquareness: 0, foundationCount: 0, keystoneCount: 0,
      loadBearingCount: 0, overloadedCount: 0, totalLoad: 0, totalCapacity: 0,
      structuralHealth: 0, isSound: false, sectionType: 'decoration',
      condition: 'collapsed',
    }
  }

  const n = stones.length
  const avgStoneQuality = Math.round(stones.reduce((s, t) => s + t.stoneQuality, 0) / n)
  const avgMortarStrength = Math.round(stones.reduce((s, t) => s + t.mortarStrength, 0) / n)
  const avgPlumbAlignment = Math.round(stones.reduce((s, t) => s + t.plumbAlignment, 0) / n)
  const avgLevelness = Math.round(stones.reduce((s, t) => s + t.levelness, 0) / n)
  const avgSquareness = Math.round(stones.reduce((s, t) => s + t.squareness, 0) / n)

  const firstStone = stones[0]
  const cornerstone = firstStone
    ? (stones.reduce((best, s) =>
        s.isCornerstone && (!best || s.qualityScore > best.qualityScore) ? s : best,
        null as FoundationStone | null,
      )?.file ?? stones.reduce((best, s) =>
        s.qualityScore > best.qualityScore ? s : best, firstStone,
      ).file)
    : 'none'

  const keystone = stones.reduce((best, s) =>
    s.isKeystone && (!best || s.load.supportedWeight > best.load.supportedWeight) ? s : best,
    null as FoundationStone | null,
  )?.file ?? cornerstone

  const foundationCount = stones.filter(s => s.isFoundation).length
  const keystoneCount = stones.filter(s => s.isKeystone).length
  const loadBearingCount = stones.filter(s => s.isLoadBearing).length
  const overloadedCount = stones.filter(s => s.load.isOverloaded).length
  const totalLoad = stones.reduce((s, t) => s + t.load.totalLoad, 0)
  const totalCapacity = stones.reduce((s, t) => s + t.load.loadCapacity, 0)

  const structuralHealth = Math.round(
    avgStoneQuality * 0.25 + avgMortarStrength * 0.2 +
    avgPlumbAlignment * 0.2 + avgLevelness * 0.15 + avgSquareness * 0.2,
  )

  const sectionType = classifySectionType(
    n > 0 ? foundationCount / n : 0,
    n > 0 ? loadBearingCount / n : 0,
  )

  const condition = classifySectionCondition(structuralHealth)
  const isSound = structuralHealth >= 50 && overloadedCount === 0

  return {
    directory: dirPath, stones, cornerstone, keystone,
    avgStoneQuality, avgMortarStrength, avgPlumbAlignment,
    avgLevelness, avgSquareness, foundationCount, keystoneCount,
    loadBearingCount, overloadedCount, totalLoad, totalCapacity,
    structuralHealth, isSound, sectionType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate quarterstone recommendations
 * @example
 * generateRecommendations(stones, sections, building, stats) // string[]
 */
export function generateRecommendations(
  _stones: FoundationStone[],
  sections: MasonrySection[],
  _building: BuildingInfo,
  stats: QuarterstoneStats,
): string[] {
  void _stones
  void _building
  const recs: string[] = []

  if (stats.overloadedStones > 0) {
    recs.push(`Overloaded stones: ${stats.overloadedStones} files need load redistribution`)
  }

  if (stats.totalCracks > 10) {
    recs.push(`Cracks detected: ${stats.totalCracks} issues need structural repair`)
  }

  if (stats.strawStones > 0) {
    recs.push(`Straw foundations: ${stats.strawStones} files need rebuilding with proper materials`)
  }

  if (stats.shiftingStones > 0) {
    recs.push(`Shifting stones: ${stats.shiftingStones} files need stabilization`)
  }

  if (stats.avgMortarStrength < 40) {
    recs.push(`Weak mortar: avg ${stats.avgMortarStrength} — improve integration quality`)
  }

  if (stats.overallStructuralHealth >= 60) {
    recs.push('Solid foundation: building structure is sound')
  }

  const degradedSections = sections.filter(s => !s.isSound)
  if (degradedSections.length > 0) {
    recs.push(`Degraded sections: ${degradedSections.length} directories need reinforcement`)
  }

  if (stats.strongestStone !== 'none') {
    recs.push(`Strongest stone: ${stats.strongestStone} — use as construction template`)
  }

  if (stats.totalEfflorescence > 5) {
    recs.push(`Efflorescence: ${stats.totalEfflorescence} tech debt indicators showing through`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete quarterstone result from files and contents
 * @example
 * buildQuarterstoneResult(['a.ts'], ['export function a() {}'], {}) // QuarterstoneResult
 */
export function buildQuarterstoneResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): QuarterstoneResult {
  void options

  const importMap = new Map<string, string[]>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    const paths = extractImportPaths(content)
    importMap.set(file, paths)
  }

  const dependentCounts = new Map<string, number>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    dependentCounts.set(file, 0)
  }
  for (const [file, paths] of importMap) {
    void file
    for (const p of paths) {
      for (const f of files) {
        if (f.endsWith(p.replace(/^\.\//, '')) || f.includes(p.replace(/^\.\//, ''))) {
          dependentCounts.set(f, (dependentCounts.get(f) ?? 0) + 1)
        }
      }
    }
  }

  const stones: FoundationStone[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const impCount = countImports(content)
    const depCount = dependentCounts.get(file) ?? 0
    try {
      return analyzeFoundationStone(content, file, impCount, depCount)
    } catch {
      return analyzeFoundationStone('', file, 0, 0)
    }
  })

  for (let i = 0; i < stones.length; i++) {
    const file = files[i]
    const stone = stones[i]
    if (!file || !stone) continue
    const paths = importMap.get(file) ?? []
    stone.connections.restsUpon = paths

    const siblings: string[] = []
    const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '.'
    for (const f of files) {
      const fDir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '.'
      if (fDir === dir && f !== file) siblings.push(f)
    }
    stone.connections.adjacentTo = siblings
  }

  for (let i = 0; i < stones.length; i++) {
    const stoneI = stones[i]
    const fileI = files[i]
    if (!stoneI || !fileI) continue
    for (let j = 0; j < stones.length; j++) {
      if (i === j) continue
      const stoneJ = stones[j]
      const fileJ = files[j]
      if (!stoneJ || !fileJ) continue
      if (stoneJ.connections.restsUpon.some(p => fileI.endsWith(p.replace(/^\.\//, '')))) {
        if (!stoneI.connections.supports.includes(fileJ)) {
          stoneI.connections.supports.push(fileJ)
        }
      }
    }
  }

  const dirMap = new Map<string, FoundationStone[]>()
  for (const s of stones) {
    const dir = s.file.includes('/') ? s.file.slice(0, s.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(s) } else { dirMap.set(dir, [s]) }
  }

  const sections: MasonrySection[] = Array.from(dirMap.entries()).map(([dir, ts]) =>
    analyzeMasonrySection(ts, dir),
  )

  const n = stones.length || 1
  const avgStoneQuality = Math.round(stones.reduce((s, t) => s + t.stoneQuality, 0) / n)
  const avgMortarStrength = Math.round(stones.reduce((s, t) => s + t.mortarStrength, 0) / n)
  const avgPlumbAlignment = Math.round(stones.reduce((s, t) => s + t.plumbAlignment, 0) / n)
  const avgLevelness = Math.round(stones.reduce((s, t) => s + t.levelness, 0) / n)
  const avgSquareness = Math.round(stones.reduce((s, t) => s + t.squareness, 0) / n)

  const totalLoad = stones.reduce((s, t) => s + t.load.totalLoad, 0)
  const totalCapacity = stones.reduce((s, t) => s + t.load.loadCapacity, 0)

  const structuralHealth = Math.round(
    avgStoneQuality * 0.25 + avgMortarStrength * 0.2 +
    avgPlumbAlignment * 0.2 + avgLevelness * 0.15 + avgSquareness * 0.2,
  )

  const first = stones[0]
  const building: BuildingInfo = {
    cornerstone: first
      ? stones.reduce((best, s) => s.qualityScore > best.qualityScore ? s : best, first).file
      : 'none',
    keystone: first
      ? stones.reduce((best, s) => s.load.supportedWeight > best.load.supportedWeight ? s : best, first).file
      : 'none',
    avgStoneQuality,
    avgMortarStrength,
    avgPlumbAlignment,
    avgLevelness,
    avgSquareness,
    totalLoad,
    totalCapacity,
    loadRatio: totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) / 100 : 0,
    isStructurallySound: structuralHealth >= 50,
    structuralHealth,
    foundationDepth: Math.round(stones.reduce((s, t) => s + t.masonry.pointing, 0) / n),
    buildingHeight: Math.round(stones.reduce((s, t) => s + t.structural.compressiveStrength, 0) / n),
    isPlumb: avgPlumbAlignment >= 60,
    isLevel: avgLevelness >= 60,
    isSquare: avgSquareness >= 60,
  }

  const stats: QuarterstoneStats = {
    totalFiles: files.length,
    totalSections: sections.length,
    cornerstones: stones.filter(s => s.isCornerstone).length,
    keystones: stones.filter(s => s.isKeystone).length,
    capstones: stones.filter(s => s.isCapstone).length,
    loadBearingStones: stones.filter(s => s.isLoadBearing).length,
    overloadedStones: stones.filter(s => s.load.isOverloaded).length,
    foundationStones: stones.filter(s => s.isFoundation).length,
    graniteStones: stones.filter(s => s.stoneType === 'granite').length,
    strawStones: stones.filter(s => s.stoneType === 'straw').length,
    avgStoneQuality,
    avgMortarStrength,
    avgPlumbAlignment,
    avgLevelness,
    avgSquareness,
    totalCracks: stones.reduce((s, t) => s + t.structural.cracks, 0),
    totalSpalls: stones.reduce((s, t) => s + t.structural.spalls, 0),
    totalEfflorescence: stones.reduce((s, t) => s + t.structural.efflorescence, 0),
    settledStones: stones.filter(s => s.structural.hasSettled).length,
    shiftingStones: stones.filter(s => s.structural.isShifting).length,
    overallStructuralHealth: structuralHealth,
    masterMasonGrade: classifyMasterMasonGrade(structuralHealth),
    cornerstoneFile: building.cornerstone,
    keystoneFile: building.keystone,
    strongestStone: first
      ? stones.reduce((s, t) => t.qualityScore > s.qualityScore ? t : s, first).file : 'none',
    weakestStone: first
      ? stones.reduce((s, t) => t.qualityScore < s.qualityScore ? t : s, first).file : 'none',
    heaviestLoad: first
      ? stones.reduce((s, t) => t.load.totalLoad > s.load.totalLoad ? t : s, first).file : 'none',
    bestMasonry: first
      ? stones.reduce((s, t) => t.masonry.mortarQuality > s.masonry.mortarQuality ? t : s, first).file : 'none',
  }

  const recommendations = generateRecommendations(stones, sections, building, stats)

  return { stones, sections, building, stats, recommendations }
}
