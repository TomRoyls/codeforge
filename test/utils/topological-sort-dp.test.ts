import { describe, expect, it } from 'vitest'
import { TopologicalSortDP } from '../../src/utils/topological-sort-dp.js'

describe('TopologicalSortDP', () => {
  it('finds longest path in chain', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 3)
    expect(ts.longestPath()).toBe(3)
  })

  it('finds longest path in diamond', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(0, 2)
    ts.addEdge(1, 3)
    ts.addEdge(2, 3)
    expect(ts.longestPath()).toBe(2)
  })

  it('handles single node', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
  })

  it('handles disconnected', () => {
    const ts = new TopologicalSortDP(3)
    expect(ts.longestPath()).toBe(0)
  })

  it('counts paths in chain', () => {
    const ts = new TopologicalSortDP(3)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    expect(ts.countPaths()).toBe(3)
  })

  it('counts paths in diamond', () => {
    const ts = new TopologicalSortDP(3)
    ts.addEdge(0, 1)
    ts.addEdge(0, 2)
    ts.addEdge(1, 2)
    expect(ts.countPaths()).toBe(4)
  })

  it('handles cycle in longest path', () => {
    const ts = new TopologicalSortDP(3)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 0)
    expect(ts.longestPath()).toBe(-1)
  })

  it('finds shortest path', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(0, 2)
    ts.addEdge(1, 3)
    ts.addEdge(2, 3)
    expect(ts.shortestPath(0, 3)).toBe(2)
  })

  it('shortest path same node', () => {
    const ts = new TopologicalSortDP(3)
    expect(ts.shortestPath(1, 1)).toBe(0)
  })

  it('handles complex DAG', () => {
    const ts = new TopologicalSortDP(6)
    ts.addEdge(0, 1)
    ts.addEdge(0, 2)
    ts.addEdge(1, 3)
    ts.addEdge(2, 3)
    ts.addEdge(3, 4)
    ts.addEdge(3, 5)
    expect(ts.longestPath()).toBe(3)
  })

  it('diamond DAG path count', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(0, 2)
    ts.addEdge(1, 3)
    ts.addEdge(2, 3)
    expect(ts.longestPath()).toBe(2)
    expect(ts.countPaths()).toBe(5)
  })

  it('handles linear chain', () => {
    const ts = new TopologicalSortDP(5)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 3)
    ts.addEdge(3, 4)
    expect(ts.longestPath()).toBe(4)
    expect(ts.countPaths()).toBe(5)
  })

  it('handles single node', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
    expect(ts.countPaths()).toBe(1)
  })

  it('handles two node DAG', () => {
    const ts = new TopologicalSortDP(2)
    ts.addEdge(0, 1)
    expect(ts.longestPath()).toBe(1)
    expect(ts.countPaths()).toBe(2)
  })

  it('handles empty graph', () => {
    const ts = new TopologicalSortDP(3)
    expect(ts.longestPath()).toBe(0)
    expect(ts.countPaths()).toBe(3)
  })

  it('handles V shaped DAG', () => {
    const ts = new TopologicalSortDP(5)
    ts.addEdge(0, 2)
    ts.addEdge(1, 2)
    ts.addEdge(2, 3)
    ts.addEdge(2, 4)
    expect(ts.longestPath()).toBe(2)
  })

  it('single node has zero longest path', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
  })

  it('linear chain has correct longest path', () => {
    const ts = new TopologicalSortDP(3)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    expect(ts.longestPath()).toBe(2)
  })

  it('single node has longest path 0', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
  })

  it('chain of 3 has longest path 2', () => {
    const ts = new TopologicalSortDP(3)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    expect(ts.longestPath()).toBe(2)
  })

  it('single node has longest path 0', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
  })
})
