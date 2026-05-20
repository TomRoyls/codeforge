import { describe, expect, it } from 'vitest'

import {
  buildHeredityResult,
  classifyLineageHealth,
  classifyOverallHealth,
  computeDiversity,
  computeFitness,
  computeMutationRate,
  computeTraitCoverage,
  detectMutations,
  extractTraits,
  generateRecommendations,
  traceLineages,
  type CodeMutation,
  type CodeTrait,
  type GenePool,
  type HeredityOptions,
  type HeredityResult,
  type HeredityStats,
  type Lineage,
  type OverallHealth,
} from '../src/commands/heredity-helpers.js'

import {
  formatDiversityGauge,
  formatHeredityJson,
  formatHeredityStats,
  formatHeredityTable,
  formatLineageHealthLabel,
  formatLineages,
  formatMutations,
  formatOverallHealthLabel,
  formatPools,
  formatRecommendations,
  formatTraits,
} from '../src/commands/heredity-format-helpers.js'

// ─── extractTraits ──────────────────────────────────────────────────────────────

describe('extractTraits', () => {
  it('returns empty for empty content', () => {
    expect(extractTraits('', 'a.ts')).toEqual([])
  })

  it('returns empty for whitespace-only content', () => {
    expect(extractTraits('   \n\t  ', 'a.ts')).toEqual([])
  })

  it('extracts method traits', () => {
    const traits = extractTraits('class Foo { bar() {} baz(x: number): void {} }', 'a.ts')
    const methods = traits.filter(t => t.type === 'method')
    expect(methods.length).toBeGreaterThanOrEqual(2)
    expect(methods.map(m => m.name)).toContain('bar')
    expect(methods.map(m => m.name)).toContain('baz')
  })

  it('extracts property traits', () => {
    const traits = extractTraits('class Foo { public name: string; private age: number; }', 'a.ts')
    const props = traits.filter(t => t.type === 'property')
    expect(props.length).toBeGreaterThanOrEqual(2)
  })

  it('extracts export convention traits', () => {
    const traits = extractTraits('export const foo = 1;\nexport function bar() {}\nexport class Baz {}', 'a.ts')
    const conventions = traits.filter(t => t.type === 'convention')
    expect(conventions.length).toBe(3)
  })

  it('extracts naming-convention style trait', () => {
    const content = 'const getName = 1; const isEnabled = 2; const hasValue = 3;'
    const traits = extractTraits(content, 'a.ts')
    const styles = traits.filter(t => t.type === 'style' && t.name === 'naming-convention')
    expect(styles.length).toBe(1)
  })

  it('does not extract naming-convention for few matches', () => {
    const content = 'const getName = 1;'
    const traits = extractTraits(content, 'a.ts')
    const styles = traits.filter(t => t.type === 'style')
    expect(styles.length).toBe(0)
  })

  it('extracts typed-signatures pattern trait', () => {
    const content = 'function a(): string {}\nfunction b(): number {}\nfunction c(): boolean {}'
    const traits = extractTraits(content, 'a.ts')
    const patterns = traits.filter(t => t.type === 'pattern' && t.name === 'typed-signatures')
    expect(patterns.length).toBe(1)
  })

  it('does not extract typed-signatures for few matches', () => {
    const content = 'function a(): string {}'
    const traits = extractTraits(content, 'a.ts')
    const patterns = traits.filter(t => t.name === 'typed-signatures')
    expect(patterns.length).toBe(0)
  })

  it('sets origin to filePath', () => {
    const traits = extractTraits('export function foo() {}', 'my/file.ts')
    expect(traits.every(t => t.origin === 'my/file.ts')).toBe(true)
  })

  it('sets carriers to [filePath]', () => {
    const traits = extractTraits('export function foo() {}', 'a.ts')
    expect(traits.every(t => t.carriers.length === 1 && t.carriers[0] === 'a.ts')).toBe(true)
  })

  it('initializes traits as not dominant', () => {
    const traits = extractTraits('export function foo() {}', 'a.ts')
    expect(traits.every(t => t.isDominant === false)).toBe(true)
  })

  it('initializes traits as not mutated', () => {
    const traits = extractTraits('export function foo() {}', 'a.ts')
    expect(traits.every(t => t.isMutated === false)).toBe(true)
  })

  it('initializes expression as consistent', () => {
    const traits = extractTraits('export function foo() {}', 'a.ts')
    expect(traits.every(t => t.expression === 'consistent')).toBe(true)
  })

  it('skips keywords like if/for/while as method names', () => {
    const traits = extractTraits('if (true) {} for (let i = 0; i < 5; i++) {}', 'a.ts')
    const methods = traits.filter(t => t.type === 'method')
    const names = methods.map(m => m.name)
    expect(names).not.toContain('if')
    expect(names).not.toContain('for')
  })
})

