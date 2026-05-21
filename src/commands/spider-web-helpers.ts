// ─── Interfaces ──────────────────────────────────────────

export type SilkType = 'dragline' | 'capture-spiral' | 'framework' | 'guy-line' | 'egg-sac' | 'balloon'
export type WebPattern = 'orb-web' | 'cobweb' | 'sheet-web' | 'funnel-web' | 'tarantula-burrow' | 'no-web'
export type ThreadCondition = 'masterpiece-web' | 'strong-web' | 'functional-web' | 'patchy-web' | 'torn-web' | 'no-web'
export type ClusterType = 'garden-spider' | 'orb-weaver' | 'tarantula' | 'jumping-spider' | 'cobweb' | 'empty-corner'
export type ClusterCondition = 'intricate-masterpiece' | 'strong-network' | 'functional-trap' | 'messy-cobweb' | 'broken-strands' | 'bare-wall'
export type WeaverGrade = 'master-weaver' | 'expert-weaver' | 'weaver' | 'spinner' | 'hatchling' | 'fly'

export interface SilkMeasure {
  type: SilkType
  strength: number
  elasticity: number
  isStrong: boolean
  isFragile: boolean
  isSticky: boolean
  isSlippery: boolean
  diameter: number
}

export interface WebMeasure {
  pattern: WebPattern
  geometry: number
  hasCenter: boolean
  hasRadii: boolean
  hasSpirals: boolean
  hasFrame: boolean
  isSymmetric: boolean
  isConcentric: boolean
  radiusCount: number
  spiralCount: number
}

export interface ConnectionsMeasure {
  inbound: number
  outbound: number
  total: number
  hasCircular: boolean
  hasRedundant: boolean
  hasDangling: boolean
  hasBroken: boolean
  circularCount: number
  danglingCount: number
  brokenCount: number
}

export interface AdhesiveMeasure {
  quality: number
  hasStrongInterface: boolean
  hasWeakInterface: boolean
  hasStickyTraps: boolean
  hasNonStick: boolean
  trapCount: number
}

export interface VibrationMeasure {
  sensitivity: number
  hasHighPropagation: boolean
  hasIsolation: boolean
  hasDampening: boolean
  propagationPaths: number
  isSensitive: boolean
}

export interface ResilienceMeasure {
  canRepair: boolean
  hasRedundancy: boolean
  hasBackup: boolean
  repairDifficulty: number
  resilienceScore: number
  isRobust: boolean
}

export interface SpiderProfile {
  isArchitect: boolean
  isWeaver: boolean
  isHunter: boolean
  isDweller: boolean
  silkProduction: number
  webMaintenance: number
}

export interface SilkThread {
  file: string
  silkStrength: number
  webGeometry: number
  threadCount: number
  adhesiveQuality: number
  vibrationSensitivity: number
  structuralResilience: number
  silk: SilkMeasure
  web: WebMeasure
  connections: ConnectionsMeasure
  adhesive: AdhesiveMeasure
  vibration: VibrationMeasure
  resilience: ResilienceMeasure
  spider: SpiderProfile
  condition: ThreadCondition
  qualityScore: number
}

export interface WebCluster {
  directory: string
  threads: SilkThread[]
  avgSilkStrength: number
  avgResilience: number
  avgVibration: number
  masterpieceCount: number
  tornCount: number
  circularDepCount: number
  totalConnections: number
  clusterType: ClusterType
  condition: ClusterCondition
}

export interface Colony {
  avgSilkStrength: number
  avgResilience: number
  avgVibration: number
  totalConnections: number
  circularDependencies: number
  isRobust: boolean
  overallStrength: number
}

export interface SpiderWebStats {
  totalFiles: number
  totalClusters: number
  avgSilkStrength: number
  avgWebGeometry: number
  avgThreadCount: number
  avgAdhesiveQuality: number
  avgVibrationSensitivity: number
  avgStructuralResilience: number
  masterpieceWebCount: number
  strongWebCount: number
  functionalWebCount: number
  patchyWebCount: number
  tornWebCount: number
  noWebCount: number
  orbWebCount: number
  cobwebCount: number
  sheetWebCount: number
  funnelWebCount: number
  circularDepCount: number
  danglingDepCount: number
  brokenDepCount: number
  totalConnections: number
  hasIsolationCount: number
  hasDampeningCount: number
  canRepairCount: number
  isRobustCount: number
  architectCount: number
  weaverCount: number
  overallStrength: number
  weaverGrade: WeaverGrade
  strongestThread: string
  mostConnected: string
  mostResilient: string
  mostVulnerable: string
  mostTangled: string
}

