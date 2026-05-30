// ─── Interfaces ──────────────────────────────────────────

export interface BlazingMeasure {
  vitality: number
  fire:
    | 'inferno-of-life'
    | 'blazing-vitality'
    | 'proper-flame'
    | 'dying-spark'
    | 'cold-ash'
    | 'no-vitality'
  hasHighVitality: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasActive: boolean
  hasNoDead: boolean
  hasAlive: boolean
  hasNoZombie: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasConnected: boolean
  hasNoOrphaned: boolean
  hasContributing: boolean
  hasNoParasitic: boolean
  hasVital: boolean
  hasNoRedundant: boolean
  hasThriving: boolean
  isolatedCount: number
  deadCount: number
}

export interface RenewingMeasure {
  quality: number
  rebirth:
    | 'glorious-rebirth'
    | 'successful-renewal'
    | 'proper-transform'
    | 'failed-metamorphosis'
    | 'stillborn'
    | 'no-rebirth'
  hasHighQuality: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasRefactorable: boolean
  hasNoFossilized: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasFutureProof: boolean
  hasNoLegacy: boolean
  hasTransformable: boolean
  hasNoHardcoded: boolean
  hasReborn: boolean
  rigidCount: number
  tangledCount: number
}

export interface RememberingMeasure {
  wisdom: number
  ash:
    | 'ancient-ashes'
    | 'wise-remains'
    | 'proper-memory'
    | 'fresh-smoke'
    | 'no-remains'
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

export interface FocusingMeasure {
  precision: number
  flame:
    | 'laser-flame'
    | 'focused-fire'
    | 'proper-aim'
    | 'scattered-blaze'
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

export interface SurvivingMeasure {
  resilience: number
  ember:
    | 'eternal-ember'
    | 'reluctant-spark'
    | 'proper-glow'
    | 'fading-coal'
    | 'dead-ash'
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
  hasAntifragile: boolean
  hasNoBrittle: boolean
  hasPersistent: boolean
  hasNoQuitting: boolean
  hasReignitable: boolean
  bareCrashCount: number
  fragileCount: number
}

export type FeatherCondition =
  | 'phoenix-masterpiece'
  | 'reborn-glory'
  | 'proper-bird'
  | 'dying-flame'
  | 'cold-remains'
  | 'void'

export interface RubyFeather {
  file: string
  crimsonVitality: number
  rebirthQuality: number
  ashWisdom: number
  flamePrecision: number
  emberResilience: number
  blazing: BlazingMeasure
  renewing: RenewingMeasure
  remembering: RememberingMeasure
  focusing: FocusingMeasure
  surviving: SurvivingMeasure
  condition: FeatherCondition
  qualityScore: number
}

export type NestType =
  | 'phoenix-nest'
  | 'fire-perch'
  | 'proper-roost'
  | 'small-branch'
  | 'cold-ground'
  | 'no-nest'

export type NestCondition =
  | 'blazing-aerie'
  | 'fire-nest'
  | 'proper-perch'
  | 'dying-branch'
  | 'cold-ground'
  | 'void'

export interface RubyNest {
  directory: string
  feathers: RubyFeather[]
  avgVitality: number
  avgPrecision: number
  avgResilience: number
  phoenixMasterpieceCount: number
  voidCount: number
  nestType: NestType
  condition: NestCondition
}

export type PhoenixGrade =
  | 'phoenix-lord'
  | 'fire-reborn'
  | 'ember-keeper'
  | 'apprentice'
  | 'novice'
  | 'ash-scatterer'

export interface RubyPhoenixStats {
  totalFiles: number
  totalNests: number
  avgCrimsonVitality: number
  avgRebirthQuality: number
  avgAshWisdom: number
  avgFlamePrecision: number
  avgEmberResilience: number
  phoenixMasterpieceCount: number
  rebornGloryCount: number
  properBirdCount: number
  dyingFlameCount: number
  coldRemainsCount: number
  voidCount: number
  hasHighVitalityCount: number
  hasHighQualityCount: number
  hasHighWisdomCount: number
  hasHighPrecisionCount: number
  hasHighResilienceCount: number
  overallInferno: number
  phoenixGrade: PhoenixGrade
  bestFeather: string
  mostVital: string
  mostReborn: string
  wisest: string
  mostPrecise: string
  mostResilient: string
}

export interface RubyPhoenixResult {
  feathers: RubyFeather[]
  nests: RubyNest[]
  blaze: {
    avgVitality: number
    avgPrecision: number
    avgResilience: number
    isPhoenix: boolean
    overallInferno: number
  }
  stats: RubyPhoenixStats
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

/** @example measureBlazing('export class Foo { }') */
export function measureBlazing(content: string): BlazingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const isolatedCount = (content.match(/\bTODO\b/g) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasActive = /\b(async|await|Promise)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|deprecated)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasAlive = /\b(class|interface|type|function)\b/.test(content)
  const hasNoZombie = !/\b(zombie|stale|rotten)\b/i.test(content)
  const hasEvolving = /\b(readonly|private|protected)\b/.test(content)
  const hasNoStagnant = !/\b(stagnant|frozen|locked)\b/i.test(content)
  const hasConnected = /\b(import|export|from)\b/.test(content)
  const hasNoOrphaned = !/\b(orphan|alone|isolated)\b/i.test(content)
  const hasContributing = /\b(return|yield|emit)\b/.test(content)
  const hasNoParasitic = !/\b(parasitic|leech|drain)\b/i.test(content)
  const hasVital = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoRedundant = !/\b(redundant|duplicate|repeat)\b/i.test(content)
  const hasThriving = /\b(readonly|=>|export)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasActive,
    hasAlive,
    hasEvolving,
    hasConnected,
    hasContributing,
    hasVital,
    hasThriving,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60
  const fire = classifyFire(vitality)

