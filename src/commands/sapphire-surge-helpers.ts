// ─── Interfaces ──────────────────────────────────────────

export interface DivingMeasure {
  depth: number
  gem: 'abyssal-sapphire' | 'deep-blue' | 'proper-gem' | 'shallow-pool' | 'puddle' | 'no-depth'
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasProven: boolean
  hasPrincipled: boolean
  hasComprehensive: boolean
  hasLayered: boolean
  hasNuanced: boolean
  hasProfound: boolean
  hasRich: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasThorough: boolean
  hackedCount: number
  shallowCount: number
}

export interface PulsingMeasure {
  rhythm: number
  tide: 'perfect-tide' | 'steady-rhythm' | 'proper-pulse' | 'irregular-current' | 'stagnant' | 'no-rhythm'
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPredictable: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasReliable: boolean
  hasUniform: boolean
  hasStable: boolean
  hasDependable: boolean
  hasRhythmic: boolean
  hasHarmonious: boolean
  hasMeasured: boolean
  hasCalibrated: boolean
  hasDisciplined: boolean
  hasPrecise: boolean
  erraticCount: number
  untestedCount: number
}

export interface CleansingMeasure {
  purity: number
  wave: 'crystal-clear' | 'clean-surf' | 'proper-water' | 'murky-swell' | 'polluted' | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasClean: boolean
  hasHonest: boolean
  hasFaithful: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasNoiseFree: boolean
  hasUndistorted: boolean
  hasPure: boolean
  hasDistilled: boolean
  hasCrystalline: boolean
  unsafeCount: number
  approximateCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  ocean: 'ancient-sea' | 'wise-depths' | 'proper-current' | 'shallow-bay' | 'dried-lake' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasEvolved: boolean
  hasAdaptive: boolean
  hasEnduring: boolean
  hasConnected: boolean
  hasHolistic: boolean
  hasPatterned: boolean
  hasExperienced: boolean
  hasLearned: boolean
  hasReflective: boolean
  hasVisionary: boolean
  hasMature: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hasTimeless: boolean
  naiveCount: number
  rigidCount: number
}

export interface EnduringMeasure {
  resilience: number
  shore: 'granite-cliff' | 'coral-reef' | 'proper-coast' | 'sand-beach' | 'mud-flat' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasImpervious: boolean
  hasUnyielding: boolean
  hasPersistent: boolean
  hasEnduring: boolean
  hasRelentless: boolean
  hasPatient: boolean
  hasResolute: boolean
  hasSteadfast: boolean
  unhandledCount: number
  vulnerableCount: number
}

export type WaveCondition =
  | 'sapphire-masterpiece'
  | 'ocean-perfection'
  | 'proper-tide'
  | 'murky-current'
  | 'stagnant-pool'
  | 'void'

export interface SapphireWave {
  file: string
  gemDepth: number
  tidalRhythm: number
  wavePurity: number
  oceanWisdom: number
  tideResilience: number
  diving: DivingMeasure
  pulsing: PulsingMeasure
  cleansing: CleansingMeasure
  accumulating: AccumulatingMeasure
  enduring: EnduringMeasure
  condition: WaveCondition
  qualityScore: number
  celebration?: string
}

export type OceanType =
  | 'deep-abyss'
  | 'continental-shelf'
  | 'proper-sea'
  | 'coastal-water'
  | 'puddle'
  | 'no-ocean'

export type OceanCondition =
  | 'sapphire-palace'
  | 'ocean-floor'
  | 'proper-depths'
  | 'shallow-reef'
  | 'dry-dock'
  | 'void'

export interface SapphireOcean {
  directory: string
  waves: SapphireWave[]
  avgDepth: number
  avgRhythm: number
  avgWisdom: number
  sapphireMasterpieceCount: number
  voidCount: number
  oceanType: OceanType
  condition: OceanCondition
}

