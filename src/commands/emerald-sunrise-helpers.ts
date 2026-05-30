// ─── Interfaces ──────────────────────────────────────────

export interface ThrivingMeasure {
  vitality: number
  growth: 'ancient-forest' | 'lush-garden' | 'proper-growth' | 'wilting-plant' | 'dead-branch' | 'no-vitality'
  hasHighVitality: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasAlive: boolean
  hasGrowing: boolean
  hasDynamic: boolean
  hasEvolving: boolean
  hasThriving: boolean
  hasVibrant: boolean
  hasActive: boolean
  hasProductive: boolean
  hasFertile: boolean
  hasFlourishing: boolean
  hasBlooming: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dawn: 'golden-sunrise' | 'clear-dawn' | 'proper-morning' | 'gray-dawn' | 'pre-dawn' | 'no-clarity'
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
  hasRevealed: boolean
  hasOpen: boolean
  hasFresh: boolean
  hasIlluminated: boolean
  hasClean: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  gem: 'royal-emerald' | 'precious-stone' | 'proper-gem' | 'common-jade' | 'glass-bead' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasReflective: boolean
  hasEvolved: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hasHistorical: boolean
  hasValuable: boolean
  hasPrecious: boolean
  hackedCount: number
  shallowCount: number
}

export interface RefreshingMeasure {
  freshness: number
  dew: 'mountain-dew' | 'fresh-rain' | 'proper-moisture' | 'stagnant-water' | 'bone-dry' | 'no-freshness'
  hasHighFreshness: boolean
  hasClean: boolean
  hasNoStale: boolean
  hasModern: boolean
  hasNoOutdated: boolean
  hasOrganized: boolean
  hasNoCluttered: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasNew: boolean
  hasCurrent: boolean
  hasUpdated: boolean
  hasPure: boolean
  hasUncontaminated: boolean
  hasCrisp: boolean
  hasPristine: boolean
  staleCount: number
  clutteredCount: number
}

export interface RisingMeasure {
  resilience: number
  sunrise: 'eternal-sun' | 'faithful-sunrise' | 'proper-dawn' | 'late-morning' | 'overcast' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasReliable: boolean
  hasConsistent: boolean
  hasDependable: boolean
  hasRecurring: boolean
  hasPersistent: boolean
  hasEnduring: boolean
  hasUnfailing: boolean
  hasSteadfast: boolean
  hasPerpetual: boolean
  unhandledCount: number
  untestedCount: number
}

export type RayCondition =
  | 'emerald-masterpiece'
  | 'dawn-jewel'
  | 'proper-gem'
  | 'cloudy-stone'
  | 'dull-rock'
  | 'void'

export interface EmeraldRay {
  file: string
  greenVitality: number
  dawnClarity: number
  gemWisdom: number
  morningFreshness: number
  sunriseResilience: number
  thriving: ThrivingMeasure
  illuminating: IlluminatingMeasure
  accumulating: AccumulatingMeasure
  refreshing: RefreshingMeasure
  rising: RisingMeasure
  condition: RayCondition
  qualityScore: number
}

export type GardenType =
  | 'royal-garden'
  | 'gem-garden'
  | 'proper-beds'
  | 'window-box'
  | 'barren-soil'
  | 'no-garden'

export type GardenCondition =
  | 'emerald-paradise'
  | 'jade-oasis'
  | 'proper-greenhouse'
  | 'weed-patch'
  | 'desert'
  | 'void'

export interface EmeraldGarden {
  directory: string
  rays: EmeraldRay[]
  avgVitality: number
  avgClarity: number
  avgWisdom: number
  emeraldMasterpieceCount: number
  voidCount: number
  gardenType: GardenType
  condition: GardenCondition
}

