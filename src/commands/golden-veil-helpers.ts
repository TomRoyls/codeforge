// ─── Interfaces ──────────────────────────────────────────

export interface IlluminatingMeasure {
  clarity: number
  radiance:
    | 'golden-light'
    | 'warm-glow'
    | 'proper-shine'
    | 'dim-flicker'
    | 'dark-shadow'
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
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasWarm: boolean
  hasNoCold: boolean
  hasInviting: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface WeavingMeasure {
  elegance: number
  veil:
    | 'golden-gossamer'
    | 'elegant-drape'
    | 'proper-fabric'
    | 'coarse-cloth'
    | 'tattered-rag'
    | 'no-elegance'
  hasHighElegance: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasAbstracted: boolean
  hasNoLeaky: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasBeautiful: boolean
  hasNoUgly: boolean
  chaoticCount: number
  tangledCount: number
}

export interface PurifyingMeasure {
  purity: number
  aurum:
    | 'pure-gold'
    | 'refined-gold'
    | 'proper-alloy'
    | 'tarnished-brass'
    | 'rusty-iron'
    | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasHonest: boolean
  hasNoDeceptive: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasReliable: boolean
  unsafeCount: number
  untestedCount: number
}

export interface EnduringMeasure {
  resilience: number
  gold:
    | 'eternal-gold'
    | 'lasting-shine'
    | 'proper-durability'
    | 'fading-luster'
    | 'tarnished-metal'
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
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasStable: boolean
  bareCrashCount: number
  fragileCount: number
}

export interface InheritingMeasure {
  wisdom: number
  legacy:
    | 'ancient-gold'
    | 'heirloom-quality'
    | 'proper-craft'
    | 'disposable-goods'
    | 'no-legacy'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hasNoTactical: boolean
  hasEnduring: boolean
  hackedCount: number
  reinventedCount: number
}

export type ThreadCondition =
  | 'golden-masterpiece'
  | 'radiant-veil'
  | 'proper-curtain'
  | 'faded-fabric'
  | 'torn-rag'
  | 'void'

export interface GoldenThread {
  file: string
  radiantClarity: number
  veilElegance: number
  aurumPurity: number
  goldenResilience: number
  legacyWisdom: number
  illuminating: IlluminatingMeasure
  weaving: WeavingMeasure
  purifying: PurifyingMeasure
  enduring: EnduringMeasure
  inheriting: InheritingMeasure
  condition: ThreadCondition
  qualityScore: number
}

export type LoomType =
  | 'master-loom'
  | 'golden-weave'
  | 'proper-craft'
  | 'small-loom'
  | 'broken-frame'
  | 'no-loom'

export type LoomCondition =
  | 'golden-palace'
  | 'radiant-hall'
  | 'proper-chamber'
  | 'faded-room'
  | 'dark-corner'
  | 'void'

export interface GoldenLoom {
  directory: string
  threads: GoldenThread[]
  avgClarity: number
  avgElegance: number
  avgWisdom: number
  goldenMasterpieceCount: number
  voidCount: number
  loomType: LoomType
  condition: LoomCondition
}

export type WeaverGrade =
  | 'golden-master'
  | 'master-weaver'
  | 'skilled-artisan'
  | 'apprentice'
  | 'novice'
  | 'thread-breaker'

export interface GoldenStats {
  totalFiles: number
  totalLooms: number
  avgRadiantClarity: number
  avgVeilElegance: number
  avgAurumPurity: number
  avgGoldenResilience: number
  avgLegacyWisdom: number
  goldenMasterpieceCount: number
  radiantVeilCount: number
  properCurtainCount: number
  fadedFabricCount: number
  tornRagCount: number
  voidCount: number
  hasHighClarityCount: number
  hasHighEleganceCount: number
  hasHighPurityCount: number
  hasHighResilienceCount: number
  hasHighWisdomCount: number
  overallRadiance: number
  weaverGrade: WeaverGrade
  bestThread: string
  clearest: string
  mostElegant: string
  purest: string
  mostResilient: string
  wisest: string
}

export interface GoldenVeilResult {
  threads: GoldenThread[]
  looms: GoldenLoom[]
  tapestry: {
    avgClarity: number
    avgElegance: number
    avgWisdom: number
    isGolden: boolean
    overallRadiance: number
  }
  stats: GoldenStats
  recommendations: string[]
}

// ─── Measure functions ──────────────────────────────────

/** @example measureIlluminating('export function readConfig(): Config { }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\w+\.\w+/.test(content)
  const crypticCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(analyze|parse|read|get|set|is|has|can|should|will|decode|process)\w*\b/i.test(content)
  const hasNoMystery = !/\b(magic|secret|hidden|unknown)\b/i.test(content)
  const hasClear = /\bexport\b/.test(content)
  const obfuscatedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasUnderstandable = /\b(function|=>|class|interface)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|obscure)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasWarm = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoCold = !/\b(cold|frigid|lifeless)\b/i.test(content)
  const hasInviting = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible(content),
    hasDocumented,
    hasWarm,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const radiance = classifyRadiance(clarity)

  return {
    clarity,
    radiance,
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
    hasDocumented,
    hasNoUndocumented,
    hasWarm,
    hasNoCold,
    hasInviting,
    crypticCount,
    obfuscatedCount,
  }
}

function hasVisible(content: string): boolean {
  return /\b(export|public|visible)\b/.test(content)
}

/** @example measureWeaving('export class App { private init() {} }') */
export function measureWeaving(content: string): WeavingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasCleanPipelines = /\b(=>|\.\w+\()\b/.test(content)
  const tangledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasOrganized = /\b(class|interface|type|enum|module|namespace)\b/.test(content)
  const hasNoScattered = !/\b(goto|break|continue)\b/.test(content)
  const hasEfficient = /\b(async|await|Promise|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(delete\s+\w+\[|void\s)/.test(content)
  const hasAbstracted = /\b(abstract|sealed|readonly|private|protected)\b/.test(content)
  const hasNoLeaky = !/\b(leak|expose|spill)\b/i.test(content)
  const hasElegant = /\b(\.map\(|\.filter\(|\.reduce\(|\.forEach\(|=>|JSON\.parse)\b/.test(content)
  const hasNoClunky = !/\b(for\s*\(let|i\+\+)\b/.test(content)
  const hasBeautiful = /\b(readonly|=>|export|async)\b/.test(content)
  const hasNoUgly = !/\b(hack|todo|fixme|xxx)\b/i.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasCleanPipelines,
    hasEfficient,
    hasOrganized,
    hasAbstracted,
    hasElegant,
    hasBeautiful,
  ]

  const elegance = computeScore(positiveBooleans)
  const hasHighElegance = elegance >= 60
  const veil = classifyVeil(elegance)

  return {
    elegance,
    veil,
    hasHighElegance,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasOrganized,
    hasNoScattered,
    hasEfficient,
    hasNoWasteful,
    hasAbstracted,
    hasNoLeaky,
    hasElegant,
    hasNoClunky,
    hasBeautiful,
    hasNoUgly,
    chaoticCount,
    tangledCount,
  }
}

/** @example measurePurifying('export function add(a: number, b: number): number { return a + b }') */
export function measurePurifying(content: string): PurifyingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = /\b(async|await|Promise)\b/.test(content)
  const hasNoDirty = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasTested = (/\btry\b/.test(content) && /\bcatch\b/.test(content))
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const hasNoErratic = !/\b(hack|todo|fixme|xxx)\b/i.test(content)
  const hasPrincipled = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoAdHoc = (content.match(/\bany\b/g) ?? []).length === 0
  const hasHonest = /\b(return|throw|yield)\b/.test(content)
  const hasNoDeceptive = !/\b(cheat|fake|mock|stub)\b/i.test(content)
  const hasPure = /\b(import|export|from)\b/.test(content)
  const hasNoContaminated = !content.includes('@ts-ignore')
  const hasReliable = /\b(try|catch|Error|throw)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasClean,
    hasTested,
    hasConsistent,
    hasPrincipled,
    hasHonest,
    hasPure,
    hasReliable,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60
  const aurum = classifyAurum(purity)

  return {
    purity,
    aurum,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasTested,
    hasNoUntested,
    hasConsistent,
    hasNoErratic,
    hasPrincipled,
    hasNoAdHoc,
    hasHonest,
    hasNoDeceptive,
    hasPure,
    hasNoContaminated,
    hasReliable,
    unsafeCount,
    untestedCount,
  }
}

/** @example measureEnduring('try { foo() } catch { bar() }') */
export function measureEnduring(content: string): EnduringMeasure {
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
  const hasMaintained = /\b(readonly|freeze|sealed)\b/.test(content)
  const hasNoAbandoned = !/\b(deprecated|legacy|abandoned)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasStable = /\b(async|await|Promise|readonly|export)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasMaintained,
    hasProven,
    hasStable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const gold = classifyGold(resilience)

  return {
    resilience,
    gold,
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
    hasMaintained,
    hasNoAbandoned,
    hasProven,
    hasNoExperimental,
    hasStable,
    bareCrashCount,
    fragileCount,
  }
}

/** @example measureInheriting('export const PROVEN_PATTERN = true') */
export function measureInheriting(content: string): InheritingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const reinventedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoReinvented = reinventedCount === 0
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha|wip)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise|readonly)\b/.test(content)
  const hasNoTactical = !/\b(quick|dirty|temporary)\b/i.test(content)
  const hasEnduring = /\b(readonly|private|protected|export)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPatterned,
    hasMature,
    hasProven,
    hasDeep,
    hasInsightful,
    hasStrategic,
    hasEnduring,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const legacy = classifyLegacy(wisdom)

  return {
    wisdom,
    legacy,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPatterned,
    hasNoReinvented,
    hasMature,
    hasNoNaive,
    hasProven,
    hasNoExperimental,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasStrategic,
    hasNoTactical,
    hasEnduring,
    hackedCount,
    reinventedCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

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

function classifyRadiance(score: number): IlluminatingMeasure['radiance'] {
  if (score >= 90) return 'golden-light'
  if (score >= 75) return 'warm-glow'
  if (score >= 60) return 'proper-shine'
  if (score >= 40) return 'dim-flicker'
  if (score >= 20) return 'dark-shadow'
  return 'no-clarity'
}

function classifyVeil(score: number): WeavingMeasure['veil'] {
  if (score >= 90) return 'golden-gossamer'
  if (score >= 75) return 'elegant-drape'
  if (score >= 60) return 'proper-fabric'
  if (score >= 40) return 'coarse-cloth'
  if (score >= 20) return 'tattered-rag'
  return 'no-elegance'
}

function classifyAurum(score: number): PurifyingMeasure['aurum'] {
  if (score >= 90) return 'pure-gold'
  if (score >= 75) return 'refined-gold'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'tarnished-brass'
  if (score >= 20) return 'rusty-iron'
  return 'no-purity'
}

function classifyGold(score: number): EnduringMeasure['gold'] {
  if (score >= 90) return 'eternal-gold'
  if (score >= 75) return 'lasting-shine'
  if (score >= 60) return 'proper-durability'
  if (score >= 40) return 'fading-luster'
  if (score >= 20) return 'tarnished-metal'
  return 'no-resilience'
}

function classifyLegacy(score: number): InheritingMeasure['legacy'] {
  if (score >= 90) return 'ancient-gold'
  if (score >= 75) return 'heirloom-quality'
  if (score >= 60) return 'proper-craft'
  if (score >= 40) return 'disposable-goods'
  if (score >= 20) return 'no-legacy'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): ThreadCondition {
  if (score >= 90) return 'golden-masterpiece'
  if (score >= 75) return 'radiant-veil'
  if (score >= 60) return 'proper-curtain'
  if (score >= 40) return 'faded-fabric'
  if (score >= 20) return 'torn-rag'
  return 'void'
}

/** @example classifyLoomType(threads) */
export function classifyLoomType(threads: GoldenThread[]): LoomType {
  if (threads.length === 0) return 'no-loom'
  const avg = threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length
  if (avg >= 90) return 'master-loom'
  if (avg >= 75) return 'golden-weave'
  if (avg >= 60) return 'proper-craft'
  if (avg >= 40) return 'small-loom'
  if (avg >= 20) return 'broken-frame'
  return 'no-loom'
}

/** @example classifyLoomCondition(avgRadiance) */
export function classifyLoomCondition(avgRadiance: number): LoomCondition {
  if (avgRadiance >= 85) return 'golden-palace'
  if (avgRadiance >= 70) return 'radiant-hall'
  if (avgRadiance >= 55) return 'proper-chamber'
  if (avgRadiance >= 35) return 'faded-room'
  if (avgRadiance >= 15) return 'dark-corner'
  return 'void'
}

/** @example classifyWeaverGrade(80) */
export function classifyWeaverGrade(avgRadiance: number): WeaverGrade {
  if (avgRadiance >= 80) return 'golden-master'
  if (avgRadiance >= 65) return 'master-weaver'
  if (avgRadiance >= 50) return 'skilled-artisan'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'thread-breaker'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeGoldenThread(richContent, 'app.ts') */
export function analyzeGoldenThread(content: string, filePath: string): GoldenThread {
  const illuminating = measureIlluminating(content)
  const weaving = measureWeaving(content)
  const purifying = measurePurifying(content)
  const enduring = measureEnduring(content)
  const inheriting = measureInheriting(content)

  const radiantClarity = illuminating.clarity
  const veilElegance = weaving.elegance
  const aurumPurity = purifying.purity
  const goldenResilience = enduring.resilience
  const legacyWisdom = inheriting.wisdom

  const qualityScore = Math.round(
    radiantClarity * 0.2 +
    veilElegance * 0.2 +
    aurumPurity * 0.2 +
    goldenResilience * 0.2 +
    legacyWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    radiantClarity,
    veilElegance,
    aurumPurity,
    goldenResilience,
    legacyWisdom,
    illuminating,
    weaving,
    purifying,
    enduring,
    inheriting,
    condition,
    qualityScore,
  }
}

/** @example analyzeGoldenLoom(threads, 'src') */
export function analyzeGoldenLoom(threads: GoldenThread[], dirPath: string): GoldenLoom {
  if (threads.length === 0) {
    return {
      directory: dirPath,
      threads: [],
      avgClarity: 0,
      avgElegance: 0,
      avgWisdom: 0,
      goldenMasterpieceCount: 0,
      voidCount: 0,
      loomType: 'no-loom',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    threads.reduce((s, t) => s + t.radiantClarity, 0) / threads.length,
  )
  const avgElegance = Math.round(
    threads.reduce((s, t) => s + t.veilElegance, 0) / threads.length,
  )
  const avgWisdom = Math.round(
    threads.reduce((s, t) => s + t.legacyWisdom, 0) / threads.length,
  )

  const goldenMasterpieceCount = threads.filter(
    (t) => t.condition === 'golden-masterpiece',
  ).length
  const voidCount = threads.filter((t) => t.condition === 'void').length

  const loomType = classifyLoomType(threads)
  const avgRadiance = Math.round(
    threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length,
  )
  const condition = classifyLoomCondition(avgRadiance)

  return {
    directory: dirPath,
    threads,
    avgClarity,
    avgElegance,
    avgWisdom,
    goldenMasterpieceCount,
    voidCount,
    loomType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildGoldenVeilResult(['a.ts'], [content]) */
export async function buildGoldenVeilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GoldenVeilResult> {
  const threads: GoldenThread[] = files.map((file, i) =>
    analyzeGoldenThread(contents[i] ?? '', file),
  )

  // ─── Group by directory
  const dirMap = new Map<string, GoldenThread[]>()
  for (const thread of threads) {
    const dir = thread.file.includes('/')
      ? thread.file.substring(0, thread.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(thread)
    } else {
      dirMap.set(dir, [thread])
    }
  }

  const looms: GoldenLoom[] = Array.from(dirMap.entries()).map(([dir, dirThreads]) =>
    analyzeGoldenLoom(dirThreads, dir),
  )

  // ─── Tapestry overview
  const avgClarity =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.radiantClarity, 0) / threads.length)
      : 0
  const avgElegance =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.veilElegance, 0) / threads.length)
      : 0
  const avgWisdom =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.legacyWisdom, 0) / threads.length)
      : 0

  const overallRadiance =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length)
      : 0
  const isGolden = overallRadiance >= 60

  const tapestry = { avgClarity, avgElegance, avgWisdom, isGolden, overallRadiance }

  // ─── Stats
  const avgRadiantClarity = avgClarity
  const avgVeilElegance = avgElegance
  const avgAurumPurity =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.aurumPurity, 0) / threads.length)
      : 0
  const avgGoldenResilience =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.goldenResilience, 0) / threads.length)
      : 0
  const avgLegacyWisdom = avgWisdom

  const goldenMasterpieceCount = threads.filter(
    (t) => t.condition === 'golden-masterpiece',
  ).length
  const radiantVeilCount = threads.filter(
    (t) => t.condition === 'radiant-veil',
  ).length
  const properCurtainCount = threads.filter((t) => t.condition === 'proper-curtain').length
  const fadedFabricCount = threads.filter((t) => t.condition === 'faded-fabric').length
  const tornRagCount = threads.filter((t) => t.condition === 'torn-rag').length
  const voidCount = threads.filter((t) => t.condition === 'void').length

  const hasHighClarityCount = threads.filter((t) => t.illuminating.hasHighClarity).length
  const hasHighEleganceCount = threads.filter((t) => t.weaving.hasHighElegance).length
  const hasHighPurityCount = threads.filter((t) => t.purifying.hasHighPurity).length
  const hasHighResilienceCount = threads.filter((t) => t.enduring.hasHighResilience).length
  const hasHighWisdomCount = threads.filter((t) => t.inheriting.hasHighWisdom).length

  const weaverGrade = classifyWeaverGrade(overallRadiance)

  const bestThread = threads.length > 0
    ? threads.reduce((best, t) => (t.qualityScore > best.qualityScore ? t : best)).file
    : ''
  const clearest = threads.length > 0
    ? threads.reduce((best, t) => (t.radiantClarity > best.radiantClarity ? t : best)).file
    : ''
  const mostElegant = threads.length > 0
    ? threads.reduce((best, t) => (t.veilElegance > best.veilElegance ? t : best)).file
    : ''
  const purest = threads.length > 0
    ? threads.reduce((best, t) => (t.aurumPurity > best.aurumPurity ? t : best)).file
    : ''
  const mostResilient = threads.length > 0
    ? threads.reduce((best, t) => (t.goldenResilience > best.goldenResilience ? t : best)).file
    : ''
  const wisest = threads.length > 0
    ? threads.reduce((best, t) => (t.legacyWisdom > best.legacyWisdom ? t : best)).file
    : ''

  const stats: GoldenStats = {
    totalFiles: files.length,
    totalLooms: looms.length,
    avgRadiantClarity,
    avgVeilElegance,
    avgAurumPurity,
    avgGoldenResilience,
    avgLegacyWisdom,
    goldenMasterpieceCount,
    radiantVeilCount,
    properCurtainCount,
    fadedFabricCount,
    tornRagCount,
    voidCount,
    hasHighClarityCount,
    hasHighEleganceCount,
    hasHighPurityCount,
    hasHighResilienceCount,
    hasHighWisdomCount,
    overallRadiance,
    weaverGrade,
    bestThread,
    clearest,
    mostElegant,
    purest,
    mostResilient,
    wisest,
  }

  // ─── Recommendations
  const recommendations = generateRecommendations(threads, looms, tapestry, stats)

  return { threads, looms, tapestry, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(threads, looms, tapestry, stats) */
export function generateRecommendations(
  threads: GoldenThread[],
  looms: GoldenLoom[],
  tapestry: GoldenVeilResult['tapestry'],
  stats: GoldenStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgRadiantClarity >= 90 &&
    stats.avgVeilElegance >= 90 &&
    stats.avgAurumPurity >= 90 &&
    stats.avgGoldenResilience >= 90 &&
    stats.avgLegacyWisdom >= 90
  ) {
    recs.push(
      'Your golden veil shines with divine radiance! Every thread is a masterpiece of golden craftsmanship',
    )
    return recs
  }

  if (stats.avgRadiantClarity < 60) {
    recs.push(
      'Brighten radiant clarity — code should illuminate understanding with warm, golden light',
    )
  }

  if (stats.avgVeilElegance < 60) {
    recs.push(
      'Weave with more veil elegance — code should drape gracefully like gossamer threads of gold',
    )
  }

  if (stats.avgAurumPurity < 60) {
    recs.push(
      'Refine aurum purity — code must be clean and untarnished like pure gold',
    )
  }

  if (stats.avgGoldenResilience < 60) {
    recs.push(
      'Strengthen golden resilience — code should endure like gold that never tarnishes',
    )
  }

  if (stats.avgLegacyWisdom < 60) {
    recs.push(
      'Deepen legacy wisdom — code should carry forward proven patterns like ancient gold heirlooms',
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The veil has dimmed — focus on foundational quality before the gold fades completely',
    )
  }

  const voidThreads = threads.filter((t) => t.condition === 'void')
  if (voidThreads.length > 0 && voidThreads.length <= 5) {
    recs.push(
      `Reweave these broken threads: ${voidThreads.map((t) => t.file).join(', ')}`,
    )
  } else if (voidThreads.length > 5) {
    recs.push(
      `Reweave these ${voidThreads.length} broken threads before the veil unravels`,
    )
  }

  const poorLooms = looms.filter(
    (l) => l.condition === 'void' || l.condition === 'faded-room',
  )
  if (poorLooms.length === looms.length && looms.length > 0) {
    recs.push(
      'All looms show signs of fading — consider a comprehensive reweaving strategy for the codebase',
    )
  }

  if (recs.length === 0) {
    recs.push('Your golden veil holds strong — keep weaving those radiant threads')
  }

  return recs
}