export type CaptainGrade = 'admiral-of-the-fleet' | 'sea-captain' | 'navigator' | 'apprentice' | 'novice' | 'landlubber'

export interface SapphireTideResult {
  waves: SapphireWave[]
  oceans: SapphireOcean[]
  sea: {
    avgDepth: number
    avgRhythm: number
    avgWisdom: number
    isSapphire: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalOceans: number
    avgGemDepth: number
    avgTidalRhythm: number
    avgWavePurity: number
    avgOceanWisdom: number
    avgTideResilience: number
    sapphireMasterpieceCount: number
    oceanPerfectionCount: number
    properTideCount: number
    murkyCurrentCount: number
    stagnantPoolCount: number
    voidCount: number
    hasHighDepthCount: number
    hasHighRhythmCount: number
    hasHighPurityCount: number
    hasHighWisdomCount: number
    hasHighResilienceCount: number
    overallDepth: number
    captainGrade: CaptainGrade
    bestWave: string
    deepest: string
    mostRhythmic: string
    purest: string
    wisest: string
    mostResilient: string
    celebration?: string
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

/** @example classifyWaveCondition(90) */
export function classifyWaveCondition(score: number): WaveCondition {
  if (score >= 90) return 'sapphire-masterpiece'
  if (score >= 75) return 'ocean-perfection'
  if (score >= 60) return 'proper-tide'
  if (score >= 40) return 'murky-current'
  if (score >= 20) return 'stagnant-pool'
  return 'void'
}

/** @example classifyOceanType(waves) */
export function classifyOceanType(waves: SapphireWave[]): OceanType {
  if (waves.length === 0) return 'no-ocean'
  const avg = waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length
  if (avg >= 85) return 'deep-abyss'
  if (avg >= 70) return 'continental-shelf'
  if (avg >= 55) return 'proper-sea'
  if (avg >= 35) return 'coastal-water'
  return 'puddle'
}

/** @example classifyOceanCondition(85) */
export function classifyOceanCondition(score: number): OceanCondition {
  if (score >= 85) return 'sapphire-palace'
  if (score >= 70) return 'ocean-floor'
  if (score >= 55) return 'proper-depths'
  if (score >= 35) return 'shallow-reef'
  if (score >= 15) return 'dry-dock'
  return 'void'
}

/** @example classifyCaptainGrade(80) */
export function classifyCaptainGrade(avgDepth: number): CaptainGrade {
  if (avgDepth >= 80) return 'admiral-of-the-fleet'
  if (avgDepth >= 65) return 'sea-captain'
  if (avgDepth >= 50) return 'navigator'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'landlubber'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDiving('class X { readonly y: string }') */
export function measureDiving(content: string): DivingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length
  const hasNoShallow = shallowCount === 0
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasPrincipled = !/\bany\b/.test(content)
  const hasComprehensive = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasLayered = /\b(import|export)\b/.test(content)
  const hasNuanced = /\b(readonly|private|protected)\b/.test(content)
  const hasProfound = /\b(async|await|Promise)\b/.test(content)
  const hasRich = /\b(function|=>|return)\b/.test(content)
  const hasMature = /\b(const|readonly)\b/.test(content)
  const hasInsightful = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasStrategic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasThorough = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasDeep, hasNoShallow, hasProven,
    hasPrincipled, hasComprehensive, hasLayered, hasNuanced, hasProfound,
    hasRich, hasMature, hasInsightful, hasStrategic, hasThorough,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let gem: DivingMeasure['gem'] = 'no-depth'
  if (depth >= 90) gem = 'abyssal-sapphire'
  else if (depth >= 75) gem = 'deep-blue'
  else if (depth >= 60) gem = 'proper-gem'
  else if (depth >= 40) gem = 'shallow-pool'
  else if (depth >= 20) gem = 'puddle'

  return {
    depth, gem, hasHighDepth,
    hasWellArchitected, hasNoHacked, hasDeep, hasNoShallow, hasProven,
    hasPrincipled, hasComprehensive, hasLayered, hasNuanced, hasProfound,
    hasRich, hasMature, hasInsightful, hasStrategic, hasThorough,
    hackedCount, shallowCount,
  }
}

/** @example measurePulsing('try { x } catch { y }') */
export function measurePulsing(content: string): PulsingMeasure {
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const erraticCount = (content.match(/\b(erratic|unpredictable|random|flaky)\b/gi) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasPredictable = /\b(const|readonly)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasReliable = !/\bany\b/.test(content)
  const hasUniform = /\b(readonly|private|protected)\b/.test(content)
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const hasDependable = /\b(import|export)\b/.test(content)
  const hasRhythmic = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = /\b(function|=>|return)\b/.test(content)
  const hasMeasured = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCalibrated = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasDisciplined = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPrecise = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasConsistent, hasNoErratic, hasPredictable, hasTested, hasNoUntested,
    hasReliable, hasUniform, hasStable, hasDependable, hasRhythmic,
    hasHarmonious, hasMeasured, hasCalibrated, hasDisciplined, hasPrecise,
  ]

  const rhythm = computeScore(positiveBooleans)
  const hasHighRhythm = rhythm >= 60

  let tide: PulsingMeasure['tide'] = 'no-rhythm'
  if (rhythm >= 90) tide = 'perfect-tide'
  else if (rhythm >= 75) tide = 'steady-rhythm'
  else if (rhythm >= 60) tide = 'proper-pulse'
  else if (rhythm >= 40) tide = 'irregular-current'
  else if (rhythm >= 20) tide = 'stagnant'

  return {
    rhythm, tide, hasHighRhythm,
    hasConsistent, hasNoErratic, hasPredictable, hasTested, hasNoUntested,
    hasReliable, hasUniform, hasStable, hasDependable, hasRhythmic,
    hasHarmonious, hasMeasured, hasCalibrated, hasDisciplined, hasPrecise,
    erraticCount, untestedCount,
  }
}

/** @example measureCleansing('const x: string = "ok"') */
export function measureCleansing(content: string): CleansingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\b(unsafe|any)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = !/\bany\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|guess|hack)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHonest = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasFaithful = /\b(import|export)\b/.test(content)
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /\b(async|await|Promise)\b/.test(content)
  const hasNoiseFree = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUndistorted = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPure = /\b(function|=>|return)\b/.test(content)
  const hasDistilled = /\b(const|readonly)\b/.test(content)
  const hasCrystalline = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasClean,
    hasHonest, hasFaithful, hasExact, hasPrecise, hasRefined,
    hasPolished, hasNoiseFree, hasUndistorted, hasPure, hasDistilled,
    hasCrystalline,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let wave: CleansingMeasure['wave'] = 'no-purity'
  if (purity >= 90) wave = 'crystal-clear'
  else if (purity >= 75) wave = 'clean-surf'
  else if (purity >= 60) wave = 'proper-water'
  else if (purity >= 40) wave = 'murky-swell'
  else if (purity >= 20) wave = 'polluted'

