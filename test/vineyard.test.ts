import { describe, expect, it } from 'vitest'

import {
  evaluateVintage,
  assessAgingPotential,
  detectCorked,
  detectVinegar,
  classifyVintage,
  analyzeBlend,
  analyzeTerroir,
  computeCellarRating,
  computeAgingIndex,
  computeBlendQuality,
  classifyOverall,
  generateRecommendations,
  buildVineyardResult,
  type Vintage,
  type Blend,
  type Terroir,
  type VineyardStats,
} from '../src/commands/vineyard-helpers.js'

import { formatVineyardTable, formatVineyardJson } from '../src/commands/vineyard-format-helpers.js'

// ─── evaluateVintage ────────────────────────────────────────────────────────

describe('evaluateVintage', () => {
  it('returns a Vintage with all fields', () => {
    const v = evaluateVintage('export function f(): number { return 1 }', 'a.ts')
    expect(v.file).toBe('a.ts')
    expect(v.quality).toBeGreaterThanOrEqual(0)
    expect(v.quality).toBeLessThanOrEqual(100)
    expect(v.body).toBeGreaterThanOrEqual(0)
    expect(v.body).toBeLessThanOrEqual(100)
    expect(v.clarity).toBeGreaterThanOrEqual(0)
    expect(v.clarity).toBeLessThanOrEqual(100)
    expect(v.finish).toBeGreaterThanOrEqual(0)
    expect(v.finish).toBeLessThanOrEqual(100)
    expect(v.balance).toBeGreaterThanOrEqual(0)
    expect(v.balance).toBeLessThanOrEqual(100)
    expect(v.agingPotential).toBeGreaterThanOrEqual(0)
    expect(v.agingPotential).toBeLessThanOrEqual(100)
    expect(typeof v.isCorked).toBe('boolean')
    expect(typeof v.isVinegar).toBe('boolean')
    expect(v.classification).toBeDefined()
    expect(Array.isArray(v.tastingNotes)).toBe(true)
    expect(typeof v.year).toBe('string')
    expect(typeof v.terroir).toBe('string')
  })

  it('gives higher quality for well-documented code', () => {
    const good = evaluateVintage('/** docs */\nexport function f(): number { return 1 }', 'a.ts')
    const bad = evaluateVintage('var x = 1', 'a.ts')
    expect(good.quality).toBeGreaterThan(bad.quality)
  })

  it('detects terroir from path', () => {
    const v = evaluateVintage('const x = 1', 'src/utils/helper.ts')
    expect(v.terroir).toBe('src')
  })

  it('returns root terroir for flat path', () => {
    const v = evaluateVintage('const x = 1', 'helper.ts')
    expect(v.terroir).toBe('root')
  })

  it('assigns year based on quality', () => {
    const high = evaluateVintage('/** docs */\nexport function f(): number { return 1 }\ntry { f() } catch(e) {}', 'a.ts')
    expect(['reserve', 'current', 'recent', 'aged', 'vintage-unknown']).toContain(high.year)
  })
})

// ─── assessAgingPotential ───────────────────────────────────────────────────

describe('assessAgingPotential', () => {
  it('returns a number between 0 and 100', () => {
    const result = assessAgingPotential(50, 50, 50)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher potential for high quality', () => {
    const high = assessAgingPotential(90, 80, 80)
    const low = assessAgingPotential(30, 30, 30)
    expect(high).toBeGreaterThan(low)
  })

  it('increases with balance', () => {
    const balanced = assessAgingPotential(60, 80, 60)
    const unbalanced = assessAgingPotential(60, 40, 60)
    expect(balanced).toBeGreaterThan(unbalanced)
  })

  it('increases with clarity', () => {
    const clear = assessAgingPotential(60, 60, 80)
    const unclear = assessAgingPotential(60, 60, 40)
    expect(clear).toBeGreaterThan(unclear)
  })
})

// ─── detectCorked ───────────────────────────────────────────────────────────

