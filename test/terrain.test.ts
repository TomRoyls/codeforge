import { describe, expect, it } from 'vitest'

import {
  buildTerrainResultDeterministic,
  classifyTerrain,
  computeCyclomaticComplexity,
  computeDangerLevel,
  computeElevation,
  computeTerrainStats,
  computeTemperature,
  computeVegetation,
  computeWater,
  generateLegend,
  generateTerrainRecommendations,
  identifyFeatures,
  type TerrainFeature,
  type TerrainStats,
  type TerrainTile,
  buildTile,
} from '../src/commands/terrain-helpers.js'

import {
  formatFeature,
  formatFeatures,
  formatLegend,
  formatRecommendations,
  formatTerrainJSON,
  formatTerrainMap,
  formatTerrainStats,
  formatTerrainTable,
  formatTile,
  getDangerColor,
  getElevationChar,
  getTerrainShade,
} from '../src/commands/terrain-format-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIMPLE_CODE = 'const x = 1\n'
const MODERATE_CODE = 'if (a) { for (let i = 0; i < n; i++) { foo() } }\n'
const COMPLEX_CODE = Array(10).fill('if (a) { for (let i = 0; i < n; i++) { while (x) { switch(v) { case 1: break; } } } }').join('\n')
const COMMENTED_CODE = Array(10).fill('// comment line').join('\n') + '\nconst x = 1\n'

function makeTile(overrides: Partial<TerrainTile> = {}): TerrainTile {
  return {
    file: 'test.ts',
    elevation: 50,
    area: 100,
    temperature: 30,
    vegetation: 40,
    water: 50,
    terrain: 'hill',
    ...overrides,
  }
}

function makeFeature(overrides: Partial<TerrainFeature> = {}): TerrainFeature {
  return {
    name: 'Test Feature',
    type: 'mountain',
    files: ['a.ts'],
    description: 'A test feature',
    elevation: 80,
    area: 200,
    dangerLevel: 'safe',
    ...overrides,
  }
}

function makeStats(overrides: Partial<TerrainStats> = {}): TerrainStats {
  return {
    totalFiles: 10,
    averageElevation: 50,
    maxElevation: 90,
    minElevation: 5,
    mountains: 3,
    valleys: 2,
    plains: 5,
    dangerZones: 1,
    averageTemperature: 30,
    averageVegetation: 40,
    averageWater: 50,
    ...overrides,
  }
}

// ─── computeCyclomaticComplexity ──────────────────────────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for empty code', () => {
    expect(computeCyclomaticComplexity('')).toBe(1)
  })

  it('returns 1 for simple assignment', () => {
    expect(computeCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeCyclomaticComplexity('if (a) {} if (b) {}')).toBe(3)
  })

  it('counts for loops', () => {
    expect(computeCyclomaticComplexity('for (let i = 0; i < n; i++) {}')).toBe(2)
  })

  it('counts while loops', () => {
    expect(computeCyclomaticComplexity('while (x) {}')).toBe(2)
  })

  it('counts switch cases', () => {
    expect(computeCyclomaticComplexity('switch(v) { case 1: break; case 2: break; }')).toBe(4)
  })

  it('counts catch blocks', () => {
    expect(computeCyclomaticComplexity('try {} catch(e) {}')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(computeCyclomaticComplexity('a && b || c')).toBe(3)
  })

  it('counts nullish coalescing', () => {
    expect(computeCyclomaticComplexity('a ?? b')).toBe(2)
  })

  it('counts optional chaining', () => {
    expect(computeCyclomaticComplexity('a?.b')).toBe(2)
  })

  it('accumulates complexity from multiple patterns', () => {
    const code = 'if (a) { for (let i = 0; i < n; i++) { if (b && c) {} } }'
    const result = computeCyclomaticComplexity(code)
    expect(result).toBeGreaterThan(3)
  })
})

// ─── computeElevation ─────────────────────────────────────────────────────────

