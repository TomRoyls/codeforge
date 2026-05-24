// ─── Types ─────────────────────────────────────────────────────────────────

export interface ResonatingMeasure {
  purity: number
  grade: 'pure-tone' | 'clear-harmonic' | 'clean-note' | 'muffled-sound' | 'distorted-noise' | 'cacophony'
  hasHighPurity: boolean
  hasClear: boolean
  hasResonant: boolean
  hasNoDissonance: boolean
  hasPure: boolean
  hasNoClutter: boolean
  hasHarmonic: boolean
  hasNoMud: boolean
  hasClean: boolean
  hasNoNoise: boolean
  hasBalanced: boolean
  dissonanceCount: number
  clutterCount: number
}

export interface HarmonicMeasure {
  resonance: number
  chord: 'perfect-chord' | 'major-triad' | 'minor-triad' | 'power-chord' | 'broken-chord' | 'discord'
  hasHighResonance: boolean
  hasInTune: boolean
  hasHarmonious: boolean
  hasNoClash: boolean
  hasResonant: boolean
  hasNoBeatFrequency: boolean
  hasComplementary: boolean
  hasNoInterference: boolean
  hasSympathetic: boolean
  hasNoDestructive: boolean
  hasPhaseAligned: boolean
  clashCount: number
  interferenceCount: number
}

export interface OvertoneMeasure {
  richness: number
  series: 'full-harmonic-series' | 'rich-overtones' | 'proper-overtones' | 'thin-tone' | 'flat-note' | 'dead-tone'
  hasHighRichness: boolean
  hasDeep: boolean
  hasLayered: boolean
  hasNoFlatness: boolean
  hasComplex: boolean
  hasNoShallow: boolean
  hasMultidimensional: boolean
  hasNoOneDimensional: boolean
  hasRich: boolean
  hasNoBarren: boolean
  hasTextured: boolean
  flatnessCount: number
  shallowCount: number
}

export interface WaveformMeasure {
  clarity: number
  shape: 'perfect-sine' | 'clean-wave' | 'proper-waveform' | 'distorted-wave' | 'noisy-signal' | 'static'
  hasHighClarity: boolean
  hasSmooth: boolean
  hasNoJagged: boolean
  hasClean: boolean
  hasNoArtifact: boolean
  hasDefined: boolean
  hasNoBlur: boolean
  hasCrisp: boolean
  hasNoRing: boolean
  hasPrecise: boolean
  hasNoOvershoot: boolean
  artifactCount: number
  blurCount: number
}

export interface FrequencyMeasure {
  distribution: number
  spectrum: 'full-spectrum' | 'wide-band' | 'proper-band' | 'narrow-band' | 'single-tone' | 'white-noise'
  hasHighDistribution: boolean
  hasDiverse: boolean
  hasNoMonotone: boolean
  hasVaried: boolean
  hasNoRepetitive: boolean
  hasRich: boolean
  hasNoHomogeneous: boolean
  hasColorful: boolean
  hasNoGray: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  monotoneCount: number
  repetitiveCount: number
}

export type WaveCondition = 'pure-resonance' | 'harmonic-balance' | 'clean-tone' | 'muffled-sound' | 'distorted' | 'noise-floor'

export interface SpectralWave {
  file: string
  spectralPurity: number
  harmonicResonance: number
  overtoneRichness: number
  waveformClarity: number
  frequencyDistribution: number
  resonating: ResonatingMeasure
  harmonic: HarmonicMeasure
  overtone: OvertoneMeasure
  waveform: WaveformMeasure
  frequency: FrequencyMeasure
  condition: WaveCondition
  qualityScore: number
}

export type ChamberType = 'concert-hall' | 'studio-room' | 'practice-room' | 'garage-space' | 'closet-booth' | 'anechoic'
export type ChamberCondition = 'perfect-acoustics' | 'great-sound' | 'good-room' | 'dead-room' | 'echo-chamber' | 'reverberant'

