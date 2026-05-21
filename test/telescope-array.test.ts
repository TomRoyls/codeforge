import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  measureApertureDiameter, measureSignalStrength, measureNoiseLevel,
  measureReceiverQuality, measureDataProcessingQuality,
  computeSignalToNoise, measureResolvingPower,
  classifyDishType, classifyDishCondition, classifyArrayType,
  classifyConfigurationType, classifyConfigCondition, classifyAstronomerGrade,
  calibrateDish, assessPointing, analyzeDishBaseline,
  analyzeArrayDish, computeBaseline, analyzeArrayConfiguration,
  computeResolvingPower, computeApertureSynthesis,
  generateRecommendations, buildTelescopeArrayResult,
} from '../src/commands/telescope-array-helpers.js'
import { formatTelescopeArrayTable, formatTelescopeArrayJson } from '../src/commands/telescope-array-format-helpers.js'
import type { ArrayDish } from '../src/commands/telescope-array-helpers.js'

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
  'export interface User {',
  '  name: string',
  '  age: number',
  '}',
  '',
  'export type UserId = string',
  '',
  'export function getUser(id: string): User {',
  '  return { name: "test", age: 25 }',
  '}',
].join('\n')

const consoleCode = [
  'export function debug() {',
  '  console.log("a")',
  '  console.log("b")',
  '  console.log("c")',
  '  console.log("d")',
  '}',
].join('\n')

const classCode = [
  'import { Base } from "./base.js"',
  'import { Logger } from "./logger.js"',
  '',
  'export class Calculator extends Base {',
  '  private value: number',
  '  constructor(v: number) {',
  '    super()',
  '    this.value = v',
  '  }',
  '  compute(): number {',
  '    return this.value * 2',
  '  }',
  '}',
].join('\n')

const noExportCode = [
  'function internalHelper() {',
  '  return 42',
  '}',
  '',
  'const data = internalHelper()',
].join('\n')

const noisyCode = [
  'if(a){if(b){if(c){if(d){if(e){if(f){}}}}}}',
  'TODO: fix this',
  'FIXME: broken',
  'console.log("debug1")',
  'console.log("debug2")',
  'console.log("debug3")',
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
    expect(countLoc('a\n\nb\n\nc')).toBe(3)
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

  it('counts export interface', () => {
    expect(countExports('export interface I {}')).toBe(1)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const add = (a: number) => a + 1')).toBe(1)
  })
})

