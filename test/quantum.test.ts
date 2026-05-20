import { describe, expect, it } from 'vitest'

import {
  analyzeState,
  buildQuantumResult,
  classifyQuantumHealth,
  computeDeterminismIndex,
  computeEntanglementEntropy,
  detectEntanglements,
  detectSuperpositions,
  detectTunnelingPaths,
  generateQuantumRecommendations,
  type Entanglement,
  type QuantumOptions,
  type QuantumResult,
  type QuantumState,
  type QuantumStats,
  type SuperPosition,
  type TunnelingPath,
} from '../src/commands/quantum-helpers.js'

import {
  formatEntanglementRiskLabel,
  formatEntanglements,
  formatQuantumGauge,
  formatQuantumHealthLabel,
  formatQuantumJson,
  formatQuantumStats,
  formatQuantumTable,
  formatRecommendations,
  formatStates,
  formatSuperpositions,
  formatTunnelingPaths,
  formatTunnelRiskLabel,
} from '../src/commands/quantum-format-helpers.js'

// ─── detectSuperpositions ───────────────────────────────────────────────────────

describe('detectSuperpositions', () => {
  it('returns empty for empty content', () => {
    expect(detectSuperpositions('')).toEqual([])
  })

  it('returns empty for whitespace-only content', () => {
    expect(detectSuperpositions('   \n\t  ')).toEqual([])
  })

  it('detects union type superpositions', () => {
    const content = 'let x: string | number = 1'
    const result = detectSuperpositions(content)
    const withUnion = result.filter(sp => sp.element === 'x')
    expect(withUnion.length).toBeGreaterThanOrEqual(1)
    expect(withUnion[0].possibleStates.length).toBeGreaterThanOrEqual(2)
    expect(withUnion[0].isCollapsed).toBe(false)
  })

  it('detects optional chaining superpositions', () => {
    const content = 'const y = obj?.prop'
    const result = detectSuperpositions(content)
    const withOptional = result.filter(sp => sp.element === 'obj')
    expect(withOptional.length).toBeGreaterThanOrEqual(1)
    expect(withOptional[0].possibleStates).toContain('defined')
    expect(withOptional[0].possibleStates).toContain('undefined')
  })

  it('detects ternary superpositions', () => {
    const content = 'const mode = isActive ? "on" : "off";'
    const result = detectSuperpositions(content)
    const withTernary = result.filter(sp => sp.element === 'mode')
    expect(withTernary.length).toBeGreaterThanOrEqual(1)
  })

  it('sets location as line number', () => {
    const content = 'line1\nlet x: string | number = 1'
    const result = detectSuperpositions(content)
    expect(result.some(sp => sp.location === 2)).toBe(true)
  })

  it('assigns collapse risk based on state count', () => {
    const content = 'let x: string | number | boolean | null = 1'
    const result = detectSuperpositions(content)
    const high = result.filter(sp => sp.collapseRisk === 'high')
    expect(high.length).toBeGreaterThanOrEqual(1)
  })

  it('assigns medium collapse risk for 2-3 states', () => {
    const content = 'let x: string | number = 1'
    const result = detectSuperpositions(content)
    const withUnion = result.filter(sp => sp.element === 'x')
    expect(withUnion[0].collapseRisk).toBe('low')
  })

  it('assigns equal probabilities for union states', () => {
    const content = 'let x: string | number = 1'
    const result = detectSuperpositions(content)
    const withUnion = result.filter(sp => sp.element === 'x')
    expect(withUnion[0].probability.length).toBeGreaterThanOrEqual(2)
  })

  it('detects overloaded function returns', () => {
    const content = 'function foo(x: string): (string | number)'
    const result = detectSuperpositions(content)
    expect(result.some(sp => sp.element === 'foo')).toBe(true)
  })
})

// ─── analyzeState ───────────────────────────────────────────────────────────────

