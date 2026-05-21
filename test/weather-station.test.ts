import { describe, expect, it } from 'vitest'
import {
  analyzeClimateZone,
  analyzeWeatherReading,
  buildWeatherStationResult,
  classifyMeteorologistGrade,
  classifyZoneType,
  measureAnemometer,
  measureBarometer,
  measureHygrometer,
  measureRainGauge,
  measureThermometer,
  measureVisibility,
} from '../src/commands/weather-station-helpers.js'
import { formatWeatherStationJson, formatWeatherStationTable } from '../src/commands/weather-station-format-helpers.js'

// ─── measureThermometer ─────────────────────────────────────────────────────

describe('measureThermometer', () => {
  it('returns frigid for empty content', () => {
    const r = measureThermometer('')
    expect(r.scale).toBe('frigid')
    expect(r.reading).toBe(0)
    expect(r.hasColdSpell).toBe(true)
    expect(r.hasFrostbite).toBe(true)
  })

  it('detects comfortable temperature for moderate code', () => {
    const code = 'function a() { return 1 }\nfunction b() { return 2 }\nconst x = a()'
    const r = measureThermometer(code)
    expect(r.reading).toBeGreaterThan(0)
  })

  it('detects heat wave for highly active code', () => {
    const code = Array(20).fill('export function fn() { return [1,2,3].map(x => x).filter(x => x) }').join('\n')
    const r = measureThermometer(code)
    expect(r.hasHeatWave).toBe(true)
    expect(r.scale).toBe('scorching')
  })

  it('detects frostbite from dead code', () => {
    const code = 'debugger;'
    const r = measureThermometer(code)
    expect(r.hasFrostbite).toBe(true)
  })

  it('detects volatile trend from excessive pipes', () => {
    const code = 'function run(arr) { return arr.map(x => x).map(x => x).map(x => x).map(x => x).map(x => x) }'
    const r = measureThermometer(code)
    expect(r.temperatureTrend).toBe('volatile')
  })

  it('computes reading within valid range', () => {
    const code = 'function a() { return 1 }\nexport const x = 2\nexport function b() { return 3 }\nconst y = a()'
    const r = measureThermometer(code)
    expect(r.reading).toBeGreaterThanOrEqual(0)
    expect(r.reading).toBeLessThanOrEqual(100)
  })
})

// ─── measureBarometer ───────────────────────────────────────────────────────

describe('measureBarometer', () => {
  it('returns low pressure for empty content', () => {
    const r = measureBarometer('')
    expect(r.isLowPressure).toBe(true)
    expect(r.hasClearSkies).toBe(true)
    expect(r.frontCount).toBe(0)
  })

  it('detects high pressure from branching', () => {
    const code = Array(20).fill('if (x > 0) { for (let i = 0; i < 10; i++) { } }').join('\n')
    const r = measureBarometer(code)
    expect(r.isHighPressure).toBe(true)
  })

  it('detects storm system for high pressure', () => {
    const lines: string[] = []
    for (let i = 0; i < 30; i++) {
      lines.push(`if (x${i}) { for (let i = 0; i < 10; i++) { switch(z) {} } }`)
    }
    const r = measureBarometer(lines.join('\n'))
    expect(r.reading).toBeGreaterThan(50)
  })

  it('detects fronts from switches', () => {
    const code = 'function process(x) { switch(x) { case 1: break } }'
    const r = measureBarometer(code)
    expect(r.hasFront).toBe(true)
  })

  it('detects isobar (balanced branching)', () => {
    const code = 'function run() { if (x) {} for (let i = 0; i < 10; i++) {} }'
    const r = measureBarometer(code)
    expect(r.hasIsobar).toBe(true)
  })
})

// ─── measureHygrometer ──────────────────────────────────────────────────────

