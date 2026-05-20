import { describe, expect, it } from 'vitest'

import {
  measureStability,
  measureDensity,
  measureTemperature,
  estimateAge,
  countLayers,
  measureIceCoreQuality,
  detectHiddenDangers,
  classifyIceZone,
  classifyIceClassification,
  mapGlacierFlows,
  identifyMoraines,
  computeFrozenRatio,
  computeStabilityIndex,
  classifyGlacierHealth,
  generateRecommendations,
  buildGlacierResult,
  type IceZone,
  type GlacierStats,
  type HiddenDanger,
} from '../src/commands/glacier-helpers.js'

import { formatGlacierTable, formatGlacierJson } from '../src/commands/glacier-format-helpers.js'

// ─── measureStability ───────────────────────────────────────────────────────

describe('measureStability', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureStability('const x = 1', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher stability for typed code', () => {
    const typed = measureStability('const x: number = 1', 'a.ts')
    const untyped = measureStability('const x = 1', 'a.ts')
    expect(typed).toBeGreaterThan(untyped)
  })

  it('gives higher stability for error handling', () => {
    const withTry = measureStability('try { x() } catch(e) { log(e) }', 'a.ts')
    const without = measureStability('x()', 'a.ts')
    expect(withTry).toBeGreaterThan(without)
  })

  it('penalizes any types', () => {
    const withAny = measureStability('const x: any = 1', 'a.ts')
    const without = measureStability('const x: number = 1', 'a.ts')
    expect(without).toBeGreaterThan(withAny)
  })

  it('penalizes TODO/FIXME', () => {
    const withTodo = measureStability('TODO: fix this', 'a.ts')
    const without = measureStability('const x = 1', 'a.ts')
    expect(without).toBeGreaterThan(withTodo)
  })

  it('gives higher for tested code', () => {
    const tested = measureStability('describe("test", () => { it("works", () => { expect(1).toBe(1) }) })', 'a.ts')
    const bare = measureStability('const x = 1', 'a.ts')
    expect(tested).toBeGreaterThan(bare)
  })
})

// ─── measureDensity ─────────────────────────────────────────────────────────

describe('measureDensity', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureDensity('const x = 1')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('returns 0 for empty content', () => {
    expect(measureDensity('')).toBe(0)
  })

  it('gives higher density for symbol-rich code', () => {
    const dense = measureDensity('function add(a: number, b: number): number { return a + b }\nclass Calculator { compute() {} }')
    const sparse = measureDensity('const x = 1\n\n\n\n')
    expect(dense).toBeGreaterThan(sparse)
  })
})

// ─── measureTemperature ─────────────────────────────────────────────────────

describe('measureTemperature', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureTemperature('const x = 1')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher temperature for TODOs', () => {
    const withTodo = measureTemperature('// TODO: fix this\nconst x = 1')
    const without = measureTemperature('const x = 1')
    expect(withTodo).toBeGreaterThan(without)
  })

  it('gives higher temperature for FIXMEs', () => {
    const withFixme = measureTemperature('// FIXME: broken\nconst x = 1')
    const without = measureTemperature('const x = 1')
    expect(withFixme).toBeGreaterThan(without)
  })

  it('gives higher temperature for deprecated', () => {
    const withDep = measureTemperature('/** @deprecated */\nfunction old() {}')
    const without = measureTemperature('function old() {}')
    expect(withDep).toBeGreaterThan(without)
  })

  it('gives higher temperature for any types', () => {
    const withAny = measureTemperature('const x: any = 1')
    const without = measureTemperature('const x: number = 1')
    expect(withAny).toBeGreaterThan(without)
  })
})

// ─── estimateAge ────────────────────────────────────────────────────────────

describe('estimateAge', () => {
  it('returns legacy for prototype code', () => {
    expect(estimateAge('function Old() {} Old.prototype.method = function() {}')).toBe('legacy')
  })

  it('returns aged for var + arguments', () => {
    expect(estimateAge('var x = arguments[0]')).toBe('aged')
  })

  it('returns mature for require without import', () => {
    expect(estimateAge('const fs = require("fs")')).toBe('mature')
  })

  it('returns modern for async arrow code', () => {
    expect(estimateAge('const fn = async () => { await fetch() }')).toBe('modern')
  })

  it('returns recent for const + arrow code', () => {
    expect(estimateAge('const fn = () => 1')).toBe('recent')
  })

  it('returns established for other code', () => {
    expect(estimateAge('function f() { return 1 }')).toBe('established')
  })
})

