// ─── Interfaces ──────────────────────────────────────────

export interface TransmittingMeasure {
  clarity: number
  crystal:
    | 'flawless-prism'
    | 'clear-crystal'
    | 'proper-glass'
    | 'cloudy-quartz'
    | 'milky-stone'
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
  hasDirect: boolean
  hasDocumented: boolean
  hasIlluminated: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface OscillatingMeasure {
  quality: number
  frequency:
    | 'atomic-precision'
    | 'quartz-oscillator'
    | 'proper-rhythm'
    | 'irregular-beat'
    | 'static'
    | 'no-quality'
  hasHighQuality: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasReliable: boolean
  hasUniform: boolean
  hasHarmonious: boolean
  hasDependable: boolean
  hasRhythmic: boolean
  hasMeasured: boolean
  hasPrecise: boolean
  erraticCount: number
  untestedCount: number
}

export interface ResonatingMeasure {
  purity: number
  signal:
    | 'pure-tone'
    | 'clean-signal'
    | 'proper-resonance'
    | 'noisy-channel'
    | 'static-buzz'
    | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasHonest: boolean
  hasPure: boolean
  hasPolished: boolean
  hasNoiseFree: boolean
  hasUndistorted: boolean
  hasExact: boolean
  hasRefined: boolean
  unsafeCount: number
  contradictoryCount: number
}

export interface SupportingMeasure {
  strength: number
  lattice:
    | 'perfect-lattice'
    | 'strong-crystal'
    | 'proper-structure'
    | 'weak-bonds'
    | 'crumbling'
    | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasRobust: boolean
  hasErrorHandled: boolean
  hasDefensive: boolean
  hasEnduring: boolean
  hasSolid: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasFoundational: boolean
  hasDurable: boolean
  hasGrounded: boolean
  chaoticCount: number
  errorUnhandledCount: number
}

export interface ChannelingMeasure {
  wisdom: number
  vein:
    | 'mother-lode'
    | 'rich-seam'
    | 'proper-vein'
    | 'thin-thread'
    | 'dry-crack'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasPatterned: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasConnected: boolean
  hasAccumulated: boolean
  hackedCount: number
  adHocCount: number
}

export type PrismCondition =
  | 'quartz-masterpiece'
  | 'crystal-horizon'
  | 'proper-mineral'
  | 'dull-stone'
  | 'cracked-rock'
  | 'void'

export interface QuartzPrism {
  file: string
  crystallineClarity: number
  vibrationQuality: number
  resonancePurity: number
  structureStrength: number
  veinWisdom: number
  transmitting: TransmittingMeasure
  oscillating: OscillatingMeasure
  resonating: ResonatingMeasure
  supporting: SupportingMeasure
  channeling: ChannelingMeasure
  condition: PrismCondition
  qualityScore: number
}

export type LayerType =
  | 'crystal-cathedral'
  | 'quartz-stratum'
  | 'proper-layer'
  | 'thin-seam'
  | 'barren-rock'
  | 'no-layer'

export type LayerCondition =
  | 'crystal-canyon'
  | 'quartz-ridge'
  | 'proper-formation'
  | 'dull-outcrop'
  | 'crumbled-stone'
  | 'void'

export interface QuartzLayer {
  directory: string
  prisms: QuartzPrism[]
  avgClarity: number
  avgStrength: number
  avgWisdom: number
  quartzMasterpieceCount: number
  voidCount: number
  layerType: LayerType
  condition: LayerCondition
}

export type GeologistGrade =
  | 'crystal-master'
  | 'vein-reader'
  | 'stone-cutter'
  | 'apprentice'
  | 'novice'
  | 'rock-basher'

export interface QuartzHorizonStats {
  totalFiles: number
  totalLayers: number
  avgCrystallineClarity: number
  avgVibrationQuality: number
  avgResonancePurity: number
  avgStructureStrength: number
  avgVeinWisdom: number
  quartzMasterpieceCount: number
  crystalHorizonCount: number
  properMineralCount: number
  dullStoneCount: number
  crackedRockCount: number
  voidCount: number
  hasHighClarityCount: number
  hasHighQualityCount: number
  hasHighPurityCount: number
  hasHighStrengthCount: number
  hasHighWisdomCount: number
  overallLuminosity: number
  geologistGrade: GeologistGrade
  bestPrism: string
  clearest: string
  mostRhythmic: string
  purest: string
  strongest: string
  wisest: string
}

export interface QuartzHorizonResult {
  prisms: QuartzPrism[]
  layers: QuartzLayer[]
  geology: {
    avgClarity: number
    avgStrength: number
    avgWisdom: number
    isQuartz: boolean
    overallLuminosity: number
  }
  stats: QuartzHorizonStats
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

/** @example measureTransmitting('export function greet(): string { }') */
export function measureTransmitting(content: string): TransmittingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(readonly|private|protected|async)\b/.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minify|uglify)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore')
  const hasUnderstandable = /\b(if|return|throw)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasVisible = /\b(import|export|from)\b/.test(content)
  const hasDirect = /\b(type|interface|<\w+>)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasIlluminated = /\b(try|catch)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDocumented,
    hasIlluminated,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const crystal = classifyCrystal(clarity)

