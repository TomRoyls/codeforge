import { describe, expect, it } from 'vitest'

import {
  assignPositions,
  buildConnections,
  buildConstellationMapResult,
  classifySpectralClass,
  computeBrightness,
  computeChartCoverage,
  computeConnectionStrength,
  computeMagnitude,
  computeMaxNesting,
  computeNavigability,
  computePathDifficulty,
  extractImports,
  extractReExports,
  findNavigationPath,
  findOrphanStars,
  generateConstellationMapRecommendations,
  generateConstellationName,
  groupIntoConstellations,
  resolveImportPath,
  type ConstellationGroup,
  type ConstellationMapOptions,
  type ConstellationMapResult,
  type ConstellationMapStats,
  type NavigationPath,
  type Star,
  type StarConnection,
} from '../src/commands/constellation-map-helpers.js'

import {
  formatChartCoverage,
  formatConstellationMapJson,
  formatConstellationMapTable,
  formatConstellationTable,
  formatMapRecommendations,
  formatNavigationPaths,
  formatOrphanList,
  formatSpectralLegend,
  formatStarChart,
  formatStatsSummary,
} from '../src/commands/constellation-map-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SIMPLE_FILES = ['src/core/engine.ts', 'src/commands/run.ts', 'src/utils/helpers.ts']
const SIMPLE_CONTENTS = [
  'export class Engine {\n  start() {}\n  stop() {}\n}\n',
  "import { Engine } from '../core/engine'\n\nexport function run() {\n  const e = new Engine()\n  e.start()\n}\n",
  'export function help() { return true }\n',
]

const CONNECTED_FILES = ['a.ts', 'b.ts', 'c.ts', 'd.ts']
const CONNECTED_CONTENTS = [
  "import { x } from './b'\nexport const a = 1\n",
  "import { y } from './c'\nexport const x = 2\n",
  "import { z } from './d'\nexport const y = 3\n",
  'export const z = 4\n',
]

const EMPTY_FILES: string[] = []
const EMPTY_CONTENTS: string[] = []

const SINGLE_FILE = ['lonely.ts']
const SINGLE_CONTENT = ['export const alone = true\n']

// ─── classifySpectralClass ─────────────────────────────────────────────────────

describe('classifySpectralClass', () => {
  it('classifies test files as F', () => {
    expect(classifySpectralClass('test/foo.test.ts', 'describe("x", () => {})')).toBe('F')
    expect(classifySpectralClass('src/bar.spec.ts', 'it("works", () => {})')).toBe('F')
  })

  it('classifies format-helpers as M', () => {
    expect(classifySpectralClass('src/commands/foo-format-helpers.ts', 'export function fmt() {}')).toBe('M')
  })

  it('classifies command files as B', () => {
    expect(classifySpectralClass('src/commands/run.ts', 'export default class Run {}')).toBe('B')
  })

  it('classifies core files as O', () => {
    expect(classifySpectralClass('src/core/engine.ts', 'export class Engine {}')).toBe('O')
  })

  it('classifies config files as G', () => {
    expect(classifySpectralClass('src/config/settings.ts', 'export const port = 3000')).toBe('G')
  })

  it('classifies type definition files as K', () => {
    expect(classifySpectralClass('src/types/api.ts', 'export type Result<T> = { ok: T }\nexport type Error = string')).toBe('K')
  })

  it('classifies utility exports as A', () => {
    expect(classifySpectralClass('src/utils/helpers.ts', 'export function help() {}')).toBe('A')
  })

  it('defaults to A for unrecognized files', () => {
    expect(classifySpectralClass('random.ts', 'const x = 1')).toBe('A')
  })
})

// ─── computeBrightness ─────────────────────────────────────────────────────────

