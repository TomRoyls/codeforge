// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ArmTension {
  buildHealth: number
  ciReadiness: number
  dependencyHealth: number
  hasWeakPoints: boolean
  weakPointCount: number
}

export interface LaunchAngle {
  architectureAlignment: number
  targetAccuracy: number
  isOnTarget: boolean
  deviationDegrees: number
}

export interface ReleaseMechanism {
  hasTests: boolean
  hasDocs: boolean
  hasTypes: boolean
  hasLinting: boolean
  hasCI: boolean
  hasVersioning: boolean
  readinessScore: number
  missingChecks: string[]
}

export interface ProjectileIntegrity {
  cohesion: number
  hasCracks: boolean
  hasWeakSpots: boolean
  hasReinforcement: boolean
  crackCount: number
  weakSpotCount: number
  willHoldTogether: boolean
}

export interface Trajectory {
  maxHeight: number
  range: number
  timeOfFlight: number
  isStable: boolean
  isTumbling: boolean
  willReachTarget: boolean
}

export type PayloadType = 'boulder' | 'fireball' | 'grapeshot' | 'bolt' | 'dart' | 'dust'
export type WeightClass = 'featherweight' | 'lightweight' | 'middleweight' | 'heavyweight' | 'super-heavy' | 'overloaded'
export type LaunchReadiness = 'go' | 'go-with-caution' | 'hold' | 'abort' | 'scrub'

export interface Projectile {
  file: string
  payloadWeight: number
  structuralIntegrity: number
  aerodynamics: number
  impactForce: number
  stability: number
  isReady: boolean
  payloadType: PayloadType
  weightClass: WeightClass
  armTension: ArmTension
  launchAngle: LaunchAngle
  releaseMechanism: ReleaseMechanism
  projectile: ProjectileIntegrity
  trajectory: Trajectory
  launchReadiness: LaunchReadiness
  qualityScore: number
}

export type EngineType = 'trebuchet' | 'mangonel' | 'ballista' | 'onager' | 'scorpion' | 'bombard'
export type SiegeCondition = 'battle-ready' | 'ready' | 'standing-by' | 'needs-repair' | 'broken'

export interface SiegeEngine {
  directory: string
  projectiles: Projectile[]
  avgReadiness: number
  avgStructuralIntegrity: number
  avgArmTension: number
  avgLaunchAngle: number
  readyCount: number
  holdCount: number
  abortCount: number
  overloadedCount: number
  totalCracks: number
  totalWeakSpots: number
  hasReinforcement: boolean
  engineType: EngineType
  engineHealth: number
  condition: SiegeCondition
}

export interface LaunchPad {
  overallReadiness: number
  avgArmTension: number
  avgLaunchAngle: number
  avgStructuralIntegrity: number
  goCount: number
  holdCount: number
  abortCount: number
  isClearForLaunch: boolean
  launchWindow: 'now' | 'soon' | 'delayed' | 'indefinitely' | 'never'
}

export interface CatapultStats {
  totalFiles: number
  totalEngines: number
  avgPayloadWeight: number
  avgStructuralIntegrity: number
  avgAerodynamics: number
  avgStability: number
  avgArmTension: number
  avgLaunchAngle: number
  avgReadinessScore: number
  goCount: number
  goWithCautionCount: number
  holdCount: number
  abortCount: number
  scrubCount: number
  hasTests: number
  hasDocs: number
  hasTypes: number
  totalCracks: number
  totalWeakSpots: number
  overloadedCount: number
  isClearForLaunch: boolean
  overallReadiness: number
  commanderGrade: 'field-marshal' | 'general' | 'colonel' | 'captain' | 'sergeant' | 'private'
  bestProjectile: string
  worstProjectile: string
  heaviestPayload: string
  mostReady: string
  leastReady: string
}

