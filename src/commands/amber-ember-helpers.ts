// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Amber = 'golden-warmth' | 'warm-glow' | 'proper-heat' | 'cool-resin' | 'cold-stone' | 'no-warmth'
export type Glow = 'inner-radiance' | 'bright-glow' | 'proper-luster' | 'dim-light' | 'dark-resin' | 'no-glow'
export type Ember = 'eternal-ember' | 'long-burning' | 'proper-coal' | 'dying-spark' | 'cold-ash' | 'no-persistence'
export type Ash = 'ancient-inclusion' | 'preserved-wisdom' | 'proper-fossil' | 'fading-memory' | 'dust-mote' | 'no-wisdom'
export type Resin = 'diamond-hard' | 'strong-resin' | 'proper-hardness' | 'soft-copal' | 'brittle-copal' | 'no-strength'
export type AmberCondition = 'amber-masterpiece' | 'golden-fossil' | 'proper-resin' | 'cloudy-copal' | 'cracked-amber' | 'dust'
export type HearthType = 'ancient-fireplace' | 'warm-hearth' | 'proper-fire' | 'small-candle' | 'extinguished' | 'no-hearth'
export type HearthCondition = 'eternal-flame' | 'warm-glow' | 'proper-fire' | 'dying-ember' | 'cold-ash' | 'void'
export type KeeperGrade = 'fire-keeper' | 'ember-guardian' | 'hearth-tender' | 'apprentice' | 'novice' | 'smoker'

export interface WarmingMeasure {
  warmth: number
  amber: Amber
  hasHighWarmth: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasGraceful: boolean
  hasNoHarsh: boolean
  hasInviting: boolean
  hasNoHostile: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasWellCommented: boolean
  hasHelpful: boolean
  hasNoCrypticError: boolean
  intimidatingCount: number
  crypticCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  glow: Glow
  hasHighClarity: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasLuminous: boolean
  hasNoDark: boolean
  hasObvious: boolean
  obfuscatedCount: number
  hiddenCount: number
}

export interface EnduringMeasure {
  persistence: number
  ember: Ember
  hasHighPersistence: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasSolid: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface LearningMeasure {
  wisdom: number
  ash: Ash
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  hasBattleTested: boolean
  adHocCount: number
  hackyCount: number
}

export interface HardeningMeasure {
  strength: number
  resin: Resin
  hasHighStrength: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasValidated: boolean
  hasNoTrusting: boolean
  hasEdgeCaseCovered: boolean
  hasNoSinglePath: boolean
  hasBoundaryChecked: boolean
  hasNoAssumed: boolean
  hasNullSafe: boolean
  hasNoNPE: boolean
  hasSecure: boolean
  hasNoVulnerable: boolean
  hasFortified: boolean
  singlePathCount: number
  assumedCount: number
}

export interface AmberGlow {
  file: string
  preservationWarmth: number
  glowClarity: number
  firePersistence: number
  ashWisdom: number
  resinStrength: number
  warming: WarmingMeasure
  illuminating: IlluminatingMeasure
  enduring: EnduringMeasure
  learning: LearningMeasure
  hardening: HardeningMeasure
  condition: AmberCondition
  qualityScore: number
}

export interface AmberHearth {
  directory: string
  glows: AmberGlow[]
  avgWarmth: number
  avgClarity: number
  avgPersistence: number
  amberMasterpieceCount: number
  dustCount: number
  hearthType: HearthType
  condition: HearthCondition
}

export interface AmberEmberResult {
  glows: AmberGlow[]
  hearths: AmberHearth[]
  fire: {
    avgWarmth: number
    avgClarity: number
    avgPersistence: number
    isAmber: boolean
    overallWarmth: number
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
    goldenFossilCount: number
    properResinCount: number
    cloudyCopalCount: number
    crackedAmberCount: number
    dustCount: number
    hasHighWarmthCount: number
    hasHighClarityCount: number
    hasHighPersistenceCount: number
    hasHighWisdomCount: number
    hasHighStrengthCount: number
    overallWarmth: number
    keeperGrade: KeeperGrade
    bestGlow: string
    warmest: string
    clearest: string
    mostPersistent: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureWarming ────────────────────────────────────────────────

/**
 * @example measureWarming('export function greet(name: String): String')
 */
export function measureWarming(content: string): WarmingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasDoc) score += 6
  if (hasInterface) score += 4
  if (hasType) score += 4
  if (hasNamed) score += 4
  if (hasOptional) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const warmth = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const intimidatingCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    warmth,
    amber: classifyAmber(warmth),
    hasHighWarmth: warmth >= 80,
    hasApproachable: hasConst && !hasEval,
    hasNoIntimidating: !hasEval && !hasDebugger,
    hasReadable: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasGraceful: hasOptional && hasReturnType,
    hasNoHarsh: !hasEval && !hasDebugger,
    hasInviting: hasDoc && hasExport,
    hasNoHostile: !hasEval,
    hasDocumented: hasDoc,
    hasNoUndocumented: hasVar === 0,
    hasWellCommented: hasDoc && hasExport,
    hasHelpful: hasDoc && hasReturnType,
    hasNoCrypticError: !hasEval && !hasAny,
    intimidatingCount,
    crypticCount,
  }
}

