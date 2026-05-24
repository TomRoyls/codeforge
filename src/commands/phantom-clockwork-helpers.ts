// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Timing precision grade */
export type TimingGrade =
  | 'atomic-clock'
  | 'chronometer'
  | 'precision-watch'
  | 'wall-clock'
  | 'sundial'
  | 'broken-clock'

/** Gear mesh quality */
export type MeshQuality =
  | 'perfect-mesh'
  | 'tight-gears'
  | 'proper-mesh'
  | 'loose-gears'
  | 'grinding'
  | 'stripped-gears'

/** Ghost tolerance level */
export type TolerancePhantom =
  | 'ghost-proof'
  | 'phantom-resistant'
  | 'proper-tolerance'
  | 'narrow-tolerance'
  | 'zero-tolerance'
  | 'shattered'

/** Spring tension level */
export type SpringTension =
  | 'perfect-tension'
  | 'well-wound'
  | 'proper-tension'
  | 'over-wound'
  | 'slack-spring'
  | 'broken-spring'

/** Chime quality level */
export type ChimeLevel =
  | 'westminster'
  | 'grand-father'
  | 'clear-bell'
  | 'muffled-chime'
  | 'dull-thud'
  | 'silent'

/** Gear condition */
export type GearCondition =
  | 'swiss-masterpiece'
  | 'precision-movement'
  | 'proper-clockwork'
  | 'rusty-mechanism'
  | 'jammed-gears'
  | 'stopped-clock'

/** Tower type */
export type TowerType =
  | 'big-ben'
  | 'clock-tower'
  | 'grandfather-clock'
  | 'mantel-clock'
  | 'pocket-watch'
  | 'broken-timepiece'

/** Tower condition */
export type TowerCondition =
  | 'master-crafted'
  | 'well-maintained'
  | 'ticking-fine'
  | 'needs-oiling'
  | 'rusted'
  | 'stopped'

/** Horologist grade */
export type HorologistGrade =
  | 'master-horologist'
  | 'expert-watchmaker'
  | 'skilled-clockmaker'
  | 'apprentice'
  | 'tinkerer'
  | 'time-breaker'

/** Timing measurement */
export interface TimingMeasure {
  precision: number
  grade: TimingGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasTimely: boolean
  hasNoDelay: boolean
  hasExact: boolean
  hasNoDrift: boolean
  hasPunctual: boolean
  hasNoSluggish: boolean
  hasSharp: boolean
  hasNoBlurred: boolean
  hasCrisp: boolean
  delayCount: number
  driftCount: number
}

/** Meshing measurement */
export interface MeshingMeasure {
  quality: number
  mesh: MeshQuality
  hasHighQuality: boolean
  hasAligned: boolean
  hasEngaged: boolean
  hasNoSlipping: boolean
  hasCoupled: boolean
  hasNoDisengaged: boolean
  hasSynced: boolean
  hasNoMisaligned: boolean
  hasInterlocked: boolean
  hasNoJamming: boolean
  hasHarmonious: boolean
  slippingCount: number
  disengagedCount: number
}

/** Tolerating measurement */
export interface ToleratingMeasure {
  tolerance: number
  phantom: TolerancePhantom
  hasHighTolerance: boolean
  hasForgiving: boolean
  hasResilient: boolean
  hasNoBrittle: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasElastic: boolean
  hasNoStiff: boolean
  hasAbsorbing: boolean
  hasNoCracking: boolean
  hasBendable: boolean
  brittleCount: number
  rigidCount: number
}

/** Tensioning measurement */
export interface TensioningMeasure {
  tension: number
  spring: SpringTension
  hasHighTension: boolean
  hasBalanced: boolean
  hasEnergetic: boolean
  hasNoSlack: boolean
  hasResponsive: boolean
  hasNoOverwound: boolean
  hasMeasured: boolean
  hasNoExcessive: boolean
  hasCalm: boolean
  hasNoFrantic: boolean
  hasSteady: boolean
  slackCount: number
  overwoundCount: number
}

/** Chiming measurement */
export interface ChimingMeasure {
  quality: number
  chime: ChimeLevel
  hasHighQuality: boolean
  hasClear: boolean
  hasResonant: boolean
  hasNoMuffled: boolean
  hasMelodic: boolean
  hasNoDissonant: boolean
  hasHarmonious: boolean
  hasNoClashing: boolean
  hasPleasing: boolean
  hasNoHarsh: boolean
  hasBeautiful: boolean
  muffledCount: number
  dissonantCount: number
}

