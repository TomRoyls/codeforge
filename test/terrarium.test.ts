import { describe, it, expect } from 'vitest'
import {
  classifySpecies,
  classifyKingdom,
  classifyExtinctionRisk,
  classifyOrganismHealth,
  classifyBiomeType,
  classifyStability,
  classifyBiomeHealth,
  classifyEcosystemGrade,
  analyzeOrganism,
  analyzeBiome,
  buildFoodWeb,
  computeEcologicalHealth,
  identifyKeystoneFile,
  identifyParasiteFile,
  extractImportPaths,
  generateTerrariumRecommendations,
  buildTerrariumResult,
  type TerrariumStats,
} from '../src/commands/terrarium-helpers.js'
import { formatTerrariumTable, formatTerrariumJson } from '../src/commands/terrarium-format-helpers.js'

// ─── classifySpecies ─────────────────────────────────────────────────────────

describe('classifySpecies', () => {
  it('returns producer for many exports few imports', () => {
    expect(classifySpecies({ exports: 5, imports: 1, isTest: false, isCommand: false })).toBe('producer')
  })

  it('returns decomposer for test files', () => {
    expect(classifySpecies({ exports: 1, imports: 2, isTest: true, isCommand: false })).toBe('decomposer')
  })

  it('returns apex-predator for commands', () => {
    expect(classifySpecies({ exports: 1, imports: 2, isTest: false, isCommand: true })).toBe('apex-predator')
  })

  it('returns symbiont for balanced imports/exports', () => {
    expect(classifySpecies({ exports: 2, imports: 4, isTest: false, isCommand: false })).toBe('symbiont')
  })

  it('returns parasite for heavy imports no exports', () => {
    expect(classifySpecies({ exports: 0, imports: 6, isTest: false, isCommand: false })).toBe('parasite')
  })

  it('returns primary-consumer for moderate exports with some imports', () => {
    expect(classifySpecies({ exports: 2, imports: 2, isTest: false, isCommand: false })).toBe('primary-consumer')
  })

  it('returns secondary-consumer as default', () => {
    expect(classifySpecies({ exports: 1, imports: 0, isTest: false, isCommand: false })).toBe('secondary-consumer')
  })
})

// ─── classifyKingdom ─────────────────────────────────────────────────────────

describe('classifyKingdom', () => {
  it('returns fungi for test files', () => {
    expect(classifyKingdom({ hasClasses: false, hasFunctions: true, hasInterfaces: false, hasTypes: false, isTest: true })).toBe('fungi')
  })

  it('returns plantae for interfaces', () => {
    expect(classifyKingdom({ hasClasses: false, hasFunctions: false, hasInterfaces: true, hasTypes: false, isTest: false })).toBe('plantae')
  })

  it('returns plantae for types', () => {
    expect(classifyKingdom({ hasClasses: false, hasFunctions: false, hasInterfaces: false, hasTypes: true, isTest: false })).toBe('plantae')
  })

  it('returns animalia for classes and functions', () => {
    expect(classifyKingdom({ hasClasses: true, hasFunctions: true, hasInterfaces: false, hasTypes: false, isTest: false })).toBe('animalia')
  })

  it('returns archaea for classes only', () => {
    expect(classifyKingdom({ hasClasses: true, hasFunctions: false, hasInterfaces: false, hasTypes: false, isTest: false })).toBe('archaea')
  })

  it('returns bacteria for functions only', () => {
    expect(classifyKingdom({ hasClasses: false, hasFunctions: true, hasInterfaces: false, hasTypes: false, isTest: false })).toBe('bacteria')
  })

  it('returns protista for nothing', () => {
    expect(classifyKingdom({ hasClasses: false, hasFunctions: false, hasInterfaces: false, hasTypes: false, isTest: false })).toBe('protista')
  })
})

// ─── classifyExtinctionRisk ──────────────────────────────────────────────────

