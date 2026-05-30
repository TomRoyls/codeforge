// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface StructuralInfo {
  isLoadBearing: boolean
  hasReinforcement: boolean
  hasButtresses: boolean
  hasCracks: boolean
  hasErosion: boolean
  hasCaveInRisk: boolean
  crackCount: number
  erosionPoints: number
}

export interface TideAnalysis {
  highTideRisk: number
  lowTideRisk: number
  isAboveTideLine: boolean
  isBelowTideLine: boolean
  waveImpactCount: number
}

export interface WindAnalysis {
  isSheltered: boolean
  isExposed: boolean
  windSpeed: number
  gustCount: number
  isWindResistant: boolean
}

export interface FoundationInfo {
  depth: number
  width: number
  material: 'bedrock' | 'concrete' | 'stone' | 'gravel' | 'sand' | 'quicksand'
  isSet: boolean
  isSettling: boolean
  isShifting: boolean
  hasDocumentation: boolean
  hasTests: boolean
  hasTypes: boolean
}

export interface SandTower {
  file: string
  sandQuality: number
  moistureContent: number
  structuralIntegrity: number
  tideResistance: number
  windResistance: number
  foundationDepth: number
  towerHeight: number
  towerWidth: number
  wallThickness: number
  sandGrain: 'fine' | 'medium' | 'coarse' | 'mixed' | 'muddy'
  moisture: 'bone-dry' | 'dry' | 'perfect' | 'damp' | 'wet' | 'saturated'
  towerType: 'keep' | 'tower' | 'wall' | 'bridge' | 'moat' | 'decoration' | 'rampart' | 'gatehouse'
  architecture: 'roman' | 'gothic' | 'moat-and-bailey' | 'concentric' | 'modern' | 'fortress' | 'shanty'
  structural: StructuralInfo
  tideAnalysis: TideAnalysis
  windAnalysis: WindAnalysis
  foundation: FoundationInfo
  collapseRisk: 'none' | 'minimal' | 'low' | 'moderate' | 'high' | 'imminent' | 'collapsed'
  condition: 'majestic' | 'impressive' | 'solid' | 'fair' | 'crumbling' | 'ruins' | 'washed-away'
  qualityScore: number
  vulnerabilities: string[]
  strengths: string[]
}

export interface SandFortress {
  directory: string
  towers: SandTower[]
  avgIntegrity: number
  avgTideResistance: number
  avgWindResistance: number
  avgFoundationDepth: number
  dominantArchitecture: string
  dominantTowerType: string
  majesticCount: number
  crumblingCount: number
  collapsedCount: number
  totalVulnerabilities: number
  totalStrengths: number
  isDefensible: boolean
  defenseLevel: 'fortress' | 'castle' | 'keep' | 'wall' | 'fence' | 'none'
  fortressHealth: number
  condition: 'grand' | 'sturdy' | 'standing' | 'weathering' | 'crumbling' | 'ruins'
}

export interface ShorelineInfo {
  tideLevel: number
  windSpeed: number
  stormWarning: boolean
  avgTideResistance: number
  avgWindResistance: number
  isSafeFromTide: boolean
  isStormResistant: boolean
}

export interface SandcastleStats {
  totalFiles: number
  totalFortresses: number
  avgSandQuality: number
  avgMoistureContent: number
  avgStructuralIntegrity: number
  avgTideResistance: number
  avgWindResistance: number
  avgFoundationDepth: number
  majesticTowers: number
  crumblingTowers: number
  collapsedTowers: number
  fineGrainFiles: number
  coarseGrainFiles: number
  bedrockFoundations: number
  quicksandFoundations: number
  loadBearingFiles: number
  totalVulnerabilities: number
  totalStrengths: number
  overallStructuralHealth: number
  architectGrade: 'master-builder' | 'architect' | 'mason' | 'apprentice' | 'child' | 'toddler'
  strongestTower: string
  weakestTower: string
  deepestFoundation: string
  highestTower: string
  mostDefensible: string
  leastDefensible: string
}

