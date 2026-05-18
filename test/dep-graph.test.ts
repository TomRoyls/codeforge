import { GraphBuilder } from '../src/core/dep-graph/graph-builder.js'
import { CycleDetector } from '../src/core/dep-graph/cycle-detector.js'
import { GraphRenderer } from '../src/core/dep-graph/graph-renderer.js'
import type { GraphNode, GraphEdge, DependencyGraph, CycleInfo } from '../src/core/dep-graph/types.js'

function makeNode(overrides: Partial<GraphNode> & { id: string }): GraphNode {
  return {
    label: overrides.id,
    type: 'internal',
    ...overrides,
  }
}

function makeEdge(from: string, to: string, type: GraphEdge['type'] = 'import', names: string[] = []): GraphEdge {
  return { from, to, type, importedNames: names }
}

function makeGraph(nodeIds: string[], edges: GraphEdge[]): DependencyGraph {
  const nodes = new Map<string, GraphNode>()
  for (const id of nodeIds) {
    nodes.set(id, makeNode({ id }))
  }
  return { nodes, edges }
}

// ─── GraphBuilder – addNode / addEdge / build ─────────────────────────

describe('GraphBuilder', () => {
  describe('addNode and build', () => {
    it('builds an empty graph', () => {
      const builder = new GraphBuilder()
      const graph = builder.build()
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges).toEqual([])
    })

    it('adds a single node', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      const graph = builder.build()
      expect(graph.nodes.size).toBe(1)
      expect(graph.nodes.get('a')?.label).toBe('a')
    })

    it('overwrites a node with the same id', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a', label: 'first' }))
      builder.addNode(makeNode({ id: 'a', label: 'second' }))
      const graph = builder.build()
      expect(graph.nodes.size).toBe(1)
      expect(graph.nodes.get('a')?.label).toBe('second')
    })

    it('adds multiple nodes', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      expect(builder.build().nodes.size).toBe(3)
    })

    it('preserves node metadata', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a', type: 'external', metadata: { version: '1.0' } }))
      const node = builder.build().nodes.get('a')!
      expect(node.type).toBe('external')
      expect(node.metadata).toEqual({ version: '1.0' })
    })
  })

  describe('addEdge', () => {
    it('adds a single edge', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const graph = builder.build()
      expect(graph.edges).toHaveLength(1)
      expect(graph.edges[0]!.from).toBe('a')
      expect(graph.edges[0]!.to).toBe('b')
    })

    it('adds multiple edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      builder.addEdge(makeEdge('b', 'c'))
      expect(builder.build().edges).toHaveLength(3)
    })

    it('preserves edge type', () => {
      const builder = new GraphBuilder()
      builder.addEdge(makeEdge('a', 'b', 'dynamic-import'))
      builder.addEdge(makeEdge('a', 'c', 'type-import'))
      builder.addEdge(makeEdge('b', 'c', 're-export'))
      const edges = builder.build().edges
      expect(edges[0]!.type).toBe('dynamic-import')
      expect(edges[1]!.type).toBe('type-import')
      expect(edges[2]!.type).toBe('re-export')
    })

    it('preserves imported names on edges', () => {
      const builder = new GraphBuilder()
      builder.addEdge(makeEdge('a', 'b', 'import', ['foo', 'bar']))
      const edge = builder.build().edges[0]!
      expect(edge.importedNames).toEqual(['foo', 'bar'])
    })
  })

  // ─── GraphBuilder – reset ───────────────────────────────────────────

  describe('reset', () => {
    it('clears all nodes and edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.reset()
      const graph = builder.build()
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges).toEqual([])
    })

    it('allows building again after reset', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.reset()
      builder.addNode(makeNode({ id: 'x' }))
      builder.addNode(makeNode({ id: 'y' }))
      builder.addEdge(makeEdge('x', 'y'))
      const graph = builder.build()
      expect(graph.nodes.size).toBe(2)
      expect(graph.edges).toHaveLength(1)
    })
  })

  // ─── GraphBuilder – getDependencies / getDependents ──────────────────

  describe('getDependencies', () => {
    it('returns outgoing dependencies', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      expect(builder.getDependencies('a')).toEqual(['b', 'c'])
    })

    it('returns empty array for node with no outgoing edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      expect(builder.getDependencies('a')).toEqual([])
    })

    it('returns empty array for unknown node', () => {
      const builder = new GraphBuilder()
      expect(builder.getDependencies('nonexistent')).toEqual([])
    })
  })

  describe('getDependents', () => {
    it('returns incoming dependencies', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'c'))
      builder.addEdge(makeEdge('b', 'c'))
      expect(builder.getDependents('c')).toEqual(['a', 'b'])
    })

    it('returns empty array for node with no incoming edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      expect(builder.getDependents('a')).toEqual([])
    })

    it('returns empty array for unknown node', () => {
      const builder = new GraphBuilder()
      expect(builder.getDependents('nonexistent')).toEqual([])
    })
  })

  // ─── GraphBuilder – getSubgraph ─────────────────────────────────────

  describe('getSubgraph', () => {
    it('returns subgraph from root with depth 0', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const sub = builder.getSubgraph('a', 0)
      expect(sub.nodes.has('a')).toBe(true)
    })

    it('returns subgraph with depth 1', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'c'))
      const sub = builder.getSubgraph('a', 1)
      expect(sub.nodes.has('a')).toBe(true)
      expect(sub.nodes.has('b')).toBe(true)
    })

    it('does not exceed depth limit', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'c'))
      const sub = builder.getSubgraph('a', 1)
      expect(sub.nodes.has('c')).toBe(false)
    })

    it('returns empty graph for nonexistent root', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      const sub = builder.getSubgraph('nonexistent', 10)
      expect(sub.nodes.size).toBe(0)
    })
  })

  // ─── GraphBuilder – merge ───────────────────────────────────────────

  describe('merge', () => {
    it('merges two graphs', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const other: DependencyGraph = {
        nodes: new Map([['c', makeNode({ id: 'c' })]]),
        edges: [makeEdge('a', 'c')],
      }
      const merged = builder.merge(other)
      expect(merged.nodes.size).toBe(3)
      expect(merged.edges).toHaveLength(2)
    })

    it('does not duplicate nodes', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a', label: 'original' }))
      const other: DependencyGraph = {
        nodes: new Map([['a', makeNode({ id: 'a', label: 'other' })]]),
        edges: [],
      }
      const merged = builder.merge(other)
      expect(merged.nodes.size).toBe(1)
      expect(merged.nodes.get('a')?.label).toBe('original')
    })

    it('does not duplicate edges', () => {
      const builder = new GraphBuilder()
      builder.addEdge(makeEdge('a', 'b'))
      const other: DependencyGraph = {
        nodes: new Map(),
        edges: [makeEdge('a', 'b')],
      }
      const merged = builder.merge(other)
      expect(merged.edges).toHaveLength(1)
    })

    it('merges empty graphs', () => {
      const builder = new GraphBuilder()
      const other: DependencyGraph = { nodes: new Map(), edges: [] }
      const merged = builder.merge(other)
      expect(merged.nodes.size).toBe(0)
      expect(merged.edges).toHaveLength(0)
    })
  })

  // ─── GraphBuilder – buildFromSource ─────────────────────────────────

  describe('buildFromSource', () => {
    it('parses a static import', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import { foo } from './utils'", 'src/main.ts')
      const graph = builder.build()
      expect(graph.nodes.size).toBeGreaterThanOrEqual(2)
      expect(graph.edges.some((e) => e.type === 'import')).toBe(true)
    })

    it('parses a re-export', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("export { foo } from './utils'", 'src/index.ts')
      const graph = builder.build()
      expect(graph.edges.some((e) => e.type === 're-export')).toBe(true)
    })

    it('parses a dynamic import', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("const m = import('./lazy')", 'src/main.ts')
      const graph = builder.build()
      expect(graph.edges.some((e) => e.type === 'dynamic-import')).toBe(true)
    })

    it('parses a type import', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import type { Config } from './types'", 'src/main.ts')
      const graph = builder.build()
      expect(graph.edges.some((e) => e.type === 'type-import')).toBe(true)
    })

    it('classifies builtin modules', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import * as fs from 'fs'", 'src/main.ts')
      const graph = builder.build()
      const fsNode = graph.nodes.get('fs')
      expect(fsNode?.type).toBe('builtin')
    })

    it('classifies node: prefixed modules as builtin', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import * as path from 'node:path'", 'src/main.ts')
      const graph = builder.build()
      const pathNode = graph.nodes.get('node:path')
      expect(pathNode?.type).toBe('builtin')
    })

    it('classifies external modules', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import React from 'react'", 'src/main.ts')
      const graph = builder.build()
      const reactNode = graph.nodes.get('react')
      expect(reactNode?.type).toBe('external')
    })

    it('classifies relative imports as internal', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import { foo } from './helpers'", 'src/main.ts')
      const graph = builder.build()
      const helperNode = graph.nodes.get('./helpers')
      expect(helperNode?.type).toBe('internal')
    })

    it('extracts imported names', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import { foo, bar } from './utils'", 'src/main.ts')
      const graph = builder.build()
      const edge = graph.edges.find((e) => e.to === './utils')
      expect(edge?.importedNames).toContain('foo')
      expect(edge?.importedNames).toContain('bar')
    })

    it('handles import with aliased names', () => {
      const builder = new GraphBuilder()
      builder.buildFromSource("import { foo as bar } from './utils'", 'src/main.ts')
      const graph = builder.build()
      const edge = graph.edges.find((e) => e.to === './utils')
      expect(edge?.importedNames).toContain('foo')
    })
  })

  // ─── GraphBuilder – getMetrics ──────────────────────────────────────

  describe('getMetrics', () => {
    it('returns zeros for empty graph', () => {
      const builder = new GraphBuilder()
      const metrics = builder.getMetrics()
      expect(metrics.totalNodes).toBe(0)
      expect(metrics.totalEdges).toBe(0)
      expect(metrics.avgDegree).toBe(0)
      expect(metrics.maxDepth).toBe(0)
      expect(metrics.cycleCount).toBe(0)
      expect(metrics.orphanCount).toBe(0)
    })

    it('counts total nodes and edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const metrics = builder.getMetrics()
      expect(metrics.totalNodes).toBe(2)
      expect(metrics.totalEdges).toBe(1)
    })

    it('computes avgDegree', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      const metrics = builder.getMetrics()
      expect(metrics.avgDegree).toBeCloseTo(0.67, 1)
    })

    it('counts orphans (nodes with no edges)', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'orphan' }))
      builder.addEdge(makeEdge('a', 'b'))
      const metrics = builder.getMetrics()
      expect(metrics.orphanCount).toBe(1)
    })

    it('counts cycles', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'a'))
      const metrics = builder.getMetrics()
      expect(metrics.cycleCount).toBeGreaterThan(0)
    })

    it('computes maxDepth', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'c'))
      const metrics = builder.getMetrics()
      expect(metrics.maxDepth).toBe(2)
    })
  })
})

