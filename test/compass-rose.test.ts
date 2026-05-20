import { describe, expect, it } from 'vitest'

import {
  buildCompassRoseResult,
  classifyCardinalDirection,
  computeAbstraction,
  computeBearing,
  computeConsistency,
  computeConsolidation,
  computeDrift,
  computeExpansion,
  computeFlowVector,
  computeImplementation,
  computeNavigability,
  countImportedBy,
  extractImports,
  findMagneticNorth,
  generateRecommendations,
  identifyAnchors,
  identifyWinds,
  resolveImportPath,
  type CompassReading,
  type CompassRoseStats,
  type FlowVector,
} from '../src/commands/compass-rose-helpers.js'
import {
  formatCompassRoseDiagram,
  formatCompassRoseJson,
  formatCompassRoseTable,
  formatDirectionDistribution,
  formatFlowArrows,
  formatHeadingTable,
  formatMagneticNorth,
  formatRecommendations,
} from '../src/commands/compass-rose-format-helpers.js'

// ─── computeAbstraction ────────────────────────────────────────────────────────

describe('computeAbstraction', () => {
  it('returns 0 for empty string', () => {
    expect(computeAbstraction('')).toBe(0)
  })

  it('returns 0 for whitespace', () => {
    expect(computeAbstraction('   ')).toBe(0)
  })

  it('returns high for interface-heavy content', () => {
    const content = `export interface Foo { name: string; age: number }
export interface Bar { id: string }
export interface Baz { value: boolean }`
    expect(computeAbstraction(content)).toBeGreaterThan(20)
  })

  it('returns high for type definitions', () => {
    const content = `export type Result = { ok: boolean; data: string }
export type Config = { port: number; host: string }
export type Status = 'active' | 'inactive'`
    expect(computeAbstraction(content)).toBeGreaterThan(10)
  })

  it('returns low for concrete implementation', () => {
    const content = `function add(a: number, b: number) { return a + b }
function mul(a: number, b: number) { return a * b }`
    expect(computeAbstraction(content)).toBeLessThan(computeAbstraction('export interface Foo { name: string }'))
  })

  it('handles abstract class', () => {
    const content = 'export abstract class Base { abstract doWork(): void }'
    expect(computeAbstraction(content)).toBeGreaterThan(0)
  })

  it('handles enums', () => {
    const content = 'export enum Direction { North, South, East, West }'
    expect(computeAbstraction(content)).toBeGreaterThan(0)
  })

  it('clamps to 0-100', () => {
    const result = computeAbstraction('interface A {} interface B {} interface C {}')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computeImplementation ─────────────────────────────────────────────────────

describe('computeImplementation', () => {
  it('returns 0 for empty string', () => {
    expect(computeImplementation('')).toBe(0)
  })

  it('returns high for function-heavy content', () => {
    const content = `function add(a: number, b: number) { return a + b }
function mul(a: number, b: number) { return a * b }
function div(a: number, b: number) { if (b === 0) throw new Error('div0'); return a / b }`
    expect(computeImplementation(content)).toBeGreaterThan(10)
  })

  it('returns high for arrow functions', () => {
    const content = `const add = (a: number, b: number) => a + b
const mul = (a: number, b: number) => a * b`
    expect(computeImplementation(content)).toBeGreaterThan(0)
  })

  it('returns low for interfaces', () => {
    const content = 'export interface Foo { name: string }'
    expect(computeImplementation(content)).toBeLessThan(computeImplementation('function foo() { return 1 }'))
  })

  it('counts control flow', () => {
    const content = `function process(items: number[]) {
  for (const item of items) {
    if (item > 0) {
      try { console.log(item) } catch { /* skip */ }
    }
  }
}`
    expect(computeImplementation(content)).toBeGreaterThan(0)
  })

  it('clamps to 0-100', () => {
    const result = computeImplementation('function f() {} function g() {} function h() {}')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computeExpansion ──────────────────────────────────────────────────────────

describe('computeExpansion', () => {
  it('returns 0 for empty string', () => {
    expect(computeExpansion('')).toBe(0)
  })

  it('returns high for TODO-heavy content', () => {
    const content = `// TODO: implement this
// FIXME: broken
// HACK: workaround
function foo() {}`
    expect(computeExpansion(content)).toBeGreaterThan(0)
  })

  it('counts any types as expansion signals', () => {
    const content = `function foo(x: any): any { return x }`
    expect(computeExpansion(content)).toBeGreaterThan(0)
  })

  it('counts console statements', () => {
    const content = `console.log('debug'); console.error('err');`
    expect(computeExpansion(content)).toBeGreaterThan(0)
  })

  it('counts exports and imports', () => {
    const content = `export function foo() {}
import { bar } from './bar'
export { baz } from './baz'`
    expect(computeExpansion(content)).toBeGreaterThan(0)
  })

  it('clamps to 0-100', () => {
    expect(computeExpansion('TODO TODO TODO FIXME FIXME FIXME')).toBeLessThanOrEqual(100)
  })
})

// ─── computeConsolidation ──────────────────────────────────────────────────────

describe('computeConsolidation', () => {
  it('returns 0 for empty string', () => {
    expect(computeConsolidation('')).toBe(0)
  })

  it('returns high for well-documented content', () => {
    const content = `/**
 * Adds two numbers.
 * @param a First number
 * @param b Second number
 * @returns Sum
 * @example
 * add(1, 2) // 3
 */
function add(a: number, b: number) { return a + b }`
    expect(computeConsolidation(content)).toBeGreaterThan(0)
  })

  it('counts readonly modifiers', () => {
    const content = 'const config: { readonly name: string; readonly value: number } = { name: "a", value: 1 }'
    expect(computeConsolidation(content)).toBeGreaterThan(0)
  })

  it('penalizes any types', () => {
    const good = computeConsolidation('const x: string = "hello"')
    const bad = computeConsolidation('const x: any = "hello"')
    expect(good).toBeGreaterThanOrEqual(bad)
  })

  it('penalizes TODOs', () => {
    const good = computeConsolidation('const x = 1')
    const bad = computeConsolidation('const x = 1 // TODO: refactor')
    expect(good).toBeGreaterThanOrEqual(bad)
  })

  it('clamps to 0-100', () => {
    expect(computeConsolidation('/** docs */\nconst x = 1')).toBeLessThanOrEqual(100)
  })
})

// ─── computeBearing ────────────────────────────────────────────────────────────

describe('computeBearing', () => {
  it('returns 0 for pure abstraction', () => {
    expect(computeBearing(100, 0, 0, 0)).toBeCloseTo(0, 1)
  })

  it('returns ~180 for pure implementation', () => {
    expect(computeBearing(0, 100, 0, 0)).toBeCloseTo(180, 1)
  })

  it('returns ~90 for pure expansion', () => {
    expect(computeBearing(0, 0, 100, 0)).toBeCloseTo(90, 1)
  })

  it('returns ~270 for pure consolidation', () => {
    expect(computeBearing(0, 0, 0, 100)).toBeCloseTo(270, 1)
  })

  it('returns 0-360 range', () => {
    const bearing = computeBearing(50, 30, 60, 20)
    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThanOrEqual(360)
  })

  it('handles balanced values', () => {
    const bearing = computeBearing(50, 50, 50, 50)
    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThanOrEqual(360)
  })
})

// ─── classifyCardinalDirection ─────────────────────────────────────────────────

describe('classifyCardinalDirection', () => {
  it('classifies North', () => {
    expect(classifyCardinalDirection(0)).toBe('N')
    expect(classifyCardinalDirection(350)).toBe('N')
    expect(classifyCardinalDirection(10)).toBe('N')
  })

  it('classifies NE', () => {
    expect(classifyCardinalDirection(45)).toBe('NE')
    expect(classifyCardinalDirection(30)).toBe('NE')
    expect(classifyCardinalDirection(60)).toBe('NE')
  })

  it('classifies East', () => {
    expect(classifyCardinalDirection(90)).toBe('E')
    expect(classifyCardinalDirection(80)).toBe('E')
    expect(classifyCardinalDirection(100)).toBe('E')
  })

  it('classifies SE', () => {
    expect(classifyCardinalDirection(135)).toBe('SE')
    expect(classifyCardinalDirection(120)).toBe('SE')
    expect(classifyCardinalDirection(150)).toBe('SE')
  })

  it('classifies South', () => {
    expect(classifyCardinalDirection(180)).toBe('S')
    expect(classifyCardinalDirection(190)).toBe('S')
    expect(classifyCardinalDirection(170)).toBe('S')
  })

  it('classifies SW', () => {
    expect(classifyCardinalDirection(225)).toBe('SW')
    expect(classifyCardinalDirection(210)).toBe('SW')
    expect(classifyCardinalDirection(240)).toBe('SW')
  })

  it('classifies West', () => {
    expect(classifyCardinalDirection(270)).toBe('W')
    expect(classifyCardinalDirection(260)).toBe('W')
    expect(classifyCardinalDirection(280)).toBe('W')
  })

  it('classifies NW', () => {
    expect(classifyCardinalDirection(315)).toBe('NW')
    expect(classifyCardinalDirection(300)).toBe('NW')
    expect(classifyCardinalDirection(330)).toBe('NW')
  })

  it('handles 360', () => {
    expect(classifyCardinalDirection(360)).toBe('N')
  })

  it('handles negative bearings', () => {
    expect(classifyCardinalDirection(-10)).toBe('N')
    expect(classifyCardinalDirection(-90)).toBe('W')
  })
})

// ─── extractImports ────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts standard imports', () => {
    const content = "import { foo } from './bar'"
    expect(extractImports(content)).toEqual(['./bar'])
  })

  it('extracts multiple imports', () => {
    const content = `import { foo } from './a'
import { bar } from './b'`
    expect(extractImports(content)).toEqual(['./a', './b'])
  })

  it('extracts default imports', () => {
    const content = "import react from 'react'"
    expect(extractImports(content)).toEqual(['react'])
  })

  it('extracts namespace imports', () => {
    const content = "import * as fs from 'node:fs'"
    expect(extractImports(content)).toEqual(['node:fs'])
  })

  it('extracts dynamic imports', () => {
    const content = "const mod = import('./module')"
    expect(extractImports(content)).toEqual(['./module'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── resolveImportPath ─────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves exact path', () => {
    expect(resolveImportPath('src/a.ts', new Set(['src/a.ts', 'src/b.ts']))).toBe('src/a.ts')
  })

  it('resolves with .ts extension', () => {
    expect(resolveImportPath('./utils', new Set(['utils.ts']))).toBe('utils.ts')
  })

  it('resolves with .js extension', () => {
    expect(resolveImportPath('./utils', new Set(['utils.js']))).toBe('utils.js')
  })

  it('resolves index files', () => {
    expect(resolveImportPath('./utils', new Set(['utils/index.ts']))).toBe('utils/index.ts')
  })

  it('strips ./ prefix', () => {
    expect(resolveImportPath('./utils', new Set(['utils.ts']))).toBe('utils.ts')
  })

  it('returns null for unknown', () => {
    expect(resolveImportPath('./unknown', new Set(['a.ts']))).toBeNull()
  })

  it('returns null for empty set', () => {
    expect(resolveImportPath('./foo', new Set())).toBeNull()
  })
})

// ─── computeFlowVector ─────────────────────────────────────────────────────────

describe('computeFlowVector', () => {
  it('creates flow vector', () => {
    const flow = computeFlowVector('a.ts', 'b.ts', 'dependency')
    expect(flow.from).toBe('a.ts')
    expect(flow.to).toBe('b.ts')
    expect(flow.type).toBe('dependency')
    expect(flow.magnitude).toBeGreaterThanOrEqual(50)
    expect(flow.magnitude).toBeLessThanOrEqual(100)
  })

  it('creates data flow', () => {
    const flow = computeFlowVector('x.ts', 'y.ts', 'data')
    expect(flow.type).toBe('data')
  })

  it('creates control flow', () => {
    const flow = computeFlowVector('x.ts', 'y.ts', 'control')
    expect(flow.type).toBe('control')
  })
})

// ─── identifyWinds ─────────────────────────────────────────────────────────────

describe('identifyWinds', () => {
  it('detects high outgoing dependency', () => {
    const winds = identifyWinds('file.ts', ['a', 'b', 'c', 'd'], [])
    expect(winds).toContain('high-outgoing-dependency')
  })

  it('detects high incoming dependency', () => {
    const winds = identifyWinds('file.ts', [], ['a', 'b', 'c', 'd'])
    expect(winds).toContain('high-incoming-dependency')
  })

  it('detects isolated file', () => {
    const winds = identifyWinds('file.ts', [], [])
    expect(winds).toContain('isolated')
  })

  it('detects bidirectional flow', () => {
    const winds = identifyWinds('file.ts', ['a'], ['b'])
    expect(winds).toContain('bidirectional-flow')
  })

  it('always includes file-specific wind', () => {
    const winds = identifyWinds('utils.ts', [], [])
    expect(winds).toContain('utils.ts-flow')
  })
})

// ─── identifyAnchors ───────────────────────────────────────────────────────────

describe('identifyAnchors', () => {
  it('returns anchors for stable imports', () => {
    const anchors = identifyAnchors('file.ts', ['stable.ts'])
    expect(anchors.length).toBeGreaterThan(0)
  })

  it('returns empty for no stable imports', () => {
    expect(identifyAnchors('file.ts', [])).toEqual([])
  })

  it('limits to 5 anchors', () => {
    const anchors = identifyAnchors('file.ts', ['a', 'b', 'c', 'd', 'e', 'f', 'g'])
    expect(anchors.length).toBeLessThanOrEqual(5)
  })
})

// ─── computeDrift ──────────────────────────────────────────────────────────────

describe('computeDrift', () => {
  it('returns 0 for same heading', () => {
    expect(computeDrift(90, 90)).toBe(0)
  })

  it('computes small drift', () => {
    expect(computeDrift(100, 90)).toBe(10)
  })

  it('handles wrap-around drift', () => {
    expect(computeDrift(10, 350)).toBe(20)
  })

  it('handles large drift', () => {
    expect(computeDrift(180, 0)).toBe(180)
  })
})

// ─── countImportedBy ───────────────────────────────────────────────────────────

describe('countImportedBy', () => {
  it('counts importers', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [
      "import { foo } from './b'",
      "export const foo = 1",
      "// no imports",
    ]
    expect(countImportedBy(files, contents, 'b.ts')).toBe(1)
  })

  it('returns 0 for no importers', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['// no imports', '// no imports']
    expect(countImportedBy(files, contents, 'a.ts')).toBe(0)
  })

  it('does not count self-import', () => {
    const files = ['a.ts']
    const contents = ["import { x } from './a'"]
    expect(countImportedBy(files, contents, 'a.ts')).toBe(0)
  })
})

// ─── findMagneticNorth ─────────────────────────────────────────────────────────

describe('findMagneticNorth', () => {
  it('returns empty for no files', () => {
    expect(findMagneticNorth([], [])).toBe('')
  })

  it('returns first file for single file', () => {
    expect(findMagneticNorth(['a.ts'], ['interface Foo {}'])).toBe('a.ts')
  })

  it('picks most abstract file', () => {
    const files = ['types.ts', 'impl.ts']
    const contents = [
      'export interface Foo { name: string }\nexport type Bar = string',
      'function add(a: number, b: number) { return a + b }',
    ]
    expect(findMagneticNorth(files, contents)).toBe('types.ts')
  })

  it('picks most depended-upon file', () => {
    const files = ['core.ts', 'util.ts', 'main.ts']
    const contents = [
      'export const core = 1',
      "import { core } from './core'",
      "import { core } from './core'",
    ]
    const result = findMagneticNorth(files, contents)
    expect(result).toBe('core.ts')
  })
})

// ─── computeConsistency ────────────────────────────────────────────────────────

describe('computeConsistency', () => {
  it('returns 100 for single reading', () => {
    const readings: CompassReading[] = [{
      file: 'a.ts',
      heading: { file: 'a.ts', bearing: 90, cardinalDirection: 'E', abstraction: 50, implementation: 50, expansion: 50, consolidation: 50 },
      winds: [],
      anchors: [],
      drift: 0,
    }]
    expect(computeConsistency(readings)).toBe(100)
  })

  it('returns 100 for empty readings', () => {
    expect(computeConsistency([])).toBe(100)
  })

  it('returns high for aligned readings', () => {
    const readings: CompassReading[] = [0, 5, 10, 355].map((b) => ({
      file: `f${b}.ts`,
      heading: { file: `f${b}.ts`, bearing: b, cardinalDirection: 'N', abstraction: 80, implementation: 10, expansion: 10, consolidation: 10 },
      winds: [],
      anchors: [],
      drift: 0,
    }))
    expect(computeConsistency(readings)).toBeGreaterThan(80)
  })

  it('returns low for scattered readings', () => {
    const readings: CompassReading[] = [0, 90, 180, 270].map((b) => ({
      file: `f${b}.ts`,
      heading: { file: `f${b}.ts`, bearing: b, cardinalDirection: 'N', abstraction: 50, implementation: 50, expansion: 50, consolidation: 50 },
      winds: [],
      anchors: [],
      drift: 0,
    }))
    expect(computeConsistency(readings)).toBeLessThan(30)
  })
})

// ─── computeNavigability ───────────────────────────────────────────────────────

describe('computeNavigability', () => {
  it('returns consistency when no flows', () => {
    expect(computeNavigability([], 75)).toBe(75)
  })

  it('factors in flow magnitude', () => {
    const flows: FlowVector[] = [
      { from: 'a', to: 'b', direction: 'a->b', magnitude: 80, type: 'dependency' },
      { from: 'b', to: 'c', direction: 'b->c', magnitude: 90, type: 'dependency' },
    ]
    const nav = computeNavigability(flows, 50)
    expect(nav).toBeGreaterThan(0)
    expect(nav).toBeLessThanOrEqual(100)
  })

  it('returns 0-100', () => {
    const flows: FlowVector[] = [
      { from: 'a', to: 'b', direction: 'a->b', magnitude: 50, type: 'data' },
    ]
    const nav = computeNavigability(flows, 50)
    expect(nav).toBeGreaterThanOrEqual(0)
    expect(nav).toBeLessThanOrEqual(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about low consistency', () => {
    const stats = { consistency: 30, navigability: 50, magneticNorth: 'types.ts' } as CompassRoseStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('consistency'))).toBe(true)
  })

  it('warns about poor navigability', () => {
    const stats = { consistency: 80, navigability: 30, magneticNorth: 'types.ts' } as CompassRoseStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('navigability') || r.includes('Navigability'))).toBe(true)
  })

  it('warns about high drift files', () => {
    const stats = { consistency: 80, navigability: 80, magneticNorth: 'types.ts' } as CompassRoseStats
    const readings: CompassReading[] = [{
      file: 'drift.ts',
      heading: { file: 'drift.ts', bearing: 180, cardinalDirection: 'S', abstraction: 10, implementation: 90, expansion: 10, consolidation: 10 },
      winds: [],
      anchors: [],
      drift: 120,
    }]
    const recs = generateRecommendations([], [], readings, stats)
    expect(recs.some((r) => r.includes('drift'))).toBe(true)
  })

  it('recommends documenting magnetic north', () => {
    const stats = { consistency: 80, navigability: 80, magneticNorth: 'core.ts' } as CompassRoseStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('core.ts'))).toBe(true)
  })

  it('recommends adding abstractions when no northward files', () => {
    const directions = [
      { name: 'N', description: 'abstraction', files: [], strength: 0, characteristics: [] },
      { name: 'S', description: 'implementation', files: ['impl.ts'], strength: 100, characteristics: [] },
    ]
    const stats = { consistency: 80, navigability: 80, magneticNorth: 'impl.ts', northwardCount: 0, southwardCount: 1 } as CompassRoseStats
    const recs = generateRecommendations(directions, [], [], stats)
    expect(recs.some((r) => r.includes('abstraction') || r.includes('north'))).toBe(true)
  })
})