describe('classifyExtinctionRisk', () => {
  it('returns none for fit popular organisms', () => {
    expect(classifyExtinctionRisk(80, 5)).toBe('none')
  })

  it('returns low for good fitness with some population', () => {
    expect(classifyExtinctionRisk(65, 2)).toBe('low')
  })

  it('returns moderate for average fitness', () => {
    expect(classifyExtinctionRisk(45, 0)).toBe('moderate')
  })

  it('returns high for low fitness', () => {
    expect(classifyExtinctionRisk(28, 0)).toBe('high')
  })

  it('returns critical for very low fitness', () => {
    expect(classifyExtinctionRisk(15, 0)).toBe('critical')
  })

  it('returns extinct for zero fitness', () => {
    expect(classifyExtinctionRisk(0, 0)).toBe('extinct')
  })
})

// ─── classifyOrganismHealth ──────────────────────────────────────────────────

describe('classifyOrganismHealth', () => {
  it('returns thriving for high fitness', () => {
    expect(classifyOrganismHealth(85)).toBe('thriving')
  })

  it('returns healthy for good fitness', () => {
    expect(classifyOrganismHealth(65)).toBe('healthy')
  })

  it('returns stressed for moderate fitness', () => {
    expect(classifyOrganismHealth(45)).toBe('stressed')
  })

  it('returns declining for low fitness', () => {
    expect(classifyOrganismHealth(30)).toBe('declining')
  })

  it('returns endangered for very low fitness', () => {
    expect(classifyOrganismHealth(15)).toBe('endangered')
  })

  it('returns extinct for zero fitness', () => {
    expect(classifyOrganismHealth(0)).toBe('extinct')
  })
})

// ─── classifyBiomeType ───────────────────────────────────────────────────────

describe('classifyBiomeType', () => {
  it('returns rainforest for diverse biomes', () => {
    expect(classifyBiomeType({ speciesCount: 15, biodiversity: 80, producerCount: 5, parasiteCount: 0, endangeredCount: 0 })).toBe('rainforest')
  })

  it('returns tundra for very few species', () => {
    expect(classifyBiomeType({ speciesCount: 1, biodiversity: 10, producerCount: 0, parasiteCount: 0, endangeredCount: 0 })).toBe('tundra')
  })

  it('returns volcanic for many parasites', () => {
    expect(classifyBiomeType({ speciesCount: 5, biodiversity: 40, producerCount: 1, parasiteCount: 4, endangeredCount: 0 })).toBe('volcanic')
  })

  it('returns temperate-forest for moderate diversity', () => {
    expect(classifyBiomeType({ speciesCount: 7, biodiversity: 55, producerCount: 2, parasiteCount: 0, endangeredCount: 0 })).toBe('temperate-forest')
  })

  it('returns desert as default', () => {
    expect(classifyBiomeType({ speciesCount: 3, biodiversity: 25, producerCount: 0, parasiteCount: 0, endangeredCount: 0 })).toBe('desert')
  })

  it('returns grassland for producers', () => {
    expect(classifyBiomeType({ speciesCount: 4, biodiversity: 42, producerCount: 3, parasiteCount: 0, endangeredCount: 0 })).toBe('grassland')
  })
})

// ─── classifyStability ───────────────────────────────────────────────────────

describe('classifyStability', () => {
  it('returns climax for high balance with keystone', () => {
    expect(classifyStability(75, true)).toBe('climax')
  })

  it('returns mature for good balance', () => {
    expect(classifyStability(60, false)).toBe('mature')
  })

  it('returns succession for moderate balance', () => {
    expect(classifyStability(40, false)).toBe('succession')
  })

  it('returns pioneer for low balance', () => {
    expect(classifyStability(25, false)).toBe('pioneer')
  })

  it('returns disturbed for very low balance', () => {
    expect(classifyStability(10, false)).toBe('disturbed')
  })

  it('returns barren for zero balance', () => {
    expect(classifyStability(0, false)).toBe('barren')
  })
})

// ─── classifyBiomeHealth ─────────────────────────────────────────────────────

