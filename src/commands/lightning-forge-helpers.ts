// ─── Interfaces ──────────────────────────────────────────

export interface StrikingMeasure {
  speed: number
  bolt:
    | 'lightning-fast'
    | 'rapid-strike'
    | 'proper-speed'
    | 'slow-motion'
    | 'glacial-pace'
    | 'no-speed'
  hasHighSpeed: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasDirect: boolean
  hasNoCircuits: boolean
  hasStreamlined: boolean
  hasNoBottlenecked: boolean
  hasFast: boolean
  hasNoSlow: boolean
  hasOptimized: boolean
  hasNoNaive: boolean
  hasConcurrent: boolean
  hasNoSequential: boolean
  hasResponsive: boolean
  hasNoSluggish: boolean
  hasQuick: boolean
  wastefulCount: number
  circuitCount: number
}

export interface CommandingMeasure {
  authority: number
  thunder:
    | 'thunderous-decree'
    | 'commanding-voice'
    | 'proper-authority'
    | 'whispered-request'
    | 'silent-mime'
    | 'no-authority'
  hasHighAuthority: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasClearAPI: boolean
  hasNoMysteryAPI: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasDecisive: boolean
  hasNoAmbiguous: boolean
  hasTyped: boolean
  hasNoUntyped: boolean
  hasNamed: boolean
  hasNoAnonymous: boolean
  hasAuthoritative: boolean
  hiddenCount: number
  undocumentedCount: number
}

