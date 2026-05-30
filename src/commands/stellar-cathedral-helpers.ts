// ─── Interfaces ────────────────────────────────────────────

import {dirname} from 'node:path'
import fg from 'fast-glob'

export type Pillar = 'quantum-pillar' | 'stellar-column' | 'proper-support' | 'crumbling-base' | 'collapsed-pillar' | 'no-architecture'
export type Star = 'divine-light' | 'sacred-flame' | 'proper-glow' | 'tainted-light' | 'dark-matter' | 'no-sanctity'
export type Vault = 'transparent-dome' | 'clear-arch' | 'proper-opening' | 'foggy-glass' | 'opaque-wall' | 'no-clarity'
export type Measurement = 'planck-accuracy' | 'quantum-precise' | 'proper-measurement' | 'rough-estimate' | 'wild-guess' | 'no-precision'
export type Dawn = 'universal-dawn' | 'stellar-sunrise' | 'proper-ascension' | 'fading-horizon' | 'eternal-night' | 'no-transcendence'
export type StellarCondition = 'stellar-masterpiece' | 'cosmic-temple' | 'proper-sanctuary' | 'fading-chapel' | 'dark-ruin' | 'void'
export type NaveType = 'cosmic-cathedral' | 'stellar-temple' | 'proper-chapel' | 'small-shrine' | 'dark-crypt' | 'no-nave'
export type NaveCondition = 'galactic-basilica' | 'stellar-sanctuary' | 'proper-temple' | 'dim-chapel' | 'dark-ruin' | 'void'
export type ArchitectGrade = 'cosmic-architect' | 'stellar-builder' | 'temple-artisan' | 'apprentice' | 'novice' | 'void-dweller'

export interface AscendingMeasure {
  grandeur: number
  pillar: Pillar
  hasHighGrandeur: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasScalable: boolean
  hasNoBottlenecked: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasArchitectural: boolean
  hasNoAdHoc: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  chaoticCount: number
  tangledCount: number
}

export interface SanctifyingMeasure {
  sanctity: number
  star: Star
  hasHighSanctity: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasTrustworthy: boolean
  hasNoDeceptive: boolean
  hasHonest: boolean
  hasNoMisleading: boolean
  hasPrincipled: boolean
  contaminatedCount: number
  untestedCount: number
}

