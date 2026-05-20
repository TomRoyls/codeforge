import { describe, expect, it } from 'vitest'

import {
  applyComplexityLens,
  applyCouplingLens,
  applyDocumentationLens,
  applyFreshnessLens,
  applyStabilityLens,
  applyTestingLens,
  buildLensResult,
  classifyDistribution,
  computeMaxNesting,
  computeSharpness,
  computeOverallClarity,
  extractImports,
  findBestOverallFile,
  findBottomFocus,
  findMostConsistent,
  findMostPolarizing,
  findTopFocus,
  findWorstOverallFile,
  generateLensRecommendations,
  resolveImportPath,
  type FocusResult,
  type LensStats,
  type LensView,
  LENSES,
} from '../src/commands/lens-helpers.js'
import {
  formatClarityMeter,
  formatDistributionChart,
  formatFocusResults,
  formatLensJson,
  formatLensRecommendations,
  formatLensSelector,
  formatLensTable,
  formatConsistencyPolarization,
} from '../src/commands/lens-format-helpers.js'

// ─── applyComplexityLens ───────────────────────────────────────────────────────

describe('applyComplexityLens', () => {
  it('returns 0 for empty content', () => {
    expect(applyComplexityLens('').score).toBe(0)
  })

  it('returns 0 for whitespace', () => {
    expect(applyComplexityLens('   ').score).toBe(0)
  })

  it('scores simple code low', () => {
    const result = applyComplexityLens('const x = 1')
    expect(result.score).toBeLessThanOrEqual(20)
  })

  it('scores complex code higher', () => {
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { if (y) { while (z) { switch(a) { case 1: break } } } } }'
    const simple = 'const x = 1'
    expect(applyComplexityLens(complex).score).toBeGreaterThan(applyComplexityLens(simple).score)
  })

  it('detects deep nesting', () => {
    const nested = 'if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }'
    const result = applyComplexityLens(nested)
    expect(result.highlights.some((h) => h.includes('deep-nesting'))).toBe(true)
  })

  it('detects low complexity', () => {
    const result = applyComplexityLens('const x = 1 + 2')
    expect(result.highlights.some((h) => h.includes('low-complexity'))).toBe(true)
  })

  it('returns blurred items', () => {
    const result = applyComplexityLens('if (x) {}')
    expect(result.blurred).toContain('documentation')
    expect(result.blurred).toContain('naming')
  })

  it('clamps score to 0-100', () => {
    const result = applyComplexityLens('if (x) { for (let i = 0; i < 100; i++) { if (y) { while (z) {} } } }')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

// ─── applyCouplingLens ─────────────────────────────────────────────────────────

describe('applyCouplingLens', () => {
  it('returns 0 for empty file', () => {
    expect(applyCouplingLens('', [], []).score).toBe(0)
  })

  it('scores loosely coupled low', () => {
    const result = applyCouplingLens('file.ts', ['./a'], ['./b'])
    expect(result.score).toBeLessThanOrEqual(50)
    expect(result.highlights).toContain('bidirectional')
  })

  it('detects high fan-out', () => {
    const result = applyCouplingLens('file.ts', ['a', 'b', 'c', 'd', 'e', 'f'], [])
    expect(result.highlights.some((h) => h.includes('high-fan-out'))).toBe(true)
  })

  it('detects high fan-in', () => {
    const importedBy = Array.from({ length: 10 }, (_, i) => `file${i}.ts`)
    const result = applyCouplingLens('file.ts', [], importedBy)
    expect(result.highlights.some((h) => h.includes('high-fan-in'))).toBe(true)
  })

  it('detects isolated file', () => {
    const result = applyCouplingLens('file.ts', [], [])
    expect(result.highlights).toContain('isolated')
  })

  it('detects loosely coupled', () => {
    const result = applyCouplingLens('file.ts', ['./a'], [])
    expect(result.highlights).toContain('loosely-coupled')
  })

  it('clamps to 0-100', () => {
    const many = Array.from({ length: 20 }, (_, i) => `mod${i}`)
    const result = applyCouplingLens('file.ts', many, many)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

// ─── applyDocumentationLens ────────────────────────────────────────────────────

describe('applyDocumentationLens', () => {
  it('returns 0 for empty content', () => {
    expect(applyDocumentationLens('').score).toBe(0)
  })

  it('scores documented code higher', () => {
    const documented = '/**\n * Adds numbers.\n * @param a First\n * @returns Sum\n * @example\n * add(1, 2)\n */\nfunction add(a: number, b: number): number { return a + b }'
    const bare = 'function add(a, b) { return a + b }'
    expect(applyDocumentationLens(documented).score).toBeGreaterThan(applyDocumentationLens(bare).score)
  })

  it('detects JSDoc coverage', () => {
    const result = applyDocumentationLens('/** Docs */\nfunction foo() {}')
    expect(result.highlights.some((h) => h.includes('jsdoc-coverage'))).toBe(true)
  })

  it('detects type annotations', () => {
    const result = applyDocumentationLens('function foo(x: string): number { return 1 }')
    expect(result.highlights.some((h) => h.includes('typed'))).toBe(true)
  })

  it('detects under-documented', () => {
    const result = applyDocumentationLens('function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}')
    expect(result.highlights.some((h) => h.includes('under-documented'))).toBe(true)
  })

  it('detects well-documented', () => {
    const content = '/** Doc */\nfunction a() {}\n/** Doc */\nfunction b() {}'
    const result = applyDocumentationLens(content)
    expect(result.highlights.some((h) => h.includes('well-documented'))).toBe(true)
  })

  it('blurs complexity and coupling', () => {
    const result = applyDocumentationLens('const x = 1')
    expect(result.blurred).toContain('complexity')
    expect(result.blurred).toContain('coupling')
  })
})

// ─── applyTestingLens ──────────────────────────────────────────────────────────

describe('applyTestingLens', () => {
  it('identifies test files', () => {
    const result = applyTestingLens('foo.test.ts', ['foo.ts', 'foo.test.ts'])
    expect(result.highlights).toContain('test-file')
    expect(result.score).toBeGreaterThanOrEqual(60)
  })

  it('detects paired source', () => {
    const result = applyTestingLens('foo.test.ts', ['foo.ts', 'foo.test.ts'])
    expect(result.highlights).toContain('paired-with-source')
  })

  it('detects missing tests', () => {
    const result = applyTestingLens('foo.ts', ['foo.ts', 'bar.ts'])
    expect(result.highlights).toContain('no-tests')
  })

  it('detects existing tests for source', () => {
    const result = applyTestingLens('foo.ts', ['foo.ts', 'foo.test.ts'])
    expect(result.highlights).toContain('has-tests')
  })

  it('handles spec files', () => {
    const result = applyTestingLens('foo.spec.ts', ['foo.ts', 'foo.spec.ts'])
    expect(result.highlights).toContain('test-file')
  })

  it('detects good test ratio', () => {
    const allFiles = ['a.ts', 'a.test.ts', 'b.ts', 'b.test.ts', 'c.ts', 'c.test.ts', 'd.test.ts']
    const result = applyTestingLens('a.ts', allFiles)
    expect(result.highlights.some((h) => h.includes('good-test-ratio'))).toBe(true)
  })

  it('detects low test ratio', () => {
    const allFiles = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']
    const result = applyTestingLens('a.ts', allFiles)
    expect(result.highlights.some((h) => h.includes('low-test-ratio'))).toBe(true)
  })
})

// ─── applyFreshnessLens ────────────────────────────────────────────────────────

describe('applyFreshnessLens', () => {
  it('returns 0 for empty file', () => {
    expect(applyFreshnessLens('', null).score).toBe(0)
  })

  it('returns 50 for no git history', () => {
    const result = applyFreshnessLens('file.ts', null)
    expect(result.score).toBe(50)
    expect(result.highlights).toContain('no-git-history')
  })

  it('scores heavily modified higher', () => {
    const result = applyFreshnessLens('file.ts', { linesChanged: 150, totalLines: 200 })
    expect(result.score).toBeGreaterThanOrEqual(50)
    expect(result.highlights).toContain('heavily-modified')
  })

  it('detects actively changed', () => {
    const result = applyFreshnessLens('file.ts', { linesChanged: 30, totalLines: 200 })
    expect(result.highlights).toContain('actively-changed')
  })

  it('detects unchanged', () => {
    const result = applyFreshnessLens('file.ts', { linesChanged: 0, totalLines: 200 })
    expect(result.highlights).toContain('unchanged')
  })

  it('clamps to 0-100', () => {
    const result = applyFreshnessLens('file.ts', { linesChanged: 300, totalLines: 100 })
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

// ─── applyStabilityLens ────────────────────────────────────────────────────────

describe('applyStabilityLens', () => {
  it('returns 0 for empty content', () => {
    expect(applyStabilityLens('', null).score).toBe(0)
  })

  it('scores never-changed high', () => {
    const result = applyStabilityLens('function foo() { return 1 }', { changeCount: 0 })
    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.highlights).toContain('never-changed')
  })

  it('scores frequently-changed low', () => {
    const result = applyStabilityLens('function foo() { return 1 }', { changeCount: 15 })
    expect(result.score).toBeLessThanOrEqual(40)
    expect(result.highlights).toContain('frequently-changed')
  })

  it('detects rarely-changed', () => {
    const result = applyStabilityLens('function foo() { return 1 }', { changeCount: 1 })
    expect(result.highlights).toContain('rarely-changed')
  })

  it('boosts for readonly', () => {
    const withReadonly = applyStabilityLens('const x: readonly number[] = [1, 2]', { changeCount: 0 })
    expect(withReadonly.highlights).toContain('uses-readonly')
  })

  it('penalizes TODOs', () => {
    const withTodo = applyStabilityLens('function foo() { return 1 } // TODO: refactor', { changeCount: 0 })
    const without = applyStabilityLens('function foo() { return 1 }', { changeCount: 0 })
    expect(withTodo.score).toBeLessThanOrEqual(without.score)
  })

  it('blurs documentation and testing', () => {
    const result = applyStabilityLens('const x = 1', null)
    expect(result.blurred).toContain('documentation')
    expect(result.blurred).toContain('testing')
  })
})

// ─── computeMaxNesting ─────────────────────────────────────────────────────────

describe('computeMaxNesting', () => {
  it('returns 0 for flat code', () => {
    expect(computeMaxNesting('const x = 1')).toBe(0)
  })

  it('counts single nesting', () => {
    expect(computeMaxNesting('{ x }')).toBe(1)
  })

  it('counts deep nesting', () => {
    expect(computeMaxNesting('{{{{x}}}}')).toBe(4)
  })

  it('handles unmatched braces gracefully', () => {
    expect(computeMaxNesting('{{{')).toBe(3)
    expect(computeMaxNesting('}}}')).toBe(0)
  })
})

// ─── computeSharpness ──────────────────────────────────────────────────────────

describe('computeSharpness', () => {
  it('returns 0 for empty content', () => {
    expect(computeSharpness(50, '')).toBe(0)
  })

  it('returns low for very short content', () => {
    expect(computeSharpness(50, 'x')).toBe(40)
  })

  it('returns higher for longer content', () => {
    const short = computeSharpness(50, 'const x = 1')
    const long = computeSharpness(50, 'const x = 1\n'.repeat(50))
    expect(long).toBeGreaterThanOrEqual(short)
  })

  it('factors in score extremeness', () => {
    const moderate = computeSharpness(50, 'const x = 1\n'.repeat(20))
    const extreme = computeSharpness(100, 'const x = 1\n'.repeat(20))
    expect(extreme).toBeGreaterThanOrEqual(moderate)
  })

  it('clamps to 0-100', () => {
    expect(computeSharpness(100, 'x\n'.repeat(200))).toBeLessThanOrEqual(100)
  })
})

// ─── classifyDistribution ──────────────────────────────────────────────────────

describe('classifyDistribution', () => {
  it('returns uniform for < 3 scores', () => {
    expect(classifyDistribution([10, 20])).toBe('uniform')
  })

  it('returns uniform for identical scores', () => {
    expect(classifyDistribution([50, 50, 50])).toBe('uniform')
  })

  it('detects skewed', () => {
    expect(classifyDistribution([1, 2, 3, 90])).toBe('skewed')
  })

  it('handles normal-ish distribution', () => {
    const result = classifyDistribution([30, 40, 50, 60, 70])
    expect(['uniform', 'normal']).toContain(result)
  })

  it('returns valid type', () => {
    const result = classifyDistribution([10, 30, 50, 70, 90])
    expect(['uniform', 'normal', 'skewed', 'bimodal']).toContain(result)
  })
})

// ─── findTopFocus / findBottomFocus ────────────────────────────────────────────

describe('findTopFocus', () => {
  it('returns top N files', () => {
    const results: FocusResult[] = [
      { file: 'a.ts', score: 80, rank: 1, highlights: [], blurred: [], sharpness: 90 },
      { file: 'b.ts', score: 60, rank: 2, highlights: [], blurred: [], sharpness: 85 },
      { file: 'c.ts', score: 40, rank: 3, highlights: [], blurred: [], sharpness: 80 },
    ]
    expect(findTopFocus(results, 2)).toEqual(['a.ts', 'b.ts'])
  })

  it('handles empty', () => {
    expect(findTopFocus([], 3)).toEqual([])
  })

  it('handles count > results', () => {
    const results: FocusResult[] = [
      { file: 'a.ts', score: 80, rank: 1, highlights: [], blurred: [], sharpness: 90 },
    ]
    expect(findTopFocus(results, 5)).toEqual(['a.ts'])
  })
})

describe('findBottomFocus', () => {
  it('returns bottom N files', () => {
    const results: FocusResult[] = [
      { file: 'a.ts', score: 80, rank: 3, highlights: [], blurred: [], sharpness: 90 },
      { file: 'b.ts', score: 40, rank: 2, highlights: [], blurred: [], sharpness: 85 },
      { file: 'c.ts', score: 20, rank: 1, highlights: [], blurred: [], sharpness: 80 },
    ]
    expect(findBottomFocus(results, 2)).toEqual(['c.ts', 'b.ts'])
  })

  it('handles empty', () => {
    expect(findBottomFocus([], 3)).toEqual([])
  })
})

// ─── extractImports / resolveImportPath ────────────────────────────────────────

describe('extractImports', () => {
  it('extracts imports', () => {
    expect(extractImports("import { foo } from './bar'")).toEqual(['./bar'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

describe('resolveImportPath', () => {
  it('resolves with .ts extension', () => {
    expect(resolveImportPath('./utils', new Set(['utils.ts']))).toBe('utils.ts')
  })

  it('returns null for unknown', () => {
    expect(resolveImportPath('./unknown', new Set(['a.ts']))).toBeNull()
  })
})

// ─── Stats Functions ───────────────────────────────────────────────────────────

describe('computeOverallClarity', () => {
  it('returns 0 for empty views', () => {
    expect(computeOverallClarity([])).toBe(0)
  })

  it('computes average sharpness', () => {
    const views: LensView[] = [{
      lens: LENSES[0],
      results: [
        { file: 'a.ts', score: 50, rank: 1, highlights: [], blurred: [], sharpness: 80 },
        { file: 'b.ts', score: 50, rank: 2, highlights: [], blurred: [], sharpness: 60 },
      ],
      topFocus: [],
      bottomFocus: [],
      avgScore: 50,
      distribution: 'normal',
    }]
    expect(computeOverallClarity(views)).toBe(70)
  })
})

describe('findBestOverallFile', () => {
  it('returns empty for no views', () => {
    expect(findBestOverallFile([])).toBe('')
  })

  it('finds highest average', () => {
    const views: LensView[] = [{
      lens: LENSES[0],
      results: [
        { file: 'a.ts', score: 90, rank: 1, highlights: [], blurred: [], sharpness: 80 },
        { file: 'b.ts', score: 30, rank: 2, highlights: [], blurred: [], sharpness: 80 },
      ],
      topFocus: [],
      bottomFocus: [],
      avgScore: 60,
      distribution: 'normal',
    }]
    expect(findBestOverallFile(views)).toBe('a.ts')
  })
})

describe('findWorstOverallFile', () => {
  it('finds lowest average', () => {
    const views: LensView[] = [{
      lens: LENSES[0],
      results: [
        { file: 'a.ts', score: 90, rank: 1, highlights: [], blurred: [], sharpness: 80 },
        { file: 'b.ts', score: 30, rank: 2, highlights: [], blurred: [], sharpness: 80 },
      ],
      topFocus: [],
      bottomFocus: [],
      avgScore: 60,
      distribution: 'normal',
    }]
    expect(findWorstOverallFile(views)).toBe('b.ts')
  })
})

describe('findMostConsistent', () => {
  it('finds smallest variance', () => {
    const views: LensView[] = [
      {
        lens: LENSES[0],
        results: [
          { file: 'a.ts', score: 50, rank: 1, highlights: [], blurred: [], sharpness: 80 },
          { file: 'b.ts', score: 90, rank: 2, highlights: [], blurred: [], sharpness: 80 },
        ],
        topFocus: [],
        bottomFocus: [],
        avgScore: 70,
        distribution: 'normal',
      },
      {
        lens: LENSES[1],
        results: [
          { file: 'a.ts', score: 52, rank: 1, highlights: [], blurred: [], sharpness: 80 },
          { file: 'b.ts', score: 10, rank: 2, highlights: [], blurred: [], sharpness: 80 },
        ],
        topFocus: [],
        bottomFocus: [],
        avgScore: 31,
        distribution: 'normal',
      },
    ]
    expect(findMostConsistent(views)).toBe('a.ts')
  })
})

describe('findMostPolarizing', () => {
  it('finds largest variance', () => {
    const views: LensView[] = [
      {
        lens: LENSES[0],
        results: [
          { file: 'a.ts', score: 50, rank: 1, highlights: [], blurred: [], sharpness: 80 },
          { file: 'b.ts', score: 90, rank: 2, highlights: [], blurred: [], sharpness: 80 },
        ],
        topFocus: [],
        bottomFocus: [],
        avgScore: 70,
        distribution: 'normal',
      },
      {
        lens: LENSES[1],
        results: [
          { file: 'a.ts', score: 10, rank: 2, highlights: [], blurred: [], sharpness: 80 },
          { file: 'b.ts', score: 95, rank: 1, highlights: [], blurred: [], sharpness: 80 },
        ],
        topFocus: [],
        bottomFocus: [],
        avgScore: 52,
        distribution: 'normal',
      },
    ]
    expect(findMostPolarizing(views)).toBe('a.ts')
  })
})

// ─── generateLensRecommendations ───────────────────────────────────────────────

describe('generateLensRecommendations', () => {
  it('warns about low-scoring lens', () => {
    const views: LensView[] = [{
      lens: LENSES[0],
      results: [
        { file: 'a.ts', score: 10, rank: 1, highlights: [], blurred: [], sharpness: 80 },
      ],
      topFocus: [],
      bottomFocus: [],
      avgScore: 10,
      distribution: 'normal',
    }]
    const stats = { mostPolarizing: '', mostConsistent: '', overallClarity: 80 } as LensStats
    const recs = generateLensRecommendations(views, stats)
    expect(recs.some((r) => r.includes('complexity'))).toBe(true)
  })

  it('warns about polarizing files', () => {
    const stats = { mostPolarizing: 'wild.ts', mostConsistent: '', overallClarity: 80 } as LensStats
    const recs = generateLensRecommendations([], stats)
    expect(recs.some((r) => r.includes('wild.ts'))).toBe(true)
  })

  it('recommends consistent files as standards', () => {
    const stats = { mostPolarizing: '', mostConsistent: 'stable.ts', overallClarity: 80 } as LensStats
    const recs = generateLensRecommendations([], stats)
    expect(recs.some((r) => r.includes('stable.ts'))).toBe(true)
  })

  it('warns about low clarity', () => {
    const stats = { mostPolarizing: '', mostConsistent: '', overallClarity: 30 } as LensStats
    const recs = generateLensRecommendations([], stats)
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('provides positive feedback when things look good', () => {
    const stats = { mostPolarizing: '', mostConsistent: '', overallClarity: 80 } as LensStats
    const views: LensView[] = [{
      lens: LENSES[0],
      results: [{ file: 'a.ts', score: 80, rank: 1, highlights: [], blurred: [], sharpness: 80 }],
      topFocus: [],
      bottomFocus: [],
      avgScore: 80,
      distribution: 'normal',
    }]
    const recs = generateLensRecommendations(views, stats)
    expect(recs.some((r) => r.includes('well-balanced'))).toBe(true)
  })
})

// ─── buildLensResult ───────────────────────────────────────────────────────────

describe('buildLensResult', () => {
  it('handles empty input', () => {
    const result = buildLensResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.views).toHaveLength(6)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('creates 6 lens views', () => {
    const result = buildLensResult(['a.ts'], ['const x = 1'], {})
    expect(result.views).toHaveLength(6)
  })

  it('computes correct stats', () => {
    const result = buildLensResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.lensCount).toBe(6)
    expect(result.stats.overallClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallClarity).toBeLessThanOrEqual(100)
  })

  it('assigns ranks to results', () => {
    const result = buildLensResult(['a.ts', 'b.ts'], ['const x = 1', 'function foo() { if(x){}for(let i=0;i<10;i++){}while(true){} }'], {})
    for (const view of result.views) {
      for (const r of view.results) {
        expect(r.rank).toBeGreaterThanOrEqual(1)
        expect(r.rank).toBeLessThanOrEqual(2)
      }
    }
  })

  it('finds best and worst files', () => {
    const files = ['good.ts', 'bad.ts']
    const contents = [
      '/** Docs */\nfunction foo(): string { return "hello" }',
      'var x = 1 // TODO: fix',
    ]
    const result = buildLensResult(files, contents, {})
    expect(result.stats.bestOverallFile).toBeTruthy()
    expect(result.stats.worstOverallFile).toBeTruthy()
  })

  it('handles verbose mode', () => {
    const result = buildLensResult(['a.ts'], ['const x = 1'], { verbose: true })
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes top and bottom focus per view', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = ['const x = 1', 'function foo() {}', 'interface Bar {}']
    const result = buildLensResult(files, contents, {})
    for (const view of result.views) {
      expect(view.topFocus.length).toBeLessThanOrEqual(5)
      expect(view.bottomFocus.length).toBeLessThanOrEqual(5)
    }
  })

  it('computes distribution per view', () => {
    const result = buildLensResult(['a.ts', 'b.ts', 'c.ts'], ['x', 'y', 'z'], {})
    for (const view of result.views) {
      expect(['uniform', 'normal', 'skewed', 'bimodal']).toContain(view.distribution)
    }
  })

  it('computes dominant distribution', () => {
    const result = buildLensResult(['a.ts'], ['const x = 1'], {})
    expect(['uniform', 'normal', 'skewed', 'bimodal']).toContain(result.stats.dominantDistribution)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatLensSelector', () => {
  it('formats lens selector', () => {
    const views: LensView[] = [{
      lens: LENSES[0],
      results: [],
      topFocus: [],
      bottomFocus: [],
      avgScore: 50,
      distribution: 'normal',
    }]
    const result = formatLensSelector(views)
    expect(result).toContain('Lens Selector')
    expect(result).toContain('complexity')
  })
})

describe('formatFocusResults', () => {
  it('formats focus results', () => {
    const view: LensView = {
      lens: LENSES[0],
      results: [
        { file: 'a.ts', score: 80, rank: 1, highlights: ['deep-nesting(4)'], blurred: [], sharpness: 90 },
      ],
      topFocus: ['a.ts'],
      bottomFocus: [],
      avgScore: 80,
      distribution: 'normal',
    }
    const result = formatFocusResults(view)
    expect(result).toContain('complexity')
    expect(result).toContain('a.ts')
    expect(result).toContain('deep-nesting')
  })
})

describe('formatDistributionChart', () => {
  it('formats chart', () => {
    const result = formatDistributionChart([10, 30, 50, 70, 90])
    expect(result).toContain('Score Distribution')
    expect(result).toContain('0-19')
    expect(result).toContain('80-100')
  })
})

describe('formatClarityMeter', () => {
  it('formats clarity meter', () => {
    expect(formatClarityMeter(75)).toContain('Clarity')
    expect(formatClarityMeter(75)).toContain('75%')
  })
})

describe('formatConsistencyPolarization', () => {
  it('formats stats', () => {
    const stats: LensStats = {
      lensCount: 6,
      totalFiles: 3,
      bestOverallFile: 'good.ts',
      worstOverallFile: 'bad.ts',
      mostConsistent: 'stable.ts',
      mostPolarizing: 'wild.ts',
      overallClarity: 80,
      dominantDistribution: 'normal',
    }
    const result = formatConsistencyPolarization(stats)
    expect(result).toContain('stable.ts')
    expect(result).toContain('wild.ts')
  })
})

describe('formatLensRecommendations', () => {
  it('formats recommendations', () => {
    expect(formatLensRecommendations(['Improve testing'])).toContain('Improve testing')
  })
})

describe('formatLensJson', () => {
  it('formats as JSON', () => {
    const result = buildLensResult(['a.ts'], ['const x = 1'], {})
    const json = formatLensJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatLensTable', () => {
  it('formats as table', () => {
    const result = buildLensResult(['a.ts'], ['const x = 1'], {})
    const table = formatLensTable(result)
    expect(table).toContain('Lens Selector')
    expect(table).toContain('Score Distribution')
    expect(table).toContain('Clarity')
  })
})