export interface WeatheringMeasure {
  resilience: number
  storm:
    | 'storm-proof'
    | 'weather-resistant'
    | 'proper-shelter'
    | 'storm-damaged'
    | 'collapsed-roof'
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
  hasAdaptive: boolean
  hasNoRigid: boolean
  hasEnduring: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface FocusingMeasure {
  precision: number
  spark:
    | 'laser-focused'
    | 'precise-strike'
    | 'proper-aim'
    | 'scattered-shot'
    | 'wild-fire'
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
  hasConsistent: boolean
  hasNoErratic: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasFocused: boolean
  unsafeCount: number
  buggyCount: number
}

export interface LearningMeasure {
  wisdom: number
  lightning:
    | 'ancient-storm'
    | 'experienced-wielder'
    | 'proper-conductor'
    | 'fresh-spark'
    | 'no-charge'
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

export type BoltCondition =
  | 'thunder-masterpiece'
  | 'lightning-crafted'
  | 'proper-forge'
  | 'dying-ember'
  | 'cold-anvil'
  | 'void'

export interface ThunderBolt {
  file: string
  lightningSpeed: number
  thunderAuthority: number
  stormResilience: number
  sparkPrecision: number
  boltWisdom: number
  striking: StrikingMeasure
  commanding: CommandingMeasure
  weathering: WeatheringMeasure
  focusing: FocusingMeasure
  learning: LearningMeasure
  condition: BoltCondition
  qualityScore: number
}

export type AnvilType =
  | 'divine-forge'
  | 'storm-anvil'
  | 'proper-forge'
  | 'small-workshop'
  | 'cold-hearth'
  | 'no-anvil'

export type AnvilCondition =
  | 'thunder-hall'
  | 'storm-forge'
  | 'proper-workshop'
  | 'dying-fire'
  | 'cold-anvil'
  | 'void'

export interface ThunderAnvil {
  directory: string
  bolts: ThunderBolt[]
  avgSpeed: number
  avgPrecision: number
  avgWisdom: number
  thunderMasterpieceCount: number
  voidCount: number
  anvilType: AnvilType
  condition: AnvilCondition
}

export type SmithGrade =
  | 'thunder-god'
  | 'storm-smith'
  | 'lightning-worker'
  | 'apprentice'
  | 'novice'
  | 'scorched-fingers'

export interface ThunderStats {
  totalFiles: number
  totalAnvils: number
  avgLightningSpeed: number
  avgThunderAuthority: number
  avgStormResilience: number
  avgSparkPrecision: number
  avgBoltWisdom: number
  thunderMasterpieceCount: number
  lightningCraftedCount: number
  properForgeCount: number
  dyingEmberCount: number
  coldAnvilCount: number
  voidCount: number
  hasHighSpeedCount: number
  hasHighAuthorityCount: number
  hasHighResilienceCount: number
  hasHighPrecisionCount: number
  hasHighWisdomCount: number
  overallPower: number
  smithGrade: SmithGrade
  bestBolt: string
  fastest: string
  mostAuthoritative: string
  mostResilient: string
  mostPrecise: string
  wisest: string
}

export interface ThunderForgeResult {
  bolts: ThunderBolt[]
  anvils: ThunderAnvil[]
  storm: {
    avgSpeed: number
    avgPrecision: number
    avgWisdom: number
    isThunderous: boolean
    overallPower: number
  }
  stats: ThunderStats
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

/** @example measureStriking('async function foo() { return await bar() }') */
export function measureStriking(content: string): StrikingMeasure {
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const wastefulCount = (content.match(/\b(delete\s|void\s)/g) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasDirect = /\b(return|throw|yield)\b/.test(content)
  const circuitCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoCircuits = circuitCount === 0
  const hasStreamlined = /\b(import|export)\b/.test(content)
  const hasNoBottlenecked = !/\b(sleep|wait|delay|block)\b/i.test(content)
  const hasFast = /\b(readonly|freeze|sealed)\b/.test(content)
  const hasNoSlow = !/\b(slow|lag|crawl)\b/i.test(content)
  const hasOptimized = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|brute|brute.?force)\b/i.test(content)
  const hasConcurrent = /\b(try|catch|finally)\b/.test(content)
  const hasNoSequential = !/\b(for\s+await)\b/.test(content)
  const hasResponsive = /\b(if|else|switch)\b/.test(content)
  const hasNoSluggish = !/\b(timeout|stall|hang)\b/i.test(content)
  const hasQuick = /\bJSON\b/.test(content)

  const positiveBooleans = [
    hasEfficient,
    hasDirect,
    hasStreamlined,
    hasFast,
    hasOptimized,
    hasConcurrent,
    hasResponsive,
    hasQuick,
  ]

  const speed = computeScore(positiveBooleans)
  const hasHighSpeed = speed >= 60
  const bolt = classifyBolt(speed)

  return {
    speed,
    bolt,
    hasHighSpeed,
    hasEfficient,
    hasNoWasteful,
    hasDirect,
    hasNoCircuits,
    hasStreamlined,
    hasNoBottlenecked,
    hasFast,
    hasNoSlow,
    hasOptimized,
    hasNoNaive,
    hasConcurrent,
    hasNoSequential,
    hasResponsive,
    hasNoSluggish,
    hasQuick,
    wastefulCount,
    circuitCount,
  }
}

/** @example measureCommanding('export function readConfig(): Config { }') */
export function measureCommanding(content: string): CommandingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const hiddenCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoHidden = hiddenCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasClearAPI = /\b(interface|type|class)\b/.test(content)
  const hasNoMysteryAPI = !/\b(magic|secret|unknown)\b/i.test(content)
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const hasNoContradictory = !/\b(contradict|conflict|inconsistent)\b/i.test(content)
  const hasDecisive = /\b(if|else|return|throw)\b/.test(content)
  const hasNoAmbiguous = !/\b(maybe|perhaps|might|could)\b/i.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUntyped = !content.includes('@ts-ignore')
  const hasNamed = /\b(function|class|const\s+\w+\s*[:=])\b/.test(content)
  const hasNoAnonymous = !/\(=>\s*{/.test(content)
  const hasAuthoritative = /\b(import|from)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasDocumented,
    hasClearAPI,
    hasConsistent,
    hasDecisive,
    hasTyped,
    hasNamed,
    hasAuthoritative,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60
  const thunder = classifyThunder(authority)

  return {
    authority,
    thunder,
    hasHighAuthority,
    hasExported,
    hasNoHidden,
    hasDocumented,
    hasNoUndocumented,
    hasClearAPI,
    hasNoMysteryAPI,
    hasConsistent,
    hasNoContradictory,
    hasDecisive,
    hasNoAmbiguous,
    hasTyped,
    hasNoUntyped,
    hasNamed,
    hasNoAnonymous,
    hasAuthoritative,
    hiddenCount,
    undocumentedCount,
  }
}

/** @example measureWeathering('try { foo() } catch { bar() }') */
export function measureWeathering(content: string): WeatheringMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasTested =
    /\b(describe|it\(|test\(|expect\()\b/.test(content) ||
    (/\btry\b/.test(content) && /\bcatch\b/.test(content))
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoFragile = !/\b(brittle|fragile)\b/i.test(content)
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasNoRigid = !/\bhardcode\b/i.test(content)
  const hasEnduring = /\b(readonly|private|protected|export)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasTested,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasAdaptive,
    hasEnduring,
  ]

  const resilience = computeScore(positiveBooleans)
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
    hasAdaptive,
    hasNoRigid,
    hasEnduring,
    bareCrashCount,
    untestedCount,
  }
}

/** @example measureFocusing('export function add(a: number, b: number): number { return a + b }') */
export function measureFocusing(content: string): FocusingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /\b(readonly|as const)\b/.test(content)
  const hasNoWrong = !/\b(wrong|incorrect|invalid)\b/i.test(content)
  const hasExact = /\b(type|interface|enum)\b/.test(content)
  const hasNoApproximate = !/\b(approx|rough|about)\b/i.test(content)
  const hasCorrect = /\b(import|export|from)\b/.test(content)
  const buggyCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasConsistent = /\b(class|interface|type)\b/.test(content)
  const hasNoErratic = !/\b(hack|todo|fixme|xxx)\b/i.test(content)
  const hasValidated = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|suppose)\b/i.test(content)
  const hasClean = /\b(async|await|Promise)\b/.test(content)
  const hasNoDirty = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasFocused = /\bJSON\b/.test(content) || /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasAccurate,
    hasExact,
    hasCorrect,
    hasConsistent,
    hasValidated,
    hasClean,
    hasFocused,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const spark = classifySpark(precision)