describe('computeElevation', () => {
  it('returns 5 for complexity <= 1', () => {
    expect(computeElevation(1)).toBe(5)
  })

  it('returns 15 for complexity 2-3', () => {
    expect(computeElevation(3)).toBe(15)
  })

  it('returns 25 for complexity 4-5', () => {
    expect(computeElevation(5)).toBe(25)
  })

  it('returns 40 for complexity 6-10', () => {
    expect(computeElevation(10)).toBe(40)
  })

  it('returns 55 for complexity 11-15', () => {
    expect(computeElevation(15)).toBe(55)
  })

  it('returns 65 for complexity 16-20', () => {
    expect(computeElevation(20)).toBe(65)
  })

  it('returns 75 for complexity 21-30', () => {
    expect(computeElevation(30)).toBe(75)
  })

  it('returns 85 for complexity 31-50', () => {
    expect(computeElevation(50)).toBe(85)
  })

  it('returns 95 for complexity > 50', () => {
    expect(computeElevation(100)).toBe(95)
  })
})

// ─── classifyTerrain ──────────────────────────────────────────────────────────

describe('classifyTerrain', () => {
  it('classifies valley for elevation < 20', () => {
    expect(classifyTerrain(5)).toBe('valley')
    expect(classifyTerrain(15)).toBe('valley')
  })

  it('classifies plain for elevation 20-39', () => {
    expect(classifyTerrain(20)).toBe('plain')
    expect(classifyTerrain(35)).toBe('plain')
  })

  it('classifies hill for elevation 40-59', () => {
    expect(classifyTerrain(40)).toBe('hill')
    expect(classifyTerrain(55)).toBe('hill')
  })

  it('classifies mountain for elevation >= 60', () => {
    expect(classifyTerrain(60)).toBe('mountain')
    expect(classifyTerrain(95)).toBe('mountain')
  })
})

// ─── computeTemperature ───────────────────────────────────────────────────────

describe('computeTemperature', () => {
  it('returns low for 0-1 changes', () => {
    expect(computeTemperature(0)).toBe(0)
    expect(computeTemperature(1)).toBe(10)
  })

  it('returns moderate for 2-5 changes', () => {
    expect(computeTemperature(3)).toBeGreaterThanOrEqual(20)
    expect(computeTemperature(5)).toBeGreaterThanOrEqual(40)
  })

  it('returns high for 6-15 changes', () => {
    expect(computeTemperature(10)).toBeGreaterThanOrEqual(50)
  })

  it('returns very high for > 15 changes', () => {
    expect(computeTemperature(20)).toBeGreaterThanOrEqual(80)
  })

  it('clamps to 100', () => {
    expect(computeTemperature(1000)).toBeLessThanOrEqual(100)
  })
})

// ─── computeVegetation ────────────────────────────────────────────────────────

describe('computeVegetation', () => {
  it('returns 0 for empty content', () => {
    expect(computeVegetation('')).toBe(0)
  })

  it('returns low for no comments', () => {
    expect(computeVegetation('const x = 1\nconst y = 2')).toBe(0)
  })

  it('returns high for all comments', () => {
    const allComments = '// line 1\n// line 2\n// line 3'
    expect(computeVegetation(allComments)).toBeGreaterThan(50)
  })

  it('detects /* block comments */', () => {
    expect(computeVegetation('/* block */')).toBeGreaterThan(0)
  })

  it('detects /** JSDoc */', () => {
    expect(computeVegetation('/** docs */')).toBeGreaterThan(0)
  })

  it('detects * in multiline comments', () => {
    expect(computeVegetation(' * middle line')).toBeGreaterThan(0)
  })
})

// ─── computeWater ─────────────────────────────────────────────────────────────

