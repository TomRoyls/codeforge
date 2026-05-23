// ─── Interfaces ──────────────────────────────────────────

export interface GearMeasure {
  precision: number
  grade: 'chronometer-grade' | 'swiss-watch' | 'precision' | 'standard' | 'rough' | 'broken-gear'
  hasHighPrecision: boolean
  hasProperToothProfile: boolean
  hasNoBacklash: boolean
  hasTightTolerance: boolean
  hasNoSlipping: boolean
  hasProperMeshing: boolean
  hasNoGrinding: boolean
  hasAccurate: boolean
  hasNoWobble: boolean
  hasConsistent: boolean
  backlashCount: number
  grindingCount: number
}

export interface HarmonyMeasure {
  level: number
  state: 'symphony-of-gears' | 'well-coordinated' | 'synchronized' | 'mostly-synced' | 'desynchronized' | 'seized'
  hasHighLevel: boolean
  hasProperSynchronization: boolean
  hasNoInterference: boolean
  hasSmoothOperation: boolean
  hasNoCollision: boolean
  hasProperPhasing: boolean
  hasNoJamming: boolean
  hasBalanced: boolean
  hasNoOverloading: boolean
  hasEfficient: boolean
  collisionCount: number
  jammingCount: number
}

export interface OrbitalMeasure {
  logic: number
  pattern: 'keplerian-orbit' | 'stable-orbit' | 'circular' | 'elliptical' | 'decaying' | 'chaotic'
  hasHighLogic: boolean
  hasProperTrajectory: boolean
  hasNoRetrograde: boolean
  hasPredictable: boolean
  hasNoAnomalies: boolean
  hasProperVelocity: boolean
  hasNoEscape: boolean
  hasStablePeriod: boolean
  hasNoCollision: boolean
  hasOrdered: boolean
  anomalyCount: number
  collisionCount: number
}

export interface EscapementMeasure {
  quality: number
  mechanism: 'tourbillon' | 'coaxial-escapement' | 'lever-escapement' | 'simple-escapement' | 'dead-beat' | 'stopped'
  hasHighQuality: boolean
  hasProperRegulation: boolean
  hasConsistent: boolean
  hasNoSkipping: boolean
  hasProperImpulse: boolean
  hasNoStalling: boolean
  hasReliable: boolean
  hasNoOverbanking: boolean
  hasAccurate: boolean
  hasNoIrregularity: boolean
  skippingCount: number
  stallingCount: number
}

export interface TimeMeasure {
  keeping: number
  accuracy: 'atomic-clock' | 'chronometer' | 'precision-time' | 'standard-time' | 'slow-clock' | 'broken-clock'
  hasHighKeeping: boolean
  hasProperCalibration: boolean
  hasNoDrift: boolean
  hasConsistent: boolean
  hasNoSkipping: boolean
  hasLongTerm: boolean
  hasNoDegradation: boolean
  hasRobust: boolean
  hasNoVulnerability: boolean
  hasEnduring: boolean
  driftCount: number
  vulnerabilityCount: number
}

export interface AstronomicalMeasure {
  accuracy: number
  fidelity: 'planetarium-grade' | 'astronomical' | 'navigational' | 'educational' | 'decorative' | 'broken'
  hasHighAccuracy: boolean
  hasProperScale: boolean
  hasAccurateMotion: boolean
  hasNoDistortion: boolean
  hasBeautiful: boolean
  hasNoError: boolean
  hasComplete: boolean
  hasNoMissing: boolean
  hasElegant: boolean
  hasNoExcess: boolean
  errorCount: number
  missingCount: number
}

export interface GearAssembly {
  file: string
  gearPrecision: number
  mechanicalHarmony: number
  orbitalLogic: number
  escapementQuality: number
  timekeeping: number
  astronomicalAccuracy: number
  gear: GearMeasure
  harmony: HarmonyMeasure
  orbital: OrbitalMeasure
  escapement: EscapementMeasure
  time: TimeMeasure
  astronomical: AstronomicalMeasure
  condition: 'masterwork-orrery' | 'precision-instrument' | 'functional-clock' | 'ticking-device' | 'broken-mechanism' | 'static'
  qualityScore: number
}

