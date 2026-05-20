import { describe, expect, it } from 'vitest'

import {
  applyBehavioralLens,
  applyQualitativeLens,
  applyQuantitativeLens,
  applyRelationalLens,
  applyStructuralLens,
  applyTemporalLens,
  buildKaleidoscopeResult,
  computeBeauty,
  computeHarmony,
  computeSymmetry,
  findDominantPattern,
  generateRecommendations,
  getLenses,
  type KaleidoscopeStats,
  type LensView,
  type Finding,
  type Lens,
} from '../src/commands/kaleidoscope-helpers.js'

import {
  formatAllViews,
  formatAnomalyHighlights,
  formatKaleidoscopeJSON,
  formatKaleidoscopeRecommendations,
  formatKaleidoscopeStats,
  formatKaleidoscopeTable,
  formatLensView,
  formatPatternGallery,
} from '../src/commands/kaleidoscope-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const goodCode = `/**
 * Add two numbers together.
 * @example add(1, 2)
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Subtract b from a.
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * Multiply two numbers.
 */
export function multiply(a: number, b: number): number {
  return a * b
}
`

const badCode = `var x=1;var y=2;var z=3;if(x){if(y){if(z){for(let i=0;i<100;i++){while(true){try{if(x&&y||z){}}catch(e){if(x){}}}}}}}`

const importCode = `import { add } from './math.js'
import { format } from './utils.js'
import type { Config } from './types.js'
import { Logger } from './logger.js'
import { validate } from './validate.js'

export function process(config: Config): string {
  const result = add(1, 2)
  return format(result)
}
`

const documentedCode = `/**
 * Calculate the total of all items.
 */
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}

/**
 * Filter items by threshold.
 */
