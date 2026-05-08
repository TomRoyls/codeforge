import { describe, it, expect } from 'vitest'
import { GraphBuilder } from '../../src/core/dep-graph-builder/graph-builder.js'
import { GraphAnalyzer } from '../../src/core/dep-graph-builder/graph-analyzer.js'
import type { GraphNode, GraphEdge, DependencyGraph } from '../../src/core/dep-graph-builder/types.js'

function makeNode(id: string, type: 'internal' | 'external' | 'builtin' = 'internal', label?: string): GraphNode {
  return { id, label: label ?? id, type, path: type === 'internal' ? id : undefined, metadata: {} }
}

function makeEdge(from: string, to: string, type: GraphEdge['type'] = 'import', names: string[] = []): GraphEdge {
  return { from, to, type, importedNames: names, isTypeOnly: false }
}

describe('GraphBuilder', () => {
  describe('constructor', () => {
    it('should create an empty builder', () => {
      const builder = new GraphBuilder()
      const graph = builder.build()
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges).toHaveLength(0)
      expect(graph.root).toBe('')
    })
  })

  describe('addNode', () => {
    it('should add a node to the graph', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      expect(builder.getNode('a')).not.toBeNull()
      expect(builder.getNode('a')!.label).toBe('a')
    })

    it('should set first added node as root', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      const graph = builder.build()
      expect(graph.root).toBe('a')
    })

    it('should overwrite existing node with same id', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('a', 'external'))
      expect(builder.getNode('a')!.type).toBe('external')
    })

    it('should preserve node metadata', () => {
      const builder = new GraphBuilder()
      builder.addNode({ id: 'a', label: 'a', type: 'internal', metadata: { foo: 'bar' } })
      expect(builder.getNode('a')!.metadata).toEqual({ foo: 'bar' })
    })
  })

  describe('addEdge', () => {
    it('should add an edge between nodes', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b'))
      const edge = builder.getEdge('a', 'b')
      expect(edge).not.toBeNull()
      expect(edge!.type).toBe('import')
    })

    it('should merge imported names for duplicate edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
      builder.addEdge(makeEdge('a', 'b', 'import', ['bar']))
      const edge = builder.getEdge('a', 'b')!
      expect(edge.importedNames).toContain('foo')
      expect(edge.importedNames).toContain('bar')
    })

    it('should store separate edges for different types', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b', 'import'))
      builder.addEdge(makeEdge('a', 'b', 'dynamic'))
      expect(builder.getOutEdges('a')).toHaveLength(2)
    })

    it('should handle edges with empty importedNames', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b', 'import', []))
      const edge = builder.getEdge('a', 'b')!
      expect(edge.importedNames).toEqual([])
    })
  })

  describe('removeNode', () => {
    it('should remove a node and its edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b'))
      builder.removeNode('b')
      expect(builder.getNode('b')).toBeNull()
      expect(builder.getEdge('a', 'b')).toBeNull()
    })

    it('should update root when root is removed', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.removeNode('a')
      const graph = builder.build()
      expect(graph.root).toBe('b')
    })

    it('should set root to empty string when last node is removed', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.removeNode('a')
      const graph = builder.build()
      expect(graph.root).toBe('')
    })

    it('should handle removing non-existent node', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.removeNode('z')
      expect(builder.getNode('a')).not.toBeNull()
    })
  })

  describe('removeEdge', () => {
    it('should remove a specific edge', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b'))
      builder.removeEdge('a', 'b')
      expect(builder.getEdge('a', 'b')).toBeNull()
    })

    it('should only remove edge in specified direction', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('b', 'a'))
      builder.removeEdge('a', 'b')
      expect(builder.getEdge('a', 'b')).toBeNull()
      expect(builder.getEdge('b', 'a')).not.toBeNull()
    })

    it('should handle removing non-existent edge', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.removeEdge('a', 'b')
      expect(builder.getEdge('a', 'b')).toBeNull()
    })
  })

  describe('getNode', () => {
    it('should return null for non-existent node', () => {
      const builder = new GraphBuilder()
      expect(builder.getNode('missing')).toBeNull()
    })
  })

  describe('getEdge', () => {
    it('should return null for non-existent edge', () => {
      const builder = new GraphBuilder()
      expect(builder.getEdge('a', 'b')).toBeNull()
    })
  })

  describe('getOutEdges', () => {
    it('should return all outgoing edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addNode(makeNode('c'))
      builder.addEdge(makeEdge('a', 'b'))
      builder.addEdge(makeEdge('a', 'c'))
      const outEdges = builder.getOutEdges('a')
      expect(outEdges).toHaveLength(2)
    })

    it('should return empty array for node with no outgoing edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      expect(builder.getOutEdges('a')).toEqual([])
    })
  })

  describe('getInEdges', () => {
    it('should return all incoming edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addNode(makeNode('c'))
      builder.addEdge(makeEdge('a', 'c'))
      builder.addEdge(makeEdge('b', 'c'))
      const inEdges = builder.getInEdges('c')
      expect(inEdges).toHaveLength(2)
    })

    it('should return empty array for node with no incoming edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      expect(builder.getInEdges('a')).toEqual([])
    })
  })

  describe('build', () => {
    it('should return a DependencyGraph snapshot', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b'))
      const graph = builder.build()
      expect(graph.nodes.size).toBe(2)
      expect(graph.edges).toHaveLength(1)
      expect(graph.root).toBe('a')
    })

    it('should not be affected by subsequent mutations', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      const graph = builder.build()
      builder.addNode(makeNode('b'))
      expect(graph.nodes.size).toBe(1)
    })
  })

  describe('fromImports', () => {
    it('should parse static imports', () => {
      const builder = new GraphBuilder()
      const source = `import { foo } from './utils'\nimport { bar } from 'lodash'`
      const graph = builder.fromImports(source, '/src/index.ts')
      expect(graph.nodes.size).toBe(3)
      expect(graph.edges).toHaveLength(2)
      expect(graph.root).toBe('/src/index.ts')
    })

    it('should detect internal vs external imports', () => {
      const builder = new GraphBuilder()
      const source = `import { foo } from './helper'\nimport { bar } from 'express'`
      const graph = builder.fromImports(source, '/src/main.ts')
      expect(graph.nodes.get('./helper')!.type).toBe('internal')
      expect(graph.nodes.get('express')!.type).toBe('external')
    })

    it('should detect builtin modules', () => {
      const builder = new GraphBuilder()
      const source = `import { readFileSync } from 'fs'`
      const graph = builder.fromImports(source, '/src/main.ts')
      expect(graph.nodes.get('fs')!.type).toBe('builtin')
    })

    it('should parse side-effect imports', () => {
      const builder = new GraphBuilder()
      const source = `import './polyfills'`
      const graph = builder.fromImports(source, '/src/main.ts')
      expect(graph.edges).toHaveLength(1)
      expect(graph.edges[0]!.importedNames).toEqual([])
    })

    it('should parse dynamic imports', () => {
      const builder = new GraphBuilder()
      const source = `const mod = import('./lazy-module')`
      const graph = builder.fromImports(source, '/src/main.ts')
      const dynamicEdge = graph.edges.find((e) => e.type === 'dynamic')
      expect(dynamicEdge).toBeDefined()
      expect(dynamicEdge!.to).toBe('./lazy-module')
    })

    it('should parse re-exports', () => {
      const builder = new GraphBuilder()
      const source = `export { foo } from './utils'\nexport * from './helpers'`
      const graph = builder.fromImports(source, '/src/index.ts')
      const reexports = graph.edges.filter((e) => e.type === 'reexport')
      expect(reexports).toHaveLength(2)
    })

    it('should handle @scoped packages', () => {
      const builder = new GraphBuilder()
      const source = `import { something } from '@myorg/mylib'`
      const graph = builder.fromImports(source, '/src/main.ts')
      const node = graph.nodes.get('@myorg/mylib')
      expect(node).toBeDefined()
      expect(node!.type).toBe('external')
    })

    it('should extract imported names from braces', () => {
      const builder = new GraphBuilder()
      const source = `import { foo, bar, baz as b } from './utils'`
      const graph = builder.fromImports(source, '/src/main.ts')
      const edge = graph.edges[0]!
      expect(edge.importedNames).toContain('foo')
      expect(edge.importedNames).toContain('bar')
      expect(edge.importedNames).toContain('b')
    })

    it('should clear previous state on each call', () => {
      const builder = new GraphBuilder()
      builder.fromImports(`import { a } from './x'`, '/src/one.ts')
      const graph = builder.fromImports(`import { b } from './y'`, '/src/two.ts')
      expect(graph.root).toBe('/src/two.ts')
      expect(graph.edges).toHaveLength(1)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b'))
      const cloned = builder.clone()
      cloned.removeNode('b')
      expect(builder.getNode('b')).not.toBeNull()
      expect(cloned.getNode('b')).toBeNull()
    })

    it('should preserve root in clone', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      const cloned = builder.clone()
      expect(cloned.build().root).toBe('a')
    })

    it('should deep copy edges', () => {
      const builder = new GraphBuilder()
      builder.addNode(makeNode('a'))
      builder.addNode(makeNode('b'))
      builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
      const cloned = builder.clone()
      cloned.removeEdge('a', 'b')
      expect(builder.getEdge('a', 'b')).not.toBeNull()
    })
  })
})

