// ─── Interfaces ──────────────────────────────────────────

export interface ForgingMeasure {
  forging: number
  starlight:
    | 'neutron-star-forge'
    | 'white-dwarf-craft'
    | 'proper-starlight'
    | 'candle-flame'
    | 'match-stick'
    | 'no-forging'
  hasHighForging: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasPrecise: boolean
  hasNoApproximate: boolean
  hasMasterful: boolean
  hasRefined: boolean
  hasPolished: boolean
  chaoticCount: number
  tangledCount: number
}

export interface HardeningMeasure {
  hardness: number
  core:
    | 'neutron-core'
    | 'white-dwarf-hard'
    | 'proper-star'
    | 'red-giant-soft'
    | 'gas-cloud'
    | 'no-hardness'
  hasHighHardness: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMaintained: boolean
  hasEnduring: boolean
  hasReliable: boolean
  hasDeterministic: boolean
  hasImmutable: boolean
  untestedCount: number
  unsafeCount: number
}

export interface PatterningMeasure {
  pattern: number
  constellation:
    | 'perfect-geometry'
    | 'clear-constellation'
    | 'proper-pattern'
    | 'random-stars'
    | 'scattered-dust'
    | 'no-pattern'
  hasHighPattern: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasConnected: boolean
  hasNoIsolated: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasLinked: boolean
  hasIntegrated: boolean
  hasClearAPI: boolean
  hasNamed: boolean
  hasStructured: boolean
  hasMapped: boolean
  hasVisible: boolean
  scatteredCount: number
  isolatedCount: number
}

export interface RevealingMeasure {
  clarity: number
  nebula:
    | 'eagle-nebula'
    | 'orion-clarity'
    | 'proper-nebula'
    | 'dark-cloud'
    | 'void'
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
  hasIlluminated: boolean
  hasDirect: boolean
  hasRevealing: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  cosmos:
    | 'universe-sage'
    | 'galaxy-brain'
    | 'proper-star-gazer'
    | 'telescope-novice'
    | 'grounded-thinker'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasAccumulated: boolean
  hackedCount: number
  adHocCount: number
}

export type IngotCondition =
  | 'stellar-masterpiece'
  | 'star-forged'
  | 'proper-alloy'
  | 'meteor-scrap'
  | 'space-dust'
  | 'void'

export interface StarIngot {
  file: string
  celestialForging: number
  starHardness: number
  constellationPattern: number
  nebulaClarity: number
  cosmicWisdom: number
  forging: ForgingMeasure
  hardening: HardeningMeasure
  patterning: PatterningMeasure
  revealing: RevealingMeasure
  accumulating: AccumulatingMeasure
  condition: IngotCondition
  qualityScore: number
}

export type ClusterType =
  | 'globular-cluster'
  | 'open-cluster'
  | 'proper-group'
  | 'binary-system'
  | 'lone-star'
  | 'no-cluster'

export type ClusterCondition =
  | 'galactic-core'
  | 'star-nursery'
  | 'proper-cluster'
  | 'sparse-field'
  | 'empty-void'
  | 'void'

export interface StarCluster {
  directory: string
  ingots: StarIngot[]
  avgForging: number
  avgPattern: number
  avgWisdom: number
  stellarMasterpieceCount: number
  voidCount: number
  clusterType: ClusterType
  condition: ClusterCondition
}

export type SmithGrade =
  | 'cosmic-smith'
  | 'star-forger'
  | 'nebula-crafter'
  | 'apprentice'
  | 'novice'
  | 'earth-bound'

export interface StarlightForgeStats {
  totalFiles: number
  totalClusters: number
  avgCelestialForging: number
  avgStarHardness: number
  avgConstellationPattern: number
  avgNebulaClarity: number
  avgCosmicWisdom: number
  stellarMasterpieceCount: number
  starForgedCount: number
  properAlloyCount: number
  meteorScrapCount: number
  spaceDustCount: number
  voidCount: number
  hasHighForgingCount: number
  hasHighHardnessCount: number
  hasHighPatternCount: number
  hasHighClarityCount: number
  hasHighWisdomCount: number
  overallBrilliance: number
  smithGrade: SmithGrade
  bestIngot: string
  mostMasterful: string
  hardest: string
  mostConnected: string
  clearest: string
  wisest: string
}

