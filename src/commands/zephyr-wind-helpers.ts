// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Lightness grade */
export type LightnessGrade =
  | 'feather-light'
  | 'gentle-breeze'
  | 'proper-draft'
  | 'heavy-air'
  | 'stagnant'
  | 'lead-weight'

/** Direction grade */
export type DirectionGrade =
  | 'true-north'
  | 'clear-heading'
  | 'proper-flow'
  | 'cross-current'
  | 'lost-direction'
  | 'spinning'

/** Resilience grade */
export type ResilienceGrade =
  | 'storm-proof'
  | 'wind-resistant'
  | 'proper-anchor'
  | 'blown-about'
  | 'toppled'
  | 'swept-away'

/** Carriage grade */
export type CarriageGrade =
  | 'swift-courier'
  | 'proper-carrier'
  | 'decent-transport'
  | 'slow-delivery'
  | 'lost-cargo'
  | 'no-carriage'

/** Atmosphere grade */
export type AtmosphereGrade =
  | 'spring-breeze'
  | 'fresh-air'
  | 'proper-atmosphere'
  | 'stuffy-room'
  | 'stale-air'
  | 'vacuum'

/** Wind condition */
export type WindCondition =
  | 'gentle-zephyr'
  | 'proper-breeze'
  | 'fair-wind'
  | 'stiff-breeze'
  | 'gale-force'
  | 'dead-calm'

/** Field type */
export type FieldType =
  | 'trade-winds'
  | 'prevailing-westerly'
  | 'proper-belt'
  | 'local-breeze'
  | 'still-air'
  | 'no-wind'

/** Field condition */
export type FieldCondition =
  | 'perfect-sailing'
  | 'fair-winds'
  | 'decent-breeze'
  | 'headwind'
  | 'doldrums'
  | 'beached'

/** Pilot grade */
export type PilotGrade =
  | 'master-sailor'
  | 'wind-reader'
  | 'skilled-helmsman'
  | 'deck-hand'
  | 'novice'
  | 'landlubber'

/** Lightening measurement */
export interface LighteningMeasure {
  lightness: number
  grade: LightnessGrade
  hasHighLightness: boolean
  hasLightweight: boolean
  hasElegant: boolean
  hasNoBloated: boolean
  hasLean: boolean
  hasNoHeavy: boolean
  hasMinimal: boolean
  hasNoExcessive: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasGraceful: boolean
  bloatedCount: number
  heavyCount: number
}

/** Directing measurement */
export interface DirectingMeasure {
  direction: number
  current: DirectionGrade
  hasHighDirection: boolean
  hasClear: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasDirected: boolean
  hasNoWandering: boolean
  hasPurposeful: boolean
  hasNoAimless: boolean
  hasFlowing: boolean
  hasNoChaotic: boolean
  hasIntentional: boolean
  scatteredCount: number
  wanderingCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resilience: number
  gust: ResilienceGrade
  hasHighResilience: boolean
  hasStable: boolean
  hasAnchored: boolean
  hasNoTumbling: boolean
  hasSteady: boolean
  hasNoReeling: boolean
  hasResilient: boolean
  hasNoFragile: boolean
  hasGrounded: boolean
  hasNoOverturned: boolean
  hasFirm: boolean
  tumblingCount: number
  fragileCount: number
}

/** Carrying measurement */
export interface CarryingMeasure {
  quality: number
  carriage: CarriageGrade
  hasHighQuality: boolean
  hasEfficient: boolean
  hasDeliver: boolean
  hasNoStalling: boolean
  hasTransporting: boolean
  hasNoDropping: boolean
  hasCarrying: boolean
  hasNoLosing: boolean
  hasConveying: boolean
  hasNoFailing: boolean
  hasTransmitting: boolean
  stallingCount: number
  droppingCount: number
}

/** Surrounding measurement */
export interface SurroundingMeasure {
  quality: number
  atmosphere: AtmosphereGrade
  hasHighQuality: boolean
  hasPleasant: boolean
  hasComfortable: boolean
  hasNoHostile: boolean
  hasWelcoming: boolean
  hasNoHarsh: boolean
  hasHealthy: boolean
  hasNoToxic: boolean
  hasInviting: boolean
  hasNoRepellent: boolean
  hasNurturing: boolean
  hostileCount: number
  harshCount: number
}