export interface CatapultResult {
  projectiles: Projectile[]
  engines: SiegeEngine[]
  launchPad: LaunchPad
  stats: CatapultStats
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

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure payload weight (code complexity/size)
 * @example
 * measurePayloadWeight('function calc() { if (x) { return y } }') // number
 */
export function measurePayloadWeight(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const complexity = countBranches(content) * 3 + maxNesting(content) * 5 + countFunctions(content) * 2
  const sizeFactor = Math.min(40, loc)
  return Math.min(100, Math.round(complexity + sizeFactor))
}

/**
 * Measure structural integrity (code robustness)
 * @example
 * measureStructuralIntegrity('export function calc(x: number): number { return x }') // number
 */
export function measureStructuralIntegrity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasError = countErrorHandling(content) > 0 ? 20 : 0
  const hasDocs = countComments(content) > 0 ? 15 : 0
  const lowNesting = maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0
  const hasExports = countExports(content) > 0 ? 15 : 0
  const noTodos = countTodos(content) === 0 ? 10 : 0

  return Math.min(100, hasTypes + hasError + hasDocs + lowNesting + hasExports + noTodos)
}

/**
 * Measure aerodynamics (code efficiency)
 * @example
 * measureAerodynamics('export function add(a: number, b: number): number { return a + b }') // number
 */
export function measureAerodynamics(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const smallSize = loc <= 50 ? 25 : loc <= 100 ? 15 : 0
  const lowComplexity = countBranches(content) <= 3 ? 25 : countBranches(content) <= 7 ? 12 : 0
  const lowConsole = countConsole(content) <= 1 ? 20 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 15 : 0
  const lowNesting = maxNesting(content) <= 2 ? 15 : 0

  return Math.min(100, smallSize + lowComplexity + lowConsole + hasTypes + lowNesting)
}

/**
 * Measure impact force (performance potential)
 * @example
 * measureImpactForce('export function calc() { return 1 }') // number
 */
export function measureImpactForce(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasExports = countExports(content) > 0 ? 20 : 0
  const focused = countFunctions(content) <= 3 ? 25 : countFunctions(content) <= 6 ? 12 : 0
  const noVar = !/\bvar\b/.test(content) ? 15 : 0
  const hasReturn = /\breturn\b/.test(content) ? 15 : 0
  const lowImports = countImports(content) <= 3 ? 15 : 0
  const hasAsync = /\basync\b/.test(content) ? 10 : 0

  return Math.min(100, hasExports + focused + noVar + hasReturn + lowImports + hasAsync)
}

/**
 * Measure stability (code stability)
 * @example
 * measureStability('try { calc() } catch(e) { handleError(e) }') // number
 */