export interface RevealingMeasure {
  clarity: number
  vault: Vault
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
  hasObvious: boolean
  hasNoSubtle: boolean
  hasRevealed: boolean
  hasNoConcealed: boolean
  hasOpen: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface CalibratingMeasure {
  precision: number
  measurement: Measurement
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasTypeSafe: boolean
  hasNoCasting: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasVerified: boolean
  hasNoUnchecked: boolean
  hasReliable: boolean
  hasNoUnpredictable: boolean
  hasDeterministic: boolean
  wrongCount: number
  buggyCount: number
}

export interface TranscendingMeasure {
  transcendence: number
  dawn: Dawn
  hasHighTranscendence: boolean
  hasInnovative: boolean
  hasNoStagnant: boolean
  hasVisionary: boolean
  hasNoShortSighted: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasFutureProof: boolean
  hasNoBrittle: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasEvolving: boolean
  hasNoFrozen: boolean
  hasProgressive: boolean
  hasNoRegressive: boolean
  hasTransformative: boolean
  hasNoDestructive: boolean
  hasAscending: boolean
  stagnantCount: number
  rigidCount: number
}

export interface StellarRadiance {
  file: string
  cosmicArchitecture: number
  starSanctity: number
  vaultClarity: number
  celestialPrecision: number
  dawnTranscendence: number
  ascending: AscendingMeasure
  sanctifying: SanctifyingMeasure
  revealing: RevealingMeasure
  calibrating: CalibratingMeasure
  transcending: TranscendingMeasure
  condition: StellarCondition
  qualityScore: number
}

export interface StellarNave {
  directory: string
  radiances: StellarRadiance[]
  avgGrandeur: number
  avgPrecision: number
  avgTranscendence: number
  stellarMasterpieceCount: number
  voidCount: number
  naveType: NaveType
  condition: NaveCondition
}

export interface StellarCosmos {
  avgGrandeur: number
  avgPrecision: number
  avgTranscendence: number
  isStellar: boolean
  overallBrilliance: number
}

export interface StellarStats {
  totalFiles: number
  totalNaves: number
  avgCosmicArchitecture: number
  avgStarSanctity: number
  avgVaultClarity: number
  avgCelestialPrecision: number
  avgDawnTranscendence: number
  stellarMasterpieceCount: number
  cosmicTempleCount: number
  properSanctuaryCount: number
  fadingChapelCount: number
  darkRuinCount: number
  voidCount: number
  hasHighGrandeurCount: number
  hasHighSanctityCount: number
  hasHighClarityCount: number
  hasHighPrecisionCount: number
  hasHighTranscendenceCount: number
  overallBrilliance: number
  architectGrade: ArchitectGrade
  bestRadiance: string
  mostGrand: string
  mostSacred: string
  clearest: string
  mostPrecise: string
  mostTranscendent: string
}

export interface StellarCelebration {
  milestone: number
  name: string
  message: string
}

export interface StellarCathedralResult {
  radiances: StellarRadiance[]
  naves: StellarNave[]
  cosmos: StellarCosmos
  stats: StellarStats
  celebration: StellarCelebration
  recommendations: string[]
}

// ─── Utility ─────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Classification Helpers ──────────────────────────────

function classifyPillar(grandeur: number): Pillar {
  if (grandeur >= 90) return 'quantum-pillar'
  if (grandeur >= 75) return 'stellar-column'
  if (grandeur >= 60) return 'proper-support'
  if (grandeur >= 40) return 'crumbling-base'
  if (grandeur >= 20) return 'collapsed-pillar'
  return 'no-architecture'
}

function classifyStar(sanctity: number): Star {
  if (sanctity >= 90) return 'divine-light'
  if (sanctity >= 75) return 'sacred-flame'
  if (sanctity >= 60) return 'proper-glow'
  if (sanctity >= 40) return 'tainted-light'
  if (sanctity >= 20) return 'dark-matter'
  return 'no-sanctity'
}

function classifyVault(clarity: number): Vault {
  if (clarity >= 90) return 'transparent-dome'
  if (clarity >= 75) return 'clear-arch'
  if (clarity >= 60) return 'proper-opening'
  if (clarity >= 40) return 'foggy-glass'
  if (clarity >= 20) return 'opaque-wall'
  return 'no-clarity'
}

function classifyMeasurement(precision: number): Measurement {
  if (precision >= 90) return 'planck-accuracy'
  if (precision >= 75) return 'quantum-precise'
  if (precision >= 60) return 'proper-measurement'
  if (precision >= 40) return 'rough-estimate'
  if (precision >= 20) return 'wild-guess'
  return 'no-precision'
}

function classifyDawn(transcendence: number): Dawn {
  if (transcendence >= 90) return 'universal-dawn'
  if (transcendence >= 75) return 'stellar-sunrise'
  if (transcendence >= 60) return 'proper-ascension'
  if (transcendence >= 40) return 'fading-horizon'
  if (transcendence >= 20) return 'eternal-night'
  return 'no-transcendence'
}

export function classifyStellarCondition(score: number): StellarCondition {
  if (score >= 90) return 'stellar-masterpiece'
  if (score >= 75) return 'cosmic-temple'
  if (score >= 60) return 'proper-sanctuary'
  if (score >= 40) return 'fading-chapel'
  if (score >= 20) return 'dark-ruin'
  return 'void'
}

export function classifyNaveType(radiances: StellarRadiance[]): NaveType {
  if (radiances.length === 0) return 'no-nave'
  const avg = radiances.reduce((s, r) => s + r.qualityScore, 0) / radiances.length
  if (avg >= 85) return 'cosmic-cathedral'
  if (avg >= 70) return 'stellar-temple'
  if (avg >= 55) return 'proper-chapel'
  if (avg >= 35) return 'small-shrine'
  if (avg >= 15) return 'dark-crypt'
  return 'no-nave'
}

export function classifyNaveCondition(avg: number): NaveCondition {
  if (avg >= 85) return 'galactic-basilica'
  if (avg >= 70) return 'stellar-sanctuary'
  if (avg >= 55) return 'proper-temple'
  if (avg >= 35) return 'dim-chapel'
  if (avg >= 15) return 'dark-ruin'
  return 'void'
}

export function classifyArchitectGrade(brilliance: number): ArchitectGrade {
  if (brilliance >= 85) return 'cosmic-architect'
  if (brilliance >= 70) return 'stellar-builder'
  if (brilliance >= 55) return 'temple-artisan'
  if (brilliance >= 40) return 'apprentice'
  if (brilliance >= 20) return 'novice'
  return 'void-dweller'
}

// ─── measureAscending ───────────────────────────────────

/**
 * @example measureAscending('export interface Config<T> extends BaseConfig { readonly items: ReadonlyArray<T> }')
 */
export function measureAscending(content: string): AscendingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 7
  if (hasExport) score += 5
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 5
  if (hasAbstract) score += 6
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 5
  if (hasGenerics) score += 5
  if (hasClass) score += 4
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const chaoticCount = hasVar + (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const tangledCount = (hasEval ? 1 : 0) + hasHackyCast

  const grandeur = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    grandeur,
    pillar: classifyPillar(grandeur),
    hasHighGrandeur: grandeur >= 80,
    hasWellStructured: hasInterface && hasExtends && !hasAny,
    hasNoChaotic: hasVar === 0,
    hasModular: hasInterface || hasClass,
    hasNoMonolithic: !hasAny && hasVar === 0,
    hasScalable: hasGenerics && hasExtends,
    hasNoBottlenecked: !hasEval,
    hasCleanPipelines: hasReturnType && hasExport,
    hasNoTangled: tangledCount === 0,
    hasEfficient: hasPrivate || hasReadonly,
    hasNoWasteful: !hasAny,
    hasOrganized: hasDoc && hasExport,
    hasNoScattered: !hasEval && hasVar === 0,
    hasArchitectural: hasAbstract && hasExtends,
    hasNoAdHoc: hasVar === 0,
    hasElegant: hasGenerics && hasReadonly && !hasAny,
    hasNoClunky: !hasEval && !hasAny,
    chaoticCount,
    tangledCount,
  }
}