export interface ClockChamber {
  directory: string
  assemblies: GearAssembly[]
  avgPrecision: number
  avgHarmony: number
  avgAccuracy: number
  masterworkCount: number
  staticCount: number
  preciseCount: number
  harmoniousCount: number
  chamberType: 'grand-orrery' | 'clock-tower' | 'watchmakers-bench' | 'clock-workshop' | 'junk-drawer' | 'empty'
  condition: 'horological-masterpiece' | 'precision-workshop' | 'working-clock' | 'ticking' | 'stopped' | 'ruined'
}

export interface ClockworkOrreryResult {
  assemblies: GearAssembly[]
  chambers: ClockChamber[]
  clocktower: {
    avgPrecision: number
    avgHarmony: number
    avgAccuracy: number
    isPrecise: boolean
    overallPrecision: number
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgGearPrecision: number
    avgMechanicalHarmony: number
    avgOrbitalLogic: number
    avgEscapementQuality: number
    avgTimekeeping: number
    avgAstronomicalAccuracy: number
    masterworkOrreryCount: number
    precisionInstrumentCount: number
    functionalClockCount: number
    tickingDeviceCount: number
    brokenMechanismCount: number
    staticCount: number
    hasHighPrecisionCount: number
    hasHighHarmonyCount: number
    hasHighLogicCount: number
    hasHighQualityCount: number
    hasHighKeepingCount: number
    hasHighAccuracyCount: number
    overallPrecision: number
    horologistGrade: 'master-horologist' | 'clockmaker' | 'watchmaker' | 'repairman' | 'tinkerer' | 'breaker'
    bestAssembly: string
    mostPrecise: string
    mostHarmonious: string
    bestLogic: string
    bestTiming: string
    mostReliable: string
  }
  recommendations: string[]
}

// ─── Regex Patterns (no g flag on .test()-only regexes) ──────

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
const RETURN_RE = /\breturn\b/
const THROW_RE = /\bthrow\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureGear ──────────────────────────────────────────

/** @example measureGear(content) returns GearMeasure */
export function measureGear(content: string): GearMeasure {
  let score = 0

  const hasProperToothProfile = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const backlashCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBacklash = backlashCount === 0
  const hasTightTolerance = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoSlipping = !NESTED_TERNARY_RE.test(content)
  const hasProperMeshing = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const grindingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoGrinding = grindingCount === 0
  const hasAccurate = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoWobble = (content.match(HACK_RE) || []).length === 0
  const hasConsistent = RETURN_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperToothProfile) score += 12
  if (hasNoBacklash) score += 12
  if (hasTightTolerance) score += 10
  if (hasNoSlipping) score += 10
  if (hasProperMeshing) score += 10
  if (hasNoGrinding) score += 10
  if (hasAccurate) score += 11
  if (hasNoWobble) score += 10
  if (hasConsistent) score += 10

  const precision = Math.min(100, Math.max(0, score))
  const hasHighPrecision = precision >= 70

  let grade: GearMeasure['grade'] = 'broken-gear'
  if (hasHighPrecision && hasNoBacklash && hasProperToothProfile && hasAccurate) grade = 'chronometer-grade'
  else if (hasHighPrecision && hasNoBacklash) grade = 'swiss-watch'
  else if (hasHighPrecision) grade = 'precision'
  else if (hasProperToothProfile && hasTightTolerance) grade = 'standard'
  else if (precision > 30) grade = 'rough'

  return {
    precision, grade, hasHighPrecision, hasProperToothProfile, hasNoBacklash,
    hasTightTolerance, hasNoSlipping, hasProperMeshing, hasNoGrinding,
    hasAccurate, hasNoWobble, hasConsistent, backlashCount, grindingCount,
  }
}

// ─── measureHarmony ───────────────────────────────────────

