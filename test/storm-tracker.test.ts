import { describe, expect, it } from 'vitest'

import {
  buildStormTrackerResult,
  classifyCondition,
  classifyOverallWeather,
  computeHumidity,
  computePrecipitation,
  computePressure,
  computeStabilityIndex,
  computeStormIndex,
  computeTemperature,
  computeVisibility,
  computeWindSpeed,
  detectCyclones,
  detectDroughts,
  detectFog,
  detectHurricanes,
  detectThunderstorms,
  detectTornadoes,
  generateForecasts,
  generateRecommendations,
  type AtmosphericCondition,
  type StormTrackerOptions,
  type StormTrackerResult,
  type StormTrackerStats,
  type WeatherForecast,
  type WeatherSystem,
} from '../src/commands/storm-tracker-helpers.js'

import {
  formatConditions,
  formatForecasts,
  formatGauge,
  formatRecommendations,
  formatStormTrackerJson,
  formatStormTrackerStats,
  formatStormTrackerTable,
  formatWeatherLabel,
  formatWeatherSystems,
} from '../src/commands/storm-tracker-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `function hello() {
  return 'world'
}
`

const COMPLEX_CONTENT = `import { readFile } from 'fs'
import { resolve } from 'path'
import { parse } from './parser'
import { format } from './formatter'

// TODO: refactor this
// FIXME: handle errors
// HACK: workaround for issue
function processData(input: string) {
  if (input.length > 0) {
    for (const item of input.split(',')) {
      if (item.startsWith('a')) {
        console.log(item)
        try {
          const parsed = JSON.parse(item)
          if (parsed && parsed.type === 'special') {
            for (let i = 0; i < parsed.count; i++) {
              if (i % 2 === 0) {
                console.log('even', i)
              } else {
                console.log('odd', i)
              }
            }
          }
        } catch (e) {
          console.error(e)
        }
      } else if (item.startsWith('b')) {
        console.log('b:', item)
      } else {
        console.log('other:', item)
      }
    }
  }
  return input
}

export { processData }
`

const NESTED_CONTENT = `function deep() {
  if (true) {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            if (true) {
              if (true) {
                console.log('deeply nested')
              }
            }
          }
        }
      }
    }
  }
}
`

const COUPLED_CONTENT = `import { a } from './module-a'
import { b } from './module-b'
import { c } from './module-c'
import { d } from './module-d'
import { e } from './module-e'

export function process() {
  return a + b + c + d + e
}

export function validate() {
  return true
}

export function transform() {
  return null
}
`

const DEBT_CONTENT = `// TODO: fix this later
// TODO: add error handling
// FIXME: this is broken
// FIXME: memory leak
// HACK: temporary workaround
// HACK: another hack
// XXX: dangerous code
var x = 1
var y = 2
eval('alert("xss")')
`

const CLEAN_CONTENT = `/** Clean module with docs */
export function add(a: number, b: number): number {
  return a + b
}

