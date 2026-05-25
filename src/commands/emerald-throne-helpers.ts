// ─── Interfaces ──────────────────────────────────────────

export interface RulingMeasure {
  authority: number
  throne:
    | 'supreme-authority'
    | 'rightful-ruler'
    | 'proper-regent'
    | 'weak-monarch'
    | 'pretender'
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
  hasCommanding: boolean
  hiddenCount: number
  undocumentedCount: number
}

export interface JudgingMeasure {
  wisdom: number
  court:
    | 'supreme-court'
    | 'wise-council'
    | 'proper-advisors'
    | 'fools-gallery'
    | 'empty-throne'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hackedCount: number
  adHocCount: number
}

export interface CrowningMeasure {
  precision: number
  crown:
    | 'perfect-fit'
    | 'precise-setting'
    | 'proper-crown'
    | 'loose-fit'
    | 'misshapen-ring'
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
  hasValidated: boolean
  hasNoAssumed: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasDefined: boolean
  hasNoBlurry: boolean
  hasSharp: boolean
  unsafeCount: number
  buggyCount: number
}

export interface WieldingMeasure {
  resilience: number
  scepter:
    | 'unwavering-power'
    | 'steady-scepter'
    | 'proper-staff'
    | 'trembling-rod'
    | 'broken-stick'
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
  hasPersistent: boolean
  hasNoQuitting: boolean
  hasEnduring: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface ReigningMeasure {
  endurance: number
  dynasty:
    | 'eternal-dynasty'
    | 'lasting-reign'
    | 'proper-rule'
    | 'brief-tenure'
    | 'usurped-throne'
    | 'no-endurance'
  hasHighEndurance: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasTimeless: boolean
  hasNoFaddish: boolean
  hasEnduring: boolean
  hasNoTemporary: boolean
  hasLegacy: boolean
  hasNoDisposable: boolean
  hasPerennial: boolean
  volatileCount: number
  experimentalCount: number
}

export type SeatCondition =
  | 'emerald-masterpiece'
  | 'royal-throne'
  | 'proper-seat'
  | 'wooden-chair'
  | 'broken-stool'
  | 'void'

export interface EmeraldSeat {
  file: string
  gemAuthority: number
  throneWisdom: number
  crownPrecision: number
  scepterResilience: number
  dynastyEndurance: number
  ruling: RulingMeasure
  judging: JudgingMeasure
  crowning: CrowningMeasure
  wielding: WieldingMeasure
  reigning: ReigningMeasure
  condition: SeatCondition
  qualityScore: number
}

export type CourtType =
  | 'grand-palace'
  | 'royal-court'
  | 'proper-hall'
  | 'small-chamber'
  | 'dark-dungeon'
  | 'no-court'

export type CourtCondition =
  | 'emerald-palace'
  | 'royal-court'
  | 'proper-hall'
  | 'modest-room'
  | 'ruined-keep'
  | 'void'

export interface EmeraldCourt {
  directory: string
  seats: EmeraldSeat[]
  avgAuthority: number
  avgPrecision: number
  avgWisdom: number
  emeraldMasterpieceCount: number
  voidCount: number
  courtType: CourtType
  condition: CourtCondition
}

export type MonarchGrade =
  | 'emperor'
  | 'king'
  | 'duke'
  | 'baron'
  | 'knight'
  | 'peasant'

export interface EmeraldThroneStats {
  totalFiles: number
  totalCourts: number
  avgGemAuthority: number
  avgThroneWisdom: number
  avgCrownPrecision: number
  avgScepterResilience: number
  avgDynastyEndurance: number
  emeraldMasterpieceCount: number
  royalThroneCount: number
  properSeatCount: number
  woodenChairCount: number
  brokenStoolCount: number
  voidCount: number
  hasHighAuthorityCount: number
  hasHighWisdomCount: number
  hasHighPrecisionCount: number
  hasHighResilienceCount: number
  hasHighEnduranceCount: number
  overallSovereignty: number
  monarchGrade: MonarchGrade
  bestSeat: string
  mostAuthoritative: string
  wisest: string
  mostPrecise: string
  mostResilient: string
  mostEnduring: string
}

export interface EmeraldThroneResult {
  seats: EmeraldSeat[]
  courts: EmeraldCourt[]
  kingdom: {
    avgAuthority: number
    avgPrecision: number
    avgWisdom: number
    isEmerald: boolean
    overallSovereignty: number
  }
  stats: EmeraldThroneStats
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

/** @example measureRuling('export function add(): number { }') */
export function measureRuling(content: string): RulingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const hiddenCount = (content.match(/@ts-ignore|@ts-expect-error/g) ?? []).length
  const hasNoHidden = hiddenCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
    ? 0
    : (content.match(/\bfunction\b/g) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasClearAPI = /\b(readonly|private|protected)\b/.test(content)
  const hasNoMysteryAPI = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoContradictory = !/\b(contradictory|conflicting|inconsistent)\b/i.test(content)
  const hasDecisive = /\b(return|yield|emit)\b/.test(content)
  const hasNoAmbiguous = !/\b(ambiguous|vague|unclear)\b/i.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUntyped = (content.match(/\bany\b/g) ?? []).length === 0
  const hasNamed = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoAnonymous = !/\b(anonymous|unnamed|implicit)\b/i.test(content)
  const hasCommanding = /\b(function|class|interface)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasDocumented,
    hasClearAPI,
    hasConsistent,
    hasDecisive,
    hasTyped,
    hasNamed,
    hasCommanding,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60
  const throne = classifyThrone(authority)

  return {
    authority,
    throne,
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
    hasCommanding,
    hiddenCount,
    undocumentedCount,
  }
}

/** @example measureJudging('export const WISDOM = true as const') */
export function measureJudging(content: string): JudgingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasDeep,
    hasMature,
    hasPatterned,
    hasInsightful,
    hasStrategic,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const court = classifyCourt(wisdom)

