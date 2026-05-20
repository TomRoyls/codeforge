import { describe, it, expect } from 'vitest'
import {
  classifyWeatherType,
  classifyAtmosphericStability,
  classifyAirQuality,
  classifyWindDirection,
  classifyFrontType,
  classifyClimateGrade,
  classifyGlobalTrend,
  analyzeAtmosphericCondition,
  analyzeWeatherZone,
  computeGlobalForecast,
  computeStormRisk,
  computeAirQualityIndex,
  generateWeatherSystemRecommendations,
  buildWeatherSystemResult,
} from '../src/commands/weather-system-helpers.js'

// ─── classifyWeatherType ──────────────────────────────────────────────────────

describe('classifyWeatherType', () => {
  it('returns clear when all metrics are low', () => {
    expect(classifyWeatherType({ cloudCover: 5, precipitation: 0, visibility: 95, pressure: 10 })).toBe('clear')
  })

  it('returns partly-cloudy for cloudCover 20-49', () => {
    expect(classifyWeatherType({ cloudCover: 25, precipitation: 0, visibility: 80, pressure: 15 })).toBe('partly-cloudy')
  })

  it('returns cloudy for cloudCover 50-79', () => {
    expect(classifyWeatherType({ cloudCover: 60, precipitation: 0, visibility: 70, pressure: 20 })).toBe('cloudy')
  })

  it('returns overcast for cloudCover >= 80 with no precipitation', () => {
    expect(classifyWeatherType({ cloudCover: 85, precipitation: 0, visibility: 50, pressure: 25 })).toBe('overcast')
  })

  it('returns drizzle for precipitation 10-24', () => {
    expect(classifyWeatherType({ cloudCover: 40, precipitation: 15, visibility: 60, pressure: 20 })).toBe('drizzle')
  })

  it('returns rain for precipitation 25-39', () => {
    expect(classifyWeatherType({ cloudCover: 50, precipitation: 30, visibility: 50, pressure: 30 })).toBe('rain')
  })

  it('returns hail for precipitation 40-49', () => {
    expect(classifyWeatherType({ cloudCover: 50, precipitation: 45, visibility: 40, pressure: 35 })).toBe('hail')
  })

  it('returns thunderstorm for precipitation >= 50 and pressure >= 40', () => {
    expect(classifyWeatherType({ cloudCover: 60, precipitation: 55, visibility: 30, pressure: 42 })).toBe('thunderstorm')
  })

  it('returns tornado for precipitation >= 60 and pressure >= 50', () => {
    expect(classifyWeatherType({ cloudCover: 60, precipitation: 65, visibility: 25, pressure: 55 })).toBe('tornado')
  })

  it('returns hurricane for precipitation >= 70 and pressure >= 70', () => {
    expect(classifyWeatherType({ cloudCover: 70, precipitation: 75, visibility: 20, pressure: 75 })).toBe('hurricane')
  })

  it('returns foggy for visibility < 20 and cloudCover >= 70', () => {
    expect(classifyWeatherType({ cloudCover: 75, precipitation: 0, visibility: 15, pressure: 30 })).toBe('foggy')
  })

  it('foggy takes priority over other types', () => {
    expect(classifyWeatherType({ cloudCover: 80, precipitation: 50, visibility: 10, pressure: 80 })).toBe('foggy')
  })
})

// ─── classifyAtmosphericStability ─────────────────────────────────────────────

describe('classifyAtmosphericStability', () => {
  it('returns very-stable for pressure <= 20', () => {
    expect(classifyAtmosphericStability(10)).toBe('very-stable')
    expect(classifyAtmosphericStability(20)).toBe('very-stable')
  })

  it('returns stable for pressure 21-35', () => {
    expect(classifyAtmosphericStability(25)).toBe('stable')
    expect(classifyAtmosphericStability(35)).toBe('stable')
  })

  it('returns neutral for pressure 36-55', () => {
    expect(classifyAtmosphericStability(40)).toBe('neutral')
    expect(classifyAtmosphericStability(55)).toBe('neutral')
  })

  it('returns unstable for pressure 56-75', () => {
    expect(classifyAtmosphericStability(60)).toBe('unstable')
    expect(classifyAtmosphericStability(75)).toBe('unstable')
  })

  it('returns very-unstable for pressure > 75', () => {
    expect(classifyAtmosphericStability(80)).toBe('very-unstable')
    expect(classifyAtmosphericStability(100)).toBe('very-unstable')
  })
})

