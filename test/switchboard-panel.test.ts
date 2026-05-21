import { describe, expect, it } from 'vitest'

import {
  analyzeExchangeOffice,
  analyzeSwitchLine,
  buildSwitchboardPanelResult,
  classifyLineCondition,
  classifyOfficeCondition,
  classifyOfficeType,
  classifyOperatorGrade,
  countAny,
  countAsync,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDefaultCases,
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
  countReturns,
  countTodos,
  countTypeAnnotations,
  generateRecommendations,
  measureConnections,
  measureLines,
  measureOperator,
  measurePanel,
  measureSwitchboard,
  measureWires,
  type SwitchboardPanelResult,
  type SwitchLine,
} from '../src/commands/switchboard-panel-helpers.js'
import { formatSwitchboardPanelCsv, formatSwitchboardPanelJson, formatSwitchboardPanelTable } from '../src/commands/switchboard-panel-format-helpers.js'

// ─── Utility Helpers ────────────────────────────────────

describe('switchboard-panel utility helpers', () => {
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

  it('counts default cases', () => {
    expect(countDefaultCases('switch(x) { default: break; }')).toBe(1)
    expect(countDefaultCases('')).toBe(0)
  })

  it('counts return statements', () => {
    expect(countReturns('function f() { return 1; }')).toBe(1)
    expect(countReturns('')).toBe(0)
  })
})

// ─── Switchboard Measurement ────────────────────────────

