// ─── Type Definitions ────────────────────────────────────

export type GearType = 'spur' | 'bevel' | 'worm' | 'rack' | 'planetary' | 'simple'
export type EscapementType = 'lever' | 'detent' | 'cylinder' | 'tourbillon' | 'simple' | 'broken'
export type GearCondition = 'grand-complication' | 'chronometer' | 'precision-watch' | 'standard-clock' | 'pocket-watch' | 'broken-clock'
export type TowerType = 'observatory-clock' | 'church-clock' | 'town-clock' | 'mantel-clock' | 'cuckoo-clock' | 'stopped-clock'
export type TowerCondition = 'swiss-precision' | 'well-regulated' | 'keeping-time' | 'losing-time' | 'erratic' | 'stopped'
export type HorologistGrade = 'master-watchmaker' | 'watchmaker' | 'horologist' | 'repairman' | 'tinkerer' | 'child'

export interface GearMeasure {
  type: GearType
  teethCount: number
  precision: number
  hasBacklash: boolean
  isWorn: boolean
  isPolished: boolean
  hasGrinding: boolean
  backlashAmount: number
  meshQuality: number
}

export interface EscapementMeasure {
  type: EscapementType
  regulation: number
  hasConsistentBeat: boolean
  hasSkippedBeats: boolean
  hasDoubleTicks: boolean
  hasStalling: boolean
  beatError: number
  isochronism: number
}

export interface SpringMeasure {
  tension: number
  isWound: boolean
  isOverwound: boolean
  isUnwound: boolean
  hasFatigue: boolean
  hasSnapped: boolean
  fatigueLevel: number
  energyReserve: number
}

export interface ChimeMeasure {
  accuracy: number
  hasCorrectNotes: boolean
  hasDiscordantNotes: boolean
  hasMissingNotes: boolean
  hasExtraNotes: boolean
  hasQuarterChimes: boolean
  discordantCount: number
  missingCount: number
}

export interface WindingMeasure {
  state: number
  needsWinding: boolean
  isFullyWound: boolean
  isOverdue: boolean
  hasRust: boolean
  hasDust: boolean
  rustLevel: number
  lastWound: string
}

export interface TickingMeasure {
  regularity: number
  isMetronomic: boolean
  hasIrregularity: boolean
  hasStuttering: boolean
  hasRacing: boolean
  hasCrawling: boolean
  bpm: number
}

export interface FaceMeasure {
  isReadable: boolean
  hasAllMarkers: boolean
  hasHands: boolean
  hasDateWindow: boolean
  isLuminous: boolean
  markerCount: number
}

export interface ClockworkGear {
  file: string
  gearPrecision: number
  escapementRegulation: number
  springTension: number
  chimeAccuracy: number
  windingState: number
  tickRegularity: number
  gear: GearMeasure
  escapement: EscapementMeasure
  spring: SpringMeasure
  chime: ChimeMeasure
  winding: WindingMeasure
  ticking: TickingMeasure
  face: FaceMeasure
  condition: GearCondition
  qualityScore: number
}

export interface ClockTower {
  directory: string
  gears: ClockworkGear[]
  avgPrecision: number
  avgRegulation: number
  avgTension: number
  avgTickRegularity: number
  grandCount: number
  brokenCount: number
  metronomicCount: number
  towerType: TowerType
  condition: TowerCondition
}

export interface AtelierMeasure {
  avgPrecision: number
  avgRegulation: number
  avgTickRegularity: number
  isPrecise: boolean
  overallPrecision: number
}

export interface ClockworkMechanismStats {
  totalFiles: number
  totalTowers: number
  avgGearPrecision: number
  avgEscapementRegulation: number
  avgSpringTension: number
  avgChimeAccuracy: number
  avgWindingState: number
  avgTickRegularity: number
  grandComplicationCount: number
  chronometerCount: number
  precisionWatchCount: number
  standardClockCount: number
  pocketWatchCount: number
  brokenClockCount: number
  spurCount: number
  planetaryCount: number
  leverEscapementCount: number
  tourbillonCount: number
  hasBacklashCount: number
  hasSkippedBeatsCount: number
  hasFatigueCount: number
  isFullyWoundCount: number
  hasRustCount: number
  metronomicCount: number
  isReadableCount: number
  isLuminousCount: number
  overallPrecision: number
  horologistGrade: HorologistGrade
  mostPrecise: string
  bestRegulated: string
  highestTension: string
  mostAccurateChime: string
  bestMaintained: string
}