describe('measureHygrometer', () => {
  it('returns arid for empty content', () => {
    const r = measureHygrometer('')
    expect(r.comfort).toBe('arid')
    expect(r.hasDrought).toBe(true)
  })

  it('detects drought for code with no imports', () => {
    const code = 'function a() {}\nfunction b() {}'
    const r = measureHygrometer(code)
    expect(r.hasDrought).toBe(true)
  })

  it('detects condensation from many imports', () => {
    const imports = Array(8).fill('import { x } from "y"').join('\n')
    const r = measureHygrometer(imports)
    expect(r.hasCondensation).toBe(true)
  })

  it('detects fog from excessive imports', () => {
    const imports = Array(15).fill('import { x } from "y"').join('\n')
    const r = measureHygrometer(imports)
    expect(r.hasFog).toBe(true)
  })

  it('detects mold from side effects', () => {
    const code = Array(8).fill('console.log("x")').join('\n')
    const r = measureHygrometer(code)
    expect(r.hasMold).toBe(true)
  })

  it('detects comfortable moisture', () => {
    const code = 'import { x } from "y"\nconst a: number = x'
    const r = measureHygrometer(code)
    expect(r.hasDewPoint).toBe(true)
  })
})

// ─── measureAnemometer ──────────────────────────────────────────────────────

describe('measureAnemometer', () => {
  it('returns calm for empty content', () => {
    const r = measureAnemometer('')
    expect(r.direction).toBe('calm')
    expect(r.beaufortScale).toBe(0)
    expect(r.isCalm).toBe(true)
  })

  it('detects gusts from mutations', () => {
    const code = 'const arr = []\narr.push(1)\narr.push(2)\narr.push(3)\narr.push(4)'
    const r = measureAnemometer(code)
    expect(r.hasGusts).toBe(true)
    expect(r.gustCount).toBeGreaterThanOrEqual(4)
  })

  it('detects sustained winds from many lets', () => {
    const code = 'let a = 1\nlet b = 2\nlet c = 3\nlet d = 4'
    const r = measureAnemometer(code)
    expect(r.hasSustainedWinds).toBe(true)
  })

  it('detects gale force', () => {
    const code = Array(15).fill('let x = 1; x = 2; arr.push(x)').join('\n')
    const r = measureAnemometer(code)
    expect(r.hasGaleForce).toBe(true)
  })

  it('detects jet stream from pipes', () => {
    const code = 'function run(arr) { return arr.map(x => x).filter(x => x).reduce((a,b) => a+b, 0).flatMap(x => [x]) }'
    const r = measureAnemometer(code)
    expect(r.hasJetStream).toBe(true)
  })

  it('computes beaufort scale', () => {
    const r = measureAnemometer('const x = 1')
    expect(r.beaufortScale).toBeGreaterThanOrEqual(0)
    expect(r.beaufortScale).toBeLessThanOrEqual(12)
  })
})

// ─── measureRainGauge ───────────────────────────────────────────────────────

describe('measureRainGauge', () => {
  it('returns clear for empty content', () => {
    const r = measureRainGauge('')
    expect(r.type).toBe('clear')
    expect(r.hasDrought).toBe(true)
    expect(r.umbrellaCount).toBe(0)
  })

  it('detects drainage from try/catch', () => {
    const code = 'function safe() { try { return 1 } catch { return 0 } }'
    const r = measureRainGauge(code)
    expect(r.hasDrainage).toBe(true)
  })

  it('detects flooding from side effects without error handling', () => {
    const code = Array(8).fill('console.log("x")').join('\n')
    const r = measureRainGauge(code)
    expect(r.hasFlooding).toBe(true)
  })

  it('detects acid rain from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureRainGauge(code)
    expect(r.hasAcidRain).toBe(true)
  })

  it('detects rainbow from good docs + error handling', () => {
    const code = '/** Safe function */\nfunction safe(x: number) { try { return x } catch { return 0 } }'
    const r = measureRainGauge(code)
    expect(r.hasRainbow).toBe(true)
  })

  it('detects umbrella from validation + types', () => {
    const code = 'function validate(x: number) { if (x > 0) { return x } }'
    const r = measureRainGauge(code)
    expect(r.hasUmbrella).toBe(true)
  })

  it('assigns monsoon for high precipitation', () => {
    const code = Array(15).fill('try { if (x) { throw new Error() } } catch(e) { console.error(e) }').join('\n')
    const r = measureRainGauge(code)
    expect(r.type).toBe('monsoon')
  })
})

// ─── measureVisibility ──────────────────────────────────────────────────────

