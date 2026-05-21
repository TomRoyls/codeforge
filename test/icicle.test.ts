import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifyDropType, classifyIceType, classifyDropCondition,
  classifySheetType, classifySheetCondition, classifyCryologistGrade,
  measureChainDepth, detectWeakPoints, detectFissures, detectAirPockets,
  assessMeltingRisk, analyzeIcicleDrop, analyzeIceSheet,
  generateRecommendations, buildIcicleResult,
} from '../src/commands/icicle-helpers.js'
import { formatIcicleTable, formatIcicleJson } from '../src/commands/icicle-format-helpers.js'

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

const manyImportsCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
  'const x = 1',
].join('\n')

const todoCode = [
  'function a() { /* TODO: fix */ }',
  '// FIXME: broken',
  '// HACK: workaround',
  'const b = 2',
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
    expect(countImports(strongCode)).toBe(2)
  })
  it('returns 0 for no imports', () => {
    expect(countImports(simpleCode)).toBe(0)
  })
})

describe('countExports', () => {
  it('counts export statements', () => {
    expect(countExports(interfaceCode)).toBe(3)
  })
})

describe('countFunctions', () => {
  it('counts functions', () => {
    expect(countFunctions('function a() {}')).toBe(1)
  })
})

describe('countErrorHandling', () => {
  it('counts error handling', () => {
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })
})

