// ─── Interfaces ──────────────────────────────────────────

export interface ShiningMeasure {
  purity: number
  metal:
    | 'pure-platinum'
    | 'noble-alloy'
    | 'proper-metal'
    | 'tarnished-silver'
    | 'rusty-iron'
    | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasHonest: boolean
  hasNoDeceptive: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasPolished: boolean
  hasNoRough: boolean
  unsafeCount: number
  untestedCount: number
}

export interface EnvisioningMeasure {
  vision: number
  horizon:
    | 'infinite-vista'
    | 'far-horizon'
    | 'proper-sight'
    | 'near-sighted'
    | 'tunnel-vision'
    | 'no-vision'
  hasHighVision: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasFutureProof: boolean
  hasNoLegacy: boolean
  hasScalable: boolean
  hasNoBottlenecked: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasAbstracted: boolean
  hasNoHardcoded: boolean
  hasVisionary: boolean
  hasNoShortSighted: boolean
  hasEvolving: boolean
  rigidCount: number
  hardcodedCount: number
}

export interface EnduringMeasure {
  resilience: number
  shield:
    | 'eternal-platinum'
    | 'lasting-shield'
    | 'proper-armor'
    | 'thin-plating'
    | 'paper-thin'
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

export interface CommandingMeasure {
  authority: number
  crest:
    | 'platinum-crest'
    | 'noble-authority'
    | 'proper-leadership'
    | 'weak-command'
    | 'no-authority'
    | 'no-crest'
  hasHighAuthority: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasClearAPI: boolean
  hasNoMysteryAPI: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
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

export interface PreparingMeasure {
  wisdom: number
  oracle:
    | 'visionary-sage'
    | 'experienced-oracle'
    | 'proper-guide'
    | 'short-term-thinker'
    | 'no-foresight'
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
  hasStrategic: boolean
  hasNoTactical: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasInsightful: boolean
  hackedCount: number
  adHocCount: number
}

export type RayCondition =
  | 'platinum-masterpiece'
  | 'noble-horizon'
  | 'proper-vista'
  | 'faded-skyline'
  | 'dark-valley'
  | 'void'

export interface PlatinumRay {
  file: string
  royalPurity: number
  horizonVision: number
  platinumResilience: number
  crestAuthority: number
  futureWisdom: number
  shining: ShiningMeasure
  envisioning: EnvisioningMeasure
  enduring: EnduringMeasure
  commanding: CommandingMeasure
  preparing: PreparingMeasure
  condition: RayCondition
  qualityScore: number
}

export type TowerType =
  | 'platinum-spire'
  | 'noble-tower'
  | 'proper-turret'
  | 'small-watchtower'
  | 'ruined-wall'
  | 'no-tower'

export type TowerCondition =
  | 'platinum-palace'
  | 'noble-fortress'
  | 'proper-watchtower'
  | 'faded-tower'
  | 'dark-valley'
  | 'void'

export interface PlatinumTower {
  directory: string
  rays: PlatinumRay[]
  avgPurity: number
  avgVision: number
  avgWisdom: number
  platinumMasterpieceCount: number
  voidCount: number
  towerType: TowerType
  condition: TowerCondition
}

export type ArchitectGrade =
  | 'platinum-sovereign'
  | 'horizon-architect'
  | 'noble-builder'
  | 'apprentice'
  | 'novice'
  | 'ground-dweller'

export interface PlatinumHorizonStats {
  totalFiles: number
  totalTowers: number
  avgRoyalPurity: number
  avgHorizonVision: number
  avgPlatinumResilience: number
  avgCrestAuthority: number
  avgFutureWisdom: number
  platinumMasterpieceCount: number
  nobleHorizonCount: number
  properVistaCount: number
  fadedSkylineCount: number
  darkValleyCount: number
  voidCount: number
  hasHighPurityCount: number
  hasHighVisionCount: number
  hasHighResilienceCount: number
  hasHighAuthorityCount: number
  hasHighWisdomCount: number
  overallBrilliance: number
  architectGrade: ArchitectGrade
  bestRay: string
  purest: string
  mostVisionary: string
  mostResilient: string
  mostAuthoritative: string
  wisest: string
}

export interface PlatinumHorizonResult {
  rays: PlatinumRay[]
  towers: PlatinumTower[]
  skyline: {
    avgPurity: number
    avgVision: number
    avgWisdom: number
    isPlatinum: boolean
    overallBrilliance: number
  }
  stats: PlatinumHorizonStats
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

/** @example measureShining('export function add(): number { }') */
export function measureShining(content: string): ShiningMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasNoDirty = (content.match(/\b(dirty|messy)\b/gi) ?? []).length === 0
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasHonest = /\b(return|throw|yield)\b/.test(content)
  const hasNoDeceptive = !/\b(cheat|fake|deceive)\b/i.test(content)
  const hasPure = !content.includes('@ts-ignore')
  const hasNoContaminated = !content.includes('@ts-expect-error')
  const hasPolished = /\b(readonly|private|protected)\b/.test(content)
  const hasNoRough = !/\b(rough|unpolished|crude)\b/i.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasClean,
    hasTested,
    hasDocumented,
    hasConsistent,
    hasHonest,
    hasPure,
    hasPolished,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60
  const metal = classifyMetal(purity)

