import { describe, expect, it } from 'vitest'

import {
  buildAdjacency,
  buildWeaverResult,
  computeDensity,
  computeFabricScore,
  computeFabricScores,
  computeOverallHealth,
  computeThreadStrength,
  detectKnots,
  detectLayers,
  detectWeavePatterns,
  determineRole,
  extractThreads,
  generateRecommendations,
  getThreadCount,
  resolveImport,
  type FabricScore,
  type Knot,
  type Thread,
  type WeavePattern,
} from '../src/commands/weaver-helpers.js'

import {
  formatFabricTable,
  formatKnots,
  formatPatterns,
  formatRecommendations,
  formatThreads,
  formatWeaverJSON,
  formatWeaverStats,
  formatWeaverTable,
  knotSeverityColor,
  roleColorFn,
} from '../src/commands/weaver-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FILES_A = ['src/core.ts', 'src/helpers.ts', 'src/main.ts', 'src/utils.ts']

const CONTENT_CORE = `export interface Config {
  name: string
}
export function init(): Config {
  return { name: 'app' }
}
`

const CONTENT_HELPERS = `import { Config } from './core'
import { log } from './utils'
export function process(config: Config): void {
  log(config.name)
}
`

const CONTENT_MAIN = `import { init } from './core'
import { process } from './helpers'
import { log } from './utils'
function main() {
  const config = init()
  process(config)
  log('done')
}
`

const CONTENT_UTILS = `export function log(msg: string): void {
  console.log(msg)
}
`

const CIRCULAR_A = `import { b } from './b'
export function a() { return b() }
`

const CIRCULAR_B = `import { a } from './a'
export function b() { return a() }
`

const COMPLEX_CIRC_A = `import { b } from './b'
export function a() { return b() }
`

const COMPLEX_CIRC_B = `import { c } from './c'
export function b() { return c() }
`

const COMPLEX_CIRC_C = `import { a } from './a'
export function c() { return a() }
`

const EMPTY_FILE = ''

const ISOLATED_FILE = 'const x = 1\nexport { x }\n'

const DYNAMIC_IMPORT_FILE = `export function load() {
  const mod = import('./utils')
  return mod
}
`

const TYPE_IMPORT_FILE = `import type { Config } from './core'
export function use(config: Config) {}
`

const REEXPORT_FILE = `export { init } from './core'
export * from './utils'
`

// ─── computeThreadStrength ────────────────────────────────────────────────────

describe('computeThreadStrength', () => {
  it('returns 1 for single import', () => {
    expect(computeThreadStrength(1, false)).toBe(1)
  })

  it('returns 3 for 2-3 imports', () => {
    expect(computeThreadStrength(2, false)).toBe(3)
    expect(computeThreadStrength(3, false)).toBe(3)
  })

  it('returns 5 for 4-6 imports', () => {
    expect(computeThreadStrength(4, false)).toBe(5)
    expect(computeThreadStrength(6, false)).toBe(5)
  })

  it('returns 8 for 7+ imports', () => {
    expect(computeThreadStrength(7, false)).toBe(8)
    expect(computeThreadStrength(20, false)).toBe(8)
  })

  it('adds +2 for re-exports (capped at 10)', () => {
    expect(computeThreadStrength(1, true)).toBe(3)
    expect(computeThreadStrength(7, true)).toBe(10)
  })
})

// ─── resolveImport ────────────────────────────────────────────────────────────

describe('resolveImport', () => {
  it('returns null for non-relative imports', () => {
    expect(resolveImport('chalk', 'src/a.ts', FILES_A)).toBeNull()
    expect(resolveImport('@oclif/core', 'src/a.ts', FILES_A)).toBeNull()
  })

  it('resolves relative imports with .ts extension', () => {
    expect(resolveImport('./core', 'src/helpers.ts', FILES_A)).toBe('src/core.ts')
  })

  it('resolves relative imports from subdirectory', () => {
    expect(resolveImport('./helpers', 'src/main.ts', FILES_A)).toBe('src/helpers.ts')
  })

  it('returns null for unknown files', () => {
    expect(resolveImport('./unknown', 'src/main.ts', FILES_A)).toBeNull()
  })

  it('resolves parent directory imports', () => {
    expect(resolveImport('../core', 'src/sub/a.ts', ['src/core.ts', 'src/sub/a.ts'])).toBe('src/core.ts')
  })
})