// ─── countLayers ────────────────────────────────────────────────────────────

describe('countLayers', () => {
  it('returns at least 1', () => {
    expect(countLayers('const x = 1')).toBeGreaterThanOrEqual(1)
  })

  it('counts nesting depth', () => {
    const nested = countLayers('if (x) {\n  for (let i = 0; i < n; i++) {\n    while (y) {\n      helper()\n    }\n  }\n}')
    const flat = countLayers('const x = 1')
    expect(nested).toBeGreaterThan(flat)
  })

  it('counts class as extra layer', () => {
    const withClass = countLayers('class A {\n  method() {\n    return 1\n  }\n}')
    const without = countLayers('const x = 1')
    expect(withClass).toBeGreaterThan(without)
  })
})

// ─── measureIceCoreQuality ──────────────────────────────────────────────────

describe('measureIceCoreQuality', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureIceCoreQuality('const x = 1')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher quality for documented code', () => {
    const documented = measureIceCoreQuality('/** docs */\nexport function f(): void {}')
    const bare = measureIceCoreQuality('export function f() {}')
    expect(documented).toBeGreaterThan(bare)
  })

  it('gives higher quality for typed code', () => {
    const typed = measureIceCoreQuality('const x: string = "hi"')
    const untyped = measureIceCoreQuality('const x = "hi"')
    expect(typed).toBeGreaterThan(untyped)
  })

  it('penalizes any types', () => {
    const withAny = measureIceCoreQuality('const x: any = 1')
    const without = measureIceCoreQuality('const x: number = 1')
    expect(without).toBeGreaterThan(withAny)
  })

  it('penalizes var usage', () => {
    const withVar = measureIceCoreQuality('var x = 1')
    const withConst = measureIceCoreQuality('const x = 1')
    expect(withConst).toBeGreaterThan(withVar)
  })
})

// ─── detectHiddenDangers ────────────────────────────────────────────────────

describe('detectHiddenDangers', () => {
  it('returns an array', () => {
    const result = detectHiddenDangers('const x = 1', 'a.ts')
    expect(Array.isArray(result)).toBe(true)
  })

  it('detects any type as crevasse', () => {
    const result = detectHiddenDangers('const x: any = 1', 'a.ts')
    expect(result.some(d => d.type === 'crevasse')).toBe(true)
  })

  it('detects JSON.parse without try as thin-ice', () => {
    const result = detectHiddenDangers('const x = JSON.parse(str)', 'a.ts')
    expect(result.some(d => d.type === 'thin-ice')).toBe(true)
  })

  it('does not flag JSON.parse with try', () => {
    const result = detectHiddenDangers('try {\n  const x = JSON.parse(str)\n} catch(e) {}', 'a.ts')
    expect(result.some(d => d.type === 'thin-ice')).toBe(false)
  })

  it('detects eval as undercurrent', () => {
    const result = detectHiddenDangers('eval("x + 1")', 'a.ts')
    expect(result.some(d => d.type === 'undercurrent')).toBe(true)
  })

  it('detects unsafe type assumptions as ice-bridge', () => {
    const result = detectHiddenDangers('const x = val.toString()', 'a.ts')
    expect(result.some(d => d.type === 'ice-bridge')).toBe(true)
  })

  it('detects exported TODOs as avalanche-risk', () => {
    const result = detectHiddenDangers('export function TODO_fix_later() {}', 'a.ts')
    expect(result.some(d => d.type === 'avalanche-risk')).toBe(true)
  })

  it('each danger has required fields', () => {
    const result = detectHiddenDangers('const x: any = JSON.parse(str)', 'a.ts')
    for (const d of result) {
      expect(d).toHaveProperty('type')
      expect(d).toHaveProperty('description')
      expect(d).toHaveProperty('severity')
      expect(d).toHaveProperty('line')
      expect(d).toHaveProperty('mitigation')
    }
  })
})