// ─── measureSanctifying ──────────────────────────────────

/**
 * @example measureSanctifying('export function parse<T>(input: Readonly<string>): T { try { return JSON.parse(input) } catch { throw new Error("Invalid") } }')
 */
export function measureSanctifying(content: string): SanctifyingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasAsync = hasPattern(content, /\basync\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)

  if (hasDoc) score += 7
  if (hasExport) score += 5
  if (hasInterface) score += 5
  if (hasExtends) score += 5
  if (hasTryCatch) score += 6
  if (hasReturnType) score += 5
  if (hasGenerics) score += 5
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4
  if (hasConst) score += 4
  if (hasAsync) score += 3

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 10
  if (hasAny) score -= 5
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasDebugger) score -= 5
  if (hasTsIgnore) score -= 5

  const contaminatedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)
  const untestedCount = hasVar + (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  const sanctity = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    sanctity,
    star: classifyStar(sanctity),
    hasHighSanctity: sanctity >= 80,
    hasPure: !hasAny && !hasEval && hasHackyCast === 0,
    hasNoContaminated: contaminatedCount === 0,
    hasClean: hasConst && !hasAny,
    hasNoDirty: !hasEval && !hasDebugger,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasHackyCast === 0,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasDocumented: hasDoc,
    hasNoUndocumented: hasDoc,
    hasReliable: hasTryCatch && !hasAny,
    hasNoFlaky: !hasEval,
    hasTrustworthy: hasReturnType && hasConst,
    hasNoDeceptive: !hasTsIgnore,
    hasHonest: !hasAny,
    hasNoMisleading: !hasTsIgnore,
    hasPrincipled: hasInterface || hasExtends,
    contaminatedCount,
    untestedCount,
  }
}

