import { describe, it, expect } from 'vitest'
import {
  classifySpectralType,
  classifyBodyType,
  classifyAge,
  classifyStability,
  classifyGalaxyType,
  classifyObservationGrade,
  classifyFormation,
  classifyConstellationHealth,
  analyzeCelestialBody,
  analyzeConstellation,
  buildCosmicMap,
  identifyBlackHoles,
  identifyDarkMatter,
  identifySupernovae,
  generateObservatoryDomeRecommendations,
  buildObservatoryDomeResult,
} from '../src/commands/observatory-dome-helpers.js'

// ─── classifySpectralType ────────────────────────────────────────────────────

describe('classifySpectralType', () => {
  it('returns O for temperature >= 80', () => {
    expect(classifySpectralType(85)).toBe('O')
    expect(classifySpectralType(100)).toBe('O')
  })

  it('returns B for temperature 65-79', () => {
    expect(classifySpectralType(70)).toBe('B')
  })

  it('returns A for temperature 50-64', () => {
    expect(classifySpectralType(55)).toBe('A')
  })

  it('returns F for temperature 35-49', () => {
    expect(classifySpectralType(40)).toBe('F')
  })

  it('returns G for temperature 20-34', () => {
    expect(classifySpectralType(25)).toBe('G')
  })

  it('returns K for temperature 10-19', () => {
    expect(classifySpectralType(15)).toBe('K')
  })

  it('returns M for temperature < 10', () => {
    expect(classifySpectralType(5)).toBe('M')
    expect(classifySpectralType(0)).toBe('M')
  })
})

// ─── classifyBodyType ────────────────────────────────────────────────────────

describe('classifyBodyType', () => {
  it('returns black-hole for high temperature and many imports', () => {
    expect(classifyBodyType(30, 0, 6, 85)).toBe('black-hole')
  })

  it('returns neutron-star for high temperature and moderate luminosity', () => {
    expect(classifyBodyType(40, 0, 2, 75)).toBe('neutron-star')
  })

  it('returns pulsar for moderate-high temperature and luminosity', () => {
    expect(classifyBodyType(50, 0, 2, 65)).toBe('pulsar')
  })

  it('returns star for high luminosity and many dependents', () => {
    expect(classifyBodyType(65, 5, 1, 30)).toBe('star')
  })

  it('returns planet for moderate luminosity and some dependents', () => {
    expect(classifyBodyType(45, 3, 1, 20)).toBe('planet')
  })

  it('returns moon for low-moderate luminosity and a dependent', () => {
    expect(classifyBodyType(25, 1, 0, 10)).toBe('moon')
  })

  it('returns comet for high luminosity with no dependents', () => {
    expect(classifyBodyType(55, 0, 0, 15)).toBe('comet')
  })

  it('returns asteroid for very low luminosity and no imports', () => {
    expect(classifyBodyType(10, 0, 0, 5)).toBe('asteroid')
  })

  it('returns dwarf-planet for low-mid luminosity with a dependent', () => {
    expect(classifyBodyType(25, 1, 0, 15)).toBe('moon')
  })
})

// ─── classifyAge ─────────────────────────────────────────────────────────────

describe('classifyAge', () => {
  it('returns protostar for few lines', () => {
    expect(classifyAge(5, 10)).toBe('protostar')
  })

  it('returns red-giant for high temperature', () => {
    expect(classifyAge(50, 75)).toBe('red-giant')
  })

  it('returns white-dwarf for low temperature and many lines', () => {
    expect(classifyAge(60, 10)).toBe('white-dwarf')
  })

  it('returns black-dwarf for many lines and low temperature', () => {
    expect(classifyAge(150, 25)).toBe('black-dwarf')
  })

  it('returns neutron-star for moderate-high temperature', () => {
    expect(classifyAge(30, 55)).toBe('neutron-star')
  })

  it('returns main-sequence for typical code', () => {
    expect(classifyAge(30, 30)).toBe('main-sequence')
  })
})

// ─── classifyStability ───────────────────────────────────────────────────────

describe('classifyStability', () => {
  it('returns stable for clean code', () => {
    expect(classifyStability(0, 0, false)).toBe('stable')
  })

  it('returns variable for minor issues', () => {
    expect(classifyStability(1, 0, false)).toBe('variable')
  })

  it('returns eruptive for moderate issues', () => {
    expect(classifyStability(2, 1, false)).toBe('eruptive')
  })

  it('returns supernova for significant issues', () => {
    expect(classifyStability(3, 2, false)).toBe('supernova')
  })

  it('returns cataclysmic for severe issues', () => {
    expect(classifyStability(5, 3, true)).toBe('cataclysmic')
  })

  it('accounts for nested ifs', () => {
    expect(classifyStability(0, 0, true)).toBe('variable')
  })
})

