import { describe, expect, it } from 'vitest'

import {
  buildContourLines,
  buildElevationProfiles,
  buildTerrainMapResult,
  classifyFeatureDifficulty,
  classifyOverallDifficulty,
  classifyTerrainType,
  computeContourLevel,
  computeCyclomaticComplexity,
  computeElevation,
  computeGradient,
  computeLatitude,
  computeLongitude,
  computeNestingDepth,
  countFunctions,
  countNonBlankLines,
  findDominant,
  generateRecommendations,
  getDirectory,
  identifyFeatures,
  type ContourLine,
  type ElevationProfile,
  type TerrainMapOptions,
  type TerrainMapResult,
  type TerrainMapStats,
  type TerrainPoint,
  type TopographicFeature,
} from '../src/commands/terrain-map-helpers.js'

import {
  formatContourMap,
  formatDifficulty,
  formatElevationBar,
  formatElevationProfile,
  formatFeatureTable,
  formatRecommendations,
  formatTerrainBadge,
  formatTerrainMapJson,
  formatTerrainMapStats,
  formatTerrainMapTable,
  formatTerrainPointTable,
} from '../src/commands/terrain-map-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
const z = x + y
`

const COMPLEX_CONTENT = `function process(data: any): void {
  if (data) {
    for (const item of data.items) {
      if (item.active) {
        switch (item.type) {
          case 'a': handleA(item); break
          case 'b': handleB(item); break
          default: handleDefault(item); break
        }
      } else {
        if (item.pending) { processPending(item) }
        else { skip(item) }
      }
    }
  }
}
`

const NESTED_CONTENT = `function deep(x: number): number {
  if (x > 0) {
    if (x > 10) {
      if (x > 100) {
        if (x > 1000) {
          return x
        }
      }
    }
  }
  return 0
}
`

const LARGE_SIMPLE_CONTENT = Array(120).fill('const x = 1').join('\n')

const MULTI_FILES = ['src/app.ts', 'src/utils.ts', 'test/app.test.ts']
const MULTI_CONTENTS = [COMPLEX_CONTENT, SIMPLE_CONTENT, 'import { process } from "../src/app"\ntest("works", () => {})\n']

const PEAK_FILES = ['core/a.ts', 'core/b.ts', 'core/c.ts', 'core/d.ts']
const PEAK_CONTENTS = [COMPLEX_CONTENT, COMPLEX_CONTENT, COMPLEX_CONTENT, COMPLEX_CONTENT]

// ─── computeCyclomaticComplexity ───────────────────────────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeCyclomaticComplexity('if (a) {} if (b) {}')).toBe(3)
  })

  it('counts switch and case', () => {
    expect(computeCyclomaticComplexity('switch(x) { case 1: break; case 2: break; }')).toBe(4)
  })
})

// ─── computeNestingDepth ───────────────────────────────────────────────────────

describe('computeNestingDepth', () => {
  it('returns 0 for flat code', () => {
    expect(computeNestingDepth('const x = 1')).toBe(0)
  })

  it('counts nesting', () => {
    expect(computeNestingDepth('if (a) { if (b) { if (c) {} } }')).toBe(3)
  })

  it('handles empty string', () => {
    expect(computeNestingDepth('')).toBe(0)
  })
})

// ─── countNonBlankLines ────────────────────────────────────────────────────────

describe('countNonBlankLines', () => {
  it('counts non-blank lines', () => {
    expect(countNonBlankLines('a\n\nb\nc')).toBe(3)
  })

  it('returns 0 for empty', () => {
    expect(countNonBlankLines('')).toBe(0)
  })
})

// ─── countFunctions ────────────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function a() {} function b() {}')).toBe(2)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const a = () => {}')).toBe(1)
  })

  it('counts constructors', () => {
    expect(countFunctions('class X { constructor() {} }')).toBe(1)
  })
})

// ─── computeElevation ──────────────────────────────────────────────────────────

describe('computeElevation', () => {
  it('returns 0 for empty content', () => {
    expect(computeElevation('')).toBe(0)
  })

  it('returns low elevation for simple code', () => {
    expect(computeElevation(SIMPLE_CONTENT)).toBeLessThan(20)
  })

  it('returns high elevation for complex code', () => {
    expect(computeElevation(COMPLEX_CONTENT)).toBeGreaterThan(30)
  })

  it('returns 0-100 range', () => {
    const elev = computeElevation(COMPLEX_CONTENT)
    expect(elev).toBeGreaterThanOrEqual(0)
    expect(elev).toBeLessThanOrEqual(100)
  })
})

// ─── computeContourLevel ───────────────────────────────────────────────────────

describe('computeContourLevel', () => {
  it('returns 0 for elevation 5', () => {
    expect(computeContourLevel(5)).toBe(0)
  })

  it('returns 5 for elevation 55', () => {
    expect(computeContourLevel(55)).toBe(5)
  })

  it('returns 10 for elevation 100', () => {
    expect(computeContourLevel(100)).toBe(10)
  })
})

// ─── computeLatitude ───────────────────────────────────────────────────────────

describe('computeLatitude', () => {
  it('returns 0 for root file', () => {
    expect(computeLatitude('app.ts')).toBe(0)
  })

  it('returns depth for nested file', () => {
    expect(computeLatitude('src/commands/app.ts')).toBe(2)
  })
})

// ─── computeLongitude ──────────────────────────────────────────────────────────

describe('computeLongitude', () => {
  it('returns 0 for first file in directory', () => {
    expect(computeLongitude('src/a.ts', ['src/a.ts', 'src/b.ts'])).toBe(0)
  })

  it('returns 1 for second file', () => {
    expect(computeLongitude('src/b.ts', ['src/a.ts', 'src/b.ts'])).toBe(1)
  })
})

// ─── classifyTerrainType ───────────────────────────────────────────────────────

describe('classifyTerrainType', () => {
  it('classifies peak for high isolated elevation', () => {
    expect(classifyTerrainType(85, [40, 30])).toBe('peak')
  })

  it('classifies valley for low surrounded by high', () => {
    expect(classifyTerrainType(10, [50, 60])).toBe('valley')
  })

  it('classifies cliff for large elevation difference', () => {
    expect(classifyTerrainType(40, [90])).toBe('cliff')
  })

  it('classifies ridge for high connected', () => {
    expect(classifyTerrainType(65, [60, 55])).toBe('ridge')
  })

  it('classifies plateau for moderate uniform', () => {
    expect(classifyTerrainType(50, [48, 52])).toBe('plateau')
  })

  it('classifies plain for low-moderate', () => {
    expect(classifyTerrainType(30, [28, 32])).toBe('plain')
  })

  it('classifies peak with no neighbors', () => {
    expect(classifyTerrainType(85, [])).toBe('peak')
  })

  it('classifies valley with no neighbors', () => {
    expect(classifyTerrainType(10, [])).toBe('valley')
  })

  it('classifies plateau with no neighbors', () => {
    expect(classifyTerrainType(50, [])).toBe('plateau')
  })
})

// ─── buildContourLines ─────────────────────────────────────────────────────────

describe('buildContourLines', () => {
  it('groups points by contour level', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 15, latitude: 0, longitude: 0, terrainType: 'plain', contourLevel: 1 },
      { file: 'b.ts', elevation: 55, latitude: 0, longitude: 1, terrainType: 'plateau', contourLevel: 5 },
    ]
    const contours = buildContourLines(points)
    expect(contours).toHaveLength(2)
    expect(contours[0].level).toBe(1)
    expect(contours[1].level).toBe(5)
  })

  it('skips empty levels', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 15, latitude: 0, longitude: 0, terrainType: 'plain', contourLevel: 1 },
    ]
    const contours = buildContourLines(points)
    expect(contours).toHaveLength(1)
    expect(contours[0].level).toBe(1)
  })

  it('marks even levels as contour intervals', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 20, latitude: 0, longitude: 0, terrainType: 'plain', contourLevel: 2 },
    ]
    const contours = buildContourLines(points)
    expect(contours[0].isContourInterval).toBe(true)
  })

  it('returns empty for no points', () => {
    expect(buildContourLines([])).toEqual([])
  })
})

// ─── getDirectory ──────────────────────────────────────────────────────────────

describe('getDirectory', () => {
  it('extracts directory', () => {
    expect(getDirectory('src/commands/app.ts')).toBe('src/commands')
  })

  it('returns dot for root file', () => {
    expect(getDirectory('app.ts')).toBe('.')
  })
})

// ─── identifyFeatures ──────────────────────────────────────────────────────────

describe('identifyFeatures', () => {
  it('identifies mountain range for 3+ high files', () => {
    const points: TerrainPoint[] = PEAK_FILES.map((f, i) => ({
      file: f, elevation: 70 + i * 2, latitude: 1, longitude: i, terrainType: 'peak' as const, contourLevel: 7,
    }))
    const contours: ContourLine[] = [{ level: 7, elevation: 70, files: PEAK_FILES, density: 4, isContourInterval: true }]
    const features = identifyFeatures(points, contours)
    const range = features.find(f => f.type === 'mountain-range')
    expect(range).toBeDefined()
    expect(range!.files.length).toBeGreaterThanOrEqual(3)
  })

  it('identifies basin for low average directory', () => {
    const points: TerrainPoint[] = [
      { file: 'simple/a.ts', elevation: 5, latitude: 1, longitude: 0, terrainType: 'valley', contourLevel: 0 },
      { file: 'simple/b.ts', elevation: 10, latitude: 1, longitude: 1, terrainType: 'valley', contourLevel: 1 },
      { file: 'simple/c.ts', elevation: 8, latitude: 1, longitude: 2, terrainType: 'valley', contourLevel: 0 },
    ]
    const features = identifyFeatures(points, [])
    const basin = features.find(f => f.type === 'basin')
    expect(basin).toBeDefined()
  })

  it('returns empty for single file', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 50, latitude: 0, longitude: 0, terrainType: 'plateau', contourLevel: 5 },
    ]
    const features = identifyFeatures(points, [])
    expect(features.length).toBe(0)
  })
})

// ─── buildElevationProfiles ────────────────────────────────────────────────────

describe('buildElevationProfiles', () => {
  it('builds profiles per directory', () => {
    const points: TerrainPoint[] = [
      { file: 'src/a.ts', elevation: 50, latitude: 1, longitude: 0, terrainType: 'plateau', contourLevel: 5 },
      { file: 'src/b.ts', elevation: 30, latitude: 1, longitude: 1, terrainType: 'plain', contourLevel: 3 },
      { file: 'test/c.ts', elevation: 10, latitude: 1, longitude: 0, terrainType: 'valley', contourLevel: 1 },
    ]
    const profiles = buildElevationProfiles(points, ['src/a.ts', 'src/b.ts', 'test/c.ts'])
    expect(profiles).toHaveLength(2)

    const srcProfile = profiles.find(p => p.directory === 'src')
    expect(srcProfile).toBeDefined()
    expect(srcProfile!.profile).toHaveLength(2)
  })

  it('computes correct gradient', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 10, latitude: 0, longitude: 0, terrainType: 'plain', contourLevel: 1 },
      { file: 'b.ts', elevation: 30, latitude: 0, longitude: 1, terrainType: 'plain', contourLevel: 3 },
      { file: 'c.ts', elevation: 50, latitude: 0, longitude: 2, terrainType: 'plain', contourLevel: 5 },
    ]
    const profiles = buildElevationProfiles(points, ['a.ts', 'b.ts', 'c.ts'])
    expect(profiles[0].gradient).toBe(20)
  })
})

// ─── computeGradient ───────────────────────────────────────────────────────────

describe('computeGradient', () => {
  it('returns 0 for single point', () => {
    expect(computeGradient([['a.ts', 50]])).toBe(0)
  })

  it('computes average change', () => {
    expect(computeGradient([['a.ts', 10], ['b.ts', 30], ['c.ts', 50]])).toBe(20)
  })

  it('returns 0 for empty', () => {
    expect(computeGradient([])).toBe(0)
  })
})

// ─── classifyFeatureDifficulty ─────────────────────────────────────────────────

describe('classifyFeatureDifficulty', () => {
  it('returns easy for low elevation', () => {
    expect(classifyFeatureDifficulty(15)).toBe('easy')
  })

  it('returns moderate for mid elevation', () => {
    expect(classifyFeatureDifficulty(35)).toBe('moderate')
  })

  it('returns challenging for high elevation', () => {
    expect(classifyFeatureDifficulty(55)).toBe('challenging')
  })

  it('returns extreme for very high elevation', () => {
    expect(classifyFeatureDifficulty(75)).toBe('extreme')
  })
})

// ─── classifyOverallDifficulty ─────────────────────────────────────────────────

describe('classifyOverallDifficulty', () => {
  it('returns easy for low avg and max', () => {
    expect(classifyOverallDifficulty(15, 30)).toBe('easy')
  })

  it('returns moderate for mid values', () => {
    expect(classifyOverallDifficulty(25, 55)).toBe('moderate')
  })

  it('returns challenging for high values', () => {
    expect(classifyOverallDifficulty(45, 75)).toBe('challenging')
  })

  it('returns extreme for very high values', () => {
    expect(classifyOverallDifficulty(65, 95)).toBe('extreme')
  })

  it('returns extreme for high max even with low avg', () => {
    expect(classifyOverallDifficulty(30, 95)).toBe('extreme')
  })
})

// ─── findDominant ──────────────────────────────────────────────────────────────

describe('findDominant', () => {
  it('finds most common value', () => {
    expect(findDominant(['peak', 'valley', 'peak'])).toBe('peak')
  })

  it('returns first for ties', () => {
    expect(findDominant(['a', 'b'])).toBe('a')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: TerrainMapStats = {
    totalPoints: 5, peakCount: 0, valleyCount: 0, avgElevation: 40,
    maxElevation: 60, minElevation: 20, elevationRange: 40,
    dominantTerrain: 'plain', steepestGradient: 'src', flattestArea: 'test',
    contourDensity: 2, overallDifficulty: 'moderate',
  }

  it('recommends simplifying peaks', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 85, latitude: 0, longitude: 0, terrainType: 'peak', contourLevel: 8 },
    ]
    const recs = generateRecommendations(points, [], [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('peak'))).toBe(true)
  })

  it('recommends easing cliffs', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 40, latitude: 0, longitude: 0, terrainType: 'cliff', contourLevel: 4 },
    ]
    const recs = generateRecommendations(points, [], [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('cliff'))).toBe(true)
  })

  it('recommends for extreme difficulty', () => {
    const stats = { ...baseStats, overallDifficulty: 'extreme' as const }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.toLowerCase().includes('extreme'))).toBe(true)
  })

  it('recommends verifying deep valleys', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 5, latitude: 0, longitude: 0, terrainType: 'valley', contourLevel: 0 },
    ]
    const recs = generateRecommendations(points, [], [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('valley'))).toBe(true)
  })

  it('returns empty for healthy terrain', () => {
    const recs = generateRecommendations([], [], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildTerrainMapResult ─────────────────────────────────────────────────────

describe('buildTerrainMapResult', () => {
  it('builds complete result', () => {
    const result = buildTerrainMapResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.points).toHaveLength(3)
    expect(result.stats.totalPoints).toBe(3)
    expect(result.stats.maxElevation).toBeGreaterThan(0)
  })

  it('handles empty file list', () => {
    const result = buildTerrainMapResult([], [], {})
    expect(result.points).toEqual([])
    expect(result.stats.totalPoints).toBe(0)
    expect(result.stats.avgElevation).toBe(0)
    expect(result.stats.maxElevation).toBe(0)
    expect(result.stats.minElevation).toBe(0)
  })

  it('computes correct terrain types', () => {
    const result = buildTerrainMapResult(['complex.ts'], [COMPLEX_CONTENT], {})
    expect(result.points[0].elevation).toBeGreaterThan(0)
  })

  it('detects crater for large simple file', () => {
    const result = buildTerrainMapResult(['large.ts'], [LARGE_SIMPLE_CONTENT], {})
    expect(result.points[0].terrainType).toBe('crater')
  })

  it('builds contour lines', () => {
    const result = buildTerrainMapResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.contours.length).toBeGreaterThan(0)
  })

  it('builds elevation profiles', () => {
    const result = buildTerrainMapResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.profiles.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildTerrainMapResult(['a.ts', 'b.ts'], [COMPLEX_CONTENT, SIMPLE_CONTENT], {})
    expect(result.stats.elevationRange).toBe(result.stats.maxElevation - result.stats.minElevation)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatTerrainBadge returns terrain name', () => {
    expect(formatTerrainBadge('peak')).toContain('peak')
  })

  it('formatDifficulty returns difficulty text', () => {
    expect(formatDifficulty('extreme')).toContain('extreme')
  })

  it('formatElevationBar returns bar and elevation', () => {
    const bar = formatElevationBar(75)
    expect(bar).toContain('75')
  })

  it('formatContourMap returns contour data', () => {
    const contours: ContourLine[] = [
      { level: 3, elevation: 30, files: ['a.ts'], density: 1, isContourInterval: false },
    ]
    const map = formatContourMap(contours)
    expect(map).toContain('30m')
  })

  it('formatContourMap returns message for empty', () => {
    expect(formatContourMap([])).toContain('No contour')
  })

  it('formatTerrainPointTable returns table', () => {
    const points: TerrainPoint[] = [
      { file: 'a.ts', elevation: 50, latitude: 0, longitude: 0, terrainType: 'plateau', contourLevel: 5 },
    ]
    const table = formatTerrainPointTable(points)
    expect(table).toContain('a.ts')
  })

  it('formatTerrainPointTable returns message for empty', () => {
    expect(formatTerrainPointTable([])).toContain('No terrain')
  })

  it('formatFeatureTable returns table', () => {
    const features: TopographicFeature[] = [
      { name: 'Test Range', type: 'mountain-range', files: ['a.ts'], avgElevation: 75, maxElevation: 85, description: 'high', difficulty: 'extreme' },
    ]
    const table = formatFeatureTable(features)
    expect(table).toContain('Test Range')
  })

  it('formatFeatureTable returns message for empty', () => {
    expect(formatFeatureTable([])).toContain('No topographic')
  })

  it('formatElevationProfile returns profile', () => {
    const profile: ElevationProfile = {
      directory: 'src', profile: [['a.ts', 50], ['b.ts', 30]],
      avgElevation: 40, gradient: 20, feature: 'rolling',
    }
    const formatted = formatElevationProfile(profile)
    expect(formatted).toContain('src')
    expect(formatted).toContain('50m')
  })

  it('formatTerrainMapStats returns stats', () => {
    const stats: TerrainMapStats = {
      totalPoints: 10, peakCount: 2, valleyCount: 1, avgElevation: 45,
      maxElevation: 85, minElevation: 10, elevationRange: 75,
      dominantTerrain: 'plain', steepestGradient: 'src', flattestArea: 'test',
      contourDensity: 3, overallDifficulty: 'challenging',
    }
    const formatted = formatTerrainMapStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('challenging')
  })

  it('formatRecommendations returns bullets', () => {
    const recs = formatRecommendations(['Simplify peaks'])
    expect(recs).toContain('Simplify peaks')
  })

  it('formatRecommendations returns success for empty', () => {
    expect(formatRecommendations([])).toContain('navigable')
  })

  it('formatTerrainMapJson returns valid JSON', () => {
    const result = buildTerrainMapResult([], [], {})
    const json = formatTerrainMapJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatTerrainMapTable returns output', () => {
    const result = buildTerrainMapResult(['a.ts'], [SIMPLE_CONTENT], {})
    const output = formatTerrainMapTable(result, false)
    expect(output.length).toBeGreaterThan(0)
  })
})
