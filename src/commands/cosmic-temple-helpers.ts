// ─── Interfaces ──────────────────────────────────────────

export interface DesigningMeasure {
  architecture: number
  blueprint: 'cosmic-masterwork' | 'stellar-design' | 'proper-structure' | 'haphazard' | 'random-noise' | 'no-architecture'
  hasHighArchitecture: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasOrganized: boolean
  hasScalable: boolean
  hasExtensible: boolean
  hasFutureProof: boolean
  hasAbstracted: boolean
  hasLayered: boolean
  hasDecoupled: boolean
  hasElegant: boolean
  hasTimeless: boolean
  chaoticCount: number
  tangledCount: number
}

export interface SanctifyingMeasure {
  sanctity: number
  star: 'sacred-sirius' | 'blessed-polaris' | 'proper-star' | 'dim-candle' | 'dark-matter' | 'no-sanctity'
  hasHighSanctity: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasRespectful: boolean
  hasHonorable: boolean
  hasPrincipled: boolean
  hasCareful: boolean
  hasDeliberate: boolean
  hasReverent: boolean
  hasDevoted: boolean
  undocumentedCount: number
  untestedCount: number
}

export interface RevealingMeasure {
  clarity: number
  vault: 'crystal-vault' | 'starlit-dome' | 'proper-ceiling' | 'clouded-sky' | 'low-ceiling' | 'no-clarity'
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
  hasPanoramic: boolean
  hasExpansive: boolean
  hasCosmic: boolean
  hasUniversal: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface CalibratingMeasure {
  precision: number
  calibration: 'quantum-exact' | 'astronomical-grade' | 'proper-measurement' | 'approximate' | 'guesswork' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasNoVague: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasCalibrated: boolean
  hasMeasured: boolean
  hasMicrometer: boolean
  approximateCount: number
  unsafeCount: number
}

export interface TranscendingMeasure {
  transcendence: number
  dawn: 'cosmic-ascension' | 'stellar-dawn' | 'proper-sunrise' | 'gray-morning' | 'eternal-night' | 'no-transcendence'
  hasHighTranscendence: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasVisionary: boolean
  hasInnovative: boolean
  hasTranscendent: boolean
  hasEvolving: boolean
  hasAdaptive: boolean
  hasTransformative: boolean
  hasAscendant: boolean
  hasLuminous: boolean
  hasRadiant: boolean
  hasInfinite: boolean
  hackedCount: number
  shallowCount: number
}

export type PillarCondition =
  | 'stellar-masterpiece'
  | 'cosmic-perfection'
  | 'proper-star-temple'
  | 'mortal-chapel'
  | 'ruined-shrine'
  | 'void'

export interface StellarPillar {
  file: string
  cosmicArchitecture: number
  starSanctity: number
  vaultClarity: number
  celestialPrecision: number
  dawnTranscendence: number
  designing: DesigningMeasure
  sanctifying: SanctifyingMeasure
  revealing: RevealingMeasure
  calibrating: CalibratingMeasure
  transcending: TranscendingMeasure
  condition: PillarCondition
  qualityScore: number
  celebration?: string
}

export type NaveType =
  | 'cosmic-cathedral'
  | 'stellar-basilica'
  | 'proper-temple'
  | 'small-chapel'
  | 'empty-void'
  | 'no-nave'

export type NaveCondition =
  | 'universal-cathedral'
  | 'galactic-sanctuary'
  | 'proper-church'
  | 'ruined-abbey'
  | 'empty-space'
  | 'void'

export interface StellarNave {
  directory: string
  pillars: StellarPillar[]
  avgArchitecture: number
  avgPrecision: number
  avgTranscendence: number
  stellarMasterpieceCount: number
  voidCount: number
  naveType: NaveType
  condition: NaveCondition
}

export type ArchitectGrade =
  | 'cosmic-architect'
  | 'stellar-builder'
  | 'temple-architect'
  | 'apprentice'
  | 'novice'
  | 'mortal-builder'

export interface StellarCathedralResult {
  pillars: StellarPillar[]
  naves: StellarNave[]
  cosmos: {
    avgArchitecture: number
    avgPrecision: number
    avgTranscendence: number
    isStellar: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalNaves: number
    avgCosmicArchitecture: number
    avgStarSanctity: number
    avgVaultClarity: number
    avgCelestialPrecision: number
    avgDawnTranscendence: number
    stellarMasterpieceCount: number
    cosmicPerfectionCount: number
    properStarTempleCount: number
    mortalChapelCount: number
    ruinedShrineCount: number
    voidCount: number
    hasHighArchitectureCount: number
    hasHighSanctityCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighTranscendenceCount: number
    overallBrilliance: number
    architectGrade: ArchitectGrade
    bestPillar: string
    bestArchitected: string
    mostSacred: string
    clearest: string
    mostPrecise: string
    mostTranscendent: string
    celebration?: string
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

/** @example classifyPillarCondition(90) */
export function classifyPillarCondition(score: number): PillarCondition {
  if (score >= 90) return 'stellar-masterpiece'
  if (score >= 75) return 'cosmic-perfection'
  if (score >= 60) return 'proper-star-temple'
  if (score >= 40) return 'mortal-chapel'
  if (score >= 20) return 'ruined-shrine'
  return 'void'
}

/** @example classifyNaveType(pillars) */
export function classifyNaveType(pillars: StellarPillar[]): NaveType {
  if (pillars.length === 0) return 'no-nave'
  const avg =
    pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length
  if (avg >= 85) return 'cosmic-cathedral'
  if (avg >= 70) return 'stellar-basilica'
  if (avg >= 55) return 'proper-temple'
  if (avg >= 35) return 'small-chapel'
  return 'empty-void'
}

/** @example classifyNaveCondition(85) */
export function classifyNaveCondition(score: number): NaveCondition {
  if (score >= 85) return 'universal-cathedral'
  if (score >= 70) return 'galactic-sanctuary'
  if (score >= 55) return 'proper-church'
  if (score >= 35) return 'ruined-abbey'
  if (score >= 15) return 'empty-space'
  return 'void'
}

/** @example classifyArchitectGrade(80) */
export function classifyArchitectGrade(avgBrilliance: number): ArchitectGrade {
  if (avgBrilliance >= 80) return 'cosmic-architect'
  if (avgBrilliance >= 65) return 'stellar-builder'
  if (avgBrilliance >= 50) return 'temple-architect'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'mortal-builder'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDesigning('class X { readonly y: string }') */
export function measureDesigning(content: string): DesigningMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasCleanPipelines = /\b(function|=>)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|coupled)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasScalable = /\b(async|await|Promise)\b/.test(content)
  const hasExtensible = /\b(try|catch|if)\b/.test(content)
  const hasFutureProof = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAbstracted = /<T>/.test(content)
  const hasLayered = /\b(interface)\b/.test(content)
  const hasDecoupled = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasElegant = /\b(const|readonly)\b/.test(content)
  const hasTimeless = !/\bany\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasOrganized,
    hasScalable,
    hasExtensible,
    hasFutureProof,
    hasAbstracted,
    hasLayered,
    hasDecoupled,
    hasElegant,
    hasTimeless,
  ]

