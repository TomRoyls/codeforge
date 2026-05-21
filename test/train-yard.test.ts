import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countShortNames,
  countInterfaces, countReturns,
  classifyCarCondition, classifyLineType,
  classifyLineCondition, classifyStationMasterGrade,
  measureTrack, measureSwitching, measureSignal,
  measureFreight, measureYard, measureSchedule,
  analyzeRailCar, analyzeRailLine,
  generateRecommendations, buildTrainYardResult,
} from '../src/commands/train-yard-helpers.js'
import { formatTrainYardTable, formatTrainYardJson } from '../src/commands/train-yard-format-helpers.js'

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
  '// TODO: fix this',
  'const x = 1',
].join('\n')

const errorHeavyCode = [
  'try {',
  '  doSomething()',
  '} catch (e) {',
  '  handleError(e)',
  '}',
  'try {',
  '  doOther()',
  '} catch (e) {',
  '  handleOther(e)',
  '}',
].join('\n')

const hazmatCode = [
  'const password = "secret123"',
  'const api_key = "key-abc"',
  'function encrypt(data: string): string { return data }',
  'export function processToken(token: string): void {}',
].join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

const multiFileContents = [
  strongCode,
  diverseCode,
  simpleCode,
]

// ─── Content Primitives ──────────────────────────────────────────────────────

describe('train-yard primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc(strongCode)).toBeGreaterThan(10)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(strongCode)).toBe(3)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThan(0)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations(typedCode)).toBeGreaterThan(0)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (x) {}')).toBe(1)
  })

  it('maxNesting counts max brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments(diverseCode)).toBeGreaterThan(0)
  })

  it('countTodos counts TODO/FIXME/HACK/XXX', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts long camelCase names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
  })

  it('countShortNames counts 1-2 char variable names', () => {
    expect(countShortNames(emptyCode)).toBe(0)
    expect(countShortNames('const x = 1')).toBe(1)
  })

  it('countInterfaces counts interface declarations', () => {
    expect(countInterfaces(emptyCode)).toBe(0)
    expect(countInterfaces(diverseCode)).toBe(1)
    expect(countInterfaces(strongCode)).toBe(1)
  })

  it('countReturns counts return statements', () => {
    expect(countReturns(emptyCode)).toBe(0)
    expect(countReturns('return 1')).toBe(1)
  })
})

// ─── Classification Functions ────────────────────────────────────────────────

describe('train-yard classifications', () => {
  it('classifyCarCondition classifies scores', () => {
    expect(classifyCarCondition(90)).toBe('express-train')
    expect(classifyCarCondition(70)).toBe('reliable-service')
    expect(classifyCarCondition(50)).toBe('commuter-rail')
    expect(classifyCarCondition(30)).toBe('freight-train')
    expect(classifyCarCondition(15)).toBe('rusting-hulk')
    expect(classifyCarCondition(5)).toBe('derailed')
  })

  it('classifyLineType returns abandoned-track for empty', () => {
    expect(classifyLineType([])).toBe('abandoned-track')
  })

  it('classifyLineType returns a valid type for cars', () => {
    const car = analyzeRailCar(strongCode, 'a.ts')
    const result = classifyLineType([car])
    expect(['high-speed-rail', 'mainline', 'branch-line', 'light-rail', 'heritage-line', 'abandoned-track']).toContain(result)
  })

  it('classifyLineCondition classifies avg scores', () => {
    expect(classifyLineCondition(80)).toBe('first-class')
    expect(classifyLineCondition(65)).toBe('standard-service')
    expect(classifyLineCondition(45)).toBe('economy')
    expect(classifyLineCondition(30)).toBe('cargo-only')
    expect(classifyLineCondition(15)).toBe('disrepair')
    expect(classifyLineCondition(5)).toBe('wreckage')
  })

  it('classifyStationMasterGrade classifies correctly', () => {
    expect(classifyStationMasterGrade(85)).toBe('chief-station-master')
    expect(classifyStationMasterGrade(70)).toBe('station-master')
    expect(classifyStationMasterGrade(50)).toBe('dispatcher')
    expect(classifyStationMasterGrade(35)).toBe('conductor')
    expect(classifyStationMasterGrade(20)).toBe('porter')
    expect(classifyStationMasterGrade(5)).toBe('hobo')
  })
})

// ─── Measurement Functions ───────────────────────────────────────────────────

