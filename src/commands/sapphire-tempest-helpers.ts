// ─── Interfaces ──────────────────────────────────────────

export interface ChargingMeasure {
  fury: number
  storm:
    | 'perfect-fury'
    | 'focused-tempest'
    | 'proper-storm'
    | 'scattered-wind'
    | 'calm-breeze'
    | 'no-fury'
  hasHighFury: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasActive: boolean
  hasNoDead: boolean
  hasContributing: boolean
  hasNoParasitic: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasAlive: boolean
  hasNoZombie: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasPurposeful: boolean
  hasNoAimless: boolean
  isolatedCount: number
  deadCount: number
}

export interface StrikingMeasure {
  precision: number
  lightning:
    | 'bolt-precision'
    | 'targeted-strike'
    | 'proper-aim'
    | 'scattered-bolt'
    | 'random-zap'
    | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasDeterministic: boolean
  hasConsistent: boolean
  hasPrecise: boolean
  unsafeCount: number
  buggyCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  flash:
    | 'blinding-truth'
    | 'sudden-revelation'
    | 'proper-illumination'
    | 'dim-flicker'
    | 'no-flash'
    | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasDocumented: boolean
  hasRevealing: boolean
  hasDirect: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EchoingMeasure {
  resilience: number
  thunder:
    | 'rolling-thunder'
    | 'echoing-boom'
    | 'proper-rumble'
    | 'fading-echo'
    | 'silent-storm'
    | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasPersistent: boolean
  hasEnduring: boolean
  hasAntifragile: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface NourishingMeasure {
  wisdom: number
  rain:
    | 'life-giving-rain'
    | 'wisdom-shower'
    | 'proper-drizzle'
    | 'light-mist'
    | 'dry-sky'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasDistributed: boolean
  hasShared: boolean
  hasConnected: boolean
  hackedCount: number
  adHocCount: number
}

export type BoltCondition =
  | 'storm-masterpiece'
  | 'blue-tempest'
  | 'proper-storm'
  | 'gray-cloud'
  | 'clear-sky'
  | 'void'

export interface SapphireBolt {
  file: string
  gemFury: number
  strikePrecision: number
  lightningClarity: number
  thunderResilience: number
  rainWisdom: number
  charging: ChargingMeasure
  striking: StrikingMeasure
  illuminating: IlluminatingMeasure
  echoing: EchoingMeasure
  nourishing: NourishingMeasure
  condition: BoltCondition
  qualityScore: number
}

export type CloudType =
  | 'cumulonimbus'
  | 'thunderhead'
  | 'proper-cloud'
  | 'small-cumulus'
  | 'clear-sky'
  | 'no-cloud'

export type CloudCondition =
  | 'tempest-front'
  | 'storm-cloud'
  | 'proper-overcast'
  | 'light-clouds'
  | 'clear-sky'
  | 'void'

export interface SapphireCloud {
  directory: string
  bolts: SapphireBolt[]
  avgPrecision: number
  avgClarity: number
  avgWisdom: number
  stormMasterpieceCount: number
  voidCount: number
  cloudType: CloudType
  condition: CloudCondition
}

export type StormGrade =
  | 'storm-lord'
  | 'weather-master'
  | 'storm-rider'
  | 'apprentice'
  | 'novice'
  | 'fair-weather'

export interface SapphireStormStats {
  totalFiles: number
  totalClouds: number
  avgGemFury: number
  avgStrikePrecision: number
  avgLightningClarity: number
  avgThunderResilience: number
  avgRainWisdom: number
  stormMasterpieceCount: number
  blueTempestCount: number
  properStormCount: number
  grayCloudCount: number
  clearSkyCount: number
  voidCount: number
  hasHighFuryCount: number
  hasHighPrecisionCount: number
  hasHighClarityCount: number
  hasHighResilienceCount: number
  hasHighWisdomCount: number
  overallFury: number
  stormGrade: StormGrade
  bestBolt: string
  mostFurious: string
  mostPrecise: string
  clearest: string
  mostResilient: string
  wisest: string
}

export interface SapphireStormResult {
  bolts: SapphireBolt[]
  clouds: SapphireCloud[]
  weather: {
    avgPrecision: number
    avgClarity: number
    avgWisdom: number
    isSapphire: boolean
    overallFury: number
  }
  stats: SapphireStormStats
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

// ─── Measure functions ──────────────────────────────────

/** @example measureCharging('export async function analyze(): Promise<Result> { }') */
export function measureCharging(content: string): ChargingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|standalone|unused)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasActive = /\b(function|class|=|=>|async)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|deprecated)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasContributing = /\b(return|export|yield)\b/.test(content)
  const hasNoParasitic = !/\b(parasitic|leech|drain)\b/i.test(content)
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const hasNoStagnant = !/\b(stagnant|frozen)\b/i.test(content)
  const hasAlive = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoZombie = !/\b(zombie|undead)\b/i.test(content)
  const hasPowerful = /\b(class|interface|type)\b/.test(content)
  const hasNoWeak = !/\b(weak|fragile)\b/i.test(content)
  const hasPurposeful = /\b(readonly|const|as const)\b/.test(content)
  const hasNoAimless = !/\b(aimless|wandering|lost)\b/i.test(content)

