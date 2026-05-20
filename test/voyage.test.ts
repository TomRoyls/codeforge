import { describe, expect, it } from 'vitest'

import {
  buildVoyageResult,
  chartRoutes,
  classifyPortType,
  classifyRouteType,
  computeChartCompleteness,
  computeImportance,
  computeNavigability,
  computeRouteDifficulty,
  computeSeaConditions,
  computeSupplies,
  estimateReadingTime,
  extractExports,
  extractImports,
  findCircularDependencies,
  generateRecommendations,
  identifyHazards,
  mapPorts,
  planJourney,
  resolveImport,
} from '../src/commands/voyage-helpers.js'

import {
  formatHazards,
  formatJourneys,
  formatPortMap,
  formatRecommendations,
  formatTradeRoutes,
  formatVoyageJSON,
  formatVoyageStats,
  formatVoyageTable,
} from '../src/commands/voyage-format-helpers.js'

import type {
  Hazard,
  Journey,
  Port,
  TradeRoute,
  VoyageResult,
  VoyageStats,
} from '../src/commands/voyage-helpers.js'

// ─── extractImports ────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts ESM named imports', () => {
    const result = extractImports('import { foo } from "./bar"')
    expect(result).toEqual(['./bar'])
  })

  it('extracts ESM default imports', () => {
    const result = extractImports('import foo from "./bar"')
    expect(result).toEqual(['./bar'])
  })

  it('extracts side-effect imports', () => {
    const result = extractImports('import "./styles"')
    expect(result).toEqual(['./styles'])
  })

  it('extracts require calls', () => {
    const result = extractImports('const x = require("./utils")')
    expect(result).toEqual(['./utils'])
  })

  it('deduplicates imports', () => {
    const content = 'import { a } from "./foo"\nimport { b } from "./foo"'
    const result = extractImports(content)
    expect(result).toEqual(['./foo'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })

  it('extracts multiple different imports', () => {
    const content = 'import { a } from "./foo"\nimport { b } from "./bar"'
    const result = extractImports(content)
    expect(result).toEqual(['./foo', './bar'])
  })

  it('handles single quotes and double quotes', () => {
    const result = extractImports("import { a } from './foo'\nimport { b } from \"./bar\"")
    expect(result).toContain('./foo')
    expect(result).toContain('./bar')
  })
})

// ─── extractExports ────────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts function exports', () => {
    expect(extractExports('export function foo() {}')).toContain('foo')
  })

  it('extracts const exports', () => {
    expect(extractExports('export const x = 1')).toContain('x')
  })

  it('extracts class exports', () => {
    expect(extractExports('export class MyClass {}')).toContain('MyClass')
  })

  it('extracts interface exports', () => {
    expect(extractExports('export interface IFoo {}')).toContain('IFoo')
  })

  it('extracts type exports', () => {
    expect(extractExports('export type T = string')).toContain('T')
  })

  it('extracts named re-exports', () => {
    const result = extractExports('export { foo, bar }')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('extracts default exports', () => {
    expect(extractExports('export default function main() {}')).toContain('main')
  })

  it('deduplicates exports', () => {
    const content = 'export const x = 1\nexport { x }'
    const result = extractExports(content)
    const count = result.filter((e) => e === 'x').length
    expect(count).toBe(1)
  })

  it('returns empty for no exports', () => {
    expect(extractExports('const x = 1')).toEqual([])
  })

  it('handles aliased re-exports', () => {
    const result = extractExports('export { foo as bar }')
    expect(result).toContain('bar')
  })
})

// ─── resolveImport ─────────────────────────────────────────────────────────────

describe('resolveImport', () => {
  const files = ['foo.ts', 'bar.ts', 'baz.tsx', 'qux.js']

  it('resolves exact match', () => {
    expect(resolveImport('foo.ts', files)).toBe('foo.ts')
  })

  it('resolves with stripped ./ prefix', () => {
    expect(resolveImport('./foo', files)).toBe('foo.ts')
  })

  it('resolves with .ts extension added', () => {
    expect(resolveImport('bar', files)).toBe('bar.ts')
  })

  it('resolves with .tsx extension added', () => {
    expect(resolveImport('baz', files)).toBe('baz.tsx')
  })

  it('resolves with .js extension added', () => {
    expect(resolveImport('qux', files)).toBe('qux.js')
  })

  it('returns null for no match', () => {
    expect(resolveImport('./nonexistent', files)).toBeNull()
  })

  it('returns null for empty files', () => {
    expect(resolveImport('./foo', [])).toBeNull()
  })

  it('handles import without ./ prefix', () => {
    expect(resolveImport('foo', files)).toBe('foo.ts')
  })
})

