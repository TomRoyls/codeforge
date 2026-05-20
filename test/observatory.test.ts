import { describe, it, expect } from 'vitest'
import {
  type CelestialBody,
  type Constellation,
  type CelestialEvent,
  type CosmicWeb,
  type ObservatoryStats,
  type ObservatoryResult,
  countLines,
  extractExports,
  extractImports,
  countGravity,
  computeComplexity,
  computeDistance,
  isDocumented,
  hasClearPurpose,
  classifyBodyType,
  isComplexForSize,
  hasDeadCodeIndicators,
  classifyBody,
  mapConstellations,
  resolveImport,
  describeShape,
  detectCelestialEvents,
  mapCosmicWeb,
  computeObservableRatio,
  computeDarkMatterRatio,
  classifyOverallClarity,
  computeCosmicExpansion,
  generateRecommendations,
  buildObservatoryResult,
} from '../src/commands/observatory-helpers.js'
import {
  formatBodyType,
  formatMagnitude,
  formatBody,
  formatBodiesTable,
  formatConstellation,
  formatConstellations,
  formatImpact,
  formatEvent,
  formatEvents,
  formatWebCluster,
  formatCosmicWeb,
  formatClarity,
  formatStats,
  formatRecommendations,
  formatObservatoryResult,
  formatObservatoryJson,
} from '../src/commands/observatory-format-helpers.js'

// ─── countLines ───────────────────────────────────────────────────────────────

describe('countLines', () => {
  it('counts single line', () => {
    expect(countLines('hello')).toBe(1)
  })

  it('counts multiple lines', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })

  it('counts empty string as 1 line', () => {
    expect(countLines('')).toBe(1)
  })

  it('counts trailing newline', () => {
    expect(countLines('a\n')).toBe(2)
  })
})