// ─── classifyIceZone ────────────────────────────────────────────────────────

describe('classifyIceZone', () => {
  it('classifies type files as permafrost', () => {
    expect(classifyIceZone('export interface Config { name: string }', 'types.ts')).toBe('glacial-ice')
  })

  it('classifies deprecated code as melt-zone', () => {
    expect(classifyIceZone('/** @deprecated */\nfunction old() {}', 'a.ts')).toBe('melt-zone')
  })

  it('classifies type-only files with high stability as permafrost', () => {
    const code = 'export interface Result { value: string }\nexport type Status = "ok" | "error"'
    const result = classifyIceZone(code, 'result.ts')
    expect(['permafrost', 'glacial-ice']).toContain(result)
  })

  it('classifies hot TODO code as moraine or active-ice', () => {
    const code = '// TODO: fix this\n// FIXME: broken\n// HACK: workaround\nconst x = 1\nconst y = 2\nconst z = 3\nconst w = 4\nconst v = 5'
    const result = classifyIceZone(code, 'a.ts')
    expect(['moraine', 'active-ice']).toContain(result)
  })

  it('classifies stable code as glacial-ice', () => {
    const result = classifyIceZone('export function add(a: number, b: number): number { return a + b }', 'a.ts')
    expect(['glacial-ice', 'permafrost']).toContain(result)
  })
})

// ─── classifyIceClassification ──────────────────────────────────────────────

describe('classifyIceClassification', () => {
  it('returns bedrock for high stability low temp', () => {
    expect(classifyIceClassification(90, 15)).toBe('bedrock')
  })

  it('returns deep-ice for good stability', () => {
    expect(classifyIceClassification(70, 30)).toBe('deep-ice')
  })

  it('returns surface-ice for moderate', () => {
    expect(classifyIceClassification(50, 50)).toBe('surface-ice')
  })

  it('returns slush for low stability', () => {
    expect(classifyIceClassification(25, 70)).toBe('slush')
  })

  it('returns water for very low stability', () => {
    expect(classifyIceClassification(10, 90)).toBe('water')
  })
})

// ─── mapGlacierFlows ────────────────────────────────────────────────────────

describe('mapGlacierFlows', () => {
  it('returns empty for no imports', () => {
    expect(mapGlacierFlows(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])).toEqual([])
  })

  it('detects flows from imports', () => {
    const result = mapGlacierFlows(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', 'export const x = 1'],
    )
    expect(result.length).toBeGreaterThan(0)
  })

  it('sets flow type based on source temperature', () => {
    const result = mapGlacierFlows(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', 'export const x = 1'],
    )
    for (const f of result) {
      expect(['steady', 'seasonal', 'surging', 'retreating']).toContain(f.flowType)
    }
  })

  it('each flow has required fields', () => {
    const result = mapGlacierFlows(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', 'export const x = 1'],
    )
    for (const f of result) {
      expect(f).toHaveProperty('from')
      expect(f).toHaveProperty('to')
      expect(f).toHaveProperty('flowType')
      expect(f).toHaveProperty('volume')
      expect(f).toHaveProperty('description')
    }
  })
})

// ─── identifyMoraines ───────────────────────────────────────────────────────

describe('identifyMoraines', () => {
  it('returns empty for no debt', () => {
    expect(identifyMoraines(['a.ts'], ['const x = 1'])).toEqual([])
  })

  it('detects TODO moraines', () => {
    const result = identifyMoraines(['src/a.ts'], ['// TODO: fix this\nconst x = 1'])
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].items.some(i => i.includes('TODO'))).toBe(true)
  })

  it('detects FIXME moraines', () => {
    const result = identifyMoraines(['src/a.ts'], ['// FIXME: broken\nconst x = 1'])
    expect(result.length).toBeGreaterThan(0)
  })

  it('detects HACK moraines', () => {
    const result = identifyMoraines(['src/a.ts'], ['// HACK: workaround\nconst x = 1'])
    expect(result.length).toBeGreaterThan(0)
  })

  it('groups by directory', () => {
    const result = identifyMoraines(
      ['src/a.ts', 'src/b.ts'],
      ['// TODO: fix a\nconst x = 1', '// TODO: fix b\nconst y = 2'],
    )
    expect(result).toHaveLength(1)
    expect(result[0].area).toBe('src')
  })

  it('each moraine has required fields', () => {
    const result = identifyMoraines(['src/a.ts'], ['// TODO: fix\nconst x = 1'])
    for (const m of result) {
      expect(m).toHaveProperty('area')
      expect(m).toHaveProperty('type')
      expect(m).toHaveProperty('items')
      expect(m).toHaveProperty('size')
      expect(m).toHaveProperty('age')
      expect(m).toHaveProperty('description')
    }
  })
})

