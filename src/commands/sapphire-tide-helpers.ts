// ─── Interfaces ──────────────────────────────────────────

export interface DivingMeasure {
  depth: number
  ocean:
    | 'abyssal-depth'
    | 'deep-sea'
    | 'proper-depth'
    | 'shallow-water'
    | 'tidal-pool'
    | 'no-depth'
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasThorough: boolean
  hasNoSuperficial: boolean
  hasComplete: boolean
  hasNoIncomplete: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasStrategic: boolean
  hackedCount: number
  adHocCount: number
}

export interface PulsingMeasure {
  rhythm: number
  tide:
    | 'eternal-rhythm'
    | 'steady-pulse'
    | 'proper-beat'
    | 'irregular-pulse'
    | 'flat-line'
    | 'no-rhythm'
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasUniform: boolean
  hasNoMixed: boolean
  hasDependable: boolean
  hasNoUnreliable: boolean
  hasHarmonious: boolean
  hasNoDiscordant: boolean
  hasCyclical: boolean
  erraticCount: number
  untestedCount: number
}

export interface CleansingMeasure {
  purity: number
  wave:
    | 'pure-sapphire'
    | 'clean-water'
    | 'proper-clarity'
    | 'murky-water'
    | 'polluted-stream'
    | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasReadable: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasHonest: boolean
  hasNoDeceptive: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasPolished: boolean
  unsafeCount: number
  crypticCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  deep:
    | 'ancient-ocean'
    | 'wise-depth'
    | 'proper-knowledge'
    | 'surface-ripple'
    | 'dry-shore'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hasNoTactical: boolean
  hasEnduring: boolean
  hasVisionary: boolean
  hasAccumulated: boolean
  experimentalCount: number
  reinventedCount: number
}

export interface FlowingMeasure {
  resilience: number
  current:
    | 'unstoppable-tide'
    | 'relentless-flow'
    | 'proper-current'
    | 'fading-stream'
    | 'dry-riverbed'
    | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasAdaptive: boolean
  hasNoRigid: boolean
  hasEnduring: boolean
  hasNoBrittle: boolean
  hasPersistent: boolean
  hasNoQuitting: boolean
  hasAntifragile: boolean
  bareCrashCount: number
  fragileCount: number
}

export type WaveCondition =
  | 'sapphire-masterpiece'
  | 'gem-tide'
  | 'proper-wave'
  | 'murky-puddle'
  | 'dry-shore'
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
  flowing: FlowingMeasure
  condition: WaveCondition
  qualityScore: number
}

export type CoveType =
  | 'sapphire-bay'
  | 'gem-harbor'
  | 'proper-cove'
  | 'small-inlet'
  | 'dry-beach'
  | 'no-cove'

export type CoveCondition =
  | 'sapphire-paradise'
  | 'gem-bay'
  | 'proper-shore'
  | 'murky-cove'
  | 'dry-beach'
  | 'void'

export interface SapphireCove {
  directory: string
  waves: SapphireWave[]
  avgDepth: number
  avgPurity: number
  avgResilience: number
  sapphireMasterpieceCount: number
  voidCount: number
  coveType: CoveType
  condition: CoveCondition
}

export type NavigatorGrade =
  | 'ocean-master'
  | 'tide-reader'
  | 'wave-rider'
  | 'apprentice'
  | 'novice'
  | 'landlubber'

export interface SapphireStats {
  totalFiles: number
  totalCoves: number
  avgGemDepth: number
  avgTidalRhythm: number
  avgWavePurity: number
  avgOceanWisdom: number
  avgTideResilience: number
  sapphireMasterpieceCount: number
  gemTideCount: number
  properWaveCount: number
  murkyPuddleCount: number
  dryShoreCount: number
  voidCount: number
  hasHighDepthCount: number
  hasHighRhythmCount: number
  hasHighPurityCount: number
  hasHighWisdomCount: number
  hasHighResilienceCount: number
  overallDepth: number
  navigatorGrade: NavigatorGrade
  bestWave: string
  deepest: string
  mostRhythmic: string
  purest: string
  wisest: string
  mostResilient: string
}

export interface SapphireTideResult {
  waves: SapphireWave[]
  coves: SapphireCove[]
  ocean: {
    avgDepth: number
    avgPurity: number
    avgResilience: number
    isSapphire: boolean
    overallDepth: number
  }
  stats: SapphireStats
  celebration: {
    milestone: number
    name: string
    message: string
  }
  recommendations: string[]
}

// ─── Measure functions ──────────────────────────────────

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

