import { describe, expect, it } from 'vitest'

import type { DependencyGraph, DependenciesReport } from '../../src/commands/dependencies-helpers.js'

import {
  displayCircularDependencies,
  displayDependencyTree,
  displayDotFormat,
  displayExternalModules,
  displayFullReport,
  formatOutput,
  graphToDotFormat,
} from '../../src/commands/dependencies-display-helpers.js'

// ─── Helpers ───

const strip = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

function makeReport(overrides: Partial<DependenciesReport> = {}): DependenciesReport {
  return {
    circularDependencies: [],
    externalModules: [],
    filesAnalyzed: 0,
    graph: { edges: [], nodes: [] },
    internalModules: [],
    orphanFiles: [],
    ...overrides,
  }
}

function collect(fn: (log: (msg: string) => void) => void): string[] {
  const messages: string[] = []
  fn((msg) => messages.push(msg))
  return messages
}

// ─── formatOutput ───

describe('formatOutput', () => {
  it('returns circular deps JSON when circular flag is set', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }],
    })
    const result = formatOutput(report, { circular: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies).toHaveLength(1)
    expect(parsed.circularDependencies[0].cycle).toEqual(['a', 'b', 'a'])
  })

  it('returns empty circular deps array when none present and circular flag set', () => {
    const result = formatOutput(makeReport(), { circular: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies).toEqual([])
  })

  it('returns external modules JSON when external flag is set', () => {
    const report = makeReport({ externalModules: ['lodash', 'chalk'] })
    const result = formatOutput(report, { external: true })
    const parsed = JSON.parse(result)
    expect(parsed.externalModules).toEqual(['lodash', 'chalk'])
  })

  it('returns empty external modules when none present and external flag set', () => {
    const result = formatOutput(makeReport(), { external: true })
    const parsed = JSON.parse(result)
    expect(parsed.externalModules).toEqual([])
  })

  it('prioritizes circular flag over external flag', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }],
      externalModules: ['lodash'],
    })
    const result = formatOutput(report, { circular: true, external: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies).toBeDefined()
    expect(parsed.externalModules).toBeUndefined()
  })

  it('returns dot format when format is dot', () => {
    const report = makeReport({
      graph: {
        edges: [['a', 'b'] as [string, string]],
        nodes: ['a', 'b'],
      },
    })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('digraph dependencies {')
    expect(result).toContain('"a" [label="a"]')
    expect(result).toContain('"b" [label="b"]')
    expect(result).toContain('"a" -> "b"')
    expect(result.endsWith('}')).toBe(true)
  })

  it('returns dot format with empty graph', () => {
    const result = formatOutput(makeReport(), { format: 'dot' })
    expect(result).toBe('digraph dependencies {\n\n}')
  })

  it('returns full JSON by default (no flags)', () => {
    const report = makeReport({ filesAnalyzed: 5 })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.filesAnalyzed).toBe(5)
    expect(parsed.graph).toBeDefined()
    expect(parsed.circularDependencies).toBeDefined()
    expect(parsed.externalModules).toBeDefined()
  })

  it('formats dot with multiple nodes and edges', () => {
    const report = makeReport({
      graph: {
        edges: [
          ['src/a.ts', 'src/b.ts'] as [string, string],
          ['src/b.ts', 'src/c.ts'] as [string, string],
        ],
        nodes: ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      },
    })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('"src/a.ts" -> "src/b.ts"')
    expect(result).toContain('"src/b.ts" -> "src/c.ts"')
  })
})

// ─── graphToDotFormat ───