export interface SpiderWebResult {
  threads: SilkThread[]
  clusters: WebCluster[]
  colony: Colony
  stats: SpiderWebStats
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

export function countInterfaces(content: string): number {
  const matches = content.match(/\binterface\s+\w+/g)
  return matches ? matches.length : 0
}

export function countTypeAliases(content: string): number {
  const matches = content.match(/\btype\s+\w+\s*=/g)
  return matches ? matches.length : 0
}

export function countAnyUsage(content: string): number {
  const matches = content.match(/:\s*any\b/g)
  return matches ? matches.length : 0
}

export function countDefaultExports(content: string): number {
  const matches = content.match(/\bexport\s+default\b/g)
  return matches ? matches.length : 0
}

export function countReExports(content: string): number {
  const matches = content.match(/\bexport\s+\*\s+from/g)
  return matches ? matches.length : 0
}

// ─── Silk Measurement ────────────────────────────────────

/**
 * Measure silk quality (dependency quality)
 * @example
 * measureSilk('export function calc() {}') // { type, strength, ... }
 */
export function measureSilk(content: string): SilkMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const functions = countFunctions(content)
  const anyUsage = countAnyUsage(content)

  const strength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (comments(content) > 0 ? 10 : 0) +
    (anyUsage === 0 ? 15 : 0),
  )))

  const elasticity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 30 : 0) +
    (interfaces(content) > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (functions <= 5 ? 25 : 0),
  )))

  let type: SilkType = 'balloon'
  if (strength >= 80) type = 'dragline'
  else if (strength >= 65) type = 'framework'
  else if (strength >= 50) type = 'capture-spiral'
  else if (strength >= 35) type = 'guy-line'
  else if (strength >= 20) type = 'egg-sac'

  const diameter = Math.min(100, Math.max(0, Math.round(
    (imports + exports) * 5 +
    (functions > 0 ? 10 : 0) +
    (classes(content) > 0 ? 10 : 0),
  )))

  const isStrong = strength >= 70
  const isFragile = strength < 30 && loc > 0
  const isSticky = imports > 5
  const isSlippery = imports <= 2 && exports > 0

  return { type, strength, elasticity, isStrong, isFragile, isSticky, isSlippery, diameter }
}

// ─── Web Measurement ─────────────────────────────────────

/**
 * Measure web pattern and geometry
 * @example
 * measureWeb('import { a } from "b"; export function c() {}') // { pattern, geometry, ... }
 */
export function measureWeb(content: string): WebMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const types = countTypeAnnotations(content)

  const hasCenter = exports > 2
  const hasRadii = imports > 0 && exports > 0
  const hasSpirals = functions > 2 || classes > 0
  const hasFrame = imports > 2

  const radiusCount = imports
  const spiralCount = functions + classes

  const geometry = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasCenter ? 20 : 0) +
    (hasRadii ? 20 : 0) +
    (hasSpirals ? 15 : 0) +
    (hasFrame ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (imports <= 5 ? 15 : 0),
  )))

  const isSymmetric = loc > 0 && Math.abs(imports - exports) <= 2
  const isConcentric = imports > 0 && exports > 0 && types > 0

  let pattern: WebPattern = 'no-web'
  if (hasCenter && hasRadii && hasSpirals && hasFrame) pattern = 'orb-web'
  else if (hasCenter && hasFrame && !hasSpirals) pattern = 'sheet-web'
  else if (hasCenter && !hasRadii) pattern = 'funnel-web'
  else if (hasRadii && !hasCenter) pattern = 'cobweb'
  else if (loc > 0 && imports === 0 && exports === 0) pattern = 'tarantula-burrow'

  return { pattern, geometry, hasCenter, hasRadii, hasSpirals, hasFrame, isSymmetric, isConcentric, radiusCount, spiralCount }
}

// ─── Connections Measurement ──────────────────────────────

