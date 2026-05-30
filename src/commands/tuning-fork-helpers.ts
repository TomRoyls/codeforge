// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Vibrations {
  amplitude: number
  frequency: number
  sustain: number
  decay: number
}

export interface Harmonics {
  fundamental: number
  second: number
  third: number
  fourth: number
  overtoneCount: number
  harmonicRatio: number
}

export interface Beats {
  present: boolean
  beatFrequency: number
  beatSources: string[]
}

export interface TuningInfo {
  isInKey: boolean
  keySignature: string
  tempoConsistency: number
  dynamicRange: number
}

export interface ResonanceInfo {
  isResonant: boolean
  isDamped: boolean
  isForced: boolean
  naturalFrequency: number
  resonantFrequency: number
}

export interface TuningResult {
  file: string
  fundamentalFrequency: number
  resonanceQuality: number
  tuningAccuracy: number
  harmonicContent: number
  damping: number
  frequency: number
  note: string
  octave: number
  pitch: 'sharp' | 'in-tune' | 'flat' | 'atonal'
  vibrations: Vibrations
  harmonics: Harmonics
  beats: Beats
  tuning: TuningInfo
  resonance: ResonanceInfo
  forkMaterial: 'steel' | 'aluminum' | 'quartz' | 'wood' | 'plastic' | 'rubber'
  toneQuality: 'pure' | 'warm' | 'bright' | 'dull' | 'harsh' | 'dissonant' | 'noise'
  condition: 'perfect-pitch' | 'well-tuned' | 'slightly-off' | 'out-of-tune' | 'broken' | 'silent'
  qualityScore: number
  issues: string[]
  harmoniousPatterns: string[]
}

export interface ResonanceChamber {
  directory: string
  results: TuningResult[]
  avgResonance: number
  avgTuningAccuracy: number
  avgHarmonicContent: number
  dominantNote: string
  dominantKey: string
  inTuneCount: number
  outOfTuneCount: number
  beatCount: number
  resonantCount: number
  dampedCount: number
  chamberResonance: number
  chamberTuning: string
  isHarmonious: boolean
  isCacophonous: boolean
  acousticHealth: 'concert-hall' | 'studio' | 'living-room' | 'garage' | 'warehouse' | 'anechoic'
}

export interface ConcertInfo {
  avgResonance: number
  avgTuningAccuracy: number
  dominantNote: string
  isOrchestral: boolean
  totalBeats: number
  isDissonant: boolean
}

export interface TuningForkStats {
  totalFiles: number
  totalChambers: number
  avgFundamentalFrequency: number
  avgResonanceQuality: number
  avgTuningAccuracy: number
  avgHarmonicContent: number
  avgDamping: number
  perfectPitchCount: number
  wellTunedCount: number
  outOfTuneCount: number
  brokenCount: number
  silentCount: number
  pureTones: number
  dissonantTones: number
  inKeyCount: number
  beatCount: number
  resonantCount: number
  dampedCount: number
  forcedCount: number
  steelForks: number
  rubberForks: number
  overallResonance: number
  isOrchestral: boolean
  maestroGrade: 'virtuoso' | 'concert-master' | 'musician' | 'student' | 'tone-deaf' | 'deaf'
  bestTuned: string
  worstTuned: string
  mostResonant: string
  mostDissonant: string
}

export interface TuningForkResult {
  results: TuningResult[]
  chambers: ResonanceChamber[]
  concert: ConcertInfo
  stats: TuningForkStats
  recommendations: string[]
}

// ─── Content Analysis Primitives ─────────────────────────────────────────────

/**
 * Count exports in content
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions in content
 * @example
 * countFunctions('function a() {} function b() {}') // 2
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/g) ?? []).length
}

/**
 * Count imports in content
 * @example
 * countImports('import { a } from "b"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Detect naming style from content
 * @example
 * detectNamingStyle('const myVar = 1') // 'camelCase'
 */
export function detectNamingStyle(content: string): string {
  const camelCount = (content.match(/\b[a-z][a-zA-Z]+\b/g) ?? []).length
  const snakeCount = (content.match(/\b[a-z]+_[a-z_]+\b/g) ?? []).length
  const pascalCount = (content.match(/\b[A-Z][a-zA-Z]+\b/g) ?? []).length
  const max = Math.max(camelCount, snakeCount, pascalCount)
  if (max === 0) return 'unknown'
  if (camelCount === max) return 'camelCase'
  if (snakeCount === max) return 'snake_case'
  return 'PascalCase'
}