  return {
    precision,
    spark,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoWrong,
    hasExact,
    hasNoApproximate,
    hasCorrect,
    hasNoBuggy,
    hasConsistent,
    hasNoErratic,
    hasValidated,
    hasNoAssumed,
    hasClean,
    hasNoDirty,
    hasFocused,
    unsafeCount,
    buggyCount,
  }
}

/** @example measureLearning('export const PROVEN_PATTERN = true') */
export function measureLearning(content: string): LearningMeasure {
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const experimentalCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoExperimental = experimentalCount === 0
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasEstablished = /\b(import|export|from)\b/.test(content)
  const hasNoNovel = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(hack|workaround|monkey)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise|readonly)\b/.test(content)

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

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const lightning = classifyLightning(wisdom)

  return {
    wisdom,
    lightning,
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

function classifyBolt(score: number): StrikingMeasure['bolt'] {
  if (score >= 90) return 'lightning-fast'
  if (score >= 75) return 'rapid-strike'
  if (score >= 60) return 'proper-speed'
  if (score >= 40) return 'slow-motion'
  if (score >= 20) return 'glacial-pace'
  return 'no-speed'
}

function classifyThunder(score: number): CommandingMeasure['thunder'] {
  if (score >= 90) return 'thunderous-decree'
  if (score >= 75) return 'commanding-voice'
  if (score >= 60) return 'proper-authority'
  if (score >= 40) return 'whispered-request'
  if (score >= 20) return 'silent-mime'
  return 'no-authority'
}

function classifyStorm(score: number): WeatheringMeasure['storm'] {
  if (score >= 90) return 'storm-proof'
  if (score >= 75) return 'weather-resistant'
  if (score >= 60) return 'proper-shelter'
  if (score >= 40) return 'storm-damaged'
  if (score >= 20) return 'collapsed-roof'
  return 'no-resilience'
}

function classifySpark(score: number): FocusingMeasure['spark'] {
  if (score >= 90) return 'laser-focused'
  if (score >= 75) return 'precise-strike'
  if (score >= 60) return 'proper-aim'
  if (score >= 40) return 'scattered-shot'
  if (score >= 20) return 'wild-fire'
  return 'no-precision'
}

function classifyLightning(score: number): LearningMeasure['lightning'] {
  if (score >= 90) return 'ancient-storm'
  if (score >= 75) return 'experienced-wielder'
  if (score >= 60) return 'proper-conductor'
  if (score >= 40) return 'fresh-spark'
  if (score >= 20) return 'no-charge'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): BoltCondition {
  if (score >= 90) return 'thunder-masterpiece'
  if (score >= 75) return 'lightning-crafted'
  if (score >= 60) return 'proper-forge'
  if (score >= 40) return 'dying-ember'
  if (score >= 20) return 'cold-anvil'
  return 'void'
}

/** @example classifyAnvilType(bolts) */
export function classifyAnvilType(bolts: ThunderBolt[]): AnvilType {
  if (bolts.length === 0) return 'no-anvil'
  const avg = bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length
  if (avg >= 90) return 'divine-forge'
  if (avg >= 75) return 'storm-anvil'
  if (avg >= 60) return 'proper-forge'
  if (avg >= 40) return 'small-workshop'
  if (avg >= 20) return 'cold-hearth'
  return 'no-anvil'
}

/** @example classifyAnvilCondition(avgPower) */
export function classifyAnvilCondition(avgPower: number): AnvilCondition {
  if (avgPower >= 85) return 'thunder-hall'
  if (avgPower >= 70) return 'storm-forge'
  if (avgPower >= 55) return 'proper-workshop'
  if (avgPower >= 35) return 'dying-fire'
  if (avgPower >= 15) return 'cold-anvil'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgPower: number): SmithGrade {
  if (avgPower >= 80) return 'thunder-god'
  if (avgPower >= 65) return 'storm-smith'
  if (avgPower >= 50) return 'lightning-worker'
  if (avgPower >= 35) return 'apprentice'
  if (avgPower >= 20) return 'novice'
  return 'scorched-fingers'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeThunderBolt(richContent, 'app.ts') */
export function analyzeThunderBolt(content: string, filePath: string): ThunderBolt {
  const striking = measureStriking(content)
  const commanding = measureCommanding(content)
  const weathering = measureWeathering(content)
  const focusing = measureFocusing(content)
  const learning = measureLearning(content)

  const lightningSpeed = striking.speed
  const thunderAuthority = commanding.authority
  const stormResilience = weathering.resilience
  const sparkPrecision = focusing.precision
  const boltWisdom = learning.wisdom

  const qualityScore = Math.round(
    lightningSpeed * 0.2 +
    thunderAuthority * 0.2 +
    stormResilience * 0.2 +
    sparkPrecision * 0.2 +
    boltWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    lightningSpeed,
    thunderAuthority,
    stormResilience,
    sparkPrecision,
    boltWisdom,
    striking,
    commanding,
    weathering,
    focusing,
    learning,
    condition,
    qualityScore,
  }
}

/** @example analyzeThunderAnvil(bolts, 'src') */
export function analyzeThunderAnvil(bolts: ThunderBolt[], dirPath: string): ThunderAnvil {
  if (bolts.length === 0) {
    return {
      directory: dirPath,
      bolts: [],
      avgSpeed: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      thunderMasterpieceCount: 0,
      voidCount: 0,
      anvilType: 'no-anvil',
      condition: 'void',
    }
  }

  const avgSpeed = Math.round(
    bolts.reduce((s, b) => s + b.lightningSpeed, 0) / bolts.length,
  )
  const avgPrecision = Math.round(
    bolts.reduce((s, b) => s + b.sparkPrecision, 0) / bolts.length,
  )
  const avgWisdom = Math.round(
    bolts.reduce((s, b) => s + b.boltWisdom, 0) / bolts.length,
  )

  const thunderMasterpieceCount = bolts.filter(
    (b) => b.condition === 'thunder-masterpiece',
  ).length
  const voidCount = bolts.filter((b) => b.condition === 'void').length

  const anvilType = classifyAnvilType(bolts)
  const avgPower = Math.round(
    bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length,
  )
  const condition = classifyAnvilCondition(avgPower)

  return {
    directory: dirPath,
    bolts,
    avgSpeed,
    avgPrecision,
    avgWisdom,
    thunderMasterpieceCount,
    voidCount,
    anvilType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildThunderForgeResult(['a.ts'], [content]) */
export async function buildThunderForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ThunderForgeResult> {
  const bolts: ThunderBolt[] = files.map((file, i) =>
    analyzeThunderBolt(contents[i] ?? '', file),
  )

  // ─── Group by directory
  const dirMap = new Map<string, ThunderBolt[]>()
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

  const anvils: ThunderAnvil[] = Array.from(dirMap.entries()).map(([dir, dirBolts]) =>
    analyzeThunderAnvil(dirBolts, dir),
  )

  // ─── Storm overview
  const avgSpeed =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.lightningSpeed, 0) / bolts.length)
      : 0
  const avgPrecision =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.sparkPrecision, 0) / bolts.length)
      : 0
  const avgWisdom =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.boltWisdom, 0) / bolts.length)
      : 0