  return {
    purity, wave, hasHighPurity,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasClean,
    hasHonest, hasFaithful, hasExact, hasPrecise, hasRefined,
    hasPolished, hasNoiseFree, hasUndistorted, hasPure, hasDistilled,
    hasCrystalline,
    unsafeCount, approximateCount,
  }
}

/** @example measureAccumulating('export class X { readonly y: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasAdaptive = /\b(function|=>|return)\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasConnected = /\b(import|export)\b/.test(content)
  const hasHolistic = /\b(try|catch|if)\b/.test(content)
  const hasPatterned = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExperienced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasLearned = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasReflective = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasVisionary = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasMature = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasWise = !/\bany\b/.test(content)
  const hasAccumulated = /\b(const|readonly)\b/.test(content)
  const hasTimeless = /\b(throw|return)\b/.test(content)
  const naiveCount = (content.match(/\b(naive|simple|basic)\b/gi) ?? []).length
  const rigidCount = (content.match(/\b(rigid|inflexible|brittle)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasEvolved, hasAdaptive, hasEnduring, hasConnected,
    hasHolistic, hasPatterned, hasExperienced, hasLearned, hasReflective,
    hasVisionary, hasMature, hasWise, hasAccumulated, hasTimeless,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let ocean: AccumulatingMeasure['ocean'] = 'no-wisdom'
  if (wisdom >= 90) ocean = 'ancient-sea'
  else if (wisdom >= 75) ocean = 'wise-depths'
  else if (wisdom >= 60) ocean = 'proper-current'
  else if (wisdom >= 40) ocean = 'shallow-bay'
  else if (wisdom >= 20) ocean = 'dried-lake'

  return {
    wisdom, ocean, hasHighWisdom,
    hasWellArchitected, hasEvolved, hasAdaptive, hasEnduring, hasConnected,
    hasHolistic, hasPatterned, hasExperienced, hasLearned, hasReflective,
    hasVisionary, hasMature, hasWise, hasAccumulated, hasTimeless,
    naiveCount, rigidCount,
  }
}

/** @example measureEnduring('try { x } catch(e) { throw e }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|unchecked|bare)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasReinforced = /\b(class|interface|type)\b/.test(content)
  const hasImpervious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnyielding = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPersistent = /\b(import|export)\b/.test(content)
  const hasEnduring = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasRelentless = /\b(function|=>|return)\b/.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasResolute = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSteadfast = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const vulnerableCount = (content.match(/\b(vulnerable|fragile|weak)\b/gi) ?? []).length

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasStable,
    hasHardened, hasReinforced, hasImpervious, hasUnyielding, hasPersistent,
    hasEnduring, hasRelentless, hasPatient, hasResolute, hasSteadfast,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shore: EnduringMeasure['shore'] = 'no-resilience'
  if (resilience >= 90) shore = 'granite-cliff'
  else if (resilience >= 75) shore = 'coral-reef'
  else if (resilience >= 60) shore = 'proper-coast'
  else if (resilience >= 40) shore = 'sand-beach'
  else if (resilience >= 20) shore = 'mud-flat'

  return {
    resilience, shore, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasStable,
    hasHardened, hasReinforced, hasImpervious, hasUnyielding, hasPersistent,
    hasEnduring, hasRelentless, hasPatient, hasResolute, hasSteadfast,
    unhandledCount, vulnerableCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeSapphireWave(content, 'app.ts') */
