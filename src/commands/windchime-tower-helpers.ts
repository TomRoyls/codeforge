// ─── Interfaces ──────────────────────────────────────────

export interface ToneMeasure {
  quality: number
  pitch: 'perfect-pitch' | 'well-tuned' | 'harmonious' | 'slightly-off' | 'dissonant' | 'cacophony'
  hasHighQuality: boolean
  hasPureTone: boolean
  hasProperCalibration: boolean
  hasNoDissonance: boolean
  hasClearSignal: boolean
  hasNoNoise: boolean
  hasProperFrequency: boolean
  hasNoInterference: boolean
  hasCleanOutput: boolean
  hasNoDistortion: boolean
  dissonanceCount: number
  distortionCount: number
}

export interface ResonanceMeasure {
  level: number
  sustain: 'singing-bowl' | 'long-sustain' | 'medium-sustain' | 'short-ring' | 'dull-thud' | 'dead'
  hasHighLevel: boolean
  hasProperSustain: boolean
  hasWideReach: boolean
  hasNoDamping: boolean
  hasHarmonics: boolean
  hasNoCancellation: boolean
  hasProperAmplitude: boolean
  hasNoAttenuation: boolean
  hasReverberation: boolean
  hasNoAbsorption: boolean
  dampingCount: number
  absorptionCount: number
}

export interface WindMeasure {
  responsiveness: number
  sensitivity: 'gossamer' | 'highly-sensitive' | 'responsive' | 'moderate' | 'sluggish' | 'unresponsive'
  hasHighResponsiveness: boolean
  hasQuickResponse: boolean
  hasProperThreshold: boolean
  hasNoDeadZone: boolean
  hasAdaptive: boolean
  hasNoLag: boolean
  hasProperGain: boolean
  hasNoSaturation: boolean
  hasSensitive: boolean
  hasNoOverreaction: boolean
  deadZoneCount: number
  saturationCount: number
}

export interface HarmonyMeasure {
  level: number
  chord: 'major-chord' | 'perfect-harmony' | 'consonance' | 'neutral' | 'tension' | 'discord'
  hasHighLevel: boolean
  hasProperArrangement: boolean
  hasComplementary: boolean
  hasNoConflicting: boolean
  hasBalanced: boolean
  hasNoClashing: boolean
  hasProperIntervals: boolean
  hasNoDisruption: boolean
  hasFlowing: boolean
  hasNoJarring: boolean
  conflictCount: number
  clashCount: number
}

export interface AcousticMeasure {
  clarity: number
  fidelity: 'high-fidelity' | 'clear' | 'acceptable' | 'muddy' | 'garbled' | 'static'
  hasHighClarity: boolean
  hasCleanSignal: boolean
  hasProperDynamics: boolean
  hasNoMuddying: boolean
  hasTransparent: boolean
  hasNoObfuscation: boolean
  hasProperEqualization: boolean
  hasNoOverCompression: boolean
  hasNaturalSound: boolean
  hasNoArtifacts: boolean
  muddyingCount: number
  artifactCount: number
}

export interface ResilienceMeasure {
  level: number
  strength: 'titanium-chime' | 'bronze-bell' | 'brass-tube' | 'aluminum-rod' | 'bamboo' | 'glass-shard'
  hasHighLevel: boolean
  hasCorrosionResistant: boolean
  hasProperAnchoring: boolean
  hasNoFatigue: boolean
  hasWeatherProof: boolean
  hasNoBrittleness: boolean
  hasImpactResistant: boolean
  hasNoCracking: boolean
  hasUVStable: boolean
  hasNoDegradation: boolean
  fatigueCount: number
  crackingCount: number
}

export interface ChimeElement {
  file: string
  tonalQuality: number
  resonance: number
  windResponsiveness: number
  structuralHarmony: number
  acousticClarity: number
  chimeResilience: number
  tone: ToneMeasure
  resonanceData: ResonanceMeasure
  wind: WindMeasure
  harmony: HarmonyMeasure
  acoustic: AcousticMeasure
  resilience: ResilienceMeasure
  condition: 'celestial-chime' | 'masterwork-bell' | 'tuned-chime' | 'untuned-pipe' | 'rattling-tube' | 'silence'
  qualityScore: number
}

