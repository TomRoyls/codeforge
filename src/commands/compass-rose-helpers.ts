// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Clarity grade */
export type ClarityGrade =
  | 'true-north'
  | 'clear-bearing'
  | 'proper-heading'
  | 'uncertain-direction'
  | 'lost-bearing'
  | 'spinning-compass'

/** Bearing compass */
export type BearingCompass =
  | 'gyroscopic'
  | 'magnetic-north'
  | 'proper-compass'
  | 'wobbly-needle'
  | 'spinning-needle'
  | 'broken-compass'

/** Navigation quality */
export type NavigationQuality =
  | 'gps-grade'
  | 'clear-charts'
  | 'proper-maps'
  | 'vague-directions'
  | 'no-signs'
  | 'unmarked-trail'

/** Orientation stability */
export type OrientationStability =
  | 'rock-steady'
  | 'stable-platform'
  | 'proper-gyroscope'
  | 'wobbling'
  | 'tilting'
  | 'tumbling'

/** Chart precision */
export type ChartPrecision =
  | 'detailed-chart'
  | 'proper-map'
  | 'basic-sketch'
  | 'rough-outline'
  | 'mental-map'
  | 'no-map'

/** Bearing condition */
export type BearingCondition =
  | 'master-navigator'
  | 'skilled-pilot'
  | 'proper-helmsman'
  | 'lost-sailor'
  | 'drifting-raft'
  | 'shipwreck'

/** Chart type */
export type ChartType =
  | 'admiralty-chart'
  | 'nautical-map'
  | 'coastal-guide'
  | 'sketch-map'
  | 'scratched-rock'
  | 'blank-page'

/** Chart condition */
export type ChartCondition =
  | 'chart-room'
  | 'navigation-station'
  | 'wheelhouse'
  | 'deck'
  | 'lifeboat'
  | 'adrift'

/** Captain grade */
export type CaptainGrade =
  | 'fleet-admiral'
  | 'sea-captain'
  | 'first-mate'
  | 'deck-hand'
  | 'cabin-boy'
  | 'landlubber'

/** Directing measurement */
export interface DirectingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasFocused: boolean
  hasClear: boolean
  hasNoConfused: boolean
  hasPurposeful: boolean
  hasNoAimless: boolean
  hasDirected: boolean
  hasNoWandering: boolean
  hasIntentional: boolean
  hasNoRandom: boolean
  hasResolute: boolean
  confusedCount: number
  aimlessCount: number
}

/** Bearing measurement */
export interface BearingMeasure {
  accuracy: number
  compass: BearingCompass
  hasHighAccuracy: boolean
  hasCorrect: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasPrecise: boolean
  hasNoImprecise: boolean
  hasTrue: boolean
  hasNoFalse: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasReliable: boolean
  wrongCount: number
  impreciseCount: number
}

/** Navigating measurement */
export interface NavigatingMeasure {
  quality: number
  nav: NavigationQuality
  hasHighQuality: boolean
  hasDiscoverable: boolean
  hasFindable: boolean
  hasNoHidden: boolean
  hasAccessible: boolean
  hasNoObscured: boolean
  hasIntuitive: boolean
  hasNoCryptic: boolean
  hasApproachable: boolean
  hasNoDaunting: boolean
  hasWelcoming: boolean
  hiddenCount: number
  obscuredCount: number
}

/** Orienting measurement */
export interface OrientingMeasure {
  stability: number
  orientation: OrientationStability
  hasHighStability: boolean
  hasConsistent: boolean
  hasStable: boolean
  hasNoFluctuating: boolean
  hasReliable: boolean
  hasNoErratic: boolean
  hasUniform: boolean
  hasNoInconsistent: boolean
  hasPredictable: boolean
  hasNoVolatile: boolean
  hasSteady: boolean
  fluctuatingCount: number
  erraticCount: number
}

/** Charting measurement */
export interface ChartingMeasure {
  precision: number
  chart: ChartPrecision
  hasHighPrecision: boolean
  hasDocumented: boolean
  hasDescribed: boolean
  hasNoUndocumented: boolean
  hasAnnotated: boolean
  hasNoUnmarked: boolean
  hasExplained: boolean
  hasNoUnexplained: boolean
  hasDetailed: boolean
  hasNoVague: boolean
  hasMapped: boolean
  undocumentedCount: number
  unmarkedCount: number
}

