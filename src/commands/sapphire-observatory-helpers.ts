// ─── Interfaces ──────────────────────────────────────────

export interface ObservingMeasure {
  clarity: number
  sky: 'crystal-night' | 'clear-horizon' | 'proper-twilight' | 'cloudy-sky' | 'overcast' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasIlluminated: boolean
  hasFresh: boolean
  hasClean: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface FocusingMeasure {
  precision: number
  lens: 'hubble-grade' | 'research-telescope' | 'proper-optics' | 'reading-glasses' | 'blurred-glass' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasUnambiguous: boolean
  hasFocused: boolean
  hasTargeted: boolean
  hasCalibrated: boolean
  unsafeCount: number
  approximateCount: number
}

export interface ConnectingMeasure {
  pattern: number
  map: 'grand-constellation' | 'star-chain' | 'proper-pattern' | 'scattered-stars' | 'random-dots' | 'no-pattern'
  hasHighPattern: boolean
  hasWellStructured: boolean
  hasNoSpaghetti: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasConnected: boolean
  hasCoherent: boolean
  hasOrganized: boolean
  hasLinked: boolean
  hasNetworked: boolean
  hasHarmonious: boolean
  hasIntegrated: boolean
  hasUnified: boolean
  hasSystematic: boolean
  hasOrchestrated: boolean
  hasAligned: boolean
  spaghettiCount: number
  monolithicCount: number
}

export interface ProbingMeasure {
  depth: number
  cloud: 'deep-nebula' | 'stellar-nursery' | 'proper-depth' | 'shallow-pool' | 'surface-only' | 'no-depth'
  hasHighDepth: boolean
  hasDeepLogic: boolean
  hasNoShallow: boolean
  hasProfound: boolean
  hasNoTrivial: boolean
  hasComplex: boolean
  hasNoSimplistic: boolean
  hasNuanced: boolean
  hasLayered: boolean
  hasMultiDimensional: boolean
  hasRich: boolean
  hasSubstantive: boolean
  hasComprehensive: boolean
  hasThorough: boolean
  hasInDepth: boolean
  hasExhaustive: boolean
  shallowCount: number
  trivialCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  cosmos: 'cosmic-sage' | 'star-scholar' | 'proper-astronomer' | 'sky-watcher' | 'lost-traveler' | 'no-wisdom'
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
  hasFarSighted: boolean
  hasWise: boolean
  hasExperienced: boolean
  hackedCount: number
  shallowCount: number
}

export type ReadingCondition =
  | 'sapphire-masterpiece'
  | 'celestial-gem'
  | 'proper-sapphire'
  | 'blue-glass'
  | 'cloudy-quartz'
  | 'void'

export interface SapphireReading {
  file: string
  celestialClarity: number
  telescopePrecision: number
  constellationPattern: number
  nebulaDepth: number
  cosmicWisdom: number
  observing: ObservingMeasure
  focusing: FocusingMeasure
  connecting: ConnectingMeasure
  probing: ProbingMeasure
  understanding: UnderstandingMeasure
  condition: ReadingCondition
  qualityScore: number
}

export type DomeType =
  | 'grand-observatory'
  | 'research-dome'
  | 'proper-tower'
  | 'backyard-scope'
  | 'dark-room'
  | 'no-dome'

export type DomeCondition =
  | 'sapphire-palace'
  | 'gem-tower'
  | 'proper-observatory'
  | 'stone-tower'
  | 'wooden-shack'
  | 'void'

export interface SapphireDome {
  directory: string
  readings: SapphireReading[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  sapphireMasterpieceCount: number
  voidCount: number
  domeType: DomeType
  condition: DomeCondition
}

export type AstronomerGrade = 'master-astronomer' | 'research-scientist' | 'proper-observer' | 'apprentice' | 'novice' | 'stargazer'

export interface SapphireObservatoryResult {
  readings: SapphireReading[]
  domes: SapphireDome[]
  cosmos: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isSapphire: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalDomes: number
    avgCelestialClarity: number
    avgTelescopePrecision: number
    avgConstellationPattern: number
    avgNebulaDepth: number
    avgCosmicWisdom: number
    sapphireMasterpieceCount: number
    celestialGemCount: number
    properSapphireCount: number
    blueGlassCount: number
    cloudyQuartzCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighPatternCount: number
    hasHighDepthCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    astronomerGrade: AstronomerGrade
    bestReading: string
    clearest: string
    mostPrecise: string
    mostConnected: string
    deepest: string
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

/** @example classifyReadingCondition(90) */
export function classifyReadingCondition(score: number): ReadingCondition {
  if (score >= 90) return 'sapphire-masterpiece'
  if (score >= 75) return 'celestial-gem'
  if (score >= 60) return 'proper-sapphire'
  if (score >= 40) return 'blue-glass'
  if (score >= 20) return 'cloudy-quartz'
  return 'void'
}

/** @example classifyDomeType(readings) */
export function classifyDomeType(readings: SapphireReading[]): DomeType {
  if (readings.length === 0) return 'no-dome'
  const avg = readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length
  if (avg >= 85) return 'grand-observatory'
  if (avg >= 70) return 'research-dome'
  if (avg >= 55) return 'proper-tower'
  if (avg >= 35) return 'backyard-scope'
  return 'dark-room'
}

/** @example classifyDomeCondition(85) */
export function classifyDomeCondition(score: number): DomeCondition {
  if (score >= 85) return 'sapphire-palace'
  if (score >= 70) return 'gem-tower'
  if (score >= 55) return 'proper-observatory'
  if (score >= 35) return 'stone-tower'
  if (score >= 15) return 'wooden-shack'
  return 'void'
}

/** @example classifyAstronomerGrade(80) */
export function classifyAstronomerGrade(avgLuminosity: number): AstronomerGrade {
  if (avgLuminosity >= 80) return 'master-astronomer'
  if (avgLuminosity >= 65) return 'research-scientist'
  if (avgLuminosity >= 50) return 'proper-observer'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'stargazer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureObserving('class X { readonly y: string }') */
export function measureObserving(content: string): ObservingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(import|export)\b/.test(content)
  const hasNoMystery = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|encrypted|scrambled)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnderstandable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisible = /\b(function|=>|return)\b/.test(content)
  const hasDirect = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasOpen = !/\bany\b/.test(content)
  const hasRevealed = /\b(async|await|Promise)\b/.test(content)
  const hasIlluminated = /\b(try|catch|if)\b/.test(content)
  const hasFresh = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasIlluminated, hasFresh, hasClean,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let sky: ObservingMeasure['sky'] = 'no-clarity'
  if (clarity >= 90) sky = 'crystal-night'
  else if (clarity >= 75) sky = 'clear-horizon'
  else if (clarity >= 60) sky = 'proper-twilight'
  else if (clarity >= 40) sky = 'cloudy-sky'
  else if (clarity >= 20) sky = 'overcast'

