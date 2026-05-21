import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifyBeaconCondition, classifyCoastlineCondition,
  classifyKeeperGrade, classifyLensType, classifyBeamColor, classifyBeamPattern,
  measureBeamIntensity, measureFogPenetration,
  assessGuidance, measureVisibility, detectDeadZones,
  analyzeBeaconSignal, analyzeCoastLine,
  generateRecommendations, buildLighthouseBeamResult,
} from '../src/commands/lighthouse-beam-helpers.js'
import { formatLighthouseBeamTable, formatLighthouseBeamJson } from '../src/commands/lighthouse-beam-format-helpers.js'

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

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('lighthouse-beam primitives', () => {
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

describe('lighthouse-beam classifications', () => {
  it('classifyBeaconCondition returns correct conditions', () => {
    expect(classifyBeaconCondition(90)).toBe('brilliant')
    expect(classifyBeaconCondition(75)).toBe('bright')
    expect(classifyBeaconCondition(55)).toBe('adequate')
    expect(classifyBeaconCondition(35)).toBe('dim')
    expect(classifyBeaconCondition(15)).toBe('dark')
    expect(classifyBeaconCondition(5)).toBe('extinguished')
  })

  it('classifyCoastlineCondition returns correct conditions', () => {
    expect(classifyCoastlineCondition(85)).toBe('well-lit-coast')
    expect(classifyCoastlineCondition(65)).toBe('navigable')
    expect(classifyCoastlineCondition(45)).toBe('partial-coverage')
    expect(classifyCoastlineCondition(25)).toBe('dark-stretch')
    expect(classifyCoastlineCondition(12)).toBe('blackout')
    expect(classifyCoastlineCondition(5)).toBe('shipwreck-coast')
  })

  it('classifyKeeperGrade returns correct grades', () => {
    expect(classifyKeeperGrade(85)).toBe('head-keeper')
    expect(classifyKeeperGrade(70)).toBe('lighthouse-keeper')
    expect(classifyKeeperGrade(50)).toBe('watchman')
    expect(classifyKeeperGrade(35)).toBe('sailor')
    expect(classifyKeeperGrade(18)).toBe('castaway')
    expect(classifyKeeperGrade(5)).toBe('lost-at-sea')
  })

  it('classifyLensType returns correct types', () => {
    expect(classifyLensType(75, 65)).toBe('fresnel')
    expect(classifyLensType(60, 55)).toBe('bullseye')
    expect(classifyLensType(45, 40)).toBe('prismatic')
    expect(classifyLensType(30, 25)).toBe('reflective')
    expect(classifyLensType(12, 10)).toBe('simple')
    expect(classifyLensType(5, 5)).toBe('none')
  })

  it('classifyBeamColor returns correct colors', () => {
    expect(classifyBeamColor(85)).toBe('white')
    expect(classifyBeamColor(65)).toBe('green')
    expect(classifyBeamColor(45)).toBe('amber')
    expect(classifyBeamColor(25)).toBe('blue')
    expect(classifyBeamColor(12)).toBe('red')
    expect(classifyBeamColor(3)).toBe('dim')
    expect(classifyBeamColor(0)).toBe('off')
  })

  it('classifyBeamPattern returns correct patterns', () => {
    expect(classifyBeamPattern(6, 4)).toBe('quick-flash')
    expect(classifyBeamPattern(4, 1)).toBe('flashing')
    expect(classifyBeamPattern(2, 2)).toBe('isophase')
    expect(classifyBeamPattern(2, 0)).toBe('occulting')
    expect(classifyBeamPattern(1, 0)).toBe('fixed')
    expect(classifyBeamPattern(0, 1)).toBe('morse')
    expect(classifyBeamPattern(0, 0)).toBe('fixed')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('lighthouse-beam measurements', () => {
  it('measureBeamIntensity returns correct range', () => {
    expect(measureBeamIntensity(emptyCode)).toBe(0)
    expect(measureBeamIntensity(strongCode)).toBeGreaterThan(0)
    expect(measureBeamIntensity(strongCode)).toBeLessThanOrEqual(100)
  })

  it('measureFogPenetration returns correct range', () => {
    expect(measureFogPenetration(emptyCode)).toBe(0)
    expect(measureFogPenetration(strongCode)).toBeGreaterThanOrEqual(0)
    expect(measureFogPenetration(strongCode)).toBeLessThanOrEqual(100)
  })

  it('assessGuidance returns correct structure', () => {
    const g = assessGuidance(strongCode)
    expect(typeof g.hasEntryPoint).toBe('boolean')
    expect(typeof g.hasNavigationAids).toBe('boolean')
    expect(typeof g.hasWarningSignals).toBe('boolean')
    expect(typeof g.hasLandingInstructions).toBe('boolean')
    expect(typeof g.hasKeepOutSignals).toBe('boolean')
    expect(typeof g.navigationAidCount).toBe('number')
    expect(typeof g.warningCount).toBe('number')
    expect(typeof g.exampleCount).toBe('number')
  })

  it('assessGuidance detects entry points', () => {
    expect(assessGuidance(typedCode).hasEntryPoint).toBe(true)
    expect(assessGuidance(noExportCode).hasEntryPoint).toBe(false)
  })

  it('assessGuidance detects navigation aids', () => {
    expect(assessGuidance(strongCode).hasNavigationAids).toBe(true)
  })

  it('measureVisibility returns correct structure', () => {
    const v = measureVisibility(strongCode)
    expect(v.fromShore).toBeGreaterThanOrEqual(0)
    expect(v.fromSea).toBeGreaterThanOrEqual(0)
    expect(v.inDarkness).toBeGreaterThanOrEqual(0)
    expect(v.inStorm).toBeGreaterThanOrEqual(0)
    expect(v.avgVisibility).toBeGreaterThanOrEqual(0)
    expect(v.avgVisibility).toBeLessThanOrEqual(100)
  })

  it('measureVisibility gives higher shore for exported code', () => {
    const v = measureVisibility(typedCode)
    expect(v.fromShore).toBeGreaterThan(v.fromSea)
  })

  it('detectDeadZones returns 0 for empty code', () => {
    expect(detectDeadZones(emptyCode)).toBe(0)
  })

  it('detectDeadZones detects undocumented complex code', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    expect(detectDeadZones(code)).toBeGreaterThan(0)
  })
})

// ─── Beacon Analysis Tests ────────────────────────────────────────────────────

describe('lighthouse-beam beacon analysis', () => {
  it('analyzeBeaconSignal returns correct structure', () => {
    const b = analyzeBeaconSignal(strongCode, 'calc.ts')
    expect(b.file).toBe('calc.ts')
    expect(b.beamIntensity).toBeGreaterThanOrEqual(0)
    expect(b.sweepRange).toBeGreaterThanOrEqual(0)
    expect(b.reachDistance).toBeGreaterThanOrEqual(0)
    expect(b.fresnelQuality).toBeGreaterThanOrEqual(0)
    expect(b.fogPenetration).toBeGreaterThanOrEqual(0)
    expect(b.beaconReliability).toBeGreaterThanOrEqual(0)
    expect(b.qualityScore).toBeGreaterThanOrEqual(0)
    expect(b.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof b.condition).toBe('string')
  })

  it('strong code has higher beam than empty', () => {
    const good = analyzeBeaconSignal(strongCode, 'good.ts')
    const bad = analyzeBeaconSignal(emptyCode, 'bad.ts')
    expect(good.beamIntensity).toBeGreaterThan(bad.beamIntensity)
  })

  it('beam info is correct', () => {
    const b = analyzeBeaconSignal(strongCode, 'a.ts')
    expect(b.beam.isOn).toBe(true)
    expect(typeof b.beam.color).toBe('string')
    expect(typeof b.beam.pattern).toBe('string')
    expect(typeof b.beam.rotationSpeed).toBe('number')
  })

  it('lens info is correct', () => {
    const b = analyzeBeaconSignal(strongCode, 'a.ts')
    expect(typeof b.lens.type).toBe('string')
    expect(b.lens.quality).toBeGreaterThanOrEqual(0)
    expect(b.lens.focusClarity).toBeGreaterThanOrEqual(0)
  })

  it('fog info is correct', () => {
    const b = analyzeBeaconSignal(strongCode, 'a.ts')
    expect(typeof b.fog.hasHorn).toBe('boolean')
    expect(b.fog.hornVolume).toBeGreaterThanOrEqual(0)
    expect(b.fog.fogDensity).toBeGreaterThanOrEqual(0)
  })

  it('keeper info is correct', () => {
    const b = analyzeBeaconSignal(strongCode, 'a.ts')
    expect(typeof b.keeper.isMaintained).toBe('boolean')
    expect(b.keeper.maintenanceQuality).toBeGreaterThanOrEqual(0)
    expect(typeof b.keeper.isAutomated).toBe('boolean')
  })

  it('tower info is correct', () => {
    const b = analyzeBeaconSignal(strongCode, 'a.ts')
    expect(b.tower.height).toBeGreaterThanOrEqual(0)
    expect(typeof b.tower.isStable).toBe('boolean')
    expect(typeof b.tower.hasFoundation).toBe('boolean')
  })
})

// ─── Coastline Tests ──────────────────────────────────────────────────────────

describe('lighthouse-beam coastline analysis', () => {
  it('analyzeCoastLine handles empty beacons', () => {
    const cl = analyzeCoastLine([], 'src')
    expect(cl.directory).toBe('src')
    expect(cl.beacons).toHaveLength(0)
    expect(cl.condition).toBe('well-lit-coast')
  })

  it('analyzeCoastLine computes averages', () => {
    const beacons = [
      analyzeBeaconSignal(strongCode, 'a.ts'),
      analyzeBeaconSignal(typedCode, 'b.ts'),
    ]
    const cl = analyzeCoastLine(beacons, 'src')
    expect(cl.avgBeamIntensity).toBeGreaterThanOrEqual(0)
    expect(cl.avgFogPenetration).toBeGreaterThanOrEqual(0)
    expect(cl.coastlineSafety).toBeGreaterThanOrEqual(0)
    expect(typeof cl.condition).toBe('string')
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('lighthouse-beam build result', () => {
  it('buildLighthouseBeamResult returns correct structure', () => {
    const result = buildLighthouseBeamResult(['a.ts'], [typedCode], {})
    expect(result.beacons).toHaveLength(1)
    expect(result.coastlines).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.keeperGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.coastguard.overallVisibility).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildLighthouseBeamResult([], [], {})
    expect(result.beacons).toHaveLength(0)
    expect(result.stats.brightestBeacon).toBe('none')
    expect(result.stats.darkestBeacon).toBe('none')
    expect(result.stats.bestPenetration).toBe('none')
    expect(result.stats.mostReliable).toBe('none')
  })

  it('groups beacons into coastlines by directory', () => {
    const result = buildLighthouseBeamResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.coastlines).toHaveLength(2)
  })

  it('identifies brightest and darkest beacons', () => {
    const result = buildLighthouseBeamResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.brightestBeacon).toBe('good.ts')
    expect(result.stats.darkestBeacon).toBe('bad.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildLighthouseBeamResult(['a.ts'], [], {})
    expect(result.beacons).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildLighthouseBeamResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgSweepRange).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgReachDistance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFresnelQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasEntryPoint).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasNavigationAids).toBeGreaterThanOrEqual(0)
    expect(result.stats.navigableInFog).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('lighthouse-beam recommendations', () => {
  it('returns array', () => {
    const result = buildLighthouseBeamResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('includes good visibility message', () => {
    const result = buildLighthouseBeamResult(['a.ts'], [strongCode], {})
    if (result.stats.overallVisibility >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Good visibility')]),
      )
    }
  })

  it('warns about coverage gaps', () => {
    const result = buildLighthouseBeamResult(['a.ts'], [noExportCode], {})
    if (result.stats.totalCoverageGaps > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Coverage gaps')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('lighthouse-beam formatters', () => {
  const sampleResult = buildLighthouseBeamResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatLighthouseBeamTable returns string with header', () => {
    const table = formatLighthouseBeamTable(sampleResult, false)
    expect(table).toContain('Lighthouse Beam')
    expect(table).toContain('Beacons')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatLighthouseBeamTable verbose shows detail', () => {
    const table = formatLighthouseBeamTable(sampleResult, true)
    expect(table).toContain('lens:')
    expect(table).toContain('visibility:')
  })

  it('formatLighthouseBeamTable handles empty', () => {
    const empty = buildLighthouseBeamResult([], [], {})
    const table = formatLighthouseBeamTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatLighthouseBeamTable truncates beacons at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildLighthouseBeamResult(files, contents, {})
    const table = formatLighthouseBeamTable(big, false)
    expect(table).toContain('more')
  })

  it('formatLighthouseBeamJson returns valid JSON', () => {
    const json = formatLighthouseBeamJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.beacons).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.coastguard).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('lighthouse-beam edge cases', () => {
  it('handles deeply nested code', () => {
    const b = analyzeBeaconSignal(deepCode, 'deep.ts')
    expect(b.visibility.inStorm).toBeGreaterThanOrEqual(0)
    expect(b.beam.deadZoneCount).toBeGreaterThanOrEqual(0)
  })

  it('handles code with only comments', () => {
    const b = analyzeBeaconSignal('// just a comment\n/* block */', 'comment.ts')
    expect(b.beam.isOn).toBe(true)
    expect(b.fog.hasHorn).toBe(true)
  })

  it('handles single file with no directory', () => {
    const result = buildLighthouseBeamResult(['single.ts'], [typedCode], {})
    expect(result.coastlines).toHaveLength(1)
    expect(result.coastlines[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildLighthouseBeamResult(files, contents, {})
    expect(result.coastlines).toHaveLength(1)
    expect(result.coastlines[0].beacons).toHaveLength(3)
  })

  it('empty code beacon is extinguished', () => {
    const b = analyzeBeaconSignal(emptyCode, 'empty.ts')
    expect(b.condition).toBe('extinguished')
    expect(b.beam.color).toBe('off')
    expect(b.lens.type).toBe('none')
  })
})
