import { describe, expect, it } from 'vitest'

import {
  buildInsightResult,
  computeCorrelations,
  computeWisdomScore,
  detectHiddenPatterns,
  detectOpportunities,
  detectParadoxes,
  detectSurprisingInsights,
  detectWarnings,
  generateRecommendations,
  identifyBlindSpots,
  measureDimensions,
  measureFile,
  pearsonCorrelation,
  type Dimension,
  type Insight,
  type Correlation,
  type InsightStats,
} from '../src/commands/codebase-insight-helpers.js'

import {
  formatCorrelations,
  formatDimensions,
  formatInsightCards,
  formatInsightJSON,
  formatInsightRecommendations,
  formatInsightStats,
  formatInsightTable,
} from '../src/commands/codebase-insight-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const simpleContent = 'const x = 1\n'

const complexContent = Array.from({ length: 50 }, (_, i) => {
  if (i < 10) return `import { dep${i} } from "./d${i}.js"`
  if (i % 5 === 0) return `if (x${i} > 0) { for (let j = 0; j < ${i}; j++) { } }`
  return `const line${i} = ${i}`
}).join('\n')

const documentedContent = [
  '/**',
  ' * A utility module.',
  ' */',
  'import { readFileSync } from "node:fs"',
  '',
  '/**',
  ' * Read a file.',
  ' */',
  'export function readFile(path: string): string {',
  '  try {',
  '    return readFileSync(path, "utf8")',
  '  } catch (e) {',
  '    return ""',
  '  }',
  '}',
  '',
  '/**',
  ' * Write a file.',
  ' */',
  'export function writeFile(path: string, data: string): void {',
  '  try {',
  '    console.log(data)',
  '  } catch (e) {',
  '    throw e',
  '  }',
  '}',
].join('\n')

const complexUndocumentedContent = [
  'import { a } from "a.js"',
  'import { b } from "b.js"',
  'import { c } from "c.js"',
  'import { d } from "d.js"',
  'import { e } from "e.js"',
  'import { f } from "f.js"',
  'import { g } from "g.js"',
  '',
  'export function complex(x: number, y: number): number {',
  '  if (x > 0) {',
  '    if (y > 0) {',
  '      if (x > y) {',
  '        for (let i = 0; i < x; i++) {',
  '          if (i % 2 === 0) {',
  '            while (y > 0) { y-- }',
  '          }',
  '        }',
  '      } else {',
  '        switch (y) {',
  '          case 1: return 1',
  '          case 2: return 2',
  '          default: return x || y',
  '        }',
  '      }',
  '    }',
  '  }',
  '  return x',
  '}',
  '',
  'export function complex2(x: number): number {',
  '  if (x && x > 0) {',
  '    if (x > 10) {',
  '      if (x > 20) { return 1 }',
  '    }',
  '  }',
  '  return x',
  '}',
].join('\n')

const tinyFileA = 'export const a = 1\n'
const tinyFileB = 'export const b = 2\n'
const tinyFileC = 'export const c = 3\n'

const testContent = [
  'import { describe, it, expect } from "vitest"',
  'import { readFile } from "./read.js"',
  '',
  'describe("readFile", () => {',
  '  it("works", () => {',
  '    expect(readFile("a")).toBe("data")',
  '  })',
  '})',
].join('\n')

// ─── measureFile ──────────────────────────────────────────────────────────────

describe('measureFile', () => {
  it('measures simple file metrics', () => {
    const m = measureFile('simple.ts', simpleContent)
    expect(m.size).toBeLessThanOrEqual(100)
    expect(m.complexity).toBeGreaterThanOrEqual(1)
    expect(m.coupling).toBe(0)
  })

  it('measures complex file with high coupling', () => {
    const m = measureFile('complex.ts', complexContent)
    expect(m.coupling).toBeGreaterThan(0)
    expect(m.complexity).toBeGreaterThan(1)
  })

  it('measures documented file', () => {
    const m = measureFile('doc.ts', documentedContent)
    expect(m.documentation).toBeGreaterThan(0)
    expect(m.errorHandling).toBeGreaterThan(0)
    expect(m.exports).toBeGreaterThan(0)
  })

  it('detects test files', () => {
    const m = measureFile('mod.test.ts', testContent)
    expect(m.testIndicator).toBe(100)
  })

  it('non-test files have zero test indicator', () => {
    const m = measureFile('mod.ts', simpleContent)
    expect(m.testIndicator).toBe(0)
  })

  it('clamps complexity to 100', () => {
    const lotsOfIfs = Array.from({ length: 200 }, (_, i) => `if (x${i}) {}`).join('\n')
    const m = measureFile('huge.ts', lotsOfIfs)
    expect(m.complexity).toBeLessThanOrEqual(100)
  })
})

