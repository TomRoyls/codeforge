// ─── Interfaces ──────────────────────────────────────────────────────────────

export type DropType = 'stalactite' | 'stalagmite' | 'column' | 'drapery' | 'straw' | 'hoarfrost'
export type IceType = 'clear-ice' | 'rime-ice' | 'glaze-ice' | 'snow-ice' | 'black-ice' | 'frost'
export type GrowthDirection = 'downward' | 'upward' | 'lateral' | 'static'
export type DropCondition = 'solid' | 'stable' | 'firm' | 'soft' | 'melting' | 'dripping' | 'evaporated'
export type SheetType = 'glacier' | 'ice-shelf' | 'pack-ice' | 'frazil' | 'pancake' | 'polynya'
export type SheetCondition = 'permafrost' | 'frozen-solid' | 'stable' | 'thawing' | 'melting' | 'runoff'
export type CryologistGrade = 'glaciologist' | 'cryologist' | 'ice-climber' | 'skater' | 'sunbather' | 'volcano'

export interface ChainInfo {
  depth: number
  imports: string[]
  transitiveImports: number
  isLeaf: boolean
  isRoot: boolean
  hasCircularRef: boolean
  chainWeight: number
}

export interface FormationInfo {
  rate: number
  isGrowing: boolean
  isStable: boolean
  isMelting: boolean
  isRefreezing: boolean
  growthDirection: GrowthDirection
}

export interface StructuralInfo {
  hasWeakPoint: boolean
  hasFissure: boolean
  hasAirPocket: boolean
  weakPointCount: number
  fissureCount: number
  airPocketCount: number
  canSupport: boolean
  loadBearingCapacity: number
}

export interface MeltingInfo {
  risk: number
  hasDrips: boolean
  dripPoints: string[]
  isThawing: boolean
  isPermafrost: boolean
  thawRate: number
}

export interface IcicleDrop {
  file: string
  icicleLength: number
  thickness: number
  clarity: number
  temperature: number
  dripRate: number
  fragility: number
  dropType: DropType
  iceType: IceType
  chain: ChainInfo
  formation: FormationInfo
  structural: StructuralInfo
  melting: MeltingInfo
  condition: DropCondition
  qualityScore: number
}

export interface IceSheet {
  directory: string
  drops: IcicleDrop[]
  avgLength: number
  avgThickness: number
  avgClarity: number
  avgTemperature: number
  avgFragility: number
  maxDepth: number
  leafCount: number
  rootCount: number
  circularCount: number
  totalWeakPoints: number
  totalFissures: number
  solidCount: number
  meltingCount: number
  sheetHealth: number
  sheetType: SheetType
  condition: SheetCondition
}

export interface GlacierInfo {
  totalDepth: number
  avgLength: number
  avgThickness: number
  avgClarity: number
  avgTemperature: number
  maxChainDepth: number
  circularChains: number
  totalWeakPoints: number
  overallStability: number
}

export interface IcicleStats {
  totalFiles: number
  totalSheets: number
  avgIcicleLength: number
  avgThickness: number
  avgClarity: number
  avgTemperature: number
  avgDripRate: number
  avgFragility: number
  maxChainDepth: number
  avgChainDepth: number
  leafFiles: number
  rootFiles: number
  circularFiles: number
  clearIceFiles: number
  blackIceFiles: number
  solidCount: number
  meltingCount: number
  evaporatedCount: number
  totalWeakPoints: number
  totalFissures: number
  totalAirPockets: number
  growingChains: number
  stableChains: number
  meltingChains: number
  overallStability: number
  cryologistGrade: CryologistGrade
  deepestChain: string
  thinnestChain: string
  clearestChain: string
  mostFragile: string
  mostStable: string
}