// ─── detectMutations ────────────────────────────────────────────────────────────

describe('detectMutations', () => {
  it('returns empty for empty content', () => {
    expect(detectMutations('', [])).toEqual([])
  })

  it('returns empty for whitespace-only content', () => {
    expect(detectMutations('   ', [])).toEqual([])
  })

  it('detects override mutations', () => {
    const mutations = detectMutations('class Child extends Parent { // override\n bar() {} }', [])
    const overrides = mutations.filter(m => m.type === 'override')
    expect(overrides.length).toBeGreaterThanOrEqual(1)
  })

  it('detects @override mutations', () => {
    const mutations = detectMutations('@override bar() {}', [])
    const overrides = mutations.filter(m => m.type === 'override')
    expect(overrides.length).toBeGreaterThanOrEqual(1)
  })

  it('detects super call mutations', () => {
    const mutations = detectMutations('super.method()', [])
    const overrides = mutations.filter(m => m.type === 'override')
    expect(overrides.length).toBeGreaterThanOrEqual(1)
  })

  it('detects async enhancement mutations', () => {
    const mutations = detectMutations('class Foo { async fetchData() {} }', [])
    const enhancements = mutations.filter(m => m.type === 'enhancement')
    expect(enhancements.length).toBeGreaterThanOrEqual(1)
    expect(enhancements[0].benefit).toBe('positive')
  })

  it('detects type degeneration (any) mutations', () => {
    const mutations = detectMutations('const x: any = {}', [])
    const degens = mutations.filter(m => m.type === 'degeneration')
    expect(degens.length).toBeGreaterThanOrEqual(1)
    expect(degens[0].benefit).toBe('negative')
  })

  it('detects ts-ignore reduction mutations', () => {
    const mutations = detectMutations('// @ts-ignore\nconst x = y', [])
    const reductions = mutations.filter(m => m.type === 'reduction')
    expect(reductions.length).toBeGreaterThanOrEqual(1)
    expect(reductions[0].benefit).toBe('negative')
  })

  it('detects ts-expect-error reduction mutations', () => {
    const mutations = detectMutations('// @ts-expect-error\nconst x = y', [])
    const reductions = mutations.filter(m => m.type === 'reduction')
    expect(reductions.length).toBeGreaterThanOrEqual(1)
  })

  it('detects multiple mutation types simultaneously', () => {
    const content = 'async function foo(): any { super.bar(); // @ts-ignore\n }'
    const mutations = detectMutations(content, [])
    const types = Array.from(new Set(mutations.map(m => m.type)))
    expect(types.length).toBeGreaterThanOrEqual(3)
  })

  it('sets file to empty string initially', () => {
    const mutations = detectMutations('async function foo() {}', [])
    expect(mutations.every(m => m.file === '')).toBe(true)
  })
})

// ─── traceLineages ──────────────────────────────────────────────────────────────

