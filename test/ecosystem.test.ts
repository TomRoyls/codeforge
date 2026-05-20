import { describe, expect, it } from 'vitest'

import {
  buildEcosystemResult,
  buildFoodWeb,
  buildHabitat,
  buildOrganism,
  classifyHabitatCondition,
  classifySpecies,
  computeBiodiversity,
  computeEcosystemStability,
  computeFitness,
  computeFoodChainLength,
  computeHabitatStability,
  computePopulation,
  computeSpeciesDiversity,
  computeTrophicEfficiency,
  determineRole,
  extractExports,
  extractImports,
  generateRecommendations,
  getHabitat,
  groupIntoHabitats,
  identifyKeystones,
  isEndangered,
  type EcosystemStats,
  type FoodWeb,
  type Habitat,
  type KeystoneSpecies,
  type Organism,
} from '../src/commands/ecosystem-helpers.js'

import {
  formatEcosystemJSON,
  formatEcosystemTable,
  formatFoodWeb,
  formatHabitatMap,
  formatKeystones,
  formatOrganismTable,
  formatRecommendations,
  formatEcosystemStats,
} from '../src/commands/ecosystem-format-helpers.js'

// ─── extractImports ─────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts ES module imports', () => {
    const imports = extractImports('import { foo } from "./bar"')
    expect(imports).toContain('./bar')
  })

  it('extracts default imports', () => {
    const imports = extractImports('import foo from "./bar"')
    expect(imports).toContain('./bar')
  })

  it('extracts side-effect imports', () => {
    const imports = extractImports('import "./setup"')
    expect(imports).toContain('./setup')
  })

  it('extracts require calls', () => {
    const imports = extractImports('const x = require("./mod")')
    expect(imports).toContain('./mod')
  })

  it('deduplicates imports', () => {
    const imports = extractImports('import { a } from "./x"\nimport { b } from "./x"')
    expect(imports.filter((i) => i === './x')).toHaveLength(1)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── extractExports ─────────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts named function exports', () => {
    expect(extractExports('export function foo() {}')).toContain('foo')
  })

  it('extracts named const exports', () => {
    expect(extractExports('export const x = 1')).toContain('x')
  })

  it('extracts class exports', () => {
    expect(extractExports('export class Foo {}')).toContain('Foo')
  })

  it('extracts interface exports', () => {
    expect(extractExports('export interface Foo {}')).toContain('Foo')
  })

  it('extracts type exports', () => {
    expect(extractExports('export type Foo = string')).toContain('Foo')
  })

  it('extracts destructured exports', () => {
    const exports = extractExports('export { foo, bar }')
    expect(exports).toContain('foo')
    expect(exports).toContain('bar')
  })

  it('returns empty for no exports', () => {
    expect(extractExports('const x = 1')).toEqual([])
  })
})

// ─── getHabitat ─────────────────────────────────────────────────────────────────

describe('getHabitat', () => {
  it('extracts directory from path', () => {
    expect(getHabitat('src/commands/foo.ts')).toBe('src/commands')
  })

  it('returns dot for no directory', () => {
    expect(getHabitat('foo.ts')).toBe('.')
  })

  it('handles nested paths', () => {
    expect(getHabitat('a/b/c/d.ts')).toBe('a/b/c')
  })
})

// ─── classifySpecies ────────────────────────────────────────────────────────────

describe('classifySpecies', () => {
  it('classifies producers (no imports, has exports)', () => {
    expect(classifySpecies('mod.ts', [], ['foo'], [], false)).toBe('producer')
  })

  it('classifies apex (imports but not imported)', () => {
    expect(classifySpecies('main.ts', ['./a'], ['main'], [], false)).toBe('apex')
  })

  it('classifies decomposer (test files)', () => {
    expect(classifySpecies('mod.test.ts', ['./mod'], [], [], true)).toBe('decomposer')
  })

  it('classifies parasite (imports but no exports, and consumed)', () => {
    expect(classifySpecies('script.ts', ['./a'], [], ['./other'], false)).toBe('parasite')
  })

  it('classifies primary consumer (imports, exports, imported)', () => {
    expect(classifySpecies('mid.ts', ['./a'], ['x'], ['./main'], false)).toBe('primary-consumer')
  })

  it('prioritizes decomposer for test files regardless of imports', () => {
    expect(classifySpecies('mod.test.ts', [], ['foo'], [], true)).toBe('decomposer')
  })
})

