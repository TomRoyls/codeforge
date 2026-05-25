// ─── Interfaces ──────────────────────────────────────────

export interface ClarifyingMeasure {
  clarity: number
  glass:
    | 'flawless-mirror'
    | 'polished-onyx'
    | 'proper-glass'
    | 'cloudy-stone'
    | 'rough-rock'
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
  hasDirect: boolean
  hasNoCircuits: boolean
  hasLuminous: boolean
  hasNoOpaque: boolean
  hasRevealing: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EnduringMeasure {
  resilience: number
  shadow:
    | 'shadow-master'
    | 'dark-adapted'
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
  hasNoFragile: boolean
  hasFearless: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface ReflectingMeasure {
  depth: number
  mirror:
    | 'true-reflection'
    | 'honest-glass'
    | 'proper-mirror'
    | 'distorted'
    | 'broken-glass'
    | 'no-reflection'
  hasHighDepth: boolean
  hasSelfAware: boolean
  hasNoBlind: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasHonest: boolean
  hasNoDeceptive: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasTruthful: boolean
  blindCount: number
  contradictoryCount: number
}

export interface CuttingMeasure {
  precision: number
  blade:
    | 'obsidian-scalpel'
    | 'razor-edge'
    | 'proper-blade'
    | 'dull-knife'
    | 'blunt-rock'
    | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasTypeSafe: boolean
  hasNoCasting: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasPrecise: boolean
  wrongCount: number
  buggyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  void:
    | 'cosmic-void'
    | 'deep-emptiness'
    | 'proper-darkness'
    | 'surface-shadow'
    | 'no-shadow'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasVisionary: boolean
  hackedCount: number
  adHocCount: number
}

export type PillarCondition =
  | 'onyx-masterpiece'
  | 'dark-sanctuary'
  | 'proper-temple'
  | 'crumbling-stone'
  | 'shattered-ruin'
  | 'void'

export interface OnyxPillar {
  file: string
  obsidianClarity: number
  darkResilience: number
  mirrorDepth: number
  midnightPrecision: number
  voidWisdom: number
  clarifying: ClarifyingMeasure
  enduring: EnduringMeasure
  reflecting: ReflectingMeasure
  cutting: CuttingMeasure
  knowing: KnowingMeasure
  condition: PillarCondition
  qualityScore: number
}

export type NaveType =
  | 'grand-cathedral'
  | 'dark-sanctuary'
  | 'proper-chapel'
  | 'small-shrine'
  | 'ruined-wall'
  | 'no-nave'

export type NaveCondition =
  | 'obsidian-basilica'
  | 'dark-temple'
  | 'proper-chapel'
  | 'crumbling-ruin'
  | 'shattered-vestibule'
  | 'void'

export interface OnyxNave {
  directory: string
  pillars: OnyxPillar[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  onyxMasterpieceCount: number
  voidCount: number
  naveType: NaveType
  condition: NaveCondition
}

export type ArchitectGrade =
  | 'dark-architect'
  | 'shadow-builder'
  | 'stone-mason'
  | 'apprentice'
  | 'novice'
  | 'blind-walker'

export interface OnyxCathedralStats {
  totalFiles: number
  totalNaves: number
  avgObsidianClarity: number
  avgDarkResilience: number
  avgMirrorDepth: number
  avgMidnightPrecision: number
  avgVoidWisdom: number
  onyxMasterpieceCount: number
  darkSanctuaryCount: number
  properTempleCount: number
  crumblingStoneCount: number
  shatteredRuinCount: number
  voidCount: number
  hasHighClarityCount: number
  hasHighResilienceCount: number
  hasHighDepthCount: number
  hasHighPrecisionCount: number
  hasHighWisdomCount: number
  overallDepth: number
  architectGrade: ArchitectGrade
  bestPillar: string
  clearest: string
  mostResilient: string
  deepest: string
  sharpest: string
  wisest: string
}

export interface OnyxCathedralResult {
  pillars: OnyxPillar[]
  naves: OnyxNave[]
  darkness: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isOnyx: boolean
    overallDepth: number
  }
  stats: OnyxCathedralStats
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

/** @example measureClarifying('export function add(): number { }') */
export function measureClarifying(content: string): ClarifyingMeasure {
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
  const hasDirect = /\b(import|export|from)\b/.test(content)
  const hasNoCircuits = !/\b(circuit|spaghetti|tangle)\b/i.test(content)
  const hasLuminous = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoOpaque = !/\b(opaque|impenetrable|dense)\b/i.test(content)
  const hasRevealing = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasDirect,
    hasLuminous,
    hasRevealing,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const glass = classifyGlass(clarity)

  return {
    clarity,
    glass,
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
    hasDirect,
    hasNoCircuits,
    hasLuminous,
    hasNoOpaque,
    hasRevealing,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureEnduring('try { foo() } catch { bar() }') */
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
  const hasNoFragile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasFearless = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasTested,
    hasDefensive,
    hasTypeSafe,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasFearless,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const shadow = classifyShadow(resilience)

  return {
    resilience,
    shadow,
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
    hasNoFragile,
    hasFearless,
    bareCrashCount,
    untestedCount,
  }
}

/** @example measureReflecting('export interface Config { readonly name: string }') */
export function measureReflecting(content: string): ReflectingMeasure {
  const hasSelfAware = /\b(readonly|private|protected)\b/.test(content)
  const blindCount = (content.match(/\b(blind|ignorant|unaware)\b/gi) ?? []).length
  const hasNoBlind = blindCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasHonest = /\b(return|throw|yield)\b/.test(content)
  const hasNoDeceptive = !/\b(cheat|fake|deceive)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradict|conflict|clash)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasPrincipled = /\b(readonly|as const)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPure = !content.includes('@ts-ignore')
  const hasNoContaminated = !content.includes('@ts-expect-error')
  const hasClean = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasNoDirty = (content.match(/\b(dirty|messy)\b/gi) ?? []).length === 0
  const hasTruthful = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasSelfAware,
    hasDocumented,
    hasHonest,
    hasConsistent,
    hasPrincipled,
    hasPure,
    hasClean,
    hasTruthful,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60
  const mirror = classifyMirror(depth)

  return {
    depth,
    mirror,
    hasHighDepth,
    hasSelfAware,
    hasNoBlind,
    hasDocumented,
    hasNoUndocumented,
    hasHonest,
    hasNoDeceptive,
    hasConsistent,
    hasNoContradictory,
    hasPrincipled,
    hasNoAdHoc,
    hasPure,
    hasNoContaminated,
    hasClean,
    hasNoDirty,
    hasTruthful,
    blindCount,
    contradictoryCount,
  }
}

/** @example measureCutting('function add(a: number, b: number): number { return a + b }') */
export function measureCutting(content: string): CuttingMeasure {
  const hasAccurate = /\b(return|yield)\b/.test(content)
  const wrongCount = (content.match(/\b(wrong|incorrect|mistake)\b/gi) ?? []).length
  const hasNoWrong = wrongCount === 0
  const hasExact = /\b(type|interface|readonly)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|guess)\b/i.test(content)
  const hasCorrect = /\b(readonly|as const)\b/.test(content)
  const buggyCount = (content.match(/\b(bug|fixme)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoCasting = (content.match(/\bany\b/g) ?? []).length === 0
  const hasValidated = /\b(if|else|switch)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|hope)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasDeterministic = /\b(readonly|const|=>)\b/.test(content)
  const hasNoRandom = !/\b(random|rand|shuffle)\b/i.test(content)
  const hasPrecise = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasAccurate,
    hasExact,
    hasCorrect,
    hasTypeSafe,
    hasValidated,
    hasConsistent,
    hasDeterministic,
    hasPrecise,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const blade = classifyBlade(precision)

  return {
    precision,
    blade,
    hasHighPrecision,
    hasAccurate,
    hasNoWrong,
    hasExact,
    hasNoApproximate,
    hasCorrect,
    hasNoBuggy,
    hasTypeSafe,
    hasNoCasting,
    hasValidated,
    hasNoAssumed,
    hasConsistent,
    hasNoErratic,
    hasDeterministic,
    hasNoRandom,
    hasPrecise,
    wrongCount,
    buggyCount,
  }
}

/** @example measureKnowing('export const WISDOM = true as const') */
export function measureKnowing(content: string): KnowingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasVisionary = /\b(async|await|Promise|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasPatterned,
    hasDeep,
    hasProven,
    hasMature,
    hasInsightful,
    hasVisionary,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const void_ = classifyVoid(wisdom)

  return {
    wisdom,
    void: void_,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasInsightful,
    hasNoObvious,
    hasVisionary,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyGlass(score: number): ClarifyingMeasure['glass'] {
  if (score >= 90) return 'flawless-mirror'
  if (score >= 75) return 'polished-onyx'
  if (score >= 60) return 'proper-glass'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'rough-rock'
  return 'no-clarity'
}

function classifyShadow(score: number): EnduringMeasure['shadow'] {
  if (score >= 90) return 'shadow-master'
  if (score >= 75) return 'dark-adapted'
  if (score >= 60) return 'proper-night'
  if (score >= 40) return 'light-dependent'
  if (score >= 20) return 'blind-in-dark'
  return 'no-resilience'
}

function classifyMirror(score: number): ReflectingMeasure['mirror'] {
  if (score >= 90) return 'true-reflection'
  if (score >= 75) return 'honest-glass'
  if (score >= 60) return 'proper-mirror'
  if (score >= 40) return 'distorted'
  if (score >= 20) return 'broken-glass'
  return 'no-reflection'
}

function classifyBlade(score: number): CuttingMeasure['blade'] {
  if (score >= 90) return 'obsidian-scalpel'
  if (score >= 75) return 'razor-edge'
  if (score >= 60) return 'proper-blade'
  if (score >= 40) return 'dull-knife'
  if (score >= 20) return 'blunt-rock'
  return 'no-precision'
}

function classifyVoid(score: number): KnowingMeasure['void'] {
  if (score >= 90) return 'cosmic-void'
  if (score >= 75) return 'deep-emptiness'
  if (score >= 60) return 'proper-darkness'
  if (score >= 40) return 'surface-shadow'
  if (score >= 20) return 'no-shadow'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): PillarCondition {
  if (score >= 90) return 'onyx-masterpiece'
  if (score >= 75) return 'dark-sanctuary'
  if (score >= 60) return 'proper-temple'
  if (score >= 40) return 'crumbling-stone'
  if (score >= 20) return 'shattered-ruin'
  return 'void'
}

/** @example classifyNaveType(pillars) */
export function classifyNaveType(pillars: OnyxPillar[]): NaveType {
  if (pillars.length === 0) return 'no-nave'
  const avg = pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length
  if (avg >= 90) return 'grand-cathedral'
  if (avg >= 75) return 'dark-sanctuary'
  if (avg >= 60) return 'proper-chapel'
  if (avg >= 40) return 'small-shrine'
  if (avg >= 20) return 'ruined-wall'
  return 'no-nave'
}

/** @example classifyNaveCondition(avgClarity) */
export function classifyNaveCondition(avgClarity: number): NaveCondition {
  if (avgClarity >= 85) return 'obsidian-basilica'
  if (avgClarity >= 70) return 'dark-temple'
  if (avgClarity >= 55) return 'proper-chapel'
  if (avgClarity >= 35) return 'crumbling-ruin'
  if (avgClarity >= 15) return 'shattered-vestibule'
  return 'void'
}

/** @example classifyArchitectGrade(80) */
export function classifyArchitectGrade(avgDepth: number): ArchitectGrade {
  if (avgDepth >= 80) return 'dark-architect'
  if (avgDepth >= 65) return 'shadow-builder'
  if (avgDepth >= 50) return 'stone-mason'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'blind-walker'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeOnyxPillar(content, 'app.ts') */
export function analyzeOnyxPillar(content: string, filePath: string): OnyxPillar {
  const clarifying = measureClarifying(content)
  const enduring = measureEnduring(content)
  const reflecting = measureReflecting(content)
  const cutting = measureCutting(content)
  const knowing = measureKnowing(content)

  const obsidianClarity = clarifying.clarity
  const darkResilience = enduring.resilience
  const mirrorDepth = reflecting.depth
  const midnightPrecision = cutting.precision
  const voidWisdom = knowing.wisdom

  const qualityScore = Math.round(
    obsidianClarity * 0.2 +
    darkResilience * 0.2 +
    mirrorDepth * 0.2 +
    midnightPrecision * 0.2 +
    voidWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    obsidianClarity,
    darkResilience,
    mirrorDepth,
    midnightPrecision,
    voidWisdom,
    clarifying,
    enduring,
    reflecting,
    cutting,
    knowing,
    condition,
    qualityScore,
  }
}

/** @example analyzeOnyxNave(pillars, 'src') */
export function analyzeOnyxNave(pillars: OnyxPillar[], dirPath: string): OnyxNave {
  if (pillars.length === 0) {
    return {
      directory: dirPath,
      pillars: [],
      avgClarity: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      onyxMasterpieceCount: 0,
      voidCount: 0,
      naveType: 'no-nave',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    pillars.reduce((s, p) => s + p.obsidianClarity, 0) / pillars.length,
  )
  const avgPrecision = Math.round(
    pillars.reduce((s, p) => s + p.midnightPrecision, 0) / pillars.length,
  )
  const avgWisdom = Math.round(
    pillars.reduce((s, p) => s + p.voidWisdom, 0) / pillars.length,
  )

  const onyxMasterpieceCount = pillars.filter(
    (p) => p.condition === 'onyx-masterpiece',
  ).length
  const voidCount = pillars.filter((p) => p.condition === 'void').length

  const naveType = classifyNaveType(pillars)
  const avgQuality = Math.round(
    pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length,
  )
  const condition = classifyNaveCondition(avgQuality)

  return {
    directory: dirPath,
    pillars,
    avgClarity,
    avgPrecision,
    avgWisdom,
    onyxMasterpieceCount,
    voidCount,
    naveType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOnyxCathedralResult(['a.ts'], [content]) */
export async function buildOnyxCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OnyxCathedralResult> {
  const pillars: OnyxPillar[] = files.map((file, i) =>
    analyzeOnyxPillar(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OnyxPillar[]>()
  for (const pillar of pillars) {
    const dir = pillar.file.includes('/')
      ? pillar.file.substring(0, pillar.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(pillar)
    } else {
      dirMap.set(dir, [pillar])
    }
  }

  const naves: OnyxNave[] = Array.from(dirMap.entries()).map(([dir, dirPillars]) =>
    analyzeOnyxNave(dirPillars, dir),
  )

  const avgClarity =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.obsidianClarity, 0) / pillars.length)
      : 0
  const avgPrecision =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.midnightPrecision, 0) / pillars.length)
      : 0
  const avgWisdom =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.voidWisdom, 0) / pillars.length)
      : 0

  const overallDepth =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)
      : 0
  const isOnyx = overallDepth >= 60

  const darkness = { avgClarity, avgPrecision, avgWisdom, isOnyx, overallDepth }

  const avgObsidianClarity = avgClarity
  const avgDarkResilience =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.darkResilience, 0) / pillars.length)
      : 0
  const avgMirrorDepth =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.mirrorDepth, 0) / pillars.length)
      : 0
  const avgMidnightPrecision = avgPrecision
  const avgVoidWisdom = avgWisdom

