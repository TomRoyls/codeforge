import { describe, expect, it } from 'vitest'
import {
  buildAtlas,
  buildAtlasResult,
  computeRegionStats,
  computeHealthScore,
  findHealthiestRegion,
  findLargestRegion,
  findMostComplexRegion,
  findUnhealthiestRegion,
  generateLegend,
  generateRecommendations,
  inferRegionDescription,
  type AtlasRegion,
  type AtlasStats,
} from '../src/commands/atlas-helpers.js'
import {
  formatAtlasJson,
  formatAtlasReport,
  formatFullTree,
  formatLegend,
  formatRecommendations,
  formatRegionCard,
  formatRegionRow,
  formatRegionTable,
  formatStats,
  healthBar,
  healthIndicator,
} from '../src/commands/atlas-format-helpers.js'

// ─── computeRegionStats ───────────────────────────────────────────────────────

describe('computeRegionStats', () => {
  it('returns zeros for empty input', () => {
    const stats = computeRegionStats([], [])
    expect(stats.files).toBe(0)
    expect(stats.totalLines).toBe(0)
    expect(stats.codeLines).toBe(0)
  })

  it('counts files', () => {
    const stats = computeRegionStats(['a.ts', 'b.ts'], ['x', 'y'])
    expect(stats.files).toBe(2)
  })

  it('counts total lines', () => {
    const stats = computeRegionStats(['a.ts'], ['line1\nline2\nline3'])
    expect(stats.totalLines).toBe(3)
  })

  it('counts code lines excluding blanks and comments', () => {
    const code = 'const x = 1\n// comment\n\nconst y = 2'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.codeLines).toBe(2)
    expect(stats.commentLines).toBe(1)
  })

  it('counts block comments', () => {
    const code = '/* block\ncomment */\nconst x = 1'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.commentLines).toBe(2)
  })

  it('counts exports', () => {
    const code = 'export function foo() {}\nexport const bar = 1'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.exports).toBe(2)
  })

  it('counts imports', () => {
    const code = 'import { x } from "a"\nimport { y } from "b"'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.imports).toBe(2)
  })

  it('counts functions', () => {
    const code = 'function foo() {}\nfunction bar() {}'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.functions).toBe(2)
  })

  it('counts classes', () => {
    const code = 'class A {}\nclass B {}'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.classes).toBe(2)
  })

  it('counts test files', () => {
    const stats = computeRegionStats(['foo.test.ts'], ['test("x", () => {})'])
    expect(stats.testFiles).toBe(1)
  })

  it('counts spec files as test files', () => {
    const stats = computeRegionStats(['foo.spec.ts'], ['it("x", () => {})'])
    expect(stats.testFiles).toBe(1)
  })

  it('detects languages from extensions', () => {
    const stats = computeRegionStats(['a.ts', 'b.py'], ['', ''])
    expect(stats.languages).toContain('TypeScript')
    expect(stats.languages).toContain('Python')
  })

  it('computes complexity', () => {
    const code = 'if (a) {}\nfor (let i = 0; i < 10; i++) {}'
    const stats = computeRegionStats(['a.ts'], [code])
    expect(stats.complexity).toBeGreaterThan(0)
  })

  it('computes health score', () => {
    const stats = computeRegionStats(['a.ts'], ['function foo() {}'])
    expect(stats.healthScore).toBeGreaterThanOrEqual(0)
    expect(stats.healthScore).toBeLessThanOrEqual(100)
  })
})

// ─── inferRegionDescription ───────────────────────────────────────────────────

describe('inferRegionDescription', () => {
  it('describes commands directory', () => {
    expect(inferRegionDescription('src/commands', ['count.ts'])).toBe('CLI command implementations')
  })

  it('describes core directory', () => {
    expect(inferRegionDescription('src/core', ['file-discovery.ts'])).toBe('Core library functions')
  })

  it('describes test directory', () => {
    expect(inferRegionDescription('test', ['foo.test.ts'])).toBe('Test suites')
  })

  it('describes utils directory', () => {
    expect(inferRegionDescription('src/utils', ['helpers.ts'])).toBe('Utility functions')
  })

  it('describes components directory', () => {
    expect(inferRegionDescription('src/components', ['Button.tsx'])).toBe('UI components')
  })

  it('describes empty directory', () => {
    expect(inferRegionDescription('src/empty', [])).toBe('Empty directory')
  })

  it('describes unknown directory with file count', () => {
    expect(inferRegionDescription('src/custom', ['a.ts', 'b.ts'])).toContain('file(s)')
  })

  it('describes all-test directory as test suites', () => {
    expect(inferRegionDescription('stuff', ['a.test.ts', 'b.spec.ts'])).toBe('Test suites')
  })
})

// ─── computeHealthScore ───────────────────────────────────────────────────────

describe('computeHealthScore', () => {
  it('returns the region health score', () => {
    const region: AtlasRegion = {
      path: 'src', name: 'src', files: 1, totalLines: 10, codeLines: 8,
      commentLines: 2, exports: 1, imports: 0, complexity: 1, testFiles: 0,
      functions: 1, classes: 0, languages: ['TypeScript'], lastModified: '',
      healthScore: 65, subregions: [], description: '',
    }
    expect(computeHealthScore(region)).toBe(65)
  })
})