/** @example measureHarmony(content) returns HarmonyMeasure */
export function measureHarmony(content: string): HarmonyMeasure {
  let score = 0

  const hasProperSynchronization = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoInterference = !NESTED_TERNARY_RE.test(content)
  const hasSmoothOperation = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const collisionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoCollision = collisionCount === 0
  const hasProperPhasing = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const jammingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoJamming = jammingCount === 0
  const hasBalanced = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoOverloading = (content.match(CONSOLE_RE) || []).length === 0
  const hasEfficient = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasProperSynchronization) score += 10
  if (hasNoInterference) score += 10
  if (hasSmoothOperation) score += 12
  if (hasNoCollision) score += 12
  if (hasProperPhasing) score += 10
  if (hasNoJamming) score += 10
  if (hasBalanced) score += 11
  if (hasNoOverloading) score += 10
  if (hasEfficient) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let state: HarmonyMeasure['state'] = 'seized'
  if (hasHighLevel && hasNoCollision && hasSmoothOperation && hasEfficient) state = 'symphony-of-gears'
  else if (hasHighLevel && hasNoCollision) state = 'well-coordinated'
  else if (hasHighLevel) state = 'synchronized'
  else if (hasProperPhasing && hasBalanced) state = 'mostly-synced'
  else if (level > 30) state = 'desynchronized'

  return {
    level, state, hasHighLevel, hasProperSynchronization, hasNoInterference,
    hasSmoothOperation, hasNoCollision, hasProperPhasing, hasNoJamming,
    hasBalanced, hasNoOverloading, hasEfficient, collisionCount, jammingCount,
  }
}

// ─── measureOrbital ───────────────────────────────────────

/** @example measureOrbital(content) returns OrbitalMeasure */
export function measureOrbital(content: string): OrbitalMeasure {
  let score = 0

  const hasProperTrajectory = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasNoRetrograde = !NESTED_TERNARY_RE.test(content)
  const hasPredictable = TRY_RE.test(content) && CATCH_RE.test(content)
  const anomalyCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAnomalies = anomalyCount === 0
  const hasProperVelocity = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoEscape = THROW_RE.test(content)
  const hasStablePeriod = RETURN_RE.test(content)
  const collisionCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoCollision = collisionCount === 0
  const hasOrdered = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasProperTrajectory) score += 10
  if (hasNoRetrograde) score += 10
  if (hasPredictable) score += 12
  if (hasNoAnomalies) score += 12
  if (hasProperVelocity) score += 10
  if (hasNoEscape) score += 11
  if (hasStablePeriod) score += 10
  if (hasNoCollision) score += 10
  if (hasOrdered) score += 10

  const logic = Math.min(100, Math.max(0, score))
  const hasHighLogic = logic >= 70

  let pattern: OrbitalMeasure['pattern'] = 'chaotic'
  if (hasHighLogic && hasNoAnomalies && hasPredictable && hasOrdered) pattern = 'keplerian-orbit'
  else if (hasHighLogic && hasNoAnomalies) pattern = 'stable-orbit'
  else if (hasHighLogic) pattern = 'circular'
  else if (hasProperTrajectory && hasPredictable) pattern = 'elliptical'
  else if (logic > 30) pattern = 'decaying'

  return {
    logic, pattern, hasHighLogic, hasProperTrajectory, hasNoRetrograde,
    hasPredictable, hasNoAnomalies, hasProperVelocity, hasNoEscape,
    hasStablePeriod, hasNoCollision, hasOrdered, anomalyCount, collisionCount,
  }
}

// ─── measureEscapement ────────────────────────────────────

/** @example measureEscapement(content) returns EscapementMeasure */
export function measureEscapement(content: string): EscapementMeasure {
  let score = 0

  const hasProperRegulation = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasConsistent = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const skippingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoSkipping = skippingCount === 0
  const hasProperImpulse = TRY_RE.test(content) && CATCH_RE.test(content)
  const stallingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoStalling = stallingCount === 0
  const hasReliable = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoOverbanking = !NESTED_TERNARY_RE.test(content)
  const hasAccurate = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoIrregularity = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperRegulation) score += 12
  if (hasConsistent) score += 10
  if (hasNoSkipping) score += 12
  if (hasProperImpulse) score += 10
  if (hasNoStalling) score += 10
  if (hasReliable) score += 10
  if (hasNoOverbanking) score += 11
  if (hasAccurate) score += 10
  if (hasNoIrregularity) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let mechanism: EscapementMeasure['mechanism'] = 'stopped'
  if (hasHighQuality && hasNoSkipping && hasProperRegulation && hasAccurate) mechanism = 'tourbillon'
  else if (hasHighQuality && hasNoSkipping) mechanism = 'coaxial-escapement'
  else if (hasHighQuality) mechanism = 'lever-escapement'
  else if (hasProperRegulation && hasProperImpulse) mechanism = 'simple-escapement'
  else if (quality > 30) mechanism = 'dead-beat'

  return {
    quality, mechanism, hasHighQuality, hasProperRegulation, hasConsistent,
    hasNoSkipping, hasProperImpulse, hasNoStalling, hasReliable,
    hasNoOverbanking, hasAccurate, hasNoIrregularity, skippingCount, stallingCount,
  }
}

