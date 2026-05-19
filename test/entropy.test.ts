import { describe, it, expect } from 'vitest'

import {
  computeShannonEntropy,
  computeCharacterEntropy,
  computeTokenEntropy,
  computeLineLengthEntropy,
  computeNamingEntropy,
  computeOverallEntropy,
  classifyEntropy,
  computeDistribution,
  detectAnomalies,
  computeEntropyStats,
  generateEntropyRecommendations,
  buildEntropyResult,
  type FileEntropy,
  type EntropyStats,
  type EntropyDistribution,
} from '../src/commands/entropy-helpers.js'

import {
  formatEntropyTable,
  formatDistributionHistogram,
  formatAnomalousFiles,
  formatEntropySpectrum,
  formatStatsLine,
  formatEntropyResultTable,
  formatEntropyJson,
  formatEntropyCsv,
} from '../src/commands/entropy-format-helpers.js'

// ─── computeShannonEntropy ────────────────────────────────────────────────────

describe('computeShannonEntropy', () => {
  it('returns 0 for empty map', () => {
    expect(computeShannonEntropy(new Map())).toBe(0)
  })

  it('returns 0 for single value', () => {
    expect(computeShannonEntropy(new Map([['a', 10]]))).toBe(0)
  })

  it('computes entropy for uniform distribution', () => {
    const freq = new Map([['a', 1], ['b', 1], ['c', 1], ['d', 1]])
    expect(computeShannonEntropy(freq)).toBe(2)
  })

  it('computes entropy for non-uniform distribution', () => {
    const freq = new Map([['a', 5], ['b', 3], ['c', 2]])
    const entropy = computeShannonEntropy(freq)
    expect(entropy).toBeGreaterThan(0)
    expect(entropy).toBeLessThan(2)
  })

  it('computes entropy for two equal values', () => {
    const freq = new Map([['a', 5], ['b', 5]])
    expect(computeShannonEntropy(freq)).toBe(1)
  })

  it('handles large frequency differences', () => {
    const freq = new Map([['a', 99], ['b', 1]])
    const entropy = computeShannonEntropy(freq)
    expect(entropy).toBeGreaterThan(0)
    expect(entropy).toBeLessThan(1)
  })

  it('rounds to 3 decimal places', () => {
    const freq = new Map([['a', 7], ['b', 3]])
    const entropy = computeShannonEntropy(freq)
    const decimals = String(entropy).split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(3)
  })
})

// ─── computeCharacterEntropy ──────────────────────────────────────────────────

describe('computeCharacterEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(computeCharacterEntropy('')).toBe(0)
  })

  it('returns 0 for single character repeated', () => {
    expect(computeCharacterEntropy('aaaaa')).toBe(0)
  })

  it('computes entropy for varied text', () => {
    const entropy = computeCharacterEntropy('hello world')
    expect(entropy).toBeGreaterThan(0)
    expect(entropy).toBeLessThan(8)
  })

  it('higher entropy for more diverse characters', () => {
    const low = computeCharacterEntropy('aaaaabbbb')
    const high = computeCharacterEntropy('abcdefghij')
    expect(high).toBeGreaterThan(low)
  })

  it('handles special characters', () => {
    const entropy = computeCharacterEntropy('!@#$%^&*()')
    expect(entropy).toBeGreaterThan(0)
  })
})

// ─── computeTokenEntropy ──────────────────────────────────────────────────────

describe('computeTokenEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(computeTokenEntropy('')).toBe(0)
  })

  it('returns 0 for repeated single token', () => {
    expect(computeTokenEntropy('const const const')).toBe(0)
  })

  it('computes entropy for varied tokens', () => {
    const entropy = computeTokenEntropy('const x = 1; let y = 2; var z = 3;')
    expect(entropy).toBeGreaterThan(0)
  })

  it('higher entropy for diverse vocabulary', () => {
    const low = computeTokenEntropy('x x x y y y')
    const high = computeTokenEntropy('alpha beta gamma delta epsilon zeta eta theta')
    expect(high).toBeGreaterThan(low)
  })

  it('handles code-like content', () => {
    const entropy = computeTokenEntropy('function foo(bar) { return bar + 1; }')
    expect(entropy).toBeGreaterThan(0)
  })
})

