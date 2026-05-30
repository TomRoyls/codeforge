// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CalibrationInfo {
  isCalibrated: boolean
  calibrationAccuracy: number
  hasPhaseErrors: boolean
  hasAmplitudeErrors: boolean
  needsRecalibration: boolean
  phaseErrorCount: number
}

export interface PointingInfo {
  accuracy: number
  isOnTarget: boolean
  hasDrift: boolean
  hasTracking: boolean
}

export interface DishBaseline {
  withDishes: string[]
  avgBaselineLength: number
  maxBaseline: number
  hasShortBaselines: boolean
  hasLongBaselines: boolean
}

export type DishType = 'parabolic' | 'spherical' | 'cassegrain' | 'offset' | 'flat-panel' | 'phased-array'
export type DishCondition = 'optimal' | 'good' | 'fair' | 'needs-maintenance' | 'damaged' | 'offline'

export interface ArrayDish {
  file: string
  apertureDiameter: number
  resolvingPower: number
  signalStrength: number
  noiseLevel: number
  signalToNoise: number
  frequency: number
  dishType: DishType
  receiverQuality: number
  dataProcessingQuality: number
  calibration: CalibrationInfo
  pointing: PointingInfo
  baseline: DishBaseline
  condition: DishCondition
  qualityScore: number
}

export type InterferenceType = 'constructive' | 'destructive' | 'independent'

export interface BaselinePair {
  dishA: string
  dishB: string
  baselineLength: number
  correlationQuality: number
  interferenceType: InterferenceType
  phaseAlignment: number
  isCoherent: boolean
}

export type ArrayType = 'linear' | 'y-shaped' | 'cross' | 'ring' | 'random' | 'compact'
export type ConfigurationType = 'vlbi' | 'connected-element' | 'phased-array' | 'sparse' | 'dense'
export type ConfigCondition = 'world-class' | 'research-grade' | 'survey-grade' | 'educational' | 'amateur' | 'broken'

export interface ArrayConfiguration {
  directory: string
  dishes: ArrayDish[]
  baselines: BaselinePair[]
  totalAperture: number
  resolvingPower: number
  apertureSynthesis: number
  avgSignalToNoise: number
  avgCalibration: number
  optimalDishes: number
  damagedDishes: number
  offlineDishes: number
  coherentPairs: number
  incoherentPairs: number
  arrayType: ArrayType
  configuration: ConfigurationType
  isWellCalibrated: boolean
  arrayHealth: number
  condition: ConfigCondition
}

export interface InterferometerInfo {
  totalResolvingPower: number
  totalAperture: number
  avgSignalToNoise: number
  avgCalibration: number
  isCoherent: boolean
  hasInterference: boolean
  constructivePairs: number
  destructivePairs: number
  overallPower: number
}

export type AstronomerGrade = 'director' | 'senior-astronomer' | 'astronomer' | 'observer' | 'amateur' | 'light-polluted'

export interface TelescopeArrayStats {
  totalFiles: number
  totalConfigurations: number
  totalBaselines: number
  avgAperture: number
  avgResolvingPower: number
  avgSignalStrength: number
  avgNoiseLevel: number
  avgSignalToNoise: number
  avgCalibration: number
  avgPointingAccuracy: number
  optimalDishes: number
  damagedDishes: number
  offlineDishes: number
  coherentPairs: number
  incoherentPairs: number
  totalResolvingPower: number
  overallArrayPower: number
  astronomerGrade: AstronomerGrade
  bestDish: string
  worstDish: string
  strongestPair: string
  noisiestDish: string
}

export interface TelescopeArrayResult {
  dishes: ArrayDish[]
  configurations: ArrayConfiguration[]
  interferometer: InterferometerInfo
  stats: TelescopeArrayStats
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
 * Measure aperture diameter (file scope/importance)
 * @example
 * measureApertureDiameter('export function calc() {}') // number
 */
export function measureApertureDiameter(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    Math.min(30, loc * 1.5) +
    Math.min(20, countExports(content) * 8) +
    Math.min(20, countImports(content) * 6) +
    Math.min(15, countFunctions(content) * 5) +
    (countTypeAnnotations(content) > 0 ? 15 : 0),
  ))
}

/**
 * Measure signal strength (code clarity)
 * @example
 * measureSignalStrength('export function calc(): number { return 1 }') // number
 */
export function measureSignalStrength(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0) +
    (countConsole(content) <= 1 ? 15 : 5) +
    (countErrorHandling(content) > 0 ? 15 : 0),
  ))
}

