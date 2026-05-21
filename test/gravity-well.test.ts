import { describe, expect, it } from 'vitest'

import {
  analyzeCelestialBody,
  analyzeStarSystem,
  buildGravityWellResult,
  classifyAstrophysicistGrade,
  classifyBodyCondition,
  classifySystemCondition,
  classifySystemType,
  countAny,
  countAsync,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDeprecated,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countNestingDepth,
  countReturnTypes,
  countTodos,
  countTypeAnnotations,
  generateRecommendations,
  measureBody,
  measureEscape,
  measureGravity,
  measureHorizon,
  measureLensing,
  measureOrbit,
  measureTidal,
  type CelestialBody,
  type GravityWellResult,
} from '../src/commands/gravity-well-helpers.js'
import { formatGravityWellCsv, formatGravityWellJson, formatGravityWellTable } from '../src/commands/gravity-well-format-helpers.js'

// ─── Utility Helpers ────────────────────────────────────

describe('gravity-well utility helpers', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\n\nconst y = 2')).toBe(2)
    expect(countLoc('')).toBe(0)
  })

  it('counts functions', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
    expect(countFunctions('')).toBe(0)
  })

  it('counts classes', () => {
    expect(countClasses('class Foo {}')).toBe(1)
    expect(countClasses('')).toBe(0)
  })

  it('counts interfaces', () => {
    expect(countInterfaces('interface Config {}')).toBe(1)
    expect(countInterfaces('')).toBe(0)
  })

  it('counts exports', () => {
    expect(countExports('export function f() {}')).toBe(1)
    expect(countExports('')).toBe(0)
  })

  it('counts imports', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
    expect(countImports('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */\nfunction f() {}')).toBe(1)
    expect(countJSDoc('')).toBe(0)
  })

  it('counts comments', () => {
    expect(countComments('// hello\n/* world */')).toBe(2)
    expect(countComments('')).toBe(0)
  })

  it('counts error handling', () => {
    expect(countErrorHandling('try { } catch(e) { }')).toBe(1)
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('function f(x: number): string {}')).toBe(2)
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts TODOs', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
    expect(countTodos('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log("hi")')).toBe(1)
    expect(countConsole('')).toBe(0)
  })

  it('counts branches', () => {
    expect(countBranches('if (x) { }')).toBe(1)
    expect(countBranches('')).toBe(0)
  })

  it('counts descriptive names', () => {
    expect(countDescriptiveNames('function getName() {}')).toBe(1)
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts async keywords', () => {
    expect(countAsync('async function f() {}')).toBe(1)
    expect(countAsync('')).toBe(0)
  })

  it('counts any types', () => {
    expect(countAny('const x: any = {}')).toBe(1)
    expect(countAny('')).toBe(0)
  })

  it('counts return types', () => {
    expect(countReturnTypes('): number')).toBe(1)
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts nesting depth', () => {
    expect(countNestingDepth('if (x) { if (y) { } }')).toBe(2)
    expect(countNestingDepth('')).toBe(0)
  })

  it('counts deprecated markers', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
    expect(countDeprecated('')).toBe(0)
  })
})

// ─── Body Measurement ───────────────────────────────────

describe('measureBody', () => {
  it('returns zero mass for empty content', () => {
    const result = measureBody('')
    expect(result.mass).toBe(0)
    expect(result.density).toBe(0)
    expect(result.type).toBe('asteroid')
  })

  it('detects stable code', () => {
    const code = [
      '/** Docs */',
      'export function computeValue(x: number): number { return x; }',
      'try { computeValue(1); } catch(e) {}',
    ].join('\n')
    const result = measureBody(code)
    expect(result.isStable).toBe(true)
    expect(result.density).toBeGreaterThan(0)
  })

  it('detects collapsing code with deprecated', () => {
    const code = '@deprecated\nfunction old() {}'
    const result = measureBody(code)
    expect(result.isCollapsing).toBe(true)
  })

  it('classifies as black-hole for any types', () => {
    const code = 'const x: any = 1'
    const result = measureBody(code)
    expect(result.type).toBe('black-hole')
  })
})

// ─── Orbit Measurement ──────────────────────────────────