export interface ResonanceChamber {
  directory: string
  waves: SpectralWave[]
  avgPurity: number
  avgResonance: number
  avgClarity: number
  pureResonanceCount: number
  noiseFloorCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

export interface Spectrum {
  avgPurity: number
  avgResonance: number
  avgClarity: number
  isHarmonious: boolean
  overallHarmonicity: number
}

export type ConductorGrade = 'maestro' | 'virtuoso' | 'concert-master' | 'section-player' | 'student-musician' | 'tone-deaf'

export interface SpectralHarmonicsStats {
  totalFiles: number
  totalChambers: number
  avgSpectralPurity: number
  avgHarmonicResonance: number
  avgOvertoneRichness: number
  avgWaveformClarity: number
  avgFrequencyDistribution: number
  pureResonanceCount: number
  harmonicBalanceCount: number
  cleanToneCount: number
  muffledSoundCount: number
  distortedCount: number
  noiseFloorCount: number
  hasHighPurityCount: number
  hasHighResonanceCount: number
  hasHighRichnessCount: number
  hasHighClarityCount: number
  hasHighDistributionCount: number
  overallHarmonicity: number
  conductorGrade: ConductorGrade
  bestWave: string
  purest: string
  mostResonant: string
  richest: string
  clearest: string
}

export interface SpectralHarmonicsResult {
  waves: SpectralWave[]
  chambers: ResonanceChamber[]
  spectrum: Spectrum
  stats: SpectralHarmonicsStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureResonating(content) evaluates code spectral purity */
export function measureResonating(content: string): ResonatingMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const dissonanceMatches = content.match(/\bvar\s+/g)
  const dissonanceCount = dissonanceMatches ? dissonanceMatches.length : 0
  const clutterMatches = content.match(/\bany\b/g)
  const clutterCount = clutterMatches ? clutterMatches.length : 0

  const hasClear = hasReturnType && hasConst
  const hasResonant = hasExport && hasInterface
  const hasPure = hasStrictEquality && hasConst
  const hasHarmonic = hasAsync && hasTryCatch
  const hasClean = hasOptionalChaining && hasGenerics
  const hasBalanced = hasExport && hasReadonly

  let purity = 0
  if (hasExport) purity += 10
  if (hasConst) purity += 10
  if (hasReturnType) purity += 10
  if (hasInterface) purity += 8
  if (hasStrictEquality) purity += 8
  if (hasAsync) purity += 8
  if (hasTryCatch) purity += 8
  if (hasOptionalChaining) purity += 8
  if (hasGenerics) purity += 8
  if (hasReadonly) purity += 8
  if (hasClear) purity += 5
  if (hasResonant) purity += 5
  if (hasPure) purity += 5
  if (hasHarmonic) purity += 5
  if (hasClean) purity += 5

  purity = Math.min(100, Math.round(purity))

  let grade: ResonatingMeasure['grade'] = 'cacophony'
  if (purity >= 85) grade = 'pure-tone'
  else if (purity >= 70) grade = 'clear-harmonic'
  else if (purity >= 55) grade = 'clean-note'
  else if (purity >= 40) grade = 'muffled-sound'
  else if (purity >= 25) grade = 'distorted-noise'

  return {
    purity, grade,
    hasHighPurity: purity >= 70,
    hasClear, hasResonant, hasNoDissonance: dissonanceCount === 0,
    hasPure, hasNoClutter: clutterCount === 0,
    hasHarmonic, hasNoMud: dissonanceCount === 0 && clutterCount === 0,
    hasClean, hasNoNoise: dissonanceCount === 0,
    hasBalanced,
    dissonanceCount, clutterCount,
  }
}

/** @example measureHarmonic(content) evaluates code harmonic resonance */
export function measureHarmonic(content: string): HarmonicMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const clashMatches = content.match(/\bvar\s+/g)
  const clashCount = clashMatches ? clashMatches.length : 0
  const interferenceMatches = content.match(/\bany\b/g)
  const interferenceCount = interferenceMatches ? interferenceMatches.length : 0