export function measureStability(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasError = countErrorHandling(content) > 0 ? 25 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const noTodos = countTodos(content) === 0 ? 20 : 0
  const lowNesting = maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0
  const lowConsole = countConsole(content) === 0 ? 15 : 0

  return Math.min(100, hasError + hasTypes + noTodos + lowNesting + lowConsole)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify payload type from content
 * @example
 * classifyPayloadType('export function calc() {}') // string
 */
export function classifyPayloadType(content: string): PayloadType {
  const exports = countExports(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)

  if (exports > 3 && functions > 2 && loc > 50) return 'boulder'
  if (/async|await|Promise/.test(content)) return 'fireball'
  if (functions > 5 && loc > 30) return 'grapeshot'
  if (exports === 1 && loc <= 30) return 'bolt'
  if (exports > 0 && loc <= 15) return 'dart'
  return 'dust'
}

/**
 * Classify weight class from payload weight
 * @example
 * classifyWeightClass(20) // 'featherweight'
 */
export function classifyWeightClass(weight: number): WeightClass {
  if (weight <= 15) return 'featherweight'
  if (weight <= 30) return 'lightweight'
  if (weight <= 50) return 'middleweight'
  if (weight <= 70) return 'heavyweight'
  if (weight <= 90) return 'super-heavy'
  return 'overloaded'
}

/**
 * Classify commander grade from average readiness
 * @example
 * classifyCommanderGrade(80) // 'field-marshal'
 */
export function classifyCommanderGrade(avgReadiness: number): CatapultStats['commanderGrade'] {
  if (avgReadiness >= 75) return 'field-marshal'
  if (avgReadiness >= 60) return 'general'
  if (avgReadiness >= 45) return 'colonel'
  if (avgReadiness >= 30) return 'captain'
  if (avgReadiness >= 15) return 'sergeant'
  return 'private'
}

/**
 * Classify engine type from projectiles
 * @example
 * classifyEngineType(projectiles) // string
 */
export function classifyEngineType(projectiles: Projectile[]): EngineType {
  if (projectiles.length === 0) return 'scorpion'
  const avgWeight = projectiles.reduce((s, p) => s + p.payloadWeight, 0) / projectiles.length
  const maxIntegrity = Math.max(...projectiles.map(p => p.structuralIntegrity))

  if (avgWeight > 60 && maxIntegrity > 70) return 'trebuchet'
  if (projectiles.length > 8) return 'mangonel'
  if (avgWeight <= 30 && maxIntegrity > 50) return 'ballista'
  if (avgWeight > 50) return 'bombard'
  if (projectiles.length <= 3) return 'scorpion'
  return 'onager'
}

/**
 * Assess launch readiness from projectile metrics
 * @example
 * assessLaunchReadiness(projectile) // string
 */
export function assessLaunchReadiness(p: {
  qualityScore: number
  stability: number
  structuralIntegrity: number
  projectile: { hasCracks: boolean; willHoldTogether: boolean }
}): LaunchReadiness {
  if (p.qualityScore >= 70 && p.stability >= 60 && p.projectile.willHoldTogether) return 'go'
  if (p.qualityScore >= 50 && p.structuralIntegrity >= 40 && p.projectile.willHoldTogether) return 'go-with-caution'
  if (p.qualityScore >= 30 && !p.projectile.hasCracks) return 'hold'
  if (p.qualityScore >= 15) return 'abort'
  return 'scrub'
}

/**
 * Classify siege engine condition from health
 * @example
 * classifySiegeCondition(80) // 'battle-ready'
 */
export function classifySiegeCondition(health: number): SiegeCondition {
  if (health >= 75) return 'battle-ready'
  if (health >= 55) return 'ready'
  if (health >= 35) return 'standing-by'
  if (health >= 15) return 'needs-repair'
  return 'broken'
}

// ─── Sub-Analysis Functions ──────────────────────────────────────────────────

/**
 * Analyze arm tension (build/CI/dependency health)
 * @example
 * analyzeArmTension(content) // ArmTension
 */
export function analyzeArmTension(content: string): ArmTension {
  const loc = countLoc(content)
  const buildHealth = Math.min(100, Math.round(
    (countExports(content) > 0 ? 25 : 0) +
    (countImports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (loc > 0 && loc <= 200 ? 30 : 10),
  ))

  const ciReadiness = Math.min(100, Math.round(
    (countErrorHandling(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countTodos(content) === 0 ? 25 : 0),
  ))

  const dependencyHealth = Math.min(100, Math.round(
    (countImports(content) <= 5 ? 30 : countImports(content) <= 10 ? 15 : 0) +
    (countExports(content) > 0 ? 25 : 0) +
    (countFunctions(content) > 0 ? 20 : 0) +
    (countConsole(content) <= 1 ? 25 : 0),
  ))

  const weakPointCount = (countTodos(content) > 2 ? 1 : 0) + (countConsole(content) > 3 ? 1 : 0) + (maxNesting(content) > 5 ? 1 : 0)

  return {
    buildHealth, ciReadiness, dependencyHealth,
    hasWeakPoints: weakPointCount > 0,
    weakPointCount,
  }
}

/**
 * Analyze launch angle (architecture alignment, target accuracy)
 * @example
 * analyzeLaunchAngle(content) // LaunchAngle
 */
export function analyzeLaunchAngle(content: string): LaunchAngle {
  const architectureAlignment = Math.min(100, Math.round(
    (countExports(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countFunctions(content) > 0 ? 15 : 0) +
    (countImports(content) > 0 ? 15 : 0),
  ))

  const targetAccuracy = Math.min(100, Math.round(
    (countExports(content) > 0 ? 30 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countTodos(content) === 0 ? 20 : 0),
  ))

  const deviationDegrees = Math.max(0, Math.round(100 - (architectureAlignment + targetAccuracy) / 2))
  const isOnTarget = deviationDegrees <= 30

  return { architectureAlignment, targetAccuracy, isOnTarget, deviationDegrees }
}

/**
 * Check release mechanism (readiness checks)
 * @example
 * checkReleaseMechanism(content) // ReleaseMechanism
 */
export function checkReleaseMechanism(content: string): ReleaseMechanism {
  const hasTests = /test|spec|describe|expect|it\(/.test(content)
  const hasDocs = countComments(content) > 0
  const hasTypes = countTypeAnnotations(content) > 0
  const hasLinting = /eslint|prettier|lint/.test(content)
  const hasCI = /github|gitlab|ci|workflow/.test(content)
  const hasVersioning = /version|semver|changelog/.test(content)

  const missingChecks: string[] = []
  if (!hasTests) missingChecks.push('tests')
  if (!hasDocs) missingChecks.push('documentation')
  if (!hasTypes) missingChecks.push('type-annotations')
  if (!hasLinting) missingChecks.push('linting')
  if (!hasCI) missingChecks.push('ci-integration')
  if (!hasVersioning) missingChecks.push('versioning')

  const readinessScore = Math.min(100, Math.round(
    (hasTests ? 25 : 0) + (hasDocs ? 20 : 0) + (hasTypes ? 20 : 0) +
    (hasLinting ? 15 : 0) + (hasCI ? 10 : 0) + (hasVersioning ? 10 : 0),
  ))

  return { hasTests, hasDocs, hasTypes, hasLinting, hasCI, hasVersioning, readinessScore, missingChecks }
}

/**
 * Analyze projectile integrity (cohesion, cracks, weak spots)
 * @example
 * analyzeProjectileIntegrity(content) // ProjectileIntegrity
 */
export function analyzeProjectileIntegrity(content: string): ProjectileIntegrity {
  const loc = countLoc(content)

  const cohesion = Math.min(100, Math.round(
    (countExports(content) > 0 ? 25 : 0) +
    (countFunctions(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (loc > 0 && loc <= 150 ? 20 : 5) +
    (countImports(content) <= 5 ? 15 : 0),
  ))

  const crackCount = countTodos(content) + (countConsole(content) > 3 ? countConsole(content) - 3 : 0)
  const weakSpotCount = (maxNesting(content) > 4 ? maxNesting(content) - 4 : 0) + (countBranches(content) > 8 ? countBranches(content) - 8 : 0)

  const hasCracks = crackCount > 0
  const hasWeakSpots = weakSpotCount > 0
  const hasReinforcement = countErrorHandling(content) > 0 && countTypeAnnotations(content) > 0
  const willHoldTogether = !hasCracks && !hasWeakSpots && cohesion >= 40

  return { cohesion, hasCracks, hasWeakSpots, hasReinforcement, crackCount, weakSpotCount, willHoldTogether }
}

/**
 * Analyze trajectory (complexity, scope, execution)
 * @example
 * analyzeTrajectory(content) // Trajectory
 */
export function analyzeTrajectory(content: string): Trajectory {
  const maxHeight = Math.min(100, maxNesting(content) * 15 + countBranches(content) * 3)
  const range = Math.min(100, countFunctions(content) * 10 + countExports(content) * 8)
  const loc = countLoc(content)
  const timeOfFlight = Math.max(1, Math.round(loc / 15 + countFunctions(content) * 2 + maxNesting(content)))

  const isTumbling = maxNesting(content) > 5 || countBranches(content) > 10
  const isStable = !isTumbling && maxHeight <= 50

  const willReachTarget = isStable && countExports(content) > 0

  return { maxHeight, range, timeOfFlight, isStable, isTumbling, willReachTarget }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a projectile
 * @example
 * analyzeProjectile('export function calc() { return 1 }', 'calc.ts') // Projectile
 */
export function analyzeProjectile(content: string, filePath: string): Projectile {
  const payloadWeight = measurePayloadWeight(content)
  const structuralIntegrity = measureStructuralIntegrity(content)
  const aerodynamics = measureAerodynamics(content)
  const impactForce = measureImpactForce(content)
  const stability = measureStability(content)

  const armTension = analyzeArmTension(content)
  const launchAngle = analyzeLaunchAngle(content)
  const releaseMechanism = checkReleaseMechanism(content)
  const projectile = analyzeProjectileIntegrity(content)
  const trajectory = analyzeTrajectory(content)

  const payloadType = classifyPayloadType(content)
  const weightClass = classifyWeightClass(payloadWeight)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    structuralIntegrity * 0.25 +
    stability * 0.2 +
    aerodynamics * 0.15 +
    impactForce * 0.1 +
    (100 - payloadWeight) * 0.1 +
    armTension.buildHealth * 0.1 +
    releaseMechanism.readinessScore * 0.1,
  )))

  const launchReadiness = assessLaunchReadiness({
    qualityScore, stability, structuralIntegrity, projectile,
  })

  const isReady = launchReadiness === 'go' || launchReadiness === 'go-with-caution'

  return {
    file: filePath, payloadWeight, structuralIntegrity, aerodynamics,
    impactForce, stability, isReady, payloadType, weightClass,
    armTension, launchAngle, releaseMechanism, projectile,
    trajectory, launchReadiness, qualityScore,
  }
}

// ─── Siege Engine Analysis ───────────────────────────────────────────────────

/**
 * Analyze a directory as a siege engine
 * @example
 * analyzeSiegeEngine(projectiles, 'src') // SiegeEngine
 */
export function analyzeSiegeEngine(projectiles: Projectile[], dirPath: string): SiegeEngine {
  if (projectiles.length === 0) {
    return {
      directory: dirPath, projectiles: [], avgReadiness: 0,
      avgStructuralIntegrity: 0, avgArmTension: 0, avgLaunchAngle: 0,
      readyCount: 0, holdCount: 0, abortCount: 0, overloadedCount: 0,
      totalCracks: 0, totalWeakSpots: 0, hasReinforcement: false,
      engineType: 'scorpion', engineHealth: 0, condition: 'broken',
    }
  }

  const n = projectiles.length
  const avgReadiness = Math.round(projectiles.reduce((s, p) => s + p.qualityScore, 0) / n)
  const avgStructuralIntegrity = Math.round(projectiles.reduce((s, p) => s + p.structuralIntegrity, 0) / n)
  const avgArmTension = Math.round(projectiles.reduce((s, p) => s + p.armTension.buildHealth, 0) / n)
  const avgLaunchAngle = Math.round(projectiles.reduce((s, p) => s + p.launchAngle.architectureAlignment, 0) / n)

  const readyCount = projectiles.filter(p => p.launchReadiness === 'go' || p.launchReadiness === 'go-with-caution').length
  const holdCount = projectiles.filter(p => p.launchReadiness === 'hold').length
  const abortCount = projectiles.filter(p => p.launchReadiness === 'abort').length
  const overloadedCount = projectiles.filter(p => p.weightClass === 'overloaded').length

  const totalCracks = projectiles.reduce((s, p) => s + p.projectile.crackCount, 0)
  const totalWeakSpots = projectiles.reduce((s, p) => s + p.projectile.weakSpotCount, 0)
  const hasReinforcement = projectiles.some(p => p.projectile.hasReinforcement)

  const engineHealth = Math.round(
    avgReadiness * 0.3 + avgStructuralIntegrity * 0.25 +
    avgArmTension * 0.2 + avgLaunchAngle * 0.15 +
    (readyCount / n * 100) * 0.1,
  )

  const engineType = classifyEngineType(projectiles)
  const condition = classifySiegeCondition(engineHealth)

  return {
    directory: dirPath, projectiles, avgReadiness, avgStructuralIntegrity,
    avgArmTension, avgLaunchAngle, readyCount, holdCount, abortCount,
    overloadedCount, totalCracks, totalWeakSpots, hasReinforcement,
    engineType, engineHealth, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate catapult recommendations
 * @example
 * generateCatapultRecommendations(projectiles, engines, launchPad, stats) // string[]
 */
export function generateCatapultRecommendations(
  projectiles: Projectile[],
  engines: SiegeEngine[],
  _launchPad: LaunchPad,
  stats: CatapultStats,
): string[] {
  void _launchPad
  const recs: string[] = []

  if (stats.totalCracks > 0) {
    recs.push(`Cracks detected: ${stats.totalCracks} issues need fixing before launch`)
  }

  if (stats.totalWeakSpots > 0) {
    recs.push(`Weak spots: ${stats.totalWeakSpots} areas need reinforcement (tests, error handling)`)
  }

  if (stats.abortCount > 0 || stats.scrubCount > 0) {
    recs.push(`Abort/Scrub: ${stats.abortCount + stats.scrubCount} files are not launch-ready`)
  }

  if (stats.overloadedCount > 0) {
    recs.push(`Overloaded: ${stats.overloadedCount} files are too complex — reduce payload`)
  }

  if (stats.holdCount > 0) {
    recs.push(`On hold: ${stats.holdCount} files need attention before proceeding`)
  }

  if (stats.isClearForLaunch) {
    recs.push('Clear for launch: all systems are go')
  }

  if (stats.overallReadiness >= 60) {
    recs.push('Good readiness: codebase is generally launch-ready')
  }

  const needsRepairEngines = engines.filter(e => e.condition === 'needs-repair' || e.condition === 'broken')
  if (needsRepairEngines.length > 0) {
    recs.push(`Damaged engines: ${needsRepairEngines.length} directories need significant repair`)
  }

  const noReinforcement = projectiles.filter(p => !p.projectile.hasReinforcement).length
  if (noReinforcement > 0) {
    recs.push(`No reinforcement: ${noReinforcement} files lack error handling and types`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete catapult result from files and contents
 * @example
 * buildCatapultResult(['a.ts'], ['export function a() {}'], {}) // CatapultResult
 */
export function buildCatapultResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): CatapultResult {
  void options

  const projectiles: Projectile[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeProjectile(content, file)
    } catch {
      return analyzeProjectile('', file)
    }
  })

  const dirMap = new Map<string, Projectile[]>()
  for (const p of projectiles) {
    const dir = p.file.includes('/') ? p.file.slice(0, p.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(p) } else { dirMap.set(dir, [p]) }
  }

  const engines: SiegeEngine[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeSiegeEngine(ps, dir),
  )

  const n = projectiles.length || 1
  const avgPayloadWeight = Math.round(projectiles.reduce((s, p) => s + p.payloadWeight, 0) / n)
  const avgStructuralIntegrity = Math.round(projectiles.reduce((s, p) => s + p.structuralIntegrity, 0) / n)
  const avgAerodynamics = Math.round(projectiles.reduce((s, p) => s + p.aerodynamics, 0) / n)
  const avgStability = Math.round(projectiles.reduce((s, p) => s + p.stability, 0) / n)
  const avgArmTension = Math.round(projectiles.reduce((s, p) => s + p.armTension.buildHealth, 0) / n)
  const avgLaunchAngle = Math.round(projectiles.reduce((s, p) => s + p.launchAngle.architectureAlignment, 0) / n)
  const avgReadinessScore = Math.round(projectiles.reduce((s, p) => s + p.qualityScore, 0) / n)

  const overallReadiness = Math.round(
    avgReadinessScore * 0.3 + avgStructuralIntegrity * 0.2 +
    avgStability * 0.2 + avgArmTension * 0.15 + avgLaunchAngle * 0.15,
  )

  const goCount = projectiles.filter(p => p.launchReadiness === 'go').length
  const goWithCautionCount = projectiles.filter(p => p.launchReadiness === 'go-with-caution').length
  const holdCount = projectiles.filter(p => p.launchReadiness === 'hold').length
  const abortCount = projectiles.filter(p => p.launchReadiness === 'abort').length
  const scrubCount = projectiles.filter(p => p.launchReadiness === 'scrub').length

  const isClearForLaunch = abortCount === 0 && scrubCount === 0 && overallReadiness >= 40

  let launchWindow: LaunchPad['launchWindow'] = 'never'
  if (isClearForLaunch && holdCount === 0) launchWindow = 'now'
  else if (isClearForLaunch) launchWindow = 'soon'
  else if (overallReadiness >= 25) launchWindow = 'delayed'
  else if (overallReadiness >= 10) launchWindow = 'indefinitely'

  const launchPad: LaunchPad = {
    overallReadiness,
    avgArmTension,
    avgLaunchAngle,
    avgStructuralIntegrity,
    goCount, holdCount, abortCount,
    isClearForLaunch,
    launchWindow,
  }

  const stats: CatapultStats = {
    totalFiles: files.length,
    totalEngines: engines.length,
    avgPayloadWeight, avgStructuralIntegrity, avgAerodynamics, avgStability,
    avgArmTension, avgLaunchAngle, avgReadinessScore,
    goCount, goWithCautionCount, holdCount, abortCount, scrubCount,
    hasTests: projectiles.filter(p => p.releaseMechanism.hasTests).length,
    hasDocs: projectiles.filter(p => p.releaseMechanism.hasDocs).length,
    hasTypes: projectiles.filter(p => p.releaseMechanism.hasTypes).length,
    totalCracks: projectiles.reduce((s, p) => s + p.projectile.crackCount, 0),
    totalWeakSpots: projectiles.reduce((s, p) => s + p.projectile.weakSpotCount, 0),
    overloadedCount: projectiles.filter(p => p.weightClass === 'overloaded').length,
    isClearForLaunch,
    overallReadiness,
    commanderGrade: classifyCommanderGrade(overallReadiness),
    bestProjectile: projectiles.length > 0
      ? projectiles.reduce((b, p) => p.qualityScore > b.qualityScore ? p : b, projectiles[0] as typeof projectiles[number]).file : 'none',
    worstProjectile: projectiles.length > 0
      ? projectiles.reduce((w, p) => p.qualityScore < w.qualityScore ? p : w, projectiles[0] as typeof projectiles[number]).file : 'none',
    heaviestPayload: projectiles.length > 0
      ? projectiles.reduce((h, p) => p.payloadWeight > h.payloadWeight ? p : h, projectiles[0] as typeof projectiles[number]).file : 'none',
    mostReady: projectiles.length > 0
      ? projectiles.reduce((m, p) => p.qualityScore > m.qualityScore ? p : m, projectiles[0] as typeof projectiles[number]).file : 'none',
    leastReady: projectiles.length > 0
      ? projectiles.reduce((l, p) => p.qualityScore < l.qualityScore ? p : l, projectiles[0] as typeof projectiles[number]).file : 'none',
  }

  const recommendations = generateCatapultRecommendations(projectiles, engines, launchPad, stats)

  return { projectiles, engines, launchPad, stats, recommendations }
}