/** Single file analysis */
export interface WindCurrent {
  file: string
  breezeLightness: number
  currentDirection: number
  gustResilience: number
  breezeCarriage: number
  atmosphereQuality: number
  lightening: LighteningMeasure
  directing: DirectingMeasure
  resisting: ResistingMeasure
  carrying: CarryingMeasure
  surrounding: SurroundingMeasure
  condition: WindCondition
  qualityScore: number
}

/** Directory-level field */
export interface WindField {
  directory: string
  currents: WindCurrent[]
  avgLightness: number
  avgDirection: number
  avgResilience: number
  gentleZephyrCount: number
  deadCalmCount: number
  fieldType: FieldType
  condition: FieldCondition
}

/** Sky summary */
export interface SkySummary {
  avgLightness: number
  avgDirection: number
  avgResilience: number
  isBlowing: boolean
  overallFreshness: number
}

/** Full stats */
export interface ZephyrWindStats {
  totalFiles: number
  totalFields: number
  avgBreezeLightness: number
  avgCurrentDirection: number
  avgGustResilience: number
  avgBreezeCarriage: number
  avgAtmosphereQuality: number
  gentleZephyrCount: number
  properBreezeCount: number
  fairWindCount: number
  stiffBreezeCount: number
  galeForceCount: number
  deadCalmCount: number
  hasHighLightnessCount: number
  hasHighDirectionCount: number
  hasHighResilienceCount: number
  hasHighQualityCount: number
  hasHighAtmosphereCount: number
  overallFreshness: number
  pilotGrade: PilotGrade
  bestCurrent: string
  lightest: string
  clearestDirection: string
  mostResilient: string
  bestCarrier: string
}

/** Full result */
export interface ZephyrWindResult {
  currents: WindCurrent[]
  fields: WindField[]
  sky: SkySummary
  stats: ZephyrWindStats
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
 * Measure breeze lightness
 * @example
 * const m = measureLightening(content)
 * console.log(m.grade) // 'feather-light'
 */
export function measureLightening(content: string): LighteningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasLightweight = hasExport(content) && hasAsync(content)
  const hasElegant = hasNamedExport(content) && hasReturnType(content)
  const hasLean = hasConst(content) && hasImport(content)
  const hasMinimal = hasGenerics(content) && hasInterface(content)
  const hasEfficient = hasDocComments(content) && hasExport(content)
  const hasGraceful = hasTypeAlias(content) && hasConst(content)

  score += hasLightweight ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasMinimal ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasGraceful ? 5 : 0

  const lightness = Math.min(score, 100)
  const bloatedCount = count(/\bvar\b/, content)
  const heavyCount = count(/\bany\b/, content)

  const hasNoBloated = bloatedCount === 0
  const hasNoHeavy = heavyCount === 0
  const hasNoExcessive = !has(/\beval\b/, content)
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighLightness = lightness >= 70

  let grade: LightnessGrade
  if (lightness >= 85) grade = 'feather-light'
  else if (lightness >= 70) grade = 'gentle-breeze'
  else if (lightness >= 55) grade = 'proper-draft'
  else if (lightness >= 40) grade = 'heavy-air'
  else if (lightness >= 25) grade = 'stagnant'
  else grade = 'lead-weight'

  return {
    lightness, grade, hasHighLightness, hasLightweight, hasElegant, hasNoBloated,
    hasLean, hasNoHeavy, hasMinimal, hasNoExcessive, hasEfficient, hasNoWasteful,
    hasGraceful, bloatedCount, heavyCount,
  }
}

/**
 * Measure current direction
 * @example
 * const m = measureDirecting(content)
 * console.log(m.current) // 'true-north'
 */
