import { describe, it, expect } from 'vitest'
import { GraphBuilder } from '../../src/core/dep-graph/graph-builder.js'
import { CycleDetector } from '../../src/core/dep-graph/cycle-detector.js'
import { GraphRenderer } from '../../src/core/dep-graph/graph-renderer.js'
import type { GraphNode, GraphEdge, DependencyGraph } from '../../src/core/dep-graph/types.js'

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

function makeSimpleGraph(): DependencyGraph {
  const nodes = new Map<string, GraphNode>()
  nodes.set('a', makeNode({ id: 'a' }))
  nodes.set('b', makeNode({ id: 'b' }))
  nodes.set('c', makeNode({ id: 'c' }))
  const edges: GraphEdge[] = [
    makeEdge('a', 'b'),
    makeEdge('b', 'c'),
  ]
  return { nodes, edges }
}

function makeCyclicGraph(): DependencyGraph {
  const nodes = new Map<string, GraphNode>()
  nodes.set('a', makeNode({ id: 'a' }))
  nodes.set('b', makeNode({ id: 'b' }))
  nodes.set('c', makeNode({ id: 'c' }))
  const edges: GraphEdge[] = [
    makeEdge('a', 'b'),
    makeEdge('b', 'c'),
    makeEdge('c', 'a'),
  ]
  return { nodes, edges }
}