describe('computeWater', () => {
  it('returns 0 for no test file', () => {
    expect(computeWater(false, 0)).toBe(0)
  })

  it('returns 0 for no test file even with assertions', () => {
    expect(computeWater(false, 100)).toBe(0)
  })

  it('returns 15 for test file with 0 assertions', () => {
    expect(computeWater(true, 0)).toBe(15)
  })

  it('returns 30 for test file with 1-3 assertions', () => {
    expect(computeWater(true, 2)).toBe(30)
  })

  it('returns 50 for test file with 4-10 assertions', () => {
    expect(computeWater(true, 7)).toBe(50)
  })

  it('returns 70 for test file with 11-25 assertions', () => {
    expect(computeWater(true, 20)).toBe(70)
  })

  it('returns 90 for test file with > 25 assertions', () => {
    expect(computeWater(true, 50)).toBe(90)
  })
})

// ─── computeDangerLevel ───────────────────────────────────────────────────────

describe('computeDangerLevel', () => {
  it('returns safe for low elevation with good water', () => {
    expect(computeDangerLevel(makeTile({ elevation: 30, water: 60 }))).toBe('safe')
  })

  it('returns extreme for high elevation with dry water', () => {
    expect(computeDangerLevel(makeTile({ elevation: 75, water: 10 }))).toBe('extreme')
  })

  it('returns dangerous for high elevation with low water', () => {
    expect(computeDangerLevel(makeTile({ elevation: 65, water: 25 }))).toBe('dangerous')
  })

  it('returns caution for medium elevation with low water', () => {
    expect(computeDangerLevel(makeTile({ elevation: 45, water: 30 }))).toBe('caution')
  })

  it('returns caution for medium-high elevation with no vegetation', () => {
    expect(computeDangerLevel(makeTile({ elevation: 55, vegetation: 5 }))).toBe('caution')
  })
})

// ─── buildTile ────────────────────────────────────────────────────────────────

describe('buildTile', () => {
  it('builds a tile from simple code', () => {
    const tile = buildTile('simple.ts', SIMPLE_CODE, 1, false, 0)
    expect(tile.file).toBe('simple.ts')
    expect(tile.elevation).toBeGreaterThanOrEqual(0)
    expect(tile.area).toBe(2)
    expect(tile.terrain).toBe('valley')
  })

  it('builds a tile from complex code', () => {
    const tile = buildTile('complex.ts', COMPLEX_CODE, 5, true, 10)
    expect(tile.elevation).toBeGreaterThanOrEqual(60)
    expect(tile.terrain).toBe('mountain')
  })

  it('computes vegetation from comments', () => {
    const tile = buildTile('docs.ts', COMMENTED_CODE, 1, false, 0)
    expect(tile.vegetation).toBeGreaterThan(0)
  })

  it('computes water from test info', () => {
    const tile = buildTile('test.ts', 'describe("test") {}', 1, true, 15)
    expect(tile.water).toBeGreaterThan(0)
  })
})

// ─── identifyFeatures ─────────────────────────────────────────────────────────

describe('identifyFeatures', () => {
  it('returns empty for no tiles', () => {
    expect(identifyFeatures([])).toEqual([])
  })

  it('detects mountain range for 2+ mountain tiles', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 80, terrain: 'mountain' }),
      makeTile({ file: 'b.ts', elevation: 70, terrain: 'mountain' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'mountain')).toBe(true)
  })

  it('detects valley for 2+ valley tiles', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 10, terrain: 'valley' }),
      makeTile({ file: 'b.ts', elevation: 5, terrain: 'valley' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'valley')).toBe(true)
  })

  it('detects plains for 3+ plain tiles', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 25, terrain: 'plain' }),
      makeTile({ file: 'b.ts', elevation: 30, terrain: 'plain' }),
      makeTile({ file: 'c.ts', elevation: 35, terrain: 'plain' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'plain')).toBe(true)
  })

  it('detects cliff for large elevation gap', () => {
    const tiles = [
      makeTile({ file: 'high.ts', elevation: 95, terrain: 'mountain' }),
      makeTile({ file: 'low.ts', elevation: 5, terrain: 'valley' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'cliff')).toBe(true)
  })

  it('detects canyon for dry files with moderate elevation', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 50, water: 5, terrain: 'hill' }),
      makeTile({ file: 'b.ts', elevation: 40, water: 0, terrain: 'hill' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'canyon')).toBe(true)
  })

  it('detects ridge for 2+ hill tiles', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 45, terrain: 'hill' }),
      makeTile({ file: 'b.ts', elevation: 50, terrain: 'hill' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'ridge')).toBe(true)
  })

  it('detects plateau for 3+ tiles at similar elevation', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 50, terrain: 'hill' }),
      makeTile({ file: 'b.ts', elevation: 50, terrain: 'hill' }),
      makeTile({ file: 'c.ts', elevation: 50, terrain: 'hill' }),
    ]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'plateau')).toBe(true)
  })

  it('does not detect mountain range for < 2 mountains', () => {
    const tiles = [makeTile({ file: 'a.ts', elevation: 70, terrain: 'mountain' })]
    const features = identifyFeatures(tiles)
    expect(features.some((f) => f.type === 'mountain')).toBe(false)
  })
})

