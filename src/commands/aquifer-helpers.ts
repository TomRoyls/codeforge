// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface FlowInfo {
  direction: 'inflow' | 'outflow' | 'through-flow' | 'stagnant'
  velocity: number
  isSteady: boolean
  isSeasonal: boolean
  isFlash: boolean
  hasDrySpells: boolean
  hasFlooding: boolean
  drySpellCount: number
  floodCount: number
}

export type ContaminationLevel = 'pristine' | 'clean' | 'minor' | 'moderate' | 'heavy' | 'toxic'

export interface ContaminationInfo {
  level: ContaminationLevel
  sources: string[]
  isContaminated: boolean
  contaminantCount: number
  hasSpread: boolean
}

export interface WellInfo {
  count: number
  avgDepth: number
  avgYield: number
  isOverdrawn: boolean
  isSustainable: boolean
  hasDryWells: boolean
  dryWellCount: number
}

export interface SpringInfo {
  count: number
  avgQuality: number
  hasMineralContent: boolean
  hasSediment: boolean
  isCrystal: boolean
}

export interface UndergroundInfo {
  caveCount: number
  tunnelCount: number
  hasHiddenRivers: boolean
  hasSinks: boolean
  hasSwallows: boolean
  hiddenRiverCount: number
  sinkCount: number
  swallowCount: number
}

export type AquiferType = 'confined' | 'unconfined' | 'artesian' | 'perched' | 'leaky' | 'dry'
export type WaterSource = 'rainfall' | 'river-recharge' | 'deep-infiltration' | 'fossil' | 'mixing' | 'unknown'
export type WaterLevel = 'flooded' | 'high' | 'normal' | 'low' | 'critical' | 'dry'
export type TableCondition = 'artesian-well' | 'clean-spring' | 'deep-aquifer' | 'shallow-well' | 'dry-hole' | 'toxic-dump'

export interface WaterTable {
  file: string
  tableDepth: number
  permeability: number
  waterQuality: number
  rechargeRate: number
  springQuality: number
  flowRate: number
  aquiferType: AquiferType
  waterSource: WaterSource
  flow: FlowInfo
  contamination: ContaminationInfo
  wells: WellInfo
  springs: SpringInfo
  underground: UndergroundInfo
  waterLevel: WaterLevel
  condition: TableCondition
  qualityScore: number
}

export type LayerWaterTable = 'flooded' | 'high' | 'normal' | 'low' | 'depleted' | 'dry'
export type LayerCondition = 'mineral-spring' | 'clean-reservoir' | 'adequate' | 'depleted' | 'contaminated' | 'desert'

export interface AquiferLayer {
  directory: string
  tables: WaterTable[]
  avgWaterQuality: number
  avgFlowRate: number
  avgPermeability: number
  dominantAquiferType: string
  cleanCount: number
  contaminatedCount: number
  dryCount: number
  totalHiddenRivers: number
  totalSinks: number
  totalSwallows: number
  layerHealth: number
  isHealthy: boolean
  waterTable: LayerWaterTable
  condition: LayerCondition
}

export interface BasinInfo {
  totalWaterQuality: number
  avgFlowRate: number
  avgPermeability: number
  totalHiddenRivers: number
  totalSinks: number
  totalContamination: number
  overallHealth: number
  isSustainable: boolean
  waterTable: string
}

export interface AquiferStats {
  totalFiles: number
  totalLayers: number
  avgTableDepth: number
  avgPermeability: number
  avgWaterQuality: number
  avgFlowRate: number
  avgRechargeRate: number
  avgSpringQuality: number
  confinedCount: number
  artesianCount: number
  dryCount: number
  pristineCount: number
  toxicCount: number
  steadyFlow: number
  stagnantFlow: number
  hiddenRiverCount: number
  sinkCount: number
  swallowCount: number
  dryWellCount: number
  overdrawnCount: number
  totalContaminants: number
  isSustainable: boolean
  overallWaterQuality: number
  hydrologistGrade: 'master-hydrologist' | 'hydrologist' | 'geologist' | 'well-digger' | 'dowsing' | 'thirsty'
  cleanestFile: string
  dirtiestFile: string
  deepestFlow: string
  shallowestFlow: string
  bestSpring: string
  worstSink: string
}