describe('train-yard measurements', () => {
  it('measureTrack returns track properties', () => {
    const track = measureTrack(strongCode)
    expect(typeof track.gauge).toBe('number')
    expect(typeof track.isStandardGauge).toBe('boolean')
    expect(typeof track.isNarrowGauge).toBe('boolean')
    expect(typeof track.isBroadGauge).toBe('boolean')
    expect(typeof track.hasClearRoute).toBe('boolean')
    expect(typeof track.hasDeadEnds).toBe('boolean')
    expect(typeof track.deadEndCount).toBe('number')
    expect(typeof track.isElectrified).toBe('boolean')
    expect(typeof track.isDualTrack).toBe('boolean')
  })

  it('measureTrack returns narrow gauge for empty code', () => {
    const track = measureTrack(emptyCode)
    expect(track.isNarrowGauge).toBe(true)
    expect(track.gauge).toBe(0)
    expect(track.isElectrified).toBe(false)
  })

  it('measureTrack detects electrified (typed) code', () => {
    const track = measureTrack(typedCode)
    expect(track.isElectrified).toBe(true)
  })

  it('measureTrack detects dual track (import + export)', () => {
    const track = measureTrack(strongCode)
    expect(track.isDualTrack).toBe(true)
  })

  it('measureSwitching returns switching properties', () => {
    const sw = measureSwitching(strongCode)
    expect(typeof sw.switchCount).toBe('number')
    expect(typeof sw.hasSmoothSwitches).toBe('boolean')
    expect(typeof sw.hasJarringSwitches).toBe('boolean')
    expect(typeof sw.hasBrokenSwitches).toBe('boolean')
    expect(typeof sw.hasRedundantSwitches).toBe('boolean')
    expect(typeof sw.jarringCount).toBe('number')
    expect(typeof sw.brokenCount).toBe('number')
    expect(typeof sw.efficiency).toBe('number')
  })

  it('measureSwitching has smooth switches for simple code', () => {
    const sw = measureSwitching(simpleCode)
    expect(sw.hasSmoothSwitches).toBe(true)
    expect(sw.switchCount).toBe(0)
  })

  it('measureSignal returns signal properties', () => {
    const sig = measureSignal(strongCode)
    expect(typeof sig.hasSignals).toBe('boolean')
    expect(typeof sig.signalCount).toBe('number')
    expect(typeof sig.isReliable).toBe('boolean')
    expect(typeof sig.hasBlindSpots).toBe('boolean')
    expect(typeof sig.hasFalseSignals).toBe('boolean')
    expect(typeof sig.hasDarkSignals).toBe('boolean')
    expect(typeof sig.blindSpotCount).toBe('number')
    expect(typeof sig.falseSignalCount).toBe('number')
    expect(typeof sig.darkSignalCount).toBe('number')
  })

  it('measureSignal detects signals in error-heavy code', () => {
    const sig = measureSignal(errorHeavyCode)
    expect(sig.hasSignals).toBe(true)
    expect(sig.signalCount).toBeGreaterThan(0)
  })

  it('measureSignal has no signals for simple code', () => {
    const sig = measureSignal(simpleCode)
    expect(sig.hasSignals).toBe(false)
  })

  it('measureFreight returns freight properties', () => {
    const fr = measureFreight(strongCode)
    expect(typeof fr.cargo).toBe('string')
    expect(typeof fr.capacity).toBe('number')
    expect(typeof fr.isLoaded).toBe('boolean')
    expect(typeof fr.isEmpty).toBe('boolean')
    expect(typeof fr.isOverloaded).toBe('boolean')
    expect(typeof fr.hasHazmat).toBe('boolean')
    expect(Array.isArray(fr.hazmatType)).toBe(true)
    expect(['intact', 'damaged', 'lost', 'contaminated', 'none']).toContain(fr.cargoCondition)
  })

  it('measureFreight detects hazmat', () => {
    const fr = measureFreight(hazmatCode)
    expect(fr.hasHazmat).toBe(true)
    expect(fr.hazmatType.length).toBeGreaterThan(0)
  })

  it('measureFreight detects empty cargo', () => {
    const fr = measureFreight(emptyCode)
    expect(fr.isEmpty).toBe(true)
    expect(fr.cargo).toBe('none')
  })

  it('measureYard returns yard properties', () => {
    const yard = measureYard(strongCode)
    expect(typeof yard.isOrganized).toBe('boolean')
    expect(typeof yard.hasRoundhouse).toBe('boolean')
    expect(typeof yard.hasTurntable).toBe('boolean')
    expect(typeof yard.hasSiding).toBe('boolean')
    expect(typeof yard.hasFreightHouse).toBe('boolean')
    expect(typeof yard.hasControlTower).toBe('boolean')
    expect(['organized', 'functional', 'chaotic', 'derelict', 'wreck']).toContain(yard.layout)
  })

  it('measureYard returns wreck for empty code', () => {
    const yard = measureYard(emptyCode)
    expect(yard.layout).toBe('wreck')
    expect(yard.isOrganized).toBe(false)
  })

  it('measureYard detects organized code', () => {
    const yard = measureYard(strongCode)
    expect(yard.isOrganized).toBe(true)
    expect(yard.hasTurntable).toBe(true)
  })

  it('measureSchedule returns schedule properties', () => {
    const sched = measureSchedule(strongCode)
    expect(typeof sched.isOnTime).toBe('boolean')
    expect(typeof sched.hasDelays).toBe('boolean')
    expect(typeof sched.hasExpress).toBe('boolean')
    expect(typeof sched.hasLocal).toBe('boolean')
    expect(typeof sched.hasFreight).toBe('boolean')
    expect(typeof sched.delayCount).toBe('number')
    expect(typeof sched.expressCount).toBe('number')
  })

  it('measureSchedule detects on-time for clean code', () => {
    const sched = measureSchedule(simpleCode)
    expect(sched.isOnTime).toBe(true)
  })
})