// ─── computeTerrainStats ──────────────────────────────────────────────────────

describe('computeTerrainStats', () => {
  it('returns zeroed stats for empty tiles', () => {
    const stats = computeTerrainStats([])
    expect(stats.totalFiles).toBe(0)
    expect(stats.averageElevation).toBe(0)
    expect(stats.mountains).toBe(0)
  })

  it('computes correct file counts by terrain', () => {
    const tiles = [
      makeTile({ terrain: 'mountain' }),
      makeTile({ terrain: 'mountain' }),
      makeTile({ terrain: 'valley' }),
      makeTile({ terrain: 'plain' }),
    ]
    const stats = computeTerrainStats(tiles)
    expect(stats.mountains).toBe(2)
    expect(stats.valleys).toBe(1)
    expect(stats.plains).toBe(1)
  })

  it('computes correct elevation stats', () => {
    const tiles = [
      makeTile({ elevation: 80 }),
      makeTile({ elevation: 20 }),
    ]
    const stats = computeTerrainStats(tiles)
    expect(stats.maxElevation).toBe(80)
    expect(stats.minElevation).toBe(20)
    expect(stats.averageElevation).toBe(50)
  })

  it('counts danger zones', () => {
    const tiles = [
      makeTile({ elevation: 75, water: 10 }),
      makeTile({ elevation: 30, water: 60 }),
    ]
    const stats = computeTerrainStats(tiles)
    expect(stats.dangerZones).toBeGreaterThanOrEqual(1)
  })

  it('computes average metrics', () => {
    const tiles = [
      makeTile({ temperature: 40, vegetation: 60, water: 80 }),
      makeTile({ temperature: 20, vegetation: 40, water: 60 }),
    ]
    const stats = computeTerrainStats(tiles)
    expect(stats.averageTemperature).toBe(30)
    expect(stats.averageVegetation).toBe(50)
    expect(stats.averageWater).toBe(70)
  })
})

// ─── generateLegend ───────────────────────────────────────────────────────────

describe('generateLegend', () => {
  it('returns 8 legend entries', () => {
    const legend = generateLegend()
    expect(legend.length).toBe(8)
  })

  it('contains Mountain', () => {
    expect(generateLegend().some((e) => e.includes('Mountain'))).toBe(true)
  })

  it('contains Temperature', () => {
    expect(generateLegend().some((e) => e.includes('Temperature'))).toBe(true)
  })

  it('contains Vegetation', () => {
    expect(generateLegend().some((e) => e.includes('Vegetation'))).toBe(true)
  })

  it('contains Water', () => {
    expect(generateLegend().some((e) => e.includes('Water'))).toBe(true)
  })

  it('contains Danger', () => {
    expect(generateLegend().some((e) => e.includes('Danger'))).toBe(true)
  })
})

// ─── generateTerrainRecommendations ───────────────────────────────────────────

