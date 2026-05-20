import { describe, expect, it } from 'vitest'

import {
  applyAllLenses,
  applyLens,
  buildMosaicLensResult,
  classifyFile,
  classifyOverallGrade,
  compareLenses,
  computeMosaicClarity,
  filterFile,
  generateRecommendations,
  LENS_TYPES,
  type FilteredFile,
  type LensView,
  type MosaicLensStats,
  type LensComparison,
} from '../src/commands/mosaic-lens-helpers.js'
import { formatMosaicLensJson, formatMosaicLensTable } from '../src/commands/mosaic-lens-format-helpers.js'

// ─── applyLens ────────────────────────────────────────────────────────────────

describe('applyLens', () => {
  it('returns a LensView for each lens type', () => {
    for (const lens of LENS_TYPES) {
      const view = applyLens('const x = 1', 'a.ts', lens)
      expect(view.lens).toBe(lens)
      expect(view.score).toBeGreaterThanOrEqual(0)
      expect(view.score).toBeLessThanOrEqual(100)
      expect(view.findings).toBeDefined()
      expect(view.highlights).toBeDefined()
      expect(view.concerns).toBeDefined()
      expect(view.color).toBeDefined()
    }
  })

  it('correctness detects loose equality', () => {
    const view = applyLens('if (x == null)', 'a.ts', 'correctness')
    expect(view.concerns.some(c => c.includes('loose equality') || c.includes('Loose'))).toBe(true)
  })

  it('correctness rewards strict equality', () => {
    const view = applyLens('if (x === null)', 'a.ts', 'correctness')
    expect(view.highlights.some(h => h.includes('strict equality'))).toBe(true)
  })

  it('correctness penalizes type safety bypasses', () => {
    const view = applyLens('const x = data as any', 'a.ts', 'correctness')
    expect(view.findings.some(f => f.category === 'type-safety')).toBe(true)
  })

  it('correctness rewards error handling', () => {
    const view = applyLens('try { doWork() } catch (e) {}', 'a.ts', 'correctness')
    expect(view.highlights.some(h => h.includes('Error handling'))).toBe(true)
  })

  it('correctness warns about async without error handling', () => {
    const view = applyLens('async function run() { await doWork() }', 'a.ts', 'correctness')
    expect(view.concerns.some(c => c.includes('Async code without'))).toBe(true)
  })

  it('correctness rewards null checks', () => {
    const view = applyLens('if (typeof x !== "undefined") {}', 'a.ts', 'correctness')
    expect(view.highlights.some(h => h.includes('Null'))).toBe(true)
  })

  it('maintainability rewards documentation', () => {
    const view = applyLens('/** Docs */\nexport function foo() {}', 'a.ts', 'maintainability')
    expect(view.highlights.some(h => h.includes('JSDoc'))).toBe(true)
  })

  it('maintainability rewards type definitions', () => {
    const view = applyLens('interface Config { debug: boolean }', 'a.ts', 'maintainability')
    expect(view.highlights.some(h => h.includes('Type definitions'))).toBe(true)
  })

  it('maintainability penalizes many exports', () => {
    const code = Array.from({ length: 15 }, (_, i) => `export const e${i} = ${i}`).join('\n')
    const view = applyLens(code, 'a.ts', 'maintainability')
    expect(view.concerns.some(c => c.includes('exports'))).toBe(true)
  })

  it('maintainability penalizes TODO markers', () => {
    const view = applyLens('// TODO: fix this\nexport const x = 1', 'a.ts', 'maintainability')
    expect(view.concerns.some(c => c.includes('TODO'))).toBe(true)
  })

  it('maintainability rewards module patterns', () => {
    const view = applyLens("import { x } from 'y'\nexport default x", 'a.ts', 'maintainability')
    expect(view.highlights.some(h => h.includes('module patterns'))).toBe(true)
  })

  it('performance penalizes nested loops', () => {
    const code = 'for (const a of arr) { for (const b of arr) { } }'
    const view = applyLens(code, 'a.ts', 'performance')
    expect(view.concerns.some(c => c.includes('Nested') || c.includes('nested'))).toBe(true)
  })

  it('performance rewards Set/Map usage', () => {
    const view = applyLens('const s = new Set()', 'a.ts', 'performance')
    expect(view.highlights.some(h => h.includes('Set/Map'))).toBe(true)
  })

  it('performance penalizes JSON in loops', () => {
    const view = applyLens('for (const x of arr) { JSON.parse(x) }', 'a.ts', 'performance')
    expect(view.concerns.some(c => c.includes('JSON'))).toBe(true)
  })

  it('performance penalizes chained array ops', () => {
    const view = applyLens('arr.map(x => x).filter(x => x)', 'a.ts', 'performance')
    expect(view.concerns.some(c => c.includes('Chained') || c.includes('single pass'))).toBe(true)
  })

  it('readability rewards good comment density', () => {
    const code = '// Module setup\nconst x = 1\n// Helper function\nconst y = 2\nconst z = 3'
    const view = applyLens(code, 'a.ts', 'readability')
    expect(view.highlights.some(h => h.includes('comment density'))).toBe(true)
  })

  it('readability penalizes low comment density', () => {
    const code = Array(20).fill('const x = 1').join('\n')
    const view = applyLens(code, 'a.ts', 'readability')
    expect(view.concerns.some(c => c.includes('comment density') || c.includes('Low comment'))).toBe(true)
  })

  it('readability rewards short lines', () => {
    const code = 'const x = 1\nconst y = 2'
    const view = applyLens(code, 'a.ts', 'readability')
    expect(view.highlights.some(h => h.includes('readable lines') || h.includes('Short'))).toBe(true)
  })

  it('readability rewards well-sized functions', () => {
    const code = 'function add(a, b) {\n  return a + b\n}'
    const view = applyLens(code, 'a.ts', 'readability')
    expect(view.highlights.some(h => h.includes('Well-sized') || h.includes('functions'))).toBe(true)
  })

  it('robustness rewards error boundaries', () => {
    const view = applyLens('try { doWork() } catch (e) {}', 'a.ts', 'robustness')
    expect(view.highlights.some(h => h.includes('Error boundaries'))).toBe(true)
  })

  it('robustness warns when no error handling', () => {
    const view = applyLens('const x = 1', 'a.ts', 'robustness')
    expect(view.concerns.some(c => c.includes('No error handling'))).toBe(true)
  })

  it('robustness rewards optional chaining', () => {
    const view = applyLens('const x = obj?.prop', 'a.ts', 'robustness')
    expect(view.highlights.some(h => h.includes('Optional chaining') || h.includes('nullish'))).toBe(true)
  })

  it('robustness rewards guard clauses', () => {
    const view = applyLens('if (!obj) return null', 'a.ts', 'robustness')
    expect(view.highlights.some(h => h.includes('Guard clauses'))).toBe(true)
  })

  it('robustness rewards fallback values', () => {
    const view = applyLens('switch (x) { default: break }', 'a.ts', 'robustness')
    expect(view.highlights.some(h => h.includes('Default') || h.includes('fallback'))).toBe(true)
  })

  it('sets correct file path in findings', () => {
    const view = applyLens('const x = data as any', 'src/utils.ts', 'correctness')
    for (const f of view.findings) {
      expect(f.file).toBe('src/utils.ts')
    }
  })

  it('sets line numbers in findings', () => {
    const view = applyLens('const x = data as any', 'a.ts', 'correctness')
    expect(view.findings.every(f => f.line >= 1)).toBe(true)
  })
})