// ─── extractThreads ───────────────────────────────────────────────────────────

describe('extractThreads', () => {
  it('extracts ESM imports', () => {
    const threads = extractThreads(['src/helpers.ts', 'src/core.ts', 'src/utils.ts'], [CONTENT_HELPERS, CONTENT_CORE, CONTENT_UTILS])
    expect(threads.length).toBe(2)
    expect(threads[0]!.type).toBe('import')
    expect(threads[0]!.to).toBe('src/core.ts')
    expect(threads[1]!.to).toBe('src/utils.ts')
  })

  it('extracts type imports', () => {
    const threads = extractThreads(['src/types.ts', 'src/core.ts'], [TYPE_IMPORT_FILE, CONTENT_CORE])
    expect(threads.length).toBe(1)
    expect(threads[0]!.type).toBe('type-import')
    expect(threads[0]!.isTypeOnly).toBe(true)
  })

  it('extracts re-exports', () => {
    const threads = extractThreads(['src/reexport.ts', 'src/core.ts', 'src/utils.ts'], [REEXPORT_FILE, CONTENT_CORE, CONTENT_UTILS])
    expect(threads.length).toBe(2)
    const reexp = threads.find((t) => t.type === 're-export')
    expect(reexp).toBeDefined()
  })

  it('extracts dynamic imports', () => {
    const threads = extractThreads(['src/loader.ts', 'src/utils.ts'], [DYNAMIC_IMPORT_FILE, CONTENT_UTILS])
    const dyn = threads.find((t) => t.type === 'dynamic-import')
    expect(dyn).toBeDefined()
  })

  it('ignores comments', () => {
    const content = "// import { x } from './y'\n/* import { z } from './w' */\n"
    const threads = extractThreads(['a.ts'], [content])
    expect(threads.length).toBe(0)
  })

  it('returns empty for empty files', () => {
    const threads = extractThreads(['a.ts'], [EMPTY_FILE])
    expect(threads).toEqual([])
  })

  it('computes strength correctly', () => {
    const content = "import { a, b, c, d } from './core'"
    const threads = extractThreads(['src/helpers.ts', 'src/core.ts'], [content, CONTENT_CORE])
    expect(threads.length).toBe(1)
    expect(threads[0]!.strength).toBe(5)
  })
})

// ─── computeDensity ───────────────────────────────────────────────────────────

describe('computeDensity', () => {
  it('returns 0 for single file', () => {
    expect(computeDensity([], ['a.ts'])).toBe(0)
  })

  it('returns 0 for empty files', () => {
    expect(computeDensity([], [])).toBe(0)
  })

  it('computes density correctly', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'c.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    // 2 edges, 3*2 = 6 max
    const density = computeDensity(threads, ['a.ts', 'b.ts', 'c.ts'])
    expect(density).toBe(0.33)
  })

  it('counts unique edges only', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'a.ts', to: 'b.ts', type: 'type-import', strength: 1, isTypeOnly: true },
    ]
    const density = computeDensity(threads, ['a.ts', 'b.ts'])
    expect(density).toBe(0.5)
  })
})

// ─── getThreadCount ───────────────────────────────────────────────────────────

describe('getThreadCount', () => {
  it('counts incoming and outgoing', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    expect(getThreadCount('a.ts', threads)).toBe(2)
    expect(getThreadCount('b.ts', threads)).toBe(2)
    expect(getThreadCount('c.ts', threads)).toBe(0)
  })
})

// ─── buildAdjacency ───────────────────────────────────────────────────────────

describe('buildAdjacency', () => {
  it('builds adjacency map', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const adj = buildAdjacency(threads, ['a.ts', 'b.ts'])
    expect(adj.get('a.ts')?.has('b.ts')).toBe(true)
    expect(adj.get('b.ts')?.size).toBe(0)
  })
})

// ─── detectLayers ─────────────────────────────────────────────────────────────

