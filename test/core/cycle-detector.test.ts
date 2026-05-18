import { describe, expect, it } from 'vitest'

import { CycleDetector } from '../../src/core/dep-graph/cycle-detector.js'

import type { DependencyGraph } from '../../src/core/dep-graph/types.js'

// ─── Helpers ───

function node(id: string) {
  return { id, label: id, type: 'internal' as const }
}

function edge(from: string, to: string) {
  return { from, to, type: 'import' as const, importedNames: [] }
}

function makeGraph(nodes: string[], edges: [string, string][]): DependencyGraph {
  const nodeMap = new Map<string, ReturnType<typeof node>>()
  for (const id of nodes) nodeMap.set(id, node(id))
  return { nodes: nodeMap, edges: edges.map(([f, t]) => edge(f, t)) }
}

// ─── hasCycles ───

describe('CycleDetector hasCycles', () => {
  it('returns false for empty graph', () => {
    const detector = new CycleDetector()
    expect(detector.hasCycles({ nodes: new Map(), edges: [] })).toBe(false)
  })

  it('returns false for single node no edges', () => {
    const graph = makeGraph(['a'], [])
    expect(new CycleDetector().hasCycles(graph)).toBe(false)
  })

  it('returns false for DAG (no cycles)', () => {
    const graph = makeGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
    expect(new CycleDetector().hasCycles(graph)).toBe(false)
  })

  it('returns true for simple cycle', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
    expect(new CycleDetector().hasCycles(graph)).toBe(true)
  })

  it('returns true for self-loop', () => {
    const graph = makeGraph(['a'], [['a', 'a']])
    expect(new CycleDetector().hasCycles(graph)).toBe(true)
  })

  it('returns true for longer cycle', () => {
    const graph = makeGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']])
    expect(new CycleDetector().hasCycles(graph)).toBe(true)
  })

  it('returns false for disconnected DAG', () => {
    const graph = makeGraph(['a', 'b', 'c', 'd'], [['a', 'b'], ['c', 'd']])
    expect(new CycleDetector().hasCycles(graph)).toBe(false)
  })

  it('detects cycle in one component of disconnected graph', () => {
    const graph = makeGraph(['a', 'b', 'c', 'd'], [['a', 'b'], ['b', 'a'], ['c', 'd']])
    expect(new CycleDetector().hasCycles(graph)).toBe(true)
  })
})

// ─── detectCycles ───

describe('CycleDetector detectCycles', () => {
  it('returns empty for DAG', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b']])
    expect(new CycleDetector().detectCycles(graph)).toEqual([])
  })

  it('detects simple 2-node cycle', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles.length).toBe(1)
    expect(cycles[0].length).toBe(2)
    expect(cycles[0].severity).toBe('high')
  })

  it('detects 3-node cycle', () => {
    const graph = makeGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']])
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles.length).toBe(1)
    expect(cycles[0].length).toBe(3)
    expect(cycles[0].severity).toBe('medium')
  })

  it('detects cycle with correct node names', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles[0].cycle).toContain('a')
    expect(cycles[0].cycle).toContain('b')
  })

  it('returns empty for empty graph', () => {
    expect(new CycleDetector().detectCycles({ nodes: new Map(), edges: [] })).toEqual([])
  })

  it('deduplicates cycles', () => {
    const graph = makeGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']])
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles.length).toBe(1)
  })

  it('assigns high severity for length <= 2', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles[0].severity).toBe('high')
  })

  it('assigns medium severity for length 3-4', () => {
    const graph = makeGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']])
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles[0].severity).toBe('medium')
  })

  it('assigns low severity for length >= 5', () => {
    const nodes = ['a', 'b', 'c', 'd', 'e']
    const edges: [string, string][] = [
      ['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'a'],
    ]
    const graph = makeGraph(nodes, edges)
    const cycles = new CycleDetector().detectCycles(graph)
    expect(cycles[0].severity).toBe('low')
  })
})

// ─── findStronglyConnectedComponents ───

describe('CycleDetector findStronglyConnectedComponents', () => {
  it('returns empty for DAG', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b']])
    expect(new CycleDetector().findStronglyConnectedComponents(graph)).toEqual([])
  })

  it('finds 2-node SCC', () => {
    const graph = makeGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
    const sccs = new CycleDetector().findStronglyConnectedComponents(graph)
    expect(sccs.length).toBe(1)
    expect(sccs[0].length).toBe(2)
  })

  it('finds self-loop as SCC', () => {
    const graph = makeGraph(['a'], [['a', 'a']])
    const sccs = new CycleDetector().findStronglyConnectedComponents(graph)
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual(['a'])
  })

  it('returns empty for single node no self-loop', () => {
    const graph = makeGraph(['a'], [])
    expect(new CycleDetector().findStronglyConnectedComponents(graph)).toEqual([])
  })

  it('finds multiple SCCs', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [['a', 'b'], ['b', 'a'], ['c', 'd'], ['d', 'c']],
    )
    const sccs = new CycleDetector().findStronglyConnectedComponents(graph)
    expect(sccs.length).toBe(2)
  })
})

// ─── suggestFix ───

describe('CycleDetector suggestFix', () => {
  it('suggests extraction for 2-node cycle', () => {
    const detector = new CycleDetector()
    const suggestion = detector.suggestFix({ cycle: ['a', 'b'], length: 2, severity: 'high' })
    expect(suggestion).toContain('extracting')
    expect(suggestion).toContain('"a"')
    expect(suggestion).toContain('"b"')
  })

  it('suggests removing self-dependency for 1-node cycle', () => {
    const detector = new CycleDetector()
    const suggestion = detector.suggestFix({ cycle: ['a'], length: 1, severity: 'high' })
    expect(suggestion).toContain('Self-dependency')
    expect(suggestion).toContain('"a"')
  })

  it('suggests DI or event emitter for longer cycle', () => {
    const detector = new CycleDetector()
    const suggestion = detector.suggestFix({ cycle: ['a', 'b', 'c'], length: 3, severity: 'medium' })
    expect(suggestion).toContain('dependency injection')
    expect(suggestion).toContain('a -> b -> c -> a')
  })
})