export interface ClockworkMechanismResult {
  gears: ClockworkGear[]
  towers: ClockTower[]
  atelier: AtelierMeasure
  stats: ClockworkMechanismStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const t = content.match(/\btry\s*\{/g); if (t) count += t.length
  const c = content.match(/\bcatch\s/g); if (c) count += c.length
  const th = content.match(/\bthrow\s/g); if (th) count += th.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const i = content.match(/\bif\s*\(/g); if (i) count += i.length
  const e = content.match(/\belse\s/g); if (e) count += e.length
  const s = content.match(/\bswitch\s*\(/g); if (s) count += s.length
  return count
}

export function maxNesting(content: string): number {
  let max = 0, d = 0
  for (const ch of content) {
    if (ch === '{') { d++; if (d > max) max = d }
    if (ch === '}') d = Math.max(0, d - 1)
  }
  return max
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const s = content.match(/\/\/.*$/gm); if (s) count += s.length
  const b = content.match(/\/\*[\s\S]*?\*\//g); if (b) count += b.length
  return count
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countValidations(content: string): number {
  const m = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return m ? m.length : 0
}

// ─── Gear Measurement ────────────────────────────────────

/**
 * Measure gear precision
 * @example
 * measureGear('export function calc(x: number): number { return x }') // { type, precision, ... }
 */
export function measureGear(content: string): GearMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)

  const teethCount = functions
  const precision = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countValidations(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const hasBacklash = types === 0 && functions > 0
  const isWorn = countTodos(content) > 0
  const isPolished = precision >= 60 && countConsole(content) === 0
  const hasGrinding = countConsole(content) > 0 || countTodos(content) > 0
  const backlashAmount = hasBacklash ? Math.min(100, functions * 20) : 0
  const meshQuality = precision

  let type: GearType = 'simple'
  if (functions >= 5 && types >= 3) type = 'planetary'
  else if (functions >= 3 && exports > 0) type = 'spur'
  else if (functions >= 2 && types > 0) type = 'bevel'
  else if (functions >= 2) type = 'worm'
  else if (functions === 1) type = 'rack'

  return { type, teethCount, precision, hasBacklash, isWorn, isPolished, hasGrinding, backlashAmount, meshQuality }
}

// ─── Escapement Measurement ──────────────────────────────

/**
 * Measure escapement regulation
 * @example
 * measureEscapement('if (x > 0) { try { return x } catch (e) { return 0 } }') // { regulation, ... }
 */
export function measureEscapement(content: string): EscapementMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const types = countTypeAnnotations(content)

  const regulation = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (branches > 0 && branches <= 5 ? 20 : branches > 5 ? 5 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const hasConsistentBeat = errors > 0 && branches > 0
  const hasSkippedBeats = branches > 2 && errors === 0
  const hasDoubleTicks = /return\s+[^;]+;\s*\n\s*return\s+/.test(content)
  const hasStalling = /\bawait\b/.test(content) && errors === 0

  const beatError = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasSkippedBeats ? 30 : 0) +
    (maxNesting(content) > 3 ? 20 : 0) +
    (countTodos(content) * 15) +
    (countConsole(content) * 10),
  )))

  const isochronism = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasConsistentBeat ? 30 : 0) +
    (errors > 0 ? 25 : 0) +
    (maxNesting(content) <= 3 ? 25 : 0) +
    (branches <= 5 ? 20 : 0),
  )))

  let type: EscapementType = 'broken'
  if (regulation >= 80 && hasConsistentBeat) type = 'tourbillon'
  else if (regulation >= 60 && errors > 0) type = 'lever'
  else if (regulation >= 40 && types > 0) type = 'detent'
  else if (regulation >= 20 && branches > 0) type = 'cylinder'
  else if (loc > 0) type = 'simple'

  return { type, regulation, hasConsistentBeat, hasSkippedBeats, hasDoubleTicks, hasStalling, beatError, isochronism }
}