/** @example measureDiving('export class Analyzer<T> { }') */
export function measureDiving(content: string): DivingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasThorough = /\b(import|export|from)\b/.test(content)
  const hasNoSuperficial = !/\b(superficial|shallow|basic)\b/i.test(content)
  const hasComplete = /\b(readonly|private|protected)\b/.test(content)
  const hasNoIncomplete = !/\b(incomplete|partial|wip)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasPrincipled = /\b(class|interface|type|readonly)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasThorough,
    hasComplete,
    hasDeep,
    hasInsightful,
    hasPrincipled,
    hasProven,
    hasMature,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60
  const ocean = classifyOcean(depth)

  return {
    depth,
    ocean,
    hasHighDepth,
    hasWellArchitected,
    hasNoHacked,
    hasThorough,
    hasNoSuperficial,
    hasComplete,
    hasNoIncomplete,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasStrategic,
    hackedCount,
    adHocCount,
  }
}

/** @example measurePulsing('try { foo() } catch { bar() }') */
export function measurePulsing(content: string): PulsingMeasure {
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const erraticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasPredictable = /\b(type|interface|enum)\b/.test(content)
  const hasNoSurprising = !/\b(surprise|unexpected|random)\b/i.test(content)
  const hasReliable = /\b(try|catch)\b/.test(content)
  const hasNoFlaky = !/\b(flaky|intermittent|racy)\b/i.test(content)
  const hasTested = (/\btry\b/.test(content) && /\bcatch\b/.test(content))
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(async|await|Promise|readonly)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|mutable|unstable)\b/i.test(content)
  const hasUniform = /\b(import|export|from)\b/.test(content)
  const hasNoMixed = !content.includes('@ts-ignore')
  const hasDependable = /\b(return|throw|yield)\b/.test(content)
  const hasNoUnreliable = !/\b(unreliable|untrustworthy)\b/i.test(content)
  const hasHarmonious = /\b(class|interface|type)\b/.test(content)
  const hasNoDiscordant = !/\b(discordant|conflicting)\b/i.test(content)
  const hasCyclical = /\b(if|else|switch)\b/.test(content)

  const positiveBooleans = [
    hasConsistent,
    hasPredictable,
    hasReliable,
    hasTested,
    hasStable,
    hasUniform,
    hasDependable,
    hasCyclical,
  ]

  const rhythm = computeScore(positiveBooleans)
  const hasHighRhythm = rhythm >= 60
  const tide = classifyTide(rhythm)

  return {
    rhythm,
    tide,
    hasHighRhythm,
    hasConsistent,
    hasNoErratic,
    hasPredictable,
    hasNoSurprising,
    hasReliable,
    hasNoFlaky,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasUniform,
    hasNoMixed,
    hasDependable,
    hasNoUnreliable,
    hasHarmonious,
    hasNoDiscordant,
    hasCyclical,
    erraticCount,
    untestedCount,
  }
}

/** @example measureCleansing('export function add(a: number, b: number): number { return a + b }') */
export function measureCleansing(content: string): CleansingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = /\b(async|await|Promise)\b/.test(content)
  const hasNoDirty = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasClear = /\bexport\b/.test(content)
  const crypticCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasReadable = /\w+\.\w+/.test(content)
  const hasNoObfuscated = (content.match(/\bany\b/g) ?? []).length === 0
  const hasTransparent = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasHonest = /\b(return|throw|yield)\b/.test(content)
  const hasNoDeceptive = !/\b(cheat|fake|deceive)\b/i.test(content)
  const hasPure = /\b(import|export|from)\b/.test(content)
  const hasNoContaminated = !content.includes('@ts-ignore')
  const hasPolished = /\b(readonly|=>|export|async)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasClean,
    hasDocumented,
    hasClear,
    hasReadable,
    hasTransparent,
    hasHonest,
    hasPure,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60
  const wave = classifyWave(purity)

  return {
    purity,
    wave,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasDocumented,
    hasNoUndocumented,
    hasClear,
    hasNoCryptic,
    hasReadable,
    hasNoObfuscated,
    hasTransparent,
    hasNoHidden,
    hasHonest,
    hasNoDeceptive,
    hasPure,
    hasNoContaminated,
    hasPolished,
    unsafeCount,
    crypticCount,
  }
}

