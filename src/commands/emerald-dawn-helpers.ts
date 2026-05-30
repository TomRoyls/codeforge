// ─── Interfaces ──────────────────────────────────────────

export interface GrowingMeasure {
  vitality: number
  garden:
    | 'lush-rainforest'
    | 'thriving-garden'
    | 'proper-green'
    | 'wilting-plant'
    | 'barren-desert'
    | 'no-vitality'
  hasHighVitality: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasActive: boolean
  hasNoDead: boolean
  hasThriving: boolean
  hasNoDecaying: boolean
  hasAlive: boolean
  hasNoZombie: boolean
  hasGrowing: boolean
  hasNoShrinking: boolean
  hasConnected: boolean
  hasNoIsolated: boolean
  hasContributing: boolean
  hasNoParasitic: boolean
  hasVibrant: boolean
  stagnantCount: number
  deadCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  light:
    | 'golden-dawn'
    | 'clear-morning'
    | 'proper-twilight'
    | 'foggy-dawn'
    | 'dark-night'
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
  hasNoUndocumented: boolean
  hasIlluminated: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  emerald:
    | 'ancient-gem'
    | 'wise-stone'
    | 'proper-crystal'
    | 'raw-mineral'
    | 'common-rock'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasStrategic: boolean
  hackedCount: number
  adHocCount: number
}

export interface RefreshingMeasure {
  freshness: number
  dew:
    | 'morning-dew'
    | 'fresh-breeze'
    | 'proper-air'
    | 'stale-room'
    | 'stagnant-pond'
    | 'no-freshness'
  hasHighFreshness: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasModern: boolean
  hasNoLegacy: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasRenewed: boolean
  dirtyCount: number
  untestedCount: number
}

export interface RisingMeasure {
  resilience: number
  dawn:
    | 'eternal-sunrise'
    | 'reliable-dawn'
    | 'proper-morning'
    | 'occasional-dawn'
    | 'perpetual-night'
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
  hasRenewable: boolean
  hasNoDisposable: boolean
  hasPersistent: boolean
  hasNoQuitting: boolean
  hasAntifragile: boolean
  bareCrashCount: number
  fragileCount: number
}

export type RayCondition =
  | 'emerald-masterpiece'
  | 'green-paradise'
  | 'proper-garden'
  | 'wilting-bed'
  | 'barren-soil'
  | 'void'

export interface EmeraldRay {
  file: string
  greenVitality: number
  dawnClarity: number
  gemWisdom: number
  morningFreshness: number
  sunriseResilience: number
  growing: GrowingMeasure
  illuminating: IlluminatingMeasure
  knowing: KnowingMeasure
  refreshing: RefreshingMeasure
  rising: RisingMeasure
  condition: RayCondition
  qualityScore: number
}

export type GardenType =
  | 'emerald-oasis'
  | 'green-garden'
  | 'proper-patch'
  | 'small-plot'
  | 'barren-ground'
  | 'no-garden'

export type GardenCondition =
  | 'paradise-garden'
  | 'emerald-haven'
  | 'proper-plot'
  | 'wilting-bed'
  | 'barren-soil'
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

export type GardenerGrade =
  | 'emerald-sage'
  | 'garden-master'
  | 'green-thumb'
  | 'apprentice'
  | 'novice'
  | 'black-thumb'

export interface EmeraldDawnStats {
  totalFiles: number
  totalGardens: number
  avgGreenVitality: number
  avgDawnClarity: number
  avgGemWisdom: number
  avgMorningFreshness: number
  avgSunriseResilience: number
  emeraldMasterpieceCount: number
  greenParadiseCount: number
  properGardenCount: number
  wiltingBedCount: number
  barrenSoilCount: number
  voidCount: number
  hasHighVitalityCount: number
  hasHighClarityCount: number
  hasHighWisdomCount: number
  hasHighFreshnessCount: number
  hasHighResilienceCount: number
  overallBrilliance: number
  gardenerGrade: GardenerGrade
  bestRay: string
  mostVital: string
  clearest: string
  wisest: string
  freshest: string
  mostResilient: string
}