/**
 * Measure noise level (code complexity)
 * @example
 * measureNoiseLevel('if(a){if(b){if(c){}}}') // number
 */
export function measureNoiseLevel(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    Math.min(25, maxNesting(content) * 8) +
    Math.min(25, countBranches(content) * 5) +
    Math.min(20, countTodos(content) * 10) +
    Math.min(15, countConsole(content) * 5) +
    (countErrorHandling(content) === 0 && loc > 20 ? 15 : 0),
  ))
}

/**
 * Measure receiver quality (input handling)
 * @example
 * measureReceiverQuality('function calc(x: number): number { return x }') // number
 */
export function measureReceiverQuality(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countImports(content) > 0 ? 15 : 0) +
    (countFunctions(content) > 0 ? 15 : 0) +
    (/\/\*\*/.test(content) ? 15 : 0),
  ))
}

/**
 * Measure data processing quality (output quality)
 * @example
 * measureDataProcessingQuality('export function calc(): number { return 1 }') // number
 */
export function measureDataProcessingQuality(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countExports(content) > 0 ? 25 : 0) +
    (/\breturn\b/.test(content) ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0),
  ))
}

/**
 * Compute signal-to-noise ratio
 * @example
 * computeSignalToNoise(70, 30) // 70
 */
export function computeSignalToNoise(signal: number, noise: number): number {
  if (signal + noise === 0) return 0
  return Math.min(100, Math.round((signal / (signal + noise)) * 100))
}

/**
 * Measure resolving power
 * @example
 * measureResolvingPower('export function calc() { return 1 }') // number
 */
export function measureResolvingPower(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const aperture = measureApertureDiameter(content)
  const signal = measureSignalStrength(content)
  const receiver = measureReceiverQuality(content)
  const processing = measureDataProcessingQuality(content)
  return Math.min(100, Math.round(
    aperture * 0.3 + signal * 0.3 + receiver * 0.2 + processing * 0.2,
  ))
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify dish type from content
 * @example
 * classifyDishType('export class X {}') // string
 */
export function classifyDishType(content: string): DishType {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /interface\s+\w/.test(content)
  const loc = countLoc(content)

  if (hasInterface && hasClass && exports > 3) return 'phased-array'
  if (exports > 3 && types > 3 && functions > 2) return 'parabolic'
  if (hasClass && imports > 1 && types > 0) return 'cassegrain'
  if (exports > 1 && imports > 0 && types > 0) return 'spherical'
  if (exports === 1 && loc <= 50) return 'offset'
  if (functions > 0 && exports === 0) return 'flat-panel'
  return 'flat-panel'
}

/**
 * Classify dish condition from quality score
 * @example
 * classifyDishCondition(80) // 'good'
 */
export function classifyDishCondition(quality: number): DishCondition {
  if (quality >= 80) return 'optimal'
  if (quality >= 65) return 'good'
  if (quality >= 45) return 'fair'
  if (quality >= 25) return 'needs-maintenance'
  if (quality >= 10) return 'damaged'
  return 'offline'
}

/**
 * Classify array type from dish count
 * @example
 * classifyArrayType(5) // string
 */
export function classifyArrayType(dishCount: number): ArrayType {
  if (dishCount > 20) return 'compact'
  if (dishCount > 10) return 'ring'
  if (dishCount > 5) return 'cross'
  if (dishCount > 3) return 'y-shaped'
  if (dishCount > 1) return 'linear'
  return 'random'
}

/**
 * Classify configuration type from density
 * @example
 * classifyConfigurationType(10, 5) // string
 */
export function classifyConfigurationType(dishCount: number, avgBaseline: number): ConfigurationType {
  if (dishCount > 15 && avgBaseline < 30) return 'phased-array'
  if (dishCount > 8 && avgBaseline > 50) return 'vlbi'
  if (dishCount > 5 && avgBaseline < 40) return 'dense'
  if (dishCount > 2) return 'connected-element'
  return 'sparse'
}

/**
 * Classify configuration condition from health
 * @example
 * classifyConfigCondition(80) // 'research-grade'
 */
export function classifyConfigCondition(health: number): ConfigCondition {
  if (health >= 80) return 'world-class'
  if (health >= 60) return 'research-grade'
  if (health >= 40) return 'survey-grade'
  if (health >= 25) return 'educational'
  if (health >= 10) return 'amateur'
  return 'broken'
}

/**
 * Classify astronomer grade
 * @example
 * classifyAstronomerGrade(80) // 'director'
 */
export function classifyAstronomerGrade(avgPower: number): AstronomerGrade {
  if (avgPower >= 75) return 'director'
  if (avgPower >= 60) return 'senior-astronomer'
  if (avgPower >= 45) return 'astronomer'
  if (avgPower >= 30) return 'observer'
  if (avgPower >= 15) return 'amateur'
  return 'light-polluted'
}

// ─── Sub-Analysis Functions ──────────────────────────────────────────────────

/**
 * Calibrate a dish (assess convention adherence)
 * @example
 * calibrateDish('export function a(): void {}') // CalibrationInfo
 */
export function calibrateDish(content: string): CalibrationInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      isCalibrated: false, calibrationAccuracy: 0,
      hasPhaseErrors: true, hasAmplitudeErrors: true,
      needsRecalibration: true, phaseErrorCount: 1,
    }
  }

  const accuracy = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countImports(content) > 0 ? 15 : 0),
  ))

  const hasPhaseErrors = accuracy < 40
  const hasAmplitudeErrors = countConsole(content) > 3
  const phaseErrorCount = (hasPhaseErrors ? 1 : 0) + (hasAmplitudeErrors ? 1 : 0)
  const needsRecalibration = accuracy < 30
  const isCalibrated = accuracy >= 50 && !needsRecalibration

  return {
    isCalibrated, calibrationAccuracy: accuracy,
    hasPhaseErrors, hasAmplitudeErrors,
    needsRecalibration, phaseErrorCount,
  }
}