// ─── computeLineLengthEntropy ──────────────────────────────────────────────────

describe('computeLineLengthEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(computeLineLengthEntropy('')).toBe(0)
  })

  it('returns 0 for uniform line lengths', () => {
    expect(computeLineLengthEntropy('abcde\nabcde\nabcde')).toBe(0)
  })

  it('computes entropy for varied line lengths', () => {
    const entropy = computeLineLengthEntropy('short\nmedium length line\nvery very long line here')
    expect(entropy).toBeGreaterThan(0)
  })

  it('buckets lines by 10-char ranges', () => {
    const lines = '0123456789\n01234567890123456789\n01'
    const entropy = computeLineLengthEntropy(lines)
    expect(entropy).toBeGreaterThan(0)
  })

  it('higher entropy for diverse lengths', () => {
    const low = computeLineLengthEntropy('aaaa\naaaa\naaaa')
    const high = computeLineLengthEntropy('a\naaaaaaaaaaaaaaaa\naaaaaaaaaaaaaa\naaaaa')
    expect(high).toBeGreaterThan(low)
  })
})

// ─── computeNamingEntropy ─────────────────────────────────────────────────────

describe('computeNamingEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(computeNamingEntropy('')).toBe(0)
  })

  it('returns 0 for repeated name', () => {
    expect(computeNamingEntropy('x = x + x')).toBe(0)
  })

  it('computes entropy for varied names', () => {
    const entropy = computeNamingEntropy('const foo = 1; const bar = 2; const baz = 3;')
    expect(entropy).toBeGreaterThan(0)
  })

  it('higher entropy for diverse identifiers', () => {
    const low = computeNamingEntropy('x = x + x * x')
    const high = computeNamingEntropy('calculateTotal applyDiscount formatCurrency validateInput')
    expect(high).toBeGreaterThan(low)
  })

  it('handles underscores and dollar signs', () => {
    const entropy = computeNamingEntropy('const _foo = 1; const $bar = 2; const baz_qux = 3;')
    expect(entropy).toBeGreaterThan(0)
  })
})

// ─── computeOverallEntropy ────────────────────────────────────────────────────

describe('computeOverallEntropy', () => {
  it('computes weighted average', () => {
    const result = computeOverallEntropy({ characterEntropy: 4, tokenEntropy: 6, lineLengthEntropy: 3, namingEntropy: 5 })
    const expected = 4 * 0.2 + 6 * 0.3 + 3 * 0.2 + 5 * 0.3
    expect(result).toBe(Math.round(expected * 1000) / 1000)
  })

  it('returns 0 when all metrics are 0', () => {
    expect(computeOverallEntropy({ characterEntropy: 0, tokenEntropy: 0, lineLengthEntropy: 0, namingEntropy: 0 })).toBe(0)
  })

  it('weights token and naming at 30% each', () => {
    const tokHigh = computeOverallEntropy({ characterEntropy: 0, tokenEntropy: 10, lineLengthEntropy: 0, namingEntropy: 0 })
    const namHigh = computeOverallEntropy({ characterEntropy: 0, tokenEntropy: 0, lineLengthEntropy: 0, namingEntropy: 10 })
    expect(tokHigh).toBe(namHigh)
  })

  it('weights character and line at 20% each', () => {
    const charHigh = computeOverallEntropy({ characterEntropy: 10, tokenEntropy: 0, lineLengthEntropy: 0, namingEntropy: 0 })
    const lineHigh = computeOverallEntropy({ characterEntropy: 0, tokenEntropy: 0, lineLengthEntropy: 10, namingEntropy: 0 })
    expect(charHigh).toBe(lineHigh)
  })

  it('rounds to 3 decimal places', () => {
    const result = computeOverallEntropy({ characterEntropy: 4.123, tokenEntropy: 5.678, lineLengthEntropy: 3.456, namingEntropy: 6.789 })
    const decimals = String(result).split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(3)
  })
})