  const architecture = computeScore(positiveBooleans)
  const hasHighArchitecture = architecture >= 60

  let blueprint: DesigningMeasure['blueprint'] = 'no-architecture'
  if (architecture >= 90) blueprint = 'cosmic-masterwork'
  else if (architecture >= 75) blueprint = 'stellar-design'
  else if (architecture >= 60) blueprint = 'proper-structure'
  else if (architecture >= 40) blueprint = 'haphazard'
  else if (architecture >= 20) blueprint = 'random-noise'

  return {
    architecture,
    blueprint,
    hasHighArchitecture,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasOrganized,
    hasScalable,
    hasExtensible,
    hasFutureProof,
    hasAbstracted,
    hasLayered,
    hasDecoupled,
    hasElegant,
    hasTimeless,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureSanctifying('export class X { readonly y: string }') */
export function measureSanctifying(content: string): SanctifyingMeasure {
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = 0
  const hasNoUndocumented = true
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval|Function)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasRespectful = /\b(const|readonly)\b/.test(content)
  const hasHonorable = /\b(class|interface|type)\b/.test(content)
  const hasPrincipled = /\b(import|export)\b/.test(content)
  const hasCareful = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDeliberate = /\b(readonly|private|protected)\b/.test(content)
  const hasReverent = /\b(async|await|Promise)\b/.test(content)
  const hasDevoted = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasDocumented,
    hasNoUndocumented,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasRespectful,
    hasHonorable,
    hasPrincipled,
    hasCareful,
    hasDeliberate,
    hasReverent,
    hasDevoted,
  ]