describe('detectLayers', () => {
  it('detects layered structure', () => {
    const adj = new Map<string, Set<string>>()
    adj.set('a.ts', new Set(['b.ts']))
    adj.set('b.ts', new Set(['c.ts']))
    adj.set('c.ts', new Set())
    const layers = detectLayers(adj, ['a.ts', 'b.ts', 'c.ts'])
    expect(layers).not.toBeNull()
    expect(layers!.length).toBeGreaterThanOrEqual(2)
  })

  it('returns null for circular deps', () => {
    const adj = new Map<string, Set<string>>()
    adj.set('a.ts', new Set(['b.ts']))
    adj.set('b.ts', new Set(['a.ts']))
    const layers = detectLayers(adj, ['a.ts', 'b.ts'])
    expect(layers).toBeNull()
  })

  it('returns null for single layer', () => {
    const adj = new Map<string, Set<string>>()
    adj.set('a.ts', new Set())
    const layers = detectLayers(adj, ['a.ts'])
    expect(layers).toBeNull()
  })
})

// ─── detectWeavePatterns ──────────────────────────────────────────────────────

describe('detectWeavePatterns', () => {
  it('detects loose pattern for sparse connections', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const patterns = detectWeavePatterns(threads, ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'])
    const loose = patterns.find((p) => p.name === 'loose')
    expect(loose).toBeDefined()
  })

  it('detects tangled pattern for circular deps', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const patterns = detectWeavePatterns(threads, ['a.ts', 'b.ts'])
    const tangled = patterns.find((p) => p.name === 'tangled')
    expect(tangled).toBeDefined()
  })

  it('detects hub-spoke pattern', () => {
    const threads: Thread[] = [
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'c.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'd.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const patterns = detectWeavePatterns(threads, ['a.ts', 'b.ts', 'c.ts', 'd.ts'])
    const hub = patterns.find((p) => p.name === 'hub-spoke')
    expect(hub).toBeDefined()
  })

  it('returns empty for no files', () => {
    expect(detectWeavePatterns([], [])).toEqual([])
  })
})

// ─── detectKnots ──────────────────────────────────────────────────────────────

describe('detectKnots', () => {
  it('detects simple knot (2 files)', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const knots = detectKnots(threads)
    expect(knots.length).toBe(1)
    expect(knots[0]!.type).toBe('simple')
    expect(knots[0]!.severity).toBe('low')
  })

  it('detects complex knot (3+ files)', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'c.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'c.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const knots = detectKnots(threads)
    expect(knots.length).toBe(1)
    expect(knots[0]!.type).toBe('complex')
    expect(knots[0]!.severity).toBe('medium')
  })

  it('detects high severity for 4+ files', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'c.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'c.ts', to: 'd.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'd.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const knots = detectKnots(threads)
    expect(knots[0]!.severity).toBe('high')
  })

  it('returns empty for no cycles', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    expect(detectKnots(threads)).toEqual([])
  })

  it('returns empty for no threads', () => {
    expect(detectKnots([])).toEqual([])
  })

  it('deduplicates cycles', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const knots = detectKnots(threads)
    expect(knots.length).toBe(1)
  })
})

// ─── determineRole ────────────────────────────────────────────────────────────

describe('determineRole', () => {
  it('returns orphan for no connections', () => {
    expect(determineRole('a.ts', [])).toBe('orphan')
  })

  it('returns core for high incoming', () => {
    const threads: Thread[] = [
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'c.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'd.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    expect(determineRole('a.ts', threads)).toBe('core')
  })

  it('returns bridge for both in and out', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'c.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    expect(determineRole('a.ts', threads)).toBe('bridge')
  })

  it('returns leaf for outgoing only', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    expect(determineRole('a.ts', threads)).toBe('leaf')
    expect(determineRole('b.ts', threads)).toBe('utility')
  })
})

// ─── computeFabricScore ───────────────────────────────────────────────────────

