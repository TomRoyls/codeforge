// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Resonance depth grade */
export type ResonanceGrade =
  | 'thunderous-depth'
  | 'deep-resonance'
  | 'proper-echo'
  | 'shallow-ring'
  | 'hollow-sound'
  | 'silence'

/** Echo clarity grade */
export type EchoGrade =
  | 'crystal-clear'
  | 'clear-tone'
  | 'proper-acoustics'
  | 'muffled-sound'
  | 'garbled-echo'
  | 'no-echo'

/** Reverberation quality grade */
export type ReverberationGrade =
  | 'harmonic-cascade'
  | 'clean-chain'
  | 'proper-ripple'
  | 'disrupted-wave'
  | 'broken-echo'
  | 'no-reverberation'

/** Sound propagation grade */
export type PropagationGrade =
  | 'sonic-boom'
  | 'clear-transmission'
  | 'proper-signal'
  | 'attenuated-wave'
  | 'lost-signal'
  | 'no-propagation'

/** Acoustic balance grade */
export type AcousticsGrade =
  | 'concert-hall'
  | 'balanced-mix'
  | 'proper-equalization'
  | 'uneven-sound'
  | 'distorted-noise'
  | 'cacophony'

/** Thunder echo condition */
export type EchoCondition =
  | 'thunder-masterpiece'
  | 'resonant-chamber'
  | 'proper-well'
  | 'cracked-basin'
  | 'dry-well'
  | 'ruined-cistern'

/** Chamber type */
export type ChamberType =
  | 'grand-amphitheater'
  | 'concert-hall'
  | 'proper-chamber'
  | 'small-room'
  | 'closet'
  | 'no-chamber'

/** Chamber condition */
export type ChamberCondition =
  | 'magnificent-acoustics'
  | 'excellent-sound'
  | 'decent-reverb'
  | 'poor-acoustics'
  | 'dead-space'
  | 'void'

/** Acoustic grade */
export type AcousticGrade =
  | 'maestro'
  | 'virtuoso'
  | 'musician'
  | 'apprentice'
  | 'novice'
  | 'tone-deaf'

/** Resonating measurement */
export interface ResonatingMeasure {
  depth: number
  grade: ResonanceGrade
  hasHighDepth: boolean
  hasHighSignal: boolean
  hasLowNoise: boolean
  hasNoDeadCode: boolean
  hasPurposeful: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasEssential: boolean
  hasNoRedundant: boolean
  hasImpactful: boolean
  deadCodeCount: number
  fillerCount: number
}

/** Echoing measurement */
export interface EchoingMeasure {
  clarity: number
  echo: EchoGrade
  hasHighClarity: boolean
  hasClearFeedback: boolean
  hasDescriptive: boolean
  hasNoVague: boolean
  hasInformative: boolean
  hasNoSilent: boolean
  hasExpressive: boolean
  hasNoCryptic: boolean
  hasResponsive: boolean
  hasNoUnresponsive: boolean
  hasTransparent: boolean
  vagueCount: number
  silentCount: number
}

/** Reverberating measurement */
export interface ReverberatingMeasure {
  quality: number
  reverberation: ReverberationGrade
  hasHighQuality: boolean
  hasCleanChaining: boolean
  hasSequential: boolean
  hasNoSkipped: boolean
  hasComplete: boolean
  hasNoMissingSteps: boolean
  hasTraceable: boolean
  hasNoOrphaned: boolean
  hasConnected: boolean
  hasNoDisconnected: boolean
  hasFlowing: boolean
  skippedCount: number
  missingStepsCount: number
}

/** Propagating measurement */
export interface PropagatingMeasure {
  propagation: number
  sound: PropagationGrade
  hasHighPropagation: boolean
  hasExplicitCommunication: boolean
  hasEventDriven: boolean
  hasNoImplicitCoupling: boolean
  hasObservable: boolean
  hasNoHiddenState: boolean
  hasDecoupled: boolean
  hasNoDirectAccess: boolean
  hasMessaged: boolean
  hasNoSideChannels: boolean
  hasPublished: boolean
  implicitCouplingCount: number
  hiddenStateCount: number
}

/** Balancing measurement */
export interface BalancingMeasure {
  balance: number
  acoustics: AcousticsGrade
  hasHighBalance: boolean
  hasEvenDistribution: boolean
  hasBalancedComplexity: boolean
  hasNoGodFunctions: boolean
  hasProportional: boolean
  hasNoOverweight: boolean
  hasWellSized: boolean
  hasNoGiant: boolean
  hasReasonable: boolean
  hasNoMicroscopic: boolean
  hasTempered: boolean
  godFunctionCount: number
  overweightCount: number
}

