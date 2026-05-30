// ─── Interfaces ──────────────────────────────────────────────────────────────

export type SailType = 'main-sail' | 'jib' | 'genoa' | 'spinnaker' | 'lateen' | 'square' | 'storm-sail'
export type PointOfSail = 'close-hauled' | 'close-reach' | 'beam-reach' | 'broad-reach' | 'running' | 'in-irons'
export type KeelType = 'fin' | 'full-keel' | 'wing' | 'bulb' | 'centerboard' | 'none'
export type PanelCondition = 'yacht-racer' | 'well-rigged' | 'sloop' | 'schooner' | 'bare-poles' | 'sinking'
export type FleetType = 'racing-fleet' | 'cruising-fleet' | 'fishing-fleet' | 'harbor-fleet' | 'ghost-fleet' | 'shipwreck'
export type FleetCondition = 'regatta-ready' | 'seaworthy' | 'sailable' | 'barely-afloat' | 'taking-water' | 'sunk'
export type CaptainGrade = 'yacht-captain' | 'captain' | 'first-mate' | 'sailor' | 'deckhand' | 'landlubber'

export interface SailPanel {
  file: string
  sailArea: number
  windCapture: number
  sailTrim: number
  hullSpeed: number
  ballast: number
  riggingOverhead: number
  sail: {
    type: SailType
    area: number
    isProperlySet: boolean
    isTrimmed: boolean
    isLuffing: boolean
    isFlogging: boolean
    hasReefPoints: boolean
    reefCount: number
    draft: number
  }
  wind: {
    capture: number
    apparentAngle: number
    isCloseHauled: boolean
    isReaching: boolean
    isRunning: boolean
    isInIrons: boolean
    pointOfSail: PointOfSail
  }
  hull: {
    speed: number
    isClean: boolean
    hasBarnacles: boolean
    hasDrag: boolean
    barnacleCount: number
    dragSources: string[]
    waterlineLength: number
    displacement: number
  }
  ballastDetail: {
    weight: number
    isBalanced: boolean
    isTooHeavy: boolean
    isTooLight: boolean
    hasStability: boolean
    keelType: KeelType
    stabilityScore: number
  }
  rigging: {
    lineCount: number
    isTaut: boolean
    isSlack: boolean
    hasTangles: boolean
    hasChafing: boolean
    hasSnags: boolean
    tangleCount: number
    chafePoints: number
    standingRigging: number
    runningRigging: number
    overheadRatio: number
  }
  navigation: {
    hasCompass: boolean
    hasChart: boolean
    hasLog: boolean
    hasDepthSounder: boolean
    isOnCourse: boolean
    hasWaypoints: boolean
  }
  condition: PanelCondition
  qualityScore: number
}

export interface Fleet {
  directory: string
  panels: SailPanel[]
  avgSailTrim: number
  avgHullSpeed: number
  avgBallast: number
  avgRiggingOverhead: number
  yachtRacerCount: number
  sinkingCount: number
  fleetType: FleetType
  condition: FleetCondition
}

export interface Regatta {
  avgSailTrim: number
  avgHullSpeed: number
  avgBallast: number
  avgRiggingOverhead: number
  isSeaworthy: boolean
  overallEfficiency: number
}

export interface SailRigStats {
  totalFiles: number
  totalFleets: number
  avgSailArea: number
  avgWindCapture: number
  avgSailTrim: number
  avgHullSpeed: number
  avgBallast: number
  avgRiggingOverhead: number
  yachtRacerCount: number
  wellRiggedCount: number
  sloopCount: number
  schoonerCount: number
  barePolesCount: number
  sinkingCount: number
  mainSailCount: number
  spinnakerCount: number
  stormSailCount: number
  isLuffingCount: number
  isInIronsCount: number
  hasBarnaclesCount: number
  hasDragCount: number
  hasTanglesCount: number
  isOnCourseCount: number
  hasCompassCount: number
  finKeelCount: number
  noKeelCount: number
  overallEfficiency: number
  captainGrade: CaptainGrade
  bestRigged: string
  fastest: string
  mostStable: string
  mostTangled: string
  mostBarnacled: string
}