describe('GraphBuilder', () => {
  describe('addNode', () => {
    it('should add a node to the graph', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'module-a' }))
      const graph = builder.build()
      expect(graph.nodes.has('module-a')).toBe(true)
    })

    it('should overwrite a node with the same id', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'x', label: 'first' }))
      builder.addNode(makeNode({ id: 'x', label: 'second' }))
      const graph = builder.build()
      expect(graph.nodes.get('x')!.label).toBe('second')
    })

    it('should add nodes with different types', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'int', type: 'internal' }))
      builder.addNode(makeNode({ id: 'ext', type: 'external' }))
      builder.addNode(makeNode({ id: 'bin', type: 'builtin' }))
      const graph = builder.build()
      expect(graph.nodes.get('int')!.type).toBe('internal')
      expect(graph.nodes.get('ext')!.type).toBe('external')
      expect(graph.nodes.get('bin')!.type).toBe('builtin')
    })

    it('should preserve node metadata', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'm1', metadata: { version: '1.0.0' } }))
      const graph = builder.build()
      expect(graph.nodes.get('m1')!.metadata).toEqual({ version: '1.0.0' })
    })
  })

  describe('addEdge', () => {
    it('should add an edge to the graph', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const graph = builder.build()
      expect(graph.edges).toHaveLength(1)
      expect(graph.edges[0]!.from).toBe('a')
      expect(graph.edges[0]!.to).toBe('b')
    })

    it('should add edges with different types', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b', 'import'))
      builder.addEdge(makeEdge('a', 'b', 'type-import'))
      builder.addEdge(makeEdge('a', 'b', 'dynamic-import'))
      builder.addEdge(makeEdge('a', 'b', 're-export'))
      const graph = builder.build()
      expect(graph.edges).toHaveLength(4)
    })

    it('should preserve imported names on edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b', 'import', ['foo', 'bar']))
      const graph = builder.build()
      expect(graph.edges[0]!.importedNames).toEqual(['foo', 'bar'])
    })

    it('should allow multiple edges from same node', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      const graph = builder.build()
      expect(graph.edges).toHaveLength(2)
    })
  })

  describe('build', () => {
    it('should return a DependencyGraph with nodes and edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addEdge(makeEdge('a', 'b'))
      const graph = builder.build()
      expect(graph.nodes).toBeInstanceOf(Map)
      expect(Array.isArray(graph.edges)).toBe(true)
    })

    it('should return a copy of the nodes map', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      const graph = builder.build()
      graph.nodes.set('new', makeNode({ id: 'new' }))
      const graph2 = builder.build()
      expect(graph2.nodes.has('new')).toBe(false)
    })

    it('should return a copy of the edges array', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addEdge(makeEdge('a', 'b'))
      const graph = builder.build()
      graph.edges.push(makeEdge('x', 'y'))
      const graph2 = builder.build()
      expect(graph2.edges).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('should clear all nodes and edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.reset()
      const graph = builder.build()
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges).toHaveLength(0)
    })
  })

  describe('getDependencies', () => {
    it('should return dependencies of a node', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      expect(builder.getDependencies('a')).toEqual(['b', 'c'])
    })

    it('should return empty array for node with no dependencies', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      expect(builder.getDependencies('a')).toEqual([])
    })

    it('should return empty array for unknown node', () => {
      const builder = new GraphBuilder()
      expect(builder.getDependencies('unknown')).toEqual([])
    })
  })

  describe('getDependents', () => {
    it('should return dependents of a node', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'c'))
      builder.addEdge(makeEdge('b', 'c'))
      expect(builder.getDependents('c')).toEqual(['a', 'b'])
    })

    it('should return empty array for node with no dependents', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      expect(builder.getDependents('a')).toEqual([])
    })
  })

  describe('getSubgraph', () => {
    it('should return subgraph with specified depth', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addNode(makeNode({ id: 'd' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'c'))
      builder.addEdge(makeEdge('c', 'd'))
      const sub = builder.getSubgraph('a', 1)
      expect(sub.nodes.has('a')).toBe(true)
      expect(sub.nodes.has('b')).toBe(true)
      expect(sub.nodes.has('c')).toBe(false)
    })

    it('should return full graph with large depth', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'c'))
      const sub = builder.getSubgraph('a', 100)
      expect(sub.nodes.size).toBe(3)
    })

    it('should return single node with depth 0', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const sub = builder.getSubgraph('a', 0)
      expect(sub.nodes.size).toBe(1)
      expect(sub.nodes.has('a')).toBe(true)
    })

    it('should handle missing nodes gracefully', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      const sub = builder.getSubgraph('missing', 5)
      expect(sub.nodes.size).toBe(0)
    })
  })

  describe('merge', () => {
    it('should merge two graphs', () => {
      const builder1 = new GraphBuilder()
      builder1.addNode(makeNode({ id: 'a' }))
      builder1.addNode(makeNode({ id: 'b' }))
      builder1.addEdge(makeEdge('a', 'b'))

      const builder2 = new GraphBuilder()
      builder2.addNode(makeNode({ id: 'c' }))
      builder2.addNode(makeNode({ id: 'd' }))
      builder2.addEdge(makeEdge('c', 'd'))

      const merged = builder1.merge(builder2.build())
      expect(merged.nodes.size).toBe(4)
      expect(merged.edges).toHaveLength(2)
    })

    it('should not duplicate existing nodes', () => {
      const builder1 = new GraphBuilder()
      builder1.addNode(makeNode({ id: 'a', label: 'first' }))
      builder1.addEdge(makeEdge('a', 'b'))

      const otherGraph: DependencyGraph = {
        nodes: new Map([['a', makeNode({ id: 'a', label: 'second' })]]),
        edges: [],
      }

      const merged = builder1.merge(otherGraph)
      expect(merged.nodes.size).toBe(1)
      expect(merged.nodes.get('a')!.label).toBe('first')
    })

    it('should not duplicate existing edges', () => {
      const builder1 = new GraphBuilder()
      builder1.addNode(makeNode({ id: 'a' }))
      builder1.addNode(makeNode({ id: 'b' }))
      builder1.addEdge(makeEdge('a', 'b'))

      const otherGraph: DependencyGraph = {
        nodes: new Map(),
        edges: [makeEdge('a', 'b')],
      }

      const merged = builder1.merge(otherGraph)
      expect(merged.edges).toHaveLength(1)
    })
  })

  describe('getMetrics', () => {
    it('should return correct metrics for empty graph', () => {
      const builder = new GraphBuilder()
      const metrics = builder.getMetrics()
      expect(metrics.totalNodes).toBe(0)
      expect(metrics.totalEdges).toBe(0)
      expect(metrics.avgDegree).toBe(0)
      expect(metrics.orphanCount).toBe(0)
    })

    it('should return correct node and edge counts', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const metrics = builder.getMetrics()
      expect(metrics.totalNodes).toBe(2)
      expect(metrics.totalEdges).toBe(1)
    })

    it('should calculate average degree', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'c' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      builder.addEdge(makeEdge('b', 'c'))
      const metrics = builder.getMetrics()
      expect(metrics.avgDegree).toBe(1)
    })

    it('should count orphans', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addNode(makeNode({ id: 'orphan' }))
      builder.addEdge(makeEdge('a', 'b'))
      const metrics = builder.getMetrics()
      expect(metrics.orphanCount).toBe(1)
    })

    it('should count cycles', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'a'))
      const metrics = builder.getMetrics()
      expect(metrics.cycleCount).toBeGreaterThan(0)
    })

    it('should return 0 cycles for acyclic graph', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode({ id: 'a' }))
      builder.addNode(makeNode({ id: 'b' }))
      builder.addEdge(makeEdge('a', 'b'))
      const metrics = builder.getMetrics()
      expect(metrics.cycleCount).toBe(0)
    })

    it('should calculate max depth', () => {
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

  describe('buildFromSource', () => {
    it('should parse import statements', () => {
      const builder = new GraphBuilder()
      const source = `import { foo } from './utils'`
      const graph = builder.buildFromSource(source, 'src/main.ts')
      expect(graph.nodes.size).toBeGreaterThan(1)
      const hasUtilsEdge = graph.edges.some((e) => e.to.includes('utils'))
      expect(hasUtilsEdge).toBe(true)
    })

    it('should parse re-export statements', () => {
      const builder = new GraphBuilder()
      const source = `export { bar } from './helpers'`
      const graph = builder.buildFromSource(source, 'src/index.ts')
      const reExportEdge = graph.edges.find((e) => e.type === 're-export')
      expect(reExportEdge).toBeDefined()
    })

    it('should parse dynamic imports', () => {
      const builder = new GraphBuilder()
      const source = `const mod = import('./lazy')`
      const graph = builder.buildFromSource(source, 'src/app.ts')
      const dynEdge = graph.edges.find((e) => e.type === 'dynamic-import')
      expect(dynEdge).toBeDefined()
    })

    it('should parse type imports', () => {
      const builder = new GraphBuilder()
      const source = `import type { Config } from './types'`
      const graph = builder.buildFromSource(source, 'src/config.ts')
      const typeEdge = graph.edges.find((e) => e.type === 'type-import')
      expect(typeEdge).toBeDefined()
    })

    it('should classify builtin modules', () => {
      const builder = new GraphBuilder()
      const source = `import { readFileSync } from 'fs'`
      const graph = builder.buildFromSource(source, 'src/io.ts')
      const fsNode = graph.nodes.get('fs')
      expect(fsNode!.type).toBe('builtin')
    })

    it('should classify external modules', () => {
      const builder = new GraphBuilder()
      const source = `import express from 'express'`
      const graph = builder.buildFromSource(source, 'src/server.ts')
      const expressNode = graph.nodes.get('express')
      expect(expressNode!.type).toBe('external')
    })

    it('should classify internal modules', () => {
      const builder = new GraphBuilder()
      const source = `import { helper } from './helper'`
      const graph = builder.buildFromSource(source, 'src/main.ts')
      const internalEdge = graph.edges.find((e) => e.to.includes('helper'))
      expect(internalEdge).toBeDefined()
    })

    it('should handle node: prefix for builtins', () => {
      const builder = new GraphBuilder()
      const source = `import { readFileSync } from 'node:fs'`
      const graph = builder.buildFromSource(source, 'src/io.ts')
      const node = graph.nodes.get('node:fs')
      expect(node!.type).toBe('builtin')
    })

    it('should extract imported names', () => {
      const builder = new GraphBuilder()
      const source = `import { foo, bar } from './utils'`
      const graph = builder.buildFromSource(source, 'src/main.ts')
      const edge = graph.edges.find((e) => e.to.includes('utils'))
      expect(edge!.importedNames).toContain('foo')
      expect(edge!.importedNames).toContain('bar')
    })
  })
})

