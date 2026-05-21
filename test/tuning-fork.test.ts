import { describe, expect, it } from 'vitest'
import {
  analyzeResonanceChamber,
  analyzeTuningResult,
  buildTuningForkResult,
  classifyAcousticHealth,
  classifyCondition,
  classifyForkMaterial,
  classifyMaestroGrade,
  classifyPitch,
  classifyToneQuality,
  computeFrequency,
  countExports,
  countFunctions,
  countImports,
  detectBeats,
  detectKeySignature,
  detectNamingStyle,
  generateRecommendations,
  maxNestingDepth,
  measureAsyncUsage,
  measureCommentRatio,
  measureComplexity,
  measureDamping,
  measureErrorHandling,
  measureFundamentalFrequency,
  measureHarmonicContent,
  measureHarmonics,
  measureResonanceQuality,
  measureTuningAccuracy,
  measureVibrations,
} from '../src/commands/tuning-fork-helpers.js'
import type { TuningResult, TuningForkStats, ConcertInfo, ResonanceChamber } from '../src/commands/tuning-fork-helpers.js'
import { formatTuningForkJson, formatTuningForkTable } from '../src/commands/tuning-fork-format-helpers.js'

// ─── Content Analysis Primitives ─────────────────────────────────────────────

describe('countExports', () => {
  it('counts export functions', () => {
    expect(countExports('export function a() {}')).toBe(1)
  })

  it('counts export const', () => {
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('counts multiple exports', () => {
    expect(countExports('export function a() {}\nexport const b = 2')).toBe(2)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

describe('countFunctions', () => {
  it('counts named functions', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })

  it('counts arrow functions assigned to const', () => {
    expect(countFunctions('const add = (a, b) => a + b')).toBe(1)
  })

  it('returns 0 for no functions', () => {
    expect(countFunctions('const x = 1')).toBe(0)
  })
})

describe('countImports', () => {
  it('counts import statements', () => {
    expect(countImports('import { a } from "b"')).toBe(1)
  })

  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

describe('detectNamingStyle', () => {
  it('detects camelCase', () => {
    expect(detectNamingStyle('const myVariable = 1\nconst anotherName = 2')).toBe('camelCase')
  })

  it('detects snake_case', () => {
    expect(detectNamingStyle('my_variable = 1\nanother_long_name = 2\nyet_another_var = 3')).toBe('snake_case')
  })

  it('returns unknown for empty content', () => {
    expect(detectNamingStyle('')).toBe('unknown')
  })
})

describe('measureComplexity', () => {
  it('counts branching constructs', () => {
    expect(measureComplexity('if (a) { if (b) { } }')).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for simple code', () => {
    expect(measureComplexity('const x = 1')).toBe(0)
  })
})

describe('measureAsyncUsage', () => {
  it('counts async and await', () => {
    expect(measureAsyncUsage('async function a() { await b() }')).toBe(2)
  })

  it('returns 0 for sync code', () => {
    expect(measureAsyncUsage('function a() { return 1 }')).toBe(0)
  })
})

describe('measureErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(measureErrorHandling('try {} catch(e) {}')).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for no error handling', () => {
    expect(measureErrorHandling('const x = 1')).toBe(0)
  })
})

describe('measureCommentRatio', () => {
  it('measures comment percentage', () => {
    expect(measureCommentRatio('// a\nconst x = 1')).toBe(50)
  })

  it('returns 0 for no comments', () => {
    expect(measureCommentRatio('const x = 1')).toBe(0)
  })
})

describe('maxNestingDepth', () => {
  it('measures nesting depth', () => {
    expect(maxNestingDepth('if (a) { if (b) { if (c) { } } }')).toBe(3)
  })

  it('returns 0 for flat code', () => {
    expect(maxNestingDepth('const x = 1')).toBe(0)
  })
})

// ─── Core Measurements ───────────────────────────────────────────────────────

describe('measureFundamentalFrequency', () => {
  it('returns 0 for empty content', () => {
    expect(measureFundamentalFrequency('')).toBe(0)
  })

  it('returns high for single-export file', () => {
    const score = measureFundamentalFrequency('export function calc() { return 1 }')
    expect(score).toBeGreaterThan(50)
  })

  it('returns lower for many-export file', () => {
    const code = ['export function a() {}', 'export function b() {}', 'export function c() {}', 'export function d() {}', 'export function e() {}', 'export function f() {}', 'export function g() {}'].join('\n')
    const score = measureFundamentalFrequency(code)
    const singleScore = measureFundamentalFrequency('export function calc() { return 1 }')
    expect(score).toBeLessThan(singleScore)
  })
})

describe('measureResonanceQuality', () => {
  it('returns 0 for empty content', () => {
    expect(measureResonanceQuality('')).toBe(0)
  })

  it('returns higher for low complexity', () => {
    const simple = measureResonanceQuality('function calc(x) { return x * 2 }')
    const complex = measureResonanceQuality('if (a) { if (b) { if (c) { if (d) { if (e) { if (f) {} } } } } }')
    expect(simple).toBeGreaterThan(complex)
  })
})

describe('measureTuningAccuracy', () => {
  it('returns 0 for empty content', () => {
    expect(measureTuningAccuracy('')).toBe(0)
  })

  it('returns a score for well-structured code', () => {
    const code = [
      'import { x } from "y"',
      'export function calc() {',
      '  return 1',
      '}',
    ].join('\n')
    const score = measureTuningAccuracy(code)
    expect(score).toBeGreaterThan(30)
  })
})

describe('measureHarmonicContent', () => {
  it('returns 0 for empty content', () => {
    expect(measureHarmonicContent('')).toBe(0)
  })

  it('returns higher for code with error handling and types', () => {
    const code = 'export function calc(x: number): number { try { return x } catch(e) { return 0 } }'
    const score = measureHarmonicContent(code)
    expect(score).toBeGreaterThan(20)
  })
})

describe('measureDamping', () => {
  it('returns 0 for empty content', () => {
    expect(measureDamping('')).toBe(0)
  })

  it('returns higher for code with error handling', () => {
    const code = 'try { x() } catch(e) { console.error(e) }'
    const score = measureDamping(code)
    expect(score).toBeGreaterThan(20)
  })
})

// ─── Vibration Analysis ──────────────────────────────────────────────────────

describe('measureVibrations', () => {
  it('returns all four properties', () => {
    const v = measureVibrations('const x = 1')
    expect(v).toHaveProperty('amplitude')
    expect(v).toHaveProperty('frequency')
    expect(v).toHaveProperty('sustain')
    expect(v).toHaveProperty('decay')
  })

  it('all values are 0-100', () => {
    const v = measureVibrations('export function calc(x) { return x * 2 }')
    expect(v.amplitude).toBeGreaterThanOrEqual(0)
    expect(v.amplitude).toBeLessThanOrEqual(100)
    expect(v.frequency).toBeGreaterThanOrEqual(0)
    expect(v.sustain).toBeGreaterThanOrEqual(0)
    expect(v.decay).toBeGreaterThanOrEqual(0)
  })
})

// ─── Harmonic Analysis ───────────────────────────────────────────────────────

describe('measureHarmonics', () => {
  it('returns all harmonic properties', () => {
    const h = measureHarmonics('function a() {}')
    expect(h).toHaveProperty('fundamental')
    expect(h).toHaveProperty('second')
    expect(h).toHaveProperty('third')
    expect(h).toHaveProperty('fourth')
    expect(h).toHaveProperty('overtoneCount')
    expect(h).toHaveProperty('harmonicRatio')
  })

  it('computes harmonicRatio as ratio of min to max', () => {
    const h = measureHarmonics('const x = 1')
    expect(h.harmonicRatio).toBeGreaterThanOrEqual(0)
    expect(h.harmonicRatio).toBeLessThanOrEqual(100)
  })
})

// ─── Beat Detection ──────────────────────────────────────────────────────────

describe('detectBeats', () => {
  it('detects no beats in clean code', () => {
    const b = detectBeats('const x = 1')
    expect(b.present).toBe(false)
    expect(b.beatSources).toHaveLength(0)
  })

  it('detects mixed import styles', () => {
    const code = 'import { a } from "b"\nconst c = require("d")'
    const b = detectBeats(code)
    expect(b.present).toBe(true)
    expect(b.beatSources).toContain('mixed-import-styles')
  })

  it('computes beatFrequency from sources', () => {
    const code = 'import { a } from "b"\nconst c = require("d")'
    const b = detectBeats(code)
    expect(b.beatFrequency).toBeGreaterThan(0)
  })
})

// ─── Frequency & Musical Mapping ─────────────────────────────────────────────

describe('computeFrequency', () => {
  it('maps quality to 0-440 Hz', () => {
    const f = computeFrequency(50)
    expect(f.frequency).toBe(220)
  })

  it('returns a note string', () => {
    const f = computeFrequency(50)
    expect(f.note).toBeTruthy()
    expect(f.note.length).toBeLessThanOrEqual(2)
  })

  it('returns an octave number', () => {
    const f = computeFrequency(50)
    expect(typeof f.octave).toBe('number')
  })

  it('returns 0 Hz for zero quality', () => {
    const f = computeFrequency(0)
    expect(f.frequency).toBe(0)
  })

  it('returns 440 Hz for max quality', () => {
    const f = computeFrequency(100)
    expect(f.frequency).toBe(440)
  })
})

// ─── Classification Functions ────────────────────────────────────────────────

describe('classifyPitch', () => {
  it('returns in-tune for >= 80', () => {
    expect(classifyPitch(95)).toBe('in-tune')
    expect(classifyPitch(80)).toBe('in-tune')
  })

  it('returns sharp for 60-79', () => {
    expect(classifyPitch(70)).toBe('sharp')
  })

  it('returns flat for 30-59', () => {
    expect(classifyPitch(40)).toBe('flat')
  })

  it('returns atonal for < 30', () => {
    expect(classifyPitch(20)).toBe('atonal')
  })
})

describe('classifyForkMaterial', () => {
  it('returns steel for high-quality code', () => {
    const code = 'export function calc() { return 1 }'
    expect(classifyForkMaterial(code)).toBe('steel')
  })

  it('returns rubber for empty code', () => {
    expect(classifyForkMaterial('')).toBe('rubber')
  })
})

describe('classifyToneQuality', () => {
  it('returns pure for high metrics without beats', () => {
    expect(classifyToneQuality(80, 80, false, 80)).toBe('pure')
  })

  it('returns noise for very low metrics', () => {
    expect(classifyToneQuality(20, 20, false, 10)).toBe('noise')
  })

  it('returns dissonant for beats with low tuning', () => {
    expect(classifyToneQuality(40, 40, true, 30)).toBe('dissonant')
  })

  it('returns warm for good resonance and ratio', () => {
    expect(classifyToneQuality(65, 50, false, 55)).toBe('warm')
  })
})

describe('classifyCondition', () => {
  it('returns perfect-pitch for >= 85', () => {
    expect(classifyCondition(90)).toBe('perfect-pitch')
  })

  it('returns well-tuned for 65-84', () => {
    expect(classifyCondition(70)).toBe('well-tuned')
  })

  it('returns slightly-off for 45-64', () => {
    expect(classifyCondition(50)).toBe('slightly-off')
  })

  it('returns out-of-tune for 25-44', () => {
    expect(classifyCondition(30)).toBe('out-of-tune')
  })

  it('returns broken for 10-24', () => {
    expect(classifyCondition(15)).toBe('broken')
  })

  it('returns silent for < 10', () => {
    expect(classifyCondition(5)).toBe('silent')
  })
})

describe('classifyMaestroGrade', () => {
  it('returns virtuoso for >= 80', () => {
    expect(classifyMaestroGrade(85)).toBe('virtuoso')
  })

  it('returns concert-master for 65-79', () => {
    expect(classifyMaestroGrade(70)).toBe('concert-master')
  })

  it('returns musician for 45-64', () => {
    expect(classifyMaestroGrade(50)).toBe('musician')
  })

  it('returns student for 25-44', () => {
    expect(classifyMaestroGrade(30)).toBe('student')
  })

  it('returns tone-deaf for 10-24', () => {
    expect(classifyMaestroGrade(15)).toBe('tone-deaf')
  })

  it('returns deaf for < 10', () => {
    expect(classifyMaestroGrade(5)).toBe('deaf')
  })
})

describe('classifyAcousticHealth', () => {
  it('returns concert-hall for >= 80', () => {
    expect(classifyAcousticHealth(85)).toBe('concert-hall')
  })

  it('returns studio for 60-79', () => {
    expect(classifyAcousticHealth(65)).toBe('studio')
  })

  it('returns living-room for 40-59', () => {
    expect(classifyAcousticHealth(45)).toBe('living-room')
  })

  it('returns garage for 25-39', () => {
    expect(classifyAcousticHealth(30)).toBe('garage')
  })

  it('returns warehouse for 10-24', () => {
    expect(classifyAcousticHealth(15)).toBe('warehouse')
  })

  it('returns anechoic for < 10', () => {
    expect(classifyAcousticHealth(5)).toBe('anechoic')
  })
})

// ─── Key Detection ───────────────────────────────────────────────────────────

describe('detectKeySignature', () => {
  it('returns note-style format', () => {
    const key = detectKeySignature('const myVar = 1')
    expect(key).toContain('-')
  })
})

// ─── analyzeTuningResult ─────────────────────────────────────────────────────

describe('analyzeTuningResult', () => {
  it('returns a valid TuningResult', () => {
    const r = analyzeTuningResult('export function calc() { return 1 }', 'calc.ts')
    expect(r.file).toBe('calc.ts')
    expect(typeof r.fundamentalFrequency).toBe('number')
    expect(typeof r.resonanceQuality).toBe('number')
    expect(typeof r.tuningAccuracy).toBe('number')
    expect(typeof r.harmonicContent).toBe('number')
    expect(typeof r.damping).toBe('number')
    expect(typeof r.qualityScore).toBe('number')
  })

  it('populates vibrations', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(r.vibrations).toBeDefined()
    expect(typeof r.vibrations.amplitude).toBe('number')
  })

  it('populates harmonics', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(r.harmonics).toBeDefined()
    expect(typeof r.harmonics.fundamental).toBe('number')
    expect(typeof r.harmonics.overtoneCount).toBe('number')
  })

  it('populates beats', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(r.beats).toBeDefined()
    expect(typeof r.beats.present).toBe('boolean')
    expect(Array.isArray(r.beats.beatSources)).toBe(true)
  })

  it('populates tuning info', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(r.tuning).toBeDefined()
    expect(typeof r.tuning.isInKey).toBe('boolean')
    expect(typeof r.tuning.keySignature).toBe('string')
    expect(typeof r.tuning.tempoConsistency).toBe('number')
    expect(typeof r.tuning.dynamicRange).toBe('number')
  })

  it('populates resonance info', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(r.resonance).toBeDefined()
    expect(typeof r.resonance.isResonant).toBe('boolean')
    expect(typeof r.resonance.isDamped).toBe('boolean')
    expect(typeof r.resonance.isForced).toBe('boolean')
    expect(typeof r.resonance.naturalFrequency).toBe('number')
    expect(typeof r.resonance.resonantFrequency).toBe('number')
  })

  it('classifies forkMaterial', () => {
    const r = analyzeTuningResult('', 'empty.ts')
    expect(['steel', 'aluminum', 'quartz', 'wood', 'plastic', 'rubber']).toContain(r.forkMaterial)
  })

  it('classifies toneQuality', () => {
    const r = analyzeTuningResult('', 'empty.ts')
    expect(['pure', 'warm', 'bright', 'dull', 'harsh', 'dissonant', 'noise']).toContain(r.toneQuality)
  })

  it('classifies condition', () => {
    const r = analyzeTuningResult('', 'empty.ts')
    expect(['perfect-pitch', 'well-tuned', 'slightly-off', 'out-of-tune', 'broken', 'silent']).toContain(r.condition)
  })

  it('populates issues array', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(Array.isArray(r.issues)).toBe(true)
  })

  it('populates harmoniousPatterns array', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(Array.isArray(r.harmoniousPatterns)).toBe(true)
  })

  it('computes frequency, note, octave', () => {
    const r = analyzeTuningResult('const x = 1', 'a.ts')
    expect(typeof r.frequency).toBe('number')
    expect(typeof r.note).toBe('string')
    expect(typeof r.octave).toBe('number')
  })
})