/** Single file analysis */
export interface ClockworkGear {
  file: string
  temporalPrecision: number
  gearMeshing: number
  ghostTolerance: number
  springTension: number
  chimeQuality: number
  timing: TimingMeasure
  meshing: MeshingMeasure
  tolerating: ToleratingMeasure
  tensioning: TensioningMeasure
  chiming: ChimingMeasure
  condition: GearCondition
  qualityScore: number
}

/** Directory-level tower */
export interface ClockworkTower {
  directory: string
  gears: ClockworkGear[]
  avgPrecision: number
  avgMeshing: number
  avgTension: number
  masterpieceCount: number
  stoppedCount: number
  towerType: TowerType
  condition: TowerCondition
}

/** Mechanism summary */
export interface ClockworkMechanism {
  avgPrecision: number
  avgMeshing: number
  avgTension: number
  isRunning: boolean
  overallPrecision: number
}

/** Full stats */
export interface PhantomClockworkStats {
  totalFiles: number
  totalTowers: number
  avgTemporalPrecision: number
  avgGearMeshing: number
  avgGhostTolerance: number
  avgSpringTension: number
  avgChimeQuality: number
  swissMasterpieceCount: number
  precisionMovementCount: number
  properClockworkCount: number
  rustyMechanismCount: number
  jammedGearsCount: number
  stoppedClockCount: number
  hasHighPrecisionCount: number
  hasHighQualityCount: number
  hasHighToleranceCount: number
  hasHighTensionCount: number
  hasHighChimeCount: number
  overallPrecision: number
  horologistGrade: HorologistGrade
  bestGear: string
  mostPrecise: string
  bestMeshed: string
  mostTolerant: string
  bestTensioned: string
}

/** Full result */
export interface PhantomClockworkResult {
  gears: ClockworkGear[]
  towers: ClockworkTower[]
  mechanism: ClockworkMechanism
  stats: PhantomClockworkStats
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
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure temporal precision of code
 * @example
 * const m = measureTiming(content)
 * console.log(m.grade) // 'atomic-clock'
 */
export function measureTiming(content: string): TimingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasImport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0

  const hasAccurate = hasExport(content) && hasImport(content)
  const hasTimely = hasReturnType(content) && hasConst(content)
  const hasExact = hasGenerics(content) && hasAsync(content)
  const hasPunctual = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasSharp = hasNamedExport(content) && hasReturnType(content)
  const hasCrisp = hasExport(content) && hasConst(content)

  score += hasAccurate ? 5 : 0
  score += hasTimely ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasPunctual ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasCrisp ? 5 : 0

  const precision = Math.min(score, 100)
  const delayCount = count(/\bvar\b/, content)
  const driftCount = count(/\bany\b/, content)

  const hasNoDelay = delayCount === 0
  const hasNoDrift = driftCount === 0
  const hasNoSluggish = !has(/\beval\b/, content)
  const hasNoBlurred = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let grade: TimingGrade
  if (precision >= 85) grade = 'atomic-clock'
  else if (precision >= 70) grade = 'chronometer'
  else if (precision >= 55) grade = 'precision-watch'
  else if (precision >= 40) grade = 'wall-clock'
  else if (precision >= 25) grade = 'sundial'
  else grade = 'broken-clock'

  return {
    precision, grade, hasHighPrecision, hasAccurate, hasTimely, hasNoDelay,
    hasExact, hasNoDrift, hasPunctual, hasNoSluggish, hasSharp, hasNoBlurred, hasCrisp,
    delayCount, driftCount,
  }
}

/**
 * Measure gear meshing quality of code
 * @example
 * const m = measureMeshing(content)
 * console.log(m.mesh) // 'perfect-mesh'
 */
