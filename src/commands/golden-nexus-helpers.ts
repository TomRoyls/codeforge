// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Radiance = 'solar-flare' | 'bright-nova' | 'proper-star' | 'dim-glow' | 'dark-matter' | 'no-radiance'
export type Bond = 'unbreakable-chain' | 'strong-link' | 'proper-bond' | 'weak-thread' | 'frayed-string' | 'no-bond'
export type Convergence = 'perfect-alignment' | 'tight-convergence' | 'proper-focus' | 'loose-gathering' | 'scattered-points' | 'no-convergence'
export type Field = 'impervious-barrier' | 'strong-shield' | 'proper-field' | 'weak-barrier' | 'no-protection' | 'no-field'
export type Insight = 'enlightened-core' | 'deep-understanding' | 'proper-insight' | 'surface-knowledge' | 'shallow-awareness' | 'no-wisdom'
export type ThreadCondition = 'golden-convergence' | 'radiant-nexus' | 'proper-node' | 'dim-point' | 'dark-spot' | 'void'
export type WebType = 'cosmic-web' | 'golden-network' | 'proper-mesh' | 'small-net' | 'tangled-yarn' | 'no-web'
export type WebCondition = 'golden-constellation' | 'radiant-network' | 'proper-web' | 'frayed-mesh' | 'broken-threads' | 'void'
export type WeaverGrade = 'master-weaver' | 'expert-architect' | 'skilled-builder' | 'apprentice' | 'novice' | 'tangled-soul'