// ─── analyzeResonanceChamber ─────────────────────────────────────────────────

describe('analyzeResonanceChamber', () => {
  it('returns empty chamber for no results', () => {
    const c = analyzeResonanceChamber([], 'empty')
    expect(c.directory).toBe('empty')
    expect(c.results).toHaveLength(0)
    expect(c.chamberResonance).toBe(0)
    expect(c.acousticHealth).toBe('anechoic')
  })

  it('computes averages from results', () => {
    const results = [
      analyzeTuningResult('export function a() { return 1 }', 'a.ts'),
      analyzeTuningResult('export function b() { return 2 }', 'b.ts'),
    ]
    const c = analyzeResonanceChamber(results, 'src')
    expect(c.avgResonance).toBeGreaterThanOrEqual(0)
    expect(c.avgTuningAccuracy).toBeGreaterThanOrEqual(0)
  })

  it('computes dominantNote and dominantKey', () => {
    const results = [analyzeTuningResult('const x = 1', 'a.ts')]
    const c = analyzeResonanceChamber(results, 'src')
    expect(c.dominantNote).toBeTruthy()
    expect(c.dominantKey).toBeTruthy()
  })

  it('computes isHarmonious and isCacophonous', () => {
    const results = [analyzeTuningResult('const x = 1', 'a.ts')]
    const c = analyzeResonanceChamber(results, 'src')
    expect(typeof c.isHarmonious).toBe('boolean')
    expect(typeof c.isCacophonous).toBe('boolean')
  })

  it('classifies acousticHealth', () => {
    const results = [analyzeTuningResult('const x = 1', 'a.ts')]
    const c = analyzeResonanceChamber(results, 'src')
    expect(['concert-hall', 'studio', 'living-room', 'garage', 'warehouse', 'anechoic']).toContain(c.acousticHealth)
  })

  it('computes chamberTuning string', () => {
    const results = [analyzeTuningResult('const x = 1', 'a.ts')]
    const c = analyzeResonanceChamber(results, 'src')
    expect(typeof c.chamberTuning).toBe('string')
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: TuningForkStats = {
    totalFiles: 5, totalChambers: 1, avgFundamentalFrequency: 50,
    avgResonanceQuality: 50, avgTuningAccuracy: 50, avgHarmonicContent: 40,
    avgDamping: 40, perfectPitchCount: 0, wellTunedCount: 3,
    outOfTuneCount: 2, brokenCount: 0, silentCount: 0,
    pureTones: 1, dissonantTones: 1, inKeyCount: 3, beatCount: 1,
    resonantCount: 3, dampedCount: 0, forcedCount: 0,
    steelForks: 2, rubberForks: 0, overallResonance: 50,
    isOrchestral: false, maestroGrade: 'musician',
    bestTuned: 'a.ts', worstTuned: 'b.ts',
    mostResonant: 'a.ts', mostDissonant: 'b.ts',
  }

  const emptyConcert: ConcertInfo = {
    avgResonance: 50, avgTuningAccuracy: 50, dominantNote: 'C',
    isOrchestral: false, totalBeats: 1, isDissonant: false,
  }

  it('returns recommendations for out-of-tune files', () => {
    const recs = generateRecommendations([], [], emptyConcert, emptyStats)
    expect(recs.some(r => r.includes('Out of tune'))).toBe(true)
  })

  it('returns recommendations for good resonance', () => {
    const stats = { ...emptyStats, overallResonance: 75 }
    const recs = generateRecommendations([], [], emptyConcert, stats)
    expect(recs.some(r => r.includes('Good overall resonance'))).toBe(true)
  })

  it('returns recommendations for best tuned file', () => {
    const recs = generateRecommendations([], [], emptyConcert, emptyStats)
    expect(recs.some(r => r.includes('Best tuned'))).toBe(true)
  })

  it('deduplicates recommendations', () => {
    const recs = generateRecommendations([], [], emptyConcert, emptyStats)
    const unique = Array.from(new Set(recs))
    expect(recs).toHaveLength(unique.length)
  })
})

// ─── buildTuningForkResult ───────────────────────────────────────────────────

describe('buildTuningForkResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildTuningForkResult([], [], {})
    expect(result.results).toHaveLength(0)
    expect(result.chambers).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes a single file', () => {
    const result = buildTuningForkResult(
      ['test.ts'],
      ['export function calc() { return 1 }'],
      {},
    )
    expect(result.results).toHaveLength(1)
    expect(result.results[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into chambers', () => {
    const result = buildTuningForkResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const x = 1', 'const y = 2', 'const z = 3'],
      {},
    )
    expect(result.results).toHaveLength(3)
    expect(result.chambers).toHaveLength(2)
  })

  it('computes concert info', () => {
    const result = buildTuningForkResult(
      ['a.ts'],
      ['export function calc() { return 1 }'],
      {},
    )
    expect(result.concert).toBeDefined()
    expect(typeof result.concert.avgResonance).toBe('number')
    expect(typeof result.concert.isOrchestral).toBe('boolean')
    expect(typeof result.concert.isDissonant).toBe('boolean')
  })

  it('computes stats with all fields', () => {
    const result = buildTuningForkResult(
      ['a.ts'],
      ['export function calc() { return 1 }'],
      {},
    )
    const s = result.stats
    expect(s.totalFiles).toBe(1)
    expect(typeof s.avgFundamentalFrequency).toBe('number')
    expect(typeof s.maestroGrade).toBe('string')
    expect(s.bestTuned).toBe('a.ts')
    expect(s.worstTuned).toBe('a.ts')
  })

  it('generates recommendations', () => {
    const result = buildTuningForkResult(['a.ts'], ['const x = 1'], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('uses void options', () => {
    const result = buildTuningForkResult(['a.ts'], ['x'], { foo: 'bar' })
    expect(result.results).toHaveLength(1)
  })

  it('handles file with no slash as root directory', () => {
    const result = buildTuningForkResult(['simple.ts'], ['const x = 1'], {})
    expect(result.chambers.some(c => c.directory === '.')).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('formatTuningForkTable', () => {
  it('returns a string', () => {
    const result = buildTuningForkResult([], [], {})
    const formatted = formatTuningForkTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('includes tuning fork header', () => {
    const result = buildTuningForkResult([], [], {})
    const formatted = formatTuningForkTable(result, false)
    expect(formatted).toContain('Tuning Fork')
  })

  it('shows results when present', () => {
    const result = buildTuningForkResult(['test.ts'], ['const x = 1'], {})
    const formatted = formatTuningForkTable(result, false)
    expect(formatted).toContain('test.ts')
  })

  it('shows verbose details when enabled', () => {
    const result = buildTuningForkResult(['test.ts'], ['const x = 1'], {})
    const short = formatTuningForkTable(result, false)
    const detailed = formatTuningForkTable(result, true)
    expect(detailed.length).toBeGreaterThanOrEqual(short.length)
  })

  it('truncates results in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const result = buildTuningForkResult(files, contents, {})
    const formatted = formatTuningForkTable(result, false)
    expect(formatted).toContain('more')
  })
})

describe('formatTuningForkJson', () => {
  it('returns valid JSON', () => {
    const result = buildTuningForkResult(['a.ts'], ['const x = 1'], {})
    const json = formatTuningForkJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains results array', () => {
    const result = buildTuningForkResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatTuningForkJson(result))
    expect(parsed.results).toHaveLength(1)
  })

  it('contains stats', () => {
    const result = buildTuningForkResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatTuningForkJson(result))
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
