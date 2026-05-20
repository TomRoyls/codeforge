import { describe, expect, it } from 'vitest'

import {
  buildCartographerResult,
  buildRegions,
  classifyBiome,
  computeCommentRatio,
  computeComplexity,
  computeMapCompleteness,
  countPopulation,
  extractExports,
  extractImports,
  generateCartographerRecommendations,
  mapRegion,
  mapTerritory,
  traceRivers,
  type CartographerStats,
  type Territory,
} from '../src/commands/cartographer-helpers.js'

import {
  formatBiomeDistribution,
  formatCartographerJSON,
  formatCartographerRecommendations,
  formatCartographerStats,
  formatCartographerTable,
  formatElevationProfile,
  formatLegend,
  formatRegionOverview,
  formatTerritoryMap,
  getBiomeColor,
  getBiomeSymbol,
} from '../src/commands/cartographer-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const COMPLEX_CONTENT = `import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'

/**
 * A complex command with many branches.
 */
export async function processFile(config: Config): Promise<string> {
  if (!config) return 'empty'
  if (config.debug) console.log('debug')

  try {
    const result = await fetch('/api')
    const data = await result.json()
    if (data && data.name) return data.name
    if (data?.items?.length) return data.items[0]
    while (data.retry) { await delay(100) }
    return data?.value ?? 'unknown'
  } catch (error) {
    if (error instanceof TypeError) throw error
    if (error instanceof Error && error.message) throw error
    return 'failed'
  }
}

export class Builder {
  constructor() {}
  setName(n: string) { return this }
  setValue(v: number) { return this }
}

export function createItem() { return {} }
export function makeThing() { return {} }
export const MAX_RETRIES = 3
export type Config = { debug?: boolean }
export interface Options { verbose?: boolean }
`

const SIMPLE_CONTENT = `const x = 1
const y = 2
`

const EMPTY_CONTENT = ''

const DESERT_CONTENT = `const x = 1
const y = 2
const z = 3
`

const WELL_DOCUMENTED = `// This file handles user authentication
// It provides secure login and session management
// All methods are tested and documented
// Follows OWASP security guidelines

// Validates a user token
function validateToken() {}

// Refreshes the session
function refreshSession() {}