/**
 * Measure connection patterns
 * @example
 * measureConnections('import { a } from "b"; export function c() {}') // { inbound, outbound, ... }
 */
export function measureConnections(content: string): ConnectionsMeasure {
  const inbound = countImports(content)
  const outbound = countExports(content)
  const total = inbound + outbound

  const importPaths = content.match(/from\s+['"]([^'"]+)['"]/g) ?? []
  const uniquePaths = Array.from(new Set(importPaths))
  const hasRedundant = importPaths.length !== uniquePaths.length

  const defaultExports = countDefaultExports(content)
  const hasCircular = false
  const hasDangling = inbound > outbound && inbound > 3
  const hasBroken = false
  const circularCount = 0
  const danglingCount = hasDangling ? inbound - outbound : 0
  const brokenCount = 0

  return {
    inbound, outbound, total,
    hasCircular, hasRedundant, hasDangling, hasBroken,
    circularCount, danglingCount, brokenCount,
  }
}

// ─── Adhesive Measurement ────────────────────────────────

/**
 * Measure interface quality (adhesive)
 * @example
 * measureAdhesive('export function calc(x: number): number { return x }') // { quality, ... }
 */
export function measureAdhesive(content: string): AdhesiveMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const anyUsage = countAnyUsage(content)
  const exports = countExports(content)
  const descriptive = countDescriptiveNames(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (interfaces > 0 ? 25 : 0) +
    (typeAliases > 0 ? 15 : 0) +
    (anyUsage === 0 ? 15 : 0) +
    (descriptive > 0 ? 10 : 0) +
    (exports > 0 ? 10 : 0),
  )))

  const hasStrongInterface = interfaces > 0 && types > 0
  const hasWeakInterface = anyUsage > 0
  const hasStickyTraps = exports > 5
  const hasNonStick = interfaces > 0 && typeAliases > 0
  const trapCount = hasStickyTraps ? exports : 0

  return { quality, hasStrongInterface, hasWeakInterface, hasStickyTraps, hasNonStick, trapCount }
}

// ─── Vibration Measurement ───────────────────────────────

/**
 * Measure change propagation sensitivity
 * @example
 * measureVibration('export function calc() {}') // { sensitivity, hasIsolation, ... }
 */
export function measureVibration(content: string): VibrationMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const imports = countImports(content)

  const sensitivity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 3 ? 25 : 0) +
    (functions > 5 ? 20 : 0) +
    (branches > 5 ? 20 : 0) +
    (nesting > 3 ? 15 : 0) +
    (imports > 5 ? 20 : 0),
  )))

  const hasHighPropagation = exports > 5 && imports > 3
  const hasIsolation = loc > 0 && exports <= 2 && functions <= 3
  const hasDampening = countInterfaces(content) > 0 || countTypeAliases(content) > 0
  const propagationPaths = exports + imports
  const isSensitive = sensitivity > 60

  return { sensitivity, hasHighPropagation, hasIsolation, hasDampening, propagationPaths, isSensitive }
}

// ─── Resilience Measurement ──────────────────────────────

/**
 * Measure structural resilience
 * @example
 * measureResilience('try { x } catch (e) { handle(e) }') // { canRepair, ... }
 */
export function measureResilience(content: string): ResilienceMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const branches = countBranches(content)

  const canRepair = errors > 0 && functions > 0
  const hasRedundancy = branches > 0 && errors > 0
  const hasBackup = errors > 0

  const repairDifficulty = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors === 0 && branches > 0 ? 30 : 0) +
    (functions > 10 ? 25 : 0) +
    (types === 0 ? 25 : 0) +
    (maxNesting(content) > 3 ? 20 : 0),
  )))

  const resilienceScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (canRepair ? 30 : 0) +
    (hasRedundancy ? 20 : 0) +
    (hasBackup ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (functions <= 5 ? 15 : 0),
  )))

  const isRobust = resilienceScore >= 60

  return { canRepair, hasRedundancy, hasBackup, repairDifficulty, resilienceScore, isRobust }
}

// ─── Spider Classification ───────────────────────────────

/**
 * Classify spider role
 * @example
 * classifySpider('export function build() {}') // { isArchitect, ... }
 */
