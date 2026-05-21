// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Displacement {
  engineering: number
  abstraction: number
  coupling: number
  documentation: number
  testing: number
  complexity: number
}

export interface OscillationInfo {
  isBalanced: boolean
  isSwinging: boolean
  isStuck: boolean
  isChaotic: boolean
  swingDirection: 'left' | 'center' | 'right' | 'oscillating'
  maxDisplacement: number
}

export interface EquilibriumIdeal {
  engineering: number
  abstraction: number
  coupling: number
  documentation: number
  testing: number
  complexity: number
}

export interface DeviationInfo {
  fromIdeal: number
  isDeviating: boolean
  deviationAxes: string[]
  largestDeviation: string
}

export interface EnergyInfo {
  kinetic: number
  potential: number
  total: number
  isConserved: boolean
}

export type SwingPattern = 'simple-harmonic' | 'damped' | 'forced' | 'chaotic' | 'overdamped' | 'critically-damped'
export type SwingPhase = 'rising' | 'peak-left' | 'falling' | 'peak-right' | 'equilibrium' | 'static'
export type PendulumType = 'simple' | 'compound' | 'physical' | 'conical' | 'torsional' | 'foucault'
export type SwingCondition = 'perfectly-timed' | 'well-regulated' | 'steady' | 'wobbling' | 'chaotic' | 'broken'

export interface PendulumSwing {
  file: string
  equilibrium: number
  amplitude: number
  frequency: number
  damping: number
  period: number
  currentDisplacement: number
  displacement: Displacement
  swingPattern: SwingPattern
  oscillation: OscillationInfo
  equilibriumIdeal: EquilibriumIdeal
  deviation: DeviationInfo
  phase: SwingPhase
  energy: EnergyInfo
  pendulumType: PendulumType
  condition: SwingCondition
  qualityScore: number
}

export type ClockCondition = 'precision-clock' | 'clock' | 'timepiece' | 'sundial' | 'hourglass' | 'stopped'

export interface PendulumClock {
  directory: string
  swings: PendulumSwing[]
  avgEquilibrium: number
  avgAmplitude: number
  avgDamping: number
  avgDeviation: number
  balancedCount: number
  chaoticCount: number
  stuckCount: number
  dominantPattern: string
  clockAccuracy: number
  isRegulated: boolean
  isRunning: boolean
  isBroken: boolean
  condition: ClockCondition
  clockQuality: number
}

export interface SystemInfo {
  avgEquilibrium: number
  avgAmplitude: number
  avgDeviation: number
  totalEnergy: number
  isSystemStable: boolean
  dominantOscillation: string
}

export type HorologistGrade = 'master-horologist' | 'horologist' | 'watchmaker' | 'clockmaker' | 'tinkerer' | 'child'

export interface PendulumStats {
  totalFiles: number
  totalClocks: number
  avgEquilibrium: number
  avgAmplitude: number
  avgFrequency: number
  avgDamping: number
  avgPeriod: number
  avgDeviation: number
  avgEnergy: number
  balancedFiles: number
  swingingFiles: number
  stuckFiles: number
  chaoticFiles: number
  simpleHarmonic: number
  damped: number
  forced: number
  chaotic: number
  overEngineered: number
  underEngineered: number
  overAbstract: number
  tooConcrete: number
  overCoupled: number
  isolated: number
  totalDeviation: number
  overallBalance: number
  horologistGrade: HorologistGrade
  mostBalanced: string
  leastBalanced: string
  mostChaotic: string
  bestRegulated: string
}

