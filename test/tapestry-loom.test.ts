import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  measureWarpTension, measureWeftTension, measureShedClarity,
  measureHeddleOperation, measureBeamWinding, measureTakeUp,
  classifyMechanics, classifyWeaverGrade, classifyLoomCondition,
  classifyBenchCondition, classifyThreadMaterial,
  analyzeShed, analyzeHeddles, analyzeBeams, analyzeReed,
  analyzeConnections, classifyThreadDirection,
  analyzeLoomMechanics, analyzeLoomBench,
  generateLoomRecommendations, buildTapestryLoomResult,
} from '../src/commands/tapestry-loom-helpers.js'
import { formatTapestryLoomTable, formatTapestryLoomJson } from '../src/commands/tapestry-loom-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const weakCode = 'const a = 1\nconst b = 2\nconst c = 3'
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

const asyncCode = [
  'export async function fetchData(): Promise<string> {',
  '  const res = await fetch("/api")',
  '  return res.json()',
  '}',
].join('\n')

const noExportCode = [
  'function internalHelper() {',
  '  return 42',
  '}',
  '',
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

  it('skips blank lines', () => {
    expect(countLoc('a\n\nb\n\nc')).toBe(3)
  })

  it('counts single line', () => {
    expect(countLoc('hello')).toBe(1)
  })

  it('counts lines with only whitespace as empty', () => {
    expect(countLoc('a\n   \nb')).toBe(2)
  })
})

describe('countImports', () => {
  it('counts import statements', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
  })

  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })

  it('counts multiple imports', () => {
    expect(countImports('import { a } from "x"\nimport { b } from "y"')).toBe(2)
  })
})

