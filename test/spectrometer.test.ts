import { describe, expect, it } from 'vitest'

import {
  analyzeConventionBand,
  analyzeIdiomBand,
  analyzeKeywordBand,
  analyzePatternBand,
  analyzeSyntaxBand,
  buildBands,
  buildSpectrumResult,
  computeSpectralEntropy,
  computeSpectralLines,
  computeSpectralPurity,
  computeSignalToNoise,
  detectAnomalies,
  generateRecommendations,
  makeLine,
  type SpectralLine,
  type SpectrumStats,
} from '../src/commands/spectrometer-helpers.js'

import {
  formatAnomalyAlerts,
  formatBandBreakdown,
  formatPurityMeter,
  formatRecommendations,
  formatSpectralLineTable,
  formatSpectrumChart,
  formatSpectrumJSON,
  formatSpectrumStats,
  formatSpectrumTable,
  getBandColor,
} from '../src/commands/spectrometer-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const RICH_CONTENT = `import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

/**
 * A well-documented function.
 */
export async function processData(config: Config): Promise<string> {
  if (!config) return 'empty'

  try {
    const result = await fetch('/api')
    const data = await result.json()
    return data?.name ?? 'unknown'
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    return 'failed'
  }
}

export function createBuilder(): Builder {
  return new Builder()
    .setName('test')
    .setValue(42)
}

const items = [1, 2, 3]
const [first, ...rest] = items
const obj = { ...config, extra: true }
const msg = \`Hello \${name}\`

const MAX_RETRIES = 3
const DEFAULT_NAME = 'app'

switch (action) {
  case 'create': return createItem()
  case 'delete': return deleteItem()
  default: return null
}
`

const MINIMAL_CONTENT = 'const x = 1\n'

const EMPTY_CONTENT = ''

const EVAL_CONTENT = 'const result = eval("1+1")\nconst data = input as any\n'

// ─── analyzeSyntaxBand ────────────────────────────────────────────────────────