/** Single file analysis */
export interface CompassBearing {
  file: string
  directionalClarity: number
  bearingAccuracy: number
  navigationQuality: number
  orientationStability: number
  chartingPrecision: number
  directing: DirectingMeasure
  bearing: BearingMeasure
  navigating: NavigatingMeasure
  orienting: OrientingMeasure
  charting: ChartingMeasure
  condition: BearingCondition
  qualityScore: number
}

/** Directory-level chart */
export interface NavigationChart {
  directory: string
  bearings: CompassBearing[]
  avgClarity: number
  avgAccuracy: number
  avgStability: number
  masterNavigatorCount: number
  shipwreckCount: number
  chartType: ChartType
  condition: ChartCondition
}

/** Fleet summary */
export interface FleetSummary {
  avgClarity: number
  avgAccuracy: number
  avgStability: number
  isNavigable: boolean
  overallNavigation: number
}

/** Full stats */
export interface CompassRoseStats {
  totalFiles: number
  totalCharts: number
  avgDirectionalClarity: number
  avgBearingAccuracy: number
  avgNavigationQuality: number
  avgOrientationStability: number
  avgChartingPrecision: number
  masterNavigatorCount: number
  skilledPilotCount: number
  properHelmsmanCount: number
  lostSailorCount: number
  driftingRaftCount: number
  shipwreckCount: number
  hasHighClarityCount: number
  hasHighAccuracyCount: number
  hasHighQualityCount: number
  hasHighStabilityCount: number
  hasHighPrecisionCount: number
  overallNavigation: number
  captainGrade: CaptainGrade
  bestBearing: string
  clearest: string
  mostAccurate: string
  mostNavigable: string
  mostStable: string
}

/** Full result */
export interface CompassRoseResult {
  bearings: CompassBearing[]
  charts: NavigationChart[]
  fleet: FleetSummary
  stats: CompassRoseStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure directional clarity
 * @example
 * const m = measureDirecting(content)
 * console.log(m.grade) // 'true-north'
 */
export function measureDirecting(content: string): DirectingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 10 : 0

  const hasFocused = hasExport(content) && hasImport(content)
  const hasClear = hasInterface(content) && hasClass(content)
  const hasPurposeful = hasGenerics(content) && hasTypeAlias(content)
  const hasDirected = hasNamedExport(content) && hasReturnType(content)
  const hasIntentional = hasAsync(content) && hasDocComments(content)
  const hasResolute = hasExport(content) && hasGenerics(content)

  score += hasFocused ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasPurposeful ? 5 : 0
  score += hasDirected ? 5 : 0
  score += hasIntentional ? 5 : 0
  score += hasResolute ? 5 : 0

  const clarity = Math.min(score, 100)
  const confusedCount = count(/\bvar\b/, content)
  const aimlessCount = count(/\bany\b/, content)

  const hasNoConfused = confusedCount === 0
  const hasNoAimless = aimlessCount === 0
  const hasNoWandering = !has(/\beval\b/, content)
  const hasNoRandom = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'true-north'
  else if (clarity >= 70) grade = 'clear-bearing'
  else if (clarity >= 55) grade = 'proper-heading'
  else if (clarity >= 40) grade = 'uncertain-direction'
  else if (clarity >= 25) grade = 'lost-bearing'
  else grade = 'spinning-compass'

  return {
    clarity, grade, hasHighClarity, hasFocused, hasClear, hasNoConfused,
    hasPurposeful, hasNoAimless, hasDirected, hasNoWandering, hasIntentional,
    hasNoRandom, hasResolute, confusedCount, aimlessCount,
  }
}

/**
 * Measure bearing accuracy
 * @example
 * const m = measureBearing(content)
 * console.log(m.compass) // 'gyroscopic'
 */
