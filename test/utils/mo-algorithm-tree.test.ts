import { describe, expect, it } from 'vitest'
import { MoAlgorithmTree } from '../../src/utils/mo-algorithm-tree.js'

describe('MoAlgorithmTree', () => {
  it('processes single query on path', () => {
    const mo = new MoAlgorithmTree(3)
    mo.addEdge(0, 1)
    mo.addEdge(1, 2)
    const count = new Map<number, number>()
    mo.processQueries(
      [[0, 2]],
      (n) => { count.set(n, (count.get(n) ?? 0) + 1) },
      (n) => { count.set(n, (count.get(n) ?? 0) - 1) }
    )
    expect(count.size).toBeGreaterThan(0)
  })

  it('processes multiple queries', () => {
    const mo = new MoAlgorithmTree(5)
    mo.addEdge(0, 1)
    mo.addEdge(1, 2)
    mo.addEdge(2, 3)
    mo.addEdge(3, 4)
    let addCalls = 0
    mo.processQueries(
      [[0, 2], [1, 4], [0, 4]],
      () => { addCalls++ },
      () => {}
    )
    expect(addCalls).toBeGreaterThan(0)
  })

  it('handles star graph', () => {
    const mo = new MoAlgorithmTree(5)
    mo.addEdge(0, 1)
    mo.addEdge(0, 2)
    mo.addEdge(0, 3)
    mo.addEdge(0, 4)
    const visited = new Set<number>()
    mo.processQueries(
      [[1, 3]],
      (n) => { visited.add(n) },
      () => {}
    )
    expect(visited.size).toBeGreaterThan(0)
  })

  it('handles same node query', () => {
    const mo = new MoAlgorithmTree(3)
    mo.addEdge(0, 1)
    mo.addEdge(1, 2)
    let added = 0
    mo.processQueries(
      [[1, 1]],
      () => { added++ },
      () => {}
    )
    expect(added).toBeGreaterThan(0)
  })

  it('handles disconnected graph', () => {
    const mo = new MoAlgorithmTree(4)
    mo.addEdge(0, 1)
    mo.addEdge(2, 3)
    let calls = 0
    mo.processQueries(
      [[0, 1]],
      () => { calls++ },
      () => {}
    )
    expect(calls).toBeGreaterThan(0)
  })

  it('handles empty queries', () => {
    const mo = new MoAlgorithmTree(3)
    mo.addEdge(0, 1)
    mo.addEdge(1, 2)
    mo.processQueries([], () => {}, () => {})
  })

  it('handles chain of 10 nodes', () => {
    const mo = new MoAlgorithmTree(10)
    for (let i = 0; i < 9; i++) mo.addEdge(i, i + 1)
    let total = 0
    mo.processQueries(
      [[0, 9], [3, 7], [1, 5]],
      () => { total++ },
      () => { total-- }
    )
    expect(total).toBeGreaterThanOrEqual(0)
  })

  it('handles binary tree', () => {
    const mo = new MoAlgorithmTree(7)
    mo.addEdge(0, 1)
    mo.addEdge(0, 2)
    mo.addEdge(1, 3)
    mo.addEdge(1, 4)
    mo.addEdge(2, 5)
    mo.addEdge(2, 6)
    const nodes = new Set<number>()
    mo.processQueries(
      [[3, 6]],
      (n) => { nodes.add(n) },
      () => {}
    )
    expect(nodes.size).toBeGreaterThan(0)
  })

  it('handles single node', () => {
    const mo = new MoAlgorithmTree(1)
    let calls = 0
    mo.processQueries(
      [[0, 0]],
      () => { calls++ },
      () => {}
    )
    expect(calls).toBeGreaterThan(0)
  })

  it('handles many queries', () => {
    const mo = new MoAlgorithmTree(5)
    mo.addEdge(0, 1)
    mo.addEdge(1, 2)
    mo.addEdge(2, 3)
    mo.addEdge(3, 4)
    let calls = 0
    const queries: [number, number][] = []
    for (let i = 0; i < 5; i++)
      for (let j = i; j < 5; j++) queries.push([i, j])
    mo.processQueries(
      queries,
      () => { calls++ },
      () => { calls-- }
    )
    expect(calls).toBeGreaterThanOrEqual(0)
  })
})