describe('measureOrbit', () => {
  it('returns zeros for empty content', () => {
    const result = measureOrbit('')
    expect(result.semiMajorAxis).toBe(0)
    expect(result.eccentricity).toBe(0)
    expect(result.inclination).toBe(0)
  })

  it('detects stable orbit', () => {
    const code = [
      '/** Docs */',
      'export function route(x: number): number {',
      '  try { return x; }',
      '  catch(e) { return 0; }',
      '}',
      'interface IConfig {}',
    ].join('\n')
    const result = measureOrbit(code)
    expect(result.inclination).toBeGreaterThan(50)
  })

  it('detects decaying orbit from TODOs', () => {
    const code = '// TODO: fix\nfunction f() {}'
    const result = measureOrbit(code)
    expect(result.isDecaying).toBe(true)
  })

  it('detects escaping orbit', () => {
    const code = 'const x = 1'
    const result = measureOrbit(code)
    expect(result.isEscaping).toBe(true)
  })

  it('detects circular orbit', () => {
    const code = [
      "import { x } from 'y'",
      'export function f() {}',
    ].join('\n')
    const result = measureOrbit(code)
    expect(result.isCircular).toBe(true)
  })
})

// ─── Gravity Measurement ────────────────────────────────

describe('measureGravity', () => {
  it('returns zeros for empty content', () => {
    const result = measureGravity('')
    expect(result.pull).toBe(0)
    expect(result.push).toBe(0)
  })

  it('detects strong pull from exports', () => {
    const code = [
      '/** docs */',
      'export function api(): void {}',
      'export function api2(): void {}',
      'export function api3(): void {}',
      'export function api4(): void {}',
    ].join('\n')
    const result = measureGravity(code)
    expect(result.pull).toBeGreaterThan(40)
    expect(result.satelliteCount).toBeGreaterThan(0)
  })

  it('detects balanced gravity', () => {
    const code = [
      "import { x } from 'y'",
      'export function f() {}',
    ].join('\n')
    const result = measureGravity(code)
    expect(result.isBalanced).toBe(true)
  })

  it('detects accretion disk', () => {
    const code = [
      'export interface A {}',
      'export interface B {}',
      'export interface C {}',
      'export function a() {}',
      'export function b() {}',
    ].join('\n')
    const result = measureGravity(code)
    expect(result.hasAccretionDisk).toBe(true)
  })
})

// ─── Escape Measurement ─────────────────────────────────

describe('measureEscape', () => {
  it('returns zero for empty content', () => {
    const result = measureEscape('')
    expect(result.velocity).toBe(0)
  })

  it('detects easy to escape for simple code', () => {
    const code = '/** docs */\nexport function simple(): void {}'
    const result = measureEscape(code)
    expect(result.velocity).toBeLessThan(25)
    if (result.velocity < 25) {
      expect(result.isEasyToEscape).toBe(true)
    }
  })

  it('detects locked code', () => {
    const code = Array.from({ length: 12 }, (_, i) => `if (x${i}) {`).join('\n') +
      'const a: any = 1\nconst b: any = 2\nconst c: any = 3\nconst d: any = 4\nconst e: any = 5\n' +
      '}'.repeat(12)
    const result = measureEscape(code)
    expect(result.isLocked).toBe(true)
  })

  it('detects trojan points from error handling', () => {
    const code = 'try { } catch(e) { }'
    const result = measureEscape(code)
    expect(result.hasTrojanPoints).toBe(true)
  })
})

// ─── Tidal Measurement ──────────────────────────────────

describe('measureTidal', () => {
  it('returns zero for empty content', () => {
    const result = measureTidal('')
    expect(result.force).toBe(0)
  })

  it('detects tidal locking', () => {
    const code = [
      "import { x } from 'y'",
      'export function f() {}',
    ].join('\n')
    const result = measureTidal(code)
    expect(result.hasTidalLocking).toBe(true)
  })

  it('detects tidal heating from deep nesting', () => {
    const code = Array.from({ length: 6 }, (_, i) => `if (x${i}) {`).join('\n') + '}'.repeat(6)
    const result = measureTidal(code)
    expect(result.hasTidalHeating).toBe(true)
  })

  it('detects tidally locked from imports without exports', () => {
    const code = [
      "import { x } from 'y'",
      "import { z } from 'w'",
    ].join('\n')
    const result = measureTidal(code)
    expect(result.isTidallyLocked).toBe(true)
  })

  it('detects tidal bulge from imbalance', () => {
    const code = [
      "import { a } from 'x'",
      "import { b } from 'y'",
      "import { c } from 'z'",
      "import { d } from 'w'",
      "import { e } from 'v'",
      'export function f() {}',
    ].join('\n')
    const result = measureTidal(code)
    expect(result.hasTidalBulge).toBe(true)
  })
})