export function classifySpider(content: string): SpiderProfile {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const errors = countErrorHandling(content)
  const descriptive = countDescriptiveNames(content)

  const isArchitect = exports > 3 && imports > 0 && (classes > 0 || countInterfaces(content) > 0)
  const isWeaver = functions > 0 && imports > 1 && descriptive > 0
  const isHunter = errors > 0 && functions > 0 && branches(content) > 0
  const isDweller = loc > 0 && exports === 0 && imports === 0

  const silkProduction = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (functions > 0 ? 20 : 0) +
    (descriptive > 0 ? 20 : 0) +
    (classes > 0 ? 15 : 0) +
    (errors > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0),
  )))

  const webMaintenance = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countJSDoc(content) > 0 ? 20 : 0) +
    (imports > 0 ? 15 : 0) +
    (countTodos(content) === 0 ? 20 : 0),
  )))

  return { isArchitect, isWeaver, isHunter, isDweller, silkProduction, webMaintenance }
}

// ─── Helpers (avoid variable-before-declaration bugs) ────

function comments(content: string): number { return countComments(content) }
function interfaces(content: string): number { return countInterfaces(content) }
function classes(content: string): number { return countClasses(content) }
function branches(content: string): number { return countBranches(content) }

// ─── Condition Classification ────────────────────────────

export function classifyCondition(qualityScore: number): ThreadCondition {
  if (qualityScore >= 85) return 'masterpiece-web'
  if (qualityScore >= 68) return 'strong-web'
  if (qualityScore >= 50) return 'functional-web'
  if (qualityScore >= 32) return 'patchy-web'
  if (qualityScore >= 15) return 'torn-web'
  return 'no-web'
}

export function classifyClusterType(threads: SilkThread[]): ClusterType {
  if (threads.length === 0) return 'empty-corner'
  const avg = threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length
  const circularCount = threads.filter(t => t.connections.hasCircular).length
  if (circularCount > 0) return 'cobweb'
  if (avg >= 75) return 'garden-spider'
  if (avg >= 58) return 'orb-weaver'
  if (avg >= 40) return 'tarantula'
  if (avg >= 22) return 'jumping-spider'
  return 'cobweb'
}

export function classifyClusterCondition(threads: SilkThread[]): ClusterCondition {
  if (threads.length === 0) return 'bare-wall'
  const avg = threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length
  if (avg >= 80) return 'intricate-masterpiece'
  if (avg >= 62) return 'strong-network'
  if (avg >= 44) return 'functional-trap'
  if (avg >= 26) return 'messy-cobweb'
  if (avg >= 12) return 'broken-strands'
  return 'bare-wall'
}

export function classifyWeaverGrade(avgStrength: number): WeaverGrade {
  if (avgStrength >= 80) return 'master-weaver'
  if (avgStrength >= 65) return 'expert-weaver'
  if (avgStrength >= 48) return 'weaver'
  if (avgStrength >= 32) return 'spinner'
  if (avgStrength >= 16) return 'hatchling'
  return 'fly'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a silk thread
 * @example
 * analyzeSilkThread('export function calc() {}', 'calc.ts') // SilkThread
 */
export function analyzeSilkThread(content: string, filePath: string): SilkThread {
  const silk = measureSilk(content)
  const web = measureWeb(content)
  const connections = measureConnections(content)
  const adhesive = measureAdhesive(content)
  const vibration = measureVibration(content)
  const resilience = measureResilience(content)
  const spider = classifySpider(content)

  const silkStrength = silk.strength
  const webGeometry = web.geometry
  const threadCount = connections.total
  const adhesiveQuality = adhesive.quality
  const vibrationSensitivity = vibration.sensitivity
  const structuralResilience = resilience.resilienceScore

  const qualityScore = countLoc(content) === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (silkStrength * 0.20) +
    (webGeometry * 0.15) +
    (adhesiveQuality * 0.20) +
    (structuralResilience * 0.20) +
    ((100 - vibrationSensitivity) * 0.10) +
    (spider.silkProduction * 0.15),
  )))

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    silkStrength, webGeometry, threadCount, adhesiveQuality,
    vibrationSensitivity, structuralResilience,
    silk, web, connections, adhesive, vibration, resilience, spider,
    condition, qualityScore,
  }
}

// ─── Web Cluster ─────────────────────────────────────────

/**
 * Analyze a directory as a web cluster
 * @example
 * analyzeWebCluster(threads, 'src') // WebCluster
 */
