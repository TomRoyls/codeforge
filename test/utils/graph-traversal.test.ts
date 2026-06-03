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
})
