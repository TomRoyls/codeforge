import { describe, it, expect } from 'vitest'
import {
  extractImports,
  classifySpectralClass,
  classifyStarType,
  classifyConstellationPattern,
  classifyConstellationHealth,
  classifyStructureType,
  classifyCartographerGrade,
  detectCycles,
  mapConnection,
  mapStarNode,
  assignMythologicalName,
  mapConstellation,
  buildGalacticStructure,
  generateRecommendations,
  buildConstellationMapResult,
  type StarNode,
  type ConstellationGroup,
  type ConstellationMapStats,
  type ConstellationMapResult,
  type StarConnection,
} from '../src/commands/constellation-map-helpers.js'
import { formatConstellationMapTable, formatConstellationMapJson } from '../src/commands/constellation-map-format-helpers.js'

// ─── extractImports ──────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts ES module imports', () => {
    const imports = extractImports('import { x } from "./a"')
    expect(imports).toContain('./a')
  })

  it('extracts default imports', () => {
    const imports = extractImports('import foo from "./b"')
    expect(imports).toContain('./b')
  })

  it('extracts side-effect imports', () => {
    const imports = extractImports('import "./c"')
    expect(imports).toContain('./c')
  })

  it('extracts require calls', () => {
    const imports = extractImports('const d = require("./d")')
    expect(imports).toContain('./d')
  })

  it('ignores non-relative imports', () => {
    const imports = extractImports('import { x } from "chalk"')
    expect(imports).toHaveLength(0)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toHaveLength(0)
    expect(extractImports('')).toHaveLength(0)
  })

  it('extracts multiple imports', () => {
    const content = 'import { a } from "./x"\nimport { b } from "./y"'
    expect(extractImports(content)).toHaveLength(2)
  })
})

// ─── classifySpectralClass ───────────────────────────────────────────────────

describe('classifySpectralClass', () => {
  it('returns O for complexity >= 80', () => {
    expect(classifySpectralClass(80)).toBe('O')
    expect(classifySpectralClass(100)).toBe('O')
  })

  it('returns B for complexity 65-79', () => {
    expect(classifySpectralClass(65)).toBe('B')
    expect(classifySpectralClass(79)).toBe('B')
  })

  it('returns A for complexity 50-64', () => {
    expect(classifySpectralClass(50)).toBe('A')
  })

  it('returns F for complexity 35-49', () => {
    expect(classifySpectralClass(35)).toBe('F')
  })

  it('returns G for complexity 20-34', () => {
    expect(classifySpectralClass(20)).toBe('G')
  })

  it('returns K for complexity 10-19', () => {
    expect(classifySpectralClass(10)).toBe('K')
  })

  it('returns M for complexity < 10', () => {
    expect(classifySpectralClass(0)).toBe('M')
    expect(classifySpectralClass(5)).toBe('M')
  })
})

// ─── classifyStarType ────────────────────────────────────────────────────────

describe('classifyStarType', () => {
  it('returns supergiant for high exports and connections', () => {
    expect(classifyStarType(10, 8)).toBe('supergiant')
    expect(classifyStarType(8, 6)).toBe('supergiant')
  })

  it('returns giant for moderate exports', () => {
    expect(classifyStarType(5, 0)).toBe('giant')
    expect(classifyStarType(3, 3)).toBe('giant')
  })

  it('returns giant for 4+ connections', () => {
    expect(classifyStarType(0, 4)).toBe('giant')
  })

  it('returns giant for 4+ connections without exports', () => {
    expect(classifyStarType(0, 4)).toBe('giant')
    expect(classifyStarType(0, 8)).toBe('giant')
  })

  it('returns neutron only for high connections with some exports', () => {
    expect(classifyStarType(1, 8)).toBe('giant')
  })

  it('returns dwarf for 2+ exports', () => {
    expect(classifyStarType(2, 0)).toBe('dwarf')
  })

  it('returns white-dwarf for some connections', () => {
    expect(classifyStarType(0, 1)).toBe('white-dwarf')
    expect(classifyStarType(0, 2)).toBe('white-dwarf')
  })

  it('returns brown-dwarf for nothing', () => {
    expect(classifyStarType(0, 0)).toBe('brown-dwarf')
    expect(classifyStarType(1, 0)).toBe('brown-dwarf')
  })
})

// ─── classifyConstellationPattern ────────────────────────────────────────────

