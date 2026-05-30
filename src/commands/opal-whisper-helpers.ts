// ─── Interfaces ──────────────────────────────────────────

export interface DiffractingMeasure {
  play: number
  spectrum: 'kaleidoscope' | 'black-opal' | 'proper-play' | 'common-opal' | 'potch' | 'no-play'
  hasHighPlay: boolean
  hasVersatile: boolean
  hasNoRigid: boolean
  hasMultiFaceted: boolean
  hasNoMonolithic: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasDiverse: boolean
  hasRich: boolean
  hasVaried: boolean
  hasDynamic: boolean
  hasColorful: boolean
  hasLayered: boolean
  hasComplex: boolean
  hasMultiDimensional: boolean
  hasShifting: boolean
  rigidCount: number
  monolithicCount: number
}

export interface ResonatingMeasure {
  clarity: number
  harmony: 'symphonic-clarity' | 'harmonic-balance' | 'proper-tone' | 'dissonant-note' | 'noise' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasOrganized: boolean
  hasCoherent: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasSymphonic: boolean
  hasResonant: boolean
  hasTuned: boolean
  hasMelodic: boolean
  crypticCount: number
  mysteryCount: number
}

export interface RefractingMeasure {
  precision: number
  angle: 'perfect-diffraction' | 'sharp-refraction' | 'proper-angle' | 'scattered-light' | 'diffuse-glow' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasClean: boolean
  hasCorrect: boolean
  hasCalculated: boolean
  hasMeasured: boolean
  hasCalibrated: boolean
  hasGeometric: boolean
  unsafeCount: number
  approximateCount: number
}

export interface EnduringMeasure {
  resilience: number
  aurora: 'eternal-lights' | 'dancing-curtain' | 'proper-glow' | 'fading-shimmer' | 'dark-sky' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasPersistent: boolean
  hasHardened: boolean
  hasTough: boolean
  hasResilient: boolean
  hasUnfading: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  insight: 'light-master' | 'optical-sage' | 'proper-physicist' | 'casual-observer' | 'blind-folded' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasIlluminating: boolean
  hasWise: boolean
  hasPerceptive: boolean
  hackedCount: number
  shallowCount: number
}

export type OpalCondition =
  | 'opal-masterpiece'
  | 'precious-fire'
  | 'proper-opal'
  | 'common-stone'
  | 'potch-rock'
  | 'void'

export interface OpalMurmur {
  file: string
  spectralPlay: number
  harmonicClarity: number
  prismPrecision: number
  auroraResilience: number
  opalescenceWisdom: number
  diffracting: DiffractingMeasure
  resonating: ResonatingMeasure
  refracting: RefractingMeasure
  enduring: EnduringMeasure
  understanding: UnderstandingMeasure
  condition: OpalCondition
  qualityScore: number
}

export type ChorusType =
  | 'rainbow-choir'
  | 'opal-ensemble'
  | 'proper-trio'
  | 'solo-voice'
  | 'silence'
  | 'no-chorus'

export type ChorusCondition =
  | 'opal-palace'
  | 'gem-gallery'
  | 'proper-museum'
  | 'stone-display'
  | 'empty-case'
  | 'void'

export type GemologistGrade = 'opal-master' | 'precious-appraiser' | 'proper-gemologist' | 'apprentice' | 'novice' | 'rock-polisher'

export interface OpalChorus {
  directory: string
  murmurs: OpalMurmur[]
  avgPlay: number
  avgPrecision: number
  avgWisdom: number
  opalMasterpieceCount: number
  voidCount: number
  chorusType: ChorusType
  condition: ChorusCondition
}