export function measureBearing(content: string): BearingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasCorrect = hasStrictEq(content) && hasConst(content)
  const hasAccurate = hasReturnType(content) && hasReadonly(content)
  const hasPrecise = hasPrivate(content) && hasClass(content)
  const hasTrue = hasInterface(content) && hasGenerics(content)
  const hasExact = hasExport(content) && hasTypeAlias(content)
  const hasReliable = hasStrictEq(content) && hasReturnType(content)

  score += hasCorrect ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasTrue ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasReliable ? 5 : 0

  const accuracy = Math.min(score, 100)
  const wrongCount = count(/\bvar\b/, content)
  const impreciseCount = count(/\bany\b/, content)

  const hasNoWrong = wrongCount === 0
  const hasNoImprecise = impreciseCount === 0
  const hasNoFalse = !has(/\beval\b/, content)
  const hasNoApproximate = !has(/\bdebugger\b/, content)
  const hasHighAccuracy = accuracy >= 70

  let compass: BearingCompass
  if (accuracy >= 85) compass = 'gyroscopic'
  else if (accuracy >= 70) compass = 'magnetic-north'
  else if (accuracy >= 55) compass = 'proper-compass'
  else if (accuracy >= 40) compass = 'wobbly-needle'
  else if (accuracy >= 25) compass = 'spinning-needle'
  else compass = 'broken-compass'

  return {
    accuracy, compass, hasHighAccuracy, hasCorrect, hasAccurate, hasNoWrong,
    hasPrecise, hasNoImprecise, hasTrue, hasNoFalse, hasExact, hasNoApproximate,
    hasReliable, wrongCount, impreciseCount,
  }
}

/**
 * Measure navigation quality
 * @example
 * const m = measureNavigating(content)
 * console.log(m.nav) // 'gps-grade'
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasDiscoverable = hasExport(content) && hasNamedExport(content)
  const hasFindable = hasInterface(content) && hasClass(content)
  const hasAccessible = hasDocComments(content) && hasReturnType(content)
  const hasIntuitive = hasGenerics(content) && hasTypeAlias(content)
  const hasApproachable = hasConst(content) && hasExport(content)
  const hasWelcoming = hasDocComments(content) && hasAsync(content)

  score += hasDiscoverable ? 5 : 0
  score += hasFindable ? 5 : 0
  score += hasAccessible ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasWelcoming ? 5 : 0

  const quality = Math.min(score, 100)
  const hiddenCount = count(/\bvar\b/, content)
  const obscuredCount = count(/\bany\b/, content)

  const hasNoHidden = hiddenCount === 0
  const hasNoObscured = obscuredCount === 0
  const hasNoCryptic = !has(/\beval\b/, content)
  const hasNoDaunting = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let nav: NavigationQuality
  if (quality >= 85) nav = 'gps-grade'
  else if (quality >= 70) nav = 'clear-charts'
  else if (quality >= 55) nav = 'proper-maps'
  else if (quality >= 40) nav = 'vague-directions'
  else if (quality >= 25) nav = 'no-signs'
  else nav = 'unmarked-trail'

  return {
    quality, nav, hasHighQuality, hasDiscoverable, hasFindable, hasNoHidden,
    hasAccessible, hasNoObscured, hasIntuitive, hasNoCryptic, hasApproachable,
    hasNoDaunting, hasWelcoming, hiddenCount, obscuredCount,
  }
}

/**
 * Measure orientation stability
 * @example
 * const m = measureOrienting(content)
 * console.log(m.orientation) // 'rock-steady'
 */
export function measureOrienting(content: string): OrientingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0

  const hasConsistent = hasConst(content) && hasReadonly(content)
  const hasStable = hasStrictEq(content) && hasReturnType(content)
  const hasReliable = hasInterface(content) && hasGenerics(content)
  const hasUniform = hasClass(content) && hasPrivate(content)
  const hasPredictable = hasTypeAlias(content) && hasExport(content)
  const hasSteady = hasConst(content) && hasInterface(content)

  score += hasConsistent ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasUniform ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasSteady ? 5 : 0

  const stability = Math.min(score, 100)
  const fluctuatingCount = count(/\bvar\b/, content)
  const erraticCount = count(/\bany\b/, content)

  const hasNoFluctuating = fluctuatingCount === 0
  const hasNoErratic = erraticCount === 0
  const hasNoInconsistent = !has(/\beval\b/, content)
  const hasNoVolatile = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let orientation: OrientationStability
  if (stability >= 85) orientation = 'rock-steady'
  else if (stability >= 70) orientation = 'stable-platform'
  else if (stability >= 55) orientation = 'proper-gyroscope'
  else if (stability >= 40) orientation = 'wobbling'
  else if (stability >= 25) orientation = 'tilting'
  else orientation = 'tumbling'

  return {
    stability, orientation, hasHighStability, hasConsistent, hasStable, hasNoFluctuating,
    hasReliable, hasNoErratic, hasUniform, hasNoInconsistent, hasPredictable, hasNoVolatile,
    hasSteady, fluctuatingCount, erraticCount,
  }
}