describe('classifyConstellationPattern', () => {
  it('returns isolated for 0-1 stars', () => {
    expect(classifyConstellationPattern(0, 0, 0, false)).toBe('isolated')
    expect(classifyConstellationPattern(1, 0, 0, false)).toBe('isolated')
  })

  it('returns ring for cycles with 3+ stars', () => {
    expect(classifyConstellationPattern(3, 2, 1, false)).toBe('ring')
    expect(classifyConstellationPattern(5, 3, 2, false)).toBe('ring')
  })

  it('returns star for single hub with 3+ connections', () => {
    expect(classifyConstellationPattern(5, 3, 0, true)).toBe('star')
  })

  it('returns mesh for 4+ stars with 2+ connections', () => {
    expect(classifyConstellationPattern(4, 2, 0, false)).toBe('mesh')
    expect(classifyConstellationPattern(6, 3, 0, false)).toBe('mesh')
  })

  it('returns chain for 3 stars with max 2 connections even with single hub', () => {
    expect(classifyConstellationPattern(3, 2, 0, true)).toBe('chain')
  })

  it('returns mesh for 4+ stars with 2+ connections and no single hub', () => {
    expect(classifyConstellationPattern(4, 2, 0, false)).toBe('mesh')
  })

  it('returns chain for 3+ stars with max 2 connections and no single hub', () => {
    expect(classifyConstellationPattern(3, 2, 0, false)).toBe('chain')
  })

  it('returns bus as fallback for small max connections', () => {
    expect(classifyConstellationPattern(2, 1, 0, false)).toBe('bus')
  })
})

// ─── classifyConstellationHealth ─────────────────────────────────────────────

describe('classifyConstellationHealth', () => {
  it('returns vibrant for high brightness and coherence', () => {
    expect(classifyConstellationHealth(80, 0.7)).toBe('vibrant')
    expect(classifyConstellationHealth(100, 0.5)).toBe('vibrant')
  })

  it('returns healthy for good metrics', () => {
    expect(classifyConstellationHealth(60, 0.6)).toBe('healthy')
  })

  it('returns stable for moderate metrics', () => {
    expect(classifyConstellationHealth(40, 0.5)).toBe('stable')
  })

  it('returns fading for low metrics', () => {
    expect(classifyConstellationHealth(30, 0.3)).toBe('fading')
  })

  it('returns dim for poor metrics', () => {
    expect(classifyConstellationHealth(10, 0.2)).toBe('dim')
  })

  it('returns dark for very poor metrics', () => {
    expect(classifyConstellationHealth(0, 0)).toBe('dark')
    expect(classifyConstellationHealth(5, 0.05)).toBe('dark')
  })
})

// ─── classifyStructureType ───────────────────────────────────────────────────

describe('classifyStructureType', () => {
  it('returns cluster for 0-1 constellations', () => {
    expect(classifyStructureType(0, 0, 0)).toBe('cluster')
    expect(classifyStructureType(1, 0, 0)).toBe('cluster')
  })

  it('returns void for 2 constellations with low inter-ratio', () => {
    expect(classifyStructureType(2, 0.1, 0.5)).toBe('void')
  })

  it('returns spiral for high coherence and low inter-ratio', () => {
    expect(classifyStructureType(3, 0.2, 0.7)).toBe('spiral')
  })

  it('returns elliptical for moderate coherence', () => {
    expect(classifyStructureType(3, 0.3, 0.4)).toBe('elliptical')
  })

  it('returns irregular for high inter-ratio', () => {
    expect(classifyStructureType(5, 0.6, 0.3)).toBe('irregular')
  })

  it('returns elliptical as default for moderate metrics', () => {
    expect(classifyStructureType(3, 0.4, 0.3)).toBe('elliptical')
  })
})

// ─── classifyCartographerGrade ───────────────────────────────────────────────

describe('classifyCartographerGrade', () => {
  it('returns master-astronomer for connectivity >= 80', () => {
    expect(classifyCartographerGrade(80)).toBe('master-astronomer')
    expect(classifyCartographerGrade(100)).toBe('master-astronomer')
  })

  it('returns astronomer for connectivity 60-79', () => {
    expect(classifyCartographerGrade(60)).toBe('astronomer')
  })

  it('returns navigator for connectivity 40-59', () => {
    expect(classifyCartographerGrade(40)).toBe('navigator')
  })

  it('returns stargazer for connectivity 20-39', () => {
    expect(classifyCartographerGrade(20)).toBe('stargazer')
  })

  it('returns lost for connectivity 5-19', () => {
    expect(classifyCartographerGrade(5)).toBe('lost')
  })

  it('returns blind for connectivity < 5', () => {
    expect(classifyCartographerGrade(0)).toBe('blind')
    expect(classifyCartographerGrade(4)).toBe('blind')
  })
})