describe('classifyBiomeHealth', () => {
  it('returns pristine for excellent fitness', () => {
    expect(classifyBiomeHealth(80)).toBe('pristine')
  })

  it('returns healthy for good fitness', () => {
    expect(classifyBiomeHealth(65)).toBe('healthy')
  })

  it('returns fair for moderate fitness', () => {
    expect(classifyBiomeHealth(48)).toBe('fair')
  })

  it('returns stressed for low fitness', () => {
    expect(classifyBiomeHealth(35)).toBe('stressed')
  })

  it('returns degraded for poor fitness', () => {
    expect(classifyBiomeHealth(20)).toBe('degraded')
  })

  it('returns collapsed for zero fitness', () => {
    expect(classifyBiomeHealth(5)).toBe('collapsed')
  })
})

// ─── classifyEcosystemGrade ──────────────────────────────────────────────────

describe('classifyEcosystemGrade', () => {
  it('returns thriving for high health', () => {
    expect(classifyEcosystemGrade(85)).toBe('thriving')
  })

  it('returns balanced for good health', () => {
    expect(classifyEcosystemGrade(65)).toBe('balanced')
  })

  it('returns stressed for moderate health', () => {
    expect(classifyEcosystemGrade(45)).toBe('stressed')
  })

  it('returns fragile for low health', () => {
    expect(classifyEcosystemGrade(25)).toBe('fragile')
  })

  it('returns collapsing for very low health', () => {
    expect(classifyEcosystemGrade(10)).toBe('collapsing')
  })

  it('returns dead for zero health', () => {
    expect(classifyEcosystemGrade(0)).toBe('dead')
  })
})

// ─── extractImportPaths ──────────────────────────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts relative imports', () => {
    expect(extractImportPaths('import { x } from "./helper"')).toEqual(['./helper'])
  })

  it('extracts multiple imports', () => {
    expect(extractImportPaths('import { a } from "./a"\nimport { b } from "./b"')).toEqual(['./a', './b'])
  })

  it('returns empty for no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })

  it('returns empty for empty content', () => {
    expect(extractImportPaths('')).toEqual([])
  })
})

// ─── analyzeOrganism ─────────────────────────────────────────────────────────

describe('analyzeOrganism', () => {
  it('returns correct structure', () => {
    const code = '/** Add two numbers */\nexport function add(a: number, b: number): number { return a + b }\nexport function sub(a: number, b: number): number { return a - b }\nexport interface Calc { add: (a: number, b: number) => number }'
    const result = analyzeOrganism(code, 'calc.ts', [], [])

    expect(result.file).toBe('calc.ts')
    expect(result.fitness).toBeGreaterThanOrEqual(0)
    expect(result.fitness).toBeLessThanOrEqual(100)
    expect(result.adaptability).toBeGreaterThanOrEqual(0)
    expect(result.reproduction).toBeGreaterThanOrEqual(0)
    expect(result.trophicLevel).toBeGreaterThanOrEqual(1)
    expect(result.trophicLevel).toBeLessThanOrEqual(5)
    expect(Array.isArray(result.prey)).toBe(true)
    expect(Array.isArray(result.predators)).toBe(true)
    expect(typeof result.keystone).toBe('boolean')
    expect(typeof result.native).toBe('boolean')
  })

  it('returns zero scores for empty content', () => {
    const result = analyzeOrganism('', 'empty.ts', [], [])
    expect(result.fitness).toBe(0)
    expect(result.adaptability).toBe(0)
    expect(result.reproduction).toBe(0)
    expect(result.biomass).toBe(0)
  })

  it('sets keystone for high population and fitness', () => {
    const code = '/** Core utility */\nexport function core(): number { return 42 }\nexport interface CoreConfig { value: number }'
    const result = analyzeOrganism(code, 'core.ts', [], ['a.ts', 'b.ts', 'c.ts'])
    expect(result.keystone).toBe(true)
    expect(result.population).toBe(3)
  })

  it('sets correct trophic level for producer', () => {
    const code = 'export interface I { x: number }\nexport type T = string\nexport const DEFAULT = "default"'
    const result = analyzeOrganism(code, 'types.ts', [], [])
    expect(result.species).toBe('producer')
    expect(result.trophicLevel).toBe(1)
  })

  it('computes mutations from any types and todos', () => {
    const code = 'export function bad(x: any): any { // TODO fix\n return x }'
    const result = analyzeOrganism(code, 'bad.ts', [], [])
    expect(result.mutations).toBeGreaterThan(0)
  })

  it('classifies lifespan based on biomass', () => {
    const smallCode = 'const x = 1'
    const result = analyzeOrganism(smallCode, 'tiny.ts', [], [])
    expect(result.lifespan).toBe('ephemeral')
  })

  it('identifies test files as decomposers', () => {
    const code = 'describe("test", () => { it("works", () => { expect(1).toBe(1) }) })'
    const result = analyzeOrganism(code, 'test/calc.test.ts', [], [])
    expect(result.species).toBe('decomposer')
    expect(result.kingdom).toBe('fungi')
  })
})

