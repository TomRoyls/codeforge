// ─── Interfaces ──────────────────────────────────────────

export interface BlossomingMeasure {
  bloom: number
  petal:
    | 'luminous-bloom'
    | 'night-orchid'
    | 'proper-nocturne'
    | 'wilted-flower'
    | 'dead-petal'
    | 'no-bloom'
  hasHighBloom: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasThriving: boolean
  hasNoDecaying: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasContributing: boolean
  hasNoParasitic: boolean
  hasAdaptive: boolean
  hasNoFixed: boolean
  hasVibrant: boolean
  hasUnconventional: boolean
  isolatedCount: number
  deadCount: number
}

export interface DeepeningMeasure {
  depth: number
  shadow:
    | 'profound-depth'
    | 'rich-shadow'
    | 'proper-darkness'
    | 'surface-gloom'
    | 'no-shadow'
    | 'no-depth'
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasStrategic: boolean
  hasLayered: boolean
  hackedCount: number
  adHocCount: number
}

export interface RevealingMeasure {
  clarity: number
  moon:
    | 'silver-light'
    | 'moonbeam'
    | 'proper-glow'
    | 'dim-light'
    | 'no-moon'
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
  hasNuanced: boolean
  hasSubtle: boolean
  hasDocumented: boolean
  hasDifferentAngle: boolean
  hasIlluminated: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ScentingMeasure {
  fragrance: number
  scent:
    | 'intoxicating'
    | 'carrying-far'
    | 'proper-fragrance'
    | 'faint-whiff'
    | 'no-scent'
    | 'no-fragrance'
  hasHighFragrance: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasSubtle: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasGraceful: boolean
  hasPervasive: boolean
  tangledCount: number
  scatteredCount: number
}

export interface EnduringMeasure {
  resilience: number
  night:
    | 'nocturnal-master'
    | 'dark-survivor'
    | 'proper-night'
    | 'light-dependent'
    | 'blind-in-dark'
    | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasRobust: boolean
  hasAdaptive: boolean
  hasAntifragile: boolean
  bareCrashCount: number
  untestedCount: number
}

export type FlowerCondition =
  | 'midnight-masterpiece'
  | 'moonlit-paradise'
  | 'proper-garden'
  | 'dim-plot'
  | 'barren-earth'
  | 'void'

export interface Moonflower {
  file: string
  nocturnalBloom: number
  shadowDepth: number
  moonlitClarity: number
  nightFragrance: number
  darkResilience: number
  blossoming: BlossomingMeasure
  deepening: DeepeningMeasure
  revealing: RevealingMeasure
  scenting: ScentingMeasure
  enduring: EnduringMeasure
  condition: FlowerCondition
  qualityScore: number
}

export type GardenType =
  | 'secret-garden'
  | 'moonlit-grove'
  | 'proper-bed'
  | 'small-patch'
  | 'barren-ground'
  | 'no-garden'

export type GardenCondition =
  | 'nocturnal-paradise'
  | 'moonlit-garden'
  | 'proper-plot'
  | 'dim-corner'
  | 'barren-earth'
  | 'void'

export interface MoonGarden {
  directory: string
  flowers: Moonflower[]
  avgBloom: number
  avgDepth: number
  avgResilience: number
  midnightMasterpieceCount: number
  voidCount: number
  gardenType: GardenType
  condition: GardenCondition
}

export type GardenerGrade =
  | 'night-botanist'
  | 'shadow-gardener'
  | 'moon-cultivator'
  | 'apprentice'
  | 'novice'
  | 'day-worker'

export interface MidnightBloomStats {
  totalFiles: number
  totalGardens: number
  avgNocturnalBloom: number
  avgShadowDepth: number
  avgMoonlitClarity: number
  avgNightFragrance: number
  avgDarkResilience: number
  midnightMasterpieceCount: number
  moonlitParadiseCount: number
  properGardenCount: number
  dimPlotCount: number
  barrenEarthCount: number
  voidCount: number
  hasHighBloomCount: number
  hasHighDepthCount: number
  hasHighClarityCount: number
  hasHighFragranceCount: number
  hasHighResilienceCount: number
  overallLuminosity: number
  gardenerGrade: GardenerGrade
  bestFlower: string
  mostBlooming: string
  deepest: string
  clearest: string
  mostFragrant: string
  mostResilient: string
}

export interface MidnightBloomResult {
  flowers: Moonflower[]
  gardens: MoonGarden[]
  night: {
    avgBloom: number
    avgDepth: number
    avgResilience: number
    isMidnight: boolean
    overallLuminosity: number
  }
  stats: MidnightBloomStats
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

/** @example measureBlossoming('export async function bloom(): Promise<void> { }') */
export function measureBlossoming(content: string): BlossomingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|standalone|unused)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const hasNoStagnant = !/\b(stagnant|frozen)\b/i.test(content)
  const hasThriving = /\b(function|class|=|=>|async)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|deprecated)\b/gi) ?? []).length
  const hasNoDecaying = deadCount === 0
  const hasAlive = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoDead = !/\b(zombie|undead)\b/i.test(content)
  const hasContributing = /\b(return|export|yield)\b/.test(content)
  const hasNoParasitic = !/\b(parasitic|leech|drain)\b/i.test(content)
  const hasAdaptive = /\b(class|interface|type)\b/.test(content)
  const hasNoFixed = !/\b(fixed|rigid|inflexible)\b/i.test(content)
  const hasVibrant = /\b(readonly|const|as const)\b/.test(content)
  const hasUnconventional = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasEvolving,
    hasThriving,
    hasAlive,
    hasContributing,
    hasAdaptive,
    hasVibrant,
    hasUnconventional,
  ]

  const bloom = computeScore(positiveBooleans)
  const hasHighBloom = bloom >= 60
  const petal = classifyPetal(bloom)

  return {
    bloom,
    petal,
    hasHighBloom,
    hasExported,
    hasNoIsolated,
    hasEvolving,
    hasNoStagnant,
    hasThriving,
    hasNoDecaying,
    hasAlive,
    hasNoDead,
    hasContributing,
    hasNoParasitic,
    hasAdaptive,
    hasNoFixed,
    hasVibrant,
    hasUnconventional,
    isolatedCount,
    deadCount,
  }
}

