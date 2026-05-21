import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifySailType, classifyMillType, classifyWindmillCondition,
  classifyComplexCondition, classifyMillwrightGrade,
  measureGrinding, assessGears, measureEnergy, assessWind, assessTower,
  analyzeWindmillSail, analyzeMillComplex,
  generateRecommendations, buildWindmillSailResult,
} from '../src/commands/windmill-sail-helpers.js'
import { formatWindmillSailTable, formatWindmillSailJson } from '../src/commands/windmill-sail-format-helpers.js'

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
  'import { f } from "f"',
  'const x = 1',
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
  it('returns 0 for code with no imports', () => {
    expect(countImports(simpleCode)).toBe(0)
  })
})

describe('countExports', () => {
  it('counts export statements', () => {
    expect(countExports(interfaceCode)).toBe(3)
  })
  it('returns 0 for no exports', () => {
    expect(countExports(noExportCode)).toBe(0)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function a() {}')).toBe(1)
  })
  it('counts arrow functions', () => {
    expect(countFunctions('const fn = () => 1')).toBe(1)
  })
})

describe('countErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })
  it('returns 0 with no error handling', () => {
    expect(countErrorHandling(simpleCode)).toBe(0)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations(typedCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countBranches', () => {
  it('counts branches', () => {
    expect(countBranches(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('maxNesting', () => {
  it('measures max nesting depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
})

describe('countConsole', () => {
  it('counts console statements', () => {
    expect(countConsole(consoleCode)).toBe(4)
  })
})

describe('countComments', () => {
  it('counts comments', () => {
    expect(countComments('// hello\n/* world */')).toBeGreaterThanOrEqual(2)
  })
})

describe('countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('TODO: fix\nFIXME: broken')).toBeGreaterThanOrEqual(2)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifySailType', () => {
  it('returns decorative for simple code', () => {
    expect(classifySailType(simpleCode)).toBe('decorative')
  })
  it('returns spring for exported functions', () => {
    expect(classifySailType(typedCode)).toBe('spring')
  })
  it('returns fantail for strong code', () => {
    expect(classifySailType(strongCode)).toBe('fantail')
  })
  it('returns common for function-only code', () => {
    expect(classifySailType('function helper() { return 1 }')).toBe('common')
  })
  it('returns jib-sail for export-only code', () => {
    expect(classifySailType('export const X = 1')).toBe('jib-sail')
  })
})

describe('classifyMillType', () => {
  it('returns water-mill for simple code', () => {
    expect(classifyMillType(simpleCode)).toBe('water-mill')
  })
  it('returns horizontal for strong code', () => {
    expect(classifyMillType(strongCode)).toBe('horizontal')
  })
  it('returns smock-mill for class code', () => {
    expect(classifyMillType(classCode)).toBe('smock-mill')
  })
  it('returns post-mill for many imports', () => {
    expect(classifyMillType(manyImportsCode)).toBe('post-mill')
  })
})

describe('classifyWindmillCondition', () => {
  it('returns fully-operational for 80+', () => {
    expect(classifyWindmillCondition(85)).toBe('fully-operational')
  })
  it('returns operational for 60+', () => {
    expect(classifyWindmillCondition(65)).toBe('operational')
  })
  it('returns needs-repair for 40+', () => {
    expect(classifyWindmillCondition(45)).toBe('needs-repair')
  })
  it('returns deteriorating for 25+', () => {
    expect(classifyWindmillCondition(30)).toBe('deteriorating')
  })
  it('returns idle for 10+', () => {
    expect(classifyWindmillCondition(15)).toBe('idle')
  })
  it('returns ruined for low scores', () => {
    expect(classifyWindmillCondition(5)).toBe('ruined')
  })
})

describe('classifyComplexCondition', () => {
  it('returns thriving-mill for 80+', () => {
    expect(classifyComplexCondition(85)).toBe('thriving-mill')
  })
  it('returns working-mill for 60+', () => {
    expect(classifyComplexCondition(65)).toBe('working-mill')
  })
  it('returns struggling-mill for 35+', () => {
    expect(classifyComplexCondition(40)).toBe('struggling-mill')
  })
  it('returns abandoned-mill for 15+', () => {
    expect(classifyComplexCondition(20)).toBe('abandoned-mill')
  })
  it('returns ruins for low health', () => {
    expect(classifyComplexCondition(10)).toBe('ruins')
  })
})

describe('classifyMillwrightGrade', () => {
  it('returns master-millwright for 80+', () => {
    expect(classifyMillwrightGrade(85)).toBe('master-millwright')
  })
  it('returns millwright for 65+', () => {
    expect(classifyMillwrightGrade(70)).toBe('millwright')
  })
  it('returns mechanic for 50+', () => {
    expect(classifyMillwrightGrade(55)).toBe('mechanic')
  })
  it('returns handyman for 35+', () => {
    expect(classifyMillwrightGrade(40)).toBe('handyman')
  })
  it('returns apprentice for 15+', () => {
    expect(classifyMillwrightGrade(20)).toBe('apprentice')
  })
  it('returns tourist for low scores', () => {
    expect(classifyMillwrightGrade(5)).toBe('tourist')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('measureGrinding', () => {
  it('returns zeros for empty code', () => {
    const g = measureGrinding('')
    expect(g.inputGrain).toBe(0)
    expect(g.outputFlour).toBe(0)
    expect(g.grindingRatio).toBe(0)
    expect(g.hasCoarseOutput).toBe(true)
  })
  it('measures grinding for typed code', () => {
    const g = measureGrinding(typedCode)
    expect(g.inputGrain).toBeGreaterThanOrEqual(0)
    expect(g.outputFlour).toBeGreaterThan(0)
    expect(typeof g.grindingRatio).toBe('number')
  })
  it('detects wasted grain for import-heavy code', () => {
    const g = measureGrinding(manyImportsCode)
    expect(typeof g.hasWastedGrain).toBe('boolean')
  })
})

describe('assessGears', () => {
  it('returns zeros for empty code', () => {
    const g = assessGears('')
    expect(g.meshQuality).toBe(0)
    expect(g.hasBrokenTeeth).toBe(true)
    expect(g.isWellOiled).toBe(false)
  })
  it('assesses gears for strong code', () => {
    const g = assessGears(strongCode)
    expect(g.meshQuality).toBeGreaterThan(0)
    expect(g.toothCount).toBeGreaterThan(0)
  })
})

describe('measureEnergy', () => {
  it('returns zeros for empty code', () => {
    const e = measureEnergy('')
    expect(e.input).toBe(0)
    expect(e.output).toBe(0)
    expect(e.efficiency).toBe(0)
    expect(e.isRenewable).toBe(false)
  })
  it('measures energy for typed code', () => {
    const e = measureEnergy(typedCode)
    expect(e.input).toBeGreaterThanOrEqual(0)
    expect(e.output).toBeGreaterThan(0)
  })
})

describe('assessWind', () => {
  it('returns calm for empty code', () => {
    const w = assessWind('')
    expect(w.isCalm).toBe(true)
    expect(w.velocity).toBe(0)
  })
  it('detects wind direction', () => {
    const w = assessWind(typedCode)
    expect(['inward', 'outward', 'crosswind']).toContain(w.direction)
  })
})

describe('assessTower', () => {
  it('returns no foundation for empty code', () => {
    const t = assessTower('')
    expect(t.hasFoundation).toBe(false)
    expect(t.foundationDepth).toBe(0)
  })
  it('assesses tower for strong code', () => {
    const t = assessTower(strongCode)
    expect(t.hasFoundation).toBe(true)
    expect(t.foundationDepth).toBeGreaterThan(0)
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeWindmillSail', () => {
  it('returns valid sail for empty code', () => {
    const sa = analyzeWindmillSail('', 'empty.ts')
    expect(sa.file).toBe('empty.ts')
    expect(sa.sailEfficiency).toBeGreaterThanOrEqual(0)
    expect(sa.qualityScore).toBeGreaterThanOrEqual(0)
    expect(typeof sa.condition).toBe('string')
  })

  it('returns valid sail for typed code', () => {
    const sa = analyzeWindmillSail(typedCode, 'calc.ts')
    expect(sa.file).toBe('calc.ts')
    expect(sa.sails).toBeDefined()
    expect(sa.grinding).toBeDefined()
    expect(sa.gears).toBeDefined()
    expect(sa.wind).toBeDefined()
    expect(sa.tower).toBeDefined()
    expect(sa.energy).toBeDefined()
  })

  it('returns higher quality for strong code vs simple', () => {
    const strong = analyzeWindmillSail(strongCode, 'strong.ts')
    const simple = analyzeWindmillSail(simpleCode, 'simple.ts')
    expect(strong.qualityScore).toBeGreaterThan(simple.qualityScore)
  })

  it('populates all sub-objects', () => {
    const sa = analyzeWindmillSail(strongCode, 'strong.ts')
    expect(typeof sa.sails.count).toBe('number')
    expect(typeof sa.grinding.outputFlour).toBe('number')
    expect(typeof sa.gears.meshQuality).toBe('number')
    expect(typeof sa.wind.velocity).toBe('number')
    expect(typeof sa.tower.height).toBe('number')
    expect(typeof sa.energy.efficiency).toBe('number')
  })
})

// ─── Complex Analysis Tests ───────────────────────────────────────────────────

describe('analyzeMillComplex', () => {
  it('returns valid complex for empty sails', () => {
    const c = analyzeMillComplex([], 'empty-dir')
    expect(c.directory).toBe('empty-dir')
    expect(c.complexHealth).toBe(0)
    expect(c.condition).toBe('ruins')
  })

  it('returns valid complex for sails', () => {
    const sails = [
      analyzeWindmillSail(strongCode, 'strong.ts'),
      analyzeWindmillSail(simpleCode, 'simple.ts'),
    ]
    const c = analyzeMillComplex(sails, 'src')
    expect(c.sails.length).toBe(2)
    expect(c.avgEfficiency).toBeGreaterThanOrEqual(0)
    expect(typeof c.condition).toBe('string')
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns array', () => {
    const recs = generateRecommendations([], [], {
      totalEnergyInput: 0, totalEnergyOutput: 0, overallEfficiency: 0,
      operationalMills: 0, idleMills: 0, ruinedMills: 0, hasBottlenecks: false,
    }, {
      totalFiles: 0, totalComplexes: 0, avgSailEfficiency: 0, avgWindCapture: 0,
      avgGrindingQuality: 0, avgRotationSpeed: 0, avgGearRatio: 0,
      avgStructuralStability: 0, avgEnergyEfficiency: 0,
      towerMills: 0, postMills: 0, turbineMills: 0,
      operationalCount: 0, idleCount: 0, ruinedCount: 0,
      balancedSails: 0, tornSails: 0, missingSails: 0,
      hasCoarseOutput: 0, hasWastedGrain: 0, hasSlippingGears: 0, hasBrokenTeeth: 0,
      totalEnergyInput: 0, totalEnergyOutput: 0, overallEfficiency: 0,
      millwrightGrade: 'tourist', mostEfficient: 'none', leastEfficient: 'none',
      bestGrinding: 'none', mostStable: 'none',
    })
    expect(Array.isArray(recs)).toBe(true)
  })

  it('warns about torn sails', () => {
    const recs = generateRecommendations([], [], {
      totalEnergyInput: 50, totalEnergyOutput: 30, overallEfficiency: 60,
      operationalMills: 1, idleMills: 0, ruinedMills: 0, hasBottlenecks: false,
    }, {
      totalFiles: 5, totalComplexes: 1, avgSailEfficiency: 50, avgWindCapture: 40,
      avgGrindingQuality: 50, avgRotationSpeed: 50, avgGearRatio: 50,
      avgStructuralStability: 50, avgEnergyEfficiency: 50,
      towerMills: 1, postMills: 2, turbineMills: 0,
      operationalCount: 3, idleCount: 1, ruinedCount: 0,
      balancedSails: 3, tornSails: 2, missingSails: 1,
      hasCoarseOutput: 0, hasWastedGrain: 0, hasSlippingGears: 0, hasBrokenTeeth: 0,
      totalEnergyInput: 50, totalEnergyOutput: 30, overallEfficiency: 60,
      millwrightGrade: 'mechanic', mostEfficient: 'a', leastEfficient: 'b',
      bestGrinding: 'c', mostStable: 'd',
    })
    expect(recs).toContain('Torn sails: 2 files have broken functions lacking error handling')
    expect(recs).toContain('Missing sails: 1 files have no functional entry points')
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildWindmillSailResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildWindmillSailResult([], [], {})
    expect(result.sails).toEqual([])
    expect(result.complexes).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns valid result for single file', () => {
    const result = buildWindmillSailResult(['a.ts'], [typedCode], {})
    expect(result.sails.length).toBe(1)
    expect(result.sails[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('returns valid result for multiple files', () => {
    const result = buildWindmillSailResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [strongCode, simpleCode, classCode],
      {},
    )
    expect(result.sails.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.mostEfficient).toBeTruthy()
    expect(result.stats.leastEfficient).toBeTruthy()
    expect(result.stats.bestGrinding).toBeTruthy()
    expect(result.stats.mostStable).toBeTruthy()
  })

  it('groups files by directory', () => {
    const result = buildWindmillSailResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [simpleCode, simpleCode, simpleCode],
      {},
    )
    expect(result.complexes.length).toBe(2)
  })

  it('computes wind farm stats', () => {
    const result = buildWindmillSailResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.windFarm.totalEnergyInput).toBeGreaterThanOrEqual(0)
    expect(typeof result.windFarm.hasBottlenecks).toBe('boolean')
  })

  it('populates all stats fields', () => {
    const result = buildWindmillSailResult(['a.ts'], [strongCode], {})
    const s = result.stats
    expect(s.avgSailEfficiency).toBeGreaterThanOrEqual(0)
    expect(s.avgWindCapture).toBeGreaterThanOrEqual(0)
    expect(typeof s.millwrightGrade).toBe('string')
    expect(s.overallEfficiency).toBeGreaterThanOrEqual(0)
    expect(s.towerMills).toBeGreaterThanOrEqual(0)
    expect(s.tornSails).toBeGreaterThanOrEqual(0)
  })

  it('handles corrupt content gracefully', () => {
    const result = buildWindmillSailResult(['bad.ts'], [''], {})
    expect(result.sails.length).toBe(1)
    expect(result.sails[0].file).toBe('bad.ts')
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('formatWindmillSailTable', () => {
  it('returns formatted string', () => {
    const result = buildWindmillSailResult(['a.ts'], [typedCode], {})
    const output = formatWindmillSailTable(result, false)
    expect(output).toContain('Windmill Sail')
    expect(output).toContain('a.ts')
  })

  it('includes details in verbose mode', () => {
    const result = buildWindmillSailResult(['a.ts'], [strongCode], {})
    const output = formatWindmillSailTable(result, true)
    expect(output).toContain('sail:')
    expect(output).toContain('wind:')
  })

  it('handles empty results', () => {
    const result = buildWindmillSailResult([], [], {})
    const output = formatWindmillSailTable(result, false)
    expect(output).toContain('No files analyzed')
  })
})

describe('formatWindmillSailJson', () => {
  it('returns valid JSON string', () => {
    const result = buildWindmillSailResult(['a.ts'], [typedCode], {})
    const output = formatWindmillSailJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.sails).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.windFarm).toBeDefined()
  })
})