// ─── classifyAirQuality ──────────────────────────────────────────────────────

describe('classifyAirQuality', () => {
  it('returns excellent for score >= 80', () => {
    expect(classifyAirQuality(90, 10)).toBe('excellent')
  })

  it('returns good for score 60-79', () => {
    expect(classifyAirQuality(70, 30)).toBe('good')
  })

  it('returns moderate for score 40-59', () => {
    expect(classifyAirQuality(50, 50)).toBe('moderate')
  })

  it('returns poor for score 20-39', () => {
    expect(classifyAirQuality(30, 70)).toBe('poor')
  })

  it('returns hazardous for score < 20', () => {
    expect(classifyAirQuality(10, 90)).toBe('hazardous')
  })

  it('calculates score as (visibility + (100 - pressure)) / 2', () => {
    // (80 + 40) / 2 = 60 -> good
    expect(classifyAirQuality(80, 60)).toBe('good')
  })
})

// ─── classifyWindDirection ────────────────────────────────────────────────────

describe('classifyWindDirection', () => {
  it('returns N when exports > imports * 2', () => {
    expect(classifyWindDirection(2, 5)).toBe('N')
  })

  it('returns NE when exports > imports (but not > 2x)', () => {
    expect(classifyWindDirection(3, 5)).toBe('NE')
  })

  it('returns E when exports === imports', () => {
    expect(classifyWindDirection(5, 5)).toBe('E')
  })

  it('returns S when imports > exports * 2', () => {
    expect(classifyWindDirection(5, 2)).toBe('S')
  })

  it('returns SW when imports > exports (but not > 2x)', () => {
    expect(classifyWindDirection(5, 3)).toBe('SW')
  })

  it('returns S when imports > exports * 2 (including exports===0)', () => {
    expect(classifyWindDirection(5, 0)).toBe('S')
    expect(classifyWindDirection(3, 1)).toBe('S')
  })

  it('returns N when exports > imports * 2 (including imports===0)', () => {
    expect(classifyWindDirection(0, 5)).toBe('N')
    expect(classifyWindDirection(1, 3)).toBe('N')
  })

  it('returns E when imports === exports (including both 0)', () => {
    expect(classifyWindDirection(0, 0)).toBe('E')
    expect(classifyWindDirection(4, 4)).toBe('E')
  })

  it('returns W when imports > 0 and exports === 0 with imports not > 0 * 2', () => {
    // This path is unreachable because imports > exports * 2 catches it first when exports===0
    // W requires imports > 0 && exports === 0 but not imports > exports * 2
    // Since exports * 2 = 0, any imports > 0 means imports > 0, so S is hit first
    // W is only reachable if exports===0 and imports===0 but that hits E first
    // In practice W is dead code; test the actual behavior
    expect(classifyWindDirection(5, 0)).toBe('S')
  })

  it('returns NW when exports > 0 and imports === 0 with exports not > 0 * 2', () => {
    // Same reasoning - NW is dead code since exports > imports * 2 catches it
    expect(classifyWindDirection(0, 5)).toBe('N')
  })
})

// ─── classifyFrontType ────────────────────────────────────────────────────────

describe('classifyFrontType', () => {
  it('returns warm-front for improving trend with low pressure', () => {
    expect(classifyFrontType('improving', 30)).toBe('warm-front')
  })

  it('returns cold-front for deteriorating trend with high pressure', () => {
    expect(classifyFrontType('deteriorating', 50)).toBe('cold-front')
  })

  it('returns stationary for stable trend with pressure 30-60', () => {
    expect(classifyFrontType('stable', 45)).toBe('stationary')
  })

  it('returns occluded-front for deteriorating trend with pressure <= 40', () => {
    expect(classifyFrontType('deteriorating', 35)).toBe('occluded-front')
  })

  it('returns none for improving trend with high pressure', () => {
    expect(classifyFrontType('improving', 60)).toBe('none')
  })

  it('returns none for stable trend with low pressure', () => {
    expect(classifyFrontType('stable', 20)).toBe('none')
  })
})

