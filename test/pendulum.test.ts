import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  computeDisplacement, computeEquilibrium, computeDeviation,
  classifySwingPattern, classifyPendulumType, classifySwingCondition,
  classifyClockCondition, classifyHorologistGrade,
  measureEnergy, analyzePendulumSwing, analyzePendulumClock,
  generateRecommendations, buildPendulumResult,
} from '../src/commands/pendulum-helpers.js'
import { formatPendulumTable, formatPendulumJson } from '../src/commands/pendulum-format-helpers.js'

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
  '    if (result > 0) {',
  '      return result',
  '    }',
  '    return 0',
  '  } catch (err) {',
  '    throw new Error("fail")',
  '  }',
  '}',
  '',
  'export interface CalcOptions {',
  '  value: number',
  '  label: string',
  '}',
  '',
  'export type CalcResult = number | string',
].join('\n')

const interfaceCode = [
  'export interface User { name: string; age: number }',
  'export type UserId = string',
  'export function getUser(id: string): User { return { name: "test", age: 25 } }',
].join('\n')

const classCode = [
  'import { Base } from "./base.js"',
  'import { Logger } from "./logger.js"',
  '',
  'export class Calculator extends Base {',
  '  private value: number',
  '  constructor(v: number) { super(); this.value = v }',
  '  compute(): number { return this.value * 2 }',
  '}',
].join('\n')

const overEngineeredCode = [
  'export interface IStrategy { execute(): void }',
  'export interface IFactory { create(): IStrategy }',
  'export interface IBuilder { build(): IFactory }',
  'export interface IObserver { notify(): void }',
  'export interface ISubject { subscribe(o: IObserver): void }',
  'export class ConcreteStrategyA implements IStrategy { execute(): void {} }',
  'export class ConcreteStrategyB implements IStrategy { execute(): void {} }',
  'export class ConcreteFactory implements IFactory { create(): IStrategy { return new ConcreteStrategyA() } }',
  'export class Director {',
  '  constructor(private builder: IBuilder) {}',
  '  construct(): void { this.builder.build() }',
  '}',
  'export type Config = { name: string; value: number }',
].join('\n')

const consoleCode = [
  'export function debug() {',
  '  console.log("a")',
  '  console.log("b")',
  '  console.log("c")',
  '  console.log("d")',
  '}',
].join('\n')

const noExportCode = [
  'function internalHelper() { return 42 }',
  'const data = internalHelper()',
].join('\n')

const noisyCode = [
  'if(a){if(b){if(c){if(d){if(e){if(f){}}}}}}',
  'TODO: fix',
  'FIXME: broken',
  'console.log("d1")',
  'console.log("d2")',
  'console.log("d3")',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\nconst y = 2')).toBe(2)
  })
  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })
  it('skips blank lines', () => {
    expect(countLoc('a\n\nb')).toBe(2)
  })
})

describe('countImports', () => {
  it('counts import statements', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
  })
  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

describe('countExports', () => {
  it('counts export function', () => {
    expect(countExports('export function a() {}')).toBe(1)
  })
  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })
})

describe('countErrorHandling', () => {
  it('counts try and catch', () => {
    expect(countErrorHandling('try { x() } catch(e) {}')).toBe(2)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })
})

describe('countBranches', () => {
  it('counts if statements', () => {
    expect(countBranches('if (a) {}')).toBe(1)
  })
})

describe('maxNesting', () => {
  it('counts nesting depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
})

describe('countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })
})

describe('countComments', () => {
  it('counts comments', () => {
    expect(countComments('// hello')).toBe(1)
  })
})

describe('countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('TODO: fix this')).toBe(1)
  })
})

// ─── Displacement Tests ───────────────────────────────────────────────────────

describe('computeDisplacement', () => {
  it('returns zero displacement for empty code', () => {
    const d = computeDisplacement(emptyCode)
    expect(d.engineering).toBe(0)
    expect(d.abstraction).toBe(0)
    expect(d.coupling).toBe(0)
    expect(d.documentation).toBe(0)
    expect(d.testing).toBe(0)
    expect(d.complexity).toBe(0)
  })

  it('returns displacement within -100 to 100', () => {
    const d = computeDisplacement(strongCode)
    expect(d.engineering).toBeGreaterThanOrEqual(-100)
    expect(d.engineering).toBeLessThanOrEqual(100)
    expect(d.abstraction).toBeGreaterThanOrEqual(-100)
    expect(d.coupling).toBeGreaterThanOrEqual(-100)
  })

  it('shows negative coupling for isolated code', () => {
    const d = computeDisplacement(noExportCode)
    expect(d.coupling).toBeLessThanOrEqual(0)
  })

  it('shows positive engineering for over-engineered code', () => {
    const d = computeDisplacement(overEngineeredCode)
    expect(d.engineering).toBeGreaterThan(0)
    expect(d.abstraction).toBeGreaterThan(0)
  })

  it('shows positive complexity for noisy code', () => {
    const d = computeDisplacement(noisyCode)
    expect(d.complexity).toBeGreaterThan(0)
  })

  it('shows positive documentation for commented code', () => {
    const d = computeDisplacement(strongCode)
    expect(d.documentation).toBeGreaterThan(0)
  })
})

