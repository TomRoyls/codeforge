import { describe, expect, it } from 'vitest'
import {
  measureDimension,
  computeDriftDirection,
  computeDirectionValue,
  computeFileDrift,
  analyzeZone,
  computeOverallDrift,
  computeDriftVelocity,
  computeCompassHeading,
  classifyNavigationGrade,
  generateRecommendations,
  buildCompassNeedleResult,
  type FileDrift,
  type DriftDimension,
  type CompassNeedleStats,
} from '../src/commands/compass-needle-helpers.js'

// ─── measureDimension ───────────────────────────────────

describe('measureDimension', () => {
  it('returns 50 for empty content', () => {
    expect(measureDimension('', 'a.ts', 'complexity')).toBe(50)
  })

  it('measures complexity for simple code', () => {
    const score = measureDimension('function foo() { return 1 }', 'a.ts', 'complexity')
    expect(score).toBeGreaterThanOrEqual(60)
  })

  it('measures complexity for complex code', () => {
    const code = 'function foo() { if (a) { if (b) { if (c) { for (let i = 0; i < 10; i++) { while (d) {} } } } } }'
    const score = measureDimension(code, 'a.ts', 'complexity')
    expect(score).toBeLessThanOrEqual(75)
  })

  it('measures type-safety with annotations', () => {
    const score = measureDimension('function foo(x: number): string { return String(x) }', 'a.ts', 'type-safety')
    expect(score).toBeGreaterThan(60)
  })

  it('measures type-safety with any', () => {
    const score = measureDimension('function foo(x: any): any {}', 'a.ts', 'type-safety')
    expect(score).toBeLessThanOrEqual(55)
  })

  it('measures documentation with JSDoc', () => {
    const code = '/** docs */\nfunction foo() {}'
    const score = measureDimension(code, 'a.ts', 'documentation')
    expect(score).toBeGreaterThan(50)
  })

  it('measures documentation without docs', () => {
    const score = measureDimension('function foo() { return 1 }', 'a.ts', 'documentation')
    expect(score).toBeLessThanOrEqual(50)
  })

  it('measures coupling with few imports', () => {
    const code = "import { foo } from './bar'\nexport function baz() {}"
    const score = measureDimension(code, 'a.ts', 'coupling')
    expect(score).toBeGreaterThanOrEqual(75)
  })

  it('measures coupling with many imports', () => {
    const code = Array.from({ length: 12 }, (_, i) => `import { m${i} } from './m${i}'`).join('\n')
    const score = measureDimension(code, 'a.ts', 'coupling')
    expect(score).toBeLessThanOrEqual(45)
  })

  it('measures size for small file', () => {
    const score = measureDimension('function foo() { return 1 }', 'a.ts', 'size')
    expect(score).toBeGreaterThanOrEqual(75)
  })

  it('measures size for large file', () => {
    const code = 'function foo() {\n' + '  const x = 1\n'.repeat(300) + '}'
    const score = measureDimension(code, 'a.ts', 'size')
    expect(score).toBeLessThanOrEqual(45)
  })

  it('measures consistency with consistent quotes', () => {
    const code = "const x = 'hello'\nconst y = 'world'"
    const score = measureDimension(code, 'a.ts', 'consistency')
    expect(score).toBeGreaterThan(70)
  })

  it('measures consistency penalizes var', () => {
    const code = 'var x = 1'
    const score = measureDimension(code, 'a.ts', 'consistency')
    expect(score).toBeLessThan(60)
  })

  it('measures error-handling with try-catch', () => {
    const code = 'try { foo() } catch (e) { throw e }'
    const score = measureDimension(code, 'a.ts', 'error-handling')
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('measures error-handling with empty catch', () => {
    const code = 'try { foo() } catch (e) {}'
    const score = measureDimension(code, 'a.ts', 'error-handling')
    expect(score).toBeLessThan(50)
  })

  it('measures abstraction with interfaces', () => {
    const code = 'interface Config { key: string }\ntype Result = string | number'
    const score = measureDimension(code, 'a.ts', 'abstraction')
    expect(score).toBeGreaterThan(60)
  })

  it('clamps all scores to 0-100', () => {
    const dims = ['complexity', 'type-safety', 'documentation', 'coupling', 'size', 'consistency', 'error-handling', 'abstraction'] as const
    for (const dim of dims) {
      const score = measureDimension('const x: any = 1\nvar y = 2', 'a.ts', dim)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })
})

// ─── computeDriftDirection ───────────────────────────────

describe('computeDriftDirection', () => {
  it('returns improving for high scores', () => {
    expect(computeDriftDirection(85)).toBe('improving')
  })

  it('returns stable for medium scores', () => {
    expect(computeDriftDirection(60)).toBe('stable')
  })

  it('returns degrading for low scores', () => {
    expect(computeDriftDirection(40)).toBe('degrading')
  })

  it('returns rapidly-degrading for very low scores', () => {
    expect(computeDriftDirection(20)).toBe('rapidly-degrading')
  })
})

// ─── computeDirectionValue ───────────────────────────────

describe('computeDirectionValue', () => {
  it('returns positive for high scores', () => {
    expect(computeDirectionValue(80)).toBeGreaterThan(0)
  })

  it('returns negative for low scores', () => {
    expect(computeDirectionValue(30)).toBeLessThan(0)
  })

  it('returns near zero for 50', () => {
    expect(computeDirectionValue(50)).toBe(0)
  })

  it('clamps to -1 to +1', () => {
    expect(computeDirectionValue(100)).toBe(1)
    expect(computeDirectionValue(0)).toBe(-1)
  })
})

// ─── computeFileDrift ───────────────────────────────────

describe('computeFileDrift', () => {
  it('computes all 8 dimensions', () => {
    const drift = computeFileDrift('const x = 1', 'a.ts')
    expect(Object.keys(drift.dimensions)).toHaveLength(8)
  })

  it('classifies well-typed code positively', () => {
    const drift = computeFileDrift('export function foo(x: number): string { return String(x) }', 'a.ts')
    expect(drift.overallDrift).toBeGreaterThan(-50)
  })

  it('classifies poor code with low type-safety', () => {
    const drift = computeFileDrift('var x: any = eval("1")', 'a.ts')
    expect(drift.dimensions['type-safety']).toBeLessThan(60)
    expect(drift.dimensions['consistency']).toBeLessThan(70)
  })

  it('detects drift direction', () => {
    const drift = computeFileDrift('const x = 1', 'a.ts')
    expect(['northward', 'eastward', 'southward', 'westward', 'stable']).toContain(drift.driftDirection)
  })

  it('identifies largest drift dimension', () => {
    const drift = computeFileDrift('const x = 1', 'a.ts')
    expect(drift.largestDrift).toBeTruthy()
  })

  it('classifies file type', () => {
    const drift = computeFileDrift('const x = 1', 'a.ts')
    expect(['beacon', 'steady', 'drifter', 'sinking', 'adrift']).toContain(drift.classification)
  })
})

// ─── analyzeZone ─────────────────────────────────────────

describe('analyzeZone', () => {
  it('handles empty files', () => {
    const zone = analyzeZone([], 'src')
    expect(zone.fileCount).toBe(0)
    expect(zone.health).toBe('stable-fair')
  })

  it('computes average drift', () => {
    const files: FileDrift[] = [
      { file: 'a.ts', dimensions: {}, overallDrift: 30, driftDirection: 'northward', isDriftingWell: true, isDriftingPoorly: false, isAnchored: false, largestDrift: 'complexity', classification: 'drifter' },
      { file: 'b.ts', dimensions: {}, overallDrift: -10, driftDirection: 'westward', isDriftingWell: false, isDriftingPoorly: false, isAnchored: true, largestDrift: 'type-safety', classification: 'steady' },
    ]
    const zone = analyzeZone(files, 'src')
    expect(zone.avgDrift).toBe(10)
    expect(zone.fileCount).toBe(2)
    expect(zone.improvingFiles).toBe(1)
    expect(zone.stableFiles).toBe(1)
  })

  it('detects dominant direction', () => {
    const files: FileDrift[] = [
      { file: 'a.ts', dimensions: {}, overallDrift: 40, driftDirection: 'northward', isDriftingWell: true, isDriftingPoorly: false, isAnchored: false, largestDrift: '', classification: 'drifter' },
      { file: 'b.ts', dimensions: {}, overallDrift: 50, driftDirection: 'northward', isDriftingWell: true, isDriftingPoorly: false, isAnchored: false, largestDrift: '', classification: 'beacon' },
    ]
    const zone = analyzeZone(files, 'src')
    expect(zone.dominantDirection).toBe('northward')
  })

  it('classifies health as ascending', () => {
    const files: FileDrift[] = [
      { file: 'a.ts', dimensions: {}, overallDrift: 50, driftDirection: 'northward', isDriftingWell: true, isDriftingPoorly: false, isAnchored: false, largestDrift: '', classification: 'beacon' },
    ]
    const zone = analyzeZone(files, 'src')
    expect(zone.health).toBe('ascending')
  })

  it('classifies health as falling', () => {
    const files: FileDrift[] = [
      { file: 'a.ts', dimensions: {}, overallDrift: -50, driftDirection: 'southward', isDriftingWell: false, isDriftingPoorly: true, isAnchored: false, largestDrift: '', classification: 'sinking' },
    ]
    const zone = analyzeZone(files, 'src')
    expect(zone.health).toBe('falling')
  })
})

// ─── computeOverallDrift ─────────────────────────────────

describe('computeOverallDrift', () => {
  it('returns 0 for no files', () => {
    expect(computeOverallDrift([])).toBe(0)
  })

  it('averages file drifts', () => {
    const files: FileDrift[] = [
      { file: 'a.ts', dimensions: {}, overallDrift: 40, driftDirection: 'northward', isDriftingWell: true, isDriftingPoorly: false, isAnchored: false, largestDrift: '', classification: 'drifter' },
      { file: 'b.ts', dimensions: {}, overallDrift: -20, driftDirection: 'westward', isDriftingWell: false, isDriftingPoorly: false, isAnchored: false, largestDrift: '', classification: 'adrift' },
    ]
    expect(computeOverallDrift(files)).toBe(10)
  })
})

// ─── computeDriftVelocity ────────────────────────────────

describe('computeDriftVelocity', () => {
  it('returns 0 for no dimensions', () => {
    expect(computeDriftVelocity([])).toBe(0)
  })

  it('computes average velocity', () => {
    const dims: DriftDimension[] = [
      { dimension: 'complexity', currentScore: 80, trend: 'improving', velocity: 10, direction: 0.6, filesContributing: [], description: '' },
      { dimension: 'type-safety', currentScore: 30, trend: 'degrading', velocity: 20, direction: -0.4, filesContributing: [], description: '' },
    ]
    expect(computeDriftVelocity(dims)).toBe(15)
  })
})

// ─── computeCompassHeading ───────────────────────────────

describe('computeCompassHeading', () => {
  it('returns true-north for high drift and velocity', () => {
    expect(computeCompassHeading(60, 15)).toBe('true-north')
  })

  it('returns northward for positive drift', () => {
    expect(computeCompassHeading(30, 5)).toBe('northward')
  })

  it('returns stable for near-zero drift', () => {
    expect(computeCompassHeading(5, 2)).toBe('stable')
  })

  it('returns eastward for neutral drift with velocity', () => {
    expect(computeCompassHeading(10, 8)).toBe('eastward')
  })

  it('returns southward for negative drift', () => {
    expect(computeCompassHeading(-30, 5)).toBe('southward')
  })

  it('returns westward for very negative drift', () => {
    expect(computeCompassHeading(-60, 5)).toBe('westward')
  })
})

// ─── classifyNavigationGrade ─────────────────────────────

describe('classifyNavigationGrade', () => {
  it('returns on-course for true-north', () => {
    expect(classifyNavigationGrade('true-north', 60)).toBe('on-course')
  })

  it('returns mostly-on-course for northward', () => {
    expect(classifyNavigationGrade('northward', 30)).toBe('mostly-on-course')
  })

  it('returns drifting for eastward with negative drift', () => {
    expect(classifyNavigationGrade('eastward', -10)).toBe('drifting')
  })

  it('returns mostly-on-course for stable with positive drift', () => {
    expect(classifyNavigationGrade('stable', 10)).toBe('mostly-on-course')
  })

  it('returns off-course for southward', () => {
    expect(classifyNavigationGrade('southward', -30)).toBe('off-course')
  })

  it('returns lost-at-sea for westward', () => {
    expect(classifyNavigationGrade('westward', -60)).toBe('lost-at-sea')
  })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for degrading dimensions', () => {
    const dims: DriftDimension[] = [
      { dimension: 'type-safety', currentScore: 30, trend: 'degrading', velocity: 10, direction: -0.4, filesContributing: [], description: '' },
    ]
    const stats = { degradingDimensions: 1, navigationGrade: 'drifting', strongestDegradation: 'type-safety' } as CompassNeedleStats
    const recs = generateRecommendations(dims, [], [], stats)
    expect(recs.some((r) => r.includes('degrading'))).toBe(true)
  })

  it('recommends for sinking files', () => {
    const files: FileDrift[] = [
      { file: 'bad.ts', dimensions: {}, overallDrift: -50, driftDirection: 'southward', isDriftingWell: false, isDriftingPoorly: true, isAnchored: false, largestDrift: '', classification: 'sinking' },
    ]
    const stats = { degradingDimensions: 0, navigationGrade: 'off-course', strongestDegradation: '' } as CompassNeedleStats
    const recs = generateRecommendations([], files, [], stats)
    expect(recs.some((r) => r.includes('sinking'))).toBe(true)
  })

  it('recommends for declining zones', () => {
    const zones = [{ directory: 'src/legacy', health: 'declining' } as any]
    const stats = { degradingDimensions: 0, navigationGrade: 'drifting', strongestDegradation: '' } as CompassNeedleStats
    const recs = generateRecommendations([], [], zones, stats)
    expect(recs.some((r) => r.includes('declining') || r.includes('Stabilize'))).toBe(true)
  })

  it('recommends for lost-at-sea', () => {
    const stats = { degradingDimensions: 0, navigationGrade: 'lost-at-sea', strongestDegradation: '' } as CompassNeedleStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('Critical') || r.includes('standards'))).toBe(true)
  })

  it('recommends for off-course', () => {
    const stats = { degradingDimensions: 0, navigationGrade: 'off-course', strongestDegradation: '' } as CompassNeedleStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('correction') || r.includes('course'))).toBe(true)
  })

  it('returns empty for clean state', () => {
    const stats = { degradingDimensions: 0, navigationGrade: 'on-course', strongestDegradation: '' } as CompassNeedleStats
    expect(generateRecommendations([], [], [], stats)).toEqual([])
  })
})