export interface OpalWhisperResult {
  murmurs: OpalMurmur[]
  choruses: OpalChorus[]
  spectrum: {
    avgPlay: number
    avgPrecision: number
    avgWisdom: number
    isOpal: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalChoruses: number
    avgSpectralPlay: number
    avgHarmonicClarity: number
    avgPrismPrecision: number
    avgAuroraResilience: number
    avgOpalescenceWisdom: number
    opalMasterpieceCount: number
    preciousFireCount: number
    properOpalCount: number
    commonStoneCount: number
    potchRockCount: number
    voidCount: number
    hasHighPlayCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallBrilliance: number
    gemologistGrade: GemologistGrade
    bestMurmur: string
    mostColorful: string
    clearest: string
    mostPrecise: string
    mostResilient: string
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

/** @example classifyOpalCondition(90) */
export function classifyOpalCondition(score: number): OpalCondition {
  if (score >= 90) return 'opal-masterpiece'
  if (score >= 75) return 'precious-fire'
  if (score >= 60) return 'proper-opal'
  if (score >= 40) return 'common-stone'
  if (score >= 20) return 'potch-rock'
  return 'void'
}

/** @example classifyChorusType(murmurs) */
export function classifyChorusType(murmurs: OpalMurmur[]): ChorusType {
  if (murmurs.length === 0) return 'no-chorus'
  const avg = murmurs.reduce((s, m) => s + m.qualityScore, 0) / murmurs.length
  if (avg >= 85) return 'rainbow-choir'
  if (avg >= 70) return 'opal-ensemble'
  if (avg >= 55) return 'proper-trio'
  if (avg >= 35) return 'solo-voice'
  return 'silence'
}

/** @example classifyChorusCondition(85) */
export function classifyChorusCondition(score: number): ChorusCondition {
  if (score >= 85) return 'opal-palace'
  if (score >= 70) return 'gem-gallery'
  if (score >= 55) return 'proper-museum'
  if (score >= 35) return 'stone-display'
  if (score >= 15) return 'empty-case'
  return 'void'
}

/** @example classifyGemologistGrade(80) */
export function classifyGemologistGrade(avgBrilliance: number): GemologistGrade {
  if (avgBrilliance >= 80) return 'opal-master'
  if (avgBrilliance >= 65) return 'precious-appraiser'
  if (avgBrilliance >= 50) return 'proper-gemologist'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-polisher'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDiffracting('export class X { readonly y: string }') */
export function measureDiffracting(content: string): DiffractingMeasure {
  const hasVersatile = /\b(class|interface|type)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|static|fixed|hardcoded)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasMultiFaceted = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasAdaptable = !/\bany\b/.test(content)
  const hasFlexible = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDiverse = /\b(readonly|private|protected)\b/.test(content)
  const hasRich = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVaried = /\b(async|await|Promise)\b/.test(content)
  const hasDynamic = /\b(function|=>|return)\b/.test(content)
  const hasColorful = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasLayered = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasComplex = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMultiDimensional = /\b(try|catch|if)\b/.test(content)
  const hasShifting = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasVersatile, hasNoRigid, hasMultiFaceted, hasNoMonolithic, hasAdaptable,
    hasFlexible, hasDiverse, hasRich, hasVaried, hasDynamic,
    hasColorful, hasLayered, hasComplex, hasMultiDimensional, hasShifting,
  ]

  const play = computeScore(positiveBooleans)
  const hasHighPlay = play >= 60

  let spectrum: DiffractingMeasure['spectrum'] = 'no-play'
  if (play >= 90) spectrum = 'kaleidoscope'
  else if (play >= 75) spectrum = 'black-opal'
  else if (play >= 60) spectrum = 'proper-play'
  else if (play >= 40) spectrum = 'common-opal'
  else if (play >= 20) spectrum = 'potch'

  return {
    play, spectrum, hasHighPlay,
    hasVersatile, hasNoRigid, hasMultiFaceted, hasNoMonolithic, hasAdaptable,
    hasFlexible, hasDiverse, hasRich, hasVaried, hasDynamic,
    hasColorful, hasLayered, hasComplex, hasMultiDimensional, hasShifting,
    rigidCount, monolithicCount,
  }
}

/** @example measureResonating('export class X { readonly y: string }') */
export function measureResonating(content: string): ResonatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasTransparent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnderstandable = !/\bany\b/.test(content)
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasCoherent = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHarmonious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasBalanced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSymphonic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasResonant = /\b(async|await|Promise)\b/.test(content)
  const hasTuned = /\b(function|=>|return)\b/.test(content)
  const hasMelodic = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasOrganized, hasCoherent, hasHarmonious,
    hasBalanced, hasSymphonic, hasResonant, hasTuned, hasMelodic,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let harmony: ResonatingMeasure['harmony'] = 'no-clarity'
  if (clarity >= 90) harmony = 'symphonic-clarity'
  else if (clarity >= 75) harmony = 'harmonic-balance'
  else if (clarity >= 60) harmony = 'proper-tone'
  else if (clarity >= 40) harmony = 'dissonant-note'
  else if (clarity >= 20) harmony = 'noise'

