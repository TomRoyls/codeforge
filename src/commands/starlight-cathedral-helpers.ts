// ─── Interfaces ──────────────────────────────────────────

export interface ShiningMeasure {
  luminescence: number
  light: 'supernova-bright' | 'starshine' | 'proper-glow' | 'candle-flame' | 'dark-matter' | 'no-luminescence'
  hasHighLuminescence: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasLuminous: boolean
  hasRadiant: boolean
  hasBrilliant: boolean
  hasGlowing: boolean
  hasShining: boolean
  hasBright: boolean
  hasDazzling: boolean
  hasResplendent: boolean
  hasIlluminated: boolean
  hasEffulgent: boolean
  hasIncandescent: boolean
  crypticCount: number
  mysteryCount: number
}

export interface BuildingMeasure {
  architecture: number
  structure: 'grand-cathedral' | 'stellar-temple' | 'proper-sanctuary' | 'wooden-chapel' | 'tent' | 'no-architecture'
  hasHighArchitecture: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasElegant: boolean
  hasRefined: boolean
  hasMagnificent: boolean
  hasGrand: boolean
  hasImposing: boolean
  hasMajestic: boolean
  hasStately: boolean
  hasSplendid: boolean
  hasMonumental: boolean
  hasColossal: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface AligningMeasure {
  precision: number
  alignment: 'perfect-alignment' | 'precise-orbit' | 'proper-trajectory' | 'wobbly-path' | 'chaotic-drift' | 'no-precision'
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
  hasCalibrated: boolean
  hasSynchronized: boolean
  hasAligned: boolean
  unsafeCount: number
  approximateCount: number
}

export interface EnduringMeasure {
  endurance: number
  eternity: 'photon-eternal' | 'star-long-lived' | 'proper-lifespan' | 'shooting-star' | 'firefly-flash' | 'no-endurance'
  hasHighEndurance: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasPermanent: boolean
  hasPerpetual: boolean
  hasImmortal: boolean
  hasEternal: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  cosmos: 'cosmic-sage' | 'star-oracle' | 'proper-astronomer' | 'sky-watcher' | 'lost-traveler' | 'no-wisdom'
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
  hasTranscendent: boolean
  hasWise: boolean
  hasOmniscient: boolean
  hackedCount: number
  shallowCount: number
}

export type PrayerCondition =
  | 'starlight-masterpiece'
  | 'celestial-gem'
  | 'proper-star'
  | 'dim-ember'
  | 'dark-void'
  | 'void'

export interface StarlightPrayer {
  file: string
  celestialLuminescence: number
  stellarArchitecture: number
  cosmicPrecision: number
  interstellarEndurance: number
  astralWisdom: number
  shining: ShiningMeasure
  building: BuildingMeasure
  aligning: AligningMeasure
  enduring: EnduringMeasure
  understanding: UnderstandingMeasure
  condition: PrayerCondition
  qualityScore: number
}

export type ConstellationType =
  | 'grand-constellation'
  | 'star-cluster'
  | 'proper-pattern'
  | 'scattered-stars'
  | 'empty-space'
  | 'no-constellation'

export type ConstellationCondition =
  | 'starlight-palace'
  | 'cosmic-temple'
  | 'proper-observatory'
  | 'stone-tower'
  | 'dark-room'
  | 'void'

export interface StarlightConstellation {
  directory: string
  prayers: StarlightPrayer[]
  avgLuminescence: number
  avgPrecision: number
  avgWisdom: number
  starlightMasterpieceCount: number
  voidCount: number
  constellationType: ConstellationType
  condition: ConstellationCondition
}

export type AstronomerGrade = 'cosmic-high-priest' | 'star-bishop' | 'proper-deacon' | 'acolyte' | 'novice' | 'uninitiated'

export interface StarlightCathedralResult {
  prayers: StarlightPrayer[]
  constellations: StarlightConstellation[]
  cathedral: {
    avgLuminescence: number
    avgPrecision: number
    avgWisdom: number
    isStarlight: boolean
    overallRadiance: number
    celebration?: string
  }
  stats: {
    totalFiles: number
    totalConstellations: number
    avgCelestialLuminescence: number
    avgStellarArchitecture: number
    avgCosmicPrecision: number
    avgInterstellarEndurance: number
    avgAstralWisdom: number
    starlightMasterpieceCount: number
    celestialGemCount: number
    properStarCount: number
    dimEmberCount: number
    darkVoidCount: number
    voidCount: number
    hasHighLuminescenceCount: number
    hasHighArchitectureCount: number
    hasHighPrecisionCount: number
    hasHighEnduranceCount: number
    hasHighWisdomCount: number
    overallRadiance: number
    astronomerGrade: AstronomerGrade
    bestPrayer: string
    brightest: string
    mostStructured: string
    mostPrecise: string
    mostEnduring: string
    wisest: string
    celebration?: string
  }
  recommendations: string[]
  celebration?: string
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

/** @example classifyPrayerCondition(90) */
export function classifyPrayerCondition(score: number): PrayerCondition {
  if (score >= 90) return 'starlight-masterpiece'
  if (score >= 75) return 'celestial-gem'
  if (score >= 60) return 'proper-star'
  if (score >= 40) return 'dim-ember'
  if (score >= 20) return 'dark-void'
  return 'void'
}

/** @example classifyConstellationType(prayers) */
export function classifyConstellationType(prayers: StarlightPrayer[]): ConstellationType {
  if (prayers.length === 0) return 'no-constellation'
  const avg = prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length
  if (avg >= 85) return 'grand-constellation'
  if (avg >= 70) return 'star-cluster'
  if (avg >= 55) return 'proper-pattern'
  if (avg >= 35) return 'scattered-stars'
  return 'empty-space'
}

/** @example classifyConstellationCondition(85) */
export function classifyConstellationCondition(score: number): ConstellationCondition {
  if (score >= 85) return 'starlight-palace'
  if (score >= 70) return 'cosmic-temple'
  if (score >= 55) return 'proper-observatory'
  if (score >= 35) return 'stone-tower'
  if (score >= 15) return 'dark-room'
  return 'void'
}

/** @example classifyAstronomerGrade(80) */
export function classifyAstronomerGrade(avgRadiance: number): AstronomerGrade {
  if (avgRadiance >= 80) return 'cosmic-high-priest'
  if (avgRadiance >= 65) return 'star-bishop'
  if (avgRadiance >= 50) return 'proper-deacon'
  if (avgRadiance >= 35) return 'acolyte'
  if (avgRadiance >= 20) return 'novice'
  return 'uninitiated'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureShining('export class X { readonly y: string }') */
export function measureShining(content: string): ShiningMeasure {
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|=>|return)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = !/\bany\b/.test(content)
  const hasLuminous = /\b(class|interface|type)\b/.test(content)
  const hasRadiant = /\b(import|export)\b/.test(content)
  const hasBrilliant = /\b(readonly|private|protected)\b/.test(content)
  const hasGlowing = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasShining = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasBright = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasDazzling = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasResplendent = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasIlluminated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEffulgent = /\b(async|await|Promise)\b/.test(content)
  const hasIncandescent = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasLuminous, hasRadiant, hasBrilliant, hasGlowing, hasShining,
    hasBright, hasDazzling, hasResplendent, hasIlluminated, hasEffulgent,
    hasIncandescent,
  ]