describe('CycleDetector', () => {
  const detector = new CycleDetector()

  describe('hasCycles', () => {
    it('should return false for acyclic graph', () => {
      expect(detector.hasCycles(makeSimpleGraph())).toBe(false)
    })

    it('should return true for cyclic graph', () => {
      expect(detector.hasCycles(makeCyclicGraph())).toBe(true)
    })

    it('should return false for empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      expect(detector.hasCycles(graph)).toBe(false)
    })

    it('should return false for single node with no edges', () => {
      const graph: DependencyGraph = {
        nodes: new Map([['a', makeNode({ id: 'a' })]]),
        edges: [],
      }
      expect(detector.hasCycles(graph)).toBe(false)
    })

    it('should detect two-node cycle', () => {
      const nodes = new Map<string, GraphNode>()
      nodes.set('a', makeNode({ id: 'a' }))
      nodes.set('b', makeNode({ id: 'b' }))
      const graph: DependencyGraph = {
        nodes,
        edges: [makeEdge('a', 'b'), makeEdge('b', 'a')],
      }
      expect(detector.hasCycles(graph)).toBe(true)
    })
  })

  describe('detectCycles', () => {
    it('should return empty array for acyclic graph', () => {
      const cycles = detector.detectCycles(makeSimpleGraph())
      expect(cycles).toHaveLength(0)
    })

    it('should detect simple cycle', () => {
      const cycles = detector.detectCycles(makeCyclicGraph())
      expect(cycles.length).toBeGreaterThan(0)
    })

    it('should provide correct cycle length', () => {
      const cycles = detector.detectCycles(makeCyclicGraph())
      expect(cycles[0]!.length).toBe(3)
    })

    it('should assign severity based on length', () => {
      const nodes = new Map<string, GraphNode>()
      nodes.set('a', makeNode({ id: 'a' }))
      nodes.set('b', makeNode({ id: 'b' }))
      const graph: DependencyGraph = {
        nodes,
        edges: [makeEdge('a', 'b'), makeEdge('b', 'a')],
      }
      const cycles = detector.detectCycles(graph)
      expect(cycles[0]!.severity).toBe('high')
    })

    it('should assign medium severity for 3-4 node cycle', () => {
      const cycles = detector.detectCycles(makeCyclicGraph())
      expect(cycles[0]!.severity).toBe('medium')
    })

    it('should assign low severity for 5+ node cycle', () => {
      const nodes = new Map<string, GraphNode>()
      for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) {
        nodes.set(id, makeNode({ id }))
      }
      const edges: GraphEdge[] = [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'd'),
        makeEdge('d', 'e'),
        makeEdge('e', 'f'),
        makeEdge('f', 'a'),
      ]
      const graph: DependencyGraph = { nodes, edges }
      const cycles = detector.detectCycles(graph)
      expect(cycles[0]!.severity).toBe('low')
    })

    it('should deduplicate cycles', () => {
      const cycles = detector.detectCycles(makeCyclicGraph())
      const cycleSets = cycles.map((c) => [...c.cycle].sort().join(','))
      const uniqueSets = new Set(cycleSets)
      expect(cycleSets.length).toBe(uniqueSets.size)
    })

    it('should return empty for disconnected acyclic graph', () => {
      const nodes = new Map<string, GraphNode>()
      nodes.set('a', makeNode({ id: 'a' }))
      nodes.set('b', makeNode({ id: 'b' }))
      nodes.set('c', makeNode({ id: 'c' }))
      const graph: DependencyGraph = {
        nodes,
        edges: [makeEdge('a', 'b')],
      }
      expect(detector.detectCycles(graph)).toHaveLength(0)
    })
  })

  describe('findStronglyConnectedComponents', () => {
    it('should find SCCs in cyclic graph', () => {
      const sccs = detector.findStronglyConnectedComponents(makeCyclicGraph())
      expect(sccs.length).toBeGreaterThan(0)
      expect(sccs[0]!.length).toBe(3)
    })

    it('should return empty for acyclic graph', () => {
      const sccs = detector.findStronglyConnectedComponents(makeSimpleGraph())
      expect(sccs).toHaveLength(0)
    })

    it('should find multiple SCCs', () => {
      const nodes = new Map<string, GraphNode>()
      for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) {
        nodes.set(id, makeNode({ id }))
      }
      const edges: GraphEdge[] = [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
        makeEdge('c', 'd'),
        makeEdge('d', 'c'),
        makeEdge('a', 'c'),
      ]
      const graph: DependencyGraph = { nodes, edges }
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs.length).toBe(2)
    })

    it('should handle empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs).toHaveLength(0)
    })

    it('should handle self-loop', () => {
      const nodes = new Map<string, GraphNode>()
      nodes.set('a', makeNode({ id: 'a' }))
      const graph: DependencyGraph = {
        nodes,
        edges: [makeEdge('a', 'a')],
      }
      const sccs = detector.findStronglyConnectedComponents(graph)
      expect(sccs.length).toBeGreaterThan(0)
    })
  })

  describe('suggestFix', () => {
    it('should suggest extraction for 2-node cycle', () => {
      const fix = detector.suggestFix({ cycle: ['a', 'b'], length: 2, severity: 'high' })
      expect(fix).toContain('extracting')
      expect(fix).toContain('a')
      expect(fix).toContain('b')
    })

    it('should suggest removing self-dependency for 1-node cycle', () => {
      const fix = detector.suggestFix({ cycle: ['a'], length: 1, severity: 'high' })
      expect(fix).toContain('Self-dependency')
      expect(fix).toContain('a')
    })

    it('should suggest dependency injection for longer cycle', () => {
      const fix = detector.suggestFix({ cycle: ['a', 'b', 'c', 'd'], length: 4, severity: 'medium' })
      expect(fix).toContain('dependency injection')
    })
  })
})

