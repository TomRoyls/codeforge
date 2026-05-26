// ─── Interfaces ──────────────────────────────────────────

export interface DesigningMeasure {
  architecture: number
  temple: 'galactic-temple' | 'star-cathedral' | 'proper-shrine' | 'wooden-altar' | 'stone-cairn' | 'no-architecture'
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
  hasMajestic: boolean
  hasStately: boolean
  hasSplendid: boolean
  hasMonumental: boolean
  hasDivine: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface AligningMeasure {
  precision: number
  stars: 'grand-constellation' | 'star-chain' | 'proper-pattern' | 'scattered-stars' | 'random-dots' | 'no-precision'
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
  hasConnected: boolean
  hasAligned: boolean
  hasCoherent: boolean
  hasSymmetrical: boolean
  hasCalibrated: boolean
  hasSynchronized: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SurvivingMeasure {
  resilience: number
  remnant: 'neutron-star' | 'pulsar-core' | 'proper-remnant' | 'white-dwarf' | 'cosmic-dust' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasIndestructible: boolean
  hasUnbreakable: boolean
  hasEternal: boolean
  hasImmortal: boolean
  unhandledCount: number
  untestedCount: number
}

export interface RevealingMeasure {
  clarity: number
  void: 'hubble-clarity' | 'deep-field' | 'proper-vision' | 'cloudy-nebula' | 'black-hole' | 'no-clarity'
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

export interface UnderstandingMeasure {
  wisdom: number
  cosmos: 'cosmic-deity' | 'star-oracle' | 'proper-astronomer' | 'sky-watcher' | 'grounded-mortal' | 'no-wisdom'
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

export type StellarCondition =
  | 'stellar-masterpiece'
  | 'divine-constellation'
  | 'proper-star'
  | 'dim-ember'
  | 'dark-void'
  | 'void'

export interface StellarAltar {
  file: string
  divineArchitecture: number
  constellationPrecision: number
  supernovaResilience: number
  cosmicClarity: number
  celestialWisdom: number
  designing: DesigningMeasure
  aligning: AligningMeasure
  surviving: SurvivingMeasure
  revealing: RevealingMeasure
  understanding: UnderstandingMeasure
  condition: StellarCondition
  qualityScore: number
}

export type TempleType =
  | 'grand-pantheon'
  | 'star-temple'
  | 'proper-shrine'
  | 'stone-altar'
  | 'empty-pedestal'
  | 'no-temple'

export type TempleCondition =
  | 'stellar-palace'
  | 'cosmic-temple'
  | 'proper-observatory'
  | 'stone-circle'
  | 'empty-field'
  | 'void'

export type DeityGrade = 'cosmic-deity' | 'star-god' | 'proper-demiurge' | 'mortal-builder' | 'apprentice' | 'stardust'

export interface StellarTemple {
  directory: string
  altars: StellarAltar[]
  avgArchitecture: number
  avgPrecision: number
  avgWisdom: number
  stellarMasterpieceCount: number
  voidCount: number
  templeType: TempleType
  condition: TempleCondition
}

export interface StellarPantheonResult {
  altars: StellarAltar[]
  temples: StellarTemple[]
  cosmos: {
    avgArchitecture: number
    avgPrecision: number
    avgWisdom: number
    isStellar: boolean
    overallDivinity: number
    celebration?: string
  }
  stats: {
    totalFiles: number
    totalTemples: number
    avgDivineArchitecture: number
    avgConstellationPrecision: number
    avgSupernovaResilience: number
    avgCosmicClarity: number
    avgCelestialWisdom: number
    stellarMasterpieceCount: number
    divineConstellationCount: number
    properStarCount: number
    dimEmberCount: number
    darkVoidCount: number
    voidCount: number
    hasHighArchitectureCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallDivinity: number
    deityGrade: DeityGrade
    bestAltar: string
    mostArchitectural: string
    mostPrecise: string
    mostResilient: string
    clearest: string
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

/** @example classifyStellarCondition(90) */
export function classifyStellarCondition(score: number): StellarCondition {
  if (score >= 90) return 'stellar-masterpiece'
  if (score >= 75) return 'divine-constellation'
  if (score >= 60) return 'proper-star'
  if (score >= 40) return 'dim-ember'
  if (score >= 20) return 'dark-void'
  return 'void'
}

/** @example classifyTempleType(altars) */
export function classifyTempleType(altars: StellarAltar[]): TempleType {
  if (altars.length === 0) return 'no-temple'
  const avg = altars.reduce((s, a) => s + a.qualityScore, 0) / altars.length
  if (avg >= 85) return 'grand-pantheon'
  if (avg >= 70) return 'star-temple'
  if (avg >= 55) return 'proper-shrine'
  if (avg >= 35) return 'stone-altar'
  return 'empty-pedestal'
}

/** @example classifyTempleCondition(85) */
export function classifyTempleCondition(score: number): TempleCondition {
  if (score >= 85) return 'stellar-palace'
  if (score >= 70) return 'cosmic-temple'
  if (score >= 55) return 'proper-observatory'
  if (score >= 35) return 'stone-circle'
  if (score >= 15) return 'empty-field'
  return 'void'
}

/** @example classifyDeityGrade(80) */
export function classifyDeityGrade(avgDivinity: number): DeityGrade {
  if (avgDivinity >= 80) return 'cosmic-deity'
  if (avgDivinity >= 65) return 'star-god'
  if (avgDivinity >= 50) return 'proper-demiurge'
  if (avgDivinity >= 35) return 'mortal-builder'
  if (avgDivinity >= 20) return 'apprentice'
  return 'stardust'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDesigning('export class X { readonly y: string }') */
export function measureDesigning(content: string): DesigningMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled|spaghetti)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasOrganized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasElegant = !/\bany\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasMagnificent = /\b(async|await|Promise)\b/.test(content)
  const hasGrand = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMajestic = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasStately = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSplendid = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMonumental = (content.match(/\b(dead|unused|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasDivine = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasElegant, hasRefined, hasMagnificent, hasGrand, hasMajestic,
    hasStately, hasSplendid, hasMonumental, hasDivine,
  ]

  const architecture = computeScore(positiveBooleans)
  const hasHighArchitecture = architecture >= 60

  let temple: DesigningMeasure['temple'] = 'no-architecture'
  if (architecture >= 90) temple = 'galactic-temple'
  else if (architecture >= 75) temple = 'star-cathedral'
  else if (architecture >= 60) temple = 'proper-shrine'
  else if (architecture >= 40) temple = 'wooden-altar'
  else if (architecture >= 20) temple = 'stone-cairn'

  return {
    architecture, temple, hasHighArchitecture,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasElegant, hasRefined, hasMagnificent, hasGrand, hasMajestic,
    hasStately, hasSplendid, hasMonumental, hasDivine,
    chaoticCount, monolithicCount,
  }
}

/** @example measureAligning('export class X { readonly y: string }') */
export function measureAligning(content: string): AligningMeasure {
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
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasAligned = /\b(async|await|Promise)\b/.test(content)
  const hasCoherent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSymmetrical = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCalibrated = /\b(try|catch|if)\b/.test(content)
  const hasSynchronized = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasConnected,
    hasAligned, hasCoherent, hasSymmetrical, hasCalibrated, hasSynchronized,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let stars: AligningMeasure['stars'] = 'no-precision'
  if (precision >= 90) stars = 'grand-constellation'
  else if (precision >= 75) stars = 'star-chain'
  else if (precision >= 60) stars = 'proper-pattern'
  else if (precision >= 40) stars = 'scattered-stars'
  else if (precision >= 20) stars = 'random-dots'

  return {
    precision, stars, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasConnected,
    hasAligned, hasCoherent, hasSymmetrical, hasCalibrated, hasSynchronized,
    unsafeCount, approximateCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(import|export)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasIndestructible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUnbreakable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEternal = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImmortal = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasDurable,
    hasIndestructible, hasUnbreakable, hasEternal, hasImmortal,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let remnant: SurvivingMeasure['remnant'] = 'no-resilience'
  if (resilience >= 90) remnant = 'neutron-star'
  else if (resilience >= 75) remnant = 'pulsar-core'
  else if (resilience >= 60) remnant = 'proper-remnant'
  else if (resilience >= 40) remnant = 'white-dwarf'
  else if (resilience >= 20) remnant = 'cosmic-dust'

  return {
    resilience, remnant, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasDurable,
    hasIndestructible, hasUnbreakable, hasEternal, hasImmortal,
    unhandledCount, untestedCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
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

  let voidLabel: RevealingMeasure['void'] = 'no-clarity'
  if (clarity >= 90) voidLabel = 'hubble-clarity'
  else if (clarity >= 75) voidLabel = 'deep-field'
  else if (clarity >= 60) voidLabel = 'proper-vision'
  else if (clarity >= 40) voidLabel = 'cloudy-nebula'
  else if (clarity >= 20) voidLabel = 'black-hole'

  return {
    clarity, void: voidLabel, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
    crypticCount, mysteryCount,
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
  const hasTranscendent = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasOmniscient = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cosmos: UnderstandingMeasure['cosmos'] = 'no-wisdom'
  if (wisdom >= 90) cosmos = 'cosmic-deity'
  else if (wisdom >= 75) cosmos = 'star-oracle'
  else if (wisdom >= 60) cosmos = 'proper-astronomer'
  else if (wisdom >= 40) cosmos = 'sky-watcher'
  else if (wisdom >= 20) cosmos = 'grounded-mortal'

  return {
    wisdom, cosmos, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasOmniscient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeStellarAltar(content, 'app.ts') */
export function analyzeStellarAltar(content: string, filePath: string): StellarAltar {
  const designing = measureDesigning(content)
  const aligning = measureAligning(content)
  const surviving = measureSurviving(content)
  const revealing = measureRevealing(content)
  const understanding = measureUnderstanding(content)

  const divineArchitecture = designing.architecture
  const constellationPrecision = aligning.precision
  const supernovaResilience = surviving.resilience
  const cosmicClarity = revealing.clarity
  const celestialWisdom = understanding.wisdom

  const qualityScore = Math.round(
    divineArchitecture * 0.2 +
    constellationPrecision * 0.2 +
    supernovaResilience * 0.2 +
    cosmicClarity * 0.2 +
    celestialWisdom * 0.2,
  )

  const condition = classifyStellarCondition(qualityScore)

  return {
    file: filePath,
    divineArchitecture, constellationPrecision, supernovaResilience, cosmicClarity, celestialWisdom,
    designing, aligning, surviving, revealing, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeStellarTemple(altars, 'src') */
export function analyzeStellarTemple(altars: StellarAltar[], dirPath: string): StellarTemple {
  if (altars.length === 0) {
    return {
      directory: dirPath, altars: [],
      avgArchitecture: 0, avgPrecision: 0, avgWisdom: 0,
      stellarMasterpieceCount: 0, voidCount: 0,
      templeType: 'no-temple', condition: 'void',
    }
  }

  const avgArchitecture = Math.round(altars.reduce((s, a) => s + a.divineArchitecture, 0) / altars.length)
  const avgPrecision = Math.round(altars.reduce((s, a) => s + a.constellationPrecision, 0) / altars.length)
  const avgWisdom = Math.round(altars.reduce((s, a) => s + a.celestialWisdom, 0) / altars.length)
  const stellarMasterpieceCount = altars.filter((a) => a.condition === 'stellar-masterpiece').length
  const voidCount = altars.filter((a) => a.condition === 'void').length
  const templeType = classifyTempleType(altars)
  const avgQuality = Math.round(altars.reduce((s, a) => s + a.qualityScore, 0) / altars.length)
  const condition = classifyTempleCondition(avgQuality)

  return {
    directory: dirPath, altars,
    avgArchitecture, avgPrecision, avgWisdom,
    stellarMasterpieceCount, voidCount,
    templeType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

const CELEBRATION_MESSAGE = 'Command #650 — Stellar Pantheon milestone achieved! 650 commands shine as stars in the eternal code constellation!'

/** @example buildStellarPantheonResult(['a.ts'], [content]) */
export async function buildStellarPantheonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StellarPantheonResult> {
  const altars: StellarAltar[] = files.map((file, i) =>
    analyzeStellarAltar(contents[i] ?? '', file),
  )

  const selfReferencing = files.some((f) => f.includes('stellar-pantheon'))

  const dirMap = new Map<string, StellarAltar[]>()
  for (const altar of altars) {
    const dir = altar.file.includes('/')
      ? altar.file.substring(0, altar.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(altar)
    } else {
      dirMap.set(dir, [altar])
    }
  }

  const temples: StellarTemple[] = Array.from(dirMap.entries()).map(([dir, dirAltars]) =>
    analyzeStellarTemple(dirAltars, dir),
  )

  const avgDivineArchitecture = altars.length > 0
    ? Math.round(altars.reduce((s, a) => s + a.divineArchitecture, 0) / altars.length) : 0
  const avgConstellationPrecision = altars.length > 0
    ? Math.round(altars.reduce((s, a) => s + a.constellationPrecision, 0) / altars.length) : 0
  const avgSupernovaResilience = altars.length > 0
    ? Math.round(altars.reduce((s, a) => s + a.supernovaResilience, 0) / altars.length) : 0
  const avgCosmicClarity = altars.length > 0
    ? Math.round(altars.reduce((s, a) => s + a.cosmicClarity, 0) / altars.length) : 0
  const avgCelestialWisdom = altars.length > 0
    ? Math.round(altars.reduce((s, a) => s + a.celestialWisdom, 0) / altars.length) : 0

  const overallDivinity = altars.length > 0
    ? Math.round(altars.reduce((s, a) => s + a.qualityScore, 0) / altars.length) : 0
  const isStellar = overallDivinity >= 60

  const cosmos: StellarPantheonResult['cosmos'] = {
    avgArchitecture: avgDivineArchitecture, avgPrecision: avgConstellationPrecision, avgWisdom: avgCelestialWisdom,
    isStellar, overallDivinity,
    ...(selfReferencing ? { celebration: CELEBRATION_MESSAGE } : {}),
  }

  const stellarMasterpieceCount = altars.filter((a) => a.condition === 'stellar-masterpiece').length
  const divineConstellationCount = altars.filter((a) => a.condition === 'divine-constellation').length
  const properStarCount = altars.filter((a) => a.condition === 'proper-star').length
  const dimEmberCount = altars.filter((a) => a.condition === 'dim-ember').length
  const darkVoidCount = altars.filter((a) => a.condition === 'dark-void').length
  const voidCount = altars.filter((a) => a.condition === 'void').length

  const hasHighArchitectureCount = altars.filter((a) => a.designing.hasHighArchitecture).length
  const hasHighPrecisionCount = altars.filter((a) => a.aligning.hasHighPrecision).length
  const hasHighResilienceCount = altars.filter((a) => a.surviving.hasHighResilience).length
  const hasHighClarityCount = altars.filter((a) => a.revealing.hasHighClarity).length
  const hasHighWisdomCount = altars.filter((a) => a.understanding.hasHighWisdom).length

  const deityGrade = classifyDeityGrade(overallDivinity)

  const bestAltar = altars.length > 0
    ? altars.reduce((best, a) => (a.qualityScore > best.qualityScore ? a : best)).file : ''
  const mostArchitectural = altars.length > 0
    ? altars.reduce((best, a) => (a.divineArchitecture > best.divineArchitecture ? a : best)).file : ''
  const mostPrecise = altars.length > 0
    ? altars.reduce((best, a) => (a.constellationPrecision > best.constellationPrecision ? a : best)).file : ''
  const mostResilient = altars.length > 0
    ? altars.reduce((best, a) => (a.supernovaResilience > best.supernovaResilience ? a : best)).file : ''
  const clearest = altars.length > 0
    ? altars.reduce((best, a) => (a.cosmicClarity > best.cosmicClarity ? a : best)).file : ''
  const wisest = altars.length > 0
    ? altars.reduce((best, a) => (a.celestialWisdom > best.celestialWisdom ? a : best)).file : ''

  const stats: StellarPantheonResult['stats'] = {
    totalFiles: files.length, totalTemples: temples.length,
    avgDivineArchitecture, avgConstellationPrecision, avgSupernovaResilience, avgCosmicClarity, avgCelestialWisdom,
    stellarMasterpieceCount, divineConstellationCount, properStarCount, dimEmberCount, darkVoidCount, voidCount,
    hasHighArchitectureCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighClarityCount, hasHighWisdomCount,
    overallDivinity, deityGrade,
    bestAltar, mostArchitectural, mostPrecise, mostResilient, clearest, wisest,
    ...(selfReferencing ? { celebration: CELEBRATION_MESSAGE } : {}),
  }

  const recommendations = generateRecommendations(altars, temples, cosmos, stats)

  return {
    altars, temples, cosmos, stats, recommendations,
    ...(selfReferencing ? { celebration: CELEBRATION_MESSAGE } : {}),
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(altars, temples, cosmos, stats) */
export function generateRecommendations(
  altars: StellarAltar[],
  temples: StellarTemple[],
  cosmos: StellarPantheonResult['cosmos'],
  stats: StellarPantheonResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgDivineArchitecture >= 90 &&
    stats.avgConstellationPrecision >= 90 &&
    stats.avgSupernovaResilience >= 90 &&
    stats.avgCosmicClarity >= 90 &&
    stats.avgCelestialWisdom >= 90
  ) {
    recs.push(
      'Your stellar pantheon is a galactic temple of code! Divine architecture is galactic-temple, constellation precision is grand-constellation, supernova resilience is neutron-star, cosmic clarity is hubble-clarity, and celestial wisdom is cosmic-deity!',
    )
    return recs
  }

  if (stats.avgDivineArchitecture < 60) {
    recs.push(
      'Elevate divine architecture — the pantheon must stand as a galactic-temple; restructure monolithic code, improve modularity, and achieve galactic-temple architecture',
    )
  }

  if (stats.avgConstellationPrecision < 60) {
    recs.push(
      'Align constellation precision — every star must connect with exact fidelity; tighten types, eliminate unsafe patterns, and achieve grand-constellation precision',
    )
  }

  if (stats.avgSupernovaResilience < 60) {
    recs.push(
      'Forge supernova resilience — the code must survive the death of stars; add error handling, test thoroughly, and achieve neutron-star resilience',
    )
  }

  if (stats.avgCosmicClarity < 60) {
    recs.push(
      'Illuminate cosmic clarity — the void must be seen with hubble-clarity; improve readability, eliminate cryptic patterns, and achieve hubble-clarity vision',
    )
  }

  if (stats.avgCelestialWisdom < 60) {
    recs.push(
      'Deepen celestial wisdom — the cosmos must be understood at cosmic-deity level; build with principled architecture and achieve cosmic-deity wisdom',
    )
  }

  if (stats.overallDivinity < 40) {
    recs.push(
      'The pantheon has fallen into dark voids — dim embers outnumber the stellar masterpieces, and the cosmos grows cold',
    )
  }

  const voidAltars = altars.filter((a) => a.condition === 'void')
  if (voidAltars.length > 0 && voidAltars.length <= 5) {
    recs.push(`Remove these dark voids from the pantheon: ${voidAltars.map((a) => a.file).join(', ')}`)
  } else if (voidAltars.length > 5) {
    recs.push(`Remove ${voidAltars.length} dark voids from the pantheon before they consume the cosmos`)
  }

  const poorTemples = temples.filter((t) => t.condition === 'void' || t.condition === 'empty-field')
  if (poorTemples.length === temples.length && temples.length > 0) {
    recs.push('All temples are empty fields — the stellar pantheon needs stellar-palace quality altars throughout')
  }

  if (recs.length === 0) {
    recs.push('Your stellar pantheon shines with cosmic brilliance — every altar carries divine architecture, constellation precision, supernova resilience, cosmic clarity, and celestial wisdom')
  }

  return recs
}
