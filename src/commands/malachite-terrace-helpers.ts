// ─── Interfaces ──────────────────────────────────────────

export interface PatterningMeasure {
  pattern: number
  band: 'bullseye-pattern' | 'silky-bands' | 'proper-striations' | 'faint-lines' | 'solid-green' | 'no-pattern'
  hasHighPattern: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasOrganized: boolean
  hasNoSpaghetti: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasLayered: boolean
  hasRich: boolean
  hasDiverse: boolean
  hasVaried: boolean
  hasComplex: boolean
  hasIntricate: boolean
  hasDetailed: boolean
  chaoticCount: number
  spaghettiCount: number
}

export interface RevealingMeasure {
  clarity: number
  gem: 'chatoyant-malachite' | 'velvet-surface' | 'proper-luster' | 'dull-stone' | 'opaque-rock' | 'no-clarity'
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

export interface LayeringMeasure {
  precision: number
  cut: 'cabochon-perfect' | 'proper-slab' | 'thin-veneer' | 'rough-chunk' | 'raw-boulder' | 'no-precision'
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
  hasLayered: boolean
  hasStructured: boolean
  hasOrdered: boolean
  hasSystematic: boolean
  unsafeCount: number
  approximateCount: number
}

export interface HardeningMeasure {
  resilience: number
  copper: 'pure-carbonate' | 'proper-mineral' | 'good-hardness' | 'soft-stone' | 'crumbling-dust' | 'no-resilience'
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
  hasStrong: boolean
  hasTough: boolean
  hasSolid: boolean
  hasFirm: boolean
  unhandledCount: number
  untestedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  depth: 'geological-sage' | 'crystal-keeper' | 'proper-mineralogist' | 'rock-collector' | 'pebble-finder' | 'no-wisdom'
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
  hasNatural: boolean
  hasWise: boolean
  hasAncient: boolean
  hackedCount: number
  shallowCount: number
}

export type MalachiteCondition =
  | 'malachite-masterpiece'
  | 'emerald-band'
  | 'proper-malachite'
  | 'green-stone'
  | 'raw-mineral'
  | 'void'

export interface MalachiteBand {
  file: string
  verdantPattern: number
  gemClarity: number
  bandedPrecision: number
  copperResilience: number
  mineralWisdom: number
  patterning: PatterningMeasure
  revealing: RevealingMeasure
  layering: LayeringMeasure
  hardening: HardeningMeasure
  knowing: KnowingMeasure
  condition: MalachiteCondition
  qualityScore: number
}

export type PillarType =
  | 'hermitage-column'
  | 'grand-pillar'
  | 'proper-column'
  | 'stone-post'
  | 'wooden-stick'
  | 'no-pillar'

export type PillarCondition =
  | 'malachite-palace'
  | 'green-hall'
  | 'proper-terrace'
  | 'stone-patio'
  | 'dirt-yard'
  | 'void'

export type ArtisanGrade = 'master-lapidary' | 'expert-gem-cutter' | 'proper-mason' | 'apprentice' | 'novice' | 'stone-breaker'

export interface MalachitePillar {
  directory: string
  bands: MalachiteBand[]
  avgPattern: number
  avgPrecision: number
  avgWisdom: number
  malachiteMasterpieceCount: number
  voidCount: number
  pillarType: PillarType
  condition: PillarCondition
}

export interface MalachiteTerraceResult {
  bands: MalachiteBand[]
  pillars: MalachitePillar[]
  gallery: {
    avgPattern: number
    avgPrecision: number
    avgWisdom: number
    isMalachite: boolean
    overallBeauty: number
  }
  stats: {
    totalFiles: number
    totalPillars: number
    avgVerdantPattern: number
    avgGemClarity: number
    avgBandedPrecision: number
    avgCopperResilience: number
    avgMineralWisdom: number
    malachiteMasterpieceCount: number
    emeraldBandCount: number
    properMalachiteCount: number
    greenStoneCount: number
    rawMineralCount: number
    voidCount: number
    hasHighPatternCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallBeauty: number
    artisanGrade: ArtisanGrade
    bestBand: string
    mostPatterned: string
    clearest: string
    mostPrecise: string
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

/** @example classifyMalachiteCondition(90) */
export function classifyMalachiteCondition(score: number): MalachiteCondition {
  if (score >= 90) return 'malachite-masterpiece'
  if (score >= 75) return 'emerald-band'
  if (score >= 60) return 'proper-malachite'
  if (score >= 40) return 'green-stone'
  if (score >= 20) return 'raw-mineral'
  return 'void'
}

/** @example classifyPillarType(bands) */
export function classifyPillarType(bands: MalachiteBand[]): PillarType {
  if (bands.length === 0) return 'no-pillar'
  const avg = bands.reduce((s, b) => s + b.qualityScore, 0) / bands.length
  if (avg >= 85) return 'hermitage-column'
  if (avg >= 70) return 'grand-pillar'
  if (avg >= 55) return 'proper-column'
  if (avg >= 35) return 'stone-post'
  return 'wooden-stick'
}

/** @example classifyPillarCondition(85) */
export function classifyPillarCondition(score: number): PillarCondition {
  if (score >= 85) return 'malachite-palace'
  if (score >= 70) return 'green-hall'
  if (score >= 55) return 'proper-terrace'
  if (score >= 35) return 'stone-patio'
  if (score >= 15) return 'dirt-yard'
  return 'void'
}

/** @example classifyArtisanGrade(80) */
export function classifyArtisanGrade(avgBeauty: number): ArtisanGrade {
  if (avgBeauty >= 80) return 'master-lapidary'
  if (avgBeauty >= 65) return 'expert-gem-cutter'
  if (avgBeauty >= 50) return 'proper-mason'
  if (avgBeauty >= 35) return 'apprentice'
  if (avgBeauty >= 20) return 'novice'
  return 'stone-breaker'
}

// ─── Measure functions ──────────────────────────────────

/** @example measurePatterning('export class X { readonly y: string }') */
export function measurePatterning(content: string): PatterningMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasOrganized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|entangled|knotted)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasNoMonolithic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLayered = /\b(readonly|private|protected)\b/.test(content)
  const hasRich = /\b(async|await|Promise)\b/.test(content)
  const hasDiverse = !/\bany\b/.test(content)
  const hasVaried = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasComplex = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasIntricate = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDetailed = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasOrganized, hasNoSpaghetti, hasModular,
    hasNoMonolithic, hasLayered, hasRich, hasDiverse, hasVaried,
    hasComplex, hasIntricate, hasDetailed,
  ]