// ─── classifyEntropy ──────────────────────────────────────────────────────────

describe('classifyEntropy', () => {
  it('classifies < 3 as low', () => {
    expect(classifyEntropy(0)).toBe('low')
    expect(classifyEntropy(2.9)).toBe('low')
  })

  it('classifies 3-4.99 as normal', () => {
    expect(classifyEntropy(3)).toBe('normal')
    expect(classifyEntropy(4.9)).toBe('normal')
  })

  it('classifies 5-6.49 as high', () => {
    expect(classifyEntropy(5)).toBe('high')
    expect(classifyEntropy(6.4)).toBe('high')
  })

  it('classifies >= 6.5 as very-high', () => {
    expect(classifyEntropy(6.5)).toBe('very-high')
    expect(classifyEntropy(10)).toBe('very-high')
  })
})

// ─── computeDistribution ──────────────────────────────────────────────────────

describe('computeDistribution', () => {
  const makeFile = (charE: number, tokE: number, lineE: number, namE: number, overall: number): FileEntropy => ({
    file: 'f.ts',
    metrics: { characterEntropy: charE, tokenEntropy: tokE, lineLengthEntropy: lineE, namingEntropy: namE, overallEntropy: overall, classification: 'normal' },
    lines: 10, size: 100, anomalyScore: 0, isAnomalous: false, anomalyReason: null,
  })

  it('returns zeroed distribution for empty input', () => {
    const dist = computeDistribution([])
    expect(dist.averageCharacterEntropy).toBe(0)
    expect(dist.standardDeviation).toBe(0)
    expect(dist.minEntropy).toBe(0)
    expect(dist.maxEntropy).toBe(0)
  })

  it('computes averages', () => {
    const files = [makeFile(4, 6, 3, 5, 4.7), makeFile(5, 7, 4, 6, 5.7)]
    const dist = computeDistribution(files)
    expect(dist.averageCharacterEntropy).toBe(4.5)
    expect(dist.averageTokenEntropy).toBe(6.5)
  })

  it('computes min and max', () => {
    const files = [makeFile(4, 6, 3, 5, 3), makeFile(5, 7, 4, 6, 7)]
    const dist = computeDistribution(files)
    expect(dist.minEntropy).toBe(3)
    expect(dist.maxEntropy).toBe(7)
  })

  it('computes standard deviation', () => {
    const files = [makeFile(4, 6, 3, 5, 4), makeFile(4, 6, 3, 5, 6)]
    const dist = computeDistribution(files)
    expect(dist.standardDeviation).toBe(1)
  })

  it('handles single file', () => {
    const files = [makeFile(4, 6, 3, 5, 4.5)]
    const dist = computeDistribution(files)
    expect(dist.minEntropy).toBe(4.5)
    expect(dist.maxEntropy).toBe(4.5)
    expect(dist.standardDeviation).toBe(0)
  })
})

// ─── detectAnomalies ──────────────────────────────────────────────────────────