// ─── Spring Measurement ──────────────────────────────────

/**
 * Measure spring tension
 * @example
 * measureSpring('function f(x: number): number { if (x > 0) { return x } return 0 }') // { tension, ... }
 */
export function measureSpring(content: string): SpringMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const functions = countFunctions(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)

  const tension = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches > 0 ? 15 : 0) +
    (functions > 0 ? 15 : 0) +
    (nesting * 10) +
    (loc > 20 ? 15 : loc > 10 ? 10 : 5) +
    (countImports(content) * 10),
  )))

  const isWound = tension > 20
  const isOverwound = tension > 80
  const isUnwound = tension === 0
  const hasFatigue = todos > 0
  const hasSnapped = errors === 0 && branches > 5
  const fatigueLevel = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (todos * 25) +
    (countConsole(content) * 15) +
    (errors === 0 && branches > 2 ? 20 : 0),
  )))
  const energyReserve = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countDescriptiveNames(content) > 0 ? 20 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (todos === 0 ? 10 : 0),
  )))

  return { tension, isWound, isOverwound, isUnwound, hasFatigue, hasSnapped, fatigueLevel, energyReserve }
}

// ─── Chime Measurement ───────────────────────────────────

/**
 * Measure chime accuracy
 * @example
 * measureChime('export function f(): number { return 1 }') // { accuracy, ... }
 */
export function measureChime(content: string): ChimeMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const consoleCount = countConsole(content)

  const accuracy = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const hasCorrectNotes = exports > 0 && types > 0
  const hasDiscordantNotes = consoleCount > 0
  const hasMissingNotes = exports === 0 && loc > 0
  const hasExtraNotes = consoleCount > 0 && exports > 0
  const hasQuarterChimes = consoleCount > 0
  const discordantCount = consoleCount
  const missingCount = hasMissingNotes ? 1 : 0

  return { accuracy, hasCorrectNotes, hasDiscordantNotes, hasMissingNotes, hasExtraNotes, hasQuarterChimes, discordantCount, missingCount }
}

// ─── Winding Measurement ─────────────────────────────────

/**
 * Measure winding state
 * @example
 * measureWinding('export function f(x: number): number { return x }') // { state, ... }
 */
export function measureWinding(content: string): WindingMeasure {
  const loc = countLoc(content)
  const todos = countTodos(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)

  const state = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (todos === 0 ? 15 : 0) +
    (countConsole(content) === 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const needsWinding = state < 40
  const isFullyWound = state >= 70
  const isOverdue = state < 20 && loc > 0
  const hasRust = todos > 0
  const hasDust = countComments(content) === 0 && countJSDoc(content) === 0 && loc > 5
  const rustLevel = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(todos * 25 + (errors === 0 ? 15 : 0))))
  const lastWound = jsdoc > 0 ? 'recent' : todos > 0 ? 'overdue' : loc > 0 ? 'unknown' : 'never'

  return { state, needsWinding, isFullyWound, isOverdue, hasRust, hasDust, rustLevel, lastWound }
}

// ─── Ticking Measurement ─────────────────────────────────

/**
 * Measure tick regularity
 * @example
 * measureTicking('export function f(x: number): number { return x }') // { regularity, ... }
 */
