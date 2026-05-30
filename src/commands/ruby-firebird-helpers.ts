// ─── Interfaces ──────────────────────────────────────────

export interface PulsingMeasure {
  vitality: number
  flame: 'eternal-flame' | 'burning-heart' | 'proper-fire' | 'dying-ember' | 'cold-ash' | 'no-vitality'
  hasHighVitality: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasAlive: boolean
  hasEnergetic: boolean
  hasDynamic: boolean
  hasVibrant: boolean
  hasThriving: boolean
  hasActive: boolean
  hasPulsing: boolean
  hasGrowing: boolean
  hasVigorous: boolean
  hasRobust: boolean
  hasStrong: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface RegeneratingMeasure {
  quality: number
  rebirth: 'perfect-rebirth' | 'clean-renewal' | 'proper-rebuild' | 'hasty-patch' | 'failed-revival' | 'no-rebirth'
  hasHighQuality: boolean
  hasModular: boolean
  hasNoTangled: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasRefactorable: boolean
  hasClean: boolean
  hasDecoupled: boolean
  hasOrganized: boolean
  hasMaintainable: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasRenewable: boolean
  hasTransformable: boolean
  hasResilient: boolean
  hasEvolving: boolean
  tangledCount: number
  rigidCount: number
}

export interface LearningMeasure {
  wisdom: number
  ash: 'phoenix-memory' | 'ancient-cinders' | 'proper-remnants' | 'scattered-soot' | 'burned-to-nothing' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasProven: boolean
  hasDeep: boolean
  hasTested: boolean
  hasDocumented: boolean
  hasPrincipled: boolean
  hasMature: boolean
  hasExperienced: boolean
  hasInsightful: boolean
  hasReflective: boolean
  hasEvolved: boolean
  hasLearned: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hackedCount: number
  untestedCount: number
}

export interface BurningMeasure {
  precision: number
  blade: 'surgical-flame' | 'laser-heat' | 'proper-temper' | 'wildfire' | 'match-flame' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasTargeted: boolean
  hasFocused: boolean
  hasControlled: boolean
  unsafeCount: number
  approximateCount: number
}

export interface EnduringMeasure {
  resilience: number
  ember: 'eternal-ember' | 'glowing-core' | 'proper-coals' | 'cooling-cinder' | 'dead-ash' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasEnduring: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasSurviving: boolean
  hasPersistent: boolean
  hasUnyielding: boolean
  hasPatient: boolean
  hasResolute: boolean
  hasSteadfast: boolean
  hasIndomitable: boolean
  unhandledCount: number
  vulnerableCount: number
}

export type FeatherCondition =
  | 'ruby-masterpiece'
  | 'phoenix-crown'
  | 'proper-flame'
  | 'dying-spark'
  | 'cold-ash'
  | 'void'

export interface RubyFeather {
  file: string
  crimsonVitality: number
  rebirthQuality: number
  ashWisdom: number
  flamePrecision: number
  emberResilience: number
  pulsing: PulsingMeasure
  regenerating: RegeneratingMeasure
  learning: LearningMeasure
  burning: BurningMeasure
  enduring: EnduringMeasure
  condition: FeatherCondition
  qualityScore: number
}

export type NestType =
  | 'phoenix-nest'
  | 'ruby-perch'
  | 'proper-eyrie'
  | 'birdhouse'
  | 'ground-nest'
  | 'no-nest'

export type NestCondition =
  | 'fire-palace'
  | 'ember-throne'
  | 'proper-roost'
  | 'charred-branch'
  | 'empty-cage'
  | 'void'

export interface RubyNest {
  directory: string
  feathers: RubyFeather[]
  avgVitality: number
  avgPrecision: number
  avgWisdom: number
  rubyMasterpieceCount: number
  voidCount: number
  nestType: NestType
  condition: NestCondition
}

export interface RubyFirebirdResult {
  feathers: RubyFeather[]
  nests: RubyNest[]
  flame: {
    avgVitality: number
    avgPrecision: number
    avgWisdom: number
    isRuby: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalNests: number
    avgCrimsonVitality: number
    avgRebirthQuality: number
    avgAshWisdom: number
    avgFlamePrecision: number
    avgEmberResilience: number
    rubyMasterpieceCount: number
    phoenixCrownCount: number
    properFlameCount: number
    dyingSparkCount: number
    coldAshCount: number
    voidCount: number
    hasHighVitalityCount: number
    hasHighQualityCount: number
    hasHighWisdomCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    overallBrilliance: number
    firebirdGrade: 'phoenix-lord' | 'fire-mage' | 'flame-keeper' | 'apprentice' | 'novice' | 'smoke-watcher'
    bestFeather: string
    mostVital: string
    mostRenewable: string
    wisest: string
    mostPrecise: string
    mostResilient: string
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

/** @example classifyFeatherCondition(90) */
export function classifyFeatherCondition(score: number): FeatherCondition {
  if (score >= 90) return 'ruby-masterpiece'
  if (score >= 75) return 'phoenix-crown'
  if (score >= 60) return 'proper-flame'
  if (score >= 40) return 'dying-spark'
  if (score >= 20) return 'cold-ash'
  return 'void'
}

/** @example classifyNestType(feathers) */
export function classifyNestType(feathers: RubyFeather[]): NestType {
  if (feathers.length === 0) return 'no-nest'
  const avg =
    feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length
  if (avg >= 85) return 'phoenix-nest'
  if (avg >= 70) return 'ruby-perch'
  if (avg >= 55) return 'proper-eyrie'
  if (avg >= 35) return 'birdhouse'
  return 'ground-nest'
}

/** @example classifyNestCondition(85) */
export function classifyNestCondition(score: number): NestCondition {
  if (score >= 85) return 'fire-palace'
  if (score >= 70) return 'ember-throne'
  if (score >= 55) return 'proper-roost'
  if (score >= 35) return 'charred-branch'
  if (score >= 15) return 'empty-cage'
  return 'void'
}

/** @example classifyFirebirdGrade(80) */
export function classifyFirebirdGrade(
  avgBrilliance: number,
): RubyFirebirdResult['stats']['firebirdGrade'] {
  if (avgBrilliance >= 80) return 'phoenix-lord'
  if (avgBrilliance >= 65) return 'fire-mage'
  if (avgBrilliance >= 50) return 'flame-keeper'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'smoke-watcher'
}

// ─── Measure functions ──────────────────────────────────

/** @example measurePulsing('class X { readonly y: string }') */
export function measurePulsing(content: string): PulsingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasAlive = /\b(function|=>|return)\b/.test(content)
  const hasEnergetic = /\b(async|await|Promise)\b/.test(content)
  const hasDynamic = /\b(try|catch|if)\b/.test(content)
  const hasVibrant = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasThriving = !/\bany\b/.test(content)
  const hasActive = /\b(readonly|private|protected)\b/.test(content)
  const hasPulsing = /\b(readonly|as const)\b/.test(content)
  const hasGrowing = /\b(export|public)\b/.test(content)
  const hasVigorous = /\b(return|throw)\b/.test(content)
  const hasRobust = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrong = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasAlive,
    hasEnergetic,
    hasDynamic,
    hasVibrant,
    hasThriving,
    hasActive,
    hasPulsing,
    hasGrowing,
    hasVigorous,
    hasRobust,
    hasStrong,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let flame: PulsingMeasure['flame'] = 'no-vitality'
  if (vitality >= 90) flame = 'eternal-flame'
  else if (vitality >= 75) flame = 'burning-heart'
  else if (vitality >= 60) flame = 'proper-fire'
  else if (vitality >= 40) flame = 'dying-ember'
  else if (vitality >= 20) flame = 'cold-ash'

  return {
    vitality,
    flame,
    hasHighVitality,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasAlive,
    hasEnergetic,
    hasDynamic,
    hasVibrant,
    hasThriving,
    hasActive,
    hasPulsing,
    hasGrowing,
    hasVigorous,
    hasRobust,
    hasStrong,
    chaoticCount,
    monolithicCount,
  }
}

/** @example measureRegenerating('export interface X { readonly y: string }') */
export function measureRegenerating(content: string): RegeneratingMeasure {
  const hasModular = /\b(import|export)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|coupled)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasExtensible = /\b(class|interface|type)\b/.test(content)
  const rigidCount = (content.match(/\b(hardcoded|rigid|inflexible)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasRefactorable = !/\bany\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDecoupled = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasMaintainable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAdaptable = /\b(async|await|Promise)\b/.test(content)
  const hasFlexible = /\b(function|=>|return)\b/.test(content)
  const hasRenewable = /\b(readonly|as const)\b/.test(content)
  const hasTransformable = /\b(try|catch|if)\b/.test(content)
  const hasResilient = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEvolving = /\b(export|public)\b/.test(content)

  const positiveBooleans = [
    hasModular,
    hasNoTangled,
    hasExtensible,
    hasNoRigid,
    hasRefactorable,
    hasClean,
    hasDecoupled,
    hasOrganized,
    hasMaintainable,
    hasAdaptable,
    hasFlexible,
    hasRenewable,
    hasTransformable,
    hasResilient,
    hasEvolving,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60

  let rebirth: RegeneratingMeasure['rebirth'] = 'no-rebirth'
  if (quality >= 90) rebirth = 'perfect-rebirth'
  else if (quality >= 75) rebirth = 'clean-renewal'
  else if (quality >= 60) rebirth = 'proper-rebuild'
  else if (quality >= 40) rebirth = 'hasty-patch'
  else if (quality >= 20) rebirth = 'failed-revival'

  return {
    quality,
    rebirth,
    hasHighQuality,
    hasModular,
    hasNoTangled,
    hasExtensible,
    hasNoRigid,
    hasRefactorable,
    hasClean,
    hasDecoupled,
    hasOrganized,
    hasMaintainable,
    hasAdaptable,
    hasFlexible,
    hasRenewable,
    hasTransformable,
    hasResilient,
    hasEvolving,
    tangledCount,
    rigidCount,
  }
}

/** @example measureLearning('try { x() } catch { y() }') */
export function measureLearning(content: string): LearningMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasProven = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasDocumented = /\b(import|export)\b/.test(content)
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = !/\bany\b/.test(content)
  const hasExperienced = /\b(async|await|Promise)\b/.test(content)
  const hasInsightful = /\b(return|throw)\b/.test(content)
  const hasReflective = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasEvolved = /\b(readonly|as const)\b/.test(content)
  const hasLearned = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasWise = /\b(function|=>)\b/.test(content)
  const hasAccumulated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasProven,
    hasDeep,
    hasTested,
    hasDocumented,
    hasPrincipled,
    hasMature,
    hasExperienced,
    hasInsightful,
    hasReflective,
    hasEvolved,
    hasLearned,
    hasWise,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let ash: LearningMeasure['ash'] = 'no-wisdom'
  if (wisdom >= 90) ash = 'phoenix-memory'
  else if (wisdom >= 75) ash = 'ancient-cinders'
  else if (wisdom >= 60) ash = 'proper-remnants'
  else if (wisdom >= 40) ash = 'scattered-soot'
  else if (wisdom >= 20) ash = 'burned-to-nothing'

  return {
    wisdom,
    ash,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasProven,
    hasDeep,
    hasTested,
    hasDocumented,
    hasPrincipled,
    hasMature,
    hasExperienced,
    hasInsightful,
    hasReflective,
    hasEvolved,
    hasLearned,
    hasWise,
    hasAccumulated,
    hackedCount,
    untestedCount,
  }
}

/** @example measureBurning('const x: string = ""') */
export function measureBurning(content: string): BurningMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(readonly|as const)\b/.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(async|await|Promise)\b/.test(content)
  const hasCrisp = /\b(function|=>|return)\b/.test(content)
  const hasDefined = /\b(try|catch|if)\b/.test(content)
  const hasTargeted = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasFocused = !/\b(var|eval)\b/.test(content)
  const hasControlled = (content.match(/\b(dirty|hacky|gross)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasTargeted,
    hasFocused,
    hasControlled,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let blade: BurningMeasure['blade'] = 'no-precision'
  if (precision >= 90) blade = 'surgical-flame'
  else if (precision >= 75) blade = 'laser-heat'
  else if (precision >= 60) blade = 'proper-temper'
  else if (precision >= 40) blade = 'wildfire'
  else if (precision >= 20) blade = 'match-flame'

  return {
    precision,
    blade,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasTargeted,
    hasFocused,
    hasControlled,
    unsafeCount,
    approximateCount,
  }
}

/** @example measureEnduring('try { x() } catch { y() }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|throw)\b/.test(content)
  const unhandledCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|readonly|const)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasEnduring = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasReinforced = /\b(import|export)\b/.test(content)
  const hasSurviving = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPersistent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnyielding = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length === 0
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasResolute = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSteadfast = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const vulnerableCount = (content.match(/\b(weak|vulnerable|exposed)\b/gi) ?? []).length
  const hasIndomitable = vulnerableCount === 0

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasStable,
    hasEnduring,
    hasHardened,
    hasReinforced,
    hasSurviving,
    hasPersistent,
    hasUnyielding,
    hasPatient,
    hasResolute,
    hasSteadfast,
    hasIndomitable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let ember: EnduringMeasure['ember'] = 'no-resilience'
  if (resilience >= 90) ember = 'eternal-ember'
  else if (resilience >= 75) ember = 'glowing-core'
  else if (resilience >= 60) ember = 'proper-coals'
  else if (resilience >= 40) ember = 'cooling-cinder'
  else if (resilience >= 20) ember = 'dead-ash'

  return {
    resilience,
    ember,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasStable,
    hasEnduring,
    hasHardened,
    hasReinforced,
    hasSurviving,
    hasPersistent,
    hasUnyielding,
    hasPatient,
    hasResolute,
    hasSteadfast,
    hasIndomitable,
    unhandledCount,
    vulnerableCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeRubyFeather(content, 'app.ts') */
export function analyzeRubyFeather(content: string, filePath: string): RubyFeather {
  const pulsing = measurePulsing(content)
  const regenerating = measureRegenerating(content)
  const learning = measureLearning(content)
  const burning = measureBurning(content)
  const enduring = measureEnduring(content)

  const crimsonVitality = pulsing.vitality
  const rebirthQuality = regenerating.quality
  const ashWisdom = learning.wisdom
  const flamePrecision = burning.precision
  const emberResilience = enduring.resilience

  const qualityScore = Math.round(
    crimsonVitality * 0.2 +
    rebirthQuality * 0.2 +
    ashWisdom * 0.2 +
    flamePrecision * 0.2 +
    emberResilience * 0.2,
  )

  const condition = classifyFeatherCondition(qualityScore)

  return {
    file: filePath,
    crimsonVitality,
    rebirthQuality,
    ashWisdom,
    flamePrecision,
    emberResilience,
    pulsing,
    regenerating,
    learning,
    burning,
    enduring,
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
      avgWisdom: 0,
      rubyMasterpieceCount: 0,
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
  const avgWisdom = Math.round(
    feathers.reduce((s, f) => s + f.ashWisdom, 0) / feathers.length,
  )

  const rubyMasterpieceCount = feathers.filter(
    (f) => f.condition === 'ruby-masterpiece',
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
    avgWisdom,
    rubyMasterpieceCount,
    voidCount,
    nestType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildRubyFirebirdResult(['a.ts'], [content]) */
export async function buildRubyFirebirdResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyFirebirdResult> {
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
  const avgWisdom =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.ashWisdom, 0) / feathers.length)
      : 0

  const overallBrilliance =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length)
      : 0
  const isRuby = overallBrilliance >= 60

  const flame = { avgVitality, avgPrecision, avgWisdom, isRuby, overallBrilliance }

  const avgCrimsonVitality = avgVitality
  const avgRebirthQuality =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.rebirthQuality, 0) / feathers.length)
      : 0
  const avgAshWisdom = avgWisdom
  const avgFlamePrecision = avgPrecision
  const avgEmberResilience =
    feathers.length > 0
      ? Math.round(feathers.reduce((s, f) => s + f.emberResilience, 0) / feathers.length)
      : 0

  const rubyMasterpieceCount = feathers.filter(
    (f) => f.condition === 'ruby-masterpiece',
  ).length
  const phoenixCrownCount = feathers.filter(
    (f) => f.condition === 'phoenix-crown',
  ).length
  const properFlameCount = feathers.filter(
    (f) => f.condition === 'proper-flame',
  ).length
  const dyingSparkCount = feathers.filter(
    (f) => f.condition === 'dying-spark',
  ).length
  const coldAshCount = feathers.filter(
    (f) => f.condition === 'cold-ash',
  ).length
  const voidCount = feathers.filter((f) => f.condition === 'void').length

  const hasHighVitalityCount = feathers.filter(
    (f) => f.pulsing.hasHighVitality,
  ).length
  const hasHighQualityCount = feathers.filter(
    (f) => f.regenerating.hasHighQuality,
  ).length
  const hasHighWisdomCount = feathers.filter(
    (f) => f.learning.hasHighWisdom,
  ).length
  const hasHighPrecisionCount = feathers.filter(
    (f) => f.burning.hasHighPrecision,
  ).length
  const hasHighResilienceCount = feathers.filter(
    (f) => f.enduring.hasHighResilience,
  ).length

  const firebirdGrade = classifyFirebirdGrade(overallBrilliance)

  const bestFeather = feathers.length > 0
    ? feathers.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file
    : ''
  const mostVital = feathers.length > 0
    ? feathers.reduce((best, f) => (f.crimsonVitality > best.crimsonVitality ? f : best)).file
    : ''
  const mostRenewable = feathers.length > 0
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

  const stats: RubyFirebirdResult['stats'] = {
    totalFiles: files.length,
    totalNests: nests.length,
    avgCrimsonVitality,
    avgRebirthQuality,
    avgAshWisdom,
    avgFlamePrecision,
    avgEmberResilience,
    rubyMasterpieceCount,
    phoenixCrownCount,
    properFlameCount,
    dyingSparkCount,
    coldAshCount,
    voidCount,
    hasHighVitalityCount,
    hasHighQualityCount,
    hasHighWisdomCount,
    hasHighPrecisionCount,
    hasHighResilienceCount,
    overallBrilliance,
    firebirdGrade,
    bestFeather,
    mostVital,
    mostRenewable,
    wisest,
    mostPrecise,
    mostResilient,
  }

  const recommendations = generateRecommendations(feathers, nests, flame, stats)

  return { feathers, nests, flame, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(feathers, nests, flame, stats) */
export function generateRecommendations(
  feathers: RubyFeather[],
  nests: RubyNest[],
  _flame: RubyFirebirdResult['flame'],
  stats: RubyFirebirdResult['stats'],
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
      'Your ruby firebird blazes with immortal brilliance! Each feather combines the fire of renewal with the wisdom of ages!',
    )
    return recs
  }

  if (stats.avgCrimsonVitality < 60) {
    recs.push(
      'Ignite the crimson vitality — the phoenix burns brightest when its code is alive with energy and purpose',
    )
  }

  if (stats.avgRebirthQuality < 60) {
    recs.push(
      'Improve the rebirth quality — a phoenix is defined by its ability to be reborn; your code should be equally renewable',
    )
  }

  if (stats.avgAshWisdom < 60) {
    recs.push(
      'Gather the ash wisdom — from the ashes of failure comes knowledge; ensure your code learns from every mistake',
    )
  }

  if (stats.avgFlamePrecision < 60) {
    recs.push(
      'Sharpen the flame precision — a phoenix flame is surgical, not wild; your code must be exact even at peak intensity',
    )
  }

  if (stats.avgEmberResilience < 60) {
    recs.push(
      'Strengthen the ember resilience — embers outlast the fire; your code core must endure conditions that extinguish lesser flames',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The firebird has not yet sparked — until the first flame, no phoenix can rise',
    )
  }

  const voidFeathers = feathers.filter((f) => f.condition === 'void')
  if (voidFeathers.length > 0 && voidFeathers.length <= 5) {
    recs.push(
      `Re-examine these cold ashes: ${voidFeathers.map((f) => f.file).join(', ')}`,
    )
  } else if (voidFeathers.length > 5) {
    recs.push(
      `Re-examine these ${voidFeathers.length} cold ashes before the firebird dies entirely`,
    )
  }

  const poorNests = nests.filter(
    (n) => n.condition === 'void' || n.condition === 'empty-cage',
  )
  if (poorNests.length === nests.length && nests.length > 0) {
    recs.push(
      'All nests lie empty — the ruby firebird needs a complete reconstruction of its home',
    )
  }

  if (recs.length === 0) {
    recs.push('Your ruby firebird soars across the sky — each feather burns with the crimson fire of renewal and the gold of eternal wisdom')
  }

  return recs
}