// ─── Core Analysis ───────────────────────────────────────────────────────────

describe('analyzeRailCar', () => {
  it('returns derailed car for empty code', () => {
    const car = analyzeRailCar(emptyCode, 'empty.ts')
    expect(car.file).toBe('empty.ts')
    expect(car.trackQuality).toBe(0)
    expect(car.condition).toBe('derailed')
    expect(car.qualityScore).toBe(0)
    expect(car.freight.isEmpty).toBe(true)
    expect(car.schedule.isOnTime).toBe(true)
  })

  it('returns correct properties for simple code', () => {
    const car = analyzeRailCar(simpleCode, 'simple.ts')
    expect(car.file).toBe('simple.ts')
    expect(typeof car.trackQuality).toBe('number')
    expect(typeof car.switchingEfficiency).toBe('number')
    expect(typeof car.signalReliability).toBe('number')
    expect(typeof car.freightHandling).toBe('number')
    expect(typeof car.yardOrganization).toBe('number')
    expect(typeof car.qualityScore).toBe('number')
  })

  it('returns higher quality for strong code vs simple code', () => {
    const simple = analyzeRailCar(simpleCode, 'simple.ts')
    const strong = analyzeRailCar(strongCode, 'strong.ts')
    expect(strong.qualityScore).toBeGreaterThan(simple.qualityScore)
  })

  it('measures all sub-objects', () => {
    const car = analyzeRailCar(strongCode, 'test.ts')
    expect(car.track).toBeDefined()
    expect(car.switching).toBeDefined()
    expect(car.signal).toBeDefined()
    expect(car.freight).toBeDefined()
    expect(car.yard).toBeDefined()
    expect(car.schedule).toBeDefined()
  })

  it('classifies condition from quality score', () => {
    const strong = analyzeRailCar(strongCode, 'strong.ts')
    expect(['express-train', 'reliable-service', 'commuter-rail', 'freight-train', 'rusting-hulk', 'derailed']).toContain(strong.condition)
  })
})

// ─── Line Analysis ───────────────────────────────────────────────────────────

describe('analyzeRailLine', () => {
  it('returns abandoned-track for empty cars', () => {
    const line = analyzeRailLine([], 'empty-dir')
    expect(line.directory).toBe('empty-dir')
    expect(line.cars).toEqual([])
    expect(line.lineType).toBe('abandoned-track')
    expect(line.condition).toBe('wreckage')
  })

  it('computes averages from cars', () => {
    const car = analyzeRailCar(strongCode, 'a.ts')
    const line = analyzeRailLine([car], 'src')
    expect(line.avgTrackQuality).toBe(car.trackQuality)
    expect(line.cars.length).toBe(1)
  })

  it('counts express and derailed cars', () => {
    const strong = analyzeRailCar(strongCode, 'a.ts')
    const empty = analyzeRailCar(emptyCode, 'b.ts')
    const line = analyzeRailLine([strong, empty], 'src')
    expect(line.expressCount + line.derailedCount).toBeLessThanOrEqual(2)
  })

  it('totals switches and signals', () => {
    const c1 = analyzeRailCar(strongCode, 'a.ts')
    const line = analyzeRailLine([c1], 'src')
    expect(line.totalSwitches).toBe(c1.switching.switchCount)
    expect(line.totalSignals).toBe(c1.signal.signalCount)
  })
})

