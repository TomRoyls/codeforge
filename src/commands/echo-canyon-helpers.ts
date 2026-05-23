// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Resonance grade */
export type ResonanceGrade =
  | 'deep-canyon'
  | 'strong-echo'
  | 'proper-resonance'
  | 'weak-echo'
  | 'fading-sound'
  | 'silence'

/** Echo grade */
export type EchoGrade =
  | 'crystal-clear'
  | 'clear-echo'
  | 'proper-reflection'
  | 'muffled-echo'
  | 'garbled'
  | 'no-echo'

/** Wall grade */
export type WallGrade =
  | 'granite-cliff'
  | 'solid-rock'
  | 'proper-wall'
  | 'crumbling-edge'
  | 'eroded-slope'
  | 'no-boundary'

/** Acoustic grade */
export type AcousticGrade =
  | 'pure-tone'
  | 'clean-signal'
  | 'proper-sound'
  | 'noisy-channel'
  | 'static-heavy'
  | 'white-noise'

/** Detection grade */
export type DetectionGrade =
  | 'sonar-grade'
  | 'high-sensitivity'
  | 'proper-detection'
  | 'low-sensitivity'
  | 'deaf-spot'
  | 'deaf'

/** Echo condition */
export type EchoCondition =
  | 'grand-canyon'
  | 'echo-valley'
  | 'proper-gorge'
  | 'shallow-ravine'
  | 'silent-hollow'
  | 'flat-plain'

/** Canyon type */
export type CanyonType =
  | 'grand-canyon'
  | 'deep-gorge'
  | 'river-valley'
  | 'shallow-ravine'
  | 'ditch'
  | 'flat-ground'

/** Canyon condition */
export type CanyonCondition =
  | 'perfect-acoustics'
  | 'great-echoes'
  | 'decent-reverb'
  | 'poor-acoustics'
  | 'dead-sound'
  | 'silent'

/** Acoustic grade (overall) */
export type OverallAcousticGrade =
  | 'acoustic-engineer'
  | 'sound-designer'
  | 'audio-technician'
  | 'listener'
  | 'deaf-ear'
  | 'mute'

/** Resonating measurement */
export interface ResonatingMeasure {
  depth: number
  grade: ResonanceGrade
  hasHighDepth: boolean
  hasLasting: boolean
  hasPersistent: boolean
  hasNoFleeting: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasEnduring: boolean
  hasNoBrief: boolean
  hasResonant: boolean
  hasNoFlat: boolean
  hasImpactful: boolean
  fleetingCount: number
  shallowCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  echo: EchoGrade
  hasHighClarity: boolean
  hasClear: boolean
  hasDistinct: boolean
  hasNoBlurred: boolean
  hasUnderstandable: boolean
  hasNoMuddy: boolean
  hasReadable: boolean
  hasNoAmbiguous: boolean
  hasTransparent: boolean
  hasNoOpaque: boolean
  hasExplicit: boolean
  blurredCount: number
  muddyCount: number
}

/** Forming measurement */
export interface FormingMeasure {
  quality: number
  wall: WallGrade
  hasHighQuality: boolean
  hasDefined: boolean
  hasBound: boolean
  hasNoUnbounded: boolean
  hasEncapsulated: boolean
  hasNoLeaking: boolean
  hasContained: boolean
  hasNoSpilling: boolean
  hasScoped: boolean
  hasNoGlobal: boolean
  hasIsolated: boolean
  unboundedCount: number
  leakingCount: number
}

/** Purifying measurement */
export interface PurifyingMeasure {
  purity: number
  acoustic: AcousticGrade
  hasHighPurity: boolean
  hasClean: boolean
  hasPure: boolean
  hasNoPolluted: boolean
  hasFocused: boolean
  hasNoDistracted: boolean
  hasSignal: boolean
  hasNoNoise: boolean
  hasEssential: boolean
  hasNoCluttered: boolean
  hasConcentrated: boolean
  pollutedCount: number
  distractedCount: number
}

/** Detecting measurement */
export interface DetectingMeasure {
  sensitivity: number
  detection: DetectionGrade
  hasHighSensitivity: boolean
  hasSensitive: boolean
  hasAttentive: boolean
  hasNoOblivious: boolean
  hasObservant: boolean
  hasNoBlind: boolean
  hasPerceptive: boolean
  hasNoUnaware: boolean
  hasVigilant: boolean
  hasNoNegligent: boolean
  hasAlert: boolean
  obliviousCount: number
  blindCount: number
}