  const positiveBooleans = [
    hasExported,
    hasActive,
    hasContributing,
    hasEvolving,
    hasAlive,
    hasPowerful,
    hasPurposeful,
    hasExported,
  ]

  const fury = computeScore(positiveBooleans)
  const hasHighFury = fury >= 60
  const storm = classifyStorm(fury)

  return {
    fury,
    storm,
    hasHighFury,
    hasExported,
    hasNoIsolated,
    hasActive,
    hasNoDead,
    hasContributing,
    hasNoParasitic,
    hasEvolving,
    hasNoStagnant,
    hasAlive,
    hasNoZombie,
    hasPowerful,
    hasNoWeak,
    hasPurposeful,
    hasNoAimless,
    isolatedCount,
    deadCount,
  }
}

/** @example measureStriking('export interface Config { readonly name: string }') */
export function measureStriking(content: string): StrikingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /\b(function|class|interface)\b/.test(content)
  const hasNoWrong = !/\b(wrong|incorrect)\b/i.test(content)
  const hasExact = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|close.enough)\b/i.test(content)
  const hasCorrect = /\b(return|yield|emit)\b/.test(content)
  const buggyCount = (content.match(/\b(buggy|broken|defective)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasValidated = /\b(try|catch|if)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|hope)\b/i.test(content)
  const hasFocused = /\b(const|readonly)\b/.test(content)
  const hasNoScattered = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasDeterministic = /\b(import|export|from)\b/.test(content)
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const hasPrecise = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasAccurate,
    hasExact,
    hasCorrect,
    hasValidated,
    hasFocused,
    hasConsistent,
    hasPrecise,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const lightning = classifyLightning(precision)

  return {
    precision,
    lightning,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoWrong,
    hasExact,
    hasNoApproximate,
    hasCorrect,
    hasNoBuggy,
    hasValidated,
    hasNoAssumed,
    hasFocused,
    hasNoScattered,
    hasDeterministic,
    hasConsistent,
    hasPrecise,
    unsafeCount,
    buggyCount,
  }
}

/** @example measureIlluminating('export function analyze(): void { }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(readonly|private|protected|async)\b/.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minify|uglify)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(import|export|from)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore')
  const hasUnderstandable = /\b(if|return|throw)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasVisible = /\b(export|public)\b/.test(content)
  const hasNoInvisible = !/\b(hidden|invisible|secret)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealing = /\b(readonly|type|interface)\b/.test(content)
  const hasDirect = /\b(return|yield|emit)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDocumented,
    hasRevealing,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const flash = classifyFlash(clarity)

  return {
    clarity,
    flash,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasNoHidden,
    hasUnderstandable,
    hasNoArcane,
    hasVisible,
    hasNoInvisible,
    hasDocumented,
    hasRevealing,
    hasDirect,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureEchoing('try { analyze() } catch { handleError() }') */
export function measureEchoing(content: string): EchoingMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoFragile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasPersistent = /\b(const|readonly)\b/.test(content)
  const hasEnduring = /\b(readonly|as const)\b/.test(content)
  const hasAntifragile = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasTested,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasPersistent,
    hasAntifragile,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const thunder = classifyThunder(resilience)

  return {
    resilience,
    thunder,
    hasHighResilience,
    hasErrorHandled,
    hasNoBareCrash,
    hasTested,
    hasNoUntested,
    hasDefensive,
    hasNoNaive,
    hasGraceful,
    hasNoHarshFail,
    hasRecoverable,
    hasNoFatal,
    hasRobust,
    hasNoFragile,
    hasPersistent,
    hasEnduring,
    hasAntifragile,
    bareCrashCount,
    untestedCount,
  }
}