export interface IcicleResult {
  drops: IcicleDrop[]
  sheets: IceSheet[]
  glacier: GlacierInfo
  stats: IcicleStats
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
 * Count error handling
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
 * Classify drop type from code structure
 * @example
 * classifyDropType('import { a } from "b"\nexport function c() {}') // 'column'
 */
export function classifyDropType(content: string): DropType {
  const imports = countImports(content)
  const exports = countExports(content)

  if (imports > 0 && exports > 0) return 'column'
  if (imports > 3) return 'stalactite'
  if (exports > 2) return 'stalagmite'
  if (imports > 0) return 'straw'
  if (exports > 0) return 'drapery'
  return 'hoarfrost'
}

/**
 * Classify ice type from clarity and temperature
 * @example
 * classifyIceType(80, 20) // 'clear-ice'
 */
export function classifyIceType(clarity: number, temperature: number): IceType {
  if (clarity >= 70 && temperature <= 30) return 'clear-ice'
  if (clarity >= 50 && temperature <= 40) return 'glaze-ice'
  if (clarity >= 30) return 'rime-ice'
  if (temperature >= 70) return 'black-ice'
  if (clarity >= 15) return 'snow-ice'
  return 'frost'
}

/**
 * Classify drop condition from quality score
 * @example
 * classifyDropCondition(85) // 'solid'
 */
export function classifyDropCondition(qualityScore: number): DropCondition {
  if (qualityScore >= 80) return 'solid'
  if (qualityScore >= 65) return 'stable'
  if (qualityScore >= 50) return 'firm'
  if (qualityScore >= 35) return 'soft'
  if (qualityScore >= 20) return 'melting'
  if (qualityScore >= 5) return 'dripping'
  return 'evaporated'
}

/**
 * Classify sheet type from drop count and health
 * @example
 * classifySheetType(10, 80) // 'glacier'
 */
export function classifySheetType(dropCount: number, health: number): SheetType {
  if (dropCount > 10 && health >= 60) return 'glacier'
  if (dropCount > 5 && health >= 40) return 'ice-shelf'
  if (dropCount > 3) return 'pack-ice'
  if (dropCount > 1) return 'pancake'
  if (health < 30) return 'polynya'
  return 'frazil'
}

/**
 * Classify sheet condition from health
 * @example
 * classifySheetCondition(80) // 'frozen-solid'
 */
export function classifySheetCondition(health: number): SheetCondition {
  if (health >= 80) return 'permafrost'
  if (health >= 65) return 'frozen-solid'
  if (health >= 45) return 'stable'
  if (health >= 25) return 'thawing'
  if (health >= 10) return 'melting'
  return 'runoff'
}

/**
 * Classify cryologist grade from average stability
 * @example
 * classifyCryologistGrade(85) // 'glaciologist'
 */
export function classifyCryologistGrade(avgStability: number): CryologistGrade {
  if (avgStability >= 80) return 'glaciologist'
  if (avgStability >= 65) return 'cryologist'
  if (avgStability >= 45) return 'ice-climber'
  if (avgStability >= 30) return 'skater'
  if (avgStability >= 15) return 'sunbather'
  return 'volcano'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure chain depth from imports
 * @example
 * measureChainDepth('import { a } from "b"\nimport { c } from "d"') // ChainInfo
 */
export function measureChainDepth(content: string): ChainInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const importPaths = Array.from(content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)).map(m => m[1])

  const depth = Math.min(100, Math.round(
    imports * 8 + maxNesting(content) * 3,
  ))
  const transitiveImports = Math.round(imports * 2.5)
  const isLeaf = exports === 0
  const isRoot = imports === 0
  const hasCircularRef = false
  const chainWeight = Math.min(100, Math.round(
    imports * 6 + countFunctions(content) * 3 + countLoc(content) * 0.2,
  ))

  return { depth, imports: importPaths, transitiveImports, isLeaf, isRoot, hasCircularRef, chainWeight }
}

/**
 * Detect weak points in dependency chain
 * @example
 * detectWeakPoints('import { a } from "b"') // number
 */
export function detectWeakPoints(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countImports(content) > 5 ? 15 : 0) +
    (countErrorHandling(content) === 0 && loc > 30 ? 20 : 0) +
    (countTypeAnnotations(content) === 0 && loc > 20 ? 15 : 0) +
    (maxNesting(content) > 4 ? 15 : 0) +
    (countConsole(content) > 3 ? 10 : 0),
  ))
}

/**
 * Detect fissures (cracks) in code structure
 * @example
 * detectFissures('function a() { if (x) { if (y) { if (z) {} } } }') // number
 */
export function detectFissures(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (maxNesting(content) > 5 ? 20 : 0) +
    (countBranches(content) > 10 ? 15 : 0) +
    (countTodos(content) * 8) +
    (loc > 300 ? 10 : 0) +
    (countFunctions(content) > 10 ? 10 : 0),
  ))
}

/**
 * Detect air pockets (missing abstractions)
 * @example
 * detectAirPockets('const a = 1\nconst b = 2\nconst c = 3') // number
 */