export function measureTicking(content: string): TickingMeasure {
  const loc = countLoc(content)
  const nesting = maxNesting(content)
  const branches = countBranches(content)
  const errors = countErrorHandling(content)

  const regularity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting <= 3 ? 25 : nesting <= 5 ? 12 : 0) +
    (branches <= 5 ? 25 : branches <= 10 ? 12 : 0) +
    (errors > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0) +
    (countExports(content) > 0 ? 15 : 0),
  )))

  const isMetronomic = regularity >= 80
  const hasIrregularity = regularity > 0 && regularity < 50
  const hasStuttering = branches > 5 && errors === 0
  const hasRacing = branches <= 1 && countExports(content) > 0 && loc <= 5
  const hasCrawling = nesting > 4 && branches > 8
  const bpm = loc === 0 ? 0 : Math.min(120, Math.max(40, Math.round(60 + (branches - nesting) * 5)))

  return { regularity, isMetronomic, hasIrregularity, hasStuttering, hasRacing, hasCrawling, bpm }
}

// ─── Face Measurement ────────────────────────────────────

/**
 * Measure face readability
 * @example
 * measureFace('export function f(x: number): number { return x }') // { isReadable, ... }
 */
export function measureFace(content: string): FaceMeasure {
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)

  const isReadable = exports > 0 && types > 0
  const hasAllMarkers = exports > 0 && types > 0 && countErrorHandling(content) > 0
  const hasHands = countFunctions(content) > 0
  const hasDateWindow = jsdoc > 0
  const isLuminous = jsdoc > 0 || countComments(content) > 0
  const markerCount = exports + types

  return { isReadable, hasAllMarkers, hasHands, hasDateWindow, isLuminous, markerCount }
}

// ─── Classification ──────────────────────────────────────

export function classifyGearCondition(qualityScore: number): GearCondition {
  if (qualityScore >= 85) return 'grand-complication'
  if (qualityScore >= 68) return 'chronometer'
  if (qualityScore >= 50) return 'precision-watch'
  if (qualityScore >= 32) return 'standard-clock'
  if (qualityScore >= 15) return 'pocket-watch'
  return 'broken-clock'
}

export function classifyTowerType(gears: ClockworkGear[]): TowerType {
  if (gears.length === 0) return 'stopped-clock'
  const avg = gears.reduce((s, g) => s + g.qualityScore, 0) / gears.length
  if (avg >= 80) return 'observatory-clock'
  if (avg >= 62) return 'church-clock'
  if (avg >= 45) return 'town-clock'
  if (avg >= 28) return 'mantel-clock'
  if (avg >= 12) return 'cuckoo-clock'
  return 'stopped-clock'
}

export function classifyTowerCondition(gears: ClockworkGear[]): TowerCondition {
  if (gears.length === 0) return 'stopped'
  const avg = gears.reduce((s, g) => s + g.qualityScore, 0) / gears.length
  if (avg >= 80) return 'swiss-precision'
  if (avg >= 62) return 'well-regulated'
  if (avg >= 45) return 'keeping-time'
  if (avg >= 28) return 'losing-time'
  if (avg >= 12) return 'erratic'
  return 'stopped'
}

export function classifyHorologistGrade(avgPrecision: number): HorologistGrade {
  if (avgPrecision >= 80) return 'master-watchmaker'
  if (avgPrecision >= 65) return 'watchmaker'
  if (avgPrecision >= 48) return 'horologist'
  if (avgPrecision >= 32) return 'repairman'
  if (avgPrecision >= 16) return 'tinkerer'
  return 'child'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a clockwork gear
 * @example
 * analyzeClockworkGear('export function f(x: number): number { return x }', 'f.ts') // ClockworkGear
 */
export function analyzeClockworkGear(content: string, filePath: string): ClockworkGear {
  const gear = measureGear(content)
  const escapement = measureEscapement(content)
  const spring = measureSpring(content)
  const chime = measureChime(content)
  const winding = measureWinding(content)
  const ticking = measureTicking(content)
  const face = measureFace(content)

  const gearPrecision = gear.precision
  const escapementRegulation = escapement.regulation
  const springTension = spring.energyReserve
  const chimeAccuracy = chime.accuracy
  const windingState = winding.state
  const tickRegularity = ticking.regularity

  const loc = countLoc(content)
  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (gearPrecision * 0.18) +
    (escapementRegulation * 0.18) +
    (springTension * 0.14) +
    (chimeAccuracy * 0.18) +
    (windingState * 0.14) +
    (tickRegularity * 0.18),
  )))

  const condition = classifyGearCondition(qualityScore)

  return {
    file: filePath,
    gearPrecision, escapementRegulation, springTension, chimeAccuracy, windingState, tickRegularity,
    gear, escapement, spring, chime, winding, ticking, face,
    condition, qualityScore,
  }
}