  const sanctity = computeScore(positiveBooleans)
  const hasHighSanctity = sanctity >= 60

  let star: SanctifyingMeasure['star'] = 'no-sanctity'
  if (sanctity >= 90) star = 'sacred-sirius'
  else if (sanctity >= 75) star = 'blessed-polaris'
  else if (sanctity >= 60) star = 'proper-star'
  else if (sanctity >= 40) star = 'dim-candle'
  else if (sanctity >= 20) star = 'dark-matter'

  return {
    sanctity,
    star,
    hasHighSanctity,
    hasDocumented,
    hasNoUndocumented,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasRespectful,
    hasHonorable,
    hasPrincipled,
    hasCareful,
    hasDeliberate,
    hasReverent,
    hasDevoted,
    undocumentedCount,
    untestedCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
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
  const hasIlluminated = /\b(const|readonly)\b/.test(content)
  const hasRevealed = /\b(try|catch|if)\b/.test(content)
  const hasPanoramic = /\b(async|await|Promise)\b/.test(content)
  const hasExpansive = /\b(interface)\b/.test(content)
  const hasCosmic = /<T>/.test(content)
  const hasUniversal = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasIlluminated,
    hasRevealed,
    hasPanoramic,
    hasExpansive,
    hasCosmic,
    hasUniversal,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let vault: RevealingMeasure['vault'] = 'no-clarity'
  if (clarity >= 90) vault = 'crystal-vault'
  else if (clarity >= 75) vault = 'starlit-dome'
  else if (clarity >= 60) vault = 'proper-ceiling'
  else if (clarity >= 40) vault = 'clouded-sky'
  else if (clarity >= 20) vault = 'low-ceiling'

  return {
    clarity,
    vault,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasIlluminated,
    hasRevealed,
    hasPanoramic,
    hasExpansive,
    hasCosmic,
    hasUniversal,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureCalibrating('const x: string = ""') */
export function measureCalibrating(content: string): CalibratingMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const vagueCount = (content.match(/\b(vague|rough|approximate)\b/gi) ?? []).length
  const hasNoVague = vagueCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval|Function)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = /\b(function|=>|return)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\b(const|readonly)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCalibrated = /\b(try|catch|if)\b/.test(content)
  const hasMeasured = /\b(async|await|Promise)\b/.test(content)
  const hasMicrometer = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasNoVague,
    hasTypeSafe,
    hasNoUnsafe,
    hasPrecise,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasCalibrated,
    hasMeasured,
    hasMicrometer,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let calibration: CalibratingMeasure['calibration'] = 'no-precision'
  if (precision >= 90) calibration = 'quantum-exact'
  else if (precision >= 75) calibration = 'astronomical-grade'
  else if (precision >= 60) calibration = 'proper-measurement'
  else if (precision >= 40) calibration = 'approximate'
  else if (precision >= 20) calibration = 'guesswork'

  return {
    precision,
    calibration,
    hasHighPrecision,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasNoVague,
    hasTypeSafe,
    hasNoUnsafe,
    hasPrecise,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasCalibrated,
    hasMeasured,
    hasMicrometer,
    approximateCount,
    unsafeCount,
  }
}

/** @example measureTranscending('try { x } catch { y }') */
export function measureTranscending(content: string): TranscendingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(import|export)\b/.test(content)
  const hasDeep = /\b(function|=>|return)\b/.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasVisionary = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInnovative = /<T>/.test(content)
  const hasTranscendent = /\b(readonly|as const)\b/.test(content)
  const hasEvolving = /\b(try|catch|if)\b/.test(content)
  const hasAdaptive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTransformative = /\b(const|readonly)\b/.test(content)
  const hasAscendant = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasLuminous = /\b(readonly|private|protected)\b/.test(content)
  const hasRadiant = !/\bany\b/.test(content)
  const hasInfinite = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasStrategic,
    hasVisionary,
    hasInnovative,
    hasTranscendent,
    hasEvolving,
    hasAdaptive,
    hasTransformative,
    hasAscendant,
    hasLuminous,
    hasRadiant,
    hasInfinite,
  ]