describe('traceLineages', () => {
  it('returns empty for no files', () => {
    expect(traceLineages([], [])).toEqual([])
  })

  it('traces extends lineage', () => {
    const files = ['parent.ts', 'child.ts']
    const contents = [
      'export class Parent {}',
      'export class Child extends Parent {}',
    ]
    const lineages = traceLineages(files, contents)
    expect(lineages.length).toBeGreaterThanOrEqual(1)
    const parentLineage = lineages.find(l => l.root === 'Parent')
    expect(parentLineage).toBeDefined()
    expect(parentLineage!.descendants).toContain('Child')
  })

  it('traces implements lineage', () => {
    const files = ['iface.ts', 'impl.ts']
    const contents = [
      'export interface IService {}',
      'export class Service implements IService {}',
    ]
    const lineages = traceLineages(files, contents)
    expect(lineages.length).toBeGreaterThanOrEqual(1)
    const ifaceLineage = lineages.find(l => l.root === 'IService')
    expect(ifaceLineage).toBeDefined()
    expect(ifaceLineage!.descendants).toContain('Service')
  })

  it('computes depth correctly for single level', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['class A {}', 'class B extends A {}']
    const lineages = traceLineages(files, contents)
    const lineageA = lineages.find(l => l.root === 'A')
    expect(lineageA!.depth).toBe(1)
  })

  it('computes breadth as direct children count', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = ['class A {}', 'class B extends A {}', 'class C extends A {}']
    const lineages = traceLineages(files, contents)
    const lineageA = lineages.find(l => l.root === 'A')
    expect(lineageA!.breadth).toBe(2)
  })

  it('handles multiple implements', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'export interface I1 {} export interface I2 {}',
      'export class X implements I1, I2 {}',
    ]
    const lineages = traceLineages(files, contents)
    const i1 = lineages.find(l => l.root === 'I1')
    const i2 = lineages.find(l => l.root === 'I2')
    expect(i1).toBeDefined()
    expect(i2).toBeDefined()
    expect(i1!.descendants).toContain('X')
    expect(i2!.descendants).toContain('X')
  })

  it('returns empty for files with no class declarations', () => {
    const files = ['a.ts']
    const contents = ['const x = 1']
    const lineages = traceLineages(files, contents)
    expect(lineages).toEqual([])
  })

  it('sets lineage health', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['class A {}', 'class B extends A {}']
    const lineages = traceLineages(files, contents)
    expect(lineages.length).toBeGreaterThan(0)
    expect(lineages[0].health).toBeDefined()
  })

  it('sets lineage diversity', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['class A {}', 'class B extends A {}']
    const lineages = traceLineages(files, contents)
    expect(typeof lineages[0].diversity).toBe('number')
  })

  it('handles empty content gracefully', () => {
    const lineages = traceLineages(['a.ts'], [''])
    expect(lineages).toEqual([])
  })
})

// ─── computeDiversity ───────────────────────────────────────────────────────────

describe('computeDiversity', () => {
  it('returns lineage diversity', () => {
    const lineage: Lineage = {
      root: 'A', descendants: ['B', 'C'], depth: 1, breadth: 2,
      totalTraits: 6, sharedTraits: 2, uniqueTraits: 4, health: 'healthy', diversity: 72,
    }
    expect(computeDiversity(lineage)).toBe(72)
  })
})

// ─── computeFitness ─────────────────────────────────────────────────────────────