  return {
    wisdom,
    court,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasNoNaive,
    hasPatterned,
    hasNoReinvented,
    hasInsightful,
    hasNoObvious,
    hasStrategic,
    hackedCount,
    adHocCount,
  }
}

/** @example measureCrowning('export interface Config { readonly name: string }') */
export function measureCrowning(content: string): CrowningMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /\b(function|class|interface)\b/.test(content)
  const hasNoWrong = !/\b(wrong|incorrect|error.prone)\b/i.test(content)
  const hasExact = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|close.enough)\b/i.test(content)
  const hasCorrect = /\b(return|yield|emit)\b/.test(content)
  const buggyCount = (content.match(/\b(buggy|broken|defective)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasValidated = /\b(try|catch|if)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|hope)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasDefined = /\b(readonly|private|protected)\b/.test(content)
  const hasNoBlurry = !/\b(blurry|vague|fuzzy)\b/i.test(content)
  const hasSharp = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasAccurate,
    hasExact,
    hasCorrect,
    hasValidated,
    hasConsistent,
    hasDefined,
    hasSharp,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const crown = classifyCrown(precision)

  return {
    precision,
    crown,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoWrong,
    hasExact,
    hasNoApproximate,
    hasCorrect,
    hasNoBuggy,
    hasValidated,
    hasNoAssumed,
    hasConsistent,
    hasNoErratic,
    hasDefined,
    hasNoBlurry,
    hasSharp,
    unsafeCount,
    buggyCount,
  }
}

/** @example measureWielding('try { foo() } catch { bar() }') */
export function measureWielding(content: string): WieldingMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoFragile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasPersistent = /\b(const|readonly)\b/.test(content)
  const hasNoQuitting = !/\b(quit|give.up|surrender)\b/i.test(content)
  const hasEnduring = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasTested,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasPersistent,
    hasEnduring,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const scepter = classifyScepter(resilience)

  return {
    resilience,
    scepter,
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
    hasPersistent,
    hasNoQuitting,
    hasEnduring,
    bareCrashCount,
    untestedCount,
  }
}