// ─── buildCompassNeedleResult ────────────────────────────

describe('buildCompassNeedleResult', () => {
  it('returns full result structure', () => {
    const result = buildCompassNeedleResult(['a.ts'], ['const x = 1'], {})
    expect(result.dimensions).toBeDefined()
    expect(result.files).toBeDefined()
    expect(result.zones).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('returns 8 dimensions', () => {
    const result = buildCompassNeedleResult(['a.ts'], ['const x = 1'], {})
    expect(result.dimensions).toHaveLength(8)
  })

  it('handles empty input', () => {
    const result = buildCompassNeedleResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDrift).toBe(0)
  })

  it('creates file drifts for each file', () => {
    const result = buildCompassNeedleResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.files).toHaveLength(2)
  })

  it('computes compass heading', () => {
    const result = buildCompassNeedleResult(['a.ts'], ['export function foo(x: number): string { return String(x) }'], {})
    expect(['true-north', 'northward', 'eastward', 'stable', 'southward', 'westward', 'lost']).toContain(result.stats.compassHeading)
  })

  it('computes navigation grade', () => {
    const result = buildCompassNeedleResult(['a.ts'], ['const x = 1'], {})
    expect(['on-course', 'mostly-on-course', 'drifting', 'off-course', 'lost-at-sea']).toContain(result.stats.navigationGrade)
  })

  it('creates zones from directory paths', () => {
    const result = buildCompassNeedleResult(['src/a.ts', 'src/b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.zones.length).toBeGreaterThan(0)
  })

  it('tracks file classifications', () => {
    const result = buildCompassNeedleResult(['a.ts'], ['const x: number = 1'], {})
    expect(result.stats.beaconFiles + result.stats.sinkingFiles + result.stats.adriftFiles).toBeLessThanOrEqual(result.stats.totalFiles)
  })
})