export interface TowerLevel {
  directory: string
  elements: ChimeElement[]
  avgTone: number
  avgHarmony: number
  avgResilience: number
  celestialCount: number
  silenceCount: number
  tunedCount: number
  harmoniousCount: number
  levelType: 'cathedral-tower' | 'bell-tower' | 'garden-pagoda' | 'porch-chime' | 'window-hanging' | 'silent'
  condition: 'symphony-hall' | 'harmonious-tower' | 'pleasant-garden' | 'clattering' | 'silence' | 'broken'
}

export interface WindchimeTowerResult {
  elements: ChimeElement[]
  levels: TowerLevel[]
  tower: {
    avgTone: number
    avgHarmony: number
    avgResilience: number
    isHarmonious: boolean
    overallHarmony: number
  }
  stats: {
    totalFiles: number
    totalLevels: number
    avgTonalQuality: number
    avgResonance: number
    avgWindResponsiveness: number
    avgStructuralHarmony: number
    avgAcousticClarity: number
    avgChimeResilience: number
    celestialChimeCount: number
    masterworkBellCount: number
    tunedChimeCount: number
    untunedPipeCount: number
    rattlingTubeCount: number
    silenceCount: number
    hasHighToneCount: number
    hasHighResonanceCount: number
    hasHighResponsivenessCount: number
    hasHighHarmonyCount: number
    hasHighClarityCount: number
    hasHighResilienceCount: number
    overallHarmony: number
    tunerGrade: 'master-tuner' | 'harmonist' | 'musician' | 'tuner' | 'listener' | 'tone-deaf'
    bestElement: string
    bestTone: string
    mostResonant: string
    mostResponsive: string
    mostHarmonious: string
    clearest: string
  }
  recommendations: string[]
}

// ─── Regex Patterns (no g flag on .test()-only regexes) ──────

const INTERFACE_RE = /\binterface\b/
const CLASS_RE = /\bclass\b/
const TYPE_RE = /\btype\b/
const EXPORT_RE = /\bexport\b/
const IMPORT_RE = /\bimport\b/
const FUNCTION_RE = /\bfunction\b/
const ARROW_RE = /=>/
const ASYNC_RE = /\basync\b/
const AWAIT_RE = /\bawait\b/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
const RETURN_RE = /\breturn\b/
const THROW_RE = /\bthrow\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureTone ──────────────────────────────────────────

/** @example measureTone(content) returns ToneMeasure */
export function measureTone(content: string): ToneMeasure {
  let score = 0

  const hasPureTone = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperCalibration = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const dissonanceCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDissonance = dissonanceCount === 0
  const hasClearSignal = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasNoNoise = (content.match(HACK_RE) || []).length === 0
  const hasProperFrequency = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoInterference = !NESTED_TERNARY_RE.test(content)
  const hasCleanOutput = RETURN_RE.test(content)
  const distortionCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoDistortion = distortionCount === 0

  if (content.length > 0) score += 5
  if (hasPureTone) score += 12
  if (hasProperCalibration) score += 10
  if (hasNoDissonance) score += 12
  if (hasClearSignal) score += 10
  if (hasNoNoise) score += 10
  if (hasProperFrequency) score += 10
  if (hasNoInterference) score += 10
  if (hasCleanOutput) score += 11
  if (hasNoDistortion) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let pitch: ToneMeasure['pitch'] = 'cacophony'
  if (hasHighQuality && hasNoDissonance && hasPureTone && hasCleanOutput) pitch = 'perfect-pitch'
  else if (hasHighQuality && hasNoDissonance) pitch = 'well-tuned'
  else if (hasHighQuality) pitch = 'harmonious'
  else if (hasPureTone && hasProperCalibration) pitch = 'slightly-off'
  else if (quality > 30) pitch = 'dissonant'

  return {
    quality, pitch, hasHighQuality, hasPureTone, hasProperCalibration,
    hasNoDissonance, hasClearSignal, hasNoNoise, hasProperFrequency,
    hasNoInterference, hasCleanOutput, hasNoDistortion, dissonanceCount, distortionCount,
  }
}