/** Single file analysis */
export interface ThunderEcho {
  file: string
  resonanceDepth: number
  echoClarity: number
  reverberationQuality: number
  soundPropagation: number
  acousticBalance: number
  resonating: ResonatingMeasure
  echoing: EchoingMeasure
  reverberating: ReverberatingMeasure
  propagating: PropagatingMeasure
  balancing: BalancingMeasure
  condition: EchoCondition
  qualityScore: number
}

/** Directory-level chamber */
export interface AcousticChamber {
  directory: string
  echoes: ThunderEcho[]
  avgResonance: number
  avgClarity: number
  avgBalance: number
  thunderMasterpieceCount: number
  ruinedCisternCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

/** Symphony summary */
export interface SymphonySummary {
  avgResonance: number
  avgClarity: number
  avgBalance: number
  isHarmonious: boolean
  overallAcoustics: number
}

/** Full stats */
export interface ThunderWellStats {
  totalFiles: number
  totalChambers: number
  avgResonanceDepth: number
  avgEchoClarity: number
  avgReverberationQuality: number
  avgSoundPropagation: number
  avgAcousticBalance: number
  thunderMasterpieceCount: number
  resonantChamberCount: number
  properWellCount: number
  crackedBasinCount: number
  dryWellCount: number
  ruinedCisternCount: number
  hasHighDepthCount: number
  hasHighClarityCount: number
  hasHighQualityCount: number
  hasHighPropagationCount: number
  hasHighBalanceCount: number
  overallAcoustics: number
  acousticGrade: AcousticGrade
  bestEcho: string
  mostResonant: string
  clearestEcho: string
  bestReverberation: string
  bestPropagation: string
}

/** Full result */
export interface ThunderWellResult {
  echoes: ThunderEcho[]
  chambers: AcousticChamber[]
  symphony: SymphonySummary
  stats: ThunderWellStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
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
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure resonance depth
 * @example
 * const m = measureResonating(content)
 * console.log(m.grade) // 'thunderous-depth'
 */
export function measureResonating(content: string): ResonatingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasHighSignal = hasNamedExport(content) && hasReturnType(content)
  const hasPurposeful = hasInterface(content) && hasGenerics(content)
  const hasMeaningful = hasExport(content) && hasImport(content)
  const hasEssential = hasConst(content) && hasReturnType(content)
  const hasImpactful = hasDocComments(content) && hasNamedExport(content)

  score += hasHighSignal ? 5 : 0
  score += hasPurposeful ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasImpactful ? 5 : 0

  const depth = Math.min(score, 100)
  const deadCodeCount = countMatches(/\bvar\b/, content)
  const fillerCount = countMatches(/\bany\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoFiller = fillerCount === 0
  const hasNoBoilerplate = !has(/\beval\b/, content)
  const hasNoRedundant = !has(/\bdebugger\b/, content)
  const hasLowNoise = deadCodeCount === 0 && fillerCount === 0
  const hasHighDepth = depth >= 70

  let grade: ResonanceGrade
  if (depth >= 85) grade = 'thunderous-depth'
  else if (depth >= 70) grade = 'deep-resonance'
  else if (depth >= 55) grade = 'proper-echo'
  else if (depth >= 40) grade = 'shallow-ring'
  else if (depth >= 25) grade = 'hollow-sound'
  else grade = 'silence'

  return {
    depth, grade, hasHighDepth, hasHighSignal, hasLowNoise, hasNoDeadCode,
    hasPurposeful, hasNoFiller, hasMeaningful, hasNoBoilerplate, hasEssential,
    hasNoRedundant, hasImpactful, deadCodeCount, fillerCount,
  }
}

/**
 * Measure echo clarity
 * @example
 * const m = measureEchoing(content)
 * console.log(m.echo) // 'crystal-clear'
 */
export function measureEchoing(content: string): EchoingMeasure {
  let score = 0
  score += hasDocComments(content) ? 12 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasClearFeedback = hasReturnType(content) && hasStrictEq(content)
  const hasDescriptive = hasDocComments(content) && hasNamedExport(content)
  const hasInformative = hasInterface(content) && hasReturnType(content)
  const hasExpressive = hasConst(content) && hasExport(content)
  const hasResponsive = hasAsync(content) && hasReturnType(content)
  const hasTransparent = hasOptional(content) && hasDocComments(content)

  score += hasClearFeedback ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasInformative ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasTransparent ? 5 : 0

  const clarity = Math.min(score, 100)
  const vagueCount = countMatches(/\bvar\b/, content)
  const silentCount = countMatches(/\bany\b/, content)

  const hasNoVague = vagueCount === 0
  const hasNoSilent = silentCount === 0
  const hasNoCryptic = !has(/\beval\b/, content)
  const hasNoUnresponsive = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let echo: EchoGrade
  if (clarity >= 85) echo = 'crystal-clear'
  else if (clarity >= 70) echo = 'clear-tone'
  else if (clarity >= 55) echo = 'proper-acoustics'
  else if (clarity >= 40) echo = 'muffled-sound'
  else if (clarity >= 25) echo = 'garbled-echo'
  else echo = 'no-echo'

  return {
    clarity, echo, hasHighClarity, hasClearFeedback, hasDescriptive, hasNoVague,
    hasInformative, hasNoSilent, hasExpressive, hasNoCryptic, hasResponsive,
    hasNoUnresponsive, hasTransparent, vagueCount, silentCount,
  }
}

/**
 * Measure reverberation quality
 * @example
 * const m = measureReverberating(content)
 * console.log(m.reverberation) // 'harmonic-cascade'
 */
export function measureReverberating(content: string): ReverberatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasCleanChaining = hasExport(content) && hasImport(content)
  const hasSequential = hasAsync(content) && hasReturnType(content)
  const hasComplete = hasInterface(content) && hasConst(content)
  const hasTraceable = hasNamedExport(content) && hasReturnType(content)
  const hasConnected = hasGenerics(content) && hasInterface(content)
  const hasFlowing = hasTryCatch(content) && hasAsync(content)