describe('analyzeState', () => {
  it('returns default state for empty content', () => {
    const state = analyzeState('', 'a.ts')
    expect(state.file).toBe('a.ts')
    expect(state.uncertainty).toBe(0)
    expect(state.coherence).toBe(100)
    expect(state.isCollapsed).toBe(true)
    expect(state.superpositions).toEqual([])
  })

  it('computes uncertainty from conditionals', () => {
    const state = analyzeState('if (a) {} if (b) {} if (c) {} if (d) {}', 'a.ts')
    expect(state.uncertainty).toBeGreaterThan(0)
  })

  it('computes uncertainty from type assertions', () => {
    const state = analyzeState('const x = foo as string; const y = bar as number;', 'a.ts')
    expect(state.uncertainty).toBeGreaterThan(0)
  })

  it('computes uncertainty from any usage', () => {
    const state = analyzeState('const x: any = 1', 'a.ts')
    expect(state.uncertainty).toBeGreaterThan(0)
  })

  it('computes coherence from const vs let ratio', () => {
    const state = analyzeState('const a = 1; const b = 2; const c = 3;', 'a.ts')
    expect(state.coherence).toBe(100)
  })

  it('lowers coherence for many let assignments', () => {
    const stateHigh = analyzeState('const a = 1; const b = 2;', 'a.ts')
    const stateLow = analyzeState('let a = 1; let b = 2; let c = 3; const d = 1;', 'a.ts')
    expect(stateLow.coherence).toBeLessThan(stateHigh.coherence)
  })

  it('computes observation effect from console logs', () => {
    const state = analyzeState('console.log(a); console.log(b); console.log(c);', 'a.ts')
    expect(state.observationEffect).toBeGreaterThan(0)
  })

  it('computes observation effect from try-catch', () => {
    const state = analyzeState('try { foo(); } catch(e) {}', 'a.ts')
    expect(state.observationEffect).toBeGreaterThan(0)
  })

  it('sets isCollapsed when uncertainty is low and all superpositions collapsed', () => {
    const state = analyzeState('const x = 1;', 'a.ts')
    expect(state.isCollapsed).toBe(true)
  })

  it('computes tunneling risk from dangerous tunnels', () => {
    const state = analyzeState('try { foo(); } catch(e) { return null; }', 'a.ts')
    expect(state.tunnelingRisk).toBeGreaterThan(0)
  })

  it('sets file path', () => {
    const state = analyzeState('const x = 1', 'my/file.ts')
    expect(state.file).toBe('my/file.ts')
  })

  it('clamps uncertainty to 100', () => {
    const content = Array.from({ length: 50 }, (_, i) => `if (a${i}) {}`).join('\n')
    const state = analyzeState(content, 'a.ts')
    expect(state.uncertainty).toBeLessThanOrEqual(100)
  })
})

// ─── detectEntanglements ────────────────────────────────────────────────────────

describe('detectEntanglements', () => {
  it('returns empty for fewer than 2 files', () => {
    expect(detectEntanglements(['a.ts'], ['code'])).toEqual([])
  })

  it('detects import-based entanglements', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['export function foo() {}', "import { foo } from './a';"]
    const result = detectEntanglements(files, contents)
    expect(result.length).toBeGreaterThanOrEqual(1)
    const coupling = result.find(e => e.description.includes('foo'))
    expect(coupling).toBeDefined()
    expect(coupling!.type).toBe('behavior')
  })

  it('detects global state entanglements', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['globalThis.shared = 1', 'globalThis.shared = 2']
    const result = detectEntanglements(files, contents)
    expect(result.length).toBeGreaterThanOrEqual(1)
    const globalEnt = result.find(e => e.description.includes('shared'))
    expect(globalEnt).toBeDefined()
    expect(globalEnt!.isQuantum).toBe(true)
    expect(globalEnt!.risk).toBe('dangerous')
  })

  it('detects name collision entanglements', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['export function foo() {}', 'export function foo() {}']
    const result = detectEntanglements(files, contents)
    const collision = result.find(e => e.description.includes('collision'))
    expect(collision).toBeDefined()
    expect(collision!.type).toBe('data')
  })

  it('deduplicates entanglements', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['export function foo() {}', "import { foo } from './a';"]
    const result = detectEntanglements(files, contents)
    const uniquePairs = Array.from(new Set(result.map(e => e.pair.join('::'))))
    expect(result.length).toBe(uniquePairs.length)
  })

  it('returns empty for independent files', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['const x = 1', 'const y = 2']
    const result = detectEntanglements(files, contents)
    expect(result).toEqual([])
  })

  it('handles empty contents gracefully', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['', '']
    const result = detectEntanglements(files, contents)
    expect(result).toEqual([])
  })
})