/** @example measureDeepening('export interface Config { readonly name: string }') */
export function measureDeepening(content: string): DeepeningMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\b(function|class|interface)\b/.test(content)
  const hasNoObvious = !/\b(obvious|trivial|simple)\b/i.test(content)
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasStrategic = /\b(import|export|from)\b/.test(content)
  const hasLayered = /\b(try|catch|if|throw)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasDeep,
    hasInsightful,
    hasPrincipled,
    hasPatterned,
    hasMature,
    hasProven,
    hasStrategic,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60
  const shadow = classifyShadow(depth)

  return {
    depth,
    shadow,
    hasHighDepth,
    hasWellArchitected,
    hasNoHacked,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasPrincipled,
    hasNoAdHoc,
    hasPatterned,
    hasNoReinvented,
    hasMature,
    hasNoNaive,
    hasProven,
    hasStrategic,
    hasLayered,
    hackedCount,
    adHocCount,
  }
}

/** @example measureRevealing('export function analyze(): void { }') */
export function measureRevealing(content: string): RevealingMeasure {
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
  const hasNuanced = /\b(readonly|type|interface)\b/.test(content)
  const hasSubtle = /\b(export|public)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDifferentAngle = /\b(async|await|Promise)\b/.test(content)
  const hasIlluminated = /\b(return|yield|emit)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasSubtle,
    hasDocumented,
    hasIlluminated,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const moon = classifyMoon(clarity)

  return {
    clarity,
    moon,
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
    hasNuanced,
    hasSubtle,
    hasDocumented,
    hasDifferentAngle,
    hasIlluminated,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureScenting('export class Analyzer<T> { }') */
export function measureScenting(content: string): ScentingMeasure {
  const hasCleanPipelines = /\b(import|export|from)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|messy)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasOrganized = /\b(class|interface|type|enum)\b/.test(content)
  const scatteredCount = (content.match(/\b(scattered|fragmented|dispersed)\b/gi) ?? []).length
  const hasNoScattered = scatteredCount === 0
  const hasModular = /\b(export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god.object|mega)\b/i.test(content)
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|bloated)\b/i.test(content)
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasNoClunky = !/\b(clunky|awkward|ugly)\b/i.test(content)
  const hasSubtle = /\b(type|interface|<\w+>)\b/.test(content)
  const hasRefined = /\b(function|class|interface)\b/.test(content)
  const hasPolished = /\b(try|catch|if|throw)\b/.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasPervasive = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasCleanPipelines,
    hasOrganized,
    hasModular,
    hasEfficient,
    hasElegant,
    hasSubtle,
    hasRefined,
    hasPolished,
  ]

  const fragrance = computeScore(positiveBooleans)
  const hasHighFragrance = fragrance >= 60
  const scent = classifyScent(fragrance)

  return {
    fragrance,
    scent,
    hasHighFragrance,
    hasCleanPipelines,
    hasNoTangled,
    hasOrganized,
    hasNoScattered,
    hasModular,
    hasNoMonolithic,
    hasEfficient,
    hasNoWasteful,
    hasElegant,
    hasNoClunky,
    hasSubtle,
    hasRefined,
    hasPolished,
    hasGraceful,
    hasPervasive,
    tangledCount,
    scatteredCount,
  }
}

