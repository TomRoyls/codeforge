import { describe, expect, it } from 'vitest'

import {
  buildCartogramResult,
  buildStats,
  compareRegions,
  computeArea,
  computeBugRisk,
  computeCyclomaticComplexity,
  computeDistribution,
  computeOverallBalance,
  countDependencies,
  countEffectiveLines,
  countExported,
  countFunctions,
  countTests,
  createAllViews,
  createView,
  generateCartogramRecommendations,
  groupFilesByRegion,
  type CartogramStats,
  type CartogramView,
  type ComparisonView,
  type Region,
  type RegionMetric,
} from '../src/commands/cartogram-helpers.js'

import {
  formatAllViews,
  formatBalanceMeter,
  formatCartogramBlocks,
  formatCartogramJSON,
  formatCartogramStats,
  formatCartogramTable,
  formatComparisonTable,
  formatRecommendations,
  formatRegionOverview,
} from '../src/commands/cartogram-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SRC_CONTENT = `import { Command } from '@oclif/core'
import { readFileSync } from 'node:fs'

export function processData(data: string): string {
  if (!data) throw new Error('empty')
  for (let i = 0; i < data.length; i++) {
    if (data[i] === 'x') {
      return data.toUpperCase()
    }
  }
  return data
}

export function validate(input: string): boolean {
  return input.length > 0
}

export const VERSION = '1.0'
`

const TEST_CONTENT = `import { describe, expect, it } from 'vitest'

describe('processData', () => {
  it('handles empty', () => {
    expect(() => processData('')).toThrow()
  })

  it('returns uppercase x', () => {
    expect(processData('ax')).toBe('AX')
  })

  it('returns input unchanged', () => {
    expect(processData('abc')).toBe('abc')
  })
})