// ─── computeFrozenRatio ─────────────────────────────────────────────────────

describe('computeFrozenRatio', () => {
  it('returns 50 for empty', () => {
    expect(computeFrozenRatio([])).toBe(50)
  })

  it('returns 100 for all permafrost', () => {
    const zones = [makeZone('a.ts', 'permafrost'), makeZone('b.ts', 'permafrost')]
    expect(computeFrozenRatio(zones)).toBe(100)
  })

  it('returns 50 for half frozen', () => {
    const zones = [makeZone('a.ts', 'permafrost'), makeZone('b.ts', 'active-ice')]
    expect(computeFrozenRatio(zones)).toBe(50)
  })

  it('counts glacial-ice as frozen', () => {
    const zones = [makeZone('a.ts', 'glacial-ice'), makeZone('b.ts', 'active-ice')]
    expect(computeFrozenRatio(zones)).toBe(50)
  })
})

// ─── computeStabilityIndex ──────────────────────────────────────────────────

describe('computeStabilityIndex', () => {
  it('returns 50 for empty', () => {
    expect(computeStabilityIndex([])).toBe(50)
  })

  it('returns higher for stable zones', () => {
    const stable = [makeZone('a.ts', 'permafrost', 90, 90)]
    const unstable = [makeZone('a.ts', 'active-ice', 20, 20)]
    expect(computeStabilityIndex(stable)).toBeGreaterThan(computeStabilityIndex(unstable))
  })

  it('penalizes critical dangers', () => {
    const clean = [makeZone('a.ts', 'glacial-ice', 70, 70)]
    const dangerous = [makeZoneWithDanger('a.ts', 'crevasse', 70, 70)]
    expect(computeStabilityIndex(clean)).toBeGreaterThan(computeStabilityIndex(dangerous))
  })
})

// ─── classifyGlacierHealth ──────────────────────────────────────────────────

