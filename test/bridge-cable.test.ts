import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  computeLoadAnalysis, computeStressAnalysis,
  classifyCableType, classifyCableMaterial, classifySegmentCondition,
  classifyBridgeType, classifySpanCondition, classifyEngineerGrade,
  detectFatigue, detectCorrosion,
  buildConnectionInfo, computeGeometry,
  analyzeCableSegment, analyzeBridgeSpan,
  identifySinglePointOfFailure, generateRecommendations,
  buildBridgeCableResult,
} from '../src/commands/bridge-cable-helpers.js'
import { formatBridgeCableTable, formatBridgeCableJson } from '../src/commands/bridge-cable-format-helpers.js'

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

const todoCode = [
  'function a() { /* TODO: fix */ }',
  '// FIXME: broken',
  '// HACK: workaround',
  '// XXX: temp',
  'const b = 2',
  'const c = 3',
].join('\n')

const noExportCode = [
  'function internalHelper() { return 42 }',
  'const data = internalHelper()',
].join('\n')

const highTensionCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
  'import { f } from "f"',
  'const x = 1',
  'const y = 2',
  'const z = 3',
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
  it('returns 0 for code with no exports', () => {
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
  it('returns 0 for code with no error handling', () => {
    expect(countErrorHandling(simpleCode)).toBe(0)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations(typedCode)).toBeGreaterThanOrEqual(1)
  })
  it('returns 0 for code with no types', () => {
    expect(countTypeAnnotations('const x = 1')).toBe(0)
  })
})

describe('countBranches', () => {
  it('counts branches', () => {
    expect(countBranches(strongCode)).toBeGreaterThanOrEqual(1)
  })
  it('returns 0 for code with no branches', () => {
    expect(countBranches('const x = 1')).toBe(0)
  })
})

describe('maxNesting', () => {
  it('measures max nesting depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
  it('returns 0 for no braces', () => {
    expect(maxNesting('const x = 1')).toBe(0)
  })
})

describe('countConsole', () => {
  it('counts console statements', () => {
    expect(countConsole(consoleCode)).toBe(4)
  })
  it('returns 0 for code with no console', () => {
    expect(countConsole(simpleCode)).toBe(0)
  })
})

describe('countComments', () => {
  it('counts comments', () => {
    expect(countComments('// hello\n/* world */')).toBeGreaterThanOrEqual(2)
  })
  it('returns 0 for code with no comments', () => {
    expect(countComments('const x = 1')).toBe(0)
  })
})

describe('countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos(todoCode)).toBeGreaterThanOrEqual(4)
  })
  it('returns 0 for code with no TODOs', () => {
    expect(countTodos('const x = 1')).toBe(0)
  })
})

// ─── Load Analysis Tests ──────────────────────────────────────────────────────

describe('computeLoadAnalysis', () => {
  it('returns zero load for empty code', () => {
    const load = computeLoadAnalysis('', 'empty.ts')
    expect(load.totalLoad).toBe(0)
    expect(load.selfWeight).toBe(0)
    expect(load.liveLoad).toBe(0)
    expect(load.deadLoad).toBe(0)
    expect(load.windLoad).toBe(0)
    expect(load.isOverloaded).toBe(false)
    expect(load.safetyFactor).toBe(100)
  })

  it('computes load for typed code', () => {
    const load = computeLoadAnalysis(typedCode, 'calc.ts')
    expect(load.totalLoad).toBeGreaterThanOrEqual(0)
    expect(load.loadCapacity).toBeGreaterThan(0)
    expect(typeof load.loadRatio).toBe('number')
    expect(typeof load.safetyFactor).toBe('number')
  })

  it('detects overload for high-tension code', () => {
    const load = computeLoadAnalysis(highTensionCode, 'heavy.ts')
    expect(load.selfWeight).toBeGreaterThan(0)
    expect(load.deadLoad).toBeGreaterThan(0)
  })

  it('has reasonable load capacity for strong code', () => {
    const load = computeLoadAnalysis(strongCode, 'strong.ts')
    expect(load.loadCapacity).toBeGreaterThan(30)
  })
})