describe('computeFitness', () => {
  it('returns 50 for empty pool', () => {
    const pool: GenePool = {
      file: 'a.ts', traits: [], dominantTraits: [], recessiveTraits: [], mutations: [], fitness: 50,
    }
    expect(computeFitness(pool, [])).toBe(50)
  })

  it('increases score for dominant traits', () => {
    const pool: GenePool = {
      file: 'a.ts', traits: [{ name: 'foo', type: 'method', origin: 'a.ts', carriers: ['a.ts'], isDominant: true, isMutated: false, expression: 'consistent' }],
      dominantTraits: ['foo'], recessiveTraits: [], mutations: [], fitness: 50,
    }
    const score = computeFitness(pool, pool.traits)
    expect(score).toBeGreaterThan(60)
  })

  it('increases score for positive mutations', () => {
    const pool: GenePool = {
      file: 'a.ts', traits: [{ name: 'foo', type: 'method', origin: 'a.ts', carriers: ['a.ts'], isDominant: true, isMutated: false, expression: 'consistent' }],
      dominantTraits: ['foo'], recessiveTraits: [],
      mutations: [{ trait: 'async', type: 'enhancement', from: 'sync', to: 'async', file: 'a.ts', benefit: 'positive' }],
      fitness: 50,
    }
    const score = computeFitness(pool, pool.traits)
    expect(score).toBeGreaterThan(70)
  })

  it('decreases score for negative mutations', () => {
    const poolNoNeg: GenePool = {
      file: 'a.ts', traits: [{ name: 'foo', type: 'method', origin: 'a.ts', carriers: ['a.ts'], isDominant: true, isMutated: false, expression: 'consistent' }],
      dominantTraits: ['foo'], recessiveTraits: [],
      mutations: [], fitness: 50,
    }
    const poolNeg: GenePool = {
      ...poolNoNeg,
      mutations: [{ trait: 'any', type: 'degeneration', from: 'typed', to: 'any', file: 'a.ts', benefit: 'negative' }],
    }
    expect(computeFitness(poolNeg, poolNeg.traits)).toBeLessThan(computeFitness(poolNoNeg, poolNoNeg.traits))
  })

  it('clamps score to 0-100', () => {
    const pool: GenePool = {
      file: 'a.ts', traits: [], dominantTraits: [], recessiveTraits: [],
      mutations: Array.from({ length: 10 }, () => ({ trait: 'x', type: 'degeneration' as const, from: 'a', to: 'b', file: 'a.ts', benefit: 'negative' as const })),
      fitness: 50,
    }
    const score = computeFitness(pool, [])
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── classifyLineageHealth ──────────────────────────────────────────────────────

describe('classifyLineageHealth', () => {
  it('returns thriving for shallow wide diverse lineages', () => {
    expect(classifyLineageHealth(2, 3, 60)).toBe('thriving')
  })

  it('returns thriving for depth<=3 breadth>=2 diversity>=50', () => {
    expect(classifyLineageHealth(3, 2, 50)).toBe('thriving')
  })

  it('returns healthy for moderate depth and diversity', () => {
    expect(classifyLineageHealth(4, 1, 50)).toBe('healthy')
  })

  it('returns stable for deeper lineages', () => {
    expect(classifyLineageHealth(5, 1, 30)).toBe('stable')
  })

  it('returns inbred for low diversity', () => {
    expect(classifyLineageHealth(3, 2, 10)).toBe('inbred')
  })

  it('returns stressed as default for edge cases', () => {
    expect(classifyLineageHealth(6, 1, 30)).toBe('stressed')
  })
})

// ─── classifyOverallHealth ──────────────────────────────────────────────────────

describe('classifyOverallHealth', () => {
  const makeStats = (overrides: Partial<HeredityStats> = {}): HeredityStats => ({
    totalTraits: 10, dominantTraits: 5, recessiveTraits: 5,
    totalMutations: 2, positiveMutations: 1, negativeMutations: 1,
    totalLineages: 3, thrivingLineages: 2, inbredLineages: 0,
    avgDiversity: 70, avgFitness: 70, maxLineageDepth: 2,
    traitCoverage: 70, mutationRate: 20, overallHealth: 'stable',
    ...overrides,
  })

  it('returns robust for high composite score', () => {
    const stats = makeStats({ avgDiversity: 90, avgFitness: 90, traitCoverage: 90, mutationRate: 5 })
    expect(classifyOverallHealth(stats)).toBe('robust')
  })

  it('returns healthy for moderate composite', () => {
    const stats = makeStats({ avgDiversity: 60, avgFitness: 60, traitCoverage: 60, mutationRate: 20 })
    expect(classifyOverallHealth(stats)).toBe('healthy')
  })

  it('returns stable for lower composite', () => {
    const stats = makeStats({ avgDiversity: 40, avgFitness: 40, traitCoverage: 40, mutationRate: 40 })
    expect(classifyOverallHealth(stats)).toBe('stable')
  })

  it('returns fragile for poor composite', () => {
    const stats = makeStats({ avgDiversity: 15, avgFitness: 15, traitCoverage: 15, mutationRate: 80 })
    expect(classifyOverallHealth(stats)).toBe('fragile')
  })

  it('returns degenerate for very poor composite', () => {
    const stats = makeStats({ avgDiversity: 0, avgFitness: 0, traitCoverage: 0, mutationRate: 100 })
    expect(classifyOverallHealth(stats)).toBe('degenerate')
  })
})

// ─── computeTraitCoverage ───────────────────────────────────────────────────────

describe('computeTraitCoverage', () => {
  it('returns 100 for single file', () => {
    expect(computeTraitCoverage([{ name: 'foo', carriers: ['a.ts'], type: 'method', origin: 'a.ts', isDominant: true, isMutated: false, expression: 'consistent' }], 1)).toBe(100)
  })

  it('returns 100 for empty traits', () => {
    expect(computeTraitCoverage([], 5)).toBe(100)
  })

  it('computes coverage from max carriers', () => {
    const traits: CodeTrait[] = [
      { name: 'foo', carriers: ['a.ts', 'b.ts', 'c.ts'], type: 'method', origin: 'a.ts', isDominant: true, isMutated: false, expression: 'consistent' },
    ]
    expect(computeTraitCoverage(traits, 5)).toBe(60)
  })

  it('returns 100 when total files is 0 (totalFiles <= 1 guard)', () => {
    const traits: CodeTrait[] = [
      { name: 'foo', carriers: ['a.ts'], type: 'method', origin: 'a.ts', isDominant: true, isMutated: false, expression: 'consistent' },
    ]
    expect(computeTraitCoverage(traits, 0)).toBe(100)
  })
})

// ─── computeMutationRate ────────────────────────────────────────────────────────

describe('computeMutationRate', () => {
  it('returns 0 when no traits', () => {
    expect(computeMutationRate(5, 0)).toBe(0)
  })

  it('computes rate as percentage', () => {
    expect(computeMutationRate(5, 20)).toBe(25)
  })

  it('handles rate > 100', () => {
    expect(computeMutationRate(30, 10)).toBe(300)
  })

  it('returns 0 for no mutations', () => {
    expect(computeMutationRate(0, 10)).toBe(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<HeredityStats> = {}): HeredityStats => ({
    totalTraits: 10, dominantTraits: 5, recessiveTraits: 5,
    totalMutations: 2, positiveMutations: 1, negativeMutations: 1,
    totalLineages: 3, thrivingLineages: 2, inbredLineages: 0,
    avgDiversity: 70, avgFitness: 70, maxLineageDepth: 2,
    traitCoverage: 70, mutationRate: 20, overallHealth: 'healthy',
    ...overrides,
  })

  it('recommends fixing inbred lineages', () => {
    const lineages: Lineage[] = [{ root: 'A', descendants: ['B'], depth: 5, breadth: 1, totalTraits: 3, sharedTraits: 3, uniqueTraits: 0, health: 'inbred', diversity: 5 }]
    const recs = generateRecommendations([], [], [], lineages, makeStats())
    expect(recs.some(r => r.includes('inbred'))).toBe(true)
  })

  it('recommends reviewing negative mutations', () => {
    const mutations: CodeMutation[] = [{ trait: 'x', type: 'degeneration', from: 'a', to: 'b', file: 'a.ts', benefit: 'negative' }]
    const recs = generateRecommendations([], [], mutations, [], makeStats())
    expect(recs.some(r => r.includes('negative'))).toBe(true)
  })

  it('recommends flattening deep inheritance', () => {
    const lineages: Lineage[] = [{ root: 'A', descendants: ['B'], depth: 6, breadth: 1, totalTraits: 3, sharedTraits: 1, uniqueTraits: 2, health: 'stressed', diversity: 50 }]
    const recs = generateRecommendations([], [], [], lineages, makeStats())
    expect(recs.some(r => r.includes('flattening') || r.includes('composition'))).toBe(true)
  })

  it('recommends introducing diversity when low', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ avgDiversity: 10 }))
    expect(recs.some(r => r.includes('diversity') || r.includes('diverse'))).toBe(true)
  })

  it('recommends reducing mutation rate when high', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ mutationRate: 80 }))
    expect(recs.some(r => r.includes('mutation rate') || r.includes('High mutation'))).toBe(true)
  })

  it('recommends establishing patterns for fragile health', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ overallHealth: 'fragile' }))
    expect(recs.some(r => r.includes('poor') || r.includes('patterns'))).toBe(true)
  })

  it('recommends establishing patterns for degenerate health', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ overallHealth: 'degenerate' }))
    expect(recs.some(r => r.includes('poor') || r.includes('patterns'))).toBe(true)
  })

  it('returns empty recommendations for healthy codebase', () => {
    const recs = generateRecommendations([], [], [], [], makeStats())
    expect(recs.length).toBe(0)
  })

  it('deduplicates recommendations', () => {
    const mutations: CodeMutation[] = [
      { trait: 'x', type: 'degeneration', from: 'a', to: 'b', file: 'a.ts', benefit: 'negative' },
      { trait: 'y', type: 'reduction', from: 'c', to: 'd', file: 'a.ts', benefit: 'negative' },
    ]
    const recs = generateRecommendations([], [], mutations, [], makeStats())
    const negRecs = recs.filter(r => r.includes('negative'))
    expect(negRecs.length).toBe(1)
  })
})