// ─── measureResonance ─────────────────────────────────────

/** @example measureResonance(content) returns ResonanceMeasure */
export function measureResonance(content: string): ResonanceMeasure {
  let score = 0

  const hasProperSustain = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasWideReach = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const dampingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDamping = dampingCount === 0
  const hasHarmonics = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const absorptionCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoAbsorption = absorptionCount === 0
  const hasProperAmplitude = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoAttenuation = !NESTED_TERNARY_RE.test(content)
  const hasReverberation = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasNoCancellation = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperSustain) score += 12
  if (hasWideReach) score += 10
  if (hasNoDamping) score += 12
  if (hasHarmonics) score += 10
  if (hasNoAbsorption) score += 11
  if (hasProperAmplitude) score += 10
  if (hasNoAttenuation) score += 10
  if (hasReverberation) score += 10
  if (hasNoCancellation) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let sustain: ResonanceMeasure['sustain'] = 'dead'
  if (hasHighLevel && hasNoDamping && hasProperSustain && hasProperAmplitude) sustain = 'singing-bowl'
  else if (hasHighLevel && hasNoDamping) sustain = 'long-sustain'
  else if (hasHighLevel) sustain = 'medium-sustain'
  else if (hasProperSustain && hasWideReach) sustain = 'short-ring'
  else if (level > 30) sustain = 'dull-thud'

  return {
    level, sustain, hasHighLevel, hasProperSustain, hasWideReach,
    hasNoDamping, hasHarmonics, hasNoCancellation, hasProperAmplitude,
    hasNoAttenuation, hasReverberation, hasNoAbsorption, dampingCount, absorptionCount,
  }
}

// ─── measureWind ──────────────────────────────────────────

/** @example measureWind(content) returns WindMeasure */
export function measureWind(content: string): WindMeasure {
  let score = 0

  const hasQuickResponse = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasProperThreshold = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const deadZoneCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDeadZone = deadZoneCount === 0
  const hasAdaptive = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoLag = !NESTED_TERNARY_RE.test(content)
  const hasProperGain = EXPORT_RE.test(content) && (INTERFACE_RE.test(content) || TYPE_RE.test(content))
  const saturationCount = (content.match(CONSOLE_RE) || []).length
  const hasNoSaturation = saturationCount === 0
  const hasSensitive = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoOverreaction = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasQuickResponse) score += 12
  if (hasProperThreshold) score += 10
  if (hasNoDeadZone) score += 12
  if (hasAdaptive) score += 10
  if (hasNoLag) score += 10
  if (hasProperGain) score += 11
  if (hasNoSaturation) score += 10
  if (hasSensitive) score += 10
  if (hasNoOverreaction) score += 10

  const responsiveness = Math.min(100, Math.max(0, score))
  const hasHighResponsiveness = responsiveness >= 70

  let sensitivity: WindMeasure['sensitivity'] = 'unresponsive'
  if (hasHighResponsiveness && hasNoDeadZone && hasQuickResponse && hasSensitive) sensitivity = 'gossamer'
  else if (hasHighResponsiveness && hasNoDeadZone) sensitivity = 'highly-sensitive'
  else if (hasHighResponsiveness) sensitivity = 'responsive'
  else if (hasProperThreshold && hasAdaptive) sensitivity = 'moderate'
  else if (responsiveness > 30) sensitivity = 'sluggish'

  return {
    responsiveness, sensitivity, hasHighResponsiveness, hasQuickResponse,
    hasProperThreshold, hasNoDeadZone, hasAdaptive, hasNoLag, hasProperGain,
    hasNoSaturation, hasSensitive, hasNoOverreaction, deadZoneCount, saturationCount,
  }
}

// ─── measureHarmony ───────────────────────────────────────