/** Single file analysis */
export interface CanyonEcho {
  file: string
  resonanceDepth: number
  echoClarity: number
  wallFormation: number
  acousticPurity: number
  whisperDetection: number
  resonating: ResonatingMeasure
  clarifying: ClarifyingMeasure
  forming: FormingMeasure
  purifying: PurifyingMeasure
  detecting: DetectingMeasure
  condition: EchoCondition
  qualityScore: number
}

/** Directory-level canyon system */
export interface CanyonSystem {
  directory: string
  echoes: CanyonEcho[]
  avgDepth: number
  avgClarity: number
  avgPurity: number
  grandCanyonCount: number
  flatPlainCount: number
  canyonType: CanyonType
  condition: CanyonCondition
}

/** Landscape summary */
export interface LandscapeSummary {
  avgDepth: number
  avgClarity: number
  avgPurity: number
  isResonant: boolean
  overallAcoustics: number
}

/** Full stats */
export interface EchoCanyonStats {
  totalFiles: number
  totalCanyons: number
  avgResonanceDepth: number
  avgEchoClarity: number
  avgWallFormation: number
  avgAcousticPurity: number
  avgWhisperDetection: number
  grandCanyonCount: number
  echoValleyCount: number
  properGorgeCount: number
  shallowRavineCount: number
  silentHollowCount: number
  flatPlainCount: number
  hasHighDepthCount: number
  hasHighClarityCount: number
  hasHighQualityCount: number
  hasHighPurityCount: number
  hasHighSensitivityCount: number
  overallAcoustics: number
  acousticGrade: OverallAcousticGrade
  bestEcho: string
  deepest: string
  clearest: string
  bestWalled: string
  purest: string
}

/** Full result */
export interface EchoCanyonResult {
  echoes: CanyonEcho[]
  canyons: CanyonSystem[]
  landscape: LandscapeSummary
  stats: EchoCanyonStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure resonance depth (impact persistence)
 * @example
 * const m = measureResonating(content)
 * console.log(m.grade) // 'deep-canyon'
 */
export function measureResonating(content: string): ResonatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasLasting = hasExport(content) && hasImport(content)
  const hasPersistent = hasInterface(content) && hasClass(content)
  const hasDeep = hasGenerics(content) && hasTypeAlias(content)
  const hasEnduring = hasAsync(content) && hasReturnType(content)
  const hasResonant = hasConst(content) && hasExport(content)
  const hasImpactful = hasDocComments(content) && hasInterface(content)

  score += hasLasting ? 5 : 0
  score += hasPersistent ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasResonant ? 5 : 0
  score += hasImpactful ? 5 : 0

  const depth = Math.min(score, 100)
  const fleetingCount = count(/\bvar\b/, content)
  const shallowCount = count(/\bany\b/, content)

  const hasNoFleeting = fleetingCount === 0
  const hasNoShallow = shallowCount === 0
  const hasNoBrief = !has(/\beval\b/, content)
  const hasNoFlat = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grade: ResonanceGrade
  if (depth >= 85) grade = 'deep-canyon'
  else if (depth >= 70) grade = 'strong-echo'
  else if (depth >= 55) grade = 'proper-resonance'
  else if (depth >= 40) grade = 'weak-echo'
  else if (depth >= 25) grade = 'fading-sound'
  else grade = 'silence'

  return {
    depth, grade, hasHighDepth, hasLasting, hasPersistent, hasNoFleeting,
    hasDeep, hasNoShallow, hasEnduring, hasNoBrief, hasResonant,
    hasNoFlat, hasImpactful, fleetingCount, shallowCount,
  }
}

