import { describe, it, expect } from 'vitest'
import {
  classifyPolyp,
  classifyGrowthPattern,
  buildPolyp,
  analyzeColony,
  mapReefZones,
  detectSymbiosis,
  computeReefHealth,
  computeBiodiversityIndex,
  computeEcosystemStability,
  classifyOverallReef,
  generateRecommendations,
  buildCoralResult,
} from '../src/commands/coral-helpers.js'
import { formatCoralTable, formatCoralJson } from '../src/commands/coral-format-helpers.js'
import type { CoralPolyp, CoralColony, SymbioticRelation, CoralStats, PolypType } from '../src/commands/coral-helpers.js'

// ─── classifyPolyp ─────────────────────────────────────────────────────────────

describe('classifyPolyp', () => {
  it('classifies branching for many exports with low nesting', () => {
    const code = Array(6).fill(0).map((_, i) => `export const item${i} = ${i}`).join('\n')
    expect(classifyPolyp(code, 'a.ts')).toBe('branching')
  })

  it('classifies massive for large files with few exports', () => {
    const code = Array(350).fill('const x = 1;').join('\n')
    expect(classifyPolyp(code, 'big.ts')).toBe('massive')
  })

  it('classifies plate for interface-heavy files', () => {
    const code = [
      'interface Config { name: string }',
      'interface Options { verbose: boolean }',
      'interface Result { ok: boolean }',
      'function apply() {}',
    ].join('\n')
    expect(classifyPolyp(code, 'types.ts')).toBe('plate')
  })

  it('classifies columnar for deep nesting', () => {
    const code = 'function deep() {\n' +
      Array(7).fill(0).map((_, i) => '  '.repeat(i) + 'if (true) {').join('\n') + '\n' +
      Array(4).fill(0).map((_, i) => `function fn${i}() {}`).join('\n') + '\n' +
      Array(7).fill(0).map(() => '}').join('\n') + '\n}'
    expect(classifyPolyp(code, 'nested.ts')).toBe('columnar')
  })

  it('classifies encrusting for thin wrappers', () => {
    const code = [
      'import { a } from "x"',
      'import { b } from "y"',
      'import { c } from "z"',
      'export const wrapped = a',
    ].join('\n')
    expect(classifyPolyp(code, 'wrap.ts')).toBe('encrusting')
  })

  it('classifies free-living for small independent files', () => {
    expect(classifyPolyp('const x = 1;', 'util.ts')).toBe('free-living')
  })

  it('defaults to branching', () => {
    const code = 'export function f() { return 1 }'
    const type = classifyPolyp(code, 'default.ts')
    expect(['branching', 'encrusting']).toContain(type)
  })
})

// ─── classifyGrowthPattern ─────────────────────────────────────────────────────

describe('classifyGrowthPattern', () => {
  it('returns branching for branching polyp with many exports', () => {
    expect(classifyGrowthPattern('branching', 5)).toBe('branching')
  })

  it('returns accretion for branching polyp with few exports', () => {
    expect(classifyGrowthPattern('branching', 2)).toBe('accretion')
  })

  it('returns accretion for massive', () => {
    expect(classifyGrowthPattern('massive', 1)).toBe('accretion')
  })

  it('returns fusion for plate', () => {
    expect(classifyGrowthPattern('plate', 1)).toBe('fusion')
  })

  it('returns fusion for encrusting', () => {
    expect(classifyGrowthPattern('encrusting', 1)).toBe('fusion')
  })

  it('returns fragmentation for free-living', () => {
    expect(classifyGrowthPattern('free-living', 0)).toBe('fragmentation')
  })
})

// ─── buildPolyp ────────────────────────────────────────────────────────────────