  const onyxMasterpieceCount = pillars.filter(
    (p) => p.condition === 'onyx-masterpiece',
  ).length
  const darkSanctuaryCount = pillars.filter((p) => p.condition === 'dark-sanctuary').length
  const properTempleCount = pillars.filter((p) => p.condition === 'proper-temple').length
  const crumblingStoneCount = pillars.filter((p) => p.condition === 'crumbling-stone').length
  const shatteredRuinCount = pillars.filter((p) => p.condition === 'shattered-ruin').length
  const voidCount = pillars.filter((p) => p.condition === 'void').length

  const hasHighClarityCount = pillars.filter((p) => p.clarifying.hasHighClarity).length
  const hasHighResilienceCount = pillars.filter((p) => p.enduring.hasHighResilience).length
  const hasHighDepthCount = pillars.filter((p) => p.reflecting.hasHighDepth).length
  const hasHighPrecisionCount = pillars.filter((p) => p.cutting.hasHighPrecision).length
  const hasHighWisdomCount = pillars.filter((p) => p.knowing.hasHighWisdom).length

  const architectGrade = classifyArchitectGrade(overallDepth)

  const bestPillar = pillars.length > 0
    ? pillars.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const clearest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.obsidianClarity > best.obsidianClarity ? p : best)).file
    : ''
  const mostResilient = pillars.length > 0
    ? pillars.reduce((best, p) => (p.darkResilience > best.darkResilience ? p : best)).file
    : ''
  const deepest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.mirrorDepth > best.mirrorDepth ? p : best)).file
    : ''
  const sharpest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.midnightPrecision > best.midnightPrecision ? p : best)).file
    : ''
  const wisest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.voidWisdom > best.voidWisdom ? p : best)).file
    : ''

  const stats: OnyxCathedralStats = {
    totalFiles: files.length,
    totalNaves: naves.length,
    avgObsidianClarity,
    avgDarkResilience,
    avgMirrorDepth,
    avgMidnightPrecision,
    avgVoidWisdom,
    onyxMasterpieceCount,
    darkSanctuaryCount,
    properTempleCount,
    crumblingStoneCount,
    shatteredRuinCount,
    voidCount,
    hasHighClarityCount,
    hasHighResilienceCount,
    hasHighDepthCount,
    hasHighPrecisionCount,
    hasHighWisdomCount,
    overallDepth,
    architectGrade,
    bestPillar,
    clearest,
    mostResilient,
    deepest,
    sharpest,
    wisest,
  }

  const recommendations = generateRecommendations(pillars, naves, darkness, stats)

  return { pillars, naves, darkness, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(pillars, naves, darkness, stats) */
export function generateRecommendations(
  pillars: OnyxPillar[],
  naves: OnyxNave[],
  darkness: OnyxCathedralResult['darkness'],
  stats: OnyxCathedralStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgObsidianClarity >= 90 &&
    stats.avgDarkResilience >= 90 &&
    stats.avgMirrorDepth >= 90 &&
    stats.avgMidnightPrecision >= 90 &&
    stats.avgVoidWisdom >= 90
  ) {
    recs.push(
      'Your onyx cathedral stands in perfect dark brilliance! Every pillar is a masterpiece of obsidian clarity',
    )
    return recs
  }

  if (stats.avgObsidianClarity < 60) {
    recs.push(
      'Polish obsidian clarity — code should reveal truth through dark complexity like flawless volcanic glass',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Strengthen dark resilience — code must handle the unknown with the grace of shadow',
    )
  }

  if (stats.avgMirrorDepth < 60) {
    recs.push(
      'Deepen mirror reflection — code should show its own truth without distortion',
    )
  }

  if (stats.avgMidnightPrecision < 60) {
    recs.push(
      'Sharpen midnight precision — code must cut with the exactness of an obsidian blade',
    )
  }

  if (stats.avgVoidWisdom < 60) {
    recs.push(
      'Embrace void wisdom — code should find knowledge in the depths of the unknown',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The cathedral crumbles in darkness — rebuild the foundations before the stones fall',
    )
  }

  const voidPillars = pillars.filter((p) => p.condition === 'void')
  if (voidPillars.length > 0 && voidPillars.length <= 5) {
    recs.push(
      `Restore these shattered pillars: ${voidPillars.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPillars.length > 5) {
    recs.push(
      `Restore these ${voidPillars.length} shattered pillars before the nave collapses`,
    )
  }

  const poorNaves = naves.filter(
    (n) => n.condition === 'void' || n.condition === 'crumbling-ruin',
  )
  if (poorNaves.length === naves.length && naves.length > 0) {
    recs.push(
      'All naves show signs of crumbling — consider a complete restoration of the cathedral',
    )
  }

  if (recs.length === 0) {
    recs.push('Your onyx cathedral stands strong in the darkness — keep building with obsidian precision')
  }

  return recs
}