// ─── applyAllLenses ───────────────────────────────────────────────────────────

describe('applyAllLenses', () => {
  it('returns 5 views', () => {
    const views = applyAllLenses('const x = 1', 'a.ts')
    expect(views.length).toBe(5)
  })

  it('returns one view per lens type', () => {
    const views = applyAllLenses('const x = 1', 'a.ts')
    const lenses = views.map(v => v.lens)
    expect(lenses).toContain('correctness')
    expect(lenses).toContain('maintainability')
    expect(lenses).toContain('performance')
    expect(lenses).toContain('readability')
    expect(lenses).toContain('robustness')
  })
})

// ─── classifyFile ─────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  it('returns resilient for high balanced scores', () => {
    const scores = { correctness: 90, maintainability: 85, performance: 88, readability: 92, robustness: 87 }
    expect(classifyFile(scores, 7)).toBe('resilient')
  })

  it('returns balanced for moderate disparity', () => {
    const scores = { correctness: 80, maintainability: 65, performance: 68, readability: 78, robustness: 72 }
    expect(classifyFile(scores, 15)).toBe('balanced')
  })

  it('returns fragile for high disparity with low minimum', () => {
    const scores = { correctness: 90, maintainability: 30, performance: 85, readability: 80, robustness: 75 }
    expect(classifyFile(scores, 60)).toBe('fragile')
  })

  it('returns lopsided for notable disparity', () => {
    const scores = { correctness: 80, maintainability: 50, performance: 78, readability: 75, robustness: 72 }
    expect(classifyFile(scores, 30)).toBe('lopsided')
  })
})