  const transcendence = computeScore(positiveBooleans)
  const hasHighTranscendence = transcendence >= 60

  let dawn: TranscendingMeasure['dawn'] = 'no-transcendence'
  if (transcendence >= 90) dawn = 'cosmic-ascension'
  else if (transcendence >= 75) dawn = 'stellar-dawn'
  else if (transcendence >= 60) dawn = 'proper-sunrise'
  else if (transcendence >= 40) dawn = 'gray-morning'
  else if (transcendence >= 20) dawn = 'eternal-night'

  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  return {
    transcendence,
    dawn,
    hasHighTranscendence,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasStrategic,
    hasVisionary,
    hasInnovative,
    hasTranscendent,
    hasEvolving,
    hasAdaptive,
    hasTransformative,
    hasAscendant,
    hasLuminous,
    hasRadiant,
    hasInfinite,
    hackedCount,
    shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeStellarPillar(content, 'app.ts') */
export function analyzeStellarPillar(content: string, filePath: string): StellarPillar {
  const designing = measureDesigning(content)
  const sanctifying = measureSanctifying(content)
  const revealing = measureRevealing(content)
  const calibrating = measureCalibrating(content)
  const transcending = measureTranscending(content)

  const cosmicArchitecture = designing.architecture
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

  const condition = classifyPillarCondition(qualityScore)

  const isSelfAnalyzing =
    filePath.includes('stellar-cathedral') ||
    filePath.includes('cosmic-temple') ||
    filePath.includes('star-sanctuary')

  const celebration = isSelfAnalyzing
    ? '★ ★ MEGA MILESTONE #600 — Stellar Cathedral ★ ★'
    : undefined

  return {
    file: filePath,
    cosmicArchitecture,
    starSanctity,
    vaultClarity,
    celestialPrecision,
    dawnTranscendence,
    designing,
    sanctifying,
    revealing,
    calibrating,
    transcending,
    condition,
    qualityScore,
    celebration,
  }
}

/** @example analyzeStellarNave(pillars, 'src') */
export function analyzeStellarNave(pillars: StellarPillar[], dirPath: string): StellarNave {
  if (pillars.length === 0) {
    return {
      directory: dirPath,
      pillars: [],
      avgArchitecture: 0,
      avgPrecision: 0,
      avgTranscendence: 0,
      stellarMasterpieceCount: 0,
      voidCount: 0,
      naveType: 'no-nave',
      condition: 'void',
    }
  }

  const avgArchitecture = Math.round(
    pillars.reduce((s, p) => s + p.cosmicArchitecture, 0) / pillars.length,
  )
  const avgPrecision = Math.round(
    pillars.reduce((s, p) => s + p.celestialPrecision, 0) / pillars.length,
  )
  const avgTranscendence = Math.round(
    pillars.reduce((s, p) => s + p.dawnTranscendence, 0) / pillars.length,
  )

  const stellarMasterpieceCount = pillars.filter(
    (p) => p.condition === 'stellar-masterpiece',
  ).length
  const voidCount = pillars.filter((p) => p.condition === 'void').length

  const naveType = classifyNaveType(pillars)
  const avgQuality = Math.round(
    pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length,
  )
  const condition = classifyNaveCondition(avgQuality)

  return {
    directory: dirPath,
    pillars,
    avgArchitecture,
    avgPrecision,
    avgTranscendence,
    stellarMasterpieceCount,
    voidCount,
    naveType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildStellarCathedralResult(['a.ts'], [content]) */
export async function buildStellarCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StellarCathedralResult> {
  const pillars: StellarPillar[] = files.map((file, i) =>
    analyzeStellarPillar(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StellarPillar[]>()
  for (const pillar of pillars) {
    const dir = pillar.file.includes('/')
      ? pillar.file.substring(0, pillar.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(pillar)
    } else {
      dirMap.set(dir, [pillar])
    }
  }

  const naves: StellarNave[] = Array.from(dirMap.entries()).map(([dir, dirPillars]) =>
    analyzeStellarNave(dirPillars, dir),
  )

  const avgCosmicArchitecture =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.cosmicArchitecture, 0) / pillars.length)
      : 0
  const avgStarSanctity =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.starSanctity, 0) / pillars.length)
      : 0
  const avgVaultClarity =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.vaultClarity, 0) / pillars.length)
      : 0
  const avgCelestialPrecision =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.celestialPrecision, 0) / pillars.length)
      : 0
  const avgDawnTranscendence =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.dawnTranscendence, 0) / pillars.length)
      : 0

  const overallBrilliance =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)
      : 0
  const isStellar = overallBrilliance >= 60

  const cosmos = {
    avgArchitecture: avgCosmicArchitecture,
    avgPrecision: avgCelestialPrecision,
    avgTranscendence: avgDawnTranscendence,
    isStellar,
    overallBrilliance,
  }

  const stellarMasterpieceCount = pillars.filter(
    (p) => p.condition === 'stellar-masterpiece',
  ).length
  const cosmicPerfectionCount = pillars.filter(
    (p) => p.condition === 'cosmic-perfection',
  ).length
  const properStarTempleCount = pillars.filter(
    (p) => p.condition === 'proper-star-temple',
  ).length
  const mortalChapelCount = pillars.filter(
    (p) => p.condition === 'mortal-chapel',
  ).length
  const ruinedShrineCount = pillars.filter(
    (p) => p.condition === 'ruined-shrine',
  ).length
  const voidCount = pillars.filter((p) => p.condition === 'void').length

  const hasHighArchitectureCount = pillars.filter(
    (p) => p.designing.hasHighArchitecture,
  ).length
  const hasHighSanctityCount = pillars.filter(
    (p) => p.sanctifying.hasHighSanctity,
  ).length
  const hasHighClarityCount = pillars.filter(
    (p) => p.revealing.hasHighClarity,
  ).length
  const hasHighPrecisionCount = pillars.filter(
    (p) => p.calibrating.hasHighPrecision,
  ).length
  const hasHighTranscendenceCount = pillars.filter(
    (p) => p.transcending.hasHighTranscendence,
  ).length

  const architectGrade = classifyArchitectGrade(overallBrilliance)

  const bestPillar = pillars.length > 0
    ? pillars.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const bestArchitected = pillars.length > 0
    ? pillars.reduce((best, p) => (p.cosmicArchitecture > best.cosmicArchitecture ? p : best)).file
    : ''
  const mostSacred = pillars.length > 0
    ? pillars.reduce((best, p) => (p.starSanctity > best.starSanctity ? p : best)).file
    : ''
  const clearest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.vaultClarity > best.vaultClarity ? p : best)).file
    : ''
  const mostPrecise = pillars.length > 0
    ? pillars.reduce((best, p) => (p.celestialPrecision > best.celestialPrecision ? p : best)).file
    : ''
  const mostTranscendent = pillars.length > 0
    ? pillars.reduce((best, p) => (p.dawnTranscendence > best.dawnTranscendence ? p : best)).file
    : ''

  const hasCelebration = pillars.some((p) => p.celebration !== undefined)
  const statsCelebration = hasCelebration
    ? '★ ★ 600 COMMANDS — A cathedral of code reaching for the stars ★ ★'
    : undefined

  const stats: StellarCathedralResult['stats'] = {
    totalFiles: files.length,
    totalNaves: naves.length,
    avgCosmicArchitecture,
    avgStarSanctity,
    avgVaultClarity,
    avgCelestialPrecision,
    avgDawnTranscendence,
    stellarMasterpieceCount,
    cosmicPerfectionCount,
    properStarTempleCount,
    mortalChapelCount,
    ruinedShrineCount,
    voidCount,
    hasHighArchitectureCount,
    hasHighSanctityCount,
    hasHighClarityCount,
    hasHighPrecisionCount,
    hasHighTranscendenceCount,
    overallBrilliance,
    architectGrade,
    bestPillar,
    bestArchitected,
    mostSacred,
    clearest,
    mostPrecise,
    mostTranscendent,
    celebration: statsCelebration,
  }

  const recommendations = generateRecommendations(pillars, naves, cosmos, stats)

  return { pillars, naves, cosmos, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(pillars, naves, cosmos, stats) */
export function generateRecommendations(
  pillars: StellarPillar[],
  naves: StellarNave[],
  cosmos: StellarCathedralResult['cosmos'],
  stats: StellarCathedralResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCosmicArchitecture >= 90 &&
    stats.avgStarSanctity >= 90 &&
    stats.avgVaultClarity >= 90 &&
    stats.avgCelestialPrecision >= 90 &&
    stats.avgDawnTranscendence >= 90
  ) {
    recs.push(
      'Your stellar cathedral is a cosmic masterpiece! Every pillar combines cosmic architecture with star sanctity, vault clarity, celestial precision, and dawn transcendence into a cathedral that reaches for the stars!',
    )
    return recs
  }

  if (stats.avgCosmicArchitecture < 60) {
    recs.push(
      'Elevate the cosmic architecture — a stellar cathedral requires cosmic-scale structural thinking; modular, layered, decoupled, and timeless design that transcends mortal limitations',
    )
  }

  if (stats.avgStarSanctity < 60) {
    recs.push(
      'Deepen the star sanctity — code treated with reverence through documentation, testing, type safety, and principled patterns shines like sacred Sirius in the night sky',
    )
  }

  if (stats.avgVaultClarity < 60) {
    recs.push(
      'Raise the vault clarity — cathedral vaults represent the highest point of understanding; your code should be transparent, readable, self-documenting, and visible from every angle',
    )
  }

  if (stats.avgCelestialPrecision < 60) {
    recs.push(
      'Sharpen the celestial precision — stellar navigation requires precision beyond human intuition; every type annotation and function signature should be quantum-exact',
    )
  }

  if (stats.avgDawnTranscendence < 60) {
    recs.push(
      'Achieve dawn transcendence — transcendence is when limitation yields; your code should rise above through principled architecture, strategic vision, and transformative patterns',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The cathedral stands empty — until the first cosmic stones are laid, no pillars can support the vault of understanding',
    )
  }

  const voidPillars = pillars.filter((p) => p.condition === 'void')
  if (voidPillars.length > 0 && voidPillars.length <= 5) {
    recs.push(
      `Rebuild these ruined shrines: ${voidPillars.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPillars.length > 5) {
    recs.push(
      `Rebuild these ${voidPillars.length} ruined shrines before the entire cathedral collapses into void`,
    )
  }

  const poorNaves = naves.filter(
    (n) => n.condition === 'void' || n.condition === 'empty-space',
  )
  if (poorNaves.length === naves.length && naves.length > 0) {
    recs.push(
      'All naves are empty spaces — the stellar cathedral needs a complete reconstruction from foundation to vault',
    )
  }

  if (recs.length === 0) {
    recs.push('Your stellar cathedral rises magnificently — each pillar a testament to cosmic architecture, star sanctity, vault clarity, celestial precision, and dawn transcendence')
  }

  return recs
}
