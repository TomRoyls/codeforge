// ─── Interfaces ──────────────────────────────────────────

export interface ProtectingMeasure {
  power: number
  amber:
    | 'perfect-preservation'
    | 'golden-trap'
    | 'proper-resin'
    | 'leaking-sap'
    | 'dry-bark'
    | 'no-power'
  hasHighPower: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasValuable: boolean
  untestedCount: number
  unsafeCount: number
}

export interface AscendingMeasure {
  elevation: number
  summit:
    | 'golden-peak'
    | 'high-ridge'
    | 'proper-plateau'
    | 'low-hill'
    | 'valley-floor'
    | 'no-elevation'
  hasHighElevation: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasScalable: boolean
  hasNoBottlenecked: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasArchitectural: boolean
  hasNoAdHoc: boolean
  hasElevated: boolean
  hasNoFlat: boolean
  hasGrand: boolean
  chaoticCount: number
  tangledCount: number
}

export interface HardeningMeasure {
  fortitude: number
  resin:
    | 'diamond-hard'
    | 'fossilized-resin'
    | 'proper-hardness'
    | 'soft-sap'
    | 'liquid-resin'
    | 'no-fortitude'
  hasHighFortitude: boolean
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
  hasEnduring: boolean
  hasNoBrittle: boolean
  hasStrong: boolean
  hasNoWeak: boolean
  hasSolid: boolean
  bareCrashCount: number
  fragileCount: number
}

export interface RevealingMeasure {
  clarity: number
  vista:
    | 'panoramic-view'
    | 'clear-horizon'
    | 'proper-sight'
    | 'foggy-peak'
    | 'blind-summit'
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
  hasDirect: boolean
  hasNoCircuits: boolean
  hasRevealing: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface RememberingMeasure {
  wisdom: number
  ancient:
    | 'million-year-amber'
    | 'fossil-wisdom'
    | 'proper-antiquity'
    | 'recent-memory'
    | 'no-history'
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
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hackedCount: number
  adHocCount: number
}

export type PeakCondition =
  | 'amber-masterpiece'
  | 'golden-summit'
  | 'proper-peak'
  | 'faded-hill'
  | 'barren-rock'
  | 'void'

export interface AmberPeak {
  file: string
  preservationPower: number
  goldenElevation: number
  resinFortitude: number
  peakClarity: number
  ancientWisdom: number
  protecting: ProtectingMeasure
  ascending: AscendingMeasure
  hardening: HardeningMeasure
  revealing: RevealingMeasure
  remembering: RememberingMeasure
  condition: PeakCondition
  qualityScore: number
}

export type RidgeType =
  | 'golden-mountain'
  | 'amber-ridge'
  | 'proper-range'
  | 'small-hill'
  | 'barren-flat'
  | 'no-ridge'

export type RidgeCondition =
  | 'amber-mountain'
  | 'golden-range'
  | 'proper-ridge'
  | 'faded-hills'
  | 'barren-plain'
  | 'void'

export interface AmberRidge {
  directory: string
  peaks: AmberPeak[]
  avgPower: number
  avgElevation: number
  avgWisdom: number
  amberMasterpieceCount: number
  voidCount: number
  ridgeType: RidgeType
  condition: RidgeCondition
}

export type ClimberGrade =
  | 'summit-master'
  | 'alpine-guide'
  | 'mountain-goat'
  | 'apprentice'
  | 'novice'
  | 'flatlander'

export interface AmberSummitStats {
  totalFiles: number
  totalRidges: number
  avgPreservationPower: number
  avgGoldenElevation: number
  avgResinFortitude: number
  avgPeakClarity: number
  avgAncientWisdom: number
  amberMasterpieceCount: number
  goldenSummitCount: number
  properPeakCount: number
  fadedHillCount: number
  barrenRockCount: number
  voidCount: number
  hasHighPowerCount: number
  hasHighElevationCount: number
  hasHighFortitudeCount: number
  hasHighClarityCount: number
  hasHighWisdomCount: number
  overallElevation: number
  climberGrade: ClimberGrade
  bestPeak: string
  mostPreserved: string
  mostElevated: string
  mostFortified: string
  clearest: string
  wisest: string
}

export interface AmberSummitResult {
  peaks: AmberPeak[]
  ridges: AmberRidge[]
  mountain: {
    avgPower: number
    avgElevation: number
    avgWisdom: number
    isAmber: boolean
    overallElevation: number
  }
  stats: AmberSummitStats
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

/** @example measureProtecting('export function add(): number { }') */
export function measureProtecting(content: string): ProtectingMeasure {
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasEncapsulated = /\b(readonly|private|protected)\b/.test(content)
  const hasNoLeaked = !content.includes('@ts-ignore')
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoAbandoned = !/\b(abandoned|forgotten|neglected)\b/i.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|unstable|changing)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasValuable = /\b(class|interface|type|enum)\b/.test(content)

