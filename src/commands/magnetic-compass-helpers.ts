// ─── Interfaces ───────────────────────────────────────────

export interface NeedleMeasure {
  precision: number
  accuracy: 'surveyor-grade' | 'marine-compass' | 'hiking-compass' | 'basic-compass' | 'toy-compass' | 'broken'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasProperCalibration: boolean
  hasNoDeviation: boolean
  hasResponsive: boolean
  hasNoLagging: boolean
  hasSmooth: boolean
  hasNoJittering: boolean
  hasReliable: boolean
  hasNoSticking: boolean
  deviationCount: number
  jitteringCount: number
}

export interface AlignmentMeasure {
  level: number
  quality: 'perfect-alignment' | 'strong-field' | 'good-alignment' | 'moderate' | 'weak-field' | 'demagnetized'
  hasHighLevel: boolean
  hasProperCoupling: boolean
  hasNoConflict: boolean
  hasAligned: boolean
  hasNoOpposition: boolean
  hasConsistent: boolean
  hasNoContradiction: boolean
  hasHarmonious: boolean
  hasNoDissonance: boolean
  hasUnified: boolean
  conflictCount: number
  contradictionCount: number
}

export interface CardinalMeasure {
  direction: number
  clarity: 'true-north' | 'clear-bearing' | 'known-direction' | 'general-direction' | 'vague-heading' | 'lost'
  hasHighClarity: boolean
  hasClearPurpose: boolean
  hasProperScope: boolean
  hasNoWandering: boolean
  hasFocused: boolean
  hasNoScopeCreep: boolean
  hasIntentional: boolean
  hasNoAccidental: boolean
  hasDefined: boolean
  hasNoAmbiguity: boolean
  wanderingCount: number
  scopeCreepCount: number
}

export interface DeclinationMeasure {
  correction: number
  accuracy: 'surveyor-corrected' | 'well-adjusted' | 'properly-calibrated' | 'approximate' | 'uncorrected' | 'wildly-off'
  hasHighCorrection: boolean
  hasProperAdaptation: boolean
  hasNoStaleAssumptions: boolean
  hasContextAware: boolean
  hasNoHardcoding: boolean
  hasProperDefaults: boolean
  hasNoRigidity: boolean
  hasConfigurable: boolean
  hasNoOverfitting: boolean
  hasFlexible: boolean
  staleCount: number
  hardcodingCount: number
}

export interface BearingMeasure {
  stability: number
  quality: 'rock-steady' | 'stable-bearing' | 'reliable' | 'mostly-stable' | 'drifting' | 'spinning'
  hasHighStability: boolean
  hasConsistent: boolean
  hasNoFluctuation: boolean
  hasPredictable: boolean
  hasNoRegression: boolean
  hasStable: boolean
  hasNoDrift: boolean
  hasDurable: boolean
  hasNoDegradation: boolean
  hasLongTerm: boolean
  fluctuationCount: number
  driftCount: number
}

export interface NavigationMeasure {
  skill: number
  rating: 'master-navigator' | 'expert-pilot' | 'skilled-helmsman' | 'competent' | 'learner' | 'lost-at-sea'
  hasHighSkill: boolean
  hasClearPath: boolean
  hasNoDeadEnds: boolean
  hasEfficient: boolean
  hasNoWaste: boolean
  hasProperRouting: boolean
  hasNoBacktracking: boolean
  hasComplete: boolean
  hasNoGaps: boolean
  hasReliable: boolean
  deadEndCount: number
  backtrackingCount: number
}

export interface CompassReading {
  file: string
  needlePrecision: number
  magneticAlignment: number
  cardinalDirection: number
  declinationCorrection: number
  bearingStability: number
  navigationSkill: number
  needle: NeedleMeasure
  alignment: AlignmentMeasure
  cardinal: CardinalMeasure
  declination: DeclinationMeasure
  bearing: BearingMeasure
  navigation: NavigationMeasure
  condition: 'master-compass' | 'precision-instrument' | 'reliable-compass' | 'basic-tool' | 'damaged-compass' | 'spinning-wheel'
  qualityScore: number
}