// ─── buildCompassRoseResult ────────────────────────────────────────────────────

describe('buildCompassRoseResult', () => {
  it('handles empty input', () => {
    const result = buildCompassRoseResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.directions).toHaveLength(8)
    expect(result.flows).toHaveLength(0)
    expect(result.readings).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('processes single file', () => {
    const result = buildCompassRoseResult(['types.ts'], ['export interface Foo { name: string }'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.readings).toHaveLength(1)
    expect(result.readings[0].heading.file).toBe('types.ts')
    expect(result.readings[0].heading.abstraction).toBeGreaterThan(0)
  })

  it('detects flows from imports', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      "import { foo } from './utils'",
      "export const foo = 1",
    ]
    const result = buildCompassRoseResult(files, contents, {})
    expect(result.flows.length).toBeGreaterThan(0)
    expect(result.flows[0].from).toBe('main.ts')
    expect(result.flows[0].to).toBe('utils.ts')
  })

  it('computes direction distribution', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [
      'export interface Foo { name: string }',
      'function add(a: number, b: number) { return a + b }',
      '// TODO: implement\nconst x: any = 1',
    ]
    const result = buildCompassRoseResult(files, contents, {})
    const totalFiles = result.directions.reduce((s, d) => s + d.files.length, 0)
    expect(totalFiles).toBe(3)
  })

  it('computes magnetic north', () => {
    const files = ['types.ts', 'impl.ts']
    const contents = [
      'export interface Foo { name: string }\nexport type Bar = string',
      'function foo() { return 1 }',
    ]
    const result = buildCompassRoseResult(files, contents, {})
    expect(result.stats.magneticNorth).toBe('types.ts')
  })

  it('computes stats correctly', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'export interface Foo { name: string }',
      'function foo() { return 1 }',
    ]
    const result = buildCompassRoseResult(files, contents, {})
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgBearing).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgDrift).toBeGreaterThanOrEqual(0)
    expect(result.stats.consistency).toBeGreaterThanOrEqual(0)
    expect(result.stats.consistency).toBeLessThanOrEqual(100)
    expect(result.stats.navigability).toBeGreaterThanOrEqual(0)
    expect(result.stats.navigability).toBeLessThanOrEqual(100)
  })

  it('handles verbose mode', () => {
    const files = ['a.ts']
    const contents = ['/** docs */\nconst x = 1']
    const result = buildCompassRoseResult(files, contents, { verbose: true })
    expect(result.stats.totalFiles).toBe(1)
  })

  it('classifies cardinal directions for headings', () => {
    const files = ['types.ts', 'impl.ts', 'wip.ts']
    const contents = [
      'export interface Foo { name: string }',
      'function add(a: number, b: number) { if (a > 0) { return a + b } return b }',
      '// TODO: fix this\nconst x: any = null\nconsole.log(x)',
    ]
    const result = buildCompassRoseResult(files, contents, {})
    for (const reading of result.readings) {
      expect(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']).toContain(reading.heading.cardinalDirection)
    }
  })

  it('counts northward/southward/eastward/westward', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'export interface Foo { name: string }',
      'function foo() { return 1 }',
    ]
    const result = buildCompassRoseResult(files, contents, {})
    expect(result.stats.northwardCount + result.stats.southwardCount + result.stats.eastwardCount + result.stats.westwardCount).toBeGreaterThanOrEqual(2)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatCompassRoseDiagram', () => {
  it('formats diagram', () => {
    const result = formatCompassRoseDiagram({ N: 5, E: 3, S: 8, W: 2 })
    expect(result).toContain('Compass Rose')
    expect(result).toContain('N')
    expect(result).toContain('S')
  })

  it('handles zeros', () => {
    const result = formatCompassRoseDiagram({ N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 })
    expect(result).toContain('Compass Rose')
  })
})