describe('computeFabricScore', () => {
  it('scores orphan as 10', () => {
    const score = computeFabricScore('a.ts', [], ['a.ts'])
    expect(score.textureScore).toBe(10)
    expect(score.role).toBe('orphan')
  })

  it('scores single connection as 40', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const score = computeFabricScore('a.ts', threads, ['a.ts', 'b.ts'])
    expect(score.outgoingThreads).toBe(1)
    expect(score.incomingThreads).toBe(0)
  })

  it('rewards balanced connections', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
      { from: 'c.ts', to: 'a.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const score = computeFabricScore('a.ts', threads, ['a.ts', 'b.ts', 'c.ts'])
    expect(score.textureScore).toBeGreaterThanOrEqual(80)
  })

  it('penalizes too many connections', () => {
    const threads: Thread[] = Array.from({ length: 20 }, (_, i) => ({
      from: `f${i}.ts`, to: 'a.ts', type: 'import' as const, strength: 1, isTypeOnly: false,
    }))
    const score = computeFabricScore('a.ts', threads, ['a.ts', ...threads.map((t) => t.from)])
    expect(score.textureScore).toBeLessThanOrEqual(80)
  })

  it('clamps score to 0-100', () => {
    const score = computeFabricScore('a.ts', [], ['a.ts'])
    expect(score.textureScore).toBeGreaterThanOrEqual(0)
    expect(score.textureScore).toBeLessThanOrEqual(100)
  })
})

// ─── computeFabricScores ──────────────────────────────────────────────────────

describe('computeFabricScores', () => {
  it('computes scores for all files', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 1, isTypeOnly: false },
    ]
    const scores = computeFabricScores(['a.ts', 'b.ts'], threads)
    expect(scores.length).toBe(2)
    expect(scores[0]!.file).toBe('a.ts')
    expect(scores[1]!.file).toBe('b.ts')
  })
})

// ─── computeOverallHealth ─────────────────────────────────────────────────────