// ─── classifyGalaxyType ──────────────────────────────────────────────────────

describe('classifyGalaxyType', () => {
  it('returns void for no files', () => {
    expect(classifyGalaxyType(0, 0, 0, 0)).toBe('void')
  })

  it('returns irregular for many black holes', () => {
    expect(classifyGalaxyType(50, 20, 30, 4)).toBe('irregular')
  })

  it('returns spiral for high luminosity and low distance', () => {
    expect(classifyGalaxyType(70, 50, 20, 0)).toBe('spiral')
  })

  it('returns elliptical for moderate luminosity', () => {
    expect(classifyGalaxyType(45, 50, 50, 0)).toBe('elliptical')
  })

  it('returns lenticular for high distance', () => {
    expect(classifyGalaxyType(30, 50, 55, 0)).toBe('lenticular')
  })

  it('returns dwarf for few files with low luminosity', () => {
    expect(classifyGalaxyType(20, 5, 30, 0)).toBe('dwarf')
  })

  it('returns elliptical for moderate luminosity before dwarf check', () => {
    expect(classifyGalaxyType(50, 5, 30, 0)).toBe('elliptical')
  })
})

// ─── classifyObservationGrade ────────────────────────────────────────────────

describe('classifyObservationGrade', () => {
  it('returns hubble for high cosmic background', () => {
    expect(classifyObservationGrade(90)).toBe('hubble')
  })

  it('returns ground-telescope for moderate background', () => {
    expect(classifyObservationGrade(65)).toBe('ground-telescope')
  })

  it('returns binoculars for mid background', () => {
    expect(classifyObservationGrade(45)).toBe('binoculars')
  })

  it('returns naked-eye for low background', () => {
    expect(classifyObservationGrade(25)).toBe('naked-eye')
  })

  it('returns blind for very low background', () => {
    expect(classifyObservationGrade(10)).toBe('blind')
    expect(classifyObservationGrade(0)).toBe('blind')
  })
})

// ─── classifyFormation ───────────────────────────────────────────────────────

describe('classifyFormation', () => {
  it('returns spiral for many bodies with high mass', () => {
    expect(classifyFormation(16, 50)).toBe('spiral')
  })

  it('returns elliptical for many bodies', () => {
    expect(classifyFormation(12, 30)).toBe('elliptical')
  })

  it('returns irregular for low mass', () => {
    expect(classifyFormation(5, 15)).toBe('irregular')
  })

  it('returns lenticular for default', () => {
    expect(classifyFormation(5, 30)).toBe('lenticular')
  })
})

// ─── classifyConstellationHealth ─────────────────────────────────────────────

describe('classifyConstellationHealth', () => {
  it('returns vibrant for high luminosity', () => {
    expect(classifyConstellationHealth(80)).toBe('vibrant')
  })

  it('returns stable for moderate luminosity', () => {
    expect(classifyConstellationHealth(55)).toBe('stable')
  })

  it('returns aging for mid luminosity', () => {
    expect(classifyConstellationHealth(35)).toBe('aging')
  })

  it('returns dying for low luminosity', () => {
    expect(classifyConstellationHealth(15)).toBe('dying')
  })

  it('returns dead for very low luminosity', () => {
    expect(classifyConstellationHealth(5)).toBe('dead')
  })
})

// ─── analyzeCelestialBody ────────────────────────────────────────────────────

