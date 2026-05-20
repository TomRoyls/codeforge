import { describe, expect, it } from 'vitest'

import {
  buildMeasurement,
  buildSamplerResult,
  clusteredSample,
  computeConfidenceInterval,
  computeMarginOfError,
  computeMean,
  computeMedian,
  computeOverallConfidence,
  computePercentile,
  computeStdDev,
  extrapolateToPopulation,
  generateSamplerRecommendations,
  measureFileMetrics,
  randomSample,
  seededRandom,
  stratifiedSample,
  systematicSample,
  type Measurement,
  type SamplerStats,
} from '../src/commands/sampler-helpers.js'

import {
  formatConfidenceIndicators,
  formatEstimates,
  formatHistogram,
  formatMeasurementsTable,
  formatRecommendations,
  formatSamplerJSON,
  formatSamplerTable,
  formatSamplingSummary,
} from '../src/commands/sampler-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FILES = ['src/a.ts', 'src/b.ts', 'src/c.ts', 'test/a.test.ts', 'test/b.test.ts', 'utils.ts']
const CONTENTS = [
  'export function a() { if (x) { return 1 } }\n// TODO: fix\n',
  'const b = 1\nconst c = 2\n',
  "import { x } from 'y'\nexport const z = 'hello'\n",
  "import { describe, it, expect } from 'vitest'\ndescribe('a', () => { it('works', () => { expect(1).toBe(1) }) })\n",
  "// FIXME: broken\nclass Foo { bar() { return 'baz' } }\n",
  '',
]

// ─── seededRandom ─────────────────────────────────────────────────────────────

describe('seededRandom', () => {
  it('produces deterministic results', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(42)
    expect(rng1()).toBe(rng2())
    expect(rng1()).toBe(rng2())
  })

  it('produces different results for different seeds', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(99)
    expect(rng1()).not.toBe(rng2())
  })

  it('produces values between 0 and 1', () => {
    const rng = seededRandom(123)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

// ─── randomSample ─────────────────────────────────────────────────────────────

describe('randomSample', () => {
  it('returns correct sample size', () => {
    const sample = randomSample(FILES, 3, 42)
    expect(sample.length).toBe(3)
  })

  it('returns all files if sample >= population', () => {
    const sample = randomSample(FILES, 100, 42)
    expect(sample.length).toBe(FILES.length)
  })

  it('returns empty for empty input', () => {
    expect(randomSample([], 5, 42)).toEqual([])
  })

  it('is deterministic with same seed', () => {
    const s1 = randomSample(FILES, 3, 42)
    const s2 = randomSample(FILES, 3, 42)
    expect(s1).toEqual(s2)
  })

  it('only includes valid files', () => {
    const sample = randomSample(FILES, 3, 42)
    for (const f of sample) {
      expect(FILES.includes(f)).toBe(true)
    }
  })
})

// ─── stratifiedSample ─────────────────────────────────────────────────────────

describe('stratifiedSample', () => {
  it('returns correct sample size', () => {
    const sample = stratifiedSample(FILES, 4, 42)
    expect(sample.length).toBe(4)
  })

  it('is deterministic', () => {
    const s1 = stratifiedSample(FILES, 3, 42)
    const s2 = stratifiedSample(FILES, 3, 42)
    expect(s1).toEqual(s2)
  })

  it('returns empty for empty input', () => {
    expect(stratifiedSample([], 5, 42)).toEqual([])
  })
})

// ─── systematicSample ─────────────────────────────────────────────────────────

describe('systematicSample', () => {
  it('returns correct sample size', () => {
    const sample = systematicSample(FILES, 3)
    expect(sample.length).toBe(3)
  })

  it('returns all files if sample >= population', () => {
    const sample = systematicSample(FILES, 100)
    expect(sample.length).toBe(FILES.length)
  })

  it('returns empty for empty input', () => {
    expect(systematicSample([], 5)).toEqual([])
  })

  it('picks evenly spaced files', () => {
    const manyFiles = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const sample = systematicSample(manyFiles, 4)
    expect(sample.length).toBe(4)
  })
})

// ─── clusteredSample ──────────────────────────────────────────────────────────

describe('clusteredSample', () => {
  it('returns files from clusters', () => {
    const sample = clusteredSample(FILES, 4, 42)
    expect(sample.length).toBeGreaterThan(0)
    expect(sample.length).toBeLessThanOrEqual(4)
  })

  it('is deterministic', () => {
    const s1 = clusteredSample(FILES, 3, 42)
    const s2 = clusteredSample(FILES, 3, 42)
    expect(s1).toEqual(s2)
  })

  it('returns empty for empty input', () => {
    expect(clusteredSample([], 5, 42)).toEqual([])
  })
})

// ─── computeMean ──────────────────────────────────────────────────────────────

describe('computeMean', () => {
  it('computes mean', () => {
    expect(computeMean([1, 2, 3, 4, 5])).toBe(3)
  })

  it('returns 0 for empty', () => {
    expect(computeMean([])).toBe(0)
  })

  it('handles single value', () => {
    expect(computeMean([42])).toBe(42)
  })
})

// ─── computeMedian ────────────────────────────────────────────────────────────

describe('computeMedian', () => {
  it('computes odd-length median', () => {
    expect(computeMedian([1, 2, 3, 4, 5])).toBe(3)
  })

  it('computes even-length median', () => {
    expect(computeMedian([1, 2, 3, 4])).toBe(2.5)
  })

  it('returns 0 for empty', () => {
    expect(computeMedian([])).toBe(0)
  })
})

// ─── computeStdDev ────────────────────────────────────────────────────────────

describe('computeStdDev', () => {
  it('computes standard deviation', () => {
    const vals = [2, 4, 4, 4, 5, 5, 7, 9]
    const mean = computeMean(vals)
    const sd = computeStdDev(vals, mean)
    expect(sd).toBeGreaterThan(0)
  })

  it('returns 0 for single value', () => {
    expect(computeStdDev([5], 5)).toBe(0)
  })

  it('returns 0 for identical values', () => {
    expect(computeStdDev([3, 3, 3], 3)).toBe(0)
  })
})

// ─── computePercentile ────────────────────────────────────────────────────────

describe('computePercentile', () => {
  it('computes 50th percentile', () => {
    expect(computePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 50)).toBe(5.5)
  })

  it('computes 25th percentile', () => {
    const p25 = computePercentile([1, 2, 3, 4, 5], 25)
    expect(p25).toBeGreaterThanOrEqual(1)
    expect(p25).toBeLessThanOrEqual(3)
  })

  it('computes 95th percentile', () => {
    const p95 = computePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95)
    expect(p95).toBeGreaterThanOrEqual(9)
  })

  it('returns 0 for empty', () => {
    expect(computePercentile([], 50)).toBe(0)
  })
})