// ─── analyzeBiome ────────────────────────────────────────────────────────────

describe('analyzeBiome', () => {
  it('returns default biome for empty organisms', () => {
    const biome = analyzeBiome([], 'empty-dir')
    expect(biome.directory).toBe('empty-dir')
    expect(biome.stability).toBe('barren')
    expect(biome.health).toBe('collapsed')
    expect(biome.biodiversity).toBe(0)
  })

  it('aggregates metrics from organisms', () => {
    const code = 'export function a() {}'
    const organisms = [
      analyzeOrganism(code, 'dir/a.ts', [], []),
      analyzeOrganism(code, 'dir/b.ts', [], []),
    ]
    const biome = analyzeBiome(organisms, 'dir')
    expect(biome.directory).toBe('dir')
    expect(biome.organisms.length).toBe(2)
    expect(biome.avgFitness).toBeGreaterThanOrEqual(0)
    expect(biome.speciesCount).toBeGreaterThanOrEqual(1)
  })

  it('detects keystone organisms', () => {
    const code = '/** core */\nexport function core(): number { return 42 }\nexport interface I { x: number }'
    const organisms = [analyzeOrganism(code, 'core.ts', [], ['a.ts', 'b.ts', 'c.ts'])]
    const biome = analyzeBiome(organisms, '.')
    expect(biome.keystoneCount).toBe(1)
  })
})

// ─── buildFoodWeb ────────────────────────────────────────────────────────────

describe('buildFoodWeb', () => {
  it('returns zero metrics for empty organisms', () => {
    const web = buildFoodWeb([])
    expect(web.links).toBe(0)
    expect(web.cycles).toBe(0)
  })

  it('counts links from prey', () => {
    const org = analyzeOrganism('export function a() {}', 'a.ts', ['b.ts'], [])
    const web = buildFoodWeb([org])
    expect(web.links).toBe(1)
  })

  it('computes chain length', () => {
    const org = analyzeOrganism('export function a() {}', 'a.ts', [], [])
    const web = buildFoodWeb([org])
    expect(web.maxChainLength).toBeGreaterThanOrEqual(1)
  })
})

// ─── computeEcologicalHealth ─────────────────────────────────────────────────

describe('computeEcologicalHealth', () => {
  it('returns 0 for empty ecosystems', () => {
    expect(computeEcologicalHealth([], [])).toBe(0)
  })

  it('computes health from organisms and biomes', () => {
    const code = '/** doc */\nexport function a(): number { return 1 }\nexport interface I { x: number }'
    const organisms = [analyzeOrganism(code, 'a.ts', [], [])]
    const biome = analyzeBiome(organisms, '.')
    const health = computeEcologicalHealth([biome], organisms)
    expect(health).toBeGreaterThanOrEqual(0)
    expect(health).toBeLessThanOrEqual(100)
  })
})

// ─── identifyKeystoneFile ────────────────────────────────────────────────────

describe('identifyKeystoneFile', () => {
  it('returns none for empty organisms', () => {
    expect(identifyKeystoneFile([])).toBe('none')
  })

  it('returns first file when no keystones', () => {
    const org = analyzeOrganism('const x = 1', 'a.ts', [], [])
    expect(identifyKeystoneFile([org])).toBe('a.ts')
  })

  it('returns highest impact keystone', () => {
    const code = '/** core */\nexport function core(): number { return 42 }\nexport interface I { x: number }'
    const high = analyzeOrganism(code, 'high.ts', [], ['a.ts', 'b.ts', 'c.ts', 'd.ts'])
    const low = analyzeOrganism(code, 'low.ts', [], ['z.ts'])
    expect(identifyKeystoneFile([low, high])).toBe('high.ts')
  })
})

