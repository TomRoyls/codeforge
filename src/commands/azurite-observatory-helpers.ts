// ─── Interfaces ──────────────────────────────────────────

export interface IlluminatingMeasure {
  clarity: number
  night: 'midnight-blue' | 'deep-sky' | 'proper-blue' | 'twilight-blue' | 'hazy-sky' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasObvious: boolean
  hasRevealed: boolean
  hasEvident: boolean
  hasManifest: boolean
  crypticCount: number
  mysteryCount: number
}

export interface CalculatingMeasure {
  precision: number
  orbit: 'perfect-ephemeris' | 'precise-calculation' | 'proper-measurement' | 'rough-estimate' | 'wild-guess' | 'no-precision'
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
  hasCalculated: boolean
  hasComputed: boolean
  hasCalibrated: boolean
  hasAstronomical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface PreservingMeasure {
  endurance: number
  pigment: 'eternal-blue' | 'lasting-azure' | 'proper-color' | 'fading-hue' | 'bleached-white' | 'no-endurance'
  hasHighEndurance: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasNoDeadCode: boolean
  hasPristine: boolean
  hasPreserved: boolean
  hasProtected: boolean
  hasUnfading: boolean
  hasPermanent: boolean
  hasTimeless: boolean
  hasEnduring: boolean
  hackCount: number
  workaroundCount: number
}

export interface WeatheringMeasure {
  resilience: number
  storm: 'clear-sky' | 'weatherproof' | 'proper-shelter' | 'wind-worn' | 'storm-damaged' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasTough: boolean
  hasWeatherproof: boolean
  hasStormproof: boolean
  hasImpervious: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  cosmos: 'celestial-sage' | 'star-scholar' | 'proper-astronomer' | 'sky-gazer' | 'ground-bound' | 'no-wisdom'
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
  hasCelestial: boolean
  hasWise: boolean
  hasTranscendent: boolean
  hackedCount: number
  shallowCount: number
}

export type AzuriteCondition =
  | 'azurite-masterpiece'
  | 'celestial-blue'
  | 'proper-azurite'
  | 'faded-blue'
  | 'white-stone'
  | 'void'

export interface AzuriteReading {
  file: string
  deepBlueClarity: number
  astronomicalPrecision: number
  mineralEndurance: number
  skyResilience: number
  cosmicWisdom: number
  illuminating: IlluminatingMeasure
  calculating: CalculatingMeasure
  preserving: PreservingMeasure
  weathering: WeatheringMeasure
  understanding: UnderstandingMeasure
  condition: AzuriteCondition
  qualityScore: number
}

export type DomeType =
  | 'grand-observatory'
  | 'blue-dome'
  | 'proper-tower'
  | 'stone-pillar'
  | 'empty-pedestal'
  | 'no-dome'

export type DomeCondition =
  | 'azurite-palace'
  | 'blue-tower'
  | 'proper-observatory'
  | 'stone-tower'
  | 'empty-roof'
  | 'void'

export type AstronomerGrade = 'master-astronomer' | 'observatory-director' | 'proper-observer' | 'amateur' | 'novice' | 'blind-folded'

export interface AzuriteDome {
  directory: string
  readings: AzuriteReading[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  azuriteMasterpieceCount: number
  voidCount: number
  domeType: DomeType
  condition: DomeCondition
}

export interface AzuriteObservatoryResult {
  readings: AzuriteReading[]
  domes: AzuriteDome[]
  sky: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isAzurite: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalDomes: number
    avgDeepBlueClarity: number
    avgAstronomicalPrecision: number
    avgMineralEndurance: number
    avgSkyResilience: number
    avgCosmicWisdom: number
    azuriteMasterpieceCount: number
    celestialBlueCount: number
    properAzuriteCount: number
    fadedBlueCount: number
    whiteStoneCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighEnduranceCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallDepth: number
    astronomerGrade: AstronomerGrade
    bestReading: string
    clearest: string
    mostPrecise: string
    mostEnduring: string
    mostResilient: string
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

/** @example classifyAzuriteCondition(90) */
export function classifyAzuriteCondition(score: number): AzuriteCondition {
  if (score >= 90) return 'azurite-masterpiece'
  if (score >= 75) return 'celestial-blue'
  if (score >= 60) return 'proper-azurite'
  if (score >= 40) return 'faded-blue'
  if (score >= 20) return 'white-stone'
  return 'void'
}

/** @example classifyDomeType(readings) */
export function classifyDomeType(readings: AzuriteReading[]): DomeType {
  if (readings.length === 0) return 'no-dome'
  const avg = readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length
  if (avg >= 85) return 'grand-observatory'
  if (avg >= 70) return 'blue-dome'
  if (avg >= 55) return 'proper-tower'
  if (avg >= 35) return 'stone-pillar'
  return 'empty-pedestal'
}

/** @example classifyDomeCondition(85) */
export function classifyDomeCondition(score: number): DomeCondition {
  if (score >= 85) return 'azurite-palace'
  if (score >= 70) return 'blue-tower'
  if (score >= 55) return 'proper-observatory'
  if (score >= 35) return 'stone-tower'
  if (score >= 15) return 'empty-roof'
  return 'void'
}

/** @example classifyAstronomerGrade(80) */
export function classifyAstronomerGrade(avgDepth: number): AstronomerGrade {
  if (avgDepth >= 80) return 'master-astronomer'
  if (avgDepth >= 65) return 'observatory-director'
  if (avgDepth >= 50) return 'proper-observer'
  if (avgDepth >= 35) return 'amateur'
  if (avgDepth >= 20) return 'novice'
  return 'blind-folded'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\b(async|await|Promise)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasObvious = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevealed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEvident = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasManifest = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let night: IlluminatingMeasure['night'] = 'no-clarity'
  if (clarity >= 90) night = 'midnight-blue'
  else if (clarity >= 75) night = 'deep-sky'
  else if (clarity >= 60) night = 'proper-blue'
  else if (clarity >= 40) night = 'twilight-blue'
  else if (clarity >= 20) night = 'hazy-sky'

  return {
    clarity, night, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
    crypticCount, mysteryCount,
  }
}

/** @example measureCalculating('export class X { readonly y: string }') */
export function measureCalculating(content: string): CalculatingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|imprecise|loose|sloppy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCalculated = /\b(async|await|Promise)\b/.test(content)
  const hasComputed = /\b(try|catch|if)\b/.test(content)
  const hasCalibrated = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasAstronomical = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasComputed, hasCalibrated, hasAstronomical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let orbit: CalculatingMeasure['orbit'] = 'no-precision'
  if (precision >= 90) orbit = 'perfect-ephemeris'
  else if (precision >= 75) orbit = 'precise-calculation'
  else if (precision >= 60) orbit = 'proper-measurement'
  else if (precision >= 40) orbit = 'rough-estimate'
  else if (precision >= 20) orbit = 'wild-guess'