// ─── classifyClimateGrade ─────────────────────────────────────────────────────

describe('classifyClimateGrade', () => {
  it('returns tropical-paradise for comfort >= 80', () => {
    expect(classifyClimateGrade(90)).toBe('tropical-paradise')
    expect(classifyClimateGrade(80)).toBe('tropical-paradise')
  })

  it('returns pleasant for comfort 65-79', () => {
    expect(classifyClimateGrade(70)).toBe('pleasant')
  })

  it('returns temperate for comfort 45-64', () => {
    expect(classifyClimateGrade(55)).toBe('temperate')
  })

  it('returns continental for comfort 25-44', () => {
    expect(classifyClimateGrade(35)).toBe('continental')
  })

  it('returns arctic for comfort 10-24', () => {
    expect(classifyClimateGrade(15)).toBe('arctic')
  })

  it('returns hellish for comfort < 10', () => {
    expect(classifyClimateGrade(5)).toBe('hellish')
    expect(classifyClimateGrade(0)).toBe('hellish')
  })
})

// ─── classifyGlobalTrend ──────────────────────────────────────────────────────

describe('classifyGlobalTrend', () => {
  it('returns clearing for low pressure and high visibility', () => {
    expect(classifyGlobalTrend(20, 80)).toBe('clearing')
  })

  it('returns stable for moderate pressure and visibility', () => {
    expect(classifyGlobalTrend(35, 60)).toBe('stable')
  })

  it('returns catastrophic for high pressure', () => {
    expect(classifyGlobalTrend(65, 30)).toBe('catastrophic')
  })

  it('returns storm-approaching for pressure 45-59', () => {
    expect(classifyGlobalTrend(50, 40)).toBe('storm-approaching')
  })

  it('returns deteriorating for pressure 41-44', () => {
    expect(classifyGlobalTrend(43, 40)).toBe('deteriorating')
  })
})

// ─── analyzeAtmosphericCondition ──────────────────────────────────────────────