// ─── extractExports ───────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts named function export', () => {
    expect(extractExports('export function foo() {}')).toEqual(['foo'])
  })

  it('extracts named class export', () => {
    expect(extractExports('export class Bar {}')).toEqual(['Bar'])
  })

  it('extracts const export', () => {
    expect(extractExports('export const x = 1')).toEqual(['x'])
  })

  it('extracts interface export', () => {
    expect(extractExports('export interface IFoo {}')).toEqual(['IFoo'])
  })

  it('extracts type export', () => {
    expect(extractExports('export type T = string')).toEqual(['T'])
  })

  it('extracts default function export', () => {
    expect(extractExports('export default function main() {}')).toEqual(['main'])
  })

  it('extracts multiple exports and deduplicates', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport function a() {}'
    const result = extractExports(code)
    expect(result).toContain('a')
    expect(result).toContain('b')
    expect(result.length).toBe(2)
  })

  it('returns empty for no exports', () => {
    expect(extractExports('const x = 1')).toEqual([])
  })
})

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts static import path', () => {
    expect(extractImports("import { x } from './foo'")).toEqual(['./foo'])
  })

  it('extracts dynamic import path', () => {
    expect(extractImports("import('./bar')")).toEqual(['./bar'])
  })

  it('extracts multiple imports and deduplicates', () => {
    const code = "import { a } from './x'\nimport { b } from './x'"
    const result = extractImports(code)
    expect(result).toEqual(['./x'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── countGravity ─────────────────────────────────────────────────────────────

describe('countGravity', () => {
  it('counts files that reference the target', () => {
    const files = ['src/foo.ts', 'src/bar.ts', 'src/baz.ts']
    const contents = ['', "import { x } from './foo'", "import { y } from './foo'"]
    expect(countGravity('src/foo.ts', files, contents)).toBe(2)
  })

  it('excludes the file itself', () => {
    const files = ['src/foo.ts']
    const contents = ["import { x } from './foo'"]
    expect(countGravity('src/foo.ts', files, contents)).toBe(0)
  })

  it('returns 0 when no references', () => {
    const files = ['src/foo.ts', 'src/bar.ts']
    const contents = ['', 'const x = 1']
    expect(countGravity('src/foo.ts', files, contents)).toBe(0)
  })
})

// ─── computeComplexity ────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeComplexity('if (a) { b }')).toBe(2)
  })

  it('counts for loops', () => {
    expect(computeComplexity('for (let i = 0; i < n; i++) {}')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(computeComplexity('a && b')).toBe(2)
  })

  it('counts multiple patterns', () => {
    expect(computeComplexity('if (a) { for (let i = 0; i < n; i++) {} }')).toBe(3)
  })
})

// ─── computeDistance ──────────────────────────────────────────────────────────

describe('computeDistance', () => {
  it('returns 0 for root file', () => {
    expect(computeDistance('main.ts')).toBe(0)
  })

  it('returns depth for nested file', () => {
    expect(computeDistance('src/commands/foo.ts')).toBe(2)
  })

  it('returns 1 for one level deep', () => {
    expect(computeDistance('src/foo.ts')).toBe(1)
  })
})

// ─── isDocumented ─────────────────────────────────────────────────────────────

describe('isDocumented', () => {
  it('detects JSDoc comments', () => {
    expect(isDocumented('/** docs */\nexport function foo() {}')).toBe(true)
  })

  it('detects single-line comments', () => {
    expect(isDocumented('// some comment\nconst x = 1')).toBe(true)
  })

  it('returns false for undocumented code', () => {
    expect(isDocumented('const x = 1')).toBe(false)
  })
})

// ─── hasClearPurpose ──────────────────────────────────────────────────────────

describe('hasClearPurpose', () => {
  it('returns true for code with exports', () => {
    expect(hasClearPurpose('export function foo() {}')).toBe(true)
  })

  it('returns false for code without exports', () => {
    expect(hasClearPurpose('const x = 1')).toBe(false)
  })
})

// ─── classifyBodyType ─────────────────────────────────────────────────────────

describe('classifyBodyType', () => {
  it('classifies star: high magnitude + high gravity', () => {
    expect(classifyBodyType(80, 50, 5, 10, true, true, false, false)).toBe('star')
  })

  it('classifies planet: moderate magnitude + some gravity', () => {
    expect(classifyBodyType(40, 30, 2, 5, true, true, false, false)).toBe('planet')
  })

  it('classifies moon: low magnitude', () => {
    expect(classifyBodyType(15, 10, 0, 2, true, true, false, false)).toBe('moon')
  })

  it('classifies asteroid: small utility', () => {
    expect(classifyBodyType(5, 5, 0, 1, false, true, false, false)).toBe('asteroid')
  })

  it('classifies comet: high gravity but low magnitude', () => {
    expect(classifyBodyType(10, 5, 3, 2, false, true, false, false)).toBe('comet')
  })

  it('classifies black-hole: high gravity + large mass + undocumented', () => {
    expect(classifyBodyType(70, 100, 6, 10, false, true, false, false)).toBe('black-hole')
  })

  it('classifies supernova: complex for size', () => {
    expect(classifyBodyType(50, 20, 2, 5, true, true, true, false)).toBe('supernova')
  })

  it('classifies pulsar: has dead code indicators', () => {
    expect(classifyBodyType(50, 30, 2, 5, true, true, false, true)).toBe('pulsar')
  })

  it('classifies dark-matter: no purpose, no docs, no gravity', () => {
    expect(classifyBodyType(5, 10, 0, 1, false, false, false, false)).toBe('dark-matter')
  })

  it('prioritizes dark-matter over other types', () => {
    expect(classifyBodyType(0, 0, 0, 0, false, false, false, false)).toBe('dark-matter')
  })
})

// ─── isComplexForSize ─────────────────────────────────────────────────────────

describe('isComplexForSize', () => {
  it('returns true when complexity density > 0.2', () => {
    expect(isComplexForSize(30, 100)).toBe(true)
  })

  it('returns false when complexity density <= 0.2', () => {
    expect(isComplexForSize(3, 100)).toBe(false)
  })

  it('returns false for small files under 5 lines', () => {
    expect(isComplexForSize(100, 3)).toBe(false)
  })
})

// ─── hasDeadCodeIndicators ────────────────────────────────────────────────────

describe('hasDeadCodeIndicators', () => {
  it('detects TODO', () => {
    expect(hasDeadCodeIndicators('// TODO: fix this')).toBe(true)
  })

  it('detects FIXME', () => {
    expect(hasDeadCodeIndicators('// FIXME: broken')).toBe(true)
  })

  it('detects debugger', () => {
    expect(hasDeadCodeIndicators('debugger')).toBe(true)
  })

  it('detects DEPRECATED', () => {
    expect(hasDeadCodeIndicators('// DEPRECATED')).toBe(true)
  })

  it('returns false for clean code', () => {
    expect(hasDeadCodeIndicators('const x = 1')).toBe(false)
  })
})

// ─── classifyBody ─────────────────────────────────────────────────────────────

describe('classifyBody', () => {
  it('classifies a documented, exported, high-gravity file as star', () => {
    const files = ['src/core.ts', 'src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts']
    const contents = [
      '/** Core module */\nexport function core() {}\nexport function helper() {}',
      "import { core } from './core'",
      "import { core } from './core'",
      "import { core } from './core'",
      "import { core } from './core'",
    ]
    const body = classifyBody(contents[0], files[0], files, contents)
    expect(body.type).toBe('star')
    expect(body.gravity).toBe(4)
    expect(body.isObservable).toBe(true)
  })

  it('classifies an undocumented file with no exports as dark-matter', () => {
    const files = ['src/dead.ts']
    const contents = ['const x = 1\nconst y = 2']
    const body = classifyBody(contents[0], files[0], files, contents)
    expect(body.type).toBe('dark-matter')
    expect(body.isObservable).toBe(false)
  })

  it('sets correct distance based on path depth', () => {
    const files = ['src/commands/deep/nested.ts']
    const contents = ['export function foo() {}']
    const body = classifyBody(contents[0], files[0], files, contents)
    expect(body.distance).toBe(3)
  })
})

// ─── resolveImport ────────────────────────────────────────────────────────────

describe('resolveImport', () => {
  it('resolves relative import with extension', () => {
    expect(resolveImport('./foo', 'src', ['src/foo.ts'])).toBe('src/foo.ts')
  })

  it('resolves relative import without extension', () => {
    expect(resolveImport('./foo', 'src', ['src/foo.ts'])).toBe('src/foo.ts')
  })

  it('resolves index file', () => {
    expect(resolveImport('./foo', 'src', ['src/foo/index.ts'])).toBe('src/foo/index.ts')
  })

  it('returns null for non-relative imports', () => {
    expect(resolveImport('chalk', 'src', ['src/chalk.ts'])).toBeNull()
  })

  it('returns null when file not found', () => {
    expect(resolveImport('./missing', 'src', ['src/other.ts'])).toBeNull()
  })
})

// ─── describeShape ────────────────────────────────────────────────────────────

describe('describeShape', () => {
  it('returns scattered for no connections', () => {
    expect(describeShape([], 5)).toBe('scattered')
  })

  it('returns binary for single connection', () => {
    expect(describeShape([['a', 'b']], 2)).toBe('binary')
  })

  it('returns hub-and-spoke for single target', () => {
    expect(describeShape([['a', 'hub'], ['b', 'hub']], 3)).toBe('hub-and-spoke')
  })

  it('returns mesh for dense connections', () => {
    const connections: [string, string][] = [['a', 'b'], ['b', 'c'], ['c', 'd']]
    expect(describeShape(connections, 4)).toBe('mesh')
  })

  it('returns chain for sparse connections', () => {
    const connections: [string, string][] = [['a', 'b'], ['c', 'd']]
    expect(describeShape(connections, 10)).toBe('chain')
  })
})

// ─── mapConstellations ────────────────────────────────────────────────────────

describe('mapConstellations', () => {
  it('groups files by directory', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/a.ts', name: 'a', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 1, constellation: null, isObservable: true },
      { file: 'src/b.ts', name: 'b', type: 'planet', magnitude: 40, mass: 30, gravity: 1, temperature: 3, distance: 1, constellation: null, isObservable: true },
    ]
    const files = ['src/a.ts', 'src/b.ts']
    const contents = ["import { b } from './b'", 'export function b() {}']
    const constellations = mapConstellations(bodies, files, contents)
    expect(constellations.length).toBe(1)
    expect(constellations[0].name).toBe('src')
  })

  it('creates separate constellations for different directories', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/a.ts', name: 'a', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 1, constellation: null, isObservable: true },
      { file: 'test/b.ts', name: 'b', type: 'planet', magnitude: 40, mass: 30, gravity: 1, temperature: 3, distance: 1, constellation: null, isObservable: false },
    ]
    const files = ['src/a.ts', 'test/b.ts']
    const contents = ['export function a() {}', "import { a } from '../src/a'"]
    const constellations = mapConstellations(bodies, files, contents)
    expect(constellations.length).toBe(2)
  })

  it('assigns constellation names to bodies', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/core.ts', name: 'core', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 1, constellation: null, isObservable: true },
    ]
    const files = ['src/core.ts']
    const contents = ['export function core() {}']
    mapConstellations(bodies, files, contents)
    expect(bodies[0].constellation).toBe('src')
  })
})

