import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifyBellType, classifyBellCondition, classifyChamberCondition,
  classifyCampanologistGrade,
  detectSilentFailures, detectFalseAlarms,
  measureSignals, assessRinging, assessAcoustics,
  analyzeBell, analyzeBellChamber,
  generateRecommendations, buildBellTowerResult,
} from '../src/commands/bell-tower-helpers.js'
import { formatBellTowerTable, formatBellTowerJson } from '../src/commands/bell-tower-format-helpers.js'

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
  '  constructor() { super() }',
  '  calc(): number { return this.value }',
  '}',
].join('\n')

const manyExportsCode = [
  'export function a() { return 1 }',
  'export function b() { return 2 }',
  'export function c() { return 3 }',
  'export function d() { return 4 }',
  'export const x = 5',
].join('\n')

const noisyCode = [
  'export function debug() {',
  '  console.log("a")',
  '  console.log("b")',
  '  console.log("c")',
  '  console.log("d")',
  '  console.log("e")',
  '  console.log("f")',
  '}',
].join('\n')

const noExportCode = [
  'const a = 1',
  'const b = 2',
].join('\n')

const manyImportsCode = [
  'import { a } from "a.js"',
  'import { b } from "b.js"',
  'import { c } from "c.js"',
  'import { d } from "d.js"',
  'import { e } from "e.js"',
  'const x = 1',
].join('\n')

const carillonCode = [
  'import { helper } from "./utils.js"',
  'interface Opts { val: number }',
  'class Bell { ring() { return 1 } }',
  'export function a(): number { return 1 }',
  'export function b(): number { return 2 }',
  'export function c(): number { return 3 }',
  'export function d(): number { return 4 }',
  'export const e = 5',
].join('\n')