// ─── computeSeaConditions ──────────────────────────────────────────────────────

describe('computeSeaConditions', () => {
  it('returns 0 for empty content', () => {
    expect(computeSeaConditions('')).toBe(0)
  })

  it('returns higher values for more branches', () => {
    const simple = 'const x = 1\n'
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { if (y) {} } }\n'
    expect(computeSeaConditions(complex)).toBeGreaterThan(computeSeaConditions(simple))
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) {
      content += 'if (x) {}\n'
    }
    expect(computeSeaConditions(content)).toBeLessThanOrEqual(100)
  })

  it('detects ternary operators', () => {
    const content = 'const x = true?:false\n'
    const result = computeSeaConditions(content)
    expect(result).toBeGreaterThan(0)
  })

  it('detects switch/case', () => {
    const content = 'switch(x) { case 1: break; }\n'
    expect(computeSeaConditions(content)).toBeGreaterThan(0)
  })

  it('detects try/catch', () => {
    const content = 'try {} catch(e) {}\n'
    expect(computeSeaConditions(content)).toBeGreaterThan(0)
  })
})

// ─── computeSupplies ───────────────────────────────────────────────────────────

describe('computeSupplies', () => {
  it('returns 0 for empty content', () => {
    expect(computeSupplies('')).toBe(0)
  })

  it('returns higher values for documented code', () => {
    const documented = '/** docs */\n* more docs\n*/\nfunction foo() {}\n'
    const undocumented = 'function foo() {}\n'
    expect(computeSupplies(documented)).toBeGreaterThan(computeSupplies(undocumented))
  })

  it('counts // comments', () => {
    const content = '// comment\nconst x = 1\n'
    expect(computeSupplies(content)).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) {
      content += '// comment\n'
    }
    expect(computeSupplies(content)).toBeLessThanOrEqual(100)
  })
})

// ─── classifyPortType ──────────────────────────────────────────────────────────

describe('classifyPortType', () => {
  it('classifies entry file with no importers as home', () => {
    expect(classifyPortType('main.ts', ['./a'], ['x'], [])).toBe('home')
  })

  it('classifies index.ts as home', () => {
    expect(classifyPortType('index.ts', ['./a'], ['x'], [])).toBe('home')
  })

  it('classifies file with no imports and no importers as island', () => {
    expect(classifyPortType('standalone.ts', [], [], [])).toBe('island')
  })

  it('classifies file with imports but no exports as outpost', () => {
    expect(classifyPortType('consumer.ts', ['./a'], [], ['./b'])).toBe('outpost')
  })

  it('classifies file imported by 5+ as harbor', () => {
    const importers = ['a', 'b', 'c', 'd', 'e']
    expect(classifyPortType('shared.ts', ['./x'], ['y'], importers)).toBe('harbor')
  })

  it('classifies file with imports and importers as trade', () => {
    expect(classifyPortType('middle.ts', ['./a'], ['x'], ['b'])).toBe('trade')
  })

  it('classifies cli.ts as home when not imported', () => {
    expect(classifyPortType('cli.ts', ['./a'], [], [])).toBe('home')
  })

  it('classifies server.ts as home when not imported', () => {
    expect(classifyPortType('server.ts', [], [], [])).toBe('home')
  })

  it('classifies app.ts as home when not imported', () => {
    expect(classifyPortType('src/app.ts', [], [], [])).toBe('home')
  })

  it('entry file with importers is not home', () => {
    expect(classifyPortType('main.ts', [], ['x'], ['a'])).not.toBe('home')
  })
})

// ─── computeImportance ─────────────────────────────────────────────────────────

describe('computeImportance', () => {
  it('gives higher importance to more imported files', () => {
    const low = computeImportance(1, 2, 30)
    const high = computeImportance(5, 2, 30)
    expect(high).toBeGreaterThan(low)
  })

  it('gives higher importance to more exports', () => {
    const low = computeImportance(2, 1, 30)
    const high = computeImportance(2, 5, 30)
    expect(high).toBeGreaterThan(low)
  })

  it('penalizes high sea conditions', () => {
    const normal = computeImportance(3, 3, 30)
    const stormy = computeImportance(3, 3, 80)
    expect(normal).toBeGreaterThan(stormy)
  })

  it('caps at 100', () => {
    expect(computeImportance(100, 100, 0)).toBeLessThanOrEqual(100)
  })

  it('returns base value for zero counts', () => {
    const result = computeImportance(0, 0, 0)
    expect(result).toBe(20)
  })
})