// ─── buildHeredityResult ────────────────────────────────────────────────────────

describe('buildHeredityResult', () => {
  const opts: HeredityOptions = {}

  it('returns empty result for no files', () => {
    const result = buildHeredityResult([], [], opts)
    expect(result.pools).toEqual([])
    expect(result.traits).toEqual([])
    expect(result.mutations).toEqual([])
    expect(result.lineages).toEqual([])
    expect(result.stats.totalTraits).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('returns empty result with degenerate health for no files', () => {
    const result = buildHeredityResult([], [], opts)
    expect(result.stats.overallHealth).toBe('degenerate')
  })

  it('builds pools for each file', () => {
    const result = buildHeredityResult(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', 'export function bar() {}'],
      opts,
    )
    expect(result.pools.length).toBe(2)
  })

  it('sets file on mutations', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['async function foo(): any { super.bar(); }'],
      opts,
    )
    expect(result.mutations.every(m => m.file === 'a.ts')).toBe(true)
  })

  it('merges duplicate trait names', () => {
    const result = buildHeredityResult(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', 'export function foo() {}'],
      opts,
    )
    const fooTraits = result.traits.filter(t => t.name === 'foo')
    expect(fooTraits.length).toBe(1)
    expect(fooTraits[0].carriers.length).toBe(2)
  })

  it('marks traits as dominant when appearing multiple times', () => {
    const result = buildHeredityResult(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', 'export function foo() {}'],
      opts,
    )
    const fooTrait = result.traits.find(t => t.name === 'foo')
    expect(fooTrait!.isDominant).toBe(true)
  })

  it('computes stats correctly', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['export function foo() {}'],
      opts,
    )
    expect(result.stats.totalTraits).toBeGreaterThan(0)
    expect(typeof result.stats.avgFitness).toBe('number')
    expect(typeof result.stats.traitCoverage).toBe('number')
  })

  it('traces lineages in result', () => {
    const result = buildHeredityResult(
      ['a.ts', 'b.ts'],
      ['class Parent {}', 'class Child extends Parent {}'],
      opts,
    )
    expect(result.lineages.length).toBeGreaterThanOrEqual(1)
  })

  it('classifies overall health', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['export function foo() {}'],
      opts,
    )
    expect(['robust', 'healthy', 'stable', 'fragile', 'degenerate']).toContain(result.stats.overallHealth)
  })

  it('generates recommendations', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['const x: any = 1'],
      opts,
    )
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles empty content files', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      [''],
      opts,
    )
    expect(result.pools.length).toBe(1)
    expect(result.pools[0].traits.length).toBe(0)
  })

  it('computes avgDiversity as 100 when no lineages', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['const x = 1'],
      opts,
    )
    expect(result.stats.avgDiversity).toBe(100)
  })

  it('computes maxLineageDepth as 0 when no lineages', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['const x = 1'],
      opts,
    )
    expect(result.stats.maxLineageDepth).toBe(0)
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────────