export function detectAirPockets(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countExports(content) === 0 && loc > 20 ? 20 : 0) +
    (countComments(content) === 0 && loc > 30 ? 15 : 0) +
    (countTypeAnnotations(content) === 0 && countImports(content) > 2 ? 15 : 0) +
    (countFunctions(content) === 0 && loc > 15 ? 10 : 0),
  ))
}

/**
 * Assess melting risk (change likelihood)
 * @example
 * assessMeltingRisk('TODO: refactor this') // MeltingInfo
 */
export function assessMeltingRisk(content: string): MeltingInfo {
  const loc = countLoc(content)
  const todos = countTodos(content)
  const risk = Math.min(100, Math.round(
    todos * 12 +
    countConsole(content) * 5 +
    (countComments(content) === 0 && loc > 20 ? 10 : 0) +
    (countErrorHandling(content) === 0 && loc > 20 ? 10 : 0),
  ))
  const hasDrips = todos > 0
  const dripPoints: string[] = []
  if (todos > 0) dripPoints.push('todo-markers')
  if (countConsole(content) > 2) dripPoints.push('console-usage')
  const isThawing = risk > 40
  const isPermafrost = loc > 0 && risk < 10
  const thawRate = Math.min(100, Math.round(risk * 0.7))

  return { risk, hasDrips, dripPoints, isThawing, isPermafrost, thawRate }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an icicle drop
 * @example
 * analyzeIcicleDrop('export function calc() { return 1 }', 'calc.ts') // IcicleDrop
 */
export function analyzeIcicleDrop(content: string, filePath: string): IcicleDrop {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const chain = measureChainDepth(content)

  const icicleLength = chain.depth

  const thickness = Math.min(100, Math.round(
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 15 : 5) +
    (loc > 0 && loc <= 200 ? 10 : 0),
  ))

  const clarity = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (/\/\*\*/.test(content) ? 10 : 0) +
    (exports > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
    (countConsole(content) <= 1 ? 10 : 0) +
    (countBranches(content) <= 5 ? 10 : 5) +
    (countErrorHandling(content) > 0 ? 5 : 0),
  ))

  const temperature = Math.min(100, Math.round(
    countTodos(content) * 10 +
    countConsole(content) * 5 +
    (countErrorHandling(content) === 0 && loc > 30 ? 15 : 0) +
    (imports > 5 ? 10 : 0),
  ))

  const dripRate = Math.min(100, Math.round(
    imports * 5 +
    countBranches(content) * 3 +
    countFunctions(content) * 4 +
    (loc > 200 ? 10 : 0),
  ))

  const weakPoints = detectWeakPoints(content)
  const fissures = detectFissures(content)
  const airPockets = detectAirPockets(content)
  const fragility = Math.min(100, Math.max(0, Math.round(
    (100 - thickness) * 0.3 +
    weakPoints * 0.3 +
    fissures * 0.2 +
    airPockets * 0.2,
  )))

  const dropType = classifyDropType(content)
  const iceType = classifyIceType(clarity, temperature)
  const melting = assessMeltingRisk(content)

  const structural: StructuralInfo = {
    hasWeakPoint: weakPoints > 20,
    hasFissure: fissures > 20,
    hasAirPocket: airPockets > 20,
    weakPointCount: weakPoints > 20 ? 1 : 0,
    fissureCount: fissures > 20 ? 1 : 0,
    airPocketCount: airPockets > 20 ? 1 : 0,
    canSupport: thickness >= 40,
    loadBearingCapacity: thickness,
  }

  const formation: FormationInfo = {
    rate: Math.min(100, Math.round(imports * 6)),
    isGrowing: imports > 3,
    isStable: imports <= 3 && exports > 0,
    isMelting: melting.isThawing,
    isRefreezing: countTypeAnnotations(content) > 2 && imports <= 3,
    growthDirection: imports > exports ? 'downward' : exports > imports ? 'upward' : imports > 0 ? 'lateral' : 'static',
  }

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    thickness * 0.25 +
    clarity * 0.2 +
    (100 - fragility) * 0.2 +
    (100 - temperature) * 0.15 +
    (chain.isRoot || chain.isLeaf ? 0 : 10) +
    (structural.canSupport ? 10 : 0),
  )))

  const condition = classifyDropCondition(qualityScore)

  return {
    file: filePath, icicleLength, thickness, clarity, temperature,
    dripRate, fragility, dropType, iceType, chain, formation,
    structural, melting, condition, qualityScore,
  }
}