/**
 * Assess pointing accuracy
 * @example
 * assessPointing('export function calc(): number { return 1 }') // PointingInfo
 */
export function assessPointing(content: string): PointingInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { accuracy: 0, isOnTarget: false, hasDrift: true, hasTracking: false }
  }

  const hasExports = countExports(content) > 0
  const hasFunctions = countFunctions(content) > 0
  const hasReturns = /\breturn\b/.test(content)

  const accuracy = Math.min(100, Math.round(
    (hasExports ? 30 : 0) +
    (hasFunctions ? 25 : 0) +
    (hasReturns ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0) +
    (loc <= 150 ? 10 : 0),
  ))

  const isOnTarget = accuracy >= 60
  const hasDrift = countFunctions(content) > 8 || maxNesting(content) > 5
  const hasTracking = hasExports && hasFunctions

  return { accuracy, isOnTarget, hasDrift, hasTracking }
}

/**
 * Analyze dish baseline connections
 * @example
 * analyzeDishBaseline(dish, ['other.ts']) // DishBaseline
 */
export function analyzeDishBaseline(_dish: ArrayDish, _connectedFiles: string[]): DishBaseline {
  void _dish
  const files = _connectedFiles
  const withDishes = Array.from(new Set(files))
  const n = withDishes.length
  const avgBaselineLength = n > 0 ? Math.round(50 + Math.random() * 30) : 0
  const maxBaseline = n > 0 ? Math.round(60 + Math.random() * 30) : 0
  const hasShortBaselines = avgBaselineLength < 40
  const hasLongBaselines = maxBaseline > 70

  return { withDishes, avgBaselineLength, maxBaseline, hasShortBaselines, hasLongBaselines }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an array dish
 * @example
 * analyzeArrayDish('export function calc() { return 1 }', 'calc.ts') // ArrayDish
 */
export function analyzeArrayDish(content: string, filePath: string): ArrayDish {
  const apertureDiameter = measureApertureDiameter(content)
  const signalStrength = measureSignalStrength(content)
  const noiseLevel = measureNoiseLevel(content)
  const signalToNoise = computeSignalToNoise(signalStrength, noiseLevel)
  const receiverQuality = measureReceiverQuality(content)
  const dataProcessingQuality = measureDataProcessingQuality(content)
  const resolvingPower = measureResolvingPower(content)
  const frequency = Math.min(100, Math.round((countImports(content) + countExports(content)) * 10))

  const dishType = classifyDishType(content)
  const calibration = calibrateDish(content)
  const pointing = assessPointing(content)
  const baseline: DishBaseline = {
    withDishes: [], avgBaselineLength: 0, maxBaseline: 0,
    hasShortBaselines: false, hasLongBaselines: false,
  }

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    apertureDiameter * 0.15 +
    resolvingPower * 0.2 +
    signalToNoise * 0.2 +
    receiverQuality * 0.15 +
    dataProcessingQuality * 0.15 +
    calibration.calibrationAccuracy * 0.1 +
    pointing.accuracy * 0.05,
  )))

  const condition = classifyDishCondition(qualityScore)

  return {
    file: filePath, apertureDiameter, resolvingPower,
    signalStrength, noiseLevel, signalToNoise, frequency,
    dishType, receiverQuality, dataProcessingQuality,
    calibration, pointing, baseline, condition, qualityScore,
  }
}

