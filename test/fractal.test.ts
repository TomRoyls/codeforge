import { describe, expect, it } from 'vitest'

import {
  buildFractalLevels,
  buildFractalResult,
  classifyFileQuality,
  classifyFractalQuality,
  computeFractalDimension,
  computeIterationScore,
  computeSelfSimilarityScore,
  detectSelfSimilarity,
  extractPatternsAtScale,
  generateRecommendations,
  type DimensionInterpretation,
  type FileQuality,
  type FractalDimension,
  type FractalFile,
  type FractalLevel,
  type FractalOverallQuality,
  type FractalPattern,
  type FractalResult,
  type FractalStats,
} from '../src/commands/fractal-helpers.js'

import {
  formatDimension,
  formatDimensionLabel,
  formatFiles,
  formatFractalJson,
  formatFractalStats,
  formatFractalTable,
  formatLevels,
  formatPatterns,
  formatQualityLabel,
  formatRecommendations,
  formatSimilarityGauge,
  formatFileQualityLabel,
} from '../src/commands/fractal-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY = ''

const TYPED_FNS = `export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export function multiply(a: number, b: number): number {
  return a * b
}
`

const MIXED_CODE = `import { readFile } from 'fs'
import type { Config } from './types'

export class ConfigManager {
  private config: Config | null = null

  load(path: string): void {
    this.config = JSON.parse(readFile(path, 'utf8'))
  }

  save(path: string): void {
    if (this.config) writeFile(path, JSON.stringify(this.config))
  }
}

export function loadConfig(path: string): Config {
  return new ConfigManager().load(path)
}
`

const SIMPLE_CODE = `const x = 1
const y = 2
console.log(x + y)
`

const MULTI_FILE_CONTENTS = [
  `export function a(): void {}
export function b(): void {}
`,
  `export function c(): void {}
`,
]

// ─── extractPatternsAtScale ────────────────────────────────────────────────────

describe('extractPatternsAtScale', () => {
  it('returns empty for empty content', () => {
    expect(extractPatternsAtScale(EMPTY, 'function')).toEqual([])
  })

  it('extracts function-scale patterns', () => {
    const patterns = extractPatternsAtScale(TYPED_FNS, 'function')
    expect(patterns.length).toBeGreaterThanOrEqual(1)
    expect(patterns.every(p => p.scale === 'function')).toBe(true)
  })

  it('detects function signature pattern', () => {
    const patterns = extractPatternsAtScale(TYPED_FNS, 'function')
    expect(patterns.some(p => p.name === 'function-signature')).toBe(true)
  })

  it('counts function occurrences correctly', () => {
    const patterns = extractPatternsAtScale(TYPED_FNS, 'function')
    const sig = patterns.find(p => p.name === 'function-signature')
    expect(sig!.occurrences).toBeGreaterThanOrEqual(3)
  })

  it('detects typed parameters', () => {
    const patterns = extractPatternsAtScale(TYPED_FNS, 'function')
    expect(patterns.some(p => p.name === 'typed-parameters')).toBe(true)
  })

  it('extracts class-scale patterns', () => {
    const patterns = extractPatternsAtScale(MIXED_CODE, 'class')
    expect(patterns.length).toBeGreaterThanOrEqual(1)
    expect(patterns.some(p => p.scale === 'class')).toBe(true)
  })

  it('extracts file-scale patterns', () => {
    const patterns = extractPatternsAtScale(MIXED_CODE, 'file')
    expect(patterns.length).toBeGreaterThanOrEqual(1)
    expect(patterns.some(p => p.scale === 'file')).toBe(true)
  })

  it('detects import patterns', () => {
    const patterns = extractPatternsAtScale(MIXED_CODE, 'file')
    expect(patterns.some(p => p.name === 'import-statements')).toBe(true)
  })

  it('detects export patterns', () => {
    const patterns = extractPatternsAtScale(MIXED_CODE, 'file')
    expect(patterns.some(p => p.name === 'export-statements')).toBe(true)
  })

  it('returns empty for directory scale', () => {
    expect(extractPatternsAtScale('code', 'directory')).toEqual([])
  })

  it('returns empty for project scale', () => {
    expect(extractPatternsAtScale('code', 'project')).toEqual([])
  })

  it('all patterns have valid consistency', () => {
    const patterns = extractPatternsAtScale(TYPED_FNS, 'function')
    expect(patterns.every(p => p.consistency >= 0 && p.consistency <= 100)).toBe(true)
  })
})