export interface PendulumResult {
  swings: PendulumSwing[]
  clocks: PendulumClock[]
  system: SystemInfo
  stats: PendulumStats
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

// ─── Displacement Computation ────────────────────────────────────────────────

/**
 * Compute displacement along each axis
 * @example
 * computeDisplacement('export function a() {}') // Displacement
 */
export function computeDisplacement(content: string): Displacement {
  const loc = countLoc(content)
  if (loc === 0) {
    return { engineering: 0, abstraction: 0, coupling: 0, documentation: 0, testing: 0, complexity: 0 }
  }

  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const errorHandling = countErrorHandling(content)
  const comments = countComments(content)
  const console_ = countConsole(content)
  const todos = countTodos(content)

  const engineering = Math.max(-100, Math.min(100, Math.round(
    (functions > 10 ? 40 : functions > 5 ? 20 : 0) +
    (types > 8 ? 30 : types > 3 ? 15 : 0) +
    (nesting > 5 ? 30 : 0) -
    (errorHandling === 0 && loc > 30 ? -20 : 0),
  )))

  const abstraction = Math.max(-100, Math.min(100, Math.round(
    (types > 5 ? 30 : types > 2 ? 15 : 0) +
    (/interface\s+\w/.test(content) ? 20 : 0) +
    (/type\s+\w+\s*=/.test(content) ? 15 : 0) +
    (exports > 5 ? 20 : 0) +
    (/class\s+\w/.test(content) ? 15 : 0) -
    (functions > 0 && types === 0 ? 30 : 0),
  )))

  const coupling = Math.max(-100, Math.min(100, Math.round(
    (imports > 5 ? 30 : imports > 2 ? 15 : 0) +
    (exports > 5 ? 25 : exports > 2 ? 12 : 0) +
    (functions > 8 ? 20 : 0) -
    (imports === 0 && loc > 30 ? -25 : 0),
  )))

  const documentation = Math.max(-100, Math.min(100, Math.round(
    (comments > 10 ? 30 : comments > 5 ? 15 : 0) +
    (/\/\*\*/.test(content) ? 25 : 0) +
    (/@example/.test(content) ? 15 : 0) +
    (comments > loc * 0.5 ? 20 : 0) -
    (comments === 0 && loc > 20 ? -30 : 0),
  )))

  const testing = Math.max(-100, Math.min(100, Math.round(
    (errorHandling > 3 ? 30 : errorHandling > 1 ? 15 : 0) +
    (/test|describe|expect|it\(/.test(content) ? 30 : 0) +
    (branches > 5 ? 15 : 0) -
    (errorHandling === 0 && functions > 2 ? -25 : 0),
  )))

  const complexity = Math.max(-100, Math.min(100, Math.round(
    (nesting > 4 ? 25 : 0) +
    (branches > 8 ? 25 : branches > 4 ? 12 : 0) +
    (loc > 200 ? 20 : 0) +
    (console_ > 3 ? 15 : 0) +
    (todos > 2 ? 10 : 0) -
    (branches <= 2 && nesting <= 2 ? -20 : 0),
  )))

  return { engineering, abstraction, coupling, documentation, testing, complexity }
}

// ─── Equilibrium & Deviation ─────────────────────────────────────────────────

const EQUILIBRIUM_IDEAL: EquilibriumIdeal = {
  engineering: 20,
  abstraction: 15,
  coupling: 10,
  documentation: 10,
  testing: 20,
  complexity: -10,
}

/**
 * Compute equilibrium point from displacement
 * @example
 * computeEquilibrium(displacement) // number
 */
export function computeEquilibrium(d: Displacement): number {
  const avg = (d.engineering + d.abstraction + d.coupling + d.documentation + d.testing + d.complexity) / 6
  return Math.max(0, Math.min(100, Math.round(50 + (50 - Math.abs(avg)) / 2)))
}

/**
 * Compute deviation from ideal
 * @example
 * computeDeviation(displacement) // DeviationInfo
 */
export function computeDeviation(d: Displacement): DeviationInfo {
  const axes = [
    { name: 'engineering', diff: Math.abs(d.engineering - EQUILIBRIUM_IDEAL.engineering) },
    { name: 'abstraction', diff: Math.abs(d.abstraction - EQUILIBRIUM_IDEAL.abstraction) },
    { name: 'coupling', diff: Math.abs(d.coupling - EQUILIBRIUM_IDEAL.coupling) },
    { name: 'documentation', diff: Math.abs(d.documentation - EQUILIBRIUM_IDEAL.documentation) },
    { name: 'testing', diff: Math.abs(d.testing - EQUILIBRIUM_IDEAL.testing) },
    { name: 'complexity', diff: Math.abs(d.complexity - EQUILIBRIUM_IDEAL.complexity) },
  ]

  const fromIdeal = Math.min(100, Math.round(axes.reduce((s, a) => s + a.diff, 0) / axes.length))
  const deviationAxes = axes.filter(a => a.diff > 30).map(a => a.name)
  const sorted = Array.from(axes).sort((a, b) => b.diff - a.diff)
  const largestDeviation = sorted[0]?.name ?? 'none'

  return {
    fromIdeal, isDeviating: fromIdeal > 30,
    deviationAxes, largestDeviation,
  }
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify swing pattern from amplitude, damping, frequency
 * @example
 * classifySwingPattern(20, 70, 30) // string
 */
export function classifySwingPattern(amplitude: number, damping: number, _frequency: number): SwingPattern {
  void _frequency
  if (amplitude < 15 && damping > 70) return 'critically-damped'
  if (amplitude < 25) return 'simple-harmonic'
  if (damping > 60) return 'overdamped'
  if (damping > 40) return 'damped'
  if (amplitude > 60 && damping < 20) return 'chaotic'
  return 'forced'
}

/**
 * Classify pendulum type from content
 * @example
 * classifyPendulumType('export class X {}') // string
 */
export function classifyPendulumType(content: string): PendulumType {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /interface\s+\w/.test(content)
  const types = countTypeAnnotations(content)

  if (hasInterface && hasClass && exports > 3) return 'foucault'
  if (hasClass && imports > 1) return 'compound'
  if (types > 3 && exports > 2) return 'physical'
  if (exports > 1 && imports > 0 && types > 0) return 'conical'
  if (functions > 2 && exports === 0) return 'torsional'
  return 'simple'
}

/**
 * Classify swing condition from quality
 * @example
 * classifySwingCondition(80) // 'well-regulated'
 */
export function classifySwingCondition(quality: number): SwingCondition {
  if (quality >= 85) return 'perfectly-timed'
  if (quality >= 65) return 'well-regulated'
  if (quality >= 45) return 'steady'
  if (quality >= 25) return 'wobbling'
  if (quality >= 10) return 'chaotic'
  return 'broken'
}

/**
 * Classify clock condition from quality
 * @example
 * classifyClockCondition(80) // 'clock'
 */
export function classifyClockCondition(quality: number): ClockCondition {
  if (quality >= 80) return 'precision-clock'
  if (quality >= 60) return 'clock'
  if (quality >= 40) return 'timepiece'
  if (quality >= 25) return 'sundial'
  if (quality >= 10) return 'hourglass'
  return 'stopped'
}

/**
 * Classify horologist grade
 * @example
 * classifyHorologistGrade(80) // 'horologist'
 */
export function classifyHorologistGrade(avgBalance: number): HorologistGrade {
  if (avgBalance >= 75) return 'master-horologist'
  if (avgBalance >= 60) return 'horologist'
  if (avgBalance >= 45) return 'watchmaker'
  if (avgBalance >= 30) return 'clockmaker'
  if (avgBalance >= 15) return 'tinkerer'
  return 'child'
}

// ─── Energy Measurement ──────────────────────────────────────────────────────

/**
 * Measure energy of a pendulum swing
 * @example
 * measureEnergy(amplitude, frequency, equilibrium) // EnergyInfo
 */
export function measureEnergy(amplitude: number, frequency: number, equilibrium: number): EnergyInfo {
  const kinetic = Math.min(100, Math.round(frequency * 0.5 + amplitude * 0.3))
  const potential = Math.min(100, Math.round((100 - equilibrium) * 0.4 + amplitude * 0.3))
  const total = Math.min(100, Math.round((kinetic + potential) / 2))
  const isConserved = Math.abs(kinetic - potential) <= 30

  return { kinetic, potential, total, isConserved }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a pendulum swing
 * @example
 * analyzePendulumSwing('export function a() {}', 'a.ts') // PendulumSwing
 */
export function analyzePendulumSwing(content: string, filePath: string): PendulumSwing {
  const displacement = computeDisplacement(content)
  const loc = countLoc(content)

  const equilibrium = computeEquilibrium(displacement)
  const amplitude = Math.min(100, Math.round(
    Math.abs(displacement.engineering) * 0.2 +
    Math.abs(displacement.abstraction) * 0.2 +
    Math.abs(displacement.coupling) * 0.15 +
    Math.abs(displacement.documentation) * 0.15 +
    Math.abs(displacement.testing) * 0.15 +
    Math.abs(displacement.complexity) * 0.15,
  ))
  const frequency = Math.min(100, Math.round(
    (countBranches(content) * 4) +
    (countFunctions(content) * 3) +
    (loc > 0 ? Math.min(20, loc * 0.1) : 0),
  ))
  const damping = Math.min(100, Math.max(0, Math.round(
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (maxNesting(content) <= 3 ? 20 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))
  const period = Math.max(1, Math.round(loc / Math.max(1, countFunctions(content) + countExports(content))))

  const currentDisplacement = Math.max(-100, Math.min(100, Math.round(
    (displacement.engineering + displacement.abstraction + displacement.coupling +
     displacement.documentation + displacement.testing + displacement.complexity) / 6,
  )))

  const swingPattern = classifySwingPattern(amplitude, damping, frequency)
  const pendulumType = classifyPendulumType(content)

  const isBalanced = amplitude < 25
  const isSwinging = amplitude >= 15 && amplitude < 60
  const isStuck = loc === 0 || (amplitude < 5)
  const isChaotic = amplitude > 60 && damping < 20
  const maxDisplacement = Math.max(
    Math.abs(displacement.engineering), Math.abs(displacement.abstraction),
    Math.abs(displacement.coupling), Math.abs(displacement.documentation),
    Math.abs(displacement.testing), Math.abs(displacement.complexity),
  )

  let swingDirection: OscillationInfo['swingDirection'] = 'center'
  if (currentDisplacement < -15) swingDirection = 'left'
  else if (currentDisplacement > 15) swingDirection = 'right'
  else if (amplitude > 25) swingDirection = 'oscillating'

  const oscillation: OscillationInfo = {
    isBalanced, isSwinging, isStuck, isChaotic, swingDirection, maxDisplacement,
  }

  const deviation = computeDeviation(displacement)

  let phase: SwingPhase = 'static'
  if (isStuck) phase = 'static'
  else if (isBalanced) phase = 'equilibrium'
  else if (currentDisplacement < -20) phase = 'peak-left'
  else if (currentDisplacement > 20) phase = 'peak-right'
  else if (Math.abs(currentDisplacement) <= 20 && amplitude > 15) phase = 'rising'
  else phase = 'falling'

  const energy = measureEnergy(amplitude, frequency, equilibrium)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    equilibrium * 0.3 +
    (100 - amplitude) * 0.2 +
    damping * 0.2 +
    (100 - deviation.fromIdeal) * 0.15 +
    (energy.isConserved ? 15 : 5),
  )))

  const condition = classifySwingCondition(qualityScore)

  return {
    file: filePath, equilibrium, amplitude, frequency, damping, period,
    currentDisplacement, displacement, swingPattern, oscillation,
    equilibriumIdeal: { ...EQUILIBRIUM_IDEAL }, deviation, phase, energy,
    pendulumType, condition, qualityScore,
  }
}

// ─── Clock Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a pendulum clock
 * @example
 * analyzePendulumClock(swings, 'src') // PendulumClock
 */
export function analyzePendulumClock(swings: PendulumSwing[], dirPath: string): PendulumClock {
  if (swings.length === 0) {
    return {
      directory: dirPath, swings: [], avgEquilibrium: 0, avgAmplitude: 0,
      avgDamping: 0, avgDeviation: 0, balancedCount: 0, chaoticCount: 0,
      stuckCount: 0, dominantPattern: 'simple-harmonic', clockAccuracy: 0,
      isRegulated: false, isRunning: false, isBroken: true,
      condition: 'stopped', clockQuality: 0,
    }
  }

  const n = swings.length
  const avgEquilibrium = Math.round(swings.reduce((s, w) => s + w.equilibrium, 0) / n)
  const avgAmplitude = Math.round(swings.reduce((s, w) => s + w.amplitude, 0) / n)
  const avgDamping = Math.round(swings.reduce((s, w) => s + w.damping, 0) / n)
  const avgDeviation = Math.round(swings.reduce((s, w) => s + w.deviation.fromIdeal, 0) / n)

  const balancedCount = swings.filter(s => s.oscillation.isBalanced).length
  const chaoticCount = swings.filter(s => s.oscillation.isChaotic).length
  const stuckCount = swings.filter(s => s.oscillation.isStuck).length

  const patternCounts: Record<string, number> = {}
  for (const s of swings) {
    patternCounts[s.swingPattern] = (patternCounts[s.swingPattern] ?? 0) + 1
  }
  const dominantPattern = Array.from(Object.entries(patternCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'simple-harmonic'

  const clockAccuracy = Math.min(100, Math.round(
    avgEquilibrium * 0.3 + avgDamping * 0.25 +
    (100 - avgAmplitude) * 0.2 + (100 - avgDeviation) * 0.15 +
    (balancedCount / n * 100) * 0.1,
  ))

  const isRegulated = avgDamping >= 50 && avgDeviation <= 30
  const isRunning = stuckCount < n
  const isBroken = stuckCount === n || avgEquilibrium < 10

  const clockQuality = Math.min(100, Math.round(
    clockAccuracy * 0.4 + avgEquilibrium * 0.2 + avgDamping * 0.2 +
    (100 - avgDeviation) * 0.1 + (isRegulated ? 10 : 0),
  ))

  const condition = classifyClockCondition(clockQuality)

  return {
    directory: dirPath, swings, avgEquilibrium, avgAmplitude, avgDamping,
    avgDeviation, balancedCount, chaoticCount, stuckCount,
    dominantPattern, clockAccuracy, isRegulated, isRunning, isBroken,
    condition, clockQuality,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate pendulum recommendations
 * @example
 * generateRecommendations(swings, clocks, system, stats) // string[]
 */
export function generateRecommendations(
  swings: PendulumSwing[],
  _clocks: PendulumClock[],
  _system: SystemInfo,
  stats: PendulumStats,
): string[] {
  void _clocks
  void _system
  const recs: string[] = []

  if (stats.chaoticFiles > stats.totalFiles * 0.3) {
    recs.push(`Chaotic oscillation: ${stats.chaoticFiles} files are swinging wildly`)
  }

  if (stats.overEngineered > stats.underEngineered && stats.overEngineered > 2) {
    recs.push(`Over-engineering detected: ${stats.overEngineered} files swing too far right`)
  }

  if (stats.underEngineered > stats.overEngineered && stats.underEngineered > 2) {
    recs.push(`Under-engineering detected: ${stats.underEngineered} files lack sufficient structure`)
  }

  if (stats.overCoupled > 3) {
    recs.push(`Over-coupling: ${stats.overCoupled} files are too tightly connected`)
  }

  if (stats.isolated > 3) {
    recs.push(`Isolation: ${stats.isolated} files are disconnected from the system`)
  }

  if (stats.stuckFiles > stats.totalFiles * 0.3) {
    recs.push(`Static files: ${stats.stuckFiles} files show no oscillation — are they dead code?`)
  }

  if (stats.overallBalance >= 60) {
    recs.push('Good balance: the pendulum system is well-regulated')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete pendulum result from files and contents
 * @example
 * buildPendulumResult(['a.ts'], ['export function a() {}'], {}) // PendulumResult
 */
export function buildPendulumResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): PendulumResult {
  void options

  const swings: PendulumSwing[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzePendulumSwing(content, file)
    } catch {
      return analyzePendulumSwing('', file)
    }
  })

  const dirMap = new Map<string, PendulumSwing[]>()
  for (const s of swings) {
    const dir = s.file.includes('/') ? s.file.slice(0, s.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(s) } else { dirMap.set(dir, [s]) }
  }

  const clocks: PendulumClock[] = Array.from(dirMap.entries()).map(([dir, sw]) =>
    analyzePendulumClock(sw, dir),
  )

  const n = swings.length || 1
  const avgEquilibrium = Math.round(swings.reduce((s, w) => s + w.equilibrium, 0) / n)
  const avgAmplitude = Math.round(swings.reduce((s, w) => s + w.amplitude, 0) / n)
  const avgFrequency = Math.round(swings.reduce((s, w) => s + w.frequency, 0) / n)
  const avgDamping = Math.round(swings.reduce((s, w) => s + w.damping, 0) / n)
  const avgPeriod = Math.round(swings.reduce((s, w) => s + w.period, 0) / n)
  const avgDeviation = Math.round(swings.reduce((s, w) => s + w.deviation.fromIdeal, 0) / n)
  const avgEnergy = Math.round(swings.reduce((s, w) => s + w.energy.total, 0) / n)

  const totalEnergy = Math.min(100, Math.round(swings.reduce((s, w) => s + w.energy.total, 0) / n))

  const patternCounts: Record<string, number> = {}
  for (const s of swings) {
    patternCounts[s.swingPattern] = (patternCounts[s.swingPattern] ?? 0) + 1
  }
  const dominantOscillation = Array.from(Object.entries(patternCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'simple-harmonic'

  const isSystemStable = avgAmplitude < 40 && avgDamping > 40

  const system: SystemInfo = {
    avgEquilibrium, avgAmplitude, avgDeviation,
    totalEnergy, isSystemStable, dominantOscillation,
  }

  const overallBalance = Math.min(100, Math.round(
    avgEquilibrium * 0.3 +
    avgDamping * 0.2 +
    (100 - avgDeviation) * 0.2 +
    (100 - avgAmplitude) * 0.15 +
    (isSystemStable ? 15 : 0),
  ))

  const stats: PendulumStats = {
    totalFiles: files.length,
    totalClocks: clocks.length,
    avgEquilibrium, avgAmplitude, avgFrequency, avgDamping, avgPeriod,
    avgDeviation, avgEnergy,
    balancedFiles: swings.filter(s => s.oscillation.isBalanced).length,
    swingingFiles: swings.filter(s => s.oscillation.isSwinging).length,
    stuckFiles: swings.filter(s => s.oscillation.isStuck).length,
    chaoticFiles: swings.filter(s => s.oscillation.isChaotic).length,
    simpleHarmonic: swings.filter(s => s.swingPattern === 'simple-harmonic').length,
    damped: swings.filter(s => s.swingPattern === 'damped').length,
    forced: swings.filter(s => s.swingPattern === 'forced').length,
    chaotic: swings.filter(s => s.swingPattern === 'chaotic').length,
    overEngineered: swings.filter(s => s.displacement.engineering > 40).length,
    underEngineered: swings.filter(s => s.displacement.engineering < -20).length,
    overAbstract: swings.filter(s => s.displacement.abstraction > 40).length,
    tooConcrete: swings.filter(s => s.displacement.abstraction < -20).length,
    overCoupled: swings.filter(s => s.displacement.coupling > 40).length,
    isolated: swings.filter(s => s.displacement.coupling < -20).length,
    totalDeviation: Math.round(swings.reduce((s, w) => s + w.deviation.fromIdeal, 0)),
    overallBalance,
    horologistGrade: classifyHorologistGrade(overallBalance),
    mostBalanced: swings.length > 0
      ? swings.reduce((b, s) => s.deviation.fromIdeal < b.deviation.fromIdeal ? s : b, swings[0]).file : 'none',
    leastBalanced: swings.length > 0
      ? swings.reduce((b, s) => s.deviation.fromIdeal > b.deviation.fromIdeal ? s : b, swings[0]).file : 'none',
    mostChaotic: swings.length > 0
      ? swings.reduce((b, s) => s.amplitude > b.amplitude ? s : b, swings[0]).file : 'none',
    bestRegulated: clocks.length > 0
      ? clocks.reduce((b, c) => c.clockQuality > b.clockQuality ? c : b, clocks[0]).directory : 'none',
  }

  const recommendations = generateRecommendations(swings, clocks, system, stats)

  return { swings, clocks, system, stats, recommendations }
}
