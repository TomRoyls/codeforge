// ─── Interfaces ──────────────────────────────────────────

export interface PreservingMeasure {
  warmth: number
  amber: 'golden-preserve' | 'warm-fossil' | 'proper-resin' | 'cool-stone' | 'ice-cold' | 'no-warmth'
  hasHighWarmth: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasInviting: boolean
  hasWelcoming: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasWarm: boolean
  hasGentle: boolean
  hasForgiving: boolean
  hasPatient: boolean
  hasKind: boolean
  hostileCount: number
  undocumentedCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  glow: 'golden-radiance' | 'warm-glow' | 'proper-light' | 'dim-flicker' | 'dark' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasIlluminated: boolean
  hasRevealed: boolean
  hasLuminous: boolean
  hasRadiant: boolean
  hasWarm: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface PersistingMeasure {
  persistence: number
  fire: 'eternal-flame' | 'steady-burn' | 'proper-fire' | 'flickering' | 'dying-ember' | 'no-persistence'
  hasHighPersistence: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasConsistent: boolean
  hasEnduring: boolean
  hasReliable: boolean
  hasMaintained: boolean
  hasProven: boolean
  hasDurable: boolean
  hasLasting: boolean
  hasPersistent: boolean
  hasSteadfast: boolean
  hasResolute: boolean
  hasPerpetual: boolean
  volatileCount: number
  untestedCount: number
}

export interface LearningMeasure {
  wisdom: number
  ash: 'ancient-cinders' | 'wise-remnants' | 'proper-ash' | 'scattered-soot' | 'burned-nothing' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasEvolved: boolean
  hasReflective: boolean
  hasExperienced: boolean
  hasLearned: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hasHistorical: boolean
  hackedCount: number
  shallowCount: number
}

export interface BindingMeasure {
  strength: number
  resin: 'fossil-resin' | 'strong-adhesive' | 'proper-binder' | 'weak-glue' | 'dust' | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasConnected: boolean
  hasIntegrated: boolean
  hasCohesive: boolean
  hasUnified: boolean
  hasOrganized: boolean
  hasLinked: boolean
  hasBound: boolean
  hasCoupled: boolean
  hasAttached: boolean
  hasJoined: boolean
  hasFused: boolean
  chaoticCount: number
  monolithicCount: number
}

export type AmberCondition =
  | 'amber-masterpiece'
  | 'golden-blaze'
  | 'proper-fossil'
  | 'cool-stone'
  | 'dust'
  | 'void'

export interface AmberEmber {
  file: string
  preservationWarmth: number
  glowClarity: number
  firePersistence: number
  ashWisdom: number
  resinStrength: number
  preserving: PreservingMeasure
  illuminating: IlluminatingMeasure
  persisting: PersistingMeasure
  learning: LearningMeasure
  binding: BindingMeasure
  condition: AmberCondition
  qualityScore: number
}

export type HearthType =
  | 'grand-fireplace'
  | 'amber-hearth'
  | 'proper-firepit'
  | 'candle'
  | 'no-heat'
  | 'no-hearth'

export type HearthCondition =
  | 'amber-sanctuary'
  | 'warm-cabin'
  | 'proper-room'
  | 'cold-cave'
  | 'empty-space'
  | 'void'

export interface AmberHearth {
  directory: string
  embers: AmberEmber[]
  avgWarmth: number
  avgPersistence: number
  avgWisdom: number
  amberMasterpieceCount: number
  voidCount: number
  hearthType: HearthType
  condition: HearthCondition
}

export type FirekeeperGrade = 'master-firekeeper' | 'amber-guardian' | 'proper-tender' | 'apprentice' | 'novice' | 'ice-walker'

export interface AmberBlazeResult {
  embers: AmberEmber[]
  hearths: AmberHearth[]
  fire: {
    avgWarmth: number
    avgPersistence: number
    avgWisdom: number
    isAmber: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalHearths: number
    avgPreservationWarmth: number
    avgGlowClarity: number
    avgFirePersistence: number
    avgAshWisdom: number
    avgResinStrength: number
    amberMasterpieceCount: number
    goldenBlazeCount: number
    properFossilCount: number
    coolStoneCount: number
    dustCount: number
    voidCount: number
    hasHighWarmthCount: number
    hasHighClarityCount: number
    hasHighPersistenceCount: number
    hasHighWisdomCount: number
    hasHighStrengthCount: number
    overallRadiance: number
    firekeeperGrade: FirekeeperGrade
    bestEmber: string
    warmest: string
    clearest: string
    mostPersistent: string
    wisest: string
    strongest: string
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

/** @example classifyAmberCondition(90) */
export function classifyAmberCondition(score: number): AmberCondition {
  if (score >= 90) return 'amber-masterpiece'
  if (score >= 75) return 'golden-blaze'
  if (score >= 60) return 'proper-fossil'
  if (score >= 40) return 'cool-stone'
  if (score >= 20) return 'dust'
  return 'void'
}

/** @example classifyHearthType(embers) */
export function classifyHearthType(embers: AmberEmber[]): HearthType {
  if (embers.length === 0) return 'no-hearth'
  const avg = embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length
  if (avg >= 85) return 'grand-fireplace'
  if (avg >= 70) return 'amber-hearth'
  if (avg >= 55) return 'proper-firepit'
  if (avg >= 35) return 'candle'
  return 'no-heat'
}

/** @example classifyHearthCondition(85) */
export function classifyHearthCondition(score: number): HearthCondition {
  if (score >= 85) return 'amber-sanctuary'
  if (score >= 70) return 'warm-cabin'
  if (score >= 55) return 'proper-room'
  if (score >= 35) return 'cold-cave'
  if (score >= 15) return 'empty-space'
  return 'void'
}

/** @example classifyFirekeeperGrade(80) */
export function classifyFirekeeperGrade(avgRadiance: number): FirekeeperGrade {
  if (avgRadiance >= 80) return 'master-firekeeper'
  if (avgRadiance >= 65) return 'amber-guardian'
  if (avgRadiance >= 50) return 'proper-tender'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'ice-walker'
}

// ─── Measure functions ──────────────────────────────────

/** @example measurePreserving('class X { readonly y: string }') */
export function measurePreserving(content: string): PreservingMeasure {
  const hasApproachable = /\b(class|interface|type)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|violent)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasInviting = /\b(import|export)\b/.test(content)
  const hasWelcoming = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = 0
  const hasNoUndocumented = true
  const hasWarm = /\b(readonly|private|protected)\b/.test(content)
  const hasGentle = /\b(const|readonly)\b/.test(content)
  const hasForgiving = !/\bany\b/.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasKind = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasApproachable, hasNoHostile, hasReadable, hasNoCryptic, hasErrorHandled,
    hasNoUnhandled, hasInviting, hasWelcoming, hasDocumented, hasNoUndocumented,
    hasWarm, hasGentle, hasForgiving, hasPatient, hasKind,
  ]