/** @example measureNourishing('export class Analyzer<T> { }') */
export function measureNourishing(content: string): NourishingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasDistributed = /\b(import|export|from)\b/.test(content)
  const hasShared = /\b(export)\b/.test(content)
  const hasConnected = /\b(import|export)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasPatterned,
    hasDeep,
    hasMature,
    hasDistributed,
    hasConnected,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const rain = classifyRain(wisdom)

  return {
    wisdom,
    rain,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasNoNaive,
    hasDistributed,
    hasShared,
    hasConnected,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyStorm(score: number): ChargingMeasure['storm'] {
  if (score >= 90) return 'perfect-fury'
  if (score >= 75) return 'focused-tempest'
  if (score >= 60) return 'proper-storm'
  if (score >= 40) return 'scattered-wind'
  if (score >= 20) return 'calm-breeze'
  return 'no-fury'
}

function classifyLightning(score: number): StrikingMeasure['lightning'] {
  if (score >= 90) return 'bolt-precision'
  if (score >= 75) return 'targeted-strike'
  if (score >= 60) return 'proper-aim'
  if (score >= 40) return 'scattered-bolt'
  if (score >= 20) return 'random-zap'
  return 'no-precision'
}

function classifyFlash(score: number): IlluminatingMeasure['flash'] {
  if (score >= 90) return 'blinding-truth'
  if (score >= 75) return 'sudden-revelation'
  if (score >= 60) return 'proper-illumination'
  if (score >= 40) return 'dim-flicker'
  if (score >= 20) return 'no-flash'
  return 'no-clarity'
}

function classifyThunder(score: number): EchoingMeasure['thunder'] {
  if (score >= 90) return 'rolling-thunder'
  if (score >= 75) return 'echoing-boom'
  if (score >= 60) return 'proper-rumble'
  if (score >= 40) return 'fading-echo'
  if (score >= 20) return 'silent-storm'
  return 'no-resilience'
}

function classifyRain(score: number): NourishingMeasure['rain'] {
  if (score >= 90) return 'life-giving-rain'
  if (score >= 75) return 'wisdom-shower'
  if (score >= 60) return 'proper-drizzle'
  if (score >= 40) return 'light-mist'
  if (score >= 20) return 'dry-sky'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): BoltCondition {
  if (score >= 90) return 'storm-masterpiece'
  if (score >= 75) return 'blue-tempest'
  if (score >= 60) return 'proper-storm'
  if (score >= 40) return 'gray-cloud'
  if (score >= 20) return 'clear-sky'
  return 'void'
}

/** @example classifyCloudType(bolts) */
export function classifyCloudType(bolts: SapphireBolt[]): CloudType {
  if (bolts.length === 0) return 'no-cloud'
  const avg = bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length
  if (avg >= 90) return 'cumulonimbus'
  if (avg >= 75) return 'thunderhead'
  if (avg >= 60) return 'proper-cloud'
  if (avg >= 40) return 'small-cumulus'
  if (avg >= 20) return 'clear-sky'
  return 'no-cloud'
}

/** @example classifyCloudCondition(avgPrecision) */
export function classifyCloudCondition(avgPrecision: number): CloudCondition {
  if (avgPrecision >= 85) return 'tempest-front'
  if (avgPrecision >= 70) return 'storm-cloud'
  if (avgPrecision >= 55) return 'proper-overcast'
  if (avgPrecision >= 35) return 'light-clouds'
  if (avgPrecision >= 15) return 'clear-sky'
  return 'void'
}

/** @example classifyStormGrade(80) */
export function classifyStormGrade(avgFury: number): StormGrade {
  if (avgFury >= 80) return 'storm-lord'
  if (avgFury >= 65) return 'weather-master'
  if (avgFury >= 50) return 'storm-rider'
  if (avgFury >= 35) return 'apprentice'
  if (avgFury >= 20) return 'novice'
  return 'fair-weather'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeSapphireBolt(content, 'app.ts') */
export function analyzeSapphireBolt(content: string, filePath: string): SapphireBolt {
  const charging = measureCharging(content)
  const striking = measureStriking(content)
  const illuminating = measureIlluminating(content)
  const echoing = measureEchoing(content)
  const nourishing = measureNourishing(content)

  const gemFury = charging.fury
  const strikePrecision = striking.precision
  const lightningClarity = illuminating.clarity
  const thunderResilience = echoing.resilience
  const rainWisdom = nourishing.wisdom

  const qualityScore = Math.round(
    gemFury * 0.2 +
    strikePrecision * 0.2 +
    lightningClarity * 0.2 +
    thunderResilience * 0.2 +
    rainWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    gemFury,
    strikePrecision,
    lightningClarity,
    thunderResilience,
    rainWisdom,
    charging,
    striking,
    illuminating,
    echoing,
    nourishing,
    condition,
    qualityScore,
  }
}

/** @example analyzeSapphireCloud(bolts, 'src') */
export function analyzeSapphireCloud(bolts: SapphireBolt[], dirPath: string): SapphireCloud {
  if (bolts.length === 0) {
    return {
      directory: dirPath,
      bolts: [],
      avgPrecision: 0,
      avgClarity: 0,
      avgWisdom: 0,
      stormMasterpieceCount: 0,
      voidCount: 0,
      cloudType: 'no-cloud',
      condition: 'void',
    }
  }

  const avgPrecision = Math.round(
    bolts.reduce((s, b) => s + b.strikePrecision, 0) / bolts.length,
  )
  const avgClarity = Math.round(
    bolts.reduce((s, b) => s + b.lightningClarity, 0) / bolts.length,
  )
  const avgWisdom = Math.round(
    bolts.reduce((s, b) => s + b.rainWisdom, 0) / bolts.length,
  )

  const stormMasterpieceCount = bolts.filter(
    (b) => b.condition === 'storm-masterpiece',
  ).length
  const voidCount = bolts.filter((b) => b.condition === 'void').length

  const cloudType = classifyCloudType(bolts)
  const avgQuality = Math.round(
    bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length,
  )
  const condition = classifyCloudCondition(avgQuality)

  return {
    directory: dirPath,
    bolts,
    avgPrecision,
    avgClarity,
    avgWisdom,
    stormMasterpieceCount,
    voidCount,
    cloudType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSapphireStormResult(['a.ts'], [content]) */
export async function buildSapphireStormResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireStormResult> {
  const bolts: SapphireBolt[] = files.map((file, i) =>
    analyzeSapphireBolt(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SapphireBolt[]>()
  for (const bolt of bolts) {
    const dir = bolt.file.includes('/')
      ? bolt.file.substring(0, bolt.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bolt)
    } else {
      dirMap.set(dir, [bolt])
    }
  }

  const clouds: SapphireCloud[] = Array.from(dirMap.entries()).map(([dir, dirBolts]) =>
    analyzeSapphireCloud(dirBolts, dir),
  )

  const avgPrecision =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.strikePrecision, 0) / bolts.length)
      : 0
  const avgClarity =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.lightningClarity, 0) / bolts.length)
      : 0
  const avgWisdom =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.rainWisdom, 0) / bolts.length)
      : 0

  const overallFury =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length)
      : 0
  const isSapphire = overallFury >= 60

  const weather = { avgPrecision, avgClarity, avgWisdom, isSapphire, overallFury }

  const avgGemFury =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.gemFury, 0) / bolts.length)
      : 0
  const avgStrikePrecision = avgPrecision
  const avgLightningClarity = avgClarity
  const avgThunderResilience =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.thunderResilience, 0) / bolts.length)
      : 0
  const avgRainWisdom = avgWisdom

  const stormMasterpieceCount = bolts.filter(
    (b) => b.condition === 'storm-masterpiece',
  ).length
  const blueTempestCount = bolts.filter((b) => b.condition === 'blue-tempest').length
  const properStormCount = bolts.filter((b) => b.condition === 'proper-storm').length
  const grayCloudCount = bolts.filter((b) => b.condition === 'gray-cloud').length
  const clearSkyCount = bolts.filter((b) => b.condition === 'clear-sky').length
  const voidCount = bolts.filter((b) => b.condition === 'void').length

  const hasHighFuryCount = bolts.filter((b) => b.charging.hasHighFury).length
  const hasHighPrecisionCount = bolts.filter((b) => b.striking.hasHighPrecision).length
  const hasHighClarityCount = bolts.filter((b) => b.illuminating.hasHighClarity).length
  const hasHighResilienceCount = bolts.filter((b) => b.echoing.hasHighResilience).length
  const hasHighWisdomCount = bolts.filter((b) => b.nourishing.hasHighWisdom).length

  const stormGrade = classifyStormGrade(overallFury)

  const bestBolt = bolts.length > 0
    ? bolts.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file
    : ''
  const mostFurious = bolts.length > 0
    ? bolts.reduce((best, b) => (b.gemFury > best.gemFury ? b : best)).file
    : ''
  const mostPrecise = bolts.length > 0
    ? bolts.reduce((best, b) => (b.strikePrecision > best.strikePrecision ? b : best)).file
    : ''
  const clearest = bolts.length > 0
    ? bolts.reduce((best, b) => (b.lightningClarity > best.lightningClarity ? b : best)).file
    : ''
  const mostResilient = bolts.length > 0
    ? bolts.reduce((best, b) => (b.thunderResilience > best.thunderResilience ? b : best)).file
    : ''
  const wisest = bolts.length > 0
    ? bolts.reduce((best, b) => (b.rainWisdom > best.rainWisdom ? b : best)).file
    : ''

  const stats: SapphireStormStats = {
    totalFiles: files.length,
    totalClouds: clouds.length,
    avgGemFury,
    avgStrikePrecision,
    avgLightningClarity,
    avgThunderResilience,
    avgRainWisdom,
    stormMasterpieceCount,
    blueTempestCount,
    properStormCount,
    grayCloudCount,
    clearSkyCount,
    voidCount,
    hasHighFuryCount,
    hasHighPrecisionCount,
    hasHighClarityCount,
    hasHighResilienceCount,
    hasHighWisdomCount,
    overallFury,
    stormGrade,
    bestBolt,
    mostFurious,
    mostPrecise,
    clearest,
    mostResilient,
    wisest,
  }

  const recommendations = generateRecommendations(bolts, clouds, weather, stats)

  return { bolts, clouds, weather, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(bolts, clouds, weather, stats) */
export function generateRecommendations(
  bolts: SapphireBolt[],
  clouds: SapphireCloud[],
  weather: SapphireStormResult['weather'],
  stats: SapphireStormStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgGemFury >= 90 &&
    stats.avgStrikePrecision >= 90 &&
    stats.avgLightningClarity >= 90 &&
    stats.avgThunderResilience >= 90 &&
    stats.avgRainWisdom >= 90
  ) {
    recs.push(
      'Your sapphire storm is a masterwork of crystalline fury! Every bolt strikes with gem-blue precision and thunderous authority',
    )
    return recs
  }

  if (stats.avgGemFury < 60) {
    recs.push(
      'Channel more gem fury — code should crackle with purposeful energy, the focused power of a sapphire storm',
    )
  }

  if (stats.avgStrikePrecision < 60) {
    recs.push(
      'Sharpen strike precision — code must strike with lightning accuracy, every bolt finding its mark',
    )
  }

  if (stats.avgLightningClarity < 60) {
    recs.push(
      'Brighten lightning clarity — code should illuminate understanding in a single flash of revelation',
    )
  }

  if (stats.avgThunderResilience < 60) {
    recs.push(
      'Strengthen thunder resilience — code must echo with authority, rolling through errors without faltering',
    )
  }

  if (stats.avgRainWisdom < 60) {
    recs.push(
      'Deepen rain wisdom — code should nourish with distributed knowledge, like rain carrying wisdom from the heavens',
    )
  }

  if (stats.overallFury < 40) {
    recs.push(
      'The storm dissipates — rebuild the sapphire energy before the sky clears entirely',
    )
  }

  const voidBolts = bolts.filter((b) => b.condition === 'void')
  if (voidBolts.length > 0 && voidBolts.length <= 5) {
    recs.push(
      `Recharge these spent bolts: ${voidBolts.map((b) => b.file).join(', ')}`,
    )
  } else if (voidBolts.length > 5) {
    recs.push(
      `Recharge these ${voidBolts.length} depleted bolts before the storm front collapses`,
    )
  }

  const poorClouds = clouds.filter(
    (c) => c.condition === 'void' || c.condition === 'clear-sky',
  )
  if (poorClouds.length === clouds.length && clouds.length > 0) {
    recs.push(
      'All clouds have dissipated — the sapphire storm needs a complete atmospheric rebuild',
    )
  }

  if (recs.length === 0) {
    recs.push('Your sapphire storm crackles with electric brilliance — keep channeling every bolt to perfection')
  }

  return recs
}
