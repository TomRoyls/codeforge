// ─── Interfaces ──────────────────────────────────────────

export interface TransmittingMeasure {
  clarity: number
  crystal: 'flawless-prism' | 'clear-crystal' | 'proper-quartz' | 'cloudy-mineral' | 'milky-stone' | 'no-clarity'
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
  hasDocumented: boolean
  hasIlluminated: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasExpressive: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface OscillatingMeasure {
  quality: number
  frequency: 'atomic-precision' | 'quartz-oscillator' | 'proper-rhythm' | 'irregular-beat' | 'static' | 'no-quality'
  hasHighQuality: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPredictable: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasReliable: boolean
  hasUniform: boolean
  hasStable: boolean
  hasPrecise: boolean
  hasMeasured: boolean
  hasRhythmic: boolean
  hasHarmonious: boolean
  hasDependable: boolean
  hasDisciplined: boolean
  hasCalibrated: boolean
  erraticCount: number
  untestedCount: number
}

export interface ResonatingMeasure {
  purity: number
  signal: 'pure-tone' | 'clean-signal' | 'proper-resonance' | 'noisy-channel' | 'static' | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasClean: boolean
  hasConsistent: boolean
  hasHonest: boolean
  hasFaithful: boolean
  hasExact: boolean
  hasRefined: boolean
  hasNoiseFree: boolean
  hasUndistorted: boolean
  hasPure: boolean
  hasPolished: boolean
  hasPrecise: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SupportingMeasure {
  strength: number
  lattice: 'perfect-lattice' | 'strong-crystal' | 'proper-structure' | 'weak-bonds' | 'crumbling' | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasRobust: boolean
  hasErrorHandled: boolean
  hasDefensive: boolean
  hasSolid: boolean
  hasEnduring: boolean
  hasEfficient: boolean
  hasDurable: boolean
  hasGrounded: boolean
  hasFoundational: boolean
  hasReinforced: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface ChannelingMeasure {
  wisdom: number
  vein: 'mother-lode' | 'rich-seam' | 'proper-vein' | 'thin-thread' | 'dry-crack' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasProven: boolean
  hasDeep: boolean
  hasMature: boolean
  hasPatterned: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasConnected: boolean
  hasEvolved: boolean
  hasReflective: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hasExperienced: boolean
  hackedCount: number
  shallowCount: number
}

export type QuartzCondition =
  | 'quartz-masterpiece'
  | 'perfect-crystal'
  | 'proper-mineral'
  | 'cloudy-stone'
  | 'cracked-rock'
  | 'void'

export interface QuartzCrystal {
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
  condition: QuartzCondition
  qualityScore: number
}

export type StratumType =
  | 'crystal-cathedral'
  | 'quartz-stratum'
  | 'proper-layer'
  | 'thin-seam'
  | 'barren-rock'
  | 'no-stratum'

export type StratumCondition =
  | 'crystal-canyon'
  | 'quartz-ridge'
  | 'proper-formation'
  | 'dull-outcrop'
  | 'rubble'
  | 'void'

export interface QuartzStratum {
  directory: string
  crystals: QuartzCrystal[]
  avgClarity: number
  avgStrength: number
  avgWisdom: number
  quartzMasterpieceCount: number
  voidCount: number
  stratumType: StratumType
  condition: StratumCondition
}

export type GeologistGrade = 'master-geologist' | 'crystal-reader' | 'proper-miner' | 'apprentice' | 'novice' | 'rock-basher'

export interface QuartzMeridianResult {
  crystals: QuartzCrystal[]
  strata: QuartzStratum[]
  geology: {
    avgClarity: number
    avgStrength: number
    avgWisdom: number
    isQuartz: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalStrata: number
    avgCrystallineClarity: number
    avgVibrationQuality: number
    avgResonancePurity: number
    avgStructureStrength: number
    avgVeinWisdom: number
    quartzMasterpieceCount: number
    perfectCrystalCount: number
    properMineralCount: number
    cloudyStoneCount: number
    crackedRockCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighQualityCount: number
    hasHighPurityCount: number
    hasHighStrengthCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    geologistGrade: GeologistGrade
    bestCrystal: string
    clearest: string
    mostPrecise: string
    purest: string
    strongest: string
    wisest: string
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

/** @example classifyQuartzCondition(90) */
export function classifyQuartzCondition(score: number): QuartzCondition {
  if (score >= 90) return 'quartz-masterpiece'
  if (score >= 75) return 'perfect-crystal'
  if (score >= 60) return 'proper-mineral'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'cracked-rock'
  return 'void'
}

/** @example classifyStratumType(crystals) */
export function classifyStratumType(crystals: QuartzCrystal[]): StratumType {
  if (crystals.length === 0) return 'no-stratum'
  const avg = crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length
  if (avg >= 85) return 'crystal-cathedral'
  if (avg >= 70) return 'quartz-stratum'
  if (avg >= 55) return 'proper-layer'
  if (avg >= 35) return 'thin-seam'
  return 'barren-rock'
}

/** @example classifyStratumCondition(85) */
export function classifyStratumCondition(score: number): StratumCondition {
  if (score >= 85) return 'crystal-canyon'
  if (score >= 70) return 'quartz-ridge'
  if (score >= 55) return 'proper-formation'
  if (score >= 35) return 'dull-outcrop'
  if (score >= 15) return 'rubble'
  return 'void'
}

/** @example classifyGeologistGrade(80) */
export function classifyGeologistGrade(avgLuminosity: number): GeologistGrade {
  if (avgLuminosity >= 80) return 'master-geologist'
  if (avgLuminosity >= 65) return 'crystal-reader'
  if (avgLuminosity >= 50) return 'proper-miner'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'rock-basher'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureTransmitting('class X { readonly y: string }') */
export function measureTransmitting(content: string): TransmittingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(import|export)\b/.test(content)
  const hasUnderstandable = /\b(async|await|Promise)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasIlluminated = /\b(try|catch|if)\b/.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasRevealed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasExpressive = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasDocumented, hasIlluminated, hasOpen, hasRevealed, hasExpressive,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let crystal: TransmittingMeasure['crystal'] = 'no-clarity'
  if (clarity >= 90) crystal = 'flawless-prism'
  else if (clarity >= 75) crystal = 'clear-crystal'
  else if (clarity >= 60) crystal = 'proper-quartz'
  else if (clarity >= 40) crystal = 'cloudy-mineral'
  else if (clarity >= 20) crystal = 'milky-stone'

  return {
    clarity, crystal, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasDocumented, hasIlluminated, hasOpen, hasRevealed, hasExpressive,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureOscillating('try { x } catch { y }') */
export function measureOscillating(content: string): OscillatingMeasure {
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const erraticCount = (content.match(/\b(erratic|unpredictable|random|flaky)\b/gi) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasPredictable = /\b(const|readonly)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasReliable = !/\bany\b/.test(content)
  const hasUniform = /\b(readonly|private|protected)\b/.test(content)
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasMeasured = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRhythmic = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = /\b(function|=>|return)\b/.test(content)
  const hasDependable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasDisciplined = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasCalibrated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasConsistent, hasNoErratic, hasPredictable, hasTested, hasNoUntested,
    hasReliable, hasUniform, hasStable, hasPrecise, hasMeasured,
    hasRhythmic, hasHarmonious, hasDependable, hasDisciplined, hasCalibrated,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60

  let frequency: OscillatingMeasure['frequency'] = 'no-quality'
  if (quality >= 90) frequency = 'atomic-precision'
  else if (quality >= 75) frequency = 'quartz-oscillator'
  else if (quality >= 60) frequency = 'proper-rhythm'
  else if (quality >= 40) frequency = 'irregular-beat'
  else if (quality >= 20) frequency = 'static'

  return {
    quality, frequency, hasHighQuality,
    hasConsistent, hasNoErratic, hasPredictable, hasTested, hasNoUntested,
    hasReliable, hasUniform, hasStable, hasPrecise, hasMeasured,
    hasRhythmic, hasHarmonious, hasDependable, hasDisciplined, hasCalibrated,
    erraticCount, untestedCount,
  }
}

/** @example measureResonating('const x: string = "ok"') */
export function measureResonating(content: string): ResonatingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\b(unsafe|any)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = !/\bany\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|guess|hack)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const hasHonest = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasFaithful = /\b(import|export)\b/.test(content)
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasRefined = /\b(const|readonly)\b/.test(content)
  const hasNoiseFree = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUndistorted = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPure = /\b(function|=>|return)\b/.test(content)
  const hasPolished = /\b(async|await|Promise)\b/.test(content)
  const hasPrecise = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasClean,
    hasConsistent, hasHonest, hasFaithful, hasExact, hasRefined,
    hasNoiseFree, hasUndistorted, hasPure, hasPolished, hasPrecise,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let signal: ResonatingMeasure['signal'] = 'no-purity'
  if (purity >= 90) signal = 'pure-tone'
  else if (purity >= 75) signal = 'clean-signal'
  else if (purity >= 60) signal = 'proper-resonance'
  else if (purity >= 40) signal = 'noisy-channel'
  else if (purity >= 20) signal = 'static'

  return {
    purity, signal, hasHighPurity,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasClean,
    hasConsistent, hasHonest, hasFaithful, hasExact, hasRefined,
    hasNoiseFree, hasUndistorted, hasPure, hasPolished, hasPrecise,
    unsafeCount, approximateCount,
  }
}

/** @example measureSupporting('export class X { readonly y: string }') */
export function measureSupporting(content: string): SupportingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSolid = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const hasDurable = /\b(function|=>|return)\b/.test(content)
  const hasGrounded = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFoundational = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReinforced = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasRobust, hasErrorHandled, hasDefensive, hasSolid, hasEnduring,
    hasEfficient, hasDurable, hasGrounded, hasFoundational, hasReinforced,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let lattice: SupportingMeasure['lattice'] = 'no-strength'
  if (strength >= 90) lattice = 'perfect-lattice'
  else if (strength >= 75) lattice = 'strong-crystal'
  else if (strength >= 60) lattice = 'proper-structure'
  else if (strength >= 40) lattice = 'weak-bonds'
  else if (strength >= 20) lattice = 'crumbling'

  return {
    strength, lattice, hasHighStrength,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasRobust, hasErrorHandled, hasDefensive, hasSolid, hasEnduring,
    hasEfficient, hasDurable, hasGrounded, hasFoundational, hasReinforced,
    chaoticCount, monolithicCount,
  }
}

/** @example measureChanneling('export class X { readonly y: string }') */
export function measureChanneling(content: string): ChannelingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasMature = /\b(readonly|private|protected)\b/.test(content)
  const hasPatterned = /\b(import|export)\b/.test(content)
  const hasStrategic = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasEvolved = /\b(const|readonly)\b/.test(content)
  const hasReflective = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAccumulated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasExperienced = /\b(throw|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasProven, hasDeep,
    hasMature, hasPatterned, hasStrategic, hasInsightful, hasConnected,
    hasEvolved, hasReflective, hasWise, hasAccumulated, hasExperienced,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let vein: ChannelingMeasure['vein'] = 'no-wisdom'
  if (wisdom >= 90) vein = 'mother-lode'
  else if (wisdom >= 75) vein = 'rich-seam'
  else if (wisdom >= 60) vein = 'proper-vein'
  else if (wisdom >= 40) vein = 'thin-thread'
  else if (wisdom >= 20) vein = 'dry-crack'

  return {
    wisdom, vein, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasProven, hasDeep,
    hasMature, hasPatterned, hasStrategic, hasInsightful, hasConnected,
    hasEvolved, hasReflective, hasWise, hasAccumulated, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeQuartzCrystal(content, 'app.ts') */
export function analyzeQuartzCrystal(content: string, filePath: string): QuartzCrystal {
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

  const condition = classifyQuartzCondition(qualityScore)

  return {
    file: filePath,
    crystallineClarity, vibrationQuality, resonancePurity, structureStrength, veinWisdom,
    transmitting, oscillating, resonating, supporting, channeling,
    condition, qualityScore,
  }
}

/** @example analyzeQuartzStratum(crystals, 'src') */
export function analyzeQuartzStratum(crystals: QuartzCrystal[], dirPath: string): QuartzStratum {
  if (crystals.length === 0) {
    return {
      directory: dirPath, crystals: [],
      avgClarity: 0, avgStrength: 0, avgWisdom: 0,
      quartzMasterpieceCount: 0, voidCount: 0,
      stratumType: 'no-stratum', condition: 'void',
    }
  }

  const avgClarity = Math.round(crystals.reduce((s, c) => s + c.crystallineClarity, 0) / crystals.length)
  const avgStrength = Math.round(crystals.reduce((s, c) => s + c.structureStrength, 0) / crystals.length)
  const avgWisdom = Math.round(crystals.reduce((s, c) => s + c.veinWisdom, 0) / crystals.length)
  const quartzMasterpieceCount = crystals.filter((c) => c.condition === 'quartz-masterpiece').length
  const voidCount = crystals.filter((c) => c.condition === 'void').length
  const stratumType = classifyStratumType(crystals)
  const avgQuality = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)
  const condition = classifyStratumCondition(avgQuality)

  return {
    directory: dirPath, crystals,
    avgClarity, avgStrength, avgWisdom,
    quartzMasterpieceCount, voidCount,
    stratumType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildQuartzMeridianResult(['a.ts'], [content]) */
export async function buildQuartzMeridianResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<QuartzMeridianResult> {
  const crystals: QuartzCrystal[] = files.map((file, i) =>
    analyzeQuartzCrystal(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, QuartzCrystal[]>()
  for (const crystal of crystals) {
    const dir = crystal.file.includes('/')
      ? crystal.file.substring(0, crystal.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(crystal)
    } else {
      dirMap.set(dir, [crystal])
    }
  }

  const strata: QuartzStratum[] = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeQuartzStratum(dirCrystals, dir),
  )

  const avgCrystallineClarity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.crystallineClarity, 0) / crystals.length) : 0
  const avgVibrationQuality = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.vibrationQuality, 0) / crystals.length) : 0
  const avgResonancePurity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.resonancePurity, 0) / crystals.length) : 0
  const avgStructureStrength = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.structureStrength, 0) / crystals.length) : 0
  const avgVeinWisdom = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.veinWisdom, 0) / crystals.length) : 0

  const overallLuminosity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length) : 0
  const isQuartz = overallLuminosity >= 60

  const geology = { avgClarity: avgCrystallineClarity, avgStrength: avgStructureStrength, avgWisdom: avgVeinWisdom, isQuartz, overallLuminosity }

  const quartzMasterpieceCount = crystals.filter((c) => c.condition === 'quartz-masterpiece').length
  const perfectCrystalCount = crystals.filter((c) => c.condition === 'perfect-crystal').length
  const properMineralCount = crystals.filter((c) => c.condition === 'proper-mineral').length
  const cloudyStoneCount = crystals.filter((c) => c.condition === 'cloudy-stone').length
  const crackedRockCount = crystals.filter((c) => c.condition === 'cracked-rock').length
  const voidCount = crystals.filter((c) => c.condition === 'void').length

  const hasHighClarityCount = crystals.filter((c) => c.transmitting.hasHighClarity).length
  const hasHighQualityCount = crystals.filter((c) => c.oscillating.hasHighQuality).length
  const hasHighPurityCount = crystals.filter((c) => c.resonating.hasHighPurity).length
  const hasHighStrengthCount = crystals.filter((c) => c.supporting.hasHighStrength).length
  const hasHighWisdomCount = crystals.filter((c) => c.channeling.hasHighWisdom).length

  const geologistGrade = classifyGeologistGrade(overallLuminosity)

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => (c.qualityScore > best.qualityScore ? c : best)).file : ''
  const clearest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.crystallineClarity > best.crystallineClarity ? c : best)).file : ''
  const mostPrecise = crystals.length > 0
    ? crystals.reduce((best, c) => (c.vibrationQuality > best.vibrationQuality ? c : best)).file : ''
  const purest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.resonancePurity > best.resonancePurity ? c : best)).file : ''
  const strongest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.structureStrength > best.structureStrength ? c : best)).file : ''
  const wisest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.veinWisdom > best.veinWisdom ? c : best)).file : ''

  const stats: QuartzMeridianResult['stats'] = {
    totalFiles: files.length, totalStrata: strata.length,
    avgCrystallineClarity, avgVibrationQuality, avgResonancePurity, avgStructureStrength, avgVeinWisdom,
    quartzMasterpieceCount, perfectCrystalCount, properMineralCount, cloudyStoneCount, crackedRockCount, voidCount,
    hasHighClarityCount, hasHighQualityCount, hasHighPurityCount, hasHighStrengthCount, hasHighWisdomCount,
    overallLuminosity, geologistGrade,
    bestCrystal, clearest, mostPrecise, purest, strongest, wisest,
  }

  const recommendations = generateRecommendations(crystals, strata, geology, stats)

  return { crystals, strata, geology, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(crystals, strata, geology, stats) */
export function generateRecommendations(
  crystals: QuartzCrystal[],
  strata: QuartzStratum[],
  geology: QuartzMeridianResult['geology'],
  stats: QuartzMeridianResult['stats'],
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
      'Your quartz meridian is a masterpiece of crystalline energy! Every crystal transmits clarity, oscillates with precision, resonates with purity, and channels ancient wisdom through solid structure!',
    )
    return recs
  }

  if (stats.avgCrystallineClarity < 60) {
    recs.push(
      'Polish the crystal clarity — quartz must be transparent to transmit energy; your code needs clearer naming, better documentation, and more self-evident structure',
    )
  }

  if (stats.avgVibrationQuality < 60) {
    recs.push(
      'Tune the vibration quality — quartz oscillators keep perfect time because they are consistent; your code needs predictable patterns, reliable tests, and disciplined structure',
    )
  }

  if (stats.avgResonancePurity < 60) {
    recs.push(
      'Clean the resonance signal — pure quartz vibrates at one frequency; your code needs type safety, exact types, and noise-free abstractions',
    )
  }

  if (stats.avgStructureStrength < 60) {
    recs.push(
      'Reinforce the crystal lattice — quartz crystals hold their shape because their lattice is perfect; your code needs modular architecture, error handling, and defensive boundaries',
    )
  }

  if (stats.avgVeinWisdom < 60) {
    recs.push(
      'Follow the wisdom veins — the deepest quartz carries the most knowledge; your code should be well-architected, principled, and built on proven patterns',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The quartz meridian has gone dark — no crystal conducts energy and the vein has dried to dust',
    )
  }

  const voidCrystals = crystals.filter((c) => c.condition === 'void')
  if (voidCrystals.length > 0 && voidCrystals.length <= 5) {
    recs.push(`Clear these cracked crystals: ${voidCrystals.map((c) => c.file).join(', ')}`)
  } else if (voidCrystals.length > 5) {
    recs.push(`Clear ${voidCrystals.length} cracked crystals before the meridian collapses entirely`)
  }

  const poorStrata = strata.filter((s) => s.condition === 'void' || s.condition === 'rubble')
  if (poorStrata.length === strata.length && strata.length > 0) {
    recs.push('All strata have collapsed — the quartz meridian needs complete reconstruction from bedrock to crystal')
  }

  if (recs.length === 0) {
    recs.push('Your quartz meridian conducts energy well — each crystal combines clarity, vibration, resonance, strength, and vein wisdom')
  }

  return recs
}