// ─── detectCelestialEvents ────────────────────────────────────────────────────

describe('detectCelestialEvents', () => {
  it('detects eclipse events for black holes', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/hole.ts', name: 'hole', type: 'black-hole', magnitude: 70, mass: 100, gravity: 6, temperature: 10, distance: 1, constellation: null, isObservable: false },
    ]
    const events = detectCelestialEvents(bodies, [])
    const eclipse = events.find(e => e.type === 'eclipse')
    expect(eclipse).toBeDefined()
    expect(eclipse!.impact).toBe('high')
  })

  it('detects alignment for many dark matter files', () => {
    const bodies: CelestialBody[] = Array.from({ length: 4 }, (_, i) => ({
      file: `src/dm${i}.ts`, name: `dm${i}`, type: 'dark-matter' as const, magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 1, constellation: null, isObservable: false,
    }))
    const events = detectCelestialEvents(bodies, [])
    const alignment = events.find(e => e.type === 'alignment')
    expect(alignment).toBeDefined()
  })

  it('detects collision for supernovae', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/explode.ts', name: 'explode', type: 'supernova', magnitude: 50, mass: 20, gravity: 2, temperature: 30, distance: 1, constellation: null, isObservable: true },
    ]
    const events = detectCelestialEvents(bodies, [])
    const collision = events.find(e => e.type === 'collision')
    expect(collision).toBeDefined()
  })

  it('detects formation for invisible large constellations', () => {
    const bodies: CelestialBody[] = []
    const constellations: Constellation[] = [{
      name: 'Legacy', stars: ['a.ts', 'b.ts', 'c.ts'], connections: [],
      brightness: 30, size: 3, shape: 'scattered', isVisible: false,
    }]
    const events = detectCelestialEvents(bodies, constellations)
    const formation = events.find(e => e.type === 'formation')
    expect(formation).toBeDefined()
  })

  it('detects convergence for high-gravity bodies', () => {
    const bodies: CelestialBody[] = Array.from({ length: 3 }, (_, i) => ({
      file: `src/core${i}.ts`, name: `core${i}`, type: 'star' as const, magnitude: 80, mass: 50, gravity: 6, temperature: 5, distance: 1, constellation: null, isObservable: true,
    }))
    const events = detectCelestialEvents(bodies, [])
    const convergence = events.find(e => e.type === 'convergence')
    expect(convergence).toBeDefined()
  })

  it('returns empty for a clean codebase', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/clean.ts', name: 'clean', type: 'planet', magnitude: 40, mass: 30, gravity: 1, temperature: 3, distance: 1, constellation: null, isObservable: true },
    ]
    const events = detectCelestialEvents(bodies, [])
    expect(events.length).toBe(0)
  })
})