// ─── Recommendations ─────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends about derailed cars', () => {
    const stats = { derailedCount: 2, totalDarkSignals: 0, totalBlindSpots: 2, overallEfficiency: 30, hasHazmatCount: 0, abandonedTrackCount: 0 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Derailed cars'))).toBe(true)
  })

  it('recommends about dark signals', () => {
    const stats = { derailedCount: 0, totalDarkSignals: 3, totalBlindSpots: 2, overallEfficiency: 30, hasHazmatCount: 0, abandonedTrackCount: 0 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Dark signals'))).toBe(true)
  })

  it('recommends about blind spots', () => {
    const stats = { derailedCount: 0, totalDarkSignals: 0, totalBlindSpots: 8, overallEfficiency: 30, hasHazmatCount: 0, abandonedTrackCount: 0 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Blind spots'))).toBe(true)
  })

  it('recommends about on schedule', () => {
    const stats = { derailedCount: 0, totalDarkSignals: 0, totalBlindSpots: 2, overallEfficiency: 65, hasHazmatCount: 0, abandonedTrackCount: 0 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('On schedule'))).toBe(true)
  })

  it('recommends about hazmat', () => {
    const stats = { derailedCount: 0, totalDarkSignals: 0, totalBlindSpots: 2, overallEfficiency: 30, hasHazmatCount: 2, abandonedTrackCount: 0 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Hazmat'))).toBe(true)
  })

  it('recommends about abandoned tracks', () => {
    const stats = { derailedCount: 0, totalDarkSignals: 0, totalBlindSpots: 2, overallEfficiency: 30, hasHazmatCount: 0, abandonedTrackCount: 1 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Abandoned tracks'))).toBe(true)
  })

  it('returns empty for no issues', () => {
    const stats = { derailedCount: 0, totalDarkSignals: 0, totalBlindSpots: 2, overallEfficiency: 30, hasHazmatCount: 0, abandonedTrackCount: 0 } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs).toEqual([])
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe('buildTrainYardResult', () => {
  it('handles empty input', () => {
    const result = buildTrainYardResult([], [], {})
    expect(result.cars).toEqual([])
    expect(result.lines).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('produces car for each file', () => {
    const result = buildTrainYardResult(multiFilePaths, multiFileContents, {})
    expect(result.cars.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups cars into lines by directory', () => {
    const result = buildTrainYardResult(multiFilePaths, multiFileContents, {})
    expect(result.lines.length).toBe(1)
    expect(result.lines[0].directory).toBe('src')
    expect(result.lines[0].cars.length).toBe(3)
  })

  it('creates multiple lines for different directories', () => {
    const paths = ['src/a.ts', 'lib/b.ts']
    const contents = [strongCode, simpleCode]
    const result = buildTrainYardResult(paths, contents, {})
    expect(result.lines.length).toBe(2)
  })

  it('computes network overview', () => {
    const result = buildTrainYardResult(multiFilePaths, multiFileContents, {})
    expect(typeof result.network.avgTrackQuality).toBe('number')
    expect(typeof result.network.avgSwitchingEfficiency).toBe('number')
    expect(typeof result.network.avgSignalReliability).toBe('number')
    expect(typeof result.network.avgFreightHandling).toBe('number')
    expect(typeof result.network.isOnSchedule).toBe('boolean')
    expect(typeof result.network.overallEfficiency).toBe('number')
  })

  it('computes all stat fields', () => {
    const result = buildTrainYardResult(multiFilePaths, multiFileContents, {})
    const s = result.stats
    expect(typeof s.totalFiles).toBe('number')
    expect(typeof s.totalLines).toBe('number')
    expect(typeof s.avgTrackQuality).toBe('number')
    expect(typeof s.avgSwitchingEfficiency).toBe('number')
    expect(typeof s.avgSignalReliability).toBe('number')
    expect(typeof s.avgFreightHandling).toBe('number')
    expect(typeof s.avgYardOrganization).toBe('number')
    expect(typeof s.expressTrainCount).toBe('number')
    expect(typeof s.reliableServiceCount).toBe('number')
    expect(typeof s.commuterRailCount).toBe('number')
    expect(typeof s.freightTrainCount).toBe('number')
    expect(typeof s.rustingHulkCount).toBe('number')
    expect(typeof s.derailedCount).toBe('number')
    expect(typeof s.highSpeedRailCount).toBe('number')
    expect(typeof s.mainlineCount).toBe('number')
    expect(typeof s.branchLineCount).toBe('number')
    expect(typeof s.abandonedTrackCount).toBe('number')
    expect(typeof s.totalSwitches).toBe('number')
    expect(typeof s.totalSignals).toBe('number')
    expect(typeof s.totalDeadEnds).toBe('number')
    expect(typeof s.totalBlindSpots).toBe('number')
    expect(typeof s.totalDarkSignals).toBe('number')
    expect(typeof s.electrifiedCount).toBe('number')
    expect(typeof s.standardGaugeCount).toBe('number')
    expect(typeof s.hasHazmatCount).toBe('number')
    expect(typeof s.overallEfficiency).toBe('number')
    expect(typeof s.stationMasterGrade).toBe('string')
    expect(typeof s.bestTrack).toBe('string')
    expect(typeof s.worstTrack).toBe('string')
    expect(typeof s.mostReliable).toBe('string')
    expect(typeof s.mostDerailments).toBe('string')
    expect(typeof s.busiest).toBe('string')
  })

  it('handles single file', () => {
    const result = buildTrainYardResult(['a.ts'], [strongCode], {})
    expect(result.cars.length).toBe(1)
    expect(result.lines.length).toBe(1)
  })

  it('handles missing content gracefully', () => {
    const result = buildTrainYardResult(['a.ts', 'b.ts'], [''], {})
    expect(result.cars.length).toBe(2)
    expect(result.cars[0].condition).toBe('derailed')
  })

  it('produces recommendations', () => {
    const result = buildTrainYardResult(multiFilePaths, multiFileContents, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('train-yard format helpers', () => {
  const sampleResult = buildTrainYardResult(multiFilePaths, multiFileContents, {})

  it('formatTrainYardTable returns string', () => {
    const output = formatTrainYardTable(sampleResult, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
    expect(output).toContain('Train Yard')
  })

  it('formatTrainYardTable includes cars section', () => {
    const output = formatTrainYardTable(sampleResult, false)
    expect(output).toContain('Rail Cars')
  })

  it('formatTrainYardTable includes stats section', () => {
    const output = formatTrainYardTable(sampleResult, false)
    expect(output).toContain('Statistics')
  })

  it('formatTrainYardTable verbose shows more detail', () => {
    const brief = formatTrainYardTable(sampleResult, false)
    const verbose = formatTrainYardTable(sampleResult, true)
    expect(verbose.length).toBeGreaterThanOrEqual(brief.length)
  })

  it('formatTrainYardTable handles empty result', () => {
    const emptyResult = buildTrainYardResult([], [], {})
    const output = formatTrainYardTable(emptyResult, false)
    expect(output).toContain('No files analyzed')
  })

  it('formatTrainYardJson returns valid JSON', () => {
    const output = formatTrainYardJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.cars).toBeDefined()
    expect(parsed.lines).toBeDefined()
    expect(parsed.network).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatTrainYardJson handles empty result', () => {
    const emptyResult = buildTrainYardResult([], [], {})
    const output = formatTrainYardJson(emptyResult)
    const parsed = JSON.parse(output)
    expect(parsed.cars).toEqual([])
    expect(parsed.stats.totalFiles).toBe(0)
  })

  it('formatTrainYardTable includes network section', () => {
    const output = formatTrainYardTable(sampleResult, false)
    expect(output).toContain('Network')
  })

  it('formatTrainYardTable includes lines section', () => {
    const output = formatTrainYardTable(sampleResult, false)
    expect(output).toContain('Rail Lines')
  })

  it('formatTrainYardTable includes recommendations when present', () => {
    const paths = ['bad.ts']
    const contents = [emptyCode]
    const result = buildTrainYardResult(paths, contents, {})
    const output = formatTrainYardTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })
})