describe('detectAnomalies', () => {
  const makeFile = (file: string, overall: number): FileEntropy => ({
    file,
    metrics: { characterEntropy: overall, tokenEntropy: overall, lineLengthEntropy: overall, namingEntropy: overall, overallEntropy: overall, classification: 'normal' },
    lines: 10, size: 100, anomalyScore: 0, isAnomalous: false, anomalyReason: null,
  })

  it('returns all files with updated scores', () => {
    const files = [makeFile('a.ts', 4), makeFile('b.ts', 5)]
    const dist: EntropyDistribution = { averageCharacterEntropy: 4.5, averageTokenEntropy: 4.5, averageLineLengthEntropy: 4.5, averageNamingEntropy: 4.5, standardDeviation: 0.5, minEntropy: 4, maxEntropy: 5 }
    const result = detectAnomalies(files, dist)
    expect(result.length).toBe(2)
    expect(result.every((f) => f.anomalyScore >= 0)).toBe(true)
  })

  it('detects high entropy anomaly', () => {
    const files = [makeFile('normal.ts', 4), makeFile('weird.ts', 8)]
    const dist: EntropyDistribution = { averageCharacterEntropy: 4, averageTokenEntropy: 4, averageLineLengthEntropy: 4, averageNamingEntropy: 4, standardDeviation: 0.5, minEntropy: 4, maxEntropy: 8 }
    const result = detectAnomalies(files, dist)
    const weird = result.find((f) => f.file === 'weird.ts')!
    expect(weird.isAnomalous).toBe(true)
    expect(weird.anomalyReason).toContain('high entropy')
  })

  it('detects low entropy anomaly', () => {
    const files = [makeFile('normal.ts', 5), makeFile('simple.ts', 1)]
    const dist: EntropyDistribution = { averageCharacterEntropy: 5, averageTokenEntropy: 5, averageLineLengthEntropy: 5, averageNamingEntropy: 5, standardDeviation: 0.5, minEntropy: 1, maxEntropy: 5 }
    const result = detectAnomalies(files, dist)
    const simple = result.find((f) => f.file === 'simple.ts')!
    expect(simple.isAnomalous).toBe(true)
    expect(simple.anomalyReason).toContain('low entropy')
  })

  it('marks normal files as not anomalous', () => {
    const files = [makeFile('a.ts', 4.5), makeFile('b.ts', 4.6)]
    const dist: EntropyDistribution = { averageCharacterEntropy: 4.5, averageTokenEntropy: 4.5, averageLineLengthEntropy: 4.5, averageNamingEntropy: 4.5, standardDeviation: 0.1, minEntropy: 4.5, maxEntropy: 4.6 }
    const result = detectAnomalies(files, dist)
    expect(result.every((f) => !f.isAnomalous)).toBe(true)
  })
})

// ─── computeEntropyStats ──────────────────────────────────────────────────────

describe('computeEntropyStats', () => {
  const makeFile = (file: string, overall: number, classification: 'low' | 'normal' | 'high' | 'very-high', anomalous = false): FileEntropy => ({
    file,
    metrics: { characterEntropy: overall, tokenEntropy: overall, lineLengthEntropy: overall, namingEntropy: overall, overallEntropy: overall, classification },
    lines: 10, size: 100, anomalyScore: 0, isAnomalous: anomalous, anomalyReason: null,
  })

  it('returns empty stats for no files', () => {
    const stats = computeEntropyStats([])
    expect(stats.totalFiles).toBe(0)
    expect(stats.averageEntropy).toBe(0)
  })

  it('computes total files', () => {
    const stats = computeEntropyStats([makeFile('a.ts', 4, 'normal'), makeFile('b.ts', 5, 'normal')])
    expect(stats.totalFiles).toBe(2)
  })

  it('computes average entropy', () => {
    const stats = computeEntropyStats([makeFile('a.ts', 3, 'normal'), makeFile('b.ts', 5, 'normal')])
    expect(stats.averageEntropy).toBe(4)
  })

  it('counts anomalous files', () => {
    const stats = computeEntropyStats([makeFile('a.ts', 4, 'normal'), makeFile('b.ts', 8, 'very-high', true)])
    expect(stats.anomalousCount).toBe(1)
  })

  it('counts low entropy files', () => {
    const stats = computeEntropyStats([makeFile('a.ts', 2, 'low'), makeFile('b.ts', 4, 'normal')])
    expect(stats.lowEntropyCount).toBe(1)
  })

  it('counts high entropy files', () => {
    const stats = computeEntropyStats([makeFile('a.ts', 5.5, 'high'), makeFile('b.ts', 7, 'very-high'), makeFile('c.ts', 4, 'normal')])
    expect(stats.highEntropyCount).toBe(2)
  })

  it('finds most and least entropic files', () => {
    const stats = computeEntropyStats([makeFile('low.ts', 2, 'low'), makeFile('mid.ts', 4, 'normal'), makeFile('high.ts', 7, 'very-high')])
    expect(stats.mostEntropicFile).toBe('high.ts')
    expect(stats.leastEntropicFile).toBe('low.ts')
  })
})