// ─── Sheet Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as an ice sheet
 * @example
 * analyzeIceSheet(drops, 'src') // IceSheet
 */
export function analyzeIceSheet(drops: IcicleDrop[], dirPath: string): IceSheet {
  if (drops.length === 0) {
    return {
      directory: dirPath, drops: [], avgLength: 0, avgThickness: 0,
      avgClarity: 0, avgTemperature: 0, avgFragility: 0,
      maxDepth: 0, leafCount: 0, rootCount: 0, circularCount: 0,
      totalWeakPoints: 0, totalFissures: 0, solidCount: 0, meltingCount: 0,
      sheetHealth: 100, sheetType: 'frazil', condition: 'permafrost',
    }
  }

  const n = drops.length
  const avgLength = Math.round(drops.reduce((s, d) => s + d.icicleLength, 0) / n)
  const avgThickness = Math.round(drops.reduce((s, d) => s + d.thickness, 0) / n)
  const avgClarity = Math.round(drops.reduce((s, d) => s + d.clarity, 0) / n)
  const avgTemperature = Math.round(drops.reduce((s, d) => s + d.temperature, 0) / n)
  const avgFragility = Math.round(drops.reduce((s, d) => s + d.fragility, 0) / n)
  const maxDepth = Math.max(...drops.map(d => d.chain.depth))

  const leafCount = drops.filter(d => d.chain.isLeaf).length
  const rootCount = drops.filter(d => d.chain.isRoot).length
  const circularCount = drops.filter(d => d.chain.hasCircularRef).length
  const totalWeakPoints = drops.filter(d => d.structural.hasWeakPoint).length
  const totalFissures = drops.filter(d => d.structural.hasFissure).length
  const solidCount = drops.filter(d => d.condition === 'solid' || d.condition === 'stable').length
  const meltingCount = drops.filter(d => d.condition === 'melting' || d.condition === 'dripping').length

  const sheetHealth = Math.min(100, Math.max(0, Math.round(
    avgThickness * 0.25 +
    avgClarity * 0.2 +
    (100 - avgFragility) * 0.2 +
    (100 - avgTemperature) * 0.15 +
    (solidCount / n) * 20,
  )))

  const sheetType = classifySheetType(n, sheetHealth)
  const condition = classifySheetCondition(sheetHealth)

  return {
    directory: dirPath, drops, avgLength, avgThickness, avgClarity,
    avgTemperature, avgFragility, maxDepth, leafCount, rootCount,
    circularCount, totalWeakPoints, totalFissures, solidCount,
    meltingCount, sheetHealth, sheetType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate icicle recommendations
 * @example
 * generateRecommendations(drops, sheets, glacier, stats) // string[]
 */
export function generateRecommendations(
  drops: IcicleDrop[],
  _sheets: IceSheet[],
  _glacier: GlacierInfo,
  stats: IcicleStats,
): string[] {
  void drops
  void _sheets
  void _glacier
  const recs: string[] = []

  if (stats.totalWeakPoints > 0) {
    recs.push(`Weak points: ${stats.totalWeakPoints} files have fragile dependency links`)
  }
  if (stats.totalFissures > 0) {
    recs.push(`Fissures: ${stats.totalFissures} files have structural cracks in the chain`)
  }
  if (stats.totalAirPockets > 0) {
    recs.push(`Air pockets: ${stats.totalAirPockets} files are missing abstraction layers`)
  }
  if (stats.evaporatedCount > 0) {
    recs.push(`Evaporated: ${stats.evaporatedCount} files have dissolved dependency chains`)
  }
  if (stats.meltingCount > 0) {
    recs.push(`Melting chains: ${stats.meltingCount} files are at risk of dependency thaw`)
  }
  if (stats.growingChains > stats.totalFiles * 0.4) {
    recs.push(`Growing chains: ${stats.growingChains} files are accumulating dependencies rapidly`)
  }
  if (stats.overallStability >= 60) {
    recs.push('Stable ice: the dependency glacier is structurally sound')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete icicle result from files and contents
 * @example
 * buildIcicleResult(['a.ts'], ['export function a() {}'], {}) // IcicleResult
 */
export function buildIcicleResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): IcicleResult {
  void options

  const drops: IcicleDrop[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeIcicleDrop(content, file)
    } catch {
      return analyzeIcicleDrop('', file)
    }
  })

  const dirMap = new Map<string, IcicleDrop[]>()
  for (const d of drops) {
    const dir = d.file.includes('/') ? d.file.slice(0, d.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(d) } else { dirMap.set(dir, [d]) }
  }

  const sheets: IceSheet[] = Array.from(dirMap.entries()).map(([dir, ds]) =>
    analyzeIceSheet(ds, dir),
  )

  const n = drops.length || 1
  const avgLength = Math.round(drops.reduce((s, d) => s + d.icicleLength, 0) / n)
  const avgThickness = Math.round(drops.reduce((s, d) => s + d.thickness, 0) / n)
  const avgClarity = Math.round(drops.reduce((s, d) => s + d.clarity, 0) / n)
  const avgTemperature = Math.round(drops.reduce((s, d) => s + d.temperature, 0) / n)
  const maxChainDepth = drops.length > 0 ? Math.max(...drops.map(d => d.chain.depth)) : 0

  const overallStability = Math.min(100, Math.max(0, Math.round(
    avgThickness * 0.3 +
    avgClarity * 0.2 +
    (100 - Math.round(drops.reduce((s, d) => s + d.fragility, 0) / n)) * 0.2 +
    (100 - avgTemperature) * 0.15 +
    (drops.filter(d => d.condition === 'solid' || d.condition === 'stable').length / n) * 15,
  )))

  const glacier: GlacierInfo = {
    totalDepth: drops.reduce((s, d) => s + d.chain.depth, 0),
    avgLength, avgThickness, avgClarity, avgTemperature,
    maxChainDepth,
    circularChains: drops.filter(d => d.chain.hasCircularRef).length,
    totalWeakPoints: drops.filter(d => d.structural.hasWeakPoint).length,
    overallStability,
  }

  const stats: IcicleStats = {
    totalFiles: files.length,
    totalSheets: sheets.length,
    avgIcicleLength: avgLength,
    avgThickness,
    avgClarity,
    avgTemperature,
    avgDripRate: Math.round(drops.reduce((s, d) => s + d.dripRate, 0) / n),
    avgFragility: Math.round(drops.reduce((s, d) => s + d.fragility, 0) / n),
    maxChainDepth,
    avgChainDepth: Math.round(drops.reduce((s, d) => s + d.chain.depth, 0) / n),
    leafFiles: drops.filter(d => d.chain.isLeaf).length,
    rootFiles: drops.filter(d => d.chain.isRoot).length,
    circularFiles: drops.filter(d => d.chain.hasCircularRef).length,
    clearIceFiles: drops.filter(d => d.iceType === 'clear-ice').length,
    blackIceFiles: drops.filter(d => d.iceType === 'black-ice').length,
    solidCount: drops.filter(d => d.condition === 'solid' || d.condition === 'stable').length,
    meltingCount: drops.filter(d => d.condition === 'melting' || d.condition === 'dripping').length,
    evaporatedCount: drops.filter(d => d.condition === 'evaporated').length,
    totalWeakPoints: drops.filter(d => d.structural.hasWeakPoint).length,
    totalFissures: drops.filter(d => d.structural.hasFissure).length,
    totalAirPockets: drops.filter(d => d.structural.hasAirPocket).length,
    growingChains: drops.filter(d => d.formation.isGrowing).length,
    stableChains: drops.filter(d => d.formation.isStable).length,
    meltingChains: drops.filter(d => d.formation.isMelting).length,
    overallStability,
    cryologistGrade: classifyCryologistGrade(overallStability),
    deepestChain: drops.length > 0
      ? drops.reduce((b, d) => d.icicleLength > b.icicleLength ? d : b, drops[0]).file : 'none',
    thinnestChain: drops.length > 0
      ? drops.reduce((b, d) => d.thickness < b.thickness ? d : b, drops[0]).file : 'none',
    clearestChain: drops.length > 0
      ? drops.reduce((b, d) => d.clarity > b.clarity ? d : b, drops[0]).file : 'none',
    mostFragile: drops.length > 0
      ? drops.reduce((b, d) => d.fragility > b.fragility ? d : b, drops[0]).file : 'none',
    mostStable: drops.length > 0
      ? drops.reduce((b, d) => d.temperature < b.temperature ? d : b, drops[0]).file : 'none',
  }

  const recommendations = generateRecommendations(drops, sheets, glacier, stats)

  return { drops, sheets, glacier, stats, recommendations }
}