describe('GraphAnalyzer', () => {
  function buildGraph(
    nodes: string[],
    edges: [string, string][],
  ): DependencyGraph {
    const nodeMap = new Map<string, GraphNode>()
    for (const id of nodes) {
      nodeMap.set(id, makeNode(id))
    }
    const edgeList: GraphEdge[] = edges.map(([from, to]) => makeEdge(from, to))
    return { nodes: nodeMap, edges: edgeList, root: nodes[0] ?? '' }
  }

  describe('detectCycles', () => {
    it('should return empty array for acyclic graph', () => {
      const graph = buildGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.detectCycles()).toEqual([])
    })

    it('should detect a simple cycle', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
      const analyzer = new GraphAnalyzer(graph)
      const cycles = analyzer.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles[0]!.length).toBe(2)
    })

    it('should detect a longer cycle', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['b', 'c'], ['c', 'a']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const cycles = analyzer.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles[0]!.length).toBe(3)
    })

    it('should assign low severity to short cycles', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
      const analyzer = new GraphAnalyzer(graph)
      const cycles = analyzer.detectCycles()
      expect(cycles[0]!.severity).toBe('low')
    })

    it('should assign medium severity to medium cycles', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const cycles = analyzer.detectCycles()
      expect(cycles[0]!.severity).toBe('medium')
    })

    it('should assign high severity to long cycles', () => {
      const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
      const edges: [string, string][] = []
      for (let i = 0; i < ids.length - 1; i++) {
        edges.push([ids[i]!, ids[i + 1]!])
      }
      edges.push([ids[ids.length - 1]!, ids[0]!])
      const graph = buildGraph(ids, edges)
      const analyzer = new GraphAnalyzer(graph)
      const cycles = analyzer.detectCycles()
      expect(cycles[0]!.severity).toBe('high')
    })

    it('should detect multiple cycles', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['b', 'a'], ['c', 'd'], ['d', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const cycles = analyzer.detectCycles()
      expect(cycles.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle single node graph', () => {
      const graph = buildGraph(['a'], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.detectCycles()).toEqual([])
    })

    it('should handle empty graph', () => {
      const graph = buildGraph([], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.detectCycles()).toEqual([])
    })
  })

  describe('topologicalSort', () => {
    it('should return valid order for DAG', () => {
      const graph = buildGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
      const analyzer = new GraphAnalyzer(graph)
      const result = analyzer.topologicalSort()
      expect(result.isValid).toBe(true)
      expect(result.order).toHaveLength(3)
      const aIdx = result.order.indexOf('a')
      const bIdx = result.order.indexOf('b')
      const cIdx = result.order.indexOf('c')
      expect(aIdx).toBeLessThan(bIdx)
      expect(bIdx).toBeLessThan(cIdx)
    })

    it('should mark as invalid for cyclic graph', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b'], ['b', 'a']])
      const analyzer = new GraphAnalyzer(graph)
      const result = analyzer.topologicalSort()
      expect(result.isValid).toBe(false)
    })

    it('should compute correct levels', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['a', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const result = analyzer.topologicalSort()
      expect(result.levels.get('a')).toBe(0)
      expect(result.levels.get('b')).toBe(1)
      expect(result.levels.get('c')).toBe(1)
    })

    it('should handle diamond dependency', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const result = analyzer.topologicalSort()
      expect(result.isValid).toBe(true)
      expect(result.levels.get('d')).toBe(2)
    })

    it('should handle empty graph', () => {
      const graph = buildGraph([], [])
      const analyzer = new GraphAnalyzer(graph)
      const result = analyzer.topologicalSort()
      expect(result.order).toEqual([])
      expect(result.isValid).toBe(true)
    })
  })

  describe('getMetrics', () => {
    it('should compute correct basic metrics', () => {
      const graph = buildGraph(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.totalNodes).toBe(3)
      expect(metrics.totalEdges).toBe(2)
      expect(metrics.avgDegree).toBeCloseTo(2 / 3)
    })

    it('should compute max in-degree', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'c'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.maxInDegree.node).toBe('c')
      expect(metrics.maxInDegree.degree).toBe(2)
    })

    it('should compute max out-degree', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['a', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.maxOutDegree.node).toBe('a')
      expect(metrics.maxOutDegree.degree).toBe(2)
    })

    it('should compute density', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.density).toBeCloseTo(1 / 2)
    })

    it('should handle single node', () => {
      const graph = buildGraph(['a'], [])
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.totalNodes).toBe(1)
      expect(metrics.totalEdges).toBe(0)
      expect(metrics.density).toBe(0)
    })

    it('should handle empty graph', () => {
      const graph = buildGraph([], [])
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.totalNodes).toBe(0)
      expect(metrics.totalEdges).toBe(0)
      expect(metrics.avgDegree).toBe(0)
      expect(metrics.density).toBe(0)
    })

    it('should report orphans', () => {
      const graph = buildGraph(['a', 'b', 'c'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      const metrics = analyzer.getMetrics()
      expect(metrics.orphans).toContain('c')
    })
  })

  describe('getDependents', () => {
    it('should return all nodes that depend on given node', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const dependents = analyzer.getDependents('c')
      expect(dependents).toContain('a')
      expect(dependents).toContain('b')
    })

    it('should return empty for leaf node with no dependents', () => {
      const graph = buildGraph(['a'], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getDependents('a')).toEqual([])
    })

    it('should handle transitive dependents', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['b', 'c'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const dependents = analyzer.getDependents('d')
      expect(dependents).toContain('a')
      expect(dependents).toContain('b')
      expect(dependents).toContain('c')
    })
  })

  describe('getDependencies', () => {
    it('should return all dependencies of given node', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const deps = analyzer.getDependencies('a')
      expect(deps).toContain('b')
      expect(deps).toContain('c')
    })

    it('should return empty for node with no dependencies', () => {
      const graph = buildGraph(['a'], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getDependencies('a')).toEqual([])
    })

    it('should handle transitive dependencies', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['b', 'c'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const deps = analyzer.getDependencies('a')
      expect(deps).toHaveLength(3)
    })
  })

  describe('getOrphans', () => {
    it('should return nodes with no edges', () => {
      const graph = buildGraph(['a', 'b', 'c'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getOrphans()).toEqual(['c'])
    })

    it('should return empty when all nodes are connected', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getOrphans()).toEqual([])
    })

    it('should return all nodes for fully disconnected graph', () => {
      const graph = buildGraph(['a', 'b', 'c'], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getOrphans()).toHaveLength(3)
    })
  })

  describe('getBottlenecks', () => {
    it('should return nodes with in-degree >= threshold', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'd'], ['b', 'd'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const bottlenecks = analyzer.getBottlenecks(3)
      expect(bottlenecks).toContain('d')
    })

    it('should use default threshold of 3', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'd'], ['b', 'd'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getBottlenecks()).toContain('d')
    })

    it('should not include nodes below threshold', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'c'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getBottlenecks(3)).toEqual([])
    })

    it('should respect custom threshold', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'c'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.getBottlenecks(2)).toContain('c')
    })
  })

  describe('getSubgraph', () => {
    it('should extract a subset of nodes and their edges', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['b', 'c'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const sub = analyzer.getSubgraph(['a', 'b', 'c'])
      expect(sub.nodes.size).toBe(3)
      expect(sub.edges).toHaveLength(2)
      expect(sub.root).toBe('a')
    })

    it('should exclude edges to nodes not in subset', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const sub = analyzer.getSubgraph(['a', 'b'])
      expect(sub.edges).toHaveLength(1)
      expect(sub.edges[0]!.from).toBe('a')
      expect(sub.edges[0]!.to).toBe('b')
    })

    it('should handle single node subgraph', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      const sub = analyzer.getSubgraph(['a'])
      expect(sub.nodes.size).toBe(1)
      expect(sub.edges).toHaveLength(0)
    })

    it('should handle empty subgraph', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      const sub = analyzer.getSubgraph([])
      expect(sub.nodes.size).toBe(0)
      expect(sub.edges).toHaveLength(0)
      expect(sub.root).toBe('')
    })

    it('should skip nodes not in original graph', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      const sub = analyzer.getSubgraph(['a', 'missing'])
      expect(sub.nodes.size).toBe(1)
    })
  })

  describe('shortestPath', () => {
    it('should find direct path', () => {
      const graph = buildGraph(['a', 'b'], [['a', 'b']])
      const analyzer = new GraphAnalyzer(graph)
      const path = analyzer.shortestPath('a', 'b')
      expect(path).toEqual(['a', 'b'])
    })

    it('should find path through intermediate nodes', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const path = analyzer.shortestPath('a', 'c')
      expect(path).toEqual(['a', 'b', 'c'])
    })

    it('should return null for unreachable nodes', () => {
      const graph = buildGraph(['a', 'b'], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.shortestPath('a', 'b')).toBeNull()
    })

    it('should return [from] when from equals to', () => {
      const graph = buildGraph(['a'], [])
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.shortestPath('a', 'a')).toEqual(['a'])
    })

    it('should find shortest path when multiple paths exist', () => {
      const graph = buildGraph(
        ['a', 'b', 'c', 'd'],
        [['a', 'b'], ['b', 'd'], ['a', 'c'], ['c', 'd']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const path = analyzer.shortestPath('a', 'd')
      expect(path).toHaveLength(3)
    })
  })

  describe('affects', () => {
    it('should return same result as getDependents', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['b', 'c']],
      )
      const analyzer = new GraphAnalyzer(graph)
      expect(analyzer.affects('c')).toEqual(analyzer.getDependents('c'))
    })

    it('should return all nodes affected by change', () => {
      const graph = buildGraph(
        ['a', 'b', 'c'],
        [['a', 'b'], ['c', 'b']],
      )
      const analyzer = new GraphAnalyzer(graph)
      const affected = analyzer.affects('b')
      expect(affected).toContain('a')
      expect(affected).toContain('c')
    })
  })
})