  const warmth = computeScore(positiveBooleans)
  const hasHighWarmth = warmth >= 60

  let amber: PreservingMeasure['amber'] = 'no-warmth'
  if (warmth >= 90) amber = 'golden-preserve'
  else if (warmth >= 75) amber = 'warm-fossil'
  else if (warmth >= 60) amber = 'proper-resin'
  else if (warmth >= 40) amber = 'cool-stone'
  else if (warmth >= 20) amber = 'ice-cold'

  return {
    warmth, amber, hasHighWarmth,
    hasApproachable, hasNoHostile, hasReadable, hasNoCryptic, hasErrorHandled,
    hasNoUnhandled, hasInviting, hasWelcoming, hasDocumented, hasNoUndocumented,
    hasWarm, hasGentle, hasForgiving, hasPatient, hasKind,
    hostileCount, undocumentedCount,
  }
}

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = /\/\*\*[\s\S]*?\*\//.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasRevealed = /\b(try|catch|if)\b/.test(content)
  const hasLuminous = /\b(const|readonly)\b/.test(content)
  const hasRadiant = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasWarm = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasIlluminated, hasRevealed, hasLuminous, hasRadiant, hasWarm,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let glow: IlluminatingMeasure['glow'] = 'no-clarity'
  if (clarity >= 90) glow = 'golden-radiance'
  else if (clarity >= 75) glow = 'warm-glow'
  else if (clarity >= 60) glow = 'proper-light'
  else if (clarity >= 40) glow = 'dim-flicker'
  else if (clarity >= 20) glow = 'dark'

  return {
    clarity, glow, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasIlluminated, hasRevealed, hasLuminous, hasRadiant, hasWarm,
    crypticCount, obfuscatedCount,
  }
}

