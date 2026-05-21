import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  measureLightTransmission, measureGlassClarity, measureColorIntensity,
  classifyGlassType, classifyFrameMaterial, classifyGlassCondition,
  classifyIllumination, classifyBayType, classifyBayCondition, classifyGlazierGrade,
  assessGlass, assessFrame, assessLeading,
  analyzeWindowPane, analyzeWindowBay,
  generateRecommendations, buildStainedGlassWindowResult,
} from '../src/commands/stained-glass-window-helpers.js'
import { formatStainedGlassWindowTable, formatStainedGlassWindowJson } from '../src/commands/stained-glass-window-format-helpers.js'

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

const interfaceCode = [
  'export interface User { name: string; age: number }',
  'export type UserId = string',
  'export function getUser(id: string): User { return { name: "test", age: 25 } }',
].join('\n')

const classCode = [
  'import { Base } from "./base.js"',
  'import { Logger } from "./logger.js"',
  'export class Calculator extends Base {',
  '  private value: number',
  '  constructor(v: number) { super(); this.value = v }',
  '  compute(): number { return this.value * 2 }',
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

const noExportCode = [
  'function internalHelper() { return 42 }',
  'const data = internalHelper()',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\nconst y = 2')).toBe(2)
  })
  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
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

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('measureLightTransmission', () => {
  it('returns zero light for empty code', () => {
    const light = measureLightTransmission(emptyCode)
    expect(light.incidentLight).toBe(0)
    expect(light.transmittedLight).toBe(0)
    expect(light.absorbedLight).toBe(0)
  })

  it('returns positive light for strong code', () => {
    const light = measureLightTransmission(strongCode)
    expect(light.incidentLight).toBeGreaterThan(0)
    expect(light.transmittedLight).toBeGreaterThan(0)
  })

  it('calculates transmission efficiency', () => {
    const light = measureLightTransmission(strongCode)
    expect(light.transmissionEfficiency).toBeGreaterThanOrEqual(0)
    expect(light.transmissionEfficiency).toBeLessThanOrEqual(100)
  })

  it('detects absorbed light in complex code', () => {
    const light = measureLightTransmission(consoleCode)
    expect(typeof light.absorbedLight).toBe('number')
  })
})

describe('measureGlassClarity', () => {
  it('returns 0 for empty code', () => {
    expect(measureGlassClarity(emptyCode)).toBe(0)
  })

  it('returns positive for typed code', () => {
    expect(measureGlassClarity(typedCode)).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    expect(measureGlassClarity(strongCode)).toBeLessThanOrEqual(100)
  })
})