// ─── measureIlluminating ───────────────────────────────────────────

/**
 * @example measureIlluminating('export function calculateTotal(items: Item[]): Number')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasDoc) score += 6
  if (hasInterface) score += 6
  if (hasNamed) score += 4
  if (hasGenerics) score += 4
  if (hasEnum) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const obfuscatedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const hiddenCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    clarity,
    glow: classifyGlow(clarity),
    hasHighClarity: clarity >= 80,
    hasTransparent: hasExport && !hasAny,
    hasNoObfuscated: !hasEval && !hasAny,
    hasClear: hasReturnType && !hasAny,
    hasNoHidden: !hasEval,
    hasVisible: hasExport,
    hasNoInvisible: !hasDebugger,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoMystery: !hasEval && !hasAny,
    hasUnderstandable: hasTypeAnnotation && hasConst,
    hasNoArcane: !hasEval && !hasAny,
    hasLuminous: hasDoc && hasExport && !hasAny,
    hasNoDark: !hasEval && !hasDebugger,
    hasObvious: hasReturnType && hasReadonly,
    obfuscatedCount,
    hiddenCount,
  }
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('try { const x = parse(data) } catch { return null }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReturnType) score += 6
  if (hasTryCatch) score += 8
  if (hasAsync) score += 4
  if (hasAwait) score += 4
  if (hasInterface) score += 4
  if (hasGenerics) score += 4
  if (hasClass) score += 4
  if (hasPrivate) score += 4
  if (hasNamed) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 6

  const persistence = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    persistence,
    ember: classifyEmber(persistence),
    hasHighPersistence: persistence >= 80,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasEval && !hasDebugger,
    hasRobust: hasTryCatch && hasReturnType,
    hasNoFragile: !hasEval,
    hasRecoverable: hasTryCatch || hasAsync,
    hasNoFatal: !hasEval && !hasDebugger,
    hasReliable: hasReturnType && hasConst,
    hasNoFlaky: hasVar === 0 && !hasDebugger,
    hasSolid: hasExport && hasConst && !hasAny,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureLearning ───────────────────────────────────────────────

/**
 * @example measureLearning('/** docs *\\/ export class Store extends Base implements IStore {}')
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasGenerics) score += 4
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const hackyCount = hasHackyCast > 0 ? hasHackyCast : 0

  return {
    wisdom,
    ash: classifyAsh(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && hasExport,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoHacky: hasHackyCast === 0,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasEstablished: hasExtends && hasImplements,
    hasBattleTested: hasTryCatch && hasExport && !hasAny,
    adHocCount,
    hackyCount,
  }
}

// ─── measureHardening ──────────────────────────────────────────────

/**
 * @example measureHardening('export interface Guard<T> { validate(input: T): Boolean; sanitize(s: String): String }')
 */