export interface EmeraldSunriseResult {
  rays: EmeraldRay[]
  gardens: EmeraldGarden[]
  morning: {
    avgVitality: number
    avgClarity: number
    avgWisdom: number
    isEmerald: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalGardens: number
    avgGreenVitality: number
    avgDawnClarity: number
    avgGemWisdom: number
    avgMorningFreshness: number
    avgSunriseResilience: number
    emeraldMasterpieceCount: number
    dawnJewelCount: number
    properGemCount: number
    cloudyStoneCount: number
    dullRockCount: number
    voidCount: number
    hasHighVitalityCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    hasHighFreshnessCount: number
    hasHighResilienceCount: number
    overallRadiance: number
    lapidaryGrade: 'master-lapidary' | 'gem-cutter' | 'proper-jeweler' | 'apprentice' | 'novice' | 'rock-polisher'
    bestRay: string
    mostVital: string
    clearest: string
    wisest: string
    freshest: string
    mostResilient: string
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

/** @example classifyRayCondition(90) */
export function classifyRayCondition(score: number): RayCondition {
  if (score >= 90) return 'emerald-masterpiece'
  if (score >= 75) return 'dawn-jewel'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'dull-rock'
  return 'void'
}

/** @example classifyGardenType(rays) */
export function classifyGardenType(rays: EmeraldRay[]): GardenType {
  if (rays.length === 0) return 'no-garden'
  const avg =
    rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 85) return 'royal-garden'
  if (avg >= 70) return 'gem-garden'
  if (avg >= 55) return 'proper-beds'
  if (avg >= 35) return 'window-box'
  return 'barren-soil'
}

/** @example classifyGardenCondition(85) */
export function classifyGardenCondition(score: number): GardenCondition {
  if (score >= 85) return 'emerald-paradise'
  if (score >= 70) return 'jade-oasis'
  if (score >= 55) return 'proper-greenhouse'
  if (score >= 35) return 'weed-patch'
  if (score >= 15) return 'desert'
  return 'void'
}

/** @example classifyLapidaryGrade(80) */
export function classifyLapidaryGrade(
  avgRadiance: number,
): EmeraldSunriseResult['stats']['lapidaryGrade'] {
  if (avgRadiance >= 80) return 'master-lapidary'
  if (avgRadiance >= 65) return 'gem-cutter'
  if (avgRadiance >= 50) return 'proper-jeweler'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'rock-polisher'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureThriving('class X { readonly y: string }') */
export function measureThriving(content: string): ThrivingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasAlive = /\b(function|=>|return)\b/.test(content)
  const hasGrowing = /\b(async|await|Promise)\b/.test(content)
  const hasDynamic = /\b(try|catch|if)\b/.test(content)
  const hasEvolving = /\b(readonly|as const)\b/.test(content)
  const hasThriving = !/\bany\b/.test(content)
  const hasVibrant = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasActive = /\b(readonly|private|protected)\b/.test(content)
  const hasProductive = /\b(return|throw)\b/.test(content)
  const hasFertile = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasFlourishing = /\b(export|public)\b/.test(content)
  const hasBlooming = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasAlive,
    hasGrowing,
    hasDynamic,
    hasEvolving,
    hasThriving,
    hasVibrant,
    hasActive,
    hasProductive,
    hasFertile,
    hasFlourishing,
    hasBlooming,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let growth: ThrivingMeasure['growth'] = 'no-vitality'
  if (vitality >= 90) growth = 'ancient-forest'
  else if (vitality >= 75) growth = 'lush-garden'
  else if (vitality >= 60) growth = 'proper-growth'
  else if (vitality >= 40) growth = 'wilting-plant'
  else if (vitality >= 20) growth = 'dead-branch'

  return {
    vitality,
    growth,
    hasHighVitality,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasAlive,
    hasGrowing,
    hasDynamic,
    hasEvolving,
    hasThriving,
    hasVibrant,
    hasActive,
    hasProductive,
    hasFertile,
    hasFlourishing,
    hasBlooming,
    chaoticCount,
    monolithicCount,
  }
}

/** @example measureIlluminating('const x: string = ""') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = !/\bany\b/.test(content)
  const hasClear = /\b(function|=>|return)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|mangled)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDirect = /\b(try|catch|if)\b/.test(content)
  const hasRevealed = /\b(readonly|as const)\b/.test(content)
  const hasOpen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFresh = /\b(async|await|Promise)\b/.test(content)
  const hasIlluminated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasClean = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealed,
    hasOpen,
    hasFresh,
    hasIlluminated,
    hasClean,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let dawn: IlluminatingMeasure['dawn'] = 'no-clarity'
  if (clarity >= 90) dawn = 'golden-sunrise'
  else if (clarity >= 75) dawn = 'clear-dawn'
  else if (clarity >= 60) dawn = 'proper-morning'
  else if (clarity >= 40) dawn = 'gray-dawn'
  else if (clarity >= 20) dawn = 'pre-dawn'

  return {
    clarity,
    dawn,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealed,
    hasOpen,
    hasFresh,
    hasIlluminated,
    hasClean,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureAccumulating('export interface X { readonly y: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMature = !/\bany\b/.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasInsightful = /\b(import|export)\b/.test(content)
  const hasReflective = /\b(try|catch|if)\b/.test(content)
  const hasEvolved = /\b(readonly|as const)\b/.test(content)
  const hasWise = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasAccumulated = /\b(return|throw)\b/.test(content)
  const hasHistorical = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const shallowCount = (content.match(/\b(shallow|superficial|quick.fix)\b/gi) ?? []).length
  const hasValuable = shallowCount === 0
  const hasPrecious = /\b(function|=>)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasReflective,
    hasEvolved,
    hasWise,
    hasAccumulated,
    hasHistorical,
    hasValuable,
    hasPrecious,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let gem: AccumulatingMeasure['gem'] = 'no-wisdom'
  if (wisdom >= 90) gem = 'royal-emerald'
  else if (wisdom >= 75) gem = 'precious-stone'
  else if (wisdom >= 60) gem = 'proper-gem'
  else if (wisdom >= 40) gem = 'common-jade'
  else if (wisdom >= 20) gem = 'glass-bead'

  return {
    wisdom,
    gem,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasReflective,
    hasEvolved,
    hasWise,
    hasAccumulated,
    hasHistorical,
    hasValuable,
    hasPrecious,
    hackedCount,
    shallowCount,
  }
}

/** @example measureRefreshing('const x: string = ""') */
export function measureRefreshing(content: string): RefreshingMeasure {
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const staleCount = (content.match(/\b(stale|outdated|deprecated)\b/gi) ?? []).length
  const hasNoStale = staleCount === 0
  const hasModern = /\b(async|await|Promise)\b/.test(content)
  const hasNoOutdated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const clutteredCount = (content.match(/\b(cluttered|messy|disorganized)\b/gi) ?? []).length
  const hasNoCluttered = clutteredCount === 0
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRefined = !/\bany\b/.test(content)
  const hasNew = /\b(import|export)\b/.test(content)
  const hasCurrent = /\b(class|interface|type)\b/.test(content)
  const hasUpdated = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPure = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasUncontaminated = /\b(readonly|as const)\b/.test(content)
  const hasCrisp = /\b(function|=>|return)\b/.test(content)
  const hasPristine = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasClean,
    hasNoStale,
    hasModern,
    hasNoOutdated,
    hasOrganized,
    hasNoCluttered,
    hasPolished,
    hasRefined,
    hasNew,
    hasCurrent,
    hasUpdated,
    hasPure,
    hasUncontaminated,
    hasCrisp,
    hasPristine,
  ]