// ─── generateEntropyRecommendations ───────────────────────────────────────────

describe('generateEntropyRecommendations', () => {
  const makeFile = (file: string, overall: number, classification: 'low' | 'normal' | 'high' | 'very-high'): FileEntropy => ({
    file,
    metrics: { characterEntropy: overall, tokenEntropy: overall, lineLengthEntropy: overall, namingEntropy: overall, overallEntropy: overall, classification },
    lines: 10, size: 100, anomalyScore: 0.5, isAnomalous: true, anomalyReason: 'test',
  })

  const emptyStats: EntropyStats = { totalFiles: 10, averageEntropy: 4, anomalousCount: 0, lowEntropyCount: 0, highEntropyCount: 0, mostEntropicFile: '', leastEntropicFile: '' }

  it('returns clean message for no anomalies', () => {
    const recs = generateEntropyRecommendations([], emptyStats)
    expect(recs).toEqual(['Entropy levels are within normal range across the codebase.'])
  })

  it('recommends reviewing low entropy files', () => {
    const anomalous = [makeFile('gen.ts', 1.5, 'low')]
    const recs = generateEntropyRecommendations(anomalous, emptyStats)
    expect(recs.some((r) => r.includes('gen.ts') && r.includes('low entropy'))).toBe(true)
  })

  it('recommends reviewing high entropy files', () => {
    const anomalous = [makeFile('obf.ts', 7.5, 'very-high')]
    const recs = generateEntropyRecommendations(anomalous, emptyStats)
    expect(recs.some((r) => r.includes('obf.ts') && r.includes('high entropy'))).toBe(true)
  })

  it('warns about too many low entropy files', () => {
    const stats = { ...emptyStats, lowEntropyCount: 5, totalFiles: 10 }
    const recs = generateEntropyRecommendations([], stats)
    expect(recs.some((r) => r.includes('30%'))).toBe(true)
  })
})

// ─── buildEntropyResult ───────────────────────────────────────────────────────

describe('buildEntropyResult', () => {
  it('returns empty result for no files', () => {
    const result = buildEntropyResult([], [])
    expect(result.files).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single file', () => {
    const result = buildEntropyResult(['app.ts'], ['const x = 1 + 2 + 3; function add(a, b) { return a + b; }'])
    expect(result.files.length).toBe(1)
    expect(result.files[0]!.metrics.overallEntropy).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildEntropyResult(
      ['a.ts', 'b.ts'],
      ['const x = 1;', 'function complexProcess() { if (a) { for (let i = 0; i < n; i++) { } } }'],
    )
    expect(result.files.length).toBe(2)
  })

  it('computes distribution', () => {
    const result = buildEntropyResult(
      ['a.ts', 'b.ts'],
      ['const x = 1;', 'function foo(bar) { return bar + baz(); }'],
    )
    expect(result.distribution.minEntropy).toBeGreaterThan(0)
    expect(result.distribution.maxEntropy).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.mostEntropicFile).toBe('a.ts')
  })

  it('detects anomalies', () => {
    const result = buildEntropyResult(
      ['normal.ts', 'repeat.ts'],
      ['const alpha = 1; function beta(gamma) { return gamma * delta; }', 'x x x x x x x x x x x x'],
    )
    expect(result.anomalousFiles).toBeDefined()
  })

  it('generates recommendations', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty file content', () => {
    const result = buildEntropyResult(['empty.ts'], [''])
    expect(result.files[0]!.metrics.characterEntropy).toBe(0)
    expect(result.files[0]!.metrics.tokenEntropy).toBe(0)
  })
})