export interface AquiferResult {
  tables: WaterTable[]
  layers: AquiferLayer[]
  basin: BasinInfo
  stats: AquiferStats
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

/**
 * Count closures (functions returning functions or nested functions)
 * @example
 * countClosures('const fn = () => () => 1') // 1
 */
export function countClosures(content: string): number {
  return (content.match(/=>\s*(?:async\s+)?\(|=>\s*\{/g) ?? []).length
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure table depth (how deep data flows go)
 * @example
 * measureTableDepth('function a() { if (x) { return b() } }') // number
 */
export function measureTableDepth(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(maxNesting(content) * 12 + countFunctions(content) * 3 + Math.min(30, loc * 0.3)))
}

/**
 * Measure permeability (data flow ease)
 * @example
 * measurePermeability('export function calc(x: number): number { return x }') // number
 */
export function measurePermeability(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasExports = countExports(content) > 0 ? 25 : 0
  const hasImports = countImports(content) > 0 ? 15 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const lowNesting = maxNesting(content) <= 3 ? 25 : maxNesting(content) <= 5 ? 12 : 0
  const lowBranches = countBranches(content) <= 5 ? 15 : 0
  return Math.min(100, hasExports + hasImports + hasTypes + lowNesting + lowBranches)
}

/**
 * Measure water quality (data/state quality)
 * @example
 * measureWaterQuality('const x: number = calc(input)') // number
 */
export function measureWaterQuality(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 25 : 0
  const hasError = countErrorHandling(content) > 0 ? 20 : 0
  const noTodos = countTodos(content) === 0 ? 15 : 0
  const noConsole = countConsole(content) <= 1 ? 15 : 0
  const hasExports = countExports(content) > 0 ? 15 : 0
  const noVar = !/\bvar\b/.test(content) ? 10 : 0
  return Math.min(100, hasTypes + hasError + noTodos + noConsole + hasExports + noVar)
}

/**
 * Measure recharge rate (data refresh quality)
 * @example
 * measureRechargeRate('export function refresh() { return fetch(url) }') // number
 */
export function measureRechargeRate(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasAsync = /\basync\b|\bawait\b|Promise/.test(content) ? 20 : 0
  const hasError = countErrorHandling(content) > 0 ? 20 : 0
  const hasReturn = /\breturn\b/.test(content) ? 15 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 15 : 0
  const hasDocs = countComments(content) > 0 ? 15 : 0
  const lowNesting = maxNesting(content) <= 4 ? 15 : 0
  return Math.min(100, hasAsync + hasError + hasReturn + hasTypes + hasDocs + lowNesting)
}

/**
 * Measure spring quality (output data quality)
 * @example
 * measureSpringQuality('export function calc(): Result { return { ok: true } }') // number
 */
export function measureSpringQuality(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const hasExports = countExports(content) > 0 ? 25 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasReturn = /\breturn\b/.test(content) ? 15 : 0
  const hasError = countErrorHandling(content) > 0 ? 15 : 0
  const hasDocs = /\/\*\*/.test(content) ? 15 : 0
  const lowConsole = countConsole(content) === 0 ? 10 : 0
  return Math.min(100, hasExports + hasTypes + hasReturn + hasError + hasDocs + lowConsole)
}

/**
 * Measure flow rate (data throughput)
 * @example
 * measureFlowRate('export function a() {} export function b() {}') // number
 */
export function measureFlowRate(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const exportFlow = Math.min(30, countExports(content) * 8)
  const importFlow = Math.min(20, countImports(content) * 5)
  const funcFlow = Math.min(25, countFunctions(content) * 5)
  const sizeFlow = loc <= 100 ? 25 : loc <= 200 ? 15 : 0
  return Math.min(100, exportFlow + importFlow + funcFlow + sizeFlow)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify aquifer type from content
 * @example
 * classifyAquiferType('export function calc() {}') // string
 */
export function classifyAquiferType(content: string): AquiferType {
  const exports = countExports(content)
  const imports = countImports(content)
  const loc = countLoc(content)

  if (exports > 2 && imports > 0 && countTypeAnnotations(content) > 0) return 'artesian'
  if (exports > 1 && imports > 1 && loc > 30) return 'confined'
  if (exports > 0 && imports === 0) return 'perched'
  if (imports > 0 && exports === 0) return 'leaky'
  if (exports === 0 && imports === 0 && loc > 0) return 'dry'
  return 'unconfined'
}

/**
 * Classify water source from content
 * @example
 * classifyWaterSource('export function calc() {}') // string
 */
export function classifyWaterSource(content: string): WaterSource {
  const hasAsync = /\basync\b|\bawait\b|Promise/.test(content)
  const hasFetch = /\bfetch\b|\breadFile|\breadFileSync/.test(content)
  const hasImports = countImports(content) > 0
  const hasExports = countExports(content) > 0

  if (hasFetch) return 'river-recharge'
  if (hasAsync && hasImports) return 'deep-infiltration'
  if (hasImports && hasExports) return 'mixing'
  if (hasExports && !hasImports) return 'rainfall'
  if (!hasImports && !hasExports) return 'fossil'
  return 'unknown'
}

/**
 * Classify water level from quality score
 * @example
 * classifyWaterLevel(80) // 'high'
 */
export function classifyWaterLevel(quality: number): WaterLevel {
  if (quality >= 85) return 'flooded'
  if (quality >= 65) return 'high'
  if (quality >= 40) return 'normal'
  if (quality >= 20) return 'low'
  if (quality >= 5) return 'critical'
  return 'dry'
}

/**
 * Classify table condition from quality score
 * @example
 * classifyTableCondition(80) // 'artesian-well'
 */
export function classifyTableCondition(quality: number): TableCondition {
  if (quality >= 80) return 'artesian-well'
  if (quality >= 60) return 'clean-spring'
  if (quality >= 40) return 'deep-aquifer'
  if (quality >= 20) return 'shallow-well'
  if (quality >= 5) return 'dry-hole'
  return 'toxic-dump'
}

/**
 * Classify hydrologist grade from average quality
 * @example
 * classifyHydrologistGrade(80) // 'master-hydrologist'
 */
export function classifyHydrologistGrade(avgQuality: number): AquiferStats['hydrologistGrade'] {
  if (avgQuality >= 75) return 'master-hydrologist'
  if (avgQuality >= 60) return 'hydrologist'
  if (avgQuality >= 40) return 'geologist'
  if (avgQuality >= 25) return 'well-digger'
  if (avgQuality >= 10) return 'dowsing'
  return 'thirsty'
}

/**
 * Classify contamination level from count
 * @example
 * classifyContaminationLevel(0) // 'pristine'
 */
export function classifyContaminationLevel(count: number): ContaminationLevel {
  if (count === 0) return 'pristine'
  if (count <= 1) return 'clean'
  if (count <= 3) return 'minor'
  if (count <= 6) return 'moderate'
  if (count <= 10) return 'heavy'
  return 'toxic'
}

/**
 * Classify layer water table from health
 * @example
 * classifyLayerWaterTable(80) // 'high'
 */
export function classifyLayerWaterTable(health: number): LayerWaterTable {
  if (health >= 75) return 'flooded'
  if (health >= 55) return 'high'
  if (health >= 35) return 'normal'
  if (health >= 15) return 'low'
  if (health >= 5) return 'depleted'
  return 'dry'
}

/**
 * Classify layer condition from health
 * @example
 * classifyLayerCondition(80) // 'mineral-spring'
 */
export function classifyLayerCondition(health: number): LayerCondition {
  if (health >= 75) return 'mineral-spring'
  if (health >= 55) return 'clean-reservoir'
  if (health >= 35) return 'adequate'
  if (health >= 15) return 'depleted'
  if (health >= 5) return 'contaminated'
  return 'desert'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect contamination sources in content
 * @example
 * detectContamination('var x = 1\nconsole.log(x)') // ContaminationInfo
 */
export function detectContamination(content: string): ContaminationInfo {
  const sources: string[] = []
  const todos = countTodos(content)
  const consoles = countConsole(content)
  const hasVar = /\bvar\b/.test(content)
  const hasAny = /:\s*any\b/.test(content)
  const hasTsIgnore = /@ts-ignore|@ts-expect-error/.test(content)

  if (todos > 0) sources.push('todos')
  if (consoles > 2) sources.push('console-spam')
  if (hasVar) sources.push('var-usage')
  if (hasAny) sources.push('any-types')
  if (hasTsIgnore) sources.push('ts-suppression')

  const contaminantCount = todos + (consoles > 2 ? consoles - 2 : 0) + (hasVar ? 2 : 0) + (hasAny ? 3 : 0) + (hasTsIgnore ? 2 : 0)
  const level = classifyContaminationLevel(contaminantCount)
  const isContaminated = contaminantCount > 0
  const hasSpread = countExports(content) > 0 && isContaminated

  return { level, sources, isContaminated, contaminantCount, hasSpread }
}

/**
 * Detect hidden rivers (undocumented data flows)
 * @example
 * detectHiddenRivers('const x = fn()') // { count, hasHidden }
 */
export function detectHiddenRivers(content: string): { count: number; hasHidden: boolean } {
  const closures = countClosures(content)
  const globals = (content.match(/\bglobalThis\b|\bwindow\b|\bprocess\b|\bglobal\b/g) ?? []).length
  const implicitReturns = (content.match(/=>\s*[^{\n]/g) ?? []).length
  const count = closures + globals + implicitReturns
  return { count, hasHidden: count > 0 }
}

/**
 * Detect sinks (data disappearing — swallowed errors)
 * @example
 * detectSinks('try {} catch(e) {}') // { count, hasSinks }
 */
export function detectSinks(content: string): { count: number; hasSinks: boolean } {
  const emptyCatch = (content.match(/\bcatch\s*\([^)]*\)\s*\{\s*\}/g) ?? []).length
  const voidReturn = (content.match(/:\s*void\b/g) ?? []).length
  const count = emptyCatch + voidReturn
  return { count, hasSinks: count > 0 }
}

/**
 * Detect swallows (data consumed without output)
 * @example
 * detectSwallows('function a(x: number) { console.log(x) }') // { count, hasSwallows }
 */
export function detectSwallows(content: string): { count: number; hasSwallows: boolean } {
  const noReturnFuncs = (content.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g) ?? []).filter(f => !/\breturn\b/.test(f)).length
  const consoleOnly = countConsole(content) > 0 && countExports(content) === 0 && countLoc(content) < 20 ? 1 : 0
  const count = noReturnFuncs + consoleOnly
  return { count, hasSwallows: count > 0 }
}

// ─── Assessment Functions ────────────────────────────────────────────────────

/**
 * Assess wells (export access point quality)
 * @example
 * assessWells(content) // WellInfo
 */
export function assessWells(content: string): WellInfo {
  const count = countExports(content)
  const avgDepth = maxNesting(content)
  const avgYield = count > 0 ? Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countFunctions(content) > 0 ? 25 : 0),
  )) : 0

  const isOverdrawn = count > 8
  const isSustainable = avgYield >= 40 && !isOverdrawn
  const hasDryWells = count === 0 && countLoc(content) > 20
  const dryWellCount = hasDryWells ? 1 : 0

  return { count, avgDepth, avgYield, isOverdrawn, isSustainable, hasDryWells, dryWellCount }
}

/**
 * Assess springs (output quality)
 * @example
 * assessSprings(content) // SpringInfo
 */
export function assessSprings(content: string): SpringInfo {
  const count = countFunctions(content)
  const avgQuality = count > 0 ? Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countExports(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (countConsole(content) === 0 ? 10 : 0),
  )) : 0