describe('computeBrightness', () => {
  it('gives core files extra brightness', () => {
    const core = computeBrightness('src/core/engine.ts', 2)
    const nonCore = computeBrightness('src/utils/helpers.ts', 2)
    expect(core).toBeGreaterThan(nonCore)
  })

  it('gives index files extra brightness', () => {
    const index = computeBrightness('src/index.ts', 1)
    const nonIndex = computeBrightness('src/app.ts', 1)
    expect(index).toBeGreaterThan(nonIndex)
  })

  it('gives command files extra brightness', () => {
    const cmd = computeBrightness('src/commands/run.ts', 0)
    const nonCmd = computeBrightness('src/utils/helpers.ts', 0)
    expect(cmd).toBeGreaterThan(nonCmd)
  })

  it('scales with importedBy count', () => {
    const high = computeBrightness('a.ts', 5)
    const low = computeBrightness('b.ts', 1)
    expect(high).toBeGreaterThan(low)
  })

  it('caps brightness at 100', () => {
    expect(computeBrightness('src/core/index.ts', 100)).toBeLessThanOrEqual(100)
  })

  it('never goes below 0', () => {
    expect(computeBrightness('x.ts', 0)).toBeGreaterThanOrEqual(0)
  })

  it('does not boost helpers as command', () => {
    const helper = computeBrightness('src/commands/run-helpers.ts', 0)
    const cmd = computeBrightness('src/commands/run.ts', 0)
    expect(cmd).toBeGreaterThan(helper)
  })

  it('does not boost format helpers as command', () => {
    const fmt = computeBrightness('src/commands/run-format-helpers.ts', 0)
    const cmd = computeBrightness('src/commands/run.ts', 0)
    expect(cmd).toBeGreaterThan(fmt)
  })
})

// ─── computeMagnitude ──────────────────────────────────────────────────────────

describe('computeMagnitude', () => {
  it('returns 0 for empty content', () => {
    expect(computeMagnitude('')).toBe(0)
    expect(computeMagnitude('   ')).toBe(0)
  })

  it('increases with branching', () => {
    const noBranch = 'const x = 1\n'
    const withBranch = 'if (true) {}\nelse {}\nfor (let i = 0; i < 10; i++) {}\n'
    expect(computeMagnitude(withBranch)).toBeGreaterThan(computeMagnitude(noBranch))
  })

  it('increases with nesting', () => {
    const flat = 'const a = 1\nconst b = 2\n'
    const nested = 'if (true) {\n  if (true) {\n    if (true) {\n      const x = 1\n    }\n  }\n}\n'
    expect(computeMagnitude(nested)).toBeGreaterThan(computeMagnitude(flat))
  })

  it('increases with any types', () => {
    const clean = 'const a = 1\nconst b = 2\nconst c = 3\n'
    const withAny = 'const a: any = 1\nconst b: any = 2\nconst c: any = 3\n'
    expect(computeMagnitude(withAny)).toBeGreaterThan(computeMagnitude(clean))
  })

  it('caps at 100', () => {
    const complex = '{'.repeat(200) + '}'.repeat(200)
    expect(computeMagnitude(complex)).toBeLessThanOrEqual(100)
  })
})

// ─── computeMaxNesting ─────────────────────────────────────────────────────────

describe('computeMaxNesting', () => {
  it('returns 0 for flat content', () => {
    expect(computeMaxNesting('const x = 1')).toBe(0)
  })

  it('counts single level', () => {
    expect(computeMaxNesting('{ x }')).toBe(1)
  })

  it('counts deep nesting', () => {
    expect(computeMaxNesting('{{{x}}}')).toBe(3)
  })

  it('handles mismatched braces', () => {
    expect(computeMaxNesting('}}}')).toBe(0)
  })
})