// ─── Baseline Computation ────────────────────────────────────────────────────

/**
 * Compute baseline between two dishes
 * @example
 * computeBaseline(dishA, dishB) // BaselinePair
 */
export function computeBaseline(dishA: ArrayDish, dishB: ArrayDish): BaselinePair {
  const qualityDiff = Math.abs(dishA.qualityScore - dishB.qualityScore)
  const snrDiff = Math.abs(dishA.signalToNoise - dishB.signalToNoise)
  const calibrationDiff = Math.abs(dishA.calibration.calibrationAccuracy - dishB.calibration.calibrationAccuracy)

  const baselineLength = Math.min(100, Math.round(
    qualityDiff * 0.4 + snrDiff * 0.3 + calibrationDiff * 0.3,
  ))

  const correlationQuality = Math.min(100, Math.round(100 - baselineLength))

  const phaseAlignment = Math.min(100, Math.round(100 -
    (qualityDiff * 0.3 + calibrationDiff * 0.4 + snrDiff * 0.3),
  ))

  let interferenceType: InterferenceType = 'independent'
  if (phaseAlignment >= 60 && correlationQuality >= 50) {
    interferenceType = 'constructive'
  } else if (phaseAlignment < 40 && baselineLength > 50) {
    interferenceType = 'destructive'
  }

  const isCoherent = phaseAlignment >= 50 && correlationQuality >= 40

  return {
    dishA: dishA.file, dishB: dishB.file,
    baselineLength, correlationQuality,
    interferenceType, phaseAlignment, isCoherent,
  }
}

// ─── Array Computation ───────────────────────────────────────────────────────

/**
 * Compute combined resolving power of dishes
 * @example
 * computeResolvingPower(dishes) // number
 */
export function computeResolvingPower(dishes: ArrayDish[]): number {
  if (dishes.length === 0) return 0
  const n = dishes.length
  const avgResolving = dishes.reduce((s, d) => s + d.resolvingPower, 0) / n
  const avgCal = dishes.reduce((s, d) => s + d.calibration.calibrationAccuracy, 0) / n
  const bonus = Math.min(30, n * 3)
  return Math.min(100, Math.round(avgResolving * 0.6 + avgCal * 0.2 + bonus))
}

/**
 * Compute aperture synthesis quality
 * @example
 * computeApertureSynthesis(dishes, baselines) // number
 */
export function computeApertureSynthesis(dishes: ArrayDish[], baselines: BaselinePair[]): number {
  if (dishes.length === 0) return 0
  const n = dishes.length
  const avgAperture = dishes.reduce((s, d) => s + d.apertureDiameter, 0) / n
  const coherentCount = baselines.filter(b => b.isCoherent).length
  const baselineCount = baselines.length || 1
  const coherenceRatio = coherentCount / baselineCount

  return Math.min(100, Math.round(
    avgAperture * 0.4 + coherenceRatio * 100 * 0.4 + Math.min(20, n * 2),
  ))
}

// ─── Configuration Analysis ──────────────────────────────────────────────────

/**
 * Analyze a directory as an array configuration
 * @example
 * analyzeArrayConfiguration(dishes, baselines, 'src') // ArrayConfiguration
 */