  const luminescence = computeScore(positiveBooleans)
  const hasHighLuminescence = luminescence >= 60

  let light: ShiningMeasure['light'] = 'no-luminescence'
  if (luminescence >= 90) light = 'supernova-bright'
  else if (luminescence >= 75) light = 'starshine'
  else if (luminescence >= 60) light = 'proper-glow'
  else if (luminescence >= 40) light = 'candle-flame'
  else if (luminescence >= 20) light = 'dark-matter'

  return {
    luminescence, light, hasHighLuminescence,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasLuminous, hasRadiant, hasBrilliant, hasGlowing, hasShining,
    hasBright, hasDazzling, hasResplendent, hasIlluminated, hasEffulgent,
    hasIncandescent,
    crypticCount, mysteryCount,
  }
}

/** @example measureBuilding('export class X { readonly y: string }') */
export function measureBuilding(content: string): BuildingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|tangled|spaghetti)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega|bloated)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasElegant = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMagnificent = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasGrand = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasImposing = !/\bany\b/.test(content)
  const hasMajestic = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasStately = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSplendid = /\b(function|=>|return)\b/.test(content)
  const hasMonumental = /\b(async|await|Promise)\b/.test(content)
  const hasColossal = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasElegant, hasRefined, hasMagnificent, hasGrand, hasImposing,
    hasMajestic, hasStately, hasSplendid, hasMonumental, hasColossal,
  ]

  const architecture = computeScore(positiveBooleans)
  const hasHighArchitecture = architecture >= 60

  let structure: BuildingMeasure['structure'] = 'no-architecture'
  if (architecture >= 90) structure = 'grand-cathedral'
  else if (architecture >= 75) structure = 'stellar-temple'
  else if (architecture >= 60) structure = 'proper-sanctuary'
  else if (architecture >= 40) structure = 'wooden-chapel'
  else if (architecture >= 20) structure = 'tent'

  return {
    architecture, structure, hasHighArchitecture,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasElegant, hasRefined, hasMagnificent, hasGrand, hasImposing,
    hasMajestic, hasStately, hasSplendid, hasMonumental, hasColossal,
    chaoticCount, monolithicCount,
  }
}