// ─── buildAtlas ───────────────────────────────────────────────────────────────

describe('buildAtlas', () => {
  it('builds atlas from empty input', () => {
    const root = buildAtlas([], [])
    expect(root.files).toBe(0)
    expect(root.subregions).toEqual([])
  })

  it('builds single region for flat files', () => {
    const root = buildAtlas(['a.ts', 'b.ts'], ['x', 'y'])
    expect(root.files).toBe(2)
    expect(root.totalLines).toBe(2)
  })

  it('builds nested regions for subdirectories', () => {
    const root = buildAtlas(
      ['src/a.ts', 'src/commands/b.ts'],
      ['code1', 'code2'],
    )
    expect(root.subregions.length).toBeGreaterThan(0)
  })

  it('aggregates stats across subregions', () => {
    const root = buildAtlas(
      ['src/a.ts', 'src/commands/b.ts', 'src/commands/c.ts'],
      ['line1', 'line2', 'line3'],
    )
    expect(root.files).toBe(3)
    expect(root.totalLines).toBe(3)
  })

  it('preserves path hierarchy', () => {
    const root = buildAtlas(
      ['src/core/a.ts', 'src/commands/b.ts'],
      ['x', 'y'],
    )
    expect(root.path).toBeTruthy()
    expect(root.subregions.length).toBeGreaterThan(0)
  })

  it('generates description for root', () => {
    const root = buildAtlas(['src/a.ts'], ['code'])
    expect(root.description).toBeTruthy()
  })
})

// ─── findLargestRegion ────────────────────────────────────────────────────────

describe('findLargestRegion', () => {
  it('returns empty string for empty array', () => {
    expect(findLargestRegion([])).toBe('')
  })

  it('finds region with most lines', () => {
    const regions: AtlasRegion[] = [
      makeRegion('small', 10),
      makeRegion('large', 100),
      makeRegion('medium', 50),
    ]
    expect(findLargestRegion(regions)).toBe('large')
  })
})

// ─── findMostComplexRegion ────────────────────────────────────────────────────

describe('findMostComplexRegion', () => {
  it('returns empty string for empty array', () => {
    expect(findMostComplexRegion([])).toBe('')
  })

  it('finds region with highest complexity', () => {
    const regions: AtlasRegion[] = [
      { ...makeRegion('simple', 10), complexity: 5 },
      { ...makeRegion('complex', 10), complexity: 50 },
    ]
    expect(findMostComplexRegion(regions)).toBe('complex')
  })
})

// ─── findHealthiestRegion ─────────────────────────────────────────────────────

describe('findHealthiestRegion', () => {
  it('returns empty string for empty array', () => {
    expect(findHealthiestRegion([])).toBe('')
  })

  it('finds region with highest health', () => {
    const regions: AtlasRegion[] = [
      { ...makeRegion('sick', 10), healthScore: 30 },
      { ...makeRegion('healthy', 10), healthScore: 90 },
    ]
    expect(findHealthiestRegion(regions)).toBe('healthy')
  })
})

// ─── findUnhealthiestRegion ───────────────────────────────────────────────────

describe('findUnhealthiestRegion', () => {
  it('returns empty string for empty array', () => {
    expect(findUnhealthiestRegion([])).toBe('')
  })

  it('finds region with lowest health', () => {
    const regions: AtlasRegion[] = [
      { ...makeRegion('sick', 10), healthScore: 20 },
      { ...makeRegion('ok', 10), healthScore: 70 },
    ]
    expect(findUnhealthiestRegion(regions)).toBe('sick')
  })
})

function makeRegion(path: string, lines: number): AtlasRegion {
  return {
    path, name: path, files: 1, totalLines: lines, codeLines: lines,
    commentLines: 0, exports: 0, imports: 0, complexity: 0, testFiles: 0,
    functions: 0, classes: 0, languages: [], lastModified: '',
    healthScore: 50, subregions: [], description: '',
  }
}

// ─── generateLegend ───────────────────────────────────────────────────────────