export interface StarlightForgeResult {
  ingots: StarIngot[]
  clusters: StarCluster[]
  cosmos: {
    avgForging: number
    avgPattern: number
    avgWisdom: number
    isStellar: boolean
    overallBrilliance: number
  }
  stats: StarlightForgeStats
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

/** @example measureForging('export class Analyzer<T> { }') */
export function measureForging(content: string): ForgingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god.object|mega)\b/i.test(content)
  const hasCleanPipelines = /\b(import|export|from)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|messy)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|bloated)\b/i.test(content)
  const hasPrecise = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|roughly)\b/i.test(content)
  const hasMasterful = /\b(readonly|private|protected)\b/.test(content)
  const hasRefined = /\b(function|class|interface)\b/.test(content)
  const hasPolished = /\b(try|catch|if|throw)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasCleanPipelines,
    hasEfficient,
    hasPrecise,
    hasMasterful,
    hasRefined,
    hasPolished,
  ]

  const forging = computeScore(positiveBooleans)
  const hasHighForging = forging >= 60
  const starlight = classifyStarlight(forging)

  return {
    forging,
    starlight,
    hasHighForging,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasEfficient,
    hasNoWasteful,
    hasPrecise,
    hasNoApproximate,
    hasMasterful,
    hasRefined,
    hasPolished,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureHardening('try { safe() } catch { recover() }') */
export function measureHardening(content: string): HardeningMeasure {
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasConsistent = /\b(readonly|as const)\b/.test(content)
  const hasNoErratic = !content.includes('@ts-ignore')
  const hasStable = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|unstable|flaky)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMaintained = /\b(import|export|from)\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasReliable = /\b(try|catch|if|throw)\b/.test(content)
  const hasDeterministic = /\b(readonly|const|as const)\b/.test(content)
  const hasImmutable = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasTested,
    hasTypeSafe,
    hasConsistent,
    hasStable,
    hasProven,
    hasMaintained,
    hasReliable,
    hasDeterministic,
  ]

  const hardness = computeScore(positiveBooleans)
  const hasHighHardness = hardness >= 60
  const core = classifyCore(hardness)

  return {
    hardness,
    core,
    hasHighHardness,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasConsistent,
    hasNoErratic,
    hasStable,
    hasNoVolatile,
    hasProven,
    hasNoExperimental,
    hasMaintained,
    hasEnduring,
    hasReliable,
    hasDeterministic,
    hasImmutable,
    untestedCount,
    unsafeCount,
  }
}

/** @example measurePatterning('export interface Config { readonly name: string }') */
export function measurePatterning(content: string): PatterningMeasure {
  const hasOrganized = /\b(class|interface|type|enum)\b/.test(content)
  const scatteredCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoScattered = scatteredCount === 0
  const hasConnected = /\b(import|export|from)\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|orphan|standalone)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasExported = /\b(export|public)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore')
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasLinked = /\b(import|from)\b/.test(content)
  const hasIntegrated = /\b(class|interface|type)\b/.test(content)
  const hasClearAPI = /\b(export)\b/.test(content) && /:\s*(string|number|boolean|void)/.test(content)
  const hasNamed = /\b(function|class|interface|type)\b/.test(content)
  const hasStructured = /\b(class|interface|type|enum)\b/.test(content)
  const hasMapped = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\b(export|public)\b/.test(content)

  const positiveBooleans = [
    hasOrganized,
    hasConnected,
    hasExported,
    hasDocumented,
    hasLinked,
    hasIntegrated,
    hasNamed,
    hasVisible,
  ]

  const pattern = computeScore(positiveBooleans)
  const hasHighPattern = pattern >= 60
  const constellation = classifyConstellation(pattern)

  return {
    pattern,
    constellation,
    hasHighPattern,
    hasOrganized,
    hasNoScattered,
    hasConnected,
    hasNoIsolated,
    hasExported,
    hasNoHidden,
    hasDocumented,
    hasNoUndocumented,
    hasLinked,
    hasIntegrated,
    hasClearAPI,
    hasNamed,
    hasStructured,
    hasMapped,
    hasVisible,
    scatteredCount,
    isolatedCount,
  }
}