// ─── measureRevealing ────────────────────────────────────

/**
 * @example measureRevealing('/** Calculate the stellar magnitude *\/ export function magnitude(dist: Readonly<Number>): Void {}')
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasDefaultParam = hasPattern(content, /=\s*[{/\[]/)
  const hasDestructure = hasPattern(content, /\{\s*\w+.*\}/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasInterface) score += 5
  if (hasExtends) score += 4
  if (hasReturnType) score += 6
  if (hasGenerics) score += 5
  if (hasNamed) score += 5
  if (hasConst) score += 4
  if (hasArrow) score += 3
  if (hasOptional) score += 3
  if (hasReadonly) score += 3
  if (hasDefaultParam) score += 2
  if (hasDestructure) score += 2

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4

  const crypticCount = hasVar + (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    clarity,
    vault: classifyVault(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasDoc && hasConst,
    hasNoCryptic: crypticCount === 0,
    hasSelfDocumenting: hasNamed && hasReturnType,
    hasNoMystery: !hasEval,
    hasClear: hasReturnType || hasDoc,
    hasNoObfuscated: obfuscatedCount === 0,
    hasTransparent: hasExport && hasReturnType,
    hasNoHidden: !hasAny,
    hasUnderstandable: hasDoc || hasNamed,
    hasNoArcane: !hasEval && !hasAny,
    hasVisible: hasExport,
    hasNoInvisible: hasVar === 0,
    hasObvious: hasConst && hasDoc,
    hasNoSubtle: !hasAny,
    hasRevealed: hasReturnType && hasExport,
    hasNoConcealed: !hasEval,
    hasOpen: hasExport && hasDoc,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureCalibrating ──────────────────────────────────

/**
 * @example measureCalibrating('export function compute<T extends Number>(val: Readonly<T>): T { try { const result = val as T; return result } catch { throw new Error("Calibration failed") } }')
 */
export function measureCalibrating(content: string): CalibratingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasStrictChecks = hasPattern(content, /===|!==/)
  const hasThrow = hasPattern(content, /\bthrow\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 6
  if (hasExport) score += 5
  if (hasInterface) score += 5
  if (hasExtends) score += 5
  if (hasTryCatch) score += 6
  if (hasReturnType) score += 6
  if (hasGenerics) score += 5
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4
  if (hasConst) score += 4
  if (hasStrictChecks) score += 5
  if (hasThrow) score += 3

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 10
  if (hasAny) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasDebugger) score -= 5

  const wrongCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)
  const buggyCount = hasVar + (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    precision,
    measurement: classifyMeasurement(precision),
    hasHighPrecision: precision >= 80,
    hasAccurate: hasReturnType && !hasAny,
    hasNoWrong: wrongCount === 0,
    hasExact: hasStrictChecks && hasReturnType,
    hasNoApproximate: !hasAny,
    hasCorrect: hasConst && hasReturnType,
    hasNoBuggy: buggyCount === 0,
    hasConsistent: hasConst && !hasAny,
    hasNoErratic: !hasEval && !hasDebugger,
    hasTypeSafe: hasReturnType && hasHackyCast === 0,
    hasNoCasting: hasHackyCast === 0,
    hasValidated: hasTryCatch && hasThrow,
    hasNoAssumed: !hasAny,
    hasVerified: hasTryCatch && hasReturnType,
    hasNoUnchecked: !hasAny,
    hasReliable: hasConst && hasTryCatch,
    hasNoUnpredictable: !hasEval,
    hasDeterministic: !hasAny && !hasEval,
    wrongCount,
    buggyCount,
  }
}

// ─── measureTranscending ────────────────────────────────

/**
 * @example measureTranscending('export abstract class Repository<T> extends Base implements IRepo { abstract find(id: String): Promise<T> }')
 */