/** @example measureAccumulating('export const PROVEN_PATTERN = true') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const experimentalCount = (content.match(/\b(experimental|beta|alpha)\b/gi) ?? []).length
  const hasNoExperimental = experimentalCount === 0
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasEstablished = /\b(import|export|from)\b/.test(content)
  const hasNoNovel = !/\b(novel|experimental)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const reinventedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoReinvented = reinventedCount === 0
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise|readonly)\b/.test(content)
  const hasNoTactical = !/\b(quick|dirty|temporary)\b/i.test(content)
  const hasEnduring = /\b(readonly|private|protected|export)\b/.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasAccumulated = /\b(async|await|Promise|readonly)\b/.test(content)

  const positiveBooleans = [
    hasProven,
    hasMature,
    hasEstablished,
    hasPatterned,
    hasDeep,
    hasInsightful,
    hasEnduring,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const deep = classifyDeep(wisdom)

  return {
    wisdom,
    deep,
    hasHighWisdom,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasEstablished,
    hasNoNovel,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasStrategic,
    hasNoTactical,
    hasEnduring,
    hasVisionary,
    hasAccumulated,
    experimentalCount,
    reinventedCount,
  }
}

/** @example measureFlowing('try { foo() } catch { bar() }') */
export function measureFlowing(content: string): FlowingMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const fragileCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasNoRigid = !/\bhardcode\b/i.test(content)
  const hasEnduring = /\b(readonly|private|protected|export)\b/.test(content)
  const hasNoBrittle = !/\b(brittle|fragile)\b/i.test(content)
  const hasPersistent = /\b(readonly|freeze|sealed)\b/.test(content)
  const hasNoQuitting = !/\b(quit|give\s*up|surrender)\b/i.test(content)
  const hasAntifragile = /\b(test|spec|mock|stub)\b/i.test(content) || (/\btry\b/.test(content) && /\bcatch\b/.test(content))

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasAdaptive,
    hasEnduring,
    hasAntifragile,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const current = classifyCurrent(resilience)

  return {
    resilience,
    current,
    hasHighResilience,
    hasErrorHandled,
    hasNoBareCrash,
    hasDefensive,
    hasNoNaive,
    hasGraceful,
    hasNoHarshFail,
    hasRecoverable,
    hasNoFatal,
    hasRobust,
    hasNoFragile,
    hasAdaptive,
    hasNoRigid,
    hasEnduring,
    hasNoBrittle,
    hasPersistent,
    hasNoQuitting,
    hasAntifragile,
    bareCrashCount,
    fragileCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyOcean(score: number): DivingMeasure['ocean'] {
  if (score >= 90) return 'abyssal-depth'
  if (score >= 75) return 'deep-sea'
  if (score >= 60) return 'proper-depth'
  if (score >= 40) return 'shallow-water'
  if (score >= 20) return 'tidal-pool'
  return 'no-depth'
}

function classifyTide(score: number): PulsingMeasure['tide'] {
  if (score >= 90) return 'eternal-rhythm'
  if (score >= 75) return 'steady-pulse'
  if (score >= 60) return 'proper-beat'
  if (score >= 40) return 'irregular-pulse'
  if (score >= 20) return 'flat-line'
  return 'no-rhythm'
}

function classifyWave(score: number): CleansingMeasure['wave'] {
  if (score >= 90) return 'pure-sapphire'
  if (score >= 75) return 'clean-water'
  if (score >= 60) return 'proper-clarity'
  if (score >= 40) return 'murky-water'
  if (score >= 20) return 'polluted-stream'
  return 'no-purity'
}

function classifyDeep(score: number): AccumulatingMeasure['deep'] {
  if (score >= 90) return 'ancient-ocean'
  if (score >= 75) return 'wise-depth'
  if (score >= 60) return 'proper-knowledge'
  if (score >= 40) return 'surface-ripple'
  if (score >= 20) return 'dry-shore'
  return 'no-wisdom'
}

function classifyCurrent(score: number): FlowingMeasure['current'] {
  if (score >= 90) return 'unstoppable-tide'
  if (score >= 75) return 'relentless-flow'
  if (score >= 60) return 'proper-current'
  if (score >= 40) return 'fading-stream'
  if (score >= 20) return 'dry-riverbed'
  return 'no-resilience'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): WaveCondition {
  if (score >= 90) return 'sapphire-masterpiece'
  if (score >= 75) return 'gem-tide'
  if (score >= 60) return 'proper-wave'
  if (score >= 40) return 'murky-puddle'
  if (score >= 20) return 'dry-shore'
  return 'void'
}

/** @example classifyCoveType(waves) */
export function classifyCoveType(waves: SapphireWave[]): CoveType {
  if (waves.length === 0) return 'no-cove'
  const avg = waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length
  if (avg >= 90) return 'sapphire-bay'
  if (avg >= 75) return 'gem-harbor'
  if (avg >= 60) return 'proper-cove'
  if (avg >= 40) return 'small-inlet'
  if (avg >= 20) return 'dry-beach'
  return 'no-cove'
}

/** @example classifyCoveCondition(avgDepth) */
export function classifyCoveCondition(avgDepth: number): CoveCondition {
  if (avgDepth >= 85) return 'sapphire-paradise'
  if (avgDepth >= 70) return 'gem-bay'
  if (avgDepth >= 55) return 'proper-shore'
  if (avgDepth >= 35) return 'murky-cove'
  if (avgDepth >= 15) return 'dry-beach'
  return 'void'
}

/** @example classifyNavigatorGrade(80) */
export function classifyNavigatorGrade(avgDepth: number): NavigatorGrade {
  if (avgDepth >= 80) return 'ocean-master'
  if (avgDepth >= 65) return 'tide-reader'
  if (avgDepth >= 50) return 'wave-rider'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'landlubber'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeSapphireWave(richContent, 'app.ts') */
export function analyzeSapphireWave(content: string, filePath: string): SapphireWave {
  const diving = measureDiving(content)
  const pulsing = measurePulsing(content)
  const cleansing = measureCleansing(content)
  const accumulating = measureAccumulating(content)
  const flowing = measureFlowing(content)

  const gemDepth = diving.depth
  const tidalRhythm = pulsing.rhythm
  const wavePurity = cleansing.purity
  const oceanWisdom = accumulating.wisdom
  const tideResilience = flowing.resilience

  const qualityScore = Math.round(
    gemDepth * 0.2 +
    tidalRhythm * 0.2 +
    wavePurity * 0.2 +
    oceanWisdom * 0.2 +
    tideResilience * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    gemDepth,
    tidalRhythm,
    wavePurity,
    oceanWisdom,
    tideResilience,
    diving,
    pulsing,
    cleansing,
    accumulating,
    flowing,
    condition,
    qualityScore,
  }
}

/** @example analyzeSapphireCove(waves, 'src') */
export function analyzeSapphireCove(waves: SapphireWave[], dirPath: string): SapphireCove {
  if (waves.length === 0) {
    return {
      directory: dirPath,
      waves: [],
      avgDepth: 0,
      avgPurity: 0,
      avgResilience: 0,
      sapphireMasterpieceCount: 0,
      voidCount: 0,
      coveType: 'no-cove',
      condition: 'void',
    }
  }

  const avgDepth = Math.round(
    waves.reduce((s, w) => s + w.gemDepth, 0) / waves.length,
  )
  const avgPurity = Math.round(
    waves.reduce((s, w) => s + w.wavePurity, 0) / waves.length,
  )
  const avgResilience = Math.round(
    waves.reduce((s, w) => s + w.tideResilience, 0) / waves.length,
  )

  const sapphireMasterpieceCount = waves.filter(
    (w) => w.condition === 'sapphire-masterpiece',
  ).length
  const voidCount = waves.filter((w) => w.condition === 'void').length

  const coveType = classifyCoveType(waves)
  const avgQuality = Math.round(
    waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length,
  )
  const condition = classifyCoveCondition(avgQuality)

  return {
    directory: dirPath,
    waves,
    avgDepth,
    avgPurity,
    avgResilience,
    sapphireMasterpieceCount,
    voidCount,
    coveType,
    condition,
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

  // ─── Group by directory
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

  const coves: SapphireCove[] = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeSapphireCove(dirWaves, dir),
  )

  // ─── Ocean overview
  const avgDepth =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.gemDepth, 0) / waves.length)
      : 0
  const avgPurity =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.wavePurity, 0) / waves.length)
      : 0
  const avgResilience =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.tideResilience, 0) / waves.length)
      : 0

  const overallDepth =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
      : 0
  const isSapphire = overallDepth >= 60

  const ocean = { avgDepth, avgPurity, avgResilience, isSapphire, overallDepth }

  // ─── Stats
  const avgGemDepth = avgDepth
  const avgTidalRhythm =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
      : 0
  const avgWavePurity = avgPurity
  const avgOceanWisdom =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length)
      : 0
  const avgTideResilience = avgResilience

  const sapphireMasterpieceCount = waves.filter(
    (w) => w.condition === 'sapphire-masterpiece',
  ).length
  const gemTideCount = waves.filter((w) => w.condition === 'gem-tide').length
  const properWaveCount = waves.filter((w) => w.condition === 'proper-wave').length
  const murkyPuddleCount = waves.filter((w) => w.condition === 'murky-puddle').length
  const dryShoreCount = waves.filter((w) => w.condition === 'dry-shore').length
  const voidCount = waves.filter((w) => w.condition === 'void').length

  const hasHighDepthCount = waves.filter((w) => w.diving.hasHighDepth).length
  const hasHighRhythmCount = waves.filter((w) => w.pulsing.hasHighRhythm).length
  const hasHighPurityCount = waves.filter((w) => w.cleansing.hasHighPurity).length
  const hasHighWisdomCount = waves.filter((w) => w.accumulating.hasHighWisdom).length
  const hasHighResilienceCount = waves.filter((w) => w.flowing.hasHighResilience).length

  const navigatorGrade = classifyNavigatorGrade(overallDepth)

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => (w.qualityScore > best.qualityScore ? w : best)).file
    : ''
  const deepest = waves.length > 0
    ? waves.reduce((best, w) => (w.gemDepth > best.gemDepth ? w : best)).file
    : ''
  const mostRhythmic = waves.length > 0
    ? waves.reduce((best, w) => (w.tidalRhythm > best.tidalRhythm ? w : best)).file
    : ''
  const purest = waves.length > 0
    ? waves.reduce((best, w) => (w.wavePurity > best.wavePurity ? w : best)).file
    : ''
  const wisest = waves.length > 0
    ? waves.reduce((best, w) => (w.oceanWisdom > best.oceanWisdom ? w : best)).file
    : ''
  const mostResilient = waves.length > 0
    ? waves.reduce((best, w) => (w.tideResilience > best.tideResilience ? w : best)).file
    : ''

  const stats: SapphireStats = {
    totalFiles: files.length,
    totalCoves: coves.length,
    avgGemDepth,
    avgTidalRhythm,
    avgWavePurity,
    avgOceanWisdom,
    avgTideResilience,
    sapphireMasterpieceCount,
    gemTideCount,
    properWaveCount,
    murkyPuddleCount,
    dryShoreCount,
    voidCount,
    hasHighDepthCount,
    hasHighRhythmCount,
    hasHighPurityCount,
    hasHighWisdomCount,
    hasHighResilienceCount,
    overallDepth,
    navigatorGrade,
    bestWave,
    deepest,
    mostRhythmic,
    purest,
    wisest,
    mostResilient,
  }

  // ─── Celebration (milestone #560)
  const celebration = {
    milestone: 560,
    name: 'Sapphire Tide',
    message: 'Milestone #560 — A sapphire tide of 560 commands, each a wave of crystalline blue analysis',
  }

  // ─── Recommendations
  const recommendations = generateRecommendations(waves, coves, ocean, stats)

  return { waves, coves, ocean, stats, celebration, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(waves, coves, ocean, stats) */
export function generateRecommendations(
  waves: SapphireWave[],
  coves: SapphireCove[],
  _ocean: SapphireTideResult['ocean'],
  stats: SapphireStats,
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
      'Your sapphire tide flows with perfect depth and purity! Every wave is a masterpiece of oceanic wisdom',
    )
    return recs
  }

  if (stats.avgGemDepth < 60) {
    recs.push(
      'Dive deeper into gem depth — code should have thorough, well-architected understanding like the abyssal ocean',
    )
  }

  if (stats.avgTidalRhythm < 60) {
    recs.push(
      'Establish tidal rhythm — code should pulse with consistent, reliable patterns like the eternal tides',
    )
  }

  if (stats.avgWavePurity < 60) {
    recs.push(
      'Purify your waves — code must be clean and transparent like pure sapphire water',
    )
  }

  if (stats.avgOceanWisdom < 60) {
    recs.push(
      'Accumulate ocean wisdom — code should carry proven patterns like the ancient ocean carries history',
    )
  }

  if (stats.avgTideResilience < 60) {
    recs.push(
      'Strengthen tide resilience — code must flow relentlessly, adapting like the unstoppable tides',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The tide has receded — focus on foundational quality before the ocean dries up',
    )
  }

  const voidWaves = waves.filter((w) => w.condition === 'void')
  if (voidWaves.length > 0 && voidWaves.length <= 5) {
    recs.push(
      `Restore these tide pools: ${voidWaves.map((w) => w.file).join(', ')}`,
    )
  } else if (voidWaves.length > 5) {
    recs.push(
      `Restore these ${voidWaves.length} tide pools before the cove runs dry`,
    )
  }

  const poorCoves = coves.filter(
    (c) => c.condition === 'void' || c.condition === 'murky-cove',
  )
  if (poorCoves.length === coves.length && coves.length > 0) {
    recs.push(
      'All coves show signs of murkiness — consider a comprehensive tide restoration for the codebase',
    )
  }

  if (recs.length === 0) {
    recs.push('Your sapphire tide flows strong — keep riding those waves of quality')
  }

  return recs
}