describe('graphToDotFormat', () => {
  it('returns empty nodes and edges for empty graph', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const result = graphToDotFormat(graph)
    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
  })

  it('extracts nodes from graph keys', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['src/a.ts', { filePath: 'src/a.ts', importDetails: new Map(), imports: new Set() }],
        ['src/b.ts', { filePath: 'src/b.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.nodes).toEqual(['src/a.ts', 'src/b.ts'])
  })

  it('creates edges only for relative imports (starting with .)', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        [
          'src/a.ts',
          {
            filePath: 'src/a.ts',
            importDetails: new Map(),
            imports: new Set(['./b', 'lodash']),
          },
        ],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.edges).toEqual([['src/a.ts', './b']])
  })

  it('creates multiple edges for multiple relative imports', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        [
          'src/a.ts',
          {
            filePath: 'src/a.ts',
            importDetails: new Map(),
            imports: new Set(['./b', './c']),
          },
        ],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.edges).toHaveLength(2)
    expect(result.edges).toContainEqual(['src/a.ts', './b'])
    expect(result.edges).toContainEqual(['src/a.ts', './c'])
  })

  it('ignores bare external imports', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        [
          'src/a.ts',
          {
            filePath: 'src/a.ts',
            importDetails: new Map(),
            imports: new Set(['react', 'lodash', 'chalk']),
          },
        ],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.edges).toEqual([])
  })

  it('handles nodes with no imports', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['src/a.ts', { filePath: 'src/a.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = graphToDotFormat(graph)
    expect(result.nodes).toEqual(['src/a.ts'])
    expect(result.edges).toEqual([])
  })
})

// ─── displayCircularDependencies ───

describe('displayCircularDependencies', () => {
  it('shows success message when no circular deps found', () => {
    const messages = collect((log) => displayCircularDependencies(makeReport(), 'table', log))
    expect(messages).toHaveLength(1)
    expect(strip(messages[0])).toContain('No circular dependencies found!')
  })

  it('shows circular deps in json format', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }],
    })
    const messages = collect((log) => displayCircularDependencies(report, 'json', log))
    const parsed = JSON.parse(messages[0])
    expect(parsed.circularDependencies).toHaveLength(1)
    expect(parsed.circularDependencies[0].cycle).toEqual(['a', 'b', 'a'])
  })

  it('shows circular deps count in table format', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }],
    })
    const messages = collect((log) => displayCircularDependencies(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Found 1 circular dependencies')
  })

  it('shows each cycle path in table format', () => {
    const report = makeReport({
      circularDependencies: [
        { cycle: ['a', 'b', 'a'] },
        { cycle: ['x', 'y', 'z', 'x'] },
      ],
    })
    const messages = collect((log) => displayCircularDependencies(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Cycle: a -> b -> a')
    expect(text).toContain('Cycle: x -> y -> z -> x')
  })

  it('shows plural "dependencies" for multiple cycles', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }, { cycle: ['c', 'd', 'c'] }],
    })
    const messages = collect((log) => displayCircularDependencies(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('2 circular dependencies')
  })
})

// ─── displayDependencyTree ───

describe('displayDependencyTree', () => {
  it('shows tree header', () => {
    const messages = collect((log) => displayDependencyTree(makeReport(), log))
    const text = strip(messages.join(''))
    expect(text).toContain('Dependency Tree')
  })

  it('shows "no root files" when all nodes are targets of edges', () => {
    const report = makeReport({
      graph: {
        edges: [
          ['b', 'a'] as [string, string],
          ['a', 'b'] as [string, string],
        ],
        nodes: ['a', 'b'],
      },
    })
    const messages = collect((log) => displayDependencyTree(report, log))
    const text = strip(messages.join(''))
    expect(text).toContain('No root files found')
  })

  it('renders root nodes as tree roots', () => {
    const report = makeReport({
      graph: {
        edges: [['root.ts', 'child.ts'] as [string, string]],
        nodes: ['root.ts', 'child.ts'],
      },
    })
    const messages = collect((log) => displayDependencyTree(report, log))
    const text = strip(messages.join(''))
    expect(text).toContain('root.ts')
    expect(text).toContain('child.ts')
  })

  it('limits root nodes to 5', () => {
    const nodes = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']
    const report = makeReport({ graph: { edges: [], nodes } })
    const messages = collect((log) => displayDependencyTree(report, log))
    const text = strip(messages.join(''))
    expect(text).toContain('and 1 more root files')
  })

  it('handles empty graph', () => {
    const messages = collect((log) => displayDependencyTree(makeReport(), log))
    const text = strip(messages.join(''))
    expect(text).toContain('No root files found')
  })

  it('renders leaf nodes in cyan', () => {
    const report = makeReport({
      graph: {
        edges: [['root.ts', 'leaf.ts'] as [string, string]],
        nodes: ['root.ts', 'leaf.ts'],
      },
    })
    const messages = collect((log) => displayDependencyTree(report, log))
    expect(messages.some((m) => m.includes('leaf.ts'))).toBe(true)
  })
})