describe('GraphRenderer', () => {
  const renderer = new GraphRenderer()

  describe('toDot', () => {
    it('should generate valid DOT format', () => {
      const dot = renderer.toDot(makeSimpleGraph())
      expect(dot).toContain('digraph dependencies')
      expect(dot).toContain('->')
    })

    it('should include all nodes', () => {
      const dot = renderer.toDot(makeSimpleGraph())
      expect(dot).toContain('"a"')
      expect(dot).toContain('"b"')
      expect(dot).toContain('"c"')
    })

    it('should color internal nodes as lightblue', () => {
      const dot = renderer.toDot(makeSimpleGraph())
      expect(dot).toContain('lightblue')
    })

    it('should use dashed style for dynamic imports', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a' })],
          ['b', makeNode({ id: 'b' })],
        ]),
        edges: [makeEdge('a', 'b', 'dynamic-import')],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('style=dashed')
    })

    it('should use dotted style for type imports', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a' })],
          ['b', makeNode({ id: 'b' })],
        ]),
        edges: [makeEdge('a', 'b', 'type-import')],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('style=dotted')
    })

    it('should include imported names as edge labels', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a' })],
          ['b', makeNode({ id: 'b' })],
        ]),
        edges: [makeEdge('a', 'b', 'import', ['foo', 'bar'])],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('foo')
      expect(dot).toContain('bar')
    })

    it('should handle empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('digraph dependencies')
    })

    it('should color external nodes as lightyellow', () => {
      const graph: DependencyGraph = {
        nodes: new Map([['ext', makeNode({ id: 'ext', type: 'external' })]]),
        edges: [],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('lightyellow')
    })

    it('should color builtin nodes as lightgray', () => {
      const graph: DependencyGraph = {
        nodes: new Map([['fs', makeNode({ id: 'fs', type: 'builtin' })]]),
        edges: [],
      }
      const dot = renderer.toDot(graph)
      expect(dot).toContain('lightgray')
    })
  })

  describe('toJSON', () => {
    it('should generate valid JSON', () => {
      const json = renderer.toJSON(makeSimpleGraph())
      const parsed = JSON.parse(json)
      expect(parsed).toHaveProperty('nodes')
      expect(parsed).toHaveProperty('edges')
    })

    it('should include all nodes with ids', () => {
      const json = renderer.toJSON(makeSimpleGraph())
      const parsed = JSON.parse(json)
      expect(parsed.nodes).toHaveLength(3)
      const ids = parsed.nodes.map((n: { id: string }) => n.id)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
    })

    it('should include all edges', () => {
      const json = renderer.toJSON(makeSimpleGraph())
      const parsed = JSON.parse(json)
      expect(parsed.edges).toHaveLength(2)
    })

    it('should handle empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      const json = renderer.toJSON(graph)
      const parsed = JSON.parse(json)
      expect(parsed.nodes).toHaveLength(0)
      expect(parsed.edges).toHaveLength(0)
    })
  })

  describe('toMermaid', () => {
    it('should generate valid Mermaid format', () => {
      const mermaid = renderer.toMermaid(makeSimpleGraph())
      expect(mermaid).toContain('graph LR')
    })

    it('should include arrow syntax for edges', () => {
      const mermaid = renderer.toMermaid(makeSimpleGraph())
      expect(mermaid).toContain('-->')
    })

    it('should include imported names as edge labels', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a' })],
          ['b', makeNode({ id: 'b' })],
        ]),
        edges: [makeEdge('a', 'b', 'import', ['helper'])],
      }
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('helper')
    })

    it('should handle orphan nodes', () => {
      const graph: DependencyGraph = {
        nodes: new Map([['orphan', makeNode({ id: 'orphan' })]]),
        edges: [],
      }
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('orphan')
    })

    it('should handle empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('graph LR')
    })

    it('should sanitize special characters in ids', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['@scope/pkg', makeNode({ id: '@scope/pkg', label: 'pkg' })],
          ['src/utils', makeNode({ id: 'src/utils', label: 'utils' })],
        ]),
        edges: [makeEdge('@scope/pkg', 'src/utils')],
      }
      const mermaid = renderer.toMermaid(graph)
      expect(mermaid).toContain('-->')
    })
  })

  describe('toAdjacencyList', () => {
    it('should return a Map with adjacency lists', () => {
      const adj = renderer.toAdjacencyList(makeSimpleGraph())
      expect(adj).toBeInstanceOf(Map)
    })

    it('should include all nodes', () => {
      const adj = renderer.toAdjacencyList(makeSimpleGraph())
      expect(adj.has('a')).toBe(true)
      expect(adj.has('b')).toBe(true)
      expect(adj.has('c')).toBe(true)
    })

    it('should map edges correctly', () => {
      const adj = renderer.toAdjacencyList(makeSimpleGraph())
      expect(adj.get('a')).toEqual(['b'])
      expect(adj.get('b')).toEqual(['c'])
      expect(adj.get('c')).toEqual([])
    })

    it('should handle empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      const adj = renderer.toAdjacencyList(graph)
      expect(adj.size).toBe(0)
    })

    it('should handle multiple outgoing edges', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a' })],
          ['b', makeNode({ id: 'b' })],
          ['c', makeNode({ id: 'c' })],
        ]),
        edges: [makeEdge('a', 'b'), makeEdge('a', 'c')],
      }
      const adj = renderer.toAdjacencyList(graph)
      expect(adj.get('a')).toEqual(['b', 'c'])
    })
  })

  describe('toFlatList', () => {
    it('should sort by name', () => {
      const list = renderer.toFlatList(makeSimpleGraph(), 'name')
      expect(list).toEqual(['a', 'b', 'c'])
    })

    it('should sort by degree', () => {
      const graph: DependencyGraph = {
        nodes: new Map([
          ['a', makeNode({ id: 'a' })],
          ['b', makeNode({ id: 'b' })],
          ['c', makeNode({ id: 'c' })],
        ]),
        edges: [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'c')],
      }
      const list = renderer.toFlatList(graph, 'degree')
      expect(list[0]).toBe('a')
    })

    it('should sort by depth', () => {
      const list = renderer.toFlatList(makeSimpleGraph(), 'depth')
      expect(list[0]).toBe('a')
    })

    it('should handle empty graph', () => {
      const graph: DependencyGraph = { nodes: new Map(), edges: [] }
      expect(renderer.toFlatList(graph, 'name')).toEqual([])
      expect(renderer.toFlatList(graph, 'degree')).toEqual([])
      expect(renderer.toFlatList(graph, 'depth')).toEqual([])
    })

    it('should handle single node', () => {
      const graph: DependencyGraph = {
        nodes: new Map([['a', makeNode({ id: 'a' })]]),
        edges: [],
      }
      expect(renderer.toFlatList(graph, 'name')).toEqual(['a'])
    })
  })
})