/** @example measurePersisting('try { x } catch { y }') */
export function measurePersisting(content: string): PersistingMeasure {
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = !/\bany\b/.test(content)
  const hasReliable = /\b(readonly|private|protected)\b/.test(content)
  const hasMaintained = /\b(import|export)\b/.test(content)
  const hasProven = /\b(class|interface|type)\b/.test(content)
  const hasDurable = /\b(async|await|Promise)\b/.test(content)
  const hasLasting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPersistent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSteadfast = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasResolute = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPerpetual = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasStable, hasNoVolatile, hasTested, hasNoUntested, hasConsistent,
    hasEnduring, hasReliable, hasMaintained, hasProven, hasDurable,
    hasLasting, hasPersistent, hasSteadfast, hasResolute, hasPerpetual,
  ]

  const persistence = computeScore(positiveBooleans)
  const hasHighPersistence = persistence >= 60

  let fire: PersistingMeasure['fire'] = 'no-persistence'
  if (persistence >= 90) fire = 'eternal-flame'
  else if (persistence >= 75) fire = 'steady-burn'
  else if (persistence >= 60) fire = 'proper-fire'
  else if (persistence >= 40) fire = 'flickering'
  else if (persistence >= 20) fire = 'dying-ember'

  return {
    persistence, fire, hasHighPersistence,
    hasStable, hasNoVolatile, hasTested, hasNoUntested, hasConsistent,
    hasEnduring, hasReliable, hasMaintained, hasProven, hasDurable,
    hasLasting, hasPersistent, hasSteadfast, hasResolute, hasPerpetual,
    volatileCount, untestedCount,
  }
}

/** @example measureLearning('export class X { readonly y: string }') */
export function measureLearning(content: string): LearningMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasMature = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\b(readonly|private|protected)\b/.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasReflective = /\b(function|=>|return)\b/.test(content)
  const hasExperienced = /\b(const|readonly)\b/.test(content)
  const hasLearned = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAccumulated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasHistorical = /\b(throw|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasStrategic, hasInsightful, hasEvolved, hasReflective,
    hasExperienced, hasLearned, hasWise, hasAccumulated, hasHistorical,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let ash: LearningMeasure['ash'] = 'no-wisdom'
  if (wisdom >= 90) ash = 'ancient-cinders'
  else if (wisdom >= 75) ash = 'wise-remnants'
  else if (wisdom >= 60) ash = 'proper-ash'
  else if (wisdom >= 40) ash = 'scattered-soot'
  else if (wisdom >= 20) ash = 'burned-nothing'

  return {
    wisdom, ash, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasStrategic, hasInsightful, hasEvolved, hasReflective,
    hasExperienced, hasLearned, hasWise, hasAccumulated, hasHistorical,
    hackedCount, shallowCount,
  }
}