  const hasInTune = hasExport && hasImport
  const hasHarmonious = hasReturnType && hasConst
  const hasResonant = hasInterface && hasClass
  const hasComplementary = hasPrivate && hasReadonly
  const hasSympathetic = hasNamedExport && hasDocComments
  const hasPhaseAligned = hasExport && hasConst

  let resonance = 0
  if (hasExport) resonance += 10
  if (hasImport) resonance += 10
  if (hasInterface) resonance += 8
  if (hasClass) resonance += 8
  if (hasReturnType) resonance += 10
  if (hasConst) resonance += 8
  if (hasPrivate) resonance += 8
  if (hasReadonly) resonance += 8
  if (hasDocComments) resonance += 8
  if (hasNamedExport) resonance += 8
  if (hasInTune) resonance += 5
  if (hasHarmonious) resonance += 5
  if (hasResonant) resonance += 5
  if (hasComplementary) resonance += 5
  if (hasSympathetic) resonance += 5

  resonance = Math.min(100, Math.round(resonance))

  let chord: HarmonicMeasure['chord'] = 'discord'
  if (resonance >= 85) chord = 'perfect-chord'
  else if (resonance >= 70) chord = 'major-triad'
  else if (resonance >= 55) chord = 'minor-triad'
  else if (resonance >= 40) chord = 'power-chord'
  else if (resonance >= 25) chord = 'broken-chord'

  return {
    resonance, chord,
    hasHighResonance: resonance >= 70,
    hasInTune, hasHarmonious, hasNoClash: clashCount === 0,
    hasResonant, hasNoBeatFrequency: interferenceCount === 0,
    hasComplementary, hasNoInterference: clashCount === 0 && interferenceCount === 0,
    hasSympathetic, hasNoDestructive: clashCount === 0,
    hasPhaseAligned,
    clashCount, interferenceCount,
  }
}

/** @example measureOvertone(content) evaluates code overtone richness */
export function measureOvertone(content: string): OvertoneMeasure {
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasExport = /export\s/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const flatnessMatches = content.match(/\bvar\s+/g)
  const flatnessCount = flatnessMatches ? flatnessMatches.length : 0
  const shallowMatches = content.match(/\bany\b/g)
  const shallowCount = shallowMatches ? shallowMatches.length : 0

  const hasDeep = hasGenerics && hasTypeAlias
  const hasLayered = hasInterface && hasPrivate
  const hasComplex = hasOptionalChaining && hasNullishCoalescing
  const hasMultidimensional = hasAsync && hasGenerics
  const hasRich = hasExport && hasDocComments
  const hasTextured = hasReadonly && hasGenerics

  let richness = 0
  if (hasGenerics) richness += 10
  if (hasTypeAlias) richness += 8
  if (hasInterface) richness += 10
  if (hasPrivate) richness += 8
  if (hasReadonly) richness += 8
  if (hasOptionalChaining) richness += 10
  if (hasNullishCoalescing) richness += 8
  if (hasAsync) richness += 8
  if (hasExport) richness += 8
  if (hasDocComments) richness += 8
  if (hasDeep) richness += 5
  if (hasLayered) richness += 5
  if (hasComplex) richness += 5
  if (hasMultidimensional) richness += 5
  if (hasRich) richness += 5

  richness = Math.min(100, Math.round(richness))

  let series: OvertoneMeasure['series'] = 'dead-tone'
  if (richness >= 85) series = 'full-harmonic-series'
  else if (richness >= 70) series = 'rich-overtones'
  else if (richness >= 55) series = 'proper-overtones'
  else if (richness >= 40) series = 'thin-tone'
  else if (richness >= 25) series = 'flat-note'

  return {
    richness, series,
    hasHighRichness: richness >= 70,
    hasDeep, hasLayered, hasNoFlatness: flatnessCount === 0,
    hasComplex, hasNoShallow: shallowCount === 0,
    hasMultidimensional, hasNoOneDimensional: flatnessCount === 0 && shallowCount === 0,
    hasRich, hasNoBarren: flatnessCount === 0,
    hasTextured,
    flatnessCount, shallowCount,
  }
}