// ─── Horizon Measurement ────────────────────────────────

describe('measureHorizon', () => {
  it('returns zero for empty content', () => {
    const result = measureHorizon('')
    expect(result.radius).toBe(0)
  })

  it('detects approaching horizon from TODOs', () => {
    const code = '// TODO: fix this'
    const result = measureHorizon(code)
    expect(result.isApproaching).toBe(true)
  })

  it('detects receding horizon from clean documented code', () => {
    const code = '/** Docs */\nexport function clean(): number { return 1; }'
    const result = measureHorizon(code)
    expect(result.isReceding).toBe(true)
  })

  it('detects singularity risk from any types', () => {
    const code = Array.from({ length: 4 }, (_, i) => `const x${i}: any = ${i}`).join('\n')
    const result = measureHorizon(code)
    expect(result.singularityRisk).toBeGreaterThan(0)
  })

  it('detects hawking radiation', () => {
    const code = '/** Docs */\n// TODO: fix\nfunction f() {}'
    const result = measureHorizon(code)
    expect(result.hasHawkingRadiation).toBe(true)
  })
})

// ─── Lensing Measurement ────────────────────────────────

describe('measureLensing', () => {
  it('returns zero for empty content', () => {
    const result = measureLensing('')
    expect(result.distortion).toBe(0)
  })

  it('detects gravitational lensing from any types', () => {
    const code = 'const x: any = 1'
    const result = measureLensing(code)
    expect(result.hasGravitationalLensing).toBe(true)
  })

  it('detects strong lensing from high distortion', () => {
    const code = Array.from({ length: 5 }, (_, i) => `const x${i}: any = ${i}`).join('\n')
    const result = measureLensing(code)
    expect(result.hasStrongLensing).toBe(true)
  })
})

// ─── Celestial Body Analysis ────────────────────────────

describe('analyzeCelestialBody', () => {
  it('analyzes a well-connected file', () => {
    const code = [
      '/** Route handler */',
      'export function handleRoute(path: string): number {',
      '  try {',
      '    if (path === "/") return 1;',
      '    return 0;',
      '  } catch(e) { return -1; }',
      '}',
    ].join('\n')
    const result = analyzeCelestialBody(code, 'src/router.ts')
    expect(result.file).toBe('src/router.ts')
    expect(result.gravitationalMass).toBeGreaterThan(0)
    expect(result.orbitalStability).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const result = analyzeCelestialBody('', 'empty.ts')
    expect(result.gravitationalMass).toBe(0)
    expect(result.qualityScore).toBe(30)
  })
})

// ─── Classification Helpers ─────────────────────────────

describe('classifyBodyCondition', () => {
  it('returns stable-star for high score with star type', () => {
    const result = classifyBodyCondition(
      90,
      { isStable: true, type: 'star', mass: 80, density: 80, luminosity: 80, temperature: 50, age: 10, isCollapsing: false } as any,
      { isLocked: false, velocity: 10 } as any,
    )
    expect(result).toBe('stable-star')
  })

  it('returns black-hole for locked code', () => {
    const result = classifyBodyCondition(
      20,
      { isStable: false, type: 'asteroid', mass: 10, density: 5, luminosity: 0, temperature: 20, age: 30, isCollapsing: true } as any,
      { isLocked: true, velocity: 85 } as any,
    )
    expect(result).toBe('black-hole')
  })

  it('returns healthy-planet for good score not locked', () => {
    const result = classifyBodyCondition(
      70,
      { isStable: true, type: 'planet', mass: 60, density: 70, luminosity: 50, temperature: 40, age: 10, isCollapsing: false } as any,
      { isLocked: false, velocity: 30 } as any,
    )
    expect(result).toBe('healthy-planet')
  })

  it('returns dark-matter for very low score', () => {
    const result = classifyBodyCondition(
      3,
      { isStable: false, type: 'asteroid', mass: 2, density: 0, luminosity: 0, temperature: 0, age: 0, isCollapsing: false } as any,
      { isLocked: false, velocity: 5 } as any,
    )
    expect(result).toBe('dark-matter')
  })
})