// ─── measureTime ──────────────────────────────────────────

/** @example measureTime(content) returns TimeMeasure */
export function measureTime(content: string): TimeMeasure {
  let score = 0

  const hasProperCalibration = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const driftCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDrift = driftCount === 0
  const hasConsistent = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoSkipping = !NESTED_TERNARY_RE.test(content)
  const hasLongTerm = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDegradation = (content.match(TODO_RE) || []).length === 0
  const hasRobust = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const vulnerabilityCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoVulnerability = vulnerabilityCount === 0
  const hasEnduring = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasProperCalibration) score += 12
  if (hasNoDrift) score += 12
  if (hasConsistent) score += 10
  if (hasNoSkipping) score += 10
  if (hasLongTerm) score += 10
  if (hasNoDegradation) score += 10
  if (hasRobust) score += 11
  if (hasNoVulnerability) score += 10
  if (hasEnduring) score += 10

  const keeping = Math.min(100, Math.max(0, score))
  const hasHighKeeping = keeping >= 70

  let accuracy: TimeMeasure['accuracy'] = 'broken-clock'
  if (hasHighKeeping && hasNoDrift && hasProperCalibration && hasEnduring) accuracy = 'atomic-clock'
  else if (hasHighKeeping && hasNoDrift) accuracy = 'chronometer'
  else if (hasHighKeeping) accuracy = 'precision-time'
  else if (hasProperCalibration && hasConsistent) accuracy = 'standard-time'
  else if (keeping > 30) accuracy = 'slow-clock'

  return {
    keeping, accuracy, hasHighKeeping, hasProperCalibration, hasNoDrift,
    hasConsistent, hasNoSkipping, hasLongTerm, hasNoDegradation, hasRobust,
    hasNoVulnerability, hasEnduring, driftCount, vulnerabilityCount,
  }
}

// ─── measureAstronomical ──────────────────────────────────

/** @example measureAstronomical(content) returns AstronomicalMeasure */
export function measureAstronomical(content: string): AstronomicalMeasure {
  let score = 0

  const hasProperScale = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasAccurateMotion = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoDistortion = !NESTED_TERNARY_RE.test(content)
  const hasBeautiful = (content.match(DOC_COMMENT_RE) || []).length > 0
  const errorCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoError = errorCount === 0
  const hasComplete = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const missingCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoMissing = missingCount === 0
  const hasElegant = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoExcess = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperScale) score += 10
  if (hasAccurateMotion) score += 12
  if (hasNoDistortion) score += 10
  if (hasBeautiful) score += 10
  if (hasNoError) score += 12
  if (hasComplete) score += 10
  if (hasNoMissing) score += 11
  if (hasElegant) score += 10
  if (hasNoExcess) score += 10

  const accuracy = Math.min(100, Math.max(0, score))
  const hasHighAccuracy = accuracy >= 70

  let fidelity: AstronomicalMeasure['fidelity'] = 'broken'
  if (hasHighAccuracy && hasNoError && hasBeautiful && hasComplete) fidelity = 'planetarium-grade'
  else if (hasHighAccuracy && hasNoError) fidelity = 'astronomical'
  else if (hasHighAccuracy) fidelity = 'navigational'
  else if (hasProperScale && hasAccurateMotion) fidelity = 'educational'
  else if (accuracy > 30) fidelity = 'decorative'

  return {
    accuracy, fidelity, hasHighAccuracy, hasProperScale, hasAccurateMotion,
    hasNoDistortion, hasBeautiful, hasNoError, hasComplete, hasNoMissing,
    hasElegant, hasNoExcess, errorCount, missingCount,
  }
}

