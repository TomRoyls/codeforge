// ─── Types ──────────────────────────────────────────────────────────────────

export type TrackGauge = 'standard' | 'broad' | 'narrow' | 'dual' | 'monorail' | 'maglev'
export type SwitchType = 'points' | 'slip' | 'double-slip' | 'crossover' | 'trailing-point' | 'derail'
export type SignalSystem = 'colour-light' | 'semaphore' | 'position-light' | 'mechanical' | 'hand-signal' | 'none'
export type TimetableAdherence = 'on-time' | 'delayed' | 'cancelled' | 'rerouted' | 'express' | 'freight'
export type YardType = 'classification' | 'marshalling' | 'freight' | 'passenger' | 'depot' | 'siding'
export type SegmentCondition = 'bullet-train' | 'express-service' | 'regional-rail' | 'heritage-line' | 'narrow-gauge' | 'derailment'
export type DivisionType = 'high-speed' | 'main-line' | 'branch-line' | 'light-rail' | 'heritage' | 'abandoned'
export type DivisionCondition = 'premier-service' | 'express-network' | 'regional-service' | 'commuter-line' | 'tourist-train' | 'disused-track'
export type StationMasterGrade = 'chief-inspector' | 'station-master' | 'signalman' | 'pointsman' | 'porter' | 'hobo'

export interface TrackMeasure {
  quality: number
  gauge: TrackGauge
  isWellLaid: boolean
  hasContinuousRail: boolean
  hasProperBallast: boolean
  hasLevelCrossing: boolean
  hasGradient: boolean
  hasCurve: boolean
  hasSwitchback: boolean
  hasDeadEnd: boolean
  hasSpur: boolean
  hasRailGap: boolean
  deadEndCount: number
  spurCount: number
}

export interface SwitchingMeasure {
  reliability: number
  type: SwitchType
  isReliable: boolean
  hasProperAlignment: boolean
  hasNormalPosition: boolean
  hasReversePosition: boolean
  hasFacingPoint: boolean
  hasTrailingPoint: boolean
  hasPointsFailure: boolean
  hasFrozenSwitch: boolean
  hasWrongRoute: boolean
  failureCount: number
  wrongRouteCount: number
}

export interface SignalMeasure {
  clarity: number
  system: SignalSystem
  hasClearAspect: boolean
  hasGreenSignal: boolean
  hasYellowSignal: boolean
  hasRedSignal: boolean
  hasDistantSignal: boolean
  hasHomeSignal: boolean
  hasCallingOn: boolean
  hasShuntSignal: boolean
  hasBannerRepeater: boolean
  isInterlocked: boolean
  missingSignalCount: number
}

export interface TimetableMeasure {
  adherence: number
  isOnSchedule: boolean
  hasRegularService: boolean
  hasExpress: boolean
  hasLocal: boolean
  hasFreight: boolean
  hasSpecial: boolean
  hasDelay: boolean
  hasCancellation: boolean
  hasReroute: boolean
  hasBufferTime: boolean
  delayCount: number
  cancellationCount: number
}

export interface YardMeasure {
  efficiency: number
  type: YardType
  isWellOrganized: boolean
  hasThroughTrack: boolean
  hasSiding: boolean
  hasHeadShunt: boolean
  hasHump: boolean
  hasRollingRoad: boolean
  hasArrivalRoad: boolean
  hasDepartureRoad: boolean
  hasRepairShop: boolean
  hasRoundhouse: boolean
  sidingCount: number
}

export interface SafetyMeasure {
  systems: number
  hasAutomaticBrake: boolean
  hasTrackCircuit: boolean
  hasAWS: boolean
  hasTPWS: boolean
  hasDeadMansSwitch: boolean
  hasCatchPoints: boolean
  hasBufferStops: boolean
  hasDerailmentDetection: boolean
  hasFireSuppression: boolean
  hasEmergencyBrake: boolean
  hasPTC: boolean
  missingSystemCount: number
}

export interface RailwaySegment {
  file: string
  trackQuality: number
  switchReliability: number
  signalClarity: number
  timetableAdherence: number
  yardEfficiency: number
  safetySystems: number
  track: TrackMeasure
  switching: SwitchingMeasure
  signal: SignalMeasure
  timetable: TimetableMeasure
  yard: YardMeasure
  safety: SafetyMeasure
  condition: SegmentCondition
  qualityScore: number
}

