// ─── Interfaces ──────────────────────────────────────────────────────────────

export type SailType = 'common' | 'spring' | 'patent' | 'fantail' | 'jib-sail' | 'decorative'
export type MillType = 'tower-mill' | 'post-mill' | 'smock-mill' | 'horizontal' | 'turbine' | 'water-mill'
export type SailCondition = 'new' | 'good' | 'worn' | 'torn' | 'missing' | 'broken'
export type WindmillCondition = 'fully-operational' | 'operational' | 'needs-repair' | 'deteriorating' | 'idle' | 'ruined'
export type ComplexCondition = 'thriving-mill' | 'working-mill' | 'struggling-mill' | 'abandoned-mill' | 'ruins'
export type MillwrightGrade = 'master-millwright' | 'millwright' | 'mechanic' | 'handyman' | 'apprentice' | 'tourist'

export interface SailsInfo {
  count: number
  condition: SailCondition
  avgSailQuality: number
  areBalanced: boolean
  hasMissingSails: boolean
  hasTornSails: boolean
  isCatchingWind: boolean
}

export interface GrindingInfo {
  inputGrain: number
  outputFlour: number
  grindingRatio: number
  isConsistent: boolean
  hasCoarseOutput: boolean
  hasWastedGrain: boolean
  stoneGap: number
}

export interface GearsInfo {
  ratio: number
  meshQuality: number
  hasSlipping: boolean
  hasGrinding: boolean
  hasBrokenTeeth: boolean
  toothCount: number
  isWellOiled: boolean
}

export interface WindInfo {
  direction: string
  velocity: number
  consistency: number
  isSteady: boolean
  isGusty: boolean
  isCalm: boolean
}

export interface TowerInfo {
  height: number
  isPlumb: boolean
  isStable: boolean
  hasFoundation: boolean
  hasCracks: boolean
  foundationDepth: number
}

export interface EnergyInfo {
  input: number
  output: number
  loss: number
  efficiency: number
  isRenewable: boolean
}

export interface WindmillSail {
  file: string
  sailEfficiency: number
  windCapture: number
  grindingQuality: number
  rotationSpeed: number
  gearRatio: number
  structuralStability: number
  sailType: SailType
  millType: MillType
  sails: SailsInfo
  grinding: GrindingInfo
  gears: GearsInfo
  wind: WindInfo
  tower: TowerInfo
  energy: EnergyInfo
  condition: WindmillCondition
  qualityScore: number
}

export interface MillComplex {
  directory: string
  sails: WindmillSail[]
  avgEfficiency: number
  avgGrindingQuality: number
  avgStructuralStability: number
  dominantMillType: string
  operationalCount: number
  idleCount: number
  ruinedCount: number
  totalEnergyInput: number
  totalEnergyOutput: number
  overallEfficiency: number
  hasBottlenecks: boolean
  bottleneckCount: number
  complexHealth: number
  condition: ComplexCondition
}

export interface WindFarm {
  totalEnergyInput: number
  totalEnergyOutput: number
  overallEfficiency: number
  operationalMills: number
  idleMills: number
  ruinedMills: number
  hasBottlenecks: boolean
}

export interface WindmillSailStats {
  totalFiles: number
  totalComplexes: number
  avgSailEfficiency: number
  avgWindCapture: number
  avgGrindingQuality: number
  avgRotationSpeed: number
  avgGearRatio: number
  avgStructuralStability: number
  avgEnergyEfficiency: number
  towerMills: number
  postMills: number
  turbineMills: number
  operationalCount: number
  idleCount: number
  ruinedCount: number
  balancedSails: number
  tornSails: number
  missingSails: number
  hasCoarseOutput: number
  hasWastedGrain: number
  hasSlippingGears: number
  hasBrokenTeeth: number
  totalEnergyInput: number
  totalEnergyOutput: number
  overallEfficiency: number
  millwrightGrade: MillwrightGrade
  mostEfficient: string
  leastEfficient: string
  bestGrinding: string
  mostStable: string
}