describe('formatDirectionDistribution', () => {
  it('formats directions', () => {
    const directions = [
      { name: 'N', description: 'Abstraction', files: ['a.ts'], strength: 50, characteristics: ['declarative'] },
    ]
    const result = formatDirectionDistribution(directions)
    expect(result).toContain('Direction Distribution')
    expect(result).toContain('N')
  })
})

describe('formatFlowArrows', () => {
  it('formats flows', () => {
    const flows: FlowVector[] = [
      { from: 'a.ts', to: 'b.ts', direction: 'a->b', magnitude: 80, type: 'dependency' },
    ]
    const result = formatFlowArrows(flows)
    expect(result).toContain('Flow Arrows')
    expect(result).toContain('a.ts')
  })

  it('handles no flows', () => {
    expect(formatFlowArrows([])).toContain('No flows detected')
  })
})

describe('formatHeadingTable', () => {
  it('formats readings', () => {
    const readings: CompassReading[] = [{
      file: 'a.ts',
      heading: { file: 'a.ts', bearing: 90, cardinalDirection: 'E', abstraction: 50, implementation: 50, expansion: 60, consolidation: 40 },
      winds: [],
      anchors: [],
      drift: 10,
    }]
    const result = formatHeadingTable(readings)
    expect(result).toContain('Heading Table')
    expect(result).toContain('a.ts')
  })
})

describe('formatMagneticNorth', () => {
  it('formats magnetic north', () => {
    const stats = { magneticNorth: 'core.ts', consistency: 80, navigability: 70, avgBearing: 45, dominantDirection: 'NE' } as CompassRoseStats
    const result = formatMagneticNorth(stats)
    expect(result).toContain('Magnetic North')
    expect(result).toContain('core.ts')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const result = formatRecommendations(['Add more types', 'Reduce drift'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Add more types')
  })
})

describe('formatCompassRoseJson', () => {
  it('formats as JSON', () => {
    const result = buildCompassRoseResult(['a.ts'], ['interface Foo {}'], {})
    const json = formatCompassRoseJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatCompassRoseTable', () => {
  it('formats as table', () => {
    const result = buildCompassRoseResult(['a.ts'], ['interface Foo {}'], {})
    const table = formatCompassRoseTable(result)
    expect(table).toContain('Compass Rose')
    expect(table).toContain('Direction Distribution')
    expect(table).toContain('Magnetic North')
  })
})