export interface RailwayDivision {
  directory: string
  segments: RailwaySegment[]
  avgTrackQuality: number
  avgSwitchReliability: number
  avgSignalClarity: number
  bulletTrainCount: number
  derailmentCount: number
  onScheduleCount: number
  reliableSwitchCount: number
  divisionType: DivisionType
  condition: DivisionCondition
}

export interface RailwaySwitchStats {
  totalFiles: number
  totalDivisions: number
  avgTrackQuality: number
  avgSwitchReliability: number
  avgSignalClarity: number
  avgTimetableAdherence: number
  avgYardEfficiency: number
  avgSafetySystems: number
  bulletTrainCount: number
  expressServiceCount: number
  regionalRailCount: number
  heritageLineCount: number
  narrowGaugeCount: number
  derailmentCount: number
  isWellLaidCount: number
  hasDeadEndCount: number
  hasRailGapCount: number
  isReliableCount: number
  hasPointsFailureCount: number
  hasClearAspectCount: number
  isInterlockedCount: number
  isOnScheduleCount: number
  hasDelayCount: number
  isWellOrganizedCount: number
  hasAutomaticBrakeCount: number
  hasBufferStopsCount: number
  hasEmergencyBrakeCount: number
  overallRailway: number
  stationMasterGrade: StationMasterGrade
  bestSegment: string
  bestTrack: string
  bestSwitching: string
  clearestSignal: string
  mostPunctual: string
}

export interface RailwaySwitchResult {
  segments: RailwaySegment[]
  divisions: RailwayDivision[]
  network: {
    avgTrackQuality: number
    avgSwitchReliability: number
    avgSignalClarity: number
    isOnRails: boolean
    overallRailway: number
  }
  stats: RailwaySwitchStats
  recommendations: string[]
}

// ─── Regex Constants ────────────────────────────────────────────────────────