/** @example measureHarmony(content) returns HarmonyMeasure */
export function measureHarmony(content: string): HarmonyMeasure {
  let score = 0

  const hasProperArrangement = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasComplementary = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const conflictCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoConflicting = conflictCount === 0
  const hasBalanced = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const clashCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoClashing = clashCount === 0
  const hasProperIntervals = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDisruption = !NESTED_TERNARY_RE.test(content)
  const hasFlowing = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoJarring = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperArrangement) score += 12
  if (hasComplementary) score += 10
  if (hasNoConflicting) score += 12
  if (hasBalanced) score += 10
  if (hasNoClashing) score += 10
  if (hasProperIntervals) score += 11
  if (hasNoDisruption) score += 10
  if (hasFlowing) score += 10
  if (hasNoJarring) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let chord: HarmonyMeasure['chord'] = 'discord'
  if (hasHighLevel && hasNoConflicting && hasProperArrangement && hasProperIntervals) chord = 'major-chord'
  else if (hasHighLevel && hasNoConflicting) chord = 'perfect-harmony'
  else if (hasHighLevel) chord = 'consonance'
  else if (hasProperArrangement && hasComplementary) chord = 'neutral'
  else if (level > 30) chord = 'tension'

  return {
    level, chord, hasHighLevel, hasProperArrangement, hasComplementary,
    hasNoConflicting, hasBalanced, hasNoClashing, hasProperIntervals,
    hasNoDisruption, hasFlowing, hasNoJarring, conflictCount, clashCount,
  }
}

// ─── measureAcoustic ─────────────────────────────────────

/** @example measureAcoustic(content) returns AcousticMeasure */
export function measureAcoustic(content: string): AcousticMeasure {
  let score = 0

  const hasCleanSignal = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasProperDynamics = TRY_RE.test(content) && CATCH_RE.test(content)
  const muddyingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoMuddying = muddyingCount === 0
  const hasTransparent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoObfuscation = !NESTED_TERNARY_RE.test(content)
  const hasProperEqualization = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoOverCompression = (content.match(CONSOLE_RE) || []).length === 0
  const hasNaturalSound = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const artifactCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoArtifacts = artifactCount === 0

  if (content.length > 0) score += 5
  if (hasCleanSignal) score += 12
  if (hasProperDynamics) score += 10
  if (hasNoMuddying) score += 12
  if (hasTransparent) score += 10
  if (hasNoObfuscation) score += 10
  if (hasProperEqualization) score += 11
  if (hasNoOverCompression) score += 10
  if (hasNaturalSound) score += 10
  if (hasNoArtifacts) score += 10

  const clarity = Math.min(100, Math.max(0, score))
  const hasHighClarity = clarity >= 70

  let fidelity: AcousticMeasure['fidelity'] = 'static'
  if (hasHighClarity && hasNoMuddying && hasCleanSignal && hasTransparent) fidelity = 'high-fidelity'
  else if (hasHighClarity && hasNoMuddying) fidelity = 'clear'
  else if (hasHighClarity) fidelity = 'acceptable'
  else if (hasCleanSignal && hasProperDynamics) fidelity = 'muddy'
  else if (clarity > 30) fidelity = 'garbled'

  return {
    clarity, fidelity, hasHighClarity, hasCleanSignal, hasProperDynamics,
    hasNoMuddying, hasTransparent, hasNoObfuscation, hasProperEqualization,
    hasNoOverCompression, hasNaturalSound, hasNoArtifacts, muddyingCount, artifactCount,
  }
}

// ─── measureResilience ────────────────────────────────────