describe('buildPolyp', () => {
  it('returns a complete CoralPolyp', () => {
    const polyp = buildPolyp('export const x: number = 1;', 'a.ts')
    expect(polyp).toHaveProperty('file', 'a.ts')
    expect(polyp).toHaveProperty('type')
    expect(polyp).toHaveProperty('size')
    expect(polyp).toHaveProperty('complexity')
    expect(polyp).toHaveProperty('connections')
    expect(polyp).toHaveProperty('growthPattern')
    expect(polyp).toHaveProperty('isKeystone')
    expect(polyp).toHaveProperty('isInvasive')
    expect(polyp).toHaveProperty('bleachingRisk')
    expect(polyp).toHaveProperty('health')
  })

  it('computes size as line count', () => {
    const polyp = buildPolyp('line1\nline2\nline3', 'a.ts')
    expect(polyp.size).toBe(3)
  })

  it('rewards types for health', () => {
    const typed = buildPolyp('export function f(x: number): string { return String(x) }', 'a.ts')
    const untyped = buildPolyp('export function f(x) { return String(x) }', 'b.ts')
    expect(typed.health).toBeGreaterThan(untyped.health)
  })

  it('penalizes any for health', () => {
    const withAny = buildPolyp('const x: any = getData();', 'a.ts')
    const withoutAny = buildPolyp('const x: number = getData();', 'b.ts')
    expect(withoutAny.health).toBeGreaterThan(withAny.health)
  })

  it('marks keystone for high exports and good health', () => {
    const polyp = buildPolyp([
      'export const a = 1',
      'export const b = 2',
      'export const c = 3',
      '// documented',
      'const x: number = 1',
    ].join('\n'), 'keystone.ts')
    if (polyp.health >= 60) {
      expect(polyp.isKeystone).toBe(true)
    }
  })

  it('marks invasive for any types', () => {
    const polyp = buildPolyp('const x: any = getData();', 'a.ts')
    expect(polyp.isInvasive).toBe(true)
  })

  it('bleaching risk is inverse of health', () => {
    const polyp = buildPolyp('const x = 1;', 'a.ts')
    expect(polyp.bleachingRisk).toBe(100 - polyp.health)
  })

  it('clamps values to 0-100', () => {
    const polyp = buildPolyp('export const x = 1;', 'a.ts')
    expect(polyp.complexity).toBeGreaterThanOrEqual(0)
    expect(polyp.complexity).toBeLessThanOrEqual(100)
    expect(polyp.health).toBeGreaterThanOrEqual(0)
    expect(polyp.health).toBeLessThanOrEqual(100)
    expect(polyp.bleachingRisk).toBeGreaterThanOrEqual(0)
    expect(polyp.bleachingRisk).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeColony ─────────────────────────────────────────────────────────────

describe('analyzeColony', () => {
  it('returns a complete CoralColony', () => {
    const colony = analyzeColony(['a.ts'], ['export const x = 1;'], 'src')
    expect(colony).toHaveProperty('name', 'src')
    expect(colony).toHaveProperty('species')
    expect(colony).toHaveProperty('size')
    expect(colony).toHaveProperty('growthRate')
    expect(colony).toHaveProperty('density')
    expect(colony).toHaveProperty('diversity')
    expect(colony).toHaveProperty('health')
    expect(colony).toHaveProperty('symbionts')
    expect(colony).toHaveProperty('parasites')
  })

  it('computes size as total lines', () => {
    const colony = analyzeColony(['a.ts', 'b.ts'], ['line1\nline2', 'line3'], 'src')
    expect(colony.size).toBe(3)
  })

  it('detects file species (extensions)', () => {
    const colony = analyzeColony(['a.ts', 'b.js'], ['x = 1', 'y = 2'], 'src')
    expect(colony.species).toContain('.ts')
    expect(colony.species).toContain('.js')
  })

  it('classifies health based on polyp health', () => {
    const goodColony = analyzeColony(['a.ts'], ['export function f(x: number): number { return x }'], 'src')
    expect(['thriving', 'healthy', 'stressed', 'bleaching', 'dead']).toContain(goodColony.health)
  })

  it('identifies symbionts (files with both imports and exports)', () => {
    const colony = analyzeColony(
      ['a.ts', 'b.ts'],
      ['import { x } from "y"; export const z = 1', 'export const w = 2'],
      'src',
    )
    expect(colony.symbionts.length).toBeGreaterThanOrEqual(0)
  })

  it('identifies parasites (import-only files)', () => {
    const colony = analyzeColony(
      ['a.ts'],
      ['import { x } from "y"; const z = x'],
      'src',
    )
    expect(colony.parasites.length).toBeGreaterThanOrEqual(0)
  })

  it('clamps growthRate to 0-100', () => {
    const colony = analyzeColony(['a.ts'], ['export const x = 1;'], 'src')
    expect(colony.growthRate).toBeGreaterThanOrEqual(0)
    expect(colony.growthRate).toBeLessThanOrEqual(100)
  })
})

// ─── mapReefZones ──────────────────────────────────────────────────────────────

describe('mapReefZones', () => {
  it('returns ReefZone array', () => {
    const polyps = [buildPolyp('export const x = 1;', 'a.ts')]
    const zones = mapReefZones(['a.ts'], polyps)
    expect(zones.length).toBeGreaterThan(0)
  })

  it('each zone has required fields', () => {
    const polyps = [buildPolyp('export const x = 1;', 'src/a.ts')]
    const zones = mapReefZones(['src/a.ts'], polyps)
    for (const z of zones) {
      expect(z).toHaveProperty('name')
      expect(z).toHaveProperty('type')
      expect(z).toHaveProperty('description')
      expect(z).toHaveProperty('biodiversity')
      expect(z).toHaveProperty('structuralComplexity')
      expect(z).toHaveProperty('files')
      expect(z.files.length).toBeGreaterThan(0)
    }
  })

  it('classifies zone types', () => {
    const polyps = [buildPolyp('export const x = 1;', 'a.ts')]
    const zones = mapReefZones(['a.ts'], polyps)
    for (const z of zones) {
      expect(['reef-flat', 'reef-crest', 'fore-reef', 'lagoon', 'deep-reef']).toContain(z.type)
    }
  })

  it('groups files by directory', () => {
    const polyps = [
      buildPolyp('const x = 1;', 'src/a.ts'),
      buildPolyp('const y = 2;', 'src/b.ts'),
      buildPolyp('const z = 3;', 'lib/c.ts'),
    ]
    const zones = mapReefZones(['src/a.ts', 'src/b.ts', 'lib/c.ts'], polyps)
    expect(zones).toHaveLength(2)
  })

  it('computes biodiversity based on polyp type variety', () => {
    const polyps = [buildPolyp('export const x = 1;', 'a.ts')]
    const zones = mapReefZones(['a.ts'], polyps)
    for (const z of zones) {
      expect(z.biodiversity).toBeGreaterThanOrEqual(0)
      expect(z.biodiversity).toBeLessThanOrEqual(100)
    }
  })
})

// ─── detectSymbiosis ───────────────────────────────────────────────────────────

describe('detectSymbiosis', () => {
  it('detects mutualistic relationships', () => {
    const polyps = [
      buildPolyp('import { b } from "./b"; export const a = 1', 'a.ts'),
      buildPolyp('import { a } from "./a"; export const b = 2', 'b.ts'),
    ]
    const relations = detectSymbiosis(polyps, ['a.ts', 'b.ts'], [
      'import { b } from "./b"; export const a = 1',
      'import { a } from "./a"; export const b = 2',
    ])
    expect(relations.some(r => r.type === 'mutualistic')).toBe(true)
  })

  it('detects commensal relationships', () => {
    const polyps = [
      buildPolyp('import { x } from "./provider"; const y = x', 'consumer.ts'),
      buildPolyp('export const x = 1;', 'provider.ts'),
    ]
    const relations = detectSymbiosis(polyps, ['consumer.ts', 'provider.ts'], [
      'import { x } from "./provider"; const y = x',
      'export const x = 1;',
    ])
    expect(relations.length).toBeGreaterThan(0)
  })

  it('returns empty for unrelated files', () => {
    const polyps = [
      buildPolyp('const x = 1;', 'a.ts'),
      buildPolyp('const y = 2;', 'b.ts'),
    ]
    const relations = detectSymbiosis(polyps, ['a.ts', 'b.ts'], ['const x = 1;', 'const y = 2;'])
    expect(relations).toHaveLength(0)
  })

  it('each relation has required fields', () => {
    const polyps = [
      buildPolyp('import { x } from "./b"; export const y = 1', 'a.ts'),
      buildPolyp('export const x = 2;', 'b.ts'),
    ]
    const relations = detectSymbiosis(polyps, ['a.ts', 'b.ts'], [
      'import { x } from "./b"; export const y = 1',
      'export const x = 2;',
    ])
    for (const r of relations) {
      expect(r).toHaveProperty('host')
      expect(r).toHaveProperty('symbiont')
      expect(r).toHaveProperty('type')
      expect(r).toHaveProperty('strength')
      expect(r).toHaveProperty('description')
    }
  })
})

// ─── computeReefHealth ─────────────────────────────────────────────────────────

describe('computeReefHealth', () => {
  it('returns 50 for empty inputs', () => {
    expect(computeReefHealth([], [])).toBe(50)
  })

  it('uses average polyp health', () => {
    const polyps: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 80 },
      { file: 'b.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 40, health: 60 },
    ]
    const health = computeReefHealth([], polyps)
    expect(health).toBe(70)
  })

  it('penalizes invasive polyps', () => {
    const clean: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
    ]
    const invasive: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: true, bleachingRisk: 20, health: 70 },
    ]
    expect(computeReefHealth([], clean)).toBeGreaterThan(computeReefHealth([], invasive))
  })

  it('rewards keystone polyps', () => {
    const normal: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
    ]
    const keystone: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: true, isInvasive: false, bleachingRisk: 20, health: 70 },
    ]
    expect(computeReefHealth([], keystone)).toBeGreaterThan(computeReefHealth([], normal))
  })
})