describe('format helpers', () => {
  const makeResult = (): HeredityResult => buildHeredityResult(
    ['a.ts', 'b.ts'],
    ['export function foo() {}', 'export function foo() {}'],
    {},
  )

  describe('formatTraits', () => {
    it('handles empty traits', () => {
      expect(formatTraits([])).toContain('No traits detected')
    })

    it('shows trait names', () => {
      const result = makeResult()
      const output = formatTraits(result.traits)
      expect(output).toContain('foo')
    })

    it('shows header', () => {
      expect(formatTraits([])).toContain('Code Traits')
    })
  })

  describe('formatMutations', () => {
    it('handles empty mutations', () => {
      expect(formatMutations([])).toContain('No mutations detected')
    })

    it('shows mutation details', () => {
      const mutations: CodeMutation[] = [
        { trait: 'async', type: 'enhancement', from: 'sync', to: 'async', file: 'a.ts', benefit: 'positive' },
      ]
      const output = formatMutations(mutations)
      expect(output).toContain('enhancement')
      expect(output).toContain('async')
    })

    it('shows header', () => {
      expect(formatMutations([])).toContain('Code Mutations')
    })
  })

  describe('formatLineages', () => {
    it('handles empty lineages', () => {
      expect(formatLineages([])).toContain('No inheritance chains')
    })

    it('shows lineage details', () => {
      const lineages: Lineage[] = [{
        root: 'Parent', descendants: ['Child'], depth: 1, breadth: 1,
        totalTraits: 3, sharedTraits: 1, uniqueTraits: 2, health: 'thriving', diversity: 80,
      }]
      const output = formatLineages(lineages)
      expect(output).toContain('Parent')
      expect(output).toContain('Child')
    })

    it('shows header', () => {
      expect(formatLineages([])).toContain('Inheritance Lineages')
    })
  })

  describe('formatPools', () => {
    it('handles empty pools', () => {
      expect(formatPools([])).toContain('No files analyzed')
    })

    it('shows pool details', () => {
      const result = makeResult()
      const output = formatPools(result.pools)
      expect(output).toContain('a.ts')
      expect(output).toContain('fitness')
    })

    it('shows header', () => {
      expect(formatPools([])).toContain('Gene Pools')
    })
  })

  describe('formatHeredityStats', () => {
    it('shows stats summary', () => {
      const result = makeResult()
      const output = formatHeredityStats(result.stats)
      expect(output).toContain('Heredity Analysis')
      expect(output).toContain('Traits:')
      expect(output).toContain('Diversity:')
    })
  })

  describe('formatRecommendations', () => {
    it('handles empty recommendations', () => {
      expect(formatRecommendations([])).toContain('Healthy heredity')
    })

    it('shows numbered recommendations', () => {
      const output = formatRecommendations(['Fix X', 'Fix Y'])
      expect(output).toContain('1. Fix X')
      expect(output).toContain('2. Fix Y')
    })
  })

  describe('formatDiversityGauge', () => {
    it('returns a gauge string', () => {
      const gauge = formatDiversityGauge(75)
      expect(gauge).toContain('\u2588')
      expect(gauge).toContain('75')
    })

    it('respects width parameter', () => {
      const gauge = formatDiversityGauge(50, 10)
      expect(gauge).toBeDefined()
      expect(typeof gauge).toBe('string')
    })
  })

  describe('formatLineageHealthLabel', () => {
    it('returns colored label for each health level', () => {
      const levels: Array<import('../src/commands/heredity-helpers.js').LineageHealth> = ['thriving', 'healthy', 'stable', 'stressed', 'inbred']
      for (const level of levels) {
        const label = formatLineageHealthLabel(level)
        expect(label).toContain(level)
      }
    })
  })

  describe('formatOverallHealthLabel', () => {
    it('returns colored label for each overall level', () => {
      const levels: OverallHealth[] = ['robust', 'healthy', 'stable', 'fragile', 'degenerate']
      for (const level of levels) {
        const label = formatOverallHealthLabel(level)
        expect(label).toContain(level)
      }
    })
  })

  describe('formatHeredityTable', () => {
    it('produces full table output', () => {
      const result = makeResult()
      const output = formatHeredityTable(result)
      expect(output).toContain('Heredity Analysis')
      expect(output).toContain('Gene Pools')
      expect(output).toContain('Recommendations')
    })
  })

  describe('formatHeredityJson', () => {
    it('produces valid JSON', () => {
      const result = makeResult()
      const json = formatHeredityJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.pools).toBeDefined()
      expect(parsed.stats).toBeDefined()
    })
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('heredity integration', () => {
  it('full analysis with inheritance and mutations', () => {
    const result = buildHeredityResult(
      ['base.ts', 'child.ts'],
      [
        'export class BaseService {\n  public name: string;\n  getData(): string { return ""; }\n  process(): void {}\n}',
        'import { BaseService } from "./base";\nexport class ChildService extends BaseService {\n  // override\n  getData(): string { return "child"; }\n  async fetchData(): Promise<string> { return ""; }\n}',
      ],
      {},
    )
    expect(result.pools.length).toBe(2)
    expect(result.stats.totalTraits).toBeGreaterThan(0)
    expect(result.lineages.length).toBeGreaterThanOrEqual(1)
  })

  it('handles multiple inheritance chains', () => {
    const result = buildHeredityResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'export class Base {}',
        'export class Mid extends Base {}',
        'export class Leaf extends Mid {}',
      ],
      {},
    )
    expect(result.lineages.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.maxLineageDepth).toBeGreaterThanOrEqual(2)
  })

  it('handles degenerate codebase', () => {
    const result = buildHeredityResult(
      ['a.ts'],
      ['const x: any = 1; // @ts-ignore\nconst y = z;'],
      {},
    )
    expect(result.mutations.length).toBeGreaterThan(0)
    expect(result.stats.overallHealth).toBeDefined()
  })
})