// ─── CycleDetector ────────────────────────────────────────────────────

describe('CycleDetector', () => {
  describe('hasCycles', () => {
    it('returns false for empty graph', () => {
      const detector = new CycleDetector()
      const graph = makeGraph([], [])
      expect(detector.hasCycles(graph)).toBe(false)
    })

    it('returns false for acyclic graph', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
      ])
      expect(detector.hasCycles(graph)).toBe(false)
    })

    it('returns true for simple cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
      ])
      expect(detector.hasCycles(graph)).toBe(true)
    })

    it('returns true for self-loop', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a'], [makeEdge('a', 'a')])
      expect(detector.hasCycles(graph)).toBe(true)
    })

    it('returns true for three-node cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'a'),
      ])
      expect(detector.hasCycles(graph)).toBe(true)
    })

    it('returns false for disconnected acyclic components', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c', 'd'], [
        makeEdge('a', 'b'),
        makeEdge('c', 'd'),
      ])
      expect(detector.hasCycles(graph)).toBe(false)
    })

    it('returns true when one component has a cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c', 'd'], [
        makeEdge('a', 'b'),
        makeEdge('c', 'd'),
        makeEdge('d', 'c'),
      ])
      expect(detector.hasCycles(graph)).toBe(true)
    })
  })

  describe('detectCycles', () => {
    it('returns empty array for acyclic graph', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
      expect(detector.detectCycles(graph)).toEqual([])
    })

    it('detects a two-node cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
      ])
      const cycles = detector.detectCycles(graph)
      expect(cycles.length).toBe(1)
      expect(cycles[0]!.length).toBe(2)
    })

    it('detects a three-node cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'a'),
      ])
      const cycles = detector.detectCycles(graph)
      expect(cycles.length).toBe(1)
      expect(cycles[0]!.length).toBe(3)
    })

    it('deduplicates cycles', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'a'),
        makeEdge('b', 'a'),
      ])
      const cycles = detector.detectCycles(graph)
      for (const cycle of cycles) {
        const sorted = [...cycle.cycle].sort().join(',')
        const duplicates = cycles.filter(
          (c) => [...c.cycle].sort().join(',') === sorted,
        )
        expect(duplicates.length).toBe(1)
      }
    })

    it('assigns high severity to short cycles', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
      ])
      const cycles = detector.detectCycles(graph)
      expect(cycles[0]!.severity).toBe('high')
    })

    it('assigns medium severity to medium cycles', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c', 'd'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'd'),
        makeEdge('d', 'a'),
      ])
      const cycles = detector.detectCycles(graph)
      expect(cycles[0]!.severity).toBe('medium')
    })

    it('assigns low severity to long cycles', () => {
      const detector = new CycleDetector()
      const nodeIds = ['a', 'b', 'c', 'd', 'e', 'f']
      const edges: GraphEdge[] = []
      for (let i = 0; i < nodeIds.length - 1; i++) {
        edges.push(makeEdge(nodeIds[i]!, nodeIds[i + 1]!))
      }
      edges.push(makeEdge(nodeIds[nodeIds.length - 1]!, nodeIds[0]!))
      const graph = makeGraph(nodeIds, edges)
      const cycles = detector.detectCycles(graph)
      expect(cycles[0]!.severity).toBe('low')
    })
  })

  describe('findStronglyConnectedComponents', () => {
    it('returns empty for acyclic graph', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs).toEqual([])
    })

    it('finds SCC with two-node cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
      ])
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs.length).toBe(1)
      expect(sccs[0]).toEqual(expect.arrayContaining(['a', 'b']))
    })

    it('finds SCC with three-node cycle', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'a'),
      ])
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs.length).toBe(1)
      expect(sccs[0]).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    })

    it('finds self-loop as SCC', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a'], [makeEdge('a', 'a')])
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs.length).toBe(1)
      expect(sccs[0]).toContain('a')
    })

    it('excludes single nodes without self-loops', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs).toEqual([])
    })

    it('finds multiple separate SCCs', () => {
      const detector = new CycleDetector()
      const graph = makeGraph(['a', 'b', 'c', 'd'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
        makeEdge('c', 'd'),
        makeEdge('d', 'c'),
      ])
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs.length).toBe(2)
    })
  })

  describe('suggestFix', () => {
    it('suggests extraction for two-node cycle', () => {
      const detector = new CycleDetector()
      const fix = detector.suggestFix({ cycle: ['a', 'b'], length: 2, severity: 'high' })
      expect(fix).toContain('extracting')
      expect(fix).toContain('"a"')
      expect(fix).toContain('"b"')
    })

    it('suggests removing self-dependency', () => {
      const detector = new CycleDetector()
      const fix = detector.suggestFix({ cycle: ['a'], length: 1, severity: 'high' })
      expect(fix).toContain('Self-dependency')
      expect(fix).toContain('"a"')
    })

    it('suggests dependency injection for longer cycles', () => {
      const detector = new CycleDetector()
      const fix = detector.suggestFix({
        cycle: ['a', 'b', 'c'],
        length: 3,
        severity: 'medium',
      })
      expect(fix).toContain('dependency injection')
    })
  })
})

