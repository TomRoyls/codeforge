import { describe, expect, it } from 'vitest'

import {
  buildProfile,
  buildResonanceResult,
  classifyTuning,
  computeAmplitude,
  computeInterference,
  computeOverallHarmony,
  computeResonanceScore,
  computeSignalToNoise,
  computeWavelength,
  detectResonances,
  extractFrequencies,
  generateResonanceRecommendations,
  type Frequency,
  type FrequencyCategory,
  type Resonance,
  type ResonanceOptions,
  type ResonanceProfile,
  type ResonanceResult,
  type ResonanceStats,
  type Tuning,
} from '../src/commands/resonance-helpers.js'

import {
  formatFrequencySpectrum,
  formatInterferenceMeter,
  formatProfileBadges,
  formatResonanceJson,
  formatResonanceMatrix,
  formatResonanceRecommendations,
  formatResonanceStats,
  formatResonanceTable,
} from '../src/commands/resonance-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const TYPED_ASYNC = `import type { Config } from './config'
import { format } from './utils'

export interface Options {
  verbose: boolean
  name: string
}

export async function run(opts: Options): Promise<void> {
  try {
    const result = await fetch(opts.name)
    if (result.ok) {
      return
    }
    throw new Error('Failed')
  } catch (e) {
    console.error(e)
  }
}
`

const ANY_CODE = `const x: any = {}
const y: any = null
function process(data: any): any {
  return data
}
`

const MIXED_ASYNC = `async function good() {
  await fetch('/')
}