describe('GraphBuilder + GraphAnalyzer integration', () => {
  it('should analyze a realistic dependency graph', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode('main'))
    builder.addNode(makeNode('utils'))
    builder.addNode(makeNode('helpers'))
    builder.addNode(makeNode('config'))
    builder.addEdge(makeEdge('main', 'utils', 'import', ['formatDate']))
    builder.addEdge(makeEdge('main', 'config', 'import', ['getConfig']))
    builder.addEdge(makeEdge('utils', 'helpers', 'import', ['parseDate']))

    const graph = builder.build()
    const analyzer = new GraphAnalyzer(graph)

    const metrics = analyzer.getMetrics()
    expect(metrics.totalNodes).toBe(4)
    expect(metrics.totalEdges).toBe(3)
    expect(metrics.orphans).toEqual([])

    const topo = analyzer.topologicalSort()
    expect(topo.isValid).toBe(true)
    expect(topo.order).toHaveLength(4)

    const cycles = analyzer.detectCycles()
    expect(cycles).toEqual([])
  })

  it('should detect cycles in a complex graph', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode('a'))
    builder.addNode(makeNode('b'))
    builder.addNode(makeNode('c'))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.addEdge(makeEdge('c', 'a'))

    const analyzer = new GraphAnalyzer(builder.build())
    expect(analyzer.detectCycles().length).toBeGreaterThan(0)
    expect(analyzer.topologicalSort().isValid).toBe(false)
  })

  it('should find shortest path in complex graph', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode('entry'))
    builder.addNode(makeNode('router'))
    builder.addNode(makeNode('api'))
    builder.addNode(makeNode('db'))
    builder.addEdge(makeEdge('entry', 'router'))
    builder.addEdge(makeEdge('router', 'api'))
    builder.addEdge(makeEdge('api', 'db'))

    const analyzer = new GraphAnalyzer(builder.build())
    const path = analyzer.shortestPath('entry', 'db')
    expect(path).toEqual(['entry', 'router', 'api', 'db'])
  })

  it('should identify bottlenecks in real-world-like graph', () => {
    const builder = new GraphBuilder()
    const nodes = ['app', 'ui', 'data', 'utils', 'types']
    for (const n of nodes) builder.addNode(makeNode(n))
    builder.addEdge(makeEdge('app', 'ui'))
    builder.addEdge(makeEdge('app', 'data'))
    builder.addEdge(makeEdge('ui', 'utils'))
    builder.addEdge(makeEdge('data', 'utils'))
    builder.addEdge(makeEdge('ui', 'types'))
    builder.addEdge(makeEdge('data', 'types'))

    const analyzer = new GraphAnalyzer(builder.build())
    expect(analyzer.getBottlenecks(2)).toContain('utils')
    expect(analyzer.getBottlenecks(2)).toContain('types')
  })

  it('should extract subgraph and analyze independently', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode('a'))
    builder.addNode(makeNode('b'))
    builder.addNode(makeNode('c'))
    builder.addNode(makeNode('d'))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.addEdge(makeEdge('c', 'd'))

    const analyzer = new GraphAnalyzer(builder.build())
    const sub = analyzer.getSubgraph(['a', 'b', 'c'])
    const subAnalyzer = new GraphAnalyzer(sub)
    expect(subAnalyzer.getMetrics().totalNodes).toBe(3)
    expect(subAnalyzer.getMetrics().totalEdges).toBe(2)
  })
})