describe('analyzeSyntaxBand', () => {
  it('returns 8 syntax lines', () => {
    const lines = analyzeSyntaxBand(RICH_CONTENT, 'a.ts')
    expect(lines.length).toBe(8)
  })

  it('detects arrow functions', () => {
    const lines = analyzeSyntaxBand('const f = () => 1\nconst g = (x) => x', 'a.ts')
    const arrows = lines.find((l) => l.name === 'arrow-functions')!
    expect(arrows.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects function declarations', () => {
    const lines = analyzeSyntaxBand('function foo() {}\nfunction bar() {}', 'a.ts')
    const funcs = lines.find((l) => l.name === 'function-declarations')!
    expect(funcs.frequency).toBe(2)
  })

  it('detects classes', () => {
    const lines = analyzeSyntaxBand('class Foo {} class Bar {}', 'a.ts')
    const classes = lines.find((l) => l.name === 'classes')!
    expect(classes.frequency).toBe(2)
  })

  it('detects template literals', () => {
    const lines = analyzeSyntaxBand('const x = `hello ${name}`', 'a.ts')
    const tl = lines.find((l) => l.name === 'template-literals')!
    expect(tl.frequency).toBe(1)
  })

  it('detects spread operator', () => {
    const lines = analyzeSyntaxBand('const a = [...items]', 'a.ts')
    const spread = lines.find((l) => l.name === 'spread-operator')!
    expect(spread.frequency).toBe(1)
  })

  it('detects destructuring', () => {
    const lines = analyzeSyntaxBand('const { a, b } = obj\nconst [x] = arr', 'a.ts')
    const destr = lines.find((l) => l.name === 'destructuring')!
    expect(destr.frequency).toBe(2)
  })

  it('returns 0 for empty content', () => {
    const lines = analyzeSyntaxBand('', 'a.ts')
    for (const line of lines) {
      expect(line.frequency).toBe(0)
    }
  })
})

// ─── analyzeKeywordBand ───────────────────────────────────────────────────────

describe('analyzeKeywordBand', () => {
  it('returns 10 keyword lines', () => {
    const lines = analyzeKeywordBand(RICH_CONTENT, 'a.ts')
    expect(lines.length).toBe(10)
  })

  it('detects async/await', () => {
    const lines = analyzeKeywordBand('async function f() { await x }', 'a.ts')
    const asyncAwait = lines.find((l) => l.name === 'async-await')!
    expect(asyncAwait.frequency).toBe(1)
  })

  it('detects try-catch', () => {
    const lines = analyzeKeywordBand('try {} catch (e) {}', 'a.ts')
    const tc = lines.find((l) => l.name === 'try-catch')!
    expect(tc.frequency).toBe(1)
  })

  it('detects if-else', () => {
    const lines = analyzeKeywordBand('if (x) {} else {}', 'a.ts')
    const ie = lines.find((l) => l.name === 'if-else')!
    expect(ie.frequency).toBe(1)
  })

  it('detects switch', () => {
    const lines = analyzeKeywordBand(RICH_CONTENT, 'a.ts')
    const sw = lines.find((l) => l.name === 'switch')!
    expect(sw.frequency).toBe(1)
  })

  it('detects typeof', () => {
    const lines = analyzeKeywordBand('if (typeof x === "string") {}', 'a.ts')
    const tp = lines.find((l) => l.name === 'typeof')!
    expect(tp.frequency).toBe(1)
  })

  it('detects instanceof', () => {
    const lines = analyzeKeywordBand('if (x instanceof Error) {}', 'a.ts')
    const inst = lines.find((l) => l.name === 'instanceof')!
    expect(inst.frequency).toBe(1)
  })
})

// ─── analyzePatternBand ───────────────────────────────────────────────────────

describe('analyzePatternBand', () => {
  it('returns 7 pattern lines', () => {
    const lines = analyzePatternBand(RICH_CONTENT, 'a.ts')
    expect(lines.length).toBe(7)
  })

  it('detects factory patterns', () => {
    const lines = analyzePatternBand('function createItem() {} function makeThing() {}', 'a.ts')
    const factory = lines.find((l) => l.name === 'factory')!
    expect(factory.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects builder patterns', () => {
    const lines = analyzePatternBand('.setName("x").setValue(1)', 'a.ts')
    const builder = lines.find((l) => l.name === 'builder')!
    expect(builder.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects observer patterns', () => {
    const lines = analyzePatternBand('subscribe(handler)\nemit("event")', 'a.ts')
    const observer = lines.find((l) => l.name === 'observer')!
    expect(observer.frequency).toBeGreaterThanOrEqual(1)
  })

  it('returns 0 for minimal content', () => {
    const lines = analyzePatternBand(MINIMAL_CONTENT, 'a.ts')
    const total = lines.reduce((s, l) => s + l.frequency, 0)
    expect(total).toBe(0)
  })
})

// ─── analyzeConventionBand ────────────────────────────────────────────────────

describe('analyzeConventionBand', () => {
  it('returns 5 convention lines', () => {
    const lines = analyzeConventionBand(RICH_CONTENT, 'a.ts')
    expect(lines.length).toBe(5)
  })

  it('detects camelCase', () => {
    const lines = analyzeConventionBand('const myVariable = 1', 'a.ts')
    const cc = lines.find((l) => l.name === 'camelCase')!
    expect(cc.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects PascalCase', () => {
    const lines = analyzeConventionBand('class MyClass {}', 'a.ts')
    const pc = lines.find((l) => l.name === 'PascalCase')!
    expect(pc.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects UPPER_SNAKE', () => {
    const lines = analyzeConventionBand('const MAX_RETRIES = 3', 'a.ts')
    const us = lines.find((l) => l.name === 'UPPER_SNAKE')!
    expect(us.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects dot notation', () => {
    const lines = analyzeConventionBand('obj.property\narr.length', 'a.ts')
    const dot = lines.find((l) => l.name === 'dot-notation')!
    expect(dot.frequency).toBeGreaterThanOrEqual(1)
  })
})

// ─── analyzeIdiomBand ─────────────────────────────────────────────────────────

describe('analyzeIdiomBand', () => {
  it('returns 6 idiom lines', () => {
    const lines = analyzeIdiomBand(RICH_CONTENT, 'a.ts')
    expect(lines.length).toBe(6)
  })

  it('detects optional chaining', () => {
    const lines = analyzeIdiomBand('const x = obj?.name', 'a.ts')
    const oc = lines.find((l) => l.name === 'optional-chaining')!
    expect(oc.frequency).toBe(1)
  })

  it('detects nullish coalescing', () => {
    const lines = analyzeIdiomBand('const x = val ?? "default"', 'a.ts')
    const nc = lines.find((l) => l.name === 'nullish-coalescing')!
    expect(nc.frequency).toBe(1)
  })

  it('detects guard clause', () => {
    const lines = analyzeIdiomBand('if (!config) { return }', 'a.ts')
    const gc = lines.find((l) => l.name === 'guard-clause')!
    expect(gc.frequency).toBe(1)
  })

  it('detects null check', () => {
    const lines = analyzeIdiomBand('if (x !== null) {}', 'a.ts')
    const nc = lines.find((l) => l.name === 'null-check')!
    expect(nc.frequency).toBeGreaterThanOrEqual(1)
  })
})

// ─── makeLine ─────────────────────────────────────────────────────────────────

describe('makeLine', () => {
  it('creates a spectral line', () => {
    const line = makeLine('test', 'syntax', 5, 'a.ts')
    expect(line.name).toBe('test')
    expect(line.category).toBe('syntax')
    expect(line.frequency).toBe(5)
    expect(line.files).toEqual(['a.ts'])
  })

  it('creates line with empty files for zero frequency', () => {
    const line = makeLine('test', 'syntax', 0, 'a.ts')
    expect(line.files).toEqual([])
  })
})

// ─── computeSpectralLines ─────────────────────────────────────────────────────

describe('computeSpectralLines', () => {
  it('merges lines with same name', () => {
    const raw = [
      makeLine('arrow-functions', 'syntax', 3, 'a.ts'),
      makeLine('arrow-functions', 'syntax', 2, 'b.ts'),
    ]
    const spectrum = computeSpectralLines(raw)
    const af = spectrum.find((l) => l.name === 'arrow-functions')!
    expect(af.frequency).toBe(5)
    expect(af.files).toContain('a.ts')
    expect(af.files).toContain('b.ts')
  })

  it('computes intensity relative to max', () => {
    const raw = [
      makeLine('a', 'syntax', 10, 'x.ts'),
      makeLine('b', 'syntax', 5, 'x.ts'),
    ]
    const spectrum = computeSpectralLines(raw)
    const a = spectrum.find((l) => l.name === 'a')!
    const b = spectrum.find((l) => l.name === 'b')!
    expect(a.intensity).toBe(100)
    expect(b.intensity).toBe(50)
  })

  it('sorts by frequency descending', () => {
    const raw = [
      makeLine('a', 'syntax', 1, 'x.ts'),
      makeLine('b', 'syntax', 10, 'x.ts'),
    ]
    const spectrum = computeSpectralLines(raw)
    expect(spectrum[0]!.name).toBe('b')
  })

  it('handles empty input', () => {
    expect(computeSpectralLines([])).toEqual([])
  })
})

// ─── buildBands ───────────────────────────────────────────────────────────────

describe('buildBands', () => {
  it('creates 5 bands', () => {
    const spectrum = [makeLine('a', 'syntax', 1, 'x.ts'), makeLine('b', 'keyword', 1, 'x.ts')]
    const bands = buildBands(spectrum)
    expect(bands.length).toBe(5)
  })

  it('assigns lines to correct band', () => {
    const spectrum = [makeLine('a', 'syntax', 5, 'x.ts'), makeLine('b', 'syntax', 2, 'x.ts')]
    const bands = buildBands(spectrum)
    const syntax = bands.find((b) => b.name === 'Syntax')!
    expect(syntax.lines.length).toBe(2)
    expect(syntax.dominantLine).toBe('a')
  })
})

// ─── computeSpectralPurity ────────────────────────────────────────────────────

describe('computeSpectralPurity', () => {
  it('returns 100 for empty spectrum', () => {
    expect(computeSpectralPurity([])).toBe(100)
  })

  it('returns high purity for uniform frequencies', () => {
    const spectrum = Array.from({ length: 5 }, (_, i) => ({ ...makeLine(`l${i}`, 'syntax', 10, 'x.ts') }))
    expect(computeSpectralPurity(spectrum)).toBe(100)
  })

  it('returns low purity for skewed frequencies', () => {
    const spectrum = [
      { ...makeLine('a', 'syntax', 100, 'x.ts') },
      { ...makeLine('b', 'syntax', 1, 'x.ts') },
    ]
    expect(computeSpectralPurity(spectrum)).toBeLessThan(50)
  })
})

// ─── computeSpectralEntropy ───────────────────────────────────────────────────

describe('computeSpectralEntropy', () => {
  it('returns 0 for empty spectrum', () => {
    expect(computeSpectralEntropy([])).toBe(0)
  })

  it('returns 0 for single dominant pattern', () => {
    const spectrum = [{ ...makeLine('a', 'syntax', 10, 'x.ts') }]
    expect(computeSpectralEntropy(spectrum)).toBe(0)
  })

  it('returns positive entropy for diverse spectrum', () => {
    const spectrum = [
      { ...makeLine('a', 'syntax', 5, 'x.ts') },
      { ...makeLine('b', 'syntax', 5, 'x.ts') },
    ]
    expect(computeSpectralEntropy(spectrum)).toBe(1)
  })

  it('increases with more patterns', () => {
    const even2 = [{ ...makeLine('a', 'syntax', 5, 'x') }, { ...makeLine('b', 'syntax', 5, 'x') }]
    const even4 = [{ ...makeLine('a', 'syntax', 5, 'x') }, { ...makeLine('b', 'syntax', 5, 'x') }, { ...makeLine('c', 'syntax', 5, 'x') }, { ...makeLine('d', 'syntax', 5, 'x') }]
    expect(computeSpectralEntropy(even4)).toBeGreaterThan(computeSpectralEntropy(even2))
  })
})

// ─── computeSignalToNoise ─────────────────────────────────────────────────────

describe('computeSignalToNoise', () => {
  it('returns 0 for empty spectrum', () => {
    expect(computeSignalToNoise([])).toBe(0)
  })

  it('computes ratio correctly', () => {
    const spectrum = [
      { ...makeLine('a', 'syntax', 90, 'x.ts') },
      { ...makeLine('b', 'syntax', 10, 'x.ts') },
    ]
    const snr = computeSignalToNoise(spectrum)
    expect(snr).toBe(9)
  })

  it('returns high for dominant pattern', () => {
    const spectrum = [
      { ...makeLine('a', 'syntax', 99, 'x.ts') },
      { ...makeLine('b', 'syntax', 1, 'x.ts') },
    ]
    expect(computeSignalToNoise(spectrum)).toBeGreaterThan(10)
  })
})

// ─── detectAnomalies ──────────────────────────────────────────────────────────

describe('detectAnomalies', () => {
  it('detects forbidden eval()', () => {
    const spectrum = [{ ...makeLine('a', 'syntax', 1, 'x.ts') }]
    const anomalies = detectAnomalies(spectrum, ['evil.ts'], [EVAL_CONTENT])
    const evalAnomaly = anomalies.find((a) => a.pattern === 'eval()')
    expect(evalAnomaly).toBeDefined()
    expect(evalAnomaly!.severity).toBe('critical')
  })

  it('detects forbidden as any', () => {
    const spectrum = [{ ...makeLine('a', 'syntax', 1, 'x.ts') }]
    const anomalies = detectAnomalies(spectrum, ['evil.ts'], [EVAL_CONTENT])
    const asAny = anomalies.find((a) => a.pattern === 'as any')
    expect(asAny).toBeDefined()
    expect(asAny!.severity).toBe('warning')
  })

  it('detects missing expected patterns', () => {
    const spectrum = [{ ...makeLine('arrow-functions', 'syntax', 5, 'x.ts') }]
    const anomalies = detectAnomalies(spectrum, ['a.ts'], ['const x = 1'])
    const missing = anomalies.filter((a) => a.type === 'missing-expected')
    expect(missing.length).toBeGreaterThan(0)
  })

  it('detects unexpected spikes', () => {
    const spectrum = [{ ...makeLine('a', 'syntax', 100, 'x.ts'), intensity: 100 }]
    const anomalies = detectAnomalies(spectrum, ['x.ts'], ['code'])
    const spike = anomalies.find((a) => a.type === 'unexpected-spike')
    expect(spike).toBeDefined()
  })

  it('returns empty for clean code', () => {
    const spectrum = [
      { ...makeLine('camelCase', 'convention', 5, 'x.ts') },
      { ...makeLine('PascalCase', 'convention', 3, 'x.ts') },
      { ...makeLine('if-else', 'keyword', 2, 'x.ts') },
      { ...makeLine('function-declarations', 'syntax', 2, 'x.ts') },
    ]
    const anomalies = detectAnomalies(spectrum, ['x.ts'], ['clean code'])
    const forbidden = anomalies.filter((a) => a.type === 'forbidden')
    expect(forbidden.length).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about low purity', () => {
    const stats = { spectralPurity: 30, entropy: 2, signalToNoise: 1 } as SpectrumStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('Low spectral purity'))).toBe(true)
  })

  it('warns about forbidden patterns', () => {
    const stats = { spectralPurity: 80, entropy: 2, signalToNoise: 1 } as SpectrumStats
    const anomalies = [{ type: 'forbidden' as const, pattern: 'eval', expected: '', actual: '', severity: 'critical' as const, files: [] }]
    const recs = generateRecommendations([], anomalies, stats)
    expect(recs.some((r) => r.includes('forbidden'))).toBe(true)
  })

  it('praises clean spectrum', () => {
    const stats = { spectralPurity: 90, entropy: 2, signalToNoise: 2 } as SpectrumStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('clean'))).toBe(true)
  })

  it('warns about high entropy', () => {
    const stats = { spectralPurity: 70, entropy: 5, signalToNoise: 1 } as SpectrumStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('entropy'))).toBe(true)
  })
})