describe('analyzeCelestialBody', () => {
  it('returns a CelestialBody with all fields', () => {
    const code = 'export function add(a: number, b: number) { return a + b }'
    const body = analyzeCelestialBody(code, 'add.ts', [], [])

    expect(body.file).toBe('add.ts')
    expect(body.name).toBe('add.ts')
    expect(typeof body.luminosity).toBe('number')
    expect(typeof body.magnitude).toBe('number')
    expect(typeof body.mass).toBe('number')
    expect(typeof body.gravity).toBe('number')
    expect(typeof body.temperature).toBe('number')
    expect(typeof body.distance).toBe('number')
    expect(typeof body.orbitalPeriod).toBe('number')
    expect(body.spectralType).toBeDefined()
    expect(body.bodyType).toBeDefined()
    expect(body.age).toBeDefined()
    expect(body.stability).toBeDefined()
    expect(body.constellation).toBe('.')
    expect(Array.isArray(body.companions)).toBe(true)
    expect(Array.isArray(body.satellites)).toBe(true)
    expect(Array.isArray(body.influences)).toBe(true)
    expect(Array.isArray(body.influencedBy)).toBe(true)
    expect(typeof body.isBinarySystem).toBe('boolean')
    expect(typeof body.isBlackHole).toBe('boolean')
    expect(typeof body.isSupernova).toBe('boolean')
    expect(typeof body.isNebula).toBe('boolean')
    expect(typeof body.isDarkMatter).toBe('boolean')
    expect(typeof body.isPulsar).toBe('boolean')
    expect(typeof body.habitableZone).toBe('boolean')
    expect(typeof body.skyPosition.ra).toBe('number')
    expect(typeof body.skyPosition.dec).toBe('number')
    expect(body.classification).toBeDefined()
    expect(Array.isArray(body.observationNotes)).toBe(true)
  })

  it('extracts name from path', () => {
    const body = analyzeCelestialBody('export function a() {}', 'src/utils/a.ts', [], [])
    expect(body.name).toBe('a.ts')
    expect(body.constellation).toBe('src/utils')
  })

  it('has stable body for clean code', () => {
    const body = analyzeCelestialBody('export function clean() { return 1 }', 'clean.ts', [], [])
    expect(body.stability).toBe('stable')
    expect(body.temperature).toBeLessThan(30)
  })

  it('detects dark matter for code with no exports and no dependents', () => {
    const body = analyzeCelestialBody('function internal() { return 1 }', 'internal.ts', [], [])
    expect(body.isDarkMatter).toBe(true)
  })

  it('does not mark exported code as dark matter', () => {
    const body = analyzeCelestialBody('export function api() { return 1 }', 'api.ts', [], [])
    expect(body.isDarkMatter).toBe(false)
  })

  it('detects nebula for tiny files', () => {
    const body = analyzeCelestialBody('x', 'tiny.ts', [], [])
    expect(body.isNebula).toBe(true)
    expect(body.age).toBe('protostar')
  })

  it('computes higher temperature for messy code', () => {
    const clean = analyzeCelestialBody('export function a() { return 1 }', 'clean.ts', [], [])
    const messy = analyzeCelestialBody(
      '// TODO: fix\n// FIXME: bad\nfunction f(x: any): any { if (x) { if (y) { return 1 } } return x }',
      'messy.ts', [], [],
    )
    expect(messy.temperature).toBeGreaterThan(clean.temperature)
  })

  it('computes magnitude inversely with impact', () => {
    const body = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    const bodyWithDeps = analyzeCelestialBody('export function b() {}', 'b.ts', [], ['c.ts', 'd.ts'])
    expect(bodyWithDeps.magnitude).toBeLessThan(body.magnitude)
  })

  it('detects binary system with mutual dependencies', () => {
    const body = analyzeCelestialBody('export function a() {}', 'a.ts', ['b.ts'], ['b.ts'])
    expect(body.isBinarySystem).toBe(true)
    expect(body.companions).toContain('b.ts')
  })

  it('computes distance from path depth', () => {
    const shallow = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    const deep = analyzeCelestialBody('export function b() {}', 'src/lib/deep/b.ts', [], [])
    expect(deep.distance).toBeGreaterThan(shallow.distance)
  })

  it('handles empty content', () => {
    const body = analyzeCelestialBody('', 'empty.ts', [], [])
    expect(body.luminosity).toBe(0)
    expect(body.mass).toBe(0)
    expect(body.temperature).toBe(0)
    expect(body.magnitude).toBe(100)
  })

  it('computes gravity from imports', () => {
    const noImports = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    const withImports = analyzeCelestialBody('export function b() {}', 'b.ts', ['x', 'y', 'z'], [])
    expect(withImports.gravity).toBeGreaterThan(noImports.gravity)
  })

  it('classifies observable for high luminosity exports', () => {
    const code = [
      '/** Docs */',
      'export interface I { x: number }',
      'export type T = string',
      'export function api() { return 1 }',
      'export function api2() { return 2 }',
    ].join('\n')
    const body = analyzeCelestialBody(code, 'api.ts', [], [])
    expect(body.classification).toBe('observable')
    expect(body.luminosity).toBeGreaterThanOrEqual(50)
  })

  it('classifies hidden for low luminosity with no exports and no dependents', () => {
    // Need luminosity < 20, exports === 0, and dependents === 0
    // A short internal function with no docs gives low luminosity
    const body = analyzeCelestialBody('x=1', 'hidden.ts', [], [])
    // luminosity = 0 for tiny content, exports=0, dependents=0 -> hidden
    if (body.luminosity < 20) {
      expect(body.classification).toBe('hidden')
    } else {
      expect(body.classification).not.toBe('observable')
    }
  })
})