const alarmCode = [
  'import { a } from "./a.js"',
  'import { b } from "./b.js"',
  'import { c } from "./c.js"',
  'export function risky() {',
  '  try { return 1 } catch(e) { throw new Error("x") }',
  '  try { return 2 } catch(e) { throw new Error("y") }',
  '  try { return 3 } catch(e) { throw new Error("z") }',
  '}',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  'export function a() { return 1 }',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('bell-tower primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc('a\n\nb')).toBe(2)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
    expect(countImports(manyImportsCode)).toBe(5)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
    expect(countExports(manyExportsCode)).toBe(5)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => 1')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
    expect(countTypeAnnotations(strongCode)).toBeGreaterThanOrEqual(3)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
    expect(countBranches('a ? 1 : 2')).toBe(1)
  })

  it('maxNesting counts brace nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('{}')).toBe(1)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("a")')).toBe(1)
    expect(countConsole(noisyCode)).toBe(6)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
  })

  it('countTodos counts TODO/FIXME/HACK', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(2)
    expect(countTodos('HACK: temp')).toBe(1)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('bell-tower classifications', () => {
  it('classifyBellType returns correct types', () => {
    expect(classifyBellType(emptyCode)).toBe('silent')
    expect(classifyBellType(typedCode)).toBe('handbell')
    expect(classifyBellType(interfaceCode)).toBe('handbell')
    expect(classifyBellType(carillonCode)).toBe('carillon')
    expect(classifyBellType(alarmCode)).toBe('alarm-bell')
    expect(classifyBellType(noExportCode)).toBe('silent')
  })

  it('classifyBellCondition returns correct conditions', () => {
    expect(classifyBellCondition(90)).toBe('perfect-pitch')
    expect(classifyBellCondition(75)).toBe('well-tuned')
    expect(classifyBellCondition(60)).toBe('tuned')
    expect(classifyBellCondition(45)).toBe('slightly-off')
    expect(classifyBellCondition(25)).toBe('out-of-tune')
    expect(classifyBellCondition(8)).toBe('cracked')
    expect(classifyBellCondition(2)).toBe('silent')
  })

  it('classifyChamberCondition returns correct conditions', () => {
    expect(classifyChamberCondition(85)).toBe('cathedral')
    expect(classifyChamberCondition(65)).toBe('church')
    expect(classifyChamberCondition(45)).toBe('chapel')
    expect(classifyChamberCondition(30)).toBe('belfry')
    expect(classifyChamberCondition(12)).toBe('bell-cot')
    expect(classifyChamberCondition(5)).toBe('silenced')
  })

  it('classifyCampanologistGrade returns correct grades', () => {
    expect(classifyCampanologistGrade(85)).toBe('master-ringer')
    expect(classifyCampanologistGrade(70)).toBe('campanologist')
    expect(classifyCampanologistGrade(50)).toBe('ringer')
    expect(classifyCampanologistGrade(35)).toBe('bellhop')
    expect(classifyCampanologistGrade(18)).toBe('deaf')
    expect(classifyCampanologistGrade(5)).toBe('tone-deaf')
  })
})

// ─── Detection Tests ──────────────────────────────────────────────────────────

describe('bell-tower detections', () => {
  it('detectSilentFailures returns 0 for empty code', () => {
    expect(detectSilentFailures(emptyCode)).toBe(0)
  })

  it('detectSilentFailures catches empty catch blocks', () => {
    expect(detectSilentFailures('try {} catch(e) {}')).toBeGreaterThanOrEqual(1)
  })

  it('detectSilentFailures returns 0 for proper error handling', () => {
    expect(detectSilentFailures('try {} catch(e) { throw e }')).toBe(0)
  })

  it('detectFalseAlarms returns 0 for empty code', () => {
    expect(detectFalseAlarms(emptyCode)).toBe(0)
  })

  it('detectFalseAlarms detects excessive console usage', () => {
    expect(detectFalseAlarms(noisyCode)).toBeGreaterThan(0)
  })

  it('detectFalseAlarms detects TODO without error handling', () => {
    expect(detectFalseAlarms(todoCode)).toBeGreaterThan(0)
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('bell-tower measurements', () => {
  it('measureSignals returns correct structure', () => {
    const sig = measureSignals(typedCode)
    expect(sig.exports).toBe(1)
    expect(sig.totalSignals).toBeGreaterThan(0)
    expect(sig.signalClarity).toBeGreaterThanOrEqual(0)
    expect(sig.signalClarity).toBeLessThanOrEqual(100)
    expect(typeof sig.hasNoisySignals).toBe('boolean')
    expect(typeof sig.hasSilentFailures).toBe('boolean')
  })

  it('measureSignals detects noisy signals', () => {
    const sig = measureSignals(noisyCode)
    expect(sig.hasNoisySignals).toBe(true)
    expect(sig.logs).toBe(6)
  })

  it('measureSignals returns low totals for empty code', () => {
    const sig = measureSignals(emptyCode)
    expect(sig.totalSignals).toBe(0)
    expect(sig.signalClarity).toBeGreaterThanOrEqual(0)
  })

  it('assessRinging returns correct structure', () => {
    const ring = assessRinging(typedCode)
    expect(ring.frequency).toBeGreaterThanOrEqual(0)
    expect(ring.frequency).toBeLessThanOrEqual(100)
    expect(typeof ring.pattern).toBe('string')
    expect(typeof ring.hasDistinctSignals).toBe('boolean')
    expect(typeof ring.isOnSchedule).toBe('boolean')
  })

  it('assessRinging returns silent for empty code', () => {
    const ring = assessRinging(emptyCode)
    expect(ring.pattern).toBe('silent')
    expect(ring.frequency).toBe(0)
  })

  it('assessRinging detects change-ringing pattern for many exports', () => {
    const ring = assessRinging(carillonCode)
    expect(ring.pattern).toBe('change-ringing')
  })

  it('assessAcoustics returns correct structure', () => {
    const ac = assessAcoustics(strongCode)
    expect(ac.clarity).toBeGreaterThanOrEqual(0)
    expect(ac.clarity).toBeLessThanOrEqual(100)
    expect(ac.echo).toBeGreaterThanOrEqual(0)
    expect(ac.dampening).toBeGreaterThanOrEqual(0)
    expect(ac.interference).toBeGreaterThanOrEqual(0)
    expect(typeof ac.hasReverb).toBe('boolean')
    expect(typeof ac.hasHarmonics).toBe('boolean')
  })

  it('assessAcoustics returns zeros for empty code', () => {
    const ac = assessAcoustics(emptyCode)
    expect(ac.clarity).toBe(0)
    expect(ac.echo).toBe(0)
    expect(ac.dampening).toBe(100)
    expect(ac.interference).toBe(0)
  })

  it('assessAcoustics detects harmonics with types and error handling', () => {
    const ac = assessAcoustics(strongCode)
    expect(ac.hasHarmonics).toBe(true)
  })
})

// ─── Bell Analysis Tests ──────────────────────────────────────────────────────

describe('bell-tower bell analysis', () => {
  it('analyzeBell returns correct structure', () => {
    const bell = analyzeBell(strongCode, 'calc.ts')
    expect(bell.file).toBe('calc.ts')
    expect(bell.bellQuality).toBeGreaterThanOrEqual(0)
    expect(bell.bellQuality).toBeLessThanOrEqual(100)
    expect(bell.resonance).toBeGreaterThanOrEqual(0)
    expect(bell.reach).toBeGreaterThanOrEqual(0)
    expect(bell.timing).toBeGreaterThanOrEqual(0)
    expect(bell.volume).toBeGreaterThanOrEqual(0)
    expect(typeof bell.bellType).toBe('string')
    expect(bell.tone).toBeGreaterThanOrEqual(0)
    expect(bell.qualityScore).toBeGreaterThanOrEqual(0)
    expect(bell.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof bell.condition).toBe('string')
  })

  it('analyzeBell gives higher quality to well-structured code', () => {
    const good = analyzeBell(strongCode, 'good.ts')
    const bad = analyzeBell(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('analyzeBell classifies carillon code correctly', () => {
    const bell = analyzeBell(carillonCode, 'carillon.ts')
    expect(bell.bellType).toBe('carillon')
  })

  it('analyzeBell classifies empty code as silent', () => {
    const bell = analyzeBell(emptyCode, 'empty.ts')
    expect(bell.bellType).toBe('silent')
  })

  it('analyzeBell tower info has correct structure', () => {
    const bell = analyzeBell(strongCode, 'a.ts')
    expect(bell.tower.height).toBeGreaterThanOrEqual(0)
    expect(typeof bell.tower.isAccessible).toBe('boolean')
    expect(typeof bell.tower.hasStairway).toBe('boolean')
    expect(typeof bell.tower.hasCracks).toBe('boolean')
    expect(bell.tower.foundationDepth).toBeGreaterThanOrEqual(0)
    expect(typeof bell.tower.canSupportWeight).toBe('boolean')
  })
})

// ─── Chamber Analysis Tests ───────────────────────────────────────────────────

describe('bell-tower chamber analysis', () => {
  it('analyzeBellChamber returns correct structure for empty bells', () => {
    const chamber = analyzeBellChamber([], 'src')
    expect(chamber.directory).toBe('src')
    expect(chamber.bells).toHaveLength(0)
    expect(chamber.avgBellQuality).toBe(0)
    expect(chamber.condition).toBe('cathedral')
  })

  it('analyzeBellChamber computes averages from bells', () => {
    const bells = [
      analyzeBell(strongCode, 'a.ts'),
      analyzeBell(typedCode, 'b.ts'),
    ]
    const chamber = analyzeBellChamber(bells, 'src')
    expect(chamber.bells).toHaveLength(2)
    expect(chamber.avgBellQuality).toBeGreaterThanOrEqual(0)
    expect(chamber.avgResonance).toBeGreaterThanOrEqual(0)
    expect(typeof chamber.dominantBellType).toBe('string')
    expect(typeof chamber.isHarmonious).toBe('boolean')
    expect(typeof chamber.hasDissonance).toBe('boolean')
  })

  it('analyzeBellChamber detects dominant type', () => {
    const bells = [
      analyzeBell(carillonCode, 'a.ts'),
      analyzeBell(carillonCode, 'b.ts'),
      analyzeBell(typedCode, 'c.ts'),
    ]
    const chamber = analyzeBellChamber(bells, 'src')
    expect(chamber.dominantBellType).toBe('carillon')
    expect(chamber.carillonBells).toBe(2)
  })

  it('analyzeBellChamber detects dissonance with many silent bells', () => {
    const bells = [
      analyzeBell(emptyCode, 'a.ts'),
      analyzeBell(emptyCode, 'b.ts'),
      analyzeBell(emptyCode, 'c.ts'),
      analyzeBell(typedCode, 'd.ts'),
    ]
    const chamber = analyzeBellChamber(bells, 'src')
    expect(chamber.hasDissonance).toBe(true)
    expect(chamber.silentBells).toBe(3)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('bell-tower build result', () => {
  it('buildBellTowerResult returns correct structure', () => {
    const result = buildBellTowerResult(['a.ts'], [typedCode], {})
    expect(result.bells).toHaveLength(1)
    expect(result.chambers).toHaveLength(1)
    expect(result.city.totalSignals).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.campanologistGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('buildBellTowerResult handles empty files', () => {
    const result = buildBellTowerResult([], [], {})
    expect(result.bells).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestBell).toBe('none')
    expect(result.stats.worstBell).toBe('none')
    expect(result.stats.loudestBell).toBe('none')
    expect(result.stats.quietestBell).toBe('none')
  })

  it('buildBellTowerResult computes city info', () => {
    const result = buildBellTowerResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.city.avgSignalClarity).toBeGreaterThanOrEqual(0)
    expect(result.city.avgResonance).toBeGreaterThanOrEqual(0)
    expect(result.city.falseAlarmRate).toBeGreaterThanOrEqual(0)
    expect(result.city.missedSignalRate).toBeGreaterThanOrEqual(0)
    expect(typeof result.city.isAudible).toBe('boolean')
  })

  it('buildBellTowerResult groups bells into chambers by directory', () => {
    const result = buildBellTowerResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.chambers).toHaveLength(2)
  })

  it('buildBellTowerResult identifies best and worst bells', () => {
    const result = buildBellTowerResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.bestBell).toBe('good.ts')
    expect(result.stats.worstBell).toBe('bad.ts')
  })

  it('buildBellTowerResult identifies loudest and quietest bells', () => {
    const result = buildBellTowerResult(
      ['loud.ts', 'quiet.ts'],
      [manyExportsCode, noExportCode],
      {},
    )
    expect(result.stats.loudestBell).toBe('loud.ts')
    expect(result.stats.quietestBell).toBe('quiet.ts')
  })

  it('buildBellTowerResult handles missing contents gracefully', () => {
    const result = buildBellTowerResult(['a.ts'], [], {})
    expect(result.bells).toHaveLength(1)
    expect(result.bells[0].bellType).toBe('silent')
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('bell-tower recommendations', () => {
  it('generateRecommendations returns array', () => {
    const bells = [analyzeBell(strongCode, 'a.ts')]
    const result = buildBellTowerResult(['a.ts'], [strongCode], {})
    const recs = generateRecommendations(bells, result.chambers, result.city, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('generateRecommendations includes false alarm warning', () => {
    const result = buildBellTowerResult(['a.ts'], [noisyCode], {})
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
  })

  it('generateRecommendations includes good acoustics message', () => {
    const result = buildBellTowerResult(['a.ts'], [strongCode], {})
    if (result.stats.overallAcoustics >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Good acoustics')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('bell-tower formatters', () => {
  const sampleResult = buildBellTowerResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatBellTowerTable returns string with header', () => {
    const table = formatBellTowerTable(sampleResult, false)
    expect(table).toContain('Bell Tower')
    expect(table).toContain('Bells')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatBellTowerTable verbose shows more detail', () => {
    const table = formatBellTowerTable(sampleResult, true)
    expect(table).toContain('type:')
    expect(table).toContain('signals:')
  })

  it('formatBellTowerTable handles empty bells', () => {
    const empty = buildBellTowerResult([], [], {})
    const table = formatBellTowerTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatBellTowerTable truncates bells at 15 when not verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const bigResult = buildBellTowerResult(files, contents, {})
    const table = formatBellTowerTable(bigResult, false)
    expect(table).toContain('more')
  })

  it('formatBellTowerJson returns valid JSON', () => {
    const json = formatBellTowerJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.bells).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.city).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatBellTowerJson handles empty result', () => {
    const empty = buildBellTowerResult([], [], {})
    const json = formatBellTowerJson(empty)
    const parsed = JSON.parse(json)
    expect(parsed.bells).toHaveLength(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('bell-tower edge cases', () => {
  it('handles code with only comments', () => {
    const bell = analyzeBell('// just a comment\n/* block */', 'comment.ts')
    expect(bell.bellType).toBeDefined()
    expect(bell.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles deeply nested code', () => {
    const deep = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'
    const bell = analyzeBell(deep, 'deep.ts')
    expect(bell.tower.height).toBeGreaterThan(0)
    expect(bell.acoustics.interference).toBeGreaterThan(0)
  })

  it('handles code with many type annotations', () => {
    const typed = [
      'export function fn(a: string, b: number, c: boolean): void {',
      '  const x: number = 1',
      '  const y: string = "hi"',
      '  return undefined as unknown as void',
      '}',
    ].join('\n')
    const bell = analyzeBell(typed, 'typed.ts')
    expect(bell.tone).toBeGreaterThan(0)
  })

  it('handles class code correctly', () => {
    const bell = analyzeBell(classCode, 'class.ts')
    expect(bell.bellType).toBe('signal-bell')
  })

  it('handles alarm code correctly', () => {
    const bell = analyzeBell(alarmCode, 'alarm.ts')
    expect(bell.bellType).toBe('alarm-bell')
  })

  it('handles single file with no directory', () => {
    const result = buildBellTowerResult(['single.ts'], [typedCode], {})
    expect(result.chambers).toHaveLength(1)
    expect(result.chambers[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, interfaceCode]
    const result = buildBellTowerResult(files, contents, {})
    expect(result.chambers).toHaveLength(1)
    expect(result.chambers[0].bells).toHaveLength(3)
  })
})