/** @example measureAligning('export class X { readonly y: string }') */
export function measureAligning(content: string): AligningMeasure {
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
  const hasCalculated = /\b(async|await|Promise)\b/.test(content)
  const hasCalibrated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSynchronized = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasAligned = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasCalibrated, hasSynchronized, hasAligned,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let alignment: AligningMeasure['alignment'] = 'no-precision'
  if (precision >= 90) alignment = 'perfect-alignment'
  else if (precision >= 75) alignment = 'precise-orbit'
  else if (precision >= 60) alignment = 'proper-trajectory'
  else if (precision >= 40) alignment = 'wobbly-path'
  else if (precision >= 20) alignment = 'chaotic-drift'

  return {
    precision, alignment, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasCalibrated, hasSynchronized, hasAligned,
    unsafeCount, approximateCount,
  }
}

/** @example measureEnduring('export class X { readonly y: string }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|risky|dangerous|fragile)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(if|return)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = !/\bany\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasStable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDurable = /\b(readonly|private|protected)\b/.test(content)
  const hasHardened = /\b(import|export)\b/.test(content)
  const hasEnduring = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasLasting = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPermanent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPerpetual = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasImmortal = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasEternal = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasHardened, hasEnduring,
    hasLasting, hasPermanent, hasPerpetual, hasImmortal, hasEternal,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let eternity: EnduringMeasure['eternity'] = 'no-endurance'
  if (endurance >= 90) eternity = 'photon-eternal'
  else if (endurance >= 75) eternity = 'star-long-lived'
  else if (endurance >= 60) eternity = 'proper-lifespan'
  else if (endurance >= 40) eternity = 'shooting-star'
  else if (endurance >= 20) eternity = 'firefly-flash'

  return {
    endurance, eternity, hasHighEndurance,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasHardened, hasEnduring,
    hasLasting, hasPermanent, hasPerpetual, hasImmortal, hasEternal,
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
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasTranscendent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasOmniscient = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cosmos: UnderstandingMeasure['cosmos'] = 'no-wisdom'
  if (wisdom >= 90) cosmos = 'cosmic-sage'
  else if (wisdom >= 75) cosmos = 'star-oracle'
  else if (wisdom >= 60) cosmos = 'proper-astronomer'
  else if (wisdom >= 40) cosmos = 'sky-watcher'
  else if (wisdom >= 20) cosmos = 'lost-traveler'

  return {
    wisdom, cosmos, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasOmniscient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeStarlightPrayer(content, 'app.ts') */