export function measureTranscending(content: string): TranscendingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasPromise = hasPattern(content, /\bPromise\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 6
  if (hasExport) score += 5
  if (hasInterface) score += 5
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasReturnType) score += 5
  if (hasGenerics) score += 6
  if (hasClass) score += 4
  if (hasAsync) score += 4
  if (hasPromise) score += 4
  if (hasReadonly) score += 3

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const stagnantCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const rigidCount = hasVar + (hasHackyCast > 0 ? 1 : 0)

  const transcendence = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    transcendence,
    dawn: classifyDawn(transcendence),
    hasHighTranscendence: transcendence >= 80,
    hasInnovative: hasAbstract && hasGenerics,
    hasNoStagnant: stagnantCount === 0,
    hasVisionary: hasAbstract && hasExtends,
    hasNoShortSighted: !hasAny && !hasEval,
    hasExtensible: hasGenerics && hasExtends,
    hasNoRigid: rigidCount === 0,
    hasFutureProof: hasInterface && hasAbstract && !hasAny,
    hasNoBrittle: !hasAny,
    hasAdaptive: hasGenerics || hasAsync,
    hasNoStatic: hasVar === 0,
    hasEvolving: hasAbstract && hasImplements,
    hasNoFrozen: !hasEval,
    hasProgressive: hasPromise && hasAsync,
    hasNoRegressive: !hasAny,
    hasTransformative: hasAbstract && hasGenerics && hasImplements,
    hasNoDestructive: !hasEval && !hasAny,
    hasAscending: hasAbstract && hasExtends && hasImplements,
    stagnantCount,
    rigidCount,
  }
}

// ─── analyzeStellarRadiance ──────────────────────────────

/**
 * @example analyzeStellarRadiance(richContent, 'galaxy.ts')
 */
