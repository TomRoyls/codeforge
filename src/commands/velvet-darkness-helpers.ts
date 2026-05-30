// ─── Interfaces ──────────────────────────────────────────

export interface SmoothingMeasure {
  softness: number
  fabric:
    | 'royal-velvet'
    | 'silk-smooth'
    | 'proper-cloth'
    | 'coarse-wool'
    | 'sandpaper'
    | 'no-softness'
  hasHighSoftness: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasGentle: boolean
  hasNoHarsh: boolean
  hasInviting: boolean
  hasNoExclusive: boolean
  hasWarm: boolean
  hasDocumented: boolean
  hasUnderstanding: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ComfortingMeasure {
  comfort: number
  blanket:
    | 'luxurious-warmth'
    | 'comforting-dark'
    | 'proper-cover'
    | 'thin-sheet'
    | 'no-blanket'
    | 'no-comfort'
  hasHighComfort: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasReliable: boolean
  hasPredictable: boolean
  hasStable: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface DrapingMeasure {
  elegance: number
  drape:
    | 'elegant-fall'
    | 'graceful-hang'
    | 'proper-drape'
    | 'stiff-cloth'
    | 'bunched-fabric'
    | 'no-elegance'
  hasHighElegance: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasGraceful: boolean
  chaoticCount: number
  tangledCount: number
}

export interface KnowingMeasure {
  wisdom: number
  owl:
    | 'ancient-owl'
    | 'night-sage'
    | 'proper-nocturne'
    | 'day-thinker'
    | 'sleepy-bird'
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
  hasMature: boolean
  hasNoNaive: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasVisionary: boolean
  hackedCount: number
  adHocCount: number
}

export interface SurvivingMeasure {
  resilience: number
  night:
    | 'night-survivor'
    | 'dark-thriver'
    | 'proper-nocturne'
    | 'light-seeker'
    | 'blind-wanderer'
    | 'no-resilience'
  hasHighResilience: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasAdaptive: boolean
  hasNoRigid: boolean
  hasAntifragile: boolean
  hasNoBrittle: boolean
  hasPersistent: boolean
  hasEnduring: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasExtensible: boolean
  hasFutureProof: boolean
  hasVersatile: boolean
  hasRecoverable: boolean
  hasForgiving: boolean
  fragileCount: number
  rigidCount: number
}

export type FoldCondition =
  | 'velvet-masterpiece'
  | 'silk-night'
  | 'proper-dark'
  | 'rough-twilight'
  | 'harsh-daylight'
  | 'void'

export interface VelvetFold {
  file: string
  softnessQuality: number
  darkComfort: number
  shadowElegance: number
  nocturnalWisdom: number
  nightResilience: number
  smoothing: SmoothingMeasure
  comforting: ComfortingMeasure
  draping: DrapingMeasure
  knowing: KnowingMeasure
  surviving: SurvivingMeasure
  condition: FoldCondition
  qualityScore: number
}

export type CurtainType =
  | 'grand-drape'
  | 'velvet-curtain'
  | 'proper-shade'
  | 'thin-cloth'
  | 'bare-window'
  | 'no-curtain'

export type CurtainCondition =
  | 'velvet-theater'
  | 'dark-chamber'
  | 'proper-room'
  | 'dim-corner'
  | 'harsh-lit-hall'
  | 'void'

export interface VelvetCurtain {
  directory: string
  folds: VelvetFold[]
  avgSoftness: number
  avgElegance: number
  avgResilience: number
  velvetMasterpieceCount: number
  voidCount: number
  curtainType: CurtainType
  condition: CurtainCondition
}

export type TailorGrade =
  | 'master-tailor'
  | 'silk-weaver'
  | 'cloth-merchant'
  | 'apprentice'
  | 'novice'
  | 'tattered-seam'

export interface VelvetDarknessStats {
  totalFiles: number
  totalCurtains: number
  avgSoftnessQuality: number
  avgDarkComfort: number
  avgShadowElegance: number
  avgNocturnalWisdom: number
  avgNightResilience: number
  velvetMasterpieceCount: number
  silkNightCount: number
  properDarkCount: number
  roughTwilightCount: number
  harshDaylightCount: number
  voidCount: number
  hasHighSoftnessCount: number
  hasHighComfortCount: number
  hasHighEleganceCount: number
  hasHighWisdomCount: number
  hasHighResilienceCount: number
  overallLuxury: number
  tailorGrade: TailorGrade
  bestFold: string
  softest: string
  mostComforting: string
  mostElegant: string
  wisest: string
  mostResilient: string
}

export interface VelvetDarknessResult {
  folds: VelvetFold[]
  curtains: VelvetCurtain[]
  evening: {
    avgSoftness: number
    avgElegance: number
    avgResilience: number
    isVelvet: boolean
    overallLuxury: number
  }
  stats: VelvetDarknessStats
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

/** @example measureSmoothing('export function greet(): string { }') */
export function measureSmoothing(content: string): SmoothingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(readonly|private|protected|async)\b/.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasApproachable = /\b(export|public)\b/.test(content)
  const hasNoIntimidating = !/\b(intimidating|overwhelming|complex)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minify|uglify)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasGentle = /\b(if|return|throw)\b/.test(content)
  const hasNoHarsh = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasInviting = /\b(import|export|from)\b/.test(content)
  const hasNoExclusive = !content.includes('@ts-ignore')
  const hasWarm = /\b(try|catch)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnderstanding = /\b(readonly|type|interface)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasApproachable,
    hasClear,
    hasGentle,
    hasInviting,
    hasWarm,
    hasDocumented,
  ]