// ─── filterFile ───────────────────────────────────────────────────────────────

describe('filterFile', () => {
  const makeView = (lens: string, score: number): LensView => ({
    lens: lens as LensView['lens'], color: 'white', score, findings: [], highlights: [], concerns: [],
  })

  it('computes lens scores', () => {
    const views = [makeView('correctness', 80), makeView('maintainability', 60)]
    const f = filterFile('a.ts', views)
    expect(f.lensScores.correctness).toBe(80)
    expect(f.lensScores.maintainability).toBe(60)
  })

  it('computes average score', () => {
    const views = [makeView('correctness', 80), makeView('maintainability', 60)]
    const f = filterFile('a.ts', views)
    expect(f.avgScore).toBe(70)
  })

  it('identifies dominant lens', () => {
    const views = [makeView('correctness', 90), makeView('maintainability', 60)]
    const f = filterFile('a.ts', views)
    expect(f.dominantLens).toBe('correctness')
  })

  it('identifies weakest lens', () => {
    const views = [makeView('correctness', 90), makeView('maintainability', 50)]
    const f = filterFile('a.ts', views)
    expect(f.weakestLens).toBe('maintainability')
  })

  it('computes disparity', () => {
    const views = [makeView('correctness', 90), makeView('maintainability', 50)]
    const f = filterFile('a.ts', views)
    expect(f.disparity).toBe(40)
  })

  it('sets file path', () => {
    const views = [makeView('correctness', 80)]
    const f = filterFile('src/a.ts', views)
    expect(f.file).toBe('src/a.ts')
  })

  it('classifies the file', () => {
    const views = [makeView('correctness', 80), makeView('maintainability', 78)]
    const f = filterFile('a.ts', views)
    expect(['balanced', 'lopsided', 'fragile', 'resilient']).toContain(f.classification)
  })
})

// ─── compareLenses ────────────────────────────────────────────────────────────

describe('compareLenses', () => {
  const makeFile = (scores: Record<string, number>): FilteredFile => ({
    file: 'a.ts', lensScores: scores, avgScore: 0, dominantLens: 'correctness', weakestLens: 'performance',
    disparity: 0, classification: 'balanced',
  })

  it('identifies best lens', () => {
    const files = [makeFile({ correctness: 90, maintainability: 60 })]
    const comp = compareLenses([], files)
    expect(comp.bestLens).toBe('correctness')
  })

  it('identifies worst lens', () => {
    const files = [makeFile({ correctness: 90, maintainability: 50 })]
    const comp = compareLenses([], files)
    expect(comp.worstLens).toBe('maintainability')
  })

  it('identifies surprise files', () => {
    const f: FilteredFile = {
      file: 'surprise.ts', lensScores: { correctness: 95, performance: 30 }, avgScore: 62,
      dominantLens: 'correctness', weakestLens: 'performance', disparity: 65, classification: 'fragile',
    }
    const comp = compareLenses([], [f])
    expect(comp.surpriseFiles).toContain('surprise.ts')
  })

  it('returns mostCorrelated pair', () => {
    const files = [makeFile({ correctness: 80, maintainability: 79 })]
    const comp = compareLenses([], files)
    expect(comp.mostCorrelated.length).toBe(2)
  })

  it('returns mostDivergent pair', () => {
    const files = [makeFile({ correctness: 90, performance: 30 })]
    const comp = compareLenses([], files)
    expect(comp.mostDivergent.length).toBe(2)
  })

  it('handles empty files', () => {
    const comp = compareLenses([], [])
    expect(comp.bestLens).toBeDefined()
    expect(comp.worstLens).toBeDefined()
  })
})

// ─── computeMosaicClarity ─────────────────────────────────────────────────────

describe('computeMosaicClarity', () => {
  it('returns 100 for empty files', () => {
    expect(computeMosaicClarity([], [])).toBe(100)
  })

  it('returns high clarity for balanced files', () => {
    const f: FilteredFile = {
      file: 'a.ts', lensScores: {}, avgScore: 85, dominantLens: 'correctness', weakestLens: 'performance',
      disparity: 5, classification: 'resilient',
    }
    const clarity = computeMosaicClarity([], [f])
    expect(clarity).toBeGreaterThan(80)
  })

  it('returns lower clarity for high disparity', () => {
    const f: FilteredFile = {
      file: 'a.ts', lensScores: {}, avgScore: 50, dominantLens: 'correctness', weakestLens: 'performance',
      disparity: 60, classification: 'fragile',
    }
    const clarity = computeMosaicClarity([], [f])
    expect(clarity).toBeLessThan(80)
  })
})

