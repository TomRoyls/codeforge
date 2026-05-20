import { describe, expect, it } from 'vitest'
import {
  extractExports,
  extractImports,
  extractCalls,
  extractEvents,
  extractTypeReferences,
  mapSignals,
  measureSignalClarity,
  measureSignalStrength,
  analyzeChannels,
  identifyDeadChannels,
  analyzeTower,
  computeSignalToNoiseRatio,
  computeChannelReliability,
  computeCommunicationEfficiency,
  classifyOverallClarity,
  computeStats,
  generateRecommendations,
  buildSemaphoreResult,
  type Signal,
  type Channel,
  type SignalTower,
  type DeadChannel,
} from '../src/commands/semaphore-helpers.js'

// ─── extractExports ──────────────────────────────────────

describe('extractExports', () => {
  it('extracts function exports', () => {
    const result = extractExports('export function hello() {}')
    expect(result).toContain('hello')
  })

  it('extracts const exports', () => {
    const result = extractExports('export const foo = 42')
    expect(result).toContain('foo')
  })

  it('extracts class exports', () => {
    const result = extractExports('export class MyClass {}')
    expect(result).toContain('MyClass')
  })

  it('extracts interface exports', () => {
    const result = extractExports('export interface Config {}')
    expect(result).toContain('Config')
  })

  it('extracts type exports', () => {
    const result = extractExports('export type Result = string | number')
    expect(result).toContain('Result')
  })

  it('extracts async function exports', () => {
    const result = extractExports('export async function fetchData() {}')
    expect(result).toContain('fetchData')
  })

  it('extracts re-exported symbols', () => {
    const result = extractExports('export { foo, bar }')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('deduplicates exports', () => {
    const result = extractExports('export function hello() {}\nexport function hello() {}')
    const count = result.filter((n) => n === 'hello').length
    expect(count).toBe(1)
  })

  it('returns empty for no exports', () => {
    expect(extractExports('const x = 1')).toEqual([])
  })
})

// ─── extractImports ──────────────────────────────────────

describe('extractImports', () => {
  it('extracts named imports', () => {
    const result = extractImports("import { foo, bar } from './utils'")
    expect(result).toHaveLength(1)
    expect(result[0].symbols).toContain('foo')
    expect(result[0].symbols).toContain('bar')
    expect(result[0].source).toBe('./utils')
  })

  it('extracts default imports', () => {
    const result = extractImports("import React from 'react'")
    expect(result).toHaveLength(1)
    expect(result[0].symbols).toContain('React')
    expect(result[0].source).toBe('react')
  })

  it('handles multiple import lines', () => {
    const code = "import { foo } from './a'\nimport { bar } from './b'"
    const result = extractImports(code)
    expect(result).toHaveLength(2)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── extractCalls ────────────────────────────────────────

describe('extractCalls', () => {
  it('extracts function calls', () => {
    const result = extractCalls('foo()')
    expect(result).toContain('foo')
  })

  it('extracts method calls', () => {
    const result = extractCalls('obj.method()')
    expect(result).toContain('method')
  })

  it('excludes keywords', () => {
    const result = extractCalls('if (true) {}')
    expect(result).not.toContain('if')
  })

  it('excludes console', () => {
    const result = extractCalls('console.log()')
    expect(result).not.toContain('console')
  })

  it('deduplicates calls', () => {
    const result = extractCalls('foo(); foo();')
    expect(result.filter((c) => c === 'foo')).toHaveLength(1)
  })
})

// ─── extractEvents ───────────────────────────────────────

describe('extractEvents', () => {
  it('extracts emitted events', () => {
    const result = extractEvents("emitter.emit('change')")
    expect(result.emitted).toContain('change')
  })

  it('extracts listened events', () => {
    const result = extractEvents("emitter.on('click', handler)")
    expect(result.listened).toContain('click')
  })

  it('extracts publish/subscribe patterns', () => {
    const result = extractEvents("bus.publish('update')\nbus.subscribe('update', fn)")
    expect(result.emitted).toContain('update')
    expect(result.listened).toContain('update')
  })

  it('extracts dispatch patterns', () => {
    const result = extractEvents("store.dispatch('FETCH')")
    expect(result.emitted).toContain('FETCH')
  })

  it('returns empty for no events', () => {
    const result = extractEvents('const x = 1')
    expect(result.emitted).toEqual([])
    expect(result.listened).toEqual([])
  })
})

// ─── extractTypeReferences ───────────────────────────────

describe('extractTypeReferences', () => {
  it('extracts type annotations', () => {
    const result = extractTypeReferences('const x: MyType = value')
    expect(result).toContain('MyType')
  })

  it('extracts generic parameters', () => {
    const result = extractTypeReferences('const x: Array<User> = []')
    expect(result).toContain('User')
  })

  it('extracts extends references', () => {
    const result = extractTypeReferences('class Foo extends Bar {}')
    expect(result).toContain('Bar')
  })

  it('excludes primitive types', () => {
    const result = extractTypeReferences('const x: string = ""')
    expect(result).not.toContain('string')
  })

  it('excludes common built-in types', () => {
    const result = extractTypeReferences('const x: number = 1')
    expect(result).not.toContain('number')
  })
})

// ─── mapSignals ──────────────────────────────────────────

describe('mapSignals', () => {
  it('maps export signals', () => {
    const signals = mapSignals('export function hello() {}', 'foo.ts', [])
    const exports = signals.filter((s) => s.type === 'export')
    expect(exports.length).toBeGreaterThan(0)
    expect(exports[0].payload).toContain('hello')
  })

  it('maps import signals', () => {
    const signals = mapSignals("import { foo } from './bar'", 'foo.ts', [])
    const imports = signals.filter((s) => s.type === 'import')
    expect(imports.length).toBeGreaterThan(0)
    expect(imports[0].payload).toContain('foo')
  })

  it('maps call signals', () => {
    const signals = mapSignals('doSomething()', 'foo.ts', [])
    const calls = signals.filter((s) => s.type === 'call')
    expect(calls.length).toBeGreaterThan(0)
  })

  it('maps event signals for emit', () => {
    const signals = mapSignals("emitter.emit('change')", 'foo.ts', [])
    const events = signals.filter((s) => s.type === 'event')
    expect(events.length).toBeGreaterThan(0)
  })

  it('maps shared-state signals', () => {
    const signals = mapSignals('globalThis.config = {}', 'foo.ts', [])
    const shared = signals.filter((s) => s.type === 'shared-state')
    expect(shared.length).toBeGreaterThan(0)
    expect(shared[0].isNoisy).toBe(true)
  })

  it('maps type-reference signals', () => {
    const signals = mapSignals('const x: MyType = {}', 'foo.ts', [])
    const refs = signals.filter((s) => s.type === 'type-reference')
    expect(refs.length).toBeGreaterThan(0)
  })

  it('maps callback signals', () => {
    const signals = mapSignals('function fetch(cb: Function) {}', 'foo.ts', [])
    const callbacks = signals.filter((s) => s.type === 'callback')
    expect(callbacks.length).toBeGreaterThan(0)
  })

  it('returns empty for empty content', () => {
    const signals = mapSignals('', 'foo.ts', [])
    expect(signals).toEqual([])
  })
})

// ─── measureSignalClarity ────────────────────────────────

describe('measureSignalClarity', () => {
  const baseSignal: Signal = {
    from: 'foo.ts',
    to: 'bar.ts',
    type: 'export',
    strength: 50,
    clarity: 50,
    channel: 'foo.ts->bar.ts',
    payload: ['getUserName'],
    isNoisy: false,
    isLossy: false,
    isBroken: false,
    description: 'test',
  }

  it('increases clarity for JSDoc', () => {
    const content = '/** docs */\nexport function getUserName() {}'
    const clarity = measureSignalClarity(baseSignal, content)
    expect(clarity).toBeGreaterThan(50)
  })

  it('increases clarity for type annotations', () => {
    const content = 'export function getUserName(): string {}'
    const clarity = measureSignalClarity(baseSignal, content)
    expect(clarity).toBeGreaterThan(50)
  })

  it('decreases clarity for noisy signals', () => {
    const noisy = { ...baseSignal, isNoisy: true, payload: ['x'] }
    const clarity = measureSignalClarity(noisy, 'content without docs or types')
    expect(clarity).toBeLessThan(50)
  })

  it('decreases clarity for shared-state type', () => {
    const shared = { ...baseSignal, type: 'shared-state' as const, payload: ['x'] }
    const clarity = measureSignalClarity(shared, 'content without docs or types')
    expect(clarity).toBeLessThan(50)
  })

  it('clamps to 0-100', () => {
    const clarity = measureSignalClarity(baseSignal, '')
    expect(clarity).toBeGreaterThanOrEqual(0)
    expect(clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureSignalStrength ───────────────────────────────

describe('measureSignalStrength', () => {
  const baseSignal: Signal = {
    from: 'foo.ts',
    to: 'bar.ts',
    type: 'export',
    strength: 50,
    clarity: 50,
    channel: 'foo.ts->bar.ts',
    payload: ['foo'],
    isNoisy: false,
    isLossy: false,
    isBroken: false,
    description: 'test',
  }

  it('increases strength for typed parameters', () => {
    const content = 'export function foo(x: number): string {}'
    const strength = measureSignalStrength(baseSignal, content)
    expect(strength).toBeGreaterThan(40)
  })

  it('increases strength for interface definitions', () => {
    const content = 'interface Config { key: string }'
    const strength = measureSignalStrength(baseSignal, content)
    expect(strength).toBeGreaterThan(40)
  })

  it('increases strength for return type annotations', () => {
    const content = 'function foo(): void {}'
    const strength = measureSignalStrength(baseSignal, content)
    expect(strength).toBeGreaterThan(40)
  })

  it('decreases strength for shared-state type', () => {
    const shared = { ...baseSignal, type: 'shared-state' as const }
    const strength = measureSignalStrength(shared, '')
    expect(strength).toBeLessThan(40)
  })

  it('clamps to 0-100', () => {
    const strength = measureSignalStrength(baseSignal, '')
    expect(strength).toBeGreaterThanOrEqual(0)
    expect(strength).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeChannels ─────────────────────────────────────

describe('analyzeChannels', () => {
  it('creates channels from signals', () => {
    const signals: Signal[] = [{
      from: 'a.ts',
      to: 'b.ts',
      type: 'import',
      strength: 50,
      clarity: 50,
      channel: 'a.ts->b.ts',
      payload: ['foo'],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }]
    const channels = analyzeChannels(signals, ['a.ts', 'b.ts'])
    expect(channels.length).toBeGreaterThan(0)
    expect(channels[0].type).toBe('direct')
  })

  it('classifies event-bus channels', () => {
    const signals: Signal[] = [{
      from: 'a.ts',
      to: 'event-bus',
      type: 'event',
      strength: 50,
      clarity: 50,
      channel: 'a.ts->event:change',
      payload: ['change'],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }]
    const channels = analyzeChannels(signals, ['a.ts'])
    expect(channels[0].type).toBe('event-bus')
  })

  it('classifies broadcast channels for wildcard targets', () => {
    const signals: Signal[] = [{
      from: 'a.ts',
      to: '*',
      type: 'export',
      strength: 50,
      clarity: 50,
      channel: 'a.ts->*',
      payload: ['foo'],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }]
    const channels = analyzeChannels(signals, ['a.ts'])
    expect(channels[0].type).toBe('broadcast')
  })

  it('returns empty for no signals', () => {
    expect(analyzeChannels([], [])).toEqual([])
  })
})

// ─── identifyDeadChannels ────────────────────────────────

describe('identifyDeadChannels', () => {
  it('identifies unused exports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'export function unused() {}',
      'const x = 1',
    ]
    const dead = identifyDeadChannels([], files, contents)
    const unusedExport = dead.find((d) => d.reason === 'unused-export')
    expect(unusedExport).toBeDefined()
    expect(unusedExport!.description).toContain('unused')
  })

  it('identifies deprecated APIs', () => {
    const files = ['a.ts']
    const contents = ['/** @deprecated */\nexport function oldApi() {}']
    const dead = identifyDeadChannels([], files, contents)
    const deprecated = dead.find((d) => d.reason === 'deprecated-api')
    expect(deprecated).toBeDefined()
  })

  it('identifies dead code paths from TODO markers', () => {
    const files = ['a.ts']
    const contents = ['// @todo remove this dead code\nfunction foo() {}']
    const dead = identifyDeadChannels([], files, contents)
    const deadPath = dead.find((d) => d.reason === 'dead-code-path')
    expect(deadPath).toBeDefined()
  })

  it('returns empty for clean code', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'export function used() {}',
      "import { used } from './a'",
    ]
    const dead = identifyDeadChannels([], files, contents)
    const unused = dead.filter((d) => d.reason === 'unused-export')
    expect(unused).toHaveLength(0)
  })
})

// ─── analyzeTower ────────────────────────────────────────

describe('analyzeTower', () => {
  it('analyzes outgoing signals', () => {
    const signals: Signal[] = [{
      from: 'a.ts',
      to: 'b.ts',
      type: 'import',
      strength: 50,
      clarity: 70,
      channel: 'a.ts->b.ts',
      payload: ['foo'],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }]
    const tower = analyzeTower('', 'a.ts', signals)
    expect(tower.outgoingSignals).toBe(1)
    expect(tower.incomingSignals).toBe(0)
  })

  it('analyzes incoming signals', () => {
    const signals: Signal[] = [{
      from: 'b.ts',
      to: 'a.ts',
      type: 'import',
      strength: 50,
      clarity: 70,
      channel: 'b.ts->a.ts',
      payload: ['foo'],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }]
    const tower = analyzeTower('', 'a.ts', signals)
    expect(tower.incomingSignals).toBe(1)
    expect(tower.outgoingSignals).toBe(0)
  })

  it('detects relay files', () => {
    const content = "export * from './utils'"
    const tower = analyzeTower(content, 'index.ts', [])
    expect(tower.isRelay).toBe(true)
  })

  it('detects broadcaster with many outgoing signals', () => {
    const signals: Signal[] = Array.from({ length: 6 }, (_, i) => ({
      from: 'hub.ts',
      to: `mod${i}.ts`,
      type: 'export' as const,
      strength: 50,
      clarity: 70,
      channel: `hub.ts->mod${i}.ts`,
      payload: [`export${i}`],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }))
    const tower = analyzeTower('', 'hub.ts', signals)
    expect(tower.isBroadcaster).toBe(true)
  })

  it('detects receiver with many incoming signals', () => {
    const signals: Signal[] = Array.from({ length: 6 }, (_, i) => ({
      from: `mod${i}.ts`,
      to: 'hub.ts',
      type: 'import' as const,
      strength: 50,
      clarity: 70,
      channel: `mod${i}.ts->hub.ts`,
      payload: [`import${i}`],
      isNoisy: false,
      isLossy: false,
      isBroken: false,
      description: 'test',
    }))
    const tower = analyzeTower('', 'hub.ts', signals)
    expect(tower.isReceiver).toBe(true)
  })

  it('computes noise level from noisy signals', () => {
    const signals: Signal[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 50, clarity: 50, channel: 'a->b', payload: [], isNoisy: true, isLossy: false, isBroken: false, description: '' },
      { from: 'c.ts', to: 'b.ts', type: 'import', strength: 50, clarity: 50, channel: 'c->b', payload: [], isNoisy: false, isLossy: false, isBroken: false, description: '' },
    ]
    const tower = analyzeTower('', 'b.ts', signals)
    expect(tower.noiseLevel).toBe(50)
  })
})

// ─── computeSignalToNoiseRatio ───────────────────────────

describe('computeSignalToNoiseRatio', () => {
  it('returns 100 for no signals', () => {
    expect(computeSignalToNoiseRatio([])).toBe(100)
  })

  it('returns 100 for all clean signals', () => {
    const signals = [
      { isNoisy: false } as Signal,
      { isNoisy: false } as Signal,
    ]
    expect(computeSignalToNoiseRatio(signals)).toBe(100)
  })

  it('returns 50 for half noisy signals', () => {
    const signals = [
      { isNoisy: true } as Signal,
      { isNoisy: false } as Signal,
    ]
    expect(computeSignalToNoiseRatio(signals)).toBe(50)
  })

  it('returns 0 for all noisy signals', () => {
    const signals = [
      { isNoisy: true } as Signal,
      { isNoisy: true } as Signal,
    ]
    expect(computeSignalToNoiseRatio(signals)).toBe(0)
  })
})

// ─── computeChannelReliability ───────────────────────────

describe('computeChannelReliability', () => {
  it('returns 100 for no channels', () => {
    expect(computeChannelReliability([])).toBe(100)
  })

  it('averages reliability across channels', () => {
    const channels: Channel[] = [
      { path: 'a', type: 'direct', quality: 'clear', bandwidth: 1, latency: 0, reliability: 80, signals: [] },
      { path: 'b', type: 'direct', quality: 'clear', bandwidth: 1, latency: 0, reliability: 60, signals: [] },
    ]
    expect(computeChannelReliability(channels)).toBe(70)
  })
})

// ─── computeCommunicationEfficiency ──────────────────────

describe('computeCommunicationEfficiency', () => {
  it('returns 100 for no signals', () => {
    expect(computeCommunicationEfficiency([], [])).toBe(100)
  })

  it('factors in clarity, strength, and reliability', () => {
    const signals: Signal[] = [{
      from: 'a', to: 'b', type: 'export', strength: 80, clarity: 80, channel: 'a->b', payload: [], isNoisy: false, isLossy: false, isBroken: false, description: '',
    }]
    const channels: Channel[] = [{
      path: 'a->b', type: 'direct', quality: 'clear', bandwidth: 1, latency: 0, reliability: 80, signals: [],
    }]
    const efficiency = computeCommunicationEfficiency(signals, channels)
    expect(efficiency).toBeGreaterThan(0)
    expect(efficiency).toBeLessThanOrEqual(100)
  })
})

// ─── classifyOverallClarity ──────────────────────────────

describe('classifyOverallClarity', () => {
  it('returns crystal-clear for high scores', () => {
    expect(classifyOverallClarity(90, 90, 90)).toBe('crystal-clear')
  })

  it('returns clear for good scores', () => {
    expect(classifyOverallClarity(70, 70, 70)).toBe('clear')
  })

  it('returns static for medium scores', () => {
    expect(classifyOverallClarity(50, 50, 50)).toBe('static')
  })

  it('returns noisy for low scores', () => {
    expect(classifyOverallClarity(30, 30, 30)).toBe('noisy')
  })

  it('returns broken for very low scores', () => {
    expect(classifyOverallClarity(10, 10, 10)).toBe('broken')
  })
})

// ─── computeStats ────────────────────────────────────────

describe('computeStats', () => {
  it('computes stats for empty inputs', () => {
    const stats = computeStats([], [], [], [])
    expect(stats.totalSignals).toBe(0)
    expect(stats.totalChannels).toBe(0)
    expect(stats.totalTowers).toBe(0)
    expect(stats.totalDeadChannels).toBe(0)
  })

  it('counts signal categories', () => {
    const signals: Signal[] = [
      { from: 'a', to: 'b', type: 'export', strength: 50, clarity: 80, channel: 'a->b', payload: [], isNoisy: false, isLossy: false, isBroken: false, description: '' },
      { from: 'a', to: 'b', type: 'import', strength: 50, clarity: 30, channel: 'a->b', payload: [], isNoisy: true, isLossy: true, isBroken: true, description: '' },
    ]
    const stats = computeStats(signals, [], [], [])
    expect(stats.clearSignals).toBe(1)
    expect(stats.noisySignals).toBe(1)
    expect(stats.lossySignals).toBe(1)
    expect(stats.brokenSignals).toBe(1)
  })

  it('counts tower types', () => {
    const towers: SignalTower[] = [
      { file: 'a.ts', outgoingSignals: 6, incomingSignals: 0, clarity: 50, isRelay: false, isBroadcaster: true, isReceiver: false, noiseLevel: 0 },
      { file: 'b.ts', outgoingSignals: 0, incomingSignals: 6, clarity: 50, isRelay: false, isBroadcaster: false, isReceiver: true, noiseLevel: 0 },
      { file: 'c.ts', outgoingSignals: 0, incomingSignals: 0, clarity: 50, isRelay: true, isBroadcaster: false, isReceiver: false, noiseLevel: 0 },
    ]
    const stats = computeStats([], [], towers, [])
    expect(stats.broadcasters).toBe(1)
    expect(stats.receivers).toBe(1)
    expect(stats.relays).toBe(1)
  })

  it('counts dead channels', () => {
    const dead: DeadChannel[] = [
      { from: 'a', to: 'b', type: 'export', reason: 'unused-export', description: 'unused' },
    ]
    const stats = computeStats([], [], [], dead)
    expect(stats.totalDeadChannels).toBe(1)
  })

  it('computes averages', () => {
    const signals: Signal[] = [
      { from: 'a', to: 'b', type: 'export', strength: 60, clarity: 80, channel: 'a->b', payload: [], isNoisy: false, isLossy: false, isBroken: false, description: '' },
      { from: 'a', to: 'b', type: 'import', strength: 40, clarity: 60, channel: 'a->b', payload: [], isNoisy: false, isLossy: false, isBroken: false, description: '' },
    ]
    const stats = computeStats(signals, [], [], [])
    expect(stats.avgClarity).toBe(70)
    expect(stats.avgStrength).toBe(50)
  })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('recommends fixing broken signals', () => {
    const stats = computeStats([], [], [], [])
    stats.brokenSignals = 3
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('broken signal'))).toBe(true)
  })

  it('recommends reducing noisy signals', () => {
    const stats = computeStats([], [], [], [])
    stats.noisySignals = 2
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('noisy signal'))).toBe(true)
  })

  it('recommends removing unused exports', () => {
    const dead: DeadChannel[] = [
      { from: 'a', to: '(none)', type: 'export', reason: 'unused-export', description: 'unused' },
    ]
    const stats = computeStats([], [], [], dead)
    const recs = generateRecommendations([], [], [], dead, stats)
    expect(recs.some((r) => r.includes('unused export'))).toBe(true)
  })

  it('recommends for broken overall clarity', () => {
    const stats = computeStats([], [], [], [])
    stats.overallClarity = 'broken'
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('Critical'))).toBe(true)
  })

  it('recommends for noisy overall clarity', () => {
    const stats = computeStats([], [], [], [])
    stats.overallClarity = 'noisy'
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('attention'))).toBe(true)
  })

  it('recommends for degraded channels', () => {
    const stats = computeStats([], [], [], [])
    stats.degradedChannels = 3
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('degraded channel'))).toBe(true)
  })

  it('recommends for high-noise towers', () => {
    const towers: SignalTower[] = [
      { file: 'noisy.ts', outgoingSignals: 0, incomingSignals: 0, clarity: 50, isRelay: false, isBroadcaster: false, isReceiver: false, noiseLevel: 80 },
    ]
    const stats = computeStats([], [], towers, [])
    const recs = generateRecommendations([], [], towers, [], stats)
    expect(recs.some((r) => r.includes('high-noise tower'))).toBe(true)
  })

  it('returns empty for clean state', () => {
    const stats = computeStats([], [], [], [])
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs).toEqual([])
  })
})