  const softness = computeScore(positiveBooleans)
  const hasHighSoftness = softness >= 60
  const fabric = classifyFabric(softness)

  return {
    softness,
    fabric,
    hasHighSoftness,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasApproachable,
    hasNoIntimidating,
    hasClear,
    hasNoObfuscated,
    hasGentle,
    hasNoHarsh,
    hasInviting,
    hasNoExclusive,
    hasWarm,
    hasDocumented,
    hasUnderstanding,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureComforting('try { safe() } catch { recover() }') */
export function measureComforting(content: string): ComfortingMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = (content.match(/\bany\b/g) ?? []).length === 0
  const hasReliable = /\b(const|readonly)\b/.test(content)
  const hasPredictable = /\b(readonly|as const)\b/.test(content)
  const hasStable = /\b(class|interface|type|readonly)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasTested,
    hasTypeSafe,
    hasReliable,
    hasStable,
  ]

  const comfort = computeScore(positiveBooleans)
  const hasHighComfort = comfort >= 60
  const blanket = classifyBlanket(comfort)

  return {
    comfort,
    blanket,
    hasHighComfort,
    hasErrorHandled,
    hasNoBareCrash,
    hasDefensive,
    hasNoNaive,
    hasGraceful,
    hasNoHarshFail,
    hasRecoverable,
    hasNoFatal,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasReliable,
    hasPredictable,
    hasStable,
    bareCrashCount,
    untestedCount,
  }
}