export interface SandcastleResult {
  towers: SandTower[]
  fortresses: SandFortress[]
  shoreline: ShorelineInfo
  stats: SandcastleStats
  recommendations: string[]
}

// ─── Content Analysis Primitives ─────────────────────────────────────────────

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
 * Count nesting depth
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

// ─── Core Measurements ───────────────────────────────────────────────────────

/**
 * Measure sand quality (code consistency)
 * @example
 * measureSandQuality('const a = 1\nconst b = 2') // number
 */
export function measureSandQuality(content: string): number {
  const lines = content.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return 0

  const semiLines = lines.filter(l => l.trim().endsWith(';')).length
  const semiRatio = lines.length > 1 ? Math.min(semiLines / lines.length, 1 - semiLines / lines.length) * 2 : 0.5
  const consistencyScore = Math.round(semiRatio * 100)

  const indentStyles = new Set<string>()
  for (const line of lines) {
    const match = line.match(/^(\s*)/)
    if (match && match[1] !== undefined && match[1].length > 0) {
      indentStyles.add(match[1][0] === '\t' ? 'tab' : 'space')
    }
  }
  const indentConsistency = indentStyles.size <= 1 ? 30 : 10

  const hasUniformExport = (() => {
    const esm = (content.match(/^import\s+/gm) ?? []).length
    const cjs = (content.match(/require\s*\(/g) ?? []).length
    if (esm > 0 && cjs > 0) return 0
    return 20
  })()

  return Math.min(100, consistencyScore * 0.5 + indentConsistency + hasUniformExport)
}

/**
 * Measure moisture content (code cohesion)
 * @example
 * measureMoistureContent('export function calc(x) { return x * 2 }') // number
 */
export function measureMoistureContent(content: string): number {
  const exports = countExports(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)

  if (loc === 0) return 0

  const exportFocus = exports === 1 ? 35 : exports <= 3 ? 25 : exports <= 5 ? 15 : 5
  const funcRatio = functions > 0 ? Math.min(30, functions * 5) : 10
  const sizeScore = loc <= 50 ? 20 : loc <= 100 ? 15 : loc <= 200 ? 10 : 5
  const hasReturn = /\breturn\b/.test(content) ? 15 : 5

  return Math.min(100, exportFocus + funcRatio + sizeScore + hasReturn)
}

/**
 * Measure structural integrity (architecture strength)
 * @example
 * measureStructuralIntegrity('export function calc() { return 1 }') // number
 */
export function measureStructuralIntegrity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasImports = countImports(content) > 0 ? 10 : 0
  const hasExports = countExports(content) > 0 ? 10 : 0
  const hasErrorHandling = countErrorHandling(content) > 0 ? 15 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 15 : 0
  const lowNesting = maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0
  const lowBranches = countBranches(content) <= 5 ? 15 : countBranches(content) <= 10 ? 8 : 0
  const sizeOk = loc <= 100 ? 20 : loc <= 200 ? 12 : loc <= 400 ? 5 : 0

  return Math.min(100, hasImports + hasExports + hasErrorHandling + hasTypes + lowNesting + lowBranches + sizeOk)
}

/**
 * Measure tide resistance (change resilience)
 * @example
 * measureTideResistance('export function calc(x: number): number { return x }') // number
 */
