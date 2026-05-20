import { describe, expect, it } from 'vitest'

import {
  buildWeatherResult,
  classifyClimate,
  classifyCondition,
  computeClimateStability,
  computeHumidity,
  computeMaxNesting,
  computePrecipitation,
  computePressure,
  computeTemperature,
  computeVisibility,
  computeWindSpeed,
  detectAlerts,
  extractImports,
  generateForecast,
  generateWeatherRecommendations,
  groupIntoRegions,
  resolveImportPath,
  type WeatherAlert,
  type WeatherCondition,
  type WeatherStats,
  type RegionalForecast,
} from '../src/commands/weather-helpers.js'
import {
  formatAlertBanner,
  formatClimateClassification,
  formatRegionalForecasts,
  formatTemperatureMap,
  formatVisibilityChart,
  formatWeatherJson,
  formatWeatherMap,
  formatWeatherRecommendations,
  formatWeatherTable,
  weatherIcon,
} from '../src/commands/weather-format-helpers.js'

// ─── computeTemperature ────────────────────────────────────────────────────────

describe('computeTemperature', () => {
  it('returns 0 for empty content', () => {
    expect(computeTemperature('')).toBe(0)
  })

  it('returns low for simple code', () => {
    expect(computeTemperature('const x = 1')).toBeLessThanOrEqual(20)
  })

  it('returns high for complex code', () => {
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { while (y) { if (z) { switch(a) { case 1: break } } } } }'
    expect(computeTemperature(complex)).toBeGreaterThan(computeTemperature('const x = 1'))
  })

  it('counts nesting', () => {
    const nested = 'if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }'
    expect(computeTemperature(nested)).toBeGreaterThan(0)
  })

  it('clamps to 0-100', () => {
    const result = computeTemperature('if (x) {} if (y) {} if (z) {} for (let i = 0; i < 100; i++) {} while (true) {}')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computeHumidity ───────────────────────────────────────────────────────────

describe('computeHumidity', () => {
  it('returns 0 for empty content', () => {
    expect(computeHumidity('')).toBe(0)
  })

  it('returns 100 for dense code', () => {
    expect(computeHumidity('const x = 1')).toBe(100)
  })

  it('returns lower for sparse code', () => {
    const result = computeHumidity('const x = 1\n\n\nconst y = 2\n\n\n')
    expect(result).toBeLessThan(100)
    expect(result).toBeGreaterThan(0)
  })

  it('handles single newline', () => {
    expect(computeHumidity('\n')).toBe(0)
  })
})

// ─── computeWindSpeed ──────────────────────────────────────────────────────────

describe('computeWindSpeed', () => {
  it('returns default without git data', () => {
    expect(computeWindSpeed('file.ts', null)).toBe(30)
  })

  it('computes from commits per week', () => {
    expect(computeWindSpeed('file.ts', { commitsPerWeek: 5 })).toBe(50)
  })

  it('clamps to 100', () => {
    expect(computeWindSpeed('file.ts', { commitsPerWeek: 20 })).toBe(100)
  })

  it('clamps to 0', () => {
    expect(computeWindSpeed('file.ts', { commitsPerWeek: 0 })).toBe(0)
  })
})

// ─── computeVisibility ─────────────────────────────────────────────────────────

describe('computeVisibility', () => {
  it('returns 0 for empty content', () => {
    expect(computeVisibility('')).toBe(0)
  })

  it('returns high for well-documented code', () => {
    const documented = '/**\n * Adds numbers.\n * @param a First\n * @returns Sum\n * @example\n * add(1, 2)\n */\nfunction add(a: number, b: number): number { return a + b }'
    const bare = 'function add(a, b) { return a + b }'
    expect(computeVisibility(documented)).toBeGreaterThan(computeVisibility(bare))
  })

  it('counts inline comments', () => {
    const withComments = '// A comment\nconst x = 1\n// Another comment\nconst y = 2'
    expect(computeVisibility(withComments)).toBeGreaterThan(0)
  })

  it('counts type annotations', () => {
    const typed = 'function foo(x: string): number { return 1 }'
    expect(computeVisibility(typed)).toBeGreaterThan(0)
  })

  it('clamps to 0-100', () => {
    const result = computeVisibility('/** doc */\nfunction a() {}\n/** doc */\nfunction b() {}')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computePressure ───────────────────────────────────────────────────────────

describe('computePressure', () => {
  it('returns 0 for no dependencies', () => {
    expect(computePressure('file.ts', [], [])).toBe(0)
  })

  it('increases with imports', () => {
    const low = computePressure('file.ts', ['a'], [])
    const high = computePressure('file.ts', ['a', 'b', 'c', 'd', 'e', 'f'], [])
    expect(high).toBeGreaterThan(low)
  })

  it('increases with importers', () => {
    const low = computePressure('file.ts', [], ['a'])
    const high = computePressure('file.ts', [], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])
    expect(high).toBeGreaterThan(low)
  })

  it('clamps to 100', () => {
    const many = Array.from({ length: 20 }, (_, i) => `mod${i}`)
    expect(computePressure('file.ts', many, many)).toBeLessThanOrEqual(100)
  })
})

// ─── computePrecipitation ──────────────────────────────────────────────────────

describe('computePrecipitation', () => {
  it('returns 0 for empty content', () => {
    expect(computePrecipitation('')).toBe(0)
  })

  it('detects try/catch', () => {
    const result = computePrecipitation('try { foo() } catch (e) { throw new Error("fail") }')
    expect(result).toBeGreaterThan(0)
  })

  it('detects TODOs', () => {
    expect(computePrecipitation('const x = 1 // TODO: fix')).toBeGreaterThan(0)
  })

  it('detects null checks', () => {
    expect(computePrecipitation('if (x === null) { }')).toBeGreaterThan(0)
  })

  it('higher for error-heavy code', () => {
    const errors = 'try { } catch(e) { throw new Error("x") }\ntry { } catch(e) { throw new Error("y") }'
    const clean = 'const x = 1\nconst y = 2'
    expect(computePrecipitation(errors)).toBeGreaterThan(computePrecipitation(clean))
  })
})

// ─── computeMaxNesting ─────────────────────────────────────────────────────────

describe('computeMaxNesting', () => {
  it('returns 0 for flat code', () => {
    expect(computeMaxNesting('const x = 1')).toBe(0)
  })

  it('counts nesting depth', () => {
    expect(computeMaxNesting('{{{x}}}')).toBe(3)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies foggy (low visibility)', () => {
    expect(classifyCondition(50, 50, 20, 20, 30, 10)).toBe('foggy')
  })

  it('classifies windy (high wind)', () => {
    expect(classifyCondition(30, 50, 80, 60, 30, 10)).toBe('windy')
  })

  it('classifies stormy (hot + rainy)', () => {
    expect(classifyCondition(80, 50, 20, 50, 30, 60)).toBe('stormy')
  })

  it('classifies rainy (warm + wet)', () => {
    expect(classifyCondition(60, 50, 20, 50, 30, 40)).toBe('rainy')
  })

  it('classifies cloudy (warm + low vis)', () => {
    expect(classifyCondition(50, 50, 20, 50, 30, 10)).toBe('cloudy')
  })

  it('classifies partly-cloudy (warm + good vis)', () => {
    expect(classifyCondition(40, 50, 20, 70, 30, 10)).toBe('partly-cloudy')
  })

  it('classifies sunny (cool + clear)', () => {
    expect(classifyCondition(20, 50, 20, 80, 30, 10)).toBe('sunny')
  })

  it('classifies calm (all moderate)', () => {
    expect(classifyCondition(10, 10, 10, 40, 10, 10)).toBe('calm')
  })

  it('foggy takes priority over other conditions', () => {
    expect(classifyCondition(80, 60, 20, 25, 30, 60)).toBe('foggy')
  })

  it('windy takes priority after foggy', () => {
    expect(classifyCondition(30, 50, 75, 40, 30, 10)).toBe('windy')
  })
})

// ─── generateForecast ──────────────────────────────────────────────────────────

describe('generateForecast', () => {
  it('returns forecast for each condition', () => {
    const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy', 'calm'] as const
    for (const c of conditions) {
      expect(generateForecast(c)).toBeTruthy()
    }
  })

  it('returns appropriate message for stormy', () => {
    expect(generateForecast('stormy')).toContain('refactor')
  })

  it('returns appropriate message for foggy', () => {
    expect(generateForecast('foggy')).toContain('documentation')
  })
})

// ─── groupIntoRegions ──────────────────────────────────────────────────────────

describe('groupIntoRegions', () => {
  const makeCondition = (file: string): WeatherCondition => ({
    file, temperature: 50, humidity: 50, windSpeed: 30, visibility: 50, pressure: 30, precipitation: 10, condition: 'partly-cloudy', forecast: 'ok',
  })

  it('groups by directory', () => {
    const conditions = [makeCondition('src/a.ts'), makeCondition('src/b.ts'), makeCondition('test/c.ts')]
    const regions = groupIntoRegions(conditions, ['src/a.ts', 'src/b.ts', 'test/c.ts'])
    expect(regions).toHaveLength(2)
    const srcRegion = regions.find((r) => r.region === 'src')
    expect(srcRegion?.conditions).toHaveLength(2)
  })

  it('handles root-level files', () => {
    const conditions = [makeCondition('main.ts')]
    const regions = groupIntoRegions(conditions, ['main.ts'])
    expect(regions).toHaveLength(1)
    expect(regions[0].region).toBe('.')
  })

  it('computes averages', () => {
    const c1: WeatherCondition = { ...makeCondition('src/a.ts'), temperature: 80 }
    const c2: WeatherCondition = { ...makeCondition('src/b.ts'), temperature: 40 }
    const regions = groupIntoRegions([c1, c2], ['src/a.ts', 'src/b.ts'])
    expect(regions[0].avgTemperature).toBe(60)
  })

  it('detects stormy regions', () => {
    const c1: WeatherCondition = { ...makeCondition('src/a.ts'), condition: 'stormy', temperature: 90 }
    const c2: WeatherCondition = { ...makeCondition('src/b.ts'), condition: 'stormy', temperature: 90 }
    const c3: WeatherCondition = { ...makeCondition('src/c.ts'), condition: 'sunny', temperature: 10 }
    const regions = groupIntoRegions([c1, c2, c3], ['src/a.ts', 'src/b.ts', 'src/c.ts'])
    expect(regions[0].overall).toBe('stormy')
    expect(regions[0].alert).toBeTruthy()
  })
})

// ─── detectAlerts ──────────────────────────────────────────────────────────────

describe('detectAlerts', () => {
  const makeCondition = (file: string, overrides: Partial<WeatherCondition> = {}): WeatherCondition => ({
    file, temperature: 50, humidity: 50, windSpeed: 30, visibility: 50, pressure: 30, precipitation: 10, condition: 'partly-cloudy', forecast: 'ok',
    ...overrides,
  })

  it('detects complexity storm', () => {
    const conditions = [
      makeCondition('a.ts', { temperature: 90 }),
      makeCondition('b.ts', { temperature: 85 }),
      makeCondition('c.ts', { temperature: 82 }),
    ]
    const alerts = detectAlerts([], conditions)
    const storm = alerts.find((a) => a.type === 'complexity-storm')
    expect(storm).toBeTruthy()
    expect(storm!.affectedFiles).toHaveLength(3)
  })

  it('detects dependency hurricane', () => {
    const conditions = [
      makeCondition('src/a.ts', { pressure: 90, windSpeed: 80 }),
    ]
    const forecasts: RegionalForecast[] = [{
      region: 'src',
      conditions,
      avgTemperature: 50,
      avgVisibility: 50,
      avgPressure: 90,
      overall: 'mixed',
      alert: null,
    }]
    const alerts = detectAlerts(forecasts, conditions)
    expect(alerts.some((a) => a.type === 'dependency-hurricane')).toBe(true)
  })

  it('detects documentation fog', () => {
    const conditions = [
      makeCondition('src/a.ts', { visibility: 10 }),
      makeCondition('src/b.ts', { visibility: 15 }),
    ]
    const forecasts: RegionalForecast[] = [{
      region: 'src',
      conditions,
      avgTemperature: 50,
      avgVisibility: 12,
      avgPressure: 30,
      overall: 'foggy',
      alert: null,
    }]
    const alerts = detectAlerts(forecasts, conditions)
    expect(alerts.some((a) => a.type === 'documentation-fog')).toBe(true)
  })

  it('detects change tornado', () => {
    const conditions = [
      makeCondition('src/a.ts', { windSpeed: 85, precipitation: 60 }),
    ]
    const forecasts: RegionalForecast[] = [{
      region: 'src',
      conditions,
      avgTemperature: 50,
      avgVisibility: 50,
      avgPressure: 30,
      overall: 'mixed',
      alert: null,
    }]
    const alerts = detectAlerts(forecasts, conditions)
    expect(alerts.some((a) => a.type === 'change-tornado')).toBe(true)
  })

  it('detects entropy heatwave', () => {
    const conditions = Array.from({ length: 6 }, (_, i) => makeCondition(`f${i}.ts`, { temperature: 70 }))
    const alerts = detectAlerts([], conditions)
    expect(alerts.some((a) => a.type === 'entropy-heatwave')).toBe(true)
  })

  it('returns no alerts for calm codebase', () => {
    const conditions = [makeCondition('a.ts', { temperature: 20, visibility: 80 })]
    const alerts = detectAlerts([], conditions)
    expect(alerts.length).toBe(0)
  })
})

// ─── classifyClimate ───────────────────────────────────────────────────────────

describe('classifyClimate', () => {
  it('classifies tropical (hot)', () => {
    expect(classifyClimate(75, 60)).toBe('tropical')
  })

  it('classifies arctic (cold + clear)', () => {
    expect(classifyClimate(15, 80)).toBe('arctic')
  })

  it('classifies extreme (hot + foggy)', () => {
    expect(classifyClimate(55, 25)).toBe('extreme')
  })

  it('classifies temperate', () => {
    expect(classifyClimate(45, 60)).toBe('temperate')
  })
})

// ─── computeClimateStability ───────────────────────────────────────────────────

describe('computeClimateStability', () => {
  const makeCondition = (condition: string): WeatherCondition => ({
    file: 'f.ts', temperature: 20, humidity: 30, windSpeed: 10, visibility: 80, pressure: 20, precipitation: 5, condition: condition as WeatherCondition['condition'], forecast: 'ok',
  })

  it('returns 100 for empty conditions', () => {
    expect(computeClimateStability([])).toBe(100)
  })

  it('returns high for sunny conditions', () => {
    const conditions = [makeCondition('sunny'), makeCondition('calm')]
    expect(computeClimateStability(conditions)).toBeGreaterThan(50)
  })

  it('returns lower for stormy conditions', () => {
    const conditions = [makeCondition('stormy'), makeCondition('windy')]
    expect(computeClimateStability(conditions)).toBeLessThan(70)
  })
})

// ─── generateWeatherRecommendations ────────────────────────────────────────────

describe('generateWeatherRecommendations', () => {
  const makeCondition = (file: string, condition: string): WeatherCondition => ({
    file, temperature: 50, humidity: 50, windSpeed: 30, visibility: 50, pressure: 30, precipitation: 10, condition: condition as WeatherCondition['condition'], forecast: 'ok',
  })

  it('recommends refactoring stormy files', () => {
    const conditions = [makeCondition('bad.ts', 'stormy')]
    const stats = { hottestFile: 'bad.ts' } as WeatherStats
    const recs = generateWeatherRecommendations(conditions, [], [], stats)
    expect(recs.some((r) => r.includes('stormy'))).toBe(true)
  })

  it('recommends documenting foggy files', () => {
    const conditions = [makeCondition('unclear.ts', 'foggy')]
    const stats = { hottestFile: '' } as WeatherStats
    const recs = generateWeatherRecommendations(conditions, [], [], stats)
    expect(recs.some((r) => r.includes('foggy'))).toBe(true)
  })

  it('recommends stabilizing windy files', () => {
    const conditions = [makeCondition('volatile.ts', 'windy')]
    const stats = { hottestFile: '' } as WeatherStats
    const recs = generateWeatherRecommendations(conditions, [], [], stats)
    expect(recs.some((r) => r.includes('volatile'))).toBe(true)
  })

  it('includes alert recommendations', () => {
    const alerts: WeatherAlert[] = [{ severity: 'warning', region: 'src', type: 'complexity-storm', description: 'Complex', affectedFiles: ['a.ts'], recommendation: 'Refactor now' }]
    const stats = { hottestFile: '' } as WeatherStats
    const recs = generateWeatherRecommendations([], [], alerts, stats)
    expect(recs.some((r) => r.includes('Refactor now'))).toBe(true)
  })

  it('positive feedback when all clear', () => {
    const stats = { hottestFile: '' } as WeatherStats
    const recs = generateWeatherRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('pleasant'))).toBe(true)
  })
})

// ─── extractImports / resolveImportPath ────────────────────────────────────────

describe('extractImports', () => {
  it('extracts imports', () => {
    expect(extractImports("import { foo } from './bar'")).toEqual(['./bar'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

describe('resolveImportPath', () => {
  it('resolves with .ts extension', () => {
    expect(resolveImportPath('./utils', new Set(['utils.ts']))).toBe('utils.ts')
  })

  it('returns null for unknown', () => {
    expect(resolveImportPath('./unknown', new Set())).toBeNull()
  })
})

// ─── buildWeatherResult ────────────────────────────────────────────────────────

describe('buildWeatherResult', () => {
  it('handles empty input', () => {
    const result = buildWeatherResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.conditions).toHaveLength(0)
    expect(result.forecasts).toHaveLength(0)
    expect(result.alerts).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('processes single file', () => {
    const result = buildWeatherResult(['a.ts'], ['function foo() { if (x) { return 1 } return 0 }'], {})
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0].file).toBe('a.ts')
    expect(result.conditions[0].temperature).toBeGreaterThan(0)
    expect(result.conditions[0].condition).toBeTruthy()
  })

  it('computes all metrics', () => {
    const result = buildWeatherResult(['a.ts'], ['const x = 1'], {})
    const c = result.conditions[0]
    expect(c.temperature).toBeGreaterThanOrEqual(0)
    expect(c.humidity).toBeGreaterThanOrEqual(0)
    expect(c.windSpeed).toBeGreaterThanOrEqual(0)
    expect(c.visibility).toBeGreaterThanOrEqual(0)
    expect(c.pressure).toBeGreaterThanOrEqual(0)
    expect(c.precipitation).toBeGreaterThanOrEqual(0)
  })

  it('groups into regions', () => {
    const result = buildWeatherResult(['src/a.ts', 'src/b.ts', 'test/c.ts'], ['const x = 1', 'const y = 2', 'const z = 3'], {})
    expect(result.forecasts.length).toBeGreaterThanOrEqual(2)
  })

  it('computes stats correctly', () => {
    const result = buildWeatherResult(['a.ts', 'b.ts'], ['const x = 1', 'function foo() { if (x) { for (let i = 0; i < 10; i++) {} } }'], {})
    expect(result.stats.avgTemperature).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgVisibility).toBeGreaterThanOrEqual(0)
    expect(['tropical', 'temperate', 'arctic', 'extreme']).toContain(result.stats.overallClimate)
    expect(result.stats.climateStability).toBeGreaterThanOrEqual(0)
    expect(result.stats.climateStability).toBeLessThanOrEqual(100)
  })

  it('handles verbose mode', () => {
    const result = buildWeatherResult(['a.ts'], ['const x = 1'], { verbose: true })
    expect(result.stats.totalFiles).toBe(1)
  })

  it('generates forecasts', () => {
    const result = buildWeatherResult(['a.ts'], ['const x = 1'], {})
    expect(result.conditions[0].forecast).toBeTruthy()
  })

  it('detects alerts for complex codebase', () => {
    const files = Array.from({ length: 6 }, (_, i) => `f${i}.ts`)
    const contents = files.map(() => 'if (x) { for (let i = 0; i < 10; i++) { while (y) { if (z) { switch(a) { case 1: try { throw new Error() } catch {} } } } } }')
    const result = buildWeatherResult(files, contents, {})
    expect(result.alerts.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('weatherIcon', () => {
  it('returns icon for each condition', () => {
    expect(weatherIcon('sunny')).toBeTruthy()
    expect(weatherIcon('stormy')).toBeTruthy()
    expect(weatherIcon('foggy')).toBeTruthy()
    expect(weatherIcon('calm')).toBeTruthy()
  })

  it('returns default for unknown', () => {
    expect(weatherIcon('unknown')).toBe('·')
  })
})

describe('formatWeatherMap', () => {
  it('formats weather map', () => {
    const conditions: WeatherCondition[] = [{
      file: 'a.ts', temperature: 50, humidity: 60, windSpeed: 30, visibility: 70, pressure: 20, precipitation: 5, condition: 'sunny', forecast: 'Clear skies',
    }]
    expect(formatWeatherMap(conditions)).toContain('Weather Map')
    expect(formatWeatherMap(conditions)).toContain('a.ts')
  })

  it('handles empty', () => {
    expect(formatWeatherMap([])).toContain('No files')
  })
})

describe('formatRegionalForecasts', () => {
  it('formats forecasts', () => {
    const forecasts: RegionalForecast[] = [{
      region: 'src', conditions: [], avgTemperature: 50, avgVisibility: 60, avgPressure: 30, overall: 'clear', alert: null,
    }]
    expect(formatRegionalForecasts(forecasts)).toContain('Regional Forecasts')
    expect(formatRegionalForecasts(forecasts)).toContain('src')
  })
})

describe('formatAlertBanner', () => {
  it('formats alerts', () => {
    const alerts: WeatherAlert[] = [{
      severity: 'warning', region: 'src', type: 'complexity-storm', description: 'Complex', affectedFiles: ['a.ts'], recommendation: 'Refactor',
    }]
    expect(formatAlertBanner(alerts)).toContain('Weather Alerts')
    expect(formatAlertBanner(alerts)).toContain('WARNING')
  })

  it('shows no alerts message', () => {
    expect(formatAlertBanner([])).toContain('No active alerts')
  })
})

describe('formatTemperatureMap', () => {
  it('formats temperature map', () => {
    const conditions: WeatherCondition[] = [{
      file: 'a.ts', temperature: 80, humidity: 50, windSpeed: 30, visibility: 50, pressure: 20, precipitation: 5, condition: 'cloudy', forecast: 'ok',
    }]
    expect(formatTemperatureMap(conditions)).toContain('Temperature Map')
  })
})

describe('formatVisibilityChart', () => {
  it('formats visibility chart', () => {
    const conditions: WeatherCondition[] = [{
      file: 'a.ts', temperature: 20, humidity: 50, windSpeed: 10, visibility: 90, pressure: 20, precipitation: 5, condition: 'sunny', forecast: 'ok',
    }]
    expect(formatVisibilityChart(conditions)).toContain('Visibility')
  })
})

describe('formatClimateClassification', () => {
  it('formats climate stats', () => {
    const stats: WeatherStats = {
      sunnyCount: 5, stormyCount: 2, foggyCount: 1, avgTemperature: 45, avgVisibility: 60, avgPressure: 30, avgWindSpeed: 25,
      hottestFile: 'complex.ts', coldestFile: 'simple.ts', calmestRegion: 'src', stormiestRegion: 'test',
      alertCount: 1, overallClimate: 'temperate', climateStability: 75,
    }
    const result = formatClimateClassification(stats)
    expect(result).toContain('temperate')
    expect(result).toContain('complex.ts')
  })
})

describe('formatWeatherJson', () => {
  it('formats as JSON', () => {
    const result = buildWeatherResult(['a.ts'], ['const x = 1'], {})
    const json = formatWeatherJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatWeatherTable', () => {
  it('formats as table', () => {
    const result = buildWeatherResult(['a.ts'], ['const x = 1'], {})
    const table = formatWeatherTable(result)
    expect(table).toContain('Weather Map')
    expect(table).toContain('Climate')
    expect(table).toContain('Recommendations')
  })
})