function bad() {
  fetch('/').then(r => r.json())
}
`

const SIMPLE_CODE = `const x = 1
export { x }
`

const MULTI_FILES = ['app.ts', 'utils.ts', 'types.ts']
const MULTI_CONTENTS = [
  "import { format } from './utils'\nimport type { Config } from './types'\n\nexport async function main(config: Config): Promise<void> {\n  try {\n    const data = await fetch(config.url)\n    if (data.ok) {\n      const result = format(await data.json())\n      return\n    }\n    throw new Error('fail')\n  } catch (e) {\n    console.error(e)\n  }\n}\n",
  "export function format(s: string): string { return s.trim() }\nexport const VERSION = '1.0'\n",
  "export interface Config { url: string; verbose: boolean }\nexport type Result = { ok: boolean; data: unknown }\n",
]

const EMPTY_FILES: string[] = []
const EMPTY_CONTENTS: string[] = []

// ─── extractFrequencies ────────────────────────────────────────────────────────

describe('extractFrequencies', () => {
  it('detects arrow functions', () => {
    const freqs = extractFrequencies('const fn = () => {}', 'app.ts')
    expect(freqs.some(f => f.pattern === 'arrow-function')).toBe(true)
  })

  it('detects function declarations', () => {
    const freqs = extractFrequencies('function hello() {}', 'app.ts')
    expect(freqs.some(f => f.pattern === 'function-decl')).toBe(true)
  })

  it('detects classes', () => {
    const freqs = extractFrequencies('class Engine {}', 'app.ts')
    expect(freqs.some(f => f.pattern === 'class')).toBe(true)
  })

  it('detects async-await', () => {
    const freqs = extractFrequencies('async function go() { await fetch("/") }', 'app.ts')
    expect(freqs.some(f => f.pattern === 'async-await')).toBe(true)
  })

  it('detects try-catch', () => {
    const freqs = extractFrequencies('try { x() } catch (e) {}', 'app.ts')
    expect(freqs.some(f => f.pattern === 'try-catch')).toBe(true)
  })

  it('detects named imports', () => {
    const freqs = extractFrequencies("import { x } from './utils'", 'app.ts')
    expect(freqs.some(f => f.pattern === 'named-import')).toBe(true)
  })

  it('detects type imports', () => {
    const freqs = extractFrequencies("import type { Config } from './types'", 'app.ts')
    expect(freqs.some(f => f.pattern === 'type-import')).toBe(true)
  })

  it('detects explicit types', () => {
    const freqs = extractFrequencies('const x: number = 1', 'app.ts')
    expect(freqs.some(f => f.pattern === 'explicit-type')).toBe(true)
  })

  it('detects interfaces', () => {
    const freqs = extractFrequencies('interface Options { verbose: boolean }', 'app.ts')
    expect(freqs.some(f => f.pattern === 'interface')).toBe(true)
  })

  it('detects type aliases', () => {
    const freqs = extractFrequencies('type Result = string | number', 'app.ts')
    expect(freqs.some(f => f.pattern === 'type-alias')).toBe(true)
  })

  it('detects any type', () => {
    const freqs = extractFrequencies('const x: any = {}', 'app.ts')
    expect(freqs.some(f => f.pattern === 'any-type')).toBe(true)
  })

  it('detects optional chaining', () => {
    const freqs = extractFrequencies('const x = obj?.prop', 'app.ts')
    expect(freqs.some(f => f.pattern === 'optional-chaining')).toBe(true)
  })

  it('detects nullish coalescing', () => {
    const freqs = extractFrequencies('const x = val ?? "default"', 'app.ts')
    expect(freqs.some(f => f.pattern === 'nullish-coalescing')).toBe(true)
  })

  it('returns empty for plain text', () => {
    const freqs = extractFrequencies('just some plain text without code patterns', 'app.ts')
    expect(freqs.length).toBe(0)
  })

  it('each frequency has correct category', () => {
    const freqs = extractFrequencies(TYPED_ASYNC, 'app.ts')
    for (const f of freqs) {
      expect(['structural', 'naming', 'async', 'error', 'import', 'export', 'typing', 'style']).toContain(f.category)
    }
  })

  it('frequencies include the source file', () => {
    const freqs = extractFrequencies('const x: number = 1', 'myapp.ts')
    for (const f of freqs) {
      expect(f.files).toContain('myapp.ts')
    }
  })

  it('detects multiple patterns in complex code', () => {
    const freqs = extractFrequencies(TYPED_ASYNC, 'app.ts')
    const patterns = freqs.map(f => f.pattern)
    expect(patterns).toContain('named-import')
    expect(patterns).toContain('type-import')
    expect(patterns).toContain('interface')
    expect(patterns).toContain('async-await')
    expect(patterns).toContain('try-catch')
  })
})

// ─── computeAmplitude ──────────────────────────────────────────────────────────

describe('computeAmplitude', () => {
  it('returns 0 for zero total', () => {
    expect(computeAmplitude(0, 0)).toBe(0)
  })

  it('computes percentage', () => {
    expect(computeAmplitude(25, 100)).toBe(25)
  })

  it('computes for small ratio', () => {
    expect(computeAmplitude(1, 100)).toBe(1)
  })

  it('caps at 100', () => {
    expect(computeAmplitude(100, 100)).toBe(100)
  })
})

// ─── computeWavelength ─────────────────────────────────────────────────────────

describe('computeWavelength', () => {
  it('returns a number between 0 and 1', () => {
    const wl = computeWavelength('arrow-function', 'structural')
    expect(wl).toBeGreaterThanOrEqual(0)
    expect(wl).toBeLessThanOrEqual(1)
  })

  it('is deterministic', () => {
    const a = computeWavelength('try-catch', 'error')
    const b = computeWavelength('try-catch', 'error')
    expect(a).toBe(b)
  })

  it('different categories have different base positions', () => {
    const structural = computeWavelength('test', 'structural')
    const typing = computeWavelength('test', 'typing')
    expect(structural).not.toBe(typing)
  })
})

// ─── computeResonanceScore ─────────────────────────────────────────────────────

describe('computeResonanceScore', () => {
  it('returns 50 for empty frequencies', () => {
    expect(computeResonanceScore([], 'const x = 1')).toBe(50)
  })

  it('returns higher score for well-typed code', () => {
    const goodFreqs = extractFrequencies('interface Opts { x: number }\nexport function run(o: Opts): void {}', 'a.ts')
    const score = computeResonanceScore(goodFreqs, 'interface Opts { x: number }\nexport function run(o: Opts): void {}')
    expect(score).toBeGreaterThan(50)
  })

  it('returns lower score for any-heavy code', () => {
    const badFreqs = extractFrequencies(ANY_CODE, 'bad.ts')
    const score = computeResonanceScore(badFreqs, ANY_CODE)
    expect(score).toBeLessThan(60)
  })
})

// ─── computeInterference ───────────────────────────────────────────────────────

describe('computeInterference', () => {
  it('returns 50 for neutral content', () => {
    expect(computeInterference('const x = 1')).toBe(50)
  })

  it('returns high for constructive-only code', () => {
    const code = 'try {\n  await fetch("/")\n} catch (e) {}\ninterface Opts { x: number }'
    const interference = computeInterference(code)
    expect(interference).toBeGreaterThan(50)
  })

  it('returns low for destructive code', () => {
    const interference = computeInterference(ANY_CODE)
    expect(interference).toBeLessThan(70)
  })
})

// ─── classifyTuning ────────────────────────────────────────────────────────────

describe('classifyTuning', () => {
  it('classifies well-tuned at >= 70', () => {
    expect(classifyTuning(80)).toBe('well-tuned')
    expect(classifyTuning(70)).toBe('well-tuned')
  })

  it('classifies slightly-off at >= 50', () => {
    expect(classifyTuning(60)).toBe('slightly-off')
    expect(classifyTuning(50)).toBe('slightly-off')
  })

  it('classifies dissonant at >= 30', () => {
    expect(classifyTuning(40)).toBe('dissonant')
    expect(classifyTuning(30)).toBe('dissonant')
  })

  it('classifies cacophonous below 30', () => {
    expect(classifyTuning(20)).toBe('cacophonous')
    expect(classifyTuning(0)).toBe('cacophonous')
  })
})

// ─── computeOverallHarmony ─────────────────────────────────────────────────────

describe('computeOverallHarmony', () => {
  it('returns 50 for empty profiles', () => {
    expect(computeOverallHarmony([])).toBe(50)
  })

  it('averages profile scores', () => {
    const profiles: ResonanceProfile[] = [
      { file: 'a.ts', dominantFrequency: 'x', frequencyCount: 5, resonanceScore: 80, interference: 70, tuning: 'well-tuned' },
      { file: 'b.ts', dominantFrequency: 'y', frequencyCount: 3, resonanceScore: 60, interference: 50, tuning: 'slightly-off' },
    ]
    expect(computeOverallHarmony(profiles)).toBe(70)
  })
})

// ─── computeSignalToNoise ──────────────────────────────────────────────────────

describe('computeSignalToNoise', () => {
  it('returns 0 when no constructive or destructive', () => {
    expect(computeSignalToNoise(0, 0)).toBe(0)
  })

  it('returns 999 when constructive only', () => {
    expect(computeSignalToNoise(5, 0)).toBe(999)
  })

  it('computes ratio', () => {
    expect(computeSignalToNoise(10, 5)).toBe(200) // (10/5)*100
  })

  it('returns small value when mostly destructive', () => {
    expect(computeSignalToNoise(1, 10)).toBe(10)
  })
})

// ─── detectResonances ──────────────────────────────────────────────────────────

describe('detectResonances', () => {
  it('detects constructive resonances', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    const constructive = result.resonances.filter(r => r.type === 'constructive')
    expect(constructive.length).toBeGreaterThan(0)
  })

  it('detects harmonic resonances', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    const harmonic = result.resonances.filter(r => r.type === 'harmonic')
    expect(harmonic.length).toBeGreaterThan(0)
  })

  it('detects destructive resonances', () => {
    const files = ['bad.ts']
    const contents = [ANY_CODE + '\nconst x: number = 1\n']
    const result = buildResonanceResult(files, contents, {})
    const destructive = result.resonances.filter(r => r.type === 'destructive')
    expect(destructive.length).toBeGreaterThan(0)
  })

  it('each resonance has valid properties', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    for (const r of result.resonances) {
      expect(r.patterns).toHaveLength(2)
      expect(['constructive', 'destructive', 'harmonic', 'dissonant']).toContain(r.type)
      expect(r.strength).toBeGreaterThanOrEqual(0)
      expect(r.strength).toBeLessThanOrEqual(100)
      expect(r.files.length).toBeGreaterThan(0)
      expect(r.description.length).toBeGreaterThan(0)
      expect(['positive', 'negative', 'neutral']).toContain(r.impact)
    }
  })
})

// ─── buildProfile ──────────────────────────────────────────────────────────────

describe('buildProfile', () => {
  it('builds profile for typed async code', () => {
    const freqs = extractFrequencies(TYPED_ASYNC, 'app.ts')
    const profile = buildProfile('app.ts', TYPED_ASYNC, freqs)
    expect(profile.file).toBe('app.ts')
    expect(profile.frequencyCount).toBeGreaterThan(0)
    expect(profile.resonanceScore).toBeGreaterThanOrEqual(0)
    expect(profile.resonanceScore).toBeLessThanOrEqual(100)
    expect(['well-tuned', 'slightly-off', 'dissonant', 'cacophonous']).toContain(profile.tuning)
  })

  it('sets dominant frequency to most common pattern', () => {
    const freqs = extractFrequencies(TYPED_ASYNC, 'app.ts')
    const profile = buildProfile('app.ts', TYPED_ASYNC, freqs)
    expect(profile.dominantFrequency).toBeTruthy()
  })

  it('handles empty content', () => {
    const profile = buildProfile('empty.ts', '', [])
    expect(profile.dominantFrequency).toBe('none')
    expect(profile.frequencyCount).toBe(0)
  })
})

// ─── buildResonanceResult ──────────────────────────────────────────────────────

describe('buildResonanceResult', () => {
  it('builds complete result', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.frequencies.length).toBeGreaterThan(0)
    expect(result.resonances.length).toBeGreaterThanOrEqual(0)
    expect(result.profiles).toHaveLength(3)
    expect(result.stats.totalFrequencies).toBeGreaterThan(0)
  })

  it('handles empty file list', () => {
    const result = buildResonanceResult(EMPTY_FILES, EMPTY_CONTENTS, {})
    expect(result.frequencies).toEqual([])
    expect(result.resonances).toEqual([])
    expect(result.profiles).toEqual([])
    expect(result.stats.totalFrequencies).toBe(0)
    expect(result.stats.overallHarmony).toBe(50)
  })

  it('handles single file', () => {
    const result = buildResonanceResult(['app.ts'], [TYPED_ASYNC], {})
    expect(result.profiles).toHaveLength(1)
    expect(result.stats.totalFrequencies).toBeGreaterThan(0)
  })

  it('stats are populated correctly', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.stats.totalFrequencies).toBeGreaterThan(0)
    expect(result.stats.avgResonanceScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgResonanceScore).toBeLessThanOrEqual(100)
    expect(result.stats.dominantFrequency).toBeTruthy()
    expect(result.stats.mostHarmoniousFile).toBeTruthy()
    expect(result.stats.mostDissonantFile).toBeTruthy()
    expect(result.stats.overallHarmony).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallHarmony).toBeLessThanOrEqual(100)
    expect(result.stats.signalToNoiseRatio).toBeGreaterThanOrEqual(0)
  })

  it('frequencies have amplitude and wavelength', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    for (const f of result.frequencies) {
      expect(f.amplitude).toBeGreaterThanOrEqual(0)
      expect(f.amplitude).toBeLessThanOrEqual(100)
      expect(f.wavelength).toBeGreaterThanOrEqual(0)
      expect(f.wavelength).toBeLessThanOrEqual(1)
    }
  })

  it('includes recommendations', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('respects verbose option', () => {
    const opts: ResonanceOptions = { verbose: true }
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, opts)
    expect(result).toBeDefined()
  })

  it('profiles cover all files', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    const profileFiles = result.profiles.map(p => p.file)
    expect(profileFiles).toEqual(MULTI_FILES)
  })
})

// ─── generateResonanceRecommendations ──────────────────────────────────────────

describe('generateResonanceRecommendations', () => {
  const baseStats: ResonanceStats = {
    totalFrequencies: 10,
    constructiveResonances: 3,
    destructiveResonances: 0,
    avgResonanceScore: 70,
    avgInterference: 75,
    dominantFrequency: 'arrow-function',
    rarestFrequency: 'Promise-all',
    mostHarmoniousFile: 'app.ts',
    mostDissonantFile: 'utils.ts',
    overallHarmony: 70,
    signalToNoiseRatio: 500,
  }

  it('recommends breaking destructive resonances', () => {
    const destructive: Resonance = {
      patterns: ['any-type', 'explicit-type'],
      type: 'destructive', strength: 50, files: ['bad.ts'],
      description: 'any undermines explicit types', impact: 'negative',
    }
    const recs = generateResonanceRecommendations([], [destructive], [], baseStats)
    expect(recs.some(r => r.includes('destructive'))).toBe(true)
  })

  it('recommends standardizing dissonant files', () => {
    const profiles: ResonanceProfile[] = [
      { file: 'bad.ts', dominantFrequency: 'x', frequencyCount: 2, resonanceScore: 20, interference: 30, tuning: 'cacophonous' },
    ]
    const recs = generateResonanceRecommendations([], [], profiles, baseStats)
    expect(recs.some(r => r.includes('dissonant') && r.includes('standardize'))).toBe(true)
  })

  it('recommends for low SNR', () => {
    const stats = { ...baseStats, signalToNoiseRatio: 100 }
    const recs = generateResonanceRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('signal-to-noise'))).toBe(true)
  })

  it('recommends for low harmony', () => {
    const stats = { ...baseStats, overallHarmony: 40 }
    const recs = generateResonanceRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('harmony'))).toBe(true)
  })

  it('recommends for dissonant resonances', () => {
    const dissonant: Resonance = {
      patterns: ['function-decl', 'arrow-function'],
      type: 'dissonant', strength: 30, files: ['mixed.ts'],
      description: 'mixed style', impact: 'negative',
    }
    const recs = generateResonanceRecommendations([], [dissonant], [], baseStats)
    expect(recs.some(r => r.includes('dissonant'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const recs = generateResonanceRecommendations([], [], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatFrequencySpectrum', () => {
  it('shows message for no patterns', () => {
    expect(formatFrequencySpectrum([])).toContain('No patterns')
  })

  it('formats frequencies with bars', () => {
    const freqs: Frequency[] = [
      { pattern: 'arrow-function', category: 'structural', occurrences: 10, files: ['a.ts'], amplitude: 50, wavelength: 0.1 },
    ]
    const output = formatFrequencySpectrum(freqs)
    expect(output).toContain('arrow-function')
    expect(output).toContain('10')
  })

  it('truncates many frequencies', () => {
    const freqs = Array.from({ length: 20 }, (_, i) => ({
      pattern: `pattern-${i}`, category: 'structural' as FrequencyCategory, occurrences: 20 - i, files: ['a.ts'], amplitude: 5, wavelength: 0.1,
    }))
    const output = formatFrequencySpectrum(freqs)
    expect(output).toContain('more')
  })
})

describe('formatResonanceMatrix', () => {
  it('shows message for no resonances', () => {
    expect(formatResonanceMatrix([])).toContain('No resonances')
  })

  it('formats resonances by type', () => {
    const resonances: Resonance[] = [
      { patterns: ['try-catch', 'async-await'], type: 'constructive', strength: 80, files: ['a.ts'], description: 'test', impact: 'positive' },
    ]
    const output = formatResonanceMatrix(resonances)
    expect(output).toContain('CONSTRUCTIVE')
    expect(output).toContain('try-catch')
  })
})

describe('formatProfileBadges', () => {
  it('shows message for no profiles', () => {
    expect(formatProfileBadges([])).toContain('No profiles')
  })

  it('formats profiles with tuning badges', () => {
    const profiles: ResonanceProfile[] = [
      { file: 'app.ts', dominantFrequency: 'arrow-function', frequencyCount: 5, resonanceScore: 80, interference: 70, tuning: 'well-tuned' },
    ]
    const output = formatProfileBadges(profiles)
    expect(output).toContain('app.ts')
    expect(output).toContain('well-tuned')
  })
})

describe('formatInterferenceMeter', () => {
  it('formats full interference', () => {
    const output = formatInterferenceMeter(100)
    expect(output).toContain('100%')
    expect(output).toContain('█')
  })

  it('formats partial interference', () => {
    const output = formatInterferenceMeter(50)
    expect(output).toContain('50%')
    expect(output).toContain('░')
  })
})

describe('formatResonanceStats', () => {
  it('formats all stats', () => {
    const stats: ResonanceStats = {
      totalFrequencies: 15, constructiveResonances: 4, destructiveResonances: 1,
      avgResonanceScore: 72, avgInterference: 68, dominantFrequency: 'arrow-function',
      rarestFrequency: 'Promise-all', mostHarmoniousFile: 'app.ts', mostDissonantFile: 'bad.ts',
      overallHarmony: 72, signalToNoiseRatio: 400,
    }
    const output = formatResonanceStats(stats)
    expect(output).toContain('15')
    expect(output).toContain('arrow-function')
    expect(output).toContain('72/100')
  })
})

describe('formatResonanceRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatResonanceRecommendations([])).toBe('')
  })

  it('formats recommendations', () => {
    const output = formatResonanceRecommendations(['Fix patterns', 'Reduce any'])
    expect(output).toContain('Fix patterns')
    expect(output).toContain('→')
  })
})

describe('formatResonanceTable', () => {
  it('formats full result', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    const output = formatResonanceTable(result)
    expect(output).toContain('Resonance')
    expect(output).toContain('Spectrum')
  })
})

describe('formatResonanceJson', () => {
  it('produces valid JSON', () => {
    const result = buildResonanceResult(MULTI_FILES, MULTI_CONTENTS, {})
    const json = formatResonanceJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.frequencies.length).toBeGreaterThan(0)
    expect(parsed.profiles).toHaveLength(3)
  })
})