/** @example measureRevealing('export function greet(): string { }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(readonly|private|protected|async)\b/.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minify|uglify)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore')
  const hasUnderstandable = /\b(if|return|throw)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasVisible = /\b(import|export|from)\b/.test(content)
  const hasNoInvisible = !/\b(hidden|invisible|secret)\b/i.test(content)
  const hasIlluminated = /\b(try|catch)\b/.test(content)
  const hasDirect = /\b(type|interface|<\w+>)\b/.test(content)
  const hasRevealing = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasIlluminated,
    hasRevealing,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const nebula = classifyNebula(clarity)

  return {
    clarity,
    nebula,
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
    hasIlluminated,
    hasDirect,
    hasRevealing,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureAccumulating('export interface Config { readonly name: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasStrategic = /\b(import|export|from)\b/.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasVisionary = /\b(try|catch|if|throw)\b/.test(content)
  const hasAccumulated = /\b(readonly|const|as const)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasPatterned,
    hasMature,
    hasStrategic,
    hasVisionary,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const cosmos = classifyCosmos(wisdom)

  return {
    wisdom,
    cosmos,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasDeep,
    hasNoShallow,
    hasProven,
    hasNoExperimental,
    hasPatterned,
    hasNoReinvented,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasVisionary,
    hasAccumulated,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyStarlight(score: number): ForgingMeasure['starlight'] {
  if (score >= 90) return 'neutron-star-forge'
  if (score >= 75) return 'white-dwarf-craft'
  if (score >= 60) return 'proper-starlight'
  if (score >= 40) return 'candle-flame'
  if (score >= 20) return 'match-stick'
  return 'no-forging'
}

function classifyCore(score: number): HardeningMeasure['core'] {
  if (score >= 90) return 'neutron-core'
  if (score >= 75) return 'white-dwarf-hard'
  if (score >= 60) return 'proper-star'
  if (score >= 40) return 'red-giant-soft'
  if (score >= 20) return 'gas-cloud'
  return 'no-hardness'
}

function classifyConstellation(score: number): PatterningMeasure['constellation'] {
  if (score >= 90) return 'perfect-geometry'
  if (score >= 75) return 'clear-constellation'
  if (score >= 60) return 'proper-pattern'
  if (score >= 40) return 'random-stars'
  if (score >= 20) return 'scattered-dust'
  return 'no-pattern'
}

function classifyNebula(score: number): RevealingMeasure['nebula'] {
  if (score >= 90) return 'eagle-nebula'
  if (score >= 75) return 'orion-clarity'
  if (score >= 60) return 'proper-nebula'
  if (score >= 40) return 'dark-cloud'
  if (score >= 20) return 'void'
  return 'no-clarity'
}

function classifyCosmos(score: number): AccumulatingMeasure['cosmos'] {
  if (score >= 90) return 'universe-sage'
  if (score >= 75) return 'galaxy-brain'
  if (score >= 60) return 'proper-star-gazer'
  if (score >= 40) return 'telescope-novice'
  if (score >= 20) return 'grounded-thinker'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): IngotCondition {
  if (score >= 90) return 'stellar-masterpiece'
  if (score >= 75) return 'star-forged'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'meteor-scrap'
  if (score >= 20) return 'space-dust'
  return 'void'
}

/** @example classifyClusterType(ingots) */
export function classifyClusterType(ingots: StarIngot[]): ClusterType {
  if (ingots.length === 0) return 'no-cluster'
  const avg = ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length
  if (avg >= 90) return 'globular-cluster'
  if (avg >= 75) return 'open-cluster'
  if (avg >= 60) return 'proper-group'
  if (avg >= 40) return 'binary-system'
  if (avg >= 20) return 'lone-star'
  return 'no-cluster'
}

