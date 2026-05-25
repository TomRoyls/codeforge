// ─── Interfaces ──────────────────────────────────────────

export interface TransmittingMeasure {
  clarity: number
  crystal:
    | 'flawless-quartz'
    | 'clear-crystal'
    | 'proper-gem'
    | 'cloudy-stone'
    | 'opaque-rock'
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
  hasNoInvisible: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasDirect: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface OscillatingMeasure {
  quality: number
  frequency:
    | 'perfect-resonance'
    | 'steady-hum'
    | 'proper-vibration'
    | 'irregular-pulse'
    | 'static-noise'
    | 'no-vibration'
  hasHighQuality: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasUniform: boolean
  hasNoMixed: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasHarmonious: boolean
  hasNoDiscordant: boolean
  hasRhythmic: boolean
  erraticCount: number
  untestedCount: number
}

export interface ResonatingMeasure {
  purity: number
  tone:
    | 'pure-signal'
    | 'clean-tone'
    | 'proper-note'
    | 'noisy-channel'
    | 'static-buzz'
    | 'no-resonance'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasHonest: boolean
  hasNoDeceptive: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasNoiseFree: boolean
  unsafeCount: number
  contradictoryCount: number
}

export interface SupportingMeasure {
  strength: number
  lattice:
    | 'diamond-lattice'
    | 'strong-crystal'
    | 'proper-structure'
    | 'weak-bonds'
    | 'crumbling-matrix'
    | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasGraceful: boolean
  hasEnduring: boolean
  chaoticCount: number
  bareCrashCount: number
}

export interface ChannelingMeasure {
  wisdom: number
  vein:
    | 'ancant-channel'
    | 'deep-vein'
    | 'proper-flow'
    | 'surface-trickle'
    | 'dry-crack'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasConnected: boolean
  hackedCount: number
  adHocCount: number
}

export type CrystalCondition =
  | 'quartz-masterpiece'
  | 'crystal-vein'
  | 'proper-mineral'
  | 'dull-stone'
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
  condition: CrystalCondition
  qualityScore: number
}

export type SeamType =
  | 'grand-vein'
  | 'crystal-seam'
  | 'proper-deposit'
  | 'small-pocket'
  | 'barren-rock'
  | 'no-seam'

export type SeamCondition =
  | 'crystal-cathedral'
  | 'quartz-cavern'
  | 'proper-mine'
  | 'dull-tunnel'
  | 'collapsed-shaft'
  | 'void'

export interface QuartzSeam {
  directory: string
  crystals: QuartzCrystal[]
  avgClarity: number
  avgStrength: number
  avgWisdom: number
  quartzMasterpieceCount: number
  voidCount: number
  seamType: SeamType
  condition: SeamCondition
}

export type MinerGrade =
  | 'crystal-master'
  | 'vein-reader'
  | 'stone-cutter'
  | 'apprentice'
  | 'novice'
  | 'rock-basher'

export interface QuartzMeridianStats {
  totalFiles: number
  totalSeams: number
  avgCrystallineClarity: number
  avgVibrationQuality: number
  avgResonancePurity: number
  avgStructureStrength: number
  avgVeinWisdom: number
  quartzMasterpieceCount: number
  crystalVeinCount: number
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
  minerGrade: MinerGrade
  bestCrystal: string
  clearest: string
  mostRhythmic: string
  purest: string
  strongest: string
  wisest: string
}