  const positiveBooleans = [
    hasTested,
    hasTypeSafe,
    hasDocumented,
    hasEncapsulated,
    hasMaintained,
    hasStable,
    hasConsistent,
    hasValuable,
  ]

  const power = computeScore(positiveBooleans)
  const hasHighPower = power >= 60
  const amber = classifyAmber(power)

  return {
    power,
    amber,
    hasHighPower,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasDocumented,
    hasNoUndocumented,
    hasEncapsulated,
    hasNoLeaked,
    hasMaintained,
    hasNoAbandoned,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasNoErratic,
    hasValuable,
    untestedCount,
    unsafeCount,
  }
}

/** @example measureAscending('export interface Config { readonly name: string }') */
export function measureAscending(content: string): AscendingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|mess|tangle)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|giant|massive)\b/i.test(content)
  const hasScalable = /\b(async|await|Promise)\b/.test(content)
  const hasNoBottlenecked = !/\b(bottleneck|block|stall)\b/i.test(content)
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasNoScattered = !/\b(scattered|fragmented|dispersed)\b/i.test(content)
  const hasCleanPipelines = /\b(return|yield|emit)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|woven)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasArchitectural = /\b(function|class|interface)\b/.test(content)
  const hasNoAdHoc = (content.match(/\bany\b/g) ?? []).length === 0
  const hasElevated = /\bexport\b/.test(content)
  const hasNoFlat = !/\b(flat|shallow|thin)\b/i.test(content)
  const hasGrand = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasScalable,
    hasOrganized,
    hasCleanPipelines,
    hasArchitectural,
    hasElevated,
    hasGrand,
  ]

  const elevation = computeScore(positiveBooleans)
  const hasHighElevation = elevation >= 60
  const summit = classifySummit(elevation)

  return {
    elevation,
    summit,
    hasHighElevation,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasScalable,
    hasNoBottlenecked,
    hasOrganized,
    hasNoScattered,
    hasCleanPipelines,
    hasNoTangled,
    hasArchitectural,
    hasNoAdHoc,
    hasElevated,
    hasNoFlat,
    hasGrand,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureHardening('try { foo() } catch { bar() }') */
export function measureHardening(content: string): HardeningMeasure {
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
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasNoBrittle = !/\b(brittle|breakable|fragile)\b/i.test(content)
  const hasStrong = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoWeak = (content.match(/\bany\b/g) ?? []).length === 0
  const hasSolid = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasEnduring,
    hasStrong,
    hasSolid,
  ]

  const fortitude = computeScore(positiveBooleans)
  const hasHighFortitude = fortitude >= 60
  const resin = classifyResin(fortitude)

  return {
    fortitude,
    resin,
    hasHighFortitude,
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
    hasEnduring,
    hasNoBrittle,
    hasStrong,
    hasNoWeak,
    hasSolid,
    bareCrashCount,
    fragileCount,
  }
}