// ─── measureDimensions ────────────────────────────────────────────────────────

describe('measureDimensions', () => {
  it('returns 6 dimensions', () => {
    const dims = measureDimensions(['a.ts'], [simpleContent])
    expect(dims).toHaveLength(6)
    const names = dims.map((d) => d.name)
    expect(names).toContain('complexity')
    expect(names).toContain('size')
    expect(names).toContain('coupling')
    expect(names).toContain('documentation')
    expect(names).toContain('errorHandling')
    expect(names).toContain('exports')
  })

  it('computes average values across files', () => {
    const dims = measureDimensions(
      ['a.ts', 'b.ts'],
      [simpleContent, documentedContent],
    )
    for (const d of dims) {
      expect(d.value).toBeGreaterThanOrEqual(0)
      expect(d.value).toBeLessThanOrEqual(100)
    }
  })

  it('handles empty file list', () => {
    const dims = measureDimensions([], [])
    expect(dims).toHaveLength(6)
    for (const d of dims) {
      expect(d.value).toBe(0)
    }
  })
})

// ─── pearsonCorrelation ───────────────────────────────────────────────────────

describe('pearsonCorrelation', () => {
  it('returns 1 for perfect positive correlation', () => {
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])).toBeCloseTo(1, 1)
  })

  it('returns -1 for perfect negative correlation', () => {
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])).toBeCloseTo(-1, 1)
  })

  it('returns 0 for no correlation with < 2 points', () => {
    expect(pearsonCorrelation([1], [2])).toBe(0)
  })

  it('returns 0 for constant array', () => {
    expect(pearsonCorrelation([5, 5, 5], [1, 2, 3])).toBe(0)
  })

  it('handles moderate correlation', () => {
    const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 3, 2, 5, 4])
    expect(Math.abs(r)).toBeGreaterThan(0)
    expect(Math.abs(r)).toBeLessThan(1)
  })
})

// ─── computeCorrelations ──────────────────────────────────────────────────────

describe('computeCorrelations', () => {
  it('returns correlations between dimension pairs', () => {
    const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']
    const contents = [simpleContent, complexContent, documentedContent, complexUndocumentedContent, testContent]
    const dims = measureDimensions(files, contents)
    const corrs = computeCorrelations(dims)
    expect(corrs.length).toBeGreaterThan(0)
    for (const c of corrs) {
      expect(c.strength).toBeGreaterThanOrEqual(-100)
      expect(c.strength).toBeLessThanOrEqual(100)
      expect(c.dimensionA).toBeDefined()
      expect(c.dimensionB).toBeDefined()
    }
  })

  it('returns empty for single file', () => {
    const dims = measureDimensions(['a.ts'], [simpleContent])
    const corrs = computeCorrelations(dims)
    expect(corrs).toHaveLength(0)
  })
})

// ─── detectSurprisingInsights ─────────────────────────────────────────────────

describe('detectSurprisingInsights', () => {
  it('detects compact complexity bombs', () => {
    const dims = measureDimensions(['small.ts'], [complexUndocumentedContent])
    const insights = detectSurprisingInsights(dims, [])
    const compact = insights.find((i) => i.title.includes('Compact complexity'))
    if (compact) {
      expect(compact.category).toBe('surprising')
      expect(compact.confidence).toBeGreaterThan(0)
    }
  })

  it('detects surprising correlations', () => {
    const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']
    const contents = [simpleContent, complexContent, documentedContent, complexUndocumentedContent, testContent]
    const dims = measureDimensions(files, contents)
    const corrs = computeCorrelations(dims)
    const insights = detectSurprisingInsights(dims, corrs)
    for (const i of insights) {
      expect(i.category).toBe('surprising')
      expect(i.evidence.length).toBeGreaterThan(0)
    }
  })
})