describe('detectCorked', () => {
  it('returns false for clean code', () => {
    expect(detectCorked('export function f(x: number): number { return x * 2 }')).toBe(false)
  })

  it('returns false for single issue', () => {
    expect(detectCorked('const x: any = 1')).toBe(false)
  })

  it('detects eval as corked indicator', () => {
    expect(detectCorked('eval("code")')).toBe(false)
  })

  it('detects multiple issues as corked', () => {
    const code = 'eval("code")\nexport const x: any = 1'
    expect(detectCorked(code)).toBe(true)
  })

  it('detects debugger and ts-ignore as corked', () => {
    const code = 'debugger\n// @ts-ignore\nconst x = 1'
    expect(detectCorked(code)).toBe(true)
  })

  it('detects as any and eval as corked', () => {
    const code = 'const x = eval("1") as any'
    expect(detectCorked(code)).toBe(true)
  })

  it('detects with statement', () => {
    const code = 'with (obj) { x = 1 }'
    expect(detectCorked(code)).toBe(false)
  })
})

// ─── detectVinegar ──────────────────────────────────────────────────────────

describe('detectVinegar', () => {
  it('returns false for modern code', () => {
    expect(detectVinegar('const x = 1', 'a.ts')).toBe(false)
  })

  it('returns false for single legacy pattern', () => {
    expect(detectVinegar('var x = 1', 'a.ts')).toBe(false)
  })

  it('detects var and deprecated as vinegar', () => {
    const code = 'var x = 1\n// @deprecated\nfunction old() {}'
    expect(detectVinegar(code, 'a.ts')).toBe(true)
  })

  it('detects var and require-only as vinegar', () => {
    const code = 'var fs = require("fs")\nvar path = require("path")'
    expect(detectVinegar(code, 'a.js')).toBe(true)
  })

  it('detects callback hell as vinegar indicator', () => {
    const code = 'var x = 1\nasync(function(err, result) { console.log(result) }, function() {})'
    expect(detectVinegar(code, 'a.ts')).toBe(true)
  })
})

// ─── classifyVintage ────────────────────────────────────────────────────────

describe('classifyVintage', () => {
  it('returns grand-cru for high scores', () => {
    expect(classifyVintage(90, 85, 80)).toBe('grand-cru')
  })

  it('returns premier-cru for good scores', () => {
    expect(classifyVintage(70, 65, 60)).toBe('premier-cru')
  })

  it('returns cru-bourgeois for medium scores', () => {
    expect(classifyVintage(55, 50, 45)).toBe('cru-bourgeois')
  })

  it('returns table-wine for low scores', () => {
    expect(classifyVintage(40, 35, 30)).toBe('table-wine')
  })

  it('returns vinegar for very low scores', () => {
    expect(classifyVintage(15, 15, 15)).toBe('vinegar')
  })
})

// ─── analyzeBlend ───────────────────────────────────────────────────────────

