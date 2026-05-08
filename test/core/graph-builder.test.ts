import { describe, it, expect, beforeEach } from 'vitest'
import { GraphBuilder } from '../../src/core/graph-builder/graph-builder.js'
import { DEFAULT_GRAPH_OPTIONS } from '../../src/core/graph-builder/types.js'
import type { GraphEdge, GraphNode, GraphType, GraphOptions, TraversalResult, CycleResult, GraphStats } from '../../src/core/graph-builder/types.js'

describe('GraphBuilder', () => {
  let graph: GraphBuilder

  beforeEach(() => {
    graph = new GraphBuilder()
  })

  describe('constructor', () => {
    it('should create a graph with default options', () => {
      const g = new GraphBuilder()
      expect(g.getNodeCount()).toBe(0)
      expect(g.getEdgeCount()).toBe(0)
    })

    it('should accept directed type option', () => {
      const g = new GraphBuilder({ type: 'directed' })
      const stats = g.getStats()
      expect(stats.isDirected).toBe(true)
    })

    it('should accept undirected type option', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      const stats = g.getStats()
      expect(stats.isDirected).toBe(false)
    })

    it('should accept allowSelfLoops option', () => {
      const g = new GraphBuilder({ allowSelfLoops: true })
      g.addNode('a')
      expect(g.addEdge('a', 'a')).toBe(true)
    })

    it('should accept maxNodes option', () => {
      const g = new GraphBuilder({ maxNodes: 2 })
      expect(g.addNode('a')).toBe(true)
      expect(g.addNode('b')).toBe(true)
      expect(g.addNode('c')).toBe(false)
    })
  })

  describe('addNode', () => {
    it('should add a node and return true', () => {
      expect(graph.addNode('a')).toBe(true)
      expect(graph.hasNode('a')).toBe(true)
    })

    it('should return false for duplicate node', () => {
      graph.addNode('a')
      expect(graph.addNode('a')).toBe(false)
    })

    it('should store metadata on node', () => {
      graph.addNode('a', { color: 'red' })
      const node = graph.getNode('a')
      expect(node?.metadata).toEqual({ color: 'red' })
    })

    it('should store node without metadata', () => {
      graph.addNode('a')
      const node = graph.getNode('a')
      expect(node?.metadata).toBeUndefined()
    })

    it('should respect maxNodes limit', () => {
      const g = new GraphBuilder({ maxNodes: 1 })
      g.addNode('a')
      expect(g.addNode('b')).toBe(false)
    })

    it('should increment node count', () => {
      graph.addNode('a')
      graph.addNode('b')
      expect(graph.getNodeCount()).toBe(2)
    })
  })

  describe('removeNode', () => {
    it('should remove a node and return true', () => {
      graph.addNode('a')
      expect(graph.removeNode('a')).toBe(true)
      expect(graph.hasNode('a')).toBe(false)
    })

    it('should return false for non-existent node', () => {
      expect(graph.removeNode('x')).toBe(false)
    })

    it('should remove edges connected to the node in directed graph', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      graph.removeNode('b')
      expect(graph.hasEdge('a', 'b')).toBe(false)
      expect(graph.getEdgeCount()).toBe(0)
    })

    it('should remove incoming edges when node is removed', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'a')
      graph.removeNode('a')
      expect(graph.hasEdge('b', 'a')).toBe(false)
    })

    it('should remove bidirectional edges in undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addEdge('a', 'b')
      g.removeNode('b')
      expect(g.hasEdge('a', 'b')).toBe(false)
      expect(g.getEdgeCount()).toBe(0)
    })

    it('should decrement node count', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.removeNode('a')
      expect(graph.getNodeCount()).toBe(1)
    })
  })

  describe('addEdge', () => {
    beforeEach(() => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
    })

    it('should add an edge and return true', () => {
      expect(graph.addEdge('a', 'b')).toBe(true)
      expect(graph.hasEdge('a', 'b')).toBe(true)
    })

    it('should return false if from node does not exist', () => {
      expect(graph.addEdge('x', 'b')).toBe(false)
    })

    it('should return false if to node does not exist', () => {
      expect(graph.addEdge('a', 'x')).toBe(false)
    })

    it('should return false for self-loop when not allowed', () => {
      expect(graph.addEdge('a', 'a')).toBe(false)
    })

    it('should allow self-loop when allowSelfLoops is true', () => {
      const g = new GraphBuilder({ allowSelfLoops: true })
      g.addNode('a')
      expect(g.addEdge('a', 'a')).toBe(true)
    })

    it('should update existing edge weight and label', () => {
      graph.addEdge('a', 'b', 1, 'old')
      graph.addEdge('a', 'b', 5, 'new')
      const node = graph.getNode('a')
      const edge = node?.edges[0]
      expect(edge?.weight).toBe(5)
      expect(edge?.label).toBe('new')
    })

    it('should not duplicate edge count on update', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'b', 10)
      expect(graph.getEdgeCount()).toBe(1)
    })

    it('should store weight on edge', () => {
      graph.addEdge('a', 'b', 3.5)
      const node = graph.getNode('a')
      expect(node?.edges[0]?.weight).toBe(3.5)
    })

    it('should store label on edge', () => {
      graph.addEdge('a', 'b', undefined, 'connection')
      const node = graph.getNode('a')
      expect(node?.edges[0]?.label).toBe('connection')
    })

    it('should add reverse edge in undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(true)
      expect(g.hasEdge('b', 'a')).toBe(true)
    })

    it('should count both directions in edge count for undirected', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addEdge('a', 'b')
      expect(g.getEdgeCount()).toBe(2)
    })

    it('should increment edge count', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      expect(graph.getEdgeCount()).toBe(2)
    })
  })

  describe('removeEdge', () => {
    beforeEach(() => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
    })

    it('should remove an edge and return true', () => {
      graph.addEdge('a', 'b')
      expect(graph.removeEdge('a', 'b')).toBe(true)
      expect(graph.hasEdge('a', 'b')).toBe(false)
    })

    it('should return false if edge does not exist', () => {
      expect(graph.removeEdge('a', 'b')).toBe(false)
    })

    it('should return false if from node does not exist', () => {
      expect(graph.removeEdge('x', 'b')).toBe(false)
    })

    it('should decrement edge count', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.removeEdge('a', 'b')
      expect(graph.getEdgeCount()).toBe(1)
    })

    it('should remove both directions in undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addEdge('a', 'b')
      g.removeEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(false)
      expect(g.hasEdge('b', 'a')).toBe(false)
    })
  })

  describe('hasNode', () => {
    it('should return true for existing node', () => {
      graph.addNode('a')
      expect(graph.hasNode('a')).toBe(true)
    })

    it('should return false for non-existent node', () => {
      expect(graph.hasNode('x')).toBe(false)
    })
  })

  describe('hasEdge', () => {
    it('should return true for existing edge', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      expect(graph.hasEdge('a', 'b')).toBe(true)
    })

    it('should return false for non-existent edge', () => {
      graph.addNode('a')
      graph.addNode('b')
      expect(graph.hasEdge('a', 'b')).toBe(false)
    })

    it('should return false if from node does not exist', () => {
      graph.addNode('a')
      expect(graph.hasEdge('x', 'a')).toBe(false)
    })
  })

  describe('getNode', () => {
    it('should return node for existing id', () => {
      graph.addNode('a', { val: 42 })
      const node = graph.getNode('a')
      expect(node?.id).toBe('a')
      expect(node?.metadata).toEqual({ val: 42 })
    })

    it('should return undefined for non-existent id', () => {
      expect(graph.getNode('x')).toBeUndefined()
    })
  })

  describe('getNeighbors', () => {
    it('should return neighbors in directed graph', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      const neighbors = graph.getNeighbors('a')
      expect(neighbors).toContain('b')
      expect(neighbors).toContain('c')
    })

    it('should include incoming neighbors for directed graph', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('b', 'a')
      const neighbors = graph.getNeighbors('a')
      expect(neighbors).toContain('b')
    })

    it('should return empty array for non-existent node', () => {
      expect(graph.getNeighbors('x')).toEqual([])
    })

    it('should return adjacent nodes for undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addEdge('a', 'b')
      const neighbors = g.getNeighbors('a')
      expect(neighbors).toContain('b')
    })
  })

  describe('getInDegree', () => {
    it('should return correct in-degree', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('b', 'a')
      graph.addEdge('c', 'a')
      expect(graph.getInDegree('a')).toBe(2)
    })

    it('should return 0 for node with no incoming edges', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      expect(graph.getInDegree('a')).toBe(0)
    })

    it('should return 0 for non-existent node', () => {
      expect(graph.getInDegree('x')).toBe(0)
    })
  })

  describe('getOutDegree', () => {
    it('should return correct out-degree', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      expect(graph.getOutDegree('a')).toBe(2)
    })

    it('should return 0 for node with no outgoing edges', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('b', 'a')
      expect(graph.getOutDegree('a')).toBe(0)
    })

    it('should return 0 for non-existent node', () => {
      expect(graph.getOutDegree('x')).toBe(0)
    })
  })

  describe('bfs', () => {
    beforeEach(() => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addNode('d')
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      graph.addEdge('b', 'd')
    })

    it('should traverse graph in BFS order', () => {
      const result = graph.bfs('a')
      const ids = result.map(r => r.nodeId)
      expect(ids[0]).toBe('a')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
      expect(ids).toContain('d')
    })

    it('should record correct depths', () => {
      const result = graph.bfs('a')
      const depthMap = new Map(result.map(r => [r.nodeId, r.depth]))
      expect(depthMap.get('a')).toBe(0)
      expect(depthMap.get('b')).toBe(1)
      expect(depthMap.get('c')).toBe(1)
      expect(depthMap.get('d')).toBe(2)
    })

    it('should record correct parents', () => {
      const result = graph.bfs('a')
      const parentMap = new Map(result.map(r => [r.nodeId, r.parent]))
      expect(parentMap.get('a')).toBeNull()
      expect(parentMap.get('b')).toBe('a')
      expect(parentMap.get('c')).toBe('a')
      expect(parentMap.get('d')).toBe('b')
    })

    it('should return empty for non-existent start node', () => {
      expect(graph.bfs('x')).toEqual([])
    })

    it('should handle single node', () => {
      const g = new GraphBuilder()
      g.addNode('a')
      const result = g.bfs('a')
      expect(result).toEqual([{ nodeId: 'a', depth: 0, parent: null }])
    })

    it('should not visit nodes in disconnected component', () => {
      graph.addNode('e')
      const result = graph.bfs('a')
      const ids = result.map(r => r.nodeId)
      expect(ids).not.toContain('e')
    })
  })

  describe('dfs', () => {
    beforeEach(() => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addNode('d')
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      graph.addEdge('b', 'd')
    })

    it('should traverse all reachable nodes', () => {
      const result = graph.dfs('a')
      const ids = result.map(r => r.nodeId)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
      expect(ids).toContain('d')
    })

    it('should start with the start node at depth 0', () => {
      const result = graph.dfs('a')
      expect(result[0]?.nodeId).toBe('a')
      expect(result[0]?.depth).toBe(0)
      expect(result[0]?.parent).toBeNull()
    })

    it('should record correct parent relationships', () => {
      const result = graph.dfs('a')
      const parentMap = new Map(result.map(r => [r.nodeId, r.parent]))
      expect(parentMap.get('a')).toBeNull()
      expect(parentMap.get('d')).toBe('b')
    })

    it('should return empty for non-existent start node', () => {
      expect(graph.dfs('x')).toEqual([])
    })

    it('should visit exactly reachable nodes', () => {
      graph.addNode('e')
      const result = graph.dfs('a')
      expect(result.length).toBe(4)
    })
  })

  describe('detectCycles', () => {
    it('should detect cycle in directed graph', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.addEdge('c', 'a')
      const result = graph.detectCycles()
      expect(result.hasCycle).toBe(true)
      expect(result.cycle.length).toBeGreaterThan(0)
    })

    it('should not detect cycle in DAG', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      const result = graph.detectCycles()
      expect(result.hasCycle).toBe(false)
      expect(result.cycle).toEqual([])
    })

    it('should detect self-loop as cycle', () => {
      const g = new GraphBuilder({ allowSelfLoops: true })
      g.addNode('a')
      g.addEdge('a', 'a')
      const result = g.detectCycles()
      expect(result.hasCycle).toBe(true)
    })

    it('should return no cycle for empty graph', () => {
      const result = graph.detectCycles()
      expect(result.hasCycle).toBe(false)
    })

    it('should return no cycle for single node with no edges', () => {
      graph.addNode('a')
      const result = graph.detectCycles()
      expect(result.hasCycle).toBe(false)
    })

    it('should detect cycle in undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addNode('c')
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      const result = g.detectCycles()
      expect(result.hasCycle).toBe(true)
    })

    it('should not detect cycle in tree-shaped undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addNode('c')
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      const result = g.detectCycles()
      expect(result.hasCycle).toBe(false)
    })

    it('should detect two-node cycle', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'a')
      const result = graph.detectCycles()
      expect(result.hasCycle).toBe(true)
    })
  })

  describe('topologicalSort', () => {
    it('should return valid topological order for DAG', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      const result = graph.topologicalSort()
      expect(result).not.toBeNull()
      const aIdx = result!.indexOf('a')
      const bIdx = result!.indexOf('b')
      const cIdx = result!.indexOf('c')
      expect(aIdx).toBeLessThan(bIdx)
      expect(bIdx).toBeLessThan(cIdx)
    })

    it('should return null for graph with cycle', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'a')
      expect(graph.topologicalSort()).toBeNull()
    })

    it('should return null for undirected graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addEdge('a', 'b')
      expect(g.topologicalSort()).toBeNull()
    })

    it('should handle disconnected DAG', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      const result = graph.topologicalSort()
      expect(result).not.toBeNull()
      expect(result!.length).toBe(3)
      expect(result).toContain('a')
      expect(result).toContain('b')
      expect(result).toContain('c')
    })

    it('should handle single node', () => {
      graph.addNode('a')
      const result = graph.topologicalSort()
      expect(result).toEqual(['a'])
    })

    it('should handle empty graph', () => {
      const result = graph.topologicalSort()
      expect(result).toEqual([])
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty graph', () => {
      const stats = graph.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.edgeCount).toBe(0)
      expect(stats.isDirected).toBe(true)
      expect(stats.averageDegree).toBe(0)
      expect(stats.isConnected).toBe(true)
    })

    it('should return correct node count', () => {
      graph.addNode('a')
      graph.addNode('b')
      const stats = graph.getStats()
      expect(stats.nodeCount).toBe(2)
    })

    it('should return correct edge count', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      const stats = graph.getStats()
      expect(stats.edgeCount).toBe(1)
    })

    it('should compute average degree', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      const stats = graph.getStats()
      expect(stats.averageDegree).toBe(0.5)
    })

    it('should report isDirected correctly', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      const stats = g.getStats()
      expect(stats.isDirected).toBe(false)
    })

    it('should detect connected graph', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      const stats = graph.getStats()
      expect(stats.isConnected).toBe(true)
    })

    it('should detect disconnected graph', () => {
      graph.addNode('a')
      graph.addNode('b')
      const stats = graph.getStats()
      expect(stats.isConnected).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all nodes and edges', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      graph.clear()
      expect(graph.getNodeCount()).toBe(0)
      expect(graph.getEdgeCount()).toBe(0)
    })

    it('should allow adding nodes after clear', () => {
      graph.addNode('a')
      graph.clear()
      expect(graph.addNode('b')).toBe(true)
      expect(graph.getNodeCount()).toBe(1)
    })
  })

  describe('getNodeCount', () => {
    it('should return 0 for empty graph', () => {
      expect(graph.getNodeCount()).toBe(0)
    })

    it('should return correct count', () => {
      graph.addNode('a')
      graph.addNode('b')
      expect(graph.getNodeCount()).toBe(2)
    })
  })

  describe('getEdgeCount', () => {
    it('should return 0 for empty graph', () => {
      expect(graph.getEdgeCount()).toBe(0)
    })

    it('should return correct count', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addEdge('a', 'b')
      expect(graph.getEdgeCount()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty graph operations', () => {
      expect(graph.bfs('x')).toEqual([])
      expect(graph.dfs('x')).toEqual([])
      expect(graph.getNeighbors('x')).toEqual([])
      expect(graph.topologicalSort()).toEqual([])
    })

    it('should handle single node graph', () => {
      graph.addNode('a')
      expect(graph.getInDegree('a')).toBe(0)
      expect(graph.getOutDegree('a')).toBe(0)
      expect(graph.getNeighbors('a')).toEqual([])
      const stats = graph.getStats()
      expect(stats.isConnected).toBe(true)
    })

    it('should handle complete graph', () => {
      const g = new GraphBuilder({ type: 'undirected' })
      g.addNode('a')
      g.addNode('b')
      g.addNode('c')
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('a', 'c')
      expect(g.getNodeCount()).toBe(3)
      expect(g.getStats().isConnected).toBe(true)
    })

    it('should handle DAG with multiple sources', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'c')
      graph.addEdge('b', 'c')
      const topo = graph.topologicalSort()
      expect(topo).not.toBeNull()
      const cIdx = topo!.indexOf('c')
      expect(cIdx).toBeGreaterThan(topo!.indexOf('a'))
      expect(cIdx).toBeGreaterThan(topo!.indexOf('b'))
    })

    it('should handle disconnected graph traversal', () => {
      graph.addNode('a')
      graph.addNode('b')
      graph.addNode('c')
      graph.addEdge('a', 'b')
      const result = graph.dfs('a')
      const ids = result.map(r => r.nodeId)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).not.toContain('c')
    })

    it('should handle removing node with many edges', () => {
      graph.addNode('hub')
      for (let i = 0; i < 5; i++) {
        graph.addNode(`n${i}`)
        graph.addEdge('hub', `n${i}`)
      }
      graph.removeNode('hub')
      expect(graph.getNodeCount()).toBe(5)
      expect(graph.getEdgeCount()).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_GRAPH_OPTIONS', () => {
      expect(DEFAULT_GRAPH_OPTIONS.type).toBe('directed')
      expect(DEFAULT_GRAPH_OPTIONS.allowSelfLoops).toBe(false)
      expect(DEFAULT_GRAPH_OPTIONS.maxNodes).toBe(10000)
    })

    it('should support GraphEdge type', () => {
      const edge: GraphEdge = { from: 'a', to: 'b' }
      expect(edge.from).toBe('a')
      expect(edge.to).toBe('b')
    })

    it('should support GraphEdge with optional fields', () => {
      const edge: GraphEdge = { from: 'a', to: 'b', weight: 2.5, label: 'test' }
      expect(edge.weight).toBe(2.5)
      expect(edge.label).toBe('test')
    })

    it('should support GraphNode type', () => {
      const node: GraphNode = { id: 'a', edges: [] }
      expect(node.id).toBe('a')
      expect(node.edges).toEqual([])
    })

    it('should support GraphType type', () => {
      const directed: GraphType = 'directed'
      const undirected: GraphType = 'undirected'
      expect(directed).toBe('directed')
      expect(undirected).toBe('undirected')
    })

    it('should support GraphOptions type', () => {
      const opts: GraphOptions = { type: 'directed', allowSelfLoops: false, maxNodes: 100 }
      expect(opts.maxNodes).toBe(100)
    })

    it('should support TraversalResult type', () => {
      const result: TraversalResult = { nodeId: 'a', depth: 0, parent: null }
      expect(result.nodeId).toBe('a')
      expect(result.depth).toBe(0)
      expect(result.parent).toBeNull()
    })

    it('should support CycleResult type', () => {
      const result: CycleResult = { hasCycle: false, cycle: [] }
      expect(result.hasCycle).toBe(false)
    })

    it('should support GraphStats type', () => {
      const stats: GraphStats = {
        nodeCount: 0,
        edgeCount: 0,
        isDirected: true,
        averageDegree: 0,
        isConnected: true,
      }
      expect(stats.nodeCount).toBe(0)
    })
  })
})