  const freshness = computeScore(positiveBooleans)
  const hasHighFreshness = freshness >= 60

  let dew: RefreshingMeasure['dew'] = 'no-freshness'
  if (freshness >= 90) dew = 'mountain-dew'
  else if (freshness >= 75) dew = 'fresh-rain'
  else if (freshness >= 60) dew = 'proper-moisture'
  else if (freshness >= 40) dew = 'stagnant-water'
  else if (freshness >= 20) dew = 'bone-dry'

  return {
    freshness,
    dew,
    hasHighFreshness,
    hasClean,
    hasNoStale,
    hasModern,
    hasNoOutdated,
    hasOrganized,
    hasNoCluttered,
    hasPolished,
    hasRefined,
    hasNew,
    hasCurrent,
    hasUpdated,
    hasPure,
    hasUncontaminated,
    hasCrisp,
    hasPristine,
    staleCount,
    clutteredCount,
  }
}

/** @example measureRising('try { x() } catch { y() }') */
export function measureRising(content: string): RisingMeasure {
  const hasErrorHandled = /\b(try|catch|throw)\b/.test(content)
  const unhandledCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|readonly|const)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasReliable = !/\bany\b/.test(content)
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const hasDependable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRecurring = /\b(import|export)\b/.test(content)
  const hasPersistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasUnfailing = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length === 0
  const hasSteadfast = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasPerpetual = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasReliable,
    hasConsistent,
    hasDependable,
    hasRecurring,
    hasPersistent,
    hasEnduring,
    hasUnfailing,
    hasSteadfast,
    hasPerpetual,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let sunrise: RisingMeasure['sunrise'] = 'no-resilience'
  if (resilience >= 90) sunrise = 'eternal-sun'
  else if (resilience >= 75) sunrise = 'faithful-sunrise'
  else if (resilience >= 60) sunrise = 'proper-dawn'
  else if (resilience >= 40) sunrise = 'late-morning'
  else if (resilience >= 20) sunrise = 'overcast'

  return {
    resilience,
    sunrise,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasReliable,
    hasConsistent,
    hasDependable,
    hasRecurring,
    hasPersistent,
    hasEnduring,
    hasUnfailing,
    hasSteadfast,
    hasPerpetual,
    unhandledCount,
    untestedCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeEmeraldRay(content, 'app.ts') */
export function analyzeEmeraldRay(content: string, filePath: string): EmeraldRay {
  const thriving = measureThriving(content)
  const illuminating = measureIlluminating(content)
  const accumulating = measureAccumulating(content)
  const refreshing = measureRefreshing(content)
  const rising = measureRising(content)

  const greenVitality = thriving.vitality
  const dawnClarity = illuminating.clarity
  const gemWisdom = accumulating.wisdom
  const morningFreshness = refreshing.freshness
  const sunriseResilience = rising.resilience

  const qualityScore = Math.round(
    greenVitality * 0.2 +
    dawnClarity * 0.2 +
    gemWisdom * 0.2 +
    morningFreshness * 0.2 +
    sunriseResilience * 0.2,
  )

  const condition = classifyRayCondition(qualityScore)

  return {
    file: filePath,
    greenVitality,
    dawnClarity,
    gemWisdom,
    morningFreshness,
    sunriseResilience,
    thriving,
    illuminating,
    accumulating,
    refreshing,
    rising,
    condition,
    qualityScore,
  }
}

/** @example analyzeEmeraldGarden(rays, 'src') */
export function analyzeEmeraldGarden(rays: EmeraldRay[], dirPath: string): EmeraldGarden {
  if (rays.length === 0) {
    return {
      directory: dirPath,
      rays: [],
      avgVitality: 0,
      avgClarity: 0,
      avgWisdom: 0,
      emeraldMasterpieceCount: 0,
      voidCount: 0,
      gardenType: 'no-garden',
      condition: 'void',
    }
  }

  const avgVitality = Math.round(
    rays.reduce((s, r) => s + r.greenVitality, 0) / rays.length,
  )
  const avgClarity = Math.round(
    rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length,
  )
  const avgWisdom = Math.round(
    rays.reduce((s, r) => s + r.gemWisdom, 0) / rays.length,
  )

  const emeraldMasterpieceCount = rays.filter(
    (r) => r.condition === 'emerald-masterpiece',
  ).length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const gardenType = classifyGardenType(rays)
  const avgQuality = Math.round(
    rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length,
  )
  const condition = classifyGardenCondition(avgQuality)

  return {
    directory: dirPath,
    rays,
    avgVitality,
    avgClarity,
    avgWisdom,
    emeraldMasterpieceCount,
    voidCount,
    gardenType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldSunriseResult(['a.ts'], [content]) */
export async function buildEmeraldSunriseResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldSunriseResult> {
  const rays: EmeraldRay[] = files.map((file, i) =>
    analyzeEmeraldRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, EmeraldRay[]>()
  for (const ray of rays) {
    const dir = ray.file.includes('/')
      ? ray.file.substring(0, ray.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const gardens: EmeraldGarden[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeEmeraldGarden(dirRays, dir),
  )

  const avgVitality =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.greenVitality, 0) / rays.length)
      : 0
  const avgClarity =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
      : 0
  const avgWisdom =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.gemWisdom, 0) / rays.length)
      : 0

  const overallRadiance =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
      : 0
  const isEmerald = overallRadiance >= 60

  const morning = { avgVitality, avgClarity, avgWisdom, isEmerald, overallRadiance }

  const avgGreenVitality = avgVitality
  const avgDawnClarity = avgClarity
  const avgGemWisdom = avgWisdom
  const avgMorningFreshness =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.morningFreshness, 0) / rays.length)
      : 0
  const avgSunriseResilience =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.sunriseResilience, 0) / rays.length)
      : 0

  const emeraldMasterpieceCount = rays.filter(
    (r) => r.condition === 'emerald-masterpiece',
  ).length
  const dawnJewelCount = rays.filter(
    (r) => r.condition === 'dawn-jewel',
  ).length
  const properGemCount = rays.filter(
    (r) => r.condition === 'proper-gem',
  ).length
  const cloudyStoneCount = rays.filter(
    (r) => r.condition === 'cloudy-stone',
  ).length
  const dullRockCount = rays.filter(
    (r) => r.condition === 'dull-rock',
  ).length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighVitalityCount = rays.filter(
    (r) => r.thriving.hasHighVitality,
  ).length
  const hasHighClarityCount = rays.filter(
    (r) => r.illuminating.hasHighClarity,
  ).length
  const hasHighWisdomCount = rays.filter(
    (r) => r.accumulating.hasHighWisdom,
  ).length
  const hasHighFreshnessCount = rays.filter(
    (r) => r.refreshing.hasHighFreshness,
  ).length
  const hasHighResilienceCount = rays.filter(
    (r) => r.rising.hasHighResilience,
  ).length

  const lapidaryGrade = classifyLapidaryGrade(overallRadiance)

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file
    : ''
  const mostVital = rays.length > 0
    ? rays.reduce((best, r) => (r.greenVitality > best.greenVitality ? r : best)).file
    : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => (r.dawnClarity > best.dawnClarity ? r : best)).file
    : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => (r.gemWisdom > best.gemWisdom ? r : best)).file
    : ''
  const freshest = rays.length > 0
    ? rays.reduce((best, r) => (r.morningFreshness > best.morningFreshness ? r : best)).file
    : ''
  const mostResilient = rays.length > 0
    ? rays.reduce((best, r) => (r.sunriseResilience > best.sunriseResilience ? r : best)).file
    : ''

  const stats: EmeraldSunriseResult['stats'] = {
    totalFiles: files.length,
    totalGardens: gardens.length,
    avgGreenVitality,
    avgDawnClarity,
    avgGemWisdom,
    avgMorningFreshness,
    avgSunriseResilience,
    emeraldMasterpieceCount,
    dawnJewelCount,
    properGemCount,
    cloudyStoneCount,
    dullRockCount,
    voidCount,
    hasHighVitalityCount,
    hasHighClarityCount,
    hasHighWisdomCount,
    hasHighFreshnessCount,
    hasHighResilienceCount,
    overallRadiance,
    lapidaryGrade,
    bestRay,
    mostVital,
    clearest,
    wisest,
    freshest,
    mostResilient,
  }

  const recommendations = generateRecommendations(rays, gardens, morning, stats)

  return { rays, gardens, morning, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, gardens, morning, stats) */