export function analyzeStellarRadiance(content: string, filePath: string): StellarRadiance {
  const ascending = measureAscending(content)
  const sanctifying = measureSanctifying(content)
  const revealing = measureRevealing(content)
  const calibrating = measureCalibrating(content)
  const transcending = measureTranscending(content)

  const cosmicArchitecture = ascending.grandeur
  const starSanctity = sanctifying.sanctity
  const vaultClarity = revealing.clarity
  const celestialPrecision = calibrating.precision
  const dawnTranscendence = transcending.transcendence

  const qualityScore = Math.round(
    cosmicArchitecture * 0.2 +
    starSanctity * 0.2 +
    vaultClarity * 0.2 +
    celestialPrecision * 0.2 +
    dawnTranscendence * 0.2,
  )

  return {
    file: filePath,
    cosmicArchitecture,
    starSanctity,
    vaultClarity,
    celestialPrecision,
    dawnTranscendence,
    ascending,
    sanctifying,
    revealing,
    calibrating,
    transcending,
    condition: classifyStellarCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeStellarNave ──────────────────────────────────

/**
 * @example analyzeStellarNave(radiances, 'src/cosmos')
 */
export function analyzeStellarNave(radiances: StellarRadiance[], dirPath: string): StellarNave {
  if (radiances.length === 0) {
    return {
      directory: dirPath,
      radiances: [],
      avgGrandeur: 0,
      avgPrecision: 0,
      avgTranscendence: 0,
      stellarMasterpieceCount: 0,
      voidCount: 0,
      naveType: 'no-nave',
      condition: 'void',
    }
  }

  const avgGrandeur = Math.round(radiances.reduce((s, r) => s + r.cosmicArchitecture, 0) / radiances.length)
  const avgPrecision = Math.round(radiances.reduce((s, r) => s + r.celestialPrecision, 0) / radiances.length)
  const avgTranscendence = Math.round(radiances.reduce((s, r) => s + r.dawnTranscendence, 0) / radiances.length)

  const stellarMasterpieceCount = radiances.filter(r => r.condition === 'stellar-masterpiece').length
  const voidCount = radiances.filter(r => r.condition === 'void').length

  const naveType = classifyNaveType(radiances)
  const overallNavAvg = Math.round((avgGrandeur + avgPrecision + avgTranscendence) / 3)

  return {
    directory: dirPath,
    radiances,
    avgGrandeur,
    avgPrecision,
    avgTranscendence,
    stellarMasterpieceCount,
    voidCount,
    naveType,
    condition: classifyNaveCondition(overallNavAvg),
  }
}

// ─── generateRecommendations ─────────────────────────────

/**
 * @example generateRecommendations(radiances, naves, cosmos, stats)
 */
export function generateRecommendations(
  radiances: StellarRadiance[],
  naves: StellarNave[],
  cosmos: StellarCosmos,
  stats: StellarStats,
): string[] {
  const recs: string[] = []

  if (cosmos.overallBrilliance >= 90 && stats.voidCount === 0) {
    recs.push('★ Milestone #550 achieved — your stellar cathedral shines with cosmic perfection! ★')
    return recs
  }

  if (stats.avgCosmicArchitecture < 50) {
    recs.push('Build grander cosmic architecture — strengthen structural pillars with interfaces, generics, and clean abstractions')
  }
  if (stats.avgStarSanctity < 50) {
    recs.push('Purify star sanctity — eliminate eval, any, and unsafe casts to let divine light shine through')
  }
  if (stats.avgVaultClarity < 50) {
    recs.push('Enhance vault clarity — add documentation, named exports, and transparent type signatures')
  }
  if (stats.avgCelestialPrecision < 50) {
    recs.push('Calibrate celestial precision — use strict equality, proper error handling, and validated types')
  }
  if (stats.avgDawnTranscendence < 50) {
    recs.push('Pursue dawn transcendence — embrace abstract patterns, extensibility, and future-proof design')
  }

  const collapsed = radiances.filter(r => r.condition === 'void' || r.condition === 'dark-ruin')
  if (collapsed.length > 0 && collapsed.length <= 3) {
    for (const r of collapsed) {
      recs.push(`Restore ${r.file} from ${r.condition} to stellar glory`)
    }
  } else if (collapsed.length > 3) {
    recs.push(`${collapsed.length} radiances trapped in darkness — prioritize restoring foundational files`)
  }

  const dimNaves = naves.filter(n => n.condition === 'dim-chapel' || n.condition === 'dark-ruin' || n.condition === 'void')
  if (dimNaves.length > 0) {
    recs.push(`${dimNaves.length} nave(s) need illumination: ${dimNaves.map(n => n.directory).join(', ')}`)
  }

  if (cosmos.overallBrilliance >= 70 && stats.voidCount === 0) {
    recs.push('The cathedral approaches stellar brilliance — maintain cosmic discipline and reach for universal dawn')
  } else if (cosmos.overallBrilliance >= 50 && stats.voidCount === 0) {
    recs.push('Cosmic foundations solid — continue building toward transcendent architecture')
  }

  if (recs.length === 0) {
    recs.push('The stellar cathedral stands strong — keep building with cosmic intention')
  }

  return recs
}

// ─── gatherFiles ─────────────────────────────────────────

/**
 * @example gatherFiles('/path/to/project', ['.ts'], ['ignore-patterns'])
 */
export async function gatherFiles(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*${ext}`)
  const entries = await fg(patterns, {
    cwd: rootDir,
    ignore: ignorePatterns,
    absolute: false,
    onlyFiles: true,
  })
  return entries.sort()
}

// ─── buildStellarCathedralResult ─────────────────────────

/**
 * @example buildStellarCathedralResult(['a.ts'], [content])
 */
export async function buildStellarCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StellarCathedralResult> {
  const radiances = files.map((file, i) =>
    analyzeStellarRadiance(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StellarRadiance[]>()
  for (const r of radiances) {
    const dir = dirname(r.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(r)
    } else {
      dirMap.set(dir, [r])
    }
  }

  const naves = Array.from(dirMap.entries()).map(([dir, rs]) =>
    analyzeStellarNave(rs, dir),
  )

  const totalFiles = radiances.length
  const avgCosmicArchitecture = totalFiles > 0 ? Math.round(radiances.reduce((s, r) => s + r.cosmicArchitecture, 0) / totalFiles) : 0
  const avgStarSanctity = totalFiles > 0 ? Math.round(radiances.reduce((s, r) => s + r.starSanctity, 0) / totalFiles) : 0
  const avgVaultClarity = totalFiles > 0 ? Math.round(radiances.reduce((s, r) => s + r.vaultClarity, 0) / totalFiles) : 0
  const avgCelestialPrecision = totalFiles > 0 ? Math.round(radiances.reduce((s, r) => s + r.celestialPrecision, 0) / totalFiles) : 0
  const avgDawnTranscendence = totalFiles > 0 ? Math.round(radiances.reduce((s, r) => s + r.dawnTranscendence, 0) / totalFiles) : 0

  const overallBrilliance = Math.round(
    (avgCosmicArchitecture + avgStarSanctity + avgVaultClarity + avgCelestialPrecision + avgDawnTranscendence) / 5,
  )

  const cosmos: StellarCosmos = {
    avgGrandeur: avgCosmicArchitecture,
    avgPrecision: avgCelestialPrecision,
    avgTranscendence: avgDawnTranscendence,
    isStellar: overallBrilliance >= 80,
    overallBrilliance,
  }

  const bestRadiance = radiances.length > 0
    ? radiances.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : 'none'
  const mostGrand = radiances.length > 0
    ? radiances.reduce((best, r) => r.cosmicArchitecture > best.cosmicArchitecture ? r : best).file
    : 'none'
  const mostSacred = radiances.length > 0
    ? radiances.reduce((best, r) => r.starSanctity > best.starSanctity ? r : best).file
    : 'none'
  const clearest = radiances.length > 0
    ? radiances.reduce((best, r) => r.vaultClarity > best.vaultClarity ? r : best).file
    : 'none'
  const mostPrecise = radiances.length > 0
    ? radiances.reduce((best, r) => r.celestialPrecision > best.celestialPrecision ? r : best).file
    : 'none'
  const mostTranscendent = radiances.length > 0
    ? radiances.reduce((best, r) => r.dawnTranscendence > best.dawnTranscendence ? r : best).file
    : 'none'

  const stats: StellarStats = {
    totalFiles,
    totalNaves: naves.length,
    avgCosmicArchitecture,
    avgStarSanctity,
    avgVaultClarity,
    avgCelestialPrecision,
    avgDawnTranscendence,
    stellarMasterpieceCount: radiances.filter(r => r.condition === 'stellar-masterpiece').length,
    cosmicTempleCount: radiances.filter(r => r.condition === 'cosmic-temple').length,
    properSanctuaryCount: radiances.filter(r => r.condition === 'proper-sanctuary').length,
    fadingChapelCount: radiances.filter(r => r.condition === 'fading-chapel').length,
    darkRuinCount: radiances.filter(r => r.condition === 'dark-ruin').length,
    voidCount: radiances.filter(r => r.condition === 'void').length,
    hasHighGrandeurCount: radiances.filter(r => r.ascending.hasHighGrandeur).length,
    hasHighSanctityCount: radiances.filter(r => r.sanctifying.hasHighSanctity).length,
    hasHighClarityCount: radiances.filter(r => r.revealing.hasHighClarity).length,
    hasHighPrecisionCount: radiances.filter(r => r.calibrating.hasHighPrecision).length,
    hasHighTranscendenceCount: radiances.filter(r => r.transcending.hasHighTranscendence).length,
    overallBrilliance,
    architectGrade: classifyArchitectGrade(overallBrilliance),
    bestRadiance,
    mostGrand,
    mostSacred,
    clearest,
    mostPrecise,
    mostTranscendent,
  }

  const recommendations = generateRecommendations(radiances, naves, cosmos, stats)

  const celebration: StellarCelebration = {
    milestone: 550,
    name: 'Stellar Cathedral',
    message: '★ Milestone #550 ★ — From the first line of code to a cathedral spanning galaxies. 550 commands forged, each one a star in the constellation of code excellence.',
  }

  return { radiances, naves, cosmos, stats, celebration, recommendations }
}