export interface WindmillSailResult {
  sails: WindmillSail[]
  complexes: MillComplex[]
  windFarm: WindFarm
  stats: WindmillSailStats
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
 * Classify sail type from code structure
 * @example
 * classifySailType('export function a(): number { return 1 }') // 'patent'
 */
export function classifySailType(content: string): SailType {
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const errorHandling = countErrorHandling(content)

  if (types > 3 && exports > 2 && errorHandling > 0) return 'fantail'
  if (types > 1 && exports > 1) return 'patent'
  if (exports > 0 && funcs > 0) return 'spring'
  if (funcs > 0) return 'common'
  if (exports > 0) return 'jib-sail'
  return 'decorative'
}

/**
 * Classify mill type from code complexity
 * @example
 * classifyMillType('export class X {}') // 'tower-mill'
 */
export function classifyMillType(content: string): MillType {
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /interface\s+\w/.test(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const loc = countLoc(content)

  if (hasInterface && hasClass && imports > 2) return 'tower-mill'
  if (hasClass && imports > 1) return 'smock-mill'
  if (imports > 3) return 'post-mill'
  if (exports > 2 && loc > 20) return 'turbine'
  if (exports > 0) return 'horizontal'
  return 'water-mill'
}

/**
 * Classify windmill condition from quality score
 * @example
 * classifyWindmillCondition(85) // 'fully-operational'
 */
export function classifyWindmillCondition(qualityScore: number): WindmillCondition {
  if (qualityScore >= 80) return 'fully-operational'
  if (qualityScore >= 60) return 'operational'
  if (qualityScore >= 40) return 'needs-repair'
  if (qualityScore >= 25) return 'deteriorating'
  if (qualityScore >= 10) return 'idle'
  return 'ruined'
}

/**
 * Classify complex condition from health
 * @example
 * classifyComplexCondition(80) // 'thriving-mill'
 */
export function classifyComplexCondition(health: number): ComplexCondition {
  if (health >= 80) return 'thriving-mill'
  if (health >= 60) return 'working-mill'
  if (health >= 35) return 'struggling-mill'
  if (health >= 15) return 'abandoned-mill'
  return 'ruins'
}

/**
 * Classify millwright grade from average efficiency
 * @example
 * classifyMillwrightGrade(85) // 'master-millwright'
 */
export function classifyMillwrightGrade(avgEfficiency: number): MillwrightGrade {
  if (avgEfficiency >= 80) return 'master-millwright'
  if (avgEfficiency >= 65) return 'millwright'
  if (avgEfficiency >= 50) return 'mechanic'
  if (avgEfficiency >= 35) return 'handyman'
  if (avgEfficiency >= 15) return 'apprentice'
  return 'tourist'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure grinding quality (input/output processing)
 * @example
 * measureGrinding('export function calc(x: number): number { return x * 2 }') // GrindingInfo
 */
export function measureGrinding(content: string): GrindingInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { inputGrain: 0, outputFlour: 0, grindingRatio: 0, isConsistent: false, hasCoarseOutput: true, hasWastedGrain: true, stoneGap: 0 }
  }

  const inputGrain = Math.min(100, Math.round(
    countImports(content) * 8 +
    countFunctions(content) * 6 +
    countBranches(content) * 3,
  ))
  const outputFlour = Math.min(100, Math.round(
    countExports(content) * 10 +
    (/\breturn\b/.test(content) ? 20 : 0) +
    countTypeAnnotations(content) * 5 +
    (countErrorHandling(content) > 0 ? 10 : 0),
  ))

  const grindingRatio = inputGrain > 0 ? Math.round((outputFlour / inputGrain) * 100) / 100 : 0
  const isConsistent = outputFlour >= 30 && countErrorHandling(content) > 0
  const hasCoarseOutput = outputFlour < 25
  const hasWastedGrain = inputGrain > 40 && outputFlour < 20
  const stoneGap = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (maxNesting(content) <= 3 ? 25 : 10),
  ))

  return { inputGrain, outputFlour, grindingRatio, isConsistent, hasCoarseOutput, hasWastedGrain, stoneGap }
}

/**
 * Assess gears (transformation quality)
 * @example
 * assessGears('export function a(): number { return helper(input) }') // GearsInfo
 */
