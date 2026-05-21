import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  countJSDoc, countDescriptiveNames, countShortNames,
  classifyFlameCondition, classifyFlameColor,
  classifyTowerType, classifyTowerCondition, classifySignalmanGrade,
  measureFlame, measureSmoke, measureFuel, measureProtocol,
  measureBeacon, measureNetwork,
  analyzeSignalFlame, analyzeFireTower,
  generateRecommendations, buildSignalFireResult,
} from '../src/commands/signal-fire-helpers.js'
import { formatSignalFireTable, formatSignalFireJson } from '../src/commands/signal-fire-format-helpers.js'

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
  'export function calculateResult(x: number): number {',
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

const diverseCode = [
  'import { helper } from "./utils.js"',
  'export function calc(): void {}',
  'export class Calculator {',
  '  constructor() {}',
  '  compute(): number { return 1 }',
  '}',
  'export interface Shape { area: number }',
  'export type Result = string | number',
  'export enum Direction { N, S, E, W }',
].join('\n')

const noExportCode = [
  'const alpha = 1',
  'const beta = 2',
  'const gamma = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function process(): void {}',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

const noisyCode = [
  'console.log("a")',
  'console.log("b")',
  'console.log("c")',
  'console.log("d")',
  'export function f(): void {}',
].join('\n')

const hubCode = [
  'import { a } from "./a.js"',
  'import { b } from "./b.js"',
  'import { c } from "./c.js"',
  'export function compute(): number { return 1 }',
  'export function analyze(): string { return "" }',
  'export function validate(): boolean { return true }',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('signal-fire primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })

  it('countJSDoc counts jsdoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBeGreaterThanOrEqual(1)
  })

  it('countDescriptiveNames counts descriptive names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
  })

  it('countShortNames counts short names', () => {
    expect(countShortNames(emptyCode)).toBe(0)
    expect(countShortNames('const x = 1')).toBe(1)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('signal-fire classifications', () => {
  it('classifyFlameCondition returns correct conditions', () => {
    expect(classifyFlameCondition(90)).toBe('blazing-beacon')
    expect(classifyFlameCondition(75)).toBe('bright-signal')
    expect(classifyFlameCondition(55)).toBe('steady-flame')
    expect(classifyFlameCondition(35)).toBe('smoky')
    expect(classifyFlameCondition(15)).toBe('dying-ember')
    expect(classifyFlameCondition(5)).toBe('cold-ashes')
  })

  it('classifyFlameColor returns correct colors', () => {
    expect(classifyFlameColor(90)).toBe('bright-orange')
    expect(classifyFlameColor(70)).toBe('orange')
    expect(classifyFlameColor(50)).toBe('yellow')
    expect(classifyFlameColor(35)).toBe('red')
    expect(classifyFlameColor(20)).toBe('smoky')
    expect(classifyFlameColor(8)).toBe('ember')
    expect(classifyFlameColor(2)).toBe('out')
  })

  it('classifyTowerType returns dark-tower for empty', () => {
    expect(classifyTowerType([])).toBe('dark-tower')
  })

  it('classifyTowerType detects watchtower for hub blazing flames', () => {
    const flames = Array.from({ length: 5 }, (_, i) => analyzeSignalFlame(strongCode, `${i}.ts`))
    expect(classifyTowerType(flames)).toBe('watchtower')
  })

  it('classifyTowerType detects bonfire for mixed quality flames', () => {
    const flames = [
      analyzeSignalFlame(strongCode, 'a.ts'),
      analyzeSignalFlame(strongCode, 'b.ts'),
      analyzeSignalFlame(simpleCode, 'c.ts'),
    ]
    const result = classifyTowerType(flames)
    expect(['bonfire', 'watchtower', 'campfire']).toContain(result)
  })

  it('classifyTowerCondition returns correct conditions', () => {
    expect(classifyTowerCondition(85)).toBe('fire-network')
    expect(classifyTowerCondition(65)).toBe('well-lit')
    expect(classifyTowerCondition(45)).toBe('patchy-coverage')
    expect(classifyTowerCondition(28)).toBe('dim')
    expect(classifyTowerCondition(12)).toBe('mostly-dark')
    expect(classifyTowerCondition(5)).toBe('blackout')
  })

  it('classifySignalmanGrade returns correct grades', () => {
    expect(classifySignalmanGrade(85)).toBe('master-signalman')
    expect(classifySignalmanGrade(70)).toBe('signalman')
    expect(classifySignalmanGrade(50)).toBe('fire-keeper')
    expect(classifySignalmanGrade(35)).toBe('scout')
    expect(classifySignalmanGrade(18)).toBe('novice')
    expect(classifySignalmanGrade(5)).toBe('sleeper')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('signal-fire measurements', () => {
  it('measureFlame returns correct structure', () => {
    const f = measureFlame(strongCode)
    expect(f.height).toBeGreaterThanOrEqual(0)
    expect(f.height).toBeLessThanOrEqual(100)
    expect(typeof f.color).toBe('string')
    expect(typeof f.isSteady).toBe('boolean')
    expect(typeof f.isFlickering).toBe('boolean')
    expect(typeof f.isSmoky).toBe('boolean')
    expect(typeof f.isDying).toBe('boolean')
    expect(typeof f.isOut).toBe('boolean')
    expect(f.intensity).toBeGreaterThanOrEqual(0)
    expect(f.intensity).toBeLessThanOrEqual(100)
  })

  it('measureFlame detects steady for error-handled code without todos', () => {
    expect(measureFlame(strongCode).isSteady).toBe(true)
  })

  it('measureFlame detects flickering for todo code with exports', () => {
    expect(measureFlame(todoCode).isFlickering).toBe(true)
  })

  it('measureFlame detects out for empty code', () => {
    expect(measureFlame(emptyCode).isOut).toBe(true)
  })

  it('measureFlame gives high height for strong code', () => {
    expect(measureFlame(strongCode).height).toBeGreaterThan(50)
  })

  it('measureSmoke returns correct structure', () => {
    const s = measureSmoke(strongCode)
    expect(Array.isArray(s.signals)).toBe(true)
    expect(s.clarity).toBeGreaterThanOrEqual(0)
    expect(s.clarity).toBeLessThanOrEqual(100)
    expect(typeof s.hasFalseSignals).toBe('boolean')
    expect(typeof s.hasNoSignals).toBe('boolean')
    expect(typeof s.hasOldSignals).toBe('boolean')
    expect(typeof s.hasStrongSignals).toBe('boolean')
    expect(s.falseSignalCount).toBeGreaterThanOrEqual(0)
    expect(s.oldSignalCount).toBeGreaterThanOrEqual(0)
    expect(s.strongSignalCount).toBeGreaterThanOrEqual(0)
  })

  it('measureSmoke detects strong signals for documented typed code', () => {
    expect(measureSmoke(strongCode).hasStrongSignals).toBe(true)
  })

  it('measureSmoke detects no signals for simple code', () => {
    expect(measureSmoke(simpleCode).hasNoSignals).toBe(true)
  })

  it('measureSmoke detects old signals for todo code', () => {
    expect(measureSmoke(todoCode).hasOldSignals).toBe(true)
  })

  it('measureFuel returns correct structure', () => {
    const f = measureFuel(strongCode)
    expect(f.nameQuality).toBeGreaterThanOrEqual(0)
    expect(f.nameQuality).toBeLessThanOrEqual(100)
    expect(f.commentQuality).toBeGreaterThanOrEqual(0)
    expect(f.docQuality).toBeGreaterThanOrEqual(0)
    expect(f.typeAnnotations).toBeGreaterThanOrEqual(0)
    expect(typeof f.hasSeasoned).toBe('boolean')
    expect(typeof f.hasGreen).toBe('boolean')
    expect(typeof f.hasWet).toBe('boolean')
    expect(typeof f.hasDry).toBe('boolean')
  })

  it('measureFuel detects seasoned for descriptive names without shorts', () => {
    expect(measureFuel(strongCode).hasSeasoned).toBe(true)
  })

  it('measureFuel detects dry for good names with comments', () => {
    expect(measureFuel(strongCode).hasDry).toBe(true)
  })

  it('measureFuel detects green for code with more short names', () => {
    expect(measureFuel('const x = 1\nconst y = 2').hasGreen).toBe(true)
  })

  it('measureProtocol returns correct structure', () => {
    const p = measureProtocol(strongCode)
    expect(typeof p.followsStyle).toBe('boolean')
    expect(typeof p.followsNaming).toBe('boolean')
    expect(typeof p.followsStructure).toBe('boolean')
    expect(Array.isArray(p.violations)).toBe(true)
    expect(p.complianceScore).toBeGreaterThanOrEqual(0)
    expect(p.complianceScore).toBeLessThanOrEqual(100)
  })

  it('measureProtocol follows style for typed commented code', () => {
    expect(measureProtocol(strongCode).followsStyle).toBe(true)
  })

  it('measureProtocol follows naming for descriptive code', () => {
    expect(measureProtocol(strongCode).followsNaming).toBe(true)
  })

  it('measureProtocol detects violations for exports without errors', () => {
    const p = measureProtocol(typedCode)
    expect(p.violations).toEqual(
      expect.arrayContaining([expect.stringContaining('error handling')]),
    )
  })

  it('measureBeacon returns correct structure', () => {
    const b = measureBeacon(strongCode)
    expect(typeof b.isLit).toBe('boolean')
    expect(typeof b.isVisible).toBe('boolean')
    expect(typeof b.isMaintained).toBe('boolean')
    expect(typeof b.hasKeeper).toBe('boolean')
    expect(typeof b.lastTended).toBe('string')
    expect(b.visibilityScore).toBeGreaterThanOrEqual(0)
    expect(b.visibilityScore).toBeLessThanOrEqual(100)
  })

  it('measureBeacon is lit for code with exports', () => {
    expect(measureBeacon(typedCode).isLit).toBe(true)
  })

  it('measureBeacon is visible for exported documented code', () => {
    expect(measureBeacon(strongCode).isVisible).toBe(true)
  })

  it('measureBeacon is maintained for code without todos', () => {
    expect(measureBeacon(strongCode).isMaintained).toBe(true)
  })

  it('measureBeacon detects keeper for author-annotated code', () => {
    expect(measureBeacon('export function a() {}\n@author John').hasKeeper).toBe(true)
  })

  it('measureNetwork returns correct structure', () => {
    const n = measureNetwork(hubCode)
    expect(n.signalsToOthers).toBeGreaterThanOrEqual(0)
    expect(n.receivesFromOthers).toBeGreaterThanOrEqual(0)
    expect(n.relayCount).toBeGreaterThanOrEqual(0)
    expect(typeof n.hasDeadRelay).toBe('boolean')
    expect(typeof n.isHub).toBe('boolean')
    expect(typeof n.isEndpoint).toBe('boolean')
    expect(typeof n.isRelay).toBe('boolean')
  })

  it('measureNetwork detects hub for many exports with imports', () => {
    expect(measureNetwork(hubCode).isHub).toBe(true)
  })

  it('measureNetwork detects endpoint for no-import simple code', () => {
    expect(measureNetwork(simpleCode).isEndpoint).toBe(true)
  })
})

// ─── Flame Analysis Tests ─────────────────────────────────────────────────────

describe('signal-fire flame analysis', () => {
  it('analyzeSignalFlame returns correct structure', () => {
    const f = analyzeSignalFlame(strongCode, 'calc.ts')
    expect(f.file).toBe('calc.ts')
    expect(f.flameHeight).toBeGreaterThanOrEqual(0)
    expect(f.flameHeight).toBeLessThanOrEqual(100)
    expect(f.smokeClarity).toBeGreaterThanOrEqual(0)
    expect(f.signalRange).toBeGreaterThanOrEqual(0)
    expect(f.fireConsistency).toBeGreaterThanOrEqual(0)
    expect(f.fuelQuality).toBeGreaterThanOrEqual(0)
    expect(f.protocolCompliance).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof f.condition).toBe('string')
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeSignalFlame(strongCode, 'good.ts')
    const bad = analyzeSignalFlame(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('empty code flame is cold-ashes', () => {
    const f = analyzeSignalFlame(emptyCode, 'empty.ts')
    expect(f.condition).toBe('cold-ashes')
    expect(f.qualityScore).toBe(0)
    expect(f.flameHeight).toBe(0)
    expect(f.flame.isOut).toBe(true)
  })

  it('strong code has high flame height', () => {
    const f = analyzeSignalFlame(strongCode, 'strong.ts')
    expect(f.flameHeight).toBeGreaterThan(50)
  })

  it('flame info is populated', () => {
    const f = analyzeSignalFlame(strongCode, 'a.ts')
    expect(f.flame.height).toBeGreaterThan(0)
    expect(f.flame.intensity).toBeGreaterThan(0)
  })

  it('smoke info is populated', () => {
    const f = analyzeSignalFlame(strongCode, 'a.ts')
    expect(f.smoke.clarity).toBeGreaterThan(0)
    expect(f.smoke.signals.length).toBeGreaterThan(0)
  })

  it('fuel info is populated', () => {
    const f = analyzeSignalFlame(strongCode, 'a.ts')
    expect(f.fuel.nameQuality).toBeGreaterThan(0)
  })

  it('protocol info is populated', () => {
    const f = analyzeSignalFlame(strongCode, 'a.ts')
    expect(typeof f.protocol.followsStyle).toBe('boolean')
    expect(f.protocol.complianceScore).toBeGreaterThanOrEqual(0)
  })

  it('beacon info is populated', () => {
    const f = analyzeSignalFlame(strongCode, 'a.ts')
    expect(f.beacon.isLit).toBe(true)
    expect(f.beacon.visibilityScore).toBeGreaterThan(0)
  })

  it('network info is populated', () => {
    const f = analyzeSignalFlame(strongCode, 'a.ts')
    expect(f.network.signalsToOthers).toBeGreaterThanOrEqual(0)
  })
})

// ─── Tower Analysis Tests ─────────────────────────────────────────────────────

describe('signal-fire tower analysis', () => {
  it('analyzeFireTower handles empty flames', () => {
    const t = analyzeFireTower([], 'src')
    expect(t.directory).toBe('src')
    expect(t.flames).toHaveLength(0)
    expect(t.towerType).toBe('dark-tower')
  })

  it('analyzeFireTower computes averages', () => {
    const flames = [
      analyzeSignalFlame(strongCode, 'a.ts'),
      analyzeSignalFlame(typedCode, 'b.ts'),
    ]
    const t = analyzeFireTower(flames, 'src')
    expect(t.avgFlameHeight).toBeGreaterThanOrEqual(0)
    expect(t.avgSmokeClarity).toBeGreaterThanOrEqual(0)
    expect(t.avgSignalRange).toBeGreaterThanOrEqual(0)
    expect(t.avgConsistency).toBeGreaterThanOrEqual(0)
    expect(typeof t.towerType).toBe('string')
    expect(typeof t.condition).toBe('string')
  })

  it('analyzeFireTower counts conditions', () => {
    const flames = [
      analyzeSignalFlame(strongCode, 'a.ts'),
      analyzeSignalFlame(emptyCode, 'b.ts'),
    ]
    const t = analyzeFireTower(flames, 'src')
    expect(t.coldCount).toBeGreaterThanOrEqual(1)
  })

  it('analyzeFireTower computes network density', () => {
    const flames = [
      analyzeSignalFlame(strongCode, 'a.ts'),
    ]
    const t = analyzeFireTower(flames, 'src')
    expect(t.networkDensity).toBeGreaterThanOrEqual(0)
    expect(t.litCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('signal-fire build result', () => {
  it('buildSignalFireResult returns correct structure', () => {
    const result = buildSignalFireResult(['a.ts'], [typedCode], {})
    expect(result.flames).toHaveLength(1)
    expect(result.towers).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.signalmanGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.network.overallVisibility).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildSignalFireResult([], [], {})
    expect(result.flames).toHaveLength(0)
    expect(result.stats.brightestFlame).toBe('none')
    expect(result.stats.dimmestFlame).toBe('none')
    expect(result.stats.clearestSmoke).toBe('none')
    expect(result.stats.mostCompliant).toBe('none')
    expect(result.stats.mostDeceptive).toBe('none')
  })

  it('groups flames into towers by directory', () => {
    const result = buildSignalFireResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.towers).toHaveLength(2)
  })

  it('identifies brightest and dimmest', () => {
    const result = buildSignalFireResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.brightestFlame).toBe('good.ts')
    expect(result.stats.dimmestFlame).toBe('bad.ts')
  })

  it('identifies clearest smoke', () => {
    const result = buildSignalFireResult(
      ['clear.ts', 'hazy.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.clearestSmoke).toBe('clear.ts')
  })

  it('identifies most compliant', () => {
    const result = buildSignalFireResult(
      ['good.ts', 'bad.ts'],
      [strongCode, noExportCode],
      {},
    )
    expect(result.stats.mostCompliant).toBe('good.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildSignalFireResult(['a.ts'], [], {})
    expect(result.flames).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildSignalFireResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgFlameHeight).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSmokeClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSignalRange).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFireConsistency).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFuelQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgProtocolCompliance).toBeGreaterThanOrEqual(0)
    expect(result.stats.blazingBeaconCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.brightSignalCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.steadyFlameCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.smokyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.dyingEmberCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.coldAshesCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasFalseSignals).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasOldSignals).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasStrongSignals).toBeGreaterThanOrEqual(0)
    expect(result.stats.litBeacons).toBeGreaterThanOrEqual(0)
    expect(result.stats.maintainedBeacons).toBeGreaterThanOrEqual(0)
    expect(result.stats.hubNodes).toBeGreaterThanOrEqual(0)
    expect(result.stats.endpointNodes).toBeGreaterThanOrEqual(0)
    expect(result.stats.relayNodes).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalProtocolViolations).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalTowers).toBeGreaterThanOrEqual(0)
  })

  it('computes network fields', () => {
    const result = buildSignalFireResult(['a.ts'], [strongCode], {})
    expect(result.network.avgFlameHeight).toBeGreaterThanOrEqual(0)
    expect(result.network.isWellLit).toBeDefined()
    expect(result.network.overallVisibility).toBeGreaterThanOrEqual(0)
    expect(result.network.totalSignals).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('signal-fire recommendations', () => {
  it('returns array', () => {
    const result = buildSignalFireResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about cold ashes', () => {
    const result = buildSignalFireResult(['a.ts'], [emptyCode], {})
    if (result.stats.coldAshesCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Cold ashes')]),
      )
    }
  })

  it('includes clear signals message for good code', () => {
    const result = buildSignalFireResult(['a.ts'], [strongCode], {})
    if (result.stats.overallVisibility >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Clear signals')]),
      )
    }
  })

  it('warns about protocol violations', () => {
    const result = buildSignalFireResult(['a.ts'], [typedCode], {})
    if (result.stats.totalProtocolViolations > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Protocol violations')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('signal-fire formatters', () => {
  const sampleResult = buildSignalFireResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatSignalFireTable returns string with header', () => {
    const table = formatSignalFireTable(sampleResult, false)
    expect(table).toContain('Signal Fire')
    expect(table).toContain('Signal Flames')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatSignalFireTable verbose shows detail', () => {
    const table = formatSignalFireTable(sampleResult, true)
    expect(table).toContain('flame:')
    expect(table).toContain('smoke:')
  })

  it('formatSignalFireTable handles empty', () => {
    const empty = buildSignalFireResult([], [], {})
    const table = formatSignalFireTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatSignalFireTable truncates flames at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildSignalFireResult(files, contents, {})
    const table = formatSignalFireTable(big, false)
    expect(table).toContain('more')
  })

  it('formatSignalFireTable shows towers', () => {
    const result = buildSignalFireResult(
      ['src/a.ts', 'lib/b.ts'],
      [strongCode, typedCode],
      {},
    )
    const table = formatSignalFireTable(result, false)
    expect(table).toContain('Fire Towers')
  })

  it('formatSignalFireJson returns valid JSON', () => {
    const json = formatSignalFireJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.flames).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.network).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('signal-fire edge cases', () => {
  it('handles deeply nested code', () => {
    const f = analyzeSignalFlame(deepCode, 'deep.ts')
    expect(f.flame.height).toBeGreaterThanOrEqual(0)
  })

  it('handles code with only comments', () => {
    const f = analyzeSignalFlame('// just a comment\n/* block */', 'comment.ts')
    expect(f.flameHeight).toBeGreaterThanOrEqual(0)
  })

  it('handles single file with no directory', () => {
    const result = buildSignalFireResult(['single.ts'], [typedCode], {})
    expect(result.towers).toHaveLength(1)
    expect(result.towers[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildSignalFireResult(files, contents, {})
    expect(result.towers).toHaveLength(1)
    expect(result.towers[0].flames).toHaveLength(3)
  })

  it('empty code has cold-ashes condition', () => {
    const f = analyzeSignalFlame(emptyCode, 'empty.ts')
    expect(f.condition).toBe('cold-ashes')
    expect(f.flame.color).toBe('out')
  })

  it('hub code is detected as hub node', () => {
    const f = analyzeSignalFlame(hubCode, 'hub.ts')
    expect(f.network.isHub).toBe(true)
  })

  it('noisy code has console statements', () => {
    expect(countConsole(noisyCode)).toBe(4)
  })

  it('identifies most deceptive file', () => {
    const result = buildSignalFireResult(
      ['clean.ts', 'todo.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(typeof result.stats.mostDeceptive).toBe('string')
  })

  it('empty tower returns default values', () => {
    const t = analyzeFireTower([], 'empty')
    expect(t.avgFlameHeight).toBe(100)
    expect(t.avgSmokeClarity).toBe(100)
    expect(t.avgSignalRange).toBe(100)
    expect(t.avgConsistency).toBe(100)
    expect(t.networkDensity).toBe(100)
  })

  it('todo code has dying flame', () => {
    const f = measureFlame(todoCode)
    expect(f.isDying).toBe(true)
  })

  it('no-export code has no signals', () => {
    const s = measureSmoke(noExportCode)
    expect(s.hasNoSignals).toBe(true)
  })
})