/** @example measureEnduring('try { bloom() } catch { recover() }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = (content.match(/\bany\b/g) ?? []).length === 0
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasAntifragile = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasTested,
    hasDefensive,
    hasTypeSafe,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasAdaptive,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const night = classifyNight(resilience)

  return {
    resilience,
    night,
    hasHighResilience,
    hasErrorHandled,
    hasNoBareCrash,
    hasTested,
    hasNoUntested,
    hasDefensive,
    hasNoNaive,
    hasTypeSafe,
    hasNoUnsafe,
    hasGraceful,
    hasNoHarshFail,
    hasRecoverable,
    hasNoFatal,
    hasRobust,
    hasAdaptive,
    hasAntifragile,
    bareCrashCount,
    untestedCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyPetal(score: number): BlossomingMeasure['petal'] {
  if (score >= 90) return 'luminous-bloom'
  if (score >= 75) return 'night-orchid'
  if (score >= 60) return 'proper-nocturne'
  if (score >= 40) return 'wilted-flower'
  if (score >= 20) return 'dead-petal'
  return 'no-bloom'
}

function classifyShadow(score: number): DeepeningMeasure['shadow'] {
  if (score >= 90) return 'profound-depth'
  if (score >= 75) return 'rich-shadow'
  if (score >= 60) return 'proper-darkness'
  if (score >= 40) return 'surface-gloom'
  if (score >= 20) return 'no-shadow'
  return 'no-depth'
}

function classifyMoon(score: number): RevealingMeasure['moon'] {
  if (score >= 90) return 'silver-light'
  if (score >= 75) return 'moonbeam'
  if (score >= 60) return 'proper-glow'
  if (score >= 40) return 'dim-light'
  if (score >= 20) return 'no-moon'
  return 'no-clarity'
}

function classifyScent(score: number): ScentingMeasure['scent'] {
  if (score >= 90) return 'intoxicating'
  if (score >= 75) return 'carrying-far'
  if (score >= 60) return 'proper-fragrance'
  if (score >= 40) return 'faint-whiff'
  if (score >= 20) return 'no-scent'
  return 'no-fragrance'
}

function classifyNight(score: number): EnduringMeasure['night'] {
  if (score >= 90) return 'nocturnal-master'
  if (score >= 75) return 'dark-survivor'
  if (score >= 60) return 'proper-night'
  if (score >= 40) return 'light-dependent'
  if (score >= 20) return 'blind-in-dark'
  return 'no-resilience'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): FlowerCondition {
  if (score >= 90) return 'midnight-masterpiece'
  if (score >= 75) return 'moonlit-paradise'
  if (score >= 60) return 'proper-garden'
  if (score >= 40) return 'dim-plot'
  if (score >= 20) return 'barren-earth'
  return 'void'
}

/** @example classifyGardenType(flowers) */
export function classifyGardenType(flowers: Moonflower[]): GardenType {
  if (flowers.length === 0) return 'no-garden'
  const avg = flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length
  if (avg >= 90) return 'secret-garden'
  if (avg >= 75) return 'moonlit-grove'
  if (avg >= 60) return 'proper-bed'
  if (avg >= 40) return 'small-patch'
  if (avg >= 20) return 'barren-ground'
  return 'no-garden'
}

