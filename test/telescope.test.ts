import { describe, expect, it } from 'vitest'

import {
  buildImportGraph,
  buildTelescopeResult,
  classifyBody,
  computeDistance,
  computeGravity,
  computeLuminosity,
  computeMagnitude,
  computeMass,
  computeObservableUniverse,
  countReverseCoupling,
  findDarkMatter,
  findEntryPoints,
  generateRecommendations,
  groupIntoConstellations,
  observeAtZoom,
  type CelestialBody,
  type Constellation,
  type DeepField,
  type TelescopeStats,
} from '../src/commands/telescope-helpers.js'

import {
  formatTelescopeJSON,
  formatTelescopeTable,
  formatConstellationMap,
  formatBodyTable,
  formatDeepFields,
  formatLuminosityHistogram,
  formatGravityWellMap,
  formatTelescopeStats,
  formatTelescopeRecommendations,
} from '../src/commands/telescope-format-helpers.js'

// ─── classifyBody ───────────────────────────────────────────────────────────────

describe('classifyBody', () => {
  it('classifies very high coupling as blackhole', () => {
    expect(classifyBody('god.ts', 'code', 10, 8, 200)).toBe('blackhole')
  })

  it('classifies large high-import files as nebula', () => {
    expect(classifyBody('big.ts', 'code', 10, 2, 400)).toBe('nebula')
  })

  it('classifies large high-coupling non-nebula as star', () => {
    expect(classifyBody('core.ts', 'code', 3, 5, 400)).toBe('star')
  })

  it('classifies large low-coupling files as nebula', () => {
    expect(classifyBody('big.ts', 'code', 2, 1, 400)).toBe('nebula')
  })

  it('classifies high-coupling as star', () => {
    expect(classifyBody('mod.ts', 'code', 5, 5, 100)).toBe('star')
  })

  it('classifies moderate coupling + mass as planet', () => {
    expect(classifyBody('util.ts', 'code', 2, 3, 100)).toBe('planet')
  })

  it('classifies high mass low coupling as planet', () => {
    expect(classifyBody('mod.ts', 'code', 1, 1, 100)).toBe('planet')
  })

  it('classifies tiny files as asteroid', () => {
    expect(classifyBody('const.ts', 'const x = 1', 0, 0, 5)).toBe('asteroid')
  })

  it('classifies test files as comet', () => {
    expect(classifyBody('mod.test.ts', 'code', 1, 0, 30)).toBe('comet')
  })

  it('classifies spec files as comet', () => {
    expect(classifyBody('mod.spec.ts', 'code', 1, 0, 30)).toBe('comet')
  })

  it('classifies small utilities as moon', () => {
    expect(classifyBody('helpers.ts', 'code', 1, 0, 20)).toBe('moon')
  })
})

// ─── computeLuminosity ──────────────────────────────────────────────────────────

describe('computeLuminosity', () => {
  it('returns 0 for empty content', () => {
    expect(computeLuminosity('')).toBe(0)
  })

  it('increases with control flow', () => {
    const simple = 'const x = 1\n'
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { while (y) { switch(z) {} } } }'
    expect(computeLuminosity(complex)).toBeGreaterThan(computeLuminosity(simple))
  })

  it('counts async/await patterns', () => {
    const code = 'async function run() { await doWork() }'
    expect(computeLuminosity(code)).toBeGreaterThan(0)
  })

  it('counts class and interface keywords', () => {
    const code = 'class Foo {}\ninterface Bar {}'
    expect(computeLuminosity(code)).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    const lotsOfComplexity = Array(100).fill('if (x) { for (let i = 0; i < 10; i++) { while (y) { switch(z) {} } } }').join('\n')
    expect(computeLuminosity(lotsOfComplexity)).toBeLessThanOrEqual(100)
  })
})

// ─── computeMass ────────────────────────────────────────────────────────────────