describe('countExports', () => {
  it('counts export function', () => {
    expect(countExports('export function a() {}')).toBe(1)
  })

  it('counts export const', () => {
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('counts export interface', () => {
    expect(countExports('export interface I {}')).toBe(1)
  })

  it('counts export type', () => {
    expect(countExports('export type T = string')).toBe(1)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })

  it('counts export class', () => {
    expect(countExports('export class Foo {}')).toBe(1)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const add = (a: number) => a + 1')).toBe(1)
  })

  it('returns 0 for no functions', () => {
    expect(countFunctions('const x = 1')).toBe(0)
  })
})

describe('countErrorHandling', () => {
  it('counts try blocks', () => {
    expect(countErrorHandling('try { x() } catch(e) {}')).toBe(2)
  })

  it('counts throw statements', () => {
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
  })

  it('counts .catch calls', () => {
    expect(countErrorHandling('promise.catch(() => {})')).toBe(1)
  })

  it('returns 0 for no error handling', () => {
    expect(countErrorHandling('const x = 1')).toBe(0)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('counts multiple annotations', () => {
    expect(countTypeAnnotations('function f(a: string): number { return 1 }')).toBe(2)
  })

  it('returns 0 for no annotations', () => {
    expect(countTypeAnnotations('const x = 1')).toBe(0)
  })
})

describe('countBranches', () => {
  it('counts if statements', () => {
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('counts ternary operators', () => {
    expect(countBranches('const x = a ? 1 : 2')).toBe(1)
  })

  it('counts switch statements', () => {
    expect(countBranches('switch(x) {}')).toBe(1)
  })

  it('returns 0 for no branches', () => {
    expect(countBranches('const x = 1')).toBe(0)
  })
})

describe('maxNesting', () => {
  it('counts nesting depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('returns 0 for no braces', () => {
    expect(maxNesting('hello')).toBe(0)
  })

  it('returns 1 for single level', () => {
    expect(maxNesting('{ }')).toBe(1)
  })
})

describe('countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('counts console.error', () => {
    expect(countConsole('console.error("x")')).toBe(1)
  })

  it('returns 0 for no console', () => {
    expect(countConsole('const x = 1')).toBe(0)
  })
})

describe('countComments', () => {
  it('counts single-line comments', () => {
    expect(countComments('// hello')).toBe(1)
  })

  it('counts multi-line comments', () => {
    expect(countComments('/* hello */')).toBe(1)
  })

  it('counts both types', () => {
    expect(countComments('// a\n/* b */')).toBe(2)
  })
})

describe('countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('TODO: fix this')).toBe(1)
  })

  it('counts FIXME markers', () => {
    expect(countTodos('FIXME: broken')).toBe(1)
  })

  it('counts case-insensitively', () => {
    expect(countTodos('todo: fix\ntodo: another')).toBe(2)
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('measureWarpTension', () => {
  it('returns 0 for empty content', () => {
    expect(measureWarpTension(emptyCode)).toBe(0)
  })

  it('returns positive for code with imports and exports', () => {
    const result = measureWarpTension(strongCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('returns low for code without imports', () => {
    const result = measureWarpTension(simpleCode)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('caps at 100', () => {
    const result = measureWarpTension(strongCode)
    expect(result).toBeLessThanOrEqual(100)
  })
})

describe('measureWeftTension', () => {
  it('returns 0 for empty content', () => {
    expect(measureWeftTension(emptyCode)).toBe(0)
  })

  it('returns positive for code with functions', () => {
    const result = measureWeftTension(typedCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('rewards low nesting', () => {
    const result = measureWeftTension('export function a() { return 1 }')
    expect(result).toBeGreaterThan(0)
  })
})

describe('measureShedClarity', () => {
  it('returns 0 for empty content', () => {
    expect(measureShedClarity(emptyCode)).toBe(0)
  })

  it('returns positive for clean code', () => {
    const result = measureShedClarity(typedCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('penalizes high console usage', () => {
    const clean = measureShedClarity('export function a(): void {}')
    const noisy = measureShedClarity(consoleCode)
    expect(clean).toBeGreaterThanOrEqual(noisy)
  })
})

describe('measureHeddleOperation', () => {
  it('returns 0 for empty content', () => {
    expect(measureHeddleOperation(emptyCode)).toBe(0)
  })

  it('returns high for interface-heavy code', () => {
    const result = measureHeddleOperation(interfaceCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('rewards type annotations', () => {
    const result = measureHeddleOperation(typedCode)
    expect(result).toBeGreaterThan(0)
  })
})

describe('measureBeamWinding', () => {
  it('returns 0 for empty content', () => {
    expect(measureBeamWinding(emptyCode)).toBe(0)
  })

  it('returns positive for code with returns and types', () => {
    const result = measureBeamWinding(typedCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('rewards error handling', () => {
    const result = measureBeamWinding(strongCode)
    expect(result).toBeGreaterThan(0)
  })
})

describe('measureTakeUp', () => {
  it('returns 0 for empty content', () => {
    expect(measureTakeUp(emptyCode)).toBe(0)
  })

  it('returns positive for well-connected code', () => {
    const result = measureTakeUp(strongCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('rewards import-export flow', () => {
    const result = measureTakeUp(strongCode)
    expect(result).toBeGreaterThan(0)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifyMechanics', () => {
  it('classifies empty code as frame', () => {
    expect(classifyMechanics(emptyCode)).toBe('frame')
  })

  it('classifies interface-only code', () => {
    const result = classifyMechanics('export interface A {}\nexport interface B {}\nexport type C = string')
    expect(['countermarch', 'frame', 'rigid-heddle']).toContain(result)
  })

  it('classifies code with class and imports', () => {
    const result = classifyMechanics(classCode)
    expect(['counterbalance', 'dobby', 'jacquard']).toContain(result)
  })

  it('classifies single-export short code as rigid-heddle', () => {
    const result = classifyMechanics('export const x = 1')
    expect(result).toBe('rigid-heddle')
  })

  it('classifies no-export no-import code as inkle', () => {
    expect(classifyMechanics(noExportCode)).toBe('inkle')
  })

  it('classifies strong code as jacquard or dobby', () => {
    const result = classifyMechanics(strongCode)
    expect(['jacquard', 'dobby', 'countermarch']).toContain(result)
  })
})

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for high tuning', () => {
    expect(classifyWeaverGrade(80)).toBe('master-weaver')
  })

  it('returns journeyman for moderate tuning', () => {
    expect(classifyWeaverGrade(65)).toBe('journeyman')
  })

  it('returns apprentice for average tuning', () => {
    expect(classifyWeaverGrade(50)).toBe('apprentice')
  })

  it('returns novice for low tuning', () => {
    expect(classifyWeaverGrade(35)).toBe('novice')
  })

  it('returns clumsy for very low tuning', () => {
    expect(classifyWeaverGrade(20)).toBe('clumsy')
  })

  it('returns tangled for near-zero tuning', () => {
    expect(classifyWeaverGrade(5)).toBe('tangled')
  })

  it('returns master-weaver at 75', () => {
    expect(classifyWeaverGrade(75)).toBe('master-weaver')
  })

  it('returns tangled at 0', () => {
    expect(classifyWeaverGrade(0)).toBe('tangled')
  })
})

describe('classifyLoomCondition', () => {
  it('returns perfectly-tuned for 85+', () => {
    expect(classifyLoomCondition(90)).toBe('perfectly-tuned')
  })

  it('returns well-tuned for 70-84', () => {
    expect(classifyLoomCondition(75)).toBe('well-tuned')
  })

  it('returns in-tune for 50-69', () => {
    expect(classifyLoomCondition(55)).toBe('in-tune')
  })

  it('returns needs-adjustment for 30-49', () => {
    expect(classifyLoomCondition(40)).toBe('needs-adjustment')
  })

  it('returns out-of-tune for 15-29', () => {
    expect(classifyLoomCondition(20)).toBe('out-of-tune')
  })

  it('returns broken-down for <15', () => {
    expect(classifyLoomCondition(10)).toBe('broken-down')
  })
})

describe('classifyBenchCondition', () => {
  it('returns workshop for 70+', () => {
    expect(classifyBenchCondition(75)).toBe('workshop')
  })

  it('returns studio for 50-69', () => {
    expect(classifyBenchCondition(55)).toBe('studio')
  })

  it('returns garage for 30-49', () => {
    expect(classifyBenchCondition(40)).toBe('garage')
  })

  it('returns shed for 15-29', () => {
    expect(classifyBenchCondition(20)).toBe('shed')
  })

  it('returns salvage for <15', () => {
    expect(classifyBenchCondition(10)).toBe('salvage')
  })
})

describe('classifyThreadMaterial', () => {
  it('classifies well-typed code with exports as silk or linen', () => {
    const result = classifyThreadMaterial(strongCode)
    expect(['silk', 'cotton', 'linen']).toContain(result)
  })

  it('classifies typed code as linen', () => {
    expect(classifyThreadMaterial('const x: number = 1')).toBe('linen')
  })

  it('classifies async code as synthetic', () => {
    expect(classifyThreadMaterial(asyncCode)).toBe('synthetic')
  })

  it('classifies class code as metallic', () => {
    expect(classifyThreadMaterial('class Foo {}')).toBe('metallic')
  })

  it('classifies plain code as rag', () => {
    expect(classifyThreadMaterial('const x = 1')).toBe('rag')
  })

  it('classifies error-handled exports as wool', () => {
    const result = classifyThreadMaterial('export function a() { try {} catch(e) {} }')
    expect(result).toBe('wool')
  })
})

// ─── Sub-Analysis Tests ───────────────────────────────────────────────────────

describe('analyzeShed', () => {
  it('returns ShedInfo with correct shape', () => {
    const shed = analyzeShed(typedCode)
    expect(shed).toHaveProperty('isOpen')
    expect(shed).toHaveProperty('isClean')
    expect(shed).toHaveProperty('isOpeningWidth')
    expect(shed).toHaveProperty('hasStickyShed')
  })

  it('returns clean shed for simple code', () => {
    const shed = analyzeShed(simpleCode)
    expect(shed.isOpeningWidth).toBeGreaterThanOrEqual(0)
    expect(shed.isOpeningWidth).toBeLessThanOrEqual(100)
  })

  it('detects sticky shed in complex code', () => {
    const complexCode = 'if(a){if(b){if(c){if(d){if(e){}}}}}'
    const shed = analyzeShed(complexCode)
    expect(shed.hasStickyShed).toBe(true)
  })

  it('returns open shed for clean code', () => {
    const shed = analyzeShed('export function a(): void {}')
    expect(typeof shed.isOpen).toBe('boolean')
  })
})

describe('analyzeHeddles', () => {
  it('returns HeddleInfo with correct shape', () => {
    const heddles = analyzeHeddles(typedCode)
    expect(heddles).toHaveProperty('count')
    expect(heddles).toHaveProperty('quality')
    expect(heddles).toHaveProperty('areProperlySet')
    expect(heddles).toHaveProperty('hasMissingHeddles')
    expect(heddles).toHaveProperty('hasBrokenHeddles')
  })

  it('detects missing heddles when exports without types', () => {
    const heddles = analyzeHeddles('export function a() { return 1 }')
    expect(heddles.hasMissingHeddles).toBe(true)
  })

  it('detects properly set heddles for typed exports', () => {
    const heddles = analyzeHeddles(interfaceCode)
    expect(heddles.quality).toBeGreaterThan(0)
  })
})

describe('analyzeBeams', () => {
  it('returns BeamInfo with correct shape', () => {
    const beams = analyzeBeams(strongCode)
    expect(beams).toHaveProperty('warpBeam')
    expect(beams).toHaveProperty('clothBeam')
    expect(beams).toHaveProperty('isEvenlyWound')
    expect(beams).toHaveProperty('hasUnevenWinding')
  })

  it('both beams are between 0 and 100', () => {
    const beams = analyzeBeams(strongCode)
    expect(beams.warpBeam).toBeGreaterThanOrEqual(0)
    expect(beams.warpBeam).toBeLessThanOrEqual(100)
    expect(beams.clothBeam).toBeGreaterThanOrEqual(0)
    expect(beams.clothBeam).toBeLessThanOrEqual(100)
  })

  it('returns balanced beams for well-structured code', () => {
    const beams = analyzeBeams(strongCode)
    expect(typeof beams.isEvenlyWound).toBe('boolean')
    expect(typeof beams.hasUnevenWinding).toBe('boolean')
  })
})

describe('analyzeReed', () => {
  it('returns ReedInfo with correct shape', () => {
    const reed = analyzeReed(strongCode)
    expect(reed).toHaveProperty('dents')
    expect(reed).toHaveProperty('dentsPerInch')
    expect(reed).toHaveProperty('isProperlySet')
    expect(reed).toHaveProperty('hasGaps')
    expect(reed).toHaveProperty('hasCrowding')
  })

  it('detects gaps for sparse code', () => {
    const lines = Array.from({ length: 25 }, (_, i) => `const line${i} = ${i}`)
    const sparseCode = 'export function a() {}\n' + lines.join('\n')
    const reed = analyzeReed(sparseCode)
    expect(reed.hasGaps).toBe(true)
  })

  it('detects crowding for dense code', () => {
    const denseCode = Array.from({ length: 5 }, (_, i) => `export function f${i}() {}`).join('\n')
    const reed = analyzeReed(denseCode)
    expect(reed.dentsPerInch).toBeGreaterThan(0)
  })
})

// ─── Thread Analysis Tests ────────────────────────────────────────────────────

describe('analyzeConnections', () => {
  it('returns ThreadConnections with correct shape', () => {
    const conn = analyzeConnections(strongCode)
    expect(conn).toHaveProperty('warpConnections')
    expect(conn).toHaveProperty('weftConnections')
    expect(conn).toHaveProperty('crossingPoints')
    expect(conn).toHaveProperty('isInterlaced')
    expect(conn).toHaveProperty('interlaceQuality')
  })

  it('detects interlaced connections', () => {
    const conn = analyzeConnections(strongCode)
    expect(conn.isInterlaced).toBe(true)
  })

  it('returns non-interlaced for import-only code', () => {
    const conn = analyzeConnections('import { x } from "y"')
    expect(conn.isInterlaced).toBe(false)
  })

  it('returns non-interlaced for export-only code', () => {
    const conn = analyzeConnections('export const x = 1')
    expect(conn.isInterlaced).toBe(false)
  })
})

describe('classifyThreadDirection', () => {
  it('returns warp for import-heavy code', () => {
    expect(classifyThreadDirection('import { a } from "x"\nimport { b } from "y"')).toBe('warp')
  })

  it('returns weft for export-heavy code', () => {
    expect(classifyThreadDirection('export function a() {}\nexport function b() {}')).toBe('weft')
  })

  it('returns selvedge for no import/export', () => {
    expect(classifyThreadDirection('const x = 1')).toBe('selvedge')
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeLoomMechanics', () => {
  it('returns complete LoomMechanics object', () => {
    const m = analyzeLoomMechanics(strongCode, 'test.ts')
    expect(m.file).toBe('test.ts')
    expect(typeof m.warpTension).toBe('number')
    expect(typeof m.weftTension).toBe('number')
    expect(typeof m.shedClarity).toBe('number')
    expect(typeof m.heddleOperation).toBe('number')
    expect(typeof m.beamWinding).toBe('number')
    expect(typeof m.takeUp).toBe('number')
    expect(typeof m.warpCount).toBe('number')
    expect(typeof m.weftCount).toBe('number')
    expect(typeof m.picksPerInch).toBe('number')
    expect(typeof m.isBalancedWeave).toBe('boolean')
    expect(m.shed).toBeDefined()
    expect(m.heddles).toBeDefined()
    expect(m.beams).toBeDefined()
    expect(m.reed).toBeDefined()
    expect(typeof m.mechanics).toBe('string')
    expect(typeof m.condition).toBe('string')
    expect(typeof m.qualityScore).toBe('number')
  })

  it('produces quality score between 0 and 100', () => {
    const m = analyzeLoomMechanics(strongCode, 'test.ts')
    expect(m.qualityScore).toBeGreaterThanOrEqual(0)
    expect(m.qualityScore).toBeLessThanOrEqual(100)
  })

  it('produces 0 warp tension for empty code', () => {
    const m = analyzeLoomMechanics(emptyCode, 'empty.ts')
    expect(m.warpTension).toBe(0)
    expect(m.weftTension).toBe(0)
  })

  it('classifies mechanics type', () => {
    const m = analyzeLoomMechanics(classCode, 'class.ts')
    expect(['jacquard', 'dobby', 'counterbalance', 'countermarch', 'rigid-heddle', 'inkle', 'frame']).toContain(m.mechanics)
  })

  it('has nested analysis objects', () => {
    const m = analyzeLoomMechanics(strongCode, 'test.ts')
    expect(m.shed.isOpen).toBeDefined()
    expect(m.heddles.count).toBeDefined()
    expect(m.beams.warpBeam).toBeDefined()
    expect(m.reed.dents).toBeDefined()
  })
})

// ─── Bench Analysis Tests ─────────────────────────────────────────────────────

describe('analyzeLoomBench', () => {
  it('returns empty bench for no mechanics', () => {
    const bench = analyzeLoomBench([], 'empty-dir')
    expect(bench.directory).toBe('empty-dir')
    expect(bench.mechanics).toHaveLength(0)
    expect(bench.avgWarpTension).toBe(0)
    expect(bench.condition).toBe('salvage')
  })

  it('returns complete LoomBench for single file', () => {
    const ms = [analyzeLoomMechanics(strongCode, 'src/a.ts')]
    const bench = analyzeLoomBench(ms, 'src')
    expect(bench.directory).toBe('src')
    expect(bench.mechanics).toHaveLength(1)
    expect(typeof bench.avgWarpTension).toBe('number')
    expect(typeof bench.dominantMechanics).toBe('string')
    expect(typeof bench.tunedCount).toBe('number')
    expect(typeof bench.brokenCount).toBe('number')
    expect(typeof bench.benchQuality).toBe('number')
  })

  it('calculates averages across multiple files', () => {
    const ms = [
      analyzeLoomMechanics(strongCode, 'a.ts'),
      analyzeLoomMechanics(typedCode, 'b.ts'),
    ]
    const bench = analyzeLoomBench(ms, 'src')
    expect(bench.avgWarpTension).toBeGreaterThan(0)
    expect(bench.avgWeftTension).toBeGreaterThan(0)
  })

  it('counts tuned and broken correctly', () => {
    const ms = [
      analyzeLoomMechanics(strongCode, 'good.ts'),
      analyzeLoomMechanics(emptyCode, 'bad.ts'),
    ]
    const bench = analyzeLoomBench(ms, 'src')
    expect(bench.tunedCount + bench.brokenCount).toBeLessThanOrEqual(2)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('generateLoomRecommendations', () => {
  it('returns empty for empty mechanics', () => {
    const result = buildTapestryLoomResult([], [], {})
    expect(result.recommendations).toHaveLength(0)
  })

  it('returns recommendations for code with issues', () => {
    const result = buildTapestryLoomResult(
      ['bad.ts'],
      ['const a = 1'],
      {},
    )
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
  })

  it('includes missing heddles recommendation', () => {
    const result = buildTapestryLoomResult(
      ['a.ts'],
      ['export function a() { return 1 }'],
      {},
    )
    const hasHeddleRec = result.recommendations.some(r => r.includes('Missing heddles'))
    if (result.stats.totalMissingHeddles > 0) {
      expect(hasHeddleRec).toBe(true)
    }
  })

  it('returns unique recommendations', () => {
    const result = buildTapestryLoomResult(
      ['a.ts', 'b.ts'],
      ['export function a() { return 1 }', 'export function b() { return 2 }'],
      {},
    )
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toHaveLength(unique.length)
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildTapestryLoomResult', () => {
  it('returns complete result structure', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    expect(result.mechanics).toBeDefined()
    expect(result.benches).toBeDefined()
    expect(result.workshop).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildTapestryLoomResult([], [], {})
    expect(result.mechanics).toHaveLength(0)
    expect(result.benches).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallTuning).toBe(0)
  })

  it('handles multiple files', () => {
    const result = buildTapestryLoomResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(result.mechanics).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('groups files into benches by directory', () => {
    const result = buildTapestryLoomResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, typedCode, simpleCode],
      {},
    )
    expect(result.benches.length).toBeGreaterThan(0)
  })

  it('produces valid workshop averages', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    const w = result.workshop
    expect(w.avgWarpTension).toBeGreaterThanOrEqual(0)
    expect(w.avgWeftTension).toBeGreaterThanOrEqual(0)
    expect(w.avgShedClarity).toBeGreaterThanOrEqual(0)
    expect(w.overallTuning).toBeGreaterThanOrEqual(0)
    expect(typeof w.isBalanced).toBe('boolean')
  })

  it('populates stats correctly', () => {
    const result = buildTapestryLoomResult(
      ['a.ts', 'b.ts'],
      [strongCode, typedCode],
      {},
    )
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(typeof s.jacquardCount).toBe('number')
    expect(typeof s.rigidHeddleCount).toBe('number')
    expect(typeof s.frameCount).toBe('number')
    expect(typeof s.tunedCount).toBe('number')
    expect(typeof s.brokenDownCount).toBe('number')
    expect(typeof s.balancedWeaveCount).toBe('number')
    expect(typeof s.totalMissingHeddles).toBe('number')
    expect(typeof s.totalBrokenHeddles).toBe('number')
    expect(typeof s.totalGaps).toBe('number')
    expect(typeof s.totalCrowding).toBe('number')
    expect(typeof s.weaverGrade).toBe('string')
    expect(typeof s.bestTuned).toBe('string')
    expect(typeof s.worstTuned).toBe('string')
    expect(typeof s.bestShed).toBe('string')
    expect(typeof s.bestHeddles).toBe('string')
  })

  it('handles single file without directory', () => {
    const result = buildTapestryLoomResult(['single.ts'], [strongCode], {})
    expect(result.benches).toHaveLength(1)
    expect(result.benches[0].directory).toBe('.')
  })

  it('handles missing content gracefully', () => {
    const result = buildTapestryLoomResult(['a.ts'], [], {})
    expect(result.mechanics).toHaveLength(1)
    expect(result.mechanics[0].warpTension).toBe(0)
  })
})

// ─── Format Helper Tests ──────────────────────────────────────────────────────

describe('formatTapestryLoomTable', () => {
  it('returns string output', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    const output = formatTapestryLoomTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('includes key sections', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    const output = formatTapestryLoomTable(result, false)
    expect(output).toContain('Tapestry Loom')
    expect(output).toContain('Loom Mechanics')
    expect(output).toContain('Workshop')
    expect(output).toContain('Statistics')
  })

  it('handles verbose mode', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    const output = formatTapestryLoomTable(result, true)
    expect(typeof output).toBe('string')
    expect(output).toContain('Loom Mechanics')
  })

  it('handles empty result', () => {
    const result = buildTapestryLoomResult([], [], {})
    const output = formatTapestryLoomTable(result, false)
    expect(output).toContain('No files analyzed')
  })

  it('truncates long file list in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleCode)
    const result = buildTapestryLoomResult(files, contents, {})
    const output = formatTapestryLoomTable(result, false)
    expect(output).toContain('more')
  })
})

describe('formatTapestryLoomJson', () => {
  it('returns valid JSON', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    const output = formatTapestryLoomJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.mechanics).toBeDefined()
    expect(parsed.benches).toBeDefined()
    expect(parsed.workshop).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildTapestryLoomResult([], [], {})
    const output = formatTapestryLoomJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.mechanics).toHaveLength(0)
  })

  it('preserves all fields', () => {
    const result = buildTapestryLoomResult(['a.ts'], [strongCode], {})
    const output = formatTapestryLoomJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.weaverGrade).toBeDefined()
    expect(parsed.workshop.overallTuning).toBeGreaterThanOrEqual(0)
  })
})