describe('validate', () => {
  it('returns true for non-empty', () => {
    expect(validate('x')).toBe(true)
  })

  it('returns false for empty', () => {
    expect(validate('')).toBe(false)
  })
})
`

const UTILS_CONTENT = `export function add(a: number, b: number): number { return a + b }
export function subtract(a: number, b: number): number { return a - b }
`

const EMPTY_CONTENT = ''

// ─── groupFilesByRegion ───────────────────────────────────────────────────────

describe('groupFilesByRegion', () => {
  it('groups by directory', () => {
    const regions = groupFilesByRegion(['src/a.ts', 'src/b.ts', 'test/a.test.ts'])
    expect(regions.get('src')).toEqual(['src/a.ts', 'src/b.ts'])
    expect(regions.get('test')).toEqual(['test/a.test.ts'])
  })

  it('handles root files', () => {
    const regions = groupFilesByRegion(['index.ts'])
    expect(regions.get('(root)')).toEqual(['index.ts'])
  })

  it('handles nested paths', () => {
    const regions = groupFilesByRegion(['src/commands/a.ts', 'src/commands/b.ts'])
    expect(regions.get('src/commands')?.length).toBe(2)
  })

  it('returns empty for no files', () => {
    expect(groupFilesByRegion([]).size).toBe(0)
  })
})

// ─── countEffectiveLines ──────────────────────────────────────────────────────

describe('countEffectiveLines', () => {
  it('counts code lines', () => {
    expect(countEffectiveLines('const x = 1\nconst y = 2')).toBe(2)
  })

  it('skips blank lines', () => {
    expect(countEffectiveLines('const x = 1\n\n\nconst y = 2')).toBe(2)
  })

  it('skips comment lines', () => {
    expect(countEffectiveLines('const x = 1\n// comment\n/* block */')).toBe(1)
  })

  it('returns 0 for empty', () => {
    expect(countEffectiveLines('')).toBe(0)
  })
})

// ─── computeCyclomaticComplexity ──────────────────────────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for flat code', () => {
    expect(computeCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('counts if/for/while', () => {
    expect(computeCyclomaticComplexity('if (a) { for (let i = 0; i < 10; i++) { while (b) {} } }')).toBe(4)
  })

  it('counts switch cases', () => {
    expect(computeCyclomaticComplexity('switch (x) { case 1: break; case 2: break; }')).toBe(4)
  })
})

// ─── countFunctions ───────────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('counts named functions', () => {
    expect(countFunctions('function foo() {}')).toBeGreaterThanOrEqual(1)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const bar = () => {}')).toBeGreaterThanOrEqual(1)
  })

  it('returns 0 for no functions', () => {
    expect(countFunctions('const x = 1')).toBe(0)
  })
})

// ─── countTests ───────────────────────────────────────────────────────────────

describe('countTests', () => {
  it('counts it() blocks', () => {
    expect(countTests("it('works', () => {})")).toBe(1)
  })

  it('counts test() blocks', () => {
    expect(countTests("test('works', () => {})")).toBe(1)
  })

  it('counts multiple', () => {
    expect(countTests("it('a', () => {})\nit('b', () => {})")).toBe(2)
  })

  it('returns 0 for no tests', () => {
    expect(countTests('const x = 1')).toBe(0)
  })
})

// ─── countDependencies ────────────────────────────────────────────────────────

describe('countDependencies', () => {
  it('counts imports', () => {
    expect(countDependencies("import { a } from 'x'")).toBe(1)
  })

  it('counts require', () => {
    expect(countDependencies("const x = require('y')")).toBe(1)
  })

  it('counts both', () => {
    expect(countDependencies("import { a } from 'x'\nconst b = require('y')")).toBe(2)
  })
})

// ─── countExported ────────────────────────────────────────────────────────────

describe('countExported', () => {
  it('counts exports', () => {
    expect(countExported('export function foo() {}\nexport const bar = 1')).toBe(2)
  })

  it('returns 0 for no exports', () => {
    expect(countExported('const x = 1')).toBe(0)
  })
})

// ─── computeBugRisk ───────────────────────────────────────────────────────────

describe('computeBugRisk', () => {
  it('returns 0 for minimal code', () => {
    expect(computeBugRisk({ complexity: 1, linesOfCode: 5, changeFrequency: 0, functionCount: 1, testCount: 1, dependencyCount: 0, exportCount: 0 })).toBeLessThanOrEqual(10)
  })

  it('increases with complexity', () => {
    const low = computeBugRisk({ complexity: 5, linesOfCode: 50, changeFrequency: 0, functionCount: 3, testCount: 3, dependencyCount: 2, exportCount: 2 })
    const high = computeBugRisk({ complexity: 50, linesOfCode: 50, changeFrequency: 0, functionCount: 3, testCount: 3, dependencyCount: 2, exportCount: 2 })
    expect(high).toBeGreaterThan(low)
  })

  it('caps at 100', () => {
    expect(computeBugRisk({ complexity: 200, linesOfCode: 2000, changeFrequency: 10, functionCount: 100, testCount: 0, dependencyCount: 50, exportCount: 50 })).toBeLessThanOrEqual(100)
  })
})

// ─── computeArea ──────────────────────────────────────────────────────────────

describe('computeArea', () => {
  it('computes proportional area', () => {
    expect(computeArea(50, 100, 50)).toBe(25)
  })

  it('returns max for equal to max', () => {
    expect(computeArea(100, 100, 50)).toBe(50)
  })

  it('returns minimum of 1', () => {
    expect(computeArea(0, 100, 50)).toBe(1)
  })

  it('handles zero max', () => {
    expect(computeArea(0, 0, 50)).toBe(1)
  })
})

// ─── computeDistribution ──────────────────────────────────────────────────────

describe('computeDistribution', () => {
  it('returns extreme for dominant region', () => {
    const regions: RegionMetric[] = [
      { name: 'a', value: 80, percentage: 80, area: 50, rank: 1, color: 'bright' },
      { name: 'b', value: 10, percentage: 10, area: 6, rank: 2, color: 'dim' },
      { name: 'c', value: 10, percentage: 10, area: 6, rank: 3, color: 'dim' },
    ]
    expect(computeDistribution(regions)).toBe('extreme')
  })

  it('returns concentrated for moderate dominance', () => {
    const regions: RegionMetric[] = [
      { name: 'a', value: 50, percentage: 50, area: 25, rank: 1, color: 'bright' },
      { name: 'b', value: 30, percentage: 30, area: 15, rank: 2, color: 'medium' },
      { name: 'c', value: 20, percentage: 20, area: 10, rank: 3, color: 'dim' },
    ]
    expect(computeDistribution(regions)).toBe('concentrated')
  })

  it('returns balanced for even distribution', () => {
    const regions: RegionMetric[] = [
      { name: 'a', value: 34, percentage: 34, area: 17, rank: 1, color: 'bright' },
      { name: 'b', value: 33, percentage: 33, area: 16, rank: 2, color: 'medium' },
      { name: 'c', value: 33, percentage: 33, area: 16, rank: 3, color: 'medium' },
    ]
    expect(computeDistribution(regions)).toBe('balanced')
  })

  it('returns balanced for single region', () => {
    expect(computeDistribution([{ name: 'a', value: 100, percentage: 100, area: 50, rank: 1, color: 'bright' }])).toBe('balanced')
  })
})

// ─── createView ───────────────────────────────────────────────────────────────

describe('createView', () => {
  const regions: Region[] = [
    { name: 'src', files: ['src/a.ts'], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 0, dependencyCount: 3, exportCount: 4, changeFrequency: 2, bugRiskScore: 30 } },
    { name: 'test', files: ['test/a.test.ts'], metrics: { linesOfCode: 50, complexity: 3, functionCount: 2, testCount: 5, dependencyCount: 1, exportCount: 0, changeFrequency: 1, bugRiskScore: 10 } },
  ]

  it('creates view with correct name', () => {
    const view = createView(regions, 'linesOfCode', 'Size View', 'desc')
    expect(view.name).toBe('Size View')
  })

  it('computes total', () => {
    const view = createView(regions, 'linesOfCode', 'Size View', 'desc')
    expect(view.total).toBe(150)
  })

  it('ranks by value descending', () => {
    const view = createView(regions, 'linesOfCode', 'Size View', 'desc')
    expect(view.regions[0]!.rank).toBe(1)
    expect(view.regions[0]!.name).toBe('src')
  })

  it('computes percentages', () => {
    const view = createView(regions, 'linesOfCode', 'Size View', 'desc')
    expect(view.regions[0]!.percentage).toBe(67)
  })

  it('computes areas', () => {
    const view = createView(regions, 'linesOfCode', 'Size View', 'desc')
    expect(view.regions[0]!.area).toBe(50)
  })
})

// ─── createAllViews ───────────────────────────────────────────────────────────

describe('createAllViews', () => {
  const regions: Region[] = [
    { name: 'src', files: ['src/a.ts'], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 0, dependencyCount: 3, exportCount: 4, changeFrequency: 2, bugRiskScore: 30 } },
  ]

  it('creates 7 views', () => {
    expect(createAllViews(regions).length).toBe(7)
  })

  it('includes Size View', () => {
    expect(createAllViews(regions).some((v) => v.name === 'Size View')).toBe(true)
  })

  it('includes Risk View', () => {
    expect(createAllViews(regions).some((v) => v.name === 'Risk View')).toBe(true)
  })
})

// ─── compareRegions ───────────────────────────────────────────────────────────

describe('compareRegions', () => {
  it('compares regions', () => {
    const regions: Region[] = [
      { name: 'src', files: ['src/a.ts'], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 0, dependencyCount: 3, exportCount: 4, changeFrequency: 2, bugRiskScore: 30 } },
    ]
    const comp = compareRegions(regions)
    expect(comp.length).toBe(1)
    expect(comp[0]!.region).toBe('src')
    expect(comp[0]!.metrics.linesOfCode).toBe(100)
  })

  it('identifies dominant metric', () => {
    const regions: Region[] = [
      { name: 'big', files: [], metrics: { linesOfCode: 500, complexity: 5, functionCount: 2, testCount: 0, dependencyCount: 1, exportCount: 1, changeFrequency: 0, bugRiskScore: 3 } },
    ]
    const comp = compareRegions(regions)
    expect(comp[0]!.dominant).toBe('linesOfCode')
  })

  it('identifies weakest metric', () => {
    const regions: Region[] = [
      { name: 'r', files: [], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 0, dependencyCount: 3, exportCount: 2, changeFrequency: 2, bugRiskScore: 20 } },
    ]
    const comp = compareRegions(regions)
    expect(comp[0]!.weakest).toBe('testCount')
  })
})

// ─── computeOverallBalance ────────────────────────────────────────────────────

describe('computeOverallBalance', () => {
  it('returns 100 for empty views', () => {
    expect(computeOverallBalance([])).toBe(100)
  })

  it('returns 100 for single region views', () => {
    const views: CartogramView[] = [{
      name: 'test', description: '', total: 100, max: 100, distribution: 'balanced',
      regions: [{ name: 'a', value: 100, percentage: 100, area: 50, rank: 1, color: 'bright' }],
    }]
    expect(computeOverallBalance(views)).toBe(100)
  })

  it('penalizes imbalanced views', () => {
    const views: CartogramView[] = [{
      name: 'test', description: '', total: 110, max: 100, distribution: 'extreme',
      regions: [
        { name: 'a', value: 100, percentage: 91, area: 50, rank: 1, color: 'bright' },
        { name: 'b', value: 10, percentage: 9, area: 5, rank: 2, color: 'dim' },
      ],
    }]
    expect(computeOverallBalance(views)).toBeLessThan(100)
  })
})

// ─── buildStats ───────────────────────────────────────────────────────────────

describe('buildStats', () => {
  it('builds stats correctly', () => {
    const regions: Region[] = [
      { name: 'src', files: ['src/a.ts'], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 0, dependencyCount: 3, exportCount: 4, changeFrequency: 2, bugRiskScore: 30 } },
      { name: 'test', files: ['test/a.test.ts'], metrics: { linesOfCode: 50, complexity: 3, functionCount: 2, testCount: 5, dependencyCount: 1, exportCount: 0, changeFrequency: 1, bugRiskScore: 10 } },
    ]
    const views = createAllViews(regions)
    const comparison = compareRegions(regions)
    const stats = buildStats(regions, views, comparison)
    expect(stats.regionCount).toBe(2)
    expect(stats.viewCount).toBe(7)
    expect(stats.dominantRegion).toBe('src')
    expect(stats.smallestRegion).toBe('test')
  })
})

// ─── generateCartogramRecommendations ─────────────────────────────────────────

describe('generateCartogramRecommendations', () => {
  it('warns about extreme distributions', () => {
    const regions: Region[] = [
      { name: 'big', files: [], metrics: { linesOfCode: 900, complexity: 100, functionCount: 50, testCount: 2, dependencyCount: 20, exportCount: 15, changeFrequency: 5, bugRiskScore: 80 } },
      { name: 'small', files: [], metrics: { linesOfCode: 10, complexity: 1, functionCount: 1, testCount: 0, dependencyCount: 0, exportCount: 0, changeFrequency: 0, bugRiskScore: 2 } },
    ]
    const views = createAllViews(regions)
    const comparison = compareRegions(regions)
    const stats = buildStats(regions, views, comparison)
    const recs = generateCartogramRecommendations(regions, views, comparison, stats)
    expect(recs.some((r) => r.includes('dominates') || r.includes('Split') || r.includes('split'))).toBe(true)
  })

  it('warns about high risk large regions', () => {
    const regions: Region[] = [
      { name: 'risky', files: [], metrics: { linesOfCode: 300, complexity: 80, functionCount: 30, testCount: 1, dependencyCount: 15, exportCount: 10, changeFrequency: 4, bugRiskScore: 70 } },
    ]
    const views = createAllViews(regions)
    const comparison = compareRegions(regions)
    const stats = buildStats(regions, views, comparison)
    const recs = generateCartogramRecommendations(regions, views, comparison, stats)
    expect(recs.some((r) => r.includes('priority') || r.includes('review') || r.includes('risk'))).toBe(true)
  })

  it('praises balanced codebase', () => {
    const regions: Region[] = [
      { name: 'a', files: [], metrics: { linesOfCode: 30, complexity: 3, functionCount: 2, testCount: 2, dependencyCount: 1, exportCount: 1, changeFrequency: 0, bugRiskScore: 2 } },
      { name: 'b', files: [], metrics: { linesOfCode: 35, complexity: 4, functionCount: 2, testCount: 2, dependencyCount: 1, exportCount: 1, changeFrequency: 0, bugRiskScore: 3 } },
      { name: 'c', files: [], metrics: { linesOfCode: 33, complexity: 3, functionCount: 2, testCount: 2, dependencyCount: 1, exportCount: 1, changeFrequency: 0, bugRiskScore: 2 } },
    ]
    const views = createAllViews(regions)
    const comparison = compareRegions(regions)
    const stats = buildStats(regions, views, comparison)
    const recs = generateCartogramRecommendations(regions, views, comparison, stats)
    expect(recs.some((r) => r.includes('balanced') || r.includes('well-balanced') || r.includes('monitor'))).toBe(true)
  })
})

// ─── buildCartogramResult ─────────────────────────────────────────────────────

describe('buildCartogramResult', () => {
  it('builds complete result', () => {
    const result = buildCartogramResult(
      ['src/a.ts', 'test/a.test.ts'],
      [SRC_CONTENT, TEST_CONTENT],
    )
    expect(result.regions.length).toBe(2)
    expect(result.views.length).toBe(7)
    expect(result.comparison.length).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildCartogramResult([], [])
    expect(result.regions).toEqual([])
    expect(result.stats.regionCount).toBe(0)
  })

  it('groups files by directory', () => {
    const result = buildCartogramResult(
      ['src/a.ts', 'src/b.ts', 'test/a.test.ts'],
      [SRC_CONTENT, UTILS_CONTENT, TEST_CONTENT],
    )
    expect(result.regions.length).toBe(2)
    const srcRegion = result.regions.find((r) => r.name === 'src')
    expect(srcRegion?.files.length).toBe(2)
  })

  it('computes metrics correctly', () => {
    const result = buildCartogramResult(
      ['src/a.ts'],
      [SRC_CONTENT],
    )
    const src = result.regions[0]!
    expect(src.metrics.linesOfCode).toBeGreaterThan(0)
    expect(src.metrics.functionCount).toBeGreaterThan(0)
    expect(src.metrics.exportCount).toBeGreaterThan(0)
    expect(src.metrics.bugRiskScore).toBeGreaterThanOrEqual(0)
  })

  it('identifies dominant and smallest', () => {
    const result = buildCartogramResult(
      ['src/big.ts', 'utils/small.ts'],
      [SRC_CONTENT, UTILS_CONTENT],
    )
    expect(result.stats.dominantRegion).toBeTruthy()
    expect(result.stats.smallestRegion).toBeTruthy()
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatCartogramBlocks', () => {
  it('formats blocks', () => {
    const view: CartogramView = {
      name: 'Size View', description: 'desc', total: 100, max: 100, distribution: 'balanced',
      regions: [{ name: 'src', value: 100, percentage: 100, area: 50, rank: 1, color: 'bright' }],
    }
    expect(formatCartogramBlocks(view)).toContain('Size View')
  })

  it('handles empty', () => {
    const view: CartogramView = { name: 'test', description: '', total: 0, max: 0, distribution: 'balanced', regions: [] }
    expect(formatCartogramBlocks(view)).toContain('No regions')
  })
})

describe('formatAllViews', () => {
  it('formats all views', () => {
    const views = createAllViews([
      { name: 'src', files: [], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 2, dependencyCount: 3, exportCount: 4, changeFrequency: 1, bugRiskScore: 20 } },
    ])
    const output = formatAllViews(views)
    expect(output).toContain('Size View')
    expect(output).toContain('Risk View')
  })
})

describe('formatComparisonTable', () => {
  it('formats comparison', () => {
    const comp: ComparisonView[] = [{ region: 'src', metrics: { linesOfCode: 100 }, dominant: 'linesOfCode', weakest: 'linesOfCode' }]
    expect(formatComparisonTable(comp)).toContain('src')
  })

  it('handles empty', () => {
    expect(formatComparisonTable([])).toContain('No comparison')
  })
})

describe('formatBalanceMeter', () => {
  it('formats meter', () => {
    expect(formatBalanceMeter(75)).toContain('75/100')
  })
})

describe('formatCartogramStats', () => {
  it('formats stats', () => {
    const stats: CartogramStats = {
      regionCount: 5, viewCount: 7, mostBalancedRegion: 'a', leastBalancedRegion: 'b',
      overallBalance: 65, dominantRegion: 'src', smallestRegion: 'utils',
    }
    const output = formatCartogramStats(stats)
    expect(output).toContain('5')
    expect(output).toContain('65/100')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    expect(formatRecommendations(['Split X'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatRegionOverview', () => {
  it('formats regions', () => {
    const regions: Region[] = [
      { name: 'src', files: ['a.ts'], metrics: { linesOfCode: 100, complexity: 10, functionCount: 5, testCount: 2, dependencyCount: 3, exportCount: 4, changeFrequency: 1, bugRiskScore: 20 } },
    ]
    const output = formatRegionOverview(regions)
    expect(output).toContain('src')
    expect(output).toContain('100')
  })

  it('handles empty', () => {
    expect(formatRegionOverview([])).toContain('No regions')
  })
})

describe('formatCartogramTable', () => {
  it('formats full table', () => {
    const result = buildCartogramResult(['src/a.ts'], [SRC_CONTENT])
    const output = formatCartogramTable(result)
    expect(output).toContain('Regions')
    expect(output).toContain('Size View')
  })
})

describe('formatCartogramJSON', () => {
  it('formats valid JSON', () => {
    const result = buildCartogramResult(['src/a.ts'], [SRC_CONTENT])
    const json = formatCartogramJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.regions).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes realistic codebase', () => {
    const result = buildCartogramResult(
      ['src/commands/count.ts', 'src/commands/list.ts', 'test/count.test.ts'],
      [SRC_CONTENT, UTILS_CONTENT, TEST_CONTENT],
    )
    expect(result.regions.length).toBe(2)
    expect(result.views.length).toBe(7)
    expect(result.comparison.length).toBe(2)
  })

  it('round-trips through JSON', () => {
    const result = buildCartogramResult(['src/a.ts'], [SRC_CONTENT])
    const json = formatCartogramJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.regions.length).toBe(result.regions.length)
    expect(parsed.stats.overallBalance).toBe(result.stats.overallBalance)
  })

  it('handles single file', () => {
    const result = buildCartogramResult(['index.ts'], [SRC_CONTENT])
    expect(result.regions.length).toBe(1)
    expect(result.stats.regionCount).toBe(1)
    expect(result.stats.dominantRegion).toBe('(root)')
  })
})
