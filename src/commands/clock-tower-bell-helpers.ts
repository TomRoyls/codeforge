// ─── Interfaces ────────────────────────────────────────────────────────────

export interface TimekeepingMeasure {
  accuracy: number
  mechanism: 'atomic' | 'quartz' | 'mechanical' | 'pendulum' | 'water-clock' | 'sundial'
  isPrecise: boolean
  hasProperCalibration: boolean
  hasCompensation: boolean
  hasSynchronization: boolean
  hasTimezone: boolean
  hasEpoch: boolean
  hasLeapSecond: boolean
  hasDriftCorrection: boolean
  hasAccuracyRating: boolean
  driftAmount: number
}

export interface BellMeasure {
  resonance: number
  tone: 'deep-bass' | 'tenor' | 'alto' | 'soprano' | 'tinny' | 'silent'
  isClearTone: boolean
  hasProperAcoustics: boolean
  hasFullResonance: boolean
  hasHarmonicOvertones: boolean
  hasNoCracks: boolean
  hasNoDampening: boolean
  hasProperStrike: boolean
  hasRinging: boolean
  hasSustain: boolean
  hasDecay: boolean
  crackCount: number
}

export interface GearMeasure {
  precision: number
  type: 'escapement' | 'crown' | 'spur' | 'worm' | 'planetary' | 'broken'
  isPrecise: boolean
  hasProperMeshing: boolean
  hasLowBacklash: boolean
  hasSmoothEngagement: boolean
  hasProperRatio: boolean
  hasNoGrinding: boolean
  hasNoSlipping: boolean
  hasNoJamming: boolean
  hasLubrication: boolean
  hasWearPattern: boolean
  slippingCount: number
  jammingCount: number
}

export interface ChimeMeasure {
  pattern: number
  melody: 'westminster' | 'whittington' | 'st-michaels' | 'custom' | 'random' | 'cacophony'
  hasRegularInterval: boolean
  hasProperSequence: boolean
  hasQuarterChime: boolean
  hasHourChime: boolean
  hasSpecialOccasion: boolean
  hasChimeCount: boolean
  hasSilentNight: boolean
  hasDawnChorus: boolean
  hasTolling: boolean
  hasMuffled: boolean
  silentPeriodCount: number
}

export interface WindingMeasure {
  reliability: number
  method: 'automatic' | 'manual' | 'electric' | 'gravity' | 'spring' | 'unwound'
  isRegularlyWound: boolean
  hasPowerReserve: boolean
  hasOverwindProtection: boolean
  hasMaintenance: boolean
  hasSelfWinding: boolean
  hasBackupPower: boolean
  hasWearCompensation: boolean
  hasServiceHistory: boolean
  isFullyWound: boolean
  hasRunDown: boolean
  runDownCount: number
}

export interface TowerMeasure {
  stability: number
  construction: 'stone' | 'brick' | 'steel' | 'concrete' | 'wood' | 'lean-to'
  isStructurallySound: boolean
  hasProperFoundation: boolean
  hasReinforcement: boolean
  hasWeatherVane: boolean
  hasClockFaces: boolean
  hasObservationDeck: boolean
  hasBellChamber: boolean
  hasStaircase: boolean
  hasBelfry: boolean
  hasNoLean: boolean
  hasCracks: boolean
  crackCount: number
}

export interface BellReading {
  file: string
  timeAccuracy: number
  bellResonance: number
  gearPrecision: number
  chimePattern: number
  windingReliability: number
  towerStability: number
  timekeeping: TimekeepingMeasure
  bell: BellMeasure
  gear: GearMeasure
  chime: ChimeMeasure
  winding: WindingMeasure
  tower: TowerMeasure
  condition: 'big-ben' | 'precision-clock' | 'village-clock' | 'cuckoo-clock' | 'broken-clock' | 'ruin'
  qualityScore: number
}

export interface ClockDistrict {
  directory: string
  readings: BellReading[]
  avgTimeAccuracy: number
  avgBellResonance: number
  avgTowerStability: number
  bigBenCount: number
  ruinCount: number
  preciseCount: number
  woundCount: number
  districtType: 'capital-district' | 'city-center' | 'town-square' | 'village-green' | 'back-alley' | 'ghost-town'
  condition: 'master-clockmaker' | 'clockmaker' | 'watchmaker' | 'repair-shop' | 'junk-shop' | 'ruins'
}