  score += hasCleanChaining ? 5 : 0
  score += hasSequential ? 5 : 0
  score += hasComplete ? 5 : 0
  score += hasTraceable ? 5 : 0
  score += hasConnected ? 5 : 0
  score += hasFlowing ? 5 : 0

  const quality = Math.min(score, 100)
  const skippedCount = countMatches(/\bvar\b/, content)
  const missingStepsCount = countMatches(/\bany\b/, content)

  const hasNoSkipped = skippedCount === 0
  const hasNoMissingSteps = missingStepsCount === 0
  const hasNoOrphaned = !has(/\beval\b/, content)
  const hasNoDisconnected = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let reverberation: ReverberationGrade
  if (quality >= 85) reverberation = 'harmonic-cascade'
  else if (quality >= 70) reverberation = 'clean-chain'
  else if (quality >= 55) reverberation = 'proper-ripple'
  else if (quality >= 40) reverberation = 'disrupted-wave'
  else if (quality >= 25) reverberation = 'broken-echo'
  else reverberation = 'no-reverberation'

  return {
    quality, reverberation, hasHighQuality, hasCleanChaining, hasSequential,
    hasNoSkipped, hasComplete, hasNoMissingSteps, hasTraceable, hasNoOrphaned,
    hasConnected, hasNoDisconnected, hasFlowing, skippedCount, missingStepsCount,
  }
}

/**
 * Measure sound propagation
 * @example
 * const m = measurePropagating(content)
 * console.log(m.sound) // 'sonic-boom'
 */
export function measurePropagating(content: string): PropagatingMeasure {
  let score = 0
  score += hasExport(content) ? 12 : 0
  score += hasImport(content) ? 12 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasExplicitCommunication = hasNamedExport(content) && hasReturnType(content)
  const hasEventDriven = hasAsync(content) && hasExport(content)
  const hasObservable = hasInterface(content) && hasReturnType(content)
  const hasDecoupled = hasGenerics(content) && hasImport(content)
  const hasMessaged = hasConst(content) && hasExport(content)
  const hasPublished = hasDocComments(content) && hasNamedExport(content)

  score += hasExplicitCommunication ? 5 : 0
  score += hasEventDriven ? 5 : 0
  score += hasObservable ? 5 : 0
  score += hasDecoupled ? 5 : 0
  score += hasMessaged ? 5 : 0
  score += hasPublished ? 5 : 0

  const propagation = Math.min(score, 100)
  const implicitCouplingCount = countMatches(/\bvar\b/, content)
  const hiddenStateCount = countMatches(/\bany\b/, content)

  const hasNoImplicitCoupling = implicitCouplingCount === 0
  const hasNoHiddenState = hiddenStateCount === 0
  const hasNoDirectAccess = !has(/\beval\b/, content)
  const hasNoSideChannels = !has(/\bdebugger\b/, content)
  const hasHighPropagation = propagation >= 70

  let sound: PropagationGrade
  if (propagation >= 85) sound = 'sonic-boom'
  else if (propagation >= 70) sound = 'clear-transmission'
  else if (propagation >= 55) sound = 'proper-signal'
  else if (propagation >= 40) sound = 'attenuated-wave'
  else if (propagation >= 25) sound = 'lost-signal'
  else sound = 'no-propagation'

  return {
    propagation, sound, hasHighPropagation, hasExplicitCommunication,
    hasEventDriven, hasNoImplicitCoupling, hasObservable, hasNoHiddenState,
    hasDecoupled, hasNoDirectAccess, hasMessaged, hasNoSideChannels,
    hasPublished, implicitCouplingCount, hiddenStateCount,
  }
}

/**
 * Measure acoustic balance
 * @example
 * const m = measureBalancing(content)
 * console.log(m.acoustics) // 'concert-hall'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasGenerics(content) ? 8 : 0

  const hasEvenDistribution = hasExport(content) && hasImport(content)
  const hasBalancedComplexity = hasInterface(content) && hasConst(content)
  const hasProportional = hasReturnType(content) && hasNamedExport(content)
  const hasWellSized = hasClass(content) && hasPrivate(content)
  const hasReasonable = hasGenerics(content) && hasInterface(content)
  const hasTempered = hasReadonly(content) && hasConst(content)

  score += hasEvenDistribution ? 5 : 0
  score += hasBalancedComplexity ? 5 : 0
  score += hasProportional ? 5 : 0
  score += hasWellSized ? 5 : 0
  score += hasReasonable ? 5 : 0
  score += hasTempered ? 5 : 0

  const balance = Math.min(score, 100)
  const godFunctionCount = countMatches(/\bvar\b/, content)
  const overweightCount = countMatches(/\bany\b/, content)

  const hasNoGodFunctions = godFunctionCount === 0
  const hasNoOverweight = overweightCount === 0
  const hasNoGiant = !has(/\beval\b/, content)
  const hasNoMicroscopic = !has(/\bdebugger\b/, content)
  const hasHighBalance = balance >= 70

  let acoustics: AcousticsGrade
  if (balance >= 85) acoustics = 'concert-hall'
  else if (balance >= 70) acoustics = 'balanced-mix'
  else if (balance >= 55) acoustics = 'proper-equalization'
  else if (balance >= 40) acoustics = 'uneven-sound'
  else if (balance >= 25) acoustics = 'distorted-noise'
  else acoustics = 'cacophony'

  return {
    balance, acoustics, hasHighBalance, hasEvenDistribution, hasBalancedComplexity,
    hasNoGodFunctions, hasProportional, hasNoOverweight, hasWellSized, hasNoGiant,
    hasReasonable, hasNoMicroscopic, hasTempered, godFunctionCount, overweightCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify echo condition
 * @example
 * classifyEchoCondition(90) // 'thunder-masterpiece'
 */
export function classifyEchoCondition(score: number): EchoCondition {
  if (score >= 85) return 'thunder-masterpiece'
  if (score >= 70) return 'resonant-chamber'
  if (score >= 55) return 'proper-well'
  if (score >= 40) return 'cracked-basin'
  if (score >= 25) return 'dry-well'
  return 'ruined-cistern'
}

/**
 * Classify chamber type
 * @example
 * classifyChamberType(echoes) // 'grand-amphitheater'
 */
export function classifyChamberType(echoes: ThunderEcho[]): ChamberType {
  if (echoes.length === 0) return 'no-chamber'
  const avgQs = Math.round(echoes.reduce((s, e) => s + e.qualityScore, 0) / echoes.length)
  const masterpieceRatio = echoes.filter(e => e.condition === 'thunder-masterpiece').length / echoes.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'grand-amphitheater'
  if (avgQs >= 60) return 'concert-hall'
  if (avgQs >= 45) return 'proper-chamber'
  if (avgQs >= 30) return 'small-room'
  if (avgQs >= 15) return 'closet'
  return 'no-chamber'
}

/**
 * Classify chamber condition
 * @example
 * classifyChamberCondition(80) // 'magnificent-acoustics'
 */
export function classifyChamberCondition(avgQs: number): ChamberCondition {
  if (avgQs >= 75) return 'magnificent-acoustics'
  if (avgQs >= 60) return 'excellent-sound'
  if (avgQs >= 45) return 'decent-reverb'
  if (avgQs >= 30) return 'poor-acoustics'
  if (avgQs >= 15) return 'dead-space'
  return 'void'
}

/**
 * Classify acoustic grade
 * @example
 * classifyAcousticGrade(85) // 'maestro'
 */
export function classifyAcousticGrade(avgAcoustics: number): AcousticGrade {
  if (avgAcoustics >= 80) return 'maestro'
  if (avgAcoustics >= 65) return 'virtuoso'
  if (avgAcoustics >= 50) return 'musician'
  if (avgAcoustics >= 35) return 'apprentice'
  if (avgAcoustics >= 20) return 'novice'
  return 'tone-deaf'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(echoes, chambers, symphony, stats)
 */
export function generateRecommendations(
  echoes: ThunderEcho[],
  chambers: AcousticChamber[],
  symphony: SymphonySummary,
  stats: ThunderWellStats,
): string[] {
  const recs: string[] = []
  if (stats.avgResonanceDepth < 50) {
    recs.push('Deepen resonance with named exports, typed returns, and purposeful interfaces')
  }
  if (stats.avgEchoClarity < 50) {
    recs.push('Sharpen echo clarity with documented feedback, descriptive naming, and expressive patterns')
  }
  if (stats.avgReverberationQuality < 50) {
    recs.push('Improve reverberation quality with clean import/export chains and traceable async flows')
  }
  if (stats.avgSoundPropagation < 50) {
    recs.push('Enhance sound propagation with explicit communication, event-driven patterns, and decoupled generics')
  }
  if (stats.avgAcousticBalance < 50) {
    recs.push('Balance acoustics with even distribution, proportional complexity, and well-sized modules')
  }
  if (stats.ruinedCisternCount > 0) {
    recs.push(`${stats.ruinedCisternCount} file(s) are ruined cisterns — they need acoustic restoration`)
  }
  if (symphony.overallAcoustics < 40) {
    recs.push('Overall acoustics are poor — focus on resonance depth and echo clarity first')
  }
  const allDead = chambers.every(c => c.chamberType === 'no-chamber' || c.chamberType === 'closet')
  if (allDead && chambers.length > 0) {
    recs.push('All chambers are dead spaces — consider a major acoustic redesign')
  }
  const ruinedFiles = echoes.filter(e => e.condition === 'ruined-cistern').map(e => e.file)
  if (ruinedFiles.length > 0 && ruinedFiles.length <= 3) {
    recs.push(`Restore these ruined cisterns into thunder masterpieces: ${ruinedFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your thunder well resonates at maestro quality! Every echo rings with thunderous clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as thunder echo
 * @example
 * const e = analyzeThunderEcho(content, 'index.ts')
 * console.log(e.condition) // 'thunder-masterpiece'
 */
export function analyzeThunderEcho(content: string, filePath: string): ThunderEcho {
  const resonating = measureResonating(content)
  const echoing = measureEchoing(content)
  const reverberating = measureReverberating(content)
  const propagating = measurePropagating(content)
  const balancing = measureBalancing(content)

  const qualityScore = Math.round(
    resonating.depth * 0.2 +
    echoing.clarity * 0.2 +
    reverberating.quality * 0.2 +
    propagating.propagation * 0.2 +
    balancing.balance * 0.2,
  )

  return {
    file: filePath,
    resonanceDepth: resonating.depth,
    echoClarity: echoing.clarity,
    reverberationQuality: reverberating.quality,
    soundPropagation: propagating.propagation,
    acousticBalance: balancing.balance,
    resonating,
    echoing,
    reverberating,
    propagating,
    balancing,
    condition: classifyEchoCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as acoustic chamber
 * @example
 * const c = analyzeAcousticChamber(echoes, 'src')
 * console.log(c.chamberType) // 'grand-amphitheater'
 */
export function analyzeAcousticChamber(echoes: ThunderEcho[], dirPath: string): AcousticChamber {
  if (echoes.length === 0) {
    return {
      directory: dirPath, echoes: [], avgResonance: 0, avgClarity: 0, avgBalance: 0,
      thunderMasterpieceCount: 0, ruinedCisternCount: 0, chamberType: 'no-chamber', condition: 'void',
    }
  }

  const avgResonance = Math.round(echoes.reduce((s, e) => s + e.resonanceDepth, 0) / echoes.length)
  const avgClarity = Math.round(echoes.reduce((s, e) => s + e.echoClarity, 0) / echoes.length)
  const avgBalance = Math.round(echoes.reduce((s, e) => s + e.acousticBalance, 0) / echoes.length)
  const thunderMasterpieceCount = echoes.filter(e => e.condition === 'thunder-masterpiece').length
  const ruinedCisternCount = echoes.filter(e => e.condition === 'ruined-cistern').length
  const avgQs = Math.round(echoes.reduce((s, e) => s + e.qualityScore, 0) / echoes.length)

  return {
    directory: dirPath, echoes, avgResonance, avgClarity, avgBalance,
    thunderMasterpieceCount, ruinedCisternCount, chamberType: classifyChamberType(echoes),
    condition: classifyChamberCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete thunder well result
 * @example
 * const result = await buildThunderWellResult(files, contents)
 * console.log(result.stats.acousticGrade) // 'maestro'
 */
export async function buildThunderWellResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ThunderWellResult> {
  const echoes = files.map((file, i) => analyzeThunderEcho(contents[i] ?? '', file))

  const dirMap = new Map<string, ThunderEcho[]>()
  for (const echo of echoes) {
    const dir = path.dirname(echo.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(echo) } else { dirMap.set(dir, [echo]) }
  }

  const chambers = Array.from(dirMap.entries()).map(([dir, dirEchoes]) =>
    analyzeAcousticChamber(dirEchoes, dir),
  )

  const avgResonance = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.resonanceDepth, 0) / echoes.length) : 0
  const avgClarity = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.echoClarity, 0) / echoes.length) : 0
  const avgBalance = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.acousticBalance, 0) / echoes.length) : 0

  const overallAcoustics = echoes.length > 0
    ? Math.round((avgResonance + avgClarity + avgBalance) / 3) : 0
  const isHarmonious = avgResonance >= 60

  const symphony: SymphonySummary = { avgResonance, avgClarity, avgBalance, isHarmonious, overallAcoustics }

  const avgReverberationQuality = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.reverberationQuality, 0) / echoes.length) : 0
  const avgSoundPropagation = echoes.length > 0
    ? Math.round(echoes.reduce((s, e) => s + e.soundPropagation, 0) / echoes.length) : 0

  const bestEcho = echoes.length > 0
    ? echoes.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const mostResonant = echoes.length > 0
    ? echoes.reduce((best, e) => e.resonanceDepth > best.resonanceDepth ? e : best).file : ''
  const clearestEcho = echoes.length > 0
    ? echoes.reduce((best, e) => e.echoClarity > best.echoClarity ? e : best).file : ''
  const bestReverberation = echoes.length > 0
    ? echoes.reduce((best, e) => e.reverberationQuality > best.reverberationQuality ? e : best).file : ''
  const bestPropagation = echoes.length > 0
    ? echoes.reduce((best, e) => e.soundPropagation > best.soundPropagation ? e : best).file : ''

  const stats: ThunderWellStats = {
    totalFiles: echoes.length,
    totalChambers: chambers.length,
    avgResonanceDepth: avgResonance,
    avgEchoClarity: avgClarity,
    avgReverberationQuality,
    avgSoundPropagation,
    avgAcousticBalance: avgBalance,
    thunderMasterpieceCount: echoes.filter(e => e.condition === 'thunder-masterpiece').length,
    resonantChamberCount: echoes.filter(e => e.condition === 'resonant-chamber').length,
    properWellCount: echoes.filter(e => e.condition === 'proper-well').length,
    crackedBasinCount: echoes.filter(e => e.condition === 'cracked-basin').length,
    dryWellCount: echoes.filter(e => e.condition === 'dry-well').length,
    ruinedCisternCount: echoes.filter(e => e.condition === 'ruined-cistern').length,
    hasHighDepthCount: echoes.filter(e => e.resonating.hasHighDepth).length,
    hasHighClarityCount: echoes.filter(e => e.echoing.hasHighClarity).length,
    hasHighQualityCount: echoes.filter(e => e.reverberating.hasHighQuality).length,
    hasHighPropagationCount: echoes.filter(e => e.propagating.hasHighPropagation).length,
    hasHighBalanceCount: echoes.filter(e => e.balancing.hasHighBalance).length,
    overallAcoustics,
    acousticGrade: classifyAcousticGrade(overallAcoustics),
    bestEcho, mostResonant, clearestEcho, bestReverberation, bestPropagation,
  }

  const recommendations = generateRecommendations(echoes, chambers, symphony, stats)

  return { echoes, chambers, symphony, stats, recommendations }
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