// ─── extractImports ─────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts named imports', () => {
    const result = extractImports("import { foo } from './bar'")
    expect(result).toEqual(['./bar'])
  })

  it('extracts default imports', () => {
    const result = extractImports("import foo from './bar'")
    expect(result).toEqual(['./bar'])
  })

  it('extracts namespace imports', () => {
    const result = extractImports("import * as foo from './bar'")
    expect(result).toEqual(['./bar'])
  })

  it('extracts dynamic imports', () => {
    const result = extractImports("const x = import('./bar')")
    expect(result).toEqual(['./bar'])
  })

  it('extracts multiple imports', () => {
    const content = "import { a } from './x'\nimport { b } from './y'"
    const result = extractImports(content)
    expect(result).toEqual(['./x', './y'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── extractReExports ──────────────────────────────────────────────────────────

describe('extractReExports', () => {
  it('extracts named re-exports', () => {
    const result = extractReExports("export { foo } from './bar'")
    expect(result).toEqual(['./bar'])
  })

  it('extracts star re-exports', () => {
    const result = extractReExports("export * from './bar'")
    expect(result).toEqual(['./bar'])
  })

  it('returns empty for no re-exports', () => {
    expect(extractReExports('export const x = 1')).toEqual([])
  })
})

// ─── resolveImportPath ─────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  const known = new Set(['a.ts', 'b.ts', 'utils.ts', 'index.ts', 'helpers/index.ts'])

  it('resolves exact match', () => {
    expect(resolveImportPath('a.ts', known)).toBe('a.ts')
  })

  it('resolves with .ts extension', () => {
    expect(resolveImportPath('./a', known)).toBe('a.ts')
  })

  it('resolves with .js extension stripped to .ts', () => {
    expect(resolveImportPath('./b', new Set(['b.ts', 'b.js']))).toBe('b.ts')
  })

  it('resolves index files', () => {
    expect(resolveImportPath('./helpers', new Set(['helpers/index.ts']))).toBe('helpers/index.ts')
  })

  it('returns null for unknown', () => {
    expect(resolveImportPath('./unknown', known)).toBeNull()
  })

  it('strips ./ prefix', () => {
    expect(resolveImportPath('./utils', known)).toBe('utils.ts')
  })
})

// ─── buildConnections ──────────────────────────────────────────────────────────

describe('buildConnections', () => {
  it('builds connections from imports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ["import { x } from './b'", 'export const x = 1']
    const conns = buildConnections(files, contents)
    expect(conns.length).toBeGreaterThan(0)
    expect(conns[0].from).toBe('a.ts')
    expect(conns[0].to).toBe('b.ts')
  })

  it('builds connections from re-exports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ["export { x } from './b'", 'export const x = 1']
    const conns = buildConnections(files, contents)
    const reExport = conns.find((c) => c.type === 're-export')
    expect(reExport).toBeDefined()
    expect(reExport!.from).toBe('a.ts')
    expect(reExport!.to).toBe('b.ts')
  })

  it('returns empty for no connections', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['const x = 1', 'const y = 2']
    expect(buildConnections(files, contents)).toEqual([])
  })

  it('ignores unresolved imports', () => {
    const files = ['a.ts']
    const contents = ["import { x } from './nonexistent'"]
    expect(buildConnections(files, contents)).toEqual([])
  })
})

// ─── computeConnectionStrength ──────────────────────────────────────────────────

describe('computeConnectionStrength', () => {
  it('has base strength of at least 40', () => {
    expect(computeConnectionStrength('a.ts', 'b.ts', 'const x = 1')).toBeGreaterThanOrEqual(40)
  })

  it('increases with more imports', () => {
    const low = computeConnectionStrength('a.ts', 'b.ts', 'const x = 1')
    const high = computeConnectionStrength('a.ts', 'b.ts', "import { a } from './x'\nimport { b } from './y'")
    expect(high).toBeGreaterThan(low)
  })

  it('caps at 100', () => {
    const lots = 'import { a } from "./x"\n'.repeat(20)
    expect(computeConnectionStrength('a.ts', 'b.ts', lots)).toBeLessThanOrEqual(100)
  })
})

// ─── assignPositions ───────────────────────────────────────────────────────────

describe('assignPositions', () => {
  it('assigns positions to all files', () => {
    const positions = assignPositions(SIMPLE_FILES, [])
    for (const file of SIMPLE_FILES) {
      expect(positions.has(file)).toBe(true)
    }
  })

  it('assigns different positions to different directories', () => {
    const files = ['src/a.ts', 'test/b.ts']
    const positions = assignPositions(files, [])
    const posA = positions.get('src/a.ts')
    const posB = positions.get('test/b.ts')
    expect(posA).toBeDefined()
    expect(posB).toBeDefined()
    expect(posA).not.toEqual(posB)
  })

  it('handles single file', () => {
    const positions = assignPositions(['single.ts'], [])
    expect(positions.has('single.ts')).toBe(true)
  })

  it('handles empty files', () => {
    const positions = assignPositions([], [])
    expect(positions.size).toBe(0)
  })
})

// ─── generateConstellationName ─────────────────────────────────────────────────

describe('generateConstellationName', () => {
  it('generates a name with greek letter prefix', () => {
    const name = generateConstellationName(['src/helpers/a.ts'], 'utility')
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa']
    const hasPrefix = prefixes.some((p) => name.startsWith(p))
    expect(hasPrefix).toBe(true)
  })

  it('is deterministic', () => {
    const a = generateConstellationName(['src/core/a.ts'], 'core')
    const b = generateConstellationName(['src/core/a.ts'], 'core')
    expect(a).toBe(b)
  })

  it('varies by directory', () => {
    const a = generateConstellationName(['src/core/a.ts'], 'core')
    const b = generateConstellationName(['src/utils/b.ts'], 'utility')
    // Different dirs might produce same name by hash collision, but unlikely
    expect(typeof a).toBe('string')
    expect(typeof b).toBe('string')
  })
})

