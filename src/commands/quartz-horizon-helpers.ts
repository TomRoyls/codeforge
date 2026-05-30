// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Crystal = 'flawless-quartz' | 'clear-crystal' | 'proper-quartz' | 'milky-quartz' | 'opaque-stone' | 'no-clarity'
export type Frequency = 'perfect-oscillator' | 'precise-frequency' | 'proper-vibration' | 'irregular-pulse' | 'static-noise' | 'no-vibration'
export type Signal = 'crystal-clear' | 'strong-signal' | 'proper-tone' | 'noisy-channel' | 'static' | 'no-signal'
export type Lattice = 'hexagonal-perfect' | 'well-formed' | 'proper-lattice' | 'flawed-crystal' | 'amorphous' | 'no-structure'
export type Vein = 'golden-vein' | 'rich-seam' | 'proper-deposit' | 'barren-rock' | 'empty-stone' | 'no-wisdom'
export type CrystalCondition = 'master-crystal' | 'clear-gem' | 'proper-quartz' | 'milky-stone' | 'rough-rock' | 'sand'
export type VeinType = 'mother-lode' | 'rich-vein' | 'proper-seam' | 'small-pocket' | 'surface-scatter' | 'no-vein'
export type VeinCondition = 'crystal-cathedral' | 'gem-gallery' | 'proper-mine' | 'rough-tunnel' | 'collapsed-shaft' | 'void'
export type GeologistGrade = 'master-geologist' | 'crystal-expert' | 'skilled-miner' | 'apprentice' | 'novice' | 'rock-collector'

export interface ClarifyingMeasure {
  clarity: number
  crystal: Crystal
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
  hasNoDark: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ResonatingMeasure {
  vibration: number
  frequency: Frequency
  hasHighVibration: boolean
  hasResponsive: boolean
  hasEfficient: boolean
  hasNoSluggish: boolean
  hasPerformant: boolean
  hasNoBottlenecked: boolean
  hasTimely: boolean
  hasNoDelayed: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  hasSharp: boolean
  hasNoDull: boolean
  hasPrecise: boolean
  hasNoApproximate: boolean
  sluggishCount: number
  wastefulCount: number
}

export interface SignalingMeasure {
  purity: number
  signal: Signal
  hasHighPurity: boolean
  hasWellNamed: boolean
  hasNoMisnamed: boolean
  hasExpressive: boolean
  hasNoTerse: boolean
  hasClearIntent: boolean
  hasNoAmbiguous: boolean
  hasCommunicative: boolean
  hasNoSilent: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasObvious: boolean
  hasNoSubtle: boolean
  hasResonant: boolean
  misnamedCount: number
  ambiguousCount: number
}

export interface StructuringMeasure {
  strength: number
  lattice: Lattice
  hasHighStrength: boolean
  hasOrganized: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  chaoticCount: number
  untestedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  vein: Vein
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellCommented: boolean
  hasNoUndocumented: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasBattleTested: boolean
  undocumentedCount: number
  adHocCount: number
}

export interface QuartzCrystal {
  file: string
  crystallineClarity: number
  vibrationQuality: number
  resonancePurity: number
  structureStrength: number
  veinWisdom: number
  clarifying: ClarifyingMeasure
  resonating: ResonatingMeasure
  signaling: SignalingMeasure
  structuring: StructuringMeasure
  knowing: KnowingMeasure
  condition: CrystalCondition
  qualityScore: number
}

export interface QuartzVein {
  directory: string
  crystals: QuartzCrystal[]
  avgClarity: number
  avgStrength: number
  avgWisdom: number
  masterCrystalCount: number
  sandCount: number
  veinType: VeinType
  condition: VeinCondition
}

export interface QuartzHorizonResult {
  crystals: QuartzCrystal[]
  veins: QuartzVein[]
  geology: {
    avgClarity: number
    avgStrength: number
    avgWisdom: number
    isCrystalline: boolean
    overallPurity: number
  }
  stats: {
    totalFiles: number
    totalVeins: number
    avgCrystallineClarity: number
    avgVibrationQuality: number
    avgResonancePurity: number
    avgStructureStrength: number
    avgVeinWisdom: number
    masterCrystalCount: number
    clearGemCount: number
    properQuartzCount: number
    milkyStoneCount: number
    roughRockCount: number
    sandCount: number
    hasHighClarityCount: number
    hasHighVibrationCount: number
    hasHighPurityCount: number
    hasHighStrengthCount: number
    hasHighWisdomCount: number
    overallPurity: number
    geologistGrade: GeologistGrade
    bestCrystal: string
    clearest: string
    mostVibrant: string
    purestSignal: string
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

// ─── measureClarifying ─────────────────────────────────────────────

/**
 * @example measureClarifying('export function processItems(items: string[]): string[]')
 */
export function measureClarifying(content: string): ClarifyingMeasure {
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
  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasDoc) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasNamed) score += 4
  if (hasOptional) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    clarity,
    crystal: classifyCrystal(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasConst && !hasEval,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasTransparent: hasExport && !hasAny,
    hasNoObfuscated: !hasEval && hasVar === 0,
    hasClear: hasReturnType && !hasAny,
    hasNoHidden: !hasEval,
    hasVisible: hasExport,
    hasNoInvisible: !hasDebugger,
    hasUnderstandable: hasTypeAnnotation && hasConst,
    hasNoArcane: !hasEval && !hasAny,
    hasLuminous: hasDoc && hasExport && !hasAny,
    hasNoDark: !hasEval && !hasDebugger,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureResonating ─────────────────────────────────────────────

/**
 * @example measureResonating('export function pipe<T>(x: T): T { return [x].map(n => n)[0] }')
 */
export function measureResonating(content: string): ResonatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasConsole = countPattern(content, /\bconsole\.\w+\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasPipeline) score += 6
  if (hasArrow) score += 4
  if (hasGenerics) score += 4
  if (hasInterface) score += 4
  if (hasNamed) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasConsole > 0) score -= Math.min(hasConsole * 2, 6)
  if (hasAny) score -= 4