// ─── classifyOverallGrade ─────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('returns panoramic for high scores', () => {
    expect(classifyOverallGrade(90, 85)).toBe('panoramic')
  })

  it('returns focused for good scores', () => {
    expect(classifyOverallGrade(70, 65)).toBe('focused')
  })

  it('returns tinted for moderate scores', () => {
    expect(classifyOverallGrade(55, 50)).toBe('tinted')
  })

  it('returns blurred for low scores', () => {
    expect(classifyOverallGrade(40, 35)).toBe('blurred')
  })

  it('returns opaque for very low scores', () => {
    expect(classifyOverallGrade(20, 15)).toBe('opaque')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<MosaicLensStats> = {}): MosaicLensStats => ({
    totalViews: 5,
    avgLensScores: {},
    overallScore: 80,
    bestScoringLens: 'correctness',
    worstScoringLens: 'performance',
    totalFindings: 0,
    errorFindings: 0,
    warningFindings: 0,
    balancedFiles: 1,
    lopsidedFiles: 0,
    avgDisparity: 10,
    surpriseCount: 0,
    mosaicClarity: 80,
    dominantPerspective: 'correctness',
    overallGrade: 'panoramic',
    ...overrides,
  })

  it('recommends focusing on worst lens', () => {
    const recs = generateRecommendations([], [], { bestLens: 'c', worstLens: 'p', mostCorrelated: ['a', 'b'], mostDivergent: ['c', 'd'], surpriseFiles: [] }, makeStats())
    expect(recs.some(r => r.includes('performance') || r.includes('worst'))).toBe(true)
  })

  it('recommends improving lopsided files', () => {
    const f: FilteredFile = {
      file: 'bad.ts', lensScores: {}, avgScore: 50, dominantLens: 'correctness', weakestLens: 'robustness',
      disparity: 40, classification: 'lopsided',
    }
    const recs = generateRecommendations([], [f], { bestLens: 'c', worstLens: 'r', mostCorrelated: ['a', 'b'], mostDivergent: ['c', 'd'], surpriseFiles: [] }, makeStats())
    expect(recs.some(r => r.includes('lopsided'))).toBe(true)
  })

  it('recommends investigating surprise files', () => {
    const comp: LensComparison = { bestLens: 'c', worstLens: 'p', mostCorrelated: ['a', 'b'], mostDivergent: ['c', 'd'], surpriseFiles: ['mystery.ts'] }
    const recs = generateRecommendations([], [], comp, makeStats())
    expect(recs.some(r => r.includes('surprise') || r.includes('Surprise'))).toBe(true)
  })

  it('recommends for fragile files', () => {
    const f: FilteredFile = {
      file: 'frag.ts', lensScores: {}, avgScore: 40, dominantLens: 'c', weakestLens: 'r',
      disparity: 50, classification: 'fragile',
    }
    const recs = generateRecommendations([], [f], { bestLens: 'c', worstLens: 'r', mostCorrelated: ['a', 'b'], mostDivergent: ['c', 'd'], surpriseFiles: [] }, makeStats())
    expect(recs.some(r => r.includes('fragile'))).toBe(true)
  })

  it('recommends for low clarity', () => {
    const recs = generateRecommendations([], [], { bestLens: 'c', worstLens: 'p', mostCorrelated: ['a', 'b'], mostDivergent: ['c', 'd'], surpriseFiles: [] }, makeStats({ mosaicClarity: 30 }))
    expect(recs.some(r => r.includes('clarity'))).toBe(true)
  })

  it('recommends addressing errors', () => {
    const recs = generateRecommendations([], [], { bestLens: 'c', worstLens: 'p', mostCorrelated: ['a', 'b'], mostDivergent: ['c', 'd'], surpriseFiles: [] }, makeStats({ errorFindings: 3 }))
    expect(recs.some(r => r.includes('error'))).toBe(true)
  })
})

// ─── buildMosaicLensResult ────────────────────────────────────────────────────

