// ─── Interfaces ──────────────────────────────────────────

export interface FlowingMeasure {
  wave: number
  surf: 'tidal-bore' | 'strong-swell' | 'proper-wave' | 'gentle-ripple' | 'still-water' | 'no-wave'
  hasHighWave: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasFlowing: boolean
  hasNoBlocked: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasOrganic: boolean
  hasNatural: boolean
  hasFluid: boolean
  hasMoving: boolean
  hasPulsing: boolean
  hasSurging: boolean
  hasUndulating: boolean
  hasRhythmic: boolean
  staticCount: number
  deadCount: number
}

export interface PulsingMeasure {
  rhythm: number
  beat: 'perfect-tide' | 'steady-pulse' | 'proper-rhythm' | 'irregular-beat' | 'no-pulse' | 'no-rhythm'
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasPredictable: boolean
  hasRegular: boolean
  hasDependable: boolean
  hasUniform: boolean
  hasSteady: boolean
  hasConstant: boolean
  hasEven: boolean
  hasBalanced: boolean
  erraticCount: number
  untestedCount: number
}

export interface CleansingMeasure {
  purity: number
  water: 'crystal-clear' | 'tropical-blue' | 'proper-clarity' | 'murky-depth' | 'polluted-bay' | 'no-purity'
  hasHighPurity: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasPristine: boolean
  hasUnpolluted: boolean
  hasSpotless: boolean
  hasImmaculate: boolean
  hasPure: boolean
  hasUncontaminated: boolean
  hasUnblemished: boolean
  hasFresh: boolean
  hasClear: boolean
  hackCount: number
  workaroundCount: number
}

export interface MeetingMeasure {
  precision: number
  shoreline: 'geometric-coast' | 'smooth-beach' | 'proper-shore' | 'jagged-cliff' | 'marshy-delta' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasClean: boolean
  hasCorrect: boolean
  hasBoundaried: boolean
  hasDistinct: boolean
  hasClear: boolean
  hasDemarcated: boolean
  unsafeCount: number
  approximateCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  moon: 'tidal-master' | 'experienced-mariner' | 'proper-sailor' | 'land-lubber' | 'lost-swimmer' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasCyclical: boolean
  hasWise: boolean
  hasSeasoned: boolean
  hackedCount: number
  shallowCount: number
}

export type SwellCondition =
  | 'emerald-masterpiece'
  | 'tidal-gem'
  | 'proper-wave'
  | 'murky-water'
  | 'dry-sand'
  | 'void'

export interface EmeraldSwell {
  file: string
  greenWave: number
  tidalRhythm: number
  oceanPurity: number
  coastalPrecision: number
  tideWisdom: number
  flowing: FlowingMeasure
  pulsing: PulsingMeasure
  cleansing: CleansingMeasure
  meeting: MeetingMeasure
  understanding: UnderstandingMeasure
  condition: SwellCondition
  qualityScore: number
}

export type BayType =
  | 'emerald-bay'
  | 'green-harbor'
  | 'proper-cove'
  | 'rocky-shore'
  | 'dry-beach'
  | 'no-bay'

export type BayCondition =
  | 'ocean-palace'
  | 'tidal-pool'
  | 'proper-harbor'
  | 'muddy-bank'
  | 'empty-shore'
  | 'void'

export interface EmeraldBay {
  directory: string
  swells: EmeraldSwell[]
  avgWave: number
  avgPrecision: number
  avgWisdom: number
  emeraldMasterpieceCount: number
  voidCount: number
  bayType: BayType
  condition: BayCondition
}

export type NavigatorGrade = 'tidal-master' | 'experienced-captain' | 'proper-sailor' | 'apprentice' | 'novice' | 'beachcomber'