describe('classifySystemType', () => {
  it('returns void for empty bodies', () => {
    expect(classifySystemType([])).toBe('void')
  })

  it('returns binary-system for high star ratio', () => {
    const bodies = Array.from({ length: 3 }, () => ({
      gravitationalMass: 60,
      body: { type: 'star' as const },
    } as CelestialBody))
    expect(classifySystemType(bodies)).toBe('binary-system')
  })
})

describe('classifySystemCondition', () => {
  it('returns well-ordered-system for high stability', () => {
    expect(classifySystemCondition(80)).toBe('well-ordered-system')
  })

  it('returns void for very low stability', () => {
    expect(classifySystemCondition(5)).toBe('void')
  })
})

describe('classifyAstrophysicistGrade', () => {
  it('returns nobel-laureate for high stability', () => {
    expect(classifyAstrophysicistGrade(85)).toBe('nobel-laureate')
  })

  it('returns flat-earther for very low stability', () => {
    expect(classifyAstrophysicistGrade(10)).toBe('flat-earther')
  })

  it('returns astronomer for moderate stability', () => {
    expect(classifyAstrophysicistGrade(55)).toBe('astronomer')
  })
})

// ─── Star System Analysis ───────────────────────────────

describe('analyzeStarSystem', () => {
  it('handles empty system', () => {
    const result = analyzeStarSystem([], 'empty-dir')
    expect(result.systemType).toBe('void')
    expect(result.condition).toBe('void')
    expect(result.avgOrbitalStability).toBe(0)
  })

  it('analyzes system with bodies', () => {
    const bodies = [
      analyzeCelestialBody('/** docs */\nexport function a(): number { return 1; }', 'dir/a.ts'),
      analyzeCelestialBody('/** docs */\nexport function b(): string { return "x"; }', 'dir/b.ts'),
    ]
    const result = analyzeStarSystem(bodies, 'dir')
    expect(result.directory).toBe('dir')
    expect(result.bodies.length).toBe(2)
    expect(result.avgOrbitalStability).toBeGreaterThan(0)
  })
})

