// ─── Interfaces ──────────────────────────────────────────────────────────────

export type CargoCondition = 'intact' | 'damaged' | 'lost' | 'contaminated' | 'none'
export type YardLayout = 'organized' | 'functional' | 'chaotic' | 'derelict' | 'wreck'
export type CarCondition = 'express-train' | 'reliable-service' | 'commuter-rail' | 'freight-train' | 'rusting-hulk' | 'derailed'
export type LineType = 'high-speed-rail' | 'mainline' | 'branch-line' | 'light-rail' | 'heritage-line' | 'abandoned-track'
export type LineCondition = 'first-class' | 'standard-service' | 'economy' | 'cargo-only' | 'disrepair' | 'wreckage'
export type StationMasterGrade = 'chief-station-master' | 'station-master' | 'dispatcher' | 'conductor' | 'porter' | 'hobo'

export interface RailCar {
  file: string
  trackQuality: number
  switchingEfficiency: number
  signalReliability: number
  freightHandling: number
  yardOrganization: number
  track: {
    gauge: number
    isStandardGauge: boolean
    isNarrowGauge: boolean
    isBroadGauge: boolean
    hasClearRoute: boolean
    hasDeadEnds: boolean
    deadEndCount: number
    isElectrified: boolean
    isDualTrack: boolean
  }
  switching: {
    switchCount: number
    hasSmoothSwitches: boolean
    hasJarringSwitches: boolean
    hasBrokenSwitches: boolean
    hasRedundantSwitches: boolean
    jarringCount: number
    brokenCount: number
    efficiency: number
  }
  signal: {
    hasSignals: boolean
    signalCount: number
    isReliable: boolean
    hasBlindSpots: boolean
    hasFalseSignals: boolean
    hasDarkSignals: boolean
    blindSpotCount: number
    falseSignalCount: number
    darkSignalCount: number
  }
  freight: {
    cargo: string
    capacity: number
    isLoaded: boolean
    isEmpty: boolean
    isOverloaded: boolean
    hasHazmat: boolean
    hazmatType: string[]
    cargoCondition: CargoCondition
  }
  yard: {
    isOrganized: boolean
    hasRoundhouse: boolean
    hasTurntable: boolean
    hasSiding: boolean
    hasFreightHouse: boolean
    hasControlTower: boolean
    layout: YardLayout
  }
  schedule: {
    isOnTime: boolean
    hasDelays: boolean
    hasExpress: boolean
    hasLocal: boolean
    hasFreight: boolean
    delayCount: number
    expressCount: number
  }
  condition: CarCondition
  qualityScore: number
}

export interface RailLine {
  directory: string
  cars: RailCar[]
  avgTrackQuality: number
  avgSwitchingEfficiency: number
  avgSignalReliability: number
  avgFreightHandling: number
  expressCount: number
  derailedCount: number
  totalSwitches: number
  totalSignals: number
  lineType: LineType
  condition: LineCondition
}

export interface Network {
  avgTrackQuality: number
  avgSwitchingEfficiency: number
  avgSignalReliability: number
  avgFreightHandling: number
  isOnSchedule: boolean
  overallEfficiency: number
}

export interface TrainYardStats {
  totalFiles: number
  totalLines: number
  avgTrackQuality: number
  avgSwitchingEfficiency: number
  avgSignalReliability: number
  avgFreightHandling: number
  avgYardOrganization: number
  expressTrainCount: number
  reliableServiceCount: number
  commuterRailCount: number
  freightTrainCount: number
  rustingHulkCount: number
  derailedCount: number
  highSpeedRailCount: number
  mainlineCount: number
  branchLineCount: number
  abandonedTrackCount: number
  totalSwitches: number
  totalSignals: number
  totalDeadEnds: number
  totalBlindSpots: number
  totalDarkSignals: number
  electrifiedCount: number
  standardGaugeCount: number
  hasHazmatCount: number
  overallEfficiency: number
  stationMasterGrade: StationMasterGrade
  bestTrack: string
  worstTrack: string
  mostReliable: string
  mostDerailments: string
  busiest: string
}

export interface TrainYardResult {
  cars: RailCar[]
  lines: RailLine[]
  network: Network
  stats: TrainYardStats
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
 * Count interfaces
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  return (content.match(/\binterface\s+\w+/g) ?? []).length
}