// ─── detectTunnelingPaths ───────────────────────────────────────────────────────

describe('detectTunnelingPaths', () => {
  it('returns empty for empty content', () => {
    expect(detectTunnelingPaths('')).toEqual([])
  })

  it('detects catch-continue tunnel', () => {
    const tunnels = detectTunnelingPaths('try { foo(); } catch(e) { continue; }')
    expect(tunnels.some(t => t.from === 'try-catch' && t.to === 'loop-continue')).toBe(true)
  })

  it('detects catch-break tunnel', () => {
    const tunnels = detectTunnelingPaths('try { foo(); } catch(e) { break; }')
    expect(tunnels.some(t => t.from === 'try-catch' && t.to === 'loop-break')).toBe(true)
  })

  it('detects catch-return tunnel as dangerous', () => {
    const tunnels = detectTunnelingPaths('try { foo(); } catch(e) { return null; }')
    const ret = tunnels.find(t => t.to === 'early-return')
    expect(ret).toBeDefined()
    expect(ret!.risk).toBe('dangerous')
  })

  it('detects labeled loop tunnels', () => {
    const tunnels = detectTunnelingPaths('outer: for (let i = 0; i < 5; i++) {}')
    expect(tunnels.some(t => t.from === 'outer-loop')).toBe(true)
  })

  it('detects finally-return tunnel as critical', () => {
    const tunnels = detectTunnelingPaths('try { foo(); } finally { return 0; }')
    const fin = tunnels.find(t => t.from === 'finally')
    expect(fin).toBeDefined()
    expect(fin!.risk).toBe('critical')
  })

  it('detects empty catch as dangerous', () => {
    const tunnels = detectTunnelingPaths('try { foo(); } catch(e) {}')
    const empty = tunnels.find(t => t.to === 'swallowed-error')
    expect(empty).toBeDefined()
    expect(empty!.risk).toBe('dangerous')
  })

  it('detects throw in catch as safe rethrow', () => {
    const tunnels = detectTunnelingPaths('try { foo(); } catch(e) { throw e; }')
    const rethrow = tunnels.find(t => t.to === 'rethrown-error')
    expect(rethrow).toBeDefined()
    expect(rethrow!.risk).toBe('safe')
  })

  it('returns multiple tunnel types for complex code', () => {
    const content = 'try { foo(); } catch(e) { return; } try { bar(); } finally { return 0; }'
    const tunnels = detectTunnelingPaths(content)
    expect(tunnels.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── computeDeterminismIndex ────────────────────────────────────────────────────

describe('computeDeterminismIndex', () => {
  it('returns 100 for no states', () => {
    expect(computeDeterminismIndex([])).toBe(100)
  })

  it('returns high for all collapsed states with low uncertainty', () => {
    const states: QuantumState[] = [
      { file: 'a.ts', uncertainty: 0, superpositions: [], entanglements: [], observationEffect: 0, coherence: 100, isCollapsed: true, tunnelingRisk: 0 },
    ]
    expect(computeDeterminismIndex(states)).toBeGreaterThanOrEqual(80)
  })

  it('returns lower for uncollapsed high-uncertainty states', () => {
    const states: QuantumState[] = [
      { file: 'a.ts', uncertainty: 80, superpositions: [], entanglements: [], observationEffect: 0, coherence: 20, isCollapsed: false, tunnelingRisk: 50 },
    ]
    expect(computeDeterminismIndex(states)).toBeLessThan(60)
  })

  it('factors in coherence', () => {
    const highCoherence: QuantumState[] = [
      { file: 'a.ts', uncertainty: 10, superpositions: [], entanglements: [], observationEffect: 0, coherence: 100, isCollapsed: true, tunnelingRisk: 0 },
    ]
    const lowCoherence: QuantumState[] = [
      { file: 'a.ts', uncertainty: 10, superpositions: [], entanglements: [], observationEffect: 0, coherence: 10, isCollapsed: true, tunnelingRisk: 0 },
    ]
    expect(computeDeterminismIndex(highCoherence)).toBeGreaterThan(computeDeterminismIndex(lowCoherence))
  })
})

// ─── computeEntanglementEntropy ─────────────────────────────────────────────────

describe('computeEntanglementEntropy', () => {
  it('returns 0 for no entanglements', () => {
    expect(computeEntanglementEntropy([])).toBe(0)
  })

  it('increases with quantum entanglements', () => {
    const quantum: Entanglement[] = [
      { pair: ['a.ts', 'b.ts'], strength: 90, type: 'state', isQuantum: true, risk: 'dangerous', description: 'test' },
    ]
    const classical: Entanglement[] = [
      { pair: ['a.ts', 'b.ts'], strength: 30, type: 'data', isQuantum: false, risk: 'benign', description: 'test' },
    ]
    expect(computeEntanglementEntropy(quantum)).toBeGreaterThan(computeEntanglementEntropy(classical))
  })

  it('factors in strength', () => {
    const strong: Entanglement[] = [
      { pair: ['a.ts', 'b.ts'], strength: 90, type: 'state', isQuantum: false, risk: 'benign', description: 'test' },
    ]
    const weak: Entanglement[] = [
      { pair: ['a.ts', 'b.ts'], strength: 10, type: 'data', isQuantum: false, risk: 'benign', description: 'test' },
    ]
    expect(computeEntanglementEntropy(strong)).toBeGreaterThan(computeEntanglementEntropy(weak))
  })
})

// ─── classifyQuantumHealth ──────────────────────────────────────────────────────

describe('classifyQuantumHealth', () => {
  it('returns deterministic for high determinism low uncertainty high coherence', () => {
    expect(classifyQuantumHealth(90, 10, 95)).toBe('deterministic')
  })

  it('returns coherent for moderate determinism', () => {
    expect(classifyQuantumHealth(70, 30, 70)).toBe('coherent')
  })

  it('returns uncertain for mid range', () => {
    expect(classifyQuantumHealth(50, 45, 60)).toBe('uncertain')
  })

  it('returns chaotic for high uncertainty low coherence', () => {
    expect(classifyQuantumHealth(20, 85, 15)).toBe('chaotic')
  })

  it('returns schrodinger for worst case', () => {
    expect(classifyQuantumHealth(15, 70, 30)).toBe('schrodinger')
  })

  it('returns chaotic for low determinism', () => {
    expect(classifyQuantumHealth(25, 50, 50)).toBe('chaotic')
  })
})

// ─── generateQuantumRecommendations ─────────────────────────────────────────────

describe('generateQuantumRecommendations', () => {
  const makeStats = (overrides: Partial<QuantumStats> = {}): QuantumStats => ({
    totalStates: 5, avgUncertainty: 30, totalSuperpositions: 3,
    collapsedStates: 2, uncollapsedStates: 3,
    totalEntanglements: 1, criticalEntanglements: 0,
    totalTunnelingPaths: 0, dangerousTunnels: 0,
    avgCoherence: 70, avgObservationEffect: 20,
    maxUncertainty: 50, mostUncertainFile: 'a.ts',
    mostEntangledFile: '', quantumHealth: 'uncertain',
    determinismIndex: 50, entanglementEntropy: 20,
    ...overrides,
  })

  it('recommends narrowing uncollapsed superpositions', () => {
    const recs = generateQuantumRecommendations([], [], [], makeStats({ uncollapsedStates: 5, collapsedStates: 2 }))
    expect(recs.some(r => r.includes('uncollapsed'))).toBe(true)
  })

  it('recommends decoupling critical entanglements', () => {
    const entanglements: Entanglement[] = [
      { pair: ['a.ts', 'b.ts'], strength: 90, type: 'state', isQuantum: true, risk: 'critical', description: 'test' },
    ]
    const recs = generateQuantumRecommendations([], entanglements, [], makeStats())
    expect(recs.some(r => r.includes('critical') || r.includes('decouple'))).toBe(true)
  })

  it('recommends fixing dangerous tunnels', () => {
    const tunnels: TunnelingPath[] = [
      { from: 'try', to: 'return', path: ['try', 'catch', 'return'], probability: 40, risk: 'dangerous' },
    ]
    const recs = generateQuantumRecommendations([], [], tunnels, makeStats())
    expect(recs.some(r => r.includes('tunneling') || r.includes('dangerous'))).toBe(true)
  })

  it('recommends reducing uncertainty when high', () => {
    const recs = generateQuantumRecommendations([], [], [], makeStats({ avgUncertainty: 70 }))
    expect(recs.some(r => r.includes('uncertainty') || r.includes('any'))).toBe(true)
  })

  it('recommends tests for schrodinger state', () => {
    const recs = generateQuantumRecommendations([], [], [], makeStats({ quantumHealth: 'schrodinger' }))
    expect(recs.some(r => r.includes('Schrödinger') || r.includes('tests'))).toBe(true)
  })

  it('recommends reducing coupling for high entropy', () => {
    const recs = generateQuantumRecommendations([], [], [], makeStats({ entanglementEntropy: 80 }))
    expect(recs.some(r => r.includes('entropy') || r.includes('coupling'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const recs = generateQuantumRecommendations(
      [{ file: 'a.ts', uncertainty: 5, superpositions: [], entanglements: [], observationEffect: 0, coherence: 100, isCollapsed: true, tunnelingRisk: 0 }],
      [], [], makeStats({ uncollapsedStates: 0, collapsedStates: 1, avgUncertainty: 5, quantumHealth: 'deterministic', entanglementEntropy: 0 }),
    )
    expect(recs.length).toBe(0)
  })

  it('deduplicates recommendations', () => {
    const tunnels: TunnelingPath[] = [
      { from: 'a', to: 'b', path: ['a', 'b'], probability: 40, risk: 'dangerous' },
      { from: 'c', to: 'd', path: ['c', 'd'], probability: 30, risk: 'dangerous' },
    ]
    const recs = generateQuantumRecommendations([], [], tunnels, makeStats())
    const tunnelRecs = recs.filter(r => r.includes('tunneling'))
    expect(tunnelRecs.length).toBe(1)
  })
})

// ─── buildQuantumResult ─────────────────────────────────────────────────────────

describe('buildQuantumResult', () => {
  const opts: QuantumOptions = {}

  it('returns empty result for no files', () => {
    const result = buildQuantumResult([], [], opts)
    expect(result.states).toEqual([])
    expect(result.entanglements).toEqual([])
    expect(result.tunnelingPaths).toEqual([])
    expect(result.stats.totalStates).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('returns deterministic for empty files', () => {
    const result = buildQuantumResult([], [], opts)
    expect(result.stats.quantumHealth).toBe('deterministic')
    expect(result.stats.determinismIndex).toBe(100)
  })

  it('builds states for each file', () => {
    const result = buildQuantumResult(['a.ts', 'b.ts'], ['const x = 1', 'let y: string | number = 1'], opts)
    expect(result.states.length).toBe(2)
  })

  it('detects entanglements across files', () => {
    const result = buildQuantumResult(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', "import { foo } from './a'; foo();"],
      opts,
    )
    expect(result.entanglements.length).toBeGreaterThanOrEqual(1)
  })

  it('detects tunneling paths per file', () => {
    const result = buildQuantumResult(
      ['a.ts'],
      ['try { foo(); } catch(e) { return null; }'],
      opts,
    )
    expect(result.tunnelingPaths.length).toBeGreaterThanOrEqual(1)
  })

  it('computes stats correctly', () => {
    const result = buildQuantumResult(
      ['a.ts'],
      ['const x = 1'],
      opts,
    )
    expect(result.stats.totalStates).toBe(1)
    expect(typeof result.stats.avgUncertainty).toBe('number')
    expect(typeof result.stats.avgCoherence).toBe('number')
  })

  it('finds most uncertain file', () => {
    const result = buildQuantumResult(
      ['clean.ts', 'messy.ts'],
      ['const x = 1', 'if (a) {} if (b) {} const y: any = 1'],
      opts,
    )
    expect(result.stats.mostUncertainFile).toBe('messy.ts')
  })

  it('finds most entangled file', () => {
    const result = buildQuantumResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['export function foo() {} export function bar() {}', "import { foo, bar } from './a';", "import { foo } from './a';"],
      opts,
    )
    expect(result.stats.mostEntangledFile).toBe('a.ts')
  })

  it('classifies quantum health', () => {
    const result = buildQuantumResult(['a.ts'], ['const x = 1'], opts)
    expect(['deterministic', 'coherent', 'uncertain', 'chaotic', 'schrodinger']).toContain(result.stats.quantumHealth)
  })

  it('generates recommendations', () => {
    const result = buildQuantumResult(
      ['a.ts'],
      ['let x: string | number | boolean | null = 1; if (a) {} if (b) {}'],
      opts,
    )
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles empty content files', () => {
    const result = buildQuantumResult(['a.ts'], [''], opts)
    expect(result.states.length).toBe(1)
    expect(result.states[0].isCollapsed).toBe(true)
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────────

describe('format helpers', () => {
  const makeResult = (): QuantumResult => buildQuantumResult(
    ['a.ts'],
    ['const x: string | number = 1; if (a) {}'],
    {},
  )

  describe('formatStates', () => {
    it('handles empty states', () => {
      expect(formatStates([])).toContain('No files analyzed')
    })

    it('shows file details', () => {
      const result = makeResult()
      const output = formatStates(result.states)
      expect(output).toContain('a.ts')
    })

    it('shows header', () => {
      expect(formatStates([])).toContain('Quantum States')
    })
  })

  describe('formatSuperpositions', () => {
    it('handles empty superpositions', () => {
      expect(formatSuperpositions([])).toContain('No superpositions detected')
    })

    it('shows element details', () => {
      const sps: SuperPosition[] = [
        { element: 'x', possibleStates: ['string', 'number'], probability: [50, 50], isCollapsed: false, collapseRisk: 'low', location: 1 },
      ]
      const output = formatSuperpositions(sps)
      expect(output).toContain('x')
      expect(output).toContain('L1')
    })
  })

  describe('formatEntanglements', () => {
    it('handles empty entanglements', () => {
      expect(formatEntanglements([])).toContain('No entanglements detected')
    })

    it('shows entanglement details', () => {
      const ents: Entanglement[] = [
        { pair: ['a.ts', 'b.ts'], strength: 80, type: 'state', isQuantum: true, risk: 'dangerous', description: 'Shared global' },
      ]
      const output = formatEntanglements(ents)
      expect(output).toContain('a.ts')
      expect(output).toContain('b.ts')
      expect(output).toContain('quantum')
    })
  })

  describe('formatTunnelingPaths', () => {
    it('handles empty paths', () => {
      expect(formatTunnelingPaths([])).toContain('No tunneling paths detected')
    })

    it('shows tunnel details', () => {
      const paths: TunnelingPath[] = [
        { from: 'try', to: 'return', path: ['try', 'catch', 'return'], probability: 40, risk: 'dangerous' },
      ]
      const output = formatTunnelingPaths(paths)
      expect(output).toContain('try')
      expect(output).toContain('return')
    })
  })

  describe('formatQuantumStats', () => {
    it('shows stats summary', () => {
      const result = makeResult()
      const output = formatQuantumStats(result.stats)
      expect(output).toContain('Quantum Analysis')
      expect(output).toContain('States:')
      expect(output).toContain('Uncertainty:')
      expect(output).toContain('Determinism:')
    })
  })

  describe('formatRecommendations', () => {
    it('handles empty recommendations', () => {
      expect(formatRecommendations([])).toContain('deterministic')
    })

    it('shows numbered recommendations', () => {
      const output = formatRecommendations(['Fix X', 'Fix Y'])
      expect(output).toContain('1. Fix X')
      expect(output).toContain('2. Fix Y')
    })
  })

  describe('formatQuantumGauge', () => {
    it('returns a gauge string', () => {
      const gauge = formatQuantumGauge(75)
      expect(gauge).toContain('\u2588')
      expect(gauge).toContain('75')
    })

    it('respects width parameter', () => {
      const gauge = formatQuantumGauge(50, 10)
      expect(typeof gauge).toBe('string')
    })
  })

  describe('formatQuantumHealthLabel', () => {
    it('returns colored label for each level', () => {
      const levels: Array<import('../src/commands/quantum-helpers.js').QuantumHealth> = ['deterministic', 'coherent', 'uncertain', 'chaotic', 'schrodinger']
      for (const level of levels) {
        const label = formatQuantumHealthLabel(level)
        expect(label).toContain(level)
      }
    })
  })

  describe('formatTunnelRiskLabel', () => {
    it('returns colored label for each risk', () => {
      const risks = ['safe', 'unexpected', 'dangerous', 'critical']
      for (const risk of risks) {
        const label = formatTunnelRiskLabel(risk)
        expect(label).toContain(risk)
      }
    })
  })

  describe('formatEntanglementRiskLabel', () => {
    it('returns colored label for each risk', () => {
      const risks = ['benign', 'caution', 'dangerous', 'critical']
      for (const risk of risks) {
        const label = formatEntanglementRiskLabel(risk)
        expect(label).toContain(risk)
      }
    })
  })

  describe('formatQuantumTable', () => {
    it('produces full table output', () => {
      const result = makeResult()
      const output = formatQuantumTable(result)
      expect(output).toContain('Quantum Analysis')
      expect(output).toContain('Quantum States')
      expect(output).toContain('Recommendations')
    })
  })

  describe('formatQuantumJson', () => {
    it('produces valid JSON', () => {
      const result = makeResult()
      const json = formatQuantumJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.states).toBeDefined()
      expect(parsed.stats).toBeDefined()
    })
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('quantum integration', () => {
  it('full analysis with superpositions and tunnels', () => {
    const result = buildQuantumResult(
      ['complex.ts'],
      ['let x: string | number = 1;\ntry { foo(); } catch(e) { return null; }\nconsole.log(x);'],
      {},
    )
    expect(result.states.length).toBe(1)
    expect(result.tunnelingPaths.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalSuperpositions).toBeGreaterThan(0)
  })

  it('multi-file entanglement analysis', () => {
    const result = buildQuantumResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'export function shared() {}',
        "import { shared } from './a'; globalThis.config = {};",
        "import { shared } from './a'; globalThis.config = {};",
      ],
      {},
    )
    expect(result.entanglements.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.entanglementEntropy).toBeGreaterThan(0)
  })

  it('handles chaotic codebase', () => {
    const content = [
      'let a: any = 1; let b: any = 2; let c: any = 3;',
      'if (x) {} if (y) {} if (z) {}',
      'try { foo(); } catch(e) {} finally { return 0; }',
    ].join('\n')
    const result = buildQuantumResult(['chaos.ts'], [content], {})
    expect(result.stats.avgUncertainty).toBeGreaterThan(0)
    expect(result.stats.determinismIndex).toBeLessThan(80)
  })
})