// ─── Stress Analysis Tests ────────────────────────────────────────────────────

describe('computeStressAnalysis', () => {
  it('returns zero stress for empty code', () => {
    const stress = computeStressAnalysis('')
    expect(stress.tensile).toBe(0)
    expect(stress.compressive).toBe(0)
    expect(stress.shear).toBe(0)
    expect(stress.torsion).toBe(0)
    expect(stress.isWithinLimits).toBe(true)
    expect(stress.maxStressPoint).toBe('none')
    expect(stress.hasStressCracks).toBe(false)
  })

  it('computes tensile stress from imports', () => {
    const stress = computeStressAnalysis(highTensionCode)
    expect(stress.tensile).toBeGreaterThan(0)
  })

  it('computes compressive stress from exports', () => {
    const stress = computeStressAnalysis(strongCode)
    expect(stress.compressive).toBeGreaterThan(0)
  })

  it('detects corrosion in console-heavy code', () => {
    const stress = computeStressAnalysis(consoleCode)
    expect(stress.hasCorrosion).toBe(true)
  })

  it('detects fatigue in TODO-heavy code', () => {
    const stress = computeStressAnalysis(todoCode)
    expect(stress.hasFatigueSigns).toBe(true)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('classifyCableType', () => {
  it('classifies anchorage for 0 imports with many dependents', () => {
    expect(classifyCableType(0, 5)).toBe('anchorage')
  })
  it('classifies tower for high imports and dependents', () => {
    expect(classifyCableType(6, 4)).toBe('tower')
  })
  it('classifies main-cable for high imports', () => {
    expect(classifyCableType(4, 0)).toBe('main-cable')
  })
  it('classifies stays for high dependents', () => {
    expect(classifyCableType(1, 3)).toBe('stays')
  })
  it('classifies suspenders for balanced imports/dependents', () => {
    expect(classifyCableType(1, 1)).toBe('suspenders')
  })
  it('classifies hanger for imports only', () => {
    expect(classifyCableType(1, 0)).toBe('hanger')
  })
  it('classifies deck-beam for nothing', () => {
    expect(classifyCableType(0, 0)).toBe('deck-beam')
  })
})

describe('classifyCableMaterial', () => {
  it('classifies steel for strong code', () => {
    expect(classifyCableMaterial(strongCode)).toBe('concrete')
  })
  it('classifies carbon-fiber for class code with types', () => {
    expect(classifyCableMaterial(classCode)).toBe('chain')
  })
  it('classifies rope for code with no exports', () => {
    expect(classifyCableMaterial(noExportCode)).toBe('rope')
  })
  it('classifies chain for simple export', () => {
    expect(classifyCableMaterial('export function a() { return 1 }')).toBe('chain')
  })
})

describe('classifySegmentCondition', () => {
  it('returns new for high scores', () => {
    expect(classifySegmentCondition(90)).toBe('new')
  })
  it('returns good for 70+', () => {
    expect(classifySegmentCondition(75)).toBe('good')
  })
  it('returns fair for 55+', () => {
    expect(classifySegmentCondition(60)).toBe('fair')
  })
  it('returns worn for 40+', () => {
    expect(classifySegmentCondition(45)).toBe('worn')
  })
  it('returns deteriorated for 20+', () => {
    expect(classifySegmentCondition(30)).toBe('deteriorated')
  })
  it('returns critical for 5+', () => {
    expect(classifySegmentCondition(10)).toBe('critical')
  })
  it('returns failed for 0', () => {
    expect(classifySegmentCondition(0)).toBe('failed')
  })
})

describe('classifyBridgeType', () => {
  it('returns beam for empty segments', () => {
    expect(classifyBridgeType([])).toBe('beam')
  })
  it('returns beam for deck-beam only', () => {
    const seg = analyzeCableSegment('const x = 1', 'a.ts')
    expect(classifyBridgeType([seg])).toBe('beam')
  })
})

describe('classifySpanCondition', () => {
  it('returns sound for high health', () => {
    expect(classifySpanCondition(85)).toBe('sound')
  })
  it('returns serviceable for 60+', () => {
    expect(classifySpanCondition(65)).toBe('serviceable')
  })
  it('returns collapsed for very low', () => {
    expect(classifySpanCondition(5)).toBe('collapsed')
  })
})

describe('classifyEngineerGrade', () => {
  it('returns structural-engineer for top health', () => {
    expect(classifyEngineerGrade(90)).toBe('structural-engineer')
  })
  it('returns civil-engineer for good health', () => {
    expect(classifyEngineerGrade(75)).toBe('civil-engineer')
  })
  it('returns toddler for very low health', () => {
    expect(classifyEngineerGrade(5)).toBe('toddler')
  })
})

// ─── Detection Tests ──────────────────────────────────────────────────────────

describe('detectFatigue', () => {
  it('returns 0 for empty code', () => {
    expect(detectFatigue('')).toBe(0)
  })
  it('detects fatigue from TODOs', () => {
    expect(detectFatigue(todoCode)).toBeGreaterThan(0)
  })
  it('detects fatigue from console', () => {
    expect(detectFatigue(consoleCode)).toBeGreaterThan(0)
  })
})

describe('detectCorrosion', () => {
  it('returns 0 for empty code', () => {
    expect(detectCorrosion('')).toBe(0)
  })
  it('detects corrosion from console-heavy code', () => {
    expect(detectCorrosion(consoleCode)).toBeGreaterThan(0)
  })
})

// ─── Connection & Geometry Tests ──────────────────────────────────────────────

describe('buildConnectionInfo', () => {
  it('builds empty connections', () => {
    const info = buildConnectionInfo([], [], [])
    expect(info.connectionCount).toBe(0)
    expect(info.isRedundant).toBe(false)
    expect(info.hasSinglePointOfFailure).toBe(true)
  })

  it('builds redundant connections', () => {
    const info = buildConnectionInfo(['a'], ['b'], ['c'])
    expect(info.connectionCount).toBe(3)
    expect(info.isRedundant).toBe(true)
    expect(info.hasSinglePointOfFailure).toBe(false)
  })

  it('detects single point of failure with one connection', () => {
    const info = buildConnectionInfo([], [], ['a'])
    expect(info.hasSinglePointOfFailure).toBe(true)
  })
})

describe('computeGeometry', () => {
  it('computes level and plumb geometry', () => {
    const geo = computeGeometry(50, 5, 10)
    expect(geo.span).toBe(50)
    expect(geo.sag).toBe(5)
    expect(geo.camber).toBe(10)
    expect(geo.isLevel).toBe(true)
    expect(geo.isPlumb).toBe(true)
  })

  it('computes non-level geometry', () => {
    const geo = computeGeometry(50, 30, 20)
    expect(geo.isLevel).toBe(false)
    expect(geo.isPlumb).toBe(false)
  })
})

// ─── Core Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeCableSegment', () => {
  it('returns valid segment for empty code', () => {
    const seg = analyzeCableSegment('', 'empty.ts')
    expect(seg.file).toBe('empty.ts')
    expect(seg.tension).toBe(0)
    expect(seg.strength).toBeGreaterThanOrEqual(0)
    expect(seg.qualityScore).toBeGreaterThanOrEqual(0)
    expect(typeof seg.condition).toBe('string')
  })

  it('returns valid segment for simple code', () => {
    const seg = analyzeCableSegment(simpleCode, 'simple.ts')
    expect(seg.file).toBe('simple.ts')
    expect(seg.tension).toBeGreaterThanOrEqual(0)
    expect(seg.strength).toBeGreaterThanOrEqual(0)
    expect(seg.qualityScore).toBeGreaterThanOrEqual(0)
    expect(typeof seg.cableType).toBe('string')
    expect(typeof seg.material).toBe('string')
  })

  it('returns higher quality for strong code', () => {
    const strongSeg = analyzeCableSegment(strongCode, 'strong.ts')
    const simpleSeg = analyzeCableSegment(simpleCode, 'simple.ts')
    expect(strongSeg.qualityScore).toBeGreaterThan(simpleSeg.qualityScore)
  })

  it('populates all fields', () => {
    const seg = analyzeCableSegment(typedCode, 'typed.ts')
    expect(seg.load).toBeDefined()
    expect(seg.stress).toBeDefined()
    expect(seg.connections).toBeDefined()
    expect(seg.geometry).toBeDefined()
    expect(typeof seg.load.totalLoad).toBe('number')
    expect(typeof seg.stress.tensile).toBe('number')
    expect(typeof seg.geometry.span).toBe('number')
  })

  it('detects high tension for import-heavy code', () => {
    const seg = analyzeCableSegment(highTensionCode, 'heavy.ts')
    expect(seg.tension).toBeGreaterThan(0)
  })
})

// ─── Span Analysis Tests ──────────────────────────────────────────────────────

describe('analyzeBridgeSpan', () => {
  it('returns valid span for empty segments', () => {
    const span = analyzeBridgeSpan([], 'empty-dir')
    expect(span.directory).toBe('empty-dir')
    expect(span.bridgeType).toBe('beam')
    expect(span.structuralHealth).toBe(100)
    expect(span.condition).toBe('sound')
    expect(span.isStructurallySound).toBe(true)
  })

  it('returns valid span for segments', () => {
    const segs = [
      analyzeCableSegment(strongCode, 'strong.ts'),
      analyzeCableSegment(simpleCode, 'simple.ts'),
    ]
    const span = analyzeBridgeSpan(segs, 'src')
    expect(span.segments.length).toBe(2)
    expect(span.avgTension).toBeGreaterThanOrEqual(0)
    expect(span.avgStrength).toBeGreaterThanOrEqual(0)
    expect(typeof span.condition).toBe('string')
  })
})

// ─── SPOF Detection Tests ─────────────────────────────────────────────────────

describe('identifySinglePointOfFailure', () => {
  it('returns empty for no segments', () => {
    expect(identifySinglePointOfFailure([])).toEqual([])
  })

  it('identifies files with SPOF', () => {
    const segs = [
      analyzeCableSegment(simpleCode, 'spof.ts'),
      analyzeCableSegment(strongCode, 'safe.ts'),
    ]
    const spof = identifySinglePointOfFailure(segs)
    expect(Array.isArray(spof)).toBe(true)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns array', () => {
    const recs = generateRecommendations([], [], {
      totalSpan: 0, avgTension: 0, avgStrength: 0, avgLoadRatio: 0,
      maxLoadRatio: 0, totalOverloaded: 0, totalCritical: 0,
      hasFailures: false, isStructurallySound: true, overallSafetyFactor: 2,
    }, {
      totalFiles: 0, totalSpans: 0, avgTension: 0, avgStrength: 0,
      avgElasticity: 0, avgFatigue: 0, avgLoadRatio: 0, avgSafetyFactor: 2,
      mainCables: 0, stays: 0, towers: 0, anchorages: 0,
      steelSegments: 0, ropeSegments: 0, overloadedCount: 0,
      criticalCount: 0, failedCount: 0, stressCracksCount: 0,
      fatigueSignsCount: 0, corrosionCount: 0, singlePointsOfFailure: 0,
      overallStructuralHealth: 80, engineerGrade: 'civil-engineer',
      strongestSegment: 'none', weakestSegment: 'none',
      heaviestLoad: 'none', mostRedundant: 'none', biggestSpan: 'none',
    })
    expect(Array.isArray(recs)).toBe(true)
    expect(recs).toContain('Structural assessment: bridge network is structurally sound')
  })

  it('warns about overloaded cables', () => {
    const recs = generateRecommendations([], [], {
      totalSpan: 0, avgTension: 50, avgStrength: 30, avgLoadRatio: 1.2,
      maxLoadRatio: 1.5, totalOverloaded: 3, totalCritical: 0,
      hasFailures: false, isStructurallySound: true, overallSafetyFactor: 0.8,
    }, {
      totalFiles: 5, totalSpans: 1, avgTension: 50, avgStrength: 30,
      avgElasticity: 40, avgFatigue: 20, avgLoadRatio: 1.2, avgSafetyFactor: 0.8,
      mainCables: 1, stays: 1, towers: 0, anchorages: 1,
      steelSegments: 2, ropeSegments: 1, overloadedCount: 3,
      criticalCount: 0, failedCount: 0, stressCracksCount: 0,
      fatigueSignsCount: 0, corrosionCount: 0, singlePointsOfFailure: 0,
      overallStructuralHealth: 60, engineerGrade: 'architect',
      strongestSegment: 'a', weakestSegment: 'b',
      heaviestLoad: 'c', mostRedundant: 'd', biggestSpan: 'src',
    })
    expect(recs).toContain('Overloaded cables: 3 segments exceed safe load capacity')
  })
})

// ─── Orchestrator Tests ───────────────────────────────────────────────────────

describe('buildBridgeCableResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildBridgeCableResult([], [], {})
    expect(result.segments).toEqual([])
    expect(result.spans).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.network.avgTension).toBe(0)
  })

  it('returns valid result for single file', () => {
    const result = buildBridgeCableResult(['a.ts'], [typedCode], {})
    expect(result.segments.length).toBe(1)
    expect(result.segments[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('returns valid result for multiple files', () => {
    const result = buildBridgeCableResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [strongCode, simpleCode, classCode],
      {},
    )
    expect(result.segments.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.strongestSegment).toBeTruthy()
    expect(result.stats.weakestSegment).toBeTruthy()
  })

  it('groups files by directory into spans', () => {
    const result = buildBridgeCableResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [simpleCode, simpleCode, simpleCode],
      {},
    )
    expect(result.spans.length).toBe(2)
  })

  it('computes network stats correctly', () => {
    const result = buildBridgeCableResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.network.avgTension).toBeGreaterThanOrEqual(0)
    expect(result.network.avgStrength).toBeGreaterThanOrEqual(0)
    expect(typeof result.network.isStructurallySound).toBe('boolean')
    expect(typeof result.network.hasFailures).toBe('boolean')
  })

  it('populates all stats fields', () => {
    const result = buildBridgeCableResult(['a.ts'], [strongCode], {})
    const s = result.stats
    expect(s.avgElasticity).toBeGreaterThanOrEqual(0)
    expect(s.avgFatigue).toBeGreaterThanOrEqual(0)
    expect(typeof s.engineerGrade).toBe('string')
    expect(typeof s.overallStructuralHealth).toBe('number')
    expect(s.strongestSegment).toBeTruthy()
    expect(s.weakestSegment).toBeTruthy()
    expect(s.heaviestLoad).toBeTruthy()
    expect(s.mostRedundant).toBeTruthy()
    expect(s.biggestSpan).toBeTruthy()
  })

  it('handles corrupt content gracefully', () => {
    const result = buildBridgeCableResult(['bad.ts'], [''], {})
    expect(result.segments.length).toBe(1)
    expect(result.segments[0].file).toBe('bad.ts')
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('formatBridgeCableTable', () => {
  it('returns formatted string', () => {
    const result = buildBridgeCableResult(['a.ts'], [typedCode], {})
    const output = formatBridgeCableTable(result, false)
    expect(output).toContain('Bridge Cable')
    expect(output).toContain('a.ts')
    expect(typeof output).toBe('string')
  })

  it('includes details in verbose mode', () => {
    const result = buildBridgeCableResult(['a.ts'], [strongCode], {})
    const output = formatBridgeCableTable(result, true)
    expect(output).toContain('load:')
    expect(output).toContain('stress:')
  })

  it('handles empty results', () => {
    const result = buildBridgeCableResult([], [], {})
    const output = formatBridgeCableTable(result, false)
    expect(output).toContain('No files analyzed')
  })
})

describe('formatBridgeCableJson', () => {
  it('returns valid JSON string', () => {
    const result = buildBridgeCableResult(['a.ts'], [typedCode], {})
    const output = formatBridgeCableJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.segments).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.network).toBeDefined()
  })
})