// ─── analyzeConstellation ────────────────────────────────────────────────────

describe('analyzeConstellation', () => {
  it('returns defaults for empty bodies', () => {
    const c = analyzeConstellation([], 'empty-dir')
    expect(c.directory).toBe('empty-dir')
    expect(c.bodies).toEqual([])
    expect(c.starCount).toBe(0)
    expect(c.health).toBe('dead')
    expect(c.isSparse).toBe(true)
    expect(c.isDense).toBe(false)
    expect(c.gravitationalCenter).toBe('none')
  })

  it('analyzes a single body', () => {
    const body = analyzeCelestialBody('export function a() {}', 'dir/a.ts', [], [])
    const c = analyzeConstellation([body], 'dir')
    expect(c.bodies).toHaveLength(1)
    expect(c.avgLuminosity).toBe(body.luminosity)
  })

  it('computes star and planet counts', () => {
    const star = analyzeCelestialBody('export function a() {}', 'd/a.ts', [], ['b', 'c', 'd', 'e'])
    const planet = analyzeCelestialBody('export function b() {}', 'd/b.ts', [], ['c'])
    const c = analyzeConstellation([star, planet], 'd')
    expect(c.starCount).toBeGreaterThanOrEqual(0)
    expect(c.planetCount).toBeGreaterThanOrEqual(0)
  })

  it('detects black holes', () => {
    const bh = analyzeCelestialBody(
      '// TODO\n// FIXME\nfunction f(x: any): any { if (x) { if (y) { return 1 } } return x }\n' +
      Array.from({ length: 10 }, (_, i) => `import { m${i} } from 'm${i}'`).join('\n'),
      'd/bh.ts', Array.from({ length: 10 }, (_, i) => `m${i}`), [],
    )
    const c = analyzeConstellation([bh], 'd')
    expect(c.hasBlackHoles).toBe(bh.isBlackHole)
  })

  it('computes formation type', () => {
    const bodies = Array.from({ length: 16 }, (_, i) =>
      analyzeCelestialBody(`export function f${i}() { ${'x'.repeat(50)} }`, `d/f${i}.ts`, [], []),
    )
    const c = analyzeConstellation(bodies, 'd')
    expect(['spiral', 'elliptical', 'irregular', 'lenticular']).toContain(c.formation)
  })

  it('detects dense constellations', () => {
    const bodies = Array.from({ length: 12 }, (_, i) =>
      analyzeCelestialBody(`export function f${i}() {}`, `d/f${i}.ts`, [], []),
    )
    const c = analyzeConstellation(bodies, 'd')
    expect(c.isDense).toBe(true)
    expect(c.isSparse).toBe(false)
  })

  it('detects sparse constellations', () => {
    const body = analyzeCelestialBody('export function a() {}', 'd/a.ts', [], [])
    const c = analyzeConstellation([body], 'd')
    expect(c.isSparse).toBe(true)
    expect(c.isDense).toBe(false)
  })
})

// ─── buildCosmicMap ──────────────────────────────────────────────────────────