describe('generateTerrainRecommendations', () => {
  it('recommends climbing gear for mountains', () => {
    const features = [makeFeature({ type: 'mountain', files: ['a.ts', 'b.ts'] })]
    const recs = generateTerrainRecommendations(features, makeStats())
    expect(recs.some((r) => r.includes('climbing gear'))).toBe(true)
  })

  it('recommends irrigation for canyons', () => {
    const features = [makeFeature({ type: 'canyon', files: ['a.ts', 'b.ts'] })]
    const recs = generateTerrainRecommendations(features, makeStats())
    expect(recs.some((r) => r.includes('irrigate'))).toBe(true)
  })

  it('recommends safety rails for cliffs', () => {
    const features = [makeFeature({ type: 'cliff', files: ['a.ts', 'b.ts'] })]
    const recs = generateTerrainRecommendations(features, makeStats())
    expect(recs.some((r) => r.includes('safety rails'))).toBe(true)
  })

  it('recommends reducing danger zones when > 30% of files', () => {
    const features: TerrainFeature[] = []
    const stats = makeStats({ totalFiles: 10, dangerZones: 5 })
    const recs = generateTerrainRecommendations(features, stats)
    expect(recs.some((r) => r.includes('danger zones'))).toBe(true)
  })

  it('recommends adding comments for low vegetation', () => {
    const features: TerrainFeature[] = []
    const stats = makeStats({ averageVegetation: 10 })
    const recs = generateTerrainRecommendations(features, stats)
    expect(recs.some((r) => r.includes('vegetation') || r.includes('comments'))).toBe(true)
  })

  it('recommends adding tests for low water', () => {
    const features: TerrainFeature[] = []
    const stats = makeStats({ averageWater: 15 })
    const recs = generateTerrainRecommendations(features, stats)
    expect(recs.some((r) => r.includes('test') || r.includes('irrigate') || r.includes('coverage'))).toBe(true)
  })

  it('says terrain is healthy when all good', () => {
    const features: TerrainFeature[] = []
    const stats = makeStats({ dangerZones: 0, averageVegetation: 50, averageWater: 60, mountains: 2, totalFiles: 10 })
    const recs = generateTerrainRecommendations(features, stats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('warns about too many mountains', () => {
    const features: TerrainFeature[] = []
    const stats = makeStats({ mountains: 8, totalFiles: 10 })
    const recs = generateTerrainRecommendations(features, stats)
    expect(recs.some((r) => r.includes('mountains') || r.includes('simplifying'))).toBe(true)
  })
})

// ─── buildTerrainResultDeterministic ──────────────────────────────────────────

describe('buildTerrainResultDeterministic', () => {
  it('builds result with correct number of tiles', () => {
    const result = buildTerrainResultDeterministic(
      ['a.ts', 'b.ts'],
      [SIMPLE_CODE, MODERATE_CODE],
      [1, 3],
      [false, true],
      [0, 5],
    )
    expect(result.tiles.length).toBe(2)
  })

  it('computes features', () => {
    const result = buildTerrainResultDeterministic(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [COMPLEX_CODE, COMPLEX_CODE, SIMPLE_CODE, SIMPLE_CODE],
      [5, 3, 1, 1],
      [false, false, false, false],
      [0, 0, 0, 0],
    )
    expect(result.features.length).toBeGreaterThan(0)
  })

  it('includes legend', () => {
    const result = buildTerrainResultDeterministic(['a.ts'], [SIMPLE_CODE], [1], [false], [0])
    expect(result.legend.length).toBe(8)
  })

  it('includes recommendations', () => {
    const result = buildTerrainResultDeterministic(['a.ts'], [SIMPLE_CODE], [1], [false], [0])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildTerrainResultDeterministic(
      ['a.ts', 'b.ts'],
      [SIMPLE_CODE, COMPLEX_CODE],
      [1, 5],
      [false, true],
      [0, 10],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.maxElevation).toBeGreaterThanOrEqual(result.stats.minElevation)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getTerrainShade', () => {
  it('returns function for mountain', () => {
    const fn = getTerrainShade('mountain')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  it('returns function for all terrain types', () => {
    for (const t of ['mountain', 'hill', 'plain', 'valley'] as const) {
      expect(typeof getTerrainShade(t)).toBe('function')
    }
  })
})

describe('getDangerColor', () => {
  it('returns function for all danger levels', () => {
    for (const l of ['safe', 'caution', 'dangerous', 'extreme'] as const) {
      expect(typeof getDangerColor(l)).toBe('function')
    }
  })
})

describe('getElevationChar', () => {
  it('returns ░ for low elevation', () => {
    expect(getElevationChar(10)).toBe('░')
  })

  it('returns ▒ for medium-low elevation', () => {
    expect(getElevationChar(30)).toBe('▒')
  })

  it('returns ▓ for medium-high elevation', () => {
    expect(getElevationChar(60)).toBe('▓')
  })

  it('returns █ for high elevation', () => {
    expect(getElevationChar(90)).toBe('█')
  })
})

describe('formatTile', () => {
  it('includes file name and metrics', () => {
    const tile = makeTile({ file: 'test.ts', elevation: 50, area: 100 })
    const result = formatTile(tile)
    expect(result).toContain('test.ts')
    expect(result).toContain('E: 50')
    expect(result).toContain('A:  100')
  })
})

describe('formatTerrainMap', () => {
  it('renders terrain map header and tiles', () => {
    const tiles = [
      makeTile({ file: 'a.ts', elevation: 80 }),
      makeTile({ file: 'b.ts', elevation: 20 }),
    ]
    const result = formatTerrainMap(tiles)
    expect(result).toContain('Terrain Map')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })

  it('truncates when > 30 tiles', () => {
    const tiles = Array(35).fill(null).map((_, i) => makeTile({ file: `file${i}.ts` }))
    const result = formatTerrainMap(tiles)
    expect(result).toContain('more tiles')
  })
})

describe('formatFeature', () => {
  it('includes feature name, elevation, area, danger', () => {
    const feature = makeFeature({ name: 'Mountain Range', elevation: 85, area: 500, dangerLevel: 'extreme' })
    const result = formatFeature(feature)
    expect(result).toContain('Mountain Range')
    expect(result).toContain('85')
    expect(result).toContain('500')
  })
})

describe('formatFeatures', () => {
  it('renders empty message when no features', () => {
    const result = formatFeatures([])
    expect(result).toContain('No significant terrain features')
  })

  it('renders features with details', () => {
    const features = [makeFeature({ name: 'Test' })]
    const result = formatFeatures(features)
    expect(result).toContain('Features')
    expect(result).toContain('Test')
  })
})

describe('formatTerrainStats', () => {
  it('renders stats with file counts and averages', () => {
    const stats = makeStats({ totalFiles: 20, minElevation: 5, maxElevation: 95, averageElevation: 50 })
    const result = formatTerrainStats(stats)
    expect(result).toContain('Files: 20')
    expect(result).toContain('5-95')
    expect(result).toContain('avg 50')
  })
})

describe('formatLegend', () => {
  it('renders legend entries', () => {
    const result = formatLegend(['Mountain: high', 'Valley: low'])
    expect(result).toContain('Legend')
    expect(result).toContain('Mountain: high')
    expect(result).toContain('Valley: low')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    const result = formatRecommendations(['Fix A', 'Fix B'])
    expect(result).toContain('1. Fix A')
    expect(result).toContain('2. Fix B')
  })

  it('renders empty message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatTerrainTable', () => {
  it('renders full table with all sections', () => {
    const result = buildTerrainResultDeterministic(
      ['a.ts', 'b.ts'],
      [SIMPLE_CODE, COMPLEX_CODE],
      [1, 5],
      [false, true],
      [0, 10],
    )
    const output = formatTerrainTable(result)
    expect(output).toContain('Terrain Map')
    expect(output).toContain('Stats')
    expect(output).toContain('Legend')
    expect(output).toContain('Recommendations')
  })
})

describe('formatTerrainJSON', () => {
  it('returns valid JSON', () => {
    const result = buildTerrainResultDeterministic(
      ['a.ts'], [SIMPLE_CODE], [1], [false], [0],
    )
    const json = formatTerrainJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.tiles.length).toBe(1)
    expect(parsed.legend.length).toBe(8)
  })
})