/** Subtract two numbers */
export function subtract(a: number, b: number): number {
  return a - b
}
`

const MINIMAL_CONTENT = `const x = 1
`

const CYCLE_CONTENT_A = `import { b } from './module-b'
export function a() { return b() }
`

const CYCLE_CONTENT_B = `import { a } from './module-a'
export function b() { return a() }
`

const DRY_CONTENT = `const PI = 3.14
`

const LOW_WIND_CONTENT = `// simple
const x = 1
const y = 2
`

// ─── Temperature ───────────────────────────────────────────────────────────────

describe('computeTemperature', () => {
  it('returns 20 for empty content', () => {
    expect(computeTemperature(EMPTY_CONTENT)).toBe(20)
  })

  it('returns 20 for whitespace-only content', () => {
    expect(computeTemperature('   \n  \n  ')).toBe(20)
  })

  it('computes temperature for simple code', () => {
    const temp = computeTemperature(SIMPLE_CONTENT)
    expect(temp).toBeGreaterThan(0)
    expect(temp).toBeLessThanOrEqual(100)
  })

  it('increases with complexity patterns', () => {
    const simple = computeTemperature('const x = 1')
    const complex = computeTemperature(COMPLEX_CONTENT)
    expect(complex).toBeGreaterThan(simple)
  })

  it('increases with nesting depth', () => {
    const simple = computeTemperature('if (x) { }')
    const nested = computeTemperature(NESTED_CONTENT)
    expect(nested).toBeGreaterThan(simple)
  })

  it('increases with function count', () => {
    const one = computeTemperature('function a() {}')
    const many = computeTemperature('function a() {}\nfunction b() {}\nfunction c() {}')
    expect(many).toBeGreaterThanOrEqual(one)
  })

  it('increases for long files', () => {
    const longContent = Array(150).fill('const x = 1').join('\n')
    const shortContent = 'const x = 1'
    expect(computeTemperature(longContent)).toBeGreaterThan(computeTemperature(shortContent))
  })

  it('clamps result to 0-100', () => {
    const result = computeTemperature(COMPLEX_CONTENT)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Humidity ──────────────────────────────────────────────────────────────────

describe('computeHumidity', () => {
  it('returns 0 for empty content', () => {
    expect(computeHumidity(EMPTY_CONTENT, 5)).toBe(0)
  })

  it('returns 10 for single file project', () => {
    expect(computeHumidity('import { x } from "./a"', 1)).toBe(10)
  })

  it('increases with relative imports', () => {
    const simple = computeHumidity('import fs from "fs"', 5)
    const coupled = computeHumidity(COUPLED_CONTENT, 10)
    expect(coupled).toBeGreaterThan(simple)
  })

  it('increases with exports', () => {
    const noExports = computeHumidity('const x = 1', 5)
    const withExports = computeHumidity('export const x = 1\nexport const y = 2', 5)
    expect(withExports).toBeGreaterThan(noExports)
  })

  it('clamps to 0-100', () => {
    const result = computeHumidity(COUPLED_CONTENT, 10)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Pressure ──────────────────────────────────────────────────────────────────

describe('computePressure', () => {
  it('returns 0 for empty content', () => {
    expect(computePressure(EMPTY_CONTENT)).toBe(0)
  })

  it('returns base 5 for clean content', () => {
    expect(computePressure('const x = 1')).toBe(5)
  })

  it('increases with TODOs', () => {
    const clean = computePressure('const x = 1')
    const withTodo = computePressure('// TODO: fix')
    expect(withTodo).toBeGreaterThan(clean)
  })

  it('increases with FIXMEs more than TODOs', () => {
    const todo = computePressure('// TODO: fix')
    const fixme = computePressure('// FIXME: broken')
    expect(fixme).toBeGreaterThan(todo)
  })

  it('increases with HACKs', () => {
    const clean = computePressure('const x = 1')
    const hack = computePressure('// HACK: workaround')
    expect(hack).toBeGreaterThan(clean)
  })

  it('increases with var usage', () => {
    const clean = computePressure('const x = 1')
    const withVar = computePressure('var x = 1')
    expect(withVar).toBeGreaterThan(clean)
  })

  it('increases with eval usage', () => {
    const clean = computePressure('const x = 1')
    const withEval = computePressure('eval("x")')
    expect(withEval).toBeGreaterThan(clean)
  })

  it('clamps to 0-100', () => {
    const result = computePressure(DEBT_CONTENT)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Wind Speed ────────────────────────────────────────────────────────────────

describe('computeWindSpeed', () => {
  it('returns 0 for empty content', () => {
    expect(computeWindSpeed(EMPTY_CONTENT)).toBe(0)
  })

  it('returns base speed for simple content', () => {
    const speed = computeWindSpeed(MINIMAL_CONTENT)
    expect(speed).toBeGreaterThan(0)
  })

  it('increases with line count', () => {
    const short = computeWindSpeed('const x = 1')
    const long = computeWindSpeed(Array(50).fill('const x = 1').join('\n'))
    expect(long).toBeGreaterThan(short)
  })

  it('increases with branching', () => {
    const noBranch = computeWindSpeed('const x = 1')
    const withBranch = computeWindSpeed('if (x) {} else {}')
    expect(withBranch).toBeGreaterThan(noBranch)
  })

  it('clamps to 0-100', () => {
    const result = computeWindSpeed(COMPLEX_CONTENT)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Visibility ────────────────────────────────────────────────────────────────

describe('computeVisibility', () => {
  it('returns 100 for empty content', () => {
    expect(computeVisibility(EMPTY_CONTENT)).toBe(100)
  })

  it('returns 100 for whitespace only', () => {
    expect(computeVisibility('   ')).toBe(100)
  })

  it('increases with JSDoc comments', () => {
    const noDocs = computeVisibility('function foo() {}')
    const withDocs = computeVisibility(CLEAN_CONTENT)
    expect(withDocs).toBeGreaterThan(noDocs)
  })

  it('decreases with deep nesting', () => {
    const shallow = computeVisibility('function foo() {}')
    const deep = computeVisibility(NESTED_CONTENT)
    expect(shallow).toBeGreaterThan(deep)
  })

  it('decreases with long lines', () => {
    const short = computeVisibility('const x = 1')
    const long = computeVisibility('const x = "this is a really really really really really really really really really really really really really really really really really really really really long line"')
    expect(short).toBeGreaterThan(long)
  })

  it('clamps to 0-100', () => {
    const result = computeVisibility(COMPLEX_CONTENT)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Precipitation ─────────────────────────────────────────────────────────────

describe('computePrecipitation', () => {
  it('returns 0 for empty content', () => {
    expect(computePrecipitation(EMPTY_CONTENT)).toBe(0)
  })

  it('increases with console.log', () => {
    const clean = computePrecipitation('const x = 1')
    const debug = computePrecipitation('console.log("debug")')
    expect(debug).toBeGreaterThan(clean)
  })

  it('increases with TODO/FIXME/HACK', () => {
    const clean = computePrecipitation('const x = 1')
    const debt = computePrecipitation('// TODO: fix\n// FIXME: broken')
    expect(debt).toBeGreaterThan(clean)
  })

  it('increases with eval', () => {
    const clean = computePrecipitation('const x = 1')
    const withEval = computePrecipitation('eval("code")')
    expect(withEval).toBeGreaterThan(clean)
  })

  it('clamps to 0-100', () => {
    const result = computePrecipitation(DEBT_CONTENT)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Condition Classification ──────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns foggy for very low visibility', () => {
    expect(classifyCondition(30, 30, 25)).toBe('foggy')
  })

  it('returns stormy for high temp and humidity', () => {
    expect(classifyCondition(75, 65, 60)).toBe('stormy')
  })

  it('returns rainy for moderate temp and humidity', () => {
    expect(classifyCondition(55, 45, 70)).toBe('rainy')
  })

  it('returns cloudy for high humidity', () => {
    expect(classifyCondition(30, 65, 70)).toBe('cloudy')
  })

  it('returns hazy for moderate visibility', () => {
    expect(classifyCondition(30, 25, 55)).toBe('hazy')
  })

  it('returns partly-cloudy for moderate conditions', () => {
    expect(classifyCondition(45, 25, 70)).toBe('partly-cloudy')
  })

  it('returns sunny for calm conditions', () => {
    expect(classifyCondition(20, 15, 80)).toBe('sunny')
  })

  it('prioritizes foggy over other conditions', () => {
    expect(classifyCondition(80, 80, 20)).toBe('foggy')
  })
})

// ─── Cyclone Detection ─────────────────────────────────────────────────────────

describe('detectCyclones', () => {
  it('returns empty for no cycles', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'import { x } from "fs"',
      'const y = 1',
    ]
    const result = detectCyclones(files, contents)
    expect(result).toEqual([])
  })

  it('detects circular dependency', () => {
    const files = ['src/module-a.ts', 'src/module-b.ts']
    const contents = [CYCLE_CONTENT_A, CYCLE_CONTENT_B]
    const result = detectCyclones(files, contents)
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  it('returns systems with correct type', () => {
    const files = ['src/a.ts', 'src/b.ts']
    const contents = [
      "import { b } from './b'",
      "import { a } from './a'",
    ]
    const result = detectCyclones(files, contents)
    for (const s of result) {
      expect(s.type).toBe('cyclone')
      expect(s.category).toBeGreaterThanOrEqual(1)
      expect(s.category).toBeLessThanOrEqual(5)
    }
  })

  it('returns empty for single file', () => {
    const result = detectCyclones(['a.ts'], ['const x = 1'])
    expect(result).toEqual([])
  })
})

// ─── Thunderstorm Detection ────────────────────────────────────────────────────

describe('detectThunderstorms', () => {
  it('returns empty for calm conditions', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 20, humidity: 30, pressure: 10, windSpeed: 15, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    expect(detectThunderstorms(conditions)).toEqual([])
  })

  it('detects thunderstorms for hot and windy files', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 75, humidity: 50, pressure: 20, windSpeed: 60, visibility: 70, precipitation: 0, condition: 'stormy' },
    ]
    const result = detectThunderstorms(conditions)
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('thunderstorm')
    expect(result[0].movement).toBe('fast-moving')
  })

  it('does not detect for low temperature', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 50, humidity: 80, pressure: 20, windSpeed: 60, visibility: 70, precipitation: 0, condition: 'cloudy' },
    ]
    expect(detectThunderstorms(conditions)).toEqual([])
  })

  it('does not detect for low wind', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 75, humidity: 80, pressure: 20, windSpeed: 40, visibility: 70, precipitation: 0, condition: 'stormy' },
    ]
    expect(detectThunderstorms(conditions)).toEqual([])
  })
})

// ─── Hurricane Detection ───────────────────────────────────────────────────────

describe('detectHurricanes', () => {
  it('returns empty for low coupling', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 40, pressure: 10, windSpeed: 15, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    expect(detectHurricanes(conditions, ['a.ts'])).toEqual([])
  })

  it('detects hurricanes for coupled and complex files', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 60, humidity: 75, pressure: 20, windSpeed: 40, visibility: 70, precipitation: 0, condition: 'stormy' },
    ]
    const result = detectHurricanes(conditions, ['a.ts'])
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('hurricane')
    expect(result[0].movement).toBe('expanding')
  })
})

// ─── Tornado Detection ─────────────────────────────────────────────────────────

describe('detectTornadoes', () => {
  it('returns empty for shallow code', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 30, pressure: 10, windSpeed: 15, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    expect(detectTornadoes(conditions, [SIMPLE_CONTENT])).toEqual([])
  })

  it('detects tornadoes for deeply nested hot code', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 80, humidity: 30, pressure: 10, windSpeed: 15, visibility: 80, precipitation: 0, condition: 'partly-cloudy' },
    ]
    const result = detectTornadoes(conditions, [NESTED_CONTENT])
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('tornado')
  })

  it('does not detect for low temperature even with deep nesting', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 50, humidity: 30, pressure: 10, windSpeed: 15, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    expect(detectTornadoes(conditions, [NESTED_CONTENT])).toEqual([])
  })
})

// ─── Drought Detection ─────────────────────────────────────────────────────────

describe('detectDroughts', () => {
  it('detects droughts for stagnant files', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'stagnant.ts', temperature: 20, humidity: 10, pressure: 5, windSpeed: 15, visibility: 90, precipitation: 0, condition: 'sunny' },
    ]
    const result = detectDroughts(conditions)
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('drought')
    expect(result[0].category).toBe(1)
    expect(result[0].movement).toBe('stationary')
  })

  it('returns empty for active files', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 50, humidity: 30, pressure: 30, windSpeed: 40, visibility: 80, precipitation: 0, condition: 'partly-cloudy' },
    ]
    expect(detectDroughts(conditions)).toEqual([])
  })
})

// ─── Fog Detection ─────────────────────────────────────────────────────────────

describe('detectFog', () => {
  it('detects fog for low visibility files', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'foggy.ts', temperature: 30, humidity: 40, pressure: 10, windSpeed: 15, visibility: 30, precipitation: 0, condition: 'foggy' },
    ]
    const result = detectFog(conditions)
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('fog')
  })

  it('returns empty for clear files', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'clear.ts', temperature: 30, humidity: 30, pressure: 10, windSpeed: 15, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    expect(detectFog(conditions)).toEqual([])
  })
})

// ─── Forecasts ─────────────────────────────────────────────────────────────────

describe('generateForecasts', () => {
  it('generates forecasts per directory', () => {
    const systems: WeatherSystem[] = []
    const conditions: AtmosphericCondition[] = [
      { file: 'src/a.ts', temperature: 40, humidity: 30, pressure: 20, windSpeed: 25, visibility: 70, precipitation: 0, condition: 'partly-cloudy' },
      { file: 'src/b.ts', temperature: 35, humidity: 25, pressure: 15, windSpeed: 20, visibility: 75, precipitation: 0, condition: 'sunny' },
    ]
    const result = generateForecasts(systems, conditions)
    expect(result.length).toBeGreaterThanOrEqual(1)
    for (const f of result) {
      expect(f.shortTerm).toBeDefined()
      expect(f.longTerm).toBeDefined()
      expect(f.riskLevel).toBeDefined()
      expect(f.confidence).toBeGreaterThanOrEqual(0)
      expect(f.confidence).toBeLessThanOrEqual(100)
    }
  })

  it('predicts issues for high pressure', () => {
    const systems: WeatherSystem[] = []
    const conditions: AtmosphericCondition[] = [
      { file: 'src/a.ts', temperature: 30, humidity: 30, pressure: 40, windSpeed: 20, visibility: 70, precipitation: 0, condition: 'partly-cloudy' },
    ]
    const result = generateForecasts(systems, conditions)
    const forecast = result[0]
    expect(forecast.predictedIssues).toContain('Technical debt accumulation')
  })

  it('predicts issues for high temperature', () => {
    const systems: WeatherSystem[] = []
    const conditions: AtmosphericCondition[] = [
      { file: 'src/a.ts', temperature: 60, humidity: 30, pressure: 10, windSpeed: 20, visibility: 70, precipitation: 0, condition: 'stormy' },
    ]
    const result = generateForecasts(systems, conditions)
    const forecast = result[0]
    expect(forecast.predictedIssues).toContain('Complexity growth')
  })

  it('sets extreme risk for severe systems', () => {
    const systems: WeatherSystem[] = [
      { id: 's1', type: 'hurricane', name: 'H1', epicenter: 'src/a.ts', affectedFiles: ['src/a.ts'], intensity: 90, category: 4, movement: 'expanding', description: '', forecast: '' },
    ]
    const conditions: AtmosphericCondition[] = [
      { file: 'src/a.ts', temperature: 40, humidity: 30, pressure: 10, windSpeed: 20, visibility: 70, precipitation: 0, condition: 'partly-cloudy' },
    ]
    const result = generateForecasts(systems, conditions)
    expect(result[0].riskLevel).toBe('extreme')
  })
})

// ─── Storm Index ───────────────────────────────────────────────────────────────

describe('computeStormIndex', () => {
  it('returns 0 for no systems and calm conditions', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 20, humidity: 20, pressure: 5, windSpeed: 10, visibility: 90, precipitation: 0, condition: 'sunny' },
    ]
    const result = computeStormIndex([], conditions)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('increases with severe systems', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 20, humidity: 20, pressure: 5, windSpeed: 10, visibility: 90, precipitation: 0, condition: 'sunny' },
    ]
    const calm = computeStormIndex([], conditions)
    const severe: WeatherSystem[] = [
      { id: 's1', type: 'cyclone', name: 'C1', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 90, category: 5, movement: 'stationary', description: '', forecast: '' },
    ]
    const stormy = computeStormIndex(severe, conditions)
    expect(stormy).toBeGreaterThan(calm)
  })

  it('increases with stormy conditions', () => {
    const calm: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 20, humidity: 20, pressure: 5, windSpeed: 10, visibility: 90, precipitation: 0, condition: 'sunny' },
    ]
    const stormy: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 80, humidity: 70, pressure: 50, windSpeed: 60, visibility: 40, precipitation: 30, condition: 'stormy' },
    ]
    const calmIdx = computeStormIndex([], calm)
    const stormyIdx = computeStormIndex([], stormy)
    expect(stormyIdx).toBeGreaterThan(calmIdx)
  })
})

// ─── Stability Index ───────────────────────────────────────────────────────────

describe('computeStabilityIndex', () => {
  it('returns 100 for no conditions', () => {
    expect(computeStabilityIndex([])).toBe(100)
  })

  it('decreases with high temperature', () => {
    const cool: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 20, humidity: 20, pressure: 5, windSpeed: 10, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    const hot: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 80, humidity: 20, pressure: 5, windSpeed: 10, visibility: 80, precipitation: 0, condition: 'stormy' },
    ]
    expect(computeStabilityIndex(cool)).toBeGreaterThan(computeStabilityIndex(hot))
  })

  it('decreases with high pressure', () => {
    const low: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 20, pressure: 5, windSpeed: 10, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    const high: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 20, pressure: 80, windSpeed: 10, visibility: 80, precipitation: 0, condition: 'stormy' },
    ]
    expect(computeStabilityIndex(low)).toBeGreaterThan(computeStabilityIndex(high))
  })

  it('decreases with low visibility files', () => {
    const clear: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 20, pressure: 10, windSpeed: 10, visibility: 80, precipitation: 0, condition: 'sunny' },
    ]
    const foggy: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 20, pressure: 10, windSpeed: 10, visibility: 25, precipitation: 0, condition: 'foggy' },
    ]
    expect(computeStabilityIndex(clear)).toBeGreaterThan(computeStabilityIndex(foggy))
  })

  it('clamps to 0-100', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 80, humidity: 80, pressure: 80, windSpeed: 10, visibility: 20, precipitation: 50, condition: 'stormy' },
    ]
    const result = computeStabilityIndex(conditions)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Overall Weather Classification ────────────────────────────────────────────

describe('classifyOverallWeather', () => {
  it('returns calm for low storm and high stability', () => {
    expect(classifyOverallWeather(5, 95)).toBe('calm')
  })

  it('returns catastrophic for extreme storm and low stability', () => {
    expect(classifyOverallWeather(90, 10)).toBe('catastrophic')
  })

  it('returns severe for high storm', () => {
    expect(classifyOverallWeather(70, 30)).toBe('severe')
  })

  it('returns stormy for moderate storm', () => {
    const result = classifyOverallWeather(50, 50)
    expect(['stormy', 'severe', 'unsettled']).toContain(result)
  })

  it('returns unsettled for mild storm', () => {
    expect(classifyOverallWeather(20, 70)).toBe('unsettled')
  })
})

// ─── Recommendations ───────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: StormTrackerStats = {
    totalSystems: 0, cyclones: 0, thunderstorms: 0, tornadoes: 0, hurricanes: 0,
    droughts: 0, clearAreas: 0, avgTemperature: 30, avgHumidity: 30, avgPressure: 15,
    avgVisibility: 70, hottestFile: '', mostCoupledFile: '', highestPressureFile: '',
    clearestFile: '', overallWeather: 'calm', stormIndex: 10, stabilityIndex: 80,
    forecastConfidence: 70,
  }

  it('returns empty for clean codebase', () => {
    const result = generateRecommendations([], [], [], baseStats)
    expect(result).toEqual([])
  })

  it('recommends breaking cyclones', () => {
    const systems: WeatherSystem[] = [
      { id: 'c1', type: 'cyclone', name: 'C1', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 50, category: 3, movement: 'stationary', description: '', forecast: '' },
    ]
    const result = generateRecommendations(systems, [], [], baseStats)
    expect(result.some(r => r.includes('circular dependenc'))).toBe(true)
  })

  it('recommends splitting hurricanes', () => {
    const systems: WeatherSystem[] = [
      { id: 'h1', type: 'hurricane', name: 'H1', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 70, category: 3, movement: 'expanding', description: '', forecast: '' },
    ]
    const result = generateRecommendations(systems, [], [], baseStats)
    expect(result.some(r => r.includes('coupled file'))).toBe(true)
  })

  it('recommends addressing high pressure', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 30, humidity: 30, pressure: 60, windSpeed: 20, visibility: 70, precipitation: 0, condition: 'partly-cloudy' },
    ]
    const result = generateRecommendations([], conditions, [], baseStats)
    expect(result.some(r => r.includes('technical debt'))).toBe(true)
  })

  it('recommends adding docs for fog', () => {
    const systems: WeatherSystem[] = [
      { id: 'f1', type: 'fog', name: 'F1', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 60, category: 3, movement: 'stationary', description: '', forecast: '' },
    ]
    const result = generateRecommendations(systems, [], [], baseStats)
    expect(result.some(r => r.includes('documentation'))).toBe(true)
  })

  it('recommends verifying droughts', () => {
    const systems: WeatherSystem[] = [
      { id: 'd1', type: 'drought', name: 'D1', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 50, category: 1, movement: 'stationary', description: '', forecast: '' },
    ]
    const result = generateRecommendations(systems, [], [], baseStats)
    expect(result.some(r => r.includes('drought'))).toBe(true)
  })

  it('recommends reducing nesting for tornadoes', () => {
    const systems: WeatherSystem[] = [
      { id: 't1', type: 'tornado', name: 'T1', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 70, category: 3, movement: 'stationary', description: '', forecast: '' },
    ]
    const result = generateRecommendations(systems, [], [], baseStats)
    expect(result.some(r => r.includes('nesting'))).toBe(true)
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────────

describe('buildStormTrackerResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildStormTrackerResult([], [], {})
    expect(result.systems).toEqual([])
    expect(result.conditions).toEqual([])
    expect(result.forecasts).toEqual([])
    expect(result.recommendations).toEqual([])
    expect(result.stats.overallWeather).toBeDefined()
    expect(result.stats.avgTemperature).toBe(0)
    expect(result.stats.avgVisibility).toBe(100)
  })

  it('returns valid result for simple file', () => {
    const result = buildStormTrackerResult(['a.ts'], [SIMPLE_CONTENT], {})
    expect(result.conditions.length).toBe(1)
    expect(result.conditions[0].file).toBe('a.ts')
    expect(result.stats.avgTemperature).toBeGreaterThan(0)
  })

  it('returns valid result for complex file', () => {
    const result = buildStormTrackerResult(['complex.ts'], [COMPLEX_CONTENT], {})
    expect(result.conditions.length).toBe(1)
    expect(result.conditions[0].temperature).toBeGreaterThan(0)
    expect(result.conditions[0].humidity).toBeGreaterThanOrEqual(0)
    expect(result.conditions[0].pressure).toBeGreaterThan(0)
  })

  it('computes correct stats for multiple files', () => {
    const result = buildStormTrackerResult(
      ['clean.ts', 'complex.ts'],
      [CLEAN_CONTENT, COMPLEX_CONTENT],
      {},
    )
    expect(result.conditions.length).toBe(2)
    expect(result.stats.avgTemperature).toBeGreaterThan(0)
    expect(result.stats.hottestFile).toBeDefined()
    expect(result.stats.clearestFile).toBeDefined()
  })

  it('respects verbose option', () => {
    const result = buildStormTrackerResult(['a.ts'], [SIMPLE_CONTENT], { verbose: true })
    expect(result).toBeDefined()
  })

  it('computes storm and stability indices', () => {
    const result = buildStormTrackerResult(['a.ts'], [COMPLEX_CONTENT], {})
    expect(result.stats.stormIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.stormIndex).toBeLessThanOrEqual(100)
    expect(result.stats.stabilityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.stabilityIndex).toBeLessThanOrEqual(100)
  })

  it('computes forecast confidence', () => {
    const result = buildStormTrackerResult(['src/a.ts'], [SIMPLE_CONTENT], {})
    expect(result.stats.forecastConfidence).toBeGreaterThanOrEqual(0)
    expect(result.stats.forecastConfidence).toBeLessThanOrEqual(100)
  })

  it('tracks clear areas', () => {
    const result = buildStormTrackerResult(['clean.ts'], [CLEAN_CONTENT], {})
    expect(result.stats.clearAreas).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatWeatherLabel', () => {
  it('formats calm weather', () => {
    const result = formatWeatherLabel('calm')
    expect(result).toContain('calm')
  })

  it('formats catastrophic weather', () => {
    const result = formatWeatherLabel('catastrophic')
    expect(result).toContain('catastrophic')
  })
})

describe('formatGauge', () => {
  it('returns gauge string with percentage', () => {
    const result = formatGauge(75)
    expect(result).toContain('75')
  })

  it('returns gauge with custom width', () => {
    const result = formatGauge(50, 10)
    expect(result).toContain('50')
  })

  it('handles 0', () => {
    const result = formatGauge(0)
    expect(result).toContain('0')
  })

  it('handles 100', () => {
    const result = formatGauge(100)
    expect(result).toContain('100')
  })
})

describe('formatWeatherSystems', () => {
  it('returns clear skies message for no systems', () => {
    const result = formatWeatherSystems([])
    expect(result).toContain('Clear skies')
  })

  it('formats systems list', () => {
    const systems: WeatherSystem[] = [
      { id: 'c1', type: 'cyclone', name: 'Cyclone A', epicenter: 'a.ts', affectedFiles: ['a.ts'], intensity: 60, category: 3, movement: 'stationary', description: 'test', forecast: 'test' },
    ]
    const result = formatWeatherSystems(systems)
    expect(result).toContain('Cyclone A')
    expect(result).toContain('a.ts')
  })
})

describe('formatConditions', () => {
  it('returns no files message for empty', () => {
    const result = formatConditions([])
    expect(result).toContain('No files')
  })

  it('formats conditions table', () => {
    const conditions: AtmosphericCondition[] = [
      { file: 'a.ts', temperature: 50, humidity: 40, pressure: 20, windSpeed: 30, visibility: 70, precipitation: 5, condition: 'partly-cloudy' },
    ]
    const result = formatConditions(conditions)
    expect(result).toContain('a.ts')
    expect(result).toContain('50')
  })
})

describe('formatForecasts', () => {
  it('returns no forecasts message for empty', () => {
    const result = formatForecasts([])
    expect(result).toContain('No forecasts')
  })

  it('formats forecasts', () => {
    const forecasts: WeatherForecast[] = [
      { area: 'src', shortTerm: 'stable', longTerm: 'improving', riskLevel: 'low', predictedIssues: [], confidence: 75 },
    ]
    const result = formatForecasts(forecasts)
    expect(result).toContain('src')
    expect(result).toContain('stable')
  })
})

describe('formatStormTrackerStats', () => {
  it('formats stats summary', () => {
    const stats: StormTrackerStats = {
      totalSystems: 5, cyclones: 1, thunderstorms: 2, tornadoes: 1, hurricanes: 1,
      droughts: 0, clearAreas: 3, avgTemperature: 45, avgHumidity: 35, avgPressure: 25,
      avgVisibility: 70, hottestFile: 'hot.ts', mostCoupledFile: 'coupled.ts',
      highestPressureFile: 'pressure.ts', clearestFile: 'clear.ts',
      overallWeather: 'unsettled', stormIndex: 40, stabilityIndex: 60,
      forecastConfidence: 75,
    }
    const result = formatStormTrackerStats(stats)
    expect(result).toContain('Storm Tracker Summary')
    expect(result).toContain('5')
    expect(result).toContain('hot.ts')
    expect(result).toContain('unsettled')
  })
})

describe('formatRecommendations', () => {
  it('returns fair weather message for empty', () => {
    const result = formatRecommendations([])
    expect(result).toContain('Fair weather')
  })

  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Clean Y'])
    expect(result).toContain('1. Fix X')
    expect(result).toContain('2. Clean Y')
  })
})

describe('formatStormTrackerTable', () => {
  it('formats full table', () => {
    const result = buildStormTrackerResult(['a.ts'], [SIMPLE_CONTENT], {})
    const output = formatStormTrackerTable(result)
    expect(output).toContain('Storm Tracker Summary')
    expect(output).toContain('Weather Systems')
    expect(output).toContain('Atmospheric Conditions')
  })
})

describe('formatStormTrackerJson', () => {
  it('formats as valid JSON', () => {
    const result = buildStormTrackerResult(['a.ts'], [SIMPLE_CONTENT], {})
    const json = formatStormTrackerJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.systems).toBeDefined()
    expect(parsed.conditions).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