export function measureTideResistance(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasErrorHandling = countErrorHandling(content) > 0 ? 20 : 0
  const lowExports = countExports(content) <= 3 ? 20 : countExports(content) <= 6 ? 10 : 0
  const hasDefaultParams = /\(\s*\w+\s*=\s*/.test(content) ? 10 : 0
  const hasNullCheck = /===?\s*null|!==?\s*null/.test(content) ? 10 : 0
  const hasOptionalChain = /\?\.\w/.test(content) ? 10 : 0
  const sizeOk = loc <= 100 ? 10 : 0

  return Math.min(100, hasTypes + hasErrorHandling + lowExports + hasDefaultParams + hasNullCheck + hasOptionalChain + sizeOk)
}

/**
 * Measure wind resistance (dependency resilience)
 * @example
 * measureWindResistance('const x = 1') // number
 */
export function measureWindResistance(content: string): number {
  const imports = countImports(content)
  const loc = countLoc(content)
  if (loc === 0) return 0

  const fewImports = imports <= 3 ? 30 : imports <= 6 ? 20 : imports <= 10 ? 10 : 0
  const selfContained = Math.max(0, 40 - imports * 5)
  const hasOwnTypes = countTypeAnnotations(content) > imports ? 15 : 5
  const noConsole = countConsole(content) === 0 ? 15 : 5

  return Math.min(100, fewImports + selfContained + hasOwnTypes + noConsole)
}

/**
 * Measure foundation depth (test/doc coverage indicators)
 * @example
 * measureFoundationDepth('function calc() { return 1 }\n// docs') // number
 */
export function measureFoundationDepth(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasDocs = countComments(content) > 0 ? 20 : 0
  const hasJsdoc = /\/\*\*/.test(content) ? 15 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasErrorHandling = countErrorHandling(content) > 0 ? 15 : 0
  const hasExport = countExports(content) > 0 ? 15 : 0
  const hasTestPatterns = /\bdescribe\b|\bit\b|\bexpect\b/.test(content) ? 15 : 0

  return Math.min(100, hasDocs + hasJsdoc + hasTypes + hasErrorHandling + hasExport + hasTestPatterns)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify sand grain from consistency
 * @example
 * classifySandGrain(90) // 'fine'
 */
export function classifySandGrain(sandQuality: number): SandTower['sandGrain'] {
  if (sandQuality >= 80) return 'fine'
  if (sandQuality >= 60) return 'medium'
  if (sandQuality >= 40) return 'coarse'
  if (sandQuality >= 20) return 'mixed'
  return 'muddy'
}

/**
 * Classify moisture from cohesion
 * @example
 * classifyMoisture(50) // 'perfect'
 */
export function classifyMoisture(moistureContent: number): SandTower['moisture'] {
  if (moistureContent >= 90) return 'saturated'
  if (moistureContent >= 70) return 'wet'
  if (moistureContent >= 45 && moistureContent <= 69) return 'perfect'
  if (moistureContent >= 30) return 'damp'
  if (moistureContent >= 15) return 'dry'
  return 'bone-dry'
}

/**
 * Classify tower type from content characteristics
 * @example
 * classifyTowerType(1, 5, 3) // 'tower'
 */
export function classifyTowerType(exports: number, imports: number, functions: number): SandTower['towerType'] {
  if (exports === 1 && functions <= 2) return 'keep'
  if (exports > 3 && imports > 3) return 'bridge'
  if (imports > 5 && exports === 0) return 'moat'
  if (exports === 0 && imports === 0) return 'decoration'
  if (exports > 3 && functions > 5) return 'rampart'
  if (imports > 3 && exports <= 1) return 'gatehouse'
  if (exports > 1 && functions > 2) return 'wall'
  return 'tower'
}

/**
 * Classify architecture from structural metrics
 * @example
 * classifyArchitecture(80, 80, 80) // 'roman'
 */
export function classifyArchitecture(integrity: number, tide: number, wind: number): SandTower['architecture'] {
  const avg = (integrity + tide + wind) / 3
  if (avg >= 75) return 'roman'
  if (avg >= 60) return 'gothic'
  if (avg >= 50) return 'concentric'
  if (avg >= 40) return 'modern'
  if (avg >= 30) return 'fortress'
  if (avg >= 20) return 'moat-and-bailey'
  return 'shanty'
}

/**
 * Classify foundation material
 * @example
 * classifyFoundationMaterial(85) // 'bedrock'
 */
export function classifyFoundationMaterial(depth: number): FoundationInfo['material'] {
  if (depth >= 80) return 'bedrock'
  if (depth >= 60) return 'concrete'
  if (depth >= 40) return 'stone'
  if (depth >= 25) return 'gravel'
  if (depth >= 10) return 'sand'
  return 'quicksand'
}

/**
 * Classify architect grade from average health
 * @example
 * classifyArchitectGrade(85) // 'master-builder'
 */
export function classifyArchitectGrade(avgHealth: number): SandcastleStats['architectGrade'] {
  if (avgHealth >= 75) return 'master-builder'
  if (avgHealth >= 60) return 'architect'
  if (avgHealth >= 40) return 'mason'
  if (avgHealth >= 25) return 'apprentice'
  if (avgHealth >= 10) return 'child'
  return 'toddler'
}

/**
 * Classify defense level from fortress health
 * @example
 * classifyDefenseLevel(85) // 'fortress'
 */
export function classifyDefenseLevel(health: number): SandFortress['defenseLevel'] {
  if (health >= 80) return 'fortress'
  if (health >= 60) return 'castle'
  if (health >= 40) return 'keep'
  if (health >= 25) return 'wall'
  if (health >= 10) return 'fence'
  return 'none'
}

/**
 * Classify collapse risk from quality score
 * @example
 * classifyCollapseRisk(90) // 'none'
 */
export function classifyCollapseRisk(qualityScore: number): SandTower['collapseRisk'] {
  if (qualityScore >= 80) return 'none'
  if (qualityScore >= 65) return 'minimal'
  if (qualityScore >= 50) return 'low'
  if (qualityScore >= 35) return 'moderate'
  if (qualityScore >= 20) return 'high'
  if (qualityScore >= 10) return 'imminent'
  return 'collapsed'
}

/**
 * Classify condition from quality score
 * @example
 * classifyCondition(90) // 'majestic'
 */
export function classifyCondition(qualityScore: number): SandTower['condition'] {
  if (qualityScore >= 85) return 'majestic'
  if (qualityScore >= 70) return 'impressive'
  if (qualityScore >= 55) return 'solid'
  if (qualityScore >= 40) return 'fair'
  if (qualityScore >= 25) return 'crumbling'
  if (qualityScore >= 10) return 'ruins'
  return 'washed-away'
}

/**
 * Classify fortress condition from health
 * @example
 * classifyFortressCondition(85) // 'grand'
 */
export function classifyFortressCondition(health: number): SandFortress['condition'] {
  if (health >= 80) return 'grand'
  if (health >= 60) return 'sturdy'
  if (health >= 40) return 'standing'
  if (health >= 25) return 'weathering'
  if (health >= 10) return 'crumbling'
  return 'ruins'
}

// ─── Structural Analysis ─────────────────────────────────────────────────────

/**
 * Analyze structural properties
 * @example
 * analyzeStructural(content) // StructuralInfo
 */
export function analyzeStructural(content: string): StructuralInfo {
  const nesting = maxNesting(content)
  const branches = countBranches(content)
  const errorHandling = countErrorHandling(content)
  const exports = countExports(content)
  const todos = countTodos(content)

  const crackCount = todos + countConsole(content)
  const erosionPoints = Math.max(0, nesting - 3) + Math.max(0, branches - 5)

  return {
    isLoadBearing: exports > 0,
    hasReinforcement: errorHandling > 0,
    hasButtresses: countImports(content) > 0 && countExports(content) > 0,
    hasCracks: crackCount > 0,
    hasErosion: erosionPoints > 0,
    hasCaveInRisk: nesting >= 5 && errorHandling === 0,
    crackCount,
    erosionPoints,
  }
}

// ─── Tide Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze tide exposure (change vulnerability)
 * @example
 * analyzeTideExposure(content) // TideAnalysis
 */
export function analyzeTideExposure(content: string): TideAnalysis {
  const exports = countExports(content)
  const imports = countImports(content)
  const branches = countBranches(content)
  const types = countTypeAnnotations(content)

  const highTideRisk = Math.min(100, Math.round(
    (exports > 5 ? 30 : 0) +
    (imports > 5 ? 20 : 0) +
    (branches > 10 ? 20 : 0) +
    (types === 0 ? 20 : 0) +
    (countErrorHandling(content) === 0 ? 10 : 0),
  ))

  const lowTideRisk = Math.min(100, Math.round(
    (exports > 2 ? 15 : 0) +
    (branches > 3 ? 15 : 0) +
    (types === 0 ? 15 : 0) +
    10,
  ))

  const waveImpactCount = exports + imports + branches
  const isAboveTideLine = highTideRisk <= 30
  const isBelowTideLine = highTideRisk >= 60

  return { highTideRisk, lowTideRisk, isAboveTideLine, isBelowTideLine, waveImpactCount }
}

// ─── Wind Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze wind exposure (dependency vulnerability)
 * @example
 * analyzeWindExposure(content) // WindAnalysis
 */
export function analyzeWindExposure(content: string): WindAnalysis {
  const imports = countImports(content)
  const gustCount = imports
  const windSpeed = Math.min(100, imports * 15)

  return {
    isSheltered: imports <= 2,
    isExposed: imports >= 5,
    windSpeed,
    gustCount,
    isWindResistant: imports <= 3 && countErrorHandling(content) > 0,
  }
}

// ─── Foundation Analysis ─────────────────────────────────────────────────────

/**
 * Analyze foundation quality
 * @example
 * analyzeFoundation(content) // FoundationInfo
 */
export function analyzeFoundation(content: string): FoundationInfo {
  const depth = measureFoundationDepth(content)
  const width = Math.min(100, Math.round(
    (countExports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countFunctions(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 20 : 0),
  ))

  const hasDocumentation = countComments(content) > 0
  const hasTests = /\bdescribe\b|\bit\b|\bexpect\b/.test(content)
  const hasTypes = countTypeAnnotations(content) > 0

  const material = classifyFoundationMaterial(depth)

  return {
    depth, width, material,
    isSet: depth >= 50,
    isSettling: depth >= 20 && depth < 50,
    isShifting: depth < 20,
    hasDocumentation, hasTests, hasTypes,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a sand tower
 * @example
 * analyzeSandTower('export function calc() { return 1 }', 'calc.ts') // SandTower
 */
export function analyzeSandTower(content: string, filePath: string): SandTower {
  const sandQuality = measureSandQuality(content)
  const moistureContent = measureMoistureContent(content)
  const structuralIntegrity = measureStructuralIntegrity(content)
  const tideResistance = measureTideResistance(content)
  const windResistance = measureWindResistance(content)
  const foundationDepth = measureFoundationDepth(content)

  const loc = countLoc(content)
  const towerHeight = Math.min(100, Math.round(maxNesting(content) * 20))
  const towerWidth = Math.min(100, Math.round((countExports(content) + countFunctions(content)) * 10))
  const wallThickness = Math.min(100, Math.round(loc / 2))

  const sandGrain = classifySandGrain(sandQuality)
  const moisture = classifyMoisture(moistureContent)
  const towerType = classifyTowerType(countExports(content), countImports(content), countFunctions(content))
  const architecture = classifyArchitecture(structuralIntegrity, tideResistance, windResistance)

  const structural = analyzeStructural(content)
  const tideAnalysis = analyzeTideExposure(content)
  const windAnalysis = analyzeWindExposure(content)
  const foundation = analyzeFoundation(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    sandQuality * 0.15 +
    moistureContent * 0.15 +
    structuralIntegrity * 0.25 +
    tideResistance * 0.2 +
    windResistance * 0.15 +
    foundationDepth * 0.1,
  )))

  const collapseRisk = classifyCollapseRisk(qualityScore)
  const condition = classifyCondition(qualityScore)

  const vulnerabilities: string[] = []
  if (structural.hasCracks) vulnerabilities.push(`Cracks: ${structural.crackCount} issues found`)
  if (structural.hasErosion) vulnerabilities.push(`Erosion: ${structural.erosionPoints} wear points`)
  if (structural.hasCaveInRisk) vulnerabilities.push('Cave-in risk: deep nesting without error handling')
  if (tideAnalysis.isBelowTideLine) vulnerabilities.push('Below tide line: vulnerable to changes')
  if (windAnalysis.isExposed) vulnerabilities.push('Wind-exposed: many external dependencies')
  if (foundation.isShifting) vulnerabilities.push('Shifting foundation: shallow test/doc coverage')
  if (sandGrain === 'muddy' || sandGrain === 'mixed') vulnerabilities.push('Poor sand: inconsistent patterns')

  const strengths: string[] = []
  if (structural.isLoadBearing) strengths.push('Load-bearing: provides exports')
  if (structural.hasReinforcement) strengths.push('Reinforced: has error handling')
  if (tideAnalysis.isAboveTideLine) strengths.push('Above tide: resilient to changes')
  if (windAnalysis.isSheltered) strengths.push('Sheltered: minimal dependencies')
  if (foundation.material === 'bedrock' || foundation.material === 'concrete') strengths.push(`Foundation: ${foundation.material}`)
  if (moisture === 'perfect') strengths.push('Perfect moisture: ideal cohesion')

  return {
    file: filePath, sandQuality, moistureContent, structuralIntegrity,
    tideResistance, windResistance, foundationDepth, towerHeight, towerWidth,
    wallThickness, sandGrain, moisture, towerType, architecture, structural,
    tideAnalysis, windAnalysis, foundation, collapseRisk, condition,
    qualityScore, vulnerabilities, strengths,
  }
}

// ─── Fortress Analysis ───────────────────────────────────────────────────────

/**
 * Analyze a directory as a sand fortress
 * @example
 * analyzeSandFortress(towers, 'src') // SandFortress
 */
export function analyzeSandFortress(towers: SandTower[], dirPath: string): SandFortress {
  if (towers.length === 0) {
    return {
      directory: dirPath, towers: [], avgIntegrity: 0, avgTideResistance: 0,
      avgWindResistance: 0, avgFoundationDepth: 0, dominantArchitecture: 'shanty',
      dominantTowerType: 'decoration', majesticCount: 0, crumblingCount: 0,
      collapsedCount: 0, totalVulnerabilities: 0, totalStrengths: 0,
      isDefensible: false, defenseLevel: 'none', fortressHealth: 0,
      condition: 'ruins',
    }
  }

  const n = towers.length
  const avgIntegrity = Math.round(towers.reduce((s, t) => s + t.structuralIntegrity, 0) / n)
  const avgTideResistance = Math.round(towers.reduce((s, t) => s + t.tideResistance, 0) / n)
  const avgWindResistance = Math.round(towers.reduce((s, t) => s + t.windResistance, 0) / n)
  const avgFoundationDepth = Math.round(towers.reduce((s, t) => s + t.foundationDepth, 0) / n)

  const archCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}
  for (const t of towers) {
    archCounts[t.architecture] = (archCounts[t.architecture] ?? 0) + 1
    typeCounts[t.towerType] = (typeCounts[t.towerType] ?? 0) + 1
  }
  const dominantArchitecture = Array.from(Object.entries(archCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'shanty'
  const dominantTowerType = Array.from(Object.entries(typeCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'decoration'

  const majesticCount = towers.filter(t => t.condition === 'majestic' || t.condition === 'impressive').length
  const crumblingCount = towers.filter(t => t.condition === 'crumbling' || t.condition === 'ruins').length
  const collapsedCount = towers.filter(t => t.condition === 'washed-away').length
  const totalVulnerabilities = towers.reduce((s, t) => s + t.vulnerabilities.length, 0)
  const totalStrengths = towers.reduce((s, t) => s + t.strengths.length, 0)

  const fortressHealth = Math.round(
    avgIntegrity * 0.3 + avgTideResistance * 0.25 + avgWindResistance * 0.2 +
    avgFoundationDepth * 0.15 + (majesticCount / n * 100) * 0.1,
  )

  const isDefensible = fortressHealth >= 50 && collapsedCount === 0
  const defenseLevel = classifyDefenseLevel(fortressHealth)
  const condition = classifyFortressCondition(fortressHealth)

  return {
    directory: dirPath, towers, avgIntegrity, avgTideResistance, avgWindResistance,
    avgFoundationDepth, dominantArchitecture, dominantTowerType, majesticCount,
    crumblingCount, collapsedCount, totalVulnerabilities, totalStrengths,
    isDefensible, defenseLevel, fortressHealth, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate sandcastle recommendations
 * @example
 * generateRecommendations(towers, fortresses, shoreline, stats) // string[]
 */
export function generateRecommendations(
  _towers: SandTower[],
  fortresses: SandFortress[],
  _shoreline: ShorelineInfo,
  stats: SandcastleStats,
): string[] {
  void _shoreline
  void _towers
  const recs: string[] = []

  if (stats.totalVulnerabilities > 15) {
    recs.push(`High vulnerability count: ${stats.totalVulnerabilities} — reinforce structures`)
  }

  if (stats.quicksandFoundations > 0) {
    recs.push(`Quicksand foundations: ${stats.quicksandFoundations} files lack tests/docs`)
  }

  if (stats.coarseGrainFiles > stats.totalFiles * 0.3) {
    recs.push(`Coarse sand: ${stats.coarseGrainFiles} files with inconsistent patterns — standardize`)
  }

  if (stats.collapsedTowers > 0) {
    recs.push(`Collapsed towers: ${stats.collapsedTowers} files need rebuilding`)
  }

  if (stats.crumblingTowers > 0) {
    recs.push(`Crumbling towers: ${stats.crumblingTowers} files need repair`)
  }

  if (stats.overallStructuralHealth >= 65) {
    recs.push('Good structural health: codebase holds together well')
  }

  const weakFortresses = fortresses.filter(f => !f.isDefensible)
  if (weakFortresses.length > 0) {
    recs.push(`Weak fortresses: ${weakFortresses.length} directories lack defense`)
  }

  if (stats.strongestTower !== 'none') {
    recs.push(`Strongest tower: ${stats.strongestTower} — model for construction`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete sandcastle result from files and contents
 * @example
 * buildSandcastleResult(['a.ts'], ['export function a() {}'], {}) // SandcastleResult
 */
export function buildSandcastleResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): SandcastleResult {
  void options

  const towers: SandTower[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSandTower(content, file)
    } catch {
      return analyzeSandTower('', file)
    }
  })

  const dirMap = new Map<string, SandTower[]>()
  for (const t of towers) {
    const dir = t.file.includes('/') ? t.file.slice(0, t.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(t) } else { dirMap.set(dir, [t]) }
  }

  const fortresses: SandFortress[] = Array.from(dirMap.entries()).map(([dir, ts]) =>
    analyzeSandFortress(ts, dir),
  )

  const n = towers.length || 1
  const avgTideResistance = Math.round(towers.reduce((s, t) => s + t.tideResistance, 0) / n)
  const avgWindResistance = Math.round(towers.reduce((s, t) => s + t.windResistance, 0) / n)
  const avgSandQuality = Math.round(towers.reduce((s, t) => s + t.sandQuality, 0) / n)
  const avgMoistureContent = Math.round(towers.reduce((s, t) => s + t.moistureContent, 0) / n)
  const avgStructuralIntegrity = Math.round(towers.reduce((s, t) => s + t.structuralIntegrity, 0) / n)
  const avgFoundationDepth = Math.round(towers.reduce((s, t) => s + t.foundationDepth, 0) / n)

  const tideLevel = Math.round(100 - avgTideResistance)
  const windSpeed = Math.round(towers.reduce((s, t) => s + t.windAnalysis.windSpeed, 0) / n)

  const shoreline: ShorelineInfo = {
    tideLevel,
    windSpeed,
    stormWarning: tideLevel >= 60 || windSpeed >= 60,
    avgTideResistance,
    avgWindResistance,
    isSafeFromTide: tideLevel <= 30,
    isStormResistant: avgTideResistance >= 50 && avgWindResistance >= 50,
  }

  const overallStructuralHealth = Math.round(
    avgStructuralIntegrity * 0.3 + avgTideResistance * 0.25 +
    avgWindResistance * 0.2 + avgFoundationDepth * 0.15 + avgSandQuality * 0.1,
  )

  const stats: SandcastleStats = {
    totalFiles: files.length,
    totalFortresses: fortresses.length,
    avgSandQuality,
    avgMoistureContent,
    avgStructuralIntegrity,
    avgTideResistance,
    avgWindResistance,
    avgFoundationDepth,
    majesticTowers: towers.filter(t => t.condition === 'majestic').length,
    crumblingTowers: towers.filter(t => t.condition === 'crumbling' || t.condition === 'ruins').length,
    collapsedTowers: towers.filter(t => t.condition === 'washed-away').length,
    fineGrainFiles: towers.filter(t => t.sandGrain === 'fine').length,
    coarseGrainFiles: towers.filter(t => t.sandGrain === 'coarse' || t.sandGrain === 'muddy').length,
    bedrockFoundations: towers.filter(t => t.foundation.material === 'bedrock').length,
    quicksandFoundations: towers.filter(t => t.foundation.material === 'quicksand').length,
    loadBearingFiles: towers.filter(t => t.structural.isLoadBearing).length,
    totalVulnerabilities: towers.reduce((s, t) => s + t.vulnerabilities.length, 0),
    totalStrengths: towers.reduce((s, t) => s + t.strengths.length, 0),
    overallStructuralHealth,
    architectGrade: classifyArchitectGrade(overallStructuralHealth),
    strongestTower: (() => {
      const first = towers[0]
      if (first === undefined) return 'none'
      return towers.reduce((s, t) => t.qualityScore > s.qualityScore ? t : s, first).file
    })(),
    weakestTower: (() => {
      const first = towers[0]
      if (first === undefined) return 'none'
      return towers.reduce((w, t) => t.qualityScore < w.qualityScore ? t : w, first).file
    })(),
    deepestFoundation: (() => {
      const first = towers[0]
      if (first === undefined) return 'none'
      return towers.reduce((d, t) => t.foundationDepth > d.foundationDepth ? t : d, first).file
    })(),
    highestTower: (() => {
      const first = towers[0]
      if (first === undefined) return 'none'
      return towers.reduce((h, t) => t.towerHeight > h.towerHeight ? t : h, first).file
    })(),
    mostDefensible: (() => {
      const first = fortresses[0]
      if (first === undefined) return 'none'
      return fortresses.reduce((m, f) => f.fortressHealth > m.fortressHealth ? f : m, first).directory
    })(),
    leastDefensible: (() => {
      const first = fortresses[0]
      if (first === undefined) return 'none'
      return fortresses.reduce((l, f) => f.fortressHealth < l.fortressHealth ? f : l, first).directory
    })(),
  }

  const recommendations = generateRecommendations(towers, fortresses, shoreline, stats)

  return { towers, fortresses, shoreline, stats, recommendations }
}