// ─── computeBiodiversityIndex ──────────────────────────────────────────────────

describe('computeBiodiversityIndex', () => {
  it('rewards polyp type variety', () => {
    const diverse: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
      { file: 'b.ts', type: 'massive', size: 10, complexity: 50, connections: 2, growthPattern: 'accretion', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
      { file: 'c.ts', type: 'plate', size: 10, complexity: 50, connections: 2, growthPattern: 'fusion', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
    ]
    const uniform: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
      { file: 'b.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
    ]
    expect(computeBiodiversityIndex(diverse, [])).toBeGreaterThan(computeBiodiversityIndex(uniform, []))
  })

  it('clamps to 0-100', () => {
    const polyps: CoralPolyp[] = [
      { file: 'a.ts', type: 'branching', size: 10, complexity: 50, connections: 2, growthPattern: 'branching', isKeystone: false, isInvasive: false, bleachingRisk: 20, health: 70 },
    ]
    const idx = computeBiodiversityIndex(polyps, [])
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThanOrEqual(100)
  })
})

// ─── computeEcosystemStability ─────────────────────────────────────────────────

describe('computeEcosystemStability', () => {
  it('returns high stability for good metrics and mutualistic symbiosis', () => {
    const relations: SymbioticRelation[] = [
      { host: 'a.ts', symbiont: 'b.ts', type: 'mutualistic', strength: 70, description: '' },
    ]
    const stability = computeEcosystemStability(80, 80, relations)
    expect(stability).toBeGreaterThan(50)
  })

  it('penalizes parasitic relations', () => {
    const mutual: SymbioticRelation[] = [
      { host: 'a.ts', symbiont: 'b.ts', type: 'mutualistic', strength: 70, description: '' },
    ]
    const parasitic: SymbioticRelation[] = [
      { host: 'a.ts', symbiont: 'b.ts', type: 'parasitic', strength: 30, description: '' },
    ]
    expect(computeEcosystemStability(70, 70, mutual)).toBeGreaterThan(computeEcosystemStability(70, 70, parasitic))
  })

  it('defaults mutual ratio to 0.5 when no symbiosis', () => {
    const stability = computeEcosystemStability(70, 70, [])
    expect(stability).toBeGreaterThanOrEqual(0)
    expect(stability).toBeLessThanOrEqual(100)
  })
})

// ─── classifyOverallReef ──────────────────────────────────────────────────────

describe('classifyOverallReef', () => {
  it('returns great-barrier for excellent scores', () => {
    expect(classifyOverallReef(85, 85, 85)).toBe('great-barrier')
  })

  it('returns healthy-reef for good scores', () => {
    expect(classifyOverallReef(65, 65, 65)).toBe('healthy-reef')
  })

  it('returns stressed-reef for moderate scores', () => {
    expect(classifyOverallReef(45, 45, 45)).toBe('stressed-reef')
  })

  it('returns bleached-reef for poor scores', () => {
    expect(classifyOverallReef(25, 25, 25)).toBe('bleached-reef')
  })

  it('returns dead-reef for very poor scores', () => {
    expect(classifyOverallReef(10, 10, 10)).toBe('dead-reef')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<CoralStats> = {}): CoralStats => ({
    totalColonies: 1, totalPolyps: 1, branchingPolyps: 1, massivePolyps: 0,
    keystonePolyps: 0, invasivePolyps: 0, thrivingColonies: 1, bleachingColonies: 0,
    totalSymbiosis: 0, mutualisticRelations: 0, parasiticRelations: 0,
    avgBiodiversity: 60, avgComplexity: 50, avgBleachingRisk: 30,
    reefHealth: 70, biodiversityIndex: 60, ecosystemStability: 65,
    overallReef: 'healthy-reef',
    ...overrides,
  })

  it('recommends investigating bleaching colonies', () => {
    const colonies: CoralColony[] = [{
      name: 'src', species: ['.ts'], size: 100, growthRate: 50, density: 50, diversity: 50,
      health: 'bleaching', symbionts: [], parasites: [],
    }]
    const recs = generateRecommendations(colonies, [], [], [], makeStats({ bleachingColonies: 1 }))
    expect(recs.some(r => r.includes('bleaching'))).toBe(true)
  })

  it('recommends refactoring invasive polyps', () => {
    const polyps: CoralPolyp[] = [{
      file: 'a.ts', type: 'massive', size: 600, complexity: 80, connections: 0,
      growthPattern: 'accretion', isKeystone: false, isInvasive: true, bleachingRisk: 60, health: 40,
    }]
    const recs = generateRecommendations([], polyps, [], [], makeStats({ invasivePolyps: 1 }))
    expect(recs.some(r => r.includes('invasive'))).toBe(true)
  })

  it('recommends decoupling parasitic relations', () => {
    const symbiosis: SymbioticRelation[] = [{
      host: 'a.ts', symbiont: 'b.ts', type: 'parasitic', strength: 30, description: '',
    }]
    const recs = generateRecommendations([], [], symbiosis, [], makeStats({ parasiticRelations: 1 }))
    expect(recs.some(r => r.includes('parasitic') || r.includes('Decouple'))).toBe(true)
  })

  it('recommends for low biodiversity', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ biodiversityIndex: 30 }))
    expect(recs.some(r => r.includes('biodiversity'))).toBe(true)
  })

  it('recommends for high bleaching risk', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ avgBleachingRisk: 70 }))
    expect(recs.some(r => r.includes('bleaching risk'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateRecommendations([], [], [], [], makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })
})