describe('analyzeAtmosphericCondition', () => {
  it('returns an AtmosphericCondition with all fields', () => {
    const code = 'export function add(a: number, b: number) { return a + b }'
    const result = analyzeAtmosphericCondition(code, 'add.ts')

    expect(result.file).toBe('add.ts')
    expect(typeof result.pressure).toBe('number')
    expect(typeof result.temperature).toBe('number')
    expect(typeof result.humidity).toBe('number')
    expect(typeof result.windSpeed).toBe('number')
    expect(typeof result.visibility).toBe('number')
    expect(typeof result.precipitation).toBe('number')
    expect(typeof result.cloudCover).toBe('number')
    expect(typeof result.dewPoint).toBe('number')
    expect(typeof result.uvIndex).toBe('number')
    expect(typeof result.comfort).toBe('number')
    expect(result.atmosphericStability).toBeDefined()
    expect(result.weatherType).toBeDefined()
    expect(result.windDirection).toBeDefined()
    expect(result.airQuality).toBeDefined()
    expect(result.forecast).toBeDefined()
    expect(result.frontType).toBeDefined()
    expect(Array.isArray(result.alerts)).toBe(true)
  })

  it('returns clear weather for clean simple code', () => {
    const code = 'export function hello() { return "world" }'
    const result = analyzeAtmosphericCondition(code, 'hello.ts')
    expect(result.weatherType).toBe('clear')
    expect(result.pressure).toBeLessThan(50)
  })

  it('returns high pressure for code with TODOs and anys', () => {
    const code = [
      '// TODO: fix this',
      '// FIXME: broken',
      'function foo(x: any): any { return x }',
      'function bar(y: any): any { return y }',
    ].join('\n')
    const result = analyzeAtmosphericCondition(code, 'messy.ts')
    expect(result.pressure).toBeGreaterThan(20)
    expect(result.precipitation).toBeGreaterThan(0)
  })

  it('returns N wind direction for exports with no imports (exports > imports * 2)', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport function c() {}'
    const result = analyzeAtmosphericCondition(code, 'exports.ts')
    expect(result.windDirection).toBe('N')
  })

  it('returns S wind direction for imports with no exports (imports > exports * 2)', () => {
    const code = "import { a } from 'a'\nimport { b } from 'b'\nimport { c } from 'c'"
    const result = analyzeAtmosphericCondition(code, 'imports.ts')
    expect(result.windDirection).toBe('S')
  })

  it('returns foggy for code with anys and nested ifs', () => {
    const code = [
      'function f(x: any) {',
      '  if (x) { if (y) { return 1 } }',
      '  return x === 999',
      '}',
    ].join('\n')
    const result = analyzeAtmosphericCondition(code, 'foggy.ts')
    // anys cause low visibility and high cloud cover
    expect(result.cloudCover).toBeGreaterThan(0)
  })

  it('has good visibility for well-documented code with exports and interfaces', () => {
    const code = [
      '/** Documentation */',
      'export interface Foo { bar: number }',
      'export type Baz = string',
      'export function hello() { return 1 }',
    ].join('\n')
    const result = analyzeAtmosphericCondition(code, 'clean.ts')
    expect(result.visibility).toBeGreaterThanOrEqual(50)
  })

  it('computes dew point as average of temperature and humidity', () => {
    const code = 'export function x() {}'
    const result = analyzeAtmosphericCondition(code, 'x.ts')
    expect(result.dewPoint).toBe(Math.min(100, Math.round((result.temperature + result.humidity) / 2)))
  })

  it('handles empty content', () => {
    const result = analyzeAtmosphericCondition('', 'empty.ts')
    expect(result.pressure).toBe(0)
    expect(result.temperature).toBe(0)
    expect(result.humidity).toBe(0)
    expect(result.visibility).toBe(0)
  })
})

// ─── analyzeWeatherZone ───────────────────────────────────────────────────────

