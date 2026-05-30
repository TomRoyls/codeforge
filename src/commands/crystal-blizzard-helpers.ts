// ─── Interfaces ──────────────────────────────────────────

export interface CrystallizingMeasure {
  precision: number
  crystal: 'perfect-hexagon' | 'fine-crystal' | 'proper-ice' | 'slush' | 'sludge' | 'no-precision'
  hasHighPrecision: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasPrecise: boolean
  hasNoApproximate: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasOrganized: boolean
  hasModular: boolean
  hasConsistent: boolean
  hasUniform: boolean
  hasGeometric: boolean
  hasPatterned: boolean
  hasExact: boolean
  chaoticCount: number
  unsafeCount: number
}

export interface WeatheringMeasure {
  resilience: number
  storm: 'glacier-calm' | 'stormproof' | 'proper-ice-shield' | 'melting-fast' | 'vaporized' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasReinforced: boolean
  hasSolid: boolean
  hasFortified: boolean
  hasDurable: boolean
  hasImpervious: boolean
  unhandledCount: number
  untestedCount: number
}

export interface RefractingMeasure {
  clarity: number
  refraction: 'prismatic-clarity' | 'clear-shard' | 'proper-glass' | 'cloudy-ice' | 'opaque-frost' | 'no-clarity'
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
  hasDocumented: boolean
  hasRevealed: boolean
  hasIlluminated: boolean
  hasOpen: boolean
  hasLucid: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface SculptingMeasure {
  beauty: number
  sculpture: 'masterwork-ice' | 'elegant-carving' | 'proper-shape' | 'rough-block' | 'shapeless-lump' | 'no-beauty'
  hasHighBeauty: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasClean: boolean
  hasFlowing: boolean
  hasGraceful: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasAesthetic: boolean
  hasCrafted: boolean
  hasSculpted: boolean
  hasIntentional: boolean
  hasArtistic: boolean
  hasBeautiful: boolean
  clunkyCount: number
  roughCount: number
}

export interface FreezingMeasure {
  wisdom: number
  temperature: 'absolute-zero' | 'deep-freeze' | 'proper-cold' | 'lukecold' | 'room-temp' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasPatterned: boolean
  hasStrategic: boolean
  hasNoiseFree: boolean
  hasPure: boolean
  hasDistilled: boolean
  hasEssential: boolean
  hasConcentrated: boolean
  hackedCount: number
  adHocCount: number
}

export type ShardCondition =
  | 'crystal-masterpiece'
  | 'frozen-perfection'
  | 'proper-ice'
  | 'slush-pile'
  | 'puddle'
  | 'void'

export interface CrystalShard {
  file: string
  crystallinePrecision: number
  stormResilience: number
  shardClarity: number
  frozenBeauty: number
  iceWisdom: number
  crystallizing: CrystallizingMeasure
  weathering: WeatheringMeasure
  refracting: RefractingMeasure
  sculpting: SculptingMeasure
  freezing: FreezingMeasure
  condition: ShardCondition
  qualityScore: number
}

export type StormType =
  | 'arctic-hurricane'
  | 'ice-storm'
  | 'proper-blizzard'
  | 'light-flurry'
  | 'no-storm'
  | 'void'

export type StormCondition =
  | 'ice-palace'
  | 'frozen-cathedral'
  | 'proper-glacier'
  | 'melting-snowman'
  | 'dry-ground'
  | 'void'

export interface CrystalStorm {
  directory: string
  shards: CrystalShard[]
  avgPrecision: number
  avgResilience: number
  avgWisdom: number
  crystalMasterpieceCount: number
  voidCount: number
  stormType: StormType
  condition: StormCondition
}

export interface CrystalBlizzardResult {
  shards: CrystalShard[]
  storms: CrystalStorm[]
  winter: {
    avgPrecision: number
    avgResilience: number
    avgWisdom: number
    isCrystalline: boolean
    overallFrostiness: number
  }
  stats: {
    totalFiles: number
    totalStorms: number
    avgCrystallinePrecision: number
    avgStormResilience: number
    avgShardClarity: number
    avgFrozenBeauty: number
    avgIceWisdom: number
    crystalMasterpieceCount: number
    frozenPerfectionCount: number
    properIceCount: number
    slushPileCount: number
    puddleCount: number
    voidCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    hasHighBeautyCount: number
    hasHighWisdomCount: number
    overallFrostiness: number
    frostMageGrade: 'archmage-of-frost' | 'ice-wizard' | 'winter-sage' | 'apprentice' | 'novice' | 'sun-lover'
    bestShard: string
    mostPrecise: string
    mostResilient: string
    clearest: string
    mostBeautiful: string
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

/** @example classifyShardCondition(90) */
export function classifyShardCondition(score: number): ShardCondition {
  if (score >= 90) return 'crystal-masterpiece'
  if (score >= 75) return 'frozen-perfection'
  if (score >= 60) return 'proper-ice'
  if (score >= 40) return 'slush-pile'
  if (score >= 20) return 'puddle'
  return 'void'
}

/** @example classifyStormType(shards) */
export function classifyStormType(shards: CrystalShard[]): StormType {
  if (shards.length === 0) return 'no-storm'
  const avg =
    shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  if (avg >= 85) return 'arctic-hurricane'
  if (avg >= 70) return 'ice-storm'
  if (avg >= 55) return 'proper-blizzard'
  if (avg >= 35) return 'light-flurry'
  return 'no-storm'
}

/** @example classifyStormCondition(85) */
export function classifyStormCondition(score: number): StormCondition {
  if (score >= 85) return 'ice-palace'
  if (score >= 70) return 'frozen-cathedral'
  if (score >= 55) return 'proper-glacier'
  if (score >= 35) return 'melting-snowman'
  if (score >= 15) return 'dry-ground'
  return 'void'
}

/** @example classifyFrostMageGrade(80) */
export function classifyFrostMageGrade(
  avgFrostiness: number,
): CrystalBlizzardResult['stats']['frostMageGrade'] {
  if (avgFrostiness >= 80) return 'archmage-of-frost'
  if (avgFrostiness >= 65) return 'ice-wizard'
  if (avgFrostiness >= 50) return 'winter-sage'
  if (avgFrostiness >= 35) return 'apprentice'
  if (avgFrostiness >= 20) return 'novice'
  return 'sun-lover'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureCrystallizing('const x: string = ""') */
export function measureCrystallizing(content: string): CrystallizingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasPrecise = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(roughly|approximately|guesstimate)\b/i.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasModular = /\b(import|export)\b/.test(content)
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const hasUniform = /\b(readonly|private|protected)\b/.test(content)
  const hasGeometric = /\b(class|interface|type)\b/.test(content)
  const hasPatterned = /\b(async|await|Promise)\b/.test(content)
  const hasExact = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasTypeSafe,
    hasNoUnsafe,
    hasPrecise,
    hasNoApproximate,
    hasClean,
    hasNoDirty,
    hasOrganized,
    hasModular,
    hasConsistent,
    hasUniform,
    hasGeometric,
    hasPatterned,
    hasExact,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let crystal: CrystallizingMeasure['crystal'] = 'no-precision'
  if (precision >= 90) crystal = 'perfect-hexagon'
  else if (precision >= 75) crystal = 'fine-crystal'
  else if (precision >= 60) crystal = 'proper-ice'
  else if (precision >= 40) crystal = 'slush'
  else if (precision >= 20) crystal = 'sludge'

  return {
    precision,
    crystal,
    hasHighPrecision,
    hasWellStructured,
    hasNoChaotic,
    hasTypeSafe,
    hasNoUnsafe,
    hasPrecise,
    hasNoApproximate,
    hasClean,
    hasNoDirty,
    hasOrganized,
    hasModular,
    hasConsistent,
    hasUniform,
    hasGeometric,
    hasPatterned,
    hasExact,
    chaoticCount,
    unsafeCount,
  }
}

/** @example measureWeathering('try { x() } catch { y() }') */
export function measureWeathering(content: string): WeatheringMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|unstable|fragile)\b/i.test(content)
  const hasHardened = /\b(class|interface|type)\b/.test(content)
  const hasEnduring = /\b(function|=>|return)\b/.test(content)
  const hasReinforced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSolid = !/\bany\b/.test(content)
  const hasFortified = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /\b(async|await|Promise)\b/.test(content)
  const hasImpervious = !/\b(vulnerable|exploit|inject)\b/i.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasHardened,
    hasEnduring,
    hasReinforced,
    hasSolid,
    hasFortified,
    hasDurable,
    hasImpervious,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let storm: WeatheringMeasure['storm'] = 'no-resilience'
  if (resilience >= 90) storm = 'glacier-calm'
  else if (resilience >= 75) storm = 'stormproof'
  else if (resilience >= 60) storm = 'proper-ice-shield'
  else if (resilience >= 40) storm = 'melting-fast'
  else if (resilience >= 20) storm = 'vaporized'