  return {
    clarity, harmony, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasOrganized, hasCoherent, hasHarmonious,
    hasBalanced, hasSymphonic, hasResonant, hasTuned, hasMelodic,
    crypticCount, mysteryCount,
  }
}

/** @example measureRefracting('export class X { readonly y: string }') */
export function measureRefracting(content: string): RefractingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|imprecise|loose|sloppy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCalculated = /\b(async|await|Promise)\b/.test(content)
  const hasMeasured = /\b(function|=>|return)\b/.test(content)
  const hasCalibrated = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasGeometric = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasMeasured, hasCalibrated, hasGeometric,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let angle: RefractingMeasure['angle'] = 'no-precision'
  if (precision >= 90) angle = 'perfect-diffraction'
  else if (precision >= 75) angle = 'sharp-refraction'
  else if (precision >= 60) angle = 'proper-angle'
  else if (precision >= 40) angle = 'scattered-light'
  else if (precision >= 20) angle = 'diffuse-glow'

  return {
    precision, angle, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasMeasured, hasCalibrated, hasGeometric,
    unsafeCount, approximateCount,
  }
}

/** @example measureEnduring('export class X { readonly y: string }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasStable = /\b(import|export)\b/.test(content)
  const hasDurable = !/\bany\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasLasting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPersistent = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHardened = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasTough = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasResilient = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUnfading = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasEnduring, hasLasting,
    hasPersistent, hasHardened, hasTough, hasResilient, hasUnfading,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let aurora: EnduringMeasure['aurora'] = 'no-resilience'
  if (resilience >= 90) aurora = 'eternal-lights'
  else if (resilience >= 75) aurora = 'dancing-curtain'
  else if (resilience >= 60) aurora = 'proper-glow'
  else if (resilience >= 40) aurora = 'fading-shimmer'
  else if (resilience >= 20) aurora = 'dark-sky'

  return {
    resilience, aurora, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasEnduring, hasLasting,
    hasPersistent, hasHardened, hasTough, hasResilient, hasUnfading,
    unhandledCount, untestedCount,
  }
}

/** @example measureUnderstanding('export class X { readonly y: string }') */
export function measureUnderstanding(content: string): UnderstandingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHolistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasIlluminating = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasPerceptive = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasIlluminating, hasWise, hasPerceptive,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let insight: UnderstandingMeasure['insight'] = 'no-wisdom'
  if (wisdom >= 90) insight = 'light-master'
  else if (wisdom >= 75) insight = 'optical-sage'
  else if (wisdom >= 60) insight = 'proper-physicist'
  else if (wisdom >= 40) insight = 'casual-observer'
  else if (wisdom >= 20) insight = 'blind-folded'

  return {
    wisdom, insight, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasIlluminating, hasWise, hasPerceptive,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeOpalMurmur(content, 'app.ts') */
export function analyzeOpalMurmur(content: string, filePath: string): OpalMurmur {
  const diffracting = measureDiffracting(content)
  const resonating = measureResonating(content)
  const refracting = measureRefracting(content)
  const enduring = measureEnduring(content)
  const understanding = measureUnderstanding(content)

  const spectralPlay = diffracting.play
  const harmonicClarity = resonating.clarity
  const prismPrecision = refracting.precision
  const auroraResilience = enduring.resilience
  const opalescenceWisdom = understanding.wisdom

  const qualityScore = Math.round(
    spectralPlay * 0.2 +
    harmonicClarity * 0.2 +
    prismPrecision * 0.2 +
    auroraResilience * 0.2 +
    opalescenceWisdom * 0.2,
  )

  const condition = classifyOpalCondition(qualityScore)

  return {
    file: filePath,
    spectralPlay, harmonicClarity, prismPrecision, auroraResilience, opalescenceWisdom,
    diffracting, resonating, refracting, enduring, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeOpalChorus(murmurs, 'src') */
export function analyzeOpalChorus(murmurs: OpalMurmur[], dirPath: string): OpalChorus {
  if (murmurs.length === 0) {
    return {
      directory: dirPath, murmurs: [],
      avgPlay: 0, avgPrecision: 0, avgWisdom: 0,
      opalMasterpieceCount: 0, voidCount: 0,
      chorusType: 'no-chorus', condition: 'void',
    }
  }

  const avgPlay = Math.round(murmurs.reduce((s, m) => s + m.spectralPlay, 0) / murmurs.length)
  const avgPrecision = Math.round(murmurs.reduce((s, m) => s + m.prismPrecision, 0) / murmurs.length)
  const avgWisdom = Math.round(murmurs.reduce((s, m) => s + m.opalescenceWisdom, 0) / murmurs.length)
  const opalMasterpieceCount = murmurs.filter((m) => m.condition === 'opal-masterpiece').length
  const voidCount = murmurs.filter((m) => m.condition === 'void').length
  const chorusType = classifyChorusType(murmurs)
  const avgQuality = Math.round(murmurs.reduce((s, m) => s + m.qualityScore, 0) / murmurs.length)
  const condition = classifyChorusCondition(avgQuality)

  return {
    directory: dirPath, murmurs,
    avgPlay, avgPrecision, avgWisdom,
    opalMasterpieceCount, voidCount,
    chorusType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOpalWhisperResult(['a.ts'], [content]) */
export async function buildOpalWhisperResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OpalWhisperResult> {
  const murmurs: OpalMurmur[] = files.map((file, i) =>
    analyzeOpalMurmur(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OpalMurmur[]>()
  for (const murmur of murmurs) {
    const dir = murmur.file.includes('/')
      ? murmur.file.substring(0, murmur.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(murmur)
    } else {
      dirMap.set(dir, [murmur])
    }
  }

  const choruses: OpalChorus[] = Array.from(dirMap.entries()).map(([dir, dirMurmurs]) =>
    analyzeOpalChorus(dirMurmurs, dir),
  )

  const avgSpectralPlay = murmurs.length > 0
    ? Math.round(murmurs.reduce((s, m) => s + m.spectralPlay, 0) / murmurs.length) : 0
  const avgHarmonicClarity = murmurs.length > 0
    ? Math.round(murmurs.reduce((s, m) => s + m.harmonicClarity, 0) / murmurs.length) : 0
  const avgPrismPrecision = murmurs.length > 0
    ? Math.round(murmurs.reduce((s, m) => s + m.prismPrecision, 0) / murmurs.length) : 0
  const avgAuroraResilience = murmurs.length > 0
    ? Math.round(murmurs.reduce((s, m) => s + m.auroraResilience, 0) / murmurs.length) : 0
  const avgOpalescenceWisdom = murmurs.length > 0
    ? Math.round(murmurs.reduce((s, m) => s + m.opalescenceWisdom, 0) / murmurs.length) : 0

  const overallBrilliance = murmurs.length > 0
    ? Math.round(murmurs.reduce((s, m) => s + m.qualityScore, 0) / murmurs.length) : 0
  const isOpal = overallBrilliance >= 60

  const spectrum: OpalWhisperResult['spectrum'] = {
    avgPlay: avgSpectralPlay, avgPrecision: avgPrismPrecision, avgWisdom: avgOpalescenceWisdom,
    isOpal, overallBrilliance,
  }

  const opalMasterpieceCount = murmurs.filter((m) => m.condition === 'opal-masterpiece').length
  const preciousFireCount = murmurs.filter((m) => m.condition === 'precious-fire').length
  const properOpalCount = murmurs.filter((m) => m.condition === 'proper-opal').length
  const commonStoneCount = murmurs.filter((m) => m.condition === 'common-stone').length
  const potchRockCount = murmurs.filter((m) => m.condition === 'potch-rock').length
  const voidCount = murmurs.filter((m) => m.condition === 'void').length

  const hasHighPlayCount = murmurs.filter((m) => m.diffracting.hasHighPlay).length
  const hasHighClarityCount = murmurs.filter((m) => m.resonating.hasHighClarity).length
  const hasHighPrecisionCount = murmurs.filter((m) => m.refracting.hasHighPrecision).length
  const hasHighResilienceCount = murmurs.filter((m) => m.enduring.hasHighResilience).length
  const hasHighWisdomCount = murmurs.filter((m) => m.understanding.hasHighWisdom).length

  const gemologistGrade = classifyGemologistGrade(overallBrilliance)

  const bestMurmur = murmurs.length > 0
    ? murmurs.reduce((best, m) => (m.qualityScore > best.qualityScore ? m : best)).file : ''
  const mostColorful = murmurs.length > 0
    ? murmurs.reduce((best, m) => (m.spectralPlay > best.spectralPlay ? m : best)).file : ''
  const clearest = murmurs.length > 0
    ? murmurs.reduce((best, m) => (m.harmonicClarity > best.harmonicClarity ? m : best)).file : ''
  const mostPrecise = murmurs.length > 0
    ? murmurs.reduce((best, m) => (m.prismPrecision > best.prismPrecision ? m : best)).file : ''
  const mostResilient = murmurs.length > 0
    ? murmurs.reduce((best, m) => (m.auroraResilience > best.auroraResilience ? m : best)).file : ''
  const wisest = murmurs.length > 0
    ? murmurs.reduce((best, m) => (m.opalescenceWisdom > best.opalescenceWisdom ? m : best)).file : ''

  const stats: OpalWhisperResult['stats'] = {
    totalFiles: files.length, totalChoruses: choruses.length,
    avgSpectralPlay, avgHarmonicClarity, avgPrismPrecision, avgAuroraResilience, avgOpalescenceWisdom,
    opalMasterpieceCount, preciousFireCount, properOpalCount, commonStoneCount, potchRockCount, voidCount,
    hasHighPlayCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallBrilliance, gemologistGrade,
    bestMurmur, mostColorful, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(murmurs, choruses, spectrum, stats)

  return {
    murmurs, choruses, spectrum, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(murmurs, choruses, spectrum, stats) */
export function generateRecommendations(
  murmurs: OpalMurmur[],
  choruses: OpalChorus[],
  _spectrum: OpalWhisperResult['spectrum'],
  stats: OpalWhisperResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgSpectralPlay >= 90 &&
    stats.avgHarmonicClarity >= 90 &&
    stats.avgPrismPrecision >= 90 &&
    stats.avgAuroraResilience >= 90 &&
    stats.avgOpalescenceWisdom >= 90
  ) {
    recs.push(
      'Your opal whisper reveals a kaleidoscope masterpiece! Spectral play is kaleidoscope, harmonic clarity is symphonic-clarity, prism precision is perfect-diffraction, aurora resilience is eternal-lights, and opalescence wisdom is light-master!',
    )
    return recs
  }

  if (stats.avgSpectralPlay < 60) {
    recs.push(
      'Expand spectral play — the opal must diffract light into every color; eliminate rigid patterns, embrace versatile structures, and achieve kaleidoscope play of color'
    )
  }

  if (stats.avgHarmonicClarity < 60) {
    recs.push(
      'Refine harmonic clarity — the opal must resonate with clear tones; remove cryptic patterns, add self-documenting code, and achieve symphonic-clarity resonance'
    )
  }

  if (stats.avgPrismPrecision < 60) {
    recs.push(
      'Sharpen prism precision — the opal must refract light at exact angles; tighten types, eliminate unsafe patterns, and achieve perfect-diffraction precision'
    )
  }

  if (stats.avgAuroraResilience < 60) {
    recs.push(
      'Strengthen aurora resilience — the opal must endure through the darkest nights; add error handling, test thoroughly, and build eternal-lights resilience'
    )
  }

  if (stats.avgOpalescenceWisdom < 60) {
    recs.push(
      'Deepen opalescence wisdom — the opal must understand the interplay of light and structure; build with principled architecture, proven patterns, and light-master insight'
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The opal whisper is barely audible — potch rocks and common stones outnumber the precious fire, and no light escapes'
    )
  }

  const voidMurmurs = murmurs.filter((m) => m.condition === 'void')
  if (voidMurmurs.length > 0 && voidMurmurs.length <= 5) {
    recs.push(`Remove these potch rocks from the collection: ${voidMurmurs.map((m) => m.file).join(', ')}`)
  } else if (voidMurmurs.length > 5) {
    recs.push(`Remove ${voidMurmurs.length} potch rocks from the collection before the last light fades completely`)
  }

  const poorChoruses = choruses.filter((c) => c.condition === 'void' || c.condition === 'empty-case')
  if (poorChoruses.length === choruses.length && choruses.length > 0) {
    recs.push('All choruses are silent — the opal whisper needs opal-palace quality murmurs throughout')
  }

  if (recs.length === 0) {
    recs.push('Your opal whisper radiates with spectral brilliance — every murmur carries spectral play, harmonic clarity, prism precision, aurora resilience, and opalescence wisdom')
  }

  return recs
}