  const pattern = computeScore(positiveBooleans)
  const hasHighPattern = pattern >= 60

  let band: PatterningMeasure['band'] = 'no-pattern'
  if (pattern >= 90) band = 'bullseye-pattern'
  else if (pattern >= 75) band = 'silky-bands'
  else if (pattern >= 60) band = 'proper-striations'
  else if (pattern >= 40) band = 'faint-lines'
  else if (pattern >= 20) band = 'solid-green'

  return {
    pattern, band, hasHighPattern,
    hasWellStructured, hasNoChaotic, hasOrganized, hasNoSpaghetti, hasModular,
    hasNoMonolithic, hasLayered, hasRich, hasDiverse, hasVaried,
    hasComplex, hasIntricate, hasDetailed,
    chaoticCount, spaghettiCount,
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

  let gem: RevealingMeasure['gem'] = 'no-clarity'
  if (clarity >= 90) gem = 'chatoyant-malachite'
  else if (clarity >= 75) gem = 'velvet-surface'
  else if (clarity >= 60) gem = 'proper-luster'
  else if (clarity >= 40) gem = 'dull-stone'
  else if (clarity >= 20) gem = 'opaque-rock'

  return {
    clarity, gem, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
    crypticCount, mysteryCount,
  }
}

/** @example measureLayering('export class X { readonly y: string }') */
export function measureLayering(content: string): LayeringMeasure {
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
  const hasLayered = /\b(async|await|Promise)\b/.test(content)
  const hasStructured = /\b(try|catch|if)\b/.test(content)
  const hasOrdered = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasSystematic = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasLayered, hasStructured, hasOrdered, hasSystematic,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: LayeringMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'cabochon-perfect'
  else if (precision >= 75) cut = 'proper-slab'
  else if (precision >= 60) cut = 'thin-veneer'
  else if (precision >= 40) cut = 'rough-chunk'
  else if (precision >= 20) cut = 'raw-boulder'

  return {
    precision, cut, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasLayered, hasStructured, hasOrdered, hasSystematic,
    unsafeCount, approximateCount,
  }
}

/** @example measureHardening('export class X { readonly y: string }') */
export function measureHardening(content: string): HardeningMeasure {
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
  const hasStrong = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTough = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSolid = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFirm = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasHardened, hasEnduring,
    hasStrong, hasTough, hasSolid, hasFirm,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let copper: HardeningMeasure['copper'] = 'no-resilience'
  if (resilience >= 90) copper = 'pure-carbonate'
  else if (resilience >= 75) copper = 'proper-mineral'
  else if (resilience >= 60) copper = 'good-hardness'
  else if (resilience >= 40) copper = 'soft-stone'
  else if (resilience >= 20) copper = 'crumbling-dust'

  return {
    resilience, copper, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasHardened, hasEnduring,
    hasStrong, hasTough, hasSolid, hasFirm,
    unhandledCount, untestedCount,
  }
}

/** @example measureKnowing('export class X { readonly y: string }') */
export function measureKnowing(content: string): KnowingMeasure {
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
  const hasNatural = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAncient = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasNatural, hasWise, hasAncient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let depth: KnowingMeasure['depth'] = 'no-wisdom'
  if (wisdom >= 90) depth = 'geological-sage'
  else if (wisdom >= 75) depth = 'crystal-keeper'
  else if (wisdom >= 60) depth = 'proper-mineralogist'
  else if (wisdom >= 40) depth = 'rock-collector'
  else if (wisdom >= 20) depth = 'pebble-finder'

  return {
    wisdom, depth, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasNatural, hasWise, hasAncient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeMalachiteBand(content, 'app.ts') */
export function analyzeMalachiteBand(content: string, filePath: string): MalachiteBand {
  const patterning = measurePatterning(content)
  const revealing = measureRevealing(content)
  const layering = measureLayering(content)
  const hardening = measureHardening(content)
  const knowing = measureKnowing(content)

  const verdantPattern = patterning.pattern
  const gemClarity = revealing.clarity
  const bandedPrecision = layering.precision
  const copperResilience = hardening.resilience
  const mineralWisdom = knowing.wisdom

  const qualityScore = Math.round(
    verdantPattern * 0.2 +
    gemClarity * 0.2 +
    bandedPrecision * 0.2 +
    copperResilience * 0.2 +
    mineralWisdom * 0.2,
  )

  const condition = classifyMalachiteCondition(qualityScore)

  return {
    file: filePath,
    verdantPattern, gemClarity, bandedPrecision, copperResilience, mineralWisdom,
    patterning, revealing, layering, hardening, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeMalachitePillar(bands, 'src') */
export function analyzeMalachitePillar(bands: MalachiteBand[], dirPath: string): MalachitePillar {
  if (bands.length === 0) {
    return {
      directory: dirPath, bands: [],
      avgPattern: 0, avgPrecision: 0, avgWisdom: 0,
      malachiteMasterpieceCount: 0, voidCount: 0,
      pillarType: 'no-pillar', condition: 'void',
    }
  }

  const avgPattern = Math.round(bands.reduce((s, b) => s + b.verdantPattern, 0) / bands.length)
  const avgPrecision = Math.round(bands.reduce((s, b) => s + b.bandedPrecision, 0) / bands.length)
  const avgWisdom = Math.round(bands.reduce((s, b) => s + b.mineralWisdom, 0) / bands.length)
  const malachiteMasterpieceCount = bands.filter((b) => b.condition === 'malachite-masterpiece').length
  const voidCount = bands.filter((b) => b.condition === 'void').length
  const pillarType = classifyPillarType(bands)
  const avgQuality = Math.round(bands.reduce((s, b) => s + b.qualityScore, 0) / bands.length)
  const condition = classifyPillarCondition(avgQuality)

  return {
    directory: dirPath, bands,
    avgPattern, avgPrecision, avgWisdom,
    malachiteMasterpieceCount, voidCount,
    pillarType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildMalachiteTerraceResult(['a.ts'], [content]) */
export async function buildMalachiteTerraceResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MalachiteTerraceResult> {
  const bands: MalachiteBand[] = files.map((file, i) =>
    analyzeMalachiteBand(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, MalachiteBand[]>()
  for (const band of bands) {
    const dir = band.file.includes('/')
      ? band.file.substring(0, band.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(band)
    } else {
      dirMap.set(dir, [band])
    }
  }

  const pillars: MalachitePillar[] = Array.from(dirMap.entries()).map(([dir, dirBands]) =>
    analyzeMalachitePillar(dirBands, dir),
  )

  const avgVerdantPattern = bands.length > 0
    ? Math.round(bands.reduce((s, b) => s + b.verdantPattern, 0) / bands.length) : 0
  const avgGemClarity = bands.length > 0
    ? Math.round(bands.reduce((s, b) => s + b.gemClarity, 0) / bands.length) : 0
  const avgBandedPrecision = bands.length > 0
    ? Math.round(bands.reduce((s, b) => s + b.bandedPrecision, 0) / bands.length) : 0
  const avgCopperResilience = bands.length > 0
    ? Math.round(bands.reduce((s, b) => s + b.copperResilience, 0) / bands.length) : 0
  const avgMineralWisdom = bands.length > 0
    ? Math.round(bands.reduce((s, b) => s + b.mineralWisdom, 0) / bands.length) : 0

  const overallBeauty = bands.length > 0
    ? Math.round(bands.reduce((s, b) => s + b.qualityScore, 0) / bands.length) : 0
  const isMalachite = overallBeauty >= 60

  const gallery: MalachiteTerraceResult['gallery'] = {
    avgPattern: avgVerdantPattern, avgPrecision: avgBandedPrecision, avgWisdom: avgMineralWisdom,
    isMalachite, overallBeauty,
  }

  const malachiteMasterpieceCount = bands.filter((b) => b.condition === 'malachite-masterpiece').length
  const emeraldBandCount = bands.filter((b) => b.condition === 'emerald-band').length
  const properMalachiteCount = bands.filter((b) => b.condition === 'proper-malachite').length
  const greenStoneCount = bands.filter((b) => b.condition === 'green-stone').length
  const rawMineralCount = bands.filter((b) => b.condition === 'raw-mineral').length
  const voidCount = bands.filter((b) => b.condition === 'void').length

  const hasHighPatternCount = bands.filter((b) => b.patterning.hasHighPattern).length
  const hasHighClarityCount = bands.filter((b) => b.revealing.hasHighClarity).length
  const hasHighPrecisionCount = bands.filter((b) => b.layering.hasHighPrecision).length
  const hasHighResilienceCount = bands.filter((b) => b.hardening.hasHighResilience).length
  const hasHighWisdomCount = bands.filter((b) => b.knowing.hasHighWisdom).length

  const artisanGrade = classifyArtisanGrade(overallBeauty)

  const bestBand = bands.length > 0
    ? bands.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file : ''
  const mostPatterned = bands.length > 0
    ? bands.reduce((best, b) => (b.verdantPattern > best.verdantPattern ? b : best)).file : ''
  const clearest = bands.length > 0
    ? bands.reduce((best, b) => (b.gemClarity > best.gemClarity ? b : best)).file : ''
  const mostPrecise = bands.length > 0
    ? bands.reduce((best, b) => (b.bandedPrecision > best.bandedPrecision ? b : best)).file : ''
  const mostResilient = bands.length > 0
    ? bands.reduce((best, b) => (b.copperResilience > best.copperResilience ? b : best)).file : ''
  const wisest = bands.length > 0
    ? bands.reduce((best, b) => (b.mineralWisdom > best.mineralWisdom ? b : best)).file : ''

  const stats: MalachiteTerraceResult['stats'] = {
    totalFiles: files.length, totalPillars: pillars.length,
    avgVerdantPattern, avgGemClarity, avgBandedPrecision, avgCopperResilience, avgMineralWisdom,
    malachiteMasterpieceCount, emeraldBandCount, properMalachiteCount, greenStoneCount, rawMineralCount, voidCount,
    hasHighPatternCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallBeauty, artisanGrade,
    bestBand, mostPatterned, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(bands, pillars, gallery, stats)

  return {
    bands, pillars, gallery, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(bands, pillars, gallery, stats) */
export function generateRecommendations(
  bands: MalachiteBand[],
  pillars: MalachitePillar[],
  gallery: MalachiteTerraceResult['gallery'],
  stats: MalachiteTerraceResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgVerdantPattern >= 90 &&
    stats.avgGemClarity >= 90 &&
    stats.avgBandedPrecision >= 90 &&
    stats.avgCopperResilience >= 90 &&
    stats.avgMineralWisdom >= 90
  ) {
    recs.push(
      'Your malachite terrace is a malachite masterpiece! Verdant pattern is bullseye-pattern, gem clarity is chatoyant-malachite, banded precision is cabochon-perfect, copper resilience is pure-carbonate, and mineral wisdom is geological-sage!',
    )
    return recs
  }

  if (stats.avgVerdantPattern < 60) {
    recs.push(
      'Enrich verdant patterns — the malachite must show bullseye-pattern banding; restructure chaotic code, improve modularity, and achieve bullseye-pattern richness',
    )
  }

  if (stats.avgGemClarity < 60) {
    recs.push(
      'Polish gem clarity — the malachite must gleam with chatoyant luster; improve readability, eliminate cryptic patterns, and achieve chatoyant-malachite clarity',
    )
  }

  if (stats.avgBandedPrecision < 60) {
    recs.push(
      'Sharpen banded precision — each layer must be cabochon-perfect; tighten types, eliminate unsafe patterns, and achieve cabochon-perfect precision',
    )
  }

  if (stats.avgCopperResilience < 60) {
    recs.push(
      'Harden copper resilience — the malachite must be pure-carbonate strength; add error handling, test thoroughly, and achieve pure-carbonate resilience',
    )
  }

  if (stats.avgMineralWisdom < 60) {
    recs.push(
      'Deepen mineral wisdom — the stone must carry geological-sage knowledge; build with principled architecture and achieve geological-sage wisdom',
    )
  }

  if (stats.overallBeauty < 40) {
    recs.push(
      'The terrace has crumbled — raw minerals and green stones outnumber the malachite masterpieces, and the gallery lies in ruins',
    )
  }

  const voidBands = bands.filter((b) => b.condition === 'void')
  if (voidBands.length > 0 && voidBands.length <= 5) {
    recs.push(`Remove these raw minerals from the terrace: ${voidBands.map((b) => b.file).join(', ')}`)
  } else if (voidBands.length > 5) {
    recs.push(`Remove ${voidBands.length} raw minerals from the terrace before they crack the foundation`)
  }

  const poorPillars = pillars.filter((p) => p.condition === 'void' || p.condition === 'dirt-yard')
  if (poorPillars.length === pillars.length && pillars.length > 0) {
    recs.push('All pillars are dirt yards — the malachite terrace needs malachite-palace quality bands throughout')
  }

  if (recs.length === 0) {
    recs.push('Your malachite terrace gleams with verdant beauty — every band carries verdant patterns, gem clarity, banded precision, copper resilience, and mineral wisdom')
  }

  return recs
}