  const vibration = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const sluggishCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)
  const wastefulCount = (hasConsole > 0 ? 1 : 0) + (hasVar > 0 ? 1 : 0)

  return {
    vibration,
    frequency: classifyFrequency(vibration),
    hasHighVibration: vibration >= 80,
    hasResponsive: hasAsync && hasAwait,
    hasEfficient: hasPipeline && hasArrow,
    hasNoSluggish: !hasEval && !hasDebugger,
    hasPerformant: hasPipeline && !hasAny,
    hasNoBottlenecked: !hasEval,
    hasTimely: hasAsync || hasArrow,
    hasNoDelayed: !hasDebugger,
    hasOptimized: hasGenerics && hasPipeline,
    hasNoWasteful: hasConsole === 0 && hasVar === 0,
    hasSharp: hasReturnType && !hasAny,
    hasNoDull: !hasDebugger && !hasEval,
    hasPrecise: hasReturnType && hasGenerics,
    hasNoApproximate: hasVar === 0,
    sluggishCount,
    wastefulCount,
  }
}

// ─── measureSignaling ──────────────────────────────────────────────

/**
 * @example measureSignaling('export function calculateTotal(items: Item[]): number')
 */
export function measureSignaling(content: string): SignalingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 4
  if (hasDoc) score += 6
  if (hasInterface) score += 4
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4

  const purity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const misnamedCount = hasVar > 0 ? 1 : 0
  const ambiguousCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    purity,
    signal: classifySignal(purity),
    hasHighPurity: purity >= 80,
    hasWellNamed: hasNamed && hasConst,
    hasNoMisnamed: hasVar === 0,
    hasExpressive: hasReturnType && hasDoc,
    hasNoTerse: !hasEval,
    hasClearIntent: hasReturnType && hasNamed,
    hasNoAmbiguous: !hasAny && !hasEval,
    hasCommunicative: hasDoc && hasNamed,
    hasNoSilent: hasExport,
    hasSelfDocumenting: hasReturnType && hasTypeAnnotation,
    hasNoCryptic: !hasEval && !hasAny,
    hasObvious: hasReturnType && hasReadonly,
    hasNoSubtle: !hasAny,
    hasResonant: hasNamed && hasReturnType && hasDoc,
    misnamedCount,
    ambiguousCount,
  }
}

// ─── measureStructuring ────────────────────────────────────────────