/**
 * Measure cyclomatic complexity indicator
 * @example
 * measureComplexity('if (a) { if (b) { } }') // 2
 */
export function measureComplexity(content: string): number {
  const branches = (content.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b|\bcatch\b|\?\s|&&|\|\|/g) ?? []).length
  return branches
}

/**
 * Measure async usage
 * @example
 * measureAsyncUsage('async function a() { await b() }') // 2
 */
export function measureAsyncUsage(content: string): number {
  return (content.match(/\basync\b|\bawait\b|\.then\s*\(|\.catch\s*\(/g) ?? []).length
}

/**
 * Measure error handling
 * @example
 * measureErrorHandling('try {} catch(e) {}') // 2
 */
export function measureErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Measure comments ratio
 * @example
 * measureCommentRatio('// a\nconst x = 1') // 50
 */
export function measureCommentRatio(content: string): number {
  const lines = content.split('\n')
  const total = lines.length || 1
  const commentLines = lines.filter(l => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
  }).length
  return Math.round((commentLines / total) * 100)
}

/**
 * Count nesting depth
 * @example
 * maxNestingDepth('if (a) { if (b) { if (c) { } } }') // 3
 */
export function maxNestingDepth(content: string): number {
  let max = 0
  let current = 0
  for (const ch of content) {
    if (ch === '{') {
      current++
      if (current > max) max = current
    } else if (ch === '}') {
      current = Math.max(0, current - 1)
    }
  }
  return max
}

// ─── Core Measurements ───────────────────────────────────────────────────────

/**
 * Measure fundamental frequency (core purpose clarity)
 * @example
 * measureFundamentalFrequency('export function calc() { return 1 }') // number
 */
export function measureFundamentalFrequency(content: string): number {
  const exports = countExports(content)
  const functions = countFunctions(content)
  const lines = content.split('\n').filter(l => l.trim().length > 0).length

  if (lines === 0) return 0

  const exportClarity = exports === 1 ? 40 : exports <= 3 ? 25 : exports <= 6 ? 15 : 5
  const functionFocus = functions === 0 ? 5 : functions <= 3 ? 30 : functions <= 6 ? 20 : 10
  const sizeScore = lines <= 20 ? 20 : lines <= 50 ? 15 : lines <= 100 ? 10 : 5
  const nesting = maxNestingDepth(content)
  const nestingScore = nesting <= 2 ? 10 : nesting <= 4 ? 5 : 0

  return Math.min(100, exportClarity + functionFocus + sizeScore + nestingScore)
}

/**
 * Measure resonance quality (purpose sustainability)
 * @example
 * measureResonanceQuality('function calc(x) { return x * 2 }') // number
 */
export function measureResonanceQuality(content: string): number {
  const complexity = measureComplexity(content)
  const errorHandling = measureErrorHandling(content)
  const lines = content.split('\n').filter(l => l.trim().length > 0).length

  if (lines === 0) return 0

  const complexityScore = complexity <= 3 ? 35 : complexity <= 8 ? 25 : complexity <= 15 ? 15 : 5
  const errorScore = errorHandling > 0 ? 25 : 10
  const lengthScore = lines <= 30 ? 25 : lines <= 60 ? 20 : lines <= 100 ? 10 : 5
  const hasReturn = /\breturn\b/.test(content)
  const returnScore = hasReturn ? 15 : 5

  return Math.min(100, complexityScore + errorScore + lengthScore + returnScore)
}

/**
 * Measure tuning accuracy (convention adherence)
 * @example
 * measureTuningAccuracy('const myVar = 1') // number
 */
export function measureTuningAccuracy(content: string): number {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  if (lines === 0) return 0

  const style = detectNamingStyle(content)
  const styleScore = style === 'unknown' ? 10 : 25

  const hasConsistentIndent = content.split('\n').every((l, _i, arr) => {
    if (l.trim().length === 0) return true
    const indent = l.match(/^(\s*)/)?.[1] ?? ''
    const firstIndent = arr.find(a => a.trim().length > 0)?.match(/^(\s*)/)?.[1] ?? ''
    return indent.startsWith('\t') === firstIndent.startsWith('\t') || indent === '' || firstIndent === ''
  })
  const indentScore = hasConsistentIndent ? 25 : 10

  const importCount = countImports(content)
  const exportCount = countExports(content)
  const structureScore = (importCount > 0 ? 10 : 5) + (exportCount > 0 ? 15 : 5)

  const commentRatio = measureCommentRatio(content)
  const docScore = commentRatio > 0 ? 10 : 5

  const consistentSemicolons = (() => {
    const withSemi = (content.match(/;\s*$/gm) ?? []).length
    const withoutSemi = (content.match(/[^;{}]\s*$/gm) ?? []).length
    if (withSemi === 0 && withoutSemi === 0) return 10
    const ratio = withSemi / (withSemi + withoutSemi)
    return ratio > 0.7 || ratio < 0.3 ? 15 : 5
  })()

  return Math.min(100, styleScore + indentScore + structureScore + docScore + consistentSemicolons)
}

/**
 * Measure harmonic content (supporting feature quality)
 * @example
 * measureHarmonicContent('export function a() { try { return 1 } catch(e) { return 0 } }') // number
 */
export function measureHarmonicContent(content: string): number {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  if (lines === 0) return 0

  const asyncUsage = measureAsyncUsage(content)
  const errorHandling = measureErrorHandling(content)
  const hasTypes = /:\s*(?:string|number|boolean|void|any|never|unknown)\b/.test(content)
  const hasDefaults = /\?\s*:/g.test(content) || /=\s*default\b/.test(content)
  const hasTests = /\bdescribe\b|\bit\b|\bexpect\b/.test(content)

  const asyncScore = Math.min(20, asyncUsage * 5)
  const errorScore = Math.min(25, errorHandling * 8)
  const typeScore = hasTypes ? 20 : 5
  const defaultScore = hasDefaults ? 15 : 5
  const testScore = hasTests ? 20 : 5

  return Math.min(100, asyncScore + errorScore + typeScore + defaultScore + testScore)
}

/**
 * Measure damping (issue fade rate)
 * @example
 * measureDamping('try { x() } catch(e) { log(e) }') // number
 */
export function measureDamping(content: string): number {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  if (lines === 0) return 0

  const catchCount = (content.match(/\bcatch\s*\(/g) ?? []).length
  const finallyCount = (content.match(/\bfinally\s*\{/g) ?? []).length
  const hasEmptyCatch = /\bcatch\s*\(\w*\)\s*\{\s*\}/.test(content)
  const hasConsoleError = /console\.error/.test(content)

  const catchScore = Math.min(30, catchCount * 15)
  const finallyScore = finallyCount > 0 ? 20 : 5
  const emptyCatchPenalty = hasEmptyCatch ? 0 : 20
  const logScore = hasConsoleError ? 15 : 5

  return Math.min(100, catchScore + finallyScore + emptyCatchPenalty + logScore)
}

// ─── Vibration Analysis ──────────────────────────────────────────────────────

/**
 * Measure vibration properties
 * @example
 * measureVibrations('export function calc(x) { return x * 2 }') // Vibrations
 */
export function measureVibrations(content: string): Vibrations {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  const functions = countFunctions(content)
  const complexity = measureComplexity(content)

  const amplitude = Math.min(100, Math.round(
    (functions > 0 ? 30 : 5) +
    Math.min(40, functions * 10) +
    (lines > 5 ? 20 : 10) +
    (complexity < 5 ? 10 : 0),
  ))

  const frequency = Math.min(100, Math.round(
    (lines > 0 ? lines / 2 : 0) +
    functions * 10,
  ))

  const sustain = Math.min(100, Math.round(
    (countExports(content) > 0 ? 30 : 10) +
    (countImports(content) > 0 ? 20 : 5) +
    (measureCommentRatio(content) > 10 ? 25 : 10) +
    (measureErrorHandling(content) > 0 ? 25 : 10),
  ))

  const decay = Math.min(100, Math.round(
    (complexity * 8) +
    (maxNestingDepth(content) * 10) +
    ((content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length * 15),
  ))

  return { amplitude, frequency, sustain, decay }
}

// ─── Harmonic Analysis ───────────────────────────────────────────────────────

/**
 * Measure harmonic content breakdown
 * @example
 * measureHarmonics('function a() {} function b() {}') // Harmonics
 */
export function measureHarmonics(content: string): Harmonics {
  const fundamental = measureFundamentalFrequency(content)
  const second = measureHarmonicContent(content)
  const third = measureDamping(content)
  const fourth = measureTuningAccuracy(content) * 0.5 + measureResonanceQuality(content) * 0.5

  const concernSet = new Set<string>()
  if (measureAsyncUsage(content) > 0) concernSet.add('async')
  if (measureErrorHandling(content) > 0) concernSet.add('errors')
  if (countImports(content) > 0) concernSet.add('imports')
  if (countExports(content) > 0) concernSet.add('exports')
  if (measureComplexity(content) > 3) concernSet.add('complexity')
  if (measureCommentRatio(content) > 15) concernSet.add('documentation')
  const overtoneCount = concernSet.size

  const maxHarmonic = Math.max(fundamental, second, third, fourth)
  const harmonicRatio = maxHarmonic > 0
    ? Math.round(Math.min(fundamental, second, third, fourth) / maxHarmonic * 100)
    : 0

  return { fundamental, second, third, fourth, overtoneCount, harmonicRatio }
}

// ─── Beat Detection ──────────────────────────────────────────────────────────

/**
 * Detect conflicting patterns (beats)
 * @example
 * detectBeats('async function a() {} function b() { return c.sync() }') // Beats
 */
export function detectBeats(content: string): Beats {
  const sources: string[] = []
  let beatFreq = 0

  const asyncCount = (content.match(/\basync\b|\bawait\b/g) ?? []).length
  const syncCallCount = (content.match(/\.\w+\([^)]*\)(?!\s*\.then|\s*\.catch|\s*await)/g) ?? []).length
  if (asyncCount > 0 && syncCallCount > asyncCount) {
    sources.push('mixed-sync-async')
    beatFreq += 20
  }

  const esmImports = (content.match(/^import\s+/gm) ?? []).length
  const requireCalls = (content.match(/require\s*\(/g) ?? []).length
  if (esmImports > 0 && requireCalls > 0) {
    sources.push('mixed-import-styles')
    beatFreq += 15
  }

  const camelCount = (content.match(/\b[a-z][a-zA-Z]+\b/g) ?? []).length
  const snakeCount = (content.match(/\b[a-z]+_[a-z_]+\b/g) ?? []).length
  if (camelCount > 5 && snakeCount > 5) {
    sources.push('mixed-naming-styles')
    beatFreq += 15
  }

  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasUnhandledPromise = /\.then\s*\(/g.test(content) && !/\.catch\s*\(/g.test(content)
  if (hasUnhandledPromise && hasTryCatch) {
    sources.push('inconsistent-error-handling')
    beatFreq += 20
  }

  const tabIndent = (content.match(/^\t/gm) ?? []).length
  const spaceIndent = (content.match(/^  [^\s]/gm) ?? []).length
  if (tabIndent > 3 && spaceIndent > 3) {
    sources.push('mixed-indentation')
    beatFreq += 10
  }

  return {
    present: sources.length > 0,
    beatFrequency: Math.min(100, beatFreq),
    beatSources: sources,
  }
}

// ─── Frequency & Musical Mapping ─────────────────────────────────────────────

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Compute frequency mapping from quality score
 * @example
 * computeFrequency(80) // { frequency: 352, note: 'F', octave: 4 }
 */
export function computeFrequency(qualityScore: number): { frequency: number; note: string; octave: number } {
  const frequency = Math.round(qualityScore / 100 * 440)
  const semitones = Math.round(12 * Math.log2(Math.max(1, frequency) / 16.35))
  const noteIndex = ((semitones % 12) + 12) % 12
  const octave = Math.floor(semitones / 12) + 1
  return { frequency, note: NOTES[noteIndex] ?? '', octave: Math.max(0, octave) }
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify pitch from tuning accuracy
 * @example
 * classifyPitch(95) // 'in-tune'
 */
export function classifyPitch(tuningAccuracy: number): TuningResult['pitch'] {
  if (tuningAccuracy >= 80) return 'in-tune'
  if (tuningAccuracy >= 60) return 'sharp'
  if (tuningAccuracy >= 30) return 'flat'
  return 'atonal'
}

/**
 * Classify fork material from content quality
 * @example
 * classifyForkMaterial('export function calc() { return 1 }') // 'steel'
 */
export function classifyForkMaterial(content: string): TuningResult['forkMaterial'] {
  const fundamental = measureFundamentalFrequency(content)
  const resonance = measureResonanceQuality(content)
  const tuning = measureTuningAccuracy(content)
  const avg = (fundamental + resonance + tuning) / 3

  if (avg >= 75) return 'steel'
  if (avg >= 60) return 'aluminum'
  if (avg >= 50) return 'quartz'
  if (avg >= 35) return 'wood'
  if (avg >= 20) return 'plastic'
  return 'rubber'
}

/**
 * Classify tone quality from result metrics
 * @example
 * classifyToneQuality({ resonanceQuality: 80, tuningAccuracy: 70, beats: { present: false }, harmonics: { harmonicRatio: 80 } }) // 'pure'
 */
export function classifyToneQuality(
  resonanceQuality: number,
  tuningAccuracy: number,
  beatsPresent: boolean,
  harmonicRatio: number,
): TuningResult['toneQuality'] {
  if (resonanceQuality >= 70 && tuningAccuracy >= 70 && !beatsPresent) return 'pure'
  if (resonanceQuality >= 60 && harmonicRatio >= 50) return 'warm'
  if (tuningAccuracy >= 60 && resonanceQuality >= 40) return 'bright'
  if (resonanceQuality < 30 && tuningAccuracy < 30) return 'noise'
  if (beatsPresent && tuningAccuracy < 50) return 'dissonant'
  if (resonanceQuality < 40) return 'dull'
  return 'harsh'
}

/**
 * Classify condition from quality score
 * @example
 * classifyCondition(90) // 'perfect-pitch'
 */
export function classifyCondition(qualityScore: number): TuningResult['condition'] {
  if (qualityScore >= 85) return 'perfect-pitch'
  if (qualityScore >= 65) return 'well-tuned'
  if (qualityScore >= 45) return 'slightly-off'
  if (qualityScore >= 25) return 'out-of-tune'
  if (qualityScore >= 10) return 'broken'
  return 'silent'
}

/**
 * Classify maestro grade from average resonance
 * @example
 * classifyMaestroGrade(90) // 'virtuoso'
 */
export function classifyMaestroGrade(avgResonance: number): TuningForkStats['maestroGrade'] {
  if (avgResonance >= 80) return 'virtuoso'
  if (avgResonance >= 65) return 'concert-master'
  if (avgResonance >= 45) return 'musician'
  if (avgResonance >= 25) return 'student'
  if (avgResonance >= 10) return 'tone-deaf'
  return 'deaf'
}

/**
 * Classify acoustic health from chamber resonance
 * @example
 * classifyAcousticHealth(85) // 'concert-hall'
 */
export function classifyAcousticHealth(chamberResonance: number): ResonanceChamber['acousticHealth'] {
  if (chamberResonance >= 80) return 'concert-hall'
  if (chamberResonance >= 60) return 'studio'
  if (chamberResonance >= 40) return 'living-room'
  if (chamberResonance >= 25) return 'garage'
  if (chamberResonance >= 10) return 'warehouse'
  return 'anechoic'
}

// ─── Key Detection ───────────────────────────────────────────────────────────

/**
 * Detect key signature from naming style
 * @example
 * detectKeySignature('const myVar = 1') // 'C-camelCase'
 */
export function detectKeySignature(content: string): string {
  const style = detectNamingStyle(content)
  const fundamental = measureFundamentalFrequency(content)
  const noteIndex = Math.floor(fundamental / 100 * 12) % 12
  return `${NOTES[noteIndex]}-${style}`
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a tuning fork result
 * @example
 * analyzeTuningResult('export function calc() { return 1 }', 'calc.ts') // TuningResult
 */
export function analyzeTuningResult(content: string, filePath: string): TuningResult {
  const fundamentalFrequency = measureFundamentalFrequency(content)
  const resonanceQuality = measureResonanceQuality(content)
  const tuningAccuracy = measureTuningAccuracy(content)
  const harmonicContent = measureHarmonicContent(content)
  const damping = measureDamping(content)

  const vibrations = measureVibrations(content)
  const harmonics = measureHarmonics(content)
  const beats = detectBeats(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    fundamentalFrequency * 0.25 +
    resonanceQuality * 0.25 +
    tuningAccuracy * 0.2 +
    harmonicContent * 0.15 +
    damping * 0.15,
  )))

  const { frequency, note, octave } = computeFrequency(qualityScore)
  const pitch = classifyPitch(tuningAccuracy)
  const forkMaterial = classifyForkMaterial(content)
  const toneQuality = classifyToneQuality(resonanceQuality, tuningAccuracy, beats.present, harmonics.harmonicRatio)
  const condition = classifyCondition(qualityScore)

  const isInKey = tuningAccuracy >= 50
  const keySignature = detectKeySignature(content)
  const tempoConsistency = Math.min(100, Math.round(
    (tuningAccuracy * 0.5 + resonanceQuality * 0.3 + damping * 0.2),
  ))
  const dynamicRange = Math.min(100, Math.round(
    (harmonicContent * 0.4 + vibrations.amplitude * 0.3 + harmonics.overtoneCount * 10),
  ))

  const isResonant = resonanceQuality >= 60 && fundamentalFrequency >= 40
  const isDamped = damping < 30 && resonanceQuality < 40
  const isForced = countImports(content) > 5 && countExports(content) <= 1
  const naturalFrequency = Math.round((fundamentalFrequency + resonanceQuality) / 2)
  const resonantFrequency = qualityScore

  const issues: string[] = []
  if (beats.present) issues.push(`Beats detected: ${beats.beatSources.join(', ')}`)
  if (isDamped) issues.push('Damped resonance: issues suppress purpose')
  if (isForced) issues.push('Forced vibration: heavy external coupling')
  if (fundamentalFrequency < 30) issues.push('Low fundamental: unclear core purpose')
  if (tempoConsistency < 30) issues.push('Inconsistent tempo: mixed style patterns')

  const harmoniousPatterns: string[] = []
  if (isInKey) harmoniousPatterns.push(`In key: ${keySignature}`)
  if (isResonant) harmoniousPatterns.push('Resonant: strong purpose signal')
  if (harmonics.harmonicRatio >= 50) harmoniousPatterns.push('Good harmonic ratio')
  if (damping >= 60) harmoniousPatterns.push('Well-damped: graceful error handling')
  if (forkMaterial === 'steel' || forkMaterial === 'quartz') harmoniousPatterns.push(`Material: ${forkMaterial}`)

  return {
    file: filePath,
    fundamentalFrequency,
    resonanceQuality,
    tuningAccuracy,
    harmonicContent,
    damping,
    frequency,
    note,
    octave,
    pitch,
    vibrations,
    harmonics,
    beats,
    tuning: { isInKey, keySignature, tempoConsistency, dynamicRange },
    resonance: { isResonant, isDamped, isForced, naturalFrequency, resonantFrequency },
    forkMaterial,
    toneQuality,
    condition,
    qualityScore,
    issues,
    harmoniousPatterns,
  }
}

// ─── Chamber Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a resonance chamber
 * @example
 * analyzeResonanceChamber(results, 'src') // ResonanceChamber
 */
export function analyzeResonanceChamber(results: TuningResult[], dirPath: string): ResonanceChamber {
  if (results.length === 0) {
    return {
      directory: dirPath,
      results: [],
      avgResonance: 0,
      avgTuningAccuracy: 0,
      avgHarmonicContent: 0,
      dominantNote: 'C',
      dominantKey: 'unknown',
      inTuneCount: 0,
      outOfTuneCount: 0,
      beatCount: 0,
      resonantCount: 0,
      dampedCount: 0,
      chamberResonance: 0,
      chamberTuning: 'silent',
      isHarmonious: false,
      isCacophonous: true,
      acousticHealth: 'anechoic',
    }
  }

  const n = results.length
  const avgResonance = Math.round(results.reduce((s, r) => s + r.resonanceQuality, 0) / n)
  const avgTuningAccuracy = Math.round(results.reduce((s, r) => s + r.tuningAccuracy, 0) / n)
  const avgHarmonicContent = Math.round(results.reduce((s, r) => s + r.harmonicContent, 0) / n)

  const noteCounts: Record<string, number> = {}
  const keyCounts: Record<string, number> = {}
  for (const r of results) {
    noteCounts[r.note] = (noteCounts[r.note] ?? 0) + 1
    keyCounts[r.tuning.keySignature] = (keyCounts[r.tuning.keySignature] ?? 0) + 1
  }
  const dominantNote = Array.from(Object.entries(noteCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'C'
  const dominantKey = Array.from(Object.entries(keyCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown'

  const inTuneCount = results.filter(r => r.pitch === 'in-tune').length
  const outOfTuneCount = results.filter(r => r.pitch === 'flat' || r.pitch === 'atonal').length
  const beatCount = results.filter(r => r.beats.present).length
  const resonantCount = results.filter(r => r.resonance.isResonant).length
  const dampedCount = results.filter(r => r.resonance.isDamped).length

  const chamberResonance = Math.round(
    avgResonance * 0.3 +
    avgTuningAccuracy * 0.3 +
    (inTuneCount / n * 100) * 0.2 +
    (100 - (beatCount / n * 100)) * 0.2,
  )

  const isHarmonious = inTuneCount / n >= 0.7 && beatCount / n <= 0.2
  const isCacophonous = outOfTuneCount / n >= 0.5 || beatCount / n >= 0.5

  let chamberTuning: string
  if (chamberResonance >= 80) chamberTuning = 'perfectly-tuned'
  else if (chamberResonance >= 60) chamberTuning = 'well-tuned'
  else if (chamberResonance >= 40) chamberTuning = 'needs-tuning'
  else if (chamberResonance >= 20) chamberTuning = 'out-of-tune'
  else chamberTuning = 'cacophonous'

  const acousticHealth = classifyAcousticHealth(chamberResonance)

  return {
    directory: dirPath,
    results,
    avgResonance,
    avgTuningAccuracy,
    avgHarmonicContent,
    dominantNote,
    dominantKey,
    inTuneCount,
    outOfTuneCount,
    beatCount,
    resonantCount,
    dampedCount,
    chamberResonance,
    chamberTuning,
    isHarmonious,
    isCacophonous,
    acousticHealth,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate tuning fork recommendations
 * @example
 * generateRecommendations(results, chambers, concert, stats) // string[]
 */
export function generateRecommendations(
  _results: TuningResult[],
  chambers: ResonanceChamber[],
  concert: ConcertInfo,
  stats: TuningForkStats,
): string[] {
  const recs: string[] = []

  if (stats.outOfTuneCount > 0) {
    recs.push(`Out of tune: ${stats.outOfTuneCount} files need convention alignment`)
  }

  if (stats.beatCount > stats.totalFiles * 0.3) {
    recs.push(`Frequent beats: ${stats.beatCount} files have conflicting patterns — resolve inconsistencies`)
  }

  if (stats.dampedCount > 0) {
    recs.push(`Damped resonance: ${stats.dampedCount} files have suppressed purpose — remove suppressors`)
  }

  if (stats.dissonantTones > stats.totalFiles * 0.3) {
    recs.push(`Widespread dissonance: ${stats.dissonantTones} files — harmonize patterns`)
  }

  if (stats.forcedCount > 0) {
    recs.push(`Forced vibration: ${stats.forcedCount} files heavily coupled to externals — reduce coupling`)
  }

  if (stats.silentCount > 0) {
    recs.push(`Silent forks: ${stats.silentCount} empty or dead-code files — remove or repurpose`)
  }

  if (concert.totalBeats > 10) {
    recs.push(`High total beats: ${concert.totalBeats} — codebase has systemic conflicts`)
  }

  if (stats.rubberForks > stats.totalFiles * 0.3) {
    recs.push(`Many rubber forks: ${stats.rubberForks} low-quality files — invest in refactoring`)
  }

  if (stats.overallResonance >= 70) {
    recs.push('Good overall resonance: codebase maintains clear purpose')
  }

  const cacophonous = chambers.filter(c => c.isCacophonous)
  if (cacophonous.length > 0) {
    recs.push(`Cacophonous chambers: ${cacophonous.length} directories need tuning`)
  }

  if (stats.bestTuned !== 'none') {
    recs.push(`Best tuned: ${stats.bestTuned} — reference for tuning standards`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete tuning fork result from files and contents
 * @example
 * buildTuningForkResult(['a.ts'], ['export function a() {}'], {}) // TuningForkResult
 */
export function buildTuningForkResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TuningForkResult {
  void options

  const results: TuningResult[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeTuningResult(content, file)
    } catch {
      return analyzeTuningResult('', file)
    }
  })

  const dirMap = new Map<string, TuningResult[]>()
  for (const r of results) {
    const dir = r.file.includes('/') ? r.file.slice(0, r.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(r)
    } else {
      dirMap.set(dir, [r])
    }
  }

  const chambers: ResonanceChamber[] = Array.from(dirMap.entries()).map(([dir, rs]) =>
    analyzeResonanceChamber(rs, dir),
  )

  const n = results.length || 1
  const avgResonance = Math.round(results.reduce((s, r) => s + r.resonanceQuality, 0) / n)
  const avgTuningAccuracy = Math.round(results.reduce((s, r) => s + r.tuningAccuracy, 0) / n)

  const noteCounts: Record<string, number> = {}
  for (const r of results) {
    noteCounts[r.note] = (noteCounts[r.note] ?? 0) + 1
  }
  const dominantNote = Array.from(Object.entries(noteCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'C'
  const totalBeats = results.reduce((s, r) => s + (r.beats.present ? 1 : 0), 0)

  const isOrchestral = results.filter(r => r.pitch === 'in-tune').length / n >= 0.8 && totalBeats / n <= 0.1
  const isDissonant = totalBeats / n >= 0.5 || results.filter(r => r.condition === 'broken' || r.condition === 'silent').length / n >= 0.3

  const concert: ConcertInfo = {
    avgResonance,
    avgTuningAccuracy,
    dominantNote,
    isOrchestral,
    totalBeats,
    isDissonant,
  }

  const avgFundamentalFrequency = Math.round(results.reduce((s, r) => s + r.fundamentalFrequency, 0) / n)
  const avgHarmonicContent = Math.round(results.reduce((s, r) => s + r.harmonicContent, 0) / n)
  const avgDamping = Math.round(results.reduce((s, r) => s + r.damping, 0) / n)
  const overallResonance = Math.round((avgResonance + avgTuningAccuracy + avgFundamentalFrequency) / 3)

  const stats: TuningForkStats = {
    totalFiles: files.length,
    totalChambers: chambers.length,
    avgFundamentalFrequency,
    avgResonanceQuality: avgResonance,
    avgTuningAccuracy,
    avgHarmonicContent,
    avgDamping,
    perfectPitchCount: results.filter(r => r.condition === 'perfect-pitch').length,
    wellTunedCount: results.filter(r => r.condition === 'well-tuned').length,
    outOfTuneCount: results.filter(r => r.condition === 'out-of-tune').length,
    brokenCount: results.filter(r => r.condition === 'broken').length,
    silentCount: results.filter(r => r.condition === 'silent').length,
    pureTones: results.filter(r => r.toneQuality === 'pure').length,
    dissonantTones: results.filter(r => r.toneQuality === 'dissonant' || r.toneQuality === 'noise').length,
    inKeyCount: results.filter(r => r.tuning.isInKey).length,
    beatCount: totalBeats,
    resonantCount: results.filter(r => r.resonance.isResonant).length,
    dampedCount: results.filter(r => r.resonance.isDamped).length,
    forcedCount: results.filter(r => r.resonance.isForced).length,
    steelForks: results.filter(r => r.forkMaterial === 'steel').length,
    rubberForks: results.filter(r => r.forkMaterial === 'rubber').length,
    overallResonance,
    isOrchestral,
    maestroGrade: classifyMaestroGrade(overallResonance),
    bestTuned: results.length > 0
      ? results.reduce((b, r) => r.tuningAccuracy > b.tuningAccuracy ? r : b, results[0] as typeof results[number]).file : 'none',
    worstTuned: results.length > 0
      ? results.reduce((w, r) => r.tuningAccuracy < w.tuningAccuracy ? r : w, results[0] as typeof results[number]).file : 'none',
    mostResonant: results.length > 0
      ? results.reduce((m, r) => r.resonanceQuality > m.resonanceQuality ? r : m, results[0] as typeof results[number]).file : 'none',
    mostDissonant: results.length > 0
      ? results.reduce((d, r) => d.beats.beatFrequency > r.beats.beatFrequency ? d : r, results[0] as typeof results[number]).file : 'none',
  }

  const recommendations = generateRecommendations(results, chambers, concert, stats)

  return { results, chambers, concert, stats, recommendations }
}