  return {
    resilience,
    storm,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasHardened,
    hasEnduring,
    hasReinforced,
    hasSolid,
    hasFortified,
    hasDurable,
    hasImpervious,
    unhandledCount,
    untestedCount,
  }
}

/** @example measureRefracting('export function greet(): string { }') */
export function measureRefracting(content: string): RefractingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|class|interface|type)\b/.test(content)
  const hasNoMystery = !/\b(magic|mystery|secret)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoObfuscated = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(readonly|private|protected)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasIlluminated = /\b(readonly|as const)\b/.test(content)
  const hasOpen = !/\b(obfuscated|minified|encoded)\b/i.test(content)
  const hasLucid = /\b(class|interface|type)\b/.test(content)

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
    hasDocumented,
    hasRevealed,
    hasIlluminated,
    hasOpen,
    hasLucid,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let refraction: RefractingMeasure['refraction'] = 'no-clarity'
  if (clarity >= 90) refraction = 'prismatic-clarity'
  else if (clarity >= 75) refraction = 'clear-shard'
  else if (clarity >= 60) refraction = 'proper-glass'
  else if (clarity >= 40) refraction = 'cloudy-ice'
  else if (clarity >= 20) refraction = 'opaque-frost'

  return {
    clarity,
    refraction,
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
    hasDocumented,
    hasRevealed,
    hasIlluminated,
    hasOpen,
    hasLucid,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureSculpting('class X { private y: string }') */
export function measureSculpting(content: string): SculptingMeasure {
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const clunkyCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoClunky = clunkyCount === 0
  const hasRefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPolished = /\b(readonly|private|protected)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFlowing = /\b(async|await|Promise)\b/.test(content)
  const hasGraceful = /\b(function|=>|return)\b/.test(content)
  const hasHarmonious = /\b(import|export)\b/.test(content)
  const hasBalanced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasAesthetic = /\b(readonly|as const)\b/.test(content)
  const hasCrafted = /\b(try|catch|if|return)\b/.test(content)
  const hasSculpted = /\b(class|interface|type)\b/.test(content)
  const hasIntentional = !/\bany\b/.test(content)
  const hasArtistic = /\b(export|public)\b/.test(content)
  const hasBeautiful = !/\b(dirty|hacky|gross)\b/i.test(content)
  const roughCount = (content.match(/\b(var|eval)\b/g) ?? []).length

  const positiveBooleans = [
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasClean,
    hasFlowing,
    hasGraceful,
    hasHarmonious,
    hasBalanced,
    hasAesthetic,
    hasCrafted,
    hasSculpted,
    hasIntentional,
    hasArtistic,
    hasBeautiful,
  ]

  const beauty = computeScore(positiveBooleans)
  const hasHighBeauty = beauty >= 60

  let sculpture: SculptingMeasure['sculpture'] = 'no-beauty'
  if (beauty >= 90) sculpture = 'masterwork-ice'
  else if (beauty >= 75) sculpture = 'elegant-carving'
  else if (beauty >= 60) sculpture = 'proper-shape'
  else if (beauty >= 40) sculpture = 'rough-block'
  else if (beauty >= 20) sculpture = 'shapeless-lump'

  return {
    beauty,
    sculpture,
    hasHighBeauty,
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasClean,
    hasFlowing,
    hasGraceful,
    hasHarmonious,
    hasBalanced,
    hasAesthetic,
    hasCrafted,
    hasSculpted,
    hasIntentional,
    hasArtistic,
    hasBeautiful,
    clunkyCount,
    roughCount,
  }
}

/** @example measureFreezing('class X implements Y { readonly z: string }') */
export function measureFreezing(content: string): FreezingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\b(quick|dirty|temporary)\b/gi) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(export|public)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasNoShallow = !/\b(shallow|superficial|skin.deep)\b/i.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasPatterned = /\b(async|await|Promise)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasNoiseFree = !/\bany\b/.test(content)
  const hasPure = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDistilled = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEssential = /\b(function|=>|return)\b/.test(content)
  const hasConcentrated = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasNoiseFree,
    hasPure,
    hasDistilled,
    hasEssential,
    hasConcentrated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let temperature: FreezingMeasure['temperature'] = 'no-wisdom'
  if (wisdom >= 90) temperature = 'absolute-zero'
  else if (wisdom >= 75) temperature = 'deep-freeze'
  else if (wisdom >= 60) temperature = 'proper-cold'
  else if (wisdom >= 40) temperature = 'lukecold'
  else if (wisdom >= 20) temperature = 'room-temp'

  return {
    wisdom,
    temperature,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasNoiseFree,
    hasPure,
    hasDistilled,
    hasEssential,
    hasConcentrated,
    hackedCount,
    adHocCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCrystalShard(content, 'app.ts') */
export function analyzeCrystalShard(content: string, filePath: string): CrystalShard {
  const crystallizing = measureCrystallizing(content)
  const weathering = measureWeathering(content)
  const refracting = measureRefracting(content)
  const sculpting = measureSculpting(content)
  const freezing = measureFreezing(content)

  const crystallinePrecision = crystallizing.precision
  const stormResilience = weathering.resilience
  const shardClarity = refracting.clarity
  const frozenBeauty = sculpting.beauty
  const iceWisdom = freezing.wisdom

  const qualityScore = Math.round(
    crystallinePrecision * 0.2 +
    stormResilience * 0.2 +
    shardClarity * 0.2 +
    frozenBeauty * 0.2 +
    iceWisdom * 0.2,
  )

  const condition = classifyShardCondition(qualityScore)

  return {
    file: filePath,
    crystallinePrecision,
    stormResilience,
    shardClarity,
    frozenBeauty,
    iceWisdom,
    crystallizing,
    weathering,
    refracting,
    sculpting,
    freezing,
    condition,
    qualityScore,
  }
}

/** @example analyzeCrystalStorm(shards, 'src') */
export function analyzeCrystalStorm(shards: CrystalShard[], dirPath: string): CrystalStorm {
  if (shards.length === 0) {
    return {
      directory: dirPath,
      shards: [],
      avgPrecision: 0,
      avgResilience: 0,
      avgWisdom: 0,
      crystalMasterpieceCount: 0,
      voidCount: 0,
      stormType: 'no-storm',
      condition: 'void',
    }
  }

  const avgPrecision = Math.round(
    shards.reduce((s, sh) => s + sh.crystallinePrecision, 0) / shards.length,
  )
  const avgResilience = Math.round(
    shards.reduce((s, sh) => s + sh.stormResilience, 0) / shards.length,
  )
  const avgWisdom = Math.round(
    shards.reduce((s, sh) => s + sh.iceWisdom, 0) / shards.length,
  )

  const crystalMasterpieceCount = shards.filter(
    (sh) => sh.condition === 'crystal-masterpiece',
  ).length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length

  const stormType = classifyStormType(shards)
  const avgQuality = Math.round(
    shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length,
  )
  const condition = classifyStormCondition(avgQuality)

  return {
    directory: dirPath,
    shards,
    avgPrecision,
    avgResilience,
    avgWisdom,
    crystalMasterpieceCount,
    voidCount,
    stormType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCrystalBlizzardResult(['a.ts'], [content]) */
export async function buildCrystalBlizzardResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrystalBlizzardResult> {
  const shards: CrystalShard[] = files.map((file, i) =>
    analyzeCrystalShard(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CrystalShard[]>()
  for (const shard of shards) {
    const dir = shard.file.includes('/')
      ? shard.file.substring(0, shard.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(shard)
    } else {
      dirMap.set(dir, [shard])
    }
  }

  const storms: CrystalStorm[] = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeCrystalStorm(dirShards, dir),
  )

  const avgPrecision =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.crystallinePrecision, 0) / shards.length)
      : 0
  const avgResilience =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.stormResilience, 0) / shards.length)
      : 0
  const avgWisdom =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.iceWisdom, 0) / shards.length)
      : 0

  const overallFrostiness =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
      : 0
  const isCrystalline = overallFrostiness >= 60

  const winter = { avgPrecision, avgResilience, avgWisdom, isCrystalline, overallFrostiness }

  const avgShardClarity =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.shardClarity, 0) / shards.length)
      : 0
  const avgFrozenBeauty =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.frozenBeauty, 0) / shards.length)
      : 0
  const avgIceWisdom = avgWisdom

  const crystalMasterpieceCount = shards.filter(
    (sh) => sh.condition === 'crystal-masterpiece',
  ).length
  const frozenPerfectionCount = shards.filter(
    (sh) => sh.condition === 'frozen-perfection',
  ).length
  const properIceCount = shards.filter(
    (sh) => sh.condition === 'proper-ice',
  ).length
  const slushPileCount = shards.filter(
    (sh) => sh.condition === 'slush-pile',
  ).length
  const puddleCount = shards.filter(
    (sh) => sh.condition === 'puddle',
  ).length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length

  const hasHighPrecisionCount = shards.filter(
    (sh) => sh.crystallizing.hasHighPrecision,
  ).length
  const hasHighResilienceCount = shards.filter(
    (sh) => sh.weathering.hasHighResilience,
  ).length
  const hasHighClarityCount = shards.filter(
    (sh) => sh.refracting.hasHighClarity,
  ).length
  const hasHighBeautyCount = shards.filter(
    (sh) => sh.sculpting.hasHighBeauty,
  ).length
  const hasHighWisdomCount = shards.filter(
    (sh) => sh.freezing.hasHighWisdom,
  ).length

  const frostMageGrade = classifyFrostMageGrade(overallFrostiness)

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => (sh.qualityScore > best.qualityScore ? sh : best)).file
    : ''
  const mostPrecise = shards.length > 0
    ? shards.reduce((best, sh) => (sh.crystallinePrecision > best.crystallinePrecision ? sh : best)).file
    : ''
  const mostResilient = shards.length > 0
    ? shards.reduce((best, sh) => (sh.stormResilience > best.stormResilience ? sh : best)).file
    : ''
  const clearest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.shardClarity > best.shardClarity ? sh : best)).file
    : ''
  const mostBeautiful = shards.length > 0
    ? shards.reduce((best, sh) => (sh.frozenBeauty > best.frozenBeauty ? sh : best)).file
    : ''
  const wisest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.iceWisdom > best.iceWisdom ? sh : best)).file
    : ''

  const stats: CrystalBlizzardResult['stats'] = {
    totalFiles: files.length,
    totalStorms: storms.length,
    avgCrystallinePrecision: avgPrecision,
    avgStormResilience: avgResilience,
    avgShardClarity,
    avgFrozenBeauty,
    avgIceWisdom,
    crystalMasterpieceCount,
    frozenPerfectionCount,
    properIceCount,
    slushPileCount,
    puddleCount,
    voidCount,
    hasHighPrecisionCount,
    hasHighResilienceCount,
    hasHighClarityCount,
    hasHighBeautyCount,
    hasHighWisdomCount,
    overallFrostiness,
    frostMageGrade,
    bestShard,
    mostPrecise,
    mostResilient,
    clearest,
    mostBeautiful,
    wisest,
  }

  const recommendations = generateRecommendations(shards, storms, winter, stats)

  return { shards, storms, winter, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(shards, storms, winter, stats) */
export function generateRecommendations(
  shards: CrystalShard[],
  storms: CrystalStorm[],
  _winter: CrystalBlizzardResult['winter'],
  stats: CrystalBlizzardResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrystallinePrecision >= 90 &&
    stats.avgStormResilience >= 90 &&
    stats.avgShardClarity >= 90 &&
    stats.avgFrozenBeauty >= 90 &&
    stats.avgIceWisdom >= 90
  ) {
    recs.push(
      'Your crystal blizzard is an absolute-zero masterpiece! Every shard is a perfect hexagon of frozen perfection!',
    )
    return recs
  }

  if (stats.avgCrystallinePrecision < 60) {
    recs.push(
      'Sharpen the crystals — code should form with mathematical precision, like ice molecules arranging in perfect hexagonal patterns',
    )
  }

  if (stats.avgStormResilience < 60) {
    recs.push(
      'Weather the tempest — your code should survive the blizzard like ancient glaciers, unmoved by the fiercest storm',
    )
  }

  if (stats.avgShardClarity < 60) {
    recs.push(
      'Clear the frost — crystal shards refract light beautifully; your code should be transparent even when fragmented into modules',
    )
  }

  if (stats.avgFrozenBeauty < 60) {
    recs.push(
      'Sculpt the ice — frozen beauty is lasting beauty; carve your code with the precision of a master ice sculptor',
    )
  }

  if (stats.avgIceWisdom < 60) {
    recs.push(
      'Embrace the cold — noise freezes at absolute zero, and only the purest signal remains; reduce your code to its essence',
    )
  }

  if (stats.overallFrostiness < 40) {
    recs.push(
      'The blizzard has melted away — reforge the ice palace before the last crystal dissolves into tepid water',
    )
  }

  const voidShards = shards.filter((sh) => sh.condition === 'void')
  if (voidShards.length > 0 && voidShards.length <= 5) {
    recs.push(
      `Re-examine these melted shards: ${voidShards.map((sh) => sh.file).join(', ')}`,
    )
  } else if (voidShards.length > 5) {
    recs.push(
      `Re-examine these ${voidShards.length} melted shards before the crystal blizzard collapses entirely`,
    )
  }

  const poorStorms = storms.filter(
    (st) => st.condition === 'void' || st.condition === 'dry-ground',
  )
  if (poorStorms.length === storms.length && storms.length > 0) {
    recs.push(
      'All storms have dissipated — the frozen landscape needs renewal from the bedrock up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your crystal blizzard gleams with prismatic clarity — each shard captures frozen wisdom in perfect geometric form')
  }

  return recs
}