// ─── computeMarginOfError ─────────────────────────────────────────────────────

describe('computeMarginOfError', () => {
  it('computes MoE', () => {
    const moe = computeMarginOfError(10, 30)
    expect(moe).toBeGreaterThan(0)
  })

  it('returns 0 for n <= 1', () => {
    expect(computeMarginOfError(10, 1)).toBe(0)
  })

  it('decreases with larger n', () => {
    const moe5 = computeMarginOfError(10, 5)
    const moe100 = computeMarginOfError(10, 100)
    expect(moe100).toBeLessThan(moe5)
  })
})

// ─── computeConfidenceInterval ────────────────────────────────────────────────

describe('computeConfidenceInterval', () => {
  it('computes CI', () => {
    const ci = computeConfidenceInterval([10, 20, 30, 40, 50])
    expect(ci[0]).toBeLessThan(30)
    expect(ci[1]).toBeGreaterThan(30)
  })

  it('returns [0, 0] for empty', () => {
    expect(computeConfidenceInterval([])).toEqual([0, 0])
  })

  it('CI contains the mean', () => {
    const vals = [5, 10, 15, 20, 25]
    const mean = computeMean(vals)
    const ci = computeConfidenceInterval(vals)
    expect(mean).toBeGreaterThanOrEqual(ci[0])
    expect(mean).toBeLessThanOrEqual(ci[1])
  })
})

// ─── measureFileMetrics ───────────────────────────────────────────────────────