export interface EmeraldDawnResult {
  rays: EmeraldRay[]
  gardens: EmeraldGarden[]
  sunrise: {
    avgVitality: number
    avgClarity: number
    avgWisdom: number
    isEmerald: boolean
    overallBrilliance: number
  }
  stats: EmeraldDawnStats
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

/** @example measureGrowing('export class Foo { }') */
export function measureGrowing(content: string): GrowingMeasure {
  const hasEvolving = /\b(readonly|private|protected)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|frozen|locked)\b/gi) ?? []).length
  const hasNoStagnant = stagnantCount === 0
  const hasActive = /\b(async|await|Promise)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|deprecated)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasThriving = /\b(export|readonly|=>)\b/.test(content)
  const hasNoDecaying = !/\b(decaying|rotting|withering)\b/i.test(content)
  const hasAlive = /\b(class|interface|type|function)\b/.test(content)
  const hasNoZombie = !/\b(zombie|stale|rotten)\b/i.test(content)
  const hasGrowing = /\b(import|export|from)\b/.test(content)
  const hasNoShrinking = !/\b(shrinking|declining|fading)\b/i.test(content)
  const hasConnected = /\b(import|export|from)\b/.test(content)
  const hasNoIsolated = !/\b(isolated|orphan|alone)\b/i.test(content)
  const hasContributing = /\b(return|yield|emit)\b/.test(content)
  const hasNoParasitic = !/\b(parasitic|leech|drain)\b/i.test(content)
  const hasVibrant = /\b(try|catch|if|throw)\b/.test(content)

  const positiveBooleans = [
    hasEvolving,
    hasActive,
    hasThriving,
    hasAlive,
    hasGrowing,
    hasConnected,
    hasContributing,
    hasVibrant,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60
  const garden = classifyGarden(vitality)

  return {
    vitality,
    garden,
    hasHighVitality,
    hasEvolving,
    hasNoStagnant,
    hasActive,
    hasNoDead,
    hasThriving,
    hasNoDecaying,
    hasAlive,
    hasNoZombie,
    hasGrowing,
    hasNoShrinking,
    hasConnected,
    hasNoIsolated,
    hasContributing,
    hasNoParasitic,
    hasVibrant,
    stagnantCount,
    deadCount,
  }
}

/** @example measureIlluminating('export function add(): number { }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\w+\.\w+/.test(content)
  const crypticCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /\bexport\b/.test(content)
  const obfuscatedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasUnderstandable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasVisible = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoInvisible = !/\b(invisible|hidden|concealed)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasIlluminated = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDocumented,
    hasIlluminated,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const light = classifyLight(clarity)

  return {
    clarity,
    light,
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
    hasNoUndocumented,
    hasIlluminated,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureKnowing('export const PROVEN = true as const') */
export function measureKnowing(content: string): KnowingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasMature,
    hasDeep,
    hasInsightful,
    hasPatterned,
    hasStrategic,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const emerald = classifyEmerald(wisdom)

  return {
    wisdom,
    emerald,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasPatterned,
    hasNoReinvented,
    hasStrategic,
    hackedCount,
    adHocCount,
  }
}

/** @example measureRefreshing('export async function clean(): Promise<void> { }') */
export function measureRefreshing(content: string): RefreshingMeasure {
  const hasClean = !content.includes('@ts-ignore')
  const dirtyCount = (content.match(/\b(dirty|messy|hacky)\b/gi) ?? []).length
  const hasNoDirty = dirtyCount === 0
  const hasModern = /\b(async|await|Promise)\b/.test(content)
  const hasNoLegacy = !/\b(legacy|outdated|old)\b/i.test(content)
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = (content.match(/\bany\b/g) ?? []).length === 0
  const hasEfficient = /\b(readonly|const|=>)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|slow)\b/i.test(content)
  const hasPolished = /\b(readonly|=>|export|async)\b/.test(content)
  const hasNoRough = !/\b(rough|draft|wip)\b/i.test(content)
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoChaotic = !/\b(chaotic|mess|disorder)\b/i.test(content)
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasRenewed = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasClean,
    hasModern,
    hasTypeSafe,
    hasEfficient,
    hasPolished,
    hasWellStructured,
    hasTested,
    hasRenewed,
  ]

  const freshness = computeScore(positiveBooleans)
  const hasHighFreshness = freshness >= 60
  const dew = classifyDew(freshness)

  return {
    freshness,
    dew,
    hasHighFreshness,
    hasClean,
    hasNoDirty,
    hasModern,
    hasNoLegacy,
    hasTypeSafe,
    hasNoUnsafe,
    hasEfficient,
    hasNoWasteful,
    hasPolished,
    hasNoRough,
    hasWellStructured,
    hasNoChaotic,
    hasTested,
    hasNoUntested,
    hasRenewed,
    dirtyCount,
    untestedCount,
  }
}