export function measureMeshing(content: string): MeshingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasAligned = hasExport(content) && hasImport(content)
  const hasEngaged = hasInterface(content) && hasClass(content)
  const hasCoupled = hasGenerics(content) && hasTypeAlias(content)
  const hasSynced = hasAsync(content) && hasNamedExport(content)
  const hasInterlocked = hasReturnType(content) && hasConst(content)
  const hasHarmonious = hasExport(content) && hasInterface(content)

  score += hasAligned ? 5 : 0
  score += hasEngaged ? 5 : 0
  score += hasCoupled ? 5 : 0
  score += hasSynced ? 5 : 0
  score += hasInterlocked ? 5 : 0
  score += hasHarmonious ? 5 : 0

  const quality = Math.min(score, 100)
  const slippingCount = count(/\bvar\b/, content)
  const disengagedCount = count(/\bany\b/, content)

  const hasNoSlipping = slippingCount === 0
  const hasNoDisengaged = disengagedCount === 0
  const hasNoMisaligned = !has(/\beval\b/, content)
  const hasNoJamming = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let mesh: MeshQuality
  if (quality >= 85) mesh = 'perfect-mesh'
  else if (quality >= 70) mesh = 'tight-gears'
  else if (quality >= 55) mesh = 'proper-mesh'
  else if (quality >= 40) mesh = 'loose-gears'
  else if (quality >= 25) mesh = 'grinding'
  else mesh = 'stripped-gears'

  return {
    quality, mesh, hasHighQuality, hasAligned, hasEngaged, hasNoSlipping,
    hasCoupled, hasNoDisengaged, hasSynced, hasNoMisaligned, hasInterlocked,
    hasNoJamming, hasHarmonious, slippingCount, disengagedCount,
  }
}

/**
 * Measure ghost tolerance of code
 * @example
 * const m = measureTolerating(content)
 * console.log(m.phantom) // 'ghost-proof'
 */
export function measureTolerating(content: string): ToleratingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasForgiving = hasTryCatch(content) && hasAsync(content)
  const hasFlexible = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasElastic = hasStrictEq(content) && hasConst(content)
  const hasAbsorbing = hasInterface(content) && hasReadonly(content)
  const hasBendable = hasExport(content) && hasConst(content)
  const hasResilient = hasReturnType(content) && hasTryCatch(content)

  score += hasForgiving ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasElastic ? 5 : 0
  score += hasAbsorbing ? 5 : 0
  score += hasBendable ? 5 : 0
  score += hasResilient ? 5 : 0

  const tolerance = Math.min(score, 100)
  const brittleCount = count(/\bvar\b/, content)
  const rigidCount = count(/\bany\b/, content)

  const hasNoBrittle = brittleCount === 0
  const hasNoRigid = rigidCount === 0
  const hasNoStiff = !has(/\beval\b/, content)
  const hasNoCracking = !has(/\bdebugger\b/, content)
  const hasHighTolerance = tolerance >= 70

  let phantom: TolerancePhantom
  if (tolerance >= 85) phantom = 'ghost-proof'
  else if (tolerance >= 70) phantom = 'phantom-resistant'
  else if (tolerance >= 55) phantom = 'proper-tolerance'
  else if (tolerance >= 40) phantom = 'narrow-tolerance'
  else if (tolerance >= 25) phantom = 'zero-tolerance'
  else phantom = 'shattered'

  return {
    tolerance, phantom, hasHighTolerance, hasForgiving, hasResilient, hasNoBrittle,
    hasFlexible, hasNoRigid, hasElastic, hasNoStiff, hasAbsorbing, hasNoCracking,
    hasBendable, brittleCount, rigidCount,
  }
}

/**
 * Measure spring tension of code
 * @example
 * const m = measureTensioning(content)
 * console.log(m.spring) // 'perfect-tension'
 */
export function measureTensioning(content: string): TensioningMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasBalanced = hasConst(content) && hasStrictEq(content)
  const hasResponsive = hasExport(content) && hasDocComments(content)
  const hasMeasured = hasReadonly(content) && hasPrivate(content)
  const hasCalm = hasInterface(content) && hasTypeAlias(content)
  const hasSteady = hasReturnType(content) && hasGenerics(content)
  const hasEnergetic = hasConst(content) && hasExport(content)

  score += hasBalanced ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasMeasured ? 5 : 0
  score += hasCalm ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasEnergetic ? 5 : 0

  const tension = Math.min(score, 100)
  const slackCount = count(/\bvar\b/, content)
  const overwoundCount = count(/\bany\b/, content)

  const hasNoSlack = slackCount === 0
  const hasNoOverwound = overwoundCount === 0
  const hasNoExcessive = !has(/\beval\b/, content)
  const hasNoFrantic = !has(/\bdebugger\b/, content)
  const hasHighTension = tension >= 70

  let spring: SpringTension
  if (tension >= 85) spring = 'perfect-tension'
  else if (tension >= 70) spring = 'well-wound'
  else if (tension >= 55) spring = 'proper-tension'
  else if (tension >= 40) spring = 'over-wound'
  else if (tension >= 25) spring = 'slack-spring'
  else spring = 'broken-spring'

  return {
    tension, spring, hasHighTension, hasBalanced, hasEnergetic, hasNoSlack,
    hasResponsive, hasNoOverwound, hasMeasured, hasNoExcessive, hasCalm,
    hasNoFrantic, hasSteady, slackCount, overwoundCount,
  }
}