// ─── mapCosmicWeb ─────────────────────────────────────────────────────────────

describe('mapCosmicWeb', () => {
  it('creates web clusters from constellation names', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/a.ts', name: 'a', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 1, constellation: 'src', isObservable: true },
      { file: 'src/b.ts', name: 'b', type: 'planet', magnitude: 40, mass: 30, gravity: 1, temperature: 3, distance: 1, constellation: 'src', isObservable: true },
    ]
    const constellations: Constellation[] = [{
      name: 'src', stars: ['src/a.ts', 'src/b.ts'], connections: [['src/a.ts', 'src/b.ts']],
      brightness: 60, size: 2, shape: 'binary', isVisible: true,
    }]
    const web = mapCosmicWeb(bodies, constellations)
    expect(web.length).toBe(1)
    expect(web[0].cluster).toBe('src')
    expect(web[0].density).toBeGreaterThan(0)
  })

  it('identifies void files with zero gravity', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/iso.ts', name: 'iso', type: 'asteroid', magnitude: 5, mass: 5, gravity: 0, temperature: 1, distance: 1, constellation: 'src', isObservable: false },
    ]
    const web = mapCosmicWeb(bodies, [])
    expect(web[0].voidFiles).toContain('src/iso.ts')
  })
})

// ─── computeObservableRatio ───────────────────────────────────────────────────