// ─── displayDotFormat ───

describe('displayDotFormat', () => {
  it('outputs valid digraph structure', () => {
    const report = makeReport({
      graph: {
        edges: [['a.ts', 'b.ts'] as [string, string]],
        nodes: ['a.ts', 'b.ts'],
      },
    })
    const messages = collect((log) => displayDotFormat(report, log))
    expect(messages[0]).toBe('digraph dependencies {')
    expect(messages[messages.length - 1]).toBe('}')
  })

  it('outputs node labels', () => {
    const report = makeReport({
      graph: { edges: [], nodes: ['alpha.ts', 'beta.ts'] },
    })
    const messages = collect((log) => displayDotFormat(report, log))
    expect(messages.some((m) => m.includes('"alpha.ts" [label="alpha.ts"]'))).toBe(true)
    expect(messages.some((m) => m.includes('"beta.ts" [label="beta.ts"]'))).toBe(true)
  })

  it('outputs edge directives', () => {
    const report = makeReport({
      graph: {
        edges: [['a.ts', 'b.ts'] as [string, string]],
        nodes: ['a.ts', 'b.ts'],
      },
    })
    const messages = collect((log) => displayDotFormat(report, log))
    expect(messages.some((m) => m.includes('"a.ts" -> "b.ts"'))).toBe(true)
  })

  it('outputs empty line between nodes and edges sections', () => {
    const report = makeReport({
      graph: {
        edges: [['a', 'b'] as [string, string]],
        nodes: ['a', 'b'],
      },
    })
    const messages = collect((log) => displayDotFormat(report, log))
    expect(messages).toContain('')
  })

  it('handles empty graph', () => {
    const messages = collect((log) => displayDotFormat(makeReport(), log))
    expect(messages).toEqual(['digraph dependencies {', '', '}'])
  })
})

// ─── displayExternalModules ───