/** @example measureResilience(content) returns ResilienceMeasure */
export function measureResilience(content: string): ResilienceMeasure {
  let score = 0

  const hasCorrosionResistant = (content.match(ANY_RE) || []).length === 0 && (content.match(EVAL_RE) || []).length === 0
  const hasProperAnchoring = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const fatigueCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoFatigue = fatigueCount === 0
  const hasWeatherProof = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoBrittleness = !NESTED_TERNARY_RE.test(content)
  const hasImpactResistant = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const crackingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoCracking = crackingCount === 0
  const hasUVStable = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDegradation = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasCorrosionResistant) score += 12
  if (hasProperAnchoring) score += 10
  if (hasNoFatigue) score += 10
  if (hasWeatherProof) score += 12
  if (hasNoBrittleness) score += 10
  if (hasImpactResistant) score += 10
  if (hasNoCracking) score += 11
  if (hasUVStable) score += 10
  if (hasNoDegradation) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let strength: ResilienceMeasure['strength'] = 'glass-shard'
  if (hasHighLevel && hasCorrosionResistant && hasWeatherProof && hasUVStable) strength = 'titanium-chime'
  else if (hasHighLevel && hasCorrosionResistant) strength = 'bronze-bell'
  else if (hasHighLevel) strength = 'brass-tube'
  else if (hasProperAnchoring && hasImpactResistant) strength = 'aluminum-rod'
  else if (level > 30) strength = 'bamboo'

  return {
    level, strength, hasHighLevel, hasCorrosionResistant, hasProperAnchoring,
    hasNoFatigue, hasWeatherProof, hasNoBrittleness, hasImpactResistant,
    hasNoCracking, hasUVStable, hasNoDegradation, fatigueCount, crackingCount,
  }
}

// ─── classifyCondition ────────────────────────────────────

/** @example classifyCondition(element) returns condition */
export function classifyCondition(element: ChimeElement): ChimeElement['condition'] {
  const { qualityScore } = element
  if (qualityScore >= 80) return 'celestial-chime'
  if (qualityScore >= 65) return 'masterwork-bell'
  if (qualityScore >= 50) return 'tuned-chime'
  if (qualityScore >= 35) return 'untuned-pipe'
  if (qualityScore >= 20) return 'rattling-tube'
  return 'silence'
}

// ─── analyzeChimeElement ──────────────────────────────────