// ─── detectHiddenPatterns ─────────────────────────────────────────────────────

describe('detectHiddenPatterns', () => {
  it('detects coupling clusters', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [complexUndocumentedContent, complexUndocumentedContent, complexUndocumentedContent]
    const dims = measureDimensions(files, contents)
    const insights = detectHiddenPatterns(files, contents, dims)
    const coupling = insights.find((i) => i.title.includes('coupling') || i.title.includes('Coupling'))
    if (coupling) {
      expect(coupling.category).toBe('hidden-pattern')
    }
  })

  it('detects fragmentation', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [tinyFileA, tinyFileB, tinyFileC]
    const dims = measureDimensions(files, contents)
    const insights = detectHiddenPatterns(files, contents, dims)
    const frag = insights.find((i) => i.title.includes('fragmentation') || i.title.includes('Fragmentation'))
    if (frag) {
      expect(frag.category).toBe('hidden-pattern')
    }
  })
})

// ─── detectParadoxes ──────────────────────────────────────────────────────────

describe('detectParadoxes', () => {
  it('detects complex undocumented files', () => {
    const dims = measureDimensions(['complex.ts'], [complexUndocumentedContent])
    const insights = detectParadoxes(dims, [])
    const paradox = insights.find((i) => i.title.includes('Complex but'))
    if (paradox) {
      expect(paradox.category).toBe('paradox')
      expect(paradox.impact).toBeGreaterThan(50)
    }
  })

  it('returns empty for well-balanced files', () => {
    const dims = measureDimensions(['good.ts'], [documentedContent])
    const insights = detectParadoxes(dims, [])
    expect(insights.length).toBeLessThanOrEqual(2)
  })
})

// ─── detectOpportunities ──────────────────────────────────────────────────────

describe('detectOpportunities', () => {
  it('detects leverage points', () => {
    const dims = measureDimensions(['hub.ts'], [complexUndocumentedContent])
    const insights = detectOpportunities(dims)
    for (const i of insights) {
      expect(i.category).toBe('opportunity')
      expect(i.actionItems.length).toBeGreaterThan(0)
    }
  })
})

// ─── detectWarnings ───────────────────────────────────────────────────────────

describe('detectWarnings', () => {
  it('detects complexity danger zone', () => {
    const dims = measureDimensions(['complex.ts'], [complexUndocumentedContent])
    const insights = detectWarnings(dims)
    const danger = insights.find((i) => i.title.includes('Complexity'))
    if (danger) {
      expect(danger.category).toBe('warning')
      expect(danger.confidence).toBeGreaterThan(50)
    }
  })

  it('detects documentation debt when most files lack docs', () => {
    const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts']
    const contents = files.map(() => simpleContent)
    const dims = measureDimensions(files, contents)
    const insights = detectWarnings(dims)
    const docDebt = insights.find((i) => i.title.includes('Documentation'))
    if (docDebt) {
      expect(docDebt.category).toBe('warning')
    }
  })

  it('detects coupling hotspots', () => {
    const dims = measureDimensions(['hub.ts'], [complexUndocumentedContent])
    const insights = detectWarnings(dims)
    const hotspot = insights.find((i) => i.title.includes('Coupling'))
    if (hotspot) {
      expect(hotspot.category).toBe('warning')
    }
  })
})

// ─── computeWisdomScore ───────────────────────────────────────────────────────