// ─── GraphRenderer ────────────────────────────────────────────────────

describe('GraphRenderer', () => {
  const renderer = new GraphRenderer()

  describe('toDot', () => {
    it('renders an empty graph', () => {
      const graph = makeGraph([], [])
      const dot = renderer.toDot(graph)
      expect(dot).toContain('digraph dependencies')
      expect(dot).toContain('}')
    })

    it('renders nodes with correct colors by type', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a', type: 'internal' })],
          ['b', makeNode({ id: 'b', type: 'external' })],
          ['c', makeNode({ id: 'c', type: 'builtin' })],
        ]),
        edges: [],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('lightblue')
      expect(dot).toContain('lightyellow')
      expect(dot).toContain('lightgray')
    })

    it('renders edges', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
      const dot = renderer.toDot(graph)
      expect(dot).toContain('"a" -> "b"')
    })

    it('renders dynamic-import edges with dashed style', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b', 'dynamic-import')])
      const dot = renderer.toDot(graph)
      expect(dot).toContain('style=dashed')
    })

    it('renders type-import edges with dotted style', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b', 'type-import')])
      const dot = renderer.toDot(graph)
      expect(dot).toContain('style=dotted')
    })

    it('renders edge labels for imported names', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b', 'import', ['foo', 'bar'])])
      const dot = renderer.toDot(graph)
      expect(dot).toContain('label="foo, bar"')
    })

    it('escapes quotes in labels', () => {
      const graph: DependencyGraph = {
        nodes: new Map([['a', makeNode({ id: 'a', label: 'module "test"' })]]),
        edges: [],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('module \\"test\\"')
    })
  })

  describe('toJSON', () => {
    it('renders valid JSON', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
      const json = renderer.toJSON(graph)
      const parsed = JSON.parse(json)
      expect(parsed.nodes).toHaveLength(2)
      expect(parsed.edges).toHaveLength(1)
    })

    it('renders empty graph as valid JSON', () => {
      const graph = makeGraph([], [])
      const json = renderer.toJSON(graph)
      const parsed = JSON.parse(json)
      expect(parsed.nodes).toEqual([])
      expect(parsed.edges).toEqual([])
    })
  })

  describe('toMermaid', () => {
    it('renders edges as mermaid flowchart', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('graph LR')
      expect(mermaid).toContain('-->')
    })

    it('renders imported names as edge labels', () => {
      const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b', 'import', ['foo'])])
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('|foo|')
    })

    it('renders orphan nodes', () => {
      const graph = makeGraph(['a', 'b'], [])
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('["a"]')
      expect(mermaid).toContain('["b"]')
    })

    it('renders empty graph', () => {
      const graph = makeGraph([], [])
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('graph LR')
    })
  })

  describe('toAdjacencyList', () => {
    it('returns empty map for empty graph', () => {
      const graph = makeGraph([], [])
      const adj = renderer.toAdjacencyList(graph)
      expect(adj.size).toBe(0)
    })

    it('builds adjacency from edges', () => {
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('a', 'c'),
      ])
      const adj = renderer.toAdjacencyList(graph)
      expect(adj.get('a')).toEqual(['b', 'c'])
      expect(adj.get('b')).toEqual([])
      expect(adj.get('c')).toEqual([])
    })

    it('handles edges to nodes not in graph', () => {
      const graph = makeGraph(['a'], [makeEdge('a', 'unknown')])
      const adj = renderer.toAdjacencyList(graph)
      expect(adj.get('a')).toEqual(['unknown'])
    })
  })

  describe('toFlatList', () => {
    it('sorts by name', () => {
      const graph = makeGraph(['c', 'a', 'b'], [])
      const list = renderer.toFlatList(graph, 'name')
      expect(list).toEqual(['a', 'b', 'c'])
    })

    it('sorts by degree', () => {
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('a', 'c'),
        makeEdge('b', 'c'),
      ])
      const list = renderer.toFlatList(graph, 'degree')
      expect(list[0]).toBe('a')
    })

    it('sorts by depth', () => {
      const graph = makeGraph(['a', 'b', 'c'], [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
      ])
      const list = renderer.toFlatList(graph, 'depth')
      expect(list[0]).toBe('a')
    })

    it('returns empty for empty graph', () => {
      const graph = makeGraph([], [])
      expect(renderer.toFlatList(graph, 'name')).toEqual([])
      expect(renderer.toFlatList(graph, 'degree')).toEqual([])
      expect(renderer.toFlatList(graph, 'depth')).toEqual([])
    })

    it('assigns depth 0 to orphan nodes', () => {
      const graph = makeGraph(['orphan'], [])
      const list = renderer.toFlatList(graph, 'depth')
      expect(list).toContain('orphan')
    })
  })
})