export interface QuartzMeridianResult {
  crystals: QuartzCrystal[]
  seams: QuartzSeam[]
  geode: {
    avgClarity: number
    avgStrength: number
    avgWisdom: number
    isQuartz: boolean
    overallLuminosity: number
  }
  stats: QuartzMeridianStats
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

/** @example measureTransmitting('export function add(): number { }') */
export function measureTransmitting(content: string): TransmittingMeasure {
  const hasReadable = /\w+\.\w+/.test(content)
  const crypticCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /\bexport\b/.test(content)
  const obfuscatedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasUnderstandable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasVisible = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoInvisible = !/\b(invisible|hidden|concealed)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
  const hasDirect = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDocumented,
    hasDirect,
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
    hasNoInvisible,
    hasDocumented,
    hasNoUndocumented,
    hasDirect,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureOscillating('try { foo() } catch { bar() }') */
export function measureOscillating(content: string): OscillatingMeasure {
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const erraticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasPredictable = /\b(const|readonly)\b/.test(content)
  const hasNoSurprising = !/\b(surprising|unexpected|random)\b/i.test(content)
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|unstable|changing)\b/i.test(content)
  const hasUniform = /\b(readonly|as const)\b/.test(content)
  const hasNoMixed = (content.match(/\bany\b/g) ?? []).length === 0
  const hasReliable = /\b(async|await|Promise)\b/.test(content)
  const hasNoFlaky = !/\b(flaky|intermittent|sometimes)\b/i.test(content)
  const hasHarmonious = /\b(function|class|interface)\b/.test(content)
  const hasNoDiscordant = !/\b(discordant|clashing|conflicting)\b/i.test(content)
  const hasRhythmic = /\b(return|yield|emit)\b/.test(content)

  const positiveBooleans = [
    hasConsistent,
    hasPredictable,
    hasTested,
    hasStable,
    hasUniform,
    hasReliable,
    hasHarmonious,
    hasRhythmic,
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
    hasUniform,
    hasNoMixed,
    hasReliable,
    hasNoFlaky,
    hasHarmonious,
    hasNoDiscordant,
    hasRhythmic,
    erraticCount,
    untestedCount,
  }
}

/** @example measureResonating('export interface Config { readonly name: string }') */
export function measureResonating(content: string): ResonatingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = !/\b(dirty|messy|hacky)\b/i.test(content)
  const hasNoDirty = (content.match(/\b(dirty|messy)\b/gi) ?? []).length === 0
  const hasAccurate = /\b(return|yield)\b/.test(content)
  const wrongCount = (content.match(/\b(wrong|incorrect|mistake)\b/gi) ?? []).length
  const hasNoWrong = wrongCount === 0
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradict|conflict|clash)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasHonest = /\b(return|throw|yield)\b/.test(content)
  const hasNoDeceptive = !/\b(cheat|fake|deceive)\b/i.test(content)
  const hasPure = !content.includes('@ts-ignore')
  const hasNoContaminated = !content.includes('@ts-expect-error')
  const hasPolished = /\b(readonly|private|protected)\b/.test(content)
  const hasNoRough = !/\b(rough|unpolished|crude)\b/i.test(content)
  const hasNoiseFree = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')

  const positiveBooleans = [
    hasTypeSafe,
    hasClean,
    hasAccurate,
    hasConsistent,
    hasHonest,
    hasPure,
    hasPolished,
    hasNoiseFree,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60
  const tone = classifyTone(purity)

  return {
    purity,
    tone,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasAccurate,
    hasNoWrong,
    hasConsistent,
    hasNoContradictory,
    hasHonest,
    hasNoDeceptive,
    hasPure,
    hasNoContaminated,
    hasPolished,
    hasNoRough,
    hasNoiseFree,
    unsafeCount,
    contradictoryCount,
  }
}

/** @example measureSupporting('export class App { readonly config: string }') */
export function measureSupporting(content: string): SupportingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|mess|tangle)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|giant|massive)\b/i.test(content)
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasNoScattered = !/\b(scattered|fragmented|dispersed)\b/i.test(content)
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|bloated)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoFragile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasOrganized,
    hasEfficient,
    hasRobust,
    hasErrorHandled,
    hasDefensive,
    hasEnduring,
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
    hasNoScattered,
    hasEfficient,
    hasNoWasteful,
    hasRobust,
    hasNoFragile,
    hasErrorHandled,
    hasNoBareCrash,
    hasDefensive,
    hasGraceful,
    hasEnduring,
    chaoticCount,
    bareCrashCount,
  }
}

/** @example measureChanneling('export const WISDOM = true as const') */
export function measureChanneling(content: string): ChannelingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoObvious = !/\b(trivial|obvious|duh)\b/i.test(content)
  const hasConnected = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasPatterned,
    hasDeep,
    hasMature,
    hasInsightful,
    hasConnected,
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
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasNoNaive,
    hasInsightful,
    hasNoObvious,
    hasConnected,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyCrystal(score: number): TransmittingMeasure['crystal'] {
  if (score >= 90) return 'flawless-quartz'
  if (score >= 75) return 'clear-crystal'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'opaque-rock'
  return 'no-clarity'
}

function classifyFrequency(score: number): OscillatingMeasure['frequency'] {
  if (score >= 90) return 'perfect-resonance'
  if (score >= 75) return 'steady-hum'
  if (score >= 60) return 'proper-vibration'
  if (score >= 40) return 'irregular-pulse'
  if (score >= 20) return 'static-noise'
  return 'no-vibration'
}

function classifyTone(score: number): ResonatingMeasure['tone'] {
  if (score >= 90) return 'pure-signal'
  if (score >= 75) return 'clean-tone'
  if (score >= 60) return 'proper-note'
  if (score >= 40) return 'noisy-channel'
  if (score >= 20) return 'static-buzz'
  return 'no-resonance'
}