/** @example classifyClusterCondition(avgForging) */
export function classifyClusterCondition(avgForging: number): ClusterCondition {
  if (avgForging >= 85) return 'galactic-core'
  if (avgForging >= 70) return 'star-nursery'
  if (avgForging >= 55) return 'proper-cluster'
  if (avgForging >= 35) return 'sparse-field'
  if (avgForging >= 15) return 'empty-void'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgBrilliance: number): SmithGrade {
  if (avgBrilliance >= 80) return 'cosmic-smith'
  if (avgBrilliance >= 65) return 'star-forger'
  if (avgBrilliance >= 50) return 'nebula-crafter'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'earth-bound'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeStarIngot(content, 'app.ts') */
export function analyzeStarIngot(content: string, filePath: string): StarIngot {
  const forging = measureForging(content)
  const hardening = measureHardening(content)
  const patterning = measurePatterning(content)
  const revealing = measureRevealing(content)
  const accumulating = measureAccumulating(content)

  const celestialForging = forging.forging
  const starHardness = hardening.hardness
  const constellationPattern = patterning.pattern
  const nebulaClarity = revealing.clarity
  const cosmicWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    celestialForging * 0.2 +
    starHardness * 0.2 +
    constellationPattern * 0.2 +
    nebulaClarity * 0.2 +
    cosmicWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    celestialForging,
    starHardness,
    constellationPattern,
    nebulaClarity,
    cosmicWisdom,
    forging,
    hardening,
    patterning,
    revealing,
    accumulating,
    condition,
    qualityScore,
  }
}

/** @example analyzeStarCluster(ingots, 'src') */
export function analyzeStarCluster(ingots: StarIngot[], dirPath: string): StarCluster {
  if (ingots.length === 0) {
    return {
      directory: dirPath,
      ingots: [],
      avgForging: 0,
      avgPattern: 0,
      avgWisdom: 0,
      stellarMasterpieceCount: 0,
      voidCount: 0,
      clusterType: 'no-cluster',
      condition: 'void',
    }
  }

  const avgForging = Math.round(
    ingots.reduce((s, i) => s + i.celestialForging, 0) / ingots.length,
  )
  const avgPattern = Math.round(
    ingots.reduce((s, i) => s + i.constellationPattern, 0) / ingots.length,
  )
  const avgWisdom = Math.round(
    ingots.reduce((s, i) => s + i.cosmicWisdom, 0) / ingots.length,
  )

  const stellarMasterpieceCount = ingots.filter(
    (i) => i.condition === 'stellar-masterpiece',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const clusterType = classifyClusterType(ingots)
  const avgQuality = Math.round(
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length,
  )
  const condition = classifyClusterCondition(avgQuality)

  return {
    directory: dirPath,
    ingots,
    avgForging,
    avgPattern,
    avgWisdom,
    stellarMasterpieceCount,
    voidCount,
    clusterType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildStarlightForgeResult(['a.ts'], [content]) */
export async function buildStarlightForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StarlightForgeResult> {
  const ingots: StarIngot[] = files.map((file, i) =>
    analyzeStarIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StarIngot[]>()
  for (const ingot of ingots) {
    const dir = ingot.file.includes('/')
      ? ingot.file.substring(0, ingot.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ingot)
    } else {
      dirMap.set(dir, [ingot])
    }
  }

  const clusters: StarCluster[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeStarCluster(dirIngots, dir),
  )

  const avgForging =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.celestialForging, 0) / ingots.length)
      : 0
  const avgPattern =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.constellationPattern, 0) / ingots.length)
      : 0
  const avgWisdom =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.cosmicWisdom, 0) / ingots.length)
      : 0

  const overallBrilliance =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)
      : 0
  const isStellar = overallBrilliance >= 60

  const cosmos = { avgForging, avgPattern, avgWisdom, isStellar, overallBrilliance }

  const avgCelestialForging = avgForging
  const avgStarHardness =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.starHardness, 0) / ingots.length)
      : 0
  const avgConstellationPattern = avgPattern
  const avgNebulaClarity =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.nebulaClarity, 0) / ingots.length)
      : 0
  const avgCosmicWisdom = avgWisdom

  const stellarMasterpieceCount = ingots.filter(
    (i) => i.condition === 'stellar-masterpiece',
  ).length
  const starForgedCount = ingots.filter(
    (i) => i.condition === 'star-forged',
  ).length
  const properAlloyCount = ingots.filter(
    (i) => i.condition === 'proper-alloy',
  ).length
  const meteorScrapCount = ingots.filter(
    (i) => i.condition === 'meteor-scrap',
  ).length
  const spaceDustCount = ingots.filter(
    (i) => i.condition === 'space-dust',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const hasHighForgingCount = ingots.filter(
    (i) => i.forging.hasHighForging,
  ).length
  const hasHighHardnessCount = ingots.filter(
    (i) => i.hardening.hasHighHardness,
  ).length
  const hasHighPatternCount = ingots.filter(
    (i) => i.patterning.hasHighPattern,
  ).length
  const hasHighClarityCount = ingots.filter(
    (i) => i.revealing.hasHighClarity,
  ).length
  const hasHighWisdomCount = ingots.filter(
    (i) => i.accumulating.hasHighWisdom,
  ).length

  const smithGrade = classifySmithGrade(overallBrilliance)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => (i.qualityScore > best.qualityScore ? i : best)).file
    : ''
  const mostMasterful = ingots.length > 0
    ? ingots.reduce((best, i) => (i.celestialForging > best.celestialForging ? i : best)).file
    : ''
  const hardest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.starHardness > best.starHardness ? i : best)).file
    : ''
  const mostConnected = ingots.length > 0
    ? ingots.reduce((best, i) => (i.constellationPattern > best.constellationPattern ? i : best)).file
    : ''
  const clearest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.nebulaClarity > best.nebulaClarity ? i : best)).file
    : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.cosmicWisdom > best.cosmicWisdom ? i : best)).file
    : ''

  const stats: StarlightForgeStats = {
    totalFiles: files.length,
    totalClusters: clusters.length,
    avgCelestialForging,
    avgStarHardness,
    avgConstellationPattern,
    avgNebulaClarity,
    avgCosmicWisdom,
    stellarMasterpieceCount,
    starForgedCount,
    properAlloyCount,
    meteorScrapCount,
    spaceDustCount,
    voidCount,
    hasHighForgingCount,
    hasHighHardnessCount,
    hasHighPatternCount,
    hasHighClarityCount,
    hasHighWisdomCount,
    overallBrilliance,
    smithGrade,
    bestIngot,
    mostMasterful,
    hardest,
    mostConnected,
    clearest,
    wisest,
  }

  const recommendations = generateRecommendations(ingots, clusters, cosmos, stats)

  return { ingots, clusters, cosmos, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, clusters, cosmos, stats) */