describe('Integration', () => {
  it('should build graph, detect cycles, and render', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'app' }))
    builder.addNode(makeNode({ id: 'router' }))
    builder.addNode(makeNode({ id: 'controller' }))
    builder.addEdge(makeEdge('app', 'router'))
    builder.addEdge(makeEdge('router', 'controller'))
    builder.addEdge(makeEdge('controller', 'app'))

    const graph = builder.build()

    const detector = new CycleDetector()
    expect(detector.hasCycles(graph)).toBe(true)
    const cycles = detector.detectCycles(graph)
    expect(cycles.length).toBeGreaterThan(0)

    const renderer = new GraphRenderer()
    const dot = renderer.toDot(graph)
    expect(dot).toContain('digraph')
    const json = renderer.toJSON(graph)
    expect(JSON.parse(json).nodes.length).toBe(3)
    const mermaid = renderer.toMermaid(graph)
    expect(mermaid).toContain('graph LR')
  })

  it('should handle complex dependency graph end-to-end', () => {
    const builder = new GraphBuilder()
    const modules = ['index', 'config', 'utils', 'api', 'db', 'logger']
    for (const m of modules) {
      builder.addNode(makeNode({ id: m }))
    }
    builder.addEdge(makeEdge('index', 'config'))
    builder.addEdge(makeEdge('index', 'api'))
    builder.addEdge(makeEdge('api', 'db'))
    builder.addEdge(makeEdge('api', 'utils'))
    builder.addEdge(makeEdge('db', 'utils'))
    builder.addEdge(makeEdge('db', 'logger'))
    builder.addEdge(makeEdge('logger', 'utils'))

    const graph = builder.build()

    const detector = new CycleDetector()
    expect(detector.hasCycles(graph)).toBe(false)

    const metrics = builder.getMetrics()
    expect(metrics.totalNodes).toBe(6)
    expect(metrics.totalEdges).toBe(7)
    expect(metrics.orphanCount).toBe(0)

    const adj = renderer.toAdjacencyList(graph)
    expect(adj.get('index')!.length).toBe(2)

    const flatByName = renderer.toFlatList(graph, 'name')
    expect(flatByName[0]).toBe('api')

    const flatByDegree = renderer.toFlatList(graph, 'degree')
    expect(flatByDegree[0]).toBe('utils')

    const flatByDepth = renderer.toFlatList(graph, 'depth')
    expect(flatByDepth[0]).toBe('index')
  })

  it('should merge graphs and detect new cycles', () => {
    const builder1 = new GraphBuilder()
    builder1.addNode(makeNode({ id: 'a' }))
    builder1.addNode(makeNode({ id: 'b' }))
    builder1.addEdge(makeEdge('a', 'b'))

    const builder2 = new GraphBuilder()
    builder2.addNode(makeNode({ id: 'b' }))
    builder2.addNode(makeNode({ id: 'c' }))
    builder2.addEdge(makeEdge('c', 'b'))

    const merged = builder1.merge(builder2.build())

    const detector = new CycleDetector()
    expect(detector.hasCycles(merged)).toBe(false)

    const builder3 = new GraphBuilder()
    builder3.addNode(makeNode({ id: 'b' }))
    builder3.addNode(makeNode({ id: 'a' }))
    builder3.addEdge(makeEdge('b', 'a'))

    const mergedWithCycle = builder1.merge(builder3.build())
    expect(detector.hasCycles(mergedWithCycle)).toBe(true)
  })

  it('should get subgraph and render it', () => {
    const builder = new GraphBuilder()
    for (const id of ['root', 'a', 'b', 'c', 'd']) {
      builder.addNode(makeNode({ id }))
    }
    builder.addEdge(makeEdge('root', 'a'))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.addEdge(makeEdge('c', 'd'))

    const sub = builder.getSubgraph('root', 2)
    expect(sub.nodes.size).toBe(3)

    const renderer = new GraphRenderer()
    const dot = renderer.toDot(sub)
    expect(dot).toContain('root')
    expect(dot).toContain('a')
    expect(dot).toContain('b')
    expect(dot).not.toContain('"d"')
  })

  it('should handle strongly connected components in complex graph', () => {
    const nodes = new Map<string, GraphNode>()
    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      nodes.set(id, makeNode({ id }))
    }
    const edges: GraphEdge[] = [
      makeEdge('a', 'b'),
      makeEdge('b', 'c'),
      makeEdge('c', 'a'),
      makeEdge('c', 'd'),
      makeEdge('d', 'e'),
      makeEdge('e', 'd'),
    ]
    const graph: DependencyGraph = { nodes, edges }

    const detector = new CycleDetector()
    const sccs = detector.findStronglyConnectedComponents(graph)
    expect(sccs.length).toBe(2)

    const scc1Ids = sccs.find((s) => s.includes('a'))!.sort()
    expect(scc1Ids).toEqual(['a', 'b', 'c'])

    const scc2Ids = sccs.find((s) => s.includes('d'))!.sort()
    expect(scc2Ids).toEqual(['d', 'e'])
  })

  it('should detect cycles across multiple paths', () => {
    const builder = new GraphBuilder()
    for (const id of ['a', 'b', 'c', 'd']) {
      builder.addNode(makeNode({ id }))
    }
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.addEdge(makeEdge('c', 'd'))
    builder.addEdge(makeEdge('d', 'b'))

    const graph = builder.build()
    const detector = new CycleDetector()
    expect(detector.hasCycles(graph)).toBe(true)
    const cycles = detector.detectCycles(graph)
    expect(cycles.length).toBeGreaterThan(0)
    const sccs = detector.findStronglyConnectedComponents(graph)
    expect(sccs.length).toBeGreaterThan(0)
    expect(sccs[0]!.length).toBe(3)
  })

  it('should handle graph with all orphan nodes', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))

    const metrics = builder.getMetrics()
    expect(metrics.orphanCount).toBe(3)
    expect(metrics.totalEdges).toBe(0)
    expect(metrics.cycleCount).toBe(0)

    const renderer = new GraphRenderer()
    const adj = renderer.toAdjacencyList(builder.build())
    expect(adj.get('a')).toEqual([])
  })
})

const renderer = new GraphRenderer()