  return {
    clarity, sky, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasIlluminated, hasFresh, hasClean,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureFocusing('export class X { readonly y: string }') */
export function measureFocusing(content: string): FocusingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(unsafe|risky|hazardous)\b/gi) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasCorrect = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasUnambiguous = /\b(try|catch|if)\b/.test(content)
  const hasFocused = /\b(async|await|Promise)\b/.test(content)
  const hasTargeted = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCalibrated = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasSharp, hasCrisp,
    hasDefined, hasUnambiguous, hasFocused, hasTargeted, hasCalibrated,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let lens: FocusingMeasure['lens'] = 'no-precision'
  if (precision >= 90) lens = 'hubble-grade'
  else if (precision >= 75) lens = 'research-telescope'
  else if (precision >= 60) lens = 'proper-optics'
  else if (precision >= 40) lens = 'reading-glasses'
  else if (precision >= 20) lens = 'blurred-glass'

  return {
    precision, lens, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasSharp, hasCrisp,
    hasDefined, hasUnambiguous, hasFocused, hasTargeted, hasCalibrated,
    unsafeCount, approximateCount,
  }
}

/** @example measureConnecting('export class X { readonly y: string }') */
export function measureConnecting(content: string): ConnectingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|callback\.hell|pyramid|deeply\.nested)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasCoherent = /\b(readonly|private|protected)\b/.test(content)
  const hasOrganized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasLinked = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNetworked = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasIntegrated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnified = !/\bany\b/.test(content)
  const hasSystematic = /\b(try|catch|if)\b/.test(content)
  const hasOrchestrated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasAligned = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasConnected,
    hasCoherent, hasOrganized, hasLinked, hasNetworked, hasHarmonious,
    hasIntegrated, hasUnified, hasSystematic, hasOrchestrated, hasAligned,
  ]

  const pattern = computeScore(positiveBooleans)
  const hasHighPattern = pattern >= 60

  let map: ConnectingMeasure['map'] = 'no-pattern'
  if (pattern >= 90) map = 'grand-constellation'
  else if (pattern >= 75) map = 'star-chain'
  else if (pattern >= 60) map = 'proper-pattern'
  else if (pattern >= 40) map = 'scattered-stars'
  else if (pattern >= 20) map = 'random-dots'

  return {
    pattern, map, hasHighPattern,
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasConnected,
    hasCoherent, hasOrganized, hasLinked, hasNetworked, hasHarmonious,
    hasIntegrated, hasUnified, hasSystematic, hasOrchestrated, hasAligned,
    spaghettiCount, monolithicCount,
  }
}