/**
 * Count return statements
 * @example
 * countReturns('return 1') // 1
 */
export function countReturns(content: string): number {
  return (content.match(/\breturn\b/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify car condition from quality score
 * @example
 * classifyCarCondition(85) // 'express-train'
 */
export function classifyCarCondition(score: number): CarCondition {
  if (score >= 80) return 'express-train'
  if (score >= 65) return 'reliable-service'
  if (score >= 45) return 'commuter-rail'
  if (score >= 25) return 'freight-train'
  if (score >= 10) return 'rusting-hulk'
  return 'derailed'
}

/**
 * Classify line type from cars
 * @example
 * classifyLineType([]) // 'abandoned-track'
 */
export function classifyLineType(cars: RailCar[]): LineType {
  if (cars.length === 0) return 'abandoned-track'
  const n = cars.length
  const express = cars.filter(c => c.condition === 'express-train' || c.condition === 'reliable-service').length
  const organized = cars.filter(c => c.yard.isOrganized).length
  const hasElectrified = cars.some(c => c.track.isElectrified)

  if (express > n * 0.6 && hasElectrified) return 'high-speed-rail'
  if (express > n * 0.3 && organized > n * 0.5) return 'mainline'
  if (organized > n * 0.3 && n >= 2) return 'branch-line'
  if (organized > 0) return 'light-rail'
  if (cars.filter(c => c.condition === 'derailed' || c.condition === 'rusting-hulk').length > n * 0.5) return 'abandoned-track'
  return 'heritage-line'
}

/**
 * Classify line condition from average scores
 * @example
 * classifyLineCondition(85) // 'first-class'
 */
export function classifyLineCondition(avgScore: number): LineCondition {
  if (avgScore >= 75) return 'first-class'
  if (avgScore >= 60) return 'standard-service'
  if (avgScore >= 40) return 'economy'
  if (avgScore >= 25) return 'cargo-only'
  if (avgScore >= 10) return 'disrepair'
  return 'wreckage'
}

/**
 * Classify station master grade from efficiency
 * @example
 * classifyStationMasterGrade(85) // 'chief-station-master'
 */
export function classifyStationMasterGrade(avgEfficiency: number): StationMasterGrade {
  if (avgEfficiency >= 80) return 'chief-station-master'
  if (avgEfficiency >= 65) return 'station-master'
  if (avgEfficiency >= 45) return 'dispatcher'
  if (avgEfficiency >= 30) return 'conductor'
  if (avgEfficiency >= 15) return 'porter'
  return 'hobo'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure track properties from code content
 * @example
 * measureTrack('import { x } from "./a"') // { gauge, isElectrified, ... }
 */
export function measureTrack(content: string): RailCar['track'] {
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const descriptive = countDescriptiveNames(content)

  const gauge = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (exports > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0),
  )))

  const isStandardGauge = gauge >= 60
  const isNarrowGauge = gauge <= 25
  const isBroadGauge = gauge >= 80
  const hasClearRoute = comments > 0 && jsdoc > 0
  const deadEndCount = countConsole(content) + countShortNames(content)
  const hasDeadEnds = deadEndCount > 0
  const isElectrified = types > 0
  const isDualTrack = imports > 0 && exports > 0

  return {
    gauge,
    isStandardGauge,
    isNarrowGauge,
    isBroadGauge,
    hasClearRoute,
    hasDeadEnds,
    deadEndCount,
    isElectrified,
    isDualTrack,
  }
}

/**
 * Measure switching properties from code content
 * @example
 * measureSwitching('if (a) {}') // { switchCount, efficiency, ... }
 */
export function measureSwitching(content: string): RailCar['switching'] {
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const todos = countTodos(content)
  const functions = countFunctions(content)

  const switchCount = branches
  const jarringCount = nesting > 3 ? Math.min(branches, nesting - 2) : 0
  const brokenCount = todos > 0 && branches > 0 ? Math.min(todos, branches) : 0
  const hasSmoothSwitches = jarringCount === 0 && branches <= 5
  const hasJarringSwitches = jarringCount > 0
  const hasBrokenSwitches = brokenCount > 0
  const hasRedundantSwitches = branches > functions * 3 && branches > 5

  const efficiency = Math.min(100, Math.max(0, Math.round(
    (hasSmoothSwitches ? 40 : 20) +
    (jarringCount === 0 ? 20 : Math.max(0, 20 - jarringCount * 5)) +
    (brokenCount === 0 ? 20 : Math.max(0, 20 - brokenCount * 5)) +
    (branches <= 10 ? 20 : Math.max(0, 20 - (branches - 10))),
  )))

  return {
    switchCount,
    hasSmoothSwitches,
    hasJarringSwitches,
    hasBrokenSwitches,
    hasRedundantSwitches,
    jarringCount,
    brokenCount,
    efficiency,
  }
}

/**
 * Measure signal properties from code content
 * @example
 * measureSignal('try {} catch(e) {}') // { hasSignals, signalCount, ... }
 */
export function measureSignal(content: string): RailCar['signal'] {
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const console_ = countConsole(content)

  const signalCount = errors
  const hasSignals = errors > 0

  const blindSpotCount = branches > 0 && errors === 0 ? Math.max(1, branches - errors) : 0
  const falseSignalCount = console_ > 0 ? Math.min(console_, 3) : 0
  const darkSignalCount = (content.match(/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/g) ?? []).length

  const hasBlindSpots = blindSpotCount > 0
  const hasFalseSignals = falseSignalCount > 0
  const hasDarkSignals = darkSignalCount > 0

  const isReliable = hasSignals && !hasDarkSignals && blindSpotCount <= 2

  return {
    hasSignals,
    signalCount,
    isReliable,
    hasBlindSpots,
    hasFalseSignals,
    hasDarkSignals,
    blindSpotCount,
    falseSignalCount,
    darkSignalCount,
  }
}

/**
 * Measure freight properties from code content
 * @example
 * measureFreight('export function a(): number { return 1 }') // { cargo, capacity, ... }
 */
export function measureFreight(content: string): RailCar['freight'] {
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)
  const interfaces = countInterfaces(content)

  const capacity = Math.min(100, Math.max(0, Math.round(
    (exports * 10) +
    (functions * 8) +
    (classes * 12) +
    (types * 5) +
    (interfaces * 8) +
    (loc * 0.2),
  )))

  const isLoaded = exports > 0 || functions > 0
  const isEmpty = !isLoaded && loc <= 3
  const isOverloaded = loc > 60 && functions > 8

  const hazmatType: string[] = []
  if ((content.match(/password|secret|token|api[_-]?key/gi) ?? []).length > 0) hazmatType.push('credentials')
  if ((content.match(/\bprivate\b|\bconfidential\b/gi) ?? []).length > 0) hazmatType.push('private-data')
  if ((content.match(/\bencrypt|\bdecrypt|\bhash/gi) ?? []).length > 0) hazmatType.push('crypto')
  const hasHazmat = hazmatType.length > 0
  const imports = countImports(content)

  let cargo = 'none'
  if (classes > 0 && interfaces > 0) cargo = 'typed-objects'
  else if (classes > 0) cargo = 'objects'
  else if (functions > 2) cargo = 'functions'
  else if (exports > 0) cargo = 'exports'
  else if (imports > 0) cargo = 'imports'

  let cargoCondition: CargoCondition = 'none'
  if (capacity >= 40) cargoCondition = 'intact'
  else if (capacity >= 20) cargoCondition = 'damaged'
  else if (capacity > 0) cargoCondition = 'lost'
  else cargoCondition = 'none'
  if ((countTodos(content)) > 3) cargoCondition = 'contaminated'

  return {
    cargo,
    capacity,
    isLoaded,
    isEmpty,
    isOverloaded,
    hasHazmat,
    hazmatType,
    cargoCondition,
  }
}

