import { describe, it, expect } from 'vitest'
import {
  formatOutput,
  graphToDotFormat,
  displayCircularDependencies,
  displayDependencyTree,
  displayDotFormat,
  displayExternalModules,
  displayFullReport,
} from '../src/commands/dependencies-display-helpers.js'
import type { DependenciesReport, DependencyGraph } from '../src/commands/dependencies-helpers.js'

function makeReport(overrides: Partial<DependenciesReport> = {}): DependenciesReport {
  return {
    circularDependencies: [],
    externalModules: [],
    filesAnalyzed: 5,
    graph: { edges: [], nodes: [] },
    internalModules: [],
    orphanFiles: [],
    ...overrides,
  }
}

function makeGraph(): DependencyGraph {
  return { nodes: new Map() }
}

// ─── formatOutput ─────────────────────────────────────
describe('formatOutput', () => {
  it('returns JSON circular deps when circular flag is set', () => {
    const report = makeReport({ circularDependencies: [{ cycle: ['a', 'b', 'a'], location: { column: 1, end: 5, line: 1 } }] })
    const result = formatOutput(report, { circular: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies).toHaveLength(1)
  })

  it('returns JSON external modules when external flag is set', () => {
    const report = makeReport({ externalModules: ['react', 'lodash'] })
    const result = formatOutput(report, { external: true })
    const parsed = JSON.parse(result)
    expect(parsed.externalModules).toHaveLength(2)
  })

  it('returns DOT format when format is dot', () => {
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts'] as [string, string]], nodes: ['a.ts', 'b.ts'] },
    })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('digraph')
    expect(result).toContain('"a.ts"')
    expect(result).toContain('"b.ts"')
  })

  it('returns full JSON report by default', () => {
    const report = makeReport()
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.filesAnalyzed).toBe(5)
  })
})

// ─── graphToDotFormat ─────────────────────────────────
describe('graphToDotFormat', () => {
  it('extracts nodes from graph', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set() }],
        ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.nodes).toContain('a.ts')
    expect(result.nodes).toContain('b.ts')
  })

  it('extracts only relative import edges', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts', 'react']) }],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['a.ts', './b.ts'])
  })

  it('returns empty for empty graph', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const result = graphToDotFormat(graph)
    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
  })
})

// ─── displayCircularDependencies ──────────────────────
describe('displayCircularDependencies', () => {
  it('shows success message when no circular deps', () => {
    const logs: string[] = []
    displayCircularDependencies(makeReport(), 'console', (msg) => logs.push(msg))
    expect(logs.join('\n')).toContain('No circular dependencies')
  })

  it('shows JSON when format is json', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [{ cycle: ['a', 'b', 'a'], location: { column: 1, end: 5, line: 1 } }] })
    displayCircularDependencies(report, 'json', (msg) => logs.push(msg))
    const parsed = JSON.parse(logs[0]!)
    expect(parsed.circularDependencies).toHaveLength(1)
  })

  it('shows cycle details in console format', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [{ cycle: ['a.ts', 'b.ts', 'a.ts'], location: { column: 1, end: 5, line: 1 } }] })
    displayCircularDependencies(report, 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('1 circular dependencies')
    expect(joined).toContain('a.ts')
  })

  it('shows count for multiple circular deps', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['a', 'b', 'a'], location: { column: 1, end: 5, line: 1 } },
        { cycle: ['c', 'd', 'c'], location: { column: 1, end: 5, line: 2 } },
      ],
    })
    displayCircularDependencies(report, 'console', (msg) => logs.push(msg))
    expect(logs.join('\n')).toContain('2 circular dependencies')
  })
})

// ─── displayDependencyTree ───────────────────────────
describe('displayDependencyTree', () => {
  it('shows no root files message when all have imports', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [['a.ts', 'b.ts'] as [string, string]],
        nodes: ['a.ts', 'b.ts'],
      },
    })
    displayDependencyTree(report, (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('Dependency Tree')
  })

  it('shows tree with root nodes', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [['root.ts', 'child.ts'] as [string, string]],
        nodes: ['root.ts', 'child.ts'],
      },
    })
    displayDependencyTree(report, (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('root.ts')
  })
})