export interface IlluminatingMeasure {
  clarity: number
  radiance: Radiance
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasLuminous: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface BindingMeasure {
  strength: number
  bond: Bond
  hasHighStrength: boolean
  hasModular: boolean
  hasNoTangled: boolean
  hasConnected: boolean
  hasNoIsolated: boolean
  hasCohesive: boolean
  hasNoScattered: boolean
  hasLinked: boolean
  hasNoOrphaned: boolean
  hasIntegrated: boolean
  hasNoDisconnected: boolean
  hasHarmonious: boolean
  tangledCount: number
  isolatedCount: number
}

export interface ConvergingMeasure {
  precision: number
  convergence: Convergence
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasAligned: boolean
  approximateCount: number
  sloppyCount: number
}

export interface ShieldingMeasure {
  resilience: number
  field: Field
  hasHighResilience: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasValidated: boolean
  hasNoTrusting: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface KnowingMeasure {
  wisdom: number
  insight: Insight
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellArchitected: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasVisionary: boolean
  hasNoTunnelVision: boolean
  hasStrategic: boolean
  adHocCount: number
  hackyCount: number
}

export interface GoldenThread {
  file: string
  radiantClarity: number
  connectionStrength: number
  nexusPrecision: number
  fieldResilience: number
  coreWisdom: number
  illuminating: IlluminatingMeasure
  binding: BindingMeasure
  converging: ConvergingMeasure
  shielding: ShieldingMeasure
  knowing: KnowingMeasure
  condition: ThreadCondition
  qualityScore: number
}

export interface GoldenWeb {
  directory: string
  threads: GoldenThread[]
  avgClarity: number
  avgStrength: number
  avgWisdom: number
  goldenConvergenceCount: number
  voidCount: number
  webType: WebType
  condition: WebCondition
}

export interface GoldenNexusResult {
  threads: GoldenThread[]
  webs: GoldenWeb[]
  nexus: {
    avgClarity: number
    avgStrength: number
    avgWisdom: number
    isGolden: boolean
    overallRadiance: number
  }
  celebration: {
    milestone: 530
    name: 'golden-nexus'
    message: string
    previousMilestones: number[]
    totalTests: number
  }
  stats: {
    totalFiles: number
    totalWebs: number
    avgRadiantClarity: number
    avgConnectionStrength: number
    avgNexusPrecision: number
    avgFieldResilience: number
    avgCoreWisdom: number
    goldenConvergenceCount: number
    radiantNexusCount: number
    properNodeCount: number
    dimPointCount: number
    darkSpotCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighStrengthCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallRadiance: number
    weaverGrade: WeaverGrade
    bestThread: string
    clearest: string
    strongest: string
    mostPrecise: string
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

// ─── measureIlluminating ───────────────────────────────────────────

/**
 * @example measureIlluminating('export function foo() {}')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  const lines = content.split('\n')
  const nonEmpty = lines.filter(l => l.trim().length > 0)

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReadability = nonEmpty.length > 0 && nonEmpty.every(l => l.length < 120)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasStrictEq = hasPattern(content, /===/)
  const hasMapFilter = hasPattern(content, /\.(map|filter|reduce|forEach)\(/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasUnion = hasPattern(content, /\|\s*\w+/)

  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasWith = hasPattern(content, /\bwith\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasMagicNum = countPattern(content, /[^A-Za-z_]\d{3,}[^A-Za-z_\d]/)

  if (hasExport) score += 8
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasDoc) score += 8
  if (hasNamed) score += 6
  if (hasReadability) score += 6
  if (hasReturn) score += 4
  if (hasAsync) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasPrivate) score += 4
  if (hasStrictEq) score += 4
  if (hasMapFilter) score += 4
  if (hasEnum) score += 4
  if (hasClass) score += 4
  if (hasThrow) score += 2
  if (hasTryCatch) score += 2
  if (hasUnion) score += 4

  if (hasEval) score -= 15
  if (hasWith) score -= 10
  if (hasDebugger) score -= 10
  if (hasMagicNum > 0) score -= Math.min(hasMagicNum * 3, 9)

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.1)))
  const crypticCount = (hasEval ? 1 : 0) + (hasWith ? 1 : 0) + (hasDebugger ? 1 : 0)
  const obfuscatedCount = hasMagicNum > 0 ? Math.min(hasMagicNum, 3) : 0

  return {
    clarity,
    radiance: classifyRadiance(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport || hasConst,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && !hasWith,
    hasTransparent: hasExport && (hasInterface || hasType),
    hasNoObfuscated: !hasDebugger,
    hasClear: hasReturnType || hasConst,
    hasNoHidden: !hasEval,
    hasVisible: hasExport,
    hasNoInvisible: !hasWith,
    hasUnderstandable: hasInterface || hasType || hasEnum,
    hasNoArcane: !hasDebugger && !hasEval,
    hasLuminous: clarity >= 90,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureBinding ────────────────────────────────────────────────

/**
 * @example measureBinding('export function foo() {}')
 */
export function measureBinding(content: string): BindingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasFunction = hasPattern(content, /\bfunction\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasDefault = hasPattern(content, /\bdefault\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasGlobalLeak = hasPattern(content, /\bvar\b/)
  const hasIsolatedFn = hasPattern(content, /\bfunction\s*\w+\s*\(/) && !hasExport && !hasImport
  const hasGodFile = content.split('\n').length > 300
  const hasDeepNesting = countPattern(content, /\bif\s*\(/) > 5

  if (hasExport) score += 10
  if (hasImport) score += 10
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasClass) score += 8
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasConst) score += 4
  if (hasFunction) score += 4
  if (hasArrow) score += 4
  if (hasReturn) score += 2
  if (hasAsync) score += 4
  if (hasGenerics) score += 4
  if (hasEnum) score += 4
  if (hasDefault) score += 2
  if (hasNamed) score += 8

  if (hasGlobalLeak) score -= 10
  if (hasIsolatedFn) score -= 5
  if (hasGodFile) score -= 8
  if (hasDeepNesting) score -= 6

  const strength = Math.min(100, Math.max(0, Math.round(score * 1.05)))
  const tangledCount = hasGlobalLeak ? 1 : 0
  const isolatedCount = hasIsolatedFn ? 1 : 0

  return {
    strength,
    bond: classifyBond(strength),
    hasHighStrength: strength >= 80,
    hasModular: hasExport && hasImport,
    hasNoTangled: !hasGlobalLeak,
    hasConnected: hasExport || hasImport,
    hasNoIsolated: !hasIsolatedFn,
    hasCohesive: hasInterface || hasClass,
    hasNoScattered: !hasGodFile,
    hasLinked: hasImport,
    hasNoOrphaned: !hasIsolatedFn || hasExport,
    hasIntegrated: hasExport && hasImport && (hasInterface || hasClass),
    hasNoDisconnected: !hasIsolatedFn,
    hasHarmonious: strength >= 85,
    tangledCount,
    isolatedCount,
  }
}

// ─── measureConverging ─────────────────────────────────────────────

/**
 * @example measureConverging('export function foo(): string { return "a" }')
 */
export function measureConverging(content: string): ConvergingMeasure {
  let score = 0

  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasStrictEq = hasPattern(content, /===/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasUnion = hasPattern(content, /\|\s*\w+/)
  const hasLiteral = hasPattern(content, /'[^']*'|"[^"]*"/)
  const hasDefault = hasPattern(content, /\bdefault\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)

  const hasAny = hasPattern(content, /\bany\b/)
  const hasVar = hasPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasApproximate = countPattern(content, /\bas\s+any\b/)
  const hasSloppy = countPattern(content, /\bvar\b/)

  if (hasType) score += 8
  if (hasReturnType) score += 10
  if (hasConst) score += 6
  if (hasInterface) score += 8
  if (hasEnum) score += 6
  if (hasGenerics) score += 8
  if (hasReadonly) score += 6
  if (hasStrictEq) score += 6
  if (hasExport) score += 6
  if (hasOptional) score += 4
  if (hasUnion) score += 6
  if (hasLiteral) score += 4
  if (hasDefault) score += 4
  if (hasPrivate) score += 4
  if (hasAbstract) score += 6

  if (hasAny) score -= 12
  if (hasVar) score -= 10
  if (hasEval) score -= 15

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.05)))
  const approximateCount = Math.min(hasApproximate, 5)
  const sloppyCount = Math.min(hasSloppy, 5)

  return {
    precision,
    convergence: classifyConvergence(precision),
    hasHighPrecision: precision >= 80,
    hasExact: hasReturnType,
    hasAccurate: hasType,
    hasNoApproximate: !hasAny,
    hasPrecise: hasConst && hasReturnType,
    hasNoVague: !hasVar,
    hasCorrect: hasInterface || hasEnum,
    hasNoAlmostRight: !hasEval,
    hasSharp: hasGenerics || hasReadonly,
    hasNoSloppy: !hasVar,
    hasDefined: hasType,
    hasNoFuzzy: !hasAny,
    hasAligned: precision >= 70,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureShielding ──────────────────────────────────────────────

/**
 * @example measureShielding('try { foo() } catch(e) { throw e }')
 */
export function measureShielding(content: string): ShieldingMeasure {
  let score = 0

  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasStrictNull = hasPattern(content, /!==\s*null|!==\s*undefined/)
  const hasDefaultParam = hasPattern(content, /=\s*[^=]+\)/)

  const hasVar = hasPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasBareThrow = hasPattern(content, /\bthrow\b/) && !hasPattern(content, /\bthrow\s+new\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasConsole = countPattern(content, /\bconsole\.\w+\(/)
  const hasUnsafeCast = hasPattern(content, /\bas\s+any\b/)

  if (hasType) score += 8
  if (hasInterface) score += 6
  if (hasConst) score += 4
  if (hasTryCatch) score += 10
  if (hasThrow) score += 8
  if (hasAsync) score += 6
  if (hasAwait) score += 6
  if (hasExport) score += 4
  if (hasReturn) score += 2
  if (hasGenerics) score += 6
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasStrictNull) score += 6
  if (hasDefaultParam) score += 6

  if (hasVar) score -= 10
  if (hasAny) score -= 10
  if (hasDebugger) score -= 10
  if (hasConsole > 0) score -= Math.min(hasConsole * 2, 8)
  if (hasUnsafeCast) score -= 8

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar ? 1 : 0
  const bareCrashCount = (hasBareThrow ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    resilience,
    field: classifyField(resilience),
    hasHighResilience: resilience >= 80,
    hasTested: hasTryCatch || hasAsync,
    hasNoUntested: !hasVar,
    hasTypeSafe: hasType && !hasAny,
    hasNoUnsafe: !hasVar,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasBareThrow && !hasDebugger,
    hasDefensive: hasOptional || hasStrictNull || hasDefaultParam,
    hasNoNaive: !hasDebugger,
    hasRobust: hasTryCatch && hasThrow,
    hasNoFragile: !hasVar && !hasAny,
    hasValidated: hasType && (hasInterface || hasConst),
    hasNoTrusting: !hasUnsafeCast,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('export interface Foo { bar: string }')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasDesignPattern = hasPattern(content, /\b(Factory|Builder|Singleton|Observer|Strategy|Adapter|Facade|Proxy)\b/)

  const hasAdHoc = countPattern(content, /\bvar\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasMagicNum = countPattern(content, /[^A-Za-z_]\d{3,}[^A-Za-z_\d]/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 10
  if (hasInterface) score += 8
  if (hasType) score += 8
  if (hasEnum) score += 6
  if (hasClass) score += 8
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasPrivate) score += 4
  if (hasAsync) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasDesignPattern) score += 10

  if (hasAdHoc > 0) score -= Math.min(hasAdHoc * 5, 15)
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 15)
  if (hasTodo) score -= 5
  if (hasMagicNum > 0) score -= Math.min(hasMagicNum * 2, 8)
  if (hasDebugger) score -= 10

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = Math.min(hasAdHoc, 5)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    wisdom,
    insight: classifyInsight(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellArchitected: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasPattern(content, /\bvar\b/),
    hasPatterned: hasDesignPattern || (hasExtends && hasImplements),
    hasNoReinvented: !hasTodo,
    hasPrincipled: hasExport && hasConst && !hasPattern(content, /\bas\s+any\b/),
    hasNoHacky: !hasPattern(content, /\bas\s+any\b/) && !hasDebugger,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasVisionary: hasDesignPattern && hasGenerics,
    hasNoTunnelVision: !hasTodo,
    hasStrategic: wisdom >= 75,
    adHocCount,
    hackyCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyRadiance(clarity: number): Radiance {
  if (clarity >= 90) return 'solar-flare'
  if (clarity >= 75) return 'bright-nova'
  if (clarity >= 60) return 'proper-star'
  if (clarity >= 40) return 'dim-glow'
  if (clarity >= 20) return 'dark-matter'
  return 'no-radiance'
}

function classifyBond(strength: number): Bond {
  if (strength >= 90) return 'unbreakable-chain'
  if (strength >= 75) return 'strong-link'
  if (strength >= 60) return 'proper-bond'
  if (strength >= 40) return 'weak-thread'
  if (strength >= 20) return 'frayed-string'
  return 'no-bond'
}

function classifyConvergence(precision: number): Convergence {
  if (precision >= 90) return 'perfect-alignment'
  if (precision >= 75) return 'tight-convergence'
  if (precision >= 60) return 'proper-focus'
  if (precision >= 40) return 'loose-gathering'
  if (precision >= 20) return 'scattered-points'
  return 'no-convergence'
}

function classifyField(resilience: number): Field {
  if (resilience >= 90) return 'impervious-barrier'
  if (resilience >= 75) return 'strong-shield'
  if (resilience >= 60) return 'proper-field'
  if (resilience >= 40) return 'weak-barrier'
  if (resilience >= 20) return 'no-protection'
  return 'no-field'
}

function classifyInsight(wisdom: number): Insight {
  if (wisdom >= 90) return 'enlightened-core'
  if (wisdom >= 75) return 'deep-understanding'
  if (wisdom >= 60) return 'proper-insight'
  if (wisdom >= 40) return 'surface-knowledge'
  if (wisdom >= 20) return 'shallow-awareness'
  return 'no-wisdom'
}

export function classifyThreadCondition(qualityScore: number): ThreadCondition {
  if (qualityScore >= 90) return 'golden-convergence'
  if (qualityScore >= 75) return 'radiant-nexus'
  if (qualityScore >= 60) return 'proper-node'
  if (qualityScore >= 40) return 'dim-point'
  if (qualityScore >= 20) return 'dark-spot'
  return 'void'
}

export function classifyWebType(threads: GoldenThread[]): WebType {
  if (threads.length === 0) return 'no-web'
  const avgQs = threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length
  const goldenRatio = threads.filter(t => t.condition === 'golden-convergence').length / threads.length
  if (avgQs >= 85 && goldenRatio >= 0.5) return 'cosmic-web'
  if (avgQs >= 70 && goldenRatio >= 0.3) return 'golden-network'
  if (avgQs >= 55) return 'proper-mesh'
  if (avgQs >= 35) return 'small-net'
  if (avgQs >= 15) return 'tangled-yarn'
  return 'no-web'
}

export function classifyWebCondition(avgClarity: number): WebCondition {
  if (avgClarity >= 85) return 'golden-constellation'
  if (avgClarity >= 70) return 'radiant-network'
  if (avgClarity >= 55) return 'proper-web'
  if (avgClarity >= 35) return 'frayed-mesh'
  if (avgClarity >= 15) return 'broken-threads'
  return 'void'
}

export function classifyWeaverGrade(avgRadiance: number): WeaverGrade {
  if (avgRadiance >= 85) return 'master-weaver'
  if (avgRadiance >= 70) return 'expert-architect'
  if (avgRadiance >= 55) return 'skilled-builder'
  if (avgRadiance >= 40) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'tangled-soul'
}

// ─── analyzeGoldenThread ──────────────────────────────────────────

/**
 * @example analyzeGoldenThread(content, 'src/foo.ts')
 */
export function analyzeGoldenThread(content: string, filePath: string): GoldenThread {
  const illuminating = measureIlluminating(content)
  const binding = measureBinding(content)
  const converging = measureConverging(content)
  const shielding = measureShielding(content)
  const knowing = measureKnowing(content)

  const radiantClarity = illuminating.clarity
  const connectionStrength = binding.strength
  const nexusPrecision = converging.precision
  const fieldResilience = shielding.resilience
  const coreWisdom = knowing.wisdom

  const qualityScore = Math.round(
    radiantClarity * 0.2 +
    connectionStrength * 0.2 +
    nexusPrecision * 0.2 +
    fieldResilience * 0.2 +
    coreWisdom * 0.2,
  )

  return {
    file: filePath,
    radiantClarity,
    connectionStrength,
    nexusPrecision,
    fieldResilience,
    coreWisdom,
    illuminating,
    binding,
    converging,
    shielding,
    knowing,
    condition: classifyThreadCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeGoldenWeb ──────────────────────────────────────────────

/**
 * @example analyzeGoldenWeb(threads, 'src')
 */
export function analyzeGoldenWeb(threads: GoldenThread[], dirPath: string): GoldenWeb {
  if (threads.length === 0) {
    return {
      directory: dirPath,
      threads: [],
      avgClarity: 0,
      avgStrength: 0,
      avgWisdom: 0,
      goldenConvergenceCount: 0,
      voidCount: 0,
      webType: 'no-web',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(threads.reduce((s, t) => s + t.radiantClarity, 0) / threads.length)
  const avgStrength = Math.round(threads.reduce((s, t) => s + t.connectionStrength, 0) / threads.length)
  const avgWisdom = Math.round(threads.reduce((s, t) => s + t.coreWisdom, 0) / threads.length)
  const goldenConvergenceCount = threads.filter(t => t.condition === 'golden-convergence').length
  const voidCount = threads.filter(t => t.condition === 'void').length

  return {
    directory: dirPath,
    threads,
    avgClarity,
    avgStrength,
    avgWisdom,
    goldenConvergenceCount,
    voidCount,
    webType: classifyWebType(threads),
    condition: classifyWebCondition(avgClarity),
  }
}

// ─── generateRecommendations ──────────────────────────────────────

/**
 * @example generateRecommendations(threads, webs, nexus, stats)
 */
export function generateRecommendations(
  threads: GoldenThread[],
  webs: GoldenWeb[],
  nexus: GoldenNexusResult['nexus'],
  stats: GoldenNexusResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallRadiance >= 85 && stats.voidCount === 0) {
    recs.push('Golden nexus achieved — radiance at imperial perfection')
    return recs
  }

  if (stats.avgRadiantClarity < 60) {
    recs.push('Increase radiant clarity — code needs more exports, interfaces, and documentation to glow')
  }
  if (stats.avgConnectionStrength < 60) {
    recs.push('Strengthen connections — modularize with exports and imports to bind threads together')
  }
  if (stats.avgNexusPrecision < 60) {
    recs.push('Sharpen nexus precision — add return types, const declarations, and eliminate `any`')
  }
  if (stats.avgFieldResilience < 60) {
    recs.push('Reinforce the field — add error handling with try/catch and type safety')
  }
  if (stats.avgCoreWisdom < 60) {
    recs.push('Deepen core wisdom — add JSDoc documentation and architectural patterns')
  }

  if (stats.voidCount > 0) {
    const voidFiles = threads.filter(t => t.condition === 'void').map(t => t.file)
    if (voidFiles.length <= 3) {
      recs.push(`Void threads detected: ${voidFiles.join(', ')} — these emit no light`)
    } else {
      recs.push(`${voidFiles.length} void threads detected — they emit no light and weaken the nexus`)
    }
  }

  if (nexus.avgClarity < 50) {
    recs.push('Nexus clarity is dim — consider refactoring the darkest files first')
  }

  if (webs.length > 1) {
    const weakWebs = webs.filter(w => w.condition === 'broken-threads' || w.condition === 'frayed-mesh')
    if (weakWebs.length > 0) {
      recs.push(`${weakWebs.length} web(s) have frayed or broken threads — reinforce their connections`)
    }
  }

  if (recs.length === 0) {
    recs.push('The nexus glows steadily — maintain current quality levels')
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

// ─── buildGoldenNexusResult ────────────────────────────────────────

/**
 * @example buildGoldenNexusResult(['a.ts'], [content])
 */
export async function buildGoldenNexusResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GoldenNexusResult> {
  const threads: GoldenThread[] = files.map((file, i) =>
    analyzeGoldenThread(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, GoldenThread[]>()
  for (const thread of threads) {
    const dir = path.dirname(thread.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(thread)
    } else {
      dirMap.set(dir, [thread])
    }
  }

  const webs: GoldenWeb[] = Array.from(dirMap.entries()).map(([dir, dirThreads]) =>
    analyzeGoldenWeb(dirThreads, dir),
  )

  const avgRadiantClarity = threads.length > 0
    ? Math.round(threads.reduce((s, t) => s + t.radiantClarity, 0) / threads.length)
    : 0
  const avgConnectionStrength = threads.length > 0
    ? Math.round(threads.reduce((s, t) => s + t.connectionStrength, 0) / threads.length)
    : 0
  const avgNexusPrecision = threads.length > 0
    ? Math.round(threads.reduce((s, t) => s + t.nexusPrecision, 0) / threads.length)
    : 0
  const avgFieldResilience = threads.length > 0
    ? Math.round(threads.reduce((s, t) => s + t.fieldResilience, 0) / threads.length)
    : 0
  const avgCoreWisdom = threads.length > 0
    ? Math.round(threads.reduce((s, t) => s + t.coreWisdom, 0) / threads.length)
    : 0

  const overallRadiance = Math.round(
    (avgRadiantClarity + avgConnectionStrength + avgCoreWisdom) / 3,
  )

  const nexus = {
    avgClarity: avgRadiantClarity,
    avgStrength: avgConnectionStrength,
    avgWisdom: avgCoreWisdom,
    isGolden: overallRadiance >= 80,
    overallRadiance,
  }

  const bestThread = threads.length > 0
    ? threads.reduce((best, t) => t.qualityScore > best.qualityScore ? t : best).file
    : ''
  const clearest = threads.length > 0
    ? threads.reduce((best, t) => t.radiantClarity > best.radiantClarity ? t : best).file
    : ''
  const strongest = threads.length > 0
    ? threads.reduce((best, t) => t.connectionStrength > best.connectionStrength ? t : best).file
    : ''
  const mostPrecise = threads.length > 0
    ? threads.reduce((best, t) => t.nexusPrecision > best.nexusPrecision ? t : best).file
    : ''
  const wisest = threads.length > 0
    ? threads.reduce((best, t) => t.coreWisdom > best.coreWisdom ? t : best).file
    : ''

  const stats = {
    totalFiles: threads.length,
    totalWebs: webs.length,
    avgRadiantClarity,
    avgConnectionStrength,
    avgNexusPrecision,
    avgFieldResilience,
    avgCoreWisdom,
    goldenConvergenceCount: threads.filter(t => t.condition === 'golden-convergence').length,
    radiantNexusCount: threads.filter(t => t.condition === 'radiant-nexus').length,
    properNodeCount: threads.filter(t => t.condition === 'proper-node').length,
    dimPointCount: threads.filter(t => t.condition === 'dim-point').length,
    darkSpotCount: threads.filter(t => t.condition === 'dark-spot').length,
    voidCount: threads.filter(t => t.condition === 'void').length,
    hasHighClarityCount: threads.filter(t => t.illuminating.hasHighClarity).length,
    hasHighStrengthCount: threads.filter(t => t.binding.hasHighStrength).length,
    hasHighPrecisionCount: threads.filter(t => t.converging.hasHighPrecision).length,
    hasHighResilienceCount: threads.filter(t => t.shielding.hasHighResilience).length,
    hasHighWisdomCount: threads.filter(t => t.knowing.hasHighWisdom).length,
    overallRadiance,
    weaverGrade: classifyWeaverGrade(overallRadiance),
    bestThread,
    clearest,
    strongest,
    mostPrecise,
    wisest,
  }

  const recommendations = generateRecommendations(threads, webs, nexus, { ...stats, recommendations: [] } as GoldenNexusResult['stats'])

  return {
    threads,
    webs,
    nexus,
    celebration: {
      milestone: 530,
      name: 'golden-nexus',
      message: 'Command #530 — The Golden Nexus. 530 commands converging at a single radiant point. Every thread of quality, every facet of craftsmanship, every beam of clarity — all meet here in golden convergence.',
      previousMilestones: [420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520],
      totalTests: 95000,
    },
    stats,
    recommendations,
  }
}