// ─── mapPorts ──────────────────────────────────────────────────────────────────

describe('mapPorts', () => {
  it('maps files to ports', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = ['import { x } from "./utils"\nexport function run() {}', 'export function x() {}']
    const fileImports = new Map([
      ['main.ts', ['./utils']],
      ['utils.ts', []],
    ])
    const fileExports = new Map([
      ['main.ts', ['run']],
      ['utils.ts', ['x']],
    ])
    const importedBy = new Map([
      ['main.ts', []],
      ['utils.ts', ['main.ts']],
    ])
    const ports = mapPorts(files, contents, fileImports, fileExports, importedBy)
    expect(ports).toHaveLength(2)
    expect(ports[0].file).toBe('main.ts')
    expect(ports[1].file).toBe('utils.ts')
  })

  it('assigns correct port types', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = ['import { x } from "./utils"', 'export function x() {}']
    const fileImports = new Map([['main.ts', ['./utils']], ['utils.ts', []]])
    const fileExports = new Map([['main.ts', []], ['utils.ts', ['x']]])
    const importedBy = new Map([['main.ts', []], ['utils.ts', ['main.ts']]])
    const ports = mapPorts(files, contents, fileImports, fileExports, importedBy)
    expect(ports[0].type).toBe('home')
    expect(ports[1].type).toBe('island')
  })

  it('resolves connections', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['import { x } from "./b"', 'export const x = 1']
    const fileImports = new Map([['a.ts', ['./b']], ['b.ts', []]])
    const fileExports = new Map([['a.ts', []], ['b.ts', ['x']]])
    const importedBy = new Map([['a.ts', []], ['b.ts', ['a.ts']]])
    const ports = mapPorts(files, contents, fileImports, fileExports, importedBy)
    expect(ports[0].connections).toContain('b.ts')
  })

  it('handles empty files', () => {
    const ports = mapPorts([], [], new Map(), new Map(), new Map())
    expect(ports).toEqual([])
  })

  it('computes sea conditions per port', () => {
    const files = ['a.ts']
    const contents = ['if (x) { for (let i = 0; i < 10; i++) {} }\n']
    const ports = mapPorts(files, contents, new Map([['a.ts', []]]), new Map([['a.ts', []]]), new Map([['a.ts', []]]))
    expect(ports[0].seaConditions).toBeGreaterThan(0)
  })

  it('computes supplies per port', () => {
    const files = ['a.ts']
    const contents = ['/** docs */\n// comment\nfunction foo() {}\n']
    const ports = mapPorts(files, contents, new Map([['a.ts', []]]), new Map([['a.ts', []]]), new Map([['a.ts', []]]))
    expect(ports[0].supplies).toBeGreaterThan(0)
  })

  it('strips extension for name', () => {
    const files = ['my-module.ts']
    const contents = ['']
    const ports = mapPorts(files, contents, new Map([['my-module.ts', []]]), new Map([['my-module.ts', []]]), new Map([['my-module.ts', []]]))
    expect(ports[0].name).toBe('my-module')
  })
})

// ─── chartRoutes ───────────────────────────────────────────────────────────────

describe('chartRoutes', () => {
  it('creates routes from imports', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const fileImports = new Map([['a.ts', ['./b']], ['b.ts', []]])
    const routes = chartRoutes(ports, fileImports, ['a.ts', 'b.ts'])
    expect(routes).toHaveLength(1)
    expect(routes[0].from).toBe('a.ts')
    expect(routes[0].to).toBe('b.ts')
  })

  it('deduplicates routes', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const fileImports = new Map([['a.ts', ['./b', './b']], ['b.ts', []]])
    const routes = chartRoutes(ports, fileImports, ['a.ts', 'b.ts'])
    expect(routes).toHaveLength(1)
  })

  it('skips unresolved imports', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: [], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const fileImports = new Map([['a.ts', ['./nonexistent']]])
    const routes = chartRoutes(ports, fileImports, ['a.ts'])
    expect(routes).toHaveLength(0)
  })

  it('sets distance to 1 for direct routes', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const fileImports = new Map([['a.ts', ['./b']], ['b.ts', []]])
    const routes = chartRoutes(ports, fileImports, ['a.ts', 'b.ts'])
    expect(routes[0].distance).toBe(1)
  })

  it('sets cargo to import path', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const fileImports = new Map([['a.ts', ['./b']], ['b.ts', []]])
    const routes = chartRoutes(ports, fileImports, ['a.ts', 'b.ts'])
    expect(routes[0].cargo).toContain('./b')
  })
})