// Logs out the user
function logout() {}
`

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts ES module imports', () => {
    const imports = extractImports("import { foo } from './bar'", 'a.ts')
    expect(imports).toContain('./bar')
  })

  it('extracts default imports', () => {
    const imports = extractImports("import chalk from 'chalk'", 'a.ts')
    expect(imports).toContain('chalk')
  })

  it('extracts side-effect imports', () => {
    const imports = extractImports("import './polyfill'", 'a.ts')
    expect(imports).toContain('./polyfill')
  })

  it('extracts require calls', () => {
    const imports = extractImports("const fs = require('fs')", 'a.ts')
    expect(imports).toContain('fs')
  })

  it('extracts multiple imports', () => {
    const content = "import { a } from 'x'\nimport { b } from 'y'"
    const imports = extractImports(content, 'a.ts')
    expect(imports.length).toBe(2)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1', 'a.ts')).toEqual([])
  })
})

// ─── extractExports ───────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts named function exports', () => {
    expect(extractExports('export function foo() {}')).toContain('foo')
  })

  it('extracts class exports', () => {
    expect(extractExports('export class Bar {}')).toContain('Bar')
  })

  it('extracts const exports', () => {
    expect(extractExports('export const x = 1')).toContain('x')
  })

  it('extracts type exports', () => {
    expect(extractExports('export type Config = {}')).toContain('Config')
  })

  it('extracts interface exports', () => {
    expect(extractExports('export interface Options {}')).toContain('Options')
  })

  it('extracts enum exports', () => {
    expect(extractExports('export enum Color { Red }')).toContain('Color')
  })

  it('extracts async function exports', () => {
    expect(extractExports('export async function fetchData() {}')).toContain('fetchData')
  })

  it('extracts destructured exports', () => {
    const exports = extractExports('export { foo, bar }')
    expect(exports).toContain('foo')
    expect(exports).toContain('bar')
  })

  it('extracts re-export paths', () => {
    expect(extractExports("export * from './utils'")).toContain('./utils')
  })

  it('deduplicates exports', () => {
    const content = 'export const x = 1\nexport const x = 2'
    const exports = extractExports(content)
    const xCount = exports.filter((e) => e === 'x').length
    expect(xCount).toBe(1)
  })
})

// ─── computeComplexity ────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('counts if branches', () => {
    expect(computeComplexity('if (x) {} if (y) {}')).toBe(2)
  })

  it('counts for loops', () => {
    expect(computeComplexity('for (let i = 0; i < n; i++) {}')).toBe(1)
  })

  it('counts while loops', () => {
    expect(computeComplexity('while (true) {}')).toBe(1)
  })

  it('counts catch blocks', () => {
    expect(computeComplexity('try {} catch (e) {}')).toBe(1)
  })

  it('counts logical operators', () => {
    expect(computeComplexity('if (a && b || c) {}')).toBe(3)
  })

  it('counts nullish coalescing', () => {
    expect(computeComplexity('const x = a ?? b')).toBe(1)
  })

  it('counts optional chaining', () => {
    expect(computeComplexity('const x = a?.b')).toBe(1)
  })

  it('returns 1 for empty string', () => {
    expect(computeComplexity('')).toBe(1)
  })
})

// ─── countPopulation ──────────────────────────────────────────────────────────

describe('countPopulation', () => {
  it('counts named functions', () => {
    expect(countPopulation('function foo() {}')).toBe(1)
  })

  it('counts classes', () => {
    expect(countPopulation('class Bar {}')).toBe(1)
  })

  it('counts arrow functions', () => {
    expect(countPopulation('const f = () => 1')).toBe(1)
  })

  it('counts all three types', () => {
    expect(countPopulation('function foo() {}\nclass Bar {}\nconst f = () => 1')).toBe(3)
  })

  it('returns 0 for empty', () => {
    expect(countPopulation('')).toBe(0)
  })
})

// ─── computeCommentRatio ──────────────────────────────────────────────────────

describe('computeCommentRatio', () => {
  it('returns 0 for no comments', () => {
    expect(computeCommentRatio('const x = 1\nconst y = 2')).toBe(0)
  })

  it('computes ratio for inline comments', () => {
    const ratio = computeCommentRatio('// comment\nconst x = 1')
    expect(ratio).toBeCloseTo(0.5)
  })

  it('computes ratio for block comments', () => {
    const ratio = computeCommentRatio('/* block */\nconst x = 1')
    expect(ratio).toBeGreaterThanOrEqual(0.5)
  })

  it('returns 0 for empty content', () => {
    expect(computeCommentRatio('')).toBe(0)
  })

  it('detects well-documented code', () => {
    const ratio = computeCommentRatio(WELL_DOCUMENTED)
    expect(ratio).toBeGreaterThan(0.2)
  })
})

// ─── classifyBiome ────────────────────────────────────────────────────────────

describe('classifyBiome', () => {
  it('classifies high complexity as mountain', () => {
    expect(classifyBiome({ area: 100, elevation: 85, resources: [], rivers: [], population: 2, commentRatio: 0 })).toBe('mountain')
  })

  it('classifies well-documented moderate as oasis', () => {
    expect(classifyBiome({ area: 100, elevation: 30, resources: [], rivers: [], population: 2, commentRatio: 0.3 })).toBe('oasis')
  })

  it('classifies sparse as desert', () => {
    expect(classifyBiome({ area: 500, elevation: 10, resources: ['a'], rivers: [], population: 2, commentRatio: 0 })).toBe('desert')
  })

  it('classifies dense as forest', () => {
    const manyResources = Array.from({ length: 10 }, (_, i) => `r${i}`)
    expect(classifyBiome({ area: 50, elevation: 20, resources: manyResources, rivers: [], population: 15, commentRatio: 0 })).toBe('forest')
  })

  it('classifies moderate as plains', () => {
    expect(classifyBiome({ area: 100, elevation: 30, resources: ['a', 'b', 'c'], rivers: [], population: 5, commentRatio: 0 })).toBe('plains')
  })

  it('mountain takes priority over oasis', () => {
    expect(classifyBiome({ area: 100, elevation: 85, resources: [], rivers: [], population: 2, commentRatio: 0.5 })).toBe('mountain')
  })
})

// ─── mapTerritory ─────────────────────────────────────────────────────────────

describe('mapTerritory', () => {
  it('creates territory with correct file', () => {
    const t = mapTerritory('src/foo.ts', SIMPLE_CONTENT, ['src/foo.ts'], [SIMPLE_CONTENT])
    expect(t.file).toBe('src/foo.ts')
    expect(t.name).toBe('foo.ts')
  })

  it('computes area from line count', () => {
    const t = mapTerritory('a.ts', 'line1\nline2\nline3', ['a.ts'], ['line1\nline2\nline3'])
    expect(t.area).toBe(3)
  })

  it('computes elevation from complexity', () => {
    const t = mapTerritory('a.ts', COMPLEX_CONTENT, ['a.ts'], [COMPLEX_CONTENT])
    expect(t.elevation).toBeGreaterThan(0)
    expect(t.elevation).toBeLessThanOrEqual(100)
  })

  it('extracts resources (exports)', () => {
    const t = mapTerritory('a.ts', COMPLEX_CONTENT, ['a.ts'], [COMPLEX_CONTENT])
    expect(t.resources).toContain('processFile')
    expect(t.resources).toContain('Builder')
  })

  it('detects inflow rivers (imports)', () => {
    const t = mapTerritory('a.ts', COMPLEX_CONTENT, ['a.ts'], [COMPLEX_CONTENT])
    const inflows = t.rivers.filter((r) => r.direction === 'inflow')
    expect(inflows.length).toBeGreaterThanOrEqual(2)
  })

  it('finds neighbors in same directory', () => {
    const allFiles = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const allContents = ['x', 'y', 'z']
    const t = mapTerritory('src/a.ts', 'x', allFiles, allContents)
    expect(t.neighbors).toContain('src/b.ts')
    expect(t.neighbors).not.toContain('lib/c.ts')
  })

  it('classifies biome', () => {
    const t = mapTerritory('a.ts', SIMPLE_CONTENT, ['a.ts'], [SIMPLE_CONTENT])
    expect(['desert', 'plains', 'forest', 'mountain', 'oasis']).toContain(t.biome)
  })

  it('handles empty content', () => {
    const t = mapTerritory('a.ts', EMPTY_CONTENT, ['a.ts'], [EMPTY_CONTENT])
    expect(t.area).toBe(1)
    expect(t.resources).toEqual([])
  })

  it('extracts name from file path', () => {
    const t = mapTerritory('deep/nested/path/foo.ts', 'x', ['deep/nested/path/foo.ts'], ['x'])
    expect(t.name).toBe('foo.ts')
  })
})

// ─── mapRegion ────────────────────────────────────────────────────────────────

describe('mapRegion', () => {
  it('groups territories by directory', () => {
    const t1: Territory = { file: 'src/a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1, resources: [], rivers: [], neighbors: [], biome: 'plains' }
    const t2: Territory = { file: 'src/b.ts', name: 'b.ts', area: 20, elevation: 30, population: 2, resources: [], rivers: [], neighbors: [], biome: 'plains' }
    const t3: Territory = { file: 'lib/c.ts', name: 'c.ts', area: 5, elevation: 10, population: 1, resources: [], rivers: [], neighbors: [], biome: 'desert' }

    const region = mapRegion([t1, t2, t3], 'src')
    expect(region.territories.length).toBe(2)
    expect(region.totalArea).toBe(30)
    expect(region.avgElevation).toBe(25)
  })

  it('returns empty region for no matching territories', () => {
    const t: Territory = { file: 'src/a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1, resources: [], rivers: [], neighbors: [], biome: 'plains' }
    const region = mapRegion([t], 'lib')
    expect(region.territories.length).toBe(0)
    expect(region.totalArea).toBe(0)
  })

  it('computes connections from external rivers', () => {
    const t: Territory = {
      file: 'src/a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1, resources: [],
      rivers: [
        { name: 'lodash', source: 'lodash', destination: 'src/a.ts', flow: 1, direction: 'inflow' },
      ],
      neighbors: [], biome: 'plains',
    }
    const region = mapRegion([t], 'src')
    expect(region.connections).toBe(1)
  })
})

// ─── traceRivers ──────────────────────────────────────────────────────────────

describe('traceRivers', () => {
  it('collects all rivers from all territories', () => {
    const t1: Territory = { file: 'a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1, resources: [], rivers: [{ name: 'x', source: 'x', destination: 'a.ts', flow: 1, direction: 'inflow' }], neighbors: [], biome: 'plains' }
    const t2: Territory = { file: 'b.ts', name: 'b.ts', area: 10, elevation: 20, population: 1, resources: [], rivers: [{ name: 'y', source: 'y', destination: 'b.ts', flow: 1, direction: 'inflow' }], neighbors: [], biome: 'plains' }
    expect(traceRivers([t1, t2]).length).toBe(2)
  })

  it('returns empty for no territories', () => {
    expect(traceRivers([])).toEqual([])
  })
})

// ─── computeMapCompleteness ───────────────────────────────────────────────────

describe('computeMapCompleteness', () => {
  it('returns 0 for empty territories', () => {
    expect(computeMapCompleteness([])).toBe(0)
  })

  it('returns low score for isolated territories', () => {
    const t: Territory = { file: 'a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1, resources: [], rivers: [], neighbors: [], biome: 'desert' }
    expect(computeMapCompleteness([t])).toBeLessThan(50)
  })

  it('returns high score for well-connected territories', () => {
    const t: Territory = {
      file: 'a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1,
      resources: ['foo'], rivers: [{ name: 'x', source: 'x', destination: 'a.ts', flow: 1, direction: 'inflow' }],
      neighbors: ['b.ts'], biome: 'plains',
    }
    expect(computeMapCompleteness([t])).toBeGreaterThan(50)
  })

  it('caps at 100', () => {
    const t: Territory = {
      file: 'a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1,
      resources: ['foo', 'bar'], rivers: [{ name: 'x', source: 'x', destination: 'a.ts', flow: 1, direction: 'inflow' }],
      neighbors: ['b.ts', 'c.ts'], biome: 'plains',
    }
    expect(computeMapCompleteness([t])).toBeLessThanOrEqual(100)
  })
})

// ─── buildRegions ─────────────────────────────────────────────────────────────

describe('buildRegions', () => {
  it('groups territories into unique directories', () => {
    const files = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const contents = ['x', 'y', 'z']
    const result = buildCartographerResult(files, contents)
    expect(result.regions.length).toBe(2)
  })

  it('handles root-level files', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['x', 'y']
    const result = buildCartographerResult(files, contents)
    expect(result.regions.length).toBe(1)
    expect(result.regions[0]!.name).toBe('(root)')
  })
})

// ─── generateCartographerRecommendations ──────────────────────────────────────

describe('generateCartographerRecommendations', () => {
  it('warns about deserts', () => {
    const stats = { desertCount: 3, mountainCount: 0, mapCompleteness: 80 } as CartographerStats
    const recs = generateCartographerRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('desert'))).toBe(true)
  })

  it('warns about mountains', () => {
    const stats = { desertCount: 0, mountainCount: 2, mapCompleteness: 80 } as CartographerStats
    const recs = generateCartographerRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('mountain'))).toBe(true)
  })

  it('warns about low completeness', () => {
    const stats = { desertCount: 0, mountainCount: 0, mapCompleteness: 30 } as CartographerStats
    const recs = generateCartographerRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('completeness'))).toBe(true)
  })

  it('warns about isolated territories', () => {
    const stats = { desertCount: 0, mountainCount: 0, mapCompleteness: 80 } as CartographerStats
    const isolated: Territory = { file: 'a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1, resources: [], rivers: [], neighbors: [], biome: 'plains' }
    const recs = generateCartographerRecommendations([isolated], [], stats)
    expect(recs.some((r) => r.includes('isolated'))).toBe(true)
  })

  it('praises clean map', () => {
    const stats = { desertCount: 0, mountainCount: 0, mapCompleteness: 90 } as CartographerStats
    const connected: Territory = {
      file: 'a.ts', name: 'a.ts', area: 10, elevation: 20, population: 1,
      resources: ['foo'], rivers: [{ name: 'x', source: 'x', destination: 'a.ts', flow: 1, direction: 'inflow' }],
      neighbors: ['b.ts'], biome: 'plains',
    }
    const recs = generateCartographerRecommendations([connected], [], stats)
    expect(recs.some((r) => r.includes('well-charted'))).toBe(true)
  })
})

// ─── buildCartographerResult ──────────────────────────────────────────────────

describe('buildCartographerResult', () => {
  it('builds complete result from files', () => {
    const result = buildCartographerResult(['src/a.ts', 'src/b.ts'], [COMPLEX_CONTENT, SIMPLE_CONTENT])
    expect(result.territories.length).toBe(2)
    expect(result.regions.length).toBe(1)
    expect(result.stats.totalTerritories).toBe(2)
  })

  it('handles empty input', () => {
    const result = buildCartographerResult([], [])
    expect(result.territories).toEqual([])
    expect(result.stats.totalTerritories).toBe(0)
    expect(result.stats.highestPeak).toBe('N/A')
  })

  it('computes correct stats', () => {
    const result = buildCartographerResult(['a.ts'], [COMPLEX_CONTENT])
    expect(result.stats.totalArea).toBeGreaterThan(0)
    expect(result.stats.avgElevation).toBeGreaterThanOrEqual(0)
    expect(result.stats.highestPeak).toBe('a.ts')
    expect(result.stats.largestTerritory).toBe('a.ts')
  })

  it('identifies highest peak', () => {
    const result = buildCartographerResult(
      ['complex.ts', 'simple.ts'],
      [COMPLEX_CONTENT, SIMPLE_CONTENT],
    )
    expect(result.stats.highestPeak).toBeTruthy()
  })

  it('identifies largest territory', () => {
    const result = buildCartographerResult(
      ['small.ts', 'big.ts'],
      ['x\n', COMPLEX_CONTENT],
    )
    expect(result.stats.largestTerritory).toBe('big.ts')
  })

  it('generates legend with all biomes', () => {
    const result = buildCartographerResult(['a.ts'], [SIMPLE_CONTENT])
    expect(Object.keys(result.legend)).toContain('desert')
    expect(Object.keys(result.legend)).toContain('forest')
    expect(Object.keys(result.legend)).toContain('mountain')
    expect(Object.keys(result.legend)).toContain('oasis')
    expect(Object.keys(result.legend)).toContain('plains')
  })

  it('counts biome types', () => {
    const result = buildCartographerResult(['a.ts', 'b.ts', 'c.ts'], [
      SIMPLE_CONTENT, COMPLEX_CONTENT, WELL_DOCUMENTED,
    ])
    const total = result.stats.desertCount + result.stats.forestCount + result.stats.mountainCount + result.stats.oasisCount + result.stats.plainsCount
    expect(total).toBe(3)
  })

  it('generates recommendations', () => {
    const result = buildCartographerResult(['a.ts'], [SIMPLE_CONTENT])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes map completeness', () => {
    const result = buildCartographerResult(['a.ts'], [COMPLEX_CONTENT])
    expect(result.stats.mapCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.stats.mapCompleteness).toBeLessThanOrEqual(100)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getBiomeColor', () => {
  it('returns function for all biomes', () => {
    expect(typeof getBiomeColor('desert')).toBe('function')
    expect(typeof getBiomeColor('forest')).toBe('function')
    expect(typeof getBiomeColor('mountain')).toBe('function')
    expect(typeof getBiomeColor('oasis')).toBe('function')
    expect(typeof getBiomeColor('plains')).toBe('function')
  })
})

describe('getBiomeSymbol', () => {
  it('returns unique symbols per biome', () => {
    const symbols = new Set(['desert', 'forest', 'mountain', 'oasis', 'plains'].map(getBiomeSymbol))
    expect(symbols.size).toBe(5)
  })
})

describe('formatTerritoryMap', () => {
  it('formats map', () => {
    const result = buildCartographerResult(['a.ts'], [SIMPLE_CONTENT])
    const output = formatTerritoryMap(result.territories)
    expect(output).toContain('Territory Map')
  })

  it('handles empty', () => {
    expect(formatTerritoryMap([])).toContain('No territories')
  })
})

describe('formatElevationProfile', () => {
  it('formats profile', () => {
    const result = buildCartographerResult(['a.ts'], [COMPLEX_CONTENT])
    const output = formatElevationProfile(result.territories)
    expect(output).toContain('Elevation Profile')
  })

  it('handles empty', () => {
    expect(formatElevationProfile([])).toContain('No elevation')
  })
})

describe('formatBiomeDistribution', () => {
  it('formats distribution', () => {
    const result = buildCartographerResult(['a.ts'], [COMPLEX_CONTENT])
    const output = formatBiomeDistribution(result.territories)
    expect(output).toContain('Biome Distribution')
  })
})

describe('formatRegionOverview', () => {
  it('formats regions', () => {
    const result = buildCartographerResult(['src/a.ts'], [SIMPLE_CONTENT])
    const output = formatRegionOverview(result.regions)
    expect(output).toContain('Regions')
  })
})

describe('formatLegend', () => {
  it('formats legend', () => {
    const output = formatLegend({ desert: 'sparse', forest: 'dense' })
    expect(output).toContain('Legend')
    expect(output).toContain('sparse')
  })
})

describe('formatCartographerStats', () => {
  it('formats all stats', () => {
    const stats = {
      totalTerritories: 10, totalRegions: 3, totalArea: 500, avgElevation: 42,
      highestPeak: 'complex.ts', largestTerritory: 'big.ts', mostConnected: 'hub.ts',
      desertCount: 2, forestCount: 3, mountainCount: 1, oasisCount: 0, plainsCount: 4,
      totalRivers: 25, mapCompleteness: 78,
    }
    const output = formatCartographerStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('78%')
    expect(output).toContain('complex.ts')
  })
})

describe('formatCartographerRecommendations', () => {
  it('formats recommendations', () => {
    const output = formatCartographerRecommendations(['Fix this'])
    expect(output).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatCartographerRecommendations([])).toContain('No recommendations')
  })
})

describe('formatCartographerTable', () => {
  it('formats full table', () => {
    const result = buildCartographerResult(['src/a.ts'], [COMPLEX_CONTENT])
    const output = formatCartographerTable(result)
    expect(output).toContain('Code Cartographer')
    expect(output).toContain('Territory Map')
    expect(output).toContain('Elevation Profile')
    expect(output).toContain('Legend')
  })
})

describe('formatCartographerJSON', () => {
  it('formats valid JSON', () => {
    const result = buildCartographerResult(['a.ts'], [SIMPLE_CONTENT])
    const json = formatCartographerJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.territories).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.legend).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('maps a realistic codebase', () => {
    const result = buildCartographerResult(
      ['src/commands/a.ts', 'src/commands/b.ts', 'src/core/c.ts'],
      [COMPLEX_CONTENT, SIMPLE_CONTENT, WELL_DOCUMENTED],
    )
    expect(result.territories.length).toBe(3)
    expect(result.regions.length).toBe(2)
    expect(result.stats.totalRivers).toBeGreaterThan(0)
    expect(result.stats.mapCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles single file', () => {
    const result = buildCartographerResult(['a.ts'], [COMPLEX_CONTENT])
    expect(result.territories.length).toBe(1)
    expect(result.stats.totalTerritories).toBe(1)
    expect(result.stats.highestPeak).toBe('a.ts')
    expect(result.stats.largestTerritory).toBe('a.ts')
    expect(result.stats.mostConnected).toBe('a.ts')
  })

  it('round-trips through JSON', () => {
    const result = buildCartographerResult(['a.ts'], [COMPLEX_CONTENT])
    const json = formatCartographerJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.territories.length).toBe(result.territories.length)
    expect(parsed.stats.totalTerritories).toBe(result.stats.totalTerritories)
  })
})