export interface ClockTowerBellStats {
  totalFiles: number
  totalDistricts: number
  avgTimeAccuracy: number
  avgBellResonance: number
  avgGearPrecision: number
  avgChimePattern: number
  avgWindingReliability: number
  avgTowerStability: number
  bigBenCount: number
  precisionClockCount: number
  villageClockCount: number
  cuckooClockCount: number
  brokenClockCount: number
  ruinCount: number
  isPreciseCount: number
  hasSynchronizationCount: number
  isClearToneCount: number
  hasNoCracksCount: number
  hasProperMeshingCount: number
  hasNoSlippingCount: number
  hasRegularIntervalCount: number
  isRegularlyWoundCount: number
  isStructurallySoundCount: number
  hasNoLeanCount: number
  overallTiming: number
  horologistGrade: 'master-horologist' | 'clockmaker' | 'watchmaker' | 'repairman' | 'novice' | 'time-lost'
  bestReading: string
  mostAccurate: string
  clearestBell: string
  mostPreciseGear: string
  mostStableTower: string
}

export interface ClockTowerBellResult {
  readings: BellReading[]
  districts: ClockDistrict[]
  guild: {
    avgTimeAccuracy: number
    avgBellResonance: number
    avgTowerStability: number
    isPrecise: boolean
    overallTiming: number
  }
  stats: ClockTowerBellStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────────────

const TODO_REGEX = /TODO/gi
const FIXME_REGEX = /FIXME/gi
const HACK_REGEX = /HACK/gi
const DEPRECATED_REGEX = /@deprecated/g
const CONSOLE_REGEX = /console\.\w+/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /\/\/\s*@ts-ignore/g
const TS_EXPECT_ERROR_REGEX = /\/\/\s*@ts-expect-error/g
const FUNCTION_REGEX = /\bfunction\b/g
const ARROW_REGEX = /=>\s*{/g
const CLASS_REGEX = /\bclass\b/g
const INTERFACE_REGEX = /\binterface\b/g
const TYPE_REGEX = /\btype\s+\w+\s*=/g
const EXPORT_REGEX = /\bexport\b/g
const IMPORT_REGEX = /\bimport\b/g
const ASYNC_REGEX = /\basync\b/g
const AWAIT_REGEX = /\bawait\b/g
const PROMISE_REGEX = /\bPromise\b/g
const SET_TIMEOUT_REGEX = /setTimeout/g
const SET_INTERVAL_REGEX = /setInterval/g
const TRY_REGEX = /\btry\s*{/g
const CATCH_REGEX = /\bcatch\s*\(/g
const FINALLY_REGEX = /\bfinally\s*{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const RETURN_REGEX = /\breturn\b/g
const THROW_REGEX = /\bthrow\b/g
const TYPE_ANNOTATION_REGEX = /:\s*(?:string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const LINE_COMMENT_REGEX = /\/\/.*$/gm
const EVENT_REGEX = /\b(?:addEventListener|removeEventListener|emit|on|off|once)\b/g
const CALLBACK_REGEX = /\bcallback\b/gi
const TEST_REGEX = /\b(?:describe|it|test|expect)\b/g
const CACHE_REGEX = /\b(?:cache|memoize|Cache|Map)\b/g

// ─── Counting Helpers ──────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX) + countMatches(content, ARROW_REGEX)
}

function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX) + countMatches(content, SWITCH_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_REGEX) + countMatches(content, CATCH_REGEX) + countMatches(content, FINALLY_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countComments(content: string): number {
  return countMatches(content, JSDOC_REGEX) + countMatches(content, LINE_COMMENT_REGEX)
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX) + countMatches(content, FIXME_REGEX) + countMatches(content, HACK_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX) + countMatches(content, TS_EXPECT_ERROR_REGEX)
}

// ─── Measure Timekeeping ───────────────────────────────────────────────────

/** @example measureTimekeeping('export async function tick(): Promise<void> {}') returns TimekeepingMeasure */
export function measureTimekeeping(content: string): TimekeepingMeasure {
  const lines = countNonEmptyLines(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const awaits = countMatches(content, AWAIT_REGEX)
  const promises = countMatches(content, PROMISE_REGEX)
  const setTimeouts = countMatches(content, SET_TIMEOUT_REGEX)
  const setIntervals = countMatches(content, SET_INTERVAL_REGEX)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)
  const errorHandling = countErrorHandling(content)
  const tests = countMatches(content, TEST_REGEX)
  const todos = countTodos(content)
  const smells = countSmells(content)

  const hasTimers = setTimeouts > 0 || setIntervals > 0
  const hasAsync = asyncs > 0 || promises > 0
  const hasTyped = typeAnnotations > 0

  // Accuracy: high when async/await, timers, typed, error handling
  const baseAccuracy = lines === 0 ? 10 : Math.min(40, lines * 2)
  const asyncBonus = Math.min(20, (asyncs + awaits + promises) * 5)
  const timerBonus = Math.min(15, (setTimeouts + setIntervals) * 5)
  const typeBonus = Math.min(10, typeAnnotations * 2)
  const errorBonus = Math.min(10, errorHandling * 5)
  const testBonus = Math.min(10, tests * 2)
  const smellPenalty = Math.min(25, smells * 5 + Math.min(10, todos * 3))
  const accuracy = Math.max(0, Math.min(100, baseAccuracy + asyncBonus + timerBonus + typeBonus + errorBonus + testBonus - smellPenalty))

  const isPrecise = accuracy >= 65
  const hasProperCalibration = hasAsync || hasTimers
  const hasCompensation = errorHandling > 0
  const hasSynchronization = hasAsync && exports > 0
  const hasTimezone = content.includes('Date') || content.includes('time') || content.includes('Time')
  const hasEpoch = content.includes('Date') || setTimeouts > 0
  const hasLeapSecond = errorHandling > 1
  const hasDriftCorrection = tests > 0
  const hasAccuracyRating = typeAnnotations > 0 && exports > 0
  const driftAmount = Math.max(0, 100 - accuracy)

  let mechanism: TimekeepingMeasure['mechanism']
  if (accuracy >= 80 && hasAsync && tests > 0) {
    mechanism = 'atomic'
  } else if (accuracy >= 65 && hasAsync) {
    mechanism = 'quartz'
  } else if (accuracy >= 50 && hasTyped) {
    mechanism = 'mechanical'
  } else if (accuracy >= 35 && lines > 0) {
    mechanism = 'pendulum'
  } else if (accuracy >= 20) {
    mechanism = 'water-clock'
  } else {
    mechanism = 'sundial'
  }

  return {
    accuracy,
    mechanism,
    isPrecise,
    hasProperCalibration,
    hasCompensation,
    hasSynchronization,
    hasTimezone,
    hasEpoch,
    hasLeapSecond,
    hasDriftCorrection,
    hasAccuracyRating,
    driftAmount,
  }
}

// ─── Measure Bell ──────────────────────────────────────────────────────────

/** @example measureBell('export function onTick(): void {}') returns BellMeasure */
export function measureBell(content: string): BellMeasure {
  const lines = countNonEmptyLines(content)
  const exports = countExports(content)
  const events = countMatches(content, EVENT_REGEX)
  const callbacks = countMatches(content, CALLBACK_REGEX)
  const functions = countFunctions(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const smells = countSmells(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)

  const hasExports = exports > 0
  const hasEvents = events > 0
  const hasCallbacks = callbacks > 0

  // Resonance: events propagate well when exported, documented, event-driven
  const baseResonance = lines === 0 ? 10 : Math.min(40, functions * 5 + lines)
  const exportBonus = Math.min(20, exports * 5)
  const eventBonus = Math.min(15, (events + callbacks) * 5)
  const commentBonus = Math.min(10, Math.min(comments, 5) * 2)
  const errorBonus = Math.min(10, errorHandling * 3)
  const smellPenalty = Math.min(20, (smells + deprecated) * 5)
  const resonance = Math.max(0, Math.min(100, baseResonance + exportBonus + eventBonus + commentBonus + errorBonus - smellPenalty))

  const isClearTone = resonance >= 60
  const hasProperAcoustics = hasExports && functions > 0
  const hasFullResonance = hasExports && (hasEvents || hasCallbacks)
  const hasHarmonicOvertones = events > 0 && callbacks > 0
  const hasNoCracks = smells === 0
  const hasNoDampening = deprecated === 0
  const hasProperStrike = functions > 0
  const hasRinging = hasExports && comments > 0
  const hasSustain = errorHandling > 0
  const hasDecay = errorHandling > 0 && functions > 0
  const crackCount = smells

  let tone: BellMeasure['tone']
  if (resonance >= 80 && hasEvents) {
    tone = 'deep-bass'
  } else if (resonance >= 65 && hasExports) {
    tone = 'tenor'
  } else if (resonance >= 50 && functions > 0) {
    tone = 'alto'
  } else if (resonance >= 35) {
    tone = 'soprano'
  } else if (resonance >= 20) {
    tone = 'tinny'
  } else {
    tone = 'silent'
  }

  return {
    resonance,
    tone,
    isClearTone,
    hasProperAcoustics,
    hasFullResonance,
    hasHarmonicOvertones,
    hasNoCracks,
    hasNoDampening,
    hasProperStrike,
    hasRinging,
    hasSustain,
    hasDecay,
    crackCount,
  }
}

// ─── Measure Gear ──────────────────────────────────────────────────────────

/** @example measureGear('export function tick(): number { return Date.now(); }') returns GearMeasure */
export function measureGear(content: string): GearMeasure {
  const lines = countNonEmptyLines(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const typeAnnotations = countTypeAnnotations(content)
  const imports = countImports(content)
  const caches = countMatches(content, CACHE_REGEX)
  const todos = countTodos(content)
  const smells = countSmells(content)

  const totalDeclarations = functions + classes + interfaces + typeAliases
  const complexity = conditionals + loops

  // Precision: scheduling accuracy — well-structured, typed, not too complex
  const basePrecision = lines === 0 ? 10 : Math.min(40, totalDeclarations * 8 + lines)
  const typeBonus = Math.min(20, typeAnnotations * 3)
  const cacheBonus = Math.min(15, caches * 5)
  const importPenalty = Math.min(10, Math.max(0, imports - 5) * 2)
  const complexityPenalty = Math.min(20, Math.max(0, complexity - 5) * 3)
  const smellPenalty = Math.min(15, smells * 5)
  const precision = Math.max(0, Math.min(100, basePrecision + typeBonus + cacheBonus - importPenalty - complexityPenalty - smellPenalty))

  const isPrecise = precision >= 60
  const hasProperMeshing = totalDeclarations > 0 && (classes > 0 || interfaces > 0)
  const hasLowBacklash = complexity <= totalDeclarations + 2
  const hasSmoothEngagement = functions > 0 && typeAnnotations > 0
  const hasProperRatio = totalDeclarations > 0 && complexity <= totalDeclarations * 3
  const hasNoGrinding = smells === 0
  const hasNoSlipping = todos === 0
  const hasNoJamming = complexity <= 15
  const hasLubrication = caches > 0
  const hasWearPattern = imports > 0 && exports > 0
  const slippingCount = todos
  const jammingCount = Math.max(0, complexity - 10)

  let type: GearMeasure['type']
  if (precision >= 75 && hasProperMeshing) {
    type = 'escapement'
  } else if (precision >= 60 && typeAnnotations > 0) {
    type = 'crown'
  } else if (precision >= 45 && totalDeclarations > 0) {
    type = 'spur'
  } else if (precision >= 30) {
    type = 'worm'
  } else if (precision >= 15) {
    type = 'planetary'
  } else {
    type = 'broken'
  }

  return {
    precision,
    type,
    isPrecise,
    hasProperMeshing,
    hasLowBacklash,
    hasSmoothEngagement,
    hasProperRatio,
    hasNoGrinding,
    hasNoSlipping,
    hasNoJamming,
    hasLubrication,
    hasWearPattern,
    slippingCount,
    jammingCount,
  }
}

// ─── Measure Chime ─────────────────────────────────────────────────────────

/** @example measureChime('export function onHour(): void {}') returns ChimeMeasure */
export function measureChime(content: string): ChimeMeasure {
  const lines = countNonEmptyLines(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const errorHandling = countErrorHandling(content)
  const returns = countMatches(content, RETURN_REGEX)
  const throws = countMatches(content, THROW_REGEX)
  const asyncs = countMatches(content, ASYNC_REGEX)

  const hasCode = functions > 0 || lines > 0

  // Pattern: event pattern quality — well-structured flow, proper returns
  const basePattern = lines === 0 ? 10 : Math.min(40, functions * 8 + lines)
  const flowBonus = Math.min(15, (conditionals + loops) * 3)
  const returnBonus = Math.min(15, returns * 3)
  const exportBonus = Math.min(10, exports * 3)
  const errorBonus = Math.min(10, errorHandling * 3)
  const asyncBonus = Math.min(10, asyncs * 3)
  const pattern = Math.max(0, Math.min(100, basePattern + flowBonus + returnBonus + exportBonus + errorBonus + asyncBonus))

  const hasRegularInterval = conditionals > 0 || loops > 0
  const hasProperSequence = returns > 0 && conditionals > 0
  const hasQuarterChime = conditionals > 0
  const hasHourChime = exports > 0
  const hasSpecialOccasion = throws > 0
  const hasChimeCount = functions > 0
  const hasSilentNight = errorHandling > 0
  const hasDawnChorus = exports > 0 && functions > 0
  const hasTolling = errorHandling > 0
  const hasMuffled = throws > 0 || errorHandling > 0
  const silentPeriodCount = hasCode && conditionals === 0 && loops === 0 ? 1 : 0

  let melody: ChimeMeasure['melody']
  if (pattern >= 75 && conditionals > 0 && loops > 0) {
    melody = 'westminster'
  } else if (pattern >= 65 && conditionals > 0) {
    melody = 'whittington'
  } else if (pattern >= 55 && exports > 0) {
    melody = 'st-michaels'
  } else if (pattern >= 40 && hasCode) {
    melody = 'custom'
  } else if (pattern >= 25) {
    melody = 'random'
  } else {
    melody = 'cacophony'
  }

  return {
    pattern,
    melody,
    hasRegularInterval,
    hasProperSequence,
    hasQuarterChime,
    hasHourChime,
    hasSpecialOccasion,
    hasChimeCount,
    hasSilentNight,
    hasDawnChorus,
    hasTolling,
    hasMuffled,
    silentPeriodCount,
  }
}

// ─── Measure Winding ───────────────────────────────────────────────────────

/** @example measureWinding('export function maintain(): void {}') returns WindingMeasure */
export function measureWinding(content: string): WindingMeasure {
  const lines = countNonEmptyLines(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const tests = countMatches(content, TEST_REGEX)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)

  // Reliability: well-maintained code has tests, comments, error handling, typed
  const baseReliability = lines === 0 ? 10 : Math.min(35, lines)
  const commentBonus = Math.min(15, Math.min(comments, 5) * 3)
  const errorBonus = Math.min(15, errorHandling * 5)
  const testBonus = Math.min(15, tests * 3)
  const typeBonus = Math.min(10, typeAnnotations * 2)
  const structureBonus = Math.min(10, (classes + functions) * 2)
  const todoPenalty = Math.min(20, (todos + deprecated) * 5)
  const reliability = Math.max(0, Math.min(100, baseReliability + commentBonus + errorBonus + testBonus + typeBonus + structureBonus - todoPenalty))

  const isRegularlyWound = comments > 0 || tests > 0
  const hasPowerReserve = errorHandling > 0
  const hasOverwindProtection = tests > 0
  const hasMaintenance = comments > 0
  const hasSelfWinding = exports > 0 && typeAnnotations > 0
  const hasBackupPower = errorHandling > 1
  const hasWearCompensation = typeAnnotations > 0
  const hasServiceHistory = comments > 0 && tests > 0
  const isFullyWound = reliability >= 60
  const hasRunDown = todos > 2 || deprecated > 0
  const runDownCount = todos + deprecated

  let method: WindingMeasure['method']
  if (reliability >= 80 && tests > 0 && errorHandling > 0) {
    method = 'automatic'
  } else if (reliability >= 65 && (tests > 0 || comments > 0)) {
    method = 'manual'
  } else if (reliability >= 50 && errorHandling > 0) {
    method = 'electric'
  } else if (reliability >= 35) {
    method = 'gravity'
  } else if (reliability >= 20) {
    method = 'spring'
  } else {
    method = 'unwound'
  }

  return {
    reliability,
    method,
    isRegularlyWound,
    hasPowerReserve,
    hasOverwindProtection,
    hasMaintenance,
    hasSelfWinding,
    hasBackupPower,
    hasWearCompensation,
    hasServiceHistory,
    isFullyWound,
    hasRunDown,
    runDownCount,
  }
}

// ─── Measure Tower ─────────────────────────────────────────────────────────

/** @example measureTower('export class ClockTower {}') returns TowerMeasure */
export function measureTower(content: string): TowerMeasure {
  const lines = countNonEmptyLines(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)
  const nested = countMatches(content, /\{/g) - countMatches(content, /\}/g)

  const totalDeclarations = functions + classes + interfaces + typeAliases

  // Stability: solid architecture — structured, layered, well-founded
  const baseStability = lines === 0 ? 10 : Math.min(40, totalDeclarations * 6 + lines)
  const classBonus = Math.min(15, classes * 8)
  const interfaceBonus = Math.min(15, interfaces * 8)
  const errorBonus = Math.min(10, errorHandling * 3)
  const exportBonus = Math.min(10, exports * 2)
  const typeBonus = Math.min(10, typeAnnotations * 2)
  const imbalancePenalty = Math.abs(nested) > 5 ? 10 : 0
  const stability = Math.max(0, Math.min(100, baseStability + classBonus + interfaceBonus + errorBonus + exportBonus + typeBonus - imbalancePenalty))

  const isStructurallySound = stability >= 55
  const hasProperFoundation = classes > 0 || interfaces > 0
  const hasReinforcement = classes > 0 && interfaces > 0
  const hasWeatherVane = exports > 0
  const hasClockFaces = exports > 0 && imports > 0
  const hasObservationDeck = errorHandling > 0
  const hasBellChamber = functions > 0 && (classes > 0 || interfaces > 0)
  const hasStaircase = imports > 0 && exports > 0
  const hasBelfry = functions > 0 && exports > 0
  const hasNoLean = Math.abs(nested) <= 3
  const hasCracks = Math.abs(nested) > 3
  const crackCount = Math.abs(nested) > 3 ? Math.abs(nested) - 3 : 0

  let construction: TowerMeasure['construction']
  if (stability >= 75 && classes > 0 && interfaces > 0) {
    construction = 'stone'
  } else if (stability >= 60 && classes > 0) {
    construction = 'brick'
  } else if (stability >= 45 && totalDeclarations > 0) {
    construction = 'steel'
  } else if (stability >= 30) {
    construction = 'concrete'
  } else if (stability >= 15) {
    construction = 'wood'
  } else {
    construction = 'lean-to'
  }

  return {
    stability,
    construction,
    isStructurallySound,
    hasProperFoundation,
    hasReinforcement,
    hasWeatherVane,
    hasClockFaces,
    hasObservationDeck,
    hasBellChamber,
    hasStaircase,
    hasBelfry,
    hasNoLean,
    hasCracks,
    crackCount,
  }
}

// ─── Classify Reading Condition ────────────────────────────────────────────

/** @example classifyReadingCondition(80) returns 'big-ben' */
export function classifyReadingCondition(score: number): BellReading['condition'] {
  if (score >= 80) return 'big-ben'
  if (score >= 65) return 'precision-clock'
  if (score >= 50) return 'village-clock'
  if (score >= 35) return 'cuckoo-clock'
  if (score >= 20) return 'broken-clock'
  return 'ruin'
}

// ─── Analyze Bell Reading ──────────────────────────────────────────────────

/** @example analyzeBellReading('export function tick(): void {}', 'clock.ts') returns BellReading */
export function analyzeBellReading(content: string, filePath: string): BellReading {
  const timekeeping = measureTimekeeping(content)
  const bell = measureBell(content)
  const gear = measureGear(content)
  const chime = measureChime(content)
  const winding = measureWinding(content)
  const tower = measureTower(content)

  const timeAccuracy = timekeeping.accuracy
  const bellResonance = bell.resonance
  const gearPrecision = gear.precision
  const chimePattern = chime.pattern
  const windingReliability = winding.reliability
  const towerStability = tower.stability

  const qualityScore = Math.round(
    (timeAccuracy + bellResonance + gearPrecision + chimePattern + windingReliability + towerStability) / 6,
  )

  const condition = classifyReadingCondition(qualityScore)

  return {
    file: filePath,
    timeAccuracy,
    bellResonance,
    gearPrecision,
    chimePattern,
    windingReliability,
    towerStability,
    timekeeping,
    bell,
    gear,
    chime,
    winding,
    tower,
    condition,
    qualityScore,
  }
}

// ─── Classify District Type ────────────────────────────────────────────────

/** @example classifyDistrictType(readings) returns 'town-square' */
export function classifyDistrictType(readings: BellReading[]): ClockDistrict['districtType'] {
  if (readings.length === 0) return 'ghost-town'
  const avgScore = Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length)
  const bigBenCount = readings.filter((r) => r.condition === 'big-ben').length
  const ratio = bigBenCount / readings.length

  if (avgScore >= 75 && ratio >= 0.5) return 'capital-district'
  if (avgScore >= 60) return 'city-center'
  if (avgScore >= 45) return 'town-square'
  if (avgScore >= 30) return 'village-green'
  if (avgScore >= 15) return 'back-alley'
  return 'ghost-town'
}

/** @example classifyDistrictCondition(70) returns 'clockmaker' */
export function classifyDistrictCondition(avgScore: number): ClockDistrict['condition'] {
  if (avgScore >= 80) return 'master-clockmaker'
  if (avgScore >= 65) return 'clockmaker'
  if (avgScore >= 50) return 'watchmaker'
  if (avgScore >= 35) return 'repair-shop'
  if (avgScore >= 20) return 'junk-shop'
  return 'ruins'
}

// ─── Classify Horologist Grade ─────────────────────────────────────────────

/** @example classifyHorologistGrade(85) returns 'master-horologist' */
export function classifyHorologistGrade(avgTiming: number): ClockTowerBellStats['horologistGrade'] {
  if (avgTiming >= 80) return 'master-horologist'
  if (avgTiming >= 65) return 'clockmaker'
  if (avgTiming >= 50) return 'watchmaker'
  if (avgTiming >= 35) return 'repairman'
  if (avgTiming >= 20) return 'novice'
  return 'time-lost'
}

// ─── Analyze Clock District ────────────────────────────────────────────────

/** @example analyzeClockDistrict(readings, 'src') returns ClockDistrict */
export function analyzeClockDistrict(readings: BellReading[], dirPath: string): ClockDistrict {
  const count = readings.length
  const avgTimeAccuracy = count > 0 ? Math.round(readings.reduce((s, r) => s + r.timeAccuracy, 0) / count) : 0
  const avgBellResonance = count > 0 ? Math.round(readings.reduce((s, r) => s + r.bellResonance, 0) / count) : 0
  const avgTowerStability = count > 0 ? Math.round(readings.reduce((s, r) => s + r.towerStability, 0) / count) : 0

  const bigBenCount = readings.filter((r) => r.condition === 'big-ben').length
  const ruinCount = readings.filter((r) => r.condition === 'ruin').length
  const preciseCount = readings.filter((r) => r.timekeeping.isPrecise).length
  const woundCount = readings.filter((r) => r.winding.isFullyWound).length

  const districtType = classifyDistrictType(readings)
  const avgScore = count > 0 ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / count) : 0
  const condition = classifyDistrictCondition(avgScore)

  return {
    directory: dirPath,
    readings,
    avgTimeAccuracy,
    avgBellResonance,
    avgTowerStability,
    bigBenCount,
    ruinCount,
    preciseCount,
    woundCount,
    districtType,
    condition,
  }
}

// ─── Generate Recommendations ──────────────────────────────────────────────

/** @example generateRecommendations(readings, districts, guild, stats) returns string[] */
export function generateRecommendations(
  readings: BellReading[],
  _districts: ClockDistrict[],
  _guild: ClockTowerBellResult['guild'],
  _stats: ClockTowerBellStats,
): string[] {
  const recommendations: string[] = []

  const hasDrift = readings.some((r) => r.timekeeping.driftAmount > 50)
  if (hasDrift) {
    recommendations.push('Reduce timing drift — add async/await patterns and proper error handling')
  }

  const hasCracks = readings.some((r) => r.bell.crackCount > 0)
  if (hasCracks) {
    recommendations.push('Fix bell cracks — remove console calls, any types, and ts-ignore directives')
  }

  const hasSlipping = readings.some((r) => r.gear.slippingCount > 0)
  if (hasSlipping) {
    recommendations.push('Address gear slipping — resolve TODOs and FIXMEs for reliable scheduling')
  }

  const hasCacophony = readings.some((r) => r.chime.melody === 'cacophony' || r.chime.melody === 'random')
  if (hasCacophony) {
    recommendations.push('Improve chime patterns — add proper conditional flow and return statements')
  }

  const hasUnwound = readings.some((r) => r.winding.method === 'unwound' || r.winding.method === 'spring')
  if (hasUnwound) {
    recommendations.push('Wind the clock — add tests, comments, and error handling for reliable maintenance')
  }

  const hasLean = readings.some((r) => !r.tower.hasNoLean)
  if (hasLean) {
    recommendations.push('Straighten the tower — fix unbalanced brace structure')
  }

  const hasRunDown = readings.some((r) => r.winding.hasRunDown)
  if (hasRunDown) {
    recommendations.push('Address run-down mechanisms — resolve excessive TODOs and deprecated markers')
  }

  const hasBrokenGears = readings.some((r) => r.gear.type === 'broken')
  if (hasBrokenGears) {
    recommendations.push('Repair broken gears — add type annotations and proper declarations')
  }

  if (recommendations.length === 0) {
    recommendations.push('Clock tower is in pristine condition — Big Ben precision timing achieved')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildClockTowerBellResult(['a.ts'], ['export function tick(): void {}']) returns ClockTowerBellResult */
export function buildClockTowerBellResult(
  files: string[],
  contents: string[],
  _options?: { ignore?: string[]; ext?: string[] },
): ClockTowerBellResult {

  const readings: BellReading[] = files.map((file, i) =>
    analyzeBellReading(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, BellReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      dirMap.set(dir, [reading])
    }
  }

  const districts: ClockDistrict[] = Array.from(dirMap.entries()).map(
    ([dir, dirReadings]) => analyzeClockDistrict(dirReadings, dir),
  )

  const count = readings.length
  const avgTimeAccuracy = count > 0 ? Math.round(readings.reduce((s, r) => s + r.timeAccuracy, 0) / count) : 0
  const avgBellResonance = count > 0 ? Math.round(readings.reduce((s, r) => s + r.bellResonance, 0) / count) : 0
  const avgTowerStability = count > 0 ? Math.round(readings.reduce((s, r) => s + r.towerStability, 0) / count) : 0
  const overallTiming = count > 0 ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / count) : 0

  const guild: ClockTowerBellResult['guild'] = {
    avgTimeAccuracy,
    avgBellResonance,
    avgTowerStability,
    isPrecise: overallTiming >= 60,
    overallTiming,
  }

  const avgGearPrecision = count > 0 ? Math.round(readings.reduce((s, r) => s + r.gearPrecision, 0) / count) : 0
  const avgChimePattern = count > 0 ? Math.round(readings.reduce((s, r) => s + r.chimePattern, 0) / count) : 0
  const avgWindingReliability = count > 0 ? Math.round(readings.reduce((s, r) => s + r.windingReliability, 0) / count) : 0

  const bigBenCount = readings.filter((r) => r.condition === 'big-ben').length
  const precisionClockCount = readings.filter((r) => r.condition === 'precision-clock').length
  const villageClockCount = readings.filter((r) => r.condition === 'village-clock').length
  const cuckooClockCount = readings.filter((r) => r.condition === 'cuckoo-clock').length
  const brokenClockCount = readings.filter((r) => r.condition === 'broken-clock').length
  const ruinCount = readings.filter((r) => r.condition === 'ruin').length

  const isPreciseCount = readings.filter((r) => r.timekeeping.isPrecise).length
  const hasSynchronizationCount = readings.filter((r) => r.timekeeping.hasSynchronization).length
  const isClearToneCount = readings.filter((r) => r.bell.isClearTone).length
  const hasNoCracksCount = readings.filter((r) => r.bell.hasNoCracks).length
  const hasProperMeshingCount = readings.filter((r) => r.gear.hasProperMeshing).length
  const hasNoSlippingCount = readings.filter((r) => r.gear.hasNoSlipping).length
  const hasRegularIntervalCount = readings.filter((r) => r.chime.hasRegularInterval).length
  const isRegularlyWoundCount = readings.filter((r) => r.winding.isRegularlyWound).length
  const isStructurallySoundCount = readings.filter((r) => r.tower.isStructurallySound).length
  const hasNoLeanCount = readings.filter((r) => r.tower.hasNoLean).length

  const horologistGrade = classifyHorologistGrade(overallTiming)

  const bestReading = count > 0
    ? readings.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const mostAccurate = count > 0
    ? readings.reduce((best, r) => r.timeAccuracy > best.timeAccuracy ? r : best).file
    : ''
  const clearestBell = count > 0
    ? readings.reduce((best, r) => r.bellResonance > best.bellResonance ? r : best).file
    : ''
  const mostPreciseGear = count > 0
    ? readings.reduce((best, r) => r.gearPrecision > best.gearPrecision ? r : best).file
    : ''
  const mostStableTower = count > 0
    ? readings.reduce((best, r) => r.towerStability > best.towerStability ? r : best).file
    : ''

  const stats: ClockTowerBellStats = {
    totalFiles: count,
    totalDistricts: districts.length,
    avgTimeAccuracy,
    avgBellResonance,
    avgGearPrecision,
    avgChimePattern,
    avgWindingReliability,
    avgTowerStability,
    bigBenCount,
    precisionClockCount,
    villageClockCount,
    cuckooClockCount,
    brokenClockCount,
    ruinCount,
    isPreciseCount,
    hasSynchronizationCount,
    isClearToneCount,
    hasNoCracksCount,
    hasProperMeshingCount,
    hasNoSlippingCount,
    hasRegularIntervalCount,
    isRegularlyWoundCount,
    isStructurallySoundCount,
    hasNoLeanCount,
    overallTiming,
    horologistGrade,
    bestReading,
    mostAccurate,
    clearestBell,
    mostPreciseGear,
    mostStableTower,
  }

  const recommendations = generateRecommendations(readings, districts, guild, stats)

  return { readings, districts, guild, stats, recommendations }
}