  const overallPower =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length)
      : 0
  const isThunderous = overallPower >= 60

  const storm = { avgSpeed, avgPrecision, avgWisdom, isThunderous, overallPower }

  // ─── Stats
  const avgLightningSpeed = avgSpeed
  const avgThunderAuthority =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.thunderAuthority, 0) / bolts.length)
      : 0
  const avgStormResilience =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.stormResilience, 0) / bolts.length)
      : 0
  const avgSparkPrecision = avgPrecision
  const avgBoltWisdom = avgWisdom

  const thunderMasterpieceCount = bolts.filter(
    (b) => b.condition === 'thunder-masterpiece',
  ).length
  const lightningCraftedCount = bolts.filter(
    (b) => b.condition === 'lightning-crafted',
  ).length
  const properForgeCount = bolts.filter((b) => b.condition === 'proper-forge').length
  const dyingEmberCount = bolts.filter((b) => b.condition === 'dying-ember').length
  const coldAnvilCount = bolts.filter((b) => b.condition === 'cold-anvil').length
  const voidCount = bolts.filter((b) => b.condition === 'void').length

  const hasHighSpeedCount = bolts.filter((b) => b.striking.hasHighSpeed).length
  const hasHighAuthorityCount = bolts.filter((b) => b.commanding.hasHighAuthority).length
  const hasHighResilienceCount = bolts.filter((b) => b.weathering.hasHighResilience).length
  const hasHighPrecisionCount = bolts.filter((b) => b.focusing.hasHighPrecision).length
  const hasHighWisdomCount = bolts.filter((b) => b.learning.hasHighWisdom).length

  const smithGrade = classifySmithGrade(overallPower)

  const bestBolt = bolts.length > 0
    ? bolts.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file
    : ''
  const fastest = bolts.length > 0
    ? bolts.reduce((best, b) => (b.lightningSpeed > best.lightningSpeed ? b : best)).file
    : ''
  const mostAuthoritative = bolts.length > 0
    ? bolts.reduce((best, b) => (b.thunderAuthority > best.thunderAuthority ? b : best)).file
    : ''
  const mostResilient = bolts.length > 0
    ? bolts.reduce((best, b) => (b.stormResilience > best.stormResilience ? b : best)).file
    : ''
  const mostPrecise = bolts.length > 0
    ? bolts.reduce((best, b) => (b.sparkPrecision > best.sparkPrecision ? b : best)).file
    : ''
  const wisest = bolts.length > 0
    ? bolts.reduce((best, b) => (b.boltWisdom > best.boltWisdom ? b : best)).file
    : ''

  const stats: ThunderStats = {
    totalFiles: files.length,
    totalAnvils: anvils.length,
    avgLightningSpeed,
    avgThunderAuthority,
    avgStormResilience,
    avgSparkPrecision,
    avgBoltWisdom,
    thunderMasterpieceCount,
    lightningCraftedCount,
    properForgeCount,
    dyingEmberCount,
    coldAnvilCount,
    voidCount,
    hasHighSpeedCount,
    hasHighAuthorityCount,
    hasHighResilienceCount,
    hasHighPrecisionCount,
    hasHighWisdomCount,
    overallPower,
    smithGrade,
    bestBolt,
    fastest,
    mostAuthoritative,
    mostResilient,
    mostPrecise,
    wisest,
  }

  // ─── Recommendations
  const recommendations = generateRecommendations(bolts, anvils, storm, stats)

  return { bolts, anvils, storm, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(bolts, anvils, storm, stats) */
export function generateRecommendations(
  bolts: ThunderBolt[],
  anvils: ThunderAnvil[],
  _storm: ThunderForgeResult['storm'],
  stats: ThunderStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgLightningSpeed >= 90 &&
    stats.avgThunderAuthority >= 90 &&
    stats.avgStormResilience >= 90 &&
    stats.avgSparkPrecision >= 90 &&
    stats.avgBoltWisdom >= 90
  ) {
    recs.push(
      'Your thunder forge roars with divine power! Every bolt is a masterpiece of lightning and thunder',
    )
    return recs
  }

  if (stats.avgLightningSpeed < 60) {
    recs.push(
      'Channel more lightning speed — code needs efficient execution like a lightning strike',
    )
  }

  if (stats.avgThunderAuthority < 60) {
    recs.push(
      'Strengthen thunder authority — code should command with decisive, well-documented APIs',
    )
  }

  if (stats.avgStormResilience < 60) {
    recs.push(
      'Harden storm resilience — code must survive chaos with error handling and defensive patterns',
    )
  }

  if (stats.avgSparkPrecision < 60) {
    recs.push(
      'Sharpen spark precision — each line of code should strike with exact, type-safe logic',
    )
  }

  if (stats.avgBoltWisdom < 60) {
    recs.push(
      'Deepen bolt wisdom — embrace proven patterns and principled design from rapid iteration',
    )
  }

  if (stats.overallPower < 40) {
    recs.push(
      'The forge has gone cold — focus on foundational quality before striking again',
    )
  }

  const voidBolts = bolts.filter((b) => b.condition === 'void')
  if (voidBolts.length > 0 && voidBolts.length <= 5) {
    recs.push(
      `Reforge these spent bolts: ${voidBolts.map((b) => b.file).join(', ')}`,
    )
  } else if (voidBolts.length > 5) {
    recs.push(
      `Reforge these ${voidBolts.length} spent bolts before the anvil rusts`,
    )
  }

  const poorAnvils = anvils.filter(
    (a) => a.condition === 'void' || a.condition === 'dying-fire',
  )
  if (poorAnvils.length === anvils.length && anvils.length > 0) {
    recs.push(
      'All anvils show signs of rust — consider a comprehensive reforging strategy for the codebase',
    )
  }

  if (recs.length === 0) {
    recs.push('Your forge burns bright — keep hammering those bolts into masterpieces')
  }

  return recs
}
