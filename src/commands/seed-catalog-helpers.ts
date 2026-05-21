// ─── Interfaces ──────────────────────────────────────────────────────────────

export type SeedType = 'grain' | 'vegetable' | 'flower' | 'tree' | 'vine' | 'root' | 'herb' | 'weed'
export type SeedCondition = 'prize-winning' | 'premium' | 'standard' | 'substandard' | 'sterile' | 'invasive'
export type BedType = 'greenhouse' | 'garden' | 'field' | 'wild' | 'compost' | 'desert'
export type BedCondition = 'nursery' | 'productive' | 'functional' | 'overgrown' | 'barren' | 'toxic'
export type GardenerGrade = 'master-gardener' | 'gardener' | 'horticulturist' | 'apprentice' | 'amateur' | 'weed-puller'
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'evergreen' | 'dormant'
export type TestEnvironment = 'unit' | 'integration' | 'e2e' | 'manual' | 'none'

export interface SeedInfo {
  type: SeedType
  size: number
  hasHull: boolean
  hasCore: boolean
  isShelled: boolean
  isViable: boolean
  hullThickness: number
}

export interface RootInfo {
  depth: number
  spread: number
  isTapRoot: boolean
  isFibrous: boolean
  isInvasive: boolean
  isContained: boolean
  dependencyCount: number
  externalDependencyCount: number
}

export interface AdaptabilityInfo {
  zone: number
  isFrostResistant: boolean
  isDroughtResistant: boolean
  isDiseaseResistant: boolean
  isPestResistant: boolean
  isUniversal: boolean
  adaptabilityScore: number
}

export interface GerminationInfo {
  hasTests: boolean
  testCoverage: number
  testQuality: number
  isEasyToTest: boolean
  testEnvironment: TestEnvironment
  germinationTime: number
}

export interface YieldInfo {
  reuseScore: number
  abstractionLevel: number
  isGeneric: boolean
  isSpecific: boolean
  isOverAbstracted: boolean
  hasValue: boolean
  consumers: number
}

export interface CrossbreedInfo {
  isCompatible: boolean
  hasBarriers: boolean
  barrierCount: number
  barriers: string[]
  isHybrid: boolean
  isHeritage: boolean
  isGMO: boolean
  compatibilityScore: number
}

export interface CatalogInfo {
  category: string
  tags: string[]
  season: Season
  isHeirloom: boolean
  isNewVariety: boolean
  isExperimental: boolean
  maturityDays: number
}

export interface SeedVariety {
  file: string
  seedViability: number
  germinationRate: number
  rootIndependence: number
  hardiness: number
  yieldPotential: number
  crossbreedCompat: number
  seed: SeedInfo
  root: RootInfo
  adaptability: AdaptabilityInfo
  germination: GerminationInfo
  yield: YieldInfo
  crossbreed: CrossbreedInfo
  catalog: CatalogInfo
  condition: SeedCondition
  qualityScore: number
}

export interface SeedBed {
  directory: string
  varieties: SeedVariety[]
  avgViability: number
  avgIndependence: number
  avgYieldPotential: number
  prizeCount: number
  sterileCount: number
  invasiveCount: number
  selfContainedCount: number
  bedType: BedType
  condition: BedCondition
}

export interface GardenOverview {
  avgViability: number
  avgIndependence: number
  avgYieldPotential: number
  totalPrizeWinners: number
  isProductive: boolean
  overallYield: number
}

export interface SeedCatalogStats {
  totalFiles: number
  totalBeds: number
  avgSeedViability: number
  avgGerminationRate: number
  avgRootIndependence: number
  avgHardiness: number
  avgYieldPotential: number
  avgCrossbreedCompat: number
  prizeWinningCount: number
  premiumCount: number
  standardCount: number
  substandardCount: number
  sterileCount: number
  invasiveCount: number
  selfContainedCount: number
  universalCount: number
  hasTestsCount: number
  easyToTestCount: number
  grainCount: number
  vegetableCount: number
  treeCount: number
  vineCount: number
  weedCount: number
  evergreenCount: number
  dormantCount: number
  heirloomCount: number
  experimentalCount: number
  overallYield: number
  gardenerGrade: GardenerGrade
  bestVariety: string
  mostIndependent: string
  highestYield: string
  mostCompatible: string
  mostInvasive: string
}

