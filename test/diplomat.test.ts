import { describe, expect, it } from 'vitest'

import {
  buildDiplomatResult,
  computeDiplomaticHealth,
  computeOpenness,
  countPrivateMembers,
  detectTensions,
  discoverTreaties,
  extractExportedNames,
  extractImportNames,
  extractImportPaths,
  extractTypeDefinitions,
  formAlliances,
  generateDiplomatRecommendations,
  mapNations,
  type DiplomatStats,
  type Nation,
  type Tension,
  type Treaty,
} from '../src/commands/diplomat-helpers.js'

import {
  formatAllianceGraph,
  formatDiplomatJSON,
  formatDiplomatRecommendations,
  formatDiplomatStats,
  formatDiplomatTable,
  formatOpennessChart,
  formatTensionHeatmap,
  formatTreatyTable,
  formatWorldMap,
} from '../src/commands/diplomat-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TYPED_MODULE = `import { Command, Flags } from '@oclif/core'
import { Config, Options } from './types'

/**
 * Process data with config.
 */
export function processData(config: Config): string {
  return config.name
}

/**
 * Validate input.
 */
export function validate(input: string): boolean {
  return input.length > 0
}

function internalHelper(): void {}
`

const TYPES_MODULE = `export interface Config {
  name: string
  version: string
  debug: boolean
}

export interface Options {
  verbose?: boolean
  output?: string
}

export type Result = {
  success: boolean
  data?: string
}
`

const MESSY_MODULE = `import { x } from './a'
import { y } from './a'
import { z } from './a'
import { w } from './a'
import { v } from './a'
import { u } from './a'
const result = processData({} as any)
console.log(result)
`

const IMPORTING_MODULE = `import { Config, Options } from './types'
import { processData } from './processor'