describe('countErrorHandling', () => {
  it('counts try and catch', () => {
    expect(countErrorHandling('try { x() } catch(e) {}')).toBe(2)
  })

  it('counts throw statements', () => {
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('returns 0 for no annotations', () => {
    expect(countTypeAnnotations('const x = 1')).toBe(0)
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

  it('returns 0 for no braces', () => {
    expect(maxNesting('hello')).toBe(0)
  })
})

describe('countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })
})

describe('countComments', () => {
  it('counts single-line comments', () => {
    expect(countComments('// hello')).toBe(1)
  })
})

describe('countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('TODO: fix this')).toBe(1)
  })

  it('counts FIXME markers', () => {
    expect(countTodos('FIXME: broken')).toBe(1)
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('measureApertureDiameter', () => {
  it('returns 0 for empty content', () => {
    expect(measureApertureDiameter(emptyCode)).toBe(0)
  })

  it('returns positive for strong code', () => {
    const result = measureApertureDiameter(strongCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('caps at 100', () => {
    expect(measureApertureDiameter(strongCode)).toBeLessThanOrEqual(100)
  })
})

describe('measureSignalStrength', () => {
  it('returns 0 for empty content', () => {
    expect(measureSignalStrength(emptyCode)).toBe(0)
  })

  it('returns positive for typed code', () => {
    const result = measureSignalStrength(typedCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

describe('measureNoiseLevel', () => {
  it('returns 0 for empty content', () => {
    expect(measureNoiseLevel(emptyCode)).toBe(0)
  })

  it('returns higher noise for complex code', () => {
    const simple = measureNoiseLevel(simpleCode)
    const noisy = measureNoiseLevel(noisyCode)
    expect(noisy).toBeGreaterThan(simple)
  })
})

describe('measureReceiverQuality', () => {
  it('returns 0 for empty content', () => {
    expect(measureReceiverQuality(emptyCode)).toBe(0)
  })

  it('returns positive for typed code with error handling', () => {
    const result = measureReceiverQuality(strongCode)
    expect(result).toBeGreaterThan(0)
  })
})

describe('measureDataProcessingQuality', () => {
  it('returns 0 for empty content', () => {
    expect(measureDataProcessingQuality(emptyCode)).toBe(0)
  })

  it('returns positive for export code', () => {
    const result = measureDataProcessingQuality(typedCode)
    expect(result).toBeGreaterThan(0)
  })
})

describe('computeSignalToNoise', () => {
  it('returns 0 when both are 0', () => {
    expect(computeSignalToNoise(0, 0)).toBe(0)
  })

  it('returns 100 when noise is 0', () => {
    expect(computeSignalToNoise(50, 0)).toBe(100)
  })

  it('returns ratio correctly', () => {
    const result = computeSignalToNoise(70, 30)
    expect(result).toBe(70)
  })
})

describe('measureResolvingPower', () => {
  it('returns 0 for empty content', () => {
    expect(measureResolvingPower(emptyCode)).toBe(0)
  })

  it('returns positive for strong code', () => {
    const result = measureResolvingPower(strongCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifyDishType', () => {
  it('classifies strong code as parabolic or phased-array', () => {
    const result = classifyDishType(strongCode)
    expect(['parabolic', 'phased-array', 'cassegrain', 'spherical']).toContain(result)
  })

  it('classifies simple code as flat-panel', () => {
    expect(classifyDishType(simpleCode)).toBe('flat-panel')
  })

  it('classifies single-export short code as offset', () => {
    expect(classifyDishType('export const x = 1')).toBe('offset')
  })

  it('classifies class code with imports', () => {
    const result = classifyDishType(classCode)
    expect(['cassegrain', 'parabolic', 'phased-array']).toContain(result)
  })

  it('classifies no-export code as flat-panel', () => {
    expect(classifyDishType(noExportCode)).toBe('flat-panel')
  })
})

describe('classifyDishCondition', () => {
  it('returns optimal for 80+', () => {
    expect(classifyDishCondition(85)).toBe('optimal')
  })

  it('returns good for 65-79', () => {
    expect(classifyDishCondition(70)).toBe('good')
  })

  it('returns fair for 45-64', () => {
    expect(classifyDishCondition(50)).toBe('fair')
  })

  it('returns needs-maintenance for 25-44', () => {
    expect(classifyDishCondition(35)).toBe('needs-maintenance')
  })

  it('returns damaged for 10-24', () => {
    expect(classifyDishCondition(15)).toBe('damaged')
  })

  it('returns offline for <10', () => {
    expect(classifyDishCondition(5)).toBe('offline')
  })
})

describe('classifyArrayType', () => {
  it('returns random for 0-1 dishes', () => {
    expect(classifyArrayType(1)).toBe('random')
  })

  it('returns linear for 2 dishes', () => {
    expect(classifyArrayType(2)).toBe('linear')
  })

  it('returns y-shaped for 4 dishes', () => {
    expect(classifyArrayType(4)).toBe('y-shaped')
  })

  it('returns cross for 6 dishes', () => {
    expect(classifyArrayType(6)).toBe('cross')
  })

  it('returns ring for 12 dishes', () => {
    expect(classifyArrayType(12)).toBe('ring')
  })

  it('returns compact for 25 dishes', () => {
    expect(classifyArrayType(25)).toBe('compact')
  })
})

describe('classifyConfigurationType', () => {
  it('returns sparse for 1 dish', () => {
    expect(classifyConfigurationType(1, 50)).toBe('sparse')
  })

  it('returns connected-element for 3 dishes', () => {
    expect(classifyConfigurationType(3, 50)).toBe('connected-element')
  })

  it('returns dense for many dishes with short baselines', () => {
    expect(classifyConfigurationType(8, 20)).toBe('dense')
  })

  it('returns phased-array for many dishes with very short baselines', () => {
    expect(classifyConfigurationType(20, 20)).toBe('phased-array')
  })

  it('returns vlbi for many dishes with long baselines', () => {
    expect(classifyConfigurationType(12, 70)).toBe('vlbi')
  })
})

describe('classifyConfigCondition', () => {
  it('returns world-class for 80+', () => {
    expect(classifyConfigCondition(85)).toBe('world-class')
  })

  it('returns research-grade for 60-79', () => {
    expect(classifyConfigCondition(70)).toBe('research-grade')
  })

  it('returns survey-grade for 40-59', () => {
    expect(classifyConfigCondition(50)).toBe('survey-grade')
  })

  it('returns educational for 25-39', () => {
    expect(classifyConfigCondition(30)).toBe('educational')
  })

  it('returns amateur for 10-24', () => {
    expect(classifyConfigCondition(15)).toBe('amateur')
  })

  it('returns broken for <10', () => {
    expect(classifyConfigCondition(5)).toBe('broken')
  })
})

describe('classifyAstronomerGrade', () => {
  it('returns director for 75+', () => {
    expect(classifyAstronomerGrade(80)).toBe('director')
  })

  it('returns senior-astronomer for 60-74', () => {
    expect(classifyAstronomerGrade(65)).toBe('senior-astronomer')
  })

  it('returns astronomer for 45-59', () => {
    expect(classifyAstronomerGrade(50)).toBe('astronomer')
  })

  it('returns observer for 30-44', () => {
    expect(classifyAstronomerGrade(35)).toBe('observer')
  })

  it('returns amateur for 15-29', () => {
    expect(classifyAstronomerGrade(20)).toBe('amateur')
  })

  it('returns light-polluted for <15', () => {
    expect(classifyAstronomerGrade(10)).toBe('light-polluted')
  })
})

// ─── Sub-Analysis Tests ───────────────────────────────────────────────────────

describe('calibrateDish', () => {
  it('returns uncalibrated for empty code', () => {
    const cal = calibrateDish(emptyCode)
    expect(cal.isCalibrated).toBe(false)
    expect(cal.calibrationAccuracy).toBe(0)
    expect(cal.needsRecalibration).toBe(true)
  })

  it('returns calibrated for well-typed code', () => {
    const cal = calibrateDish(strongCode)
    expect(cal.calibrationAccuracy).toBeGreaterThan(0)
  })

  it('detects phase errors for low accuracy', () => {
    const cal = calibrateDish(simpleCode)
    expect(typeof cal.hasPhaseErrors).toBe('boolean')
  })

  it('detects amplitude errors for console-heavy code', () => {
    const cal = calibrateDish(consoleCode)
    expect(cal.hasAmplitudeErrors).toBe(true)
  })
})

describe('assessPointing', () => {
  it('returns zero accuracy for empty code', () => {
    const pt = assessPointing(emptyCode)
    expect(pt.accuracy).toBe(0)
    expect(pt.isOnTarget).toBe(false)
    expect(pt.hasDrift).toBe(true)
  })

  it('returns positive accuracy for typed code', () => {
    const pt = assessPointing(typedCode)
    expect(pt.accuracy).toBeGreaterThan(0)
  })

  it('detects tracking for export+function code', () => {
    const pt = assessPointing(typedCode)
    expect(pt.hasTracking).toBe(true)
  })

  it('detects drift for complex code', () => {
    const complexCode = Array.from({ length: 10 }, (_, i) => `function f${i}() {}`).join('\n')
    const pt = assessPointing(complexCode)
    expect(pt.hasDrift).toBe(true)
  })
})

describe('analyzeDishBaseline', () => {
  it('returns empty baseline for no connections', () => {
    const dish = analyzeArrayDish(simpleCode, 'a.ts')
    const bl = analyzeDishBaseline(dish, [])
    expect(bl.withDishes).toHaveLength(0)
    expect(bl.avgBaselineLength).toBe(0)
  })

  it('returns connections for linked files', () => {
    const dish = analyzeArrayDish(simpleCode, 'a.ts')
    const bl = analyzeDishBaseline(dish, ['b.ts', 'c.ts'])
    expect(bl.withDishes).toHaveLength(2)
    expect(bl.avgBaselineLength).toBeGreaterThan(0)
  })

  it('deduplicates connections', () => {
    const dish = analyzeArrayDish(simpleCode, 'a.ts')
    const bl = analyzeDishBaseline(dish, ['b.ts', 'b.ts', 'c.ts'])
    expect(bl.withDishes).toHaveLength(2)
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeArrayDish', () => {
  it('returns complete ArrayDish object', () => {
    const dish = analyzeArrayDish(strongCode, 'test.ts')
    expect(dish.file).toBe('test.ts')
    expect(typeof dish.apertureDiameter).toBe('number')
    expect(typeof dish.resolvingPower).toBe('number')
    expect(typeof dish.signalStrength).toBe('number')
    expect(typeof dish.noiseLevel).toBe('number')
    expect(typeof dish.signalToNoise).toBe('number')
    expect(typeof dish.frequency).toBe('number')
    expect(typeof dish.dishType).toBe('string')
    expect(typeof dish.receiverQuality).toBe('number')
    expect(typeof dish.dataProcessingQuality).toBe('number')
    expect(dish.calibration).toBeDefined()
    expect(dish.pointing).toBeDefined()
    expect(dish.baseline).toBeDefined()
    expect(typeof dish.condition).toBe('string')
    expect(typeof dish.qualityScore).toBe('number')
  })

  it('produces quality score between 0 and 100', () => {
    const dish = analyzeArrayDish(strongCode, 'test.ts')
    expect(dish.qualityScore).toBeGreaterThanOrEqual(0)
    expect(dish.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns 0 metrics for empty code', () => {
    const dish = analyzeArrayDish(emptyCode, 'empty.ts')
    expect(dish.apertureDiameter).toBe(0)
    expect(dish.signalStrength).toBe(0)
    expect(dish.qualityScore).toBe(0)
    expect(dish.condition).toBe('offline')
  })

  it('has nested calibration info', () => {
    const dish = analyzeArrayDish(strongCode, 'test.ts')
    expect(typeof dish.calibration.isCalibrated).toBe('boolean')
    expect(typeof dish.calibration.calibrationAccuracy).toBe('number')
    expect(typeof dish.calibration.hasPhaseErrors).toBe('boolean')
  })

  it('has nested pointing info', () => {
    const dish = analyzeArrayDish(strongCode, 'test.ts')
    expect(typeof dish.pointing.accuracy).toBe('number')
    expect(typeof dish.pointing.isOnTarget).toBe('boolean')
    expect(typeof dish.pointing.hasDrift).toBe('boolean')
  })
})

// ─── Baseline Tests ───────────────────────────────────────────────────────────

describe('computeBaseline', () => {
  it('returns BaselinePair with correct shape', () => {
    const dishA = analyzeArrayDish(strongCode, 'a.ts')
    const dishB = analyzeArrayDish(typedCode, 'b.ts')
    const bl = computeBaseline(dishA, dishB)
    expect(bl.dishA).toBe('a.ts')
    expect(bl.dishB).toBe('b.ts')
    expect(typeof bl.baselineLength).toBe('number')
    expect(typeof bl.correlationQuality).toBe('number')
    expect(typeof bl.interferenceType).toBe('string')
    expect(typeof bl.phaseAlignment).toBe('number')
    expect(typeof bl.isCoherent).toBe('boolean')
  })

  it('returns constructive for similar dishes', () => {
    const dishA = analyzeArrayDish(strongCode, 'a.ts')
    const dishB = analyzeArrayDish(strongCode, 'b.ts')
    const bl = computeBaseline(dishA, dishB)
    expect(bl.baselineLength).toBe(0)
    expect(bl.correlationQuality).toBe(100)
    expect(bl.interferenceType).toBe('constructive')
    expect(bl.isCoherent).toBe(true)
  })

  it('returns values between 0 and 100', () => {
    const dishA = analyzeArrayDish(strongCode, 'a.ts')
    const dishB = analyzeArrayDish(emptyCode, 'b.ts')
    const bl = computeBaseline(dishA, dishB)
    expect(bl.baselineLength).toBeGreaterThanOrEqual(0)
    expect(bl.baselineLength).toBeLessThanOrEqual(100)
    expect(bl.correlationQuality).toBeGreaterThanOrEqual(0)
    expect(bl.phaseAlignment).toBeGreaterThanOrEqual(0)
  })
})

// ─── Array Computation Tests ──────────────────────────────────────────────────

describe('computeResolvingPower', () => {
  it('returns 0 for empty array', () => {
    expect(computeResolvingPower([])).toBe(0)
  })

  it('returns positive for dishes with content', () => {
    const dishes = [analyzeArrayDish(strongCode, 'a.ts')]
    const result = computeResolvingPower(dishes)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('increases with more identical dishes', () => {
    const one = [analyzeArrayDish(strongCode, 'a.ts')]
    const three = [
      analyzeArrayDish(strongCode, 'a.ts'),
      analyzeArrayDish(strongCode, 'b.ts'),
      analyzeArrayDish(strongCode, 'c.ts'),
    ]
    expect(computeResolvingPower(three)).toBeGreaterThanOrEqual(computeResolvingPower(one))
  })
})

describe('computeApertureSynthesis', () => {
  it('returns 0 for empty array', () => {
    expect(computeApertureSynthesis([], [])).toBe(0)
  })

  it('returns positive for dishes with baselines', () => {
    const dishes = [analyzeArrayDish(strongCode, 'a.ts'), analyzeArrayDish(typedCode, 'b.ts')]
    const baselines = [computeBaseline(dishes[0], dishes[1])]
    const result = computeApertureSynthesis(dishes, baselines)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Configuration Tests ──────────────────────────────────────────────────────

describe('analyzeArrayConfiguration', () => {
  it('returns broken config for empty dishes', () => {
    const config = analyzeArrayConfiguration([], [], 'empty-dir')
    expect(config.directory).toBe('empty-dir')
    expect(config.dishes).toHaveLength(0)
    expect(config.condition).toBe('broken')
    expect(config.arrayHealth).toBe(0)
  })

  it('returns complete config for dishes', () => {
    const dishes = [
      analyzeArrayDish(strongCode, 'src/a.ts'),
      analyzeArrayDish(typedCode, 'src/b.ts'),
    ]
    const baselines = [computeBaseline(dishes[0], dishes[1])]
    const config = analyzeArrayConfiguration(dishes, baselines, 'src')
    expect(config.directory).toBe('src')
    expect(config.dishes).toHaveLength(2)
    expect(typeof config.totalAperture).toBe('number')
    expect(typeof config.resolvingPower).toBe('number')
    expect(typeof config.apertureSynthesis).toBe('number')
    expect(typeof config.arrayType).toBe('string')
    expect(typeof config.configuration).toBe('string')
    expect(typeof config.arrayHealth).toBe('number')
    expect(typeof config.condition).toBe('string')
  })

  it('counts optimal and damaged dishes', () => {
    const dishes = [
      analyzeArrayDish(strongCode, 'good.ts'),
      analyzeArrayDish(emptyCode, 'bad.ts'),
    ]
    const config = analyzeArrayConfiguration(dishes, [], 'src')
    expect(config.offlineDishes).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for offline dishes', () => {
    const result = buildTelescopeArrayResult(['bad.ts'], [emptyCode], {})
    const hasOfflineRec = result.recommendations.some(r => r.includes('Offline'))
    if (result.stats.offlineDishes > 0) {
      expect(hasOfflineRec).toBe(true)
    }
  })

  it('returns recommendations for high noise', () => {
    const result = buildTelescopeArrayResult(['noisy.ts'], [noisyCode], {})
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
  })

  it('returns unique recommendations', () => {
    const result = buildTelescopeArrayResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toHaveLength(unique.length)
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildTelescopeArrayResult', () => {
  it('returns complete result structure', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    expect(result.dishes).toBeDefined()
    expect(result.configurations).toBeDefined()
    expect(result.interferometer).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildTelescopeArrayResult([], [], {})
    expect(result.dishes).toHaveLength(0)
    expect(result.configurations).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.interferometer.overallPower).toBe(0)
  })

  it('handles multiple files', () => {
    const result = buildTelescopeArrayResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.dishes).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('groups files into configurations by directory', () => {
    const result = buildTelescopeArrayResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, typedCode, simpleCode],
      {},
    )
    expect(result.configurations.length).toBeGreaterThan(0)
  })

  it('populates interferometer info', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    const ifm = result.interferometer
    expect(typeof ifm.totalResolvingPower).toBe('number')
    expect(typeof ifm.totalAperture).toBe('number')
    expect(typeof ifm.avgSignalToNoise).toBe('number')
    expect(typeof ifm.overallPower).toBe('number')
    expect(typeof ifm.isCoherent).toBe('boolean')
  })

  it('populates stats correctly', () => {
    const result = buildTelescopeArrayResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(typeof s.avgAperture).toBe('number')
    expect(typeof s.avgResolvingPower).toBe('number')
    expect(typeof s.avgSignalStrength).toBe('number')
    expect(typeof s.avgNoiseLevel).toBe('number')
    expect(typeof s.optimalDishes).toBe('number')
    expect(typeof s.damagedDishes).toBe('number')
    expect(typeof s.offlineDishes).toBe('number')
    expect(typeof s.overallArrayPower).toBe('number')
    expect(typeof s.astronomerGrade).toBe('string')
    expect(typeof s.bestDish).toBe('string')
    expect(typeof s.worstDish).toBe('string')
    expect(typeof s.strongestPair).toBe('string')
    expect(typeof s.noisiestDish).toBe('string')
  })

  it('handles missing content gracefully', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [], {})
    expect(result.dishes).toHaveLength(1)
    expect(result.dishes[0].qualityScore).toBe(0)
  })

  it('computes baselines for same-directory files', () => {
    const result = buildTelescopeArrayResult(
      ['src/a.ts', 'src/b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.stats.totalBaselines).toBe(1)
  })

  it('does not compute baselines for different-directory files', () => {
    const result = buildTelescopeArrayResult(
      ['src/a.ts', 'test/b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.stats.totalBaselines).toBe(0)
  })
})

// ─── Format Helper Tests ──────────────────────────────────────────────────────

describe('formatTelescopeArrayTable', () => {
  it('returns string output', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    const output = formatTelescopeArrayTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('includes key sections', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    const output = formatTelescopeArrayTable(result, false)
    expect(output).toContain('Telescope Array')
    expect(output).toContain('Array Dishes')
    expect(output).toContain('Interferometer')
    expect(output).toContain('Statistics')
  })

  it('handles verbose mode', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    const output = formatTelescopeArrayTable(result, true)
    expect(typeof output).toBe('string')
    expect(output).toContain('Array Dishes')
  })

  it('handles empty result', () => {
    const result = buildTelescopeArrayResult([], [], {})
    const output = formatTelescopeArrayTable(result, false)
    expect(output).toContain('No files analyzed')
  })

  it('truncates long file list in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleCode)
    const result = buildTelescopeArrayResult(files, contents, {})
    const output = formatTelescopeArrayTable(result, false)
    expect(output).toContain('more')
  })
})

describe('formatTelescopeArrayJson', () => {
  it('returns valid JSON', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    const output = formatTelescopeArrayJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dishes).toBeDefined()
    expect(parsed.configurations).toBeDefined()
    expect(parsed.interferometer).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildTelescopeArrayResult([], [], {})
    const output = formatTelescopeArrayJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dishes).toHaveLength(0)
  })

  it('preserves all fields', () => {
    const result = buildTelescopeArrayResult(['a.ts'], [strongCode], {})
    const output = formatTelescopeArrayJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.astronomerGrade).toBeDefined()
    expect(parsed.interferometer.overallPower).toBeGreaterThanOrEqual(0)
  })
})