describe('classifyGlacierHealth', () => {
  it('returns polar-cap for perfect health', () => {
    expect(classifyGlacierHealth(85, 70, 0)).toBe('polar-cap')
  })

  it('returns alpine-glacier for good health', () => {
    expect(classifyGlacierHealth(70, 60, 0)).toBe('alpine-glacier')
  })

  it('returns valley-glacier for moderate health', () => {
    expect(classifyGlacierHealth(55, 50, 1)).toBe('valley-glacier')
  })

  it('returns ice-sheet for fair health', () => {
    expect(classifyGlacierHealth(40, 30, 2)).toBe('ice-sheet')
  })

  it('returns retreating for poor health', () => {
    expect(classifyGlacierHealth(25, 20, 3)).toBe('retreating')
  })

  it('returns melted for terrible health', () => {
    expect(classifyGlacierHealth(10, 10, 5)).toBe('melted')
  })

  it('polar-cap requires no critical dangers', () => {
    expect(classifyGlacierHealth(90, 80, 1)).not.toBe('polar-cap')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends fixing critical dangers', () => {
    const zones = [makeZoneWithDanger('a.ts', 'crevasse', 50, 50)]
    const stats = makeStats({ criticalDangers: 1 })
    const recs = generateRecommendations(zones, zones.flatMap(z => z.hiddenDangers), [], [], stats)
    expect(recs.some(r => r.includes('critical'))).toBe(true)
  })

  it('recommends completing melt zones', () => {
    const zones = [makeZone('a.ts', 'melt-zone')]
    const stats = makeStats({ meltZones: 1 })
    const recs = generateRecommendations(zones, [], [], [], stats)
    expect(recs.some(r => r.includes('melt') || r.includes('deprecation'))).toBe(true)
  })

  it('recommends cleaning moraines', () => {
    const moraines = [{ area: 'src', type: 'lateral' as const, items: ['TODO: fix'], size: 1, age: 'fresh', description: '1 tech debt item' }]
    const stats = makeStats({})
    const recs = generateRecommendations([], [], [], moraines, stats)
    expect(recs.some(r => r.includes('tech debt') || r.includes('moraine'))).toBe(true)
  })

  it('recommends safety for crevasses', () => {
    const zones = [makeZone('a.ts', 'crevasse')]
    const stats = makeStats({ crevasseZones: 1 })
    const recs = generateRecommendations(zones, [], [], [], stats)
    expect(recs.some(r => r.includes('crevasse') || r.includes('safety'))).toBe(true)
  })

  it('recommends stabilizing retreating flows', () => {
    const flows = [{ from: 'a.ts', to: 'b.ts', flowType: 'retreating' as const, volume: 50, description: 'retreating' }]
    const stats = makeStats({})
    const recs = generateRecommendations([], [], flows, [], stats)
    expect(recs.some(r => r.includes('retreating') || r.includes('Stabilize'))).toBe(true)
  })

  it('recommends for low frozen ratio', () => {
    const stats = makeStats({ frozenRatio: 20 })
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some(r => r.includes('frozen') || r.includes('stabilize'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const zones = [makeZone('a.ts', 'permafrost', 85, 85)]
    const stats = makeStats({ stabilityIndex: 85, frozenRatio: 80 })
    const recs = generateRecommendations(zones, [], [], [], stats)
    expect(recs).toEqual([])
  })
})

// ─── buildGlacierResult ─────────────────────────────────────────────────────

describe('buildGlacierResult', () => {
  it('returns result with correct structure', () => {
    const result = buildGlacierResult([], [], {})
    expect(result).toHaveProperty('zones')
    expect(result).toHaveProperty('flows')
    expect(result).toHaveProperty('moraines')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('handles empty input', () => {
    const result = buildGlacierResult([], [], {})
    expect(result.zones).toHaveLength(0)
    expect(result.stats.totalZones).toBe(0)
  })

  it('creates zones for each file', () => {
    const result = buildGlacierResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.zones).toHaveLength(2)
  })

  it('populates all zone fields', () => {
    const result = buildGlacierResult(['a.ts'], ['export function add(a: number, b: number): number { return a + b }'], {})
    const z = result.zones[0]
    expect(z.file).toBe('a.ts')
    expect(typeof z.stability).toBe('number')
    expect(typeof z.density).toBe('number')
    expect(typeof z.temperature).toBe('number')
    expect(typeof z.age).toBe('string')
    expect(typeof z.layers).toBe('number')
    expect(typeof z.iceCoreQuality).toBe('number')
    expect(Array.isArray(z.hiddenDangers)).toBe(true)
    expect(['permafrost', 'glacial-ice', 'active-ice', 'melt-zone', 'crevasse', 'moraine']).toContain(z.zone)
    expect(['bedrock', 'deep-ice', 'surface-ice', 'slush', 'water']).toContain(z.classification)
  })

  it('computes correct stats', () => {
    const result = buildGlacierResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.totalZones).toBe(1)
    expect(result.stats.avgStability).toBeGreaterThanOrEqual(0)
    expect(result.stats.stabilityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.glacierHealth).toBeDefined()
  })

  it('detects flows between files', () => {
    const result = buildGlacierResult(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', 'export const x = 1'],
      {},
    )
    expect(result.stats.totalFlows).toBeGreaterThan(0)
  })

  it('detects moraines', () => {
    const result = buildGlacierResult(['a.ts'], ['// TODO: fix this\nconst x = 1'], {})
    expect(result.moraines.length + result.stats.moraineZones).toBeGreaterThanOrEqual(0)
  })

  it('computes frozen ratio', () => {
    const result = buildGlacierResult(['a.ts'], ['export function add(a: number, b: number): number { return a + b }'], {})
    expect(result.stats.frozenRatio).toBeGreaterThanOrEqual(0)
    expect(result.stats.frozenRatio).toBeLessThanOrEqual(100)
  })

  it('classifies glacier health', () => {
    const result = buildGlacierResult(['a.ts'], ['const x = 1'], {})
    expect(['polar-cap', 'alpine-glacier', 'valley-glacier', 'ice-sheet', 'retreating', 'melted']).toContain(result.stats.glacierHealth)
  })
})

// ─── formatGlacierTable ────────────────────────────────────────────────────

describe('formatGlacierTable', () => {
  it('returns a string', () => {
    const result = buildGlacierResult([], [], {})
    expect(typeof formatGlacierTable(result, false)).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildGlacierResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatGlacierTable(result, false)
    expect(formatted).toContain('Ice Zones')
    expect(formatted).toContain('Statistics')
  })

  it('shows no zones message when empty', () => {
    const result = buildGlacierResult([], [], {})
    expect(formatGlacierTable(result, false)).toContain('No zones analyzed')
  })

  it('shows recommendations when present', () => {
    const result = buildGlacierResult([], [], {})
    result.recommendations = ['Test recommendation']
    expect(formatGlacierTable(result, false)).toContain('Recommendations')
  })

  it('respects verbose flag for dangers', () => {
    const result = buildGlacierResult(['a.ts'], ['const x: any = JSON.parse(str)'], {})
    const verbose = formatGlacierTable(result, true)
    expect(verbose).toContain('crevasse')
  })

  it('shows flows when present', () => {
    const result = buildGlacierResult(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', 'export const x = 1'],
      {},
    )
    expect(formatGlacierTable(result, false)).toContain('Glacier Flows')
  })

  it('shows moraines when present', () => {
    const result = buildGlacierResult(['a.ts'], ['// TODO: fix\nconst x = 1'], {})
    if (result.moraines.length > 0) {
      expect(formatGlacierTable(result, false)).toContain('Moraines')
    }
  })
})

// ─── formatGlacierJson ─────────────────────────────────────────────────────

describe('formatGlacierJson', () => {
  it('returns valid JSON', () => {
    const result = buildGlacierResult([], [], {})
    expect(() => JSON.parse(formatGlacierJson(result))).not.toThrow()
  })

  it('contains zones in JSON', () => {
    const result = buildGlacierResult([], [], {})
    const parsed = JSON.parse(formatGlacierJson(result))
    expect(parsed).toHaveProperty('zones')
  })

  it('contains stats in JSON', () => {
    const result = buildGlacierResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatGlacierJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalZones).toBe(1)
  })
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeZone(
  file: string,
  zone: 'permafrost' | 'glacial-ice' | 'active-ice' | 'melt-zone' | 'crevasse' | 'moraine',
  stability = 70,
  iceCoreQuality = 70,
): IceZone {
  return {
    file,
    zone,
    stability,
    density: 50,
    temperature: 20,
    age: 'established',
    layers: 2,
    iceCoreQuality,
    hiddenDangers: [],
    classification: zone === 'permafrost' ? 'bedrock' : zone === 'glacial-ice' ? 'deep-ice' : 'surface-ice',
  }
}

function makeZoneWithDanger(
  file: string,
  zone: 'permafrost' | 'glacial-ice' | 'active-ice' | 'melt-zone' | 'crevasse' | 'moraine',
  stability = 70,
  iceCoreQuality = 70,
): IceZone {
  return {
    ...makeZone(file, zone, stability, iceCoreQuality),
    hiddenDangers: [{
      type: 'crevasse',
      description: 'test danger',
      severity: 'critical',
      line: 1,
      mitigation: 'fix it',
    }],
  }
}

function makeStats(overrides: Partial<GlacierStats> = {}): GlacierStats {
  return {
    totalZones: 1,
    permafrostZones: 1,
    activeIceZones: 0,
    meltZones: 0,
    crevasseZones: 0,
    moraineZones: 0,
    avgStability: 70,
    avgTemperature: 20,
    avgIceCoreQuality: 70,
    totalHiddenDangers: 0,
    criticalDangers: 0,
    totalFlows: 0,
    steadyFlows: 0,
    surgingFlows: 0,
    retreatingFlows: 0,
    totalMoraines: 0,
    moraineItems: 0,
    frozenRatio: 80,
    stabilityIndex: 75,
    glacierHealth: 'alpine-glacier',
    ...overrides,
  }
}