export function run(config: Config, opts: Options): void {
  processData(config)
}
`

const EMPTY_CONTENT = ''

// ─── extractExportedNames ─────────────────────────────────────────────────────

describe('extractExportedNames', () => {
  it('extracts function exports', () => {
    expect(extractExportedNames('export function foo() {}')).toContain('foo')
  })

  it('extracts class exports', () => {
    expect(extractExportedNames('export class Bar {}')).toContain('Bar')
  })

  it('extracts const exports', () => {
    expect(extractExportedNames('export const x = 1')).toContain('x')
  })

  it('extracts type exports', () => {
    expect(extractExportedNames('export type Config = {}')).toContain('Config')
  })

  it('extracts interface exports', () => {
    expect(extractExportedNames('export interface Options {}')).toContain('Options')
  })

  it('deduplicates', () => {
    const names = extractExportedNames('export function foo() {}\nexport function foo() {}')
    expect(names.filter((n) => n === 'foo').length).toBe(1)
  })

  it('returns empty for no exports', () => {
    expect(extractExportedNames('const x = 1')).toEqual([])
  })
})

// ─── extractImportPaths ───────────────────────────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts import paths', () => {
    expect(extractImportPaths("import { x } from './foo'")).toContain('./foo')
  })

  it('extracts side-effect imports', () => {
    expect(extractImportPaths("import './polyfill'")).toContain('./polyfill')
  })

  it('extracts multiple imports', () => {
    const paths = extractImportPaths("import { a } from 'x'\nimport { b } from 'y'")
    expect(paths.length).toBe(2)
  })

  it('returns empty for no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })
})

// ─── extractImportNames ───────────────────────────────────────────────────────

describe('extractImportNames', () => {
  it('extracts destructured import names', () => {
    expect(extractImportNames("import { foo, bar } from 'x'")).toContain('foo')
    expect(extractImportNames("import { foo, bar } from 'x'")).toContain('bar')
  })

  it('handles aliased imports', () => {
    expect(extractImportNames("import { foo as bar } from 'x'")).toContain('foo')
  })

  it('returns empty for no destructured imports', () => {
    expect(extractImportNames("import chalk from 'chalk'")).toEqual([])
  })
})

// ─── countPrivateMembers ──────────────────────────────────────────────────────

describe('countPrivateMembers', () => {
  it('counts non-exported functions', () => {
    expect(countPrivateMembers('function foo() {}')).toBe(1)
  })

  it('excludes exported functions', () => {
    expect(countPrivateMembers('export function foo() {}')).toBe(0)
  })

  it('counts non-exported classes', () => {
    expect(countPrivateMembers('class Foo {}')).toBe(1)
  })

  it('counts mixed', () => {
    expect(countPrivateMembers('function a() {}\nexport function b() {}\nclass C {}')).toBe(2)
  })

  it('returns 0 for empty', () => {
    expect(countPrivateMembers('')).toBe(0)
  })
})

// ─── extractTypeDefinitions ───────────────────────────────────────────────────

describe('extractTypeDefinitions', () => {
  it('extracts interfaces', () => {
    const types = extractTypeDefinitions('export interface Config { name: string; version: number }')
    expect(types.length).toBe(1)
    expect(types[0]!.name).toBe('Config')
    expect(types[0]!.isPublic).toBe(true)
  })

  it('extracts type aliases', () => {
    const types = extractTypeDefinitions('export type Result = string | number')
    expect(types.some((t) => t.name === 'Result')).toBe(true)
  })

  it('detects strict interfaces', () => {
    const types = extractTypeDefinitions('interface Foo { x: number; y: string }')
    const foo = types.find((t) => t.name === 'Foo')!
    expect(foo.isStrict).toBe(true)
  })

  it('detects loose interfaces with optional', () => {
    const types = extractTypeDefinitions('interface Foo { x?: number }')
    const foo = types.find((t) => t.name === 'Foo')!
    expect(foo.isStrict).toBe(false)
  })

  it('detects private interfaces', () => {
    const types = extractTypeDefinitions('interface Internal { x: number }')
    const internal = types.find((t) => t.name === 'Internal')!
    expect(internal.isPublic).toBe(false)
  })

  it('returns empty for no types', () => {
    expect(extractTypeDefinitions('const x = 1')).toEqual([])
  })
})

// ─── computeOpenness ──────────────────────────────────────────────────────────

describe('computeOpenness', () => {
  it('returns 100 for all exports', () => {
    expect(computeOpenness(5, 0)).toBe(100)
  })

  it('returns 0 for all private', () => {
    expect(computeOpenness(0, 5)).toBe(0)
  })

  it('computes ratio', () => {
    expect(computeOpenness(3, 7)).toBe(30)
  })

  it('returns 100 for empty module', () => {
    expect(computeOpenness(0, 0)).toBe(100)
  })
})

// ─── mapNations ───────────────────────────────────────────────────────────────

describe('mapNations', () => {
  it('maps files to nations', () => {
    const nations = mapNations(['processor.ts'], [TYPED_MODULE])
    expect(nations.length).toBe(1)
    expect(nations[0]!.name).toBe('processor.ts')
  })

  it('extracts exports', () => {
    const nations = mapNations(['a.ts'], [TYPED_MODULE])
    expect(nations[0]!.exports).toContain('processData')
    expect(nations[0]!.exports).toContain('validate')
  })

  it('extracts imports', () => {
    const nations = mapNations(['a.ts'], [TYPED_MODULE])
    expect(nations[0]!.imports.length).toBeGreaterThan(0)
  })

  it('computes openness', () => {
    const nations = mapNations(['a.ts'], [TYPED_MODULE])
    expect(nations[0]!.openness).toBeGreaterThan(0)
  })

  it('computes gdp (line count)', () => {
    const nations = mapNations(['a.ts'], [TYPED_MODULE])
    expect(nations[0]!.gdp).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const nations = mapNations(['a.ts'], [EMPTY_CONTENT])
    expect(nations[0]!.exports).toEqual([])
    expect(nations[0]!.openness).toBe(100)
  })
})

// ─── discoverTreaties ─────────────────────────────────────────────────────────

describe('discoverTreaties', () => {
  it('discovers type treaties', () => {
    const treaties = discoverTreaties(['types.ts'], [TYPES_MODULE])
    expect(treaties.length).toBeGreaterThan(0)
    expect(treaties.some((t) => t.name === 'Config')).toBe(true)
  })

  it('tracks signatories across files', () => {
    const treaties = discoverTreaties(
      ['types.ts', 'processor.ts'],
      [TYPES_MODULE, IMPORTING_MODULE],
    )
    const config = treaties.find((t) => t.name === 'Config')
    expect(config).toBeDefined()
    expect(config!.signatories.length).toBeGreaterThanOrEqual(1)
  })

  it('computes treaty strength', () => {
    const treaties = discoverTreaties(['types.ts'], [TYPES_MODULE])
    for (const t of treaties) {
      expect(t.strength).toBeGreaterThanOrEqual(0)
      expect(t.strength).toBeLessThanOrEqual(100)
    }
  })

  it('detects public treaties', () => {
    const treaties = discoverTreaties(['types.ts'], [TYPES_MODULE])
    const publicTreaties = treaties.filter((t) => t.isPublic)
    expect(publicTreaties.length).toBeGreaterThan(0)
  })

  it('returns empty for no types', () => {
    expect(discoverTreaties(['a.ts'], ['const x = 1'])).toEqual([])
  })
})

// ─── formAlliances ────────────────────────────────────────────────────────────

describe('formAlliances', () => {
  it('forms alliances from shared treaties', () => {
    const nations = mapNations(['types.ts', 'processor.ts'], [TYPES_MODULE, IMPORTING_MODULE])
    const treaties = discoverTreaties(['types.ts', 'processor.ts'], [TYPES_MODULE, IMPORTING_MODULE])
    const alliances = formAlliances(nations, treaties)
    expect(alliances.length).toBeGreaterThanOrEqual(0)
  })

  it('requires 2+ signatories for alliance', () => {
    const nations = mapNations(['types.ts'], [TYPES_MODULE])
    const treaties = discoverTreaties(['types.ts'], [TYPES_MODULE])
    const alliances = formAlliances(nations, treaties)
    expect(alliances.every((a) => a.members.length >= 2)).toBe(true)
  })
})

// ─── detectTensions ───────────────────────────────────────────────────────────

describe('detectTensions', () => {
  it('detects type-mismatch (as any)', () => {
    const nations = mapNations(['a.ts'], [MESSY_MODULE])
    const tensions = detectTensions(nations, [], [MESSY_MODULE])
    const typeMismatch = tensions.find((t) => t.type === 'type-mismatch')
    expect(typeMismatch).toBeDefined()
    expect(typeMismatch!.severity).toBe('high')
  })

  it('detects missing documentation', () => {
    const content = 'export function a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}'
    const nations = mapNations(['a.ts'], [content])
    const tensions = detectTensions(nations, [], [content])
    const missingDoc = tensions.find((t) => t.type === 'missing-documentation')
    expect(missingDoc).toBeDefined()
  })

  it('returns empty for clean code', () => {
    const nations = mapNations(['a.ts'], [TYPED_MODULE])
    const tensions = detectTensions(nations, [], [TYPED_MODULE])
    const high = tensions.filter((t) => t.severity === 'high')
    expect(high.length).toBe(0)
  })
})

// ─── computeDiplomaticHealth ──────────────────────────────────────────────────

describe('computeDiplomaticHealth', () => {
  it('returns 100 for clean codebase', () => {
    const nations: Nation[] = [{ file: 'a.ts', name: 'a.ts', exports: ['foo'], imports: [], privateMembers: 0, gdp: 10, openness: 100, allies: [], tensions: [] }]
    const treaties: Treaty[] = [{ name: 'Config', signatories: ['a.ts', 'b.ts'], articles: 3, isPublic: true, isStrict: true, strength: 80 }]
    expect(computeDiplomaticHealth(nations, treaties, [])).toBe(100)
  })

  it('penalizes no treaties with multiple nations', () => {
    const nations: Nation[] = [
      { file: 'a.ts', name: 'a.ts', exports: [], imports: [], privateMembers: 5, gdp: 10, openness: 0, allies: [], tensions: [] },
      { file: 'b.ts', name: 'b.ts', exports: [], imports: [], privateMembers: 5, gdp: 10, openness: 0, allies: [], tensions: [] },
    ]
    expect(computeDiplomaticHealth(nations, [], [])).toBeLessThan(100)
  })

  it('penalizes high tensions', () => {
    const nations: Nation[] = [{ file: 'a.ts', name: 'a.ts', exports: ['x'], imports: [], privateMembers: 0, gdp: 10, openness: 100, allies: [], tensions: [] }]
    const tensions: Tension[] = [{ between: ['a.ts', 'b.ts'], type: 'type-mismatch', severity: 'high', description: '', resolution: '' }]
    expect(computeDiplomaticHealth(nations, [], tensions)).toBeLessThan(100)
  })

  it('returns 100 for empty codebase', () => {
    expect(computeDiplomaticHealth([], [], [])).toBe(100)
  })
})

// ─── generateDiplomatRecommendations ──────────────────────────────────────────

describe('generateDiplomatRecommendations', () => {
  it('warns about high tensions', () => {
    const stats = { highTensions: 3 } as DiplomatStats
    const recs = generateDiplomatRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('high-severity'))).toBe(true)
  })

  it('warns about closed nations', () => {
    const nations: Nation[] = [{ file: 'a.ts', name: 'a.ts', exports: [], imports: [], privateMembers: 10, gdp: 10, openness: 0, allies: [], tensions: [] }]
    const stats = { highTensions: 0 } as DiplomatStats
    const recs = generateDiplomatRecommendations(nations, [], [], stats)
    expect(recs.some((r) => r.includes('closed'))).toBe(true)
  })

  it('warns about no treaties', () => {
    const nations: Nation[] = [
      { file: 'a.ts', name: 'a.ts', exports: ['x'], imports: [], privateMembers: 0, gdp: 10, openness: 100, allies: [], tensions: [] },
      { file: 'b.ts', name: 'b.ts', exports: ['y'], imports: [], privateMembers: 0, gdp: 10, openness: 100, allies: [], tensions: [] },
    ]
    const stats = { highTensions: 0 } as DiplomatStats
    const recs = generateDiplomatRecommendations(nations, [], [], stats)
    expect(recs.some((r) => r.includes('treat'))).toBe(true)
  })

  it('praises strong relations', () => {
    const stats = { highTensions: 0, diplomaticHealth: 90 } as DiplomatStats
    const recs = generateDiplomatRecommendations([{ file: 'a.ts', name: 'a.ts', exports: ['x'], imports: [], privateMembers: 0, gdp: 10, openness: 100, allies: [], tensions: [] }], [{ name: 'T', signatories: ['a.ts'], articles: 1, isPublic: true, isStrict: true, strength: 80 }], [], stats)
    expect(recs.some((r) => r.includes('strong'))).toBe(true)
  })
})

// ─── buildDiplomatResult ──────────────────────────────────────────────────────

describe('buildDiplomatResult', () => {
  it('builds complete result', () => {
    const result = buildDiplomatResult(
      ['types.ts', 'processor.ts'],
      [TYPES_MODULE, TYPED_MODULE],
    )
    expect(result.nations.length).toBe(2)
    expect(result.treaties.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildDiplomatResult([], [])
    expect(result.nations).toEqual([])
    expect(result.stats.diplomaticHealth).toBe(100)
  })

  it('computes stats correctly', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    expect(result.stats.nationCount).toBe(1)
    expect(result.stats.diplomaticHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.diplomaticHealth).toBeLessThanOrEqual(100)
  })

  it('generates recommendations', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('identifies weakest link', () => {
    const result = buildDiplomatResult(['messy.ts'], [MESSY_MODULE])
    expect(result.stats.weakestLink).toBeTruthy()
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatWorldMap', () => {
  it('formats map', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    const output = formatWorldMap(result.nations)
    expect(output).toContain('Diplomatic World Map')
  })

  it('handles empty', () => {
    expect(formatWorldMap([])).toContain('No nations')
  })
})

describe('formatTreatyTable', () => {
  it('formats treaties', () => {
    const treaties: Treaty[] = [{ name: 'Config', signatories: ['a.ts'], articles: 3, isPublic: true, isStrict: true, strength: 80 }]
    expect(formatTreatyTable(treaties)).toContain('Treaties')
  })

  it('handles empty', () => {
    expect(formatTreatyTable([])).toContain('No treaties')
  })
})

describe('formatTensionHeatmap', () => {
  it('formats tensions', () => {
    const tensions: Tension[] = [{ between: ['a.ts', 'b.ts'], type: 'type-mismatch', severity: 'high', description: '', resolution: '' }]
    expect(formatTensionHeatmap(tensions)).toContain('Tensions')
  })

  it('shows peaceful for none', () => {
    expect(formatTensionHeatmap([])).toContain('peaceful')
  })
})

describe('formatAllianceGraph', () => {
  it('formats alliances', () => {
    const result = buildDiplomatResult(['types.ts', 'processor.ts'], [TYPES_MODULE, IMPORTING_MODULE])
    const output = formatAllianceGraph(result.alliances)
    if (result.alliances.length > 0) {
      expect(output).toContain('Alliances')
    }
  })
})

describe('formatDiplomaticHealthMeter', () => {
  it('formats meter', async () => {
    const { formatDiplomaticHealthMeter: fmtMeter } = await import('../src/commands/diplomat-format-helpers.js')
    expect(fmtMeter(75)).toContain('75%')
  })
})

describe('formatOpennessChart', () => {
  it('formats chart', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    expect(formatOpennessChart(result.nations)).toContain('Openness Chart')
  })
})

describe('formatDiplomatStats', () => {
  it('formats stats', () => {
    const stats: DiplomatStats = {
      nationCount: 5, treatyCount: 3, allianceCount: 2, tensionCount: 1,
      highTensions: 0, avgOpenness: 70, diplomaticHealth: 85,
      strongestAlliance: 'a + b', weakestLink: 'c.ts',
    }
    const output = formatDiplomatStats(stats)
    expect(output).toContain('5')
    expect(output).toContain('85%')
  })
})

describe('formatDiplomatRecommendations', () => {
  it('formats recommendations', () => {
    expect(formatDiplomatRecommendations(['Fix this'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatDiplomatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatDiplomatTable', () => {
  it('formats full table', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    const output = formatDiplomatTable(result)
    expect(output).toContain('Code Diplomat')
    expect(output).toContain('Diplomatic World Map')
  })
})

describe('formatDiplomatJSON', () => {
  it('formats valid JSON', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    const json = formatDiplomatJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.nations).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes a realistic codebase', () => {
    const result = buildDiplomatResult(
      ['types.ts', 'processor.ts', 'runner.ts'],
      [TYPES_MODULE, TYPED_MODULE, IMPORTING_MODULE],
    )
    expect(result.nations.length).toBe(3)
    expect(result.treaties.length).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('round-trips through JSON', () => {
    const result = buildDiplomatResult(['a.ts'], [TYPED_MODULE])
    const json = formatDiplomatJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.nations.length).toBe(result.nations.length)
    expect(parsed.stats.diplomaticHealth).toBe(result.stats.diplomaticHealth)
  })
})