/** @example measureProbing('export class X { readonly y: string }') */
export function measureProbing(content: string): ProbingMeasure {
  const hasDeepLogic = /\b(class|interface|type)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|skindeep|surface)\b/gi) ?? []).length
  const hasNoShallow = shallowCount === 0
  const hasProfound = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const trivialCount = (content.match(/\b(trivial|petty|minor|negligible)\b/gi) ?? []).length
  const hasNoTrivial = trivialCount === 0
  const hasComplex = /\b(try|catch|if)\b/.test(content)
  const hasNoSimplistic = (content.match(/\b(simplistic|basic|primitive)\b/gi) ?? []).length === 0
  const hasNuanced = /\b(readonly|private|protected)\b/.test(content)
  const hasLayered = /\b(import|export)\b/.test(content)
  const hasMultiDimensional = /\b(async|await|Promise)\b/.test(content)
  const hasRich = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSubstantive = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasComprehensive = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasThorough = !/\bany\b/.test(content)
  const hasInDepth = /\b(function|=>|return)\b/.test(content)
  const hasExhaustive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasDeepLogic, hasNoShallow, hasProfound, hasNoTrivial, hasComplex,
    hasNoSimplistic, hasNuanced, hasLayered, hasMultiDimensional, hasRich,
    hasSubstantive, hasComprehensive, hasThorough, hasInDepth, hasExhaustive,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let cloud: ProbingMeasure['cloud'] = 'no-depth'
  if (depth >= 90) cloud = 'deep-nebula'
  else if (depth >= 75) cloud = 'stellar-nursery'
  else if (depth >= 60) cloud = 'proper-depth'
  else if (depth >= 40) cloud = 'shallow-pool'
  else if (depth >= 20) cloud = 'surface-only'

  return {
    depth, cloud, hasHighDepth,
    hasDeepLogic, hasNoShallow, hasProfound, hasNoTrivial, hasComplex,
    hasNoSimplistic, hasNuanced, hasLayered, hasMultiDimensional, hasRich,
    hasSubstantive, hasComprehensive, hasThorough, hasInDepth, hasExhaustive,
    shallowCount, trivialCount,
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
  const hasFarSighted = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasExperienced = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasExperienced,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cosmos: UnderstandingMeasure['cosmos'] = 'no-wisdom'
  if (wisdom >= 90) cosmos = 'cosmic-sage'
  else if (wisdom >= 75) cosmos = 'star-scholar'
  else if (wisdom >= 60) cosmos = 'proper-astronomer'
  else if (wisdom >= 40) cosmos = 'sky-watcher'
  else if (wisdom >= 20) cosmos = 'lost-traveler'

  return {
    wisdom, cosmos, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeSapphireReading(content, 'app.ts') */
export function analyzeSapphireReading(content: string, filePath: string): SapphireReading {
  const observing = measureObserving(content)
  const focusing = measureFocusing(content)
  const connecting = measureConnecting(content)
  const probing = measureProbing(content)
  const understanding = measureUnderstanding(content)

  const celestialClarity = observing.clarity
  const telescopePrecision = focusing.precision
  const constellationPattern = connecting.pattern
  const nebulaDepth = probing.depth
  const cosmicWisdom = understanding.wisdom

  const qualityScore = Math.round(
    celestialClarity * 0.2 +
    telescopePrecision * 0.2 +
    constellationPattern * 0.2 +
    nebulaDepth * 0.2 +
    cosmicWisdom * 0.2,
  )

  const condition = classifyReadingCondition(qualityScore)

  return {
    file: filePath,
    celestialClarity, telescopePrecision, constellationPattern, nebulaDepth, cosmicWisdom,
    observing, focusing, connecting, probing, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeSapphireDome(readings, 'src') */
export function analyzeSapphireDome(readings: SapphireReading[], dirPath: string): SapphireDome {
  if (readings.length === 0) {
    return {
      directory: dirPath, readings: [],
      avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      sapphireMasterpieceCount: 0, voidCount: 0,
      domeType: 'no-dome', condition: 'void',
    }
  }

  const avgClarity = Math.round(readings.reduce((s, r) => s + r.celestialClarity, 0) / readings.length)
  const avgPrecision = Math.round(readings.reduce((s, r) => s + r.telescopePrecision, 0) / readings.length)
  const avgWisdom = Math.round(readings.reduce((s, r) => s + r.cosmicWisdom, 0) / readings.length)
  const sapphireMasterpieceCount = readings.filter((r) => r.condition === 'sapphire-masterpiece').length
  const voidCount = readings.filter((r) => r.condition === 'void').length
  const domeType = classifyDomeType(readings)
  const avgQuality = Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length)
  const condition = classifyDomeCondition(avgQuality)

  return {
    directory: dirPath, readings,
    avgClarity, avgPrecision, avgWisdom,
    sapphireMasterpieceCount, voidCount,
    domeType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSapphireObservatoryResult(['a.ts'], [content]) */
export async function buildSapphireObservatoryResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireObservatoryResult> {
  const readings: SapphireReading[] = files.map((file, i) =>
    analyzeSapphireReading(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SapphireReading[]>()
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

  const domes: SapphireDome[] = Array.from(dirMap.entries()).map(([dir, dirReadings]) =>
    analyzeSapphireDome(dirReadings, dir),
  )

  const avgCelestialClarity = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.celestialClarity, 0) / readings.length) : 0
  const avgTelescopePrecision = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.telescopePrecision, 0) / readings.length) : 0
  const avgConstellationPattern = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.constellationPattern, 0) / readings.length) : 0
  const avgNebulaDepth = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.nebulaDepth, 0) / readings.length) : 0
  const avgCosmicWisdom = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.cosmicWisdom, 0) / readings.length) : 0

  const overallLuminosity = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length) : 0
  const isSapphire = overallLuminosity >= 60

  const cosmos = { avgClarity: avgCelestialClarity, avgPrecision: avgTelescopePrecision, avgWisdom: avgCosmicWisdom, isSapphire, overallLuminosity }

  const sapphireMasterpieceCount = readings.filter((r) => r.condition === 'sapphire-masterpiece').length
  const celestialGemCount = readings.filter((r) => r.condition === 'celestial-gem').length
  const properSapphireCount = readings.filter((r) => r.condition === 'proper-sapphire').length
  const blueGlassCount = readings.filter((r) => r.condition === 'blue-glass').length
  const cloudyQuartzCount = readings.filter((r) => r.condition === 'cloudy-quartz').length
  const voidCount = readings.filter((r) => r.condition === 'void').length

  const hasHighClarityCount = readings.filter((r) => r.observing.hasHighClarity).length
  const hasHighPrecisionCount = readings.filter((r) => r.focusing.hasHighPrecision).length
  const hasHighPatternCount = readings.filter((r) => r.connecting.hasHighPattern).length
  const hasHighDepthCount = readings.filter((r) => r.probing.hasHighDepth).length
  const hasHighWisdomCount = readings.filter((r) => r.understanding.hasHighWisdom).length

  const astronomerGrade = classifyAstronomerGrade(overallLuminosity)

  const bestReading = readings.length > 0
    ? readings.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file : ''
  const clearest = readings.length > 0
    ? readings.reduce((best, r) => (r.celestialClarity > best.celestialClarity ? r : best)).file : ''
  const mostPrecise = readings.length > 0
    ? readings.reduce((best, r) => (r.telescopePrecision > best.telescopePrecision ? r : best)).file : ''
  const mostConnected = readings.length > 0
    ? readings.reduce((best, r) => (r.constellationPattern > best.constellationPattern ? r : best)).file : ''
  const deepest = readings.length > 0
    ? readings.reduce((best, r) => (r.nebulaDepth > best.nebulaDepth ? r : best)).file : ''
  const wisest = readings.length > 0
    ? readings.reduce((best, r) => (r.cosmicWisdom > best.cosmicWisdom ? r : best)).file : ''

  const stats: SapphireObservatoryResult['stats'] = {
    totalFiles: files.length, totalDomes: domes.length,
    avgCelestialClarity, avgTelescopePrecision, avgConstellationPattern, avgNebulaDepth, avgCosmicWisdom,
    sapphireMasterpieceCount, celestialGemCount, properSapphireCount, blueGlassCount, cloudyQuartzCount, voidCount,
    hasHighClarityCount, hasHighPrecisionCount, hasHighPatternCount, hasHighDepthCount, hasHighWisdomCount,
    overallLuminosity, astronomerGrade,
    bestReading, clearest, mostPrecise, mostConnected, deepest, wisest,
  }

  const recommendations = generateRecommendations(readings, domes, cosmos, stats)

  return { readings, domes, cosmos, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(readings, domes, cosmos, stats) */
export function generateRecommendations(
  readings: SapphireReading[],
  domes: SapphireDome[],
  _cosmos: SapphireObservatoryResult['cosmos'],
  stats: SapphireObservatoryResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCelestialClarity >= 90 &&
    stats.avgTelescopePrecision >= 90 &&
    stats.avgConstellationPattern >= 90 &&
    stats.avgNebulaDepth >= 90 &&
    stats.avgCosmicWisdom >= 90
  ) {
    recs.push(
      'Your sapphire observatory radiates perfect luminosity! The celestial clarity is crystal, the telescope achieves hubble-grade precision, constellations form grand patterns, the nebula reveals infinite depth, and cosmic wisdom spans the universe!',
    )
    return recs
  }

  if (stats.avgCelestialClarity < 60) {
    recs.push(
      'Clarify the celestial view — your code must be transparent as a sapphire night sky; improve naming, add documentation, and remove cryptic patterns',
    )
  }

  if (stats.avgTelescopePrecision < 60) {
    recs.push(
      'Calibrate telescope precision — the sapphire lens must focus with hubble clarity; your code needs stronger types, cleaner patterns, and exact specifications',
    )
  }

  if (stats.avgConstellationPattern < 60) {
    recs.push(
      'Map constellation patterns — the stars must form connected patterns; your code needs modular structure, clear dependencies, and organized architecture',
    )
  }

  if (stats.avgNebulaDepth < 60) {
    recs.push(
      'Probe nebula depth — the cosmic clouds must reveal profound insights; your code needs deeper logic, nuanced handling, and comprehensive coverage',
    )
  }

  if (stats.avgCosmicWisdom < 60) {
    recs.push(
      'Deepen cosmic wisdom — the sapphire observatory must gather universal knowledge; your code needs principled architecture, strategic vision, and holistic understanding',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The sapphire observatory has gone dark — cloudy quartz and blue glass outnumber the precious sapphires, and the domes have fallen into shadow',
    )
  }

  const voidReadings = readings.filter((r) => r.condition === 'void')
  if (voidReadings.length > 0 && voidReadings.length <= 5) {
    recs.push(`Polish these cloudy quartz into sapphire: ${voidReadings.map((r) => r.file).join(', ')}`)
  } else if (voidReadings.length > 5) {
    recs.push(`Polish ${voidReadings.length} cloudy quartz readings into sapphire before the observatory collapses`)
  }

  const poorDomes = domes.filter((d) => d.condition === 'void' || d.condition === 'wooden-shack')
  if (poorDomes.length === domes.length && domes.length > 0) {
    recs.push('All domes are wooden shacks — the sapphire observatory needs complete reconstruction from the finest celestial gems')
  }

  if (recs.length === 0) {
    recs.push('Your sapphire observatory gleams with cosmic luminosity — every reading shines with clarity, precision, pattern, depth, and cosmic wisdom')
  }

  return recs
}