export interface EmeraldTideResult {
  swells: EmeraldSwell[]
  bays: EmeraldBay[]
  ocean: {
    avgWave: number
    avgPrecision: number
    avgWisdom: number
    isEmerald: boolean
    overallFlow: number
  }
  stats: {
    totalFiles: number
    totalBays: number
    avgGreenWave: number
    avgTidalRhythm: number
    avgOceanPurity: number
    avgCoastalPrecision: number
    avgTideWisdom: number
    emeraldMasterpieceCount: number
    tidalGemCount: number
    properWaveCount: number
    murkyWaterCount: number
    drySandCount: number
    voidCount: number
    hasHighWaveCount: number
    hasHighRhythmCount: number
    hasHighPurityCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallFlow: number
    navigatorGrade: NavigatorGrade
    bestSwell: string
    mostFlowing: string
    mostRhythmic: string
    purest: string
    mostPrecise: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifySwellCondition(90) */
export function classifySwellCondition(score: number): SwellCondition {
  if (score >= 90) return 'emerald-masterpiece'
  if (score >= 75) return 'tidal-gem'
  if (score >= 60) return 'proper-wave'
  if (score >= 40) return 'murky-water'
  if (score >= 20) return 'dry-sand'
  return 'void'
}

/** @example classifyBayType(swells) */
export function classifyBayType(swells: EmeraldSwell[]): BayType {
  if (swells.length === 0) return 'no-bay'
  const avg = swells.reduce((s, sw) => s + sw.qualityScore, 0) / swells.length
  if (avg >= 85) return 'emerald-bay'
  if (avg >= 70) return 'green-harbor'
  if (avg >= 55) return 'proper-cove'
  if (avg >= 35) return 'rocky-shore'
  return 'dry-beach'
}

/** @example classifyBayCondition(85) */
export function classifyBayCondition(score: number): BayCondition {
  if (score >= 85) return 'ocean-palace'
  if (score >= 70) return 'tidal-pool'
  if (score >= 55) return 'proper-harbor'
  if (score >= 35) return 'muddy-bank'
  if (score >= 15) return 'empty-shore'
  return 'void'
}

/** @example classifyNavigatorGrade(80) */
export function classifyNavigatorGrade(avgFlow: number): NavigatorGrade {
  if (avgFlow >= 80) return 'tidal-master'
  if (avgFlow >= 65) return 'experienced-captain'
  if (avgFlow >= 50) return 'proper-sailor'
  if (avgFlow >= 35) return 'apprentice'
  if (avgFlow >= 20) return 'novice'
  return 'beachcomber'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureFlowing('export class X { readonly y: string }') */
export function measureFlowing(content: string): FlowingMeasure {
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const staticCount = (content.match(/\b(hardcoded|magic-number|literal|rigid|inflexible)\b/gi) ?? []).length
  const hasNoStatic = staticCount === 0
  const hasFlowing = /\b(function|=>|return)\b/.test(content)
  const hasNoBlocked = (content.match(/\b(bottleneck|blocked|stuck|frozen)\b/gi) ?? []).length === 0
  const hasAlive = /\b(class|interface|type)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|obsolete|deprecated)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasOrganic = /\b(import|export)\b/.test(content)
  const hasNatural = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasFluid = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasMoving = /\b(readonly|private|protected)\b/.test(content)
  const hasPulsing = /\b(try|catch|if)\b/.test(content)
  const hasSurging = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUndulating = !/\bany\b/.test(content)
  const hasRhythmic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasDynamic, hasNoStatic, hasFlowing, hasNoBlocked, hasAlive,
    hasNoDead, hasOrganic, hasNatural, hasFluid, hasMoving,
    hasPulsing, hasSurging, hasUndulating, hasRhythmic,
  ]

  const wave = computeScore(positiveBooleans)
  const hasHighWave = wave >= 60

  let surf: FlowingMeasure['surf'] = 'no-wave'
  if (wave >= 90) surf = 'tidal-bore'
  else if (wave >= 75) surf = 'strong-swell'
  else if (wave >= 60) surf = 'proper-wave'
  else if (wave >= 40) surf = 'gentle-ripple'
  else if (wave >= 20) surf = 'still-water'

  return {
    wave, surf, hasHighWave,
    hasDynamic, hasNoStatic, hasFlowing, hasNoBlocked, hasAlive,
    hasNoDead, hasOrganic, hasNatural, hasFluid, hasMoving,
    hasPulsing, hasSurging, hasUndulating, hasRhythmic,
    staticCount, deadCount,
  }
}

/** @example measurePulsing('export class X { readonly y: string }') */
export function measurePulsing(content: string): PulsingMeasure {
  const hasConsistent = /\b(import|export)\b/.test(content)
  const erraticCount = (content.match(/\b(erratic|random|arbitrary|inconsistent|flaky)\b/gi) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasReliable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoFlaky = (content.match(/\b(flimsy|fragile|brittle)\b/gi) ?? []).length === 0
  const hasTested = /\b(if|return)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPredictable = /\b(class|interface|type)\b/.test(content)
  const hasRegular = /\b(readonly|private|protected)\b/.test(content)
  const hasDependable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUniform = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSteady = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasConstant = !/\bany\b/.test(content)
  const hasEven = /\b(function|=>|return)\b/.test(content)
  const hasBalanced = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasConsistent, hasNoErratic, hasReliable, hasNoFlaky, hasTested,
    hasNoUntested, hasStable, hasPredictable, hasRegular, hasDependable,
    hasUniform, hasSteady, hasConstant, hasEven, hasBalanced,
  ]

  const rhythm = computeScore(positiveBooleans)
  const hasHighRhythm = rhythm >= 60

  let beat: PulsingMeasure['beat'] = 'no-rhythm'
  if (rhythm >= 90) beat = 'perfect-tide'
  else if (rhythm >= 75) beat = 'steady-pulse'
  else if (rhythm >= 60) beat = 'proper-rhythm'
  else if (rhythm >= 40) beat = 'irregular-beat'
  else if (rhythm >= 20) beat = 'no-pulse'

  return {
    rhythm, beat, hasHighRhythm,
    hasConsistent, hasNoErratic, hasReliable, hasNoFlaky, hasTested,
    hasNoUntested, hasStable, hasPredictable, hasRegular, hasDependable,
    hasUniform, hasSteady, hasConstant, hasEven, hasBalanced,
    erraticCount, untestedCount,
  }
}

/** @example measureCleansing('export class X { readonly y: string }') */
export function measureCleansing(content: string): CleansingMeasure {
  const hackCount = (content.match(/\b(hack|hacky| hacked)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|quickfix|band-aid|bandaid)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/.*\bconsole\.(log|debug|warn|error)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(debugger|console\.(log|debug|trace))\b/g) ?? []).length === 0
  const hasClean = !/\bany\b/.test(content)
  const hasPristine = /\b(class|interface|type)\b/.test(content)
  const hasUnpolluted = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasSpotless = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImmaculate = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPure = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUncontaminated = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasUnblemished = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasFresh = /\b(import|export)\b/.test(content)
  const hasClear = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasClean, hasPristine, hasUnpolluted, hasSpotless, hasImmaculate,
    hasPure, hasUncontaminated, hasUnblemished, hasFresh, hasClear,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let water: CleansingMeasure['water'] = 'no-purity'
  if (purity >= 90) water = 'crystal-clear'
  else if (purity >= 75) water = 'tropical-blue'
  else if (purity >= 60) water = 'proper-clarity'
  else if (purity >= 40) water = 'murky-depth'
  else if (purity >= 20) water = 'polluted-bay'