// ─── classifyRouteType ─────────────────────────────────────────────────────────

describe('classifyRouteType', () => {
  it('classifies <=25 as highway', () => {
    expect(classifyRouteType(10)).toBe('highway')
    expect(classifyRouteType(25)).toBe('highway')
  })

  it('classifies 26-50 as route', () => {
    expect(classifyRouteType(30)).toBe('route')
    expect(classifyRouteType(50)).toBe('route')
  })

  it('classifies 51-75 as path', () => {
    expect(classifyRouteType(60)).toBe('path')
    expect(classifyRouteType(75)).toBe('path')
  })

  it('classifies >75 as treacherous', () => {
    expect(classifyRouteType(80)).toBe('treacherous')
    expect(classifyRouteType(100)).toBe('treacherous')
  })
})

// ─── computeRouteDifficulty ────────────────────────────────────────────────────

describe('computeRouteDifficulty', () => {
  const ports: Port[] = [
    { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 50 },
    { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 60, supplies: 30 },
  ]

  it('computes difficulty based on sea conditions and supplies', () => {
    const diff = computeRouteDifficulty('a.ts', 'b.ts', ports)
    expect(diff).toBeGreaterThan(0)
    expect(diff).toBeLessThanOrEqual(100)
  })

  it('returns higher difficulty for stormier routes', () => {
    const calmPorts: Port[] = [
      { file: 'c.ts', name: 'c', type: 'home', connections: [], importance: 50, seaConditions: 10, supplies: 80 },
      { file: 'd.ts', name: 'd', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 80 },
    ]
    const diff1 = computeRouteDifficulty('c.ts', 'd.ts', calmPorts)
    const diff2 = computeRouteDifficulty('a.ts', 'b.ts', ports)
    expect(diff2).toBeGreaterThan(diff1)
  })

  it('handles missing ports gracefully', () => {
    const diff = computeRouteDifficulty('missing.ts', 'also-missing.ts', ports)
    expect(diff).toBeGreaterThanOrEqual(0)
  })

  it('caps at 100', () => {
    const extreme: Port[] = [
      { file: 'x.ts', name: 'x', type: 'reef', connections: [], importance: 50, seaConditions: 100, supplies: 0 },
      { file: 'y.ts', name: 'y', type: 'reef', connections: [], importance: 50, seaConditions: 100, supplies: 0 },
    ]
    expect(computeRouteDifficulty('x.ts', 'y.ts', extreme)).toBeLessThanOrEqual(100)
  })
})

// ─── planJourney ───────────────────────────────────────────────────────────────

describe('planJourney', () => {
  it('returns null for unreachable destinations', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'island', connections: [], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'island', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    expect(planJourney('a.ts', 'b.ts', ports)).toBeNull()
  })

  it('plans direct journey', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const journey = planJourney('a.ts', 'b.ts', ports)
    expect(journey).not.toBeNull()
    expect(journey!.from).toBe('a.ts')
    expect(journey!.to).toBe('b.ts')
    expect(journey!.distance).toBe(1)
    expect(journey!.route).toEqual(['a.ts', 'b.ts'])
  })

  it('plans multi-hop journey', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: ['c.ts'], importance: 40, seaConditions: 10, supplies: 40 },
      { file: 'c.ts', name: 'c', type: 'trade', connections: [], importance: 30, seaConditions: 15, supplies: 50 },
    ]
    const journey = planJourney('a.ts', 'c.ts', ports)
    expect(journey).not.toBeNull()
    expect(journey!.route).toEqual(['a.ts', 'b.ts', 'c.ts'])
    expect(journey!.distance).toBe(2)
  })

  it('returns self-journey for same from/to', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: [], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const journey = planJourney('a.ts', 'a.ts', ports)
    expect(journey).not.toBeNull()
    expect(journey!.distance).toBe(0)
    expect(journey!.route).toEqual(['a.ts'])
  })

  it('includes waypoints', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const journey = planJourney('a.ts', 'b.ts', ports)
    expect(journey!.waypoints).toHaveLength(2)
    expect(journey!.waypoints[0].file).toBe('a.ts')
    expect(journey!.waypoints[1].file).toBe('b.ts')
  })

  it('computes journey difficulty', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 40, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 60, supplies: 40 },
    ]
    const journey = planJourney('a.ts', 'b.ts', ports)
    expect(journey!.difficulty).toBe(50)
  })
})