export function analyzeSapphireWave(content: string, filePath: string): SapphireWave {
  const diving = measureDiving(content)
  const pulsing = measurePulsing(content)
  const cleansing = measureCleansing(content)
  const accumulating = measureAccumulating(content)
  const enduring = measureEnduring(content)

  const gemDepth = diving.depth
  const tidalRhythm = pulsing.rhythm
  const wavePurity = cleansing.purity
  const oceanWisdom = accumulating.wisdom
  const tideResilience = enduring.resilience

  const qualityScore = Math.round(
    gemDepth * 0.2 +
    tidalRhythm * 0.2 +
    wavePurity * 0.2 +
    oceanWisdom * 0.2 +
    tideResilience * 0.2,
  )

  const condition = classifyWaveCondition(qualityScore)

  const celebration =
    filePath.includes('sapphire-tide') ||
    filePath.includes('sapphire-surge') ||
    filePath.includes('ocean-gem')
      ? '★ Milestone #610 — Sapphire Tide ★'
      : undefined

  return {
    file: filePath,
    gemDepth, tidalRhythm, wavePurity, oceanWisdom, tideResilience,
    diving, pulsing, cleansing, accumulating, enduring,
    condition, qualityScore, celebration,
  }
}

/** @example analyzeSapphireOcean(waves, 'src') */
export function analyzeSapphireOcean(waves: SapphireWave[], dirPath: string): SapphireOcean {
  if (waves.length === 0) {
    return {
      directory: dirPath, waves: [],
      avgDepth: 0, avgRhythm: 0, avgWisdom: 0,
      sapphireMasterpieceCount: 0, voidCount: 0,
      oceanType: 'no-ocean', condition: 'void',
    }
  }

  const avgDepth = Math.round(waves.reduce((s, w) => s + w.gemDepth, 0) / waves.length)
  const avgRhythm = Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
  const avgWisdom = Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length)
  const sapphireMasterpieceCount = waves.filter((w) => w.condition === 'sapphire-masterpiece').length
  const voidCount = waves.filter((w) => w.condition === 'void').length
  const oceanType = classifyOceanType(waves)
  const avgQuality = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
  const condition = classifyOceanCondition(avgQuality)

  return {
    directory: dirPath, waves,
    avgDepth, avgRhythm, avgWisdom,
    sapphireMasterpieceCount, voidCount,
    oceanType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSapphireTideResult(['a.ts'], [content]) */
export async function buildSapphireTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireTideResult> {
  const waves: SapphireWave[] = files.map((file, i) =>
    analyzeSapphireWave(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SapphireWave[]>()
  for (const wave of waves) {
    const dir = wave.file.includes('/')
      ? wave.file.substring(0, wave.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(wave)
    } else {
      dirMap.set(dir, [wave])
    }
  }

  const oceans: SapphireOcean[] = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeSapphireOcean(dirWaves, dir),
  )

  const avgGemDepth = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.gemDepth, 0) / waves.length) : 0
  const avgTidalRhythm = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length) : 0
  const avgWavePurity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.wavePurity, 0) / waves.length) : 0
  const avgOceanWisdom = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length) : 0
  const avgTideResilience = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tideResilience, 0) / waves.length) : 0

  const overallDepth = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length) : 0
  const isSapphire = overallDepth >= 60

  const sea = { avgDepth: avgGemDepth, avgRhythm: avgTidalRhythm, avgWisdom: avgOceanWisdom, isSapphire, overallDepth }

  const sapphireMasterpieceCount = waves.filter((w) => w.condition === 'sapphire-masterpiece').length
  const oceanPerfectionCount = waves.filter((w) => w.condition === 'ocean-perfection').length
  const properTideCount = waves.filter((w) => w.condition === 'proper-tide').length
  const murkyCurrentCount = waves.filter((w) => w.condition === 'murky-current').length
  const stagnantPoolCount = waves.filter((w) => w.condition === 'stagnant-pool').length
  const voidCount = waves.filter((w) => w.condition === 'void').length

  const hasHighDepthCount = waves.filter((w) => w.diving.hasHighDepth).length
  const hasHighRhythmCount = waves.filter((w) => w.pulsing.hasHighRhythm).length
  const hasHighPurityCount = waves.filter((w) => w.cleansing.hasHighPurity).length
  const hasHighWisdomCount = waves.filter((w) => w.accumulating.hasHighWisdom).length
  const hasHighResilienceCount = waves.filter((w) => w.enduring.hasHighResilience).length

  const captainGrade = classifyCaptainGrade(overallDepth)

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => (w.qualityScore > best.qualityScore ? w : best)).file : ''
  const deepest = waves.length > 0
    ? waves.reduce((best, w) => (w.gemDepth > best.gemDepth ? w : best)).file : ''
  const mostRhythmic = waves.length > 0
    ? waves.reduce((best, w) => (w.tidalRhythm > best.tidalRhythm ? w : best)).file : ''
  const purest = waves.length > 0
    ? waves.reduce((best, w) => (w.wavePurity > best.wavePurity ? w : best)).file : ''
  const wisest = waves.length > 0
    ? waves.reduce((best, w) => (w.oceanWisdom > best.oceanWisdom ? w : best)).file : ''
  const mostResilient = waves.length > 0
    ? waves.reduce((best, w) => (w.tideResilience > best.tideResilience ? w : best)).file : ''

  const hasCelebration = waves.some((w) => w.celebration)
  const celebration = hasCelebration
    ? '★ Milestone #610 — 610 commands flowing like the eternal tide ★'
    : undefined

  const stats: SapphireTideResult['stats'] = {
    totalFiles: files.length, totalOceans: oceans.length,
    avgGemDepth, avgTidalRhythm, avgWavePurity, avgOceanWisdom, avgTideResilience,
    sapphireMasterpieceCount, oceanPerfectionCount, properTideCount, murkyCurrentCount, stagnantPoolCount, voidCount,
    hasHighDepthCount, hasHighRhythmCount, hasHighPurityCount, hasHighWisdomCount, hasHighResilienceCount,
    overallDepth, captainGrade, celebration,
    bestWave, deepest, mostRhythmic, purest, wisest, mostResilient,
  }

  const recommendations = generateRecommendations(waves, oceans, sea, stats)

  return { waves, oceans, sea, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(waves, oceans, sea, stats) */
export function generateRecommendations(
  waves: SapphireWave[],
  oceans: SapphireOcean[],
  sea: SapphireTideResult['sea'],
  stats: SapphireTideResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGemDepth >= 90 &&
    stats.avgTidalRhythm >= 90 &&
    stats.avgWavePurity >= 90 &&
    stats.avgOceanWisdom >= 90 &&
    stats.avgTideResilience >= 90
  ) {
    recs.push(
      'Your sapphire tide is a masterpiece of oceanic power! Every wave carries gem-like depth, perfect tidal rhythm, crystalline purity, ancient wisdom, and granite resilience against the fiercest storm!',
    )
    return recs
  }

  if (stats.avgGemDepth < 60) {
    recs.push(
      'Deepen the sapphire waters — your code needs more architectural depth, proven patterns, and principled design to match the abyss',
    )
  }

  if (stats.avgTidalRhythm < 60) {
    recs.push(
      'Smooth the tidal rhythm — the ocean moves with clockwork precision; your code needs consistent patterns, reliable tests, and disciplined structure',
    )
  }

  if (stats.avgWavePurity < 60) {
    recs.push(
      'Cleanse the wave purity — sapphire waters are crystal clear; eliminate unsafe types, approximate logic, and code smells',
    )
  }

  if (stats.avgOceanWisdom < 60) {
    recs.push(
      'Cultivate ocean wisdom — the deep sea has learned over eons; your code should be well-architected, evolved, and built on proven patterns',
    )
  }

  if (stats.avgTideResilience < 60) {
    recs.push(
      'Fortify the tide resilience — granite cliffs withstand centuries of waves; your code needs error handling, defensive boundaries, and unyielding structure',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The sapphire tide has receded — the ocean floor lies exposed and barren, with no waves carrying any gem-like power',
    )
  }

  const voidWaves = waves.filter((w) => w.condition === 'void')
  if (voidWaves.length > 0 && voidWaves.length <= 5) {
    recs.push(`Purify these stagnant pools: ${voidWaves.map((w) => w.file).join(', ')}`)
  } else if (voidWaves.length > 5) {
    recs.push(`Purify ${voidWaves.length} stagnant pools before the entire ocean becomes lifeless`)
  }

  const poorOceans = oceans.filter((o) => o.condition === 'void' || o.condition === 'dry-dock')
  if (poorOceans.length === oceans.length && oceans.length > 0) {
    recs.push('All ocean basins have dried up — the sapphire tide needs complete rehydration from the deepest trench to the shore')
  }

  if (recs.length === 0) {
    recs.push('Your sapphire tide flows with gem-like power — each wave carries depth, rhythm, purity, wisdom, and resilience')
  }

  return recs
}