// ─── identifyParasiteFile ────────────────────────────────────────────────────

describe('identifyParasiteFile', () => {
  it('returns none when no parasites', () => {
    const org = analyzeOrganism('export function a() {}', 'a.ts', [], [])
    expect(identifyParasiteFile([org])).toBe('none')
  })

  it('returns highest invasive potential parasite', () => {
    const parasite = analyzeOrganism('const x = 1', 'parasite.ts', ['a', 'b', 'c', 'd', 'e', 'f'], [])
    expect(parasite.species).toBe('parasite')
    expect(identifyParasiteFile([parasite])).toBe('parasite.ts')
  })
})

// ─── generateTerrariumRecommendations ────────────────────────────────────────

describe('generateTerrariumRecommendations', () => {
  it('returns positive message when healthy', () => {
    const stats = createMockStats()
    const web = { links: 0, avgChainLength: 0, maxChainLength: 0, cycles: 0, keystoneNodes: 0, apexNodes: 0, basalNodes: 0 }
    const recs = generateTerrariumRecommendations([], [], web, stats)
    expect(recs.some(r => r.includes('Thriving') || r.includes('parasite'))).toBe(true)
  })

  it('recommends for parasites', () => {
    const stats = createMockStats({ parasiteCount: 2 })
    const web = { links: 0, avgChainLength: 0, maxChainLength: 0, cycles: 0, keystoneNodes: 0, apexNodes: 0, basalNodes: 0 }
    const recs = generateTerrariumRecommendations([], [], web, stats)
    expect(recs.some(r => r.includes('parasite'))).toBe(true)
  })

  it('recommends for cycles', () => {
    const stats = createMockStats({ foodChainCycles: 1 })
    const web = { links: 0, avgChainLength: 0, maxChainLength: 0, cycles: 1, keystoneNodes: 0, apexNodes: 0, basalNodes: 0 }
    const recs = generateTerrariumRecommendations([], [], web, stats)
    expect(recs.some(r => r.includes('circular') || r.includes('cycle'))).toBe(true)
  })

  it('recommends for low fitness', () => {
    const stats = createMockStats({ avgFitness: 30 })
    const web = { links: 0, avgChainLength: 0, maxChainLength: 0, cycles: 0, keystoneNodes: 0, apexNodes: 0, basalNodes: 0 }
    const recs = generateTerrariumRecommendations([], [], web, stats)
    expect(recs.some(r => r.includes('fitness'))).toBe(true)
  })

  it('recommends for barren biomes', () => {
    const stats = createMockStats({ barrenBiomes: 2 })
    const web = { links: 0, avgChainLength: 0, maxChainLength: 0, cycles: 0, keystoneNodes: 0, apexNodes: 0, basalNodes: 0 }
    const recs = generateTerrariumRecommendations([], [], web, stats)
    expect(recs.some(r => r.includes('barren'))).toBe(true)
  })
})

// ─── buildTerrariumResult ────────────────────────────────────────────────────