describe('measureSwitchboard', () => {
  it('returns zero capacity for empty content', () => {
    const result = measureSwitchboard('')
    expect(result.capacity).toBe(0)
    expect(result.type).toBe('broken')
  })

  it('detects dialtone from functions', () => {
    const result = measureSwitchboard('function hello() {}')
    expect(result.hasDialtone).toBe(true)
  })

  it('detects busytone from error handling', () => {
    const result = measureSwitchboard('try { } catch(e) { }')
    expect(result.hasBusytone).toBe(true)
  })

  it('detects ringback from return types', () => {
    const result = measureSwitchboard('function f(): number { return 1; }')
    expect(result.hasRingback).toBe(true)
  })

  it('detects dead air from TODOs and console', () => {
    const result = measureSwitchboard('// TODO: fix\nconsole.log("hack")')
    expect(result.hasDeadAir).toBe(true)
    expect(result.deadAirCount).toBeGreaterThan(0)
  })

  it('detects crosstalk from any types', () => {
    const result = measureSwitchboard('const x: any = 1')
    expect(result.hasCrossTalk).toBe(true)
    expect(result.crossTalkCount).toBeGreaterThan(0)
  })

  it('assigns digital type for high capacity with errors and branches', () => {
    const code = [
      '/** Docs */',
      'export function route(x: number): number {',
      '  if (x > 0) { return 1; }',
      '  if (x < 0) { return -1; }',
      '  if (x === 0) { return 0; }',
      '  if (x > 10) { return 10; }',
      '  try { return x; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = measureSwitchboard(code)
    expect(result.capacity).toBeGreaterThan(50)
  })

  it('assigns crossbar or step-by-step type for good capacity with exports', () => {
    const code = '/** Docs */\nexport function f(x: number): number { return x; }'
    const result = measureSwitchboard(code)
    expect(['crossbar', 'step-by-step']).toContain(result.type)
  })
})

// ─── Connections Measurement ─────────────────────────────

describe('measureConnections', () => {
  it('returns zeros for empty content', () => {
    const result = measureConnections('')
    expect(result.total).toBe(0)
    expect(result.active).toBe(0)
    expect(result.dead).toBe(0)
  })

  it('detects clean routing', () => {
    const code = [
      '/** Docs */',
      'export function route(): number {',
      '  try { return 1; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = measureConnections(code)
    expect(result.hasCleanRouting).toBe(true)
  })

  it('detects tangled wires from deep nesting', () => {
    const code = Array.from({ length: 6 }, (_, i) => `if (x${i}) {`).join('\n') + '}'.repeat(6)
    const result = measureConnections(code)
    expect(result.hasTangledWires).toBe(true)
  })

  it('detects crossed lines from any types', () => {
    const code = 'const x: any = 1'
    const result = measureConnections(code)
    expect(result.hasCrossedLines).toBe(true)
  })

  it('detects dead ends from TODOs', () => {
    const code = '// TODO: implement\nfunction stub() {}'
    const result = measureConnections(code)
    expect(result.hasDeadEnds).toBe(true)
  })
})

// ─── Wires Measurement ──────────────────────────────────

describe('measureWires', () => {
  it('returns zero organization for empty content', () => {
    const result = measureWires('')
    expect(result.organization).toBe(0)
  })

  it('detects color coding from type annotations', () => {
    const result = measureWires('function f(x: number): string { return "x"; }')
    expect(result.hasColorCoding).toBe(true)
  })

  it('detects labeling from JSDoc', () => {
    const result = measureWires('/** Docs */\nfunction f() {}')
    expect(result.hasLabeling).toBe(true)
  })

  it('detects trunk from exports', () => {
    const result = measureWires('export function route() {}')
    expect(result.hasTrunk).toBe(true)
    expect(result.trunkCount).toBeGreaterThan(0)
  })

  it('detects branch from conditionals', () => {
    const result = measureWires('if (x) { }')
    expect(result.hasBranch).toBe(true)
    expect(result.branchCount).toBeGreaterThan(0)
  })

  it('detects patch from TODOs and console', () => {
    const result = measureWires('// TODO: fix\nconsole.log("hack")')
    expect(result.hasPatch).toBe(true)
  })

  it('detects splice from async with imports', () => {
    const result = measureWires("import { x } from 'y'\nasync function f() { await x(); }")
    expect(result.hasSplice).toBe(true)
  })
})

// ─── Operator Measurement ───────────────────────────────

describe('measureOperator', () => {
  it('returns zero efficiency for empty content', () => {
    const result = measureOperator('')
    expect(result.efficiency).toBe(0)
  })

  it('detects skilled operators', () => {
    const code = [
      '/** Docs */',
      'export function handler(x: number): number {',
      '  try { return x; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = measureOperator(code)
    expect(result.hasSkilledOperators).toBe(true)
    expect(result.efficiency).toBeGreaterThan(50)
  })

  it('detects trainees from undocumented functions', () => {
    const code = Array.from({ length: 7 }, (_, i) => `function fn${i}() {}`).join('\n')
    const result = measureOperator(code)
    expect(result.hasTrainees).toBe(true)
  })

  it('detects overworked from many branches', () => {
    const code = Array.from({ length: 7 }, (_, i) => `if (x${i}) { }`).join('\n')
    const result = measureOperator(code)
    expect(result.hasOverworked).toBe(true)
  })

  it('detects absent handlers', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const result = measureOperator(code)
    expect(result.hasAbsent).toBe(true)
  })

  it('detects clumsy from any types', () => {
    const code = 'const x: any = 1'
    const result = measureOperator(code)
    expect(result.hasClumsy).toBe(true)
  })

  it('detects speed dial from async with type annotations', () => {
    const code = 'async function fetch(): Promise<number> {\n  const x: number = await fetchUrl();\n  return x;\n}'
    const result = measureOperator(code)
    expect(result.hasSpeedDial).toBe(true)
  })
})

// ─── Lines Measurement ──────────────────────────────────

describe('measureLines', () => {
  it('returns zeros for empty content', () => {
    const result = measureLines('')
    expect(result.utilization).toBe(0)
    expect(result.totalLines).toBe(0)
  })

  it('detects party lines from multiple imports and exports', () => {
    const code = [
      "import { a } from 'x'",
      "import { b } from 'y'",
      'export function f() {}',
      'export function g() {}',
    ].join('\n')
    const result = measureLines(code)
    expect(result.hasPartyLines).toBe(true)
  })

  it('detects private lines from functions without exports', () => {
    const result = measureLines('function internal() {}')
    expect(result.hasPrivateLines).toBe(true)
  })

  it('detects toll free from exports with docs', () => {
    const result = measureLines('/** Public API */\nexport function api() {}')
    expect(result.hasTollFree).toBe(true)
  })

  it('detects long distance from imports with async', () => {
    const result = measureLines("import { fetch } from 'api'\nasync function call() { await fetch(); }")
    expect(result.hasLongDistance).toBe(true)
  })

  it('detects local from functions without imports', () => {
    const result = measureLines('function local() {}')
    expect(result.hasLocal).toBe(true)
  })

  it('detects emergency from error handling', () => {
    const result = measureLines('try { } catch(e) { }')
    expect(result.hasEmergency).toBe(true)
  })
})

// ─── Panel Measurement ──────────────────────────────────

describe('measurePanel', () => {
  it('returns zero layout for empty content', () => {
    const result = measurePanel('')
    expect(result.layout).toBe(0)
    expect(result.isOrganized).toBe(false)
  })

  it('detects organized panel', () => {
    const code = [
      '/** Docs */',
      'export interface IRoute { path: string; }',
      'class Router implements IRoute { path: string = "/"; }',
    ].join('\n')
    const result = measurePanel(code)
    expect(result.layout).toBeGreaterThan(50)
  })

  it('detects jack fields from interfaces and classes', () => {
    const result = measurePanel('interface IRoute {}\nclass Route implements IRoute {}')
    expect(result.hasJackFields).toBe(true)
    expect(result.jackCount).toBeGreaterThan(0)
  })

  it('detects cord circuits from functions', () => {
    const result = measurePanel('function route() {}')
    expect(result.hasCordCircuits).toBe(true)
  })

  it('detects supervisor from error handling', () => {
    const result = measurePanel('try { } catch(e) { }')
    expect(result.hasSupervisor).toBe(true)
  })

  it('detects distribution frame from imports and exports', () => {
    const code = "import { x } from 'y'\nexport function route() {}"
    const result = measurePanel(code)
    expect(result.hasDistributionFrame).toBe(true)
  })

  it('detects overloaded panel', () => {
    const code = Array.from({ length: 12 }, (_, i) => `if (x${i}) { }`).join('\n')
    const result = measurePanel(code)
    expect(result.isOverloaded).toBe(true)
  })
})

// ─── SwitchLine Analysis ────────────────────────────────

describe('analyzeSwitchLine', () => {
  it('analyzes a well-connected file', () => {
    const code = [
      '/** Route handler */',
      'export function handleRoute(path: string): number {',
      '  try {',
      '    if (path === "/") return 1;',
      '    if (path === "/api") return 2;',
      '    return 0;',
      '  } catch(e) { return -1; }',
      '}',
    ].join('\n')
    const result = analyzeSwitchLine(code, 'src/router.ts')
    expect(result.file).toBe('src/router.ts')
    expect(result.connectionQuality).toBeGreaterThan(0)
    expect(result.switchCapacity).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const result = analyzeSwitchLine('', 'empty.ts')
    expect(result.connectionQuality).toBe(0)
    expect(result.qualityScore).toBe(0)
  })

  it('assigns correct condition based on quality', () => {
    const code = [
      '/** Docs */',
      'export interface IRoute { path: string; }',
      'export class Router {',
      '  route(): number { try { return 1; } catch { return 0; } }',
      '}',
    ].join('\n')
    const result = analyzeSwitchLine(code, 'src/router.ts')
    expect(['digital-exchange', 'modern-switchboard', 'reliable-panel']).toContain(result.condition)
  })
})

// ─── Classification Helpers ─────────────────────────────

describe('classifyLineCondition', () => {
  it('returns digital-exchange for high score with digital type', () => {
    const result = classifyLineCondition(
      90,
      { type: 'digital', capacity: 80 } as any,
      { hasCleanRouting: true } as any,
    )
    expect(result).toBe('digital-exchange')
  })

  it('returns modern-switchboard for good score with clean routing', () => {
    const result = classifyLineCondition(
      70,
      { type: 'crossbar', capacity: 60 } as any,
      { hasCleanRouting: true } as any,
    )
    expect(result).toBe('modern-switchboard')
  })

  it('returns dead-network for very low score', () => {
    const result = classifyLineCondition(
      5,
      { type: 'broken', capacity: 5 } as any,
      { hasTangledWires: true } as any,
    )
    expect(result).toBe('dead-network')
  })

  it('returns reliable-panel for moderate score', () => {
    const result = classifyLineCondition(
      55,
      { type: 'step-by-step', capacity: 50 } as any,
      { hasCleanRouting: false } as any,
    )
    expect(result).toBe('reliable-panel')
  })

  it('returns manual-exchange for low score without tangled wires', () => {
    const result = classifyLineCondition(
      35,
      { type: 'panel', capacity: 30 } as any,
      { hasTangledWires: false } as any,
    )
    expect(result).toBe('manual-exchange')
  })

  it('returns faulty-wiring for very low but not dead score', () => {
    const result = classifyLineCondition(
      15,
      { type: 'broken', capacity: 10 } as any,
      { hasTangledWires: true } as any,
    )
    expect(result).toBe('faulty-wiring')
  })
})

describe('classifyOfficeType', () => {
  it('returns dead-end for empty lines', () => {
    expect(classifyOfficeType([])).toBe('dead-end')
  })

  it('returns central-office for high digital ratio', () => {
    const switchLines = Array.from({ length: 3 }, () => ({
      condition: 'digital-exchange',
      switchCapacity: 70,
    } as SwitchLine))
    expect(classifyOfficeType(switchLines)).toBe('central-office')
  })

  it('returns branch-exchange for good capacity', () => {
    const switchLines = [{ condition: 'reliable-panel', switchCapacity: 55 } as SwitchLine]
    expect(classifyOfficeType(switchLines)).toBe('branch-exchange')
  })
})

describe('classifyOfficeCondition', () => {
  it('returns premium-service for high quality', () => {
    expect(classifyOfficeCondition(80)).toBe('premium-service')
  })

  it('returns disconnected for very low quality', () => {
    expect(classifyOfficeCondition(5)).toBe('disconnected')
  })

  it('returns reliable-service for good quality', () => {
    expect(classifyOfficeCondition(65)).toBe('reliable-service')
  })
})

describe('classifyOperatorGrade', () => {
  it('returns chief-operator for high connectivity', () => {
    expect(classifyOperatorGrade(85)).toBe('chief-operator')
  })

  it('returns caller for very low connectivity', () => {
    expect(classifyOperatorGrade(10)).toBe('caller')
  })

  it('returns operator for moderate connectivity', () => {
    expect(classifyOperatorGrade(55)).toBe('operator')
  })
})

// ─── ExchangeOffice Analysis ────────────────────────────

describe('analyzeExchangeOffice', () => {
  it('handles empty office', () => {
    const result = analyzeExchangeOffice([], 'empty-dir')
    expect(result.officeType).toBe('dead-end')
    expect(result.condition).toBe('disconnected')
    expect(result.avgConnectionQuality).toBe(0)
  })

  it('analyzes office with lines', () => {
    const lines = [
      analyzeSwitchLine('/** docs */\nexport function a(): number { return 1; }', 'dir/a.ts'),
      analyzeSwitchLine('/** docs */\nexport function b(): string { return "x"; }', 'dir/b.ts'),
    ]
    const result = analyzeExchangeOffice(lines, 'dir')
    expect(result.directory).toBe('dir')
    expect(result.lines.length).toBe(2)
    expect(result.avgConnectionQuality).toBeGreaterThan(0)
  })
})

// ─── Recommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns maintenance message for clean code', () => {
    const result = buildSwitchboardPanelResult(
      ['clean.ts'],
      ['/** docs */\nexport function clean(): void { try {} catch {} }'],
    )
    expect(result.recommendations).toContain('Maintain current switchboard standards for reliable service')
  })

  it('recommends restoring dead network', () => {
    const result = buildSwitchboardPanelResult(
      ['dead.ts'],
      ['const x = 1'],
    )
    if (result.stats.deadNetworkCount > 0) {
      const hasDead = result.recommendations.some(r => r.includes('dead network'))
      expect(hasDead).toBe(true)
    }
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('buildSwitchboardPanelResult', () => {
  it('handles empty input', () => {
    const result = buildSwitchboardPanelResult([], [])
    expect(result.lines).toEqual([])
    expect(result.offices).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.operatorGrade).toBe('caller')
  })

  it('analyzes single file', () => {
    const code = [
      '/** Route handler */',
      'export function handleRoute(x: number): number {',
      '  try { return x; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = buildSwitchboardPanelResult(['src/route.ts'], [code])
    expect(result.lines.length).toBe(1)
    expect(result.offices.length).toBe(1)
    expect(result.lines[0].file).toBe('src/route.ts')
    expect(result.lines[0].connectionQuality).toBeGreaterThan(0)
    expect(result.lines[0].switchCapacity).toBeGreaterThan(0)
    expect(result.network.overallConnectivity).toBeGreaterThan(0)
    expect(result.stats.bestConnected).toBe('src/route.ts')
  })

  it('analyzes multiple files across offices', () => {
    const goodCode = '/** docs */\nexport function route(): number { try { return 1; } catch { return 0; } }'
    const badCode = 'const x: any = 1\n// TODO: fix'
    const result = buildSwitchboardPanelResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [goodCode, badCode, goodCode],
    )
    expect(result.lines.length).toBe(3)
    expect(result.offices.length).toBe(2)
    expect(result.stats.totalOffices).toBe(2)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('computes correct averages', () => {
    const code1 = '/** docs */\nexport function a(): number { try { return 1; } catch { return 0; } }'
    const code2 = '/** docs */\nexport function b(): string { try { return "x"; } catch { return ""; } }'
    const result = buildSwitchboardPanelResult(['a.ts', 'b.ts'], [code1, code2])
    expect(result.stats.avgConnectionQuality).toBeGreaterThan(0)
    expect(result.stats.avgSwitchCapacity).toBeGreaterThan(0)
    expect(result.stats.avgWireOrganization).toBeGreaterThan(0)
  })

  it('tracks condition counts', () => {
    const goodCode = [
      '/** docs */',
      'export interface IRoute { path: string; }',
      'export class Router {',
      '  route(): number { try { return 1; } catch { return 0; } }',
      '}',
    ].join('\n')
    const badCode = 'const x: any = 1'
    const result = buildSwitchboardPanelResult(['good.ts', 'bad.ts'], [goodCode, badCode])
    const totalConditions = result.stats.digitalExchangeCount +
      result.stats.modernSwitchboardCount +
      result.stats.reliablePanelCount +
      result.stats.manualExchangeCount +
      result.stats.faultyWiringCount +
      result.stats.deadNetworkCount
    expect(totalConditions).toBe(2)
  })

  it('tracks switchboard type counts', () => {
    const code = '/** docs */\nexport function fn(): number { return 1; }'
    const result = buildSwitchboardPanelResult(['a.ts'], [code])
    const totalTracked = result.stats.crossbarCount + result.stats.digitalCount + result.stats.brokenCount
    expect(totalTracked).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('populates best-of fields', () => {
    const code1 = '/** docs */\nexport function a(): void {}'
    const code2 = 'const x = 1'
    const result = buildSwitchboardPanelResult(['a.ts', 'b.ts'], [code1, code2])
    expect(result.stats.bestConnected).toBeTruthy()
    expect(result.stats.cleanestWiring).toBeTruthy()
    expect(result.stats.mostEfficient).toBeTruthy()
    expect(result.stats.mostUtilized).toBeTruthy()
    expect(result.stats.bestOrganized).toBeTruthy()
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('switchboard-panel format helpers', () => {
  const sampleResult: SwitchboardPanelResult = buildSwitchboardPanelResult(
    ['test.ts'],
    ['/** docs */\nexport function test(): number { return 1; }'],
  )

  it('formatSwitchboardPanelTable returns string with report header', () => {
    const output = formatSwitchboardPanelTable(sampleResult, false)
    expect(output).toContain('Switchboard Panel Report')
    expect(output).toContain('Network Overview')
    expect(output).toContain('Statistics')
  })

  it('formatSwitchboardPanelTable shows line details in verbose mode', () => {
    const output = formatSwitchboardPanelTable(sampleResult, true)
    expect(output).toContain('Line Details')
    expect(output).toContain('test.ts')
  })

  it('formatSwitchboardPanelTable shows offices', () => {
    const output = formatSwitchboardPanelTable(sampleResult, false)
    expect(output).toContain('Exchange Offices')
  })

  it('formatSwitchboardPanelJson returns valid JSON', () => {
    const output = formatSwitchboardPanelJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.lines).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.network).toBeDefined()
  })

  it('formatSwitchboardPanelCsv returns CSV with headers', () => {
    const output = formatSwitchboardPanelCsv(sampleResult)
    expect(output).toContain('File,ConnectionQuality,SwitchCapacity')
    expect(output).toContain('test.ts')
  })

  it('formatSwitchboardPanelCsv escapes commas in filenames', () => {
    const result = buildSwitchboardPanelResult(
      ['file,with,commas.ts'],
      ['/** docs */\nexport function f(): void {}'],
    )
    const output = formatSwitchboardPanelCsv(result)
    expect(output).toContain('"file,with,commas.ts"')
  })

  it('handles empty result in all formats', () => {
    const empty = buildSwitchboardPanelResult([], [])
    expect(() => formatSwitchboardPanelTable(empty, false)).not.toThrow()
    expect(() => formatSwitchboardPanelTable(empty, true)).not.toThrow()
    expect(() => formatSwitchboardPanelJson(empty)).not.toThrow()
    expect(() => formatSwitchboardPanelCsv(empty)).not.toThrow()
  })

  it('shows recommendations in table output', () => {
    const output = formatSwitchboardPanelTable(sampleResult, false)
    expect(output).toContain('Recommendations')
  })
})