  const hasMineralContent = countTypeAnnotations(content) > 2
  const hasSediment = countConsole(content) > 0 && countFunctions(content) > 0
  const isCrystal = avgQuality >= 60 && !hasSediment

  return { count, avgQuality, hasMineralContent, hasSediment, isCrystal }
}

// ─── Flow Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze flow characteristics
 * @example
 * analyzeFlow(content) // FlowInfo
 */
export function analyzeFlow(content: string): FlowInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const loc = countLoc(content)

  let direction: FlowInfo['direction'] = 'stagnant'
  if (exports > 0 && imports > 0) direction = 'through-flow'
  else if (exports > 0) direction = 'outflow'
  else if (imports > 0) direction = 'inflow'

  const velocity = Math.min(100, Math.round(
    exports * 10 + imports * 5 + countFunctions(content) * 3 + Math.min(30, loc * 0.2),
  ))

  const isSteady = countBranches(content) <= 5 && maxNesting(content) <= 3
  const isSeasonal = countBranches(content) > 5 && countBranches(content) <= 12
  const isFlash = maxNesting(content) > 6

  const drySpellCount = (exports === 0 && loc > 15 ? 1 : 0) + (countFunctions(content) === 0 && loc > 20 ? 1 : 0)
  const floodCount = countConsole(content) > 3 ? countConsole(content) - 3 : 0

  return {
    direction, velocity, isSteady, isSeasonal, isFlash,
    hasDrySpells: drySpellCount > 0,
    hasFlooding: floodCount > 0,
    drySpellCount, floodCount,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a water table
 * @example
 * analyzeWaterTable('export function calc() { return 1 }', 'calc.ts') // WaterTable
 */
export function analyzeWaterTable(content: string, filePath: string): WaterTable {
  const tableDepth = measureTableDepth(content)
  const permeability = measurePermeability(content)
  const waterQuality = measureWaterQuality(content)
  const rechargeRate = measureRechargeRate(content)
  const springQuality = measureSpringQuality(content)
  const flowRate = measureFlowRate(content)

  const aquiferType = classifyAquiferType(content)
  const waterSource = classifyWaterSource(content)
  const flow = analyzeFlow(content)
  const contamination = detectContamination(content)
  const wells = assessWells(content)
  const springs = assessSprings(content)

  const hidden = detectHiddenRivers(content)
  const sinks = detectSinks(content)
  const swallows = detectSwallows(content)

  const underground: UndergroundInfo = {
    caveCount: countClosures(content),
    tunnelCount: countImports(content),
    hasHiddenRivers: hidden.hasHidden,
    hasSinks: sinks.hasSinks,
    hasSwallows: swallows.hasSwallows,
    hiddenRiverCount: hidden.count,
    sinkCount: sinks.count,
    swallowCount: swallows.count,
  }

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    waterQuality * 0.2 +
    permeability * 0.15 +
    rechargeRate * 0.15 +
    springQuality * 0.15 +
    flowRate * 0.1 +
    (100 - contamination.contaminantCount * 5) * 0.15 +
    (underground.hasSinks ? 0 : 10),
  )))

  const waterLevel = classifyWaterLevel(qualityScore)
  const condition = classifyTableCondition(qualityScore)

  return {
    file: filePath, tableDepth, permeability, waterQuality,
    rechargeRate, springQuality, flowRate, aquiferType, waterSource,
    flow, contamination, wells, springs, underground,
    waterLevel, condition, qualityScore,
  }
}