export function measureHardening(content: string): HardeningMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 4
  if (hasImplements) score += 4
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasGenerics) score += 4
  if (hasConst) score += 4
  if (hasTryCatch) score += 6
  if (hasOptional) score += 6
  if (hasReadonly) score += 4
  if (hasPrivate) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const strength = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const singlePathCount = hasVar > 0 ? 1 : 0
  const assumedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    strength,
    resin: classifyResin(strength),
    hasHighStrength: strength >= 80,
    hasDefensive: hasTryCatch && hasReturnType,
    hasNoNaive: !hasEval && !hasAny,
    hasValidated: hasTypeAnnotation && hasReturnType,
    hasNoTrusting: !hasAny,
    hasEdgeCaseCovered: hasOptional && hasTryCatch,
    hasNoSinglePath: hasVar === 0,
    hasBoundaryChecked: hasTypeAnnotation && hasOptional,
    hasNoAssumed: !hasEval && !hasAny,
    hasNullSafe: hasOptional && hasReturnType,
    hasNoNPE: hasOptional && hasReadonly,
    hasSecure: hasPrivate && !hasEval,
    hasNoVulnerable: !hasEval && !hasAny,
    hasFortified: hasPrivate && hasTryCatch && hasReturnType,
    singlePathCount,
    assumedCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyAmber(warmth: number): Amber {
  if (warmth >= 90) return 'golden-warmth'
  if (warmth >= 75) return 'warm-glow'
  if (warmth >= 60) return 'proper-heat'
  if (warmth >= 40) return 'cool-resin'
  if (warmth >= 20) return 'cold-stone'
  return 'no-warmth'
}

function classifyGlow(clarity: number): Glow {
  if (clarity >= 90) return 'inner-radiance'
  if (clarity >= 75) return 'bright-glow'
  if (clarity >= 60) return 'proper-luster'
  if (clarity >= 40) return 'dim-light'
  if (clarity >= 20) return 'dark-resin'
  return 'no-glow'
}

function classifyEmber(persistence: number): Ember {
  if (persistence >= 90) return 'eternal-ember'
  if (persistence >= 75) return 'long-burning'
  if (persistence >= 60) return 'proper-coal'
  if (persistence >= 40) return 'dying-spark'
  if (persistence >= 20) return 'cold-ash'
  return 'no-persistence'
}

function classifyAsh(wisdom: number): Ash {
  if (wisdom >= 90) return 'ancient-inclusion'
  if (wisdom >= 75) return 'preserved-wisdom'
  if (wisdom >= 60) return 'proper-fossil'
  if (wisdom >= 40) return 'fading-memory'
  if (wisdom >= 20) return 'dust-mote'
  return 'no-wisdom'
}

function classifyResin(strength: number): Resin {
  if (strength >= 90) return 'diamond-hard'
  if (strength >= 75) return 'strong-resin'
  if (strength >= 60) return 'proper-hardness'
  if (strength >= 40) return 'soft-copal'
  if (strength >= 20) return 'brittle-copal'
  return 'no-strength'
}

export function classifyAmberCondition(qualityScore: number): AmberCondition {
  if (qualityScore >= 90) return 'amber-masterpiece'
  if (qualityScore >= 75) return 'golden-fossil'
  if (qualityScore >= 60) return 'proper-resin'
  if (qualityScore >= 40) return 'cloudy-copal'
  if (qualityScore >= 20) return 'cracked-amber'
  return 'dust'
}

export function classifyHearthType(glows: AmberGlow[]): HearthType {
  if (glows.length === 0) return 'no-hearth'
  const avgQs = glows.reduce((s, g) => s + g.qualityScore, 0) / glows.length
  const masterpieceRatio = glows.filter(g => g.condition === 'amber-masterpiece').length / glows.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'ancient-fireplace'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'warm-hearth'
  if (avgQs >= 55) return 'proper-fire'
  if (avgQs >= 35) return 'small-candle'
  if (avgQs >= 15) return 'extinguished'
  return 'no-hearth'
}

export function classifyHearthCondition(avgWarmth: number): HearthCondition {
  if (avgWarmth >= 85) return 'eternal-flame'
  if (avgWarmth >= 70) return 'warm-glow'
  if (avgWarmth >= 55) return 'proper-fire'
  if (avgWarmth >= 35) return 'dying-ember'
  if (avgWarmth >= 15) return 'cold-ash'
  return 'void'
}