export function analyzeWebCluster(threads: SilkThread[], dirPath: string): WebCluster {
  const avgSilkStrength = threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.silkStrength, 0) / threads.length)
  const avgResilience = threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.structuralResilience, 0) / threads.length)
  const avgVibration = threads.length === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.vibrationSensitivity, 0) / threads.length)
  const masterpieceCount = threads.filter(t => t.condition === 'masterpiece-web').length
  const tornCount = threads.filter(t => t.condition === 'torn-web' || t.condition === 'no-web').length
  const circularDepCount = threads.filter(t => t.connections.hasCircular).length
  const totalConnections = threads.reduce((s, t) => s + t.connections.total, 0)

  const clusterType = classifyClusterType(threads)
  const condition = classifyClusterCondition(threads)

  return {
    directory: dirPath, threads,
    avgSilkStrength, avgResilience, avgVibration,
    masterpieceCount, tornCount, circularDepCount, totalConnections,
    clusterType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(threads, clusters, colony, stats) // string[]
 */
export function generateRecommendations(
  threads: SilkThread[],
  clusters: WebCluster[],
  colony: Colony,
  stats: SpiderWebStats,
): string[] {
  const recs: string[] = []

  if (stats.tornWebCount + stats.noWebCount > 0) {
    recs.push(`Broken strands: ${stats.tornWebCount + stats.noWebCount} file(s) have no meaningful connections`)
  }
  if (stats.circularDepCount > 0) {
    recs.push(`Circular dependencies detected in ${stats.circularDepCount} file(s) - untangle the web`)
  }
  if (stats.danglingDepCount > 0) {
    recs.push(`Dangling threads: ${stats.danglingDepCount} unused import(s) detected`)
  }
  if (stats.avgVibrationSensitivity > 60) {
    recs.push('High vibration sensitivity - changes propagate widely, consider better isolation')
  }
  if (stats.avgStructuralResilience < 40) {
    recs.push('Low structural resilience - add error handling for dependency failures')
  }
  if (colony.overallStrength >= 70) {
    recs.push('Strong web - good interconnection quality across the colony')
  }
  if (stats.hasIsolationCount > stats.totalFiles * 0.5) {
    recs.push('Good isolation - most modules contain changes effectively')
  }
  if (stats.isRobustCount > stats.totalFiles * 0.5) {
    recs.push('Robust colony - most files handle dependency failures gracefully')
  }
  if (clusters.length > 1) {
    const weakClusters = clusters.filter(c => c.clusterType === 'cobweb' || c.clusterType === 'jumping-spider')
    if (weakClusters.length > 0) {
      recs.push(`Weak clusters: ${weakClusters.map(c => c.directory).join(', ')} need reinforcement`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete spider-web result
 * @example
 * buildSpiderWebResult(['a.ts'], ['export function a() {}'], {}) // SpiderWebResult
 */
export function buildSpiderWebResult(files: string[], contents: string[], _options: Record<string, unknown>): SpiderWebResult {
  const threads: SilkThread[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeSilkThread(content, file)
  })

  const dirMap = new Map<string, SilkThread[]>()
  for (const thread of threads) {
    const parts = thread.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(thread) } else { dirMap.set(dir, [thread]) }
  }

  const clusters = Array.from(dirMap.entries()).map(([dir, dirThreads]) =>
    analyzeWebCluster(dirThreads, dir),
  )

  const totalFiles = threads.length
  const avgSilkStrength = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.silkStrength, 0) / totalFiles)
  const avgWebGeometry = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.webGeometry, 0) / totalFiles)
  const avgThreadCount = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.threadCount, 0) / totalFiles)
  const avgAdhesiveQuality = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.adhesiveQuality, 0) / totalFiles)
  const avgVibrationSensitivity = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.vibrationSensitivity, 0) / totalFiles)
  const avgStructuralResilience = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.structuralResilience, 0) / totalFiles)
  const overallStrength = totalFiles === 0 ? 0 : Math.round(threads.reduce((s, t) => s + t.qualityScore, 0) / totalFiles)

  const colony: Colony = {
    avgSilkStrength,
    avgResilience: avgStructuralResilience,
    avgVibration: avgVibrationSensitivity,
    totalConnections: threads.reduce((s, t) => s + t.connections.total, 0),
    circularDependencies: threads.filter(t => t.connections.hasCircular).length,
    isRobust: avgStructuralResilience >= 50,
    overallStrength,
  }

  const conditionCounts = { masterpieceWeb: 0, strongWeb: 0, functionalWeb: 0, patchyWeb: 0, tornWeb: 0, noWeb: 0 }
  const patternCounts = { orbWeb: 0, cobweb: 0, sheetWeb: 0, funnelWeb: 0, tarantulaBurrow: 0, noWeb: 0 }

  for (const thread of threads) {
    switch (thread.condition) {
      case 'masterpiece-web': conditionCounts.masterpieceWeb++; break
      case 'strong-web': conditionCounts.strongWeb++; break
      case 'functional-web': conditionCounts.functionalWeb++; break
      case 'patchy-web': conditionCounts.patchyWeb++; break
      case 'torn-web': conditionCounts.tornWeb++; break
      case 'no-web': conditionCounts.noWeb++; break
    }
    switch (thread.web.pattern) {
      case 'orb-web': patternCounts.orbWeb++; break
      case 'cobweb': patternCounts.cobweb++; break
      case 'sheet-web': patternCounts.sheetWeb++; break
      case 'funnel-web': patternCounts.funnelWeb++; break
      case 'tarantula-burrow': patternCounts.tarantulaBurrow++; break
      case 'no-web': patternCounts.noWeb++; break
    }
  }

  const strongestThread = totalFiles === 0 ? 'none' :
    threads.reduce((best, t) => t.silkStrength > best.silkStrength ? t : best).file
  const mostConnected = totalFiles === 0 ? 'none' :
    threads.reduce((best, t) => t.threadCount > best.threadCount ? t : best).file
  const mostResilient = totalFiles === 0 ? 'none' :
    threads.reduce((best, t) => t.structuralResilience > best.structuralResilience ? t : best).file
  const mostVulnerable = totalFiles === 0 ? 'none' :
    threads.reduce((worst, t) => t.vibrationSensitivity > worst.vibrationSensitivity ? t : worst).file
  const mostTangled = totalFiles === 0 ? 'none' :
    threads.reduce((worst, t) => t.connections.danglingCount > worst.connections.danglingCount ? t : worst).file

  const stats: SpiderWebStats = {
    totalFiles,
    totalClusters: clusters.length,
    avgSilkStrength,
    avgWebGeometry,
    avgThreadCount,
    avgAdhesiveQuality,
    avgVibrationSensitivity,
    avgStructuralResilience,
    masterpieceWebCount: conditionCounts.masterpieceWeb,
    strongWebCount: conditionCounts.strongWeb,
    functionalWebCount: conditionCounts.functionalWeb,
    patchyWebCount: conditionCounts.patchyWeb,
    tornWebCount: conditionCounts.tornWeb,
    noWebCount: conditionCounts.noWeb,
    orbWebCount: patternCounts.orbWeb,
    cobwebCount: patternCounts.cobweb,
    sheetWebCount: patternCounts.sheetWeb,
    funnelWebCount: patternCounts.funnelWeb,
    circularDepCount: threads.filter(t => t.connections.hasCircular).length,
    danglingDepCount: threads.reduce((s, t) => s + t.connections.danglingCount, 0),
    brokenDepCount: threads.reduce((s, t) => s + t.connections.brokenCount, 0),
    totalConnections: colony.totalConnections,
    hasIsolationCount: threads.filter(t => t.vibration.hasIsolation).length,
    hasDampeningCount: threads.filter(t => t.vibration.hasDampening).length,
    canRepairCount: threads.filter(t => t.resilience.canRepair).length,
    isRobustCount: threads.filter(t => t.resilience.isRobust).length,
    architectCount: threads.filter(t => t.spider.isArchitect).length,
    weaverCount: threads.filter(t => t.spider.isWeaver).length,
    overallStrength,
    weaverGrade: classifyWeaverGrade(overallStrength),
    strongestThread,
    mostConnected,
    mostResilient,
    mostVulnerable,
    mostTangled,
  }

  const recommendations = generateRecommendations(threads, clusters, colony, stats)

  return { threads, clusters, colony, stats, recommendations }
}