export function generateRecommendations(
  rays: EmeraldRay[],
  gardens: EmeraldGarden[],
  _morning: EmeraldSunriseResult['morning'],
  stats: EmeraldSunriseResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGreenVitality >= 90 &&
    stats.avgDawnClarity >= 90 &&
    stats.avgGemWisdom >= 90 &&
    stats.avgMorningFreshness >= 90 &&
    stats.avgSunriseResilience >= 90
  ) {
    recs.push(
      'Your emerald sunrise is a masterpiece of living light! Each ray combines the vitality of ancient forests with the clarity of the first dawn!',
    )
    return recs
  }

  if (stats.avgGreenVitality < 60) {
    recs.push(
      'Nurture the green vitality — emerald is the color of life itself; your code should grow with the energy of spring reaching for the sun',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Brighten the dawn clarity — the first light of morning reveals everything without harshness; your code should illuminate rather than obscure',
    )
  }

  if (stats.avgGemWisdom < 60) {
    recs.push(
      'Deepen the gem wisdom — emeralds have been treasured for wisdom since antiquity; your code should accumulate precious knowledge over time',
    )
  }

  if (stats.avgMorningFreshness < 60) {
    recs.push(
      'Restore the morning freshness — dawn dew represents purity and renewal; your code should feel as clean as the world after overnight rain',
    )
  }

  if (stats.avgSunriseResilience < 60) {
    recs.push(
      'Strengthen the sunrise resilience — the dawn rises again each day without fail; your code core must be equally dependable through every cycle',
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The garden lies in shadow — until the first emerald ray pierces the darkness, no sunrise can begin',
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(
      `Re-examine these dull rocks: ${voidRays.map((r) => r.file).join(', ')}`,
    )
  } else if (voidRays.length > 5) {
    recs.push(
      `Re-examine these ${voidRays.length} dull rocks before the entire garden turns barren`,
    )
  }

  const poorGardens = gardens.filter(
    (g) => g.condition === 'void' || g.condition === 'desert',
  )
  if (poorGardens.length === gardens.length && gardens.length > 0) {
    recs.push(
      'All gardens have turned to desert — the emerald sunrise needs a complete replanting',
    )
  }

  if (recs.length === 0) {
    recs.push('Your emerald garden glows in the morning light — each ray carries the vitality of living gems through the pure clarity of dawn')
  }

  return recs
}