/** @example measureDraping('export class Analyzer<T> { }') */
export function measureDraping(content: string): DrapingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasCleanPipelines = /\b(import|export|from)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|messy)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasModular = /\b(export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god.object|mega)\b/i.test(content)
  const hasOrganized = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoScattered = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|bloated)\b/i.test(content)
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasNoClunky = !/\b(clunky|awkward|ugly)\b/i.test(content)
  const hasRefined = /\b(function|class|interface)\b/.test(content)
  const hasPolished = /\b(try|catch|if|throw)\b/.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasCleanPipelines,
    hasModular,
    hasOrganized,
    hasEfficient,
    hasElegant,
    hasRefined,
    hasGraceful,
  ]

  const elegance = computeScore(positiveBooleans)
  const hasHighElegance = elegance >= 60
  const drape = classifyDrape(elegance)

  return {
    elegance,
    drape,
    hasHighElegance,
    hasWellStructured,
    hasNoChaotic,
    hasCleanPipelines,
    hasNoTangled,
    hasModular,
    hasNoMonolithic,
    hasOrganized,
    hasNoScattered,
    hasEfficient,
    hasNoWasteful,
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasGraceful,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureKnowing('export interface Config { readonly name: string }') */
export function measureKnowing(content: string): KnowingMeasure {
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
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasStrategic = /\b(import|export|from)\b/.test(content)
  const hasVisionary = /\b(try|catch|if|throw)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasVisionary,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const owl = classifyOwl(wisdom)

  return {
    wisdom,
    owl,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasDeep,
    hasNoShallow,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasPatterned,
    hasNoReinvented,
    hasInsightful,
    hasStrategic,
    hasVisionary,
    hackedCount,
    adHocCount,
  }
}

/** @example measureSurviving('try { survive() } catch { adapt() }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const fragileCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const rigidCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasAntifragile = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoBrittle = !content.includes('@ts-ignore')
  const hasPersistent = /\b(const|readonly)\b/.test(content)
  const hasEnduring = /\b(readonly|as const)\b/.test(content)
  const hasMaintained = /\b(import|export|from)\b/.test(content)
  const hasNoAbandoned = !/\b(abandoned|deprecated|legacy)\b/i.test(content)
  const hasExtensible = /\b(function|class|interface)\b/.test(content)
  const hasFutureProof = /\b(export|public)\b/.test(content)
  const hasVersatile = /\b(type|interface|<\w+>)\b/.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasForgiving = /\b(catch|finally|default)\b/.test(content)

  const positiveBooleans = [
    hasRobust,
    hasAdaptive,
    hasAntifragile,
    hasPersistent,
    hasMaintained,
    hasExtensible,
    hasVersatile,
    hasRecoverable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const night = classifyNight(resilience)

  return {
    resilience,
    night,
    hasHighResilience,
    hasRobust,
    hasNoFragile,
    hasAdaptive,
    hasNoRigid,
    hasAntifragile,
    hasNoBrittle,
    hasPersistent,
    hasEnduring,
    hasMaintained,
    hasNoAbandoned,
    hasExtensible,
    hasFutureProof,
    hasVersatile,
    hasRecoverable,
    hasForgiving,
    fragileCount,
    rigidCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyFabric(score: number): SmoothingMeasure['fabric'] {
  if (score >= 90) return 'royal-velvet'
  if (score >= 75) return 'silk-smooth'
  if (score >= 60) return 'proper-cloth'
  if (score >= 40) return 'coarse-wool'
  if (score >= 20) return 'sandpaper'
  return 'no-softness'
}

function classifyBlanket(score: number): ComfortingMeasure['blanket'] {
  if (score >= 90) return 'luxurious-warmth'
  if (score >= 75) return 'comforting-dark'
  if (score >= 60) return 'proper-cover'
  if (score >= 40) return 'thin-sheet'
  if (score >= 20) return 'no-blanket'
  return 'no-comfort'
}

function classifyDrape(score: number): DrapingMeasure['drape'] {
  if (score >= 90) return 'elegant-fall'
  if (score >= 75) return 'graceful-hang'
  if (score >= 60) return 'proper-drape'
  if (score >= 40) return 'stiff-cloth'
  if (score >= 20) return 'bunched-fabric'
  return 'no-elegance'
}

function classifyOwl(score: number): KnowingMeasure['owl'] {
  if (score >= 90) return 'ancient-owl'
  if (score >= 75) return 'night-sage'
  if (score >= 60) return 'proper-nocturne'
  if (score >= 40) return 'day-thinker'
  if (score >= 20) return 'sleepy-bird'
  return 'no-wisdom'
}

function classifyNight(score: number): SurvivingMeasure['night'] {
  if (score >= 90) return 'night-survivor'
  if (score >= 75) return 'dark-thriver'
  if (score >= 60) return 'proper-nocturne'
  if (score >= 40) return 'light-seeker'
  if (score >= 20) return 'blind-wanderer'
  return 'no-resilience'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): FoldCondition {
  if (score >= 90) return 'velvet-masterpiece'
  if (score >= 75) return 'silk-night'
  if (score >= 60) return 'proper-dark'
  if (score >= 40) return 'rough-twilight'
  if (score >= 20) return 'harsh-daylight'
  return 'void'
}

/** @example classifyCurtainType(folds) */
export function classifyCurtainType(folds: VelvetFold[]): CurtainType {
  if (folds.length === 0) return 'no-curtain'
  const avg = folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length
  if (avg >= 90) return 'grand-drape'
  if (avg >= 75) return 'velvet-curtain'
  if (avg >= 60) return 'proper-shade'
  if (avg >= 40) return 'thin-cloth'
  if (avg >= 20) return 'bare-window'
  return 'no-curtain'
}

/** @example classifyCurtainCondition(avgSoftness) */
export function classifyCurtainCondition(avgSoftness: number): CurtainCondition {
  if (avgSoftness >= 85) return 'velvet-theater'
  if (avgSoftness >= 70) return 'dark-chamber'
  if (avgSoftness >= 55) return 'proper-room'
  if (avgSoftness >= 35) return 'dim-corner'
  if (avgSoftness >= 15) return 'harsh-lit-hall'
  return 'void'
}

/** @example classifyTailorGrade(80) */
export function classifyTailorGrade(avgLuxury: number): TailorGrade {
  if (avgLuxury >= 80) return 'master-tailor'
  if (avgLuxury >= 65) return 'silk-weaver'
  if (avgLuxury >= 50) return 'cloth-merchant'
  if (avgLuxury >= 35) return 'apprentice'
  if (avgLuxury >= 20) return 'novice'
  return 'tattered-seam'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeVelvetFold(content, 'app.ts') */
export function analyzeVelvetFold(content: string, filePath: string): VelvetFold {
  const smoothing = measureSmoothing(content)
  const comforting = measureComforting(content)
  const draping = measureDraping(content)
  const knowing = measureKnowing(content)
  const surviving = measureSurviving(content)

  const softnessQuality = smoothing.softness
  const darkComfort = comforting.comfort
  const shadowElegance = draping.elegance
  const nocturnalWisdom = knowing.wisdom
  const nightResilience = surviving.resilience

  const qualityScore = Math.round(
    softnessQuality * 0.2 +
    darkComfort * 0.2 +
    shadowElegance * 0.2 +
    nocturnalWisdom * 0.2 +
    nightResilience * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    softnessQuality,
    darkComfort,
    shadowElegance,
    nocturnalWisdom,
    nightResilience,
    smoothing,
    comforting,
    draping,
    knowing,
    surviving,
    condition,
    qualityScore,
  }
}

/** @example analyzeVelvetCurtain(folds, 'src') */
export function analyzeVelvetCurtain(folds: VelvetFold[], dirPath: string): VelvetCurtain {
  if (folds.length === 0) {
    return {
      directory: dirPath,
      folds: [],
      avgSoftness: 0,
      avgElegance: 0,
      avgResilience: 0,
      velvetMasterpieceCount: 0,
      voidCount: 0,
      curtainType: 'no-curtain',
      condition: 'void',
    }
  }

  const avgSoftness = Math.round(
    folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length,
  )
  const avgElegance = Math.round(
    folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length,
  )
  const avgResilience = Math.round(
    folds.reduce((s, f) => s + f.nightResilience, 0) / folds.length,
  )

  const velvetMasterpieceCount = folds.filter(
    (f) => f.condition === 'velvet-masterpiece',
  ).length
  const voidCount = folds.filter((f) => f.condition === 'void').length

  const curtainType = classifyCurtainType(folds)
  const avgQuality = Math.round(
    folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length,
  )
  const condition = classifyCurtainCondition(avgQuality)

  return {
    directory: dirPath,
    folds,
    avgSoftness,
    avgElegance,
    avgResilience,
    velvetMasterpieceCount,
    voidCount,
    curtainType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildVelvetDarknessResult(['a.ts'], [content]) */
export async function buildVelvetDarknessResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<VelvetDarknessResult> {
  const folds: VelvetFold[] = files.map((file, i) =>
    analyzeVelvetFold(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, VelvetFold[]>()
  for (const fold of folds) {
    const dir = fold.file.includes('/')
      ? fold.file.substring(0, fold.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(fold)
    } else {
      dirMap.set(dir, [fold])
    }
  }

  const curtains: VelvetCurtain[] = Array.from(dirMap.entries()).map(([dir, dirFolds]) =>
    analyzeVelvetCurtain(dirFolds, dir),
  )

  const avgSoftness =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length)
      : 0
  const avgElegance =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length)
      : 0
  const avgResilience =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.nightResilience, 0) / folds.length)
      : 0

  const overallLuxury =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length)
      : 0
  const isVelvet = overallLuxury >= 60

  const evening = { avgSoftness, avgElegance, avgResilience, isVelvet, overallLuxury }

  const avgSoftnessQuality = avgSoftness
  const avgDarkComfort =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.darkComfort, 0) / folds.length)
      : 0
  const avgShadowElegance = avgElegance
  const avgNocturnalWisdom =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.nocturnalWisdom, 0) / folds.length)
      : 0
  const avgNightResilience = avgResilience

  const velvetMasterpieceCount = folds.filter(
    (f) => f.condition === 'velvet-masterpiece',
  ).length
  const silkNightCount = folds.filter((f) => f.condition === 'silk-night').length
  const properDarkCount = folds.filter((f) => f.condition === 'proper-dark').length
  const roughTwilightCount = folds.filter((f) => f.condition === 'rough-twilight').length
  const harshDaylightCount = folds.filter((f) => f.condition === 'harsh-daylight').length
  const voidCount = folds.filter((f) => f.condition === 'void').length

  const hasHighSoftnessCount = folds.filter((f) => f.smoothing.hasHighSoftness).length
  const hasHighComfortCount = folds.filter((f) => f.comforting.hasHighComfort).length
  const hasHighEleganceCount = folds.filter((f) => f.draping.hasHighElegance).length
  const hasHighWisdomCount = folds.filter((f) => f.knowing.hasHighWisdom).length
  const hasHighResilienceCount = folds.filter((f) => f.surviving.hasHighResilience).length

  const tailorGrade = classifyTailorGrade(overallLuxury)

  const bestFold = folds.length > 0
    ? folds.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file
    : ''
  const softest = folds.length > 0
    ? folds.reduce((best, f) => (f.softnessQuality > best.softnessQuality ? f : best)).file
    : ''
  const mostComforting = folds.length > 0
    ? folds.reduce((best, f) => (f.darkComfort > best.darkComfort ? f : best)).file
    : ''
  const mostElegant = folds.length > 0
    ? folds.reduce((best, f) => (f.shadowElegance > best.shadowElegance ? f : best)).file
    : ''
  const wisest = folds.length > 0
    ? folds.reduce((best, f) => (f.nocturnalWisdom > best.nocturnalWisdom ? f : best)).file
    : ''
  const mostResilient = folds.length > 0
    ? folds.reduce((best, f) => (f.nightResilience > best.nightResilience ? f : best)).file
    : ''

  const stats: VelvetDarknessStats = {
    totalFiles: files.length,
    totalCurtains: curtains.length,
    avgSoftnessQuality,
    avgDarkComfort,
    avgShadowElegance,
    avgNocturnalWisdom,
    avgNightResilience,
    velvetMasterpieceCount,
    silkNightCount,
    properDarkCount,
    roughTwilightCount,
    harshDaylightCount,
    voidCount,
    hasHighSoftnessCount,
    hasHighComfortCount,
    hasHighEleganceCount,
    hasHighWisdomCount,
    hasHighResilienceCount,
    overallLuxury,
    tailorGrade,
    bestFold,
    softest,
    mostComforting,
    mostElegant,
    wisest,
    mostResilient,
  }

  const recommendations = generateRecommendations(folds, curtains, evening, stats)

  return { folds, curtains, evening, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(folds, curtains, evening, stats) */
export function generateRecommendations(
  folds: VelvetFold[],
  curtains: VelvetCurtain[],
  _evening: VelvetDarknessResult['evening'],
  stats: VelvetDarknessStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgSoftnessQuality >= 90 &&
    stats.avgDarkComfort >= 90 &&
    stats.avgShadowElegance >= 90 &&
    stats.avgNocturnalWisdom >= 90 &&
    stats.avgNightResilience >= 90
  ) {
    recs.push(
      'Your velvet darkness is a masterpiece of luxurious code! Every fold is soft as silk, every shadow elegant beyond measure',
    )
    return recs
  }

  if (stats.avgSoftnessQuality < 60) {
    recs.push(
      'Soften the fabric — code should be gentle and approachable, like velvet that invites rather than intimidates',
    )
  }

  if (stats.avgDarkComfort < 60) {
    recs.push(
      'Add dark comfort — code should provide reliability in uncertainty, like a warm blanket in the dark',
    )
  }

  if (stats.avgShadowElegance < 60) {
    recs.push(
      'Drape with elegance — complex logic should still flow gracefully, like velvet cascading from a grand curtain',
    )
  }

  if (stats.avgNocturnalWisdom < 60) {
    recs.push(
      'Grow nocturnal wisdom — code should learn from operating in the dark, the ancient owl of the night forest',
    )
  }

  if (stats.avgNightResilience < 60) {
    recs.push(
      'Strengthen night resilience — code must thrive when visibility is low, like creatures that own the darkness',
    )
  }

  if (stats.overallLuxury < 40) {
    recs.push(
      'The velvet wears thin — reweave the fabric before harsh daylight exposes every flaw',
    )
  }

  const voidFolds = folds.filter((f) => f.condition === 'void')
  if (voidFolds.length > 0 && voidFolds.length <= 5) {
    recs.push(
      `Mend these worn folds: ${voidFolds.map((f) => f.file).join(', ')}`,
    )
  } else if (voidFolds.length > 5) {
    recs.push(
      `Mend these ${voidFolds.length} worn folds before the entire curtain unravels`,
    )
  }

  const poorCurtains = curtains.filter(
    (c) => c.condition === 'void' || c.condition === 'harsh-lit-hall',
  )
  if (poorCurtains.length === curtains.length && curtains.length > 0) {
    recs.push(
      'All curtains have fallen — the velvet darkness needs a complete reweaving from raw thread',
    )
  }

  if (recs.length === 0) {
    recs.push('Your velvet darkness drapes with luxurious elegance — keep weaving every fold to perfection')
  }

  return recs
}
