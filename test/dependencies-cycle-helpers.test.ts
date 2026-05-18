import { describe, it, expect } from 'vitest'
import {
  finishNodeVisit,
  normalizeCycle,
  deduplicateCycles,
  recordCycle,
  processDependency,
  detectCyclesFromNode,
  detectCircularDependencies,
} from '../src/commands/dependencies-cycle-helpers.js'
import type { CircularDependency, CycleDetectionContext, DependencyGraph, DependencyNode } from '../src/commands/dependencies-helpers.js'

function makeNode(filePath: string, imports: string[] = []): DependencyNode {
  const importDetails = new Map<string, { column: number; end: number; line: number }>()
  for (const imp of imports) {
    importDetails.set(imp, { column: 1, end: 10, line: 1 })
  }
  return { filePath, importDetails, imports: new Set(imports) }
}

function makeGraph(nodes: [string, string[]][]): DependencyGraph {
  const nodesMap = new Map<string, DependencyNode>()
  for (const [path, imports] of nodes) {
    nodesMap.set(path, makeNode(path, imports))
  }
  return { nodes: nodesMap }
}

function makeContext(overrides: Partial<CycleDetectionContext> = {}): CycleDetectionContext {
  return {
    cycles: [],
    graph: makeGraph([]),
    maxDepth: 50,
    path: [],
    recursionStack: new Set(),
    visited: new Set(),
    ...overrides,
  }
}

// ─── finishNodeVisit ──────────────────────────────────
describe('finishNodeVisit', () => {
  it('removes node from path and recursion stack', () => {
    const path = ['a', 'b', 'c']
    const stack = new Set(['a', 'b', 'c'])
    finishNodeVisit('c', path, stack)
    expect(path).toEqual(['a', 'b'])
    expect(stack.has('c')).toBe(false)
    expect(stack.has('b')).toBe(true)
  })

  it('handles empty path', () => {
    const path: string[] = []
    const stack = new Set<string>()
    finishNodeVisit('x', path, stack)
    expect(path).toEqual([])
  })
})

// ─── normalizeCycle ───────────────────────────────────
describe('normalizeCycle', () => {
  it('rotates to start with lexicographically smallest element', () => {
    const result = normalizeCycle(['b', 'c', 'a', 'b'])
    expect(result[0]).toBe('a')
    expect(result).toEqual(['a', 'b', 'c', 'a'])
  })

  it('handles already normalized cycle', () => {
    const result = normalizeCycle(['a', 'b', 'c', 'a'])
    expect(result[0]).toBe('a')
  })

  it('returns copy of cycle when withoutLast is empty', () => {
    const result = normalizeCycle(['a'])
    expect(result).toEqual(['a'])
  })

  it('handles two-element cycle', () => {
    const result = normalizeCycle(['x', 'x'])
    expect(result).toEqual(['x', 'x'])
  })
})

// ─── deduplicateCycles ────────────────────────────────
describe('deduplicateCycles', () => {
  it('removes duplicate cycles', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['a', 'b', 'c', 'a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['b', 'c', 'a', 'b'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  it('keeps distinct cycles', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['a', 'b', 'a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['c', 'd', 'c'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  it('returns empty for empty input', () => {
    expect(deduplicateCycles([])).toEqual([])
  })
})

// ─── recordCycle ──────────────────────────────────────
describe('recordCycle', () => {
  it('records a cycle when import detail exists', () => {
    const node = makeNode('a.ts', ['b.ts'])
    const context = { cycles: [] as CircularDependency[], path: ['b.ts', 'a.ts'] }
    recordCycle('b.ts', node, context)
    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toContain('b.ts')
  })

  it('does not record cycle when no import detail', () => {
    const node = makeNode('a.ts', ['c.ts'])
    const context = { cycles: [] as CircularDependency[], path: ['b.ts', 'a.ts'] }
    recordCycle('b.ts', node, context)
    expect(context.cycles).toHaveLength(0)
  })
})

// ─── processDependency ────────────────────────────────
describe('processDependency', () => {
  it('calls detectCyclesFromNode for unvisited dependencies', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', []],
    ])
    const context = makeContext({
      graph,
      path: ['a.ts'],
      visited: new Set(['a.ts']),
      recursionStack: new Set(['a.ts']),
    })
    const node = graph.nodes.get('a.ts')!
    processDependency('b.ts', node, context)
    expect(context.visited.has('b.ts')).toBe(true)
  })

  it('records cycle when dependency is in recursion stack', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['a.ts']],
    ])
    const context = makeContext({
      graph,
      path: ['a.ts', 'b.ts'],
      visited: new Set(['a.ts', 'b.ts']),
      recursionStack: new Set(['a.ts', 'b.ts']),
    })
    const node = graph.nodes.get('b.ts')!
    processDependency('a.ts', node, context)
    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('skips dependency not in graph', () => {
    const graph = makeGraph([['a.ts', ['missing.ts']]])
    const context = makeContext({ graph, path: ['a.ts'] })
    const node = graph.nodes.get('a.ts')!
    processDependency('missing.ts', node, context)
    expect(context.cycles).toHaveLength(0)
  })
})

// ─── detectCyclesFromNode ─────────────────────────────
describe('detectCyclesFromNode', () => {
  it('detects a simple cycle', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['a.ts']],
    ])
    const context = makeContext({ graph })
    detectCyclesFromNode('a.ts', context)
    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('does not detect cycles in acyclic graph', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['c.ts']],
      ['c.ts', []],
    ])
    const context = makeContext({ graph })
    detectCyclesFromNode('a.ts', context)
    expect(context.cycles).toHaveLength(0)
  })

  it('respects maxDepth', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['c.ts']],
      ['c.ts', ['d.ts']],
    ])
    const context = makeContext({ graph, maxDepth: 1 })
    detectCyclesFromNode('a.ts', context)
    expect(context.cycles).toHaveLength(0)
  })

  it('handles missing node gracefully', () => {
    const graph = makeGraph([])
    const context = makeContext({ graph })
    detectCyclesFromNode('missing.ts', context)
    expect(context.cycles).toHaveLength(0)
  })

  it('detects three-node cycle', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['c.ts']],
      ['c.ts', ['a.ts']],
    ])
    const context = makeContext({ graph })
    detectCyclesFromNode('a.ts', context)
    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── detectCircularDependencies ──────────────────────
describe('detectCircularDependencies', () => {
  it('returns empty for graph with no cycles', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', []],
    ])
    const result = detectCircularDependencies(graph)
    expect(result).toHaveLength(0)
  })

  it('detects cycles across all nodes', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['a.ts']],
    ])
    const result = detectCircularDependencies(graph)
    expect(result).toHaveLength(1)
  })

  it('returns empty for empty graph', () => {
    const graph = makeGraph([])
    const result = detectCircularDependencies(graph)
    expect(result).toHaveLength(0)
  })

  it('deduplicates cycles', () => {
    const graph = makeGraph([
      ['a.ts', ['b.ts']],
      ['b.ts', ['a.ts']],
    ])
    const result = detectCircularDependencies(graph)
    expect(result).toHaveLength(1)
  })
})