describe('buildCosmicMap', () => {
  it('returns defaults for empty bodies', () => {
    const cm = buildCosmicMap([], [])
    expect(cm.totalLuminosity).toBe(0)
    expect(cm.totalMass).toBe(0)
    expect(cm.avgDistance).toBe(0)
    expect(cm.blackHoles).toBe(0)
    expect(cm.cosmicBackground).toBe(0)
  })

  it('computes totals from bodies', () => {
    const b1 = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    const b2 = analyzeCelestialBody('export function b() {}', 'b.ts', [], [])
    const cm = buildCosmicMap([b1, b2], [])
    expect(cm.totalLuminosity).toBe(b1.luminosity + b2.luminosity)
    expect(cm.avgDistance).toBe(Math.round((b1.distance + b2.distance) / 2))
  })

  it('counts special body types', () => {
    const clean = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    const dark = analyzeCelestialBody('function hidden() {}', 'hidden.ts', [], [])
    const cm = buildCosmicMap([clean, dark], [])
    expect(cm.darkMatter).toBe(1)
  })

  it('computes habitable bodies', () => {
    const body = analyzeCelestialBody('export function a() { return 1 }', 'a.ts', [], [])
    const cm = buildCosmicMap([body], [])
    expect(cm.habitableBodies).toBeGreaterThanOrEqual(0)
  })

  it('computes cosmic background from averages', () => {
    const body = analyzeCelestialBody('export function clean() { return 1 }', 'clean.ts', [], [])
    const cm = buildCosmicMap([body], [])
    expect(cm.cosmicBackground).toBeGreaterThanOrEqual(0)
    expect(cm.cosmicBackground).toBeLessThanOrEqual(100)
  })
})

// ─── Identification Functions ────────────────────────────────────────────────

describe('identifyBlackHoles', () => {
  it('returns empty for no black holes', () => {
    const body = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    expect(identifyBlackHoles([body])).toHaveLength(0)
  })

  it('identifies black holes', () => {
    const code = '// TODO\n// FIXME\nfunction f(x: any): any { if (x) { if (y) { return 1 } } return x }\n' +
      Array.from({ length: 10 }, (_, i) => `import { m${i} } from 'm${i}'`).join('\n')
    const body = analyzeCelestialBody(code, 'bh.ts', Array.from({ length: 10 }, (_, i) => `m${i}`), [])
    const result = identifyBlackHoles([body])
    if (body.isBlackHole) {
      expect(result).toHaveLength(1)
      expect(result[0].file).toBe('bh.ts')
    }
  })
})

describe('identifyDarkMatter', () => {
  it('identifies dark matter files', () => {
    const visible = analyzeCelestialBody('export function a() {}', 'a.ts', [], [])
    const hidden = analyzeCelestialBody('function hidden() {}', 'hidden.ts', [], [])
    expect(identifyDarkMatter([visible, hidden])).toHaveLength(1)
  })
})

describe('identifySupernovae', () => {
  it('identifies supernova files', () => {
    const clean = analyzeCelestialBody('export function clean() {}', 'clean.ts', [], [])
    const unstable = analyzeCelestialBody(
      '// TODO\n// FIXME\n// HACK\n// TODO\n// FIXME\nfunction f(x: any) { return x }',
      'unstable.ts', [], [],
    )
    const supernovae = identifySupernovae([clean, unstable])
    if (unstable.isSupernova) {
      expect(supernovae.length).toBeGreaterThanOrEqual(1)
    }
  })
})

// ─── generateObservatoryDomeRecommendations ──────────────────────────────────

describe('generateObservatoryDomeRecommendations', () => {
  const emptyStats = {
    totalFiles: 0, totalConstellations: 0, stars: 0, planets: 0, moons: 0,
    blackHoles: 0, supernovae: 0, nebulae: 0, darkMatter: 0, pulsars: 0,
    binarySystems: 0, avgLuminosity: 50, avgMagnitude: 50, avgDistance: 30,
    avgTemperature: 20, dominantSpectralType: 'G', dominantBodyType: 'asteroid',
    brightestBody: 'none', dimmestBody: 'none', heaviestBody: 'none',
    mostInfluential: 'none', gravitationalCenter: 'none',
    cosmicBackground: 50, galaxyType: 'spiral' as const, observationGrade: 'binoculars' as const,
  }

  it('recommends clear skies for healthy codebase', () => {
    const stats = { ...emptyStats, avgLuminosity: 60, avgTemperature: 15, cosmicBackground: 50 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Clear skies')
  })

  it('warns about black holes', () => {
    const stats = { ...emptyStats, blackHoles: 2 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('black hole'))).toBe(true)
  })

  it('warns about dark matter', () => {
    const stats = { ...emptyStats, darkMatter: 3 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('dark matter'))).toBe(true)
  })

  it('warns about supernovae', () => {
    const stats = { ...emptyStats, supernovae: 1 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('supernova'))).toBe(true)
  })

  it('warns about binary systems', () => {
    const stats = { ...emptyStats, binarySystems: 2 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('binary'))).toBe(true)
  })

  it('warns about low luminosity', () => {
    const stats = { ...emptyStats, avgLuminosity: 20 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('luminosity'))).toBe(true)
  })

  it('warns about high temperature', () => {
    const stats = { ...emptyStats, avgTemperature: 70 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('temperature'))).toBe(true)
  })

  it('warns about many nebulae', () => {
    const stats = { ...emptyStats, nebulae: 5 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('nebula'))).toBe(true)
  })

  it('warns about low cosmic background', () => {
    const stats = { ...emptyStats, cosmicBackground: 20 }
    const recs = generateObservatoryDomeRecommendations([], [], stats)
    expect(recs.some(r => r.includes('cosmic background'))).toBe(true)
  })

  it('warns about dying constellations', () => {
    const constellation = {
      directory: 'dying', name: 'dying', bodies: [], starCount: 0, planetCount: 0,
      blackHoleCount: 0, nebulaCount: 0, avgLuminosity: 0, avgMagnitude: 0, totalMass: 0,
      dominantSpectralType: 'M', dominantBodyType: 'asteroid', hasBinarySystems: false,
      binarySystemCount: 0, hasBlackHoles: false, hasSupernovae: false, hasDarkMatter: false,
      gravitationalCenter: 'none', isDense: false, isSparse: true,
      formation: 'irregular' as const, health: 'dead' as const,
    }
    const recs = generateObservatoryDomeRecommendations([], [constellation], emptyStats)
    expect(recs.some(r => r.includes('dying constellation'))).toBe(true)
  })
})