describe('measureFileMetrics', () => {
  it('measures line count', () => {
    const m = measureFileMetrics('const x = 1\nconst y = 2\n')
    expect(m['Line Count']).toBe(2)
  })

  it('measures function count', () => {
    const m = measureFileMetrics('function foo() {}\nconst bar = () => {}\n')
    expect(m['Function Count']).toBeGreaterThanOrEqual(2)
  })

  it('measures complexity', () => {
    const m = measureFileMetrics('if (x) { for (let i = 0; i < 10; i++) {} }')
    expect(m['Complexity']).toBeGreaterThan(1)
  })

  it('measures comment density', () => {
    const m = measureFileMetrics('// comment\nconst x = 1\n// another\n')
    expect(m['Comment Density']).toBeGreaterThan(0)
  })

  it('measures import count', () => {
    const m = measureFileMetrics("import { a } from 'x'\nimport { b } from 'y'\n")
    expect(m['Import Count']).toBe(2)
  })

  it('measures export count', () => {
    const m = measureFileMetrics('export function foo() {}\nexport const bar = 1\n')
    expect(m['Export Count']).toBe(2)
  })

  it('measures nesting depth', () => {
    const m = measureFileMetrics('if (x) { if (y) { if (z) {} } }')
    expect(m['Nesting Depth']).toBe(3)
  })

  it('measures string literals', () => {
    const m = measureFileMetrics("const a = 'hello'\nconst b = \"world\"\n")
    expect(m['String Literals']).toBeGreaterThanOrEqual(2)
  })

  it('measures TODO/FIXME count', () => {
    const m = measureFileMetrics('// TODO: fix\n// FIXME: broken\n')
    expect(m['TODO/FIXME Count']).toBe(2)
  })

  it('returns all 9 metrics', () => {
    const m = measureFileMetrics('const x = 1')
    expect(Object.keys(m).length).toBe(9)
  })
})

// ─── buildMeasurement ─────────────────────────────────────────────────────────

describe('buildMeasurement', () => {
  it('builds complete measurement', () => {
    const m = buildMeasurement('Test', [10, 20, 30, 40, 50])
    expect(m.name).toBe('Test')
    expect(m.mean).toBe(30)
    expect(m.min).toBe(10)
    expect(m.max).toBe(50)
    expect(m.confidenceInterval).toHaveLength(2)
  })

  it('handles empty values', () => {
    const m = buildMeasurement('Empty', [])
    expect(m.mean).toBe(0)
    expect(m.stddev).toBe(0)
  })
})

// ─── extrapolateToPopulation ──────────────────────────────────────────────────

describe('extrapolateToPopulation', () => {
  it('extrapolates correctly', () => {
    const m = buildMeasurement('LoC', [10, 20, 30])
    const est = extrapolateToPopulation(m, 3, 30)
    expect(est.sampleMean).toBe(20)
    expect(est.populationEstimate).toBe(600)
    expect(est.confidence).toBe(95)
  })
})

// ─── computeOverallConfidence ─────────────────────────────────────────────────

describe('computeOverallConfidence', () => {
  it('computes average confidence', () => {
    const ests = [
      { measurement: 'a', sampleMean: 10, populationEstimate: 100, confidenceInterval: [80, 120] as [number, number], confidence: 95, error: 20 },
      { measurement: 'b', sampleMean: 5, populationEstimate: 50, confidenceInterval: [40, 60] as [number, number], confidence: 95, error: 10 },
    ]
    expect(computeOverallConfidence(ests)).toBe(95)
  })

  it('returns 0 for empty', () => {
    expect(computeOverallConfidence([])).toBe(0)
  })
})

// ─── generateSamplerRecommendations ───────────────────────────────────────────