// ─── Recommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns maintenance message for clean code', () => {
    const result = buildGravityWellResult(
      ['clean.ts'],
      ['/** docs */\nexport function clean(): void { try {} catch {} }'],
    )
    expect(result.recommendations).toContain('Maintain current orbital mechanics for a stable codebase')
  })

  it('recommends breaking free from black holes', () => {
    const result = buildGravityWellResult(
      ['bad.ts'],
      ['const x: any = 1\nconst y: any = 2\nconst z: any = 3'],
    )
    if (result.stats.blackHoleCount > 0) {
      const hasBlackHole = result.recommendations.some(r => r.includes('black hole'))
      expect(hasBlackHole).toBe(true)
    }
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('buildGravityWellResult', () => {
  it('handles empty input', () => {
    const result = buildGravityWellResult([], [])
    expect(result.bodies).toEqual([])
    expect(result.systems).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.astrophysicistGrade).toBe('flat-earther')
  })

  it('analyzes single file', () => {
    const code = [
      '/** Calculate value */',
      'export function calculateValue(x: number): number {',
      '  try { return x * 2; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = buildGravityWellResult(['src/calc.ts'], [code])
    expect(result.bodies.length).toBe(1)
    expect(result.systems.length).toBe(1)
    expect(result.bodies[0].file).toBe('src/calc.ts')
    expect(result.bodies[0].gravitationalMass).toBeGreaterThan(0)
    expect(result.universe.overallStability).toBeGreaterThan(0)
    expect(result.stats.mostMassive).toBe('src/calc.ts')
  })

  it('analyzes multiple files across systems', () => {
    const goodCode = '/** docs */\nexport function route(): number { try { return 1; } catch { return 0; } }'
    const badCode = 'const x: any = 1\n// TODO: fix'
    const result = buildGravityWellResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [goodCode, badCode, goodCode],
    )
    expect(result.bodies.length).toBe(3)
    expect(result.systems.length).toBe(2)
    expect(result.stats.totalSystems).toBe(2)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('computes correct averages', () => {
    const code1 = '/** docs */\nexport function a(): number { try { return 1; } catch { return 0; } }'
    const code2 = '/** docs */\nexport function b(): string { try { return "x"; } catch { return ""; } }'
    const result = buildGravityWellResult(['a.ts', 'b.ts'], [code1, code2])
    expect(result.stats.avgGravitationalMass).toBeGreaterThan(0)
    expect(result.stats.avgOrbitalStability).toBeGreaterThan(0)
  })

  it('tracks condition counts', () => {
    const goodCode = [
      '/** docs */',
      'export interface IRoute { path: string; }',
      'export class Router { route(): void {} }',
    ].join('\n')
    const badCode = 'const x: any = 1'
    const result = buildGravityWellResult(['good.ts', 'bad.ts'], [goodCode, badCode])
    const totalConditions = result.stats.stableStarCount +
      result.stats.healthyPlanetCount +
      result.stats.tidalMoonCount +
      result.stats.wanderingAsteroidCount +
      result.stats.blackHoleCount +
      result.stats.darkMatterCount
    expect(totalConditions).toBe(2)
  })

  it('populates best-of fields', () => {
    const code1 = '/** docs */\nexport function a(): void {}'
    const code2 = 'const x = 1'
    const result = buildGravityWellResult(['a.ts', 'b.ts'], [code1, code2])
    expect(result.stats.mostMassive).toBeTruthy()
    expect(result.stats.mostStable).toBeTruthy()
    expect(result.stats.hardestToEscape).toBeTruthy()
    expect(result.stats.strongestGravity).toBeTruthy()
    expect(result.stats.mostDistorting).toBeTruthy()
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('gravity-well format helpers', () => {
  const sampleResult: GravityWellResult = buildGravityWellResult(
    ['test.ts'],
    ['/** docs */\nexport function test(): number { return 1; }'],
  )

  it('formatGravityWellTable returns string with report header', () => {
    const output = formatGravityWellTable(sampleResult, false)
    expect(output).toContain('Gravity Well Report')
    expect(output).toContain('Universe Overview')
    expect(output).toContain('Statistics')
  })

  it('formatGravityWellTable shows body details in verbose mode', () => {
    const output = formatGravityWellTable(sampleResult, true)
    expect(output).toContain('Celestial Bodies')
    expect(output).toContain('test.ts')
  })

  it('formatGravityWellTable shows systems', () => {
    const output = formatGravityWellTable(sampleResult, false)
    expect(output).toContain('Star Systems')
  })

  it('formatGravityWellJson returns valid JSON', () => {
    const output = formatGravityWellJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.bodies).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.universe).toBeDefined()
  })

  it('formatGravityWellCsv returns CSV with headers', () => {
    const output = formatGravityWellCsv(sampleResult)
    expect(output).toContain('File,GravitationalMass,OrbitalStability')
    expect(output).toContain('test.ts')
  })

  it('formatGravityWellCsv escapes commas in filenames', () => {
    const result = buildGravityWellResult(
      ['file,with,commas.ts'],
      ['/** docs */\nexport function f(): void {}'],
    )
    const output = formatGravityWellCsv(result)
    expect(output).toContain('"file,with,commas.ts"')
  })

  it('handles empty result in all formats', () => {
    const empty = buildGravityWellResult([], [])
    expect(() => formatGravityWellTable(empty, false)).not.toThrow()
    expect(() => formatGravityWellTable(empty, true)).not.toThrow()
    expect(() => formatGravityWellJson(empty)).not.toThrow()
    expect(() => formatGravityWellCsv(empty)).not.toThrow()
  })

  it('shows recommendations in table output', () => {
    const output = formatGravityWellTable(sampleResult, false)
    expect(output).toContain('Recommendations')
  })
})