describe('buildMosaicLensResult', () => {
  it('returns all required fields', () => {
    const result = buildMosaicLensResult(['a.ts'], ['export const x = 1'], {})
    expect(result).toHaveProperty('views')
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('comparison')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('handles empty input', () => {
    const result = buildMosaicLensResult([], [], {})
    expect(result.files).toEqual([])
    expect(result.stats.totalViews).toBe(0)
  })

  it('creates 5 views per file', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    expect(result.views.length).toBe(5)
  })

  it('creates filtered files', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    expect(result.files.length).toBe(1)
    expect(result.files[0].file).toBe('a.ts')
  })

  it('computes overall score', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.overallScore).toBeGreaterThan(0)
    expect(result.stats.overallScore).toBeLessThanOrEqual(100)
  })

  it('computes avg lens scores', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    for (const lens of LENS_TYPES) {
      expect(result.stats.avgLensScores[lens]).toBeDefined()
    }
  })

  it('sets overall grade', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    expect(['panoramic', 'focused', 'tinted', 'blurred', 'opaque']).toContain(result.stats.overallGrade)
  })

  it('handles multiple files', () => {
    const result = buildMosaicLensResult(['a.ts', 'b.ts'], ['const x = 1', 'try { } catch(e) {}'], {})
    expect(result.views.length).toBe(10)
    expect(result.files.length).toBe(2)
  })

  it('computes mosaic clarity', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.mosaicClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.mosaicClarity).toBeLessThanOrEqual(100)
  })

  it('counts findings', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = data as any'], {})
    expect(result.stats.totalFindings).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatMosaicLensTable ────────────────────────────────────────────────────

describe('formatMosaicLensTable', () => {
  it('returns a string', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatMosaicLensTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headings', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatMosaicLensTable(result, false)
    expect(formatted).toContain('Lens Views')
    expect(formatted).toContain('Files')
    expect(formatted).toContain('Lens Comparison')
  })

  it('shows no views message for empty input', () => {
    const result = buildMosaicLensResult([], [], {})
    const formatted = formatMosaicLensTable(result, false)
    expect(formatted).toContain('No lens views')
  })

  it('shows recommendations when present', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatMosaicLensTable(result, false)
    if (result.recommendations.length > 0) {
      expect(formatted).toContain('Recommendations')
    }
  })
})

// ─── formatMosaicLensJson ─────────────────────────────────────────────────────

describe('formatMosaicLensJson', () => {
  it('returns valid JSON', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const json = formatMosaicLensJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains all top-level keys', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatMosaicLensJson(result))
    expect(parsed).toHaveProperty('views')
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('comparison')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('roundtrips correctly', () => {
    const result = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatMosaicLensJson(result))
    expect(parsed.stats.totalViews).toBe(result.stats.totalViews)
    expect(parsed.stats.overallScore).toBe(result.stats.overallScore)
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('mosaic-lens integration', () => {
  it('handles a realistic codebase', () => {
    const files = ['src/index.ts', 'src/utils.ts', 'src/parser.ts']
    const contents = [
      "export function main() { try { run() } catch(e) { log(e) } }",
      "/** Helpers */\nexport function helper(x: number): number { return x * 2 }\n// TODO: optimize",
      "for (const a of items) { for (const b of items) { JSON.parse(a) } }",
    ]
    const result = buildMosaicLensResult(files, contents, {})

    expect(result.views.length).toBe(15)
    expect(result.files.length).toBe(3)
    expect(result.stats.overallScore).toBeGreaterThan(0)
    expect(result.stats.totalFindings).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('produces consistent results', () => {
    const r1 = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    const r2 = buildMosaicLensResult(['a.ts'], ['const x = 1'], {})
    expect(r1.stats.overallScore).toBe(r2.stats.overallScore)
    expect(r1.stats.mosaicClarity).toBe(r2.stats.mosaicClarity)
  })

  it('handles well-written code', () => {
    const code = [
      '/** Module entry point */',
      "import { helper } from './utils.js'",
      'export function main() {',
      '  try {',
      '    const result = helper(42)',
      '    if (typeof result !== "number") return null',
      '    return result',
      '  } catch (e) {',
      '    throw new Error("Failed")',
      '  }',
      '}',
    ].join('\n')
    const result = buildMosaicLensResult(['src/index.ts'], [code], {})
    expect(result.stats.overallScore).toBeGreaterThan(60)
  })

  it('handles poorly-written code', () => {
    const code = [
      'var x = data as any',
      'if (x == null) {}',
      'for (const a of arr) { for (const b of arr) { for (const c of arr) {} } }',
    ].join('\n')
    const result = buildMosaicLensResult(['bad.ts'], [code], {})
    expect(result.stats.totalFindings).toBeGreaterThan(0)
    expect(['lopsided', 'fragile', 'balanced', 'resilient']).toContain(result.files[0].classification)
  })
})