export function classifyKeeperGrade(avgWarmth: number): KeeperGrade {
  if (avgWarmth >= 85) return 'fire-keeper'
  if (avgWarmth >= 70) return 'ember-guardian'
  if (avgWarmth >= 55) return 'hearth-tender'
  if (avgWarmth >= 40) return 'apprentice'
  if (avgWarmth >= 20) return 'novice'
  return 'smoker'
}

// ─── analyzeAmberGlow ──────────────────────────────────────────────

/**
 * @example analyzeAmberGlow(content, 'src/foo.ts')
 */
export function analyzeAmberGlow(content: string, filePath: string): AmberGlow {
  const warming = measureWarming(content)
  const illuminating = measureIlluminating(content)
  const enduring = measureEnduring(content)
  const learning = measureLearning(content)
  const hardening = measureHardening(content)

  const preservationWarmth = warming.warmth
  const glowClarity = illuminating.clarity
  const firePersistence = enduring.persistence
  const ashWisdom = learning.wisdom
  const resinStrength = hardening.strength

  const qualityScore = Math.round(
    preservationWarmth * 0.2 +
    glowClarity * 0.2 +
    firePersistence * 0.2 +
    ashWisdom * 0.2 +
    resinStrength * 0.2,
  )

  return {
    file: filePath,
    preservationWarmth,
    glowClarity,
    firePersistence,
    ashWisdom,
    resinStrength,
    warming,
    illuminating,
    enduring,
    learning,
    hardening,
    condition: classifyAmberCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeAmberHearth ────────────────────────────────────────────

/**
 * @example analyzeAmberHearth(glows, 'src')
 */
export function analyzeAmberHearth(glows: AmberGlow[], dirPath: string): AmberHearth {
  if (glows.length === 0) {
    return {
      directory: dirPath,
      glows: [],
      avgWarmth: 0,
      avgClarity: 0,
      avgPersistence: 0,
      amberMasterpieceCount: 0,
      dustCount: 0,
      hearthType: 'no-hearth',
      condition: 'void',
    }
  }

  const avgWarmth = Math.round(glows.reduce((s, g) => s + g.preservationWarmth, 0) / glows.length)
  const avgClarity = Math.round(glows.reduce((s, g) => s + g.glowClarity, 0) / glows.length)
  const avgPersistence = Math.round(glows.reduce((s, g) => s + g.firePersistence, 0) / glows.length)
  const amberMasterpieceCount = glows.filter(g => g.condition === 'amber-masterpiece').length
  const dustCount = glows.filter(g => g.condition === 'dust').length

  return {
    directory: dirPath,
    glows,
    avgWarmth,
    avgClarity,
    avgPersistence,
    amberMasterpieceCount,
    dustCount,
    hearthType: classifyHearthType(glows),
    condition: classifyHearthCondition(avgWarmth),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(glows, hearths, fire, stats)
 */
export function generateRecommendations(
  glows: AmberGlow[],
  hearths: AmberHearth[],
  fire: AmberEmberResult['fire'],
  stats: AmberEmberResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallWarmth >= 85 && stats.dustCount === 0) {
    recs.push('Amber perfection — the ember glows eternal, preserved for the ages')
    return recs
  }

  if (stats.avgPreservationWarmth < 60) {
    recs.push('Warm the amber — add docs, type annotations, remove eval and any')
  }
  if (stats.avgGlowClarity < 60) {
    recs.push('Brighten the glow — add return types, named exports, remove obfuscation')
  }
  if (stats.avgFirePersistence < 60) {
    recs.push('Feed the ember — add error handling, type safety, remove eval and debugger')
  }
  if (stats.avgAshWisdom < 60) {
    recs.push('Preserve the wisdom — add abstractions, documentation, proven patterns, remove eval and any')
  }
  if (stats.avgResinStrength < 60) {
    recs.push('Harden the resin — add validation, edge cases, optionality, remove eval and any')
  }

  if (stats.dustCount > 0) {
    const dustFiles = glows.filter(g => g.condition === 'dust').map(g => g.file)
    if (dustFiles.length <= 3) {
      recs.push(`Dust detected: ${dustFiles.join(', ')} — these need amber preservation`)
    } else {
      recs.push(`${dustFiles.length} dust files detected — they need amber preservation`)
    }
  }

  if (hearths.length > 1) {
    const dyingHearths = hearths.filter(h => h.condition === 'dying-ember' || h.condition === 'cold-ash')
    if (dyingHearths.length > 0) {
      recs.push(`${dyingHearths.length} hearth(s) have dying or cold conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The amber ember holds steady — maintain current warmth')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildAmberEmberResult ─────────────────────────────────────────

/**
 * @example buildAmberEmberResult(['a.ts'], [content])
 */
export async function buildAmberEmberResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberEmberResult> {
  const glows: AmberGlow[] = files.map((file, i) =>
    analyzeAmberGlow(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberGlow[]>()
  for (const glow of glows) {
    const dir = path.dirname(glow.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(glow)
    } else {
      dirMap.set(dir, [glow])
    }
  }

  const hearths: AmberHearth[] = Array.from(dirMap.entries()).map(([dir, dirGlows]) =>
    analyzeAmberHearth(dirGlows, dir),
  )

  const avgPreservationWarmth = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.preservationWarmth, 0) / glows.length)
    : 0
  const avgGlowClarity = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.glowClarity, 0) / glows.length)
    : 0
  const avgFirePersistence = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.firePersistence, 0) / glows.length)
    : 0
  const avgAshWisdom = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.ashWisdom, 0) / glows.length)
    : 0
  const avgResinStrength = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.resinStrength, 0) / glows.length)
    : 0

  const overallWarmth = Math.round(
    (avgPreservationWarmth + avgGlowClarity + avgFirePersistence) / 3,
  )

  const fire = {
    avgWarmth: avgPreservationWarmth,
    avgClarity: avgGlowClarity,
    avgPersistence: avgFirePersistence,
    isAmber: overallWarmth >= 80,
    overallWarmth,
  }

  const bestGlow = glows.length > 0
    ? glows.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file
    : ''
  const warmest = glows.length > 0
    ? glows.reduce((best, g) => g.preservationWarmth > best.preservationWarmth ? g : best).file
    : ''
  const clearest = glows.length > 0
    ? glows.reduce((best, g) => g.glowClarity > best.glowClarity ? g : best).file
    : ''
  const mostPersistent = glows.length > 0
    ? glows.reduce((best, g) => g.firePersistence > best.firePersistence ? g : best).file
    : ''
  const wisest = glows.length > 0
    ? glows.reduce((best, g) => g.ashWisdom > best.ashWisdom ? g : best).file
    : ''

  const stats = {
    totalFiles: glows.length,
    totalHearths: hearths.length,
    avgPreservationWarmth,
    avgGlowClarity,
    avgFirePersistence,
    avgAshWisdom,
    avgResinStrength,
    amberMasterpieceCount: glows.filter(g => g.condition === 'amber-masterpiece').length,
    goldenFossilCount: glows.filter(g => g.condition === 'golden-fossil').length,
    properResinCount: glows.filter(g => g.condition === 'proper-resin').length,
    cloudyCopalCount: glows.filter(g => g.condition === 'cloudy-copal').length,
    crackedAmberCount: glows.filter(g => g.condition === 'cracked-amber').length,
    dustCount: glows.filter(g => g.condition === 'dust').length,
    hasHighWarmthCount: glows.filter(g => g.warming.hasHighWarmth).length,
    hasHighClarityCount: glows.filter(g => g.illuminating.hasHighClarity).length,
    hasHighPersistenceCount: glows.filter(g => g.enduring.hasHighPersistence).length,
    hasHighWisdomCount: glows.filter(g => g.learning.hasHighWisdom).length,
    hasHighStrengthCount: glows.filter(g => g.hardening.hasHighStrength).length,
    overallWarmth,
    keeperGrade: classifyKeeperGrade(overallWarmth),
    bestGlow,
    warmest,
    clearest,
    mostPersistent,
    wisest,
  }

  const recommendations = generateRecommendations(glows, hearths, fire, { ...stats, recommendations: [] } as AmberEmberResult['stats'])

  return {
    glows,
    hearths,
    fire,
    stats,
    recommendations,
  }
}