/** @example measureRising('try { foo() } catch { bar() }') */
export function measureRising(content: string): RisingMeasure {
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
  const hasRenewable = /\b(async|await|Promise)\b/.test(content)
  const hasNoDisposable = !/\b(disposable|temporary|throwaway)\b/i.test(content)
  const hasPersistent = /\b(readonly|freeze|sealed)\b/.test(content)
  const hasNoQuitting = !/\b(quit|give\s*up|surrender)\b/i.test(content)
  const hasAntifragile = /\b(test|spec|mock|stub)\b/i.test(content) || (/\btry\b/.test(content) && /\bcatch\b/.test(content))

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasRenewable,
    hasPersistent,
    hasAntifragile,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const dawn = classifyDawn(resilience)

  return {
    resilience,
    dawn,
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
    hasRenewable,
    hasNoDisposable,
    hasPersistent,
    hasNoQuitting,
    hasAntifragile,
    bareCrashCount,
    fragileCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyGarden(score: number): GrowingMeasure['garden'] {
  if (score >= 90) return 'lush-rainforest'
  if (score >= 75) return 'thriving-garden'
  if (score >= 60) return 'proper-green'
  if (score >= 40) return 'wilting-plant'
  if (score >= 20) return 'barren-desert'
  return 'no-vitality'
}

function classifyLight(score: number): IlluminatingMeasure['light'] {
  if (score >= 90) return 'golden-dawn'
  if (score >= 75) return 'clear-morning'
  if (score >= 60) return 'proper-twilight'
  if (score >= 40) return 'foggy-dawn'
  if (score >= 20) return 'dark-night'
  return 'no-clarity'
}

function classifyEmerald(score: number): KnowingMeasure['emerald'] {
  if (score >= 90) return 'ancient-gem'
  if (score >= 75) return 'wise-stone'
  if (score >= 60) return 'proper-crystal'
  if (score >= 40) return 'raw-mineral'
  if (score >= 20) return 'common-rock'
  return 'no-wisdom'
}

function classifyDew(score: number): RefreshingMeasure['dew'] {
  if (score >= 90) return 'morning-dew'
  if (score >= 75) return 'fresh-breeze'
  if (score >= 60) return 'proper-air'
  if (score >= 40) return 'stale-room'
  if (score >= 20) return 'stagnant-pond'
  return 'no-freshness'
}

function classifyDawn(score: number): RisingMeasure['dawn'] {
  if (score >= 90) return 'eternal-sunrise'
  if (score >= 75) return 'reliable-dawn'
  if (score >= 60) return 'proper-morning'
  if (score >= 40) return 'occasional-dawn'
  if (score >= 20) return 'perpetual-night'
  return 'no-resilience'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): RayCondition {
  if (score >= 90) return 'emerald-masterpiece'
  if (score >= 75) return 'green-paradise'
  if (score >= 60) return 'proper-garden'
  if (score >= 40) return 'wilting-bed'
  if (score >= 20) return 'barren-soil'
  return 'void'
}

/** @example classifyGardenType(rays) */
export function classifyGardenType(rays: EmeraldRay[]): GardenType {
  if (rays.length === 0) return 'no-garden'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 90) return 'emerald-oasis'
  if (avg >= 75) return 'green-garden'
  if (avg >= 60) return 'proper-patch'
  if (avg >= 40) return 'small-plot'
  if (avg >= 20) return 'barren-ground'
  return 'no-garden'
}

/** @example classifyGardenCondition(avgVitality) */
export function classifyGardenCondition(avgVitality: number): GardenCondition {
  if (avgVitality >= 85) return 'paradise-garden'
  if (avgVitality >= 70) return 'emerald-haven'
  if (avgVitality >= 55) return 'proper-plot'
  if (avgVitality >= 35) return 'wilting-bed'
  if (avgVitality >= 15) return 'barren-soil'
  return 'void'
}

/** @example classifyGardenerGrade(80) */
export function classifyGardenerGrade(avgBrilliance: number): GardenerGrade {
  if (avgBrilliance >= 80) return 'emerald-sage'
  if (avgBrilliance >= 65) return 'garden-master'
  if (avgBrilliance >= 50) return 'green-thumb'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'black-thumb'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeEmeraldRay(content, 'app.ts') */
export function analyzeEmeraldRay(content: string, filePath: string): EmeraldRay {
  const growing = measureGrowing(content)
  const illuminating = measureIlluminating(content)
  const knowing = measureKnowing(content)
  const refreshing = measureRefreshing(content)
  const rising = measureRising(content)

  const greenVitality = growing.vitality
  const dawnClarity = illuminating.clarity
  const gemWisdom = knowing.wisdom
  const morningFreshness = refreshing.freshness
  const sunriseResilience = rising.resilience

  const qualityScore = Math.round(
    greenVitality * 0.2 +
    dawnClarity * 0.2 +
    gemWisdom * 0.2 +
    morningFreshness * 0.2 +
    sunriseResilience * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    greenVitality,
    dawnClarity,
    gemWisdom,
    morningFreshness,
    sunriseResilience,
    growing,
    illuminating,
    knowing,
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

/** @example buildEmeraldDawnResult(['a.ts'], [content]) */
export async function buildEmeraldDawnResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldDawnResult> {
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

  const overallBrilliance =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
      : 0
  const isEmerald = overallBrilliance >= 60

  const sunrise = { avgVitality, avgClarity, avgWisdom, isEmerald, overallBrilliance }

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
  const greenParadiseCount = rays.filter((r) => r.condition === 'green-paradise').length
  const properGardenCount = rays.filter((r) => r.condition === 'proper-garden').length
  const wiltingBedCount = rays.filter((r) => r.condition === 'wilting-bed').length
  const barrenSoilCount = rays.filter((r) => r.condition === 'barren-soil').length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighVitalityCount = rays.filter((r) => r.growing.hasHighVitality).length
  const hasHighClarityCount = rays.filter((r) => r.illuminating.hasHighClarity).length
  const hasHighWisdomCount = rays.filter((r) => r.knowing.hasHighWisdom).length
  const hasHighFreshnessCount = rays.filter((r) => r.refreshing.hasHighFreshness).length
  const hasHighResilienceCount = rays.filter((r) => r.rising.hasHighResilience).length

  const gardenerGrade = classifyGardenerGrade(overallBrilliance)

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

  const stats: EmeraldDawnStats = {
    totalFiles: files.length,
    totalGardens: gardens.length,
    avgGreenVitality,
    avgDawnClarity,
    avgGemWisdom,
    avgMorningFreshness,
    avgSunriseResilience,
    emeraldMasterpieceCount,
    greenParadiseCount,
    properGardenCount,
    wiltingBedCount,
    barrenSoilCount,
    voidCount,
    hasHighVitalityCount,
    hasHighClarityCount,
    hasHighWisdomCount,
    hasHighFreshnessCount,
    hasHighResilienceCount,
    overallBrilliance,
    gardenerGrade,
    bestRay,
    mostVital,
    clearest,
    wisest,
    freshest,
    mostResilient,
  }

  const recommendations = generateRecommendations(rays, gardens, sunrise, stats)

  return { rays, gardens, sunrise, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, gardens, sunrise, stats) */
export function generateRecommendations(
  rays: EmeraldRay[],
  gardens: EmeraldGarden[],
  _sunrise: EmeraldDawnResult['sunrise'],
  stats: EmeraldDawnStats,
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
      'Your emerald dawn glows with perfect green brilliance! Every ray is a masterpiece of living light',
    )
    return recs
  }

  if (stats.avgGreenVitality < 60) {
    recs.push(
      'Nurture green vitality — code should grow and thrive like the lushest emerald rainforest',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Bring dawn clarity — code should illuminate understanding like the golden light of morning',
    )
  }

  if (stats.avgGemWisdom < 60) {
    recs.push(
      'Deepen gem wisdom — code should carry the ancient knowledge of emerald crystals',
    )
  }

  if (stats.avgMorningFreshness < 60) {
    recs.push(
      'Restore morning freshness — code should feel clean and renewed like dew on emerald leaves',
    )
  }

  if (stats.avgSunriseResilience < 60) {
    recs.push(
      'Strengthen sunrise resilience — code must rise again each day like the eternal dawn',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The emerald light has faded — focus on planting the seeds of quality before the garden withers',
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(
      `Nurture these barren plots: ${voidRays.map((r) => r.file).join(', ')}`,
    )
  } else if (voidRays.length > 5) {
    recs.push(
      `Nurture these ${voidRays.length} barren plots before the garden dies`,
    )
  }

  const poorGardens = gardens.filter(
    (g) => g.condition === 'void' || g.condition === 'wilting-bed',
  )
  if (poorGardens.length === gardens.length && gardens.length > 0) {
    recs.push(
      'All gardens show signs of wilting — consider a comprehensive replanting of the codebase',
    )
  }

  if (recs.length === 0) {
    recs.push('Your emerald garden flourishes — keep tending the green light of quality')
  }

  return recs
}