export interface SailRigResult {
  panels: SailPanel[]
  fleets: Fleet[]
  regatta: Regatta
  stats: SailRigStats
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

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify panel condition from quality score
 * @example
 * classifyPanelCondition(90) // 'yacht-racer'
 */
export function classifyPanelCondition(score: number): PanelCondition {
  if (score >= 80) return 'yacht-racer'
  if (score >= 65) return 'well-rigged'
  if (score >= 45) return 'sloop'
  if (score >= 25) return 'schooner'
  if (score >= 10) return 'bare-poles'
  return 'sinking'
}

/**
 * Classify fleet type from panels
 * @example
 * classifyFleetType([]) // 'shipwreck'
 */
export function classifyFleetType(panels: SailPanel[]): FleetType {
  if (panels.length === 0) return 'shipwreck'
  const n = panels.length
  const strong = panels.filter(p => p.condition === 'yacht-racer' || p.condition === 'well-rigged').length
  if (strong > n * 0.5) return 'racing-fleet'
  if (strong > n * 0.25) return 'cruising-fleet'
  if (panels.some(p => p.sail.type === 'storm-sail')) return 'fishing-fleet'
  if (n >= 3) return 'harbor-fleet'
  return 'ghost-fleet'
}

/**
 * Classify fleet condition from avg score
 * @example
 * classifyFleetCondition(80) // 'regatta-ready'
 */
export function classifyFleetCondition(avgScore: number): FleetCondition {
  if (avgScore >= 75) return 'regatta-ready'
  if (avgScore >= 60) return 'seaworthy'
  if (avgScore >= 40) return 'sailable'
  if (avgScore >= 25) return 'barely-afloat'
  if (avgScore >= 10) return 'taking-water'
  return 'sunk'
}

/**
 * Classify captain grade from avg efficiency
 * @example
 * classifyCaptainGrade(85) // 'yacht-captain'
 */
export function classifyCaptainGrade(avgEfficiency: number): CaptainGrade {
  if (avgEfficiency >= 80) return 'yacht-captain'
  if (avgEfficiency >= 65) return 'captain'
  if (avgEfficiency >= 45) return 'first-mate'
  if (avgEfficiency >= 30) return 'sailor'
  if (avgEfficiency >= 15) return 'deckhand'
  return 'landlubber'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure sail properties from code content
 * @example
 * measureSail('export function a(): number { return 1 }') // { type, area, ... }
 */
export function measureSail(content: string): SailPanel['sail'] {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const types = countTypeAnnotations(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const loc = countLoc(content)

  const area = Math.min(100, Math.max(0, Math.round(
    (exports * 8) + (functions * 6) + (classes * 10) + (branches * 4) + (loc * 0.2),
  )))

  let type: SailType = 'square'
  if (classes > 0 && functions > 0) type = 'main-sail'
  else if (functions > 3) type = 'spinnaker'
  else if (exports > 2 && imports > 1) type = 'genoa'
  else if (functions > 0 && imports > 0) type = 'jib'
  else if (branches > 3 && nesting > 3) type = 'storm-sail'
  else if (functions > 0 || exports > 0) type = 'lateen'

  const isProperlySet = types > 0 && (functions > 0 || classes > 0)
  const isTrimmed = types > 0 && exports > 0 && loc > 0
  const isLuffing = branches > 0 && types === 0
  const isFlogging = countConsole(content) > 0 && loc > 10
  const hasReefPoints = branches > 2
  const reefCount = Math.max(0, branches - 1)
  const draft = Math.min(100, Math.max(0, Math.round(nesting * 20)))

  return {
    type, area, isProperlySet, isTrimmed,
    isLuffing, isFlogging, hasReefPoints, reefCount, draft,
  }
}

/**
 * Measure wind properties from code content
 * @example
 * measureWind('import { x } from "./a"') // { capture, ... }
 */
export function measureWind(content: string): SailPanel['wind'] {
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)
  const branches = countBranches(content)

  const capture = Math.min(100, Math.max(0, Math.round(
    (imports > 0 ? 25 : 0) +
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 25 : 0),
  )))

  const apparentAngle = Math.min(180, Math.max(0, Math.round(
    180 - (capture * 1.2),
  )))

  const isCloseHauled = branches > 3 && imports > 0
  const isReaching = imports > 0 && exports > 0 && functions > 0
  const isRunning = loc > 0 && branches === 0 && imports === 0
  const isInIrons = loc === 0

  let pointOfSail: PointOfSail = 'in-irons'
  if (isInIrons) pointOfSail = 'in-irons'
  else if (isRunning) pointOfSail = 'running'
  else if (isReaching && apparentAngle < 90) pointOfSail = 'beam-reach'
  else if (isReaching) pointOfSail = 'broad-reach'
  else if (isCloseHauled) pointOfSail = 'close-hauled'
  else if (isReaching) pointOfSail = 'close-reach'
  else if (loc > 0) pointOfSail = 'running'

  return { capture, apparentAngle, isCloseHauled, isReaching, isRunning, isInIrons, pointOfSail }
}

/**
 * Measure hull properties from code content
 * @example
 * measureHull('const x = 1') // { speed, isClean, ... }
 */
export function measureHull(content: string): SailPanel['hull'] {
  const loc = countLoc(content)
  const console = countConsole(content)
  const todos = countTodos(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const speed = Math.min(100, Math.max(0, Math.round(
    (functions > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (console === 0 && loc > 0 ? 15 : 0) +
    (todos === 0 && loc > 0 ? 10 : 0),
  )))

  const barnacleCount = todos + console
  const hasBarnacles = barnacleCount > 0
  const dragSources: string[] = []
  if (todos > 0) dragSources.push('todos')
  if (console > 0) dragSources.push('console')
  if (branches > 5) dragSources.push('complexity')
  const hasDrag = dragSources.length > 0

  const isClean = !hasBarnacles && !hasDrag

  const waterlineLength = Math.min(100, Math.max(0, Math.round(
    (exports * 8) + (functions * 5) + (loc * 0.3),
  )))

  const comments = countComments(content)
  const displacement = Math.min(100, Math.max(0, Math.round(
    loc * 0.5 + branches * 3 + comments * 0.5,
  )))

  return { speed, isClean, hasBarnacles, hasDrag, barnacleCount, dragSources, waterlineLength, displacement }
}

/**
 * Measure ballast properties from code content
 * @example
 * measureBallast('try {} catch(e) {}') // { weight, isBalanced, ... }
 */
export function measureBallast(content: string): { weight: number; isBalanced: boolean; isTooHeavy: boolean; isTooLight: boolean; hasStability: boolean; keelType: KeelType; stabilityScore: number } {
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)

  const weight = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (functions > 0 ? 20 : 0),
  )))

  const isBalanced = errors > 0 && types > 0
  const isTooHeavy = weight > 85 && loc < 20
  const isTooLight = weight < 20 && loc > 10
  const hasStability = errors > 0 && types > 0 && exports > 0

  let keelType: KeelType = 'none'
  if (errors > 2 && types > 2) keelType = 'fin'
  else if (errors > 0 && types > 0) keelType = 'full-keel'
  else if (types > 2) keelType = 'wing'
  else if (errors > 0) keelType = 'bulb'
  else if (types > 0) keelType = 'centerboard'

  const stabilityScore = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 35 : 0) +
    (types > 0 ? 25 : 0) +
    (hasStability ? 20 : 0) +
    (isBalanced ? 20 : 0),
  )))

  return { weight, isBalanced, isTooHeavy, isTooLight, hasStability, keelType, stabilityScore }
}