/**
 * Measure yard properties from code content
 * @example
 * measureYard('export function a() {}') // { isOrganized, layout, ... }
 */
export function measureYard(content: string): RailCar['yard'] {
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const types = countTypeAnnotations(content)
  const descriptive = countDescriptiveNames(content)
  const loc = countLoc(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const isOrganized = comments > 0 && jsdoc > 0 && exports > 0 && descriptive > 0
  const hasRoundhouse = functions >= 3
  const hasTurntable = imports > 0 && exports > 0
  const hasSiding = branches > 0
  const hasFreightHouse = classes > 0 || functions > 1
  const hasControlTower = exports >= 2 && types > 0

  let layout: YardLayout = 'wreck'
  if (isOrganized && errors > 0) layout = 'organized'
  else if (comments > 0 && exports > 0) layout = 'functional'
  else if (loc > 0 && exports === 0 && comments === 0) layout = 'derelict'
  else if (loc > 0) layout = 'chaotic'

  return {
    isOrganized,
    hasRoundhouse,
    hasTurntable,
    hasSiding,
    hasFreightHouse,
    hasControlTower,
    layout,
  }
}

/**
 * Measure schedule properties from code content
 * @example
 * measureSchedule('function a() { return 1 }') // { isOnTime, hasExpress, ... }
 */
export function measureSchedule(content: string): RailCar['schedule'] {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const todos = countTodos(content)
  const descriptive = countDescriptiveNames(content)

  const delayCount = todos + (nesting > 3 ? nesting - 3 : 0)
  const expressCount = Math.max(0, functions - (branches > functions * 2 ? branches - functions : 0))

  const isOnTime = delayCount === 0 && todos === 0
  const hasDelays = delayCount > 0
  const hasExpress = expressCount > 0 && descriptive > 0
  const hasLocal = branches > 3 && nesting > 2
  const hasFreight = loc > 30

  return {
    isOnTime,
    hasDelays,
    hasExpress,
    hasLocal,
    hasFreight,
    delayCount,
    expressCount,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a rail car
 * @example
 * analyzeRailCar('export function a(): number { return 1 }', 'a.ts') // RailCar
 */
export function analyzeRailCar(content: string, filePath: string): RailCar {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      trackQuality: 0, switchingEfficiency: 0, signalReliability: 0,
      freightHandling: 0, yardOrganization: 0,
      track: { gauge: 0, isStandardGauge: false, isNarrowGauge: true, isBroadGauge: false, hasClearRoute: false, hasDeadEnds: false, deadEndCount: 0, isElectrified: false, isDualTrack: false },
      switching: { switchCount: 0, hasSmoothSwitches: true, hasJarringSwitches: false, hasBrokenSwitches: false, hasRedundantSwitches: false, jarringCount: 0, brokenCount: 0, efficiency: 100 },
      signal: { hasSignals: false, signalCount: 0, isReliable: false, hasBlindSpots: false, hasFalseSignals: false, hasDarkSignals: false, blindSpotCount: 0, falseSignalCount: 0, darkSignalCount: 0 },
      freight: { cargo: 'none', capacity: 0, isLoaded: false, isEmpty: true, isOverloaded: false, hasHazmat: false, hazmatType: [], cargoCondition: 'none' },
      yard: { isOrganized: false, hasRoundhouse: false, hasTurntable: false, hasSiding: false, hasFreightHouse: false, hasControlTower: false, layout: 'wreck' },
      schedule: { isOnTime: true, hasDelays: false, hasExpress: false, hasLocal: false, hasFreight: false, delayCount: 0, expressCount: 0 },
      condition: 'derailed',
      qualityScore: 0,
    }
  }

  const track = measureTrack(content)
  const switching = measureSwitching(content)
  const signal = measureSignal(content)
  const freight = measureFreight(content)
  const yard = measureYard(content)
  const schedule = measureSchedule(content)

  const trackQuality = track.gauge
  const switchingEfficiency = switching.efficiency
  const signalReliability = Math.min(100, Math.max(0, Math.round(
    (signal.hasSignals ? 30 : 0) +
    (signal.isReliable ? 30 : 0) +
    (signal.blindSpotCount === 0 ? 20 : Math.max(0, 20 - signal.blindSpotCount * 5)) +
    (signal.darkSignalCount === 0 ? 20 : Math.max(0, 20 - signal.darkSignalCount * 10)),
  )))
  const freightHandling = Math.min(100, Math.max(0, Math.round(
    (freight.isLoaded ? 25 : 0) +
    (freight.capacity * 0.3) +
    (freight.cargoCondition === 'intact' ? 25 : freight.cargoCondition === 'damaged' ? 10 : 0) +
    (freight.hasHazmat ? 10 : 0),
  )))
  const yardOrganization = Math.min(100, Math.max(0, Math.round(
    (yard.isOrganized ? 30 : 0) +
    (yard.hasRoundhouse ? 15 : 0) +
    (yard.hasTurntable ? 15 : 0) +
    (yard.hasFreightHouse ? 15 : 0) +
    (yard.hasControlTower ? 15 : 0) +
    (yard.layout === 'organized' ? 10 : yard.layout === 'functional' ? 5 : 0),
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    trackQuality * 0.2 +
    switchingEfficiency * 0.2 +
    signalReliability * 0.2 +
    freightHandling * 0.2 +
    yardOrganization * 0.2,
  )))

  const condition = classifyCarCondition(qualityScore)

  return {
    file: filePath,
    trackQuality, switchingEfficiency, signalReliability,
    freightHandling, yardOrganization,
    track, switching, signal, freight, yard, schedule,
    condition, qualityScore,
  }
}

// ─── Line Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a directory as a rail line
 * @example
 * analyzeRailLine(cars, 'src') // RailLine
 */
export function analyzeRailLine(cars: RailCar[], dirPath: string): RailLine {
  if (cars.length === 0) {
    return {
      directory: dirPath, cars: [],
      avgTrackQuality: 0, avgSwitchingEfficiency: 0,
      avgSignalReliability: 0, avgFreightHandling: 0,
      expressCount: 0, derailedCount: 0,
      totalSwitches: 0, totalSignals: 0,
      lineType: 'abandoned-track', condition: 'wreckage',
    }
  }

  const n = cars.length
  const avgTrackQuality = Math.round(cars.reduce((s, c) => s + c.trackQuality, 0) / n)
  const avgSwitchingEfficiency = Math.round(cars.reduce((s, c) => s + c.switchingEfficiency, 0) / n)
  const avgSignalReliability = Math.round(cars.reduce((s, c) => s + c.signalReliability, 0) / n)
  const avgFreightHandling = Math.round(cars.reduce((s, c) => s + c.freightHandling, 0) / n)

  const expressCount = cars.filter(c => c.condition === 'express-train' || c.condition === 'reliable-service').length
  const derailedCount = cars.filter(c => c.condition === 'derailed' || c.condition === 'rusting-hulk').length
  const totalSwitches = cars.reduce((s, c) => s + c.switching.switchCount, 0)
  const totalSignals = cars.reduce((s, c) => s + c.signal.signalCount, 0)

  const lineType = classifyLineType(cars)
  const avgScore = Math.round(cars.reduce((s, c) => s + c.qualityScore, 0) / n)
  const condition = classifyLineCondition(avgScore)

  return {
    directory: dirPath, cars,
    avgTrackQuality, avgSwitchingEfficiency,
    avgSignalReliability, avgFreightHandling,
    expressCount, derailedCount,
    totalSwitches, totalSignals,
    lineType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate train yard recommendations
 * @example
 * generateRecommendations(cars, lines, network, stats) // string[]
 */
export function generateRecommendations(
  _cars: RailCar[],
  _lines: RailLine[],
  _network: Network,
  stats: TrainYardStats,
): string[] {
  void _cars
  void _lines
  void _network
  const recs: string[] = []

  if (stats.derailedCount > 0) {
    recs.push(`Derailed cars: ${stats.derailedCount} files have critical quality issues`)
  }
  if (stats.totalDarkSignals > 0) {
    recs.push(`Dark signals: ${stats.totalDarkSignals} swallowed errors need proper handling`)
  }
  if (stats.totalBlindSpots > 5) {
    recs.push(`Blind spots: ${stats.totalBlindSpots} unhandled error paths detected`)
  }
  if (stats.overallEfficiency >= 60) {
    recs.push('On schedule: code data flow is efficient and well-routed')
  }
  if (stats.hasHazmatCount > 0) {
    recs.push(`Hazmat cargo: ${stats.hasHazmatCount} files handle sensitive data requiring extra care`)
  }
  if (stats.abandonedTrackCount > 0) {
    recs.push(`Abandoned tracks: ${stats.abandonedTrackCount} directories need quality improvement`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete train yard result from files and contents
 * @example
 * buildTrainYardResult(['a.ts'], ['export function a() {}'], {}) // TrainYardResult
 */
export function buildTrainYardResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TrainYardResult {
  void options

  const cars: RailCar[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeRailCar(content, file)
    } catch {
      return analyzeRailCar('', file)
    }
  })

  const dirMap = new Map<string, RailCar[]>()
  for (const car of cars) {
    const dir = car.file.includes('/') ? car.file.slice(0, car.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(car) } else { dirMap.set(dir, [car]) }
  }

  const lines: RailLine[] = Array.from(dirMap.entries()).map(([dir, cs]) =>
    analyzeRailLine(cs, dir),
  )

  const n = cars.length || 1
  const avgTrackQuality = Math.round(cars.reduce((s, c) => s + c.trackQuality, 0) / n)
  const avgSwitchingEfficiency = Math.round(cars.reduce((s, c) => s + c.switchingEfficiency, 0) / n)
  const avgSignalReliability = Math.round(cars.reduce((s, c) => s + c.signalReliability, 0) / n)
  const avgFreightHandling = Math.round(cars.reduce((s, c) => s + c.freightHandling, 0) / n)

  const overallEfficiency = Math.min(100, Math.max(0, Math.round(
    avgTrackQuality * 0.25 +
    avgSwitchingEfficiency * 0.25 +
    avgSignalReliability * 0.25 +
    avgFreightHandling * 0.25,
  )))

  const isOnSchedule = overallEfficiency >= 50

  const network: Network = {
    avgTrackQuality,
    avgSwitchingEfficiency,
    avgSignalReliability,
    avgFreightHandling,
    isOnSchedule,
    overallEfficiency,
  }

  const stats: TrainYardStats = {
    totalFiles: files.length,
    totalLines: lines.length,
    avgTrackQuality,
    avgSwitchingEfficiency,
    avgSignalReliability,
    avgFreightHandling,
    avgYardOrganization: Math.round(cars.reduce((s, c) => s + c.yardOrganization, 0) / n),
    expressTrainCount: cars.filter(c => c.condition === 'express-train').length,
    reliableServiceCount: cars.filter(c => c.condition === 'reliable-service').length,
    commuterRailCount: cars.filter(c => c.condition === 'commuter-rail').length,
    freightTrainCount: cars.filter(c => c.condition === 'freight-train').length,
    rustingHulkCount: cars.filter(c => c.condition === 'rusting-hulk').length,
    derailedCount: cars.filter(c => c.condition === 'derailed').length,
    highSpeedRailCount: lines.filter(l => l.lineType === 'high-speed-rail').length,
    mainlineCount: lines.filter(l => l.lineType === 'mainline').length,
    branchLineCount: lines.filter(l => l.lineType === 'branch-line').length,
    abandonedTrackCount: lines.filter(l => l.lineType === 'abandoned-track').length,
    totalSwitches: cars.reduce((s, c) => s + c.switching.switchCount, 0),
    totalSignals: cars.reduce((s, c) => s + c.signal.signalCount, 0),
    totalDeadEnds: cars.reduce((s, c) => s + c.track.deadEndCount, 0),
    totalBlindSpots: cars.reduce((s, c) => s + c.signal.blindSpotCount, 0),
    totalDarkSignals: cars.reduce((s, c) => s + c.signal.darkSignalCount, 0),
    electrifiedCount: cars.filter(c => c.track.isElectrified).length,
    standardGaugeCount: cars.filter(c => c.track.isStandardGauge).length,
    hasHazmatCount: cars.filter(c => c.freight.hasHazmat).length,
    overallEfficiency,
    stationMasterGrade: classifyStationMasterGrade(overallEfficiency),
    bestTrack: cars.length > 0
      ? cars.reduce((a, b) => b.trackQuality > a.trackQuality ? b : a, cars[0] as typeof cars[number]).file : 'none',
    worstTrack: cars.length > 0
      ? cars.reduce((a, b) => b.trackQuality < a.trackQuality ? b : a, cars[0] as typeof cars[number]).file : 'none',
    mostReliable: cars.length > 0
      ? cars.reduce((a, b) => b.signalReliability > a.signalReliability ? b : a, cars[0] as typeof cars[number]).file : 'none',
    mostDerailments: cars.length > 0
      ? cars.reduce((a, b) => b.switching.brokenCount > a.switching.brokenCount ? b : a, cars[0] as typeof cars[number]).file : 'none',
    busiest: cars.length > 0
      ? cars.reduce((a, b) => b.freight.capacity > a.freight.capacity ? b : a, cars[0] as typeof cars[number]).file : 'none',
  }

  const recommendations = generateRecommendations(cars, lines, network, stats)

  return { cars, lines, network, stats, recommendations }
}