  return {
    purity,
    metal,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasTested,
    hasNoUntested,
    hasDocumented,
    hasNoUndocumented,
    hasConsistent,
    hasNoErratic,
    hasHonest,
    hasNoDeceptive,
    hasPure,
    hasNoContaminated,
    hasPolished,
    hasNoRough,
    unsafeCount,
    untestedCount,
  }
}

/** @example measureEnvisioning('export interface Config { readonly name: string }') */
export function measureEnvisioning(content: string): EnvisioningMeasure {
  const hasExtensible = /\b(class|interface|type|enum)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|stiff)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|giant|massive)\b/i.test(content)
  const hasFutureProof = /\b(readonly|as const)\b/.test(content)
  const hasNoLegacy = !/\b(legacy|deprecated|outdated)\b/i.test(content)
  const hasScalable = /\b(async|await|Promise)\b/.test(content)
  const hasNoBottlenecked = !/\b(bottleneck|block|stall)\b/i.test(content)
  const hasAdaptive = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoStatic = !content.includes('@ts-ignore')
  const hardcodedCount = (content.match(/\b(hardcoded|hard-coded|magic.number)\b/gi) ?? []).length
  const hasNoHardcoded = hardcodedCount === 0
  const hasAbstracted = /\b(function|class|interface)\b/.test(content)
  const hasVisionary = /\b(async|await|Promise|readonly)\b/.test(content)
  const hasNoShortSighted = !/\b(shortsighted|quick.fix|band.aid)\b/i.test(content)
  const hasEvolving = /\b(export|public|protected)\b/.test(content)

  const positiveBooleans = [
    hasExtensible,
    hasModular,
    hasFutureProof,
    hasScalable,
    hasAdaptive,
    hasAbstracted,
    hasVisionary,
    hasEvolving,
  ]

  const vision = computeScore(positiveBooleans)
  const hasHighVision = vision >= 60
  const horizon = classifyHorizon(vision)

  return {
    vision,
    horizon,
    hasHighVision,
    hasExtensible,
    hasNoRigid,
    hasModular,
    hasNoMonolithic,
    hasFutureProof,
    hasNoLegacy,
    hasScalable,
    hasNoBottlenecked,
    hasAdaptive,
    hasNoStatic,
    hasAbstracted,
    hasNoHardcoded,
    hasVisionary,
    hasNoShortSighted,
    hasEvolving,
    rigidCount,
    hardcodedCount,
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
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoAbandoned = !/\b(abandoned|forgotten|neglected)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)

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
  const shield = classifyShield(resilience)

  return {
    resilience,
    shield,
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

/** @example measureCommanding('export interface API { readonly method: string }') */
export function measureCommanding(content: string): CommandingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const hiddenCount = (content.match(/@ts-ignore/g) ?? []).length
  const hasNoHidden = hiddenCount === 0
  const hasClearAPI = /\b(interface|type|class)\b/.test(content) && /\bexport\b/.test(content)
  const hasNoMysteryAPI = !/\b(mystery|magic|secret)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\bfunction\b/g) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0 || hasDocumented
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoContradictory = !/\b(contradict|conflict|clash)\b/i.test(content)
  const hasDecisive = /\b(return|throw|yield)\b/.test(content)
  const hasNoAmbiguous = !/\b(ambiguous|vague|unclear)\b/i.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUntyped = (content.match(/\bany\b/g) ?? []).length === 0
  const hasNamed = /\b(function|class|interface|type|const|let)\b/.test(content)
  const hasNoAnonymous = !/\b(anonymous|unnamed|nameless)\b/i.test(content)
  const hasAuthoritative = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasClearAPI,
    hasDocumented,
    hasConsistent,
    hasDecisive,
    hasTyped,
    hasNamed,
    hasAuthoritative,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60
  const crest = classifyCrest(authority)