export interface CompassRose {
  directory: string
  readings: CompassReading[]
  avgPrecision: number
  avgAlignment: number
  avgNavigation: number
  masterCount: number
  spinningCount: number
  preciseCount: number
  alignedCount: number
  roseType: 'master-rose' | 'full-compass' | 'nautical-compass' | 'pocket-compass' | 'toy-compass' | 'broken'
  condition: 'cartographic-quality' | 'navigational-aid' | 'basic-direction' | 'rough-bearing' | 'unreliable' | 'useless'
}

export interface MagneticCompassResult {
  readings: CompassReading[]
  roses: CompassRose[]
  chart: {
    avgPrecision: number
    avgAlignment: number
    avgNavigation: number
    isOriented: boolean
    overallOrientation: number
  }
  stats: {
    totalFiles: number
    totalRoses: number
    avgNeedlePrecision: number
    avgMagneticAlignment: number
    avgCardinalDirection: number
    avgDeclinationCorrection: number
    avgBearingStability: number
    avgNavigationSkill: number
    masterCompassCount: number
    precisionInstrumentCount: number
    reliableCompassCount: number
    basicToolCount: number
    damagedCompassCount: number
    spinningWheelCount: number
    hasHighPrecisionCount: number
    hasHighLevelCount: number
    hasHighClarityCount: number
    hasHighCorrectionCount: number
    hasHighStabilityCount: number
    hasHighSkillCount: number
    overallOrientation: number
    navigatorGrade: 'master-cartographer' | 'sea-captain' | 'navigator' | 'helmsman' | 'passenger' | 'shipwreck-victim'
    bestReading: string
    mostPrecise: string
    mostAligned: string
    clearestDirection: string
    bestAdjusted: string
    mostStable: string
  }
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────

const INTERFACE_RE = /\binterface\b/
const CLASS_RE = /\bclass\b/
const TYPE_RE = /\btype\b/
const EXPORT_RE = /\bexport\b/
const IMPORT_RE = /\bimport\b/
const FUNCTION_RE = /\bfunction\b/
const ARROW_RE = /=>/
const ASYNC_RE = /\basync\b/
const AWAIT_RE = /\bawait\b/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureNeedle ───────────────────────────────────────

/** @example measureNeedle(content) returns NeedleMeasure */
export function measureNeedle(content: string): NeedleMeasure {
  let score = 0

  const hasAccurate = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const deviationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDeviation = deviationCount === 0
  const hasProperCalibration = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const jitteringCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoJittering = jitteringCount === 0
  const hasResponsive = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasSmooth = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasReliable = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoSticking = !NESTED_TERNARY_RE.test(content)
  const hasNoLagging = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasAccurate) score += 12
  if (hasNoDeviation) score += 12
  if (hasProperCalibration) score += 10
  if (hasNoJittering) score += 10
  if (hasResponsive) score += 10
  if (hasSmooth) score += 10
  if (hasReliable) score += 11
  if (hasNoSticking) score += 10
  if (hasNoLagging) score += 10

  const precision = Math.min(100, Math.max(0, score))
  const hasHighPrecision = precision >= 70

  let accuracy: NeedleMeasure['accuracy'] = 'broken'
  if (hasHighPrecision && hasNoDeviation && hasReliable && (content.match(DOC_COMMENT_RE) || []).length > 0) accuracy = 'surveyor-grade'
  else if (hasHighPrecision && hasNoDeviation) accuracy = 'marine-compass'
  else if (hasHighPrecision) accuracy = 'hiking-compass'
  else if (hasAccurate && hasProperCalibration) accuracy = 'basic-compass'
  else if (precision > 30) accuracy = 'toy-compass'

  return {
    precision, accuracy, hasHighPrecision, hasAccurate, hasProperCalibration,
    hasNoDeviation, hasResponsive, hasNoLagging, hasSmooth, hasNoJittering,
    hasReliable, hasNoSticking, deviationCount, jitteringCount,
  }
}