/** @example measureReigning('export const LEGACY = true as const') */
export function measureReigning(content: string): ReigningMeasure {
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoAbandoned = !/\b(abandoned|forgotten|neglected)\b/i.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|changing)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasEstablished = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNovel = !/\b(novel|experimental|untested)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const experimentalCount = (content.match(/\b(experimental|beta|alpha)\b/gi) ?? []).length
  const hasNoExperimental = experimentalCount === 0
  const hasTimeless = /\b(import|export|from)\b/.test(content)
  const hasNoFaddish = !/\b(faddish|trendy|hyped)\b/i.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasNoTemporary = !/\b(temporary|ephemeral|transient)\b/i.test(content)
  const hasLegacy = /\b(function|class|interface)\b/.test(content)
  const hasNoDisposable = !/\b(disposable|throwaway|single.use)\b/i.test(content)
  const hasPerennial = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasMaintained,
    hasStable,
    hasEstablished,
    hasProven,
    hasTimeless,
    hasEnduring,
    hasLegacy,
    hasPerennial,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60
  const dynasty = classifyDynasty(endurance)

  return {
    endurance,
    dynasty,
    hasHighEndurance,
    hasMaintained,
    hasNoAbandoned,
    hasStable,
    hasNoVolatile,
    hasEstablished,
    hasNoNovel,
    hasProven,
    hasNoExperimental,
    hasTimeless,
    hasNoFaddish,
    hasEnduring,
    hasNoTemporary,
    hasLegacy,
    hasNoDisposable,
    hasPerennial,
    volatileCount,
    experimentalCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyThrone(score: number): RulingMeasure['throne'] {
  if (score >= 90) return 'supreme-authority'
  if (score >= 75) return 'rightful-ruler'
  if (score >= 60) return 'proper-regent'
  if (score >= 40) return 'weak-monarch'
  if (score >= 20) return 'pretender'
  return 'no-authority'
}

function classifyCourt(score: number): JudgingMeasure['court'] {
  if (score >= 90) return 'supreme-court'
  if (score >= 75) return 'wise-council'
  if (score >= 60) return 'proper-advisors'
  if (score >= 40) return 'fools-gallery'
  if (score >= 20) return 'empty-throne'
  return 'no-wisdom'
}

function classifyCrown(score: number): CrowningMeasure['crown'] {
  if (score >= 90) return 'perfect-fit'
  if (score >= 75) return 'precise-setting'
  if (score >= 60) return 'proper-crown'
  if (score >= 40) return 'loose-fit'
  if (score >= 20) return 'misshapen-ring'
  return 'no-precision'
}

function classifyScepter(score: number): WieldingMeasure['scepter'] {
  if (score >= 90) return 'unwavering-power'
  if (score >= 75) return 'steady-scepter'
  if (score >= 60) return 'proper-staff'
  if (score >= 40) return 'trembling-rod'
  if (score >= 20) return 'broken-stick'
  return 'no-resilience'
}

function classifyDynasty(score: number): ReigningMeasure['dynasty'] {
  if (score >= 90) return 'eternal-dynasty'
  if (score >= 75) return 'lasting-reign'
  if (score >= 60) return 'proper-rule'
  if (score >= 40) return 'brief-tenure'
  if (score >= 20) return 'usurped-throne'
  return 'no-endurance'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): SeatCondition {
  if (score >= 90) return 'emerald-masterpiece'
  if (score >= 75) return 'royal-throne'
  if (score >= 60) return 'proper-seat'
  if (score >= 40) return 'wooden-chair'
  if (score >= 20) return 'broken-stool'
  return 'void'
}

/** @example classifyCourtType(seats) */
export function classifyCourtType(seats: EmeraldSeat[]): CourtType {
  if (seats.length === 0) return 'no-court'
  const avg = seats.reduce((s, p) => s + p.qualityScore, 0) / seats.length
  if (avg >= 90) return 'grand-palace'
  if (avg >= 75) return 'royal-court'
  if (avg >= 60) return 'proper-hall'
  if (avg >= 40) return 'small-chamber'
  if (avg >= 20) return 'dark-dungeon'
  return 'no-court'
}

/** @example classifyCourtCondition(avgAuthority) */
export function classifyCourtCondition(avgAuthority: number): CourtCondition {
  if (avgAuthority >= 85) return 'emerald-palace'
  if (avgAuthority >= 70) return 'royal-court'
  if (avgAuthority >= 55) return 'proper-hall'
  if (avgAuthority >= 35) return 'modest-room'
  if (avgAuthority >= 15) return 'ruined-keep'
  return 'void'
}

/** @example classifyMonarchGrade(80) */
export function classifyMonarchGrade(avgSovereignty: number): MonarchGrade {
  if (avgSovereignty >= 80) return 'emperor'
  if (avgSovereignty >= 65) return 'king'
  if (avgSovereignty >= 50) return 'duke'
  if (avgSovereignty >= 35) return 'baron'
  if (avgSovereignty >= 20) return 'knight'
  return 'peasant'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeEmeraldSeat(content, 'app.ts') */
export function analyzeEmeraldSeat(content: string, filePath: string): EmeraldSeat {
  const ruling = measureRuling(content)
  const judging = measureJudging(content)
  const crowning = measureCrowning(content)
  const wielding = measureWielding(content)
  const reigning = measureReigning(content)

  const gemAuthority = ruling.authority
  const throneWisdom = judging.wisdom
  const crownPrecision = crowning.precision
  const scepterResilience = wielding.resilience
  const dynastyEndurance = reigning.endurance

  const qualityScore = Math.round(
    gemAuthority * 0.2 +
    throneWisdom * 0.2 +
    crownPrecision * 0.2 +
    scepterResilience * 0.2 +
    dynastyEndurance * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    gemAuthority,
    throneWisdom,
    crownPrecision,
    scepterResilience,
    dynastyEndurance,
    ruling,
    judging,
    crowning,
    wielding,
    reigning,
    condition,
    qualityScore,
  }
}

/** @example analyzeEmeraldCourt(seats, 'src') */
export function analyzeEmeraldCourt(seats: EmeraldSeat[], dirPath: string): EmeraldCourt {
  if (seats.length === 0) {
    return {
      directory: dirPath,
      seats: [],
      avgAuthority: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      emeraldMasterpieceCount: 0,
      voidCount: 0,
      courtType: 'no-court',
      condition: 'void',
    }
  }

  const avgAuthority = Math.round(
    seats.reduce((s, p) => s + p.gemAuthority, 0) / seats.length,
  )
  const avgPrecision = Math.round(
    seats.reduce((s, p) => s + p.crownPrecision, 0) / seats.length,
  )
  const avgWisdom = Math.round(
    seats.reduce((s, p) => s + p.throneWisdom, 0) / seats.length,
  )

  const emeraldMasterpieceCount = seats.filter(
    (p) => p.condition === 'emerald-masterpiece',
  ).length
  const voidCount = seats.filter((p) => p.condition === 'void').length

  const courtType = classifyCourtType(seats)
  const avgQuality = Math.round(
    seats.reduce((s, p) => s + p.qualityScore, 0) / seats.length,
  )
  const condition = classifyCourtCondition(avgQuality)

  return {
    directory: dirPath,
    seats,
    avgAuthority,
    avgPrecision,
    avgWisdom,
    emeraldMasterpieceCount,
    voidCount,
    courtType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldThroneResult(['a.ts'], [content]) */
export async function buildEmeraldThroneResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldThroneResult> {
  const seats: EmeraldSeat[] = files.map((file, i) =>
    analyzeEmeraldSeat(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, EmeraldSeat[]>()
  for (const seat of seats) {
    const dir = seat.file.includes('/')
      ? seat.file.substring(0, seat.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(seat)
    } else {
      dirMap.set(dir, [seat])
    }
  }

  const courts: EmeraldCourt[] = Array.from(dirMap.entries()).map(([dir, dirSeats]) =>
    analyzeEmeraldCourt(dirSeats, dir),
  )

  const avgAuthority =
    seats.length > 0
      ? Math.round(seats.reduce((s, p) => s + p.gemAuthority, 0) / seats.length)
      : 0
  const avgPrecision =
    seats.length > 0
      ? Math.round(seats.reduce((s, p) => s + p.crownPrecision, 0) / seats.length)
      : 0
  const avgWisdom =
    seats.length > 0
      ? Math.round(seats.reduce((s, p) => s + p.throneWisdom, 0) / seats.length)
      : 0

  const overallSovereignty =
    seats.length > 0
      ? Math.round(seats.reduce((s, p) => s + p.qualityScore, 0) / seats.length)
      : 0
  const isEmerald = overallSovereignty >= 60

  const kingdom = { avgAuthority, avgPrecision, avgWisdom, isEmerald, overallSovereignty }

  const avgGemAuthority = avgAuthority
  const avgThroneWisdom = avgWisdom
  const avgCrownPrecision = avgPrecision
  const avgScepterResilience =
    seats.length > 0
      ? Math.round(seats.reduce((s, p) => s + p.scepterResilience, 0) / seats.length)
      : 0
  const avgDynastyEndurance =
    seats.length > 0
      ? Math.round(seats.reduce((s, p) => s + p.dynastyEndurance, 0) / seats.length)
      : 0

  const emeraldMasterpieceCount = seats.filter(
    (p) => p.condition === 'emerald-masterpiece',
  ).length
  const royalThroneCount = seats.filter((p) => p.condition === 'royal-throne').length
  const properSeatCount = seats.filter((p) => p.condition === 'proper-seat').length
  const woodenChairCount = seats.filter((p) => p.condition === 'wooden-chair').length
  const brokenStoolCount = seats.filter((p) => p.condition === 'broken-stool').length
  const voidCount = seats.filter((p) => p.condition === 'void').length

  const hasHighAuthorityCount = seats.filter((p) => p.ruling.hasHighAuthority).length
  const hasHighWisdomCount = seats.filter((p) => p.judging.hasHighWisdom).length
  const hasHighPrecisionCount = seats.filter((p) => p.crowning.hasHighPrecision).length
  const hasHighResilienceCount = seats.filter((p) => p.wielding.hasHighResilience).length
  const hasHighEnduranceCount = seats.filter((p) => p.reigning.hasHighEndurance).length

  const monarchGrade = classifyMonarchGrade(overallSovereignty)

  const bestSeat = seats.length > 0
    ? seats.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const mostAuthoritative = seats.length > 0
    ? seats.reduce((best, p) => (p.gemAuthority > best.gemAuthority ? p : best)).file
    : ''
  const wisest = seats.length > 0
    ? seats.reduce((best, p) => (p.throneWisdom > best.throneWisdom ? p : best)).file
    : ''
  const mostPrecise = seats.length > 0
    ? seats.reduce((best, p) => (p.crownPrecision > best.crownPrecision ? p : best)).file
    : ''
  const mostResilient = seats.length > 0
    ? seats.reduce((best, p) => (p.scepterResilience > best.scepterResilience ? p : best)).file
    : ''
  const mostEnduring = seats.length > 0
    ? seats.reduce((best, p) => (p.dynastyEndurance > best.dynastyEndurance ? p : best)).file
    : ''

  const stats: EmeraldThroneStats = {
    totalFiles: files.length,
    totalCourts: courts.length,
    avgGemAuthority,
    avgThroneWisdom,
    avgCrownPrecision,
    avgScepterResilience,
    avgDynastyEndurance,
    emeraldMasterpieceCount,
    royalThroneCount,
    properSeatCount,
    woodenChairCount,
    brokenStoolCount,
    voidCount,
    hasHighAuthorityCount,
    hasHighWisdomCount,
    hasHighPrecisionCount,
    hasHighResilienceCount,
    hasHighEnduranceCount,
    overallSovereignty,
    monarchGrade,
    bestSeat,
    mostAuthoritative,
    wisest,
    mostPrecise,
    mostResilient,
    mostEnduring,
  }

  const recommendations = generateRecommendations(seats, courts, kingdom, stats)

  return { seats, courts, kingdom, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(seats, courts, kingdom, stats) */
export function generateRecommendations(
  seats: EmeraldSeat[],
  courts: EmeraldCourt[],
  kingdom: EmeraldThroneResult['kingdom'],
  stats: EmeraldThroneStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgGemAuthority >= 90 &&
    stats.avgThroneWisdom >= 90 &&
    stats.avgCrownPrecision >= 90 &&
    stats.avgScepterResilience >= 90 &&
    stats.avgDynastyEndurance >= 90
  ) {
    recs.push(
      'Your emerald throne radiates sovereign perfection! Every seat is a masterpiece of royal authority and dynastic wisdom',
    )
    return recs
  }

  if (stats.avgGemAuthority < 60) {
    recs.push(
      'Strengthen gem authority — code should command like a rightful ruler on the emerald throne, with clear presence and purpose',
    )
  }

  if (stats.avgThroneWisdom < 60) {
    recs.push(
      'Deepen throne wisdom — code should judge like a wise sovereign, with deep understanding and sound judgment',
    )
  }

  if (stats.avgCrownPrecision < 60) {
    recs.push(
      'Refine crown precision — code must fit with exacting precision, like a crown crafted for the perfect ruler',
    )
  }

  if (stats.avgScepterResilience < 60) {
    recs.push(
      'Fortify scepter resilience — code must maintain authority under pressure, the scepter never wavers',
    )
  }

  if (stats.avgDynastyEndurance < 60) {
    recs.push(
      'Strengthen dynasty endurance — code should outlast its creators, like a great dynasty serving generations',
    )
  }

  if (stats.overallSovereignty < 40) {
    recs.push(
      'The throne crumbles — rebuild the emerald foundation before the kingdom falls to ruin',
    )
  }

  const voidSeats = seats.filter((p) => p.condition === 'void')
  if (voidSeats.length > 0 && voidSeats.length <= 5) {
    recs.push(
      `Restore these broken seats: ${voidSeats.map((p) => p.file).join(', ')}`,
    )
  } else if (voidSeats.length > 5) {
    recs.push(
      `Restore these ${voidSeats.length} broken seats before the entire court collapses`,
    )
  }

  const poorCourts = courts.filter(
    (c) => c.condition === 'void' || c.condition === 'ruined-keep',
  )
  if (poorCourts.length === courts.length && courts.length > 0) {
    recs.push(
      'All courts lie in ruin — consider a complete restoration of the emerald kingdom',
    )
  }

  if (recs.length === 0) {
    recs.push('Your emerald throne stands strong — keep ruling with sovereign wisdom and precision')
  }

  return recs
}