/** @example measureWaveform(content) evaluates code waveform clarity */
export function measureWaveform(content: string): WaveformMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const artifactMatches = content.match(/\bvar\s+/g)
  const artifactCount = artifactMatches ? artifactMatches.length : 0
  const blurMatches = content.match(/\bany\b/g)
  const blurCount = blurMatches ? blurMatches.length : 0

  const hasSmooth = hasStrictEquality && hasConst
  const hasClean = hasOptionalChaining && hasDefaultParam
  const hasDefined = hasInterface && hasTypeAlias
  const hasCrisp = hasExport && hasReturnType
  const hasPrecise = hasNamedExport && hasTypeAnnotation

  let clarity = 0
  if (hasExport) clarity += 8
  if (hasConst) clarity += 10
  if (hasReturnType) clarity += 10
  if (hasStrictEquality) clarity += 10
  if (hasOptionalChaining) clarity += 8
  if (hasDefaultParam) clarity += 8
  if (hasInterface) clarity += 8
  if (hasTypeAlias) clarity += 8
  if (hasNamedExport) clarity += 8
  if (hasTypeAnnotation) clarity += 8
  if (hasSmooth) clarity += 5
  if (hasClean) clarity += 5
  if (hasDefined) clarity += 5
  if (hasCrisp) clarity += 5
  if (hasPrecise) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let shape: WaveformMeasure['shape'] = 'static'
  if (clarity >= 85) shape = 'perfect-sine'
  else if (clarity >= 70) shape = 'clean-wave'
  else if (clarity >= 55) shape = 'proper-waveform'
  else if (clarity >= 40) shape = 'distorted-wave'
  else if (clarity >= 25) shape = 'noisy-signal'

  return {
    clarity, shape,
    hasHighClarity: clarity >= 70,
    hasSmooth, hasNoJagged: artifactCount === 0,
    hasClean, hasNoArtifact: artifactCount === 0,
    hasDefined, hasNoBlur: blurCount === 0,
    hasCrisp, hasNoRing: artifactCount === 0 && blurCount === 0,
    hasPrecise, hasNoOvershoot: artifactCount === 0,
    artifactCount, blurCount,
  }
}

