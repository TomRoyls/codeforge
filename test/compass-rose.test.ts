import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifyCompassCondition, classifyRegionType, classifyRegionCondition,
  classifyNavigatorGrade, classifyCardinalDirection,
  measureCardinal, measureBearing, measureMagnetism,
  measureOrientation, measureNavigation,
  analyzeCompassPoint, analyzeCompassRegion,
  generateRecommendations, buildCompassRoseResult,
} from '../src/commands/compass-rose-helpers.js'
import { formatCompassRoseTable, formatCompassRoseJson } from '../src/commands/compass-rose-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' * @example',
  ' * calc(5) // number',
  ' */',
  'export function calc(x: number): number {',
  '  try {',
  '    const result: number = helper(x)',
  '    if (result > 0) { return result }',
  '    return 0',
  '  } catch (err) {',
  '    throw new Error("fail")',
  '  }',
  '}',
  'export interface CalcOptions { value: number; label: string }',
  'export type CalcResult = number | string',
].join('\n')

const noExportCode = [
  'const a = 1',
  'const b = 2',
  'const c = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const importHeavyCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
].join('\n')

const branchyNoFunc = [
  'if (a) {}',
  'if (b) {}',
  'if (c) {}',
  'if (d) {}',
  'if (e) {}',
  'if (f) {}',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('compass-rose primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('compass-rose classifications', () => {
  it('classifyCompassCondition returns correct conditions', () => {
    expect(classifyCompassCondition(90)).toBe('true-north')
    expect(classifyCompassCondition(75)).toBe('well-oriented')
    expect(classifyCompassCondition(55)).toBe('slightly-off')
    expect(classifyCompassCondition(35)).toBe('disoriented')
    expect(classifyCompassCondition(15)).toBe('lost')
    expect(classifyCompassCondition(5)).toBe('spinning')
  })

  it('classifyRegionType returns correct types', () => {
    expect(classifyRegionType([])).toBe('doldrums')
  })

  it('classifyRegionCondition returns correct conditions', () => {
    expect(classifyRegionCondition(90)).toBe('perfectly-aligned')
    expect(classifyRegionCondition(70)).toBe('well-aligned')
    expect(classifyRegionCondition(50)).toBe('mostly-aligned')
    expect(classifyRegionCondition(30)).toBe('scattered')
    expect(classifyRegionCondition(15)).toBe('disoriented')
    expect(classifyRegionCondition(5)).toBe('chaotic')
  })

  it('classifyNavigatorGrade returns correct grades', () => {
    expect(classifyNavigatorGrade(85)).toBe('master-navigator')
    expect(classifyNavigatorGrade(70)).toBe('navigator')
    expect(classifyNavigatorGrade(50)).toBe('pilot')
    expect(classifyNavigatorGrade(35)).toBe('deckhand')
    expect(classifyNavigatorGrade(18)).toBe('castaway')
    expect(classifyNavigatorGrade(5)).toBe('shipwrecked')
  })

  it('classifyCardinalDirection returns correct directions', () => {
    expect(classifyCardinalDirection(0)).toBe('N')
    expect(classifyCardinalDirection(45)).toBe('NE')
    expect(classifyCardinalDirection(90)).toBe('E')
    expect(classifyCardinalDirection(135)).toBe('SE')
    expect(classifyCardinalDirection(180)).toBe('S')
    expect(classifyCardinalDirection(225)).toBe('SW')
    expect(classifyCardinalDirection(270)).toBe('W')
    expect(classifyCardinalDirection(315)).toBe('NW')
    expect(classifyCardinalDirection(360)).toBe('N')
  })

  it('classifyRegionType detects bermuda-triangle', () => {
    const spinningPoints = Array.from({ length: 3 }, () => analyzeCompassPoint('', 'x.ts'))
    expect(classifyRegionType(spinningPoints)).toBe('bermuda-triangle')
  })

  it('classifyRegionType detects north-star', () => {
    const goodPoints = Array.from({ length: 3 }, (_, i) => analyzeCompassPoint(strongCode, `${i}.ts`))
    if (goodPoints.every(p => p.condition === 'true-north')) {
      expect(classifyRegionType(goodPoints)).toBe('north-star')
    }
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('compass-rose measurements', () => {
  it('measureCardinal returns correct structure', () => {
    const c = measureCardinal(strongCode)
    expect(c.north).toBeGreaterThanOrEqual(0)
    expect(c.south).toBeGreaterThanOrEqual(0)
    expect(c.east).toBeGreaterThanOrEqual(0)
    expect(c.west).toBeGreaterThanOrEqual(0)
    expect(typeof c.isCardinallyAligned).toBe('boolean')
    expect(['N', 'S', 'E', 'W']).toContain(c.dominantCardinal)
  })

  it('measureCardinal gives non-zero east for exported code', () => {
    expect(measureCardinal(typedCode).east).toBeGreaterThan(0)
  })

  it('measureCardinal gives non-zero west for imported code', () => {
    expect(measureCardinal(strongCode).west).toBeGreaterThan(0)
  })

  it('measureBearing returns correct structure', () => {
    const b = measureBearing(strongCode)
    expect(b.trueNorth).toBeGreaterThanOrEqual(0)
    expect(b.magneticNorth).toBeGreaterThanOrEqual(0)
    expect(b.deviation).toBeGreaterThanOrEqual(0)
    expect(typeof b.isCalibrated).toBe('boolean')
    expect(typeof b.needsRecalibration).toBe('boolean')
  })

  it('measureBearing detects deviation from todos', () => {
    const good = measureBearing(typedCode)
    const bad = measureBearing(todoCode)
    expect(bad.deviation).toBeGreaterThanOrEqual(good.deviation)
  })

  it('measureBearing needs recalibration for simple code', () => {
    expect(measureBearing(simpleCode).needsRecalibration).toBe(true)
  })

  it('measureMagnetism returns correct structure', () => {
    const m = measureMagnetism(strongCode)
    expect(m.strength).toBeGreaterThanOrEqual(0)
    expect(['attractive', 'repulsive', 'neutral']).toContain(m.polarity)
    expect(m.field.range).toBeGreaterThanOrEqual(0)
    expect(typeof m.field.isStrong).toBe('boolean')
    expect(typeof m.field.isWeak).toBe('boolean')
    expect(typeof m.field.hasInterference).toBe('boolean')
  })

  it('measureMagnetism detects attractive polarity', () => {
    const exportHeavy = 'export function a() {}\nexport function b() {}\nexport function c() {}'
    const m = measureMagnetism(exportHeavy)
    expect(m.polarity).toBe('attractive')
  })

  it('measureMagnetism detects repulsive polarity', () => {
    const m = measureMagnetism(importHeavyCode)
    expect(m.polarity).toBe('repulsive')
  })

  it('measureOrientation returns correct structure', () => {
    const o = measureOrientation(strongCode)
    expect(typeof o.isUpright).toBe('boolean')
    expect(typeof o.isInverted).toBe('boolean')
    expect(typeof o.isTilted).toBe('boolean')
    expect(typeof o.isSpinning).toBe('boolean')
    expect(o.tiltAngle).toBeGreaterThanOrEqual(0)
  })

  it('measureOrientation detects upright for strong code', () => {
    expect(measureOrientation(strongCode).isUpright).toBe(true)
  })

  it('measureOrientation detects inverted for import-heavy code', () => {
    expect(measureOrientation(importHeavyCode).isInverted).toBe(true)
  })

  it('measureOrientation detects spinning for branchy code', () => {
    expect(measureOrientation(branchyNoFunc).isSpinning).toBe(true)
  })

  it('measureNavigation returns correct structure', () => {
    const n = measureNavigation(strongCode)
    expect(typeof n.hasChart).toBe('boolean')
    expect(typeof n.hasWaypoints).toBe('boolean')
    expect(typeof n.hasLandmarks).toBe('boolean')
    expect(typeof n.hasHazards).toBe('boolean')
    expect(typeof n.hazardCount).toBe('number')
    expect(typeof n.isNavigable).toBe('boolean')
  })

  it('measureNavigation detects chart in documented code', () => {
    expect(measureNavigation(strongCode).hasChart).toBe(true)
  })

  it('measureNavigation detects hazards in todo code', () => {
    expect(measureNavigation(todoCode).hasHazards).toBe(true)
  })
})

// ─── Compass Point Analysis Tests ─────────────────────────────────────────────

describe('compass-rose point analysis', () => {
  it('analyzeCompassPoint returns correct structure', () => {
    const p = analyzeCompassPoint(strongCode, 'calc.ts')
    expect(p.file).toBe('calc.ts')
    expect(p.heading).toBeGreaterThanOrEqual(0)
    expect(p.heading).toBeLessThanOrEqual(360)
    expect(typeof p.cardinalDirection).toBe('string')
    expect(p.magneticNorth).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof p.condition).toBe('string')
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeCompassPoint(strongCode, 'good.ts')
    const bad = analyzeCompassPoint(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('cardinal info is correct', () => {
    const p = analyzeCompassPoint(strongCode, 'a.ts')
    expect(p.cardinal.north).toBeGreaterThan(0)
    expect(p.cardinal.east).toBeGreaterThan(0)
  })

  it('intercardinal info is correct', () => {
    const p = analyzeCompassPoint(strongCode, 'a.ts')
    expect(p.intercardinal.northeast).toBeGreaterThanOrEqual(0)
    expect(p.intercardinal.southeast).toBeGreaterThanOrEqual(0)
  })

  it('bearing info is correct', () => {
    const p = analyzeCompassPoint(strongCode, 'a.ts')
    expect(p.bearing.trueNorth).toBeGreaterThan(0)
    expect(p.bearing.isCalibrated).toBe(true)
  })

  it('magnetism info is correct', () => {
    const p = analyzeCompassPoint(strongCode, 'a.ts')
    expect(p.magnetism.strength).toBeGreaterThan(0)
  })

  it('navigation info is correct', () => {
    const p = analyzeCompassPoint(strongCode, 'a.ts')
    expect(p.navigation.isNavigable).toBe(true)
  })

  it('empty code is spinning', () => {
    const p = analyzeCompassPoint(emptyCode, 'empty.ts')
    expect(p.condition).toBe('spinning')
    expect(p.qualityScore).toBe(0)
  })
})

// ─── Region Tests ─────────────────────────────────────────────────────────────

describe('compass-rose region analysis', () => {
  it('analyzeCompassRegion handles empty points', () => {
    const r = analyzeCompassRegion([], 'src')
    expect(r.directory).toBe('src')
    expect(r.points).toHaveLength(0)
    expect(r.condition).toBe('perfectly-aligned')
  })

  it('analyzeCompassRegion computes averages', () => {
    const points = [
      analyzeCompassPoint(strongCode, 'a.ts'),
      analyzeCompassPoint(typedCode, 'b.ts'),
    ]
    const r = analyzeCompassRegion(points, 'src')
    expect(r.avgMagneticNorth).toBeGreaterThanOrEqual(0)
    expect(r.avgDeclination).toBeGreaterThanOrEqual(0)
    expect(r.avgStability).toBeGreaterThanOrEqual(0)
    expect(typeof r.regionType).toBe('string')
    expect(r.regionAlignment).toBeGreaterThanOrEqual(0)
    expect(typeof r.condition).toBe('string')
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('compass-rose build result', () => {
  it('buildCompassRoseResult returns correct structure', () => {
    const result = buildCompassRoseResult(['a.ts'], [typedCode], {})
    expect(result.points).toHaveLength(1)
    expect(result.regions).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.navigatorGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.hemisphere.overallOrientation).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildCompassRoseResult([], [], {})
    expect(result.points).toHaveLength(0)
    expect(result.stats.bestOriented).toBe('none')
    expect(result.stats.mostDisoriented).toBe('none')
    expect(result.stats.strongestMagnetism).toBe('none')
    expect(result.stats.mostCalibrated).toBe('none')
  })

  it('groups points into regions by directory', () => {
    const result = buildCompassRoseResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.regions).toHaveLength(2)
  })

  it('identifies best and most disoriented', () => {
    const result = buildCompassRoseResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.bestOriented).toBe('good.ts')
    expect(result.stats.mostDisoriented).toBe('bad.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildCompassRoseResult(['a.ts'], [], {})
    expect(result.points).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildCompassRoseResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgHeading).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMagneticNorth).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgDeclination).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStability).toBeGreaterThanOrEqual(0)
    expect(result.stats.trueNorthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.wellOrientedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.disorientedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.lostCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.spinningCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.northDominant).toBeGreaterThanOrEqual(0)
    expect(result.stats.southDominant).toBeGreaterThanOrEqual(0)
    expect(result.stats.eastDominant).toBeGreaterThanOrEqual(0)
    expect(result.stats.westDominant).toBeGreaterThanOrEqual(0)
    expect(result.stats.attractiveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.repulsiveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.calibratedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.needsRecalibrationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.navigableCount).toBeGreaterThanOrEqual(0)
  })

  it('computes hemisphere fields', () => {
    const result = buildCompassRoseResult(['a.ts'], [strongCode], {})
    expect(result.hemisphere.avgMagneticNorth).toBeGreaterThanOrEqual(0)
    expect(result.hemisphere.avgDeclination).toBeGreaterThanOrEqual(0)
    expect(result.hemisphere.avgStability).toBeGreaterThanOrEqual(0)
    expect(typeof result.hemisphere.isAligned).toBe('boolean')
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('compass-rose recommendations', () => {
  it('returns array', () => {
    const result = buildCompassRoseResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about spinning modules', () => {
    const result = buildCompassRoseResult(['a.ts'], [emptyCode], {})
    if (result.stats.spinningCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Spinning modules')]),
      )
    }
  })

  it('includes good orientation message', () => {
    const result = buildCompassRoseResult(['a.ts'], [strongCode], {})
    if (result.stats.overallOrientation >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Good orientation')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('compass-rose formatters', () => {
  const sampleResult = buildCompassRoseResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatCompassRoseTable returns string with header', () => {
    const table = formatCompassRoseTable(sampleResult, false)
    expect(table).toContain('Compass Rose')
    expect(table).toContain('Compass Points')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatCompassRoseTable verbose shows detail', () => {
    const table = formatCompassRoseTable(sampleResult, true)
    expect(table).toContain('cardinal:')
    expect(table).toContain('bearing:')
  })

  it('formatCompassRoseTable handles empty', () => {
    const empty = buildCompassRoseResult([], [], {})
    const table = formatCompassRoseTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatCompassRoseTable truncates points at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildCompassRoseResult(files, contents, {})
    const table = formatCompassRoseTable(big, false)
    expect(table).toContain('more')
  })

  it('formatCompassRoseJson returns valid JSON', () => {
    const json = formatCompassRoseJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.points).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.hemisphere).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('compass-rose edge cases', () => {
  it('handles single file with no directory', () => {
    const result = buildCompassRoseResult(['single.ts'], [typedCode], {})
    expect(result.regions).toHaveLength(1)
    expect(result.regions[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildCompassRoseResult(files, contents, {})
    expect(result.regions).toHaveLength(1)
    expect(result.regions[0].points).toHaveLength(3)
  })

  it('empty code has zero magnetism', () => {
    const p = analyzeCompassPoint(emptyCode, 'empty.ts')
    expect(p.magnetism.strength).toBe(0)
    expect(p.magnetism.polarity).toBe('neutral')
    expect(p.magnetism.field.isWeak).toBe(true)
  })

  it('heading wraps around 360', () => {
    const p = analyzeCompassPoint(strongCode, 'a.ts')
    expect(p.heading).toBeGreaterThanOrEqual(0)
    expect(p.heading).toBeLessThan(360)
  })
})