describe('buildTerrariumResult', () => {
  it('handles empty input', () => {
    const result = buildTerrariumResult([], [], {})
    expect(result.organisms.length).toBe(0)
    expect(result.biomes.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.ecosystemGrade).toBe('dead')
  })

  it('analyzes single file', () => {
    const code = '/** doc */\nexport function hello(): string { return "hello" }'
    const result = buildTerrariumResult(['hello.ts'], [code], {})
    expect(result.organisms.length).toBe(1)
    expect(result.biomes.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.keystoneFile).toBe('hello.ts')
    expect(result.stats.parasiteFile).toBe('none')
  })

  it('groups files by directory', () => {
    const code = 'export function a() {}'
    const result = buildTerrariumResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [code, code, code],
      {},
    )
    expect(result.organisms.length).toBe(3)
    expect(result.biomes.length).toBe(2)
  })

  it('resolves import dependencies', () => {
    const codeA = 'export function helper(): number { return 42 }'
    const codeB = 'import { helper } from "./a"\nexport function main(): number { return helper() }'
    const result = buildTerrariumResult(
      ['src/a.ts', 'src/b.ts'],
      [codeA, codeB],
      {},
    )
    const orgB = result.organisms.find(o => o.file === 'src/b.ts')
    expect(orgB?.prey).toContain('src/a.ts')
  })

  it('computes all stats fields', () => {
    const code = '/** doc */\nexport function a(): number { return 1 }'
    const result = buildTerrariumResult(['a.ts'], [code], {})
    const s = result.stats
    expect(typeof s.avgFitness).toBe('number')
    expect(typeof s.avgAdaptability).toBe('number')
    expect(typeof s.avgReproduction).toBe('number')
    expect(typeof s.biodiversity).toBe('number')
    expect(typeof s.avgTrophicEfficiency).toBe('number')
    expect(typeof s.avgNutrientCycling).toBe('number')
    expect(typeof s.avgEcologicalBalance).toBe('number')
    expect(typeof s.ecologicalHealth).toBe('number')
    expect(typeof s.dominantBiome).toBe('string')
    expect(typeof s.mostDiverse).toBe('string')
    expect(typeof s.leastDiverse).toBe('string')
    expect(typeof s.keystoneFile).toBe('string')
    expect(typeof s.parasiteFile).toBe('string')
  })

  it('builds food web with resolved links', () => {
    const codeA = 'export interface IBase { x: number }\nexport type Config = string\nexport const DEFAULT = "default"'
    const codeB = 'import { IBase } from "./a"\nexport function process(cfg: IBase): number { return cfg.x }'
    const result = buildTerrariumResult(['src/a.ts', 'src/b.ts'], [codeA, codeB], {})
    expect(result.organisms.length).toBe(2)
    const orgB = result.organisms.find(o => o.file === 'src/b.ts')
    expect(orgB?.prey.length).toBeGreaterThan(0)
  })
})

// ─── formatTerrariumTable ────────────────────────────────────────────────────

describe('formatTerrariumTable', () => {
  it('formats result as table string', () => {
    const result = buildTerrariumResult(['a.ts'], ['export function a() {}'], {})
    const output = formatTerrariumTable(result, false)
    expect(output).toContain('Terrarium')
    expect(output).toContain('Organisms')
    expect(output).toContain('Food Web')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildTerrariumResult(['a.ts'], ['export function a() {}'], {})
    const output = formatTerrariumTable(result, true)
    expect(output).toContain('kingdom:')
    expect(output).toContain('biomass:')
  })

  it('handles empty result', () => {
    const result = buildTerrariumResult([], [], {})
    const output = formatTerrariumTable(result, false)
    expect(output).toContain('No organisms detected')
  })
})

// ─── formatTerrariumJson ─────────────────────────────────────────────────────

describe('formatTerrariumJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildTerrariumResult(['a.ts'], ['export function a() {}'], {})
    const output = formatTerrariumJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.organisms).toBeDefined()
    expect(parsed.biomes).toBeDefined()
    expect(parsed.foodWeb).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildTerrariumResult([], [], {})
    const output = formatTerrariumJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.organisms.length).toBe(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockStats(overrides: Partial<TerrariumStats> = {}): TerrariumStats {
  return {
    totalFiles: 0,
    totalBiomes: 0,
    totalOrganisms: 0,
    avgFitness: 70,
    avgAdaptability: 70,
    avgReproduction: 70,
    biodiversity: 60,
    avgTrophicEfficiency: 70,
    avgNutrientCycling: 70,
    avgEcologicalBalance: 70,
    thrivingCount: 5,
    endangeredCount: 0,
    extinctCount: 0,
    keystoneCount: 1,
    parasiteCount: 0,
    invasiveCount: 0,
    foodChainCycles: 0,
    foodChainDepth: 3,
    climaxBiomes: 1,
    barrenBiomes: 0,
    ecologicalHealth: 70,
    ecosystemGrade: 'balanced',
    dominantBiome: 'temperate-forest',
    mostDiverse: 'src',
    leastDiverse: 'test',
    keystoneFile: 'src/core.ts',
    parasiteFile: 'none',
    ...overrides,
  }
}