  return {
    precision, orbit, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasComputed, hasCalibrated, hasAstronomical,
    unsafeCount, approximateCount,
  }
}

/** @example measurePreserving('export class X { readonly y: string }') */
export function measurePreserving(content: string): PreservingMeasure {
  const hasClean = /\b(class|interface|type)\b/.test(content)
  const hackCount = (content.match(/\b(hack|bypass|duct.tape)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|tempfix|quickfix)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = !/\b(TODO|FIXME|HACK|XXX)\b/.test(content)
  const hasNoCommentedOut = !/\/\/\s*(const|let|var|function|import|export)\s/.test(content)
  const hasNoDebugCode = !/\b(console\.log|debugger|console\.debug)\b/.test(content)
  const hasNoDeadCode = !/\b(unused|dead.code)\b/.test(content)
  const hasPristine = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPreserved = /\b(readonly|private|protected)\b/.test(content)
  const hasProtected = !/\bany\b/.test(content)
  const hasUnfading = /\b(import|export)\b/.test(content)
  const hasPermanent = /\b(async|await|Promise)\b/.test(content)
  const hasTimeless = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnduring = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasPreserved, hasProtected,
    hasUnfading, hasPermanent, hasTimeless, hasEnduring,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let pigment: PreservingMeasure['pigment'] = 'no-endurance'
  if (endurance >= 90) pigment = 'eternal-blue'
  else if (endurance >= 75) pigment = 'lasting-azure'
  else if (endurance >= 60) pigment = 'proper-color'
  else if (endurance >= 40) pigment = 'fading-hue'
  else if (endurance >= 20) pigment = 'bleached-white'

  return {
    endurance, pigment, hasHighEndurance,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasPreserved, hasProtected,
    hasUnfading, hasPermanent, hasTimeless, hasEnduring,
    hackCount, workaroundCount,
  }
}

/** @example measureWeathering('export class X { readonly y: string }') */
export function measureWeathering(content: string): WeatheringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(import|export)\b/.test(content)
  const hasDurable = !/\bany\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTough = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasWeatherproof = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasStormproof = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImpervious = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasHardened, hasEnduring,
    hasTough, hasWeatherproof, hasStormproof, hasImpervious,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let storm: WeatheringMeasure['storm'] = 'no-resilience'
  if (resilience >= 90) storm = 'clear-sky'
  else if (resilience >= 75) storm = 'weatherproof'
  else if (resilience >= 60) storm = 'proper-shelter'
  else if (resilience >= 40) storm = 'wind-worn'
  else if (resilience >= 20) storm = 'storm-damaged'

  return {
    resilience, storm, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasHardened, hasEnduring,
    hasTough, hasWeatherproof, hasStormproof, hasImpervious,
    unhandledCount, untestedCount,
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
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasCelestial = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasTranscendent = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCelestial, hasWise, hasTranscendent,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cosmos: UnderstandingMeasure['cosmos'] = 'no-wisdom'
  if (wisdom >= 90) cosmos = 'celestial-sage'
  else if (wisdom >= 75) cosmos = 'star-scholar'
  else if (wisdom >= 60) cosmos = 'proper-astronomer'
  else if (wisdom >= 40) cosmos = 'sky-gazer'
  else if (wisdom >= 20) cosmos = 'ground-bound'

  return {
    wisdom, cosmos, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCelestial, hasWise, hasTranscendent,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAzuriteReading(content, 'app.ts') */
export function analyzeAzuriteReading(content: string, filePath: string): AzuriteReading {
  const illuminating = measureIlluminating(content)
  const calculating = measureCalculating(content)
  const preserving = measurePreserving(content)
  const weathering = measureWeathering(content)
  const understanding = measureUnderstanding(content)

  const deepBlueClarity = illuminating.clarity
  const astronomicalPrecision = calculating.precision
  const mineralEndurance = preserving.endurance
  const skyResilience = weathering.resilience
  const cosmicWisdom = understanding.wisdom

  const qualityScore = Math.round(
    deepBlueClarity * 0.2 +
    astronomicalPrecision * 0.2 +
    mineralEndurance * 0.2 +
    skyResilience * 0.2 +
    cosmicWisdom * 0.2,
  )

  const condition = classifyAzuriteCondition(qualityScore)

  return {
    file: filePath,
    deepBlueClarity, astronomicalPrecision, mineralEndurance, skyResilience, cosmicWisdom,
    illuminating, calculating, preserving, weathering, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeAzuriteDome(readings, 'src') */
export function analyzeAzuriteDome(readings: AzuriteReading[], dirPath: string): AzuriteDome {
  if (readings.length === 0) {
    return {
      directory: dirPath, readings: [],
      avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      azuriteMasterpieceCount: 0, voidCount: 0,
      domeType: 'no-dome', condition: 'void',
    }
  }

  const avgClarity = Math.round(readings.reduce((s, r) => s + r.deepBlueClarity, 0) / readings.length)
  const avgPrecision = Math.round(readings.reduce((s, r) => s + r.astronomicalPrecision, 0) / readings.length)
  const avgWisdom = Math.round(readings.reduce((s, r) => s + r.cosmicWisdom, 0) / readings.length)
  const azuriteMasterpieceCount = readings.filter((r) => r.condition === 'azurite-masterpiece').length
  const voidCount = readings.filter((r) => r.condition === 'void').length
  const domeType = classifyDomeType(readings)
  const avgQuality = Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length)
  const condition = classifyDomeCondition(avgQuality)

  return {
    directory: dirPath, readings,
    avgClarity, avgPrecision, avgWisdom,
    azuriteMasterpieceCount, voidCount,
    domeType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAzuriteObservatoryResult(['a.ts'], [content]) */
export async function buildAzuriteObservatoryResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AzuriteObservatoryResult> {
  const readings: AzuriteReading[] = files.map((file, i) =>
    analyzeAzuriteReading(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AzuriteReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/')
      ? reading.file.substring(0, reading.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      dirMap.set(dir, [reading])
    }
  }

  const domes: AzuriteDome[] = Array.from(dirMap.entries()).map(([dir, dirReadings]) =>
    analyzeAzuriteDome(dirReadings, dir),
  )

  const avgDeepBlueClarity = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.deepBlueClarity, 0) / readings.length) : 0
  const avgAstronomicalPrecision = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.astronomicalPrecision, 0) / readings.length) : 0
  const avgMineralEndurance = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.mineralEndurance, 0) / readings.length) : 0
  const avgSkyResilience = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.skyResilience, 0) / readings.length) : 0
  const avgCosmicWisdom = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.cosmicWisdom, 0) / readings.length) : 0

  const overallDepth = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length) : 0
  const isAzurite = overallDepth >= 60

  const sky: AzuriteObservatoryResult['sky'] = {
    avgClarity: avgDeepBlueClarity, avgPrecision: avgAstronomicalPrecision, avgWisdom: avgCosmicWisdom,
    isAzurite, overallDepth,
  }

  const azuriteMasterpieceCount = readings.filter((r) => r.condition === 'azurite-masterpiece').length
  const celestialBlueCount = readings.filter((r) => r.condition === 'celestial-blue').length
  const properAzuriteCount = readings.filter((r) => r.condition === 'proper-azurite').length
  const fadedBlueCount = readings.filter((r) => r.condition === 'faded-blue').length
  const whiteStoneCount = readings.filter((r) => r.condition === 'white-stone').length
  const voidCount = readings.filter((r) => r.condition === 'void').length

  const hasHighClarityCount = readings.filter((r) => r.illuminating.hasHighClarity).length
  const hasHighPrecisionCount = readings.filter((r) => r.calculating.hasHighPrecision).length
  const hasHighEnduranceCount = readings.filter((r) => r.preserving.hasHighEndurance).length
  const hasHighResilienceCount = readings.filter((r) => r.weathering.hasHighResilience).length
  const hasHighWisdomCount = readings.filter((r) => r.understanding.hasHighWisdom).length

  const astronomerGrade = classifyAstronomerGrade(overallDepth)

  const bestReading = readings.length > 0
    ? readings.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file : ''
  const clearest = readings.length > 0
    ? readings.reduce((best, r) => (r.deepBlueClarity > best.deepBlueClarity ? r : best)).file : ''
  const mostPrecise = readings.length > 0
    ? readings.reduce((best, r) => (r.astronomicalPrecision > best.astronomicalPrecision ? r : best)).file : ''
  const mostEnduring = readings.length > 0
    ? readings.reduce((best, r) => (r.mineralEndurance > best.mineralEndurance ? r : best)).file : ''
  const mostResilient = readings.length > 0
    ? readings.reduce((best, r) => (r.skyResilience > best.skyResilience ? r : best)).file : ''
  const wisest = readings.length > 0
    ? readings.reduce((best, r) => (r.cosmicWisdom > best.cosmicWisdom ? r : best)).file : ''

  const stats: AzuriteObservatoryResult['stats'] = {
    totalFiles: files.length, totalDomes: domes.length,
    avgDeepBlueClarity, avgAstronomicalPrecision, avgMineralEndurance, avgSkyResilience, avgCosmicWisdom,
    azuriteMasterpieceCount, celestialBlueCount, properAzuriteCount, fadedBlueCount, whiteStoneCount, voidCount,
    hasHighClarityCount, hasHighPrecisionCount, hasHighEnduranceCount, hasHighResilienceCount, hasHighWisdomCount,
    overallDepth, astronomerGrade,
    bestReading, clearest, mostPrecise, mostEnduring, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(readings, domes, sky, stats)

  return {
    readings, domes, sky, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(readings, domes, sky, stats) */
export function generateRecommendations(
  readings: AzuriteReading[],
  domes: AzuriteDome[],
  sky: AzuriteObservatoryResult['sky'],
  stats: AzuriteObservatoryResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgDeepBlueClarity >= 90 &&
    stats.avgAstronomicalPrecision >= 90 &&
    stats.avgMineralEndurance >= 90 &&
    stats.avgSkyResilience >= 90 &&
    stats.avgCosmicWisdom >= 90
  ) {
    recs.push(
      'Your azurite observatory is an azurite masterpiece! Deep-blue clarity is midnight-blue, astronomical precision is perfect-ephemeris, mineral endurance is eternal-blue, sky resilience is clear-sky, and cosmic wisdom is celestial-sage!',
    )
    return recs
  }

  if (stats.avgDeepBlueClarity < 60) {
    recs.push(
      'Deepen blue clarity — the observatory must achieve midnight-blue transparency; improve readability, eliminate cryptic patterns, and achieve midnight-blue clarity',
    )
  }

  if (stats.avgAstronomicalPrecision < 60) {
    recs.push(
      'Sharpen astronomical precision — calculations must be perfect-ephemeris; tighten types, eliminate unsafe patterns, and achieve perfect-ephemeris precision',
    )
  }

  if (stats.avgMineralEndurance < 60) {
    recs.push(
      'Strengthen mineral endurance — the pigment must be eternal-blue; remove hacks and workarounds, and achieve eternal-blue endurance',
    )
  }

  if (stats.avgSkyResilience < 60) {
    recs.push(
      'Harden sky resilience — the observatory must withstand clear-sky conditions; add error handling, test thoroughly, and achieve clear-sky resilience',
    )
  }

  if (stats.avgCosmicWisdom < 60) {
    recs.push(
      'Deepen cosmic wisdom — the astronomer must become celestial-sage; build with principled architecture and achieve celestial-sage wisdom',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The observatory has crumbled — white stones and faded blues outnumber the azurite masterpieces, and the sky lies dark',
    )
  }

  const voidReadings = readings.filter((r) => r.condition === 'void')
  if (voidReadings.length > 0 && voidReadings.length <= 5) {
    recs.push(`Remove these white stones from the observatory: ${voidReadings.map((r) => r.file).join(', ')}`)
  } else if (voidReadings.length > 5) {
    recs.push(`Remove ${voidReadings.length} white stones from the observatory before they crack the foundation`)
  }

  const poorDomes = domes.filter((d) => d.condition === 'void' || d.condition === 'empty-roof')
  if (poorDomes.length === domes.length && domes.length > 0) {
    recs.push('All domes are empty roofs — the azurite observatory needs azurite-palace quality readings throughout')
  }

  if (recs.length === 0) {
    recs.push('Your azurite observatory shines with deep-blue clarity — every reading carries midnight clarity, astronomical precision, mineral endurance, sky resilience, and cosmic wisdom')
  }

  return recs
}
