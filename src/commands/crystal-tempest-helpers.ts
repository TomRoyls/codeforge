// ─── Interfaces ──────────────────────────────────────────

export interface FormingMeasure {
  precision: number
  crystal:
    | 'perfect-lattice'
    | 'hexagonal-perfection'
    | 'proper-crystal'
    | 'flawed-gem'
    | 'shattered-ice'
    | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  unsafeCount: number
  erraticCount: number
}

export interface WeatheringMeasure {
  resilience: number
  storm:
    | 'unbreakable-ice'
    | 'tempest-proof'
    | 'proper-shelter'
    | 'storm-damaged'
    | 'shattered-glass'
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
  hasAntifragile: boolean
  hasNoBrittle: boolean
  hasEnduring: boolean
  bareCrashCount: number
  fragileCount: number
}

export interface RefractingMeasure {
  clarity: number
  shard:
    | 'prism-perfect'
    | 'clear-crystal'
    | 'proper-glass'
    | 'cloudy-ice'
    | 'opaque-frost'
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
  hasExplained: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface SculptingMeasure {
  beauty: number
  sculpture:
    | 'ice-masterpiece'
    | 'elegant-form'
    | 'proper-shape'
    | 'rough-block'
    | 'melted-lump'
    | 'no-beauty'
  hasHighBeauty: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasRefined: boolean
  hasNoRough: boolean
  hasBeautiful: boolean
  tangledCount: number
  monolithicCount: number
}

export interface RememberingMeasure {
  wisdom: number
  glacier:
    | 'ancient-glacier'
    | 'deep-permafrost'
    | 'proper-ice'
    | 'thin-frost'
    | 'melting-snow'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  experimentalCount: number
  adHocCount: number
}

export type CrystalCondition =
  | 'crystal-masterpiece'
  | 'frozen-perfection'
  | 'proper-ice'
  | 'slush-puddle'
  | 'dry-ground'
  | 'void'

export interface CrystalShard {
  file: string
  crystallinePrecision: number
  stormResilience: number
  shardClarity: number
  frozenBeauty: number
  iceWisdom: number
  forming: FormingMeasure
  weathering: WeatheringMeasure
  refracting: RefractingMeasure
  sculpting: SculptingMeasure
  remembering: RememberingMeasure
  condition: CrystalCondition
  qualityScore: number
}

export type FieldType =
  | 'glacier-field'
  | 'ice-lake'
  | 'proper-frost'
  | 'thin-ice'
  | 'dry-ground'
  | 'no-field'

export type FieldCondition =
  | 'crystal-palace'
  | 'frozen-lake'
  | 'proper-field'
  | 'slush-pond'
  | 'dry-ground'
  | 'void'

export interface CrystalField {
  directory: string
  shards: CrystalShard[]
  avgPrecision: number
  avgResilience: number
  avgWisdom: number
  crystalMasterpieceCount: number
  voidCount: number
  fieldType: FieldType
  condition: FieldCondition
}

export type FrostGrade =
  | 'ice-emperor'
  | 'frost-architect'
  | 'crystal-worker'
  | 'apprentice'
  | 'novice'
  | 'melting-snowman'

export interface CrystalStats {
  totalFiles: number
  totalFields: number
  avgCrystallinePrecision: number
  avgStormResilience: number
  avgShardClarity: number
  avgFrozenBeauty: number
  avgIceWisdom: number
  crystalMasterpieceCount: number
  frozenPerfectionCount: number
  properIceCount: number
  slushPuddleCount: number
  dryGroundCount: number
  voidCount: number
  hasHighPrecisionCount: number
  hasHighResilienceCount: number
  hasHighClarityCount: number
  hasHighBeautyCount: number
  hasHighWisdomCount: number
  overallFrost: number
  frostGrade: FrostGrade
  bestShard: string
  mostPrecise: string
  mostResilient: string
  clearest: string
  mostBeautiful: string
  wisest: string
}

export interface CrystalTempestResult {
  shards: CrystalShard[]
  fields: CrystalField[]
  blizzard: {
    avgPrecision: number
    avgResilience: number
    avgWisdom: number
    isCrystal: boolean
    overallFrost: number
  }
  stats: CrystalStats
  recommendations: string[]
}

// ─── Measure functions ──────────────────────────────────

/** @example measureForming('export function foo(): string { return "bar" }') */
export function measureForming(content: string): FormingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|never|unknown|object)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasExact = /:\s*(string|number|boolean|void|never|unknown)\b/.test(content)
  const hasNoApproximate = !/\b(approx|rough|about|around)\b/i.test(content)
  const hasAccurate = /\b(type|interface|enum)\b/.test(content)
  const hasNoWrong = !/\b(wrong|incorrect|invalid|mistake)\b/i.test(content)
  const hasConsistent = /\b(readonly|as const)\b/.test(content)
  const erraticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoChaotic = !/\b(hack|todo|fixme|xxx)\b/i.test(content)
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasNoScattered = !/\b(goto|break|continue)\b/.test(content)
  const hasDeterministic = /\b(pure|deterministic|idempotent|async)\b/.test(content)
  const hasNoRandom = !/\b(random|shuffle|seed)\b/i.test(content)
  const hasPrecise = /\b(readonly|<\w+>|type\s+\w+)\b/.test(content)
  const hasNoVague = !/\b(maybe|perhaps|might|could|somehow)\b/i.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasExact,
    hasAccurate,
    hasConsistent,
    hasWellStructured,
    hasOrganized,
    hasDeterministic,
    hasPrecise,
  ]

  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let precision = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      precision += perFeature + (i < remainder ? 1 : 0)
    }
  }

  const hasHighPrecision = precision >= 60
  const crystal = classifyCrystal(precision)

  return {
    precision,
    crystal,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasExact,
    hasNoApproximate,
    hasAccurate,
    hasNoWrong,
    hasConsistent,
    hasNoErratic,
    hasWellStructured,
    hasNoChaotic,
    hasOrganized,
    hasNoScattered,
    hasDeterministic,
    hasNoRandom,
    hasPrecise,
    hasNoVague,
    unsafeCount,
    erraticCount,
  }
}