function classifyLattice(score: number): SupportingMeasure['lattice'] {
  if (score >= 90) return 'diamond-lattice'
  if (score >= 75) return 'strong-crystal'
  if (score >= 60) return 'proper-structure'
  if (score >= 40) return 'weak-bonds'
  if (score >= 20) return 'crumbling-matrix'
  return 'no-strength'
}

function classifyVein(score: number): ChannelingMeasure['vein'] {
  if (score >= 90) return 'ancant-channel'
  if (score >= 75) return 'deep-vein'
  if (score >= 60) return 'proper-flow'
  if (score >= 40) return 'surface-trickle'
  if (score >= 20) return 'dry-crack'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): CrystalCondition {
  if (score >= 90) return 'quartz-masterpiece'
  if (score >= 75) return 'crystal-vein'
  if (score >= 60) return 'proper-mineral'
  if (score >= 40) return 'dull-stone'
  if (score >= 20) return 'cracked-rock'
  return 'void'
}

/** @example classifySeamType(crystals) */
export function classifySeamType(crystals: QuartzCrystal[]): SeamType {
  if (crystals.length === 0) return 'no-seam'
  const avg = crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length
  if (avg >= 90) return 'grand-vein'
  if (avg >= 75) return 'crystal-seam'
  if (avg >= 60) return 'proper-deposit'
  if (avg >= 40) return 'small-pocket'
  if (avg >= 20) return 'barren-rock'
  return 'no-seam'
}

/** @example classifySeamCondition(avgClarity) */
export function classifySeamCondition(avgClarity: number): SeamCondition {
  if (avgClarity >= 85) return 'crystal-cathedral'
  if (avgClarity >= 70) return 'quartz-cavern'
  if (avgClarity >= 55) return 'proper-mine'
  if (avgClarity >= 35) return 'dull-tunnel'
  if (avgClarity >= 15) return 'collapsed-shaft'
  return 'void'
}

/** @example classifyMinerGrade(80) */
export function classifyMinerGrade(avgLuminosity: number): MinerGrade {
  if (avgLuminosity >= 80) return 'crystal-master'
  if (avgLuminosity >= 65) return 'vein-reader'
  if (avgLuminosity >= 50) return 'stone-cutter'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'rock-basher'
}

// ─── Analysis ───────────────────────────────────────────

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