// ─── Integration – Builder + CycleDetector + Renderer ─────────────────

describe('integration', () => {
  it('detects cycle in a real dependency graph', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'app' }))
    builder.addNode(makeNode({ id: 'router' }))
    builder.addNode(makeNode({ id: 'store' }))
    builder.addEdge(makeEdge('app', 'router'))
    builder.addEdge(makeEdge('router', 'store'))
    builder.addEdge(makeEdge('store', 'app'))

    const graph = builder.build()
    const detector = new CycleDetector()
    expect(detector.hasCycles(graph)).toBe(true)

    const cycles = detector.detectCycles(graph)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a real dependency graph as DOT', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'app', type: 'internal' }))
    builder.addNode(makeNode({ id: 'react', type: 'external' }))
    builder.addNode(makeNode({ id: 'fs', type: 'builtin' }))
    builder.addEdge(makeEdge('app', 'react', 'import', ['useState']))
    builder.addEdge(makeEdge('app', 'fs', 'import'))

    const graph = builder.build()
    const renderer = new GraphRenderer()
    const dot = renderer.toDot(graph)
    expect(dot).toContain('digraph')
    expect(dot).toContain('lightblue')
    expect(dot).toContain('lightyellow')
    expect(dot).toContain('lightgray')
  })

  it('computes metrics for a complex graph', () => {
    const builder = new GraphBuilder()
    const nodes = ['app', 'router', 'store', 'utils', 'orphan']
    for (const id of nodes) {
      builder.addNode(makeNode({ id }))
    }
    builder.addEdge(makeEdge('app', 'router'))
    builder.addEdge(makeEdge('app', 'store'))
    builder.addEdge(makeEdge('router', 'utils'))
    builder.addEdge(makeEdge('store', 'utils'))

    const metrics = builder.getMetrics()
    expect(metrics.totalNodes).toBe(5)
    expect(metrics.totalEdges).toBe(4)
    expect(metrics.orphanCount).toBe(1)
    expect(metrics.cycleCount).toBe(0)
  })

  it('builds subgraph and renders it', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))
    builder.addNode(makeNode({ id: 'd' }))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.addEdge(makeEdge('c', 'd'))

    const sub = builder.getSubgraph('a', 1)
    const renderer = new GraphRenderer()
    const dot = renderer.toDot(sub)
    expect(dot).toContain('"a"')
    expect(dot).toContain('"b"')
  })

  it('merges graphs and detects cycles', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addEdge(makeEdge('a', 'b'))

    const other: DependencyGraph = {
      nodes: new Map([['c', makeNode({ id: 'c' })]]),
      edges: [makeEdge('b', 'c'), makeEdge('c', 'a')],
    }

    const merged = builder.merge(other)
    const detector = new CycleDetector()
    expect(detector.hasCycles(merged)).toBe(true)
  })

  it('builds from source and computes metrics', () => {
    const builder = new GraphBuilder()
    const source = [
      "import { readFileSync } from 'fs'",
      "import React from 'react'",
      "import { helper } from './utils'",
      "const lazy = import('./lazy')",
    ].join('\n')
    builder.buildFromSource(source, 'src/main.ts')
    const metrics = builder.getMetrics()
    expect(metrics.totalNodes).toBeGreaterThanOrEqual(4)
    expect(metrics.totalEdges).toBeGreaterThanOrEqual(3)
  })

  it('renders adjacency list from builder output', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    const graph = builder.build()
    const renderer = new GraphRenderer()
    const adj = renderer.toAdjacencyList(graph)
    expect(adj.get('a')).toEqual(['b'])
    expect(adj.get('b')).toEqual(['c'])
    expect(adj.get('c')).toEqual([])
  })

  it('finds SCCs after merging two cyclic graphs', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'a'))

    const other: DependencyGraph = {
      nodes: new Map([
        ['c', makeNode({ id: 'c' })],
        ['d', makeNode({ id: 'd' })],
      ]),
      edges: [makeEdge('c', 'd'), makeEdge('d', 'c')],
    }

    const merged = builder.merge(other)
    const detector = new CycleDetector()
    const sccs = detector.findStronglyConnectedComponents(merged)
    expect(sccs.length).toBe(2)
  })
})