// ─── classifyCondition ────────────────────────────────────

/** @example classifyCondition(assembly) returns condition */
export function classifyCondition(assembly: GearAssembly): GearAssembly['condition'] {
  const { qualityScore } = assembly
  if (qualityScore >= 80) return 'masterwork-orrery'
  if (qualityScore >= 65) return 'precision-instrument'
  if (qualityScore >= 50) return 'functional-clock'
  if (qualityScore >= 35) return 'ticking-device'
  if (qualityScore >= 20) return 'broken-mechanism'
  return 'static'
}

// ─── analyzeGearAssembly ──────────────────────────────────

/** @example analyzeGearAssembly(content, filePath) returns full assembly */
export function analyzeGearAssembly(content: string, filePath: string): GearAssembly {
  const gear = measureGear(content)
  const harmony = measureHarmony(content)
  const orbital = measureOrbital(content)
  const escapement = measureEscapement(content)
  const time = measureTime(content)
  const astronomical = measureAstronomical(content)

  const gearPrecision = gear.precision
  const mechanicalHarmony = harmony.level
  const orbitalLogic = orbital.logic
  const escapementQuality = escapement.quality
  const timekeeping = time.keeping
  const astronomicalAccuracy = astronomical.accuracy

  const qualityScore = Math.round(
    gearPrecision * 0.2 +
    mechanicalHarmony * 0.15 +
    orbitalLogic * 0.15 +
    escapementQuality * 0.15 +
    timekeeping * 0.15 +
    astronomicalAccuracy * 0.2,
  )

  const result: GearAssembly = {
    file: filePath,
    gearPrecision, mechanicalHarmony, orbitalLogic,
    escapementQuality, timekeeping, astronomicalAccuracy,
    gear, harmony, orbital, escapement, time, astronomical,
    qualityScore,
    condition: 'static',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyChamberType ──────────────────────────────────

/** @example classifyChamberType(assemblies) returns chamber type */
export function classifyChamberType(assemblies: GearAssembly[]): ClockChamber['chamberType'] {
  if (assemblies.length === 0) return 'empty'
  const avgScore = assemblies.reduce((s, a) => s + a.qualityScore, 0) / assemblies.length
  const masterworkCnt = assemblies.filter((a) => a.condition === 'masterwork-orrery').length
  if (avgScore >= 75 && masterworkCnt >= Math.ceil(assemblies.length * 0.3)) return 'grand-orrery'
  if (avgScore >= 60) return 'clock-tower'
  if (avgScore >= 45) return 'watchmakers-bench'
  if (avgScore >= 30) return 'clock-workshop'
  if (avgScore >= 15) return 'junk-drawer'
  return 'empty'
}

// ─── analyzeClockChamber ──────────────────────────────────

/** @example analyzeClockChamber(assemblies, dirPath) returns ClockChamber */
export function analyzeClockChamber(assemblies: GearAssembly[], dirPath: string): ClockChamber {
  if (assemblies.length === 0) {
    return {
      directory: dirPath, assemblies: [], avgPrecision: 0, avgHarmony: 0,
      avgAccuracy: 0, masterworkCount: 0, staticCount: 0,
      preciseCount: 0, harmoniousCount: 0,
      chamberType: 'empty', condition: 'ruined',
    }
  }

  const avgPrecision = Math.round(assemblies.reduce((s, a) => s + a.gearPrecision, 0) / assemblies.length)
  const avgHarmony = Math.round(assemblies.reduce((s, a) => s + a.mechanicalHarmony, 0) / assemblies.length)
  const avgAccuracy = Math.round(assemblies.reduce((s, a) => s + a.astronomicalAccuracy, 0) / assemblies.length)
  const masterworkCount = assemblies.filter((a) => a.condition === 'masterwork-orrery').length
  const staticCount = assemblies.filter((a) => a.condition === 'static').length
  const preciseCount = assemblies.filter((a) => a.gear.hasHighPrecision).length
  const harmoniousCount = assemblies.filter((a) => a.harmony.hasHighLevel).length

  const chamberType = classifyChamberType(assemblies)
  const avgScore = assemblies.reduce((s, a) => s + a.qualityScore, 0) / assemblies.length
  let condition: ClockChamber['condition'] = 'ruined'
  if (avgScore >= 75) condition = 'horological-masterpiece'
  else if (avgScore >= 60) condition = 'precision-workshop'
  else if (avgScore >= 45) condition = 'working-clock'
  else if (avgScore >= 30) condition = 'ticking'
  else if (avgScore >= 15) condition = 'stopped'

  return {
    directory: dirPath, assemblies, avgPrecision, avgHarmony, avgAccuracy,
    masterworkCount, staticCount, preciseCount, harmoniousCount,
    chamberType, condition,
  }
}

// ─── classifyHorologistGrade ──────────────────────────────

/** @example classifyHorologistGrade(avgPrecision) returns grade */
export function classifyHorologistGrade(avgPrecision: number): ClockworkOrreryResult['stats']['horologistGrade'] {
  if (avgPrecision >= 80) return 'master-horologist'
  if (avgPrecision >= 65) return 'clockmaker'
  if (avgPrecision >= 50) return 'watchmaker'
  if (avgPrecision >= 35) return 'repairman'
  if (avgPrecision >= 20) return 'tinkerer'
  return 'breaker'
}

// ─── generateRecommendations ──────────────────────────────

/** @example generateRecommendations(assemblies, chambers, clocktower, stats) returns string[] */
export function generateRecommendations(
  assemblies: GearAssembly[],
  chambers: ClockChamber[],
  clocktower: ClockworkOrreryResult['clocktower'],
  stats: ClockworkOrreryResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgGearPrecision < 50) recs.push('Improve gear precision — add interfaces and types for proper tooth profiles')
  if (stats.avgMechanicalHarmony < 50) recs.push('Enhance mechanical harmony — coordinate imports/exports for synchronized operation')
  if (stats.avgOrbitalLogic < 50) recs.push('Fix orbital logic — add error handling for predictable code trajectories')
  if (stats.avgEscapementQuality < 50) recs.push('Improve escapement quality — add type safety and proper regulation')
  if (stats.avgTimekeeping < 50) recs.push('Boost timekeeping reliability — add robust error handling for long-term stability')
  if (stats.avgAstronomicalAccuracy < 50) recs.push('Increase astronomical accuracy — improve documentation and reduce any types')
  if (stats.staticCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of assemblies are static — consider major refactoring')
  if (stats.brokenMechanismCount > 0) recs.push('Warning: broken mechanisms detected — these files need immediate repair')
  if (clocktower.overallPrecision < 40) recs.push('Overall precision is critically low — establish a clockwork recovery plan')
  if (chambers.length > 0 && chambers.every((c) => c.condition === 'ruined')) recs.push('All chambers are ruined — your codebase needs fundamental clockwork restoration')

  if (assemblies.length > 0) {
    const highBacklash = assemblies.filter((a) => a.gear.backlashCount > 2)
    if (highBacklash.length > assemblies.length * 0.5) recs.push('Over 50% of gears have high backlash — reduce any/eval usage')
  }

  return recs
}

// ─── buildClockworkOrreryResult ───────────────────────────

/** @example buildClockworkOrreryResult(files, contents) returns full result */
export function buildClockworkOrreryResult(files: string[], contents: string[]): ClockworkOrreryResult {
  const assemblies = files.map((file, i) => analyzeGearAssembly(contents[i] ?? '', file))

  const chamberMap = new Map<string, GearAssembly[]>()
  assemblies.forEach((assembly) => {
    const parts = assembly.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = chamberMap.get(dir)
    if (existing) existing.push(assembly)
    else chamberMap.set(dir, [assembly])
  })

  const chambers = Array.from(chamberMap.entries()).map(([dir, asms]) => analyzeClockChamber(asms, dir))

  const avgGearPrecision = assemblies.length > 0 ? Math.round(assemblies.reduce((s, a) => s + a.gearPrecision, 0) / assemblies.length) : 0
  const avgMechanicalHarmony = assemblies.length > 0 ? Math.round(assemblies.reduce((s, a) => s + a.mechanicalHarmony, 0) / assemblies.length) : 0
  const avgOrbitalLogic = assemblies.length > 0 ? Math.round(assemblies.reduce((s, a) => s + a.orbitalLogic, 0) / assemblies.length) : 0
  const avgEscapementQuality = assemblies.length > 0 ? Math.round(assemblies.reduce((s, a) => s + a.escapementQuality, 0) / assemblies.length) : 0
  const avgTimekeeping = assemblies.length > 0 ? Math.round(assemblies.reduce((s, a) => s + a.timekeeping, 0) / assemblies.length) : 0
  const avgAstronomicalAccuracy = assemblies.length > 0 ? Math.round(assemblies.reduce((s, a) => s + a.astronomicalAccuracy, 0) / assemblies.length) : 0

  const overallPrecision = Math.round(
    avgGearPrecision * 0.2 +
    avgMechanicalHarmony * 0.15 +
    avgOrbitalLogic * 0.15 +
    avgEscapementQuality * 0.15 +
    avgTimekeeping * 0.15 +
    avgAstronomicalAccuracy * 0.2,
  )

  const clocktower = {
    avgPrecision: avgGearPrecision,
    avgHarmony: avgMechanicalHarmony,
    avgAccuracy: avgAstronomicalAccuracy,
    isPrecise: overallPrecision >= 60,
    overallPrecision,
  }

  const stats = {
    totalFiles: files.length,
    totalChambers: chambers.length,
    avgGearPrecision,
    avgMechanicalHarmony,
    avgOrbitalLogic,
    avgEscapementQuality,
    avgTimekeeping,
    avgAstronomicalAccuracy,
    masterworkOrreryCount: assemblies.filter((a) => a.condition === 'masterwork-orrery').length,
    precisionInstrumentCount: assemblies.filter((a) => a.condition === 'precision-instrument').length,
    functionalClockCount: assemblies.filter((a) => a.condition === 'functional-clock').length,
    tickingDeviceCount: assemblies.filter((a) => a.condition === 'ticking-device').length,
    brokenMechanismCount: assemblies.filter((a) => a.condition === 'broken-mechanism').length,
    staticCount: assemblies.filter((a) => a.condition === 'static').length,
    hasHighPrecisionCount: assemblies.filter((a) => a.gear.hasHighPrecision).length,
    hasHighHarmonyCount: assemblies.filter((a) => a.harmony.hasHighLevel).length,
    hasHighLogicCount: assemblies.filter((a) => a.orbital.hasHighLogic).length,
    hasHighQualityCount: assemblies.filter((a) => a.escapement.hasHighQuality).length,
    hasHighKeepingCount: assemblies.filter((a) => a.time.hasHighKeeping).length,
    hasHighAccuracyCount: assemblies.filter((a) => a.astronomical.hasHighAccuracy).length,
    overallPrecision,
    horologistGrade: classifyHorologistGrade(overallPrecision),
    bestAssembly: '',
    mostPrecise: '',
    mostHarmonious: '',
    bestLogic: '',
    bestTiming: '',
    mostReliable: '',
  }

  if (assemblies.length > 0) {
    stats.bestAssembly = assemblies.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostPrecise = assemblies.reduce((a, b) => a.gearPrecision >= b.gearPrecision ? a : b).file
    stats.mostHarmonious = assemblies.reduce((a, b) => a.mechanicalHarmony >= b.mechanicalHarmony ? a : b).file
    stats.bestLogic = assemblies.reduce((a, b) => a.orbitalLogic >= b.orbitalLogic ? a : b).file
    stats.bestTiming = assemblies.reduce((a, b) => a.escapementQuality >= b.escapementQuality ? a : b).file
    stats.mostReliable = assemblies.reduce((a, b) => a.timekeeping >= b.timekeeping ? a : b).file
  }

  const recommendations = generateRecommendations(assemblies, chambers, clocktower, stats)

  return { assemblies, chambers, clocktower, stats, recommendations }
}