// ─── buildSemaphoreResult ────────────────────────────────

describe('buildSemaphoreResult', () => {
  it('returns full result with all fields', () => {
    const result = buildSemaphoreResult(
      ['foo.ts'],
      ['export function hello() {}'],
      {},
    )
    expect(result.signals).toBeDefined()
    expect(result.channels).toBeDefined()
    expect(result.towers).toBeDefined()
    expect(result.deadChannels).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty input', () => {
    const result = buildSemaphoreResult([], [], {})
    expect(result.stats.totalSignals).toBe(0)
    expect(result.stats.overallClarity).toBe('crystal-clear')
  })

  it('detects signals in real code', () => {
    const code = `import { foo } from './bar'
export function baz() {
  foo()
  emitter.emit('ready')
}`
    const result = buildSemaphoreResult(['a.ts'], [code], {})
    expect(result.stats.totalSignals).toBeGreaterThan(0)
  })

  it('detects dead channels for unused exports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'export function unused() {}',
      'const x = 1',
    ]
    const result = buildSemaphoreResult(files, contents, {})
    const unusedExports = result.deadChannels.filter((d) => d.reason === 'unused-export')
    expect(unusedExports.length).toBeGreaterThan(0)
  })

  it('computes communication efficiency', () => {
    const result = buildSemaphoreResult(
      ['a.ts'],
      ['export function foo(x: number): string { return String(x) }'],
      {},
    )
    expect(result.stats.communicationEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.stats.communicationEfficiency).toBeLessThanOrEqual(100)
  })

  it('computes signal to noise ratio', () => {
    const result = buildSemaphoreResult(
      ['a.ts'],
      ['export function foo() {}'],
      {},
    )
    expect(result.stats.signalToNoiseRatio).toBeGreaterThanOrEqual(0)
    expect(result.stats.signalToNoiseRatio).toBeLessThanOrEqual(100)
  })
})