// ─── buildSpectrumResult ──────────────────────────────────────────────────────

describe('buildSpectrumResult', () => {
  it('builds result from files', () => {
    const result = buildSpectrumResult(['a.ts'], [RICH_CONTENT])
    expect(result.spectrum.length).toBeGreaterThan(0)
    expect(result.bands.length).toBe(5)
    expect(result.stats.uniquePatterns).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildSpectrumResult([], [])
    expect(result.spectrum.length).toBe(0)
    expect(result.stats.dominantWavelength).toBe('N/A')
    expect(result.stats.spectralPurity).toBe(100)
  })

  it('handles minimal file', () => {
    const result = buildSpectrumResult(['a.ts'], [MINIMAL_CONTENT])
    expect(result.spectrum.length).toBe(36)
    expect(result.stats.uniquePatterns).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', () => {
    const result = buildSpectrumResult(['a.ts'], [RICH_CONTENT])
    expect(result.stats.totalLines).toBeGreaterThan(0)
    expect(result.stats.dominantWavelength).toBeTruthy()
    expect(result.stats.noisiestBand).toBeTruthy()
    expect(result.stats.cleanestBand).toBeTruthy()
    expect(result.stats.spectralPurity).toBeGreaterThanOrEqual(0)
    expect(result.stats.spectralPurity).toBeLessThanOrEqual(100)
  })

  it('detects anomalies in eval code', () => {
    const result = buildSpectrumResult(['evil.ts'], [EVAL_CONTENT])
    const forbidden = result.anomalies.filter((a) => a.type === 'forbidden')
    expect(forbidden.length).toBeGreaterThanOrEqual(1)
  })

  it('generates recommendations', () => {
    const result = buildSpectrumResult(['a.ts'], [RICH_CONTENT])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('merges across multiple files', () => {
    const result = buildSpectrumResult(['a.ts', 'b.ts'], [RICH_CONTENT, RICH_CONTENT])
    const funcs = result.spectrum.find((l) => l.name === 'function-declarations')
    expect(funcs!.files.length).toBe(2)
    expect(funcs!.frequency).toBeGreaterThanOrEqual(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getBandColor', () => {
  it('returns function for all categories', () => {
    expect(typeof getBandColor('syntax')).toBe('function')
    expect(typeof getBandColor('keyword')).toBe('function')
    expect(typeof getBandColor('pattern')).toBe('function')
    expect(typeof getBandColor('convention')).toBe('function')
    expect(typeof getBandColor('idiom')).toBe('function')
  })
})

describe('formatSpectrumChart', () => {
  it('formats chart', () => {
    const spectrum = [{ ...makeLine('test', 'syntax', 10, 'a.ts'), intensity: 100 }]
    const output = formatSpectrumChart(spectrum)
    expect(output).toContain('Spectrum Chart')
    expect(output).toContain('test')
  })

  it('handles empty', () => {
    expect(formatSpectrumChart([])).toContain('No spectral data')
  })
})

describe('formatBandBreakdown', () => {
  it('formats bands', () => {
    const bands = buildBands([{ ...makeLine('a', 'syntax', 5, 'x.ts') }])
    const output = formatBandBreakdown(bands)
    expect(output).toContain('Band Breakdown')
    expect(output).toContain('Syntax')
  })
})

describe('formatSpectralLineTable', () => {
  it('formats table', () => {
    const spectrum = [{ ...makeLine('arrow-functions', 'syntax', 10, 'a.ts'), intensity: 100 }]
    const output = formatSpectralLineTable(spectrum)
    expect(output).toContain('Spectral Lines')
    expect(output).toContain('arrow-functions')
  })

  it('handles empty', () => {
    expect(formatSpectralLineTable([])).toContain('No spectral lines')
  })
})

describe('formatPurityMeter', () => {
  it('formats meter', () => {
    const output = formatPurityMeter(85)
    expect(output).toContain('85%')
    expect(output).toContain('█')
  })
})

describe('formatSpectrumStats', () => {
  it('formats stats', () => {
    const stats = {
      totalLines: 100, dominantWavelength: 'camelCase', noisiestBand: 'Syntax',
      cleanestBand: 'Idioms', spectralPurity: 75, entropy: 3.5, uniquePatterns: 25, signalToNoise: 2.5,
    }
    const output = formatSpectrumStats(stats)
    expect(output).toContain('100')
    expect(output).toContain('camelCase')
    expect(output).toContain('75%')
  })
})

describe('formatAnomalyAlerts', () => {
  it('formats anomalies', () => {
    const anomalies = [{ type: 'forbidden' as const, pattern: 'eval()', expected: 'none', actual: 'found', severity: 'critical' as const, files: ['a.ts'] }]
    const output = formatAnomalyAlerts(anomalies)
    expect(output).toContain('eval()')
    expect(output).toContain('a.ts')
  })

  it('handles empty', () => {
    expect(formatAnomalyAlerts([])).toContain('No anomalies')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix this'])
    expect(output).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatSpectrumTable', () => {
  it('formats full table', () => {
    const result = buildSpectrumResult(['a.ts'], [RICH_CONTENT])
    const output = formatSpectrumTable(result)
    expect(output).toContain('Code Spectrometer')
    expect(output).toContain('Spectrum Chart')
    expect(output).toContain('Band Breakdown')
  })
})

describe('formatSpectrumJSON', () => {
  it('formats valid JSON', () => {
    const result = buildSpectrumResult(['a.ts'], [RICH_CONTENT])
    const json = formatSpectrumJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.spectrum).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.bands.length).toBe(5)
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes a realistic codebase', () => {
    const result = buildSpectrumResult(
      ['commands.ts', 'helpers.ts'],
      [RICH_CONTENT, RICH_CONTENT],
    )
    expect(result.spectrum.length).toBe(36)
    expect(result.bands.length).toBe(5)
    expect(result.stats.uniquePatterns).toBeGreaterThan(5)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('has consistent band structure', () => {
    const result = buildSpectrumResult(['a.ts'], [RICH_CONTENT])
    const bandNames = result.bands.map((b) => b.name)
    expect(bandNames).toContain('Syntax')
    expect(bandNames).toContain('Keywords')
    expect(bandNames).toContain('Patterns')
    expect(bandNames).toContain('Conventions')
    expect(bandNames).toContain('Idioms')
  })
})