export function assessGears(content: string): GearsInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { ratio: 0, meshQuality: 0, hasSlipping: true, hasGrinding: false, hasBrokenTeeth: true, toothCount: 0, isWellOiled: false }
  }

  const toothCount = countFunctions(content) + countImports(content)
  const ratio = toothCount > 0 ? Math.min(100, Math.round((countExports(content) / toothCount) * 100)) : 0
  const meshQuality = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (toothCount > 0 && toothCount <= 8 ? 20 : 5) +
    (maxNesting(content) <= 3 ? 10 : 0),
  ))
  const hasSlipping = countImports(content) > 5 && countExports(content) === 0
  const hasGrinding = countFunctions(content) > 10 && countComments(content) < 3
  const hasBrokenTeeth = countErrorHandling(content) === 0 && loc > 30
  const isWellOiled = meshQuality >= 50 && !hasBrokenTeeth

  return { ratio, meshQuality, hasSlipping, hasGrinding, hasBrokenTeeth, toothCount, isWellOiled }
}

/**
 * Measure energy (input/output/loss/efficiency)
 * @example
 * measureEnergy('export function a() { return 1 }') // EnergyInfo
 */
export function measureEnergy(content: string): EnergyInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { input: 0, output: 0, loss: 0, efficiency: 0, isRenewable: false }
  }

  const input = Math.min(100, Math.round(
    countImports(content) * 8 +
    countLoc(content) * 0.3 +
    countBranches(content) * 4,
  ))
  const output = Math.min(100, Math.round(
    countExports(content) * 10 +
    (/\breturn\b/.test(content) ? 15 : 0) +
    countTypeAnnotations(content) * 5,
  ))
  const loss = Math.min(100, Math.max(0, Math.round(
    (countConsole(content) * 6) +
    (countTodos(content) * 8) +
    (maxNesting(content) > 4 ? 15 : 0) +
    (countErrorHandling(content) === 0 && loc > 30 ? 10 : 0),
  )))
  const efficiency = input > 0 ? Math.min(100, Math.round((output / input) * 100)) : 0
  const isRenewable = efficiency >= 50 && loss <= 30

  return { input, output, loss, efficiency, isRenewable }
}

/**
 * Assess wind (input rate and consistency)
 * @example
 * assessWind('import { a } from "b"\nimport { c } from "d"') // WindInfo
 */
export function assessWind(content: string): WindInfo {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)

  const direction = exports > imports ? 'outward' : imports > exports ? 'inward' : 'crosswind'
  const velocity = Math.min(100, Math.round(imports * 12 + countFunctions(content) * 5))
  const consistency = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (loc > 0 && loc <= 200 ? 25 : 10),
  ))
  const isSteady = consistency >= 60
  const isGusty = countBranches(content) > 8 || countImports(content) > 5
  const isCalm = loc === 0

  return { direction, velocity, consistency, isSteady, isGusty, isCalm }
}

/**
 * Assess tower (structural info)
 * @example
 * assessTower('export class X { private v: number }') // TowerInfo
 */