// ─── detectSelfSimilarity ──────────────────────────────────────────────────────

describe('detectSelfSimilarity', () => {
  it('handles empty patterns', () => {
    expect(detectSelfSimilarity([])).toEqual([])
  })

  it('marks same-name patterns at different scales as self-similar', () => {
    const patterns: FractalPattern[] = [
      { name: 'exported-functions', scale: 'function', pattern: 'a', occurrences: 3, consistency: 80, isSelfSimilar: false, scales: ['function'] },
      { name: 'exported-functions', scale: 'file', pattern: 'a', occurrences: 3, consistency: 80, isSelfSimilar: false, scales: ['file'] },
    ]
    const result = detectSelfSimilarity(patterns)
    expect(result.every(p => p.isSelfSimilar)).toBe(true)
    expect(result.every(p => p.scales.length >= 2)).toBe(true)
  })

  it('does not mark single-scale patterns as self-similar', () => {
    const patterns: FractalPattern[] = [
      { name: 'unique-pattern', scale: 'function', pattern: 'a', occurrences: 1, consistency: 50, isSelfSimilar: false, scales: ['function'] },
    ]
    const result = detectSelfSimilarity(patterns)
    expect(result[0].isSelfSimilar).toBe(false)
  })
})

// ─── computeFractalDimension ───────────────────────────────────────────────────

describe('computeFractalDimension', () => {
  it('returns simple for single level', () => {
    const dim = computeFractalDimension([{ scale: 'function', nodes: 5, avgComplexity: 30, patternCount: 2, selfSimilarityScore: 50, dominantPattern: 'fn' }])
    expect(dim.dimension).toBe(1.0)
    expect(dim.interpretation).toBe('simple')
  })

  it('returns dimension in valid range', () => {
    const levels: FractalLevel[] = [
      { scale: 'function', nodes: 10, avgComplexity: 80, patternCount: 3, selfSimilarityScore: 50, dominantPattern: 'a' },
      { scale: 'class', nodes: 3, avgComplexity: 20, patternCount: 2, selfSimilarityScore: 60, dominantPattern: 'b' },
      { scale: 'file', nodes: 5, avgComplexity: 50, patternCount: 4, selfSimilarityScore: 70, dominantPattern: 'c' },
    ]
    const dim = computeFractalDimension(levels)
    expect(dim.dimension).toBeGreaterThanOrEqual(1.0)
    expect(dim.dimension).toBeLessThanOrEqual(3.0)
  })

  it('provides description', () => {
    const levels: FractalLevel[] = [
      { scale: 'function', nodes: 5, avgComplexity: 30, patternCount: 1, selfSimilarityScore: 50, dominantPattern: 'a' },
      { scale: 'file', nodes: 3, avgComplexity: 50, patternCount: 1, selfSimilarityScore: 50, dominantPattern: 'b' },
    ]
    const dim = computeFractalDimension(levels)
    expect(dim.description).toBeTruthy()
  })

  it('interprets as one of valid values', () => {
    const levels: FractalLevel[] = [
      { scale: 'function', nodes: 5, avgComplexity: 90, patternCount: 5, selfSimilarityScore: 50, dominantPattern: 'a' },
      { scale: 'class', nodes: 3, avgComplexity: 10, patternCount: 2, selfSimilarityScore: 50, dominantPattern: 'b' },
    ]
    const dim = computeFractalDimension(levels)
    expect(['simple', 'moderate', 'complex', 'chaotic']).toContain(dim.interpretation)
  })
})