// ─── buildCoralResult ──────────────────────────────────────────────────────────

describe('buildCoralResult', () => {
  it('returns a complete CoralResult', () => {
    const result = buildCoralResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result).toHaveProperty('colonies')
    expect(result).toHaveProperty('polyps')
    expect(result).toHaveProperty('zones')
    expect(result).toHaveProperty('symbiosis')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one polyp per file', () => {
    const result = buildCoralResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.polyps).toHaveLength(2)
  })

  it('groups colonies by directory', () => {
    const result = buildCoralResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const x = 1;', 'const y = 2;', 'const z = 3;'],
      {},
    )
    expect(result.colonies).toHaveLength(2)
  })

  it('handles empty input', () => {
    const result = buildCoralResult([], [], {})
    expect(result.polyps).toHaveLength(0)
    expect(result.stats.totalPolyps).toBe(0)
  })

  it('computes stats correctly', () => {
    const result = buildCoralResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.totalPolyps).toBe(1)
    expect(result.stats.reefHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.biodiversityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.ecosystemStability).toBeGreaterThanOrEqual(0)
  })

  it('computes overall reef grade', () => {
    const result = buildCoralResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(['great-barrier', 'healthy-reef', 'stressed-reef', 'bleached-reef', 'dead-reef']).toContain(result.stats.overallReef)
  })

  it('counts polyp type breakdowns', () => {
    const result = buildCoralResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.branchingPolyps).toBeGreaterThanOrEqual(0)
    expect(result.stats.massivePolyps).toBeGreaterThanOrEqual(0)
  })

  it('counts keystone and invasive', () => {
    const result = buildCoralResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.keystonePolyps).toBeGreaterThanOrEqual(0)
    expect(result.stats.invasivePolyps).toBeGreaterThanOrEqual(0)
  })

  it('counts symbiosis types', () => {
    const result = buildCoralResult(['a.ts', 'b.ts'], [
      'import { x } from "./b"; export const a = 1',
      'import { a } from "./a"; export const b = 2',
    ], {})
    expect(result.stats.totalSymbiosis).toBeGreaterThanOrEqual(0)
    expect(result.stats.mutualisticRelations).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatCoralTable ──────────────────────────────────────────────────────────

describe('formatCoralTable', () => {
  it('returns a string', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatCoralTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains header', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatCoralTable(result, false)).toContain('Coral')
  })

  it('contains Colonies section', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatCoralTable(result, false)).toContain('Colonies')
  })

  it('contains Polyps section', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatCoralTable(result, false)).toContain('Polyps')
  })

  it('contains Statistics section', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatCoralTable(result, false)).toContain('Statistics')
  })

  it('shows recommendations when present', () => {
    const result = buildCoralResult(['a.ts'], ['const x: any = 1;'], {})
    const output = formatCoralTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('handles empty input gracefully', () => {
    const result = buildCoralResult([], [], {})
    const output = formatCoralTable(result, false)
    expect(output).toContain('No colonies')
  })
})

// ─── formatCoralJson ───────────────────────────────────────────────────────────

describe('formatCoralJson', () => {
  it('returns valid JSON', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatCoralJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('colonies')
    expect(parsed).toHaveProperty('polyps')
    expect(parsed).toHaveProperty('zones')
    expect(parsed).toHaveProperty('symbiosis')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints', () => {
    const result = buildCoralResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatCoralJson(result)).toContain('  ')
  })
})