/** @example measureBinding('import { X } from "y"') */
export function measureBinding(content: string): BindingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasConnected = /\b(readonly|private|protected)\b/.test(content)
  const hasIntegrated = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasCohesive = /\b(async|await|Promise)\b/.test(content)
  const hasUnified = !/\bany\b/.test(content)
  const hasOrganized = /\b(function|=>|return)\b/.test(content)
  const hasLinked = /\b(try|catch|if)\b/.test(content)
  const hasBound = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCoupled = /\b(const|readonly)\b/.test(content)
  const hasAttached = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasJoined = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFused = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasConnected,
    hasIntegrated, hasCohesive, hasUnified, hasOrganized, hasLinked,
    hasBound, hasCoupled, hasAttached, hasJoined, hasFused,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let resin: BindingMeasure['resin'] = 'no-strength'
  if (strength >= 90) resin = 'fossil-resin'
  else if (strength >= 75) resin = 'strong-adhesive'
  else if (strength >= 60) resin = 'proper-binder'
  else if (strength >= 40) resin = 'weak-glue'
  else if (strength >= 20) resin = 'dust'

  return {
    strength, resin, hasHighStrength,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasConnected,
    hasIntegrated, hasCohesive, hasUnified, hasOrganized, hasLinked,
    hasBound, hasCoupled, hasAttached, hasJoined, hasFused,
    chaoticCount, monolithicCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAmberEmber(content, 'app.ts') */
export function analyzeAmberEmber(content: string, filePath: string): AmberEmber {
  const preserving = measurePreserving(content)
  const illuminating = measureIlluminating(content)
  const persisting = measurePersisting(content)
  const learning = measureLearning(content)
  const binding = measureBinding(content)

  const preservationWarmth = preserving.warmth
  const glowClarity = illuminating.clarity
  const firePersistence = persisting.persistence
  const ashWisdom = learning.wisdom
  const resinStrength = binding.strength

  const qualityScore = Math.round(
    preservationWarmth * 0.2 +
    glowClarity * 0.2 +
    firePersistence * 0.2 +
    ashWisdom * 0.2 +
    resinStrength * 0.2,
  )

  const condition = classifyAmberCondition(qualityScore)

  return {
    file: filePath,
    preservationWarmth, glowClarity, firePersistence, ashWisdom, resinStrength,
    preserving, illuminating, persisting, learning, binding,
    condition, qualityScore,
  }
}

/** @example analyzeAmberHearth(embers, 'src') */
export function analyzeAmberHearth(embers: AmberEmber[], dirPath: string): AmberHearth {
  if (embers.length === 0) {
    return {
      directory: dirPath, embers: [],
      avgWarmth: 0, avgPersistence: 0, avgWisdom: 0,
      amberMasterpieceCount: 0, voidCount: 0,
      hearthType: 'no-hearth', condition: 'void',
    }
  }

  const avgWarmth = Math.round(embers.reduce((s, e) => s + e.preservationWarmth, 0) / embers.length)
  const avgPersistence = Math.round(embers.reduce((s, e) => s + e.firePersistence, 0) / embers.length)
  const avgWisdom = Math.round(embers.reduce((s, e) => s + e.ashWisdom, 0) / embers.length)
  const amberMasterpieceCount = embers.filter((e) => e.condition === 'amber-masterpiece').length
  const voidCount = embers.filter((e) => e.condition === 'void').length
  const hearthType = classifyHearthType(embers)
  const avgQuality = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)
  const condition = classifyHearthCondition(avgQuality)

  return {
    directory: dirPath, embers,
    avgWarmth, avgPersistence, avgWisdom,
    amberMasterpieceCount, voidCount,
    hearthType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAmberBlazeResult(['a.ts'], [content]) */
export async function buildAmberBlazeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberBlazeResult> {
  const embers: AmberEmber[] = files.map((file, i) =>
    analyzeAmberEmber(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberEmber[]>()
  for (const ember of embers) {
    const dir = ember.file.includes('/')
      ? ember.file.substring(0, ember.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ember)
    } else {
      dirMap.set(dir, [ember])
    }
  }

  const hearths: AmberHearth[] = Array.from(dirMap.entries()).map(([dir, dirEmbers]) =>
    analyzeAmberHearth(dirEmbers, dir),
  )

  const avgPreservationWarmth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.preservationWarmth, 0) / embers.length) : 0
  const avgGlowClarity = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.glowClarity, 0) / embers.length) : 0
  const avgFirePersistence = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.firePersistence, 0) / embers.length) : 0
  const avgAshWisdom = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.ashWisdom, 0) / embers.length) : 0
  const avgResinStrength = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.resinStrength, 0) / embers.length) : 0

  const overallRadiance = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length) : 0
  const isAmber = overallRadiance >= 60

  const fire = { avgWarmth: avgPreservationWarmth, avgPersistence: avgFirePersistence, avgWisdom: avgAshWisdom, isAmber, overallRadiance }

  const amberMasterpieceCount = embers.filter((e) => e.condition === 'amber-masterpiece').length
  const goldenBlazeCount = embers.filter((e) => e.condition === 'golden-blaze').length
  const properFossilCount = embers.filter((e) => e.condition === 'proper-fossil').length
  const coolStoneCount = embers.filter((e) => e.condition === 'cool-stone').length
  const dustCount = embers.filter((e) => e.condition === 'dust').length
  const voidCount = embers.filter((e) => e.condition === 'void').length

  const hasHighWarmthCount = embers.filter((e) => e.preserving.hasHighWarmth).length
  const hasHighClarityCount = embers.filter((e) => e.illuminating.hasHighClarity).length
  const hasHighPersistenceCount = embers.filter((e) => e.persisting.hasHighPersistence).length
  const hasHighWisdomCount = embers.filter((e) => e.learning.hasHighWisdom).length
  const hasHighStrengthCount = embers.filter((e) => e.binding.hasHighStrength).length

  const firekeeperGrade = classifyFirekeeperGrade(overallRadiance)

  const bestEmber = embers.length > 0
    ? embers.reduce((best, e) => (e.qualityScore > best.qualityScore ? e : best)).file : ''
  const warmest = embers.length > 0
    ? embers.reduce((best, e) => (e.preservationWarmth > best.preservationWarmth ? e : best)).file : ''
  const clearest = embers.length > 0
    ? embers.reduce((best, e) => (e.glowClarity > best.glowClarity ? e : best)).file : ''
  const mostPersistent = embers.length > 0
    ? embers.reduce((best, e) => (e.firePersistence > best.firePersistence ? e : best)).file : ''
  const wisest = embers.length > 0
    ? embers.reduce((best, e) => (e.ashWisdom > best.ashWisdom ? e : best)).file : ''
  const strongest = embers.length > 0
    ? embers.reduce((best, e) => (e.resinStrength > best.resinStrength ? e : best)).file : ''

  const stats: AmberBlazeResult['stats'] = {
    totalFiles: files.length, totalHearths: hearths.length,
    avgPreservationWarmth, avgGlowClarity, avgFirePersistence, avgAshWisdom, avgResinStrength,
    amberMasterpieceCount, goldenBlazeCount, properFossilCount, coolStoneCount, dustCount, voidCount,
    hasHighWarmthCount, hasHighClarityCount, hasHighPersistenceCount, hasHighWisdomCount, hasHighStrengthCount,
    overallRadiance, firekeeperGrade,
    bestEmber, warmest, clearest, mostPersistent, wisest, strongest,
  }

  const recommendations = generateRecommendations(embers, hearths, fire, stats)

  return { embers, hearths, fire, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(embers, hearths, fire, stats) */
export function generateRecommendations(
  embers: AmberEmber[],
  hearths: AmberHearth[],
  _fire: AmberBlazeResult['fire'],
  stats: AmberBlazeResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPreservationWarmth >= 90 &&
    stats.avgGlowClarity >= 90 &&
    stats.avgFirePersistence >= 90 &&
    stats.avgAshWisdom >= 90 &&
    stats.avgResinStrength >= 90
  ) {
    recs.push(
      'Your amber blaze is a masterpiece of radiance! Every ember combines preservation warmth, glow clarity, fire persistence, ash wisdom, and resin strength into a blaze worthy of eternal preservation!',
    )
    return recs
  }

  if (stats.avgPreservationWarmth < 60) {
    recs.push(
      'Warm the preservation — amber preserves and warms simultaneously; your code should be approachable, documented, and forgiving to work with',
    )
  }

  if (stats.avgGlowClarity < 60) {
    recs.push(
      'Brighten the glow clarity — amber glows with inner light; your code should be transparent, readable, and luminous in its understanding',
    )
  }

  if (stats.avgFirePersistence < 60) {
    recs.push(
      'Strengthen fire persistence — amber survived millions of years; your code should be stable, tested, and enduring through cycles of change',
    )
  }

  if (stats.avgAshWisdom < 60) {
    recs.push(
      'Grow ash wisdom — after amber burns, the ash carries chemical wisdom; your code should be well-architected, principled, and learned from experience',
    )
  }

  if (stats.avgResinStrength < 60) {
    recs.push(
      'Fortify resin strength — resin is nature\'s adhesive; your code should be well-structured, modular, and bound together cohesively',
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The amber fire has gone out — only cold dust remains where once there was warmth and light',
    )
  }

  const voidEmbers = embers.filter((e) => e.condition === 'void')
  if (voidEmbers.length > 0 && voidEmbers.length <= 5) {
    recs.push(`Rekindle these cold stones: ${voidEmbers.map((e) => e.file).join(', ')}`)
  } else if (voidEmbers.length > 5) {
    recs.push(`Rekindle ${voidEmbers.length} cold stones before the hearth goes dark entirely`)
  }

  const poorHearths = hearths.filter((h) => h.condition === 'void' || h.condition === 'empty-space')
  if (poorHearths.length === hearths.length && hearths.length > 0) {
    recs.push('All hearths have gone cold — the amber blaze needs a complete restoration from spark to sanctuary')
  }

  if (recs.length === 0) {
    recs.push('Your amber blaze radiates warmth — each ember combines preservation warmth, glow clarity, fire persistence, ash wisdom, and resin strength')
  }

  return recs
}