  return {
    vitality,
    fire,
    hasHighVitality,
    hasExported,
    hasNoIsolated,
    hasActive,
    hasNoDead,
    hasAlive,
    hasNoZombie,
    hasEvolving,
    hasNoStagnant,
    hasConnected,
    hasNoOrphaned,
    hasContributing,
    hasNoParasitic,
    hasVital,
    hasNoRedundant,
    hasThriving,
    isolatedCount,
    deadCount,
  }
}

/** @example measureRenewing('export class Analyzer<T> { }') */
export function measureRenewing(content: string): RenewingMeasure {
  const hasExtensible = /\b(class|interface|type|<\w+>)\b/.test(content)
  const rigidCount = (content.match(/\bhardcode\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasRefactorable = /\b(function|class|export)\b/.test(content)
  const hasNoFossilized = !/\b(fossilized|ancient|archaic)\b/i.test(content)
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = !/\b(monolith|giant|huge)\b/i.test(content)
  const hasAdaptive = /\b(readonly|private|protected)\b/.test(content)
  const hasNoStatic = !/\b(static-only|inflexible)\b/i.test(content)
  const hasCleanPipelines = /\b(async|await|Promise)\b/.test(content)
  const tangledCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasFutureProof = /\b(type|interface|enum)\b/.test(content)
  const hasNoLegacy = !/\b(legacy|outdated|old)\b/i.test(content)
  const hasTransformable = /\b(readonly|as const)\b/.test(content)
  const hasNoHardcoded = !/\b(hardcoded|hard.?code)\b/i.test(content)
  const hasReborn = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)

  const positiveBooleans = [
    hasExtensible,
    hasRefactorable,
    hasModular,
    hasAdaptive,
    hasCleanPipelines,
    hasFutureProof,
    hasTransformable,
    hasReborn,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60
  const rebirth = classifyRebirth(quality)

  return {
    quality,
    rebirth,
    hasHighQuality,
    hasExtensible,
    hasNoRigid,
    hasRefactorable,
    hasNoFossilized,
    hasModular,
    hasNoMonolithic,
    hasAdaptive,
    hasNoStatic,
    hasCleanPipelines,
    hasNoTangled,
    hasFutureProof,
    hasNoLegacy,
    hasTransformable,
    hasNoHardcoded,
    hasReborn,
    rigidCount,
    tangledCount,
  }
}

/** @example measureRemembering('export const PROVEN = true as const') */
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
  const hasStrategic = /\b(async|await|Promise|readonly)\b/.test(content)

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
  const ash = classifyAsh(wisdom)

  return {
    wisdom,
    ash,
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

/** @example measureFocusing('function add(a: number): number { return a }') */
export function measureFocusing(content: string): FocusingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /\b(return|yield)\b/.test(content)
  const hasNoWrong = !/\b(wrong|incorrect|mistake)\b/i.test(content)
  const hasExact = /\b(type|interface|readonly)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|guess)\b/i.test(content)
  const hasCorrect = /\b(readonly|as const)\b/.test(content)
  const buggyCount = (content.match(/\b(bug|fixme)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasValidated = /\b(if|else|switch)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|hope)\b/i.test(content)
  const hasClean = !content.includes('@ts-ignore')
  const hasNoDirty = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasFocused = /\/\*\*[\s\S]*?\*\//.test(content)

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
  const flame = classifyFlame(precision)

  return {
    precision,
    flame,
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

/** @example measureSurviving('try { foo() } catch { bar() }') */
export function measureSurviving(content: string): SurvivingMeasure {
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
  const hasAntifragile = /\b(test|spec|mock|stub)\b/i.test(content) || (/\btry\b/.test(content) && /\bcatch\b/.test(content))
  const hasNoBrittle = !/\b(brittle|fragile)\b/i.test(content)
  const hasPersistent = /\b(readonly|freeze|sealed)\b/.test(content)
  const hasNoQuitting = !/\b(quit|give\s*up|surrender)\b/i.test(content)
  const hasReignitable = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasAntifragile,
    hasPersistent,
    hasReignitable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const ember = classifyEmber(resilience)

  return {
    resilience,
    ember,
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
    hasAntifragile,
    hasNoBrittle,
    hasPersistent,
    hasNoQuitting,
    hasReignitable,
    bareCrashCount,
    fragileCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyFire(score: number): BlazingMeasure['fire'] {
  if (score >= 90) return 'inferno-of-life'
  if (score >= 75) return 'blazing-vitality'
  if (score >= 60) return 'proper-flame'
  if (score >= 40) return 'dying-spark'
  if (score >= 20) return 'cold-ash'
  return 'no-vitality'
}

function classifyRebirth(score: number): RenewingMeasure['rebirth'] {
  if (score >= 90) return 'glorious-rebirth'
  if (score >= 75) return 'successful-renewal'
  if (score >= 60) return 'proper-transform'
  if (score >= 40) return 'failed-metamorphosis'
  if (score >= 20) return 'stillborn'
  return 'no-rebirth'
}

function classifyAsh(score: number): RememberingMeasure['ash'] {
  if (score >= 90) return 'ancient-ashes'
  if (score >= 75) return 'wise-remains'
  if (score >= 60) return 'proper-memory'
  if (score >= 40) return 'fresh-smoke'
  if (score >= 20) return 'no-remains'
  return 'no-wisdom'
}

function classifyFlame(score: number): FocusingMeasure['flame'] {
  if (score >= 90) return 'laser-flame'
  if (score >= 75) return 'focused-fire'
  if (score >= 60) return 'proper-aim'
  if (score >= 40) return 'scattered-blaze'
  if (score >= 20) return 'wild-fire'
  return 'no-precision'
}

function classifyEmber(score: number): SurvivingMeasure['ember'] {
  if (score >= 90) return 'eternal-ember'
  if (score >= 75) return 'reluctant-spark'
  if (score >= 60) return 'proper-glow'
  if (score >= 40) return 'fading-coal'
  if (score >= 20) return 'dead-ash'
  return 'no-resilience'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): FeatherCondition {
  if (score >= 90) return 'phoenix-masterpiece'
  if (score >= 75) return 'reborn-glory'
  if (score >= 60) return 'proper-bird'
  if (score >= 40) return 'dying-flame'
  if (score >= 20) return 'cold-remains'
  return 'void'
}

/** @example classifyNestType(feathers) */
export function classifyNestType(feathers: RubyFeather[]): NestType {
  if (feathers.length === 0) return 'no-nest'
  const avg = feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length
  if (avg >= 90) return 'phoenix-nest'
  if (avg >= 75) return 'fire-perch'
  if (avg >= 60) return 'proper-roost'
  if (avg >= 40) return 'small-branch'
  if (avg >= 20) return 'cold-ground'
  return 'no-nest'
}

/** @example classifyNestCondition(avgVitality) */
export function classifyNestCondition(avgVitality: number): NestCondition {
  if (avgVitality >= 85) return 'blazing-aerie'
  if (avgVitality >= 70) return 'fire-nest'
  if (avgVitality >= 55) return 'proper-perch'
  if (avgVitality >= 35) return 'dying-branch'
  if (avgVitality >= 15) return 'cold-ground'
  return 'void'
}

/** @example classifyPhoenixGrade(80) */
export function classifyPhoenixGrade(avgInferno: number): PhoenixGrade {
  if (avgInferno >= 80) return 'phoenix-lord'
  if (avgInferno >= 65) return 'fire-reborn'
  if (avgInferno >= 50) return 'ember-keeper'
  if (avgInferno >= 35) return 'apprentice'
  if (avgInferno >= 20) return 'novice'
  return 'ash-scatterer'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeRubyFeather(content, 'app.ts') */
export function analyzeRubyFeather(content: string, filePath: string): RubyFeather {
  const blazing = measureBlazing(content)
  const renewing = measureRenewing(content)
  const remembering = measureRemembering(content)
  const focusing = measureFocusing(content)
  const surviving = measureSurviving(content)

  const crimsonVitality = blazing.vitality
  const rebirthQuality = renewing.quality
  const ashWisdom = remembering.wisdom
  const flamePrecision = focusing.precision
  const emberResilience = surviving.resilience

  const qualityScore = Math.round(
    crimsonVitality * 0.2 +
    rebirthQuality * 0.2 +
    ashWisdom * 0.2 +
    flamePrecision * 0.2 +
    emberResilience * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    crimsonVitality,
    rebirthQuality,
    ashWisdom,
    flamePrecision,
    emberResilience,
    blazing,
    renewing,
    remembering,
    focusing,
    surviving,
    condition,
    qualityScore,
  }
}

/** @example analyzeRubyNest(feathers, 'src') */
export function analyzeRubyNest(feathers: RubyFeather[], dirPath: string): RubyNest {
  if (feathers.length === 0) {
    return {
      directory: dirPath,
      feathers: [],
      avgVitality: 0,
      avgPrecision: 0,
      avgResilience: 0,
      phoenixMasterpieceCount: 0,
      voidCount: 0,
      nestType: 'no-nest',
      condition: 'void',
    }
  }

  const avgVitality = Math.round(
    feathers.reduce((s, f) => s + f.crimsonVitality, 0) / feathers.length,
  )
  const avgPrecision = Math.round(
    feathers.reduce((s, f) => s + f.flamePrecision, 0) / feathers.length,
  )
  const avgResilience = Math.round(
    feathers.reduce((s, f) => s + f.emberResilience, 0) / feathers.length,
  )

  const phoenixMasterpieceCount = feathers.filter(
    (f) => f.condition === 'phoenix-masterpiece',
  ).length
  const voidCount = feathers.filter((f) => f.condition === 'void').length

  const nestType = classifyNestType(feathers)
  const avgQuality = Math.round(
    feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length,
  )
  const condition = classifyNestCondition(avgQuality)

  return {
    directory: dirPath,
    feathers,
    avgVitality,
    avgPrecision,
    avgResilience,
    phoenixMasterpieceCount,
    voidCount,
    nestType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildRubyPhoenixResult(['a.ts'], [content]) */
export async function buildRubyPhoenixResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyPhoenixResult> {
  const feathers: RubyFeather[] = files.map((file, i) =>
    analyzeRubyFeather(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, RubyFeather[]>()
  for (const feather of feathers) {
    const dir = feather.file.includes('/')
      ? feather.file.substring(0, feather.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(feather)
    } else {
      dirMap.set(dir, [feather])
    }
  }

  const nests: RubyNest[] = Array.from(dirMap.entries()).map(([dir, dirFeathers]) =>
    analyzeRubyNest(dirFeathers, dir),
  )

  const avgVitality =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.crimsonVitality, 0) / feathers.length)
      : 0
  const avgPrecision =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.flamePrecision, 0) / feathers.length)
      : 0
  const avgResilience =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.emberResilience, 0) / feathers.length)
      : 0

  const overallInferno =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length)
      : 0
  const isPhoenix = overallInferno >= 60

  const blaze = { avgVitality, avgPrecision, avgResilience, isPhoenix, overallInferno }

  const avgRebirthQuality =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.rebirthQuality, 0) / feathers.length)
      : 0
  const avgAshWisdom =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.ashWisdom, 0) / feathers.length)
      : 0
  const avgEmberResilience = avgResilience

  const phoenixMasterpieceCount = feathers.filter(
    (f) => f.condition === 'phoenix-masterpiece',
  ).length
  const rebornGloryCount = feathers.filter((f) => f.condition === 'reborn-glory').length
  const properBirdCount = feathers.filter((f) => f.condition === 'proper-bird').length
  const dyingFlameCount = feathers.filter((f) => f.condition === 'dying-flame').length
  const coldRemainsCount = feathers.filter((f) => f.condition === 'cold-remains').length
  const voidCount = feathers.filter((f) => f.condition === 'void').length

  const hasHighVitalityCount = feathers.filter((f) => f.blazing.hasHighVitality).length
  const hasHighQualityCount = feathers.filter((f) => f.renewing.hasHighQuality).length
  const hasHighWisdomCount = feathers.filter((f) => f.remembering.hasHighWisdom).length
  const hasHighPrecisionCount = feathers.filter((f) => f.focusing.hasHighPrecision).length
  const hasHighResilienceCount = feathers.filter((f) => f.surviving.hasHighResilience).length

  const phoenixGrade = classifyPhoenixGrade(overallInferno)

  const bestFeather = feathers.length > 0
    ? feathers.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file
    : ''
  const mostVital = feathers.length > 0
    ? feathers.reduce((best, f) => (f.crimsonVitality > best.crimsonVitality ? f : best)).file
    : ''
  const mostReborn = feathers.length > 0
    ? feathers.reduce((best, f) => (f.rebirthQuality > best.rebirthQuality ? f : best)).file
    : ''
  const wisest = feathers.length > 0
    ? feathers.reduce((best, f) => (f.ashWisdom > best.ashWisdom ? f : best)).file
    : ''
  const mostPrecise = feathers.length > 0
    ? feathers.reduce((best, f) => (f.flamePrecision > best.flamePrecision ? f : best)).file
    : ''
  const mostResilient = feathers.length > 0
    ? feathers.reduce((best, f) => (f.emberResilience > best.emberResilience ? f : best)).file
    : ''

  const stats: RubyPhoenixStats = {
    totalFiles: files.length,
    totalNests: nests.length,
    avgCrimsonVitality: avgVitality,
    avgRebirthQuality,
    avgAshWisdom,
    avgFlamePrecision: avgPrecision,
    avgEmberResilience,
    phoenixMasterpieceCount,
    rebornGloryCount,
    properBirdCount,
    dyingFlameCount,
    coldRemainsCount,
    voidCount,
    hasHighVitalityCount,
    hasHighQualityCount,
    hasHighWisdomCount,
    hasHighPrecisionCount,
    hasHighResilienceCount,
    overallInferno,
    phoenixGrade,
    bestFeather,
    mostVital,
    mostReborn,
    wisest,
    mostPrecise,
    mostResilient,
  }

  const recommendations = generateRecommendations(feathers, nests, blaze, stats)

  return { feathers, nests, blaze, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(feathers, nests, blaze, stats) */
export function generateRecommendations(
  feathers: RubyFeather[],
  nests: RubyNest[],
  _blaze: RubyPhoenixResult['blaze'],
  stats: RubyPhoenixStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrimsonVitality >= 90 &&
    stats.avgRebirthQuality >= 90 &&
    stats.avgAshWisdom >= 90 &&
    stats.avgFlamePrecision >= 90 &&
    stats.avgEmberResilience >= 90
  ) {
    recs.push(
      'Your ruby phoenix blazes with magnificent crimson fire! Every feather is a masterpiece of reborn glory',
    )
    return recs
  }

  if (stats.avgCrimsonVitality < 60) {
    recs.push(
      'Ignite crimson vitality — code should pulse with the living fire of the ruby phoenix',
    )
  }

  if (stats.avgRebirthQuality < 60) {
    recs.push(
      'Improve rebirth quality — code must transform and renew like the phoenix rising from ashes',
    )
  }

  if (stats.avgAshWisdom < 60) {
    recs.push(
      'Gather ash wisdom — code should carry the lessons of past iterations like ancient ashes',
    )
  }

  if (stats.avgFlamePrecision < 60) {
    recs.push(
      'Sharpen flame precision — code must execute with the focused intensity of laser fire',
    )
  }

  if (stats.avgEmberResilience < 60) {
    recs.push(
      'Strengthen ember resilience — code must carry the spark of reignition through any failure',
    )
  }

  if (stats.overallInferno < 40) {
    recs.push(
      'The phoenix flame has dimmed — focus on reigniting the fire before it goes cold',
    )
  }

  const voidFeathers = feathers.filter((f) => f.condition === 'void')
  if (voidFeathers.length > 0 && voidFeathers.length <= 5) {
    recs.push(
      `Reignite these cold feathers: ${voidFeathers.map((f) => f.file).join(', ')}`,
    )
  } else if (voidFeathers.length > 5) {
    recs.push(
      `Reignite these ${voidFeathers.length} cold feathers before the nest freezes`,
    )
  }

  const poorNests = nests.filter(
    (n) => n.condition === 'void' || n.condition === 'dying-branch',
  )
  if (poorNests.length === nests.length && nests.length > 0) {
    recs.push(
      'All nests show signs of dying flames — consider a comprehensive phoenix rebirth for the codebase',
    )
  }

  if (recs.length === 0) {
    recs.push('Your ruby phoenix flies strong — keep soaring on wings of crimson fire')
  }

  return recs
}