/**
 * Measure rigging properties from code content
 * @example
 * measureRigging('import { x } from "./a"') // { lineCount, ... }
 */
export function measureRigging(content: string): SailPanel['rigging'] {
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)

  const lineCount = imports + exports
  const isTaut = lineCount > 0 && types > 0
  const isSlack = imports > 0 && exports === 0
  const tangleCount = imports > 3 ? Math.max(1, imports - 3) : 0
  const hasTangles = tangleCount > 0
  const chafePoints = Math.max(0, imports - types)
  const hasChafing = chafePoints > 0
  const hasSnags = hasTangles || hasChafing
  const standingRigging = exports
  const runningRigging = imports

  const overheadRatio = Math.min(100, Math.max(0, Math.round(
    loc > 0 ? ((imports + exports) / loc) * 100 : 0,
  )))

  return {
    lineCount, isTaut, isSlack, hasTangles,
    hasChafing, hasSnags, tangleCount, chafePoints,
    standingRigging, runningRigging, overheadRatio,
  }
}

/**
 * Measure navigation properties from code content
 * @example
 * measureNavigation('// TODO: add docs') // { hasCompass, ... }
 */
export function measureNavigation(content: string): SailPanel['navigation'] {
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const console = countConsole(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const functions = countFunctions(content)

  const hasCompass = types > 0 || (exports > 0 && functions > 0)
  const hasChart = jsdoc > 0
  const hasLog = console > 0
  const hasDepthSounder = errors > 0
  const isOnCourse = types > 0 && exports > 0
  const hasWaypoints = comments > 0 && functions > 0

  return { hasCompass, hasChart, hasLog, hasDepthSounder, isOnCourse, hasWaypoints }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a sail panel
 * @example
 * analyzeSailPanel('export function a(): number { return 1 }', 'a.ts') // SailPanel
 */
export function analyzeSailPanel(content: string, filePath: string): SailPanel {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      sailArea: 0, windCapture: 0, sailTrim: 0, hullSpeed: 0, ballast: 0, riggingOverhead: 0,
      sail: { type: 'square', area: 0, isProperlySet: false, isTrimmed: false, isLuffing: false, isFlogging: false, hasReefPoints: false, reefCount: 0, draft: 0 },
      wind: { capture: 0, apparentAngle: 180, isCloseHauled: false, isReaching: false, isRunning: false, isInIrons: true, pointOfSail: 'in-irons' },
      hull: { speed: 0, isClean: true, hasBarnacles: false, hasDrag: false, barnacleCount: 0, dragSources: [], waterlineLength: 0, displacement: 0 },
      ballastDetail: { weight: 0, isBalanced: false, isTooHeavy: false, isTooLight: false, hasStability: false, keelType: 'none', stabilityScore: 0 },
      rigging: { lineCount: 0, isTaut: false, isSlack: false, hasTangles: false, hasChafing: false, hasSnags: false, tangleCount: 0, chafePoints: 0, standingRigging: 0, runningRigging: 0, overheadRatio: 0 },
      navigation: { hasCompass: false, hasChart: false, hasLog: false, hasDepthSounder: false, isOnCourse: false, hasWaypoints: false },
      condition: 'sinking',
      qualityScore: 0,
    }
  }

  const sail = measureSail(content)
  const wind = measureWind(content)
  const hull = measureHull(content)
  const ballastReading = measureBallast(content)
  const rigging = measureRigging(content)
  const navigation = measureNavigation(content)

  const sailArea = sail.area
  const windCapture = wind.capture
  const sailTrim = Math.min(100, Math.max(0, Math.round(
    (sail.isTrimmed ? 30 : 0) +
    (sail.isProperlySet ? 25 : 0) +
    (sail.isLuffing ? 0 : 20) +
    (sail.isFlogging ? 0 : 15) +
    (hull.isClean ? 10 : 0),
  )))
  const hullSpeed = hull.speed
  const ballastVal = ballastReading.stabilityScore
  const riggingOverhead = Math.min(100, Math.max(0, 100 - rigging.overheadRatio))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    sailArea * 0.1 +
    windCapture * 0.15 +
    sailTrim * 0.2 +
    hullSpeed * 0.2 +
    ballastVal * 0.2 +
    riggingOverhead * 0.15,
  )))

  const condition = classifyPanelCondition(qualityScore)

  return {
    file: filePath,
    sailArea, windCapture, sailTrim, hullSpeed,
    ballast: ballastVal, riggingOverhead,
    sail, wind, hull, ballastDetail: ballastReading,
    rigging, navigation,
    condition, qualityScore,
  }
}