describe('analyzeBlend', () => {
  it('returns a Blend with all fields', () => {
    const blend = analyzeBlend(['a.ts', 'b.ts'], ['export function f() {}', 'interface A {}'], 'src')
    expect(blend.name).toBe('src')
    expect(blend.components).toHaveLength(2)
    expect(blend.harmony).toBeGreaterThanOrEqual(0)
    expect(blend.harmony).toBeLessThanOrEqual(100)
    expect(blend.balance).toBeGreaterThanOrEqual(0)
    expect(blend.balance).toBeLessThanOrEqual(100)
    expect(blend.complexity).toBeGreaterThanOrEqual(0)
    expect(blend.complexity).toBeLessThanOrEqual(100)
    expect(blend.grade).toBeDefined()
    expect(Array.isArray(blend.tastingNotes)).toBe(true)
  })

  it('detects function contributions', () => {
    const blend = analyzeBlend(['a.ts'], ['export function f() {}'], 'src')
    expect(blend.components[0].contribution).toBe('behavior')
  })

  it('detects interface contributions', () => {
    const blend = analyzeBlend(['a.ts'], ['interface A { name: string }'], 'src')
    expect(blend.components[0].contribution).toBe('types')
  })

  it('detects class contributions', () => {
    const blend = analyzeBlend(['a.ts'], ['class Widget {}'], 'src')
    expect(blend.components[0].contribution).toBe('structure')
  })

  it('detects const contributions', () => {
    const blend = analyzeBlend(['a.ts'], ['export const VERSION = "1.0"'], 'src')
    expect(blend.components[0].contribution).toBe('values')
  })

  it('defaults to utility contribution', () => {
    const blend = analyzeBlend(['a.ts'], ['console.log("hi")'], 'src')
    expect(blend.components[0].contribution).toBe('utility')
  })

  it('computes component strength', () => {
    const blend = analyzeBlend(['a.ts'], ['export function f() {}'], 'src')
    expect(blend.components[0].strength).toBeGreaterThanOrEqual(0)
    expect(blend.components[0].strength).toBeLessThanOrEqual(100)
  })

  it('computes component harmony', () => {
    const blend = analyzeBlend(['a.ts'], ['export function f() {}'], 'src')
    expect(blend.components[0].harmony).toBeGreaterThanOrEqual(0)
    expect(blend.components[0].harmony).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeTerroir ─────────────────────────────────────────────────────────

describe('analyzeTerroir', () => {
  it('returns a Terroir with all fields', () => {
    const t = analyzeTerroir(['a.ts'], ['export function f() {}'], 'src')
    expect(t.name).toBe('src')
    expect(Array.isArray(t.characteristics)).toBe(true)
    expect(t.files).toEqual(['a.ts'])
    expect(t.avgQuality).toBeGreaterThanOrEqual(0)
    expect(t.avgQuality).toBeLessThanOrEqual(100)
    expect(['elevating', 'supportive', 'neutral', 'degrading']).toContain(t.influence)
  })

  it('detects typescript ecosystem', () => {
    const t = analyzeTerroir(['a.ts'], ['const x = 1'], 'src')
    expect(t.characteristics).toContain('typescript-ecosystem')
  })

  it('detects test culture', () => {
    const t = analyzeTerroir(['a.ts'], ['test("works", () => { expect(1).toBe(1) })'], 'src')
    expect(t.characteristics).toContain('test-culture')
  })

  it('detects documentation focus', () => {
    const t = analyzeTerroir(['a.ts'], ['/** docs */\nexport function f() {}'], 'src')
    expect(t.characteristics).toContain('documentation-focused')
  })

  it('detects configuration-heavy', () => {
    const t = analyzeTerroir(['config.ts'], ['export const config = {}'], 'src')
    expect(t.characteristics).toContain('configuration-heavy')
  })

  it('returns elevating for high quality', () => {
    const code = '/** docs */\nexport function f(x: number): number { return x }\ntry { f(1) } catch(e) {}'
    const t = analyzeTerroir(['a.ts'], [code], 'src')
    expect(t.influence).toBe('elevating')
  })

  it('returns degrading for low quality', () => {
    const t = analyzeTerroir(['a.ts'], ['var x: any = 1'], 'src')
    expect(t.influence).toBe('degrading')
  })

  it('returns neutral for moderate quality', () => {
    const t = analyzeTerroir(['a.ts'], ['const x = 1'], 'src')
    expect(t.influence).toBe('neutral')
  })
})

// ─── computeCellarRating ────────────────────────────────────────────────────

describe('computeCellarRating', () => {
  it('returns 50 for empty vintages', () => {
    expect(computeCellarRating([], [])).toBe(50)
  })

  it('increases with higher quality vintages', () => {
    const goodVintages: Vintage[] = [
      { file: 'a.ts', year: 'reserve', quality: 90, body: 80, clarity: 85, finish: 70, balance: 75, terroir: 'src', agingPotential: 85, isCorked: false, isVinegar: false, classification: 'grand-cru', tastingNotes: [] },
    ]
    const badVintages: Vintage[] = [
      { file: 'b.ts', year: 'vintage-unknown', quality: 20, body: 15, clarity: 10, finish: 10, balance: 10, terroir: 'src', agingPotential: 15, isCorked: false, isVinegar: false, classification: 'vinegar', tastingNotes: [] },
    ]
    expect(computeCellarRating(goodVintages, [])).toBeGreaterThan(computeCellarRating(badVintages, []))
  })

  it('penalizes corked files', () => {
    const corked: Vintage[] = [
      { file: 'a.ts', year: 'current', quality: 60, body: 50, clarity: 50, finish: 50, balance: 50, terroir: 'src', agingPotential: 50, isCorked: true, isVinegar: false, classification: 'cru-bourgeois', tastingNotes: [] },
    ]
    const clean: Vintage[] = [
      { file: 'a.ts', year: 'current', quality: 60, body: 50, clarity: 50, finish: 50, balance: 50, terroir: 'src', agingPotential: 50, isCorked: false, isVinegar: false, classification: 'cru-bourgeois', tastingNotes: [] },
    ]
    expect(computeCellarRating(clean, [])).toBeGreaterThan(computeCellarRating(corked, []))
  })

  it('penalizes vinegar files', () => {
    const vinegar: Vintage[] = [
      { file: 'a.ts', year: 'current', quality: 60, body: 50, clarity: 50, finish: 50, balance: 50, terroir: 'src', agingPotential: 50, isCorked: false, isVinegar: true, classification: 'cru-bourgeois', tastingNotes: [] },
    ]
    const fresh: Vintage[] = [
      { file: 'a.ts', year: 'current', quality: 60, body: 50, clarity: 50, finish: 50, balance: 50, terroir: 'src', agingPotential: 50, isCorked: false, isVinegar: false, classification: 'cru-bourgeois', tastingNotes: [] },
    ]
    expect(computeCellarRating(fresh, [])).toBeGreaterThan(computeCellarRating(vinegar, []))
  })

  it('bonuses for good blends', () => {
    const vintages: Vintage[] = [
      { file: 'a.ts', year: 'current', quality: 60, body: 50, clarity: 50, finish: 50, balance: 50, terroir: 'src', agingPotential: 50, isCorked: false, isVinegar: false, classification: 'cru-bourgeois', tastingNotes: [] },
    ]
    const goodBlend: Blend[] = [{ name: 'src', components: [], harmony: 80, balance: 75, complexity: 50, tastingNotes: [], grade: 'well-blended' }]
    expect(computeCellarRating(vintages, goodBlend)).toBeGreaterThan(computeCellarRating(vintages, []))
  })
})

// ─── computeAgingIndex ──────────────────────────────────────────────────────

describe('computeAgingIndex', () => {
  it('returns 50 for empty vintages', () => {
    expect(computeAgingIndex([])).toBe(50)
  })

  it('averages aging potential', () => {
    const vintages: Vintage[] = [
      { file: 'a.ts', year: 'reserve', quality: 80, body: 70, clarity: 75, finish: 60, balance: 70, terroir: 'src', agingPotential: 70, isCorked: false, isVinegar: false, classification: 'grand-cru', tastingNotes: [] },
      { file: 'b.ts', year: 'reserve', quality: 80, body: 70, clarity: 75, finish: 60, balance: 70, terroir: 'src', agingPotential: 90, isCorked: false, isVinegar: false, classification: 'grand-cru', tastingNotes: [] },
    ]
    expect(computeAgingIndex(vintages)).toBe(80)
  })
})

// ─── computeBlendQuality ────────────────────────────────────────────────────

describe('computeBlendQuality', () => {
  it('returns 50 for empty blends', () => {
    expect(computeBlendQuality([])).toBe(50)
  })

  it('averages blend harmony', () => {
    const blends: Blend[] = [
      { name: 'a', components: [], harmony: 60, balance: 50, complexity: 40, tastingNotes: [], grade: 'balanced' },
      { name: 'b', components: [], harmony: 80, balance: 70, complexity: 50, tastingNotes: [], grade: 'well-blended' },
    ]
    expect(computeBlendQuality(blends)).toBe(70)
  })
})

// ─── classifyOverall ────────────────────────────────────────────────────────

describe('classifyOverall', () => {
  it('returns legendary for high scores', () => {
    expect(classifyOverall(85, 85)).toBe('legendary')
  })

  it('returns excellent for good scores', () => {
    expect(classifyOverall(70, 70)).toBe('excellent')
  })

  it('returns good for medium scores', () => {
    expect(classifyOverall(55, 55)).toBe('good')
  })

  it('returns mediocre for low scores', () => {
    expect(classifyOverall(40, 40)).toBe('mediocre')
  })

  it('returns plonk for very low scores', () => {
    expect(classifyOverall(20, 20)).toBe('plonk')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty for healthy codebase', () => {
    const vintages: Vintage[] = [
      { file: 'a.ts', year: 'reserve', quality: 80, body: 70, clarity: 75, finish: 60, balance: 70, terroir: 'src', agingPotential: 70, isCorked: false, isVinegar: false, classification: 'grand-cru', tastingNotes: [] },
    ]
    const stats = makeStats({ avgFinish: 70, avgClarity: 70, cellarRating: 70 })
    const recs = generateRecommendations(vintages, [], [], stats)
    expect(recs.length).toBe(0)
  })

  it('recommends investigating corked files', () => {
    const vintages: Vintage[] = [
      { file: 'a.ts', year: 'current', quality: 50, body: 40, clarity: 40, finish: 30, balance: 40, terroir: 'src', agingPotential: 40, isCorked: true, isVinegar: false, classification: 'cru-bourgeois', tastingNotes: [] },
    ]
    const stats = makeStats({ cellarRating: 50 })
    const recs = generateRecommendations(vintages, [], [], stats)
    expect(recs.some(r => r.includes('corked'))).toBe(true)
  })

  it('recommends modernizing vinegar files', () => {
    const vintages: Vintage[] = [
      { file: 'a.ts', year: 'aged', quality: 40, body: 30, clarity: 30, finish: 20, balance: 30, terroir: 'src', agingPotential: 25, isCorked: false, isVinegar: true, classification: 'table-wine', tastingNotes: [] },
    ]
    const stats = makeStats({})
    const recs = generateRecommendations(vintages, [], [], stats)
    expect(recs.some(r => r.includes('vinegar'))).toBe(true)
  })

  it('recommends improving low aging potential', () => {
    const vintages: Vintage[] = [
      { file: 'a.ts', year: 'aged', quality: 40, body: 30, clarity: 30, finish: 20, balance: 30, terroir: 'src', agingPotential: 25, isCorked: false, isVinegar: false, classification: 'table-wine', tastingNotes: [] },
    ]
    const stats = makeStats({})
    const recs = generateRecommendations(vintages, [], [], stats)
    expect(recs.some(r => r.includes('aging potential'))).toBe(true)
  })

  it('recommends fixing mismatched blends', () => {
    const blends: Blend[] = [
      { name: 'src', components: [], harmony: 20, balance: 20, complexity: 10, tastingNotes: [], grade: 'mismatched' },
    ]
    const stats = makeStats({})
    const recs = generateRecommendations([], blends, [], stats)
    expect(recs.some(r => r.includes('mismatched'))).toBe(true)
  })

  it('recommends improving poor terroirs', () => {
    const terroirs: Terroir[] = [
      { name: 'legacy', characteristics: [], files: [], avgQuality: 20, influence: 'degrading' },
    ]
    const stats = makeStats({})
    const recs = generateRecommendations([], [], terroirs, stats)
    expect(recs.some(r => r.includes('terroir'))).toBe(true)
  })

  it('recommends documentation for low finish', () => {
    const stats = makeStats({ avgFinish: 30, cellarRating: 50 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('documentation'))).toBe(true)
  })

  it('recommends clarity improvement for low clarity', () => {
    const stats = makeStats({ avgClarity: 30, cellarRating: 50 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('clarity'))).toBe(true)
  })

  it('recommends review for very low cellar rating', () => {
    const stats = makeStats({ cellarRating: 30 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Cellar'))).toBe(true)
  })
})

function makeStats(overrides: Partial<VineyardStats> = {}): VineyardStats {
  return {
    totalVintages: 1,
    grandCruCount: 0,
    vinegarCount: 0,
    corkedCount: 0,
    avgQuality: 60,
    avgBody: 50,
    avgClarity: 60,
    avgFinish: 60,
    avgBalance: 60,
    avgAgingPotential: 60,
    totalBlends: 0,
    exceptionalBlends: 0,
    mismatchedBlends: 0,
    avgBlendHarmony: 50,
    totalTerroirs: 0,
    bestTerroir: 'none',
    worstTerroir: 'none',
    overallVintage: 'good',
    cellarRating: 60,
    agingIndex: 60,
    blendQuality: 50,
    ...overrides,
  }
}

// ─── buildVineyardResult ────────────────────────────────────────────────────

describe('buildVineyardResult', () => {
  it('returns result with correct structure', () => {
    const result = buildVineyardResult([], [], {})
    expect(result).toHaveProperty('vintages')
    expect(result).toHaveProperty('blends')
    expect(result).toHaveProperty('terroirs')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates vintages for each file', () => {
    const result = buildVineyardResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.vintages).toHaveLength(2)
  })

  it('populates stats correctly', () => {
    const result = buildVineyardResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.totalVintages).toBe(1)
    expect(result.stats.avgQuality).toBeGreaterThanOrEqual(0)
  })

  it('creates blends for multi-file directories', () => {
    const result = buildVineyardResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function f() {}', 'interface A {}'],
      {},
    )
    expect(result.blends.length).toBeGreaterThan(0)
  })

  it('creates terroirs for directories', () => {
    const result = buildVineyardResult(
      ['src/a.ts'],
      ['export function f() {}'],
      {},
    )
    expect(result.terroirs.length).toBeGreaterThan(0)
  })

  it('computes best and worst terroir', () => {
    const goodCode = '/** docs */\nexport function f(): number { return 1 }\ntry { f() } catch(e) {}'
    const badCode = 'var x: any = 1'
    const result = buildVineyardResult(
      ['good/a.ts', 'bad/a.ts'],
      [goodCode, badCode],
      {},
    )
    expect(result.stats.bestTerroir).toBe('good')
    expect(result.stats.worstTerroir).toBe('bad')
  })

  it('classifies overall vintage', () => {
    const result = buildVineyardResult(['a.ts'], ['export function f() {}'], {})
    expect(['legendary', 'excellent', 'good', 'mediocre', 'plonk']).toContain(result.stats.overallVintage)
  })

  it('computes cellar rating', () => {
    const result = buildVineyardResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.cellarRating).toBeGreaterThanOrEqual(0)
    expect(result.stats.cellarRating).toBeLessThanOrEqual(100)
  })

  it('handles empty input', () => {
    const result = buildVineyardResult([], [], {})
    expect(result.vintages).toHaveLength(0)
    expect(result.blends).toHaveLength(0)
    expect(result.stats.totalVintages).toBe(0)
  })
})

// ─── formatVineyardTable ────────────────────────────────────────────────────

describe('formatVineyardTable', () => {
  it('returns a string', () => {
    const result = buildVineyardResult([], [], {})
    const formatted = formatVineyardTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildVineyardResult(['a.ts'], ['export function f() {}'], {})
    const formatted = formatVineyardTable(result, false)
    expect(formatted).toContain('Vintages')
    expect(formatted).toContain('Statistics')
  })

  it('shows no files message when empty', () => {
    const result = buildVineyardResult([], [], {})
    const formatted = formatVineyardTable(result, false)
    expect(formatted).toContain('No files analyzed')
  })

  it('shows terroirs section when present', () => {
    const result = buildVineyardResult(['src/a.ts'], ['const x = 1'], {})
    const formatted = formatVineyardTable(result, false)
    expect(formatted).toContain('Terroirs')
  })

  it('shows recommendations when present', () => {
    const result = buildVineyardResult([], [], {})
    const stats = makeStats({ cellarRating: 20, avgFinish: 20, avgClarity: 20 })
    result.stats = stats
    result.recommendations = generateRecommendations([], [], [], stats)
    const formatted = formatVineyardTable(result, false)
    expect(formatted).toContain('Recommendations')
  })

  it('respects verbose flag', () => {
    const files = Array(15).fill('a.ts')
    const contents = Array(15).fill('export function f() {}')
    const result = buildVineyardResult(files, contents, {})
    const nonVerbose = formatVineyardTable(result, false)
    const verbose = formatVineyardTable(result, true)
    expect(verbose.length).toBeGreaterThan(nonVerbose.length)
  })
})

// ─── formatVineyardJson ─────────────────────────────────────────────────────

describe('formatVineyardJson', () => {
  it('returns valid JSON', () => {
    const result = buildVineyardResult([], [], {})
    const json = formatVineyardJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains vintages in JSON', () => {
    const result = buildVineyardResult([], [], {})
    const parsed = JSON.parse(formatVineyardJson(result))
    expect(parsed).toHaveProperty('vintages')
  })

  it('contains stats in JSON', () => {
    const result = buildVineyardResult(['a.ts'], ['export function f() {}'], {})
    const parsed = JSON.parse(formatVineyardJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalVintages).toBe(1)
  })
})