// ─── computeSelfSimilarityScore ────────────────────────────────────────────────

describe('computeSelfSimilarityScore', () => {
  it('returns 100 for no other levels', () => {
    const level: FractalLevel = { scale: 'function', nodes: 5, avgComplexity: 50, patternCount: 3, selfSimilarityScore: 0, dominantPattern: 'fn' }
    expect(computeSelfSimilarityScore(level, [])).toBe(100)
  })

  it('returns higher score for similar levels', () => {
    const level: FractalLevel = { scale: 'function', nodes: 5, avgComplexity: 50, patternCount: 3, selfSimilarityScore: 0, dominantPattern: 'fn' }
    const similar: FractalLevel = { scale: 'class', nodes: 4, avgComplexity: 48, patternCount: 3, selfSimilarityScore: 0, dominantPattern: 'cls' }
    const different: FractalLevel = { scale: 'file', nodes: 2, avgComplexity: 10, patternCount: 1, selfSimilarityScore: 0, dominantPattern: 'file' }
    const simScore = computeSelfSimilarityScore(level, [similar])
    const diffScore = computeSelfSimilarityScore(level, [different])
    expect(simScore).toBeGreaterThan(diffScore)
  })

  it('returns 0-100 range', () => {
    const level: FractalLevel = { scale: 'function', nodes: 5, avgComplexity: 50, patternCount: 3, selfSimilarityScore: 0, dominantPattern: 'fn' }
    const other: FractalLevel = { scale: 'class', nodes: 10, avgComplexity: 90, patternCount: 8, selfSimilarityScore: 0, dominantPattern: 'cls' }
    const score = computeSelfSimilarityScore(level, [other])
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── classifyFractalQuality ────────────────────────────────────────────────────

describe('classifyFractalQuality', () => {
  it('returns crystalline for high score and low dimension', () => {
    expect(classifyFractalQuality(90, 85, 1.5)).toBe('crystalline')
  })

  it('returns organized for moderate-high score', () => {
    expect(classifyFractalQuality(70, 65, 1.8)).toBe('organized')
  })

  it('returns branching for moderate score', () => {
    expect(classifyFractalQuality(50, 50, 2.0)).toBe('branching')
  })

  it('returns organic for low score', () => {
    expect(classifyFractalQuality(30, 30, 2.2)).toBe('organic')
  })

  it('returns chaotic for very low score', () => {
    expect(classifyFractalQuality(10, 10, 2.8)).toBe('chaotic')
  })
})

// ─── classifyFileQuality ───────────────────────────────────────────────────────

describe('classifyFileQuality', () => {
  it('returns mandelbrot for high similarity and depth', () => {
    const file: FractalFile = {
      file: 'a.ts', functionPatterns: [], classPatterns: [],
      selfSimilarity: 95, fractalDepth: 4, quality: 'mandelbrot',
    }
    expect(classifyFileQuality(file)).toBe('mandelbrot')
  })

  it('returns sierpinski for high similarity', () => {
    const file: FractalFile = {
      file: 'a.ts', functionPatterns: [], classPatterns: [],
      selfSimilarity: 80, fractalDepth: 2, quality: 'sierpinski',
    }
    expect(classifyFileQuality(file)).toBe('sierpinski')
  })

  it('returns koch for moderate similarity', () => {
    const file: FractalFile = {
      file: 'a.ts', functionPatterns: [], classPatterns: [],
      selfSimilarity: 60, fractalDepth: 2, quality: 'koch',
    }
    expect(classifyFileQuality(file)).toBe('koch')
  })

  it('returns tree for low-moderate similarity', () => {
    const file: FractalFile = {
      file: 'a.ts', functionPatterns: [], classPatterns: [],
      selfSimilarity: 35, fractalDepth: 1, quality: 'tree',
    }
    expect(classifyFileQuality(file)).toBe('tree')
  })

  it('returns random for very low similarity', () => {
    const file: FractalFile = {
      file: 'a.ts', functionPatterns: [], classPatterns: [],
      selfSimilarity: 10, fractalDepth: 0, quality: 'random',
    }
    expect(classifyFileQuality(file)).toBe('random')
  })
})

// ─── computeIterationScore ─────────────────────────────────────────────────────

describe('computeIterationScore', () => {
  it('returns 0 for empty files', () => {
    expect(computeIterationScore([])).toBe(0)
  })

  it('returns 0-100 range', () => {
    const files: FractalFile[] = [{
      file: 'a.ts', functionPatterns: [], classPatterns: [],
      selfSimilarity: 50, fractalDepth: 2, quality: 'koch',
    }]
    const score = computeIterationScore(files)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('higher similarity and depth produce higher score', () => {
    const low: FractalFile[] = [{ file: 'a.ts', functionPatterns: [], classPatterns: [], selfSimilarity: 20, fractalDepth: 1, quality: 'tree' }]
    const high: FractalFile[] = [{ file: 'b.ts', functionPatterns: [], classPatterns: [], selfSimilarity: 90, fractalDepth: 4, quality: 'mandelbrot' }]
    expect(computeIterationScore(high)).toBeGreaterThan(computeIterationScore(low))
  })
})

// ─── buildFractalLevels ────────────────────────────────────────────────────────

describe('buildFractalLevels', () => {
  it('returns 3 levels for non-empty input', () => {
    const levels = buildFractalLevels(['a.ts'], [TYPED_FNS])
    expect(levels).toHaveLength(3)
    expect(levels.map(l => l.scale)).toEqual(['function', 'class', 'file'])
  })

  it('computes self-similarity scores', () => {
    const levels = buildFractalLevels(['a.ts'], [TYPED_FNS])
    expect(levels.every(l => l.selfSimilarityScore >= 0 && l.selfSimilarityScore <= 100)).toBe(true)
  })

  it('counts function nodes', () => {
    const levels = buildFractalLevels(['a.ts'], [TYPED_FNS])
    const fnLevel = levels.find(l => l.scale === 'function')
    expect(fnLevel!.nodes).toBeGreaterThanOrEqual(3)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for random files', () => {
    const files: FractalFile[] = [{ file: 'bad.ts', functionPatterns: [], classPatterns: [], selfSimilarity: 5, fractalDepth: 0, quality: 'random' }]
    const stats: FractalStats = {
      totalPatterns: 1, selfSimilarPatterns: 0, avgConsistency: 20,
      avgSelfSimilarity: 10, fractalDimension: 1.0, maxFractalDepth: 0,
      scaleInvariantCount: 0, mandelbrotFiles: 0, randomFiles: 1,
      overallSelfSimilarity: 10, fractalQuality: 'chaotic', iterationScore: 10,
    }
    const recs = generateRecommendations([], [], files, stats)
    expect(recs.some(r => r.includes('random'))).toBe(true)
  })

  it('recommends for no self-similar patterns', () => {
    const patterns: FractalPattern[] = [
      { name: 'a', scale: 'function', pattern: 'x', occurrences: 1, consistency: 50, isSelfSimilar: false, scales: ['function'] },
    ]
    const stats: FractalStats = {
      totalPatterns: 1, selfSimilarPatterns: 0, avgConsistency: 50,
      avgSelfSimilarity: 50, fractalDimension: 1.5, maxFractalDepth: 1,
      scaleInvariantCount: 0, mandelbrotFiles: 0, randomFiles: 0,
      overallSelfSimilarity: 50, fractalQuality: 'organized', iterationScore: 50,
    }
    const recs = generateRecommendations(patterns, [], [], stats)
    expect(recs.some(r => r.includes('self-similar'))).toBe(true)
  })

  it('recommends for chaotic quality', () => {
    const stats: FractalStats = {
      totalPatterns: 0, selfSimilarPatterns: 0, avgConsistency: 10,
      avgSelfSimilarity: 10, fractalDimension: 1.0, maxFractalDepth: 0,
      scaleInvariantCount: 0, mandelbrotFiles: 0, randomFiles: 0,
      overallSelfSimilarity: 10, fractalQuality: 'chaotic', iterationScore: 10,
    }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('chaotic'))).toBe(true)
  })

  it('returns empty for healthy results', () => {
    const files: FractalFile[] = [{ file: 'a.ts', functionPatterns: [{ name: 'x', scale: 'function', pattern: 'p', occurrences: 2, consistency: 90, isSelfSimilar: true, scales: ['function', 'file'] }], classPatterns: [], selfSimilarity: 95, fractalDepth: 4, quality: 'mandelbrot' }]
    const stats: FractalStats = {
      totalPatterns: 1, selfSimilarPatterns: 1, avgConsistency: 90,
      avgSelfSimilarity: 90, fractalDimension: 1.2, maxFractalDepth: 4,
      scaleInvariantCount: 1, mandelbrotFiles: 1, randomFiles: 0,
      overallSelfSimilarity: 90, fractalQuality: 'crystalline', iterationScore: 85,
    }
    const recs = generateRecommendations([], [], files, stats)
    expect(recs).toEqual([])
  })
})

// ─── buildFractalResult (integration) ──────────────────────────────────────────

describe('buildFractalResult', () => {
  it('handles empty input', () => {
    const result = buildFractalResult([], [], {})
    expect(result.files).toEqual([])
    expect(result.stats.totalPatterns).toBe(0)
  })

  it('analyzes single file', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    expect(result.files).toHaveLength(1)
    expect(result.files[0].file).toBe('a.ts')
  })

  it('populates all stats fields', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    const s = result.stats
    expect(typeof s.totalPatterns).toBe('number')
    expect(typeof s.selfSimilarPatterns).toBe('number')
    expect(typeof s.avgConsistency).toBe('number')
    expect(typeof s.avgSelfSimilarity).toBe('number')
    expect(typeof s.fractalDimension).toBe('number')
    expect(typeof s.maxFractalDepth).toBe('number')
    expect(typeof s.scaleInvariantCount).toBe('number')
    expect(typeof s.mandelbrotFiles).toBe('number')
    expect(typeof s.randomFiles).toBe('number')
    expect(typeof s.overallSelfSimilarity).toBe('number')
    expect(typeof s.iterationScore).toBe('number')
    expect(['crystalline', 'organized', 'branching', 'organic', 'chaotic']).toContain(s.fractalQuality)
  })

  it('produces JSON-serializable result', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  it('analyzes multiple files', () => {
    const result = buildFractalResult(['a.ts', 'b.ts'], MULTI_FILE_CONTENTS, {})
    expect(result.files).toHaveLength(2)
    expect(result.stats.totalPatterns).toBeGreaterThan(0)
  })

  it('assigns quality to each file', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    expect(['mandelbrot', 'sierpinski', 'koch', 'tree', 'random']).toContain(result.files[0].quality)
  })

  it('populates dimension', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    expect(result.dimension.dimension).toBeGreaterThanOrEqual(0)
    expect(['simple', 'moderate', 'complex', 'chaotic']).toContain(result.dimension.interpretation)
  })

  it('populates levels', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    expect(result.levels.length).toBeGreaterThanOrEqual(3)
  })

  it('handles simple code', () => {
    const result = buildFractalResult(['simple.ts'], [SIMPLE_CODE], {})
    expect(result.files).toHaveLength(1)
    expect(result.stats.totalPatterns).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatQualityLabel', () => {
  it('formats crystalline', () => {
    expect(formatQualityLabel('crystalline')).toContain('crystalline')
  })
  it('formats chaotic', () => {
    expect(formatQualityLabel('chaotic')).toContain('chaotic')
  })
})

describe('formatFileQualityLabel', () => {
  it('formats mandelbrot', () => {
    expect(formatFileQualityLabel('mandelbrot')).toContain('mandelbrot')
  })
  it('formats random', () => {
    expect(formatFileQualityLabel('random')).toContain('random')
  })
})

describe('formatDimensionLabel', () => {
  it('formats moderate', () => {
    expect(formatDimensionLabel('moderate')).toContain('moderate')
  })
})

describe('formatSimilarityGauge', () => {
  it('formats gauge', () => {
    const g = formatSimilarityGauge(75)
    expect(g).toContain('75')
    expect(g).toContain('\u2588')
  })

  it('formats zero', () => {
    expect(formatSimilarityGauge(0)).toContain('0')
  })

  it('formats 100', () => {
    expect(formatSimilarityGauge(100)).toContain('100')
  })
})

describe('formatPatterns', () => {
  it('formats empty', () => {
    expect(formatPatterns([])).toContain('No patterns')
  })

  it('formats pattern list', () => {
    const pats: FractalPattern[] = [
      { name: 'test-pattern', scale: 'function', pattern: 'x', occurrences: 3, consistency: 80, isSelfSimilar: false, scales: ['function'] },
    ]
    const result = formatPatterns(pats)
    expect(result).toContain('test-pattern')
  })
})

describe('formatLevels', () => {
  it('formats empty', () => {
    expect(formatLevels([])).toContain('No levels')
  })

  it('formats level list', () => {
    const levels: FractalLevel[] = [
      { scale: 'function', nodes: 5, avgComplexity: 30, patternCount: 2, selfSimilarityScore: 75, dominantPattern: 'fn' },
    ]
    const result = formatLevels(levels)
    expect(result).toContain('function')
    expect(result).toContain('75')
  })
})

describe('formatDimension', () => {
  it('formats dimension', () => {
    const dim: FractalDimension = { dimension: 1.75, interpretation: 'moderate', description: 'Test' }
    const result = formatDimension(dim)
    expect(result).toContain('1.75')
    expect(result).toContain('moderate')
  })
})

describe('formatFiles', () => {
  it('formats empty', () => {
    expect(formatFiles([])).toContain('No files')
  })

  it('formats file list', () => {
    const files: FractalFile[] = [{
      file: 'a.ts', functionPatterns: [{ name: 'fn', scale: 'function', pattern: 'x', occurrences: 1, consistency: 50, isSelfSimilar: false, scales: ['function'] }],
      classPatterns: [], selfSimilarity: 75, fractalDepth: 3, quality: 'sierpinski',
    }]
    const result = formatFiles(files)
    expect(result).toContain('a.ts')
    expect(result).toContain('sierpinski')
  })
})

describe('formatFractalStats', () => {
  it('formats stats', () => {
    const stats: FractalStats = {
      totalPatterns: 10, selfSimilarPatterns: 3, avgConsistency: 65,
      avgSelfSimilarity: 70, fractalDimension: 1.8, maxFractalDepth: 3,
      scaleInvariantCount: 2, mandelbrotFiles: 1, randomFiles: 2,
      overallSelfSimilarity: 70, fractalQuality: 'organized', iterationScore: 60,
    }
    const result = formatFractalStats(stats)
    expect(result).toContain('Fractal Analysis')
    expect(result).toContain('10')
    expect(result).toContain('organized')
  })
})

describe('formatRecommendations', () => {
  it('formats empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats list', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('1.')
    expect(result).toContain('Fix X')
  })
})

describe('formatFractalTable', () => {
  it('formats full table', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    const table = formatFractalTable(result)
    expect(table).toContain('Fractal Analysis')
    expect(table).toContain('Fractal Levels')
  })
})

describe('formatFractalJson', () => {
  it('formats valid JSON', () => {
    const result = buildFractalResult(['a.ts'], [TYPED_FNS], {})
    const json = formatFractalJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.files).toHaveLength(1)
  })
})