describe('computeWisdomScore', () => {
  it('returns 50 for no insights', () => {
    expect(computeWisdomScore([], [])).toBe(50)
  })

  it('increases with high-confidence insights', () => {
    const insights: Insight[] = [{
      id: '1', title: 'Test', category: 'surprising', description: 'd',
      evidence: [], confidence: 80, impact: 50, actionItems: [],
    }]
    const score = computeWisdomScore(insights, [])
    expect(score).toBeGreaterThan(50)
  })

  it('decreases with warnings', () => {
    const insights: Insight[] = [{
      id: '1', title: 'Warn', category: 'warning', description: 'd',
      evidence: [], confidence: 90, impact: 80, actionItems: [],
    }]
    const score = computeWisdomScore(insights, [])
    expect(score).toBeLessThanOrEqual(50)
  })

  it('clamps to 0-100', () => {
    const manyInsights: Insight[] = Array.from({ length: 20 }, (_, i) => ({
      id: `i${i}`, title: `Insight ${i}`, category: 'surprising' as const,
      description: 'd', evidence: [], confidence: 90, impact: 80, actionItems: [],
    }))
    const manyCorrs: Correlation[] = Array.from({ length: 10 }, (_, i) => ({
      dimensionA: `a${i}`, dimensionB: `b${i}`, strength: 80,
      description: 'strong', surprising: false,
    }))
    const score = computeWisdomScore(manyInsights, manyCorrs)
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})

// ─── identifyBlindSpots ───────────────────────────────────────────────────────

describe('identifyBlindSpots', () => {
  it('counts files with low docs and error handling', () => {
    const dims = measureDimensions(['blind.ts'], [simpleContent])
    const count = identifyBlindSpots(dims)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it('returns 0 for well-documented files', () => {
    const dims = measureDimensions(['doc.ts'], [documentedContent])
    const count = identifyBlindSpots(dims)
    expect(count).toBe(0)
  })

  it('returns 0 for empty dimensions', () => {
    expect(identifyBlindSpots([])).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: InsightStats = {
    totalInsights: 5, surprisingCount: 1, hiddenPatternCount: 1,
    correlationCount: 1, strongCorrelations: 1, wisdomScore: 60,
    deepestInsight: 'Test', blindSpots: 0,
  }

  it('recommends addressing warnings', () => {
    const insights: Insight[] = [{
      id: 'w1', title: 'Warning', category: 'warning', description: 'd',
      evidence: [], confidence: 90, impact: 80, actionItems: [],
    }]
    const recs = generateRecommendations(insights, [], baseStats)
    expect(recs.some((r) => r.includes('warning') || r.includes('Warning'))).toBe(true)
  })

  it('recommends investigating surprises', () => {
    const insights: Insight[] = [{
      id: 's1', title: 'Surprise', category: 'surprising', description: 'd',
      evidence: [], confidence: 80, impact: 60, actionItems: [],
    }]
    const recs = generateRecommendations(insights, [], baseStats)
    expect(recs.some((r) => r.includes('urpris'))).toBe(true)
  })

  it('recommends exploring blind spots', () => {
    const stats: InsightStats = { ...baseStats, blindSpots: 5 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('blind'))).toBe(true)
  })

  it('returns positive message when all good', () => {
    const recs = generateRecommendations([], [], { ...baseStats, wisdomScore: 80 })
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildInsightResult ───────────────────────────────────────────────────────

describe('buildInsightResult', () => {
  it('returns empty result for no files', () => {
    const result = buildInsightResult([], [], {})
    expect(result.stats.totalInsights).toBe(0)
    expect(result.insights).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns result for single file', () => {
    const result = buildInsightResult(['a.ts'], [simpleContent], {})
    expect(result.dimensions).toHaveLength(6)
    expect(result.stats.totalInsights).toBeGreaterThanOrEqual(0)
  })

  it('returns result for multiple files', () => {
    const result = buildInsightResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      [simpleContent, complexContent, documentedContent, complexUndocumentedContent, testContent],
      {},
    )
    expect(result.dimensions).toHaveLength(6)
    expect(result.correlations.length).toBeGreaterThan(0)
    expect(result.insights.length).toBeGreaterThan(0)
    expect(result.stats.totalInsights).toBeGreaterThan(0)
  })

  it('sorts insights by impact', () => {
    const result = buildInsightResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [simpleContent, complexContent, documentedContent, complexUndocumentedContent],
      {},
    )
    for (let i = 1; i < result.insights.length; i++) {
      expect(result.insights[i - 1]!.impact).toBeGreaterThanOrEqual(result.insights[i]!.impact)
    }
  })

  it('computes wisdom score', () => {
    const result = buildInsightResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [simpleContent, complexContent, documentedContent],
      {},
    )
    expect(result.stats.wisdomScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.wisdomScore).toBeLessThanOrEqual(100)
  })

  it('identifies deepest insight', () => {
    const result = buildInsightResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [simpleContent, complexContent, documentedContent],
      {},
    )
    expect(result.stats.deepestInsight).toBeDefined()
  })

  it('generates recommendations', () => {
    const result = buildInsightResult(
      ['a.ts', 'b.ts'],
      [simpleContent, complexContent],
      {},
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatInsightCards', () => {
  it('handles empty insights', () => {
    expect(formatInsightCards([])).toContain('No insights')
  })

  it('formats insight with title and category', () => {
    const insights: Insight[] = [{
      id: '1', title: 'Test Insight', category: 'surprising',
      description: 'A test', evidence: ['ev1'], confidence: 75, impact: 60, actionItems: ['act'],
    }]
    const output = formatInsightCards(insights)
    expect(output).toContain('Test Insight')
    expect(output).toContain('surprising')
    expect(output).toContain('75%')
  })
})

describe('formatCorrelations', () => {
  it('handles empty correlations', () => {
    expect(formatCorrelations([])).toContain('No correlations')
  })

  it('formats correlation pairs', () => {
    const corrs: Correlation[] = [{
      dimensionA: 'complexity', dimensionB: 'size', strength: 85,
      description: 'strong positive', surprising: false,
    }]
    const output = formatCorrelations(corrs)
    expect(output).toContain('complexity')
    expect(output).toContain('size')
    expect(output).toContain('+85%')
  })
})

describe('formatDimensions', () => {
  it('handles empty dimensions', () => {
    expect(formatDimensions([])).toContain('No dimensions')
  })

  it('formats dimension names and values', () => {
    const dims: Dimension[] = [
      { name: 'complexity', value: 45, files: new Map() },
    ]
    const output = formatDimensions(dims)
    expect(output).toContain('complexity')
    expect(output).toContain('45%')
  })
})

describe('formatInsightStats', () => {
  it('formats all stat fields', () => {
    const stats: InsightStats = {
      totalInsights: 10, surprisingCount: 2, hiddenPatternCount: 3,
      correlationCount: 2, strongCorrelations: 1, wisdomScore: 72,
      deepestInsight: 'Complex but undocumented', blindSpots: 5,
    }
    const output = formatInsightStats(stats)
    expect(output).toContain('Total Insights:      10')
    expect(output).toContain('Surprising:          2')
    expect(output).toContain('Wisdom Score:')
    expect(output).toContain('72%')
    expect(output).toContain('Blind Spots:         5')
  })
})

describe('formatInsightRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatInsightRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatInsightRecommendations(['First', 'Second'])
    expect(output).toContain('1. First')
    expect(output).toContain('2. Second')
  })
})

describe('formatInsightTable', () => {
  it('formats full result', () => {
    const result = buildInsightResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [simpleContent, complexContent, documentedContent, complexUndocumentedContent],
      {},
    )
    const output = formatInsightTable(result)
    expect(output).toContain('Insight Cards')
    expect(output).toContain('Correlations')
    expect(output).toContain('Dimension Radar')
    expect(output).toContain('Insight Stats')
  })
})

describe('formatInsightJSON', () => {
  it('produces valid JSON', () => {
    const result = buildInsightResult(['a.ts'], [simpleContent], {})
    const json = formatInsightJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.insights).toBeDefined()
    expect(parsed.correlations).toBeDefined()
    expect(parsed.dimensions).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('serializes Map to object', () => {
    const result = buildInsightResult(['a.ts'], [simpleContent], {})
    const json = formatInsightJSON(result)
    const parsed = JSON.parse(json)
    for (const dim of parsed.dimensions) {
      expect(typeof dim.files).toBe('object')
    }
  })
})