// ─── displayDotFormat ─────────────────────────────────
describe('displayDotFormat', () => {
  it('outputs valid DOT format', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [['a.ts', 'b.ts'] as [string, string]],
        nodes: ['a.ts', 'b.ts'],
      },
    })
    displayDotFormat(report, (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('digraph dependencies')
    expect(joined).toContain('"a.ts"')
    expect(joined).toContain('"b.ts"')
  })

  it('outputs edges with arrow notation', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [['src/a.ts', 'src/b.ts'] as [string, string]],
        nodes: ['src/a.ts', 'src/b.ts'],
      },
    })
    displayDotFormat(report, (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('"src/a.ts" -> "src/b.ts"')
  })
})

// ─── displayExternalModules ──────────────────────────
describe('displayExternalModules', () => {
  it('shows no external message when empty', () => {
    const logs: string[] = []
    displayExternalModules(makeReport(), 'console', (msg) => logs.push(msg))
    expect(logs.join('\n')).toContain('No external dependencies')
  })

  it('shows JSON when format is json', () => {
    const logs: string[] = []
    displayExternalModules(makeReport({ externalModules: ['react'] }), 'json', (msg) => logs.push(msg))
    const parsed = JSON.parse(logs[0]!)
    expect(parsed.externalModules).toContain('react')
  })

  it('shows module list in console format', () => {
    const logs: string[] = []
    displayExternalModules(makeReport({ externalModules: ['react', 'lodash'] }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('External modules (2)')
    expect(joined).toContain('react')
    expect(joined).toContain('lodash')
  })
})

// ─── displayFullReport ───────────────────────────────
describe('displayFullReport', () => {
  it('shows JSON report when format is json', () => {
    const logs: string[] = []
    displayFullReport(makeReport(), 'json', (msg) => logs.push(msg))
    const parsed = JSON.parse(logs[0]!)
    expect(parsed.filesAnalyzed).toBe(5)
  })

  it('shows DOT when format is dot', () => {
    const logs: string[] = []
    displayFullReport(makeReport(), 'dot', (msg) => logs.push(msg))
    expect(logs.join('\n')).toContain('digraph')
  })

  it('shows full console report by default', () => {
    const logs: string[] = []
    displayFullReport(makeReport(), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('Dependency Analysis')
    expect(joined).toContain('Files analyzed: 5')
    expect(joined).toContain('No circular dependencies')
  })

  it('shows circular deps when present', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'], location: { column: 1, end: 5, line: 1 } }],
    })
    displayFullReport(report, 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('Circular Dependencies (1)')
  })

  it('shows internal modules', () => {
    const logs: string[] = []
    displayFullReport(makeReport({ internalModules: ['./utils', './helpers'] }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('Internal Modules (2)')
  })

  it('shows external modules', () => {
    const logs: string[] = []
    displayFullReport(makeReport({ externalModules: ['chalk'] }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('External Modules (1)')
  })

  it('shows orphan files', () => {
    const logs: string[] = []
    displayFullReport(makeReport({ orphanFiles: ['unused.ts'] }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('Orphan Files')
    expect(joined).toContain('unused.ts')
  })

  it('truncates long lists of circular deps', () => {
    const logs: string[] = []
    const circDeps = Array.from({ length: 8 }, (_, i) => ({
      cycle: [`a${i}`, `b${i}`, `a${i}`],
      location: { column: 1, end: 5, line: 1 },
    }))
    displayFullReport(makeReport({ circularDependencies: circDeps }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('and 3 more')
  })

  it('truncates long lists of internal modules', () => {
    const logs: string[] = []
    const mods = Array.from({ length: 15 }, (_, i) => `./module${i}`)
    displayFullReport(makeReport({ internalModules: mods }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('and 5 more')
  })

  it('truncates long lists of external modules', () => {
    const logs: string[] = []
    const mods = Array.from({ length: 15 }, (_, i) => `pkg${i}`)
    displayFullReport(makeReport({ externalModules: mods }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('and 5 more')
  })

  it('truncates long lists of orphan files', () => {
    const logs: string[] = []
    const files = Array.from({ length: 8 }, (_, i) => `orphan${i}.ts`)
    displayFullReport(makeReport({ orphanFiles: files }), 'console', (msg) => logs.push(msg))
    const joined = logs.join('\n')
    expect(joined).toContain('and 3 more')
  })
})