/** @example measureRevealing('export function add(): number { }') */
export function measureRevealing(content: string): RevealingMeasure {
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
  const hasDirect = /\b(import|export|from)\b/.test(content)
  const hasNoCircuits = !/\b(circuit|spaghetti|tangle)\b/i.test(content)
  const hasRevealing = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealing,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const vista = classifyVista(clarity)

  return {
    clarity,
    vista,
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
    hasDirect,
    hasNoCircuits,
    hasRevealing,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureRemembering('export const WISDOM = true as const') */
export function measureRemembering(content: string): RememberingMeasure {
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
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasMature,
    hasPatterned,
    hasDeep,
    hasInsightful,
    hasStrategic,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const ancient = classifyAncient(wisdom)

  return {
    wisdom,
    ancient,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasInsightful,
    hasNoObvious,
    hasStrategic,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyAmber(score: number): ProtectingMeasure['amber'] {
  if (score >= 90) return 'perfect-preservation'
  if (score >= 75) return 'golden-trap'
  if (score >= 60) return 'proper-resin'
  if (score >= 40) return 'leaking-sap'
  if (score >= 20) return 'dry-bark'
  return 'no-power'
}

function classifySummit(score: number): AscendingMeasure['summit'] {
  if (score >= 90) return 'golden-peak'
  if (score >= 75) return 'high-ridge'
  if (score >= 60) return 'proper-plateau'
  if (score >= 40) return 'low-hill'
  if (score >= 20) return 'valley-floor'
  return 'no-elevation'
}

function classifyResin(score: number): HardeningMeasure['resin'] {
  if (score >= 90) return 'diamond-hard'
  if (score >= 75) return 'fossilized-resin'
  if (score >= 60) return 'proper-hardness'
  if (score >= 40) return 'soft-sap'
  if (score >= 20) return 'liquid-resin'
  return 'no-fortitude'
}

function classifyVista(score: number): RevealingMeasure['vista'] {
  if (score >= 90) return 'panoramic-view'
  if (score >= 75) return 'clear-horizon'
  if (score >= 60) return 'proper-sight'
  if (score >= 40) return 'foggy-peak'
  if (score >= 20) return 'blind-summit'
  return 'no-clarity'
}

function classifyAncient(score: number): RememberingMeasure['ancient'] {
  if (score >= 90) return 'million-year-amber'
  if (score >= 75) return 'fossil-wisdom'
  if (score >= 60) return 'proper-antiquity'
  if (score >= 40) return 'recent-memory'
  if (score >= 20) return 'no-history'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): PeakCondition {
  if (score >= 90) return 'amber-masterpiece'
  if (score >= 75) return 'golden-summit'
  if (score >= 60) return 'proper-peak'
  if (score >= 40) return 'faded-hill'
  if (score >= 20) return 'barren-rock'
  return 'void'
}

/** @example classifyRidgeType(peaks) */
export function classifyRidgeType(peaks: AmberPeak[]): RidgeType {
  if (peaks.length === 0) return 'no-ridge'
  const avg = peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length
  if (avg >= 90) return 'golden-mountain'
  if (avg >= 75) return 'amber-ridge'
  if (avg >= 60) return 'proper-range'
  if (avg >= 40) return 'small-hill'
  if (avg >= 20) return 'barren-flat'
  return 'no-ridge'
}

/** @example classifyRidgeCondition(avgPower) */
export function classifyRidgeCondition(avgPower: number): RidgeCondition {
  if (avgPower >= 85) return 'amber-mountain'
  if (avgPower >= 70) return 'golden-range'
  if (avgPower >= 55) return 'proper-ridge'
  if (avgPower >= 35) return 'faded-hills'
  if (avgPower >= 15) return 'barren-plain'
  return 'void'
}

/** @example classifyClimberGrade(80) */
export function classifyClimberGrade(avgElevation: number): ClimberGrade {
  if (avgElevation >= 80) return 'summit-master'
  if (avgElevation >= 65) return 'alpine-guide'
  if (avgElevation >= 50) return 'mountain-goat'
  if (avgElevation >= 35) return 'apprentice'
  if (avgElevation >= 20) return 'novice'
  return 'flatlander'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeAmberPeak(content, 'app.ts') */
export function analyzeAmberPeak(content: string, filePath: string): AmberPeak {
  const protecting = measureProtecting(content)
  const ascending = measureAscending(content)
  const hardening = measureHardening(content)
  const revealing = measureRevealing(content)
  const remembering = measureRemembering(content)

  const preservationPower = protecting.power
  const goldenElevation = ascending.elevation
  const resinFortitude = hardening.fortitude
  const peakClarity = revealing.clarity
  const ancientWisdom = remembering.wisdom

  const qualityScore = Math.round(
    preservationPower * 0.2 +
    goldenElevation * 0.2 +
    resinFortitude * 0.2 +
    peakClarity * 0.2 +
    ancientWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    preservationPower,
    goldenElevation,
    resinFortitude,
    peakClarity,
    ancientWisdom,
    protecting,
    ascending,
    hardening,
    revealing,
    remembering,
    condition,
    qualityScore,
  }
}

/** @example analyzeAmberRidge(peaks, 'src') */
export function analyzeAmberRidge(peaks: AmberPeak[], dirPath: string): AmberRidge {
  if (peaks.length === 0) {
    return {
      directory: dirPath,
      peaks: [],
      avgPower: 0,
      avgElevation: 0,
      avgWisdom: 0,
      amberMasterpieceCount: 0,
      voidCount: 0,
      ridgeType: 'no-ridge',
      condition: 'void',
    }
  }

  const avgPower = Math.round(
    peaks.reduce((s, p) => s + p.preservationPower, 0) / peaks.length,
  )
  const avgElevation = Math.round(
    peaks.reduce((s, p) => s + p.goldenElevation, 0) / peaks.length,
  )
  const avgWisdom = Math.round(
    peaks.reduce((s, p) => s + p.ancientWisdom, 0) / peaks.length,
  )

  const amberMasterpieceCount = peaks.filter(
    (p) => p.condition === 'amber-masterpiece',
  ).length
  const voidCount = peaks.filter((p) => p.condition === 'void').length

  const ridgeType = classifyRidgeType(peaks)
  const avgQuality = Math.round(
    peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length,
  )
  const condition = classifyRidgeCondition(avgQuality)

  return {
    directory: dirPath,
    peaks,
    avgPower,
    avgElevation,
    avgWisdom,
    amberMasterpieceCount,
    voidCount,
    ridgeType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAmberSummitResult(['a.ts'], [content]) */
export async function buildAmberSummitResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberSummitResult> {
  const peaks: AmberPeak[] = files.map((file, i) =>
    analyzeAmberPeak(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberPeak[]>()
  for (const peak of peaks) {
    const dir = peak.file.includes('/')
      ? peak.file.substring(0, peak.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(peak)
    } else {
      dirMap.set(dir, [peak])
    }
  }

  const ridges: AmberRidge[] = Array.from(dirMap.entries()).map(([dir, dirPeaks]) =>
    analyzeAmberRidge(dirPeaks, dir),
  )

  const avgPower =
    peaks.length > 0
      ? Math.round(peaks.reduce((s, p) => s + p.preservationPower, 0) / peaks.length)
      : 0
  const avgElevation =
    peaks.length > 0
      ? Math.round(peaks.reduce((s, p) => s + p.goldenElevation, 0) / peaks.length)
      : 0
  const avgWisdom =
    peaks.length > 0
      ? Math.round(peaks.reduce((s, p) => s + p.ancientWisdom, 0) / peaks.length)
      : 0

  const overallElevation =
    peaks.length > 0
      ? Math.round(peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length)
      : 0
  const isAmber = overallElevation >= 60

  const mountain = { avgPower, avgElevation, avgWisdom, isAmber, overallElevation }

  const avgPreservationPower = avgPower
  const avgGoldenElevation = avgElevation
  const avgResinFortitude =
    peaks.length > 0
      ? Math.round(peaks.reduce((s, p) => s + p.resinFortitude, 0) / peaks.length)
      : 0
  const avgPeakClarity =
    peaks.length > 0
      ? Math.round(peaks.reduce((s, p) => s + p.peakClarity, 0) / peaks.length)
      : 0
  const avgAncientWisdom = avgWisdom

  const amberMasterpieceCount = peaks.filter(
    (p) => p.condition === 'amber-masterpiece',
  ).length
  const goldenSummitCount = peaks.filter((p) => p.condition === 'golden-summit').length
  const properPeakCount = peaks.filter((p) => p.condition === 'proper-peak').length
  const fadedHillCount = peaks.filter((p) => p.condition === 'faded-hill').length
  const barrenRockCount = peaks.filter((p) => p.condition === 'barren-rock').length
  const voidCount = peaks.filter((p) => p.condition === 'void').length

  const hasHighPowerCount = peaks.filter((p) => p.protecting.hasHighPower).length
  const hasHighElevationCount = peaks.filter((p) => p.ascending.hasHighElevation).length
  const hasHighFortitudeCount = peaks.filter((p) => p.hardening.hasHighFortitude).length
  const hasHighClarityCount = peaks.filter((p) => p.revealing.hasHighClarity).length
  const hasHighWisdomCount = peaks.filter((p) => p.remembering.hasHighWisdom).length

  const climberGrade = classifyClimberGrade(overallElevation)

  const bestPeak = peaks.length > 0
    ? peaks.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const mostPreserved = peaks.length > 0
    ? peaks.reduce((best, p) => (p.preservationPower > best.preservationPower ? p : best)).file
    : ''
  const mostElevated = peaks.length > 0
    ? peaks.reduce((best, p) => (p.goldenElevation > best.goldenElevation ? p : best)).file
    : ''
  const mostFortified = peaks.length > 0
    ? peaks.reduce((best, p) => (p.resinFortitude > best.resinFortitude ? p : best)).file
    : ''
  const clearest = peaks.length > 0
    ? peaks.reduce((best, p) => (p.peakClarity > best.peakClarity ? p : best)).file
    : ''
  const wisest = peaks.length > 0
    ? peaks.reduce((best, p) => (p.ancientWisdom > best.ancientWisdom ? p : best)).file
    : ''

  const stats: AmberSummitStats = {
    totalFiles: files.length,
    totalRidges: ridges.length,
    avgPreservationPower,
    avgGoldenElevation,
    avgResinFortitude,
    avgPeakClarity,
    avgAncientWisdom,
    amberMasterpieceCount,
    goldenSummitCount,
    properPeakCount,
    fadedHillCount,
    barrenRockCount,
    voidCount,
    hasHighPowerCount,
    hasHighElevationCount,
    hasHighFortitudeCount,
    hasHighClarityCount,
    hasHighWisdomCount,
    overallElevation,
    climberGrade,
    bestPeak,
    mostPreserved,
    mostElevated,
    mostFortified,
    clearest,
    wisest,
  }

  const recommendations = generateRecommendations(peaks, ridges, mountain, stats)

  return { peaks, ridges, mountain, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(peaks, ridges, mountain, stats) */
export function generateRecommendations(
  peaks: AmberPeak[],
  ridges: AmberRidge[],
  _mountain: AmberSummitResult['mountain'],
  stats: AmberSummitStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgPreservationPower >= 90 &&
    stats.avgGoldenElevation >= 90 &&
    stats.avgResinFortitude >= 90 &&
    stats.avgPeakClarity >= 90 &&
    stats.avgAncientWisdom >= 90
  ) {
    recs.push(
      'Your amber summit glows with perfect golden preservation! Every peak is a masterpiece of ancient wisdom and crystalline clarity',
    )
    return recs
  }

  if (stats.avgPreservationPower < 60) {
    recs.push(
      'Strengthen preservation power — code should protect valuable logic like amber preserves ancient life',
    )
  }

  if (stats.avgGoldenElevation < 60) {
    recs.push(
      'Elevate golden architecture — code must rise above the ordinary like a golden summit above the clouds',
    )
  }

  if (stats.avgResinFortitude < 60) {
    recs.push(
      'Harden resin fortitude — code should endure like fossilized amber, harder than stone',
    )
  }

  if (stats.avgPeakClarity < 60) {
    recs.push(
      'Clear the peak — code should provide panoramic understanding from the summit',
    )
  }

  if (stats.avgAncientWisdom < 60) {
    recs.push(
      'Deepen ancient wisdom — code should carry the accumulated knowledge of geological ages',
    )
  }

  if (stats.overallElevation < 40) {
    recs.push(
      'The summit crumbles into barren rock — rebuild the foundations before the amber fades',
    )
  }

  const voidPeaks = peaks.filter((p) => p.condition === 'void')
  if (voidPeaks.length > 0 && voidPeaks.length <= 5) {
    recs.push(
      `Restore these barren peaks: ${voidPeaks.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPeaks.length > 5) {
    recs.push(
      `Restore these ${voidPeaks.length} barren peaks before the ridge collapses`,
    )
  }

  const poorRidges = ridges.filter(
    (r) => r.condition === 'void' || r.condition === 'barren-plain',
  )
  if (poorRidges.length === ridges.length && ridges.length > 0) {
    recs.push(
      'All ridges show signs of barren decay — consider a complete restoration of the amber summit',
    )
  }

  if (recs.length === 0) {
    recs.push('Your amber summit gleams with golden preservation — keep building with ancient wisdom')
  }

  return recs
}