// ─── Fleet Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a fleet
 * @example
 * analyzeFleet(panels, 'src') // Fleet
 */
export function analyzeFleet(panels: SailPanel[], dirPath: string): Fleet {
  if (panels.length === 0) {
    return {
      directory: dirPath, panels: [],
      avgSailTrim: 0, avgHullSpeed: 0, avgBallast: 0, avgRiggingOverhead: 0,
      yachtRacerCount: 0, sinkingCount: 0,
      fleetType: 'shipwreck', condition: 'sunk',
    }
  }

  const n = panels.length
  const avgSailTrim = Math.round(panels.reduce((s, p) => s + p.sailTrim, 0) / n)
  const avgHullSpeed = Math.round(panels.reduce((s, p) => s + p.hullSpeed, 0) / n)
  const avgBallast = Math.round(panels.reduce((s, p) => s + p.ballast, 0) / n)
  const avgRiggingOverhead = Math.round(panels.reduce((s, p) => s + p.riggingOverhead, 0) / n)
  const yachtRacerCount = panels.filter(p => p.condition === 'yacht-racer' || p.condition === 'well-rigged').length
  const sinkingCount = panels.filter(p => p.condition === 'sinking').length

  const fleetType = classifyFleetType(panels)
  const avgScore = Math.round(panels.reduce((s, p) => s + p.qualityScore, 0) / n)
  const condition = classifyFleetCondition(avgScore)

  return {
    directory: dirPath, panels,
    avgSailTrim, avgHullSpeed, avgBallast, avgRiggingOverhead,
    yachtRacerCount, sinkingCount, fleetType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate sail rig recommendations
 * @example
 * generateRecommendations(panels, fleets, regatta, stats) // string[]
 */
export function generateRecommendations(
  _panels: SailPanel[],
  _fleets: Fleet[],
  _regatta: Regatta,
  stats: SailRigStats,
): string[] {
  void _panels
  void _fleets
  void _regatta
  const recs: string[] = []

  if (stats.sinkingCount > 0) {
    recs.push(`Sinking panels: ${stats.sinkingCount} files need urgent attention`)
  }
  if (stats.hasBarnaclesCount > stats.totalFiles * 0.3) {
    recs.push(`Barnacle buildup: ${stats.hasBarnaclesCount} files have accumulated tech debt`)
  }
  if (stats.overallEfficiency >= 60) {
    recs.push('Good rigging: codebase shows efficient sail configuration')
  }
  if (stats.hasTanglesCount > 3) {
    recs.push(`Rigging tangles: ${stats.hasTanglesCount} files have dependency issues`)
  }
  if (stats.noKeelCount > stats.totalFiles * 0.5) {
    recs.push('No ballast: majority of files lack error handling stability')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete sail rig result from files and contents
 * @example
 * buildSailRigResult(['a.ts'], ['export function a() {}'], {}) // SailRigResult
 */
export function buildSailRigResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): SailRigResult {
  void options

  const panels: SailPanel[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSailPanel(content, file)
    } catch {
      return analyzeSailPanel('', file)
    }
  })

  const dirMap = new Map<string, SailPanel[]>()
  for (const panel of panels) {
    const dir = panel.file.includes('/') ? panel.file.slice(0, panel.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(panel) } else { dirMap.set(dir, [panel]) }
  }

  const fleets: Fleet[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeFleet(ps, dir),
  )

  const n = panels.length || 1
  const avgSailTrim = Math.round(panels.reduce((s, p) => s + p.sailTrim, 0) / n)
  const avgHullSpeed = Math.round(panels.reduce((s, p) => s + p.hullSpeed, 0) / n)
  const avgBallast = Math.round(panels.reduce((s, p) => s + p.ballast, 0) / n)
  const avgRiggingOverhead = Math.round(panels.reduce((s, p) => s + p.riggingOverhead, 0) / n)

  const overallEfficiency = Math.min(100, Math.max(0, Math.round(
    avgSailTrim * 0.25 +
    avgHullSpeed * 0.25 +
    avgBallast * 0.25 +
    avgRiggingOverhead * 0.25,
  )))

  const isSeaworthy = overallEfficiency >= 50

  const regatta: Regatta = {
    avgSailTrim, avgHullSpeed, avgBallast, avgRiggingOverhead,
    isSeaworthy, overallEfficiency,
  }

  const stats: SailRigStats = {
    totalFiles: files.length,
    totalFleets: fleets.length,
    avgSailArea: Math.round(panels.reduce((s, p) => s + p.sailArea, 0) / n),
    avgWindCapture: Math.round(panels.reduce((s, p) => s + p.windCapture, 0) / n),
    avgSailTrim,
    avgHullSpeed,
    avgBallast,
    avgRiggingOverhead,
    yachtRacerCount: panels.filter(p => p.condition === 'yacht-racer').length,
    wellRiggedCount: panels.filter(p => p.condition === 'well-rigged').length,
    sloopCount: panels.filter(p => p.condition === 'sloop').length,
    schoonerCount: panels.filter(p => p.condition === 'schooner').length,
    barePolesCount: panels.filter(p => p.condition === 'bare-poles').length,
    sinkingCount: panels.filter(p => p.condition === 'sinking').length,
    mainSailCount: panels.filter(p => p.sail.type === 'main-sail').length,
    spinnakerCount: panels.filter(p => p.sail.type === 'spinnaker').length,
    stormSailCount: panels.filter(p => p.sail.type === 'storm-sail').length,
    isLuffingCount: panels.filter(p => p.sail.isLuffing).length,
    isInIronsCount: panels.filter(p => p.wind.isInIrons).length,
    hasBarnaclesCount: panels.filter(p => p.hull.hasBarnacles).length,
    hasDragCount: panels.filter(p => p.hull.hasDrag).length,
    hasTanglesCount: panels.filter(p => p.rigging.hasTangles).length,
    isOnCourseCount: panels.filter(p => p.navigation.isOnCourse).length,
    hasCompassCount: panels.filter(p => p.navigation.hasCompass).length,
    finKeelCount: panels.filter(p => p.ballastDetail.keelType === 'fin').length,
    noKeelCount: panels.filter(p => p.ballastDetail.keelType === 'none').length,
    overallEfficiency,
    captainGrade: classifyCaptainGrade(overallEfficiency),
    bestRigged: panels.length > 0
      ? panels.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, panels[0] as typeof panels[number]).file : 'none',
    fastest: panels.length > 0
      ? panels.reduce((a, b) => b.hullSpeed > a.hullSpeed ? b : a, panels[0] as typeof panels[number]).file : 'none',
    mostStable: panels.length > 0
      ? panels.reduce((a, b) => b.ballast > a.ballast ? b : a, panels[0] as typeof panels[number]).file : 'none',
    mostTangled: panels.length > 0
      ? panels.reduce((a, b) => b.rigging.tangleCount > a.rigging.tangleCount ? b : a, panels[0] as typeof panels[number]).file : 'none',
    mostBarnacled: panels.length > 0
      ? panels.reduce((a, b) => b.hull.barnacleCount > a.hull.barnacleCount ? b : a, panels[0] as typeof panels[number]).file : 'none',
  }

  const recommendations = generateRecommendations(panels, fleets, regatta, stats)

  return { panels, fleets, regatta, stats, recommendations }
}