/** @example measureWeathering('try { foo() } catch { bar() }') */
export function measureWeathering(content: string): WeatheringMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasTested = /\b(describe|it\(|test\(|expect\()\b/.test(content) || (/\btry\b/.test(content) && /\bcatch\b/.test(content))
  const hasNoUntested = !/\bFIXME\b/.test(content)
  const hasDefensive = /\b(if\b|\?\?|&&|\.optional\b)/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\bcatch\b/.test(content) || /\bdefault\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|finally|fallback|retry)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(try|catch|Error|throw)\b/.test(content)
  const fragileCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasAntifragile = /\b(test|spec|mock|stub)\b/i.test(content)
  const hasNoBrittle = !/\bhardcode\b/i.test(content)
  const hasEnduring = /\b(readonly|freeze|sealed)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasTested,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasAntifragile,
    hasEnduring,
  ]

  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let resilience = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      resilience += perFeature + (i < remainder ? 1 : 0)
    }
  }

  const hasHighResilience = resilience >= 60
  const storm = classifyStorm(resilience)

  return {
    resilience,
    storm,
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
    hasAntifragile,
    hasNoBrittle,
    hasEnduring,
    bareCrashCount,
    fragileCount,
  }
}

/** @example measureRefracting('export function readConfig(): Config { }') */
export function measureRefracting(content: string): RefractingMeasure {
  const hasReadable = /\b(read|parse|decode|interpret)\b/i.test(content) || /\w+\.\w+/.test(content)
  const crypticCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(analyze|parse|read|get|set|is|has|can|should|will|decode|process)\w*\b/i.test(content)
  const hasNoMystery = !/\b(magic|secret|hidden|unknown)\b/i.test(content)
  const hasClear = /\b(clear|explicit|obvious|plain|simple)\b/i.test(content) || /\bexport\b/.test(content)
  const obfuscatedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasUnderstandable = /\b(function|=>|class|interface)\b/.test(content)
  const hasNoArcane = !/\?\?/.test(content) || true
  const hasVisible = /\b(export|public|visible)\b/.test(content)
  const hasNoInvisible = !/\b(private.*#|_hidden)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasExplained = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDocumented,
    hasExplained,
  ]

  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let clarity = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      clarity += perFeature + (i < remainder ? 1 : 0)
    }
  }

  const hasHighClarity = clarity >= 60
  const shard = classifyShard(clarity)

  return {
    clarity,
    shard,
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
    hasExplained,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureSculpting('export class App { private init() {} }') */
export function measureSculpting(content: string): SculptingMeasure {
  const hasElegant = /\b(\.map\(|\.filter\(|\.reduce\(|\.forEach\(|=>|JSON\.parse)\b/.test(content)
  const hasNoClunky = !/\b(for\s*\(let|i\+\+)\b/.test(content)
  const hasCleanPipelines = /\b(=>|\.\w+\()\b/.test(content)
  const tangledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasModular = /\b(import|export|from)\b/.test(content)
  const monolithicCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasEfficient = /\b(async|await|Promise|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(delete\s+\w+\[|void\s)/.test(content)
  const hasReadable = /\b(read|parse|decode|interpret)\b/i.test(content) || /\w+\.\w+/.test(content)
  const hasNoCryptic = !/\beval\s*\(/.test(content)
  const hasOrganized = /\b(class|interface|type|enum|module|namespace)\b/.test(content)
  const hasNoScattered = !/\b(goto|break|continue)\b/.test(content)
  const hasRefined = /\b(abstract|sealed|readonly|private|protected)\b/.test(content)
  const hasNoRough = !/\b(hack|todo|fixme|xxx)\b/i.test(content)
  const hasBeautiful = /\b(readonly|=>|export|async)\b/.test(content)

  const positiveBooleans = [
    hasElegant,
    hasCleanPipelines,
    hasModular,
    hasEfficient,
    hasReadable,
    hasOrganized,
    hasRefined,
    hasBeautiful,
  ]

  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let beauty = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      beauty += perFeature + (i < remainder ? 1 : 0)
    }
  }

  const hasHighBeauty = beauty >= 60
  const sculpture = classifySculpture(beauty)

  return {
    beauty,
    sculpture,
    hasHighBeauty,
    hasElegant,
    hasNoClunky,
    hasCleanPipelines,
    hasNoTangled,
    hasModular,
    hasNoMonolithic,
    hasEfficient,
    hasNoWasteful,
    hasReadable,
    hasNoCryptic,
    hasOrganized,
    hasNoScattered,
    hasRefined,
    hasNoRough,
    hasBeautiful,
    tangledCount,
    monolithicCount,
  }
}

/** @example measureRemembering('export const PROVEN_PATTERN = true') */
export function measureRemembering(content: string): RememberingMeasure {
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const experimentalCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoExperimental = experimentalCount === 0
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasEstablished = /\b(import|export|from)\b/.test(content)
  const hasNoNovel = !/\b(experimental|beta|alpha|wip)\b/i.test(content)
  const hasPrincipled = /\b(readonly|private|protected|abstract)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPatterned = /\b(function|=>|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(hack|workaround|monkey)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>|\bT\b)\b/.test(content)
  const hasNoShallow = !/\b(any|unknown)\b/.test(content) || !/\bany\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise|readonly|export)\b/.test(content)

  const positiveBooleans = [
    hasProven,
    hasMature,
    hasEstablished,
    hasPrincipled,
    hasPatterned,
    hasDeep,
    hasInsightful,
    hasStrategic,
  ]

  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let wisdom = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      wisdom += perFeature + (i < remainder ? 1 : 0)
    }
  }

  const hasHighWisdom = wisdom >= 60
  const glacier = classifyGlacier(wisdom)

  return {
    wisdom,
    glacier,
    hasHighWisdom,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasEstablished,
    hasNoNovel,
    hasPrincipled,
    hasNoAdHoc,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasStrategic,
    experimentalCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyCrystal(score: number): FormingMeasure['crystal'] {
  if (score >= 90) return 'perfect-lattice'
  if (score >= 75) return 'hexagonal-perfection'
  if (score >= 60) return 'proper-crystal'
  if (score >= 40) return 'flawed-gem'
  if (score >= 20) return 'shattered-ice'
  return 'no-precision'
}

function classifyStorm(score: number): WeatheringMeasure['storm'] {
  if (score >= 90) return 'unbreakable-ice'
  if (score >= 75) return 'tempest-proof'
  if (score >= 60) return 'proper-shelter'
  if (score >= 40) return 'storm-damaged'
  if (score >= 20) return 'shattered-glass'
  return 'no-resilience'
}

function classifyShard(score: number): RefractingMeasure['shard'] {
  if (score >= 90) return 'prism-perfect'
  if (score >= 75) return 'clear-crystal'
  if (score >= 60) return 'proper-glass'
  if (score >= 40) return 'cloudy-ice'
  if (score >= 20) return 'opaque-frost'
  return 'no-clarity'
}

function classifySculpture(score: number): SculptingMeasure['sculpture'] {
  if (score >= 90) return 'ice-masterpiece'
  if (score >= 75) return 'elegant-form'
  if (score >= 60) return 'proper-shape'
  if (score >= 40) return 'rough-block'
  if (score >= 20) return 'melted-lump'
  return 'no-beauty'
}

function classifyGlacier(score: number): RememberingMeasure['glacier'] {
  if (score >= 90) return 'ancient-glacier'
  if (score >= 75) return 'deep-permafrost'
  if (score >= 60) return 'proper-ice'
  if (score >= 40) return 'thin-frost'
  if (score >= 20) return 'melting-snow'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): CrystalCondition {
  if (score >= 90) return 'crystal-masterpiece'
  if (score >= 75) return 'frozen-perfection'
  if (score >= 60) return 'proper-ice'
  if (score >= 40) return 'slush-puddle'
  if (score >= 20) return 'dry-ground'
  return 'void'
}

/** @example classifyFieldType(shards) */
export function classifyFieldType(shards: CrystalShard[]): FieldType {
  if (shards.length === 0) return 'no-field'
  const avg =
    shards.reduce((s, g) => s + g.qualityScore, 0) / shards.length
  if (avg >= 90) return 'glacier-field'
  if (avg >= 75) return 'ice-lake'
  if (avg >= 60) return 'proper-frost'
  if (avg >= 40) return 'thin-ice'
  if (avg >= 20) return 'dry-ground'
  return 'no-field'
}

/** @example classifyFieldCondition(avgFrost) */
export function classifyFieldCondition(avgFrost: number): FieldCondition {
  if (avgFrost >= 85) return 'crystal-palace'
  if (avgFrost >= 70) return 'frozen-lake'
  if (avgFrost >= 55) return 'proper-field'
  if (avgFrost >= 35) return 'slush-pond'
  if (avgFrost >= 15) return 'dry-ground'
  return 'void'
}

/** @example classifyFrostGrade(80) */
export function classifyFrostGrade(avgFrost: number): FrostGrade {
  if (avgFrost >= 80) return 'ice-emperor'
  if (avgFrost >= 65) return 'frost-architect'
  if (avgFrost >= 50) return 'crystal-worker'
  if (avgFrost >= 35) return 'apprentice'
  if (avgFrost >= 20) return 'novice'
  return 'melting-snowman'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeCrystalShard(richContent, 'app.ts') */
export function analyzeCrystalShard(content: string, filePath: string): CrystalShard {
  const forming = measureForming(content)
  const weathering = measureWeathering(content)
  const refracting = measureRefracting(content)
  const sculpting = measureSculpting(content)
  const remembering = measureRemembering(content)

  const crystallinePrecision = forming.precision
  const stormResilience = weathering.resilience
  const shardClarity = refracting.clarity
  const frozenBeauty = sculpting.beauty
  const iceWisdom = remembering.wisdom

  const qualityScore = Math.round(
    crystallinePrecision * 0.2 +
    stormResilience * 0.2 +
    shardClarity * 0.2 +
    frozenBeauty * 0.2 +
    iceWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    crystallinePrecision,
    stormResilience,
    shardClarity,
    frozenBeauty,
    iceWisdom,
    forming,
    weathering,
    refracting,
    sculpting,
    remembering,
    condition,
    qualityScore,
  }
}

/** @example analyzeCrystalField(shards, 'src') */
export function analyzeCrystalField(shards: CrystalShard[], dirPath: string): CrystalField {
  if (shards.length === 0) {
    return {
      directory: dirPath,
      shards: [],
      avgPrecision: 0,
      avgResilience: 0,
      avgWisdom: 0,
      crystalMasterpieceCount: 0,
      voidCount: 0,
      fieldType: 'no-field',
      condition: 'void',
    }
  }

  const avgPrecision = Math.round(
    shards.reduce((s, g) => s + g.crystallinePrecision, 0) / shards.length,
  )
  const avgResilience = Math.round(
    shards.reduce((s, g) => s + g.stormResilience, 0) / shards.length,
  )
  const avgWisdom = Math.round(
    shards.reduce((s, g) => s + g.iceWisdom, 0) / shards.length,
  )

  const crystalMasterpieceCount = shards.filter(
    (g) => g.condition === 'crystal-masterpiece',
  ).length
  const voidCount = shards.filter((g) => g.condition === 'void').length

  const fieldType = classifyFieldType(shards)
  const avgFrost = Math.round(
    shards.reduce((s, g) => s + g.qualityScore, 0) / shards.length,
  )
  const condition = classifyFieldCondition(avgFrost)

  return {
    directory: dirPath,
    shards,
    avgPrecision,
    avgResilience,
    avgWisdom,
    crystalMasterpieceCount,
    voidCount,
    fieldType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCrystalTempestResult(['a.ts'], [content]) */
export async function buildCrystalTempestResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrystalTempestResult> {
  const shards: CrystalShard[] = files.map((file, i) =>
    analyzeCrystalShard(contents[i] ?? '', file),
  )

  // ─── Group by directory ──────────────────────────────
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

  const fields: CrystalField[] = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeCrystalField(dirShards, dir),
  )

  // ─── Blizzard ────────────────────────────────────────
  const avgPrecision =
    shards.length > 0
      ? Math.round(shards.reduce((s, g) => s + g.crystallinePrecision, 0) / shards.length)
      : 0
  const avgResilience =
    shards.length > 0
      ? Math.round(shards.reduce((s, g) => s + g.stormResilience, 0) / shards.length)
      : 0
  const avgWisdom =
    shards.length > 0
      ? Math.round(shards.reduce((s, g) => s + g.iceWisdom, 0) / shards.length)
      : 0

  const overallFrost =
    shards.length > 0
      ? Math.round(shards.reduce((s, g) => s + g.qualityScore, 0) / shards.length)
      : 0
  const isCrystal = overallFrost >= 60

  const blizzard = { avgPrecision, avgResilience, avgWisdom, isCrystal, overallFrost }

  // ─── Stats ───────────────────────────────────────────
  const avgCrystallinePrecision = avgPrecision
  const avgStormResilience = avgResilience
  const avgShardClarity =
    shards.length > 0
      ? Math.round(shards.reduce((s, g) => s + g.shardClarity, 0) / shards.length)
      : 0
  const avgFrozenBeauty =
    shards.length > 0
      ? Math.round(shards.reduce((s, g) => s + g.frozenBeauty, 0) / shards.length)
      : 0
  const avgIceWisdom = avgWisdom

  const crystalMasterpieceCount = shards.filter(
    (g) => g.condition === 'crystal-masterpiece',
  ).length
  const frozenPerfectionCount = shards.filter(
    (g) => g.condition === 'frozen-perfection',
  ).length
  const properIceCount = shards.filter((g) => g.condition === 'proper-ice').length
  const slushPuddleCount = shards.filter((g) => g.condition === 'slush-puddle').length
  const dryGroundCount = shards.filter((g) => g.condition === 'dry-ground').length
  const voidCount = shards.filter((g) => g.condition === 'void').length

  const hasHighPrecisionCount = shards.filter((g) => g.forming.hasHighPrecision).length
  const hasHighResilienceCount = shards.filter((g) => g.weathering.hasHighResilience).length
  const hasHighClarityCount = shards.filter((g) => g.refracting.hasHighClarity).length
  const hasHighBeautyCount = shards.filter((g) => g.sculpting.hasHighBeauty).length
  const hasHighWisdomCount = shards.filter((g) => g.remembering.hasHighWisdom).length

  const frostGrade = classifyFrostGrade(overallFrost)

  const bestShard = shards.length > 0
    ? shards.reduce((best, g) => (g.qualityScore > best.qualityScore ? g : best)).file
    : ''
  const mostPrecise = shards.length > 0
    ? shards.reduce((best, g) => (g.crystallinePrecision > best.crystallinePrecision ? g : best)).file
    : ''
  const mostResilient = shards.length > 0
    ? shards.reduce((best, g) => (g.stormResilience > best.stormResilience ? g : best)).file
    : ''
  const clearest = shards.length > 0
    ? shards.reduce((best, g) => (g.shardClarity > best.shardClarity ? g : best)).file
    : ''
  const mostBeautiful = shards.length > 0
    ? shards.reduce((best, g) => (g.frozenBeauty > best.frozenBeauty ? g : best)).file
    : ''
  const wisest = shards.length > 0
    ? shards.reduce((best, g) => (g.iceWisdom > best.iceWisdom ? g : best)).file
    : ''

  const stats: CrystalStats = {
    totalFiles: files.length,
    totalFields: fields.length,
    avgCrystallinePrecision,
    avgStormResilience,
    avgShardClarity,
    avgFrozenBeauty,
    avgIceWisdom,
    crystalMasterpieceCount,
    frozenPerfectionCount,
    properIceCount,
    slushPuddleCount,
    dryGroundCount,
    voidCount,
    hasHighPrecisionCount,
    hasHighResilienceCount,
    hasHighClarityCount,
    hasHighBeautyCount,
    hasHighWisdomCount,
    overallFrost,
    frostGrade,
    bestShard,
    mostPrecise,
    mostResilient,
    clearest,
    mostBeautiful,
    wisest,
  }

  // ─── Recommendations ────────────────────────────────
  const recommendations = generateRecommendations(shards, fields, blizzard, stats)

  return { shards, fields, blizzard, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(shards, fields, blizzard, stats) */
export function generateRecommendations(
  shards: CrystalShard[],
  fields: CrystalField[],
  _blizzard: CrystalTempestResult['blizzard'],
  stats: CrystalStats,
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
      'Your crystal tempest shines with perfect precision! Every shard is a masterpiece of frozen elegance',
    )
    return recs
  }

  if (stats.avgCrystallinePrecision < 60) {
    recs.push(
      'Hone your crystalline precision — code needs sharp, well-defined structures like ice crystal lattices',
    )
  }

  if (stats.avgStormResilience < 60) {
    recs.push(
      'Strengthen storm resilience — code must weather the tempest with error handling and defensive patterns',
    )
  }

  if (stats.avgShardClarity < 60) {
    recs.push(
      'Improve shard clarity — each piece of code should refract understanding like a perfect ice prism',
    )
  }

  if (stats.avgFrozenBeauty < 60) {
    recs.push(
      'Enhance frozen beauty — code should be sculpted with elegant forms and clean pipelines',
    )
  }

  if (stats.avgIceWisdom < 60) {
    recs.push(
      'Deepen ice wisdom — embrace proven patterns and principled design that glaciers remember',
    )
  }

  if (stats.overallFrost < 40) {
    recs.push(
      'The tempest has eroded your frost — focus on foundational quality before the ice thaws completely',
    )
  }

  const voidShards = shards.filter((g) => g.condition === 'void')
  if (voidShards.length > 0 && voidShards.length <= 5) {
    recs.push(
      `Refreeze these barren shards: ${voidShards.map((g) => g.file).join(', ')}`,
    )
  } else if (voidShards.length > 5) {
    recs.push(
      `Refreeze these ${voidShards.length} barren shards before the thaw claims them`,
    )
  }

  const poorFields = fields.filter(
    (f) => f.condition === 'void' || f.condition === 'slush-pond',
  )
  if (poorFields.length === fields.length && fields.length > 0) {
    recs.push(
      'All fields show signs of thawing — consider a comprehensive refreeze strategy for the codebase',
    )
  }

  if (recs.length === 0) {
    recs.push('Your ice holds strong against the tempest — keep refining those crystal structures')
  }

  return recs
}