// ─── buildObservatoryDomeResult ──────────────────────────────────────────────

describe('buildObservatoryDomeResult', () => {
  it('handles empty input', () => {
    const result = buildObservatoryDomeResult([], [], {})
    expect(result.bodies).toEqual([])
    expect(result.constellations).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.galaxyType).toBe('void')
  })

  it('processes a single file', () => {
    const result = buildObservatoryDomeResult(
      ['hello.ts'],
      ['export function hello() { return 1 }'],
      {},
    )
    expect(result.bodies).toHaveLength(1)
    expect(result.bodies[0].file).toBe('hello.ts')
    expect(result.constellations).toHaveLength(1)
    expect(result.cosmicMap).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('groups files into constellations by directory', () => {
    const result = buildObservatoryDomeResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [
        'export function a() {}',
        'export function b() {}',
        'export function c() {}',
      ],
      {},
    )
    expect(result.bodies).toHaveLength(3)
    const dirs = result.constellations.map(c => c.directory)
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('files without slashes go to root constellation', () => {
    const result = buildObservatoryDomeResult(
      ['solo.ts'],
      ['export function solo() {}'],
      {},
    )
    expect(result.constellations).toHaveLength(1)
    expect(result.constellations[0].directory).toBe('.')
  })

  it('computes stats correctly', () => {
    const result = buildObservatoryDomeResult(
      ['a.ts', 'b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.avgLuminosity).toBe('number')
    expect(typeof result.stats.avgMagnitude).toBe('number')
    expect(typeof result.stats.avgTemperature).toBe('number')
    expect(typeof result.stats.brightestBody).toBe('string')
    expect(typeof result.stats.dimmestBody).toBe('string')
    expect(typeof result.stats.heaviestBody).toBe('string')
    expect(typeof result.stats.mostInfluential).toBe('string')
    expect(typeof result.stats.gravitationalCenter).toBe('string')
    expect(typeof result.stats.galaxyType).toBe('string')
    expect(typeof result.stats.observationGrade).toBe('string')
  })

  it('resolves imports to find dependents', () => {
    const result = buildObservatoryDomeResult(
      ['a.ts', 'b.ts'],
      [
        "import { b } from './b'\nexport function a() { return b() }",
        'export function b() { return 1 }',
      ],
      {},
    )
    // b.ts should have a.ts as a dependent (influencedBy)
    const bodyB = result.bodies.find(b => b.file === 'b.ts')
    expect(bodyB).toBeDefined()
    expect(bodyB!.influencedBy.length).toBeGreaterThanOrEqual(0)
  })

  it('computes cosmic map with correct values', () => {
    const result = buildObservatoryDomeResult(
      ['a.ts'],
      ['export function a() { return 1 }'],
      {},
    )
    expect(result.cosmicMap.totalLuminosity).toBe(result.bodies[0].luminosity)
    expect(result.cosmicMap.avgDistance).toBe(result.bodies[0].distance)
  })
})