// ─── Clock Tower ─────────────────────────────────────────

/**
 * Analyze a directory as a clock tower
 * @example
 * analyzeClockTower(gears, 'src') // ClockTower
 */
export function analyzeClockTower(gears: ClockworkGear[], dirPath: string): ClockTower {
  const n = gears.length
  const avgPrecision = n === 0 ? 0 : Math.round(gears.reduce((s, g) => s + g.gearPrecision, 0) / n)
  const avgRegulation = n === 0 ? 0 : Math.round(gears.reduce((s, g) => s + g.escapementRegulation, 0) / n)
  const avgTension = n === 0 ? 0 : Math.round(gears.reduce((s, g) => s + g.springTension, 0) / n)
  const avgTickRegularity = n === 0 ? 0 : Math.round(gears.reduce((s, g) => s + g.tickRegularity, 0) / n)
  const grandCount = gears.filter(g => g.condition === 'grand-complication').length
  const brokenCount = gears.filter(g => g.condition === 'broken-clock').length
  const metronomicCount = gears.filter(g => g.ticking.isMetronomic).length

  return {
    directory: dirPath, gears,
    avgPrecision, avgRegulation, avgTension, avgTickRegularity,
    grandCount, brokenCount, metronomicCount,
    towerType: classifyTowerType(gears),
    condition: classifyTowerCondition(gears),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(gears, towers, atelier, stats) // string[]
 */
export function generateRecommendations(
  _gears: ClockworkGear[],
  towers: ClockTower[],
  atelier: AtelierMeasure,
  stats: ClockworkMechanismStats,
): string[] {
  const recs: string[] = []

  if (stats.brokenClockCount + stats.pocketWatchCount > 0) {
    recs.push(`Needs overhaul: ${stats.brokenClockCount + stats.pocketWatchCount} file(s) need structural repair`)
  }
  if (stats.hasSkippedBeatsCount > stats.totalFiles * 0.3) {
    recs.push('Skipping beats - add error handling to regulate flow')
  }
  if (stats.hasFatigueCount > 0 && stats.hasRustCount > 0) {
    recs.push(`Spring fatigue: ${stats.hasFatigueCount} file(s) have accumulated tech debt`)
  }
  if (stats.hasBacklashCount > 0) {
    recs.push(`Gear backlash: ${stats.hasBacklashCount} file(s) have loose type coupling`)
  }
  if (stats.isLuminousCount === 0 && stats.totalFiles > 0) {
    recs.push('Dark faces - add JSDoc documentation to illuminate code')
  }
  if (atelier.overallPrecision >= 70) {
    recs.push('Precision timepiece - excellent mechanical quality throughout')
  }
  if (stats.metronomicCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Metronomic precision - consistent execution patterns across codebase')
  }
  if (towers.length > 1) {
    const stoppedTowers = towers.filter(t => t.towerType === 'stopped-clock' || t.towerType === 'cuckoo-clock')
    if (stoppedTowers.length > 0) {
      recs.push(`Stopped towers: ${stoppedTowers.map(t => t.directory).join(', ')} need rewinding`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete clockwork-mechanism result
 * @example
 * buildClockworkMechanismResult(['a.ts'], ['export function a() {}'], {}) // ClockworkMechanismResult
 */
export function buildClockworkMechanismResult(files: string[], contents: string[], _options: Record<string, unknown>): ClockworkMechanismResult {
  const gears: ClockworkGear[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeClockworkGear(content ?? '', file)
  })

  const dirMap = new Map<string, ClockworkGear[]>()
  for (const g of gears) {
    const parts = g.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(g) } else { dirMap.set(dir, [g]) }
  }

  const towers = Array.from(dirMap.entries()).map(([dir, gs]) =>
    analyzeClockTower(gs, dir),
  )

  const totalFiles = gears.length
  const avg = (fn: (g: ClockworkGear) => number) => totalFiles === 0 ? 0 : Math.round(gears.reduce((s, g) => s + fn(g), 0) / totalFiles)
  const overallPrecision = avg(g => g.qualityScore)

  const atelier: AtelierMeasure = {
    avgPrecision: avg(g => g.gearPrecision),
    avgRegulation: avg(g => g.escapementRegulation),
    avgTickRegularity: avg(g => g.tickRegularity),
    isPrecise: overallPrecision >= 60,
    overallPrecision,
  }

  const condCounts = { grand: 0, chronometer: 0, precisionWatch: 0, standardClock: 0, pocketWatch: 0, brokenClock: 0 }
  for (const g of gears) {
    switch (g.condition) {
      case 'grand-complication': condCounts.grand++; break
      case 'chronometer': condCounts.chronometer++; break
      case 'precision-watch': condCounts.precisionWatch++; break
      case 'standard-clock': condCounts.standardClock++; break
      case 'pocket-watch': condCounts.pocketWatch++; break
      case 'broken-clock': condCounts.brokenClock++; break
    }
  }

  const stats: ClockworkMechanismStats = {
    totalFiles,
    totalTowers: towers.length,
    avgGearPrecision: avg(g => g.gearPrecision),
    avgEscapementRegulation: avg(g => g.escapementRegulation),
    avgSpringTension: avg(g => g.springTension),
    avgChimeAccuracy: avg(g => g.chimeAccuracy),
    avgWindingState: avg(g => g.windingState),
    avgTickRegularity: avg(g => g.tickRegularity),
    grandComplicationCount: condCounts.grand,
    chronometerCount: condCounts.chronometer,
    precisionWatchCount: condCounts.precisionWatch,
    standardClockCount: condCounts.standardClock,
    pocketWatchCount: condCounts.pocketWatch,
    brokenClockCount: condCounts.brokenClock,
    spurCount: gears.filter(g => g.gear.type === 'spur').length,
    planetaryCount: gears.filter(g => g.gear.type === 'planetary').length,
    leverEscapementCount: gears.filter(g => g.escapement.type === 'lever').length,
    tourbillonCount: gears.filter(g => g.escapement.type === 'tourbillon').length,
    hasBacklashCount: gears.filter(g => g.gear.hasBacklash).length,
    hasSkippedBeatsCount: gears.filter(g => g.escapement.hasSkippedBeats).length,
    hasFatigueCount: gears.filter(g => g.spring.hasFatigue).length,
    isFullyWoundCount: gears.filter(g => g.winding.isFullyWound).length,
    hasRustCount: gears.filter(g => g.winding.hasRust).length,
    metronomicCount: gears.filter(g => g.ticking.isMetronomic).length,
    isReadableCount: gears.filter(g => g.face.isReadable).length,
    isLuminousCount: gears.filter(g => g.face.isLuminous).length,
    overallPrecision,
    horologistGrade: classifyHorologistGrade(overallPrecision),
    mostPrecise: totalFiles === 0 ? 'none' : gears.reduce((b, g) => g.gearPrecision > b.gearPrecision ? g : b).file,
    bestRegulated: totalFiles === 0 ? 'none' : gears.reduce((b, g) => g.escapementRegulation > b.escapementRegulation ? g : b).file,
    highestTension: totalFiles === 0 ? 'none' : gears.reduce((b, g) => g.springTension > b.springTension ? g : b).file,
    mostAccurateChime: totalFiles === 0 ? 'none' : gears.reduce((b, g) => g.chimeAccuracy > b.chimeAccuracy ? g : b).file,
    bestMaintained: totalFiles === 0 ? 'none' : gears.reduce((b, g) => g.windingState > b.windingState ? g : b).file,
  }

  const recommendations = generateRecommendations(gears, towers, atelier, stats)

  return { gears, towers, atelier, stats, recommendations }
}