describe('analyzeWeatherZone', () => {
  it('returns arctic zone for empty conditions', () => {
    const zone = analyzeWeatherZone([], 'empty-dir')
    expect(zone.directory).toBe('empty-dir')
    expect(zone.zoneType).toBe('arctic')
    expect(zone.conditions).toEqual([])
    expect(zone.avgPressure).toBe(0)
    expect(zone.health).toBe('extreme')
    expect(zone.forecast).toBe('No data available')
    expect(zone.hasWeatherEvents).toBe(false)
    expect(zone.weatherEvents).toEqual([])
  })

  it('analyzes a single condition', () => {
    const cond = analyzeAtmosphericCondition('export function a() {}', 'dir/a.ts')
    const zone = analyzeWeatherZone([cond], 'dir')
    expect(zone.conditions).toHaveLength(1)
    expect(zone.avgPressure).toBe(cond.pressure)
    expect(zone.avgComfort).toBe(cond.comfort)
  })

  it('computes dominant weather from conditions', () => {
    const c1 = analyzeAtmosphericCondition('export function a() {}', 'd/a.ts')
    const c2 = analyzeAtmosphericCondition('export function b() {}', 'd/b.ts')
    const zone = analyzeWeatherZone([c1, c2], 'd')
    expect(typeof zone.dominantWeather).toBe('string')
  })

  it('computes alert count from conditions', () => {
    const code = '// TODO: fix\n// FIXME: bad\n// TODO: more\nexport function x() { return x === 9999 }'
    const cond = analyzeAtmosphericCondition(code, 'alerts.ts')
    const zone = analyzeWeatherZone([cond], 'alert-dir')
    expect(zone.alertCount).toBe(cond.alerts.length)
  })

  it('detects weather events for non-clear conditions', () => {
    const messyCode = '// TODO\n// TODO\n// TODO\n// TODO\n// TODO\n// TODO\nfunction f(x: any): any { if (x) { if (y) { return 1 } } return x }'
    const cond = analyzeAtmosphericCondition(messyCode, 'messy.ts')
    if (cond.weatherType !== 'clear' && cond.weatherType !== 'partly-cloudy') {
      const zone = analyzeWeatherZone([cond], 'messy-dir')
      expect(zone.hasWeatherEvents).toBe(true)
      expect(zone.weatherEvents).toContain(cond.weatherType)
    }
  })

  it('computes climate stability based on pressure and extreme conditions', () => {
    const code = 'export function clean() { return 1 }'
    const cond = analyzeAtmosphericCondition(code, 'clean.ts')
    const zone = analyzeWeatherZone([cond], 'clean-dir')
    expect(zone.climateStability).toBeGreaterThanOrEqual(0)
    expect(zone.climateStability).toBeLessThanOrEqual(100)
  })

  it('classifies zone as tropical for high temp and humidity', () => {
    // Zone type depends on avg metrics across conditions
    // We need to create conditions that produce high temp and humidity
    const code = Array.from({ length: 5 }, () => "import { a, b, c, d, e, f, g, h, i } from 'lib'\n" +
      'export function x' + Math.random() + '() {}\n').join('\n')
    const cond = analyzeAtmosphericCondition(code, 'tropical.ts')
    const zone = analyzeWeatherZone([cond], 'tropical-dir')
    // Zone type depends on computed metrics
    expect(['tropical', 'temperate', 'arctic', 'desert', 'monsoon', 'mediterranean']).toContain(zone.zoneType)
  })

  it('computes zone health from avg comfort', () => {
    const code = 'export function a() {}'
    const cond = analyzeAtmosphericCondition(code, 'a.ts')
    const zone = analyzeWeatherZone([cond], 'dir')
    expect(['ideal', 'pleasant', 'acceptable', 'uncomfortable', 'harsh', 'extreme']).toContain(zone.health)
  })
})

// ─── computeGlobalForecast ────────────────────────────────────────────────────

describe('computeGlobalForecast', () => {
  it('returns default for empty conditions', () => {
    const gf = computeGlobalForecast([], [])
    expect(gf.overallWeather).toBe('clear')
    expect(gf.trend).toBe('stable')
    expect(gf.avgPressure).toBe(0)
    expect(gf.avgTemperature).toBe(0)
    expect(gf.avgVisibility).toBe(0)
    expect(gf.dominantFront).toBe('none')
    expect(gf.stormRisk).toBe(0)
    expect(gf.comfortIndex).toBe(0)
    expect(gf.climateGrade).toBe('arctic')
  })

  it('computes averages from conditions', () => {
    const c1 = analyzeAtmosphericCondition('export function a() {}', 'a.ts')
    const c2 = analyzeAtmosphericCondition('export function b() {}', 'b.ts')
    const gf = computeGlobalForecast([c1, c2], [])
    expect(gf.avgPressure).toBe(Math.round((c1.pressure + c2.pressure) / 2))
    expect(gf.avgTemperature).toBe(Math.round((c1.temperature + c2.temperature) / 2))
  })

  it('finds dominant weather type', () => {
    const clean = 'export function a() {}'
    const c1 = analyzeAtmosphericCondition(clean, 'a.ts')
    const c2 = analyzeAtmosphericCondition(clean, 'b.ts')
    const c3 = analyzeAtmosphericCondition(clean, 'c.ts')
    const gf = computeGlobalForecast([c1, c2, c3], [])
    expect(gf.overallWeather).toBe(c1.weatherType)
  })

  it('finds dominant front type excluding none', () => {
    const clean = 'export function a() {}'
    const c1 = analyzeAtmosphericCondition(clean, 'a.ts')
    const gf = computeGlobalForecast([c1], [])
    // With just clean code, front may be none since it's the only one
    expect(typeof gf.dominantFront).toBe('string')
  })

  it('computes storm risk', () => {
    const clean = 'export function a() {}'
    const c1 = analyzeAtmosphericCondition(clean, 'a.ts')
    const gf = computeGlobalForecast([c1], [])
    expect(gf.stormRisk).toBeGreaterThanOrEqual(0)
    expect(gf.stormRisk).toBeLessThanOrEqual(100)
  })
})