export function assessTower(content: string): TowerInfo {
  const loc = countLoc(content)
  const height = Math.min(100, Math.round(
    maxNesting(content) * 10 +
    countImports(content) * 5,
  ))
  const hasFoundation = countComments(content) > 0 || countTypeAnnotations(content) > 0
  const foundationDepth = Math.min(100, Math.round(
    countComments(content) * 5 +
    countTypeAnnotations(content) * 8 +
    (countErrorHandling(content) > 0 ? 20 : 0),
  ))
  const isStable = foundationDepth >= 30 && loc <= 400
  const hasCracks = countTodos(content) > 2 || (countErrorHandling(content) === 0 && loc > 50)
  const isPlumb = maxNesting(content) <= 4

  return { height, isPlumb, isStable, hasFoundation, hasCracks, foundationDepth }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a windmill sail
 * @example
 * analyzeWindmillSail('export function calc() { return 1 }', 'calc.ts') // WindmillSail
 */
export function analyzeWindmillSail(content: string, filePath: string): WindmillSail {
  const loc = countLoc(content)
  const funcs = countFunctions(content)
  const exports = countExports(content)
  const grinding = measureGrinding(content)
  const gears = assessGears(content)
  const energy = measureEnergy(content)
  const wind = assessWind(content)
  const tower = assessTower(content)

  const sailType = classifySailType(content)
  const millType = classifyMillType(content)

  const sails: SailsInfo = {
    count: funcs,
    condition: funcs === 0 ? 'missing' : funcs <= 1 ? 'worn' : exports > 0 ? 'new' : 'good',
    avgSailQuality: Math.min(100, Math.round(
      (funcs > 0 ? 20 : 0) +
      (countTypeAnnotations(content) > 0 ? 25 : 0) +
      (countErrorHandling(content) > 0 ? 25 : 0) +
      (countComments(content) > 0 ? 15 : 0) +
      (maxNesting(content) <= 3 ? 15 : 5),
    )),
    areBalanced: funcs > 0 && funcs <= 8,
    hasMissingSails: funcs === 0,
    hasTornSails: funcs > 0 && countErrorHandling(content) === 0 && loc > 30,
    isCatchingWind: loc > 0 && countImports(content) > 0,
  }

  const sailEfficiency = Math.min(100, Math.round(
    grinding.grindingRatio * 30 +
    gears.meshQuality * 0.25 +
    (sails.avgSailQuality * 0.2) +
    (energy.efficiency * 0.25),
  ))
  const windCapture = Math.min(100, Math.round(
    wind.velocity * 0.4 +
    wind.consistency * 0.3 +
    (grinding.inputGrain * 0.3),
  ))
  const grindingQuality = grinding.outputFlour
  const rotationSpeed = Math.min(100, Math.round(
    (loc > 0 ? 20 : 0) +
    (funcs * 8) +
    (exports * 6) +
    (maxNesting(content) <= 3 ? 15 : 5),
  ))
  const gearRatio = gears.ratio
  const structuralStability = Math.min(100, Math.round(
    (tower.hasFoundation ? 20 : 0) +
    (tower.isStable ? 20 : 0) +
    (tower.isPlumb ? 15 : 0) +
    (tower.foundationDepth * 0.25) +
    (gears.isWellOiled ? 20 : 0),
  ))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    sailEfficiency * 0.25 +
    grindingQuality * 0.2 +
    structuralStability * 0.2 +
    windCapture * 0.15 +
    (energy.isRenewable ? 10 : 0) +
    (sails.areBalanced ? 5 : 0) +
    (tower.hasCracks ? -5 : 0) +
    5,
  )))

  const condition = classifyWindmillCondition(qualityScore)

  return {
    file: filePath, sailEfficiency, windCapture, grindingQuality,
    rotationSpeed, gearRatio, structuralStability,
    sailType, millType, sails, grinding, gears, wind, tower, energy,
    condition, qualityScore,
  }
}

// ─── Complex Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a mill complex
 * @example
 * analyzeMillComplex(sails, 'src') // MillComplex
 */
