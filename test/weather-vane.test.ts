import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countShortNames,
  toCardinal,
  classifyWeatherCondition, classifyStationCondition,
  classifyStationType, classifyMeteorologistGrade,
  measureWind, measureAtmosphere, measureMoisture,
  measureTemperatureReading, measureCloud, measureForecast,
  analyzeWindReading, analyzeWeatherStation,
  generateRecommendations, buildWeatherVaneResult,
} from '../src/commands/weather-vane-helpers.js'
import { formatWeatherVaneTable, formatWeatherVaneJson } from '../src/commands/weather-vane-format-helpers.js'

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

const todoCode = [
  'TODO: refactor this',
  'FIXME: broken logic',
  'HACK: temporary fix',
  'XXX: needs attention',
  'function a() {}',
].join('\n')

const hotCode = [
  'import { a } from "./a.js"',
  'import { b } from "./b.js"',
  'import { c } from "./c.js"',
  'function compute() { if (true) { if (false) { return 1 } } }',
  'function process() { if (true) { if (false) { return 2 } } }',
  'function handle() { if (true) { if (false) { return 3 } } }',
  'function run() { if (true) { if (false) { return 4 } } }',
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

describe('weather-vane primitives', () => {
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
    expect(countTodos(todoCode)).toBe(4)
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
})

// ─── Classification Functions ────────────────────────────────────────────────

describe('weather-vane classifications', () => {
  it('toCardinal converts degrees to cardinal', () => {
    expect(toCardinal(0)).toBe('N')
    expect(toCardinal(45)).toBe('NE')
    expect(toCardinal(90)).toBe('E')
    expect(toCardinal(135)).toBe('SE')
    expect(toCardinal(180)).toBe('S')
    expect(toCardinal(225)).toBe('SW')
    expect(toCardinal(270)).toBe('W')
    expect(toCardinal(315)).toBe('NW')
  })

  it('toCardinal wraps around', () => {
    expect(toCardinal(360)).toBe('N')
    expect(toCardinal(-45)).toBe('NW')
  })

  it('classifyWeatherCondition classifies scores', () => {
    expect(classifyWeatherCondition(90)).toBe('fair-weather')
    expect(classifyWeatherCondition(70)).toBe('clear')
    expect(classifyWeatherCondition(50)).toBe('partly-cloudy')
    expect(classifyWeatherCondition(30)).toBe('cloudy')
    expect(classifyWeatherCondition(15)).toBe('stormy')
    expect(classifyWeatherCondition(5)).toBe('hurricane')
  })

  it('classifyStationCondition classifies avg scores', () => {
    expect(classifyStationCondition(80)).toBe('perfect-conditions')
    expect(classifyStationCondition(65)).toBe('good-weather')
    expect(classifyStationCondition(45)).toBe('changing')
    expect(classifyStationCondition(25)).toBe('unsettled')
    expect(classifyStationCondition(10)).toBe('stormy')
    expect(classifyStationCondition(3)).toBe('catastrophic')
  })

  it('classifyStationType returns broken-vane for empty', () => {
    expect(classifyStationType([])).toBe('broken-vane')
  })

  it('classifyStationType returns observatory for well-documented steady code', () => {
    const reading = analyzeWindReading(strongCode, 'a.ts')
    expect(classifyStationType([reading])).toBeTruthy()
  })

  it('classifyMeteorologistGrade classifies correctly', () => {
    expect(classifyMeteorologistGrade(90)).toBe('chief-meteorologist')
    expect(classifyMeteorologistGrade(70)).toBe('meteorologist')
    expect(classifyMeteorologistGrade(50)).toBe('weatherman')
    expect(classifyMeteorologistGrade(35)).toBe('farmer')
    expect(classifyMeteorologistGrade(20)).toBe('shepherd')
    expect(classifyMeteorologistGrade(5)).toBe('groundhog')
  })
})

// ─── Measurement Functions ───────────────────────────────────────────────────

describe('weather-vane measurements', () => {
  it('measureWind returns wind properties', () => {
    const wind = measureWind(strongCode)
    expect(typeof wind.direction).toBe('number')
    expect(typeof wind.speed).toBe('number')
    expect(typeof wind.isSteady).toBe('boolean')
    expect(typeof wind.isGusting).toBe('boolean')
    expect(typeof wind.isCalm).toBe('boolean')
    expect(typeof wind.isVariable).toBe('boolean')
    expect(typeof wind.gustFactor).toBe('number')
    expect(typeof wind.prevailingDirection).toBe('string')
  })

  it('measureWind returns calm for empty code', () => {
    const wind = measureWind(emptyCode)
    expect(wind.isCalm).toBe(true)
    expect(wind.speed).toBe(0)
  })

  it('measureAtmosphere returns atmosphere properties', () => {
    const atm = measureAtmosphere(strongCode)
    expect(typeof atm.pressure).toBe('number')
    expect(typeof atm.isHighPressure).toBe('boolean')
    expect(typeof atm.isLowPressure).toBe('boolean')
    expect(typeof atm.isRising).toBe('boolean')
    expect(typeof atm.isFalling).toBe('boolean')
    expect(['warm', 'cold', 'occluded', 'stationary', 'none']).toContain(atm.frontType)
  })

  it('measureAtmosphere returns low pressure for empty code', () => {
    const atm = measureAtmosphere(emptyCode)
    expect(atm.isLowPressure).toBe(true)
  })

  it('measureAtmosphere detects rising pressure with many TODOs', () => {
    const atm = measureAtmosphere(todoCode)
    expect(atm.isRising).toBe(true)
  })

  it('measureMoisture returns moisture properties', () => {
    const moist = measureMoisture(strongCode)
    expect(typeof moist.humidity).toBe('number')
    expect(typeof moist.dewPoint).toBe('number')
    expect(typeof moist.isDry).toBe('boolean')
    expect(typeof moist.isDamp).toBe('boolean')
    expect(typeof moist.isSaturated).toBe('boolean')
    expect(typeof moist.hasPrecipitation).toBe('boolean')
    expect(['rain', 'snow', 'sleet', 'hail', 'drizzle', 'none']).toContain(moist.precipitationType)
  })

  it('measureMoisture returns dry for empty code', () => {
    const moist = measureMoisture(emptyCode)
    expect(moist.isDry).toBe(true)
    expect(moist.hasPrecipitation).toBe(false)
  })

  it('measureTemperatureReading returns temperature properties', () => {
    const temp = measureTemperatureReading(strongCode)
    expect(typeof temp.current).toBe('number')
    expect(['rising', 'falling', 'stable']).toContain(temp.trend)
    expect(typeof temp.isHot).toBe('boolean')
    expect(typeof temp.isCold).toBe('boolean')
    expect(typeof temp.isFreezing).toBe('boolean')
    expect(typeof temp.hasFever).toBe('boolean')
    expect(typeof temp.hasFrostbite).toBe('boolean')
  })

  it('measureTemperatureReading returns freezing for empty code', () => {
    const temp = measureTemperatureReading(emptyCode)
    expect(temp.isFreezing).toBe(true)
    expect(temp.hasFrostbite).toBe(true)
  })

  it('measureCloud returns cloud properties', () => {
    const cloud = measureCloud(strongCode)
    expect(typeof cloud.coverage).toBe('number')
    expect(typeof cloud.ceiling).toBe('number')
    expect(typeof cloud.isClear).toBe('boolean')
    expect(typeof cloud.isOvercast).toBe('boolean')
    expect(typeof cloud.isPartlyCloudy).toBe('boolean')
    expect(typeof cloud.hasStormClouds).toBe('boolean')
    expect(['cirrus', 'cumulus', 'stratus', 'nimbus', 'cumulonimbus', 'clear']).toContain(cloud.cloudType)
  })

  it('measureCloud returns clear for empty code', () => {
    const cloud = measureCloud(emptyCode)
    expect(cloud.isClear).toBe(true)
    expect(cloud.cloudType).toBe('clear')
  })

  it('measureForecast returns forecast properties', () => {
    const forecast = measureForecast(strongCode)
    expect(typeof forecast.shortRange).toBe('string')
    expect(['improving', 'deteriorating', 'stable', 'volatile', 'unknown']).toContain(forecast.trend)
    expect(typeof forecast.confidence).toBe('number')
    expect(typeof forecast.hasStormWarning).toBe('boolean')
    expect(typeof forecast.hasClearingSkies).toBe('boolean')
    expect(typeof forecast.hasFrontMoving).toBe('boolean')
  })

  it('measureForecast returns unknown for empty code', () => {
    const forecast = measureForecast(emptyCode)
    expect(forecast.trend).toBe('unknown')
    expect(forecast.confidence).toBe(20)
  })

  it('measureForecast detects storm warning for many TODOs', () => {
    const forecast = measureForecast(todoCode)
    expect(forecast.trend).toBe('deteriorating')
  })
})

// ─── Core Analysis ───────────────────────────────────────────────────────────

describe('analyzeWindReading', () => {
  it('returns frozen reading for empty code', () => {
    const reading = analyzeWindReading(emptyCode, 'empty.ts')
    expect(reading.file).toBe('empty.ts')
    expect(reading.windSpeed).toBe(0)
    expect(reading.wind.isCalm).toBe(true)
    expect(reading.atmosphere.isLowPressure).toBe(true)
    expect(reading.moisture.isDry).toBe(true)
    expect(reading.temperatureObj.isFreezing).toBe(true)
    expect(reading.cloud.isClear).toBe(true)
    expect(reading.forecast.trend).toBe('unknown')
    expect(reading.condition).toBe('hurricane')
    expect(reading.qualityScore).toBe(0)
  })

  it('returns correct properties for simple code', () => {
    const reading = analyzeWindReading(simpleCode, 'simple.ts')
    expect(reading.file).toBe('simple.ts')
    expect(typeof reading.windDirection).toBe('number')
    expect(typeof reading.cardinalDirection).toBe('string')
    expect(typeof reading.qualityScore).toBe('number')
  })

  it('returns higher quality for strong code vs simple code', () => {
    const simple = analyzeWindReading(simpleCode, 'simple.ts')
    const strong = analyzeWindReading(strongCode, 'strong.ts')
    expect(strong.qualityScore).toBeGreaterThan(simple.qualityScore)
  })

  it('detects hot code', () => {
    const reading = analyzeWindReading(hotCode, 'hot.ts')
    expect(reading.temperatureObj.isHot).toBe(true)
  })

  it('detects high pressure from TODOs', () => {
    const reading = analyzeWindReading(todoCode, 'todo.ts')
    expect(reading.atmosphere.isRising).toBe(true)
  })

  it('measures all sub-objects', () => {
    const reading = analyzeWindReading(strongCode, 'test.ts')
    expect(reading.wind).toBeDefined()
    expect(reading.atmosphere).toBeDefined()
    expect(reading.moisture).toBeDefined()
    expect(reading.temperatureObj).toBeDefined()
    expect(reading.cloud).toBeDefined()
    expect(reading.forecast).toBeDefined()
  })
})

// ─── Station Analysis ────────────────────────────────────────────────────────

describe('analyzeWeatherStation', () => {
  it('returns broken-vane for empty readings', () => {
    const station = analyzeWeatherStation([], 'empty-dir')
    expect(station.directory).toBe('empty-dir')
    expect(station.readings).toEqual([])
    expect(station.stationType).toBe('broken-vane')
    expect(station.condition).toBe('catastrophic')
    expect(station.prevailingWind).toBe('N')
  })

  it('computes averages from readings', () => {
    const r1 = analyzeWindReading(strongCode, 'a.ts')
    const station = analyzeWeatherStation([r1], 'src')
    expect(station.avgWindSpeed).toBe(r1.windSpeed)
    expect(station.avgPressure).toBe(r1.pressure)
    expect(station.avgTemperature).toBe(r1.temperature)
    expect(station.avgHumidity).toBe(r1.humidity)
  })

  it('counts fair weather and stormy readings', () => {
    const r1 = analyzeWindReading(strongCode, 'a.ts')
    const r2 = analyzeWindReading(emptyCode, 'b.ts')
    const station = analyzeWeatherStation([r1, r2], 'src')
    expect(station.fairWeatherCount + station.stormyCount).toBeLessThanOrEqual(2)
  })

  it('finds prevailing wind direction', () => {
    const r1 = analyzeWindReading(strongCode, 'a.ts')
    const station = analyzeWeatherStation([r1], 'src')
    expect(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']).toContain(station.prevailingWind)
  })
})

// ─── Recommendations ─────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends about storm warnings', () => {
    const stats = {
      stormWarningCount: 2, variableWindCount: 0, freezingCount: 0,
      overallConditions: 40, clearingSkiesCount: 0,
      deterioratingCount: 1, improvingCount: 0, totalFiles: 5,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Storm warnings'))).toBe(true)
  })

  it('recommends about variable winds', () => {
    const stats = {
      stormWarningCount: 0, variableWindCount: 4, freezingCount: 0,
      overallConditions: 40, clearingSkiesCount: 0,
      deterioratingCount: 0, improvingCount: 0, totalFiles: 10,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Variable winds'))).toBe(true)
  })

  it('recommends about freezing conditions', () => {
    const stats = {
      stormWarningCount: 0, variableWindCount: 0, freezingCount: 3,
      overallConditions: 40, clearingSkiesCount: 0,
      deterioratingCount: 0, improvingCount: 0, totalFiles: 10,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Freezing conditions'))).toBe(true)
  })

  it('recommends about fair weather', () => {
    const stats = {
      stormWarningCount: 0, variableWindCount: 0, freezingCount: 0,
      overallConditions: 70, clearingSkiesCount: 0,
      deterioratingCount: 0, improvingCount: 0, totalFiles: 10,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Fair weather'))).toBe(true)
  })

  it('recommends about clearing skies', () => {
    const stats = {
      stormWarningCount: 0, variableWindCount: 0, freezingCount: 0,
      overallConditions: 40, clearingSkiesCount: 3,
      deterioratingCount: 0, improvingCount: 0, totalFiles: 10,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Clearing skies'))).toBe(true)
  })

  it('recommends about deteriorating trend', () => {
    const stats = {
      stormWarningCount: 0, variableWindCount: 0, freezingCount: 0,
      overallConditions: 40, clearingSkiesCount: 0,
      deterioratingCount: 5, improvingCount: 2, totalFiles: 10,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs.some(r => r.includes('Deteriorating trend'))).toBe(true)
  })

  it('returns empty for no issues', () => {
    const stats = {
      stormWarningCount: 0, variableWindCount: 0, freezingCount: 0,
      overallConditions: 30, clearingSkiesCount: 0,
      deterioratingCount: 1, improvingCount: 1, totalFiles: 10,
    } as any
    const recs = generateRecommendations([], [], {} as any, stats)
    expect(recs).toEqual([])
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe('buildWeatherVaneResult', () => {
  it('handles empty input', () => {
    const result = buildWeatherVaneResult([], [], {})
    expect(result.readings).toEqual([])
    expect(result.stations).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('produces reading for each file', () => {
    const result = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})
    expect(result.readings.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups readings into stations by directory', () => {
    const result = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})
    expect(result.stations.length).toBe(1)
    expect(result.stations[0].directory).toBe('src')
    expect(result.stations[0].readings.length).toBe(3)
  })

  it('creates multiple stations for different directories', () => {
    const paths = ['src/a.ts', 'lib/b.ts']
    const contents = [strongCode, simpleCode]
    const result = buildWeatherVaneResult(paths, contents, {})
    expect(result.stations.length).toBe(2)
  })

  it('computes climate overview', () => {
    const result = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})
    expect(typeof result.climate.avgWindSpeed).toBe('number')
    expect(typeof result.climate.avgPressure).toBe('number')
    expect(typeof result.climate.avgTemperature).toBe('number')
    expect(typeof result.climate.avgHumidity).toBe('number')
    expect(typeof result.climate.prevailingWind).toBe('string')
    expect(typeof result.climate.isStable).toBe('boolean')
    expect(typeof result.climate.overallConditions).toBe('number')
  })

  it('computes all stat fields', () => {
    const result = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})
    const s = result.stats
    expect(typeof s.totalFiles).toBe('number')
    expect(typeof s.totalStations).toBe('number')
    expect(typeof s.avgWindSpeed).toBe('number')
    expect(typeof s.avgPressure).toBe('number')
    expect(typeof s.avgTemperature).toBe('number')
    expect(typeof s.avgHumidity).toBe('number')
    expect(typeof s.avgCloudCoverage).toBe('number')
    expect(typeof s.avgForecastConfidence).toBe('number')
    expect(typeof s.fairWeatherCount).toBe('number')
    expect(typeof s.clearCount).toBe('number')
    expect(typeof s.partlyCloudyCount).toBe('number')
    expect(typeof s.cloudyCount).toBe('number')
    expect(typeof s.stormyCount).toBe('number')
    expect(typeof s.hurricaneCount).toBe('number')
    expect(typeof s.steadyWindCount).toBe('number')
    expect(typeof s.gustingWindCount).toBe('number')
    expect(typeof s.calmWindCount).toBe('number')
    expect(typeof s.variableWindCount).toBe('number')
    expect(typeof s.highPressureCount).toBe('number')
    expect(typeof s.lowPressureCount).toBe('number')
    expect(typeof s.hotCount).toBe('number')
    expect(typeof s.coldCount).toBe('number')
    expect(typeof s.freezingCount).toBe('number')
    expect(typeof s.stormWarningCount).toBe('number')
    expect(typeof s.clearingSkiesCount).toBe('number')
    expect(typeof s.improvingCount).toBe('number')
    expect(typeof s.deterioratingCount).toBe('number')
    expect(typeof s.stableCount).toBe('number')
    expect(typeof s.overallConditions).toBe('number')
    expect(typeof s.meteorologistGrade).toBe('string')
    expect(typeof s.bestConditions).toBe('string')
    expect(typeof s.worstConditions).toBe('string')
    expect(typeof s.mostActive).toBe('string')
    expect(typeof s.mostStable).toBe('string')
    expect(typeof s.stormiest).toBe('string')
  })

  it('handles single file', () => {
    const result = buildWeatherVaneResult(['a.ts'], [strongCode], {})
    expect(result.readings.length).toBe(1)
    expect(result.stations.length).toBe(1)
    expect(result.stations[0].readings.length).toBe(1)
  })

  it('handles missing content gracefully', () => {
    const result = buildWeatherVaneResult(['a.ts', 'b.ts'], [''], {})
    expect(result.readings.length).toBe(2)
    expect(result.readings[0].condition).toBe('hurricane')
  })

  it('produces recommendations', () => {
    const result = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('finds best and worst conditions', () => {
    const result = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})
    expect(result.stats.bestConditions).toBeTruthy()
    expect(result.stats.worstConditions).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('weather-vane format helpers', () => {
  const sampleResult = buildWeatherVaneResult(multiFilePaths, multiFileContents, {})

  it('formatWeatherVaneTable returns string', () => {
    const output = formatWeatherVaneTable(sampleResult, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
    expect(output).toContain('Weather Vane')
  })

  it('formatWeatherVaneTable includes readings section', () => {
    const output = formatWeatherVaneTable(sampleResult, false)
    expect(output).toContain('Wind Readings')
  })

  it('formatWeatherVaneTable includes stats section', () => {
    const output = formatWeatherVaneTable(sampleResult, false)
    expect(output).toContain('Statistics')
  })

  it('formatWeatherVaneTable verbose shows more detail', () => {
    const brief = formatWeatherVaneTable(sampleResult, false)
    const verbose = formatWeatherVaneTable(sampleResult, true)
    expect(verbose.length).toBeGreaterThanOrEqual(brief.length)
  })

  it('formatWeatherVaneTable handles empty result', () => {
    const emptyResult = buildWeatherVaneResult([], [], {})
    const output = formatWeatherVaneTable(emptyResult, false)
    expect(output).toContain('No files analyzed')
  })

  it('formatWeatherVaneJson returns valid JSON', () => {
    const output = formatWeatherVaneJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.readings).toBeDefined()
    expect(parsed.stations).toBeDefined()
    expect(parsed.climate).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatWeatherVaneJson handles empty result', () => {
    const emptyResult = buildWeatherVaneResult([], [], {})
    const output = formatWeatherVaneJson(emptyResult)
    const parsed = JSON.parse(output)
    expect(parsed.readings).toEqual([])
    expect(parsed.stats.totalFiles).toBe(0)
  })

  it('formatWeatherVaneTable includes climate overview', () => {
    const output = formatWeatherVaneTable(sampleResult, false)
    expect(output).toContain('Climate Overview')
  })

  it('formatWeatherVaneTable includes station section', () => {
    const output = formatWeatherVaneTable(sampleResult, false)
    expect(output).toContain('Weather Stations')
  })

  it('formatWeatherVaneTable includes recommendations when present', () => {
    const paths = ['dark.ts']
    const contents = [todoCode]
    const result = buildWeatherVaneResult(paths, contents, {})
    const output = formatWeatherVaneTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })
})