/**
 * @example measureStructuring('export interface Store<T> { get(key: string): T; set(key: string, val: T): void }')
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasGenerics) score += 4
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasTryCatch) score += 4
  if (hasPrivate) score += 4
  if (hasAbstract) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const strength = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const chaoticCount = (hasVar > 0 ? 1 : 0) + (hasEval ? 1 : 0)
  const untestedCount = hasVar > 0 ? 1 : 0

  return {
    strength,
    lattice: classifyLattice(strength),
    hasHighStrength: strength >= 80,
    hasOrganized: hasExport && hasConst,
    hasWellStructured: hasInterface && hasExport,
    hasNoChaotic: hasVar === 0 && !hasEval,
    hasModular: hasExport && (hasInterface || hasType),
    hasNoMonolithic: !hasEval,
    hasLayered: hasExtends || hasImplements,
    hasNoFlat: hasInterface || hasClass,
    hasSystematic: hasReturnType && hasConst,
    hasNoHaphazard: !hasEval && hasVar === 0,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    chaoticCount,
    untestedCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('/** docs *\\/ export interface Store<T> { get(key: string): T }')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
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
  if (hasEnum) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasGenerics) score += 6
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const undocumentedCount = hasVar > 0 ? 1 : 0
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    wisdom,
    vein: classifyVein(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellCommented: hasDoc && hasExport,
    hasNoUndocumented: hasVar === 0,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasEstablished: hasExtends && hasImplements,
    hasBattleTested: hasTryCatch && hasExport && !hasAny,
    undocumentedCount,
    adHocCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyCrystal(clarity: number): Crystal {
  if (clarity >= 90) return 'flawless-quartz'
  if (clarity >= 75) return 'clear-crystal'
  if (clarity >= 60) return 'proper-quartz'
  if (clarity >= 40) return 'milky-quartz'
  if (clarity >= 20) return 'opaque-stone'
  return 'no-clarity'
}

function classifyFrequency(vibration: number): Frequency {
  if (vibration >= 90) return 'perfect-oscillator'
  if (vibration >= 75) return 'precise-frequency'
  if (vibration >= 60) return 'proper-vibration'
  if (vibration >= 40) return 'irregular-pulse'
  if (vibration >= 20) return 'static-noise'
  return 'no-vibration'
}

function classifySignal(purity: number): Signal {
  if (purity >= 90) return 'crystal-clear'
  if (purity >= 75) return 'strong-signal'
  if (purity >= 60) return 'proper-tone'
  if (purity >= 40) return 'noisy-channel'
  if (purity >= 20) return 'static'
  return 'no-signal'
}

function classifyLattice(strength: number): Lattice {
  if (strength >= 90) return 'hexagonal-perfect'
  if (strength >= 75) return 'well-formed'
  if (strength >= 60) return 'proper-lattice'
  if (strength >= 40) return 'flawed-crystal'
  if (strength >= 20) return 'amorphous'
  return 'no-structure'
}

function classifyVein(wisdom: number): Vein {
  if (wisdom >= 90) return 'golden-vein'
  if (wisdom >= 75) return 'rich-seam'
  if (wisdom >= 60) return 'proper-deposit'
  if (wisdom >= 40) return 'barren-rock'
  if (wisdom >= 20) return 'empty-stone'
  return 'no-wisdom'
}

export function classifyCrystalCondition(qualityScore: number): CrystalCondition {
  if (qualityScore >= 90) return 'master-crystal'
  if (qualityScore >= 75) return 'clear-gem'
  if (qualityScore >= 60) return 'proper-quartz'
  if (qualityScore >= 40) return 'milky-stone'
  if (qualityScore >= 20) return 'rough-rock'
  return 'sand'
}

export function classifyVeinType(crystals: QuartzCrystal[]): VeinType {
  if (crystals.length === 0) return 'no-vein'
  const avgQs = crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length
  const masterRatio = crystals.filter(c => c.condition === 'master-crystal').length / crystals.length
  if (avgQs >= 85 && masterRatio >= 0.5) return 'mother-lode'
  if (avgQs >= 70 && masterRatio >= 0.3) return 'rich-vein'
  if (avgQs >= 55) return 'proper-seam'
  if (avgQs >= 35) return 'small-pocket'
  if (avgQs >= 15) return 'surface-scatter'
  return 'no-vein'
}

export function classifyVeinCondition(avgClarity: number): VeinCondition {
  if (avgClarity >= 85) return 'crystal-cathedral'
  if (avgClarity >= 70) return 'gem-gallery'
  if (avgClarity >= 55) return 'proper-mine'
  if (avgClarity >= 35) return 'rough-tunnel'
  if (avgClarity >= 15) return 'collapsed-shaft'
  return 'void'
}

export function classifyGeologistGrade(avgPurity: number): GeologistGrade {
  if (avgPurity >= 85) return 'master-geologist'
  if (avgPurity >= 70) return 'crystal-expert'
  if (avgPurity >= 55) return 'skilled-miner'
  if (avgPurity >= 40) return 'apprentice'
  if (avgPurity >= 20) return 'novice'
  return 'rock-collector'
}

// ─── analyzeQuartzCrystal ──────────────────────────────────────────

/**
 * @example analyzeQuartzCrystal(content, 'src/foo.ts')
 */