  return {
    purity, water, hasHighPurity,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasPristine, hasUnpolluted, hasSpotless, hasImmaculate,
    hasPure, hasUncontaminated, hasUnblemished, hasFresh, hasClear,
    hackCount, workaroundCount,
  }
}

/** @example measureMeeting('export class X { readonly y: string }') */
export function measureMeeting(content: string): MeetingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasBoundaried = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDistinct = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasClear = /\b(async|await|Promise)\b/.test(content)
  const hasDemarcated = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasBoundaried, hasDistinct, hasClear, hasDemarcated,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let shoreline: MeetingMeasure['shoreline'] = 'no-precision'
  if (precision >= 90) shoreline = 'geometric-coast'
  else if (precision >= 75) shoreline = 'smooth-beach'
  else if (precision >= 60) shoreline = 'proper-shore'
  else if (precision >= 40) shoreline = 'jagged-cliff'
  else if (precision >= 20) shoreline = 'marshy-delta'

  return {
    precision, shoreline, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasBoundaried, hasDistinct, hasClear, hasDemarcated,
    unsafeCount, approximateCount,
  }
}

/** @example measureUnderstanding('export class X { readonly y: string }') */
export function measureUnderstanding(content: string): UnderstandingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHolistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasCyclical = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasSeasoned = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCyclical, hasWise, hasSeasoned,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let moon: UnderstandingMeasure['moon'] = 'no-wisdom'
  if (wisdom >= 90) moon = 'tidal-master'
  else if (wisdom >= 75) moon = 'experienced-mariner'
  else if (wisdom >= 60) moon = 'proper-sailor'
  else if (wisdom >= 40) moon = 'land-lubber'
  else if (wisdom >= 20) moon = 'lost-swimmer'

  return {
    wisdom, moon, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCyclical, hasWise, hasSeasoned,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeEmeraldSwell(content, 'app.ts') */
export function analyzeEmeraldSwell(content: string, filePath: string): EmeraldSwell {
  const flowing = measureFlowing(content)
  const pulsing = measurePulsing(content)
  const cleansing = measureCleansing(content)
  const meeting = measureMeeting(content)
  const understanding = measureUnderstanding(content)

  const greenWave = flowing.wave
  const tidalRhythm = pulsing.rhythm
  const oceanPurity = cleansing.purity
  const coastalPrecision = meeting.precision
  const tideWisdom = understanding.wisdom

  const qualityScore = Math.round(
    greenWave * 0.2 +
    tidalRhythm * 0.2 +
    oceanPurity * 0.2 +
    coastalPrecision * 0.2 +
    tideWisdom * 0.2,
  )

  const condition = classifySwellCondition(qualityScore)

  return {
    file: filePath,
    greenWave, tidalRhythm, oceanPurity, coastalPrecision, tideWisdom,
    flowing, pulsing, cleansing, meeting, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeEmeraldBay(swells, 'src') */
export function analyzeEmeraldBay(swells: EmeraldSwell[], dirPath: string): EmeraldBay {
  if (swells.length === 0) {
    return {
      directory: dirPath, swells: [],
      avgWave: 0, avgPrecision: 0, avgWisdom: 0,
      emeraldMasterpieceCount: 0, voidCount: 0,
      bayType: 'no-bay', condition: 'void',
    }
  }

  const avgWave = Math.round(swells.reduce((s, sw) => s + sw.greenWave, 0) / swells.length)
  const avgPrecision = Math.round(swells.reduce((s, sw) => s + sw.coastalPrecision, 0) / swells.length)
  const avgWisdom = Math.round(swells.reduce((s, sw) => s + sw.tideWisdom, 0) / swells.length)
  const emeraldMasterpieceCount = swells.filter((sw) => sw.condition === 'emerald-masterpiece').length
  const voidCount = swells.filter((sw) => sw.condition === 'void').length
  const bayType = classifyBayType(swells)
  const avgQuality = Math.round(swells.reduce((s, sw) => s + sw.qualityScore, 0) / swells.length)
  const condition = classifyBayCondition(avgQuality)

  return {
    directory: dirPath, swells,
    avgWave, avgPrecision, avgWisdom,
    emeraldMasterpieceCount, voidCount,
    bayType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldTideResult(['a.ts'], [content]) */
export async function buildEmeraldTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldTideResult> {
  const swells: EmeraldSwell[] = files.map((file, i) =>
    analyzeEmeraldSwell(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, EmeraldSwell[]>()
  for (const swell of swells) {
    const dir = swell.file.includes('/')
      ? swell.file.substring(0, swell.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(swell)
    } else {
      dirMap.set(dir, [swell])
    }
  }

  const bays: EmeraldBay[] = Array.from(dirMap.entries()).map(([dir, dirSwells]) =>
    analyzeEmeraldBay(dirSwells, dir),
  )

  const avgGreenWave = swells.length > 0
    ? Math.round(swells.reduce((s, sw) => s + sw.greenWave, 0) / swells.length) : 0
  const avgTidalRhythm = swells.length > 0
    ? Math.round(swells.reduce((s, sw) => s + sw.tidalRhythm, 0) / swells.length) : 0
  const avgOceanPurity = swells.length > 0
    ? Math.round(swells.reduce((s, sw) => s + sw.oceanPurity, 0) / swells.length) : 0
  const avgCoastalPrecision = swells.length > 0
    ? Math.round(swells.reduce((s, sw) => s + sw.coastalPrecision, 0) / swells.length) : 0
  const avgTideWisdom = swells.length > 0
    ? Math.round(swells.reduce((s, sw) => s + sw.tideWisdom, 0) / swells.length) : 0

  const overallFlow = swells.length > 0
    ? Math.round(swells.reduce((s, sw) => s + sw.qualityScore, 0) / swells.length) : 0
  const isEmerald = overallFlow >= 60

  const ocean: EmeraldTideResult['ocean'] = {
    avgWave: avgGreenWave, avgPrecision: avgCoastalPrecision, avgWisdom: avgTideWisdom,
    isEmerald, overallFlow,
  }

  const emeraldMasterpieceCount = swells.filter((sw) => sw.condition === 'emerald-masterpiece').length
  const tidalGemCount = swells.filter((sw) => sw.condition === 'tidal-gem').length
  const properWaveCount = swells.filter((sw) => sw.condition === 'proper-wave').length
  const murkyWaterCount = swells.filter((sw) => sw.condition === 'murky-water').length
  const drySandCount = swells.filter((sw) => sw.condition === 'dry-sand').length
  const voidCount = swells.filter((sw) => sw.condition === 'void').length

  const hasHighWaveCount = swells.filter((sw) => sw.flowing.hasHighWave).length
  const hasHighRhythmCount = swells.filter((sw) => sw.pulsing.hasHighRhythm).length
  const hasHighPurityCount = swells.filter((sw) => sw.cleansing.hasHighPurity).length
  const hasHighPrecisionCount = swells.filter((sw) => sw.meeting.hasHighPrecision).length
  const hasHighWisdomCount = swells.filter((sw) => sw.understanding.hasHighWisdom).length

  const navigatorGrade = classifyNavigatorGrade(overallFlow)

  const bestSwell = swells.length > 0
    ? swells.reduce((best, sw) => (sw.qualityScore > best.qualityScore ? sw : best)).file : ''
  const mostFlowing = swells.length > 0
    ? swells.reduce((best, sw) => (sw.greenWave > best.greenWave ? sw : best)).file : ''
  const mostRhythmic = swells.length > 0
    ? swells.reduce((best, sw) => (sw.tidalRhythm > best.tidalRhythm ? sw : best)).file : ''
  const purest = swells.length > 0
    ? swells.reduce((best, sw) => (sw.oceanPurity > best.oceanPurity ? sw : best)).file : ''
  const mostPrecise = swells.length > 0
    ? swells.reduce((best, sw) => (sw.coastalPrecision > best.coastalPrecision ? sw : best)).file : ''
  const wisest = swells.length > 0
    ? swells.reduce((best, sw) => (sw.tideWisdom > best.tideWisdom ? sw : best)).file : ''

  const stats: EmeraldTideResult['stats'] = {
    totalFiles: files.length, totalBays: bays.length,
    avgGreenWave, avgTidalRhythm, avgOceanPurity, avgCoastalPrecision, avgTideWisdom,
    emeraldMasterpieceCount, tidalGemCount, properWaveCount, murkyWaterCount, drySandCount, voidCount,
    hasHighWaveCount, hasHighRhythmCount, hasHighPurityCount, hasHighPrecisionCount, hasHighWisdomCount,
    overallFlow, navigatorGrade,
    bestSwell, mostFlowing, mostRhythmic, purest, mostPrecise, wisest,
  }

  const recommendations = generateRecommendations(swells, bays, ocean, stats)

  return {
    swells, bays, ocean, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(swells, bays, ocean, stats) */
export function generateRecommendations(
  swells: EmeraldSwell[],
  bays: EmeraldBay[],
  ocean: EmeraldTideResult['ocean'],
  stats: EmeraldTideResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGreenWave >= 90 &&
    stats.avgTidalRhythm >= 90 &&
    stats.avgOceanPurity >= 90 &&
    stats.avgCoastalPrecision >= 90 &&
    stats.avgTideWisdom >= 90
  ) {
    recs.push(
      'Your emerald tide flows with perfect rhythm! Green waves are tidal-bore, rhythms are perfect-tide, ocean purity is crystal-clear, coastal precision is geometric-coast, and tide wisdom comes from the tidal-master!',
    )
    return recs
  }

  if (stats.avgGreenWave < 60) {
    recs.push(
      'Strengthen the green wave — the tide must flow with dynamic energy; add async patterns, eliminate static code, and keep the water moving'
    )
  }

  if (stats.avgTidalRhythm < 60) {
    recs.push(
      'Steady the tidal rhythm — the pulse must be reliable; reduce erratic patterns, add consistent types, and establish a dependable beat'
    )
  }

  if (stats.avgOceanPurity < 60) {
    recs.push(
      'Purify the ocean waters — the tide must run clean; remove hacks, eliminate workarounds, and keep the water crystal-clear'
    )
  }

  if (stats.avgCoastalPrecision < 60) {
    recs.push(
      'Sharpen coastal precision — where land meets sea, every boundary must be exact; tighten types, eliminate approximations, and define clear shorelines'
    )
  }

  if (stats.avgTideWisdom < 60) {
    recs.push(
      'Deepen tide wisdom — the wisest mariners understand the cycles; build with principled architecture, proven patterns, and cyclical design'
    )
  }

  if (stats.overallFlow < 40) {
    recs.push(
      'The tide is retreating — murky water and dry sand outnumber the emerald waves, and the ocean floor is exposed'
    )
  }

  const voidSwells = swells.filter((sw) => sw.condition === 'void')
  if (voidSwells.length > 0 && voidSwells.length <= 5) {
    recs.push(`Refill these dry tide pools: ${voidSwells.map((sw) => sw.file).join(', ')}`)
  } else if (voidSwells.length > 5) {
    recs.push(`Refill ${voidSwells.length} dry tide pools before the ocean recedes entirely`)
  }

  const poorBays = bays.filter((b) => b.condition === 'void' || b.condition === 'empty-shore')
  if (poorBays.length === bays.length && bays.length > 0) {
    recs.push('All bays are empty shores — the emerald tide needs ocean-palace quality swells throughout')
  }

  if (recs.length === 0) {
    recs.push('Your emerald tide flows strong — every swell carries green waves, tidal rhythms, ocean purity, coastal precision, and tide wisdom')
  }

  return recs
}