describe('displayExternalModules', () => {
  it('shows no external deps message when none found', () => {
    const messages = collect((log) => displayExternalModules(makeReport(), 'table', log))
    expect(messages).toHaveLength(1)
    expect(strip(messages[0])).toContain('No external dependencies found')
  })

  it('shows external modules in json format', () => {
    const report = makeReport({ externalModules: ['lodash', 'react'] })
    const messages = collect((log) => displayExternalModules(report, 'json', log))
    const parsed = JSON.parse(messages[0])
    expect(parsed.externalModules).toEqual(['lodash', 'react'])
  })

  it('shows module count in table format', () => {
    const report = makeReport({ externalModules: ['lodash', 'chalk'] })
    const messages = collect((log) => displayExternalModules(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('External modules (2)')
  })

  it('lists each module in table format', () => {
    const report = makeReport({ externalModules: ['lodash', 'chalk'] })
    const messages = collect((log) => displayExternalModules(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('lodash')
    expect(text).toContain('chalk')
  })

  it('shows single external module', () => {
    const report = makeReport({ externalModules: ['react'] })
    const messages = collect((log) => displayExternalModules(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('External modules (1)')
  })
})

// ─── displayFullReport ───

describe('displayFullReport', () => {
  it('outputs full report as JSON when format is json', () => {
    const report = makeReport({ filesAnalyzed: 42 })
    const messages = collect((log) => displayFullReport(report, 'json', log))
    const parsed = JSON.parse(messages[0])
    expect(parsed.filesAnalyzed).toBe(42)
  })

  it('delegates to displayDotFormat when format is dot', () => {
    const report = makeReport({
      graph: {
        edges: [['a', 'b'] as [string, string]],
        nodes: ['a', 'b'],
      },
    })
    const messages = collect((log) => displayFullReport(report, 'dot', log))
    expect(messages[0]).toBe('digraph dependencies {')
  })

  it('shows files analyzed count in table format', () => {
    const report = makeReport({ filesAnalyzed: 10 })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Files analyzed: 10')
  })

  it('shows no circular dependencies message when none found', () => {
    const messages = collect((log) => displayFullReport(makeReport(), 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('No circular dependencies')
  })

  it('shows circular dependencies with count', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }],
    })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Circular Dependencies (1)')
    expect(text).toContain('a -> b -> a')
  })

  it('truncates circular deps to 5 shown', () => {
    const cycles = Array.from({ length: 7 }, (_, i) => ({ cycle: [`a${i}`, `b${i}`, `a${i}`] }))
    const report = makeReport({ circularDependencies: cycles })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('and 2 more')
  })

  it('shows internal modules section when present', () => {
    const report = makeReport({ internalModules: ['src/a.ts', 'src/b.ts'] })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Internal Modules (2)')
    expect(text).toContain('src/a.ts')
    expect(text).toContain('src/b.ts')
  })

  it('truncates internal modules to 10 shown', () => {
    const mods = Array.from({ length: 15 }, (_, i) => `mod${i}`)
    const report = makeReport({ internalModules: mods })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('and 5 more')
  })

  it('shows external modules section when present', () => {
    const report = makeReport({ externalModules: ['lodash'] })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('External Modules (1)')
    expect(text).toContain('lodash')
  })

  it('truncates external modules to 10 shown', () => {
    const mods = Array.from({ length: 12 }, (_, i) => `pkg${i}`)
    const report = makeReport({ externalModules: mods })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('and 2 more')
  })

  it('shows orphan files section when present', () => {
    const report = makeReport({ orphanFiles: ['orphan.ts'] })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Orphan Files')
    expect(text).toContain('orphan.ts')
  })

  it('truncates orphan files to 5 shown', () => {
    const files = Array.from({ length: 8 }, (_, i) => `orphan${i}.ts`)
    const report = makeReport({ orphanFiles: files })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('and 3 more')
  })

  it('hides internal modules section when empty', () => {
    const messages = collect((log) => displayFullReport(makeReport(), 'table', log))
    const text = strip(messages.join(''))
    expect(text).not.toContain('Internal Modules')
  })

  it('hides external modules section when empty', () => {
    const messages = collect((log) => displayFullReport(makeReport(), 'table', log))
    const text = strip(messages.join(''))
    expect(text).not.toContain('External Modules')
  })

  it('hides orphan files section when empty', () => {
    const messages = collect((log) => displayFullReport(makeReport(), 'table', log))
    const text = strip(messages.join(''))
    expect(text).not.toContain('Orphan Files')
  })

  it('shows all sections together in table format', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['a', 'b', 'a'] }],
      externalModules: ['react'],
      filesAnalyzed: 3,
      internalModules: ['src/a.ts'],
      orphanFiles: ['alone.ts'],
    })
    const messages = collect((log) => displayFullReport(report, 'table', log))
    const text = strip(messages.join(''))
    expect(text).toContain('Dependency Analysis')
    expect(text).toContain('Files analyzed: 3')
    expect(text).toContain('Circular Dependencies')
    expect(text).toContain('Internal Modules')
    expect(text).toContain('External Modules')
    expect(text).toContain('Orphan Files')
  })
})