// ─── Layer Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as an aquifer layer
 * @example
 * analyzeAquiferLayer(tables, 'src') // AquiferLayer
 */
export function analyzeAquiferLayer(tables: WaterTable[], dirPath: string): AquiferLayer {
  if (tables.length === 0) {
    return {
      directory: dirPath, tables: [], avgWaterQuality: 0, avgFlowRate: 0,
      avgPermeability: 0, dominantAquiferType: 'dry', cleanCount: 0,
      contaminatedCount: 0, dryCount: 0, totalHiddenRivers: 0,
      totalSinks: 0, totalSwallows: 0, layerHealth: 0,
      isHealthy: false, waterTable: 'dry', condition: 'desert',
    }
  }

  const n = tables.length
  const avgWaterQuality = Math.round(tables.reduce((s, t) => s + t.waterQuality, 0) / n)
  const avgFlowRate = Math.round(tables.reduce((s, t) => s + t.flowRate, 0) / n)
  const avgPermeability = Math.round(tables.reduce((s, t) => s + t.permeability, 0) / n)

  const typeCounts: Record<string, number> = {}
  for (const t of tables) {
    typeCounts[t.aquiferType] = (typeCounts[t.aquiferType] ?? 0) + 1
  }
  const dominantAquiferType = Array.from(Object.entries(typeCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'dry'

  const cleanCount = tables.filter(t => !t.contamination.isContaminated).length
  const contaminatedCount = tables.filter(t => t.contamination.isContaminated).length
  const dryCount = tables.filter(t => t.aquiferType === 'dry' || t.waterLevel === 'dry').length
  const totalHiddenRivers = tables.reduce((s, t) => s + t.underground.hiddenRiverCount, 0)
  const totalSinks = tables.reduce((s, t) => s + t.underground.sinkCount, 0)
  const totalSwallows = tables.reduce((s, t) => s + t.underground.swallowCount, 0)

  const layerHealth = Math.round(
    avgWaterQuality * 0.3 + avgFlowRate * 0.2 + avgPermeability * 0.2 +
    (cleanCount / n * 100) * 0.15 + (avgPermeability) * 0.15,
  )

  const isHealthy = layerHealth >= 50
  const waterTable = classifyLayerWaterTable(layerHealth)
  const condition = classifyLayerCondition(layerHealth)

  return {
    directory: dirPath, tables, avgWaterQuality, avgFlowRate,
    avgPermeability, dominantAquiferType, cleanCount, contaminatedCount,
    dryCount, totalHiddenRivers, totalSinks, totalSwallows,
    layerHealth, isHealthy, waterTable, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate aquifer recommendations
 * @example
 * generateAquiferRecommendations(tables, layers, basin, stats) // string[]
 */
export function generateAquiferRecommendations(
  tables: WaterTable[],
  layers: AquiferLayer[],
  _basin: BasinInfo,
  stats: AquiferStats,
): string[] {
  void _basin
  const recs: string[] = []

  if (stats.toxicCount > 0) {
    recs.push(`Toxic files: ${stats.toxicCount} need immediate decontamination`)
  }

  if (stats.hiddenRiverCount > 5) {
    recs.push(`Hidden rivers: ${stats.hiddenRiverCount} undocumented data flows need mapping`)
  }

  if (stats.sinkCount > 0) {
    recs.push(`Sinks detected: ${stats.sinkCount} places where data disappears without handling`)
  }

  if (stats.swallowCount > 0) {
    recs.push(`Swallows found: ${stats.swallowCount} data consumed without producing output`)
  }

  if (stats.dryWellCount > 0) {
    recs.push(`Dry wells: ${stats.dryWellCount} unreachable or unused code sections`)
  }

  if (stats.overdrawnCount > 0) {
    recs.push(`Overdrawn: ${stats.overdrawnCount} files with too many exports — reduce coupling`)
  }

  if (stats.stagnantFlow > stats.totalFiles * 0.5) {
    recs.push('Stagnant flow: majority of files lack data movement')
  }

  if (stats.overallWaterQuality >= 60) {
    recs.push('Good water quality: data flows are generally clean and well-typed')
  }

  const contaminatedLayers = layers.filter(l => l.condition === 'contaminated' || l.condition === 'desert')
  if (contaminatedLayers.length > 0) {
    recs.push(`Polluted layers: ${contaminatedLayers.length} directories need cleanup`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete aquifer result from files and contents
 * @example
 * buildAquiferResult(['a.ts'], ['export function a() {}'], {}) // AquiferResult
 */
export function buildAquiferResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): AquiferResult {
  void options

  const tables: WaterTable[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeWaterTable(content, file)
    } catch {
      return analyzeWaterTable('', file)
    }
  })

  const dirMap = new Map<string, WaterTable[]>()
  for (const t of tables) {
    const dir = t.file.includes('/') ? t.file.slice(0, t.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(t) } else { dirMap.set(dir, [t]) }
  }

  const layers: AquiferLayer[] = Array.from(dirMap.entries()).map(([dir, ts]) =>
    analyzeAquiferLayer(ts, dir),
  )

  const n = tables.length || 1
  const avgTableDepth = Math.round(tables.reduce((s, t) => s + t.tableDepth, 0) / n)
  const avgPermeability = Math.round(tables.reduce((s, t) => s + t.permeability, 0) / n)
  const avgWaterQuality = Math.round(tables.reduce((s, t) => s + t.waterQuality, 0) / n)
  const avgFlowRate = Math.round(tables.reduce((s, t) => s + t.flowRate, 0) / n)
  const avgRechargeRate = Math.round(tables.reduce((s, t) => s + t.rechargeRate, 0) / n)
  const avgSpringQuality = Math.round(tables.reduce((s, t) => s + t.springQuality, 0) / n)

  const overallWaterQuality = Math.round(
    avgWaterQuality * 0.3 + avgPermeability * 0.2 + avgRechargeRate * 0.2 +
    avgSpringQuality * 0.15 + avgFlowRate * 0.15,
  )

  const totalHiddenRivers = tables.reduce((s, t) => s + t.underground.hiddenRiverCount, 0)
  const totalSinks = tables.reduce((s, t) => s + t.underground.sinkCount, 0)
  const totalContamination = tables.reduce((s, t) => s + t.contamination.contaminantCount, 0)

  const isSustainable = overallWaterQuality >= 40 && totalSinks < tables.length * 0.5
  const overallHealth = Math.round(
    overallWaterQuality * 0.4 +
    (isSustainable ? 30 : 10) +
    (totalContamination < 5 ? 30 : totalContamination < 15 ? 15 : 0),
  )

  let basinWaterTable = 'normal'
  if (overallHealth >= 75) basinWaterTable = 'flooded'
  else if (overallHealth >= 55) basinWaterTable = 'high'
  else if (overallHealth >= 35) basinWaterTable = 'normal'
  else if (overallHealth >= 15) basinWaterTable = 'low'
  else basinWaterTable = 'dry'

  const basin: BasinInfo = {
    totalWaterQuality: avgWaterQuality,
    avgFlowRate, avgPermeability, totalHiddenRivers,
    totalSinks, totalContamination, overallHealth,
    isSustainable, waterTable: basinWaterTable,
  }

  const stats: AquiferStats = {
    totalFiles: files.length,
    totalLayers: layers.length,
    avgTableDepth, avgPermeability, avgWaterQuality, avgFlowRate,
    avgRechargeRate, avgSpringQuality,
    confinedCount: tables.filter(t => t.aquiferType === 'confined').length,
    artesianCount: tables.filter(t => t.aquiferType === 'artesian').length,
    dryCount: tables.filter(t => t.aquiferType === 'dry' || t.waterLevel === 'dry').length,
    pristineCount: tables.filter(t => t.contamination.level === 'pristine').length,
    toxicCount: tables.filter(t => t.contamination.level === 'heavy' || t.contamination.level === 'toxic').length,
    steadyFlow: tables.filter(t => t.flow.isSteady).length,
    stagnantFlow: tables.filter(t => t.flow.direction === 'stagnant').length,
    hiddenRiverCount: totalHiddenRivers,
    sinkCount: totalSinks,
    swallowCount: tables.reduce((s, t) => s + t.underground.swallowCount, 0),
    dryWellCount: tables.reduce((s, t) => s + t.wells.dryWellCount, 0),
    overdrawnCount: tables.filter(t => t.wells.isOverdrawn).length,
    totalContaminants: totalContamination,
    isSustainable,
    overallWaterQuality,
    hydrologistGrade: classifyHydrologistGrade(overallWaterQuality),
    cleanestFile: tables.length > 0
      ? tables.reduce((b, t) => t.waterQuality > b.waterQuality ? t : b, tables[0]).file : 'none',
    dirtiestFile: tables.length > 0
      ? tables.reduce((d, t) => t.waterQuality < d.waterQuality ? t : d, tables[0]).file : 'none',
    deepestFlow: tables.length > 0
      ? tables.reduce((d, t) => t.tableDepth > d.tableDepth ? t : d, tables[0]).file : 'none',
    shallowestFlow: tables.length > 0
      ? tables.reduce((s, t) => t.tableDepth < s.tableDepth ? t : s, tables[0]).file : 'none',
    bestSpring: tables.length > 0
      ? tables.reduce((b, t) => t.springs.avgQuality > b.springs.avgQuality ? t : b, tables[0]).file : 'none',
    worstSink: tables.length > 0
      ? tables.reduce((w, t) => t.underground.sinkCount > w.underground.sinkCount ? t : w, tables[0]).file : 'none',
  }

  const recommendations = generateAquiferRecommendations(tables, layers, basin, stats)

  return { tables, layers, basin, stats, recommendations }
}