/**
 * Measure echo clarity (output clarity)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.echo) // 'crystal-clear'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasClear = hasReturnType(content) && hasStrictEq(content)
  const hasDistinct = hasReadonly(content) && hasPrivate(content)
  const hasUnderstandable = hasDocComments(content) && hasInterface(content)
  const hasReadable = hasGenerics(content) && hasExport(content)
  const hasTransparent = hasAsync(content) && hasReturnType(content)
  const hasExplicit = hasStrictEq(content) && hasClass(content)

  score += hasClear ? 5 : 0
  score += hasDistinct ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasExplicit ? 5 : 0

  const clarity = Math.min(score, 100)
  const blurredCount = count(/\bvar\b/, content)
  const muddyCount = count(/\bany\b/, content)

  const hasNoBlurred = blurredCount === 0
  const hasNoMuddy = muddyCount === 0
  const hasNoAmbiguous = !has(/\beval\b/, content)
  const hasNoOpaque = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let echo: EchoGrade
  if (clarity >= 85) echo = 'crystal-clear'
  else if (clarity >= 70) echo = 'clear-echo'
  else if (clarity >= 55) echo = 'proper-reflection'
  else if (clarity >= 40) echo = 'muffled-echo'
  else if (clarity >= 25) echo = 'garbled'
  else echo = 'no-echo'

  return {
    clarity, echo, hasHighClarity, hasClear, hasDistinct, hasNoBlurred,
    hasUnderstandable, hasNoMuddy, hasReadable, hasNoAmbiguous, hasTransparent,
    hasNoOpaque, hasExplicit, blurredCount, muddyCount,
  }
}

/**
 * Measure wall formation (boundary quality)
 * @example
 * const m = measureForming(content)
 * console.log(m.wall) // 'granite-cliff'
 */
export function measureForming(content: string): FormingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasDefined = hasInterface(content) && hasClass(content)
  const hasBound = hasPrivate(content) && hasReadonly(content)
  const hasEncapsulated = hasExport(content) && hasImport(content)
  const hasContained = hasGenerics(content) && hasTypeAlias(content)
  const hasScoped = hasConst(content) && hasExport(content)
  const hasIsolated = hasNamedExport(content) && hasInterface(content)

  score += hasDefined ? 5 : 0
  score += hasBound ? 5 : 0
  score += hasEncapsulated ? 5 : 0
  score += hasContained ? 5 : 0
  score += hasScoped ? 5 : 0
  score += hasIsolated ? 5 : 0

  const quality = Math.min(score, 100)
  const unboundedCount = count(/\bvar\b/, content)
  const leakingCount = count(/\bany\b/, content)

  const hasNoUnbounded = unboundedCount === 0
  const hasNoLeaking = leakingCount === 0
  const hasNoSpilling = !has(/\beval\b/, content)
  const hasNoGlobal = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let wall: WallGrade
  if (quality >= 85) wall = 'granite-cliff'
  else if (quality >= 70) wall = 'solid-rock'
  else if (quality >= 55) wall = 'proper-wall'
  else if (quality >= 40) wall = 'crumbling-edge'
  else if (quality >= 25) wall = 'eroded-slope'
  else wall = 'no-boundary'

  return {
    quality, wall, hasHighQuality, hasDefined, hasBound, hasNoUnbounded,
    hasEncapsulated, hasNoLeaking, hasContained, hasNoSpilling, hasScoped,
    hasNoGlobal, hasIsolated, unboundedCount, leakingCount,
  }
}

/**
 * Measure acoustic purity (signal-to-noise)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.acoustic) // 'pure-tone'
 */
export function measurePurifying(content: string): PurifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasClean = hasExport(content) && hasConst(content)
  const hasPure = hasInterface(content) && hasAsync(content)
  const hasFocused = hasDocComments(content) && hasReturnType(content)
  const hasSignal = hasGenerics(content) && hasClass(content)
  const hasEssential = hasImport(content) && hasExport(content)
  const hasConcentrated = hasNamedExport(content) && hasConst(content)

  score += hasClean ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasSignal ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasConcentrated ? 5 : 0

  const purity = Math.min(score, 100)
  const pollutedCount = count(/\bvar\b/, content)
  const distractedCount = count(/\bany\b/, content)

  const hasNoPolluted = pollutedCount === 0
  const hasNoDistracted = distractedCount === 0
  const hasNoNoise = !has(/\beval\b/, content)
  const hasNoCluttered = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let acoustic: AcousticGrade
  if (purity >= 85) acoustic = 'pure-tone'
  else if (purity >= 70) acoustic = 'clean-signal'
  else if (purity >= 55) acoustic = 'proper-sound'
  else if (purity >= 40) acoustic = 'noisy-channel'
  else if (purity >= 25) acoustic = 'static-heavy'
  else acoustic = 'white-noise'

  return {
    purity, acoustic, hasHighPurity, hasClean, hasPure, hasNoPolluted,
    hasFocused, hasNoDistracted, hasSignal, hasNoNoise, hasEssential,
    hasNoCluttered, hasConcentrated, pollutedCount, distractedCount,
  }
}