// ─── determineRole ──────────────────────────────────────────────────────────────

describe('determineRole', () => {
  it('describes producers', () => {
    expect(determineRole('producer', 50, 0)).toContain('Foundation')
  })

  it('describes apex', () => {
    expect(determineRole('apex', 50, 0)).toContain('Entry point')
  })

  it('describes decomposer', () => {
    expect(determineRole('decomposer', 50, 0)).toContain('Test utility')
  })

  it('describes parasite', () => {
    expect(determineRole('parasite', 50, 0)).toContain('no exports')
  })

  it('describes key intermediary', () => {
    expect(determineRole('primary-consumer', 50, 10)).toContain('intermediary')
  })

  it('describes high-quality intermediary', () => {
    expect(determineRole('primary-consumer', 80, 1)).toContain('High-quality')
  })
})

// ─── computeFitness ─────────────────────────────────────────────────────────────

describe('computeFitness', () => {
  it('returns 0 for empty content', () => {
    expect(computeFitness('')).toBe(0)
  })

  it('returns 0 for blank-only content', () => {
    expect(computeFitness('   \n  \n  ')).toBe(0)
  })

  it('gives base score for plain code', () => {
    const score = computeFitness('const x = 1')
    expect(score).toBeGreaterThan(0)
  })

  it('rewards exports', () => {
    const withExport = computeFitness('export const x = 1')
    const without = computeFitness('const x = 1')
    expect(withExport).toBeGreaterThan(without)
  })

  it('rewards types', () => {
    const withTypes = computeFitness('interface Foo { x: number }')
    const without = computeFitness('const x = 1')
    expect(withTypes).toBeGreaterThan(without)
  })

  it('penalizes any', () => {
    const withAny = computeFitness('const x: any = 1')
    const without = computeFitness('const x = 1')
    expect(withAny).toBeLessThan(without)
  })

  it('caps at 100', () => {
    const score = computeFitness('export interface Foo { x: number }\n/** docs */\nexport function bar() { try { return 1 } catch { return 0 } }')
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── computePopulation ──────────────────────────────────────────────────────────

describe('computePopulation', () => {
  it('counts dependents', () => {
    expect(computePopulation(['a.ts', 'b.ts', 'c.ts'])).toBe(3)
  })

  it('returns 0 for no dependents', () => {
    expect(computePopulation([])).toBe(0)
  })
})

// ─── isEndangered ───────────────────────────────────────────────────────────────

describe('isEndangered', () => {
  it('endangered when low fitness and high population', () => {
    expect(isEndangered({ fitness: 30, population: 5, species: 'producer' })).toBe(true)
  })

  it('not endangered when high fitness', () => {
    expect(isEndangered({ fitness: 80, population: 10, species: 'producer' })).toBe(false)
  })

  it('not endangered when low population', () => {
    expect(isEndangered({ fitness: 30, population: 1, species: 'producer' })).toBe(false)
  })

  it('not endangered at fitness boundary 40', () => {
    expect(isEndangered({ fitness: 40, population: 5, species: 'producer' })).toBe(false)
  })

  it('not endangered at population boundary 2', () => {
    expect(isEndangered({ fitness: 30, population: 2, species: 'producer' })).toBe(false)
  })
})

// ─── buildOrganism ──────────────────────────────────────────────────────────────

describe('buildOrganism', () => {
  it('builds a producer organism', () => {
    const org = buildOrganism('types.ts', 'export interface Foo {}', [], [])
    expect(org.species).toBe('producer')
    expect(org.habitat).toBe('.')
  })

  it('builds an apex organism', () => {
    const org = buildOrganism('main.ts', 'import { x } from "./mod"', ['./mod'], [])
    expect(org.species).toBe('apex')
  })

  it('builds a decomposer for test files', () => {
    const org = buildOrganism('mod.test.ts', 'import { x } from "./mod"', [], [])
    expect(org.species).toBe('decomposer')
  })

  it('computes fitness', () => {
    const org = buildOrganism('mod.ts', 'export function clean() { return 1 }', [], [])
    expect(org.fitness).toBeGreaterThan(0)
  })

  it('sets population from importedBy', () => {
    const org = buildOrganism('mod.ts', 'export const x = 1', [], ['a.ts', 'b.ts'])
    expect(org.population).toBe(2)
  })
})

// ─── buildFoodWeb ───────────────────────────────────────────────────────────────

describe('buildFoodWeb', () => {
  it('categorizes organisms into food web', () => {
    const organisms: Organism[] = [
      { file: 'types.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['main.ts'], role: 'Foundation', population: 1, endangered: false },
      { file: 'main.ts', species: 'apex', habitat: '.', fitness: 70, diet: ['types.ts'], predators: [], role: 'Entry', population: 0, endangered: false },
      { file: 'util.ts', species: 'parasite', habitat: '.', fitness: 50, diet: ['types.ts'], predators: [], role: 'Consumer', population: 0, endangered: false },
    ]
    const web = buildFoodWeb(organisms)
    expect(web.producers).toContain('types.ts')
    expect(web.apex).toContain('main.ts')
    expect(web.parasites).toContain('util.ts')
  })

  it('returns empty categories for no organisms', () => {
    const web = buildFoodWeb([])
    expect(web.producers).toHaveLength(0)
    expect(web.consumers).toHaveLength(0)
  })
})

// ─── groupIntoHabitats ──────────────────────────────────────────────────────────

describe('groupIntoHabitats', () => {
  it('groups by directory', () => {
    const organisms: Organism[] = [
      { file: 'src/a.ts', species: 'producer', habitat: 'src', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false },
      { file: 'src/b.ts', species: 'producer', habitat: 'src', fitness: 70, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false },
      { file: 'test/c.ts', species: 'decomposer', habitat: 'test', fitness: 60, diet: [], predators: [], role: 'Test', population: 0, endangered: false },
    ]
    const habitats = groupIntoHabitats(organisms)
    expect(habitats.get('src')?.length).toBe(2)
    expect(habitats.get('test')?.length).toBe(1)
  })

  it('returns empty map for no organisms', () => {
    expect(groupIntoHabitats([]).size).toBe(0)
  })
})

// ─── computeBiodiversity ────────────────────────────────────────────────────────

describe('computeBiodiversity', () => {
  it('returns 0 for empty array', () => {
    expect(computeBiodiversity([])).toBe(0)
  })

  it('returns 0 for single species', () => {
    const orgs: Organism[] = Array.from({ length: 5 }, () => ({
      file: 'a.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false,
    }))
    expect(computeBiodiversity(orgs)).toBe(0)
  })

  it('returns high diversity for balanced species', () => {
    const species: Organism['species'][] = ['producer', 'primary-consumer', 'apex', 'decomposer', 'parasite']
    const orgs: Organism[] = species.map((s, i) => ({
      file: `${i}.ts`, species: s, habitat: '.', fitness: 50, diet: [], predators: [], role: 'role', population: 0, endangered: false,
    }))
    expect(computeBiodiversity(orgs)).toBeGreaterThan(80)
  })
})

// ─── computeHabitatStability ────────────────────────────────────────────────────

describe('computeHabitatStability', () => {
  it('returns 0 for empty array', () => {
    expect(computeHabitatStability([])).toBe(0)
  })

  it('factors in fitness', () => {
    const highFitness: Organism[] = Array.from({ length: 3 }, (_, i) => ({
      file: `${i}.ts`, species: 'producer', habitat: '.', fitness: 90, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false,
    }))
    const lowFitness: Organism[] = Array.from({ length: 3 }, (_, i) => ({
      file: `${i}.ts`, species: 'producer', habitat: '.', fitness: 20, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false,
    }))
    expect(computeHabitatStability(highFitness)).toBeGreaterThan(computeHabitatStability(lowFitness))
  })

  it('penalizes endangered organisms', () => {
    const healthy: Organism[] = Array.from({ length: 3 }, (_, i) => ({
      file: `${i}.ts`, species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false,
    }))
    const endangered: Organism[] = Array.from({ length: 3 }, (_, i) => ({
      file: `${i}.ts`, species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: true,
    }))
    expect(computeHabitatStability(healthy)).toBeGreaterThan(computeHabitatStability(endangered))
  })
})

// ─── classifyHabitatCondition ───────────────────────────────────────────────────

describe('classifyHabitatCondition', () => {
  it('returns pristine for high values', () => {
    expect(classifyHabitatCondition(90, 90)).toBe('pristine')
  })

  it('returns healthy for good values', () => {
    expect(classifyHabitatCondition(65, 65)).toBe('healthy')
  })

  it('returns stressed for moderate values', () => {
    expect(classifyHabitatCondition(45, 45)).toBe('stressed')
  })

  it('returns degraded for low values', () => {
    expect(classifyHabitatCondition(25, 25)).toBe('degraded')
  })

  it('returns barren for zero', () => {
    expect(classifyHabitatCondition(0, 0)).toBe('barren')
  })
})

// ─── buildHabitat ───────────────────────────────────────────────────────────────

describe('buildHabitat', () => {
  it('builds a habitat from organisms', () => {
    const orgs: Organism[] = [
      { file: 'src/a.ts', species: 'producer', habitat: 'src', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false },
    ]
    const hab = buildHabitat('src', orgs)
    expect(hab.name).toBe('src')
    expect(hab.organisms).toHaveLength(1)
    expect(hab.stability).toBeGreaterThan(0)
  })
})

// ─── identifyKeystones ──────────────────────────────────────────────────────────

describe('identifyKeystones', () => {
  it('identifies high-population organisms as keystones', () => {
    const orgs: Organism[] = [
      { file: 'core.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['a.ts', 'b.ts', 'c.ts'], role: 'Foundation', population: 3, endangered: false },
    ]
    const keys = identifyKeystones(orgs)
    expect(keys).toHaveLength(1)
    expect(keys[0].file).toBe('core.ts')
    expect(keys[0].dependents).toBe(3)
  })

  it('filters out low-population organisms', () => {
    const orgs: Organism[] = [
      { file: 'solo.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['a.ts'], role: 'Foundation', population: 1, endangered: false },
    ]
    expect(identifyKeystones(orgs)).toHaveLength(0)
  })

  it('sorts by impact descending', () => {
    const orgs: Organism[] = [
      { file: 'big.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['a', 'b', 'c', 'd', 'e'], role: 'Foundation', population: 5, endangered: false },
      { file: 'small.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['a', 'b'], role: 'Foundation', population: 2, endangered: false },
    ]
    const keys = identifyKeystones(orgs)
    expect(keys[0].file).toBe('big.ts')
  })

  it('assigns risk levels', () => {
    const orgs: Organism[] = [
      { file: 'high.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: Array.from({ length: 6 }, (_, i) => `${i}.ts`), role: 'Foundation', population: 6, endangered: false },
      { file: 'low.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['a.ts', 'b.ts'], role: 'Foundation', population: 2, endangered: false },
    ]
    const keys = identifyKeystones(orgs)
    const high = keys.find((k) => k.file === 'high.ts')
    const low = keys.find((k) => k.file === 'low.ts')
    expect(high?.risk).toBe('high')
    expect(low?.risk).toBe('low')
  })
})

// ─── computeFoodChainLength ─────────────────────────────────────────────────────

describe('computeFoodChainLength', () => {
  it('returns 0 for empty organisms', () => {
    expect(computeFoodChainLength([])).toBe(0)
  })

  it('returns 0 for no imports', () => {
    const orgs: Organism[] = [
      { file: 'a.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false },
    ]
    expect(computeFoodChainLength(orgs)).toBe(0)
  })

  it('computes chain length', () => {
    const orgs: Organism[] = [
      { file: 'a.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: ['b.ts'], role: 'Foundation', population: 1, endangered: false },
      { file: 'b.ts', species: 'consumer', habitat: '.', fitness: 70, diet: ['a.ts'], predators: ['c.ts'], role: 'Intermediary', population: 1, endangered: false },
      { file: 'c.ts', species: 'apex', habitat: '.', fitness: 60, diet: ['b.ts'], predators: [], role: 'Entry', population: 0, endangered: false },
    ]
    expect(computeFoodChainLength(orgs)).toBe(2)
  })
})

// ─── computeTrophicEfficiency ───────────────────────────────────────────────────

describe('computeTrophicEfficiency', () => {
  it('returns 0 for empty', () => {
    const web: FoodWeb = { producers: [], consumers: [], apex: [], decomposers: [], parasites: [] }
    expect(computeTrophicEfficiency(web, [])).toBe(0)
  })

  it('high when mostly producers and consumers', () => {
    const web: FoodWeb = { producers: ['a.ts'], consumers: ['b.ts'], apex: [], decomposers: [], parasites: [] }
    const orgs: Organism[] = [
      { file: 'a.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false },
      { file: 'b.ts', species: 'primary-consumer', habitat: '.', fitness: 70, diet: ['a.ts'], predators: [], role: 'Intermediary', population: 0, endangered: false },
    ]
    expect(computeTrophicEfficiency(web, orgs)).toBeGreaterThan(50)
  })

  it('lower with parasites', () => {
    const noPara: FoodWeb = { producers: ['a.ts'], consumers: [], apex: [], decomposers: [], parasites: [] }
    const withPara: FoodWeb = { producers: ['a.ts'], consumers: [], apex: [], decomposers: [], parasites: ['p.ts'] }
    const orgs: Organism[] = [
      { file: 'a.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false },
      { file: 'p.ts', species: 'parasite', habitat: '.', fitness: 50, diet: ['a.ts'], predators: [], role: 'Consumer', population: 0, endangered: false },
    ]
    expect(computeTrophicEfficiency(withPara, orgs)).toBeLessThan(computeTrophicEfficiency(noPara, [orgs[0]]))
  })
})

// ─── computeEcosystemStability ──────────────────────────────────────────────────

describe('computeEcosystemStability', () => {
  it('returns 0 for empty habitats', () => {
    expect(computeEcosystemStability([], [])).toBe(0)
  })

  it('penalizes high-risk keystones', () => {
    const goodHab: Habitat = { name: 'src', organisms: [], carrying: 10, biodiversity: 80, stability: 80, condition: 'pristine' }
    const highRisk: KeystoneSpecies[] = [{ file: 'core.ts', dependents: 10, uniqueness: 90, impact: 100, risk: 'high' }]
    const noRisk: KeystoneSpecies[] = []
    const withRisk = computeEcosystemStability([goodHab], highRisk)
    const withoutRisk = computeEcosystemStability([goodHab], noRisk)
    expect(withRisk).toBeLessThan(withoutRisk)
  })
})

// ─── computeSpeciesDiversity ────────────────────────────────────────────────────

describe('computeSpeciesDiversity', () => {
  it('returns 0 for empty', () => {
    expect(computeSpeciesDiversity([])).toBe(0)
  })

  it('returns 0 for single species', () => {
    const orgs: Organism[] = Array.from({ length: 5 }, (_, i) => ({
      file: `${i}.ts`, species: 'producer', habitat: '.', fitness: 50, diet: [], predators: [], role: 'Foundation', population: 0, endangered: false,
    }))
    expect(computeSpeciesDiversity(orgs)).toBe(0)
  })

  it('returns high for balanced distribution', () => {
    const types: Organism['species'][] = ['producer', 'primary-consumer', 'apex', 'decomposer', 'parasite', 'secondary-consumer']
    const orgs: Organism[] = types.map((s, i) => ({
      file: `${i}.ts`, species: s, habitat: '.', fitness: 50, diet: [], predators: [], role: 'role', population: 0, endangered: false,
    }))
    expect(computeSpeciesDiversity(orgs)).toBe(100)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: EcosystemStats = {
    totalOrganisms: 10, speciesDiversity: 60, foodChainLength: 3,
    keystoneCount: 2, endangeredCount: 0, producerCount: 3,
    consumerCount: 4, apexCount: 1, decomposerCount: 1, parasiteCount: 1,
    ecosystemStability: 70, habitatCount: 2, avgBiodiversity: 50, trophicEfficiency: 60,
  }

  it('warns about endangered species', () => {
    const endangered: Organism[] = [
      { file: 'bad.ts', species: 'producer', habitat: '.', fitness: 20, diet: [], predators: Array.from({ length: 5 }, (_, i) => `${i}.ts`), role: 'Foundation', population: 5, endangered: true },
    ]
    const recs = generateRecommendations(endangered, [], [], baseStats)
    expect(recs.some((r) => r.includes('endangered'))).toBe(true)
  })

  it('warns about high-risk keystones', () => {
    const keystones: KeystoneSpecies[] = [{ file: 'core.ts', dependents: 10, uniqueness: 90, impact: 100, risk: 'high' }]
    const recs = generateRecommendations([], [], keystones, baseStats)
    expect(recs.some((r) => r.includes('keystone'))).toBe(true)
  })

  it('warns about parasites', () => {
    const parasites: Organism[] = [
      { file: 'par.ts', species: 'parasite', habitat: '.', fitness: 50, diet: ['a.ts'], predators: [], role: 'Consumer', population: 0, endangered: false },
    ]
    const recs = generateRecommendations(parasites, [], [], baseStats)
    expect(recs.some((r) => r.includes('parasite'))).toBe(true)
  })

  it('warns about degraded habitats', () => {
    const degraded: Habitat[] = [{ name: 'bad', organisms: [], carrying: 5, biodiversity: 10, stability: 10, condition: 'degraded' }]
    const recs = generateRecommendations([], degraded, [], baseStats)
    expect(recs.some((r) => r.includes('degraded'))).toBe(true)
  })

  it('warns about low biodiversity', () => {
    const stats = { ...baseStats, avgBiodiversity: 15 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('biodiversity'))).toBe(true)
  })

  it('warns about low trophic efficiency', () => {
    const stats = { ...baseStats, trophicEfficiency: 20 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('trophic'))).toBe(true)
  })

  it('praises high stability', () => {
    const stats = { ...baseStats, ecosystemStability: 80 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('stability'))).toBe(true)
  })

  it('returns default when all is good', () => {
    const recs = generateRecommendations([], [], [], baseStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildEcosystemResult ───────────────────────────────────────────────────────

describe('buildEcosystemResult', () => {
  it('handles empty files', () => {
    const result = buildEcosystemResult([], [], {})
    expect(result.organisms).toHaveLength(0)
    expect(result.stats.totalOrganisms).toBe(0)
  })

  it('creates organisms from files', () => {
    const result = buildEcosystemResult(
      ['types.ts', 'main.ts'],
      ['export interface Foo {}', 'import { Foo } from "./types"'],
      {},
    )
    expect(result.organisms).toHaveLength(2)
  })

  it('resolves import dependencies', () => {
    const result = buildEcosystemResult(
      ['types.ts', 'main.ts'],
      ['export interface Foo {}', 'export function run() {}\nimport { Foo } from "./types"'],
      {},
    )
    const mainOrg = result.organisms.find((o) => o.file === 'main.ts')
    expect(mainOrg?.diet).toContain('./types')
  })

  it('tracks reverse dependencies', () => {
    const result = buildEcosystemResult(
      ['types.ts', 'main.ts'],
      ['export interface Foo {}', 'export function run() {}\nimport { Foo } from "./types"'],
      {},
    )
    const typesOrg = result.organisms.find((o) => o.file === 'types.ts')
    expect(typesOrg?.predators).toContain('main.ts')
  })

  it('builds food web', () => {
    const result = buildEcosystemResult(
      ['types.ts', 'util.ts', 'main.ts'],
      ['export interface Foo {}', 'export function bar() {}', 'export function run() {}\nimport { Foo } from "./types"\nimport { bar } from "./util"'],
      {},
    )
    expect(result.foodWeb.producers.length).toBeGreaterThan(0)
    expect(result.foodWeb.apex).toContain('main.ts')
  })

  it('builds habitats', () => {
    const result = buildEcosystemResult(
      ['src/a.ts', 'src/b.ts', 'test/c.test.ts'],
      ['export const a = 1', 'export const b = 2', 'import { a } from "../src/a"'],
      {},
    )
    expect(result.habitats.length).toBeGreaterThanOrEqual(2)
  })

  it('computes stats', () => {
    const result = buildEcosystemResult(
      ['types.ts', 'main.ts'],
      ['export interface Foo {}', 'import { Foo } from "./types"'],
      {},
    )
    expect(result.stats.totalOrganisms).toBe(2)
    expect(result.stats.foodChainLength).toBeGreaterThanOrEqual(0)
    expect(result.stats.ecosystemStability).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildEcosystemResult(
      ['types.ts'],
      ['export interface Foo {}'],
      {},
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatOrganismTable', () => {
  it('shows no organisms message', () => {
    expect(formatOrganismTable([])).toContain('No organisms')
  })

  it('formats organism details', () => {
    const orgs: Organism[] = [
      { file: 'mod.ts', species: 'producer', habitat: '.', fitness: 80, diet: [], predators: [], role: 'Foundation', population: 3, endangered: false },
    ]
    const output = formatOrganismTable(orgs)
    expect(output).toContain('mod.ts')
    expect(output).toContain('producer')
  })
})

describe('formatFoodWeb', () => {
  it('formats food web diagram', () => {
    const web: FoodWeb = { producers: ['a.ts'], consumers: ['b.ts'], apex: ['c.ts'], decomposers: [], parasites: [] }
    const output = formatFoodWeb(web)
    expect(output).toContain('Apex')
    expect(output).toContain('Producers')
    expect(output).toContain('Consumers')
  })
})

describe('formatHabitatMap', () => {
  it('shows no habitats message', () => {
    expect(formatHabitatMap([])).toContain('No habitats')
  })

  it('formats habitat details', () => {
    const habitats: Habitat[] = [
      { name: 'src', organisms: [], carrying: 10, biodiversity: 70, stability: 80, condition: 'pristine' },
    ]
    const output = formatHabitatMap(habitats)
    expect(output).toContain('src')
    expect(output).toContain('PRISTINE')
  })
})

describe('formatKeystones', () => {
  it('shows no keystones message', () => {
    expect(formatKeystones([])).toContain('No keystone')
  })

  it('formats keystone details', () => {
    const keys: KeystoneSpecies[] = [
      { file: 'core.ts', dependents: 5, uniqueness: 80, impact: 50, risk: 'medium' },
    ]
    const output = formatKeystones(keys)
    expect(output).toContain('core.ts')
    expect(output).toContain('MEDIUM')
  })
})

describe('formatEcosystemStats', () => {
  it('formats all stats', () => {
    const stats: EcosystemStats = {
      totalOrganisms: 10, speciesDiversity: 60, foodChainLength: 3,
      keystoneCount: 2, endangeredCount: 1, producerCount: 3,
      consumerCount: 4, apexCount: 1, decomposerCount: 1, parasiteCount: 1,
      ecosystemStability: 70, habitatCount: 3, avgBiodiversity: 55, trophicEfficiency: 65,
    }
    const output = formatEcosystemStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('70%')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatRecommendations(['Fix parasites', 'Add tests'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatEcosystemTable', () => {
  it('formats full result', () => {
    const result = buildEcosystemResult(
      ['types.ts', 'main.ts'],
      ['export interface Foo {}', 'import { Foo } from "./types"'],
      {},
    )
    const output = formatEcosystemTable(result)
    expect(output).toContain('Ecosystem Analysis')
    expect(output).toContain('Food Web')
  })
})

describe('formatEcosystemJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildEcosystemResult(['a.ts'], ['export const x = 1'], {})
    const output = formatEcosystemJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalOrganisms).toBe(1)
  })
})