// ─── measureAlignment ────────────────────────────────────

/** @example measureAlignment(content) returns AlignmentMeasure */
export function measureAlignment(content: string): AlignmentMeasure {
  let score = 0

  const hasProperCoupling = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const conflictCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoConflict = conflictCount === 0
  const hasAligned = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const contradictionCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoContradiction = contradictionCount === 0
  const hasConsistent = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasHarmonious = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDissonance = !NESTED_TERNARY_RE.test(content)
  const hasUnified = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoOpposition = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperCoupling) score += 12
  if (hasNoConflict) score += 12
  if (hasAligned) score += 10
  if (hasNoContradiction) score += 10
  if (hasConsistent) score += 10
  if (hasHarmonious) score += 10
  if (hasNoDissonance) score += 11
  if (hasUnified) score += 10
  if (hasNoOpposition) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let quality: AlignmentMeasure['quality'] = 'demagnetized'
  if (hasHighLevel && hasNoConflict && hasUnified && (content.match(DOC_COMMENT_RE) || []).length > 0) quality = 'perfect-alignment'
  else if (hasHighLevel && hasNoConflict) quality = 'strong-field'
  else if (hasHighLevel) quality = 'good-alignment'
  else if (hasAligned && hasProperCoupling) quality = 'moderate'
  else if (level > 30) quality = 'weak-field'

  return {
    level, quality, hasHighLevel, hasProperCoupling, hasNoConflict,
    hasAligned, hasNoOpposition, hasConsistent, hasNoContradiction,
    hasHarmonious, hasNoDissonance, hasUnified, conflictCount, contradictionCount,
  }
}

// ─── measureCardinal ─────────────────────────────────────

/** @example measureCardinal(content) returns CardinalMeasure */
export function measureCardinal(content: string): CardinalMeasure {
  let score = 0

  const hasClearPurpose = INTERFACE_RE.test(content) && EXPORT_RE.test(content) && TYPE_RE.test(content)
  const wanderingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWandering = wanderingCount === 0
  const hasProperScope = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const scopeCreepCount = (content.match(CONSOLE_RE) || []).length
  const hasNoScopeCreep = scopeCreepCount === 0
  const hasFocused = CLASS_RE.test(content) && INTERFACE_RE.test(content)
  const hasIntentional = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoAccidental = !NESTED_TERNARY_RE.test(content)
  const hasDefined = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoAmbiguity = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasDocDirection = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasClearPurpose) score += 12
  if (hasNoWandering) score += 12
  if (hasProperScope) score += 10
  if (hasNoScopeCreep) score += 10
  if (hasFocused) score += 10
  if (hasIntentional) score += 10
  if (hasNoAccidental) score += 10
  if (hasDefined) score += 11
  if (hasNoAmbiguity) score += 10

  const direction = Math.min(100, Math.max(0, score))
  const hasHighClarity = direction >= 70

  let clarity: CardinalMeasure['clarity'] = 'lost'
  if (hasHighClarity && hasNoWandering && hasClearPurpose && hasDocDirection) clarity = 'true-north'
  else if (hasHighClarity && hasNoWandering) clarity = 'clear-bearing'
  else if (hasHighClarity) clarity = 'known-direction'
  else if (hasClearPurpose && hasProperScope) clarity = 'general-direction'
  else if (direction > 30) clarity = 'vague-heading'

  return {
    direction, clarity, hasHighClarity, hasClearPurpose, hasProperScope,
    hasNoWandering, hasFocused, hasNoScopeCreep, hasIntentional, hasNoAccidental,
    hasDefined, hasNoAmbiguity, wanderingCount, scopeCreepCount,
  }
}

// ─── measureDeclination ──────────────────────────────────