// ─── estimateReadingTime ───────────────────────────────────────────────────────

describe('estimateReadingTime', () => {
  it('estimates 1 min for short content', () => {
    expect(estimateReadingTime('file.ts', 'short')).toBe('1 min')
  })

  it('estimates 1 min for empty content (default 50 lines)', () => {
    expect(estimateReadingTime('file.ts', '')).toBe('1 min')
  })

  it('estimates more for longer content', () => {
    const content = Array(100).fill('line of code').join('\n')
    const result = estimateReadingTime('file.ts', content)
    expect(parseInt(result)).toBeGreaterThanOrEqual(2)
  })

  it('always returns at least 1 min', () => {
    expect(estimateReadingTime('f.ts', 'x')).toBe('1 min')
  })
})

// ─── identifyHazards ───────────────────────────────────────────────────────────

describe('identifyHazards', () => {
  it('detects storm hazards for high complexity', () => {
    const ports: Port[] = [
      { file: 'complex.ts', name: 'complex', type: 'reef', connections: [], importance: 50, seaConditions: 80, supplies: 50 },
    ]
    const hazards = identifyHazards(ports, [])
    expect(hazards.some((h) => h.type === 'storm')).toBe(true)
  })

  it('detects fog hazards for low documentation', () => {
    const ports: Port[] = [
      { file: 'undocumented.ts', name: 'undocumented', type: 'island', connections: [], importance: 50, seaConditions: 20, supplies: 15 },
    ]
    const hazards = identifyHazards(ports, [])
    expect(hazards.some((h) => h.type === 'fog')).toBe(true)
  })

  it('detects extreme storms', () => {
    const ports: Port[] = [
      { file: 'extreme.ts', name: 'extreme', type: 'reef', connections: [], importance: 50, seaConditions: 95, supplies: 50 },
    ]
    const hazards = identifyHazards(ports, [])
    const storm = hazards.find((h) => h.type === 'storm')
    expect(storm).toBeDefined()
    expect(storm!.severity).toBe('extreme')
  })

  it('detects major fog', () => {
    const ports: Port[] = [
      { file: 'nofog.ts', name: 'nofog', type: 'island', connections: [], importance: 50, seaConditions: 20, supplies: 5 },
    ]
    const hazards = identifyHazards(ports, [])
    const fog = hazards.find((h) => h.type === 'fog')
    expect(fog).toBeDefined()
    expect(fog!.severity).toBe('major')
  })

  it('returns empty for clean codebase', () => {
    const ports: Port[] = [
      { file: 'clean.ts', name: 'clean', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 10, supplies: 80 },
    ]
    const hazards = identifyHazards(ports, [])
    expect(hazards.filter((h) => h.type !== 'maelstrom')).toHaveLength(0)
  })

  it('detects circular dependency maelstroms', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 50 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: ['a.ts'], importance: 50, seaConditions: 20, supplies: 50 },
    ]
    const hazards = identifyHazards(ports, [])
    expect(hazards.some((h) => h.type === 'maelstrom')).toBe(true)
  })
})

// ─── findCircularDependencies ──────────────────────────────────────────────────

describe('findCircularDependencies', () => {
  it('finds direct circular dependencies', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: ['a.ts'], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const cycles = findCircularDependencies(ports)
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('finds indirect circular dependencies', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: ['c.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'c.ts', name: 'c', type: 'trade', connections: ['a.ts'], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const cycles = findCircularDependencies(ports)
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('returns empty for no cycles', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'home', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: [], importance: 40, seaConditions: 10, supplies: 40 },
    ]
    const cycles = findCircularDependencies(ports)
    expect(cycles).toHaveLength(0)
  })

  it('returns empty for no ports', () => {
    expect(findCircularDependencies([])).toHaveLength(0)
  })

  it('deduplicates equivalent cycles', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 30 },
      { file: 'b.ts', name: 'b', type: 'trade', connections: ['a.ts'], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const cycles = findCircularDependencies(ports)
    expect(cycles.length).toBe(1)
  })
})