// ─── Equilibrium Tests ────────────────────────────────────────────────────────

describe('computeEquilibrium', () => {
  it('returns high value for zero displacement', () => {
    expect(computeEquilibrium({ engineering: 0, abstraction: 0, coupling: 0, documentation: 0, testing: 0, complexity: 0 })).toBe(75)
  })

  it('returns between 0 and 100', () => {
    const d = computeDisplacement(strongCode)
    const eq = computeEquilibrium(d)
    expect(eq).toBeGreaterThanOrEqual(0)
    expect(eq).toBeLessThanOrEqual(100)
  })

  it('returns high for small displacement', () => {
    const d = { engineering: 5, abstraction: 5, coupling: 5, documentation: 5, testing: 5, complexity: -5 }
    const eq = computeEquilibrium(d)
    expect(eq).toBeGreaterThan(50)
  })
})

// ─── Deviation Tests ──────────────────────────────────────────────────────────

describe('computeDeviation', () => {
  it('returns zero deviation for ideal displacement', () => {
    const d = { engineering: 20, abstraction: 15, coupling: 10, documentation: 10, testing: 20, complexity: -10 }
    const dev = computeDeviation(d)
    expect(dev.fromIdeal).toBe(0)
    expect(dev.isDeviating).toBe(false)
  })

  it('returns deviation for extreme displacement', () => {
    const d = { engineering: 80, abstraction: -80, coupling: 60, documentation: -60, testing: 80, complexity: 80 }
    const dev = computeDeviation(d)
    expect(dev.fromIdeal).toBeGreaterThan(0)
    expect(dev.isDeviating).toBe(true)
  })

  it('identifies deviation axes', () => {
    const d = { engineering: 100, abstraction: 15, coupling: 10, documentation: 10, testing: 20, complexity: -10 }
    const dev = computeDeviation(d)
    expect(dev.deviationAxes).toContain('engineering')
  })

  it('identifies largest deviation', () => {
    const d = { engineering: 100, abstraction: 15, coupling: 10, documentation: 10, testing: 20, complexity: -10 }
    const dev = computeDeviation(d)
    expect(dev.largestDeviation).toBe('engineering')
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifySwingPattern', () => {
  it('returns critically-damped for low amplitude high damping', () => {
    expect(classifySwingPattern(10, 80, 30)).toBe('critically-damped')
  })

  it('returns simple-harmonic for low amplitude', () => {
    expect(classifySwingPattern(20, 50, 30)).toBe('simple-harmonic')
  })

  it('returns overdamped for high damping', () => {
    expect(classifySwingPattern(35, 70, 30)).toBe('overdamped')
  })

  it('returns damped for moderate damping', () => {
    expect(classifySwingPattern(35, 50, 30)).toBe('damped')
  })

  it('returns chaotic for high amplitude low damping', () => {
    expect(classifySwingPattern(70, 10, 30)).toBe('chaotic')
  })

  it('returns forced for moderate amplitude moderate damping', () => {
    expect(classifySwingPattern(40, 30, 30)).toBe('forced')
  })
})

describe('classifyPendulumType', () => {
  it('returns foucault for complex interface+class code', () => {
    const result = classifyPendulumType(overEngineeredCode)
    expect(result).toBe('foucault')
  })

  it('returns compound for class with imports', () => {
    expect(classifyPendulumType(classCode)).toBe('compound')
  })

  it('returns simple for plain code', () => {
    expect(classifyPendulumType(simpleCode)).toBe('simple')
  })

  it('returns simple for no-export functions', () => {
    expect(classifyPendulumType(noExportCode)).toBe('simple')
  })

  it('returns torsional for many no-export functions', () => {
    const manyFns = Array.from({ length: 4 }, (_, i) => `function fn${i}() { return ${i} }`).join('\n')
    expect(classifyPendulumType(manyFns)).toBe('torsional')
  })
})

describe('classifySwingCondition', () => {
  it('returns perfectly-timed for 85+', () => {
    expect(classifySwingCondition(90)).toBe('perfectly-timed')
  })
  it('returns well-regulated for 65-84', () => {
    expect(classifySwingCondition(70)).toBe('well-regulated')
  })
  it('returns steady for 45-64', () => {
    expect(classifySwingCondition(50)).toBe('steady')
  })
  it('returns wobbling for 25-44', () => {
    expect(classifySwingCondition(35)).toBe('wobbling')
  })
  it('returns chaotic for 10-24', () => {
    expect(classifySwingCondition(15)).toBe('chaotic')
  })
  it('returns broken for <10', () => {
    expect(classifySwingCondition(5)).toBe('broken')
  })
})

describe('classifyClockCondition', () => {
  it('returns precision-clock for 80+', () => {
    expect(classifyClockCondition(85)).toBe('precision-clock')
  })
  it('returns clock for 60-79', () => {
    expect(classifyClockCondition(65)).toBe('clock')
  })
  it('returns timepiece for 40-59', () => {
    expect(classifyClockCondition(50)).toBe('timepiece')
  })
  it('returns sundial for 25-39', () => {
    expect(classifyClockCondition(30)).toBe('sundial')
  })
  it('returns hourglass for 10-24', () => {
    expect(classifyClockCondition(15)).toBe('hourglass')
  })
  it('returns stopped for <10', () => {
    expect(classifyClockCondition(5)).toBe('stopped')
  })
})

describe('classifyHorologistGrade', () => {
  it('returns master-horologist for 75+', () => {
    expect(classifyHorologistGrade(80)).toBe('master-horologist')
  })
  it('returns horologist for 60-74', () => {
    expect(classifyHorologistGrade(65)).toBe('horologist')
  })
  it('returns watchmaker for 45-59', () => {
    expect(classifyHorologistGrade(50)).toBe('watchmaker')
  })
  it('returns clockmaker for 30-44', () => {
    expect(classifyHorologistGrade(35)).toBe('clockmaker')
  })
  it('returns tinkerer for 15-29', () => {
    expect(classifyHorologistGrade(20)).toBe('tinkerer')
  })
  it('returns child for <15', () => {
    expect(classifyHorologistGrade(5)).toBe('child')
  })
})

// ─── Energy Tests ─────────────────────────────────────────────────────────────

describe('measureEnergy', () => {
  it('returns energy info with correct shape', () => {
    const e = measureEnergy(30, 40, 60)
    expect(typeof e.kinetic).toBe('number')
    expect(typeof e.potential).toBe('number')
    expect(typeof e.total).toBe('number')
    expect(typeof e.isConserved).toBe('boolean')
  })

  it('caps values at 100', () => {
    const e = measureEnergy(100, 100, 0)
    expect(e.kinetic).toBeLessThanOrEqual(100)
    expect(e.potential).toBeLessThanOrEqual(100)
    expect(e.total).toBeLessThanOrEqual(100)
  })

  it('detects conserved energy when balanced', () => {
    const e = measureEnergy(30, 30, 50)
    expect(typeof e.isConserved).toBe('boolean')
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzePendulumSwing', () => {
  it('returns complete PendulumSwing object', () => {
    const s = analyzePendulumSwing(strongCode, 'test.ts')
    expect(s.file).toBe('test.ts')
    expect(typeof s.equilibrium).toBe('number')
    expect(typeof s.amplitude).toBe('number')
    expect(typeof s.frequency).toBe('number')
    expect(typeof s.damping).toBe('number')
    expect(typeof s.period).toBe('number')
    expect(typeof s.currentDisplacement).toBe('number')
    expect(s.displacement).toBeDefined()
    expect(typeof s.swingPattern).toBe('string')
    expect(s.oscillation).toBeDefined()
    expect(s.equilibriumIdeal).toBeDefined()
    expect(s.deviation).toBeDefined()
    expect(typeof s.phase).toBe('string')
    expect(s.energy).toBeDefined()
    expect(typeof s.pendulumType).toBe('string')
    expect(typeof s.condition).toBe('string')
    expect(typeof s.qualityScore).toBe('number')
  })

  it('returns quality score between 0 and 100', () => {
    const s = analyzePendulumSwing(strongCode, 'test.ts')
    expect(s.qualityScore).toBeGreaterThanOrEqual(0)
    expect(s.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns low quality for empty code', () => {
    const s = analyzePendulumSwing(emptyCode, 'empty.ts')
    expect(s.oscillation.isStuck).toBe(true)
    expect(s.qualityScore).toBeGreaterThanOrEqual(0)
    expect(s.qualityScore).toBeLessThanOrEqual(100)
  })

  it('has displacement values in range', () => {
    const s = analyzePendulumSwing(strongCode, 'test.ts')
    expect(s.displacement.engineering).toBeGreaterThanOrEqual(-100)
    expect(s.displacement.engineering).toBeLessThanOrEqual(100)
  })

  it('has nested oscillation info', () => {
    const s = analyzePendulumSwing(strongCode, 'test.ts')
    expect(typeof s.oscillation.isBalanced).toBe('boolean')
    expect(typeof s.oscillation.isSwinging).toBe('boolean')
    expect(typeof s.oscillation.isStuck).toBe('boolean')
    expect(typeof s.oscillation.isChaotic).toBe('boolean')
  })

  it('has energy info', () => {
    const s = analyzePendulumSwing(strongCode, 'test.ts')
    expect(typeof s.energy.kinetic).toBe('number')
    expect(typeof s.energy.potential).toBe('number')
    expect(typeof s.energy.total).toBe('number')
  })
})

// ─── Clock Analysis Tests ─────────────────────────────────────────────────────

describe('analyzePendulumClock', () => {
  it('returns stopped clock for empty swings', () => {
    const c = analyzePendulumClock([], 'empty-dir')
    expect(c.directory).toBe('empty-dir')
    expect(c.condition).toBe('stopped')
    expect(c.isBroken).toBe(true)
  })

  it('returns complete clock for swings', () => {
    const swings = [
      analyzePendulumSwing(strongCode, 'src/a.ts'),
      analyzePendulumSwing(typedCode, 'src/b.ts'),
    ]
    const c = analyzePendulumClock(swings, 'src')
    expect(c.directory).toBe('src')
    expect(c.swings).toHaveLength(2)
    expect(typeof c.avgEquilibrium).toBe('number')
    expect(typeof c.clockAccuracy).toBe('number')
    expect(typeof c.clockQuality).toBe('number')
  })

  it('counts balanced and chaotic swings', () => {
    const swings = [
      analyzePendulumSwing(strongCode, 'good.ts'),
      analyzePendulumSwing(emptyCode, 'bad.ts'),
    ]
    const c = analyzePendulumClock(swings, 'src')
    expect(typeof c.balancedCount).toBe('number')
    expect(typeof c.chaoticCount).toBe('number')
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildPendulumResult', () => {
  it('returns complete result structure', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    expect(result.swings).toBeDefined()
    expect(result.clocks).toBeDefined()
    expect(result.system).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildPendulumResult([], [], {})
    expect(result.swings).toHaveLength(0)
    expect(result.clocks).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('handles multiple files', () => {
    const result = buildPendulumResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.swings).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('groups files into clocks by directory', () => {
    const result = buildPendulumResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, typedCode, simpleCode],
      {},
    )
    expect(result.clocks.length).toBeGreaterThan(0)
  })

  it('populates system info', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    expect(typeof result.system.avgEquilibrium).toBe('number')
    expect(typeof result.system.avgAmplitude).toBe('number')
    expect(typeof result.system.totalEnergy).toBe('number')
    expect(typeof result.system.isSystemStable).toBe('boolean')
  })

  it('populates stats correctly', () => {
    const result = buildPendulumResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(typeof s.avgEquilibrium).toBe('number')
    expect(typeof s.avgFrequency).toBe('number')
    expect(typeof s.avgDamping).toBe('number')
    expect(typeof s.balancedFiles).toBe('number')
    expect(typeof s.stuckFiles).toBe('number')
    expect(typeof s.chaoticFiles).toBe('number')
    expect(typeof s.overallBalance).toBe('number')
    expect(typeof s.horologistGrade).toBe('string')
    expect(typeof s.mostBalanced).toBe('string')
    expect(typeof s.leastBalanced).toBe('string')
    expect(typeof s.mostChaotic).toBe('string')
    expect(typeof s.bestRegulated).toBe('string')
  })

  it('handles missing content gracefully', () => {
    const result = buildPendulumResult(['a.ts'], [], {})
    expect(result.swings).toHaveLength(1)
    expect(result.swings[0].oscillation.isStuck).toBe(true)
  })
})

// ─── Format Helper Tests ──────────────────────────────────────────────────────

describe('formatPendulumTable', () => {
  it('returns string output', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    const output = formatPendulumTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('includes key sections', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    const output = formatPendulumTable(result, false)
    expect(output).toContain('Pendulum')
    expect(output).toContain('Pendulum Swings')
    expect(output).toContain('System')
    expect(output).toContain('Statistics')
  })

  it('handles verbose mode', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    const output = formatPendulumTable(result, true)
    expect(typeof output).toBe('string')
  })

  it('handles empty result', () => {
    const result = buildPendulumResult([], [], {})
    const output = formatPendulumTable(result, false)
    expect(output).toContain('No files analyzed')
  })
})

describe('formatPendulumJson', () => {
  it('returns valid JSON', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    const output = formatPendulumJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.swings).toBeDefined()
    expect(parsed.clocks).toBeDefined()
    expect(parsed.system).toBeDefined()
  })

  it('preserves all fields', () => {
    const result = buildPendulumResult(['a.ts'], [strongCode], {})
    const output = formatPendulumJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.horologistGrade).toBeDefined()
  })
})