/** @example measureDeclination(content) returns DeclinationMeasure */
export function measureDeclination(content: string): DeclinationMeasure {
  let score = 0

  const hasProperAdaptation = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const staleCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoStaleAssumptions = staleCount === 0
  const hasContextAware = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hardcodingCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoHardcoding = hardcodingCount === 0
  const hasProperDefaults = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoRigidity = !NESTED_TERNARY_RE.test(content)
  const hasConfigurable = (content.match(GENERIC_RE) || []).length > 0 || (content.match(OPTIONAL_RE) || []).length > 0
  const hasNoOverfitting = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasFlexible = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperAdaptation) score += 12
  if (hasNoStaleAssumptions) score += 12
  if (hasContextAware) score += 10
  if (hasNoHardcoding) score += 10
  if (hasProperDefaults) score += 10
  if (hasNoRigidity) score += 10
  if (hasConfigurable) score += 10
  if (hasNoOverfitting) score += 11
  if (hasFlexible) score += 10

  const correction = Math.min(100, Math.max(0, score))
  const hasHighCorrection = correction >= 70

  let accuracy: DeclinationMeasure['accuracy'] = 'wildly-off'
  if (hasHighCorrection && hasNoStaleAssumptions && hasContextAware && hasConfigurable) accuracy = 'surveyor-corrected'
  else if (hasHighCorrection && hasNoStaleAssumptions) accuracy = 'well-adjusted'
  else if (hasHighCorrection) accuracy = 'properly-calibrated'
  else if (hasProperAdaptation && hasProperDefaults) accuracy = 'approximate'
  else if (correction > 30) accuracy = 'uncorrected'

  return {
    correction, accuracy, hasHighCorrection, hasProperAdaptation, hasNoStaleAssumptions,
    hasContextAware, hasNoHardcoding, hasProperDefaults, hasNoRigidity,
    hasConfigurable, hasNoOverfitting, hasFlexible, staleCount, hardcodingCount,
  }
}

// ─── measureBearing ──────────────────────────────────────

/** @example measureBearing(content) returns BearingMeasure */
export function measureBearing(content: string): BearingMeasure {
  let score = 0

  const hasConsistent = INTERFACE_RE.test(content) && EXPORT_RE.test(content) && TYPE_RE.test(content)
  const fluctuationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFluctuation = fluctuationCount === 0
  const hasPredictable = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const driftCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoDrift = driftCount === 0
  const hasStable = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasDurable = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDegradation = !NESTED_TERNARY_RE.test(content)
  const hasLongTerm = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoRegression = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasConsistent) score += 12
  if (hasNoFluctuation) score += 12
  if (hasPredictable) score += 10
  if (hasNoDrift) score += 10
  if (hasStable) score += 10
  if (hasDurable) score += 10
  if (hasNoDegradation) score += 11
  if (hasLongTerm) score += 10
  if (hasNoRegression) score += 10

  const stability = Math.min(100, Math.max(0, score))
  const hasHighStability = stability >= 70

  let quality: BearingMeasure['quality'] = 'spinning'
  if (hasHighStability && hasNoFluctuation && hasConsistent && hasLongTerm) quality = 'rock-steady'
  else if (hasHighStability && hasNoFluctuation) quality = 'stable-bearing'
  else if (hasHighStability) quality = 'reliable'
  else if (hasConsistent && hasPredictable) quality = 'mostly-stable'
  else if (stability > 30) quality = 'drifting'

  return {
    stability, quality, hasHighStability, hasConsistent, hasNoFluctuation,
    hasPredictable, hasNoRegression, hasStable, hasNoDrift, hasDurable,
    hasNoDegradation, hasLongTerm, fluctuationCount, driftCount,
  }
}

// ─── measureNavigation ───────────────────────────────────