describe('generateSamplerRecommendations', () => {
  it('warns about high variance', () => {
    const measurements = [buildMeasurement('X', [1, 100, 1, 100, 1])]
    const estimates = measurements.map((m) => extrapolateToPopulation(m, 5, 50))
    const stats: SamplerStats = { populationSize: 50, sampleSize: 5, samplingRate: 10, method: 'random', measurementsCount: 1, estimatesWithHighConfidence: 0, overallConfidence: 95 }
    const recs = generateSamplerRecommendations(measurements, estimates, stats)
    expect(recs.some((r) => r.includes('variance') || r.includes('Outlier'))).toBe(true)
  })

  it('warns about low sampling rate', () => {
    const measurements = [buildMeasurement('X', [5, 5, 5])]
    const estimates = measurements.map((m) => extrapolateToPopulation(m, 3, 100))
    const stats: SamplerStats = { populationSize: 100, sampleSize: 3, samplingRate: 3, method: 'random', measurementsCount: 1, estimatesWithHighConfidence: 1, overallConfidence: 95 }
    const recs = generateSamplerRecommendations(measurements, estimates, stats)
    expect(recs.some((r) => r.includes('sample') || r.includes('rate'))).toBe(true)
  })

  it('praises representative sample', () => {
    const measurements = [buildMeasurement('X', [5, 5, 5, 5, 5])]
    const estimates = measurements.map((m) => extrapolateToPopulation(m, 5, 10))
    const stats: SamplerStats = { populationSize: 10, sampleSize: 5, samplingRate: 50, method: 'random', measurementsCount: 1, estimatesWithHighConfidence: 1, overallConfidence: 95 }
    const recs = generateSamplerRecommendations(measurements, estimates, stats)
    expect(recs.some((r) => r.includes('representative') || r.includes('reliable'))).toBe(true)
  })
})

// ─── buildSamplerResult ───────────────────────────────────────────────────────

describe('buildSamplerResult', () => {
  it('builds complete result', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    expect(result.sample.size).toBe(3)
    expect(result.measurements.length).toBe(9)
    expect(result.estimates.length).toBe(9)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildSamplerResult([], [], { method: 'random', sampleSize: 5, seed: 42 })
    expect(result.sample.files).toEqual([])
    expect(result.stats.populationSize).toBe(0)
  })

  it('respects sample size', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 2, seed: 42 })
    expect(result.sample.size).toBeLessThanOrEqual(2)
  })

  it('computes sampling rate', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    expect(result.stats.samplingRate).toBe(Math.round((result.sample.size / FILES.length) * 100))
  })

  it('supports all methods', () => {
    for (const method of ['random', 'stratified', 'systematic', 'clustered'] as const) {
      const result = buildSamplerResult(FILES, CONTENTS, { method, sampleSize: 3, seed: 42 })
      expect(result.stats.method).toBe(method)
    }
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatSamplingSummary', () => {
  it('formats summary', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    const output = formatSamplingSummary(result.sample, result.stats)
    expect(output).toContain('Sampling Summary')
    expect(output).toContain('random')
  })
})

describe('formatMeasurementsTable', () => {
  it('formats measurements', () => {
    const measurements = [buildMeasurement('LoC', [10, 20, 30])]
    expect(formatMeasurementsTable(measurements)).toContain('LoC')
  })

  it('handles empty', () => {
    expect(formatMeasurementsTable([])).toContain('No measurements')
  })
})

describe('formatHistogram', () => {
  it('formats histogram', () => {
    const m = buildMeasurement('LoC', [5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
    expect(formatHistogram(m)).toContain('Distribution')
  })

  it('handles empty', () => {
    const m = buildMeasurement('X', [])
    expect(formatHistogram(m)).toContain('No data')
  })
})

describe('formatEstimates', () => {
  it('formats estimates', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    expect(formatEstimates(result.estimates)).toContain('Population Estimates')
  })

  it('handles empty', () => {
    expect(formatEstimates([])).toContain('No estimates')
  })
})

describe('formatConfidenceIndicators', () => {
  it('formats indicators', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    expect(formatConfidenceIndicators(result.estimates)).toContain('Confidence')
  })

  it('handles empty', () => {
    expect(formatConfidenceIndicators([])).toContain('No confidence')
  })
})

describe('formatRecommendations', () => {
  it('formats recs', () => {
    expect(formatRecommendations(['Increase sample'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatSamplerTable', () => {
  it('formats full table', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    const output = formatSamplerTable(result)
    expect(output).toContain('Sampling Summary')
    expect(output).toContain('Measurement Statistics')
  })
})

describe('formatSamplerJSON', () => {
  it('formats valid JSON', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    const json = formatSamplerJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.sample).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('round-trips through JSON', () => {
    const result = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    const json = formatSamplerJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.populationSize).toBe(FILES.length)
    expect(parsed.measurements.length).toBe(9)
  })

  it('different seeds produce different samples', () => {
    const r1 = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 42 })
    const r2 = buildSamplerResult(FILES, CONTENTS, { method: 'random', sampleSize: 3, seed: 99 })
    expect(r1.sample.files).not.toEqual(r2.sample.files)
  })
})