/** @example classifyGardenCondition(avgBloom) */
export function classifyGardenCondition(avgBloom: number): GardenCondition {
  if (avgBloom >= 85) return 'nocturnal-paradise'
  if (avgBloom >= 70) return 'moonlit-garden'
  if (avgBloom >= 55) return 'proper-plot'
  if (avgBloom >= 35) return 'dim-corner'
  if (avgBloom >= 15) return 'barren-earth'
  return 'void'
}

/** @example classifyGardenerGrade(80) */
export function classifyGardenerGrade(avgLuminosity: number): GardenerGrade {
  if (avgLuminosity >= 80) return 'night-botanist'
  if (avgLuminosity >= 65) return 'shadow-gardener'
  if (avgLuminosity >= 50) return 'moon-cultivator'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'day-worker'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeMoonflower(content, 'app.ts') */
export function analyzeMoonflower(content: string, filePath: string): Moonflower {
  const blossoming = measureBlossoming(content)
  const deepening = measureDeepening(content)
  const revealing = measureRevealing(content)
  const scenting = measureScenting(content)
  const enduring = measureEnduring(content)

  const nocturnalBloom = blossoming.bloom
  const shadowDepth = deepening.depth
  const moonlitClarity = revealing.clarity
  const nightFragrance = scenting.fragrance
  const darkResilience = enduring.resilience

  const qualityScore = Math.round(
    nocturnalBloom * 0.2 +
    shadowDepth * 0.2 +
    moonlitClarity * 0.2 +
    nightFragrance * 0.2 +
    darkResilience * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    nocturnalBloom,
    shadowDepth,
    moonlitClarity,
    nightFragrance,
    darkResilience,
    blossoming,
    deepening,
    revealing,
    scenting,
    enduring,
    condition,
    qualityScore,
  }
}

/** @example analyzeMoonGarden(flowers, 'src') */
export function analyzeMoonGarden(flowers: Moonflower[], dirPath: string): MoonGarden {
  if (flowers.length === 0) {
    return {
      directory: dirPath,
      flowers: [],
      avgBloom: 0,
      avgDepth: 0,
      avgResilience: 0,
      midnightMasterpieceCount: 0,
      voidCount: 0,
      gardenType: 'no-garden',
      condition: 'void',
    }
  }

  const avgBloom = Math.round(
    flowers.reduce((s, f) => s + f.nocturnalBloom, 0) / flowers.length,
  )
  const avgDepth = Math.round(
    flowers.reduce((s, f) => s + f.shadowDepth, 0) / flowers.length,
  )
  const avgResilience = Math.round(
    flowers.reduce((s, f) => s + f.darkResilience, 0) / flowers.length,
  )

  const midnightMasterpieceCount = flowers.filter(
    (f) => f.condition === 'midnight-masterpiece',
  ).length
  const voidCount = flowers.filter((f) => f.condition === 'void').length

  const gardenType = classifyGardenType(flowers)
  const avgQuality = Math.round(
    flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length,
  )
  const condition = classifyGardenCondition(avgQuality)

  return {
    directory: dirPath,
    flowers,
    avgBloom,
    avgDepth,
    avgResilience,
    midnightMasterpieceCount,
    voidCount,
    gardenType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildMidnightBloomResult(['a.ts'], [content]) */
export async function buildMidnightBloomResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MidnightBloomResult> {
  const flowers: Moonflower[] = files.map((file, i) =>
    analyzeMoonflower(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, Moonflower[]>()
  for (const flower of flowers) {
    const dir = flower.file.includes('/')
      ? flower.file.substring(0, flower.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(flower)
    } else {
      dirMap.set(dir, [flower])
    }
  }

  const gardens: MoonGarden[] = Array.from(dirMap.entries()).map(([dir, dirFlowers]) =>
    analyzeMoonGarden(dirFlowers, dir),
  )

  const avgBloom =
    flowers.length > 0
      ? Math.round(flowers.reduce((s, f) => s + f.nocturnalBloom, 0) / flowers.length)
      : 0
  const avgDepth =
    flowers.length > 0
      ? Math.round(flowers.reduce((s, f) => s + f.shadowDepth, 0) / flowers.length)
      : 0
  const avgResilience =
    flowers.length > 0
      ? Math.round(flowers.reduce((s, f) => s + f.darkResilience, 0) / flowers.length)
      : 0

  const overallLuminosity =
    flowers.length > 0
      ? Math.round(flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length)
      : 0
  const isMidnight = overallLuminosity >= 60

  const night = { avgBloom, avgDepth, avgResilience, isMidnight, overallLuminosity }

  const avgNocturnalBloom = avgBloom
  const avgShadowDepth = avgDepth
  const avgMoonlitClarity =
    flowers.length > 0
      ? Math.round(flowers.reduce((s, f) => s + f.moonlitClarity, 0) / flowers.length)
      : 0
  const avgNightFragrance =
    flowers.length > 0
      ? Math.round(flowers.reduce((s, f) => s + f.nightFragrance, 0) / flowers.length)
      : 0
  const avgDarkResilience = avgResilience

  const midnightMasterpieceCount = flowers.filter(
    (f) => f.condition === 'midnight-masterpiece',
  ).length
  const moonlitParadiseCount = flowers.filter((f) => f.condition === 'moonlit-paradise').length
  const properGardenCount = flowers.filter((f) => f.condition === 'proper-garden').length
  const dimPlotCount = flowers.filter((f) => f.condition === 'dim-plot').length
  const barrenEarthCount = flowers.filter((f) => f.condition === 'barren-earth').length
  const voidCount = flowers.filter((f) => f.condition === 'void').length

  const hasHighBloomCount = flowers.filter((f) => f.blossoming.hasHighBloom).length
  const hasHighDepthCount = flowers.filter((f) => f.deepening.hasHighDepth).length
  const hasHighClarityCount = flowers.filter((f) => f.revealing.hasHighClarity).length
  const hasHighFragranceCount = flowers.filter((f) => f.scenting.hasHighFragrance).length
  const hasHighResilienceCount = flowers.filter((f) => f.enduring.hasHighResilience).length

  const gardenerGrade = classifyGardenerGrade(overallLuminosity)

  const bestFlower = flowers.length > 0
    ? flowers.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file
    : ''
  const mostBlooming = flowers.length > 0
    ? flowers.reduce((best, f) => (f.nocturnalBloom > best.nocturnalBloom ? f : best)).file
    : ''
  const deepest = flowers.length > 0
    ? flowers.reduce((best, f) => (f.shadowDepth > best.shadowDepth ? f : best)).file
    : ''
  const clearest = flowers.length > 0
    ? flowers.reduce((best, f) => (f.moonlitClarity > best.moonlitClarity ? f : best)).file
    : ''
  const mostFragrant = flowers.length > 0
    ? flowers.reduce((best, f) => (f.nightFragrance > best.nightFragrance ? f : best)).file
    : ''
  const mostResilient = flowers.length > 0
    ? flowers.reduce((best, f) => (f.darkResilience > best.darkResilience ? f : best)).file
    : ''

  const stats: MidnightBloomStats = {
    totalFiles: files.length,
    totalGardens: gardens.length,
    avgNocturnalBloom,
    avgShadowDepth,
    avgMoonlitClarity,
    avgNightFragrance,
    avgDarkResilience,
    midnightMasterpieceCount,
    moonlitParadiseCount,
    properGardenCount,
    dimPlotCount,
    barrenEarthCount,
    voidCount,
    hasHighBloomCount,
    hasHighDepthCount,
    hasHighClarityCount,
    hasHighFragranceCount,
    hasHighResilienceCount,
    overallLuminosity,
    gardenerGrade,
    bestFlower,
    mostBlooming,
    deepest,
    clearest,
    mostFragrant,
    mostResilient,
  }

  const recommendations = generateRecommendations(flowers, gardens, night, stats)

  return { flowers, gardens, night, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(flowers, gardens, night, stats) */
export function generateRecommendations(
  flowers: Moonflower[],
  gardens: MoonGarden[],
  night: MidnightBloomResult['night'],
  stats: MidnightBloomStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgNocturnalBloom >= 90 &&
    stats.avgShadowDepth >= 90 &&
    stats.avgMoonlitClarity >= 90 &&
    stats.avgNightFragrance >= 90 &&
    stats.avgDarkResilience >= 90
  ) {
    recs.push(
      'Your midnight garden is a nocturnal masterpiece! Every flower blooms with luminous beauty and the shadows hold infinite depth',
    )
    return recs
  }

  if (stats.avgNocturnalBloom < 60) {
    recs.push(
      'Encourage nocturnal bloom — code should flourish in unexpected conditions, like night flowers that bloom when the world sleeps',
    )
  }

  if (stats.avgShadowDepth < 60) {
    recs.push(
      'Deepen the shadows — code should hold richness in complexity, not just surface-level darkness',
    )
  }

  if (stats.avgMoonlitClarity < 60) {
    recs.push(
      'Brighten the moonlight — code should reveal understanding from a different angle, the silver clarity of midnight',
    )
  }

  if (stats.avgNightFragrance < 60) {
    recs.push(
      'Strengthen night fragrance — code should have subtle, pervasive quality that carries like the scent of night jasmine',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Build dark resilience — code must thrive in adversity, like plants that evolved to flourish in complete darkness',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The garden lies dormant — plant new seeds of quality before the night claims this plot entirely',
    )
  }

  const voidFlowers = flowers.filter((f) => f.condition === 'void')
  if (voidFlowers.length > 0 && voidFlowers.length <= 5) {
    recs.push(
      `Revive these wilted flowers: ${voidFlowers.map((f) => f.file).join(', ')}`,
    )
  } else if (voidFlowers.length > 5) {
    recs.push(
      `Revive these ${voidFlowers.length} wilted flowers before the garden fades into barren earth`,
    )
  }

  const poorGardens = gardens.filter(
    (g) => g.condition === 'void' || g.condition === 'barren-earth',
  )
  if (poorGardens.length === gardens.length && gardens.length > 0) {
    recs.push(
      'All garden plots have withered — the midnight garden needs a complete replanting from seed',
    )
  }

  if (recs.length === 0) {
    recs.push('Your midnight garden glows with nocturnal brilliance — keep tending every flower to midnight perfection')
  }

  return recs
}