  return {
    clarity,
    crystal,
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
    hasDirect,
    hasDocumented,
    hasIlluminated,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureOscillating('try { if (x) { y() } } catch { }') */
export function measureOscillating(content: string): OscillatingMeasure {
  const hasConsistent = /\b(readonly|as const)\b/.test(content)
  const erraticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasPredictable = /\b(export|public)\b/.test(content)
  const hasNoSurprising = !content.includes('@ts-ignore')
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|unstable|flaky)\b/i.test(content)
  const hasReliable = /\b(try|catch|if|throw)\b/.test(content)
  const hasUniform = /\b(const|readonly)\b/.test(content)
  const hasHarmonious = /\b(async|await|Promise)\b/.test(content)
  const hasDependable = /\b(class|interface|type)\b/.test(content)
  const hasRhythmic = /\b(function|=>|async)\b/.test(content)
  const hasMeasured = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasConsistent,
    hasPredictable,
    hasTested,
    hasStable,
    hasReliable,
    hasUniform,
    hasHarmonious,
    hasPrecise,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60
  const frequency = classifyFrequency(quality)

  return {
    quality,
    frequency,
    hasHighQuality,
    hasConsistent,
    hasNoErratic,
    hasPredictable,
    hasNoSurprising,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasReliable,
    hasUniform,
    hasHarmonious,
    hasDependable,
    hasRhythmic,
    hasMeasured,
    hasPrecise,
    erraticCount,
    untestedCount,
  }
}

/** @example measureResonating('function f(): string { return "" }') */
export function measureResonating(content: string): ResonatingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /\b(const|readonly)\b/.test(content)
  const hasNoWrong = (content.match(/\b(wrong|incorrect|bad)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasConsistent = /\b(readonly|as const)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradict|inconsistent|conflict)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasHonest = !content.includes('@ts-ignore')
  const hasPure = !/\bany\b/.test(content)
  const hasPolished = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoiseFree = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasUndistorted = /\b(export|public)\b/.test(content)
  const hasExact = /:\s*(string|number|boolean|void)/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasAccurate,
    hasClean,
    hasConsistent,
    hasHonest,
    hasPolished,
    hasNoiseFree,
    hasRefined,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60
  const signal = classifySignal(purity)

  return {
    purity,
    signal,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoWrong,
    hasClean,
    hasNoDirty,
    hasConsistent,
    hasNoContradictory,
    hasHonest,
    hasPure,
    hasPolished,
    hasNoiseFree,
    hasUndistorted,
    hasExact,
    hasRefined,
    unsafeCount,
    contradictoryCount,
  }
}

/** @example measureSupporting('export class Analyzer<T> { }') */
export function measureSupporting(content: string): SupportingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god.object|mega)\b/i.test(content)
  const hasOrganized = /\b(class|interface|type|enum)\b/.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const errorUnhandledCount = (content.match(/\bvar\b/g) ?? []).length
  const hasDefensive = /\bif\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasSolid = /\b(class|interface|type|readonly)\b/.test(content)
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|bloated)\b/i.test(content)
  const hasFoundational = /\b(import|export|from)\b/.test(content)
  const hasDurable = /\b(readonly|as const)\b/.test(content)
  const hasGrounded = /\b(function|class|interface)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasRobust,
    hasErrorHandled,
    hasEnduring,
    hasEfficient,
    hasFoundational,
    hasGrounded,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60
  const lattice = classifyLattice(strength)

  return {
    strength,
    lattice,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasOrganized,
    hasRobust,
    hasErrorHandled,
    hasDefensive,
    hasEnduring,
    hasSolid,
    hasEfficient,
    hasNoWasteful,
    hasFoundational,
    hasDurable,
    hasGrounded,
    chaoticCount,
    errorUnhandledCount,
  }
}