describe('computeObservableRatio', () => {
  it('returns 100 for all observable', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 0, constellation: null, isObservable: true },
    ]
    expect(computeObservableRatio(bodies)).toBe(100)
  })

  it('returns 0 for none observable', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'dark-matter', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: false },
    ]
    expect(computeObservableRatio(bodies)).toBe(0)
  })

  it('returns 100 for empty array', () => {
    expect(computeObservableRatio([])).toBe(100)
  })

  it('computes mixed ratio', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 0, constellation: null, isObservable: true },
      { file: 'b.ts', name: 'b', type: 'dark-matter', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: false },
    ]
    expect(computeObservableRatio(bodies)).toBe(50)
  })
})

// ─── computeDarkMatterRatio ───────────────────────────────────────────────────

describe('computeDarkMatterRatio', () => {
  it('returns 0 for no dark matter', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'star', magnitude: 80, mass: 50, gravity: 3, temperature: 5, distance: 0, constellation: null, isObservable: true },
    ]
    expect(computeDarkMatterRatio(bodies)).toBe(0)
  })

  it('returns 100 for all dark matter', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'dark-matter', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: false },
    ]
    expect(computeDarkMatterRatio(bodies)).toBe(100)
  })

  it('returns 0 for empty array', () => {
    expect(computeDarkMatterRatio([])).toBe(0)
  })
})

// ─── classifyOverallClarity ───────────────────────────────────────────────────

describe('classifyOverallClarity', () => {
  it('returns crystal-clear for high observable, low dark matter', () => {
    expect(classifyOverallClarity(90, 5)).toBe('crystal-clear')
  })

  it('returns clear for good observable', () => {
    expect(classifyOverallClarity(65, 15)).toBe('clear')
  })

  it('returns partly-cloudy for moderate', () => {
    expect(classifyOverallClarity(45, 25)).toBe('partly-cloudy')
  })

  it('returns overcast for low observable', () => {
    expect(classifyOverallClarity(25, 40)).toBe('overcast')
  })

  it('returns opaque for very low observable', () => {
    expect(classifyOverallClarity(10, 60)).toBe('opaque')
  })
})

// ─── computeCosmicExpansion ───────────────────────────────────────────────────

describe('computeCosmicExpansion', () => {
  it('returns 0 for empty', () => {
    expect(computeCosmicExpansion([])).toBe(0)
  })

  it('returns 0 for uniform small files', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'asteroid', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: true },
      { file: 'b.ts', name: 'b', type: 'asteroid', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: true },
    ]
    expect(computeCosmicExpansion(bodies)).toBe(0)
  })

  it('returns positive for large outlier files', () => {
    const bodies: CelestialBody[] = [
      { file: 'big.ts', name: 'big', type: 'star', magnitude: 80, mass: 500, gravity: 3, temperature: 5, distance: 0, constellation: null, isObservable: true },
      { file: 's1.ts', name: 's1', type: 'asteroid', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: true },
      { file: 's2.ts', name: 's2', type: 'asteroid', magnitude: 5, mass: 10, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: true },
    ]
    expect(computeCosmicExpansion(bodies)).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends investigating black holes', () => {
    const stats = { blackHoleCount: 2, darkMatterRatio: 5, supernovae: 0, observableRatio: 80 } as ObservatoryStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('black hole'))).toBe(true)
  })

  it('recommends reducing dark matter when high', () => {
    const stats = { blackHoleCount: 0, darkMatterRatio: 25, supernovae: 0, observableRatio: 80 } as ObservatoryStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('dark matter'))).toBe(true)
  })

  it('recommends simplifying supernovae', () => {
    const stats = { blackHoleCount: 0, darkMatterRatio: 5, supernovae: 3, observableRatio: 80 } as ObservatoryStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('supernova'))).toBe(true)
  })

  it('recommends improving documentation for invisible constellations', () => {
    const constellations: Constellation[] = [{
      name: 'Legacy', stars: [], connections: [], brightness: 10, size: 5, shape: 'scattered', isVisible: false,
    }]
    const stats = { blackHoleCount: 0, darkMatterRatio: 5, supernovae: 0, observableRatio: 80 } as ObservatoryStats
    const recs = generateRecommendations([], constellations, [], stats)
    expect(recs.some(r => r.includes('invisible constellation'))).toBe(true)
  })

  it('recommends connecting isolated files', () => {
    const bodies: CelestialBody[] = [
      { file: 'iso.ts', name: 'iso', type: 'asteroid', magnitude: 5, mass: 5, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: true },
    ]
    const stats = { blackHoleCount: 0, darkMatterRatio: 5, supernovae: 0, observableRatio: 80 } as ObservatoryStats
    const recs = generateRecommendations(bodies, [], [], stats)
    expect(recs.some(r => r.includes('isolated'))).toBe(true)
  })

  it('recommends increasing observability when low', () => {
    const stats = { blackHoleCount: 0, darkMatterRatio: 5, supernovae: 0, observableRatio: 30 } as ObservatoryStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('observability'))).toBe(true)
  })

  it('recommends addressing high-impact events', () => {
    const events: CelestialEvent[] = [{
      type: 'eclipse', description: 'test', bodies: [], impact: 'high', recommendation: 'fix',
    }]
    const stats = { blackHoleCount: 0, darkMatterRatio: 5, supernovae: 0, observableRatio: 80 } as ObservatoryStats
    const recs = generateRecommendations([], [], events, stats)
    expect(recs.some(r => r.includes('high-impact'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const stats = { blackHoleCount: 0, darkMatterRatio: 2, supernovae: 0, observableRatio: 95 } as ObservatoryStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.length).toBe(0)
  })
})