export function analyzeStarlightPrayer(content: string, filePath: string): StarlightPrayer {
  const shining = measureShining(content)
  const building = measureBuilding(content)
  const aligning = measureAligning(content)
  const enduring = measureEnduring(content)
  const understanding = measureUnderstanding(content)

  const celestialLuminescence = shining.luminescence
  const stellarArchitecture = building.architecture
  const cosmicPrecision = aligning.precision
  const interstellarEndurance = enduring.endurance
  const astralWisdom = understanding.wisdom

  const qualityScore = Math.round(
    celestialLuminescence * 0.2 +
    stellarArchitecture * 0.2 +
    cosmicPrecision * 0.2 +
    interstellarEndurance * 0.2 +
    astralWisdom * 0.2,
  )

  const condition = classifyPrayerCondition(qualityScore)

  return {
    file: filePath,
    celestialLuminescence, stellarArchitecture, cosmicPrecision, interstellarEndurance, astralWisdom,
    shining, building, aligning, enduring, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeStarlightConstellation(prayers, 'src') */
export function analyzeStarlightConstellation(prayers: StarlightPrayer[], dirPath: string): StarlightConstellation {
  if (prayers.length === 0) {
    return {
      directory: dirPath, prayers: [],
      avgLuminescence: 0, avgPrecision: 0, avgWisdom: 0,
      starlightMasterpieceCount: 0, voidCount: 0,
      constellationType: 'no-constellation', condition: 'void',
    }
  }

  const avgLuminescence = Math.round(prayers.reduce((s, p) => s + p.celestialLuminescence, 0) / prayers.length)
  const avgPrecision = Math.round(prayers.reduce((s, p) => s + p.cosmicPrecision, 0) / prayers.length)
  const avgWisdom = Math.round(prayers.reduce((s, p) => s + p.astralWisdom, 0) / prayers.length)
  const starlightMasterpieceCount = prayers.filter((p) => p.condition === 'starlight-masterpiece').length
  const voidCount = prayers.filter((p) => p.condition === 'void').length
  const constellationType = classifyConstellationType(prayers)
  const avgQuality = Math.round(prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length)
  const condition = classifyConstellationCondition(avgQuality)

  return {
    directory: dirPath, prayers,
    avgLuminescence, avgPrecision, avgWisdom,
    starlightMasterpieceCount, voidCount,
    constellationType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

const CELEBRATION_MESSAGE = 'Command #630 — Starlight Cathedral milestone achieved! 630 commands illuminate the eternal codebase!'

/** @example buildStarlightCathedralResult(['a.ts'], [content]) */
export async function buildStarlightCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StarlightCathedralResult> {
  const prayers: StarlightPrayer[] = files.map((file, i) =>
    analyzeStarlightPrayer(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StarlightPrayer[]>()
  for (const prayer of prayers) {
    const dir = prayer.file.includes('/')
      ? prayer.file.substring(0, prayer.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(prayer)
    } else {
      dirMap.set(dir, [prayer])
    }
  }

  const constellations: StarlightConstellation[] = Array.from(dirMap.entries()).map(([dir, dirPrayers]) =>
    analyzeStarlightConstellation(dirPrayers, dir),
  )

  const avgCelestialLuminescence = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.celestialLuminescence, 0) / prayers.length) : 0
  const avgStellarArchitecture = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.stellarArchitecture, 0) / prayers.length) : 0
  const avgCosmicPrecision = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.cosmicPrecision, 0) / prayers.length) : 0
  const avgInterstellarEndurance = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.interstellarEndurance, 0) / prayers.length) : 0
  const avgAstralWisdom = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.astralWisdom, 0) / prayers.length) : 0

  const overallRadiance = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length) : 0
  const isStarlight = overallRadiance >= 60

  const hasSelfReference = files.some((f) => f.includes('starlight-cathedral'))

  const cathedral: StarlightCathedralResult['cathedral'] = {
    avgLuminescence: avgCelestialLuminescence, avgPrecision: avgCosmicPrecision, avgWisdom: avgAstralWisdom,
    isStarlight, overallRadiance,
    celebration: hasSelfReference ? CELEBRATION_MESSAGE : undefined,
  }

  const starlightMasterpieceCount = prayers.filter((p) => p.condition === 'starlight-masterpiece').length
  const celestialGemCount = prayers.filter((p) => p.condition === 'celestial-gem').length
  const properStarCount = prayers.filter((p) => p.condition === 'proper-star').length
  const dimEmberCount = prayers.filter((p) => p.condition === 'dim-ember').length
  const darkVoidCount = prayers.filter((p) => p.condition === 'dark-void').length
  const voidCount = prayers.filter((p) => p.condition === 'void').length

  const hasHighLuminescenceCount = prayers.filter((p) => p.shining.hasHighLuminescence).length
  const hasHighArchitectureCount = prayers.filter((p) => p.building.hasHighArchitecture).length
  const hasHighPrecisionCount = prayers.filter((p) => p.aligning.hasHighPrecision).length
  const hasHighEnduranceCount = prayers.filter((p) => p.enduring.hasHighEndurance).length
  const hasHighWisdomCount = prayers.filter((p) => p.understanding.hasHighWisdom).length

  const astronomerGrade = classifyAstronomerGrade(overallRadiance)

  const bestPrayer = prayers.length > 0
    ? prayers.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file : ''
  const brightest = prayers.length > 0
    ? prayers.reduce((best, p) => (p.celestialLuminescence > best.celestialLuminescence ? p : best)).file : ''
  const mostStructured = prayers.length > 0
    ? prayers.reduce((best, p) => (p.stellarArchitecture > best.stellarArchitecture ? p : best)).file : ''
  const mostPrecise = prayers.length > 0
    ? prayers.reduce((best, p) => (p.cosmicPrecision > best.cosmicPrecision ? p : best)).file : ''
  const mostEnduring = prayers.length > 0
    ? prayers.reduce((best, p) => (p.interstellarEndurance > best.interstellarEndurance ? p : best)).file : ''
  const wisest = prayers.length > 0
    ? prayers.reduce((best, p) => (p.astralWisdom > best.astralWisdom ? p : best)).file : ''

  const stats: StarlightCathedralResult['stats'] = {
    totalFiles: files.length, totalConstellations: constellations.length,
    avgCelestialLuminescence, avgStellarArchitecture, avgCosmicPrecision, avgInterstellarEndurance, avgAstralWisdom,
    starlightMasterpieceCount, celestialGemCount, properStarCount, dimEmberCount, darkVoidCount, voidCount,
    hasHighLuminescenceCount, hasHighArchitectureCount, hasHighPrecisionCount, hasHighEnduranceCount, hasHighWisdomCount,
    overallRadiance, astronomerGrade,
    bestPrayer, brightest, mostStructured, mostPrecise, mostEnduring, wisest,
    celebration: hasSelfReference ? CELEBRATION_MESSAGE : undefined,
  }

  const recommendations = generateRecommendations(prayers, constellations, cathedral, stats)

  return {
    prayers, constellations, cathedral, stats, recommendations,
    celebration: hasSelfReference ? CELEBRATION_MESSAGE : undefined,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(prayers, constellations, cathedral, stats) */
export function generateRecommendations(
  prayers: StarlightPrayer[],
  constellations: StarlightConstellation[],
  _cathedral: StarlightCathedralResult['cathedral'],
  stats: StarlightCathedralResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCelestialLuminescence >= 90 &&
    stats.avgStellarArchitecture >= 90 &&
    stats.avgCosmicPrecision >= 90 &&
    stats.avgInterstellarEndurance >= 90 &&
    stats.avgAstralWisdom >= 90
  ) {
    recs.push(
      'Your starlight cathedral blazes with divine perfection! Celestial luminescence outshines supernovae, stellar architecture rivals grand cathedrals, cosmic precision achieves perfect alignment, interstellar endurance spans photon-eternal lifetimes, and astral wisdom transcends to cosmic-sage omniscience!',
    )
    return recs
  }

  if (stats.avgCelestialLuminescence < 60) {
    recs.push(
      'Increase celestial luminescence — the cathedral walls must glow with starlight; add clear naming, self-documenting code, and illuminating patterns'
    )
  }

  if (stats.avgStellarArchitecture < 60) {
    recs.push(
      'Elevate stellar architecture — the cathedral needs magnificent structure; build with modularity, elegant organization, and grand design patterns'
    )
  }

  if (stats.avgCosmicPrecision < 60) {
    recs.push(
      'Align cosmic precision — every star must follow its precise orbit; tighten types, eliminate unsafe patterns, and calibrate definitions'
    )
  }

  if (stats.avgInterstellarEndurance < 60) {
    recs.push(
      'Strengthen interstellar endurance — the cathedral must stand for eons; add error handling, defensive checks, and robust architecture'
    )
  }

  if (stats.avgAstralWisdom < 60) {
    recs.push(
      'Deepen astral wisdom — the cosmos holds infinite knowledge; build with principled architecture, proven patterns, and strategic design'
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The cathedral is dark — dim embers and dark voids outnumber the stars, and no light reaches the altar'
    )
  }

  const voidPrayers = prayers.filter((p) => p.condition === 'void')
  if (voidPrayers.length > 0 && voidPrayers.length <= 5) {
    recs.push(`Ignite these dark voids: ${voidPrayers.map((p) => p.file).join(', ')}`)
  } else if (voidPrayers.length > 5) {
    recs.push(`Ignite ${voidPrayers.length} dark voids before the cathedral collapses into darkness`)
  }

  const poorConstellations = constellations.filter((c) => c.condition === 'void' || c.condition === 'dark-room')
  if (poorConstellations.length === constellations.length && constellations.length > 0) {
    recs.push('All constellations are dark rooms — the starlight cathedral needs grand-constellation quality prayers throughout')
  }

  if (recs.length === 0) {
    recs.push('Your starlight cathedral radiates magnificence — every prayer embodies celestial luminescence, stellar architecture, cosmic precision, interstellar endurance, and astral wisdom')
  }

  return recs
}