/** @example analyzeChimeElement(content, filePath) returns full element */
export function analyzeChimeElement(content: string, filePath: string): ChimeElement {
  const tone = measureTone(content)
  const resonanceData = measureResonance(content)
  const wind = measureWind(content)
  const harmony = measureHarmony(content)
  const acoustic = measureAcoustic(content)
  const resilience = measureResilience(content)

  const tonalQuality = tone.quality
  const resonance = resonanceData.level
  const windResponsiveness = wind.responsiveness
  const structuralHarmony = harmony.level
  const acousticClarity = acoustic.clarity
  const chimeResilience = resilience.level

  const qualityScore = Math.round(
    tonalQuality * 0.2 +
    resonance * 0.15 +
    windResponsiveness * 0.15 +
    structuralHarmony * 0.2 +
    acousticClarity * 0.15 +
    chimeResilience * 0.15,
  )

  const result: ChimeElement = {
    file: filePath,
    tonalQuality, resonance, windResponsiveness,
    structuralHarmony, acousticClarity, chimeResilience,
    tone, resonanceData, wind, harmony, acoustic, resilience,
    qualityScore,
    condition: 'silence',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyLevelType ────────────────────────────────────

/** @example classifyLevelType(elements) returns level type */
export function classifyLevelType(elements: ChimeElement[]): TowerLevel['levelType'] {
  if (elements.length === 0) return 'silent'
  const avgScore = elements.reduce((s, e) => s + e.qualityScore, 0) / elements.length
  const celestialCnt = elements.filter((e) => e.condition === 'celestial-chime').length
  if (avgScore >= 75 && celestialCnt >= Math.ceil(elements.length * 0.3)) return 'cathedral-tower'
  if (avgScore >= 60) return 'bell-tower'
  if (avgScore >= 45) return 'garden-pagoda'
  if (avgScore >= 30) return 'porch-chime'
  if (avgScore >= 15) return 'window-hanging'
  return 'silent'
}

// ─── analyzeTowerLevel ────────────────────────────────────

/** @example analyzeTowerLevel(elements, dirPath) returns TowerLevel */
export function analyzeTowerLevel(elements: ChimeElement[], dirPath: string): TowerLevel {
  if (elements.length === 0) {
    return {
      directory: dirPath, elements: [], avgTone: 0, avgHarmony: 0,
      avgResilience: 0, celestialCount: 0, silenceCount: 0,
      tunedCount: 0, harmoniousCount: 0,
      levelType: 'silent', condition: 'silence',
    }
  }

  const avgTone = Math.round(elements.reduce((s, e) => s + e.tonalQuality, 0) / elements.length)
  const avgHarmony = Math.round(elements.reduce((s, e) => s + e.structuralHarmony, 0) / elements.length)
  const avgResilience = Math.round(elements.reduce((s, e) => s + e.chimeResilience, 0) / elements.length)
  const celestialCount = elements.filter((e) => e.condition === 'celestial-chime').length
  const silenceCount = elements.filter((e) => e.condition === 'silence').length
  const tunedCount = elements.filter((e) => e.condition === 'tuned-chime').length
  const harmoniousCount = elements.filter((e) => e.harmony.hasHighLevel).length

  const levelType = classifyLevelType(elements)
  const avgScore = elements.reduce((s, e) => s + e.qualityScore, 0) / elements.length
  let condition: TowerLevel['condition'] = 'silence'
  if (avgScore >= 75) condition = 'symphony-hall'
  else if (avgScore >= 60) condition = 'harmonious-tower'
  else if (avgScore >= 45) condition = 'pleasant-garden'
  else if (avgScore >= 30) condition = 'clattering'
  else if (avgScore >= 15) condition = 'silence'

  return {
    directory: dirPath, elements, avgTone, avgHarmony, avgResilience,
    celestialCount, silenceCount, tunedCount, harmoniousCount,
    levelType, condition,
  }
}

// ─── classifyTunerGrade ───────────────────────────────────

/** @example classifyTunerGrade(avgHarmony) returns tuner grade */
export function classifyTunerGrade(avgHarmony: number): WindchimeTowerResult['stats']['tunerGrade'] {
  if (avgHarmony >= 80) return 'master-tuner'
  if (avgHarmony >= 65) return 'harmonist'
  if (avgHarmony >= 50) return 'musician'
  if (avgHarmony >= 35) return 'tuner'
  if (avgHarmony >= 20) return 'listener'
  return 'tone-deaf'
}

// ─── generateRecommendations ──────────────────────────────

/** @example generateRecommendations(elements, levels, tower, stats) returns string[] */
export function generateRecommendations(
  elements: ChimeElement[],
  levels: TowerLevel[],
  tower: WindchimeTowerResult['tower'],
  stats: WindchimeTowerResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgTonalQuality < 50) recs.push('Improve tonal quality — add interfaces and types for pure code tone')
  if (stats.avgResonance < 50) recs.push('Boost resonance — add error handling for longer code sustain')
  if (stats.avgWindResponsiveness < 50) recs.push('Enhance wind responsiveness — add async/await for reactive code')
  if (stats.avgStructuralHarmony < 50) recs.push('Improve structural harmony — organize code with proper import/export balance')
  if (stats.avgAcousticClarity < 50) recs.push('Clear acoustic clarity — remove console statements and any types')
  if (stats.avgChimeResilience < 50) recs.push('Strengthen chime resilience — add error handling and type safety')
  if (stats.silenceCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of chimes are silent — consider major refactoring')
  if (stats.rattlingTubeCount > 0) recs.push('Warning: rattling tubes detected — these files need tuning')
  if (tower.overallHarmony < 40) recs.push('Overall harmony is critically low — establish a windchime recovery plan')
  if (levels.length > 0 && levels.every((l) => l.condition === 'silence')) recs.push('All levels are silent — your codebase needs fundamental chime activation')

  if (elements.length > 0) {
    const highDissonance = elements.filter((e) => e.tone.dissonanceCount > 2)
    if (highDissonance.length > elements.length * 0.5) recs.push('Over 50% of chimes have high dissonance — reduce any/eval usage')
  }

  return recs
}

// ─── buildWindchimeTowerResult ────────────────────────────

/** @example buildWindchimeTowerResult(files, contents) returns full result */
export function buildWindchimeTowerResult(files: string[], contents: string[]): WindchimeTowerResult {
  const elements = files.map((file, i) => analyzeChimeElement(contents[i] ?? '', file))

  const levelMap = new Map<string, ChimeElement[]>()
  elements.forEach((element) => {
    const parts = element.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = levelMap.get(dir)
    if (existing) existing.push(element)
    else levelMap.set(dir, [element])
  })

  const levels = Array.from(levelMap.entries()).map(([dir, elems]) => analyzeTowerLevel(elems, dir))

  const avgTonalQuality = elements.length > 0 ? Math.round(elements.reduce((s, e) => s + e.tonalQuality, 0) / elements.length) : 0
  const avgResonanceVal = elements.length > 0 ? Math.round(elements.reduce((s, e) => s + e.resonance, 0) / elements.length) : 0
  const avgWindResponsiveness = elements.length > 0 ? Math.round(elements.reduce((s, e) => s + e.windResponsiveness, 0) / elements.length) : 0
  const avgStructuralHarmony = elements.length > 0 ? Math.round(elements.reduce((s, e) => s + e.structuralHarmony, 0) / elements.length) : 0
  const avgAcousticClarity = elements.length > 0 ? Math.round(elements.reduce((s, e) => s + e.acousticClarity, 0) / elements.length) : 0
  const avgChimeResilience = elements.length > 0 ? Math.round(elements.reduce((s, e) => s + e.chimeResilience, 0) / elements.length) : 0

  const overallHarmony = Math.round(
    avgTonalQuality * 0.2 +
    avgResonanceVal * 0.15 +
    avgWindResponsiveness * 0.15 +
    avgStructuralHarmony * 0.2 +
    avgAcousticClarity * 0.15 +
    avgChimeResilience * 0.15,
  )

  const tower = {
    avgTone: avgTonalQuality,
    avgHarmony: avgStructuralHarmony,
    avgResilience: avgChimeResilience,
    isHarmonious: overallHarmony >= 60,
    overallHarmony,
  }

  const stats = {
    totalFiles: files.length,
    totalLevels: levels.length,
    avgTonalQuality,
    avgResonance: avgResonanceVal,
    avgWindResponsiveness,
    avgStructuralHarmony,
    avgAcousticClarity,
    avgChimeResilience,
    celestialChimeCount: elements.filter((e) => e.condition === 'celestial-chime').length,
    masterworkBellCount: elements.filter((e) => e.condition === 'masterwork-bell').length,
    tunedChimeCount: elements.filter((e) => e.condition === 'tuned-chime').length,
    untunedPipeCount: elements.filter((e) => e.condition === 'untuned-pipe').length,
    rattlingTubeCount: elements.filter((e) => e.condition === 'rattling-tube').length,
    silenceCount: elements.filter((e) => e.condition === 'silence').length,
    hasHighToneCount: elements.filter((e) => e.tone.hasHighQuality).length,
    hasHighResonanceCount: elements.filter((e) => e.resonanceData.hasHighLevel).length,
    hasHighResponsivenessCount: elements.filter((e) => e.wind.hasHighResponsiveness).length,
    hasHighHarmonyCount: elements.filter((e) => e.harmony.hasHighLevel).length,
    hasHighClarityCount: elements.filter((e) => e.acoustic.hasHighClarity).length,
    hasHighResilienceCount: elements.filter((e) => e.resilience.hasHighLevel).length,
    overallHarmony,
    tunerGrade: classifyTunerGrade(overallHarmony),
    bestElement: '',
    bestTone: '',
    mostResonant: '',
    mostResponsive: '',
    mostHarmonious: '',
    clearest: '',
  }

  if (elements.length > 0) {
    stats.bestElement = elements.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestTone = elements.reduce((a, b) => a.tonalQuality >= b.tonalQuality ? a : b).file
    stats.mostResonant = elements.reduce((a, b) => a.resonance >= b.resonance ? a : b).file
    stats.mostResponsive = elements.reduce((a, b) => a.windResponsiveness >= b.windResponsiveness ? a : b).file
    stats.mostHarmonious = elements.reduce((a, b) => a.structuralHarmony >= b.structuralHarmony ? a : b).file
    stats.clearest = elements.reduce((a, b) => a.acousticClarity >= b.acousticClarity ? a : b).file
  }

  const recommendations = generateRecommendations(elements, levels, tower, stats)

  return { elements, levels, tower, stats, recommendations }
}