export function analyzeMillComplex(sails: WindmillSail[], dirPath: string): MillComplex {
  if (sails.length === 0) {
    return {
      directory: dirPath, sails: [], avgEfficiency: 0, avgGrindingQuality: 0,
      avgStructuralStability: 0, dominantMillType: 'water-mill',
      operationalCount: 0, idleCount: 0, ruinedCount: 0,
      totalEnergyInput: 0, totalEnergyOutput: 0, overallEfficiency: 0,
      hasBottlenecks: false, bottleneckCount: 0, complexHealth: 0, condition: 'ruins',
    }
  }

  const n = sails.length
  const avgEfficiency = Math.round(sails.reduce((s, sa) => s + sa.sailEfficiency, 0) / n)
  const avgGrindingQuality = Math.round(sails.reduce((s, sa) => s + sa.grindingQuality, 0) / n)
  const avgStructuralStability = Math.round(sails.reduce((s, sa) => s + sa.structuralStability, 0) / n)

  const typeMap = new Map<string, number>()
  for (const sa of sails) {
    const count = typeMap.get(sa.millType) ?? 0
    typeMap.set(sa.millType, count + 1)
  }
  const sortedTypes = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1])
  const dominantMillType = sortedTypes[0]?.[0] ?? 'standard'

  const operationalCount = sails.filter(sa => sa.condition === 'fully-operational' || sa.condition === 'operational').length
  const idleCount = sails.filter(sa => sa.condition === 'idle' || sa.condition === 'deteriorating').length
  const ruinedCount = sails.filter(sa => sa.condition === 'ruined').length

  const totalEnergyInput = Math.round(sails.reduce((s, sa) => s + sa.energy.input, 0) / n)
  const totalEnergyOutput = Math.round(sails.reduce((s, sa) => s + sa.energy.output, 0) / n)
  const overallEfficiency = totalEnergyInput > 0 ? Math.round((totalEnergyOutput / totalEnergyInput) * 100) : 0

  const bottleneckCount = sails.filter(sa => sa.grinding.hasCoarseOutput || sa.gears.hasSlipping).length
  const hasBottlenecks = bottleneckCount > 0

  const complexHealth = Math.min(100, Math.max(0, Math.round(
    avgEfficiency * 0.3 +
    avgGrindingQuality * 0.2 +
    avgStructuralStability * 0.2 +
    (operationalCount / n) * 20 +
    (hasBottlenecks ? -10 : 10),
  )))

  const condition = classifyComplexCondition(complexHealth)

  return {
    directory: dirPath, sails, avgEfficiency, avgGrindingQuality,
    avgStructuralStability, dominantMillType,
    operationalCount, idleCount, ruinedCount,
    totalEnergyInput, totalEnergyOutput, overallEfficiency,
    hasBottlenecks, bottleneckCount, complexHealth, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate windmill sail recommendations
 * @example
 * generateRecommendations(sails, complexes, windFarm, stats) // string[]
 */
export function generateRecommendations(
  sails: WindmillSail[],
  _complexes: MillComplex[],
  _windFarm: WindFarm,
  stats: WindmillSailStats,
): string[] {
  void sails
  void _complexes
  void _windFarm
  const recs: string[] = []

  if (stats.tornSails > 0) {
    recs.push(`Torn sails: ${stats.tornSails} files have broken functions lacking error handling`)
  }
  if (stats.missingSails > 0) {
    recs.push(`Missing sails: ${stats.missingSails} files have no functional entry points`)
  }
  if (stats.hasCoarseOutput > 0) {
    recs.push(`Coarse output: ${stats.hasCoarseOutput} files produce low-quality results`)
  }
  if (stats.hasBrokenTeeth > 0) {
    recs.push(`Broken gear teeth: ${stats.hasBrokenTeeth} files lack error handling in transformations`)
  }
  if (stats.hasSlippingGears > 0) {
    recs.push(`Slipping gears: ${stats.hasSlippingGears} files import heavily but export nothing`)
  }
  if (stats.hasWastedGrain > 0) {
    recs.push(`Wasted grain: ${stats.hasWastedGrain} files consume input without producing output`)
  }
  if (stats.overallEfficiency >= 60) {
    recs.push('Good efficiency: the windmill is converting wind to useful energy')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete windmill sail result from files and contents
 * @example
 * buildWindmillSailResult(['a.ts'], ['export function a() {}'], {}) // WindmillSailResult
 */
export function buildWindmillSailResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): WindmillSailResult {
  void options

  const sails: WindmillSail[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeWindmillSail(content, file)
    } catch {
      return analyzeWindmillSail('', file)
    }
  })

  const dirMap = new Map<string, WindmillSail[]>()
  for (const sa of sails) {
    const dir = sa.file.includes('/') ? sa.file.slice(0, sa.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(sa) } else { dirMap.set(dir, [sa]) }
  }

  const complexes: MillComplex[] = Array.from(dirMap.entries()).map(([dir, ss]) =>
    analyzeMillComplex(ss, dir),
  )

  const n = sails.length || 1
  const totalEnergyInput = Math.round(sails.reduce((s, sa) => s + sa.energy.input, 0) / n)
  const totalEnergyOutput = Math.round(sails.reduce((s, sa) => s + sa.energy.output, 0) / n)
  const overallEfficiency = totalEnergyInput > 0 ? Math.min(100, Math.round((totalEnergyOutput / totalEnergyInput) * 100)) : 0
  const operationalMills = complexes.filter(c => c.condition === 'thriving-mill' || c.condition === 'working-mill').length
  const idleMills = complexes.filter(c => c.condition === 'struggling-mill' || c.condition === 'abandoned-mill').length
  const ruinedMills = complexes.filter(c => c.condition === 'ruins').length

  const windFarm: WindFarm = {
    totalEnergyInput, totalEnergyOutput, overallEfficiency,
    operationalMills, idleMills, ruinedMills,
    hasBottlenecks: complexes.some(c => c.hasBottlenecks),
  }

  const overallEff = Math.min(100, Math.max(0, Math.round(
    sails.reduce((s, sa) => s + sa.sailEfficiency, 0) / n +
    sails.reduce((s, sa) => s + sa.energy.efficiency, 0) / n * 0.3,
  ) / 1.3))

  const stats: WindmillSailStats = {
    totalFiles: files.length,
    totalComplexes: complexes.length,
    avgSailEfficiency: Math.round(sails.reduce((s, sa) => s + sa.sailEfficiency, 0) / n),
    avgWindCapture: Math.round(sails.reduce((s, sa) => s + sa.windCapture, 0) / n),
    avgGrindingQuality: Math.round(sails.reduce((s, sa) => s + sa.grindingQuality, 0) / n),
    avgRotationSpeed: Math.round(sails.reduce((s, sa) => s + sa.rotationSpeed, 0) / n),
    avgGearRatio: Math.round(sails.reduce((s, sa) => s + sa.gearRatio, 0) / n),
    avgStructuralStability: Math.round(sails.reduce((s, sa) => s + sa.structuralStability, 0) / n),
    avgEnergyEfficiency: overallEff,
    towerMills: sails.filter(sa => sa.millType === 'tower-mill').length,
    postMills: sails.filter(sa => sa.millType === 'post-mill').length,
    turbineMills: sails.filter(sa => sa.millType === 'turbine').length,
    operationalCount: sails.filter(sa => sa.condition === 'fully-operational' || sa.condition === 'operational').length,
    idleCount: sails.filter(sa => sa.condition === 'idle' || sa.condition === 'deteriorating').length,
    ruinedCount: sails.filter(sa => sa.condition === 'ruined').length,
    balancedSails: sails.filter(sa => sa.sails.areBalanced).length,
    tornSails: sails.filter(sa => sa.sails.hasTornSails).length,
    missingSails: sails.filter(sa => sa.sails.hasMissingSails).length,
    hasCoarseOutput: sails.filter(sa => sa.grinding.hasCoarseOutput).length,
    hasWastedGrain: sails.filter(sa => sa.grinding.hasWastedGrain).length,
    hasSlippingGears: sails.filter(sa => sa.gears.hasSlipping).length,
    hasBrokenTeeth: sails.filter(sa => sa.gears.hasBrokenTeeth).length,
    totalEnergyInput,
    totalEnergyOutput,
    overallEfficiency,
    millwrightGrade: classifyMillwrightGrade(overallEff),
    mostEfficient: sails.length > 0
      ? sails.reduce((b, sa) => sa.sailEfficiency > b.sailEfficiency ? sa : b, sails[0] as WindmillSail).file : 'none',
    leastEfficient: sails.length > 0
      ? sails.reduce((b, sa) => sa.sailEfficiency < b.sailEfficiency ? sa : b, sails[0] as WindmillSail).file : 'none',
    bestGrinding: sails.length > 0
      ? sails.reduce((b, sa) => sa.grindingQuality > b.grindingQuality ? sa : b, sails[0] as WindmillSail).file : 'none',
    mostStable: sails.length > 0
      ? sails.reduce((b, sa) => sa.structuralStability > b.structuralStability ? sa : b, sails[0] as WindmillSail).file : 'none',
  }

  const recommendations = generateRecommendations(sails, complexes, windFarm, stats)

  return { sails, complexes, windFarm, stats, recommendations }
}
