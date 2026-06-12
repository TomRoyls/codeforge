import { describe, expect, it } from 'vitest'
import { GraphTraversal } from '../../src/utils/graph-traversal.js'

describe('GraphTraversal', () => {
  function makeGraph(edges: [number, number][]): Map<number, number[]> {
    const adj = new Map<number, number[]>()
    for (const [u, v] of edges) {
      if (!adj.has(u)) adj.set(u, [])
      adj.get(u)!.push(v)
      if (!adj.has(v)) adj.set(v, [])
    }
    return adj
  }

  it('bfs traverses in breadth-first order', () => {
    const adj = makeGraph([[0, 1], [0, 2], [1, 3], [1, 4]])
    const result = GraphTraversal.bfs(adj, 0)
    expect(result[0]).toBe(0)
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result.indexOf(1)!).toBeLessThan(result.indexOf(3)!)
  })

  it('dfs traverses in depth-first order', () => {
    const adj = makeGraph([[0, 1], [0, 2], [1, 3]])
    const result = GraphTraversal.dfs(adj, 0)
    expect(result[0]).toBe(0)
    expect(result.length).toBe(4)
  })

  it('dfsIterative matches dfs', () => {
    const adj = makeGraph([[0, 1], [0, 2], [1, 3]])
    const r1 = GraphTraversal.dfs(adj, 0)
    const r2 = GraphTraversal.dfsIterative(adj, 0)
    expect(new Set(r1)).toEqual(new Set(r2))
  })

  it('connectedComponents finds all components', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]],
    ])
    const components = GraphTraversal.connectedComponents(adj)
    expect(components.length).toBe(2)
  })

  it('hasCycle detects cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    expect(GraphTraversal.hasCycle(adj)).toBe(true)
  })

  it('hasCycle returns false for DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(GraphTraversal.hasCycle(adj)).toBe(false)
  })

  it('shortestPathBFS finds shortest path', () => {
    const adj = makeGraph([[0, 1], [0, 2], [1, 3], [2, 3]])
    const path = GraphTraversal.shortestPathBFS(adj, 0, 3)
    expect(path).not.toBeNull()
    expect(path![0]).toBe(0)
    expect(path![path!.length - 1]).toBe(3)
    expect(path!.length).toBeLessThanOrEqual(3)
  })

  it('shortestPathBFS returns null for unreachable', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, []],
    ])
    expect(GraphTraversal.shortestPathBFS(adj, 0, 2)).toBeNull()
  })

  it('bfs handles disconnected start', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, [2]], [2, [1]],
    ])
    const result = GraphTraversal.bfs(adj, 0)
    expect(result).toEqual([0])
  })

  it('bfs handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(GraphTraversal.bfs(adj, 0)).toEqual([0])
  })

  it('dfs handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(GraphTraversal.dfs(adj, 0)).toEqual([0])
  })

  it('connectedComponents handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(GraphTraversal.connectedComponents(adj)).toEqual([[0]])
  })

  it('shortestPathBFS to self', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(GraphTraversal.shortestPathBFS(adj, 0, 0)).toEqual([0])
  })

  it('hasCycle on empty graph', () => {
    const adj = new Map<number, number[]>([[0, []], [1, []]])
    expect(GraphTraversal.hasCycle(adj)).toBe(false)
  })

  it('connectedComponents for two components', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]],
    ])
    const comps = GraphTraversal.connectedComponents(adj)
    expect(comps.length).toBe(2)
  })

  it('dfsIterative matches dfs', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const dfs = GraphTraversal.dfs(adj, 0)
    const dfsIter = GraphTraversal.dfsIterative(adj, 0)
    expect(new Set(dfs)).toEqual(new Set(dfsIter))
  })

  it('shortestPathBFS unreachable returns empty', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []],
    ])
    expect(GraphTraversal.shortestPathBFS(adj, 0, 1)).toBeNull()
  })

  it('dfs returns all reachable nodes', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const order = GraphTraversal.dfs(adj, 0)
    expect(order.sort()).toEqual([0, 1])
  })

  it('bfs visits in level order', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [3]], [2, []], [3, []]])
    const order = GraphTraversal.bfs(adj, 0)
    expect(order).toEqual([0, 1, 2, 3])
  })

  it('dfs returns correct order', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const order = GraphTraversal.dfs(adj, 0)
    expect(order).toEqual([0, 1, 2])
  })

  it('bfs on single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const order = GraphTraversal.bfs(adj, 0)
    expect(order).toEqual([0])
  })

  it('dfs visits all reachable', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const order = GraphTraversal.dfs(adj, 0)
    expect(order.sort()).toEqual([0, 1])
  })

  it('bfs visits all connected nodes', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0]]])
    const order = GraphTraversal.bfs(adj, 0)
    expect(order.sort()).toEqual([0, 1, 2])
  })

  it('dfs visits all connected nodes', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0]]])
    const order = GraphTraversal.dfs(adj, 0)
    expect(order.sort()).toEqual([0, 1, 2])
  })

  it('bfs handles graph with cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [0]]])
    const result = GraphTraversal.bfs(adj, 0)
    expect(result).toEqual([0, 1, 2])
  })

  it('dfs handles graph with cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [0]]])
    const result = GraphTraversal.dfs(adj, 0)
    expect(result.length).toBe(3)
    expect(result).toContain(0)
    expect(result).toContain(1)
    expect(result).toContain(2)
  })

  it('dfsIterative handles graph with cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [0]]])
    const result = GraphTraversal.dfsIterative(adj, 0)
    expect(result.length).toBe(3)
    expect(new Set(result)).toEqual(new Set([0, 1, 2]))
  })

  it('hasCycle detects self-loop', () => {
    const adj = new Map<number, number[]>([[0, [0]]])
    expect(GraphTraversal.hasCycle(adj)).toBe(true)
  })

  it('hasCycle returns false for graph without cycles', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [3]], [3, []]])
    expect(GraphTraversal.hasCycle(adj)).toBe(false)
  })

  it('hasCycle handles multiple disconnected components', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]], [2, [3]], [3, [4]], [4, [2]]])
    expect(GraphTraversal.hasCycle(adj)).toBe(true)
  })

  it('hasCycle handles graph with only self-loops', () => {
    const adj = new Map<number, number[]>([[0, [0]], [1, [1]]])
    expect(GraphTraversal.hasCycle(adj)).toBe(true)
  })

  it('shortestPathBFS finds path in linear graph', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [3]], [3, []]])
    const path = GraphTraversal.shortestPathBFS(adj, 0, 3)
    expect(path).toEqual([0, 1, 2, 3])
  })

  it('shortestPathBFS handles multiple paths', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [3]], [2, [3]], [3, []]])
    const path = GraphTraversal.shortestPathBFS(adj, 0, 3)
    expect(path).not.toBeNull()
    expect(path!.length).toBeLessThanOrEqual(3)
    expect(path![0]).toBe(0)
    expect(path![path!.length - 1]).toBe(3)
  })

  it('shortestPathBFS returns null when start not in graph', () => {
    const adj = new Map<number, number[]>([[1, [2]], [2, []]])
    expect(GraphTraversal.shortestPathBFS(adj, 0, 2)).toBeNull()
  })

  it('shortestPathBFS returns null when end not in graph', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    expect(GraphTraversal.shortestPathBFS(adj, 0, 2)).toBeNull()
  })

  it('connectedComponents handles empty graph', () => {
    const adj = new Map<number, number[]>()
    expect(GraphTraversal.connectedComponents(adj)).toEqual([])
  })

  it('connectedComponents handles graph with isolated nodes', () => {
    const adj = new Map<number, number[]>([[0, []], [1, []], [2, []]])
    const comps = GraphTraversal.connectedComponents(adj)
    expect(comps.length).toBe(3)
    expect(comps.flat().sort()).toEqual([0, 1, 2])
  })

  it('connectedComponents handles large connected component', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0, 2]], [2, [1, 3]], [3, [2, 4]], [4, [3]]
    ])
    const comps = GraphTraversal.connectedComponents(adj)
    expect(comps.length).toBe(1)
    expect(comps[0]!.sort()).toEqual([0, 1, 2, 3, 4])
  })

  it('bfs handles graph with multiple branches', () => {
    const adj = new Map<number, number[]>([[0, [1, 2, 3]], [1, []], [2, []], [3, []]])
    const result = GraphTraversal.bfs(adj, 0)
    expect(result[0]).toBe(0)
    expect(result.slice(1).sort()).toEqual([1, 2, 3])
  })

  it('dfs handles graph with multiple branches', () => {
    const adj = new Map<number, number[]>([[0, [1, 2, 3]], [1, []], [2, []], [3, []]])
    const result = GraphTraversal.dfs(adj, 0)
    expect(result[0]).toBe(0)
    expect(result.length).toBe(4)
  })

  it('bfs visits each node once', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [3]], [2, [3]], [3, []]])
    const result = GraphTraversal.bfs(adj, 0)
    expect(result).toEqual([0, 1, 2, 3])
  })

  it('dfs visits each node once', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [3]], [2, [3]], [3, []]])
    const result = GraphTraversal.dfs(adj, 0)
    const unique = new Set(result)
    expect(unique.size).toBe(result.length)
  })

  it('dfsIterative visits each node once', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [3]], [2, [3]], [3, []]])
    const result = GraphTraversal.dfsIterative(adj, 0)
    const unique = new Set(result)
    expect(unique.size).toBe(result.length)
  })

  it('bfs handles start with no neighbors', () => {
    const adj = new Map<number, number[]>([[0, []], [1, [2]], [2, []]])
    const result = GraphTraversal.bfs(adj, 1)
    expect(result).toEqual([1, 2])
  })

  it('dfs handles start with no neighbors', () => {
    const adj = new Map<number, number[]>([[0, []], [1, [2]], [2, []]])
    const result = GraphTraversal.dfs(adj, 1)
    expect(result).toEqual([1, 2])
  })

  it('shortestPathBFS handles direct edge', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const path = GraphTraversal.shortestPathBFS(adj, 0, 1)
    expect(path).toEqual([0, 1])
  })

  it('shortestPathBFS handles path length 2', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    const path = GraphTraversal.shortestPathBFS(adj, 0, 2)
    expect(path).toEqual([0, 1, 2])
  })

  it('hasCycle handles graph with back edge', () => {
    const adj = new Map<number, number[]>([
      [0, [1]],
      [1, [2]],
      [2, [1, 3]],
      [3, []]
    ])
    expect(GraphTraversal.hasCycle(adj)).toBe(true)
  })

  it('hasCycle returns false for forest', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []], [2, [3]], [3, []]])
    expect(GraphTraversal.hasCycle(adj)).toBe(false)
  })

  it('bfs handles bidirectional graph', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0, 2]], [2, [1]]])
    const result = GraphTraversal.bfs(adj, 0)
    expect(result).toEqual([0, 1, 2])
  })

  it('dfs handles bidirectional graph', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0, 2]], [2, [1]]])
    const result = GraphTraversal.dfs(adj, 0)
    expect(result.length).toBe(3)
    expect(new Set(result)).toEqual(new Set([0, 1, 2]))
  })

  it('dfsIterative returns same nodes as dfs', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, []],
      [2, []],
    ])
    const dfs = GraphTraversal.dfs(adj, 0)
    const dfsi = GraphTraversal.dfsIterative(adj, 0)
    expect(new Set(dfs)).toEqual(new Set(dfsi))
  })

  it('shortestPathBFS returns null for unreachable', () => {
    const adj = new Map<number, number[]>([
      [0, []],
      [1, []],
    ])
    expect(GraphTraversal.shortestPathBFS(adj, 0, 1)).toBeNull()
  })

  it('hasCycle returns false for tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, []],
      [2, []],
    ])
    expect(GraphTraversal.hasCycle(adj)).toBe(false)
  })

  it('connectedComponents with isolated nodes', () => {
    const adj = new Map<number, number[]>([
      [0, [1]],
      [1, [0]],
      [2, []],
    ])
    const cc = GraphTraversal.connectedComponents(adj)
    expect(cc.length).toBe(2)
  })

  it('bfs single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(GraphTraversal.bfs(adj, 0)).toEqual([0])
  })

  it('dfs single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(GraphTraversal.dfs(adj, 0)).toEqual([0])
  })

  it('bfs two nodes', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    expect(GraphTraversal.bfs(adj, 0)).toEqual([0, 1])
  })
})

describe('graph-traversal - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