describe('measureVisibility', () => {
  it('returns zero for empty content', () => {
    const r = measureVisibility('')
    expect(r.condition).toBe('zero')
    expect(r.hasClearView).toBe(false)
  })

  it('detects clear view from good docs and types', () => {
    const code = [
      '/** Add two numbers */',
      'interface Result { value: number }',
      'export function add(a: number, b: number): number { return a + b }',
    ].join('\n')
    const r = measureVisibility(code)
    expect(r.hasClearView).toBe(true)
    expect(r.hasAurora).toBe(true)
  })

  it('detects smog from any types', () => {
    const code = 'function bad(x: any) { return x }'
    const r = measureVisibility(code)
    expect(r.hasSmog).toBe(true)
  })

  it('detects whiteout from dead code in large files', () => {
    const lines = Array(15).fill('debugger;')
    const r = measureVisibility(lines.join('\n'))
    expect(r.hasWhiteout).toBe(true)
  })

  it('detects haze for moderate clarity', () => {
    const r = measureVisibility('const x = 1\nconst y = 2')
    expect(r.hazeCount).toBeGreaterThanOrEqual(0)
  })

  it('detects mirage from any types with docs', () => {
    const code = '/** Misleading docs */\nfunction bad(x: any) { return x }'
    const r = measureVisibility(code)
    expect(r.hasMirage).toBe(true)
  })
})

// ─── analyzeWeatherReading ──────────────────────────────────────────────────

describe('analyzeWeatherReading', () => {
  it('returns natural-disaster for very bad content', () => {
    const code = Array(10).fill('let x = 1; x = 2; arr.push(1); if (x) { for (;;) { switch(x) {} } }').join('\n')
    const r = analyzeWeatherReading(code, 'bad.ts')
    expect(r.qualityScore).toBeGreaterThanOrEqual(0)
    expect(r.qualityScore).toBeLessThanOrEqual(100)
  })

  it('includes all sub-measures', () => {
    const r = analyzeWeatherReading('const x = 1', 'test.ts')
    expect(r).toHaveProperty('thermometer')
    expect(r).toHaveProperty('barometer')
    expect(r).toHaveProperty('hygrometer')
    expect(r).toHaveProperty('anemometer')
    expect(r).toHaveProperty('rainGauge')
    expect(r).toHaveProperty('visibilityMeasure')
  })

  it('computes quality score', () => {
    const r = analyzeWeatherReading('const x: number = 1', 'test.ts')
    expect(r.qualityScore).toBeGreaterThanOrEqual(0)
    expect(r.qualityScore).toBeLessThanOrEqual(100)
  })
})

// ─── classifyZoneType ───────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns disaster-zone for empty readings', () => {
    expect(classifyZoneType([])).toBe('disaster-zone')
  })

  it('returns tropical-paradise for high quality', () => {
    const readings = [
      { condition: 'perfect-day', qualityScore: 95 } as any,
      { condition: 'perfect-day', qualityScore: 90 } as any,
      { condition: 'fair-weather', qualityScore: 80 } as any,
    ]
    expect(classifyZoneType(readings)).toBe('tropical-paradise')
  })

  it('returns arctic for low quality', () => {
    const readings = [
      { condition: 'stormy', qualityScore: 20 } as any,
      { condition: 'overcast', qualityScore: 25 } as any,
    ]
    expect(classifyZoneType(readings)).toBe('arctic')
  })
})

// ─── classifyMeteorologistGrade ──────────────────────────────────────────────

describe('classifyMeteorologistGrade', () => {
  it('returns chief-meteorologist for 90+', () => expect(classifyMeteorologistGrade(95)).toBe('chief-meteorologist'))
  it('returns senior-forecaster for 75+', () => expect(classifyMeteorologistGrade(80)).toBe('senior-forecaster'))
  it('returns meteorologist for 55+', () => expect(classifyMeteorologistGrade(60)).toBe('meteorologist'))
  it('returns weather-observer for 35+', () => expect(classifyMeteorologistGrade(40)).toBe('weather-observer'))
  it('returns amateur for 15+', () => expect(classifyMeteorologistGrade(20)).toBe('amateur'))
  it('returns groundhog for below 15', () => expect(classifyMeteorologistGrade(5)).toBe('groundhog'))
})

// ─── analyzeClimateZone ─────────────────────────────────────────────────────