// ─── computeNavigability ───────────────────────────────────────────────────────

describe('computeNavigability', () => {
  it('returns 0 for no journeys or routes', () => {
    expect(computeNavigability([], [])).toBe(0)
  })

  it('returns higher for reachable journeys', () => {
    const journeys: Journey[] = [
      { from: 'a.ts', to: 'b.ts', route: ['a.ts', 'b.ts'], distance: 1, difficulty: 20, waypoints: [], hazards: [] },
    ]
    const routes: TradeRoute[] = [
      { from: 'a.ts', to: 'b.ts', cargo: [], distance: 1, difficulty: 20, type: 'highway' },
    ]
    expect(computeNavigability(journeys, routes)).toBeGreaterThan(0)
  })

  it('penalizes treacherous routes', () => {
    const easyRoutes: TradeRoute[] = [
      { from: 'a.ts', to: 'b.ts', cargo: [], distance: 1, difficulty: 10, type: 'highway' },
    ]
    const hardRoutes: TradeRoute[] = [
      { from: 'a.ts', to: 'b.ts', cargo: [], distance: 1, difficulty: 90, type: 'treacherous' },
    ]
    const journeys: Journey[] = [
      { from: 'a.ts', to: 'b.ts', route: ['a.ts', 'b.ts'], distance: 1, difficulty: 20, waypoints: [], hazards: [] },
    ]
    const easy = computeNavigability(journeys, easyRoutes)
    const hard = computeNavigability(journeys, hardRoutes)
    expect(easy).toBeGreaterThan(hard)
  })

  it('caps at 100', () => {
    const journeys: Journey[] = [
      { from: 'a.ts', to: 'b.ts', route: ['a.ts', 'b.ts'], distance: 1, difficulty: 10, waypoints: [], hazards: [] },
    ]
    const routes: TradeRoute[] = [
      { from: 'a.ts', to: 'b.ts', cargo: [], distance: 1, difficulty: 10, type: 'highway' },
    ]
    expect(computeNavigability(journeys, routes)).toBeLessThanOrEqual(100)
  })
})

// ─── computeChartCompleteness ──────────────────────────────────────────────────

describe('computeChartCompleteness', () => {
  it('returns 0 for no ports', () => {
    expect(computeChartCompleteness([], [])).toBe(0)
  })

  it('returns higher for documented ports', () => {
    const goodPorts: Port[] = [
      { file: 'a.ts', name: 'a', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 80 },
    ]
    const badPorts: Port[] = [
      { file: 'a.ts', name: 'a', type: 'island', connections: [], importance: 50, seaConditions: 20, supplies: 5 },
    ]
    const good = computeChartCompleteness(goodPorts, [])
    const bad = computeChartCompleteness(badPorts, [])
    expect(good).toBeGreaterThan(bad)
  })

  it('returns higher for connected ports', () => {
    const connected: Port[] = [
      { file: 'a.ts', name: 'a', type: 'trade', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 50 },
    ]
    const isolated: Port[] = [
      { file: 'a.ts', name: 'a', type: 'island', connections: [], importance: 50, seaConditions: 20, supplies: 50 },
    ]
    expect(computeChartCompleteness(connected, [])).toBeGreaterThan(computeChartCompleteness(isolated, []))
  })

  it('caps at 100', () => {
    const ports: Port[] = [
      { file: 'a.ts', name: 'a', type: 'harbor', connections: ['b.ts'], importance: 50, seaConditions: 20, supplies: 90 },
    ]
    expect(computeChartCompleteness(ports, [])).toBeLessThanOrEqual(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: VoyageStats = {
    totalPorts: 5, homePorts: 1, tradeRoutes: 3, avgDistance: 2, maxDistance: 4,
    avgDifficulty: 30, hazardousRoutes: 0, mostIsolated: 'none', mostConnected: 'a.ts',
    navigability: 50, chartCompleteness: 60,
  }

  it('recommends breaking circular deps', () => {
    const hazards: Hazard[] = [
      { file: 'a.ts', type: 'maelstrom', severity: 'extreme', description: 'Circular' },
    ]
    const recs = generateRecommendations([], [], [], hazards, baseStats)
    expect(recs.some((r) => r.includes('maelstrom'))).toBe(true)
  })

  it('recommends simplifying stormy ports', () => {
    const hazards: Hazard[] = [
      { file: 'a.ts', type: 'storm', severity: 'major', description: 'Complex' },
    ]
    const recs = generateRecommendations([], [], [], hazards, baseStats)
    expect(recs.some((r) => r.includes('storm'))).toBe(true)
  })

  it('recommends documenting foggy ports', () => {
    const hazards: Hazard[] = [
      { file: 'a.ts', type: 'fog', severity: 'moderate', description: 'Undocumented' },
    ]
    const recs = generateRecommendations([], [], [], hazards, baseStats)
    expect(recs.some((r) => r.includes('fog'))).toBe(true)
  })

  it('recommends shortcuts for long journeys', () => {
    const journeys: Journey[] = [
      { from: 'a.ts', to: 'z.ts', route: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts', 'z.ts'], distance: 6, difficulty: 30, waypoints: [], hazards: [] },
    ]
    const recs = generateRecommendations([], [], journeys, [], baseStats)
    expect(recs.some((r) => r.includes('long journey'))).toBe(true)
  })

  it('mentions isolated files', () => {
    const stats = { ...baseStats, mostIsolated: 'lonely.ts' }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('lonely.ts'))).toBe(true)
  })

  it('praises good navigability', () => {
    const stats = { ...baseStats, navigability: 80 }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('Navigability'))).toBe(true)
  })

  it('gives all-clear when everything is good', () => {
    const recs = generateRecommendations([], [], [], [], baseStats)
    expect(recs.some((r) => r.includes('clear'))).toBe(true)
  })
})

