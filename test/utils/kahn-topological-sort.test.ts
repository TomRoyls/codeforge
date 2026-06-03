import { describe, it, expect } from 'vitest'
import { KahnTopologicalSort } from '../../src/utils/kahn-topological-sort.js'

describe('KahnTopologicalSort', () => {
  it('sorts simple DAG', () => {
    const adj = [[1, 2], [3], [3], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order.length).toBe(4)
    expect(sort.order.indexOf(0)).toBeLessThan(sort.order.indexOf(1))
    expect(sort.order.indexOf(0)).toBeLessThan(sort.order.indexOf(2))
    expect(sort.order.indexOf(1)).toBeLessThan(sort.order.indexOf(3))
    expect(sort.order.indexOf(2)).toBeLessThan(sort.order.indexOf(3))
  })

  it('detects cycle', () => {
    const adj = [[1], [2], [0]]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(true)
    expect(sort.order.length).toBe(0)
    expect(sort.cycleNodes.length).toBe(3)
  })

  it('handles empty graph', () => {
    const adj: number[][] = []
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order).toEqual([])
  })

  it('handles single node', () => {
    const adj = [[]]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order).toEqual([0])
  })

  it('handles linear chain', () => {
    const adj = [[1], [2], [3], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order).toEqual([0, 1, 2, 3])
  })

  it('handles disconnected graph', () => {
    const adj = [[1], [], [3], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order.length).toBe(4)
    expect(sort.order.indexOf(0)).toBeLessThan(sort.order.indexOf(1))
    expect(sort.order.indexOf(2)).toBeLessThan(sort.order.indexOf(3))
  })

  it('handles self-loop', () => {
    const adj = [[0]]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(true)
  })

  it('handles partial cycle', () => {
    const adj = [[1], [2], [1, 3], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(true)
    expect(sort.cycleNodes).toContain(1)
    expect(sort.cycleNodes).toContain(2)
  })

  it('isDAG static method', () => {
    expect(KahnTopologicalSort.isDAG([[1], []])).toBe(true)
    expect(KahnTopologicalSort.isDAG([[1], [0]])).toBe(false)
  })

  it('longestPath static method', () => {
    const adj = [[1, 2], [3], [3], []]
    const weights = [1, 2, 3, 4]
    const result = KahnTopologicalSort.longestPath(adj, weights)
    expect(result).toBeGreaterThan(0)
  })

  it('longestPath returns -1 for cyclic graph', () => {
    const adj = [[1], [0]]
    expect(KahnTopologicalSort.longestPath(adj, [1, 1])).toBe(-1)
  })

  it('handles diamond DAG', () => {
    const adj = [[1, 2], [3], [3], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order[0]).toBe(0)
    expect(sort.order[3]).toBe(3)
  })

  it('handles star DAG', () => {
    const adj = [[1, 2, 3, 4], [], [], [], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order[0]).toBe(0)
  })

  it('handles complex DAG', () => {
    const adj = [[1, 2], [3], [3, 4], [5], [5], []]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order.length).toBe(6)
  })

  it('handles two-node cycle', () => {
    const adj = [[1], [0]]
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(true)
    expect(sort.cycleNodes.sort()).toEqual([0, 1])
  })

  it('handles large DAG', () => {
    const n = 100
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (let i = 0; i < n - 1; i++) adj[i]!.push(i + 1)
    const sort = new KahnTopologicalSort(adj)
    expect(sort.hasCycle).toBe(false)
    expect(sort.order).toEqual(Array.from({ length: n }, (_, i) => i))
  })

  it('longestPath on linear chain', () => {
    const adj = [[1], [2], [3], []]
    const weights = [1, 2, 3, 4]
    expect(KahnTopologicalSort.longestPath(adj, weights)).toBe(10)
  })

  it('isDAG for empty graph', () => {
    expect(KahnTopologicalSort.isDAG([[]])).toBe(true)
  })

  it('isDAG for simple chain', () => {
    expect(KahnTopologicalSort.isDAG([[1], []])).toBe(true)
  })

  it('isDAG false for cycle', () => {
    expect(KahnTopologicalSort.isDAG([[1], [0]])).toBe(false)
  })

  it('isDAG true for empty graph', () => {
    expect(KahnTopologicalSort.isDAG([])).toBe(true)
  })
})