describe('computeMass', () => {
  it('returns 0 for empty content', () => {
    expect(computeMass('')).toBe(0)
  })

  it('counts non-empty lines', () => {
    expect(computeMass('line1\nline2\nline3')).toBe(3)
  })

  it('ignores blank lines', () => {
    expect(computeMass('line1\n\n\nline2')).toBe(2)
  })
})

// ─── computeGravity ─────────────────────────────────────────────────────────────

describe('computeGravity', () => {
  it('sums imports and exported-to counts', () => {
    expect(computeGravity(5, 3)).toBe(8)
  })

  it('returns 0 for no coupling', () => {
    expect(computeGravity(0, 0)).toBe(0)
  })
})

// ─── computeDistance ────────────────────────────────────────────────────────────

describe('computeDistance', () => {
  it('returns 0 for entry points', () => {
    const graph = new Map<string, string[]>([['index.ts', ['utils.ts']]])
    expect(computeDistance('index.ts', ['index.ts'], graph)).toBe(0)
  })

  it('returns 1 for direct imports', () => {
    const graph = new Map<string, string[]>([['index.ts', ['utils.ts']]])
    expect(computeDistance('utils.ts', ['index.ts'], graph)).toBe(1)
  })

  it('returns 2 for transitive imports', () => {
    const graph = new Map<string, string[]>([
      ['index.ts', ['mid.ts']],
      ['mid.ts', ['deep.ts']],
    ])
    expect(computeDistance('deep.ts', ['index.ts'], graph)).toBe(2)
  })

  it('returns 999 for unreachable files', () => {
    const graph = new Map<string, string[]>([['index.ts', ['utils.ts']]])
    expect(computeDistance('orphan.ts', ['index.ts'], graph)).toBe(999)
  })

  it('returns 999 when no entry points', () => {
    expect(computeDistance('any.ts', [], new Map())).toBe(999)
  })
})

// ─── computeMagnitude ───────────────────────────────────────────────────────────

describe('computeMagnitude', () => {
  it('returns higher magnitude for high-gravity bodies', () => {
    const high: CelestialBody = {
      file: 'core.ts', name: 'core', type: 'star', luminosity: 50, mass: 100,
      gravity: 10, age: 0, distance: 0, constellation: '.', magnitude: 0,
    }
    const low: CelestialBody = {
      file: 'util.ts', name: 'util', type: 'moon', luminosity: 50, mass: 100,
      gravity: 2, age: 0, distance: 0, constellation: '.', magnitude: 0,
    }
    expect(computeMagnitude(high)).toBeGreaterThan(computeMagnitude(low))
  })

  it('caps at 100', () => {
    const body: CelestialBody = {
      file: 'god.ts', name: 'god', type: 'blackhole', luminosity: 100, mass: 500,
      gravity: 20, age: 0, distance: 0, constellation: '.', magnitude: 0,
    }
    expect(computeMagnitude(body)).toBeLessThanOrEqual(100)
  })
})

// ─── buildImportGraph ───────────────────────────────────────────────────────────

describe('buildImportGraph', () => {
  it('builds graph from relative imports', () => {
    const content = "import { foo } from './utils'\nexport const x = 1"
    const graph = buildImportGraph(['src/mod.ts', 'src/utils.ts'], [content, ''])
    const edges = graph.get('src/mod.ts') ?? []
    expect(edges).toContain('src/utils.ts')
  })

  it('ignores non-relative imports', () => {
    const content = "import chalk from 'chalk'\nexport const x = 1"
    const graph = buildImportGraph(['mod.ts'], [content])
    const edges = graph.get('mod.ts') ?? []
    expect(edges).toHaveLength(0)
  })

  it('handles multiple imports', () => {
    const content = "import { a } from './a'\nimport { b } from './b'"
    const graph = buildImportGraph(['mod.ts', 'a.ts', 'b.ts'], [content, '', ''])
    const edges = graph.get('mod.ts') ?? []
    expect(edges).toHaveLength(2)
  })
})

// ─── findEntryPoints ────────────────────────────────────────────────────────────