describe('generateLegend', () => {
  it('returns non-empty legend array', () => {
    const legend = generateLegend()
    expect(legend.length).toBeGreaterThan(0)
  })

  it('includes health indicator explanation', () => {
    const legend = generateLegend()
    expect(legend.some((l) => l.includes('Health'))).toBe(true)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: AtlasStats = {
    totalRegions: 3, totalFiles: 10, totalLines: 500,
    largestRegion: 'src', smallestRegion: 'config',
    mostComplexRegion: 'src', healthiestRegion: 'test',
    unhealthiestRegion: 'src', averageHealth: 70,
  }

  it('recommends healthy codebase', () => {
    const root = makeRegion('root', 100)
    root.files = 3
    root.testFiles = 1
    const recs = generateRecommendations(root, { ...baseStats, averageHealth: 80, unhealthiestRegion: '' })
    expect(recs.some((r) => r.includes('healthy') || r.includes('well'))).toBe(true)
  })

  it('warns about low average health', () => {
    const root = makeRegion('root', 100)
    const recs = generateRecommendations(root, { ...baseStats, averageHealth: 30 })
    expect(recs.some((r) => r.includes('improving'))).toBe(true)
  })

  it('warns about unhealthiest region', () => {
    const root = makeRegion('root', 100)
    const recs = generateRecommendations(root, baseStats)
    expect(recs.some((r) => r.includes('lowest health'))).toBe(true)
  })

  it('warns about missing tests', () => {
    const root = makeRegion('root', 100)
    root.files = 10
    root.testFiles = 0
    const recs = generateRecommendations(root, baseStats)
    expect(recs.some((r) => r.includes('No test files'))).toBe(true)
  })
})

// ─── buildAtlasResult ─────────────────────────────────────────────────────────

describe('buildAtlasResult', () => {
  it('returns result for empty input', () => {
    const result = buildAtlasResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRegions).toBeGreaterThanOrEqual(0)
    expect(result.legend.length).toBeGreaterThan(0)
  })

  it('returns complete result', () => {
    const result = buildAtlasResult(
      ['src/a.ts', 'src/b.ts', 'test/a.test.ts'],
      ['function foo() {}', 'const x = 1', 'test("x", () => {})'],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalRegions).toBeGreaterThan(0)
    expect(result.root.files).toBe(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildAtlasResult(
      ['src/a.ts', 'src/commands/b.ts'],
      ['line1\nline2', 'line3'],
    )
    expect(result.stats.totalLines).toBe(3)
    expect(result.stats.largestRegion).toBeTruthy()
  })

  it('computes average health', () => {
    const result = buildAtlasResult(['a.ts'], ['function foo() {}'])
    expect(result.stats.averageHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.averageHealth).toBeLessThanOrEqual(100)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('healthIndicator', () => {
  it('shows good indicator for high score', () => {
    expect(healthIndicator(90)).toContain('●')
  })

  it('shows fair indicator for medium score', () => {
    expect(healthIndicator(60)).toContain('◐')
  })

  it('shows needs-attention indicator for low score', () => {
    expect(healthIndicator(30)).toContain('○')
  })
})

describe('healthBar', () => {
  it('renders a bar', () => {
    const bar = healthBar(50)
    expect(bar).toBeTruthy()
    expect(bar.length).toBeGreaterThan(0)
  })

  it('renders full bar for 100', () => {
    const bar = healthBar(100)
    expect(bar).toContain('█')
  })
})

describe('formatRegionCard', () => {
  it('formats region card', () => {
    const region = makeRegion('src', 100)
    region.description = 'Source code'
    const card = formatRegionCard(region)
    expect(card).toContain('src')
    expect(card).toContain('Source code')
  })
})

describe('formatRegionRow', () => {
  it('formats region row with stats', () => {
    const region = makeRegion('src/commands', 200)
    region.exports = 5
    region.testFiles = 2
    const row = formatRegionRow(region)
    expect(row).toContain('src/commands')
  })
})

describe('formatRegionTable', () => {
  it('formats table with header', () => {
    const regions = [makeRegion('a', 10), makeRegion('b', 20)]
    const table = formatRegionTable(regions)
    expect(table).toContain('Path')
    expect(table).toContain('Health')
  })
})

describe('formatFullTree', () => {
  it('renders tree structure', () => {
    const root = makeRegion('root', 100)
    root.subregions = [makeRegion('src', 50)]
    const tree = formatFullTree(root)
    expect(tree).toContain('root')
    expect(tree).toContain('src')
  })
})

describe('formatStats', () => {
  it('formats all stats', () => {
    const stats: AtlasStats = {
      totalRegions: 5, totalFiles: 20, totalLines: 1000,
      largestRegion: 'src', smallestRegion: 'config',
      mostComplexRegion: 'src/commands', healthiestRegion: 'test',
      unhealthiestRegion: 'src', averageHealth: 65,
    }
    const output = formatStats(stats)
    expect(output).toContain('5')
    expect(output).toContain('20')
    expect(output).toContain('1,000')
    expect(output).toContain('65')
  })
})

describe('formatLegend', () => {
  it('formats legend entries', () => {
    const output = formatLegend(['Health: ● good', 'Files: count'])
    expect(output).toContain('Legend')
    expect(output).toContain('Health')
  })
})

describe('formatRecommendations', () => {
  it('formats numbered recommendations', () => {
    const output = formatRecommendations(['Fix A', 'Fix B'])
    expect(output).toContain('1.')
    expect(output).toContain('Fix A')
  })
})

describe('formatAtlasReport', () => {
  it('formats complete report', () => {
    const result = buildAtlasResult(['a.ts'], ['function foo() {}'])
    const report = formatAtlasReport(result, false)
    expect(report).toContain('Dashboard')
    expect(report).toContain('Project Tree')
    expect(report).toContain('Legend')
    expect(report).toContain('Recommendations')
  })
})

describe('formatAtlasJson', () => {
  it('outputs valid JSON', () => {
    const result = buildAtlasResult(['a.ts'], ['code'])
    const json = formatAtlasJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.root).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