export function measureDirecting(content: string): DirectingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasClear = hasReturnType(content) && hasStrictEq(content)
  const hasFocused = hasNamedExport(content) && hasInterface(content)
  const hasDirected = hasGenerics(content) && hasReadonly(content)
  const hasPurposeful = hasPrivate(content) && hasStrictEq(content)
  const hasFlowing = hasDocComments(content) && hasNamedExport(content)
  const hasIntentional = hasClass(content) && hasReturnType(content)

  score += hasClear ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasDirected ? 5 : 0
  score += hasPurposeful ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasIntentional ? 5 : 0

  const direction = Math.min(score, 100)
  const scatteredCount = count(/\bvar\b/, content)
  const wanderingCount = count(/\bany\b/, content)

  const hasNoScattered = scatteredCount === 0
  const hasNoWandering = wanderingCount === 0
  const hasNoAimless = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighDirection = direction >= 70

  let current: DirectionGrade
  if (direction >= 85) current = 'true-north'
  else if (direction >= 70) current = 'clear-heading'
  else if (direction >= 55) current = 'proper-flow'
  else if (direction >= 40) current = 'cross-current'
  else if (direction >= 25) current = 'lost-direction'
  else current = 'spinning'

  return {
    direction, current, hasHighDirection, hasClear, hasFocused, hasNoScattered,
    hasDirected, hasNoWandering, hasPurposeful, hasNoAimless, hasFlowing, hasNoChaotic,
    hasIntentional, scatteredCount, wanderingCount,
  }
}

/**
 * Measure gust resilience
 * @example
 * const m = measureResisting(content)
 * console.log(m.gust) // 'storm-proof'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasStable = hasConst(content) && hasStrictEq(content)
  const hasAnchored = hasReadonly(content) && hasPrivate(content)
  const hasSteady = hasInterface(content) && hasTypeAlias(content)
  const hasResilient = hasReturnType(content) && hasStrictEq(content)
  const hasGrounded = hasExport(content) && hasImport(content)
  const hasFirm = hasClass(content) && hasConst(content)

  score += hasStable ? 5 : 0
  score += hasAnchored ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasGrounded ? 5 : 0
  score += hasFirm ? 5 : 0

  const resilience = Math.min(score, 100)
  const tumblingCount = count(/\bvar\b/, content)
  const fragileCount = count(/\bany\b/, content)

  const hasNoTumbling = tumblingCount === 0
  const hasNoReeling = fragileCount === 0
  const hasNoFragile = !has(/\beval\b/, content)
  const hasNoOverturned = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let gust: ResilienceGrade
  if (resilience >= 85) gust = 'storm-proof'
  else if (resilience >= 70) gust = 'wind-resistant'
  else if (resilience >= 55) gust = 'proper-anchor'
  else if (resilience >= 40) gust = 'blown-about'
  else if (resilience >= 25) gust = 'toppled'
  else gust = 'swept-away'

  return {
    resilience, gust, hasHighResilience, hasStable, hasAnchored, hasNoTumbling,
    hasSteady, hasNoReeling, hasResilient, hasNoFragile, hasGrounded, hasNoOverturned,
    hasFirm, tumblingCount, fragileCount,
  }
}

/**
 * Measure breeze carriage
 * @example
 * const m = measureCarrying(content)
 * console.log(m.carriage) // 'swift-courier'
 */
export function measureCarrying(content: string): CarryingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasEfficient = hasExport(content) && hasImport(content)
  const hasDeliver = hasReturnType(content) && hasConst(content)
  const hasTransporting = hasInterface(content) && hasGenerics(content)
  const hasCarrying = hasAsync(content) && hasNamedExport(content)
  const hasConveying = hasDocComments(content) && hasExport(content)
  const hasTransmitting = hasClass(content) && hasReturnType(content)

  score += hasEfficient ? 5 : 0
  score += hasDeliver ? 5 : 0
  score += hasTransporting ? 5 : 0
  score += hasCarrying ? 5 : 0
  score += hasConveying ? 5 : 0
  score += hasTransmitting ? 5 : 0

  const quality = Math.min(score, 100)
  const stallingCount = count(/\bvar\b/, content)
  const droppingCount = count(/\bany\b/, content)

  const hasNoStalling = stallingCount === 0
  const hasNoDropping = droppingCount === 0
  const hasNoLosing = !has(/\beval\b/, content)
  const hasNoFailing = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let carriage: CarriageGrade
  if (quality >= 85) carriage = 'swift-courier'
  else if (quality >= 70) carriage = 'proper-carrier'
  else if (quality >= 55) carriage = 'decent-transport'
  else if (quality >= 40) carriage = 'slow-delivery'
  else if (quality >= 25) carriage = 'lost-cargo'
  else carriage = 'no-carriage'

  return {
    quality, carriage, hasHighQuality, hasEfficient, hasDeliver, hasNoStalling,
    hasTransporting, hasNoDropping, hasCarrying, hasNoLosing, hasConveying, hasNoFailing,
    hasTransmitting, stallingCount, droppingCount,
  }
}