/**
 * Measure chime quality of code
 * @example
 * const m = measureChiming(content)
 * console.log(m.chime) // 'westminster'
 */
export function measureChiming(content: string): ChimingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasClear = hasDocComments(content) && hasExport(content)
  const hasResonant = hasInterface(content) && hasClass(content)
  const hasMelodic = hasGenerics(content) && hasTypeAlias(content)
  const hasHarmonious = hasNamedExport(content) && hasReturnType(content)
  const hasPleasing = hasAsync(content) && hasDocComments(content)
  const hasBeautiful = hasExport(content) && hasGenerics(content)

  score += hasClear ? 5 : 0
  score += hasResonant ? 5 : 0
  score += hasMelodic ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasPleasing ? 5 : 0
  score += hasBeautiful ? 5 : 0

  const quality = Math.min(score, 100)
  const muffledCount = count(/\bvar\b/, content)
  const dissonantCount = count(/\bany\b/, content)

  const hasNoMuffled = muffledCount === 0
  const hasNoDissonant = dissonantCount === 0
  const hasNoClashing = !has(/\beval\b/, content)
  const hasNoHarsh = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let chime: ChimeLevel
  if (quality >= 85) chime = 'westminster'
  else if (quality >= 70) chime = 'grand-father'
  else if (quality >= 55) chime = 'clear-bell'
  else if (quality >= 40) chime = 'muffled-chime'
  else if (quality >= 25) chime = 'dull-thud'
  else chime = 'silent'

  return {
    quality, chime, hasHighQuality, hasClear, hasResonant, hasNoMuffled,
    hasMelodic, hasNoDissonant, hasHarmonious, hasNoClashing, hasPleasing,
    hasNoHarsh, hasBeautiful, muffledCount, dissonantCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify gear condition
 * @example
 * classifyGearCondition(90) // 'swiss-masterpiece'
 */
export function classifyGearCondition(score: number): GearCondition {
  if (score >= 85) return 'swiss-masterpiece'
  if (score >= 70) return 'precision-movement'
  if (score >= 55) return 'proper-clockwork'
  if (score >= 40) return 'rusty-mechanism'
  if (score >= 25) return 'jammed-gears'
  return 'stopped-clock'
}

/**
 * Classify tower type
 * @example
 * classifyTowerType(gears) // 'big-ben'
 */
export function classifyTowerType(gears: ClockworkGear[]): TowerType {
  if (gears.length === 0) return 'broken-timepiece'
  const avgQs = Math.round(gears.reduce((s, g) => s + g.qualityScore, 0) / gears.length)
  const masterpieceRatio = gears.filter(g => g.condition === 'swiss-masterpiece').length / gears.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'big-ben'
  if (avgQs >= 60) return 'clock-tower'
  if (avgQs >= 45) return 'grandfather-clock'
  if (avgQs >= 30) return 'mantel-clock'
  if (avgQs >= 15) return 'pocket-watch'
  return 'broken-timepiece'
}

/**
 * Classify horologist grade
 * @example
 * classifyHorologistGrade(85) // 'master-horologist'
 */
export function classifyHorologistGrade(avgPrecision: number): HorologistGrade {
  if (avgPrecision >= 80) return 'master-horologist'
  if (avgPrecision >= 65) return 'expert-watchmaker'
  if (avgPrecision >= 50) return 'skilled-clockmaker'
  if (avgPrecision >= 35) return 'apprentice'
  if (avgPrecision >= 20) return 'tinkerer'
  return 'time-breaker'
}

/**
 * Classify tower condition
 * @example
 * classifyTowerCondition(80) // 'master-crafted'
 */
export function classifyTowerCondition(avgQs: number): TowerCondition {
  if (avgQs >= 75) return 'master-crafted'
  if (avgQs >= 60) return 'well-maintained'
  if (avgQs >= 45) return 'ticking-fine'
  if (avgQs >= 30) return 'needs-oiling'
  if (avgQs >= 15) return 'rusted'
  return 'stopped'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(gears, towers, mechanism, stats)
 */
export function generateRecommendations(
  gears: ClockworkGear[],
  towers: ClockworkTower[],
  mechanism: ClockworkMechanism,
  stats: PhantomClockworkStats,
): string[] {
  const recs: string[] = []
  if (stats.avgTemporalPrecision < 50) {
    recs.push('Improve temporal precision with clean imports, efficient flow, and sharp type definitions')
  }
  if (stats.avgGearMeshing < 50) {
    recs.push('Refine gear meshing with better module alignment, engaged interfaces, and harmonious exports')
  }
  if (stats.avgGhostTolerance < 50) {
    recs.push('Enhance ghost tolerance with robust error handling, flexible chaining, and forgiving patterns')
  }
  if (stats.avgSpringTension < 50) {
    recs.push('Adjust spring tension with balanced const usage, measured strictness, and steady typing')
  }
  if (stats.avgChimeQuality < 50) {
    recs.push('Improve chime quality with clear documentation, resonant interfaces, and harmonious exports')
  }
  if (stats.stoppedClockCount > 0) {
    recs.push(`${stats.stoppedClockCount} file(s) are stopped clocks — consider significant refactoring`)
  }
  if (mechanism.overallPrecision < 40) {
    recs.push('Overall precision is low — focus on timing accuracy and gear meshing')
  }
  const allBroken = towers.every(t => t.towerType === 'broken-timepiece' || t.towerType === 'pocket-watch')
  if (allBroken && towers.length > 0) {
    recs.push('All clockwork towers are degraded — consider a major restoration effort')
  }
  const stopped = gears.filter(g => g.condition === 'stopped-clock').map(g => g.file)
  if (stopped.length > 0 && stopped.length <= 3) {
    recs.push(`Repair these stopped clocks: ${stopped.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your phantom clockwork is running perfectly! Every gear meshes with precision')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a clockwork gear
 * @example
 * const gear = analyzeClockworkGear(content, 'index.ts')
 * console.log(gear.condition) // 'swiss-masterpiece'
 */
export function analyzeClockworkGear(content: string, filePath: string): ClockworkGear {
  const timing = measureTiming(content)
  const meshing = measureMeshing(content)
  const tolerating = measureTolerating(content)
  const tensioning = measureTensioning(content)
  const chiming = measureChiming(content)

  const qualityScore = Math.round(
    timing.precision * 0.2 +
    meshing.quality * 0.2 +
    tolerating.tolerance * 0.2 +
    tensioning.tension * 0.2 +
    chiming.quality * 0.2,
  )

  return {
    file: filePath,
    temporalPrecision: timing.precision,
    gearMeshing: meshing.quality,
    ghostTolerance: tolerating.tolerance,
    springTension: tensioning.tension,
    chimeQuality: chiming.quality,
    timing,
    meshing,
    tolerating,
    tensioning,
    chiming,
    condition: classifyGearCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a clockwork tower
 * @example
 * const tower = analyzeClockworkTower(gears, 'src')
 * console.log(tower.towerType) // 'big-ben'
 */
export function analyzeClockworkTower(gears: ClockworkGear[], dirPath: string): ClockworkTower {
  if (gears.length === 0) {
    return {
      directory: dirPath, gears: [], avgPrecision: 0, avgMeshing: 0, avgTension: 0,
      masterpieceCount: 0, stoppedCount: 0, towerType: 'broken-timepiece', condition: 'stopped',
    }
  }

  const avgPrecision = Math.round(gears.reduce((s, g) => s + g.temporalPrecision, 0) / gears.length)
  const avgMeshing = Math.round(gears.reduce((s, g) => s + g.gearMeshing, 0) / gears.length)
  const avgTension = Math.round(gears.reduce((s, g) => s + g.springTension, 0) / gears.length)
  const masterpieceCount = gears.filter(g => g.condition === 'swiss-masterpiece').length
  const stoppedCount = gears.filter(g => g.condition === 'stopped-clock').length
  const avgQs = Math.round(gears.reduce((s, g) => s + g.qualityScore, 0) / gears.length)

  return {
    directory: dirPath, gears, avgPrecision, avgMeshing, avgTension,
    masterpieceCount, stoppedCount, towerType: classifyTowerType(gears),
    condition: classifyTowerCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete phantom clockwork result
 * @example
 * const result = await buildPhantomClockworkResult(files, contents)
 * console.log(result.stats.horologistGrade) // 'master-horologist'
 */
export async function buildPhantomClockworkResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomClockworkResult> {
  const gears = files.map((file, i) => analyzeClockworkGear(contents[i] ?? '', file))

  const dirMap = new Map<string, ClockworkGear[]>()
  for (const gear of gears) {
    const dir = path.dirname(gear.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(gear) } else { dirMap.set(dir, [gear]) }
  }

  const towers = Array.from(dirMap.entries()).map(([dir, dirGears]) =>
    analyzeClockworkTower(dirGears, dir),
  )

  const avgPrecision = gears.length > 0
    ? Math.round(gears.reduce((s, g) => s + g.temporalPrecision, 0) / gears.length) : 0
  const avgMeshing = gears.length > 0
    ? Math.round(gears.reduce((s, g) => s + g.gearMeshing, 0) / gears.length) : 0
  const avgTension = gears.length > 0
    ? Math.round(gears.reduce((s, g) => s + g.springTension, 0) / gears.length) : 0

  const overallPrecision = gears.length > 0
    ? Math.round((avgPrecision + avgMeshing + avgTension) / 3) : 0
  const isRunning = avgPrecision >= 60

  const mechanism: ClockworkMechanism = { avgPrecision, avgMeshing, avgTension, isRunning, overallPrecision }

  const avgGhostTolerance = gears.length > 0
    ? Math.round(gears.reduce((s, g) => s + g.ghostTolerance, 0) / gears.length) : 0
  const avgSpringTension = avgTension
  const avgChimeQuality = gears.length > 0
    ? Math.round(gears.reduce((s, g) => s + g.chimeQuality, 0) / gears.length) : 0

  const bestGear = gears.length > 0
    ? gears.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file : ''
  const mostPrecise = gears.length > 0
    ? gears.reduce((best, g) => g.temporalPrecision > best.temporalPrecision ? g : best).file : ''
  const bestMeshed = gears.length > 0
    ? gears.reduce((best, g) => g.gearMeshing > best.gearMeshing ? g : best).file : ''
  const mostTolerant = gears.length > 0
    ? gears.reduce((best, g) => g.ghostTolerance > best.ghostTolerance ? g : best).file : ''
  const bestTensioned = gears.length > 0
    ? gears.reduce((best, g) => g.springTension > best.springTension ? g : best).file : ''

  const stats: PhantomClockworkStats = {
    totalFiles: gears.length,
    totalTowers: towers.length,
    avgTemporalPrecision: avgPrecision,
    avgGearMeshing: avgMeshing,
    avgGhostTolerance,
    avgSpringTension,
    avgChimeQuality,
    swissMasterpieceCount: gears.filter(g => g.condition === 'swiss-masterpiece').length,
    precisionMovementCount: gears.filter(g => g.condition === 'precision-movement').length,
    properClockworkCount: gears.filter(g => g.condition === 'proper-clockwork').length,
    rustyMechanismCount: gears.filter(g => g.condition === 'rusty-mechanism').length,
    jammedGearsCount: gears.filter(g => g.condition === 'jammed-gears').length,
    stoppedClockCount: gears.filter(g => g.condition === 'stopped-clock').length,
    hasHighPrecisionCount: gears.filter(g => g.timing.hasHighPrecision).length,
    hasHighQualityCount: gears.filter(g => g.meshing.hasHighQuality).length,
    hasHighToleranceCount: gears.filter(g => g.tolerating.hasHighTolerance).length,
    hasHighTensionCount: gears.filter(g => g.tensioning.hasHighTension).length,
    hasHighChimeCount: gears.filter(g => g.chiming.hasHighQuality).length,
    overallPrecision,
    horologistGrade: classifyHorologistGrade(overallPrecision),
    bestGear, mostPrecise, bestMeshed, mostTolerant, bestTensioned,
  }

  const recommendations = generateRecommendations(gears, towers, mechanism, stats)

  return { gears, towers, mechanism, stats, recommendations }
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