/** @example measureChanneling('export interface Config { readonly name: string }') */
export function measureChanneling(content: string): ChannelingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasStrategic = /\b(import|export|from)\b/.test(content)
  const hasConnected = /\b(import|export|from)\b/.test(content)
  const hasAccumulated = /\b(readonly|const|as const)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasDeep,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const vein = classifyVein(wisdom)

  return {
    wisdom,
    vein,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasNoNaive,
    hasPatterned,
    hasInsightful,
    hasStrategic,
    hasConnected,
    hasAccumulated,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyCrystal(score: number): TransmittingMeasure['crystal'] {
  if (score >= 90) return 'flawless-prism'
  if (score >= 75) return 'clear-crystal'
  if (score >= 60) return 'proper-glass'
  if (score >= 40) return 'cloudy-quartz'
  if (score >= 20) return 'milky-stone'
  return 'no-clarity'
}

function classifyFrequency(score: number): OscillatingMeasure['frequency'] {
  if (score >= 90) return 'atomic-precision'
  if (score >= 75) return 'quartz-oscillator'
  if (score >= 60) return 'proper-rhythm'
  if (score >= 40) return 'irregular-beat'
  if (score >= 20) return 'static'
  return 'no-quality'
}

function classifySignal(score: number): ResonatingMeasure['signal'] {
  if (score >= 90) return 'pure-tone'
  if (score >= 75) return 'clean-signal'
  if (score >= 60) return 'proper-resonance'
  if (score >= 40) return 'noisy-channel'
  if (score >= 20) return 'static-buzz'
  return 'no-purity'
}

function classifyLattice(score: number): SupportingMeasure['lattice'] {
  if (score >= 90) return 'perfect-lattice'
  if (score >= 75) return 'strong-crystal'
  if (score >= 60) return 'proper-structure'
  if (score >= 40) return 'weak-bonds'
  if (score >= 20) return 'crumbling'
  return 'no-strength'
}

function classifyVein(score: number): ChannelingMeasure['vein'] {
  if (score >= 90) return 'mother-lode'
  if (score >= 75) return 'rich-seam'
  if (score >= 60) return 'proper-vein'
  if (score >= 40) return 'thin-thread'
  if (score >= 20) return 'dry-crack'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): PrismCondition {
  if (score >= 90) return 'quartz-masterpiece'
  if (score >= 75) return 'crystal-horizon'
  if (score >= 60) return 'proper-mineral'
  if (score >= 40) return 'dull-stone'
  if (score >= 20) return 'cracked-rock'
  return 'void'
}

/** @example classifyLayerType(prisms) */
export function classifyLayerType(prisms: QuartzPrism[]): LayerType {
  if (prisms.length === 0) return 'no-layer'
  const avg = prisms.reduce((s, p) => s + p.qualityScore, 0) / prisms.length
  if (avg >= 90) return 'crystal-cathedral'
  if (avg >= 75) return 'quartz-stratum'
  if (avg >= 60) return 'proper-layer'
  if (avg >= 40) return 'thin-seam'
  if (avg >= 20) return 'barren-rock'
  return 'no-layer'
}

/** @example classifyLayerCondition(avgClarity) */
export function classifyLayerCondition(avgClarity: number): LayerCondition {
  if (avgClarity >= 85) return 'crystal-canyon'
  if (avgClarity >= 70) return 'quartz-ridge'
  if (avgClarity >= 55) return 'proper-formation'
  if (avgClarity >= 35) return 'dull-outcrop'
  if (avgClarity >= 15) return 'crumbled-stone'
  return 'void'
}

/** @example classifyGeologistGrade(80) */
export function classifyGeologistGrade(avgLuminosity: number): GeologistGrade {
  if (avgLuminosity >= 80) return 'crystal-master'
  if (avgLuminosity >= 65) return 'vein-reader'
  if (avgLuminosity >= 50) return 'stone-cutter'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'rock-basher'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeQuartzPrism(content, 'app.ts') */
export function analyzeQuartzPrism(content: string, filePath: string): QuartzPrism {
  const transmitting = measureTransmitting(content)
  const oscillating = measureOscillating(content)
  const resonating = measureResonating(content)
  const supporting = measureSupporting(content)
  const channeling = measureChanneling(content)

  const crystallineClarity = transmitting.clarity
  const vibrationQuality = oscillating.quality
  const resonancePurity = resonating.purity
  const structureStrength = supporting.strength
  const veinWisdom = channeling.wisdom

  const qualityScore = Math.round(
    crystallineClarity * 0.2 +
    vibrationQuality * 0.2 +
    resonancePurity * 0.2 +
    structureStrength * 0.2 +
    veinWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    crystallineClarity,
    vibrationQuality,
    resonancePurity,
    structureStrength,
    veinWisdom,
    transmitting,
    oscillating,
    resonating,
    supporting,
    channeling,
    condition,
    qualityScore,
  }
}

/** @example analyzeQuartzLayer(prisms, 'src') */
export function analyzeQuartzLayer(prisms: QuartzPrism[], dirPath: string): QuartzLayer {
  if (prisms.length === 0) {
    return {
      directory: dirPath,
      prisms: [],
      avgClarity: 0,
      avgStrength: 0,
      avgWisdom: 0,
      quartzMasterpieceCount: 0,
      voidCount: 0,
      layerType: 'no-layer',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    prisms.reduce((s, p) => s + p.crystallineClarity, 0) / prisms.length,
  )
  const avgStrength = Math.round(
    prisms.reduce((s, p) => s + p.structureStrength, 0) / prisms.length,
  )
  const avgWisdom = Math.round(
    prisms.reduce((s, p) => s + p.veinWisdom, 0) / prisms.length,
  )

  const quartzMasterpieceCount = prisms.filter(
    (p) => p.condition === 'quartz-masterpiece',
  ).length
  const voidCount = prisms.filter((p) => p.condition === 'void').length

  const layerType = classifyLayerType(prisms)
  const avgQuality = Math.round(
    prisms.reduce((s, p) => s + p.qualityScore, 0) / prisms.length,
  )
  const condition = classifyLayerCondition(avgQuality)

  return {
    directory: dirPath,
    prisms,
    avgClarity,
    avgStrength,
    avgWisdom,
    quartzMasterpieceCount,
    voidCount,
    layerType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildQuartzHorizonResult(['a.ts'], [content]) */
export async function buildQuartzHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<QuartzHorizonResult> {
  const prisms: QuartzPrism[] = files.map((file, i) =>
    analyzeQuartzPrism(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, QuartzPrism[]>()
  for (const prism of prisms) {
    const dir = prism.file.includes('/')
      ? prism.file.substring(0, prism.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(prism)
    } else {
      dirMap.set(dir, [prism])
    }
  }

  const layers: QuartzLayer[] = Array.from(dirMap.entries()).map(([dir, dirPrisms]) =>
    analyzeQuartzLayer(dirPrisms, dir),
  )

  const avgClarity =
    prisms.length > 0
      ? Math.round(prisms.reduce((s, p) => s + p.crystallineClarity, 0) / prisms.length)
      : 0
  const avgStrength =
    prisms.length > 0
      ? Math.round(prisms.reduce((s, p) => s + p.structureStrength, 0) / prisms.length)
      : 0
  const avgWisdom =
    prisms.length > 0
      ? Math.round(prisms.reduce((s, p) => s + p.veinWisdom, 0) / prisms.length)
      : 0

  const overallLuminosity =
    prisms.length > 0
      ? Math.round(prisms.reduce((s, p) => s + p.qualityScore, 0) / prisms.length)
      : 0
  const isQuartz = overallLuminosity >= 60

  const geology = { avgClarity, avgStrength, avgWisdom, isQuartz, overallLuminosity }

  const avgCrystallineClarity = avgClarity
  const avgVibrationQuality =
    prisms.length > 0
      ? Math.round(prisms.reduce((s, p) => s + p.vibrationQuality, 0) / prisms.length)
      : 0
  const avgResonancePurity =
    prisms.length > 0
      ? Math.round(prisms.reduce((s, p) => s + p.resonancePurity, 0) / prisms.length)
      : 0
  const avgStructureStrength = avgStrength
  const avgVeinWisdom = avgWisdom

  const quartzMasterpieceCount = prisms.filter(
    (p) => p.condition === 'quartz-masterpiece',
  ).length
  const crystalHorizonCount = prisms.filter(
    (p) => p.condition === 'crystal-horizon',
  ).length
  const properMineralCount = prisms.filter(
    (p) => p.condition === 'proper-mineral',
  ).length
  const dullStoneCount = prisms.filter(
    (p) => p.condition === 'dull-stone',
  ).length
  const crackedRockCount = prisms.filter(
    (p) => p.condition === 'cracked-rock',
  ).length
  const voidCount = prisms.filter((p) => p.condition === 'void').length

  const hasHighClarityCount = prisms.filter(
    (p) => p.transmitting.hasHighClarity,
  ).length
  const hasHighQualityCount = prisms.filter(
    (p) => p.oscillating.hasHighQuality,
  ).length
  const hasHighPurityCount = prisms.filter(
    (p) => p.resonating.hasHighPurity,
  ).length
  const hasHighStrengthCount = prisms.filter(
    (p) => p.supporting.hasHighStrength,
  ).length
  const hasHighWisdomCount = prisms.filter(
    (p) => p.channeling.hasHighWisdom,
  ).length

  const geologistGrade = classifyGeologistGrade(overallLuminosity)

  const bestPrism = prisms.length > 0
    ? prisms.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const clearest = prisms.length > 0
    ? prisms.reduce((best, p) => (p.crystallineClarity > best.crystallineClarity ? p : best)).file
    : ''
  const mostRhythmic = prisms.length > 0
    ? prisms.reduce((best, p) => (p.vibrationQuality > best.vibrationQuality ? p : best)).file
    : ''
  const purest = prisms.length > 0
    ? prisms.reduce((best, p) => (p.resonancePurity > best.resonancePurity ? p : best)).file
    : ''
  const strongest = prisms.length > 0
    ? prisms.reduce((best, p) => (p.structureStrength > best.structureStrength ? p : best)).file
    : ''
  const wisest = prisms.length > 0
    ? prisms.reduce((best, p) => (p.veinWisdom > best.veinWisdom ? p : best)).file
    : ''

  const stats: QuartzHorizonStats = {
    totalFiles: files.length,
    totalLayers: layers.length,
    avgCrystallineClarity,
    avgVibrationQuality,
    avgResonancePurity,
    avgStructureStrength,
    avgVeinWisdom,
    quartzMasterpieceCount,
    crystalHorizonCount,
    properMineralCount,
    dullStoneCount,
    crackedRockCount,
    voidCount,
    hasHighClarityCount,
    hasHighQualityCount,
    hasHighPurityCount,
    hasHighStrengthCount,
    hasHighWisdomCount,
    overallLuminosity,
    geologistGrade,
    bestPrism,
    clearest,
    mostRhythmic,
    purest,
    strongest,
    wisest,
  }

  const recommendations = generateRecommendations(prisms, layers, geology, stats)

  return { prisms, layers, geology, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(prisms, layers, geology, stats) */
export function generateRecommendations(
  prisms: QuartzPrism[],
  layers: QuartzLayer[],
  geology: QuartzHorizonResult['geology'],
  stats: QuartzHorizonStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrystallineClarity >= 90 &&
    stats.avgVibrationQuality >= 90 &&
    stats.avgResonancePurity >= 90 &&
    stats.avgStructureStrength >= 90 &&
    stats.avgVeinWisdom >= 90
  ) {
    recs.push(
      'Your quartz skyline is a masterpiece of crystalline perfection! Every prism refracts light into pure understanding!',
    )
    return recs
  }

  if (stats.avgCrystallineClarity < 60) {
    recs.push(
      'Polish the crystal faces — code should transmit light like flawless quartz, transparent from every angle',
    )
  }

  if (stats.avgVibrationQuality < 60) {
    recs.push(
      'Tune the oscillator — code should vibrate with the precision of a quartz crystal defining time itself',
    )
  }

  if (stats.avgResonancePurity < 60) {
    recs.push(
      'Filter the signal — code should resonate like a pure quartz tone, free from noise and distortion',
    )
  }

  if (stats.avgStructureStrength < 60) {
    recs.push(
      'Strengthen the lattice — code should have the structural integrity of quartz that survives billions of years of pressure',
    )
  }

  if (stats.avgVeinWisdom < 60) {
    recs.push(
      'Follow the veins — quartz veins carry the earth\'s deepest knowledge through rock, code should carry wisdom through connections',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The crystals have gone dark — recrystallize the entire formation before the horizon collapses',
    )
  }

  const voidPrisms = prisms.filter((p) => p.condition === 'void')
  if (voidPrisms.length > 0 && voidPrisms.length <= 5) {
    recs.push(
      `Re-examine these opaque stones: ${voidPrisms.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPrisms.length > 5) {
    recs.push(
      `Re-examine these ${voidPrisms.length} opaque stones before the entire vein turns to gravel`,
    )
  }

  const poorLayers = layers.filter(
    (l) => l.condition === 'void' || l.condition === 'dull-outcrop',
  )
  if (poorLayers.length === layers.length && layers.length > 0) {
    recs.push(
      'All formations have eroded — the quartz skyline needs geological reconstruction from bedrock',
    )
  }

  if (recs.length === 0) {
    recs.push('Your quartz skyline refracts understanding across the entire spectrum — keep each crystal face polished to perfection')
  }

  return recs
}