/**
 * Measure atmosphere quality
 * @example
 * const m = measureSurrounding(content)
 * console.log(m.atmosphere) // 'spring-breeze'
 */
export function measureSurrounding(content: string): SurroundingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasPleasant = hasDocComments(content) && hasInterface(content)
  const hasComfortable = hasExport(content) && hasImport(content)
  const hasWelcoming = hasTypeAlias(content) && hasGenerics(content)
  const hasHealthy = hasReturnType(content) && hasReadonly(content)
  const hasInviting = hasConst(content) && hasDocComments(content)
  const hasNurturing = hasAsync(content) && hasExport(content)

  score += hasPleasant ? 5 : 0
  score += hasComfortable ? 5 : 0
  score += hasWelcoming ? 5 : 0
  score += hasHealthy ? 5 : 0
  score += hasInviting ? 5 : 0
  score += hasNurturing ? 5 : 0

  const quality = Math.min(score, 100)
  const hostileCount = count(/\bvar\b/, content)
  const harshCount = count(/\bany\b/, content)

  const hasNoHostile = hostileCount === 0
  const hasNoHarsh = harshCount === 0
  const hasNoToxic = !has(/\beval\b/, content)
  const hasNoRepellent = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let atmosphere: AtmosphereGrade
  if (quality >= 85) atmosphere = 'spring-breeze'
  else if (quality >= 70) atmosphere = 'fresh-air'
  else if (quality >= 55) atmosphere = 'proper-atmosphere'
  else if (quality >= 40) atmosphere = 'stuffy-room'
  else if (quality >= 25) atmosphere = 'stale-air'
  else atmosphere = 'vacuum'

  return {
    quality, atmosphere, hasHighQuality, hasPleasant, hasComfortable, hasNoHostile,
    hasWelcoming, hasNoHarsh, hasHealthy, hasNoToxic, hasInviting, hasNoRepellent,
    hasNurturing, hostileCount, harshCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify wind condition
 * @example
 * classifyWindCondition(90) // 'gentle-zephyr'
 */
export function classifyWindCondition(score: number): WindCondition {
  if (score >= 85) return 'gentle-zephyr'
  if (score >= 70) return 'proper-breeze'
  if (score >= 55) return 'fair-wind'
  if (score >= 40) return 'stiff-breeze'
  if (score >= 25) return 'gale-force'
  return 'dead-calm'
}

/**
 * Classify field type
 * @example
 * classifyFieldType(currents) // 'trade-winds'
 */
export function classifyFieldType(currents: WindCurrent[]): FieldType {
  if (currents.length === 0) return 'no-wind'
  const avgQs = Math.round(currents.reduce((s, c) => s + c.qualityScore, 0) / currents.length)
  const zephyrRatio = currents.filter(c => c.condition === 'gentle-zephyr').length / currents.length
  if (avgQs >= 75 && zephyrRatio >= 0.5) return 'trade-winds'
  if (avgQs >= 60) return 'prevailing-westerly'
  if (avgQs >= 45) return 'proper-belt'
  if (avgQs >= 30) return 'local-breeze'
  if (avgQs >= 15) return 'still-air'
  return 'no-wind'
}

/**
 * Classify field condition
 * @example
 * classifyFieldCondition(80) // 'perfect-sailing'
 */
export function classifyFieldCondition(avgQs: number): FieldCondition {
  if (avgQs >= 75) return 'perfect-sailing'
  if (avgQs >= 60) return 'fair-winds'
  if (avgQs >= 45) return 'decent-breeze'
  if (avgQs >= 30) return 'headwind'
  if (avgQs >= 15) return 'doldrums'
  return 'beached'
}

/**
 * Classify pilot grade
 * @example
 * classifyPilotGrade(85) // 'master-sailor'
 */
export function classifyPilotGrade(avgFreshness: number): PilotGrade {
  if (avgFreshness >= 80) return 'master-sailor'
  if (avgFreshness >= 65) return 'wind-reader'
  if (avgFreshness >= 50) return 'skilled-helmsman'
  if (avgFreshness >= 35) return 'deck-hand'
  if (avgFreshness >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(currents, fields, sky, stats)
 */
export function generateRecommendations(
  currents: WindCurrent[],
  fields: WindField[],
  sky: SkySummary,
  stats: ZephyrWindStats,
): string[] {
  const recs: string[] = []
  if (stats.avgBreezeLightness < 50) {
    recs.push('Lighten the breeze with lightweight async/export pairs, elegant named exports, and lean const/import patterns')
  }
  if (stats.avgCurrentDirection < 50) {
    recs.push('Clarify current direction with clear return types, focused interfaces, and purposeful readonly guards')
  }
  if (stats.avgGustResilience < 50) {
    recs.push('Strengthen gust resilience with stable const declarations, anchored readonly/private pairs, and grounded exports')
  }
  if (stats.avgBreezeCarriage < 50) {
    recs.push('Improve breeze carriage with efficient export/import transport, delivering return types, and carrying async patterns')
  }
  if (stats.avgAtmosphereQuality < 50) {
    recs.push('Freshen atmosphere with pleasant doc comments, welcoming type aliases, and healthy readonly guards')
  }
  if (stats.deadCalmCount > 0) {
    recs.push(`${stats.deadCalmCount} file(s) are dead calm — consider significant refactoring`)
  }
  if (sky.overallFreshness < 40) {
    recs.push('Overall wind freshness is stagnant — focus on lightness and direction first')
  }
  const allStill = fields.every(f => f.fieldType === 'no-wind' || f.fieldType === 'still-air')
  if (allStill && fields.length > 0) {
    recs.push('All fields are still or windless — consider a major quality overhaul')
  }
  const calms = currents.filter(c => c.condition === 'dead-calm').map(c => c.file)
  if (calms.length > 0 && calms.length <= 3) {
    recs.push(`Transform these dead calm files into gentle zephyrs: ${calms.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your winds are master-sailor quality! Every breeze carries elegance and purpose')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as wind current
 * @example
 * const current = analyzeWindCurrent(content, 'index.ts')
 * console.log(current.condition) // 'gentle-zephyr'
 */
export function analyzeWindCurrent(content: string, filePath: string): WindCurrent {
  const lightening = measureLightening(content)
  const directing = measureDirecting(content)
  const resisting = measureResisting(content)
  const carrying = measureCarrying(content)
  const surrounding = measureSurrounding(content)

  const qualityScore = Math.round(
    lightening.lightness * 0.2 +
    directing.direction * 0.2 +
    resisting.resilience * 0.2 +
    carrying.quality * 0.2 +
    surrounding.quality * 0.2,
  )

  return {
    file: filePath,
    breezeLightness: lightening.lightness,
    currentDirection: directing.direction,
    gustResilience: resisting.resilience,
    breezeCarriage: carrying.quality,
    atmosphereQuality: surrounding.quality,
    lightening,
    directing,
    resisting,
    carrying,
    surrounding,
    condition: classifyWindCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a wind field
 * @example
 * const field = analyzeWindField(currents, 'src')
 * console.log(field.fieldType) // 'trade-winds'
 */
export function analyzeWindField(currents: WindCurrent[], dirPath: string): WindField {
  if (currents.length === 0) {
    return {
      directory: dirPath, currents: [], avgLightness: 0, avgDirection: 0, avgResilience: 0,
      gentleZephyrCount: 0, deadCalmCount: 0, fieldType: 'no-wind', condition: 'beached',
    }
  }

  const avgLightness = Math.round(currents.reduce((s, c) => s + c.breezeLightness, 0) / currents.length)
  const avgDirection = Math.round(currents.reduce((s, c) => s + c.currentDirection, 0) / currents.length)
  const avgResilience = Math.round(currents.reduce((s, c) => s + c.gustResilience, 0) / currents.length)
  const gentleZephyrCount = currents.filter(c => c.condition === 'gentle-zephyr').length
  const deadCalmCount = currents.filter(c => c.condition === 'dead-calm').length
  const avgQs = Math.round(currents.reduce((s, c) => s + c.qualityScore, 0) / currents.length)

  return {
    directory: dirPath, currents, avgLightness, avgDirection, avgResilience,
    gentleZephyrCount, deadCalmCount, fieldType: classifyFieldType(currents),
    condition: classifyFieldCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete zephyr wind result
 * @example
 * const result = await buildZephyrWindResult(files, contents)
 * console.log(result.stats.pilotGrade) // 'master-sailor'
 */
export async function buildZephyrWindResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ZephyrWindResult> {
  const currents = files.map((file, i) => analyzeWindCurrent(contents[i] ?? '', file))

  const dirMap = new Map<string, WindCurrent[]>()
  for (const current of currents) {
    const dir = path.dirname(current.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(current) } else { dirMap.set(dir, [current]) }
  }

  const fields = Array.from(dirMap.entries()).map(([dir, dirCurrents]) =>
    analyzeWindField(dirCurrents, dir),
  )

  const avgLightness = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.breezeLightness, 0) / currents.length) : 0
  const avgDirection = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.currentDirection, 0) / currents.length) : 0
  const avgResilience = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.gustResilience, 0) / currents.length) : 0

  const overallFreshness = currents.length > 0
    ? Math.round((avgLightness + avgDirection + avgResilience) / 3) : 0
  const isBlowing = avgLightness >= 60

  const sky: SkySummary = { avgLightness, avgDirection, avgResilience, isBlowing, overallFreshness }

  const avgBreezeCarriage = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.breezeCarriage, 0) / currents.length) : 0
  const avgAtmosphereQuality = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.atmosphereQuality, 0) / currents.length) : 0

  const bestCurrent = currents.length > 0
    ? currents.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const lightest = currents.length > 0
    ? currents.reduce((best, c) => c.breezeLightness > best.breezeLightness ? c : best).file : ''
  const clearestDirection = currents.length > 0
    ? currents.reduce((best, c) => c.currentDirection > best.currentDirection ? c : best).file : ''
  const mostResilient = currents.length > 0
    ? currents.reduce((best, c) => c.gustResilience > best.gustResilience ? c : best).file : ''
  const bestCarrier = currents.length > 0
    ? currents.reduce((best, c) => c.breezeCarriage > best.breezeCarriage ? c : best).file : ''

  const stats: ZephyrWindStats = {
    totalFiles: currents.length,
    totalFields: fields.length,
    avgBreezeLightness: avgLightness,
    avgCurrentDirection: avgDirection,
    avgGustResilience: avgResilience,
    avgBreezeCarriage,
    avgAtmosphereQuality,
    gentleZephyrCount: currents.filter(c => c.condition === 'gentle-zephyr').length,
    properBreezeCount: currents.filter(c => c.condition === 'proper-breeze').length,
    fairWindCount: currents.filter(c => c.condition === 'fair-wind').length,
    stiffBreezeCount: currents.filter(c => c.condition === 'stiff-breeze').length,
    galeForceCount: currents.filter(c => c.condition === 'gale-force').length,
    deadCalmCount: currents.filter(c => c.condition === 'dead-calm').length,
    hasHighLightnessCount: currents.filter(c => c.lightening.hasHighLightness).length,
    hasHighDirectionCount: currents.filter(c => c.directing.hasHighDirection).length,
    hasHighResilienceCount: currents.filter(c => c.resisting.hasHighResilience).length,
    hasHighQualityCount: currents.filter(c => c.carrying.hasHighQuality).length,
    hasHighAtmosphereCount: currents.filter(c => c.surrounding.hasHighQuality).length,
    overallFreshness,
    pilotGrade: classifyPilotGrade(overallFreshness),
    bestCurrent, lightest, clearestDirection, mostResilient, bestCarrier,
  }

  const recommendations = generateRecommendations(currents, fields, sky, stats)

  return { currents, fields, sky, stats, recommendations }
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