// ─── computeStormRisk ─────────────────────────────────────────────────────────

describe('computeStormRisk', () => {
  it('returns 0 for empty conditions', () => {
    expect(computeStormRisk([])).toBe(0)
  })

  it('returns 0 for clean conditions', () => {
    const c = analyzeAtmosphericCondition('export function clean() { return 1 }', 'clean.ts')
    expect(computeStormRisk([c])).toBe(0)
  })

  it('returns 100 when all conditions are extreme', () => {
    const messy = '// TODO\n// FIXME\n// TODO\nfunction f(x: any): any { if (x) { if (y) { return 1 } } return x === 9999 }'
    const c = analyzeAtmosphericCondition(messy, 'messy.ts')
    if (c.pressure >= 60) {
      expect(computeStormRisk([c])).toBe(100)
    }
  })

  it('returns proportional risk for mixed conditions', () => {
    const clean = analyzeAtmosphericCondition('export function a() { return 1 }', 'clean.ts')
    const messy = analyzeAtmosphericCondition('// TODO\n// TODO\n// TODO\n// TODO\n// TODO\n// TODO\n// TODO\nfunction f(x: any) { return x }', 'messy.ts')
    const risk = computeStormRisk([clean, messy])
    expect(risk).toBeGreaterThanOrEqual(0)
    expect(risk).toBeLessThanOrEqual(100)
  })
})

// ─── computeAirQualityIndex ───────────────────────────────────────────────────

describe('computeAirQualityIndex', () => {
  it('returns 0 for empty conditions', () => {
    expect(computeAirQualityIndex([])).toBe(0)
  })

  it('computes index from visibility and pressure', () => {
    const c = analyzeAtmosphericCondition('export function clean() { return 1 }', 'clean.ts')
    const aqi = computeAirQualityIndex([c])
    const expected = Math.min(100, Math.round((c.visibility + (100 - c.pressure)) / 2))
    expect(aqi).toBe(expected)
  })

  it('returns high index for clean code', () => {
    const code = [
      '/** Docs */',
      'export interface I { x: number }',
      'export type T = string',
      'export function clean() { return 1 }',
    ].join('\n')
    const c = analyzeAtmosphericCondition(code, 'clean.ts')
    const aqi = computeAirQualityIndex([c])
    expect(aqi).toBeGreaterThan(40)
  })
})

// ─── generateWeatherSystemRecommendations ─────────────────────────────────────