/** @example measureFrequency(content) evaluates code frequency distribution */
export function measureFrequency(content: string): FrequencyMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const monotoneMatches = content.match(/\bvar\s+/g)
  const monotoneCount = monotoneMatches ? monotoneMatches.length : 0
  const repetitiveMatches = content.match(/\bany\b/g)
  const repetitiveCount = repetitiveMatches ? repetitiveMatches.length : 0

  const hasDiverse = hasExport && hasImport
  const hasVaried = hasInterface && hasClass
  const hasRich = hasTypeAlias && hasGenerics
  const hasColorful = hasAsync && hasDocComments
  const hasDynamic = hasConst && hasReadonly

  let distribution = 0
  if (hasExport) distribution += 10
  if (hasImport) distribution += 10
  if (hasInterface) distribution += 8
  if (hasClass) distribution += 8
  if (hasTypeAlias) distribution += 8
  if (hasConst) distribution += 8
  if (hasAsync) distribution += 8
  if (hasGenerics) distribution += 10
  if (hasDocComments) distribution += 8
  if (hasReadonly) distribution += 8
  if (hasDiverse) distribution += 5
  if (hasVaried) distribution += 5
  if (hasRich) distribution += 5
  if (hasColorful) distribution += 5
  if (hasDynamic) distribution += 5

  distribution = Math.min(100, Math.round(distribution))

  let spectrum: FrequencyMeasure['spectrum'] = 'white-noise'
  if (distribution >= 85) spectrum = 'full-spectrum'
  else if (distribution >= 70) spectrum = 'wide-band'
  else if (distribution >= 55) spectrum = 'proper-band'
  else if (distribution >= 40) spectrum = 'narrow-band'
  else if (distribution >= 25) spectrum = 'single-tone'

  return {
    distribution, spectrum,
    hasHighDistribution: distribution >= 70,
    hasDiverse, hasNoMonotone: monotoneCount === 0,
    hasVaried, hasNoRepetitive: repetitiveCount === 0,
    hasRich, hasNoHomogeneous: monotoneCount === 0 && repetitiveCount === 0,
    hasColorful, hasNoGray: monotoneCount === 0,
    hasDynamic, hasNoStatic: repetitiveCount === 0,
    monotoneCount, repetitiveCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'pure-resonance' */
export function classifyCondition(score: number): WaveCondition {
  if (score >= 85) return 'pure-resonance'
  if (score >= 70) return 'harmonic-balance'
  if (score >= 55) return 'clean-tone'
  if (score >= 40) return 'muffled-sound'
  if (score >= 25) return 'distorted'
  return 'noise-floor'
}

/** @example classifyChamberType(waves) returns chamber classification */
export function classifyChamberType(waves: SpectralWave[]): ChamberType {
  if (waves.length === 0) return 'anechoic'
  const avgQs = waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length
  const masterCount = waves.filter((w) => w.condition === 'pure-resonance').length
  const ratio = masterCount / waves.length
  if (avgQs >= 75 && ratio >= 0.5) return 'concert-hall'
  if (avgQs >= 60) return 'studio-room'
  if (avgQs >= 45) return 'practice-room'
  if (avgQs >= 30) return 'garage-space'
  if (avgQs >= 15) return 'closet-booth'
  return 'anechoic'
}

/** @example classifyChamberCondition(avgQs) returns chamber condition */
export function classifyChamberCondition(avgQs: number): ChamberCondition {
  if (avgQs >= 75) return 'perfect-acoustics'
  if (avgQs >= 60) return 'great-sound'
  if (avgQs >= 45) return 'good-room'
  if (avgQs >= 30) return 'dead-room'
  if (avgQs >= 15) return 'echo-chamber'
  return 'reverberant'
}

/** @example classifyConductorGrade(80) returns 'maestro' */
export function classifyConductorGrade(avgHarmonicity: number): ConductorGrade {
  if (avgHarmonicity >= 80) return 'maestro'
  if (avgHarmonicity >= 65) return 'virtuoso'
  if (avgHarmonicity >= 50) return 'concert-master'
  if (avgHarmonicity >= 35) return 'section-player'
  if (avgHarmonicity >= 20) return 'student-musician'
  return 'tone-deaf'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeSpectralWave(content, filePath) evaluates single file */
export function analyzeSpectralWave(content: string, filePath: string): SpectralWave {
  const resonatingMeasure = measureResonating(content)
  const harmonicMeasure = measureHarmonic(content)
  const overtoneMeasure = measureOvertone(content)
  const waveformMeasure = measureWaveform(content)
  const frequencyMeasure = measureFrequency(content)

  const qualityScore = Math.round(
    resonatingMeasure.purity * 0.2 +
    harmonicMeasure.resonance * 0.2 +
    overtoneMeasure.richness * 0.2 +
    waveformMeasure.clarity * 0.2 +
    frequencyMeasure.distribution * 0.2,
  )

  return {
    file: filePath,
    spectralPurity: resonatingMeasure.purity,
    harmonicResonance: harmonicMeasure.resonance,
    overtoneRichness: overtoneMeasure.richness,
    waveformClarity: waveformMeasure.clarity,
    frequencyDistribution: frequencyMeasure.distribution,
    resonating: resonatingMeasure,
    harmonic: harmonicMeasure,
    overtone: overtoneMeasure,
    waveform: waveformMeasure,
    frequency: frequencyMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeResonanceChamber(waves, dirPath) evaluates directory */
export function analyzeResonanceChamber(waves: SpectralWave[], dirPath: string): ResonanceChamber {
  if (waves.length === 0) {
    return {
      directory: dirPath, waves: [],
      avgPurity: 0, avgResonance: 0, avgClarity: 0,
      pureResonanceCount: 0, noiseFloorCount: 0,
      chamberType: 'anechoic', condition: 'reverberant',
    }
  }

  const avgPurity = Math.round(waves.reduce((s, w) => s + w.spectralPurity, 0) / waves.length)
  const avgResonance = Math.round(waves.reduce((s, w) => s + w.harmonicResonance, 0) / waves.length)
  const avgClarity = Math.round(waves.reduce((s, w) => s + w.waveformClarity, 0) / waves.length)
  const pureResonanceCount = waves.filter((w) => w.condition === 'pure-resonance').length
  const noiseFloorCount = waves.filter((w) => w.condition === 'noise-floor').length
  const avgQs = waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length

  return {
    directory: dirPath, waves,
    avgPurity, avgResonance, avgClarity,
    pureResonanceCount, noiseFloorCount,
    chamberType: classifyChamberType(waves),
    condition: classifyChamberCondition(avgQs),
  }
}

/** @example generateRecommendations(waves, chambers, spectrum, stats) generates advice */
export function generateRecommendations(
  waves: SpectralWave[],
  chambers: ResonanceChamber[],
  spectrum: Spectrum,
  stats: SpectralHarmonicsStats,
): string[] {
  const recs: string[] = []

  if (stats.avgSpectralPurity < 50) {
    recs.push('Tune spectral purity with strict equality, return types, and clean patterns')
  }
  if (stats.avgHarmonicResonance < 50) {
    recs.push('Harmonize resonance with balanced imports/exports, interfaces, and classes')
  }
  if (stats.avgOvertoneRichness < 50) {
    recs.push('Enrich overtones with generics, type aliases, and creative type compositions')
  }
  if (stats.avgWaveformClarity < 50) {
    recs.push('Clarify waveforms with optional chaining, default params, and precise types')
  }
  if (stats.avgFrequencyDistribution < 50) {
    recs.push('Broaden frequency distribution with diverse patterns, async, and documentation')
  }
  if (stats.noiseFloorCount > 0) {
    recs.push(`${String(stats.noiseFloorCount)} file(s) at noise floor — consider significant refactoring`)
  }
  if (spectrum.overallHarmonicity < 40) {
    recs.push('Overall harmonicity is low — focus on spectral purity and resonance fundamentals')
  }
  if (chambers.length > 0 && chambers.every((ch) => ch.chamberType === 'anechoic' || ch.chamberType === 'closet-booth')) {
    recs.push('All chambers are acoustically dead — consider a major quality improvement effort')
  }

  const noiseFiles = waves.filter((w) => w.condition === 'noise-floor')
  if (noiseFiles.length > 0 && noiseFiles.length <= 3) {
    const names = noiseFiles.map((w) => w.file).join(', ')
    recs.push(`Clean up these noise-floor files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your spectral harmonics are perfectly tuned! Every wave resonates with clarity')
  }

  return Array.from(new Set(recs))
}

/** @example buildSpectralHarmonicsResult(files, contents, options) orchestrates analysis */
export function buildSpectralHarmonicsResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): SpectralHarmonicsResult {
  const waves = files.map((file, i) => analyzeSpectralWave(contents[i] ?? '', file))

  const cMap = new Map<string, SpectralWave[]>()
  for (const wave of waves) {
    const dir = wave.file.includes('/') ? wave.file.split('/').slice(0, -1).join('/') : '.'
    const existing = cMap.get(dir)
    if (existing) {
      existing.push(wave)
    } else {
      cMap.set(dir, [wave])
    }
  }

  const chambers = Array.from(cMap.entries()).map(([dir, dirWaves]) =>
    analyzeResonanceChamber(dirWaves, dir),
  )

  const totalFiles = waves.length
  const avgSpectralPurity = totalFiles > 0 ? Math.round(waves.reduce((s, w) => s + w.spectralPurity, 0) / totalFiles) : 0
  const avgHarmonicResonance = totalFiles > 0 ? Math.round(waves.reduce((s, w) => s + w.harmonicResonance, 0) / totalFiles) : 0
  const avgOvertoneRichness = totalFiles > 0 ? Math.round(waves.reduce((s, w) => s + w.overtoneRichness, 0) / totalFiles) : 0
  const avgWaveformClarity = totalFiles > 0 ? Math.round(waves.reduce((s, w) => s + w.waveformClarity, 0) / totalFiles) : 0
  const avgFrequencyDistribution = totalFiles > 0 ? Math.round(waves.reduce((s, w) => s + w.frequencyDistribution, 0) / totalFiles) : 0

  const overallHarmonicity = totalFiles > 0
    ? Math.round((avgSpectralPurity + avgHarmonicResonance + avgWaveformClarity) / 3)
    : 0

  const spectrumData: Spectrum = {
    avgPurity: avgSpectralPurity,
    avgResonance: avgHarmonicResonance,
    avgClarity: avgWaveformClarity,
    isHarmonious: avgSpectralPurity >= 60,
    overallHarmonicity,
  }

  const bestWave = totalFiles > 0
    ? waves.reduce((best, w) => (w.qualityScore > best.qualityScore ? w : best), waves[0]).file
    : ''
  const purest = totalFiles > 0
    ? waves.reduce((best, w) => (w.spectralPurity > best.spectralPurity ? w : best), waves[0]).file
    : ''
  const mostResonant = totalFiles > 0
    ? waves.reduce((best, w) => (w.harmonicResonance > best.harmonicResonance ? w : best), waves[0]).file
    : ''
  const richest = totalFiles > 0
    ? waves.reduce((best, w) => (w.overtoneRichness > best.overtoneRichness ? w : best), waves[0]).file
    : ''
  const clearest = totalFiles > 0
    ? waves.reduce((best, w) => (w.waveformClarity > best.waveformClarity ? w : best), waves[0]).file
    : ''

  const stats: SpectralHarmonicsStats = {
    totalFiles,
    totalChambers: chambers.length,
    avgSpectralPurity, avgHarmonicResonance, avgOvertoneRichness,
    avgWaveformClarity, avgFrequencyDistribution,
    pureResonanceCount: waves.filter((w) => w.condition === 'pure-resonance').length,
    harmonicBalanceCount: waves.filter((w) => w.condition === 'harmonic-balance').length,
    cleanToneCount: waves.filter((w) => w.condition === 'clean-tone').length,
    muffledSoundCount: waves.filter((w) => w.condition === 'muffled-sound').length,
    distortedCount: waves.filter((w) => w.condition === 'distorted').length,
    noiseFloorCount: waves.filter((w) => w.condition === 'noise-floor').length,
    hasHighPurityCount: waves.filter((w) => w.resonating.hasHighPurity).length,
    hasHighResonanceCount: waves.filter((w) => w.harmonic.hasHighResonance).length,
    hasHighRichnessCount: waves.filter((w) => w.overtone.hasHighRichness).length,
    hasHighClarityCount: waves.filter((w) => w.waveform.hasHighClarity).length,
    hasHighDistributionCount: waves.filter((w) => w.frequency.hasHighDistribution).length,
    overallHarmonicity,
    conductorGrade: classifyConductorGrade(overallHarmonicity),
    bestWave, purest, mostResonant, richest, clearest,
  }

  const recommendations = generateRecommendations(waves, chambers, spectrumData, stats)

  return { waves, chambers, spectrum: spectrumData, stats, recommendations }
}