describe('findEntryPoints', () => {
  it('finds index.ts files', () => {
    expect(findEntryPoints(['src/index.ts', 'src/utils.ts'])).toEqual(['src/index.ts'])
  })

  it('finds main.ts files', () => {
    expect(findEntryPoints(['src/main.ts', 'src/utils.ts'])).toEqual(['src/main.ts'])
  })

  it('falls back to first file', () => {
    expect(findEntryPoints(['src/utils.ts', 'src/helpers.ts'])).toEqual(['src/utils.ts'])
  })

  it('returns empty for no files', () => {
    expect(findEntryPoints([])).toEqual([])
  })
})

// ─── computeObservableUniverse ──────────────────────────────────────────────────

describe('computeObservableUniverse', () => {
  it('reaches all connected files', () => {
    const graph = new Map<string, string[]>([
      ['index.ts', ['a.ts', 'b.ts']],
      ['a.ts', ['c.ts']],
      ['b.ts', []],
      ['c.ts', []],
    ])
    const reachable = computeObservableUniverse(['index.ts'], graph)
    expect(reachable.size).toBe(4)
  })

  it('does not reach orphan files', () => {
    const graph = new Map<string, string[]>([
      ['index.ts', ['a.ts']],
      ['a.ts', []],
      ['orphan.ts', []],
    ])
    const reachable = computeObservableUniverse(['index.ts'], graph)
    expect(reachable.has('orphan.ts')).toBe(false)
  })
})

// ─── findDarkMatter ─────────────────────────────────────────────────────────────

describe('findDarkMatter', () => {
  it('finds orphan files', () => {
    const graph = new Map<string, string[]>([
      ['index.ts', ['a.ts']],
      ['a.ts', []],
      ['orphan.ts', []],
    ])
    const dark = findDarkMatter(['index.ts', 'a.ts', 'orphan.ts'], ['index.ts'], graph)
    expect(dark).toEqual(['orphan.ts'])
  })

  it('returns empty when all files are reachable', () => {
    const graph = new Map<string, string[]>([
      ['index.ts', ['a.ts']],
      ['a.ts', []],
    ])
    const dark = findDarkMatter(['index.ts', 'a.ts'], ['index.ts'], graph)
    expect(dark).toEqual([])
  })
})

// ─── countReverseCoupling ───────────────────────────────────────────────────────

describe('countReverseCoupling', () => {
  it('counts how many files import each file', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [
      "import { x } from './b'\nimport { y } from './c'",
      "import { z } from './c'",
      'const x = 1',
    ]
    const counts = countReverseCoupling(files, contents)
    expect(counts.get('src/b.ts')).toBe(1)
    expect(counts.get('src/c.ts')).toBe(2)
    expect(counts.get('src/a.ts')).toBe(0)
  })
})

// ─── groupIntoConstellations ────────────────────────────────────────────────────

describe('groupIntoConstellations', () => {
  it('groups by constellation', () => {
    const bodies: CelestialBody[] = [
      { file: 'src/a.ts', name: 'a', type: 'star', luminosity: 50, mass: 100, gravity: 5, age: 0, distance: 0, constellation: 'src', magnitude: 50 },
      { file: 'src/b.ts', name: 'b', type: 'planet', luminosity: 30, mass: 80, gravity: 3, age: 0, distance: 1, constellation: 'src', magnitude: 30 },
      { file: 'lib/c.ts', name: 'c', type: 'moon', luminosity: 10, mass: 20, gravity: 1, age: 0, distance: 2, constellation: 'lib', magnitude: 10 },
    ]
    const consts = groupIntoConstellations(bodies)
    expect(consts).toHaveLength(2)
    const srcConst = consts.find((c) => c.name === 'src')!
    expect(srcConst.bodies).toHaveLength(2)
    expect(srcConst.stars).toBe(1)
    expect(srcConst.totalMass).toBe(180)
  })

  it('returns empty for no bodies', () => {
    expect(groupIntoConstellations([])).toHaveLength(0)
  })
})