/** @example analyzeQuartzSeam(crystals, 'src') */
export function analyzeQuartzSeam(crystals: QuartzCrystal[], dirPath: string): QuartzSeam {
  if (crystals.length === 0) {
    return {
      directory: dirPath,
      crystals: [],
      avgClarity: 0,
      avgStrength: 0,
      avgWisdom: 0,
      quartzMasterpieceCount: 0,
      voidCount: 0,
      seamType: 'no-seam',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    crystals.reduce((s, c) => s + c.crystallineClarity, 0) / crystals.length,
  )
  const avgStrength = Math.round(
    crystals.reduce((s, c) => s + c.structureStrength, 0) / crystals.length,
  )
  const avgWisdom = Math.round(
    crystals.reduce((s, c) => s + c.veinWisdom, 0) / crystals.length,
  )

  const quartzMasterpieceCount = crystals.filter(
    (c) => c.condition === 'quartz-masterpiece',
  ).length
  const voidCount = crystals.filter((c) => c.condition === 'void').length

  const seamType = classifySeamType(crystals)
  const avgQuality = Math.round(
    crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length,
  )
  const condition = classifySeamCondition(avgQuality)

  return {
    directory: dirPath,
    crystals,
    avgClarity,
    avgStrength,
    avgWisdom,
    quartzMasterpieceCount,
    voidCount,
    seamType,
    condition,
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

  const seams: QuartzSeam[] = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeQuartzSeam(dirCrystals, dir),
  )

  const avgClarity =
    crystals.length > 0
      ? Math.round(crystals.reduce((s, c) => s + c.crystallineClarity, 0) / crystals.length)
      : 0
  const avgStrength =
    crystals.length > 0
      ? Math.round(crystals.reduce((s, c) => s + c.structureStrength, 0) / crystals.length)
      : 0
  const avgWisdom =
    crystals.length > 0
      ? Math.round(crystals.reduce((s, c) => s + c.veinWisdom, 0) / crystals.length)
      : 0

  const overallLuminosity =
    crystals.length > 0
      ? Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)
      : 0
  const isQuartz = overallLuminosity >= 60

  const geode = { avgClarity, avgStrength, avgWisdom, isQuartz, overallLuminosity }

  const avgCrystallineClarity = avgClarity
  const avgVibrationQuality =
    crystals.length > 0
      ? Math.round(crystals.reduce((s, c) => s + c.vibrationQuality, 0) / crystals.length)
      : 0
  const avgResonancePurity =
    crystals.length > 0
      ? Math.round(crystals.reduce((s, c) => s + c.resonancePurity, 0) / crystals.length)
      : 0
  const avgStructureStrength = avgStrength
  const avgVeinWisdom = avgWisdom

  const quartzMasterpieceCount = crystals.filter(
    (c) => c.condition === 'quartz-masterpiece',
  ).length
  const crystalVeinCount = crystals.filter((c) => c.condition === 'crystal-vein').length
  const properMineralCount = crystals.filter((c) => c.condition === 'proper-mineral').length
  const dullStoneCount = crystals.filter((c) => c.condition === 'dull-stone').length
  const crackedRockCount = crystals.filter((c) => c.condition === 'cracked-rock').length
  const voidCount = crystals.filter((c) => c.condition === 'void').length

  const hasHighClarityCount = crystals.filter((c) => c.transmitting.hasHighClarity).length
  const hasHighQualityCount = crystals.filter((c) => c.oscillating.hasHighQuality).length
  const hasHighPurityCount = crystals.filter((c) => c.resonating.hasHighPurity).length
  const hasHighStrengthCount = crystals.filter((c) => c.supporting.hasHighStrength).length
  const hasHighWisdomCount = crystals.filter((c) => c.channeling.hasHighWisdom).length

  const minerGrade = classifyMinerGrade(overallLuminosity)

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => (c.qualityScore > best.qualityScore ? c : best)).file
    : ''
  const clearest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.crystallineClarity > best.crystallineClarity ? c : best)).file
    : ''
  const mostRhythmic = crystals.length > 0
    ? crystals.reduce((best, c) => (c.vibrationQuality > best.vibrationQuality ? c : best)).file
    : ''
  const purest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.resonancePurity > best.resonancePurity ? c : best)).file
    : ''
  const strongest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.structureStrength > best.structureStrength ? c : best)).file
    : ''
  const wisest = crystals.length > 0
    ? crystals.reduce((best, c) => (c.veinWisdom > best.veinWisdom ? c : best)).file
    : ''

  const stats: QuartzMeridianStats = {
    totalFiles: files.length,
    totalSeams: seams.length,
    avgCrystallineClarity,
    avgVibrationQuality,
    avgResonancePurity,
    avgStructureStrength,
    avgVeinWisdom,
    quartzMasterpieceCount,
    crystalVeinCount,
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
    minerGrade,
    bestCrystal,
    clearest,
    mostRhythmic,
    purest,
    strongest,
    wisest,
  }

  const recommendations = generateRecommendations(crystals, seams, geode, stats)

  return { crystals, seams, geode, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(crystals, seams, geode, stats) */
export function generateRecommendations(
  crystals: QuartzCrystal[],
  seams: QuartzSeam[],
  geode: QuartzMeridianResult['geode'],
  stats: QuartzMeridianStats,
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
      'Your quartz meridian shines with perfect crystalline luminosity! Every crystal is a masterpiece of clarity and resonance',
    )
    return recs
  }

  if (stats.avgCrystallineClarity < 60) {
    recs.push(
      'Polish crystalline clarity — code should transmit light like flawless quartz through solid rock',
    )
  }

  if (stats.avgVibrationQuality < 60) {
    recs.push(
      'Tune vibration quality — code should oscillate at precise, consistent frequencies like quartz crystal',
    )
  }

  if (stats.avgResonancePurity < 60) {
    recs.push(
      'Purify resonance — code should carry a clean signal free of noise and distortion',
    )
  }

  if (stats.avgStructureStrength < 60) {
    recs.push(
      'Strengthen crystal structure — code must be built on a lattice as strong as diamond',
    )
  }

  if (stats.avgVeinWisdom < 60) {
    recs.push(
      'Deepen vein wisdom — code should channel knowledge through connected crystalline pathways',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The quartz dims in darkness — restore the meridian before the crystal structure collapses',
    )
  }

  const voidCrystals = crystals.filter((c) => c.condition === 'void')
  if (voidCrystals.length > 0 && voidCrystals.length <= 5) {
    recs.push(
      `Restore these cracked crystals: ${voidCrystals.map((c) => c.file).join(', ')}`,
    )
  } else if (voidCrystals.length > 5) {
    recs.push(
      `Restore these ${voidCrystals.length} cracked crystals before the seam collapses`,
    )
  }

  const poorSeams = seams.filter(
    (s) => s.condition === 'void' || s.condition === 'collapsed-shaft',
  )
  if (poorSeams.length === seams.length && seams.length > 0) {
    recs.push(
      'All seams show signs of collapse — consider a complete restoration of the quartz meridian',
    )
  }

  if (recs.length === 0) {
    recs.push('Your quartz meridian glows with crystalline brilliance — keep building with crystal clarity')
  }

  return recs
}