describe('measureColorIntensity', () => {
  it('returns 0 for empty code', () => {
    expect(measureColorIntensity(emptyCode)).toBe(0)
  })

  it('returns positive for rich code', () => {
    expect(measureColorIntensity(strongCode)).toBeGreaterThan(0)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifyGlassType', () => {
  it('returns opaque for empty code', () => {
    expect(classifyGlassType(emptyCode)).toBe('opaque')
  })

  it('returns transparent for clear typed code', () => {
    const result = classifyGlassType(strongCode)
    expect(['transparent', 'cathedral', 'rippled']).toContain(result)
  })

  it('returns seedy or streaky for simple code', () => {
    const result = classifyGlassType(simpleCode)
    expect(['seedy', 'streaky', 'opaque']).toContain(result)
  })
})

describe('classifyFrameMaterial', () => {
  it('returns none for simple code', () => {
    expect(classifyFrameMaterial(simpleCode)).toBe('none')
  })

  it('returns wood for single export', () => {
    expect(classifyFrameMaterial('export const x = 1')).toBe('wood')
  })

  it('returns stone for complex code', () => {
    const result = classifyFrameMaterial(strongCode)
    expect(['stone', 'iron', 'aluminum']).toContain(result)
  })

  it('returns plastic for function-only code', () => {
    expect(classifyFrameMaterial('function a() {}')).toBe('plastic')
  })
})

describe('classifyGlassCondition', () => {
  it('returns pristine for 80+', () => {
    expect(classifyGlassCondition(85)).toBe('pristine')
  })
  it('returns clean for 60-79', () => {
    expect(classifyGlassCondition(65)).toBe('clean')
  })
  it('returns dusty for 40-59', () => {
    expect(classifyGlassCondition(50)).toBe('dusty')
  })
  it('returns cloudy for 25-39', () => {
    expect(classifyGlassCondition(30)).toBe('cloudy')
  })
  it('returns cracked for 10-24', () => {
    expect(classifyGlassCondition(15)).toBe('cracked')
  })
  it('returns broken for <10', () => {
    expect(classifyGlassCondition(5)).toBe('broken')
  })
})

describe('classifyIllumination', () => {
  it('returns brilliant for 80+', () => {
    expect(classifyIllumination(85)).toBe('brilliant')
  })
  it('returns bright for 60-79', () => {
    expect(classifyIllumination(65)).toBe('bright')
  })
  it('returns moderate for 40-59', () => {
    expect(classifyIllumination(50)).toBe('moderate')
  })
  it('returns dim for 20-39', () => {
    expect(classifyIllumination(25)).toBe('dim')
  })
  it('returns dark for 5-19', () => {
    expect(classifyIllumination(10)).toBe('dark')
  })
  it('returns opaque for <5', () => {
    expect(classifyIllumination(2)).toBe('opaque')
  })
})

describe('classifyBayType', () => {
  it('returns chancel for 0-1 panes', () => {
    expect(classifyBayType(1)).toBe('chancel')
  })
  it('returns aisle for 2 panes', () => {
    expect(classifyBayType(2)).toBe('aisle')
  })
  it('returns transept for 4 panes', () => {
    expect(classifyBayType(4)).toBe('transept')
  })
  it('returns nave for 7 panes', () => {
    expect(classifyBayType(7)).toBe('nave')
  })
  it('returns clerestory for 12 panes', () => {
    expect(classifyBayType(12)).toBe('clerestory')
  })
  it('returns rose-window for 25 panes', () => {
    expect(classifyBayType(25)).toBe('rose-window')
  })
})

describe('classifyBayCondition', () => {
  it('returns radiant for 80+', () => {
    expect(classifyBayCondition(85)).toBe('radiant')
  })
  it('returns bright for 60-79', () => {
    expect(classifyBayCondition(65)).toBe('bright')
  })
  it('returns lit for 40-59', () => {
    expect(classifyBayCondition(50)).toBe('lit')
  })
  it('returns dim for 20-39', () => {
    expect(classifyBayCondition(25)).toBe('dim')
  })
  it('returns dark for 10-19', () => {
    expect(classifyBayCondition(15)).toBe('dark')
  })
  it('returns black for <10', () => {
    expect(classifyBayCondition(5)).toBe('black')
  })
})

describe('classifyGlazierGrade', () => {
  it('returns master-glazier for 75+', () => {
    expect(classifyGlazierGrade(80)).toBe('master-glazier')
  })
  it('returns glazier for 60-74', () => {
    expect(classifyGlazierGrade(65)).toBe('glazier')
  })
  it('returns artisan for 45-59', () => {
    expect(classifyGlazierGrade(50)).toBe('artisan')
  })
  it('returns apprentice for 30-44', () => {
    expect(classifyGlazierGrade(35)).toBe('apprentice')
  })
  it('returns hobbyist for 15-29', () => {
    expect(classifyGlazierGrade(20)).toBe('hobbyist')
  })
  it('returns vandal for <15', () => {
    expect(classifyGlazierGrade(5)).toBe('vandal')
  })
})

// ─── Sub-Analysis Tests ───────────────────────────────────────────────────────

describe('assessGlass', () => {
  it('returns broken glass for empty code', () => {
    const g = assessGlass(emptyCode)
    expect(g.condition).toBe('broken')
    expect(g.type).toBe('opaque')
  })

  it('returns glass with details', () => {
    const g = assessGlass(strongCode)
    expect(typeof g.type).toBe('string')
    expect(typeof g.thickness).toBe('number')
    expect(typeof g.hasBubbles).toBe('boolean')
  })

  it('detects bubbles from console', () => {
    const g = assessGlass(consoleCode)
    expect(g.hasBubbles).toBe(true)
    expect(g.bubbleCount).toBeGreaterThan(0)
  })
})

describe('assessFrame', () => {
  it('returns none frame for empty code', () => {
    const f = assessFrame(emptyCode)
    expect(f.material).toBe('none')
    expect(f.hasTracery).toBe(false)
  })

  it('returns frame with details', () => {
    const f = assessFrame(strongCode)
    expect(typeof f.material).toBe('string')
    expect(typeof f.integrity).toBe('number')
    expect(typeof f.hasTracery).toBe('boolean')
  })

  it('detects tracery for typed code', () => {
    const f = assessFrame(typedCode)
    expect(f.hasTracery).toBe(true)
  })
})

describe('assessLeading', () => {
  it('returns zero quality for empty code', () => {
    const l = assessLeading(emptyCode)
    expect(l.quality).toBe(0)
  })

  it('returns positive quality for typed code', () => {
    const l = assessLeading(strongCode)
    expect(l.quality).toBeGreaterThan(0)
  })

  it('detects gaps when exports without types', () => {
    const l = assessLeading('export function a() { return 1 }')
    expect(l.hasGaps).toBe(true)
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeWindowPane', () => {
  it('returns complete WindowPane object', () => {
    const p = analyzeWindowPane(strongCode, 'test.ts')
    expect(p.file).toBe('test.ts')
    expect(typeof p.lightTransmission).toBe('number')
    expect(typeof p.glassClarity).toBe('number')
    expect(typeof p.colorIntensity).toBe('number')
    expect(typeof p.thickness).toBe('number')
    expect(typeof p.frameSupport).toBe('number')
    expect(typeof p.leadingQuality).toBe('number')
    expect(typeof p.opacity).toBe('number')
    expect(typeof p.luminosity).toBe('number')
    expect(p.glass).toBeDefined()
    expect(p.frame).toBeDefined()
    expect(p.leading).toBeDefined()
    expect(p.light).toBeDefined()
    expect(typeof p.orientation).toBe('string')
    expect(typeof p.position).toBe('string')
    expect(typeof p.illumination).toBe('string')
    expect(typeof p.qualityScore).toBe('number')
  })

  it('produces quality score between 0 and 100', () => {
    const p = analyzeWindowPane(strongCode, 'test.ts')
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeLessThanOrEqual(100)
  })

  it('has zero metrics for empty code', () => {
    const p = analyzeWindowPane(emptyCode, 'empty.ts')
    expect(p.glassClarity).toBe(0)
    expect(p.lightTransmission).toBe(0)
    expect(p.opacity).toBe(100)
  })

  it('has nested glass info', () => {
    const p = analyzeWindowPane(strongCode, 'test.ts')
    expect(typeof p.glass.type).toBe('string')
    expect(typeof p.glass.condition).toBe('string')
  })

  it('has nested frame info', () => {
    const p = analyzeWindowPane(strongCode, 'test.ts')
    expect(typeof p.frame.material).toBe('string')
    expect(typeof p.frame.integrity).toBe('number')
  })

  it('has nested light info', () => {
    const p = analyzeWindowPane(strongCode, 'test.ts')
    expect(typeof p.light.incidentLight).toBe('number')
    expect(typeof p.light.transmittedLight).toBe('number')
  })
})

// ─── Bay Analysis Tests ───────────────────────────────────────────────────────

describe('analyzeWindowBay', () => {
  it('returns black bay for empty panes', () => {
    const b = analyzeWindowBay([], 'empty-dir')
    expect(b.directory).toBe('empty-dir')
    expect(b.condition).toBe('black')
    expect(b.panes).toHaveLength(0)
  })

  it('returns complete bay for panes', () => {
    const panes = [
      analyzeWindowPane(strongCode, 'src/a.ts'),
      analyzeWindowPane(typedCode, 'src/b.ts'),
    ]
    const b = analyzeWindowBay(panes, 'src')
    expect(b.directory).toBe('src')
    expect(b.panes).toHaveLength(2)
    expect(typeof b.avgLightTransmission).toBe('number')
    expect(typeof b.avgLuminosity).toBe('number')
    expect(typeof b.bayType).toBe('string')
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildStainedGlassWindowResult', () => {
  it('returns complete result structure', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    expect(result.panes).toBeDefined()
    expect(result.bays).toBeDefined()
    expect(result.cathedral).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildStainedGlassWindowResult([], [], {})
    expect(result.panes).toHaveLength(0)
    expect(result.bays).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('handles multiple files', () => {
    const result = buildStainedGlassWindowResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.panes).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('groups files into bays by directory', () => {
    const result = buildStainedGlassWindowResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, typedCode, simpleCode],
      {},
    )
    expect(result.bays.length).toBeGreaterThan(0)
  })

  it('populates cathedral info', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    expect(typeof result.cathedral.totalLightTransmission).toBe('number')
    expect(typeof result.cathedral.avgGlassClarity).toBe('number')
    expect(typeof result.cathedral.isWellIlluminated).toBe('boolean')
  })

  it('populates stats correctly', () => {
    const result = buildStainedGlassWindowResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(typeof s.avgLightTransmission).toBe('number')
    expect(typeof s.avgGlassClarity).toBe('number')
    expect(typeof s.brilliantPanes).toBe('number')
    expect(typeof s.opaquePanes).toBe('number')
    expect(typeof s.overallLuminosity).toBe('number')
    expect(typeof s.glazierGrade).toBe('string')
    expect(typeof s.brightestPane).toBe('string')
    expect(typeof s.darkestPane).toBe('string')
    expect(typeof s.bestFramed).toBe('string')
    expect(typeof s.bestLed).toBe('string')
  })

  it('handles missing content gracefully', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [], {})
    expect(result.panes).toHaveLength(1)
    expect(result.panes[0].glassClarity).toBe(0)
  })
})

// ─── Format Helper Tests ──────────────────────────────────────────────────────

describe('formatStainedGlassWindowTable', () => {
  it('returns string output', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    const output = formatStainedGlassWindowTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('includes key sections', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    const output = formatStainedGlassWindowTable(result, false)
    expect(output).toContain('Stained Glass Window')
    expect(output).toContain('Window Panes')
    expect(output).toContain('Cathedral')
    expect(output).toContain('Statistics')
  })

  it('handles verbose mode', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    const output = formatStainedGlassWindowTable(result, true)
    expect(typeof output).toBe('string')
  })

  it('handles empty result', () => {
    const result = buildStainedGlassWindowResult([], [], {})
    const output = formatStainedGlassWindowTable(result, false)
    expect(output).toContain('No files analyzed')
  })
})

describe('formatStainedGlassWindowJson', () => {
  it('returns valid JSON', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    const output = formatStainedGlassWindowJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.panes).toBeDefined()
    expect(parsed.bays).toBeDefined()
    expect(parsed.cathedral).toBeDefined()
  })

  it('preserves all fields', () => {
    const result = buildStainedGlassWindowResult(['a.ts'], [strongCode], {})
    const output = formatStainedGlassWindowJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.glazierGrade).toBeDefined()
    expect(parsed.cathedral.totalLightTransmission).toBeGreaterThanOrEqual(0)
  })
})