// ─── observeAtZoom ──────────────────────────────────────────────────────────────

describe('observeAtZoom', () => {
  const bodies: CelestialBody[] = [
    { file: 'god.ts', name: 'god', type: 'blackhole', luminosity: 90, mass: 400, gravity: 15, age: 0, distance: 0, constellation: '.', magnitude: 80 },
    { file: 'util.ts', name: 'util', type: 'moon', luminosity: 10, mass: 20, gravity: 1, age: 0, distance: 1, constellation: '.', magnitude: 20 },
  ]
  const constellations: Constellation[] = [
    { name: '.', bodies, stars: 1, totalMass: 420, density: 2, brightness: 50 },
  ]

  it('zoom 1 produces macro observations', () => {
    const df = observeAtZoom(1, ['god.ts', 'util.ts'], ['code', 'code'], bodies, constellations)
    expect(df.zoomLevel).toBe(1)
    expect(df.description).toContain('Macro')
    expect(df.observations.length).toBeGreaterThan(0)
  })

  it('zoom 1 detects black holes', () => {
    const df = observeAtZoom(1, ['god.ts'], ['code'], bodies, constellations)
    expect(df.discoveries.some((d) => d.includes('black hole'))).toBe(true)
  })

  it('zoom 2 checks constellation brightness', () => {
    const brightBodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'star', luminosity: 80, mass: 200, gravity: 6, age: 0, distance: 0, constellation: '.', magnitude: 60 },
    ]
    const brightConst: Constellation[] = [
      { name: '.', bodies: brightBodies, stars: 1, totalMass: 200, density: 1, brightness: 80 },
    ]
    const df = observeAtZoom(2, ['a.ts'], ['code'], brightBodies, brightConst)
    expect(df.observations.some((o) => o.description.includes('luminous'))).toBe(true)
  })

  it('zoom 3 analyzes individual bodies', () => {
    const df = observeAtZoom(3, ['god.ts', 'util.ts'], ['code', 'code'], bodies, constellations)
    expect(df.observations.some((o) => o.body === 'god.ts')).toBe(true)
  })

  it('zoom 4 detects function-dense files', () => {
    const denseContent = Array(15).fill('function fn() {}').join('\n')
    const df = observeAtZoom(4, ['dense.ts'], [denseContent], bodies, constellations)
    expect(df.observations.some((o) => o.description.includes('functions'))).toBe(true)
  })

  it('zoom 5 counts complex expressions', () => {
    const exprContent = 'const x = a ? b : c\nconst y = d?.e ?? f'
    const df = observeAtZoom(5, ['mod.ts'], [exprContent], bodies, constellations)
    expect(df.observations.some((o) => o.description.includes('expression'))).toBe(true)
  })

  it('zoom 3 detects comets', () => {
    const cometBodies: CelestialBody[] = [
      { file: 'mod.test.ts', name: 'mod.test', type: 'comet', luminosity: 30, mass: 50, gravity: 1, age: 0, distance: 1, constellation: '.', magnitude: 20 },
    ]
    const df = observeAtZoom(3, ['mod.test.ts'], ['code'], cometBodies, constellations)
    expect(df.discoveries.some((d) => d.includes('comet'))).toBe(true)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: TelescopeStats = {
    totalBodies: 5, starCount: 1, blackholeCount: 0, nebulaCount: 0,
    constellationCount: 2, avgLuminosity: 40, avgMass: 80, maxGravity: 5,
    brightestBody: 'a.ts', heaviestBody: 'b.ts', mostDistant: 'c.ts',
    observableUniverse: 5, darkMatter: 0,
  }

  it('recommends breaking up black holes', () => {
    const bodies: CelestialBody[] = [
      { file: 'god.ts', name: 'god', type: 'blackhole', luminosity: 90, mass: 400, gravity: 15, age: 0, distance: 0, constellation: '.', magnitude: 80 },
    ]
    const recs = generateRecommendations(bodies, [], [], baseStats)
    expect(recs.some((r) => r.includes('black hole'))).toBe(true)
  })

  it('recommends stabilizing nebulae', () => {
    const bodies: CelestialBody[] = [
      { file: 'big.ts', name: 'big', type: 'nebula', luminosity: 60, mass: 350, gravity: 5, age: 0, distance: 0, constellation: '.', magnitude: 50 },
    ]
    const recs = generateRecommendations(bodies, [], [], baseStats)
    expect(recs.some((r) => r.includes('nebula'))).toBe(true)
  })

  it('recommends for dark matter', () => {
    const stats = { ...baseStats, darkMatter: 3 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('dark matter'))).toBe(true)
  })

  it('recommends decoupling high-gravity files', () => {
    const bodies: CelestialBody[] = [
      { file: 'tightly.ts', name: 'tightly', type: 'star', luminosity: 50, mass: 100, gravity: 12, age: 0, distance: 0, constellation: '.', magnitude: 60 },
    ]
    const recs = generateRecommendations(bodies, [], [], baseStats)
    expect(recs.some((r) => r.includes('decouple') || r.includes('gravity'))).toBe(true)
  })

  it('recommends for high avg luminosity', () => {
    const stats = { ...baseStats, avgLuminosity: 70 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('luminosity') || r.includes('simplifying'))).toBe(true)
  })

  it('returns default when all is good', () => {
    const recs = generateRecommendations([], [], [], baseStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildTelescopeResult ───────────────────────────────────────────────────────

describe('buildTelescopeResult', () => {
  it('handles empty files', () => {
    const result = buildTelescopeResult([], [], {})
    expect(result.bodies).toHaveLength(0)
    expect(result.stats.totalBodies).toBe(0)
  })

  it('creates bodies from files', () => {
    const result = buildTelescopeResult(['src/a.ts', 'src/b.ts'], ['code', 'code'], {})
    expect(result.bodies).toHaveLength(2)
  })

  it('groups into constellations', () => {
    const result = buildTelescopeResult(['src/a.ts', 'lib/b.ts'], ['code', 'code'], {})
    expect(result.constellations).toHaveLength(2)
  })

  it('generates 5 deep field observations', () => {
    const result = buildTelescopeResult(['src/a.ts'], ['code'], {})
    expect(result.deepFields).toHaveLength(5)
  })

  it('computes all stats fields', () => {
    const result = buildTelescopeResult(['src/a.ts', 'src/b.ts'], ['code', 'code'], {})
    expect(result.stats.totalBodies).toBe(2)
    expect(result.stats.constellationCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.brightestBody).toBeTruthy()
    expect(result.stats.heaviestBody).toBeTruthy()
  })

  it('detects dark matter from import graph', () => {
    const contents = [
      "import { x } from './b'",
      'const x = 1',
      'const y = 2',
    ]
    const result = buildTelescopeResult(['src/index.ts', 'src/b.ts', 'src/orphan.ts'], contents, {})
    expect(result.stats.darkMatter).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildTelescopeResult(['src/a.ts'], ['code'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('classifies bodies with correct types', () => {
    const bigContent = Array(400).fill('const x = 1').join('\n')
    const result = buildTelescopeResult(['big.ts'], [bigContent], {})
    expect(result.bodies[0].mass).toBeGreaterThan(300)
  })

  it('computes luminosity from content complexity', () => {
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { while (y) { } } }'
    const simple = 'const x = 1'
    const result = buildTelescopeResult(['complex.ts', 'simple.ts'], [complex, simple], {})
    expect(result.bodies[0].luminosity).toBeGreaterThan(result.bodies[1].luminosity)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatConstellationMap', () => {
  it('formats empty constellations', () => {
    expect(formatConstellationMap([])).toContain('No constellations')
  })

  it('formats constellation details', () => {
    const consts: Constellation[] = [
      { name: 'src', bodies: [], stars: 2, totalMass: 300, density: 5, brightness: 60 },
    ]
    const output = formatConstellationMap(consts)
    expect(output).toContain('src')
    expect(output).toContain('5 bodies')
  })
})

describe('formatBodyTable', () => {
  it('formats empty bodies', () => {
    expect(formatBodyTable([])).toContain('No celestial bodies')
  })

  it('formats body details', () => {
    const bodies: CelestialBody[] = [
      { file: 'core.ts', name: 'core', type: 'star', luminosity: 80, mass: 200, gravity: 8, age: 0, distance: 0, constellation: '.', magnitude: 70 },
    ]
    const output = formatBodyTable(bodies)
    expect(output).toContain('core')
    expect(output).toContain('star')
  })
})

describe('formatDeepFields', () => {
  it('formats empty deep fields', () => {
    expect(formatDeepFields([])).toContain('No deep field')
  })

  it('formats deep field observations', () => {
    const dfs: DeepField[] = [
      { zoomLevel: 1, description: 'Macro', observations: [{ description: 'test obs', significance: 'minor', body: '*', detail: 'detail' }], discoveries: ['found something'] },
    ]
    const output = formatDeepFields(dfs)
    expect(output).toContain('Zoom 1')
    expect(output).toContain('test obs')
    expect(output).toContain('found something')
  })
})

describe('formatLuminosityHistogram', () => {
  it('formats empty bodies', () => {
    expect(formatLuminosityHistogram([])).toContain('No luminosity')
  })

  it('formats histogram bars', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'star', luminosity: 85, mass: 100, gravity: 5, age: 0, distance: 0, constellation: '.', magnitude: 50 },
      { file: 'b.ts', name: 'b', type: 'moon', luminosity: 10, mass: 20, gravity: 1, age: 0, distance: 1, constellation: '.', magnitude: 20 },
    ]
    const output = formatLuminosityHistogram(bodies)
    expect(output).toContain('80-100')
    expect(output).toContain('0-19')
  })
})

describe('formatGravityWellMap', () => {
  it('formats no gravity wells', () => {
    const bodies: CelestialBody[] = [
      { file: 'a.ts', name: 'a', type: 'moon', luminosity: 10, mass: 20, gravity: 1, age: 0, distance: 0, constellation: '.', magnitude: 10 },
    ]
    expect(formatGravityWellMap(bodies)).toContain('No significant gravity')
  })

  it('formats gravity wells', () => {
    const bodies: CelestialBody[] = [
      { file: 'god.ts', name: 'god', type: 'blackhole', luminosity: 90, mass: 400, gravity: 15, age: 0, distance: 0, constellation: '.', magnitude: 80 },
    ]
    const output = formatGravityWellMap(bodies)
    expect(output).toContain('god')
    expect(output).toContain('gravity=15')
  })
})

describe('formatTelescopeStats', () => {
  it('formats stats', () => {
    const stats: TelescopeStats = {
      totalBodies: 10, starCount: 3, blackholeCount: 1, nebulaCount: 2,
      constellationCount: 4, avgLuminosity: 45, avgMass: 80, maxGravity: 12,
      brightestBody: 'core.ts', heaviestBody: 'big.ts', mostDistant: 'deep.ts',
      observableUniverse: 8, darkMatter: 2,
    }
    const output = formatTelescopeStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('3')
    expect(output).toContain('core.ts')
  })
})

describe('formatTelescopeRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatTelescopeRecommendations([])).toContain('No recommendations')
  })

  it('formats numbered recommendations', () => {
    const output = formatTelescopeRecommendations(['Fix black holes', 'Reduce coupling'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatTelescopeTable', () => {
  it('formats full result', () => {
    const result = buildTelescopeResult(['src/a.ts', 'src/b.ts'], ['code', 'code'], {})
    const output = formatTelescopeTable(result)
    expect(output).toContain('Telescope Analysis')
    expect(output).toContain('Constellation Map')
  })
})

describe('formatTelescopeJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildTelescopeResult(['src/a.ts'], ['code'], {})
    const output = formatTelescopeJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalBodies).toBe(1)
  })
})