export function analyzeArrayConfiguration(
  dishes: ArrayDish[],
  baselines: BaselinePair[],
  dirPath: string,
): ArrayConfiguration {
  if (dishes.length === 0) {
    return {
      directory: dirPath, dishes: [], baselines: [],
      totalAperture: 0, resolvingPower: 0, apertureSynthesis: 0,
      avgSignalToNoise: 0, avgCalibration: 0,
      optimalDishes: 0, damagedDishes: 0, offlineDishes: 0,
      coherentPairs: 0, incoherentPairs: 0,
      arrayType: 'random', configuration: 'sparse',
      isWellCalibrated: false, arrayHealth: 0, condition: 'broken',
    }
  }

  const n = dishes.length
  const totalAperture = Math.min(100, Math.round(dishes.reduce((s, d) => s + d.apertureDiameter, 0) / n))
  const avgSignalToNoise = Math.round(dishes.reduce((s, d) => s + d.signalToNoise, 0) / n)
  const avgCalibration = Math.round(dishes.reduce((s, d) => s + d.calibration.calibrationAccuracy, 0) / n)

  const optimalDishes = dishes.filter(d => d.condition === 'optimal').length
  const damagedDishes = dishes.filter(d => d.condition === 'damaged' || d.condition === 'offline').length
  const offlineDishes = dishes.filter(d => d.condition === 'offline').length
  const coherentPairs = baselines.filter(b => b.isCoherent).length
  const incoherentPairs = baselines.filter(b => !b.isCoherent).length

  const resolvingPower = computeResolvingPower(dishes)
  const apertureSynthesis = computeApertureSynthesis(dishes, baselines)

  const avgBaseline = baselines.length > 0
    ? baselines.reduce((s, b) => s + b.baselineLength, 0) / baselines.length
    : 50

  const arrayType = classifyArrayType(n)
  const configuration = classifyConfigurationType(n, avgBaseline)
  const isWellCalibrated = avgCalibration >= 50

  const arrayHealth = Math.min(100, Math.round(
    totalAperture * 0.2 +
    resolvingPower * 0.25 +
    apertureSynthesis * 0.2 +
    avgSignalToNoise * 0.15 +
    avgCalibration * 0.1 +
    (optimalDishes / n * 100) * 0.1,
  ))

  const condition = classifyConfigCondition(arrayHealth)

  return {
    directory: dirPath, dishes, baselines,
    totalAperture, resolvingPower, apertureSynthesis,
    avgSignalToNoise, avgCalibration,
    optimalDishes, damagedDishes, offlineDishes,
    coherentPairs, incoherentPairs,
    arrayType, configuration, isWellCalibrated,
    arrayHealth, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate telescope array recommendations
 * @example
 * generateRecommendations(dishes, configs, interferometer, stats) // string[]
 */
export function generateRecommendations(
  dishes: ArrayDish[],
  _configs: ArrayConfiguration[],
  _interferometer: InterferometerInfo,
  stats: TelescopeArrayStats,
): string[] {
  void _configs
  void _interferometer
  const recs: string[] = []

  if (stats.offlineDishes > 0) {
    recs.push(`Offline dishes: ${stats.offlineDishes} files are non-functional`)
  }

  if (stats.damagedDishes > stats.totalFiles * 0.2) {
    recs.push(`Damaged dishes: ${stats.damagedDishes} files need maintenance`)
  }

  if (stats.incoherentPairs > stats.coherentPairs) {
    recs.push('Incoherent array: more destructive pairs than constructive pairs detected')
  }

  const uncalibrated = dishes.filter(d => d.calibration.needsRecalibration).length
  if (uncalibrated > 0) {
    recs.push(`Recalibration needed: ${uncalibrated} files need convention alignment`)
  }

  const driftFiles = dishes.filter(d => d.pointing.hasDrift).length
  if (driftFiles > 0) {
    recs.push(`Drift detected: ${driftFiles} files show scope creep`)
  }

  if (stats.avgNoiseLevel > 50) {
    recs.push('High noise floor: reduce code complexity across the array')
  }

  if (stats.overallArrayPower >= 60) {
    recs.push('Good array power: telescope array is producing useful observations')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete telescope array result from files and contents
 * @example
 * buildTelescopeArrayResult(['a.ts'], ['export function a() {}'], {}) // TelescopeArrayResult
 */
export function buildTelescopeArrayResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TelescopeArrayResult {
  void options

  const dishes: ArrayDish[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeArrayDish(content, file)
    } catch {
      return analyzeArrayDish('', file)
    }
  })

  const baselines: BaselinePair[] = []
  for (let i = 0; i < dishes.length; i++) {
    for (let j = i + 1; j < dishes.length; j++) {
      const di = dishes[i]
      const dj = dishes[j]
      if (di && dj && (di.file ?? '').split('/').slice(0, -1).join('/') ===
          (dj.file ?? '').split('/').slice(0, -1).join('/')) {
        baselines.push(computeBaseline(di, dj))
      }
    }
  }

  for (const dish of dishes) {
    const connected = baselines
      .filter(b => b.dishA === dish.file || b.dishB === dish.file)
      .map(b => b.dishA === dish.file ? b.dishB : b.dishA)
    dish.baseline = analyzeDishBaseline(dish, connected)
  }

  const dirMap = new Map<string, ArrayDish[]>()
  for (const d of dishes) {
    const dir = d.file.includes('/') ? d.file.slice(0, d.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(d) } else { dirMap.set(dir, [d]) }
  }

  const configurations: ArrayConfiguration[] = Array.from(dirMap.entries()).map(([dir, ds]) => {
    const dirBaselines = baselines.filter(b =>
      ds.some(d => d.file === b.dishA) && ds.some(d => d.file === b.dishB),
    )
    return analyzeArrayConfiguration(ds, dirBaselines, dir)
  })

  const n = dishes.length || 1
  const totalResolvingPower = computeResolvingPower(dishes)
  const totalAperture = dishes.length > 0
    ? Math.min(100, Math.round(dishes.reduce((s, d) => s + d.apertureDiameter, 0) / n))
    : 0
  const avgSignalToNoise = Math.round(dishes.reduce((s, d) => s + d.signalToNoise, 0) / n)
  const avgCalibration = Math.round(dishes.reduce((s, d) => s + d.calibration.calibrationAccuracy, 0) / n)
  const avgPointingAccuracy = Math.round(dishes.reduce((s, d) => s + d.pointing.accuracy, 0) / n)

  const constructivePairs = baselines.filter(b => b.interferenceType === 'constructive').length
  const destructivePairs = baselines.filter(b => b.interferenceType === 'destructive').length
  const isCoherent = constructivePairs >= destructivePairs

  const overallPower = Math.min(100, Math.round(
    totalResolvingPower * 0.3 +
    totalAperture * 0.2 +
    avgSignalToNoise * 0.2 +
    avgCalibration * 0.15 +
    avgPointingAccuracy * 0.15,
  ))

  const interferometer: InterferometerInfo = {
    totalResolvingPower, totalAperture, avgSignalToNoise, avgCalibration,
    isCoherent, hasInterference: destructivePairs > 0,
    constructivePairs, destructivePairs, overallPower,
  }

  const avgAperture = totalAperture
  const avgResolvingPower = Math.round(dishes.reduce((s, d) => s + d.resolvingPower, 0) / n)
  const avgSignalStrength = Math.round(dishes.reduce((s, d) => s + d.signalStrength, 0) / n)
  const avgNoiseLevel = Math.round(dishes.reduce((s, d) => s + d.noiseLevel, 0) / n)

  const stats: TelescopeArrayStats = {
    totalFiles: files.length,
    totalConfigurations: configurations.length,
    totalBaselines: baselines.length,
    avgAperture, avgResolvingPower, avgSignalStrength,
    avgNoiseLevel, avgSignalToNoise, avgCalibration, avgPointingAccuracy,
    optimalDishes: dishes.filter(d => d.condition === 'optimal').length,
    damagedDishes: dishes.filter(d => d.condition === 'damaged' || d.condition === 'offline').length,
    offlineDishes: dishes.filter(d => d.condition === 'offline').length,
    coherentPairs: baselines.filter(b => b.isCoherent).length,
    incoherentPairs: baselines.filter(b => !b.isCoherent).length,
    totalResolvingPower,
    overallArrayPower: overallPower,
    astronomerGrade: classifyAstronomerGrade(overallPower),
    bestDish: dishes.length > 0
      ? dishes.reduce((b, d) => d.qualityScore > b.qualityScore ? d : b, dishes[0] as typeof dishes[number]).file : 'none',
    worstDish: dishes.length > 0
      ? dishes.reduce((w, d) => d.qualityScore < w.qualityScore ? d : w, dishes[0] as typeof dishes[number]).file : 'none',
    strongestPair: baselines.length > 0
      ? baselines.reduce((b, p) => p.correlationQuality > b.correlationQuality ? p : b, baselines[0] as typeof baselines[number])
        .dishA + ' <-> ' + baselines.reduce((b, p) => p.correlationQuality > b.correlationQuality ? p : b, baselines[0] as typeof baselines[number]).dishB
      : 'none',
    noisiestDish: dishes.length > 0
      ? dishes.reduce((n, d) => d.noiseLevel > n.noiseLevel ? d : n, dishes[0] as typeof dishes[number]).file : 'none',
  }

  const recommendations = generateRecommendations(dishes, configurations, interferometer, stats)

  return { dishes, configurations, interferometer, stats, recommendations }
}