export function filterItems(items: number[], threshold: number): number[] {
  return items.filter(item => item > threshold)
}
`

const mixedContents = [goodCode, badCode, importCode, documentedCode]
const mixedFiles = ['src/math.ts', 'src/legacy.ts', 'src/processor.ts', 'src/helpers.ts', 'test/math.test.ts']

// ─── getLenses ─────────────────────────────────────────────────────────────────

describe('getLenses', () => {
  it('returns 6 lenses', () => {
    expect(getLenses()).toHaveLength(6)
  })

  it('includes all expected lens names', () => {
    const names = getLenses().map((l) => l.name)
    expect(names).toContain('Structural')
    expect(names).toContain('Behavioral')
    expect(names).toContain('Temporal')
    expect(names).toContain('Relational')
    expect(names).toContain('Qualitative')
    expect(names).toContain('Quantitative')
  })

  it('each lens has required properties', () => {
    for (const lens of getLenses()) {
      expect(lens).toHaveProperty('name')
      expect(lens).toHaveProperty('description')
      expect(lens).toHaveProperty('color')
      expect(lens).toHaveProperty('focus')
      expect(lens.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

// ─── applyStructuralLens ───────────────────────────────────────────────────────

describe('applyStructuralLens', () => {
  it('returns empty for no files', () => {
    const view = applyStructuralLens([], [])
    expect(view.findings).toHaveLength(0)
    expect(view.pattern).toBe('empty')
    expect(view.symmetry).toBe(50)
  })

  it('detects flat structure', () => {
    const view = applyStructuralLens(['a.ts', 'b.ts'], ['x', 'y'])
    expect(view.pattern).toBe('flat')
  })

  it('detects shallow hierarchy', () => {
    const view = applyStructuralLens(['src/a.ts', 'src/b.ts', 'lib/c.ts'], ['x', 'y', 'z'])
    expect(['flat', 'shallow-hierarchy']).toContain(view.pattern)
  })

  it('detects deep hierarchy', () => {
    const view = applyStructuralLens(['a/b/c/d/e/f.ts'], ['code'])
    expect(view.pattern).toBe('deep-hierarchy')
  })

  it('reports file count finding', () => {
    const view = applyStructuralLens(['a.ts', 'b.ts', 'c.ts'], ['x', 'y', 'z'])
    expect(view.findings.length).toBeGreaterThanOrEqual(1)
    expect(view.findings[0].files.length).toBeGreaterThan(0)
  })

  it('detects deep nesting anomaly', () => {
    const view = applyStructuralLens(['a/b/c/d/e/f/g/h.ts'], ['code'])
    const deepFinding = view.findings.find((f) => f.type === 'anomaly' && f.description.includes('Deep nesting'))
    expect(deepFinding).toBeDefined()
  })

  it('computes symmetry', () => {
    const view = applyStructuralLens(['a.ts', 'src/b.ts', 'src/c.ts'], ['x', 'y', 'z'])
    expect(view.symmetry).toBeGreaterThanOrEqual(0)
    expect(view.symmetry).toBeLessThanOrEqual(100)
  })
})

// ─── applyBehavioralLens ───────────────────────────────────────────────────────

describe('applyBehavioralLens', () => {
  it('returns empty for no contents', () => {
    const view = applyBehavioralLens([])
    expect(view.pattern).toBe('empty')
  })

  it('detects functions', () => {
    const view = applyBehavioralLens(['function add() {} function sub() {}'])
    expect(view.findings.length).toBeGreaterThanOrEqual(1)
    expect(view.findings[0].description).toContain('function')
  })

  it('detects async functions', () => {
    const view = applyBehavioralLens(['async function fetch() {} async function load() {} async function save() {}'])
    expect(view.findings[0].description).toContain('async')
  })

  it('detects arrow-heavy pattern', () => {
    const view = applyBehavioralLens(['const f = () => { return 1 }\nconst g = () => { return 2 }'])
    expect(['arrow-heavy', 'mixed']).toContain(view.pattern)
  })

  it('detects try/catch blocks', () => {
    const view = applyBehavioralLens(['function safe() { try {} catch(e) {} }\nfunction run() { try {} catch(e) {} }'])
    const errorFinding = view.findings.find((f) => f.description.includes('Error handling'))
    expect(errorFinding).toBeDefined()
  })

  it('detects high parameter count', () => {
    const view = applyBehavioralLens(['function huge(a, b, c, d, e, f) { return a + b }'])
    const paramFinding = view.findings.find((f) => f.description.includes('parameter'))
    expect(paramFinding).toBeDefined()
  })

  it('computes symmetry', () => {
    const view = applyBehavioralLens([goodCode, documentedCode])
    expect(view.symmetry).toBeGreaterThanOrEqual(0)
    expect(view.symmetry).toBeLessThanOrEqual(100)
  })
})

// ─── applyTemporalLens ─────────────────────────────────────────────────────────

describe('applyTemporalLens', () => {
  it('returns empty for no files', () => {
    const view = applyTemporalLens([])
    expect(view.pattern).toBe('empty')
  })

  it('detects source-heavy pattern', () => {
    const view = applyTemporalLens(['a.ts', 'b.ts', 'c.ts'])
    expect(['source-heavy', 'balanced']).toContain(view.pattern)
  })

  it('detects test-heavy pattern', () => {
    const view = applyTemporalLens(['a.test.ts', 'b.test.ts', 'c.test.ts', 'd.test.ts', 'e.ts'])
    expect(['test-heavy', 'balanced']).toContain(view.pattern)
  })

  it('reports test-to-source ratio', () => {
    const view = applyTemporalLens(['a.ts', 'b.ts', 'c.test.ts'])
    const ratioFinding = view.findings.find((f) => f.description.includes('source') || f.description.includes('test'))
    expect(ratioFinding).toBeDefined()
  })

  it('detects low test ratio anomaly', () => {
    const files = Array.from({ length: 20 }, (_, i) => `src${i}.ts`)
    const view = applyTemporalLens(files)
    const anomaly = view.findings.find((f) => f.type === 'anomaly' && f.description.includes('test'))
    expect(anomaly).toBeDefined()
  })

  it('detects config files', () => {
    const view = applyTemporalLens(['tsconfig.json', 'package.yaml', 'a.ts'])
    const configFinding = view.findings.find((f) => f.description.includes('configuration'))
    expect(configFinding).toBeDefined()
  })

  it('reports dominant file type', () => {
    const view = applyTemporalLens(['a.ts', 'b.ts', 'c.ts'])
    const dominant = view.findings.find((f) => f.description.includes('Dominant'))
    expect(dominant).toBeDefined()
  })
})

// ─── applyRelationalLens ───────────────────────────────────────────────────────

describe('applyRelationalLens', () => {
  it('returns empty for no files', () => {
    const view = applyRelationalLens([], [])
    expect(view.pattern).toBe('empty')
  })

  it('counts imports', () => {
    const view = applyRelationalLens(['mod.ts'], [importCode])
    const importFinding = view.findings.find((f) => f.description.includes('import'))
    expect(importFinding).toBeDefined()
  })

  it('detects hub files', () => {
    const manyImports = Array.from({ length: 8 }, (_, i) => `import { x${i} } from './mod${i}.js'`).join('\n')
    const view = applyRelationalLens(['hub.ts'], [manyImports])
    const hubFinding = view.findings.find((f) => f.description.includes('hub'))
    expect(hubFinding).toBeDefined()
  })

  it('detects isolated files', () => {
    const view = applyRelationalLens(['iso.ts', 'alone.ts'], ['const x = 1', 'const y = 2'])
    const isolated = view.findings.find((f) => f.description.includes('isolated'))
    expect(isolated).toBeDefined()
  })

  it('classifies pattern by hub threshold', () => {
    const view = applyRelationalLens(['a.ts'], [importCode])
    expect(['flat', 'modular', 'hub-spoke']).toContain(view.pattern)
  })

  it('computes symmetry', () => {
    const view = applyRelationalLens(['a.ts', 'b.ts'], [importCode, 'const x = 1'])
    expect(view.symmetry).toBeGreaterThanOrEqual(0)
    expect(view.symmetry).toBeLessThanOrEqual(100)
  })
})

// ─── applyQualitativeLens ──────────────────────────────────────────────────────

describe('applyQualitativeLens', () => {
  it('returns empty for no contents', () => {
    const view = applyQualitativeLens([])
    expect(view.pattern).toBe('empty')
  })

  it('detects well-documented code', () => {
    const view = applyQualitativeLens([documentedCode])
    expect(['well-documented', 'moderately-documented']).toContain(view.pattern)
  })

  it('detects undocumented code', () => {
    const view = applyQualitativeLens(['export function x() {}\nexport function y() {}'])
    expect(['undocumented', 'moderately-documented']).toContain(view.pattern)
  })

  it('reports documentation ratio', () => {
    const view = applyQualitativeLens([goodCode])
    const docFinding = view.findings.find((f) => f.description.includes('Documentation'))
    expect(docFinding).toBeDefined()
  })

  it('reports naming quality', () => {
    const view = applyQualitativeLens(['function calculateTotal() {}\nfunction processData() {}'])
    const nameFinding = view.findings.find((f) => f.description.includes('Naming'))
    expect(nameFinding).toBeDefined()
  })

  it('reports average file size', () => {
    const view = applyQualitativeLens([goodCode])
    const sizeFinding = view.findings.find((f) => f.description.includes('Average file size'))
    expect(sizeFinding).toBeDefined()
  })

  it('detects large files anomaly', () => {
    const largeContent = 'const x = 1\n'.repeat(600)
    const view = applyQualitativeLens([largeContent])
    const largeFinding = view.findings.find((f) => f.description.includes('Average file size') && f.type === 'anomaly')
    expect(largeFinding).toBeDefined()
  })
})

// ─── applyQuantitativeLens ─────────────────────────────────────────────────────

describe('applyQuantitativeLens', () => {
  it('returns empty for no contents', () => {
    const view = applyQuantitativeLens([])
    expect(view.pattern).toBe('empty')
  })

  it('reports line counts', () => {
    const view = applyQuantitativeLens([goodCode])
    const lineFinding = view.findings.find((f) => f.description.includes('Lines'))
    expect(lineFinding).toBeDefined()
  })

  it('reports function/class/export counts', () => {
    const view = applyQuantitativeLens([goodCode])
    const countFinding = view.findings.find((f) => f.description.includes('Functions'))
    expect(countFinding).toBeDefined()
  })

  it('detects large files', () => {
    const largeContent = 'const x = 1\n'.repeat(600)
    const view = applyQuantitativeLens([largeContent])
    const largeFinding = view.findings.find((f) => f.description.includes('Largest file'))
    expect(largeFinding).toBeDefined()
    expect(largeFinding!.type).toBe('anomaly')
  })

  it('detects high size variance', () => {
    const view = applyQuantitativeLens(['x', 'const x = 1\n'.repeat(400)])
    const varianceFinding = view.findings.find((f) => f.description.includes('variance'))
    expect(varianceFinding).toBeDefined()
  })

  it('classifies file size pattern', () => {
    const view = applyQuantitativeLens([goodCode])
    expect(['small-files', 'medium-files', 'large-files']).toContain(view.pattern)
  })

  it('computes symmetry', () => {
    const view = applyQuantitativeLens([goodCode, documentedCode])
    expect(view.symmetry).toBeGreaterThanOrEqual(0)
    expect(view.symmetry).toBeLessThanOrEqual(100)
  })
})

// ─── computeSymmetry ───────────────────────────────────────────────────────────

describe('computeSymmetry', () => {
  it('returns 70 for single value', () => {
    expect(computeSymmetry([5])).toBe(70)
  })

  it('returns 70 for empty array', () => {
    expect(computeSymmetry([])).toBe(70)
  })

  it('returns high symmetry for consistent values', () => {
    const result = computeSymmetry([10, 10, 10, 10])
    expect(result).toBe(100)
  })

  it('returns lower symmetry for varied values', () => {
    const consistent = computeSymmetry([10, 10, 10, 10])
    const varied = computeSymmetry([1, 100, 1, 100])
    expect(consistent).toBeGreaterThan(varied)
  })

  it('returns 0-100 range', () => {
    const result = computeSymmetry([1, 2, 3, 4, 5])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('returns 80 for all zeros', () => {
    expect(computeSymmetry([0, 0, 0])).toBe(80)
  })
})

// ─── computeBeauty ─────────────────────────────────────────────────────────────

describe('computeBeauty', () => {
  it('factors in symmetry', () => {
    const high = computeBeauty(90, 'mixed')
    const low = computeBeauty(30, 'mixed')
    expect(high).toBeGreaterThan(low)
  })

  it('adds bonus for good patterns', () => {
    const withBonus = computeBeauty(70, 'well-documented')
    const withoutBonus = computeBeauty(70, 'unknown-pattern')
    expect(withBonus).toBeGreaterThan(withoutBonus)
  })

  it('returns 0-100 range', () => {
    expect(computeBeauty(0, 'mixed')).toBeGreaterThanOrEqual(0)
    expect(computeBeauty(100, 'well-documented')).toBeLessThanOrEqual(100)
  })

  it('gives bonus for balanced pattern', () => {
    const withPattern = computeBeauty(60, 'balanced')
    const without = computeBeauty(60, 'unknown')
    expect(withPattern).toBeGreaterThan(without)
  })

  it('gives bonus for modular pattern', () => {
    const withPattern = computeBeauty(60, 'modular')
    const without = computeBeauty(60, 'unknown')
    expect(withPattern).toBeGreaterThan(without)
  })
})

// ─── computeHarmony ────────────────────────────────────────────────────────────

describe('computeHarmony', () => {
  const makeView = (sym: number, beauty: number): LensView => ({
    lens: { name: 'Test', description: '', color: '#000000', focus: '' },
    findings: [],
    pattern: 'mixed',
    symmetry: sym,
    beauty: beauty,
  })

  it('returns 50 for empty views', () => {
    expect(computeHarmony([])).toBe(50)
  })

  it('returns higher harmony for consistent views', () => {
    const consistent = computeHarmony([makeView(80, 80), makeView(80, 80)])
    const inconsistent = computeHarmony([makeView(20, 20), makeView(90, 90)])
    expect(consistent).toBeGreaterThan(inconsistent)
  })

  it('returns 0-100 range', () => {
    const result = computeHarmony([makeView(50, 50)])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('factors in beauty', () => {
    const highBeauty = computeHarmony([makeView(70, 90), makeView(70, 90)])
    const lowBeauty = computeHarmony([makeView(70, 20), makeView(70, 20)])
    expect(highBeauty).toBeGreaterThan(lowBeauty)
  })
})

// ─── findDominantPattern ───────────────────────────────────────────────────────

describe('findDominantPattern', () => {
  const makeView = (pattern: string): LensView => ({
    lens: { name: '', description: '', color: '#000000', focus: '' },
    findings: [],
    pattern,
    symmetry: 50,
    beauty: 50,
  })

  it('returns none for empty views', () => {
    expect(findDominantPattern([])).toBe('none')
  })

  it('returns most common pattern', () => {
    const views = [makeView('mixed'), makeView('flat'), makeView('mixed')]
    expect(findDominantPattern(views)).toBe('mixed')
  })

  it('handles all different patterns', () => {
    const views = [makeView('a'), makeView('b'), makeView('c')]
    const result = findDominantPattern(views)
    expect(['a', 'b', 'c']).toContain(result)
  })

  it('handles ties by picking first', () => {
    const views = [makeView('a'), makeView('b')]
    const result = findDominantPattern(views)
    expect(['a', 'b']).toContain(result)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeView = (name: string, sym: number, beauty: number, anomalyCount: number): LensView => ({
    lens: { name, description: '', color: '#000000', focus: '' },
    findings: Array.from({ length: anomalyCount }, (_, i) => ({
      description: `anomaly ${i}`, files: [] as string[], significance: 50, type: 'anomaly' as const,
    })),
    pattern: 'mixed',
    symmetry: sym,
    beauty,
  })

  const baseStats: KaleidoscopeStats = {
    totalLenses: 6, totalFindings: 10, avgSymmetry: 60, avgBeauty: 60,
    mostBeautifulLens: 'Structural', mostChaoticLens: 'Behavioral',
    patternCount: 8, anomalyCount: 2, overallHarmony: 60, dominantPattern: 'mixed',
  }

  it('recommends for low symmetry', () => {
    const views = [makeView('Test', 30, 50, 0)]
    const recs = generateRecommendations(views, baseStats)
    expect(recs.some((r) => r.includes('low symmetry'))).toBe(true)
  })

  it('recommends for low harmony', () => {
    const stats = { ...baseStats, overallHarmony: 30 }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('harmony'))).toBe(true)
  })

  it('recommends for many anomalies', () => {
    const views = [makeView('A', 50, 50, 3), makeView('B', 50, 50, 3)]
    const stats = { ...baseStats, anomalyCount: 6 }
    const recs = generateRecommendations(views, stats)
    expect(recs.some((r) => r.includes('anomal'))).toBe(true)
  })

  it('recommends for chaotic lens', () => {
    const views = [makeView('Messy', 50, 30, 0)]
    const stats = { ...baseStats, mostChaoticLens: 'Messy' }
    const recs = generateRecommendations(views, stats)
    expect(recs.some((r) => r.includes('chaotic') || r.includes('Messy'))).toBe(true)
  })

  it('gives positive recommendation when all is well', () => {
    const goodStats: KaleidoscopeStats = {
      totalLenses: 6, totalFindings: 5, avgSymmetry: 80, avgBeauty: 80,
      mostBeautifulLens: 'Structural', mostChaoticLens: 'Temporal',
      patternCount: 10, anomalyCount: 1, overallHarmony: 80, dominantPattern: 'balanced',
    }
    const views = [makeView('Structural', 80, 80, 0)]
    const recs = generateRecommendations(views, goodStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('mentions strong pattern ratio', () => {
    const goodStats: KaleidoscopeStats = {
      ...baseStats, patternCount: 12, anomalyCount: 2, overallHarmony: 70,
    }
    const recs = generateRecommendations([], goodStats)
    expect(recs.some((r) => r.includes('pattern-to-anomaly') || r.includes('convention'))).toBe(true)
  })
})

// ─── buildKaleidoscopeResult ───────────────────────────────────────────────────

describe('buildKaleidoscopeResult', () => {
  it('handles empty input', () => {
    const result = buildKaleidoscopeResult([], [], {})
    expect(result.views).toHaveLength(0)
    expect(result.stats.totalLenses).toBe(0)
    expect(result.stats.totalFindings).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('builds 6 lens views', () => {
    const result = buildKaleidoscopeResult(['a.ts'], [goodCode], {})
    expect(result.views).toHaveLength(6)
  })

  it('computes stats', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.stats.totalLenses).toBe(6)
    expect(result.stats.totalFindings).toBeGreaterThan(0)
    expect(result.stats.avgSymmetry).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgBeauty).toBeGreaterThanOrEqual(0)
  })

  it('sets most beautiful and most chaotic', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.stats.mostBeautifulLens).toBeTruthy()
    expect(result.stats.mostChaoticLens).toBeTruthy()
  })

  it('counts patterns and anomalies', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.stats.patternCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.anomalyCount).toBeGreaterThanOrEqual(0)
  })

  it('computes harmony', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.stats.overallHarmony).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallHarmony).toBeLessThanOrEqual(100)
  })

  it('finds dominant pattern', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.stats.dominantPattern).toBeTruthy()
  })

  it('counts unique patterns as rotation', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.rotation).toBeGreaterThanOrEqual(1)
  })

  it('generates recommendations', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('assigns proper lens metadata to views', () => {
    const result = buildKaleidoscopeResult(['a.ts'], [goodCode], {})
    const names = result.views.map((v) => v.lens.name)
    expect(names).toEqual(['Structural', 'Behavioral', 'Temporal', 'Relational', 'Qualitative', 'Quantitative'])
  })

  it('computes beauty for each view', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    for (const view of result.views) {
      expect(view.beauty).toBeGreaterThanOrEqual(0)
      expect(view.beauty).toBeLessThanOrEqual(100)
    }
  })

  it('handles mismatched files/contents', () => {
    const result = buildKaleidoscopeResult(['a.ts', 'b.ts'], ['code'], {})
    expect(result.views).toHaveLength(6)
  })
})

// ─── format helpers ────────────────────────────────────────────────────────────

describe('formatLensView', () => {
  it('formats a lens view', () => {
    const view: LensView = {
      lens: { name: 'Structural', description: 'Test lens', color: '#4A90D9', focus: 'Architecture' },
      findings: [{ description: 'Test finding', files: ['a.ts'], significance: 80, type: 'pattern' }],
      pattern: 'flat',
      symmetry: 75,
      beauty: 80,
    }
    const output = formatLensView(view)
    expect(output).toContain('Structural')
    expect(output).toContain('flat')
    expect(output).toContain('75%')
    expect(output).toContain('80%')
    expect(output).toContain('Test finding')
  })

  it('formats view with no findings', () => {
    const view: LensView = {
      lens: { name: 'Test', description: '', color: '#000000', focus: '' },
      findings: [],
      pattern: 'mixed',
      symmetry: 50,
      beauty: 50,
    }
    const output = formatLensView(view)
    expect(output).toContain('Test')
    expect(output).not.toContain('Findings:')
  })

  it('truncates file lists', () => {
    const view: LensView = {
      lens: { name: 'Test', description: '', color: '#000000', focus: '' },
      findings: [{ description: 'x', files: ['a','b','c','d','e'], significance: 50, type: 'pattern' }],
      pattern: 'mixed',
      symmetry: 50,
      beauty: 50,
    }
    const output = formatLensView(view)
    expect(output).toContain('+2 more')
  })
})

describe('formatAllViews', () => {
  it('handles empty views', () => {
    expect(formatAllViews([])).toContain('No lens views')
  })

  it('formats multiple views', () => {
    const views: LensView[] = [
      { lens: { name: 'A', description: '', color: '#FF0000', focus: '' }, findings: [], pattern: 'x', symmetry: 50, beauty: 50 },
      { lens: { name: 'B', description: '', color: '#00FF00', focus: '' }, findings: [], pattern: 'y', symmetry: 60, beauty: 60 },
    ]
    const output = formatAllViews(views)
    expect(output).toContain('A')
    expect(output).toContain('B')
  })
})

describe('formatAnomalyHighlights', () => {
  it('reports no anomalies', () => {
    const views: LensView[] = [
      { lens: { name: 'Test', description: '', color: '#000000', focus: '' }, findings: [{ description: 'ok', files: [], significance: 50, type: 'pattern' }], pattern: 'mixed', symmetry: 50, beauty: 50 },
    ]
    expect(formatAnomalyHighlights(views)).toContain('No anomalies')
  })

  it('formats anomalies sorted by significance', () => {
    const views: LensView[] = [
      {
        lens: { name: 'Test', description: '', color: '#000000', focus: '' },
        findings: [
          { description: 'Low anomaly', files: [], significance: 30, type: 'anomaly' },
          { description: 'High anomaly', files: ['a.ts'], significance: 90, type: 'anomaly' },
        ],
        pattern: 'mixed', symmetry: 50, beauty: 50,
      },
    ]
    const output = formatAnomalyHighlights(views)
    const lowIdx = output.indexOf('Low anomaly')
    const highIdx = output.indexOf('High anomaly')
    expect(highIdx).toBeLessThan(lowIdx)
  })
})

describe('formatPatternGallery', () => {
  it('handles empty views', () => {
    expect(formatPatternGallery([])).toContain('No patterns')
  })

  it('shows each lens pattern', () => {
    const views: LensView[] = [
      { lens: { name: 'Structural', description: '', color: '#4A90D9', focus: '' }, findings: [], pattern: 'flat', symmetry: 50, beauty: 50 },
      { lens: { name: 'Behavioral', description: '', color: '#E67E22', focus: '' }, findings: [], pattern: 'mixed', symmetry: 50, beauty: 50 },
    ]
    const output = formatPatternGallery(views)
    expect(output).toContain('flat')
    expect(output).toContain('mixed')
  })
})

describe('formatKaleidoscopeStats', () => {
  it('formats all stats', () => {
    const stats: KaleidoscopeStats = {
      totalLenses: 6, totalFindings: 20, avgSymmetry: 70, avgBeauty: 65,
      mostBeautifulLens: 'Structural', mostChaoticLens: 'Temporal',
      patternCount: 12, anomalyCount: 3, overallHarmony: 75, dominantPattern: 'flat',
    }
    const output = formatKaleidoscopeStats(stats)
    expect(output).toContain('Total Lenses')
    expect(output).toContain('Total Findings')
    expect(output).toContain('Structural')
    expect(output).toContain('Temporal')
    expect(output).toContain('75%')
    expect(output).toContain('flat')
  })
})

describe('formatKaleidoscopeRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatKaleidoscopeRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatKaleidoscopeRecommendations(['Fix A', 'Fix B'])
    expect(output).toContain('1. Fix A')
    expect(output).toContain('2. Fix B')
  })
})

describe('formatKaleidoscopeTable', () => {
  it('formats complete result', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    const output = formatKaleidoscopeTable(result)
    expect(output).toContain('Kaleidoscope Analysis')
    expect(output).toContain('Pattern Gallery')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })

  it('handles empty result', () => {
    const result = buildKaleidoscopeResult([], [], {})
    const output = formatKaleidoscopeTable(result)
    expect(output).toContain('Kaleidoscope Analysis')
  })
})

describe('formatKaleidoscopeJSON', () => {
  it('returns valid JSON', () => {
    const result = buildKaleidoscopeResult(mixedFiles, mixedContents, {})
    const json = formatKaleidoscopeJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('views')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
    expect(parsed).toHaveProperty('rotation')
  })

  it('handles empty result', () => {
    const result = buildKaleidoscopeResult([], [], {})
    const parsed = JSON.parse(formatKaleidoscopeJSON(result))
    expect(parsed.views).toHaveLength(0)
  })
})