/**
 * Measure charting precision
 * @example
 * const m = measureCharting(content)
 * console.log(m.chart) // 'detailed-chart'
 */
export function measureCharting(content: string): ChartingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasDescribed = hasExport(content) && hasDocComments(content)
  const hasAnnotated = hasInterface(content) && hasGenerics(content)
  const hasExplained = hasNamedExport(content) && hasReturnType(content)
  const hasDetailed = hasClass(content) && hasDocComments(content)
  const hasMapped = hasConst(content) && hasTypeAlias(content)

  score += hasDocumented ? 5 : 0
  score += hasDescribed ? 5 : 0
  score += hasAnnotated ? 5 : 0
  score += hasExplained ? 5 : 0
  score += hasDetailed ? 5 : 0
  score += hasMapped ? 5 : 0

  const precision = Math.min(score, 100)
  const undocumentedCount = count(/\bvar\b/, content)
  const unmarkedCount = count(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoUnmarked = unmarkedCount === 0
  const hasNoUnexplained = !has(/\beval\b/, content)
  const hasNoVague = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let chart: ChartPrecision
  if (precision >= 85) chart = 'detailed-chart'
  else if (precision >= 70) chart = 'proper-map'
  else if (precision >= 55) chart = 'basic-sketch'
  else if (precision >= 40) chart = 'rough-outline'
  else if (precision >= 25) chart = 'mental-map'
  else chart = 'no-map'

  return {
    precision, chart, hasHighPrecision, hasDocumented, hasDescribed, hasNoUndocumented,
    hasAnnotated, hasNoUnmarked, hasExplained, hasNoUnexplained, hasDetailed, hasNoVague,
    hasMapped, undocumentedCount, unmarkedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify bearing condition
 * @example
 * classifyBearingCondition(90) // 'master-navigator'
 */
export function classifyBearingCondition(score: number): BearingCondition {
  if (score >= 85) return 'master-navigator'
  if (score >= 70) return 'skilled-pilot'
  if (score >= 55) return 'proper-helmsman'
  if (score >= 40) return 'lost-sailor'
  if (score >= 25) return 'drifting-raft'
  return 'shipwreck'
}

/**
 * Classify chart type
 * @example
 * classifyChartType(bearings) // 'admiralty-chart'
 */
export function classifyChartType(bearings: CompassBearing[]): ChartType {
  if (bearings.length === 0) return 'blank-page'
  const avgQs = Math.round(bearings.reduce((s, b) => s + b.qualityScore, 0) / bearings.length)
  const masterRatio = bearings.filter(b => b.condition === 'master-navigator').length / bearings.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'admiralty-chart'
  if (avgQs >= 60) return 'nautical-map'
  if (avgQs >= 45) return 'coastal-guide'
  if (avgQs >= 30) return 'sketch-map'
  if (avgQs >= 15) return 'scratched-rock'
  return 'blank-page'
}

/**
 * Classify captain grade
 * @example
 * classifyCaptainGrade(85) // 'fleet-admiral'
 */
export function classifyCaptainGrade(avgNavigation: number): CaptainGrade {
  if (avgNavigation >= 80) return 'fleet-admiral'
  if (avgNavigation >= 65) return 'sea-captain'
  if (avgNavigation >= 50) return 'first-mate'
  if (avgNavigation >= 35) return 'deck-hand'
  if (avgNavigation >= 20) return 'cabin-boy'
  return 'landlubber'
}

/**
 * Classify chart condition
 * @example
 * classifyChartCondition(80) // 'chart-room'
 */
export function classifyChartCondition(avgQs: number): ChartCondition {
  if (avgQs >= 75) return 'chart-room'
  if (avgQs >= 60) return 'navigation-station'
  if (avgQs >= 45) return 'wheelhouse'
  if (avgQs >= 30) return 'deck'
  if (avgQs >= 15) return 'lifeboat'
  return 'adrift'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(bearings, charts, fleet, stats)
 */
export function generateRecommendations(
  bearings: CompassBearing[],
  charts: NavigationChart[],
  fleet: FleetSummary,
  stats: CompassRoseStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDirectionalClarity < 50) {
    recs.push('Improve directional clarity with focused exports, clear interfaces, and purposeful type signatures')
  }
  if (stats.avgBearingAccuracy < 50) {
    recs.push('Strengthen bearing accuracy with strict equality, precise return types, and correct const declarations')
  }
  if (stats.avgNavigationQuality < 50) {
    recs.push('Enhance navigation quality with discoverable exports, intuitive interfaces, and accessible documentation')
  }
  if (stats.avgOrientationStability < 50) {
    recs.push('Stabilize orientation with consistent const usage, readonly properties, and reliable type patterns')
  }
  if (stats.avgChartingPrecision < 50) {
    recs.push('Improve charting precision with thorough documentation, annotated types, and detailed doc comments')
  }
  if (stats.shipwreckCount > 0) {
    recs.push(`${stats.shipwreckCount} file(s) are shipwrecks — consider significant refactoring`)
  }
  if (fleet.overallNavigation < 40) {
    recs.push('Overall fleet navigation is poor — focus on clarity and bearing accuracy first')
  }
  const allDrift = charts.every(c => c.chartType === 'blank-page' || c.chartType === 'scratched-rock')
  if (allDrift && charts.length > 0) {
    recs.push('All charts are blank or scratched — consider a major navigation overhaul')
  }
  const wrecked = bearings.filter(b => b.condition === 'shipwreck').map(b => b.file)
  if (wrecked.length > 0 && wrecked.length <= 3) {
    recs.push(`Repair these shipwrecks: ${wrecked.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your compass rose points true north! Every bearing guides developers home')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a compass bearing
 * @example
 * const bearing = analyzeCompassBearing(content, 'index.ts')
 * console.log(bearing.condition) // 'master-navigator'
 */
export function analyzeCompassBearing(content: string, filePath: string): CompassBearing {
  const directing = measureDirecting(content)
  const bearing = measureBearing(content)
  const navigating = measureNavigating(content)
  const orienting = measureOrienting(content)
  const charting = measureCharting(content)

  const qualityScore = Math.round(
    directing.clarity * 0.2 +
    bearing.accuracy * 0.2 +
    navigating.quality * 0.2 +
    orienting.stability * 0.2 +
    charting.precision * 0.2,
  )

  return {
    file: filePath,
    directionalClarity: directing.clarity,
    bearingAccuracy: bearing.accuracy,
    navigationQuality: navigating.quality,
    orientationStability: orienting.stability,
    chartingPrecision: charting.precision,
    directing,
    bearing,
    navigating,
    orienting,
    charting,
    condition: classifyBearingCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a navigation chart
 * @example
 * const chart = analyzeNavigationChart(bearings, 'src')
 * console.log(chart.chartType) // 'admiralty-chart'
 */
export function analyzeNavigationChart(bearings: CompassBearing[], dirPath: string): NavigationChart {
  if (bearings.length === 0) {
    return {
      directory: dirPath, bearings: [], avgClarity: 0, avgAccuracy: 0, avgStability: 0,
      masterNavigatorCount: 0, shipwreckCount: 0, chartType: 'blank-page', condition: 'adrift',
    }
  }

  const avgClarity = Math.round(bearings.reduce((s, b) => s + b.directionalClarity, 0) / bearings.length)
  const avgAccuracy = Math.round(bearings.reduce((s, b) => s + b.bearingAccuracy, 0) / bearings.length)
  const avgStability = Math.round(bearings.reduce((s, b) => s + b.orientationStability, 0) / bearings.length)
  const masterNavigatorCount = bearings.filter(b => b.condition === 'master-navigator').length
  const shipwreckCount = bearings.filter(b => b.condition === 'shipwreck').length
  const avgQs = Math.round(bearings.reduce((s, b) => s + b.qualityScore, 0) / bearings.length)

  return {
    directory: dirPath, bearings, avgClarity, avgAccuracy, avgStability,
    masterNavigatorCount, shipwreckCount, chartType: classifyChartType(bearings),
    condition: classifyChartCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete compass rose result
 * @example
 * const result = await buildCompassRoseResult(files, contents)
 * console.log(result.stats.captainGrade) // 'fleet-admiral'
 */
export async function buildCompassRoseResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CompassRoseResult> {
  const bearings = files.map((file, i) => analyzeCompassBearing(contents[i] ?? '', file))

  const dirMap = new Map<string, CompassBearing[]>()
  for (const bearing of bearings) {
    const dir = path.dirname(bearing.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(bearing) } else { dirMap.set(dir, [bearing]) }
  }

  const charts = Array.from(dirMap.entries()).map(([dir, dirBearings]) =>
    analyzeNavigationChart(dirBearings, dir),
  )

  const avgClarity = bearings.length > 0
    ? Math.round(bearings.reduce((s, b) => s + b.directionalClarity, 0) / bearings.length) : 0
  const avgAccuracy = bearings.length > 0
    ? Math.round(bearings.reduce((s, b) => s + b.bearingAccuracy, 0) / bearings.length) : 0
  const avgStability = bearings.length > 0
    ? Math.round(bearings.reduce((s, b) => s + b.orientationStability, 0) / bearings.length) : 0

  const overallNavigation = bearings.length > 0
    ? Math.round((avgClarity + avgAccuracy + avgStability) / 3) : 0
  const isNavigable = avgAccuracy >= 60

  const fleet: FleetSummary = { avgClarity, avgAccuracy, avgStability, isNavigable, overallNavigation }

  const avgNavigationQuality = bearings.length > 0
    ? Math.round(bearings.reduce((s, b) => s + b.navigationQuality, 0) / bearings.length) : 0
  const avgChartingPrecision = bearings.length > 0
    ? Math.round(bearings.reduce((s, b) => s + b.chartingPrecision, 0) / bearings.length) : 0

  const bestBearing = bearings.length > 0
    ? bearings.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file : ''
  const clearest = bearings.length > 0
    ? bearings.reduce((best, b) => b.directionalClarity > best.directionalClarity ? b : best).file : ''
  const mostAccurate = bearings.length > 0
    ? bearings.reduce((best, b) => b.bearingAccuracy > best.bearingAccuracy ? b : best).file : ''
  const mostNavigable = bearings.length > 0
    ? bearings.reduce((best, b) => b.navigationQuality > best.navigationQuality ? b : best).file : ''
  const mostStable = bearings.length > 0
    ? bearings.reduce((best, b) => b.orientationStability > best.orientationStability ? b : best).file : ''

  const stats: CompassRoseStats = {
    totalFiles: bearings.length,
    totalCharts: charts.length,
    avgDirectionalClarity: avgClarity,
    avgBearingAccuracy: avgAccuracy,
    avgNavigationQuality,
    avgOrientationStability: avgStability,
    avgChartingPrecision,
    masterNavigatorCount: bearings.filter(b => b.condition === 'master-navigator').length,
    skilledPilotCount: bearings.filter(b => b.condition === 'skilled-pilot').length,
    properHelmsmanCount: bearings.filter(b => b.condition === 'proper-helmsman').length,
    lostSailorCount: bearings.filter(b => b.condition === 'lost-sailor').length,
    driftingRaftCount: bearings.filter(b => b.condition === 'drifting-raft').length,
    shipwreckCount: bearings.filter(b => b.condition === 'shipwreck').length,
    hasHighClarityCount: bearings.filter(b => b.directing.hasHighClarity).length,
    hasHighAccuracyCount: bearings.filter(b => b.bearing.hasHighAccuracy).length,
    hasHighQualityCount: bearings.filter(b => b.navigating.hasHighQuality).length,
    hasHighStabilityCount: bearings.filter(b => b.orienting.hasHighStability).length,
    hasHighPrecisionCount: bearings.filter(b => b.charting.hasHighPrecision).length,
    overallNavigation,
    captainGrade: classifyCaptainGrade(overallNavigation),
    bestBearing, clearest, mostAccurate, mostNavigable, mostStable,
  }

  const recommendations = generateRecommendations(bearings, charts, fleet, stats)

  return { bearings, charts, fleet, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