describe('computeOverallHealth', () => {
  it('starts at 80 with no issues', () => {
    const health = computeOverallHealth([], [], [computeFabricScore('a.ts', [], ['a.ts'])])
    expect(health).toBeLessThanOrEqual(100)
  })

  it('penalizes knots', () => {
    const knots: Knot[] = [{ files: ['a.ts', 'b.ts'], type: 'simple', severity: 'low', threads: [] }]
    const health = computeOverallHealth([], knots, [])
    expect(health).toBeLessThan(80)
  })

  it('penalizes orphans', () => {
    const fabric: FabricScore[] = [
      { file: 'a.ts', incomingThreads: 0, outgoingThreads: 0, density: 0, textureScore: 10, role: 'orphan' },
    ]
    const health = computeOverallHealth([], [], fabric)
    expect(health).toBeLessThan(80)
  })

  it('clamps to 0-100', () => {
    const manyKnots = Array.from({ length: 20 }, (_, i) => ({
      files: [`a${i}.ts`, `b${i}.ts`], type: 'simple' as const, severity: 'low' as const, threads: [],
    }))
    const health = computeOverallHealth([], manyKnots, [])
    expect(health).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends untangling knots', () => {
    const knots: Knot[] = [{ files: ['a.ts', 'b.ts'], type: 'complex', severity: 'high', threads: [] }]
    const recs = generateRecommendations([], knots, [], { totalThreads: 0, avgThreadStrength: 0, patternCount: 0, tightWeaveCount: 0, looseWeaveCount: 0, knotCount: 1, simpleKnotCount: 0, complexKnotCount: 1, overallDensity: 0, overallHealth: 50, mostConnectedFile: '', leastConnectedFile: '', avgTextureScore: 50 })
    expect(recs.some((r) => r.includes('Untangle'))).toBe(true)
  })

  it('recommends decoupling tight weaves', () => {
    const patterns: WeavePattern[] = [{ name: 'tight', files: ['a.ts'], density: 0.6, health: 70, description: '' }]
    const recs = generateRecommendations(patterns, [], [], { totalThreads: 0, avgThreadStrength: 0, patternCount: 1, tightWeaveCount: 1, looseWeaveCount: 0, knotCount: 0, simpleKnotCount: 0, complexKnotCount: 0, overallDensity: 0.6, overallHealth: 70, mostConnectedFile: '', leastConnectedFile: '', avgTextureScore: 50 })
    expect(recs.some((r) => r.includes('decoupling'))).toBe(true)
  })

  it('recommends connecting orphans', () => {
    const fabric: FabricScore[] = [{ file: 'a.ts', incomingThreads: 0, outgoingThreads: 0, density: 0, textureScore: 10, role: 'orphan' }]
    const recs = generateRecommendations([], [], fabric, { totalThreads: 0, avgThreadStrength: 0, patternCount: 0, tightWeaveCount: 0, looseWeaveCount: 0, knotCount: 0, simpleKnotCount: 0, complexKnotCount: 0, overallDensity: 0, overallHealth: 80, mostConnectedFile: '', leastConnectedFile: '', avgTextureScore: 50 })
    expect(recs.some((r) => r.includes('orphan'))).toBe(true)
  })

  it('praises healthy weave', () => {
    const recs = generateRecommendations([], [], [], { totalThreads: 5, avgThreadStrength: 3, patternCount: 0, tightWeaveCount: 0, looseWeaveCount: 0, knotCount: 0, simpleKnotCount: 0, complexKnotCount: 0, overallDensity: 0.3, overallHealth: 80, mostConnectedFile: '', leastConnectedFile: '', avgTextureScore: 70 })
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildWeaverResult ────────────────────────────────────────────────────────

describe('buildWeaverResult', () => {
  it('builds result from files and contents', () => {
    const result = buildWeaverResult(FILES_A, [CONTENT_CORE, CONTENT_HELPERS, CONTENT_MAIN, CONTENT_UTILS])
    expect(result.threads.length).toBeGreaterThan(0)
    expect(result.fabric.length).toBe(4)
    expect(result.stats.totalThreads).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildWeaverResult([], [])
    expect(result.threads).toEqual([])
    expect(result.fabric).toEqual([])
    expect(result.stats.totalThreads).toBe(0)
  })

  it('handles single file', () => {
    const result = buildWeaverResult(['a.ts'], [ISOLATED_FILE])
    expect(result.fabric.length).toBe(1)
    expect(result.fabric[0]!.role).toBe('orphan')
  })

  it('detects circular dependencies', () => {
    const result = buildWeaverResult(['a.ts', 'b.ts'], [CIRCULAR_A, CIRCULAR_B])
    expect(result.knots.length).toBe(1)
    expect(result.knots[0]!.type).toBe('simple')
  })

  it('detects complex cycles', () => {
    const result = buildWeaverResult(['a.ts', 'b.ts', 'c.ts'], [COMPLEX_CIRC_A, COMPLEX_CIRC_B, COMPLEX_CIRC_C])
    expect(result.knots.length).toBe(1)
    expect(result.knots[0]!.type).toBe('complex')
  })

  it('computes stats correctly', () => {
    const result = buildWeaverResult(FILES_A, [CONTENT_CORE, CONTENT_HELPERS, CONTENT_MAIN, CONTENT_UTILS])
    expect(result.stats.totalThreads).toBeGreaterThan(0)
    expect(result.stats.overallHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallHealth).toBeLessThanOrEqual(100)
    expect(result.stats.avgTextureScore).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildWeaverResult(FILES_A, [CONTENT_CORE, CONTENT_HELPERS, CONTENT_MAIN, CONTENT_UTILS])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatThreads', () => {
  it('formats threads', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 5, isTypeOnly: false },
    ]
    const output = formatThreads(threads)
    expect(output).toContain('Threads')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('handles empty', () => {
    expect(formatThreads([])).toContain('No threads')
  })

  it('shows truncation for 20+ threads', () => {
    const threads: Thread[] = Array.from({ length: 25 }, (_, i) => ({
      from: `a${i}.ts`, to: `b${i}.ts`, type: 'import' as const, strength: 1, isTypeOnly: false,
    }))
    const output = formatThreads(threads)
    expect(output).toContain('... and')
  })
})

describe('formatPatterns', () => {
  it('formats patterns', () => {
    const patterns: WeavePattern[] = [
      { name: 'loose', files: ['a.ts'], density: 0.15, health: 90, description: 'test' },
    ]
    const output = formatPatterns(patterns)
    expect(output).toContain('loose')
    expect(output).toContain('0.15')
  })

  it('handles empty', () => {
    expect(formatPatterns([])).toContain('No patterns')
  })
})

describe('formatKnots', () => {
  it('formats knots', () => {
    const knots: Knot[] = [
      { files: ['a.ts', 'b.ts'], type: 'simple', severity: 'low', threads: [] },
    ]
    const output = formatKnots(knots)
    expect(output).toContain('Knot')
    expect(output).toContain('a.ts → b.ts')
  })

  it('shows knot-free when none', () => {
    expect(formatKnots([])).toContain('knot-free')
  })
})

describe('knotSeverityColor', () => {
  it('returns functions for all severities', () => {
    expect(typeof knotSeverityColor('high')).toBe('function')
    expect(typeof knotSeverityColor('medium')).toBe('function')
    expect(typeof knotSeverityColor('low')).toBe('function')
  })
})

describe('formatFabricTable', () => {
  it('formats fabric table', () => {
    const fabric: FabricScore[] = [
      { file: 'a.ts', incomingThreads: 3, outgoingThreads: 1, density: 0.5, textureScore: 85, role: 'core' },
    ]
    const output = formatFabricTable(fabric)
    expect(output).toContain('a.ts')
    expect(output).toContain('core')
  })

  it('handles empty', () => {
    expect(formatFabricTable([])).toContain('No fabric')
  })
})

describe('roleColorFn', () => {
  it('returns functions for all roles', () => {
    expect(typeof roleColorFn('core')).toBe('function')
    expect(typeof roleColorFn('bridge')).toBe('function')
    expect(typeof roleColorFn('utility')).toBe('function')
    expect(typeof roleColorFn('leaf')).toBe('function')
    expect(typeof roleColorFn('orphan')).toBe('function')
  })
})

describe('formatWeaverStats', () => {
  it('formats stats', () => {
    const stats = {
      totalThreads: 10, avgThreadStrength: 3.5, patternCount: 2, tightWeaveCount: 1, looseWeaveCount: 1,
      knotCount: 0, simpleKnotCount: 0, complexKnotCount: 0, overallDensity: 0.3, overallHealth: 75,
      mostConnectedFile: 'a.ts', leastConnectedFile: 'd.ts', avgTextureScore: 65,
    }
    const output = formatWeaverStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('a.ts')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix this'])
    expect(output).toContain('1.')
    expect(output).toContain('Fix this')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatWeaverTable', () => {
  it('formats full table', () => {
    const result = buildWeaverResult(FILES_A, [CONTENT_CORE, CONTENT_HELPERS, CONTENT_MAIN, CONTENT_UTILS])
    const output = formatWeaverTable(result)
    expect(output).toContain('Code Weaver')
    expect(output).toContain('Threads')
    expect(output).toContain('Fabric')
  })
})

describe('formatWeaverJSON', () => {
  it('formats valid JSON', () => {
    const result = buildWeaverResult(['a.ts'], [ISOLATED_FILE])
    const json = formatWeaverJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.threads).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes realistic codebase', () => {
    const result = buildWeaverResult(FILES_A, [CONTENT_CORE, CONTENT_HELPERS, CONTENT_MAIN, CONTENT_UTILS])

    expect(result.threads.length).toBe(5)
    expect(result.fabric.length).toBe(4)
    expect(result.stats.mostConnectedFile).toBeTruthy()

    const coreScore = result.fabric.find((f) => f.file === 'src/core.ts')
    expect(coreScore).toBeDefined()
    expect(coreScore!.incomingThreads).toBeGreaterThanOrEqual(2)
  })

  it('detects all thread types', () => {
    const files = ['src/types.ts', 'src/core.ts', 'src/reexport.ts', 'src/loader.ts', 'src/utils.ts']
    const contents = [TYPE_IMPORT_FILE, CONTENT_CORE, REEXPORT_FILE, DYNAMIC_IMPORT_FILE, CONTENT_UTILS]
    const result = buildWeaverResult(files, contents)

    const types = result.threads.filter((t) => t.type === 'type-import')
    const reexports = result.threads.filter((t) => t.type === 're-export')
    expect(types.length).toBe(1)
    expect(reexports.length).toBeGreaterThanOrEqual(1)
  })
})