export function analyzeQuartzCrystal(content: string, filePath: string): QuartzCrystal {
  const clarifying = measureClarifying(content)
  const resonating = measureResonating(content)
  const signaling = measureSignaling(content)
  const structuring = measureStructuring(content)
  const knowing = measureKnowing(content)

  const crystallineClarity = clarifying.clarity
  const vibrationQuality = resonating.vibration
  const resonancePurity = signaling.purity
  const structureStrength = structuring.strength
  const veinWisdom = knowing.wisdom

  const qualityScore = Math.round(
    crystallineClarity * 0.2 +
    vibrationQuality * 0.2 +
    resonancePurity * 0.2 +
    structureStrength * 0.2 +
    veinWisdom * 0.2,
  )

  return {
    file: filePath,
    crystallineClarity,
    vibrationQuality,
    resonancePurity,
    structureStrength,
    veinWisdom,
    clarifying,
    resonating,
    signaling,
    structuring,
    knowing,
    condition: classifyCrystalCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeQuartzVein ─────────────────────────────────────────────

/**
 * @example analyzeQuartzVein(crystals, 'src')
 */
export function analyzeQuartzVein(crystals: QuartzCrystal[], dirPath: string): QuartzVein {
  if (crystals.length === 0) {
    return {
      directory: dirPath,
      crystals: [],
      avgClarity: 0,
      avgStrength: 0,
      avgWisdom: 0,
      masterCrystalCount: 0,
      sandCount: 0,
      veinType: 'no-vein',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(crystals.reduce((s, c) => s + c.crystallineClarity, 0) / crystals.length)
  const avgStrength = Math.round(crystals.reduce((s, c) => s + c.structureStrength, 0) / crystals.length)
  const avgWisdom = Math.round(crystals.reduce((s, c) => s + c.veinWisdom, 0) / crystals.length)
  const masterCrystalCount = crystals.filter(c => c.condition === 'master-crystal').length
  const sandCount = crystals.filter(c => c.condition === 'sand').length

  return {
    directory: dirPath,
    crystals,
    avgClarity,
    avgStrength,
    avgWisdom,
    masterCrystalCount,
    sandCount,
    veinType: classifyVeinType(crystals),
    condition: classifyVeinCondition(avgClarity),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(crystals, veins, geology, stats)
 */
export function generateRecommendations(
  crystals: QuartzCrystal[],
  veins: QuartzVein[],
  _geology: QuartzHorizonResult['geology'],
  stats: QuartzHorizonResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallPurity >= 85 && stats.sandCount === 0) {
    recs.push('Quartz horizon perfection — the crystals stretch to the edge of clarity')
    return recs
  }

  if (stats.avgCrystallineClarity < 60) {
    recs.push('Polish crystalline clarity — add type annotations, docs, remove eval and any')
  }
  if (stats.avgVibrationQuality < 60) {
    recs.push('Tune vibration quality — add async/await, pipelines, generics, remove eval and console')
  }
  if (stats.avgResonancePurity < 60) {
    recs.push('Clarify resonance purity — add named exports, return types, docs, remove eval and var')
  }
  if (stats.avgStructureStrength < 60) {
    recs.push('Strengthen crystal structure — add interfaces, abstractions, type safety, remove eval and var')
  }
  if (stats.avgVeinWisdom < 60) {
    recs.push('Deepen vein wisdom — add documentation, proven patterns, abstractions, remove eval and any')
  }

  if (stats.sandCount > 0) {
    const sandFiles = crystals.filter(c => c.condition === 'sand').map(c => c.file)
    if (sandFiles.length <= 3) {
      recs.push(`Sand detected: ${sandFiles.join(', ')} — these need crystallization`)
    } else {
      recs.push(`${sandFiles.length} sand files detected — they need crystallization`)
    }
  }

  if (veins.length > 1) {
    const collapsedVeins = veins.filter(v => v.condition === 'rough-tunnel' || v.condition === 'collapsed-shaft')
    if (collapsedVeins.length > 0) {
      recs.push(`${collapsedVeins.length} vein(s) have rough or collapsed conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The quartz horizon holds steady — maintain current clarity')
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

// ─── buildQuartzHorizonResult ──────────────────────────────────────

/**
 * @example buildQuartzHorizonResult(['a.ts'], [content])
 */
export async function buildQuartzHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<QuartzHorizonResult> {
  const crystals: QuartzCrystal[] = files.map((file, i) =>
    analyzeQuartzCrystal(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, QuartzCrystal[]>()
  for (const crystal of crystals) {
    const dir = path.dirname(crystal.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(crystal)
    } else {
      dirMap.set(dir, [crystal])
    }
  }

  const veins: QuartzVein[] = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeQuartzVein(dirCrystals, dir),
  )

  const avgCrystallineClarity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.crystallineClarity, 0) / crystals.length)
    : 0
  const avgVibrationQuality = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.vibrationQuality, 0) / crystals.length)
    : 0
  const avgResonancePurity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.resonancePurity, 0) / crystals.length)
    : 0
  const avgStructureStrength = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.structureStrength, 0) / crystals.length)
    : 0
  const avgVeinWisdom = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.veinWisdom, 0) / crystals.length)
    : 0

  const overallPurity = Math.round(
    (avgCrystallineClarity + avgStructureStrength + avgVeinWisdom) / 3,
  )

  const geology = {
    avgClarity: avgCrystallineClarity,
    avgStrength: avgStructureStrength,
    avgWisdom: avgVeinWisdom,
    isCrystalline: overallPurity >= 80,
    overallPurity,
  }

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file
    : ''
  const clearest = crystals.length > 0
    ? crystals.reduce((best, c) => c.crystallineClarity > best.crystallineClarity ? c : best).file
    : ''
  const mostVibrant = crystals.length > 0
    ? crystals.reduce((best, c) => c.vibrationQuality > best.vibrationQuality ? c : best).file
    : ''
  const purestSignal = crystals.length > 0
    ? crystals.reduce((best, c) => c.resonancePurity > best.resonancePurity ? c : best).file
    : ''
  const wisest = crystals.length > 0
    ? crystals.reduce((best, c) => c.veinWisdom > best.veinWisdom ? c : best).file
    : ''

  const stats = {
    totalFiles: crystals.length,
    totalVeins: veins.length,
    avgCrystallineClarity,
    avgVibrationQuality,
    avgResonancePurity,
    avgStructureStrength,
    avgVeinWisdom,
    masterCrystalCount: crystals.filter(c => c.condition === 'master-crystal').length,
    clearGemCount: crystals.filter(c => c.condition === 'clear-gem').length,
    properQuartzCount: crystals.filter(c => c.condition === 'proper-quartz').length,
    milkyStoneCount: crystals.filter(c => c.condition === 'milky-stone').length,
    roughRockCount: crystals.filter(c => c.condition === 'rough-rock').length,
    sandCount: crystals.filter(c => c.condition === 'sand').length,
    hasHighClarityCount: crystals.filter(c => c.clarifying.hasHighClarity).length,
    hasHighVibrationCount: crystals.filter(c => c.resonating.hasHighVibration).length,
    hasHighPurityCount: crystals.filter(c => c.signaling.hasHighPurity).length,
    hasHighStrengthCount: crystals.filter(c => c.structuring.hasHighStrength).length,
    hasHighWisdomCount: crystals.filter(c => c.knowing.hasHighWisdom).length,
    overallPurity,
    geologistGrade: classifyGeologistGrade(overallPurity),
    bestCrystal,
    clearest,
    mostVibrant,
    purestSignal,
    wisest,
  }

  const recommendations = generateRecommendations(crystals, veins, geology, { ...stats, recommendations: [] } as QuartzHorizonResult['stats'])

  return {
    crystals,
    veins,
    geology,
    stats,
    recommendations,
  }
}