  return {
    authority,
    crest,
    hasHighAuthority,
    hasExported,
    hasNoHidden,
    hasClearAPI,
    hasNoMysteryAPI,
    hasDocumented,
    hasNoUndocumented,
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

/** @example measurePreparing('export const WISDOM = true as const') */
export function measurePreparing(content: string): PreparingMeasure {
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
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasNoTactical = !/\b(quick.fix|band.aid|patch)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasPatterned,
    hasDeep,
    hasStrategic,
    hasProven,
    hasMature,
    hasInsightful,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const oracle = classifyOracle(wisdom)

  return {
    wisdom,
    oracle,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasStrategic,
    hasNoTactical,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasInsightful,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyMetal(score: number): ShiningMeasure['metal'] {
  if (score >= 90) return 'pure-platinum'
  if (score >= 75) return 'noble-alloy'
  if (score >= 60) return 'proper-metal'
  if (score >= 40) return 'tarnished-silver'
  if (score >= 20) return 'rusty-iron'
  return 'no-purity'
}

function classifyHorizon(score: number): EnvisioningMeasure['horizon'] {
  if (score >= 90) return 'infinite-vista'
  if (score >= 75) return 'far-horizon'
  if (score >= 60) return 'proper-sight'
  if (score >= 40) return 'near-sighted'
  if (score >= 20) return 'tunnel-vision'
  return 'no-vision'
}

function classifyShield(score: number): EnduringMeasure['shield'] {
  if (score >= 90) return 'eternal-platinum'
  if (score >= 75) return 'lasting-shield'
  if (score >= 60) return 'proper-armor'
  if (score >= 40) return 'thin-plating'
  if (score >= 20) return 'paper-thin'
  return 'no-resilience'
}

function classifyCrest(score: number): CommandingMeasure['crest'] {
  if (score >= 90) return 'platinum-crest'
  if (score >= 75) return 'noble-authority'
  if (score >= 60) return 'proper-leadership'
  if (score >= 40) return 'weak-command'
  if (score >= 20) return 'no-authority'
  return 'no-crest'
}

function classifyOracle(score: number): PreparingMeasure['oracle'] {
  if (score >= 90) return 'visionary-sage'
  if (score >= 75) return 'experienced-oracle'
  if (score >= 60) return 'proper-guide'
  if (score >= 40) return 'short-term-thinker'
  if (score >= 20) return 'no-foresight'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): RayCondition {
  if (score >= 90) return 'platinum-masterpiece'
  if (score >= 75) return 'noble-horizon'
  if (score >= 60) return 'proper-vista'
  if (score >= 40) return 'faded-skyline'
  if (score >= 20) return 'dark-valley'
  return 'void'
}

/** @example classifyTowerType(rays) */
export function classifyTowerType(rays: PlatinumRay[]): TowerType {
  if (rays.length === 0) return 'no-tower'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 90) return 'platinum-spire'
  if (avg >= 75) return 'noble-tower'
  if (avg >= 60) return 'proper-turret'
  if (avg >= 40) return 'small-watchtower'
  if (avg >= 20) return 'ruined-wall'
  return 'no-tower'
}

/** @example classifyTowerCondition(avgPurity) */
export function classifyTowerCondition(avgPurity: number): TowerCondition {
  if (avgPurity >= 85) return 'platinum-palace'
  if (avgPurity >= 70) return 'noble-fortress'
  if (avgPurity >= 55) return 'proper-watchtower'
  if (avgPurity >= 35) return 'faded-tower'
  if (avgPurity >= 15) return 'dark-valley'
  return 'void'
}

/** @example classifyArchitectGrade(80) */
export function classifyArchitectGrade(avgBrilliance: number): ArchitectGrade {
  if (avgBrilliance >= 80) return 'platinum-sovereign'
  if (avgBrilliance >= 65) return 'horizon-architect'
  if (avgBrilliance >= 50) return 'noble-builder'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'ground-dweller'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzePlatinumRay(content, 'app.ts') */
export function analyzePlatinumRay(content: string, filePath: string): PlatinumRay {
  const shining = measureShining(content)
  const envisioning = measureEnvisioning(content)
  const enduring = measureEnduring(content)
  const commanding = measureCommanding(content)
  const preparing = measurePreparing(content)

  const royalPurity = shining.purity
  const horizonVision = envisioning.vision
  const platinumResilience = enduring.resilience
  const crestAuthority = commanding.authority
  const futureWisdom = preparing.wisdom

  const qualityScore = Math.round(
    royalPurity * 0.2 +
    horizonVision * 0.2 +
    platinumResilience * 0.2 +
    crestAuthority * 0.2 +
    futureWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    royalPurity,
    horizonVision,
    platinumResilience,
    crestAuthority,
    futureWisdom,
    shining,
    envisioning,
    enduring,
    commanding,
    preparing,
    condition,
    qualityScore,
  }
}

/** @example analyzePlatinumTower(rays, 'src') */
export function analyzePlatinumTower(rays: PlatinumRay[], dirPath: string): PlatinumTower {
  if (rays.length === 0) {
    return {
      directory: dirPath,
      rays: [],
      avgPurity: 0,
      avgVision: 0,
      avgWisdom: 0,
      platinumMasterpieceCount: 0,
      voidCount: 0,
      towerType: 'no-tower',
      condition: 'void',
    }
  }

  const avgPurity = Math.round(
    rays.reduce((s, r) => s + r.royalPurity, 0) / rays.length,
  )
  const avgVision = Math.round(
    rays.reduce((s, r) => s + r.horizonVision, 0) / rays.length,
  )
  const avgWisdom = Math.round(
    rays.reduce((s, r) => s + r.futureWisdom, 0) / rays.length,
  )

  const platinumMasterpieceCount = rays.filter(
    (r) => r.condition === 'platinum-masterpiece',
  ).length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const towerType = classifyTowerType(rays)
  const avgQuality = Math.round(
    rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length,
  )
  const condition = classifyTowerCondition(avgQuality)

  return {
    directory: dirPath,
    rays,
    avgPurity,
    avgVision,
    avgWisdom,
    platinumMasterpieceCount,
    voidCount,
    towerType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildPlatinumHorizonResult(['a.ts'], [content]) */
export async function buildPlatinumHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PlatinumHorizonResult> {
  const rays: PlatinumRay[] = files.map((file, i) =>
    analyzePlatinumRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PlatinumRay[]>()
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

  const towers: PlatinumTower[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzePlatinumTower(dirRays, dir),
  )

  const avgPurity =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.royalPurity, 0) / rays.length)
      : 0
  const avgVision =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.horizonVision, 0) / rays.length)
      : 0
  const avgWisdom =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.futureWisdom, 0) / rays.length)
      : 0

  const overallBrilliance =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
      : 0
  const isPlatinum = overallBrilliance >= 60

  const skyline = { avgPurity, avgVision, avgWisdom, isPlatinum, overallBrilliance }

  const avgRoyalPurity = avgPurity
  const avgHorizonVision = avgVision
  const avgPlatinumResilience =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.platinumResilience, 0) / rays.length)
      : 0
  const avgCrestAuthority =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.crestAuthority, 0) / rays.length)
      : 0
  const avgFutureWisdom = avgWisdom

  const platinumMasterpieceCount = rays.filter(
    (r) => r.condition === 'platinum-masterpiece',
  ).length
  const nobleHorizonCount = rays.filter((r) => r.condition === 'noble-horizon').length
  const properVistaCount = rays.filter((r) => r.condition === 'proper-vista').length
  const fadedSkylineCount = rays.filter((r) => r.condition === 'faded-skyline').length
  const darkValleyCount = rays.filter((r) => r.condition === 'dark-valley').length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighPurityCount = rays.filter((r) => r.shining.hasHighPurity).length
  const hasHighVisionCount = rays.filter((r) => r.envisioning.hasHighVision).length
  const hasHighResilienceCount = rays.filter((r) => r.enduring.hasHighResilience).length
  const hasHighAuthorityCount = rays.filter((r) => r.commanding.hasHighAuthority).length
  const hasHighWisdomCount = rays.filter((r) => r.preparing.hasHighWisdom).length

  const architectGrade = classifyArchitectGrade(overallBrilliance)

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file
    : ''
  const purest = rays.length > 0
    ? rays.reduce((best, r) => (r.royalPurity > best.royalPurity ? r : best)).file
    : ''
  const mostVisionary = rays.length > 0
    ? rays.reduce((best, r) => (r.horizonVision > best.horizonVision ? r : best)).file
    : ''
  const mostResilient = rays.length > 0
    ? rays.reduce((best, r) => (r.platinumResilience > best.platinumResilience ? r : best)).file
    : ''
  const mostAuthoritative = rays.length > 0
    ? rays.reduce((best, r) => (r.crestAuthority > best.crestAuthority ? r : best)).file
    : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => (r.futureWisdom > best.futureWisdom ? r : best)).file
    : ''

  const stats: PlatinumHorizonStats = {
    totalFiles: files.length,
    totalTowers: towers.length,
    avgRoyalPurity,
    avgHorizonVision,
    avgPlatinumResilience,
    avgCrestAuthority,
    avgFutureWisdom,
    platinumMasterpieceCount,
    nobleHorizonCount,
    properVistaCount,
    fadedSkylineCount,
    darkValleyCount,
    voidCount,
    hasHighPurityCount,
    hasHighVisionCount,
    hasHighResilienceCount,
    hasHighAuthorityCount,
    hasHighWisdomCount,
    overallBrilliance,
    architectGrade,
    bestRay,
    purest,
    mostVisionary,
    mostResilient,
    mostAuthoritative,
    wisest,
  }

  const recommendations = generateRecommendations(rays, towers, skyline, stats)

  return { rays, towers, skyline, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, towers, skyline, stats) */