describe('countTypeAnnotations', () => {
  it('counts types', () => {
    expect(countTypeAnnotations(typedCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countBranches', () => {
  it('counts branches', () => {
    expect(countBranches(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('maxNesting', () => {
  it('measures depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
})

describe('countConsole', () => {
  it('counts console', () => {
    expect(countConsole(consoleCode)).toBe(4)
  })
})

describe('countComments', () => {
  it('counts comments', () => {
    expect(countComments('// a\n/* b */')).toBeGreaterThanOrEqual(2)
  })
})

describe('countTodos', () => {
  it('counts TODOs', () => {
    expect(countTodos('TODO: fix\nFIXME: x')).toBeGreaterThanOrEqual(2)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifyDropType', () => {
  it('returns hoarfrost for simple code', () => {
    expect(classifyDropType(simpleCode)).toBe('hoarfrost')
  })
  it('returns column for code with imports and exports', () => {
    expect(classifyDropType(strongCode)).toBe('column')
  })
  it('returns stalactite for many imports', () => {
    expect(classifyDropType(manyImportsCode)).toBe('stalactite')
  })
  it('returns stalagmite for exports only', () => {
    expect(classifyDropType(interfaceCode)).toBe('stalagmite')
  })
  it('returns straw for single import', () => {
    expect(classifyDropType('import { x } from "y"')).toBe('straw')
  })
})

describe('classifyIceType', () => {
  it('returns clear-ice for high clarity low temp', () => {
    expect(classifyIceType(80, 20)).toBe('clear-ice')
  })
  it('returns glaze-ice for medium clarity', () => {
    expect(classifyIceType(55, 30)).toBe('glaze-ice')
  })
  it('returns black-ice for very high temp', () => {
    expect(classifyIceType(20, 75)).toBe('black-ice')
  })
  it('returns frost for very low clarity', () => {
    expect(classifyIceType(5, 10)).toBe('frost')
  })
})

describe('classifyDropCondition', () => {
  it('returns solid for 80+', () => { expect(classifyDropCondition(85)).toBe('solid') })
  it('returns stable for 65+', () => { expect(classifyDropCondition(70)).toBe('stable') })
  it('returns firm for 50+', () => { expect(classifyDropCondition(55)).toBe('firm') })
  it('returns soft for 35+', () => { expect(classifyDropCondition(40)).toBe('soft') })
  it('returns melting for 20+', () => { expect(classifyDropCondition(25)).toBe('melting') })
  it('returns dripping for 5+', () => { expect(classifyDropCondition(10)).toBe('dripping') })
  it('returns evaporated for low', () => { expect(classifyDropCondition(2)).toBe('evaporated') })
})

describe('classifySheetType', () => {
  it('returns glacier for many drops with good health', () => {
    expect(classifySheetType(12, 70)).toBe('glacier')
  })
  it('returns ice-shelf for moderate drops', () => {
    expect(classifySheetType(7, 50)).toBe('ice-shelf')
  })
  it('returns polynya for low health', () => {
    expect(classifySheetType(1, 20)).toBe('polynya')
  })
  it('returns frazil for single healthy drop', () => {
    expect(classifySheetType(1, 80)).toBe('frazil')
  })
})

describe('classifySheetCondition', () => {
  it('returns permafrost for 80+', () => { expect(classifySheetCondition(85)).toBe('permafrost') })
  it('returns frozen-solid for 65+', () => { expect(classifySheetCondition(70)).toBe('frozen-solid') })
  it('returns stable for 45+', () => { expect(classifySheetCondition(50)).toBe('stable') })
  it('returns runoff for low', () => { expect(classifySheetCondition(5)).toBe('runoff') })
})

describe('classifyCryologistGrade', () => {
  it('returns glaciologist for 80+', () => { expect(classifyCryologistGrade(85)).toBe('glaciologist') })
  it('returns cryologist for 65+', () => { expect(classifyCryologistGrade(70)).toBe('cryologist') })
  it('returns ice-climber for 45+', () => { expect(classifyCryologistGrade(50)).toBe('ice-climber') })
  it('returns volcano for low', () => { expect(classifyCryologistGrade(5)).toBe('volcano') })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('measureChainDepth', () => {
  it('returns zeros for empty code', () => {
    const c = measureChainDepth('')
    expect(c.depth).toBe(0)
    expect(c.imports).toEqual([])
    expect(c.isLeaf).toBe(true)
    expect(c.isRoot).toBe(true)
  })
  it('measures chain for typed code', () => {
    const c = measureChainDepth(strongCode)
    expect(c.depth).toBeGreaterThan(0)
    expect(c.imports.length).toBe(2)
    expect(c.transitiveImports).toBeGreaterThan(0)
  })
  it('identifies leaf vs root', () => {
    expect(measureChainDepth(noExportCode).isLeaf).toBe(true)
    expect(measureChainDepth(noExportCode).isRoot).toBe(true)
    expect(measureChainDepth('const x = 1').isLeaf).toBe(true)
    expect(measureChainDepth('const x = 1').isRoot).toBe(true)
  })
})

describe('detectWeakPoints', () => {
  it('returns 0 for empty code', () => {
    expect(detectWeakPoints('')).toBe(0)
  })
  it('returns 0 for simple code', () => {
    expect(detectWeakPoints(simpleCode)).toBe(0)
  })
  it('detects weak points from deep nesting', () => {
    const nested = 'function a() { if (x) { if (y) { if (z) { if (w) { if (v) {} } } } } }'
    expect(detectWeakPoints(nested)).toBeGreaterThan(0)
  })
})

describe('detectFissures', () => {
  it('returns 0 for empty code', () => {
    expect(detectFissures('')).toBe(0)
  })
  it('detects fissures from TODOs', () => {
    expect(detectFissures(todoCode)).toBeGreaterThan(0)
  })
})

describe('detectAirPockets', () => {
  it('returns 0 for empty code', () => {
    expect(detectAirPockets('')).toBe(0)
  })
  it('returns 0 for simple code', () => {
    expect(detectAirPockets(simpleCode)).toBe(0)
  })
  it('detects air pockets for long no-export code', () => {
    const longCode = Array.from({ length: 30 }, (_, i) => `const v${i} = ${i}`).join('\n')
    expect(detectAirPockets(longCode)).toBeGreaterThan(0)
  })
})

describe('assessMeltingRisk', () => {
  it('returns zero risk for empty code', () => {
    const m = assessMeltingRisk('')
    expect(m.risk).toBe(0)
    expect(m.hasDrips).toBe(false)
  })
  it('detects drips from TODOs', () => {
    const m = assessMeltingRisk(todoCode)
    expect(m.hasDrips).toBe(true)
    expect(m.dripPoints.length).toBeGreaterThan(0)
  })
  it('detects permafrost for stable code', () => {
    const m = assessMeltingRisk('export function a(): number { return 1 }')
    expect(m.isPermafrost).toBe(true)
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeIcicleDrop', () => {
  it('returns valid drop for empty code', () => {
    const d = analyzeIcicleDrop('', 'empty.ts')
    expect(d.file).toBe('empty.ts')
    expect(d.icicleLength).toBe(0)
    expect(d.thickness).toBeGreaterThanOrEqual(0)
    expect(d.qualityScore).toBeGreaterThanOrEqual(0)
    expect(typeof d.condition).toBe('string')
  })

  it('returns valid drop for typed code', () => {
    const d = analyzeIcicleDrop(typedCode, 'calc.ts')
    expect(d.file).toBe('calc.ts')
    expect(d.chain).toBeDefined()
    expect(d.formation).toBeDefined()
    expect(d.structural).toBeDefined()
    expect(d.melting).toBeDefined()
  })

  it('gives higher quality for strong code vs simple', () => {
    const strong = analyzeIcicleDrop(strongCode, 'strong.ts')
    const simple = analyzeIcicleDrop(simpleCode, 'simple.ts')
    expect(strong.qualityScore).toBeGreaterThan(simple.qualityScore)
  })

  it('populates all sub-objects', () => {
    const d = analyzeIcicleDrop(strongCode, 'strong.ts')
    expect(typeof d.chain.depth).toBe('number')
    expect(typeof d.formation.rate).toBe('number')
    expect(typeof d.structural.loadBearingCapacity).toBe('number')
    expect(typeof d.melting.risk).toBe('number')
  })
})

// ─── Sheet Analysis Tests ─────────────────────────────────────────────────────

describe('analyzeIceSheet', () => {
  it('returns valid sheet for empty drops', () => {
    const s = analyzeIceSheet([], 'empty')
    expect(s.directory).toBe('empty')
    expect(s.sheetHealth).toBe(100)
    expect(s.condition).toBe('permafrost')
  })

  it('returns valid sheet for drops', () => {
    const drops = [
      analyzeIcicleDrop(strongCode, 'strong.ts'),
      analyzeIcicleDrop(simpleCode, 'simple.ts'),
    ]
    const s = analyzeIceSheet(drops, 'src')
    expect(s.drops.length).toBe(2)
    expect(s.avgThickness).toBeGreaterThanOrEqual(0)
    expect(typeof s.condition).toBe('string')
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns array', () => {
    const recs = generateRecommendations([], [], {
      totalDepth: 0, avgLength: 0, avgThickness: 0, avgClarity: 0,
      avgTemperature: 0, maxChainDepth: 0, circularChains: 0,
      totalWeakPoints: 0, overallStability: 80,
    }, {
      totalFiles: 0, totalSheets: 0, avgIcicleLength: 0, avgThickness: 0,
      avgClarity: 0, avgTemperature: 0, avgDripRate: 0, avgFragility: 0,
      maxChainDepth: 0, avgChainDepth: 0, leafFiles: 0, rootFiles: 0,
      circularFiles: 0, clearIceFiles: 0, blackIceFiles: 0,
      solidCount: 0, meltingCount: 0, evaporatedCount: 0,
      totalWeakPoints: 0, totalFissures: 0, totalAirPockets: 0,
      growingChains: 0, stableChains: 0, meltingChains: 0,
      overallStability: 80, cryologistGrade: 'glaciologist',
      deepestChain: 'none', thinnestChain: 'none',
      clearestChain: 'none', mostFragile: 'none', mostStable: 'none',
    })
    expect(Array.isArray(recs)).toBe(true)
    expect(recs).toContain('Stable ice: the dependency glacier is structurally sound')
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildIcicleResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildIcicleResult([], [], {})
    expect(result.drops).toEqual([])
    expect(result.sheets).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns valid result for single file', () => {
    const result = buildIcicleResult(['a.ts'], [typedCode], {})
    expect(result.drops.length).toBe(1)
    expect(result.drops[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('returns valid result for multiple files', () => {
    const result = buildIcicleResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [strongCode, simpleCode, classCode],
      {},
    )
    expect(result.drops.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.deepestChain).toBeTruthy()
    expect(result.stats.thinnestChain).toBeTruthy()
    expect(result.stats.clearestChain).toBeTruthy()
    expect(result.stats.mostFragile).toBeTruthy()
    expect(result.stats.mostStable).toBeTruthy()
  })

  it('groups files by directory', () => {
    const result = buildIcicleResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [simpleCode, simpleCode, simpleCode],
      {},
    )
    expect(result.sheets.length).toBe(2)
  })

  it('computes glacier stats', () => {
    const result = buildIcicleResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.glacier.avgThickness).toBeGreaterThanOrEqual(0)
    expect(typeof result.glacier.overallStability).toBe('number')
  })

  it('populates all stats fields', () => {
    const result = buildIcicleResult(['a.ts'], [strongCode], {})
    const s = result.stats
    expect(s.avgDripRate).toBeGreaterThanOrEqual(0)
    expect(s.avgFragility).toBeGreaterThanOrEqual(0)
    expect(typeof s.cryologistGrade).toBe('string')
    expect(s.overallStability).toBeGreaterThanOrEqual(0)
    expect(s.leafFiles).toBeGreaterThanOrEqual(0)
    expect(s.growingChains).toBeGreaterThanOrEqual(0)
  })

  it('handles corrupt content gracefully', () => {
    const result = buildIcicleResult(['bad.ts'], [''], {})
    expect(result.drops.length).toBe(1)
    expect(result.drops[0].file).toBe('bad.ts')
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('formatIcicleTable', () => {
  it('returns formatted string', () => {
    const result = buildIcicleResult(['a.ts'], [typedCode], {})
    const output = formatIcicleTable(result, false)
    expect(output).toContain('Icicle')
    expect(output).toContain('a.ts')
  })

  it('includes details in verbose mode', () => {
    const result = buildIcicleResult(['a.ts'], [strongCode], {})
    const output = formatIcicleTable(result, true)
    expect(output).toContain('type:')
    expect(output).toContain('chain:')
  })

  it('handles empty results', () => {
    const result = buildIcicleResult([], [], {})
    const output = formatIcicleTable(result, false)
    expect(output).toContain('No files analyzed')
  })
})

describe('formatIcicleJson', () => {
  it('returns valid JSON string', () => {
    const result = buildIcicleResult(['a.ts'], [typedCode], {})
    const output = formatIcicleJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.drops).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.glacier).toBeDefined()
  })
})