// ─── formatEntropyTable ───────────────────────────────────────────────────────

describe('formatEntropyTable', () => {
  it('returns message for no files', () => {
    expect(formatEntropyTable([])).toContain('No files analyzed')
  })

  it('renders table with headers', () => {
    const result = buildEntropyResult(['app.ts'], ['const x = 1;'])
    const output = formatEntropyTable(result.files)
    expect(output).toContain('Code Entropy Analysis')
    expect(output).toContain('app.ts')
    expect(output).toContain('Overall')
  })
})

// ─── formatDistributionHistogram ──────────────────────────────────────────────

describe('formatDistributionHistogram', () => {
  it('renders histogram with bars', () => {
    const result = buildEntropyResult(['a.ts', 'b.ts'], ['const x = 1;', 'function foo() { }'])
    const output = formatDistributionHistogram(result.distribution)
    expect(output).toContain('Entropy Distribution')
    expect(output).toContain('Character')
    expect(output).toContain('Token')
    expect(output).toContain('█')
  })
})

// ─── formatAnomalousFiles ─────────────────────────────────────────────────────

describe('formatAnomalousFiles', () => {
  it('returns empty for no anomalies', () => {
    expect(formatAnomalousFiles([])).toBe('')
  })

  it('renders anomalous file warnings', () => {
    const files: FileEntropy[] = [{
      file: 'weird.ts', metrics: { characterEntropy: 8, tokenEntropy: 8, lineLengthEntropy: 8, namingEntropy: 8, overallEntropy: 8, classification: 'very-high' },
      lines: 10, size: 100, anomalyScore: 0.9, isAnomalous: true, anomalyReason: 'Very high entropy',
    }]
    const output = formatAnomalousFiles(files)
    expect(output).toContain('Anomalous Files')
    expect(output).toContain('weird.ts')
  })
})

// ─── formatEntropySpectrum ────────────────────────────────────────────────────

describe('formatEntropySpectrum', () => {
  it('returns empty for no files', () => {
    expect(formatEntropySpectrum([])).toBe('')
  })

  it('renders spectrum', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    const output = formatEntropySpectrum(result.files)
    expect(output).toContain('Entropy Spectrum')
  })
})

// ─── formatStatsLine ──────────────────────────────────────────────────────────

describe('formatStatsLine', () => {
  it('renders stats', () => {
    const stats: EntropyStats = { totalFiles: 10, averageEntropy: 4.5, anomalousCount: 2, lowEntropyCount: 3, highEntropyCount: 1, mostEntropicFile: 'a.ts', leastEntropicFile: 'b.ts' }
    const output = formatStatsLine(stats)
    expect(output).toContain('Files: 10')
    expect(output).toContain('Avg Entropy: 4.5')
  })
})

// ─── formatEntropyResultTable ─────────────────────────────────────────────────

describe('formatEntropyResultTable', () => {
  it('renders full result', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    const output = formatEntropyResultTable(result, false)
    expect(output).toContain('Code Entropy Analysis')
    expect(output).toContain('Entropy Distribution')
  })

  it('includes spectrum in verbose mode', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    const output = formatEntropyResultTable(result, true)
    expect(output).toContain('Entropy Spectrum')
  })

  it('includes recommendations', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    const output = formatEntropyResultTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatEntropyJson ────────────────────────────────────────────────────────

describe('formatEntropyJson', () => {
  it('returns valid JSON', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    const output = formatEntropyJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('distribution')
    expect(parsed).toHaveProperty('stats')
  })
})

// ─── formatEntropyCsv ─────────────────────────────────────────────────────────

describe('formatEntropyCsv', () => {
  it('includes header', () => {
    const result = buildEntropyResult([], [])
    const output = formatEntropyCsv(result)
    expect(output).toContain('file,overall,character,token')
  })

  it('includes data rows', () => {
    const result = buildEntropyResult(['a.ts'], ['const x = 1;'])
    const output = formatEntropyCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[1]).toContain('a.ts')
  })
})