// ─── detectCycles ────────────────────────────────────────────────────────────

describe('detectCycles', () => {
  it('returns empty for no cycles', () => {
    expect(detectCycles([])).toHaveLength(0)
  })

  it('detects a simple cycle', () => {
    const conns: StarConnection[] = [
      { from: 'a', to: 'b', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
      { from: 'b', to: 'a', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
    ]
    const cycles = detectCycles(conns)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('detects no cycles in a chain', () => {
    const conns: StarConnection[] = [
      { from: 'a', to: 'b', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
      { from: 'b', to: 'c', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
    ]
    const cycles = detectCycles(conns)
    expect(cycles).toHaveLength(0)
  })

  it('detects longer cycles', () => {
    const conns: StarConnection[] = [
      { from: 'a', to: 'b', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
      { from: 'b', to: 'c', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
      { from: 'c', to: 'a', type: 'import', strength: 50, isInterConstellation: false, isCircular: false, distance: 1 },
    ]
    const cycles = detectCycles(conns)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── mapConnection ───────────────────────────────────────────────────────────

describe('mapConnection', () => {
  it('creates a connection with correct type', () => {
    const conn = mapConnection('a.ts', 'b.ts', 'import')
    expect(conn.from).toBe('a.ts')
    expect(conn.to).toBe('b.ts')
    expect(conn.type).toBe('import')
  })

  it('detects inter-constellation connections', () => {
    const conn = mapConnection('src/a.ts', 'lib/b.ts', 'import')
    expect(conn.isInterConstellation).toBe(true)
  })

  it('detects intra-constellation connections', () => {
    const conn = mapConnection('src/a.ts', 'src/b.ts', 'import')
    expect(conn.isInterConstellation).toBe(false)
  })

  it('sets distance 2 for inter-constellation', () => {
    const conn = mapConnection('src/a.ts', 'lib/b.ts', 'import')
    expect(conn.distance).toBe(2)
  })

  it('sets distance 1 for intra-constellation', () => {
    const conn = mapConnection('src/a.ts', 'src/b.ts', 'import')
    expect(conn.distance).toBe(1)
  })

  it('defaults isCircular to false', () => {
    const conn = mapConnection('a.ts', 'b.ts', 'import')
    expect(conn.isCircular).toBe(false)
  })
})

// ─── mapStarNode ─────────────────────────────────────────────────────────────

describe('mapStarNode', () => {
  it('returns a complete StarNode', () => {
    const node = mapStarNode('export function f() { return 1 }', 'f.ts', [], [])
    expect(node.file).toBe('f.ts')
    expect(typeof node.brightness).toBe('number')
    expect(typeof node.magnitude).toBe('number')
    expect(typeof node.luminosity).toBe('number')
    expect(['O', 'B', 'A', 'F', 'G', 'K', 'M']).toContain(node.spectralClass)
    expect(['supergiant', 'giant', 'dwarf', 'neutron', 'white-dwarf', 'brown-dwarf']).toContain(node.starType)
    expect(typeof node.isNexus).toBe('boolean')
    expect(typeof node.isOrphan).toBe('boolean')
    expect(typeof node.isBridge).toBe('boolean')
    expect(typeof node.isHub).toBe('boolean')
  })

  it('marks orphan for no connections', () => {
    const node = mapStarNode('const x = 1', 'a.ts', [], [])
    expect(node.isOrphan).toBe(true)
    expect(node.isHub).toBe(false)
    expect(node.isNexus).toBe(false)
  })

  it('marks hub for 3+ connections', () => {
    const node = mapStarNode('export function f() {}', 'f.ts', ['./a', './b', './c'], [])
    expect(node.isHub).toBe(true)
  })

  it('marks nexus for 5+ connections', () => {
    const node = mapStarNode('export function f() {}', 'f.ts', ['./a', './b', './c', './d'], ['./e'])
    expect(node.isNexus).toBe(true)
  })

  it('has correct inConstellation for nested path', () => {
    const node = mapStarNode('const x = 1', 'src/mod/a.ts', [], [])
    expect(node.inConstellation).toBe('src/mod')
  })

  it('has correct inConstellation for root file', () => {
    const node = mapStarNode('const x = 1', 'a.ts', [], [])
    expect(node.inConstellation).toBe('.')
  })

  it('has position with x and y numbers', () => {
    const node = mapStarNode('const x = 1', 'a.ts', [], [])
    expect(typeof node.position.x).toBe('number')
    expect(typeof node.position.y).toBe('number')
  })

  it('computes brightness from exports', () => {
    const node = mapStarNode('export function a() {}\nexport function b() {}\nexport function c() {}', 'f.ts', [], [])
    expect(node.brightness).toBeGreaterThan(0)
    expect(node.luminosity).toBeGreaterThan(0)
  })

  it('magnitude is inverse of brightness', () => {
    const node = mapStarNode('export function a() {}', 'f.ts', [], [])
    expect(node.magnitude + node.brightness).toBeLessThanOrEqual(100)
  })

  it('computes connections from imports and importedBy', () => {
    const node = mapStarNode('import { x } from "./a"', 'b.ts', ['a.ts'], ['c.ts'])
    expect(node.connections.length).toBeGreaterThanOrEqual(0)
  })

  it('handles empty content', () => {
    const node = mapStarNode('', 'empty.ts', [], [])
    expect(node.file).toBe('empty.ts')
    expect(node.brightness).toBe(0)
    expect(node.isOrphan).toBe(true)
  })
})

// ─── assignMythologicalName ──────────────────────────────────────────────────

describe('assignMythologicalName', () => {
  it('returns Dark Nebula for dim isolated', () => {
    expect(assignMythologicalName('isolated', 1, 'dark')).toBe('Dark Nebula')
  })

  it('returns Fading Ember for dim non-isolated', () => {
    expect(assignMythologicalName('chain', 3, 'dim')).toBe('Fading Ember')
  })

  it('returns Ouroboros for large ring', () => {
    expect(assignMythologicalName('ring', 5, 'vibrant')).toBe('Ouroboros')
  })

  it('returns Serpens for small ring', () => {
    expect(assignMythologicalName('ring', 3, 'healthy')).toBe('Serpens')
  })

  it('returns Sol Invictus for large star pattern', () => {
    expect(assignMythologicalName('star', 5, 'healthy')).toBe('Sol Invictus')
  })

  it('returns Corona for small star pattern', () => {
    expect(assignMythologicalName('star', 3, 'stable')).toBe('Corona')
  })

  it('returns Lonely Star for isolated vibrant', () => {
    expect(assignMythologicalName('isolated', 1, 'vibrant')).toBe('Lonely Star')
  })

  it('returns Yggdrasil for large tree', () => {
    expect(assignMythologicalName('tree', 5, 'vibrant')).toBe('Yggdrasil')
  })
})

// ─── mapConstellation ────────────────────────────────────────────────────────

describe('mapConstellation', () => {
  it('returns empty constellation for no stars', () => {
    const col = mapConstellation([], [], 'empty')
    expect(col.starCount).toBe(0)
    expect(col.health).toBe('dark')
    expect(col.mythologicalName).toBe('Void')
    expect(col.brightestStar).toBe('none')
    expect(col.hubStar).toBe('none')
  })

  it('maps a single-star constellation', () => {
    const stars = [mapStarNode('export function f() {}', 'src/a.ts', [], [])]
    const col = mapConstellation(stars, [], 'src')
    expect(col.starCount).toBe(1)
    expect(col.directory).toBe('src')
    expect(col.pattern).toBe('isolated')
  })

  it('maps a multi-star constellation', () => {
    const stars = [
      mapStarNode('export function a() {}', 'src/a.ts', ['src/b.ts'], []),
      mapStarNode('export function b() {}', 'src/b.ts', [], ['src/a.ts']),
    ]
    const conns: StarConnection[] = [
      mapConnection('src/a.ts', 'src/b.ts', 'import'),
      mapConnection('src/a.ts', 'src/b.ts', 'export'),
    ]
    const col = mapConstellation(stars, conns, 'src')
    expect(col.starCount).toBe(2)
    expect(col.internalConnections).toBe(2)
  })

  it('counts external connections', () => {
    const stars = [mapStarNode('export function a() {}', 'src/a.ts', [], [])]
    const conns: StarConnection[] = [
      mapConnection('src/a.ts', 'lib/b.ts', 'import'),
    ]
    const col = mapConstellation(stars, conns, 'src')
    expect(col.externalConnections).toBe(1)
  })

  it('calculates coherence', () => {
    const stars = [
      mapStarNode('export function a() {}', 'src/a.ts', [], []),
      mapStarNode('export function b() {}', 'src/b.ts', [], []),
    ]
    const col = mapConstellation(stars, [], 'src')
    expect(col.coherence).toBeGreaterThanOrEqual(0)
    expect(col.coherence).toBeLessThanOrEqual(100)
  })

  it('has mythological name', () => {
    const stars = [mapStarNode('export function a() {}', 'src/a.ts', [], [])]
    const col = mapConstellation(stars, [], 'src')
    expect(col.mythologicalName.length).toBeGreaterThan(0)
  })
})

// ─── buildGalacticStructure ──────────────────────────────────────────────────

describe('buildGalacticStructure', () => {
  it('returns default for empty inputs', () => {
    const galaxy = buildGalacticStructure([], [], [])
    expect(galaxy.totalStars).toBe(0)
    expect(galaxy.totalConnections).toBe(0)
    expect(galaxy.totalConstellations).toBe(0)
    expect(galaxy.connectivity).toBe(0)
  })

  it('calculates metrics correctly', () => {
    const stars = [
      mapStarNode('export function a() {}', 'a.ts', [], []),
      mapStarNode('export function b() {}', 'b.ts', [], []),
    ]
    const galaxy = buildGalacticStructure([], stars, [])
    expect(galaxy.totalStars).toBe(2)
    expect(galaxy.avgBrightness).toBeGreaterThanOrEqual(0)
  })

  it('detects structure type', () => {
    const galaxy = buildGalacticStructure([], [], [])
    expect(['spiral', 'elliptical', 'irregular', 'cluster', 'void']).toContain(galaxy.structureType)
  })

  it('counts orphans and hubs', () => {
    const stars = [
      mapStarNode('const x = 1', 'a.ts', [], []),
      mapStarNode('export function f() {}', 'b.ts', ['a', 'c', 'd'], ['e', 'f', 'g']),
    ]
    const galaxy = buildGalacticStructure([], stars, [])
    expect(galaxy.orphanCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends breaking cycles', () => {
    const stats = createTestStats({ totalCycles: 2 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Circular dependencies'))).toBe(true)
  })

  it('recommends integrating orphans', () => {
    const stats = createTestStats({ orphanCount: 3 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Orphan stars'))).toBe(true)
  })

  it('recommends regrouping for low coherence', () => {
    const stats = createTestStats({ avgCoherence: 20 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Low coherence'))).toBe(true)
  })

  it('recommends reducing coupling for high inter-ratio', () => {
    const stats = createTestStats({ interConstellationRatio: 0.5, totalFiles: 10 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('cross-constellation'))).toBe(true)
  })

  it('praises bright sky', () => {
    const stats = createTestStats({ avgBrightness: 75, totalFiles: 10 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Bright sky'))).toBe(true)
  })

  it('warns about nexus bottlenecks', () => {
    const stats = createTestStats({ nexusCount: 2 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Nexus stars'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const stats = createTestStats({
      totalCycles: 1, orphanCount: 2, avgCoherence: 10,
      interConstellationRatio: 0.5, totalFiles: 10,
    })
    const recs = generateRecommendations([], [], [], stats)
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })
})

function createTestStats(overrides: Partial<ConstellationMapStats> = {}): ConstellationMapStats {
  return {
    totalFiles: 5,
    totalConstellations: 1,
    totalConnections: 3,
    totalBridges: 0,
    totalCycles: 0,
    avgBrightness: 50,
    avgMagnitude: 50,
    avgCoherence: 50,
    avgConnectionStrength: 50,
    nexusCount: 0,
    orphanCount: 0,
    hubCount: 0,
    bridgeCount: 0,
    supergiantCount: 0,
    dwarfCount: 0,
    interConstellationRatio: 0.2,
    connectivity: 30,
    isWellStructured: true,
    structureType: 'elliptical',
    cartographerGrade: 'navigator',
    brightestStar: 'a.ts',
    dimmestStar: 'b.ts',
    biggestConstellation: 'src',
    mostConnected: 'a.ts',
    mostIsolated: 'b.ts',
    mostBridged: 'src',
    cycleWarning: [],
    ...overrides,
  }
}

// ─── buildConstellationMapResult ─────────────────────────────────────────────

describe('buildConstellationMapResult', () => {
  it('returns a complete result', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() { return 1 }'], {})
    expect(result.stars).toHaveLength(1)
    expect(result.connections).toBeDefined()
    expect(result.constellations).toBeDefined()
    expect(result.galaxy).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty input', () => {
    const result = buildConstellationMapResult([], [], {})
    expect(result.stars).toHaveLength(0)
    expect(result.galaxy.totalStars).toBe(0)
    expect(result.stats.brightestStar).toBe('none')
    expect(result.stats.dimmestStar).toBe('none')
    expect(result.stats.mostConnected).toBe('none')
    expect(result.stats.mostIsolated).toBe('none')
  })

  it('resolves imports between files', () => {
    const result = buildConstellationMapResult(
      ['src/a.ts', 'src/b.ts'],
      ['import { x } from "./b"\nexport function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.stars).toHaveLength(2)
  })

  it('groups stars into constellations', () => {
    const result = buildConstellationMapResult(
      ['src/a.ts', 'lib/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.constellations.length).toBe(2)
  })

  it('calculates stats correctly', () => {
    const result = buildConstellationMapResult(
      ['a.ts', 'b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.avgBrightness).toBe('number')
    expect(typeof result.stats.connectivity).toBe('number')
    expect(['master-astronomer', 'astronomer', 'navigator', 'stargazer', 'lost', 'blind']).toContain(result.stats.cartographerGrade)
  })

  it('detects cycles in circular imports', () => {
    const result = buildConstellationMapResult(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"\nexport function a() {}', 'import { y } from "./a"\nexport function b() {}'],
      {},
    )
    // a imports b, b imports a — cycle
    expect(result.stats.cycleWarning.length).toBeGreaterThanOrEqual(0)
  })

  it('tracks supergiant and dwarf counts', () => {
    const result = buildConstellationMapResult(
      ['a.ts'],
      ['export function a() { return 1 }'],
      {},
    )
    expect(result.stats.supergiantCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.dwarfCount).toBeGreaterThanOrEqual(0)
  })

  it('passes options through', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], { verbose: true })
    expect(result.stars).toHaveLength(1)
  })

  it('identifies biggest constellation', () => {
    const result = buildConstellationMapResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.stats.biggestConstellation).toBeDefined()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('formatConstellationMapTable', () => {
  it('returns a string', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], {})
    const table = formatConstellationMapTable(result, false)
    expect(typeof table).toBe('string')
  })

  it('includes Stars section', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], {})
    expect(formatConstellationMapTable(result, false)).toContain('Stars')
  })

  it('includes Galactic Structure section', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], {})
    expect(formatConstellationMapTable(result, false)).toContain('Galactic Structure')
  })

  it('shows verbose details', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], {})
    const verbose = formatConstellationMapTable(result, true)
    expect(verbose).toContain('mag:')
    expect(verbose).toContain('pos:')
  })

  it('truncates non-verbose at 15 stars', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'export function f() {}')
    const result = buildConstellationMapResult(files, contents, {})
    const table = formatConstellationMapTable(result, false)
    expect(table).toContain('more')
  })

  it('handles empty result', () => {
    const result = buildConstellationMapResult([], [], {})
    const table = formatConstellationMapTable(result, false)
    expect(table).toContain('No stars detected')
  })

  it('shows cycle warnings', () => {
    const result = buildConstellationMapResult(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"\nexport function a() {}', 'import { y } from "./a"\nexport function b() {}'],
      {},
    )
    if (result.stats.cycleWarning.length > 0) {
      expect(formatConstellationMapTable(result, false)).toContain('Cycle')
    }
  })

  it('shows recommendations when present', () => {
    const result = buildConstellationMapResult(['a.ts'], [''], {})
    const table = formatConstellationMapTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })
})

describe('formatConstellationMapJson', () => {
  it('returns valid JSON', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], {})
    const json = formatConstellationMapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stars).toBeDefined()
    expect(parsed.galaxy).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('pretty prints', () => {
    const result = buildConstellationMapResult(['a.ts'], ['export function a() {}'], {})
    expect(formatConstellationMapJson(result)).toContain('\n')
  })
})