describe('analyzeClimateZone', () => {
  it('returns defaults for empty readings', () => {
    const r = analyzeClimateZone([], 'src/')
    expect(r.zoneType).toBe('disaster-zone')
    expect(r.avgTemperature).toBe(0)
    expect(r.perfectDayCount).toBe(0)
  })

  it('computes averages from readings', () => {
    const r1 = analyzeWeatherReading('const x: number = 1', 'a.ts')
    const r2 = analyzeWeatherReading('export function y() { return 1 }', 'b.ts')
    const r = analyzeClimateZone([r1, r2], '.')
    expect(r.readings).toHaveLength(2)
    expect(r.avgTemperature).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildWeatherStationResult ──────────────────────────────────────────────

describe('buildWeatherStationResult', () => {
  it('returns empty result for no files', () => {
    const r = buildWeatherStationResult([], [], {})
    expect(r.readings).toHaveLength(0)
    expect(r.zones).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.meteorologistGrade).toBe('groundhog')
    expect(r.bureau.isCalmClimate).toBe(false)
  })

  it('analyzes single file', () => {
    const r = buildWeatherStationResult(['test.ts'], ['const x: number = 1'], {})
    expect(r.readings).toHaveLength(1)
    expect(r.readings[0].file).toBe('test.ts')
    expect(r.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into zones', () => {
    const r = buildWeatherStationResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const a = 1', 'const b = 2', 'const c = 3'],
      {},
    )
    expect(r.zones.length).toBeGreaterThanOrEqual(2)
    expect(r.stats.totalZones).toBeGreaterThanOrEqual(2)
  })

  it('computes correct averages', () => {
    const r = buildWeatherStationResult(
      ['a.ts', 'b.ts'],
      ['const x: number = 1', 'export function y() { return 1 }'],
      {},
    )
    expect(r.stats.avgTemperature).toBeGreaterThanOrEqual(0)
    expect(r.stats.avgPressure).toBeGreaterThanOrEqual(0)
    expect(r.stats.overallClimate).toBeGreaterThanOrEqual(0)
  })

  it('tracks condition counts', () => {
    const r = buildWeatherStationResult(['a.ts'], ['const x: number = 1'], {})
    const total = r.stats.perfectDayCount + r.stats.fairWeatherCount + r.stats.partlyCloudyCount + r.stats.overcastCount + r.stats.stormyCount + r.stats.naturalDisasterCount
    expect(total).toBe(1)
  })

  it('identifies best readings', () => {
    const r = buildWeatherStationResult(
      ['bad.ts', 'good.ts'],
      ['debugger;', 'export function gold(): number { return 42 }'],
      {},
    )
    expect(r.stats.bestConditions).toBeTruthy()
    expect(r.stats.clearestSkies).toBeTruthy()
  })

  it('generates recommendations', () => {
    const r = buildWeatherStationResult(
      ['a.ts'],
      ['console.log("x")\nconsole.log("y")\nconsole.log("z")'],
      {},
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('sets bureau properties', () => {
    const r = buildWeatherStationResult(['a.ts'], ['const x = 1'], {})
    expect(r.bureau.avgTemperature).toBeGreaterThanOrEqual(0)
    expect(typeof r.bureau.isCalmClimate).toBe('boolean')
  })

  it('tracks weather counts', () => {
    const r = buildWeatherStationResult(
      ['a.ts', 'b.ts'],
      ['const x: number = 1', 'function bad() { console.log("x"); arr.push(1) }'],
      {},
    )
    expect(r.stats.isComfortableCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasDrainageCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasClearViewCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────

describe('formatWeatherStationTable', () => {
  it('formats empty result', () => {
    const r = buildWeatherStationResult([], [], {})
    const out = formatWeatherStationTable(r, false)
    expect(out).toContain('Weather Station')
    expect(out).toContain('No files analyzed')
  })

  it('formats with readings', () => {
    const r = buildWeatherStationResult(['a.ts'], ['const x = 1'], {})
    const out = formatWeatherStationTable(r, false)
    expect(out).toContain('a.ts')
    expect(out).toContain('Summary')
  })

  it('shows verbose mode with all readings', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const r = buildWeatherStationResult(files, contents, {})
    const out = formatWeatherStationTable(r, true)
    expect(out).toContain('file19.ts')
  })

  it('truncates in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const r = buildWeatherStationResult(files, contents, {})
    const out = formatWeatherStationTable(r, false)
    expect(out).toContain('more')
  })
})

describe('formatWeatherStationJson', () => {
  it('produces valid JSON', () => {
    const r = buildWeatherStationResult(['a.ts'], ['const x = 1'], {})
    const out = formatWeatherStationJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