export interface SeedCatalogResult {
  varieties: SeedVariety[]
  beds: SeedBed[]
  garden: GardenOverview
  stats: SeedCatalogStats
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

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names (camelCase longer than 3 chars)
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

/**
 * Count short names (1-2 chars)
 * @example
 * countShortNames('const x = 1') // 1
 */
export function countShortNames(content: string): number {
  return (content.match(/\b(?:const|let|var)\s+[a-z]{1,2}\b/g) ?? []).length
}

/**
 * Count re-exports
 * @example
 * countReExports('export { x } from "y"') // 1
 */
export function countReExports(content: string): number {
  return (content.match(/export\s+\{[^}]*\}\s+from/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify seed condition from quality score
 * @example
 * classifySeedCondition(90) // 'prize-winning'
 */
export function classifySeedCondition(qualityScore: number): SeedCondition {
  if (qualityScore >= 85) return 'prize-winning'
  if (qualityScore >= 65) return 'premium'
  if (qualityScore >= 45) return 'standard'
  if (qualityScore >= 25) return 'substandard'
  if (qualityScore >= 8) return 'sterile'
  return 'invasive'
}

/**
 * Classify seed type from content
 * @example
 * classifySeedType('') // 'weed'
 */
export function classifySeedType(content: string): SeedType {
  const loc = countLoc(content)
  if (loc === 0) return 'weed'

  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const todos = countTodos(content)
  const reExports = countReExports(content)
  const nesting = maxNesting(content)

  if (reExports > 0 && functions === 0 && classes === 0) return 'vine'
  if (interfaces > 0 && functions === 0 && classes === 0) return 'root'
  if (todos > loc * 0.3 && exports === 0) return 'weed'
  if (classes > 0 && nesting >= 4) return 'tree'
  if (classes > 0) return 'vegetable'
  if (functions >= 3 && exports >= 2) return 'grain'
  if (loc <= 5 && functions <= 1 && exports === 0) return 'herb'
  if (exports > 0) return 'flower'
  return 'herb'
}

/**
 * Classify bed type from varieties
 * @example
 * classifyBedType([]) // 'desert'
 */
export function classifyBedType(varieties: SeedVariety[]): BedType {
  if (varieties.length === 0) return 'desert'
  const n = varieties.length
  const prize = varieties.filter(v => v.condition === 'prize-winning' || v.condition === 'premium').length
  const sterile = varieties.filter(v => v.condition === 'sterile' || v.condition === 'invasive').length
  const contained = varieties.filter(v => v.root.isContained).length

  if (sterile > n * 0.6) return 'compost'
  if (prize > n * 0.7) return 'greenhouse'
  if (prize > n * 0.4) return 'garden'
  if (contained > n * 0.5) return 'field'
  return 'wild'
}

/**
 * Classify bed condition from average viability
 * @example
 * classifyBedCondition(85) // 'nursery'
 */
export function classifyBedCondition(avgViability: number): BedCondition {
  if (avgViability >= 75) return 'nursery'
  if (avgViability >= 55) return 'productive'
  if (avgViability >= 35) return 'functional'
  if (avgViability >= 20) return 'overgrown'
  if (avgViability >= 8) return 'barren'
  return 'toxic'
}

/**
 * Classify gardener grade from average yield
 * @example
 * classifyGardenerGrade(85) // 'master-gardener'
 */
export function classifyGardenerGrade(avgYield: number): GardenerGrade {
  if (avgYield >= 80) return 'master-gardener'
  if (avgYield >= 65) return 'gardener'
  if (avgYield >= 45) return 'horticulturist'
  if (avgYield >= 30) return 'apprentice'
  if (avgYield >= 15) return 'amateur'
  return 'weed-puller'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure seed (viability, hull, core)
 * @example
 * measureSeed('export function a(): number { return 1 }') // SeedInfo
 */
export function measureSeed(content: string): SeedInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const reExports = countReExports(content)

  const size = loc
  const hasHull = reExports > 0 || (classes > 0 && functions <= classes)
  const hasCore = functions > 0 || (exports > 0 && countTypeAnnotations(content) > 0)
  const isShelled = hasCore && !hasHull
  const isViable = hasCore && exports > 0
  const hullThickness = Math.min(100, Math.max(0, Math.round(
    (reExports > 0 ? 40 : 0) +
    (classes > functions && classes > 0 ? 35 : 0) +
    (exports > 0 && functions === 0 ? 25 : 0),
  )))

  const type = classifySeedType(content)

  return { type, size, hasHull, hasCore, isShelled, isViable, hullThickness }
}

/**
 * Measure roots (depth, spread, dependencies)
 * @example
 * measureRoots('import { x } from "y"\nexport function a() {}') // RootInfo
 */
export function measureRoots(content: string): RootInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const depth = maxNesting(content)
  const spread = imports

  const isTapRoot = spread === 1
  const isFibrous = spread >= 3
  const isInvasive = exports >= 3 && imports >= 3 && countConsole(content) > 0
  const isContained = spread === 0
  const dependencyCount = spread
  const externalDependencyCount = (content.match(/from\s+['"][^./]/g) ?? []).length

  return { depth, spread, isTapRoot, isFibrous, isInvasive, isContained, dependencyCount, externalDependencyCount }
}

/**
 * Measure hardiness/adaptability (frost/drought/disease/pest resistance)
 * @example
 * measureHardiness('export function a(): number { try { return 1 } catch { return 0 } }') // AdaptabilityInfo
 */
export function measureHardiness(content: string): AdaptabilityInfo {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const consoleStmts = countConsole(content)
  const branches = countBranches(content)

  const isFrostResistant = !/react|express|angular|vue|@angular|next|nuxt/i.test(content)
  const isDroughtResistant = !/process\.env|\.env\b|config\.(ts|js|json)/i.test(content)
  const isDiseaseResistant = errors > 0
  const isPestResistant = types > 0 && branches > 0
  const isUniversal = isFrostResistant && isDroughtResistant && isDiseaseResistant && isPestResistant

  let zone = 5
  if (types > 0) zone += 2
  if (errors > 0) zone += 1
  if (comments > 0) zone += 1
  if (consoleStmts === 0 && loc > 0) zone += 1
  if (isUniversal) zone += 1
  zone = Math.min(11, Math.max(1, zone))

  const adaptabilityScore = Math.min(100, Math.max(0, Math.round(
    (isFrostResistant ? 25 : 0) +
    (isDroughtResistant ? 20 : 0) +
    (isDiseaseResistant ? 20 : 0) +
    (isPestResistant ? 20 : 0) +
    (isUniversal ? 15 : 0),
  )))

  return { zone, isFrostResistant, isDroughtResistant, isDiseaseResistant, isPestResistant, isUniversal, adaptabilityScore }
}

/**
 * Measure germination (tests, coverage, ease)
 * @example
 * measureGermination('describe("a", () => { it("works", () => { expect(1).toBe(1) }) })') // GerminationInfo
 */
export function measureGermination(content: string): GerminationInfo {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const imports = countImports(content)
  const nesting = maxNesting(content)
  const consoleStmts = countConsole(content)

  const hasTests = /describe\s*\(|it\s*\(|test\s*\(/i.test(content)
  const assertions = (content.match(/expect|assert|should/i) ?? []).length
  const testCoverage = hasTests
    ? Math.min(100, Math.max(0, Math.round((assertions / Math.max(functions, 1)) * 50)))
    : 0

  const assertionVariety = (content.match(/toBe|toEqual|toBeTruthy|toBeFalsy|toThrow|toMatch|toContain|toHaveLength/g) ?? []).length
  const testQuality = hasTests
    ? Math.min(100, Math.max(0, Math.round(
      (assertions > 0 ? 30 : 0) +
      (assertionVariety > 2 ? 30 : assertionVariety > 0 ? 15 : 0) +
      (assertions > functions ? 25 : 0) +
      (countComments(content) > 0 ? 15 : 0),
    )))
    : 0

  const isEasyToTest = !/console\.|document\.|window\.|fs\.\w+|require\(['"]fs/i.test(content)

  let testEnvironment: TestEnvironment = 'none'
  if (hasTests) {
    if (/supertest|request\s*\(|browser|page\./i.test(content)) {
      testEnvironment = /supertest|request\s*\(/i.test(content) ? 'integration' : 'e2e'
    } else {
      testEnvironment = 'unit'
    }
  } else if (isEasyToTest && loc > 0) {
    testEnvironment = 'manual'
  }

  const germinationTime = Math.min(100, Math.max(0, Math.round(
    (imports * 5) +
    (nesting * 8) +
    (consoleStmts > 0 ? 15 : 0) +
    (/document\.|window\./i.test(content) ? 20 : 0),
  )))

  return { hasTests, testCoverage, testQuality, isEasyToTest, testEnvironment, germinationTime }
}

/**
 * Measure yield (reuse, abstraction, generic vs specific)
 * @example
 * measureYield('export function calc(x: number): number { return x }') // YieldInfo
 */
export function measureYield(content: string): YieldInfo {
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const descriptive = countDescriptiveNames(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const loc = countLoc(content)
  const todos = countTodos(content)

  const reuseScore = Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (descriptive > 0 ? 10 : 0),
  )))

  const hasImpl = functions > 0 || classes > 0
  const hasAbstr = interfaces > 0 || types > 3
  const abstractionLevel = Math.min(100, Math.max(0, Math.round(
    (hasImpl && hasAbstr ? 40 : hasAbstr ? 60 : hasImpl ? 30 : 10) +
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (comments > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0),
  )))

  const isGeneric = /<T>|<T,|interface\s+\w+<|type\s+\w+</.test(content)
  const hardcodedStrings = (content.match(/['"][A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*['"]/g) ?? []).length
  const isSpecific = hardcodedStrings > 3 || (todos > 0 && loc > 0 && exports === 0)
  const isOverAbstracted = interfaces > functions && functions > 0 && interfaces > 2
  const hasValue = exports > 0 && (functions > 0 || classes > 0)
  const consumers = exports

  return { reuseScore, abstractionLevel, isGeneric, isSpecific, isOverAbstracted, hasValue, consumers }
}

/**
 * Measure crossbreed compatibility (integration ease)
 * @example
 * measureCrossbreed('export function a(): number { return 1 }') // CrossbreedInfo
 */
export function measureCrossbreed(content: string): CrossbreedInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const classes = countClasses(content)
  const functions = countFunctions(content)

  const barriers: string[] = []
  if (/console\.\w+/.test(content)) barriers.push('Side effects via console output')
  if (/process\.env/.test(content)) barriers.push('Environment-dependent configuration')
  if (/document\.|window\./i.test(content)) barriers.push('Browser-specific API usage')
  if (/fs\.\w+|require\(['"]fs/.test(content)) barriers.push('File system dependency')
  if (imports > 5) barriers.push('High dependency count')
  if (types === 0 && countLoc(content) > 5) barriers.push('No type safety')

  const isCompatible = barriers.length === 0 && exports > 0
  const hasBarriers = barriers.length > 0
  const barrierCount = barriers.length

  const arrowCount = (content.match(/=>/g) ?? []).length
  const isHybrid = classes > 0 && arrowCount > classes * 2
  const isHeritage = jsdoc > 0 && types > 0 && comments > 0
  const isGMO = /eval\(|new Function\(|with\s*\(/i.test(content)

  const compatibilityScore = Math.min(100, Math.max(0, Math.round(
    (isCompatible ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (isHeritage ? 20 : 0) +
    (barriers.length === 0 ? 20 : Math.max(0, 20 - barriers.length * 5)) +
    (isGMO ? -20 : 10),
  )))

  return { isCompatible, hasBarriers, barrierCount, barriers, isHybrid, isHeritage, isGMO, compatibilityScore }
}

/**
 * Classify catalog entry (category, tags, season)
 * @example
 * classifyCatalogEntry('export function a() {}') // CatalogInfo
 */
export function classifyCatalogEntry(content: string): CatalogInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const todos = countTodos(content)
  const nesting = maxNesting(content)
  const errors = countErrorHandling(content)

  let category = 'unknown'
  if (functions > 0 && classes === 0) category = 'utility'
  else if (classes > 0 && functions > 0) category = 'mixed'
  else if (classes > 0) category = 'service'
  else if (interfaces > 0 && functions === 0 && classes === 0) category = 'types'
  else if (exports > 0 && functions === 0 && classes === 0 && interfaces === 0) category = 'config'
  else if (interfaces > 0) category = 'types'

  const tags: string[] = []
  if (/async|await/.test(content)) tags.push('async')
  if (types > 0) tags.push('typed')
  if (jsdoc > 0) tags.push('documented')
  if (/describe\s*\(|it\s*\(|test\s*\(/i.test(content)) tags.push('tested')
  if (exports > 0) tags.push('exported')
  if (countImports(content) > 0) tags.push('modular')
  if (nesting > 3) tags.push('complex')
  if (classes > 0) tags.push('oop')
  if (interfaces > 0) tags.push('interface-based')

  let season: Season = 'dormant'
  if (exports === 0) {
    season = 'dormant'
  } else if (jsdoc > 0 && types > 0 && todos === 0 && comments > 0) {
    season = 'evergreen'
  } else if (todos > 0 && exports > 0) {
    season = 'spring'
  } else if (exports > 0 && types > 0 && errors > 0) {
    season = 'summer'
  } else if (todos > 0) {
    season = 'fall'
  } else {
    season = 'winter'
  }
  const isHeirloom = jsdoc > 0 && comments > Math.max(loc * 0.05, 1) && exports > 0 && todos === 0
  const isExperimental = todos > 0
  const isNewVariety = !isHeirloom && !isExperimental && exports > 0

  const maturityDays = Math.min(100, Math.max(0, Math.round(
    loc * 0.5 +
    nesting * 5 +
    classes * 10 +
    functions * 3,
  )))

  return { category, tags, season, isHeirloom, isNewVariety, isExperimental, maturityDays }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a seed variety
 * @example
 * analyzeSeedVariety('export function a(): number { return 1 }', 'a.ts') // SeedVariety
 */
export function analyzeSeedVariety(content: string, filePath: string): SeedVariety {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      seedViability: 0, germinationRate: 0, rootIndependence: 0,
      hardiness: 0, yieldPotential: 0, crossbreedCompat: 0,
      seed: { type: 'weed', size: 0, hasHull: false, hasCore: false, isShelled: false, isViable: false, hullThickness: 0 },
      root: { depth: 0, spread: 0, isTapRoot: false, isFibrous: false, isInvasive: false, isContained: true, dependencyCount: 0, externalDependencyCount: 0 },
      adaptability: { zone: 1, isFrostResistant: true, isDroughtResistant: true, isDiseaseResistant: false, isPestResistant: false, isUniversal: false, adaptabilityScore: 0 },
      germination: { hasTests: false, testCoverage: 0, testQuality: 0, isEasyToTest: true, testEnvironment: 'none', germinationTime: 0 },
      yield: { reuseScore: 0, abstractionLevel: 0, isGeneric: false, isSpecific: false, isOverAbstracted: false, hasValue: false, consumers: 0 },
      crossbreed: { isCompatible: true, hasBarriers: false, barrierCount: 0, barriers: [], isHybrid: false, isHeritage: false, isGMO: false, compatibilityScore: 0 },
      catalog: { category: 'empty', tags: [], season: 'dormant', isHeirloom: false, isNewVariety: false, isExperimental: false, maturityDays: 0 },
      condition: 'sterile',
      qualityScore: 0,
    }
  }

  const seed = measureSeed(content)
  const root = measureRoots(content)
  const adaptability = measureHardiness(content)
  const germination = measureGermination(content)
  const yld = measureYield(content)
  const crossbreed = measureCrossbreed(content)
  const catalog = classifyCatalogEntry(content)

  const seedViability = Math.min(100, Math.max(0, Math.round(
    (seed.isViable ? 25 : 0) +
    (seed.hasCore ? 20 : 0) +
    (seed.isShelled ? 20 : 0) +
    (seed.hullThickness === 0 ? 15 : 0) +
    (countExports(content) > 0 ? 10 : 0) +
    (countTypeAnnotations(content) > 0 ? 10 : 0),
  )))

  const germinationRate = Math.min(100, Math.max(0, Math.round(
    (germination.hasTests ? 30 : 0) +
    (germination.testCoverage * 0.25) +
    (germination.isEasyToTest ? 20 : 0) +
    (germination.testQuality * 0.15) +
    (germination.testEnvironment !== 'none' ? 10 : 0),
  )))

  const rootIndependence = Math.min(100, Math.max(0, Math.round(
    (root.isContained ? 35 : 0) +
    (root.spread <= 2 ? 25 : root.spread <= 5 ? 10 : 0) +
    (!root.isInvasive ? 20 : 0) +
    (root.externalDependencyCount === 0 ? 20 : Math.max(0, 20 - root.externalDependencyCount * 5)),
  )))

  const hardiness = adaptability.adaptabilityScore

  const yieldPotential = Math.min(100, Math.max(0, Math.round(
    yld.reuseScore * 0.3 +
    yld.abstractionLevel * 0.2 +
    (yld.hasValue ? 20 : 0) +
    (yld.isGeneric ? 15 : 0) +
    (yld.consumers > 0 ? Math.min(15, yld.consumers * 5) : 0),
  )))

  const crossbreedCompat = crossbreed.compatibilityScore

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    seedViability * 0.2 +
    germinationRate * 0.1 +
    rootIndependence * 0.2 +
    hardiness * 0.15 +
    yieldPotential * 0.2 +
    crossbreedCompat * 0.15,
  )))

  const condition = classifySeedCondition(qualityScore)

  return {
    file: filePath,
    seedViability, germinationRate, rootIndependence,
    hardiness, yieldPotential, crossbreedCompat,
    seed, root, adaptability, germination, yield: yld, crossbreed, catalog,
    condition, qualityScore,
  }
}

// ─── Bed Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze a directory as a seed bed
 * @example
 * analyzeSeedBed(varieties, 'src') // SeedBed
 */
export function analyzeSeedBed(varieties: SeedVariety[], dirPath: string): SeedBed {
  if (varieties.length === 0) {
    return {
      directory: dirPath, varieties: [],
      avgViability: 0, avgIndependence: 0, avgYieldPotential: 0,
      prizeCount: 0, sterileCount: 0, invasiveCount: 0, selfContainedCount: 0,
      bedType: 'desert', condition: 'barren',
    }
  }

  const n = varieties.length
  const avgViability = Math.round(varieties.reduce((s, v) => s + v.seedViability, 0) / n)
  const avgIndependence = Math.round(varieties.reduce((s, v) => s + v.rootIndependence, 0) / n)
  const avgYieldPotential = Math.round(varieties.reduce((s, v) => s + v.yieldPotential, 0) / n)

  const prizeCount = varieties.filter(v => v.condition === 'prize-winning' || v.condition === 'premium').length
  const sterileCount = varieties.filter(v => v.condition === 'sterile').length
  const invasiveCount = varieties.filter(v => v.condition === 'invasive').length
  const selfContainedCount = varieties.filter(v => v.root.isContained).length

  const bedType = classifyBedType(varieties)
  const condition = classifyBedCondition(avgViability)

  return {
    directory: dirPath, varieties,
    avgViability, avgIndependence, avgYieldPotential,
    prizeCount, sterileCount, invasiveCount, selfContainedCount,
    bedType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate seed catalog recommendations
 * @example
 * generateRecommendations(varieties, beds, garden, stats) // string[]
 */
export function generateRecommendations(
  _varieties: SeedVariety[],
  _beds: SeedBed[],
  _garden: GardenOverview,
  stats: SeedCatalogStats,
): string[] {
  void _varieties
  void _beds
  void _garden
  const recs: string[] = []

  if (stats.sterileCount > 0) {
    recs.push(`Sterile seeds: ${stats.sterileCount} files have no reuse potential`)
  }
  if (stats.invasiveCount > 0) {
    recs.push(`Invasive species: ${stats.invasiveCount} files create dependency tangles`)
  }
  if (stats.avgYieldPotential < 40 && stats.totalFiles > 0) {
    recs.push('Low yield: average reuse potential is below threshold')
  }
  if (stats.universalCount > 0) {
    recs.push(`Universal varieties: ${stats.universalCount} modules work in any environment`)
  }
  if (stats.hasTestsCount === 0 && stats.totalFiles > 0) {
    recs.push('No test coverage: no germination data available')
  }
  if (stats.selfContainedCount > stats.totalFiles * 0.5) {
    recs.push('Self-contained: most modules are independently deployable')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete seed catalog result from files and contents
 * @example
 * buildSeedCatalogResult(['a.ts'], ['export function a() {}'], {}) // SeedCatalogResult
 */
export function buildSeedCatalogResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): SeedCatalogResult {
  void options

  const varieties: SeedVariety[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSeedVariety(content, file)
    } catch {
      return analyzeSeedVariety('', file)
    }
  })

  const dirMap = new Map<string, SeedVariety[]>()
  for (const v of varieties) {
    const dir = v.file.includes('/') ? v.file.slice(0, v.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(v) } else { dirMap.set(dir, [v]) }
  }

  const beds: SeedBed[] = Array.from(dirMap.entries()).map(([dir, vs]) =>
    analyzeSeedBed(vs, dir),
  )

  const n = varieties.length || 1
  const avgViability = Math.round(varieties.reduce((s, v) => s + v.seedViability, 0) / n)
  const avgIndependence = Math.round(varieties.reduce((s, v) => s + v.rootIndependence, 0) / n)
  const avgYieldPotential = Math.round(varieties.reduce((s, v) => s + v.yieldPotential, 0) / n)
  const totalPrizeWinners = varieties.filter(v => v.condition === 'prize-winning').length

  const overallYield = Math.min(100, Math.max(0, Math.round(
    avgViability * 0.25 +
    avgIndependence * 0.2 +
    avgYieldPotential * 0.25 +
    (varieties.filter(v => v.yield.hasValue).length / n) * 100 * 0.15 +
    (varieties.filter(v => v.crossbreed.isCompatible).length / n) * 100 * 0.15,
  )))

  const garden: GardenOverview = {
    avgViability, avgIndependence, avgYieldPotential,
    totalPrizeWinners, isProductive: overallYield >= 50, overallYield,
  }

  const stats: SeedCatalogStats = {
    totalFiles: files.length,
    totalBeds: beds.length,
    avgSeedViability: avgViability,
    avgGerminationRate: Math.round(varieties.reduce((s, v) => s + v.germinationRate, 0) / n),
    avgRootIndependence: avgIndependence,
    avgHardiness: Math.round(varieties.reduce((s, v) => s + v.hardiness, 0) / n),
    avgYieldPotential,
    avgCrossbreedCompat: Math.round(varieties.reduce((s, v) => s + v.crossbreedCompat, 0) / n),
    prizeWinningCount: varieties.filter(v => v.condition === 'prize-winning').length,
    premiumCount: varieties.filter(v => v.condition === 'premium').length,
    standardCount: varieties.filter(v => v.condition === 'standard').length,
    substandardCount: varieties.filter(v => v.condition === 'substandard').length,
    sterileCount: varieties.filter(v => v.condition === 'sterile').length,
    invasiveCount: varieties.filter(v => v.condition === 'invasive').length,
    selfContainedCount: varieties.filter(v => v.root.isContained).length,
    universalCount: varieties.filter(v => v.adaptability.isUniversal).length,
    hasTestsCount: varieties.filter(v => v.germination.hasTests).length,
    easyToTestCount: varieties.filter(v => v.germination.isEasyToTest).length,
    grainCount: varieties.filter(v => v.seed.type === 'grain').length,
    vegetableCount: varieties.filter(v => v.seed.type === 'vegetable').length,
    treeCount: varieties.filter(v => v.seed.type === 'tree').length,
    vineCount: varieties.filter(v => v.seed.type === 'vine').length,
    weedCount: varieties.filter(v => v.seed.type === 'weed').length,
    evergreenCount: varieties.filter(v => v.catalog.season === 'evergreen').length,
    dormantCount: varieties.filter(v => v.catalog.season === 'dormant').length,
    heirloomCount: varieties.filter(v => v.catalog.isHeirloom).length,
    experimentalCount: varieties.filter(v => v.catalog.isExperimental).length,
    overallYield,
    gardenerGrade: classifyGardenerGrade(overallYield),
    bestVariety: varieties.length > 0
      ? varieties.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, varieties[0]).file : 'none',
    mostIndependent: varieties.length > 0
      ? varieties.reduce((a, b) => b.rootIndependence > a.rootIndependence ? b : a, varieties[0]).file : 'none',
    highestYield: varieties.length > 0
      ? varieties.reduce((a, b) => b.yieldPotential > a.yieldPotential ? b : a, varieties[0]).file : 'none',
    mostCompatible: varieties.length > 0
      ? varieties.reduce((a, b) => b.crossbreedCompat > a.crossbreedCompat ? b : a, varieties[0]).file : 'none',
    mostInvasive: varieties.length > 0
      ? varieties.reduce((a, b) => b.root.isInvasive && !a.root.isInvasive ? b : a, varieties[0]).file : 'none',
  }

  const recommendations = generateRecommendations(varieties, beds, garden, stats)

  return { varieties, beds, garden, stats, recommendations }
}