export function generateRecommendations(
  ingots: StarIngot[],
  clusters: StarCluster[],
  cosmos: StarlightForgeResult['cosmos'],
  stats: StarlightForgeStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgCelestialForging >= 90 &&
    stats.avgStarHardness >= 90 &&
    stats.avgConstellationPattern >= 90 &&
    stats.avgNebulaClarity >= 90 &&
    stats.avgCosmicWisdom >= 90
  ) {
    recs.push(
      'Your starlight forge produces stellar masterpieces! Every ingot glows with the brilliance of a billion stars!',
    )
    return recs
  }

  if (stats.avgCelestialForging < 60) {
    recs.push(
      'Focus the starlight — celestial forging requires the concentrated energy of a neutron star, not scattered photons',
    )
  }

  if (stats.avgStarHardness < 60) {
    recs.push(
      'Harden the stellar core — code should endure like neutronium at the heart of a collapsing star',
    )
  }

  if (stats.avgConstellationPattern < 60) {
    recs.push(
      'Map the constellations — code should reveal interconnected patterns like stars forming ancient myths across the sky',
    )
  }

  if (stats.avgNebulaClarity < 60) {
    recs.push(
      'Clarify the nebula — even the most complex code should be transparent like the Eagle Nebula revealing newborn stars',
    )
  }

  if (stats.avgCosmicWisdom < 60) {
    recs.push(
      'Accumulate cosmic wisdom — code should carry the knowledge of 13.8 billion years of universal learning',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The forge has gone dark — relight the stellar furnaces before all ingots cool to dead matter',
    )
  }

  const voidIngots = ingots.filter((i) => i.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(
      `Recycle these dead ingots: ${voidIngots.map((i) => i.file).join(', ')}`,
    )
  } else if (voidIngots.length > 5) {
    recs.push(
      `Recycle these ${voidIngots.length} dead ingots before the entire foundry collapses into a black hole`,
    )
  }

  const poorClusters = clusters.filter(
    (c) => c.condition === 'void' || c.condition === 'sparse-field',
  )
  if (poorClusters.length === clusters.length && clusters.length > 0) {
    recs.push(
      'All clusters have collapsed — the starlight foundry needs to reignite from the cosmic microwave background',
    )
  }

  if (recs.length === 0) {
    recs.push('Your starlight foundry burns with stellar brilliance — keep forging and the cosmos will shine eternally')
  }

  return recs
}