/**
 * Measure whisper detection (subtle issue detection)
 * @example
 * const m = measureDetecting(content)
 * console.log(m.detection) // 'sonar-grade'
 */
export function measureDetecting(content: string): DetectingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasSensitive = hasStrictEq(content) && hasReturnType(content)
  const hasAttentive = hasReadonly(content) && hasPrivate(content)
  const hasObservant = hasTypeAlias(content) && hasGenerics(content)
  const hasPerceptive = hasDocComments(content) && hasInterface(content)
  const hasVigilant = hasExport(content) && hasStrictEq(content)
  const hasAlert = hasClass(content) && hasReturnType(content)

  score += hasSensitive ? 5 : 0
  score += hasAttentive ? 5 : 0
  score += hasObservant ? 5 : 0
  score += hasPerceptive ? 5 : 0
  score += hasVigilant ? 5 : 0
  score += hasAlert ? 5 : 0

  const sensitivity = Math.min(score, 100)
  const obliviousCount = count(/\bvar\b/, content)
  const blindCount = count(/\bany\b/, content)

  const hasNoOblivious = obliviousCount === 0
  const hasNoBlind = blindCount === 0
  const hasNoUnaware = !has(/\beval\b/, content)
  const hasNoNegligent = !has(/\bdebugger\b/, content)
  const hasHighSensitivity = sensitivity >= 70

  let detection: DetectionGrade
  if (sensitivity >= 85) detection = 'sonar-grade'
  else if (sensitivity >= 70) detection = 'high-sensitivity'
  else if (sensitivity >= 55) detection = 'proper-detection'
  else if (sensitivity >= 40) detection = 'low-sensitivity'
  else if (sensitivity >= 25) detection = 'deaf-spot'
  else detection = 'deaf'

  return {
    sensitivity, detection, hasHighSensitivity, hasSensitive, hasAttentive,
    hasNoOblivious, hasObservant, hasNoBlind, hasPerceptive, hasNoUnaware,
    hasVigilant, hasNoNegligent, hasAlert, obliviousCount, blindCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify echo condition
 * @example
 * classifyEchoCondition(90) // 'grand-canyon'
 */
export function classifyEchoCondition(score: number): EchoCondition {
  if (score >= 85) return 'grand-canyon'
  if (score >= 70) return 'echo-valley'
  if (score >= 55) return 'proper-gorge'
  if (score >= 40) return 'shallow-ravine'
  if (score >= 25) return 'silent-hollow'
  return 'flat-plain'
}

/**
 * Classify canyon type
 * @example
 * classifyCanyonType(echoes) // 'grand-canyon'
 */
export function classifyCanyonType(echoes: CanyonEcho[]): CanyonType {
  if (echoes.length === 0) return 'flat-ground'
  const avgQs = Math.round(echoes.reduce((s, e) => s + e.qualityScore, 0) / echoes.length)
  const grandRatio = echoes.filter(e => e.condition === 'grand-canyon').length / echoes.length
  if (avgQs >= 75 && grandRatio >= 0.5) return 'grand-canyon'
  if (avgQs >= 60) return 'deep-gorge'
  if (avgQs >= 45) return 'river-valley'
  if (avgQs >= 30) return 'shallow-ravine'
  if (avgQs >= 15) return 'ditch'
  return 'flat-ground'
}

/**
 * Classify acoustic grade
 * @example
 * classifyAcousticGrade(85) // 'acoustic-engineer'
 */
export function classifyAcousticGrade(avgAcoustics: number): OverallAcousticGrade {
  if (avgAcoustics >= 80) return 'acoustic-engineer'
  if (avgAcoustics >= 65) return 'sound-designer'
  if (avgAcoustics >= 50) return 'audio-technician'
  if (avgAcoustics >= 35) return 'listener'
  if (avgAcoustics >= 20) return 'deaf-ear'
  return 'mute'
}

/**
 * Classify canyon condition
 * @example
 * classifyCanyonCondition(80) // 'perfect-acoustics'
 */
export function classifyCanyonCondition(avgQs: number): CanyonCondition {
  if (avgQs >= 75) return 'perfect-acoustics'
  if (avgQs >= 60) return 'great-echoes'
  if (avgQs >= 45) return 'decent-reverb'
  if (avgQs >= 30) return 'poor-acoustics'
  if (avgQs >= 15) return 'dead-sound'
  return 'silent'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(echoes, canyons, landscape, stats)
 */
export function generateRecommendations(
  echoes: CanyonEcho[],
  canyons: CanyonSystem[],
  landscape: LandscapeSummary,
  stats: EchoCanyonStats,
): string[] {
  const recs: string[] = []
  if (stats.avgResonanceDepth < 50) {
    recs.push('Deepen resonance with lasting exports, persistent interfaces, and deep type patterns')
  }
  if (stats.avgEchoClarity < 50) {
    recs.push('Clarify echoes with strict equality, clear return types, and distinct visibility modifiers')
  }
  if (stats.avgWallFormation < 50) {
    recs.push('Strengthen walls with defined interfaces, bound access, and encapsulated modules')
  }
  if (stats.avgAcousticPurity < 50) {
    recs.push('Purify acoustics with clean exports, focused documentation, and essential imports')
  }
  if (stats.avgWhisperDetection < 50) {
    recs.push('Sharpen detection with sensitive strict equality, observant type aliases, and vigilant patterns')
  }
  if (stats.flatPlainCount > 0) {
    recs.push(`${stats.flatPlainCount} file(s) are flat plains — consider significant refactoring`)
  }
  if (landscape.overallAcoustics < 40) {
    recs.push('Overall canyon acoustics are poor — focus on resonance depth and echo clarity first')
  }
  const allFlat = canyons.every(c => c.canyonType === 'flat-ground' || c.canyonType === 'ditch')
  if (allFlat && canyons.length > 0) {
    recs.push('All canyons are flat ground or ditches — consider a major quality overhaul')
  }
  const plains = echoes.filter(e => e.condition === 'flat-plain').map(e => e.file)
  if (plains.length > 0 && plains.length <= 3) {
    recs.push(`Transform these flat-plain files into canyons: ${plains.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your code canyon echoes with perfect acoustics! Every whisper finds its wall and every resonance carries deep')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a canyon echo
 * @example
 * const echo = analyzeCanyonEcho(content, 'index.ts')
 * console.log(echo.condition) // 'grand-canyon'
 */
export function analyzeCanyonEcho(content: string, filePath: string): CanyonEcho {
  const resonating = measureResonating(content)
  const clarifying = measureClarifying(content)
  const forming = measureForming(content)
  const purifying = measurePurifying(content)
  const detecting = measureDetecting(content)

  const qualityScore = Math.round(
    resonating.depth * 0.2 +
    clarifying.clarity * 0.2 +
    forming.quality * 0.2 +
    purifying.purity * 0.2 +
    detecting.sensitivity * 0.2,
  )

  return {
    file: filePath,
    resonanceDepth: resonating.depth,
    echoClarity: clarifying.clarity,
    wallFormation: forming.quality,
    acousticPurity: purifying.purity,
    whisperDetection: detecting.sensitivity,
    resonating,
    clarifying,
    forming,
    purifying,
    detecting,
    condition: classifyEchoCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a canyon system
 * @example
 * const system = analyzeCanyonSystem(echoes, 'src')
 * console.log(system.canyonType) // 'grand-canyon'
 */
export function analyzeCanyonSystem(echoes: CanyonEcho[], dirPath: string): CanyonSystem {
  if (echoes.length === 0) {
    return {
      directory: dirPath, echoes: [], avgDepth: 0, avgClarity: 0, avgPurity: 0,
      grandCanyonCount: 0, flatPlainCount: 0, canyonType: 'flat-ground', condition: 'silent',
    }
  }

  const avgDepth = Math.round(echoes.reduce((s, e) => s + e.resonanceDepth, 0) / echoes.length)
  const avgClarity = Math.round(echoes.reduce((s, e) => s + e.echoClarity, 0) / echoes.length)
  const avgPurity = Math.round(echoes.reduce((s, e) => s + e.acousticPurity, 0) / echoes.length)
  const grandCanyonCount = echoes.filter(e => e.condition === 'grand-canyon').length
  const flatPlainCount = echoes.filter(e => e.condition === 'flat-plain').length
  const avgQs = Math.round(echoes.reduce((s, e) => s + e.qualityScore, 0) / echoes.length)

  return {
    directory: dirPath, echoes, avgDepth, avgClarity, avgPurity,
    grandCanyonCount, flatPlainCount, canyonType: classifyCanyonType(echoes),
    condition: classifyCanyonCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete echo canyon result
 * @example
 * const result = await buildEchoCanyonResult(files, contents)
 * console.log(result.stats.acousticGrade) // 'acoustic-engineer'
 */
export async function buildEchoCanyonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EchoCanyonResult> {
  const echoes = files.map((file, i) => analyzeCanyonEcho(contents[i] ?? '', file))

  const dirMap = new Map<string, CanyonEcho[]>()
  for (const echo of echoes) {
    const dir = path.dirname(echo.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(echo) } else { dirMap.set(dir, [echo]) }
  }

  const canyons = Array.from(dirMap.entries()).map(([dir, dirEchoes]) =>
    analyzeCanyonSystem(dirEchoes, dir),
  )

  const avgDepth = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.resonanceDepth, 0) / echoes.length) : 0
  const avgClarity = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.echoClarity, 0) / echoes.length) : 0
  const avgPurity = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.acousticPurity, 0) / echoes.length) : 0

  const overallAcoustics = echoes.length > 0
    ? Math.round((avgDepth + avgClarity + avgPurity) / 3) : 0
  const isResonant = avgDepth >= 60

  const landscape: LandscapeSummary = { avgDepth, avgClarity, avgPurity, isResonant, overallAcoustics }

  const avgResonanceDepth = avgDepth
  const avgEchoClarity = avgClarity
  const avgAcousticPurity = avgPurity
  const avgWallFormation = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.wallFormation, 0) / echoes.length) : 0
  const avgWhisperDetection = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.whisperDetection, 0) / echoes.length) : 0

  const bestEcho = echoes.length > 0
    ? echoes.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const deepest = echoes.length > 0
    ? echoes.reduce((best, e) => e.resonanceDepth > best.resonanceDepth ? e : best).file : ''
  const clearest = echoes.length > 0
    ? echoes.reduce((best, e) => e.echoClarity > best.echoClarity ? e : best).file : ''
  const bestWalled = echoes.length > 0
    ? echoes.reduce((best, e) => e.wallFormation > best.wallFormation ? e : best).file : ''
  const purest = echoes.length > 0
    ? echoes.reduce((best, e) => e.acousticPurity > best.acousticPurity ? e : best).file : ''

  const stats: EchoCanyonStats = {
    totalFiles: echoes.length,
    totalCanyons: canyons.length,
    avgResonanceDepth,
    avgEchoClarity,
    avgWallFormation,
    avgAcousticPurity,
    avgWhisperDetection,
    grandCanyonCount: echoes.filter(e => e.condition === 'grand-canyon').length,
    echoValleyCount: echoes.filter(e => e.condition === 'echo-valley').length,
    properGorgeCount: echoes.filter(e => e.condition === 'proper-gorge').length,
    shallowRavineCount: echoes.filter(e => e.condition === 'shallow-ravine').length,
    silentHollowCount: echoes.filter(e => e.condition === 'silent-hollow').length,
    flatPlainCount: echoes.filter(e => e.condition === 'flat-plain').length,
    hasHighDepthCount: echoes.filter(e => e.resonating.hasHighDepth).length,
    hasHighClarityCount: echoes.filter(e => e.clarifying.hasHighClarity).length,
    hasHighQualityCount: echoes.filter(e => e.forming.hasHighQuality).length,
    hasHighPurityCount: echoes.filter(e => e.purifying.hasHighPurity).length,
    hasHighSensitivityCount: echoes.filter(e => e.detecting.hasHighSensitivity).length,
    overallAcoustics,
    acousticGrade: classifyAcousticGrade(overallAcoustics),
    bestEcho, deepest, clearest, bestWalled, purest,
  }

  const recommendations = generateRecommendations(echoes, canyons, landscape, stats)

  return { echoes, canyons, landscape, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