// ─── buildObservatoryResult ───────────────────────────────────────────────────

describe('buildObservatoryResult', () => {
  it('returns complete result structure', () => {
    const result = buildObservatoryResult(['src/a.ts'], ['export function a() {}'], {})
    expect(result.bodies).toHaveLength(1)
    expect(result.stats.totalBodies).toBe(1)
    expect(result.recommendations).toBeDefined()
    expect(result.events).toBeDefined()
    expect(result.web).toBeDefined()
    expect(result.constellations).toBeDefined()
  })

  it('handles empty files', () => {
    const result = buildObservatoryResult([], [], {})
    expect(result.stats.totalBodies).toBe(0)
    expect(result.stats.overallClarity).toBe('crystal-clear')
    expect(result.stats.observableRatio).toBe(100)
  })

  it('computes maxGravity file name', () => {
    const files = ['src/core.ts', 'src/periph.ts']
    const contents = [
      '/** Core */\nexport function core() {}',
      "import { core } from './core'",
    ]
    const result = buildObservatoryResult(files, contents, {})
    expect(result.stats.maxGravity).toBe('src/core.ts')
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatBodyType returns emoji + type', () => {
    expect(formatBodyType('star')).toContain('star')
    expect(formatBodyType('black-hole')).toContain('black-hole')
  })

  it('formatMagnitude returns 20-char bar', () => {
    const result = formatMagnitude(50)
    expect(result).toContain('█')
    expect(result).toContain('░')
  })

  it('formatBody formats a body', () => {
    const body: CelestialBody = {
      file: 'src/core.ts', name: 'core', type: 'star', magnitude: 80,
      mass: 50, gravity: 5, temperature: 10, distance: 1,
      constellation: null, isObservable: true,
    }
    const result = formatBody(body)
    expect(result).toContain('core.ts')
    expect(result).toContain('star')
  })

  it('formatBodiesTable handles empty', () => {
    expect(formatBodiesTable([])).toContain('No celestial bodies')
  })

  it('formatBodiesTable sorts by magnitude', () => {
    const bodies: CelestialBody[] = [
      { file: 'low.ts', name: 'low', type: 'moon', magnitude: 10, mass: 5, gravity: 0, temperature: 1, distance: 0, constellation: null, isObservable: true },
      { file: 'high.ts', name: 'high', type: 'star', magnitude: 90, mass: 50, gravity: 5, temperature: 10, distance: 1, constellation: null, isObservable: true },
    ]
    const table = formatBodiesTable(bodies)
    const highIdx = table.indexOf('high.ts')
    const lowIdx = table.indexOf('low.ts')
    expect(highIdx).toBeLessThan(lowIdx)
  })

  it('formatConstellation formats constellation', () => {
    const con: Constellation = {
      name: 'Core', stars: ['a.ts', 'b.ts'], connections: [],
      brightness: 70, size: 2, shape: 'binary', isVisible: true,
    }
    const result = formatConstellation(con)
    expect(result).toContain('Core')
    expect(result).toContain('visible')
  })

  it('formatConstellations handles empty', () => {
    expect(formatConstellations([])).toContain('No constellations')
  })

  it('formatImpact colors each level', () => {
    expect(formatImpact('informational')).toContain('INFORMATIONAL')
    expect(formatImpact('low')).toContain('LOW')
    expect(formatImpact('medium')).toContain('MEDIUM')
    expect(formatImpact('high')).toContain('HIGH')
    expect(formatImpact('critical')).toContain('CRITICAL')
  })

  it('formatEvent formats event', () => {
    const event: CelestialEvent = {
      type: 'eclipse', description: 'test event', bodies: [],
      impact: 'high', recommendation: 'fix it',
    }
    const result = formatEvent(event)
    expect(result).toContain('eclipse')
    expect(result).toContain('test event')
  })

  it('formatEvents handles empty', () => {
    expect(formatEvents([])).toContain('No celestial events')
  })

  it('formatWebCluster formats cluster', () => {
    const web: CosmicWeb = {
      cluster: 'Core', filaments: ['a → b'], density: 50, voidFiles: [],
    }
    const result = formatWebCluster(web)
    expect(result).toContain('Core')
  })

  it('formatCosmicWeb handles empty', () => {
    expect(formatCosmicWeb([])).toContain('No cosmic web')
  })

  it('formatClarity colors each level', () => {
    expect(formatClarity('crystal-clear')).toContain('CRYSTAL-CLEAR')
    expect(formatClarity('opaque')).toContain('OPAQUE')
  })

  it('formatStats produces summary', () => {
    const stats: ObservatoryStats = {
      totalBodies: 10, stars: 3, blackHoles: 1, darkMatter: 2, pulsars: 1, supernovae: 0,
      totalConstellations: 4, visibleConstellations: 2, avgMagnitude: 50, avgGravity: 2.5,
      maxGravity: 'core.ts', observableRatio: 70, darkMatterRatio: 20,
      blackHoleCount: 1, cosmicExpansion: 30, universeSize: 500,
      overallClarity: 'clear',
    }
    const result = formatStats(stats)
    expect(result).toContain('10')
    expect(result).toContain('CLEAR')
  })

  it('formatRecommendations numbers items', () => {
    const result = formatRecommendations(['First', 'Second'])
    expect(result).toContain('1.')
    expect(result).toContain('2.')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatObservatoryResult produces full output', () => {
    const result = buildObservatoryResult(['src/a.ts'], ['export function a() {}'], {})
    const output = formatObservatoryResult(result)
    expect(output).toContain('OBSERVATORY SUMMARY')
    expect(output).toContain('Celestial Bodies')
  })

  it('formatObservatoryJson produces valid JSON', () => {
    const result = buildObservatoryResult(['src/a.ts'], ['export function a() {}'], {})
    const json = formatObservatoryJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.bodies).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('observatory integration', () => {
  it('full analysis of a small codebase', () => {
    const files = ['src/core.ts', 'src/utils.ts', 'src/dead.ts']
    const contents = [
      '/** Core module */\nexport function main() {}\nexport function helper() {}',
      "import { main } from './core'\nexport function util() {}",
      'const x = 1\nconst y = 2\nconst z = 3',
    ]
    const result = buildObservatoryResult(files, contents, {})
    expect(result.bodies.length).toBe(3)
    expect(result.stats.totalBodies).toBe(3)
    expect(result.stats.universeSize).toBeGreaterThan(0)
  })

  it('healthy codebase is crystal-clear', () => {
    const files = ['src/a.ts', 'src/b.ts']
    const contents = [
      '/** Documented */\nexport function a() {}',
      '/** Documented */\nexport function b() {}',
    ]
    const result = buildObservatoryResult(files, contents, {})
    expect(result.stats.overallClarity).toBe('crystal-clear')
    expect(result.stats.observableRatio).toBe(100)
  })
})