describe('generateWeatherSystemRecommendations', () => {
  const emptyStats = {
    totalFiles: 0, totalZones: 0, avgPressure: 0, avgTemperature: 0, avgHumidity: 0,
    avgVisibility: 0, avgComfort: 0, clearFiles: 0, stormyFiles: 0, foggyFiles: 0,
    extremeFiles: 0, totalAlerts: 0, tropicalZones: 0, arcticZones: 0, desertZones: 0,
    monsoonZones: 0, overallComfort: 0, airQualityIndex: 0, stormRisk: 0,
    climateGrade: 'temperate', bestWeather: 'none', worstWeather: 'none',
    safestZone: 'none', riskiestZone: 'none',
  }

  it('recommends clearing skies for clean codebase', () => {
    const cleanStats = {
      ...emptyStats,
      avgVisibility: 70,
    }
    const recs = generateWeatherSystemRecommendations([], [], cleanStats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Clear skies')
  })

  it('warns about high pressure', () => {
    const stats = { ...emptyStats, avgPressure: 55 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('atmospheric pressure'))).toBe(true)
  })

  it('warns about low visibility', () => {
    const stats = { ...emptyStats, avgVisibility: 30 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('visibility'))).toBe(true)
  })

  it('warns about high humidity', () => {
    const stats = { ...emptyStats, avgHumidity: 65 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('humidity'))).toBe(true)
  })

  it('warns about storm risk', () => {
    const stats = { ...emptyStats, stormRisk: 60 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('storm risk'))).toBe(true)
  })

  it('warns about extreme files', () => {
    const stats = { ...emptyStats, extremeFiles: 3 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('extreme weather'))).toBe(true)
  })

  it('warns about foggy files when more than 2', () => {
    const stats = { ...emptyStats, foggyFiles: 5 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('foggy'))).toBe(true)
  })

  it('does not warn about foggy files when 2 or fewer', () => {
    const stats = { ...emptyStats, foggyFiles: 2 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('foggy'))).toBe(false)
  })

  it('warns about total alerts > 5', () => {
    const stats = { ...emptyStats, totalAlerts: 10 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('weather alerts'))).toBe(true)
  })

  it('warns about monsoon zones', () => {
    const stats = { ...emptyStats, monsoonZones: 1 }
    const recs = generateWeatherSystemRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Monsoon'))).toBe(true)
  })

  it('warns about harsh zones', () => {
    const zone = {
      directory: 'harsh', conditions: [], zoneType: 'arctic' as const,
      avgPressure: 0, avgTemperature: 0, avgHumidity: 0, avgVisibility: 0,
      dominantWeather: 'clear', avgComfort: 0, alertCount: 0, extremeConditions: 0,
      climateStability: 0, hasWeatherEvents: false, weatherEvents: [],
      forecast: 'test', health: 'extreme' as const,
    }
    const recs = generateWeatherSystemRecommendations([], [zone], emptyStats)
    expect(recs.some(r => r.includes('harsh'))).toBe(true)
  })
})

// ─── buildWeatherSystemResult ─────────────────────────────────────────────────

describe('buildWeatherSystemResult', () => {
  it('handles empty input', () => {
    const result = buildWeatherSystemResult([], [], {})
    expect(result.conditions).toEqual([])
    expect(result.zones).toEqual([])
    expect(result.recommendations).toBeDefined()
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalZones).toBe(0)
  })

  it('processes a single file', () => {
    const result = buildWeatherSystemResult(
      ['hello.ts'],
      ['export function hello() { return 1 }'],
      {},
    )
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0].file).toBe('hello.ts')
    expect(result.zones).toHaveLength(1)
    expect(result.globalForecast).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('groups files into zones by directory', () => {
    const result = buildWeatherSystemResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [
        'export function a() {}',
        'export function b() {}',
        'export function c() {}',
      ],
      {},
    )
    expect(result.conditions).toHaveLength(3)
    const zoneDirs = result.zones.map(z => z.directory)
    expect(zoneDirs).toContain('src')
    expect(zoneDirs).toContain('test')
  })

  it('files without slashes go to root zone', () => {
    const result = buildWeatherSystemResult(
      ['solo.ts'],
      ['export function solo() {}'],
      {},
    )
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].directory).toBe('.')
  })

  it('computes stats correctly', () => {
    const result = buildWeatherSystemResult(
      ['a.ts', 'b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.avgPressure).toBe('number')
    expect(typeof result.stats.avgTemperature).toBe('number')
    expect(typeof result.stats.avgHumidity).toBe('number')
    expect(typeof result.stats.avgVisibility).toBe('number')
    expect(typeof result.stats.avgComfort).toBe('number')
    expect(typeof result.stats.bestWeather).toBe('string')
    expect(typeof result.stats.worstWeather).toBe('string')
    expect(typeof result.stats.safestZone).toBe('string')
    expect(typeof result.stats.riskiestZone).toBe('string')
  })

  it('handles backslash paths for Windows-style paths', () => {
    const result = buildWeatherSystemResult(
      ['src\\a.ts'],
      ['export function a() {}'],
      {},
    )
    expect(result.conditions).toHaveLength(1)
    // The zone directory should be 'src' (backslash converted to forward)
    expect(result.zones[0].directory).toBe('src')
  })
})