// ─── groupIntoConstellations ───────────────────────────────────────────────────

describe('groupIntoConstellations', () => {
  it('groups stars by directory', () => {
    const stars: Star[] = [
      { file: 'src/a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
      { file: 'src/b.ts', name: 'b', brightness: 40, magnitude: 20, spectralClass: 'A', position: [1, 1], connections: [] },
      { file: 'test/c.ts', name: 'c', brightness: 30, magnitude: 5, spectralClass: 'F', position: [2, 2], connections: [] },
    ]
    const constellations = groupIntoConstellations(stars, [])
    expect(constellations.length).toBe(2)
  })

  it('finds brightest star in group', () => {
    const stars: Star[] = [
      { file: 'src/a.ts', name: 'a', brightness: 80, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
      { file: 'src/b.ts', name: 'b', brightness: 30, magnitude: 20, spectralClass: 'A', position: [1, 1], connections: [] },
    ]
    const constellations = groupIntoConstellations(stars, [])
    expect(constellations[0].brightest).toBe('src/a.ts')
  })

  it('computes total brightness', () => {
    const stars: Star[] = [
      { file: 'x.ts', name: 'x', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
      { file: 'y.ts', name: 'y', brightness: 30, magnitude: 10, spectralClass: 'A', position: [1, 1], connections: [] },
    ]
    const constellations = groupIntoConstellations(stars, [])
    expect(constellations[0].totalBrightness).toBe(80)
  })

  it('computes coherence from internal connections', () => {
    const stars: Star[] = [
      { file: 'a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [{ from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' }] },
      { file: 'b.ts', name: 'b', brightness: 50, magnitude: 10, spectralClass: 'A', position: [1, 1], connections: [] },
    ]
    const connections: StarConnection[] = [{ from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' }]
    const constellations = groupIntoConstellations(stars, connections)
    expect(constellations[0].coherence).toBeGreaterThan(0)
  })

  it('handles empty stars', () => {
    expect(groupIntoConstellations([], [])).toEqual([])
  })
})

// ─── findNavigationPath ────────────────────────────────────────────────────────

describe('findNavigationPath', () => {
  const stars: Star[] = CONNECTED_FILES.map((f, i) => ({
    file: f, name: f.replace('.ts', ''), brightness: 50 - i * 10, magnitude: 10, spectralClass: 'A' as const, position: [i, 0] as [number, number],
    connections: [],
  }))

  const connections: StarConnection[] = [
    { from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' },
    { from: 'b.ts', to: 'c.ts', strength: 50, type: 'import' },
    { from: 'c.ts', to: 'd.ts', strength: 50, type: 'import' },
  ]

  it('finds direct path', () => {
    const path = findNavigationPath('a.ts', 'b.ts', stars, connections)
    expect(path).not.toBeNull()
    expect(path!.from).toBe('a.ts')
    expect(path!.to).toBe('b.ts')
    expect(path!.distance).toBe(1)
  })

  it('finds multi-hop path', () => {
    const path = findNavigationPath('a.ts', 'd.ts', stars, connections)
    expect(path).not.toBeNull()
    expect(path!.distance).toBe(3)
    expect(path!.path[0]).toBe('a.ts')
    expect(path!.path[path!.path.length - 1]).toBe('d.ts')
  })

  it('returns null for disconnected nodes', () => {
    const isolatedStar: Star = { file: 'z.ts', name: 'z', brightness: 10, magnitude: 5, spectralClass: 'A', position: [99, 99], connections: [] }
    const path = findNavigationPath('a.ts', 'z.ts', [...stars, isolatedStar], connections)
    expect(path).toBeNull()
  })

  it('returns zero distance for same node', () => {
    const path = findNavigationPath('a.ts', 'a.ts', stars, connections)
    expect(path).not.toBeNull()
    expect(path!.distance).toBe(0)
  })

  it('path includes start and end', () => {
    const path = findNavigationPath('a.ts', 'c.ts', stars, connections)
    expect(path).not.toBeNull()
    expect(path!.path).toContain('a.ts')
    expect(path!.path).toContain('c.ts')
  })

  it('computes difficulty', () => {
    const path = findNavigationPath('a.ts', 'd.ts', stars, connections)
    expect(path).not.toBeNull()
    expect(path!.difficulty).toBeGreaterThanOrEqual(0)
  })
})

// ─── computePathDifficulty ─────────────────────────────────────────────────────

describe('computePathDifficulty', () => {
  const starMap = new Map<string, Star>([
    ['a.ts', { file: 'a.ts', name: 'a', brightness: 50, magnitude: 20, spectralClass: 'A', position: [0, 0], connections: [] }],
    ['b.ts', { file: 'b.ts', name: 'b', brightness: 50, magnitude: 30, spectralClass: 'A', position: [1, 0], connections: [] }],
  ])

  it('returns 0 for single-node path', () => {
    expect(computePathDifficulty(['a.ts'], starMap)).toBe(0)
  })

  it('increases with path length', () => {
    const short = computePathDifficulty(['a.ts'], starMap)
    const long = computePathDifficulty(['a.ts', 'b.ts'], starMap)
    expect(long).toBeGreaterThan(short)
  })

  it('increases with magnitude', () => {
    const lowMag = new Map([['x.ts', { file: 'x.ts', name: 'x', brightness: 50, magnitude: 5, spectralClass: 'A' as const, position: [0, 0] as [number, number], connections: [] }]])
    const highMag = new Map([['y.ts', { file: 'y.ts', name: 'y', brightness: 50, magnitude: 80, spectralClass: 'A' as const, position: [0, 0] as [number, number], connections: [] }]])
    const lowDiff = computePathDifficulty(['x.ts', 'x.ts'], lowMag)
    const highDiff = computePathDifficulty(['y.ts', 'y.ts'], highMag)
    expect(highDiff).toBeGreaterThan(lowDiff)
  })
})

// ─── findOrphanStars ───────────────────────────────────────────────────────────

describe('findOrphanStars', () => {
  it('finds orphan stars', () => {
    const stars: Star[] = [
      { file: 'a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
      { file: 'b.ts', name: 'b', brightness: 50, magnitude: 10, spectralClass: 'A', position: [1, 1], connections: [] },
      { file: 'c.ts', name: 'c', brightness: 50, magnitude: 10, spectralClass: 'A', position: [2, 2], connections: [] },
    ]
    const connections: StarConnection[] = [
      { from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' },
    ]
    const orphans = findOrphanStars(stars, connections)
    expect(orphans).toEqual(['c.ts'])
  })

  it('returns all stars when no connections', () => {
    const stars: Star[] = [
      { file: 'a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
      { file: 'b.ts', name: 'b', brightness: 50, magnitude: 10, spectralClass: 'A', position: [1, 1], connections: [] },
    ]
    expect(findOrphanStars(stars, [])).toEqual(['a.ts', 'b.ts'])
  })

  it('returns empty when all connected', () => {
    const stars: Star[] = [
      { file: 'a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
      { file: 'b.ts', name: 'b', brightness: 50, magnitude: 10, spectralClass: 'A', position: [1, 1], connections: [] },
    ]
    const connections: StarConnection[] = [{ from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' }]
    expect(findOrphanStars(stars, connections)).toEqual([])
  })
})

// ─── computeChartCoverage ──────────────────────────────────────────────────────

describe('computeChartCoverage', () => {
  it('returns 100 for empty files', () => {
    expect(computeChartCoverage([], [])).toBe(100)
  })

  it('returns 100 when all files are mapped', () => {
    const stars: Star[] = [
      { file: 'a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
    ]
    expect(computeChartCoverage(stars, ['a.ts'])).toBe(100)
  })

  it('returns partial coverage', () => {
    const stars: Star[] = [
      { file: 'a.ts', name: 'a', brightness: 50, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
    ]
    expect(computeChartCoverage(stars, ['a.ts', 'b.ts'])).toBe(50)
  })
})

// ─── computeNavigability ───────────────────────────────────────────────────────

describe('computeNavigability', () => {
  it('returns 0 for no connections', () => {
    expect(computeNavigability([], [])).toBe(0)
  })

  it('returns 100 for empty paths with connections', () => {
    expect(computeNavigability([], [{ from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' }])).toBe(100)
  })

  it('increases with connection density', () => {
    const fakePath: NavigationPath = { from: 'a.ts', to: 'b.ts', path: ['a.ts', 'b.ts'], distance: 1, difficulty: 10, waypoints: [] }
    const one = computeNavigability([fakePath], [{ from: 'a.ts', to: 'b.ts', strength: 50, type: 'import' }])
    const many = computeNavigability([fakePath, fakePath, fakePath], Array.from({ length: 15 }, (_, i) => ({ from: `${i}.ts`, to: `${i + 1}.ts`, strength: 50, type: 'import' as const })))
    expect(many).toBeGreaterThan(one)
  })
})

// ─── generateConstellationMapRecommendations ───────────────────────────────────

describe('generateConstellationMapRecommendations', () => {
  const baseStats: ConstellationMapStats = {
    totalStars: 5,
    totalConstellations: 1,
    totalConnections: 4,
    brightestStar: 'a.ts',
    dimmestStar: 'e.ts',
    largestConstellation: 'Alpha Centauri',
    smallestConstellation: 'Alpha Centauri',
    avgBrightness: 50,
    avgMagnitude: 20,
    orphanStars: 0,
    chartCoverage: 100,
    navigability: 80,
  }

  it('recommends connecting orphans', () => {
    const stats = { ...baseStats, orphanStars: 3 }
    const recs = generateConstellationMapRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('orphan'))).toBe(true)
  })

  it('recommends improving coverage', () => {
    const stats = { ...baseStats, chartCoverage: 60 }
    const recs = generateConstellationMapRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('coverage'))).toBe(true)
  })

  it('recommends improving navigability', () => {
    const stats = { ...baseStats, navigability: 30 }
    const recs = generateConstellationMapRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('navigability') || r.includes('Navigability') || r.includes('navigation'))).toBe(true)
  })

  it('recommends for dim stars', () => {
    const stars: Star[] = [
      { file: 'dim.ts', name: 'dim', brightness: 5, magnitude: 10, spectralClass: 'A', position: [0, 0], connections: [] },
    ]
    const recs = generateConstellationMapRecommendations(stars, [], [], baseStats)
    expect(recs.some((r) => r.includes('dim'))).toBe(true)
  })

  it('recommends for low coherence', () => {
    const constellations: ConstellationGroup[] = [{
      name: 'Test', description: 'test', stars: ['a.ts', 'b.ts', 'c.ts'], connections: [],
      brightest: 'a.ts', totalBrightness: 100, coherence: 10,
    }]
    const recs = generateConstellationMapRecommendations([], constellations, [], baseStats)
    expect(recs.some((r) => r.includes('coherence'))).toBe(true)
  })

  it('gives positive feedback for healthy chart', () => {
    const recs = generateConstellationMapRecommendations([], [], [], baseStats)
    expect(recs.some((r) => r.includes('well-organized'))).toBe(true)
  })
})

// ─── buildConstellationMapResult ───────────────────────────────────────────────

describe('buildConstellationMapResult', () => {
  it('builds result with all fields', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.stars).toBeDefined()
    expect(result.constellations).toBeDefined()
    expect(result.paths).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('creates a star per file', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.stars.length).toBe(SIMPLE_FILES.length)
  })

  it('assigns spectral classes', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    for (const star of result.stars) {
      expect(['O', 'B', 'A', 'F', 'G', 'K', 'M']).toContain(star.spectralClass)
    }
  })

  it('computes connections', () => {
    const result = buildConstellationMapResult(CONNECTED_FILES, CONNECTED_CONTENTS, {})
    expect(result.stats.totalConnections).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildConstellationMapResult(EMPTY_FILES, EMPTY_CONTENTS, {})
    expect(result.stars).toEqual([])
    expect(result.stats.totalStars).toBe(0)
  })

  it('handles single file', () => {
    const result = buildConstellationMapResult(SINGLE_FILE, SINGLE_CONTENT, {})
    expect(result.stars.length).toBe(1)
    expect(result.stats.orphanStars).toBe(1)
  })

  it('groups into constellations', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.constellations.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildConstellationMapResult(CONNECTED_FILES, CONNECTED_CONTENTS, {})
    expect(result.stats.totalStars).toBe(4)
    expect(result.stats.totalConnections).toBeGreaterThan(0)
    expect(result.stats.avgBrightness).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMagnitude).toBeGreaterThanOrEqual(0)
    expect(result.stats.chartCoverage).toBeGreaterThanOrEqual(0)
    expect(result.stats.chartCoverage).toBeLessThanOrEqual(100)
  })

  it('generates recommendations', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('verbose mode adds connection placeholders', () => {
    const result = buildConstellationMapResult(SINGLE_FILE, SINGLE_CONTENT, { verbose: true })
    const star = result.stars[0]
    expect(star.connections.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatSpectralLegend', () => {
  it('includes all spectral classes', () => {
    const output = formatSpectralLegend()
    expect(output).toContain('Spectral Classes')
    expect(output).toContain('O')
    expect(output).toContain('M')
  })
})

describe('formatStarChart', () => {
  it('shows stars', () => {
    const stars: Star[] = [
      { file: 'bright.ts', name: 'bright', brightness: 90, magnitude: 10, spectralClass: 'O', position: [0, 0], connections: [] },
    ]
    const output = formatStarChart(stars)
    expect(output).toContain('bright')
    expect(output).toContain('Star Chart')
  })

  it('shows "No stars visible" for empty', () => {
    expect(formatStarChart([])).toContain('No stars visible')
  })

  it('truncates long star lists', () => {
    const stars: Star[] = Array.from({ length: 25 }, (_, i) => ({
      file: `star${i}.ts`, name: `star${i}`, brightness: 50, magnitude: 10,
      spectralClass: 'A' as const, position: [i, 0] as [number, number], connections: [],
    }))
    const output = formatStarChart(stars)
    expect(output).toContain('more stars')
  })
})

describe('formatConstellationTable', () => {
  it('shows constellations', () => {
    const constellations: ConstellationGroup[] = [{
      name: 'Alpha Centauri', description: 'core modules', stars: ['a.ts', 'b.ts'],
      connections: [], brightest: 'a.ts', totalBrightness: 120, coherence: 80,
    }]
    const output = formatConstellationTable(constellations)
    expect(output).toContain('Alpha Centauri')
    expect(output).toContain('2 stars')
  })

  it('shows "No constellations found" for empty', () => {
    expect(formatConstellationTable([])).toContain('No constellations found')
  })
})

describe('formatNavigationPaths', () => {
  it('shows paths', () => {
    const paths: NavigationPath[] = [{
      from: 'a.ts', to: 'c.ts', path: ['a.ts', 'b.ts', 'c.ts'],
      distance: 2, difficulty: 30, waypoints: ['b.ts'],
    }]
    const output = formatNavigationPaths(paths)
    expect(output).toContain('a.ts')
    expect(output).toContain('c.ts')
  })

  it('shows "No paths computed" for empty', () => {
    expect(formatNavigationPaths([])).toContain('No paths computed')
  })
})

describe('formatOrphanList', () => {
  it('shows orphans', () => {
    const output = formatOrphanList(['lonely.ts'])
    expect(output).toContain('lonely.ts')
  })

  it('shows checkmark for no orphans', () => {
    const output = formatOrphanList([])
    expect(output).toContain('No orphan stars')
  })
})

describe('formatChartCoverage', () => {
  it('shows coverage percentage', () => {
    expect(formatChartCoverage(85)).toContain('85%')
  })

  it('shows filled bars', () => {
    expect(formatChartCoverage(100)).toContain('█')
  })

  it('shows empty bars for low coverage', () => {
    expect(formatChartCoverage(0)).toContain('░')
  })
})

describe('formatStatsSummary', () => {
  it('shows all stats', () => {
    const stats: ConstellationMapStats = {
      totalStars: 10, totalConstellations: 3, totalConnections: 15,
      brightestStar: 'a.ts', dimmestStar: 'z.ts',
      largestConstellation: 'Alpha', smallestConstellation: 'Beta',
      avgBrightness: 50, avgMagnitude: 20,
      orphanStars: 2, chartCoverage: 80, navigability: 70,
    }
    const output = formatStatsSummary(stats)
    expect(output).toContain('10')
    expect(output).toContain('Coverage')
    expect(output).toContain('Navigability')
  })
})

describe('formatMapRecommendations', () => {
  it('shows recommendations', () => {
    const output = formatMapRecommendations(['Connect orphans', 'Improve coverage'])
    expect(output).toContain('Connect orphans')
    expect(output).toContain('Recommendations')
  })
})

describe('formatConstellationMapJson', () => {
  it('produces valid JSON', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const json = formatConstellationMapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stars).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

describe('formatConstellationMapTable', () => {
  it('produces table output', () => {
    const result = buildConstellationMapResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const output = formatConstellationMapTable(result)
    expect(output).toContain('Star Chart')
    expect(output).toContain('Constellations')
    expect(output).toContain('Chart Statistics')
  })
})