export function generateRecommendations(
  rays: PlatinumRay[],
  towers: PlatinumTower[],
  skyline: PlatinumHorizonResult['skyline'],
  stats: PlatinumHorizonStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgRoyalPurity >= 90 &&
    stats.avgHorizonVision >= 90 &&
    stats.avgPlatinumResilience >= 90 &&
    stats.avgCrestAuthority >= 90 &&
    stats.avgFutureWisdom >= 90
  ) {
    recs.push(
      'Your platinum horizon shines with perfect brilliance! Every ray is a masterpiece of royal purity and infinite vision',
    )
    return recs
  }

  if (stats.avgRoyalPurity < 60) {
    recs.push(
      'Polish royal purity — code should gleam with the untarnished nobility of pure platinum',
    )
  }

  if (stats.avgHorizonVision < 60) {
    recs.push(
      'Expand horizon vision — code must look beyond the visible toward infinite possibility',
    )
  }

  if (stats.avgPlatinumResilience < 60) {
    recs.push(
      'Forge platinum resilience — code must endure like platinum, the eternal metal',
    )
  }

  if (stats.avgCrestAuthority < 60) {
    recs.push(
      'Strengthen crest authority — code should command with the authority of a platinum crest',
    )
  }

  if (stats.avgFutureWisdom < 60) {
    recs.push(
      'Cultivate future wisdom — code should carry the foresight of a visionary oracle',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The platinum fades into darkness — restore the brilliance before the horizon is lost',
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(
      `Restore these darkened rays: ${voidRays.map((r) => r.file).join(', ')}`,
    )
  } else if (voidRays.length > 5) {
    recs.push(
      `Restore these ${voidRays.length} darkened rays before the tower collapses`,
    )
  }

  const poorTowers = towers.filter(
    (t) => t.condition === 'void' || t.condition === 'faded-tower',
  )
  if (poorTowers.length === towers.length && towers.length > 0) {
    recs.push(
      'All towers show signs of decay — consider a complete restoration of the platinum horizon',
    )
  }

  if (recs.length === 0) {
    recs.push('Your platinum horizon gleams with noble brilliance — keep building with visionary authority')
  }

  return recs
}