// ─── buildVoyageResult ─────────────────────────────────────────────────────────

describe('buildVoyageResult', () => {
  it('returns empty result for no files', () => {
    const result = buildVoyageResult([], [], {})
    expect(result.ports).toEqual([])
    expect(result.routes).toEqual([])
    expect(result.journeys).toEqual([])
    expect(result.hazards).toEqual([])
    expect(result.stats.totalPorts).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('maps simple project', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      'import { x } from "./utils"\nexport function run() {}',
      'export function x() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.ports).toHaveLength(2)
    expect(result.routes.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      'import { x } from "./utils"\nexport function run() {}',
      'export function x() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.stats.totalPorts).toBe(2)
    expect(result.stats.mostConnected).toBeTruthy()
  })

  it('identifies hazards in complex code', () => {
    const files = ['complex.ts']
    let complexContent = ''
    for (let i = 0; i < 100; i++) {
      complexContent += 'if (x) { for (let i = 0; i < 10; i++) {} }\n'
    }
    const result = buildVoyageResult(files, [complexContent], {})
    expect(result.hazards.some((h) => h.type === 'storm')).toBe(true)
  })

  it('plans journeys from home ports', () => {
    const files = ['main.ts', 'utils.ts', 'helpers.ts']
    const contents = [
      'import { x } from "./utils"\nimport { y } from "./helpers"\nexport function run() {}',
      'export function x() {}',
      'export function y() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.journeys.length).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      'import { x } from "./utils"\nexport function run() {}',
      'export function x() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('detects circular dependencies', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'import { x } from "./b"\nexport function fa() {}',
      'import { y } from "./a"\nexport function fb() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.hazards.some((h) => h.type === 'maelstrom')).toBe(true)
  })

  it('handles single file', () => {
    const result = buildVoyageResult(['main.ts'], ['export function run() {}'], {})
    expect(result.ports).toHaveLength(1)
    expect(result.routes).toHaveLength(0)
  })

  it('computes navigability', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      'import { x } from "./utils"\nexport function run() {}',
      'export function x() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.stats.navigability).toBeGreaterThanOrEqual(0)
    expect(result.stats.navigability).toBeLessThanOrEqual(100)
  })

  it('computes chart completeness', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      'import { x } from "./utils"\nexport function run() {}',
      'export function x() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.stats.chartCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.stats.chartCompleteness).toBeLessThanOrEqual(100)
  })

  it('counts home ports', () => {
    const files = ['main.ts', 'utils.ts']
    const contents = [
      'import { x } from "./utils"\nexport function run() {}',
      'export function x() {}',
    ]
    const result = buildVoyageResult(files, contents, {})
    expect(result.stats.homePorts).toBeGreaterThanOrEqual(1)
  })

  it('counts hazardous routes', () => {
    const files = ['a.ts', 'b.ts']
    let complexContent = ''
    for (let i = 0; i < 100; i++) complexContent += 'if (x) { for (let i = 0; i < 10; i++) {} }\n'
    const contents = [complexContent, 'export function x() {}']
    const result = buildVoyageResult(files, contents, {})
    expect(result.stats.hazardousRoutes).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatPortMap', () => {
  it('handles empty ports', () => {
    expect(formatPortMap([])).toContain('No ports')
  })

  it('formats ports', () => {
    const ports: Port[] = [
      { file: 'main.ts', name: 'main', type: 'home', connections: [], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const result = formatPortMap(ports)
    expect(result).toContain('main.ts')
    expect(result).toContain('home')
  })

  it('shows connections', () => {
    const ports: Port[] = [
      { file: 'main.ts', name: 'main', type: 'home', connections: ['utils.ts'], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const result = formatPortMap(ports)
    expect(result).toContain('utils.ts')
  })

  it('truncates many connections', () => {
    const ports: Port[] = [
      { file: 'main.ts', name: 'main', type: 'harbor', connections: ['a', 'b', 'c', 'd', 'e', 'f'], importance: 50, seaConditions: 20, supplies: 30 },
    ]
    const result = formatPortMap(ports)
    expect(result).toContain('more')
  })
})

describe('formatTradeRoutes', () => {
  it('handles empty routes', () => {
    expect(formatTradeRoutes([])).toContain('No trade routes')
  })

  it('formats routes', () => {
    const routes: TradeRoute[] = [
      { from: 'a.ts', to: 'b.ts', cargo: [], distance: 1, difficulty: 20, type: 'highway' },
    ]
    const result = formatTradeRoutes(routes)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatJourneys', () => {
  it('handles empty journeys', () => {
    expect(formatJourneys([])).toContain('No journeys')
  })

  it('formats journeys', () => {
    const journeys: Journey[] = [
      { from: 'a.ts', to: 'b.ts', route: ['a.ts', 'b.ts'], distance: 1, difficulty: 20, waypoints: [], hazards: [] },
    ]
    const result = formatJourneys(journeys)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatHazards', () => {
  it('handles empty hazards', () => {
    expect(formatHazards([])).toContain('No hazards')
  })

  it('formats hazards', () => {
    const hazards: Hazard[] = [
      { file: 'a.ts', type: 'storm', severity: 'major', description: 'Complex code' },
    ]
    const result = formatHazards(hazards)
    expect(result).toContain('storm')
    expect(result).toContain('a.ts')
  })
})

describe('formatVoyageStats', () => {
  it('formats stats', () => {
    const stats: VoyageStats = {
      totalPorts: 10, homePorts: 2, tradeRoutes: 5, avgDistance: 2.5, maxDistance: 4,
      avgDifficulty: 30, hazardousRoutes: 1, mostIsolated: 'lonely.ts', mostConnected: 'hub.ts',
      navigability: 75, chartCompleteness: 80,
    }
    const result = formatVoyageStats(stats)
    expect(result).toContain('10')
    expect(result).toContain('hub.ts')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const result = formatRecommendations(['Add docs', 'Fix cycle'])
    expect(result).toContain('Add docs')
    expect(result).toContain('Fix cycle')
  })
})

describe('formatVoyageTable', () => {
  it('formats full result', () => {
    const result: VoyageResult = {
      ports: [],
      routes: [],
      journeys: [],
      hazards: [],
      stats: {
        totalPorts: 0, homePorts: 0, tradeRoutes: 0, avgDistance: 0, maxDistance: 0,
        avgDifficulty: 0, hazardousRoutes: 0, mostIsolated: 'none', mostConnected: 'none',
        navigability: 0, chartCompleteness: 0,
      },
      recommendations: [],
    }
    const output = formatVoyageTable(result)
    expect(output).toContain('Voyage Map')
  })
})

describe('formatVoyageJSON', () => {
  it('outputs valid JSON', () => {
    const result: VoyageResult = {
      ports: [],
      routes: [],
      journeys: [],
      hazards: [],
      stats: {
        totalPorts: 0, homePorts: 0, tradeRoutes: 0, avgDistance: 0, maxDistance: 0,
        avgDifficulty: 0, hazardousRoutes: 0, mostIsolated: 'none', mostConnected: 'none',
        navigability: 0, chartCompleteness: 0,
      },
      recommendations: [],
    }
    const output = formatVoyageJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.ports).toEqual([])
    expect(parsed.stats.totalPorts).toBe(0)
  })
})