const IF_RE = /\bif\s*\(/g
const ELSE_IF_RE = /\belse\s+if\s*\(/g
const ELSE_RE = /\belse\s*\{/g
const TERNARY_RE = /\?\s*[^;:]*\s*:/g
const SWITCH_RE = /\bswitch\s*\(/g
const CASE_RE = /\bcase\s+/g
const DEFAULT_RE = /\bdefault\s*:/g
const FOR_RE = /\bfor\s*\(/g
const WHILE_RE = /\bwhile\s*\(/g
const DO_RE = /\bdo\s*\{/g
const FOREACH_RE = /\.forEach\s*\(/g
const MAP_RE = /\.map\s*\(/g
const FILTER_RE = /\.filter\s*\(/g
const REDUCE_RE = /\.reduce\s*\(/g
const TRY_RE = /\btry\s*\{/g
const CATCH_RE = /\bcatch\s*[\({]/g
const FINALLY_RE = /\bfinally\s*\{/g
const THROW_RE = /\bthrow\b/g
const ERROR_RE = /\bError\b/g
const ASYNC_RE = /\basync\b/g
const AWAIT_RE = /\bawait\b/g
const PROMISE_RE = /\bPromise\b/g
const CONSOLE_RE = /\bconsole\.\w+/g
const DEBUGGER_RE = /\bdebugger\b/g
const ANY_RE = /:\s*any\b/g
const FUNCTION_RE = /\bfunction\b/g
const ARROW_RE = /\=>\s*[{(]/g
const CLASS_RE = /\bclass\b/g
const INTERFACE_RE = /\binterface\b/g
const TYPE_RE = /\btype\s+\w+\s*=/g
const EXPORT_RE = /\bexport\b/g
const IMPORT_RE = /\bimport\b/g
const RETURN_RE = /\breturn\b/g
const BREAK_RE = /\bbreak\b/g
const CONTINUE_RE = /\bcontinue\b/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const DEAD_END_RE = /\breturn\s*;?\s*\}(?:\s*\})*/g
const NESTED_IF_RE = /\bif\s*\([^)]*\)\s*\{[^}]*\bif\s*\(/g

// ─── measureTrack ───────────────────────────────────────────────────────────

/**
 * Measure control flow quality of code
 * @example
 * measureTrack(content) // TrackMeasure
 */
export function measureTrack(content: string): TrackMeasure {
  const ifs = (content.match(IF_RE) ?? []).length
  const elseIfs = (content.match(ELSE_IF_RE) ?? []).length
  const elses = (content.match(ELSE_RE) ?? []).length
  const ternaries = (content.match(TERNARY_RE) ?? []).length
  const switches = (content.match(SWITCH_RE) ?? []).length
  const cases = (content.match(CASE_RE) ?? []).length
  const defaults = (content.match(DEFAULT_RE) ?? []).length
  const fors = (content.match(FOR_RE) ?? []).length
  const whiles = (content.match(WHILE_RE) ?? []).length
  const does = (content.match(DO_RE) ?? []).length
  const nestedIfs = (content.match(NESTED_IF_RE) ?? []).length
  const deadEnds = (content.match(DEAD_END_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const breaks = (content.match(BREAK_RE) ?? []).length
  const continues = (content.match(CONTINUE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length

  let quality = 20
  const totalBranches = ifs + ternaries + switches
  if (totalBranches > 0) quality += 10
  if (functions + arrows > 0) quality += 10
  if (classes > 0) quality += 5
  if (types > 0 || interfaces > 0) quality += 5
  if (defaults > 0 || elses > 0) quality += 10
  if (fors + whiles + does > 0) quality += 10
  if (returns > 0) quality += 5
  if (totalBranches > 5) quality += 5
  if (totalBranches > 10) quality += 5
  if (nestedIfs > 3) quality -= 5
  if (anys > 0) quality -= 5
  if (deadEnds > 0) quality -= 5
  quality = Math.max(0, Math.min(100, quality))

  const hasCurve = totalBranches > 0
  const hasSwitchback = nestedIfs > 0
  const hasGradient = fors + whiles + does > 0

  const totalFunctions = functions + arrows
  const hasSpur = totalBranches > totalFunctions
  const spurCount = Math.max(0, totalBranches - totalFunctions)

  const isWellLaid = quality >= 50 && !hasSwitchback
  const hasContinuousRail = returns > 0 || totalBranches > 0
  const hasProperBallast = types > 0 || interfaces > 0
  const hasLevelCrossing = imports(content) > 0

  let gauge: TrackGauge = 'narrow'
  if (quality >= 80) gauge = 'maglev'
  else if (quality >= 65) gauge = 'standard'
  else if (quality >= 45) gauge = 'broad'
  else if (quality >= 30) gauge = 'dual'
  else if (quality >= 15) gauge = 'monorail'

  return {
    quality, gauge, isWellLaid, hasContinuousRail, hasProperBallast,
    hasLevelCrossing, hasGradient, hasCurve, hasSwitchback,
    hasDeadEnd: deadEnds > 0, hasSpur, hasRailGap: anys > 0,
    deadEndCount: deadEnds, spurCount,
  }
}

// ─── measureSwitching ───────────────────────────────────────────────────────

/**
 * Measure branch reliability
 * @example
 * measureSwitching(content) // SwitchingMeasure
 */
export function measureSwitching(content: string): SwitchingMeasure {
  const ifs = (content.match(IF_RE) ?? []).length
  const elses = (content.match(ELSE_RE) ?? []).length
  const elseIfs = (content.match(ELSE_IF_RE) ?? []).length
  const switches = (content.match(SWITCH_RE) ?? []).length
  const cases = (content.match(CASE_RE) ?? []).length
  const defaults = (content.match(DEFAULT_RE) ?? []).length
  const ternaries = (content.match(TERNARY_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const nestedIfs = (content.match(NESTED_IF_RE) ?? []).length
  const hasNormal = elses > 0 || defaults > 0
  const hasReverse = elseIfs > 0 || cases > 1
  const hasFacing = ifs > 0 || ternaries > 0
  const hasTrailing = switches > 0
  const hasPointsFailure = anys > 0 || debuggers > 0
  const failureCount = anys + debuggers
  const hasFrozenSwitch = nestedIfs > 5
  const hasWrongRoute = ternaries > ifs && ternaries > 3
  const wrongRouteCount = hasWrongRoute ? ternaries : 0
  const hasProperAlignment = hasNormal && hasFacing
  const isReliable = hasProperAlignment && !hasPointsFailure

  let reliability = 20
  if (ifs > 0) reliability += 10
  if (hasNormal) reliability += 10
  if (hasReverse) reliability += 10
  if (switches > 0) reliability += 10
  if (hasProperAlignment) reliability += 10
  if (isReliable) reliability += 10
  if (nestedIfs <= 2) reliability += 10
  if (ternaries <= ifs || ternaries <= 3) reliability += 10
  if (hasPointsFailure) reliability -= 10
  if (hasFrozenSwitch) reliability -= 10
  reliability = Math.max(0, Math.min(100, reliability))

  let type: SwitchType = 'derail'
  if (switches > 0 && cases > 3) type = 'double-slip'
  else if (switches > 0) type = 'slip'
  else if (elseIfs > 2) type = 'crossover'
  else if (ifs > 0 && elses > 0) type = 'points'
  else if (ifs > 0) type = 'trailing-point'

  return {
    reliability, type, isReliable, hasProperAlignment,
    hasNormalPosition: hasNormal, hasReversePosition: hasReverse,
    hasFacingPoint: hasFacing, hasTrailingPoint: hasTrailing,
    hasPointsFailure, hasFrozenSwitch, hasWrongRoute,
    failureCount, wrongRouteCount,
  }
}

// ─── measureSignal ──────────────────────────────────────────────────────────

/**
 * Measure condition clarity
 * @example
 * measureSignal(content) // SignalMeasure
 */
export function measureSignal(content: string): SignalMeasure {
  const ifs = (content.match(IF_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const ternaries = (content.match(TERNARY_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const totalFunctions = functions + arrows

  const hasGreenSignal = jsdoc > 0 || comments > 3
  const hasYellowSignal = ternaries > 0 || anys > 0
  const hasRedSignal = anys > 2
  const hasDistantSignal = jsdoc > 0
  const hasHomeSignal = exports > 0
  const hasCallingOn = ternaries > 0 && ternaries <= 3
  const hasShuntSignal = totalFunctions > 0 && ifs > 0
  const hasBannerRepeater = comments > 5
  const isInterlocked = ifs > 0 && elses_in_content(content) > 0

  const hasClearAspect = hasGreenSignal && !hasRedSignal

  let missingSignals = 0
  if (!hasGreenSignal) missingSignals++
  if (!hasHomeSignal) missingSignals++
  if (!hasDistantSignal && totalFunctions > 3) missingSignals++

  let clarity = 15
  if (hasGreenSignal) clarity += 15
  if (hasClearAspect) clarity += 10
  if (hasDistantSignal) clarity += 10
  if (hasHomeSignal) clarity += 10
  if (isInterlocked) clarity += 10
  if (types > 0 || interfaces > 0) clarity += 10
  if (!hasYellowSignal) clarity += 10
  if (hasBannerRepeater) clarity += 5
  if (hasRedSignal) clarity -= 10
  if (anys > 0) clarity -= 5
  clarity = Math.max(0, Math.min(100, clarity))

  let system: SignalSystem = 'none'
  if (clarity >= 80) system = 'colour-light'
  else if (clarity >= 60) system = 'position-light'
  else if (clarity >= 40) system = 'semaphore'
  else if (clarity >= 25) system = 'mechanical'
  else if (clarity >= 10) system = 'hand-signal'

  return {
    clarity, system, hasClearAspect, hasGreenSignal, hasYellowSignal,
    hasRedSignal, hasDistantSignal, hasHomeSignal, hasCallingOn,
    hasShuntSignal, hasBannerRepeater, isInterlocked, missingSignalCount: missingSignals,
  }
}

function elses_in_content(content: string): number {
  return (content.match(ELSE_RE) ?? []).length
}

function imports(content: string): number {
  return (content.match(IMPORT_RE) ?? []).length
}

// ─── measureTimetable ───────────────────────────────────────────────────────

/**
 * Measure predictability
 * @example
 * measureTimetable(content) // TimetableMeasure
 */
export function measureTimetable(content: string): TimetableMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const awaits = (content.match(AWAIT_RE) ?? []).length
  const promises = (content.match(PROMISE_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const console = (content.match(CONSOLE_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const totalFunctions = functions + arrows

  const hasRegularService = totalFunctions > 0 && types > 0
  const hasExpress = asyncs > 0
  const hasLocal = totalFunctions > 0
  const hasFreight = promises > 0 || asyncs > 1
  const hasSpecial = totalFunctions > 5
  const hasDelay = console > 0 || debuggers > 0
  const hasCancellation = anys > 0
  const hasReroute = debuggers > 0
  const hasBufferTime = jsdoc > 0
  const delayCount = console + debuggers
  const cancellationCount = anys
  const isOnSchedule = hasRegularService && !hasDelay && !hasCancellation

  let adherence = 15
  if (hasRegularService) adherence += 15
  if (isOnSchedule) adherence += 15
  if (hasExpress) adherence += 10
  if (hasBufferTime) adherence += 10
  if (returns > totalFunctions * 0.5) adherence += 10
  if (!hasDelay) adherence += 10
  if (!hasCancellation) adherence += 10
  if (hasSpecial) adherence += 5
  if (hasDelay) adherence -= 10
  if (hasCancellation) adherence -= 10
  adherence = Math.max(0, Math.min(100, adherence))

  return {
    adherence, isOnSchedule, hasRegularService, hasExpress, hasLocal,
    hasFreight, hasSpecial, hasDelay, hasCancellation, hasReroute,
    hasBufferTime, delayCount, cancellationCount,
  }
}

// ─── measureYard ────────────────────────────────────────────────────────────

/**
 * Measure code organization
 * @example
 * measureYard(content) // YardMeasure
 */
export function measureYard(content: string): YardMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const importCount = imports(content)
  const maps = (content.match(MAP_RE) ?? []).length
  const filters = (content.match(FILTER_RE) ?? []).length
  const reduces = (content.match(REDUCE_RE) ?? []).length
  const totalFunctions = functions + arrows

  const hasThroughTrack = exports > 0
  const hasSiding = totalFunctions > 2
  const hasHeadShunt = classes > 0
  const hasHump = maps > 0 || filters > 0 || reduces > 0
  const hasRollingRoad = maps > 0 && filters > 0
  const hasArrivalRoad = importCount > 0
  const hasDepartureRoad = exports > 0
  const hasRepairShop = classes > 0 && totalFunctions > 0
  const hasRoundhouse = classes > 1
  const sidingCount = totalFunctions
  const isWellOrganized = hasThroughTrack && hasSiding && (hasHeadShunt || hasHump)

  let efficiency = 15
  if (hasThroughTrack) efficiency += 10
  if (hasSiding) efficiency += 10
  if (hasHeadShunt) efficiency += 10
  if (hasHump) efficiency += 10
  if (hasRollingRoad) efficiency += 10
  if (hasArrivalRoad) efficiency += 5
  if (hasDepartureRoad) efficiency += 5
  if (isWellOrganized) efficiency += 10
  if (types > 0 || interfaces > 0) efficiency += 10
  if (totalFunctions > 5) efficiency += 5
  efficiency = Math.max(0, Math.min(100, efficiency))

  let type: YardType = 'siding'
  if (classes > 1 && totalFunctions > 5) type = 'classification'
  else if (classes > 0 && exports > 2) type = 'marshalling'
  else if (totalFunctions > 5) type = 'freight'
  else if (exports > 0) type = 'passenger'
  else if (totalFunctions > 0) type = 'depot'

  return {
    efficiency, type, isWellOrganized, hasThroughTrack, hasSiding,
    hasHeadShunt, hasHump, hasRollingRoad, hasArrivalRoad, hasDepartureRoad,
    hasRepairShop, hasRoundhouse, sidingCount,
  }
}

// ─── measureSafety ──────────────────────────────────────────────────────────

/**
 * Measure error prevention
 * @example
 * measureSafety(content) // SafetyMeasure
 */
export function measureSafety(content: string): SafetyMeasure {
  const tries = (content.match(TRY_RE) ?? []).length
  const catches = (content.match(CATCH_RE) ?? []).length
  const finallys = (content.match(FINALLY_RE) ?? []).length
  const throws = (content.match(THROW_RE) ?? []).length
  const errors = (content.match(ERROR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length

  const hasAutomaticBrake = tries > 0
  const hasTrackCircuit = catches > 0
  const hasAWS = finallys > 0
  const hasTPWS = throws > 0
  const hasDeadMansSwitch = errors > 0 && throws > 0
  const hasCatchPoints = catches > 0 && finallys > 0
  const hasBufferStops = types > 0 || interfaces > 0
  const hasDerailmentDetection = anys === 0 && tries > 0
  const hasFireSuppression = tries > 0 && catches > 0 && finallys > 0
  const hasEmergencyBrake = tries > 0 && throws > 0
  const hasPTC = hasAutomaticBrake && hasTrackCircuit && hasBufferStops

  let missingSystemCount = 0
  if (!hasAutomaticBrake) missingSystemCount++
  if (!hasTrackCircuit) missingSystemCount++
  if (!hasBufferStops) missingSystemCount++
  if (!hasDeadMansSwitch) missingSystemCount++
  if (!hasAWS && tries > 0) missingSystemCount++

  let systems = 10
  if (hasAutomaticBrake) systems += 10
  if (hasTrackCircuit) systems += 10
  if (hasAWS) systems += 10
  if (hasTPWS) systems += 10
  if (hasBufferStops) systems += 10
  if (hasPTC) systems += 15
  if (hasFireSuppression) systems += 10
  if (hasDerailmentDetection) systems += 10
  if (anys > 0) systems -= 10
  if (jsdoc > 0) systems += 5
  systems = Math.max(0, Math.min(100, systems))

  return {
    systems, hasAutomaticBrake, hasTrackCircuit, hasAWS, hasTPWS,
    hasDeadMansSwitch, hasCatchPoints, hasBufferStops,
    hasDerailmentDetection, hasFireSuppression, hasEmergencyBrake,
    hasPTC, missingSystemCount,
  }
}

// ─── analyzeRailwaySegment ──────────────────────────────────────────────────

/**
 * Analyze a single file as a railway segment
 * @example
 * analyzeRailwaySegment(content, 'file.ts') // RailwaySegment
 */
export function analyzeRailwaySegment(content: string, filePath: string): RailwaySegment {
  const track = measureTrack(content)
  const switching = measureSwitching(content)
  const signal = measureSignal(content)
  const timetable = measureTimetable(content)
  const yard = measureYard(content)
  const safety = measureSafety(content)

  const trackQuality = track.quality
  const switchReliability = switching.reliability
  const signalClarity = signal.clarity
  const timetableAdherence = timetable.adherence
  const yardEfficiency = yard.efficiency
  const safetySystems = safety.systems

  const qualityScore = Math.round(
    (trackQuality + switchReliability + signalClarity + timetableAdherence + yardEfficiency + safetySystems) / 6,
  )

  let condition: SegmentCondition = 'derailment'
  if (qualityScore >= 80) condition = 'bullet-train'
  else if (qualityScore >= 65) condition = 'express-service'
  else if (qualityScore >= 45) condition = 'regional-rail'
  else if (qualityScore >= 30) condition = 'heritage-line'
  else if (qualityScore >= 15) condition = 'narrow-gauge'

  return {
    file: filePath, trackQuality, switchReliability, signalClarity,
    timetableAdherence, yardEfficiency, safetySystems,
    track, switching, signal, timetable, yard, safety,
    condition, qualityScore,
  }
}

// ─── classifyDivisionType ───────────────────────────────────────────────────

/**
 * Classify a division by segment quality
 * @example
 * classifyDivisionType(segments) // DivisionType
 */
export function classifyDivisionType(segments: RailwaySegment[]): DivisionType {
  if (segments.length === 0) return 'abandoned'
  const avg = segments.reduce((s, seg) => s + seg.qualityScore, 0) / segments.length
  if (avg >= 75) return 'high-speed'
  if (avg >= 55) return 'main-line'
  if (avg >= 35) return 'branch-line'
  if (avg >= 20) return 'light-rail'
  if (avg >= 10) return 'heritage'
  return 'abandoned'
}

// ─── classifyStationMasterGrade ─────────────────────────────────────────────

/**
 * Classify overall quality grade
 * @example
 * classifyStationMasterGrade(90) // 'chief-inspector'
 */
export function classifyStationMasterGrade(avgRailway: number): StationMasterGrade {
  if (avgRailway >= 85) return 'chief-inspector'
  if (avgRailway >= 70) return 'station-master'
  if (avgRailway >= 50) return 'signalman'
  if (avgRailway >= 30) return 'pointsman'
  if (avgRailway >= 15) return 'porter'
  return 'hobo'
}

// ─── analyzeRailwayDivision ─────────────────────────────────────────────────

/**
 * Analyze a directory of segments as a railway division
 * @example
 * analyzeRailwayDivision(segments, 'src/') // RailwayDivision
 */
export function analyzeRailwayDivision(segments: RailwaySegment[], dirPath: string): RailwayDivision {
  if (segments.length === 0) {
    return {
      directory: dirPath, segments: [], avgTrackQuality: 0, avgSwitchReliability: 0,
      avgSignalClarity: 0, bulletTrainCount: 0, derailmentCount: 0,
      onScheduleCount: 0, reliableSwitchCount: 0,
      divisionType: 'abandoned', condition: 'disused-track',
    }
  }

  const avgTrackQuality = Math.round(segments.reduce((s, seg) => s + seg.trackQuality, 0) / segments.length)
  const avgSwitchReliability = Math.round(segments.reduce((s, seg) => s + seg.switchReliability, 0) / segments.length)
  const avgSignalClarity = Math.round(segments.reduce((s, seg) => s + seg.signalClarity, 0) / segments.length)
  const bulletTrainCount = segments.filter(s => s.condition === 'bullet-train').length
  const derailmentCount = segments.filter(s => s.condition === 'derailment').length
  const onScheduleCount = segments.filter(s => s.timetable.isOnSchedule).length
  const reliableSwitchCount = segments.filter(s => s.switching.isReliable).length

  const divisionType = classifyDivisionType(segments)

  const avg = segments.reduce((s, seg) => s + seg.qualityScore, 0) / segments.length
  let condition: DivisionCondition = 'disused-track'
  if (avg >= 75) condition = 'premier-service'
  else if (avg >= 55) condition = 'express-network'
  else if (avg >= 35) condition = 'regional-service'
  else if (avg >= 20) condition = 'commuter-line'
  else if (avg >= 10) condition = 'tourist-train'

  return {
    directory: dirPath, segments, avgTrackQuality, avgSwitchReliability,
    avgSignalClarity, bulletTrainCount, derailmentCount, onScheduleCount,
    reliableSwitchCount, divisionType, condition,
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate recommendations for the railway
 * @example
 * generateRecommendations(segments, divisions, network, stats) // string[]
 */
export function generateRecommendations(
  segments: RailwaySegment[],
  divisions: RailwayDivision[],
  network: RailwaySwitchResult['network'],
  stats: RailwaySwitchStats,
): string[] {
  const recs: string[] = []

  if (stats.derailmentCount > 0) {
    recs.push(`${stats.derailmentCount} file(s) are derailed — urgent track repair needed`)
  }
  if (stats.hasDeadEndCount > 0) {
    recs.push(`${stats.hasDeadEndCount} file(s) contain dead-end code — remove unreachable branches`)
  }
  if (stats.hasRailGapCount > 0) {
    recs.push(`${stats.hasRailGapCount} file(s) have rail gaps from 'any' types — add proper typing`)
  }
  if (stats.hasPointsFailureCount > 0) {
    recs.push(`${stats.hasPointsFailureCount} file(s) have switch failures — fix broken branch logic`)
  }
  if (stats.hasDelayCount > 0) {
    recs.push(`${stats.hasDelayCount} file(s) running behind schedule — remove debug/console statements`)
  }
  if (stats.avgSafetySystems < 30) {
    recs.push('Safety systems critically low — add try/catch error handling')
  }
  if (stats.avgTrackQuality < 40) {
    recs.push('Track quality poor — improve control flow structure')
  }
  if (stats.avgSwitchReliability < 40) {
    recs.push('Switch reliability low — ensure branches have proper defaults')
  }
  if (stats.avgSignalClarity < 40) {
    recs.push('Signal clarity low — add documentation and type annotations')
  }
  if (stats.avgTimetableAdherence < 40) {
    recs.push('Timetable adherence low — improve code predictability')
  }
  if (stats.avgYardEfficiency < 40) {
    recs.push('Yard efficiency low — reorganize code structure')
  }
  if (!network.isOnRails) {
    recs.push('Network off the rails — comprehensive refactoring recommended')
  }
  if (network.isOnRails && stats.overallRailway >= 70) {
    recs.push('Railway running smoothly — maintain current standards')
  }
  if (stats.overallRailway >= 85) {
    recs.push('Excellent railway — consider documenting best practices for the team')
  }

  if (recs.length === 0) {
    recs.push('All trains running on time')
  }

  return Array.from(new Set(recs))
}

// ─── buildRailwaySwitchResult ───────────────────────────────────────────────

/**
 * Build the complete railway switch analysis result
 * @example
 * buildRailwaySwitchResult(files, contents, {}) // RailwaySwitchResult
 */
export function buildRailwaySwitchResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): RailwaySwitchResult {
  const segments = files.map((file, i) => analyzeRailwaySegment(contents[i] ?? '', file))

  const dirMap = new Map<string, RailwaySegment[]>()
  for (const seg of segments) {
    const dir = seg.file.includes('/') ? seg.file.substring(0, seg.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(seg)
    } else {
      dirMap.set(dir, [seg])
    }
  }

  const divisions = Array.from(dirMap.entries()).map(([dir, segs]) =>
    analyzeRailwayDivision(segs, dir),
  )

  const avgTrackQuality = segments.length > 0
    ? Math.round(segments.reduce((s, seg) => s + seg.trackQuality, 0) / segments.length) : 0
  const avgSwitchReliability = segments.length > 0
    ? Math.round(segments.reduce((s, seg) => s + seg.switchReliability, 0) / segments.length) : 0
  const avgSignalClarity = segments.length > 0
    ? Math.round(segments.reduce((s, seg) => s + seg.signalClarity, 0) / segments.length) : 0
  const avgTimetableAdherence = segments.length > 0
    ? Math.round(segments.reduce((s, seg) => s + seg.timetableAdherence, 0) / segments.length) : 0
  const avgYardEfficiency = segments.length > 0
    ? Math.round(segments.reduce((s, seg) => s + seg.yardEfficiency, 0) / segments.length) : 0
  const avgSafetySystems = segments.length > 0
    ? Math.round(segments.reduce((s, seg) => s + seg.safetySystems, 0) / segments.length) : 0

  const overallRailway = Math.round(
    (avgTrackQuality + avgSwitchReliability + avgSignalClarity + avgTimetableAdherence + avgYardEfficiency + avgSafetySystems) / 6,
  )

  const network: RailwaySwitchResult['network'] = {
    avgTrackQuality, avgSwitchReliability, avgSignalClarity,
    isOnRails: overallRailway >= 50,
    overallRailway,
  }

  const bestSegment = segments.length > 0
    ? segments.reduce((best, seg) => seg.qualityScore > best.qualityScore ? seg : best).file : ''
  const bestTrack = segments.length > 0
    ? segments.reduce((best, seg) => seg.trackQuality > best.trackQuality ? seg : best).file : ''
  const bestSwitching = segments.length > 0
    ? segments.reduce((best, seg) => seg.switchReliability > best.switchReliability ? seg : best).file : ''
  const clearestSignal = segments.length > 0
    ? segments.reduce((best, seg) => seg.signalClarity > best.signalClarity ? seg : best).file : ''
  const mostPunctual = segments.length > 0
    ? segments.reduce((best, seg) => seg.timetableAdherence > best.timetableAdherence ? seg : best).file : ''

  const conditionCounts = {
    bulletTrain: segments.filter(s => s.condition === 'bullet-train').length,
    expressService: segments.filter(s => s.condition === 'express-service').length,
    regionalRail: segments.filter(s => s.condition === 'regional-rail').length,
    heritageLine: segments.filter(s => s.condition === 'heritage-line').length,
    narrowGauge: segments.filter(s => s.condition === 'narrow-gauge').length,
    derailment: segments.filter(s => s.condition === 'derailment').length,
  }

  const stats: RailwaySwitchStats = {
    totalFiles: files.length,
    totalDivisions: divisions.length,
    avgTrackQuality, avgSwitchReliability, avgSignalClarity,
    avgTimetableAdherence, avgYardEfficiency, avgSafetySystems,
    bulletTrainCount: conditionCounts.bulletTrain,
    expressServiceCount: conditionCounts.expressService,
    regionalRailCount: conditionCounts.regionalRail,
    heritageLineCount: conditionCounts.heritageLine,
    narrowGaugeCount: conditionCounts.narrowGauge,
    derailmentCount: conditionCounts.derailment,
    isWellLaidCount: segments.filter(s => s.track.isWellLaid).length,
    hasDeadEndCount: segments.filter(s => s.track.hasDeadEnd).length,
    hasRailGapCount: segments.filter(s => s.track.hasRailGap).length,
    isReliableCount: segments.filter(s => s.switching.isReliable).length,
    hasPointsFailureCount: segments.filter(s => s.switching.hasPointsFailure).length,
    hasClearAspectCount: segments.filter(s => s.signal.hasClearAspect).length,
    isInterlockedCount: segments.filter(s => s.signal.isInterlocked).length,
    isOnScheduleCount: segments.filter(s => s.timetable.isOnSchedule).length,
    hasDelayCount: segments.filter(s => s.timetable.hasDelay).length,
    isWellOrganizedCount: segments.filter(s => s.yard.isWellOrganized).length,
    hasAutomaticBrakeCount: segments.filter(s => s.safety.hasAutomaticBrake).length,
    hasBufferStopsCount: segments.filter(s => s.safety.hasBufferStops).length,
    hasEmergencyBrakeCount: segments.filter(s => s.safety.hasEmergencyBrake).length,
    overallRailway,
    stationMasterGrade: classifyStationMasterGrade(overallRailway),
    bestSegment, bestTrack, bestSwitching, clearestSignal, mostPunctual,
  }

  const recommendations = generateRecommendations(segments, divisions, network, stats)

  return { segments, divisions, network, stats, recommendations }
}