/** @example measureNavigation(content) returns NavigationMeasure */
export function measureNavigation(content: string): NavigationMeasure {
  let score = 0

  const hasClearPath = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const deadEndCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDeadEnds = deadEndCount === 0
  const hasEfficient = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const backtrackingCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoBacktracking = backtrackingCount === 0
  const hasProperRouting = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoWaste = (content.match(CONSOLE_RE) || []).length === 0
  const hasComplete = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoGaps = !NESTED_TERNARY_RE.test(content)
  const hasReliable = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasDocPath = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasClearPath) score += 12
  if (hasNoDeadEnds) score += 12
  if (hasEfficient) score += 10
  if (hasNoBacktracking) score += 10
  if (hasProperRouting) score += 10
  if (hasNoWaste) score += 11
  if (hasComplete) score += 10
  if (hasNoGaps) score += 10
  if (hasReliable) score += 10

  const skill = Math.min(100, Math.max(0, score))
  const hasHighSkill = skill >= 70

  let rating: NavigationMeasure['rating'] = 'lost-at-sea'
  if (hasHighSkill && hasNoDeadEnds && hasReliable && hasDocPath) rating = 'master-navigator'
  else if (hasHighSkill && hasNoDeadEnds) rating = 'expert-pilot'
  else if (hasHighSkill) rating = 'skilled-helmsman'
  else if (hasClearPath && hasEfficient) rating = 'competent'
  else if (skill > 30) rating = 'learner'

  return {
    skill, rating, hasHighSkill, hasClearPath, hasNoDeadEnds,
    hasEfficient, hasNoWaste, hasProperRouting, hasNoBacktracking,
    hasComplete, hasNoGaps, hasReliable, deadEndCount, backtrackingCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(reading) returns condition */
export function classifyCondition(reading: CompassReading): CompassReading['condition'] {
  const { qualityScore } = reading
  if (qualityScore >= 80) return 'master-compass'
  if (qualityScore >= 65) return 'precision-instrument'
  if (qualityScore >= 50) return 'reliable-compass'
  if (qualityScore >= 35) return 'basic-tool'
  if (qualityScore >= 20) return 'damaged-compass'
  return 'spinning-wheel'
}

// ─── analyzeCompassReading ───────────────────────────────

/** @example analyzeCompassReading(content, filePath) returns CompassReading */
export function analyzeCompassReading(content: string, filePath: string): CompassReading {
  const needle = measureNeedle(content)
  const alignment = measureAlignment(content)
  const cardinal = measureCardinal(content)
  const declination = measureDeclination(content)
  const bearing = measureBearing(content)
  const navigation = measureNavigation(content)

  const needlePrecision = needle.precision
  const magneticAlignment = alignment.level
  const cardinalDirection = cardinal.direction
  const declinationCorrection = declination.correction
  const bearingStability = bearing.stability
  const navigationSkill = navigation.skill

  const qualityScore = Math.round(
    needlePrecision * 0.15 +
    magneticAlignment * 0.2 +
    cardinalDirection * 0.15 +
    declinationCorrection * 0.15 +
    bearingStability * 0.2 +
    navigationSkill * 0.15,
  )

  const result: CompassReading = {
    file: filePath,
    needlePrecision, magneticAlignment, cardinalDirection,
    declinationCorrection, bearingStability, navigationSkill,
    needle, alignment, cardinal, declination, bearing, navigation,
    qualityScore,
    condition: 'spinning-wheel',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyRoseType ────────────────────────────────────

/** @example classifyRoseType(readings) returns rose type */
export function classifyRoseType(readings: CompassReading[]): CompassRose['roseType'] {
  if (readings.length === 0) return 'broken'
  const avgScore = readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length
  const masterCnt = readings.filter((r) => r.condition === 'master-compass').length
  if (avgScore >= 75 && masterCnt >= Math.ceil(readings.length * 0.3)) return 'master-rose'
  if (avgScore >= 60) return 'full-compass'
  if (avgScore >= 45) return 'nautical-compass'
  if (avgScore >= 30) return 'pocket-compass'
  if (avgScore >= 15) return 'toy-compass'
  return 'broken'
}

// ─── analyzeCompassRose ──────────────────────────────────

/** @example analyzeCompassRose(readings, dirPath) returns CompassRose */
export function analyzeCompassRose(readings: CompassReading[], dirPath: string): CompassRose {
  if (readings.length === 0) {
    return {
      directory: dirPath, readings: [], avgPrecision: 0, avgAlignment: 0, avgNavigation: 0,
      masterCount: 0, spinningCount: 0, preciseCount: 0, alignedCount: 0,
      roseType: 'broken', condition: 'useless',
    }
  }

  const avgPrecision = Math.round(readings.reduce((s, r) => s + r.needlePrecision, 0) / readings.length)
  const avgAlignment = Math.round(readings.reduce((s, r) => s + r.magneticAlignment, 0) / readings.length)
  const avgNavigation = Math.round(readings.reduce((s, r) => s + r.navigationSkill, 0) / readings.length)
  const masterCount = readings.filter((r) => r.condition === 'master-compass').length
  const spinningCount = readings.filter((r) => r.condition === 'spinning-wheel').length
  const preciseCount = readings.filter((r) => r.needle.hasHighPrecision).length
  const alignedCount = readings.filter((r) => r.alignment.hasHighLevel).length

  const roseType = classifyRoseType(readings)
  const avgScore = readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length
  let condition: CompassRose['condition'] = 'useless'
  if (avgScore >= 75) condition = 'cartographic-quality'
  else if (avgScore >= 60) condition = 'navigational-aid'
  else if (avgScore >= 45) condition = 'basic-direction'
  else if (avgScore >= 30) condition = 'rough-bearing'
  else if (avgScore >= 15) condition = 'unreliable'

  return {
    directory: dirPath, readings, avgPrecision, avgAlignment, avgNavigation,
    masterCount, spinningCount, preciseCount, alignedCount, roseType, condition,
  }
}

// ─── classifyNavigatorGrade ──────────────────────────────

/** @example classifyNavigatorGrade(avgOrientation) returns grade */
export function classifyNavigatorGrade(avgOrientation: number): MagneticCompassResult['stats']['navigatorGrade'] {
  if (avgOrientation >= 80) return 'master-cartographer'
  if (avgOrientation >= 65) return 'sea-captain'
  if (avgOrientation >= 50) return 'navigator'
  if (avgOrientation >= 35) return 'helmsman'
  if (avgOrientation >= 20) return 'passenger'
  return 'shipwreck-victim'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(readings, roses, chart, stats) returns string[] */
export function generateRecommendations(
  readings: CompassReading[],
  roses: CompassRose[],
  chart: MagneticCompassResult['chart'],
  stats: MagneticCompassResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgNeedlePrecision < 50) recs.push('Sharpen needle precision — improve code accuracy and reduce any/eval deviation')
  if (stats.avgMagneticAlignment < 50) recs.push('Strengthen magnetic alignment — improve code cohesion and reduce conflicts')
  if (stats.avgCardinalDirection < 50) recs.push('Clarify cardinal direction — improve code purpose and reduce wandering')
  if (stats.avgDeclinationCorrection < 50) recs.push('Correct declination — improve code adaptation and reduce stale assumptions')
  if (stats.avgBearingStability < 50) recs.push('Stabilize bearing — improve code reliability and reduce fluctuation')
  if (stats.avgNavigationSkill < 50) recs.push('Improve navigation skill — reduce dead ends and improve code routing')
  if (stats.spinningWheelCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are spinning wheels — consider major compass recalibration')
  if (stats.damagedCompassCount > 0) recs.push('Warning: damaged-compass files detected — these need immediate repair')
  if (chart.overallOrientation < 40) recs.push('Overall orientation is critically low — establish a compass calibration regimen')
  if (roses.length > 0 && roses.every((r) => r.condition === 'useless')) recs.push('All compass roses are useless — your codebase needs fundamental orientation')

  if (readings.length > 0) {
    const highDeviation = readings.filter((r) => r.needle.deviationCount > 2)
    if (highDeviation.length > readings.length * 0.5) recs.push('Over 50% of files have high deviation — reduce any/eval usage')
  }

  return recs
}

// ─── buildMagneticCompassResult ──────────────────────────

/** @example buildMagneticCompassResult(files, contents, options) returns full result */
export function buildMagneticCompassResult(files: string[], contents: string[], _options?: Record<string, unknown>): MagneticCompassResult {
  const readings = files.map((file, i) => analyzeCompassReading(contents[i] ?? '', file))

  const roseMap = new Map<string, CompassReading[]>()
  readings.forEach((reading) => {
    const parts = reading.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = roseMap.get(dir)
    if (existing) existing.push(reading)
    else roseMap.set(dir, [reading])
  })

  const roses = Array.from(roseMap.entries()).map(([dir, rs]) => analyzeCompassRose(rs, dir))

  const avgNeedlePrecision = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.needlePrecision, 0) / readings.length) : 0
  const avgMagneticAlignment = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.magneticAlignment, 0) / readings.length) : 0
  const avgCardinalDirection = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.cardinalDirection, 0) / readings.length) : 0
  const avgDeclinationCorrection = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.declinationCorrection, 0) / readings.length) : 0
  const avgBearingStability = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.bearingStability, 0) / readings.length) : 0
  const avgNavigationSkill = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.navigationSkill, 0) / readings.length) : 0

  const overallOrientation = Math.round(
    avgNeedlePrecision * 0.15 +
    avgMagneticAlignment * 0.2 +
    avgCardinalDirection * 0.15 +
    avgDeclinationCorrection * 0.15 +
    avgBearingStability * 0.2 +
    avgNavigationSkill * 0.15,
  )

  const chart = {
    avgPrecision: avgNeedlePrecision,
    avgAlignment: avgMagneticAlignment,
    avgNavigation: avgNavigationSkill,
    isOriented: overallOrientation >= 60,
    overallOrientation,
  }

  const stats = {
    totalFiles: files.length,
    totalRoses: roses.length,
    avgNeedlePrecision,
    avgMagneticAlignment,
    avgCardinalDirection,
    avgDeclinationCorrection,
    avgBearingStability,
    avgNavigationSkill,
    masterCompassCount: readings.filter((r) => r.condition === 'master-compass').length,
    precisionInstrumentCount: readings.filter((r) => r.condition === 'precision-instrument').length,
    reliableCompassCount: readings.filter((r) => r.condition === 'reliable-compass').length,
    basicToolCount: readings.filter((r) => r.condition === 'basic-tool').length,
    damagedCompassCount: readings.filter((r) => r.condition === 'damaged-compass').length,
    spinningWheelCount: readings.filter((r) => r.condition === 'spinning-wheel').length,
    hasHighPrecisionCount: readings.filter((r) => r.needle.hasHighPrecision).length,
    hasHighLevelCount: readings.filter((r) => r.alignment.hasHighLevel).length,
    hasHighClarityCount: readings.filter((r) => r.cardinal.hasHighClarity).length,
    hasHighCorrectionCount: readings.filter((r) => r.declination.hasHighCorrection).length,
    hasHighStabilityCount: readings.filter((r) => r.bearing.hasHighStability).length,
    hasHighSkillCount: readings.filter((r) => r.navigation.hasHighSkill).length,
    overallOrientation,
    navigatorGrade: classifyNavigatorGrade(overallOrientation),
    bestReading: '',
    mostPrecise: '',
    mostAligned: '',
    clearestDirection: '',
    bestAdjusted: '',
    mostStable: '',
  }

  if (readings.length > 0) {
    stats.bestReading = readings.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostPrecise = readings.reduce((a, b) => a.needlePrecision >= b.needlePrecision ? a : b).file
    stats.mostAligned = readings.reduce((a, b) => a.magneticAlignment >= b.magneticAlignment ? a : b).file
    stats.clearestDirection = readings.reduce((a, b) => a.cardinalDirection >= b.cardinalDirection ? a : b).file
    stats.bestAdjusted = readings.reduce((a, b) => a.declinationCorrection >= b.declinationCorrection ? a : b).file
    stats.mostStable = readings.reduce((a, b) => a.bearingStability >= b.bearingStability ? a : b).file
  }

  const recommendations = generateRecommendations(readings, roses, chart, stats)

  return { readings, roses, chart, stats, recommendations }
}
